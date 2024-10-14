const {
  AppError,
  Validation,
  BadRequest,
  NotFound,
  InternalServerError,
} = require("../utils/helper functions/handleError");

const customErrorHandle = (err, req, res, next) => {
  // Log the error for debugging
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.serialize());
  }

  if (err instanceof Validation) {
    return res.status(err.statusCode).json(err.serialize());
  }
  if (err instanceof BadRequest) {
    return res.status(err.statusCode).json(err.serialize());
  }
  if (err instanceof NotFound) {
    return res.status(err.statusCode).json(err.serialize());
  }
  if (err instanceof InternalServerError) {
    return res.status(err.statusCode).json(err.serialize());
  }

  // Handle unknown errors by returning a generic internal server error
  const internalError = new InternalServerError("Internal server error");
  return res.status(internalError.statusCode).json(internalError.serialize());
};

module.exports = customErrorHandle;
