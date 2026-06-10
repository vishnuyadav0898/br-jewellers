import Joi from "joi";

// 🔹 Order Item Schema
const orderItemSchema = Joi.object({
  productId: Joi.string().required().messages({
    "string.base": "Product ID must be a string",
    "string.empty": "Product ID is required",
    "any.required": "Product ID is required",
  }),
  sku: Joi.string().required().messages({
    "string.base": "SKU must be a string",
    "string.empty": "SKU is required",
    "any.required": "SKU is required",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity must be at least 1",
    "any.required": "Quantity is required",
  }),
});

// 🔹 Export Validations
export const orderValidation = {
  create: Joi.object({
    addressId: Joi.string().required().messages({
      "string.base": "Address ID must be a string",
      "string.empty": "Address ID is required",
      "any.required": "Address ID is required",
    }),
    items: Joi.array().items(orderItemSchema).messages({
      "array.base": "Items must be an array",
    }),
  }),

  updateStatus: Joi.object({
    status: Joi.string()
      .valid("pending", "confirmed", "shipped", "delivered", "cancelled")
      .required()
      .messages({
        "string.base": "Status must be a string",
        "string.empty": "Status is required",
        "any.only":
          "Status must be one of: pending, confirmed, shipped, delivered, cancelled",
        "any.required": "Status is required",
      }),
  }),
};
