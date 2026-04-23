// // src/components/campaigns/CampaignForm.tsx
// import { useState, useEffect } from 'react';
// import { X, Users, Calendar } from 'lucide-react';
// import type { Template, Tag, Campaign, CampaignFilters, ContactStage } from '../../types';
// import { MOCK_TEMPLATES, MOCK_TAGS, MOCK_CONTACTS } from '../../lib/mockData';

// const STAGES: ContactStage[] = ['New', 'Contacted', 'Qualified', 'Site Visit', 'Closed', 'Lost'];
// const PROPERTY_TYPES = ['Apartment', 'Villa', 'Plot', 'Commercial', 'Office', 'Shop', 'Warehouse'];

// interface Props {
//     onSubmit: (data: Partial<Campaign>) => Promise<void>;
//     onClose: () => void;
// }

// export default function CampaignForm({ onSubmit, onClose }: Props) {
//     const [name, setName] = useState('');
//     const [templateId, setTemplateId] = useState('');
//     const [filters, setFilters] = useState<CampaignFilters>({});
//     const [scheduleAt, setScheduleAt] = useState('');
//     const [templates, setTemplates] = useState<Template[]>([]);
//     const [tags, setTags] = useState<Tag[]>([]);
//     const [matchCount, setMatchCount] = useState<number | null>(null);
//     const [saving, setSaving] = useState(false);

//     // Load mock data on mount
//     useEffect(() => {
//         // Simulate API delay
//         const loadData = async () => {
//             await new Promise(resolve => setTimeout(resolve, 200));
//             setTemplates(MOCK_TEMPLATES.filter(t => t.status === 'APPROVED'));
//             setTags(MOCK_TAGS);
//         };
//         loadData();
//     }, []);

//     // Estimate contacts based on filters using mock contacts
//     const estimateContacts = async () => {
//         await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call

//         let filtered = [...MOCK_CONTACTS];

//         if (filters.stage && filters.stage.length > 0) {
//             filtered = filtered.filter(c => filters.stage!.includes(c.stage as ContactStage));
//         }
//         if (filters.location) {
//             const loc = filters.location.toLowerCase();
//             filtered = filtered.filter(c => c.preferred_location?.toLowerCase().includes(loc));
//         }
//         if (filters.budget_min) {
//             filtered = filtered.filter(c => (c.budget_max || 0) >= filters.budget_min!);
//         }
//         if (filters.budget_max) {
//             filtered = filtered.filter(c => (c.budget_min || 0) <= filters.budget_max!);
//         }
//         if (filters.property_type) {
//             filtered = filtered.filter(c => c.property_type === filters.property_type);
//         }
//         if (filters.tags && filters.tags.length > 0) {
//             filtered = filtered.filter(c =>
//                 filters.tags!.every(tagId => c.tags?.some(t => t.id === tagId))
//             );
//         }

//         setMatchCount(filtered.length);
//     };

//     const toggleStage = (s: ContactStage) => {
//         setFilters((p) => ({
//             ...p,
//             stage: p.stage?.includes(s) ? p.stage.filter((x) => x !== s) : [...(p.stage || []), s],
//         }));
//         setMatchCount(null);
//     };

//     const toggleTag = (id: string) => {
//         setFilters((p) => ({
//             ...p,
//             tags: p.tags?.includes(id) ? p.tags.filter((x) => x !== id) : [...(p.tags || []), id],
//         }));
//         setMatchCount(null);
//     };

//     const handleSubmit = async () => {
//         if (!name.trim() || !templateId) return;
//         setSaving(true);
//         await onSubmit({
//             name: name.trim(),
//             template_id: templateId,
//             filters,
//             status: scheduleAt ? 'scheduled' : 'draft',
//             scheduled_at: scheduleAt || null,
//             total_contacts: matchCount || 0,
//         });
//         setSaving(false);
//     };

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
//             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
//                 <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
//                     <h2 className="font-bold text-gray-900">Create Campaign</h2>
//                     <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
//                         <X size={18} />
//                     </button>
//                 </div>

//                 <div className="p-6 space-y-5">
//                     <div>
//                         <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Campaign Name *</label>
//                         <input
//                             className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                             value={name}
//                             onChange={(e) => setName(e.target.value)}
//                             placeholder="e.g. Wakad Property Blast - June"
//                         />
//                     </div>

//                     <div>
//                         <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Template *</label>
//                         {templates.length === 0 ? (
//                             <p className="text-sm text-red-500">No approved templates. Please approve a template first.</p>
//                         ) : (
//                             <select
//                                 value={templateId}
//                                 onChange={(e) => setTemplateId(e.target.value)}
//                                 className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                             >
//                                 <option value="">Select template…</option>
//                                 {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
//                             </select>
//                         )}
//                         {templateId && (
//                             <div className="mt-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
//                                 <p className="text-xs text-gray-600 whitespace-pre-wrap">
//                                     {templates.find((t) => t.id === templateId)?.body}
//                                 </p>
//                             </div>
//                         )}
//                     </div>

//                     <div>
//                         <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Audience Filters</p>

//                         <div className="space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
//                             <div>
//                                 <p className="text-xs text-gray-500 mb-1.5">Stage</p>
//                                 <div className="flex flex-wrap gap-1.5">
//                                     {STAGES.map((s) => (
//                                         <button
//                                             key={s}
//                                             onClick={() => toggleStage(s)}
//                                             className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${filters.stage?.includes(s) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200'
//                                                 }`}
//                                         >
//                                             {s}
//                                         </button>
//                                     ))}
//                                 </div>
//                             </div>

//                             <div>
//                                 <p className="text-xs text-gray-500 mb-1.5">Tags</p>
//                                 <div className="flex flex-wrap gap-1.5">
//                                     {tags.map((t) => (
//                                         <button
//                                             key={t.id}
//                                             onClick={() => toggleTag(t.id)}
//                                             className="text-xs px-2.5 py-1 rounded-full font-medium transition-opacity border"
//                                             style={{
//                                                 backgroundColor: filters.tags?.includes(t.id) ? t.color : t.color + '15',
//                                                 color: filters.tags?.includes(t.id) ? '#fff' : t.color,
//                                                 borderColor: t.color,
//                                             }}
//                                         >
//                                             {t.name}
//                                         </button>
//                                     ))}
//                                 </div>
//                             </div>

//                             <div className="grid grid-cols-2 gap-3">
//                                 <div>
//                                     <p className="text-xs text-gray-500 mb-1">Location contains</p>
//                                     <input
//                                         className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
//                                         value={filters.location || ''}
//                                         onChange={(e) => { setFilters((p) => ({ ...p, location: e.target.value })); setMatchCount(null); }}
//                                         placeholder="e.g. Wakad"
//                                     />
//                                 </div>
//                                 <div>
//                                     <p className="text-xs text-gray-500 mb-1">Property Type</p>
//                                     <select
//                                         value={filters.property_type || ''}
//                                         onChange={(e) => { setFilters((p) => ({ ...p, property_type: e.target.value })); setMatchCount(null); }}
//                                         className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
//                                     >
//                                         <option value="">Any type</option>
//                                         {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
//                                     </select>
//                                 </div>
//                             </div>

//                             <button
//                                 onClick={estimateContacts}
//                                 className="flex items-center gap-2 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
//                             >
//                                 <Users size={13} />
//                                 {matchCount !== null ? `${matchCount} contacts matched` : 'Estimate audience'}
//                             </button>
//                         </div>
//                     </div>

//                     <div>
//                         <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
//                             Schedule (optional)
//                         </label>
//                         <div className="flex items-center gap-2">
//                             <Calendar size={16} className="text-gray-400 shrink-0" />
//                             <input
//                                 type="datetime-local"
//                                 value={scheduleAt}
//                                 onChange={(e) => setScheduleAt(e.target.value)}
//                                 className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                             />
//                         </div>
//                         <p className="text-xs text-gray-400 mt-1">Leave blank to save as draft and launch manually</p>
//                     </div>
//                 </div>

//                 <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
//                     <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">
//                         Cancel
//                     </button>
//                     <button
//                         onClick={handleSubmit}
//                         disabled={saving || !name.trim() || !templateId}
//                         className="px-6 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50"
//                     >
//                         {saving ? 'Saving…' : scheduleAt ? 'Schedule Campaign' : 'Save as Draft'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }

// src/components/campaigns/CampaignForm.tsx
import { useState, useEffect } from 'react';
import { X, Users, Calendar } from 'lucide-react';
import { whatsappAPI } from '../../lib/whatsappApi';
import type { Template, CampaignFilters, ContactStage } from '../../types';

const STAGES: ContactStage[] = ['New', 'Contacted', 'Qualified', 'Site Visit', 'Closed', 'Lost'];
const PROPERTY_TYPES = ['Apartment', 'Villa', 'Plot', 'Commercial', 'Office', 'Shop', 'Warehouse'];

interface Props {
    onSubmit: (data: any) => Promise<void>;
    onClose: () => void;
}

export default function CampaignForm({ onSubmit, onClose }: Props) {
    const [name, setName] = useState('');
    const [templateId, setTemplateId] = useState('');
    const [filters, setFilters] = useState<CampaignFilters>({});
    const [scheduleAt, setScheduleAt] = useState('');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [matchCount, setMatchCount] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);

    // Load approved templates from API
    useEffect(() => {
        const loadTemplates = async () => {
            try {
                const allTemplates = await whatsappAPI.getTemplates();
                const approved: any = allTemplates.filter(t => t.status === 'APPROVED');
                setTemplates(approved);
            } catch (err) {
                console.error('Failed to load templates', err);
            }
        };
        loadTemplates();
    }, []);

    const estimateContacts = async () => {
        // For now, just set a mock count
        // In production, call an API endpoint that counts contacts based on filters
        setMatchCount(Math.floor(Math.random() * 500) + 50);
    };

    const toggleStage = (s: ContactStage) => {
        setFilters((p) => ({
            ...p,
            stage: p.stage?.includes(s) ? p.stage.filter((x) => x !== s) : [...(p.stage || []), s],
        }));
        setMatchCount(null);
    };

    const handleSubmit = async () => {
        if (!name.trim() || !templateId) return;
        setSaving(true);
        await onSubmit({
            name: name.trim(),
            template_id: parseInt(templateId),
            filters,
            status: scheduleAt ? 'scheduled' : 'draft',
            scheduled_at: scheduleAt || null,
            total_contacts: matchCount || 0,
        });
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="font-bold text-gray-900">Create Campaign</h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                        <X size={18} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="p-6 space-y-5">
                    {/* Campaign Name */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Campaign Name *</label>
                        <input
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Wakad Property Blast - June"
                        />
                    </div>

                    {/* Template Selection */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Template *</label>
                        {templates.length === 0 ? (
                            <p className="text-sm text-red-500">No approved templates. Please approve a template first.</p>
                        ) : (
                            <select
                                value={templateId}
                                onChange={(e) => setTemplateId(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">Select template…</option>
                                {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        )}
                        {templateId && (
                            <div className="mt-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <p className="text-xs text-gray-600 whitespace-pre-wrap">
                                    {templates.find((t: any) => t.id === parseInt(templateId))?.body}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Audience Filters */}
                    <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Audience Filters</p>
                        <div className="space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                            {/* Stage Filter */}
                            <div>
                                <p className="text-xs text-gray-500 mb-1.5">Stage</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {STAGES.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => toggleStage(s)}
                                            className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors ${filters.stage?.includes(s) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Location Filter */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Location contains</p>
                                    <input
                                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                        value={filters.location || ''}
                                        onChange={(e) => { setFilters((p) => ({ ...p, location: e.target.value })); setMatchCount(null); }}
                                        placeholder="e.g. Wakad"
                                    />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Property Type</p>
                                    <select
                                        value={filters.property_type || ''}
                                        onChange={(e) => { setFilters((p) => ({ ...p, property_type: e.target.value })); setMatchCount(null); }}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                    >
                                        <option value="">Any type</option>
                                        {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Estimate Button */}
                            <button
                                onClick={estimateContacts}
                                className="flex items-center gap-2 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                            >
                                <Users size={13} />
                                {matchCount !== null ? `${matchCount} contacts matched` : 'Estimate audience'}
                            </button>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Schedule (optional)</label>
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-400 shrink-0" />
                            <input
                                type="datetime-local"
                                value={scheduleAt}
                                onChange={(e) => setScheduleAt(e.target.value)}
                                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Leave blank to save as draft and launch manually</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving || !name.trim() || !templateId}
                        className="px-6 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {saving ? 'Saving…' : scheduleAt ? 'Schedule Campaign' : 'Save as Draft'}
                    </button>
                </div>
            </div>
        </div>
    );
}