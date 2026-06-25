import { apiClient } from "../../shared/services/apiClient";
import { mockApiClient } from "../../shared/services/mockApiClient";
import { catalogService as adminCatalogService } from "../../shared/services/catalogService";
import { useAppStore } from "../../shared/store/useAppStore";

const isProductInWishlist = (product, user) => {
  if (!user || !user.wishlist || !Array.isArray(user.wishlist)) return false;
  const productId = product.id || product._id;
  return user.wishlist.some(item => {
    if (typeof item === "string") return item === productId;
    return item?.id === productId || item?._id === productId;
  });
};

export const catalogService = {
  async getHomeSnapshot(userId = null) {
    const products = await adminCatalogService.getProducts("", { featured: true });
    const categories = await adminCatalogService.getCategories().catch(() => []);
    const content = await mockApiClient.query((db) => ({
      homeContent: db.homeContent || {},
      banners: db.homeContent?.banners || [],
    }));

    const user = useAppStore.getState().user;

    return {
      ...content,
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
    const products = await adminCatalogService.getProducts(search, options);
    const user = useAppStore.getState().user;
    return products.map((product) => ({
      ...product,
      rating: 0,
      reviewCount: 0,
      isFavorite: isProductInWishlist(product, user),
    }));
  },

  async getProductById(identifier, userId = null) {
    const product = await adminCatalogService.getProductById(identifier);
    const user = useAppStore.getState().user;
    const relatedProducts = (await adminCatalogService.getProducts("", { category: product.category }))
      .filter((entry) => entry.id !== product.id)
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
  }
};
