import User from "../models/User.js";
import { getSafeUser } from "../services/authService.js";
import { verifyToken } from "../utils/jwt.js";

const createUnauthorizedError = () => {
  const error = new Error("Unauthorized");

  error.statusCode = 401;

  return error;
};

const authenticate = async (request, _response, next) => {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return next(createUnauthorizedError());
  }

  const token = authorizationHeader.slice(7).trim();

  if (!token) {
    return next(createUnauthorizedError());
  }

  let decodedToken;

  try {
    decodedToken = verifyToken(token);
  } catch {
    return next(createUnauthorizedError());
  }

  try {
    const user = await User.findById(decodedToken.userId);

    if (!user) {
      return next(createUnauthorizedError());
    }

    request.user = getSafeUser(user);

    return next();
  } catch (error) {
    return next(error);
  }
};

export default authenticate;