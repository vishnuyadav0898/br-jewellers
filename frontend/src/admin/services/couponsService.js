import { apiClient } from "../../shared/services/apiClient";
import { mockApiClient } from "../../shared/services/mockApiClient";

const normalizeApiCoupon = (coupon = {}) => ({
  id: coupon._id || coupon.id,
  name: coupon.name || "",
  code: coupon.code || "",
  description: coupon.description || "",
  discountType: coupon.discountType || "percentage",
  discountValue: coupon.discountValue || 0,
  fixedDiscountValue: coupon.fixedDiscountValue || { INR: 0, USD: 0 },
  maxDiscount: coupon.maxDiscount || { INR: 0, USD: 0 },
  minOrderAmount: coupon.minOrderAmount || { INR: 0, USD: 0 },
  startDate: coupon.startDate || new Date().toISOString(),
  endDate: coupon.endDate || new Date().toISOString(),
  isActive: typeof coupon.isActive === "boolean" ? coupon.isActive : true,
  applicableMaterials: coupon.applicableMaterials || [],
  applicableCategories: coupon.applicableCategories || [],
  applicableProducts: coupon.applicableProducts || [],
  applicableOnOrderNumber: coupon.applicableOnOrderNumber || null,
  usageLimit: coupon.usageLimit || null,
  usagePerUser: coupon.usagePerUser || 1,
  totalUsedCount: coupon.totalUsedCount || 0,
});

export const couponsService = {
  async listCoupons() {
    try {
      const res = await apiClient.get("/api/v1/coupons/list");
      const raw = res.data || res || {};
      const list = Array.isArray(raw.data) ? raw.data : (Array.isArray(raw) ? raw : []);
      return list.map(normalizeApiCoupon);
    } catch (e) {
      console.warn("Failed to fetch coupons from backend, using mock fallback:", e);
      return mockApiClient.query((db) => {
        const coupons = Array.isArray(db.coupons) ? db.coupons : [];
        return coupons.map(normalizeApiCoupon);
      });
    }
  },

  async createCoupon(payload) {
    try {
      const res = await apiClient.post("/api/v1/coupons/create", payload);
      return res.data || res;
    } catch (e) {
      console.warn("Failed to create coupon on backend, using mock fallback:", e);
      return mockApiClient.mutate((db) => {
        const newCoupon = {
          _id: `coupon-${Date.now()}`,
          ...payload,
          totalUsedCount: 0,
          createdAt: new Date().toISOString(),
        };
        db.coupons = [newCoupon, ...(db.coupons || [])];
        return newCoupon;
      });
    }
  },

  async updateCoupon(id, payload) {
    try {
      const res = await apiClient.patch(`/api/v1/coupons/${id}`, payload);
      return res.data || res;
    } catch (e) {
      console.warn(`Failed to update coupon ${id} on backend, using mock fallback:`, e);
      return mockApiClient.mutate((db) => {
        db.coupons = (db.coupons || []).map((c) =>
          (c._id || c.id) === id ? { ...c, ...payload } : c
        );
        return true;
      });
    }
  },

  async deleteCoupon(id) {
    try {
      await apiClient.delete(`/api/v1/coupons/${id}`);
      return true;
    } catch (e) {
      console.warn(`Failed to delete coupon ${id} on backend, using mock fallback:`, e);
      return mockApiClient.mutate((db) => {
        db.coupons = (db.coupons || []).filter((c) => (c._id || c.id) !== id);
        return true;
      });
    }
  },

  async getAssignedCoupons(userId = "") {
    try {
      const suffix = userId ? `?userId=${userId}` : "";
      const res = await apiClient.get(`/api/v1/coupons/assigned${suffix}`);
      const raw = res.data || res || {};
      const list = Array.isArray(raw.data) ? raw.data : (Array.isArray(raw) ? raw : []);
      return list;
    } catch (e) {
      console.warn("Failed to fetch assigned coupons from backend, using mock fallback:", e);
      return mockApiClient.query((db) => {
        const assignments = Array.isArray(db.couponAssignments) ? db.couponAssignments : [];
        const filtered = userId ? assignments.filter((a) => a.user === userId) : assignments;
        return filtered.map((a) => {
          const coupon = db.coupons.find((c) => (c._id || c.id) === a.coupon);
          const user = db.users.find((u) => (u._id || u.id) === a.user);
          return {
            _id: a._id,
            coupon: coupon ? normalizeApiCoupon(coupon) : null,
            user: user ? { name: user.name, email: user.email } : null,
            createdAt: a.createdAt || new Date().toISOString(),
          };
        });
      });
    }
  },

  async assignCoupon(couponId, userId) {
    try {
      const res = await apiClient.post("/api/v1/coupons/assign", { couponId, userId });
      return res.data || res;
    } catch (e) {
      console.warn("Failed to assign coupon on backend, using mock fallback:", e);
      return mockApiClient.mutate((db) => {
        if (!db.couponAssignments) {
          db.couponAssignments = [];
        }
        const existing = db.couponAssignments.find(
          (a) => a.coupon === couponId && a.user === userId
        );
        if (existing) {
          throw new Error("Coupon is already assigned to this user");
        }
        const newAssignment = {
          _id: `assign-${Date.now()}`,
          coupon: couponId,
          user: userId,
          createdAt: new Date().toISOString(),
        };
        db.couponAssignments.push(newAssignment);
        return newAssignment;
      });
    }
  },

  async removeAssignedCoupon(assignmentId) {
    try {
      await apiClient.delete(`/api/v1/coupons/assign/${assignmentId}`);
      return true;
    } catch (e) {
      console.warn(`Failed to remove coupon assignment ${assignmentId} on backend, using mock fallback:`, e);
      return mockApiClient.mutate((db) => {
        db.couponAssignments = (db.couponAssignments || []).filter(
          (a) => (a._id || a.id) !== assignmentId
        );
        return true;
      });
    }
  },
};
