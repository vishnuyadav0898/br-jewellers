import { mockApiClient } from "../../shared/services/mockApiClient";
import { initialData } from "../../mock/data";

const defaultHomeContent = initialData.homeContent || {};
const defaultContentPages = initialData.contentPages || [];
const getFallbackPage = (page) =>
  defaultContentPages.find((entry) => entry.page.toLowerCase() === page.toLowerCase()) || {
    id: `page-${page.toLowerCase()}`,
    page,
    title: `${page} page`,
    body: "<p>Mock content will appear here.</p>",
    updatedAt: new Date().toISOString(),
  };
const normalizeHomeContent = (value = {}) => ({
  ...defaultHomeContent,
  ...(value && typeof value === "object" ? value : {}),
  banners: Array.isArray(value?.banners) && value.banners.length ? value.banners : defaultHomeContent.banners || [],
});

export const contentService = {
  async getHomeContent() {
    return mockApiClient.query((db) => normalizeHomeContent(db.homeContent));
  },

  async updateHomeContent(payload) {
    return mockApiClient.mutate((db) => {
      db.homeContent = normalizeHomeContent({
        ...db.homeContent,
        ...payload,
      });
      db.banners = db.homeContent.banners;
      return db;
    });
  },

  async getPageContent(page) {
    return mockApiClient.query((db) => {
      const contentPages = Array.isArray(db.contentPages) ? db.contentPages : [];
      const fallbackPage = getFallbackPage(page);
      const contentPage = contentPages.find(
        (entry) => entry.page.toLowerCase() === page.toLowerCase()
      );

      return {
        ...fallbackPage,
        ...(contentPage || {}),
        updatedAt: contentPage?.updatedAt || fallbackPage.updatedAt,
      };
    });
  },

  async updatePageContent(pageId, payload) {
    return mockApiClient.mutate((db) => {
      if (!Array.isArray(db.contentPages)) {
        db.contentPages = [...defaultContentPages];
      }

      const contentPage = db.contentPages.find((entry) => entry.id === pageId);

      if (!contentPage) {
        db.contentPages.unshift({
          ...getFallbackPage(payload.page || pageId.replace(/^page-/, "")),
          id: pageId,
          title: payload.title || "Untitled page",
          body: payload.body || "<p>Mock content will appear here.</p>",
          updatedAt: new Date().toISOString(),
        });
        return db;
      }

      Object.assign(contentPage, payload, {
        updatedAt: new Date().toISOString(),
      });

      return db;
    });
  },

  async getBanners() {
    return mockApiClient.query((db) => normalizeHomeContent(db.homeContent).banners || []);
  },

  async createBanner(payload) {
    return mockApiClient.mutate((db) => {
      db.homeContent = normalizeHomeContent(db.homeContent);
      db.homeContent.banners.unshift({
        id: crypto.randomUUID(),
        ...payload,
      });
      db.banners = db.homeContent.banners;
      return db;
    });
  },

  async updateBanner(bannerId, payload) {
    return mockApiClient.mutate((db) => {
      db.homeContent = normalizeHomeContent(db.homeContent);
      const banner = db.homeContent.banners.find((entry) => entry.id === bannerId);
      if (!banner) throw new Error("Banner not found.");

      Object.assign(banner, payload);
      db.banners = db.homeContent.banners;
      return db;
    });
  },

  async deleteBanner(bannerId) {
    return mockApiClient.mutate((db) => {
      db.homeContent = normalizeHomeContent(db.homeContent);
      db.homeContent.banners = db.homeContent.banners.filter((banner) => banner.id !== bannerId);
      db.banners = db.homeContent.banners;
      return db;
    });
  },
};
