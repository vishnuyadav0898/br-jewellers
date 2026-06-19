import { apiClient } from "./apiClient";

const calculateReadTime = (text = "") => {
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
};

const normalizeApiBlog = (blog = {}) => {
  const desc = blog.description || "";
  const excerpt = desc.slice(0, 150) + (desc.length > 150 ? "..." : "");
  return {
    id: blog._id || blog.id,
    title: blog.title || "",
    excerpt: excerpt || "No description available.",
    coverImage: blog.image || "",
    author: blog.author?.name || (typeof blog.author === "string" ? blog.author : "BR Editorial Team"),
    publishedAt: blog.createdAt || new Date().toISOString(),
    readTime: calculateReadTime(desc),
    content: desc,
    gallery: blog.gallery || [],
  };
};

export const blogsService = {
  async getBlogs() {
    const res = await apiClient.get("/api/v1/blogs");
    const rawList = res?.data || res;
    const list = Array.isArray(rawList) ? rawList : [];
    return list.map(normalizeApiBlog);
  },

  async getBlogById(blogId) {
    const res = await apiClient.get(`/api/v1/blogs/${blogId}`);
    return normalizeApiBlog(res?.data || res);
  },

  async createBlog(payload) {
    const res = await apiClient.post("/api/v1/blogs", {
      title: payload.title,
      image: payload.coverImage || payload.image,
      description: payload.content || payload.description,
      gallery: payload.gallery || [],
    });
    return normalizeApiBlog(res?.data || res);
  },

  async updateBlog(blogId, payload) {
    const res = await apiClient.patch(`/api/v1/blogs/${blogId}`, {
      title: payload.title,
      image: payload.coverImage || payload.image,
      description: payload.content || payload.description,
      gallery: payload.gallery || [],
    });
    return normalizeApiBlog(res?.data || res);
  },

  async deleteBlog(blogId) {
    await apiClient.delete(`/api/v1/blogs/${blogId}`);
    return true;
  },
};
