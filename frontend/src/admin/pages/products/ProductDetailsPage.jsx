import { ArrowLeft, Pencil } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { routes } from "../../../config/routes";
import { Button } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { Loader } from "../../../shared/components/Loader";
import { useMoney } from "../../../shared/hooks/useMoney";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPanel } from "../../components/AdminPanel";
import { AdminStatusBadge } from "../../components/AdminStatusBadge";
import { catalogService } from "../../services/catalogService";

const Field = ({ label, value }) => (
  <div>
    <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-700">{label}</dt>
    <dd className="mt-1 text-sm font-medium text-espresso">{value || "Not set"}</dd>
  </div>
);

export function ProductDetailsPage() {
  const { productId } = useParams();
  const { formatFromInr } = useMoney();
  const productQuery = useQuery({
    queryKey: ["admin", "product", productId],
    queryFn: () => catalogService.getProductById(productId),
  });

  if (productQuery.isLoading) {
    return <Loader label="Loading product details..." />;
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <EmptyState
        title="Product not found"
        description={productQuery.error?.message || "This product is unavailable or could not be loaded."}
      />
    );
  }

  const product = productQuery.data;
  const productKey = product.backendId || product.id;

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader
          eyebrow="Products"
          title={product.name}
          description={product.description}
          actions={
            <>
              <Button as={Link} tone="secondary" to={routes.adminProductsList}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button as={Link} to={routes.adminProductEdit(productKey)}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </>
          }
        />
      </AdminPanel>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <AdminPanel>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-lg border border-gold-100 bg-gold-50">
              <img
                src={product.coverImage || product.images?.[0]}
                alt={product.name}
                className="aspect-[4/4.5] w-full object-cover"
              />
            </div>
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <AdminStatusBadge value={product.stock > 0 ? "Active" : "Draft"} />
                {product.featured ? <AdminStatusBadge value="Featured" /> : null}
              </div>
              <dl className="grid gap-5 sm:grid-cols-2">
                <Field label="Category" value={product.category} />
                <Field label="Gemstone" value={product.gemstone || product.badge} />
                <Field label="Price" value={formatFromInr(product.price)} />
                <Field label="Max price" value={formatFromInr(product.originalPrice || product.price)} />
                <Field label="Stock" value={product.stock} />
                <Field label="Media" value={`${product.images?.length || 0} image(s)`} />
              </dl>
              <div>
                <h2 className="font-display text-3xl text-espresso">Details</h2>
                <p className="mt-2 text-sm leading-7 text-stone-600">{product.details}</p>
              </div>
            </div>
          </div>
        </AdminPanel>

        <div className="space-y-6">
          <AdminPanel>
            <h2 className="font-display text-3xl text-espresso">Attributes</h2>
            <div className="mt-5 space-y-4">
              <Field label="Colors" value={(product.colors || []).map((item) => item.name || item).join(", ")} />
              <Field label="Sizes" value={(product.sizes || []).join(", ")} />
              <Field label="Tags" value={(product.tags || []).join(", ")} />
              <Field label="Occasions" value={(product.occasions || []).join(", ")} />
            </div>
          </AdminPanel>

          {product.images?.length ? (
            <AdminPanel>
              <h2 className="font-display text-3xl text-espresso">Gallery</h2>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {product.images.slice(0, 6).map((image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={image}
                    alt={`${product.name} gallery ${index + 1}`}
                    className="aspect-square rounded-lg border border-gold-100 bg-gold-50 object-cover"
                  />
                ))}
              </div>
            </AdminPanel>
          ) : null}
        </div>
      </section>
    </div>
  );
}
