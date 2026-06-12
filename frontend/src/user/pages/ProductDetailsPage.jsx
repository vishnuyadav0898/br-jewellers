import { Heart, ShoppingBag, Star, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "react-router-dom";
import { routes } from "../../config/routes";
import { Button } from "../../shared/components/Button";
import { EmptyState } from "../../shared/components/EmptyState";
import { Loader } from "../../shared/components/Loader";
import { useMoney } from "../../shared/hooks/useMoney";
import { useSession } from "../../shared/hooks/useSession";
import { formatDate } from "../../shared/utils/formatters";
import { notify } from "../../shared/utils/notify";
import { formatCurrencyValue } from "../../shared/utils/currency";
import { storefrontService } from "../services/storefrontService";
import { ProductCard } from "../components/ProductCard";

const slugify = (text) =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");

const renderStars = (rating = 0) =>
  Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      className={`h-4 w-4 ${index < Math.round(rating) ? "fill-[#d3a347] text-[#d3a347]" : "text-stone-300"}`}
    />
  ));

export function ProductDetailsPage() {
  const { slug, productId } = useParams();
  const location = useLocation();
  const productIdentifier = location.state?.id || slug || productId;
  const queryClient = useQueryClient();
  const { formatFromInr, language, currency, format } = useMoney();
  const { user, isAuthenticated, openAuthModal } = useSession();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [selectedPurity, setSelectedPurity] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const productQuery = useQuery({
    queryKey: ["product", productIdentifier],
    queryFn: async () => {
      let resolvedId = productIdentifier;
      if (productIdentifier && !productIdentifier.match(/^[0-9a-fA-F]{24}$/)) {
        const productsList = await storefrontService.getProducts("");
        const matched = productsList.find(
          (p) => p.slug === productIdentifier || slugify(p.name) === productIdentifier
        );
        if (!matched) {
          throw new Error("Product not found");
        }
        resolvedId = matched.id;
      }
      return storefrontService.getProductById(resolvedId);
    },
  });

  useEffect(() => {
    if (!productQuery.data?.product) {
      return;
    }

    const { product } = productQuery.data;
    setSelectedImage(0);

    // Try to find the default variant or first available variant to pre-populate options
    const defaultVariant = product.variants?.find((v) => v.isDefault) || product.variants?.[0];

    setSelectedColor(defaultVariant?.color || product.colors?.[0]?.name || "");
    setSelectedSize(defaultVariant?.size || product.sizes?.[0] || "");
    setSelectedMaterial(defaultVariant?.material || "");
    setSelectedPurity(defaultVariant?.purity || "");
  }, [productQuery.data?.product]);

  if (productQuery.isLoading) {
    return <Loader label="Loading product details..." />;
  }

  if (productQuery.isError || !productQuery.data?.product) {
    return (
      <EmptyState
        title="Product not found"
        description="The product you requested is unavailable or the link is no longer valid."
      />
    );
  }

  const { product, reviews, relatedProducts } = productQuery.data;

  // Extract unique attribute choices from variants for selectors
  const uniqueMaterials = product.variants?.length
    ? [...new Set(product.variants.map((v) => v.material).filter(Boolean))]
    : [];

  const uniquePurities = product.variants?.length
    ? [...new Set(product.variants.map((v) => v.purity).filter(Boolean))]
    : [];

  const uniqueColors = product.variants?.length
    ? [...new Set(product.variants.map((v) => v.color).filter(Boolean))]
    : [];

  const uniqueSizes = product.variants?.length
    ? [...new Set(product.variants.map((v) => v.size).filter(Boolean))]
    : [];

  const colorsList = uniqueColors.length
    ? uniqueColors.map((c) => {
      const found = product.colors?.find((pc) => pc.name === c);
      return { name: c, code: found?.code || "#D3A347" };
    })
    : product.colors || [];

  const sizesList = uniqueSizes.length ? uniqueSizes : product.sizes || [];

  // Helper to find variant matching current options
  const matchingVariant = product.variants?.find(
    (v) =>
      (!selectedColor || v.color === selectedColor) &&
      (!selectedSize || v.size === selectedSize) &&
      (!selectedMaterial || v.material === selectedMaterial) &&
      (!selectedPurity || v.purity === selectedPurity)
  );

  const getPricesDisplay = () => {
    if (product.variants?.length && !matchingVariant) {
      return (
        <div className="text-sm font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 inline-block">
          Combination not available. Please select other options.
        </div>
      );
    }

    let inrPrice = 0;
    let usdPrice = 0;
    if (matchingVariant && matchingVariant.price) {
      inrPrice = matchingVariant.price.INR;
      usdPrice = matchingVariant.price.USD;
    } else {
      inrPrice = product.price;
      usdPrice = Math.round(product.price * 0.012); // Fallback approximation
    }

    const activePrice = currency === "USD" ? usdPrice : inrPrice;
    const originalPriceInActiveCurrency = currency === "USD"
      ? (product.originalPrice ? Math.round(product.originalPrice * 0.012) : 0)
      : (product.originalPrice || 0);

    const hasDiscount = originalPriceInActiveCurrency > activePrice;

    return (
      <div className="space-y-3">
        <div className="flex items-end gap-3 flex-wrap">
          <div className="text-4xl font-semibold text-[#1a120e]">
            {formatCurrencyValue(activePrice, currency, language)}
          </div>
          {hasDiscount && (
            <div className="text-xl text-stone-400 line-through">
              {formatCurrencyValue(originalPriceInActiveCurrency, currency, language)}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-sm text-stone-500">
        <Link to={routes.appProducts} className="transition hover:text-[#8a5d18]">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#1a120e]">{product.name}</span>
      </div>

      <section className="grid gap-6 rounded-[36px] border border-[#dfccab] bg-white/90 p-6 shadow-[0_18px_55px_rgba(40,24,13,0.07)] lg:grid-cols-[1fr_0.95fr]">
        {product.images && product.images.length > 1 ? (
          <div className="grid grid-cols-[72px_1fr] gap-4 sm:grid-cols-[88px_1fr]">
            <div className="flex max-h-[520px] flex-col gap-3 overflow-y-auto pr-1">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  className={`shrink-0 overflow-hidden rounded-[18px] border ${selectedImage === index ? "border-[#1a120e]" : "border-[#e3d2b0]"}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={image} alt={`${product.name} view ${index + 1}`} className="aspect-square w-full object-cover" />
                </button>
              ))}
            </div>
            <div className="overflow-hidden rounded-[28px] bg-[#f9f0de]">
              <img src={product.images[selectedImage]} alt={product.name} className="aspect-[4/4.5] w-full object-cover" />
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[28px] bg-[#f9f0de]">
            <img src={product.images?.[0] || product.coverImage} alt={product.name} className="aspect-[4/4.5] w-full object-cover" />
          </div>
        )}

        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap gap-2 items-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9e6c24]">{product.category}</p>
              {product.badge && (
                <span className="rounded-full bg-[#f8ebca] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#7a541c]">
                  {product.badge}
                </span>
              )}
              {product.gemstone && product.gemstone !== "Gold" && (
                <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-600">
                  {product.gemstone}
                </span>
              )}
            </div>
            <h1 className="mt-3 font-display text-5xl leading-tight text-[#1a120e]">{product.name}</h1>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center gap-1">{renderStars(product.rating)}</div>
              <span className="text-sm text-stone-500">
                {product.reviewCount} review{product.reviewCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          {getPricesDisplay()}

          <p className="text-base leading-7 text-stone-600">{product.description}</p>
          <p className="text-sm leading-7 text-stone-500">{product.details}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            {uniqueMaterials.length > 1 && (
              <div className="rounded-[24px] bg-[#fff7ea] p-4">
                <div className="text-sm font-semibold text-[#1a120e]">Material</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {uniqueMaterials.map((material) => (
                    <button
                      key={material}
                      type="button"
                      onClick={() => setSelectedMaterial(material)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${selectedMaterial === material
                        ? "border-[#1a120e] bg-[#1a120e] text-[#f8ebca]"
                        : "border-[#dbc8a2] bg-white text-[#1a120e]"
                        }`}
                    >
                      {material}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {uniquePurities.length > 1 && (
              <div className="rounded-[24px] bg-[#fff7ea] p-4">
                <div className="text-sm font-semibold text-[#1a120e]">Purity</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {uniquePurities.map((purity) => (
                    <button
                      key={purity}
                      type="button"
                      onClick={() => setSelectedPurity(purity)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${selectedPurity === purity
                        ? "border-[#1a120e] bg-[#1a120e] text-[#f8ebca]"
                        : "border-[#dbc8a2] bg-white text-[#1a120e]"
                        }`}
                    >
                      {purity}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {colorsList.length > 0 && (
              <div className="rounded-[24px] bg-[#fff7ea] p-4">
                <div className="text-sm font-semibold text-[#1a120e]">Finish</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {colorsList.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColor(color.name)}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${selectedColor === color.name
                        ? "border-[#1a120e] bg-[#1a120e] text-[#f8ebca]"
                        : "border-[#dbc8a2] bg-white text-[#1a120e]"
                        }`}
                    >
                      <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: color.code }} />
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sizesList.length > 0 && (
              <div className="rounded-[24px] bg-[#fff7ea] p-4">
                <div className="text-sm font-semibold text-[#1a120e]">Size</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sizesList.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${selectedSize === size
                        ? "border-[#1a120e] bg-[#1a120e] text-[#f8ebca]"
                        : "border-[#dbc8a2] bg-white text-[#1a120e]"
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="text-xs font-semibold text-stone-500 self-center mr-1">Tags:</span>
              {product.tags.map((tag) => (
                <span key={tag} className="rounded-md bg-stone-100 px-2 py-1 text-xs text-stone-600 border border-stone-200/50">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              disabled={isAddingToCart || (product.variants?.length && !matchingVariant)}
              onClick={async () => {
                if (!isAuthenticated) {
                  openAuthModal("login", routes.appCart);
                  return;
                }

                const sku = matchingVariant?.sku;
                if (!sku) {
                  notify.error("This product variant is currently unavailable.");
                  return;
                }

                setIsAddingToCart(true);
                try {
                  await storefrontService.addToCart(user.id, product.id, sku);
                  notify.success(`Added ${product.name} to cart.`, {
                    title: "Cart updated",
                    iconKey: "order",
                  });
                  queryClient.invalidateQueries({ queryKey: ["cart"] });
                } catch (err) {
                  notify.error(err.message || "Failed to add to cart");
                } finally {
                  setIsAddingToCart(false);
                }
              }}
            >
              {isAddingToCart ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShoppingBag className="h-4 w-4" />
              )}
              {isAddingToCart ? "Adding..." : "Add to cart"}
            </Button>
            <Button
              tone="secondary"
              onClick={async () => {
                if (!isAuthenticated) {
                  openAuthModal("login", routes.appFavorites);
                  return;
                }

                await storefrontService.toggleFavorite(user.id, product.id);
                queryClient.invalidateQueries({ queryKey: ["product", productIdentifier] });
                queryClient.invalidateQueries({ queryKey: ["products"] });
                queryClient.invalidateQueries({ queryKey: ["favorites", user.id] });
                notify.success(
                  product.isFavorite ? "Removed from favorites." : "Saved to favorites.",
                  {
                    title: "Favorites updated",
                    iconKey: "sparkle",
                  }
                );
              }}
            >
              <Heart className={`h-4 w-4 ${product.isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
              {product.isFavorite ? "Saved" : "Save"}
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.92fr]">
        <div className="rounded-[34px] border border-[#dfccab] bg-white/90 p-6 shadow-[0_18px_55px_rgba(40,24,13,0.07)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9e6c24]">Reviews</p>
              <h2 className="mt-2 font-display text-4xl text-[#1a120e]">What customers are saying</h2>
            </div>
            <div className="rounded-full bg-[#f7ecd6] px-4 py-2 text-sm text-[#7a541c]">
              Rated {product.rating.toFixed(1)} / 5
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {reviews.length ? (
              reviews.map((review) => (
                <article key={review.id} className="rounded-[24px] border border-[#eadcc0] bg-[#fff9ef] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-[#1a120e]">{review.username}</div>
                      <div className="mt-1 text-xs text-stone-500">{formatDate(review.createdAt, language)}</div>
                    </div>
                    <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{review.comment}</p>
                </article>
              ))
            ) : (
              <EmptyState
                title="No reviews yet"
                description="This product is ready for reviews once real customer feedback starts flowing in."
              />
            )}
          </div>
        </div>

        <div className="rounded-[34px] border border-[#dfccab] bg-[#17100d] p-6 text-[#f8efdc] shadow-[0_18px_60px_rgba(32,21,15,0.25)]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d5a957]">Why shoppers choose it</p>
          <h2 className="mt-2 font-display text-4xl">Made to feel premium, not fussy</h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-[#ebddc2]">
            <li>Multiple finish and size combinations help gifting and self-purchase flows feel more realistic.</li>
            <li>Favorites, cart, and order journeys are all connected to the same mock data layer.</li>
            <li>Product detail pages are now routeable directly, so campaigns and search results can deep-link properly.</li>
          </ul>
        </div>
      </section>

      {relatedProducts.length ? (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9e6c24]">Related picks</p>
              <h2 className="mt-2 font-display text-4xl text-[#1a120e]">More from this collection</h2>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
                onAdded={() => queryClient.invalidateQueries({ queryKey: ["cart"] })}
                onFavoriteChanged={() => {
                  queryClient.invalidateQueries({ queryKey: ["product", productIdentifier] });
                  queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
                }}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
