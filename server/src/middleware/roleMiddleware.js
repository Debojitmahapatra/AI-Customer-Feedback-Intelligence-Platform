const createHttpError = (message, statusCode) => {
  const error = new Error(message);

  error.statusCode = statusCode;

  return error;
};

const authorizeRoles = (...allowedRoles) => {
  return (request, _response, next) => {
    if (!request.user) {
      return next(createHttpError("Unauthorized", 401));
    }

    if (!allowedRoles.includes(request.user.role)) {
      return next(createHttpError("Forbidden", 403));
    }

    return next();
  };
};

export default authorizeRoles;