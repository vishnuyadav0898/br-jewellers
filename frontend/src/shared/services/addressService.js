import { apiClient } from "./apiClient";

export const addressService = {
  async getAddresses(userId) {
    const response = await apiClient.get("/api/v1/address");
    return Array.isArray(response) ? response : [];
  },

  async createAddress(userId, payload) {
    const response = await apiClient.post("/api/v1/address", {
      label: payload.label || "Home",
      fullName: payload.fullName,
      phone: payload.phone,
      line1: payload.line1,
      line2: payload.line2 || "",
      city: payload.city,
      state: payload.state,
      zip: payload.zip,
      country: payload.country || "India",
      isDefault: Boolean(payload.isDefault),
    });
    return response;
  },

  async updateAddress(userId, addressId, payload) {
    const response = await apiClient.patch(`/api/v1/address/${addressId}`, {
      label: payload.label,
      fullName: payload.fullName,
      phone: payload.phone,
      line1: payload.line1,
      line2: payload.line2,
      city: payload.city,
      state: payload.state,
      zip: payload.zip,
      country: payload.country,
      isDefault: Boolean(payload.isDefault),
    });
    return response;
  },

  async deleteAddress(userId, addressId) {
    const response = await apiClient.delete(`/api/v1/address/${addressId}`);
    return response;
  }
};
