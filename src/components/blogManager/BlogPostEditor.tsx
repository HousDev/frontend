// src/components/blogManager/BlogPostEditor.tsx
import React, { useState, useEffect } from 'react';
import {
  Save, Send, X, Bold, Italic, List, Quote, Code, Heading,
  Calendar, Tag, User, Link
} from 'lucide-react';
import blogsAPI from '@/lib/blogsAPI';

interface BlogPost {
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  featured: boolean;
  featuredImage: string;
  seoTitle: string;
  seoDescription: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  id?: number | string;
}

interface BlogPostEditorProps {
  post?: BlogPost | null;
  onSave: (post: Partial<BlogPost>) => void;
  onCancel: () => void;
  isOpen: boolean;
  currentUserName?: string;
  lockAuthor?: boolean;
}

const categories = [
  'Real Estate', 'Investment', 'Market Analysis', 'Legal',
  'Home Buying', 'Home Selling', 'Property News', 'Construction', 'Finance'
];

const BlogPostEditor: React.FC<BlogPostEditorProps> = ({
  post, onSave, onCancel, isOpen, currentUserName, lockAuthor = false
}) => {
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '', content: '', excerpt: '', author: 'Admin',
    category: '', tags: [], featured: false, featuredImage: '',
    seoTitle: '', seoDescription: '', status: 'draft'
  });
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // image preview / validation state
  const [imgLoading, setImgLoading] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);
  const [imgDimensions, setImgDimensions] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if (post) {
      // important: use shallow copy so controlled inputs update
      setFormData({ ...post });
      setTagsInput(post.tags?.join(', ') || '');

      // validate image url if it's a normal URL (not data:)
      if (post.featuredImage && typeof post.featuredImage === 'string' && !post.featuredImage.startsWith('data:')) {
        validateImageUrl(post.featuredImage);
      } else {
        setImgError(null);
        setImgLoading(false);
        setImgDimensions(null);
      }
    } else {
      setFormData({
        title: '', content: '', excerpt: '', author: currentUserName || 'Admin',
        category: '', tags: [], featured: false, featuredImage: '',
        seoTitle: '', seoDescription: '', status: 'draft'
      });
      setTagsInput('');
      setImgError(null);
      setImgLoading(false);
      setImgDimensions(null);
    }
  }, [post, currentUserName]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'featuredImage') {
      const url = value;
      setFormData(prev => ({ ...prev, featuredImage: url }));
      if (typeof url === 'string' && url.startsWith('data:')) {
        setImgError(null);
        setImgLoading(false);
        setImgDimensions(null);
      } else {
        validateImageUrl(String(url));
      }
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTagsChange = (value: string) => {
    setTagsInput(value);
    setFormData(prev => ({
      ...prev,
      tags: value.split(',').map(tag => tag.trim()).filter(Boolean)
    }));
  };

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const { selectionStart: start, selectionEnd: end } = textarea;
    const content = formData.content || '';
    const selected = content.substring(start, end);
    const newText = content.substring(0, start) + before + selected + after + content.substring(end);

    setFormData(prev => ({ ...prev, content: newText }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const generatePreview = () => {
    if (!formData.content) return '';
    return formData.content
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl sm:text-3xl font-bold mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl sm:text-2xl font-bold mb-3">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 italic">$1</blockquote>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>');
  };

  const toolbarButtons = [
    { icon: Heading, action: () => insertMarkdown('# '), title: 'Heading' },
    { icon: Bold, action: () => insertMarkdown('**', '**'), title: 'Bold' },
    { icon: Italic, action: () => insertMarkdown('*', '*'), title: 'Italic' },
    { icon: List, action: () => insertMarkdown('- '), title: 'List' },
    { icon: Quote, action: () => insertMarkdown('> '), title: 'Quote' },
    { icon: Code, action: () => insertMarkdown('`', '`'), title: 'Code' },
    { icon: Link, action: () => insertMarkdown('[Link](', ')'), title: 'Link' }
  ];

  const dataURLtoBlob = (dataurl: string): Blob => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const buildPayload = (): { payload: FormData | Record<string, any>; isFormData: boolean } => {
    const payloadObj: Record<string, any> = {
      title: formData.title || '',
      content: formData.content || '',
      excerpt: formData.excerpt || '',
      author: formData.author || '',
      category: formData.category || '',
      tags: formData.tags || [],
      featured: !!formData.featured,
      seoTitle: formData.seoTitle || '',
      seoDescription: formData.seoDescription || '',
      status: formData.status || 'draft',
      publishedAt: formData.publishedAt || undefined,
    };

    if (formData.featuredImage && typeof formData.featuredImage === 'string' && formData.featuredImage.startsWith('data:')) {
      const fd = new FormData();
      Object.entries(payloadObj).forEach(([k, v]) => {
        if (v === undefined) return;
        if (k === 'tags') {
          fd.append('tags', JSON.stringify(v));
        } else {
          fd.append(k, String(v));
        }
      });
      const blob = dataURLtoBlob(formData.featuredImage);
      const ext = blob.type.split('/')[1] || 'png';
      const filename = `featured.${ext}`;
      fd.append('featuredImage', blob, filename);
      return { payload: fd, isFormData: true };
    }

    if (formData.featuredImage) {
      payloadObj.featuredImage = formData.featuredImage;
    }

    return { payload: payloadObj, isFormData: false };
  };

  const getPostId = (): number | string | undefined => {
    return (post as any)?.id ?? (formData as any)?.id;
  };

  const savePost = async (status: 'draft' | 'published' | 'archived') => {
    setSaving(true);
    setError(null);

    try {
      setFormData(prev => ({ ...prev, status, publishedAt: status === 'published' ? new Date().toISOString() : prev.publishedAt }));

      const { payload, isFormData } = buildPayload();
      const id = getPostId();
      let responseData: any;

      if (id !== undefined && id !== null) {
        if (isFormData) {
          responseData = await blogsAPI.updatePost(id, payload as FormData);
        } else {
          responseData = await blogsAPI.updatePost(id, payload as Record<string, any>);
        }
      } else {
        if (isFormData) {
          responseData = await blogsAPI.createPost(payload as FormData);
        } else {
          responseData = await blogsAPI.createPost(payload as Record<string, any>);
        }
      }

      onSave(responseData);
      setFormData(prev => ({ ...prev, ...(responseData || {}) }));
      alert(`Post ${status === 'published' ? 'published' : 'saved as draft'} successfully.`);
    } catch (err: any) {
      console.error('Error saving post', err);
      setError(err?.message || 'Failed to save post. Please try again.');
      alert(`Error: ${err?.message || 'Failed to save post.'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraftClick = () => savePost('draft');
  const handlePublishClick = () => savePost('published');

  // image validation (url or data URL handled)
  const validateImageUrl = (url: string) => {
    if (!url) {
      setImgError(null);
      setImgLoading(false);
      setImgDimensions(null);
      return;
    }

    if (url.startsWith('data:')) {
      setImgError(null);
      setImgLoading(false);
      return;
    }

    try {
      new URL(url);
    } catch {
      setImgError('Invalid image URL');
      setImgLoading(false);
      setImgDimensions(null);
      return;
    }

    setImgLoading(true);
    setImgError(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => {
      setImgLoading(false);
      setImgError(null);
      setImgDimensions({ w: img.naturalWidth, h: img.naturalHeight });
      setFormData(prev => ({ ...prev, featuredImage: url }));
    };
    img.onerror = () => {
      setImgLoading(false);
      setImgError('Could not load image from URL');
      setImgDimensions(null);
    };
  };

  const handleFileSelected = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormData(prev => ({ ...prev, featuredImage: dataUrl }));
      const img = new Image();
      img.src = dataUrl;
      setImgLoading(true);
      img.onload = () => {
        setImgLoading(false);
        setImgError(null);
        setImgDimensions({ w: img.naturalWidth, h: img.naturalHeight });
      };
      img.onerror = () => {
        setImgLoading(false);
        setImgError('Uploaded image could not be processed');
        setImgDimensions(null);
      };
    };
    reader.readAsDataURL(file);
  };

  const copyUrlToClipboard = async () => {
    const url = formData.featuredImage || '';
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      alert('Image URL copied to clipboard');
    } catch {
      // ignore
    }
  };

  const openImageInNewTab = () => {
    const url = formData.featuredImage || '';
    if (!url) return;
    window.open(url, '_blank', 'noopener');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold">
                {post ? 'Edit Post' : 'Create New Blog Post'}
              </h2>
              <p className="text-xs opacity-90 hidden sm:block">
                {post ? `Editing: ${post.title}` : 'Write and publish new content'}
              </p>
            </div>
            <button onClick={onCancel} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            {['edit', 'preview'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'edit' | 'preview')}
                className={`px-4 py-2 font-medium capitalize text-sm transition-colors ${activeTab === tab
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'edit' ? (
            <div className="h-full overflow-y-auto p-3 sm:p-4 space-y-3">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Author</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    className="w-full px-2 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
                    readOnly={lockAuthor}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Featured Image</label>
                  <div className="space-y-2">
                    <input
                      type="url"
                      name="featuredImage"
                      value={formData.featuredImage || ''}
                      onChange={handleChange}
                      className="w-full px-2 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        handleFileSelected(file);
                      }}
                      className="w-full px-2 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />

                    <div className="text-xs text-gray-500">
                      {imgLoading && <span>Validating image...</span>}
                      {imgError && <span className="text-red-600">{imgError}</span>}
                      {!imgLoading && !imgError && imgDimensions && (
                        <span>Image size: {imgDimensions.w}×{imgDimensions.h}px</span>
                      )}
                    </div>

                    {formData.featuredImage && (
                      <div className="relative">
                        <img
                          src={formData.featuredImage}
                          alt="Featured preview"
                          className="w-full h-20 object-cover rounded-md border"
                          onLoad={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            if (!imgDimensions) {
                              setImgDimensions({ w: img.naturalWidth, h: img.naturalHeight });
                              setImgError(null);
                              setImgLoading(false);
                            }
                          }}
                          onError={() => {
                            setImgError('Could not load preview');
                          }}
                        />
                        <div className="absolute top-1 right-1 flex gap-1">
                          <button
                            type="button"
                            onClick={openImageInNewTab}
                            className="bg-white text-gray-700 rounded px-2 py-1 text-xs hover:bg-gray-100"
                          >
                            Open
                          </button>
                          <button
                            type="button"
                            onClick={copyUrlToClipboard}
                            className="bg-white text-gray-700 rounded px-2 py-1 text-xs hover:bg-gray-100"
                          >
                            Copy
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, featuredImage: '' }));
                              setImgDimensions(null);
                              setImgError(null);
                            }}
                            className="bg-red-500 text-white rounded px-2 py-1 text-xs hover:bg-red-600"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Tags</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Excerpt *</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-2 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description"
                  required
                />
              </div>

              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map((tag, i) => (
                    <span key={i} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="border rounded-lg">
                <div className="flex flex-wrap gap-1 p-1.5 border-b bg-gray-50">
                  {toolbarButtons.map(({ icon: Icon, action, title }, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={action}
                      className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                      title={title}
                    >
                      <Icon size={14} />
                    </button>
                  ))}
                </div>
                <textarea
                  id="content-editor"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  className="w-full px-2 py-2 border-0 focus:ring-0 font-mono text-xs resize-none h-32"
                  placeholder="Write your content using Markdown..."
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">SEO Title</label>
                    <input
                      type="text"
                      name="seoTitle"
                      value={formData.seoTitle}
                      onChange={handleChange}
                      className="w-full px-2 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
                      maxLength={60}
                    />
                    <div className="text-xs text-gray-500">{formData.seoTitle?.length || 0}/60</div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">SEO Description</label>
                    <textarea
                      name="seoDescription"
                      value={formData.seoDescription}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-2 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
                      maxLength={160}
                    />
                    <div className="text-xs text-gray-500">{formData.seoDescription?.length || 0}/160</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={!!formData.featured}
                        onChange={handleChange}
                        className="rounded mr-2"
                      />
                      <span>Featured Post</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-2 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-3 sm:p-4">
              <article className="max-w-4xl mx-auto">
                <header className="text-center mb-4">
                  <h1 className="text-xl sm:text-2xl font-bold mb-2">{formData.title}</h1>
                  <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>{formData.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tag size={14} />
                      <span>{formData.category}</span>
                    </div>
                  </div>
                </header>

                {formData.featuredImage && (
                  <img
                    src={formData.featuredImage}
                    alt={formData.title}
                    className="w-full h-32 sm:h-40 object-cover rounded-lg mb-4"
                  />
                )}

                <div className="prose prose-sm max-w-none text-sm">
                  <div dangerouslySetInnerHTML={{
                    __html: `<p class="leading-relaxed">${generatePreview()}</p>`
                  }} />
                </div>

                {formData.tags && formData.tags.length > 0 && (
                  <footer className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag size={16} />
                      <span className="font-medium text-sm">Tags:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {formData.tags.map((tag, i) => (
                        <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </footer>
                )}
              </article>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-t bg-gray-50 gap-2">
          <div className="text-xs text-gray-600">
            Status: <span className={`font-medium ${formData.status === 'published' ? 'text-green-600' :
              formData.status === 'draft' ? 'text-yellow-600' : 'text-gray-600'
              }`}>
              {String(formData.status || 'Draft').charAt(0).toUpperCase() + String(formData.status || 'draft').slice(1)}
            </span>
            {error && <span className="text-red-600 ml-3">Error: {error}</span>}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onCancel}
              className="flex-1 sm:flex-none px-3 py-1.5 text-sm border text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveDraftClick}
              className="flex-1 sm:flex-none px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
              disabled={saving}
              title={saving ? 'Saving...' : 'Save as draft'}
            >
              <Save size={14} />
              <span>{saving ? 'Saving...' : 'Draft'}</span>
            </button>
            <button
              onClick={handlePublishClick}
              className="flex-1 sm:flex-none px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
              disabled={saving}
              title={saving ? 'Publishing...' : 'Publish'}
            >
              <Send size={14} />
              <span>{saving ? (formData.status === 'published' ? 'Publishing...' : 'Processing...') : 'Publish'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostEditor;
