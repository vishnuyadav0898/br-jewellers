import { useEffect, useState } from "react";
import { Gem, TrendingUp, TrendingDown } from "lucide-react";
import { useMoney } from "../hooks/useMoney";

export function MetalRatesWidget() {
  const { formatFromInr } = useMoney();
  const [goldBase, setGoldBase] = useState(7248.50);
  const [silverBase, setSilverBase] = useState(91.75);
  const [goldChange, setGoldChange] = useState(0.32);
  const [silverChange, setSilverChange] = useState(-0.15);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate live market fluctuations
      setGoldBase((prev) => {
        const diff = (Math.random() * 0.8 - 0.4);
        setGoldChange((prevChange) => +(prevChange + diff * 0.01).toFixed(2));
        return +(prev + diff).toFixed(2);
      });
      setSilverBase((prev) => {
        const diff = (Math.random() * 0.04 - 0.02);
        setSilverChange((prevChange) => +(prevChange + diff * 0.02).toFixed(2));
        return +(prev + diff).toFixed(4);
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="rounded-[30px] border border-[#dfccab] bg-white/90 p-5 shadow-[0_18px_55px_rgba(40,24,13,0.05)] backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9e6c24]">Live Metal Rates</span>
          </div>
          <h2 className="mt-1 font-display text-2xl text-[#1a120e]">Precious Metals Index</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1 md:flex-initial md:min-w-[450px]">
          {/* Gold Rate Card */}
          <div className="rounded-2xl border border-[#e2d0ae] bg-[#fffaf1] p-3 sm:p-4 flex items-center justify-between gap-2 shadow-[0_4px_12px_rgba(40,24,13,0.02)]">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Gold (24K/g)</div>
              <div className="text-base sm:text-lg font-bold text-[#1a120e]">
                {formatFromInr(goldBase)}
              </div>
            </div>
            <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${goldChange >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
              {goldChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{goldChange >= 0 ? "+" : ""}{goldChange}%</span>
            </div>
          </div>

          {/* Silver Rate Card */}
          <div className="rounded-2xl border border-[#e2d0ae] bg-[#fffaf1] p-3 sm:p-4 flex items-center justify-between gap-2 shadow-[0_4px_12px_rgba(40,24,13,0.02)]">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Silver (999/g)</div>
              <div className="text-base sm:text-lg font-bold text-[#1a120e]">
                {formatFromInr(silverBase)}
              </div>
            </div>
            <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${silverChange >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
              {silverChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{silverChange >= 0 ? "+" : ""}{silverChange}%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
