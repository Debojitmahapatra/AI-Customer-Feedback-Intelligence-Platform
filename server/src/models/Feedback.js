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
      default: null,
    },
    sentimentScore: {
      type: Number,
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
  },
  {
    timestamps: true,
  },
);

feedbackSchema.index({ workspaceId: 1, createdAt: -1 });
feedbackSchema.index({ workspaceId: 1, status: 1 });
feedbackSchema.index({ workspaceId: 1, channel: 1 });

const Feedback = mongoose.model("Feedback", feedbackSchema);

export { channels, sourceTypes, statuses };
export default Feedback;