// // src/components/blogManager/BlogAnalytics.tsx
// import React from 'react';
// import { BarChart, Users, Eye, TrendingUp, Calendar } from 'lucide-react';
// import { BlogPost as BlogPostType } from '@/types/blog'; // <-- use the canonical type

// interface BlogAnalyticsProps {
//   posts: BlogPostType[];
// }

// const BlogAnalytics: React.FC<BlogAnalyticsProps> = ({ posts }) => {
//   const totalPosts = posts.length;
//   const publishedPosts = posts.filter(post => post.status === 'published').length;
//   const draftPosts = posts.filter(post => post.status === 'draft').length;
//   const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
//   const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
//   const totalComments = posts.reduce((sum, post) => sum + (post.comments || 0), 0);

//   type Stat = {
//     title: string;
//     value: string | number;
//     icon: React.ComponentType<any>;
//     color: string;
//     bg: string;
//   };

//   const stats: Stat[] = [
//     {
//       title: 'Total Posts',
//       value: totalPosts,
//       icon: BarChart,
//       color: 'text-blue-600',
//       bg: 'bg-blue-100'
//     },
//     {
//       title: 'Published',
//       value: publishedPosts,
//       icon: TrendingUp,
//       color: 'text-green-600',
//       bg: 'bg-green-100'
//     },
//     {
//       title: 'Total Views',
//       value: totalViews.toLocaleString(),
//       icon: Eye,
//       color: 'text-purple-600',
//       bg: 'bg-purple-100'
//     },
//     {
//       title: 'Engagement',
//       value: totalLikes + totalComments,
//       icon: Users,
//       color: 'text-orange-600',
//       bg: 'bg-orange-100'
//     }
//   ];

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center space-x-3">
//         <BarChart className="w-6 h-6 text-gray-700" />
//         <h2 className="text-2xl font-bold text-gray-800">Blog Analytics</h2>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {stats.map((stat, index) => {
//           const Icon = stat.icon;
//           return (
//             <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">{stat.title}</p>
//                   <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
//                 </div>
//                 <div className={`p-3 rounded-full ${stat.bg}`}>
//                   <Icon className={`w-6 h-6 ${stat.color}`} />
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4">Post Status Distribution</h3>
//           <div className="space-y-3">
//             <div className="flex items-center justify-between">
//               <span className="text-gray-600">Published</span>
//               <span className="font-semibold text-green-600">{publishedPosts}</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-gray-600">Drafts</span>
//               <span className="font-semibold text-orange-600">{draftPosts}</span>
//             </div>
//             <div className="flex items-center justify-between">
//               <span className="text-gray-600">Total</span>
//               <span className="font-semibold text-gray-800">{totalPosts}</span>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
//           <div className="space-y-3">
//             {posts.slice(0, 5).map((post) => (
//               <div key={String(post.id)} className="flex items-center space-x-3">
//                 <Calendar className="w-4 h-4 text-gray-400" />
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
//                   <p className="text-xs text-gray-500">
//                     {new Date(post.createdAt).toLocaleDateString()}
//                   </p>
//                 </div>
//                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                   post.status === 'published'
//                     ? 'bg-green-100 text-green-800'
//                     : post.status === 'draft'
//                       ? 'bg-yellow-100 text-yellow-800'
//                       : 'bg-blue-100 text-blue-800'
//                 }`}>
//                   {String(post.status)}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BlogAnalytics;


// src/components/blogManager/BlogAnalytics.tsx
import React from 'react';
import { BarChart, Users, Eye, TrendingUp, Calendar, CheckCircle, FileText, Clock } from 'lucide-react';
import { BlogPost as BlogPostType } from '@/types/blog';

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

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

  // Calculate average engagement rate
  const avgEngagementRate = totalPosts > 0 
    ? Math.round(((totalLikes + totalComments) / totalPosts) * 10) / 10 
    : 0;

  // Get top performing post
  const topPost = posts.length > 0 
    ? posts.reduce((prev, current) => ((prev.views || 0) > (current.views || 0) ? prev : current), posts[0])
    : null;

  type Stat = {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color: string;
    trend?: string;
  };

  const stats: Stat[] = [
    {
      title: 'Total Posts',
      value: totalPosts,
      icon: FileText,
      color: '#3b82f6',
      trend: `+${publishedPosts} published`
    },
    {
      title: 'Published',
      value: publishedPosts,
      icon: CheckCircle,
      color: '#10b981',
      trend: `${draftPosts} in draft`
    },
    {
      title: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: '#8b5cf6',
      trend: 'all time'
    },
    {
      title: 'Engagement',
      value: (totalLikes + totalComments).toLocaleString(),
      icon: Users,
      color: O,
      trend: `${avgEngagementRate} avg per post`
    }
  ];

  // Stat Card Component
  const StatCard = ({ stat }: { stat: Stat }) => {
    const Icon = stat.icon;
    return (
      <div className="bg-white rounded-lg p-3 transition-all hover:shadow-md" style={{ border: `1px solid ${BD}` }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: MU }}>{stat.title}</p>
            <p className="text-xl font-bold mt-0.5" style={{ color: N }}>{stat.value}</p>
            {stat.trend && (
              <p className="text-[9px] mt-0.5" style={{ color: MU }}>{stat.trend}</p>
            )}
          </div>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
            <Icon size={16} style={{ color: stat.color }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-3" style={{ border: `1px solid ${BD}` }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: N }}>
            <BarChart size={14} style={{ color: O }} />
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: N }}>Blog Analytics</h2>
            <p className="text-[9px]" style={{ color: MU }}>Post performance and engagement metrics</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {stats.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Post Status Distribution */}
        <div className="bg-white rounded-lg p-3" style={{ border: `1px solid ${BD}` }}>
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp size={12} style={{ color: O }} />
            <h3 className="text-xs font-semibold" style={{ color: N }}>Post Status Distribution</h3>
          </div>
          
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px]" style={{ color: MU }}>Published</span>
                <span className="text-[10px] font-semibold" style={{ color: '#10b981' }}>{publishedPosts}</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: `${BD}` }}>
                <div 
                  className="h-full rounded-full transition-all" 
                  style={{ width: `${totalPosts ? (publishedPosts / totalPosts) * 100 : 0}%`, background: '#10b981' }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px]" style={{ color: MU }}>Drafts</span>
                <span className="text-[10px] font-semibold" style={{ color: O }}>{draftPosts}</span>
              </div>
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: `${BD}` }}>
                <div 
                  className="h-full rounded-full transition-all" 
                  style={{ width: `${totalPosts ? (draftPosts / totalPosts) * 100 : 0}%`, background: O }}
                />
              </div>
            </div>
            
            <div className="pt-1 border-t" style={{ borderColor: BD }}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium" style={{ color: N }}>Total</span>
                <span className="text-[10px] font-bold" style={{ color: N }}>{totalPosts}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Post */}
        <div className="bg-white rounded-lg p-3" style={{ border: `1px solid ${BD}` }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Eye size={12} style={{ color: O }} />
            <h3 className="text-xs font-semibold" style={{ color: N }}>Top Performing Post</h3>
          </div>
          
          {topPost ? (
            <div>
              <p className="text-[11px] font-medium line-clamp-2 mb-1.5" style={{ color: N }}>
                {topPost.title}
              </p>
              <div className="flex items-center gap-3 text-[9px]" style={{ color: MU }}>
                <span className="flex items-center gap-0.5">
                  <Eye size={9} /> {topPost.views || 0} views
                </span>
                <span className="flex items-center gap-0.5">
                  <Users size={9} /> {(topPost.likes || 0) + (topPost.comments || 0)} engagement
                </span>
              </div>
              <div className="mt-2 pt-1.5 border-t" style={{ borderColor: BD }}>
                <div className="flex items-center justify-between text-[9px]">
                  <span style={{ color: MU }}>Category</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px]" style={{ background: `${O}10`, color: O }}>
                    {topPost.category}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <FileText size={20} style={{ color: MU }} className="mx-auto mb-1" />
              <p className="text-[9px]" style={{ color: MU }}>No posts yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-3" style={{ border: `1px solid ${BD}` }}>
        <div className="flex items-center gap-1.5 mb-2">
          <Calendar size={12} style={{ color: O }} />
          <h3 className="text-xs font-semibold" style={{ color: N }}>Recent Activity</h3>
        </div>
        
        <div className="space-y-1.5 max-h-48 overflow-y-auto" style={scrollbarStyles}>
          {posts.slice(0, 5).map((post) => (
            <div key={String(post.id)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: `${N}05` }}>
                <FileText size={10} style={{ color: MU }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium truncate" style={{ color: N }}>{post.title}</p>
                <p className="text-[8px]" style={{ color: MU }}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span 
                className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium ${
                  post.status === 'published'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {String(post.status)}
              </span>
            </div>
          ))}
          
          {posts.length === 0 && (
            <div className="text-center py-4">
              <Calendar size={20} style={{ color: MU }} className="mx-auto mb-1" />
              <p className="text-[9px]" style={{ color: MU }}>No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white rounded-lg p-2 text-center" style={{ border: `1px solid ${BD}` }}>
          <p className="text-[9px]" style={{ color: MU }}>Avg. Views per Post</p>
          <p className="text-sm font-bold" style={{ color: N }}>
            {totalPosts > 0 ? Math.round(totalViews / totalPosts).toLocaleString() : 0}
          </p>
        </div>
        <div className="bg-white rounded-lg p-2 text-center" style={{ border: `1px solid ${BD}` }}>
          <p className="text-[9px]" style={{ color: MU }}>Completion Rate</p>
          <p className="text-sm font-bold" style={{ color: N }}>
            {totalPosts > 0 ? Math.round((publishedPosts / totalPosts) * 100) : 0}%
          </p>
        </div>
      </div>
    </div>
  );
};

// Scrollbar styles
const scrollbarStyles: React.CSSProperties = {
  scrollbarWidth: 'thin',
  scrollbarColor: `${BD} ${BG}`,
  WebkitOverflowScrolling: 'touch',
};


export default BlogAnalytics;