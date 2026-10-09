import { Router } from "express";
import {
  ask,
  getHistory,
  refresh,
} from "../controllers/askLoopController.js";
import authenticate from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const askLoopRouter = Router();

askLoopRouter.use(authenticate);
askLoopRouter.use(authorizeRoles("ADMIN", "ANALYST", "VIEWER"));

askLoopRouter.post("/", ask);
askLoopRouter.get("/history", getHistory);
askLoopRouter.post("/:historyId/refresh", refresh);

export default askLoopRouter;