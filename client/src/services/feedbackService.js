import api from "./api.js";

export const createFeedback = async (feedbackData) => {
  const response = await api.post("/feedback", feedbackData);

  return response.data.data.feedback;
};

export const importCsv = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post("/feedback/import/csv", formData);

  return response.data.data;
};

export const createSimulatedFeedback = async (feedbackData) => {
  const response = await api.post("/feedback/simulated", feedbackData);

  return response.data.data.feedback;
};

export const getFeedback = async (queryParameters) => {
  const response = await api.get("/feedback", {
    params: queryParameters,
  });

  return response.data.data;
};

export const getFeedbackById = async (feedbackId) => {
  const response = await api.get(`/feedback/${feedbackId}`);

  return response.data.data.feedback;
};

export const updateFeedback = async (feedbackId, updates) => {
  const response = await api.patch(`/feedback/${feedbackId}`, updates);

  return response.data.data.feedback;
};

export const deleteFeedback = async (feedbackId) => {
  const response = await api.delete(`/feedback/${feedbackId}`);

  return response.data;
};