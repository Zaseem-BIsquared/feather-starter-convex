# Onboarding

## Purpose

Post-signup flow where new users choose a username. The username is validated against the shared Zod schema (`src/shared/schemas/username.ts`) with a max length of 20 characters.

## Backend Counterpart

`convex/onboarding/` -- onboarding mutations.

- `convex/onboarding/mutations.ts` -- `completeOnboarding` mutation (validates username, patches user)

## Key Files

- `src/features/onboarding/components/UsernamePage.tsx` -- username input form
- `src/features/onboarding/index.ts` -- barrel export (`UsernamePage`)
- `src/features/onboarding/onboarding.test.tsx` -- feature tests
- `src/routes/_app/_auth/onboarding/` -- route wrapper

## Dependencies

- `src/shared/schemas/username.ts` -- username validation schema
- `@tanstack/react-form` for form handling

## Extension Points

- Add additional onboarding steps by creating new components and updating the route
- Add more profile fields by extending the `completeOnboarding` mutation args
