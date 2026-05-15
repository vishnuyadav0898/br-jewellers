import { mockApiClient } from "../../shared/services/mockApiClient";
import { initialData } from "../../mock/data";

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
        ? `${label} status is available in mock order data.`
        : "Awaiting the next update in the mock fulfilment timeline.",
  }));
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
    return mockApiClient.query((db) => {
      const source =
        Array.isArray(db.orders) && db.orders.length ? db.orders : initialData.orders || [];

      return source
        .map((order) => enrichOrder(db, order))
        .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
    });
  },

  async getOrderDetails(orderId) {
    return mockApiClient.query((db) => {
      const order = db.orders.find((entry) => entry.id === orderId);
      if (!order) throw new Error("Order not found.");
      return enrichOrder(db, order);
    });
  },

  async updateOrder(orderId, payload) {
    return mockApiClient.mutate((db) => {
      const order = db.orders.find((entry) => entry.id === orderId);
      if (!order) throw new Error("Order not found.");

      Object.assign(order, payload);
      return db;
    });
  },
};
