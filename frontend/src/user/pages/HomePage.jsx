import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { routes } from "../../config/routes";
import { HomeSnapshotSkeleton } from "../../shared/components/Skeleton";
import { useMoney } from "../../shared/hooks/useMoney";
import { useLocale } from "../../shared/localization";
import { useSession } from "../../shared/hooks/useSession";
import { storefrontService } from "../services/storefrontService";
import { ProductCard } from "../components/ProductCard";
import { Button } from "../../shared/components/Button";
import { useSEO } from "../../shared/hooks/useSEO";

export function HomePage() {
  const { t, resolveValue } = useLocale();
  useSEO({
    title: "Home",
    description: "Discover premium fine jewellery, gold, silver, platinum, diamonds, and precious gemstones at BR Jewellers. Shop our exclusive collection today.",
    keywords: "fine jewellery, diamonds, gold jewellery, silver ornaments, platinum rings, BR Jewellers",
  });
  const queryClient = useQueryClient();
  const { user } = useSession();
  const { formatFromInr } = useMoney();
  const homeQuery = useQuery({
    queryKey: ["home-snapshot"],
    queryFn: () => storefrontService.getHomeSnapshot(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const userCouponsQuery = useQuery({
    queryKey: ["user-coupons", user?.id],
    queryFn: () => storefrontService.getAssignedCoupons(user.id),
    enabled: Boolean(user?.id),
  });

  const cartQuery = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: () => storefrontService.getCart(user.id),
    enabled: Boolean(user?.id),
  });
  const cartItems = cartQuery.data?.items || [];

  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const handleCartAdded = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["cart"] });
  }, [queryClient]);

  const handleFavoriteChanged = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["home-snapshot"] });
  }, [queryClient]);

  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < 768);
      }, 150);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);


  if (homeQuery.isLoading) {
    return <HomeSnapshotSkeleton />;
  }

  const { banners = [], featuredProducts = [], homeContent = {} } = homeQuery.data || {};
  const initialLimit = isMobile ? 6 : 8;
  const visibleProducts = showAll ? featuredProducts : featuredProducts.slice(0, initialLimit);

  const assignedCoupons = userCouponsQuery.data || [];
  const activeCoupons = assignedCoupons
    .filter((c) => c.coupon && !c.isUsed && c.coupon.isActive)
    .map((c) => c.coupon);

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
          {!user ? (
            <div className="flex flex-col items-center justify-center rounded-[28px] border border-white/10 bg-white/5 p-8 text-center h-full">
              <p className="text-[#eadcc0]/80 text-sm">Log in to view your available coupons</p>
            </div>
          ) : userCouponsQuery.isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-20 bg-white/5 rounded-[28px]" />
              <div className="h-20 bg-white/5 rounded-[28px]" />
            </div>
          ) : activeCoupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[28px] border border-white/10 bg-white/5 p-8 text-center h-full">
              <p className="text-[#eadcc0]/80 text-sm">No coupons available for your account</p>
            </div>
          ) : (
            activeCoupons.map((coupon) => (
              <div key={coupon.id} className="rounded-[28px] border border-white/10 bg-white/5 p-5 hover:border-[#d5a957] transition duration-300">
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d7ac60]">{coupon.code}</div>
                <div className="mt-2 font-display text-3xl text-white">
                  {t("home.percentOff", { value: coupon.discountPercent || coupon.discountValue })}
                </div>
                <div className="mt-2 text-sm text-[#e9dec8]">{coupon.description}</div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {banners.map((banner) => (
          <article key={banner.id} className="overflow-hidden rounded-[30px] border border-[#dfccab] bg-white shadow-[0_18px_55px_rgba(40,24,13,0.07)]">
            <img src={banner.image} alt={resolveValue(banner.title, "")} width="400" height="192" loading="lazy" fetchpriority="auto" className="h-48 w-full object-cover" />
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

        </div>

        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
        >
          {visibleProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 4}
              isInCart={cartItems.some((item) => item.productId === product.id)}
              onAdded={handleCartAdded}
              onFavoriteChanged={handleFavoriteChanged}
            />
          ))}
        </div>

        {featuredProducts.length > initialLimit && !showAll && (
          <div className="flex justify-center pt-8">
            <Link to={routes.appProducts}>
              <Button
                tone="secondary"
                className="px-8 py-3 rounded-full font-semibold border-[#dfccab] hover:bg-[#fff9f0] transition-colors"
              >
                View More
              </Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
