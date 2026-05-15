import { z } from "zod";

const requiredString = (label, minimumLength = 1) =>
  z
    .string()
    .trim()
    .min(minimumLength, minimumLength > 1 ? `${label} must be at least ${minimumLength} characters.` : `${label} is required.`);

const numericField = (label, { integer = false, min } = {}) => {
  let schema = z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .refine((value) => !Number.isNaN(Number(value)), {
      message: `${label} must be a valid number.`,
    })
    .transform((value) => Number(value));

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
    .string()
    .trim()
    .transform((value) => (value === "" ? undefined : value))
    .refine((value) => value === undefined || !Number.isNaN(Number(value)), {
      message: `${label} must be a valid number.`,
    })
    .transform((value) => (value === undefined ? undefined : Number(value)))
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
  phone: requiredString("Phone", 10),
  address: requiredString("Address", 5),
  password: requiredString("Password", 6),
});

export const profileSchema = z.object({
  name: requiredString("Name", 2),
  email: requiredString("Email").email("Enter a valid email address."),
  phone: requiredString("Phone", 10),
  address: requiredString("Address", 5),
  avatar: z.string().optional(),
});

export const passwordSchema = z
  .object({
    oldPassword: requiredString("Current password"),
    newPassword: requiredString("New password", 6),
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
  description: z.string().trim(),
  featured: z.boolean(),
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
  excerpt: requiredString("Excerpt", 10),
  author: z.string().trim(),
  readTime: z.string().trim(),
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
    badge: z.string().trim(),
    price: numericField("Price", { min: 1 }),
    originalPrice: optionalNumericField("Original price", { min: 1 }),
    categoryId: requiredString("Category"),
    colors: z.string().trim(),
    sizes: z.string().trim(),
    tags: z.string().trim(),
    stock: numericField("Stock", { integer: true, min: 0 }),
    description: requiredString("Description", 10),
    details: requiredString("Details", 10),
    featured: z.boolean(),
    images: z.array(z.string().trim()).min(1, "Add at least one product image."),
  })
  .refine((value) => value.originalPrice === undefined || value.originalPrice >= value.price, {
    message: "Original price must be greater than or equal to price.",
    path: ["originalPrice"],
  });

export { z };
