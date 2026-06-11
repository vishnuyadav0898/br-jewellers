import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "../../shared/components/EmptyState";
import { Loader } from "../../shared/components/Loader";
import { useSession } from "../../shared/hooks/useSession";
import { storefrontService } from "../services/storefrontService";
import { ProductCard } from "../components/ProductCard";

export function FavoritesPage() {
  const queryClient = useQueryClient();
  const { user } = useSession();
  const favoritesQuery = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: () => storefrontService.getFavorites(user.id),
    enabled: Boolean(user?.id),
  });

  if (favoritesQuery.isLoading) {
    return <Loader label="Loading your favorites..." />;
  }

  const favorites = favoritesQuery.data || [];

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

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {favorites.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAdded={() => queryClient.invalidateQueries({ queryKey: ["cart"] })}
            onFavoriteChanged={() => queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] })}
          />
        ))}
      </div>
    </div>
  );
}
