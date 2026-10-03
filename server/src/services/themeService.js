import mongoose from "mongoose";
import Feedback from "../models/Feedback.js";

export const SPIKE_THRESHOLD_PERCENT = 50;
export const MINIMUM_CURRENT_COUNT = 3;

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

const getNormalizedThemeStages = () => [
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
];

const getSummaryGroupStages = () => [
  {
    $group: {
      _id: "$normalizedTheme",
      count: { $sum: 1 },
      positive: {
        $sum: {
          $cond: [{ $eq: ["$sentiment", "positive"] }, 1, 0],
        },
      },
      neutral: {
        $sum: {
          $cond: [{ $eq: ["$sentiment", "neutral"] }, 1, 0],
        },
      },
      negative: {
        $sum: {
          $cond: [{ $eq: ["$sentiment", "negative"] }, 1, 0],
        },
      },
      firstSeen: { $min: "$createdAt" },
      lastSeen: { $max: "$createdAt" },
    },
  },
  {
    $set: {
      negativePercentage: {
        $round: [
          {
            $multiply: [
              {
                $divide: ["$negative", "$count"],
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
      positive: 1,
      neutral: 1,
      negative: 1,
      negativePercentage: 1,
      firstSeen: 1,
      lastSeen: 1,
    },
  },
];

const buildThemeSummaryPipeline = (workspaceId, { startDate, endDate }) => [
  {
    $match: {
      workspaceId: getWorkspaceObjectId(workspaceId),
      ...buildDateMatch(startDate, endDate),
    },
  },
  ...getNormalizedThemeStages(),
  ...getSummaryGroupStages(),
  {
    $sort: {
      count: -1,
      theme: 1,
    },
  },
];

const getAllThemeSummaries = async (workspaceId, dateRange) =>
  Feedback.aggregate(buildThemeSummaryPipeline(workspaceId, dateRange));

const normalizeThemeForLookup = (theme) =>
  theme
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ");

const getTrendDateFormat = (interval) => {
  const formats = {
    day: "%Y-%m-%d",
    week: "%G-W%V",
    month: "%Y-%m",
  };

  return formats[interval];
};

const getCurrentSpikeRange = (startDate, endDate) => {
  if (startDate && endDate) {
    return { startDate, endDate };
  }

  const currentEnd = endDate || new Date();
  const currentStart = startDate || new Date(currentEnd);

  if (!startDate) {
    currentStart.setDate(currentStart.getDate() - 7);
  }

  return {
    startDate: currentStart,
    endDate: currentEnd,
  };
};

const getPreviousComparableRange = (startDate, endDate) => {
  const duration = endDate.getTime() - startDate.getTime();
  const previousEnd = new Date(startDate.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - duration);

  return {
    startDate: previousStart,
    endDate: previousEnd,
  };
};

export const getThemeSummary = async (
  workspaceId,
  { startDate, endDate, limit },
) => {
  const pipeline = buildThemeSummaryPipeline(workspaceId, {
    startDate,
    endDate,
  });

  pipeline.push({
    $limit: limit,
  });

  return Feedback.aggregate(pipeline);
};

export const getThemeTrends = async (
  workspaceId,
  { theme, interval, startDate, endDate },
) => {
  const normalizedTheme = theme ? normalizeThemeForLookup(theme) : null;
  const trendDateFormat = getTrendDateFormat(interval);

  if (!trendDateFormat) {
    throw createHttpError("Interval must be day, week, or month.", 400);
  }

  const pipeline = [
    {
      $match: {
        workspaceId: getWorkspaceObjectId(workspaceId),
        ...buildDateMatch(startDate, endDate),
      },
    },
    ...getNormalizedThemeStages(),
  ];

  if (normalizedTheme) {
    pipeline.push({
      $match: {
        normalizedTheme,
      },
    });
  }

  pipeline.push(
    {
      $group: {
        _id: {
          date: {
            $dateToString: {
              format: trendDateFormat,
              date: "$createdAt",
              timezone: "UTC",
            },
          },
          theme: "$normalizedTheme",
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        date: "$_id.date",
        theme: "$_id.theme",
        count: 1,
      },
    },
    {
      $sort: {
        date: 1,
        theme: 1,
      },
    },
  );

  return Feedback.aggregate(pipeline);
};

export const getThemeSpikes = async (
  workspaceId,
  { startDate, endDate },
) => {
  const currentRange = getCurrentSpikeRange(startDate, endDate);
  const previousRange = getPreviousComparableRange(
    currentRange.startDate,
    currentRange.endDate,
  );

  const [currentThemes, previousThemes] = await Promise.all([
    getAllThemeSummaries(workspaceId, currentRange),
    getAllThemeSummaries(workspaceId, previousRange),
  ]);

  const previousCounts = new Map(
    previousThemes.map((theme) => [theme.theme, theme.count]),
  );

  return currentThemes
    .map((theme) => {
      const previousCount = previousCounts.get(theme.theme) || 0;
      const changePercentage =
        previousCount === 0
          ? null
          : Math.round(((theme.count - previousCount) / previousCount) * 100);

      const isNewThemeSpike =
        previousCount === 0 && theme.count >= MINIMUM_CURRENT_COUNT;
      const isPercentageSpike =
        previousCount > 0 &&
        theme.count >= MINIMUM_CURRENT_COUNT &&
        changePercentage >= SPIKE_THRESHOLD_PERCENT;

      return {
        theme: theme.theme,
        currentCount: theme.count,
        previousCount,
        changePercentage,
        isSpike: isNewThemeSpike || isPercentageSpike,
      };
    })
    .filter((theme) => theme.isSpike)
    .sort((firstTheme, secondTheme) => {
      if (firstTheme.changePercentage === null) {
        return -1;
      }

      if (secondTheme.changePercentage === null) {
        return 1;
      }

      return secondTheme.changePercentage - firstTheme.changePercentage;
    });
};

export const getThemeDetails = async (
  workspaceId,
  { theme, page, limit, startDate, endDate },
) => {
  const normalizedTheme = normalizeThemeForLookup(theme);

  if (!normalizedTheme) {
    throw createHttpError("Theme is required.", 400);
  }

  const summaryPipeline = [
    {
      $match: {
        workspaceId: getWorkspaceObjectId(workspaceId),
        ...buildDateMatch(startDate, endDate),
      },
    },
    ...getNormalizedThemeStages(),
    {
      $match: {
        normalizedTheme,
      },
    },
    ...getSummaryGroupStages(),
  ];

  const [summary] = await Feedback.aggregate(summaryPipeline);

  if (!summary) {
    throw createHttpError("Theme not found.", 404);
  }

  const skip = (page - 1) * limit;

  const feedbackPipeline = [
    {
      $match: {
        workspaceId: getWorkspaceObjectId(workspaceId),
        ...buildDateMatch(startDate, endDate),
      },
    },
    ...getNormalizedThemeStages(),
    {
      $match: {
        normalizedTheme,
      },
    },
    {
      $group: {
        _id: "$_id",
        content: { $first: "$content" },
        channel: { $first: "$channel" },
        customerLabel: { $first: "$customerLabel" },
        status: { $first: "$status" },
        sentiment: { $first: "$sentiment" },
        sentimentScore: { $first: "$sentimentScore" },
        themes: { $first: "$themes" },
        featureArea: { $first: "$featureArea" },
        createdAt: { $first: "$createdAt" },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $facet: {
        items: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 0,
              id: { $toString: "$_id" },
              content: 1,
              channel: 1,
              customerLabel: 1,
              status: 1,
              sentiment: 1,
              sentimentScore: 1,
              themes: 1,
              featureArea: 1,
              createdAt: 1,
            },
          },
        ],
        totalCount: [{ $count: "total" }],
      },
    },
  ];

  const [feedbackResult] = await Feedback.aggregate(feedbackPipeline);
  const total = feedbackResult.totalCount[0]?.total || 0;

  return {
    ...summary,
    feedback: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items: feedbackResult.items,
    },
  };
};