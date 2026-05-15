import { mockApiClient } from "./mockApiClient";
import { normalizeUserRole } from "../utils/auth";

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return normalizeUserRole(rest);
};

export const authService = {
  async login({ email, password }) {
    return mockApiClient.query((db) => {
      const user = db.users.find(
        (entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password
      );

      if (!user) {
        throw new Error("Invalid credentials. Try aarohi@brdemo.com / demo123.");
      }

      return sanitizeUser(user);
    });
  },

  async register({ name, email, password, phone, address }) {
    return mockApiClient.mutate((db) => {
      const existingUser = db.users.find((entry) => entry.email.toLowerCase() === email.toLowerCase());

      if (existingUser) {
        throw new Error("An account with this email already exists.");
      }

      const user = {
        id: crypto.randomUUID(),
        name,
        email,
        password,
        phone,
        address,
        role: "customer",
        provider: "email",
        avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundType=gradientLinear`,
      };

      db.users.unshift(user);
      db.carts[user.id] = [];
      db.favorites[user.id] = [];
      db.recentlyViewed[user.id] = [];

      return db;
    }).then((db) => sanitizeUser(db.users[0]));
  },

  async loginWithGoogle() {
    return mockApiClient.mutate((db) => {
      const email = "google.user@brdemo.com";
      let user = db.users.find((entry) => entry.email === email);

      if (!user) {
        user = {
          id: crypto.randomUUID(),
          name: "Google Demo User",
          email,
          password: "",
          role: "customer",
          phone: "+91 99999 88888",
          address: "Bandra West, Mumbai, Maharashtra",
          provider: "google",
          avatar:
            "https://api.dicebear.com/9.x/initials/svg?seed=Google%20Demo%20User&backgroundType=gradientLinear",
        };

        db.users.unshift(user);
        db.carts[user.id] = [];
        db.favorites[user.id] = [];
        db.recentlyViewed[user.id] = [];
      }

      return db;
    }).then((db) => sanitizeUser(db.users.find((entry) => entry.email === "google.user@brdemo.com")));
  },

  async getProfile(userId) {
    return mockApiClient.query((db) => {
      const user = db.users.find((entry) => entry.id === userId);
      if (!user) throw new Error("Profile not found.");
      return sanitizeUser(user);
    });
  },

  async updateProfile(userId, payload) {
    return mockApiClient.mutate((db) => {
      const user = db.users.find((entry) => entry.id === userId);
      if (!user) throw new Error("Profile not found.");

      Object.assign(user, payload);
      return db;
    }).then((db) => sanitizeUser(db.users.find((entry) => entry.id === userId)));
  },

  async changePassword(userId, { oldPassword, newPassword, confirmPassword }) {
    if (newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters.");
    }

    if (newPassword !== confirmPassword) {
      throw new Error("New password and confirmation do not match.");
    }

    return mockApiClient.mutate((db) => {
      const user = db.users.find((entry) => entry.id === userId);
      if (!user) throw new Error("Profile not found.");

      if (user.password !== oldPassword) {
        throw new Error("Old password is incorrect.");
      }

      user.password = newPassword;
      return db;
    }).then(() => true);
  },
};
