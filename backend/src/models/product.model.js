import mongoose, { Schema } from "mongoose";

const priceSchema = new Schema(
  {
    currency: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const variantSchema = new Schema({
  sku: { type: String, sparse: true },
  attributes: {
    type: Map,
    of: String,
  },
  prices: [priceSchema],

  images: [
    {
      url: String,
      key: String,
    },
  ],
  isDefault: { type: Boolean, default: false },
});

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
    },
    coverImage: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        type: String,
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    category: {
      type: String,
      trim: true,
    },
    gemstone: {
      type: String,
      trim: true,
    },
    occasions: [
      {
        type: String,
        trim: true,
      },
    ],
    priceRange: {
      min: {
        type: Number,
      },
      max: {
        type: Number,
      },
    },
    featured: {
      type: Boolean,
      default: false,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    variants: [variantSchema],
  },
  {
    timestamps: true,
  }
);

// Wildcard index for super fast faceted searching on dynamic attributes
productSchema.index({ "variants.attributes.$**": 1 });

export default mongoose.model("Product", productSchema);
