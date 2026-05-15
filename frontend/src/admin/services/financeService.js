import { mockApiClient } from "../../shared/services/mockApiClient";

const monthLabel = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "2-digit",
  }).format(new Date(value));

export const financeService = {
  async getOverview() {
    return mockApiClient.query((db) => {
      const paidOrders = db.orders.filter((order) => order.paymentStatus === "Paid");
      const monthlyMap = new Map();

      db.orders.forEach((order) => {
        const key = monthLabel(order.createdAt);
        const current = monthlyMap.get(key) || {
          month: key,
          revenue: 0,
          orders: 0,
        };

        current.orders += 1;
        current.revenue += order.total;
        monthlyMap.set(key, current);
      });

      return {
        revenue: db.orders.reduce((sum, order) => sum + order.total, 0),
        paidRevenue: paidOrders.reduce((sum, order) => sum + order.total, 0),
        orders: db.orders.length,
        averageOrderValue:
          db.orders.length > 0
            ? Math.round(db.orders.reduce((sum, order) => sum + order.total, 0) / db.orders.length)
            : 0,
        monthlySales: Array.from(monthlyMap.values()),
      };
    });
  },
};
