import { logger } from "../utils/logger.js";
import mongoose from "mongoose";

const buildPayload = ({ success, message, data, errors }) => ({
  success,
  message,
  data,
  errors,
});

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
        errors: null,
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
        errors: null,
      })
    );
  }

  static error(res, message = "Error", code = 500, errors = []) {
    logger.error(`${reqInfo(res)} ${code} - ${message}`);
    return res.status(code).json(
      buildPayload({
        success: false,
        message,
        data: null,
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

  static forbidden(res, message = "Forbidden") {
    return this.error(res, message, 403);
  }

  static notFound(res, message = "Not Found") {
    return this.error(res, message, 404);
  }

  static validation(res, errors, message = "Validation failed") {
    return this.error(res, message, 422, errors);
  }

  static pagination(
    res,
    message = "Success",
    params = { count: 0, page: 1, size: 10 },
    data = []
  ) {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page: params.page,
        size: params.size,
        totalRecords: params.count,
        totalPages: Math.ceil(params.count / params.size),
        hasNextPage: params.page * params.size < params.count,
        hasPrevPage: params.page > 1,
      },
    });
  }

  // 🔥 CENTRAL ERROR HANDLER (MONGOOSE + GENERIC)
  static handleErrors(err, req, res, next) {
    logger.error(err);

    // ✅ Mongoose duplicate key
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return this.error(res, `${field} already exists`, 409, [
        { field, message: `${field} already exists` },
      ]);
    }

    // ✅ Mongoose validation
    if (err instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      return this.validation(res, errors);
    }

    // ✅ Cast error (invalid ObjectId)
    if (err instanceof mongoose.Error.CastError) {
      return this.error(res, "Invalid ID format", 400, [
        { field: err.path, message: "Invalid ID" },
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