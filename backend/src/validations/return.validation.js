import Joi from "joi";

export const returnValidation = {
  request: Joi.object({
    orderId: Joi.string().required(),
    reason: Joi.string().required(),
    items: Joi.array().items(
      Joi.object({
        sku: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
      })
    ).min(1).required(),
  }),

  updateAdmin: Joi.object({
    status: Joi.string().valid("approved", "rejected", "refunded").required(),
    adminNote: Joi.string().allow("").optional(),
  }),
};
