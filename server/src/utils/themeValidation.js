import { z } from "zod";

const optionalDateSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z
    .string()
    .trim()
    .refine(
      (value) => !Number.isNaN(new Date(value).getTime()),
      "Date must be valid.",
    )
    .transform((value) => new Date(value))
    .optional(),
);

const createDateRangeSchema = (additionalFields = {}) =>
  z
    .object({
      startDate: optionalDateSchema,
      endDate: optionalDateSchema,
      ...additionalFields,
    })
    .refine(
      (data) =>
        !data.startDate || !data.endDate || data.startDate <= data.endDate,
      {
        message: "startDate must be before or equal to endDate.",
      },
    );

export const themeSummaryQuerySchema = createDateRangeSchema({
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const themeTrendsQuerySchema = createDateRangeSchema({
  theme: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().trim().min(1).max(100).optional(),
  ),
  interval: z.enum(["day", "week", "month"]).default("day"),
});

export const themeSpikesQuerySchema = createDateRangeSchema();

export const themeDetailsQuerySchema = createDateRangeSchema({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const themeParamSchema = z.object({
  theme: z.string().trim().min(1, "Theme is required.").max(100),
});

export const validateRequest = (schema, requestData) => {
  const result = schema.safeParse(requestData);

  if (!result.success) {
    const error = new Error(result.error.issues[0].message);

    error.statusCode = 400;

    throw error;
  }

  return result.data;
};