import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Clock, 
  Eye, 
  Heart, 
  MessageSquare, 
  Share, 
  Bookmark,
  Tag,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Send,
  Star,
  Quote,
  TrendingUp,
  Home,
  Building,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  status: string;
  featured: boolean;
  featuredImage: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  comments: number;
  seoTitle: string;
  seoDescription: string;
  readTime: number;
}

interface Comment {
  id: string;
  author: string;
  email: string;
  content: string;
  createdAt: string;
  likes: number;
  replies: Comment[];
}

interface BlogDetailPageProps {
  slug: string;
  onBack: () => void;
}

const BlogDetailPage: React.FC<BlogDetailPageProps> = ({ slug, onBack }) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    content: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch blog post
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Sample blog post data
        const samplePost: BlogPost = {
          id: 'POST001',
          title: 'Top 10 Real Estate Investment Tips for 2025',
          slug: 'top-10-real-estate-investment-tips-2025',
          content: `# Top 10 Real Estate Investment Tips for 2025

Real estate investment continues to be one of the most reliable ways to build long-term wealth. As we enter 2025, the market presents both opportunities and challenges that savvy investors can navigate with the right strategies.

## 1. Research Market Trends Thoroughly

Understanding local market conditions is crucial for making informed investment decisions. Look at:

- **Price trends** over the past 5 years
- **Rental yields** in different neighborhoods  
- **Infrastructure development** plans
- **Population growth** patterns

## 2. Location is Everything

The old adage "location, location, location" remains true. Focus on:

- **Proximity to transportation** hubs
- **School districts** and educational facilities
- **Employment centers** and business districts
- **Future development** plans

## 3. Calculate Your Numbers Carefully

Before making any investment, ensure you understand:

- **Total acquisition costs** (including taxes and fees)
- **Expected rental income**
- **Operating expenses** (maintenance, management, insurance)
- **Cash flow projections**

## 4. Diversify Your Portfolio

Don't put all your eggs in one basket:

- **Mix property types** (residential, commercial, industrial)
- **Spread across locations** to reduce risk
- **Consider REITs** for liquid real estate exposure
- **Balance growth and income** properties

## 5. Leverage Technology and Data

Use modern tools to your advantage:

- **Property analysis software** for quick evaluations
- **Market data platforms** for trend analysis
- **Property management apps** for efficiency
- **Virtual tours** to save time on initial screening

## 6. Build a Strong Network

Relationships are key in real estate:

- **Connect with local agents** who know the market
- **Build relationships with contractors** for renovations
- **Network with other investors** for opportunities
- **Maintain good relationships with tenants**

## 7. Understand Financing Options

Explore different financing strategies:

- **Traditional mortgages** for primary investments
- **Hard money loans** for fix-and-flip projects
- **Private lending** for unique opportunities
- **Partnership structures** to pool resources

## 8. Plan for Property Management

Decide early how you'll manage your properties:

- **Self-management** for hands-on investors
- **Professional management** for passive income
- **Hybrid approach** for selective involvement
- **Technology solutions** for efficiency

## 9. Stay Updated on Legal Requirements

Real estate laws change frequently:

- **Landlord-tenant laws** in your area
- **Tax implications** of your investments
- **Zoning regulations** and restrictions
- **Environmental requirements**

## 10. Have an Exit Strategy

Always plan your exit before you enter:

- **Hold period** expectations
- **Market conditions** for selling
- **Improvement plans** to add value
- **Alternative uses** for the property

## Conclusion

Successful real estate investing in 2025 requires a combination of traditional wisdom and modern tools. By following these ten tips and staying informed about market conditions, you'll be well-positioned to build wealth through real estate.

Remember, every market is different, and what works in one area may not work in another. Always do your due diligence and consider consulting with local real estate professionals before making investment decisions.

---

*Ready to start your real estate investment journey? Contact our expert team for personalized guidance and access to exclusive investment opportunities.*`,
          excerpt: 'Discover the most effective strategies for building wealth through real estate investments in today\'s market.',
          author: 'Sarah Johnson',
          category: 'Investment Guide',
          tags: ['investment', 'tips', '2025', 'wealth building', 'real estate'],
          status: 'published',
          featured: true,
          featuredImage: 'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg',
          publishedAt: '2025-01-15T10:00:00Z',
          createdAt: '2025-01-14T15:30:00Z',
          updatedAt: '2025-01-15T10:00:00Z',
          views: 1245,
          likes: 89,
          comments: 23,
          seoTitle: 'Top 10 Real Estate Investment Tips for 2025 | ResaleExpert',
          seoDescription: 'Learn the best real estate investment strategies for 2025. Expert tips to maximize returns and build wealth through property investments.',
          readTime: 8
        };

        const sampleComments: Comment[] = [
          {
            id: 'COMMENT001',
            author: 'Rajesh Kumar',
            email: 'rajesh@example.com',
            content: 'Excellent article! The tip about diversifying across different property types really resonates with me. I\'ve been focusing only on residential properties, but after reading this, I\'m considering adding some commercial properties to my portfolio.',
            createdAt: '2025-01-16T09:30:00Z',
            likes: 12,
            replies: [
              {
                id: 'REPLY001',
                author: 'Sarah Johnson',
                email: 'sarah@resaleexpert.com',
                content: 'Thank you, Rajesh! Commercial properties can indeed be a great addition to a diversified portfolio. Just make sure to research the commercial market thoroughly as it has different dynamics compared to residential.',
                createdAt: '2025-01-16T14:20:00Z',
                likes: 5,
                replies: []
              }
            ]
          },
          {
            id: 'COMMENT002',
            author: 'Priya Sharma',
            email: 'priya@example.com',
            content: 'Great insights on using technology for property analysis. Can you recommend some specific software or platforms that you find most useful for market data analysis?',
            createdAt: '2025-01-16T11:15:00Z',
            likes: 8,
            replies: []
          },
          {
            id: 'COMMENT003',
            author: 'Amit Patel',
            email: 'amit@example.com',
            content: 'The point about having an exit strategy is so important but often overlooked. I learned this the hard way with my first investment property. Thanks for emphasizing this!',
            createdAt: '2025-01-16T16:45:00Z',
            likes: 15,
            replies: []
          }
        ];

        const sampleRelatedPosts: BlogPost[] = [
          {
            id: 'POST002',
            title: 'Understanding Market Trends in Urban Development',
            slug: 'understanding-market-trends-urban-development',
            content: '',
            excerpt: 'Analyze current market trends and their impact on urban real estate development.',
            author: 'Michael Chen',
            category: 'Market Analysis',
            tags: ['market trends', 'urban development'],
            status: 'published',
            featured: false,
            featuredImage: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
            publishedAt: '2025-01-12T14:00:00Z',
            createdAt: '2025-01-11T09:15:00Z',
            updatedAt: '2025-01-12T14:00:00Z',
            views: 892,
            likes: 67,
            comments: 15,
            seoTitle: 'Urban Development Market Trends 2025',
            seoDescription: 'Comprehensive analysis of urban development trends.',
            readTime: 6
          },
          {
            id: 'POST003',
            title: 'First-Time Homebuyer\'s Complete Guide',
            slug: 'first-time-homebuyer-complete-guide',
            content: '',
            excerpt: 'Everything you need to know about purchasing your first home.',
            author: 'Emily Rodriguez',
            category: 'Home Buying',
            tags: ['first-time buyer', 'home buying'],
            status: 'published',
            featured: false,
            featuredImage: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
            publishedAt: '2025-01-10T11:20:00Z',
            createdAt: '2025-01-10T11:20:00Z',
            updatedAt: '2025-01-13T16:45:00Z',
            views: 654,
            likes: 45,
            comments: 12,
            seoTitle: 'First-Time Homebuyer Guide',
            seoDescription: 'Complete guide for first-time homebuyers.',
            readTime: 12
          }
        ];

        setPost(samplePost);
        setComments(sampleComments);
        setRelatedPosts(sampleRelatedPosts);
      } catch (error) {
        toast.error('Failed to load blog post');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (post) {
      setPost(prev => prev ? {
        ...prev,
        likes: isLiked ? prev.likes - 1 : prev.likes + 1
      } : null);
    }
    toast.success(isLiked ? 'Removed from likes' : 'Added to likes');
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = post?.title || '';
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentForm.name.trim() || !commentForm.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const newComment: Comment = {
        id: `COMMENT${Date.now()}`,
        author: commentForm.name,
        email: commentForm.email,
        content: commentForm.content,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: []
      };

      setComments(prev => [newComment, ...prev]);
      setCommentForm({ name: '', email: '', content: '' });
      setShowCommentForm(false);
      toast.success('Comment posted successfully!');
    } catch (error) {
      toast.error('Failed to post comment');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mb-6 mt-8">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-gray-900 mb-4 mt-6">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-gray-900 mb-3 mt-4">$1</h3>')
      .replace(/^\*\*(.*)\*\*/gim, '<strong class="font-bold">$1</strong>')
      .replace(/^\* (.*$)/gim, '<li class="ml-4">• $1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 mb-2">• $1</li>')
      .replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed mb-4">')
      .replace(/\n/g, '<br>');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Blog Post Not Found</h2>
          <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
          <button
            onClick={onBack}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Blog
            </button>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-lg transition-colors ${
                  isBookmarked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Bookmark size={18} />
              </button>
              <div className="relative group">
                <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  <Share size={18} />
                </button>
                <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 w-full text-left"
                  >
                    <Facebook size={16} className="text-blue-600" />
                    <span>Facebook</span>
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 w-full text-left"
                  >
                    <Twitter size={16} className="text-blue-400" />
                    <span>Twitter</span>
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 w-full text-left"
                  >
                    <Linkedin size={16} className="text-blue-700" />
                    <span>LinkedIn</span>
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 w-full text-left"
                  >
                    <Copy size={16} className="text-gray-600" />
                    <span>Copy Link</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article Header */}
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="relative">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center space-x-2 mb-3">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {post.category}
                </span>
                {post.featured && (
                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Featured
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                {post.title}
              </h1>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Article Meta */}
            <div className="flex flex-wrap items-center justify-between mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center space-x-6 mb-4 md:mb-0">
                <div className="flex items-center space-x-2">
                  <User className="text-gray-400" size={18} />
                  <span className="text-gray-700 font-medium">{post.author}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="text-gray-400" size={18} />
                  <span className="text-gray-600">{formatDate(post.publishedAt)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="text-gray-400" size={18} />
                  <span className="text-gray-600">{post.readTime} min read</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-gray-600">
                  <Eye size={18} />
                  <span>{post.views.toLocaleString()}</span>
                </div>
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-1 transition-colors ${
                    isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  <Heart size={18} className={isLiked ? 'fill-current' : ''} />
                  <span>{post.likes}</span>
                </button>
                <div className="flex items-center space-x-1 text-gray-600">
                  <MessageSquare size={18} />
                  <span>{comments.length}</span>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: `<p class="text-gray-700 leading-relaxed mb-4">${formatContent(post.content)}</p>` 
                }}
              />
            </div>

            {/* Tags */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <Tag className="text-gray-400" size={18} />
                <span className="text-gray-600 font-medium">Tags:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Author Bio */}
            <div className="mt-8 p-6 bg-gray-50 rounded-xl">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{post.author}</h3>
                  <p className="text-gray-600 mb-3">
                    Real estate expert with over 10 years of experience in property investment and market analysis. 
                    Passionate about helping others build wealth through smart real estate decisions.
                  </p>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">Senior Real Estate Analyst</span>
                    <div className="flex items-center space-x-1">
                      <Star className="text-yellow-400 fill-current" size={14} />
                      <span className="text-sm text-gray-600">4.9 (127 reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Comments ({comments.length})
            </h2>
            <button
              onClick={() => setShowCommentForm(!showCommentForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <MessageSquare size={18} />
              <span>Add Comment</span>
            </button>
          </div>

          {/* Comment Form */}
          {showCommentForm && (
            <form onSubmit={handleCommentSubmit} className="mb-8 p-6 bg-gray-50 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={commentForm.name}
                    onChange={(e) => setCommentForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={commentForm.email}
                    onChange={(e) => setCommentForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment *
                </label>
                <textarea
                  value={commentForm.content}
                  onChange={(e) => setCommentForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your thoughts..."
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCommentForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Send size={16} />
                  <span>Post Comment</span>
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="text-blue-600" size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{comment.author}</h4>
                      <span className="text-sm text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3 leading-relaxed">{comment.content}</p>
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors">
                        <ThumbsUp size={14} />
                        <span>{comment.likes}</span>
                      </button>
                      <button className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                        Reply
                      </button>
                    </div>

                    {/* Replies */}
                    {comment.replies.length > 0 && (
                      <div className="mt-4 ml-6 space-y-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="text-gray-600" size={14} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h5 className="font-medium text-gray-900 text-sm">{reply.author}</h5>
                                <span className="text-xs text-gray-500">
                                  {formatDate(reply.createdAt)}
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed">{reply.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {comments.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No comments yet</h3>
              <p className="text-gray-600 mb-4">Be the first to share your thoughts!</p>
              <button
                onClick={() => setShowCommentForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Write a Comment
              </button>
            </div>
          )}
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost) => (
                <div
                  key={relatedPost.id}
                  className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <img
                    src={relatedPost.featuredImage}
                    alt={relatedPost.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {relatedPost.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {relatedPost.readTime} min read
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{relatedPost.author}</span>
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-1">
                          <Eye size={12} />
                          <span>{relatedPost.views}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Heart size={12} />
                          <span>{relatedPost.likes}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Your Real Estate Journey?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Get expert guidance and access to exclusive property listings. Our team is here to help you make informed decisions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2">
              <Home size={18} />
              <span>Browse Properties</span>
            </button>
            <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center space-x-2">
              <Building size={18} />
              <span>Get Expert Consultation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;