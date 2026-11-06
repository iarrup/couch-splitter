export type ValidationResult =
  | { ok: true }
  | { ok: false; message: string };

const minimumPasswordLength = 10;

export function normalizeEmailForUniqueness(email: string): string {
  return email.trim().toLowerCase();
}

export function validatePassword(password: string): ValidationResult {
  if (Array.from(password).length < minimumPasswordLength) {
    return {
      ok: false,
      message: "Password must be at least 10 characters.",
    };
  }

  return { ok: true };
}
