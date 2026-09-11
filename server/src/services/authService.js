import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import { generateToken } from "../utils/jwt.js";

const createHttpError = (message, statusCode) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  return error;
};

const formatUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  workspaceId: user.workspaceId.toString(),
});

const createAuthResponse = (user) => ({
  user: formatUser(user),
  token: generateToken({ userId: user._id.toString() }),
});

export const registerUser = async ({
  name,
  email,
  password,
  workspaceName,
}) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw createHttpError("An account with this email already exists.", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const workspace = await Workspace.create({ name: workspaceName });

  try {
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "ADMIN",
      workspaceId: workspace._id,
    });

    return createAuthResponse(user);
  } catch (error) {
    if (error.code === 11000) {
      throw createHttpError("An account with this email already exists.", 409);
    }

    throw error;
  }
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw createHttpError("Invalid email or password.", 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw createHttpError("Invalid email or password.", 401);
  }

  return createAuthResponse(user);
};

export const getSafeUser = formatUser;