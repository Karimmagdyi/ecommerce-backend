class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
  serialize() {
    return {
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}
class NotFound extends AppError {
  constructor(message = "resources not found") {
    super(message, 404);
  }
}
class ValidationError extends AppError {
  constructor(message = "unauthorized access") {
    super(message, 401);
  }
}
class InternalServerError extends AppError {
  constructor(message = "internal server error") {
    super(message, 500);
  }
}
class BadRequest extends AppError {
  constructor(message = "invalid data") {
    super(message, 400);
  }
}

module.exports = {
  AppError,
  NotFound,
  ValidationError,
  InternalServerError,
  BadRequest,
};
