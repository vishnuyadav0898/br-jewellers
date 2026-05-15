import { logger } from "./logger.js";
import mongoose from "mongoose";

const buildPayload = ({ success, message, data, errors }) => {
  const payload = {
    success,
    message,
  };

  // ✅ Include data only on success
  if (success && data !== null && data !== undefined) {
    payload.data = data;
  }

  // ✅ Include errors only if present
  if (!success && errors && errors.length > 0) {
    payload.errors = errors;
  }

  return payload;
};

const reqInfo = (res) => {
  const req = res?.req;
  if (!req) return "";
  return `${req.method} ${req.originalUrl}`;
};

class ResponseHandler {
  static success(res, message = "Success", data = null) {
    logger.info(`${reqInfo(res)} 200 - ${message}`);
    return res.status(200).json(
      buildPayload({
        success: true,
        message,
        data,
      })
    );
  }

  static created(res, message = "Created", data = null) {
    logger.info(`${reqInfo(res)} 201 - ${message}`);
    return res.status(201).json(
      buildPayload({
        success: true,
        message,
        data,
      })
    );
  }

  static error(res, message = "Error", code = 500, errors = []) {
    logger.error(`${reqInfo(res)} ${code} - ${message}`);
    return res.status(code).json(
      buildPayload({
        success: false,
        message,
        errors,
      })
    );
  }

  static badRequest(res, message = "Bad Request") {
    return this.error(res, message, 400);
  }

  static unauthorized(res, message = "Unauthorized") {
    return this.error(res, message, 401);
  }

  static notFound(res, message = "Not Found") {
    return this.error(res, message, 404);
  }

  static validation(res, errors, message = "Validation failed") {
    return this.error(res, message, 422, errors);
  }

  // ✅ Global error handler
  static handleErrors(err, req, res, next) {
    logger.error(err);

    // Duplicate key (Mongo)
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return this.error(res, `${field} already exists`, 409, [
        { field, message: `${field} already exists` },
      ]);
    }

    // Mongoose validation error
    if (err instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      return this.validation(res, errors);
    }

    // Invalid ObjectId
    if (err instanceof mongoose.Error.CastError) {
      return this.error(res, "Invalid ID", 400, [
        { field: err.path, message: "Invalid ID format" },
      ]);
    }

    return this.error(
      res,
      err?.message || "Internal Server Error",
      err?.statusCode || 500
    );
  }
}

export default ResponseHandler;