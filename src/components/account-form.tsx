"use client";

import { useActionState } from "react";
import { signInAction, signUpAction } from "../app/actions/accounts";

type AccountFormProps = {
  mode: "sign-in" | "sign-up";
};

const minimumPasswordMessage = "Password must be at least 10 characters.";

export function AccountForm({ mode }: AccountFormProps) {
  const isSignUp = mode === "sign-up";
  const action = isSignUp ? signUpAction : signInAction;
  const [state, formAction, pending] = useActionState(action, null);
  const idPrefix = isSignUp ? "sign-up" : "sign-in";
  const passwordError =
    isSignUp && state?.message === minimumPasswordMessage
      ? state.message
      : null;

  return (
    <form
      action={formAction}
      aria-labelledby={`${idPrefix}-heading`}
      className="mx-auto flex w-full max-w-md flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex flex-col gap-2">
        <h2 id={`${idPrefix}-heading`} className="text-2xl font-semibold">
          {isSignUp ? "Create your account" : "Sign in"}
        </h2>
        <p className="text-sm text-zinc-600">
          {isSignUp
            ? "Your groups and expenses will be private to your account."
            : "Sign in to view your groups and expenses."}
        </p>
      </div>

      {state?.message && !passwordError ? (
        <p
          id={`${idPrefix}-error`}
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900"
        >
          {state.message}
        </p>
      ) : null}

      {isSignUp ? (
        <div className="flex flex-col gap-2">
          <label htmlFor={`${idPrefix}-display-name`} className="text-sm font-medium">
            Display name
          </label>
          <input
            id={`${idPrefix}-display-name`}
            name="displayName"
            type="text"
            autoComplete="nickname"
            required
            className="min-h-11 rounded-lg border border-zinc-300 px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-email`} className="text-sm font-medium">
          Email address
        </label>
        <input
          id={`${idPrefix}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          className="min-h-11 rounded-lg border border-zinc-300 px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-password`} className="text-sm font-medium">
          Password
        </label>
        <input
          id={`${idPrefix}-password`}
          name="password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          required
          minLength={isSignUp ? 10 : undefined}
          aria-invalid={passwordError ? true : undefined}
          aria-describedby={passwordError ? `${idPrefix}-password-error` : undefined}
          className="min-h-11 rounded-lg border border-zinc-300 px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        />
        {isSignUp ? (
          <p className="text-sm text-zinc-600">Use at least 10 characters.</p>
        ) : null}
        {passwordError ? (
          <p
            id={`${idPrefix}-password-error`}
            role="alert"
            className="text-sm text-red-800"
          >
            {passwordError}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-lg bg-blue-700 px-4 font-semibold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-wait disabled:opacity-60"
      >
        {pending
          ? isSignUp
            ? "Creating account…"
            : "Signing in…"
          : isSignUp
            ? "Create account"
            : "Sign in"}
      </button>
    </form>
  );
}
