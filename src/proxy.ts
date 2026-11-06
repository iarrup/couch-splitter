import { NextResponse, type NextRequest } from "next/server";

const sessionCookieName = "couchsplitter-session";
const inactivityLimitSeconds = 30 * 24 * 60 * 60;

export function proxy(request: NextRequest) {
  const sessionSecret = request.cookies.get(sessionCookieName)?.value;
  const response = NextResponse.next();

  if (sessionSecret) {
    response.cookies.set(sessionCookieName, sessionSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: inactivityLimitSeconds,
    });
  }

  return response;
}

export const config = {
  matcher: ["/"],
};
