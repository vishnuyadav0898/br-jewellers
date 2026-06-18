import Joi from "joi";

export const contentValidation = {
  update: Joi.object().unknown(true), // Accepts any JSON payload for the page
};
