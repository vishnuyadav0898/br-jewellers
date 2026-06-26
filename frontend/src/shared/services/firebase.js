import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { notify } from "../utils/notify";
import { apiClient } from "./apiClient";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let messaging = null;

try {
  if (firebaseConfig.apiKey) {
    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
  }
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

/**
 * Synchronizes the FCM registration token with the authenticated user profile in the backend.
 */
export async function syncTokenWithBackend(user) {
  if (!user || !user.id) return;
  const token = localStorage.getItem("fcm_token");
  if (!token) return;

  const registrationKey = `fcm_registered_${user.id}`;
  const alreadySyncedToken = localStorage.getItem(registrationKey);
  if (alreadySyncedToken === token) {
    console.log("FCM registration token already synced for user:", user.id);
    return;
  }

  try {
    await apiClient.post("/api/v1/notifications/register-token", { fcmToken: token });
    localStorage.setItem(registrationKey, token);
    console.log("FCM registration token synced with backend for user:", user.id);
  } catch (error) {
    console.error("Failed to sync FCM registration token with backend:", error);
  }
}

/**
 * Registers the Service Worker and retrieves the FCM registration device token.
 */
async function registerSWAndGetToken() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Build the service worker query string config
      const queryParams = new URLSearchParams({
        apiKey: firebaseConfig.apiKey || "",
        authDomain: firebaseConfig.authDomain || "",
        projectId: firebaseConfig.projectId || "",
        storageBucket: firebaseConfig.storageBucket || "",
        messagingSenderId: firebaseConfig.messagingSenderId || "",
        appId: firebaseConfig.appId || "",
        measurementId: firebaseConfig.measurementId || "",
      }).toString();

      // Register the service worker with the config query parameters
      const registration = await navigator.serviceWorker.register(
        `/firebase-messaging-sw.js?${queryParams}`,
        { scope: "/" }
      );

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      console.log("FCM Registration Token:", token);
      localStorage.setItem("fcm_token", token);
      return token;
    }
  } catch (error) {
    console.error("Error registering FCM Service Worker:", error);
  }
  return null;
}

/**
 * Requests permission for notifications, registers the service worker, and returns the FCM token.
 * This is deferred until the main page has fully loaded and the browser is idle to optimize performance.
 */
export async function requestNotificationPermission() {
  if (!messaging) {
    console.warn("FCM messaging is not initialized. Check your Firebase credentials.");
    return null;
  }
  
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notifications.");
    return null;
  }

  if (!("serviceWorker" in navigator)) {
    console.warn("This browser does not support service workers.");
    return null;
  }

  return new Promise((resolve) => {
    const triggerRegistration = async () => {
      const token = await registerSWAndGetToken();
      resolve(token);
    };

    // If page is already loaded, schedule to execute on next idle frame
    if (document.readyState === "complete") {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(triggerRegistration);
      } else {
        setTimeout(triggerRegistration, 1000);
      }
    } else {
      // Wait for page load event, then schedule during idle time
      window.addEventListener("load", () => {
        if (window.requestIdleCallback) {
          window.requestIdleCallback(triggerRegistration);
        } else {
          setTimeout(triggerRegistration, 1000);
        }
      });
    }
  });
}

/**
 * Listens to foreground push notifications and shows an in-app toast by default.
 */
export function setupForegroundNotifications(callback) {
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    console.log("Received foreground message:", payload);
    
    // Play a gentle notification sound or show toast
    if (payload.notification) {
      notify.success(payload.notification.body || "New update received", {
        title: payload.notification.title || "Notification",
      });
    }

    if (callback) {
      callback(payload);
    }
  });
}
