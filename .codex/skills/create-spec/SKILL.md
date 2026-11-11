---
name: create-spec
description: Create a product-level feature specification for the coush-splitter project. Use this skill when asked to define or specify a new coush-splitter feature before implementation.
---

---

# coush-splitter Feature Specification

Create a feature specification for the coush-splitter project based on the feature described by the user.

## Input

Treat the user's feature request as the **feature to specify**.

If the feature itself is not clear enough to identify what is being specified, ask the user for the feature before proceeding.

## Before writing

Read these project files first:

- `AGENTS.md`
- `specs/000-product/spec.md`

Use them only as context for understanding the product, terminology, existing behavior, and specification conventions.

Determine the next unused specification number from the existing folders under `specs/`.

Create a slug that briefly describes the feature.

Write the specification to:

`specs/<NNN>-<slug>/spec.md`

## Required specification structure

The specification must contain exactly the following sections, in exactly this order, with no additional sections.

### User story

Write exactly one paragraph using this form:

`As a <person>, I want <goal>, so that <reason>.`

### Acceptance criteria

Write numbered acceptance criteria using:

- `AC-1`
- `AC-2`
- `AC-3`
- and so on.

Every acceptance criterion must use explicit Given / When / Then form.

Each criterion must describe behavior that a person can verify.

### Out of scope

Use bullets.

Include things a reasonable person might expect from the feature but that are deliberately not part of this feature.

### Open questions

Use bullets.

Every item must use exactly this form:

`[NEEDS CLARIFICATION: <question>]`

Do not silently resolve uncertainty.

A first-pass specification must contain at least three open questions.

### Done means

Write between 3 and 6 bullets.

Every bullet must describe something a non-technical person could manually verify.

## Specification rules

### 1. Keep the specification technology-free

Do not use technology or implementation terminology anywhere in the specification.

Do not mention:

- file names
- table names
- routes
- library names
- programming language names
- API
- database
- component
- endpoint
- implementation architecture

If a requirement cannot be expressed without implementation terminology, it does not belong in this specification.

### 2. Make every acceptance criterion observable

Every criterion must describe behavior that can be checked.

Do not use subjective words such as:

- fast
- intuitive
- user-friendly
- seamless
- robust

Replace subjective descriptions with specific observable outcomes.

### 3. Never guess uncertain product behavior

Anything that is not established by the existing product specification or the user's request must go into **Open questions**.

Do not select a reasonable default merely to finish the specification.

The first version of the specification must have at least three open questions.

### 4. Cover required edge cases

The specification must explicitly address each of the following, either through expected behavior or by declaring it out of scope:

- money and rounding
- empty state
- duplicate input
- deletion
- zero values
- negative values

Do not omit any of these.

### 5. Write specification content only

Do not add:

- code
- schemas
- pseudocode
- implementation plans
- technical design
- engineering notes

The resulting `spec.md` must contain only the required specification sections.

## Workflow

1. Read the required project context.
2. Understand the requested feature.
3. Inspect existing specification numbers.
4. Select the next unused number.
5. Create an appropriate feature slug.
6. Draft the specification following all rules above.
7. Check that every required edge case is addressed or explicitly out of scope.
8. Check that there are at least three open questions.
9. Check that no prohibited technology terminology appears in the specification.
10. Write `specs/<NNN>-<slug>/spec.md`.
11. Do not create implementation files or continue into planning.

## Final response

After writing the specification, print only the open questions in the chat as a numbered list.

Do not answer the questions yourself.

Do not modify the specification further.

Stop and wait for the user's answers before doing anything else.