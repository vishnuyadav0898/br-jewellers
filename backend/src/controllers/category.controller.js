import models from "../models/index.js";
import ResponseHandler from "../utils/responseHandler.js";

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, status, isActive } = req.body;
    
    if (!name) {
      return ResponseHandler.badRequest(res, "Category name is required");
    }

    const existing = await models.Category.findOne({ name });
    if (existing) {
      return ResponseHandler.badRequest(res, "Category already exists");
    }

    let statusValue = "inactive";
    if (status !== undefined) {
      statusValue = status;
    } else if (isActive !== undefined) {
      statusValue = isActive ? "active" : "inactive";
    }

    await models.Category.create({ name, description, status: statusValue });

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
    const { name, description, status, isActive } = req.body;

    const updateFields = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return ResponseHandler.badRequest(res, "Category name is required");
      }
      const existing = await models.Category.findOne({ name: name.trim(), _id: { $ne: id } });
      if (existing) {
        return ResponseHandler.badRequest(res, "Category name already exists");
      }
      updateFields.name = name.trim();
    }

    if (description !== undefined) {
      updateFields.description = description.trim();
    }

    if (status !== undefined) {
      if (!["active", "inactive"].includes(status)) {
        return ResponseHandler.badRequest(res, "Valid status ('active' or 'inactive') is required");
      }
      updateFields.status = status;
    } else if (isActive !== undefined) {
      updateFields.status = isActive ? "active" : "inactive";
    }

    if (Object.keys(updateFields).length === 0) {
      return ResponseHandler.badRequest(res, "No fields to update");
    }

    const category = await models.Category.findByIdAndUpdate(id, updateFields, { new: true });

    if (!category) {
      return ResponseHandler.notFound(res, "Category not found");
    }

    return ResponseHandler.success(res, "Category updated successfully", category);
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

    const category = await models.Category.findByIdAndUpdate(id, { status }, { returnDocument: "after" });

    if (!category) {
      return ResponseHandler.notFound(res, "Category not found");
    }

    return ResponseHandler.success(res, `Category status updated to ${status}`, category);
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};
