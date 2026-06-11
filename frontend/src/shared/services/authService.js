import { apiClient } from "./apiClient";
import { normalizeUserRole } from "../utils/auth";
import { useAppStore } from "../store/useAppStore";

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return normalizeUserRole(rest);
};

const normalizeApiUser = (user, token) =>
  sanitizeUser({
    ...user,
    id: user?._id || user?.id,
    ...(token ? { token } : {}),
    avatar:
      user?.avatar ||
      `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.name || "BR User")}&backgroundType=gradientLinear`,
  });

const getMeWithToken = (token) =>
  apiClient
    .request("/api/v1/user/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      unavailableStatuses: [404, 500, 502, 503, 504],
    })
    .then((user) => normalizeApiUser(user, token));

const withExistingToken = (user) => normalizeApiUser(user, useAppStore.getState().user?.token);

export const authService = {
  async login({ email, password }) {
    const res = await apiClient.request("/api/v1/auth/login", {
      method: "POST",
      body: { email, password },
      unavailableStatuses: [404, 500, 502, 503, 504],
    });

    const token = typeof res === "string" ? res : res?.accessToken || res?.token;
    return getMeWithToken(token);
  },

  async register({ name, email, password }) {
    const res = await apiClient.request("/api/v1/auth/register", {
      method: "POST",
      body: { name, email, password },
      unavailableStatuses: [404, 500, 502, 503, 504],
    });

    const token = typeof res === "string" ? res : res?.accessToken || res?.token;
    return getMeWithToken(token);
  },

  async forgotPassword({ email }) {
    return apiClient.request("/api/v1/user/forgot-password", {
      method: "POST",
      body: { email },
      unavailableStatuses: [404, 500, 502, 503, 504],
    });
  },

  async googleLogin({ idToken }) {
    const res = await apiClient.request("/api/v1/auth/google", {
      method: "POST",
      body: { idToken },
      unavailableStatuses: [404, 500, 502, 503, 504],
    });

    const token = typeof res === "string" ? res : res?.accessToken || res?.token;
    return getMeWithToken(token);
  },

  async refreshToken() {
    const res = await apiClient.request("/api/v1/auth/refresh-token", {
      method: "POST",
      unavailableStatuses: [401, 404, 500, 502, 503, 504],
    });

    const token = typeof res === "string" ? res : res?.accessToken || res?.token;
    if (token) {
      localStorage.setItem("br_jewellers_jwt_token", token);
      const store = useAppStore.getState();
      if (store.user) {
        store.setUser({
          ...store.user,
          accessToken: token,
          token: token,
        });
      }
    }
    return token;
  },

  async getProfile(userId) {
    return apiClient.request("/api/v1/user/me", { auth: true }).then(withExistingToken);
  },

  async updateProfile(userId, payload) {
    return apiClient
      .request(`/api/v1/user/${userId}`, {
        method: "PATCH",
        auth: true,
        body: {
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          address: payload.address,
        },
      })
      .then(withExistingToken);
  },

  async changePassword(userId, { oldPassword, newPassword, confirmPassword }) {
    if (newPassword.length < 8) {
      throw new Error("New password must be at least 8 characters.");
    }

    if (newPassword !== confirmPassword) {
      throw new Error("New password and confirmation do not match.");
    }

    await apiClient.request("/api/v1/user/change-password", {
      method: "PATCH",
      auth: true,
      body: { oldPassword, newPassword },
      unavailableStatuses: [400, 401, 403, 404, 422, 500, 502, 503, 504],
    });

    return true;
  },
};
