import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { hasPermission } from "../utils/auth";
import { notify } from "../utils/notify";

/**
 * PermissionGuard component to secure UI elements or full pages.
 * 
 * Usage for UI elements:
 * <PermissionGuard module="Product" action="Add">
 *   <button>Add Product</button>
 * </PermissionGuard>
 * 
 * Usage for Routes (AppRoutes.jsx):
 * <Route element={<PermissionGuard module="Content" action="Update" isRoute />}>
 *   <Route path="content/about" element={<AboutContentPage />} />
 * </Route>
 */
export function PermissionGuard({ module, action, children, fallback = null, isRoute = false }) {
  const user = useAppStore((state) => state.user);
  const isAllowed = hasPermission(user, module, action);

  useEffect(() => {
    if (!isAllowed && isRoute) {
      notify.error(`Access Denied: You do not have permission to access this page (${module}:${action}).`);
    }
  }, [isAllowed, isRoute, module, action]);

  if (isAllowed) {
    return children ? <>{children}</> : <Outlet />;
  }

  if (isRoute) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return fallback;
}
