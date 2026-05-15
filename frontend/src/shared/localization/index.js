import en from "../../locales/en.json";
import hi from "../../locales/hi.json";
import { appConfig } from "../../config/appConfig";
import { useAppStore } from "../store/useAppStore";

const baseCatalogs = {
  en,
  hi,
};

export const supportedLanguages = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिंदी" },
];

const getValueByPath = (source, path) =>
  path.split(".").reduce((current, segment) => current?.[segment], source);

const interpolate = (template, values = {}) =>
  template.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, rawKey) => {
    const key = rawKey.trim();
    return values[key] ?? "";
  });

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

const normalizeLanguage = (language) =>
  supportedLanguages.some((entry) => entry.code === language)
    ? language
    : appConfig.defaultLanguage;

export const getIntlLocale = (language = appConfig.defaultLanguage) =>
  normalizeLanguage(language) === "hi" ? "hi-IN" : "en-IN";

export const buildTranslationCatalog = (language, overrides = {}) => {
  const targetLanguage = normalizeLanguage(language);
  const baseCatalog = baseCatalogs[appConfig.defaultLanguage] || {};
  const languageCatalog = baseCatalogs[targetLanguage] || {};
  const baseOverride = overrides?.[appConfig.defaultLanguage] || {};
  const languageOverride = overrides?.[targetLanguage] || {};

  return mergeNestedObjects(
    mergeNestedObjects(
      mergeNestedObjects(baseCatalog, languageCatalog),
      isPlainObject(baseOverride) ? baseOverride : {}
    ),
    isPlainObject(languageOverride) ? languageOverride : {}
  );
};

export const translateCatalog = (catalog, key, options = {}) => {
  const message = getValueByPath(catalog, key);

  if (typeof message === "string") {
    return interpolate(message, options);
  }

  return options.fallback ?? key;
};

export const translateApp = (key, options = {}) => {
  const { language, translationOverrides } = useAppStore.getState();
  const catalog = buildTranslationCatalog(language, translationOverrides);

  return translateCatalog(catalog, key, options);
};

export const resolveLocalizedValue = (
  value,
  language = appConfig.defaultLanguage,
  fallback = ""
) => {
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  if (!isPlainObject(value)) {
    return fallback;
  }

  const targetLanguage = normalizeLanguage(language);
  const localizedValue =
    value[targetLanguage] ??
    value[appConfig.defaultLanguage] ??
    Object.values(value).find((entry) => typeof entry === "string" || typeof entry === "number");

  return localizedValue ?? fallback;
};

export function useLocale() {
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const translationOverrides = useAppStore((state) => state.translationOverrides);
  const mergeTranslationOverrides = useAppStore((state) => state.mergeTranslationOverrides);
  const replaceTranslationOverrides = useAppStore((state) => state.replaceTranslationOverrides);
  const resetTranslationOverrides = useAppStore((state) => state.resetTranslationOverrides);
  const catalog = buildTranslationCatalog(language, translationOverrides);

  return {
    language,
    languages: supportedLanguages,
    setLanguage,
    t: (key, options) => translateCatalog(catalog, key, options),
    resolveValue: (value, fallback = "") => resolveLocalizedValue(value, language, fallback),
    mergeTranslations: mergeTranslationOverrides,
    replaceTranslations: replaceTranslationOverrides,
    resetTranslations: resetTranslationOverrides,
  };
}
