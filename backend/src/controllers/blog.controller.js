import models from "../models/index.js";
import ResponseHandler from "../utils/responseHandler.js";

export const getBlogs = async (req, res, next) => {
  try {
    const blogs = await models.Blog.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });
    return ResponseHandler.success(res, "Blogs fetched successfully", blogs);
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const getBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await models.Blog.findById(id).populate("author", "name email");

    if (!blog) {
      return ResponseHandler.notFound(res, "Blog not found");
    }

    return ResponseHandler.success(res, "Blog fetched successfully", blog);
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const createBlog = async (req, res, next) => {
  try {
    const blog = await models.Blog.create({
      ...req.body,
      author: req.user.id,
    });
    return ResponseHandler.created(res, "Blog created successfully", blog);
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await models.Blog.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("author", "name email");

    if (!blog) {
      return ResponseHandler.notFound(res, "Blog not found");
    }

    return ResponseHandler.success(res, "Blog updated successfully", blog);
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const blog = await models.Blog.findByIdAndDelete(id);

    if (!blog) {
      return ResponseHandler.notFound(res, "Blog not found");
    }

    return ResponseHandler.success(res, "Blog deleted successfully");
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};
