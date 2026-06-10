import models from "../models/index.js";
import ResponseHandler from "../utils/responseHandler.js";
import xlsx from "xlsx";

export const listProducts = async (req, res, next) => {
  try {
    const { isActive, category, material, purity } = req.query;

    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive;
    } else {
      filter.isActive = true;
    }

    if (category) filter.category = category;
    if (material) filter["variants.attributes.material"] = material;
    if (purity) filter["variants.attributes.purity"] = purity;

    const products = await models.Product.find(filter)
      .select("-isActive")
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
    const { category } = req.body;

    if (category) {
      const existingCategory = await models.Category.findOne({ name: category });
      if (!existingCategory) {
        return ResponseHandler.badRequest(res, `Category '${category}' does not exist.`);
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

    const product = await models.Product.findById(id).select("-isActive");

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
    const { category } = req.body;

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

    product.isActive = isActive;

    await product.save();

    return ResponseHandler.success(
      res,
      `Product ${isActive ? "activated" : "deactivated"} successfully`
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
    const standardProductFields = ["name", "slug", "description", "shortDescription", "coverImage", "category"];
    const standardVariantFields = ["sku", "price_INR", "price_USD", "isAvailable", "isDefault", "image_url"];

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
        productsMap[productName] = {
          name: productName,
          slug: row.slug || productName.toLowerCase().replace(/ /g, "-"),
          description: row.description || "",
          shortDescription: row.shortDescription || "",
          coverImage: row.coverImage || "",
          category: row.category || "",
          variants: []
        };
      }

      // Build Variant
      const variant = {
        sku: row.sku ? String(row.sku) : undefined,
        isAvailable: row.isAvailable !== undefined ? Boolean(row.isAvailable) : true,
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

    await models.Product.insertMany(productsToInsert, { ordered: false });

    return ResponseHandler.created(res, "Bulk import successful");
  } catch (err) {
    if (err.code === 11000) {
      return ResponseHandler.badRequest(res, "Duplicate entry detected in file (e.g., duplicate sku or slug)");
    }
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};