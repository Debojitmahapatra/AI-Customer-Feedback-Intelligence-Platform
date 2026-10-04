import { requestAskLoopAnswer } from "./aiProviderService.js";
import { retrieveRelevantFeedback } from "./feedbackRetrievalService.js";
import { askLoopAiResponseSchema } from "../utils/askLoopValidation.js";

const MAX_CONTENT_LENGTH = 1200;

const INSUFFICIENT_EVIDENCE_ANSWER =
  "I couldn't find enough relevant feedback in your workspace to answer that question.";

const createHttpError = (message, statusCode) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  return error;
};

const compactContent = (content) => {
  const normalizedContent = content.replace(/\s+/g, " ").trim();

  if (normalizedContent.length <= MAX_CONTENT_LENGTH) {
    return normalizedContent;
  }

  return `${normalizedContent.slice(0, MAX_CONTENT_LENGTH)}...`;
};

const buildGroundedContext = (feedbackRecords) =>
  feedbackRecords
    .map(
      (feedback, index) => `Feedback ${index + 1}
ID: ${feedback.id}
Date: ${feedback.createdAt.toISOString().slice(0, 10)}
Sentiment: ${feedback.sentiment || "not classified"}
Themes: ${feedback.themes.length > 0 ? feedback.themes.join(", ") : "none"}
Feature area: ${feedback.featureArea || "not identified"}
Channel: ${feedback.channel}
Content: ${compactContent(feedback.content)}`,
    )
    .join("\n\n");

const getValidatedAiAnswer = async (question, feedbackContext) => {
  let lastError;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const rawAiResponse = await requestAskLoopAnswer(
        question,
        feedbackContext,
      );

      const parsedResponse = JSON.parse(rawAiResponse);
      const validationResult = askLoopAiResponseSchema.safeParse(parsedResponse);

      if (!validationResult.success) {
        throw validationResult.error;
      }

      return validationResult.data;
    } catch (error) {
      lastError = error;
    }
  }

  const error = createHttpError("Unable to generate an answer right now.", 502);

  error.cause = lastError;

  throw error;
};

const mapValidatedCitations = (aiCitations, retrievedFeedback) => {
  const feedbackById = new Map(
    retrievedFeedback.map((feedback) => [feedback.id, feedback]),
  );
  const citedFeedbackIds = new Set();

  return aiCitations.flatMap((citation) => {
    const feedback = feedbackById.get(citation.feedbackId);

    if (!feedback || citedFeedbackIds.has(citation.feedbackId)) {
      return [];
    }

    citedFeedbackIds.add(citation.feedbackId);

    return [
      {
        feedbackId: feedback.id,
        reason: citation.reason,
        content: feedback.content,
        sentiment: feedback.sentiment,
        themes: feedback.themes,
        featureArea: feedback.featureArea,
        channel: feedback.channel,
        createdAt: feedback.createdAt,
      },
    ];
  });
};

export const askLoop = async ({ workspaceId, question, limit }) => {
  const retrievedFeedback = await retrieveRelevantFeedback({
    workspaceId,
    question,
    limit,
  });

  if (retrievedFeedback.length === 0) {
    return {
      question,
      answer: INSUFFICIENT_EVIDENCE_ANSWER,
      citations: [],
      retrievedCount: 0,
    };
  }

  const feedbackContext = buildGroundedContext(retrievedFeedback);
  const aiResponse = await getValidatedAiAnswer(question, feedbackContext);
  const citations = mapValidatedCitations(
    aiResponse.citations,
    retrievedFeedback,
  );

  return {
    question,
    answer: aiResponse.answer,
    citations,
    retrievedCount: retrievedFeedback.length,
  };
};