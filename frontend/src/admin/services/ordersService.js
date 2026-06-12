import { apiClient } from "../../shared/services/apiClient";
import { mockApiClient } from "../../shared/services/mockApiClient";
import { initialData } from "../../mock/data";

const isApiFallbackError = (error) => false;

const buildFallbackTimeline = (order) => {
  const stepLabels = ["Ordered", "Processing", "Shipped", "Delivered"];
  const currentStepIndex = Math.max(stepLabels.indexOf(order?.status), 0);

  return stepLabels.map((label, index) => ({
    id: `${order?.id || "order"}-${label.toLowerCase()}`,
    label,
    completed: index <= currentStepIndex,
    timestamp: index <= currentStepIndex ? order?.createdAt || new Date().toISOString() : null,
    note:
      index <= currentStepIndex
        ? `${label} status is updated and confirmed.`
        : "Awaiting the next update in the fulfilment timeline.",
  }));
};

const mapBackendStatusToFrontend = (status) => {
  if (!status) return "Pending";
  const lower = status.toLowerCase();
  if (lower === "confirmed") return "Ordered";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const mapFrontendStatusToBackend = (status) => {
  if (!status) return "pending";
  const lower = status.toLowerCase();
  if (lower === "ordered" || lower === "processing") return "confirmed";
  return lower;
};

const formatSkuName = (sku = "") => {
  if (!sku) return "Premium Jewellery Item";
  return sku
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const normalizeApiOrder = (order = {}) => {
  const items = (Array.isArray(order.items) ? order.items : []).map((item) => ({
    productId: item.product?._id || item.product,
    sku: item.sku || "",
    quantity: item.quantity || 1,
    name: item.product?.name || formatSkuName(item.sku),
    image: item.product?.coverImage || item.product?.images?.[0] || "",
    price: item.price?.INR || 0,
  }));

  const shippingAddress = {
    name: order.shippingAddress?.fullName || order.shippingAddress?.name || "",
    line1: order.shippingAddress?.line1 || "",
    city: order.shippingAddress?.city || "",
    state: order.shippingAddress?.state || "",
    pincode: order.shippingAddress?.zip || order.shippingAddress?.pincode || "",
  };

  const status = mapBackendStatusToFrontend(order.status);

  return {
    id: order._id || order.id,
    orderNumber: order.orderNumber || `ORD-${String(order._id || "").slice(-6).toUpperCase()}`,
    createdAt: order.createdAt,
    customerName: order.user?.name || order.shippingAddress?.fullName || "Customer",
    customerEmail: order.user?.email || order.shippingAddress?.phone || "",
    total: order.totalAmount?.INR || 0,
    status,
    paymentStatus: order.paymentStatus || "Paid",
    shippingAddress,
    items,
    timeline: buildFallbackTimeline({
      status,
      createdAt: order.createdAt,
    }),
  };
};

const enrichOrder = (db, order) => {
  const user = db.users.find((entry) => entry.id === order.userId);

  return {
    ...order,
    customerName: user?.name || order.userId,
    customerEmail: user?.email || "Unknown",
    items: Array.isArray(order?.items) ? order.items : [],
    timeline:
      Array.isArray(order?.timeline) && order.timeline.length ? order.timeline : buildFallbackTimeline(order),
  };
};

export const ordersService = {
  async getOrders(filter = "all") {
    try {
      const orders = await apiClient.get("/api/v1/orders");
      const normalized = (Array.isArray(orders) ? orders : []).map(normalizeApiOrder);

      return normalized.filter((order) => {
        if (filter === "pending") {
          return ["Ordered", "Pending", "Processing", "Shipped"].includes(order.status);
        }
        return true;
      });
    } catch (error) {
      if (!isApiFallbackError(error)) throw error;
    }

    return mockApiClient.query((db) => {
      const source =
        Array.isArray(db.orders) && db.orders.length ? db.orders : initialData.orders || [];
      const filtered = source.filter((order) => {
        if (filter === "pending") {
          return ["Ordered", "Pending", "Processing", "Shipped"].includes(order.status);
        }

        return true;
      });

      return filtered
        .map((order) => enrichOrder(db, order))
        .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
    });
  },

  async getTrackingOrders() {
    try {
      const orders = await apiClient.get("/api/v1/orders");
      return (Array.isArray(orders) ? orders : []).map(normalizeApiOrder);
    } catch (error) {
      if (!isApiFallbackError(error)) throw error;
    }

    return mockApiClient.query((db) => {
      const source =
        Array.isArray(db.orders) && db.orders.length ? db.orders : initialData.orders || [];

      return source
        .map((order) => enrichOrder(db, order))
        .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
    });
  },

  async getOrderDetails(orderId) {
    try {
      const order = await apiClient.get(`/api/v1/orders/${orderId}`);
      return normalizeApiOrder(order);
    } catch (error) {
      if (!isApiFallbackError(error)) throw error;
    }

    return mockApiClient.query((db) => {
      const order = db.orders.find((entry) => entry.id === orderId);
      if (!order) throw new Error("Order not found.");
      return enrichOrder(db, order);
    });
  },

  async updateOrder(orderId, payload) {
    try {
      if (payload.status) {
        await apiClient.patch(`/api/v1/orders/${orderId}/status`, {
          status: mapFrontendStatusToBackend(payload.status),
        });
        return true;
      }
    } catch (error) {
      if (!isApiFallbackError(error)) throw error;
    }

    return mockApiClient.mutate((db) => {
      const order = db.orders.find((entry) => entry.id === orderId);
      if (!order) throw new Error("Order not found.");

      Object.assign(order, payload);
      return db;
    });
  },
};
