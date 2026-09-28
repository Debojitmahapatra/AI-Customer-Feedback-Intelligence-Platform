import { Router } from "express";
import authenticate from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";
import { changeMemberRole, createMember, deleteMember, getCurrentWorkspace, getMembers,} from "../controllers/workspaceController.js";

const workspaceRouter = Router();

workspaceRouter.use(authenticate);

workspaceRouter.get("/", getCurrentWorkspace);
workspaceRouter.get("/members", getMembers);

workspaceRouter.post("/members", authorizeRoles("ADMIN"), createMember);
workspaceRouter.patch("/members/:userId/role", authorizeRoles("ADMIN"),changeMemberRole,);
workspaceRouter.delete("/members/:userId", authorizeRoles("ADMIN"), deleteMember);

export default workspaceRouter;