import { initialData } from "../../mock/data";
import { ApiUnavailableError, apiClient } from "./apiClient";
import { mockApiClient } from "./mockApiClient";

const slugify = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const parseList = (value, fallback = []) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return fallback;

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeColors = (colors = []) =>
  parseList(colors, []).map((color) =>
    typeof color === "string"
      ? { name: color, code: "#D3A347" }
      : {
          name: color.name,
          code: color.code || "#D3A347",
        }
  );

const isApiFallbackError = (error) => false;
const firstImage = (product = {}) => product.coverImage || product.images?.[0] || "";

const toTitleSlug = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const resolveCategory = (db, payload) => {
  const rawCategory = payload.category || payload.categoryName;
  const byId = db.categories.find((category) => category.id === payload.categoryId);
  const byName = db.categories.find(
    (category) => category.name.toLowerCase() === String(rawCategory || "").toLowerCase()
  );

  return byId || byName || db.categories[0];
};

export const normalizeApiProduct = (product = {}) => {
  const rawVariants = Array.isArray(product.variants) ? [...product.variants] : [];
  if (rawVariants.length === 0) {
    const priceVal = Number(product.price ?? product.priceRange?.min ?? 0);
    const usdPriceVal = Number(product.usdPrice ?? Math.round(priceVal * 0.012));
    const stockVal = Number(product.stock ?? 10);
    const colorsList = parseList(product.colors || ["Gold"]);
    const sizesList = parseList(product.sizes || ["One Size"]);
    const imageList = [
      product.coverImage,
      ...(Array.isArray(product.images) ? product.images : []),
    ].filter(Boolean);

    rawVariants.push({
      sku: product.sku || `SKU-${toTitleSlug(product.name || "item")}-DEFAULT`.toUpperCase(),
      isDefault: true,
      isAvailable: true,
      attributes: {
        material: product.gemstone || "Gold",
        color: typeof colorsList[0] === "object" ? colorsList[0].name : colorsList[0] || "Gold",
        purity: "22K",
        size: sizesList[0] || "One Size",
        stock: String(stockVal),
        name: product.name || "Default",
      },
      prices: [
        { currency: "INR", amount: priceVal },
        { currency: "USD", amount: usdPriceVal },
      ],
      images: imageList.map((url) => ({ url, key: "" })),
    });
  }

  const variants = rawVariants.map((v) => {
    const attrs = {};
    if (v.attributes) {
      if (typeof v.attributes.get === "function") {
        v.attributes.forEach((val, key) => { attrs[key] = val; });
      } else {
        Object.entries(v.attributes).forEach(([key, val]) => { attrs[key] = val; });
      }
    }

    const price = { INR: 0, USD: 0 };
    if (Array.isArray(v.prices)) {
      v.prices.forEach((p) => {
        if (p.currency === "INR") price.INR = p.amount;
        if (p.currency === "USD") price.USD = p.amount;
      });
    }

    const images = Array.isArray(v.images)
      ? v.images.map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean)
      : [];

    return {
      sku: v.sku || `SKU-${toTitleSlug(product.name || "item")}-DEFAULT`.toUpperCase(),
      name: attrs.name || "",
      material: attrs.material || "Gold",
      color: attrs.color || "Gold",
      purity: attrs.purity || "22K",
      size: attrs.size || "One Size",
      stock: Number(attrs.stock ?? 0),
      isAvailable: v.isAvailable !== false,
      isDefault: Boolean(v.isDefault),
      price,
      images,
      image_url: images[0] || "",
    };
  });

  const variantPrices = variants
    .map((v) => Number(v.price?.INR))
    .filter((p) => Number.isFinite(p) && p > 0);

  const price = Number(product.priceRange?.min ?? product.price ?? variantPrices[0] ?? 0);
  const originalPrice = Number(
    product.priceRange?.max ?? product.originalPrice ?? Math.max(price, ...variantPrices, 0)
  );

  const colors = variants.length
    ? variants
        .map((v) => v.color).filter(Boolean)
        .filter((c, i, arr) => arr.indexOf(c) === i)
        .map((c) => ({ name: c, code: "#D9A44F" }))
    : normalizeColors(product.colors || ["Gold"]);

  const sizes = variants.length
    ? variants.map((v) => v.size).filter(Boolean).filter((s, i, arr) => arr.indexOf(s) === i)
    : parseList(product.sizes, ["One Size"]);

  const stock = variants.length
    ? variants.reduce((total, v) => total + Number(v.stock || 0), 0)
    : Number(product.stock || 0);

  const imageList = [
    product.coverImage,
    ...(Array.isArray(product.images) ? product.images : []),
  ].filter(Boolean);

  let gemstone = product.gemstone || "";
  let badge = "BR Edit";
  if (!gemstone && Array.isArray(product.tags)) {
    const gemTags = ["diamond", "gold", "ruby", "emerald", "sapphire", "platinum", "silver", "pearl"];
    const found = product.tags.find((t) => gemTags.includes(String(t).toLowerCase()));
    if (found) gemstone = found.charAt(0).toUpperCase() + found.slice(1);
  }
  if (gemstone) badge = gemstone;

  const occasions = Array.isArray(product.occasions) ? product.occasions : [];

  return {
    id: product._id || product.id,
    backendId: product._id,
    slug: product.slug || "",
    name: product.name || "Untitled product",
    categoryId: product.category || "",
    category: product.category || "Unassigned",
    gemstone: gemstone || "Gold",
    badge,
    coverImage: product.coverImage || imageList[0] || "",
    price,
    originalPrice: originalPrice || price,
    priceRange: {
      min: product.priceRange?.min ?? price,
      max: product.priceRange?.max ?? originalPrice,
    },
    description: product.description || "Premium jewellery item.",
    details: product.description || "Crafted with BR Jewellers quality standards.",
    colors,
    sizes,
    featured: Boolean(product.featured),
    stock,
    tags: Array.isArray(product.tags) ? product.tags : [],
    occasions,
    images: imageList.length ? imageList : [],
    variants,
    isActive: product.isActive !== false,
    status: product.isActive === false ? "Inactive" : "Active",
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

const mapFormToBackendPayload = (payload = {}) => {
  const name = payload.name?.trim();
  const slug = payload.slug || slugify(name);
  const description = payload.description?.trim() || "";
  const shortDescription = payload.shortDescription?.trim() || "";
  const coverImage = payload.coverImage || "";
  const isActive = payload.isActive !== false;
  const category = payload.category || "";

  const galleryImages = parseList(payload.images).filter((img) => img && img !== coverImage);

  const tagsSet = new Set();
  parseList(payload.tags).forEach((t) => tagsSet.add(t.toLowerCase()));
  if (payload.gemstone) tagsSet.add(payload.gemstone.toLowerCase());
  if (payload.badge) tagsSet.add(payload.badge.toLowerCase());
  const tags = Array.from(tagsSet);

  const occasions = parseList(payload.occasions).filter(Boolean);
  const gemstone = payload.gemstone?.trim() || "";

  const rawVariants = Array.isArray(payload.variants) ? payload.variants : [];
  const variants = rawVariants.map((variant) => {
    const autoName = [variant.material, variant.color, variant.purity, variant.size]
      .map((v) => String(v || "").trim()).filter(Boolean).join("-").toLowerCase();

    const attributes = {};
    if (variant.material) attributes.material = String(variant.material);
    if (variant.color) attributes.color = String(variant.color);
    if (variant.purity) attributes.purity = String(variant.purity);
    if (variant.size) attributes.size = String(variant.size);
    if (variant.stock !== undefined) attributes.stock = String(variant.stock);
    attributes.name = variant.name?.trim() || autoName || "Default";

    const inrVal = Number(variant.price?.INR ?? variant.price ?? 0);
    const usdVal = Number(variant.price?.USD ?? variant.usdPrice ?? Math.round(inrVal * 0.012));
    const prices = [];
    if (inrVal > 0) prices.push({ currency: "INR", amount: inrVal });
    if (usdVal > 0) prices.push({ currency: "USD", amount: usdVal });

    const variantImages = parseList(variant.images || variant.image_url)
      .map((imgUrl) => ({ url: imgUrl, key: "" }));

    return {
      sku: variant.sku ? String(variant.sku) : undefined,
      isDefault: Boolean(variant.isDefault),
      attributes,
      prices,
      images: variantImages,
    };
  });

  if (variants.length === 0) {
    const priceVal = Number(payload.price ?? payload.priceRange?.min ?? 0);
    const usdPriceVal = Number(payload.usdPrice ?? Math.round(priceVal * 0.012));
    const stockVal = Number(payload.stock ?? 0);
    const colors = parseList(payload.colors, ["Gold"]);
    const sizes = parseList(payload.sizes, ["One Size"]);

    variants.push({
      sku: payload.sku || undefined,
      isDefault: true,
      attributes: {
        material: payload.material || "Gold",
        color: colors[0] || "Gold",
        purity: payload.purity || "22K",
        size: sizes[0] || "One Size",
        stock: String(stockVal),
        name: name,
      },
      prices: [
        { currency: "INR", amount: priceVal },
        { currency: "USD", amount: usdPriceVal },
      ],
      images: galleryImages.map((url) => ({ url, key: "" })),
    });
  }

  return {
    name,
    slug,
    description,
    shortDescription,
    coverImage,
    images: galleryImages,
    tags,
    occasions,
    gemstone,
    category,
    isActive,
    priceRange: {
      min: Number(payload.priceRange?.min ?? 0),
      max: Number(payload.priceRange?.max ?? 0),
    },
    variants,
  };
};

const makeProductRecord = (db, payload, existingProduct = {}) => {
  const category = resolveCategory(db, payload);
  const name = payload.name?.trim() || existingProduct.name;
  const variants = Array.isArray(payload.variants) ? payload.variants : existingProduct.variants || [];
  const variantPrices = variants.map((variant) => Number(variant?.price?.INR)).filter((price) => Number.isFinite(price));
  const price = Number(payload.priceRange?.min ?? payload.price ?? variantPrices[0] ?? existingProduct.price ?? 0);
  const originalPrice = Number(payload.priceRange?.max ?? payload.originalPrice ?? Math.max(price, ...variantPrices, 0));

  return {
    ...existingProduct,
    id: existingProduct.id || crypto.randomUUID(),
    slug: slugify(payload.slug || name),
    name,
    categoryId: category?.id || payload.category || existingProduct.categoryId,
    category: category?.name || payload.category || existingProduct.category || "Unassigned",
    price,
    originalPrice,
    description: payload.description ?? existingProduct.description ?? "Premium jewellery item.",
    details: payload.details ?? existingProduct.details ?? "Prepared for future backend enrichment.",
    gemstone: payload.gemstone ?? existingProduct.gemstone ?? payload.badge ?? "Gold",
    coverImage: payload.coverImage ?? existingProduct.coverImage ?? parseList(payload.images, existingProduct.images ?? [])[0],
    occasions: parseList(payload.occasions, existingProduct.occasions ?? []),
    colors: normalizeColors(
      payload.colors ??
        (variants.length ? variants.map((variant) => variant.color).filter(Boolean) : existingProduct.colors ?? [])
    ),
    sizes: parseList(
      payload.sizes ?? (variants.length ? variants.map((variant) => variant.size).filter(Boolean) : undefined),
      existingProduct.sizes ?? ["One Size"]
    ),
    featured: Boolean(payload.featured ?? existingProduct.featured),
    badge: payload.badge ?? existingProduct.badge ?? "BR Edit",
    stock: Number(
      payload.stock ??
        variants.reduce((total, variant) => total + Number(variant.stock || 0), 0) ??
        existingProduct.stock ??
        0
    ),
    tags: parseList(payload.tags, existingProduct.tags ?? []),
    images: parseList(payload.images, existingProduct.images ?? []).length
      ? parseList(payload.images, existingProduct.images ?? [])
      : existingProduct.images ?? [],
    variants,
    isActive: payload.isActive ?? existingProduct.isActive ?? true,
    status: payload.isActive === false ? "Inactive" : payload.status ?? existingProduct.status ?? "Active",
  };
};

export const catalogService = {
  // Expose normalizeApiProduct for external use
  normalizeApiProduct,

  async getProducts(search = "", options = {}) {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (options.includeInactive) {
        params.set("isActive", "all");
      } else if (options.isActive !== undefined) {
        params.set("isActive", String(options.isActive));
      }
      if (options.category) params.set("category", options.category);
      if (options.material) params.set("material", options.material);
      if (options.purity) params.set("purity", options.purity);
      if (options.size) params.set("size", options.size);
      if (options.featured !== undefined) params.set("featured", String(options.featured));

      const products = await apiClient.request(`/api/v1/product/list${params.toString() ? `?${params}` : ""}`);
      const query = search.trim().toLowerCase();

      return (Array.isArray(products) ? products : [])
        .map(normalizeApiProduct)
        .filter((product) => {
          if (!query) return true;

          return [product.name, product.category, product.badge, product.gemstone, ...product.tags]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query));
        })
        .sort((left, right) => left.name.localeCompare(right.name));
    } catch (error) {
      if (!isApiFallbackError(error)) throw error;
    }

    return mockApiClient.query((db) => {
      const query = search.trim().toLowerCase();

      return db.products
        .filter((product) => options.includeInactive || product.isActive !== false)
        .filter((product) => {
          if (!query) return true;

          return [product.name, product.category, product.badge, product.gemstone, ...(product.tags || [])]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query));
        })
        .map(normalizeApiProduct)
        .sort((left, right) => left.name.localeCompare(right.name));
    });
  },

  async getProductById(identifier) {
    try {
      const product = await apiClient.request(`/api/v1/product/${identifier}`);
      return normalizeApiProduct(product);
    } catch (error) {
      if (!isApiFallbackError(error)) throw error;
    }

    return mockApiClient.query((db) => {
      const product = db.products.find((entry) => entry.id === identifier || entry.slug === identifier);
      if (!product) throw new Error("Product not found.");
      return normalizeApiProduct(product);
    });
  },

  async getFeaturedProducts() {
    try {
      const products = await apiClient.request("/api/v1/product/list?featured=true");
      return (Array.isArray(products) ? products : [])
        .map(normalizeApiProduct);
    } catch (error) {
      if (!isApiFallbackError(error)) throw error;
    }

    return mockApiClient.query((db) => {
      const products = Array.isArray(db.products) && db.products.length ? db.products : initialData.products || [];
      const featured = products.filter((product) => product.featured);

      return (featured.length ? featured : (initialData.products || []).filter((product) => product.featured))
        .filter((product) => product.featured)
        .map(normalizeApiProduct)
        .sort((left, right) => left.name.localeCompare(right.name));
    });
  },

  async createProduct(payload) {
    try {
      await apiClient.request("/api/v1/product/create", {
        method: "POST",
        auth: true,
        body: mapFormToBackendPayload(payload),
      });
      return true;
    } catch (error) {
      if (!isApiFallbackError(error)) throw error;
    }

    return mockApiClient.mutate((db) => {
      db.products.unshift(makeProductRecord(db, payload));
      return db;
    });
  },

  async updateProduct(productId, payload) {
    try {
      await apiClient.request(`/api/v1/product/${productId}`, {
        method: "PATCH",
        auth: true,
        body: mapFormToBackendPayload(payload),
      });
      return true;
    } catch (error) {
      if (!isApiFallbackError(error)) throw error;
    }

    return mockApiClient.mutate((db) => {
      const index = db.products.findIndex((product) => product.id === productId);
      if (index === -1) throw new Error("Product not found.");

      db.products[index] = makeProductRecord(db, payload, db.products[index]);
      return db;
    });
  },

  async updateProductStatus(productId, isActive) {
    try {
      const activeState = isActive === true || isActive === "true" || isActive === 1 || isActive === "1";
      await apiClient.request(`/api/v1/product/status/${productId}`, {
        method: "PATCH",
        auth: true,
        body: { isActive: activeState },
      });
      return true;
    } catch (error) {
      if (!isApiFallbackError(error)) throw error;
    }

    return mockApiClient.mutate((db) => {
      const product = db.products.find((entry) => entry.id === productId);
      if (!product) throw new Error("Product not found.");

      const activeState = isActive === true || isActive === "true" || isActive === 1 || isActive === "1";
      product.isActive = activeState;
      product.status = activeState ? "Active" : "Inactive";
      return db;
    });
  },

  async deleteProduct(productId) {
    try {
      await apiClient.request(`/api/v1/product/${productId}`, {
        method: "DELETE",
        auth: true,
      });
      return true;
    } catch (error) {
      if (!isApiFallbackError(error)) throw error;
    }

    return mockApiClient.mutate((db) => {
      db.products = db.products.filter((product) => product.id !== productId);
      return db;
    });
  },

  async toggleFeatured(productId) {
    try {
      const product = await catalogService.getProductById(productId);
      const nextFeatured = !product.featured;
      await apiClient.request(`/api/v1/product/${productId}`, {
        method: "PATCH",
        auth: true,
        body: { featured: nextFeatured },
      });
      return true;
    } catch (error) {
      if (!isApiFallbackError(error)) throw error;
    }

    return mockApiClient.mutate((db) => {
      const product = db.products.find((entry) => entry.id === productId);
      if (!product) throw new Error("Product not found.");

      product.featured = !product.featured;
      return db;
    });
  },

  async bulkUploadProducts(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.request("/api/v1/product/bulk-import", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      auth: true,
    });
    return res;
  },

  async getCategories() {
    const categories = await apiClient.request("/api/v1/category/list");

    return (Array.isArray(categories) ? categories : []).map((category) => {
      const name = typeof category === "string" ? category : category?.name;
      const id = typeof category === "string" ? category : category?._id || category?.id || name;
      return {
        id,
        name,
        slug: toTitleSlug(name),
        description: category?.description || "",
        isActive: category?.status ? category.status === "active" : category?.isActive !== false,
        productCount: category?.productCount || 0,
      };
    });
  },

  async createCategory(payload) {
    await apiClient.post("/api/v1/category/create", {
      name: payload.name.trim(),
      description: payload.description?.trim() || "",
      isActive: payload.isActive !== false,
    });
    return true;
  },

  async updateCategory(categoryId, payload) {
    await apiClient.patch(`/api/v1/category/${categoryId}`, {
      name: payload.name.trim(),
      description: payload.description?.trim() || "",
      isActive: payload.isActive !== false,
    });
    return true;
  },

  async updateCategoryStatus(categoryId, isActive) {
    await apiClient.patch(`/api/v1/category/${categoryId}/status`, {
      status: isActive ? "active" : "inactive",
    });
    return true;
  },

  async deleteCategory(categoryId) {
    await apiClient.delete(`/api/v1/category/${categoryId}`);
    return true;
  },
};
