import { mockApiClient } from "../../shared/services/mockApiClient";
import { initialData } from "../../mock/data";

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

const resolveCategory = (db, payload) => {
  const rawCategory = payload.category || payload.categoryName;
  const byId = db.categories.find((category) => category.id === payload.categoryId);
  const byName = db.categories.find(
    (category) => category.name.toLowerCase() === String(rawCategory || "").toLowerCase()
  );

  return byId || byName || db.categories[0];
};

const makeProductRecord = (db, payload, existingProduct = {}) => {
  const category = resolveCategory(db, payload);
  const name = payload.name?.trim() || existingProduct.name;

  return {
    ...existingProduct,
    id: existingProduct.id || crypto.randomUUID(),
    slug: slugify(payload.slug || name),
    name,
    categoryId: category?.id || existingProduct.categoryId,
    category: category?.name || existingProduct.category || "Unassigned",
    price: Number(payload.price ?? existingProduct.price ?? 0),
    originalPrice: Number(payload.originalPrice ?? existingProduct.originalPrice ?? payload.price ?? 0),
    description: payload.description ?? existingProduct.description ?? "Premium jewellery item.",
    details: payload.details ?? existingProduct.details ?? "Prepared for future backend enrichment.",
    colors: normalizeColors(payload.colors ?? existingProduct.colors ?? []),
    sizes: parseList(payload.sizes, existingProduct.sizes ?? ["One Size"]),
    featured: Boolean(payload.featured ?? existingProduct.featured),
    badge: payload.badge ?? existingProduct.badge ?? "BR Edit",
    stock: Number(payload.stock ?? existingProduct.stock ?? 0),
    tags: parseList(payload.tags, existingProduct.tags ?? []),
    images: parseList(payload.images, existingProduct.images ?? []).length
      ? parseList(payload.images, existingProduct.images ?? [])
      : existingProduct.images ?? [],
    status: payload.status ?? existingProduct.status ?? "Active",
  };
};

export const catalogService = {
  async getProducts(search = "") {
    return mockApiClient.query((db) => {
      const query = search.trim().toLowerCase();

      return db.products
        .filter((product) => {
          if (!query) return true;

          return [product.name, product.category, product.badge]
            .filter(Boolean)
            .some((value) => value.toLowerCase().includes(query));
        })
        .sort((left, right) => left.name.localeCompare(right.name));
    });
  },

  async getFeaturedProducts() {
    return mockApiClient.query((db) => {
      const products =
        Array.isArray(db.products) && db.products.length ? db.products : initialData.products || [];
      const featured = products.filter((product) => product.featured);

      return (featured.length ? featured : (initialData.products || []).filter((product) => product.featured))
        .filter((product) => product.featured)
        .sort((left, right) => left.name.localeCompare(right.name));
    });
  },

  async createProduct(payload) {
    return mockApiClient.mutate((db) => {
      db.products.unshift(makeProductRecord(db, payload));
      return db;
    });
  },

  async updateProduct(productId, payload) {
    return mockApiClient.mutate((db) => {
      const index = db.products.findIndex((product) => product.id === productId);
      if (index === -1) throw new Error("Product not found.");

      db.products[index] = makeProductRecord(db, payload, db.products[index]);
      return db;
    });
  },

  async deleteProduct(productId) {
    return mockApiClient.mutate((db) => {
      db.products = db.products.filter((product) => product.id !== productId);
      return db;
    });
  },

  async toggleFeatured(productId) {
    return mockApiClient.mutate((db) => {
      const product = db.products.find((entry) => entry.id === productId);
      if (!product) throw new Error("Product not found.");

      product.featured = !product.featured;
      return db;
    });
  },

  async bulkUploadProducts(rows = []) {
    return mockApiClient.mutate((db) => {
      const created = rows
        .filter((row) => row.name && row.price)
        .map((row) => makeProductRecord(db, row));

      db.products = [...created, ...db.products];
      return db;
    });
  },

  async getCategories() {
    return mockApiClient.query((db) =>
      db.categories.map((category) => ({
        ...category,
        productCount: db.products.filter((product) => product.categoryId === category.id).length,
      }))
    );
  },

  async createCategory(payload) {
    return mockApiClient.mutate((db) => {
      const category = {
        id: crypto.randomUUID(),
        name: payload.name.trim(),
        slug: slugify(payload.name),
        description: payload.description || "",
        featured: Boolean(payload.featured),
      };

      db.categories.unshift(category);
      return db;
    });
  },

  async updateCategory(categoryId, payload) {
    return mockApiClient.mutate((db) => {
      const category = db.categories.find((entry) => entry.id === categoryId);
      if (!category) throw new Error("Category not found.");

      const nextName = payload.name?.trim() || category.name;
      category.name = nextName;
      category.slug = slugify(nextName);
      category.description = payload.description ?? category.description;
      category.featured = Boolean(payload.featured);

      db.products.forEach((product) => {
        if (product.categoryId === categoryId) {
          product.category = nextName;
        }
      });

      return db;
    });
  },

  async deleteCategory(categoryId) {
    return mockApiClient.mutate((db) => {
      const fallbackCategory = db.categories.find((category) => category.id !== categoryId);
      if (!fallbackCategory) {
        throw new Error("At least one category must remain in the catalogue.");
      }

      db.categories = db.categories.filter((category) => category.id !== categoryId);
      db.products = db.products.map((product) =>
        product.categoryId === categoryId
          ? {
              ...product,
              categoryId: fallbackCategory.id,
              category: fallbackCategory.name,
            }
          : product
      );

      return db;
    });
  },
};
