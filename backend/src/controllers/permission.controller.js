import models from "../models/index.js";
import ResponseHandler from "../utils/responseHandler.js";

export const getAllPermissions = async (req, res, next) => {
  try {
    const permissions = await models.Permission.find();
    return ResponseHandler.success(
      res,
      "Permissions fetched successfully",
      permissions
    );
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};

export const getUserPermissions = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await models.User.findById(userId).select("permissions name email role");
    
    if (!user) {
      return ResponseHandler.notFound(res, "User not found");
    }

    return ResponseHandler.success(
      res,
      "User permissions fetched successfully",
      user
    );
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};

export const assignPermissions = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body;

    const user = await models.User.findById(userId);
    if (!user) {
      return ResponseHandler.notFound(res, "User not found");
    }

    if (user.role !== "admin") {
      return ResponseHandler.badRequest(res, "Can only assign permissions to admin users");
    }

    // Validate against Master Permission list
    const masterPermissions = await models.Permission.find();
    
    for (const perm of permissions) {
      const masterModule = masterPermissions.find((m) => m.name === perm.module);
      if (!masterModule) {
        return ResponseHandler.badRequest(res, `Invalid module: ${perm.module}`);
      }
      
      for (const action of perm.actions) {
        if (!masterModule.actions.includes(action)) {
          return ResponseHandler.badRequest(
            res, 
            `Invalid action '${action}' for module '${perm.module}'`
          );
        }
      }
    }

    user.permissions = permissions;
    await user.save();

    return ResponseHandler.success(res, "Permissions assigned successfully", user.permissions);
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};
