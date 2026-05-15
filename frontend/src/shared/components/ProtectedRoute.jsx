import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { routes } from "../../config/routes";
import { useAppStore } from "../store/useAppStore";
import { canAccessRole, getUnauthorizedRedirectPath } from "../utils/auth";

export function ProtectedRoute({ allowedRoles = [] }) {
  const location = useLocation();
  const user = useAppStore((state) => state.user);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const openAuthModal = useAppStore((state) => state.openAuthModal);
  const requestedPath = `${location.pathname}${location.search}${location.hash}`;

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal("login", requestedPath);
    }
  }, [isAuthenticated, openAuthModal, requestedPath]);

  if (!isAuthenticated) {
    return <Navigate to={routes.appHome} replace />;
  }

  if (!canAccessRole(user, allowedRoles)) {
    return <Navigate to={getUnauthorizedRedirectPath(user, requestedPath)} replace />;
  }

  return <Outlet />;
}
