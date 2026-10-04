import { askLoop } from "../services/askLoopService.js";
import {
  askLoopRequestSchema,
  validateRequest,
} from "../utils/askLoopValidation.js";

export const ask = async (request, response, next) => {
  try {
    const requestData = validateRequest(askLoopRequestSchema, request.body);

    const data = await askLoop({
      workspaceId: request.user.workspaceId,
      ...requestData,
    });

    response.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return next(error);
    }

    console.error("Ask LOOP failed:", error);

    const controlledError = new Error("Unable to generate an answer right now.");

    controlledError.statusCode = 502;

    return next(controlledError);
  }
};