import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { appConfig } from "../../config/appConfig";
import { routes } from "../../config/routes";

const MAX_NOTIFICATIONS = 60;

const getOwnerKey = (user) => user?.id || "guest";

const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60 * 1000).toISOString();

const createSeedNotifications = (user) => {
  if (!user) return [];

  const ownerKey = getOwnerKey(user);

  if (user.role === "admin") {
    return [
      {
        id: `${ownerKey}-seed-admin-1`,
        ownerKey,
        type: "info",
        title: {
          en: "Admin workspace ready",
          hi: "एडमिन workspace तैयार है",
        },
        message: {
          en: "Review dashboard metrics, pending orders, and content updates from one place.",
          hi: "एक ही जगह से dashboard metrics, pending orders और content updates देखें।",
        },
        route: routes.adminDashboard,
        iconKey: "sparkle",
        read: false,
        createdAt: minutesAgo(8),
      },
      {
        id: `${ownerKey}-seed-admin-2`,
        ownerKey,
        type: "warning",
        title: {
          en: "Operational follow-up",
          hi: "ऑपरेशनल फॉलो-अप",
        },
        message: {
          en: "Keep an eye on refund requests and pending fulfilment items that need action.",
          hi: "Refund requests और pending fulfilment items पर नज़र रखें जिन्हें action चाहिए।",
        },
        route: routes.adminRefundRequests,
        iconKey: "alert",
        read: false,
        createdAt: minutesAgo(18),
      },
    ];
  }

  return [
    {
      id: `${ownerKey}-seed-customer-1`,
      ownerKey,
      type: "success",
      title: {
        en: "Account synced",
        hi: "खाता सिंक हो गया",
      },
      message: {
        en: "Your cart, favorites, and orders are available from your account area.",
        hi: "आपका cart, favorites और orders अब account area में उपलब्ध हैं।",
      },
      route: routes.appProfile,
      iconKey: "sparkle",
      read: false,
      createdAt: minutesAgo(8),
    },
    {
      id: `${ownerKey}-seed-customer-2`,
      ownerKey,
      type: "info",
      title: {
        en: "Track activity",
        hi: "गतिविधि ट्रैक करें",
      },
      message: {
        en: "You can monitor orders and return requests anytime from the post-purchase area.",
        hi: "आप post-purchase area से कभी भी orders और return requests ट्रैक कर सकते हैं।",
      },
      route: routes.appOrders,
      iconKey: "order",
      read: false,
      createdAt: minutesAgo(20),
    },
  ];
};

export const useNotificationStore = create(
  persist(
    (set) => ({
      notifications: [],
      seededOwnerKeys: [],
      pushNotification: ({ user, type = "info", title, message, route = null, iconKey }) =>
        set((state) => ({
          notifications: [
            {
              id: crypto.randomUUID(),
              ownerKey: getOwnerKey(user),
              type,
              title,
              message,
              route,
              iconKey: iconKey || type,
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...state.notifications,
          ].slice(0, MAX_NOTIFICATIONS),
        })),
      ensureSeeded: (user) =>
        set((state) => {
          const ownerKey = getOwnerKey(user);

          if (!user || state.seededOwnerKeys.includes(ownerKey)) {
            return state;
          }

          return {
            seededOwnerKeys: [...state.seededOwnerKeys, ownerKey],
            notifications: [...createSeedNotifications(user), ...state.notifications].slice(
              0,
              MAX_NOTIFICATIONS
            ),
          };
        }),
      markAsRead: (notificationId) =>
        set((state) => {
          const notification = state.notifications.find((entry) => entry.id === notificationId);

          if (!notification || notification.read) {
            return state;
          }

          return {
            notifications: state.notifications.map((entry) =>
              entry.id === notificationId ? { ...entry, read: true } : entry
            ),
          };
        }),
      markAllAsRead: (user) =>
        set((state) => {
          const ownerKey = getOwnerKey(user);
          const hasUnreadNotifications = state.notifications.some(
            (notification) => notification.ownerKey === ownerKey && !notification.read
          );

          if (!hasUnreadNotifications) {
            return state;
          }

          return {
            notifications: state.notifications.map((notification) =>
              notification.ownerKey === ownerKey ? { ...notification, read: true } : notification
            ),
          };
        }),
      clearForUser: (user) =>
        set((state) => {
          const ownerKey = getOwnerKey(user);
          const hasNotifications = state.notifications.some(
            (notification) => notification.ownerKey === ownerKey
          );

          if (!hasNotifications) {
            return state;
          }

          return {
            notifications: state.notifications.filter(
              (notification) => notification.ownerKey !== ownerKey
            ),
          };
        }),
    }),
    {
      name: `${appConfig.storageKey}-notifications`,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        notifications: state.notifications,
        seededOwnerKeys: state.seededOwnerKeys,
      }),
    }
  )
);

export const getNotificationsForUser = (state, user) => {
  const ownerKey = getOwnerKey(user);
  return state.notifications.filter((notification) => notification.ownerKey === ownerKey);
};

export const getUnreadNotificationCount = (notifications = []) =>
  notifications.filter((notification) => !notification.read).length;
