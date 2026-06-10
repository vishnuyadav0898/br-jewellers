import Category from "../models/category.model.js";
import ResponseHandler from "../utils/responseHandler.js";

export const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return ResponseHandler.badRequest(res, "Category name is required");
    }

    const existing = await Category.findOne({ name });
    if (existing) {
      return ResponseHandler.badRequest(res, "Category already exists");
    }

    await Category.create({ name });

    return ResponseHandler.created(res, "Category created successfully");
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    
    return ResponseHandler.success(
      res,
      "Categories fetched",
      categories.map((c) => c.name)
    );
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return ResponseHandler.badRequest(res, "Category name is required");
    }

    const existing = await Category.findOne({ name, _id: { $ne: id } });
    if (existing) {
      return ResponseHandler.badRequest(res, "Category name already exists");
    }

    const category = await Category.findByIdAndUpdate(id, { name });

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

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return ResponseHandler.notFound(res, "Category not found");
    }

    return ResponseHandler.success(res, "Category deleted successfully");
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};
