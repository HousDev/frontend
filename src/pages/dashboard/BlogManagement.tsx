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
  X
} from 'lucide-react';
import { BlogPost, RSSSource, BlogCategory, BlogStatus } from '../../types/blog';

import toast from 'react-hot-toast';
import BlogPostEditor from '@/components/blogManager/BlogPostEditor';
import AIBlogWriter from '@/components/blogManager/AIBlogWriter';
import RSSSourceManager from '@/components/blogManager/RSSSourceManager';
import SocialMediaManager from '@/components/blogManager/SocialMediaManager';
import BlogAnalytics from '@/components/blogManager/BlogAnalytics';
import blogsAPI from '@/lib/blogsAPI';

const BlogManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [rssources, setRSSources] = useState<RSSSource[]>([])

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

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, description: 'Overview and quick actions' },
    { id: 'content', label: 'Content Management', icon: FileText, description: 'Manage all blog posts' },
    { id: 'ai-writer', label: 'AI Content Studio', icon: Bot, description: 'Create content with AI' },
    { id: 'ai-tools', label: 'AI Enhancement Tools', icon: Wrench, description: 'Enhance existing content' },
    { id: 'rss', label: 'RSS Sources', icon: Globe, description: 'Auto-import from RSS feeds' },
    { id: 'social', label: 'Social Media', icon: Share2, description: 'Schedule social posts' },
    { id: 'seo', label: 'SEO Tools', icon: TrendingUp, description: 'Optimize for search engines' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, description: 'Performance insights' }
  ];

  // ---------- Backend integration ----------
  const loadPosts = useCallback(async (params?: Record<string, any>) => {
    setLoadingPosts(true);
    setPostsError(null);
    try {
      console.log('Loading posts with params:', params);
      const data = await blogsAPI.getAllPosts(params);
      console.log('Raw posts API response:', data);

      // Normalize response into an array safely
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

      // Ensure items are objects and have expected defaults
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
        featuredImage: p.featuredImage ?? p.featured_image ?? p.image ?? '', // dynamic field
        publishedAt: p.publishedAt ?? p.published_at ?? '',
        createdAt: p.createdAt ?? p.created_at ?? new Date().toISOString(),
        updatedAt: p.updatedAt ?? p.updated_at ?? new Date().toISOString(),
        views: p.views ?? 0,
        likes: p.likes ?? 0,
        comments: p.comments ?? 0,
        seoTitle: p.seoTitle ?? p.seo_title ?? '',
        seoDescription: p.seoDescription ?? p.seo_description ?? '',
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
      setPosts([]); // be defensive
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Called by BlogPostEditor when it saves — Editor already calls blogsAPI and passes response back
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
      // optimistic UI update (and defensive array check)
      const prev = posts;
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

  // Generate AI Content and save to backend (if you want to persist)
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
        featuredImage: ''
      };

      const created = await blogsAPI.createPost(payload);
      const createdObj = (created && (created.post ?? created.data ?? created)) || null;

      if (createdObj) {
        setPosts(prev => [createdObj as BlogPost, ...(Array.isArray(prev) ? prev : [])]);
      } else {
        setPosts(prev => [{ id: `LOCAL_${Date.now()}`, ...(payload as any) } as BlogPost, ...(Array.isArray(prev) ? prev : [])]);
      }

      setShowAIWriter(false);
      toast.success('AI content generated and saved!');
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

  // Defensive: ensure posts array before using array methods
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

  // ---------- UI rendering (kept your layout, only main differences: loading, actions wired to API) ----------
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
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
              <Globe className="text-purple-600" size={24} />
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

      {/* Quick Actions */}
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
            <Globe className="mb-2" size={24} />
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

      {/* Recent Posts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Recent Posts</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => loadPosts()} className="px-3 py-1 text-sm border rounded-md">Refresh</button>
            <button onClick={() => { setShowPostEditor(true); setSelectedPost(null); }} className="bg-blue-600 text-white px-3 py-1 rounded-md">New</button>
          </div>
        </div>

        {loadingPosts ? (
          <div className="text-center py-8">Loading posts...</div>
        ) : postsError ? (
          <div className="text-center text-red-600 py-8">{postsError}</div>
        ) : (
          <div className="space-y-3">
            {postsArray.slice(0, 5).map((post) => (
              <div key={post.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-all">
                <div className="flex items-center space-x-4">
                  {/* dynamic image: if available show <img>, else neutral placeholder (no external static url) */}
                  {post.featuredImage ? (
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
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
                  <button onClick={() => handleDeletePost(post.id!)} className="text-red-600 hover:text-red-700" title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Content Quality Overview (static numbers kept) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Content Quality Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">97.2%</div>
            <div className="text-sm text-gray-600">Avg Plagiarism Score</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '97.2%' }}></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">89.5%</div>
            <div className="text-sm text-gray-600">Avg SEO Score</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '89.5%' }}></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">92.8%</div>
            <div className="text-sm text-gray-600">AI Enhancement Rate</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '92.8%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Content Management (uses API-driven posts list)
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
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
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
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {post.category}
                      </span>
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
                      <span className={`text-xs font-bold ${seoScore > 80 ? 'text-green-600' : seoScore > 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {seoScore}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className={`w-full bg-gray-200 rounded-full h-2 mr-3`}>
                        <div className={`h-2 rounded-full ${seoScore > 80 ? 'bg-green-500' : seoScore > 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${seoScore}%` }}></div>
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

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'content' && renderContentManagement()}
        {activeTab === 'ai-writer' && (
          <AIBlogWriter onGenerate={generateAIContent} isGenerating={isGenerating} />
        )}
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

        {showPostEditor && (
          <BlogPostEditor
            post={selectedPost || undefined}
            onSave={handleSavePost}
            onCancel={() => {
              setShowPostEditor(false);
              setSelectedPost(null);
            }}
            isOpen={showPostEditor}
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
    </div>
  );
};

export default BlogManagement;
