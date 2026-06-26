import express from "express";
import {
  createCoupon,
  listCoupons,
  updateCoupon,
  deleteCoupon,
  assignCoupon,
  removeAssignedCoupon,
  getAssignedCoupons,
} from "../controllers/coupon.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { checkPermission } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.js";
import { couponValidation } from "../validations/coupon.validation.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.use(verifyJWT(JWT_SECRET));

router.post("/create", checkPermission("Coupon", "Add"), validate(couponValidation.create), createCoupon);
router.get("/list", checkPermission("Coupon", "View"), listCoupons);
router.patch("/:id", checkPermission("Coupon", "Update"), validate(couponValidation.update), updateCoupon);
router.delete("/:id", checkPermission("Coupon", "Delete"), deleteCoupon);

router.post("/assign", checkPermission("Coupon", "Assign"), validate(couponValidation.assign), assignCoupon);
router.delete("/assign/:assignmentId", checkPermission("Coupon", "Assign"), removeAssignedCoupon);
router.get("/assigned", getAssignedCoupons);

export default router;
