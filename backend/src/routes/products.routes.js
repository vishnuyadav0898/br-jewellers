import express from "express";

import {
  listProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductStatus,
} from "../controllers/product.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.js";
import { productValidation } from "../validations/product.validation.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;


router.get("/list", listProducts);
router.get("/:id", getProductById);
router.post("/create", verifyJWT(JWT_SECRET), validate(productValidation.create), createProduct,);
router.patch("/:id",verifyJWT(JWT_SECRET), validate(productValidation.update), updateProduct,);
router.patch("/status/:id", verifyJWT(JWT_SECRET),   validate(productValidation.updateStatus), updateProductStatus);
router.delete("/:id", verifyJWT(JWT_SECRET), deleteProduct);

export default router;
