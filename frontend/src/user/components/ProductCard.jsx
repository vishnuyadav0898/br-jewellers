import { Heart, Loader2, Gem, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { routes } from "../../config/routes";
import { Button } from "../../shared/components/Button";
import { useMoney } from "../../shared/hooks/useMoney";
import { useLocale } from "../../shared/localization";
import { useSession } from "../../shared/hooks/useSession";
import { notify } from "../../shared/utils/notify";
import { storefrontService } from "../services/storefrontService";

const slugify = (text) =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");

export function ProductCard({ product, onAdded, onFavoriteChanged }) {
  const { formatFromInr } = useMoney();
  const { t } = useLocale();
  const { isAuthenticated, openAuthModal, user } = useSession();
  const queryClient = useQueryClient();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);
  const [imageError, setImageError] = useState(false);

  const cartQuery = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: () => storefrontService.getCart(user.id),
    enabled: Boolean(isAuthenticated && user?.id),
  });

  const cartItem = cartQuery.data?.items?.find((item) => item.productId === product.id);

  const displayDescription = product.description
    ? (product.description.length > 70
      ? product.description.slice(0, 67) + "..."
      : product.description)
    : "";

  return (
    <article className="group overflow-hidden rounded-[20px] sm:rounded-[30px] border border-[#e0d0ad] bg-white shadow-[0_18px_55px_rgba(40,24,13,0.07)] transition duration-300 hover:-translate-y-1 w-full max-w-[360px] mx-auto flex flex-col h-full">
      <div className="relative">
        <Link to={routes.appProductDetails(product.slug || slugify(product.name) || product.id)} state={{ id: product.id }} className="block h-36 sm:h-44 w-full overflow-hidden bg-[#f9f0de]">
          {imageError || !product.images?.[0] ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 sm:gap-2 p-3 text-[#d5a957]/45">
              <Gem className="h-8 w-8 sm:h-10 sm:w-10 animate-pulse" />
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">BR Jewellers</span>
            </div>
          ) : (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          )}
        </Link>
        <button
          type="button"
          aria-label={
            product.isFavorite
              ? t("productCard.removeFromFavorites")
              : t("productCard.addToFavorites")
          }
          className="absolute right-2.5 top-2.5 sm:right-4 sm:top-4 inline-flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-[#e2cfab] bg-white/95 text-[#1b120f] shadow-[0_12px_30px_rgba(26,18,14,0.12)] transition hover:bg-[#fff6e5]"
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
          <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${product.isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
        </button>
      </div>
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
        <div className="space-y-1">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.24em] text-[#9e6c24]">{product.category}</p>
          <Link to={routes.appProductDetails(product.slug || slugify(product.name) || product.id)} state={{ id: product.id }} className="mt-0.5 block font-display text-sm sm:text-base lg:text-lg text-[#1b120f] transition hover:text-[#8a5d18] line-clamp-1">
            {product.name}
          </Link>
          <p className="mt-0.5 text-[11px] sm:text-xs leading-relaxed text-stone-600 line-clamp-2 block">{displayDescription}</p>
        </div>
        <div className="space-y-2 sm:space-y-3 pt-2 sm:pt-3 border-t border-stone-100 mt-2 sm:mt-3">
          <div className="flex items-center justify-between gap-1">
            <span className="text-lg sm:text-2xl font-bold text-[#1b120f]">{formatFromInr(product.price)}</span>
            {product.badge && (
              <span className="rounded-full bg-[#fcf5e8] px-2 py-0.5 text-[9px] sm:text-xs font-semibold text-[#8a5d18] ring-1 ring-[#e2d0ae]">
                {product.badge}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
            <Link
              to={routes.appProductDetails(product.slug || slugify(product.name) || product.id)}
              state={{ id: product.id }}
              className="inline-flex h-9 sm:h-11 items-center justify-center rounded-full bg-white px-2 text-[10px] sm:text-xs font-semibold text-[#20140f] ring-1 ring-[#dbc8a2] transition duration-200 hover:bg-[#fff7e6] text-center"
            >
              {t("productCard.viewDetails")}
            </Link>
            {cartItem ? (
              <Button
                tone="secondary"
                disabled
                className="h-9 sm:h-11 px-2 text-[10px] sm:text-xs font-semibold w-full opacity-65 cursor-not-allowed border-[#dbc8a2] bg-[#fdfaf2] text-[#8a5d18]"
              >
                {t("productCard.added")}
              </Button>
            ) : (
              <Button
                tone="accent"
                disabled={isAddingToCart}
                className="h-9 sm:h-11 px-2 text-[10px] sm:text-xs font-semibold w-full"
                onClick={async () => {
                  if (!isAuthenticated) {
                    openAuthModal("login", routes.appCart);
                    return;
                  }

                  // Resolve SKU from already-loaded product variants — no extra API call
                  const variant =
                    product.variants?.find((v) => v.isDefault && v.sku) ||
                    product.variants?.find((v) => v.isAvailable !== false && v.sku) ||
                    product.variants?.[0];

                  const sku = variant?.sku;
                  if (!sku) {
                    notify.error("This product is currently unavailable.");
                    return;
                  }

                  setIsAddingToCart(true);
                  try {
                    await storefrontService.addToCart(user.id, product.id, sku);
                    notify.success(t("productCard.addedToCart"), {
                      title: t("productCard.cartUpdated"),
                      iconKey: "order",
                    });
                    queryClient.invalidateQueries({ queryKey: ["cart"] });
                    onAdded?.();
                  } catch (err) {
                    notify.error(err.message || "Failed to add to cart");
                  } finally {
                    setIsAddingToCart(false);
                  }
                }}
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Adding...
                  </>
                ) : (
                  t("productCard.addToCart")
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
