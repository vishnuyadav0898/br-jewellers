import express from "express";
import {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blog.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.js";
import { blogValidation } from "../validations/blog.validation.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Public routes
router.get("/", getBlogs);
router.get("/:id", getBlogById);

// Admin routes
router.post(
  "/",
  verifyJWT(JWT_SECRET),
  requireAdmin,
  validate(blogValidation.create),
  createBlog
);

router.patch(
  "/:id",
  verifyJWT(JWT_SECRET),
  requireAdmin,
  validate(blogValidation.update),
  updateBlog
);

router.delete("/:id", verifyJWT(JWT_SECRET), requireAdmin, deleteBlog);

export default router;
