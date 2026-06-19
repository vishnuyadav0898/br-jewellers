import express from "express";
import {
  requestReturn,
  getMyReturns,
  getAllReturns,
  updateReturnStatus,
} from "../controllers/return.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkPermission } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.js";
import { returnValidation } from "../validations/return.validation.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.use(verifyJWT(JWT_SECRET));

// User Routes
router.post("/request", validate(returnValidation.request), requestReturn);
router.get("/my-returns", getMyReturns);

// Admin Routes
router.get("/admin/list", checkPermission("Returns", "View"), getAllReturns);
router.patch("/admin/:id", checkPermission("Returns", "Update"), validate(returnValidation.updateAdmin), updateReturnStatus);

export default router;
