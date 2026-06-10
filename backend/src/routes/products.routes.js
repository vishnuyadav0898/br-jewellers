import express from "express";
import multer from "multer";

import {
  listProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  updateProductStatus,
  bulkImportProducts,
} from "../controllers/product.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.js";
import { productValidation } from "../validations/product.validation.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const JWT_SECRET = process.env.JWT_SECRET;

router.get("/list", listProducts);
router.get("/:id", getProductById);

router.post(
  "/create",
  verifyJWT(JWT_SECRET),
  requireAdmin,
  validate(productValidation.create),
  createProduct
);

router.post(
  "/bulk-import",
  verifyJWT(JWT_SECRET),
  requireAdmin,
  upload.single("file"),
  bulkImportProducts
);

router.patch(
  "/:id",
  verifyJWT(JWT_SECRET),
  requireAdmin,
  validate(productValidation.update),
  updateProduct
);

router.patch(
  "/status/:id",
  verifyJWT(JWT_SECRET),
  requireAdmin,
  validate(productValidation.updateStatus),
  updateProductStatus
);

router.delete("/:id", verifyJWT(JWT_SECRET), requireAdmin, deleteProduct);

export default router;
