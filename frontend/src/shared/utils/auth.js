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
