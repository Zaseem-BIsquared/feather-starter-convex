# Uploads

## Purpose

File upload functionality using Convex's built-in storage system. Currently provides avatar upload for user profiles, integrated into the settings feature. Uses `@xixixao/uploadstuff` for the upload UI component and Convex storage for file persistence.

## Backend Counterpart

`convex/uploads/` -- file upload mutations.

- `convex/uploads/mutations.ts` -- `generateUploadUrl` mutation (creates a signed upload URL for Convex storage)

## Key Files

- `src/features/uploads/index.ts` -- barrel export (skeleton -- upload UI is embedded in settings)
- `convex/uploads/mutations.ts` -- upload URL generation
- `convex/uploads/mutations.test.ts` -- backend tests

## Dependencies

- `@xixixao/uploadstuff` for React upload components
- Convex storage (`ctx.storage`) for file persistence
- `convex/users/mutations.ts` -- `updateUserImage` uses the uploaded file ID

## Extension Points

- Add new upload types by creating additional mutations in `convex/uploads/mutations.ts`
- Create a dedicated upload component in `src/features/uploads/components/` for reuse across features
- Add file type validation, size limits, or image processing in the upload mutation
