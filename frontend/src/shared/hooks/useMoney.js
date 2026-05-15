import { useAppStore } from "../store/useAppStore";
import { convertCurrency, formatCurrencyValue } from "../utils/currency";

export function useMoney() {
  const currency = useAppStore((state) => state.currency);
  const language = useAppStore((state) => state.language);

  return {
    currency,
    language,
    convertFromInr: (amount) => convertCurrency(amount, "INR", currency),
    formatFromInr: (amount) => formatCurrencyValue(convertCurrency(amount, "INR", currency), currency, language),
    format: (amount) => formatCurrencyValue(amount, currency, language),
  };
}
