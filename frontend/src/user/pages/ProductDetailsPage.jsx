import { Heart, ShoppingBag, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { routes } from "../../config/routes";
import { Button } from "../../shared/components/Button";
import { EmptyState } from "../../shared/components/EmptyState";
import { Loader } from "../../shared/components/Loader";
import { useMoney } from "../../shared/hooks/useMoney";
import { useSession } from "../../shared/hooks/useSession";
import { formatDate } from "../../shared/utils/formatters";
import { notify } from "../../shared/utils/notify";
import { storefrontService } from "../services/storefrontService";
import { ProductCard } from "../components/ProductCard";

const renderStars = (rating = 0) =>
  Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      className={`h-4 w-4 ${index < Math.round(rating) ? "fill-[#d3a347] text-[#d3a347]" : "text-stone-300"}`}
    />
  ));

export function ProductDetailsPage() {
  const { productId } = useParams();
  const queryClient = useQueryClient();
  const { formatFromInr, language } = useMoney();
  const { user, isAuthenticated, openAuthModal } = useSession();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const productQuery = useQuery({
    queryKey: ["product", productId],
    queryFn: () => storefrontService.getProductById(productId),
  });

  useEffect(() => {
    if (!productQuery.data?.product) {
      return;
    }

    setSelectedImage(0);
    setSelectedColor(productQuery.data.product.colors?.[0]?.name || "");
    setSelectedSize(productQuery.data.product.sizes?.[0] || "");
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

        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#9e6c24]">{product.category}</p>
            <h1 className="mt-3 font-display text-5xl leading-tight text-[#1a120e]">{product.name}</h1>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center gap-1">{renderStars(product.rating)}</div>
              <span className="text-sm text-stone-500">
                {product.reviewCount} review{product.reviewCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <div className="flex items-end gap-3">
            <div className="text-3xl font-semibold text-[#1a120e]">{formatFromInr(product.price)}</div>
            <div className="text-lg text-stone-400 line-through">{formatFromInr(product.originalPrice)}</div>
          </div>

          <p className="text-base leading-7 text-stone-600">{product.description}</p>
          <p className="text-sm leading-7 text-stone-500">{product.details}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] bg-[#fff7ea] p-4">
              <div className="text-sm font-semibold text-[#1a120e]">Finish</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.name)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
                      selectedColor === color.name
                        ? "border-[#1a120e] bg-[#1a120e] text-[#f8ebca]"
                        : "border-[#dbc8a2] bg-white text-[#1a120e]"
                    }`}
                  >
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color.code }} />
                    {color.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] bg-[#fff7ea] p-4">
              <div className="text-sm font-semibold text-[#1a120e]">Size</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-full border px-4 py-2 text-sm ${
                      selectedSize === size
                        ? "border-[#1a120e] bg-[#1a120e] text-[#f8ebca]"
                        : "border-[#dbc8a2] bg-white text-[#1a120e]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={async () => {
                if (!isAuthenticated) {
                  openAuthModal("login", routes.appCart);
                  return;
                }

                await storefrontService.addToCart(user.id, product.id);
                notify.success(`Added ${product.name} to cart.`, {
                  title: "Cart updated",
                  iconKey: "order",
                });
                queryClient.invalidateQueries({ queryKey: ["cart"] });
              }}
            >
              <ShoppingBag className="h-4 w-4" />
              Add to cart
            </Button>
            <Button
              tone="secondary"
              onClick={async () => {
                if (!isAuthenticated) {
                  openAuthModal("login", routes.appFavorites);
                  return;
                }

                await storefrontService.toggleFavorite(user.id, product.id);
                queryClient.invalidateQueries({ queryKey: ["product", productId] });
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

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
                onAdded={() => queryClient.invalidateQueries({ queryKey: ["cart"] })}
                onFavoriteChanged={() => {
                  queryClient.invalidateQueries({ queryKey: ["product", productId] });
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
