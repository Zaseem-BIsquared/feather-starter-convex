import { z } from "zod";

export const TASK_STATUS_VALUES = ["todo", "in_progress", "done"] as const;
export const taskStatus = z.enum(TASK_STATUS_VALUES);
export type TaskStatus = z.infer<typeof taskStatus>;

export const TASK_VISIBILITY_VALUES = ["private", "shared"] as const;
export const taskVisibility = z.enum(TASK_VISIBILITY_VALUES);
export type TaskVisibility = z.infer<typeof taskVisibility>;

export const TASK_TITLE_MAX_LENGTH = 200;
export const taskTitle = z.string().min(1).max(TASK_TITLE_MAX_LENGTH).trim();

export const TASK_DESCRIPTION_MAX_LENGTH = 5000;
export const taskDescription = z
  .string()
  .max(TASK_DESCRIPTION_MAX_LENGTH)
  .optional();

export const createTaskInput = z.object({
  title: taskTitle,
  description: taskDescription,
  priority: z.boolean().default(false),
});

export const updateTaskInput = z.object({
  title: taskTitle.optional(),
  description: taskDescription,
  priority: z.boolean().optional(),
});
