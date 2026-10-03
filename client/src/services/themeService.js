import api from "./api.js";

export const getThemeSummary = async (filters = {}) => {
  const response = await api.get("/themes", {
    params: filters,
  });

  return response.data.data;
};

export const getThemeTrends = async (filters = {}) => {
  const response = await api.get("/themes/trends", {
    params: filters,
  });

  return response.data.data;
};

export const getThemeSpikes = async (filters = {}) => {
  const response = await api.get("/themes/spikes", {
    params: filters,
  });

  return response.data.data;
};

export const getThemeDetails = async (theme, filters = {}) => {
  const response = await api.get(`/themes/${encodeURIComponent(theme)}`, {
    params: filters,
  });

  return response.data.data;
};