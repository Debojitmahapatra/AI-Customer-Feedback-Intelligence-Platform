import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100),
  email: z.string().trim().email("A valid email address is required.").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters long."),
  workspaceName: z
    .string()
    .trim()
    .min(1, "Workspace name is required.")
    .max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().email("A valid email address is required.").toLowerCase(),
  password: z.string().min(1, "Password is required."),
});