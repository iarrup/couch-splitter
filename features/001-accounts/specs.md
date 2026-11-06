## User story

As a person who shares costs with people I trust, I want my own couch-splitter account so that my groups, expenses, balances, and settlements are private to me and remain available when I return.

## Acceptance criteria

### AC-1

Given I do not have an account
When I provide my display name, an unused email address, and a password of at least 10 characters
Then my account is created and I can enter couch-splitter without confirming my email address

### AC-2

Given I do not have an account
When I provide a password shorter than 10 characters
Then my account is not created and I am told the minimum password length is 10 characters

### AC-3

Given I do not have an account
When I provide a password of at least 10 characters with any combination of characters
Then the password is accepted without any other complexity rule

### AC-4

Given an account already uses my chosen display name
When I create an account with that display name and a different email address
Then my account is created with the same display name

### AC-5

Given an account already uses an email address
When I try to create another account with that email address using any capitalization
Then my account is not created because the email address is already in use

### AC-6

Given I already have an account
When I provide the correct email address and password
Then I enter couch-splitter as myself

### AC-7

Given I am signed out
When I try to sign in with either an unknown email address or a wrong password
Then both attempts show the identical message, leave me signed out, and do not reveal whether the email address has an account

### AC-8

Given I am signed in
When I choose to sign out
Then I leave my account and cannot view my private information without signing in again

### AC-9

Given I signed in and used couch-splitter less than 30 days ago
When I return to couch-splitter
Then I remain signed in as myself

### AC-10

Given I have not used couch-splitter for 30 days
When I return to couch-splitter
Then I must sign in again

## Out of scope

- Changing or recovering a forgotten password
- Closing an account
- Signing in through another service
- Changing an email address or display name

## Open questions

- ~~Answered: The minimum password length is 10 characters, with no other complexity rules.~~
- ~~Answered: Someone stays signed in until they have not used couch-splitter for 30 days.~~
- ~~Answered: Two people may share a display name.~~
- ~~Answered: A wrong password and an unknown email address produce the identical message and reveal nothing about whether an account exists.~~
- ~~Answered: Someone does not need to confirm their email address before entering couch-splitter.~~

## Done means

Every open question has an agreed answer, every acceptance criterion reflects those answers, and each criterion has been demonstrated from a person's point of view.
