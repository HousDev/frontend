// src/pages/public/BlogDetailPage.tsx
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Tag,
  User,
  Eye,
  Share as ShareIcon,
  Bookmark,
  MessageSquare,
  Heart,
  X,
} from "lucide-react";
import blogsAPI, { getPublicPosts } from "@/lib/blogsAPI"; // ⬅️ use public API for lists
import { useNavigate } from "react-router-dom";
import ShareModalBlog from "./ShareModalBlog";

export interface BlogPost {
  id: number | string;
  title: string;
  excerpt?: string;
  content?: string;
  author?: string;
  date?: string;
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

export interface BlogComment {
  id: string | number;
  postId?: string | number;
  author?: string;
  email?: string;
  content: string;
  date?: string;
}

const LOCAL_BOOKMARKS_KEY = "bookmarks:v1";
const LOCAL_LIKES_KEY = "likes:v1";

/** ---------- Safe helpers ---------- */
type AnyRec = Record<string, unknown>;
const isObj = (v: unknown): v is AnyRec => !!v && typeof v === "object";
const isArr = (v: unknown): v is any[] => Array.isArray(v);

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
      return v.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

/* ----------------------- visibility helper ----------------------- */
const isPublicFromRaw = (p: any) => {
  const v = (x: any) => String(x ?? "").toLowerCase();
  const has = (k: string) => Object.prototype.hasOwnProperty.call(p || {}, k);
  if (!p) return true;

  if (has("visibility")) {
    const x = v(p.visibility);
    if (x === "public") return true;
    if (x === "private") return false;
  }
  if (has("status")) {
    const x = v(p.status);
    if (x === "published" || x === "active" || x === "public") return true;
    if (x === "draft" || x === "inactive" || x === "private") return false;
  }
  if (has("isPublic")) return !!p.isPublic;
  if (has("is_public")) return !!p.is_public;
  if (has("published")) return !!p.published;
  if (has("draft")) return !p.draft;
  return true;
};
/* ----------------------------------------------------------------- */

/* -------------------- Helper subcomponent -------------------- */
const CommentComposer: React.FC<{
  onPost: (text: string, author?: string, email?: string) => void;
  posting?: boolean;
}> = ({ onPost, posting }) => {
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="border border-gray-200 rounded-xl p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-gray-50 to-white shadow-sm">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Share your thoughts..."
        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none transition-all"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
        <input
          className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base transition-all"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base transition-all"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end">
        <button
          onClick={() => {
            setText("");
            setName("");
            setEmail("");
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-sm sm:text-base font-medium"
        >
          Clear
        </button>
        <button
          onClick={() => {
            onPost(text, name, email);
            setText("");
          }}
          disabled={posting || !text.trim()}
          className="px-4 py-2 bg-[#E6761D] hover:bg-[#CC6A1A] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all text-sm sm:text-base font-medium"
        >
          {posting ? "Posting..." : "Post Comment"}
        </button>
      </div>
    </div>
  );
};

const BlogDetailPage: React.FC<BlogDetailPageProps> = ({
  slug,
  post: initialPost,
  loading = false,
  onBack,
}) => {
  const navigate = useNavigate();

  const [post, setPost] = useState<BlogPost | null>(initialPost ?? null);
  const [loadingInternal, setLoadingInternal] = useState<boolean>(loading);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [comments, setComments] = useState<BlogComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const [commentSubmitting, setCommentSubmitting] = useState<boolean>(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [likeProcessing, setLikeProcessing] = useState<boolean>(false);
  const [bookmarkProcessing, setBookmarkProcessing] = useState<boolean>(false);

  const [shareOpen, setShareOpen] = useState<boolean>(false);

  const [liked, setLiked] = useState<boolean>(false);
  const likeKeyFor = (p: BlogPost) => `blog_like:${p.slug ?? p.id}`;

  useEffect(() => {
    setPost(initialPost ?? null);
  }, [initialPost]);

  // Load the main post (detail) using the existing API
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    const load = async () => {
      setLoadingInternal(true);
      setError(null);
      try {
        if (initialPost && initialPost.slug === slug && initialPost.content) {
          setPost(initialPost);
        } else {
          const res: unknown = await blogsAPI.getPostBySlug(slug);
          const p = unwrapSingle<any>(res);
          if (!p) {
            setPost(null);
            return;
          }
          const normalized: BlogPost = {
            id: p.id ?? p._id ?? p.slug ?? slug,
            slug: p.slug ?? slug,
            title: p.title ?? "Untitled",
            excerpt:
              p.excerpt ??
              (typeof p.content === "string"
                ? p.content.slice(0, 160) + (p.content.length > 160 ? "…" : "")
                : ""),
            content: p.content ?? "",
            author: p.author ?? "Admin",
            date:
              p.publishedAt ??
              p.published_at ??
              p.createdAt ??
              p.created_at ??
              new Date().toISOString(),
            category: p.category ?? "Uncategorized",
            readTime: p.readTime
              ? String(p.readTime)
              : p.read_time
                ? String(p.read_time)
                : "5 min read",
            image: p.featuredImage ?? p.featured_image ?? p.image ?? "",
            tags: safeParseTags(p.tags ?? []),
            views: Number(p.views ?? 0),
            likes: Number(p.likes ?? 0),
            comments: Number(p.comments ?? 0),
            featured: !!p.featured,
          };
          if (!cancelled) setPost(normalized);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? "Failed to load post");
          setPost(null);
        }
      } finally {
        if (!cancelled) setLoadingInternal(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [slug, initialPost]);

  // Load Related + Recent + Categories using PUBLIC list endpoint
  useEffect(() => {
    let cancelled = false;
    const loadRelatedAndMeta = async () => {
      try {
        // ✅ PUBLIC endpoint (works on live without auth)
        const raw: unknown = await getPublicPosts();
        const list: any[] = unwrapArray(raw);

        const normalized: BlogPost[] = (list || []).map((p: any, idx: number) => {
          const tags = safeParseTags(p.tags ?? p.tag ?? []);
          const slug =
            p.slug ??
            p.slugified ??
            (p.title ? String(p.title).toLowerCase().replace(/\s+/g, "-") : String(p.id ?? idx));

          const obj = {
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
            date:
              p.publishedAt ??
              p.published_at ??
              p.createdAt ??
              p.created_at ??
              new Date().toISOString(),
            category: p.category ?? "Uncategorized",
            readTime: p.readTime
              ? String(p.readTime)
              : p.read_time
                ? String(p.read_time)
                : "5 min read",
            image: p.featuredImage ?? p.featured_image ?? p.image ?? "",
            tags,
            views: Number(p.views ?? 0),
            likes: Number(p.likes ?? 0),
            comments: Number(p.comments ?? 0),
            featured: !!p.featured,
          } as BlogPost;

          (obj as any).__isPublic = isPublicFromRaw(p);
          return obj;
        });

        if (!cancelled) {
          // Only public posts
          const pubNormalized = normalized.filter((x: any) => x.__isPublic !== false);

          const recent = [...pubNormalized]
            .sort(
              (a, b) =>
                new Date(b.date ?? "").getTime() -
                new Date(a.date ?? "").getTime()
            )
            .slice(0, 5);
          setRecentPosts(recent);

          const cats = Array.from(
            new Set(pubNormalized.map((x) => x.category || "Uncategorized"))
          );
          setCategories(cats);

          if (post) {
            const candidates = pubNormalized.filter((c) => c.slug !== post.slug);
            const scored = candidates
              .map((c) => {
                const sharedTags = (c.tags || []).filter((t) =>
                  (post.tags || []).includes(t)
                ).length;
                const sameCategory = c.category === post.category ? 1 : 0;
                const score = sharedTags * 2 + sameCategory;
                return { c, score };
              })
              .sort((a, b) => b.score - a.score)
              .slice(0, 6)
              .map((x) => x.c);
            setRelatedPosts(scored.map((r) => ({ ...r, content: r.content ?? "" })));
          }
        }
      } catch (err) {
        if (!cancelled) {
          setRelatedPosts([]);
          setRecentPosts([]);
          setCategories([]);
        }
      }
    };
    loadRelatedAndMeta();
    return () => {
      cancelled = true;
    };
  }, [post]);

  // Comments + likes/bookmarks state (unchanged)
  useEffect(() => {
    let cancelled = false;
    const loadComments = async () => {
      if (!post) return;
      setCommentsLoading(true);
      try {
        const res: unknown = await (blogsAPI.getCommentsByPostSlug
          ? blogsAPI.getCommentsByPostSlug(post.slug ?? String(post.id))
          : blogsAPI.getComments?.(post.slug ?? String(post.id)));
        const data = unwrapArray(res);
        const list: BlogComment[] = Array.isArray(data)
          ? data.map((c: any) => ({
            id:
              c.id ??
              c._id ??
              `${c.email || "anon"}-${Math.random().toString(36).slice(2, 8)}`,
            postId: c.postId ?? c.post_id ?? post.id,
            author: c.author ?? c.name ?? "Anonymous",
            email: c.email,
            content: c.content ?? c.body ?? "",
            date:
              c.date ?? c.createdAt ?? c.created_at ?? new Date().toISOString(),
          }))
          : [];
        if (!cancelled) setComments(list);
      } catch {
        if (!cancelled) setComments([]);
      } finally {
        if (!cancelled) setCommentsLoading(false);
      }
    };
    loadComments();
    return () => {
      cancelled = true;
    };
  }, [post]);

  useEffect(() => {
    if (!post) return;
    try {
      const likesRaw = localStorage.getItem(LOCAL_LIKES_KEY);
      if (likesRaw) {
        const likedIds: Array<string | number> = JSON.parse(likesRaw);
        setIsLiked(likedIds.includes(post.id));
      }
    } catch { }
    try {
      const bmRaw = localStorage.getItem(LOCAL_BOOKMARKS_KEY);
      if (bmRaw) {
        const bm: Array<string | number> = JSON.parse(bmRaw);
        setIsBookmarked(bm.includes(post.id));
      }
    } catch { }
  }, [post]);

  useEffect(() => {
    if (!post) return;
    try {
      const key = likeKeyFor(post);
      const local = localStorage.getItem(key) === "1";
      setLiked(local || isLiked);
    } catch {
      setLiked(isLiked);
    }
  }, [post, isLiked]);

  const persistLocalLike = (id: string | number, add: boolean) => {
    try {
      const raw = localStorage.getItem(LOCAL_LIKES_KEY);
      const arr: Array<string | number> = raw ? JSON.parse(raw) : [];
      const idx = arr.findIndex((x) => String(x) === String(id));
      if (add && idx === -1) arr.push(id);
      if (!add && idx !== -1) arr.splice(idx, 1);
      localStorage.setItem(LOCAL_LIKES_KEY, JSON.stringify(arr));
    } catch { }
  };

  const handleLike = async () => {
    if (!post || likeProcessing) return;
    const previouslyLiked = isLiked;
    setIsLiked(!previouslyLiked);
    setPost((p) =>
      p ? { ...p, likes: (p.likes ?? 0) + (previouslyLiked ? -1 : 1) } : p
    );
    setLikeProcessing(true);

    try {
      if (blogsAPI.likePost) {
        await blogsAPI.likePost(post.id);
      } else {
        persistLocalLike(post.id, !previouslyLiked);
      }
    } catch (err) {
      setIsLiked(previouslyLiked);
      setPost((p) =>
        p ? { ...p, likes: (p.likes ?? 0) + (previouslyLiked ? 1 : -1) } : p
      );
    } finally {
      setLikeProcessing(false);
    }
  };

  const toggleLiked = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!post) return;
    const key = likeKeyFor(post);
    setLiked((prev) => {
      const next = !prev;
      try {
        if (next) localStorage.setItem(key, "1");
        else localStorage.removeItem(key);
      } catch { }
      return next;
    });
    handleLike();
  };

  const toggleLocalBookmark = (id: string | number) => {
    try {
      const raw = localStorage.getItem(LOCAL_BOOKMARKS_KEY);
      const bm: Array<string | number> = raw ? JSON.parse(raw) : [];
      const idx = bm.findIndex((x) => String(x) === String(id));
      if (idx === -1) bm.push(id);
      else bm.splice(idx, 1);
      localStorage.setItem(LOCAL_BOOKMARKS_KEY, JSON.stringify(bm));
      return idx === -1;
    } catch {
      return !isBookmarked;
    }
  };

  const handleBookmark = async () => {
    if (!post || bookmarkProcessing) return;
    const previously = isBookmarked;
    setIsBookmarked(!previously);
    setBookmarkProcessing(true);

    try {
      if (blogsAPI.bookmarkPost) {
        await blogsAPI.bookmarkPost(post.id);
      } else {
        toggleLocalBookmark(post.id);
      }
    } catch (err) {
      setIsBookmarked(previously);
    } finally {
      setBookmarkProcessing(false);
    }
  };

  const submitComment = async (text: string, author?: string, email?: string) => {
    setCommentError(null);
    if (!post) return setCommentError("Cannot post comment: missing post.");
    if (!text.trim()) return setCommentError("Please write a comment.");
    const tempId = `temp-${Date.now()}`;
    const commentObj: BlogComment = {
      id: tempId,
      postId: post.id,
      author: author?.trim() || "Guest",
      email,
      content: text.trim(),
      date: new Date().toISOString(),
    };
    setComments((c) => [commentObj, ...c]);
    setCommentSubmitting(true);
    try {
      if (blogsAPI.postComment) {
        const res: unknown = await blogsAPI.postComment(post.slug ?? String(post.id), {
          author: commentObj.author,
          email: commentObj.email,
          content: commentObj.content,
        });
        const saved = unwrapSingle<any>(res);
        if (saved) {
          setComments((c) =>
            c.map((it) =>
              it.id === tempId
                ? {
                  id: saved.id ?? saved._id ?? it.id,
                  postId: it.postId,
                  author: saved.author ?? it.author,
                  email: saved.email ?? it.email,
                  content: saved.content ?? it.content,
                  date: saved.date ?? saved.createdAt ?? it.date,
                }
                : it
            )
          );
        }
      }
      setPost((p) => (p ? { ...p, comments: (p.comments ?? 0) + 1 } : p));
    } catch (err: any) {
      setComments((c) => c.filter((x) => x.id !== tempId));
      setCommentError(err?.message ?? "Failed to post comment");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const fmtDate = (iso?: string) => {
    try {
      if (!iso) return "";
      return new Date(iso).toLocaleString();
    } catch {
      return iso ?? "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Sticky Header */}
      <div
        className="bg-white shadow-sm border-b pt-20 sticky top-0 z-40"
        style={{ background: "linear-gradient(to right, #0b3856, #0c3854)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between ">
            <button
              onClick={() => (onBack ? onBack() : navigate("/blogs"))}
              className="flex items-center text-white hover:text-gray-200 transition-colors text-sm font-medium"
            >
              <ArrowLeft size={18} className="mr-1" />
              Back to articles
            </button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {shareOpen && (
        <ShareModalBlog
          slug={post?.slug || String(post?.id || "")}
          title={post?.title}
          description={post?.excerpt}
          image={post?.image}
          onClose={() => setShareOpen(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-8 mt-1.5  pb-6 sm:pb-8 lg:pb-12">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {loadingInternal ? (
            <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-lg">
              <div className="animate-pulse space-y-4">
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-lg">
              <div className="text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <X className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-red-600" />
                </div>
                <p className="text-red-600 text-sm sm:text-base">{error}</p>
              </div>
            </div>
          ) : !post ? (
            <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-lg text-center">
              <p className="text-gray-600 text-sm sm:text-base">Article not found.</p>
            </div>
          ) : (
            <article className="bg-white rounded-xl shadow-xl overflow-hidden">
              {/* Featured Image + actions */}
              {post.image && (
                <div className="relative w-full h-52 sm:h-64 md:h-80 lg:h-96 overflow-hidden group">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  {/* Action Buttons */}
                  <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 flex flex-col gap-1.5 sm:gap-2">
                    {/* Like */}
                    <button
                      onClick={toggleLiked}
                      aria-label={liked ? "Remove from shortlist" : "Add to shortlist"}
                      className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-white/95 backdrop-blur-md shadow-lg ring-1 ring-black/10 hover:bg-white hover:scale-110 hover:shadow-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                    >
                      <Heart
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${liked ? "text-red-500 fill-current" : "text-gray-700"}`}
                      />
                    </button>

                    {/* Share */}
                    <button
                      onClick={() => setShareOpen(true)}
                      title="Share"
                      className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-white/95 backdrop-blur-md shadow-lg ring-1 ring-black/10 hover:bg-white hover:scale-110 hover:shadow-xl transition-all duration-200 text-gray-700 hover:text-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                    >
                      <ShareIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    {/* Bookmark */}
                    <button
                      onClick={handleBookmark}
                      disabled={bookmarkProcessing}
                      aria-pressed={isBookmarked}
                      title={isBookmarked ? "Saved" : "Save"}
                      className={`w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-white/95 backdrop-blur-md shadow-lg ring-1 ring-black/10 hover:bg-white hover:scale-110 hover:shadow-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 ${isBookmarked ? "text-yellow-500" : "text-gray-700 hover:text-yellow-500"
                        }`}
                    >
                      <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isBookmarked ? "fill-current" : ""}`} />
                    </button>
                  </div>
                </div>
              )}

              <div className="p-4 sm:p-6 md:p-8 lg:p-10">
                {/* Title */}
                <h1 className="text-xl font-bold mb-3 sm:mb-4 text-gray-900 leading-tight">
                  {post.title}
                </h1>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-5 md:mb-6">
                  <span className="flex items-center">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                    <span className="truncate max-w-[80px] sm:max-w-[120px] md:max-w-none">{post.author}</span>
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center">
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                    <span className="hidden sm:inline">{post.views ?? 0} views</span>
                    <span className="sm:hidden">{post.views ?? 0}</span>
                  </span>

                  <button
                    onClick={handleLike}
                    disabled={likeProcessing}
                    title={isLiked ? "Unlike" : "Like"}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all ${isLiked ? "text-red-600 bg-red-50" : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                      }`}
                    aria-pressed={isLiked}
                  >
                    <Heart className={`w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ${isLiked ? "fill-current" : ""}`} />
                    <span className="text-xs sm:text-sm">{post.likes ?? 0}</span>
                  </button>

                  <span className="flex items-center">
                    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                    <span className="hidden sm:inline">{comments.length} comments</span>
                    <span className="sm:hidden">{comments.length}</span>
                  </span>
                </div>

                {/* Excerpt */}
                <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Content */}
                <div className="prose prose-sm sm:prose md:prose-lg max-w-none text-gray-800 mb-6 sm:mb-8">
                  {post.content ? (
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                  ) : (
                    <p>No content available for this article.</p>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4 sm:mt-6">
                  {(post.tags || []).map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 bg-gray-100 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <Tag className="w-3 h-3 flex-shrink-0" /> {t}
                    </span>
                  ))}
                </div>

                {/* Comments */}
                <section className="mt-8 sm:mt-10 lg:mt-12">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-5">
                    Comments ({comments.length})
                  </h3>

                  <CommentComposer onPost={submitComment} posting={commentSubmitting} />
                  {commentError && (
                    <div className="text-xs sm:text-sm text-red-600 mt-2 p-2 bg-red-50 rounded">
                      {commentError}
                    </div>
                  )}

                  <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                    {commentsLoading ? (
                      <div className="text-sm text-gray-500 text-center py-4">Loading comments...</div>
                    ) : comments.length === 0 ? (
                      <div className="text-sm text-gray-500 text-center py-6 bg-gray-50 rounded-lg">
                        No comments yet — be the first to comment.
                      </div>
                    ) : (
                      comments.map((c) => (
                        <div
                          key={c.id}
                          className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-medium text-white text-xs sm:text-sm flex-shrink-0">
                              {String(c.author ?? "A")
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1 sm:mb-2">
                                <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                                  {c.author}
                                </div>
                                <div className="text-xs text-gray-400 flex-shrink-0">
                                  {fmtDate(c.date)}
                                </div>
                              </div>
                              <div className="text-xs sm:text-sm md:text-base text-gray-700 whitespace-pre-wrap break-words">
                                {c.content}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </article>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-6 sm:mt-8">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">Related articles</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {relatedPosts.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-all border border-gray-100"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      {r.image ? (
                        <img
                          src={r.image}
                          alt={r.title}
                          className="w-20 h-16 sm:w-24 sm:h-20 object-cover rounded flex-shrink-0"
                        />
                      ) : null}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <a
                            href={`/blogs/${r.slug || r.id}`}
                            className="font-medium text-sm sm:text-base text-gray-800 hover:text-blue-600 hover:underline underline-offset-2 transition-colors line-clamp-2"
                          >
                            {r.title}
                          </a>
                          <span className="text-xs text-gray-500 flex-shrink-0 hidden sm:block">{r.readTime}</span>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2">{r.excerpt}</p>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="truncate">{r.author}</span>
                          <span>·</span>
                          <span className="flex-shrink-0">
                            {new Date(r.date ?? "").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="space-y-4 sm:space-y-5 lg:space-y-6">
          {/* Author Card */}
          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-md border border-gray-100">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-grey-500 to-white-600 flex items-center justify-center text-black ring-1 font-bold text-sm sm:text-base flex-shrink-0">
                {String(post?.author ?? "A")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm sm:text-base truncate">{post?.author ?? "Admin"}</p>
                <p className="text-xs text-gray-500">Contributor</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-3 sm:mt-4">
              {post?.author ? `Read more from ${post.author}.` : "This author shares insights, market analysis and real estate tips."}
            </p>
            <div className="mt-3 sm:mt-4 flex gap-2">
              <button className="flex-1 bg-[#E6761D] hover:bg-[#CC6A1A] text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-medium hover:shadow-lg transition-all">
                Follow
              </button>

              <button
                onClick={handleBookmark}
                disabled={bookmarkProcessing}
                className={`flex items-center gap-1.5 sm:gap-2 border px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${isBookmarked ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "border-gray-200 hover:bg-gray-50"
                  }`}
                title={isBookmarked ? "Remove bookmark" : "Save"}
                aria-pressed={isBookmarked}
              >
                <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{isBookmarked ? "Saved" : "Save"}</span>
              </button>
            </div>
          </div>

          {/* Recent Posts */}
          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-md border border-gray-100">
            <h4 className="font-medium text-sm sm:text-base mb-3 sm:mb-4">Recent posts</h4>
            <div className="space-y-3">
              {recentPosts.map((r) => (
                <div key={r.id} className="flex items-start gap-2 sm:gap-3 group">
                  {r.image ? (
                    <img
                      src={r.image}
                      alt={r.title}
                      className="w-14 h-12 sm:w-16 sm:h-12 object-cover rounded flex-shrink-0 group-hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <div className="w-14 h-12 sm:w-16 sm:h-12 bg-gray-100 rounded flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => {
                        navigate(`/blogs/${encodeURIComponent(String(r.slug ?? r.id))}`);
                      }}
                      className="text-xs sm:text-sm text-left font-medium hover:text-blue-600 hover:underline line-clamp-2 transition-colors"
                    >
                      {r.title}
                    </button>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(r.date ?? "").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                </div>
              ))}
              {recentPosts.length === 0 && (
                <div className="text-xs sm:text-sm text-gray-500 text-center py-3">No recent posts</div>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-xl p-4 sm:p-5 shadow-md border border-gray-100">
            <h4 className="font-medium text-sm sm:text-base mb-3 sm:mb-4">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    navigate(`/blogs?category=${encodeURIComponent(c)}`);
                  }}
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gray-100 text-xs sm:text-sm rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {c}
                </button>
              ))}
              {categories.length === 0 && (
                <div className="text-xs sm:text-sm text-gray-500 text-center w-full py-2">No categories</div>
              )}
            </div>
          </div>

          {/* Newsletter / CTA */}
          <div className="text-white rounded-xl p-4 sm:p-5 shadow-lg" style={{ background: "linear-gradient(to right, #0b3856, #0c3854)" }}>
            <h4 className="text-base sm:text-lg font-semibold mb-2">Join our newsletter</h4>
            <p className="text-xs sm:text-sm mb-3 sm:mb-4 opacity-95">
              Weekly insights, market updates and featured listings — delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 rounded-lg text-black text-sm focus:ring-2 focus:ring-white/50 focus:outline-none"
              />
              <button className="px-4 py-2 bg-[#E6761D] hover:bg-[#CC6A1A] text-white rounded-lg font-medium text-sm transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BlogDetailPage;
