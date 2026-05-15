import { mockApiClient } from "../../shared/services/mockApiClient";
import { initialData } from "../../mock/data";

const makeBlogRecord = (payload, existingBlog = {}) => ({
  ...existingBlog,
  id: existingBlog.id || crypto.randomUUID(),
  slug:
    payload.slug ||
    String(payload.title || existingBlog.title || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, ""),
  title: payload.title?.trim() || existingBlog.title || "",
  excerpt: payload.excerpt?.trim() || existingBlog.excerpt || "",
  coverImage: payload.coverImage || existingBlog.coverImage || "",
  author: payload.author?.trim() || existingBlog.author || "BR Editorial Team",
  publishedAt: payload.publishedAt || existingBlog.publishedAt || new Date().toISOString(),
  readTime: payload.readTime?.trim() || existingBlog.readTime || "4 min read",
  content:
    Array.isArray(payload.content)
      ? payload.content
      : String(payload.content || existingBlog.content?.join("\n\n") || "")
          .split(/\n{2,}/)
          .map((part) => part.trim())
          .filter(Boolean),
  comments: existingBlog.comments || [],
});

const normalizeBlog = (blog = {}, index = 0) =>
  makeBlogRecord(
    {
      ...blog,
      title: blog.title || `Mock blog ${index + 1}`,
      excerpt: blog.excerpt || "This mock editorial entry is ready for admin editing.",
      content: Array.isArray(blog.content) ? blog.content : blog.content || "",
    },
    blog
  );

export const blogsService = {
  async getBlogs() {
    return mockApiClient.query((db) => {
      const source =
        Array.isArray(db.blogs) && db.blogs.length ? db.blogs : initialData.blogs || [];

      return source
        .map((blog, index) => normalizeBlog(blog, index))
        .sort((left, right) => new Date(right.publishedAt) - new Date(left.publishedAt));
    });
  },

  async createBlog(payload) {
    return mockApiClient.mutate((db) => {
      if (!Array.isArray(db.blogs)) {
        db.blogs = [];
      }
      db.blogs.unshift(makeBlogRecord(payload));
      return db;
    });
  },

  async updateBlog(blogId, payload) {
    return mockApiClient.mutate((db) => {
      const index = db.blogs.findIndex((entry) => entry.id === blogId);
      if (index === -1) throw new Error("Blog not found.");

      db.blogs[index] = makeBlogRecord(payload, db.blogs[index]);
      return db;
    });
  },

  async deleteBlog(blogId) {
    return mockApiClient.mutate((db) => {
      db.blogs = db.blogs.filter((entry) => entry.id !== blogId);
      return db;
    });
  },
};
