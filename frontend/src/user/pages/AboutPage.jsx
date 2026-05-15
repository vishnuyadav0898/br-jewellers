import { useQuery } from "@tanstack/react-query";
import { Loader } from "../../shared/components/Loader";
import { formatDate } from "../../shared/utils/formatters";
import { storefrontService } from "../services/storefrontService";

export function AboutPage() {
  const aboutQuery = useQuery({
    queryKey: ["content-page", "about"],
    queryFn: () => storefrontService.getContentPage("about"),
  });

  if (aboutQuery.isLoading) {
    return <Loader label="Loading About BR Jewellers..." />;
  }

  const page = aboutQuery.data;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 rounded-[36px] border border-[#dfccab] bg-[#17100d] p-8 text-[#f8efdc] shadow-[0_18px_60px_rgba(32,21,15,0.25)] lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#d5a957]">About us</p>
          <h1 className="mt-3 font-display text-5xl leading-tight">{page.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#ebddc2]">
            Learn the brand story, craftsmanship point of view, and the service approach behind the storefront.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d5a957]">Craft focus</div>
            <div className="mt-3 font-display text-3xl">Modern Indian styling</div>
            <p className="mt-3 text-sm leading-6 text-[#ebddc2]">
              Statement bridal pieces and everyday signatures are designed to feel elevated without becoming impractical.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d5a957]">Updated</div>
            <div className="mt-3 font-display text-3xl">{formatDate(page.updatedAt)}</div>
            <p className="mt-3 text-sm leading-6 text-[#ebddc2]">
              Content stays connected to the admin-managed page copy so the storefront reflects editorial changes automatically.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[34px] border border-[#dfccab] bg-white/90 p-6 shadow-[0_18px_55px_rgba(40,24,13,0.07)]">
        <div
          className="prose prose-stone max-w-none prose-p:text-sm prose-p:leading-7 prose-p:text-stone-600"
          dangerouslySetInnerHTML={{ __html: page.body }}
        />
      </section>
    </div>
  );
}
