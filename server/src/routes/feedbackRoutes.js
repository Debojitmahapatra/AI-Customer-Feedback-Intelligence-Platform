import { Router } from "express";
import authenticate from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import {create, getById, getList, remove, update} from "../controllers/feedbackController.js";

const feedbackRouter = Router();

feedbackRouter.use(authenticate);

feedbackRouter.get("/", getList);
feedbackRouter.get("/:feedbackId", getById);

feedbackRouter.post("/", authorizeRoles("ADMIN", "ANALYST"), create);
feedbackRouter.patch("/:feedbackId",authorizeRoles("ADMIN", "ANALYST"),update);
feedbackRouter.delete("/:feedbackId",authorizeRoles("ADMIN", "ANALYST"),remove);

export default feedbackRouter;