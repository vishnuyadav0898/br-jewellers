import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { routes } from "../../config/routes";
import { Loader } from "../../shared/components/Loader";
import { useMoney } from "../../shared/hooks/useMoney";
import { useLocale } from "../../shared/localization";
import { useSession } from "../../shared/hooks/useSession";
import { storefrontService } from "../services/storefrontService";
import { ProductCard } from "../components/ProductCard";
import { Button } from "../../shared/components/Button";

export function HomePage() {
  const { t, resolveValue } = useLocale();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const { formatFromInr } = useMoney();
  const homeQuery = useQuery({
    queryKey: ["home-snapshot", user?.id],
    queryFn: () => storefrontService.getHomeSnapshot(user?.id),
  });

  if (homeQuery.isLoading) {
    return <Loader label={t("common.loading")} />;
  }

  const { banners, featuredProducts, activeCoupons, homeContent = {} } = homeQuery.data;

  return (
    <div className="space-y-8">
      <section className="grid gap-6 rounded-[36px] border border-[#e1cfab] bg-[#17100d] p-8 text-[#f8efdc] shadow-[0_18px_60px_rgba(32,21,15,0.25)] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#d5a957]">
            {resolveValue(homeContent.heroEyebrow, t("home.eyebrow"))}
          </p>
          <h1 className="max-w-3xl font-display text-5xl leading-tight">
            {resolveValue(homeContent.heroTitle, t("home.title"))}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[#eadcc0]">
            {resolveValue(homeContent.heroSubtitle, t("home.subtitle"))}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to={routes.appProducts}>
              <Button tone="accent">{t("home.ctaPrimary")}</Button>
            </Link>
            <Link to={routes.adminDashboard}>
              <Button tone="secondary">{t("home.ctaSecondary")}</Button>
            </Link>
          </div>
        </div>
        <div className="grid gap-4">
          {activeCoupons.map((coupon) => (
            <div key={coupon.id} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d7ac60]">{coupon.code}</div>
              <div className="mt-2 font-display text-3xl">
                {t("home.percentOff", { value: coupon.discountPercent })}
              </div>
              <div className="mt-2 text-sm text-[#e9dec8]">{coupon.description}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {banners.map((banner) => (
          <article key={banner.id} className="overflow-hidden rounded-[30px] border border-[#dfccab] bg-white shadow-[0_18px_55px_rgba(40,24,13,0.07)]">
            <img src={banner.image} alt={resolveValue(banner.title, "")} className="h-48 w-full object-cover" />
            <div className="space-y-3 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9e6c24]">
                {resolveValue(banner.tag, t("home.bannerFallbackTag"))}
              </div>
              <h2 className="font-display text-3xl text-[#1a120e]">
                {resolveValue(banner.title, "")}
              </h2>
              <p className="text-sm leading-6 text-stone-600">
                {resolveValue(banner.subtitle, "")}
              </p>
            </div>
          </article>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9e6c24]">
              {t("home.featuredEyebrow")}
            </p>
            <h2 className="mt-2 font-display text-4xl text-[#1a120e]">
              {resolveValue(homeContent.featuredTitle, t("home.featuredTitle"))}
            </h2>
          </div>
          <div className="rounded-full bg-[#f7ecd6] px-4 py-2 text-sm text-[#7a541c]">
            {t("home.samplePrice", { value: formatFromInr(featuredProducts[0]?.price || 0) })}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdded={() => queryClient.invalidateQueries({ queryKey: ["cart"] })}
              onFavoriteChanged={() => queryClient.invalidateQueries({ queryKey: ["home-snapshot", user?.id] })}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
