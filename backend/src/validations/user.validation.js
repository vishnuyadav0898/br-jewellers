import Joi from "joi";

// 🔹 Address schema
const addressSchema = Joi.object({
  line1: Joi.string().trim().min(3).max(100).messages({
    "string.base": "Address line must be a string",
    "string.min": "Address line must be at least 3 characters",
    "string.max": "Address line must not exceed 100 characters",
  }),

  city: Joi.string().trim().min(2).max(50).messages({
    "string.base": "City must be a string",
    "string.min": "City must be at least 2 characters",
    "string.max": "City must not exceed 50 characters",
  }),

  state: Joi.string().trim().min(2).max(50).messages({
    "string.base": "State must be a string",
  }),

  zip: Joi.string().trim().min(3).max(10).messages({
    "string.base": "Zip must be a string",
  }),

  country: Joi.string().trim().min(2).max(50).messages({
    "string.base": "Country must be a string",
  }),
});

// 🔹 Base schema
const baseUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).messages({
    "string.base": "Name must be a string",
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name must not exceed 50 characters",
  }),

  email: Joi.string().trim().email().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email is required",
    "string.email": "Email must be a valid email address",
  }),

  password: Joi.string().min(8).max(128).messages({
    "string.base": "Password must be a string",
    "string.empty": "Password is required",
    "string.min": "Password must be at least 8 characters",
    "string.max": "Password must not exceed 128 characters",
  }),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .messages({
      "string.base": "Phone must be a string",
      "string.pattern.base": "Phone must be a valid 10-digit number",
    }),

  image: Joi.string().uri().messages({
    "string.base": "Image must be a string",
    "string.uri": "Image must be a valid URL",
  }),

  role: Joi.forbidden().messages({
    "any.unknown": "Role cannot be set manually",
  }),

  googleId: Joi.string().messages({
    "string.base": "Google ID must be a string",
  }),

  address: Joi.array().items(addressSchema),
});

export const userValidation = {
  // ✅ CREATE
  create: baseUserSchema.fork(
    ["name", "email", "password"],
    (schema) => schema.required()
  ),

  // ✅ UPDATE
  update: baseUserSchema
    .fork(Object.keys(baseUserSchema.describe().keys), (schema) =>
      schema.optional()
    )
    .min(1),

  // 🔐 UPDATE PASSWORD (logged-in user)
  updatePassword: Joi.object({
    oldPassword: Joi.string().required().messages({
      "string.base": "Old password must be a string",
      "string.empty": "Old password is required",
      "any.required": "Old password is required",
    }),

    newPassword: Joi.string().min(8).max(128).required().messages({
      "string.base": "New password must be a string",
      "string.empty": "New password is required",
      "string.min": "New password must be at least 8 characters",
      "string.max": "New password must not exceed 128 characters",
      "any.required": "New password is required",
    }),
  }),

  // 🔑 FORGOT PASSWORD
  forgotPassword: Joi.object({
    email: Joi.string().trim().email().required().messages({
      "string.base": "Email must be a string",
      "string.empty": "Email is required",
      "string.email": "Email must be a valid email address",
      "any.required": "Email is required",
    }),
  }),
};