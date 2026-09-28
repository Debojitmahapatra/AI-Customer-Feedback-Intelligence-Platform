import { addMember, getWorkspace, getWorkspaceMembers, removeMember, updateMemberRole} from "../services/workspaceService.js";
import { addMemberSchema, updateMemberRoleSchema, validateRequest } from "../utils/workspaceValidation.js";

export const getCurrentWorkspace = async (request, response, next) => {
  try {
    const workspace = await getWorkspace(request.user.workspaceId);

    response.status(200).json({
      success: true,
      data: { workspace },
    });
  } catch (error) {
    next(error);
  }
};

export const getMembers = async (request, response, next) => {
  try {
    const members = await getWorkspaceMembers(request.user.workspaceId);

    response.status(200).json({
      success: true,
      data: { members },
    });
  } catch (error) {
    next(error);
  }
};

export const createMember = async (request, response, next) => {
  try {
    const memberData = validateRequest(addMemberSchema, request.body);
    const member = await addMember(request.user.workspaceId, memberData);

    response.status(201).json({
      success: true,
      message: "Member added successfully",
      data: { member },
    });
  } catch (error) {
    next(error);
  }
};

export const changeMemberRole = async (request, response, next) => {
  try {
    const { role } = validateRequest(updateMemberRoleSchema, request.body);
    const member = await updateMemberRole(
      request.user.workspaceId,
      request.params.userId,
      role,
    );

    response.status(200).json({
      success: true,
      message: "Member role updated successfully",
      data: { member },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMember = async (request, response, next) => {
  try {
    await removeMember(
      request.user.workspaceId,
      request.user.id,
      request.params.userId,
    );

    response.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    next(error);
  }
};