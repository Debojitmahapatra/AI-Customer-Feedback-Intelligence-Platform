import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const startDateSchema = z
  .string()
  .trim()
  .regex(datePattern, "Start date must use YYYY-MM-DD format.")
  .transform((value) => new Date(`${value}T00:00:00.000Z`));

const endDateSchema = z
  .string()
  .trim()
  .regex(datePattern, "End date must use YYYY-MM-DD format.")
  .transform((value) => new Date(`${value}T23:59:59.999Z`));

const narrativeItemSchema = z
  .object({
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().min(1).max(1000),
    evidenceFeedbackIds: z.array(z.string().trim().min(1)).max(5),
  })
  .strict();

export const reportNarrativeSchema = z
  .object({
    executiveSummary: z.string().trim().min(1).max(2000),
    keyFindings: z.array(narrativeItemSchema).max(6),
    positiveHighlights: z.array(narrativeItemSchema).max(5),
    recommendations: z.array(narrativeItemSchema).max(6),
    limitations: z.array(z.string().trim().min(1).max(500)).max(6),
  })
  .strict();

export const generateReportSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Report title is required.")
      .max(150, "Report title must be at most 150 characters."),
    startDate: startDateSchema,
    endDate: endDateSchema,
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "Start date must be before or equal to end date.",
  });

export const reportListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const reportParamSchema = z.object({
  reportId: z.string().trim().min(1, "Report ID is required."),
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