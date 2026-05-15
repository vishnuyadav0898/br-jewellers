import { mockApiClient } from "../../shared/services/mockApiClient";
import { initialData } from "../../mock/data";

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

export const storefrontService = {
  async getHomeSnapshot(userId = null) {
    return mockApiClient.query((db) => ({
      homeContent: db.homeContent || {},
      banners: db.homeContent?.banners || [],
      featuredProducts: db.products.slice(0, 6).map((product) => enrichProduct(db, product, userId)),
      categories: db.categories,
      activeCoupons: db.coupons.filter((entry) => entry.isEnabled).slice(0, 3),
    }));
  },

  async getProducts(search = "", userId = null) {
    return mockApiClient.query((db) => {
      const query = search.trim().toLowerCase();

      return db.products
        .filter((product) => {
          if (!query) return true;
          return (
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            product.tags.some((tag) => tag.toLowerCase().includes(query))
          );
        })
        .map((product) => enrichProduct(db, product, userId));
    });
  },

  async getProductById(identifier, userId = null) {
    return mockApiClient.query((db) => {
      const product = db.products.find((entry) => entry.id === identifier || entry.slug === identifier);

      if (!product) {
        throw new Error("This product could not be found.");
      }

      const reviews = getProductReviews(db, product.id).sort(
        (left, right) => new Date(right.createdAt) - new Date(left.createdAt)
      );

      return {
        product: enrichProduct(db, product, userId),
        reviews,
        relatedProducts: db.products
          .filter((entry) => entry.categoryId === product.categoryId && entry.id !== product.id)
          .slice(0, 3)
          .map((entry) => enrichProduct(db, entry, userId)),
      };
    });
  },

  async toggleFavorite(userId, productId) {
    return mockApiClient.mutate((db) => {
      if (!db.favorites[userId]) {
        db.favorites[userId] = [];
      }

      const isFavorite = db.favorites[userId].includes(productId);
      db.favorites[userId] = isFavorite
        ? db.favorites[userId].filter((entry) => entry !== productId)
        : [productId, ...db.favorites[userId]];

      return db;
    }).then((db) => db.favorites[userId] || []);
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
    return mockApiClient.query((db) => hydrateCart(db, userId, couponCode));
  },

  async updateCartQuantity(userId, itemId, nextQuantity) {
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
    return mockApiClient.query((db) =>
      db.orders
        .filter((order) => order.userId === userId)
        .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    );
  },

  async getOrderById(orderId, userId) {
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
        .sort((left, right) => new Date(right.requestedAt) - new Date(left.requestedAt))
    );
  },

  async getContentPage(page) {
    return mockApiClient.query((db) => {
      const contentPages =
        Array.isArray(db.contentPages) && db.contentPages.length
          ? db.contentPages
          : initialData.contentPages || [];
      const fallbackPage =
        (initialData.contentPages || []).find((entry) => entry.page.toLowerCase() === page.toLowerCase()) || null;
      const contentPage = contentPages.find(
        (entry) => entry.page.toLowerCase() === page.toLowerCase()
      );

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
};
