import express from "express";
import { createReview, getProductReviews, checkEligibility, deleteReview } from "../controllers/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/role.middleware.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Public routes
router.get("/:productId", getProductReviews);

// Protected routes
router.use(verifyJWT(JWT_SECRET));
router.post("/:productId", createReview);
router.get("/:productId/can-review", checkEligibility);

// Admin route
router.delete("/:productId/:reviewId", requireAdmin, deleteReview);

export default router;
