import axios from "axios";
import { appConfig } from "../../config/appConfig";
import { useAppStore } from "../store/useAppStore";

const trimSlashes = (value = "") => value.replace(/\/+$/, "");
const getApiBaseUrl = () => trimSlashes(appConfig.apiBaseUrl);

// Create axios instance
const instance = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true, // Crucial for reading/writing HTTP-only refresh token cookies
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Request interceptor to inject Authorization header
instance.interceptors.request.use(
  (config) => {
    if (!config.baseURL) {
      config.baseURL = getApiBaseUrl();
    }
    
    // Do not inject Authorization header for refresh-token or login or register requests
    if (
      config.url &&
      (config.url.includes("/auth/refresh-token") ||
       config.url.includes("/auth/login") ||
       config.url.includes("/auth/register"))
    ) {
      return config;
    }
    
    const user = useAppStore.getState().user;
    const token =
      user?.token ||
      user?.accessToken ||
      user?.jwt ||
      localStorage.getItem("br_jewellers_jwt_token");
    
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Flag to prevent multiple simultaneous refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle 401 token refresh
instance.interceptors.response.use(
  (response) => {
    // Return standard response data structure to maintain compatibility with services
    const data = response.data?.data ?? response.data;
    if (data && typeof data === "object") {
      try {
        Object.defineProperty(data, "data", {
          value: data,
          writable: true,
          configurable: true,
          enumerable: false,
        });
      } catch (e) {
        // Ignore errors on non-extensible objects
      }
    }
    return data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and request hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return instance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          `${getApiBaseUrl()}/api/v1/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = res.data?.data?.accessToken || res.data?.accessToken;

        if (newAccessToken) {
          // Update local storage token
          localStorage.setItem("br_jewellers_jwt_token", newAccessToken);

          // Update Zustand store token
          const store = useAppStore.getState();
          if (store.user) {
            store.setUser({
              ...store.user,
              accessToken: newAccessToken,
              token: newAccessToken,
            });
          }

          instance.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return instance(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Log out user/clear store if refresh token expired or failed
        localStorage.removeItem("br_jewellers_jwt_token");
        const store = useAppStore.getState();
        if (store.setUser) {
          store.setUser(null);
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Standardize error message formatting to match frontend expectations
    const payload = error.response?.data;
    let message = "Backend API request failed.";
    if (payload?.errors?.length) {
      message = payload.errors
        .map((entry) => entry.message || entry.field)
        .filter(Boolean)
        .join(", ");
    } else if (payload?.message) {
      message = payload.message;
    } else if (error.message) {
      message = error.message;
    }

    return Promise.reject(new Error(message));
  }
);

export const apiClient = {
  setToken(token) {
    if (token) {
      localStorage.setItem("br_jewellers_jwt_token", token);
      instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      localStorage.removeItem("br_jewellers_jwt_token");
      delete instance.defaults.headers.common["Authorization"];
    }
  },

  async get(path, options = {}) {
    const { auth, ...rest } = options;
    return instance.get(path, rest);
  },

  async post(path, body, options = {}) {
    const { auth, ...rest } = options;
    return instance.post(path, body, rest);
  },

  async patch(path, body, options = {}) {
    const { auth, ...rest } = options;
    return instance.patch(path, body, rest);
  },

  async delete(path, options = {}) {
    const { auth, ...rest } = options;
    return instance.delete(path, rest);
  },

  async request(path, options = {}) {
    const { body, auth, ...rest } = options;
    const axiosConfig = {
      ...rest,
      url: path,
    };
    if (body !== undefined) {
      axiosConfig.data = body;
    }
    return instance(axiosConfig);
  },
};

export class ApiUnavailableError extends Error {
  constructor(message = "API is currently unavailable.") {
    super(message);
    this.name = "ApiUnavailableError";
    this.isApiUnavailable = true;
  }
}
