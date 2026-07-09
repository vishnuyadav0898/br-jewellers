import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Save, Trash2, X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { routes } from "../../../config/routes";
import { Button } from "../../../shared/components/Button";
import { EmptyState } from "../../../shared/components/EmptyState";
import { Input } from "../../../shared/components/Input";
import { TagInput } from "../../../shared/components/TagInput";
import { ImageUpload } from "../../../shared/components/ImageUpload";
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

// Removed ArrayEditor component

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

  const handleNextStep = () => {
    let fieldsToValidate = {};
    if (step === 0) {
      fieldsToValidate = {
        name: form.name,
        gemstone: form.gemstone,
        category: form.category,
        description: form.description,
        priceRange: form.priceRange,
      };
    } else if (step === 1) {
      fieldsToValidate = {
        coverImage: form.coverImage,
      };
    }

    if (Object.keys(fieldsToValidate).length > 0) {
      const parsed = productSchema.safeParse(compactPayload(form));
      if (!parsed.success) {
        const stepErrors = getValidationErrors(parsed.error);
        const currentStepErrors = {};
        let hasError = false;
        
        Object.keys(fieldsToValidate).forEach(key => {
          if (stepErrors[key]) {
            currentStepErrors[key] = stepErrors[key];
            hasError = true;
          }
        });
        
        if (hasError) {
          setErrors(prev => ({ ...prev, ...currentStepErrors }));
          notify.error("Please fix the highlighted fields before proceeding.");
          return;
        }
      }
    }
    
    setErrors({});
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

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

        // Update the query cache directly instead of invalidating
        queryClient.setQueriesData({ queryKey: ["admin", "products"] }, (oldProducts) => {
          if (!oldProducts) return oldProducts;
          return oldProducts.map((p) => {
            if (p.id === productId || p.backendId === productId) {
              const coverImage = parsed.data.coverImage || parsed.data.images?.[0] || p.coverImage;
              const minPrice = parsed.data.priceRange?.min || parsed.data.price || p.price;
              const maxPrice = parsed.data.priceRange?.max || parsed.data.originalPrice || p.originalPrice;
              
              return {
                ...p,
                ...parsed.data,
                coverImage,
                price: Number(minPrice),
                originalPrice: Number(maxPrice),
                stock: parsed.data.variants?.reduce((sum, v) => sum + Number(v.stock || 0), 0) ?? p.stock,
              };
            }
            return p;
          });
        });
      } else {
        await catalogService.createProduct(parsed.data);
        notify.success("Product created.", { title: "New product added", iconKey: "order" });
        queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      }

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
            <div className="mt-5 grid gap-6 md:grid-cols-2">
              <ImageUpload 
                label="Cover image" 
                required 
                error={errors.coverImage} 
                value={form.coverImage} 
                onChange={(url) => updateField("coverImage", url)} 
              />
              
              <div className="space-y-2">
                <span className="text-sm font-medium text-stone-700 block">Additional Images</span>
                <div className="grid grid-cols-2 gap-4">
                  {form.images.filter(Boolean).map((image, index) => (
                    <div key={index} className="relative group rounded-xl border border-gold-100 overflow-hidden w-full aspect-[4/3] max-w-[300px]">
                      <img 
                        src={image} 
                        alt={`Additional preview ${index}`} 
                        className="w-full h-full object-cover bg-stone-50"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const newImages = form.images.filter(Boolean);
                          newImages.splice(index, 1);
                          updateField("images", newImages);
                          await catalogService.deleteImage(image);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-full transition-colors"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <ImageUpload 
                    multiple={true}
                    value={""}
                    onChange={(urls) => {
                      if (Array.isArray(urls)) {
                        updateField("images", [...form.images.filter(Boolean), ...urls]);
                      }
                    }} 
                  />
                </div>
              </div>
            </div>
          </AdminPanel>
        ) : null}

        {step === 2 ? (
          <AdminPanel>
            <h2 className="font-display text-3xl text-espresso">Tags and occasions</h2>
            <div className="mt-5 grid gap-6 md:grid-cols-2">
              <TagInput label="Tags" values={form.tags} placeholder="Type and press enter or comma" error={errors.tags} onChange={(items) => updateField("tags", items)} />
              <TagInput label="Occasions" values={form.occasions} placeholder="Wedding, Anniversary" error={errors.occasions} onChange={(items) => updateField("occasions", items)} />
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
                <Button type="button" onClick={handleNextStep}>
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
