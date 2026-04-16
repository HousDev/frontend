// import React, { useEffect, useMemo, useState } from 'react';
// import {
//   Plus,
//   Globe,
//   RefreshCw,
//   X,
//   CheckCircle,
//   TrendingUp,
//   Bot,
//   Shield,
//   Zap,
// } from 'lucide-react';
// import toast from 'react-hot-toast';
// import { rssAPI } from '@/lib/rssAPI';
// import RSSSourceCard from './RSSSourceCard';
// import { RSSSource as SharedRSSSource } from '../../types/blog';
// import RSSSourceFormModal from './RSSSourceFormModal';

// /* =========================================================
//    Types
//    ========================================================= */

// type RSSSyncFrequency = 'hourly' | 'daily' | 'weekly' | 'manual';
// type RSSContentFilter = 'keywords' | 'all';

// type RSSSource = SharedRSSSource & {
//   id: string;
//   name: string;
//   url: string;
//   category: string;
//   description?: string | null;
//   active: boolean | 0 | 1;
//   autoPublish: boolean | 0 | 1;
//   syncFrequency?: RSSSyncFrequency;
//   contentFilter?: RSSContentFilter;
//   keywords?: string[];
//   lastSync?: string | null;
//   totalPosts?: number;
//   newPosts?: number;
//   createdAt?: string;
//   updatedAt?: string;
// };

// interface RSSSourceManagerProps {
//   isOpen?: boolean;
//   onClose?: () => void;
// }

// /* =========================================================
//    Helpers
//    ========================================================= */

// function toStringBool(v: any): boolean {
//   if (v === true || v === 1 || v === '1') return true;
//   return !!v;
// }

// function normalizeOne(raw: any): RSSSource {
//   return {
//     id: String(raw.id ?? raw.source_id ?? ''),
//     name: raw.name ?? '',
//     url: raw.url ?? '',
//     category: raw.category ?? 'Property News',
//     description: raw.description ?? null,
//     active: raw.active ?? true,
//     autoPublish: raw.autoPublish ?? false,
//     syncFrequency: (raw.syncFrequency ?? 'daily') as RSSSyncFrequency,
//     contentFilter: (raw.contentFilter ?? 'keywords') as RSSContentFilter,
//     keywords: Array.isArray(raw.keywords)
//       ? raw.keywords
//       : typeof raw.keywords === 'string'
//         ? raw.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
//         : [],
//     lastSync: raw.lastSync ?? null,
//     totalPosts: Number(raw.totalPosts ?? 0),
//     newPosts: Number(raw.newPosts ?? 0),
//     createdAt: raw.createdAt ?? raw.created_at ?? undefined,
//     updatedAt: raw.updatedAt ?? raw.updated_at ?? undefined,
//   };
// }

// function normalizeList(resp: any): RSSSource[] {
//   const arr = Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
//   return arr.map(normalizeOne);
// }

// /* =========================================================
//    Component
//    ========================================================= */

// const RSSSourceManager: React.FC<RSSSourceManagerProps> = ({ isOpen, onClose }) => {
//   const [sources, setSources] = useState<RSSSource[]>([]);
//   const [loading, setLoading] = useState(false);

//   const [showAddForm, setShowAddForm] = useState(false);
//   const [editingSource, setEditingSource] = useState<RSSSource | null>(null);
//   const [syncingSourceId, setSyncingSourceId] = useState<string | null>(null);
//   const [syncingAll, setSyncingAll] = useState(false);

//   const [form, setForm] = useState<Partial<RSSSource>>({
//     name: '',
//     url: '',
//     category: 'Property News',
//     description: '',
//     active: true,
//     autoPublish: false,
//     syncFrequency: 'daily',
//     contentFilter: 'keywords',
//     keywords: [],
//   });

//   const categories = [
//     'Property News',
//     'Market Analysis',
//     'Investment',
//     'Legal',
//     'Home Buying',
//     'Home Selling',
//     'Construction',
//     'Finance',
//   ];

//   const predefinedSources: Array<Pick<RSSSource, 'name' | 'url' | 'category' | 'description'>> = [
//     {
//       name: 'Economic Times Real Estate',
//       url: 'https://cfo.economictimes.indiatimes.com/rss/topstories',
//       category: 'Market Analysis',
//       description: 'Leading business news on real estate market',
//     },
//     {
//       name: 'Housing.com News',
//       url: 'https://housing.com/news/feed/',
//       category: 'Property News',
//       description: 'Latest property news and updates',
//     },
//     {
//       name: 'MoneyControl Real Estate',
//       url: 'https://www.moneycontrol.com/rss/realestate.xml',
//       category: 'Investment',
//       description: 'Investment focused real estate content',
//     },
//     {
//       name: 'PropTiger Blog',
//       url: 'https://www.proptiger.com/blog/feed/',
//       category: 'Property News',
//       description: 'Property insights and market trends',
//     },
//     {
//       name: 'Magicbricks Blog',
//       url: 'https://www.magicbricks.com/blog/feed/',
//       category: 'Home Buying',
//       description: 'Home buying and selling guides',
//     },
//     {
//       name: 'Square Yards News',
//       url: 'https://www.squareyards.com/blog/feed',
//       category: 'Market Analysis',
//       description: 'Real estate market analysis and trends',
//     },
//   ];

//   /* =================== Load sources =================== */
//   useEffect(() => {
//     (async () => {
//       try {
//         setLoading(true);
//         const resp = await rssAPI.getAll();
//         const list = normalizeList(resp);
//         setSources(list);
//       } catch (e: any) {
//         toast.error(e?.message || 'Failed to load sources');
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   /* =================== Handlers =================== */
//   const handleAddPredefined = async (pre: typeof predefinedSources[number]) => {
//     try {
//       const payload = {
//         ...pre,
//         active: true,
//         autoPublish: false,
//         syncFrequency: 'daily' as RSSSyncFrequency,
//         contentFilter: 'keywords' as RSSContentFilter,
//         keywords: ['real estate', 'property', 'investment'],
//       };

//       const resp = await rssAPI.create(payload);
//       const created = normalizeOne(resp?.data);
//       setSources((prev) => [created, ...prev]);
//       setShowAddForm(false);
//       toast.success('RSS source added');
//     } catch (e: any) {
//       toast.error(e?.message || 'Failed to add source');
//     }
//   };

//   const handleAddSource = async () => {
//     if (!form.name || !form.url) {
//       toast.error('Name and URL are required');
//       return;
//     }
//     try {
//       const payload = {
//         ...form,
//         active: toStringBool(form.active),
//         autoPublish: toStringBool(form.autoPublish),
//         contentFilter: (form.contentFilter ?? 'keywords') as RSSContentFilter,
//         syncFrequency: (form.syncFrequency ?? 'daily') as RSSSyncFrequency,
//         keywords: (form.keywords ?? []).map((k) => String(k)),
//       };

//       const resp = await rssAPI.create(payload);
//       const created = normalizeOne(resp?.data);
//       setSources((prev) => [created, ...prev]);
//       setForm({
//         name: '',
//         url: '',
//         category: 'Property News',
//         description: '',
//         active: true,
//         autoPublish: false,
//         syncFrequency: 'daily',
//         contentFilter: 'keywords',
//         keywords: [],
//       });
//       setShowAddForm(false);
//       toast.success('RSS source added');
//     } catch (e: any) {
//       toast.error(e?.message || 'Failed to add source');
//     }
//   };

//   const handleEditSource = (src: RSSSource) => {
//     setEditingSource(src);
//     setForm({ ...src });
//     setShowAddForm(true);
//   };

//   const handleUpdateSource = async () => {
//     if (!editingSource) return;
//     try {
//       const numericId = Number(editingSource.id);
//       const payload = {
//         ...form,
//         active: toStringBool(form.active),
//         autoPublish: toStringBool(form.autoPublish),
//         contentFilter: (form.contentFilter ?? 'keywords') as RSSContentFilter,
//         syncFrequency: (form.syncFrequency ?? 'daily') as RSSSyncFrequency,
//         keywords: (form.keywords ?? []).map((k) => String(k)),
//       };

//       const resp = await rssAPI.update(numericId, payload);
//       const updated = normalizeOne(resp?.data);
//       setSources((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
//       setEditingSource(null);
//       setShowAddForm(false);
//       setForm({
//         name: '',
//         url: '',
//         category: 'Property News',
//         description: '',
//         active: true,
//         autoPublish: false,
//         syncFrequency: 'daily',
//         contentFilter: 'keywords',
//         keywords: [],
//       });
//       toast.success('Source updated');
//     } catch (e: any) {
//       toast.error(e?.message || 'Failed to update');
//     }
//   };

//   const handleToggleSource = async (id: string) => {
//     try {
//       const resp = await rssAPI.toggle(Number(id));
//       const updated = normalizeOne(resp?.data);
//       setSources((prev) => prev.map((s) => (s.id === id ? updated : s)));
//       toast.success('Source status updated');
//     } catch (e: any) {
//       toast.error(e?.message || 'Failed to toggle');
//     }
//   };

//   // SCAN one (no DB writes): updates newPosts/lastSync on server, returns latest source
//   const handleScanSingle = async (id: string) => {
//     try {
//       setSyncingSourceId(id);
//       const resp = await rssAPI.scan(Number(id));
//       // backend returns { success, data: updatedSource, meta: { fetched, newCount, previews } }
//       const updated = normalizeOne(resp?.data);
//       setSources((prev) => prev.map((s) => (s.id === id ? updated : s)));
//       const meta = resp?.meta || {};
//       toast.success(`Scanned: ${meta?.newCount ?? 0} new / ${meta?.fetched ?? 0} fetched`);
//     } catch (e: any) {
//       toast.error(e?.message || 'Failed to scan');
//     } finally {
//       setSyncingSourceId(null);
//     }
//   };

//   // IMPORT one (creates DRAFTs): server returns latest source w/ counters adjusted
//   const handleImportSingle = async (id: string) => {
//     try {
//       setSyncingSourceId(id);
//       const resp = await rssAPI.importDrafts(Number(id));
//       // backend returns { success, data: updatedSource, meta: { fetched, inserted } }
//       const updated = normalizeOne(resp?.data);
//       setSources((prev) => prev.map((s) => (s.id === id ? updated : s)));
//       const meta = resp?.meta || {};
//       toast.success(`Imported ${meta?.inserted ?? 0} article(s) as drafts`);
//       // Optional: if you want to also refresh your Drafts tab elsewhere, trigger a global refresh here.
//     } catch (e: any) {
//       toast.error(e?.message || 'Failed to import');
//     } finally {
//       setSyncingSourceId(null);
//     }
//   };

//   // SCAN all (no DB writes)
//   const handleScanAll = async () => {
//     try {
//       setSyncingAll(true);
//       await rssAPI.syncAll(); // this is now "scan all" on backend
//       const resp = await rssAPI.getAll();
//       const fresh = normalizeList(resp);
//       setSources(fresh);
//       toast.success('Scan all completed');
//     } catch (e: any) {
//       toast.error(e?.message || 'Failed to scan all');
//     } finally {
//       setSyncingAll(false);
//     }
//   };

//   /* =================== Derived stats =================== */
//   const totals = useMemo(() => {
//     return {
//       sources: sources.length,
//       active: sources.filter((s) => toStringBool(s.active)).length,
//       totalPosts: sources.reduce((a, s) => a + Number(s.totalPosts ?? 0), 0),
//       newPosts: sources.reduce((a, s) => a + Number(s.newPosts ?? 0), 0),
//     };
//   }, [sources]);

//   /* =================== UI pieces =================== */
//   const Header = (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900 mb-2 sm:mb-1">RSS Source Management</h2>
//           <p className="text-gray-600">Manage and monitor RSS feeds for controlled content import</p>
//         </div>
//         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
//           <button
//             onClick={() => {
//               setEditingSource(null);
//               setShowAddForm(true);
//             }}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
//           >
//             <Plus size={18} />
//             <span>Add Source</span>
//           </button>

//           <button
//             onClick={handleScanAll}
//             disabled={syncingAll || loading}
//             className="bg-green-600 disabled:opacity-60 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
//           >
//             <RefreshCw size={18} className={syncingAll ? 'animate-spin' : ''} />
//             <span>{syncingAll ? 'Scanning…' : 'Scan All'}</span>
//           </button>
//         </div>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <div className="bg-blue-50 rounded-lg p-4">
//           <div className="flex items-center gap-2">
//             <Globe className="text-blue-600" size={20} />
//             <div>
//               <div className="text-xl font-bold text-blue-600">{totals.sources}</div>
//               <div className="text-sm text-blue-700">Total Sources</div>
//             </div>
//           </div>
//         </div>
//         <div className="bg-green-50 rounded-lg p-4">
//           <div className="flex items-center gap-2">
//             <CheckCircle className="text-green-600" size={20} />
//             <div>
//               <div className="text-xl font-bold text-green-600">{totals.active}</div>
//               <div className="text-sm text-green-700">Active Sources</div>
//             </div>
//           </div>
//         </div>
//         <div className="bg-purple-50 rounded-lg p-4">
//           <div className="flex items-center gap-2">
//             <TrendingUp className="text-purple-600" size={20} />
//             <div>
//               <div className="text-xl font-bold text-purple-600">{totals.totalPosts}</div>
//               <div className="text-sm text-purple-700">Total Posts</div>
//             </div>
//           </div>
//         </div>
//         <div className="bg-orange-50 rounded-lg p-4">
//           <div className="flex items-center gap-2">
//             <Bot className="text-orange-600" size={20} />
//             <div>
//               <div className="text-xl font-bold text-orange-600">{totals.newPosts}</div>
//               <div className="text-sm text-orange-700">Pending Import</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const Grid = (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//       {(loading ? [] : sources).map((source) => (
//         <RSSSourceCard
//           key={source.id}
//           source={source}
//           isLoading={syncingSourceId === source.id}
//           onSync={() => handleScanSingle(source.id)}   // SCAN only
//           onImport={() => handleImportSingle(source.id)} // IMPORT (drafts)
//           onToggle={() => handleToggleSource(source.id)}
//           onEdit={() => handleEditSource(source)}
//           onDelete={() => handleDeleteSource(source.id)}
//         />
//       ))}
//     </div>
//   );

//   const EmptyState =
//     !loading && sources.length === 0 ? (
//       <div className="text-center py-12">
//         <Globe className="mx-auto text-gray-300 mb-4" size={64} />
//         <h3 className="text-xl font-bold text-gray-900 mb-2">No RSS Sources Found</h3>
//         <p className="text-gray-600 mb-6">Add RSS sources to scan and import articles as drafts</p>
//         <button
//           onClick={() => {
//             setEditingSource(null);
//             setShowAddForm(true);
//           }}
//           className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
//         >
//           Add Your First Source
//         </button>
//       </div>
//     ) : null;

//   const AdvancedSection = (
//     <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
//       <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
//         <Bot className="text-purple-600" size={20} />
//         <span>Advanced RSS Features</span>
//       </h3>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="bg-white rounded-lg p-4">
//           <div className="flex items-center gap-2 mb-2">
//             <Shield className="text-blue-600" size={18} />
//             <span className="font-medium text-gray-900">Plagiarism Check</span>
//           </div>
//           <p className="text-sm text-gray-600">
//             AI automatically checks and rewrites content to ensure 95%+ originality score
//           </p>
//         </div>

//         <div className="bg-white rounded-lg p-4">
//           <div className="flex items-center gap-2 mb-2">
//             <Zap className="text-green-600" size={18} />
//             <span className="font-medium text-gray-900">Smart Formatting</span>
//           </div>
//           <p className="text-sm text-gray-600">
//             Auto-generates table of contents, proper headings, and professional formatting
//           </p>
//         </div>

//         <div className="bg-white rounded-lg p-4">
//           <div className="flex items-center gap-2 mb-2">
//             <TrendingUp className="text-purple-600" size={18} />
//             <span className="font-medium text-gray-900">SEO Optimization</span>
//           </div>
//           <p className="text-sm text-gray-600">
//             Automatically optimizes content for search engines with meta tags and keywords
//           </p>
//         </div>
//       </div>
//     </div>
//   );

//   const renderContent = () => (
//     <div className="space-y-6">
//       {Header}

//       <RSSSourceFormModal
//         open={showAddForm}
//         onClose={() => {
//           setShowAddForm(false);
//           setEditingSource(null);
//           setForm({
//             name: '',
//             url: '',
//             category: 'Property News',
//             description: '',
//             active: true,
//             autoPublish: false,
//             syncFrequency: 'daily',
//             contentFilter: 'keywords',
//             keywords: [],
//           });
//         }}
//         form={form}
//         setForm={setForm}
//         editingSource={editingSource}
//         onSubmit={editingSource ? handleUpdateSource : handleAddSource}
//         categories={categories}
//         predefinedSources={predefinedSources}
//         onAddPredefined={handleAddPredefined}
//       />

//       {Grid}
//       {EmptyState}
//       {AdvancedSection}
//     </div>
//   );

//   if (isOpen !== undefined && !isOpen) return null;

//   return isOpen !== undefined ? (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-2xl font-bold text-gray-900">RSS Source Management</h2>
//             <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
//               <X size={24} />
//             </button>
//           </div>
//           {renderContent()}
//         </div>
//       </div>
//     </div>
//   ) : (
//     renderContent()
//   );
// };

// export default RSSSourceManager;




// import React, { useEffect, useMemo, useState } from 'react';
// import {
//   Plus,
//   Globe,
//   RefreshCw,
//   X,
//   CheckCircle,
//   TrendingUp,
//   Bot,
//   Shield,
//   Zap,
// } from 'lucide-react';
// import toast from 'react-hot-toast';
// import { rssAPI } from '@/lib/rssAPI';
// import RSSSourceCard from './RSSSourceCard';
// import { RSSSource as SharedRSSSource } from '../../types/blog';
// import RSSSourceFormModal from './RSSSourceFormModal';

// /* =========================================================
//    Types
//    ========================================================= */

// type RSSSyncFrequency = 'hourly' | 'daily' | 'weekly' | 'manual';
// type RSSContentFilter = 'keywords' | 'all';

// type RSSSource = SharedRSSSource & {
//   id: string;
//   name: string;
//   url: string;
//   category: string;
//   description?: string | null;
//   active: boolean | 0 | 1;
//   autoPublish: boolean | 0 | 1;
//   syncFrequency?: RSSSyncFrequency;
//   contentFilter?: RSSContentFilter;
//   keywords?: string[];
//   lastSync?: string | null;
//   totalPosts?: number;
//   newPosts?: number;
//   createdAt?: string;
//   updatedAt?: string;
// };

// interface RSSSourceManagerProps {
//   isOpen?: boolean;
//   onClose?: () => void;
// }

// /* =========================================================
//    Helpers
//    ========================================================= */

// function toStringBool(v: any): boolean {
//   if (v === true || v === 1 || v === '1') return true;
//   return !!v;
// }

// function normalizeOne(raw: any): RSSSource {
//   return {
//     id: String(raw.id ?? raw.source_id ?? ''),
//     name: raw.name ?? '',
//     url: raw.url ?? '',
//     category: raw.category ?? 'Property News',
//     description: raw.description ?? null,
//     active: raw.active ?? true,
//     autoPublish: raw.autoPublish ?? false,
//     syncFrequency: (raw.syncFrequency ?? 'daily') as RSSSyncFrequency,
//     contentFilter: (raw.contentFilter ?? 'keywords') as RSSContentFilter,
//     keywords: Array.isArray(raw.keywords)
//       ? raw.keywords
//       : typeof raw.keywords === 'string'
//         ? raw.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
//         : [],
//     lastSync: raw.lastSync ?? null,
//     totalPosts: Number(raw.totalPosts ?? 0),
//     newPosts: Number(raw.newPosts ?? 0),
//     createdAt: raw.createdAt ?? raw.created_at ?? undefined,
//     updatedAt: raw.updatedAt ?? raw.updated_at ?? undefined,
//   };
// }

// function normalizeList(resp: any): RSSSource[] {
//   const arr = Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
//   return arr.map(normalizeOne);
// }

// /* =========================================================
//    Component
//    ========================================================= */

// const RSSSourceManager: React.FC<RSSSourceManagerProps> = ({ isOpen, onClose }) => {
//   const [sources, setSources] = useState<RSSSource[]>([]);
//   const [loading, setLoading] = useState(false);

//   const [showAddForm, setShowAddForm] = useState(false);
//   const [editingSource, setEditingSource] = useState<RSSSource | null>(null);
//   const [syncingSourceId, setSyncingSourceId] = useState<string | null>(null);
//   const [syncingAll, setSyncingAll] = useState(false);

//   const [form, setForm] = useState<Partial<RSSSource>>({
//     name: '',
//     url: '',
//     category: 'Property News',
//     description: '',
//     active: true,
//     autoPublish: false,
//     syncFrequency: 'daily',
//     contentFilter: 'keywords',
//     keywords: [],
//   });

//   const categories = [
//     'Property News',
//     'Market Analysis',
//     'Investment',
//     'Legal',
//     'Home Buying',
//     'Home Selling',
//     'Construction',
//     'Finance',
//   ];

//   const predefinedSources: Array<Pick<RSSSource, 'name' | 'url' | 'category' | 'description'>> = [
//     {
//       name: 'Economic Times Real Estate',
//       url: 'https://cfo.economictimes.indiatimes.com/rss/topstories',
//       category: 'Market Analysis',
//       description: 'Leading business news on real estate market',
//     },
//     {
//       name: 'Housing.com News',
//       url: 'https://housing.com/news/feed/',
//       category: 'Property News',
//       description: 'Latest property news and updates',
//     },
//     {
//       name: 'MoneyControl Real Estate',
//       url: 'https://www.moneycontrol.com/rss/realestate.xml',
//       category: 'Investment',
//       description: 'Investment focused real estate content',
//     },
//     {
//       name: 'PropTiger Blog',
//       url: 'https://www.proptiger.com/blog/feed/',
//       category: 'Property News',
//       description: 'Property insights and market trends',
//     },
//     {
//       name: 'Magicbricks Blog',
//       url: 'https://www.magicbricks.com/blog/feed/',
//       category: 'Home Buying',
//       description: 'Home buying and selling guides',
//     },
//     {
//       name: 'Square Yards News',
//       url: 'https://www.squareyards.com/blog/feed',
//       category: 'Market Analysis',
//       description: 'Real estate market analysis and trends',
//     },
//   ];

//   /* =================== Load sources =================== */
//   useEffect(() => {
//     (async () => {
//       try {
//         setLoading(true);
//         const resp = await rssAPI.getAll();
//         const list = normalizeList(resp);
//         setSources(list);
//       } catch (e: any) {
//         toast.error(e?.message || 'Failed to load sources');
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   /* =================== Handlers =================== */
//   const handleAddPredefined = async (pre: typeof predefinedSources[number]) => {
//     try {
//       const payload = {
//         ...pre,
//         active: true,
//         autoPublish: false,
//         syncFrequency: 'daily' as RSSSyncFrequency,
//         contentFilter: 'keywords' as RSSContentFilter,
//         keywords: ['real estate', 'property', 'investment'],
//       };

//       const resp = await rssAPI.create(payload);
//       const created = normalizeOne(resp?.data);
//       setSources((prev) => [created, ...prev]);
//       setShowAddForm(false);
//       toast.success('RSS source added');
//     } catch (e: any) {
//       toast.error(e?.message || 'Failed to add source');
//     }
//   };

//   const handleAddSource = async () => {
//     if (!form.name || !form.url) {
//       toast.error('Name and URL are required');
//       return;
//     }
//     try {
//       const payload = {
//         ...form,
//         active: toStringBool(form.active),
//         autoPublish: toStringBool(form.autoPublish),
//         contentFilter: (form.contentFilter ?? 'keywords') as RSSContentFilter,
//         syncFrequency: (form.syncFrequency ?? 'daily') as RSSSyncFrequency,
//         keywords: (form.keywords ?? []).map((k) => String(k)),
//       };

//       const resp = await rssAPI.create(payload);
//       const created = normalizeOne(resp?.data);
//       setSources((prev) => [created, ...prev]);
//       setForm({
//         name: '',
//         url: '',
//         category: 'Property News',
//         description: '',
//         active: true,
//         autoPublish: false,
//         syncFrequency: 'daily',
//         contentFilter: 'keywords',
//         keywords: [],
//       });
//       setShowAddForm(false);
//       toast.success('RSS source added');
//     } catch (e: any) {
//       toast.error(e?.message || 'Failed to add source');
//     }
//   };

//   const handleEditSource = (src: RSSSource) => {
//     setEditingSource(src);
//     setForm({ ...src });
//     setShowAddForm(true);
//   };

//   const handleUpdateSource = async () => {
//     if (!editingSource) return;
//     try {
//       const numericId = Number(editingSource.id);
//       const payload = {
//         ...form,
//         active: toStringBool(form.active),
//         autoPublish: toStringBool(form.autoPublish),
//         contentFilter: (form.contentFilter ?? 'keywords') as RSSContentFilter,
//         syncFrequency: (form.syncFrequency ?? 'daily') as RSSSyncFrequency,
//         keywords: (form.keywords ?? []).map((k) => String(k)),
//       };

//       const resp = await rssAPI.update(numericId, payload);
//       const updated = normalizeOne(resp?.data);
//       setSources((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
//       setEditingSource(null);
//       setShowAddForm(false);
//       setForm({
//         name: '',
//         url: '',
//         category: 'Property News',
//         description: '',
//         active: true,
//         autoPublish: false,
//         syncFrequency: 'daily',
//         contentFilter: 'keywords',
//         keywords: [],
//       });
//       toast.success('Source updated');
//     } catch (e: any) {
//       toast.error(e?.message || 'Failed to update');
//     }
//   };

//   const handleToggleSource = async (id: string) => {
//     try {
//       const resp = await rssAPI.toggle(Number(id));
//       const updated = normalizeOne(resp?.data);
//       setSources((prev) => prev.map((s) => (s.id === id ? updated : s)));
//       toast.success('Source status updated');
//     } catch (e: any) {
//       toast.error(e?.message || 'Failed to toggle');
//     }
//   };

//   // ✅ NEWLY ADDED FUNCTION
//   const handleDeleteSource = async (id: string) => {
//     try {
//       if (!confirm('Are you sure you want to delete this source?')) return;

//       await rssAPI.delete(Number(id));
//       setSources((prev) => prev.filter((s) => s.id !== id));
//       toast.success('RSS source deleted');
//     } catch (e: any) {
//       toast.error(e?.message || 'Failed to delete source');
//     }
//   };

//   // SCAN one
//   const handleScanSingle = async (id: string) => {
//     try {
//       setSyncingSourceId(id);
//       const resp = await rssAPI.scan(Number(id));
//       const updated = normalizeOne(resp?.data);
//       setSources((prev) => prev.map((s) => (s.id === id ? updated : s)));
//       const meta = resp?.meta || {};
//       toast.success(`Scanned: ${meta?.newCount ?? 0} new / ${meta?.fetched ?? 0} fetched`);
//     } catch (e: any) {
//       toast.error(e?.message || 'Failed to scan');
//     } finally {
//       setSyncingSourceId(null);
//     }
//   };

//   // IMPORT one
//   const handleImportSingle = async (id: string) => {
//     try {
//       setSyncingSourceId(id);
//       const resp = await rssAPI.importDrafts(Number(id));
//       const updated = normalizeOne(resp?.data);
//       setSources((prev) => prev.map((s) => (s.id === id ? updated : s)));
//       const meta = resp?.meta || {};
//       toast.success(`Imported ${meta?.inserted ?? 0} article(s) as drafts`);
//     } catch (e: any) {
//       toast.error(e?.message || 'Failed to import');
//     } finally {
//       setSyncingSourceId(null);
//     }
//   };

//   // SCAN all
//   const handleScanAll = async () => {
//     try {
//       setSyncingAll(true);
//       await rssAPI.syncAll();
//       const resp = await rssAPI.getAll();
//       const fresh = normalizeList(resp);
//       setSources(fresh);
//       toast.success('Scan all completed');
//     } catch (e: any) {
//       toast.error(e?.message || 'Failed to scan all');
//     } finally {
//       setSyncingAll(false);
//     }
//   };

//   /* =================== Derived stats =================== */
//   const totals = useMemo(() => {
//     return {
//       sources: sources.length,
//       active: sources.filter((s) => toStringBool(s.active)).length,
//       totalPosts: sources.reduce((a, s) => a + Number(s.totalPosts ?? 0), 0),
//       newPosts: sources.reduce((a, s) => a + Number(s.newPosts ?? 0), 0),
//     };
//   }, [sources]);

//   /* =================== UI pieces =================== */
//   const Header = (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900 mb-2 sm:mb-1">RSS Source Management</h2>
//           <p className="text-gray-600">Manage and monitor RSS feeds for controlled content import</p>
//         </div>
//         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
//           <button
//             onClick={() => {
//               setEditingSource(null);
//               setShowAddForm(true);
//             }}
//             className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
//           >
//             <Plus size={18} />
//             <span>Add Source</span>
//           </button>

//           <button
//             onClick={handleScanAll}
//             disabled={syncingAll || loading}
//             className="bg-green-600 disabled:opacity-60 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
//           >
//             <RefreshCw size={18} className={syncingAll ? 'animate-spin' : ''} />
//             <span>{syncingAll ? 'Scanning…' : 'Scan All'}</span>
//           </button>
//         </div>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <div className="bg-blue-50 rounded-lg p-4">
//           <div className="flex items-center gap-2">
//             <Globe className="text-blue-600" size={20} />
//             <div>
//               <div className="text-xl font-bold text-blue-600">{totals.sources}</div>
//               <div className="text-sm text-blue-700">Total Sources</div>
//             </div>
//           </div>
//         </div>
//         <div className="bg-green-50 rounded-lg p-4">
//           <div className="flex items-center gap-2">
//             <CheckCircle className="text-green-600" size={20} />
//             <div>
//               <div className="text-xl font-bold text-green-600">{totals.active}</div>
//               <div className="text-sm text-green-700">Active Sources</div>
//             </div>
//           </div>
//         </div>
//         <div className="bg-purple-50 rounded-lg p-4">
//           <div className="flex items-center gap-2">
//             <TrendingUp className="text-purple-600" size={20} />
//             <div>
//               <div className="text-xl font-bold text-purple-600">{totals.totalPosts}</div>
//               <div className="text-sm text-purple-700">Total Posts</div>
//             </div>
//           </div>
//         </div>
//         <div className="bg-orange-50 rounded-lg p-4">
//           <div className="flex items-center gap-2">
//             <Bot className="text-orange-600" size={20} />
//             <div>
//               <div className="text-xl font-bold text-orange-600">{totals.newPosts}</div>
//               <div className="text-sm text-orange-700">Pending Import</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const Grid = (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//       {(loading ? [] : sources).map((source) => (
//         <RSSSourceCard
//           key={source.id}
//           source={source}
//           isLoading={syncingSourceId === source.id}
//           onSync={() => handleScanSingle(source.id)}   // SCAN only
//           onImport={() => handleImportSingle(source.id)} // IMPORT (drafts)
//           onToggle={() => handleToggleSource(source.id)}
//           onEdit={() => handleEditSource(source)}
//           onDelete={() => handleDeleteSource(source.id)}
//         />
//       ))}
//     </div>
//   );

//   const EmptyState =
//     !loading && sources.length === 0 ? (
//       <div className="text-center py-12">
//         <Globe className="mx-auto text-gray-300 mb-4" size={64} />
//         <h3 className="text-xl font-bold text-gray-900 mb-2">No RSS Sources Found</h3>
//         <p className="text-gray-600 mb-6">Add RSS sources to scan and import articles as drafts</p>
//         <button
//           onClick={() => {
//             setEditingSource(null);
//             setShowAddForm(true);
//           }}
//           className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
//         >
//           Add Your First Source
//         </button>
//       </div>
//     ) : null;

//   const AdvancedSection = (
//     <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
//       <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
//         <Bot className="text-purple-600" size={20} />
//         <span>Advanced RSS Features</span>
//       </h3>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="bg-white rounded-lg p-4">
//           <div className="flex items-center gap-2 mb-2">
//             <Shield className="text-blue-600" size={18} />
//             <span className="font-medium text-gray-900">Plagiarism Check</span>
//           </div>
//           <p className="text-sm text-gray-600">
//             AI automatically checks and rewrites content to ensure 95%+ originality score
//           </p>
//         </div>

//         <div className="bg-white rounded-lg p-4">
//           <div className="flex items-center gap-2 mb-2">
//             <Zap className="text-green-600" size={18} />
//             <span className="font-medium text-gray-900">Smart Formatting</span>
//           </div>
//           <p className="text-sm text-gray-600">
//             Auto-generates table of contents, proper headings, and professional formatting
//           </p>
//         </div>

//         <div className="bg-white rounded-lg p-4">
//           <div className="flex items-center gap-2 mb-2">
//             <TrendingUp className="text-purple-600" size={18} />
//             <span className="font-medium text-gray-900">SEO Optimization</span>
//           </div>
//           <p className="text-sm text-gray-600">
//             Automatically optimizes content for search engines with meta tags and keywords
//           </p>
//         </div>
//       </div>
//     </div>
//   );

//   const renderContent = () => (
//     <div className="space-y-6">
//       {Header}

//       <RSSSourceFormModal
//         open={showAddForm}
//         onClose={() => {
//           setShowAddForm(false);
//           setEditingSource(null);
//           setForm({
//             name: '',
//             url: '',
//             category: 'Property News',
//             description: '',
//             active: true,
//             autoPublish: false,
//             syncFrequency: 'daily',
//             contentFilter: 'keywords',
//             keywords: [],
//           });
//         }}
//         form={form}
//         setForm={setForm}
//         editingSource={editingSource}
//         onSubmit={editingSource ? handleUpdateSource : handleAddSource}
//         categories={categories}
//         predefinedSources={predefinedSources}
//         onAddPredefined={handleAddPredefined}
//       />

//       {Grid}
//       {EmptyState}
//       {AdvancedSection}
//     </div>
//   );

//   if (isOpen !== undefined && !isOpen) return null;

//   return isOpen !== undefined ? (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-2xl font-bold text-gray-900">RSS Source Management</h2>
//             <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
//               <X size={24} />
//             </button>
//           </div>
//           {renderContent()}
//         </div>
//       </div>
//     </div>
//   ) : (
//     renderContent()
//   );
// };

// export default RSSSourceManager;


import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Globe,
  RefreshCw,
  X,
  CheckCircle,
  TrendingUp,
  Bot,
  Shield,
  Zap,
  Radio,
  Clock,
  Filter,
  Tag,
  BookOpen,
  ArrowRight,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import { rssAPI } from '@/lib/rssAPI';
import RSSSourceCard from './RSSSourceCard';
import { RSSSource as SharedRSSSource } from '../../types/blog';
import RSSSourceFormModal from './RSSSourceFormModal';

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

type RSSSyncFrequency = 'hourly' | 'daily' | 'weekly' | 'manual';
type RSSContentFilter = 'keywords' | 'all';

type RSSSource = SharedRSSSource & {
  id: string;
  name: string;
  url: string;
  category: string;
  description?: string | null;
  active: boolean | 0 | 1;
  autoPublish: boolean | 0 | 1;
  syncFrequency?: RSSSyncFrequency;
  contentFilter?: RSSContentFilter;
  keywords?: string[];
  lastSync?: string | null;
  totalPosts?: number;
  newPosts?: number;
  createdAt?: string;
  updatedAt?: string;
};

interface RSSSourceManagerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const scrollbarStyles = {
  scrollbarWidth: 'thin',
  scrollbarColor: `${BD} ${BG}`,
  WebkitOverflowScrolling: 'touch',
};

function toStringBool(v: any): boolean {
  if (v === true || v === 1 || v === '1') return true;
  return !!v;
}

function normalizeOne(raw: any): RSSSource {
  return {
    id: String(raw.id ?? raw.source_id ?? ''),
    name: raw.name ?? '',
    url: raw.url ?? '',
    category: raw.category ?? 'Property News',
    description: raw.description ?? null,
    active: raw.active ?? true,
    autoPublish: raw.autoPublish ?? false,
    syncFrequency: (raw.syncFrequency ?? 'daily') as RSSSyncFrequency,
    contentFilter: (raw.contentFilter ?? 'keywords') as RSSContentFilter,
    keywords: Array.isArray(raw.keywords)
      ? raw.keywords
      : typeof raw.keywords === 'string'
        ? raw.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)
        : [],
    lastSync: raw.lastSync ?? null,
    totalPosts: Number(raw.totalPosts ?? 0),
    newPosts: Number(raw.newPosts ?? 0),
    createdAt: raw.createdAt ?? raw.created_at ?? undefined,
    updatedAt: raw.updatedAt ?? raw.updated_at ?? undefined,
  };
}

function normalizeList(resp: any): RSSSource[] {
  const arr = Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
  return arr.map(normalizeOne);
}

const RSSSourceManager: React.FC<RSSSourceManagerProps> = ({ isOpen, onClose }) => {
  const [sources, setSources] = useState<RSSSource[]>([]);
  const [loading, setLoading] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSource, setEditingSource] = useState<RSSSource | null>(null);
  const [syncingSourceId, setSyncingSourceId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);

  const [form, setForm] = useState<Partial<RSSSource>>({
    name: '',
    url: '',
    category: 'Property News',
    description: '',
    active: true,
    autoPublish: false,
    syncFrequency: 'daily',
    contentFilter: 'keywords',
    keywords: [],
  });

  const categories = [
    'Property News',
    'Market Analysis',
    'Investment',
    'Legal',
    'Home Buying',
    'Home Selling',
    'Construction',
    'Finance',
  ];

  const predefinedSources: Array<Pick<RSSSource, 'name' | 'url' | 'category' | 'description'>> = [
    {
      name: 'Economic Times Real Estate',
      url: 'https://cfo.economictimes.indiatimes.com/rss/topstories',
      category: 'Market Analysis',
      description: 'Leading business news on real estate market',
    },
    {
      name: 'Housing.com News',
      url: 'https://housing.com/news/feed/',
      category: 'Property News',
      description: 'Latest property news and updates',
    },
    {
      name: 'MoneyControl Real Estate',
      url: 'https://www.moneycontrol.com/rss/realestate.xml',
      category: 'Investment',
      description: 'Investment focused real estate content',
    },
    {
      name: 'PropTiger Blog',
      url: 'https://www.proptiger.com/blog/feed/',
      category: 'Property News',
      description: 'Property insights and market trends',
    },
    {
      name: 'Magicbricks Blog',
      url: 'https://www.magicbricks.com/blog/feed/',
      category: 'Home Buying',
      description: 'Home buying and selling guides',
    },
    {
      name: 'Square Yards News',
      url: 'https://www.squareyards.com/blog/feed',
      category: 'Market Analysis',
      description: 'Real estate market analysis and trends',
    },
  ];

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await rssAPI.getAll();
        const list = normalizeList(resp);
        setSources(list);
      } catch (e: any) {
        toast.error(e?.message || 'Failed to load sources');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAddPredefined = async (pre: typeof predefinedSources[number]) => {
    try {
      const payload = {
        ...pre,
        active: true,
        autoPublish: false,
        syncFrequency: 'daily' as RSSSyncFrequency,
        contentFilter: 'keywords' as RSSContentFilter,
        keywords: ['real estate', 'property', 'investment'],
      };

      const resp = await rssAPI.create(payload);
      const created = normalizeOne(resp?.data);
      setSources((prev) => [created, ...prev]);
      setShowAddForm(false);
      toast.success('RSS source added');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to add source');
    }
  };

  const handleAddSource = async () => {
    if (!form.name || !form.url) {
      toast.error('Name and URL are required');
      return;
    }
    try {
      const payload = {
        ...form,
        active: toStringBool(form.active),
        autoPublish: toStringBool(form.autoPublish),
        contentFilter: (form.contentFilter ?? 'keywords') as RSSContentFilter,
        syncFrequency: (form.syncFrequency ?? 'daily') as RSSSyncFrequency,
        keywords: (form.keywords ?? []).map((k) => String(k)),
      };

      const resp = await rssAPI.create(payload);
      const created = normalizeOne(resp?.data);
      setSources((prev) => [created, ...prev]);
      setForm({
        name: '',
        url: '',
        category: 'Property News',
        description: '',
        active: true,
        autoPublish: false,
        syncFrequency: 'daily',
        contentFilter: 'keywords',
        keywords: [],
      });
      setShowAddForm(false);
      toast.success('RSS source added');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to add source');
    }
  };

  const handleEditSource = (src: RSSSource) => {
    setEditingSource(src);
    setForm({ ...src });
    setShowAddForm(true);
  };

  const handleUpdateSource = async () => {
    if (!editingSource) return;
    try {
      const numericId = Number(editingSource.id);
      const payload = {
        ...form,
        active: toStringBool(form.active),
        autoPublish: toStringBool(form.autoPublish),
        contentFilter: (form.contentFilter ?? 'keywords') as RSSContentFilter,
        syncFrequency: (form.syncFrequency ?? 'daily') as RSSSyncFrequency,
        keywords: (form.keywords ?? []).map((k) => String(k)),
      };

      const resp = await rssAPI.update(numericId, payload);
      const updated = normalizeOne(resp?.data);
      setSources((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setEditingSource(null);
      setShowAddForm(false);
      setForm({
        name: '',
        url: '',
        category: 'Property News',
        description: '',
        active: true,
        autoPublish: false,
        syncFrequency: 'daily',
        contentFilter: 'keywords',
        keywords: [],
      });
      toast.success('Source updated');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update');
    }
  };

  const handleToggleSource = async (id: string) => {
    try {
      const resp = await rssAPI.toggle(Number(id));
      const updated = normalizeOne(resp?.data);
      setSources((prev) => prev.map((s) => (s.id === id ? updated : s)));
      toast.success('Source status updated');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to toggle');
    }
  };

  const handleDeleteSource = async (id: string) => {
    try {
      if (!confirm('Are you sure you want to delete this source?')) return;
      await rssAPI.delete(Number(id));
      setSources((prev) => prev.filter((s) => s.id !== id));
      toast.success('RSS source deleted');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete source');
    }
  };

  const handleScanSingle = async (id: string) => {
    try {
      setSyncingSourceId(id);
      const resp = await rssAPI.scan(Number(id));
      const updated = normalizeOne(resp?.data);
      setSources((prev) => prev.map((s) => (s.id === id ? updated : s)));
      const meta = resp?.meta || {};
      toast.success(`Scanned: ${meta?.newCount ?? 0} new / ${meta?.fetched ?? 0} fetched`);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to scan');
    } finally {
      setSyncingSourceId(null);
    }
  };

  const handleImportSingle = async (id: string) => {
    try {
      setSyncingSourceId(id);
      const resp = await rssAPI.importDrafts(Number(id));
      const updated = normalizeOne(resp?.data);
      setSources((prev) => prev.map((s) => (s.id === id ? updated : s)));
      const meta = resp?.meta || {};
      toast.success(`Imported ${meta?.inserted ?? 0} article(s) as drafts`);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to import');
    } finally {
      setSyncingSourceId(null);
    }
  };

  const handleScanAll = async () => {
    try {
      setSyncingAll(true);
      await rssAPI.syncAll();
      const resp = await rssAPI.getAll();
      const fresh = normalizeList(resp);
      setSources(fresh);
      toast.success('Scan all completed');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to scan all');
    } finally {
      setSyncingAll(false);
    }
  };

  const totals = useMemo(() => {
    return {
      sources: sources.length,
      active: sources.filter((s) => toStringBool(s.active)).length,
      totalPosts: sources.reduce((a, s) => a + Number(s.totalPosts ?? 0), 0),
      newPosts: sources.reduce((a, s) => a + Number(s.newPosts ?? 0), 0),
    };
  }, [sources]);

  // Stat Card Component
  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white rounded-lg p-3 transition-all hover:shadow-md" style={{ border: `1px solid ${BD}` }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: MU }}>{label}</p>
          <p className="text-xl font-bold mt-0.5" style={{ color: N }}>{value}</p>
        </div>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
    </div>
  );

  const Header = (
    <div className="bg-white rounded-xl  shadow-sm p-4" style={{ border: `1px solid ${BD}` }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold" style={{ color: N }}>RSS Source Management</h2>
          <p className="text-xs" style={{ color: MU }}>Manage and monitor RSS feeds for controlled content import</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => {
              setEditingSource(null);
              setShowAddForm(true);
            }}
            className="px-3 py-1.5 rounded-lg text-white text-xs font-medium flex items-center gap-1.5 transition-all hover:opacity-90"
            style={{ background: N }}
          >
            <Plus size={14} style={{ color: O }} />
            <span>Add Source</span>
          </button>
          <button
            onClick={handleScanAll}
            disabled={syncingAll || loading}
            className="px-3 py-1.5 rounded-lg text-white text-xs font-medium flex items-center gap-1.5 transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${O}, #f39c12)` }}
          >
            <RefreshCw size={14} className={syncingAll ? 'animate-spin' : ''} />
            <span>{syncingAll ? 'Scanning...' : 'Scan All'}</span>
          </button>
        </div>
      </div>

      {/* Compact Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatCard icon={Globe} label="Total Sources" value={totals.sources} color="#3b82f6" />
        <StatCard icon={CheckCircle} label="Active Sources" value={totals.active} color="#10b981" />
        <StatCard icon={BookOpen} label="Total Posts" value={totals.totalPosts} color="#8b5cf6" />
        <StatCard icon={Radio} label="Pending Import" value={totals.newPosts} color={O} />
      </div>
    </div>
  );

  const Grid = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {(loading ? [] : sources).map((source) => (
        <RSSSourceCard
          key={source.id}
          source={source}
          isLoading={syncingSourceId === source.id}
          onSync={() => handleScanSingle(source.id)}
          onImport={() => handleImportSingle(source.id)}
          onToggle={() => handleToggleSource(source.id)}
          onEdit={() => handleEditSource(source)}
          onDelete={() => handleDeleteSource(source.id)}
        />
      ))}
    </div>
  );

  const EmptyState = !loading && sources.length === 0 ? (
    <div className="text-center py-4">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: `${O}10` }}>
        <Globe size={32} style={{ color: O }} />
      </div>
      <h3 className="text-base font-bold mb-1" style={{ color: N }}>No RSS Sources Found</h3>
      <p className="text-xs mb-4" style={{ color: MU }}>Add RSS sources to scan and import articles as drafts</p>
      <button
        onClick={() => {
          setEditingSource(null);
          setShowAddForm(true);
        }}
        className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90"
        style={{ background: N }}
      >
        Add Your First Source
      </button>
    </div>
  ) : null;

  const AdvancedSection = (
    <div className="rounded-xl p-4" style={{ background: `linear-gradient(135deg, ${N}08, ${O}08)`, border: `1px solid ${BD}` }}>
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: N }}>
        <Bot size={16} style={{ color: O }} />
        <span>Advanced RSS Features</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg p-3 transition-all hover:shadow-sm" style={{ border: `1px solid ${BD}` }}>
          <div className="flex items-center gap-2 mb-1.5">
            <Shield size={14} style={{ color: "#3b82f6" }} />
            <span className="text-xs font-medium" style={{ color: N }}>Plagiarism Check</span>
          </div>
          <p className="text-[10px]" style={{ color: MU }}>AI automatically checks and rewrites content to ensure 95%+ originality</p>
        </div>

        <div className="bg-white rounded-lg p-3 transition-all hover:shadow-sm" style={{ border: `1px solid ${BD}` }}>
          <div className="flex items-center gap-2 mb-1.5">
            <Zap size={14} style={{ color: "#10b981" }} />
            <span className="text-xs font-medium" style={{ color: N }}>Smart Formatting</span>
          </div>
          <p className="text-[10px]" style={{ color: MU }}>Auto-generates table of contents, proper headings, and formatting</p>
        </div>

        <div className="bg-white rounded-lg p-3 transition-all hover:shadow-sm" style={{ border: `1px solid ${BD}` }}>
          <div className="flex items-center gap-2 mb-1.5">
            <TrendingUp size={14} style={{ color: "#8b5cf6" }} />
            <span className="text-xs font-medium" style={{ color: N }}>SEO Optimization</span>
          </div>
          <p className="text-[10px]" style={{ color: MU }}>Automatically optimizes content with meta tags and keywords</p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => (
    <div className="space-y-4">
      {Header}
      {Grid}
      {EmptyState}
      {AdvancedSection}

      <RSSSourceFormModal
        open={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setEditingSource(null);
          setForm({
            name: '',
            url: '',
            category: 'Property News',
            description: '',
            active: true,
            autoPublish: false,
            syncFrequency: 'daily',
            contentFilter: 'keywords',
            keywords: [],
          });
        }}
        form={form}
        setForm={setForm}
        editingSource={editingSource}
        onSubmit={editingSource ? handleUpdateSource : handleAddSource}
        categories={categories}
        predefinedSources={predefinedSources}
        onAddPredefined={handleAddPredefined}
      />
    </div>
  );

  if (isOpen !== undefined && !isOpen) return null;

  return isOpen !== undefined ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[88vh] overflow-y-auto" style={{ border: `1px solid ${BD}` }}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 border-b" style={{ background: BG, borderColor: BD }}>
          <h2 className="text-sm font-bold" style={{ color: N }}>RSS Source Management</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition-colors">
            <X size={16} style={{ color: MU }} />
          </button>
        </div>
        <div className="p-4">
          {renderContent()}
        </div>
      </div>
    </div>
  ) : (
    <div className="p-2" style={{ background: BG }}>
      {renderContent()}
    </div>
  );
};

export default RSSSourceManager;