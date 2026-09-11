const getHealthStatus = () => ({
  success: true,
  message: "LOOP API is running",
  environment: process.env.NODE_ENV || "development",
});

export default getHealthStatus;