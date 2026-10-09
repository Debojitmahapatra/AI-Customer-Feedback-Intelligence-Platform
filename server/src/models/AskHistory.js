import mongoose from "mongoose";

const citationSchema = new mongoose.Schema(
  {
    feedbackId: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      maxlength: 300,
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative", null],
      default: null,
    },
    themes: {
      type: [String],
      default: [],
    },
    featureArea: {
      type: String,
      default: null,
    },
    channel: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const askHistorySchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    askedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    citations: {
      type: [citationSchema],
      default: [],
    },
    retrievedCount: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },
    refreshCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastRefreshedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

askHistorySchema.index({ workspaceId: 1, updatedAt: -1 });

const AskHistory = mongoose.model("AskHistory", askHistorySchema);

export default AskHistory;