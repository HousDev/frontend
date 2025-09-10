import React, { useState } from 'react';
import { Calendar, User, ArrowRight, Search, Tag, Clock, Eye, Heart, MessageSquare, TrendingUp, Star, Filter } from 'lucide-react';
import BlogDetailPage from './BlogDetailPage';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  image: string;
  tags: string[];
  views?: number;
  likes?: number;
  comments?: number;
  featured?: boolean;
}

const BlogsPage: React.FC = ({ onPageChange }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('newest');

  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: "Top 10 Real Estate Investment Tips for 2025",
      excerpt: "Discover the most effective strategies for building wealth through real estate investments in today's market.",
      content: "Real estate investment continues to be one of the most reliable ways to build long-term wealth...",
      author: "Sarah Johnson",
      date: "2025-01-15",
      category: "Investment",
      readTime: "5 min read",
      image: "https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg",
      tags: ["Investment", "Tips", "2025"],
      views: 1245,
      likes: 89,
      comments: 23,
      featured: true
    },
    {
      id: 2,
      title: "Understanding Market Trends in Urban Development",
      excerpt: "Analyze current market trends and their impact on urban real estate development projects.",
      content: "Urban development is experiencing unprecedented changes as cities adapt to new demographics...",
      author: "Michael Chen",
      date: "2025-01-12",
      category: "Market Analysis",
      readTime: "7 min read",
      image: "https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg",
      tags: ["Market", "Urban", "Development"],
      views: 892,
      likes: 67,
      comments: 15,
      featured: false
    },
    {
      id: 3,
      title: "First-Time Homebuyer's Complete Guide",
      excerpt: "Everything you need to know about purchasing your first home, from financing to closing.",
      content: "Buying your first home is an exciting milestone, but it can also feel overwhelming...",
      author: "Emily Rodriguez",
      date: "2025-01-10",
      category: "Buying Guide",
      readTime: "10 min read",
      image: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg",
      tags: ["First-time", "Buying", "Guide"],
      views: 654,
      likes: 45,
      comments: 12
    },
    {
      id: 4,
      title: "Sustainable Building Practices in Modern Construction",
      excerpt: "Explore eco-friendly construction methods and their benefits for both environment and cost savings.",
      content: "Sustainable building practices are no longer just a trend—they're becoming the standard...",
      author: "David Thompson",
      date: "2025-01-08",
      category: "Construction",
      readTime: "6 min read",
      image: "https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg",
      tags: ["Sustainable", "Construction", "Green"],
      views: 432,
      likes: 34,
      comments: 8
    },
    {
      id: 5,
      title: "Property Management Best Practices",
      excerpt: "Learn effective strategies for managing rental properties and maximizing your investment returns.",
      content: "Successful property management requires a combination of business acumen and people skills...",
      author: "Lisa Wang",
      date: "2025-01-05",
      category: "Property Management",
      readTime: "8 min read",
      image: "https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg",
      tags: ["Management", "Rental", "Investment"],
      views: 789,
      likes: 56,
      comments: 19
    },
    {
      id: 6,
      title: "Commercial Real Estate Outlook for 2025",
      excerpt: "Industry experts share insights on commercial real estate trends and opportunities for the year ahead.",
      content: "The commercial real estate sector is poised for significant changes in 2025...",
      author: "Robert Kim",
      date: "2025-01-03",
      category: "Commercial",
      readTime: "9 min read",
      image: "https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg",
      tags: ["Commercial", "2025", "Outlook"],
      views: 1023,
      likes: 78,
      comments: 25
    }
  ];

  const categories = ['All', 'Investment', 'Market Analysis', 'Buying Guide', 'Construction', 'Property Management', 'Commercial'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'trending', label: 'Trending' }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'popular':
        return (b.views || 0) - (a.views || 0);
      case 'trending':
        return (b.likes || 0) - (a.likes || 0);
      default: // newest
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  const featuredPost = blogPosts[0];

  const handlePostClick = (slug: string) => {
    setSelectedPost(slug);
  };

  const handleBackToBlog = () => {
    setSelectedPost(null);
  };

  if (selectedPost) {
    return <BlogDetailPage slug={selectedPost} onBack={handleBackToBlog} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Real Estate Insights & News
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Stay informed with the latest trends, tips, and expert analysis in the real estate industry
            </p>
          </div>
        </div>
      </div>

      {/* Featured Post */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img 
                src={featuredPost.image} 
                alt={featuredPost.title}
                className="w-full h-64 md:h-full object-cover"
              />
            </div>
            <div className="md:w-1/2 p-8">
              <div className="flex items-center mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  Featured
                </span>
                <span className="ml-3 text-gray-500 text-sm">{featuredPost.category}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {featuredPost.title}
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {featuredPost.author}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(featuredPost.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {featuredPost.readTime}
                  </div>
                </div>
                <button 
                  onClick={() => handlePostClick(featuredPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                  className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Read More <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedPosts.slice(1).map((post) => (
            <article 
              key={post.id} 
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer relative"
              onClick={() => handlePostClick(post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
            >
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-3 left-3 flex space-x-2">
                <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                  {post.category}
                </span>
                {post.featured && (
                  <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Featured
                  </span>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    {post.readTime}
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Eye size={14} />
                      <span>{post.views}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Heart size={14} />
                      <span>{post.likes}</span>
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span key={tag} className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {post.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{post.author}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(post.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <MessageSquare size={12} />
                        <span>{post.comments} comments</span>
                      </span>
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

        {/* Newsletter Subscription */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Stay Updated with Our Newsletter
          </h3>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Get the latest real estate insights, market updates, and expert tips delivered directly to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
            />
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogsPage;