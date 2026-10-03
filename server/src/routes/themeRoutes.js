import { Router } from "express";
import authenticate from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import {
  getDetails,
  getSpikes,
  getSummary,
  getTrends,
} from "../controllers/themeController.js";

const themeRouter = Router();

themeRouter.use(authenticate);
themeRouter.use(authorizeRoles("ADMIN", "ANALYST", "VIEWER"));

themeRouter.get("/", getSummary);
themeRouter.get("/trends", getTrends);
themeRouter.get("/spikes", getSpikes);
themeRouter.get("/:theme", getDetails);

export default themeRouter;