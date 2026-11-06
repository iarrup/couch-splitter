import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestDatabase } from "../test/database";
import type { PrismaClient } from "../../app/generated/prisma/client";
import { registerAccount, signIn } from "./account-service";

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

const now = new Date("2026-11-06T12:00:00.000Z");

describe("registerAccount", () => {
  it("creates an account and signs the person in without email confirmation", async () => {
    const result = await registerAccount(
      {
        displayName: "Riley",
        email: "riley@example.com",
        password: "correct horse",
      },
      now,
      getTestPrisma(),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const account = await getTestPrisma().account.findUnique({
      where: { id: result.accountId },
      include: { sessions: true },
    });
    expect(account).toMatchObject({
      displayName: "Riley",
      email: "riley@example.com",
      sessions: [{ expiresAt: new Date("2026-12-06T12:00:00.000Z") }],
    });
    expect(account?.passwordDigest).not.toBe("correct horse");
    expect(result.sessionSecret).not.toBe(account?.sessions[0]?.secretDigest);
  });

  it("allows accounts to share a display name", async () => {
    const first = await registerAccount(
      { displayName: "Riley", email: "first@example.com", password: "password 123" },
      now,
      getTestPrisma(),
    );
    const second = await registerAccount(
      { displayName: "Riley", email: "second@example.com", password: "password 456" },
      now,
      getTestPrisma(),
    );

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    expect(await getTestPrisma().account.count()).toBe(2);
  });

  it("rejects an email duplicate regardless of capitalization", async () => {
    const first = await registerAccount(
      { displayName: "Riley", email: "Riley@Example.com", password: "password 123" },
      now,
      getTestPrisma(),
    );
    const duplicate = await registerAccount(
      { displayName: "Jordan", email: "  riley@example.COM ", password: "password 456" },
      now,
      getTestPrisma(),
    );

    expect(first.ok).toBe(true);
    expect(duplicate).toEqual({
      ok: false,
      message: "That email address is already in use.",
    });
    expect(await getTestPrisma().account.count()).toBe(1);
  });

  it("does not create an account when the password is too short", async () => {
    const result = await registerAccount(
      { displayName: "Riley", email: "riley@example.com", password: "short" },
      now,
      getTestPrisma(),
    );

    expect(result).toEqual({
      ok: false,
      message: "Password must be at least 10 characters.",
    });
    expect(await getTestPrisma().account.count()).toBe(0);
  });
});

describe("signIn", () => {
  it("accepts a correct password and a differently capitalized email", async () => {
    await registerAccount(
      { displayName: "Riley", email: "Riley@Example.com", password: "correct horse" },
      now,
      getTestPrisma(),
    );

    const result = await signIn(
      { email: "  riley@example.COM ", password: "correct horse" },
      now,
      getTestPrisma(),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.expiresAt).toEqual(new Date("2026-12-06T12:00:00.000Z"));
    expect(await getTestPrisma().session.count()).toBe(2);
  });

  it("returns the same failure for an unknown email and a wrong password", async () => {
    await registerAccount(
      { displayName: "Riley", email: "riley@example.com", password: "correct horse" },
      now,
      getTestPrisma(),
    );

    const unknownEmail = await signIn(
      { email: "unknown@example.com", password: "incorrect password" },
      now,
      getTestPrisma(),
    );
    const wrongPassword = await signIn(
      { email: "riley@example.com", password: "incorrect password" },
      now,
      getTestPrisma(),
    );

    expect(unknownEmail).toEqual(wrongPassword);
    expect(unknownEmail).toEqual({
      ok: false,
      message: "Email or password is incorrect.",
    });
    expect(await getTestPrisma().session.count()).toBe(1);
  });
});
