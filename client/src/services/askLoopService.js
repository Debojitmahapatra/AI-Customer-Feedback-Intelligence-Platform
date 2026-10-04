import api from "./api.js";

export const askQuestion = async ({ question, limit = 10 }) => {
  const response = await api.post("/ask", {
    question,
    limit,
  });

  return response.data.data;
};