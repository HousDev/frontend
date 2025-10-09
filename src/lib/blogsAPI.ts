// // src/lib/blogsAPI.ts
// import { api } from "./api";

// /* =========================
//    AI: Types for blog generation
//    ========================= */
// export type AITone =
//   | "professional"
//   | "conversational"
//   | "expert"
//   | "beginner-friendly";

// export type AILength = "short" | "medium" | "long" | "comprehensive";

// export type AIGeneratePayload = {
//   title: string;
//   tone?: AITone;
//   length?: AILength;
//   includeSEO?: boolean;
//   includeImages?: boolean;
//   includeToc?: boolean;
//   audience?: string;
//   category?: string;
// };

// export type AIImageHint = {
//   alt: string;
//   keywords: string[];
// };

// export type AIGenerateResponse = {
//   success: boolean;
//   message?: string;
//   article?: {
//     title: string;
//     excerpt: string;
//     content: string; // sanitized HTML
//     seoTitle: string;
//     seoDescription: string;
//     tags: string[];
//     category: string;
//     status: "draft";
//     aiImages?: {
//       hero: AIImageHint | null;
//       inline: AIImageHint[];
//     };
//   };
// };

// /* =========================
//    Blog entity
//    ========================= */
// export type BlogPost = {
//   id?: number | string;
//   title: string;
//   content: string;
//   excerpt: string;
//   author: string;
//   category: string;
//   tags: string[];
//   featured: boolean;
//   featuredImage: string | null;
//   seoTitle: string;
//   seoDescription: string;
//   status: "draft" | "published" | "archived";
//   publishedAt?: string | null;
//   slug?: string;
// };

// /* =========================
//    Helpers
//    ========================= */
// const unwrap = <T = any>(resp: any): T => {
//   // Accept shapes like: { success, data }, { data }, raw array/object
//   if (resp?.data !== undefined && resp?.success !== undefined) return resp.data as T;
//   if (resp?.data !== undefined && resp?.success === undefined) return resp.data as T;
//   return (resp as T) ?? ({} as T);
// };

// const csvToArray = (val?: any): string[] => {
//   if (!val && val !== "") return [];
//   if (Array.isArray(val)) return val;
//   if (typeof val === "string") {
//     const s = val.trim();
//     if (!s) return [];
//     // try JSON first
//     try {
//       const parsed = JSON.parse(s);
//       if (Array.isArray(parsed)) return parsed;
//     } catch {}
//     // fallback: CSV
//     return s.split(",").map((t) => t.trim()).filter(Boolean);
//   }
//   return [];
// };

// const boolish = (v: any): boolean =>
//   v === true || v === "true" || v === "1" || v === 1;

// const toFormDataIfNeeded = (data: FormData | Record<string, any>) => {
//   if (data instanceof FormData) return data;
//   // make JSON payload (backend accepts both)
//   return {
//     ...data,
//     // normalize tags/featured for JSON
//     tags: csvToArray((data as any)?.tags),
//     featured: boolish((data as any)?.featured || false),
//   };
// };

// /* =========================
//    API surface
//    ========================= */
// export const blogsAPI = {
//   /* ---- CRUD ---- */

//   // Create post (supports FormData or JSON)
//   // Default status is "draft" unless overridden.
//   createPost: async (data: FormData | Record<string, any>) => {
//     const payload =
//       data instanceof FormData
//         ? data
//         : {
//             status: "draft",
//             ...toFormDataIfNeeded(data),
//           };

//     const res = await api.post("/blog-posts", payload);
//     // backend returns { success, data: post }
//     return unwrap<BlogPost>(res.data);
//   },

//   // Update post (supports FormData or JSON)
//   updatePost: async (id: number | string, data: FormData | Record<string, any>) => {
//     const payload = data instanceof FormData ? data : toFormDataIfNeeded(data);
//     const res = await api.put(`/blog-posts/update/${id}`, payload);
//     return unwrap<BlogPost>(res.data);
//   },

//   // Get all posts
//   // Accepts params: { page, limit, q, category, status }
//   getAllPosts: async (params?: Record<string, any>) => {
//     const res = await api.get("/blog-posts/get-all", { params });
//     // controller sends { success, data: posts }
//     // posts may be array or a paginated shape based on your model,
//     // but UI already normalizes. We return the raw unwrapped data.
//     return unwrap<any>(res.data);
//   },

//   // Get single post by id
//   getPost: async (id: number | string) => {
//     const res = await api.get(`/blog-posts/get/${id}`);
//     return unwrap<BlogPost>(res.data);
//   },

//   // Get single post by slug
//   getPostBySlug: async (slug: string) => {
//     const res = await api.get(`/blog-posts/${slug}`);
//     return unwrap<BlogPost>(res.data);
//   },

//   // Delete post
//   deletePost: async (id: number | string) => {
//     const res = await api.delete(`/blog-posts/delete/${id}`);
//     return unwrap<{ success: boolean; message?: string }>(res.data);
//   },

//   /* ---------------- AI: Title → Full SEO Blog ---------------- */
//   aiGenerateFromTitle: async (body: AIGeneratePayload) => {
//     // backend route we mounted: POST /ai-blogs/generate
//     const { data } = await api.post("/ai-blogs/generate", body);
//     return data as AIGenerateResponse;
//   },

//   /* ---------------- Comments / Engagement helpers ---------------- */

//   /** Get comments by postId (tries common endpoints) */
//   getComments: async (postId: string | number) => {
//     try {
//       const res = await api.get("/comments", { params: { postId } });
//       return unwrap<any>(res.data);
//     } catch {
//       try {
//         const res2 = await api.get(`/blog-posts/${postId}/comments`);
//         return unwrap<any>(res2.data);
//       } catch {
//         return [];
//       }
//     }
//   },

//   /** Get comments by post slug */
//   getCommentsByPostSlug: async (slug: string) => {
//     try {
//       const res = await api.get("/comments", { params: { postSlug: slug } });
//       return unwrap<any>(res.data);
//     } catch {
//       try {
//         const res2 = await api.get(`/blog-posts/${slug}/comments`);
//         return unwrap<any>(res2.data);
//       } catch {
//         return [];
//       }
//     }
//   },

//   /** Post a comment */
//   postComment: async (postIdentifier: string | number, payload: Record<string, any>) => {
//     try {
//       const res = await api.post(`/blog-posts/${postIdentifier}/comments`, payload);
//       return unwrap<any>(res.data);
//     } catch {
//       const body = {
//         ...payload,
//         post: postIdentifier,
//         postId: postIdentifier,
//         postSlug: postIdentifier,
//       };
//       const res2 = await api.post("/comments", body);
//       return unwrap<any>(res2.data);
//     }
//   },

//   /** Like a post */
//   likePost: async (postId: string | number) => {
//     try {
//       const res = await api.post(`/blog-posts/${postId}/like`);
//       return unwrap<any>(res.data);
//     } catch {
//       const res = await api.post(`/posts/${postId}/like`);
//       return unwrap<any>(res.data);
//     }
//   },

//   /** Optional: bookmark */
//   bookmarkPost: async (postId: string | number) => {
//     const res = await api.post(`/blog-posts/${postId}/bookmark`);
//     return unwrap<any>(res.data);
//   },

//   /* ---------------- Bulk helpers (match backend you shared) ---------------- */

//   /** Bulk update: { ids: [], data: {...} } — used for bulk publish, etc. */
//   bulkUpdate: async (body: { ids: (string | number)[]; data: Record<string, any> }) => {
//     // Normalize client-provided fields similar to single update
//     const cleaned: Record<string, any> = { ...body.data };
//     if (cleaned.tags !== undefined) cleaned.tags = csvToArray(cleaned.tags);
//     if (cleaned.featured !== undefined) cleaned.featured = boolish(cleaned.featured);

//     const res = await api.put(`/blog-posts/bulk-update`, {
//       ids: body.ids,
//       data: cleaned,
//     });
//     // controller returns { success, data: updated[], updatedCount }
//     return unwrap<any>(res.data);
//   },

//   /** Bulk delete (primary endpoint) */
//   bulkDelete: async (body: { ids: (string | number)[] }) => {
//     const res = await api.post(`/blog-posts/bulk-delete`, body);
//     // controller returns { success, message, deletedCount }
//     return unwrap<any>(res.data);
//   },

//   /** Bulk delete (alias endpoint, also supported by backend) */
//   deleteMany: async (ids: (string | number)[]) => {
//     const res = await api.post(`/blog-posts/delete-many`, { ids });
//     return unwrap<any>(res.data);
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
   Blog entity
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
  featuredImage: string | null;
  seoTitle: string;
  seoDescription: string;
  status: "draft" | "scheduled" | "published" | "archived";
  publishedAt?: string | null;
  slug?: string;
};

/* =========================
   Helpers
   ========================= */
const unwrap = <T = any>(resp: any): T => {
  // Accept shapes like: { success, data }, { data }, or raw
  if (resp?.data !== undefined && resp?.success !== undefined) return resp.data as T;
  if (resp?.data !== undefined && resp?.success === undefined) return resp.data as T;
  return (resp as T) ?? ({} as T);
};

const csvToArray = (val?: any): string[] => {
  if (!val && val !== "") return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    const s = val.trim();
    if (!s) return [];
    // try JSON first
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    // fallback: CSV
    return s
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
};

const boolish = (v: any): boolean =>
  v === true || v === "true" || v === "1" || v === 1;

const toFormDataIfNeeded = (data: FormData | Record<string, any>) => {
  if (data instanceof FormData) return data;
  // Make JSON payload (backend accepts both)
  return {
    ...data,
    tags: csvToArray((data as any)?.tags),
    featured: boolish((data as any)?.featured || false),
  };
};

/* =================================================================================
   PUBLIC (Published-only) API
   ---------------------------------------------------------------------------------
   Use these on public-facing pages so drafts never leak.
   ================================================================================= */
export const getPublicPosts = async (params?: Record<string, any>) => {
  const res = await api.get("/blog-posts/public/get-all", { params });
  return unwrap<any>(res.data);
};

export const getPublicPostBySlug = async (slug: string) => {
  const res = await api.get(`/blog-posts/public/${slug}`);
  return unwrap<BlogPost>(res.data);
};

/* =================================================================================
   ADMIN / MIXED (controller enforces published-only for non-admins)
   ================================================================================= */
export const blogsAPI = {
  /* ---- CRUD ---- */

  // Create post (supports FormData or JSON)
  // Default status is "draft" unless overridden.
  createPost: async (data: FormData | Record<string, any>) => {
    const payload =
      data instanceof FormData
        ? data
        : {
            status: "draft",
            ...toFormDataIfNeeded(data),
          };

    const res = await api.post("/blog-posts", payload);
    return unwrap<BlogPost>(res.data);
  },

  // Update post (supports FormData or JSON)
  updatePost: async (id: number | string, data: FormData | Record<string, any>) => {
    const payload = data instanceof FormData ? data : toFormDataIfNeeded(data);
    const res = await api.put(`/blog-posts/update/${id}`, payload);
    return unwrap<BlogPost>(res.data);
  },

  // Get all posts (admin panel, analytics, etc.)
  // Accepts params: { page, limit, q, category, status }
  // NOTE: For public UI, prefer getPublicPosts()
  getAllPosts: async (params?: Record<string, any>) => {
    const res = await api.get("/blog-posts/get-all", { params });
    return unwrap<any>(res.data);
  },

  // Get single post by id
  getPost: async (id: number | string) => {
    const res = await api.get(`/blog-posts/get/${id}`);
    return unwrap<BlogPost>(res.data);
  },

  // Get single post by slug (admin/mixed).
  // NOTE: For public UI, prefer getPublicPostBySlug() so drafts never leak.
  getPostBySlug: async (slug: string) => {
    const res = await api.get(`/blog-posts/${slug}`);
    return unwrap<BlogPost>(res.data);
  },

  // Delete post (single)
  deletePost: async (id: number | string) => {
    const res = await api.delete(`/blog-posts/delete/${id}`);
    return unwrap<{ success: boolean; message?: string }>(res.data);
  },

  /* ---- AI: Title → Full SEO Blog ---- */
  aiGenerateFromTitle: async (body: AIGeneratePayload) => {
    // backend route: POST /ai-blogs/generate
    const { data } = await api.post("/ai-blogs/generate", body);
    return data as AIGenerateResponse;
  },

  /* ---- Comments / Engagement helpers ---- */

  /** Get comments by postId (tries common endpoints) */
  getComments: async (postId: string | number) => {
    try {
      const res = await api.get("/comments", { params: { postId } });
      return unwrap<any>(res.data);
    } catch {
      try {
        const res2 = await api.get(`/blog-posts/${postId}/comments`);
        return unwrap<any>(res2.data);
      } catch {
        return [];
      }
    }
  },

  /** Get comments by post slug */
  getCommentsByPostSlug: async (slug: string) => {
    try {
      const res = await api.get("/comments", { params: { postSlug: slug } });
      return unwrap<any>(res.data);
    } catch {
      try {
        const res2 = await api.get(`/blog-posts/${slug}/comments`);
        return unwrap<any>(res2.data);
      } catch {
        return [];
      }
    }
  },

  /** Post a comment */
  postComment: async (postIdentifier: string | number, payload: Record<string, any>) => {
    try {
      const res = await api.post(`/blog-posts/${postIdentifier}/comments`, payload);
      return unwrap<any>(res.data);
    } catch {
      const body = {
        ...payload,
        post: postIdentifier,
        postId: postIdentifier,
        postSlug: postIdentifier,
      };
      const res2 = await api.post("/comments", body);
      return unwrap<any>(res2.data);
    }
  },

  /** Like a post */
  likePost: async (postId: string | number) => {
    try {
      const res = await api.post(`/blog-posts/${postId}/like`);
      return unwrap<any>(res.data);
    } catch {
      const res = await api.post(`/posts/${postId}/like`);
      return unwrap<any>(res.data);
    }
  },

  /** Optional: bookmark */
  bookmarkPost: async (postId: string | number) => {
    const res = await api.post(`/blog-posts/${postId}/bookmark`);
    return unwrap<any>(res.data);
  },

  /* ---- Bulk helpers (match backend) ---- */

  /** Bulk update: { ids: [], data: {...} } — used for bulk publish, etc. */
  bulkUpdate: async (body: { ids: (string | number)[]; data: Record<string, any> }) => {
    const cleaned: Record<string, any> = { ...body.data };
    if (cleaned.tags !== undefined) cleaned.tags = csvToArray(cleaned.tags);
    if (cleaned.featured !== undefined) cleaned.featured = boolish(cleaned.featured);

    const res = await api.put(`/blog-posts/bulk-update`, {
      ids: body.ids,
      data: cleaned,
    });
    return unwrap<any>(res.data);
  },

  /** Bulk delete (primary endpoint) */
  bulkDelete: async (body: { ids: (string | number)[] }) => {
    const res = await api.post(`/blog-posts/bulk-delete`, body);
    return unwrap<any>(res.data);
  },

  /** Bulk delete (alias endpoint, also supported by backend) */
  deleteMany: async (ids: (string | number)[]) => {
    const res = await api.post(`/blog-posts/delete-many`, { ids });
    return unwrap<any>(res.data);
  },
};

export default blogsAPI;
