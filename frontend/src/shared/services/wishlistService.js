import { apiClient } from "./apiClient";
import { mockApiClient } from "./mockApiClient";
import { useAppStore } from "../store/useAppStore";
import { catalogService as adminCatalogService } from "./catalogService";

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
  const normalized = adminCatalogService.normalizeApiProduct(product);
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

export const wishlistService = {
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
  }
};
