import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import apiRouter from "./routes/apiRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import notFound from "./middleware/notFound.js";
import apiLimiter from "./config/rateLimit.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();


app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);
app.use(express.json());
app.use("/api", apiLimiter, apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;