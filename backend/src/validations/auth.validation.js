import Joi from "joi";

export const authValidation = {
  register: Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .required()
      .messages({
        "string.base": "Name must be a string",
        "string.empty": "Name is required",
        "string.min": "Name must be at least 2 characters",
        "string.max": "Name must not exceed 50 characters",
        "any.required": "Name is required",
      }),

    email: Joi.string()
      .trim()
      .email()
      .required()
      .messages({
        "string.base": "Email must be a string",
        "string.empty": "Email is required",
        "string.email": "Email must be a valid email address",
        "any.required": "Email is required",
      }),

    password: Joi.string()
      .min(8)
      .max(128)
      .required()
      .messages({
        "string.base": "Password must be a string",
        "string.empty": "Password is required",
        "string.min": "Password must be at least 8 characters",
        "string.max": "Password must not exceed 128 characters",
        "any.required": "Password is required",
      }),
  }),

  login: Joi.object({
    email: Joi.string()
      .trim()
      .email()
      .required()
      .messages({
        "string.base": "Email must be a string",
        "string.empty": "Email is required",
        "string.email": "Email must be a valid email address",
        "any.required": "Email is required",
      }),

    password: Joi.string()
      .required()
      .messages({
        "string.base": "Password must be a string",
        "string.empty": "Password is required",
        "any.required": "Password is required",
      }),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string()
      .required()
      .messages({
        "string.base": "Refresh token must be a string",
        "string.empty": "Refresh token is required",
        "any.required": "Refresh token is required",
      }),
  }),

  googleLogin: Joi.object({
    idToken: Joi.string()
      .required()
      .messages({
        "string.base": "ID token must be a string",
        "string.empty": "ID token is required",
        "any.required": "ID token is required",
      }),
  }),
};