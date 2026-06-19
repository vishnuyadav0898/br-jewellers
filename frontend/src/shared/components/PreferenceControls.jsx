import { useAppStore } from "../store/useAppStore";
import { cn } from "../utils/cn";

const supportedCurrencies = ["INR", "USD"];

export function PreferenceControls({ className }) {
  const currency = useAppStore((state) => state.currency);
  const setCurrency = useAppStore((state) => state.setCurrency);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[#ddc8a3] bg-white px-3 py-2",
        className
      )}
    >
      <span className="text-sm font-bold text-[#8f6320]">$</span>
      <select
        value={currency}
        onChange={(event) => {
          setCurrency(event.target.value);
          localStorage.setItem("br_currency_manually_set", "true");
        }}
        aria-label="Currency Selector"
        className="bg-transparent text-sm font-medium outline-none cursor-pointer"
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
