import { z } from "zod";

const requiredString = (label, minimumLength = 1) =>
  z
    .string()
    .trim()
    .min(minimumLength, minimumLength > 1 ? `${label} must be at least ${minimumLength} characters.` : `${label} is required.`);

const numericField = (label, { integer = false, min } = {}) => {
  let schema = z
    .preprocess(
      (value) => (value === null || value === undefined ? "" : String(value)),
      z
        .string()
        .trim()
        .min(1, `${label} is required.`)
        .refine((value) => !Number.isNaN(Number(value)), {
          message: `${label} must be a valid number.`,
        })
        .transform((value) => Number(value))
    );

  if (integer) {
    schema = schema.refine((value) => Number.isInteger(value), {
      message: `${label} must be a whole number.`,
    });
  }

  if (typeof min === "number") {
    schema = schema.refine((value) => value >= min, {
      message: `${label} must be at least ${min}.`,
    });
  }

  return schema;
};

const optionalNumericField = (label, options = {}) =>
  z
    .preprocess(
      (value) => (value === null || value === undefined ? "" : String(value)),
      z
        .string()
        .trim()
        .transform((value) => (value === "" ? undefined : value))
        .refine((value) => value === undefined || !Number.isNaN(Number(value)), {
          message: `${label} must be a valid number.`,
        })
        .transform((value) => (value === undefined ? undefined : Number(value)))
    )
    .refine((value) => value === undefined || !options.integer || Number.isInteger(value), {
      message: `${label} must be a whole number.`,
    })
    .refine((value) => value === undefined || typeof options.min !== "number" || value >= options.min, {
      message: `${label} must be at least ${options.min}.`,
    });

export const getValidationErrors = (error) => {
  if (!(error instanceof z.ZodError)) {
    return {};
  }

  return error.issues.reduce((accumulator, issue) => {
    const key = String(issue.path[0] || "form");

    if (!accumulator[key]) {
      accumulator[key] = issue.message;
    }

    return accumulator;
  }, {});
};

export const loginSchema = z.object({
  email: requiredString("Email").email("Enter a valid email address."),
  password: requiredString("Password"),
});

export const registerSchema = z.object({
  name: requiredString("Name", 2),
  email: requiredString("Email").email("Enter a valid email address."),
  password: requiredString("Password", 8),
});

export const profileSchema = z.object({
  name: requiredString("Name", 2),
  email: requiredString("Email").email("Enter a valid email address."),
  phone: requiredString("Phone", 10),
  avatar: z.string().optional(),
});

export const passwordSchema = z
  .object({
    oldPassword: requiredString("Current password"),
  newPassword: requiredString("New password", 8),
    confirmPassword: requiredString("Confirm password"),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "New password and confirmation must match.",
    path: ["confirmPassword"],
  });

export const contactSchema = z.object({
  name: requiredString("Name", 2),
  email: requiredString("Email").email("Enter a valid email address."),
  message: requiredString("Message", 10),
});

export const returnRequestSchema = z.object({
  reason: requiredString("Reason", 10),
});

export const categorySchema = z.object({
  name: requiredString("Category name", 2),
  description: z.string().trim().optional().default(""),
  isActive: z.boolean().default(true),
});

export const adminUserSchema = z.object({
  name: requiredString("Name", 2),
  email: requiredString("Email").email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Phone must be a valid 10-digit number.")
    .or(z.literal("")),
  password: z
    .string()
    .trim()
    .transform((value) => (value === "" ? undefined : value))
    .refine((value) => value === undefined || value.length >= 8, {
      message: "Password must be at least 8 characters.",
    }),
});

export const createAdminUserSchema = adminUserSchema.extend({
  password: requiredString("Password", 8),
});

export const bannerSchema = z.object({
  tag: z.string().trim(),
  title: requiredString("Title", 2),
  subtitle: requiredString("Subtitle", 10),
  cta: z.string().trim(),
  href: z.string().trim(),
  image: requiredString("Image", 5),
});

export const blogSchema = z.object({
  title: requiredString("Title", 2),
  excerpt: z.string().trim().optional(),
  author: z.string().trim().optional(),
  readTime: z.string().trim().optional(),
  coverImage: requiredString("Cover image", 5),
  content: requiredString("Content", 20),
});

export const pageContentSchema = z.object({
  title: requiredString("Page title", 2),
  body: requiredString("Body content", 10),
});

export const homeContentSchema = z.object({
  heroBadge: requiredString("Hero badge", 2),
  heroEyebrow: requiredString("Hero eyebrow", 2),
  featuredTitle: requiredString("Featured title", 2),
  categoriesTitle: requiredString("Categories title", 2),
  categoriesSubtitle: requiredString("Categories subtitle", 10),
  recentlyViewedTitle: requiredString("Recently viewed title", 2),
});

export const productSchema = z
  .object({
    name: requiredString("Name", 2),
    description: requiredString("Description", 10),
    gemstone: requiredString("Gemstone", 2),
    coverImage: requiredString("Cover image URL", 5).url("Enter a valid cover image URL."),
    category: requiredString("Category"),
    priceRange: z.object({
      min: numericField("Minimum price", { min: 0 }),
      max: numericField("Maximum price", { min: 0 }),
    }),
    images: z.array(z.string().trim().url("Enter valid image URLs only.")).min(1, "Add at least one product image."),
    tags: z.array(z.string().trim().min(1, "Tag is required.")),
    occasions: z.array(z.string().trim().min(1, "Occasion is required.")),
    variants: z
      .array(
        z.object({
          sku: z.string().trim().optional(),
          name: requiredString("Variant name", 2),
          material: requiredString("Material", 2),
          color: requiredString("Color", 2),
          purity: requiredString("Purity", 2),
          size: requiredString("Size"),
          price: z.object({
            INR: numericField("INR price", { min: 0 }),
            USD: numericField("USD price", { min: 0 }),
          }),
        })
      )
      .min(1, "Add at least one variant."),
    isActive: z.boolean(),
    featured: z.boolean().optional(),
  })
  .refine((value) => Number(value.priceRange.max) >= Number(value.priceRange.min), {
    message: "Maximum price must be greater than or equal to minimum price.",
    path: ["priceRange"],
  });

export { z };
