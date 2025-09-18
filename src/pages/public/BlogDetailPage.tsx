// src/components/BlogDetailPage.tsx
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
  Send,
  Star,
  Home,
  Building
} from 'lucide-react';
import toast from 'react-hot-toast';
import blogsAPI from '@/lib/blogsAPI';

export interface BlogPost {
  id: string | number;
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  author?: string;
  category?: string;
  tags?: string[];
  status?: string;
  featured?: boolean;
  featuredImage?: string | null;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  views?: number;
  likes?: number;
  comments?: number;
  seoTitle?: string;
  seoDescription?: string;
  readTime?: number | string;
}

interface Comment {
  id: string;
  author: string;
  email?: string;
  content: string;
  createdAt: string;
  likes: number;
  replies: Comment[];
}

interface BlogDetailPageProps {
  slug: string;
  post?: BlogPost;            // optional: parent can pass pre-fetched post
  loading?: boolean;         // optional: parent can indicate loading state
  onBack?: () => void;       // optional navigation callback
}

const BlogDetailPage: React.FC<BlogDetailPageProps> = ({ slug, post: propPost, loading: propLoading = false, onBack }) => {
  const [post, setPost] = useState<BlogPost | null>(propPost ?? null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentForm, setCommentForm] = useState({ name: '', email: '', content: '' });
  const [isLoading, setIsLoading] = useState<boolean>(propLoading);

  // Helper to normalize image URL:
  const buildImageUrl = (img?: string | null) => {
    if (!img) return null;
    if (/^https?:\/\//i.test(img)) return img;
    if (img.startsWith('/')) return `${window.location.origin}${img}`;
    return img;
  };

  // If parent provides a post prop, prefer it and skip fetch.
  useEffect(() => {
    setPost(propPost ?? null);
    setIsLoading(propLoading);
  }, [propPost, propLoading]);

  useEffect(() => {
    // If post prop was provided we don't fetch. Otherwise, fetch by slug.
    if (propPost) return;

    let mounted = true;

    const fetchPostAndRelated = async () => {
      setIsLoading(true);
      try {
        let fetched: any = null;

        // 1) Try dedicated slug endpoint if exists
        if (typeof (blogsAPI as any).getPostBySlug === 'function') {
          try {
            const res = await (blogsAPI as any).getPostBySlug(slug);
            fetched = (res && (res.data ?? res.post ?? res)) ?? null;
          } catch (e) {
            fetched = null;
          }
        }

        // 2) Fallback: search via getAllPosts
        if (!fetched) {
          try {
            const listRes = await blogsAPI.getAllPosts?.({ q: slug, limit: 10 }) ?? [];
            let items: any = listRes;
            if (items && (items.data || items.items || items.results)) {
              items = items.data ?? items.items ?? items.results;
            }
            if (Array.isArray(items) && items.length) {
              const bySlug = items.find((it: any) => String(it.slug ?? it.id ?? '').toLowerCase() === slug.toLowerCase());
              fetched = bySlug ?? items[0];
            } else {
              if (listRes && (listRes.id || listRes.title)) fetched = listRes;
            }
          } catch {
            fetched = null;
          }
        }

        if (!fetched) {
          toast.error('Could not find the requested post.');
          if (mounted) setPost(null);
          return;
        }

        // Normalize fields
        const normalized: BlogPost = {
          id: fetched.id ?? fetched._id ?? fetched.slug ?? fetched.title ?? Date.now(),
          title: fetched.title ?? 'Untitled',
          slug: fetched.slug ?? undefined,
          content: fetched.content ?? fetched.body ?? fetched.html ?? '',
          excerpt: fetched.excerpt ?? fetched.description ?? '',
          author: fetched.author ?? 'Admin',
          category: fetched.category ?? fetched.cat ?? 'Uncategorized',
          tags: Array.isArray(fetched.tags) ? fetched.tags : (typeof fetched.tags === 'string' ? (fetched.tags ? fetched.tags.split(',').map((s: string) => s.trim()) : []) : []),
          status: fetched.status ?? 'draft',
          featured: !!fetched.featured,
          featuredImage: buildImageUrl(fetched.featuredImage ?? fetched.featured_image ?? fetched.image ?? null),
          publishedAt: fetched.publishedAt ?? fetched.published_at ?? '',
          createdAt: fetched.createdAt ?? fetched.created_at ?? new Date().toISOString(),
          updatedAt: fetched.updatedAt ?? fetched.updated_at ?? new Date().toISOString(),
          views: Number(fetched.views ?? 0),
          likes: Number(fetched.likes ?? 0),
          comments: Number(fetched.comments ?? 0),
          seoTitle: fetched.seoTitle ?? fetched.seo_title ?? '',
          seoDescription: fetched.seoDescription ?? fetched.seo_description ?? '',
          readTime: typeof fetched.readTime === 'number' ? fetched.readTime : Math.ceil(((fetched.content ?? '').length || 0) / 200)
        };

        if (!mounted) return;
        setPost(normalized);

        // Comments
        if (typeof (blogsAPI as any).getComments === 'function') {
          try {
            const cRes = await (blogsAPI as any).getComments(normalized.id);
            const cList = cRes && (cRes.data ?? cRes.comments ?? cRes) ? (cRes.data ?? cRes.comments ?? cRes) : [];
            if (mounted) setComments(Array.isArray(cList) ? cList : []);
          } catch {
            if (mounted) setComments([]);
          }
        } else {
          if (mounted) setComments([]);
        }

        // Related posts
        try {
          const relatedRes = await blogsAPI.getAllPosts?.({ category: normalized.category, limit: 6 }) ?? [];
          let relatedItems: any = relatedRes;
          if (relatedItems && (relatedItems.data || relatedItems.items || relatedItems.results)) {
            relatedItems = relatedItems.data ?? relatedItems.items ?? relatedItems.results;
          }
          if (Array.isArray(relatedItems)) {
            const related = relatedItems
              .filter((rp: any) => String(rp.id ?? rp._id ?? rp.slug) !== String(normalized.id))
              .slice(0, 4)
              .map((rp: any) => ({
                id: rp.id ?? rp._id ?? rp.slug ?? Date.now(),
                title: rp.title ?? 'Untitled',
                slug: rp.slug ?? undefined,
                content: rp.content ?? rp.body ?? rp.html ?? '', // <-- add content property
                excerpt: rp.excerpt ?? rp.description ?? '',
                author: rp.author ?? 'Admin',
                category: rp.category ?? normalized.category,
                tags: Array.isArray(rp.tags) ? rp.tags : (typeof rp.tags === 'string' ? rp.tags.split(',').map((s: string) => s.trim()) : []),
                status: rp.status ?? 'draft',
                featured: !!rp.featured,
                featuredImage: buildImageUrl(rp.featuredImage ?? rp.featured_image ?? rp.image ?? null),
                publishedAt: rp.publishedAt ?? rp.published_at ?? '',
                createdAt: rp.createdAt ?? rp.created_at ?? '',
                updatedAt: rp.updatedAt ?? rp.updated_at ?? '',
                views: Number(rp.views ?? 0),
                likes: Number(rp.likes ?? 0),
                comments: Number(rp.comments ?? 0),
                seoTitle: rp.seoTitle ?? rp.seo_title ?? '',
                seoDescription: rp.seoDescription ?? rp.seo_description ?? '',
                readTime: typeof rp.readTime === 'number' ? rp.readTime : Math.ceil(((rp.content ?? '').length || 0) / 200)
              }));
            if (mounted) setRelatedPosts(related);
          } else {
            if (mounted) setRelatedPosts([]);
          }
        } catch {
          if (mounted) setRelatedPosts([]);
        }
      } catch (err) {
        console.error('Failed to load post', err);
        toast.error('Failed to load blog post');
        if (mounted) {
          setPost(null);
          setRelatedPosts([]);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchPostAndRelated();

    return () => {
      mounted = false;
    };
  }, [slug, propPost]);

  const handleLike = () => {
    setIsLiked((prev) => !prev);
    if (post) {
      setPost((prev) => (prev ? { ...prev, likes: isLiked ? (prev.likes || 0) - 1 : (prev.likes || 0) + 1 } : prev));
      // Optionally persist via API (e.g. blogsAPI.likePost(post.id))
    }
    toast.success(isLiked ? 'Removed from likes' : 'Added to likes');
  };

  const handleBookmark = () => {
    setIsBookmarked((prev) => !prev);
    // persist if needed
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

      if (post && typeof (blogsAPI as any).createComment === 'function') {
        try {
          await (blogsAPI as any).createComment(post.id, newComment);
        } catch {
          // ignore errors, still add locally
        }
      }

      setComments((prev) => [newComment, ...prev]);
      setCommentForm({ name: '', email: '', content: '' });
      setShowCommentForm(false);
      toast.success('Comment posted successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to post comment');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const formatContent = (content: string) => {
    if (!content) return '';
    return content
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mb-6 mt-8">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-gray-900 mb-4 mt-6">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-gray-900 mb-3 mt-4">$1</h3>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold">$1</strong>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 mb-2">• $1</li>')
      .replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed mb-4">')
      .replace(/\n/g, '<br>');
  };

  // Loading state
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
          <button onClick={onBack} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  const featuredImgUrl = buildImageUrl(post.featuredImage ?? null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft size={20} className="mr-2" />
              Back to Blog
            </button>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-lg transition-colors ${isBookmarked ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                aria-label="Bookmark"
              >
                <Bookmark size={18} />
              </button>

              <div className="relative group">
                <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  <Share size={18} />
                </button>
                <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button onClick={() => handleShare('facebook')} className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 w-full text-left">
                    <Facebook size={16} className="text-blue-600" />
                    <span>Facebook</span>
                  </button>
                  <button onClick={() => handleShare('twitter')} className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 w-full text-left">
                    <Twitter size={16} className="text-blue-400" />
                    <span>Twitter</span>
                  </button>
                  <button onClick={() => handleShare('linkedin')} className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 w-full text-left">
                    <Linkedin size={16} className="text-blue-700" />
                    <span>LinkedIn</span>
                  </button>
                  <button onClick={() => handleShare('copy')} className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 w-full text-left">
                    <Copy size={16} className="text-gray-600" />
                    <span>Copy Link</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Article Column */}
          <div className="lg:col-span-2">
            {/* Article Header */}
            <article className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
              <div className="relative">
                {featuredImgUrl ? (
                  <img src={featuredImgUrl} alt={post.title} className="w-full h-64 md:h-80 object-cover" />
                ) : (
                  <div className="w-full h-64 md:h-80 bg-gray-100 flex items-center justify-center">
                    <div className="text-gray-400">No image available</div>
                  </div>
                )}

                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">{post.category}</span>
                    {post.featured && <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">Featured</span>}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">{post.title}</h1>
                </div>
              </div>

              <div className="p-6 md:p-8">
                {/* Meta */}
                <div className="flex flex-wrap items-center justify-between mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center space-x-6 mb-4 md:mb-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {String(post.author || "A").split(" ").map(n => n[0]).join("")}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{post.author}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="text-gray-400" size={18} />
                      <span className="text-gray-600">{formatDate(post.publishedAt)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="text-gray-400" size={18} />
                      <span className="text-gray-600">{post.readTime ?? Math.ceil(((post.content || '').length || 0) / 200)} min read</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Eye size={18} />
                      <span>{(post.views ?? 0).toLocaleString()}</span>
                    </div>
                    <button onClick={handleLike} className={`flex items-center space-x-1 transition-colors ${isLiked ? 'text-red-600' : 'text-gray-600 hover:text-red-600'}`}>
                      <Heart size={18} />
                      <span>{post.likes ?? 0}</span>
                    </button>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <MessageSquare size={18} />
                      <span>{comments.length}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: `<p class="text-gray-700 leading-relaxed mb-4">${formatContent(post.content)}</p>` }} />
                </div>

                {/* Tags */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <Tag className="text-gray-400" size={18} />
                    <span className="text-gray-600 font-medium">Tags:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(post.tags ?? []).map((tag, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors cursor-pointer">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Author */}
                <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{post.author}</h3>
                      <p className="text-gray-600 mb-3">Real estate expert focused on market analysis and investment strategy.</p>
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

            {/* Comments */}

 (file continued — full file below)
```tsx
// continue of src/components/BlogDetailPage.tsx

            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Comments ({comments.length})</h2>
                <button onClick={() => setShowCommentForm(!showCommentForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                  <MessageSquare size={18} />
                  <span>Add Comment</span>
                </button>
              </div>

              {showCommentForm && (
                <form onSubmit={handleCommentSubmit} className="mb-8 p-6 bg-gray-50 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                      <input type="text" value={commentForm.name} onChange={(e) => setCommentForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input type="email" value={commentForm.email} onChange={(e) => setCommentForm(prev => ({ ...prev, email: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comment *</label>
                    <textarea value={commentForm.content} onChange={(e) => setCommentForm(prev => ({ ...prev, content: e.target.value }))} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Share your thoughts..." required />
                  </div>
                  <div className="flex space-x-3">
                    <button type="button" onClick={() => setShowCommentForm(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"><Send size={16} /><span>Post Comment</span></button>
                  </div>
                </form>
              )}

              <div className="space-y-6">
                {comments.map(comment => (
                  <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="text-blue-600" size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{comment.author}</h4>
                          <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-gray-700 mb-3 leading-relaxed">{comment.content}</p>
                        <div className="flex items-center space-x-4">
                          <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"><ThumbsUp size={14} /><span>{comment.likes}</span></button>
                          <button className="text-sm text-gray-600 hover:text-blue-600 transition-colors">Reply</button>
                        </div>

                        {comment.replies.length > 0 && (
                          <div className="mt-4 ml-6 space-y-4">
                            {comment.replies.map(reply => (
                              <div key={reply.id} className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                  <User className="text-gray-600" size={14} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h5 className="font-medium text-gray-900 text-sm">{reply.author}</h5>
                                    <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
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
                  <button onClick={() => setShowCommentForm(true)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Write a Comment</button>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-4">Ready to Start Your Real Estate Journey?</h2>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">Get expert guidance and access to exclusive property listings. Our team is here to help you make informed decisions.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2"><Home size={18} /><span>Browse Properties</span></button>
                <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors flex items-center space-x-2"><Building size={18} /><span>Get Expert Consultation</span></button>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Related Articles */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Related Articles */}
              {relatedPosts.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <MessageSquare className="text-white" size={18} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Related Articles</h3>
                  </div>

                  <div className="space-y-4">
                    {relatedPosts.map((rp) => (
                      <div
                        key={rp.id}
                        className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                        onClick={() => { /* optionally navigate */ }}
                      >
                        <div className="relative">
                          {rp.featuredImage ? (
                            <img src={rp.featuredImage as string} alt={rp.title} className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                              <div className="text-gray-400 text-sm">No image</div>
                            </div>
                          )}
                          <div className="absolute top-3 left-3">
                            <span className="bg-white/90 backdrop-blur-sm text-blue-800 px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                              {rp.category}
                            </span>
                          </div>
                        </div>

                        <div className="p-4">
                          <h4 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {rp.title}
                          </h4>
                          <p className="text-gray-600 text-xs mb-3 line-clamp-2 leading-relaxed">
                            {rp.excerpt}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                  {String(post.author || "A").split(" ").map(n => n[0]).join("")}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{post.author}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock size={10} />
                                <span>{rp.readTime ?? Math.ceil(((rp.content || '').length || 0) / 200)} min</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Eye size={10} />
                                <span>{rp.views}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Heart size={10} />
                                <span>{rp.likes}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                      View All Articles
                    </button>
                  </div>
                </div>
              )}

              {/* Newsletter Signup */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Stay Updated</h3>
                  <p className="text-gray-600 text-sm">Get the latest real estate insights delivered to your inbox.</p>
                </div>

                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Subscribe Now
                  </button>
                </form>

                <p className="text-xs text-gray-500 text-center mt-3">
                  No spam, unsubscribe at any time.
                </p>
              </div>

              {/* Popular Tags */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {['Real Estate', 'Investment', 'Market Analysis', 'Property', 'Finance', 'Tips', 'Trends', 'Location'].map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-3 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer transform hover:scale-105"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Eye className="text-green-600" size={14} />
                    </div>
                    <div>
                      <p className="text-gray-700">1.2k people viewed this article today</p>
                      <p className="text-gray-500 text-xs">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Heart className="text-red-600" size={14} />
                    </div>
                    <div>
                      <p className="text-gray-700">87 new likes on related posts</p>
                      <p className="text-gray-500 text-xs">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="text-blue-600" size={14} />
                    </div>
                    <div>
                      <p className="text-gray-700">12 new comments posted</p>
                      <p className="text-gray-500 text-xs">1 day ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>  
    </div>
  );
};

export default BlogDetailPage;
