import Joi from "joi";

export const cartValidation = {
  addToCart: Joi.object({
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
    quantity: Joi.number().integer().min(1).default(1).messages({
      "number.base": "Quantity must be a number",
      "number.integer": "Quantity must be an integer",
      "number.min": "Quantity must be at least 1",
    }),
  }),

  updateCartItem: Joi.object({
    quantity: Joi.number().integer().min(1).required().messages({
      "number.base": "Quantity must be a number",
      "number.integer": "Quantity must be an integer",
      "number.min": "Quantity must be at least 1",
      "any.required": "Quantity is required",
    }),
  }),
};
