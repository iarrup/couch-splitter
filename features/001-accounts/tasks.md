# Account Tasks

- [ ] T01 — Configure the approved Prisma toolchain and account schema — files: `package.json`, `package-lock.json`, `prisma/schema.prisma` — proves: AC-4, AC-5
- [ ] T02 — Migrate account storage and initialise the server client — files: `.gitignore`, `prisma/migrations/001_accounts/migration.sql`, `src/server/prisma.ts` — proves: AC-4, AC-5
- [ ] T03 [P] — Implement canonical email and password rules with unit tests — files: `src/lib/accounts.ts`, `src/lib/accounts.test.ts` — proves: AC-2, AC-3, AC-5
- [ ] T04 [P] — Implement inactivity expiry rules with unit tests — files: `src/lib/sessions.ts`, `src/lib/sessions.test.ts` — proves: AC-9, AC-10
- [ ] T05 [P] — Implement password protection and comparison with unit tests — files: `src/server/password.ts`, `src/server/password.test.ts` — proves: AC-1, AC-6, AC-7
- [ ] T06 — Implement account registration and sign-in services with isolated storage tests — files: `src/server/account-service.ts`, `src/server/account-service.test.ts`, `src/test/database.ts` — proves: AC-1, AC-4, AC-5, AC-6, AC-7
- [ ] T07 — Implement rolling session resolution and revocation with isolated storage tests — files: `src/server/session-service.ts`, `src/server/session-service.test.ts` — proves: AC-8, AC-9, AC-10
- [ ] T08 — Implement account server actions with cookie and redirect tests — files: `src/app/actions/accounts.ts`, `src/app/actions/accounts.test.ts` — proves: AC-1, AC-6, AC-7, AC-8, AC-9, AC-10
- [ ] T09 — Build the accessible presentational account form — files: `src/components/account-form.tsx` — proves: AC-2, AC-3, AC-7
- [ ] T10 [P] — Build and render-test the sign-up screen — files: `src/app/sign-up/page.tsx`, `src/app/sign-up/page.test.tsx` — proves: AC-1, AC-2, AC-3, AC-4, AC-5
- [ ] T11 [P] — Build and render-test the sign-in screen — files: `src/app/sign-in/page.tsx`, `src/app/sign-in/page.test.tsx` — proves: AC-6, AC-7
- [ ] T12 — Build and render-test the protected landing and sign-out screen — files: `src/app/page.tsx`, `src/components/sign-out-form.tsx`, `src/app/page.test.tsx` — proves: AC-8, AC-9, AC-10

## Coverage

| Acceptance criterion | Covering tasks |
| --- | --- |
| AC-1 | T05, T06, T08, T10 |
| AC-2 | T03, T09, T10 |
| AC-3 | T03, T09, T10 |
| AC-4 | T01, T02, T06, T10 |
| AC-5 | T01, T02, T03, T06, T10 |
| AC-6 | T05, T06, T08, T11 |
| AC-7 | T05, T06, T08, T09, T11 |
| AC-8 | T07, T08, T12 |
| AC-9 | T04, T07, T08, T12 |
| AC-10 | T04, T07, T08, T12 |