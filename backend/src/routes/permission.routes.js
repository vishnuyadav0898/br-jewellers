import express from "express";
import {
  getAllPermissions,
  getUserPermissions,
  assignPermissions,
} from "../controllers/permission.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkPermission } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.js";
import { permissionValidation } from "../validations/permission.validation.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.get(
  "/list",
  verifyJWT(JWT_SECRET),
  checkPermission("Permission", "View"),
  getAllPermissions
);

router.get(
  "/user/:userId",
  verifyJWT(JWT_SECRET),
  checkPermission("Permission", "View"),
  getUserPermissions
);

router.patch(
  "/user/:userId",
  verifyJWT(JWT_SECRET),
  checkPermission("Permission", "Assign"),
  validate(permissionValidation.assign),
  assignPermissions
);

export default router;
