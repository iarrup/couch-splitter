import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import SignInPage from "./page";

vi.mock("../../components/account-form", async () => {
  const { createElement } = await import("react");

  return {
    AccountForm: ({ mode }: { mode: string }) =>
      createElement("form", { "data-form-mode": mode }),
  };
});

describe("sign-in page", () => {
  it("renders sign-in information, the sign-in form, and a sign-up link", () => {
    const markup = renderToStaticMarkup(createElement(SignInPage));

    expect(markup).toContain("Sign in to your account");
    expect(markup).toContain("Enter your email address and password");
    expect(markup).toContain('data-form-mode="sign-in"');
    expect(markup).toContain('href="/sign-up"');
    expect(markup).toContain("Create an account");
  });
});
