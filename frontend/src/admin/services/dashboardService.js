import { mockApiClient } from "../../shared/services/mockApiClient";

export const dashboardService = {
  async getOverview() {
    return mockApiClient.query((db) => {
      const orders = Array.isArray(db?.orders) ? db.orders : [];
      const products = Array.isArray(db?.products) ? db.products : [];
      const users = Array.isArray(db?.users) ? db.users : [];
      const refundRequests = Array.isArray(db?.refundRequests) ? db.refundRequests : [];

      const pendingOrders = orders.filter((order) =>
        ["Ordered", "Pending", "Processing", "Shipped"].includes(order.status)
      );
      const pendingRefunds = refundRequests.filter((request) => request.status === "Pending");
      const lowStockProducts = products
        .filter((product) => Number(product.stock) <= 10)
        .slice(0, 5);

      return {
        stats: {
          revenue: orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0),
          products: products.length,
          users: users.filter((user) => user.role !== "admin").length,
          pendingOrders: pendingOrders.length,
          pendingRefunds: pendingRefunds.length,
        },
        recentOrders: orders.slice(0, 5),
        pendingRefunds: pendingRefunds.slice(0, 5),
        lowStockProducts,
      };
    });
  },
};
