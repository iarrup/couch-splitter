import { describe, expect, it } from "vitest";
import { isSessionExpired, sessionExpiryFrom } from "./sessions";

describe("sessionExpiryFrom", () => {
  it("sets the expiry 30 days after the provided time", () => {
    const now = new Date("2026-11-06T12:34:56.789Z");

    expect(sessionExpiryFrom(now)).toEqual(
      new Date("2026-12-06T12:34:56.789Z"),
    );
  });

  it("does not mutate the provided date", () => {
    const now = new Date("2026-11-06T12:34:56.789Z");
    const originalTimestamp = now.getTime();

    sessionExpiryFrom(now);

    expect(now.getTime()).toBe(originalTimestamp);
  });
});

describe("isSessionExpired", () => {
  const expiresAt = new Date("2026-12-06T12:34:56.789Z");

  it("keeps a session active immediately before its expiry", () => {
    const now = new Date(expiresAt.getTime() - 1);

    expect(isSessionExpired(expiresAt, now)).toBe(false);
  });

  it("expires a session exactly at its expiry", () => {
    expect(isSessionExpired(expiresAt, expiresAt)).toBe(true);
  });

  it("expires a session after its expiry", () => {
    const now = new Date(expiresAt.getTime() + 1);

    expect(isSessionExpired(expiresAt, now)).toBe(true);
  });
});
