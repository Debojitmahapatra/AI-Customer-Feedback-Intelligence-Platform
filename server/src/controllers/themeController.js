import {
  getThemeDetails,
  getThemeSpikes,
  getThemeSummary,
  getThemeTrends,
} from "../services/themeService.js";
import {
  themeDetailsQuerySchema,
  themeParamSchema,
  themeSpikesQuerySchema,
  themeSummaryQuerySchema,
  themeTrendsQuerySchema,
  validateRequest,
} from "../utils/themeValidation.js";

export const getSummary = async (request, response, next) => {
  try {
    const queryOptions = validateRequest(
      themeSummaryQuerySchema,
      request.query,
    );
    const themes = await getThemeSummary(
      request.user.workspaceId,
      queryOptions,
    );

    response.status(200).json({
      success: true,
      data: themes,
    });
  } catch (error) {
    next(error);
  }
};

export const getTrends = async (request, response, next) => {
  try {
    const queryOptions = validateRequest(
      themeTrendsQuerySchema,
      request.query,
    );
    const trends = await getThemeTrends(
      request.user.workspaceId,
      queryOptions,
    );

    response.status(200).json({
      success: true,
      data: trends,
    });
  } catch (error) {
    next(error);
  }
};

export const getSpikes = async (request, response, next) => {
  try {
    const queryOptions = validateRequest(
      themeSpikesQuerySchema,
      request.query,
    );
    const spikes = await getThemeSpikes(
      request.user.workspaceId,
      queryOptions,
    );

    response.status(200).json({
      success: true,
      data: spikes,
    });
  } catch (error) {
    next(error);
  }
};

export const getDetails = async (request, response, next) => {
  try {
    const { theme } = validateRequest(themeParamSchema, request.params);
    const queryOptions = validateRequest(
      themeDetailsQuerySchema,
      request.query,
    );
    const data = await getThemeDetails(request.user.workspaceId, {
      ...queryOptions,
      theme,
    });

    response.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};