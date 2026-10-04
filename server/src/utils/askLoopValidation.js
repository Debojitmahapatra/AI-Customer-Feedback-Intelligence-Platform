import { z } from "zod";

export const askLoopRequestSchema = z
  .object({
    question: z
      .string()
      .trim()
      .min(1, "Question is required.")
      .max(500, "Question must be at most 500 characters."),
    limit: z.coerce.number().int().min(1).max(20).default(10),
  })
  .strict();

export const askLoopAiResponseSchema = z
  .object({
    answer: z.string().trim().min(1).max(3000),
    citations: z
      .array(
        z
          .object({
            feedbackId: z.string().trim().min(1),
            reason: z.string().trim().min(1).max(300),
          })
          .strict(),
      )
      .max(10),
  })
  .strict();

export const validateRequest = (schema, requestData) => {
  const result = schema.safeParse(requestData);

  if (!result.success) {
    const error = new Error(result.error.issues[0].message);

    error.statusCode = 400;

    throw error;
  }

  return result.data;
};