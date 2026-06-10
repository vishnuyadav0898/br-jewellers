import ResponseHandler from "../utils/responseHandler.js";

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return ResponseHandler.error(res, "Forbidden: Admin access required", 403);
  }
  next();
};
