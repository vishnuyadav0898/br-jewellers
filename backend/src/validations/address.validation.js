import Joi from "joi";

const baseAddressSchema = Joi.object({
  label: Joi.string().trim().max(50).messages({
    "string.base": "Label must be a string",
    "string.max": "Label must not exceed 50 characters",
  }),

  fullName: Joi.string().trim().min(2).max(100).messages({
    "string.base": "Full name must be a string",
    "string.empty": "Full name is required",
    "string.min": "Full name must be at least 2 characters",
    "string.max": "Full name must not exceed 100 characters",
  }),

  phone: Joi.string()
    .trim()
    .pattern(/^\d{10}$/)
    .messages({
      "string.base": "Phone must be a string",
      "string.empty": "Phone is required",
      "string.pattern.base": "Phone must be a valid 10-digit number",
    }),

  line1: Joi.string().trim().min(3).max(200).messages({
    "string.base": "Address line 1 must be a string",
    "string.empty": "Address line 1 is required",
    "string.min": "Address line 1 must be at least 3 characters",
    "string.max": "Address line 1 must not exceed 200 characters",
  }),

  line2: Joi.string().trim().allow("").max(200).messages({
    "string.base": "Address line 2 must be a string",
    "string.max": "Address line 2 must not exceed 200 characters",
  }),

  city: Joi.string().trim().min(2).max(100).messages({
    "string.base": "City must be a string",
    "string.empty": "City is required",
    "string.min": "City must be at least 2 characters",
    "string.max": "City must not exceed 100 characters",
  }),

  state: Joi.string().trim().min(2).max(100).messages({
    "string.base": "State must be a string",
    "string.empty": "State is required",
    "string.min": "State must be at least 2 characters",
    "string.max": "State must not exceed 100 characters",
  }),

  zip: Joi.string().trim().min(3).max(10).messages({
    "string.base": "ZIP code must be a string",
    "string.empty": "ZIP code is required",
    "string.min": "ZIP code must be at least 3 characters",
    "string.max": "ZIP code must not exceed 10 characters",
  }),

  country: Joi.string().trim().max(50).messages({
    "string.base": "Country must be a string",
    "string.max": "Country must not exceed 50 characters",
  }),

  isDefault: Joi.boolean().messages({
    "boolean.base": "isDefault must be a boolean",
  }),
});

export const addressValidation = {
  create: baseAddressSchema.fork(
    ["fullName", "phone", "line1", "city", "state", "zip"],
    (schema) => schema.required()
  ),

  update: baseAddressSchema
    .fork(Object.keys(baseAddressSchema.describe().keys), (schema) =>
      schema.optional()
    )
    .min(1),
};
