export interface BlogPost {
 id: string | number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  status: 'draft' | 'scheduled' | 'published' | 'archived';
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
  source?: 'manual' | 'rss';
  rssSource?: string;
  originalUrl?: string;
}

export interface RSSSource {
  id: string;
  name: string;
  url: string;
  category: string;
  active: boolean;
  lastSync: string;
  totalPosts: number;
  newPosts: number;
  autoPublish: boolean;
  syncFrequency?: 'hourly' | 'daily' | 'weekly' | 'manual';
  contentFilter?: 'all' | 'keywords' | 'category';
  keywords?: string[];
}

export interface RSSArticle {
  title: string;
  content: string;
  excerpt: string;
  link: string;
  pubDate: string;
  tags: string[];
  author?: string;
  category?: string;
  imageUrl?: string;
}

export interface BlogAnalytics {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  avgReadTime: number;
  topCategories: Array<{ category: string; count: number; views: number }>;
  topTags: Array<{ tag: string; count: number }>;
  monthlyViews: Array<{ month: string; views: number }>;
  rssPerformance: Array<{ source: string; posts: number; avgViews: number }>;
}

export interface BlogSettings {
  defaultAuthor: string;
  postsPerPage: number;
  autoSync: boolean;
  autoFormat: boolean;
  generateSEO: boolean;
  syncFrequency: 'hourly' | 'daily' | 'weekly' | 'manual';
  contentFilter: 'all' | 'keywords' | 'category';
  approvalRequired: boolean;
}

export type BlogCategory =
  | 'Real Estate'
  | 'Investment'
  | 'Market Analysis'
  | 'Legal'
  | 'Home Buying'
  | 'Home Selling'
  | 'Property News'
  | 'Construction'
  | 'Finance';

export type BlogStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export type RSSSourceStatus = 'active' | 'inactive' | 'error' | 'syncing';
