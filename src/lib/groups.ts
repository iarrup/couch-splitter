export type GroupValidation = { ok: true; name: string } | { ok: false; message: string };

export function validateGroupName(name: string): GroupValidation {
  const normalizedName = name.trim();
  return normalizedName.length > 0
    ? { ok: true, name: normalizedName }
    : { ok: false, message: "Group name is required." };
}

export function normalizeMemberEmail(email: string): string {
  return email.trim().toLowerCase();
}
