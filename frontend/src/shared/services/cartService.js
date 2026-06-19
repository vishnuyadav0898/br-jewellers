import { apiClient } from "./apiClient";
import { mockApiClient } from "./mockApiClient";
import { useAppStore } from "../store/useAppStore";

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

export const cartService = {
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
    if (nextQuantity <= 0) {
      return cartService.removeCartItem(userId, itemId);
    }
    await apiClient.patch(`/api/v1/cart/item/${itemId}`, { quantity: nextQuantity });
    return true;
  },

  async removeCartItem(userId, itemId) {
    await apiClient.delete(`/api/v1/cart/item/${itemId}`);
    return true;
  },

  async applyCoupon(code) {
    const cartRes = await cartService.getCart(null, code);
    if (!cartRes.coupon) {
      throw new Error("Invalid coupon or minimum order value not met.");
    }
    return cartRes.coupon;
  }
};
