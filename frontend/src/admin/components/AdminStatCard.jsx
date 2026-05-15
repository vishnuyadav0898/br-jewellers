export function AdminStatCard({ label, value, helper }) {
  return (
    <article className="rounded-[24px] border border-[#ecdec2] bg-[#fffaf1] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9f6d22]">{label}</p>
      <p className="mt-4 font-display text-4xl text-[#1d130f]">{value}</p>
      {helper ? <p className="mt-2 text-sm text-stone-600">{helper}</p> : null}
    </article>
  );
}
