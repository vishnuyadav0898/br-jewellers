import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import ResponseHandler from "../utils/responseHandler.js";

// 🔹 Create Review
export const createReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment, images } = req.body;
    const userId = req.user.id; // Provided by auth middleware

    // Validate inputs
    if (!rating || rating < 1 || rating > 5) {
      return ResponseHandler.badRequest(res, "Please provide a valid rating between 1 and 5.");
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return ResponseHandler.notFound(res, "Product not found.");
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview) {
      return ResponseHandler.badRequest(res, "You have already reviewed this product.");
    }

    // Verify purchase (Order status must be 'delivered' and contain the product)
    const hasPurchased = await Order.findOne({
      user: userId,
      "items.product": productId,
      status: "delivered",
    });

    if (!hasPurchased) {
      return ResponseHandler.forbidden(res, "You can only review products you have purchased and received.");
    }

    // Create review
    const review = await Review.create({
      product: productId,
      user: userId,
      rating,
      title,
      comment,
      images: images || [],
      isVerifiedPurchase: true,
    });

    // Update Product averageRating and numReviews
    const reviews = await Review.find({ product: productId });
    const numReviews = reviews.length;
    const averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

    product.averageRating = Number(averageRating.toFixed(1));
    product.numReviews = numReviews;
    await product.save();

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};

// 🔹 Get Product Reviews
export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { product: productId };

    const reviews = await Review.find(query)
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Reviews fetched successfully",
      data: {
        reviews,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
    });
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};

// 🔹 Check Review Eligibility
export const checkEligibility = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Check if already reviewed
    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview) {
      return res.status(200).json({
        success: true,
        data: { eligible: false, reason: "already_reviewed" },
      });
    }

    // Check purchase
    const hasPurchased = await Order.findOne({
      user: userId,
      "items.product": productId,
      status: "delivered",
    });

    if (!hasPurchased) {
      return res.status(200).json({
        success: true,
        data: { eligible: false, reason: "not_purchased_or_delivered" },
      });
    }

    return res.status(200).json({
      success: true,
      data: { eligible: true },
    });
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};

// 🔹 Delete Review (Admin only)
export const deleteReview = async (req, res, next) => {
  try {
    const { productId, reviewId } = req.params;
    
    // Check admin
    if (req.user.role !== "admin") {
      return ResponseHandler.forbidden(res, "Admin access required.");
    }

    const review = await Review.findOneAndDelete({ _id: reviewId, product: productId });
    if (!review) {
      return ResponseHandler.notFound(res, "Review not found.");
    }

    // Update Product averageRating and numReviews
    const product = await Product.findById(productId);
    if (product) {
      const reviews = await Review.find({ product: productId });
      const numReviews = reviews.length;
      const averageRating = numReviews > 0 ? reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews : 0;

      product.averageRating = Number(averageRating.toFixed(1));
      product.numReviews = numReviews;
      await product.save();
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};
