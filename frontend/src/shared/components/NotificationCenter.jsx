import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, CheckCheck, ChevronRight, Trash2 } from "lucide-react";
import {
  HiOutlineBellAlert,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineInformationCircle,
  HiOutlineShieldCheck,
  HiOutlineShoppingBag,
  HiOutlineSparkles,
} from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { Button } from "./Button";
import { getIntlLocale, useLocale } from "../localization";
import {
  getNotificationsForUser,
  getUnreadNotificationCount,
  useNotificationStore,
} from "../store/useNotificationStore";
import { useAppStore } from "../store/useAppStore";
import { cn } from "../utils/cn";

const iconMap = {
  success: HiOutlineCheckCircle,
  error: HiOutlineExclamationCircle,
  info: HiOutlineInformationCircle,
  warning: HiOutlineBellAlert,
  order: HiOutlineShoppingBag,
  security: HiOutlineShieldCheck,
  sparkle: HiOutlineSparkles,
  alert: HiOutlineExclamationCircle,
};

const panelTheme = {
  user: {
    button: "border-[#ddc8a3] bg-white text-[#1a120e] hover:bg-[#fff3dd]",
    badge: "bg-[#1a120e] text-[#f8edd1]",
    panel: "border-[#e0cfad] bg-white",
    title: "text-[#1a120e]",
    description: "text-stone-500",
    item: "border-[#f1e2c4] bg-[#fffaf1] hover:bg-[#fff3dd]",
  },
  admin: {
    button: "border-[#ddc8a3] bg-white text-[#1a120e] hover:bg-[#fff3dd]",
    badge: "bg-[#1a120e] text-[#f8edd1]",
    panel: "border-[#e0cfad] bg-white",
    title: "text-[#1a120e]",
    description: "text-stone-500",
    item: "border-[#f1e2c4] bg-[#fffaf1] hover:bg-[#fff3dd]",
  },
};

const getRelativeTime = (value, language, fallbackLabel) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallbackLabel;
  }

  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(getIntlLocale(language), { numeric: "auto" });
  const absoluteSeconds = Math.abs(diffSeconds);

  if (absoluteSeconds < 60) return formatter.format(diffSeconds, "second");
  if (absoluteSeconds < 3600) return formatter.format(Math.round(diffSeconds / 60), "minute");
  if (absoluteSeconds < 86400) return formatter.format(Math.round(diffSeconds / 3600), "hour");

  return formatter.format(Math.round(diffSeconds / 86400), "day");
};

export function NotificationCenter({ theme = "user", className }) {
  const navigate = useNavigate();
  const { language, resolveValue, t } = useLocale();
  const user = useAppStore((state) => state.user);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const drawerRef = useRef(null);
  const styles = panelTheme[theme] || panelTheme.user;
  const allNotifications = useNotificationStore((state) => state.notifications);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const clearForUser = useNotificationStore((state) => state.clearForUser);
  const notifications = useMemo(
    () => getNotificationsForUser({ notifications: allNotifications }, user),
    [allNotifications, user]
  );

  const unreadCount = useMemo(
    () => getUnreadNotificationCount(notifications),
    [notifications]
  );

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (
        !rootRef.current?.contains(event.target) &&
        !drawerRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  if (!user) {
    return null;
  }

  return (
    <div className={cn("relative", className)} ref={rootRef}>
      <button
        type="button"
        aria-label={t("notifications.title")}
        className={cn(
          "relative inline-flex h-11 w-11 items-center justify-center rounded-full border transition",
          styles.button
        )}
        onClick={() => setOpen((current) => !current)}
      >
        <Bell className="h-4 w-4" />
        {unreadCount ? (
          <span
            className={cn(
              "absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
              styles.badge
            )}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        theme === "admin" ? (
          createPortal(
            <div
              ref={drawerRef}
              className="fixed top-[89px] bottom-0 right-0 left-0 lg:left-[300px] z-40 bg-white p-6 md:p-8 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
            >
              <div className="flex items-center justify-between border-b border-[#ddc8a3] pb-4">
                <div>
                  <h3 className="text-2xl font-display text-[#1a120e]">{t("notifications.title")}</h3>
                  <p className="mt-1 text-sm text-stone-500">
                    {unreadCount
                      ? unreadCount === 1
                        ? t("notifications.unreadSingle", { count: unreadCount })
                        : t("notifications.unreadMultiple", { count: unreadCount })
                      : t("notifications.caughtUp")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    tone="ghost"
                    size="sm"
                    className="h-10 px-4 text-sm"
                    onClick={() => markAllAsRead(user)}
                    disabled={!notifications.length}
                  >
                    <CheckCheck className="h-4 w-4" />
                    {t("notifications.readAll")}
                  </Button>
                  <Button
                    type="button"
                    tone="ghost"
                    size="sm"
                    className="h-10 px-4 text-sm"
                    onClick={() => clearForUser(user)}
                    disabled={!notifications.length}
                  >
                    <Trash2 className="h-4 w-4" />
                    {t("notifications.clear")}
                  </Button>
                  <button
                    type="button"
                    className="ml-2 rounded-full p-2 text-stone-500 hover:bg-stone-100 transition"
                    onClick={() => setOpen(false)}
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mt-6 flex-1 overflow-y-auto space-y-4 pr-1">
                {notifications.length ? (
                  notifications.map((notification) => {
                    const Icon =
                      iconMap[notification.iconKey] || iconMap[notification.type] || HiOutlineInformationCircle;

                    return (
                      <button
                        key={notification.id}
                        type="button"
                        className={cn(
                          "w-full rounded-[24px] border p-5 text-left transition",
                          styles.item,
                          !notification.read && "ring-1 ring-[#e2bf6c]/55"
                        )}
                        onClick={() => {
                          markAsRead(notification.id);

                          if (notification.route) {
                            navigate(notification.route);
                            setOpen(false);
                          }
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <span className="mt-0.5 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1a120e] text-[#f8edd1]">
                            <Icon className="h-6 w-6" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className="text-base font-semibold text-[#1a120e]">
                                  {resolveValue(notification.title, "")}
                                </div>
                                <p className="mt-1 text-sm leading-6 text-stone-600">
                                  {resolveValue(notification.message, "")}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {!notification.read ? (
                                  <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-[#d3a347]" />
                                ) : null}
                                {notification.route ? (
                                  <ChevronRight className="mt-0.5 h-5 w-5 shrink-0 text-stone-400" />
                                ) : null}
                              </div>
                            </div>
                            <div className="mt-3 text-xs uppercase tracking-[0.2em] text-[#9f6d22]">
                              {getRelativeTime(notification.createdAt, language, t("notifications.justNow"))}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-[24px] border border-dashed border-[#e6d7b9] bg-[#fff9ef] px-5 py-16 text-center">
                    <HiOutlineSparkles className="mx-auto h-12 w-12 text-[#9f6d22]" />
                    <div className="mt-4 text-base font-semibold text-[#1a120e]">
                      {t("notifications.emptyTitle")}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-stone-500">
                      {t("notifications.emptyDescription")}
                    </p>
                  </div>
                )}
              </div>
            </div>,
            document.body
          )
        ) : (
          <div
            className={cn(
              "absolute right-0 top-[calc(100%+12px)] z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-[28px] border p-4 shadow-[0_24px_60px_rgba(31,20,12,0.14)]",
              styles.panel
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className={cn("text-lg font-semibold", styles.title)}>{t("notifications.title")}</h3>
                <p className={cn("mt-1 text-xs", styles.description)}>
                  {unreadCount
                    ? unreadCount === 1
                      ? t("notifications.unreadSingle", { count: unreadCount })
                      : t("notifications.unreadMultiple", { count: unreadCount })
                    : t("notifications.caughtUp")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  tone="ghost"
                  size="sm"
                  className="h-9 px-3 text-xs"
                  onClick={() => markAllAsRead(user)}
                  disabled={!notifications.length}
                >
                  <CheckCheck className="h-4 w-4" />
                  {t("notifications.readAll")}
                </Button>
                <Button
                  type="button"
                  tone="ghost"
                  size="sm"
                  className="h-9 px-3 text-xs"
                  onClick={() => clearForUser(user)}
                  disabled={!notifications.length}
                >
                  <Trash2 className="h-4 w-4" />
                  {t("notifications.clear")}
                </Button>
              </div>
            </div>

            <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {notifications.length ? (
                notifications.map((notification) => {
                  const Icon =
                    iconMap[notification.iconKey] || iconMap[notification.type] || HiOutlineInformationCircle;

                  return (
                    <button
                      key={notification.id}
                      type="button"
                      className={cn(
                        "w-full rounded-[24px] border p-4 text-left transition",
                        styles.item,
                        !notification.read && "ring-1 ring-[#e2bf6c]/55"
                      )}
                      onClick={() => {
                        markAsRead(notification.id);

                        if (notification.route) {
                          navigate(notification.route);
                          setOpen(false);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#1a120e] text-[#f8edd1]">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-[#1a120e]">
                                {resolveValue(notification.title, "")}
                              </div>
                              <p className="mt-1 text-sm leading-6 text-stone-600">
                                {resolveValue(notification.message, "")}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {!notification.read ? (
                                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#d3a347]" />
                              ) : null}
                              {notification.route ? (
                                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                              ) : null}
                            </div>
                          </div>
                          <div className="mt-3 text-xs uppercase tracking-[0.2em] text-[#9f6d22]">
                            {getRelativeTime(notification.createdAt, language, t("notifications.justNow"))}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-[24px] border border-dashed border-[#e6d7b9] bg-[#fff9ef] px-5 py-10 text-center">
                  <HiOutlineSparkles className="mx-auto h-8 w-8 text-[#9f6d22]" />
                  <div className="mt-4 text-sm font-semibold text-[#1a120e]">
                    {t("notifications.emptyTitle")}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-stone-500">
                    {t("notifications.emptyDescription")}
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      ) : null}
    </div>
  );
}
