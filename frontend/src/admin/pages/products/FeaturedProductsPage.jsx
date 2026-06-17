import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { useMoney } from "../../../shared/hooks/useMoney";
import { notify } from "../../../shared/utils/notify";
import { AdminDataState } from "../../components/AdminDataState";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPanel } from "../../components/AdminPanel";
import { catalogService } from "../../services/catalogService";

export function FeaturedProductsPage() {
  const queryClient = useQueryClient();
  const { formatFromInr } = useMoney();
  const productsQuery = useQuery({
    queryKey: queryKeys.adminFeaturedProducts,
    queryFn: catalogService.getFeaturedProducts,
  });
  const products = productsQuery.data || [];

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader
          eyebrow="Products"
          title="Featured products"
          description="A dedicated merchandising view keeps spotlight decisions separate from day-to-day product CRUD."
        />
      </AdminPanel>

      <AdminDataState
        query={productsQuery}
        loadingLabel="Loading featured products..."
        empty={!products.length}
        emptyTitle="No featured products"
        emptyDescription="Mark products as featured from the product list to surface them here."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <AdminPanel key={product.id} className="flex flex-col p-3">
              {/* Image — fixed height, smaller */}
              <img
                src={product.images?.[0]}
                alt={product.name}
                className="h-36 w-full rounded-[16px] object-cover flex-shrink-0"
              />

              {/* Body — grows to fill remaining space */}
              <div className="mt-3 flex flex-1 flex-col min-h-0">
                {/* Category eyebrow */}
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9f6d22] truncate">
                  {product.category}
                </div>

                {/* Product name — max 2 lines */}
                <h3
                  className="mt-1 font-display text-lg text-[#1d130f] leading-snug"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {product.name}
                </h3>

                {/* Description — exactly 1 line, truncated */}
                <p className="mt-1 text-xs text-stone-500 truncate">
                  {product.description}
                </p>

                {/* Price */}
                <div className="mt-2 text-sm font-semibold text-[#1d130f]">
                  {formatFromInr(product.price)}
                </div>

                {/* Button pinned to bottom */}
                <div className="mt-auto pt-3">
                  <Button
                    tone={product.featured ? "secondary" : "accent"}
                    className="w-full"
                    onClick={async () => {
                      try {
                        await catalogService.toggleFeatured(product.id);
                        notify.success(
                          product.featured ? "Removed from featured." : "Marked as featured.",
                          { title: "Featured collection updated", iconKey: "sparkle" }
                        );
                        queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
                        queryClient.invalidateQueries({ queryKey: queryKeys.adminFeaturedProducts });
                      } catch (error) {
                        notify.error(error.message);
                      }
                    }}
                  >
                    <Star className="h-4 w-4" />
                    {product.featured ? "Remove feature" : "Mark as featured"}
                  </Button>
                </div>
              </div>
            </AdminPanel>
          ))}
        </div>
      </AdminDataState>
    </div>
  );
}
