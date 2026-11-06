import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import Home from "./page";
import { proxy } from "../proxy";

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  redirect: vi.fn((path: string): never => {
    throw new Error(`REDIRECT:${path}`);
  }),
  resolveSession: vi.fn(),
  findAccount: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("../server/session-service", () => ({
  resolveSession: mocks.resolveSession,
}));
vi.mock("../server/prisma", () => ({
  prisma: { account: { findUnique: mocks.findAccount } },
}));
vi.mock("../components/sign-out-form", async () => {
  const { createElement } = await import("react");
  return {
    SignOutForm: () => createElement("button", { type: "button" }, "Sign out"),
  };
});

describe("protected landing page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cookies.mockResolvedValue({
      get: (name: string) =>
        name === "couchsplitter-session" ? { value: "session-secret" } : undefined,
    });
    mocks.resolveSession.mockResolvedValue({ accountId: "account-1" });
    mocks.findAccount.mockResolvedValue({ displayName: "Morgan" });
  });

  it("renders the signed-in account and sign-out affordance", async () => {
    const markup = renderToStaticMarkup(await Home());

    expect(markup).toContain("Welcome, Morgan");
    expect(markup).toContain("Your groups and expenses are ready when you are.");
    expect(markup).toContain("Sign out");
    expect(mocks.resolveSession).toHaveBeenCalledWith(
      "session-secret",
      expect.any(Date),
    );
    expect(mocks.findAccount).toHaveBeenCalledWith({
      where: { id: "account-1" },
      select: { displayName: true },
    });
  });

  it("redirects signed-out visitors to sign in", async () => {
    mocks.cookies.mockResolvedValue({ get: () => undefined });

    await expect(Home()).rejects.toThrow("REDIRECT:/sign-in");
    expect(mocks.resolveSession).not.toHaveBeenCalled();
  });

  it("redirects when the stored session has expired or been revoked", async () => {
    mocks.resolveSession.mockResolvedValue(null);

    await expect(Home()).rejects.toThrow("REDIRECT:/sign-in");
    expect(mocks.findAccount).not.toHaveBeenCalled();
  });
});

describe("request cookie refresh", () => {
  it("extends a presented session cookie for 30 days", () => {
    const request = new NextRequest("http://localhost/", {
      headers: { cookie: "couchsplitter-session=session-secret" },
    });

    const response = proxy(request);
    const refreshedCookie = response.cookies.get("couchsplitter-session");
    const setCookie = response.headers.get("set-cookie")?.toLowerCase();

    expect(refreshedCookie?.value).toBe("session-secret");
    expect(setCookie).toContain("httponly");
    expect(setCookie).toContain("samesite=lax");
    expect(setCookie).toContain("path=/");
    expect(setCookie).toContain("max-age=2592000");
  });

  it("does not create a session cookie when none was presented", () => {
    const response = proxy(new NextRequest("http://localhost/"));

    expect(response.cookies.get("couchsplitter-session")).toBeUndefined();
  });
});
