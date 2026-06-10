import express from "express";
import { register, login, refreshTokenHandler, googleLogin } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { authValidation } from "../validations/auth.validation.js";

const router = express.Router();

router.post("/register", validate(authValidation.register), register);

router.post("/login", validate(authValidation.login), login);

router.post("/refresh-token", validate(authValidation.refreshToken), refreshTokenHandler);

router.post("/google", validate(authValidation.googleLogin), googleLogin);

export default router;