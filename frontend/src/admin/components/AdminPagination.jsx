import { Button } from "../../shared/components/Button";

export function AdminPagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-[22px] border border-[#eadcc0] bg-[#fffaf1] px-4 py-3">
      <div className="text-sm text-stone-600">
        Page <span className="font-semibold text-[#1a120e]">{page}</span> of{" "}
        <span className="font-semibold text-[#1a120e]">{totalPages}</span>
      </div>
      <div className="flex gap-2">
        <Button tone="secondary" size="sm" onClick={() => onChange(page - 1)} disabled={page <= 1}>
          Previous
        </Button>
        <Button
          tone="secondary"
          size="sm"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
