import { describe, expect, it } from "vitest";
import { validateGroupName } from "./groups";

describe("validateGroupName", () => {
  it("trims and accepts a non-empty name", () => {
    expect(validateGroupName(" Trip ")).toEqual({ ok: true, name: "Trip" });
  });
  it("rejects an empty name", () => {
    expect(validateGroupName("  ")).toEqual({ ok: false, message: "Group name is required." });
  });
});
