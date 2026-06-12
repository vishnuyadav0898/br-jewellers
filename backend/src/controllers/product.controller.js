import models from "../models/index.js";
import ResponseHandler from "../utils/responseHandler.js";
import xlsx from "xlsx";

export const listProducts = async (req, res, next) => {
  try {
    const {
      isActive,
      category,
      material,
      purity,
      size,
      minPrice,
      maxPrice,
      tags,
      search,
    } = req.query;

    const filter = {};

    if (!isActive) {
      filter.isActive = true;
    } else if (isActive !== "all") {
      filter.isActive = isActive === "true";
    } else {
      delete filter.isActive;
    }

    if (category) {
      const categories = category.split(",").map((c) => new RegExp(`^${c.trim()}$`, "i"));
      filter.category = { $in: categories };
    }

    if (material) {
      const materials = material.split(",").map((m) => new RegExp(`^${m.trim()}$`, "i"));
      filter["variants.attributes.material"] = { $in: materials };
    }
    if (purity) {
      const purities = purity.split(",").map((p) => new RegExp(`^${p.trim()}$`, "i"));
      filter["variants.attributes.purity"] = { $in: purities };
    }
    if (size) {
      const sizes = size.split(",").map((s) => new RegExp(`^${s.trim()}$`, "i"));
      filter["variants.attributes.size"] = { $in: sizes };
    }

    if (minPrice || maxPrice) {
      filter["variants.prices.amount"] = {};
      if (minPrice) filter["variants.prices.amount"].$gte = Number(minPrice);
      if (maxPrice) filter["variants.prices.amount"].$lte = Number(maxPrice);
    }

    // 5. Tags (New, Featured, etc.)
    const queryTags = [];
    if (tags) {
      tags.split(",").forEach((t) => queryTags.push(new RegExp(`^${t.trim()}$`, "i")));
    }

    if (queryTags.length > 0) {
      filter.tags = { $in: queryTags };
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { name: searchRegex },
        { category: searchRegex },
        { tags: searchRegex },
        { description: searchRegex },
        { shortDescription: searchRegex },
        { "variants.sku": searchRegex },
      ];
    }

    const products = await models.Product.find(filter)
      .sort({ createdAt: -1 });

    return ResponseHandler.success(
      res,
      "Products fetched successfully",
      products
    );
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { category, variants } = req.body;

    if (category) {
      const existingCategory = await models.Category.findOne({ name: category });
      if (!existingCategory) {
        return ResponseHandler.badRequest(res, `Category '${category}' does not exist.`);
      }
    }

    if (variants && Array.isArray(variants)) {
      const skus = variants.map(v => v.sku).filter(Boolean);
      if (new Set(skus).size !== skus.length) {
        return ResponseHandler.badRequest(res, "Duplicate SKUs found within the variants array.");
      }
    }

    await models.Product.create(req.body);

    return ResponseHandler.created(res, "Product created successfully");
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await models.Product.findById(id);

    if (!product) {
      return ResponseHandler.notFound(res, "Product not found");
    }

    return ResponseHandler.success(res, "Product fetched successfully", product);
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category, variants } = req.body;

    const existingProduct = await models.Product.findById(id);

    if (!existingProduct) {
      return ResponseHandler.notFound(res, "Product not found");
    }

    if (category) {
      const existingCategory = await models.Category.findOne({ name: category });
      if (!existingCategory) {
        return ResponseHandler.badRequest(res, `Category '${category}' does not exist.`);
      }
    }

    if (variants && Array.isArray(variants)) {
      const skus = variants.map(v => v.sku).filter(Boolean);
      if (new Set(skus).size !== skus.length) {
        return ResponseHandler.badRequest(res, "Duplicate SKUs found within the variants array.");
      }
    }

    await models.Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return ResponseHandler.success(res, "Product updated successfully");
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await models.Product.findByIdAndDelete(id);

    if (!product) {
      return ResponseHandler.notFound(res, "Product not found");
    }

    return ResponseHandler.success(res, "Product deleted successfully");
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const updateProductStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const product = await models.Product.findById(id);

    if (!product) {
      return ResponseHandler.notFound(res, "Product not found");
    }

    const nextActiveState = isActive === true || isActive === "true" || isActive === 1 || isActive === "1";
    product.isActive = nextActiveState;

    await product.save();

    return ResponseHandler.success(
      res,
      `Product ${nextActiveState ? "activated" : "deactivated"} successfully`
    );
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

// 🔹 Bulk Import via Excel
export const bulkImportProducts = async (req, res, next) => {
  try {
    if (!req.file) {
      return ResponseHandler.badRequest(res, "Excel file is required");
    }

    // Read Excel File
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      return ResponseHandler.badRequest(res, "Excel file is empty");
    }

    // Standard columns for Product / Variant
    const standardProductFields = ["name", "slug", "description", "shortDescription", "coverImage", "category", "gemstone", "occasions", "featured"];
    const standardVariantFields = ["sku", "price_INR", "price_USD", "isDefault", "image_url"];

    const productsMap = {};

    // First pass: Group rows by product name/slug and validate categories
    for (const row of rows) {
      const productName = row.name;
      if (!productName) {
        return ResponseHandler.badRequest(res, "Row is missing required 'name' field");
      }

      // Validate category if present
      if (row.category) {
        const cat = await models.Category.findOne({ name: row.category });
        if (!cat) {
          return ResponseHandler.badRequest(res, `Category '${row.category}' does not exist.`);
        }
      }

      if (!productsMap[productName]) {
        const featuredVal = row.featured === true || row.featured === "true" || row.featured === 1 || row.featured === "1" || String(row.featured || "").toLowerCase() === "yes";
        productsMap[productName] = {
          name: productName,
          slug: row.slug || productName.toLowerCase().replace(/ /g, "-"),
          description: row.description || "",
          shortDescription: row.shortDescription || "",
          coverImage: row.coverImage || "",
          category: row.category || "",
          gemstone: row.gemstone || "",
          occasions: row.occasions ? String(row.occasions).split(",").map((o) => o.trim()).filter(Boolean) : [],
          featured: featuredVal,
          variants: []
        };
      }

      // Build Variant
      const variant = {
        sku: row.sku ? String(row.sku) : undefined,
        isDefault: row.isDefault !== undefined ? Boolean(row.isDefault) : false,
        prices: [],
        images: [],
        attributes: {}
      };

      if (row.price_INR !== undefined) variant.prices.push({ currency: "INR", amount: Number(row.price_INR) });
      if (row.price_USD !== undefined) variant.prices.push({ currency: "USD", amount: Number(row.price_USD) });
      if (row.image_url) variant.images.push({ url: row.image_url, key: "" });

      // Gather Dynamic Attributes (anything not in standard fields)
      Object.keys(row).forEach(key => {
        if (!standardProductFields.includes(key) && !standardVariantFields.includes(key)) {
          variant.attributes[key] = String(row[key]);
        }
      });

      productsMap[productName].variants.push(variant);
    }

    const productsToInsert = Object.values(productsMap);

    // Compute priceRange for each product based on variant prices
    for (const product of productsToInsert) {
      const inrPrices = [];
      for (const variant of product.variants) {
        const inrPrice = variant.prices.find((p) => p.currency === "INR")?.amount;
        if (inrPrice !== undefined && !Number.isNaN(inrPrice)) {
          inrPrices.push(inrPrice);
        }
      }
      if (inrPrices.length > 0) {
        product.priceRange = {
          min: Math.min(...inrPrices),
          max: Math.max(...inrPrices)
        };
      } else {
        product.priceRange = { min: 0, max: 0 };
      }
    }

    await models.Product.insertMany(productsToInsert, { ordered: false });

    return ResponseHandler.created(res, "Bulk import successful");
  } catch (err) {
    if (err.code === 11000) {
      return ResponseHandler.badRequest(res, "Duplicate entry detected in file (e.g., duplicate sku or slug)");
    }
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};
