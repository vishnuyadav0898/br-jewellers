export function AdminPageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9f6d22]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 font-display text-4xl text-[#1d130f] sm:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-3 text-sm leading-6 text-stone-600">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
