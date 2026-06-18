import models from "../models/index.js";
import ResponseHandler from "../utils/responseHandler.js";

export const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return ResponseHandler.badRequest(res, "Category name is required");
    }

    const existing = await models.Category.findOne({ name });
    if (existing) {
      return ResponseHandler.badRequest(res, "Category already exists");
    }

    await models.Category.create({ name, description });

    return ResponseHandler.created(res, "Category created successfully");
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await models.Category.find().sort({ name: 1 });
    
    return ResponseHandler.success(
      res,
      "Categories fetched",
       categories
    );
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return ResponseHandler.badRequest(res, "Category name is required");
    }

    const existing = await models.Category.findOne({ name, _id: { $ne: id } });
    if (existing) {
      return ResponseHandler.badRequest(res, "Category name already exists");
    }

    const category = await models.Category.findByIdAndUpdate(id, { name, description });

    if (!category) {
      return ResponseHandler.notFound(res, "Category not found");
    }

    return ResponseHandler.success(res, "Category updated successfully");
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await models.Category.findByIdAndDelete(id);

    if (!category) {
      return ResponseHandler.notFound(res, "Category not found");
    }

    return ResponseHandler.success(res, "Category deleted successfully");
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const toggleCategoryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["active", "inactive"].includes(status)) {
      return ResponseHandler.badRequest(res, "Valid status ('active' or 'inactive') is required");
    }

    const category = await models.Category.findByIdAndUpdate(id, { status }, { new: true });

    if (!category) {
      return ResponseHandler.notFound(res, "Category not found");
    }

    return ResponseHandler.success(res, `Category status updated to ${status}`, category);
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};
