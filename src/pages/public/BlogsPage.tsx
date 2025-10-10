// // src/pages/public/BlogsPage.tsx
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Calendar,
//   User,
//   ArrowRight,
//   Search,
//   Tag,
//   Clock,
//   Eye,
//   Heart,
//   MessageSquare,
// } from "lucide-react";
// import BlogDetailPage, { BlogPost as DetailBlogPost } from "@/pages/public/BlogDetailPage";
// // ✅ Use named public endpoints so drafts never leak
// import blogsAPI, { getPublicPosts, getPublicPostBySlug } from "@/lib/blogsAPI";
// import { useNavigate, useParams } from "react-router-dom";

// /* -------------------------------------------------------------
//    Types (keep aligned with backend but flexible on optionality)
// ------------------------------------------------------------- */
// export interface BlogPost {
//   id: number | string;
//   title: string;
//   excerpt?: string;
//   content?: string;
//   author?: string;
//   date?: string; // ISO
//   category?: string;
//   readTime?: string;
//   image?: string;
//   tags?: string[];
//   views?: number;
//   likes?: number;
//   comments?: number;
//   featured?: boolean;
//   slug?: string;
//   // optional fields used in dashboard variants
//   sourceId?: string | number;
//   sourceName?: string;
// }

// export interface BlogDetailPageProps {
//   slug?: string;
//   post?: BlogPost;
//   loading?: boolean;
//   onBack?: () => void;
// }

// /* -------------------------------------------------------------
//    Helpers
// ------------------------------------------------------------- */
// type AnyRec = Record<string, unknown>;
// const isObj = (v: unknown): v is AnyRec => !!v && typeof v === "object";
// const isArr = (v: unknown): v is any[] => Array.isArray(v);

// /** Accepts: BlogPost[], {data|items|posts|results: BlogPost[]}, BlogPost, or garbage; returns BlogPost[] */
// const unwrapArray = (raw: unknown): any[] => {
//   if (isArr(raw)) return raw;
//   if (!isObj(raw)) return [];
//   if ("data" in raw && isArr((raw as AnyRec).data)) return (raw as AnyRec).data as any[];
//   if ("items" in raw && isArr((raw as AnyRec).items)) return (raw as AnyRec).items as any[];
//   if ("posts" in raw && isArr((raw as AnyRec).posts)) return (raw as AnyRec).posts as any[];
//   if ("results" in raw && isArr((raw as AnyRec).results)) return (raw as AnyRec).results as any[];
//   const r = raw as AnyRec;
//   if (r?.id || r?.title || r?.slug) return [r];
//   return [];
// };

// /** Accepts: BlogPost or {data: BlogPost} or garbage; returns BlogPost | undefined */
// const unwrapSingle = <T = any>(raw: unknown): T | undefined => {
//   if (!isObj(raw)) return undefined;
//   if ("data" in raw) return (raw as AnyRec).data as T;
//   return raw as T;
// };

// function safeParseTags(v: any): string[] {
//   if (!v) return [];
//   if (Array.isArray(v)) return v.map((x) => String(x));
//   if (typeof v === "string") {
//     try {
//       const parsed = JSON.parse(v);
//       if (Array.isArray(parsed)) return parsed.map((x) => String(x));
//     } catch {
//       return v
//         .split(",")
//         .map((s) => s.trim())
//         .filter(Boolean);
//     }
//   }
//   return [];
// }

// function slugFromTitle(t?: any): string | undefined {
//   if (!t || typeof t !== "string") return undefined;
//   return String(t)
//     .toLowerCase()
//     .normalize("NFKD")
//     .replace(/[\u0300-\u036f]/g, "")
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/^-+|-+$/g, "")
//     .replace(/-+/g, "-");
// }

// const defaultCategories = [
//   "All",
//   "Investment",
//   "Market Analysis",
//   "Buying Guide",
//   "Construction",
//   "Property Management",
//   "Commercial",
// ];

// /* -------------------------------------------------------------
//    Component
// ------------------------------------------------------------- */
// const BlogsPage: React.FC<{ onPageChange?: (n: number) => void }> = ({ onPageChange }) => {
//   const navigate = useNavigate();
//   const params = useParams<{ slug?: string }>();

//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [selectedPostSlug, setSelectedPostSlug] = useState<string | null>(null);
//   const [selectedPostObj, setSelectedPostObj] = useState<BlogPost | null>(null);
//   const [loadingDetail, setLoadingDetail] = useState(false);

//   const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular" | "trending">("newest");

//   const [posts, setPosts] = useState<BlogPost[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const categories = useMemo(() => defaultCategories, []);

//   // Sync route param to selectedPostSlug (so /blogs/:slug opens detail)
//   useEffect(() => {
//     const routeSlug = params.slug ?? null;
//     setSelectedPostSlug(routeSlug);
//   }, [params.slug]);

//   // Load posts list (supports multiple backend shapes)
//   useEffect(() => {
//     let cancelled = false;
//     const load = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         // ✅ public-only endpoint (named export)
//         const raw: unknown = await getPublicPosts();
//         const list = unwrapArray(raw);

//         const normalized: BlogPost[] = list.map((p: any, idx: number) => {
//           const tags = safeParseTags(p.tags ?? p.tag ?? []);
//           const slug = p.slug ?? p.slugified ?? slugFromTitle(p.title) ?? String(p.id ?? idx);
//           const image = p.featuredImage ?? p.featured_image ?? p.image ?? "";
//           const date =
//             p.publishedAt ??
//             p.published_at ??
//             p.createdAt ??
//             p.created_at ??
//             new Date().toISOString();

//           return {
//             id: p.id ?? p._id ?? slug ?? idx,
//             slug,
//             title: p.title ?? "Untitled",
//             excerpt:
//               p.excerpt ??
//               (typeof p.content === "string"
//                 ? p.content.slice(0, 160) + (p.content.length > 160 ? "…" : "")
//                 : ""),
//             content: p.content ?? "",
//             author: p.author ?? "Admin",
//             date,
//             category: p.category ?? "Uncategorized",
//             readTime: p.readTime
//               ? String(p.readTime)
//               : p.read_time
//                 ? String(p.read_time)
//                 : "5 min read",
//             image,
//             tags,
//             views: Number(p.views ?? 0),
//             likes: Number(p.likes ?? 0),
//             comments: Number(p.comments ?? 0),
//             featured: !!p.featured,
//             sourceId: p.sourceId,
//             sourceName: p.sourceName,
//           } as BlogPost;
//         });

//         if (!cancelled) setPosts(normalized);
//       } catch (err: any) {
//         console.error("Failed fetching posts", err);
//         if (!cancelled) setError(err?.message || "Failed to load posts");
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };

//     load();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   // When a slug is selected (via state), fetch post by slug and pass it down
//   useEffect(() => {
//     if (!selectedPostSlug) {
//       setSelectedPostObj(null);
//       return;
//     }
//     let cancelled = false;
//     const loadDetail = async () => {
//       setLoadingDetail(true);
//       try {
//         // ✅ public-only endpoint for detail
//         const res: unknown = await getPublicPostBySlug(selectedPostSlug);
//         const post = unwrapSingle<any>(res);
//         if (!post) {
//           if (!cancelled) setSelectedPostObj(null);
//           return;
//         }
//         const normalized: BlogPost = {
//           id: post.id ?? post._id ?? post.slug ?? selectedPostSlug,
//           slug: post.slug ?? selectedPostSlug,
//           title: post.title ?? "Untitled",
//           excerpt:
//             post.excerpt ??
//             (typeof post.content === "string"
//               ? post.content.slice(0, 160) + (post.content.length > 160 ? "…" : "")
//               : ""),
//           content: post.content ?? "",
//           author: post.author ?? "Admin",
//           date:
//             post.publishedAt ??
//             post.published_at ??
//             post.createdAt ??
//             post.created_at ??
//             new Date().toISOString(),
//           category: post.category ?? "Uncategorized",
//           readTime: post.readTime
//             ? String(post.readTime)
//             : post.read_time
//               ? String(post.read_time)
//               : "5 min read",
//           image: post.featuredImage ?? post.featured_image ?? post.image ?? "",
//           tags: safeParseTags(post.tags ?? []),
//           views: Number(post.views ?? 0),
//           likes: Number(post.likes ?? 0),
//           comments: Number(post.comments ?? 0),
//           featured: !!post.featured,
//           sourceId: post.sourceId,
//           sourceName: post.sourceName,
//         };
//         if (!cancelled) setSelectedPostObj(normalized);
//       } catch (err) {
//         console.error("Failed loading post by slug", err);
//         if (!cancelled) setSelectedPostObj(null);
//       } finally {
//         if (!cancelled) setLoadingDetail(false);
//       }
//     };
//     loadDetail();
//     return () => {
//       cancelled = true;
//     };
//   }, [selectedPostSlug]);

//   // filters & sorting
//   const filtered = useMemo(() => {
//     const term = searchTerm.trim().toLowerCase();
//     return posts.filter((post) => {
//       const matchesSearch =
//         !term ||
//         (post.title && post.title.toLowerCase().includes(term)) ||
//         (post.excerpt && post.excerpt.toLowerCase().includes(term)) ||
//         (post.tags && post.tags.some((t) => t.toLowerCase().includes(term)));
//       const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
//       return matchesSearch && matchesCategory;
//     });
//   }, [posts, searchTerm, selectedCategory]);

//   const sortedPosts = useMemo(() => {
//     const arr = [...filtered];
//     arr.sort((a, b) => {
//       switch (sortBy) {
//         case "oldest":
//           return new Date(a.date ?? "").getTime() - new Date(b.date ?? "").getTime();
//         case "popular":
//           return (b.views || 0) - (a.views || 0);
//         case "trending":
//           return (b.likes || 0) - (a.likes || 0);
//         default:
//           return new Date(b.date ?? "").getTime() - new Date(a.date ?? "").getTime();
//       }
//     });
//     return arr;
//   }, [filtered, sortBy]);

//   const featuredPost = posts.find((p) => p.featured) ?? posts[0];

//   const handlePostClick = (post: BlogPost) => {
//     const slug = post.slug ?? String(post.id);
//     navigate(`/blogs/${encodeURIComponent(slug)}`);
//     setSelectedPostSlug(slug);
//     if (onPageChange) onPageChange(1);
//   };

//   const handleBackToBlog = () => {
//     navigate(`/blogs`);
//     setSelectedPostSlug(null);
//     setSelectedPostObj(null);
//   };

//   const noPostsForFilter = !loading && !error && sortedPosts.length === 0;

//   // If a post is selected, render BlogDetailPage
//   if (selectedPostSlug) {
//     return (
//       <BlogDetailPage
//         slug={selectedPostSlug}
//         post={(selectedPostObj as DetailBlogPost) ?? undefined}
//         loading={loadingDetail}
//         onBack={handleBackToBlog}
//       />
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Hero */}
//       <div className="py-40 pt-28" style={{ background: "linear-gradient(to right, #0b3856, #0c3854)" }}>
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <h2 className="text-3xl font-bold mb-3 text-white">Real Estate Insights & News</h2>
//           <p className="text-lg mb-10 text-blue-100 max-w-3xl mx-auto leading-relaxed">
//             Stay informed with the latest market trends, expert tips, and property updates.
//             From buying and selling guidance to investment insights and design ideas — everything you need in one place.
//           </p>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
//         {/* Featured */}
//         {loading ? (
//           <div className="bg-white rounded-2xl p-8 text-center">Loading posts...</div>
//         ) : error ? (
//           <div className="bg-white rounded-2xl p-8 text-center text-red-600">{error}</div>
//         ) : featuredPost ? (
//           <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
//             <div className="md:flex">
//               {featuredPost.image ? (
//                 <div className="md:w-1/2">
//                   <img
//                     src={featuredPost.image}
//                     alt={featuredPost.title}
//                     className="w-full h-56 md:h-full object-cover" // fixed h-50 → h-56
//                   />
//                 </div>
//               ) : null}
//               <div className="md:w-1/2 p-8">
//                 <div className="flex items-center mb-4">
//                   <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
//                     Featured
//                   </span>
//                   <span className="ml-3 text-gray-500 text-sm">{featuredPost.category}</span>
//                 </div>
//                 <h2 className="text-xl font-bold text-gray-900 mb-4">{featuredPost.title}</h2>
//                 <p className="text-gray-600 mb-6 leading-relaxed">{featuredPost.excerpt}</p>
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center space-x-4 text-sm text-gray-500">
//                     <div className="flex items-center">
//                       <User className="w-4 h-4 mr-1" />
//                       {featuredPost.author}
//                     </div>
//                     <div className="flex items-center">
//                       <Calendar className="w-4 h-4 mr-1" />
//                       {new Date(featuredPost.date ?? "").toLocaleDateString()}
//                     </div>
//                     <div className="flex items-center">
//                       <Clock className="w-4 h-4 mr-1" />
//                       {featuredPost.readTime}
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => handlePostClick(featuredPost)}
//                     className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
//                   >
//                     Read More <ArrowRight className="w-4 h-4 ml-1" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ) : null}

//         {/* Search & Filters */}
//         <div className="py-2">
//           <div className="flex flex-col md:flex-row gap-4 mb-8">
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="text"
//                 placeholder="Search articles..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>

//             <select
//               value={sortBy}
//               onChange={(e) => setSortBy(e.target.value as any)}
//               className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="newest">Newest First</option>
//               <option value="oldest">Oldest First</option>
//               <option value="popular">Most Popular</option>
//               <option value="trending">Trending</option>
//             </select>

//             <div className="flex gap-2 flex-wrap">
//               {categories.map((cat) => (
//                 <button
//                   key={cat}
//                   onClick={() => setSelectedCategory(cat)}
//                   className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategory === cat
//                       ? "bg-blue-600 text-white"
//                       : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
//                     }`}
//                 >
//                   {cat}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Posts grid or "No posts" message */}
//           {!loading && !error && noPostsForFilter ? (
//             <div className="bg-white rounded-2xl p-8 text-center shadow-md">
//               <h3 className="text-2xl font-semibold text-gray-900 mb-2">No posts available</h3>
//               <p className="text-gray-600 mb-6">
//                 {searchTerm ? (
//                   <>
//                     No articles found for <span className="font-medium">"{searchTerm}"</span>
//                     {selectedCategory && selectedCategory !== "All" ? (
//                       <>
//                         {" "}
//                         in <span className="font-medium">{selectedCategory}</span>
//                       </>
//                     ) : null}
//                     .
//                   </>
//                 ) : (
//                   <>
//                     There are no articles in{" "}
//                     <span className="font-medium">
//                       {selectedCategory === "All" ? "the selected filters" : selectedCategory}
//                     </span>
//                     .
//                   </>
//                 )}
//               </p>
//             </div>
//           ) : (
//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//               {sortedPosts.map((post) => (
//                 <article
//                   key={post.id}
//                   className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer relative"
//                   onClick={() => handlePostClick(post)}
//                 >
//                   {post.image ? (
//                     <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
//                   ) : null}
//                   <div className="absolute top-3 left-3 flex space-x-2">
//                     <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
//                       {post.category}
//                     </span>
//                     {post.featured && (
//                       <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
//                         Featured
//                       </span>
//                     )}
//                   </div>
//                   <div className="p-6">
//                     <div className="flex items-center justify-between mb-3">
//                       <div className="flex items-center text-gray-500 text-sm">
//                         <div className="flex items-center">
//                           <Clock className="w-4 h-4 mr-1" />
//                           {post.readTime}
//                         </div>
//                       </div>
//                       <div className="flex items-center space-x-3 text-sm text-gray-500">
//                         <span className="flex items-center space-x-1">
//                           <Eye size={14} />
//                           <span>{post.views ?? 0}</span>
//                         </span>
//                         <span className="flex items-center space-x-1">
//                           <Heart size={14} />
//                           <span>{post.likes ?? 0}</span>
//                         </span>
//                       </div>
//                     </div>
//                     <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{post.title}</h3>
//                     <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
//                     <div className="flex flex-wrap gap-2 mb-4">
//                       {(post.tags || []).map((tag) => (
//                         <span
//                           key={tag}
//                           className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded"
//                         >
//                           <Tag className="w-3 h-3 mr-1" />
//                           {tag}
//                         </span>
//                       ))}
//                     </div>

//                     <div className="flex items-center justify-between pt-4 border-t border-gray-100">
//                       <div className="flex items-center space-x-3">
//                         <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
//                           <span className="text-white text-sm font-bold">
//                             {String(post.author || "A")
//                               .split(" ")
//                               .map((n) => n[0])
//                               .join("")}
//                           </span>
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium text-gray-900">{post.author}</p>
//                           <p className="text-xs text-gray-500">
//                             {new Date(post.date ?? "").toLocaleDateString()}
//                           </p>
//                         </div>
//                       </div>

//                       <div className="flex items-center gap-4">
//                         <div className="flex items-center space-x-3 text-xs text-gray-500">
//                           <span className="flex items-center space-x-1">
//                             <MessageSquare size={12} />
//                             <span>{post.comments ?? 0} comments</span>
//                           </span>
//                         </div>
//                         <button className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
//                           Read <ArrowRight className="w-4 h-4 ml-1" />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </article>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Newsletter */}
//         <div className="mt-5 mb-5 bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 md:p-12 text-center">
//           <h2 className="text-2xl font-bold text-white mb-2">Stay Updated with Our Newsletter</h2>
//           <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
//             Get the latest real estate insights, market updates, and expert tips delivered directly to your inbox.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
//             <input
//               type="email"
//               placeholder="Enter your email"
//               className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
//             />
//             <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
//               Subscribe
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BlogsPage;

// src/pages/public/BlogsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  User,
  ArrowRight,
  Search,
  Tag,
  Clock,
  Eye,
  Heart,
  MessageSquare,
} from "lucide-react";
import BlogDetailPage, { BlogPost as DetailBlogPost } from "@/pages/public/BlogDetailPage";
// ✅ Use named public endpoints so drafts never leak
import blogsAPI, { getPublicPosts, getPublicPostBySlug } from "@/lib/blogsAPI";
import { useNavigate, useParams } from "react-router-dom";

/* -------------------------------------------------------------
   Types (keep aligned with backend but flexible on optionality)
------------------------------------------------------------- */
export interface BlogPost {
  id: number | string;
  title: string;
  excerpt?: string;
  content?: string;
  author?: string;
  date?: string; // ISO
  category?: string;
  readTime?: string;
  image?: string;
  tags?: string[];
  views?: number;
  likes?: number;
  comments?: number;
  featured?: boolean;
  slug?: string;
  // optional fields used in dashboard variants
  sourceId?: string | number;
  sourceName?: string;
}

export interface BlogDetailPageProps {
  slug?: string;
  post?: BlogPost;
  loading?: boolean;
  onBack?: () => void;
}

/* -------------------------------------------------------------
   Helpers
------------------------------------------------------------- */
type AnyRec = Record<string, unknown>;
const isObj = (v: unknown): v is AnyRec => !!v && typeof v === "object";
const isArr = (v: unknown): v is any[] => Array.isArray(v);

/** Accepts: BlogPost[], {data|items|posts|results: BlogPost[]}, BlogPost, or garbage; returns BlogPost[] */
const unwrapArray = (raw: unknown): any[] => {
  if (isArr(raw)) return raw;
  if (!isObj(raw)) return [];
  if ("data" in raw && isArr((raw as AnyRec).data)) return (raw as AnyRec).data as any[];
  if ("items" in raw && isArr((raw as AnyRec).items)) return (raw as AnyRec).items as any[];
  if ("posts" in raw && isArr((raw as AnyRec).posts)) return (raw as AnyRec).posts as any[];
  if ("results" in raw && isArr((raw as AnyRec).results)) return (raw as AnyRec).results as any[];
  const r = raw as AnyRec;
  if (r?.id || r?.title || r?.slug) return [r];
  return [];
};

/** Accepts: BlogPost or {data: BlogPost} or garbage; returns BlogPost | undefined */
const unwrapSingle = <T = any>(raw: unknown): T | undefined => {
  if (!isObj(raw)) return undefined;
  if ("data" in raw) return (raw as AnyRec).data as T;
  return raw as T;
};

function safeParseTags(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map((x) => String(x));
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed.map((x) => String(x));
    } catch {
      return v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
}

function slugFromTitle(t?: any): string | undefined {
  if (!t || typeof t !== "string") return undefined;
  return String(t)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

const defaultCategories = [
  "All",
  "Investment",
  "Market Analysis",
  "Buying Guide",
  "Construction",
  "Property Management",
  "Commercial",
];

/* -------------------------------------------------------------
   Component
------------------------------------------------------------- */
const BlogsPage: React.FC<{ onPageChange?: (n: number) => void }> = ({ onPageChange }) => {
  const navigate = useNavigate();
  const params = useParams<{ slug?: string }>();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPostSlug, setSelectedPostSlug] = useState<string | null>(null);
  const [selectedPostObj, setSelectedPostObj] = useState<BlogPost | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular" | "trending">("newest");

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(() => defaultCategories, []);

  // Sync route param to selectedPostSlug (so /blogs/:slug opens detail)
  useEffect(() => {
    const routeSlug = params.slug ?? null;
    setSelectedPostSlug(routeSlug);
  }, [params.slug]);

  // Load posts list (supports multiple backend shapes)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // ✅ public-only endpoint (named export)
        const raw: unknown = await getPublicPosts();
        const list = unwrapArray(raw);

        const normalized: BlogPost[] = list.map((p: any, idx: number) => {
          const tags = safeParseTags(p.tags ?? p.tag ?? []);
          const slug = p.slug ?? p.slugified ?? slugFromTitle(p.title) ?? String(p.id ?? idx);
          const image = p.featuredImage ?? p.featured_image ?? p.image ?? "";
          const date =
            p.publishedAt ??
            p.published_at ??
            p.createdAt ??
            p.created_at ??
            new Date().toISOString();

          return {
            id: p.id ?? p._id ?? slug ?? idx,
            slug,
            title: p.title ?? "Untitled",
            excerpt:
              p.excerpt ??
              (typeof p.content === "string"
                ? p.content.slice(0, 160) + (p.content.length > 160 ? "…" : "")
                : ""),
            content: p.content ?? "",
            author: p.author ?? "Admin",
            date,
            category: p.category ?? "Uncategorized",
            readTime: p.readTime
              ? String(p.readTime)
              : p.read_time
                ? String(p.read_time)
                : "5 min read",
            image,
            tags,
            views: Number(p.views ?? 0),
            likes: Number(p.likes ?? 0),
            comments: Number(p.comments ?? 0),
            featured: !!p.featured,
            sourceId: p.sourceId,
            sourceName: p.sourceName,
          } as BlogPost;
        });

        if (!cancelled) setPosts(normalized);
      } catch (err: any) {
        console.error("Failed fetching posts", err);
        if (!cancelled) setError(err?.message || "Failed to load posts");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // When a slug is selected (via state), fetch post by slug and pass it down
  useEffect(() => {
    if (!selectedPostSlug) {
      setSelectedPostObj(null);
      return;
    }
    let cancelled = false;
    const loadDetail = async () => {
      setLoadingDetail(true);
      try {
        // ✅ public-only endpoint for detail
        const res: unknown = await getPublicPostBySlug(selectedPostSlug);
        const post = unwrapSingle<any>(res);
        if (!post) {
          if (!cancelled) setSelectedPostObj(null);
          return;
        }
        const normalized: BlogPost = {
          id: post.id ?? post._id ?? post.slug ?? selectedPostSlug,
          slug: post.slug ?? selectedPostSlug,
          title: post.title ?? "Untitled",
          excerpt:
            post.excerpt ??
            (typeof post.content === "string"
              ? post.content.slice(0, 160) + (post.content.length > 160 ? "…" : "")
              : ""),
          content: post.content ?? "",
          author: post.author ?? "Admin",
          date:
            post.publishedAt ??
            post.published_at ??
            post.createdAt ??
            post.created_at ??
            new Date().toISOString(),
          category: post.category ?? "Uncategorized",
          readTime: post.readTime
            ? String(post.readTime)
            : post.read_time
              ? String(post.read_time)
              : "5 min read",
          image: post.featuredImage ?? post.featured_image ?? post.image ?? "",
          tags: safeParseTags(post.tags ?? []),
          views: Number(post.views ?? 0),
          likes: Number(post.likes ?? 0),
          comments: Number(post.comments ?? 0),
          featured: !!post.featured,
          sourceId: post.sourceId,
          sourceName: post.sourceName,
        };
        if (!cancelled) setSelectedPostObj(normalized);
      } catch (err) {
        console.error("Failed loading post by slug", err);
        if (!cancelled) setSelectedPostObj(null);
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    };
    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [selectedPostSlug]);

  // filters & sorting
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesSearch =
        !term ||
        (post.title && post.title.toLowerCase().includes(term)) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(term)) ||
        (post.tags && post.tags.some((t) => t.toLowerCase().includes(term)));
      const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [posts, searchTerm, selectedCategory]);

  const sortedPosts = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.date ?? "").getTime() - new Date(b.date ?? "").getTime();
        case "popular":
          return (b.views || 0) - (a.views || 0);
        case "trending":
          return (b.likes || 0) - (a.likes || 0);
        default:
          return new Date(b.date ?? "").getTime() - new Date(a.date ?? "").getTime();
      }
    });
    return arr;
  }, [filtered, sortBy]);

  const featuredPost = posts.find((p) => p.featured) ?? posts[0];

  const handlePostClick = (post: BlogPost) => {
    const slug = post.slug ?? String(post.id);
    navigate(`/blogs/${encodeURIComponent(slug)}`);
    setSelectedPostSlug(slug);
    if (onPageChange) onPageChange(1);
  };

  const handleBackToBlog = () => {
    navigate(`/blogs`);
    setSelectedPostSlug(null);
    setSelectedPostObj(null);
  };

  const noPostsForFilter = !loading && !error && sortedPosts.length === 0;

  // If a post is selected, render BlogDetailPage
  if (selectedPostSlug) {
    return (
      <BlogDetailPage
        slug={selectedPostSlug}
        post={(selectedPostObj as DetailBlogPost) ?? undefined}
        loading={loadingDetail}
        onBack={handleBackToBlog}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Hero - Fully Responsive */}
      <div
        className="py-32"
        style={{ background: "linear-gradient(135deg, #0b3856 0%, #0c3854 50%, #1a4d6d 100%)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-3 text-white">
            Real Estate Insights & News
          </h2>
          <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 md:mb-10 text-blue-100 max-w-3xl mx-auto leading-relaxed px-4">
            Stay informed with the latest market trends, expert tips, and property updates.
            From buying and selling guidance to investment insights and design ideas — everything you need in one place.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 -mt-6 sm:-mt-8 md:-mt-10 relative z-10">
        {/* Featured Post - Enhanced Responsive */}
        {loading ? (
          <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center shadow-xl">
            <div className="animate-pulse">Loading posts...</div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center text-red-600 shadow-xl">
            {error}
          </div>
        ) : featuredPost ? (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden mb-6 sm:mb-8 hover:shadow-3xl transition-all duration-300">
            <div className="flex flex-col md:flex-row">
              {featuredPost.image ? (
                <div className="w-full md:w-1/2 relative overflow-hidden group">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-48 sm:h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent md:hidden"></div>
                </div>
              ) : null}
              <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-8 lg:p-10">
                <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                  <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                    Featured
                  </span>
                  <span className="ml-1 text-gray-600 text-xs sm:text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
                    {featuredPost.category}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight hover:text-blue-600 transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed line-clamp-3">
                  {featuredPost.excerpt}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="truncate max-w-[100px] sm:max-w-none">{featuredPost.author}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="hidden sm:inline">{new Date(featuredPost.date ?? "").toLocaleDateString()}</span>
                      <span className="sm:hidden">{new Date(featuredPost.date ?? "").toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      {featuredPost.readTime}
                    </div>
                  </div>
                  <button
                    onClick={() => handlePostClick(featuredPost)}
                    className="flex items-center justify-center sm:justify-start text-blue-600 hover:text-blue-700 font-semibold transition-all hover:gap-2 gap-1 text-sm sm:text-base group"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Search & Filters - Mobile Optimized */}
        <div className="py-2 sm:py-4">
          <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
            {/* Search and Sort Row */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm min-w-[140px] sm:min-w-[160px]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
                <option value="trending">Trending</option>
              </select>
            </div>

            {/* Category Filters - Horizontal Scroll on Mobile */}
            <div className="overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
              <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${selectedCategory === cat
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-blue-300"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Posts grid or "No posts" message */}
          {!loading && !error && noPostsForFilter ? (
            <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center shadow-lg">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">No posts available</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  {searchTerm ? (
                    <>
                      No articles found for <span className="font-medium">"{searchTerm}"</span>
                      {selectedCategory && selectedCategory !== "All" ? (
                        <>
                          {" "}
                          in <span className="font-medium">{selectedCategory}</span>
                        </>
                      ) : null}
                      .
                    </>
                  ) : (
                    <>
                      There are no articles in{" "}
                      <span className="font-medium">
                        {selectedCategory === "All" ? "the selected filters" : selectedCategory}
                      </span>
                      .
                    </>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {sortedPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1"
                  onClick={() => handlePostClick(post)}
                >
                  {post.image ? (
                    <div className="relative overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-44 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  ) : (
                    <div className="w-full h-44 sm:h-48 bg-gradient-to-br from-blue-500 to-purple-600"></div>
                  )}
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-wrap gap-1.5 sm:gap-2 max-w-[calc(100%-1rem)]">
                    <span className="bg-blue-600 text-white px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold shadow-lg">
                      {post.category}
                    </span>
                    {post.featured && (
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold shadow-lg">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="p-4 sm:p-5 lg:p-6">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {post.readTime}
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Eye size={12} className="sm:w-3.5 sm:h-3.5" />
                          <span>{post.views ?? 0}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Heart size={12} className="sm:w-3.5 sm:h-3.5" />
                          <span>{post.likes ?? 0}</span>
                        </span>
                      </div>
                    </div>
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      {(post.tags || []).slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center text-[10px] sm:text-xs text-gray-500 bg-gray-100 px-2 py-0.5 sm:py-1 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                          <span className="truncate max-w-[80px] sm:max-w-none">{tag}</span>
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 sm:pt-4 border-t border-gray-100 gap-3 sm:gap-0">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-white text-[10px] sm:text-xs font-bold">
                            {String(post.author || "A")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{post.author}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">
                            {new Date(post.date ?? "").toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: window.innerWidth > 640 ? 'numeric' : undefined
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                        <div className="flex items-center text-[10px] sm:text-xs text-gray-500">
                          <MessageSquare size={12} className="mr-1" />
                          <span className="hidden sm:inline">{post.comments ?? 0} comments</span>
                          <span className="sm:hidden">{post.comments ?? 0}</span>
                        </div>
                        <button className="flex items-center text-blue-600 hover:text-blue-700 font-semibold text-xs sm:text-sm transition-all group-hover:gap-1.5 gap-1">
                          Read
                          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Newsletter - Fully Responsive */}
        <div className="mt-8 sm:mt-12 mb-6 sm:mb-8 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 text-center shadow-2xl">
          <div className="max-w-2xl mx-auto">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3 leading-tight">
              Stay Updated with Our Newsletter
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-blue-100 mb-6 sm:mb-8 leading-relaxed px-2">
              Get the latest real estate insights, market updates, and expert tips delivered directly to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 shadow-lg"
              />
              <button className="bg-white text-blue-600 px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogsPage;