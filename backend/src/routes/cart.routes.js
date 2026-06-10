import express from "express";

import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import { cartValidation } from "../validations/cart.validation.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

router.post("/add", verifyJWT(JWT_SECRET), validate(cartValidation.addToCart), addToCart);

router.get("/", verifyJWT(JWT_SECRET), getCart);

router.patch("/item/:id", verifyJWT(JWT_SECRET), validate(cartValidation.updateCartItem), updateCartItem);

router.delete("/item/:id", verifyJWT(JWT_SECRET), removeCartItem);

router.delete("/clear", verifyJWT(JWT_SECRET), clearCart);

export default router;
