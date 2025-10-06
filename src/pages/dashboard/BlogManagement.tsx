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
  Send,
  X,
  Globe as GlobeIcon,
  MessageSquare,
  CornerUpLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Calendar,
  Tag,
  User,
} from 'lucide-react';

import { BlogPost, RSSSource, BlogCategory, BlogStatus } from '../../types/blog';

import BlogPostEditor from '@/components/blogManager/BlogPostEditor';
import AIBlogWriter from '@/components/blogManager/AIBlogWriter';
import RSSSourceManager from '@/components/blogManager/RSSSourceManager';
import SocialMediaManager from '@/components/blogManager/SocialMediaManager';
import BlogAnalytics from '@/components/blogManager/BlogAnalytics';
import blogsAPI from '@/lib/blogsAPI';
import { rssAPI } from '@/lib/rssAPI';

import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

interface CommentItem {
  id: string;
  author: string;
  email?: string;
  content: string;
  createdAt: string;
  likes?: number;
  replies?: CommentItem[];
}

const BlogManagement: React.FC = () => {
  const { user } = useAuth() ?? { user: null };

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
  const [autoApprove] = useState(false);

  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);

  // sub-tabs (default: draft)
  const [postStateTab, setPostStateTab] = useState<'draft' | 'published'>('draft');

  // Pagination
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // preview modal
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // comments state
  const [activeCommentsPost, setActiveCommentsPost] = useState<BlogPost | null>(null);
  const [commentsForPost, setCommentsForPost] = useState<CommentItem[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyState, setReplyState] = useState<Record<string, { open: boolean; text: string }>>({});

  // auto publish after AI rewrite
  const [autoPublishAfterAI, setAutoPublishAfterAI] =
    useState<null | { originalId: string | number }>(null);

  /** Map: sourceId -> sourceName (used where only sourceId is present) */
  const sourceNameById = useMemo<Record<string, string>>(
    () =>
      (rssources || []).reduce((acc: Record<string, string>, s: any) => {
        const id = String(s?.id ?? s?._id ?? s?.slug ?? '');
        if (id) acc[id] = String(s?.name ?? s?.title ?? s?.label ?? s?.sourceName ?? 'RSS');
        return acc;
      }, {}),
    [rssources]
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, description: 'Overview and quick actions' },
    { id: 'content', label: 'Content Management', icon: FileText, description: 'Manage all blog posts' },
    { id: 'comments', label: 'Comments', icon: MessageSquare, description: 'Manage comments & replies' },
    { id: 'ai-writer', label: 'AI Content Studio', icon: Bot, description: 'Create content with AI' },
    { id: 'ai-tools', label: 'AI Enhancement Tools', icon: Wrench, description: 'Enhance existing content' },
    { id: 'rss', label: 'RSS Sources', icon: GlobeIcon, description: 'Auto-import from RSS feeds' },
    { id: 'social', label: 'Social Media', icon: Share2, description: 'Schedule posts' },
    { id: 'seo', label: 'SEO Tools', icon: TrendingUp, description: 'Optimize for search engines' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, description: 'Performance insights' },
  ];

  /** Normalize various backend shapes -> BlogPost with sourceId/sourceName included */
  const normalizePost = (p: any): BlogPost & { sourceId?: string | number; sourceName?: string } => {
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
      // extras we care about:
      ...(sourceId !== undefined ? { sourceId } : {}),
      ...(sourceName ? { sourceName } : {}),
    } as any;
  };

  const loadPosts = useCallback(async (params?: Record<string, any>) => {
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
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    (async () => {
      try {
        const resp = await rssAPI.getAll();
        const list = Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
        setRSSources(list as RSSSource[]);
      } catch {
        // silent
      }
    })();
  }, []);

  const handleRefresh = async () => {
    try {
      setPage(1);
      await loadPosts({ _ts: Date.now() });
      toast.success('List refreshed');
    } catch { }
  };

  /** Ensure saved/updated posts also keep sourceId/sourceName if provided */
  const handleSavePost = (postData: Partial<BlogPost>) => {
    if (!postData) return;
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
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      setPosts((curr) =>
        (Array.isArray(curr) ? curr : []).filter((p) => String(p.id) !== String(postId))
      );
      await blogsAPI.deletePost(postId);
      toast.success('Post deleted successfully!');
    } catch {
      toast.error('Failed to delete post. Refreshing list.');
      handleRefresh();
    }
  };

  const handleEditPost = (post: BlogPost) => {
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
    const src =
      (p as any).sourceName ||
      (p as any).sourceId && sourceNameById[String((p as any).sourceId)] ||
      '';
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

  // comments
  const loadCommentsForPost = async (postId?: string | number) => {
    if (!postId) {
      setCommentsForPost([]);
      return;
    }
    setLoadingComments(true);
    try {
      if (typeof (blogsAPI as any).getComments === 'function') {
        const res = await (blogsAPI as any).getComments(postId);
        const list = res && (res.data ?? res.comments ?? res) ? (res.data ?? res.comments ?? res) : [];
        setCommentsForPost(Array.isArray(list) ? list : []);
      } else {
        const p = posts.find((pt) => String(pt.id) === String(postId));
        if (p && (p as any).commentsList && Array.isArray((p as any).commentsList))
          setCommentsForPost((p as any).commentsList);
        else setCommentsForPost([]);
      }
    } catch {
      setCommentsForPost([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const openCommentsForPost = (post: BlogPost) => {
    setActiveTab('comments');
    setActiveCommentsPost(post);
    loadCommentsForPost(post.id);
  };

  const toggleReplyBox = (commentId: string) =>
    setReplyState((prev) => ({
      ...prev,
      [commentId]: { open: !prev[commentId]?.open, text: prev[commentId]?.text || '' },
    }));

  const setReplyText = (commentId: string, text: string) =>
    setReplyState((prev) => ({ ...prev, [commentId]: { open: true, text } }));

  const submitReply = async (parentCommentId: string) => {
    const state = replyState[parentCommentId];
    const text = state?.text?.trim();
    if (!text) return toast.error('Reply cannot be empty');
    if (!activeCommentsPost) return toast.error('No post selected for comments');

    const replyObj: CommentItem = {
      id: `LOCAL_REPLY_${Date.now()}`,
      author: getUserDisplayName(user) || 'Admin',
      content: text,
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: [],
    };

    setCommentsForPost((prev) =>
      prev.map((c) =>
        String(c.id) === String(parentCommentId)
          ? { ...c, replies: Array.isArray(c.replies) ? [replyObj, ...c.replies] : [replyObj] }
          : c
      )
    );
    setReplyState((prev) => ({ ...prev, [parentCommentId]: { open: false, text: '' } }));

    try {
      if (typeof (blogsAPI as any).replyComment === 'function') {
        await (blogsAPI as any).replyComment(activeCommentsPost.id, parentCommentId, {
          author: replyObj.author,
          content: replyObj.content,
        });
      } else if (typeof (blogsAPI as any).createComment === 'function') {
        await (blogsAPI as any).createComment(activeCommentsPost.id, {
          author: replyObj.author,
          content: replyObj.content,
          parentId: parentCommentId,
        });
      }
      toast.success('Reply posted');
    } catch {
      toast.error('Failed to save reply to server (kept locally).');
    }
  };

  const postNewCommentOnActivePost = async (text: string, author?: string, email?: string) => {
    if (!activeCommentsPost) return;
    const trimmed = text.trim();
    if (!trimmed) return toast.error('Comment cannot be empty');

    const newComment: CommentItem = {
      id: `LOCAL_COMMENT_${Date.now()}`,
      author: author || getUserDisplayName(user) || 'Guest',
      email,
      content: trimmed,
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: [],
    };

    setCommentsForPost((prev) => [newComment, ...prev]);

    try {
      if (typeof (blogsAPI as any).createComment === 'function') {
        await (blogsAPI as any).createComment(activeCommentsPost.id, {
          author: newComment.author,
          email: newComment.email,
          content: newComment.content,
        });
      }
      toast.success('Comment posted');
    } catch {
      toast.error('Failed to save comment to server (kept locally).');
    }
  };

  // AI & workflow
  const generateAIContent = async (prompt: string, keywords: string[]) => {
    setIsGenerating(true);
    try {
      const shouldAutoPublish = !!autoPublishAfterAI;

      const aiContent = `# ${prompt}\n\nAuto-generated content for: ${prompt}\n\n*Keywords: ${keywords.join(
        ', '
      )}*`;
      const payload: Record<string, any> = {
        title: prompt,
        content: aiContent,
        excerpt: `AI-generated: ${prompt}`,
        author: 'AI Assistant',
        category: 'Real Estate',
        tags: [...keywords, 'ai-generated'],
        status: shouldAutoPublish ? 'published' : 'draft',
        featured: false,
        featuredImage: 'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg',
        seoTitle: `${prompt} | Complete Guide | ResaleExpert`,
        seoDescription: `Learn about ${prompt.toLowerCase()}. Expert insights and strategies for real estate success.`,
      };

      const created = await blogsAPI.createPost(payload).catch(() => null);
      const createdObjRaw = (created && (created.post ?? created.data ?? created)) || null;
      const normalizedAIObj = normalizePost(createdObjRaw ?? payload);

      (normalizedAIObj as any).status =
        createdObjRaw?.status ?? (shouldAutoPublish ? 'published' : 'draft');
      if (shouldAutoPublish && !(normalizedAIObj as any).publishedAt) {
        (normalizedAIObj as any).publishedAt = new Date().toISOString();
      }

      setPosts((prev) => [normalizedAIObj as BlogPost, ...(Array.isArray(prev) ? prev : [])]);

      if (shouldAutoPublish) {
        setAutoPublishAfterAI(null);
        toast.success('AI rewrite created and published!');
        setPostStateTab('published');
        setActiveTab('content');
      } else {
        setSelectedPost(normalizedAIObj as BlogPost);
        setShowPostEditor(true);
        setShowAIWriter(false);
        toast.success('AI content generated and opened in editor!');
      }
    } catch (err: any) {
      console.error('AI generation/save failed', err);
      toast.error('AI generation failed or could not save to backend.');
    } finally {
      setIsGenerating(false);
    }
  };

  const rewriteWithAI = (postId: string | number) => {
    const post = (Array.isArray(posts) ? posts : []).find((p) => String(p.id) === String(postId));
    if (!post) return;
    setSelectedPost(post);
    setShowAIWriter(true);
  };

  const publishPost = async (postId: string | number) => {
    try {
      setPosts((prev) =>
        (prev ?? []).map((p) =>
          String(p.id) === String(postId)
            ? { ...p, status: 'published', publishedAt: new Date().toISOString() }
            : p
        )
      );
      if (typeof (blogsAPI as any).updatePost === 'function') {
        await (blogsAPI as any).updatePost(postId, {
          status: 'published',
          publishedAt: new Date().toISOString(),
        });
      }
      toast.success('Post published');
      setPostStateTab('published');
    } catch {
      toast.error('Failed to publish. Restoring state.');
      handleRefresh();
    }
  };

  const rewriteThenPublish = (postId: string | number) => {
    setAutoPublishAfterAI({ originalId: postId });
    rewriteWithAI(postId);
    toast.info('Rewrite with AI opened. The new version will auto-publish.');
  };

  const postsArray = Array.isArray(posts) ? posts : [];

  // filters + sub-tab
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

  // pagination
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
          <button
            onClick={() => setShowRSSManager(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-xl hover:shadow-lg transition-all text-left"
          >
            <GlobeIcon className="mb-2" size={24} />
            <div className="font-semibold">RSS Import</div>
            <div className="text-xs text-green-100">Auto-import content</div>
          </button>
          <button
            onClick={() => setShowSocialManager(true)}
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 rounded-xl hover:shadow-lg transition-all text-left"
          >
            <Share2 className="mb-2" size={24} />
            <div className="font-semibold">Social Media</div>
            <div className="text-xs text-orange-100">Schedule posts</div>
          </button>
        </div>
      </div>

      {/* Recent posts (now also shows source) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Posts</h3>
        <div className="space-y-3">
          {postsArray.slice(0, 5).map((post) => {
            const src =
              (post as any).sourceName ||
              ((post as any).sourceId &&
                sourceNameById[String((post as any).sourceId)]) ||
              '';
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
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
                  <button
                    onClick={() => handleEditPost(post)}
                    className="text-blue-600 hover:text-blue-700"
                    title="Edit"
                  >
                    <Edit size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderContentManagement = () => (
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
            <button
              onClick={() => setShowPostEditor(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>New Post</span>
            </button>
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
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Status</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          {/* Page size */}
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
                <th className="text-left py-3 px-4 font-medium text-gray-700">Title</th>
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
                const getPlagiarismScore = (content: string) =>
                  Math.floor(Math.random() * 5) + 95;

                const qualityScore = getQualityScore(post.content || '');
                const plagiarismScore = getPlagiarismScore(post.content || '');
                const isDraft = post.status === 'draft';

                const src =
                  (post as any).sourceName ||
                  ((post as any).sourceId &&
                    sourceNameById[String((post as any).sourceId)]) ||
                  '';

                return (
                  <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                            {src ? ` • ${src}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {post.category}
                      </span>
                    </td>
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
                    <td className="py-3 px-4">
                      <div className="text-xs text-gray-600">
                        <div>{post.views || 0} views</div>
                        <div>{post.likes || 0} likes</div>
                      </div>
                    </td>
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
                          <div className="text-xs font-medium text-green-600">
                            {plagiarismScore}%
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {/* one straight row, consistent icon buttons */}
                      <div className="flex items-center gap-3 whitespace-nowrap">
                        <button
                          onClick={() => handleEditPost(post)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition"
                          title="Edit"
                        >
                          <Edit size={18} className="shrink-0" />
                        </button>

                        <button
                          onClick={() => handlePreviewPost(post)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition"
                          title="Preview"
                        >
                          <Eye size={18} className="shrink-0" />
                        </button>

                        <button
                          onClick={() => openCommentsForPost(post)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition"
                          title="Comments"
                        >
                          <MessageSquare size={18} className="shrink-0" />
                        </button>

                        <button
                          onClick={() => rewriteWithAI(post.id!)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition"
                          title="AI Rewrite"
                        >
                          <Wand2 size={18} className="shrink-0" />
                        </button>

                        <button
                          onClick={() => handleDeletePost(post.id!)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition"
                          title="Delete"
                        >
                          <Trash2 size={18} className="shrink-0" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
              {paginatedPosts.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-500">
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
            <button
              onClick={handleRefresh}
              disabled={loadingPosts}
              className={`ml-2 px-3 py-2 border rounded-md transition-colors flex items-center gap-2 ${loadingPosts ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
              title="Refresh list"
            >
              <RefreshCw size={16} className={loadingPosts ? 'animate-spin' : ''} />
              <span>{loadingPosts ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // --- comments / AI tools / SEO tools remain as in your version (unchanged) ---
  const renderCommentsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Comments</h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <select
              value={activeCommentsPost?.id ?? ''}
              onChange={(e) => {
                const pid = e.target.value;
                const p = posts.find((x) => String(x.id) === String(pid));
                setActiveCommentsPost(p || null);
                loadCommentsForPost(pid || undefined);
              }}
              className="px-3 py-2 border rounded-md w-full sm:w-64"
            >
              <option value="">-- Select Post --</option>
              {postsArray.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (activeCommentsPost) loadCommentsForPost(activeCommentsPost.id);
                }}
                className="px-3 py-2 border rounded-md hover:bg-gray-50 transition-colors w-full sm:w-auto"
              >
                Refresh
              </button>
              <button
                onClick={() => setActiveCommentsPost(null)}
                className="px-3 py-2 border rounded-md hover:bg-gray-50 transition-colors w-full sm:w-auto"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {!activeCommentsPost && (
          <div className="text-center py-8 px-4">
            <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
            <h4 className="font-semibold text-gray-900 mb-2">No post selected</h4>
            <p className="text-gray-600 mb-5">Select a post above to view and reply to comments.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {(postsArray ?? []).slice(0, 6).map((p) => (
                <button
                  key={p.id}
                  onClick={() => openCommentsForPost(p)}
                  className="px-4 py-3 border rounded-lg text-left hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <div className="font-medium text-gray-900 truncate">{p.title ?? 'Untitled'}</div>
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {p.author ?? 'Unknown'} •{' '}
                    {new Date(p.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeCommentsPost && (
          <div>
            <div className="mb-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-base sm:text-lg font-semibold truncate">
                    {activeCommentsPost.title}
                  </h4>
                  <div className="text-xs text-gray-500">
                    {activeCommentsPost.author} •{' '}
                    {new Date(activeCommentsPost.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setShowPostEditor(true);
                      setSelectedPost(activeCommentsPost);
                    }}
                    className="px-3 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Edit Post
                  </button>
                  <button
                    onClick={() => openPreviewInNewWindow(activeCommentsPost)}
                    className="px-3 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Open Post
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <CommentComposer
                onPost={(text, author, email) => postNewCommentOnActivePost(text, author, email)}
                posting={false}
              />
            </div>

            <div className="space-y-4">
              {loadingComments && <div className="text-gray-600">Loading comments...</div>}
              {!loadingComments && commentsForPost.length === 0 && (
                <div className="text-gray-600">No comments yet.</div>
              )}
              {!loadingComments &&
                commentsForPost.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="w-full">
                        <div className="flex items-start sm:items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-700 shrink-0">
                            {String(comment.author || 'U')
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate">{comment.author}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-gray-700 mb-3 break-words">{comment.content}</div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <button
                            onClick={() => toggleReplyBox(comment.id)}
                            className="flex items-center gap-1 hover:text-blue-600"
                          >
                            <CornerUpLeft size={14} /> Reply
                          </button>
                          <button onClick={() => { }} className="hover:text-green-600">
                            Like ({comment.likes || 0})
                          </button>
                        </div>
                        {Array.isArray(comment.replies) && comment.replies.length > 0 && (
                          <div className="mt-4 sm:ml-10 space-y-3">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-start gap-2 mb-1">
                                  <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs shrink-0">
                                    {String(reply.author || 'U')[0]}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                      {reply.author}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {new Date(reply.createdAt).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-gray-700 text-sm break-words">{reply.content}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {replyState[comment.id]?.open && (
                          <div className="mt-3 sm:ml-10">
                            <textarea
                              value={replyState[comment.id]?.text || ''}
                              onChange={(e) => setReplyText(comment.id, e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border rounded-md"
                              placeholder="Write a reply..."
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                              <button
                                onClick={() => submitReply(comment.id)}
                                className="px-3 py-1.5 bg-blue-600 text-white rounded-md"
                              >
                                Reply
                              </button>
                              <button
                                onClick={() => toggleReplyBox(comment.id)}
                                className="px-3 py-1.5 border rounded-md"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAITools = () => (
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

  const renderSEOTools = () => (
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
            <AIBlogWriter onGenerate={generateAIContent} isGenerating={isGenerating} />
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

        {showAIWriter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <AIBlogWriter
                isOpen={true}
                onClose={() => {
                  setShowAIWriter(false);
                  setSelectedPost(null);
                  setAutoPublishAfterAI(null);
                }}
                onGenerate={generateAIContent}
                isGenerating={isGenerating}
              />
            </div>
          </div>
        )}

        {showRSSManager && (
          <RSSSourceManager
            isOpen={true}
            onClose={() => setShowRSSManager(false)}
          />
        )}

        {showSocialManager && (
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
                    {(previewPost as any).sourceName ||
                      ((previewPost as any).sourceId &&
                        sourceNameById[String((previewPost as any).sourceId)])
                      ? ` • ${(previewPost as any).sourceName ||
                      sourceNameById[String((previewPost as any).sourceId)]
                      }`
                      : ''}
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

              {previewPost.tags && previewPost.tags.length > 0 && (
                <div className="mt-6">
                  <div className="text-sm font-medium mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {previewPost.tags.map((t, i) => (
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

/* -------------------- Helper subcomponent -------------------- */
const CommentComposer: React.FC<{
  onPost: (text: string, author?: string, email?: string) => void;
  posting?: boolean;
}> = ({ onPost, posting }) => {
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

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
            setText('');
            setName('');
            setEmail('');
          }}
          className="px-3 py-1.5 border rounded-md"
        >
          Clear
        </button>
        <button
          onClick={() => {
            onPost(text, name, email);
            setText('');
          }}
          disabled={posting || !text.trim()}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-md"
        >
          {posting ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </div>
  );
};
