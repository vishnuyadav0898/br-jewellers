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
import { checkPermission } from "../middlewares/role.middleware.js";
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
  checkPermission("Product", "Add"),
  validate(productValidation.create),
  createProduct
);

router.post(
  "/bulk-import",
  verifyJWT(JWT_SECRET),
  checkPermission("Product", "Add"),
  upload.single("file"),
  bulkImportProducts
);

router.patch(
  "/status/:id",
  verifyJWT(JWT_SECRET),
  checkPermission("Product", "Update"),
  validate(productValidation.updateStatus),
  updateProductStatus
);

router.patch(
  "/:id",
  verifyJWT(JWT_SECRET),
  checkPermission("Product", "Update"),
  validate(productValidation.update),
  updateProduct
);

router.delete("/:id", verifyJWT(JWT_SECRET), checkPermission("Product", "Delete"), deleteProduct);

export default router;
