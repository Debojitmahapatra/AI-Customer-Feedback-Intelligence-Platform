import { z } from "zod";

export const addMemberSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100),
  email: z.string().trim().email("A valid email address is required.").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters long."),
  role: z.enum(["ANALYST", "VIEWER"], {
    errorMap: () => ({
      message: "Role must be ANALYST or VIEWER.",
    }),
  }),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["ADMIN", "ANALYST", "VIEWER"], {
    errorMap: () => ({
      message: "Role must be ADMIN, ANALYST, or VIEWER.",
    }),
  }),
});

export const validateRequest = (schema, requestBody) => {
  const result = schema.safeParse(requestBody);

  if (!result.success) {
    const error = new Error(result.error.issues[0].message);

    error.statusCode = 400;

    throw error;
  }

  return result.data;
};