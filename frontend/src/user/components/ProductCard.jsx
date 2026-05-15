import { Heart } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { routes } from "../../config/routes";
import { Button } from "../../shared/components/Button";
import { useMoney } from "../../shared/hooks/useMoney";
import { useLocale } from "../../shared/localization";
import { useSession } from "../../shared/hooks/useSession";
import { notify } from "../../shared/utils/notify";
import { storefrontService } from "../services/storefrontService";

export function ProductCard({ product, onAdded, onFavoriteChanged }) {
  const { formatFromInr } = useMoney();
  const { t } = useLocale();
  const { isAuthenticated, openAuthModal, user } = useSession();
  const queryClient = useQueryClient();

  return (
    <article className="group overflow-hidden rounded-[30px] border border-[#e0d0ad] bg-white shadow-[0_18px_55px_rgba(40,24,13,0.07)] transition duration-300 hover:-translate-y-1">
      <div className="relative">
        <Link to={routes.appProductDetails(product.slug || product.id)} className="block aspect-[4/4.3] overflow-hidden bg-[#f9f0de]">
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        </Link>
        <button
          type="button"
          aria-label={
            product.isFavorite
              ? t("productCard.removeFromFavorites")
              : t("productCard.addToFavorites")
          }
          className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#e2cfab] bg-white/95 text-[#1b120f] shadow-[0_12px_30px_rgba(26,18,14,0.12)] transition hover:bg-[#fff6e5]"
          onClick={async (event) => {
            event.preventDefault();

            if (!isAuthenticated) {
              openAuthModal("login", routes.appFavorites);
              return;
            }

            await storefrontService.toggleFavorite(user.id, product.id);
            queryClient.invalidateQueries({ queryKey: ["favorites", user.id] });
            notify.success(
              product.isFavorite
                ? t("productCard.favoriteRemoved")
                : t("productCard.favoriteSaved"),
              {
                title: t("productCard.favoritesUpdated"),
                iconKey: "sparkle",
              }
            );
            onFavoriteChanged?.();
          }}
        >
          <Heart className={`h-4 w-4 ${product.isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
        </button>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9e6c24]">{product.category}</p>
          <Link to={routes.appProductDetails(product.slug || product.id)} className="mt-2 block font-display text-3xl text-[#1b120f] transition hover:text-[#8a5d18]">
            {product.name}
          </Link>
          <p className="mt-2 text-sm leading-6 text-stone-600">{product.description}</p>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xl font-semibold text-[#1b120f]">{formatFromInr(product.price)}</div>
            <div className="text-sm text-stone-500">{product.badge}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to={routes.appProductDetails(product.slug || product.id)}
              className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-[#20140f] ring-1 ring-[#dbc8a2] transition duration-200 hover:bg-[#fff7e6]"
            >
              {t("productCard.viewDetails")}
            </Link>
            <Button
              tone="accent"
              onClick={async () => {
                if (!isAuthenticated) {
                  openAuthModal("login", routes.appCart);
                  return;
                }

                await storefrontService.addToCart(user.id, product.id);
                notify.success(t("productCard.addedToCart"), {
                  title: t("productCard.cartUpdated"),
                  iconKey: "order",
                });
                onAdded?.();
              }}
            >
              {t("productCard.addToCart")}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
