import { describe, expect, it } from "vitest";
import {
  normalizeEmailForUniqueness,
  validatePassword,
} from "./accounts";

describe("normalizeEmailForUniqueness", () => {
  it("trims surrounding whitespace and ignores capitalization", () => {
    expect(normalizeEmailForUniqueness("  Person@Example.COM \n")).toBe(
      "person@example.com",
    );
  });

  it("maps capitalization variants to the same unique value", () => {
    expect(normalizeEmailForUniqueness("Person@Example.com")).toBe(
      normalizeEmailForUniqueness("person@example.COM"),
    );
  });
});

describe("validatePassword", () => {
  it.each([0, 1, 8, 9])("rejects a password with %i characters", (length) => {
    const result = validatePassword("x".repeat(length));

    expect(result).toEqual({
      ok: false,
      message: "Password must be at least 10 characters.",
    });
  });

  it.each([
    "abcdefghij",
    "0123456789",
    "!@#$%^&*()",
    "          ",
    "😀😀😀😀😀😀😀😀😀😀",
  ])("accepts any 10-character combination: %j", (password) => {
    expect(validatePassword(password)).toEqual({ ok: true });
  });
});
