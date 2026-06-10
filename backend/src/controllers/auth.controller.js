import models from "../models/index.js";
import User from "../models/user.model.js";
import { comparePassword } from "../utils/hash.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import ResponseHandler from "../utils/responseHandler.js";

const setRefreshTokenCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

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

    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id, role: user.role });

    setRefreshTokenCookie(res, refreshToken);

    return ResponseHandler.created(res, "Registered successfully", {
      accessToken,
    });
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

    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id, role: user.role });

    setRefreshTokenCookie(res, refreshToken);

    return ResponseHandler.success(res, "Logged in successfully", {
      accessToken,
    });
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};

export const refreshTokenHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return ResponseHandler.unauthorized(res, "Refresh token is required");
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      return ResponseHandler.unauthorized(res, "Invalid or expired refresh token");
    }

    // Verify user still exists
    const user = await models.User.findById(decoded.id);
    if (!user) {
      return ResponseHandler.unauthorized(res, "User no longer exists");
    }

    const newAccessToken = generateAccessToken({ id: user._id, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user._id, role: user.role });

    setRefreshTokenCookie(res, newRefreshToken);

    return ResponseHandler.success(res, "Token refreshed successfully", {
      accessToken: newAccessToken,
    });
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    // Dynamically import google-auth-library
    const { OAuth2Client } = await import("google-auth-library");
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (err) {
      return ResponseHandler.unauthorized(res, "Invalid Google ID token");
    }

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Find existing user by googleId or email
    let user = await models.User.findOne({
      $or: [{ googleId }, { email }],
    });

    if (user) {
      // Link Google account if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user (no password needed for Google users)
      user = await User.create({
        name,
        email,
        googleId,
        role: "user",
      });
    }

    const accessToken = generateAccessToken({ id: user._id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id, role: user.role });

    setRefreshTokenCookie(res, refreshToken);

    return ResponseHandler.success(res, "Google login successful", {
      accessToken,
    });
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};