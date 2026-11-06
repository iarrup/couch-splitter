import { createHash } from "node:crypto";
import type { PrismaClient } from "../generated/prisma/client";
import { isSessionExpired, sessionExpiryFrom } from "../lib/sessions";
import { prisma } from "./prisma";

function digestSessionSecret(sessionSecret: string): string {
  return createHash("sha256").update(sessionSecret).digest("hex");
}

export async function resolveSession(
  sessionSecret: string,
  now: Date,
  database: PrismaClient = prisma,
): Promise<{ accountId: string; expiresAt: Date } | null> {
  const secretDigest = digestSessionSecret(sessionSecret);
  const session = await database.session.findUnique({
    where: { secretDigest },
    select: { id: true, accountId: true, expiresAt: true },
  });

  if (!session) {
    return null;
  }

  if (isSessionExpired(session.expiresAt, now)) {
    await database.session.deleteMany({
      where: { id: session.id, expiresAt: { lte: now } },
    });
    return null;
  }

  const requestedExpiry = sessionExpiryFrom(now);
  await database.session.updateMany({
    where: { id: session.id, expiresAt: { lt: requestedExpiry } },
    data: { expiresAt: requestedExpiry },
  });

  const refreshedSession = await database.session.findUnique({
    where: { id: session.id },
    select: { accountId: true, expiresAt: true },
  });

  if (!refreshedSession || isSessionExpired(refreshedSession.expiresAt, now)) {
    return null;
  }

  return refreshedSession;
}

export async function signOut(
  sessionSecret: string,
  database: PrismaClient = prisma,
): Promise<void> {
  await database.session.deleteMany({
    where: { secretDigest: digestSessionSecret(sessionSecret) },
  });
}
