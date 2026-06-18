import models from "../models/index.js";
import ResponseHandler from "../utils/responseHandler.js";

export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const product = await models.Product.findById(productId);
    if (!product) {
      return ResponseHandler.notFound(res, "Product not found");
    }

    let wishlist = await models.Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = await models.Wishlist.create({
        user: req.user.id,
        products: [productId],
      });
      return ResponseHandler.created(res, "Product added to wishlist");
    }

    if (wishlist.products.includes(productId)) {
      return ResponseHandler.badRequest(res, "Product already in wishlist");
    }

    wishlist.products.push(productId);
    await wishlist.save();

    return ResponseHandler.success(res, "Product added to wishlist");
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlist = await models.Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      return ResponseHandler.notFound(res, "Wishlist not found");
    }

    if (!wishlist.products.includes(productId)) {
      return ResponseHandler.notFound(res, "Product not found in wishlist");
    }

    wishlist.products.pull(productId);
    await wishlist.save();

    return ResponseHandler.success(res, "Product removed from wishlist");
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await models.Wishlist.findOne({ user: req.user.id }).populate(
      "products"
    );

    if (!wishlist) {
      return ResponseHandler.success(res, "Wishlist is empty", {
        user: req.user.id,
        products: [],
      });
    }

    return ResponseHandler.success(res, "Wishlist fetched successfully", wishlist);
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};
