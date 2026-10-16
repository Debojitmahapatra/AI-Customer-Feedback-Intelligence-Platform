import mongoose from "mongoose";
import Feedback from "../models/Feedback.js";
import { requestVoCReport } from "./aiProviderService.js";
import { reportNarrativeSchema } from "../utils/reportValidation.js";
import Report from "../models/Report.js";

const MAX_THEME_COUNT = 10;
const NEGATIVE_EVIDENCE_LIMIT = 6;
const POSITIVE_EVIDENCE_LIMIT = 4;
const NEUTRAL_EVIDENCE_LIMIT = 2;
const UNCLASSIFIED_EVIDENCE_LIMIT = 2;

const createHttpError = (message, statusCode) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  return error;
};

const getWorkspaceObjectId = (workspaceId) => {
  if (!mongoose.isValidObjectId(workspaceId)) {
    throw createHttpError("Workspace not found.", 404);
  }

  return new mongoose.Types.ObjectId(workspaceId);
};

const buildDateMatch = (startDate, endDate) => {
  const createdAt = {};

  if (startDate) {
    createdAt.$gte = startDate;
  }

  if (endDate) {
    createdAt.$lte = endDate;
  }

  return Object.keys(createdAt).length > 0 ? { createdAt } : {};
};

const calculatePercentage = (count, total) => {
  if (total === 0) {
    return 0;
  }

  return Math.round((count / total) * 10000) / 100;
};

const normalizeSentimentSummary = (sentimentGroups, totalFeedback) => {
  const counts = new Map(
    sentimentGroups.map((group) => [group._id || "unclassified", group.count]),
  );

  const positiveCount = counts.get("positive") || 0;
  const neutralCount = counts.get("neutral") || 0;
  const negativeCount = counts.get("negative") || 0;
  const classifiedCount = positiveCount + neutralCount + negativeCount;
  const unclassifiedCount = totalFeedback - classifiedCount;

  return {
    classifiedCount,
    unclassifiedCount,
    positive: {
      count: positiveCount,
      percentage: calculatePercentage(positiveCount, totalFeedback),
    },
    neutral: {
      count: neutralCount,
      percentage: calculatePercentage(neutralCount, totalFeedback),
    },
    negative: {
      count: negativeCount,
      percentage: calculatePercentage(negativeCount, totalFeedback),
    },
  };
};

const buildThemePipeline = (baseMatch) => [
  {
    $match: baseMatch,
  },
  {
    $match: {
      themes: {
        $exists: true,
        $ne: [],
      },
    },
  },
  {
    $unwind: "$themes",
  },
  {
    $set: {
      normalizedTheme: {
        $trim: {
          input: {
            $toLower: {
              $ifNull: ["$themes", ""],
            },
          },
        },
      },
    },
  },
  {
    $match: {
      normalizedTheme: {
        $ne: "",
      },
    },
  },
  {
    $group: {
      _id: "$normalizedTheme",
      count: {
        $sum: 1,
      },
      negativeCount: {
        $sum: {
          $cond: [{ $eq: ["$sentiment", "negative"] }, 1, 0],
        },
      },
      positiveCount: {
        $sum: {
          $cond: [{ $eq: ["$sentiment", "positive"] }, 1, 0],
        },
      },
      neutralCount: {
        $sum: {
          $cond: [{ $eq: ["$sentiment", "neutral"] }, 1, 0],
        },
      },
    },
  },
  {
    $set: {
      negativePercentage: {
        $round: [
          {
            $multiply: [
              {
                $divide: ["$negativeCount", "$count"],
              },
              100,
            ],
          },
          2,
        ],
      },
    },
  },
  {
    $project: {
      _id: 0,
      theme: "$_id",
      count: 1,
      negativeCount: 1,
      positiveCount: 1,
      neutralCount: 1,
      negativePercentage: 1,
    },
  },
  {
    $sort: {
      count: -1,
      negativeCount: -1,
      theme: 1,
    },
  },
  {
    $limit: MAX_THEME_COUNT,
  },
];

const getRepresentativeFeedback = async (baseMatch) => {
  const projection = {
    _id: 1,
    content: 1,
    sentiment: 1,
    themes: 1,
    featureArea: 1,
    channel: 1,
    createdAt: 1,
  };

  const [negative, positive, neutral, unclassified] = await Promise.all([
    Feedback.find({
      ...baseMatch,
      sentiment: "negative",
    })
      .sort({ createdAt: -1 })
      .limit(NEGATIVE_EVIDENCE_LIMIT)
      .select(projection)
      .lean(),

    Feedback.find({
      ...baseMatch,
      sentiment: "positive",
    })
      .sort({ createdAt: -1 })
      .limit(POSITIVE_EVIDENCE_LIMIT)
      .select(projection)
      .lean(),

    Feedback.find({
      ...baseMatch,
      sentiment: "neutral",
    })
      .sort({ createdAt: -1 })
      .limit(NEUTRAL_EVIDENCE_LIMIT)
      .select(projection)
      .lean(),

    Feedback.find({
      ...baseMatch,
      sentiment: null,
    })
      .sort({ createdAt: -1 })
      .limit(UNCLASSIFIED_EVIDENCE_LIMIT)
      .select(projection)
      .lean(),
  ]);

  return [...negative, ...positive, ...neutral, ...unclassified].map(
    (feedback) => ({
      id: feedback._id.toString(),
      content: feedback.content,
      sentiment: feedback.sentiment,
      themes: feedback.themes || [],
      featureArea: feedback.featureArea,
      channel: feedback.channel,
      createdAt: feedback.createdAt,
    }),
  );
};

const buildLimitations = ({
  totalFeedback,
  classifiedCount,
  unclassifiedCount,
  topThemes,
}) => {
  const limitations = [];

  if (totalFeedback === 0) {
    limitations.push("No feedback was found for the selected date range.");
  } else if (totalFeedback < 5) {
    limitations.push(
      "This report is based on a small feedback sample, so patterns may not represent all customers.",
    );
  }

  if (unclassifiedCount > 0) {
    limitations.push(
      `${unclassifiedCount} feedback item${unclassifiedCount === 1 ? "" : "s"} ha${unclassifiedCount === 1 ? "s" : "ve"} not been classified, so sentiment insights may be incomplete.`,
    );
  }

  if (classifiedCount === 0 && totalFeedback > 0) {
    limitations.push(
      "No feedback in this date range has sentiment classification data.",
    );
  }

  if (topThemes.length === 0 && totalFeedback > 0) {
    limitations.push(
      "No feedback themes were available, so theme-based insights are limited.",
    );
  }

  return limitations;
};

export const prepareReportData = async ({
  workspaceId,
  startDate,
  endDate,
}) => {
  const baseMatch = {
    workspaceId: getWorkspaceObjectId(workspaceId),
    ...buildDateMatch(startDate, endDate),
  };

  const [summaryResult, topThemes, evidenceFeedback] = await Promise.all([
    Feedback.aggregate([
      {
        $match: baseMatch,
      },
      {
        $facet: {
          total: [
            {
              $count: "count",
            },
          ],
          sentiments: [
            {
              $group: {
                _id: "$sentiment",
                count: {
                  $sum: 1,
                },
              },
            },
          ],
        },
      },
    ]),
    Feedback.aggregate(buildThemePipeline(baseMatch)),
    getRepresentativeFeedback(baseMatch),
  ]);

  const summary = summaryResult[0];
  const totalFeedback = summary.total[0]?.count || 0;
  const sentiment = normalizeSentimentSummary(
    summary.sentiments,
    totalFeedback,
  );

  const statistics = {
    totalFeedback,
    sentiment,
    topThemes,
  };

  return {
    dateRange: {
      startDate: startDate || null,
      endDate: endDate || null,
    },
    statistics,
    evidenceFeedback,
    limitations: buildLimitations({
      totalFeedback,
      classifiedCount: sentiment.classifiedCount,
      unclassifiedCount: sentiment.unclassifiedCount,
      topThemes,
    }),
  };
};

const MAX_EVIDENCE_CONTENT_LENGTH = 900;

const createReportGenerationError = (cause) => {
  const error = new Error("Unable to generate the report right now.");

  error.statusCode = 502;
  error.cause = cause;

  return error;
};

const compactEvidenceContent = (content) => {
  const normalizedContent = content.replace(/\s+/g, " ").trim();

  if (normalizedContent.length <= MAX_EVIDENCE_CONTENT_LENGTH) {
    return normalizedContent;
  }

  return `${normalizedContent.slice(0, MAX_EVIDENCE_CONTENT_LENGTH)}...`;
};

const buildReportEvidenceContext = (reportData) =>
  JSON.stringify(
    {
      dateRange: {
        startDate: reportData.dateRange.startDate?.toISOString() || null,
        endDate: reportData.dateRange.endDate?.toISOString() || null,
      },
      calculatedStatistics: reportData.statistics,
      backendLimitations: reportData.limitations,
      feedbackEvidence: reportData.evidenceFeedback.map((feedback) => ({
        id: feedback.id,
        createdAt: feedback.createdAt.toISOString(),
        sentiment: feedback.sentiment || "not classified",
        themes: feedback.themes,
        featureArea: feedback.featureArea || "not identified",
        channel: feedback.channel,
        content: compactEvidenceContent(feedback.content),
      })),
    },
    null,
    2,
  );

const filterVerifiedEvidenceIds = (items, validFeedbackIds) =>
  items
    .map((item) => ({
      ...item,
      evidenceFeedbackIds: [
        ...new Set(
          item.evidenceFeedbackIds.filter((feedbackId) =>
            validFeedbackIds.has(feedbackId),
          ),
        ),
      ],
    }))
    .filter((item) => item.evidenceFeedbackIds.length > 0);

const validateNarrativeEvidence = (narrative, reportData) => {
  const validFeedbackIds = new Set(
    reportData.evidenceFeedback.map((feedback) => feedback.id),
  );

  const limitations = [
    ...new Set([...reportData.limitations, ...narrative.limitations]),
  ].slice(0, 6);

  return {
    executiveSummary: narrative.executiveSummary,
    keyFindings: filterVerifiedEvidenceIds(
      narrative.keyFindings,
      validFeedbackIds,
    ),
    positiveHighlights: filterVerifiedEvidenceIds(
      narrative.positiveHighlights,
      validFeedbackIds,
    ),
    recommendations: filterVerifiedEvidenceIds(
      narrative.recommendations,
      validFeedbackIds,
    ),
    limitations,
  };
};

const getValidatedReportNarrative = async (reportData) => {
  const reportContext = buildReportEvidenceContext(reportData);
  let lastError;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const rawResponse = await requestVoCReport(reportContext);
      const parsedResponse = JSON.parse(rawResponse);
      const validationResult = reportNarrativeSchema.safeParse(parsedResponse);

      if (!validationResult.success) {
        throw validationResult.error;
      }

      return validateNarrativeEvidence(validationResult.data, reportData);
    } catch (error) {
      lastError = error;
    }
  }

  throw createReportGenerationError(lastError);
};

const createEmptyReportNarrative = (limitations) => ({
  executiveSummary:
    "No feedback was found for the selected date range, so no evidence-based customer insights could be generated.",
  keyFindings: [],
  positiveHighlights: [],
  recommendations: [],
  limitations,
});

export const generateReportNarrative = async (reportData) => {
  if (reportData.statistics.totalFeedback === 0) {
    return createEmptyReportNarrative(reportData.limitations);
  }

  return getValidatedReportNarrative(reportData);
};

const ensureValidReportId = (reportId) => {
  if (!mongoose.isValidObjectId(reportId)) {
    throw createHttpError("Invalid report ID.", 400);
  }
};

const collectEvidenceFeedbackIds = (narrative) =>
  [
    ...narrative.keyFindings,
    ...narrative.positiveHighlights,
    ...narrative.recommendations,
  ].flatMap((item) => item.evidenceFeedbackIds);

const formatReportListItem = (report) => ({
  id: report._id.toString(),
  title: report.title,
  dateRange: report.dateRange,
  totalFeedback: report.statistics.totalFeedback,
  createdAt: report.createdAt,
  createdBy: report.createdBy
    ? {
        id: report.createdBy._id.toString(),
        name: report.createdBy.name,
      }
    : null,
});

const formatReport = (report) => ({
  id: report._id.toString(),
  title: report.title,
  dateRange: report.dateRange,
  statistics: report.statistics,
  executiveSummary: report.executiveSummary,
  keyFindings: report.keyFindings,
  positiveHighlights: report.positiveHighlights,
  recommendations: report.recommendations,
  limitations: report.limitations,
  evidenceFeedbackIds: report.evidenceFeedbackIds,
  createdAt: report.createdAt,
  updatedAt: report.updatedAt,
  createdBy: report.createdBy
    ? {
        id: report.createdBy._id.toString(),
        name: report.createdBy.name,
      }
    : null,
});

export const generateAndSaveReport = async ({
  workspaceId,
  userId,
  title,
  startDate,
  endDate,
}) => {
  const reportData = await prepareReportData({
    workspaceId,
    startDate,
    endDate,
  });

  if (reportData.statistics.totalFeedback === 0) {
    throw createHttpError(
      "No feedback was found for the selected date range.",
      422,
    );
  }

  const narrative = await generateReportNarrative(reportData);
  const evidenceFeedbackIds = [
    ...new Set(collectEvidenceFeedbackIds(narrative)),
  ];

  const report = await Report.create({
    workspaceId,
    createdBy: userId,
    title,
    dateRange: reportData.dateRange,
    statistics: reportData.statistics,
    executiveSummary: narrative.executiveSummary,
    keyFindings: narrative.keyFindings,
    positiveHighlights: narrative.positiveHighlights,
    recommendations: narrative.recommendations,
    limitations: narrative.limitations,
    evidenceFeedbackIds,
  });

  await report.populate("createdBy", "name");

  return formatReport(report);
};

export const getReports = async (workspaceId, { page, limit }) => {
  const skip = (page - 1) * limit;

  const [reports, totalItems] = await Promise.all([
    Report.find({ workspaceId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name"),
    Report.countDocuments({ workspaceId }),
  ]);

  return {
    reports: reports.map(formatReportListItem),
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  };
};

export const getReportById = async (workspaceId, reportId) => {
  ensureValidReportId(reportId);

  const report = await Report.findOne({
    _id: reportId,
    workspaceId,
  }).populate("createdBy", "name");

  if (!report) {
    throw createHttpError("Report not found.", 404);
  }

  return formatReport(report);
};