# couchsplitter

Read this file before every task. If anything below conflicts with my prompt, ask.

## Stack

Next.js (App Router) + TypeScript + Prisma + Postgres + Tailwind + Vitest. Nothing else.

## Money

Money is always an integer number of cents. Never a float, never a string, never a Decimal.
Every money field and variable name ends in `Cents`. Formatting to "$12.34" happens only in components.

## Workflow

- Work only on the task I gave you. Do not edit files outside its scope, even to "fix" them.
- One task = one commit. Message format: `feat(003): add percent split mode`.
- Before you say you are done, run `npm test` and `npx tsc --noEmit` and paste the real output.
- Ask before adding any dependency. Say what it is and why the standard library cannot do it.
- If the spec is ambiguous, stop and ask. Do not pick a sensible default and keep going.

## Layout

- `src/app` — routes and pages only. Parse input, call `src/lib`, render.
- `src/lib` — all business rules, as pure functions. Never imports from `src/app`.
- `src/components` — presentational. No database access.
- Every exported function in `src/lib` has a test beside it as `<name>.test.ts`.

## Style

- No `any`. No non-null assertion (`!`) unless you explain it.
- Comments explain _why_, never _what_.
- Errors are returned as values from `src/lib`, not thrown, unless the state is impossible.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->