import type { PrismaClient } from "../generated/prisma/client";
import { normalizeEmailForUniqueness } from "../lib/accounts";
import { validateGroupName } from "../lib/groups";
import { prisma } from "./prisma";

export async function listGroups(accountId: string, database: PrismaClient = prisma) {
  return database.group.findMany({
    where: { members: { some: { accountId } } },
    include: { members: { include: { account: { select: { id: true, displayName: true, email: true } } } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function createGroup(accountId: string, name: string, database: PrismaClient = prisma) {
  const valid = validateGroupName(name);
  if (!valid.ok) return valid;
  const duplicate = await database.group.findFirst({ where: { creatorId: accountId, name: valid.name } });
  if (duplicate) return { ok: false as const, message: "A group with that name already exists." };
  const group = await database.group.create({ data: { name: valid.name, creatorId: accountId, members: { create: { accountId } } } });
  return { ok: true as const, groupId: group.id };
}

export async function addGroupMember(actorId: string, groupId: string, email: string, database: PrismaClient = prisma) {
  const group = await database.group.findUnique({ where: { id: groupId } });
  if (!group) return { ok: false as const, message: "Group not found." };
  if (group.creatorId !== actorId) return { ok: false as const, message: "Only the group creator can manage members." };
  const account = await database.account.findUnique({ where: { email: normalizeEmailForUniqueness(email) } });
  if (!account) return { ok: false as const, message: "No matching account was found." };
  const existing = await database.groupMember.findUnique({ where: { groupId_accountId: { groupId, accountId: account.id } } });
  if (existing) return { ok: false as const, message: "That account is already a member." };
  await database.groupMember.create({ data: { groupId, accountId: account.id } });
  return { ok: true as const };
}

export async function removeGroupMember(actorId: string, groupId: string, accountId: string, database: PrismaClient = prisma) {
  const group = await database.group.findUnique({ where: { id: groupId } });
  if (!group || group.creatorId !== actorId) return { ok: false as const, message: "Only the group creator can manage members." };
  await database.groupMember.deleteMany({ where: { groupId, accountId } });
  return { ok: true as const };
}

export async function leaveGroup(accountId: string, groupId: string, database: PrismaClient = prisma) {
  await database.groupMember.deleteMany({ where: { groupId, accountId } });
}

export async function deleteGroup(actorId: string, groupId: string, database: PrismaClient = prisma) {
  const group = await database.group.findUnique({ where: { id: groupId } });
  if (!group || group.creatorId !== actorId) return { ok: false as const, message: "Only the group creator can delete this group." };
  await database.group.delete({ where: { id: groupId } });
  return { ok: true as const };
}
