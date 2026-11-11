## User story

As a signed-in member, I want to create groups and manage their members by exact email address, so that the people I share costs with have a place to record those costs together.

## Acceptance criteria

### AC-1

Given I am signed in
When I create a group with a name that no group I belong to already uses
Then the group is created and I am a member of it

### AC-2

Given I am a member of a group
When I try to create a group with the same name
Then the new group is not created

### AC-3

Given I am signed in and have no groups
When I view my groups
Then I am told that I have no groups

### AC-4

Given I am a member of a group
When I view that group’s members
Then I can see every member of the group

### AC-5

Given I am the person who created a group and an email address belongs to an account, regardless of capitalization
When I add that email address to the group
Then that account is added as a member and appears in the group’s member list

### AC-6

Given I am the person who created a group and an email address does not belong to an account
When I try to add that email address
Then the group’s membership does not change and I am told that no matching account was found

### AC-7

Given I am the person who created a group and an account is already a member
When I try to add that account’s email address again
Then the group’s membership does not change and I am told that the account is already a member

### AC-8

Given I am the person who created a group and another member belongs to it
When I remove that member
Then that person no longer appears in the group’s member list

### AC-9

Given I am a member of a group but did not create it
When I try to add or remove another member or delete the group
Then the group and its membership do not change

### AC-10

Given I am a member of a group
When I delete the group
Then the group, its recorded expenses, and its balances are removed, and the group no longer appears in my groups

### AC-11

Given I am a member of a group
When I leave the group
Then I no longer appear in the group’s member list

## Out of scope

- Money amounts, rounding, zero values, and negative values
- Inviting people who do not yet have an account
- Group expenses, balances, and settlements
- Changing a group’s name
- Transferring group ownership
- Recovering a deleted group

## Open questions

- ~~[NEEDS CLARIFICATION: Can any group member add or remove members and delete the group, or are these actions limited to the person who created it?]~~ Answered: Only the person who created the group can add or remove other members or delete the group.
- ~~[NEEDS CLARIFICATION: Does “exact email address” mean capitalization must match the account email exactly?]~~ Answered: Email matching is case insensitive.
- ~~[NEEDS CLARIFICATION: Can a member remove themselves from a group, including when they are its only member?]~~ Answered: Yes, a member can leave a group.
- ~~[NEEDS CLARIFICATION: What happens to a group’s expenses when the group is deleted?]~~ Answered: The group’s recorded expenses are deleted.
- ~~[NEEDS CLARIFICATION: Should a group require a name, and are duplicate group names allowed?]~~ Answered: Duplicate group names are not allowed.

## Done means

- A signed-in member can create a group and see it in their groups.
- A member can view everyone in a group.
- A member can add an account by its exact email address and can see when the account is already a member or cannot be found.
- A member can remove someone from a group and delete the group.
- An empty groups view clearly tells the member that they have no groups.
