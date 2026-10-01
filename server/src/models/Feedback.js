import mongoose from "mongoose";

const channels = [
  "SUPPORT",
  "APP_REVIEW",
  "SURVEY",
  "SALES",
  "SOCIAL",
  "COMMUNITY",
  "OTHER",
];

const statuses = ["NEW", "REVIEWED", "ACTIONED"];
const sourceTypes = ["MANUAL", "CSV", "SIMULATED"];
const classificationStatuses = ["PENDING", "COMPLETED", "FAILED"];

const feedbackSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    channel: {
      type: String,
      required: true,
      enum: channels,
    },
    customerLabel: {
      type: String,
      trim: true,
      default: "",
      maxlength: 200,
    },
    status: {
      type: String,
      enum: statuses,
      default: "NEW",
    },
    sourceType: {
      type: String,
      enum: sourceTypes,
      default: "MANUAL",
    },
    sentiment: {
      type: String,
      enum: ["positive", "neutral", "negative"],
      default: null,
    },
    sentimentScore: {
      type: Number,
      min: -1,
      max: 1,
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
    aiClassificationStatus: {
      type: String,
      enum: classificationStatuses,
      default: "PENDING",
    },
    aiClassifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

feedbackSchema.index({ workspaceId: 1, createdAt: -1 });
feedbackSchema.index({ workspaceId: 1, status: 1 });
feedbackSchema.index({ workspaceId: 1, channel: 1 });

const Feedback = mongoose.model("Feedback", feedbackSchema);

export { channels, classificationStatuses, sourceTypes, statuses };
export default Feedback;