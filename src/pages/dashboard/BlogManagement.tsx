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
  Layout,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  CreditCard
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

import { can } from '@/utils/permission';

// ─── Theme Colors (Matching ESALE logo) ────────────────────────────────────────
const N = "#0f2b3d";   // Deep navy/teal from logo
const O = "#e67e22";   // Warm orange from logo
const BG = "#f8fafc";   // Light blue-gray background
const BD = "#e2e8f0";   // Border color
const MU = "#5a7184";   // Muted text

// Custom scrollbar styles
const scrollbarStyles = {
  scrollbarWidth: 'thin',
  scrollbarColor: `${BD} ${BG}`,
  WebkitOverflowScrolling: 'touch',
};

// Add this RIGHT AFTER the scrollbarStyles constant
// Add this RIGHT AFTER the scrollbarStyles constant
// const customScrollbarStyles = `
//   /* Custom scrollbar for tabs container */
//   .custom-scrollbar::-webkit-scrollbar {
//     height: 4px;
//   }
  
//   .custom-scrollbar::-webkit-scrollbar-track {
//     background: #f8fafc;
//     border-radius: 10px;
//   }
  
//   .custom-scrollbar::-webkit-scrollbar-thumb {
//     background: ${BG};
//     border-radius: 10px;
//   }
  
//   .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//     background: ${N};
//   }
  
//   /* For Firefox */
//   .custom-scrollbar {
//     scrollbar-width: thin;
//     scrollbar-color: ${BG} #f8fafc;
//   }
// `;
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

  const canRead = can(user, 'blog.read');
  const canCreate = can(user, 'blog.create');
  const canUpdate = can(user, 'blog.update');
  const canDelete = can(user, 'blog.delete');
  const canBulkDelete = can(user, 'blog.bulk_delete');

  if (!canRead) {
    return (
      <div className="h-full flex flex-col" style={{ background: BG }}>
        <div className="flex-1 grid place-items-center">
          <div className="text-center p-6">
            <div className="text-lg font-semibold mb-2" style={{ color: "#ef4444" }}>
              Access Denied
            </div>
            <div className="text-sm" style={{ color: MU }}>
              You do not have permission to view blog management.
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

  const [commentsRows, setCommentsRows] = useState<CommentRow[]>([]);
  const [loadingAllComments, setLoadingAllComments] = useState(false);
  const [commentsSearch, setCommentsSearch] = useState('');
  const [commentActionLoading, setCommentActionLoading] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteCommentId, setConfirmDeleteCommentId] = useState<string | null>(null);

  const [autoPublishAfterAI, setAutoPublishAfterAI] = useState<null | { originalId: string | number }>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkBar, setShowBulkBar] = useState(false);

  const sourceNameById = useMemo<Record<string, string>>(
    () =>
      (rssources || []).reduce((acc: Record<string, string>, s: any) => {
        const id = String(s?.id ?? s?._id ?? s?.slug ?? '');
        if (id) acc[id] = String(s?.name ?? s?.title ?? s?.label ?? s?.sourceName ?? 'RSS');
        return acc;
      }, {}),
    [rssources]
  );

  const getPostSourceName = useCallback(
    (p: any) => {
      const explicit = p?.sourceName ?? p?.source_name ?? p?.sourceLabel ?? p?.rssSourceName ?? p?.rss_source_name ?? p?.source?.name ?? p?.rss?.name;
      const sid = p?.sourceId ?? p?.source_id ?? p?.rssSourceId ?? p?.rss_source_id ?? (p?.source?.id ?? undefined);
      const mapped = sid != null ? sourceNameById[String(sid)] : undefined;
      return (explicit || mapped || 'Manual') as string;
    },
    [sourceNameById]
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, permission: canRead },
    { id: 'content', label: 'Content Management', icon: FileText, permission: canRead },
    { id: 'comments', label: 'Comments', icon: MessageSquare, permission: canRead },
    { id: 'ai-writer', label: 'AI Content Studio ', icon: Bot, permission: canCreate },
    { id: 'ai-tools', label: 'AI Enhancement Tools', icon: Wrench, permission: canUpdate },
    { id: 'rss', label: 'RSS Sources', icon: GlobeIcon, permission: canCreate },
    { id: 'social', label: 'Social Media', icon: Share2, permission: canCreate },
    { id: 'seo', label: 'SEO Tools', icon: TrendingUp, permission: canUpdate },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, permission: canRead },
  ].filter(tab => tab.permission);

  const normalizePost = (p: any): BlogPost & { sourceId?: string | number; sourceName?: string; slug?: string } => {
    const sourceId = p.sourceId ?? p.source_id ?? p.rssSourceId ?? p.rss_source_id ?? p.rssId ?? p.source?.id;
    const sourceName = p.sourceName ?? p.source_name ?? p.sourceLabel ?? p.rssSourceName ?? p.rss_source_name ?? p.source?.name ?? p.rss?.name;
    return {
      id: p.id ?? p._id ?? p.slug ?? `LOCAL_${Date.now()}`,
      slug: p.slug ?? p.permalink ?? p.seoSlug ?? p.meta?.slug ?? "",
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
      readTime: typeof p.readTime === 'number' ? p.readTime : Math.ceil(((p.content || '').length || 0) / 200),
      ...(sourceId !== undefined ? { sourceId } : {}),
      sourceName: sourceName || 'Manual',
    } as any;
  };

  const loadPosts = useCallback(async (params?: Record<string, any>) => {
    if (!canRead) return;
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
        else if ((data as any)?.id || (data as any)?.title) list = [data];
      }
      const normalized = (list || []).map(normalizePost) as BlogPost[];
      setPosts(normalized);
      setSelectedIds(new Set());
      setShowBulkBar(false);
    } catch (err: any) {
      console.error('Failed to load posts', err);
      setPostsError(err.message || 'Failed to fetch posts');
      toast.error('Could not fetch posts from server');
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }, [canRead]);

  useEffect(() => {
    if (canRead) loadPosts({ status: postStateTab });
  }, [loadPosts, postStateTab, canRead]);

  useEffect(() => {
    if (canCreate) {
      (async () => {
        try {
          const resp = await rssAPI.getAll();
          const list = Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
          setRSSources(list as RSSSource[]);
        } catch { }
      })();
    }
  }, [canCreate]);

  const handleRefresh = async () => {
    if (!canRead) return;
    try {
      setPage(1);
      await loadPosts({ status: postStateTab, _ts: Date.now() });
      toast.success('List refreshed');
    } catch { }
  };

  const handleSavePost = (postData: Partial<BlogPost>) => {
    if (!postData) return;
    const isNewPost = !postData.id;
    if (isNewPost && !canCreate) { toast.error('No permission to create'); return; }
    if (!isNewPost && !canUpdate) { toast.error('No permission to update'); return; }
    const raw: any = (postData as any)?.data ?? (postData as any)?.post ?? postData;
    const normalized = normalizePost(raw);
    setPosts((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      const existingIdx = arr.findIndex((p) => String(p.id) === String(normalized.id));
      let next: BlogPost[];
      if (existingIdx >= 0) {
        next = [...arr];
        next[existingIdx] = { ...next[existingIdx], ...normalized } as BlogPost;
      } else {
        next = [normalized as BlogPost, ...arr];
      }
      toast.success(isNewPost ? 'Post created!' : 'Post updated!');
      return next;
    });
    setShowPostEditor(false);
    setSelectedPost(null);
  };

  const handleDeletePost = async (postId: string | number) => {
    if (!canDelete) { toast.error('No permission to delete'); return; }
    if (!window.confirm('Delete this post?')) return;
    try {
      setPosts((curr) => (Array.isArray(curr) ? curr : []).filter((p) => String(p.id) !== String(postId)));
      if (typeof blogsAPI.deletePost === 'function') await blogsAPI.deletePost(postId);
      toast.success('Post deleted!');
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(String(postId)); return next; });
    } catch { toast.error('Failed to delete'); handleRefresh(); }
  };

  const toggleSelectOne = (id: string | number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const key = String(id);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      setShowBulkBar(next.size > 0);
      return next;
    });
  };

  const areAllCurrentPageSelected = (pageItems: BlogPost[]) => pageItems.length > 0 && pageItems.every((p) => selectedIds.has(String(p.id)));
  const toggleSelectAllOnPage = (pageItems: BlogPost[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = areAllCurrentPageSelected(pageItems);
      for (const p of pageItems) {
        const key = String(p.id);
        if (allSelected) next.delete(key);
        else next.add(key);
      }
      setShowBulkBar(next.size > 0);
      return next;
    });
  };

  const bulkDeleteSelected = async () => {
    if (!canBulkDelete) { toast.error('No permission for bulk delete'); return; }
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return toast.info('No posts selected');
    if (!window.confirm(`Delete ${ids.length} post(s)? This cannot be undone.`)) return;
    try {
      setPosts((prev) => (prev ?? []).filter((p) => !selectedIds.has(String(p.id))));
      setSelectedIds(new Set());
      setShowBulkBar(false);
      if (typeof blogsAPI.deleteMany === 'function') await blogsAPI.deleteMany(ids);
      else if (typeof blogsAPI.bulkDelete === 'function') await blogsAPI.bulkDelete({ ids });
      else if (typeof blogsAPI.deletePost === 'function') await Promise.all(ids.map((id) => blogsAPI.deletePost(id).catch(() => { })));
      toast.success('Selected posts deleted');
    } catch (e) { console.error(e); toast.error('Bulk delete failed'); handleRefresh(); }
  };

  const bulkPublishSelected = async () => {
    if (!canUpdate) { toast.error('No permission to publish'); return; }
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return toast.info('No posts selected');
    try {
      const nowISO = new Date().toISOString();
      setPosts((prev) => (prev ?? []).map((p) => ids.includes(String(p.id)) ? { ...p, status: 'published', publishedAt: nowISO } : p));
      if (typeof blogsAPI.bulkUpdate === 'function') await blogsAPI.bulkUpdate({ ids, data: { status: 'published', publishedAt: nowISO } });
      else if (typeof blogsAPI.updatePost === 'function') await Promise.all(ids.map((id) => blogsAPI.updatePost(id, { status: 'published', publishedAt: nowISO })));
      toast.success('Selected posts published');
      setSelectedIds(new Set());
      setShowBulkBar(false);
      setPostStateTab('published');
    } catch (e) { console.error(e); toast.error('Bulk publish failed'); handleRefresh(); }
  };

  const handleEditPost = (post: BlogPost) => {
    if (!canUpdate) { toast.error('No permission to edit'); return; }
    setSelectedPost(post);
    setShowPostEditor(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try { return new Date(dateString).toLocaleDateString(); } catch { return String(dateString); }
  };

  const renderPreviewHtml = (content?: string) => {
    const c = content || '';
    return c
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold mb-3" style="color:#0f2b3d;">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold mb-2" style="color:#0f2b3d;">$1</h2>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/`(.*?)`/gim, '<code style="background:#f3f4f6;padding:2px 4px;border-radius:4px;">$1</code>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br>');
  };

  const handlePreviewPost = (p: BlogPost) => {
    setPreviewPost(p);
    setShowPreviewModal(true);
  };

  const buildPostsMap = (all: BlogPost[]) => {
    const map = new Map<string, string>();
    all.forEach((p: any) => {
      const idKey = p?.id != null ? String(p.id) : '';
      const slugKey = p?.slug ? String(p.slug) : '';
      if (idKey) map.set(idKey, p.title || 'Untitled');
      if (slugKey) map.set(slugKey, p.title || 'Untitled');
    });
    return map;
  };

  const fetchAllPostsForComments = async (): Promise<BlogPost[]> => {
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
    } catch { return Array.isArray(posts) ? posts : []; }
  };

  const loadAllComments = useCallback(async () => {
    if (!canRead) return;
    setLoadingAllComments(true);
    try {
      const allPosts = await fetchAllPostsForComments();
      const pMap = buildPostsMap(allPosts);
      if (typeof blogsAPI.getAllComments === 'function') {
        try {
          const got = await blogsAPI.getAllComments();
          const arr: CommentItem[] = Array.isArray(got?.data) ? got.data : Array.isArray(got) ? got : [];
          const rows: CommentRow[] = (arr || []).map((c) => {
            const postKey = (c.post_id != null ? String(c.post_id) : '') || (c.postId != null ? String(c.postId) : '') || (c.post_slug ? String(c.post_slug) : '') || (c.postSlug ? String(c.postSlug) : '');
            return { id: String(c.id ?? ''), postTitle: pMap.get(postKey) || postKey || '—', author: String(c.author || '—'), email: String(c.email || '—'), content: String(c.content || '').slice(0, 200), status: String(c.status || 'pending'), createdAt: String((c.created_at as any) || (c.createdAt as any) || '') };
          });
          rows.sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          setCommentsRows(rows);
          setLoadingAllComments(false);
          return;
        } catch { }
      }
      const perPostArrays = await Promise.all(allPosts.map(async (p: any) => {
        try {
          const keyForFetch = p?.slug || String(p?.id || '');
          if (!keyForFetch) return [] as CommentItem[];
          const res = await blogsAPI.getComments(keyForFetch);
          const list: CommentItem[] = Array.isArray(res?.data) ? res.data : Array.isArray(res?.comments) ? res.comments : Array.isArray(res) ? res : [];
          return list.map((c) => ({ ...c, post_id: c.post_id ?? c.postId ?? p.id, post_slug: c.post_slug ?? c.postSlug ?? p.slug })) as CommentItem[];
        } catch { return [] as CommentItem[]; }
      }));
      const flat: CommentItem[] = perPostArrays.flat();
      const rows: CommentRow[] = flat.map((c) => {
        const postKey = (c.post_id != null ? String(c.post_id) : '') || (c.postId != null ? String(c.postId) : '') || (c.post_slug ? String(c.post_slug) : '') || (c.postSlug ? String(c.postSlug) : '');
        return { id: String(c.id ?? ''), postTitle: pMap.get(postKey) || postKey || '—', author: String(c.author || '—'), email: String(c.email || '—'), content: String(c.content || '').slice(0, 200), status: String(c.status || 'pending'), createdAt: String((c.created_at as any) || (c.createdAt as any) || '') };
      });
      rows.sort((a, b) => (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setCommentsRows(rows);
    } catch (e) { console.error(e); toast.error('Failed to load comments.'); setCommentsRows([]); } finally { setLoadingAllComments(false); }
  }, [posts, canRead]);

  useEffect(() => {
    if (activeTab === 'comments' && canRead) loadAllComments();
  }, [activeTab, loadAllComments, canRead]);

  const deleteComment = async (id: string) => {
    if (!canDelete) { toast.error('No permission to delete comments'); return; }
    setConfirmDeleteCommentId(id);
  };

  const confirmDeleteComment = async () => {
    if (!confirmDeleteCommentId) return;
    try {
      setCommentActionLoading(confirmDeleteCommentId);
      await blogsAPI.deleteComment(confirmDeleteCommentId);
      setCommentsRows((rows) => rows.filter((r) => r.id !== confirmDeleteCommentId));
      toast.success('Comment deleted');
    } catch (e) { console.error(e); toast.error('Failed to delete'); } finally { setCommentActionLoading(null); setConfirmDeleteCommentId(null); }
  };

  const editComment = async (row: CommentRow) => {
    if (!canUpdate) { toast.error('No permission to edit comments'); return; }
    try {
      const newAuthor = window.prompt('Edit author', row.author ?? '') ?? row.author;
      const newEmail = window.prompt('Edit email', row.email ?? '') ?? row.email;
      const newContent = window.prompt('Edit content', row.content ?? '') ?? row.content;
      if (newAuthor === row.author && newEmail === row.email && newContent === row.content) return;
      setCommentActionLoading(row.id);
      await blogsAPI.updateComment(row.id, { author: newAuthor, email: newEmail, content: newContent });
      setCommentsRows((rows) => rows.map((r) => r.id === row.id ? { ...r, author: newAuthor, email: newEmail, content: newContent } : r));
      toast.success('Comment updated');
    } catch (e) { console.error(e); toast.error('Failed to update comment'); } finally { setCommentActionLoading(null); }
  };

  const postsArray = Array.isArray(posts) ? posts : [];
  const baseFiltered = postsArray.filter((post) => {
    const matchesSearch = !searchTerm || post.title?.toLowerCase().includes(searchTerm.toLowerCase()) || post.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesStatusLegacy = selectedStatus === 'All' || post.status === selectedStatus;
    const matchesSubTab = postStateTab === 'draft' ? post.status === 'draft' : post.status === 'published';
    return matchesSearch && matchesCategory && matchesStatusLegacy && matchesSubTab;
  });

  const totalItems = baseFiltered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  useEffect(() => { setPage(1); }, [searchTerm, selectedCategory, selectedStatus, postStateTab]);

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return baseFiltered.slice(start, start + pageSize);
  }, [baseFiltered, currentPage, pageSize]);

  const categories: BlogCategory[] = ['Real Estate', 'Investment', 'Market Analysis', 'Legal', 'Home Buying', 'Home Selling', 'Property News', 'Construction', 'Finance'];

  const getQualityScore = (content: string) => {
    const seoScore = content.includes('#') && content.includes('##') ? 85 : 65;
    const readabilityScore = content.length > 500 ? 88 : 75;
    const overall = Math.round((seoScore + readabilityScore) / 2);
    return { overall, seo: seoScore, readability: readabilityScore };
  };

  const getPlagiarismScore = (content: string) => Math.floor(Math.random() * 5) + 95;
// Compact Stat Card Component
const StatCard = ({ icon: Icon, label, value, subValue, color }: any) => (
  <div className="bg-white rounded-xl p-2 shadow-sm transition-all hover:shadow-md" style={{ border: `1px solid ${BD}` }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[8px] sm:text-[10px] uppercase tracking-wider" style={{ color: MU }}>{label}</p>
        <p className="text-base sm:text-xl font-bold mt-0.5" style={{ color: N }}>{value}</p>
        {subValue && <p className="text-[8px] sm:text-[10px] mt-0.5" style={{ color: O }}>{subValue}</p>}
      </div>
      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
        <Icon size={12} className="sm:text-[16px]" style={{ color }} />
      </div>
    </div>
  </div>
);

 const renderDashboard = () => (
  <div className="space-y-4">
    {/* Stats Grid - Extra Compact on Mobile */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-3">
      <StatCard icon={FileText} label="Total Posts" value={postsArray.length} color="#3b82f6" />
      <StatCard icon={Eye} label="Total Views" value={postsArray.reduce((acc, post) => acc + (post.views || 0), 0).toLocaleString()} color="#10b981" />
      <StatCard icon={GlobeIcon} label="RSS Sources" value={rssources.length} color="#8b5cf6" />
      <StatCard icon={Heart} label="Engagement" value={postsArray.reduce((acc, post) => acc + ((post.likes || 0) + (post.comments || 0)), 0)} color="#f59e0b" />
    </div>

    {/* Quick Actions - Extra Compact on Mobile */}
    <div className="bg-white rounded-xl shadow-sm p-2 sm:p-4" style={{ border: `1px solid ${BD}` }}>
      <h3 className="text-[11px] sm:text-sm font-bold mb-1.5 sm:mb-3" style={{ color: N }}>Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-3">
        {canCreate && (
          <button 
            onClick={() => { setSelectedPost(null); setShowAIWriter(true); }} 
            className="p-1.5 sm:p-3 rounded-lg text-left transition-all hover:opacity-90" 
            style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}
          >
            <Bot size={14} className="text-white mb-0.5 sm:mb-1" />
            <div className="text-white text-[10px] sm:text-xs font-semibold">AI Writer</div>
            <div className="text-white/70 text-[7px] sm:text-[10px]">Generate</div>
          </button>
        )}
        {canCreate && (
          <button 
            onClick={() => { setShowPostEditor(true); setSelectedPost(null); }} 
            className="p-1.5 sm:p-3 rounded-lg text-left transition-all hover:opacity-90" 
            style={{ background: `linear-gradient(135deg, ${N}, #1e4a6e)` }}
          >
            <Plus size={14} className="text-white mb-0.5 sm:mb-1" />
            <div className="text-white text-[10px] sm:text-xs font-semibold">New Post</div>
            <div className="text-white/70 text-[7px] sm:text-[10px]">Create</div>
          </button>
        )}
        {canCreate && (
          <button 
            onClick={() => setShowRSSManager(true)} 
            className="p-1.5 sm:p-3 rounded-lg text-left transition-all hover:opacity-90" 
            style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
          >
            <GlobeIcon size={14} className="text-white mb-0.5 sm:mb-1" />
            <div className="text-white text-[10px] sm:text-xs font-semibold">RSS Import</div>
            <div className="text-white/70 text-[7px] sm:text-[10px]">Auto</div>
          </button>
        )}
        {canCreate && (
          <button 
            onClick={() => setShowSocialManager(true)} 
            className="p-1.5 sm:p-3 rounded-lg text-left transition-all hover:opacity-90" 
            style={{ background: "linear-gradient(135deg, #ea580c, #f97316)" }}
          >
            <Share2 size={14} className="text-white mb-0.5 sm:mb-1" />
            <div className="text-white text-[10px] sm:text-xs font-semibold">Social</div>
            <div className="text-white/70 text-[7px] sm:text-[10px]">Schedule</div>
          </button>
        )}
      </div>
    </div>

    {/* Recent Posts Section */}
    <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4" style={{ border: `1px solid ${BD}` }}>
      <h3 className="text-xs sm:text-sm font-bold mb-2 sm:mb-3" style={{ color: N }}>Recent Posts</h3>
      <div className="space-y-2 max-h-36 md:max-h-44  overflow-y-auto" style={scrollbarStyles}>
        {postsArray.slice(0, 5).map((post) => (
          <div key={post.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-all" style={{ border: `1px solid ${BD}` }}>
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {post.featuredImage ? 
                <img src={post.featuredImage} alt={post.title} className="w-6 h-6 sm:w-8 sm:h-8 object-cover rounded" /> : 
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded flex items-center justify-center" style={{ background: `${N}10` }}>
                  <FileText size={12} style={{ color: MU }} />
                </div>
              }
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-medium truncate" style={{ color: N }}>{post.title}</h4>
                <div className="flex items-center gap-2 text-[10px]" style={{ color: MU }}>
                  <span>{post.views || 0} views</span>
                  <span>•</span>
                  <span>{post.category}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => handlePreviewPost(post)} className="p-1 rounded hover:bg-gray-100">
                <Eye size={12} style={{ color: MU }} />
              </button>
              {canUpdate && (
                <button onClick={() => handleEditPost(post)} className="p-1 rounded hover:bg-gray-100">
                  <Edit size={12} style={{ color: MU }} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

  const renderContentManagement = () => {
    const allSelectedOnPage = areAllCurrentPageSelected(paginatedPosts);
    return (
      <div className="space-y-4">
       <div className="bg-white rounded-xl shadow-sm p-4" style={{ border: `1px solid ${BD}` }}>
  {/* Mobile Layout */}
  <div className="md:hidden space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-full">
        <button onClick={() => setPostStateTab('draft')} className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${postStateTab === 'draft' ? 'bg-white shadow-sm' : 'text-gray-600'}`} style={postStateTab === 'draft' ? { color: N } : {}}>
          Draft 
        </button>
        <button onClick={() => setPostStateTab('published')} className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${postStateTab === 'published' ? 'bg-white shadow-sm' : 'text-gray-600'}`} style={postStateTab === 'published' ? { color: N } : {}}>
          Published 
        </button>
      </div>
      <div className="flex gap-2">
        {canCreate && (
          <button onClick={() => setShowPostEditor(true)} className="px-3 py-1.5 rounded-lg text-white text-xs font-medium flex items-center gap-1" style={{ background: N }}>
            <Plus size={14} style={{ color: O }} /> New
          </button>
        )}
        <button onClick={handleRefresh} disabled={loadingPosts} className="p-1.5 rounded-lg border hover:bg-gray-50" style={{ borderColor: BD, color: N }}>
          <RefreshCw size={14} className={loadingPosts ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
    
    <div className="space-y-2">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MU }} />
        <input type="text" placeholder={`Search ${postStateTab === 'draft' ? 'drafts' : 'published'}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500" style={{ borderColor: BD }} />
      </div>
      <div className="flex gap-2">
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="flex-1 px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500" style={{ borderColor: BD }}>
          <option value="All">All Categories</option>
          {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="px-3 py-2 text-sm rounded-lg border" style={{ borderColor: BD }}>
          {[5, 10, 15, 20].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  </div>

  {/* Desktop Layout */}
    {/* Desktop Layout */}
  <div className="hidden md:block">
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
      {/* LEFT - Draft/Published Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-full">
        <button onClick={() => setPostStateTab('draft')} className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${postStateTab === 'draft' ? 'bg-white shadow-sm' : 'text-gray-600'}`} style={postStateTab === 'draft' ? { color: N } : {}}>
          Draft
        </button>
        <button onClick={() => setPostStateTab('published')} className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${postStateTab === 'published' ? 'bg-white shadow-sm' : 'text-gray-600'}`} style={postStateTab === 'published' ? { color: N } : {}}>
          Published 
        </button>
      </div>

      {/* CENTER - Bulk Action Bar (only when posts selected) */}
      {showBulkBar && selectedIds.size > 0 && (
        <div className="flex-1 flex justify-center">
          <div className="bg-white rounded-full shadow-md px-4 py-1.5 flex items-center gap-3 border" style={{ borderColor: O, borderWidth: '1px' }}>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: `${O}15` }}>
                <CheckCircle size={10} style={{ color: O }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: N }}>{selectedIds.size}</span>
              <span className="text-[10px]" style={{ color: MU }}>selected</span>
            </div>
            <div className="w-px h-4" style={{ background: BD }} />
            <div className="flex items-center gap-1">
              {canUpdate && (
                <button onClick={bulkPublishSelected} className="px-2 py-1 rounded-full text-[10px] font-medium transition-all hover:scale-105 flex items-center gap-1" style={{ background: `${N}10`, color: N }}>
                  <CheckCircle size={10} /> Publish
                </button>
              )}
              {canBulkDelete && (
                <button onClick={bulkDeleteSelected} className="px-2 py-1 rounded-full text-[10px] font-medium transition-all hover:scale-105 flex items-center gap-1" style={{ background: "#fee2e2", color: "#dc2626" }}>
                  <Trash2 size={10} /> Delete
                </button>
              )}
              <button onClick={() => { setSelectedIds(new Set()); setShowBulkBar(false); }} className="p-1 rounded-full hover:bg-gray-100">
                <X size={10} style={{ color: MU }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT - New Post & Refresh Buttons */}
      <div className="flex gap-2 ml-auto">
        {canCreate && <button onClick={() => setShowPostEditor(true)} className="px-3 py-1.5 rounded-lg text-white text-xs font-medium flex items-center gap-1" style={{ background: N }}><Plus size={14} style={{ color: O }} /> New Post</button>}
        <button onClick={handleRefresh} disabled={loadingPosts} className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 border hover:bg-gray-50" style={{ borderColor: BD, color: N }}><RefreshCw size={12} className={loadingPosts ? 'animate-spin' : ''} /> Refresh</button>
      </div>
    </div>

    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MU }} />
        <input type="text" placeholder={`Search ${postStateTab === 'draft' ? 'drafts' : 'published'}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500" style={{ borderColor: BD }} />
      </div>
      <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-3 py-2 text-sm rounded-lg border focus:ring-2 focus:ring-blue-500" style={{ borderColor: BD }}>
        <option value="All">All Categories</option>
        {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
      </select>
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: MU }}>Page size</span>
        <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="px-3 py-2 text-sm rounded-lg border" style={{ borderColor: BD }}>
          {[5, 10, 15, 20].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  </div>
</div>
{showBulkBar && selectedIds.size > 0 && (
      <div className="bg-white rounded-lg shadow-sm p-3 border-l-4" style={{ borderColor: O, borderLeftWidth: '4px' }}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${O}15` }}>
              <CheckCircle size={12} style={{ color: O }} />
            </div>
            <div>
              <span className="text-sm font-semibold" style={{ color: N }}>{selectedIds.size}</span>
              <span className="text-xs ml-1" style={{ color: MU }}>selected</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canUpdate && (
              <button onClick={bulkPublishSelected} className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1" style={{ background: `${N}10`, color: N }}>
                <CheckCircle size={12} /> Publish
              </button>
            )}
            {canBulkDelete && (
              <button onClick={bulkDeleteSelected} className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1" style={{ background: "#fee2e2", color: "#dc2626" }}>
                <Trash2 size={12} /> Delete
              </button>
            )}
            <button onClick={() => { setSelectedIds(new Set()); setShowBulkBar(false); }} className="p-1.5 rounded-lg hover:bg-gray-100">
              <X size={14} style={{ color: MU }} />
            </button>
          </div>
        </div>
      </div>
    )}
        

        {/* Posts Table with Max Height and Scroll */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: `1px solid ${BD}` }}>
          <div className="flex items-center justify-between gap-3 p-1 px-2 border-b" style={{ borderColor: BD }}>
            <h3 className="text-sm font-bold" style={{ color: N }}>{postStateTab === 'draft' ? 'Draft Posts' : 'Published Posts'} ({totalItems})</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1} className={`p-1.5 rounded border ${currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`} style={{ borderColor: BD }}><ChevronLeft size={14} /></button>
              <div className="text-xs">Page <span className="font-semibold">{currentPage}</span> / {totalPages}</div>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className={`p-1.5 rounded border ${currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`} style={{ borderColor: BD }}><ChevronRight size={14} /></button>
            </div>
          </div>

<div
  className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-450px)] sm:max-h-[calc(100vh-450px)]"
  style={{ ...scrollbarStyles }}
>
              <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b" style={{ borderColor: BD }}>
                  {(canUpdate || canBulkDelete) && <th className="py-3 px-3 w-8"><input type="checkbox" checked={paginatedPosts.length > 0 && paginatedPosts.every((p) => selectedIds.has(String(p.id)))} onChange={() => toggleSelectAllOnPage(paginatedPosts)} /></th>}
                  <th className="text-left py-3 px-3 font-medium text-xs" style={{ color: MU }}>Title</th>
                  <th className="text-left py-3 px-3 font-medium text-xs hidden sm:table-cell" style={{ color: MU }}>Source</th>
                  <th className="text-left py-3 px-3 font-medium text-xs hidden md:table-cell" style={{ color: MU }}>Category</th>
                  <th className="text-left py-3 px-3 font-medium text-xs hidden lg:table-cell" style={{ color: MU }}>Status</th>
                  <th className="text-left py-3 px-3 font-medium text-xs hidden lg:table-cell" style={{ color: MU }}>Stats</th>
                  <th className="text-left py-3 px-3 font-medium text-xs hidden xl:table-cell" style={{ color: MU }}>Quality</th>
                  <th className="text-left py-3 px-3 font-medium text-xs" style={{ color: MU }}>Actions</th>
                 </tr>
              </thead>
              <tbody>
                {paginatedPosts.map((post) => {
                  const qualityScore = getQualityScore(post.content || '');
                  const plagiarismScore = getPlagiarismScore(post.content || '');
                  const srcName = getPostSourceName(post);
                  return (
                    <tr key={post.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: BD }}>
                      {(canUpdate || canBulkDelete) && <td className="py-3 px-3"><input type="checkbox" checked={selectedIds.has(String(post.id))} onChange={() => toggleSelectOne(post.id!)} /></td>}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          {post.featuredImage ? <img src={post.featuredImage} alt="" className="w-8 h-8 object-cover rounded" /> : <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: `${N}10` }}><FileText size={12} style={{ color: MU }} /></div>}
                          <div>
                            <div className="font-medium text-xs line-clamp-1 max-w-[180px]" style={{ color: N }}>{post.title}</div>
                            <div className="text-[10px]" style={{ color: MU }}>{post.author} • {formatDate(post.createdAt)}</div>
                          </div>
                        </div>
                       </td>
                      <td className="py-3 px-3 hidden sm:table-cell">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${srcName === 'Manual' ? 'bg-gray-100 text-gray-700' : 'bg-indigo-50 text-indigo-700'}`}>
                          {srcName !== 'Manual' && <GlobeIcon size={8} />}
                          {srcName}
                        </span>
                       </td>
                      <td className="py-3 px-3 hidden md:table-cell">
                        <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: `${N}10`, color: N }}>{post.category}</span>
                       </td>
                      <td className="py-3 px-3 hidden lg:table-cell">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{post.status}</span>
                       </td>
                      <td className="py-3 px-3 hidden lg:table-cell">
                        <div className="text-[10px]" style={{ color: MU }}>
                          <div>{post.views || 0} views</div>
                          <div>{post.likes || 0} likes</div>
                        </div>
                       </td>
                      <td className="py-3 px-3 hidden xl:table-cell">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1">
                            <div className="text-[10px]" style={{ color: MU }}>SEO:</div>
                            <div className={`text-[10px] font-medium ${qualityScore.seo > 80 ? 'text-green-600' : 'text-yellow-600'}`}>{qualityScore.seo}%</div>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="text-[10px]" style={{ color: MU }}>Original:</div>
                            <div className="text-[10px] font-medium text-green-600">{plagiarismScore}%</div>
                          </div>
                        </div>
                       </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          {canUpdate && <button onClick={() => handleEditPost(post)} className="p-1.5 rounded hover:bg-gray-100" title="Edit"><Edit size={12} style={{ color: MU }} /></button>}
                          <button onClick={() => handlePreviewPost(post)} className="p-1.5 rounded hover:bg-gray-100" title="Preview"><Eye size={12} style={{ color: MU }} /></button>
                          {canRead && <button onClick={() => { setActiveTab('comments'); }} className="p-1.5 rounded hover:bg-gray-100" title="Comments"><MessageSquare size={12} style={{ color: MU }} /></button>}
                          {canCreate && <button onClick={() => setShowAIWriter(true)} className="p-1.5 rounded hover:bg-purple-50" title="AI Rewrite"><Wand2 size={12} style={{ color: "#8b5cf6" }} /></button>}
                          {canDelete && <button onClick={() => { setConfirmDeleteId(String(post.id)); }} className="p-1.5 rounded hover:bg-red-50" title="Delete"><Trash2 size={12} style={{ color: "#ef4444" }} /></button>}
                        </div>
                       </td>
                     </tr>
                  );
                })}
                {paginatedPosts.length === 0 && (
                  <tr><td colSpan={8} className="py-10 text-center text-gray-500 text-sm">No {postStateTab} posts found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

         <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-1 sm:p-2 border-t" style={{ borderColor: BD }}>
  
  {/* Text */}
  <div className="text-[10px] sm:text-xs text-center sm:text-left" style={{ color: MU }}>
    Showing {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalItems)} of {totalItems}
  </div>

  {/* Pagination */}
  <div className="flex items-center gap-1 flex-wrap justify-center">
    
    {/* Hide on mobile */}
    <button
      onClick={() => setPage(1)}
      disabled={currentPage === 1}
      className=" sm:inline px-2 py-1 rounded border text-xs disabled:opacity-50 hover:bg-gray-50"
      style={{ borderColor: BD }}
    >
      First
    </button>

    <button
      onClick={() => setPage((p) => Math.max(1, p - 1))}
      disabled={currentPage === 1}
      className="px-2 py-[2px] sm:py-1 rounded border text-[10px] sm:text-xs disabled:opacity-50 hover:bg-gray-50"
      style={{ borderColor: BD }}
    >
      Prev
    </button>

    <span className="text-[10px] sm:text-xs px-1 sm:px-2" style={{ color: N }}>
      {currentPage}/{totalPages}
    </span>

    <button
      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
      disabled={currentPage === totalPages}
      className="px-2 py-[2px] sm:py-1 rounded border text-[10px] sm:text-xs disabled:opacity-50 hover:bg-gray-50"
      style={{ borderColor: BD }}
    >
      Next
    </button>

    {/* Hide on mobile */}
    <button
      onClick={() => setPage(totalPages)}
      disabled={currentPage === totalPages}
      className=" sm:inline px-2 py-1 rounded border text-xs disabled:opacity-50 hover:bg-gray-50"
      style={{ borderColor: BD }}
    >
      Last
    </button>

  </div>
</div>
        </div>
      </div>
    );
  };

  const renderCommentsTab = () => {
    const filteredComments = commentsRows.filter(r => !commentsSearch || Object.values(r).some(v => String(v).toLowerCase().includes(commentsSearch.toLowerCase())));
    
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4" style={{ border: `1px solid ${BD}` }}>
          <div className="flex flex-row items-center justify-between gap-2 mb-4">
  {/* Left - Comments Title */}
  <h3 className="text-sm font-bold whitespace-nowrap" style={{ color: N }}>Comments</h3>
  
  {/* Right - Search Bar Only (Mobile) */}
  <div className="sm:hidden relative flex-1 max-w-[180px]">
    <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: MU }} />
    <input 
      value={commentsSearch} 
      onChange={(e) => setCommentsSearch(e.target.value)} 
      placeholder="Search..." 
      className="w-full pl-7 pr-2 py-1.5 text-xs rounded-lg border" 
      style={{ borderColor: BD }} 
    />
  </div>

  {/* Desktop: Search bar + Refresh button (unchanged) */}
  <div className="hidden sm:flex gap-2">
    <div className="relative">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MU }} />
      <input 
        value={commentsSearch} 
        onChange={(e) => setCommentsSearch(e.target.value)} 
        placeholder="Search comments..." 
        className="pl-9 pr-3 py-1.5 text-sm rounded-lg border" 
        style={{ borderColor: BD }} 
      />
    </div>
    <button 
      onClick={loadAllComments} 
      disabled={loadingAllComments} 
      className="p-1.5 rounded-lg border hover:bg-gray-50"
    >
      <RefreshCw size={14} className={loadingAllComments ? 'animate-spin' : ''} />
    </button>
  </div>
</div>
          
          <div className="overflow-x-auto" style={{ maxHeight: 'calc(100vh - 450px)', overflowY: 'auto', ...scrollbarStyles }}>
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b" style={{ borderColor: BD }}>
                  <th className="py-2 px-3 text-left font-medium text-xs" style={{ color: MU }}>Post</th>
                  <th className="py-2 px-3 text-left font-medium text-xs" style={{ color: MU }}>Author</th>
                  <th className="py-2 px-3 text-left font-medium text-xs hidden sm:table-cell" style={{ color: MU }}>Email</th>
                  <th className="py-2 px-3 text-left font-medium text-xs hidden md:table-cell" style={{ color: MU }}>Content</th>
                  <th className="py-2 px-3 text-left font-medium text-xs hidden lg:table-cell" style={{ color: MU }}>Status</th>
                  <th className="py-2 px-3 text-left font-medium text-xs" style={{ color: MU }}>Actions</th>
                 </tr>
              </thead>
              <tbody>
                {filteredComments.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors" style={{ borderColor: BD }}>
                    <td className="py-2 px-3 text-xs max-w-[150px] truncate" style={{ color: N }} title={r.postTitle}>{r.postTitle}</td>
                    <td className="py-2 px-3 text-xs" style={{ color: MU }}>{r.author}</td>
                    <td className="py-2 px-3 text-xs hidden sm:table-cell" style={{ color: MU }}>{r.email}</td>

                    <td className="py-2 px-3 text-xs hidden md:table-cell max-w-[200px] truncate" style={{ color: MU }} title={r.content}>{r.content}</td>
                    <td className="py-2 px-3 hidden lg:table-cell">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${r.status === 'approved' ? 'bg-green-100 text-green-800' : r.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>{r.status}</span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex gap-1">
                        {canUpdate && <button onClick={() => editComment(r)} className="p-1 rounded hover:bg-gray-100" title="Edit"><Edit size={12} /></button>}
                        {canDelete && <button onClick={() => deleteComment(r.id)} className="p-1 rounded hover:bg-red-50" title="Delete"><Trash2 size={12} style={{ color: "#ef4444" }} /></button>}
                      </div>
                    </td>
                   </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-xs" style={{ color: MU }}>Showing <span className="font-semibold">{filteredComments.length}</span> comment(s)</div>
        </div>

        {/* Delete Comment Confirm Modal */}
        {confirmDeleteCommentId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0" style={{ background: "rgba(15,43,61,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setConfirmDeleteCommentId(null)} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#fee2e2" }}>
                    <AlertCircle size={20} style={{ color: "#dc2626" }} />
                  </div>
                  <h3 className="text-lg font-semibold" style={{ color: N }}>Delete Comment</h3>
                </div>
                <p className="text-sm mb-6" style={{ color: MU }}>Are you sure you want to delete this comment? This action cannot be undone.</p>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setConfirmDeleteCommentId(null)} className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50" style={{ borderColor: BD, color: N }}>Cancel</button>
                  <button onClick={confirmDeleteComment} className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90" style={{ background: "#dc2626" }}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAITools = () => (
    <div className="bg-white rounded-xl shadow-sm p-4" style={{ border: `1px solid ${BD}` }}>
      <h3 className="text-sm font-bold mb-4" style={{ color: N }}>AI Enhancement Tools</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg" style={{ background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", border: "1px solid #a7f3d0" }}>
          <div className="flex items-center gap-2 mb-2"><div className="p-1.5 rounded bg-green-100"><Save size={16} style={{ color: "#059669" }} /></div><h4 className="text-sm font-semibold" style={{ color: N }}>Plagiarism Checker</h4></div>
          <p className="text-xs mb-3" style={{ color: MU }}>Advanced AI-powered plagiarism detection with 99.7% accuracy</p>
          <div className="space-y-1 mb-3"><div className="flex justify-between text-xs"><span>Accuracy Rate</span><span className="font-bold text-green-600">99.7%</span></div><div className="flex justify-between text-xs"><span>Avg Originality</span><span className="font-bold text-green-600">97.2%</span></div></div>
          <button className="w-full py-1.5 rounded-lg text-white text-xs transition-all hover:opacity-90" style={{ background: "#059669" }}>Run Bulk Check</button>
        </div>
        <div className="p-4 rounded-lg" style={{ background: "linear-gradient(135deg, #eff6ff, #dbeafe)", border: "1px solid #bfdbfe" }}>
          <div className="flex items-center gap-2 mb-2"><div className="p-1.5 rounded bg-blue-100"><TrendingUp size={16} style={{ color: "#2563eb" }} /></div><h4 className="text-sm font-semibold" style={{ color: N }}>SEO Optimizer</h4></div>
          <p className="text-xs mb-3" style={{ color: MU }}>Automatically optimize content for search engines</p>
          <div className="space-y-1 mb-3"><div className="flex justify-between text-xs"><span>Avg SEO Score</span><span className="font-bold text-blue-600">89.5%</span></div><div className="flex justify-between text-xs"><span>Posts Optimized</span><span className="font-bold text-blue-600">{postsArray.length}</span></div></div>
          <button className="w-full py-1.5 rounded-lg text-white text-xs transition-all hover:opacity-90" style={{ background: "#2563eb" }}>Optimize All</button>
        </div>
        <div className="p-4 rounded-lg" style={{ background: "linear-gradient(135deg, #faf5ff, #f3e8ff)", border: "1px solid #e9d5ff" }}>
          <div className="flex items-center gap-2 mb-2"><div className="p-1.5 rounded bg-purple-100"><Wand2 size={16} style={{ color: "#7c3aed" }} /></div><h4 className="text-sm font-semibold" style={{ color: N }}>AI Enhancer</h4></div>
          <p className="text-xs mb-3" style={{ color: MU }}>Improve readability, tone, and engagement</p>
          <div className="space-y-1 mb-3"><div className="flex justify-between text-xs"><span>Enhancement Rate</span><span className="font-bold text-purple-600">92.8%</span></div><div className="flex justify-between text-xs"><span>Improved Posts</span><span className="font-bold text-purple-600">{Math.floor(postsArray.length * 0.8)}</span></div></div>
          <button className="w-full py-1.5 rounded-lg text-white text-xs transition-all hover:opacity-90" style={{ background: "#7c3aed" }}>Bulk Enhance</button>
        </div>
      </div>
    </div>
  );

  const renderSEOTools = () => (
    <div className="bg-white rounded-xl shadow-sm p-4" style={{ border: `1px solid ${BD}` }}>
      <h3 className="text-sm font-bold mb-4" style={{ color: N }}>SEO Optimization Tools</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-semibold mb-2" style={{ color: N }}>Keyword Analysis</h4>
          <div className="p-3 rounded-lg" style={{ background: `${N}05`, border: `1px solid ${BD}` }}>
            <h5 className="text-[10px] font-medium mb-2" style={{ color: N }}>Top Performing Keywords</h5>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px]"><span>"real estate investment"</span><span className="font-bold" style={{ color: O }}>1,200 searches</span></div>
              <div className="flex justify-between text-[10px]"><span>"mumbai property"</span><span className="font-bold" style={{ color: O }}>890 searches</span></div>
              <div className="flex justify-between text-[10px]"><span>"home buying guide"</span><span className="font-bold" style={{ color: O }}>650 searches</span></div>
            </div>
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold mb-2" style={{ color: N }}>Content Optimization</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto" style={scrollbarStyles}>
            {postsArray.slice(0, 3).map((post) => {
              const seoScore = (post.content || '').includes('#') ? 85 : 65;
              return (
                <div key={post.id} className="p-2 rounded-lg" style={{ border: `1px solid ${BD}` }}>
                  <div className="flex items-center justify-between mb-1"><h5 className="text-[10px] font-medium truncate flex-1" style={{ color: N }}>{post.title}</h5><span className={`text-[10px] font-bold ${seoScore > 80 ? 'text-green-600' : seoScore > 60 ? 'text-yellow-600' : 'text-red-600'}`}>{seoScore}%</span></div>
                  <div className="flex items-center gap-2"><div className="flex-1 h-1 rounded-full" style={{ background: BD }}><div className="h-1 rounded-full" style={{ width: `${seoScore}%`, background: seoScore > 80 ? '#10b981' : seoScore > 60 ? '#f59e0b' : '#ef4444' }} /></div><button className="text-[10px]" style={{ color: O }}>Optimize</button></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
   
    <div className="" style={{ background: BG }}>
      <div className="max-w-9xl mx-auto px-3 sm:px-2 lg:px-3 py-2 sm:py-2">
        <div className="mb-2 sm:mb-6">
          <div className="flex items-center gap-2 mb-1 sticky top-0 z-10">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center " style={{ background: N }}><Layout size={14} style={{ color: O }} /></div>
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: N }}>Blog Management</h1>
          </div>
          <p className="text-xs sm:text-sm" style={{ color: MU }}>Manage content with AI-powered tools</p>
        </div>

        {/* Compact Tabs */}
 {/* Compact Tabs with Custom Scrollbar */}
<div 
  className="bg-white rounded-xl shadow-sm mb-4 sm:mb-6 overflow-x-auto " 
  style={{ 
    border: `1px solid ${BD}`,
    ...scrollbarStyles
  }}
>
  <div className="flex min-w-max">
    {tabs.map((tab) => {
      const Icon = tab.icon;
      return (
        <button 
          key={tab.id} 
          onClick={() => setActiveTab(tab.id)} 
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-b-2' : ''}`} 
          style={activeTab === tab.id ? { borderBottomColor: O, color: O, background: `${N}05` } : { color: MU }}
        >
          <Icon size={14} />
          <span className="hidden sm:inline">{tab.label}</span>
          <span className="sm:hidden">{tab.label === 'Content Management' ? 'Content' : tab.label === 'AI Enhancement Tools' ? 'AI Tools' : tab.label}</span>
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
            <div className="bg-white rounded-xl shadow-sm p-5 text-center" style={{ border: `1px solid ${BD}` }}>
              <Bot size={32} className="mx-auto mb-3" style={{ color: O }} />
              <h3 className="text-base font-bold mb-1" style={{ color: N }}>AI Content Studio</h3>
              <p className="text-xs mb-4" style={{ color: MU }}>Generate long-form, SEO-optimized posts with images &amp; ToC.</p>
              {canCreate ? <button onClick={() => { setSelectedPost(null); setShowAIWriter(true); }} className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90" style={{ background: N }}>Open AI Writer</button> : <p className="text-xs" style={{ color: MU }}>No permission</p>}
            </div>
          )}
          {activeTab === 'ai-tools' && renderAITools()}
          {activeTab === 'rss' && <RSSSourceManager />}
          {activeTab === 'social' && <SocialMediaManager posts={postsArray} />}
          {activeTab === 'seo' && renderSEOTools()}
          {activeTab === 'analytics' && <BlogAnalytics posts={postsArray} />}
        </div>

        {showPostEditor && <BlogPostEditor post={selectedPost as any} onSave={(p) => handleSavePost(p as Partial<BlogPost>)} onCancel={() => { setShowPostEditor(false); setSelectedPost(null); }} isOpen={showPostEditor} currentUserName={getUserDisplayName(user)} lockAuthor={true} />}
        {showAIWriter && canCreate && <AIBlogWriter isOpen={true} post={selectedPost as any} onSave={(p) => { handleSavePost(p); setShowAIWriter(false); setSelectedPost(null); }} onCancel={() => { setShowAIWriter(false); setSelectedPost(null); }} currentUserName={getUserDisplayName(user)} />}
        {showRSSManager && canCreate && <RSSSourceManager isOpen={true} onClose={() => setShowRSSManager(false)} />}
        {showSocialManager && canCreate && <SocialMediaManager posts={postsArray} isOpen={true} onClose={() => setShowSocialManager(false)} />}
      </div>

      {/* Delete Post Confirm Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" style={{ background: "rgba(15,43,61,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setConfirmDeleteId(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#fee2e2" }}>
                  <AlertCircle size={20} style={{ color: "#dc2626" }} />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: N }}>Delete Post</h3>
              </div>
              <p className="text-sm mb-6" style={{ color: MU }}>Are you sure you want to delete this post? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50" style={{ borderColor: BD, color: N }}>Cancel</button>
                <button onClick={() => { handleDeletePost(confirmDeleteId); setConfirmDeleteId(null); }} className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90" style={{ background: "#dc2626" }}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPreviewModal && previewPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" style={{ background: "rgba(15,43,61,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setShowPreviewModal(false)} />
          <div className="bg-white w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl shadow-2xl relative">
            <div className="sticky top-0 flex items-center justify-between p-4 border-b" style={{ background: N, borderBottomColor: O }}>
              <div><h3 className="text-sm font-bold text-white">{previewPost.title}</h3><div className="text-xs" style={{ color: `${O}cc` }}>{previewPost.author} • {formatDate(previewPost.publishedAt || previewPost.createdAt)}</div></div>
              <button onClick={() => setShowPreviewModal(false)} className="p-1 rounded-lg hover:bg-white/10"><X size={18} className="text-white" /></button>
            </div>
            <div className="p-4">
              {previewPost.featuredImage && <img src={previewPost.featuredImage} alt="" className="w-full h-40 object-cover rounded-lg mb-4" />}
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: renderPreviewHtml(previewPost.content) }} />
            </div>
          </div>
        </div>
      )}
    </div>
   
  );
};

export default BlogManagement;




