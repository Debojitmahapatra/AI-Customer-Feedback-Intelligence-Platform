import mongoose from "mongoose";

const themeSummarySchema = new mongoose.Schema(
  {
    theme: { type: String, required: true },
    count: { type: Number, required: true },
    negativeCount: { type: Number, required: true },
    positiveCount: { type: Number, required: true },
    neutralCount: { type: Number, required: true },
    negativePercentage: { type: Number, required: true },
  },
  { _id: false },
);

const narrativeItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 160 },
    description: { type: String, required: true, maxlength: 1000 },
    evidenceFeedbackIds: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
);

const reportSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    dateRange: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    statistics: {
      totalFeedback: { type: Number, required: true },
      sentiment: {
        classifiedCount: { type: Number, required: true },
        unclassifiedCount: { type: Number, required: true },
        positive: {
          count: { type: Number, required: true },
          percentage: { type: Number, required: true },
        },
        neutral: {
          count: { type: Number, required: true },
          percentage: { type: Number, required: true },
        },
        negative: {
          count: { type: Number, required: true },
          percentage: { type: Number, required: true },
        },
      },
      topThemes: {
        type: [themeSummarySchema],
        default: [],
      },
    },
    executiveSummary: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    keyFindings: {
      type: [narrativeItemSchema],
      default: [],
    },
    positiveHighlights: {
      type: [narrativeItemSchema],
      default: [],
    },
    recommendations: {
      type: [narrativeItemSchema],
      default: [],
    },
    limitations: {
      type: [String],
      default: [],
    },
    evidenceFeedbackIds: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

reportSchema.index({ workspaceId: 1, createdAt: -1 });

const Report = mongoose.model("Report", reportSchema);

export default Report;