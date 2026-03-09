# Auth

## Purpose

Handles user authentication via email OTP codes and GitHub OAuth. Provides the login page UI and integrates with `@convex-dev/auth` for session management. The authenticated user is available throughout the app via the `getCurrentUser` query.

## Backend Counterpart

`convex/users/` -- user data queries and mutations.

- `convex/users/queries.ts` -- `getCurrentUser` query (returns user with avatar URL and subscription)
- `convex/users/mutations.ts` -- `deleteCurrentUser` mutation
- `convex/auth.ts` -- auth setup with `@convex-dev/auth`
- `convex/auth.config.ts` -- OAuth provider configuration
- `convex/otp/ResendOTP.ts` -- OTP email delivery via Resend

## Key Files

- `src/features/auth/index.ts` -- barrel export (auth UI lives in route files since it's minimal)
- `src/routes/_app/login/` -- login page route
- `convex/auth.ts` -- auth provider setup
- `convex/auth.config.ts` -- OAuth provider config

## Dependencies

- `@convex-dev/auth` for authentication flow
- `convex/otp/ResendOTP.ts` depends on Resend for email delivery
- `convex/email/` for email template rendering

## Extension Points

- Add OAuth providers in `convex/auth.config.ts`
- Add post-auth hooks in `convex/auth.ts`
- The login page can be extended with additional sign-in methods
