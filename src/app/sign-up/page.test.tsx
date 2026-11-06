import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import SignUpPage from "./page";

vi.mock("../../components/account-form", async () => {
  const { createElement } = await import("react");

  return {
    AccountForm: ({ mode }: { mode: string }) =>
      createElement("form", { "data-form-mode": mode }),
  };
});

describe("sign-up page", () => {
  it("renders account creation information and the sign-up form", () => {
    const markup = renderToStaticMarkup(createElement(SignUpPage));

    expect(markup).toContain("Create your account");
    expect(markup).toContain("No email confirmation is needed.");
    expect(markup).toContain('data-form-mode="sign-up"');
  });
});
