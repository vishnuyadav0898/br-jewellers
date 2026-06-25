import { Profiler, useState, useEffect } from "react";
import { useProfilerStore } from "../store/useProfilerStore";
import { Zap, X, Trash2, Search, Sliders, ChevronDown, ChevronUp } from "lucide-react";

export function PerformanceProfiler({ id, children, enabled = true }) {
  const addRender = useProfilerStore((state) => state.addRender);

  const handleRender = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  ) => {
    addRender(id, phase, actualDuration);

    // Warn in console for renders taking longer than 8ms
    if (import.meta.env.DEV && actualDuration > 8) {
      console.warn(
        `[Profiler: ${id}] Slow render (${phase}): ${actualDuration.toFixed(
          2
        )}ms (base: ${baseDuration.toFixed(2)}ms)`
      );
    }
  };

  if (!enabled) return children;

  return (
    <Profiler id={id} onRender={handleRender}>
      {children}
    </Profiler>
  );
}

export function PerformanceHUD() {
  const { stats, clearStats } = useProfilerStore();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("count"); // 'name' | 'count' | 'avg' | 'peak'
  const [sortOrder, setSortOrder] = useState("desc");
  const [isVisible, setIsVisible] = useState(false);

  // Enable HUD automatically in development or if explicitly enabled via localStorage
  useEffect(() => {
    const isDev = import.meta.env.DEV;
    const forceShow = localStorage.getItem("show_profiler") === "true";
    if (isDev || forceShow) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const statList = Object.entries(stats).map(([id, data]) => ({
    id,
    ...data,
  }));

  const filteredStats = statList
    .filter((s) => s.id.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let valA, valB;
      if (sortBy === "name") {
        valA = a.id.toLowerCase();
        valB = b.id.toLowerCase();
      } else {
        valA = a[sortBy === "avg" ? "avgDuration" : sortBy === "peak" ? "peakDuration" : "count"];
        valB = b[sortBy === "avg" ? "avgDuration" : sortBy === "peak" ? "peakDuration" : "count"];
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const getHealthColor = (avg) => {
    if (avg < 3) return "text-emerald-400";
    if (avg < 8) return "text-amber-400";
    return "text-rose-500 font-bold";
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="inline h-3.5 w-3.5 ml-0.5" />
    ) : (
      <ChevronDown className="inline h-3.5 w-3.5 ml-0.5" />
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1c120f] border border-[#d3a347]/40 text-[#d3a347] shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:scale-105 hover:bg-[#281a16] hover:border-[#d3a347] focus:outline-none"
          title="Open Performance Profiler"
        >
          <Zap className="h-5 w-5 animate-pulse" />
        </button>
      )}

      {/* Main HUD Panel */}
      {isOpen && (
        <div className="w-[380px] max-w-[calc(100vw-32px)] rounded-3xl border border-[#d3a347]/30 bg-[#1c120f]/95 p-5 text-[#f7eed9] shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-md flex flex-col max-h-[500px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#d3a347]/10 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#d3a347]" />
              <span className="font-display font-semibold tracking-wide text-[#d3a347]">
                React Profiler HUD
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={clearStats}
                className="rounded-lg p-1.5 hover:bg-white/5 text-stone-400 hover:text-rose-400 transition"
                title="Reset Statistics"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 hover:bg-white/5 text-stone-400 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative mb-3 shrink-0">
            <span className="absolute inset-y-0 left-3 flex items-center text-stone-500">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Filter components..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-1.5 pl-9 pr-4 text-sm text-[#f7eed9] placeholder-stone-500 focus:border-[#d3a347]/50 focus:bg-white/10 focus:outline-none transition"
            />
          </div>

          {/* Table Headers */}
          <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-white/5 pb-2 px-1 shrink-0 select-none">
            <button
              onClick={() => handleSort("name")}
              className="text-left hover:text-white transition"
            >
              Component{getSortIcon("name")}
            </button>
            <button
              onClick={() => handleSort("count")}
              className="text-right hover:text-white transition"
            >
              Renders{getSortIcon("count")}
            </button>
            <button
              onClick={() => handleSort("avg")}
              className="text-right hover:text-white transition"
            >
              Avg{getSortIcon("avg")}
            </button>
            <button
              onClick={() => handleSort("peak")}
              className="text-right hover:text-white transition"
            >
              Peak{getSortIcon("peak")}
            </button>
          </div>

          {/* Table Data */}
          <div className="flex-1 overflow-y-auto space-y-1.5 py-2 pr-1 scrollbar-thin">
            {filteredStats.length === 0 ? (
              <div className="text-center py-6 text-stone-500 text-xs">
                No active profile measurements.
              </div>
            ) : (
              filteredStats.map((stat) => (
                <div
                  key={stat.id}
                  className="grid grid-cols-[1.5fr_1fr_1fr_1fr] text-xs py-1.5 px-1 hover:bg-white/5 rounded-lg transition border border-transparent hover:border-white/5"
                >
                  <div className="truncate pr-1 font-medium" title={stat.id}>
                    {stat.id}
                  </div>
                  <div className="text-right text-stone-300 font-mono">
                    {stat.count}
                  </div>
                  <div
                    className={`text-right font-mono ${getHealthColor(
                      stat.avgDuration
                    )}`}
                  >
                    {stat.avgDuration.toFixed(1)}ms
                  </div>
                  <div className="text-right text-stone-300 font-mono">
                    {stat.peakDuration.toFixed(1)}ms
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          <div className="border-t border-[#d3a347]/10 pt-2 mt-2 text-[10px] text-stone-500 flex justify-between shrink-0">
            <span>Renders: &lt;3ms (Fast), &gt;8ms (Slow)</span>
            <span>Ctrl + Shift + P to toggle</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Global hotkey support to open/close
if (typeof window !== "undefined") {
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "p") {
      e.preventDefault();
      const btn = document.querySelector('button[title="Open Performance Profiler"]');
      if (btn) {
        btn.click();
      } else {
        const closeBtn = document.querySelector('button[title="Reset Statistics"]')?.nextElementSibling;
        if (closeBtn) closeBtn.click();
      }
    }
  });
}
