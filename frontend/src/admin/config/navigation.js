import {
  BarChart3,
  Boxes,
  ClipboardList,
  FilePenLine,
  LayoutDashboard,
  RefreshCcw,
  Settings,
  Users,
} from "lucide-react";
import { routes } from "../../config/routes";

export const adminNavigation = [
  {
    key: "dashboard",
    labelKey: "admin.nav.dashboard",
    icon: LayoutDashboard,
    to: routes.adminDashboard,
  },
  {
    key: "products",
    labelKey: "admin.nav.products",
    icon: Boxes,
    children: [
      { labelKey: "admin.nav.productList", to: routes.adminProductsList },
      { labelKey: "admin.nav.categories", to: routes.adminCategories },
      { labelKey: "admin.nav.featuredProducts", to: routes.adminFeaturedProducts },
      { labelKey: "admin.nav.bulkUpload", to: routes.adminBulkUpload },
    ],
  },
  {
    key: "users",
    labelKey: "admin.nav.users",
    icon: Users,
    children: [
      { labelKey: "admin.nav.userList", to: routes.adminUsersList },
    ],
  },
  {
    key: "orders",
    labelKey: "admin.nav.orders",
    icon: ClipboardList,
    children: [
      { labelKey: "admin.nav.allOrders", to: routes.adminOrdersAll },
      { labelKey: "admin.nav.pendingOrders", to: routes.adminOrdersPending },
      { labelKey: "admin.nav.orderTracking", to: routes.adminOrderTracking },
    ],
  },
  {
    key: "refunds",
    labelKey: "admin.nav.refunds",
    icon: RefreshCcw,
    children: [
      { labelKey: "admin.nav.returnRequests", to: routes.adminRefundRequests },
      { labelKey: "admin.nav.refundStatus", to: routes.adminRefundStatus },
    ],
  },
  {
    key: "content",
    labelKey: "admin.nav.content",
    icon: FilePenLine,
    children: [
      { labelKey: "admin.nav.homeContent", to: routes.adminContentHome },
      { labelKey: "admin.nav.aboutContent", to: routes.adminContentAbout },
      { labelKey: "admin.nav.contactContent", to: routes.adminContentContact },
      { labelKey: "admin.nav.bannerManagement", to: routes.adminContentBanners },
      { labelKey: "admin.nav.blogManagement", to: routes.adminContentBlogs },
    ],
  },
  {
    key: "analytics",
    labelKey: "admin.nav.analytics",
    icon: BarChart3,
    children: [
      { labelKey: "admin.nav.overview", to: routes.adminAnalytics },
      { labelKey: "admin.nav.financeReports", to: routes.adminFinance },
    ],
  },
  {
    key: "settings",
    labelKey: "admin.nav.settings",
    icon: Settings,
    to: routes.adminSettings,
  },
];

const matchesPath = (pathname, target) =>
  pathname === target ||
  pathname.startsWith(`${target}/`) ||
  (target.includes(":") && pathname.startsWith(target.split(":")[0]));

export function getSectionForPath(pathname = "") {
  const match = adminNavigation.find((entry) => {
    if (entry.to) {
      return matchesPath(pathname, entry.to);
    }

    return entry.children?.some((child) => matchesPath(pathname, child.to));
  });

  return match?.key ?? "dashboard";
}

export function getAdminPageMeta(pathname = "") {
  for (const entry of adminNavigation) {
    if (entry.to && matchesPath(pathname, entry.to)) {
      return {
        sectionKey: entry.labelKey,
        pageKey: entry.labelKey,
      };
    }

    const child = entry.children?.find((item) => matchesPath(pathname, item.to));

    if (child) {
      return {
        sectionKey: entry.labelKey,
        pageKey: child.labelKey,
      };
    }
  }

  return {
    sectionKey: "admin.nav.dashboard",
    pageKey: "admin.nav.dashboard",
  };
}
