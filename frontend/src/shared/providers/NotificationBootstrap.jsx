import { useEffect } from "react";
import { useAppStore } from "../store/useAppStore";
import { useNotificationStore } from "../store/useNotificationStore";

export function NotificationBootstrap() {
  const user = useAppStore((state) => state.user);
  const ensureSeeded = useNotificationStore((state) => state.ensureSeeded);

  useEffect(() => {
    if (user) {
      ensureSeeded(user);
    }
  }, [ensureSeeded, user]);

  return null;
}
