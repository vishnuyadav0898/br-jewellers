import Joi from "joi";

// 🔹 Price Schema
const priceSchema = Joi.object({
  currency: Joi.string().required().messages({
    "string.base": "Currency must be a string",
    "any.required": "Currency is required",
  }),
  amount: Joi.number().min(0).required().messages({
    "number.base": "Amount must be a number",
    "number.min": "Amount cannot be negative",
    "any.required": "Amount is required",
  }),
});

// 🔹 Variant Schema
const variantSchema = Joi.object({
  sku: Joi.string().trim().messages({
    "string.base": "SKU must be a string",
  }),
  attributes: Joi.object().pattern(Joi.string(), Joi.string()).messages({
    "object.base": "Attributes must be an object of key-value pairs",
  }),
  prices: Joi.array().items(priceSchema).messages({
    "array.base": "Prices must be an array of objects",
  }),
  images: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().uri(),
        key: Joi.string(),
      })
    )
    .messages({
      "array.base": "Images must be an array of objects",
    }),
  isDefault: Joi.boolean().messages({
    "boolean.base": "isDefault must be a boolean",
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
      "number.min":
        "Maximum price must be greater than or equal to minimum price",
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
  slug: Joi.string().trim().messages({
    "string.base": "Slug must be a string",
  }),
  description: Joi.string().trim().allow("").messages({
    "string.base": "Description must be a string",
  }),
  shortDescription: Joi.string().trim().allow("").messages({
    "string.base": "Short description must be a string",
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

  category: Joi.string().trim().max(100).messages({
    "string.base": "Category must be a string",
    "string.max": "Category must not exceed 100 characters",
  }),

  gemstone: Joi.string().trim().allow("").messages({
    "string.base": "Gemstone must be a string",
  }),

  occasions: Joi.array().items(Joi.string().trim()).messages({
    "array.base": "Occasions must be an array",
  }),

  priceRange: priceRangeSchema.messages({
    "object.base": "Price range must be an object",
  }),

  featured: Joi.boolean().messages({
    "boolean.base": "featured must be a boolean",
  }),

  isActive: Joi.boolean().messages({
    "boolean.base": "isActive must be a boolean",
  }),

  variants: Joi.array().items(variantSchema).messages({
    "array.base": "Variants must be an array",
  }),
});

// 🔹 Export Validations
export const productValidation = {
  create: baseProductSchema.fork(
    ["name", "coverImage"],
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