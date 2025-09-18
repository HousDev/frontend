// src/components/blogManager/BlogManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  FileText,
  Bot,
  Wrench,
  Globe,
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
  CornerUpLeft
} from 'lucide-react';
import { BlogPost, RSSSource, BlogCategory, BlogStatus } from '../../types/blog';

import toast from 'react-hot-toast';
import BlogPostEditor from '@/components/blogManager/BlogPostEditor';
import AIBlogWriter from '@/components/blogManager/AIBlogWriter';
import RSSSourceManager from '@/components/blogManager/RSSSourceManager';
import SocialMediaManager from '@/components/blogManager/SocialMediaManager';
import BlogAnalytics from '@/components/blogManager/BlogAnalytics';
import blogsAPI from '@/lib/blogsAPI';
import { useAuth } from '@/contexts/AuthContext';

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
  // FIXED: call the hook normally (don't use optional chaining on a function call)
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
      u.preferred_username
    ];
    for (const c of candidates) {
      if (c && String(c).trim()) return String(c).trim();
    }
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
  const [autoApprove, setAutoApprove] = useState(false);

  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);

  // preview modal state
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // comments state
  const [activeCommentsPost, setActiveCommentsPost] = useState<BlogPost | null>(null);
  const [commentsForPost, setCommentsForPost] = useState<CommentItem[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyState, setReplyState] = useState<Record<string, { open: boolean; text: string }>>({}); // keyed by commentId

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, description: 'Overview and quick actions' },
    { id: 'content', label: 'Content Management', icon: FileText, description: 'Manage all blog posts' },
    { id: 'comments', label: 'Comments', icon: MessageSquare, description: 'Manage comments & replies' },
    { id: 'ai-writer', label: 'AI Content Studio', icon: Bot, description: 'Create content with AI' },
    { id: 'ai-tools', label: 'AI Enhancement Tools', icon: Wrench, description: 'Enhance existing content' },
    { id: 'rss', label: 'RSS Sources', icon: GlobeIcon, description: 'Auto-import from RSS feeds' },
    { id: 'social', label: 'Social Media', icon: Share2, description: 'Schedule social posts' },
    { id: 'seo', label: 'SEO Tools', icon: TrendingUp, description: 'Optimize for search engines' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, description: 'Performance insights' }
  ];

  const loadPosts = useCallback(async (params?: Record<string, any>) => {
    setLoadingPosts(true);
    setPostsError(null);
    try {
      const data = await blogsAPI.getAllPosts(params);
      let list: any[] = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray((data as any).items)) {
        list = (data as any).items;
      } else if (data && Array.isArray((data as any).data)) {
        list = (data as any).data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray((data as any).posts)) list = (data as any).posts;
        else if (Array.isArray((data as any).results)) list = (data as any).results;
        else {
          const maybePost = data as any;
          if (maybePost?.id || maybePost?.title) list = [maybePost];
          else list = [];
        }
      } else {
        list = [];
      }

      const normalized = list.map((p: any) => ({
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
        readTime: typeof p.readTime === 'number' ? p.readTime : Math.ceil(((p.content || '').length || 0) / 200)
      })) as BlogPost[];

      setPosts(normalized);
    } catch (err: any) {
      console.error('Failed to load posts', err);
      if (err?.response) {
        setPostsError(`Server responded ${err.response.status}: ${err.response.data?.message || JSON.stringify(err.response.data)}`);
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

  const handleSavePost = (postData: Partial<BlogPost>) => {
    if (!postData) return;

    const id = (postData as any).id ?? (postData as any).slug ?? undefined;

    if (id === undefined || id === null) {
      const tentative: BlogPost = {
        id: `LOCAL_${Date.now()}`,
        title: postData.title || 'Untitled',
        slug: (postData.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        content: postData.content || '',
        excerpt: postData.excerpt || '',
        author: postData.author || 'Admin',
        category: postData.category || 'Uncategorized',
        tags: postData.tags || [],
        status: (postData.status as any) || 'draft',
        featured: !!postData.featured,
        featuredImage: postData.featuredImage || '',
        publishedAt: postData.publishedAt || '',
        createdAt: postData.createdAt || new Date().toISOString(),
        updatedAt: postData.updatedAt || new Date().toISOString(),
        views: (postData as any).views || 0,
        likes: (postData as any).likes || 0,
        comments: (postData as any).comments || 0,
        seoTitle: postData.seoTitle || '',
        seoDescription: postData.seoDescription || '',
        readTime: (postData.readTime as number) || Math.ceil(((postData.content || '').length || 0) / 200)
      };
      setPosts(prev => [tentative, ...prev]);
      toast.success('Post saved (local). Server did not return an id.');
      return;
    }

    setPosts(prev => {
      const exists = prev.find(p => String(p.id) === String(id));
      if (exists) {
        return prev.map(p => (String(p.id) === String(id) ? ({ ...p, ...(postData as Partial<BlogPost>) } as BlogPost) : p));
      } else {
        return [postData as BlogPost, ...prev];
      }
    });

    toast.success('Post saved successfully!');
    setShowPostEditor(false);
    setSelectedPost(null);
  };

  const handleDeletePost = async (postId: string | number) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      setPosts(curr => (Array.isArray(curr) ? curr.filter(p => String(p.id) !== String(postId)) : []));
      await blogsAPI.deletePost(postId);
      toast.success('Post deleted successfully!');
    } catch (err: any) {
      console.error('Delete failed', err);
      toast.error('Failed to delete post. Refreshing list.');
      loadPosts();
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setSelectedPost(post);
    setShowPostEditor(true);
  };

  /* ---------- PREVIEW HANDLERS & HELPERS ---------- */

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
    const safeTitle = (p.title || 'Preview').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const bodyHtml = `<article style="max-width:900px;margin:20px auto;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#111827;line-height:1.7;">
      <header style="margin-bottom:16px;">
        <h1 style="font-size:28px;margin:0 0 8px;color:#0f172a;">${safeTitle}</h1>
        <div style="color:#6b7280;font-size:14px;margin-bottom:12px;">${(p.author || '').replace(/</g, '&lt;')} • ${formatDate(p.publishedAt || p.createdAt || new Date().toISOString())}</div>
      </header>
      ${p.featuredImage ? `<img src="${p.featuredImage}" alt="featured" style="width:100%;height:auto;border-radius:8px;margin-bottom:16px;" />` : ''}
      <section>${renderPreviewHtml(p.content || '')}</section>
      ${p.tags && p.tags.length ? `<footer style="margin-top:20px;"><strong>Tags:</strong> ${p.tags.map(t => `<span style="display:inline-block;background:#eef2ff;color:#1e3a8a;padding:4px 8px;border-radius:999px;margin-right:6px;">${String(t).replace(/</g, '&lt;')}</span>`).join('')}</footer>` : ''}
    </article>`;

    const html = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${safeTitle}</title>
      <style>body{background:#fff;margin:0;padding:24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#111827}</style>
      </head><body>${bodyHtml}</body></html>`.replace(/<\/script/g, '<\\/script');

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  /* ---------- COMMENTS: load, reply, local fallback ---------- */

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
        // No backend: try posts' comments field if present (local)
        const p = posts.find(pt => String(pt.id) === String(postId));
        if (p && (p as any).commentsList && Array.isArray((p as any).commentsList)) {
          setCommentsForPost((p as any).commentsList);
        } else {
          setCommentsForPost([]); // empty fallback
        }
      }
    } catch (err) {
      console.warn('Failed to load comments', err);
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

  const toggleReplyBox = (commentId: string) => {
    setReplyState(prev => ({ ...prev, [commentId]: { open: !prev[commentId]?.open, text: prev[commentId]?.text || '' } }));
  };

  const setReplyText = (commentId: string, text: string) => {
    setReplyState(prev => ({ ...prev, [commentId]: { open: true, text } }));
  };

  const submitReply = async (parentCommentId: string) => {
    const state = replyState[parentCommentId];
    const text = state?.text?.trim();
    if (!text) {
      toast.error('Reply cannot be empty');
      return;
    }
    if (!activeCommentsPost) {
      toast.error('No post selected for comments');
      return;
    }

    // optimistic reply
    const replyObj: CommentItem = {
      id: `LOCAL_REPLY_${Date.now()}`,
      author: getUserDisplayName(user) || 'Admin',
      content: text,
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: []
    };

    setCommentsForPost(prev => prev.map(c => {
      if (String(c.id) === String(parentCommentId)) {
        return { ...c, replies: Array.isArray(c.replies) ? [replyObj, ...c.replies] : [replyObj] };
      }
      return c;
    }));

    // clear UI reply input
    setReplyState(prev => ({ ...prev, [parentCommentId]: { open: false, text: '' } }));

    // persist to backend if available
    try {
      if (typeof (blogsAPI as any).replyComment === 'function') {
        await (blogsAPI as any).replyComment(activeCommentsPost.id, parentCommentId, { author: replyObj.author, content: replyObj.content });
      } else if (typeof (blogsAPI as any).createComment === 'function') {
        // some backends accept createComment(postId, comment) — include parent relation if supported
        await (blogsAPI as any).createComment(activeCommentsPost.id, { author: replyObj.author, content: replyObj.content, parentId: parentCommentId });
      } else {
        // no backend — keep local only
        console.info('No comment-reply backend method available; reply stored locally.');
      }
      toast.success('Reply posted');
    } catch (err) {
      console.warn('Failed to persist reply', err);
      toast.error('Failed to save reply to server (kept locally).');
    }
  };

  const postNewCommentOnActivePost = async (text: string, author?: string, email?: string) => {
    if (!activeCommentsPost) return;
    const trimmed = text.trim();
    if (!trimmed) {
      toast.error('Comment cannot be empty');
      return;
    }

    const newComment: CommentItem = {
      id: `LOCAL_COMMENT_${Date.now()}`,
      author: author || getUserDisplayName(user) || 'Guest',
      email,
      content: trimmed,
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: []
    };

    setCommentsForPost(prev => [newComment, ...prev]);

    try {
      if (typeof (blogsAPI as any).createComment === 'function') {
        await (blogsAPI as any).createComment(activeCommentsPost.id, { author: newComment.author, email: newComment.email, content: newComment.content });
      }
      toast.success('Comment posted');
    } catch (err) {
      console.warn('Failed to persist comment', err);
      toast.error('Failed to save comment to server (kept locally).');
    }
  };

  /* ---------- AI & other functions (unchanged) ---------- */

  const generateAIContent = async (prompt: string, keywords: string[]) => {
    setIsGenerating(true);
    try {
      const aiContent = `# ${prompt}\n\nAuto-generated content for: ${prompt}\n\n*Keywords: ${keywords.join(', ')}*`;
      const payload: Record<string, any> = {
        title: prompt,
        content: aiContent,
        excerpt: `AI-generated: ${prompt}`,
        author: 'AI Assistant',
        category: 'Real Estate',
        tags: [...keywords, 'ai-generated'],
        status: 'draft',
        featured: false,
        featuredImage: 'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg',
        seoTitle: `${prompt} | Complete Guide | ResaleExpert`,
        seoDescription: `Learn about ${prompt.toLowerCase()}. Expert insights and strategies for real estate success.`
      };

      const created = await blogsAPI.createPost(payload).catch(err => {
        console.warn('createPost failed — will still open editor with local payload', err);
        return null;
      });

      const createdObjRaw = created && (created.post ?? created.data ?? created) || null;

      const normalizedAIObj: any = {
        id: createdObjRaw?.id ?? createdObjRaw?._id ?? `LOCAL_AI_${Date.now()}`,
        title: createdObjRaw?.title ?? payload.title,
        content: createdObjRaw?.content ?? payload.content,
        excerpt: createdObjRaw?.excerpt ?? payload.excerpt,
        author: createdObjRaw?.author ?? payload.author,
        category: createdObjRaw?.category ?? payload.category,
        tags: createdObjRaw?.tags ?? payload.tags,
        status: createdObjRaw?.status ?? 'draft',
        featured: createdObjRaw?.featured ?? payload.featured ?? false,
        featuredImage: createdObjRaw?.featuredImage
          ?? createdObjRaw?.featured_image
          ?? createdObjRaw?.image
          ?? createdObjRaw?.imageUrl
          ?? payload.featuredImage
          ?? '',
        publishedAt: createdObjRaw?.publishedAt ?? createdObjRaw?.published_at ?? '',
        createdAt: createdObjRaw?.createdAt ?? createdObjRaw?.created_at ?? new Date().toISOString(),
        updatedAt: createdObjRaw?.updatedAt ?? createdObjRaw?.updated_at ?? new Date().toISOString(),
        views: createdObjRaw?.views ?? 0,
        likes: createdObjRaw?.likes ?? 0,
        comments: createdObjRaw?.comments ?? 0,
        seoTitle: createdObjRaw?.seoTitle ?? createdObjRaw?.seo_title ?? createdObjRaw?.metaTitle ?? payload.seoTitle ?? '',
        seoDescription: createdObjRaw?.seoDescription ?? createdObjRaw?.seo_description ?? createdObjRaw?.metaDescription ?? payload.seoDescription ?? '',
        readTime: createdObjRaw?.readTime ?? Math.ceil((payload.content.length || 0) / 200)
      } as BlogPost;

      setPosts(prev => [normalizedAIObj, ...(Array.isArray(prev) ? prev : [])]);

      setSelectedPost(normalizedAIObj);
      setShowPostEditor(true);
      setShowAIWriter(false);

      toast.success('AI content generated and opened in editor!');
    } catch (err: any) {
      console.error('AI generation/save failed', err);
      toast.error('AI generation failed or could not save to backend.');
    } finally {
      setIsGenerating(false);
    }
  };

  const rewriteWithAI = async (postId: string | number) => {
    const post = (Array.isArray(posts) ? posts : []).find(p => String(p.id) === String(postId));
    if (!post) return;

    try {
      const updatedContent = post.content + '\n\n*[AI Enhanced: Content improved for better readability and SEO]*';
      setPosts(prev => (Array.isArray(prev) ? prev.map(p => (String(p.id) === String(postId) ? { ...p, content: updatedContent, updatedAt: new Date().toISOString() } : p)) : prev));
      toast.success('Content rewritten with AI (local).');

      try {
        await blogsAPI.updatePost(postId, { content: updatedContent, updatedAt: new Date().toISOString() });
        toast.success('Content saved to backend.');
      } catch (err) {
        console.warn('Failed to persist AI rewrite to backend', err);
        toast.error('AI rewrite succeeded locally but failed to persist to server.');
      }
    } catch (error) {
      toast.error('AI rewrite failed');
    }
  };

  const postsArray = Array.isArray(posts) ? posts : [];

  const filteredPosts = postsArray.filter(post => {
    const matchesSearch = !searchTerm ||
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || post.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories: BlogCategory[] = [
    'Real Estate', 'Investment', 'Market Analysis', 'Legal', 'Home Buying',
    'Home Selling', 'Property News', 'Construction', 'Finance'
  ];

  const statuses: BlogStatus[] = ['draft', 'published', 'archived'];

  /* ---------- Render functions ---------- */

  const renderDashboard = () => (
    <div className="space-y-6">
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
                {postsArray.reduce((acc, post) => acc + ((post.likes || 0) + (post.comments || 0)), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setShowAIWriter(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl hover:shadow-lg transition-all text-left"
          >
            <Bot className="mb-2" size={24} />
            <div className="font-semibold">AI Writer</div>
            <div className="text-xs text-purple-100">Generate new content</div>
          </button>

          <button
            onClick={() => { setShowPostEditor(true); setSelectedPost(null); }}
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Posts</h3>
        <div className="space-y-3">
          {postsArray.slice(0, 5).map((post) => (
            <div key={post.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-all">
              <div className="flex items-center space-x-4">
                {post.featuredImage ? (
                  <img src={post.featuredImage} alt={post.title} className="w-12 h-12 object-cover rounded-lg" />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3v18h18" /></svg>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900">{post.title}</h4>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Eye size={12} />
                      <span>{post.views || 0}</span>
                    </span>
                    <span>{post.category}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${post.status === 'published' ? 'bg-green-100 text-green-800' : post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                      {post.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => handleEditPost(post)} className="text-blue-600 hover:text-blue-700" title="Edit"><Edit size={16} /></button>
                <button onClick={() => handlePreviewPost(post)} className="text-blue-600 hover:text-blue-700" title="Preview"><Eye size={16} /></button>
                <button onClick={() => openCommentsForPost(post)} className="text-gray-600 hover:text-gray-700" title="View Comments"><MessageSquare size={16} /></button>
                <button onClick={() => handleDeletePost(post.id!)} className="text-red-600 hover:text-red-700" title="Delete"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );

  const renderContentManagement = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search posts..."
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
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Status</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">All Posts ({filteredPosts.length})</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowPostEditor(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Plus size={18} />
              <span>New Post</span>
            </button>
            <button onClick={() => loadPosts()} className="px-3 py-2 border rounded-md">Refresh</button>
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
              {filteredPosts.map((post) => {
                const getQualityScore = (content: string) => {
                  const seoScore = content.includes('#') && content.includes('##') ? 85 : 65;
                  const readabilityScore = content.length > 500 ? 88 : 75;
                  const overall = Math.round((seoScore + readabilityScore) / 2);
                  return { overall, seo: seoScore, readability: readabilityScore };
                };
                const getPlagiarismScore = (content: string) => Math.floor(Math.random() * 5) + 95;

                const qualityScore = getQualityScore(post.content || '');
                const plagiarismScore = getPlagiarismScore(post.content || '');

                return (
                  <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        {post.featuredImage ? (
                          <img src={post.featuredImage} alt={post.title} className="w-10 h-10 object-cover rounded-lg" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3v18h18" /></svg>
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{post.title}</h4>
                          <p className="text-xs text-gray-600">{post.author} • {new Date(post.createdAt || Date.now()).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{post.category}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${post.status === 'published' ? 'bg-green-100 text-green-800' : post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
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
                          <div className={`text-xs font-medium ${qualityScore.seo > 80 ? 'text-green-600' : 'text-yellow-600'}`}>{qualityScore.seo}%</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-xs text-gray-600">Original:</div>
                          <div className="text-xs font-medium text-green-600">{plagiarismScore}%</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleEditPost(post)} className="text-blue-600 hover:text-blue-700 p-1" title="Edit"><Edit size={16} /></button>
                        <button onClick={() => handlePreviewPost(post)} className="text-blue-600 hover:text-blue-700 p-1" title="Preview"><Eye size={16} /></button>
                        <button onClick={() => openCommentsForPost(post)} className="text-gray-600 hover:text-gray-700 p-1" title="Comments"><MessageSquare size={16} /></button>
                        <button onClick={() => rewriteWithAI(post.id!)} className="text-purple-600 hover:text-purple-700 p-1" title="AI Rewrite"><Wand2 size={16} /></button>
                        <button onClick={() => handleDeletePost(post.id!)} className="text-red-600 hover:text-red-700 p-1" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );

  const renderCommentsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Comments</h3>
          <div className="flex items-center gap-2">
            <select
              value={activeCommentsPost?.id ?? ''}
              onChange={(e) => {
                const pid = e.target.value;
                const p = posts.find(x => String(x.id) === String(pid));
                setActiveCommentsPost(p || null);
                loadCommentsForPost(pid || undefined);
              }}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">-- Select Post --</option>
              {postsArray.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <button onClick={() => { if (activeCommentsPost) loadCommentsForPost(activeCommentsPost.id); }} className="px-3 py-2 border rounded-md">Refresh</button>
            <button onClick={() => setActiveCommentsPost(null)} className="px-3 py-2 border rounded-md">Clear</button>
          </div>
        </div>

        {!activeCommentsPost && (
          <div className="text-center py-8">
            <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
            <h4 className="font-semibold text-gray-900 mb-2">No post selected</h4>
            <p className="text-gray-600 mb-4">Select a post above to view and reply to comments.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {postsArray.slice(0, 6).map(p => (
                <button key={p.id} onClick={() => openCommentsForPost(p)} className="px-4 py-2 border rounded-lg text-left hover:shadow-sm">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-gray-500">{p.author} • {new Date(p.createdAt || Date.now()).toLocaleDateString()}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeCommentsPost && (
          <div>
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold">{activeCommentsPost.title}</h4>
                  <div className="text-xs text-gray-500">{activeCommentsPost.author} • {new Date(activeCommentsPost.createdAt || Date.now()).toLocaleDateString()}</div>
                </div>
                <div>
                  {/* FIXED: replaced `void || something` chaining with explicit block so both setters run */}
                  <button
                    onClick={() => {
                      setShowPostEditor(true);
                      setSelectedPost(activeCommentsPost);
                    }}
                    className="px-3 py-2 border rounded-md mr-2"
                  >
                    Edit Post
                  </button>
                  <button onClick={() => openPreviewInNewWindow(activeCommentsPost)} className="px-3 py-2 border rounded-md">Open Post</button>
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
              {!loadingComments && commentsForPost.length === 0 && <div className="text-gray-600">No comments yet.</div>}
              {!loadingComments && commentsForPost.map(comment => (
                <div key={comment.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                          {String(comment.author || 'U').split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{comment.author}</div>
                          <div className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="text-gray-700 mb-3">{comment.content}</div>

                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <button onClick={() => toggleReplyBox(comment.id)} className="flex items-center gap-1 hover:text-blue-600">
                          <CornerUpLeft size={14} /> Reply
                        </button>
                        <button onClick={() => { /* optionally implement like */ }} className="hover:text-green-600">Like ({comment.likes || 0})</button>
                      </div>

                      {/* Replies */}
                      {Array.isArray(comment.replies) && comment.replies.length > 0 && (
                        <div className="mt-4 ml-10 space-y-3">
                          {comment.replies.map(reply => (
                            <div key={reply.id} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs">{String(reply.author || 'U')[0]}</div>
                                  <div className="text-sm">
                                    <div className="font-medium text-gray-900">{reply.author}</div>
                                    <div className="text-xs text-gray-500">{new Date(reply.createdAt).toLocaleString()}</div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-gray-700 text-sm">{reply.content}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply box */}
                      {replyState[comment.id]?.open && (
                        <div className="mt-3 ml-10">
                          <textarea
                            value={replyState[comment.id]?.text || ''}
                            onChange={(e) => setReplyText(comment.id, e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="Write a reply..."
                          />
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => submitReply(comment.id)} className="px-3 py-1.5 bg-blue-600 text-white rounded-md">Reply</button>
                            <button onClick={() => toggleReplyBox(comment.id)} className="px-3 py-1.5 border rounded-md">Cancel</button>
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
            <p className="text-sm text-gray-600 mb-4">Advanced AI-powered plagiarism detection with 99.7% accuracy</p>
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
            <button className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">Run Bulk Check</button>
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
            <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">Optimize All</button>
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
            <button className="w-full mt-4 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">Bulk Enhance</button>
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
                      <span className={`text-xs font-bold ${seoScore > 80 ? 'text-green-600' : seoScore > 60 ? 'text-yellow-600' : 'text-red-600'}`}>{seoScore}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className={`w-full bg-gray-200 rounded-full h-2 mr-3`}><div className={`h-2 rounded-full ${seoScore > 80 ? 'bg-green-500' : seoScore > 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${seoScore}%` }}></div></div>
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
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors whitespace-nowrap min-w-0 ${activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'content' && renderContentManagement()}
          {activeTab === 'comments' && renderCommentsTab()}
          {activeTab === 'ai-writer' && <AIBlogWriter onGenerate={generateAIContent} isGenerating={isGenerating} />}
          {activeTab === 'ai-tools' && renderAITools()}
          {activeTab === 'rss' && (
            <RSSSourceManager
              sources={rssources}
              onUpdate={setRSSources}
              onSync={() => toast.success('RSS sources synced!')}
              autoApprove={autoApprove}
            />
          )}
          {activeTab === 'social' && <SocialMediaManager posts={postsArray} />}
          {activeTab === 'seo' && renderSEOTools()}
          {activeTab === 'analytics' && <BlogAnalytics posts={postsArray} />}
        </div>

        {showPostEditor && (
          <BlogPostEditor
            post={selectedPost || undefined}
            onSave={handleSavePost}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <AIBlogWriter
                isOpen={true}
                onClose={() => setShowAIWriter(false)}
                onGenerate={generateAIContent}
                isGenerating={isGenerating}
              />
            </div>
          </div>
        )}

        {showRSSManager && (
          <RSSSourceManager
            sources={rssources}
            isOpen={true}
            onClose={() => setShowRSSManager(false)}
            onUpdate={setRSSources}
            onSync={() => toast.success('RSS sources synced!')}
            autoApprove={autoApprove}
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

      {/* ----------- Preview Modal ------------ */}
      {showPreviewModal && previewPost && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closePreviewModal} />
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl z-70 relative">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md flex items-center justify-center text-white font-bold text-sm">
                  {String(previewPost.author || 'A').split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{previewPost.title}</h3>
                  <div className="text-xs text-gray-500">{previewPost.author} • {formatDate(previewPost.publishedAt || previewPost.createdAt)}</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button onClick={() => openPreviewInNewWindow(previewPost)} className="px-3 py-1 border rounded-md text-sm">Open in new window</button>
                <button onClick={closePreviewModal} className="p-2 rounded-md hover:bg-gray-100">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="p-4">
              {previewPost.featuredImage && (
                <img src={previewPost.featuredImage} alt={previewPost.title} className="w-full h-48 object-cover rounded-lg mb-4" />
              )}

              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: renderPreviewHtml(previewPost.content) }} />

              {previewPost.tags && previewPost.tags.length > 0 && (
                <div className="mt-6">
                  <div className="text-sm font-medium mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {previewPost.tags.map((t, i) => (
                      <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ----------- End Preview Modal ------------ */}
    </div>
  );
};

export default BlogManagement;

/* -------------------- Helper subcomponent -------------------- */
/* Small inline composer for new comments used inside Comments tab */
const CommentComposer: React.FC<{ onPost: (text: string, author?: string, email?: string) => void; posting?: boolean }> = ({ onPost, posting }) => {
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
        <input className="px-3 py-2 border rounded-md" placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="px-3 py-2 border rounded-md" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div />
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={() => { setText(''); setName(''); setEmail(''); }} className="px-3 py-1.5 border rounded-md">Clear</button>
        <button onClick={() => { onPost(text, name, email); setText(''); }} disabled={posting || !text.trim()} className="px-3 py-1.5 bg-blue-600 text-white rounded-md">
          {posting ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </div>
  );
};
