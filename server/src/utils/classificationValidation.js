import { z } from "zod";

export const classificationSchema = z
  .object({
    sentiment: z.enum(["positive", "neutral", "negative"]),
    sentimentScore: z.number().min(-1).max(1),
    themes: z.array(z.string().trim().min(1).max(80)).max(5),
    featureArea: z.string().trim().min(1).max(100).nullable(),
  })
  .strict();