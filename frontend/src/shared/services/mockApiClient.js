import { initialData } from "../../mock/data";
import { appConfig } from "../../config/appConfig";
import { normalizeUserRole } from "../utils/auth";

const clone = (value) => JSON.parse(JSON.stringify(value));
const ensureArray = (value, fallback = []) => (Array.isArray(value) ? value : clone(fallback));
const ensureObject = (value, fallback = {}) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : clone(fallback);
const isPresent = (value) => value !== undefined && value !== null;
const mergeDefined = (base = {}, override = {}) => ({
  ...base,
  ...Object.fromEntries(Object.entries(override || {}).filter(([, value]) => isPresent(value))),
});
const findMatchingSeed = (records = [], candidate = {}, keys = []) =>
  ensureArray(records).find((entry) =>
    keys.some((key) => isPresent(entry?.[key]) && isPresent(candidate?.[key]) && entry[key] === candidate[key])
  );
const mergeRecords = (records = [], fallbackRecords = [], getKey = (entry) => entry?.id) => {
  const current = ensureArray(records);
  const fallback = ensureArray(fallbackRecords);
  const seen = new Set(current.map((entry) => getKey(entry)).filter(Boolean));

  return [...current, ...fallback.filter((entry) => !seen.has(getKey(entry)))];
};

const ensureCoupons = (coupons = []) =>
  coupons.map((coupon, index) => ({
    id: coupon.id || `coupon-${index + 1}`,
    code: coupon.code,
    discountPercent:
      coupon.discountPercent ??
      (coupon.type === "percent" ? coupon.value : Math.max(Math.round((coupon.value / 100000) * 100), 5)),
    expiresAt: coupon.expiresAt || "2026-12-31T23:59:59.000Z",
    usageLimit: coupon.usageLimit ?? 100,
    usageCount: coupon.usageCount ?? 0,
    isEnabled: coupon.isEnabled ?? true,
    description: coupon.description || coupon.label || `${coupon.code} offer`,
  }));

const buildAddressLabel = (user = {}) =>
  user.address ||
  (user.addresses?.[0]
    ? `${user.addresses?.[0]?.line1 || ""}, ${user.addresses?.[0]?.city || ""}, ${user.addresses?.[0]?.state || ""}`.replace(
        /^,\s*|,\s*,|,\s*$/,
        ""
      )
    : "MG Road, Bengaluru, Karnataka");

const ensureUsers = (users = []) =>
  ensureArray(users, initialData.users || []).map((user, index) => {
    const seedUser = findMatchingSeed(initialData.users || [], user, ["id", "email"]) || {};
    const mergedUser = mergeDefined(seedUser, user);

    return normalizeUserRole({
      ...mergedUser,
      id: mergedUser.id || seedUser.id || `user-${index + 1}`,
      name: mergedUser.name || seedUser.name || "BR Customer",
      email: mergedUser.email || seedUser.email || `customer${index + 1}@brdemo.com`,
      avatar: mergedUser.avatar || seedUser.avatar || "",
      provider: mergedUser.provider || seedUser.provider || "email",
      phone: mergedUser.phone || seedUser.phone || "",
      addresses: ensureArray(mergedUser.addresses, seedUser.addresses || []),
      address: buildAddressLabel(mergedUser),
    });
  });

const ensureCategories = (categories = []) =>
  ensureArray(categories, initialData.categories || []).map((category, index) => {
    const seedCategory = findMatchingSeed(initialData.categories || [], category, ["id", "slug", "name"]) || {};
    const mergedCategory = mergeDefined(seedCategory, category);

    return {
      ...mergedCategory,
      id: mergedCategory.id || seedCategory.id || `category-${index + 1}`,
      name: mergedCategory.name || seedCategory.name || `Category ${index + 1}`,
      slug:
        mergedCategory.slug ||
        seedCategory.slug ||
        String(mergedCategory.name || `category-${index + 1}`)
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, ""),
      description: mergedCategory.description ?? seedCategory.description ?? "",
    };
  });

const ensureProducts = (products = [], categories = []) =>
  ensureArray(products, initialData.products || []).map((product, index) => {
    const seedProduct = findMatchingSeed(initialData.products || [], product, ["id", "slug", "name"]) || {};
    const mergedProduct = mergeDefined(seedProduct, product);
    const category =
      categories.find((entry) => entry.id === mergedProduct.categoryId) ||
      categories.find((entry) => entry.name === mergedProduct.category) ||
      categories.find((entry) => entry.slug === mergedProduct.category) ||
      categories[0];

    return {
      ...mergedProduct,
      id: mergedProduct.id || seedProduct.id || `product-${index + 1}`,
      slug:
        mergedProduct.slug ||
        seedProduct.slug ||
        String(mergedProduct.name || `product-${index + 1}`)
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, ""),
      name: mergedProduct.name || seedProduct.name || `Product ${index + 1}`,
      categoryId: mergedProduct.categoryId || seedProduct.categoryId || category?.id || "",
      category: mergedProduct.category || seedProduct.category || category?.name || "Unassigned",
      price: Number(mergedProduct.price ?? seedProduct.price ?? 0),
      originalPrice: Number(mergedProduct.originalPrice ?? seedProduct.originalPrice ?? mergedProduct.price ?? 0),
      description: mergedProduct.description ?? seedProduct.description ?? "Premium jewellery item.",
      details: mergedProduct.details ?? seedProduct.details ?? "Prepared for future backend enrichment.",
      colors: ensureArray(mergedProduct.colors, seedProduct.colors || []),
      sizes: ensureArray(mergedProduct.sizes, seedProduct.sizes || ["One Size"]),
      featured: Boolean(mergedProduct.featured ?? seedProduct.featured ?? false),
      badge: mergedProduct.badge ?? seedProduct.badge ?? "BR Edit",
      stock: Number(mergedProduct.stock ?? seedProduct.stock ?? 0),
      tags: ensureArray(mergedProduct.tags, seedProduct.tags || []),
      images: ensureArray(mergedProduct.images, seedProduct.images || []),
      status: mergedProduct.status ?? seedProduct.status ?? "Active",
    };
  });

const buildFallbackTimeline = (order = {}) => {
  const status = order.status || "Ordered";
  const orderedAt = order.createdAt || new Date().toISOString();
  const processingComplete = ["Processing", "Shipped", "Delivered"].includes(status);
  const shippedComplete = ["Shipped", "Delivered"].includes(status);
  const deliveredComplete = status === "Delivered";

  return [
    {
      id: "step-ordered",
      label: "Ordered",
      completed: true,
      timestamp: orderedAt,
      note: "Order placed successfully.",
    },
    {
      id: "step-processing",
      label: "Processing",
      completed: processingComplete,
      timestamp: processingComplete ? orderedAt : null,
      note: processingComplete ? "Order is being prepared for dispatch." : "Awaiting fulfilment.",
    },
    {
      id: "step-shipped",
      label: "Shipped",
      completed: shippedComplete,
      timestamp: shippedComplete ? orderedAt : null,
      note: shippedComplete ? "Shipment is in transit." : "Shipment details will appear after dispatch.",
    },
    {
      id: "step-delivered",
      label: "Delivered",
      completed: deliveredComplete,
      timestamp: deliveredComplete ? orderedAt : null,
      note: deliveredComplete ? "Delivered to the customer." : "Delivery confirmation pending.",
    },
  ];
};

const ensureOrders = (orders = [], products = []) =>
  ensureArray(orders, initialData.orders || []).map((order, index) => {
    const seedOrder = findMatchingSeed(initialData.orders || [], order, ["id", "orderNumber"]) || {};
    const mergedOrder = mergeDefined(seedOrder, order);
    const items = ensureArray(mergedOrder.items, seedOrder.items || []).map((item, itemIndex) => {
      const seedItem = findMatchingSeed(seedOrder.items || [], item, ["productId", "name"]) || {};
      const mergedItem = mergeDefined(seedItem, item);
      const product =
        products.find((entry) => entry.id === mergedItem.productId) ||
        products.find((entry) => entry.name === mergedItem.name);

      return {
        ...mergedItem,
        productId: mergedItem.productId || seedItem.productId || product?.id || "",
        name: mergedItem.name || seedItem.name || product?.name || `Item ${itemIndex + 1}`,
        quantity: Number(mergedItem.quantity ?? seedItem.quantity ?? 1),
        price: Number(mergedItem.price ?? seedItem.price ?? product?.price ?? 0),
        image: mergedItem.image || seedItem.image || product?.images?.[0] || "",
      };
    });
    const derivedSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      ...mergedOrder,
      id: mergedOrder.id || seedOrder.id || `order-${index + 1}`,
      userId: mergedOrder.userId || seedOrder.userId || "",
      orderNumber: mergedOrder.orderNumber || seedOrder.orderNumber || `BR-${1000 + index + 1}`,
      createdAt: mergedOrder.createdAt || seedOrder.createdAt || new Date().toISOString(),
      paymentMethod: mergedOrder.paymentMethod || seedOrder.paymentMethod || "UPI",
      paymentStatus: mergedOrder.paymentStatus || seedOrder.paymentStatus || "Paid",
      status: mergedOrder.status || seedOrder.status || "Ordered",
      subtotal: Number(mergedOrder.subtotal ?? seedOrder.subtotal ?? derivedSubtotal),
      discount: Number(mergedOrder.discount ?? seedOrder.discount ?? 0),
      shipping: Number(mergedOrder.shipping ?? seedOrder.shipping ?? 0),
      total: Number(
        mergedOrder.total ??
          seedOrder.total ??
          Math.max(derivedSubtotal - Number(mergedOrder.discount ?? seedOrder.discount ?? 0), 0)
      ),
      shippingAddress: mergeDefined(seedOrder.shippingAddress || {}, mergedOrder.shippingAddress || {}),
      items,
      timeline: ensureArray(mergedOrder.timeline, seedOrder.timeline || []).length
        ? ensureArray(mergedOrder.timeline, seedOrder.timeline || [])
        : buildFallbackTimeline(mergedOrder),
    };
  });

const ensureBlogs = (blogs = []) =>
  ensureArray(blogs, initialData.blogs || []).map((blog, index) => {
    const seedBlog = findMatchingSeed(initialData.blogs || [], blog, ["id", "slug", "title"]) || {};
    const mergedBlog = mergeDefined(seedBlog, blog);

    return {
      ...mergedBlog,
      id: mergedBlog.id || seedBlog.id || `blog-${index + 1}`,
      slug:
        mergedBlog.slug ||
        seedBlog.slug ||
        String(mergedBlog.title || `blog-${index + 1}`)
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, ""),
      title: mergedBlog.title || seedBlog.title || `Blog ${index + 1}`,
      excerpt: mergedBlog.excerpt ?? seedBlog.excerpt ?? "",
      coverImage: mergedBlog.coverImage || seedBlog.coverImage || "",
      author: mergedBlog.author || seedBlog.author || "BR Editorial Team",
      publishedAt: mergedBlog.publishedAt || seedBlog.publishedAt || new Date().toISOString(),
      readTime: mergedBlog.readTime || seedBlog.readTime || "4 min read",
      content: Array.isArray(mergedBlog.content)
        ? mergedBlog.content
        : String(mergedBlog.content || "")
            .split(/\n{2,}/)
            .map((part) => part.trim())
            .filter(Boolean),
      comments: ensureArray(mergedBlog.comments, seedBlog.comments || []),
    };
  });
const ensureContentPages = (contentPages = []) =>
  mergeRecords(contentPages, initialData.contentPages || [], (entry) => entry?.page?.toLowerCase()).map(
    (page, index) => {
      const seedPage =
        findMatchingSeed(initialData.contentPages || [], page, ["id", "page", "title"]) || {};
      const mergedPage = mergeDefined(seedPage, page);

      return {
        ...mergedPage,
        id: mergedPage.id || seedPage.id || `page-${index + 1}`,
        page: mergedPage.page || seedPage.page || `Page ${index + 1}`,
        title: mergedPage.title || seedPage.title || mergedPage.page || "Untitled page",
        body: mergedPage.body ?? seedPage.body ?? "<p>Mock content will appear here.</p>",
        updatedAt: mergedPage.updatedAt || seedPage.updatedAt || new Date().toISOString(),
      };
    }
  );

const ensureBanners = (banners = []) => {
  const seedBanners = initialData.homeContent?.banners || initialData.banners || [];

  return ensureArray(banners, seedBanners).map((banner, index) => {
    const seedBanner = findMatchingSeed(seedBanners, banner, ["id", "title", "href"]) || {};
    const mergedBanner = mergeDefined(seedBanner, banner);

    return {
      ...mergedBanner,
      id: mergedBanner.id || seedBanner.id || `banner-${index + 1}`,
      tag: mergedBanner.tag ?? seedBanner.tag ?? `Banner ${index + 1}`,
      title: mergedBanner.title || seedBanner.title || `Promotion ${index + 1}`,
      subtitle: mergedBanner.subtitle ?? seedBanner.subtitle ?? "",
      cta: mergedBanner.cta ?? seedBanner.cta ?? "Explore",
      href: mergedBanner.href ?? seedBanner.href ?? "/app/products",
      image: mergedBanner.image || seedBanner.image || "",
    };
  });
};

const ensureHomeContent = (homeContent = {}) => {
  const current = ensureObject(homeContent, initialData.homeContent || {});
  const banners = ensureBanners(current.banners);

  return {
    ...mergeDefined(initialData.homeContent || {}, current),
    heroBadge: current.heroBadge ?? initialData.homeContent?.heroBadge ?? "",
    heroEyebrow: current.heroEyebrow ?? initialData.homeContent?.heroEyebrow ?? "",
    featuredTitle: current.featuredTitle ?? initialData.homeContent?.featuredTitle ?? "",
    categoriesTitle: current.categoriesTitle ?? initialData.homeContent?.categoriesTitle ?? "",
    categoriesSubtitle: current.categoriesSubtitle ?? initialData.homeContent?.categoriesSubtitle ?? "",
    recentlyViewedTitle: current.recentlyViewedTitle ?? initialData.homeContent?.recentlyViewedTitle ?? "",
    banners,
  };
};

const buildFallbackRefundRequests = (orders = []) => {
  const deliveredOrder = orders.find((order) => order.status === "Delivered");

  if (!deliveredOrder) return [];

  return [
    {
      id: "refund-1",
      orderId: deliveredOrder.id,
      orderNumber: deliveredOrder.orderNumber,
      userId: deliveredOrder.userId,
      reason: "Received later than expected and need a refund.",
      status: "Pending",
      requestedAt: "2026-04-18T09:30:00.000Z",
      refundAmount: deliveredOrder.total,
      adminNote: "",
    },
  ];
};

const ensureRefundRequests = (refundRequests = [], orders = []) => {
  const fallbackRequests = buildFallbackRefundRequests(orders);
  const source = Array.isArray(refundRequests) ? refundRequests : fallbackRequests;

  return source.map((request, index) => {
    const seedRequest =
      findMatchingSeed(fallbackRequests, request, ["id", "orderId", "orderNumber"]) || {};
    const mergedRequest = mergeDefined(seedRequest, request);
    const order =
      orders.find((entry) => entry.id === mergedRequest.orderId) ||
      orders.find((entry) => entry.orderNumber === mergedRequest.orderNumber);

    return {
      ...mergedRequest,
      id: mergedRequest.id || seedRequest.id || `refund-${index + 1}`,
      orderId: mergedRequest.orderId || seedRequest.orderId || order?.id || "",
      orderNumber: mergedRequest.orderNumber || seedRequest.orderNumber || order?.orderNumber || "",
      userId: mergedRequest.userId || seedRequest.userId || order?.userId || "",
      reason: mergedRequest.reason || seedRequest.reason || "Customer requested a return.",
      status: mergedRequest.status || seedRequest.status || "Pending",
      requestedAt:
        mergedRequest.requestedAt || seedRequest.requestedAt || order?.createdAt || new Date().toISOString(),
      refundAmount: Number(mergedRequest.refundAmount ?? seedRequest.refundAmount ?? order?.total ?? 0),
      adminNote: mergedRequest.adminNote ?? seedRequest.adminNote ?? "",
      resolvedAt: mergedRequest.resolvedAt ?? seedRequest.resolvedAt ?? null,
    };
  });
};

const migrateDatabase = (db) => {
  const source = ensureObject(db, initialData);
  const users = ensureUsers(ensureArray(source.users, initialData.users || []));
  const categories = clone(ensureCategories(source.categories));
  const products = clone(ensureProducts(source.products, categories));
  const orders = clone(ensureOrders(source.orders, products));
  const blogs = clone(ensureBlogs(source.blogs));
  const contentPages = clone(ensureContentPages(source.contentPages));
  const homeContent = clone(ensureHomeContent(source.homeContent));

  return {
    ...clone(initialData),
    ...source,
    users,
    products,
    categories,
    blogs,
    contentPages,
    homeContent,
    banners: clone(homeContent.banners || []),
    coupons: ensureCoupons(ensureArray(source.coupons, initialData.coupons || [])),
    refundRequests: ensureRefundRequests(source.refundRequests, orders),
    orders,
    carts: ensureObject(source.carts, initialData.carts || {}),
    favorites: ensureObject(source.favorites, initialData.favorites || {}),
    recentlyViewed: ensureObject(source.recentlyViewed, initialData.recentlyViewed || {}),
  };
};

const readDatabase = () => {
  const stored = localStorage.getItem(appConfig.mockDatabaseKey);

  if (!stored) {
    const seeded = migrateDatabase(initialData);
    localStorage.setItem(appConfig.mockDatabaseKey, JSON.stringify(seeded));
    return clone(seeded);
  }

  const migrated = migrateDatabase(JSON.parse(stored));
  localStorage.setItem(appConfig.mockDatabaseKey, JSON.stringify(migrated));
  return clone(migrated);
};

const writeDatabase = (value) => {
  localStorage.setItem(appConfig.mockDatabaseKey, JSON.stringify(value));
  return clone(value);
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withDelay = async (handler) => {
  // Reduced artificial delay to make the UI and database queries load instantly
  await delay(10 + Math.round(Math.random() * 15));
  return handler();
};

export const mockApiClient = {
  async query(handler) {
    return withDelay(() => handler(readDatabase()));
  },
  async mutate(handler) {
    return withDelay(() => {
      const draft = readDatabase();
      const nextValue = handler(draft) || draft;
      return writeDatabase(nextValue);
    });
  },
  reset() {
    const seeded = migrateDatabase(initialData);
    localStorage.setItem(appConfig.mockDatabaseKey, JSON.stringify(seeded));
    return clone(seeded);
  },
};
