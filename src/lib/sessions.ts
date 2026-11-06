const inactivityLimitMilliseconds = 30 * 24 * 60 * 60 * 1000;

export function sessionExpiryFrom(now: Date): Date {
  return new Date(now.getTime() + inactivityLimitMilliseconds);
}

export function isSessionExpired(expiresAt: Date, now: Date): boolean {
  return now.getTime() >= expiresAt.getTime();
}
