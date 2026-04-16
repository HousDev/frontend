// import React from 'react';
// import { X, Globe, Shield, Zap, TrendingUp } from 'lucide-react';

// type RSSSyncFrequency = 'hourly' | 'daily' | 'weekly' | 'manual';
// type RSSContentFilter = 'keywords' | 'all';

// type PredefinedItem = {
//     name: string;
//     url: string;
//     category: string;
//     description?: string | null;
// };

// type FormShape = {
//     name?: string;
//     url?: string;
//     category?: string;
//     description?: string | null;
//     active?: boolean | 0 | 1;
//     autoPublish?: boolean | 0 | 1;
//     syncFrequency?: RSSSyncFrequency;
//     contentFilter?: RSSContentFilter;
//     keywords?: string[];
// };

// interface RSSSourceFormModalProps {
//     open: boolean;
//     onClose: () => void;

//     /** Pass through your existing state & handlers from Manager */
//     form: FormShape;
//     setForm: React.Dispatch<React.SetStateAction<FormShape>>;
//     editingSource: any | null; // keep generic to avoid coupling
//     onSubmit: () => void;

//     categories: string[];
//     predefinedSources: PredefinedItem[];
//     onAddPredefined: (item: PredefinedItem) => void | Promise<void>;
// }

// const RSSSourceFormModal: React.FC<RSSSourceFormModalProps> = ({
//     open,
//     onClose,
//     form,
//     setForm,
//     editingSource,
//     onSubmit,
//     categories,
//     predefinedSources,
//     onAddPredefined,
// }) => {
//     if (!open) return null;

//     return (
//         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
//             {/* overlay */}
//             <div
//                 className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
//                 onClick={onClose}
//                 aria-hidden
//             />

//             {/* modal */}
//             <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
//                 {/* header */}
//                 <div className="sticky top-0 z-10 bg-white/90 backdrop-blur px-6 py-4 border-b border-gray-200 flex items-center justify-between">
//                     <h3 className="text-xl font-bold text-gray-900">
//                         {editingSource ? 'Edit RSS Source' : 'Add New RSS Source'}
//                     </h3>
//                     <button
//                         onClick={onClose}
//                         className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
//                         aria-label="Close modal"
//                     >
//                         <X size={20} />
//                     </button>
//                 </div>

//                 {/* body */}
//                 <div className="p-6 space-y-6">
//                     {/* Quick add */}
//                     {!editingSource && (
//                         <div>
//                             <h4 className="font-semibold text-gray-900 mb-3">Quick Add Popular Sources</h4>
//                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                                 {predefinedSources.map((source, idx) => (
//                                     <button
//                                         key={idx}
//                                         onClick={() => onAddPredefined(source)}
//                                         className="group p-4 border border-gray-200 rounded-lg text-left hover:border-blue-300 hover:bg-blue-50 transition-all"
//                                     >
//                                         <div className="flex items-start gap-3">
//                                             <div className="p-2 bg-blue-100 rounded-lg">
//                                                 <Globe className="text-blue-600" size={16} />
//                                             </div>
//                                             <div>
//                                                 <h5 className="font-medium text-gray-900 group-hover:text-blue-700">
//                                                     {source.name}
//                                                 </h5>
//                                                 <p className="text-sm text-gray-600 mb-1">{source.description}</p>
//                                                 <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
//                                                     {source.category}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                     </button>
//                                 ))}
//                             </div>

//                             <div className="relative my-6">
//                                 <div className="absolute inset-0 flex items-center">
//                                     <div className="w-full border-t border-gray-300" />
//                                 </div>
//                                 <div className="relative flex justify-center text-sm">
//                                     <span className="px-2 bg-white text-gray-500">Or add custom source</span>
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     {/* Form */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">Source Name *</label>
//                             <input
//                                 type="text"
//                                 value={form.name ?? ''}
//                                 onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
//                                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                                 placeholder="Economic Times Real Estate"
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">RSS Feed URL *</label>
//                             <input
//                                 type="url"
//                                 value={form.url ?? ''}
//                                 onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
//                                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                                 placeholder="https://example.com/rss"
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
//                             <select
//                                 value={form.category ?? 'Property News'}
//                                 onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
//                                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                             >
//                                 {categories.map((c) => (
//                                     <option key={c} value={c}>
//                                         {c}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">Sync Frequency</label>
//                             <select
//                                 value={(form.syncFrequency as RSSSyncFrequency) ?? 'daily'}
//                                 onChange={(e) =>
//                                     setForm((p) => ({ ...p, syncFrequency: e.target.value as RSSSyncFrequency }))
//                                 }
//                                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                             >
//                                 <option value="hourly">Every Hour</option>
//                                 <option value="daily">Daily</option>
//                                 <option value="weekly">Weekly</option>
//                                 <option value="manual">Manual Only</option>
//                             </select>
//                         </div>
//                     </div>

//                     <div className="space-y-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Content Keywords (for filtering)
//                             </label>
//                             <input
//                                 type="text"
//                                 placeholder="real estate, property, investment (comma separated)"
//                                 value={(form.keywords ?? []).join(', ')}
//                                 onChange={(e) =>
//                                     setForm((p) => ({
//                                         ...p,
//                                         keywords: e.target.value
//                                             .split(',')
//                                             .map((k) => k.trim())
//                                             .filter(Boolean),
//                                     }))
//                                 }
//                                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                             />
//                             <p className="text-xs text-gray-500 mt-1">
//                                 Only content containing these keywords will be imported (unless filter is set to “all”)
//                             </p>
//                         </div>

//                         <div className="flex flex-wrap items-center gap-6">
//                             <label className="flex items-center">
//                                 <input
//                                     type="checkbox"
//                                     checked={!!form.active}
//                                     onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
//                                     className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                                 />
//                                 <span className="ml-2 text-sm text-gray-700">Active</span>
//                             </label>

//                             <label className="flex items-center">
//                                 <input
//                                     type="checkbox"
//                                     checked={!!form.autoPublish}
//                                     onChange={(e) => setForm((p) => ({ ...p, autoPublish: e.target.checked }))}
//                                     className="rounded border-gray-300 text-green-600 focus:ring-green-500"
//                                 />
//                                 <span className="ml-2 text-sm text-gray-700">Auto Publish</span>
//                             </label>

//                             <label className="flex items-center">
//                                 <input
//                                     type="checkbox"
//                                     checked={(form.contentFilter ?? 'keywords') !== 'all'}
//                                     onChange={(e) =>
//                                         setForm((p) => ({
//                                             ...p,
//                                             contentFilter: e.target.checked ? 'keywords' : 'all',
//                                         }))
//                                     }
//                                     className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
//                                 />
//                                 <span className="ml-2 text-sm text-gray-700">Use Keyword Filter</span>
//                             </label>
//                         </div>
//                     </div>

//                     {/* tiny “features” footer for nice feel on mobile */}
//                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
//                         <div className="bg-white rounded-lg p-3 border">
//                             <div className="flex items-center gap-2">
//                                 <Shield className="text-blue-600" size={16} />
//                                 <span className="text-sm font-medium text-gray-900">Plagiarism Check</span>
//                             </div>
//                             <p className="text-xs text-gray-600 mt-1">
//                                 AI ensures 95%+ originality score
//                             </p>
//                         </div>
//                         <div className="bg-white rounded-lg p-3 border">
//                             <div className="flex items-center gap-2">
//                                 <Zap className="text-green-600" size={16} />
//                                 <span className="text-sm font-medium text-gray-900">Smart Formatting</span>
//                             </div>
//                             <p className="text-xs text-gray-600 mt-1">
//                                 Auto TOC, headings & structure
//                             </p>
//                         </div>
//                         <div className="bg-white rounded-lg p-3 border">
//                             <div className="flex items-center gap-2">
//                                 <TrendingUp className="text-purple-600" size={16} />
//                                 <span className="text-sm font-medium text-gray-900">SEO Optimization</span>
//                             </div>
//                             <p className="text-xs text-gray-600 mt-1">
//                                 Meta tags & keyword tuning
//                             </p>
//                         </div>
//                     </div>
//                 </div>

//                 {/* footer */}
//                 <div className="sticky bottom-0 z-10 bg-white/90 backdrop-blur px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
//                     <button
//                         onClick={onClose}
//                         className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         onClick={onSubmit}
//                         className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                     >
//                         {editingSource ? 'Update Source' : 'Add Source'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default RSSSourceFormModal;

// import React from 'react';
// import { X, Globe, Shield, Zap, TrendingUp, Rss, Check, Clock, Filter } from 'lucide-react';

// type RSSSyncFrequency = 'hourly' | 'daily' | 'weekly' | 'manual';
// type RSSContentFilter = 'keywords' | 'all';

// type PredefinedItem = {
//     name: string;
//     url: string;
//     category: string;
//     description?: string | null;
// };

// type FormShape = {
//     name?: string;
//     url?: string;
//     category?: string;
//     description?: string | null;
//     active?: boolean | 0 | 1;
//     autoPublish?: boolean | 0 | 1;
//     syncFrequency?: RSSSyncFrequency;
//     contentFilter?: RSSContentFilter;
//     keywords?: string[];
// };

// interface RSSSourceFormModalProps {
//     open: boolean;
//     onClose: () => void;
//     form: FormShape;
//     setForm: React.Dispatch<React.SetStateAction<FormShape>>;
//     editingSource: any | null;
//     onSubmit: () => void;
//     categories: string[];
//     predefinedSources: PredefinedItem[];
//     onAddPredefined: (item: PredefinedItem) => void | Promise<void>;
// }

// const RSSSourceFormModal: React.FC<RSSSourceFormModalProps> = ({
//     open,
//     onClose,
//     form,
//     setForm,
//     editingSource,
//     onSubmit,
//     categories,
//     predefinedSources,
//     onAddPredefined,
// }) => {
//     if (!open) return null;

//     return (
//         <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4">
//             {/* Overlay with blur */}
//             <div
//                 className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm"
//                 onClick={onClose}
//                 aria-hidden
//             />

//             {/* Modal */}
//             <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden border border-gray-100">
//                 {/* Header with gradient */}
//                 <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                         <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
//                             <Rss className="text-white" size={20} />
//                         </div>
//                         <div>
//                             <h3 className="text-lg sm:text-xl font-bold text-white">
//                                 {editingSource ? 'Edit RSS Source' : 'Add New RSS Source'}
//                             </h3>
//                             <p className="text-xs sm:text-sm text-white/90 hidden sm:block">
//                                 {editingSource ? 'Update source configuration' : 'Configure your RSS feed source'}
//                             </p>
//                         </div>
//                     </div>
//                     <button
//                         onClick={onClose}
//                         className="p-2 rounded-lg text-white hover:bg-white/20 transition-all duration-200 hover:scale-110"
//                         aria-label="Close modal"
//                     >
//                         <X size={20} />
//                     </button>
//                 </div>

//                 {/* Body with scroll */}
//                 <div className="overflow-y-auto max-h-[calc(92vh-180px)] p-4 sm:p-6">
//                     <div className="space-y-6">
//                         {/* Quick Add Section */}
//                         {!editingSource && predefinedSources.length > 0 && (
//                             <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 sm:p-5 border border-blue-100">
//                                 <div className="flex items-center gap-2 mb-4">
//                                     <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full" />
//                                     <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Quick Add Popular Sources</h4>
//                                 </div>
//                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                                     {predefinedSources.map((source, idx) => (
//                                         <button
//                                             key={idx}
//                                             onClick={() => onAddPredefined(source)}
//                                             className="group p-4 bg-white border-2 border-gray-200 rounded-xl text-left hover:border-blue-400 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
//                                         >
//                                             <div className="flex items-start gap-3">
//                                                 <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex-shrink-0 group-hover:scale-110 transition-transform">
//                                                     <Globe className="text-white" size={18} />
//                                                 </div>
//                                                 <div className="min-w-0 flex-1">
//                                                     <h5 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
//                                                         {source.name}
//                                                     </h5>
//                                                     <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
//                                                         {source.description}
//                                                     </p>
//                                                     <span className="inline-block text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-1 rounded-full font-medium">
//                                                         {source.category}
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                         </button>
//                                     ))}
//                                 </div>

//                                 <div className="relative my-6">
//                                     <div className="absolute inset-0 flex items-center">
//                                         <div className="w-full border-t-2 border-gray-300" />
//                                     </div>
//                                     <div className="relative flex justify-center text-sm">
//                                         <span className="px-4 bg-gradient-to-r from-blue-50 to-purple-50 text-gray-600 font-medium">
//                                             Or add custom source
//                                         </span>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Main Form Section */}
//                         <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 sm:p-5 border border-gray-200">
//                             <div className="flex items-center gap-2 mb-4">
//                                 <div className="w-1 h-6 bg-gradient-to-b from-gray-600 to-gray-800 rounded-full" />
//                                 <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Source Details</h4>
//                             </div>

//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Source Name <span className="text-red-500">*</span>
//                                     </label>
//                                     <input
//                                         type="text"
//                                         value={form.name ?? ''}
//                                         onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
//                                         className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
//                                         placeholder="Economic Times Real Estate"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         RSS Feed URL <span className="text-red-500">*</span>
//                                     </label>
//                                     <input
//                                         type="url"
//                                         value={form.url ?? ''}
//                                         onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
//                                         className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
//                                         placeholder="https://example.com/rss"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Category <span className="text-red-500">*</span>
//                                     </label>
//                                     <select
//                                         value={form.category ?? 'Property News'}
//                                         onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
//                                         className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
//                                     >
//                                         {categories.map((c) => (
//                                             <option key={c} value={c}>
//                                                 {c}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Sync & Filter Settings */}
//                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//                             {/* Sync Frequency */}
//                             <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4 sm:p-5 border border-green-100">
//                                 <div className="flex items-center gap-2 mb-4">
//                                     <Clock className="text-green-600" size={18} />
//                                     <h4 className="font-semibold text-gray-900 text-sm">Sync Frequency</h4>
//                                 </div>
//                                 <select
//                                     value={(form.syncFrequency as RSSSyncFrequency) ?? 'daily'}
//                                     onChange={(e) =>
//                                         setForm((p) => ({ ...p, syncFrequency: e.target.value as RSSSyncFrequency }))
//                                     }
//                                     className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
//                                 >
//                                     <option value="hourly">⚡ Every Hour</option>
//                                     <option value="daily">📅 Daily</option>
//                                     <option value="weekly">📆 Weekly</option>
//                                     <option value="manual">✋ Manual Only</option>
//                                 </select>
//                             </div>

//                             {/* Keywords Filter */}
//                             <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 sm:p-5 border border-purple-100">
//                                 <div className="flex items-center gap-2 mb-4">
//                                     <Filter className="text-purple-600" size={18} />
//                                     <h4 className="font-semibold text-gray-900 text-sm">Content Keywords</h4>
//                                 </div>
//                                 <input
//                                     type="text"
//                                     placeholder="real estate, property, investment"
//                                     value={(form.keywords ?? []).join(', ')}
//                                     onChange={(e) =>
//                                         setForm((p) => ({
//                                             ...p,
//                                             keywords: e.target.value
//                                                 .split(',')
//                                                 .map((k) => k.trim())
//                                                 .filter(Boolean),
//                                         }))
//                                     }
//                                     className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
//                                 />
//                                 <p className="text-xs text-gray-600 mt-2">
//                                     Filter content by keywords (comma separated)
//                                 </p>
//                             </div>
//                         </div>

//                         {/* Toggles Section */}
//                         <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4 sm:p-5 border border-orange-100">
//                             <div className="flex items-center gap-2 mb-4">
//                                 <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-yellow-500 rounded-full" />
//                                 <h4 className="font-semibold text-gray-900 text-sm">Settings</h4>
//                             </div>

//                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//                                 <label className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-400 transition-all cursor-pointer group">
//                                     <input
//                                         type="checkbox"
//                                         checked={!!form.active}
//                                         onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
//                                         className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
//                                     />
//                                     <div>
//                                         <span className="text-sm font-medium text-gray-900 group-hover:text-blue-700">Active</span>
//                                         <p className="text-xs text-gray-600">Enable source</p>
//                                     </div>
//                                 </label>

//                                 <label className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-green-400 transition-all cursor-pointer group">
//                                     <input
//                                         type="checkbox"
//                                         checked={!!form.autoPublish}
//                                         onChange={(e) => setForm((p) => ({ ...p, autoPublish: e.target.checked }))}
//                                         className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-5 h-5"
//                                     />
//                                     <div>
//                                         <span className="text-sm font-medium text-gray-900 group-hover:text-green-700">Auto Publish</span>
//                                         <p className="text-xs text-gray-600">Publish posts</p>
//                                     </div>
//                                 </label>

//                                 <label className="flex items-center gap-3 p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-purple-400 transition-all cursor-pointer group">
//                                     <input
//                                         type="checkbox"
//                                         checked={(form.contentFilter ?? 'keywords') !== 'all'}
//                                         onChange={(e) =>
//                                             setForm((p) => ({
//                                                 ...p,
//                                                 contentFilter: e.target.checked ? 'keywords' : 'all',
//                                             }))
//                                         }
//                                         className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-5 h-5"
//                                     />
//                                     <div>
//                                         <span className="text-sm font-medium text-gray-900 group-hover:text-purple-700">Keyword Filter</span>
//                                         <p className="text-xs text-gray-600">Filter content</p>
//                                     </div>
//                                 </label>
//                             </div>
//                         </div>

//                         {/* Features Grid */}
//                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//                             <div className="bg-white rounded-xl p-4 border-2 border-blue-100 hover:border-blue-300 transition-all group">
//                                 <div className="flex items-center gap-2 mb-2">
//                                     <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
//                                         <Shield className="text-blue-600" size={18} />
//                                     </div>
//                                     <span className="text-sm font-semibold text-gray-900">Plagiarism Check</span>
//                                 </div>
//                                 <p className="text-xs text-gray-600">
//                                     AI ensures 95%+ originality score
//                                 </p>
//                             </div>

//                             <div className="bg-white rounded-xl p-4 border-2 border-green-100 hover:border-green-300 transition-all group">
//                                 <div className="flex items-center gap-2 mb-2">
//                                     <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
//                                         <Zap className="text-green-600" size={18} />
//                                     </div>
//                                     <span className="text-sm font-semibold text-gray-900">Smart Formatting</span>
//                                 </div>
//                                 <p className="text-xs text-gray-600">
//                                     Auto TOC, headings & structure
//                                 </p>
//                             </div>

//                             <div className="bg-white rounded-xl p-4 border-2 border-purple-100 hover:border-purple-300 transition-all group">
//                                 <div className="flex items-center gap-2 mb-2">
//                                     <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
//                                         <TrendingUp className="text-purple-600" size={18} />
//                                     </div>
//                                     <span className="text-sm font-semibold text-gray-900">SEO Optimization</span>
//                                 </div>
//                                 <p className="text-xs text-gray-600">
//                                     Meta tags & keyword tuning
//                                 </p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Footer */}
//                 <div className="sticky bottom-0 z-10 bg-gradient-to-r from-gray-50 to-gray-100 backdrop-blur-sm px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-end gap-3">
//                     <button
//                         onClick={onClose}
//                         className="w-full sm:w-auto px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-white hover:border-gray-400 transition-all font-medium"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         onClick={onSubmit}
//                         className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
//                     >
//                         <Check size={18} />
//                         {editingSource ? 'Update Source' : 'Add Source'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default RSSSourceFormModal;

import React from 'react';
import { X, Globe, Shield, Zap, TrendingUp, Rss, Check, Clock, Filter, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

type RSSSyncFrequency = 'hourly' | 'daily' | 'weekly' | 'manual';
type RSSContentFilter = 'keywords' | 'all';

type PredefinedItem = {
    name: string;
    url: string;
    category: string;
    description?: string | null;
};

type FormShape = {
    name?: string;
    url?: string;
    category?: string;
    description?: string | null;
    active?: boolean | 0 | 1;
    autoPublish?: boolean | 0 | 1;
    syncFrequency?: RSSSyncFrequency;
    contentFilter?: RSSContentFilter;
    keywords?: string[];
};

interface RSSSourceFormModalProps {
    open: boolean;
    onClose: () => void;
    form: FormShape;
    setForm: React.Dispatch<React.SetStateAction<FormShape>>;
    editingSource: any | null;
    onSubmit: () => void;
    categories: string[];
    predefinedSources: PredefinedItem[];
    onAddPredefined: (item: PredefinedItem) => void | Promise<void>;
}

const scrollbarStyles:any = {
  scrollbarWidth: 'thin',
  scrollbarColor: `${BD} ${BG}`,
  WebkitOverflowScrolling: 'touch',
};

const RSSSourceFormModal: React.FC<RSSSourceFormModalProps> = ({
    open,
    onClose,
    form,
    setForm,
    editingSource,
    onSubmit,
    categories,
    predefinedSources,
    onAddPredefined,
}) => {
    if (!open) return null;

    const handleAddPredefined = async (source: PredefinedItem) => {
        try {
            await onAddPredefined(source);
            onClose(); // Close modal after successful addition
        } catch (error) {
            console.error('Error adding predefined source:', error);
            toast.error('Failed to add source');
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-2">
            {/* Overlay */}
            <div
                className="absolute inset-0"
                style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}
                onClick={onClose}
                aria-hidden
            />

            {/* Modal - max-w-4xl */}
            <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden" style={{ border: `1px solid ${BD}` }}>
                
                {/* Header */}
                <div className="sticky top-0 z-10 px-4 py-3.5 flex items-center justify-between" style={{ background: N }}>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded" style={{ background: `${O}20` }}>
                            <Rss size={14} style={{ color: O }} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white">
                                {editingSource ? 'Edit RSS Source' : 'Add RSS Source'}
                            </h3>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded hover:bg-white/10 transition-colors text-white"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto p-3 space-y-3" style={{ maxHeight: 'calc(85vh - 100px)', ...scrollbarStyles }}>
                    
                    {/* Quick Add Section - FIXED */}
                    {!editingSource && predefinedSources && predefinedSources.length > 0 && (
                        <div className="rounded-lg p-3" style={{ background: `${O}05`, border: `1px solid ${O}15` }}>
                            <div className="flex items-center gap-1.5 mb-2">
                                <Plus size={12} style={{ color: O }} />
                                <h4 className="text-xs font-semibold" style={{ color: N }}>Quick Add Popular Sources</h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {predefinedSources.map((source, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAddPredefined(source)}
                                        className="group p-2 bg-white rounded-lg text-left transition-all hover:shadow-sm"
                                        style={{ border: `1px solid ${BD}` }}
                                    >
                                        <div className="flex items-start gap-2">
                                            <div className="p-1 rounded flex-shrink-0" style={{ background: `${O}10` }}>
                                                <Globe size={12} style={{ color: O }} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h5 className="text-[11px] font-semibold truncate" style={{ color: N }}>{source.name}</h5>
                                                <p className="text-[9px] mb-1 line-clamp-1" style={{ color: MU }}>{source.description}</p>
                                                <span className="inline-block text-[8px] px-1.5 py-0.5 rounded" style={{ background: `${O}10`, color: O }}>
                                                    {source.category}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className="relative my-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t" style={{ borderColor: BD }} />
                                </div>
                                <div className="relative flex justify-center text-[10px]">
                                    <span className="px-2" style={{ background: BG, color: MU }}>Or add custom</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Form */}
                    <div className="rounded-lg p-3" style={{ background: BG, border: `1px solid ${BD}` }}>
                        <div className="flex items-center gap-1.5 mb-2">
                            <div className="w-1 h-4 rounded" style={{ background: O }} />
                            <h4 className="text-xs font-semibold" style={{ color: N }}>Source Details</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[10px] font-medium mb-0.5" style={{ color: N }}>Source Name *</label>
                                <input
                                    type="text"
                                    value={form.name ?? ''}
                                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                    className="w-full px-2 py-1.5 text-xs border rounded focus:outline-none focus:ring-1"
                                    style={{ borderColor: BD }}
                                    placeholder="Source name"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-medium mb-0.5" style={{ color: N }}>RSS Feed URL *</label>
                                <input
                                    type="url"
                                    value={form.url ?? ''}
                                    onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
                                    className="w-full px-2 py-1.5 text-xs border rounded focus:outline-none focus:ring-1"
                                    style={{ borderColor: BD }}
                                    placeholder="https://example.com/rss"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-medium mb-0.5" style={{ color: N }}>Category *</label>
                                <select
                                    value={form.category ?? 'Property News'}
                                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                                    className="w-full px-2 py-1.5 text-xs border rounded focus:outline-none focus:ring-1"
                                    style={{ borderColor: BD }}
                                >
                                    {categories.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-medium mb-0.5" style={{ color: N }}>Description</label>
                                <input
                                    type="text"
                                    value={form.description ?? ''}
                                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                                    className="w-full px-2 py-1.5 text-xs border rounded focus:outline-none focus:ring-1"
                                    style={{ borderColor: BD }}
                                    placeholder="Optional description"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sync & Filter */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="rounded-lg p-2" style={{ background: `${O}05`, border: `1px solid ${O}15` }}>
                            <div className="flex items-center gap-1 mb-1.5">
                                <Clock size={11} style={{ color: O }} />
                                <h4 className="text-[10px] font-semibold" style={{ color: N }}>Sync Frequency</h4>
                            </div>
                            <select
                                value={form.syncFrequency ?? 'daily'}
                                onChange={(e) => setForm((p) => ({ ...p, syncFrequency: e.target.value as RSSSyncFrequency }))}
                                className="w-full px-2 py-1 text-[10px] border rounded focus:outline-none focus:ring-1 bg-white"
                                style={{ borderColor: BD }}
                            >
                                <option value="hourly">Hourly</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="manual">Manual Only</option>
                            </select>
                        </div>

                        <div className="rounded-lg p-2" style={{ background: `${N}05`, border: `1px solid ${BD}` }}>
                            <div className="flex items-center gap-1 mb-1.5">
                                <Filter size={11} style={{ color: N }} />
                                <h4 className="text-[10px] font-semibold" style={{ color: N }}>Keywords</h4>
                            </div>
                            <input
                                type="text"
                                placeholder="real estate, property, investment"
                                value={(form.keywords ?? []).join(', ')}
                                onChange={(e) => setForm((p) => ({
                                    ...p,
                                    keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                                }))}
                                className="w-full px-2 py-1 text-[10px] border rounded focus:outline-none focus:ring-1 bg-white"
                                style={{ borderColor: BD }}
                            />
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="rounded-lg p-2" style={{ background: BG, border: `1px solid ${BD}` }}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <div className="w-1 h-4 rounded" style={{ background: O }} />
                            <h4 className="text-[10px] font-semibold" style={{ color: N }}>Settings</h4>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <label className="flex items-center gap-1.5 p-1.5 rounded cursor-pointer" style={{ background: `${N}05` }}>
                                <input type="checkbox" checked={!!form.active} onChange={(e) => setForm(p => ({ ...p, active: e.target.checked }))} className="rounded w-3 h-3" style={{ accentColor: O }} />
                                <span className="text-[9px]" style={{ color: N }}>Active</span>
                            </label>
                            <label className="flex items-center gap-1.5 p-1.5 rounded cursor-pointer" style={{ background: `${O}05` }}>
                                <input type="checkbox" checked={!!form.autoPublish} onChange={(e) => setForm(p => ({ ...p, autoPublish: e.target.checked }))} className="rounded w-3 h-3" style={{ accentColor: O }} />
                                <span className="text-[9px]" style={{ color: N }}>Auto Publish</span>
                            </label>
                            <label className="flex items-center gap-1.5 p-1.5 rounded cursor-pointer" style={{ background: `${N}05` }}>
                                <input type="checkbox" checked={(form.contentFilter ?? 'keywords') !== 'all'} onChange={(e) => setForm(p => ({ ...p, contentFilter: e.target.checked ? 'keywords' : 'all' }))} className="rounded w-3 h-3" style={{ accentColor: O }} />
                                <span className="text-[9px]" style={{ color: N }}>Filter</span>
                            </label>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 rounded" style={{ background: `${N}05`, border: `1px solid ${BD}` }}>
                            <Shield size={12} style={{ color: O }} className="mx-auto mb-0.5" />
                            <p className="text-[8px]" style={{ color: MU }}>Plagiarism</p>
                            <p className="text-[7px]" style={{ color: MU }}>95%+ original</p>
                        </div>
                        <div className="text-center p-2 rounded" style={{ background: `${N}05`, border: `1px solid ${BD}` }}>
                            <Zap size={12} style={{ color: O }} className="mx-auto mb-0.5" />
                            <p className="text-[8px]" style={{ color: MU }}>Formatting</p>
                            <p className="text-[7px]" style={{ color: MU }}>Auto TOC</p>
                        </div>
                        <div className="text-center p-2 rounded" style={{ background: `${N}05`, border: `1px solid ${BD}` }}>
                            <TrendingUp size={12} style={{ color: O }} className="mx-auto mb-0.5" />
                            <p className="text-[8px]" style={{ color: MU }}>SEO</p>
                            <p className="text-[7px]" style={{ color: MU }}>Optimized</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 px-3 py-2 border-t flex items-center justify-end gap-2" style={{ borderColor: BD, background: BG }}>
                    <button
                        onClick={onClose}
                        className="px-3 py-1 text-[11px] border rounded transition-colors hover:bg-gray-50"
                        style={{ borderColor: BD, color: N }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        className="px-3 py-1 text-[11px] rounded text-white flex items-center gap-1 transition-all hover:opacity-90"
                        style={{ background: N }}
                    >
                        <Check size={10} />
                        {editingSource ? 'Update' : 'Add'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RSSSourceFormModal;