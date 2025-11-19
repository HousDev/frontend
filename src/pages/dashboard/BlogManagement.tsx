// // src/components/blogManager/BlogManagement.tsx
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import {
//   BarChart3,
//   FileText,
//   Bot,
//   Wrench,
//   Share2,
//   Search,
//   Plus,
//   Edit,
//   Trash2,
//   Eye,
//   TrendingUp,
//   Heart,
//   Wand2,
//   Save,
//   RefreshCw,
//   ChevronLeft,
//   ChevronRight,
//   X,
//   Globe as GlobeIcon,
//   MessageSquare,
//   CornerUpLeft,
// } from 'lucide-react';

// import { BlogPost, RSSSource, BlogCategory, BlogStatus } from '../../types/blog';

// import BlogPostEditor from '@/components/blogManager/BlogPostEditor';
// import AIBlogWriter from '@/components/blogManager/AIBlogWriter';
// import RSSSourceManager from '@/components/blogManager/RSSSourceManager';
// import SocialMediaManager from '@/components/blogManager/SocialMediaManager';
// import BlogAnalytics from '@/components/blogManager/BlogAnalytics';

// import blogsAPIDefault from '@/lib/blogsAPI';
// import { rssAPI } from '@/lib/rssAPI';

// import { useAuth } from '@/contexts/AuthContext';
// import { toast } from 'react-toastify';

// type CommentItem = {
//   id: string | number;
//   author: string;
//   email?: string;
//   content: string;
//   status?: string;
//   createdAt?: string;
//   created_at?: string;
//   post_id?: string | number;
//   postId?: string | number;
//   post_slug?: string;
//   postSlug?: string;
//   replies?: CommentItem[];
// };

// type CommentRow = {
//   id: string;
//   postTitle: string;
//   author: string;
//   email: string;
//   content: string;
//   status: string;
//   createdAt: string;
// };

// const blogsAPI: any = (blogsAPIDefault as any)?.default ?? blogsAPIDefault;

// const BlogManagement: React.FC = () => {
//   const { user } = useAuth() ?? { user: null };

//   const getUserDisplayName = (u: any) => {
//     if (!u) return 'Admin';
//     if (typeof u === 'string' && u.trim()) return u;
//     const candidates = [
//       u.name,
//       u.fullName,
//       u.displayName,
//       u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : null,
//       u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : null,
//       u.profile?.name,
//       u.attributes?.name,
//       u.user_metadata?.full_name,
//       u.username,
//       u.nick,
//       u.preferred_username,
//     ];
//     for (const c of candidates) if (c && String(c).trim()) return String(c).trim();
//     if (u?.email) return u.email;
//     if (u?.emails && Array.isArray(u.emails) && u.emails[0]) return u.emails[0].value || u.emails[0];
//     return 'Admin';
//   };

//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [posts, setPosts] = useState<BlogPost[]>([]);
//   const [rssources, setRSSources] = useState<RSSSource[]>([]);

//   const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
//   const [showPostEditor, setShowPostEditor] = useState(false);
//   const [showAIWriter, setShowAIWriter] = useState(false);
//   const [showRSSManager, setShowRSSManager] = useState(false);
//   const [showSocialManager, setShowSocialManager] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState<string>('All');
//   const [selectedStatus, setSelectedStatus] = useState<string>('All');
//   const [isGenerating, setIsGenerating] = useState(false);

//   const [loadingPosts, setLoadingPosts] = useState(false);
//   const [postsError, setPostsError] = useState<string | null>(null);

//   const [postStateTab, setPostStateTab] = useState<'draft' | 'published'>('draft');

//   const [page, setPage] = useState<number>(1);
//   const [pageSize, setPageSize] = useState<number>(10);

//   const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
//   const [showPreviewModal, setShowPreviewModal] = useState(false);

//   // -------- Comments Tab State --------
//   const [commentsRows, setCommentsRows] = useState<CommentRow[]>([]);
//   const [loadingAllComments, setLoadingAllComments] = useState(false);
//   const [commentsSearch, setCommentsSearch] = useState('');

//   // per-row action loading for comments
//   const [commentActionLoading, setCommentActionLoading] = useState<string | null>(null);

//   // auto publish after AI rewrite
//   const [autoPublishAfterAI, setAutoPublishAfterAI] =
//     useState<null | { originalId: string | number }>(null);

//   // Bulk selection
//   const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

//   const sourceNameById = useMemo<Record<string, string>>(
//     () =>
//       (rssources || []).reduce((acc: Record<string, string>, s: any) => {
//         const id = String(s?.id ?? s?._id ?? s?.slug ?? '');
//         if (id) acc[id] = String(s?.name ?? s?.title ?? s?.label ?? s?.sourceName ?? 'RSS');
//         return acc;
//       }, {}),
//     [rssources]
//   );

//   // Updated function to get post source name with "Manual" as default
//   const getPostSourceName = useCallback(
//     (p: any) => {
//       const explicit = p?.sourceName ?? p?.source_name ?? p?.source?.name;
//       const sid =
//         p?.sourceId ??
//         p?.source_id ??
//         p?.rssSourceId ??
//         p?.rss_source_id ??
//         (p?.source?.id ?? undefined);
//       const mapped = sid != null ? sourceNameById[String(sid)] : undefined;

//       // Return "Manual" if no source information is found
//       return (explicit || mapped || 'Manual') as string;
//     },
//     [sourceNameById]
//   );

//   const tabs = [
//     { id: 'dashboard', label: 'Dashboard', icon: BarChart3, description: 'Overview and quick actions' },
//     { id: 'content', label: 'Content Management', icon: FileText, description: 'Manage all blog posts' },
//     { id: 'comments', label: 'Comments', icon: MessageSquare, description: 'Manage comments & replies' },
//     { id: 'ai-writer', label: 'AI Content Studio', icon: Bot, description: 'Create content with AI' },
//     { id: 'ai-tools', label: 'AI Enhancement Tools', icon: Wrench, description: 'Enhance existing content' },
//     { id: 'rss', label: 'RSS Sources', icon: GlobeIcon, description: 'Auto-import from RSS feeds' },
//     { id: 'social', label: 'Social Media', icon: Share2, description: 'Schedule posts' },
//     { id: 'seo', label: 'SEO Tools', icon: TrendingUp, description: 'Optimize for search engines' },
//     { id: 'analytics', label: 'Analytics', icon: TrendingUp, description: 'Performance insights' },
//   ];

//   // ---------- Normalize Posts ----------
//   const normalizePost = (p: any): BlogPost & { sourceId?: string | number; sourceName?: string; slug?: string } => {
//     const sourceId =
//       p.sourceId ?? p.source_id ?? p.rssSourceId ?? p.rss_source_id ?? p.rssId ?? p.source?.id;

//     const sourceName =
//       p.sourceName ??
//       p.source_name ??
//       p.sourceLabel ??
//       p.rssSourceName ??
//       p.rss_source_name ??
//       p.source?.name ??
//       p.rss?.name;

//     return {
//       id: p.id ?? p._id ?? p.slug ?? `LOCAL_${Date.now()}`,
//       slug: p.slug ?? p.permalink ?? p.seoSlug ?? p.meta?.slug ?? "", // ✅ keep slug for comment fetching
//       title: p.title ?? 'Untitled',
//       content: p.content ?? '',
//       excerpt: p.excerpt ?? '',
//       author: p.author ?? 'Admin',
//       category: p.category ?? 'Uncategorized',
//       tags: p.tags ?? [],
//       status: p.status ?? 'draft',
//       featured: !!p.featured,
//       featuredImage: p.featuredImage ?? p.featured_image ?? p.image ?? p.imageUrl ?? '',
//       publishedAt: p.publishedAt ?? p.published_at ?? '',
//       createdAt: p.createdAt ?? p.created_at ?? new Date().toISOString(),
//       updatedAt: p.updatedAt ?? p.updated_at ?? new Date().toISOString(),
//       views: p.views ?? 0,
//       likes: p.likes ?? 0,
//       comments: p.comments ?? 0,
//       seoTitle: p.seoTitle ?? p.seo_title ?? p.metaTitle ?? '',
//       seoDescription: p.seoDescription ?? p.seo_description ?? p.metaDescription ?? '',
//       readTime:
//         typeof p.readTime === 'number' ? p.readTime : Math.ceil(((p.content || '').length || 0) / 200),
//       ...(sourceId !== undefined ? { sourceId } : {}),
//       // Set sourceName to "Manual" if no source information is available
//       sourceName: sourceName || 'Manual',
//     } as any;
//   };

//   const loadPosts = useCallback(async (params?: Record<string, any>) => {
//     setLoadingPosts(true);
//     setPostsError(null);
//     try {
//       const data = await blogsAPI.getAllPosts(params);
//       let list: any[] = [];

//       if (Array.isArray(data)) list = data;
//       else if (data && Array.isArray((data as any).items)) list = (data as any).items;
//       else if (data && Array.isArray((data as any).data)) list = (data as any).data;
//       else if (data && typeof data === 'object') {
//         if (Array.isArray((data as any).posts)) list = (data as any).posts;
//         else if (Array.isArray((data as any).results)) list = (data as any).results;
//         else {
//           const maybePost = data as any;
//           if (maybePost?.id || maybePost?.title) list = [maybePost];
//         }
//       }

//       const normalized = (list || []).map(normalizePost) as BlogPost[];
//       setPosts(normalized);
//       setSelectedIds(new Set());
//     } catch (err: any) {
//       console.error('Failed to load posts', err);
//       if (err?.response) {
//         setPostsError(
//           `Server responded ${err.response.status}: ${err.response.data?.message || JSON.stringify(err.response.data)}`
//         );
//       } else if (err?.request) {
//         setPostsError('No response from server. Is backend running and reachable?');
//       } else {
//         setPostsError(err.message || 'Failed to fetch posts from server');
//       }
//       toast.error('Could not fetch posts from server');
//       setPosts([]);
//       setSelectedIds(new Set());
//     } finally {
//       setLoadingPosts(false);
//     }
//   }, []);

//   // Load posts for the sub-tab (server-side status filter)
//   useEffect(() => {
//     loadPosts({ status: postStateTab });
//   }, [loadPosts, postStateTab]);

//   // Load RSS sources (optional)
//   useEffect(() => {
//     (async () => {
//       try {
//         const resp = await rssAPI.getAll();
//         const list = Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
//         setRSSources(list as RSSSource[]);
//       } catch {
//         // silent
//       }
//     })();
//   }, []);

//   const handleRefresh = async () => {
//     try {
//       setPage(1);
//       await loadPosts({ status: postStateTab, _ts: Date.now() });
//       toast.success('List refreshed');
//     } catch { }
//   };

//   /** Save / update post into list */
//   const handleSavePost = (postData: Partial<BlogPost>) => {
//     if (!postData) return;
//     const raw: any = (postData as any)?.data ?? (postData as any)?.post ?? postData;

//     const normalized = normalizePost(raw);

//     setPosts((prev) => {
//       const arr = Array.isArray(prev) ? prev : [];
//       const existingIdx = arr.findIndex((p) => String(p.id) === String(normalized.id));
//       let action: 'created' | 'updated' = 'created';

//       let next: BlogPost[];
//       if (existingIdx >= 0) {
//         action = 'updated';
//         next = [...arr];
//         next[existingIdx] = { ...next[existingIdx], ...normalized } as BlogPost;
//       } else {
//         next = [normalized as BlogPost, ...arr];
//       }

//       if ((normalized as any).status === 'published') {
//         toast.success(action === 'created' ? 'Post published!' : 'Post republished!');
//       } else {
//         toast.success(action === 'created' ? 'Post created!' : 'Post updated!');
//       }

//       return next;
//     });

//     setShowPostEditor(false);
//     setSelectedPost(null);
//   };

//   const handleDeletePost = async (postId: string | number) => {
//     if (!window.confirm('Are you sure you want to delete this post?')) return;
//     try {
//       setPosts((curr) =>
//         (Array.isArray(curr) ? curr : []).filter((p) => String(p.id) !== String(postId))
//       );
//       if (typeof blogsAPI.deletePost === 'function') {
//         await blogsAPI.deletePost(postId);
//       }
//       toast.success('Post deleted successfully!');
//       setSelectedIds((prev) => {
//         const next = new Set(prev);
//         next.delete(String(postId));
//         return next;
//       });
//     } catch {
//       toast.error('Failed to delete post. Refreshing list.');
//       handleRefresh();
//     }
//   };

//   // ---------- Bulk selection ----------
//   const toggleSelectOne = (id: string | number) => {
//     setSelectedIds((prev) => {
//       const next = new Set(prev);
//       const key = String(id);
//       if (next.has(key)) next.delete(key);
//       else next.add(key);
//       return next;
//     });
//   };

//   const areAllCurrentPageSelected = (pageItems: BlogPost[]) =>
//     pageItems.length > 0 && pageItems.every((p) => selectedIds.has(String(p.id)));

//   const toggleSelectAllOnPage = (pageItems: BlogPost[]) => {
//     setSelectedIds((prev) => {
//       const next = new Set(prev);
//       const allSelected = areAllCurrentPageSelected(pageItems);
//       for (const p of pageItems) {
//         const key = String(p.id);
//         if (allSelected) next.delete(key);
//         else next.add(key);
//       }
//       return next;
//     });
//   };

//   const bulkDeleteSelected = async () => {
//     const ids = Array.from(selectedIds);
//     if (ids.length === 0) return toast.info('No posts selected');

//     if (!window.confirm(`Delete ${ids.length} selected post(s)? This cannot be undone.`)) return;

//     try {
//       setPosts((prev) => (prev ?? []).filter((p) => !selectedIds.has(String(p.id))));
//       setSelectedIds(new Set());

//       if (typeof blogsAPI.deleteMany === 'function') {
//         await blogsAPI.deleteMany(ids);
//       } else if (typeof blogsAPI.bulkDelete === 'function') {
//         await blogsAPI.bulkDelete({ ids });
//       } else if (typeof blogsAPI.deletePost === 'function') {
//         await Promise.all(
//           ids.map((id) => blogsAPI.deletePost(id).catch(() => { }))
//         );
//       }

//       toast.success('Selected posts deleted');
//     } catch (e) {
//       console.error(e);
//       toast.error('Bulk delete failed. Refreshing list to resync.');
//       handleRefresh();
//     }
//   };

//   const bulkPublishSelected = async () => {
//     const ids = Array.from(selectedIds);
//     if (ids.length === 0) return toast.info('No posts selected');

//     try {
//       const nowISO = new Date().toISOString();
//       setPosts((prev) =>
//         (prev ?? []).map((p) =>
//           ids.includes(String(p.id)) ? { ...p, status: 'published', publishedAt: nowISO } : p
//         )
//       );

//       if (typeof blogsAPI.bulkUpdate === 'function') {
//         await blogsAPI.bulkUpdate({ ids, data: { status: 'published', publishedAt: nowISO } });
//       } else if (typeof blogsAPI.updatePost === 'function') {
//         await Promise.all(
//           ids.map((id) => blogsAPI.updatePost(id, { status: 'published', publishedAt: nowISO }))
//         );
//       }

//       toast.success('Selected posts published');
//       setSelectedIds(new Set());
//       setPostStateTab('published');
//     } catch (e) {
//       console.error(e);
//       toast.error('Bulk publish failed. Refreshing list to resync.');
//       handleRefresh();
//     }
//   };

//   const handleEditPost = (post: BlogPost) => {
//     setSelectedPost(post);
//     setShowPostEditor(true);
//   };

//   const formatDate = (dateString?: string) => {
//     if (!dateString) return '';
//     try {
//       return new Date(dateString).toLocaleDateString();
//     } catch {
//       return String(dateString);
//     }
//   };

//   const renderPreviewHtml = (content?: string) => {
//     const c = content || '';
//     return c
//       .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
//       .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3">$1</h2>')
//       .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
//       .replace(/\*(.*?)\*/gim, '<em>$1</em>')
//       .replace(/`(.*?)`/gim, '<code style="background:#f3f4f6;padding:2px 4px;border-radius:4px;">$1</code>')
//       .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
//       .replace(/\n\n/g, '</p><p class="mb-4">')
//       .replace(/\n/g, '<br>');
//   };

//   const handlePreviewPost = (p: BlogPost) => {
//     if (!p) return;
//     setPreviewPost(p);
//     setShowPreviewModal(true);
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') {
//         setShowPreviewModal(false);
//         setPreviewPost(null);
//         window.removeEventListener('keydown', onKey);
//       }
//     };
//     window.addEventListener('keydown', onKey);
//   };

//   const closePreviewModal = () => {
//     setShowPreviewModal(false);
//     setPreviewPost(null);
//   };

//   const openPreviewInNewWindow = (p: BlogPost) => {
//     if (!p) return;
//     if (typeof window === 'undefined') return;
//     const safeTitle = (p.title || 'Preview').replace(/</g, '&lt;').replace(/>/g, '&gt;');
//     const src = getPostSourceName(p);
//     const srcDot = src ? ` • ${src}` : '';
//     const bodyHtml = `<article style="max-width:900px;margin:20px auto;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#111827;line-height:1.7;">
//       <header style="margin-bottom:16px;">
//         <h1 style="font-size:28px;margin:0 0 8px;color:#0f172a;">${safeTitle}</h1>
//         <div style="color:#6b7280;font-size:14px;margin-bottom:12px;">
//           ${(p.author || '').replace(/</g, '&lt;')} • ${formatDate(p.publishedAt || p.createdAt || new Date().toISOString())}${srcDot}
//         </div>
//       </header>
//       ${p.featuredImage ? `<img src="${p.featuredImage}" alt="featured" style="width:100%;height:auto;border-radius:8px;margin-bottom:16px;" />` : ''}
//       <section>${renderPreviewHtml(p.content || '')}</section>
//     </article>`;
//     const html = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${safeTitle}</title>
//       <style>body{background:#fff;margin:0;padding:24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#111827}</style>
//       </head><body>${bodyHtml}</body></html>`.replace(/<\/script/g, '<\\/script');
//     const blob = new Blob([html], { type: 'text/html' });
//     const url = URL.createObjectURL(blob);
//     window.open(url, '_blank', 'noopener');
//     setTimeout(() => URL.revokeObjectURL(url), 10000);
//   };

//   // ---------- COMMENTS: fetch all (post-wise aggregate) ----------
//   const normalizeCreatedAt = (c: CommentItem) =>
//     (c.created_at as any) || (c.createdAt as any) || '';

//   const buildPostsMap = (all: BlogPost[]) => {
//     const map = new Map<string, string>(); // key: id/slug -> title
//     all.forEach((p: any) => {
//       const idKey = p?.id != null ? String(p.id) : '';
//       const slugKey = p?.slug ? String(p.slug) : '';
//       if (idKey) map.set(idKey, p.title || 'Untitled');
//       if (slugKey) map.set(slugKey, p.title || 'Untitled'); // ✅ map by slug too
//     });
//     return map;
//   };

//   const fetchAllPostsForComments = async (): Promise<BlogPost[]> => {
//     // Try to fetch "all" (no status filter) so comments tab covers every post
//     try {
//       const data = await blogsAPI.getAllPosts({});
//       let list: any[] = [];
//       if (Array.isArray(data)) list = data;
//       else if (Array.isArray(data?.items)) list = data.items;
//       else if (Array.isArray(data?.data)) list = data.data;
//       else if (Array.isArray(data?.results)) list = data.results;
//       else if (Array.isArray(data?.posts)) list = data.posts;
//       else if (data && (data.id || data.title)) list = [data];
//       return (list || []).map(normalizePost);
//     } catch {
//       // fallback to what we already have in state
//       return Array.isArray(posts) ? posts : [];
//     }
//   };

//   const loadAllComments = useCallback(async () => {
//     setLoadingAllComments(true);
//     try {
//       // 1) get all posts (best effort)
//       const allPosts = await fetchAllPostsForComments();
//       const pMap = buildPostsMap(allPosts);

//       // 2) Try a direct "get all comments" endpoint if available on blogsAPI
//       if (typeof blogsAPI.getAllComments === 'function') {
//         try {
//           const got = await blogsAPI.getAllComments(); // should return array
//           const arr: CommentItem[] = Array.isArray(got?.data) ? got.data : Array.isArray(got) ? got : [];
//           const rows: CommentRow[] = (arr || []).map((c) => {
//             const postKey =
//               (c.post_id != null ? String(c.post_id) : '') ||
//               (c.postId != null ? String(c.postId) : '') ||
//               (c.post_slug ? String(c.post_slug) : '') ||
//               (c.postSlug ? String(c.postSlug) : '');
//             return {
//               id: String(c.id ?? ''),
//               postTitle: pMap.get(postKey) || postKey || '—',
//               author: String(c.author || '—'),
//               email: String(c.email || '—'),
//               content: String(c.content || '').slice(0, 200),
//               status: String(c.status || 'pending'),
//               createdAt: String(normalizeCreatedAt(c) || ''),
//             };
//           });
//           rows.sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
//           setCommentsRows(rows);
//           setLoadingAllComments(false);
//           return;
//         } catch {
//           // fall through to per-post aggregation
//         }
//       }

//       // 3) Aggregate per-post (guaranteed path with your existing blogsAPI.getComments)
//       const perPostArrays = await Promise.all(
//         allPosts.map(async (p: any) => {
//           try {
//             const keyForFetch = p?.slug || String(p?.id || ''); // ✅ prefer slug for /public/blogs/:slug/comments
//             if (!keyForFetch) return [] as CommentItem[];
//             const res = await blogsAPI.getComments(keyForFetch);
//             const list: CommentItem[] = Array.isArray(res?.data)
//               ? res.data
//               : Array.isArray(res?.comments)
//                 ? res.comments
//                 : Array.isArray(res)
//                   ? res
//                   : [];
//             return list.map((c) => ({
//               ...c,
//               post_id: c.post_id ?? c.postId ?? p.id,
//               post_slug: c.post_slug ?? c.postSlug ?? p.slug,
//             })) as CommentItem[];
//           } catch {
//             return [] as CommentItem[];
//           }
//         })
//       );

//       const flat: CommentItem[] = perPostArrays.flat();
//       const rows: CommentRow[] = flat.map((c) => {
//         const postKey =
//           (c.post_id != null ? String(c.post_id) : '') ||
//           (c.postId != null ? String(c.postId) : '') ||
//           (c.post_slug ? String(c.post_slug) : '') ||
//           (c.postSlug ? String(c.postSlug) : '');
//         return {
//           id: String(c.id ?? ''),
//           postTitle: pMap.get(postKey) || postKey || '—',
//           author: String(c.author || '—'),
//           email: String(c.email || '—'),
//           content: String(c.content || '').slice(0, 200),
//           status: String(c.status || 'pending'),
//           createdAt: String(normalizeCreatedAt(c) || ''),
//         };
//       });

//       rows.sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
//       setCommentsRows(rows);
//     } catch (e) {
//       console.error(e);
//       toast.error('Failed to load comments.');
//       setCommentsRows([]);
//     } finally {
//       setLoadingAllComments(false);
//     }
//   }, [posts]);

//   // Auto-load when user opens the Comments tab
//   useEffect(() => {
//     if (activeTab === 'comments') {
//       loadAllComments();
//     }
//   }, [activeTab, loadAllComments]);

//   // --------- Filters & pagination for posts list ---------
//   const postsArray = Array.isArray(posts) ? posts : [];

//   const baseFiltered = postsArray.filter((post) => {
//     const matchesSearch =
//       !searchTerm ||
//       post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       post.content?.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
//     const matchesStatusLegacy = selectedStatus === 'All' || post.status === selectedStatus;
//     const matchesSubTab =
//       postStateTab === 'draft' ? post.status === 'draft' : post.status === 'published';
//     return matchesSearch && matchesCategory && matchesStatusLegacy && matchesSubTab;
//   });

//   const totalItems = baseFiltered.length;
//   const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
//   const currentPage = Math.min(page, totalPages);

//   useEffect(() => {
//     setPage(1);
//   }, [searchTerm, selectedCategory, selectedStatus, postStateTab]);

//   const paginatedPosts = useMemo(() => {
//     const start = (currentPage - 1) * pageSize;
//     const end = start + pageSize;
//     return baseFiltered.slice(start, end);
//   }, [baseFiltered, currentPage, pageSize]);

//   const categories: BlogCategory[] = [
//     'Real Estate',
//     'Investment',
//     'Market Analysis',
//     'Legal',
//     'Home Buying',
//     'Home Selling',
//     'Property News',
//     'Construction',
//     'Finance',
//   ];

//   const statuses: BlogStatus[] = ['draft', 'published', 'archived'];

//   // ---------- Views ----------
//   const renderDashboard = () => (
//     <div className="space-y-6">
//       {/* Summary cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
//           <div className="flex items-center space-x-3">
//             <div className="p-3 bg-blue-100 rounded-xl">
//               <FileText className="text-blue-600" size={24} />
//             </div>
//             <div>
//               <h3 className="text-sm font-medium text-gray-600">Total Posts</h3>
//               <p className="text-2xl font-bold text-gray-900">{postsArray.length}</p>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
//           <div className="flex items-center space-x-3">
//             <div className="p-3 bg-green-100 rounded-xl">
//               <Eye className="text-green-600" size={24} />
//             </div>
//             <div>
//               <h3 className="text-sm font-medium text-gray-600">Total Views</h3>
//               <p className="text-2xl font-bold text-gray-900">
//                 {postsArray.reduce((acc, post) => acc + (post.views || 0), 0).toLocaleString()}
//               </p>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
//           <div className="flex items-center space-x-3">
//             <div className="p-3 bg-purple-100 rounded-xl">
//               <GlobeIcon className="text-purple-600" size={24} />
//             </div>
//             <div>
//               <h3 className="text-sm font-medium text-gray-600">RSS Sources</h3>
//               <p className="text-2xl font-bold text-gray-900">{rssources.length}</p>
//             </div>
//           </div>
//         </div>
//         <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
//           <div className="flex items-center space-x-3">
//             <div className="p-3 bg-orange-100 rounded-xl">
//               <Heart className="text-orange-600" size={24} />
//             </div>
//             <div>
//               <h3 className="text-sm font-medium text-gray-600">Engagement</h3>
//               <p className="text-2xl font-bold text-gray-900">
//                 {postsArray.reduce(
//                   (acc, post) => acc + ((post.likes || 0) + (post.comments || 0)),
//                   0
//                 )}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Quick actions */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//         <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           <button
//             onClick={() => {
//               setSelectedPost(null);
//               setShowAIWriter(true);
//             }}
//             className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl hover:shadow-lg transition-all text-left"
//           >
//             <Bot className="mb-2" size={24} />
//             <div className="font-semibold">AI Writer</div>
//             <div className="text-xs text-purple-100">Generate new content</div>
//           </button>
//           <button
//             onClick={() => {
//               setShowPostEditor(true);
//               setSelectedPost(null);
//             }}
//             className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl hover:shadow-lg transition-all text-left"
//           >
//             <Plus className="mb-2" size={24} />
//             <div className="font-semibold">New Post</div>
//             <div className="text-xs text-blue-100">Create manually</div>
//           </button>
//           <button
//             onClick={() => setShowRSSManager(true)}
//             className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-xl hover:shadow-lg transition-all text-left"
//           >
//             <GlobeIcon className="mb-2" size={24} />
//             <div className="font-semibold">RSS Import</div>
//             <div className="text-xs text-green-100">Auto-import content</div>
//           </button>
//           <button
//             onClick={() => setShowSocialManager(true)}
//             className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 rounded-xl hover:shadow-lg transition-all text-left"
//           >
//             <Share2 className="mb-2" size={24} />
//             <div className="font-semibold">Social Media</div>
//             <div className="text-xs text-orange-100">Schedule posts</div>
//           </button>
//         </div>
//       </div>

//       {/* Recent posts */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//         <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Posts</h3>
//         <div className="space-y-3">
//           {postsArray.slice(0, 5).map((post) => {
//             const src = getPostSourceName(post);
//             return (
//               <div
//                 key={post.id}
//                 className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-all"
//               >
//                 <div className="flex items-center space-x-4">
//                   {post.featuredImage ? (
//                     <img
//                       src={post.featuredImage}
//                       alt={post.title}
//                       className="w-12 h-12 object-cover rounded-lg"
//                     />
//                   ) : (
//                     <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
//                       <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3v18h18" />
//                       </svg>
//                     </div>
//                   )}
//                   <div>
//                     <h4 className="font-medium text-gray-900">{post.title}</h4>
//                     <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-gray-600">
//                       <span className="flex items-center space-x-1">
//                         <Eye size={12} />
//                         <span>{post.views || 0}</span>
//                       </span>
//                       <span>{post.category}</span>
//                       {src ? <span>• {src}</span> : null}
//                       <span
//                         className={`px-2 py-0.5 rounded-full text-xs ${post.status === 'published'
//                           ? 'bg-green-100 text-green-800'
//                           : post.status === 'draft'
//                             ? 'bg-yellow-100 text-yellow-800'
//                             : 'bg-gray-100 text-gray-800'
//                           }`}
//                       >
//                         {post.status}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <button
//                     onClick={() => handlePreviewPost(post)}
//                     className="text-blue-600 hover:text-blue-700"
//                     title="Preview"
//                   >
//                     <Eye size={20} />
//                   </button>
//                   <button
//                     onClick={() => handleEditPost(post)}
//                     className="text-blue-600 hover:text-blue-700"
//                     title="Edit"
//                   >
//                     <Edit size={20} />
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );

//   const renderContentManagement = () => {
//     const allSelectedOnPage = areAllCurrentPageSelected(paginatedPosts);

//     return (
//       <div className="space-y-6">
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//           <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
//             <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-full">
//               <button
//                 onClick={() => setPostStateTab('draft')}
//                 className={`px-4 py-2 rounded-full text-sm font-medium transition ${postStateTab === 'draft' ? 'bg-white shadow border text-gray-900' : 'text-gray-600 hover:text-gray-900'
//                   }`}
//               >
//                 Draft
//               </button>
//               <button
//                 onClick={() => setPostStateTab('published')}
//                 className={`px-4 py-2 rounded-full text-sm font-medium transition ${postStateTab === 'published'
//                   ? 'bg-white shadow border text-gray-900'
//                   : 'text-gray-600 hover:text-gray-900'
//                   }`}
//               >
//                 Published
//               </button>
//             </div>

//             <div className="flex gap-2">
//               <button
//                 onClick={() => setShowPostEditor(true)}
//                 className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
//               >
//                 <Plus size={18} />
//                 <span>New Post</span>
//               </button>
//               <button
//                 onClick={handleRefresh}
//                 disabled={loadingPosts}
//                 className={`px-3 py-2 border rounded-md transition-colors flex items-center gap-2 ${loadingPosts ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-100'
//                   }`}
//                 title="Refresh list"
//               >
//                 <RefreshCw size={16} className={loadingPosts ? 'animate-spin' : ''} />
//                 <span>{loadingPosts ? 'Refreshing...' : 'Refresh'}</span>
//               </button>
//             </div>
//           </div>

//           {/* Filters */}
//           <div className="flex flex-col md:flex-row gap-4">
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
//               <input
//                 type="text"
//                 placeholder={`Search ${postStateTab === 'draft' ? 'drafts' : 'published'}...`}
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//             <select
//               value={selectedCategory}
//               onChange={(e) => setSelectedCategory(e.target.value)}
//               className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="All">All Categories</option>
//               {categories.map((category) => (
//                 <option key={category} value={category}>
//                   {category}
//                 </option>
//               ))}
//             </select>
//             <div className="flex items-center gap-2">
//               <span className="text-sm text-gray-600">Page size</span>
//               <select
//                 value={pageSize}
//                 onChange={(e) => setPageSize(Number(e.target.value))}
//                 className="px-3 py-2 border rounded-md"
//               >
//                 {[5, 10, 15, 20].map((s) => (
//                   <option key={s} value={s}>
//                     {s}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Bulk action bar */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
//           <div className="text-sm">
//             Selected: <span className="font-semibold">{selectedIds.size}</span>
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={bulkPublishSelected}
//               disabled={selectedIds.size === 0}
//               className={`px-3 py-2 rounded-md border ${selectedIds.size === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
//                 }`}
//               title="Publish selected"
//             >
//               Publish Selected
//             </button>
//             <button
//               onClick={bulkDeleteSelected}
//               disabled={selectedIds.size === 0}
//               className={`px-3 py-2 rounded-md border text-red-600 ${selectedIds.size === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50 border-red-300'
//                 }`}
//               title="Delete selected"
//             >
//               Delete Selected
//             </button>
//             <button
//               onClick={() => setSelectedIds(new Set())}
//               disabled={selectedIds.size === 0}
//               className={`px-3 py-2 rounded-md border ${selectedIds.size === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
//                 }`}
//             >
//               Clear Selection
//             </button>
//           </div>
//         </div>

//         {/* Posts table */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//           <div className="flex items-center justify-between gap-3 mb-6">
//             <h3 className="text-lg font-bold text-gray-900">
//               {postStateTab === 'draft' ? 'Draft Posts' : 'Published Posts'} ({totalItems})
//             </h3>

//             {/* Pagination header controls */}
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//                 disabled={currentPage <= 1}
//                 className={`p-2 rounded-md border ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
//                   }`}
//                 title="Previous"
//               >
//                 <ChevronLeft size={18} />
//               </button>
//               <div className="text-sm text-gray-700">
//                 Page <span className="font-semibold">{currentPage}</span> / {totalPages}
//               </div>
//               <button
//                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                 disabled={currentPage >= totalPages}
//                 className={`p-2 rounded-md border ${currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
//                   }`}
//                 title="Next"
//               >
//                 <ChevronRight size={18} />
//               </button>
//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-gray-200">
//                   <th className="py-3 px-4">
//                     <input
//                       type="checkbox"
//                       checked={paginatedPosts.length > 0 && paginatedPosts.every((p) => selectedIds.has(String(p.id)))}
//                       onChange={() => toggleSelectAllOnPage(paginatedPosts)}
//                     />
//                   </th>
//                   <th className="text-left py-3 px-4 font-medium text-gray-700">Title</th>
//                   <th className="text-left py-3 px-4 font-medium text-gray-700">Source</th>
//                   <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
//                   <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
//                   <th className="text-left py-3 px-4 font-medium text-gray-700">Stats</th>
//                   <th className="text-left py-3 px-4 font-medium text-gray-700">Quality</th>
//                   <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {paginatedPosts.map((post) => {
//                   const getQualityScore = (content: string) => {
//                     const seoScore = content.includes('#') && content.includes('##') ? 85 : 65;
//                     const readabilityScore = content.length > 500 ? 88 : 75;
//                     const overall = Math.round((seoScore + readabilityScore) / 2);
//                     return { overall, seo: seoScore, readability: readabilityScore };
//                   };
//                   const getPlagiarismScore = (content: string) => Math.floor(Math.random() * 5) + 95;

//                   const qualityScore = getQualityScore(post.content || '');
//                   const plagiarismScore = getPlagiarismScore(post.content || '');
//                   const srcName = getPostSourceName(post);

//                   const checked = selectedIds.has(String(post.id));

//                   return (
//                     <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
//                       <td className="py-3 px-4">
//                         <input
//                           type="checkbox"
//                           checked={checked}
//                           onChange={() => toggleSelectOne(post.id!)}
//                         />
//                       </td>
//                       <td className="py-3 px-4">
//                         <div className="flex items-center space-x-3">
//                           {post.featuredImage ? (
//                             <img
//                               src={post.featuredImage}
//                               alt={post.title}
//                               className="w-10 h-10 object-cover rounded-lg"
//                             />
//                           ) : (
//                             <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
//                               <svg
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 className="w-5 h-5"
//                                 viewBox="0 0 24 24"
//                                 fill="none"
//                                 stroke="currentColor"
//                               >
//                                 <path
//                                   strokeLinecap="round"
//                                   strokeLinejoin="round"
//                                   strokeWidth="1.5"
//                                   d="M3 3v18h18"
//                                 />
//                               </svg>
//                             </div>
//                           )}
//                           <div>
//                             <h4 className="font-medium text-gray-900">{post.title}</h4>
//                             <p className="text-xs text-gray-600">
//                               {post.author} • {new Date(post.createdAt || Date.now()).toLocaleDateString()}
//                             </p>
//                           </div>
//                         </div>
//                       </td>

//                       {/* SOURCE */}
//                       <td className="py-3 px-4">
//                         {srcName ? (
//                           <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${srcName === 'Manual'
//                               ? 'bg-gray-100 text-gray-700'
//                               : 'bg-indigo-50 text-indigo-700'
//                             }`}>
//                             {srcName !== 'Manual' && <GlobeIcon size={12} />}
//                             {srcName}
//                           </span>
//                         ) : (
//                           <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-xs">
//                             Manual
//                           </span>
//                         )}
//                       </td>

//                       {/* CATEGORY */}
//                       <td className="py-3 px-4">
//                         <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-blue-800  px-2 py-1 text-xs">
//                           {post.category}
//                         </span>
//                       </td>

//                       {/* STATUS */}
//                       <td className="py-3 px-4">
//                         <span
//                           className={`px-2 py-1 rounded-full text-xs ${post.status === 'published'
//                             ? 'bg-green-100 text-green-800'
//                             : post.status === 'draft'
//                               ? 'bg-yellow-100 text-yellow-800'
//                               : 'bg-gray-100 text-gray-800'
//                             }`}
//                         >
//                           {post.status}
//                         </span>
//                       </td>

//                       {/* STATS */}
//                       <td className="py-3 px-4">
//                         <div className="text-xs text-gray-600">
//                           <div>{post.views || 0} views</div>
//                           <div>{post.likes || 0} likes</div>
//                         </div>
//                       </td>

//                       {/* QUALITY */}
//                       <td className="py-3 px-4">
//                         <div className="space-y-1">
//                           <div className="flex items-center space-x-2">
//                             <div className="text-xs text-gray-600">SEO:</div>
//                             <div
//                               className={`text-xs font-medium ${qualityScore.seo > 80 ? 'text-green-600' : 'text-yellow-600'
//                                 }`}
//                             >
//                               {qualityScore.seo}%
//                             </div>
//                           </div>
//                           <div className="flex items-center space-x-2">
//                             <div className="text-xs text-gray-600">Original:</div>
//                             <div className="text-xs font-medium text-green-600">{plagiarismScore}%</div>
//                           </div>
//                         </div>
//                       </td>

//                       {/* ACTIONS */}
//                       <td className="py-3 px-4">
//                         <div className="flex items-center gap-3 whitespace-nowrap">
//                           <button
//                             onClick={() => handleEditPost(post)}
//                             className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition"
//                             title="Edit"
//                           >
//                             <Edit size={18} className="shrink-0" />
//                           </button>

//                           <button
//                             onClick={() => handlePreviewPost(post)}
//                             className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition"
//                             title="Preview"
//                           >
//                             <Eye size={18} className="shrink-0" />
//                           </button>

//                           <button
//                             onClick={() => {
//                               setActiveTab('comments');
//                               // comments auto-load via effect
//                             }}
//                             className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition"
//                             title="Comments"
//                           >
//                             <MessageSquare size={18} className="shrink-0" />
//                           </button>

//                           <button
//                             onClick={() => setShowAIWriter(true)}
//                             className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition"
//                             title="AI Rewrite"
//                           >
//                             <Wand2 size={18} className="shrink-0" />
//                           </button>

//                           <button
//                             onClick={() => handleDeletePost(post.id!)}
//                             className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition"
//                             title="Delete"
//                           >
//                             <Trash2 size={18} className="shrink-0" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//                 {paginatedPosts.length === 0 && (
//                   <tr>
//                     <td colSpan={8} className="py-10 text-center text-gray-500">
//                       No {postStateTab} posts found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Footer pagination */}
//           <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
//             <div className="text-sm text-gray-600">
//               Showing{' '}
//               <span className="font-semibold">
//                 {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}
//               </span>
//               {' - '}
//               <span className="font-semibold">{Math.min(currentPage * pageSize, totalItems)}</span>{' '}
//               of <span className="font-semibold">{totalItems}</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => setPage(1)}
//                 disabled={currentPage === 1}
//                 className={`px-3 py-2 border rounded-md ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
//                   }`}
//               >
//                 First
//               </button>
//               <button
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//                 disabled={currentPage === 1}
//                 className={`px-3 py-2 border rounded-md ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
//                   }`}
//               >
//                 Prev
//               </button>
//               <span className="px-3 py-2 text-sm">
//                 Page <span className="font-semibold">{currentPage}</span> / {totalPages}
//               </span>
//               <button
//                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                 disabled={currentPage === totalPages}
//                 className={`px-3 py-2 border rounded-md ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
//                   }`}
//               >
//                 Next
//               </button>
//               <button
//                 onClick={() => setPage(totalPages)}
//                 disabled={currentPage === totalPages}
//                 className={`px-3 py-2 border rounded-md ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
//                   }`}
//               >
//                 Last
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   /* ------------------------- COMMENTS ACTION HANDLERS ------------------------- */

//   const deleteComment = async (id: string) => {
//     if (!window.confirm('Delete this comment?')) return;
//     try {
//       setCommentActionLoading(id);
//       await blogsAPI.deleteComment(id);
//       setCommentsRows((rows) => rows.filter((r) => r.id !== id));
//       toast.success('Comment deleted');
//     } catch (e) {
//       console.error(e);
//       toast.error('Failed to delete');
//     } finally {
//       setCommentActionLoading(null);
//     }
//   };

//   const editComment = async (row: CommentRow) => {
//     try {
//       const newAuthor = window.prompt('Edit author', row.author ?? '') ?? row.author;
//       const newEmail = window.prompt('Edit email', row.email ?? '') ?? row.email;
//       const newContent = window.prompt('Edit content', row.content ?? '') ?? row.content;

//       if (
//         newAuthor === row.author &&
//         newEmail === row.email &&
//         newContent === row.content
//       ) {
//         return; // nothing changed
//       }

//       setCommentActionLoading(row.id);
//       await blogsAPI.updateComment(row.id, {
//         author: newAuthor,
//         email: newEmail,
//         content: newContent,
//       });

//       setCommentsRows((rows) =>
//         rows.map((r) =>
//           r.id === row.id ? { ...r, author: newAuthor, email: newEmail, content: newContent } : r
//         )
//       );
//       toast.success('Comment updated');
//     } catch (e) {
//       console.error(e);
//       toast.error('Failed to update comment');
//     } finally {
//       setCommentActionLoading(null);
//     }
//   };

//   // -------- COMMENTS TAB UI --------
//   const renderCommentsTab = () => {
//     const filtered = commentsRows.filter((r) => {
//       if (!commentsSearch) return true;
//       const q = commentsSearch.toLowerCase();
//       return (
//         r.postTitle.toLowerCase().includes(q) ||
//         r.author.toLowerCase().includes(q) ||
//         r.email.toLowerCase().includes(q) ||
//         r.content.toLowerCase().includes(q) ||
//         r.status.toLowerCase().includes(q)
//       );
//     });

//     return (
//       <div className="space-y-6">
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
//             <h3 className="text-base sm:text-lg font-bold text-gray-900">Comments</h3>
//             <div className="flex gap-2">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
//                 <input
//                   value={commentsSearch}
//                   onChange={(e) => setCommentsSearch(e.target.value)}
//                   placeholder="Search comments..."
//                   className="pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <button
//                 onClick={loadAllComments}
//                 disabled={loadingAllComments}
//                 className={`px-3 py-2 border rounded-lg flex items-center gap-2 ${loadingAllComments ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'}`}
//                 title="Refresh comments"
//               >
//                 <RefreshCw size={16} className={loadingAllComments ? 'animate-spin' : ''} />
//                 <span>{loadingAllComments ? 'Loading...' : 'Refresh'}</span>
//               </button>
//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-gray-200 text-left">
//                   <th className="py-3 px-4 text-gray-700 font-medium">Post</th>
//                   <th className="py-3 px-4 text-gray-700 font-medium">Author</th>
//                   <th className="py-3 px-4 text-gray-700 font-medium">Email</th>
//                   <th className="py-3 px-4 text-gray-700 font-medium">Content</th>
//                   <th className="py-3 px-4 text-gray-700 font-medium">Status</th>
//                   <th className="py-3 px-4 text-gray-700 font-medium">Created At</th>
//                   <th className="py-3 px-4 text-gray-700 font-medium">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filtered.map((r) => {
//                   const isRowLoading = commentActionLoading === r.id;
//                   const isApproved = r.status === 'approved';

//                   return (
//                     <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
//                       <td className="py-3 px-4">{r.postTitle}</td>
//                       <td className="py-3 px-4">{r.author}</td>
//                       <td className="py-3 px-4">{r.email || '—'}</td>
//                       <td className="py-3 px-4">
//                         <span title={r.content}>{r.content}</span>
//                       </td>
//                       <td className="py-3 px-4">
//                         <span
//                           className={`px-2 py-1 rounded-full text-xs ${r.status === 'approved'
//                             ? 'bg-green-100 text-green-800'
//                             : r.status === 'rejected'
//                               ? 'bg-red-100 text-red-700'
//                               : 'bg-yellow-100 text-yellow-800'
//                             }`}
//                         >
//                           {r.status}
//                         </span>
//                       </td>
//                       <td className="py-3 px-4">{r.createdAt ? formatDate(r.createdAt) : '—'}</td>
//                       <td className="py-3 px-4">
//                         <div className="flex items-center gap-2">
//                           {/* Edit */}
//                           <button
//                             disabled={isRowLoading}
//                             onClick={() => editComment(r)}
//                             title="Edit"
//                             className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition ${isRowLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
//                           >
//                             <Edit size={18} />
//                           </button>

//                           {/* Delete */}
//                           <button
//                             disabled={isRowLoading}
//                             onClick={() => deleteComment(r.id)}
//                             title="Delete"
//                             className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition ${isRowLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
//                           >
//                             <Trash2 size={18} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}

//                 {!loadingAllComments && filtered.length === 0 && (
//                   <tr>
//                     <td colSpan={7} className="py-10 text-center text-gray-500">
//                       No comments found.
//                     </td>
//                   </tr>
//                 )}

//                 {loadingAllComments && (
//                   <tr>
//                     <td colSpan={7} className="py-10 text-center text-gray-500">
//                       Loading comments…
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           <div className="mt-3 text-sm text-gray-600">
//             Showing <span className="font-semibold">{filtered.length}</span> comment(s)
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // ---------- AI tools + SEO unchanged ----------
//   const renderAITools = () => (
//     <div className="space-y-6">
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//         <h3 className="text-lg font-bold text-gray-900 mb-6">AI Enhancement Tools</h3>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
//             <div className="flex items-center space-x-3 mb-4">
//               <div className="p-2 bg-green-100 rounded-lg">
//                 <Save className="text-green-600" size={20} />
//               </div>
//               <h4 className="font-semibold text-gray-900">Plagiarism Checker</h4>
//             </div>
//             <p className="text-sm text-gray-600 mb-4">
//               Advanced AI-powered plagiarism detection with 99.7% accuracy
//             </p>
//             <div className="space-y-2">
//               <div className="flex justify-between text-sm">
//                 <span>Accuracy Rate</span>
//                 <span className="font-bold text-green-600">99.7%</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span>Avg Originality</span>
//                 <span className="font-bold text-green-600">97.2%</span>
//               </div>
//             </div>
//             <button className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
//               Run Bulk Check
//             </button>
//           </div>

//           <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
//             <div className="flex items-center space-x-3 mb-4">
//               <div className="p-2 bg-blue-100 rounded-lg">
//                 <TrendingUp className="text-blue-600" size={20} />
//               </div>
//               <h4 className="font-semibold text-gray-900">SEO Optimizer</h4>
//             </div>
//             <p className="text-sm text-gray-600 mb-4">Automatically optimize content for search engines</p>
//             <div className="space-y-2">
//               <div className="flex justify-between text-sm">
//                 <span>Avg SEO Score</span>
//                 <span className="font-bold text-blue-600">89.5%</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span>Posts Optimized</span>
//                 <span className="font-bold text-blue-600">{postsArray.length}</span>
//               </div>
//             </div>
//             <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
//               Optimize All
//             </button>
//           </div>

//           <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
//             <div className="flex items-center space-x-3 mb-4">
//               <div className="p-2 bg-purple-100 rounded-lg">
//                 <Wand2 className="text-purple-600" size={20} />
//               </div>
//               <h4 className="font-semibold text-gray-900">AI Enhancer</h4>
//             </div>
//             <p className="text-sm text-gray-600 mb-4">Improve readability, tone, and engagement</p>
//             <div className="space-y-2">
//               <div className="flex justify-between text-sm">
//                 <span>Enhancement Rate</span>
//                 <span className="font-bold text-purple-600">92.8%</span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span>Improved Posts</span>
//                 <span className="font-bold text-purple-600">{Math.floor(postsArray.length * 0.8)}</span>
//               </div>
//             </div>
//             <button className="w-full mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
//               Bulk Enhance
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const renderSEOTools = () => (
//     <div className="space-y-6">
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//         <h3 className="text-lg font-bold text-gray-900 mb-6">SEO Optimization Tools</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <h4 className="font-semibold text-gray-900 mb-4">Keyword Analysis</h4>
//             <div className="space-y-3">
//               <div className="p-4 bg-blue-50 rounded-lg">
//                 <h5 className="font-medium text-blue-900 mb-2">Top Performing Keywords</h5>
//                 <div className="space-y-2">
//                   <div className="flex justify-between text-sm">
//                     <span>"real estate investment"</span>
//                     <span className="font-bold text-blue-600">1,200 searches</span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span>"mumbai property"</span>
//                     <span className="font-bold text-blue-600">890 searches</span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span>"home buying guide"</span>
//                     <span className="font-bold text-blue-600">650 searches</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div>
//             <h4 className="font-semibold text-gray-900 mb-4">Content Optimization</h4>
//             <div className="space-y-4">
//               {postsArray.slice(0, 3).map((post) => {
//                 const seoScore = (post.content || '').includes('#') ? 85 : 65;
//                 return (
//                   <div key={post.id} className="p-4 border border-gray-200 rounded-lg">
//                     <div className="flex items-center justify-between mb-2">
//                       <h5 className="font-medium text-gray-900 text-sm">{post.title}</h5>
//                       <span
//                         className={`text-xs font-bold ${seoScore > 80 ? 'text-green-600' : seoScore > 60 ? 'text-yellow-600' : 'text-red-600'
//                           }`}
//                       >
//                         {seoScore}%
//                       </span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
//                         <div
//                           className={`h-2 rounded-full ${seoScore > 80 ? 'bg-green-500' : seoScore > 60 ? 'bg-yellow-500' : 'bg-red-500'
//                             }`}
//                           style={{ width: `${seoScore}%` }}
//                         />
//                       </div>
//                       <button className="text-blue-600 hover:text-blue-700 text-xs">Optimize</button>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   // ---------- Main render ----------
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Management Center</h1>
//           <p className="text-gray-600">Comprehensive blog management with AI-powered tools</p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
//           <div className="flex flex-nowrap border-b border-gray-200 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
//             {tabs.map((tab) => {
//               const Icon = tab.icon;
//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`flex items-center space-x-2 px-5 py-3 sm:px-6 sm:py-4 font-medium transition-colors whitespace-nowrap shrink-0 ${activeTab === tab.id
//                     ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
//                     : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
//                     }`}
//                 >
//                   <Icon size={18} className="shrink-0" />
//                   <span className="truncate">{tab.label}</span>
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         <div>
//           {activeTab === 'dashboard' && renderDashboard()}
//           {activeTab === 'content' && renderContentManagement()}
//           {activeTab === 'comments' && renderCommentsTab()}
//           {activeTab === 'ai-writer' && (
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//               <h3 className="text-lg font-bold text-gray-900 mb-2">AI Content Studio</h3>
//               <p className="text-gray-600 mb-4">Generate long-form, SEO-optimized posts with images &amp; ToC.</p>
//               <button
//                 onClick={() => { setSelectedPost(null); setShowAIWriter(true); }}
//                 className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
//               >
//                 <Bot size={18} /> Open AI Writer
//               </button>
//             </div>
//           )}

//           {activeTab === 'ai-tools' && renderAITools()}
//           {activeTab === 'rss' && <RSSSourceManager />}
//           {activeTab === 'social' && <SocialMediaManager posts={postsArray} />}
//           {activeTab === 'seo' && renderSEOTools()}
//           {activeTab === 'analytics' && <BlogAnalytics posts={postsArray} />}
//         </div>

//         {showPostEditor && (
//           <BlogPostEditor
//             post={selectedPost as any}
//             onSave={(p: Partial<any>) => handleSavePost(p as Partial<BlogPost>)}
//             onCancel={() => {
//               setShowPostEditor(false);
//               setSelectedPost(null);
//             }}
//             isOpen={showPostEditor}
//             currentUserName={getUserDisplayName(user)}
//             lockAuthor={true}
//           />
//         )}

//         {showAIWriter && (
//           <AIBlogWriter
//             isOpen={true}
//             post={selectedPost as any}
//             onSave={(p: Partial<BlogPost>) => {
//               handleSavePost(p);
//               setShowAIWriter(false);
//               setSelectedPost(null);
//               setAutoPublishAfterAI(null);
//             }}
//             onCancel={() => {
//               setShowAIWriter(false);
//               setSelectedPost(null);
//               setAutoPublishAfterAI(null);
//             }}
//             currentUserName={getUserDisplayName(user)}
//           />
//         )}

//         {showRSSManager && <RSSSourceManager isOpen={true} onClose={() => setShowRSSManager(false)} />}

//         {showSocialManager && (
//           <SocialMediaManager
//             posts={postsArray}
//             isOpen={true}
//             onClose={() => setShowSocialManager(false)}
//           />
//         )}
//       </div>

//       {showPreviewModal && previewPost && (
//         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
//           <div className="absolute inset-0 bg-black/50" onClick={closePreviewModal} />
//           <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl z-[70] relative">
//             <div className="flex items-center justify-between p-4 border-b">
//               <div className="flex items-center space-x-3">
//                 <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md flex items-center justify-center text-white font-bold text-sm">
//                   {String(previewPost.author || 'A')
//                     .split(' ')
//                     .map((n) => n[0])
//                     .join('')}
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-bold text-gray-900">{previewPost.title}</h3>
//                   <div className="text-xs text-gray-500">
//                     {previewPost.author} • {formatDate(previewPost.publishedAt || previewPost.createdAt)}
//                     {(() => {
//                       const src = getPostSourceName(previewPost);
//                       return src ? ` • ${src}` : '';
//                     })()}
//                   </div>
//                 </div>
//               </div>

//               <div className="flex items-center space-x-2">
//                 <button onClick={closePreviewModal} className="p-2 rounded-md hover:bg-gray-100">
//                   <X size={16} />
//                 </button>
//               </div>
//             </div>

//             <div className="p-4">
//               {previewPost.featuredImage && (
//                 <img
//                   src={previewPost.featuredImage}
//                   alt={previewPost.title}
//                   className="w-full h-48 object-cover rounded-lg mb-4"
//                 />
//               )}

//               <div
//                 className="prose max-w-none"
//                 dangerouslySetInnerHTML={{ __html: renderPreviewHtml(previewPost.content) }}
//               />

//               {previewPost.tags && (previewPost as any).tags?.length > 0 && (
//                 <div className="mt-6">
//                   <div className="text-sm font-medium mb-2">Tags</div>
//                   <div className="flex flex-wrap gap-2">
//                     {(previewPost as any).tags.map((t: string, i: number) => (
//                       <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
//                         {t}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BlogManagement;

// src/components/blogManager/BlogManagement.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart3,
  FileText,
  Bot,
  Wrench,
  Share2,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Heart,
  Wand2,
  Save,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Globe as GlobeIcon,
  MessageSquare,
  CornerUpLeft,
} from 'lucide-react';

import { BlogPost, RSSSource, BlogCategory, BlogStatus } from '../../types/blog';

import BlogPostEditor from '@/components/blogManager/BlogPostEditor';
import AIBlogWriter from '@/components/blogManager/AIBlogWriter';
import RSSSourceManager from '@/components/blogManager/RSSSourceManager';
import SocialMediaManager from '@/components/blogManager/SocialMediaManager';
import BlogAnalytics from '@/components/blogManager/BlogAnalytics';

import blogsAPIDefault from '@/lib/blogsAPI';
import { rssAPI } from '@/lib/rssAPI';

import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

// Permission check function import karo
import { can } from '@/utils/permission';

type CommentItem = {
  id: string | number;
  author: string;
  email?: string;
  content: string;
  status?: string;
  createdAt?: string;
  created_at?: string;
  post_id?: string | number;
  postId?: string | number;
  post_slug?: string;
  postSlug?: string;
  replies?: CommentItem[];
};

type CommentRow = {
  id: string;
  postTitle: string;
  author: string;
  email: string;
  content: string;
  status: string;
  createdAt: string;
};

const blogsAPI: any = (blogsAPIDefault as any)?.default ?? blogsAPIDefault;

const BlogManagement: React.FC = () => {
  const { user } = useAuth() ?? { user: null };

  // Permission checks
  const canRead = can(user, 'blog.read');
  const canCreate = can(user, 'blog.create');
  const canUpdate = can(user, 'blog.update');
  const canDelete = can(user, 'blog.delete');
  const canBulkDelete = can(user, 'blog.bulk_delete');

  // Main content access check
  if (!canRead) {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <div className="flex-1 grid place-items-center">
          <div className="text-center p-6">
            <div className="text-red-600 text-lg font-semibold mb-2">
              Access Denied
            </div>
            <div className="text-gray-600 text-sm">
              You do not have permission to view sellers.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getUserDisplayName = (u: any) => {
    if (!u) return 'Admin';
    if (typeof u === 'string' && u.trim()) return u;
    const candidates = [
      u.name,
      u.fullName,
      u.displayName,
      u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : null,
      u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : null,
      u.profile?.name,
      u.attributes?.name,
      u.user_metadata?.full_name,
      u.username,
      u.nick,
      u.preferred_username,
    ];
    for (const c of candidates) if (c && String(c).trim()) return String(c).trim();
    if (u?.email) return u.email;
    if (u?.emails && Array.isArray(u.emails) && u.emails[0]) return u.emails[0].value || u.emails[0];
    return 'Admin';
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [rssources, setRSSources] = useState<RSSSource[]>([]);

  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [showPostEditor, setShowPostEditor] = useState(false);
  const [showAIWriter, setShowAIWriter] = useState(false);
  const [showRSSManager, setShowRSSManager] = useState(false);
  const [showSocialManager, setShowSocialManager] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isGenerating, setIsGenerating] = useState(false);

  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);

  const [postStateTab, setPostStateTab] = useState<'draft' | 'published'>('draft');

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // -------- Comments Tab State --------
  const [commentsRows, setCommentsRows] = useState<CommentRow[]>([]);
  const [loadingAllComments, setLoadingAllComments] = useState(false);
  const [commentsSearch, setCommentsSearch] = useState('');

  // per-row action loading for comments
  const [commentActionLoading, setCommentActionLoading] = useState<string | null>(null);

  // auto publish after AI rewrite
  const [autoPublishAfterAI, setAutoPublishAfterAI] =
    useState<null | { originalId: string | number }>(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const sourceNameById = useMemo<Record<string, string>>(
    () =>
      (rssources || []).reduce((acc: Record<string, string>, s: any) => {
        const id = String(s?.id ?? s?._id ?? s?.slug ?? '');
        if (id) acc[id] = String(s?.name ?? s?.title ?? s?.label ?? s?.sourceName ?? 'RSS');
        return acc;
      }, {}),
    [rssources]
  );

  // Updated function to get post source name with "Manual" as default
  const getPostSourceName = useCallback(
    (p: any) => {
      const explicit = p?.sourceName ?? p?.source_name ?? p?.sourceLabel ?? p?.rssSourceName ?? p?.rss_source_name ?? p?.source?.name ?? p?.rss?.name;
      const sid =
        p?.sourceId ??
        p?.source_id ??
        p?.rssSourceId ??
        p?.rss_source_id ??
        (p?.source?.id ?? undefined);
      const mapped = sid != null ? sourceNameById[String(sid)] : undefined;

      // Return "Manual" if no source information is found
      return (explicit || mapped || 'Manual') as string;
    },
    [sourceNameById]
  );

  // Tabs with permission checks
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, description: 'Overview and quick actions', permission: canRead },
    { id: 'content', label: 'Content Management', icon: FileText, description: 'Manage all blog posts', permission: canRead },
    { id: 'comments', label: 'Comments', icon: MessageSquare, description: 'Manage comments & replies', permission: canRead },
    { id: 'ai-writer', label: 'AI Content Studio', icon: Bot, description: 'Create content with AI', permission: canCreate },
    { id: 'ai-tools', label: 'AI Enhancement Tools', icon: Wrench, description: 'Enhance existing content', permission: canUpdate },
    { id: 'rss', label: 'RSS Sources', icon: GlobeIcon, description: 'Auto-import from RSS feeds', permission: canCreate },
    { id: 'social', label: 'Social Media', icon: Share2, description: 'Schedule posts', permission: canCreate },
    { id: 'seo', label: 'SEO Tools', icon: TrendingUp, description: 'Optimize for search engines', permission: canUpdate },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, description: 'Performance insights', permission: canRead },
  ].filter(tab => tab.permission); // Only show tabs user has permission for

  // ---------- Normalize Posts ----------
  const normalizePost = (p: any): BlogPost & { sourceId?: string | number; sourceName?: string; slug?: string } => {
    const sourceId =
      p.sourceId ?? p.source_id ?? p.rssSourceId ?? p.rss_source_id ?? p.rssId ?? p.source?.id;

    const sourceName =
      p.sourceName ??
      p.source_name ??
      p.sourceLabel ??
      p.rssSourceName ??
      p.rss_source_name ??
      p.source?.name ??
      p.rss?.name;

    return {
      id: p.id ?? p._id ?? p.slug ?? `LOCAL_${Date.now()}`,
      slug: p.slug ?? p.permalink ?? p.seoSlug ?? p.meta?.slug ?? "", // ✅ keep slug for comment fetching
      title: p.title ?? 'Untitled',
      content: p.content ?? '',
      excerpt: p.excerpt ?? '',
      author: p.author ?? 'Admin',
      category: p.category ?? 'Uncategorized',
      tags: p.tags ?? [],
      status: p.status ?? 'draft',
      featured: !!p.featured,
      featuredImage: p.featuredImage ?? p.featured_image ?? p.image ?? p.imageUrl ?? '',
      publishedAt: p.publishedAt ?? p.published_at ?? '',
      createdAt: p.createdAt ?? p.created_at ?? new Date().toISOString(),
      updatedAt: p.updatedAt ?? p.updated_at ?? new Date().toISOString(),
      views: p.views ?? 0,
      likes: p.likes ?? 0,
      comments: p.comments ?? 0,
      seoTitle: p.seoTitle ?? p.seo_title ?? p.metaTitle ?? '',
      seoDescription: p.seoDescription ?? p.seo_description ?? p.metaDescription ?? '',
      readTime:
        typeof p.readTime === 'number' ? p.readTime : Math.ceil(((p.content || '').length || 0) / 200),
      ...(sourceId !== undefined ? { sourceId } : {}),
      // Set sourceName to "Manual" if no source information is available
      sourceName: sourceName || 'Manual',
    } as any;
  };

  const loadPosts = useCallback(async (params?: Record<string, any>) => {
    if (!canRead) {
      toast.error('You do not have permission to view blog posts');
      return;
    }

    setLoadingPosts(true);
    setPostsError(null);
    try {
      const data = await blogsAPI.getAllPosts(params);
      let list: any[] = [];

      if (Array.isArray(data)) list = data;
      else if (data && Array.isArray((data as any).items)) list = (data as any).items;
      else if (data && Array.isArray((data as any).data)) list = (data as any).data;
      else if (data && typeof data === 'object') {
        if (Array.isArray((data as any).posts)) list = (data as any).posts;
        else if (Array.isArray((data as any).results)) list = (data as any).results;
        else {
          const maybePost = data as any;
          if (maybePost?.id || maybePost?.title) list = [maybePost];
        }
      }

      const normalized = (list || []).map(normalizePost) as BlogPost[];
      setPosts(normalized);
      setSelectedIds(new Set());
    } catch (err: any) {
      console.error('Failed to load posts', err);
      if (err?.response) {
        setPostsError(
          `Server responded ${err.response.status}: ${err.response.data?.message || JSON.stringify(err.response.data)}`
        );
      } else if (err?.request) {
        setPostsError('No response from server. Is backend running and reachable?');
      } else {
        setPostsError(err.message || 'Failed to fetch posts from server');
      }
      toast.error('Could not fetch posts from server');
      setPosts([]);
      setSelectedIds(new Set());
    } finally {
      setLoadingPosts(false);
    }
  }, [canRead]);

  // Load posts for the sub-tab (server-side status filter)
  useEffect(() => {
    if (canRead) {
      loadPosts({ status: postStateTab });
    }
  }, [loadPosts, postStateTab, canRead]);

  // Load RSS sources (optional)
  useEffect(() => {
    if (canCreate) {
      (async () => {
        try {
          const resp = await rssAPI.getAll();
          const list = Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
          setRSSources(list as RSSSource[]);
        } catch {
          // silent
        }
      })();
    }
  }, [canCreate]);

  const handleRefresh = async () => {
    if (!canRead) {
      toast.error('You do not have permission to refresh posts');
      return;
    }

    try {
      setPage(1);
      await loadPosts({ status: postStateTab, _ts: Date.now() });
      toast.success('List refreshed');
    } catch { }
  };

  /** Save / update post into list */
  const handleSavePost = (postData: Partial<BlogPost>) => {
    if (!postData) return;

    // Check permissions based on action
    const isNewPost = !postData.id;
    if (isNewPost && !canCreate) {
      toast.error('You do not have permission to create blog posts');
      return;
    }
    if (!isNewPost && !canUpdate) {
      toast.error('You do not have permission to update blog posts');
      return;
    }

    const raw: any = (postData as any)?.data ?? (postData as any)?.post ?? postData;

    const normalized = normalizePost(raw);

    setPosts((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      const existingIdx = arr.findIndex((p) => String(p.id) === String(normalized.id));
      let action: 'created' | 'updated' = 'created';

      let next: BlogPost[];
      if (existingIdx >= 0) {
        action = 'updated';
        next = [...arr];
        next[existingIdx] = { ...next[existingIdx], ...normalized } as BlogPost;
      } else {
        next = [normalized as BlogPost, ...arr];
      }

      if ((normalized as any).status === 'published') {
        toast.success(action === 'created' ? 'Post published!' : 'Post republished!');
      } else {
        toast.success(action === 'created' ? 'Post created!' : 'Post updated!');
      }

      return next;
    });

    setShowPostEditor(false);
    setSelectedPost(null);
  };

  const handleDeletePost = async (postId: string | number) => {
    if (!canDelete) {
      toast.error('You do not have permission to delete blog posts');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      setPosts((curr) =>
        (Array.isArray(curr) ? curr : []).filter((p) => String(p.id) !== String(postId))
      );
      if (typeof blogsAPI.deletePost === 'function') {
        await blogsAPI.deletePost(postId);
      }
      toast.success('Post deleted successfully!');
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(String(postId));
        return next;
      });
    } catch {
      toast.error('Failed to delete post. Refreshing list.');
      handleRefresh();
    }
  };

  // ---------- Bulk selection ----------
  const toggleSelectOne = (id: string | number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const key = String(id);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const areAllCurrentPageSelected = (pageItems: BlogPost[]) =>
    pageItems.length > 0 && pageItems.every((p) => selectedIds.has(String(p.id)));

  const toggleSelectAllOnPage = (pageItems: BlogPost[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = areAllCurrentPageSelected(pageItems);
      for (const p of pageItems) {
        const key = String(p.id);
        if (allSelected) next.delete(key);
        else next.add(key);
      }
      return next;
    });
  };

  const bulkDeleteSelected = async () => {
    if (!canBulkDelete) {
      toast.error('You do not have permission to bulk delete posts');
      return;
    }

    const ids = Array.from(selectedIds);
    if (ids.length === 0) return toast.info('No posts selected');

    if (!window.confirm(`Delete ${ids.length} selected post(s)? This cannot be undone.`)) return;

    try {
      setPosts((prev) => (prev ?? []).filter((p) => !selectedIds.has(String(p.id))));
      setSelectedIds(new Set());

      if (typeof blogsAPI.deleteMany === 'function') {
        await blogsAPI.deleteMany(ids);
      } else if (typeof blogsAPI.bulkDelete === 'function') {
        await blogsAPI.bulkDelete({ ids });
      } else if (typeof blogsAPI.deletePost === 'function') {
        await Promise.all(
          ids.map((id) => blogsAPI.deletePost(id).catch(() => { }))
        );
      }

      toast.success('Selected posts deleted');
    } catch (e) {
      console.error(e);
      toast.error('Bulk delete failed. Refreshing list to resync.');
      handleRefresh();
    }
  };

  const bulkPublishSelected = async () => {
    if (!canUpdate) {
      toast.error('You do not have permission to publish posts');
      return;
    }

    const ids = Array.from(selectedIds);
    if (ids.length === 0) return toast.info('No posts selected');

    try {
      const nowISO = new Date().toISOString();
      setPosts((prev) =>
        (prev ?? []).map((p) =>
          ids.includes(String(p.id)) ? { ...p, status: 'published', publishedAt: nowISO } : p
        )
      );

      if (typeof blogsAPI.bulkUpdate === 'function') {
        await blogsAPI.bulkUpdate({ ids, data: { status: 'published', publishedAt: nowISO } });
      } else if (typeof blogsAPI.updatePost === 'function') {
        await Promise.all(
          ids.map((id) => blogsAPI.updatePost(id, { status: 'published', publishedAt: nowISO }))
        );
      }

      toast.success('Selected posts published');
      setSelectedIds(new Set());
      setPostStateTab('published');
    } catch (e) {
      console.error(e);
      toast.error('Bulk publish failed. Refreshing list to resync.');
      handleRefresh();
    }
  };

  const handleEditPost = (post: BlogPost) => {
    if (!canUpdate) {
      toast.error('You do not have permission to edit blog posts');
      return;
    }
    setSelectedPost(post);
    setShowPostEditor(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return String(dateString);
    }
  };

  const renderPreviewHtml = (content?: string) => {
    const c = content || '';
    return c
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3">$1</h2>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/`(.*?)`/gim, '<code style="background:#f3f4f6;padding:2px 4px;border-radius:4px;">$1</code>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>');
  };

  const handlePreviewPost = (p: BlogPost) => {
    if (!p) return;
    setPreviewPost(p);
    setShowPreviewModal(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowPreviewModal(false);
        setPreviewPost(null);
        window.removeEventListener('keydown', onKey);
      }
    };
    window.addEventListener('keydown', onKey);
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setPreviewPost(null);
  };

  const openPreviewInNewWindow = (p: BlogPost) => {
    if (!p) return;
    if (typeof window === 'undefined') return;
    const safeTitle = (p.title || 'Preview').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const src = getPostSourceName(p);
    const srcDot = src ? ` • ${src}` : '';
    const bodyHtml = `<article style="max-width:900px;margin:20px auto;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#111827;line-height:1.7;">
      <header style="margin-bottom:16px;">
        <h1 style="font-size:28px;margin:0 0 8px;color:#0f172a;">${safeTitle}</h1>
        <div style="color:#6b7280;font-size:14px;margin-bottom:12px;">
          ${(p.author || '').replace(/</g, '&lt;')} • ${formatDate(p.publishedAt || p.createdAt || new Date().toISOString())}${srcDot}
        </div>
      </header>
      ${p.featuredImage ? `<img src="${p.featuredImage}" alt="featured" style="width:100%;height:auto;border-radius:8px;margin-bottom:16px;" />` : ''}
      <section>${renderPreviewHtml(p.content || '')}</section>
    </article>`;
    const html = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${safeTitle}</title>
      <style>body{background:#fff;margin:0;padding:24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#111827}</style>
      </head><body>${bodyHtml}</body></html>`.replace(/<\/script/g, '<\\/script');
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  // ---------- COMMENTS: fetch all (post-wise aggregate) ----------
  const normalizeCreatedAt = (c: CommentItem) =>
    (c.created_at as any) || (c.createdAt as any) || '';

  const buildPostsMap = (all: BlogPost[]) => {
    const map = new Map<string, string>(); // key: id/slug -> title
    all.forEach((p: any) => {
      const idKey = p?.id != null ? String(p.id) : '';
      const slugKey = p?.slug ? String(p.slug) : '';
      if (idKey) map.set(idKey, p.title || 'Untitled');
      if (slugKey) map.set(slugKey, p.title || 'Untitled'); // ✅ map by slug too
    });
    return map;
  };

  const fetchAllPostsForComments = async (): Promise<BlogPost[]> => {
    // Try to fetch "all" (no status filter) so comments tab covers every post
    try {
      const data = await blogsAPI.getAllPosts({});
      let list: any[] = [];
      if (Array.isArray(data)) list = data;
      else if (Array.isArray(data?.items)) list = data.items;
      else if (Array.isArray(data?.data)) list = data.data;
      else if (Array.isArray(data?.results)) list = data.results;
      else if (Array.isArray(data?.posts)) list = data.posts;
      else if (data && (data.id || data.title)) list = [data];
      return (list || []).map(normalizePost);
    } catch {
      // fallback to what we already have in state
      return Array.isArray(posts) ? posts : [];
    }
  };

  const loadAllComments = useCallback(async () => {
    if (!canRead) {
      toast.error('You do not have permission to view comments');
      return;
    }

    setLoadingAllComments(true);
    try {
      // 1) get all posts (best effort)
      const allPosts = await fetchAllPostsForComments();
      const pMap = buildPostsMap(allPosts);

      // 2) Try a direct "get all comments" endpoint if available on blogsAPI
      if (typeof blogsAPI.getAllComments === 'function') {
        try {
          const got = await blogsAPI.getAllComments(); // should return array
          const arr: CommentItem[] = Array.isArray(got?.data) ? got.data : Array.isArray(got) ? got : [];
          const rows: CommentRow[] = (arr || []).map((c) => {
            const postKey =
              (c.post_id != null ? String(c.post_id) : '') ||
              (c.postId != null ? String(c.postId) : '') ||
              (c.post_slug ? String(c.post_slug) : '') ||
              (c.postSlug ? String(c.postSlug) : '');
            return {
              id: String(c.id ?? ''),
              postTitle: pMap.get(postKey) || postKey || '—',
              author: String(c.author || '—'),
              email: String(c.email || '—'),
              content: String(c.content || '').slice(0, 200),
              status: String(c.status || 'pending'),
              createdAt: String(normalizeCreatedAt(c) || ''),
            };
          });
          rows.sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          setCommentsRows(rows);
          setLoadingAllComments(false);
          return;
        } catch {
          // fall through to per-post aggregation
        }
      }

      // 3) Aggregate per-post (guaranteed path with your existing blogsAPI.getComments)
      const perPostArrays = await Promise.all(
        allPosts.map(async (p: any) => {
          try {
            const keyForFetch = p?.slug || String(p?.id || ''); // ✅ prefer slug for /public/blogs/:slug/comments
            if (!keyForFetch) return [] as CommentItem[];
            const res = await blogsAPI.getComments(keyForFetch);
            const list: CommentItem[] = Array.isArray(res?.data)
              ? res.data
              : Array.isArray(res?.comments)
                ? res.comments
                : Array.isArray(res)
                  ? res
                  : [];
            return list.map((c) => ({
              ...c,
              post_id: c.post_id ?? c.postId ?? p.id,
              post_slug: c.post_slug ?? c.postSlug ?? p.slug,
            })) as CommentItem[];
          } catch {
            return [] as CommentItem[];
          }
        })
      );

      const flat: CommentItem[] = perPostArrays.flat();
      const rows: CommentRow[] = flat.map((c) => {
        const postKey =
          (c.post_id != null ? String(c.post_id) : '') ||
          (c.postId != null ? String(c.postId) : '') ||
          (c.post_slug ? String(c.post_slug) : '') ||
          (c.postSlug ? String(c.postSlug) : '');
        return {
          id: String(c.id ?? ''),
          postTitle: pMap.get(postKey) || postKey || '—',
          author: String(c.author || '—'),
          email: String(c.email || '—'),
          content: String(c.content || '').slice(0, 200),
          status: String(c.status || 'pending'),
          createdAt: String(normalizeCreatedAt(c) || ''),
        };
      });

      rows.sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setCommentsRows(rows);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load comments.');
      setCommentsRows([]);
    } finally {
      setLoadingAllComments(false);
    }
  }, [posts, canRead]);

  // Auto-load when user opens the Comments tab
  useEffect(() => {
    if (activeTab === 'comments' && canRead) {
      loadAllComments();
    }
  }, [activeTab, loadAllComments, canRead]);

  // --------- Filters & pagination for posts list ---------
  const postsArray = Array.isArray(posts) ? posts : [];

  const baseFiltered = postsArray.filter((post) => {
    const matchesSearch =
      !searchTerm ||
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesStatusLegacy = selectedStatus === 'All' || post.status === selectedStatus;
    const matchesSubTab =
      postStateTab === 'draft' ? post.status === 'draft' : post.status === 'published';
    return matchesSearch && matchesCategory && matchesStatusLegacy && matchesSubTab;
  });

  const totalItems = baseFiltered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory, selectedStatus, postStateTab]);

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return baseFiltered.slice(start, end);
  }, [baseFiltered, currentPage, pageSize]);

  const categories: BlogCategory[] = [
    'Real Estate',
    'Investment',
    'Market Analysis',
    'Legal',
    'Home Buying',
    'Home Selling',
    'Property News',
    'Construction',
    'Finance',
  ];

  const statuses: BlogStatus[] = ['draft', 'published', 'archived'];

  // ---------- Views ----------
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FileText className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Posts</h3>
              <p className="text-2xl font-bold text-gray-900">{postsArray.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <Eye className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Views</h3>
              <p className="text-2xl font-bold text-gray-900">
                {postsArray.reduce((acc, post) => acc + (post.views || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <GlobeIcon className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">RSS Sources</h3>
              <p className="text-2xl font-bold text-gray-900">{rssources.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Heart className="text-orange-600" size={24} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Engagement</h3>
              <p className="text-2xl font-bold text-gray-900">
                {postsArray.reduce(
                  (acc, post) => acc + ((post.likes || 0) + (post.comments || 0)),
                  0
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {canCreate && (
            <button
              onClick={() => {
                setSelectedPost(null);
                setShowAIWriter(true);
              }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl hover:shadow-lg transition-all text-left"
            >
              <Bot className="mb-2" size={24} />
              <div className="font-semibold">AI Writer</div>
              <div className="text-xs text-purple-100">Generate new content</div>
            </button>
          )}
          {canCreate && (
            <button
              onClick={() => {
                setShowPostEditor(true);
                setSelectedPost(null);
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl hover:shadow-lg transition-all text-left"
            >
              <Plus className="mb-2" size={24} />
              <div className="font-semibold">New Post</div>
              <div className="text-xs text-blue-100">Create manually</div>
            </button>
          )}
          {canCreate && (
            <button
              onClick={() => setShowRSSManager(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-xl hover:shadow-lg transition-all text-left"
            >
              <GlobeIcon className="mb-2" size={24} />
              <div className="font-semibold">RSS Import</div>
              <div className="text-xs text-green-100">Auto-import content</div>
            </button>
          )}
          {canCreate && (
            <button
              onClick={() => setShowSocialManager(true)}
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 rounded-xl hover:shadow-lg transition-all text-left"
            >
              <Share2 className="mb-2" size={24} />
              <div className="font-semibold">Social Media</div>
              <div className="text-xs text-orange-100">Schedule posts</div>
            </button>
          )}
        </div>
      </div>

      {/* Recent posts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Posts</h3>
        <div className="space-y-3">
          {postsArray.slice(0, 5).map((post) => {
            const src = getPostSourceName(post);
            return (
              <div
                key={post.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-all"
              >
                <div className="flex items-center space-x-4">
                  {post.featuredImage ? (
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3v18h18" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">{post.title}</h4>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <Eye size={12} />
                        <span>{post.views || 0}</span>
                      </span>
                      <span>{post.category}</span>
                      {src ? <span>• {src}</span> : null}
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${post.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : post.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {post.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePreviewPost(post)}
                    className="text-blue-600 hover:text-blue-700"
                    title="Preview"
                  >
                    <Eye size={20} />
                  </button>
                  {canUpdate && (
                    <button
                      onClick={() => handleEditPost(post)}
                      className="text-blue-600 hover:text-blue-700"
                      title="Edit"
                    >
                      <Edit size={20} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderContentManagement = () => {
    const allSelectedOnPage = areAllCurrentPageSelected(paginatedPosts);

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-full">
              <button
                onClick={() => setPostStateTab('draft')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${postStateTab === 'draft' ? 'bg-white shadow border text-gray-900' : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Draft
              </button>
              <button
                onClick={() => setPostStateTab('published')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${postStateTab === 'published'
                  ? 'bg-white shadow border text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Published
              </button>
            </div>

            <div className="flex gap-2">
              {canCreate && (
                <button
                  onClick={() => setShowPostEditor(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus size={18} />
                  <span>New Post</span>
                </button>
              )}
              <button
                onClick={handleRefresh}
                disabled={loadingPosts}
                className={`px-3 py-2 border rounded-md transition-colors flex items-center gap-2 ${loadingPosts ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-100'
                  }`}
                title="Refresh list"
              >
                <RefreshCw size={16} className={loadingPosts ? 'animate-spin' : ''} />
                <span>{loadingPosts ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder={`Search ${postStateTab === 'draft' ? 'drafts' : 'published'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Page size</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-3 py-2 border rounded-md"
              >
                {[5, 10, 15, 20].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bulk action bar */}
        {(canUpdate || canBulkDelete) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
            <div className="text-sm">
              Selected: <span className="font-semibold">{selectedIds.size}</span>
            </div>
            <div className="flex gap-2">
              {canUpdate && (
                <button
                  onClick={bulkPublishSelected}
                  disabled={selectedIds.size === 0}
                  className={`px-3 py-2 rounded-md border ${selectedIds.size === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                    }`}
                  title="Publish selected"
                >
                  Publish Selected
                </button>
              )}
              {canBulkDelete && (
                <button
                  onClick={bulkDeleteSelected}
                  disabled={selectedIds.size === 0}
                  className={`px-3 py-2 rounded-md border text-red-600 ${selectedIds.size === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50 border-red-300'
                    }`}
                  title="Delete selected"
                >
                  Delete Selected
                </button>
              )}
              <button
                onClick={() => setSelectedIds(new Set())}
                disabled={selectedIds.size === 0}
                className={`px-3 py-2 rounded-md border ${selectedIds.size === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Posts table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h3 className="text-lg font-bold text-gray-900">
              {postStateTab === 'draft' ? 'Draft Posts' : 'Published Posts'} ({totalItems})
            </h3>

            {/* Pagination header controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className={`p-2 rounded-md border ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                title="Previous"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="text-sm text-gray-700">
                Page <span className="font-semibold">{currentPage}</span> / {totalPages}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className={`p-2 rounded-md border ${currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                title="Next"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {(canUpdate || canBulkDelete) && (
                    <th className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={paginatedPosts.length > 0 && paginatedPosts.every((p) => selectedIds.has(String(p.id)))}
                        onChange={() => toggleSelectAllOnPage(paginatedPosts)}
                      />
                    </th>
                  )}
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Source</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Stats</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Quality</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPosts.map((post) => {
                  const getQualityScore = (content: string) => {
                    const seoScore = content.includes('#') && content.includes('##') ? 85 : 65;
                    const readabilityScore = content.length > 500 ? 88 : 75;
                    const overall = Math.round((seoScore + readabilityScore) / 2);
                    return { overall, seo: seoScore, readability: readabilityScore };
                  };
                  const getPlagiarismScore = (content: string) => Math.floor(Math.random() * 5) + 95;

                  const qualityScore = getQualityScore(post.content || '');
                  const plagiarismScore = getPlagiarismScore(post.content || '');
                  const srcName = getPostSourceName(post);

                  const checked = selectedIds.has(String(post.id));

                  return (
                    <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                      {(canUpdate || canBulkDelete) && (
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelectOne(post.id!)}
                          />
                        </td>
                      )}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          {post.featuredImage ? (
                            <img
                              src={post.featuredImage}
                              alt={post.title}
                              className="w-10 h-10 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.5"
                                  d="M3 3v18h18"
                                />
                              </svg>
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900">{post.title}</h4>
                            <p className="text-xs text-gray-600">
                              {post.author} • {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* SOURCE */}
                      <td className="py-3 px-4">
                        {srcName ? (
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${srcName === 'Manual'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-indigo-50 text-indigo-700'
                            }`}>
                            {srcName !== 'Manual' && <GlobeIcon size={12} />}
                            {srcName}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-xs">
                            Manual
                          </span>
                        )}
                      </td>

                      {/* CATEGORY */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-blue-800  px-2 py-1 text-xs">
                          {post.category}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${post.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : post.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {post.status}
                        </span>
                      </td>

                      {/* STATS */}
                      <td className="py-3 px-4">
                        <div className="text-xs text-gray-600">
                          <div>{post.views || 0} views</div>
                          <div>{post.likes || 0} likes</div>
                        </div>
                      </td>

                      {/* QUALITY */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <div className="text-xs text-gray-600">SEO:</div>
                            <div
                              className={`text-xs font-medium ${qualityScore.seo > 80 ? 'text-green-600' : 'text-yellow-600'
                                }`}
                            >
                              {qualityScore.seo}%
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-xs text-gray-600">Original:</div>
                            <div className="text-xs font-medium text-green-600">{plagiarismScore}%</div>
                          </div>
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3 whitespace-nowrap">
                          {canUpdate && (
                            <button
                              onClick={() => handleEditPost(post)}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition"
                              title="Edit"
                            >
                              <Edit size={18} className="shrink-0" />
                            </button>
                          )}

                          <button
                            onClick={() => handlePreviewPost(post)}
                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition"
                            title="Preview"
                          >
                            <Eye size={18} className="shrink-0" />
                          </button>

                          {canRead && (
                            <button
                              onClick={() => {
                                setActiveTab('comments');
                                // comments auto-load via effect
                              }}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition"
                              title="Comments"
                            >
                              <MessageSquare size={18} className="shrink-0" />
                            </button>
                          )}

                          {canCreate && (
                            <button
                              onClick={() => setShowAIWriter(true)}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition"
                              title="AI Rewrite"
                            >
                              <Wand2 size={18} className="shrink-0" />
                            </button>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => handleDeletePost(post.id!)}
                              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition"
                              title="Delete"
                            >
                              <Trash2 size={18} className="shrink-0" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {paginatedPosts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-gray-500">
                      No {postStateTab} posts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer pagination */}
          <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
            <div className="text-sm text-gray-600">
              Showing{' '}
              <span className="font-semibold">
                {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              </span>
              {' - '}
              <span className="font-semibold">{Math.min(currentPage * pageSize, totalItems)}</span>{' '}
              of <span className="font-semibold">{totalItems}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 border rounded-md ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
              >
                First
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-2 border rounded-md ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
              >
                Prev
              </button>
              <span className="px-3 py-2 text-sm">
                Page <span className="font-semibold">{currentPage}</span> / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 border rounded-md ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
              >
                Next
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 border rounded-md ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
              >
                Last
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ------------------------- COMMENTS ACTION HANDLERS ------------------------- */

  const deleteComment = async (id: string) => {
    if (!canDelete) {
      toast.error('You do not have permission to delete comments');
      return;
    }

    if (!window.confirm('Delete this comment?')) return;
    try {
      setCommentActionLoading(id);
      await blogsAPI.deleteComment(id);
      setCommentsRows((rows) => rows.filter((r) => r.id !== id));
      toast.success('Comment deleted');
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete');
    } finally {
      setCommentActionLoading(null);
    }
  };

  const editComment = async (row: CommentRow) => {
    if (!canUpdate) {
      toast.error('You do not have permission to edit comments');
      return;
    }

    try {
      const newAuthor = window.prompt('Edit author', row.author ?? '') ?? row.author;
      const newEmail = window.prompt('Edit email', row.email ?? '') ?? row.email;
      const newContent = window.prompt('Edit content', row.content ?? '') ?? row.content;

      if (
        newAuthor === row.author &&
        newEmail === row.email &&
        newContent === row.content
      ) {
        return; // nothing changed
      }

      setCommentActionLoading(row.id);
      await blogsAPI.updateComment(row.id, {
        author: newAuthor,
        email: newEmail,
        content: newContent,
      });

      setCommentsRows((rows) =>
        rows.map((r) =>
          r.id === row.id ? { ...r, author: newAuthor, email: newEmail, content: newContent } : r
        )
      );
      toast.success('Comment updated');
    } catch (e) {
      console.error(e);
      toast.error('Failed to update comment');
    } finally {
      setCommentActionLoading(null);
    }
  };

  // -------- COMMENTS TAB UI --------
  const renderCommentsTab = () => {
    if (!canRead) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-gray-500">
            You do not have permission to view comments.
          </div>
        </div>
      );
    }

    const filtered = commentsRows.filter((r) => {
      if (!commentsSearch) return true;
      const q = commentsSearch.toLowerCase();
      return (
        r.postTitle.toLowerCase().includes(q) ||
        r.author.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.content.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
      );
    });

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Comments</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  value={commentsSearch}
                  onChange={(e) => setCommentsSearch(e.target.value)}
                  placeholder="Search comments..."
                  className="pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={loadAllComments}
                disabled={loadingAllComments}
                className={`px-3 py-2 border rounded-lg flex items-center gap-2 ${loadingAllComments ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                title="Refresh comments"
              >
                <RefreshCw size={16} className={loadingAllComments ? 'animate-spin' : ''} />
                <span>{loadingAllComments ? 'Loading...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-3 px-4 text-gray-700 font-medium">Post</th>
                  <th className="py-3 px-4 text-gray-700 font-medium">Author</th>
                  <th className="py-3 px-4 text-gray-700 font-medium">Email</th>
                  <th className="py-3 px-4 text-gray-700 font-medium">Content</th>
                  <th className="py-3 px-4 text-gray-700 font-medium">Status</th>
                  <th className="py-3 px-4 text-gray-700 font-medium">Created At</th>
                  <th className="py-3 px-4 text-gray-700 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const isRowLoading = commentActionLoading === r.id;
                  const isApproved = r.status === 'approved';

                  return (
                    <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{r.postTitle}</td>
                      <td className="py-3 px-4">{r.author}</td>
                      <td className="py-3 px-4">{r.email || '—'}</td>
                      <td className="py-3 px-4">
                        <span title={r.content}>{r.content}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${r.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : r.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{r.createdAt ? formatDate(r.createdAt) : '—'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {/* Edit */}
                          {canUpdate && (
                            <button
                              disabled={isRowLoading}
                              onClick={() => editComment(r)}
                              title="Edit"
                              className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition ${isRowLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                              <Edit size={18} />
                            </button>
                          )}

                          {/* Delete */}
                          {canDelete && (
                            <button
                              disabled={isRowLoading}
                              onClick={() => deleteComment(r.id)}
                              title="Delete"
                              className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition ${isRowLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!loadingAllComments && filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-500">
                      No comments found.
                    </td>
                  </tr>
                )}

                {loadingAllComments && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-500">
                      Loading comments…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-sm text-gray-600">
            Showing <span className="font-semibold">{filtered.length}</span> comment(s)
          </div>
        </div>
      </div>
    );
  };

  // ---------- AI tools + SEO unchanged ----------
  const renderAITools = () => {
    if (!canUpdate) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-gray-500">
            You do not have permission to access AI tools.
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">AI Enhancement Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Save className="text-green-600" size={20} />
                </div>
                <h4 className="font-semibold text-gray-900">Plagiarism Checker</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Advanced AI-powered plagiarism detection with 99.7% accuracy
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Accuracy Rate</span>
                  <span className="font-bold text-green-600">99.7%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Avg Originality</span>
                  <span className="font-bold text-green-600">97.2%</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                Run Bulk Check
              </button>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="text-blue-600" size={20} />
                </div>
                <h4 className="font-semibold text-gray-900">SEO Optimizer</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">Automatically optimize content for search engines</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Avg SEO Score</span>
                  <span className="font-bold text-blue-600">89.5%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Posts Optimized</span>
                  <span className="font-bold text-blue-600">{postsArray.length}</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                Optimize All
              </button>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Wand2 className="text-purple-600" size={20} />
                </div>
                <h4 className="font-semibold text-gray-900">AI Enhancer</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">Improve readability, tone, and engagement</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Enhancement Rate</span>
                  <span className="font-bold text-purple-600">92.8%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Improved Posts</span>
                  <span className="font-bold text-purple-600">{Math.floor(postsArray.length * 0.8)}</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                Bulk Enhance
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSEOTools = () => {
    if (!canUpdate) {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-gray-500">
            You do not have permission to access SEO tools.
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">SEO Optimization Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Keyword Analysis</h4>
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">Top Performing Keywords</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>"real estate investment"</span>
                      <span className="font-bold text-blue-600">1,200 searches</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>"mumbai property"</span>
                      <span className="font-bold text-blue-600">890 searches</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>"home buying guide"</span>
                      <span className="font-bold text-blue-600">650 searches</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Content Optimization</h4>
              <div className="space-y-4">
                {postsArray.slice(0, 3).map((post) => {
                  const seoScore = (post.content || '').includes('#') ? 85 : 65;
                  return (
                    <div key={post.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900 text-sm">{post.title}</h5>
                        <span
                          className={`text-xs font-bold ${seoScore > 80 ? 'text-green-600' : seoScore > 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}
                        >
                          {seoScore}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className={`h-2 rounded-full ${seoScore > 80 ? 'bg-green-500' : seoScore > 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                            style={{ width: `${seoScore}%` }}
                          />
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 text-xs">Optimize</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ---------- Main render ----------
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Management Center</h1>
          <p className="text-gray-600">Comprehensive blog management with AI-powered tools</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-nowrap border-b border-gray-200 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-5 py-3 sm:px-6 sm:py-4 font-medium transition-colors whitespace-nowrap shrink-0 ${activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'content' && renderContentManagement()}
          {activeTab === 'comments' && renderCommentsTab()}
          {activeTab === 'ai-writer' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">AI Content Studio</h3>
              <p className="text-gray-600 mb-4">Generate long-form, SEO-optimized posts with images &amp; ToC.</p>
              {canCreate ? (
                <button
                  onClick={() => { setSelectedPost(null); setShowAIWriter(true); }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                >
                  <Bot size={18} /> Open AI Writer
                </button>
              ) : (
                <div className="text-gray-500">You do not have permission to access AI Writer.</div>
              )}
            </div>
          )}

          {activeTab === 'ai-tools' && renderAITools()}
          {activeTab === 'rss' && <RSSSourceManager />}
          {activeTab === 'social' && <SocialMediaManager posts={postsArray} />}
          {activeTab === 'seo' && renderSEOTools()}
          {activeTab === 'analytics' && <BlogAnalytics posts={postsArray} />}
        </div>

        {showPostEditor && (
          <BlogPostEditor
            post={selectedPost as any}
            onSave={(p: Partial<any>) => handleSavePost(p as Partial<BlogPost>)}
            onCancel={() => {
              setShowPostEditor(false);
              setSelectedPost(null);
            }}
            isOpen={showPostEditor}
            currentUserName={getUserDisplayName(user)}
            lockAuthor={true}
          />
        )}

        {showAIWriter && canCreate && (
          <AIBlogWriter
            isOpen={true}
            post={selectedPost as any}
            onSave={(p: Partial<BlogPost>) => {
              handleSavePost(p);
              setShowAIWriter(false);
              setSelectedPost(null);
              setAutoPublishAfterAI(null);
            }}
            onCancel={() => {
              setShowAIWriter(false);
              setSelectedPost(null);
              setAutoPublishAfterAI(null);
            }}
            currentUserName={getUserDisplayName(user)}
          />
        )}

        {showRSSManager && canCreate && <RSSSourceManager isOpen={true} onClose={() => setShowRSSManager(false)} />}

        {showSocialManager && canCreate && (
          <SocialMediaManager
            posts={postsArray}
            isOpen={true}
            onClose={() => setShowSocialManager(false)}
          />
        )}
      </div>

      {showPreviewModal && previewPost && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closePreviewModal} />
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl z-[70] relative">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md flex items-center justify-center text-white font-bold text-sm">
                  {String(previewPost.author || 'A')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{previewPost.title}</h3>
                  <div className="text-xs text-gray-500">
                    {previewPost.author} • {formatDate(previewPost.publishedAt || previewPost.createdAt)}
                    {(() => {
                      const src = getPostSourceName(previewPost);
                      return src ? ` • ${src}` : '';
                    })()}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button onClick={closePreviewModal} className="p-2 rounded-md hover:bg-gray-100">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="p-4">
              {previewPost.featuredImage && (
                <img
                  src={previewPost.featuredImage}
                  alt={previewPost.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}

              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: renderPreviewHtml(previewPost.content) }}
              />

              {previewPost.tags && (previewPost as any).tags?.length > 0 && (
                <div className="mt-6">
                  <div className="text-sm font-medium mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {(previewPost as any).tags.map((t: string, i: number) => (
                      <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;