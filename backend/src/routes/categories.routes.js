import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/role.middleware.js";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.get("/list", getCategories); // Public
router.post("/create", verifyJWT(JWT_SECRET), requireAdmin, createCategory);
router.patch("/:id", verifyJWT(JWT_SECRET), requireAdmin, updateCategory);
router.delete("/:id", verifyJWT(JWT_SECRET), requireAdmin, deleteCategory);

export default router;