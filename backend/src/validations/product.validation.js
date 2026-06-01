import Joi from "joi";

// 🔹 Price Schema
const priceSchema = Joi.object({
  INR: Joi.number().min(0).required().messages({
    "number.base": "INR price must be a number",
    "number.min": "INR price cannot be negative",
    "any.required": "INR price is required",
  }),

  USD: Joi.number().min(0).required().messages({
    "number.base": "USD price must be a number",
    "number.min": "USD price cannot be negative",
    "any.required": "USD price is required",
  }),
});

// 🔹 Variant Schema
const variantSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).required().messages({
    "string.base": "Variant name must be a string",
    "string.empty": "Variant name is required",
    "string.min": "Variant name must be at least 2 characters",
    "string.max": "Variant name must not exceed 200 characters",
    "any.required": "Variant name is required",
  }),

  material: Joi.string().trim().min(2).max(50).required().messages({
    "string.base": "Material must be a string",
    "string.empty": "Material is required",
    "string.min": "Material must be at least 2 characters",
    "string.max": "Material must not exceed 50 characters",
    "any.required": "Material is required",
  }),

  color: Joi.string().trim().min(2).max(50).required().messages({
    "string.base": "Color must be a string",
    "string.empty": "Color is required",
    "string.min": "Color must be at least 2 characters",
    "string.max": "Color must not exceed 50 characters",
    "any.required": "Color is required",
  }),

  purity: Joi.string().trim().min(2).max(50).required().messages({
    "string.base": "Purity must be a string",
    "string.empty": "Purity is required",
    "string.min": "Purity must be at least 2 characters",
    "string.max": "Purity must not exceed 50 characters",
    "any.required": "Purity is required",
  }),

  size: Joi.string().trim().min(1).max(20).required().messages({
    "string.base": "Size must be a string",
    "string.empty": "Size is required",
    "string.min": "Size must be at least 1 character",
    "string.max": "Size must not exceed 20 characters",
    "any.required": "Size is required",
  }),

  price: priceSchema.required().messages({
    "object.base": "Price must be an object",
    "any.required": "Price is required",
  }),

  stock: Joi.number().integer().min(0).default(0).messages({
    "number.base": "Stock must be a number",
    "number.integer": "Stock must be an integer",
    "number.min": "Stock cannot be negative",
  }),
});

// 🔹 Price Range Schema
const priceRangeSchema = Joi.object({
  min: Joi.number().min(0).required().messages({
    "number.base": "Minimum price must be a number",
    "number.min": "Minimum price cannot be negative",
    "any.required": "Minimum price is required",
  }),

  max: Joi.number()
    .min(Joi.ref("min"))
    .required()
    .messages({
      "number.base": "Maximum price must be a number",
      "number.min": "Maximum price must be greater than or equal to minimum price",
      "any.required": "Maximum price is required",
    }),
});

// 🔹 Base Product Schema
const baseProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).messages({
    "string.base": "Product name must be a string",
    "string.empty": "Product name is required",
    "string.min": "Product name must be at least 2 characters",
    "string.max": "Product name must not exceed 200 characters",
  }),

  description: Joi.string().trim().allow("").messages({
    "string.base": "Description must be a string",
  }),

  coverImage: Joi.string().trim().uri().messages({
    "string.base": "Cover image must be a string",
    "string.empty": "Cover image is required",
    "string.uri": "Cover image must be a valid URL",
  }),

  images: Joi.array().items(Joi.string().uri()).messages({
    "array.base": "Images must be an array",
  }),

  tags: Joi.array().items(Joi.string().trim()).messages({
    "array.base": "Tags must be an array",
  }),

  gemstone: Joi.string().trim().min(2).max(100).messages({
    "string.base": "Gemstone must be a string",
    "string.empty": "Gemstone is required",
    "string.min": "Gemstone must be at least 2 characters",
    "string.max": "Gemstone must not exceed 100 characters",
  }),

  occasions: Joi.array().items(Joi.string().trim()).messages({
    "array.base": "Occasions must be an array",
  }),

  category: Joi.string().trim().max(100).messages({
    "string.base": "Category must be a string",
    "string.max": "Category must not exceed 100 characters",
  }),

  status: Joi.string().valid("active", "inactive").messages({
    "string.base": "Status must be a string",
    "any.only": "Status must be either active or inactive",
  }),

  priceRange: priceRangeSchema.messages({
    "object.base": "Price range must be an object",
  }),

  variants: Joi.array().items(variantSchema).messages({
    "array.base": "Variants must be an array",
  }),
});

// 🔹 Export Validations
export const productValidation = {
  create: baseProductSchema.fork(
    ["name", "coverImage", "gemstone"],
    (schema) => schema.required()
  ),

  update: baseProductSchema
    .fork(Object.keys(baseProductSchema.describe().keys), (schema) =>
      schema.optional()
    )
    .min(1),

  updateStatus: Joi.object({
    isActive: Joi.boolean().required().messages({
      "boolean.base": "isActive must be a boolean",
      "any.required": "isActive is required",
    }),
  }),
};