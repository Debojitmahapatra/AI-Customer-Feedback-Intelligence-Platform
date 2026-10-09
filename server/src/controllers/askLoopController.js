import {
  findWorkspaceHistory,
  getAskHistory,
  refreshAskHistory,
  saveAskHistory,
} from "../services/askHistoryService.js";
import { askLoop } from "../services/askLoopService.js";
import {
  askHistoryParamSchema,
  askHistoryQuerySchema,
  askLoopRequestSchema,
  validateRequest,
} from "../utils/askLoopValidation.js";

const handleAskError = (error, next) => {
  if (error.statusCode && error.statusCode < 500) {
    return next(error);
  }

  console.error("Ask LOOP failed:", error);

  const controlledError = new Error("Unable to generate an answer right now.");

  controlledError.statusCode = 502;

  return next(controlledError);
};

export const ask = async (request, response, next) => {
  try {
    const requestData = validateRequest(askLoopRequestSchema, request.body);

    const data = await askLoop({
      workspaceId: request.user.workspaceId,
      ...requestData,
    });

    const savedHistory = await saveAskHistory({
      workspaceId: request.user.workspaceId,
      userId: request.user.id,
      answerData: data,
    });

    response.status(200).json({
      success: true,
      data: {
        ...data,
        historyId: savedHistory?.id || null,
      },
    });
  } catch (error) {
    return handleAskError(error, next);
  }
};

export const getHistory = async (request, response, next) => {
  try {
    const queryOptions = validateRequest(
      askHistoryQuerySchema,
      request.query,
    );

    const data = await getAskHistory(
      request.user.workspaceId,
      queryOptions,
    );

    response.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

export const refresh = async (request, response, next) => {
  try {
    const { historyId } = validateRequest(
      askHistoryParamSchema,
      request.params,
    );

    const history = await findWorkspaceHistory(
      request.user.workspaceId,
      historyId,
    );

    const data = await askLoop({
      workspaceId: request.user.workspaceId,
      question: history.question,
      limit: 10,
    });

    const refreshedHistory = await refreshAskHistory({
      workspaceId: request.user.workspaceId,
      historyId,
      answerData: data,
    });

    response.status(200).json({
      success: true,
      data: {
        ...data,
        history: refreshedHistory,
        historyId,
      },
    });
  } catch (error) {
    return handleAskError(error, next);
  }
};