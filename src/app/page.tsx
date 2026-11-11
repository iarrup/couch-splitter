import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { SignOutForm } from "../components/sign-out-form";
import { prisma } from "../server/prisma";
import { resolveSession } from "../server/session-service";
import { listGroups } from "../server/group-service";
import { createGroupAction } from "./actions/groups";

const sessionCookieName = "couchsplitter-session";

export default async function Home({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await connection();
  const { error } = await searchParams;
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
  const groups = await listGroups(session.accountId);

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="flex w-full max-w-xl flex-col items-center gap-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-800">
          couch-splitter
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
          Welcome, {account.displayName}
        </h1>
        <h2 className="text-xl font-semibold text-zinc-900">Your groups</h2>
        {error ? <p role="alert" className="text-red-800">{error}</p> : null}
        {groups.length === 0 ? <p>You have no groups yet.</p> : <ul className="w-full space-y-2 text-left">{groups.map((group) => <li key={group.id}><a className="text-blue-800 underline" href={`/groups/${group.id}`}>{group.name}</a></li>)}</ul>}
        <form action={createGroupAction} className="flex w-full gap-2">
          <label className="sr-only" htmlFor="group-name">Group name</label>
          <input id="group-name" name="name" required className="min-w-0 flex-1 rounded border border-zinc-400 px-3 py-2" placeholder="Group name" />
          <button className="rounded-md bg-blue-800 px-4 py-2 font-semibold text-white" type="submit">Create group</button>
        </form>
        <SignOutForm />
      </div>
    </main>
  );
}
