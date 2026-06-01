import models from "../models/index.js";
import ResponseHandler from "../utils/responseHandler.js";

export const listProducts = async (req, res, next) => {
  try {
    const { isActive } = req.query;

    const filter = {};

    // 🔹 Default = true
    if (!isActive) {
      filter.isActive = true;
    } else {
      filter.isActive = isActive;
    }

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
    await models.Product.create(req.body);

    return ResponseHandler.success(
      res,
      "Product created successfully"
      
    );
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await models.Product.findById(id).select("-isActive");

    if (!product) {
      return ResponseHandler.notFound(
        res,
        "Product not found"
      );
    }

    return ResponseHandler.success(
      res,
      "Product fetched successfully",
      product
    );
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;


    const existingProduct = await models.Product.findById(id);

    if (!existingProduct) {
      return ResponseHandler.notFound(
        res,
        "Product not found"
      );
    }

    const updatedProduct = await models.Product.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    return ResponseHandler.success(
      res,
      "Product updated successfully"
    );
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await models.Product.findByIdAndDelete(id);

    if (!product) {
      return ResponseHandler.notFound(
        res,
        "Product not found"
      );
    }

    return ResponseHandler.success(
      res,
      "Product deleted successfully"
    );
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
      return ResponseHandler.notFound(
        res,
        "Product not found"
      );
    }

    product.isActive = isActive;

    await product.save();

    return ResponseHandler.success(
      res,
      `Product ${
        isActive ? "activated" : "deactivated"
      } successfully`
    );
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};