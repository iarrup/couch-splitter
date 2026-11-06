import { createHash, randomBytes } from "node:crypto";
import { Prisma, type PrismaClient } from "../generated/prisma/client";
import {
  normalizeEmailForUniqueness,
  validatePassword,
} from "../lib/accounts";
import { sessionExpiryFrom } from "../lib/sessions";
import { hashPassword, verifyPassword } from "./password";
import { prisma } from "./prisma";

export type SignInResult =
  | {
      ok: true;
      accountId: string;
      sessionSecret: string;
      expiresAt: Date;
    }
  | { ok: false; message: string };

const invalidSignInMessage = "Email or password is incorrect.";
const duplicateEmailMessage = "That email address is already in use.";
const dummyPasswordDigest =
  "scrypt$16384$8$1$Y291Y2hzcGxpdHRlci1zaWduZWQtb3V0LWR1bW15LXNhbHQ$PgKY2SWsc9w-qPyPuG6fXGqTEBVIXmsnaacW3Gy_bd1jyiNa9UZKIjt3mf33GOxz2U5yb0bJNvB4u6wVAgtELg";

function digestSessionSecret(sessionSecret: string): string {
  return createHash("sha256").update(sessionSecret).digest("hex");
}

function isDuplicateEmailError(error: unknown): boolean {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== "P2002"
  ) {
    return false;
  }

  const target = error.meta?.target;
  if (Array.isArray(target)) {
    return target.includes("email");
  }

  return typeof target === "string" && target.toLowerCase().includes("email");
}

async function createSignInSession(
  database: PrismaClient,
  accountId: string,
  now: Date,
): Promise<{ sessionSecret: string; expiresAt: Date }> {
  const sessionSecret = randomBytes(32).toString("base64url");
  const expiresAt = sessionExpiryFrom(now);

  await database.session.create({
    data: {
      accountId,
      secretDigest: digestSessionSecret(sessionSecret),
      expiresAt,
    },
  });

  return { sessionSecret, expiresAt };
}

export async function registerAccount(
  input: { displayName: string; email: string; password: string },
  now: Date,
  database: PrismaClient = prisma,
): Promise<SignInResult> {
  if (input.displayName.trim().length === 0) {
    return { ok: false, message: "Display name is required." };
  }

  const email = normalizeEmailForUniqueness(input.email);
  if (email.length === 0) {
    return { ok: false, message: "Email address is required." };
  }

  const passwordValidation = validatePassword(input.password);
  if (!passwordValidation.ok) {
    return passwordValidation;
  }

  const existingAccount = await database.account.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existingAccount) {
    return { ok: false, message: duplicateEmailMessage };
  }

  const passwordDigest = await hashPassword(input.password);
  const sessionSecret = randomBytes(32).toString("base64url");
  const expiresAt = sessionExpiryFrom(now);

  try {
    const account = await database.account.create({
      data: {
        displayName: input.displayName,
        email,
        passwordDigest,
        createdAt: now,
        sessions: {
          create: {
            secretDigest: digestSessionSecret(sessionSecret),
            expiresAt,
          },
        },
      },
      select: { id: true },
    });

    return { ok: true, accountId: account.id, sessionSecret, expiresAt };
  } catch (error) {
    if (isDuplicateEmailError(error)) {
      return { ok: false, message: duplicateEmailMessage };
    }

    throw error;
  }
}

export async function signIn(
  input: { email: string; password: string },
  now: Date,
  database: PrismaClient = prisma,
): Promise<SignInResult> {
  const email = normalizeEmailForUniqueness(input.email);
  const account =
    email.length > 0
      ? await database.account.findUnique({ where: { email } })
      : null;

  const passwordMatches = await verifyPassword(
    input.password,
    account?.passwordDigest ?? dummyPasswordDigest,
  );

  if (!account || !passwordMatches) {
    return { ok: false, message: invalidSignInMessage };
  }

  const session = await createSignInSession(database, account.id, now);
  return {
    ok: true,
    accountId: account.id,
    sessionSecret: session.sessionSecret,
    expiresAt: session.expiresAt,
  };
}
