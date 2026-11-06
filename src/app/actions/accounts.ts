"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { registerAccount, signIn } from "../../server/account-service";
import { signOut } from "../../server/session-service";

const sessionCookieName = "couchsplitter-session";

type AccountActionState = { message: string } | null;

function readStringField(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function sessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: expiresAt,
  };
}

export async function signUpAction(
  _previousState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const result = await registerAccount(
    {
      displayName: readStringField(formData, "displayName"),
      email: readStringField(formData, "email"),
      password: readStringField(formData, "password"),
    },
    new Date(),
  );

  if (!result.ok) {
    return { message: result.message };
  }

  const cookieStore = await cookies();
  cookieStore.set(
    sessionCookieName,
    result.sessionSecret,
    sessionCookieOptions(result.expiresAt),
  );
  redirect("/");
}

export async function signInAction(
  _previousState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const result = await signIn(
    {
      email: readStringField(formData, "email"),
      password: readStringField(formData, "password"),
    },
    new Date(),
  );

  if (!result.ok) {
    return { message: result.message };
  }

  const cookieStore = await cookies();
  cookieStore.set(
    sessionCookieName,
    result.sessionSecret,
    sessionCookieOptions(result.expiresAt),
  );
  redirect("/");
}

export async function signOutAction(): Promise<void> {
  const cookieStore = await cookies();
  const sessionSecret = cookieStore.get(sessionCookieName)?.value;

  if (sessionSecret) {
    await signOut(sessionSecret);
  }

  cookieStore.delete(sessionCookieName);
  redirect("/sign-in");
}
