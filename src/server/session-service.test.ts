import { createHash, randomBytes } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { PrismaClient } from "../../app/generated/prisma/client";
import { sessionExpiryFrom } from "../lib/sessions";
import { createTestDatabase } from "../test/database";
import { resolveSession, signOut } from "./session-service";

let testPrisma: PrismaClient | undefined;
let cleanupTestDatabase: (() => Promise<void>) | undefined;

beforeEach(async () => {
  const testDatabase = await createTestDatabase();
  testPrisma = testDatabase.prisma;
  cleanupTestDatabase = testDatabase.cleanup;
});

afterEach(async () => {
  await cleanupTestDatabase?.();
  testPrisma = undefined;
  cleanupTestDatabase = undefined;
});

function getTestPrisma(): PrismaClient {
  if (!testPrisma) {
    throw new Error("The test database has not been initialized.");
  }

  return testPrisma;
}

async function createSession(createdAt: Date): Promise<string> {
  const database = getTestPrisma();
  const account = await database.account.create({
    data: {
      displayName: "Riley",
      email: "riley@example.com",
      passwordDigest: "not-used-by-session-tests",
    },
    select: { id: true },
  });
  const sessionSecret = randomBytes(32).toString("base64url");
  const secretDigest = createHash("sha256").update(sessionSecret).digest("hex");

  await database.session.create({
    data: {
      accountId: account.id,
      secretDigest,
      expiresAt: sessionExpiryFrom(createdAt),
    },
  });

  return sessionSecret;
}

const signedInAt = new Date("2026-11-06T12:00:00.000Z");

describe("resolveSession", () => {
  it("accepts active sessions and extends expiry to 30 days from activity", async () => {
    const sessionSecret = await createSession(signedInAt);
    const usedAt = new Date("2026-12-05T12:00:00.000Z");

    const result = await resolveSession(sessionSecret, usedAt, getTestPrisma());

    expect(result).toEqual({
      accountId: expect.any(String),
      expiresAt: new Date("2027-01-04T12:00:00.000Z"),
    });
  });

  it("does not shorten an expiry after a later request already extended it", async () => {
    const sessionSecret = await createSession(signedInAt);
    const database = getTestPrisma();
    const laterUse = new Date("2026-11-26T12:00:00.000Z");
    const earlierUse = new Date("2026-11-11T12:00:00.000Z");

    await resolveSession(sessionSecret, laterUse, database);
    const result = await resolveSession(sessionSecret, earlierUse, database);

    expect(result?.expiresAt).toEqual(new Date("2026-12-26T12:00:00.000Z"));
  });

  it.each([
    ["at", 30 * 24 * 60 * 60 * 1000],
    ["after", 30 * 24 * 60 * 60 * 1000 + 1],
  ])("rejects and removes a session used %s the 30-day limit", async (_label, offset) => {
    const sessionSecret = await createSession(signedInAt);
    const usedAt = new Date(signedInAt.getTime() + Number(offset));

    await expect(
      resolveSession(sessionSecret, usedAt, getTestPrisma()),
    ).resolves.toBeNull();
    expect(await getTestPrisma().session.count()).toBe(0);
  });

  it("returns null for an unknown session secret", async () => {
    await expect(
      resolveSession("unknown-session-secret", signedInAt, getTestPrisma()),
    ).resolves.toBeNull();
  });
});

describe("signOut", () => {
  it("revokes the session so it cannot be resolved again", async () => {
    const sessionSecret = await createSession(signedInAt);
    const database = getTestPrisma();

    await signOut(sessionSecret, database);

    await expect(resolveSession(sessionSecret, signedInAt, database)).resolves.toBeNull();
    expect(await database.session.count()).toBe(0);
  });
});
