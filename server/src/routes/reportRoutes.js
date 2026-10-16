import { Router } from "express";
import {
  generate,
  getById,
  getList,
  exportCsv,
} from "../controllers/reportController.js";
import authenticate from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const reportRouter = Router();

reportRouter.use(authenticate);

reportRouter.post(
  "/generate",
  authorizeRoles("ADMIN", "ANALYST"),
  generate,
);

reportRouter.get(
  "/",
  authorizeRoles("ADMIN", "ANALYST", "VIEWER"),
  getList,
);

reportRouter.get(
  "/:reportId",
  authorizeRoles("ADMIN", "ANALYST", "VIEWER"),
  getById,
);

reportRouter.get(
  "/:reportId/export",
  authorizeRoles("ADMIN", "ANALYST", "VIEWER"),
  exportCsv,
);

export default reportRouter;