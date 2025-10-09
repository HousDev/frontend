// // src/pages/public/BlogDetailPage.tsx
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Tag,
  Clock,
  User,
  Eye,
  Share as ShareIcon,
  Mail,
  Twitter,
  Bookmark,
  MessageSquare,
  Heart,
  X, // for share modal close (used inside ShareModalBlog)
} from "lucide-react";
import blogsAPI from "@/lib/blogsAPI";
import { useNavigate } from "react-router-dom";
import ShareModalBlog from "./ShareModalBlog";

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

/** Returns an array if the API gave one (directly or wrapped), or [] */
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

/** Returns a single object; supports {data: obj} or a bare object */
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

/* -------------------- Helper subcomponent -------------------- */
const CommentComposer: React.FC<{
  onPost: (text: string, author?: string, email?: string) => void;
  posting?: boolean;
}> = ({ onPost, posting }) => {
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Write your comment..."
        className="w-full px-3 py-2 border rounded-md mb-3"
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
        <input
          className="px-3 py-2 border rounded-md"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="px-3 py-2 border rounded-md"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div />
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => {
            setText("");
            setName("");
            setEmail("");
          }}
          className="px-3 py-1.5 border rounded-md"
        >
          Clear
        </button>
        <button
          onClick={() => {
            onPost(text, name, email);
            setText("");
          }}
          disabled={posting || !text.trim()}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-md disabled:opacity-60"
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

  // engagement state
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [likeProcessing, setLikeProcessing] = useState<boolean>(false);
  const [bookmarkProcessing, setBookmarkProcessing] = useState<boolean>(false);

  // share modal state
  const [shareOpen, setShareOpen] = useState<boolean>(false);

  // property-style local liked state + key helper
  const [liked, setLiked] = useState<boolean>(false);
  const likeKeyFor = (p: BlogPost) => `blog_like:${p.slug ?? p.id}`;

  /* --- initialise post from parent --- */
  useEffect(() => {
    setPost(initialPost ?? null);
  }, [initialPost]);

  /* --- load post by slug (if provided) --- */
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

  /* --- related/recent/categories --- */
  useEffect(() => {
    let cancelled = false;
    const loadRelatedAndMeta = async () => {
      try {
        const raw: unknown = (await blogsAPI.getAllPosts?.()) ?? [];
        const list: any[] = unwrapArray(raw);

        const normalized: BlogPost[] = (list || []).map((p: any, idx: number) => {
          const tags = safeParseTags(p.tags ?? p.tag ?? []);
          const slug =
            p.slug ??
            p.slugified ??
            (p.title ? String(p.title).toLowerCase().replace(/\s+/g, "-") : String(p.id ?? idx));
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
        });

        if (!cancelled) {
          const recent = [...normalized]
            .sort(
              (a, b) =>
                new Date(b.date ?? "").getTime() -
                new Date(a.date ?? "").getTime()
            )
            .slice(0, 5);
          setRecentPosts(recent);
          const cats = Array.from(
            new Set(normalized.map((x) => x.category || "Uncategorized"))
          );
          setCategories(cats);
          if (post) {
            const candidates = normalized.filter((c) => c.slug !== post.slug);
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

  /* --- comments load --- */
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

  /* --- init like/bookmark from localStorage if available --- */
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

  // initialise property-style 'liked' from local key, fallback to isLiked
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

  /* ---------- Like handler ---------- */
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

  // property-style toggle (localStorage + call handleLike for count/api)
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

  /* ---------- Bookmark handler ---------- */
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

  /* ---------- Comment submit ---------- */
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
    <div className="min-h-screen bg-gray-50 ">
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

      {/* Share Modal (now using ShareModalBlog) */}
      {shareOpen && (
        <ShareModalBlog
          slug={post?.slug || String(post?.id || "")}
          title={post?.title}
          description={post?.excerpt}
          image={post?.image}
          onClose={() => setShareOpen(false)}
        // forcedCopyUrl="https://investordeal.in/blogs/custom-slug" // (optional override)
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
        <div className="lg:col-span-2">
          {loadingInternal ? (
            <div className="bg-white rounded-xl p-8 shadow">Loading article...</div>
          ) : error ? (
            <div className="bg-white rounded-xl p-8 shadow text-red-600">
              {error}
            </div>
          ) : !post ? (
            <div className="bg-white rounded-xl p-8 shadow">Article not found.</div>
          ) : (
            <article className="bg-white rounded-xl shadow overflow-hidden">
              {/* FEATURED IMAGE WITH OVERLAY ACTIONS (property-style) */}
              {post.image && (
                <div className="relative w-full h-64">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-64 object-cover rounded-t-xl"
                  />

                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    {/* Like */}
                    <button
                      onClick={toggleLiked}
                      aria-label={liked ? "Remove from shortlist" : "Add to shortlist"}
                      className={`w-10 h-10 flex items-center justify-center rounded-full bg-white/95 backdrop-blur-md shadow-lg ring-1 ring-black/10 
      hover:bg-white hover:scale-110 hover:shadow-xl transition-all duration-200 
      focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60`}
                    >
                      <Heart
                        className={`w-5 h-5 ${liked ? "text-red-500 fill-current" : "text-gray-700"}`}
                      />
                    </button>

                    {/* Share */}
                    <button
                      onClick={() => setShareOpen(true)}
                      title="Share"
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-white/95 backdrop-blur-md shadow-lg ring-1 ring-black/10 
      hover:bg-white hover:scale-110 hover:shadow-xl transition-all duration-200 
      text-gray-700 hover:text-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                    >
                      <ShareIcon size={20} />
                    </button>

                    {/* Bookmark */}
                    <button
                      onClick={handleBookmark}
                      disabled={bookmarkProcessing}
                      aria-pressed={isBookmarked}
                      title={isBookmarked ? "Saved" : "Save"}
                      className={`w-10 h-10 flex items-center justify-center rounded-full bg-white/95 backdrop-blur-md shadow-lg ring-1 ring-black/10 
      hover:bg-white hover:scale-110 hover:shadow-xl transition-all duration-200 
      focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60
      ${isBookmarked ? "text-yellow-500" : "text-gray-700 hover:text-yellow-500"}`}
                    >
                      <Bookmark size={20} className={isBookmarked ? "fill-current" : ""} />
                    </button>
                  </div>
                </div>
              )}

              {!post.image && null}

              <div className="p-8">
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {post.author}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(post.date ?? "").toLocaleDateString()}
                  </span>
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {post.views ?? 0} views
                  </span>

                  {/* Existing like meta (kept as-is, shows count) */}
                  <button
                    onClick={handleLike}
                    disabled={likeProcessing}
                    title={isLiked ? "Unlike" : "Like"}
                    className={`flex items-center gap-1 px-2 py-1 rounded ${isLiked ? "text-red-600" : "text-gray-600 hover:text-red-600"
                      } transition-colors`}
                    aria-pressed={isLiked}
                  >
                    <Heart className="w-4 h-4" />
                    <span className="text-xs">{post.likes ?? 0}</span>
                  </button>

                  <span className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    {comments.length} comments
                  </span>
                </div>

                <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
                <p className="text-gray-600 mb-6">{post.excerpt}</p>

                <div className="prose max-w-none text-gray-800 mb-6">
                  {post.content ? (
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                  ) : (
                    <p>No content available for this article.</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {(post.tags || []).map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full"
                    >
                      <Tag className="w-3 h-3" /> {t}
                    </span>
                  ))}
                </div>

                {/* Comments Section */}
                <section className="mt-10">
                  <h3 className="text-xl font-semibold mb-4">
                    Comments ({comments.length})
                  </h3>

                  <CommentComposer
                    onPost={submitComment}
                    posting={commentSubmitting}
                  />
                  {commentError && (
                    <div className="text-sm text-red-600 mt-2">
                      {commentError}
                    </div>
                  )}

                  <div className="space-y-4 mt-6">
                    {commentsLoading ? (
                      <div className="text-sm text-gray-500">
                        Loading comments...
                      </div>
                    ) : comments.length === 0 ? (
                      <div className="text-sm text-gray-500">
                        No comments yet — be the first to comment.
                      </div>
                    ) : (
                      comments.map((c) => (
                        <div
                          key={c.id}
                          className="bg-white rounded-lg p-4 shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-medium text-gray-700">
                              {String(c.author ?? "A")
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="text-sm font-medium">
                                  {c.author}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {fmtDate(c.date)}
                                </div>
                              </div>
                              <div className="text-gray-700 mt-2 whitespace-pre-wrap">
                                {c.content}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>
                {/* end comments */}
              </div>
            </article>
          )}

          {/* related under content */}
          {relatedPosts.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Related articles</h3>

              <div className="grid md:grid-cols-2 gap-4">
                {relatedPosts.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-start gap-4">
                      {r.image ? (
                        <img
                          src={r.image}
                          alt={r.title}
                          className="w-24 h-16 object-cover rounded"
                        />
                      ) : null}

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          {/* 👇 Clickable title with underline on hover */}
                          <a
                            href={`/blogs/${r.slug || r.id}`}
                            className="font-medium text-gray-800 hover:text-blue-600 hover:underline underline-offset-2 transition-colors"
                          >
                            {r.title}
                          </a>

                          <span className="text-xs text-gray-500">{r.readTime}</span>
                        </div>

                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {r.excerpt}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-3">
                          <span>{r.author}</span>
                          <span>·</span>
                          <span>
                            {new Date(r.date ?? "").toLocaleDateString()}
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

        {/* Right sidebar */}
        <aside className="space-y-6">
          {/* Author card */}
          <div className="bg-white rounded-xl p-5 shadow">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {String(post?.author ?? "A")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <p className="font-medium">{post?.author ?? "Admin"}</p>
                <p className="text-xs text-gray-500">Contributor</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              {post?.author
                ? `Read more from ${post.author}.`
                : "This author shares insights, market analysis and real estate tips."}
            </p>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm">
                Follow
              </button>

              <button
                onClick={handleBookmark}
                disabled={bookmarkProcessing}
                className={`flex items-center gap-2 border px-3 py-2 rounded text-sm ${isBookmarked
                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                    : "border-gray-200"
                  }`}
                title={isBookmarked ? "Remove bookmark" : "Save"}
                aria-pressed={isBookmarked}
              >
                <Bookmark className="w-4 h-4" />
                <span>{isBookmarked ? "Saved" : "Save"}</span>
              </button>
            </div>
          </div>

          {/* Recent posts */}
          <div className="bg-white rounded-xl p-5 shadow">
            <h4 className="font-medium mb-3">Recent posts</h4>
            <div className="space-y-3">
              {recentPosts.map((r) => (
                <div key={r.id} className="flex items-start gap-3">
                  {r.image ? (
                    <img
                      src={r.image}
                      alt={r.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-12 bg-gray-100 rounded" />
                  )}
                  <div className="flex-1">
                    <button
                      onClick={() => {
                        navigate(
                          `/blogs/${encodeURIComponent(String(r.slug ?? r.id))}`
                        );
                      }}
                      className="text-sm text-left font-medium hover:underline"
                    >
                      {r.title}
                    </button>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(r.date ?? "").toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
              {recentPosts.length === 0 && (
                <div className="text-sm text-gray-500">No recent posts</div>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white rounded-xl p-5 shadow">
            <h4 className="font-medium mb-3">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    navigate(`/blogs?category=${encodeURIComponent(c)}`);
                  }}
                  className="px-3 py-1 bg-gray-100 text-sm rounded"
                >
                  {c}
                </button>
              ))}
              {categories.length === 0 && (
                <div className="text-sm text-gray-500">No categories</div>
              )}
            </div>
          </div>

          {/* Newsletter / CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-xl p-5 shadow">
            <h4 className="text-lg font-semibold mb-2">Join our newsletter</h4>
            <p className="text-sm mb-4">
              Weekly insights, market updates and featured listings — delivered
              to your inbox.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 rounded text-black"
              />
              <button className="px-4 py-2 bg-white text-blue-600 rounded">
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
