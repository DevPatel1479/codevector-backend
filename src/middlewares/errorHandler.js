const HttpError = require("../utils/httpError");

module.exports = function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err instanceof HttpError ? err.statusCode : err.statusCode || 500;
  const message = err instanceof HttpError ? err.message : err.message || "Internal Server Error";

  const payload = {
    success: false,
    message,
  };

  if (err instanceof HttpError && err.details) {
    payload.details = err.details;
  }

  if (process.env.NODE_ENV !== "production" && !(err instanceof HttpError)) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};
