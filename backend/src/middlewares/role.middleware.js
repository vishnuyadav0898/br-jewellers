import ResponseHandler from "../utils/responseHandler.js";
import models from "../models/index.js";

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return ResponseHandler.error(res, "Forbidden: Admin access required", 403);
  }
  next();
};

export const checkPermission = (module, action) => async (req, res, next) => {
  // Step 1: Check admin role
  if (!req.user || req.user.role !== "admin") {
    return ResponseHandler.error(res, "Forbidden: Admin access required", 403);
  }

  try {
    // Step 2: Fetch permissions from DB (once per request)
    if (!req.user.permissions) {
      const user = await models.User.findById(req.user.id).select("permissions");
      req.user.permissions = user?.permissions || [];
    }

    // Step 3: Check module:action
    const modulePerms = req.user.permissions.find((p) => p.module === module);
    if (!modulePerms || !modulePerms.actions.includes(action)) {
      return ResponseHandler.error(
        res,
        `Forbidden: ${module}:${action} permission required`,
        403
      );
    }

    next();
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};
