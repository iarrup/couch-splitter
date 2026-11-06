import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const saltLength = 16;
const keyLength = 64;
const cost = 16_384;
const blockSize = 8;
const parallelization = 1;
const maxMemory = 64 * 1024 * 1024;

function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      keyLength,
      { N: cost, r: blockSize, p: parallelization, maxmem: maxMemory },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derivedKey);
      },
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(saltLength);
  const derivedKey = await deriveKey(password, salt);

  return [
    "scrypt",
    cost,
    blockSize,
    parallelization,
    salt.toString("base64url"),
    derivedKey.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(
  password: string,
  passwordDigest: string,
): Promise<boolean> {
  const [algorithm, storedCost, storedBlockSize, storedParallelization, saltText, keyText, ...extra] =
    passwordDigest.split("$");

  if (
    algorithm !== "scrypt" ||
    storedCost !== String(cost) ||
    storedBlockSize !== String(blockSize) ||
    storedParallelization !== String(parallelization) ||
    saltText === undefined ||
    keyText === undefined ||
    extra.length > 0 ||
    !/^[A-Za-z0-9_-]+$/.test(saltText) ||
    !/^[A-Za-z0-9_-]+$/.test(keyText)
  ) {
    return false;
  }

  const salt = Buffer.from(saltText, "base64url");
  const expectedKey = Buffer.from(keyText, "base64url");

  if (salt.length !== saltLength || expectedKey.length !== keyLength) {
    return false;
  }

  const actualKey = await deriveKey(password, salt);
  return timingSafeEqual(actualKey, expectedKey);
}
