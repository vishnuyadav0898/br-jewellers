import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { appConfig } from "../../config/appConfig";
import { detectDefaultCurrency, detectMockCountry } from "../utils/currency";
import { normalizeUserRole } from "../utils/auth";

const supportedLanguages = new Set(["en", "hi"]);

const normalizeLanguage = (language) =>
  supportedLanguages.has(language) ? language : appConfig.defaultLanguage;

const isPlainObject = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const mergeNestedObjects = (currentValue, nextValue) => {
  if (!isPlainObject(currentValue) || !isPlainObject(nextValue)) {
    return nextValue;
  }

  const merged = { ...currentValue };

  Object.entries(nextValue).forEach(([key, value]) => {
    merged[key] = mergeNestedObjects(currentValue[key], value);
  });

  return merged;
};

export const useAppStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      authModalMode: "login",
      authModalOpen: false,
      authRedirectPath: null,
      sidebarOpen: false,
      language: normalizeLanguage(appConfig.defaultLanguage),
      currency: detectDefaultCurrency(),
      detectedCountry: detectMockCountry(),
      cartCouponCode: "",
      translationOverrides: {},
      setUser: (user) =>
        set({
          user: normalizeUserRole(user),
          isAuthenticated: Boolean(user),
        }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          authModalOpen: false,
          authRedirectPath: null,
          cartCouponCode: "",
        }),
      openAuthModal: (mode = "login", redirectPath) =>
        set((state) => ({
          authModalMode: mode,
          authModalOpen: true,
          authRedirectPath:
            redirectPath === undefined ? state.authRedirectPath : redirectPath,
        })),
      closeAuthModal: () => set({ authModalOpen: false, authRedirectPath: null }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setLanguage: (language) => set({ language: normalizeLanguage(language) }),
      setCurrency: (currency) => set({ currency }),
      mergeTranslationOverrides: (language, messages) =>
        set((state) => {
          const targetLanguage = normalizeLanguage(language);
          const currentMessages = state.translationOverrides[targetLanguage] || {};

          return {
            translationOverrides: {
              ...state.translationOverrides,
              [targetLanguage]: mergeNestedObjects(currentMessages, messages || {}),
            },
          };
        }),
      replaceTranslationOverrides: (language, messages) =>
        set((state) => ({
          translationOverrides: {
            ...state.translationOverrides,
            [normalizeLanguage(language)]: isPlainObject(messages) ? messages : {},
          },
        })),
      resetTranslationOverrides: (language) =>
        set((state) => {
          if (!language) {
            return { translationOverrides: {} };
          }

          const nextOverrides = { ...state.translationOverrides };
          delete nextOverrides[normalizeLanguage(language)];

          return { translationOverrides: nextOverrides };
        }),
      initializePreferences: () =>
        set((state) => ({
          detectedCountry: state.detectedCountry || detectMockCountry(),
          currency: state.currency || detectDefaultCurrency(),
          language: normalizeLanguage(state.language),
        })),
      setCartCouponCode: (cartCouponCode) => set({ cartCouponCode }),
      clearCartCouponCode: () => set({ cartCouponCode: "" }),
    }),
    {
      name: appConfig.storageKey,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        language: state.language,
        currency: state.currency,
        detectedCountry: state.detectedCountry,
        cartCouponCode: state.cartCouponCode,
        translationOverrides: state.translationOverrides,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        user: normalizeUserRole(persistedState?.user),
        isAuthenticated: Boolean(persistedState?.user),
        language: normalizeLanguage(persistedState?.language),
        translationOverrides: isPlainObject(persistedState?.translationOverrides)
          ? persistedState.translationOverrides
          : {},
      }),
    }
  )
);
