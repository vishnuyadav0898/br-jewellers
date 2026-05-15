import ResponseHandler from "../utils/responseHandler.js";

export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((err) => ({
      field: err.path.join("."),
      message: err.message.replace(/"/g, ""), 
    }));

    return ResponseHandler.validation(res, errors);
  }

  req.body = value;
  next();
};