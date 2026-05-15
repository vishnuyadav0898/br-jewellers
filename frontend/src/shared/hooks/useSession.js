import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { routes } from "../../config/routes";
import { useLocale } from "../localization";
import { authService } from "../services/authService";
import { useAppStore } from "../store/useAppStore";
import { getDefaultRouteForUser, getPostLoginRedirectPath } from "../utils/auth";
import { notify } from "../utils/notify";

export function useSession() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useLocale();
  const user = useAppStore((state) => state.user);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const authModalMode = useAppStore((state) => state.authModalMode);
  const authModalOpen = useAppStore((state) => state.authModalOpen);
  const authRedirectPath = useAppStore((state) => state.authRedirectPath);
  const setUser = useAppStore((state) => state.setUser);
  const logoutState = useAppStore((state) => state.logout);
  const openAuthModal = useAppStore((state) => state.openAuthModal);
  const closeAuthModal = useAppStore((state) => state.closeAuthModal);

  const afterAuth = (nextUser) => {
    const nextPath = getPostLoginRedirectPath(nextUser, authRedirectPath);
    setUser(nextUser);
    closeAuthModal();
    navigate(nextPath || getDefaultRouteForUser(nextUser), { replace: true });
  };

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (nextUser) => {
      notify.success(t("session.loginSuccess", { name: nextUser.name.split(" ")[0] }), {
        title: t("session.loginTitle"),
        user: nextUser,
      });
      afterAuth(nextUser);
    },
    onError: (error) => notify.error(error.message),
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (nextUser) => {
      notify.success(t("session.registerSuccess"), {
        title: t("session.registerTitle"),
        user: nextUser,
      });
      afterAuth(nextUser);
    },
    onError: (error) => notify.error(error.message),
  });

  const googleMutation = useMutation({
    mutationFn: authService.loginWithGoogle,
    onSuccess: (nextUser) => {
      notify.success(t("session.googleSuccess"), {
        title: t("session.googleTitle"),
        user: nextUser,
      });
      afterAuth(nextUser);
    },
    onError: (error) => notify.error(error.message),
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ userId, payload }) => authService.updateProfile(userId, payload),
    onSuccess: (nextUser) => {
      setUser(nextUser);
      queryClient.invalidateQueries();
      notify.success(t("session.profileUpdated"), {
        title: t("session.profileUpdatedTitle"),
      });
    },
    onError: (error) => notify.error(error.message),
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ userId, payload }) => authService.changePassword(userId, payload),
    onSuccess: () =>
      notify.success(t("session.passwordUpdated"), {
        title: t("session.passwordUpdatedTitle"),
        iconKey: "security",
      }),
    onError: (error) => notify.error(error.message, { iconKey: "security" }),
  });

  return {
    user,
    isAuthenticated,
    authModalMode,
    authModalOpen,
    openAuthModal,
    closeAuthModal,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    loginWithGoogle: googleMutation.mutateAsync,
    updateProfile: (payload) => updateProfileMutation.mutateAsync({ userId: user?.id, payload }),
    changePassword: (payload) => changePasswordMutation.mutateAsync({ userId: user?.id, payload }),
    logout: () => {
      logoutState();
      queryClient.clear();
      notify.info(t("session.logoutSuccess"), {
        title: t("session.logoutTitle"),
        user,
      });
      navigate(routes.appHome, { replace: true });
    },
    isBusy:
      loginMutation.isPending ||
      registerMutation.isPending ||
      googleMutation.isPending ||
      updateProfileMutation.isPending ||
      changePasswordMutation.isPending,
  };
}
