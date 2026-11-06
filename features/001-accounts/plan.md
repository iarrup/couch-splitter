## Approach

Keep account and inactivity rules as pure functions in `src/lib`, and place password protection, persistence, and signed-in state behind server-only services. Use Server Components for reads and Server Actions for sign-up, sign-in, and sign-out because every account operation starts from an internal form. Store email addresses in one canonical form for uniqueness, while leaving sign-in capitalization behavior undecided until the specification states it. Store only protected password and sign-in secrets, and extend an active sign-in period to 30 days from the latest use. Protect private pages by resolving the current account before rendering.

## Data model

```prisma
model Account {
  id             String    @id @default(cuid())
  displayName    String
  email          String    @unique
  passwordDigest String
  createdAt      DateTime  @default(now())
  sessions       Session[]
}

model Session {
  id           String   @id @default(cuid())
  secretDigest String   @unique
  accountId    String
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  account      Account  @relation(fields: [accountId], references: [id], onDelete: Cascade)

  @@index([accountId])
  @@index([expiresAt])
}
```

`Account.email` receives the canonical value used to enforce case-insensitive uniqueness. `Session.secretDigest` prevents a stolen data file from containing usable sign-in secrets, and `expiresAt` represents the rolling 30-day inactivity boundary.

## Domain functions

```ts
type ValidationResult =
  | { ok: true }
  | { ok: false; message: string };

type SignInResult =
  | { ok: true; accountId: string; sessionSecret: string; expiresAt: Date }
  | { ok: false; message: string };

normalizeEmailForUniqueness(email: string): string
validatePassword(password: string): ValidationResult
sessionExpiryFrom(now: Date): Date
isSessionExpired(expiresAt: Date, now: Date): boolean
registerAccount(input: { displayName: string; email: string; password: string }, now: Date): Promise<SignInResult>
signIn(input: { email: string; password: string }, now: Date): Promise<SignInResult>
resolveSession(secret: string, now: Date): Promise<{ accountId: string; expiresAt: Date } | null>
signOut(secret: string): Promise<void>
```

The four synchronous functions are pure and return errors as values. Server-only services implement the asynchronous signatures, use `node:crypto` for password and secret protection, and perform equivalent password work for unknown emails and wrong passwords.

## Routes and server actions

| Route or action | Responsibility |
| --- | --- |
| `/sign-up` | Render the account form and explain the 10-character minimum. |
| `/sign-in` | Render the sign-in form and the single generic failure message. |
| `/` | Resolve the current account; redirect signed-out visitors to `/sign-in`; render the signed-in landing page. |
| `signUpAction(previousState, formData)` | Parse fields, call `registerAccount`, set the protected sign-in cookie, and redirect to `/`. |
| `signInAction(previousState, formData)` | Parse fields, call `signIn`, return the generic failure or set the cookie and redirect. |
| `signOutAction()` | Revoke the current session, clear the cookie, and redirect to `/sign-in`. |

No Route Handler is needed because these mutations are used only by Splitsy's own forms. The cookie is HTTP-only, secure outside local development, same-site lax, scoped to `/`, and limited to 30 days; successful authenticated use rolls both its expiry and `Session.expiresAt` forward.

## UI

Use one presentational account form shell with labelled display-name, email-address, and password fields, plus separate sign-up and sign-in submit controls. Show field-specific password-length feedback during sign-up, but use one identical form-level message for unknown-email and wrong-password sign-in failures. The signed-in landing page shows the account display name and a sign-out control. All forms remain usable without client-side scripting, with visible focus states and an error summary announced to assistive technology.

## Files

| Status | File | Purpose |
| --- | --- | --- |
| EDIT | `.gitignore` | Exclude the local SQLite file and generated Prisma client. |
| EDIT | `package.json` | Add approved Prisma dependencies and the `test` and client-generation scripts. |
| EDIT | `package-lock.json` | Lock approved dependency versions. |
| EDIT | `prisma/schema.prisma` | Add `Account` and `Session`. |
| NEW | `prisma/migrations/001_accounts/migration.sql` | Create account and session storage with uniqueness and indexes. |
| NEW | `src/lib/accounts.ts` | Pure email and password rules. |
| NEW | `src/lib/accounts.test.ts` | Unit tests for every exported account rule. |
| NEW | `src/lib/sessions.ts` | Pure 30-day inactivity rules. |
| NEW | `src/lib/sessions.test.ts` | Unit tests for every exported inactivity rule. |
| NEW | `src/server/prisma.ts` | Create the single server-side Prisma client. |
| NEW | `src/server/password.ts` | Protect and compare passwords with `node:crypto`. |
| NEW | `src/server/account-service.ts` | Coordinate account persistence, sign-in, and generic failures. |
| NEW | `src/server/account-service.test.ts` | Prove account and sign-in behavior against isolated SQLite storage. |
| NEW | `src/server/session-service.ts` | Create, resolve, roll, and revoke sessions. |
| NEW | `src/server/session-service.test.ts` | Prove rolling expiry and revocation against isolated SQLite storage. |
| NEW | `src/app/actions/accounts.ts` | Parse account forms, manage the cookie, and redirect. |
| NEW | `src/app/actions/accounts.test.ts` | Exercise action results and cookie behavior. |
| NEW | `src/app/sign-up/page.tsx` | Render the sign-up route. |
| NEW | `src/app/sign-in/page.tsx` | Render the sign-in route. |
| EDIT | `src/app/page.tsx` | Replace the starter page with the protected signed-in landing page. |
| NEW | `src/components/account-form.tsx` | Present shared account-form fields and accessible errors. |
| NEW | `src/components/sign-out-form.tsx` | Present the sign-out control. |

Generated files under `src/generated/prisma/` are build output and are not committed.

## Test plan

| Criterion | Test that proves it |
| --- | --- |
| AC-1 | `signUpAction creates an account, starts a session, and does not request email confirmation` |
| AC-2 | `validatePassword rejects 0 through 9 characters with the 10-character message` |
| AC-3 | `validatePassword accepts 10-character examples containing only letters, only numbers, only symbols, and whitespace` |
| AC-4 | `registerAccount permits two accounts with the same display name and different emails` |
| AC-5 | `registerAccount rejects an email already stored with different capitalisation` |
| AC-6 | `signIn accepts the stored email spelling with the correct password and starts a session`; alternate-capitalization sign-in cannot be tested until the specification defines it |
| AC-7 | `signIn returns the identical message for an unknown email and a wrong password`, plus a timing-work assertion that both paths perform password comparison |
| AC-8 | `signOutAction revokes the session, clears the cookie, and makes the protected page redirect` |
| AC-9 | `resolveSession accepts activity just under 30 days and rolls expiry to 30 days from now` |
| AC-10 | `resolveSession rejects activity at and beyond 30 days and requires sign-in` |

Run all tests with `npm test`, type-check with `npx tsc --noEmit`, lint with `npm run lint`, and build with `npm run build`.

## Risks

- Sign-in matching across email capitalization remains unspecified. AC-6 can prove exact-spelling sign-in only; implementation must not silently decide how alternate capitalization behaves.
- Prisma packages are absent even though Prisma configuration exists. Implementation proposes `prisma` and `@types/better-sqlite3` as development dependencies plus `@prisma/client`, `@prisma/adapter-better-sqlite3`, and `dotenv` as runtime dependencies; the standard library cannot generate the declared client, run Prisma migrations, provide Prisma's required SQLite adapter, or load the existing Prisma configuration as written. Approval is required before adding them.
- AC-7 covers both wording and information leakage. Unknown-email sign-in must perform the same expensive password-comparison work as wrong-password sign-in, while automated timing measurements can reduce but cannot prove the absence of every timing side channel.
- Rolling expiry writes on authenticated use and may race across simultaneous requests; updates must only extend expiry and never shorten it.
- The SQLite adapter includes native code, so supported development and deployment environments must be verified during implementation.