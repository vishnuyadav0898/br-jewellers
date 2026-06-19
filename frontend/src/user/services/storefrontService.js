import { apiClient } from "../../shared/services/apiClient";
import { mockApiClient } from "../../shared/services/mockApiClient";
import { initialData } from "../../mock/data";
import { catalogService } from "../../admin/services/catalogService";
import { useAppStore } from "../../shared/store/useAppStore";

const isApiFallbackError = (error) => false;

const isProductInWishlist = (product, user) => {
  if (!user || !user.wishlist || !Array.isArray(user.wishlist)) return false;
  const productId = product.id || product._id;
  return user.wishlist.some(item => {
    if (typeof item === "string") return item === productId;
    return item?.id === productId || item?._id === productId;
  });
};

const getProductReviews = (db, productId) =>
  (db.reviews || []).filter((entry) => entry.productId === productId);

const enrichProduct = (db, product, userId = null) => {
  const normalized = catalogService.normalizeApiProduct(product);
  const reviews = getProductReviews(db, normalized.id);
  const rating = reviews.length
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : 0;

  const user = useAppStore.getState().user;

  return {
    ...normalized,
    rating,
    reviewCount: reviews.length,
    isFavorite: isProductInWishlist(normalized, user) || (userId ? (db.favorites[userId] || []).includes(normalized.id) : false),
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

const resolveAndValidateCoupon = async (code, subtotal) => {
  if (!code) return null;
  let coupon = null;
  
  try {
    const res = await apiClient.get("/api/v1/coupons/list");
    const raw = res.data || res || {};
    const coupons = Array.isArray(raw.data) ? raw.data : (Array.isArray(raw) ? raw : []);
    coupon = coupons.find((c) => c.code === code.toUpperCase());
  } catch (err) {
    console.warn("Failed to fetch coupon from backend, falling back to mock database:", err);
  }

  if (!coupon) {
    coupon = mockApiClient.query((db) => 
      (db.coupons || []).find((entry) => entry.code === code.toUpperCase())
    );
  }

  if (!coupon) {
    throw new Error("Coupon was not found.");
  }

  const isActive = typeof coupon.isActive === "boolean" ? coupon.isActive : coupon.isEnabled;
  if (!isActive) throw new Error("This coupon is currently disabled.");
  
  const endDate = coupon.endDate || coupon.expiresAt;
  if (endDate && new Date(endDate).getTime() < Date.now()) {
    throw new Error("This coupon has expired.");
  }
  
  const usageCount = coupon.totalUsedCount ?? coupon.usageCount ?? 0;
  const usageLimit = coupon.usageLimit;
  if (usageLimit && usageCount >= usageLimit) {
    throw new Error("This coupon has reached its usage limit.");
  }

  const minOrderINR = coupon.minOrderAmount?.INR ?? coupon.minOrderAmount ?? 0;
  if (subtotal < minOrderINR) {
    throw new Error(`Minimum order amount of ₹${minOrderINR} is required to use this coupon.`);
  }

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

const formatSkuName = (sku = "") => {
  if (!sku) return "Premium Jewellery Item";
  return sku
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const normalizeApiOrder = (order = {}) => {
  const items = (Array.isArray(order.items) ? order.items : []).map((item) => ({
    productId: item.product?._id || item.product,
    sku: item.sku || "",
    quantity: item.quantity || 1,
    name: item.product?.name || formatSkuName(item.sku),
    image: item.product?.coverImage || item.product?.images?.[0] || "",
    price: item.price?.INR || 0,
  }));

  const shippingAddress = {
    name: order.shippingAddress?.fullName || order.shippingAddress?.name || "",
    line1: order.shippingAddress?.line1 || "",
    city: order.shippingAddress?.city || "",
    state: order.shippingAddress?.state || "",
    pincode: order.shippingAddress?.zip || order.shippingAddress?.pincode || "",
  };

  const status = mapBackendStatusToFrontend(order.status);

  return {
    id: order._id || order.id,
    orderNumber: order.orderNumber || `ORD-${String(order._id || "").slice(-6).toUpperCase()}`,
    createdAt: order.createdAt,
    customerName: order.user?.name || order.shippingAddress?.fullName || "Customer",
    customerEmail: order.user?.email || order.shippingAddress?.phone || "",
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
      if (!product || typeof product !== "object") return null;

      // Find variant to get price and attributes
      const variant = Array.isArray(product.variants)
        ? product.variants.find((v) => v.sku === entry.sku)
        : null;

      let price = 0;
      if (variant && Array.isArray(variant.prices)) {
        const p = variant.prices.find((pr) => pr.currency === "INR");
        if (p) price = p.amount;
      }
      // Fallback: try priceRange or direct price field
      if (!price && product.priceRange?.min) price = product.priceRange.min;
      if (!price && product.price) price = product.price;

      const attributes = variant?.attributes || {};
      const getAttr = (key) =>
        attributes[key] ||
        (typeof attributes.get === "function" ? attributes.get(key) : "") ||
        "";

      const color = getAttr("color") || "Default";
      const size = getAttr("size") || "Standard";

      // Build image url: try coverImage, then images array
      const image =
        product.coverImage ||
        (Array.isArray(product.images) ? product.images[0] : "") ||
        "";

      return {
        id: entry._id || entry.id,
        productId: product._id || product.id,
        name: product.name || "Jewellery Item",
        slug: product.slug || "",
        image,
        price,
        quantity: entry.quantity || 1,
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
    }));

    let activeCoupons = [];
    try {
      const res = await apiClient.get("/api/v1/coupons/list");
      const raw = res.data || res || {};
      const list = Array.isArray(raw.data) ? raw.data : (Array.isArray(raw) ? raw : []);
      activeCoupons = list.filter((c) => c.isActive).slice(0, 3).map((c) => ({
        id: c._id || c.id,
        code: c.code,
        name: c.name,
        description: c.description,
        discountPercent: c.discountType === "percentage" ? c.discountValue : 10,
        isActive: c.isActive,
      }));
    } catch (e) {
      console.warn("Failed to fetch coupons from backend for home snapshot:", e);
      activeCoupons = await mockApiClient.query((db) =>
        (db.coupons || []).filter((entry) => entry.isEnabled || entry.isActive).slice(0, 3).map((c) => ({
          id: c._id || c.id,
          code: c.code,
          name: c.name,
          description: c.description,
          discountPercent: c.discountPercent || c.discountValue || 10,
          isActive: c.isActive || c.isEnabled,
        }))
      );
    }

    const user = useAppStore.getState().user;

    return {
      ...content,
      activeCoupons,
      featuredProducts: products
        .filter((product) => product.featured === true)
        .map((product) => ({
          ...product,
          rating: 0,
          reviewCount: 0,
          isFavorite: isProductInWishlist(product, user),
        })),
      categories,
    };
  },

  async getProducts(search = "", options = {}) {
    const products = await catalogService.getProducts(search, options);
    const user = useAppStore.getState().user;
    return products.map((product) => ({
      ...product,
      rating: 0,
      reviewCount: 0,
      isFavorite: isProductInWishlist(product, user),
    }));
  },

  async getProductById(identifier, userId = null) {
    const product = await catalogService.getProductById(identifier);
    const user = useAppStore.getState().user;
    const relatedProducts = (await catalogService.getProducts(""))
      .filter((entry) => entry.category === product.category && entry.id !== product.id)
      .slice(0, 3)
      .map((entry) => ({
        ...entry,
        rating: 0,
        reviewCount: 0,
        isFavorite: isProductInWishlist(entry, user),
      }));

    return {
      product: {
        ...product,
        rating: 0,
        reviewCount: 0,
        isFavorite: isProductInWishlist(product, user),
      },
      reviews: [],
      relatedProducts,
    };
  },

  async toggleFavorite(userId, productId) {
    try {
      const user = useAppStore.getState().user;
      const wishlist = user?.wishlist || [];
      const isFavorite = wishlist.some(item => {
        if (typeof item === "string") return item === productId;
        return item?.id === productId || item?._id === productId;
      });

      if (isFavorite) {
        await apiClient.delete(`/api/v1/wishlist/remove/${productId}`);
        const updatedWishlist = wishlist.filter(item => {
          const id = typeof item === "string" ? item : (item?.id || item?._id);
          return id !== productId;
        });
        useAppStore.getState().setUser({
          ...user,
          wishlist: updatedWishlist,
        });
        return updatedWishlist;
      } else {
        await apiClient.post("/api/v1/wishlist/add", { productId });
        const updatedWishlist = [...wishlist, productId];
        useAppStore.getState().setUser({
          ...user,
          wishlist: updatedWishlist,
        });
        return updatedWishlist;
      }
    } catch (e) {
      console.warn("API toggleFavorite failed, falling back to mock:", e);
      return mockApiClient
        .mutate((db) => {
          if (!db.favorites[userId]) {
            db.favorites[userId] = [];
          }
          const isFav = db.favorites[userId].includes(productId);
          db.favorites[userId] = isFav
            ? db.favorites[userId].filter((entry) => entry !== productId)
            : [productId, ...db.favorites[userId]];
          return db;
        })
        .then((db) => db.favorites[userId] || []);
    }
  },

  async getFavorites(userId) {
    try {
      const res = await apiClient.get("/api/v1/wishlist");
      if (res && Array.isArray(res.products)) {
        const user = useAppStore.getState().user;
        if (user) {
          useAppStore.getState().setUser({
            ...user,
            wishlist: res.products,
          });
        }
        return res.products.map((p) => {
          const id = p._id || p.id;
          return {
            ...p,
            id,
            rating: 0,
            reviewCount: 0,
            isFavorite: true,
          };
        });
      }
    } catch (e) {
      console.warn("API getFavorites failed, falling back to mock:", e);
    }

    return mockApiClient.query((db) =>
      (db.favorites[userId] || [])
        .map((productId) => db.products.find((product) => product.id === productId))
        .filter(Boolean)
        .map((product) => enrichProduct(db, product, userId))
    );
  },

  // addToCart — accepts sku directly from the caller (no extra product API call needed)
  async addToCart(userId, productId, sku, quantity = 1) {
    if (!sku) throw new Error("No variant SKU available for this product.");

    await apiClient.post("/api/v1/cart/add", {
      productId,
      sku,
      quantity,
    });
    return true;
  },

  async getCart(userId, couponCode = "") {
    const cart = await apiClient.get("/api/v1/cart/");
    const normalized = normalizeApiCart(cart);
    
    if (couponCode) {
      try {
        const coupon = await resolveAndValidateCoupon(couponCode, normalized.subtotal);
        if (coupon) {
          let discount = 0;
          const discountValue = coupon.discountValue ?? coupon.discountPercent ?? 0;
          if (coupon.discountType === "fixed" || coupon.fixedDiscountValue) {
            const fixedINR = coupon.fixedDiscountValue?.INR ?? coupon.fixedDiscountValue ?? 0;
            discount = Math.min(fixedINR, normalized.subtotal);
          } else {
            discount = Math.round((normalized.subtotal * discountValue) / 100);
            const maxDiscountINR = coupon.maxDiscount?.INR ?? coupon.maxDiscount ?? 0;
            if (maxDiscountINR > 0) {
              discount = Math.min(discount, maxDiscountINR);
            }
          }
          
          normalized.coupon = {
            id: coupon._id || coupon.id,
            code: coupon.code,
            name: coupon.name,
            discountPercent: coupon.discountType === "percentage" ? discountValue : 0,
            discountType: coupon.discountType || "percentage",
            fixedDiscountValue: coupon.fixedDiscountValue,
          };
          normalized.discount = discount;
          normalized.total = Math.max(normalized.subtotal - discount, 0);
        }
      } catch (err) {
        console.warn("Coupon validation failed:", err.message);
        useAppStore.getState().setCartCouponCode("");
        throw err;
      }
    }
    return normalized;
  },

  async updateCartQuantity(userId, itemId, nextQuantity) {
    // Quantity 0 or below — remove the item entirely
    if (nextQuantity <= 0) {
      return storefrontService.removeCartItem(userId, itemId);
    }
    await apiClient.patch(`/api/v1/cart/item/${itemId}`, { quantity: nextQuantity });
    return true;
  },

  async removeCartItem(userId, itemId) {
    await apiClient.delete(`/api/v1/cart/item/${itemId}`);
    return true;
  },

  async applyCoupon(code) {
    const cartRes = await storefrontService.getCart(null, code);
    if (!cartRes.coupon) {
      throw new Error("Invalid coupon or minimum order value not met.");
    }
    return cartRes.coupon;
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
    const response = await apiClient.get("/api/v1/address");
    return Array.isArray(response) ? response : [];
  },

  async createAddress(userId, payload) {
    const response = await apiClient.post("/api/v1/address", {
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
      const response = await apiClient.post("/api/v1/orders", {
        addressId,
      });
      return response;
    } catch (error) {
      if (!isApiFallbackError(error)) throw error;
      throw error;
    }
  },
};
