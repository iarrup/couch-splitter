"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addGroupMember, createGroup, deleteGroup, leaveGroup, removeGroupMember } from "../../server/group-service";
import { resolveSession } from "../../server/session-service";

async function signedInAccountId(): Promise<string> {
  const secret = (await cookies()).get("couchsplitter-session")?.value;
  const session = secret ? await resolveSession(secret, new Date()) : null;
  if (!session) redirect("/sign-in");
  return session.accountId;
}

function field(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value : "";
}

export async function createGroupAction(data: FormData): Promise<void> {
  const accountId = await signedInAccountId();
  const result = await createGroup(accountId, field(data, "name"));
  revalidatePath("/");
  if (!result.ok) redirect(`/?error=${encodeURIComponent(result.message)}`);
  redirect(`/groups/${result.groupId}`);
}

export async function addGroupMemberAction(data: FormData): Promise<void> {
  const accountId = await signedInAccountId();
  const groupId = field(data, "groupId");
  const result = await addGroupMember(accountId, groupId, field(data, "email"));
  revalidatePath(`/groups/${groupId}`);
  redirect(`/groups/${groupId}${result.ok ? "" : `?error=${encodeURIComponent(result.message)}`}`);
}

export async function removeGroupMemberAction(data: FormData): Promise<void> {
  const accountId = await signedInAccountId();
  const groupId = field(data, "groupId");
  await removeGroupMember(accountId, groupId, field(data, "accountId"));
  revalidatePath(`/groups/${groupId}`);
  redirect(`/groups/${groupId}`);
}

export async function leaveGroupAction(data: FormData): Promise<void> {
  const accountId = await signedInAccountId();
  const groupId = field(data, "groupId");
  await leaveGroup(accountId, groupId);
  revalidatePath("/");
  redirect("/");
}

export async function deleteGroupAction(data: FormData): Promise<void> {
  const accountId = await signedInAccountId();
  const groupId = field(data, "groupId");
  const result = await deleteGroup(accountId, groupId);
  revalidatePath("/");
  if (!result.ok) redirect(`/groups/${groupId}?error=${encodeURIComponent(result.message)}`);
  redirect("/");
}
