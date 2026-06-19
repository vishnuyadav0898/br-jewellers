export function AdminPageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 w-full">
      <div className="flex-1 min-w-0">
        <h1 className="font-display text-4xl text-[#1d130f] sm:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-3 text-sm leading-relaxed text-stone-600 max-w-3xl">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap gap-3 self-start md:self-center md:pt-4">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
