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
            <AdminPanel key={product.id} className="flex h-full flex-col">
              <img src={product.images?.[0]} alt={product.name} className="h-48 w-full rounded-[22px] object-cover" />
              <div className="mt-4 flex flex-1 flex-col">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6d22]">
                  {product.category}
                </div>
                <h3 className="mt-2 font-display text-3xl text-[#1d130f]">{product.name}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">{product.description}</p>
                <div className="mt-4 text-sm font-semibold text-[#1d130f]">{formatFromInr(product.price)}</div>
                <div className="mt-4 pt-4">
                  <Button
                    tone={product.featured ? "secondary" : "accent"}
                    className="w-full"
                    onClick={async () => {
                      try {
                        await catalogService.toggleFeatured(product.id);
                        notify.success(
                          product.featured ? "Removed from featured." : "Marked as featured.",
                          {
                            title: "Featured collection updated",
                            iconKey: "sparkle",
                          }
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
