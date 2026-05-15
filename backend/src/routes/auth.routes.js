import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { authValidation } from "../validations/auth.validation.js";

const router = express.Router();

// ✅ Apply validation
router.post("/register", validate(authValidation.register), register);
router.post("/login", validate(authValidation.login), login);

export default router;