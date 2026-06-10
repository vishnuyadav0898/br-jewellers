import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import ResponseHandler from "../utils/responseHandler.js";

export const addToCart = async (req, res, next) => {
  try {
    const { productId, sku, quantity = 1 } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return ResponseHandler.notFound(res, "Product not found");
    }

    // Validate sku exists and is available
    const variant = product.variants.find((v) => v.sku === sku);
    if (!variant) {
      return ResponseHandler.badRequest(res, "Variant SKU not found");
    }

    if (!variant.isAvailable) {
      return ResponseHandler.badRequest(res, "Variant is currently unavailable");
    }

    // Find or create cart for this user
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [{ product: productId, sku, quantity }],
      });

      return ResponseHandler.created(res, "Item added to cart");
    }

    // Check if same product + sku already exists
    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.sku === sku
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, sku, quantity });
    }

    await cart.save();

    return ResponseHandler.success(res, "Item added to cart");
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );

    if (!cart) {
      return ResponseHandler.success(res, "Cart is empty", {
        user: req.user.id,
        items: [],
      });
    }

    return ResponseHandler.success(res, "Cart fetched successfully", cart);
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return ResponseHandler.notFound(res, "Cart not found");
    }

    const item = cart.items.id(id);

    if (!item) {
      return ResponseHandler.notFound(res, "Cart item not found");
    }

    item.quantity = quantity;
    await cart.save();

    return ResponseHandler.success(res, "Cart item updated");
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return ResponseHandler.notFound(res, "Cart not found");
    }

    const item = cart.items.id(id);

    if (!item) {
      return ResponseHandler.notFound(res, "Cart item not found");
    }

    cart.items.pull({ _id: id });
    await cart.save();

    return ResponseHandler.success(res, "Item removed from cart");
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return ResponseHandler.notFound(res, "Cart not found");
    }

    cart.items = [];
    await cart.save();

    return ResponseHandler.success(res, "Cart cleared successfully");
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};
