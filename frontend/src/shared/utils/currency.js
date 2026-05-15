import { appConfig } from "../../config/appConfig";

export const convertCurrency = (
  amount,
  from = appConfig.defaultCurrency,
  to = appConfig.defaultCurrency,
  rates = appConfig.currencyRates
) => {
  if (from === to) return amount ?? 0;

  const baseValue = (amount ?? 0) / (rates[from] || 1);
  return Number((baseValue * (rates[to] || 1)).toFixed(2));
};

export const formatCurrencyValue = (amount, currency = appConfig.defaultCurrency, language = "en") =>
  new Intl.NumberFormat(language === "hi" ? "hi-IN" : "en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "INR" ? 0 : 2,
  }).format(amount ?? 0);

export const detectMockCountry = () => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

  if (timezone.includes("Asia")) return "IN";
  if (timezone.includes("Europe")) return "EU";
  return "US";
};

export const detectDefaultCurrency = () =>
  appConfig.countryCurrencyMap[detectMockCountry()] || appConfig.defaultCurrency;
