import { apiClient } from "../../shared/services/apiClient";
import { mockApiClient } from "../../shared/services/mockApiClient";
import { initialData } from "../../mock/data";
import { catalogService } from "../../admin/services/catalogService";

const isApiFallbackError = (error) => false;

const getProductReviews = (db, productId) =>
  (db.reviews || []).filter((entry) => entry.productId === productId);

const enrichProduct = (db, product, userId = null) => {
  const reviews = getProductReviews(db, product.id);
  const rating = reviews.length
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : 0;

  return {
    ...product,
    rating,
    reviewCount: reviews.length,
    isFavorite: userId ? (db.favorites[userId] || []).includes(product.id) : false,
  };
};

const buildSummary = (items = [], coupon = null) => {
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const discount = coupon ? Math.min(Math.round((subtotal * coupon.discountPercent) / 100), subtotal) : 0;
  const shipping = subtotal > 0 ? 0 : 0;

  return {
    subtotal,
    discount,
    shipping,
    total: Math.max(subtotal - discount + shipping, 0),
  };
};

const hydrateCart = (db, userId, couponCode = "") => {
  const items = (db.carts[userId] || [])
    .map((entry) => {
      const product = db.products.find((productRecord) => productRecord.id === entry.productId);

      if (!product) return null;

      return {
        ...entry,
        name: product.name,
        slug: product.slug,
        image: product.images[0],
        price: product.price,
      };
    })
    .filter(Boolean);

  const coupon = db.coupons.find((entry) => entry.code === couponCode) || null;

  return {
    items,
    coupon,
    ...buildSummary(items, coupon),
  };
};

const validateCoupon = (coupon) => {
  if (!coupon) throw new Error("Coupon was not found.");
  if (!coupon.isEnabled) throw new Error("This coupon is currently disabled.");
  if (new Date(coupon.expiresAt).getTime() < Date.now()) throw new Error("This coupon has expired.");
  if (coupon.usageCount >= coupon.usageLimit) throw new Error("This coupon has reached its usage limit.");
  return coupon;
};

const buildFallbackTimeline = (order) => {
  const stepLabels = ["Ordered", "Processing", "Shipped", "Delivered"];
  const currentStepIndex = Math.max(stepLabels.indexOf(order?.status), 0);

  return stepLabels.map((label, index) => ({
    id: `${order?.id || "order"}-${label.toLowerCase()}`,
    label,
    completed: index <= currentStepIndex,
    timestamp: index <= currentStepIndex ? order?.createdAt || new Date().toISOString() : null,
    note:
      index <= currentStepIndex
        ? `${label} status is updated and confirmed.`
        : "Awaiting the next update in the fulfilment timeline.",
  }));
};

const mapBackendStatusToFrontend = (status) => {
  if (!status) return "Pending";
  const lower = status.toLowerCase();
  if (lower === "confirmed") return "Ordered";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const normalizeApiOrder = (order = {}) => {
  const items = (Array.isArray(order.items) ? order.items : []).map((item) => ({
    productId: item.product?._id || item.product,
    sku: item.sku || "",
    quantity: item.quantity || 1,
    name: item.product?.name || "Premium Jewellery Item",
    image: item.product?.coverImage || item.product?.images?.[0] || "",
    price: item.price?.INR || 0,
  }));

  const shippingAddress = {
    name: order.shippingAddress?.fullName || "",
    line1: order.shippingAddress?.line1 || "",
    city: order.shippingAddress?.city || "",
    state: order.shippingAddress?.state || "",
    pincode: order.shippingAddress?.zip || "",
  };

  const status = mapBackendStatusToFrontend(order.status);

  return {
    id: order._id || order.id,
    orderNumber: order.orderNumber || `ORD-${String(order._id || "").slice(-6).toUpperCase()}`,
    createdAt: order.createdAt,
    customerName: order.user?.name || "Customer",
    customerEmail: order.user?.email || "",
    total: order.totalAmount?.INR || 0,
    status,
    paymentStatus: order.paymentStatus || "Paid",
    shippingAddress,
    items,
    timeline: buildFallbackTimeline({
      status,
      createdAt: order.createdAt,
    }),
  };
};

const normalizeApiCart = (cart = {}) => {
  const items = (Array.isArray(cart.items) ? cart.items : [])
    .map((entry) => {
      const product = entry.product;
      if (!product) return null;

      // Find variant to get price and attributes
      const variant = Array.isArray(product.variants)
        ? product.variants.find((v) => v.sku === entry.sku)
        : null;

      let price = 0;
      if (variant && Array.isArray(variant.prices)) {
        const p = variant.prices.find((pr) => pr.currency === "INR");
        if (p) price = p.amount;
      }
      if (!price && product.price) price = product.price;

      const attributes = variant?.attributes || {};
      const color =
        attributes.color ||
        (typeof attributes.get === "function" ? attributes.get("color") : "") ||
        "Default";
      const size =
        attributes.size ||
        (typeof attributes.get === "function" ? attributes.get("size") : "") ||
        "Standard";

      return {
        id: entry._id || entry.id,
        productId: product._id || product.id,
        name: product.name,
        slug: product.slug || "",
        image: product.coverImage || product.images?.[0] || "",
        price,
        quantity: entry.quantity,
        selectedColor: color,
        selectedSize: size,
        sku: entry.sku,
      };
    })
    .filter(Boolean);

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return {
    items,
    coupon: null,
    subtotal,
    discount: 0,
    shipping: 0,
    total: subtotal,
  };
};

export const storefrontService = {
  async getHomeSnapshot(userId = null) {
    const products = await catalogService.getProducts("");
    const categories = await catalogService.getCategories().catch(() => []);
    const content = await mockApiClient.query((db) => ({
      homeContent: db.homeContent || {},
      banners: db.homeContent?.banners || [],
      activeCoupons: db.coupons.filter((entry) => entry.isEnabled).slice(0, 3),
    }));

    return {
      ...content,
      featuredProducts: products.slice(0, 6).map((product) => ({
        ...product,
        rating: 0,
        reviewCount: 0,
        isFavorite: false,
      })),
      categories,
    };
  },

  async getProducts(search = "", userId = null) {
    const products = await catalogService.getProducts(search);
    return products.map((product) => ({
      ...product,
      rating: 0,
      reviewCount: 0,
      isFavorite: false,
    }));
  },

  async getProductById(identifier, userId = null) {
    const product = await catalogService.getProductById(identifier);
    const relatedProducts = (await catalogService.getProducts(""))
      .filter((entry) => entry.category === product.category && entry.id !== product.id)
      .slice(0, 3)
      .map((entry) => ({
        ...entry,
        rating: 0,
        reviewCount: 0,
        isFavorite: false,
      }));

    return {
      product: {
        ...product,
        rating: 0,
        reviewCount: 0,
        isFavorite: false,
      },
      reviews: [],
      relatedProducts,
    };
  },

  async toggleFavorite(userId, productId) {
    return mockApiClient
      .mutate((db) => {
        if (!db.favorites[userId]) {
          db.favorites[userId] = [];
        }

        const isFavorite = db.favorites[userId].includes(productId);
        db.favorites[userId] = isFavorite
          ? db.favorites[userId].filter((entry) => entry !== productId)
          : [productId, ...db.favorites[userId]];

        return db;
      })
      .then((db) => db.favorites[userId] || []);
  },

  async getFavorites(userId) {
    return mockApiClient.query((db) =>
      (db.favorites[userId] || [])
        .map((productId) => db.products.find((product) => product.id === productId))
        .filter(Boolean)
        .map((product) => enrichProduct(db, product, userId))
    );
  },

  async addToCart(userId, productId) {
    try {
      const product = await catalogService.getProductById(productId);
      const defaultVariant = product.variants?.find((v) => v.isDefault) || product.variants?.[0];
      const sku = defaultVariant?.sku;

      if (sku) {
        await apiClient.post("/api/v1/cart/add", {
          productId,
          sku,
          quantity: 1,
        });
        return true;
      }
    } catch (error) {
      if (!isApiFallbackError(error)) throw error;
    }

    return mockApiClient.mutate((db) => {
      if (!db.carts[userId]) db.carts[userId] = [];

      const existingItem = db.carts[userId].find((entry) => entry.productId === productId);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        const product = db.products.find((entry) => entry.id === productId);

        db.carts[userId].unshift({
          id: crypto.randomUUID(),
          productId,
          quantity: 1,
          selectedColor: product?.colors?.[0]?.name || "Default",
          selectedSize: product?.sizes?.[0] || "Standard",
        });
      }

      return db;
    });
  },

  async getCart(userId, couponCode = "") {
    try {
      const cart = await apiClient.get("/api/v1/cart/");
      return normalizeApiCart(cart);
    } catch (error) {
      if (!isApiFallbackError(error)) throw error;
    }

    return mockApiClient.query((db) => hydrateCart(db, userId, couponCode));
  },

  async updateCartQuantity(userId, itemId, nextQuantity) {
    try {
      await apiClient.patch(`/api/v1/cart/item/${itemId}`, {
        quantity: nextQuantity,
      });
      return true;
    } catch (error) {
      if (!isApiFallbackError(error)) throw error;
    }

    return mockApiClient.mutate((db) => {
      db.carts[userId] = (db.carts[userId] || []).flatMap((entry) => {
        if (entry.id !== itemId) return [entry];
        if (nextQuantity <= 0) return [];
        return [{ ...entry, quantity: nextQuantity }];
      });

      return db;
    });
  },

  async removeCartItem(userId, itemId) {
    try {
      await apiClient.delete(`/api/v1/cart/item/${itemId}`);
      return true;
    } catch (error) {
      if (!isApiFallbackError(error)) throw error;
    }

    return mockApiClient.mutate((db) => {
      db.carts[userId] = (db.carts[userId] || []).filter((entry) => entry.id !== itemId);
      return db;
    });
  },

  async applyCoupon(code) {
    return mockApiClient.query((db) => {
      const coupon = db.coupons.find((entry) => entry.code === code.toUpperCase());
      return validateCoupon(coupon);
    });
  },

  async getOrders(userId) {
    try {
      const orders = await apiClient.get("/api/v1/orders");
      return (Array.isArray(orders) ? orders : []).map(normalizeApiOrder);
    } catch (error) {
      if (!isApiFallbackError(error)) throw error;
    }

    return mockApiClient.query((db) =>
      db.orders
        .filter((order) => order.userId === userId)
        .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    );
  },

  async getOrderById(orderId, userId) {
    try {
      const order = await apiClient.get(`/api/v1/orders/${orderId}`);
      return normalizeApiOrder(order);
    } catch (error) {
      if (!isApiFallbackError(error)) throw error;
    }

    return mockApiClient.query((db) => {
      const order = db.orders.find((entry) => entry.id === orderId && entry.userId === userId);
      if (!order) {
        throw new Error("We couldn't find that order.");
      }
      return order;
    });
  },

  async getRefundRequests(userId) {
    return mockApiClient.query((db) =>
      db.refundRequests
        .filter((request) => request.userId === userId)
        .sort((left, right) => new Date(request.requestedAt) - new Date(left.requestedAt))
    );
  },

  async getContentPage(page) {
    return mockApiClient.query((db) => {
      const contentPages =
        Array.isArray(db.contentPages) && db.contentPages.length
          ? db.contentPages
          : initialData.contentPages || [];
      const fallbackPage =
        (initialData.contentPages || []).find(
          (entry) => entry.page.toLowerCase() === page.toLowerCase()
        ) || null;
      const contentPage = contentPages.find((entry) => entry.page.toLowerCase() === page.toLowerCase());

      if (!contentPage && !fallbackPage) {
        throw new Error("Content page not found.");
      }

      return {
        ...(fallbackPage || {}),
        ...(contentPage || {}),
      };
    });
  },

  async requestReturn(userId, { orderId, reason }) {
    return mockApiClient.mutate((db) => {
      const order = db.orders.find((entry) => entry.id === orderId && entry.userId === userId);
      if (!order) throw new Error("Order not found.");

      const existing = db.refundRequests.find((entry) => entry.orderId === orderId);
      if (existing) throw new Error("A return request already exists for this order.");

      db.refundRequests.unshift({
        id: crypto.randomUUID(),
        orderId,
        orderNumber: order.orderNumber,
        userId,
        reason,
        status: "Pending",
        requestedAt: new Date().toISOString(),
        refundAmount: order.total,
        adminNote: "",
      });

      return db;
    });
  },

  // Address and checkout management
  async getAddresses(userId) {
    const response = await apiClient.get("/api/v1/address/");
    return Array.isArray(response) ? response : [];
  },

  async createAddress(userId, payload) {
    const response = await apiClient.post("/api/v1/address/", {
      label: payload.label || "Home",
      fullName: payload.fullName,
      phone: payload.phone,
      line1: payload.line1,
      line2: payload.line2 || "",
      city: payload.city,
      state: payload.state,
      zip: payload.zip,
      country: payload.country || "India",
      isDefault: Boolean(payload.isDefault),
    });
    return response;
  },

  async updateAddress(userId, addressId, payload) {
    const response = await apiClient.patch(`/api/v1/address/${addressId}`, {
      label: payload.label,
      fullName: payload.fullName,
      phone: payload.phone,
      line1: payload.line1,
      line2: payload.line2,
      city: payload.city,
      state: payload.state,
      zip: payload.zip,
      country: payload.country,
      isDefault: Boolean(payload.isDefault),
    });
    return response;
  },

  async deleteAddress(userId, addressId) {
    const response = await apiClient.delete(`/api/v1/address/${addressId}`);
    return response;
  },

  async createOrder(userId, { addressId }) {
    try {
      const response = await apiClient.post("/api/v1/orders/", {
        addressId,
      });
      return response;
    } catch (error) {
      if (!isApiFallbackError(error)) throw error;
      throw error;
    }
  },
};
