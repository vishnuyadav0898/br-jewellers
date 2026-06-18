import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  userMe,
  forgotPassword,
  updatePassword,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkPermission } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.js";
import { authValidation } from "../validations/auth.validation.js";
import { userValidation } from "../validations/user.validation.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.get("/list", verifyJWT(JWT_SECRET), getUsers);

router.get("/me", verifyJWT(JWT_SECRET), userMe);

router.get("/:id", verifyJWT(JWT_SECRET), getUserById);
router.patch("/:id", verifyJWT(JWT_SECRET), checkPermission("User", "Update"), validate(userValidation.update), updateUser);
router.delete("/:id", verifyJWT(JWT_SECRET), checkPermission("User", "Delete"), deleteUser);

router.post("/create", verifyJWT(JWT_SECRET), checkPermission("User", "Add"), validate(userValidation.create), createUser);

router.patch("/change-password", verifyJWT(JWT_SECRET), validate(userValidation.updatePassword), updatePassword);

router.post("/forgot-password", validate(userValidation.forgotPassword), forgotPassword);

export default router;