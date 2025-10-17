import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  Save, Send, X, Wand2,
  Bold as BoldIcon, Italic as ItalicIcon, Underline as UnderlineIcon, Strikethrough as StrikeIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List as BulletIcon, ListOrdered as NumberedIcon,
  Link as LinkIcon, Image as ImageIcon, Code as CodeIcon, Quote as QuoteIcon,
  Undo2 as UndoIcon, Redo2 as RedoIcon, Printer as PrinterIcon,
  Calendar, Tag, User, Code
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

// BiDi cleaner
const BIDI_REGEX = /[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;
const sanitizeLTR = (html: string) =>
  (html || '')
    .replace(BIDI_REGEX, '')
    .replace(/\sdir\s*=\s*"(?:rtl|auto)"/gi, ' dir="ltr"')
    .replace(/\sdir\s*=\s*'(?:rtl|auto)'/gi, " dir='ltr'")
    .replace(/direction\s*:\s*rtl\s*;?/gi, 'direction:ltr;')
    .replace(/unicode-bidi\s*:\s*(?:bidi-override|plaintext|isolate-override)\s*;?/gi, 'unicode-bidi:isolate;');

const BlogPostEditor: React.FC<BlogPostEditorProps> = ({
  post, onSave, onCancel, isOpen, currentUserName
}) => {
  const isEditing = !!post?.id;

  const baseAuthorOptions = useMemo(() => ([
    currentUserName || 'Admin', 'Admin', post?.author || ''
  ].filter(Boolean) as string[]), [currentUserName, post?.author]);

  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '', content: '', excerpt: '',
    author: currentUserName || 'Admin',
    category: '', tags: [], featured: false, featuredImage: '',
    seoTitle: '', seoDescription: '', status: 'draft'
  });

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [imgLoading, setImgLoading] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);
  const [imgDimensions, setImgDimensions] = useState<{ w: number; h: number } | null>(null);

  const editorRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<'visual' | 'source'>('visual');
  const hydratedOnce = useRef(false);
  const [content, setContent] = useState<string>('');

  // hydrate from incoming post
  useEffect(() => {
    if (post) {
      setFormData({ ...post });
      setTagsInput(post.tags?.join(', ') || '');
      const html = sanitizeLTR(post.content || '');
      setContent(html);
      if (post.featuredImage && typeof post.featuredImage === 'string' && !post.featuredImage.startsWith('data:')) {
        validateImageUrl(post.featuredImage);
      } else {
        setImgError(null); setImgLoading(false); setImgDimensions(null);
      }
    } else {
      const fresh: Partial<BlogPost> = {
        title: '', content: '', excerpt: '',
        author: currentUserName || 'Admin',
        category: '', tags: [], featured: false, featuredImage: '',
        seoTitle: '', seoDescription: '', status: 'draft'
      };
      setFormData(fresh);
      setTagsInput('');
      setContent('');
      setImgError(null); setImgLoading(false); setImgDimensions(null);
    }
    hydratedOnce.current = false;
  }, [post, currentUserName]);

  useEffect(() => { setFormData(prev => ({ ...prev, content })); }, [content]);

  useEffect(() => {
    if (mode !== 'visual' || !editorRef.current) return;
    const el = editorRef.current;
    const isFocused = document.activeElement === el;
    if (isFocused && hydratedOnce.current) return;
    el.setAttribute('dir', 'ltr');
    el.style.direction = 'ltr';
    el.style.textAlign = 'left';
    el.style.setProperty('unicode-bidi', 'isolate');
    el.style.setProperty('writing-mode', 'horizontal-tb');
    el.innerHTML = sanitizeLTR(content || '');
    hydratedOnce.current = true;
  }, [mode, content]);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    const onPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      const html = e.clipboardData?.getData('text/html') ?? '';
      const text = e.clipboardData?.getData('text') ?? '';
      const payload = sanitizeLTR(html || text);
      document.execCommand(html ? 'insertHTML' : 'insertText', false, payload);
      setContent(el.innerHTML);
    };

    const onBeforeInput = (e: InputEvent) => {
      // @ts-ignore
      const data: string | null = e.data ?? null;
      if (data && BIDI_REGEX.test(data)) {
        e.preventDefault();
        const clean = data.replace(BIDI_REGEX, '');
        document.execCommand('insertText', false, clean);
        setContent(el.innerHTML);
      }
    };

    el.addEventListener('paste', onPaste as any);
    el.addEventListener('beforeinput', onBeforeInput as any);
    return () => {
      el.removeEventListener('paste', onPaste as any);
      el.removeEventListener('beforeinput', onBeforeInput as any);
    };
  }, []);

  if (!isOpen) return null;

  /* ───────── Handlers ───────── */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'featuredImage') {
      const url = value;
      setFormData(prev => ({ ...prev, featuredImage: url }));
      if (typeof url === 'string' && url.startsWith('data:')) {
        setImgError(null); setImgLoading(false); setImgDimensions(null);
      } else {
        validateImageUrl(String(url));
      }
      return;
    }

    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleTagsChange = (value: string) => {
    setTagsInput(value);
    setFormData(prev => ({ ...prev, tags: value.split(',').map(t => t.trim()).filter(Boolean) }));
  };

  const exec = useCallback((cmd: string, value?: string) => {
    if (mode !== 'visual') return;
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    if (editorRef.current) setContent(editorRef.current.innerHTML);
  }, [mode]);

  const insertBlock = (html: string) => {
    if (mode !== 'visual' || !editorRef.current) {
      setContent(prev => sanitizeLTR(prev + html)); return;
    }
    editorRef.current.focus();
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) {
      const next = (editorRef.current.innerHTML || '') + html;
      editorRef.current.innerHTML = next;
      setContent(sanitizeLTR(next)); return;
    }
    const range = sel.getRangeAt(0);
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const frag = document.createDocumentFragment();
    let node: ChildNode | null;
    while ((node = temp.firstChild)) frag.appendChild(node);
    range.deleteContents(); range.insertNode(frag);
    sel.collapseToEnd();
    setContent(sanitizeLTR(editorRef.current.innerHTML));
  };

  const insertCodeBlock = () => insertBlock(
    `<pre style="background:#0b1220;color:#d1fae5;padding:10px;border-radius:8px;overflow:auto;"><code>// your code here</code></pre>`
  );
  const insertQuote = () => insertBlock(
    `<blockquote style="border-left:4px solid #2563eb;padding-left:12px;color:#334155;margin:8px 0;">Type your quote…</blockquote>`
  );

  // Image helpers
  const dataURLtoBlob = (dataurl: string): Blob => {
    const arr = dataurl.split(',');
    const mime = (arr[0].match(/:(.*?);/) || [])[1] || 'image/png';
    const bstr = atob(arr[1]); let n = bstr.length;
    const u8 = new Uint8Array(n); while (n--) u8[n] = bstr.charCodeAt(n);
    return new Blob([u8], { type: mime });
  };

  // 🔸 Build payload with explicit status override from buttons
  const buildPayload = (
    statusOverride?: 'draft' | 'published' | 'archived'
  ): { payload: FormData | Record<string, any>; isFormData: boolean } => {
    const effectiveStatus = statusOverride ?? (formData.status as any) ?? 'draft';
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
      status: effectiveStatus,
      publishedAt: effectiveStatus === 'published' ? new Date().toISOString() : null,
    };

    if (formData.featuredImage && typeof formData.featuredImage === 'string' && formData.featuredImage.startsWith('data:')) {
      const fd = new FormData();
      Object.entries(payloadObj).forEach(([k, v]) => {
        if (v === undefined) return;
        if (k === 'tags') fd.append('tags', JSON.stringify(v));
        else fd.append(k, String(v));
      });
      const blob = dataURLtoBlob(formData.featuredImage);
      const ext = blob.type.split('/')[1] || 'png';
      fd.append('featuredImage', blob, `featured.${ext}`);
      return { payload: fd, isFormData: true };
    }

    if (formData.featuredImage) payloadObj.featuredImage = formData.featuredImage;
    return { payload: payloadObj, isFormData: false };
  };

  const getPostId = (): number | string | undefined => (post as any)?.id ?? (formData as any)?.id;

  const savePost = async (status: 'draft' | 'published' | 'archived') => {
    setSaving(true); setError(null);
    try {
      const { payload, isFormData } = buildPayload(status);
      const id = getPostId();
      let responseData: any;

      if (id !== undefined && id !== null) {
        responseData = isFormData
          ? await blogsAPI.updatePost(id, payload as FormData)
          : await blogsAPI.updatePost(id, payload as Record<string, any>);
      } else {
        responseData = isFormData
          ? await blogsAPI.createPost(payload as FormData)
          : await blogsAPI.createPost(payload as Record<string, any>);
      }

      onSave(responseData);
      setFormData(prev => ({ ...prev, ...(responseData || {}) }));
    } catch (err: any) {
      console.error('Error saving post', err);
      setError(err?.message || 'Failed to save post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraftClick = () => savePost('draft');
  const handlePublishClick = () => savePost('published');

  const validateImageUrl = (url: string) => {
    if (!url) { setImgError(null); setImgLoading(false); setImgDimensions(null); return; }
    if (url.startsWith('data:')) { setImgError(null); setImgLoading(false); return; }
    try { new URL(url); } catch { setImgError('Invalid image URL'); setImgLoading(false); setImgDimensions(null); return; }
    setImgLoading(true); setImgError(null);
    const img = new Image();
    img.crossOrigin = 'anonymous'; img.src = url;
    img.onload = () => {
      setImgLoading(false); setImgError(null);
      setImgDimensions({ w: (img as any).naturalWidth, h: (img as any).naturalHeight });
      setFormData(prev => ({ ...prev, featuredImage: url }));
    };
    img.onerror = () => { setImgLoading(false); setImgError('Could not load image from URL'); setImgDimensions(null); };
  };

  const handleFileSelected = (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setFormData(prev => ({ ...prev, featuredImage: dataUrl }));
      const img = new Image(); img.src = dataUrl; setImgLoading(true);
      img.onload = () => { setImgLoading(false); setImgError(null); setImgDimensions({ w: (img as any).naturalWidth, h: (img as any).naturalHeight }); };
      img.onerror = () => { setImgLoading(false); setImgError('Uploaded image could not be processed'); setImgDimensions(null); };
    };
    reader.readAsDataURL(file);
  };

  const copyUrlToClipboard = async () => {
    const url = formData.featuredImage || ''; if (!url) return;
    try { await navigator.clipboard.writeText(url); alert('Image URL copied to clipboard'); } catch { }
  };
  const openImageInNewTab = () => {
    const url = formData.featuredImage || ''; if (!url) return;
    window.open(url, '_blank', 'noopener');
  };

  const authorOptions = Array.from(new Set([...(baseAuthorOptions || []), formData.author || ''].filter(Boolean)));

  // ✨ AI Write handler (always drafts)
  const handleAIWrite = async () => {
    if (!formData.title) { setError("Enter a title first"); return; }
    setAiLoading(true); setError(null);
    try {
      const res = await blogsAPI.aiGenerateFromTitle({
        title: formData.title!,
        tone: "professional",
        length: "medium",
        includeSEO: true,
        includeImages: true,
        includeToc: true,
        audience: "general-public",
        category: formData.category || "AI Generated",
      });
      if (!res?.success || !res?.article) throw new Error(res?.message || "AI failed");

      const a = res.article;
      setContent(sanitizeLTR(a.content || ""));
      setFormData(prev => ({
        ...prev,
        title: a.title || prev.title,
        excerpt: a.excerpt || prev.excerpt,
        seoTitle: a.seoTitle || prev.seoTitle,
        seoDescription: a.seoDescription || prev.seoDescription,
        tags: Array.isArray(a.tags) ? a.tags : prev.tags,
        category: a.category || prev.category,
        status: "draft",
        publishedAt: null,
      }));
      setMode("visual");
      setActiveTab("preview");
    } catch (e: any) {
      setError(e?.message || "AI request failed");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold">
                {isEditing ? 'Edit Post' : 'Create New Blog Post'}
              </h2>
              <p className="text-xs opacity-90 hidden sm:block">
                {isEditing ? `Editing: ${post?.title}` : 'Write and publish new content'}
              </p>
            </div>
            <button onClick={onCancel} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
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

        {/* Body */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'edit' ? (
            <div className="h-full overflow-y-auto p-3 sm:p-4 space-y-4">

              {/* Basic Info */}
              <section className="bg-white p-1 sm:p-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Title *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="title"
                        value={formData.title || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter title"
                        required
                      />
                      <button
                        type="button"
                        onClick={handleAIWrite}
                        disabled={aiLoading || !formData.title}
                        className="inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-purple-600 px-3 py-2 text-xs text-white hover:bg-purple-700 disabled:opacity-60"
                        title="Generate full SEO article from Title"
                      >
                        {aiLoading ? 'Generating…' : (<><Wand2 size={14} /> AI Write</>)}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Category *</label>
                    <select
                      name="category"
                      value={formData.category || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Author */}
                  <div>
                    <label className="block text-xs font-medium mb-1">Author</label>
                    <select
                      name="author"
                      value={formData.author || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      {authorOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* Media & Tags */}
              <section className="bg-white p-1 sm:p-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Featured Image URL</label>
                    <input
                      type="url"
                      name="featuredImage"
                      value={formData.featuredImage || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/image.jpg"
                    />
                    <div className="text-[11px] text-gray-500 mt-1">
                      {imgLoading && <span>Validating image...</span>}
                      {imgError && <span className="text-red-600">{imgError}</span>}
                      {!imgLoading && !imgError && imgDimensions && (
                        <span>Image size: {imgDimensions.w}×{imgDimensions.h}px</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Upload Featured Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        handleFileSelected(file);
                      }}
                      className="w-full px-4 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Tags</label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => handleTagsChange(e.target.value)}
                      className="w-full px-4 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="tag1, tag2, tag3"
                    />
                    {formData.tags && formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {formData.tags.map((tag, i) => (
                          <span key={i} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {formData.featuredImage && (
                  <div className="mt-3">
                    <div className="relative max-w-xl">
                      <img
                        src={formData.featuredImage}
                        alt="Featured preview"
                        className="w-full h-28 sm:h-32 object-cover rounded-md border"
                        onLoad={(e) => {
                          const img = e.currentTarget as HTMLImageElement;
                          if (!imgDimensions) {
                            setImgDimensions({ w: img.naturalWidth, h: img.naturalHeight });
                            setImgError(null); setImgLoading(false);
                          }
                        }}
                        onError={() => setImgError('Could not load preview')}
                      />
                      <div className="absolute top-1 right-1 flex gap-1">
                        <button type="button" onClick={openImageInNewTab} className="bg-white text-gray-700 rounded px-2 py-1 text-xs hover:bg-gray-100">Open</button>
                        <button type="button" onClick={copyUrlToClipboard} className="bg-white text-gray-700 rounded px-2 py-1 text-xs hover:bg-gray-100">Copy</button>
                        <button
                          type="button"
                          onClick={() => { setFormData(prev => ({ ...prev, featuredImage: '' })); setImgDimensions(null); setImgError(null); }}
                          className="bg-red-500 text-white rounded px-2 py-1 text-xs hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* Excerpt & Content */}
              <section className="bg-white p-1 sm:p-1 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="lg:col-span-3">
                    <label className="block text-xs font-medium mb-1">Excerpt *</label>
                    <textarea
                      name="excerpt"
                      value={formData.excerpt || ''}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-2 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description"
                      required
                    />
                  </div>
                </div>

                <fieldset className="border rounded-md">
                  <legend className="text-sm font-medium text-gray-600 px-2">Content</legend>

                  {/* Toolbar */}
                  <div className="p-1 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center gap-1 text-gray-700">
                    <button onClick={() => exec('bold')} title="Bold" className="p-2 rounded hover:bg-gray-200"><BoldIcon size={16} /></button>
                    <button onClick={() => exec('italic')} title="Italic" className="p-2 rounded hover:bg-gray-200"><ItalicIcon size={16} /></button>
                    <button onClick={() => exec('underline')} title="Underline" className="p-2 rounded hover:bg-gray-200"><UnderlineIcon size={16} /></button>
                    <button onClick={() => exec('strikeThrough')} title="Strikethrough" className="p-2 rounded hover:bg-gray-200"><StrikeIcon size={16} /></button>

                    <span className="w-px h-5 bg-gray-300 mx-1" />

                    <button onClick={() => exec('justifyLeft')} title="Align Left" className="p-2 rounded hover:bg-gray-200"><AlignLeft size={16} /></button>
                    <button onClick={() => exec('justifyCenter')} title="Align Center" className="p-2 rounded hover:bg-gray-200"><AlignCenter size={16} /></button>
                    <button onClick={() => exec('justifyRight')} title="Align Right" className="p-2 rounded hover:bg-gray-200"><AlignRight size={16} /></button>
                    <button onClick={() => exec('justifyFull')} title="Justify" className="p-2 rounded hover:bg-gray-200"><AlignJustify size={16} /></button>

                    <span className="w-px h-5 bg-gray-300 mx-1" />

                    <button onClick={() => exec('insertUnorderedList')} title="Bulleted List" className="p-2 rounded hover:bg-gray-200"><BulletIcon size={16} /></button>
                    <button onClick={() => exec('insertOrderedList')} title="Numbered List" className="p-2 rounded hover:bg-gray-200"><NumberedIcon size={16} /></button>

                    <span className="w-px h-5 bg-gray-300 mx-1" />

                    <button
                      onClick={() => {
                        if (mode !== 'visual') return;
                        const url = window.prompt('Enter URL (https://...)', 'https://');
                        if (!url) return;
                        exec('createLink', url);
                      }}
                      title="Insert Link"
                      className="p-2 rounded hover:bg-gray-200"
                    ><LinkIcon size={16} /></button>

                    <button
                      onClick={() => {
                        if (mode !== 'visual') return;
                        const url = window.prompt('Image URL (https://...)', 'https://');
                        if (!url) return;
                        exec('insertImage', url);
                      }}
                      title="Insert Image"
                      className="p-2 rounded hover:bg-gray-200"
                    ><ImageIcon size={16} /></button>

                    <button onClick={insertCodeBlock} title="Code Block" className="p-2 rounded hover:bg-gray-200"><CodeIcon size={16} /></button>
                    <button onClick={insertQuote} title="Quote" className="p-2 rounded hover:bg-gray-200"><QuoteIcon size={16} /></button>

                    <span className="w-px h-5 bg-gray-300 mx-1" />
                    <button onClick={() => exec('undo')} title="Undo" className="p-2 rounded hover:bg-gray-200"><UndoIcon size={16} /></button>
                    <button onClick={() => exec('redo')} title="Redo" className="p-2 rounded hover:bg-gray-200"><RedoIcon size={16} /></button>

                    <span className="w-px h-5 bg-gray-300 mx-1" />
                    <button
                      onClick={() => setMode(m => (m === 'visual' ? 'source' : 'visual'))}
                      title={mode === 'source' ? 'Switch to Visual' : 'Show HTML Source'}
                      className={`p-2 rounded hover:bg-gray-200 ${mode === 'source' ? 'bg-blue-100 text-blue-700' : ''}`}
                    >
                      <Code size={16} />
                    </button>
                  </div>

                  {/* Editor */}
                  <div className="overflow-hidden">
                    {mode === 'visual' ? (
                      <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={(e) => setContent((e.currentTarget as HTMLDivElement).innerHTML)}
                        className="min-h-[320px] p-4 text-gray-900 focus:outline-none max-w-none"
                        dir="ltr"
                        style={{ whiteSpace: 'normal', direction: 'ltr', textAlign: 'left', unicodeBidi: 'isolate', writingMode: 'horizontal-tb' }}
                      />
                    ) : (
                      <textarea
                        value={content}
                        onChange={(e) => setContent(sanitizeLTR(e.target.value))}
                        className="w-full min-h-[320px] p-4 font-mono text-sm bg-gray-900 text-green-300 rounded-b-md focus:outline-none resize-none"
                        placeholder="HTML source"
                        dir="ltr"
                        style={{ direction: 'ltr', textAlign: 'left' }}
                      />
                    )}
                  </div>
                </fieldset>
              </section>

              {/* SEO & Meta */}
              <section className="bg-white p-1 sm:p-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">SEO Title</label>
                    <input
                      type="text"
                      name="seoTitle"
                      value={formData.seoTitle || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
                      maxLength={60}
                    />
                    <div className="text-xs text-gray-500">{formData.seoTitle?.length || 0}/60</div>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-xs font-medium mb-1">SEO Description</label>
                    <textarea
                      name="seoDescription"
                      value={formData.seoDescription || ''}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-4 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
                      maxLength={160}
                    />
                    <div className="text-xs text-gray-500">{formData.seoDescription?.length || 0}/160</div>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center text-sm">
                      <input type="checkbox" name="featured" checked={!!formData.featured} onChange={handleChange} className="rounded mr-2" />
                      <span>Featured Post</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status || 'draft'}
                      onChange={handleChange}
                      className="w-full px-4 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="hidden lg:block" />
                </div>
              </section>
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-3 sm:p-4">
              <article className="max-w-4xl mx-auto">
                <header className="text-center mb-4">
                  <h1 className="text-xl sm:text-2xl font-bold mb-2">{formData.title}</h1>
                  <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1"><User size={14} /><span>{formData.author}</span></div>
                    <div className="flex items-center gap-1"><Calendar size={14} /><span>{new Date().toLocaleDateString()}</span></div>
                    <div className="flex items-center gap-1"><Tag size={14} /><span>{formData.category}</span></div>
                  </div>
                </header>

                {formData.featuredImage && (
                  <img src={formData.featuredImage} alt={formData.title} className="w-full h-32 sm:h-40 object-cover rounded-lg mb-4" />
                )}

                <div className="prose prose-sm max-w-none text-sm" dir="ltr" style={{ direction: 'ltr', textAlign: 'left' }}>
                  <div dangerouslySetInnerHTML={{ __html: `<div class="leading-relaxed" dir="ltr" style="direction:ltr;text-align:left">${sanitizeLTR(formData.content || '')}</div>` }} />
                </div>

                {formData.tags && formData.tags.length > 0 && (
                  <footer className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 mb-2"><Tag size={16} /><span className="font-medium text-sm">Tags:</span></div>
                    <div className="flex flex-wrap gap-1">
                      {formData.tags.map((tag, i) => (
                        <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{tag}</span>
                      ))}
                    </div>
                  </footer>
                )}
              </article>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-t bg-gray-50 gap-2">
          <div className="text-xs text-gray-600">
            Status{' '}
            <span className={`font-medium ${formData.status === 'published' ? 'text-green-600' : formData.status === 'draft' ? 'text-yellow-600' : 'text-gray-600'}`}>
              {String(formData.status || 'draft').charAt(0).toUpperCase() + String(formData.status || 'draft').slice(1)}
            </span>
            {error && <span className="text-red-600 ml-3">Error: {error}</span>}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button onClick={onCancel} className="flex-1 sm:flex-none px-3 py-1.5 text-sm border text-gray-700 rounded-md hover:bg-gray-100 transition-colors" disabled={saving}>
              Cancel
            </button>
            <button onClick={handleSaveDraftClick} className="flex-1 sm:flex-none px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center gap-1" disabled={saving} title={saving ? 'Saving...' : 'Save as draft'}>
              <Save size={14} /><span>{saving ? 'Saving...' : 'Draft'}</span>
            </button>
            <button onClick={handlePublishClick} className="flex-1 sm:flex-none px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-1" disabled={saving} title={saving ? 'Publishing...' : 'Publish'}>
              <Send size={14} /><span>{saving ? (formData.status === 'published' ? 'Publishing...' : 'Processing...') : 'Publish'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BlogPostEditor;
