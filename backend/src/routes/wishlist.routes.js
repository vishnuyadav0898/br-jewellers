import { Router } from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../controllers/wishlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import { wishlistValidation } from "../validations/wishlist.validation.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.get("/", verifyJWT(JWT_SECRET), getWishlist);

router.post(
  "/add",
  verifyJWT(JWT_SECRET),
  validate(wishlistValidation.add),
  addToWishlist
);

router.delete("/remove/:productId", verifyJWT(JWT_SECRET), removeFromWishlist);

export default router;
