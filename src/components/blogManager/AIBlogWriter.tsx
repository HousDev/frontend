// import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
// import {
//   Save, Send, X, Wand2,
//   Bold as BoldIcon, Italic as ItalicIcon, Underline as UnderlineIcon, Strikethrough as StrikeIcon,
//   AlignLeft, AlignCenter, AlignRight, AlignJustify,
//   List as BulletIcon, ListOrdered as NumberedIcon,
//   Link as LinkIcon, Image as ImageIcon, Code as CodeIcon, Quote as QuoteIcon,
//   Undo2 as UndoIcon, Redo2 as RedoIcon,
//   Calendar, Tag, User, Code, Bot, Sparkles, RefreshCw, Plus, Settings, Brain, TrendingUp, Search, BarChart3, CheckCircle, Clock
// } from 'lucide-react';
// import blogsAPI from '@/lib/blogsAPI';
// import { toast } from 'react-toastify';

// // ⭐️ Import union types so TS knows the allowed values
// import type { AITone, AILength } from '@/lib/blogsAPI';

// interface BlogPost {
//   title: string;
//   content: string;
//   excerpt: string;
//   author: string;
//   category: string;
//   tags: string[];
//   featured: boolean;
//   featuredImage: string; // keep as string; we already handle dataURL vs URL
//   seoTitle: string;
//   seoDescription: string;
//   status: 'draft' | 'published' | 'archived';
//   publishedAt?: string | null;
//   id?: number | string;
// }
// interface AIBlogWriterProps {
//   post?: BlogPost | null;
//   onSave?: (post: Partial<BlogPost>) => void; // ← optional
//   onCancel?: () => void;                      // ← optional
//   isOpen: boolean;
//   currentUserName?: string;
// }

// const CATEGORIES = [
//   'Real Estate', 'Investment', 'Market Analysis', 'Legal',
//   'Home Buying', 'Home Selling', 'Property News', 'Construction', 'Finance', 'Legal Updates'
// ];

// // (values exactly match AITone union)
// const AI_TONES: { value: AITone; label: string; description: string }[] = [
//   { value: 'professional', label: 'Professional', description: 'Formal and authoritative' },
//   { value: 'conversational', label: 'Conversational', description: 'Friendly and approachable' },
//   { value: 'expert', label: 'Expert', description: 'Technical and detailed' },
//   { value: 'beginner-friendly', label: 'Beginner-Friendly', description: 'Simple and educational' }
// ];

// // (values exactly match AILength union)
// const AI_LENGTHS: { value: AILength; label: string; description: string; time: string }[] = [
//   { value: 'short', label: 'Short', description: '300-500 words', time: '2-3 min read' },
//   { value: 'medium', label: 'Medium', description: '800-1200 words', time: '4-6 min read' },
//   { value: 'long', label: 'Long', description: '1500-2500 words', time: '7-12 min read' },
//   { value: 'comprehensive', label: 'Comprehensive', description: '3000+ words', time: '15+ min read' }
// ];

// const AI_AUDIENCES = [
//   { value: 'property-investors', label: 'Property Investors', description: 'Looking for investment opportunities' },
//   { value: 'first-time-buyers', label: 'First-time Buyers', description: 'New to property buying' },
//   { value: 'real-estate-agents', label: 'Real Estate Agents', description: 'Industry professionals' },
//   { value: 'property-sellers', label: 'Property Sellers', description: 'Looking to sell properties' },
//   { value: 'general-public', label: 'General Public', description: 'Broad audience interest' }
// ];

// const BIDI_REGEX = /[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;
// const sanitizeLTR = (html: string) =>
//   (html || '')
//     .replace(BIDI_REGEX, '')
//     .replace(/\sdir\s*=\s*"(?:rtl|auto)"/gi, ' dir="ltr"')
//     .replace(/\sdir\s*=\s*'(?:rtl|auto)'/gi, " dir='ltr'")
//     .replace(/direction\s*:\s*rtl\s*;?/gi, 'direction:ltr;')
//     .replace(/unicode-bidi\s*:\s*(?:bidi-override|plaintext|isolate-override)\s*;?/gi, 'unicode-bidi:isolate;');

// function useDebounced<T>(value: T, delay = 400) {
//   const [v, setV] = useState(value);
//   useEffect(() => {
//     const t = setTimeout(() => setV(value), delay);
//     return () => clearTimeout(t);
//   }, [value, delay]);
//   return v;
// }

// const AIBlogWriter: React.FC<AIBlogWriterProps> = ({
//   post, onSave, onCancel, isOpen, currentUserName
// }) => {
//   // ---- Defensive defaults to prevent runtime errors ----
//   const onSaveRef = useRef<((p: Partial<BlogPost>) => void) | null>(null);
//   const onCancelRef = useRef<(() => void) | null>(null);
//   useEffect(() => { onSaveRef.current = typeof onSave === 'function' ? onSave : null; }, [onSave]);
//   useEffect(() => { onCancelRef.current = typeof onCancel === 'function' ? onCancel : null; }, [onCancel]);

//   useEffect(() => {
//     if (!onSaveRef.current) {
//       console.warn('[AIBlogWriter] onSave prop was not provided or is not a function. Drafts will save but no parent callback will run.');
//     }
//   }, []);

//   const isEditing = !!post?.id;

//   const baseAuthorOptions = useMemo(() => ([
//     currentUserName || 'Admin', 'Admin', post?.author || ''
//   ].filter(Boolean) as string[]), [currentUserName, post?.author]);

//   const [formData, setFormData] = useState<Partial<BlogPost>>({
//     title: '', content: '', excerpt: '',
//     author: currentUserName || 'Admin',
//     category: '', tags: [], featured: false, featuredImage: '',
//     seoTitle: '', seoDescription: '', status: 'draft', publishedAt: null
//   });

//   const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
//   const [tagsInput, setTagsInput] = useState('');
//   const debouncedTags = useDebounced(tagsInput, 350);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [imgLoading, setImgLoading] = useState(false);
//   const [imgError, setImgError] = useState<string | null>(null);
//   const [imgDimensions, setImgDimensions] = useState<{ w: number; h: number } | null>(null);

//   const editorRef = useRef<HTMLDivElement | null>(null);
//   const [mode, setMode] = useState<'visual' | 'source'>('visual');
//   const [content, setContent] = useState<string>('');

//   // AI state
//   const [aiOpenMobile, setAiOpenMobile] = useState(false); // kept in case you use it elsewhere
//   const [aiPrompt, setAiPrompt] = useState('');
//   const [aiKeywords, setAiKeywords] = useState<string[]>([]);
//   const [aiKeywordInput, setAiKeywordInput] = useState('');
//   // ⭐️ Strongly-typed state (fixes TS2322)
//   const [aiTone, setAiTone] = useState<AITone>('professional');
//   const [aiLength, setAiLength] = useState<AILength>('medium');
//   const [aiCategory, setAiCategory] = useState('Real Estate');
//   const [aiAudience, setAiAudience] = useState('property-investors');
//   const [aiIncludeImages, setAiIncludeImages] = useState(true);
//   const [aiIncludeSEO, setAiIncludeSEO] = useState(true);
//   const [aiIncludeToc, setAiIncludeToc] = useState(true);
//   const [aiBusy, setAiBusy] = useState(false);
//   const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

//   // hydrate from incoming post
//   useEffect(() => {
//     if (post) {
//       setFormData({ ...post });
//       setTagsInput(post.tags?.join(', ') || '');
//       const html = sanitizeLTR(post.content || '');
//       setContent(html);
//       setAiCategory(post.category || 'Real Estate');
//       if (post.featuredImage && typeof post.featuredImage === 'string' && !post.featuredImage.startsWith('data:')) {
//         validateImageUrl(post.featuredImage);
//       } else {
//         setImgError(null); setImgLoading(false); setImgDimensions(null);
//       }
//     } else {
//       const fresh: Partial<BlogPost> = {
//         title: '', content: '', excerpt: '',
//         author: currentUserName || 'Admin',
//         category: 'Real Estate', tags: [], featured: false, featuredImage: '',
//         seoTitle: '', seoDescription: '', status: 'draft', publishedAt: null
//       };
//       setFormData(fresh);
//       setTagsInput('');
//       setContent('');
//       setAiCategory('Real Estate');
//       setImgError(null); setImgLoading(false); setImgDimensions(null);
//     }
//   }, [post, currentUserName]);

//   // keep formData.content in sync with content state
//   useEffect(() => { setFormData(prev => ({ ...prev, content })); }, [content]);

//   // 🔧 RELIABLE HYDRATION (fixes blank editor after Preview → Edit)
//   useEffect(() => {
//     if (mode !== 'visual' || !editorRef.current) return;
//     const el = editorRef.current;
//     const next = sanitizeLTR(content || '');

//     el.setAttribute('dir', 'ltr');
//     el.style.direction = 'ltr';
//     el.style.textAlign = 'left';
//     el.style.setProperty('unicode-bidi', 'isolate');
//     el.style.setProperty('writing-mode', 'horizontal-tb');

//     // Avoid redundant writes (prevents caret jump)
//     if (el.innerHTML !== next) {
//       el.innerHTML = next;
//     }
//   }, [mode, content, activeTab]);

//   // Paste & input sanitizers
//   useEffect(() => {
//     const el = editorRef.current;
//     if (!el) return;

//     const onPaste = (e: ClipboardEvent) => {
//       e.preventDefault();
//       const html = e.clipboardData?.getData('text/html') ?? '';
//       const text = e.clipboardData?.getData('text') ?? '';
//       const payload = sanitizeLTR(html || text);
//       document.execCommand(html ? 'insertHTML' : 'insertText', false, payload);
//       setContent(el.innerHTML);
//     };

//     const onBeforeInput = (e: InputEvent) => {
//       // @ts-ignore
//       const data: string | null = e.data ?? null;
//       if (data && BIDI_REGEX.test(data)) {
//         e.preventDefault();
//         const clean = data.replace(BIDI_REGEX, '');
//         document.execCommand('insertText', false, clean);
//         setContent(el.innerHTML);
//       }
//     };

//     el.addEventListener('paste', onPaste as any);
//     el.addEventListener('beforeinput', onBeforeInput as any);
//     return () => {
//       el.removeEventListener('paste', onPaste as any);
//       el.removeEventListener('beforeinput', onBeforeInput as any);
//     };
//   }, []);

//   if (!isOpen) return null;

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value, type } = e.target;
//     const checked = (e.target as HTMLInputElement).checked;

//     if (name === 'featuredImage') {
//       const url = value;
//       setFormData(prev => ({ ...prev, featuredImage: url }));
//       if (typeof url === 'string' && url.startsWith('data:')) {
//         setImgError(null); setImgLoading(false); setImgDimensions(null);
//       } else {
//         validateImageUrl(String(url));
//       }
//       return;
//     }

//     setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
//   };

//   const handleTagsChange = (value: string) => {
//     setTagsInput(value);
//     const tagsArr = value.split(',').map(t => t.trim()).filter(Boolean);
//     setFormData(prev => ({ ...prev, tags: tagsArr }));
//     setAiKeywords(tagsArr);
//   };

//   const exec = useCallback((cmd: string, value?: string) => {
//     if (mode !== 'visual') return;
//     editorRef.current?.focus();
//     document.execCommand(cmd, false, value);
//     if (editorRef.current) setContent(editorRef.current.innerHTML);
//   }, [mode]);

//   const insertBlock = (html: string) => {
//     if (mode !== 'visual' || !editorRef.current) {
//       setContent(prev => sanitizeLTR((prev || '') + html)); return;
//     }
//     editorRef.current.focus();
//     const sel = window.getSelection();
//     if (!sel || !sel.rangeCount) {
//       const next = (editorRef.current.innerHTML || '') + html;
//       editorRef.current.innerHTML = next;
//       setContent(sanitizeLTR(next)); return;
//     }
//     const range = sel.getRangeAt(0);
//     const temp = document.createElement('div');
//     temp.innerHTML = html;
//     const frag = document.createDocumentFragment();
//     let node: ChildNode | null;
//     while ((node = temp.firstChild)) frag.appendChild(node);
//     range.deleteContents(); range.insertNode(frag);
//     sel.collapseToEnd();
//     setContent(sanitizeLTR(editorRef.current.innerHTML));
//   };

//   const insertCodeBlock = () => insertBlock(
//     `<pre style="background:#0b1220;color:#d1fae5;padding:10px;border-radius:8px;overflow:auto;"><code>// your code here</code></pre>`
//   );
//   const insertQuote = () => insertBlock(
//     `<blockquote style="border-left:4px solid #2563eb;padding-left:12px;color:#334155;margin:8px 0;">Type your quote…</blockquote>`
//   );

//   const dataURLtoBlob = (dataurl: string): Blob => {
//     const arr = dataurl.split(',');
//     const mime = (arr[0].match(/:(.*?);/) || [])[1] || 'image/png';
//     const bstr = atob(arr[1]); let n = bstr.length;
//     const u8 = new Uint8Array(n); while (n--) u8[n] = bstr.charCodeAt(n);
//     return new Blob([u8], { type: mime });
//   };

//   const buildPayload = (
//     statusOverride?: 'draft' | 'published' | 'archived'
//   ): { payload: FormData | Record<string, any>; isFormData: boolean } => {
//     const effectiveStatus = statusOverride ?? (formData.status as any) ?? 'draft';
//     const payloadObj: Record<string, any> = {
//       title: formData.title || '',
//       content: formData.content || '',
//       excerpt: formData.excerpt || '',
//       author: formData.author || '',
//       category: formData.category || '',
//       tags: formData.tags || [],
//       featured: !!formData.featured,
//       seoTitle: formData.seoTitle || '',
//       seoDescription: formData.seoDescription || '',
//       status: effectiveStatus,
//       publishedAt: effectiveStatus === 'published' ? new Date().toISOString() : null,
//     };

//     if (formData.featuredImage && typeof formData.featuredImage === 'string' && formData.featuredImage.startsWith('data:')) {
//       const fd = new FormData();
//       Object.entries(payloadObj).forEach(([k, v]) => {
//         if (v === undefined) return;
//         if (k === 'tags') fd.append('tags', JSON.stringify(v));
//         else fd.append(k, String(v));
//       });
//       const blob = dataURLtoBlob(formData.featuredImage);
//       const ext = blob.type.split('/')[1] || 'png';
//       fd.append('featuredImage', blob, `featured.${ext}`);
//       return { payload: fd, isFormData: true };
//     }

//     if (formData.featuredImage) payloadObj.featuredImage = formData.featuredImage;
//     return { payload: payloadObj, isFormData: false };
//   };

//   const getPostId = (): number | string | undefined => (post as any)?.id ?? (formData as any)?.id;

//   const savePost = async (status: 'draft' | 'published' | 'archived') => {
//     setSaving(true); setError(null);
//     try {
//       const { payload, isFormData } = buildPayload(status);
//       const id = getPostId();
//       let responseData: any;

//       if (id !== undefined && id !== null) {
//         responseData = isFormData
//           ? await blogsAPI.updatePost(id, payload as FormData)
//           : await blogsAPI.updatePost(id, payload as Record<string, any>);
//       } else {
//         responseData = isFormData
//           ? await blogsAPI.createPost(payload as FormData)
//           : await blogsAPI.createPost(payload as Record<string, any>);
//       }

//       // 🔒 Guard before calling onSave to avoid "is not a function"
//       if (onSaveRef.current) {
//         try {
//           onSaveRef.current(responseData);
//         } catch (cbErr) {
//           console.warn('[AIBlogWriter] onSave callback threw:', cbErr);
//         }
//       }

//       setFormData(prev => ({ ...prev, ...(responseData || {}) }));
//       toast.success(status === 'published' ? 'Post published' : 'Draft saved');
//     } catch (err: any) {
//       console.error('Error saving post', err);
//       setError(err?.message || 'Failed to save post. Please try again.');
//       toast.error('Save failed');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleSaveDraftClick = () => savePost('draft');
//   const handlePublishClick = () => savePost('published');

//   const validateImageUrl = (url: string) => {
//     if (!url) { setImgError(null); setImgLoading(false); setImgDimensions(null); return; }
//     if (url.startsWith('data:')) { setImgError(null); setImgLoading(false); return; }
//     try { new URL(url); } catch { setImgError('Invalid image URL'); setImgLoading(false); setImgDimensions(null); return; }
//     setImgLoading(true); setImgError(null);
//     const img = new Image();
//     img.crossOrigin = 'anonymous'; img.src = url;
//     img.onload = () => {
//       setImgLoading(false); setImgError(null);
//       setImgDimensions({ w: (img as any).naturalWidth, h: (img as any).naturalHeight });
//       setFormData(prev => ({ ...prev, featuredImage: url }));
//     };
//     img.onerror = () => { setImgLoading(false); setImgError('Could not load image from URL'); setImgDimensions(null); };
//   };

//   const handleFileSelected = (file?: File | null) => {
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = (ev) => {
//       const dataUrl = ev.target?.result as string;
//       setFormData(prev => ({ ...prev, featuredImage: dataUrl }));
//       const img = new Image(); img.src = dataUrl; setImgLoading(true);
//       img.onload = () => { setImgLoading(false); setImgError(null); setImgDimensions({ w: (img as any).naturalWidth, h: (img as any).naturalHeight }); };
//       img.onerror = () => { setImgLoading(false); setImgError('Uploaded image could not be processed'); setImgDimensions(null); };
//     };
//     reader.readAsDataURL(file);
//   };

//   const copyUrlToClipboard = async () => {
//     const url = formData.featuredImage || ''; if (!url) return;
//     try { await navigator.clipboard.writeText(url); toast.success('Image URL copied'); } catch { /* ignore */ }
//   };
//   const openImageInNewTab = () => {
//     const url = formData.featuredImage || ''; if (!url) return;
//     window.open(url, '_blank', 'noopener');
//   };

//   const authorOptions = Array.from(new Set([...(baseAuthorOptions || []), formData.author || ''].filter(Boolean)));

//   const seedSuggestions = [
//     'Best Areas for Real Estate Investment in Mumbai 2025',
//     'Complete Guide to Home Loan Process in India',
//     'How to Calculate Property ROI and Investment Returns',
//     'Legal Documents Required for Property Purchase',
//     'Real Estate Market Predictions for Next 5 Years',
//     'Commercial vs Residential Property Investment',
//     'Tax Benefits and Deductions for Property Owners',
//     'How to Evaluate Property Before Buying',
//     'Real Estate Investment Trusts (REITs) Guide',
//     'Property Valuation Methods and Techniques',
//     'Understanding RERA and its Impact on Buyers',
//     'Rental Property Management Best Practices'
//   ];

//   const audienceKeywordsMap: Record<string, string[]> = {
//     'property-investors': ['investment', 'roi', 'returns', 'portfolio', 'analysis', 'yield', 'cash flow'],
//     'first-time-buyers': ['guide', 'beginner', 'process', 'tips', 'checklist', 'loan', 'emi'],
//     'real-estate-agents': ['market', 'leads', 'sales', 'clients', 'strategies', 'crm'],
//     'property-sellers': ['selling', 'valuation', 'marketing', 'pricing', 'documents', 'staging'],
//     'general-public': ['trends', 'news', 'market', 'overview', 'updates']
//   };

//   const computeSuggestions = useCallback(() => {
//     const userTokens = new Set<string>([
//       ...(aiKeywords || []),
//       ...(formData.tags || []),
//       ...(formData.category ? [formData.category] : []),
//       ...(formData.title ? formData.title.split(/\W+/) : [])
//     ].map(s => (s || '').toString().toLowerCase()).filter(Boolean));

//     const audienceHints = audienceKeywordsMap[aiAudience] || [];
//     const candidates = seedSuggestions
//       .map(s => ({ text: s, score: 0 }))
//       .map(item => {
//         const t = item.text.toLowerCase();
//         userTokens.forEach(tok => { if (tok && t.includes(tok)) item.score += 2; });
//         audienceHints.forEach(tok => { if (t.includes(tok)) item.score += 1; });
//         if (t.includes('mumbai')) item.score += 1;
//         if (t.includes('india')) item.score += 1;
//         if (t.includes('2025')) item.score += 1;
//         return item;
//       })
//       .sort((a, b) => b.score - a.score)
//       .slice(0, 6)
//       .map(i => i.text);

//     setAiSuggestions(candidates.length ? candidates : seedSuggestions.slice(0, 6));
//   }, [aiAudience, aiKeywords, formData.tags, formData.category, formData.title]);

//   const debouncedTitle = useDebounced(formData.title || '', 350);
//   useEffect(() => { computeSuggestions(); }, [computeSuggestions, debouncedTitle, debouncedTags]);

//   const handleAIWrite = async () => {
//     if (!formData.title && !aiPrompt) {
//       setError("Enter a Title (or AI Topic) first");
//       toast.error('Enter a Title or choose a suggested topic');
//       return;
//     }
//     const titleSeed = formData.title?.trim() || aiPrompt.trim();
//     setAiBusy(true); setError(null);
//     try {
//       const autoKeywords = [
//         (formData.category || aiCategory || 'Real Estate').toLowerCase(),
//         (aiAudience || 'general-public').replace('-', ' '),
//         '2025', 'Mumbai', 'India',
//         ...(formData.tags || [])
//       ];
//       const finalKeywords = Array.from(new Set([...(aiKeywords || []), ...autoKeywords]));

//       // NOTE: blogsAPI.AIGeneratePayload may not have `keywords` in its type.
//       // To avoid TS "excess property" error, cast as any here.
//       const res = await (blogsAPI as any).aiGenerateFromTitle({
//         title: titleSeed,
//         tone: aiTone,           // ✅ AITone
//         length: aiLength,       // ✅ AILength
//         includeSEO: aiIncludeSEO,
//         includeImages: aiIncludeImages,
//         includeToc: aiIncludeToc,
//         audience: aiAudience || 'general-public',
//         category: formData.category || aiCategory || 'Real Estate',
//         keywords: finalKeywords // (casted via any)
//       });

//       if (!res?.success || !res?.article) throw new Error(res?.message || 'AI failed');
//       const a = res.article;

//       // ⭐️ Safe access: AI response may not include featuredImage
//       const nextFeatured =
//         (typeof (a as any)?.featuredImage === 'string' ? (a as any).featuredImage : '') ||
//         formData.featuredImage ||
//         '';

//       setContent(sanitizeLTR(a.content || ''));
//       setFormData(prev => ({
//         ...prev,
//         title: a.title || prev.title || titleSeed,
//         excerpt: a.excerpt || prev.excerpt || '',
//         seoTitle: a.seoTitle || prev.seoTitle || (a.title || titleSeed),
//         seoDescription: a.seoDescription || prev.seoDescription || '',
//         tags: Array.isArray(a.tags) ? a.tags : (prev.tags || []),
//         category: a.category || prev.category || aiCategory,
//         featuredImage: nextFeatured,
//         status: 'draft',
//         publishedAt: null
//       }));

//       if (nextFeatured && !nextFeatured.startsWith('data:')) validateImageUrl(nextFeatured);
//       setMode('visual');
//       setActiveTab('preview');
//       toast.success('AI draft generated');
//     } catch (e: any) {
//       setError(e?.message || 'AI request failed');
//       toast.error(e?.message || 'AI request failed');
//     } finally {
//       setAiBusy(false);
//     }
//   };

//   const addAiKeyword = () => {
//     const k = aiKeywordInput.trim();
//     if (!k) return;
//     if (!aiKeywords.includes(k)) setAiKeywords([...aiKeywords, k]);
//     if (!(formData.tags || []).includes(k)) {
//       const merged = Array.from(new Set([...(formData.tags || []), k]));
//       setFormData(prev => ({ ...prev, tags: merged }));
//       setTagsInput(merged.join(', '));
//     }
//     setAiKeywordInput('');
//   };
//   const removeAiKeyword = (k: string) => {
//     setAiKeywords(aiKeywords.filter(x => x !== k));
//     const rest = (formData.tags || []).filter(x => x !== k);
//     setFormData(prev => ({ ...prev, tags: rest }));
//     setTagsInput(rest.join(', '));
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
//       <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl h-[92vh] flex">
//         {/* AI Panel */}
//         <aside className="border-r bg-gray-50 w-80 shrink-0 hidden md:flex md:flex-col">
//           <div className="p-4 border-b flex items-center gap-2">
//             <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center">
//               <Bot size={18} />
//             </div>
//             <div>
//               <div className="font-semibold">AI Blog Writer</div>
//               <div className="text-xs text-gray-500">SEO + ToC + Images</div>
//             </div>
//           </div>

//           <div className="p-4 space-y-4 overflow-y-auto">
//             <div>
//               <label className="block text-xs font-medium text-gray-700 mb-1">AI Topic / Title</label>
//               <textarea
//                 value={aiPrompt}
//                 onChange={(e) => setAiPrompt(e.target.value)}
//                 rows={2}
//                 className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
//                 placeholder=""
//               />
//             </div>

//             <div>
//               <div className="flex items-center justify-between mb-2">
//                 <h4 className="text-xs font-semibold text-gray-700">Smart Suggestions</h4>
//                 <button onClick={computeSuggestions} className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1">
//                   <RefreshCw size={12} /> Refresh
//                 </button>
//               </div>
//               <div className="space-y-2">
//                 {aiSuggestions.map((sug, i) => (
//                   <button
//                     key={i}
//                     onClick={() => { setAiPrompt(sug); setFormData(prev => ({ ...prev, title: prev.title || sug })); }}
//                     className="w-full p-2 text-left bg-white border rounded-lg hover:border-purple-300 hover:bg-purple-50 text-xs"
//                   >
//                     <div className="flex items-start gap-2">
//                       <Sparkles className="text-purple-600 mt-0.5" size={14} />
//                       <span>{sug}</span>
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             </div>

//             <div className="grid grid-cols-1 gap-3">
//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-1">Target Audience</label>
//                 <select
//                   value={aiAudience}
//                   onChange={(e) => setAiAudience(e.target.value)}
//                   className="w-full px-3 py-2 border rounded-lg text-sm"
//                 >
//                   {AI_AUDIENCES.map(a => (
//                     <option key={a.value} value={a.value}>{a.label} — {a.description}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
//                 <select
//                   value={formData.category || aiCategory}
//                   onChange={(e) => {
//                     setAiCategory(e.target.value);
//                     setFormData(prev => ({ ...prev, category: e.target.value }));
//                   }}
//                   className="w-full px-3 py-2 border rounded-lg text-sm"
//                 >
//                   {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
//                 </select>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 gap-3">
//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-1">Writing Tone</label>
//                 <select
//                   value={aiTone}
//                   onChange={(e) => setAiTone(e.target.value as AITone)}
//                   className="w-full px-3 py-2 border rounded-lg text-sm"
//                 >
//                   {AI_TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-xs font-medium text-gray-700 mb-1">Content Length</label>
//                 <select
//                   value={aiLength}
//                   onChange={(e) => setAiLength(e.target.value as AILength)}
//                   className="w-full px-3 py-2 border rounded-lg text-sm"
//                 >
//                   {AI_LENGTHS.map(l => <option key={l.value} value={l.value}>{l.label} • {l.time}</option>)}
//                 </select>
//               </div>
//             </div>

//             <div>
//               <label className="block text-xs font-medium text-gray-700 mb-1">Keywords & Tags</label>
//               <div className="flex gap-2">
//                 <input
//                   type="text"
//                   value={aiKeywordInput}
//                   onChange={(e) => setAiKeywordInput(e.target.value)}
//                   onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAiKeyword())}
//                   placeholder="Add keyword…"
//                   className="flex-1 px-3 py-2 border rounded-lg text-sm"
//                 />
//                 <button onClick={addAiKeyword} className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
//                   <Plus size={16} />
//                 </button>
//               </div>
//               {aiKeywords.length > 0 && (
//                 <div className="flex flex-wrap gap-2 mt-2">
//                   {aiKeywords.map((k, i) => (
//                     <span key={i} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
//                       {k}
//                       <button onClick={() => removeAiKeyword(k)} className="hover:text-purple-900">
//                         <X size={12} />
//                       </button>
//                     </span>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="bg-blue-50 rounded-lg p-3 space-y-2">
//               <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1">
//                 <Settings className="text-blue-600" size={18} />
//                 Advanced
//               </div>
//               <label className="flex items-center gap-2 text-sm">
//                 <input
//                   type="checkbox"
//                   checked={aiIncludeToc}
//                   onChange={(e) => setAiIncludeToc(e.target.checked)}
//                   className="rounded border-gray-300 text-purple-600"
//                 />
//                 <span>Table of Contents</span>
//               </label>
//               <label className="flex items-center gap-2 text-sm">
//                 <input
//                   type="checkbox"
//                   checked={aiIncludeImages}
//                   onChange={(e) => setAiIncludeImages(e.target.checked)}
//                   className="rounded border-gray-300 text-purple-600"
//                 />
//                 <span>Auto Images</span>
//               </label>
//               <label className="flex items-center gap-2 text-sm">
//                 <input
//                   type="checkbox"
//                   checked={aiIncludeSEO}
//                   onChange={(e) => setAiIncludeSEO(e.target.checked)}
//                   className="rounded border-gray-300 text-purple-600"
//                 />
//                 <span>SEO Optimization</span>
//               </label>
//             </div>

//             <button
//               onClick={handleAIWrite}
//               disabled={aiBusy || (!formData.title && !aiPrompt)}
//               className="w-full mt-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
//             >
//               {aiBusy ? (
//                 <>
//                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                   <span>Generating…</span>
//                 </>
//               ) : (
//                 <>
//                   <Wand2 size={18} />
//                   <span>Generate AI Draft</span>
//                   <Sparkles size={16} />
//                 </>
//               )}
//             </button>

//             {aiBusy && (
//               <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-2 text-xs space-y-1">
//                 <div className="flex items-center gap-2 font-semibold text-purple-900">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
//                   AI is generating your content…
//                 </div>
//                 <div className="flex items-center gap-2"><CheckCircle className="text-green-600" size={12} /> Analyzing topic & keywords</div>
//                 <div className="flex items-center gap-2"><Clock className="text-yellow-600" size={12} /> Writing SEO-optimized article</div>
//                 <div className="flex items-center gap-2"><Clock className="text-gray-400" size={12} /> Building ToC & anchors</div>
//               </div>
//             )}

//             <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 mt-2 space-y-3">
//               <div className="flex items-center gap-2 text-sm font-semibold"><Brain className="text-green-600" size={16} /> AI Content Insights</div>
//               <div className="grid grid-cols-1 gap-2 text-xs">
//                 <div className="bg-white rounded p-2">
//                   <div className="flex items-center gap-2 mb-1"><TrendingUp className="text-green-600" size={14} /><span className="font-medium">Trending</span></div>
//                   <ul className="space-y-0.5">
//                     <li>• Investment strategies</li>
//                     <li>• Mumbai market analysis</li>
//                     <li>• Home loan updates</li>
//                     <li>• RERA compliance</li>
//                   </ul>
//                 </div>
//                 <div className="bg-white rounded p-2">
//                   <div className="flex items-center gap-2 mb-1"><Search className="text-blue-600" size={14} /><span className="font-medium">High-Ranking Keywords</span></div>
//                   <ul className="space-y-0.5">
//                     <li>• real estate investment</li>
//                     <li>• property market trends</li>
//                     <li>• home buying guide</li>
//                     <li>• Mumbai properties</li>
//                   </ul>
//                 </div>
//                 <div className="bg-white rounded p-2">
//                   <div className="flex items-center gap-2 mb-1"><BarChart3 className="text-purple-600" size={14} /><span className="font-medium">Performance Hints</span></div>
//                   <ul className="space-y-0.5">
//                     <li>• Guides: +30% time on page</li>
//                     <li>• Market analysis: +22% shares</li>
//                     <li>• Investment: +15% engagement</li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </aside>

//         {/* Main Editor */}
//         <div className="flex-1 flex flex-col">
//           <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 rounded-t-xl">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <div>
//                   <h2 className="text-lg sm:text-xl font-bold">
//                     {isEditing ? 'Edit Post' : 'Create New Blog Post'}
//                   </h2>
//                   <p className="text-xs opacity-90 hidden sm:block">
//                     {isEditing ? `Editing: ${post?.title}` : 'Write and publish new content'}
//                   </p>
//                 </div>
//               </div>
//               <button onClick={() => onCancelRef.current?.()} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
//                 <X size={18} />
//               </button>
//             </div>
//           </div>

//           {/* Tabs */}
//           <div className="border-b border-gray-200 bg-gray-50">
//             <div className="flex">
//               {['edit', 'preview'].map((tab) => (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveTab(tab as 'edit' | 'preview')}
//                   className={`px-4 py-2 font-medium capitalize text-sm transition-colors ${activeTab === tab
//                     ? 'bg-white text-blue-600 border-b-2 border-blue-600'
//                     : 'text-gray-600 hover:text-gray-900'
//                     }`}
//                 >
//                   {tab}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className="flex-1 overflow-hidden">
//             {activeTab === 'edit' ? (
//               <div className="h-full overflow-y-auto p-3 sm:p-4 space-y-4">
//                 {/* Basic Info */}
//                 <section className="bg-white p-1 sm:p-1">
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//                     <div>
//                       <label className="block text-xs font-medium mb-1">Title *</label>
//                       <div className="flex gap-2">
//                         <input
//                           type="text"
//                           name="title"
//                           value={formData.title || ''}
//                           onChange={(e) => { handleChange(e as any); }}
//                           className="w-full px-4 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                           placeholder="Enter title"
//                           required
//                         />
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-xs font-medium mb-1">Category *</label>
//                       <select
//                         name="category"
//                         value={formData.category || ''}
//                         onChange={handleChange}
//                         className="w-full px-4 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
//                         required
//                       >
//                         <option value="">Select category</option>
//                         {CATEGORIES.map(cat => (
//                           <option key={cat} value={cat}>{cat}</option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-xs font-medium mb-1">Author</label>
//                       <select
//                         name="author"
//                         value={formData.author || ''}
//                         onChange={handleChange}
//                         className="w-full px-4 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
//                       >
//                         {authorOptions.map(opt => (
//                           <option key={opt} value={opt}>{opt}</option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>
//                 </section>

//                 {/* Media & Tags */}
//                 <section className="bg-white p-1 sm:p-1">
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//                     <div>
//                       <label className="block text-xs font-medium mb-1">Featured Image URL</label>
//                       <input
//                         type="url"
//                         name="featuredImage"
//                         value={formData.featuredImage || ''}
//                         onChange={handleChange}
//                         className="w-full px-4 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
//                         placeholder="https://example.com/image.jpg"
//                       />
//                       <div className="text-[11px] text-gray-500 mt-1">
//                         {imgLoading && <span>Validating image...</span>}
//                         {imgError && <span className="text-red-600">{imgError}</span>}
//                         {!imgLoading && !imgError && imgDimensions && (
//                           <span>Image size: {imgDimensions.w}×{imgDimensions.h}px</span>
//                         )}
//                       </div>
//                     </div>

//                     <div>
//                       <label className="block text-xs font-medium mb-1">Upload Featured Image</label>
//                       <input
//                         type="file"
//                         accept="image/*"
//                         onChange={(e) => {
//                           const file = (e.target as HTMLInputElement).files?.[0];
//                           handleFileSelected(file);
//                         }}
//                         className="w-full px-4 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-xs font-medium mb-1">Tags / Keywords</label>
//                       <input
//                         type="text"
//                         value={tagsInput}
//                         onChange={(e) => handleTagsChange(e.target.value)}
//                         className="w-full px-4 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
//                         placeholder="tag1, tag2, tag3"
//                       />
//                       {formData.tags && formData.tags.length > 0 && (
//                         <div className="flex flex-wrap gap-1 mt-2">
//                           {formData.tags.map((tag, i) => (
//                             <span key={i} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
//                               {tag}
//                             </span>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {formData.featuredImage && (
//                     <div className="mt-3">
//                       <div className="relative max-w-xl">
//                         <img
//                           src={formData.featuredImage}
//                           alt="Featured preview"
//                           className="w-full h-28 sm:h-32 object-cover rounded-md border"
//                           onLoad={(e) => {
//                             const img = e.currentTarget as HTMLImageElement;
//                             if (!imgDimensions) {
//                               setImgDimensions({ w: img.naturalWidth, h: img.naturalHeight });
//                               setImgError(null); setImgLoading(false);
//                             }
//                           }}
//                           onError={() => setImgError('Could not load preview')}
//                         />
//                         <div className="absolute top-1 right-1 flex gap-1">
//                           <button type="button" onClick={openImageInNewTab} className="bg-white text-gray-700 rounded px-2 py-1 text-xs hover:bg-gray-100">Open</button>
//                           <button type="button" onClick={copyUrlToClipboard} className="bg-white text-gray-700 rounded px-2 py-1 text-xs hover:bg-gray-100">Copy</button>
//                           <button
//                             type="button"
//                             onClick={() => { setFormData(prev => ({ ...prev, featuredImage: '' })); setImgDimensions(null); setImgError(null); }}
//                             className="bg-red-500 text-white rounded px-2 py-1 text-xs hover:bg-red-600"
//                           >
//                             <X size={12} />
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </section>

//                 {/* Excerpt & Content */}
//                 <section className="bg-white p-1 sm:p-1 space-y-2">
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//                     <div className="lg:col-span-3">
//                       <label className="block text-xs font-medium mb-1">Excerpt *</label>
//                       <textarea
//                         name="excerpt"
//                         value={formData.excerpt || ''}
//                         onChange={handleChange}
//                         rows={2}
//                         className="w-full px-2 py-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
//                         placeholder="Brief description"
//                         required
//                       />
//                     </div>
//                   </div>

//                   <fieldset className="border rounded-md">
//                     <legend className="text-sm font-medium text-gray-600 px-2">Content</legend>

//                     {/* Toolbar */}
//                     <div className="p-1 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center gap-1 text-gray-700">
//                       <button onClick={() => exec('bold')} title="Bold" className="p-2 rounded hover:bg-gray-200"><BoldIcon size={16} /></button>
//                       <button onClick={() => exec('italic')} title="Italic" className="p-2 rounded hover:bg-gray-200"><ItalicIcon size={16} /></button>
//                       <button onClick={() => exec('underline')} title="Underline" className="p-2 rounded hover:bg-gray-200"><UnderlineIcon size={16} /></button>
//                       <button onClick={() => exec('strikeThrough')} title="Strikethrough" className="p-2 rounded hover:bg-gray-200"><StrikeIcon size={16} /></button>

//                       <span className="w-px h-5 bg-gray-300 mx-1" />

//                       <button onClick={() => exec('justifyLeft')} title="Align Left" className="p-2 rounded hover:bg-gray-200"><AlignLeft size={16} /></button>
//                       <button onClick={() => exec('justifyCenter')} title="Align Center" className="p-2 rounded hover:bg-gray-200"><AlignCenter size={16} /></button>
//                       <button onClick={() => exec('justifyRight')} title="Align Right" className="p-2 rounded hover:bg-gray-200"><AlignRight size={16} /></button>
//                       <button onClick={() => exec('justifyFull')} title="Justify" className="p-2 rounded hover:bg-gray-200"><AlignJustify size={16} /></button>

//                       <span className="w-px h-5 bg-gray-300 mx-1" />

//                       <button onClick={() => exec('insertUnorderedList')} title="Bulleted List" className="p-2 rounded hover:bg-gray-200"><BulletIcon size={16} /></button>
//                       <button onClick={() => exec('insertOrderedList')} title="Numbered List" className="p-2 rounded hover:bg-gray-200"><NumberedIcon size={16} /></button>

//                       <span className="w-px h-5 bg-gray-300 mx-1" />

//                       <button
//                         onClick={() => {
//                           if (mode !== 'visual') return;
//                           const url = window.prompt('Enter URL (https://...)', 'https://');
//                           if (!url) return;
//                           exec('createLink', url);
//                         }}
//                         title="Insert Link"
//                         className="p-2 rounded hover:bg-gray-200"
//                       ><LinkIcon size={16} /></button>

//                       <button
//                         onClick={() => {
//                           if (mode !== 'visual') return;
//                           const url = window.prompt('Image URL (https://...)', 'https://');
//                           if (!url) return;
//                           exec('insertImage', url);
//                         }}
//                         title="Insert Image"
//                         className="p-2 rounded hover:bg-gray-200"
//                       ><ImageIcon size={16} /></button>

//                       <button onClick={insertCodeBlock} title="Code Block" className="p-2 rounded hover:bg-gray-200"><CodeIcon size={16} /></button>
//                       <button onClick={insertQuote} title="Quote" className="p-2 rounded hover:bg-gray-200">
//                         <QuoteIcon size={16} />
//                       </button>

//                       <span className="w-px h-5 bg-gray-300 mx-1" />
//                       <button onClick={() => exec('undo')} title="Undo" className="p-2 rounded hover:bg-gray-200"><UndoIcon size={16} /></button>
//                       <button onClick={() => exec('redo')} title="Redo" className="p-2 rounded hover:bg-gray-200"><RedoIcon size={16} /></button>

//                       <span className="w-px h-5 bg-gray-300 mx-1" />
//                       <button
//                         onClick={() => setMode(m => (m === 'visual' ? 'source' : 'visual'))}
//                         title={mode === 'source' ? 'Switch to Visual' : 'Show HTML Source'}
//                         className={`p-2 rounded hover:bg-gray-200 ${mode === 'source' ? 'bg-blue-100 text-blue-700' : ''}`}
//                       >
//                         <Code size={16} />
//                       </button>
//                     </div>

//                     {/* Editor */}
//                     <div className="overflow-hidden">
//                       {mode === 'visual' ? (
//                         <div
//                           ref={editorRef}
//                           contentEditable
//                           suppressContentEditableWarning
//                           onInput={(e) => setContent((e.currentTarget as HTMLDivElement).innerHTML)}
//                           className="min-h-[320px] p-4 text-gray-900 focus:outline-none max-w-none"
//                           dir="ltr"
//                           style={{ whiteSpace: 'normal', direction: 'ltr', textAlign: 'left', unicodeBidi: 'isolate', writingMode: 'horizontal-tb' }}
//                         />
//                       ) : (
//                         <textarea
//                           value={content}
//                           onChange={(e) => setContent(sanitizeLTR(e.target.value))}
//                           className="w-full min-h-[320px] p-4 font-mono text-sm bg-gray-900 text-green-300 rounded-b-md focus:outline-none resize-none"
//                           placeholder="HTML source"
//                           dir="ltr"
//                           style={{ direction: 'ltr', textAlign: 'left' }}
//                         />
//                       )}
//                     </div>
//                   </fieldset>
//                 </section>

//                 {/* SEO & Meta */}
//                 <section className="bg-white p-1 sm:p-1">
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//                     <div>
//                       <label className="block text-xs font-medium mb-1">SEO Title</label>
//                       <input
//                         type="text"
//                         name="seoTitle"
//                         value={formData.seoTitle || ''}
//                         onChange={handleChange}
//                         className="w-full px-4 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
//                         maxLength={60}
//                       />
//                       <div className="text-xs text-gray-500">{formData.seoTitle?.length || 0}/60</div>
//                     </div>

//                     <div className="lg:col-span-2">
//                       <label className="block text-xs font-medium mb-1">SEO Description</label>
//                       <textarea
//                         name="seoDescription"
//                         value={formData.seoDescription || ''}
//                         onChange={handleChange}
//                         rows={2}
//                         className="w-full px-4 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
//                         maxLength={160}
//                       />
//                       <div className="text-xs text-gray-500">{formData.seoDescription?.length || 0}/160</div>
//                     </div>

//                     <div className="flex items-center">
//                       <label className="flex items-center text-sm">
//                         <input type="checkbox" name="featured" checked={!!formData.featured} onChange={handleChange} className="rounded mr-2" />
//                         <span>Featured Post</span>
//                       </label>
//                     </div>

//                     <div>
//                       <label className="block text-xs font-medium mb-1">Status</label>
//                       <select
//                         name="status"
//                         value={formData.status || 'draft'}
//                         onChange={handleChange}
//                         className="w-full px-4 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
//                       >
//                         <option value="draft">Draft</option>
//                         <option value="published">Published</option>
//                         <option value="archived">Archived</option>
//                       </select>
//                     </div>

//                     <div className="hidden lg:block" />
//                   </div>
//                 </section>
//               </div>
//             ) : (
//               <div className="h-full overflow-y-auto p-3 sm:p-4">
//                 <article className="max-w-4xl mx-auto">
//                   <header className="text-center mb-4">
//                     <h1 className="text-xl sm:text-2xl font-bold mb-2">{formData.title}</h1>
//                     <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600">
//                       <div className="flex items-center gap-1"><User size={14} /><span>{formData.author}</span></div>
//                       <div className="flex items-center gap-1"><Calendar size={14} /><span>{new Date().toLocaleDateString()}</span></div>
//                       <div className="flex items-center gap-1"><Tag size={14} /><span>{formData.category}</span></div>
//                     </div>
//                   </header>

//                   {formData.featuredImage && (
//                     <img src={formData.featuredImage} alt={formData.title} className="w-full h-32 sm:h-40 object-cover rounded-lg mb-4" />
//                   )}

//                   <div className="prose prose-sm max-w-none text-sm" dir="ltr" style={{ direction: 'ltr', textAlign: 'left' }}>
//                     <div dangerouslySetInnerHTML={{ __html: `<div class="leading-relaxed" dir="ltr" style="direction:ltr;text-align:left">${sanitizeLTR(formData.content || '')}</div>` }} />
//                   </div>

//                   {formData.tags && formData.tags.length > 0 && (
//                     <footer className="mt-4 pt-4 border-t">
//                       <div className="flex items-center gap-2 mb-2"><Tag size={16} /><span className="font-medium text-sm">Tags:</span></div>
//                       <div className="flex flex-wrap gap-1">
//                         {formData.tags.map((tag, i) => (
//                           <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{tag}</span>
//                         ))}
//                       </div>
//                     </footer>
//                   )}
//                 </article>
//               </div>
//             )}
//           </div>

//           {/* Footer */}
//           <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-t bg-gray-50 gap-2 rounded-b-xl">
//             <div className="text-xs text-gray-600">
//               Status{' '}
//               <span className={`font-medium ${formData.status === 'published' ? 'text-green-600' : formData.status === 'draft' ? 'text-yellow-600' : 'text-gray-600'}`}>
//                 {String(formData.status || 'draft').charAt(0).toUpperCase() + String(formData.status || 'draft').slice(1)}
//               </span>
//               {error && <span className="text-red-600 ml-3">Error: {error}</span>}
//             </div>

//             <div className="flex items-center gap-2 w-full sm:w-auto">
//               <button
//                 onClick={() => onCancelRef.current?.()}
//                 className="flex-1 sm:flex-none px-3 py-1.5 text-sm border text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
//                 disabled={saving}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSaveDraftClick}
//                 className="flex-1 sm:flex-none px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center gap-1"
//                 disabled={saving}
//                 title={saving ? 'Saving...' : 'Save as draft'}
//               >
//                 <Save size={14} /><span>{saving ? 'Saving…' : 'Draft'}</span>
//               </button>
//               <button
//                 onClick={handlePublishClick}
//                 className="flex-1 sm:flex-none px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
//                 disabled={saving}
//                 title={saving ? 'Publishing...' : 'Publish'}
//               >
//                 <Send size={14} /><span>{saving ? (formData.status === 'published' ? 'Publishing…' : 'Processing…') : 'Publish'}</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AIBlogWriter;


// import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
// import {
//   Save, Send, X, Wand2,
//   Bold as BoldIcon, Italic as ItalicIcon, Underline as UnderlineIcon, Strikethrough as StrikeIcon,
//   AlignLeft, AlignCenter, AlignRight, AlignJustify,
//   List as BulletIcon, ListOrdered as NumberedIcon,
//   Link as LinkIcon, Image as ImageIcon, Code as CodeIcon, Quote as QuoteIcon,
//   Undo2 as UndoIcon, Redo2 as RedoIcon,
//   Calendar, Tag, User, Code, Bot, Sparkles, RefreshCw, Plus, Settings, Brain, TrendingUp, Search, BarChart3, CheckCircle, Clock, Zap,
//   Eye,
//   FileText
// } from 'lucide-react';
// import blogsAPI from '@/lib/blogsAPI';
// import { toast } from 'react-toastify';

// import type { AITone, AILength } from '@/lib/blogsAPI';

// // Theme Colors - Same as BlogPostEditor
// const N = "#0f2b3d";
// const O = "#e67e22";
// const BG = "#f8fafc";
// const BD = "#e2e8f0";
// const MU = "#5a7184";

// interface BlogPost {
//   title: string;
//   content: string;
//   excerpt: string;
//   author: string;
//   category: string;
//   tags: string[];
//   featured: boolean;
//   featuredImage: string;
//   seoTitle: string;
//   seoDescription: string;
//   status: 'draft' | 'published' | 'archived';
//   publishedAt?: string | null;
//   id?: number | string;
// }

// interface AIBlogWriterProps {
//   post?: BlogPost | null;
//   onSave?: (post: Partial<BlogPost>) => void;
//   onCancel?: () => void;
//   isOpen: boolean;
//   currentUserName?: string;
// }

// const CATEGORIES = [
//   'Real Estate', 'Investment', 'Market Analysis', 'Legal',
//   'Home Buying', 'Home Selling', 'Property News', 'Construction', 'Finance', 'Legal Updates'
// ];

// const AI_TONES: { value: AITone; label: string; description: string }[] = [
//   { value: 'professional', label: 'Professional', description: 'Formal and authoritative' },
//   { value: 'conversational', label: 'Conversational', description: 'Friendly and approachable' },
//   { value: 'expert', label: 'Expert', description: 'Technical and detailed' },
//   { value: 'beginner-friendly', label: 'Beginner-Friendly', description: 'Simple and educational' }
// ];

// const AI_LENGTHS: { value: AILength; label: string; description: string; time: string }[] = [
//   { value: 'short', label: 'Short', description: '300-500 words', time: '2-3 min' },
//   { value: 'medium', label: 'Medium', description: '800-1200 words', time: '4-6 min' },
//   { value: 'long', label: 'Long', description: '1500-2500 words', time: '7-12 min' },
//   { value: 'comprehensive', label: 'Comprehensive', description: '3000+ words', time: '15+ min' }
// ];

// const AI_AUDIENCES = [
//   { value: 'property-investors', label: 'Property Investors', description: 'Investment opportunities' },
//   { value: 'first-time-buyers', label: 'First-time Buyers', description: 'New to property buying' },
//   { value: 'real-estate-agents', label: 'Real Estate Agents', description: 'Industry professionals' },
//   { value: 'property-sellers', label: 'Property Sellers', description: 'Looking to sell' },
//   { value: 'general-public', label: 'General Public', description: 'Broad audience' }
// ];

// const BIDI_REGEX = /[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;
// const sanitizeLTR = (html: string) =>
//   (html || '')
//     .replace(BIDI_REGEX, '')
//     .replace(/\sdir\s*=\s*"(?:rtl|auto)"/gi, ' dir="ltr"')
//     .replace(/\sdir\s*=\s*'(?:rtl|auto)'/gi, " dir='ltr'")
//     .replace(/direction\s*:\s*rtl\s*;?/gi, 'direction:ltr;')
//     .replace(/unicode-bidi\s*:\s*(?:bidi-override|plaintext|isolate-override)\s*;?/gi, 'unicode-bidi:isolate;');

// const scrollbarStyles = {
//   scrollbarWidth: 'thin',
//   scrollbarColor: `${BD} ${BG}`,
//   WebkitOverflowScrolling: 'touch',
// };

// function useDebounced<T>(value: T, delay = 400) {
//   const [v, setV] = useState(value);
//   useEffect(() => {
//     const t = setTimeout(() => setV(value), delay);
//     return () => clearTimeout(t);
//   }, [value, delay]);
//   return v;
// }

// const AIBlogWriter: React.FC<AIBlogWriterProps> = ({
//   post, onSave, onCancel, isOpen, currentUserName
// }) => {
//   const onSaveRef = useRef<((p: Partial<BlogPost>) => void) | null>(null);
//   const onCancelRef = useRef<(() => void) | null>(null);
//   useEffect(() => { onSaveRef.current = typeof onSave === 'function' ? onSave : null; }, [onSave]);
//   useEffect(() => { onCancelRef.current = typeof onCancel === 'function' ? onCancel : null; }, [onCancel]);

//   const isEditing = !!post?.id;

//   const baseAuthorOptions = useMemo(() => ([
//     currentUserName || 'Admin', 'Admin', post?.author || ''
//   ].filter(Boolean) as string[]), [currentUserName, post?.author]);

//   const [formData, setFormData] = useState<Partial<BlogPost>>({
//     title: '', content: '', excerpt: '',
//     author: currentUserName || 'Admin',
//     category: '', tags: [], featured: false, featuredImage: '',
//     seoTitle: '', seoDescription: '', status: 'draft', publishedAt: null
//   });

//   const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
//   const [tagsInput, setTagsInput] = useState('');
//   const debouncedTags = useDebounced(tagsInput, 350);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [imgLoading, setImgLoading] = useState(false);
//   const [imgError, setImgError] = useState<string | null>(null);
//   const [imgDimensions, setImgDimensions] = useState<{ w: number; h: number } | null>(null);

//   const editorRef = useRef<HTMLDivElement | null>(null);
//   const [mode, setMode] = useState<'visual' | 'source'>('visual');
//   const [content, setContent] = useState<string>('');

//   const [aiPrompt, setAiPrompt] = useState('');
//   const [aiKeywords, setAiKeywords] = useState<string[]>([]);
//   const [aiKeywordInput, setAiKeywordInput] = useState('');
//   const [aiTone, setAiTone] = useState<AITone>('professional');
//   const [aiLength, setAiLength] = useState<AILength>('medium');
//   const [aiCategory, setAiCategory] = useState('Real Estate');
//   const [aiAudience, setAiAudience] = useState('property-investors');
//   const [aiIncludeImages, setAiIncludeImages] = useState(true);
//   const [aiIncludeSEO, setAiIncludeSEO] = useState(true);
//   const [aiIncludeToc, setAiIncludeToc] = useState(true);
//   const [aiBusy, setAiBusy] = useState(false);
//   const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

//   useEffect(() => {
//     if (post) {
//       setFormData({ ...post });
//       setTagsInput(post.tags?.join(', ') || '');
//       const html = sanitizeLTR(post.content || '');
//       setContent(html);
//       setAiCategory(post.category || 'Real Estate');
//       if (post.featuredImage && typeof post.featuredImage === 'string' && !post.featuredImage.startsWith('data:')) {
//         validateImageUrl(post.featuredImage);
//       } else {
//         setImgError(null); setImgLoading(false); setImgDimensions(null);
//       }
//     } else {
//       const fresh: Partial<BlogPost> = {
//         title: '', content: '', excerpt: '',
//         author: currentUserName || 'Admin',
//         category: 'Real Estate', tags: [], featured: false, featuredImage: '',
//         seoTitle: '', seoDescription: '', status: 'draft', publishedAt: null
//       };
//       setFormData(fresh);
//       setTagsInput('');
//       setContent('');
//       setAiCategory('Real Estate');
//       setImgError(null); setImgLoading(false); setImgDimensions(null);
//     }
//   }, [post, currentUserName]);

//   useEffect(() => { setFormData(prev => ({ ...prev, content })); }, [content]);

//   useEffect(() => {
//     if (mode !== 'visual' || !editorRef.current) return;
//     const el = editorRef.current;
//     const next = sanitizeLTR(content || '');
//     el.setAttribute('dir', 'ltr');
//     el.style.direction = 'ltr';
//     el.style.textAlign = 'left';
//     el.style.setProperty('unicode-bidi', 'isolate');
//     el.style.setProperty('writing-mode', 'horizontal-tb');
//     if (el.innerHTML !== next) {
//       el.innerHTML = next;
//     }
//   }, [mode, content, activeTab]);

//   useEffect(() => {
//     const el = editorRef.current;
//     if (!el) return;

//     const onPaste = (e: ClipboardEvent) => {
//       e.preventDefault();
//       const html = e.clipboardData?.getData('text/html') ?? '';
//       const text = e.clipboardData?.getData('text') ?? '';
//       const payload = sanitizeLTR(html || text);
//       document.execCommand(html ? 'insertHTML' : 'insertText', false, payload);
//       setContent(el.innerHTML);
//     };

//     const onBeforeInput = (e: InputEvent) => {
//       const data: string | null = (e as any).data ?? null;
//       if (data && BIDI_REGEX.test(data)) {
//         e.preventDefault();
//         const clean = data.replace(BIDI_REGEX, '');
//         document.execCommand('insertText', false, clean);
//         setContent(el.innerHTML);
//       }
//     };

//     el.addEventListener('paste', onPaste as any);
//     el.addEventListener('beforeinput', onBeforeInput as any);
//     return () => {
//       el.removeEventListener('paste', onPaste as any);
//       el.removeEventListener('beforeinput', onBeforeInput as any);
//     };
//   }, []);

//   if (!isOpen) return null;

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value, type } = e.target;
//     const checked = (e.target as HTMLInputElement).checked;

//     if (name === 'featuredImage') {
//       const url = value;
//       setFormData(prev => ({ ...prev, featuredImage: url }));
//       if (typeof url === 'string' && url.startsWith('data:')) {
//         setImgError(null); setImgLoading(false); setImgDimensions(null);
//       } else {
//         validateImageUrl(String(url));
//       }
//       return;
//     }

//     setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
//   };

//   const handleTagsChange = (value: string) => {
//     setTagsInput(value);
//     const tagsArr = value.split(',').map(t => t.trim()).filter(Boolean);
//     setFormData(prev => ({ ...prev, tags: tagsArr }));
//     setAiKeywords(tagsArr);
//   };

//   const exec = useCallback((cmd: string, value?: string) => {
//     if (mode !== 'visual') return;
//     editorRef.current?.focus();
//     document.execCommand(cmd, false, value);
//     if (editorRef.current) setContent(editorRef.current.innerHTML);
//   }, [mode]);

//   const insertBlock = (html: string) => {
//     if (mode !== 'visual' || !editorRef.current) {
//       setContent(prev => sanitizeLTR((prev || '') + html)); return;
//     }
//     editorRef.current.focus();
//     const sel = window.getSelection();
//     if (!sel || !sel.rangeCount) {
//       const next = (editorRef.current.innerHTML || '') + html;
//       editorRef.current.innerHTML = next;
//       setContent(sanitizeLTR(next)); return;
//     }
//     const range = sel.getRangeAt(0);
//     const temp = document.createElement('div');
//     temp.innerHTML = html;
//     const frag = document.createDocumentFragment();
//     let node: ChildNode | null;
//     while ((node = temp.firstChild)) frag.appendChild(node);
//     range.deleteContents(); range.insertNode(frag);
//     sel.collapseToEnd();
//     setContent(sanitizeLTR(editorRef.current.innerHTML));
//   };

//   const insertCodeBlock = () => insertBlock(
//     `<pre style="background:#0b1220;color:#d1fae5;padding:6px;border-radius:6px;overflow:auto;font-size:11px;"><code>// your code here</code></pre>`
//   );
//   const insertQuote = () => insertBlock(
//     `<blockquote style="border-left:3px solid ${O};padding-left:10px;color:#334155;margin:4px 0;font-size:11px;">Type your quote…</blockquote>`
//   );

//   const dataURLtoBlob = (dataurl: string): Blob => {
//     const arr = dataurl.split(',');
//     const mime = (arr[0].match(/:(.*?);/) || [])[1] || 'image/png';
//     const bstr = atob(arr[1]); let n = bstr.length;
//     const u8 = new Uint8Array(n); while (n--) u8[n] = bstr.charCodeAt(n);
//     return new Blob([u8], { type: mime });
//   };

//   const buildPayload = (
//     statusOverride?: 'draft' | 'published' | 'archived'
//   ): { payload: FormData | Record<string, any>; isFormData: boolean } => {
//     const effectiveStatus = statusOverride ?? (formData.status as any) ?? 'draft';
//     const payloadObj: Record<string, any> = {
//       title: formData.title || '',
//       content: formData.content || '',
//       excerpt: formData.excerpt || '',
//       author: formData.author || '',
//       category: formData.category || '',
//       tags: formData.tags || [],
//       featured: !!formData.featured,
//       seoTitle: formData.seoTitle || '',
//       seoDescription: formData.seoDescription || '',
//       status: effectiveStatus,
//       publishedAt: effectiveStatus === 'published' ? new Date().toISOString() : null,
//     };

//     if (formData.featuredImage && typeof formData.featuredImage === 'string' && formData.featuredImage.startsWith('data:')) {
//       const fd = new FormData();
//       Object.entries(payloadObj).forEach(([k, v]) => {
//         if (v === undefined) return;
//         if (k === 'tags') fd.append('tags', JSON.stringify(v));
//         else fd.append(k, String(v));
//       });
//       const blob = dataURLtoBlob(formData.featuredImage);
//       const ext = blob.type.split('/')[1] || 'png';
//       fd.append('featuredImage', blob, `featured.${ext}`);
//       return { payload: fd, isFormData: true };
//     }

//     if (formData.featuredImage) payloadObj.featuredImage = formData.featuredImage;
//     return { payload: payloadObj, isFormData: false };
//   };

//   const getPostId = (): number | string | undefined => (post as any)?.id ?? (formData as any)?.id;

//   const savePost = async (status: 'draft' | 'published' | 'archived') => {
//     setSaving(true); setError(null);
//     try {
//       const { payload, isFormData } = buildPayload(status);
//       const id = getPostId();
//       let responseData: any;

//       if (id !== undefined && id !== null) {
//         responseData = isFormData
//           ? await blogsAPI.updatePost(id, payload as FormData)
//           : await blogsAPI.updatePost(id, payload as Record<string, any>);
//       } else {
//         responseData = isFormData
//           ? await blogsAPI.createPost(payload as FormData)
//           : await blogsAPI.createPost(payload as Record<string, any>);
//       }

//       if (onSaveRef.current) {
//         onSaveRef.current(responseData);
//       }

//       setFormData(prev => ({ ...prev, ...(responseData || {}) }));
//       toast.success(status === 'published' ? 'Post published' : 'Draft saved');
//     } catch (err: any) {
//       console.error('Error saving post', err);
//       setError(err?.message || 'Failed to save post. Please try again.');
//       toast.error('Save failed');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleSaveDraftClick = () => savePost('draft');
//   const handlePublishClick = () => savePost('published');

//   const validateImageUrl = (url: string) => {
//     if (!url) { setImgError(null); setImgLoading(false); setImgDimensions(null); return; }
//     if (url.startsWith('data:')) { setImgError(null); setImgLoading(false); return; }
//     try { new URL(url); } catch { setImgError('Invalid image URL'); setImgLoading(false); setImgDimensions(null); return; }
//     setImgLoading(true); setImgError(null);
//     const img = new Image();
//     img.crossOrigin = 'anonymous'; img.src = url;
//     img.onload = () => {
//       setImgLoading(false); setImgError(null);
//       setImgDimensions({ w: (img as any).naturalWidth, h: (img as any).naturalHeight });
//       setFormData(prev => ({ ...prev, featuredImage: url }));
//     };
//     img.onerror = () => { setImgLoading(false); setImgError('Could not load image from URL'); setImgDimensions(null); };
//   };

//   const handleFileSelected = (file?: File | null) => {
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = (ev) => {
//       const dataUrl = ev.target?.result as string;
//       setFormData(prev => ({ ...prev, featuredImage: dataUrl }));
//       const img = new Image(); img.src = dataUrl; setImgLoading(true);
//       img.onload = () => { setImgLoading(false); setImgError(null); setImgDimensions({ w: (img as any).naturalWidth, h: (img as any).naturalHeight }); };
//       img.onerror = () => { setImgLoading(false); setImgError('Uploaded image could not be processed'); setImgDimensions(null); };
//     };
//     reader.readAsDataURL(file);
//   };

//   const copyUrlToClipboard = async () => {
//     const url = formData.featuredImage || ''; if (!url) return;
//     try { await navigator.clipboard.writeText(url); toast.success('Image URL copied'); } catch { }
//   };
//   const openImageInNewTab = () => {
//     const url = formData.featuredImage || ''; if (!url) return;
//     window.open(url, '_blank', 'noopener');
//   };

//   const authorOptions = Array.from(new Set([...(baseAuthorOptions || []), formData.author || ''].filter(Boolean)));

//   const seedSuggestions = [
//     'Best Areas for Real Estate Investment in Mumbai 2025',
//     'Complete Guide to Home Loan Process in India',
//     'How to Calculate Property ROI and Investment Returns',
//     'Legal Documents Required for Property Purchase',
//     'Real Estate Market Predictions for Next 5 Years'
//   ];

//   const audienceKeywordsMap: Record<string, string[]> = {
//     'property-investors': ['investment', 'roi', 'returns', 'portfolio'],
//     'first-time-buyers': ['guide', 'beginner', 'process', 'tips'],
//     'real-estate-agents': ['market', 'leads', 'sales', 'clients'],
//     'property-sellers': ['selling', 'valuation', 'marketing', 'pricing'],
//     'general-public': ['trends', 'news', 'market', 'overview']
//   };

//   const computeSuggestions = useCallback(() => {
//     const userTokens = new Set<string>([
//       ...(aiKeywords || []),
//       ...(formData.tags || []),
//       ...(formData.category ? [formData.category] : []),
//       ...(formData.title ? formData.title.split(/\W+/) : [])
//     ].map(s => (s || '').toString().toLowerCase()).filter(Boolean));

//     const audienceHints = audienceKeywordsMap[aiAudience] || [];
//     const candidates = seedSuggestions
//       .map(s => ({ text: s, score: 0 }))
//       .map(item => {
//         const t = item.text.toLowerCase();
//         userTokens.forEach(tok => { if (tok && t.includes(tok)) item.score += 2; });
//         audienceHints.forEach(tok => { if (t.includes(tok)) item.score += 1; });
//         return item;
//       })
//       .sort((a, b) => b.score - a.score)
//       .slice(0, 4)
//       .map(i => i.text);

//     setAiSuggestions(candidates.length ? candidates : seedSuggestions.slice(0, 4));
//   }, [aiAudience, aiKeywords, formData.tags, formData.category, formData.title]);

//   const debouncedTitle = useDebounced(formData.title || '', 350);
//   useEffect(() => { computeSuggestions(); }, [computeSuggestions, debouncedTitle, debouncedTags]);

//   const handleAIWrite = async () => {
//     if (!formData.title && !aiPrompt) {
//       setError("Enter a Title first");
//       toast.error('Enter a Title');
//       return;
//     }
//     const titleSeed = formData.title?.trim() || aiPrompt.trim();
//     setAiBusy(true); setError(null);
//     try {
//       const autoKeywords = [
//         (formData.category || aiCategory || 'Real Estate').toLowerCase(),
//         (aiAudience || 'general-public').replace('-', ' '),
//         ...(formData.tags || [])
//       ];
//       const finalKeywords = Array.from(new Set([...(aiKeywords || []), ...autoKeywords]));

//       const res = await (blogsAPI as any).aiGenerateFromTitle({
//         title: titleSeed,
//         tone: aiTone,
//         length: aiLength,
//         includeSEO: aiIncludeSEO,
//         includeImages: aiIncludeImages,
//         includeToc: aiIncludeToc,
//         audience: aiAudience || 'general-public',
//         category: formData.category || aiCategory || 'Real Estate',
//         keywords: finalKeywords
//       });

//       if (!res?.success || !res?.article) throw new Error(res?.message || 'AI failed');
//       const a = res.article;

//       const nextFeatured = (a as any)?.featuredImage || formData.featuredImage || '';

//       setContent(sanitizeLTR(a.content || ''));
//       setFormData(prev => ({
//         ...prev,
//         title: a.title || prev.title || titleSeed,
//         excerpt: a.excerpt || prev.excerpt || '',
//         seoTitle: a.seoTitle || prev.seoTitle || (a.title || titleSeed),
//         seoDescription: a.seoDescription || prev.seoDescription || '',
//         tags: Array.isArray(a.tags) ? a.tags : (prev.tags || []),
//         category: a.category || prev.category || aiCategory,
//         featuredImage: nextFeatured,
//         status: 'draft',
//         publishedAt: null
//       }));

//       if (nextFeatured && !nextFeatured.startsWith('data:')) validateImageUrl(nextFeatured);
//       setMode('visual');
//       setActiveTab('preview');
//       toast.success('AI draft generated');
//     } catch (e: any) {
//       setError(e?.message || 'AI request failed');
//       toast.error(e?.message || 'AI request failed');
//     } finally {
//       setAiBusy(false);
//     }
//   };

//   const addAiKeyword = () => {
//     const k = aiKeywordInput.trim();
//     if (!k) return;
//     if (!aiKeywords.includes(k)) setAiKeywords([...aiKeywords, k]);
//     if (!(formData.tags || []).includes(k)) {
//       const merged = Array.from(new Set([...(formData.tags || []), k]));
//       setFormData(prev => ({ ...prev, tags: merged }));
//       setTagsInput(merged.join(', '));
//     }
//     setAiKeywordInput('');
//   };
//   const removeAiKeyword = (k: string) => {
//     setAiKeywords(aiKeywords.filter(x => x !== k));
//     const rest = (formData.tags || []).filter(x => x !== k);
//     setFormData(prev => ({ ...prev, tags: rest }));
//     setTagsInput(rest.join(', '));
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-2" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}>
//       <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[78vh] flex overflow-hidden" style={{ border: `1px solid ${BD}` }}>
        
//         {/* AI Panel - Left Side (Compact) */}
//         <aside className="hidden md:flex md:flex-col w-72 shrink-0" style={{ background: BG, borderRight: `1px solid ${BD}` }}>
//           <div className="p-2 border-b" style={{ borderColor: BD, background: N }}>
//             <div className="flex items-center gap-2">
//               <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${O}20` }}>
//                 <Bot size={14} style={{ color: O }} />
//               </div>
//               <div>
//                 <div className="text-xs font-bold text-white">AI Blog Writer</div>
//                 <div className="text-[9px] text-white/70">SEO + Images + ToC</div>
//               </div>
//             </div>
//           </div>

//           <div className="flex-1 overflow-y-auto p-2 space-y-2" style={scrollbarStyles}>
//             {/* AI Topic */}
//             <div>
//               <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>Topic / Title</label>
//               <textarea
//                 value={aiPrompt}
//                 onChange={(e) => setAiPrompt(e.target.value)}
//                 rows={2}
//                 className="w-full px-1.5 py-1 text-[10px] border rounded focus:outline-none focus:ring-1 resize-none"
//                 style={{ borderColor: BD }}
//                 placeholder="Enter topic..."
//               />
//             </div>

//             {/* Suggestions */}
//             <div>
//               <div className="flex items-center justify-between mb-0.5">
//                 <span className="text-[9px] font-semibold" style={{ color: N }}>Suggestions</span>
//                 <button onClick={computeSuggestions} className="text-[8px] flex items-center gap-0.5" style={{ color: O }}>
//                   <RefreshCw size={8} /> Refresh
//                 </button>
//               </div>
//               <div className="space-y-0.5">
//                 {aiSuggestions.map((sug, i) => (
//                   <button
//                     key={i}
//                     onClick={() => { setAiPrompt(sug); setFormData(prev => ({ ...prev, title: prev.title || sug })); }}
//                     className="w-full p-1 text-left border rounded text-[9px] truncate hover:shadow-sm"
//                     style={{ background: 'white', borderColor: BD }}
//                   >
//                     <div className="flex items-center gap-1">
//                       <Sparkles size={8} style={{ color: O }} />
//                       <span className="truncate">{sug}</span>
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Audience & Category */}
//             <div className="grid grid-cols-2 gap-1.5">
//               <div>
//                 <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>Audience</label>
//                 <select
//                   value={aiAudience}
//                   onChange={(e) => setAiAudience(e.target.value)}
//                   className="w-full px-1.5 py-1 text-[9px] border rounded focus:outline-none focus:ring-1"
//                   style={{ borderColor: BD }}
//                 >
//                   {AI_AUDIENCES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>Category</label>
//                 <select
//                   value={formData.category || aiCategory}
//                   onChange={(e) => {
//                     setAiCategory(e.target.value);
//                     setFormData(prev => ({ ...prev, category: e.target.value }));
//                   }}
//                   className="w-full px-1.5 py-1 text-[9px] border rounded focus:outline-none focus:ring-1"
//                   style={{ borderColor: BD }}
//                 >
//                   {CATEGORIES.slice(0, 5).map(cat => <option key={cat} value={cat}>{cat}</option>)}
//                 </select>
//               </div>
//             </div>

//             {/* Tone & Length */}
//             <div className="grid grid-cols-2 gap-1.5">
//               <div>
//                 <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>Tone</label>
//                 <select
//                   value={aiTone}
//                   onChange={(e) => setAiTone(e.target.value as AITone)}
//                   className="w-full px-1.5 py-1 text-[9px] border rounded focus:outline-none focus:ring-1"
//                   style={{ borderColor: BD }}
//                 >
//                   {AI_TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>Length</label>
//                 <select
//                   value={aiLength}
//                   onChange={(e) => setAiLength(e.target.value as AILength)}
//                   className="w-full px-1.5 py-1 text-[9px] border rounded focus:outline-none focus:ring-1"
//                   style={{ borderColor: BD }}
//                 >
//                   {AI_LENGTHS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
//                 </select>
//               </div>
//             </div>

//             {/* Keywords */}
//             <div>
//               <label className="block text-[9px] font-semibold mb-0.5" style={{ color: N }}>Keywords</label>
//               <div className="flex gap-1">
//                 <input
//                   type="text"
//                   value={aiKeywordInput}
//                   onChange={(e) => setAiKeywordInput(e.target.value)}
//                   onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAiKeyword())}
//                   placeholder="Add keyword"
//                   className="flex-1 px-1.5 py-1 text-[9px] border rounded focus:outline-none focus:ring-1"
//                   style={{ borderColor: BD }}
//                 />
//                 <button onClick={addAiKeyword} className="px-1.5 py-1 rounded text-white" style={{ background: O }}>
//                   <Plus size={10} />
//                 </button>
//               </div>
//               {aiKeywords.length > 0 && (
//                 <div className="flex flex-wrap gap-0.5 mt-1">
//                   {aiKeywords.map((k, i) => (
//                     <span key={i} className="px-1 py-0.5 rounded-full text-[8px] flex items-center gap-0.5" style={{ background: `${O}15`, color: O }}>
//                       {k}
//                       <button onClick={() => removeAiKeyword(k)}><X size={7} /></button>
//                     </span>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Advanced */}
//             <div className="p-1.5 rounded" style={{ background: `${N}05`, border: `1px solid ${BD}` }}>
//               <div className="flex items-center gap-1 mb-0.5">
//                 <Settings size={9} style={{ color: O }} />
//                 <span className="text-[8px] font-semibold" style={{ color: N }}>Advanced</span>
//               </div>
//               <div className="space-y-0.5">
//                 <label className="flex items-center gap-1 text-[8px] cursor-pointer">
//                   <input type="checkbox" checked={aiIncludeToc} onChange={(e) => setAiIncludeToc(e.target.checked)} className="rounded w-2.5 h-2.5" style={{ accentColor: O }} />
//                   <span>Table of Contents</span>
//                 </label>
//                 <label className="flex items-center gap-1 text-[8px] cursor-pointer">
//                   <input type="checkbox" checked={aiIncludeImages} onChange={(e) => setAiIncludeImages(e.target.checked)} className="rounded w-2.5 h-2.5" style={{ accentColor: O }} />
//                   <span>Auto Images</span>
//                 </label>
//                 <label className="flex items-center gap-1 text-[8px] cursor-pointer">
//                   <input type="checkbox" checked={aiIncludeSEO} onChange={(e) => setAiIncludeSEO(e.target.checked)} className="rounded w-2.5 h-2.5" style={{ accentColor: O }} />
//                   <span>SEO Optimization</span>
//                 </label>
//               </div>
//             </div>

//             {/* Generate Button */}
//             <button
//               onClick={handleAIWrite}
//               disabled={aiBusy || (!formData.title && !aiPrompt)}
//               className="w-full py-1.5 rounded text-white text-[9px] font-semibold transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1"
//               style={{ background: `linear-gradient(135deg, ${N}, #1e4a6e)` }}
//             >
//               {aiBusy ? (
//                 <>
//                   <div className="w-2 h-2 border border-white border-t-transparent rounded-full animate-spin" />
//                   <span>Generating...</span>
//                 </>
//               ) : (
//                 <>
//                   <Wand2 size={9} />
//                   <span>Generate AI Draft</span>
//                   <Zap size={8} />
//                 </>
//               )}
//             </button>

//             {aiBusy && (
//               <div className="p-1.5 rounded" style={{ background: `${O}10`, border: `1px solid ${O}30` }}>
//                 <div className="flex items-center gap-1 mb-0.5">
//                   <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: O }} />
//                   <span className="text-[8px] font-semibold" style={{ color: N }}>AI is writing...</span>
//                 </div>
//                 <div className="space-y-0.5 text-[7px]" style={{ color: MU }}>
//                   <div className="flex items-center gap-1"><CheckCircle size={7} style={{ color: O }} /> Analyzing topic</div>
//                   <div className="flex items-center gap-1"><Clock size={7} style={{ color: O }} /> Writing SEO article</div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </aside>

//         {/* Main Editor - RIGHT SIDE (Same as BlogPostEditor) */}
//         <div className="flex-1 flex flex-col min-w-0">
//           {/* Header */}
//           <div className="px-3 py-3 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${N}, #1e4a6e)` }}>
//             <div className="flex items-center gap-2">
//               <FileText size={14} className="text-white/80" />
//               <h2 className="text-sm font-bold text-white">
//                 {isEditing ? 'Edit Post' : 'Create New Post'}
//               </h2>
//             </div>
//             <button onClick={() => onCancelRef.current?.()} className="p-1 hover:bg-white/20 rounded transition-colors text-white">
//               <X size={14} />
//             </button>
//           </div>

//           {/* Tabs */}
//           <div className="border-b px-2" style={{ borderColor: BD, background: BG }}>
//             <div className="flex gap-0">
//               {['edit', 'preview'].map((tab) => (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveTab(tab as 'edit' | 'preview')}
//                   className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium capitalize transition-all ${activeTab === tab ? 'border-b-2' : ''}`}
//                   style={activeTab === tab ? { borderBottomColor: O, color: N } : { color: MU }}
//                 >
//                   {tab === 'edit' ? <FileText size={10} /> : <Eye size={10} />}
//                   {tab}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Body */}
//           <div className="flex-1 overflow-hidden">
//             {activeTab === 'edit' ? (
//               <div className="h-full overflow-y-auto p-3 space-y-3" style={scrollbarStyles}>
                
//                 {/* Title Row */}
//                 <div className="flex gap-2">
//                   <div className="flex-1">
//                     <input
//                       type="text"
//                       name="title"
//                       value={formData.title || ''}
//                       onChange={handleChange}
//                       className="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2"
//                       style={{ borderColor: BD }}
//                       placeholder="Title *"
//                       required
//                     />
//                   </div>
//                 </div>

//                 {/* Category, Author, Status */}
//                 <div className="grid grid-cols-3 gap-2">
//                   <select
//                     name="category"
//                     value={formData.category || ''}
//                     onChange={handleChange}
//                     className="px-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2"
//                     style={{ borderColor: BD }}
//                     required
//                   >
//                     <option value="">Category</option>
//                     {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
//                   </select>
//                   <select
//                     name="author"
//                     value={formData.author || ''}
//                     onChange={handleChange}
//                     className="px-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2"
//                     style={{ borderColor: BD }}
//                   >
//                     {authorOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
//                   </select>
//                   <select
//                     name="status"
//                     value={formData.status || 'draft'}
//                     onChange={handleChange}
//                     className="px-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2"
//                     style={{ borderColor: BD }}
//                   >
//                     <option value="draft">Draft</option>
//                     <option value="published">Published</option>
//                     <option value="archived">Archived</option>
//                   </select>
//                 </div>

//                 {/* Image URL & Upload */}
//                 <div className="grid grid-cols-2 gap-2">
//                   <input
//                     type="url"
//                     name="featuredImage"
//                     value={formData.featuredImage || ''}
//                     onChange={handleChange}
//                     className="px-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2"
//                     style={{ borderColor: BD }}
//                     placeholder="Image URL"
//                   />
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={(e) => handleFileSelected(e.target.files?.[0])}
//                     className="px-2 py-1 text-xs border rounded-lg focus:outline-none file:mr-2 file:py-0.5 file:px-2 file:rounded file:text-[10px] file:border-0"
//                     style={{ borderColor: BD }}
//                   />
//                 </div>

//                 {/* Image Preview & Tags */}
//                 <div className="flex gap-2">
//                   {formData.featuredImage && (
//                     <div className="relative flex-shrink-0">
//                       <img src={formData.featuredImage} alt="" className="h-10 w-auto rounded border object-cover" style={{ borderColor: BD }} />
//                       <button onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))} className="absolute -top-1 -right-1 rounded-full p-0.5 text-white" style={{ background: '#ef4444' }}>
//                         <X size={8} />
//                       </button>
//                     </div>
//                   )}
//                   <div className="flex-1">
//                     <input
//                       type="text"
//                       value={tagsInput}
//                       onChange={(e) => handleTagsChange(e.target.value)}
//                       className="w-full px-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2"
//                       style={{ borderColor: BD }}
//                       placeholder="Tags (comma separated)"
//                     />
//                   </div>
//                 </div>

//                 {/* Tags Display */}
//                 {formData.tags && formData.tags.length > 0 && (
//                   <div className="flex flex-wrap gap-1">
//                     {formData.tags.map((tag, i) => (
//                       <span key={i} className="px-1.5 py-0.5 rounded-full text-[9px] font-medium" style={{ background: `${O}15`, color: O }}>
//                         {tag}
//                       </span>
//                     ))}
//                   </div>
//                 )}

//                 {/* Excerpt */}
//                 <textarea
//                   name="excerpt"
//                   value={formData.excerpt || ''}
//                   onChange={handleChange}
//                   rows={2}
//                   className="w-full px-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 resize-none"
//                   style={{ borderColor: BD }}
//                   placeholder="Excerpt"
//                 />

//                 {/* Editor Toolbar */}
//                 <div className="border rounded-lg overflow-hidden" style={{ borderColor: BD }}>
//                   <div className="flex flex-wrap items-center gap-0.5 p-1" style={{ background: BG, borderBottom: `1px solid ${BD}` }}>
//                     <button onClick={() => exec('bold')} className="p-1 rounded hover:bg-gray-200"><BoldIcon size={12} style={{ color: MU }} /></button>
//                     <button onClick={() => exec('italic')} className="p-1 rounded hover:bg-gray-200"><ItalicIcon size={12} style={{ color: MU }} /></button>
//                     <button onClick={() => exec('underline')} className="p-1 rounded hover:bg-gray-200"><UnderlineIcon size={12} style={{ color: MU }} /></button>
//                     <div className="w-px h-3 mx-0.5" style={{ background: BD }} />
//                     <button onClick={() => exec('insertUnorderedList')} className="p-1 rounded hover:bg-gray-200"><BulletIcon size={12} style={{ color: MU }} /></button>
//                     <button onClick={() => exec('insertOrderedList')} className="p-1 rounded hover:bg-gray-200"><NumberedIcon size={12} style={{ color: MU }} /></button>
//                     <div className="w-px h-3 mx-0.5" style={{ background: BD }} />
//                     <button onClick={() => { const url = window.prompt('URL'); if (url) exec('createLink', url); }} className="p-1 rounded hover:bg-gray-200"><LinkIcon size={12} style={{ color: MU }} /></button>
//                     <button onClick={insertCodeBlock} className="p-1 rounded hover:bg-gray-200"><CodeIcon size={12} style={{ color: MU }} /></button>
//                     <button onClick={insertQuote} className="p-1 rounded hover:bg-gray-200"><QuoteIcon size={12} style={{ color: MU }} /></button>
//                     <div className="w-px h-3 mx-0.5" style={{ background: BD }} />
//                     <button onClick={() => setMode(m => m === 'visual' ? 'source' : 'visual')} className={`p-1 rounded ${mode === 'source' ? 'bg-orange-100' : 'hover:bg-gray-200'}`}>
//                       <Code size={12} style={{ color: mode === 'source' ? O : MU }} />
//                     </button>
//                   </div>

//                   <div>
//                     {mode === 'visual' ? (
//                       <div
//                         ref={editorRef}
//                         contentEditable
//                         suppressContentEditableWarning
//                         onInput={(e) => setContent((e.currentTarget as HTMLDivElement).innerHTML)}
//                         className="min-h-[200px] p-2 text-sm focus:outline-none"
//                         dir="ltr"
//                         style={{ whiteSpace: 'normal', direction: 'ltr', textAlign: 'left', unicodeBidi: 'isolate' }}
//                       />
//                     ) : (
//                       <textarea
//                         value={content}
//                         onChange={(e) => setContent(sanitizeLTR(e.target.value))}
//                         className="w-full min-h-[200px] p-2 font-mono text-xs bg-gray-900 text-green-300 rounded-b focus:outline-none resize-none"
//                         placeholder="HTML source"
//                       />
//                     )}
//                   </div>
//                 </div>

//                 {/* SEO Fields */}
//                 <div className="grid grid-cols-2 gap-2">
//                   <div>
//                     <input
//                       type="text"
//                       name="seoTitle"
//                       value={formData.seoTitle || ''}
//                       onChange={handleChange}
//                       className="w-full px-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2"
//                       style={{ borderColor: BD }}
//                       placeholder="SEO Title"
//                       maxLength={60}
//                     />
//                     <div className="text-[8px] mt-0.5" style={{ color: MU }}>{formData.seoTitle?.length || 0}/60</div>
//                   </div>
//                   <div>
//                     <input
//                       type="text"
//                       name="seoDescription"
//                       value={formData.seoDescription || ''}
//                       onChange={handleChange}
//                       className="w-full px-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2"
//                       style={{ borderColor: BD }}
//                       placeholder="SEO Description"
//                       maxLength={160}
//                     />
//                     <div className="text-[8px] mt-0.5" style={{ color: MU }}>{formData.seoDescription?.length || 0}/160</div>
//                   </div>
//                 </div>

//                 {/* Featured Checkbox */}
//                 <label className="flex items-center gap-1.5 cursor-pointer">
//                   <input type="checkbox" name="featured" checked={!!formData.featured} onChange={handleChange} className="rounded w-3 h-3" style={{ accentColor: O }} />
//                   <span className="text-xs" style={{ color: N }}>Featured Post</span>
//                 </label>
//               </div>
//             ) : (
//               <div className="h-full overflow-y-auto p-3" style={scrollbarStyles}>
//                 <article className="max-w-2xl mx-auto">
//                   <h1 className="text-lg font-bold mb-2" style={{ color: N }}>{formData.title}</h1>
//                   <div className="flex flex-wrap gap-2 mb-3 text-[10px]" style={{ color: MU }}>
//                     <span className="flex items-center gap-0.5"><User size={10} />{formData.author}</span>
//                     <span className="flex items-center gap-0.5"><Calendar size={10} />{new Date().toLocaleDateString()}</span>
//                     <span className="flex items-center gap-0.5"><Tag size={10} />{formData.category}</span>
//                   </div>
//                   {formData.featuredImage && (
//                     <img src={formData.featuredImage} alt="" className="w-full h-32 object-cover rounded-lg mb-3" />
//                   )}
//                   <div className="text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeLTR(formData.content || '') }} />
//                   {formData.tags && formData.tags.length > 0 && (
//                     <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t" style={{ borderColor: BD }}>
//                       {formData.tags.map((tag, i) => (
//                         <span key={i} className="px-1.5 py-0.5 rounded-full text-[9px]" style={{ background: `${O}10`, color: O }}>{tag}</span>
//                       ))}
//                     </div>
//                   )}
//                 </article>
//               </div>
//             )}
//           </div>

//           {/* Footer */}
//           <div className="flex items-center justify-between gap-2 px-3 py-2 border-t" style={{ borderColor: BD, background: BG }}>
//             <div className="text-[10px]" style={{ color: MU }}>
//               {error && <span className="text-red-600">{error}</span>}
//               {!error && <span>Status: <span className="font-semibold" style={{ color: formData.status === 'published' ? '#10b981' : O }}>{formData.status}</span></span>}
//             </div>
//             <div className="flex gap-1.5">
//               <button onClick={() => onCancelRef.current?.()} className="px-3 py-1 text-[11px] border rounded-lg transition-colors hover:bg-gray-50" style={{ borderColor: BD, color: N }} disabled={saving}>
//                 Cancel
//               </button>
//               <button onClick={handleSaveDraftClick} className="px-3 py-1 text-[11px] rounded-lg text-white flex items-center gap-1 transition-all hover:opacity-90" style={{ background: N }} disabled={saving}>
//                 <Save size={10} /><span>Save</span>
//               </button>
//               <button onClick={handlePublishClick} className="px-3 py-1 text-[11px] rounded-lg text-white flex items-center gap-1 transition-all hover:opacity-90" style={{ background: `linear-gradient(135deg, ${O}, #f39c12)` }} disabled={saving}>
//                 <Send size={10} /><span>Publish</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AIBlogWriter;



import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  Save, Send, X, Wand2,
  Bold as BoldIcon, Italic as ItalicIcon, Underline as UnderlineIcon, Strikethrough as StrikeIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List as BulletIcon, ListOrdered as NumberedIcon,
  Link as LinkIcon, Image as ImageIcon, Code as CodeIcon, Quote as QuoteIcon,
  Undo2 as UndoIcon, Redo2 as RedoIcon,
  Calendar, Tag, User, Code, Bot, Sparkles, RefreshCw, Plus, Settings, Brain, TrendingUp, Search, BarChart3, CheckCircle, Clock, Zap,
  Eye, FileText, ChevronDown
} from 'lucide-react';
import blogsAPI from '@/lib/blogsAPI';
import { toast } from 'react-toastify';

import type { AITone, AILength } from '@/lib/blogsAPI';

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

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
  publishedAt?: string | null;
  id?: number | string;
}

interface AIBlogWriterProps {
  post?: BlogPost | null;
  onSave?: (post: Partial<BlogPost>) => void;
  onCancel?: () => void;
  isOpen: boolean;
  currentUserName?: string;
}

const CATEGORIES = [
  'Real Estate', 'Investment', 'Market Analysis', 'Legal',
  'Home Buying', 'Home Selling', 'Property News', 'Construction', 'Finance', 'Legal Updates'
];

const AI_TONES: { value: AITone; label: string; description: string }[] = [
  { value: 'professional', label: 'Professional', description: 'Formal and authoritative' },
  { value: 'conversational', label: 'Conversational', description: 'Friendly and approachable' },
  { value: 'expert', label: 'Expert', description: 'Technical and detailed' },
  { value: 'beginner-friendly', label: 'Beginner-Friendly', description: 'Simple and educational' }
];

const AI_LENGTHS: { value: AILength; label: string; description: string; time: string }[] = [
  { value: 'short', label: 'Short', description: '300-500 words', time: '2-3 min' },
  { value: 'medium', label: 'Medium', description: '800-1200 words', time: '4-6 min' },
  { value: 'long', label: 'Long', description: '1500-2500 words', time: '7-12 min' },
  { value: 'comprehensive', label: 'Comprehensive', description: '3000+ words', time: '15+ min' }
];

const AI_AUDIENCES = [
  { value: 'property-investors', label: 'Property Investors', description: 'Investment opportunities' },
  { value: 'first-time-buyers', label: 'First-time Buyers', description: 'New to property buying' },
  { value: 'real-estate-agents', label: 'Real Estate Agents', description: 'Industry professionals' },
  { value: 'property-sellers', label: 'Property Sellers', description: 'Looking to sell' },
  { value: 'general-public', label: 'General Public', description: 'Broad audience' }
];

const BIDI_REGEX = /[\u200E\u200F\u202A-\u202E\u2066-\u2069]/g;
const sanitizeLTR = (html: string) =>
  (html || '')
    .replace(BIDI_REGEX, '')
    .replace(/\sdir\s*=\s*"(?:rtl|auto)"/gi, ' dir="ltr"')
    .replace(/\sdir\s*=\s*'(?:rtl|auto)'/gi, " dir='ltr'")
    .replace(/direction\s*:\s*rtl\s*;?/gi, 'direction:ltr;')
    .replace(/unicode-bidi\s*:\s*(?:bidi-override|plaintext|isolate-override)\s*;?/gi, 'unicode-bidi:isolate;');

const scrollbarStyles: React.CSSProperties = {
  scrollbarWidth: 'thin',
  scrollbarColor: `${BD} ${BG}`,
  WebkitOverflowScrolling: 'touch',
};
function useDebounced<T>(value: T, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const AIBlogWriter: React.FC<AIBlogWriterProps> = ({
  post, onSave, onCancel, isOpen, currentUserName
}) => {
  const onSaveRef = useRef<((p: Partial<BlogPost>) => void) | null>(null);
  const onCancelRef = useRef<(() => void) | null>(null);
  useEffect(() => { onSaveRef.current = typeof onSave === 'function' ? onSave : null; }, [onSave]);
  useEffect(() => { onCancelRef.current = typeof onCancel === 'function' ? onCancel : null; }, [onCancel]);

  const isEditing = !!post?.id;
  const [showMobileAIPanel, setShowMobileAIPanel] = useState(false);

  const baseAuthorOptions = useMemo(() => ([
    currentUserName || 'Admin', 'Admin', post?.author || ''
  ].filter(Boolean) as string[]), [currentUserName, post?.author]);

  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '', content: '', excerpt: '',
    author: currentUserName || 'Admin',
    category: '', tags: [], featured: false, featuredImage: '',
    seoTitle: '', seoDescription: '', status: 'draft', publishedAt: null
  });

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [tagsInput, setTagsInput] = useState('');
  const debouncedTags = useDebounced(tagsInput, 350);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [imgLoading, setImgLoading] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);
  const [imgDimensions, setImgDimensions] = useState<{ w: number; h: number } | null>(null);

  const editorRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<'visual' | 'source'>('visual');
  const [content, setContent] = useState<string>('');

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiKeywords, setAiKeywords] = useState<string[]>([]);
  const [aiKeywordInput, setAiKeywordInput] = useState('');
  const [aiTone, setAiTone] = useState<AITone>('professional');
  const [aiLength, setAiLength] = useState<AILength>('medium');
  const [aiCategory, setAiCategory] = useState('Real Estate');
  const [aiAudience, setAiAudience] = useState('property-investors');
  const [aiIncludeImages, setAiIncludeImages] = useState(true);
  const [aiIncludeSEO, setAiIncludeSEO] = useState(true);
  const [aiIncludeToc, setAiIncludeToc] = useState(true);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (post) {
      setFormData({ ...post });
      setTagsInput(post.tags?.join(', ') || '');
      const html = sanitizeLTR(post.content || '');
      setContent(html);
      setAiCategory(post.category || 'Real Estate');
      if (post.featuredImage && typeof post.featuredImage === 'string' && !post.featuredImage.startsWith('data:')) {
        validateImageUrl(post.featuredImage);
      } else {
        setImgError(null); setImgLoading(false); setImgDimensions(null);
      }
    } else {
      const fresh: Partial<BlogPost> = {
        title: '', content: '', excerpt: '',
        author: currentUserName || 'Admin',
        category: 'Real Estate', tags: [], featured: false, featuredImage: '',
        seoTitle: '', seoDescription: '', status: 'draft', publishedAt: null
      };
      setFormData(fresh);
      setTagsInput('');
      setContent('');
      setAiCategory('Real Estate');
      setImgError(null); setImgLoading(false); setImgDimensions(null);
    }
  }, [post, currentUserName]);

  useEffect(() => { setFormData(prev => ({ ...prev, content })); }, [content]);

  useEffect(() => {
    if (mode !== 'visual' || !editorRef.current) return;
    const el = editorRef.current;
    const next = sanitizeLTR(content || '');
    el.setAttribute('dir', 'ltr');
    el.style.direction = 'ltr';
    el.style.textAlign = 'left';
    el.style.setProperty('unicode-bidi', 'isolate');
    el.style.setProperty('writing-mode', 'horizontal-tb');
    if (el.innerHTML !== next) {
      el.innerHTML = next;
    }
  }, [mode, content, activeTab]);

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
      const data: string | null = (e as any).data ?? null;
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
    const tagsArr = value.split(',').map(t => t.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, tags: tagsArr }));
    setAiKeywords(tagsArr);
  };

  const exec = useCallback((cmd: string, value?: string) => {
    if (mode !== 'visual') return;
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    if (editorRef.current) setContent(editorRef.current.innerHTML);
  }, [mode]);

  const insertBlock = (html: string) => {
    if (mode !== 'visual' || !editorRef.current) {
      setContent(prev => sanitizeLTR((prev || '') + html)); return;
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
    `<pre style="background:#0b1220;color:#d1fae5;padding:6px;border-radius:6px;overflow:auto;font-size:11px;"><code>// your code here</code></pre>`
  );
  const insertQuote = () => insertBlock(
    `<blockquote style="border-left:3px solid ${O};padding-left:10px;color:#334155;margin:4px 0;font-size:11px;">Type your quote…</blockquote>`
  );

  const dataURLtoBlob = (dataurl: string): Blob => {
    const arr = dataurl.split(',');
    const mime = (arr[0].match(/:(.*?);/) || [])[1] || 'image/png';
    const bstr = atob(arr[1]); let n = bstr.length;
    const u8 = new Uint8Array(n); while (n--) u8[n] = bstr.charCodeAt(n);
    return new Blob([u8], { type: mime });
  };

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

      if (onSaveRef.current) {
        onSaveRef.current(responseData);
      }

      setFormData(prev => ({ ...prev, ...(responseData || {}) }));
      toast.success(status === 'published' ? 'Post published' : 'Draft saved');
    } catch (err: any) {
      console.error('Error saving post', err);
      setError(err?.message || 'Failed to save post. Please try again.');
      toast.error('Save failed');
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
    try { await navigator.clipboard.writeText(url); toast.success('Image URL copied'); } catch { }
  };
  const openImageInNewTab = () => {
    const url = formData.featuredImage || ''; if (!url) return;
    window.open(url, '_blank', 'noopener');
  };

  const authorOptions = Array.from(new Set([...(baseAuthorOptions || []), formData.author || ''].filter(Boolean)));

  const seedSuggestions = [
    'Best Areas for Real Estate Investment in Mumbai 2025',
    'Complete Guide to Home Loan Process in India',
    'How to Calculate Property ROI and Investment Returns',
    'Legal Documents Required for Property Purchase',
    'Real Estate Market Predictions for Next 5 Years',
    'Commercial vs Residential Property Investment',
    'Tax Benefits and Deductions for Property Owners',
    'How to Evaluate Property Before Buying',
    'Real Estate Investment Trusts (REITs) Guide',
    'Property Valuation Methods and Techniques',
    'Understanding RERA and its Impact on Buyers',
    'Rental Property Management Best Practices'
  ];

  const audienceKeywordsMap: Record<string, string[]> = {
    'property-investors': ['investment', 'roi', 'returns', 'portfolio', 'analysis', 'yield', 'cash flow'],
    'first-time-buyers': ['guide', 'beginner', 'process', 'tips', 'checklist', 'loan', 'emi'],
    'real-estate-agents': ['market', 'leads', 'sales', 'clients', 'strategies', 'crm'],
    'property-sellers': ['selling', 'valuation', 'marketing', 'pricing', 'documents', 'staging'],
    'general-public': ['trends', 'news', 'market', 'overview', 'updates']
  };

  const computeSuggestions = useCallback(() => {
    const userTokens = new Set<string>([
      ...(aiKeywords || []),
      ...(formData.tags || []),
      ...(formData.category ? [formData.category] : []),
      ...(formData.title ? formData.title.split(/\W+/) : [])
    ].map(s => (s || '').toString().toLowerCase()).filter(Boolean));

    const audienceHints = audienceKeywordsMap[aiAudience] || [];
    const candidates = seedSuggestions
      .map(s => ({ text: s, score: 0 }))
      .map(item => {
        const t = item.text.toLowerCase();
        userTokens.forEach(tok => { if (tok && t.includes(tok)) item.score += 2; });
        audienceHints.forEach(tok => { if (t.includes(tok)) item.score += 1; });
        if (t.includes('mumbai')) item.score += 1;
        if (t.includes('india')) item.score += 1;
        if (t.includes('2025')) item.score += 1;
        return item;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(i => i.text);

    setAiSuggestions(candidates.length ? candidates : seedSuggestions.slice(0, 6));
  }, [aiAudience, aiKeywords, formData.tags, formData.category, formData.title]);

  const debouncedTitle = useDebounced(formData.title || '', 350);
  useEffect(() => { computeSuggestions(); }, [computeSuggestions, debouncedTitle, debouncedTags]);

  const handleAIWrite = async () => {
    if (!formData.title && !aiPrompt) {
      setError("Enter a Title first");
      toast.error('Enter a Title');
      return;
    }
    const titleSeed = formData.title?.trim() || aiPrompt.trim();
    setAiBusy(true); setError(null);
    try {
      const autoKeywords = [
        (formData.category || aiCategory || 'Real Estate').toLowerCase(),
        (aiAudience || 'general-public').replace('-', ' '),
        '2025', 'Mumbai', 'India',
        ...(formData.tags || [])
      ];
      const finalKeywords = Array.from(new Set([...(aiKeywords || []), ...autoKeywords]));

      const res = await (blogsAPI as any).aiGenerateFromTitle({
        title: titleSeed,
        tone: aiTone,
        length: aiLength,
        includeSEO: aiIncludeSEO,
        includeImages: aiIncludeImages,
        includeToc: aiIncludeToc,
        audience: aiAudience || 'general-public',
        category: formData.category || aiCategory || 'Real Estate',
        keywords: finalKeywords
      });

      if (!res?.success || !res?.article) throw new Error(res?.message || 'AI failed');
      const a = res.article;

      const nextFeatured = (a as any)?.featuredImage || formData.featuredImage || '';

      setContent(sanitizeLTR(a.content || ''));
      setFormData(prev => ({
        ...prev,
        title: a.title || prev.title || titleSeed,
        excerpt: a.excerpt || prev.excerpt || '',
        seoTitle: a.seoTitle || prev.seoTitle || (a.title || titleSeed),
        seoDescription: a.seoDescription || prev.seoDescription || '',
        tags: Array.isArray(a.tags) ? a.tags : (prev.tags || []),
        category: a.category || prev.category || aiCategory,
        featuredImage: nextFeatured,
        status: 'draft',
        publishedAt: null
      }));

      if (nextFeatured && !nextFeatured.startsWith('data:')) validateImageUrl(nextFeatured);
      setMode('visual');
      setActiveTab('preview');
      toast.success('AI draft generated');
    } catch (e: any) {
      setError(e?.message || 'AI request failed');
      toast.error(e?.message || 'AI request failed');
    } finally {
      setAiBusy(false);
    }
  };

  const addAiKeyword = () => {
    const k = aiKeywordInput.trim();
    if (!k) return;
    if (!aiKeywords.includes(k)) setAiKeywords([...aiKeywords, k]);
    if (!(formData.tags || []).includes(k)) {
      const merged = Array.from(new Set([...(formData.tags || []), k]));
      setFormData(prev => ({ ...prev, tags: merged }));
      setTagsInput(merged.join(', '));
    }
    setAiKeywordInput('');
  };
  const removeAiKeyword = (k: string) => {
    setAiKeywords(aiKeywords.filter(x => x !== k));
    const rest = (formData.tags || []).filter(x => x !== k);
    setFormData(prev => ({ ...prev, tags: rest }));
    setTagsInput(rest.join(', '));
  };

  // AI Panel Content Component (reused for both desktop and mobile)
  const AIPanelContent = () => (
    <div className="flex-1 overflow-y-auto p-3 space-y-3" style={scrollbarStyles}>
      {/* AI Topic */}
      <div>
        <label className="block text-[10px] font-semibold mb-1" style={{ color: N }}>AI Topic / Title</label>
        <textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          rows={2}
          className="w-full px-2 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 resize-none"
          style={{ borderColor: BD }}
          placeholder="Enter topic..."
        />
      </div>

      {/* Smart Suggestions */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <h4 className="text-[10px] font-semibold" style={{ color: N }}>Smart Suggestions</h4>
          <button onClick={computeSuggestions} className="text-[9px] flex items-center gap-0.5" style={{ color: O }}>
            <RefreshCw size={10} /> Refresh
          </button>
        </div>
        <div className="space-y-1.5">
          {aiSuggestions.slice(0, 5).map((sug, i) => (
            <button
              key={i}
              onClick={() => { setAiPrompt(sug); setFormData(prev => ({ ...prev, title: prev.title || sug })); setShowMobileAIPanel(false); }}
              className="w-full p-2 text-left border rounded-lg hover:shadow-sm text-[11px] transition-all"
              style={{ background: 'white', borderColor: BD }}
            >
              <div className="flex items-start gap-2">
                <Sparkles size={12} style={{ color: O }} />
                <span className="line-clamp-2">{sug}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Audience & Category */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-semibold mb-1" style={{ color: N }}>Target Audience</label>
          <select
            value={aiAudience}
            onChange={(e) => setAiAudience(e.target.value)}
            className="w-full px-2 py-1.5 text-[11px] border rounded-lg focus:outline-none focus:ring-2"
            style={{ borderColor: BD }}
          >
            {AI_AUDIENCES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold mb-1" style={{ color: N }}>Category</label>
          <select
            value={formData.category || aiCategory}
            onChange={(e) => {
              setAiCategory(e.target.value);
              setFormData(prev => ({ ...prev, category: e.target.value }));
            }}
            className="w-full px-2 py-1.5 text-[11px] border rounded-lg focus:outline-none focus:ring-2"
            style={{ borderColor: BD }}
          >
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {/* Tone & Length */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-semibold mb-1" style={{ color: N }}>Writing Tone</label>
          <select
            value={aiTone}
            onChange={(e) => setAiTone(e.target.value as AITone)}
            className="w-full px-2 py-1.5 text-[11px] border rounded-lg focus:outline-none focus:ring-2"
            style={{ borderColor: BD }}
          >
            {AI_TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold mb-1" style={{ color: N }}>Content Length</label>
          <select
            value={aiLength}
            onChange={(e) => setAiLength(e.target.value as AILength)}
            className="w-full px-2 py-1.5 text-[11px] border rounded-lg focus:outline-none focus:ring-2"
            style={{ borderColor: BD }}
          >
            {AI_LENGTHS.map(l => <option key={l.value} value={l.value}>{l.label} • {l.time}</option>)}
          </select>
        </div>
      </div>

      {/* Keywords */}
      <div>
        <label className="block text-[10px] font-semibold mb-1" style={{ color: N }}>Keywords & Tags</label>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={aiKeywordInput}
            onChange={(e) => setAiKeywordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAiKeyword())}
            placeholder="Add keyword…"
            className="flex-1 px-2 py-1.5 text-[11px] border rounded-lg focus:outline-none focus:ring-2"
            style={{ borderColor: BD }}
          />
          <button onClick={addAiKeyword} className="px-2 py-1.5 rounded-lg transition-colors hover:opacity-80 text-white" style={{ background: O }}>
            <Plus size={14} />
          </button>
        </div>
        {aiKeywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {aiKeywords.map((k, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1" style={{ background: `${O}15`, color: O }}>
                {k}
                <button onClick={() => removeAiKeyword(k)} className="hover:opacity-70"><X size={10} /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Options */}
      <div className="p-2.5 rounded-lg" style={{ background: `${N}05`, border: `1px solid ${BD}` }}>
        <div className="flex items-center gap-1.5 mb-2">
          <Settings size={12} style={{ color: O }} />
          <span className="text-[10px] font-semibold" style={{ color: N }}>Advanced</span>
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-[10px] cursor-pointer">
            <input type="checkbox" checked={aiIncludeToc} onChange={(e) => setAiIncludeToc(e.target.checked)} className="rounded" style={{ accentColor: O }} />
            <span>Table of Contents</span>
          </label>
          <label className="flex items-center gap-2 text-[10px] cursor-pointer">
            <input type="checkbox" checked={aiIncludeImages} onChange={(e) => setAiIncludeImages(e.target.checked)} className="rounded" style={{ accentColor: O }} />
            <span>Auto Images</span>
          </label>
          <label className="flex items-center gap-2 text-[10px] cursor-pointer">
            <input type="checkbox" checked={aiIncludeSEO} onChange={(e) => setAiIncludeSEO(e.target.checked)} className="rounded" style={{ accentColor: O }} />
            <span>SEO Optimization</span>
          </label>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleAIWrite}
        disabled={aiBusy || (!formData.title && !aiPrompt)}
        className="w-full py-2 rounded-lg text-white text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        style={{ background: `linear-gradient(135deg, ${N}, #1e4a6e)` }}
      >
        {aiBusy ? (
          <>
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Wand2 size={14} />
            <span>Generate AI Draft</span>
            <Sparkles size={12} />
          </>
        )}
      </button>

      {/* AI Progress */}
      {aiBusy && (
        <div className="p-2.5 rounded-lg" style={{ background: `${O}10`, border: `1px solid ${O}30` }}>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: O }} />
            <span className="text-[10px] font-semibold" style={{ color: N }}>AI is generating your content…</span>
          </div>
          <div className="space-y-1 text-[9px]" style={{ color: MU }}>
            <div className="flex items-center gap-1.5"><CheckCircle size={9} style={{ color: O }} /> Analyzing topic & keywords</div>
            <div className="flex items-center gap-1.5"><Clock size={9} style={{ color: O }} /> Writing SEO-optimized article</div>
            <div className="flex items-center gap-1.5"><Clock size={9} style={{ color: MU }} /> Building ToC & anchors</div>
          </div>
        </div>
      )}

      {/* AI Content Insights */}
      <div className="rounded-lg p-3 space-y-3" style={{ background: `linear-gradient(135deg, ${O}08, ${N}08)`, border: `1px solid ${BD}` }}>
        <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: N }}>
          <Brain size={14} style={{ color: O }} />
          <span>AI Content Insights</span>
        </div>
        <div className="grid grid-cols-1 gap-2 text-[10px]">
          <div className="bg-white rounded p-2" style={{ border: `1px solid ${BD}` }}>
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={12} style={{ color: O }} />
              <span className="font-medium" style={{ color: N }}>Trending</span>
            </div>
            <ul className="space-y-0.5 text-[9px]" style={{ color: MU }}>
              <li>• Investment strategies</li>
              <li>• Mumbai market analysis</li>
              <li>• Home loan updates</li>
              <li>• RERA compliance</li>
            </ul>
          </div>
          <div className="bg-white rounded p-2" style={{ border: `1px solid ${BD}` }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Search size={12} style={{ color: O }} />
              <span className="font-medium" style={{ color: N }}>High-Ranking Keywords</span>
            </div>
            <ul className="space-y-0.5 text-[9px]" style={{ color: MU }}>
              <li>• real estate investment</li>
              <li>• property market trends</li>
              <li>• home buying guide</li>
              <li>• Mumbai properties</li>
            </ul>
          </div>
          <div className="bg-white rounded p-2" style={{ border: `1px solid ${BD}` }}>
            <div className="flex items-center gap-1.5 mb-1">
              <BarChart3 size={12} style={{ color: O }} />
              <span className="font-medium" style={{ color: N }}>Performance Hints</span>
            </div>
            <ul className="space-y-0.5 text-[9px]" style={{ color: MU }}>
              <li>• Guides: +30% time on page</li>
              <li>• Market analysis: +22% shares</li>
              <li>• Investment: +15% engagement</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[88vh] flex overflow-hidden relative" style={{ border: `1px solid ${BD}` }}>
        
        {/* Desktop AI Panel - Left Side (hidden on mobile) */}
        <aside className="hidden md:flex md:flex-col w-80 shrink-0" style={{ background: BG, borderRight: `1px solid ${BD}` }}>
          <div className="p-3 border-b" style={{ borderColor: BD, background: N }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${O}20` }}>
                <Bot size={16} style={{ color: O }} />
              </div>
              <div>
                <div className="text-xs font-bold text-white">AI Blog Writer</div>
                <div className="text-[10px] text-white/70">SEO + ToC + Images</div>
              </div>
            </div>
          </div>
          <AIPanelContent />
        </aside>

        {/* Mobile AI Panel - Slide-out drawer with AI Blog Writer button trigger */}
        {showMobileAIPanel && (
          <>
            <div 
              className="fixed inset-0 z-50 bg-black/50 md:hidden"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              onClick={() => setShowMobileAIPanel(false)}
            />
            <div 
              className="fixed top-0 left-0 bottom-0 w-80 z-50 bg-white shadow-xl flex flex-col md:hidden"
              style={{ background: BG, borderRight: `1px solid ${BD}` }}
            >
              <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: BD, background: N }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${O}20` }}>
                    <Bot size={16} style={{ color: O }} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">AI Blog Writer</div>
                    <div className="text-[10px] text-white/70">SEO + ToC + Images</div>
                  </div>
                </div>
                <button onClick={() => setShowMobileAIPanel(false)} className="p-1 rounded hover:bg-white/10 transition-colors text-white">
                  <X size={16} />
                </button>
              </div>
              <AIPanelContent />
            </div>
          </>
        )}

        {/* Main Editor - RIGHT SIDE */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with AI Blog Writer button for mobile */}
          <div className="px-4 py-3.5 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${N}, #1e4a6e)` }}>
            <div className="flex items-center gap-2">
              {/* Mobile: AI Blog Writer button with dropdown indicator */}
              <button 
                onClick={() => setShowMobileAIPanel(true)}
                className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all"
                style={{ background: `${O}20`, color: O }}
              >
                <Bot size={14} />
                <span className="text-[11px] font-medium">AI Writer</span>
                <ChevronDown size={10} />
              </button>
              <FileText size={16} className="text-white/80 hidden md:block" />
              <h2 className="text-sm font-bold text-white">
                {isEditing ? 'Edit Post' : 'Create New Post'}
              </h2>
            </div>
            <button onClick={() => onCancelRef.current?.()} className="p-1 hover:bg-white/20 rounded transition-colors text-white">
              <X size={16} />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b px-3" style={{ borderColor: BD, background: BG }}>
            <div className="flex gap-0">
              {['edit', 'preview'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as 'edit' | 'preview')}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium capitalize transition-all ${activeTab === tab ? 'border-b-2' : ''}`}
                  style={activeTab === tab ? { borderBottomColor: O, color: N } : { color: MU }}
                >
                  {tab === 'edit' ? <FileText size={12} /> : <Eye size={12} />}
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Body - Same as before */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'edit' ? (
              <div className="h-full overflow-y-auto p-4 space-y-4" style={scrollbarStyles}>
                
                {/* Title Row */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      name="title"
                      value={formData.title || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: BD }}
                      placeholder="Title *"
                      required
                    />
                  </div>
                </div>

                {/* Category, Author, Status */}
                <div className="grid grid-cols-3 gap-3">
                  <select
                    name="category"
                    value={formData.category || ''}
                    onChange={handleChange}
                    className="px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: BD }}
                    required
                  >
                    <option value="">Category</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <select
                    name="author"
                    value={formData.author || ''}
                    onChange={handleChange}
                    className="px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: BD }}
                  >
                    {authorOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <select
                    name="status"
                    value={formData.status || 'draft'}
                    onChange={handleChange}
                    className="px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: BD }}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                {/* Image URL & Upload */}
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="url"
                    name="featuredImage"
                    value={formData.featuredImage || ''}
                    onChange={handleChange}
                    className="px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2"
                    style={{ borderColor: BD }}
                    placeholder="Image URL"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelected(e.target.files?.[0])}
                    className="px-3 py-1.5 text-xs border rounded-lg focus:outline-none file:mr-2 file:py-0.5 file:px-2 file:rounded file:text-[10px] file:border-0"
                    style={{ borderColor: BD }}
                  />
                </div>

                {/* Image Preview & Tags */}
                <div className="flex gap-3">
                  {formData.featuredImage && (
                    <div className="relative flex-shrink-0">
                      <img src={formData.featuredImage} alt="" className="h-12 w-auto rounded border object-cover" style={{ borderColor: BD }} />
                      <button onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))} className="absolute -top-1 -right-1 rounded-full p-0.5 text-white" style={{ background: '#ef4444' }}>
                        <X size={8} />
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => handleTagsChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: BD }}
                      placeholder="Tags (comma separated)"
                    />
                  </div>
                </div>

                {/* Tags Display */}
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {formData.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: `${O}15`, color: O }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Excerpt */}
                <textarea
                  name="excerpt"
                  value={formData.excerpt || ''}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 resize-none"
                  style={{ borderColor: BD }}
                  placeholder="Excerpt"
                />

                {/* Editor Toolbar */}
                <div className="border rounded-lg overflow-hidden" style={{ borderColor: BD }}>
                  <div className="flex flex-wrap items-center gap-0.5 p-1.5" style={{ background: BG, borderBottom: `1px solid ${BD}` }}>
                    <button onClick={() => exec('bold')} className="p-1.5 rounded hover:bg-gray-200"><BoldIcon size={14} style={{ color: MU }} /></button>
                    <button onClick={() => exec('italic')} className="p-1.5 rounded hover:bg-gray-200"><ItalicIcon size={14} style={{ color: MU }} /></button>
                    <button onClick={() => exec('underline')} className="p-1.5 rounded hover:bg-gray-200"><UnderlineIcon size={14} style={{ color: MU }} /></button>
                    <div className="w-px h-4 mx-0.5" style={{ background: BD }} />
                    <button onClick={() => exec('insertUnorderedList')} className="p-1.5 rounded hover:bg-gray-200"><BulletIcon size={14} style={{ color: MU }} /></button>
                    <button onClick={() => exec('insertOrderedList')} className="p-1.5 rounded hover:bg-gray-200"><NumberedIcon size={14} style={{ color: MU }} /></button>
                    <div className="w-px h-4 mx-0.5" style={{ background: BD }} />
                    <button onClick={() => { const url = window.prompt('URL'); if (url) exec('createLink', url); }} className="p-1.5 rounded hover:bg-gray-200"><LinkIcon size={14} style={{ color: MU }} /></button>
                    <button onClick={insertCodeBlock} className="p-1.5 rounded hover:bg-gray-200"><CodeIcon size={14} style={{ color: MU }} /></button>
                    <button onClick={insertQuote} className="p-1.5 rounded hover:bg-gray-200"><QuoteIcon size={14} style={{ color: MU }} /></button>
                    <div className="w-px h-4 mx-0.5" style={{ background: BD }} />
                    <button onClick={() => setMode(m => m === 'visual' ? 'source' : 'visual')} className={`p-1.5 rounded ${mode === 'source' ? 'bg-orange-100' : 'hover:bg-gray-200'}`}>
                      <Code size={14} style={{ color: mode === 'source' ? O : MU }} />
                    </button>
                  </div>

                  <div>
                    {mode === 'visual' ? (
                      <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={(e) => setContent((e.currentTarget as HTMLDivElement).innerHTML)}
                        className="min-h-[280px] p-3 text-sm focus:outline-none"
                        dir="ltr"
                        style={{ whiteSpace: 'normal', direction: 'ltr', textAlign: 'left', unicodeBidi: 'isolate' }}
                      />
                    ) : (
                      <textarea
                        value={content}
                        onChange={(e) => setContent(sanitizeLTR(e.target.value))}
                        className="w-full min-h-[280px] p-3 font-mono text-xs bg-gray-900 text-green-300 rounded-b focus:outline-none resize-none"
                        placeholder="HTML source"
                      />
                    )}
                  </div>
                </div>

                {/* SEO Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      name="seoTitle"
                      value={formData.seoTitle || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: BD }}
                      placeholder="SEO Title"
                      maxLength={60}
                    />
                    <div className="text-[9px] mt-0.5" style={{ color: MU }}>{formData.seoTitle?.length || 0}/60</div>
                  </div>
                  <div>
                    <input
                      type="text"
                      name="seoDescription"
                      value={formData.seoDescription || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2"
                      style={{ borderColor: BD }}
                      placeholder="SEO Description"
                      maxLength={160}
                    />
                    <div className="text-[9px] mt-0.5" style={{ color: MU }}>{formData.seoDescription?.length || 0}/160</div>
                  </div>
                </div>

                {/* Featured Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="featured" checked={!!formData.featured} onChange={handleChange} className="rounded" style={{ accentColor: O }} />
                  <span className="text-xs" style={{ color: N }}>Featured Post</span>
                </label>
              </div>
            ) : (
              <div className="h-full overflow-y-auto p-4" style={scrollbarStyles}>
                <article className="max-w-3xl mx-auto">
                  <h1 className="text-xl font-bold mb-3" style={{ color: N }}>{formData.title}</h1>
                  <div className="flex flex-wrap gap-3 mb-4 text-[11px]" style={{ color: MU }}>
                    <span className="flex items-center gap-1"><User size={12} />{formData.author}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} />{new Date().toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Tag size={12} />{formData.category}</span>
                  </div>
                  {formData.featuredImage && (
                    <img src={formData.featuredImage} alt="" className="w-full h-40 object-cover rounded-lg mb-4" />
                  )}
                  <div className="text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeLTR(formData.content || '') }} />
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-4 pt-3 border-t" style={{ borderColor: BD }}>
                      {formData.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: `${O}10`, color: O }}>{tag}</span>
                      ))}
                    </div>
                  )}
                </article>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t" style={{ borderColor: BD, background: BG }}>
            <div className="text-[11px]" style={{ color: MU }}>
              {error && <span className="text-red-600">{error}</span>}
              {!error && <span>Status: <span className="font-semibold" style={{ color: formData.status === 'published' ? '#10b981' : O }}>{formData.status}</span></span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => onCancelRef.current?.()} className="px-3 py-1.5 text-[11px] border rounded-lg transition-colors hover:bg-gray-50" style={{ borderColor: BD, color: N }} disabled={saving}>
                Cancel
              </button>
              <button onClick={handleSaveDraftClick} className="px-3 py-1.5 text-[11px] rounded-lg text-white flex items-center gap-1.5 transition-all hover:opacity-90" style={{ background: N }} disabled={saving}>
                <Save size={12} /><span>Save</span>
              </button>
              <button onClick={handlePublishClick} className="px-3 py-1.5 text-[11px] rounded-lg text-white flex items-center gap-1.5 transition-all hover:opacity-90" style={{ background: `linear-gradient(135deg, ${O}, #f39c12)` }} disabled={saving}>
                <Send size={12} /><span>Publish</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBlogWriter;