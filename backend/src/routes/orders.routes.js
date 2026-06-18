import express from "express";

import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/order.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkPermission } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.js";
import { orderValidation } from "../validations/order.validation.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

router.post(
  "/",
  verifyJWT(JWT_SECRET),
  validate(orderValidation.create),
  createOrder
);

router.get("/", verifyJWT(JWT_SECRET), getOrders);

router.get("/:id", verifyJWT(JWT_SECRET), getOrderById);

router.patch(
  "/:id/status",
  verifyJWT(JWT_SECRET),
  checkPermission("Order", "Update"),
  validate(orderValidation.updateStatus),
  updateOrderStatus
);

export default router;
