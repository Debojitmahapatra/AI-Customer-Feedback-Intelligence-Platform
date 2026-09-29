import mongoose from "mongoose";
import Feedback from "../models/Feedback.js";

const createHttpError = (message, statusCode) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  return error;
};

const formatFeedback = (feedback) => ({
  id: feedback._id.toString(),
  content: feedback.content,
  channel: feedback.channel,
  customerLabel: feedback.customerLabel,
  status: feedback.status,
  createdAt: feedback.createdAt,
  updatedAt: feedback.updatedAt,
});

const ensureValidFeedbackId = (feedbackId) => {
  if (!mongoose.isValidObjectId(feedbackId)) {
    throw createHttpError("Invalid feedback ID.", 400);
  }
};

const findWorkspaceFeedback = async (workspaceId, feedbackId) => {
  ensureValidFeedbackId(feedbackId);

  const feedback = await Feedback.findOne({
    _id: feedbackId,
    workspaceId,
  });

  if (!feedback) {
    throw createHttpError("Feedback not found.", 404);
  }

  return feedback;
};

const escapeRegularExpression = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createFeedback = async (workspaceId, feedbackData) => {
  const feedback = await Feedback.create({
    workspaceId,
    content: feedbackData.content,
    channel: feedbackData.channel,
    customerLabel: feedbackData.customerLabel || "",
  });

  return formatFeedback(feedback);
};

export const getFeedback = async (workspaceId, queryOptions) => {
  const { page, limit, search, channel, status } = queryOptions;
  const filter = { workspaceId };

  if (channel) {
    filter.channel = channel;
  }

  if (status) {
    filter.status = status;
  }

  if (search) {
    const safeSearchTerm = escapeRegularExpression(search);

    filter.$or = [
      { content: { $regex: safeSearchTerm, $options: "i" } },
      { customerLabel: { $regex: safeSearchTerm, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [feedback, totalItems] = await Promise.all([
    Feedback.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Feedback.countDocuments(filter),
  ]);

  return {
    feedback: feedback.map(formatFeedback),
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  };
};

export const getFeedbackById = async (workspaceId, feedbackId) => {
  const feedback = await findWorkspaceFeedback(workspaceId, feedbackId);

  return formatFeedback(feedback);
};

export const updateFeedback = async (workspaceId, feedbackId, updates) => {
  const feedback = await findWorkspaceFeedback(workspaceId, feedbackId);

  Object.assign(feedback, updates);
  await feedback.save();

  return formatFeedback(feedback);
};

export const deleteFeedback = async (workspaceId, feedbackId) => {
  const feedback = await findWorkspaceFeedback(workspaceId, feedbackId);

  await feedback.deleteOne();
};