import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "../../shared/components/EmptyState";
import { FavoritesPageSkeleton } from "../../shared/components/Skeleton";
import { useSession } from "../../shared/hooks/useSession";
import { storefrontService } from "../services/storefrontService";
import { ProductCard } from "../components/ProductCard";
import { useSEO } from "../../shared/hooks/useSEO";

export function FavoritesPage() {
  useSEO({
    title: "My Favorites",
    description: "Manage your curated collection of favorite luxury jewellery items, engagement rings, and gold sets at BR Jewellers.",
    keywords: "favorite jewellery, luxury wishlist, curated jewellery, saved rings, BR Jewellers",
  });
  const queryClient = useQueryClient();
  const { user } = useSession();
  const favoritesQuery = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: () => storefrontService.getFavorites(user.id),
    enabled: Boolean(user?.id),
  });

  const cartQuery = useQuery({
    queryKey: ["cart", user?.id],
    queryFn: () => storefrontService.getCart(user.id),
    enabled: Boolean(user?.id),
  });
  const cartItems = cartQuery.data?.items || [];


  if (favoritesQuery.isLoading) {
    return <FavoritesPageSkeleton />;
  }

  const favorites = favoritesQuery.data || [];

  const handleCartAdded = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["cart"] });
  }, [queryClient]);

  const handleFavoriteChanged = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
  }, [queryClient, user?.id]);


  if (!favorites.length) {
    return (
      <EmptyState
        title="No favorites saved yet"
        description="Tap the heart icon on any product card or product detail page to build your shortlist."
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-[#dfccab] bg-white/85 p-6 shadow-[0_18px_55px_rgba(40,24,13,0.07)]">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9e6c24]">Saved collection</p>
        <h1 className="mt-2 font-display text-5xl text-[#1a120e]">Favorites</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Compare the pieces you want to revisit before adding them to cart.
        </p>
      </section>

      <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {favorites.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isInCart={cartItems.some((item) => item.productId === product.id)}
            onAdded={handleCartAdded}
            onFavoriteChanged={handleFavoriteChanged}
          />
        ))}
      </div>
    </div>
  );
}
