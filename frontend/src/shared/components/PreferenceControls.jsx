import { Globe } from "lucide-react";
import { useLocale } from "../localization";
import { useAppStore } from "../store/useAppStore";
import { cn } from "../utils/cn";

const supportedCurrencies = ["INR", "USD"];

export function PreferenceControls({ className }) {
  const { language, languages, setLanguage, t } = useLocale();
  const currency = useAppStore((state) => state.currency);
  const setCurrency = useAppStore((state) => state.setCurrency);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[#ddc8a3] bg-white px-3 py-2",
        className
      )}
    >
      <Globe className="h-4 w-4 text-[#8f6320]" />
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        aria-label={t("common.language")}
        className="bg-transparent text-sm font-medium"
      >
        {languages.map((entry) => (
          <option key={entry.code} value={entry.code}>
            {entry.nativeLabel}
          </option>
        ))}
      </select>
      <select
        value={currency}
        onChange={(event) => {
          setCurrency(event.target.value);
          localStorage.setItem("br_currency_manually_set", "true");
        }}
        aria-label={t("common.currency")}
        className="bg-transparent text-sm font-medium"
      >
        {supportedCurrencies.map((entry) => (
          <option key={entry} value={entry}>
            {entry}
          </option>
        ))}
      </select>
    </div>
  );
}
