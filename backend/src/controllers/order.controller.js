import models from "../models/index.js";
import ResponseHandler from "../utils/responseHandler.js";

// Valid status transitions (current → allowed next statuses)
const STATUS_ORDER = ["pending", "confirmed", "shipped", "delivered"];

const isValidTransition = (currentStatus, newStatus) => {
  // Can always cancel (unless already delivered)
  if (newStatus === "cancelled") {
    return currentStatus !== "delivered";
  }

  // Cannot transition from cancelled
  if (currentStatus === "cancelled") {
    return false;
  }

  // Can only move forward
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const newIndex = STATUS_ORDER.indexOf(newStatus);

  return newIndex > currentIndex;
};

// 🔹 Create Order
export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { addressId, items: bodyItems } = req.body;

    // Validate address belongs to user
    const address = await models.Address.findById(addressId);

    if (!address) {
      return ResponseHandler.notFound(res, "Address not found");
    }

    if (address.user.toString() !== userId) {
      return ResponseHandler.badRequest(
        res,
        "Address does not belong to the user"
      );
    }

    // Determine items source
    let orderItems = [];

    if (bodyItems && bodyItems.length > 0) {
      // Use items from request body
      for (const item of bodyItems) {
        const product = await models.Product.findById(item.productId);
        if (!product) {
          return ResponseHandler.notFound(
            res,
            `Product not found: ${item.productId}`
          );
        }

        const sku = item.sku;
        const variant = product.variants.find((v) => v.sku === sku);

        if (!variant) {
          return ResponseHandler.badRequest(
            res,
            `Variant SKU ${sku} for product ${product.name} is not found`
          );
        }

        const priceINR = variant.prices.find((p) => p.currency === "INR")?.amount || 0;
        const priceUSD = variant.prices.find((p) => p.currency === "USD")?.amount || 0;

        orderItems.push({
          product: product._id,
          sku,
          quantity: item.quantity,
          price: {
            INR: priceINR,
            USD: priceUSD,
          },
        });
      }
    } else {
      // Pull items from user's cart
      const cart = await models.Cart.findOne({ user: userId });

      if (!cart || !cart.items || cart.items.length === 0) {
        return ResponseHandler.badRequest(res, "Cart is empty");
      }

      for (const cartItem of cart.items) {
        const product = await models.Product.findById(cartItem.product);
        if (!product) {
          return ResponseHandler.notFound(
            res,
            `Product not found: ${cartItem.product}`
          );
        }

        const sku = cartItem.sku;
        const variant = product.variants.find((v) => v.sku === sku);

        if (!variant) {
          return ResponseHandler.badRequest(
            res,
            `Variant SKU ${sku} for product ${product.name} is not found`
          );
        }

        const priceINR = variant.prices.find((p) => p.currency === "INR")?.amount || 0;
        const priceUSD = variant.prices.find((p) => p.currency === "USD")?.amount || 0;

        orderItems.push({
          product: product._id,
          sku,
          quantity: cartItem.quantity,
          price: {
            INR: priceINR,
            USD: priceUSD,
          },
        });
      }
    }

    // Calculate total amount
    const totalAmount = orderItems.reduce(
      (acc, item) => ({
        INR: acc.INR + item.price.INR * item.quantity,
        USD: acc.USD + item.price.USD * item.quantity,
      }),
      { INR: 0, USD: 0 }
    );

    // Build shipping address snapshot
    const shippingAddress = {
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country || "India",
    };

    // Create order
    const order = await models.Order.create({
      user: userId,
      items: orderItems,
      shippingAddress,
      totalAmount,
    });

    // Clear cart if items were pulled from it
    if (!bodyItems || bodyItems.length === 0) {
      await models.Cart.findOneAndUpdate({ user: userId }, { items: [] });
    }

    return ResponseHandler.created(res, "Order created successfully");
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

// 🔹 Get Orders
export const getOrders = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;
    const filter = {};

    if (role === "admin") {
      // Admin can optionally filter by user
      if (req.query.user) {
        filter.user = req.query.user;
      }
    } else {
      // Regular users see only their own orders
      filter.user = userId;
    }

    const orders = await models.Order.find(filter)
      .populate("items.product", "name coverImage")
      .sort({ createdAt: -1 });

    return ResponseHandler.success(res, "Orders fetched successfully", orders);
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

// 🔹 Get Order by ID
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await models.Order.findById(id)
      .populate("items.product", "name coverImage images category")
      .populate("user", "name email");

    if (!order) {
      return ResponseHandler.notFound(res, "Order not found");
    }

    // Non-admin users can only view their own orders
    if (req.user.role !== "admin" && order.user._id.toString() !== req.user.id) {
      return ResponseHandler.notFound(res, "Order not found");
    }

    return ResponseHandler.success(res, "Order fetched successfully", order);
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};

// 🔹 Update Order Status (Admin only)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await models.Order.findById(id);

    if (!order) {
      return ResponseHandler.notFound(res, "Order not found");
    }

    // Validate status transition
    if (!isValidTransition(order.status, status)) {
      return ResponseHandler.badRequest(
        res,
        `Invalid status transition from '${order.status}' to '${status}'`
      );
    }

    order.status = status;
    await order.save();

    return ResponseHandler.success(
      res,
      "Order status updated successfully"
    );
  } catch (err) {
    return ResponseHandler.handleErrors(err, req, res, next);
  }
};
