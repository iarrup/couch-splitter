import { describe, expect, it } from "vitest";
import { normalizeMemberEmail } from "./groups";

describe("normalizeMemberEmail", () => {
  it("trims and lowercases an email address", () => {
    expect(normalizeMemberEmail(" A@Example.COM ")).toBe("a@example.com");
  });
});
