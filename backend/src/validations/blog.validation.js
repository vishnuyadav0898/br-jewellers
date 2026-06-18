import Joi from "joi";

export const blogValidation = {
  create: Joi.object({
    title: Joi.string().trim().required(),
    image: Joi.string().trim().optional().allow(""),
    description: Joi.string().trim().optional().allow(""),
    gallery: Joi.array().items(Joi.string().trim()).optional(),
  }),
  update: Joi.object({
    title: Joi.string().trim().optional(),
    image: Joi.string().trim().optional().allow(""),
    description: Joi.string().trim().optional().allow(""),
    gallery: Joi.array().items(Joi.string().trim()).optional(),
  }),
};
