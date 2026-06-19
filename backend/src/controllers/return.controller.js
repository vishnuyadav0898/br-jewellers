import models from "../models/index.js";
import ResponseHandler from "../utils/responseHandler.js";

// 🔹 User: Request Return
export const requestReturn = async (req, res, next) => {
  try {
    const { orderId, reason, items } = req.body;
    const userId = req.user.id;

    const order = await models.Order.findById(orderId);
    if (!order) return ResponseHandler.notFound(res, "Order not found");

    if (order.user.toString() !== userId) {
      return ResponseHandler.forbidden(res, "You can only return your own orders");
    }

    if (order.status !== "delivered") {
      return ResponseHandler.badRequest(res, "Only delivered orders can be returned");
    }

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    if (order.updatedAt < threeDaysAgo) {
      return ResponseHandler.badRequest(res, "Return request window (3 days) has expired for this order");
    }

    // Validate quantities
    for (const item of items) {
      const orderItem = order.items.find(i => i.sku === item.sku);
      if (!orderItem) {
        return ResponseHandler.badRequest(res, `Item with SKU ${item.sku} not found in this order`);
      }

      // Check against previous return requests
      const previousReturns = await models.ReturnRequest.find({
        order: orderId,
        status: { $in: ["pending", "approved", "refunded"] }
      });

      let alreadyReturnedQty = 0;
      for (const pr of previousReturns) {
        const prItem = pr.itemsToReturn.find(i => i.sku === item.sku);
        if (prItem) {
          alreadyReturnedQty += prItem.quantity;
        }
      }

      if (item.quantity + alreadyReturnedQty > orderItem.quantity) {
        return ResponseHandler.badRequest(
          res, 
          `Cannot return ${item.quantity} of ${item.sku}. You originally ordered ${orderItem.quantity} and have already requested to return ${alreadyReturnedQty}.`
        );
      }
    }

    const returnRequest = await models.ReturnRequest.create({
      order: orderId,
      user: userId,
      reason,
      itemsToReturn: items
    });

    return ResponseHandler.created(res, "Return request submitted successfully");
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};

// 🔹 User: List My Returns
export const getMyReturns = async (req, res, next) => {
  try {
    const returns = await models.ReturnRequest.find({ user: req.user.id })
      .populate("order", "orderNumber totalAmount")
      .sort("-createdAt");

    return ResponseHandler.success(res, "Returns fetched successfully", returns);
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};

// 🔹 Admin: List All Returns
export const getAllReturns = async (req, res, next) => {
  try {
    const returns = await models.ReturnRequest.find()
      .populate("order", "orderNumber totalAmount")
      .populate("user", "name email")
      .sort("-createdAt");

    return ResponseHandler.success(res, "All returns fetched successfully", returns);
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};

// 🔹 Admin: Update Return Status
export const updateReturnStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const returnRequest = await models.ReturnRequest.findById(id);
    if (!returnRequest) return ResponseHandler.notFound(res, "Return request not found");

    returnRequest.status = status;
    if (adminNote) returnRequest.adminNote = adminNote;

    await returnRequest.save();

    // Optionally update the original order if it's completely refunded
    if (status === "refunded") {
      // In a real system, you'd check if ALL items are refunded before marking the whole order as refunded
      // For this simple implementation, we just update the return request.
    }

    return ResponseHandler.success(res, `Return request marked as ${status}`, returnRequest);
  } catch (error) {
    return ResponseHandler.handleErrors(error, req, res, next);
  }
};
