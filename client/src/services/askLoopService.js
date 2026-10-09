import api from "./api.js";

export const askQuestion = async ({ question, limit = 10 }) => {
  const response = await api.post("/ask", {
    question,
    limit,
  });

  return response.data.data;
};

export const getAskHistory = async ({ page = 1, limit = 10 } = {}) => {
  const response = await api.get("/ask/history", {
    params: {
      page,
      limit,
    },
  });

  return response.data.data;
};

export const refreshAskHistory = async (historyId) => {
  const response = await api.post(`/ask/${historyId}/refresh`);

  return response.data.data;
};