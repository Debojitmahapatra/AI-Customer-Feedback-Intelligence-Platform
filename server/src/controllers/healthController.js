import getHealthStatus from "../services/healthService.js";

const healthCheck = (_request, response) => {
  response.status(200).json(getHealthStatus());
};

export default healthCheck;