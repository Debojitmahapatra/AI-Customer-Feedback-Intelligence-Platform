import { loginUser, registerUser } from "../services/authService.js";
import { loginSchema, registerSchema } from "../utils/authValidation.js";

const validateRequest = (schema, requestBody) => {
  const result = schema.safeParse(requestBody);

  if (!result.success) {
    const error = new Error(result.error.issues[0].message);

    error.statusCode = 400;

    throw error;
  }

  return result.data;
};

export const register = async (request, response, next) => {
  try {
    const registrationData = validateRequest(registerSchema, request.body);
    const data = await registerUser(registrationData);

    response.status(201).json({
      success: true,
      message: "Registration successful",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (request, response, next) => {
  try {
    const loginData = validateRequest(loginSchema, request.body);
    const data = await loginUser(loginData);

    response.status(200).json({
      success: true,
      message: "Login successful",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = (request, response) => {
  response.status(200).json({
    success: true,
    data: {
      user: request.user,
    },
  });
};