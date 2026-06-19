import { routes } from "../../config/routes";

export const normalizeUserRole = (user) => {
  if (!user) return null;

  return {
    ...user,
    role: user.role === "admin" ? "admin" : "customer",
  };
};

export const isAdminUser = (user) => normalizeUserRole(user)?.role === "admin";

export const getDefaultRouteForUser = (user) =>
  isAdminUser(user) ? routes.adminDashboard : routes.appHome;

const CUSTOMER_ONLY_PATHS = [
  routes.appCart,
  routes.appFavorites,
  routes.appOrders,
  routes.appReturns,
  routes.appProfile,
];

const normalizePathname = (pathname = "") => pathname.split("?")[0].split("#")[0];

const matchesRoute = (pathname, target) =>
  pathname === target || pathname.startsWith(`${target}/`);

export const isAdminPath = (pathname = "") => matchesRoute(normalizePathname(pathname), "/admin");

export const isCustomerProtectedPath = (pathname = "") =>
  CUSTOMER_ONLY_PATHS.some((target) => matchesRoute(normalizePathname(pathname), target));

export const canAccessRole = (user, allowedRoles = []) => {
  if (!allowedRoles?.length) return true;
  return allowedRoles.includes(normalizeUserRole(user)?.role);
};

export const hasPermission = (user, module, action) => {
  if (!user) return false;
  const normalized = normalizeUserRole(user);
  if (normalized?.role !== "admin") return false;
  
  // If user has permissions array, check it. If not, default to true for admins (legacy/dev fallback)
  if (!user.permissions) return true;
  if (!Array.isArray(user.permissions)) return false;
  
  const modulePerms = user.permissions.find(
    (p) => p.module?.toLowerCase() === module?.toLowerCase()
  );
  if (!modulePerms) return false;
  
  if (!action) {
    return Array.isArray(modulePerms.actions) && modulePerms.actions.length > 0;
  }
  
  return modulePerms.actions?.some(
    (act) => act?.toLowerCase() === action?.toLowerCase()
  ) || false;
};

export const hasModulePermission = (user, module) => {
  if (!user) return false;
  const normalized = normalizeUserRole(user);
  if (normalized?.role !== "admin") return false;
  
  if (!user.permissions) return true;
  if (!Array.isArray(user.permissions)) return false;
  
  const modulePerms = user.permissions.find(
    (p) => p.module?.toLowerCase() === module?.toLowerCase()
  );
  return Boolean(modulePerms && modulePerms.actions?.length > 0);
};

export const canAccessPath = (user, pathname = "") => {
  const normalizedPath = normalizePathname(pathname);

  if (isAdminPath(normalizedPath)) {
    return isAdminUser(user);
  }

  if (isCustomerProtectedPath(normalizedPath)) {
    return normalizeUserRole(user)?.role === "customer";
  }

  return true;
};

export const getPostLoginRedirectPath = (user, candidatePath) =>
  candidatePath && canAccessPath(user, candidatePath)
    ? candidatePath
    : getDefaultRouteForUser(user);

export const getUnauthorizedRedirectPath = (user, pathname = "") =>
  isAdminPath(pathname) ? getDefaultRouteForUser(user) : routes.appHome;

