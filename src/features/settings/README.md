# Settings

## Purpose

User profile settings page with general settings (username, avatar) and a billing tab (current plan, cancellation). Uses TanStack Form with Zod validation for the username field and `@xixixao/uploadstuff` for avatar uploads.

## Backend Counterpart

`convex/users/` -- user profile mutations.

- `convex/users/mutations.ts` -- `updateUsername`, `updateUserImage`, `deleteCurrentUser`
- `convex/users/queries.ts` -- `getCurrentUser` (provides current profile data)
- `convex/uploads/mutations.ts` -- `generateUploadUrl` (for avatar upload)

## Key Files

- `src/features/settings/components/SettingsPage.tsx` -- settings page with username form, avatar upload, account deletion
- `src/features/settings/index.ts` -- barrel export (`SettingsPage`)
- `src/features/settings/settings.test.tsx` -- feature tests
- `src/routes/_app/_auth/dashboard/_layout.settings.tsx` -- settings layout route
- `src/routes/_app/_auth/dashboard/_layout.settings.index.tsx` -- general settings tab
- `src/routes/_app/_auth/dashboard/_layout.settings.billing.tsx` -- billing tab

## Dependencies

- `src/shared/schemas/username.ts` -- username validation schema
- `src/features/billing/components/BillingSettings.tsx` -- billing tab content
- `@tanstack/react-form` for form handling
- `@xixixao/uploadstuff` for avatar upload
- `react-i18next` for translations (`settings` namespace)

## Extension Points

- Add new settings tabs by creating new route files under `_layout.settings.*.tsx`
- Add profile fields by extending `SettingsPage.tsx` and the `updateUsername` mutation
- The billing tab is a separate component (`BillingSettings`) that can be replaced or extended
