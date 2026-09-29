import { z } from "zod";

const channels = [
  "SUPPORT",
  "APP_REVIEW",
  "SURVEY",
  "SALES",
  "SOCIAL",
  "COMMUNITY",
  "OTHER",
];


const statuses = ["NEW", "REVIEWED", "ACTIONED"];

const contentSchema = z
  .string()
  .trim()
  .min(1, "Feedback content is required.")
  .max(5000, "Feedback content must not exceed 5000 characters.");

const customerLabelSchema = z
  .string()
  .trim()
  .max(200, "Customer label must not exceed 200 characters.");

export const createFeedbackSchema = z
  .object({
    content: contentSchema,
    channel: z.enum(channels, {
      errorMap: () => ({ message: "A valid feedback channel is required." }),
    }),
    customerLabel: customerLabelSchema.optional(),
  })
  .strict();

export const updateFeedbackSchema = z
  .object({
    content: contentSchema.optional(),
    channel: z
      .enum(channels, {
        errorMap: () => ({ message: "Channel must be valid." }),
      })
      .optional(),
    customerLabel: customerLabelSchema.optional(),
    status: z
      .enum(statuses, {
        errorMap: () => ({ message: "Status must be NEW, REVIEWED, or ACTIONED." }),
      })
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update.",
  });

export const feedbackListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().max(200).optional(),
    channel: z
      .preprocess((val) => (val === "" ? undefined : val), z.enum(channels).optional()),
    status: z
      .preprocess((val) => (val === "" ? undefined : val), z.enum(statuses).optional()),
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