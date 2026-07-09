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
                width="400"
                height="450"
                className="aspect-[4/4.5] w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <AdminStatusBadge value={product.isActive ? "Active" : "Inactive"} />
                {product.featured ? <AdminStatusBadge value="Featured" /> : null}
              </div>
              <dl className="grid gap-5 sm:grid-cols-2">
                <Field label="Category" value={product.category} />
                <Field label="Gemstone" value={product.gemstone || product.badge} />
                <Field label="Min Price" value={formatFromInr(product.priceRange?.min ?? product.price)} />
                <Field label="Max Price" value={formatFromInr(product.priceRange?.max ?? product.originalPrice)} />
                <Field label="Total Stock" value={product.stock} />
                <Field label="Variants" value={`${product.variants?.length || 0} variant(s)`} />
                <Field label="Occasions" value={(product.occasions || []).join(", ") || "Not set"} />
                <Field label="Tags" value={(product.tags || []).join(", ") || "Not set"} />
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
                    width="120"
                    height="120"
                    className="aspect-square rounded-lg border border-gold-100 bg-gold-50 object-cover"
                    loading="lazy"
                  />
                ))}
              </div>
            </AdminPanel>
          ) : null}
        </div>
      </section>

      {/* Variants Table */}
      {product.variants?.length ? (
        <AdminPanel>
          <h2 className="font-display text-3xl text-espresso">
            Variants
            <span className="ml-3 text-base font-normal text-stone-500">
              {product.variants.length} variant{product.variants.length === 1 ? "" : "s"}
            </span>
          </h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold-100 text-left text-xs font-semibold uppercase tracking-[0.15em] text-gold-700">
                  <th className="pb-3 pr-4">SKU</th>
                  <th className="pb-3 pr-4">Material</th>
                  <th className="pb-3 pr-4">Color</th>
                  <th className="pb-3 pr-4">Purity</th>
                  <th className="pb-3 pr-4">Size</th>
                  <th className="pb-3 pr-4">Stock</th>
                  <th className="pb-3 pr-4">INR Price</th>
                  <th className="pb-3 pr-4">USD Price</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-50">
                {product.variants.map((variant, index) => (
                  <tr key={variant.sku || index} className="hover:bg-gold-50/50 transition">
                    <td className="py-3 pr-4 font-mono text-xs text-stone-500">
                      {variant.sku || "—"}
                    </td>
                    <td className="py-3 pr-4 text-espresso">{variant.material || "—"}</td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="h-3 w-3 rounded-full border border-gold-100"
                          style={{ backgroundColor: "#D9A44F" }}
                        />
                        {variant.color || "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-espresso">{variant.purity || "—"}</td>
                    <td className="py-3 pr-4 text-espresso">{variant.size || "—"}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`font-semibold ${
                          variant.stock > 10
                            ? "text-emerald-700"
                            : variant.stock > 0
                            ? "text-amber-700"
                            : "text-rose-700"
                        }`}
                      >
                        {variant.stock ?? 0}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-semibold text-espresso">
                      {variant.price?.INR ? formatFromInr(variant.price.INR) : "—"}
                    </td>
                    <td className="py-3 pr-4 text-stone-500">
                      {variant.price?.USD ? `$${variant.price.USD}` : "—"}
                    </td>
                    <td className="py-3">
                      <AdminStatusBadge
                        value={variant.isAvailable !== false ? "Active" : "Unavailable"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminPanel>
      ) : null}

      {/* Reviews Section */}
      <AdminProductReviews productId={productKey} />
    </div>
  );
}

function AdminProductReviews({ productId }) {
  const { data: reviewsData, isLoading, refetch } = useQuery({
    queryKey: ["admin", "productReviews", productId],
    queryFn: () => catalogService.getReviews(productId, { limit: 50 }),
  });

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await catalogService.deleteReview(productId, reviewId);
      refetch();
    } catch (err) {
      alert("Failed to delete review: " + err.message);
    }
  };

  const reviews = reviewsData?.reviews || [];

  if (isLoading) return <Loader label="Loading reviews..." />;

  return (
    <AdminPanel>
      <h2 className="font-display text-3xl text-espresso mb-5">
        Reviews
        <span className="ml-3 text-base font-normal text-stone-500">
          {reviews.length} review{reviews.length !== 1 && "s"}
        </span>
      </h2>
      
      {reviews.length === 0 ? (
        <div className="text-stone-500 text-sm">No reviews for this product yet.</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id || review.id} className="border border-gold-100 rounded-xl p-4 bg-white/50 flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-espresso">{review.user?.name || "Unknown User"}</span>
                  <span className="text-stone-400 text-xs text-amber-500 font-medium">{review.rating} ★</span>
                </div>
                <h4 className="font-semibold text-stone-800 text-sm">{review.title}</h4>
                <p className="text-sm text-stone-600 mt-1">{review.comment}</p>
                {review.images?.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {review.images.map((img, i) => (
                      <img key={i} src={img} alt="Review" className="w-16 h-16 object-cover rounded-md border border-stone-200" />
                    ))}
                  </div>
                )}
              </div>
              <div className="shrink-0">
                <Button tone="danger" size="sm" onClick={() => handleDelete(review._id || review.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPanel>
  );
}
