import express from "express";
import {
  registerToken,
  sendManualNotification,
  getAllNotifications,
} from "../controllers/notification.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkPermission } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.js";
import { notificationValidation } from "../validations/notification.validation.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.use(verifyJWT(JWT_SECRET));

// User Routes
router.post("/register-token", validate(notificationValidation.registerToken), registerToken);

// Admin Routes
router.post("/admin/send", checkPermission("Notifications", "Send"), validate(notificationValidation.sendManual), sendManualNotification);
router.get("/admin/list", checkPermission("Notifications", "View"), getAllNotifications);

export default router;
