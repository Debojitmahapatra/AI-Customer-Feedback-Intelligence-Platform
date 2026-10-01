import { Router } from "express";
import authenticate from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import {
  create,
  createSimulated,
  getById,
  getList,
  importCsv,
  reclassify,
  remove,
  update,
} from "../controllers/feedbackController.js";
import { uploadCsv } from "../middleware/uploadMiddleware.js";

const feedbackRouter = Router();

feedbackRouter.use(authenticate);

feedbackRouter.get("/", getList);
feedbackRouter.get("/:feedbackId", getById);

feedbackRouter.post("/", authorizeRoles("ADMIN", "ANALYST"), create);
feedbackRouter.post(
  "/import/csv",
  authorizeRoles("ADMIN", "ANALYST"),
  uploadCsv,
  importCsv,
);
feedbackRouter.post(
  "/simulated",
  authorizeRoles("ADMIN", "ANALYST"),
  createSimulated,
);
feedbackRouter.post(
  "/:feedbackId/reclassify",
  authorizeRoles("ADMIN", "ANALYST"),
  reclassify,
);
feedbackRouter.patch(
  "/:feedbackId",
  authorizeRoles("ADMIN", "ANALYST"),
  update,
);
feedbackRouter.delete(
  "/:feedbackId",
  authorizeRoles("ADMIN", "ANALYST"),
  remove,
);

export default feedbackRouter;