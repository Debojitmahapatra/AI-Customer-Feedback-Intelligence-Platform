import Feedback from "../models/Feedback.js";

const STOP_WORDS = new Set([
  "about",
  "after",
  "again",
  "against",
  "almost",
  "also",
  "among",
  "and",
  "are",
  "because",
  "been",
  "before",
  "being",
  "between",
  "both",
  "but",
  "can",
  "could",
  "customer",
  "customers",
  "did",
  "does",
  "feedback",
  "for",
  "from",
  "have",
  "how",
  "into",
  "issues",
  "main",
  "most",
  "much",
  "not",
  "our",
  "out",
  "should",
  "that",
  "the",
  "their",
  "them",
  "there",
  "these",
  "they",
  "this",
  "those",
  "through",
  "what",
  "when",
  "which",
  "why",
  "with",
  "would",
  "your",
]);

const NEGATIVE_INTENT_PATTERN =
  /\b(angry|bad|complain|crash|error|fail|frustrat|issue|negative|problem|slow|unhappy)\b/i;

const GENERIC_ANALYSIS_PATTERN =
  /\b(complain|issue|negative|problem|trend|increase|most|main|biggest)\b/i;

const escapeRegularExpression = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeText = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractSearchTerms = (question) => {
  const normalizedQuestion = normalizeText(question);

  return [
    ...new Set(
      normalizedQuestion
        .split(" ")
        .filter(
          (word) =>
            word.length >= 3 &&
            !STOP_WORDS.has(word) &&
            !/^\d+$/.test(word),
        ),
    ),
  ].slice(0, 12);
};

const hasNegativeIntent = (question) => NEGATIVE_INTENT_PATTERN.test(question);

const allowsGenericFallback = (question) =>
  GENERIC_ANALYSIS_PATTERN.test(question);

const createKeywordClauses = (searchTerms) =>
  searchTerms.flatMap((term) => {
    const expression = new RegExp(escapeRegularExpression(term), "i");

    return [
      { themes: expression },
      { featureArea: expression },
      { content: expression },
    ];
  });

const formatRetrievedFeedback = (feedback) => ({
  id: feedback._id.toString(),
  content: feedback.content,
  channel: feedback.channel,
  sentiment: feedback.sentiment,
  themes: feedback.themes || [],
  featureArea: feedback.featureArea,
  createdAt: feedback.createdAt,
});

const getRelevanceScore = (feedback, searchTerms, negativeIntent) => {
  const content = normalizeText(feedback.content);
  const themes = (feedback.themes || []).map(normalizeText);
  const featureArea = normalizeText(feedback.featureArea || "");

  let score = 0;

  for (const term of searchTerms) {
    if (themes.some((theme) => theme === term)) {
      score += 10;
    } else if (themes.some((theme) => theme.includes(term))) {
      score += 7;
    }

    if (featureArea === term) {
      score += 8;
    } else if (featureArea.includes(term)) {
      score += 5;
    }

    if (content.includes(term)) {
      score += 3;
    }
  }

  if (negativeIntent && feedback.sentiment === "negative") {
    score += 5;
  }

  if (feedback.aiClassificationStatus === "COMPLETED") {
    score += 1;
  }

  return score;
};

const getCandidateLimit = (limit) => Math.min(Math.max(limit * 5, 30), 100);

const findFeedbackCandidates = async (query, candidateLimit) =>
  Feedback.find(query)
    .select(
      "content channel sentiment themes featureArea createdAt aiClassificationStatus",
    )
    .sort({ createdAt: -1 })
    .limit(candidateLimit)
    .lean();

/*
 * Retrieves a small, relevance-ranked set of feedback records.
 * workspaceId must always come from the authenticated user.
 */
export const retrieveRelevantFeedback = async ({
  workspaceId,
  question,
  limit,
}) => {
  const searchTerms = extractSearchTerms(question);
  const negativeIntent = hasNegativeIntent(question);
  const candidateLimit = getCandidateLimit(limit);

  const baseQuery = {
    workspaceId,
    content: { $exists: true, $ne: "" },
  };

  const keywordClauses = createKeywordClauses(searchTerms);

  let candidates = [];

  if (keywordClauses.length > 0) {
    candidates = await findFeedbackCandidates(
      {
        ...baseQuery,
        $or: keywordClauses,
      },
      candidateLimit,
    );
  }

  /*
   * Generic questions such as "What are the biggest negative issues?"
   * may not share literal words with feedback. In that case, retrieve
   * a small, workspace-scoped set of negative feedback as evidence.
   *
   * Specific questions with no matching terms intentionally return no
   * records, preventing unsupported answers.
   */
  if (candidates.length === 0 && allowsGenericFallback(question)) {
    candidates = await findFeedbackCandidates(
      {
        ...baseQuery,
        ...(negativeIntent ? { sentiment: "negative" } : {}),
      },
      candidateLimit,
    );
  }

  return candidates
    .map((feedback) => ({
      feedback,
      score: getRelevanceScore(feedback, searchTerms, negativeIntent),
    }))
    .sort((firstResult, secondResult) => {
      if (secondResult.score !== firstResult.score) {
        return secondResult.score - firstResult.score;
      }

      return (
        new Date(secondResult.feedback.createdAt) -
        new Date(firstResult.feedback.createdAt)
      );
    })
    .slice(0, limit)
    .map(({ feedback }) => formatRetrievedFeedback(feedback));
};