import { z } from "zod";

export const USERNAME_MAX_LENGTH = 20;

export const username = z
  .string()
  .min(3)
  .max(USERNAME_MAX_LENGTH)
  .toLowerCase()
  .trim()
  .regex(
    /^[a-zA-Z0-9]+$/,
    "Username may only contain alphanumeric characters.",
  );
