import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Send, 
  Eye, 
  X, 
  Image, 
  Link, 
  Bold, 
  Italic, 
  List,
  Quote,
  Code,
  Heading,
  Type,
  Calendar,
  Tag,
  User,
  Globe
} from 'lucide-react';
import { BlogPost } from '../../types/blog';

interface BlogPostEditorProps {
  post?: BlogPost;
  onSave: (post: Partial<BlogPost>) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const BlogPostEditor: React.FC<BlogPostEditorProps> = ({ 
  post, 
  onSave, 
  onCancel, 
  isOpen 
}) => {
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    content: '',
    excerpt: '',
    author: 'Admin',
    category: '',
    tags: [],
    featured: false,
    featuredImage: '',
    seoTitle: '',
    seoDescription: '',
    status: 'draft'
  });
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (post) {
      setFormData(post);
      setTagsInput(post.tags?.join(', ') || '');
    }
  }, [post]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTagsChange = (value: string) => {
    setTagsInput(value);
    setFormData(prev => ({
      ...prev,
      tags: value.split(',').map(tag => tag.trim()).filter(tag => tag)
    }));
  };

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content?.substring(start, end) || '';
    
    const newText = formData.content?.substring(0, start) + 
                   before + selectedText + after + 
                   formData.content?.substring(end);
    
    setFormData(prev => ({ ...prev, content: newText }));
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const generatePreview = () => {
    if (!formData.content) return '';
    
    return formData.content
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mb-4">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-gray-900 mb-3">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-gray-900 mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-600">$1</blockquote>')
      .replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed mb-4">')
      .replace(/\n/g, '<br>');
  };

  const categories = [
    'Real Estate', 'Investment', 'Market Analysis', 'Legal', 
    'Home Buying', 'Home Selling', 'Property News', 'Construction', 'Finance'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {post ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h2>
            <p className="text-gray-600">
              {post ? `Editing: ${post.title}` : 'Write and publish new content'}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Editor Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'edit'
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
          {activeTab === 'edit' ? (
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter blog post title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Author name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image URL</label>
                  <input
                    type="url"
                    name="featuredImage"
                    value={formData.featuredImage}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://images.pexels.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt *</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the post"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="real estate, investment, property (comma-separated)"
                />
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Markdown Toolbar */}
              <div className="border border-gray-300 rounded-lg">
                <div className="flex items-center space-x-2 p-3 border-b border-gray-200 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => insertMarkdown('# ', '')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                    title="Heading 1"
                  >
                    <Heading size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('## ', '')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                    title="Heading 2"
                  >
                    <Type size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('**', '**')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                    title="Bold"
                  >
                    <Bold size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('*', '*')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                    title="Italic"
                  >
                    <Italic size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('- ', '')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                    title="List"
                  >
                    <List size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('> ', '')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                    title="Quote"
                  >
                    <Quote size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('`', '`')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                    title="Code"
                  >
                    <Code size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('[Link Text](', ')')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                    title="Link"
                  >
                    <Link size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('![Alt text](', ')')}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                    title="Image"
                  >
                    <Image size={16} />
                  </button>
                </div>

                <textarea
                  id="content-editor"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={20}
                  className="w-full px-4 py-3 border-0 focus:ring-0 font-mono text-sm resize-none"
                  placeholder="Write your blog content here using Markdown..."
                />
              </div>

              {/* SEO Section */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-4">SEO Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SEO Title</label>
                    <input
                      type="text"
                      name="seoTitle"
                      value={formData.seoTitle}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="SEO optimized title (max 60 chars)"
                      maxLength={60}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {formData.seoTitle?.length || 0}/60 characters
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SEO Description</label>
                    <textarea
                      name="seoDescription"
                      value={formData.seoDescription}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Meta description for search engines (max 160 chars)"
                      maxLength={160}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {formData.seoDescription?.length || 0}/160 characters
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Featured Post</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            /* Preview */
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">{formData.title}</h1>
                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <User size={16} />
                      <span>{formData.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={16} />
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Tag size={16} />
                      <span>{formData.category}</span>
                    </div>
                  </div>
                </div>
                
                {formData.featuredImage && (
                  <img
                    src={formData.featuredImage}
                    alt={formData.title}
                    className="w-full h-64 object-cover rounded-xl mb-8"
                  />
                )}
                
                <div className="prose prose-lg max-w-none">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: `<p class="text-gray-700 leading-relaxed mb-4">${generatePreview()}</p>` 
                    }}
                  />
                </div>

                {formData.tags && formData.tags.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <Tag className="text-gray-400" size={18} />
                      <span className="text-gray-600 font-medium">Tags:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Status: <span className={`font-medium ${
                formData.status === 'published' ? 'text-green-600' :
                formData.status === 'draft' ? 'text-yellow-600' : 'text-gray-600'
              }`}>
                {formData.status?.charAt(0).toUpperCase() + formData.status?.slice(1)}
              </span>
            </span>
            {formData.content && (
              <span className="text-sm text-gray-600">
                Read time: ~{Math.ceil(formData.content.length / 1000)} min
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave({ ...formData, status: 'draft' })}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Save Draft</span>
            </button>
            <button
              onClick={() => onSave({ ...formData, status: 'published', publishedAt: new Date().toISOString() })}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Send size={16} />
              <span>Publish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostEditor;