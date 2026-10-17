import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import AskHistory from "../models/AskHistory.js";
import Feedback from "../models/Feedback.js";
import Report from "../models/Report.js";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import {
  DEMO_USER_EMAIL,
  DEMO_USER_PASSWORD,
  DEMO_WORKSPACE_NAME,
  demoFeedback,
} from "../data/demoFeedback.js";
import { demoAskResponses, demoReportNarrative } from "../data/demoAiResponses.js";

const DEMO_PREFIX = "Demo: ";
const DEMO_REPORT_TITLE = "Demo Voice of Customer Report";

const getDemoDate = (daysAgo) => {
  const date = new Date();
  date.setUTCHours(10, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date;
};

const percentage = (count, total) =>
  total === 0 ? 0 : Math.round((count / total) * 10000) / 100;

const buildStatistics = (feedback) => {
  const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
  const themes = new Map();

  feedback.forEach((item) => {
    if (item.sentiment) sentimentCounts[item.sentiment] += 1;

    item.themes.forEach((theme) => {
      const normalized = theme.trim().toLowerCase();
      const summary = themes.get(normalized) || {
        theme: normalized,
        count: 0,
        negativeCount: 0,
        positiveCount: 0,
        neutralCount: 0,
        negativePercentage: 0,
      };

      summary.count += 1;
      if (item.sentiment) summary[`${item.sentiment}Count`] += 1;
      themes.set(normalized, summary);
    });
  });

  const topThemes = [...themes.values()]
    .map((theme) => ({
      ...theme,
      negativePercentage: percentage(theme.negativeCount, theme.count),
    }))
    .sort((a, b) => b.count - a.count || b.negativeCount - a.negativeCount)
    .slice(0, 10);
  const totalFeedback = feedback.length;
  const classifiedCount = Object.values(sentimentCounts).reduce(
    (total, count) => total + count,
    0,
  );

  return {
    totalFeedback,
    sentiment: {
      classifiedCount,
      unclassifiedCount: totalFeedback - classifiedCount,
      positive: {
        count: sentimentCounts.positive,
        percentage: percentage(sentimentCounts.positive, totalFeedback),
      },
      neutral: {
        count: sentimentCounts.neutral,
        percentage: percentage(sentimentCounts.neutral, totalFeedback),
      },
      negative: {
        count: sentimentCounts.negative,
        percentage: percentage(sentimentCounts.negative, totalFeedback),
      },
    },
    topThemes,
  };
};

const buildCitation = (citation, feedbackByKey) => {
  const feedback = feedbackByKey.get(citation.feedbackKey);

  if (!feedback) {
    throw new Error(`Missing seeded feedback for citation key: ${citation.feedbackKey}`);
  }

  return {
    feedbackId: feedback._id.toString(),
    reason: citation.reason,
    content: feedback.content,
    sentiment: feedback.sentiment,
    themes: feedback.themes,
    featureArea: feedback.featureArea,
    channel: feedback.channel,
    createdAt: feedback.createdAt,
  };
};

const mapNarrativeItems = (items, feedbackByKey) =>
  items.map(({ evidenceKeys, ...item }) => ({
    ...item,
    evidenceFeedbackIds: evidenceKeys
      .map((key) => feedbackByKey.get(key)?._id.toString())
      .filter(Boolean),
  }));

const seedDemoData = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required. Configure server/.env before seeding.");
  }

  const email = (process.env.DEMO_USER_EMAIL || DEMO_USER_EMAIL).toLowerCase();
  const password = process.env.DEMO_USER_PASSWORD || DEMO_USER_PASSWORD;
  const created = { workspace: 0, user: 0, feedback: 0, askHistory: 0, report: 0 };

  await mongoose.connect(process.env.MONGO_URI);

  try {
    let workspace = await Workspace.findOne({ name: DEMO_WORKSPACE_NAME });
    if (!workspace) {
      workspace = await Workspace.create({ name: DEMO_WORKSPACE_NAME });
      created.workspace += 1;
    }

    let user = await User.findOne({ email });
    if (user && user.workspaceId.toString() !== workspace._id.toString()) {
      throw new Error(
        `The demo email ${email} belongs to another workspace. Set DEMO_USER_EMAIL to a different address.`,
      );
    }

    if (!user) {
      user = await User.create({
        name: "LOOP Demo Admin",
        email,
        password: await bcrypt.hash(password, 12),
        role: "ADMIN",
        workspaceId: workspace._id,
      });
      created.user += 1;
    }

    for (const item of demoFeedback) {
      const customerLabel = `${DEMO_PREFIX}${item.key}`;
      const exists = await Feedback.exists({ workspaceId: workspace._id, customerLabel });
      if (exists) continue;

      const createdAt = getDemoDate(item.daysAgo);
      await Feedback.create({
        workspaceId: workspace._id,
        content: item.content,
        customerLabel,
        channel: item.channel,
        sourceType: item.sourceType,
        status: item.classification.sentiment === "negative" ? "NEW" : "REVIEWED",
        ...item.classification,
        aiClassifiedAt: createdAt,
        createdAt,
        updatedAt: createdAt,
      });
      created.feedback += 1;
    }

    const seededFeedback = await Feedback.find({
      workspaceId: workspace._id,
      customerLabel: { $regex: `^${DEMO_PREFIX}` },
    });
    const feedbackByKey = new Map(
      seededFeedback.map((item) => [item.customerLabel.slice(DEMO_PREFIX.length), item]),
    );

    for (const item of demoAskResponses) {
      const exists = await AskHistory.exists({
        workspaceId: workspace._id,
        askedBy: user._id,
        question: item.question,
      });
      if (exists) continue;

      await AskHistory.create({
        workspaceId: workspace._id,
        askedBy: user._id,
        question: item.question,
        answer: item.answer,
        citations: item.citations.map((citation) => buildCitation(citation, feedbackByKey)),
        retrievedCount: item.citations.length,
      });
      created.askHistory += 1;
    }

    const reportExists = await Report.exists({ workspaceId: workspace._id, title: DEMO_REPORT_TITLE });
    if (!reportExists) {
      const narrativeSections = [
        ...demoReportNarrative.keyFindings,
        ...demoReportNarrative.positiveHighlights,
        ...demoReportNarrative.recommendations,
      ];
      const evidenceFeedbackIds = [
        ...new Set(
          narrativeSections
            .flatMap(({ evidenceKeys }) => evidenceKeys)
            .map((key) => feedbackByKey.get(key)?._id.toString())
            .filter(Boolean),
        ),
      ];

      await Report.create({
        workspaceId: workspace._id,
        createdBy: user._id,
        title: DEMO_REPORT_TITLE,
        dateRange: { startDate: getDemoDate(90), endDate: new Date() },
        statistics: buildStatistics(seededFeedback),
        executiveSummary: demoReportNarrative.executiveSummary,
        keyFindings: mapNarrativeItems(demoReportNarrative.keyFindings, feedbackByKey),
        positiveHighlights: mapNarrativeItems(
          demoReportNarrative.positiveHighlights,
          feedbackByKey,
        ),
        recommendations: mapNarrativeItems(demoReportNarrative.recommendations, feedbackByKey),
        limitations: demoReportNarrative.limitations,
        evidenceFeedbackIds,
      });
      created.report += 1;
    }

    console.log("Demo seed complete.");
    console.table(created);
    console.log(`Demo login email: ${email}`);
    console.log("Demo password: use DEMO_USER_PASSWORD or the documented default.");
  } finally {
    await mongoose.disconnect();
  }
};

seedDemoData().catch((error) => {
  console.error("Demo seed failed:", error.message);
  process.exitCode = 1;
});
