import React, { useState } from 'react';
import { 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  X, 
  Send, 
  Calendar, 
  Clock, 
  Settings,
  Eye,
  Heart,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Users,
  Globe,
  Image,
  Type,
  Target,
  CheckCircle,
  AlertCircle,
  Copy,
  Plus
} from 'lucide-react';
import { BlogPost } from '../../types/blog';
import toast from 'react-hot-toast';

interface SocialMediaManagerProps {
  isOpen?: boolean;
  onClose?: () => void;
  posts: BlogPost[];
}

interface SocialMediaPost {
  id: string;
  blogPostId: string;
  platform: string;
  content: string;
  scheduledDate: string;
  status: 'scheduled' | 'posted' | 'failed';
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    clicks: number;
  };
  imageUrl?: string;
}

interface PlatformConfig {
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  characterLimit: number;
  features: string[];
  connected: boolean;
}

const SocialMediaManager: React.FC<SocialMediaManagerProps> = ({ 
  isOpen, 
  onClose, 
  posts 
}) => {
  const [activeTab, setActiveTab] = useState('posts');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    platform: 'facebook',
    content: '',
    scheduledDate: '',
    scheduledTime: '',
    includeImage: true,
    customImage: ''
  });

  const [socialPosts, setSocialPosts] = useState<SocialMediaPost[]>([
    {
      id: 'SP001',
      blogPostId: 'POST001',
      platform: 'facebook',
      content: '🏠 Top 10 Real Estate Investment Tips for 2025\n\nDiscover proven strategies to build wealth through property investments. Our latest blog covers everything from market research to financing options.\n\n#RealEstate #Investment #Mumbai #PropertyTips #WealthBuilding',
      scheduledDate: '2025-01-16T10:00:00Z',
      status: 'posted',
      engagement: {
        likes: 45,
        shares: 12,
        comments: 8,
        clicks: 234
      },
      imageUrl: 'https://images.pexels.com/photos/280229/pexels-photo-280229.jpeg'
    },
    {
      id: 'SP002',
      blogPostId: 'POST002',
      platform: 'twitter',
      content: '📈 Mumbai property market sees 15% growth in western suburbs!\n\nKey drivers: Metro connectivity, IT expansions, premium retail developments\n\nRead our full analysis 👇\n\n#MumbaiRealEstate #PropertyMarket #Investment',
      scheduledDate: '2025-01-17T14:30:00Z',
      status: 'scheduled',
      engagement: {
        likes: 0,
        shares: 0,
        comments: 0,
        clicks: 0
      }
    }
  ]);

  const platforms: PlatformConfig[] = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'blue',
      characterLimit: 2200,
      features: ['Long-form posts', 'Image carousels', 'Video content', 'Event promotion'],
      connected: true
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'blue',
      characterLimit: 280,
      features: ['Hashtag trending', 'Real-time updates', 'Thread posting', 'Quick engagement'],
      connected: true
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'blue',
      characterLimit: 3000,
      features: ['Professional audience', 'Industry insights', 'B2B networking', 'Thought leadership'],
      connected: false
    },
    {
      name: 'Instagram',
      icon: Instagram,
      color: 'pink',
      characterLimit: 2200,
      features: ['Visual content', 'Stories & Reels', 'Hashtag discovery', 'Young audience'],
      connected: false
    }
  ];

  const tabs = [
    { id: 'posts', label: 'Social Posts', icon: Share2 },
    { id: 'schedule', label: 'Schedule Posts', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Platform Settings', icon: Settings }
  ];

  const generateSocialContent = (post: BlogPost, platform: string) => {
    const baseUrl = 'https://resaleexpert.in/blog';
    const postUrl = `${baseUrl}/${post.slug}`;
    
    const templates = {
      facebook: `🏠 ${post.title}

${post.excerpt}

Read the full article to discover expert insights and actionable strategies for your real estate journey.

👆 Link in comments

#RealEstate #Property #Mumbai #Investment #${post.category.replace(/\s/g, '')}`,

      twitter: `📊 ${post.title}

${post.excerpt.substring(0, 120)}...

Read more 👉 ${postUrl}

#RealEstate #Property #${post.category.replace(/\s/g, '')}`,

      linkedin: `Professional Insights: ${post.title}

${post.excerpt}

As real estate professionals, staying informed about market trends and investment strategies is crucial for success. This comprehensive analysis provides valuable insights for:

✅ Property investors looking for high-ROI opportunities
✅ First-time homebuyers navigating the market
✅ Real estate agents serving clients better

Read the full analysis: ${postUrl}

#RealEstate #PropertyInvestment #MarketAnalysis #MumbaiRealEstate`,

      instagram: `🏡 ${post.title}

${post.excerpt}

Swipe 👉 for key insights!

💡 Pro Tip: Save this post for your property research

Link in bio for full article

#RealEstate #Property #Mumbai #Investment #PropertyTips #HomeSearch #${post.category.replace(/\s/g, '')}`
    };

    return templates[platform as keyof typeof templates] || templates.facebook;
  };

  const handleSchedulePost = () => {
    if (!selectedPost || !scheduleData.platform || !scheduleData.scheduledDate) {
      toast.error('Please fill all required fields');
      return;
    }

    const newSocialPost: SocialMediaPost = {
      id: `SP${Date.now()}`,
      blogPostId: String(selectedPost.id),
      platform: scheduleData.platform,
      content: scheduleData.content || generateSocialContent(selectedPost, scheduleData.platform),
      scheduledDate: new Date(`${scheduleData.scheduledDate}T${scheduleData.scheduledTime}`).toISOString(),
      status: 'scheduled',
      engagement: {
        likes: 0,
        shares: 0,
        comments: 0,
        clicks: 0
      },
      imageUrl: scheduleData.includeImage ? (scheduleData.customImage || selectedPost.featuredImage) : undefined
    };

    setSocialPosts(prev => [newSocialPost, ...prev]);
    setShowScheduleModal(false);
    setSelectedPost(null);
    setScheduleData({
      platform: 'facebook',
      content: '',
      scheduledDate: '',
      scheduledTime: '',
      includeImage: true,
      customImage: ''
    });
    toast.success('Post scheduled successfully!');
  };

  const handlePostNow = (post: BlogPost, platform: string) => {
    const content = generateSocialContent(post, platform);
    
    // Simulate posting to social media
    const newSocialPost: SocialMediaPost = {
      id: `SP${Date.now()}`,
      blogPostId: String(post.id),
      platform: platform,
      content: content,
      scheduledDate: new Date().toISOString(),
      status: 'posted',
      engagement: {
        likes: Math.floor(Math.random() * 50),
        shares: Math.floor(Math.random() * 20),
        comments: Math.floor(Math.random() * 15),
        clicks: Math.floor(Math.random() * 200) + 50
      },
      imageUrl: post.featuredImage
    };

    setSocialPosts(prev => [newSocialPost, ...prev]);
    toast.success(`Posted to ${platform} successfully!`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Content copied to clipboard!');
  };

  const renderPostsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Published Blog Posts</h3>
        
        <div className="grid grid-cols-1 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h4>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {post.category}
                    </span>
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Eye size={14} />
                        <span>{post.views}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Heart size={14} />
                        <span>{post.likes}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageSquare size={14} />
                        <span>{post.comments}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {platforms.filter(p => p.connected).map((platform) => {
                        const Icon = platform.icon;
                        const existingPost = socialPosts.find(sp => sp.blogPostId === post.id && sp.platform.toLowerCase() === platform.name.toLowerCase());
                        
                        return (
                          <button
                            key={platform.name}
                            onClick={() => existingPost ? null : handlePostNow(post, platform.name.toLowerCase())}
                            disabled={!!existingPost}
                            className={`p-2 rounded-lg transition-colors flex items-center space-x-1 ${
                              existingPost 
                                ? 'bg-green-100 text-green-600 cursor-default' 
                                : `hover:bg-${platform.color}-100 text-${platform.color}-600 border border-${platform.color}-200`
                            }`}
                            title={existingPost ? 'Already posted' : `Post to ${platform.name}`}
                          >
                            <Icon size={16} />
                            {existingPost && <CheckCircle size={12} />}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedPost(post);
                        setShowScheduleModal(true);
                        setScheduleData(prev => ({
                          ...prev,
                          content: generateSocialContent(post, prev.platform)
                        }));
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Schedule Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <Share2 className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Published Posts</h3>
            <p className="text-gray-600">Publish some blog posts to start sharing on social media</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderScheduleTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Scheduled Posts</h3>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Schedule Post</span>
          </button>
        </div>

        <div className="space-y-4">
          {socialPosts
            .filter(sp => sp.status === 'scheduled')
            .map((socialPost) => {
              const blogPost = posts.find(p => p.id === socialPost.blogPostId);
              const platform = platforms.find(p => p.name.toLowerCase() === socialPost.platform);
              const Icon = platform?.icon || Share2;
              
              return (
                <div key={socialPost.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 bg-${platform?.color || 'gray'}-100 rounded-lg`}>
                      <Icon className={`text-${platform?.color || 'gray'}-600`} size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">{blogPost?.title}</h4>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                          Scheduled
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">{socialPost.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{new Date(socialPost.scheduledDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{new Date(socialPost.scheduledDate).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Globe size={14} />
                          <span className="capitalize">{socialPost.platform}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {socialPosts.filter(sp => sp.status === 'scheduled').length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Scheduled Posts</h3>
            <p className="text-gray-600 mb-4">Schedule your blog posts for social media sharing</p>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Schedule Your First Post
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Share2 className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Total Posts</h3>
              <p className="text-2xl font-bold text-blue-600">{socialPosts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Total Engagement</h3>
              <p className="text-2xl font-bold text-green-600">
                {socialPosts.reduce((acc, sp) => acc + sp.engagement.likes + sp.engagement.shares + sp.engagement.comments, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Users className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Total Clicks</h3>
              <p className="text-2xl font-bold text-purple-600">
                {socialPosts.reduce((acc, sp) => acc + sp.engagement.clicks, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Target className="text-orange-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Avg. Engagement</h3>
              <p className="text-2xl font-bold text-orange-600">12.5%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Performance by Platform</h3>
        
        <div className="space-y-4">
          {platforms.filter(p => p.connected).map((platform) => {
            const platformPosts = socialPosts.filter(sp => sp.platform.toLowerCase() === platform.name.toLowerCase());
            const totalEngagement = platformPosts.reduce((acc, sp) => 
              acc + sp.engagement.likes + sp.engagement.shares + sp.engagement.comments, 0
            );
            const Icon = platform.icon;

            return (
              <div key={platform.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon className={`text-${platform.color}-600`} size={24} />
                  <div>
                    <h4 className="font-semibold text-gray-900">{platform.name}</h4>
                    <p className="text-sm text-gray-600">{platformPosts.length} posts</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{totalEngagement}</div>
                  <div className="text-sm text-gray-600">Total engagement</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Platform Connections</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <div key={platform.name} className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Icon className={`text-${platform.color}-600`} size={24} />
                    <div>
                      <h4 className="font-semibold text-gray-900">{platform.name}</h4>
                      <p className="text-sm text-gray-600">Character limit: {platform.characterLimit}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${
                      platform.connected ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <span className={`text-sm font-medium ${
                      platform.connected ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {platform.connected ? 'Connected' : 'Not Connected'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {platform.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="text-green-500" size={14} />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    platform.connected
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : `bg-${platform.color}-600 text-white hover:bg-${platform.color}-700`
                  }`}
                >
                  {platform.connected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
            <Share2 className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Social Media Management</h2>
            <p className="text-gray-600">Automate and schedule your blog content across social platforms</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Share2 className="text-blue-600" size={20} />
              <div>
                <div className="text-xl font-bold text-blue-600">{socialPosts.filter(sp => sp.status === 'posted').length}</div>
                <div className="text-sm text-blue-700">Posts Shared</div>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="text-green-600" size={20} />
              <div>
                <div className="text-xl font-bold text-green-600">{socialPosts.filter(sp => sp.status === 'scheduled').length}</div>
                <div className="text-sm text-green-700">Scheduled</div>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="text-purple-600" size={20} />
              <div>
                <div className="text-xl font-bold text-purple-600">
                  {socialPosts.reduce((acc, sp) => acc + sp.engagement.clicks, 0)}
                </div>
                <div className="text-sm text-purple-700">Total Clicks</div>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Users className="text-orange-600" size={20} />
              <div>
                <div className="text-xl font-bold text-orange-600">
                  {socialPosts.reduce((acc, sp) => acc + sp.engagement.likes + sp.engagement.shares, 0)}
                </div>
                <div className="text-sm text-orange-700">Engagement</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
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
      {activeTab === 'posts' && renderPostsTab()}
      {activeTab === 'schedule' && renderScheduleTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}
      {activeTab === 'settings' && renderSettingsTab()}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Schedule Social Media Post</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Blog Post</label>
                <select
                  value={selectedPost?.id || ''}
                  onChange={(e) => {
                    const post = posts.find(p => p.id === e.target.value);
                    setSelectedPost(post || null);
                    if (post) {
                      setScheduleData(prev => ({
                        ...prev,
                        content: generateSocialContent(post, prev.platform)
                      }));
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a blog post</option>
                  {posts.map(post => (
                    <option key={post.id} value={post.id}>{post.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Platform</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {platforms.filter(p => p.connected).map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <button
                        key={platform.name}
                        onClick={() => {
                          setScheduleData(prev => ({ ...prev, platform: platform.name.toLowerCase() }));
                          if (selectedPost) {
                            setScheduleData(prev => ({
                              ...prev,
                              content: generateSocialContent(selectedPost, platform.name.toLowerCase())
                            }));
                          }
                        }}
                        className={`p-3 border-2 rounded-lg transition-colors ${
                          scheduleData.platform === platform.name.toLowerCase()
                            ? `border-${platform.color}-500 bg-${platform.color}-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`mx-auto mb-2 text-${platform.color}-600`} size={24} />
                        <div className="text-sm font-medium text-gray-900">{platform.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={scheduleData.scheduledDate}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={scheduleData.scheduledTime}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Post Content</label>
                <div className="relative">
                  <textarea
                    value={scheduleData.content}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, content: e.target.value }))}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-12"
                    placeholder="Your social media post content..."
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(scheduleData.content)}
                    className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {scheduleData.content.length} / {platforms.find(p => p.name.toLowerCase() === scheduleData.platform)?.characterLimit || 2200} characters
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={scheduleData.includeImage}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, includeImage: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include featured image</span>
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchedulePost}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Calendar size={18} />
                  <span>Schedule Post</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return isOpen !== undefined ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Social Media Management</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  ) : renderContent();
};

export default SocialMediaManager;