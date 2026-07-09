import models from "../models/index.js";
import { hashPassword } from "../utils/hash.js";
import ResponseHandler from "../utils/responseHandler.js";
import { StorageService } from "../services/storage.service.js";

export const userMe = async (req, res, next) => {
  try {
    const user = await models.User.findById(req.user.id).select("-password");

    if (!user) {
      return ResponseHandler.notFound(res, "User not found");
    }

    const wishlist = await models.Wishlist.findOne({ user: req.user.id }).populate(
      "products"
    );

    return ResponseHandler.success(res, "User fetched", {
      ...user.toObject(),
      wishlist: wishlist?.products || [],
    });
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};
export const getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;

    const filter = {};

    if (role) {
      filter.role = role;
    }

    const users = await models.User.find(filter).select("-password");

    return ResponseHandler.success(res, "Users fetched", users);
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await models.User.findById(req.params.id).select("-password");

    if (!user) {
      return ResponseHandler.notFound(res, "User not found");
    }

    return ResponseHandler.success(res, "User fetched", user);
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const data = { ...req.body };

    // 🔒 Force role to admin (ignore incoming role)
    data.role = "admin";

    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    const user = await models.User.create(data);

    const { password: _, ...safeUser } = user.toObject();

    return ResponseHandler.created(res, "Admin user created");
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const data = { ...req.body };

    const existingUser = await models.User.findById(req.params.id);
    if (!existingUser) {
      return ResponseHandler.notFound(res, "User not found");
    }

    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    if (data.image && existingUser.image && data.image !== existingUser.image) {
      await StorageService.deleteFile(existingUser.image);
    }

    const user = await models.User.findByIdAndUpdate(req.params.id, data, {
      returnDocument: "after",
    }).select("-password");

    return ResponseHandler.success(res, "User updated");
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await models.User.findByIdAndDelete(req.params.id);

    if (!user) {
      return ResponseHandler.notFound(res, "User not found");
    }

    if (user.image) {
      await StorageService.deleteFile(user.image);
    }

    return ResponseHandler.success(res, "User deleted");
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await models.User.findById(req.user.id);
    if (!user) {
      return ResponseHandler.notFound(res, "User not found");
    }

    if (!user.password) {
      return ResponseHandler.badRequest(res, "This account uses Google Login and does not have a password to update.");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return ResponseHandler.badRequest(res, "Old password is incorrect");
    }

    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return ResponseHandler.badRequest(
        res,
        "New password must be different from old password"
      );
    }

    // 🔐 Set new password (auto hashed via mongoose hook)
    user.password = newPassword;
    await user.save();

    return ResponseHandler.success(res, "Password updated successfully");
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};
const generatePassword = (length = 8) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";

  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return password;
};
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await models.User.findOne({ email });
    if (!user) {
      return ResponseHandler.notFound(res, "User not found");
    }

    const newPassword = generatePassword(8);

    user.password = newPassword;
    await user.save(); 

    return ResponseHandler.success(res, "Password reset successfully", {
      temporaryPassword: newPassword, // ⚠️ only for dev
    });
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};