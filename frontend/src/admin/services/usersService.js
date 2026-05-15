import { mockApiClient } from "../../shared/services/mockApiClient";
import { initialData } from "../../mock/data";

const getUserSource = (db) =>
  Array.isArray(db.users) && db.users.length ? db.users : initialData.users || [];
const getOrderSource = (db) =>
  Array.isArray(db.orders) && db.orders.length ? db.orders : initialData.orders || [];
const getRefundSource = (db) =>
  Array.isArray(db.refundRequests) && db.refundRequests.length ? db.refundRequests : [];

export const usersService = {
  async getUsers() {
    return mockApiClient.query((db) => {
      const users = getUserSource(db);
      const orders = getOrderSource(db);
      const refundRequests = getRefundSource(db);

      return users
        .filter((user) => user.role !== "admin")
        .map((user) => ({
          ...user,
          totalOrders: orders.filter((order) => order.userId === user.id).length,
          totalSpend: orders
            .filter((order) => order.userId === user.id)
            .reduce((sum, order) => sum + order.total, 0),
          returnRequests: refundRequests.filter((request) => request.userId === user.id).length,
        }));
    });
  },

  async getUserDetails(userId) {
    return mockApiClient.query((db) => {
      const users = getUserSource(db);
      const orders = getOrderSource(db);
      const refundRequests = getRefundSource(db);
      const user = users.find((entry) => entry.id === userId && entry.role !== "admin");
      if (!user) throw new Error("User not found.");

      const userOrders = orders.filter((order) => order.userId === userId);
      const refunds = refundRequests.filter((request) => request.userId === userId);

      return {
        ...user,
        orders: userOrders,
        refunds,
        totalSpend: userOrders.reduce((sum, order) => sum + order.total, 0),
      };
    });
  },
};
