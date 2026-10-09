import mongoose from "mongoose";
import AskHistory from "../models/AskHistory.js";

const createHttpError = (message, statusCode) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  return error;
};

const ensureValidHistoryId = (historyId) => {
  if (!mongoose.isValidObjectId(historyId)) {
    throw createHttpError("Invalid Ask LOOP history ID.", 400);
  }
};

const formatHistoryItem = (history) => ({
  id: history._id.toString(),
  question: history.question,
  answer: history.answer,
  citations: history.citations,
  retrievedCount: history.retrievedCount,
  refreshCount: history.refreshCount,
  lastRefreshedAt: history.lastRefreshedAt,
  askedBy: history.askedBy
    ? {
        id: history.askedBy._id.toString(),
        name: history.askedBy.name,
      }
    : null,
  createdAt: history.createdAt,
  updatedAt: history.updatedAt,
});

export const findWorkspaceHistory = async (workspaceId, historyId) => {
  ensureValidHistoryId(historyId);

  const history = await AskHistory.findOne({
    _id: historyId,
    workspaceId,
  });

  if (!history) {
    throw createHttpError("Ask LOOP history was not found.", 404);
  }

  return history;
};

export const saveAskHistory = async ({
  workspaceId,
  userId,
  answerData,
}) => {
  if (answerData.retrievedCount === 0) {
    return null;
  }

  const history = await AskHistory.create({
    workspaceId,
    askedBy: userId,
    question: answerData.question,
    answer: answerData.answer,
    citations: answerData.citations,
    retrievedCount: answerData.retrievedCount,
  });

  await history.populate("askedBy", "name");

  return formatHistoryItem(history);
};

export const getAskHistory = async (workspaceId, { page, limit }) => {
  const skip = (page - 1) * limit;

  const [history, totalItems] = await Promise.all([
    AskHistory.find({ workspaceId })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("askedBy", "name"),
    AskHistory.countDocuments({ workspaceId }),
  ]);

  return {
    history: history.map(formatHistoryItem),
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  };
};

export const refreshAskHistory = async ({
  workspaceId,
  historyId,
  answerData,
}) => {
  const history = await findWorkspaceHistory(workspaceId, historyId);

  /*
   * Preserve the last successful answer when current retrieval has no evidence.
   * The caller can return the no-evidence response without overwriting history.
   */
  if (answerData.retrievedCount === 0) {
    return null;
  }

  history.answer = answerData.answer;
  history.citations = answerData.citations;
  history.retrievedCount = answerData.retrievedCount;
  history.refreshCount += 1;
  history.lastRefreshedAt = new Date();

  await history.save();
  await history.populate("askedBy", "name");

  return formatHistoryItem(history);
};