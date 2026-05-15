import { mockApiClient } from "../../shared/services/mockApiClient";

export const analyticsService = {
  async getSummary() {
    return mockApiClient.query((db) => {
      const favoriteEntries = Object.values(db.favorites || {}).flat();
      const viewedEntries = Object.values(db.recentlyViewed || {}).flat();

      const countByProduct = (entries = []) =>
        db.products
          .map((product) => ({
            id: product.id,
            name: product.name,
            count: entries.filter((entry) => entry === product.id).length,
          }))
          .sort((left, right) => right.count - left.count)
          .slice(0, 5);

      const categoryBreakdown = db.categories.map((category) => ({
        id: category.id,
        name: category.name,
        productCount: db.products.filter((product) => product.categoryId === category.id).length,
      }));

      const topSelling = db.products
        .map((product) => {
          const soldCount = db.orders.reduce((sum, order) => {
            const line = order.items.find((item) => item.productId === product.id);
            return sum + (line?.quantity || 0);
          }, 0);

          return {
            id: product.id,
            name: product.name,
            soldCount,
            featured: product.featured,
          };
        })
        .sort((left, right) => right.soldCount - left.soldCount)
        .slice(0, 5);

      return {
        revenue: db.orders.reduce((sum, order) => sum + order.total, 0),
        orders: db.orders.length,
        refunds: db.refundRequests.length,
        featuredProducts: db.products.filter((product) => product.featured).length,
        categoryBreakdown,
        topSelling,
        mostViewed: countByProduct(viewedEntries),
        mostLiked: countByProduct([...favoriteEntries, ...viewedEntries]),
        mostFavorited: countByProduct(favoriteEntries),
      };
    });
  },
};
