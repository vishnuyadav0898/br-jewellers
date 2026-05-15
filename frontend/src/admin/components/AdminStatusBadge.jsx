import { cn } from "../../shared/utils/cn";

const toneMap = {
  active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  approved: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  enabled: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  featured: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  paid: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  shipped: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  ordered: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  processing: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  draft: "bg-stone-100 text-stone-700 ring-1 ring-stone-200",
  standard: "bg-stone-100 text-stone-700 ring-1 ring-stone-200",
  disabled: "bg-stone-100 text-stone-700 ring-1 ring-stone-200",
  archived: "bg-stone-100 text-stone-700 ring-1 ring-stone-200",
  rejected: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  cancelled: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
};

export function AdminStatusBadge({ value, className }) {
  const normalized = String(value || "").toLowerCase();

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        toneMap[normalized] || "bg-stone-100 text-stone-700 ring-1 ring-stone-200",
        className
      )}
    >
      {value}
    </span>
  );
}
