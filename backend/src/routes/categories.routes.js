import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkPermission } from "../middlewares/role.middleware.js";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from "../controllers/category.controller.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.get("/list", getCategories); // Public
router.post("/create", verifyJWT(JWT_SECRET), checkPermission("Category", "Add"), createCategory);
router.patch("/:id", verifyJWT(JWT_SECRET), checkPermission("Category", "Update"), updateCategory);
router.patch("/:id/status", verifyJWT(JWT_SECRET), checkPermission("Category", "Update"), toggleCategoryStatus);
router.delete("/:id", verifyJWT(JWT_SECRET), checkPermission("Category", "Delete"), deleteCategory);

export default router;