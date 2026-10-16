import {
  generateAndSaveReport,
  getReportById,
  getReports,
} from "../services/reportService.js";
import {
  generateReportSchema,
  reportListQuerySchema,
  reportParamSchema,
  validateRequest,
} from "../utils/reportValidation.js";
import {
  createReportCsv,
  getReportExportFilename,
} from "../services/reportExportService.js";

const handleGenerationError = (error, next) => {
  if (error.statusCode && error.statusCode < 500) {
    return next(error);
  }

  console.error("VoC report generation failed:", error);

  const controlledError = new Error(
    "Unable to generate the report right now.",
  );

  controlledError.statusCode = 502;

  return next(controlledError);
};

export const generate = async (request, response, next) => {
  try {
    const reportData = validateRequest(generateReportSchema, request.body);

    const report = await generateAndSaveReport({
      workspaceId: request.user.workspaceId,
      userId: request.user.id,
      ...reportData,
    });

    response.status(201).json({
      success: true,
      data: {
        report,
      },
    });
  } catch (error) {
    return handleGenerationError(error, next);
  }
};

export const getList = async (request, response, next) => {
  try {
    const queryOptions = validateRequest(
      reportListQuerySchema,
      request.query,
    );

    const data = await getReports(request.user.workspaceId, queryOptions);

    response.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

export const getById = async (request, response, next) => {
  try {
    const { reportId } = validateRequest(reportParamSchema, request.params);

    const report = await getReportById(
      request.user.workspaceId,
      reportId,
    );

    response.status(200).json({
      success: true,
      data: {
        report,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const exportCsv = async (request, response, next) => {
  try {
    const { reportId } = validateRequest(reportParamSchema, request.params);

    const report = await getReportById(
      request.user.workspaceId,
      reportId,
    );

    const csv = createReportCsv(report);
    const filename = getReportExportFilename(report.id);

    response.setHeader("Content-Type", "text/csv; charset=utf-8");
    response.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`,
    );

    response.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};