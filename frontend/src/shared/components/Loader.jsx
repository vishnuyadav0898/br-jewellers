import { LoaderCircle } from "lucide-react";

export function Loader({ label = "Loading..." }) {
  return (
    <div className="rounded-[28px] border border-[#e1cfab] bg-white/90 px-6 py-12 text-center text-stone-600 shadow-[0_18px_50px_rgba(51,31,15,0.08)]">
      <div className="flex items-center justify-center gap-3">
        <LoaderCircle className="h-5 w-5 animate-spin text-[#b88733]" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  );
}
