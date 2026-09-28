import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";

const createHttpError = (message, statusCode) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  return error;
};

const formatWorkspace = (workspace) => ({
  id: workspace._id.toString(),
  name: workspace.name,
  createdAt: workspace.createdAt,
  updatedAt: workspace.updatedAt,
});

const formatMember = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
});

const findWorkspaceMember = async (workspaceId, userId) => {
  if (!mongoose.isValidObjectId(userId)) {
    throw createHttpError("Member not found.", 404);
  }

  const member = await User.findOne({
    _id: userId,
    workspaceId,
  }).select("+password");

  if (!member) {
    throw createHttpError("Member not found.", 404);
  }

  return member;
};

const ensureNotLastAdmin = async (workspaceId, member) => {
  if (member.role !== "ADMIN") {
    return;
  }

  const adminCount = await User.countDocuments({
    workspaceId,
    role: "ADMIN",
  });

  if (adminCount <= 1) {
    throw createHttpError("A workspace must have at least one ADMIN.", 400);
  }
};

export const getWorkspace = async (workspaceId) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw createHttpError("Workspace not found.", 404);
  }

  return formatWorkspace(workspace);
};

export const getWorkspaceMembers = async (workspaceId) => {
  const users = await User.find({ workspaceId }).select("name email role");

  return users.map(formatMember);
};

export const addMember = async (workspaceId, memberData) => {
  const existingUser = await User.findOne({ email: memberData.email });

  if (existingUser) {
    throw createHttpError("An account with this email already exists.", 409);
  }

  const hashedPassword = await bcrypt.hash(memberData.password, 12);

  try {
    const member = await User.create({
      name: memberData.name,
      email: memberData.email,
      password: hashedPassword,
      role: memberData.role,
      workspaceId,
    });

    return formatMember(member);
  } catch (error) {
    if (error.code === 11000) {
      throw createHttpError("An account with this email already exists.", 409);
    }

    throw error;
  }
};

export const updateMemberRole = async (workspaceId, userId, newRole) => {
  const member = await findWorkspaceMember(workspaceId, userId);

  if (member.role === "ADMIN" && newRole !== "ADMIN") {
    await ensureNotLastAdmin(workspaceId, member);
  }

  member.role = newRole;
  await member.save();

  return formatMember(member);
};

export const removeMember = async (workspaceId, currentUserId, userId) => {
  const member = await findWorkspaceMember(workspaceId, userId);

  if (member._id.toString() === currentUserId) {
    throw createHttpError("You cannot remove your own account.", 400);
  }

  await ensureNotLastAdmin(workspaceId, member);
  await member.deleteOne();
};