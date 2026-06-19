import Joi from "joi";

export const notificationValidation = {
  registerToken: Joi.object({
    fcmToken: Joi.string().required(),
  }),

  sendManual: Joi.object({
    title: Joi.string().required(),
    message: Joi.string().required(),
    isBroadcast: Joi.boolean().default(false),
    userIds: Joi.array().items(Joi.string()).when("isBroadcast", {
      is: false,
      then: Joi.array().min(1).required(),
      otherwise: Joi.array().optional()
    }),
    imageUrl: Joi.string().uri().optional(),
  }),
};
