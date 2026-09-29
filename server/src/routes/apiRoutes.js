import { Router } from "express";
import healthCheck from "../controllers/healthController.js";
import authRouter from "./authRoutes.js";
import feedbackRouter from "./feedbackRoutes.js";
import workspaceRouter from "./workspaceRoutes.js";

const apiRouter = Router();

apiRouter.get("/health", healthCheck);
apiRouter.use("/auth", authRouter);
apiRouter.use("/workspace", workspaceRouter);
apiRouter.use("/feedback", feedbackRouter);

export default apiRouter;