import React, { useState, useCallback } from 'react';
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
  Clock,
  Users,
  Heart,
  MessageSquare,
  Filter,
  Calendar,
  Star,
  CheckCircle,
  AlertTriangle,
  Zap,
  Brain,
  Wand2,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Tag,
  Link,
  Image,
  Type,
  Shield,
  Target,
  Crown,
  Sparkles,
  X,
  Send,
  Save
} from 'lucide-react';
import { BlogPost, RSSSource, BlogCategory, BlogStatus } from '../../types/blog';





import toast from 'react-hot-toast';
import BlogPostEditor from '@/components/blogManager/BlogPostEditor';
import AIBlogWriter from '@/components/blogManager/AIBlogWriter';
import RSSSourceManager from '@/components/blogManager/RSSSourceManager';
import SocialMediaManager from '@/components/blogManager/SocialMediaManager';
import BlogAnalytics from '@/components/blogManager/BlogAnalytics';

const BlogManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [posts, setPosts] = useState<BlogPost[]>([
    {
      id: 'POST001',
      title: 'Top 10 Real Estate Investment Tips for 2025',
      slug: 'top-10-real-estate-investment-tips-2025',
      content: '# Real Estate Investment Guide\n\nComprehensive guide to property investment...',
      excerpt: 'Discover the most effective strategies for building wealth through real estate investments.',
      author: 'Admin',
      category: 'Investment',
      tags: ['investment', 'tips', '2025', 'wealth building'],
      status: 'published',
      featured: true,
      featuredImage: 'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg',
      publishedAt: '2025-01-15T10:00:00Z',
      createdAt: '2025-01-14T15:30:00Z',
      updatedAt: '2025-01-15T10:00:00Z',
      views: 1245,
      likes: 89,
      comments: 23,
      seoTitle: 'Top 10 Real Estate Investment Tips for 2025',
      seoDescription: 'Learn the best investment strategies for 2025.',
      readTime: 8
    },
    {
      id: 'POST002',
      title: 'Mumbai Property Market Analysis Q1 2025',
      slug: 'mumbai-property-market-analysis-q1-2025',
      content: '# Market Analysis\n\nDetailed analysis of Mumbai property market...',
      excerpt: 'Comprehensive analysis of Mumbai property market trends and predictions.',
      author: 'Market Analyst',
      category: 'Market Analysis',
      tags: ['mumbai', 'market', 'analysis', '2025'],
      status: 'published',
      featured: false,
      featuredImage: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
      publishedAt: '2025-01-12T14:00:00Z',
      createdAt: '2025-01-12T09:15:00Z',
      updatedAt: '2025-01-12T14:00:00Z',
      views: 892,
      likes: 67,
      comments: 15,
      seoTitle: 'Mumbai Property Market Analysis Q1 2025',
      seoDescription: 'Detailed Mumbai property market analysis.',
      readTime: 6
    }
  ]);
  
  const [rssources, setRSSources] = useState<RSSSource[]>([
    {
      id: 'RSS001',
      name: 'Economic Times Real Estate',
      url: 'https://economictimes.indiatimes.com/rssfeeds/wealth/real-estate.cms',
      category: 'Market Analysis',
      active: true,
      lastSync: '2025-01-15T08:00:00Z',
      totalPosts: 45,
      newPosts: 3,
      autoPublish: false,
      syncFrequency: 'daily'
    },
    {
      id: 'RSS002', 
      name: 'Housing.com News',
      url: 'https://housing.com/news/feed/',
      category: 'Property News',
      active: true,
      lastSync: '2025-01-15T06:30:00Z',
      totalPosts: 32,
      newPosts: 2,
      autoPublish: true,
      syncFrequency: 'daily'
    }
  ]);

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

  const tabs = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: BarChart3,
      description: 'Overview and quick actions'
    },
    { 
      id: 'content', 
      label: 'Content Management', 
      icon: FileText,
      description: 'Manage all blog posts'
    },
    { 
      id: 'ai-writer', 
      label: 'AI Content Studio', 
      icon: Bot,
      description: 'Create content with AI'
    },
    { 
      id: 'ai-tools', 
      label: 'AI Enhancement Tools', 
      icon: Wrench,
      description: 'Enhance existing content'
    },
    { 
      id: 'rss', 
      label: 'RSS Sources', 
      icon: Globe,
      description: 'Auto-import from RSS feeds'
    },
    { 
      id: 'social', 
      label: 'Social Media', 
      icon: Share2,
      description: 'Schedule social posts'
    },
    { 
      id: 'seo', 
      label: 'SEO Tools', 
      icon: Target,
      description: 'Optimize for search engines'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: TrendingUp,
      description: 'Performance insights'
    }
  ];

  // Generate AI Content
  const generateAIContent = async (prompt: string, keywords: string[]) => {
    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const aiGeneratedPost: BlogPost = {
        id: `POST_${Date.now()}`,
        title: prompt,
        slug: prompt.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        content: `# ${prompt}

## Introduction

This comprehensive guide provides detailed insights into ${prompt.toLowerCase()}. Our expert analysis covers all essential aspects you need to know for making informed decisions in today's dynamic real estate market.

## Market Overview

The current market presents unique opportunities and challenges. Understanding these factors is crucial for:

- **Investment Planning**: Strategic property portfolio development
- **Risk Management**: Identifying and mitigating potential risks  
- **Timing Decisions**: Optimal entry and exit strategies
- **Location Analysis**: Choosing high-growth potential areas

## Key Insights

### Current Market Trends

Recent market analysis shows significant developments in property values, demand patterns, and investment opportunities. Key factors driving these changes include:

1. **Infrastructure Development**: New metro lines and connectivity projects
2. **Economic Growth**: Rising employment and income levels
3. **Policy Changes**: Government initiatives supporting real estate
4. **Technology Integration**: PropTech innovations changing the landscape

### Investment Strategies

Successful property investment requires a multifaceted approach:

- **Diversification**: Spread investments across different property types and locations
- **Due Diligence**: Thorough research before making investment decisions
- **Long-term Vision**: Focus on sustainable growth rather than quick gains
- **Expert Consultation**: Work with experienced real estate professionals

## Recommendations

Based on comprehensive market analysis, we recommend:

### For First-time Investors
- Start with well-located residential properties
- Focus on ready-to-move-in properties
- Consider properties near transportation hubs
- Prioritize legal compliance and clear titles

### For Experienced Investors  
- Explore emerging micro-markets
- Consider commercial property investments
- Look into real estate investment trusts (REITs)
- Diversify across different asset classes

## Future Outlook

The real estate market continues to evolve with changing demographics, technology adoption, and economic factors. Staying informed about these trends is essential for making successful investment decisions.

## Conclusion

${prompt} requires careful consideration of multiple factors. Success in real estate depends on thorough research, proper timing, and strategic planning. By following expert guidance and staying updated with market trends, investors can achieve their financial goals.

---

*Keywords: ${keywords.join(', ')}*

*This content was generated using advanced AI to provide comprehensive insights. For personalized advice, consult with our real estate experts.*`,
        excerpt: `Comprehensive guide to ${prompt.toLowerCase()} with expert insights and actionable strategies.`,
        author: 'AI Assistant',
        category: 'Real Estate',
        tags: [...keywords, 'ai-generated', 'guide'],
        status: 'draft',
        featured: false,
        featuredImage: 'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg',
        publishedAt: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        likes: 0, 
        comments: 0,
        seoTitle: `${prompt} | Complete Guide | ResaleExpert`,
        seoDescription: `Learn about ${prompt.toLowerCase()}. Expert insights and strategies for real estate success.`,
        readTime: Math.ceil(1200 / 200) // Approximate read time
      };

      setPosts(prev => [aiGeneratedPost, ...prev]);
      setShowAIWriter(false);
      toast.success('AI content generated successfully!');
      
    } catch (error) {
      toast.error('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  // Other utility functions
  const getQualityScore = (content: string): { overall: number; seo: number; readability: number } => {
    const seoScore = content.includes('#') && content.includes('##') ? 85 : 65;
    const readabilityScore = content.length > 500 ? 88 : 75;
    const overall = Math.round((seoScore + readabilityScore) / 2);
    
    return { overall, seo: seoScore, readability: readabilityScore };
  };

  const getPlagiarismScore = (content: string): number => {
    return Math.floor(Math.random() * 5) + 95; // Simulate 95-100% original
  };

  const handleSavePost = (postData: Partial<BlogPost>) => {
    if (selectedPost) {
      setPosts(prev => prev.map(p => 
        p.id === selectedPost.id 
          ? { ...p, ...postData, updatedAt: new Date().toISOString() }
          : p
      ));
      toast.success('Post updated successfully!');
    } else {
      const newPost: BlogPost = {
        id: `POST_${Date.now()}`,
        slug: postData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        likes: 0,
        comments: 0,
        readTime: Math.ceil((postData.content?.length || 0) / 200),
        ...postData
      } as BlogPost;
      
      setPosts(prev => [newPost, ...prev]);
      toast.success('Post created successfully!');
    }
    
    setShowPostEditor(false);
    setSelectedPost(null);
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast.success('Post deleted successfully!');
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setSelectedPost(post);
    setShowPostEditor(true);
  };

  const rewriteWithAI = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { 
              ...p, 
              content: p.content + '\n\n*[AI Enhanced: Content improved for better readability and SEO]*',
              updatedAt: new Date().toISOString()
            }
          : p
      ));
      
      toast.success('Content rewritten with AI!');
    } catch (error) {
      toast.error('AI rewrite failed');
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || post.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories: BlogCategory[] = [
    'Real Estate', 'Investment', 'Market Analysis', 'Legal', 'Home Buying', 
    'Home Selling', 'Property News', 'Construction', 'Finance'
  ];

  const statuses: BlogStatus[] = ['draft', 'published', 'archived'];

  // Dashboard Tab
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
              <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
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
                {posts.reduce((acc, post) => acc + post.views, 0).toLocaleString()}
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
                {posts.reduce((acc, post) => acc + post.likes + post.comments, 0)}
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
            onClick={() => setShowPostEditor(true)}
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
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Posts</h3>
        <div className="space-y-3">
          {posts.slice(0, 5).map((post) => (
            <div key={post.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-all">
              <div className="flex items-center space-x-4">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{post.title}</h4>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Eye size={12} />
                      <span>{post.views}</span>
                    </span>
                    <span>{post.category}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      post.status === 'published' ? 'bg-green-100 text-green-800' :
                      post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {post.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditPost(post)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Quality Overview */}
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

  // Content Management Tab
  const renderContentManagement = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
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

      {/* Posts List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">All Posts ({filteredPosts.length})</h3>
          <button
            onClick={() => setShowPostEditor(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>New Post</span>
          </button>
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
                const qualityScore = getQualityScore(post.content);
                const plagiarismScore = getPlagiarismScore(post.content);
                
                return (
                  <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{post.title}</h4>
                          <p className="text-xs text-gray-600">{post.author} • {new Date(post.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {post.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        post.status === 'published' ? 'bg-green-100 text-green-800' :
                        post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs text-gray-600">
                        <div>{post.views} views</div>
                        <div>{post.likes} likes</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <div className="text-xs text-gray-600">SEO:</div>
                          <div className={`text-xs font-medium ${qualityScore.seo > 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {qualityScore.seo}%
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-xs text-gray-600">Original:</div>
                          <div className="text-xs font-medium text-green-600">{plagiarismScore}%</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditPost(post)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => rewriteWithAI(post.id)}
                          className="text-purple-600 hover:text-purple-700 p-1"
                          title="AI Rewrite"
                        >
                          <Wand2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
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

  // AI Tools Tab
  const renderAITools = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">AI Enhancement Tools</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plagiarism Checker */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="text-green-600" size={20} />
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

          {/* SEO Optimizer */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="text-blue-600" size={20} />
              </div>
              <h4 className="font-semibold text-gray-900">SEO Optimizer</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Automatically optimize content for search engines
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Avg SEO Score</span>
                <span className="font-bold text-blue-600">89.5%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Posts Optimized</span>
                <span className="font-bold text-blue-600">{posts.length}</span>
              </div>
            </div>
            <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Optimize All
            </button>
          </div>

          {/* Content Enhancer */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="text-purple-600" size={20} />
              </div>
              <h4 className="font-semibold text-gray-900">AI Enhancer</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Improve readability, tone, and engagement
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Enhancement Rate</span>
                <span className="font-bold text-purple-600">92.8%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Improved Posts</span>
                <span className="font-bold text-purple-600">{Math.floor(posts.length * 0.8)}</span>
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

  // SEO Tools Tab
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
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h5 className="font-medium text-green-900 mb-2">Ranking Opportunities</h5>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>"property market trends"</span>
                    <span className="font-bold text-green-600">Low Competition</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>"real estate tips 2025"</span>
                    <span className="font-bold text-green-600">High Potential</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Content Optimization</h4>
            <div className="space-y-4">
              {posts.slice(0, 3).map((post) => {
                const seoScore = getQualityScore(post.content).seo;
                return (
                  <div key={post.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900 text-sm">{post.title}</h5>
                      <span className={`text-xs font-bold ${
                        seoScore > 80 ? 'text-green-600' : seoScore > 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {seoScore}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className={`w-full bg-gray-200 rounded-full h-2 mr-3`}>
                        <div 
                          className={`h-2 rounded-full ${
                            seoScore > 80 ? 'bg-green-500' : seoScore > 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${seoScore}%` }}
                        ></div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-xs">
                        Optimize
                      </button>
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Management Center</h1>
          <p className="text-gray-600">Comprehensive blog management with AI-powered tools</p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors whitespace-nowrap min-w-0 ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'content' && renderContentManagement()}
        {activeTab === 'ai-writer' && (
          <AIBlogWriter
            onGenerate={generateAIContent}
            isGenerating={isGenerating}
          />
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
        {activeTab === 'social' && (
          <SocialMediaManager posts={posts} />
        )}
        {activeTab === 'seo' && renderSEOTools()}
        {activeTab === 'analytics' && <BlogAnalytics posts={posts} />}

        {/* Modals */}
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
            posts={posts}
            isOpen={true}
            onClose={() => setShowSocialManager(false)}
          />
        )}
      </div>
    </div>
  );
};

export default BlogManagement;