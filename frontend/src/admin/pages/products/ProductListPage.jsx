import { useDeferredValue, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { Input } from "../../../shared/components/Input";
import { Modal } from "../../../shared/components/Modal";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { useMoney } from "../../../shared/hooks/useMoney";
import { notify } from "../../../shared/utils/notify";
import { getValidationErrors, productSchema } from "../../../shared/utils/validation";
import { compressImages } from "../../../shared/utils/imageCompression";
import { AdminDataState } from "../../components/AdminDataState";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPagination } from "../../components/AdminPagination";
import { AdminPanel } from "../../components/AdminPanel";
import { AdminStatusBadge } from "../../components/AdminStatusBadge";
import { AdminTable } from "../../components/AdminTable";
import { catalogService } from "../../services/catalogService";

const pageSize = 6;
const defaultForm = {
  name: "",
  price: "",
  originalPrice: "",
  categoryId: "",
  colors: "",
  sizes: "",
  tags: "",
  badge: "",
  stock: "",
  description: "",
  details: "",
  featured: false,
  images: [],
};

const mapProductToForm = (product) => ({
  name: product.name || "",
  price: product.price || "",
  originalPrice: product.originalPrice || "",
  categoryId: product.categoryId || "",
  colors: (product.colors || []).map((item) => item.name).join(", "),
  sizes: (product.sizes || []).join(", "),
  tags: (product.tags || []).join(", "),
  badge: product.badge || "",
  stock: product.stock || "",
  description: product.description || "",
  details: product.details || "",
  featured: Boolean(product.featured),
  images: product.images || [],
});

export function ProductListPage() {
  const queryClient = useQueryClient();
  const { formatFromInr } = useMoney();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeProduct, setActiveProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const deferredSearch = useDeferredValue(search);

  const productsQuery = useQuery({
    queryKey: queryKeys.adminProducts(deferredSearch, page),
    queryFn: () => catalogService.getProducts(deferredSearch),
  });
  const categoriesQuery = useQuery({
    queryKey: queryKeys.adminCategories,
    queryFn: catalogService.getCategories,
  });

  const paginated = useMemo(() => {
    const rows = productsQuery.data || [];
    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
    const safePage = Math.min(page, totalPages);

    return {
      totalPages,
      rows: rows.slice((safePage - 1) * pageSize, safePage * pageSize),
    };
  }, [page, productsQuery.data]);

  const openCreate = () => {
    setActiveProduct(null);
    setIsFormOpen(true);
    setForm({
      ...defaultForm,
      categoryId: categoriesQuery.data?.[0]?.id || "",
    });
    setErrors({});
  };

  const openEdit = (product) => {
    setActiveProduct(product);
    setIsFormOpen(true);
    setForm(mapProductToForm(product));
    setErrors({});
  };

  const closeModal = () => {
    setActiveProduct(null);
    setIsFormOpen(false);
    setForm(defaultForm);
    setErrors({});
  };

  const refreshProducts = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const parsed = productSchema.safeParse(form);

      if (!parsed.success) {
        setErrors(getValidationErrors(parsed.error));
        return;
      }

      setErrors({});
      const payload = {
        ...parsed.data,
        originalPrice: parsed.data.originalPrice ?? parsed.data.price,
      };

      if (activeProduct) {
        await catalogService.updateProduct(activeProduct.id, payload);
        notify.success("Product updated.", {
          title: "Catalogue updated",
          iconKey: "order",
        });
      } else {
        await catalogService.createProduct(payload);
        notify.success("Product created.", {
          title: "New product added",
          iconKey: "order",
        });
      }

      refreshProducts();
      closeModal();
    } catch (error) {
      notify.error(error.message, { iconKey: "order" });
    } finally {
      setSaving(false);
    }
  };

  const clearError = (field) =>
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));

  const columns = [
    {
      key: "product",
      header: "Product",
      render: (row) => (
        <div className="flex items-center gap-3">
          <img src={row.images?.[0]} alt={row.name} className="h-12 w-12 rounded-[14px] object-cover" />
          <div>
            <div className="font-semibold text-[#1a120e]">{row.name}</div>
            <div className="text-xs text-stone-500">{row.category}</div>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (row) => (
        <div>
          <div className="font-semibold text-[#1a120e]">{formatFromInr(row.price)}</div>
          <div className="text-xs text-stone-500">MRP {formatFromInr(row.originalPrice)}</div>
        </div>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      render: (row) => (
        <div className="space-y-1">
          <div className="font-semibold text-[#1a120e]">{row.stock}</div>
          <AdminStatusBadge value={row.stock > 10 ? "Active" : "Low"} />
        </div>
      ),
    },
    {
      key: "featured",
      header: "Featured",
      render: (row) => <AdminStatusBadge value={row.featured ? "Featured" : "Standard"} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <Button tone="secondary" size="sm" onClick={() => openEdit(row)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button
            tone="danger"
            size="sm"
            onClick={async () => {
              try {
                await catalogService.deleteProduct(row.id);
                notify.success("Product deleted.", {
                  title: "Product removed",
                  iconKey: "order",
                });
                refreshProducts();
              } catch (error) {
                notify.error(error.message, { iconKey: "order" });
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader
          eyebrow="Products"
          title="Product list"
          description="CRUD-ready catalogue management using the existing mock API. Images are compressed in-browser before being stored in demo state."
          actions={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add product
            </Button>
          }
        />
        <div className="mt-5 max-w-md">
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by product name, category, or badge"
          />
        </div>
      </AdminPanel>

      <AdminDataState query={productsQuery} loadingLabel="Loading product catalogue...">
        <div className="space-y-4">
          <AdminPanel>
            <AdminTable
              columns={columns}
              rows={paginated.rows}
              emptyMessage="No products matched this search."
            />
          </AdminPanel>
          <AdminPagination page={page} totalPages={paginated.totalPages} onChange={setPage} />
        </div>
      </AdminDataState>

      <Modal
        open={isFormOpen}
        onClose={closeModal}
        title={activeProduct ? "Edit product" : "Create product"}
        className="max-w-3xl"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Name"
              required
              error={errors.name}
              value={form.name}
              onChange={(event) => {
                clearError("name");
                setForm((current) => ({ ...current, name: event.target.value }));
              }}
            />
            <Input label="Badge" value={form.badge} onChange={(event) => setForm((current) => ({ ...current, badge: event.target.value }))} />
            <Input
              label="Price"
              type="number"
              required
              error={errors.price}
              value={form.price}
              onChange={(event) => {
                clearError("price");
                setForm((current) => ({ ...current, price: event.target.value }));
              }}
            />
            <Input
              label="Original Price"
              type="number"
              error={errors.originalPrice}
              value={form.originalPrice}
              onChange={(event) => {
                clearError("originalPrice");
                setForm((current) => ({ ...current, originalPrice: event.target.value }));
              }}
            />
            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-700">
                Category
                <span className="ml-1 text-rose-500">*</span>
              </span>
              <select
                value={form.categoryId}
                aria-invalid={Boolean(errors.categoryId)}
                onChange={(event) => {
                  clearError("categoryId");
                  setForm((current) => ({ ...current, categoryId: event.target.value }));
                }}
                className={`w-full rounded-3xl border bg-white px-4 py-3 text-sm text-stone-900 ${
                  errors.categoryId ? "border-rose-300" : "border-[#dcc8a1]"
                }`}
              >
                {(categoriesQuery.data || []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId ? <span className="text-xs text-rose-600">{errors.categoryId}</span> : null}
            </label>
            <Input
              label="Stock"
              type="number"
              required
              error={errors.stock}
              value={form.stock}
              onChange={(event) => {
                clearError("stock");
                setForm((current) => ({ ...current, stock: event.target.value }));
              }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Colors" helperText="Comma separated values" value={form.colors} onChange={(event) => setForm((current) => ({ ...current, colors: event.target.value }))} />
            <Input label="Sizes" helperText="Comma separated values" value={form.sizes} onChange={(event) => setForm((current) => ({ ...current, sizes: event.target.value }))} />
            <Input label="Tags" helperText="Comma separated values" value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} />
            <label className="flex items-center gap-3 rounded-3xl border border-[#dcc8a1] bg-[#fffaf1] px-4 py-3 text-sm font-medium text-stone-700">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))}
              />
              Featured product
            </label>
          </div>

          <Input
            label="Description"
            as="textarea"
            required
            error={errors.description}
            value={form.description}
            onChange={(event) => {
              clearError("description");
              setForm((current) => ({ ...current, description: event.target.value }));
            }}
          />
          <Input
            label="Details"
            as="textarea"
            required
            error={errors.details}
            value={form.details}
            onChange={(event) => {
              clearError("details");
              setForm((current) => ({ ...current, details: event.target.value }));
            }}
          />

          <label className="block space-y-2">
            <span className="text-sm font-medium text-stone-700">
              Images
              <span className="ml-1 text-rose-500">*</span>
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="block w-full text-sm"
              onChange={async (event) => {
                const files = Array.from(event.target.files || []);
                if (!files.length) return;

                try {
                  const compressed = await compressImages(files);
                  clearError("images");
                  setForm((current) => ({
                    ...current,
                    images: [...compressed.map((item) => item.preview), ...current.images].slice(0, 6),
                  }));
                  notify.success("Images compressed and added.", {
                    title: "Product media ready",
                  });
                } catch (error) {
                  notify.error(error.message);
                }
              }}
            />
            {errors.images ? <span className="text-xs text-rose-600">{errors.images}</span> : null}
            {form.images.length ? (
              <div className="grid grid-cols-3 gap-3">
                {form.images.map((image, index) => (
                  <img key={`${image}-${index}`} src={image} alt={`Preview ${index + 1}`} className="h-24 w-full rounded-[18px] object-cover" />
                ))}
              </div>
            ) : null}
          </label>

          <div className="flex justify-end gap-3">
            <Button type="button" tone="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {activeProduct ? "Save changes" : "Create product"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
