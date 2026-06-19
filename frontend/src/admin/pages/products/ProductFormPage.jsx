import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Save, Trash2, X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { routes } from "../../../config/routes";
import { Button } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { Input } from "../../../shared/components/Input";
import { Loader } from "../../../shared/components/Loader";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { getValidationErrors, productSchema } from "../../../shared/utils/validation";
import { notify } from "../../../shared/utils/notify";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPanel } from "../../components/AdminPanel";
import { catalogService } from "../../services/catalogService";

const steps = ["Basics", "Media", "Attributes", "Variants"];

const getMaterialOptions = (currentValue) => {
  const defaults = ["Gold", "Silver", "Platinum", "Rose Gold", "White Gold", "Diamond", "Brass", "Alloy"];
  if (currentValue && !defaults.includes(currentValue)) {
    return [...defaults, currentValue];
  }
  return defaults;
};

const getPurityOptions = (currentValue) => {
  const defaults = ["24K", "22K", "18K", "14K", "10K", "999 (Fine)", "925 (Sterling)", "VVS1", "VS1", "SI1", "Not Applicable"];
  if (currentValue && !defaults.includes(currentValue)) {
    return [...defaults, currentValue];
  }
  return defaults;
};

const generateVariantSku = (variant) => {
  const parts = [
    variant.material,
    variant.color,
    variant.purity,
    variant.size,
  ].map((s) =>
    String(s || "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, "")
      .replace(/\s+/g, "")
  );
  return parts.filter(Boolean).join("-");
};

const emptyVariant = () => {
  const v = {
    sku: "",
    name: "",
    material: "Gold",
    color: "",
    purity: "",
    size: "",
    stock: "0",
    price: {
      INR: "",
      USD: "",
    },
  };
  v.sku = generateVariantSku(v);
  return v;
};

const defaultForm = {
  name: "",
  description: "",
  coverImage: "",
  images: [""],
  tags: [""],
  gemstone: "",
  occasions: [""],
  category: "",
  priceRange: {
    min: "",
    max: "",
  },
  variants: [emptyVariant()],
  isActive: true,
  featured: false,
};

const toTextArray = (items = []) => (items.length ? items : [""]);

const mapProductToForm = (product) => ({
  name: product.name || "",
  description: product.description || "",
  coverImage: product.coverImage || product.images?.[0] || "",
  images: toTextArray((product.images || []).filter((image) => image !== product.coverImage)),
  tags: toTextArray(product.tags || []),
  gemstone: product.gemstone || product.badge || "",
  occasions: toTextArray(product.occasions || []),
  category: product.category || "",
  priceRange: {
    min: String(product.priceRange?.min ?? product.price ?? ""),
    max: String(product.priceRange?.max ?? product.originalPrice ?? ""),
  },
  variants: product.variants?.length
    ? product.variants.map((variant) => {
        const mapped = {
          sku: variant.sku || "",
          name: variant.name || "",
          material: variant.material || "Gold",
          color: variant.color || "",
          purity: variant.purity || "",
          size: variant.size || "",
          stock: String(variant.stock ?? 0),
          price: {
            INR: String(variant.price?.INR ?? ""),
            USD: String(variant.price?.USD ?? ""),
          },
        };
        mapped.sku = mapped.sku || generateVariantSku(mapped);
        return mapped;
      })
    : [emptyVariant()],
  isActive: product.isActive !== false,
  featured: Boolean(product.featured),
});

const compactPayload = (form) => ({
  ...form,
  featured: Boolean(form.featured),
  images: form.images.map((item) => item.trim()).filter(Boolean),
  tags: form.tags.map((item) => item.trim()).filter(Boolean),
  occasions: form.occasions.map((item) => item.trim()).filter(Boolean),
  variants: (form.variants || []).map((variant) => {
    const autoName = [
      variant.material,
      variant.purity,
      variant.color,
      variant.size,
    ]
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .join(" ");
    return {
      ...variant,
      sku: generateVariantSku(variant),
      name: autoName || "Default Variant",
    };
  }),
});

function ArrayEditor({ label, required, values, placeholder, error, onChange }) {
  const update = (index, value) => onChange(values.map((item, itemIndex) => (itemIndex === index ? value : item)));
  const remove = (index) => onChange(values.length > 1 ? values.filter((_, itemIndex) => itemIndex !== index) : [""]);

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-stone-700">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </div>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <Input
              value={value}
              placeholder={placeholder}
              error={index === 0 ? error : undefined}
              onChange={(event) => update(index, event.target.value)}
            />
            <Button type="button" tone="secondary" size="sm" onClick={() => remove(index)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" tone="secondary" size="sm" onClick={() => onChange([...values, ""])}>
        <Plus className="h-4 w-4" />
        Add {label.toLowerCase()}
      </Button>
    </div>
  );
}

export function ProductFormPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const queryClient = useQueryClient();
  const isEdit = Boolean(productId);
  const [form, setForm] = useState(defaultForm);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const categoriesQuery = useQuery({
    queryKey: queryKeys.adminCategories,
    queryFn: catalogService.getCategories,
  });

  const productQuery = useQuery({
    queryKey: ["admin", "product", productId],
    queryFn: () => catalogService.getProductById(productId),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && productQuery.data) {
      setForm(mapProductToForm(productQuery.data));
      setErrors({});
      return;
    }

    if (!isEdit && categoriesQuery.data?.length && !form.category) {
      setForm((current) => ({ ...current, category: categoriesQuery.data[0].name }));
    }
  }, [categoriesQuery.data, form.category, isEdit, productQuery.data]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current));
  };

  const updatePriceRange = (field, value) => {
    setForm((current) => ({ ...current, priceRange: { ...current.priceRange, [field]: value } }));
    setErrors((current) => (current.priceRange ? { ...current, priceRange: undefined } : current));
  };

  const updateVariant = (index, field, value) => {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, itemIndex) => {
        if (itemIndex !== index) return variant;
        let updated = { ...variant };
        if (field === "INR" || field === "USD") {
          updated.price = { ...variant.price, [field]: value };
        } else {
          updated[field] = value;
        }
        updated.sku = generateVariantSku(updated);
        return updated;
      }),
    }));
    setErrors((current) => (current.variants ? { ...current, variants: undefined } : current));
  };

  const addVariant = () => {
    const nextVariants = [...form.variants, emptyVariant()];
    updateField("variants", nextVariants);
  };
  const removeVariant = (index) =>
    updateField("variants", form.variants.length > 1 ? form.variants.filter((_, itemIndex) => itemIndex !== index) : [emptyVariant()]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      // Validate unique SKUs
      const skus = form.variants.map((v) => generateVariantSku(v));
      const duplicateSku = skus.find((sku, idx) => skus.indexOf(sku) !== idx);
      if (duplicateSku) {
        notify.error(`Duplicate variant SKU detected: ${duplicateSku}. Each variant must have a unique combination of material, color, purity, and size.`);
        setSaving(false);
        return;
      }

      const parsed = productSchema.safeParse(compactPayload(form));

      if (!parsed.success) {
        setErrors(getValidationErrors(parsed.error));
        notify.error("Please fix the highlighted fields.");
        return;
      }

      setErrors({});

      if (isEdit) {
        await catalogService.updateProduct(productId, parsed.data);
        notify.success("Product updated.", { title: "Catalogue updated", iconKey: "order" });
      } else {
        await catalogService.createProduct(parsed.data);
        notify.success("Product created.", { title: "New product added", iconKey: "order" });
      }

      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminDashboard });
      navigate(routes.adminProductsList);
    } catch (error) {
      notify.error(error.message, { iconKey: "order" });
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && productQuery.isLoading) return <Loader label="Loading product..." />;
  if (isEdit && productQuery.isError) {
    return <EmptyState title="Product not found" description={productQuery.error?.message || "This product could not be loaded for editing."} />;
  }

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader
          eyebrow="Products"
          title={isEdit ? "Update product" : "Create product"}
          description="Create the exact backend product payload with repeatable images, tags, occasions, and per-variant pricing."
          actions={
            <Button as={Link} tone="secondary" to={routes.adminProductsList}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          }
        />
        <div className="mt-5 grid gap-2 md:grid-cols-4">
          {steps.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(index)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                step === index ? "bg-espresso text-gold-50" : "bg-gold-50 text-espresso hover:bg-white"
              }`}
            >
              {index + 1}. {label}
            </button>
          ))}
        </div>
      </AdminPanel>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {step === 0 ? (
          <AdminPanel>
            <h2 className="font-display text-3xl text-espresso">Basic product details</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Input label="Name" required error={errors.name} value={form.name} onChange={(event) => updateField("name", event.target.value)} />
              <Input label="Gemstone" required error={errors.gemstone} value={form.gemstone} onChange={(event) => updateField("gemstone", event.target.value)} />
              <label className="block space-y-2">
                <span className="text-sm font-medium text-stone-700">
                  Category<span className="ml-1 text-rose-500">*</span>
                </span>
                <select
                  value={form.category}
                  aria-invalid={Boolean(errors.category)}
                  className={`w-full rounded-3xl border bg-white px-4 py-3 text-sm text-stone-900 transition focus:border-gold-500 focus:ring-2 focus:ring-gold-100 ${
                    errors.category ? "border-rose-300" : "border-gold-100"
                  }`}
                  onChange={(event) => updateField("category", event.target.value)}
                >
                  <option value="">Select category</option>
                  {(categoriesQuery.data || []).map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category ? <span className="text-xs text-rose-600">{errors.category}</span> : null}
              </label>
              <Input label="Minimum price" type="number" required error={errors.priceRange} value={form.priceRange.min} onChange={(event) => updatePriceRange("min", event.target.value)} />
              <Input label="Maximum price" type="number" required value={form.priceRange.max} onChange={(event) => updatePriceRange("max", event.target.value)} />
              <label className="flex items-center gap-3 rounded-3xl border border-gold-100 bg-gold-50 px-4 py-3 text-sm font-medium text-stone-700 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(event) => updateField("isActive", event.target.checked)} />
                Active product
              </label>
              <label className="flex items-center gap-3 rounded-3xl border border-gold-100 bg-gold-50 px-4 py-3 text-sm font-medium text-stone-700 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={(event) => updateField("featured", event.target.checked)} />
                Featured product
              </label>
            </div>
            <div className="mt-4">
              <Input label="Description" as="textarea" required error={errors.description} value={form.description} onChange={(event) => updateField("description", event.target.value)} />
            </div>
          </AdminPanel>
        ) : null}

        {step === 1 ? (
          <AdminPanel>
            <h2 className="font-display text-3xl text-espresso">Media</h2>
            <div className="mt-5 space-y-5">
              <Input label="Cover image URL" required error={errors.coverImage} value={form.coverImage} onChange={(event) => updateField("coverImage", event.target.value)} />
              <ArrayEditor label="Images" required values={form.images} placeholder="https://..." error={errors.images} onChange={(items) => updateField("images", items)} />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[form.coverImage, ...form.images].filter(Boolean).slice(0, 8).map((image, index) => (
                  <img key={`${image}-${index}`} src={image} alt={`Preview ${index + 1}`} className="w-full aspect-square rounded-lg border border-gold-100 bg-gold-50 object-cover" />
                ))}
              </div>
            </div>
          </AdminPanel>
        ) : null}

        {step === 2 ? (
          <AdminPanel>
            <h2 className="font-display text-3xl text-espresso">Tags and occasions</h2>
            <div className="mt-5 grid gap-6 md:grid-cols-2">
              <ArrayEditor label="Tags" values={form.tags} placeholder="rose gold" error={errors.tags} onChange={(items) => updateField("tags", items)} />
              <ArrayEditor label="Occasions" values={form.occasions} placeholder="Wedding" error={errors.occasions} onChange={(items) => updateField("occasions", items)} />
            </div>
          </AdminPanel>
        ) : null}

        {step === 3 ? (
          <AdminPanel>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-3xl text-espresso">Variants</h2>
              <Button type="button" tone="secondary" onClick={addVariant}>
                <Plus className="h-4 w-4" />
                Add variant
              </Button>
            </div>
            {errors.variants ? <p className="mt-3 text-xs text-rose-600">{errors.variants}</p> : null}
            <div className="mt-5 space-y-5">
              {form.variants.map((variant, index) => (
                <div key={index} className="rounded-2xl border border-gold-100 bg-gold-50 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="font-semibold text-espresso">Variant {index + 1}</div>
                    <Button type="button" tone="danger" size="sm" onClick={() => removeVariant(index)}>
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Input
                      label="SKU"
                      placeholder="SKU will be auto-generated"
                      value={variant.sku}
                      disabled
                    />
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-stone-700">
                        Material<span className="ml-1 text-rose-500">*</span>
                      </span>
                      <select
                        value={variant.material}
                        className="w-full rounded-3xl border border-gold-100 bg-white px-4 py-3 text-sm text-stone-900 transition focus:border-gold-500 focus:ring-2 focus:ring-gold-100"
                        onChange={(event) => updateVariant(index, "material", event.target.value)}
                      >
                        <option value="">Select Material</option>
                        {getMaterialOptions(variant.material).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Input label="Color" required value={variant.color} onChange={(event) => updateVariant(index, "color", event.target.value)} />
                    <label className="block space-y-2">
                      <span className="text-sm font-medium text-stone-700">
                        Purity<span className="ml-1 text-rose-500">*</span>
                      </span>
                      <select
                        value={variant.purity}
                        className="w-full rounded-3xl border border-gold-100 bg-white px-4 py-3 text-sm text-stone-900 transition focus:border-gold-500 focus:ring-2 focus:ring-gold-100"
                        onChange={(event) => updateVariant(index, "purity", event.target.value)}
                      >
                        <option value="">Select Purity</option>
                        {getPurityOptions(variant.purity).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Input label="Size" required value={variant.size} onChange={(event) => updateVariant(index, "size", event.target.value)} />
                    <Input label="Stock" type="number" required value={variant.stock} onChange={(event) => updateVariant(index, "stock", event.target.value)} />
                    <Input label="INR price" type="number" required value={variant.price.INR} onChange={(event) => updateVariant(index, "INR", event.target.value)} />
                    <Input label="USD price" type="number" required value={variant.price.USD} onChange={(event) => updateVariant(index, "USD", event.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </AdminPanel>
        ) : null}

        <AdminPanel>
          <div className="flex flex-wrap justify-between gap-3">
            <Button type="button" tone="secondary" disabled={step === 0} onClick={() => setStep((current) => Math.max(current - 1, 0))}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex flex-wrap gap-3">
              <Button as={Link} to={routes.adminProductsList} type="button" tone="secondary">
                <X className="h-4 w-4" />
                Cancel
              </Button>
              {step < steps.length - 1 ? (
                <Button type="button" onClick={() => setStep((current) => Math.min(current + 1, steps.length - 1))}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" loading={saving}>
                  <Save className="h-4 w-4" />
                  {isEdit ? "Save changes" : "Create product"}
                </Button>
              )}
            </div>
          </div>
        </AdminPanel>
      </form>
    </div>
  );
}
