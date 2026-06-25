import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js";
import { notify } from "../utils/notify";

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
 * Requests permission for notifications, registers the service worker, and returns the FCM token.
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
    console.error("Error requesting notification permission:", error);
  }
  return null;
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
