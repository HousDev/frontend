// src/components/BlogsPage.tsx
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
import blogsAPI from "@/lib/blogsAPI";
import { useNavigate, useParams } from "react-router-dom";

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
}
export interface BlogDetailPageProps {
  slug?: string;
  post?: BlogPost;
  loading?: boolean;
  onBack?: () => void;
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

function safeParseTags(v: any): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.map((x) => String(x));
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed.map((x) => String(x));
    } catch {
      return v.split(",").map((s) => s.trim()).filter(Boolean);
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

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await blogsAPI.getAllPosts?.() ?? [];
        // normalize possible shapes
        let list: any[] = [];
        if (Array.isArray(raw)) list = raw;
        else if (raw?.data && Array.isArray(raw.data)) list = raw.data;
        else if (raw?.items && Array.isArray(raw.items)) list = raw.items;
        else if (raw?.posts && Array.isArray(raw.posts)) list = raw.posts;
        else if (raw?.results && Array.isArray(raw.results)) list = raw.results;
        else if (raw && typeof raw === "object") {
          if (raw.id || raw.title || raw.slug) list = [raw];
          else list = [];
        }

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
              (typeof p.content === "string" ? (p.content.slice(0, 160) + (p.content.length > 160 ? "…" : "")) : ""),
            content: p.content ?? "",
            author: p.author ?? "Admin",
            date,
            category: p.category ?? "Uncategorized",
            readTime: p.readTime ? String(p.readTime) : p.read_time ? String(p.read_time) : "5 min read",
            image,
            tags,
            views: Number(p.views ?? 0),
            likes: Number(p.likes ?? 0),
            comments: Number(p.comments ?? 0),
            featured: !!p.featured,
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
        const res = await blogsAPI.getPostBySlug(selectedPostSlug);
        const post = res?.data ?? res;
        if (!post) {
          setSelectedPostObj(null);
          return;
        }
        const normalized: BlogPost = {
          id: post.id ?? post._id ?? post.slug ?? selectedPostSlug,
          slug: post.slug ?? selectedPostSlug,
          title: post.title ?? "Untitled",
          excerpt:
            post.excerpt ?? (typeof post.content === "string" ? (post.content.slice(0, 160) + (post.content.length > 160 ? "…" : "")) : ""),
          content: post.content ?? "",
          author: post.author ?? "Admin",
          date:
            post.publishedAt ?? post.published_at ?? post.createdAt ?? post.created_at ?? new Date().toISOString(),
          category: post.category ?? "Uncategorized",
          readTime: post.readTime ? String(post.readTime) : post.read_time ? String(post.read_time) : "5 min read",
          image: post.featuredImage ?? post.featured_image ?? post.image ?? "",
          tags: safeParseTags(post.tags ?? []),
          views: Number(post.views ?? 0),
          likes: Number(post.likes ?? 0),
          comments: Number(post.comments ?? 0),
          featured: !!post.featured,
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
    // navigate to /blogs/{slug} so the URL shows slug
    navigate(`/blogs/${encodeURIComponent(slug)}`);
    // selectedPostSlug will also be set by the route-param effect above,
    // but set it here proactively to reduce perceived latency
    setSelectedPostSlug(slug);
    if (onPageChange) onPageChange(1);
  };

  const handleBackToBlog = () => {
    // navigate back to the list route (without slug)
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
        post={selectedPostObj ?? undefined}
        loading={loadingDetail}
        onBack={handleBackToBlog}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Real Estate Insights & News
          </h2>
          <p className="text-xl mb-10 text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Stay informed with the latest market trends, expert tips, and property updates.
            From buying and selling guidance to investment insights and design ideas — everything you need in one place.
          </p>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        {/* Featured */}
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center">Loading posts...</div>
        ) : error ? (
          <div className="bg-white rounded-2xl p-8 text-center text-red-600">{error}</div>
        ) : featuredPost ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="md:flex">
              {featuredPost.image ? (
                <div className="md:w-1/2">
                  <img src={featuredPost.image} alt={featuredPost.title} className="w-full h-50 md:h-full object-cover" />
                </div>
              ) : null}
              <div className="md:w-1/2 p-8">
                <div className="flex items-center mb-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">Featured</span>
                  <span className="ml-3 text-gray-500 text-sm">{featuredPost.category}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">{featuredPost.title}</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">{featuredPost.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center"><User className="w-4 h-4 mr-1" />{featuredPost.author}</div>
                    <div className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{new Date(featuredPost.date ?? "").toLocaleDateString()}</div>
                    <div className="flex items-center"><Clock className="w-4 h-4 mr-1" />{featuredPost.readTime}</div>
                  </div>
                  <button onClick={() => handlePostClick(featuredPost)} className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors">
                    Read More <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Search & Filters */}
        <div className="py-2">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
              <option value="trending">Trending</option>
            </select>

            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Posts grid or "No posts" message */}
          {noPostsForFilter ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-md">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No posts available</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? (
                  <>No articles found for <span className="font-medium">"{searchTerm}"</span>{selectedCategory && selectedCategory !== "All" ? <> in <span className="font-medium">{selectedCategory}</span></> : null}.</>
                ) : (
                  <>There are no articles in <span className="font-medium">{selectedCategory === "All" ? "the selected filters" : selectedCategory}</span>.</>
                )}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer relative" onClick={() => handlePostClick(post)}>
                  {post.image ? <img src={post.image} alt={post.title} className="w-full h-48 object-cover" /> : null}
                  <div className="absolute top-3 left-3 flex space-x-2">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">{post.category}</span>
                    {post.featured && <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">Featured</span>}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-gray-500 text-sm">
                        <div className="flex items-center"><Clock className="w-4 h-4 mr-1" />{post.readTime}</div>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <span className="flex items-center space-x-1"><Eye size={14} /><span>{post.views ?? 0}</span></span>
                        <span className="flex items-center space-x-1"><Heart size={14} /><span>{post.likes ?? 0}</span></span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(post.tags || []).map((tag) => <span key={tag} className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded"><Tag className="w-3 h-3 mr-1" />{tag}</span>)}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {String(post.author || "A").split(" ").map(n => n[0]).join("")}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{post.author}</p>
                          <p className="text-xs text-gray-500">{new Date(post.date ?? "").toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span className="flex items-center space-x-1"><MessageSquare size={12} /><span>{post.comments ?? 0} comments</span></span>
                        </div>
                        <button className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
                          Read <ArrowRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Newsletter */}
        <div className="mt-5 mb-5 bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Stay Updated with Our Newsletter</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">Get the latest real estate insights, market updates, and expert tips delivered directly to your inbox.</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600" />
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">Subscribe</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogsPage;
