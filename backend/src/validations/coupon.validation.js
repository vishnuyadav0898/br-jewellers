import Joi from "joi";

export const couponValidation = {
  create: Joi.object({
    name: Joi.string().required(),
    code: Joi.string().required().uppercase(),
    description: Joi.string().allow(""),
    discountType: Joi.string().valid("percentage", "fixed").required(),
    
    // Percentage Specific
    discountValue: Joi.number().min(0).max(100).when("discountType", {
      is: "percentage",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
    maxDiscount: Joi.object({
      INR: Joi.number().min(0),
      USD: Joi.number().min(0),
    }).optional(),
    
    // Fixed Specific
    fixedDiscountValue: Joi.object({
      INR: Joi.number().min(0).required(),
      USD: Joi.number().min(0).required(),
    }).when("discountType", {
      is: "fixed",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),

    minOrderAmount: Joi.object({
      INR: Joi.number().min(0).default(0),
      USD: Joi.number().min(0).default(0),
    }).default({ INR: 0, USD: 0 }),
    
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    isActive: Joi.boolean().default(true),
    
    applicableMaterials: Joi.array().items(Joi.string()).default([]),
    applicableCategories: Joi.array().items(Joi.string()).default([]),
    applicableProducts: Joi.array().items(Joi.string()).default([]),
    applicableOnOrderNumber: Joi.number().min(1).allow(null).default(null),
    
    usageLimit: Joi.number().min(1).allow(null).default(null),
    usagePerUser: Joi.number().min(1).default(1),
  }),

  update: Joi.object({
    name: Joi.string(),
    description: Joi.string().allow(""),
    isActive: Joi.boolean(),
    endDate: Joi.date().iso(),
    usageLimit: Joi.number().min(1).allow(null),
    applicableOnOrderNumber: Joi.number().min(1).allow(null),
  }),

  assign: Joi.object({
    couponId: Joi.string().required(),
    userId: Joi.string().required(),
  }),
};
