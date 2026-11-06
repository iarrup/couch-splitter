## What this is

couch-splitter remembers who paid for what when a group of people share costs, and works
out the smallest set of payments that settles everybody up.

## Who it is for

Small fixed groups who spend money together repeatedly and trust each other:
flatmates, a trip, a couple, a team lunch rota. Not merchants, not strangers,
not anyone who needs the money guaranteed.

## The problem in one sentence

After a weekend away, nobody can remember who covered which taxi, and the person
who kept the receipts ends up doing arithmetic in a group chat at midnight.

## Principles

1. **Never lose a dollar.** The parts of a split always add up to exactly the whole.
   If they cannot, we refuse the input rather than absorb the difference.
2. **History is never rewritten silently.** Correcting an expense leaves a trace.
3. **Boring beats clever.** No feature ships because it would be impressive.
4. **A stranger should understand any screen in ten seconds** without a tutorial.

## Version 1 scope

- People have their own account.
- People create groups and add other members.
- People record an expense: who paid, how much, who it was for, how to split it.
- People see what each member owes or is owed.
- People record a repayment, which changes the balances.

## Vocabulary (use these words everywhere, in code and on screen)

| Word            | Means                                                           |
| --------------- | --------------------------------------------------------------- |
| **Member**      | A person inside a group                                         |
| **Expense**     | Money one member spent on behalf of some members                |
| **Payer**       | The member whose money left their pocket                        |
| **Participant** | A member the expense was spent on                               |
| **Share**       | The part of an expense one participant is responsible for       |
| **Balance**     | For one member: everything they paid, minus everything they owe |
| **Settlement**  | One member handing money to another to reduce a balance         |
| **Settle up**   | The set of settlements that would bring every balance to zero   |

Banned synonyms: "bill", "debt", "transaction", "user" (on screen), "split" as a noun.

## Feature order

| #   | Feature                  | Why here                        |
| --- | ------------------------ | ------------------------------- |
| 001 | Accounts                 | Nothing is personal without it  |
| 002 | Groups and members       | Expenses need somewhere to live |
| 003 | Expenses and split modes | The heart of the product        |
| 004 | Balances and settle up   | The reason anyone opens the app |
