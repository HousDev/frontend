// src/lib/blogsAPI.ts
import { api } from "./api";

export const blogsAPI = {
  // ✅ Create post (supports FormData ya JSON)
  createPost: async (data: FormData | Record<string, any>) => {
    const response = await api.post("/blog-posts", data);
    return response.data;
  },

  // ✅ Update post
  updatePost: async (id: number | string, data: FormData | Record<string, any>) => {
    const response = await api.put(`/blog-posts/update/${id}`, data);
    return response.data;
  },

  // ✅ Get all posts
  getAllPosts: async (params?: Record<string, any>) => {
      const response = await api.get("/blog-posts/get-all", { params });
      console.log("my all blogs post:",response.data)
    return response.data;
  },

  // ✅ Get single post
  getPost: async (id: number | string) => {
    const response = await api.get(`/blog-posts/get/${id}`);
    return response.data;
  },

  // ✅ Delete post
  deletePost: async (id: number | string) => {
    const response = await api.delete(`/blog-posts/delete/${id}`);
    return response.data;
  },

};

export default blogsAPI;
