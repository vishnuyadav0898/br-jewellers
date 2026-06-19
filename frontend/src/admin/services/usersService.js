import { apiClient } from "../../shared/services/apiClient";
import { mockApiClient } from "../../shared/services/mockApiClient";

const normalizeApiUser = (user = {}) => ({
  id: user._id || user.id,
  name: user.name || "Unnamed user",
  email: user.email || "",
  phone: user.phone || "",
  role: user.role === "admin" ? "admin" : "customer",
  avatar:
    user.avatar ||
    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
      user.name || user.email || "BR User"
    )}&backgroundType=gradientLinear`,
  totalOrders: 0,
  totalSpend: 0,
  returnRequests: 0,
});

export const usersService = {
  async getUsers(role = "", includeMetrics = true) {
    const suffix = role ? `?role=${role === "customer" ? "user" : role}` : "";
    const res = await apiClient.get(`/api/v1/user/list${suffix}`);
    const users = res.data || [];

    let orders = [];
    if (includeMetrics) {
      try {
        const orderRes = await apiClient.get("/api/v1/orders");
        orders = orderRes.data || [];
      } catch (e) {
        console.warn("Failed to fetch orders for user metrics calculation:", e);
      }
    }

    return users.map((user) => {
      const userOrders = orders.filter((o) => {
        const orderUserId = o.user?._id || o.user;
        return orderUserId === user._id;
      });
      return {
        ...normalizeApiUser(user),
        totalOrders: userOrders.length,
        totalSpend: userOrders.reduce((sum, o) => sum + (o.totalAmount?.INR || 0), 0),
      };
    });
  },

  async getUserDetails(userId) {
    const res = await apiClient.get(`/api/v1/user/${userId}`);
    const user = res.data;
    if (!user) throw new Error("User not found.");

    let orders = [];
    try {
      const orderRes = await apiClient.get("/api/v1/orders");
      orders = orderRes.data || [];
    } catch (e) {
      console.warn("Failed to fetch orders for user details:", e);
    }

    const userOrders = orders
      .filter((o) => {
        const orderUserId = o.user?._id || o.user;
        return orderUserId === userId;
      })
      .map((o) => ({
        id: o._id,
        orderNumber: o.orderNumber,
        createdAt: o.createdAt,
        total: o.totalAmount?.INR || 0,
        status: o.status,
        items: o.items || [],
      }));

    return {
      ...normalizeApiUser(user),
      orders: userOrders,
      refunds: [],
      totalSpend: userOrders.reduce((sum, o) => sum + o.total, 0),
    };
  },

  async createAdmin(payload) {
    const res = await apiClient.post("/api/v1/user/create", {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      phone: payload.phone,
    });
    return res.data;
  },

  async updateUser(userId, payload) {
    const res = await apiClient.patch(`/api/v1/user/${userId}`, {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      ...(payload.password ? { password: payload.password } : {}),
    });
    return res.data;
  },

  async deleteUser(userId) {
    await apiClient.delete(`/api/v1/user/${userId}`);
    return true;
  },

  async getAllPermissions() {
    try {
      const res = await apiClient.get("/api/v1/permissions/list");
      return res || [];
    } catch (e) {
      return [
        { name: "Product", actions: ["Add", "Update", "Delete"] },
        { name: "Category", actions: ["Add", "Update", "Delete"] },
        { name: "Blog", actions: ["Add", "Update", "Delete"] },
        { name: "Order", actions: ["Update"] },
        { name: "User", actions: ["Add", "Update", "Delete"] },
        { name: "Content", actions: ["Update"] },
        { name: "Permission", actions: ["View", "Assign"] }
      ];
    }
  },

  async getUserPermissions(userId) {
    try {
      const res = await apiClient.get(`/api/v1/permissions/user/${userId}`);
      if (Array.isArray(res)) return res;
      if (res?.permissions && Array.isArray(res.permissions)) return res.permissions;
      if (res?.data && Array.isArray(res.data)) return res.data;
      if (res?.data?.permissions && Array.isArray(res.data.permissions)) return res.data.permissions;
      return [];
    } catch (e) {
      return mockApiClient.query((db) => {
        const user = db.users?.find((u) => u.id === userId || u._id === userId);
        return user?.permissions || [];
      });
    }
  },

  async assignUserPermissions(userId, permissions) {
    try {
      const res = await apiClient.patch(`/api/v1/permissions/user/${userId}`, {
        permissions,
      });
      return res;
    } catch (e) {
      return mockApiClient.mutate((db) => {
        const user = db.users?.find((u) => u.id === userId || u._id === userId);
        if (user) {
          user.permissions = permissions;
        }
        return db;
      });
    }
  },
};
