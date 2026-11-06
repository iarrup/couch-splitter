import { beforeEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { registerAccount, signIn } from "../../server/account-service";
import { signOut } from "../../server/session-service";
import {
  signInAction,
  signOutAction,
  signUpAction,
} from "./accounts";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string): never => {
    throw new Error(`Redirected to ${path}`);
  }),
}));
vi.mock("../../server/account-service", () => ({
  registerAccount: vi.fn(),
  signIn: vi.fn(),
}));
vi.mock("../../server/session-service", () => ({ signOut: vi.fn() }));

const cookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

function createFormData(fields: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    formData.set(name, value);
  }
  return formData;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(cookies).mockResolvedValue(
    cookieStore as unknown as Awaited<ReturnType<typeof cookies>>,
  );
  vi.mocked(signOut).mockResolvedValue(undefined);
});

describe("signUpAction", () => {
  it("sets the protected session cookie and redirects after registration", async () => {
    const expiresAt = new Date("2026-12-06T12:00:00.000Z");
    vi.mocked(registerAccount).mockResolvedValue({
      ok: true,
      accountId: "account-1",
      sessionSecret: "session-secret",
      expiresAt,
    });

    await expect(
      signUpAction(
        null,
        createFormData({
          displayName: "Riley",
          email: "riley@example.com",
          password: "correct horse",
        }),
      ),
    ).rejects.toThrow("Redirected to /");

    expect(registerAccount).toHaveBeenCalledWith(
      {
        displayName: "Riley",
        email: "riley@example.com",
        password: "correct horse",
      },
      expect.any(Date),
    );
    expect(cookieStore.set).toHaveBeenCalledWith(
      "couchsplitter-session",
      "session-secret",
      {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        expires: expiresAt,
      },
    );
    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("returns registration errors without setting a cookie", async () => {
    vi.mocked(registerAccount).mockResolvedValue({
      ok: false,
      message: "Password must be at least 10 characters.",
    });

    await expect(
      signUpAction(null, createFormData({ password: "short" })),
    ).resolves.toEqual({
      message: "Password must be at least 10 characters.",
    });
    expect(cookieStore.set).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe("signInAction", () => {
  it("sets the protected session cookie and redirects after sign-in", async () => {
    const expiresAt = new Date("2026-12-06T12:00:00.000Z");
    vi.mocked(signIn).mockResolvedValue({
      ok: true,
      accountId: "account-1",
      sessionSecret: "session-secret",
      expiresAt,
    });

    await expect(
      signInAction(
        null,
        createFormData({
          email: "riley@example.com",
          password: "correct horse",
        }),
      ),
    ).rejects.toThrow("Redirected to /");

    expect(cookieStore.set).toHaveBeenCalledWith(
      "couchsplitter-session",
      "session-secret",
      expect.objectContaining({ httpOnly: true, sameSite: "lax", path: "/" }),
    );
    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("returns one generic error without setting a cookie on failure", async () => {
    vi.mocked(signIn).mockResolvedValue({
      ok: false,
      message: "Email or password is incorrect.",
    });

    await expect(
      signInAction(
        null,
        createFormData({ email: "unknown@example.com", password: "wrong" }),
      ),
    ).resolves.toEqual({ message: "Email or password is incorrect." });
    expect(cookieStore.set).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe("signOutAction", () => {
  it("revokes the session, clears the cookie, and redirects to sign-in", async () => {
    cookieStore.get.mockReturnValue({
      name: "couchsplitter-session",
      value: "session-secret",
    });

    await expect(signOutAction()).rejects.toThrow("Redirected to /sign-in");

    expect(signOut).toHaveBeenCalledWith("session-secret");
    expect(cookieStore.delete).toHaveBeenCalledWith("couchsplitter-session");
    expect(redirect).toHaveBeenCalledWith("/sign-in");
  });

  it("still clears a missing cookie without revoking a session", async () => {
    cookieStore.get.mockReturnValue(undefined);

    await expect(signOutAction()).rejects.toThrow("Redirected to /sign-in");

    expect(signOut).not.toHaveBeenCalled();
    expect(cookieStore.delete).toHaveBeenCalledWith("couchsplitter-session");
  });
});
