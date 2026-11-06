import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("hashPassword", () => {
  it("creates a salted scrypt digest that verifies the original password", async () => {
    const password = "correct horse battery staple";
    const digest = await hashPassword(password);

    expect(digest).toMatch(/^scrypt\$16384\$8\$1\$/);
    await expect(verifyPassword(password, digest)).resolves.toBe(true);
  });

  it("uses a fresh salt for each password digest", async () => {
    const firstDigest = await hashPassword("same password");
    const secondDigest = await hashPassword("same password");

    expect(firstDigest).not.toBe(secondDigest);
  });
});

describe("verifyPassword", () => {
  it("rejects a password that does not match the digest", async () => {
    const digest = await hashPassword("correct password");

    await expect(verifyPassword("incorrect password", digest)).resolves.toBe(
      false,
    );
  });

  it.each([
    "",
    "sha256$16384$8$1$invalid$invalid",
    "scrypt$16384$8$1$short$short",
    "scrypt$16384$8$1$not*base64$not*base64",
    "scrypt$32768$8$1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  ])("returns false for a malformed or unsupported digest: %j", async (digest) => {
    await expect(verifyPassword("any password", digest)).resolves.toBe(false);
  });
});
