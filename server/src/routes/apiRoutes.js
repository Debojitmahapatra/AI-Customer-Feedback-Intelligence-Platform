import { Router } from "express";
import healthCheck from "../controllers/healthController.js";

const apiRouter = Router();

apiRouter.get("/health", healthCheck);

export default apiRouter;