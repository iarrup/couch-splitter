import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutForm } from "../components/sign-out-form";
import { prisma } from "../server/prisma";
import { resolveSession } from "../server/session-service";

const sessionCookieName = "couchsplitter-session";

export default async function Home() {
  const cookieStore = await cookies();
  const sessionSecret = cookieStore.get(sessionCookieName)?.value;

  if (!sessionSecret) {
    redirect("/sign-in");
  }

  const session = await resolveSession(sessionSecret, new Date());

  if (!session) {
    redirect("/sign-in");
  }

  const account = await prisma.account.findUnique({
    where: { id: session.accountId },
    select: { displayName: true },
  });

  if (!account) {
    redirect("/sign-in");
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="flex w-full max-w-xl flex-col items-center gap-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-800">
          couch-splitter
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
          Welcome, {account.displayName}
        </h1>
        <p className="text-base text-zinc-700">
          Your groups and expenses are ready when you are.
        </p>
        <SignOutForm />
      </div>
    </main>
  );
}
