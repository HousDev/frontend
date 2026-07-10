

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
   Default Images by Category
------------------------------------------------------------- */
const DEFAULT_BLOG_IMAGES = {
  // Category-based defaults
  "Real Estate": "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Investment": "https://images.pexels.com/photos/210607/pexels-photo-210607.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Market Analysis": "https://images.pexels.com/photos/210607/pexels-photo-210607.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Legal": "https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Home Buying": "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Home Selling": "https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Property News": "https://images.pexels.com/photos/209251/pexels-photo-209251.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Construction": "https://images.pexels.com/photos/256381/pexels-photo-256381.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Finance": "https://images.pexels.com/photos/210574/pexels-photo-210574.jpeg?auto=compress&cs=tinysrgb&w=800",

  // Fallbacks
  "Uncategorized": "https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=800",
  "DEFAULT": "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800",
  "FEATURED": "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=800"
};

// ✅ Function to get default image based on category
const getDefaultBlogImageByCategory = (category?: string): string => {
  if (!category) return DEFAULT_BLOG_IMAGES.DEFAULT;

  // Direct match
  if (DEFAULT_BLOG_IMAGES[category as keyof typeof DEFAULT_BLOG_IMAGES]) {
    return DEFAULT_BLOG_IMAGES[category as keyof typeof DEFAULT_BLOG_IMAGES];
  }

  // Partial match
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes("real estate") || categoryLower.includes("property")) {
    return DEFAULT_BLOG_IMAGES["Real Estate"];
  }
  if (categoryLower.includes("investment") || categoryLower.includes("roi")) {
    return DEFAULT_BLOG_IMAGES["Investment"];
  }
  if (categoryLower.includes("market")) {
    return DEFAULT_BLOG_IMAGES["Market Analysis"];
  }
  if (categoryLower.includes("legal") || categoryLower.includes("law")) {
    return DEFAULT_BLOG_IMAGES["Legal"];
  }
  if (categoryLower.includes("buy") || categoryLower.includes("purchase")) {
    return DEFAULT_BLOG_IMAGES["Home Buying"];
  }
  if (categoryLower.includes("sell")) {
    return DEFAULT_BLOG_IMAGES["Home Selling"];
  }
  if (categoryLower.includes("construction") || categoryLower.includes("build")) {
    return DEFAULT_BLOG_IMAGES["Construction"];
  }
  if (categoryLower.includes("finance") || categoryLower.includes("loan") || categoryLower.includes("mortgage")) {
    return DEFAULT_BLOG_IMAGES["Finance"];
  }

  return DEFAULT_BLOG_IMAGES.DEFAULT;
};

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
  "Real Estate",
  "Investment",
  "Market Analysis",
  "Legal",
  "Home Buying",
  "Home Selling",
  "Property News",
  "Construction",
  "Finance",
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

  // 🔢 dynamic comment counts pulled from public comments API
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

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

          // ✅ Get category for default image
          const category = p.category ?? "Uncategorized";

          // ✅ Get image with proper fallback
          let image = p.featuredImage ?? p.featured_image ?? p.image ?? "";
          if (!image) {
            // If no image from backend, use default based on category
            image = getDefaultBlogImageByCategory(category);

            // If featured post, use featured default image
            if (p.featured) {
              image = DEFAULT_BLOG_IMAGES.FEATURED;
            }
          }

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
            category,
            readTime: p.readTime
              ? String(p.readTime)
              : p.read_time
                ? String(p.read_time)
                : "5 min read",
            image, // ✅ Now image will never be empty
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

  // ✨ After posts load, fetch per-post comment counts (public API) if missing/stale
  useEffect(() => {
    if (!posts || posts.length === 0) return;

    let cancelled = false;

    // limit concurrency so network stays happy
    const pMapLimited = async <T, R>(
      list: T[],
      limit: number,
      mapper: (item: T, index: number) => Promise<R>
    ): Promise<R[]> => {
      const results: R[] = new Array(list.length) as any;
      let i = 0;
      const workers = new Array(Math.min(limit, list.length)).fill(0).map(async () => {
        while (i < list.length) {
          const cur = i++;
          results[cur] = await mapper(list[cur], cur);
        }
      });
      await Promise.all(workers);
      return results;
    };

    const needCounts = posts.filter((p) => {
      const slug = p.slug ?? String(p.id);
      // only fetch if backend didn't give a count or it's zero
      const already = commentCounts[slug];
      const given = typeof p.comments === "number" ? p.comments : undefined;
      return (already == null && (!given || given < 1)) || already === 0;
    });

    if (needCounts.length === 0) return;

    (async () => {
      try {
        await pMapLimited(needCounts, 4, async (p) => {
          if (cancelled) return 0 as any;
          const slug = p.slug ?? String(p.id);
          let res: unknown;
          try {
            if ((blogsAPI as any).getCommentsByPostSlug) {
              res = await (blogsAPI as any).getCommentsByPostSlug(slug);
            } else if (blogsAPI.getComments) {
              res = await blogsAPI.getComments(slug);
            } else {
              return 0 as any;
            }
            const arr = unwrapArray(res);
            const cnt = Array.isArray(arr) ? arr.length : 0;
            if (!cancelled) {
              setCommentCounts((prev) => ({ ...prev, [slug]: cnt }));
            }
            return cnt as any;
          } catch {
            if (!cancelled) {
              setCommentCounts((prev) => ({ ...prev, [slug]: prev[slug] ?? (p.comments ?? 0) }));
            }
            return 0 as any;
          }
        });
      } catch {
        /* ignore batch errors */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [posts]);

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

        // ✅ Get category for default image
        const category = post.category ?? "Uncategorized";

        // ✅ Get image with proper fallback
        let image = post.featuredImage ?? post.featured_image ?? post.image ?? "";
        if (!image) {
          image = getDefaultBlogImageByCategory(category);
          if (post.featured) {
            image = DEFAULT_BLOG_IMAGES.FEATURED;
          }
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
          category,
          readTime: post.readTime
            ? String(post.readTime)
            : post.read_time
              ? String(post.read_time)
              : "5 min read",
          image, // ✅ Now image will never be empty
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
              {/* ✅ Featured post image with fallback */}
              <div className="w-full md:w-1/2 relative overflow-hidden group">
                <img
                  src={featuredPost.image || DEFAULT_BLOG_IMAGES.FEATURED}
                  alt={featuredPost.title}
                  className="w-full h-48 sm:h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // If image fails to load, use category-based default
                    const target = e.target as HTMLImageElement;
                    target.src = getDefaultBlogImageByCategory(featuredPost.category);
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent md:hidden"></div>
              </div>
              <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-8 lg:p-10">
                <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                  <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-lg">
                    Featured
                  </span>
                  <span className="ml-1 text-gray-600 text-xs sm:text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">
                    {featuredPost.category}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-3 sm:mb-4 leading-tight hover:text-orange-500 transition-colors">
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
                    className="flex items-center justify-center gap-2 bg-[#E6761D] hover:bg-[#CC6A1A] text-white font-semibold px-4 py-2 rounded-md shadow-sm transition-all"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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
                      ? "bg-[#E6761D]  hover:bg-[#E6761D] text-white shadow-lg scale-105"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
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
              {sortedPosts.map((post) => {
                const slug = post.slug ?? String(post.id);
                const liveComments = commentCounts[slug];
                const showComments = typeof liveComments === "number" ? liveComments : (post.comments ?? 0);

                return (
                  <article
                    key={post.id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1"
                    onClick={() => handlePostClick(post)}
                  >
                    <div className="relative overflow-hidden">
                      {/* ✅ Blog post image with fallback */}
                      <img
                        src={post.image || getDefaultBlogImageByCategory(post.category)}
                        alt={post.title}
                        className="w-full h-44 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          // If image fails to load, use category-based default
                          const target = e.target as HTMLImageElement;
                          target.src = getDefaultBlogImageByCategory(post.category);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

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
                            {/* <Eye size={12} className="sm:w-3.5 sm:h-3.5" />
                            <span>{post.views ?? 0}</span> */}
                          </span>
                          <span className="flex items-center space-x-1">
                            {/* <Heart size={12} className="sm:w-3.5 sm:h-3.5" />
                            <span>{post.likes ?? 0}</span> */}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-2 sm:mb-3 line-clamp-2 group-hover:text-orange-500 transition-colors leading-tight">
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
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center ring-1 ring-gray-200  flex-shrink-0">
                            <span className="text-black text-[10px] sm:text-xs font-bold">
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
                              {new Date(post.date ?? "").toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: window.innerWidth > 640 ? "numeric" : undefined,
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                          <div className="flex items-center text-[10px] sm:text-xs text-gray-500">
                            <MessageSquare size={12} className="mr-1" />
                            <span className="hidden sm:inline">{showComments} comments</span>
                            <span className="sm:hidden">{showComments}</span>
                          </div>
                          <button
                            className="group flex items-center justify-center gap-2 bg-[#E6761D] hover:bg-[#CC6A1A] text-white font-semibold text-xs sm:text-sm px-2 py-1 rounded-md shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                          >
                            Read
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-0.5" />
                          </button>

                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Newsletter - Fully Responsive */}
        <div
          className="mt-2 sm:mt-12 mb-1 rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-10 lg:p-12 text-center shadow-2xl"
          style={{ background: "linear-gradient(to right, #0b3856, #0c3854)" }}
        >
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
              <button className="w-full sm:w-auto bg-[#E6761D] hover:bg-[#CC6A1A] text-white px-5 py-3 rounded-xl font-semibold shadow-md transition-colors duration-300">
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