import { Router } from "express";
import { ask } from "../controllers/askLoopController.js";
import authenticate from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const askLoopRouter = Router();

askLoopRouter.use(authenticate);
askLoopRouter.use(authorizeRoles("ADMIN", "ANALYST", "VIEWER"));

askLoopRouter.post("/", ask);

export default askLoopRouter;