import { cookies } from "next/headers";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { prisma } from "../../../server/prisma";
import { resolveSession } from "../../../server/session-service";
import { addGroupMemberAction, deleteGroupAction, leaveGroupAction, removeGroupMemberAction } from "../../actions/groups";

export default async function GroupPage({ params, searchParams }: {
  params: Promise<{ groupId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await connection();
  const { groupId } = await params;
  const { error } = await searchParams;
  const secret = (await cookies()).get("couchsplitter-session")?.value;
  const session = secret ? await resolveSession(secret, new Date()) : null;
  if (!session) redirect("/sign-in");

  const group = await prisma.group.findFirst({
    where: { id: groupId, OR: [{ creatorId: session.accountId }, { members: { some: { accountId: session.accountId } } }] },
    include: { members: { include: { account: { select: { id: true, displayName: true, email: true } } } } },
  });
  if (!group) notFound();
  const isCreator = group.creatorId === session.accountId;

  return <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10">
    <a className="text-blue-800 underline" href="/">All groups</a>
    <h1 className="text-3xl font-bold">{group.name}</h1>
    {error ? <p role="alert" className="text-red-800">{error}</p> : null}
    <section aria-labelledby="members-heading" className="space-y-3">
      <h2 id="members-heading" className="text-xl font-semibold">Members</h2>
      <ul className="space-y-3">{group.members.map(({ account }) => <li className="flex items-center justify-between gap-2" key={account.id}>
        <span>{account.displayName} <span className="text-zinc-600">({account.email})</span></span>
        {isCreator && account.id !== group.creatorId ? <form action={removeGroupMemberAction}><input type="hidden" name="groupId" value={groupId} /><input type="hidden" name="accountId" value={account.id} /><button className="text-red-800 underline" type="submit">Remove</button></form> : null}
      </li>)}</ul>
    </section>
    {isCreator ? <form action={addGroupMemberAction} className="flex gap-2"><input type="hidden" name="groupId" value={groupId} /><label className="sr-only" htmlFor="member-email">Member email</label><input id="member-email" name="email" type="email" required className="min-w-0 flex-1 rounded border border-zinc-400 px-3 py-2" placeholder="Email address" /><button className="rounded bg-blue-800 px-4 py-2 text-white" type="submit">Add member</button></form> : null}
    <div className="flex flex-wrap gap-4">
      <form action={leaveGroupAction}><input type="hidden" name="groupId" value={groupId} /><button className="text-blue-800 underline" type="submit">Leave group</button></form>
      {isCreator ? <form action={deleteGroupAction}><input type="hidden" name="groupId" value={groupId} /><button className="text-red-800 underline" type="submit">Delete group</button></form> : null}
    </div>
  </main>;
}
