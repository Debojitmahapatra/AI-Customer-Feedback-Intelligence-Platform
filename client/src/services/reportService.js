import api from "./api.js";

export const generateReport = async (reportData) => {
  const response = await api.post("/reports/generate", reportData);

  return response.data.data.report;
};

export const getReports = async ({ page = 1, limit = 10 } = {}) => {
  const response = await api.get("/reports", {
    params: { page, limit },
  });

  return response.data.data;
};

export const getReportById = async (reportId) => {
  const response = await api.get(`/reports/${reportId}`);

  return response.data.data.report;
};

export const downloadReportCsv = async (reportId) => {
  const response = await api.get(`/reports/${reportId}/export`, {
    responseType: "blob",
  });

  return response.data;
};