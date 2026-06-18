import Joi from "joi";

export const permissionValidation = {
  assign: Joi.object({
    permissions: Joi.array()
      .items(
        Joi.object({
          module: Joi.string().required(),
          actions: Joi.array().items(Joi.string()).required(),
        })
      )
      .required(),
  }),
};
