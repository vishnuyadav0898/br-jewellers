import Joi from "joi";

export const wishlistValidation = {
  add: Joi.object({
    productId: Joi.string().hex().length(24).required().messages({
      "string.base": "Product ID must be a string",
      "string.hex": "Product ID must be a valid hex string",
      "string.length": "Product ID must be 24 characters long",
      "any.required": "Product ID is required",
    }),
  }),
};
