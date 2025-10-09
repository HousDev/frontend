// // src/lib/blogsAPI.ts
// import { api } from "./api";

// export const blogsAPI = {
//   // ✅ Create post (supports FormData ya JSON)
//   createPost: async (data: FormData | Record<string, any>) => {
//     const response = await api.post("/blog-posts", data);
//     return response.data;
//   },

//   // ✅ Update post
//   updatePost: async (id: number | string, data: FormData | Record<string, any>) => {
//     const response = await api.put(`/blog-posts/update/${id}`, data);
//     return response.data;
//   },

//   // ✅ Get all posts
//   getAllPosts: async (params?: Record<string, any>) => {
//     const response = await api.get("/blog-posts/get-all", { params });
//     console.log("my all blogs post:", response.data);
//     return response.data;
//   },

//   // ✅ Get single post by id
//   getPost: async (id: number | string) => {
//     const response = await api.get(`/blog-posts/get/${id}`);
//     return response.data;
//   },

//   // ✅ Get single post by slug
//   getPostBySlug: async (slug: string) => {
//     const response = await api.get(`/blog-posts/${slug}`);
//     return response.data;
//   },

//   // ✅ Delete post
//   deletePost: async (id: number | string) => {
//     const response = await api.delete(`/blog-posts/delete/${id}`);
//     return response.data;
//   },

  

//   /* ---------------- Comments / Engagement helpers ---------------- */

//   /**
//    * Try common comment endpoints. Returns data or [] on failure.
//    * Usage: blogsAPI.getComments(postId)
//    */
//   getComments: async (postId: string | number) => {
//     // try common endpoints in order
//     try {
//       // common generic comments endpoint with query param
//       const res = await api.get("/comments", { params: { postId } });
//       return res.data;
//     } catch (err1) {
//       try {
//         // fallback: nested under blog-posts
//         const res2 = await api.get(`/blog-posts/${postId}/comments`);
//         return res2.data;
//       } catch (err2) {
//         // ultimate fallback: empty
//         return [];
//       }
//     }
//   },

//   /**
//    * Fetch comments by post slug.
//    * Usage: blogsAPI.getCommentsByPostSlug(slug)
//    */
//   getCommentsByPostSlug: async (slug: string) => {
//     try {
//       // try query param approach first
//       const res = await api.get("/comments", { params: { postSlug: slug } });
//       return res.data;
//     } catch (err1) {
//       try {
//         // fallback: comments endpoint under blog-posts/:slug/comments
//         const res2 = await api.get(`/blog-posts/${slug}/comments`);
//         return res2.data;
//       } catch (err2) {
//         return [];
//       }
//     }
//   },

//   /**
//    * Post a comment. Tries common endpoints.
//    * payload: { author?: string, email?: string, content: string, [other] }
//    * Usage: blogsAPI.postComment('post-slug-or-id', { author, email, content })
//    */
//   postComment: async (postIdentifier: string | number, payload: Record<string, any>) => {
//     // try POST to nested route first
//     try {
//       const res = await api.post(`/blog-posts/${postIdentifier}/comments`, payload);
//       return res.data;
//     } catch (err1) {
//       // fallback: generic comments collection with post ref in body
//       const body = { ...payload, post: postIdentifier, postId: postIdentifier, postSlug: postIdentifier };
//       const res2 = await api.post("/comments", body);
//       return res2.data;
//     }
//   },

//   /**
//    * Like a post (simple helper). Adjust endpoint if your backend uses another path.
//    * Usage: blogsAPI.likePost(postId)
//    */
//   likePost: async (postId: string | number) => {
//     try {
//       const res = await api.post(`/blog-posts/${postId}/like`);
//       return res.data;
//     } catch (err) {
//       // fallback: increment via a generic endpoint
//       const res = await api.post(`/posts/${postId}/like`);
//       return res.data;
//     }
//   },

//   /**
//    * Optional: bookmark (client-side or server-side) — implement if your API supports it.
//    * Usage: blogsAPI.bookmarkPost(postId)
//    */
//   bookmarkPost: async (postId: string | number) => {
//     const res = await api.post(`/blog-posts/${postId}/bookmark`);
//     return res.data;
//   },
// };



// export default blogsAPI;


// src/lib/blogsAPI.ts
import { api } from "./api";

/* =========================
   AI: Types for blog generation
   ========================= */
export type AITone =
  | "professional"
  | "conversational"
  | "expert"
  | "beginner-friendly";

export type AILength = "short" | "medium" | "long" | "comprehensive";

export type AIGeneratePayload = {
  title: string;
  tone?: AITone;
  length?: AILength;
  includeSEO?: boolean;
  includeImages?: boolean;
  includeToc?: boolean;
  audience?: string;
  category?: string;
};

export type AIImageHint = {
  alt: string;
  keywords: string[];
};

export type AIGenerateResponse = {
  success: boolean;
  message?: string;
  article?: {
    title: string;
    excerpt: string;
    content: string; // sanitized HTML
    seoTitle: string;
    seoDescription: string;
    tags: string[];
    category: string;
    status: "draft";
    aiImages?: {
      hero: AIImageHint | null;
      inline: AIImageHint[];
    };
  };
};

/* =========================
   Blog entity (optional helper type)
   ========================= */
export type BlogPost = {
  id?: number | string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  featured: boolean;
  featuredImage: string;
  seoTitle: string;
  seoDescription: string;
  status: "draft" | "published" | "archived";
  publishedAt?: string | null;
  slug?: string;
};

/* =========================
   API surface
   ========================= */
export const blogsAPI = {
  /* ---- CRUD ---- */
  // Create post (supports FormData or JSON)
  createPost: async (data: FormData | Record<string, any>) => {
    const response = await api.post("/blog-posts", data);
    return response.data as BlogPost;
  },

  // Update post
  updatePost: async (
    id: number | string,
    data: FormData | Record<string, any>
  ) => {
    const response = await api.put(`/blog-posts/update/${id}`, data);
    return response.data as BlogPost;
  },

  // Get all posts
  getAllPosts: async (params?: Record<string, any>) => {
    const response = await api.get("/blog-posts/get-all", { params });
    // console.log("my all blogs post:", response.data);
    return response.data as { data: BlogPost[]; total?: number } | BlogPost[];
  },

  // Get single post by id
  getPost: async (id: number | string) => {
    const response = await api.get(`/blog-posts/get/${id}`);
    return response.data as BlogPost;
  },

  // Get single post by slug
  getPostBySlug: async (slug: string) => {
    const response = await api.get(`/blog-posts/${slug}`);
    return response.data as BlogPost;
  },

  // Delete post
  deletePost: async (id: number | string) => {
    const response = await api.delete(`/blog-posts/delete/${id}`);
    return response.data as { success: boolean; message?: string };
  },

  /* ---------------- AI: Title → Full SEO Blog ---------------- */
  aiGenerateFromTitle: async (body: AIGeneratePayload) => {
    // backend route we mounted: POST /api/ai/blogs/generate
    const { data } = await api.post("/ai-blogs/generate", body);
    return data as AIGenerateResponse;
  },

  /* ---------------- Comments / Engagement helpers ---------------- */

  /** Get comments by postId (tries common endpoints) */
  getComments: async (postId: string | number) => {
    try {
      const res = await api.get("/comments", { params: { postId } });
      return res.data;
    } catch {
      try {
        const res2 = await api.get(`/blog-posts/${postId}/comments`);
        return res2.data;
      } catch {
        return [];
      }
    }
  },

  /** Get comments by post slug */
  getCommentsByPostSlug: async (slug: string) => {
    try {
      const res = await api.get("/comments", { params: { postSlug: slug } });
      return res.data;
    } catch {
      try {
        const res2 = await api.get(`/blog-posts/${slug}/comments`);
        return res2.data;
      } catch {
        return [];
      }
    }
  },

  /** Post a comment */
  postComment: async (
    postIdentifier: string | number,
    payload: Record<string, any>
  ) => {
    try {
      const res = await api.post(
        `/blog-posts/${postIdentifier}/comments`,
        payload
      );
      return res.data;
    } catch {
      const body = {
        ...payload,
        post: postIdentifier,
        postId: postIdentifier,
        postSlug: postIdentifier,
      };
      const res2 = await api.post("/comments", body);
      return res2.data;
    }
  },

  /** Like a post */
  likePost: async (postId: string | number) => {
    try {
      const res = await api.post(`/blog-posts/${postId}/like`);
      return res.data;
    } catch {
      const res = await api.post(`/posts/${postId}/like`);
      return res.data;
    }
  },

  /** Optional: bookmark */
  bookmarkPost: async (postId: string | number) => {
    const res = await api.post(`/blog-posts/${postId}/bookmark`);
    return res.data;
  },
};

export default blogsAPI;
