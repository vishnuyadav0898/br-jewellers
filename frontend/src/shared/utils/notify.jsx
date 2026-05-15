import { createElement } from "react";
import hotToast from "react-hot-toast";
import {
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineInformationCircle,
} from "react-icons/hi2";
import { useAppStore } from "../store/useAppStore";
import { useNotificationStore } from "../store/useNotificationStore";

const typeConfig = {
  success: {
    title: "Success",
    icon: HiOutlineCheckCircle,
    iconClassName: "text-emerald-300",
  },
  error: {
    title: "Something went wrong",
    icon: HiOutlineExclamationCircle,
    iconClassName: "text-rose-300",
  },
  info: {
    title: "Heads up",
    icon: HiOutlineInformationCircle,
    iconClassName: "text-sky-300",
  },
  warning: {
    title: "Needs attention",
    icon: HiOutlineExclamationCircle,
    iconClassName: "text-amber-300",
  },
};

const dispatchNotification = (type, message, options = {}) => {
  const config = typeConfig[type] || typeConfig.info;
  const user = options.user || useAppStore.getState().user;

  useNotificationStore.getState().pushNotification({
    user,
    type,
    title: options.title || config.title,
    message,
    route: options.route,
    iconKey: options.iconKey,
  });

  return hotToast(message, {
    duration: options.duration ?? 3600,
    icon: createElement(config.icon, {
      className: `h-5 w-5 ${config.iconClassName}`,
    }),
  });
};

export const notify = {
  success: (message, options) => dispatchNotification("success", message, options),
  error: (message, options) => dispatchNotification("error", message, options),
  info: (message, options) => dispatchNotification("info", message, options),
  warning: (message, options) => dispatchNotification("warning", message, options),
};
