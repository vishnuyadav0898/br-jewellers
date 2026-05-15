export function EmptyState({ title, description }) {
  return (
    <div className="rounded-[28px] border border-dashed border-[#d8c4a2] bg-white/70 px-6 py-12 text-center">
      <h3 className="font-display text-3xl text-[#1b120f]">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-stone-600">{description}</p>
    </div>
  );
}
