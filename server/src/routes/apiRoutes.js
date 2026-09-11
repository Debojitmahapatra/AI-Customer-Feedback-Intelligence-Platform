import { Router } from "express";
import healthCheck from "../controllers/healthController.js";
import authRouter from "./authRoutes.js";

const apiRouter = Router();

apiRouter.get("/health", healthCheck);
apiRouter.use("/auth", authRouter);

export default apiRouter;