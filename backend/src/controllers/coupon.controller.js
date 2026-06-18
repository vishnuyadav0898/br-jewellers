import models from "../models/index.js";
import ResponseHandler from "../utils/responseHandler.js";

export const createCoupon = async (req, res, next) => {
  try {
    const code = req.body.code.toUpperCase();
    
    const existingCoupon = await models.Coupon.findOne({ code });
    if (existingCoupon) {
      return ResponseHandler.badRequest(res, "Coupon code already exists");
    }

    req.body.code = code;
    const coupon = await models.Coupon.create(req.body);
    return ResponseHandler.created(res, "Coupon created successfully");
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};

export const listCoupons = async (req, res, next) => {
  try {
    const coupons = await models.Coupon.find().sort("-createdAt");
    return ResponseHandler.success(res, "Coupons fetched successfully", coupons);
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await models.Coupon.findByIdAndUpdate(id, req.body, { returnDocument: "after" });
    if (!coupon) return ResponseHandler.notFound(res, "Coupon not found");

    return ResponseHandler.success(res, "Coupon updated successfully");
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await models.Coupon.findByIdAndDelete(id);
    if (!coupon) return ResponseHandler.notFound(res, "Coupon not found");

    await models.CouponAssignment.deleteMany({ coupon: id });

    return ResponseHandler.success(res, "Coupon deleted successfully");
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};

export const assignCoupon = async (req, res, next) => {
  try {
    const { couponId, userId } = req.body;

    const coupon = await models.Coupon.findById(couponId);
    if (!coupon) return ResponseHandler.notFound(res, "Coupon not found");

    const user = await models.User.findById(userId);
    if (!user) return ResponseHandler.notFound(res, "User not found");

    const existing = await models.CouponAssignment.findOne({ coupon: couponId, user: userId });
    if (existing) {
      return ResponseHandler.badRequest(res, "Coupon is already assigned to this user");
    }

    const assignment = await models.CouponAssignment.create({
      coupon: couponId,
      user: userId,
    });

    return ResponseHandler.created(res, "Coupon assigned successfully");
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};

export const removeAssignedCoupon = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await models.CouponAssignment.findByIdAndDelete(assignmentId);
    if (!assignment) {
      return ResponseHandler.notFound(res, "Assignment not found");
    }

    return ResponseHandler.success(res, "Coupon assignment removed successfully");
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};

export const getAssignedCoupons = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const filter = {};

    if (userId) {
      filter.user = userId;
    }

    const assignments = await models.CouponAssignment.find(filter)
      .populate("coupon")
      .populate("user", "name email")
      .sort("-createdAt");

    return ResponseHandler.success(res, "Assigned coupons fetched successfully", assignments);
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};
