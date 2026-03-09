export const ERRORS = {
  auth: {
    EMAIL_NOT_SENT: "Unable to send email.",
    USER_NOT_CREATED: "Unable to create user.",
    SOMETHING_WENT_WRONG:
      "Something went wrong while trying to authenticate.",
  },
  onboarding: {
    USERNAME_ALREADY_EXISTS: "Username already exists.",
    SOMETHING_WENT_WRONG:
      "Something went wrong while trying to onboard.",
  },
  common: {
    UNKNOWN: "Unknown error.",
    ENVS_NOT_INITIALIZED: "Environment variables not initialized.",
    SOMETHING_WENT_WRONG: "Something went wrong.",
  },
  admin: {
    UNAUTHORIZED: "You do not have admin privileges.",
    USER_NOT_FOUND: "User not found.",
    CANNOT_MODIFY_SELF: "Cannot modify your own account from admin panel.",
    SOMETHING_WENT_WRONG: "Something went wrong in admin panel.",
  },
} as const;
