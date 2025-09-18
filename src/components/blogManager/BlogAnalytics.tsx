// src/components/blogManager/BlogAnalytics.tsx
import React from 'react';
import { BarChart, Users, Eye, TrendingUp, Calendar } from 'lucide-react';
import { BlogPost as BlogPostType } from '@/types/blog'; // <-- use the canonical type

interface BlogAnalyticsProps {
  posts: BlogPostType[];
}

const BlogAnalytics: React.FC<BlogAnalyticsProps> = ({ posts }) => {
  const totalPosts = posts.length;
  const publishedPosts = posts.filter(post => post.status === 'published').length;
  const draftPosts = posts.filter(post => post.status === 'draft').length;
  const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
  const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (post.comments || 0), 0);

  type Stat = {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color: string;
    bg: string;
  };

  const stats: Stat[] = [
    {
      title: 'Total Posts',
      value: totalPosts,
      icon: BarChart,
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    {
      title: 'Published',
      value: publishedPosts,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    {
      title: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    {
      title: 'Engagement',
      value: totalLikes + totalComments,
      icon: Users,
      color: 'text-orange-600',
      bg: 'bg-orange-100'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <BarChart className="w-6 h-6 text-gray-700" />
        <h2 className="text-2xl font-bold text-gray-800">Blog Analytics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Post Status Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Published</span>
              <span className="font-semibold text-green-600">{publishedPosts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Drafts</span>
              <span className="font-semibold text-orange-600">{draftPosts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total</span>
              <span className="font-semibold text-gray-800">{totalPosts}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {posts.slice(0, 5).map((post) => (
              <div key={String(post.id)} className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  post.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : post.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                }`}>
                  {String(post.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogAnalytics;
