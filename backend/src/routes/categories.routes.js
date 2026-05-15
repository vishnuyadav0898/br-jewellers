import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getCategories } from "../controllers/category.controller.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
router.get("/list",  verifyJWT(JWT_SECRET), getCategories);

export default router;