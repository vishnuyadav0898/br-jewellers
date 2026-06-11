export const appConfig = {
  name: "BR Jewellers",
  shortName: "BR",
  tagline: "Modern heirlooms with mock-first commerce architecture",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  storageKey: "br-jewellers-frontend-v2",
  mockDatabaseKey: "br-jewellers-frontend-demo-db-v2",
  defaultLanguage: "en",
  defaultCurrency: "INR",
  supportedLanguages: [
    { value: "en", label: "English" },
    { value: "hi", label: "Hindi" },
  ],
  supportedCurrencies: [
    { value: "INR", label: "INR" },
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
  ],
  currencyRates: {
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
  },
  countryCurrencyMap: {
    IN: "INR",
    US: "USD",
    EU: "EUR",
  },
};
