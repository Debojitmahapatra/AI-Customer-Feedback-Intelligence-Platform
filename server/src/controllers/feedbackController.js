import {
  createFeedback,
  createSimulatedFeedback,
  deleteFeedback,
  getFeedback,
  getFeedbackById,
  updateFeedback,
} from "../services/feedbackService.js";
import { importCsvFeedback } from "../services/feedbackImportService.js";
import {
  createFeedbackSchema,
  feedbackListQuerySchema,
  updateFeedbackSchema,
  validateRequest,
} from "../utils/feedbackValidation.js";

export const create = async (request, response, next) => {
  try {
    const feedbackData = validateRequest(createFeedbackSchema, request.body);
    const feedback = await createFeedback(request.user.workspaceId, feedbackData);

    response.status(201).json({
      success: true,
      message: "Feedback created successfully",
      data: { feedback },
    });
  } catch (error) {
    next(error);
  }
};

export const importCsv = async (request, response, next) => {
  try {
    const data = await importCsvFeedback(request.user.workspaceId, request.file);

    response.status(200).json({
      success: true,
      message: "CSV import completed",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const createSimulated = async (request, response, next) => {
  try {
    const feedbackData = validateRequest(createFeedbackSchema, request.body);
    const feedback = await createSimulatedFeedback(
      request.user.workspaceId,
      feedbackData,
    );

    response.status(201).json({
      success: true,
      message: "Simulated feedback received successfully",
      data: { feedback },
    });
  } catch (error) {
    next(error);
  }
};

export const getList = async (request, response, next) => {
  try {
    const queryOptions = validateRequest(feedbackListQuerySchema, request.query);
    const data = await getFeedback(request.user.workspaceId, queryOptions);

    response.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (request, response, next) => {
  try {
    const feedback = await getFeedbackById(
      request.user.workspaceId,
      request.params.feedbackId,
    );

    response.status(200).json({
      success: true,
      data: { feedback },
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (request, response, next) => {
  try {
    const updates = validateRequest(updateFeedbackSchema, request.body);
    const feedback = await updateFeedback(
      request.user.workspaceId,
      request.params.feedbackId,
      updates,
    );

    response.status(200).json({
      success: true,
      message: "Feedback updated successfully",
      data: { feedback },
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (request, response, next) => {
  try {
    await deleteFeedback(request.user.workspaceId, request.params.feedbackId);

    response.status(200).json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};