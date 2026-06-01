import models from "../models/index.js";
import User from "../models/user.model.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";
import ResponseHandler from "../utils/responseHandler.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await models.User.findOne({ email });
    if (existingUser) {
      return ResponseHandler.error(res, "User already exists", 409, [
        { field: "email", message: "Email already exists" },
      ]);
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
    });

    const token = generateToken({ id: user._id, role: user.role });


    return ResponseHandler.created(res, "Registered", token);
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await models.User.findOne({ email });
    if (!user) {
      return ResponseHandler.error(res, "Invalid credentials", 401);
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return ResponseHandler.error(res, "Invalid credentials", 401);
    }

    const token = generateToken({ id: user._id, role: user.role });

    const { password: _, ...safeUser } = user.toObject();

    return ResponseHandler.success(res, "Logged in sucessfully",token);
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};