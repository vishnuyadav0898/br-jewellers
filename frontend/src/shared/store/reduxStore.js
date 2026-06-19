import { useState, useEffect } from "react";
import { useAppStore } from "./useAppStore";

/**
 * Standard Redux action creator helpers
 */
export const setUserAction = (user) => ({ type: "SET_USER", payload: user });
export const logoutAction = () => ({ type: "LOGOUT" });
export const setLanguageAction = (lang) => ({ type: "SET_LANGUAGE", payload: lang });
export const setCurrencyAction = (currency) => ({ type: "SET_CURRENCY", payload: currency });
export const setCartCouponCodeAction = (code) => ({ type: "SET_CART_COUPON_CODE", payload: code });
export const clearCartCouponCodeAction = () => ({ type: "CLEAR_CART_COUPON_CODE" });
export const openAuthModalAction = (mode, redirectPath) => ({
  type: "OPEN_AUTH_MODAL",
  payload: { mode, redirectPath },
});
export const closeAuthModalAction = () => ({ type: "CLOSE_AUTH_MODAL" });
export const setSidebarOpenAction = (open) => ({ type: "SET_SIDEBAR_OPEN", payload: open });

/**
 * Redux useDispatch Hook
 * Dispatches actions to perform state mutations on the core synchronized store
 */
export function useDispatch() {
  return (action) => {
    const store = useAppStore.getState();
    switch (action.type) {
      case "SET_USER":
        store.setUser(action.payload);
        break;
      case "LOGOUT":
        store.logout();
        break;
      case "SET_LANGUAGE":
        store.setLanguage(action.payload);
        break;
      case "SET_CURRENCY":
        store.setCurrency(action.payload);
        break;
      case "SET_CART_COUPON_CODE":
        store.setCartCouponCode(action.payload);
        break;
      case "CLEAR_CART_COUPON_CODE":
        store.clearCartCouponCode();
        break;
      case "OPEN_AUTH_MODAL":
        store.openAuthModal(action.payload.mode, action.payload.redirectPath);
        break;
      case "CLOSE_AUTH_MODAL":
        store.closeAuthModal();
        break;
      case "SET_SIDEBAR_OPEN":
        store.setSidebarOpen(action.payload);
        break;
      default:
        console.warn("Unhandled Redux Action type:", action.type);
    }
  };
}

/**
 * Redux useSelector Hook
 * Selects states reactively from the central store with selective updates
 */
export function useSelector(selectorFn) {
  const storeState = useAppStore((state) => state);
  const [selected, setSelected] = useState(() => selectorFn(storeState));

  useEffect(() => {
    const unsubscribe = useAppStore.subscribe((state) => {
      setSelected(selectorFn(state));
    });
    return unsubscribe;
  }, [selectorFn]);

  return selected;
}
