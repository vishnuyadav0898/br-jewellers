import { Heart, ShoppingBag, Star, Loader2, Minus, Plus } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "react-router-dom";
import { routes } from "../../config/routes";
import { Button } from "../../shared/components/Button";
import { EmptyState } from "../../shared/components/EmptyState";
import { ProductDetailsSkeleton } from "../../shared/components/Skeleton";
import { useMoney } from "../../shared/hooks/useMoney";
import { useSession } from "../../shared/hooks/useSession";
import { formatDate } from "../../shared/utils/formatters";
import { notify } from "../../shared/utils/notify";
import { formatCurrencyValue } from "../../shared/utils/currency";
import { storefrontService } from "../services/storefrontService";
import { ProductCard } from "../components/ProductCard";
import { useSEO } from "../../shared/hooks/useSEO";

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
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [brokenImages, setBrokenImages] = useState({});
  const [priceKey, setPriceKey] = useState(0);

  useEffect(() => {
    setPriceKey((prev) => prev + 1);
  }, [selectedColor, selectedSize, selectedMaterial, selectedPurity]);

  const handleRelatedProductAdded = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["cart"] });
  }, [queryClient]);

  const handleRelatedProductFavoriteChanged = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["product", productIdentifier] });
    queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
  }, [queryClient, productIdentifier, user?.id]);


  const cartQuery = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: () => storefrontService.getCart(user.id),
    enabled: Boolean(isAuthenticated && user?.id),
  });

  const productQuery = useQuery({
    queryKey: ["product", productIdentifier],
    queryFn: () => storefrontService.getProductById(productIdentifier),
  });

  const product = productQuery.data?.product;

  useSEO({
    title: product?.name || "Product Details",
    description: product?.shortDescription || product?.description || "Read more about this exquisite jewellery item.",
    keywords: `${product?.name || ""}, ${product?.category || ""}, ${product?.gemstone || ""}, jewellery, BR Jewellers`,
  });

  useEffect(() => {
    if (!product) {
      return;
    }

    setSelectedImage(0);

    // Try to find the default variant or first available variant to pre-populate options
    const defaultVariant = product.variants?.find((v) => v.isDefault) || product.variants?.[0];
    const defaultAttrs = defaultVariant?.attributes || defaultVariant || {};

    setSelectedColor(defaultAttrs.color || product.colors?.[0]?.name || "");
    setSelectedSize(defaultAttrs.size || product.sizes?.[0] || "");
    setSelectedMaterial(defaultAttrs.material || "");
    setSelectedPurity(defaultAttrs.purity || "");
  }, [product]);

  if (productQuery.isLoading) {
    return <ProductDetailsSkeleton />;
  }

  if (productQuery.isError || !product) {
    return (
      <EmptyState
        title="Product not found"
        description="The product you requested is unavailable or the link is no longer valid."
      />
    );
  }

  const { reviews, relatedProducts } = productQuery.data;

  // Extract unique attribute choices from variants for selectors
  const uniqueMaterials = product.variants?.length
    ? [...new Set(product.variants.map((v) => (v.attributes?.material || v.material)).filter(Boolean))]
    : [];

  const uniquePurities = product.variants?.length
    ? [...new Set(product.variants.map((v) => (v.attributes?.purity || v.purity)).filter(Boolean))]
    : [];

  const uniqueColors = product.variants?.length
    ? [...new Set(product.variants.map((v) => (v.attributes?.color || v.color)).filter(Boolean))]
    : [];

  const uniqueSizes = product.variants?.length
    ? [...new Set(product.variants.map((v) => (v.attributes?.size || v.size)).filter(Boolean))]
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
    (v) => {
      const attrs = v.attributes || v;
      return (!selectedColor || attrs.color === selectedColor) &&
             (!selectedSize || attrs.size === selectedSize) &&
             (!selectedMaterial || attrs.material === selectedMaterial) &&
             (!selectedPurity || attrs.purity === selectedPurity);
    }
  );

  const isOptionAvailable = (type, value) => {
    if (!product.variants || product.variants.length === 0) return true;
    return product.variants.some((v) => {
      const attrs = v.attributes || v;
      const matchMaterial = type === "material" ? (attrs.material === value) : (!selectedMaterial || attrs.material === selectedMaterial);
      const matchPurity = type === "purity" ? (attrs.purity === value) : (!selectedPurity || attrs.purity === selectedPurity);
      const matchColor = type === "color" ? (attrs.color === value) : (!selectedColor || attrs.color === selectedColor);
      const matchSize = type === "size" ? (attrs.size === value) : (!selectedSize || attrs.size === selectedSize);
      return matchMaterial && matchPurity && matchColor && matchSize;
    });
  };

  const handleSelectAttribute = (type, value) => {
    let nextMaterial = selectedMaterial;
    let nextPurity = selectedPurity;
    let nextColor = selectedColor;
    let nextSize = selectedSize;

    if (type === "material") nextMaterial = value;
    else if (type === "purity") nextPurity = value;
    else if (type === "color") nextColor = value;
    else if (type === "size") nextSize = value;

    const isValid = product.variants?.some((v) => {
      const attrs = v.attributes || v;
      return (!nextMaterial || attrs.material === nextMaterial) &&
             (!nextPurity || attrs.purity === nextPurity) &&
             (!nextColor || attrs.color === nextColor) &&
             (!nextSize || attrs.size === nextSize);
    });

    if (!isValid) {
      const fallbackVariant = product.variants?.find((v) => {
        const attrs = v.attributes || v;
        if (type === "material" && attrs.material !== value) return false;
        if (type === "purity" && attrs.purity !== value) return false;
        if (type === "color" && attrs.color !== value) return false;
        if (type === "size" && attrs.size !== value) return false;
        return true;
      });

      if (fallbackVariant) {
        const fallbackAttrs = fallbackVariant.attributes || fallbackVariant;
        nextMaterial = fallbackAttrs.material || "";
        nextPurity = fallbackAttrs.purity || "";
        nextColor = fallbackAttrs.color || "";
        nextSize = fallbackAttrs.size || "";
      }
    }

    setSelectedMaterial(nextMaterial);
    setSelectedPurity(nextPurity);
    setSelectedColor(nextColor);
    setSelectedSize(nextSize);
  };

  const getButtonClass = (isActive) => {
    if (isActive) {
      return "border-[#1a120e] bg-[#1a120e] text-[#f8ebca]";
    }
    return "border-[#dbc8a2] bg-white text-[#1a120e] hover:border-[#1a120e]";
  };

  const cartItem = cartQuery.data?.items?.find(
    (item) =>
      item.productId === product.id &&
      (!matchingVariant?.sku || item.sku === matchingVariant?.sku)
  );

  const getPricesDisplay = () => {
    let inrPrice = 0;
    let usdPrice = 0;
    if (matchingVariant) {
      if (matchingVariant.prices && Array.isArray(matchingVariant.prices)) {
        inrPrice = matchingVariant.prices.find((p) => p.currency === "INR")?.amount || 0;
        usdPrice = matchingVariant.prices.find((p) => p.currency === "USD")?.amount || 0;
      } else if (matchingVariant.price) {
        inrPrice = matchingVariant.price.INR || 0;
        usdPrice = matchingVariant.price.USD || 0;
      }
    }

    if (!inrPrice) {
      inrPrice = product.price || 0;
      usdPrice = Math.round(inrPrice * 0.012); // Fallback approximation
    }

    const activePrice = currency === "USD" ? usdPrice : inrPrice;
    const originalPriceInActiveCurrency = currency === "USD"
      ? (product.originalPrice ? Math.round(product.originalPrice * 0.012) : 0)
      : (product.originalPrice || 0);

    const hasDiscount = originalPriceInActiveCurrency > activePrice;

    return (
      <div key={priceKey} className="space-y-3 animate-pricePop">
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
        {product.variants?.length && !matchingVariant ? (
          <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-2.5 py-1.5 inline-block">
            Combination not available. Showing base product price.
          </div>
        ) : null}
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

      <section className="grid gap-6 rounded-[28px] sm:rounded-[36px] border border-[#dfccab] bg-white/90 p-4 sm:p-6 shadow-[0_18px_55px_rgba(40,24,13,0.07)] lg:grid-cols-[1fr_0.95fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          {product.images && product.images.length > 1 ? (
            <div className="flex flex-col-reverse gap-4 sm:grid sm:grid-cols-[88px_1fr]">
              <div className="flex flex-row sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[520px] pb-2 sm:pb-0 pr-1">
                {product.images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-[18px] border transition-all ${
                      selectedImage === index ? "border-[#1a120e] ring-2 ring-[#f4e4bd]" : "border-[#e3d2b0]"
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    {brokenImages[index] ? (
                      <div className="h-full w-full flex items-center justify-center bg-stone-100 text-stone-400">
                        <Star className="h-4 w-4" />
                      </div>
                    ) : (
                      <img
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        width="80"
                        height="80"
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={() => setBrokenImages((prev) => ({ ...prev, [index]: true }))}
                      />
                    )}
                  </button>
                ))}
              </div>
              <div className="overflow-hidden rounded-[28px] bg-[#f9f0de] w-full h-[320px] sm:h-[500px]">
                {brokenImages[selectedImage] ? (
                  <div className="h-full w-full flex flex-col items-center justify-center bg-stone-100 text-stone-400">
                    <Star className="h-8 w-8 animate-pulse" />
                  </div>
                ) : (
                  <img
                    src={product.images[selectedImage]}
                    alt={product.name}
                    width="500"
                    height="500"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    fetchpriority="auto"
                    onError={() => setBrokenImages((prev) => ({ ...prev, [selectedImage]: true }))}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[28px] bg-[#f9f0de] w-full h-[320px] sm:h-[500px]">
              {brokenImages[0] ? (
                <div className="h-full w-full flex flex-col items-center justify-center bg-stone-100 text-stone-400">
                  <Star className="h-8 w-8 animate-pulse" />
                </div>
              ) : (
                <img
                  src={product.images?.[0] || product.coverImage}
                  alt={product.name}
                  width="500"
                  height="500"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  fetchpriority="auto"
                  onError={() => setBrokenImages((prev) => ({ ...prev, 0: true }))}
                />
              )}
            </div>
          )}
        </div>

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

          <div>
            <p className={`text-base leading-7 text-stone-600 ${isDescExpanded ? "" : "line-clamp-2"}`}>
              {product.description}
            </p>
            {product.description && product.description.length > 120 && (
              <button
                type="button"
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="mt-1 text-sm font-semibold text-[#8a5d18] hover:text-[#5c3e10] transition-colors"
              >
                {isDescExpanded ? "Show Less" : "... More"}
              </button>
            )}
          </div>

          {(matchingVariant?.attributes?.purity || matchingVariant?.purity) && (
            <div className="text-sm text-stone-500 font-medium flex items-center gap-1.5 mt-1">
              <span className="font-semibold text-stone-700">Purity:</span>
              <span className="rounded-full bg-[#f8ebca] px-2.5 py-0.5 text-xs font-semibold text-[#7a541c]">
                {matchingVariant.attributes?.purity || matchingVariant.purity}
              </span>
            </div>
          )}

          {product.details && product.details !== product.description && (
            <p className="text-sm leading-7 text-stone-500">{product.details}</p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {uniqueMaterials.length > 1 && (
              <div className="rounded-[24px] bg-[#fff7ea] p-4">
                <div className="text-sm font-semibold text-[#1a120e]">Material</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {uniqueMaterials.map((material) => {
                    return (
                      <button
                        key={material}
                        type="button"
                        onClick={() => handleSelectAttribute("material", material)}
                        className={`rounded-full border px-4 py-2 text-sm transition ${getButtonClass(selectedMaterial === material)}`}
                      >
                        {material}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {uniquePurities.length > 0 && (
              <div className="rounded-[24px] bg-[#fff7ea] p-4">
                <div className="text-sm font-semibold text-[#1a120e]">Purity</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {uniquePurities.map((purity) => {
                    return (
                      <button
                        key={purity}
                        type="button"
                        onClick={() => handleSelectAttribute("purity", purity)}
                        className={`rounded-full border px-4 py-2 text-sm transition ${getButtonClass(selectedPurity === purity)}`}
                      >
                        {purity}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {colorsList.length > 0 && (
              <div className="rounded-[24px] bg-[#fff7ea] p-4">
                <div className="text-sm font-semibold text-[#1a120e]">Finish</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {colorsList.map((color) => {
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => handleSelectAttribute("color", color.name)}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${getButtonClass(selectedColor === color.name)}`}
                      >
                        <span className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: color.code }} />
                        {color.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {sizesList.length > 0 && (
              <div className="rounded-[24px] bg-[#fff7ea] p-4">
                <div className="text-sm font-semibold text-[#1a120e]">Size</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sizesList.map((size) => {
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSelectAttribute("size", size)}
                        className={`rounded-full border px-4 py-2 text-sm transition ${getButtonClass(selectedSize === size)}`}
                      >
                        {size}
                      </button>
                    );
                  })}
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

          <div className="flex flex-wrap gap-3 items-center">
            {cartItem ? (
              <Button
                as={Link}
                to={routes.appCart}
                tone="secondary"
                className="w-full sm:w-auto flex-1 sm:flex-initial sm:px-8"
              >
                <ShoppingBag className="h-4 w-4" />
                View in Cart
              </Button>
            ) : (
              <Button
                disabled={isAddingToCart || (product.variants?.length && !matchingVariant)}
                className="w-full sm:w-auto flex-1 sm:flex-initial sm:px-8"
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
            )}
            <Button
              tone="secondary"
              className="w-full sm:w-auto flex-1 sm:flex-initial sm:px-8"
              onClick={async () => {
                if (!isAuthenticated) {
                  openAuthModal("login", routes.appFavorites);
                  return;
                }

                const wasFavorite = product.isFavorite;
                await storefrontService.toggleFavorite(user.id, product.id);
                await Promise.all([
                  queryClient.invalidateQueries({ queryKey: ["product", productIdentifier] }),
                  queryClient.invalidateQueries({ queryKey: ["products"] }),
                  queryClient.invalidateQueries({ queryKey: ["favorites", user.id] }),
                ]);
                setTimeout(() => {
                  notify.success(
                    wasFavorite ? "Removed from favorites." : "Saved to favorites.",
                    {
                      title: "Favorites updated",
                      iconKey: "sparkle",
                    }
                  );
                }, 150);
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
                isInCart={cartQuery.data?.items?.some((item) => item.productId === relatedProduct.id)}
                onAdded={handleRelatedProductAdded}
                onFavoriteChanged={handleRelatedProductFavoriteChanged}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
