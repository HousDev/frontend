// import { useState, useEffect, useCallback } from 'react';
// import {
//     Plus, Bot, Trash2, CreditCard as Edit2, ToggleLeft, ToggleRight, Zap,
//     Save, X, ChevronDown, ChevronUp, ArrowRight, MessageSquare, HelpCircle,
//     List, Tag as TagIcon, UserCheck, TrendingUp, FileText, CheckCircle,
//     Hash, Play, Pause, Eye,
// } from 'lucide-react';
// import type { ChatbotFlow, FlowStep, FlowStepType, Template, Tag, CrmUser } from '../../types';
// import { MOCK_FLOWS, MOCK_TAGS, MOCK_TEMPLATES, MOCK_USERS } from '../../lib/mockData';
// import { notificationStore } from '../../lib/notifications';

// // In‑memory store for flows (mutable)
// let flowsStore: ChatbotFlow[] = JSON.parse(JSON.stringify(MOCK_FLOWS));
// let stepsStore: Record<string, FlowStep[]> = {};

// // Initialize steps from flows
// MOCK_FLOWS.forEach(flow => {
//     if (flow.steps) stepsStore[flow.id] = JSON.parse(JSON.stringify(flow.steps));
// });

// const STEP_TYPE_CONFIG: Record<FlowStepType, { label: string; icon: React.ElementType; color: string; description: string }> = {
//     message: { label: 'Send Message', icon: MessageSquare, color: 'bg-blue-100 text-blue-700', description: 'Send a text message to the contact' },
//     question: { label: 'Ask Question', icon: HelpCircle, color: 'bg-amber-100 text-amber-700', description: 'Ask a question and save the response' },
//     buttons: { label: 'Button Choices', icon: List, color: 'bg-emerald-100 text-emerald-700', description: 'Show clickable button options (max 3)' },
//     tag: { label: 'Apply Tag', icon: TagIcon, color: 'bg-pink-100 text-pink-700', description: 'Automatically tag the contact' },
//     assign: { label: 'Assign Agent', icon: UserCheck, color: 'bg-sky-100 text-sky-700', description: 'Assign the conversation to a team member' },
//     stage: { label: 'Update Stage', icon: TrendingUp, color: 'bg-orange-100 text-orange-700', description: 'Move contact to a pipeline stage' },
//     template: { label: 'Send Template', icon: FileText, color: 'bg-violet-100 text-violet-700', description: 'Send an approved WhatsApp template' },
//     condition: { label: 'Condition', icon: Hash, color: 'bg-gray-100 text-gray-700', description: 'Branch based on keyword matching' },
//     end: { label: 'End Flow', icon: CheckCircle, color: 'bg-red-100 text-red-700', description: 'End the automation sequence' },
// };

// const CONTACT_STAGES = ['New', 'Contacted', 'Qualified', 'Site Visit', 'Closed', 'Lost'];
// const SAVE_RESPONSE_OPTIONS = [
//     { value: 'name', label: 'Contact Name' },
//     { value: 'email', label: 'Email Address' },
//     { value: 'location', label: 'Preferred Location' },
//     { value: 'budget', label: 'Budget (saved to notes)' },
//     { value: 'notes', label: 'General Notes' },
// ];

// export default function ChatbotPage() {
//     const [flows, setFlows] = useState<ChatbotFlow[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [editingFlow, setEditingFlow] = useState<ChatbotFlow | null>(null);
//     const [showBuilder, setShowBuilder] = useState(false);
//     const [previewFlow, setPreviewFlow] = useState<ChatbotFlow | null>(null);

//     const fetchFlows = useCallback(async () => {
//         setLoading(true);
//         await new Promise(resolve => setTimeout(resolve, 300));
//         setFlows([...flowsStore]);
//         setLoading(false);
//     }, []);

//     useEffect(() => { fetchFlows(); }, [fetchFlows]);

//     const handleToggleActive = async (flow: ChatbotFlow) => {
//         await new Promise(resolve => setTimeout(resolve, 200));
//         const index = flowsStore.findIndex(f => f.id === flow.id);
//         if (index !== -1) {
//             flowsStore[index] = { ...flowsStore[index], is_active: !flow.is_active };
//             setFlows([...flowsStore]);
//         }
//     };

//     const handleDelete = async (id: string) => {
//         if (!confirm('Delete this flow? This cannot be undone.')) return;
//         await new Promise(resolve => setTimeout(resolve, 300));
//         flowsStore = flowsStore.filter(f => f.id !== id);
//         delete stepsStore[id];
//         setFlows([...flowsStore]);
//     };

//     const handleEdit = async (flow: ChatbotFlow) => {
//         const steps = stepsStore[flow.id] || [];
//         setEditingFlow({ ...flow, steps });
//         setShowBuilder(true);
//     };

//     const handleCreate = () => {
//         setEditingFlow(null);
//         setShowBuilder(true);
//     };

//     const handleSaved = () => {
//         setShowBuilder(false);
//         setEditingFlow(null);
//         fetchFlows();
//     };

//     const handlePreview = async (flow: ChatbotFlow) => {
//         const steps = stepsStore[flow.id] || [];
//         setPreviewFlow({ ...flow, steps });
//     };

//     return (
//         <div className="flex flex-col h-full bg-gray-50">
//             <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
//                 <div className="flex items-center gap-3">
//                     <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
//                         <Bot size={18} className="text-emerald-600" />
//                     </div>
//                     <div>
//                         <h1 className="font-bold text-gray-900">Chatbot Flows</h1>
//                         <p className="text-xs text-gray-400">Automate WhatsApp conversations with smart flows</p>
//                     </div>
//                 </div>
//                 <button
//                     onClick={handleCreate}
//                     className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
//                 >
//                     <Plus size={16} />
//                     New Flow
//                 </button>
//             </div>

//             <div className="flex-1 overflow-y-auto p-6">
//                 {loading ? (
//                     <div className="flex items-center justify-center h-40">
//                         <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
//                     </div>
//                 ) : flows.length === 0 ? (
//                     <div className="flex flex-col items-center justify-center h-64 text-center">
//                         <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
//                             <Bot size={28} className="text-gray-400" />
//                         </div>
//                         <p className="font-semibold text-gray-700 mb-1">No flows yet</p>
//                         <p className="text-sm text-gray-400 mb-4">Create your first automation flow to start handling WhatsApp leads automatically.</p>
//                         <button
//                             onClick={handleCreate}
//                             className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700"
//                         >
//                             <Plus size={14} />
//                             Create First Flow
//                         </button>
//                     </div>
//                 ) : (
//                     <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
//                         {flows.map((flow) => (
//                             <FlowCard
//                                 key={flow.id}
//                                 flow={flow}
//                                 onEdit={() => handleEdit(flow)}
//                                 onDelete={() => handleDelete(flow.id)}
//                                 onToggle={() => handleToggleActive(flow)}
//                                 onPreview={() => handlePreview(flow)}
//                             />
//                         ))}
//                     </div>
//                 )}
//             </div>

//             {showBuilder && (
//                 <FlowBuilder
//                     flow={editingFlow}
//                     onClose={() => { setShowBuilder(false); setEditingFlow(null); }}
//                     onSave={handleSaved}
//                 />
//             )}

//             {previewFlow && (
//                 <FlowPreviewModal flow={previewFlow} onClose={() => setPreviewFlow(null)} />
//             )}
//         </div>
//     );
// }

// // --- Helper components ---

// function FlowCard({ flow, onEdit, onDelete, onToggle, onPreview }: {
//     flow: ChatbotFlow;
//     onEdit: () => void;
//     onDelete: () => void;
//     onToggle: () => void;
//     onPreview: () => void;
// }) {
//     return (
//         <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
//             <div className="flex items-start justify-between mb-3">
//                 <div className="flex items-center gap-3 min-w-0">
//                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${flow.is_active ? 'bg-emerald-100' : 'bg-gray-100'}`}>
//                         <Bot size={18} className={flow.is_active ? 'text-emerald-600' : 'text-gray-400'} />
//                     </div>
//                     <div className="min-w-0">
//                         <h3 className="font-semibold text-gray-900 text-sm truncate">{flow.name}</h3>
//                         {flow.description && <p className="text-xs text-gray-400 truncate">{flow.description}</p>}
//                     </div>
//                 </div>
//                 <button onClick={onToggle} className="shrink-0 ml-2">
//                     {flow.is_active ? <ToggleRight size={22} className="text-emerald-500" /> : <ToggleLeft size={22} className="text-gray-400" />}
//                 </button>
//             </div>

//             <div className="flex flex-wrap gap-2 mb-4">
//                 <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${flow.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
//                     {flow.is_active ? 'Active' : 'Inactive'}
//                 </span>
//                 {flow.is_default && (
//                     <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700">Default</span>
//                 )}
//                 {flow.trigger_keyword && (
//                     <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-700 flex items-center gap-1">
//                         <Zap size={10} /> {flow.trigger_keyword}
//                     </span>
//                 )}
//             </div>

//             <div className="flex items-center gap-2">
//                 <button onClick={onPreview} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
//                     <Eye size={12} /> Preview
//                 </button>
//                 <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50">
//                     <Edit2 size={12} /> Edit
//                 </button>
//                 <button onClick={onDelete} className="p-1.5 text-red-400 border border-red-100 rounded-lg hover:bg-red-50">
//                     <Trash2 size={13} />
//                 </button>
//             </div>
//         </div>
//     );
// }

// function FlowPreviewModal({ flow, onClose }: { flow: ChatbotFlow; onClose: () => void }) {
//     const steps = flow.steps || [];
//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
//             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
//                 <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
//                     <div>
//                         <h2 className="font-bold text-gray-900">{flow.name}</h2>
//                         <p className="text-xs text-gray-400">{steps.length} steps</p>
//                     </div>
//                     <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
//                         <X size={18} />
//                     </button>
//                 </div>
//                 <div className="p-6 space-y-3">
//                     {steps.length === 0 ? (
//                         <p className="text-sm text-gray-400 text-center py-6">No steps in this flow</p>
//                     ) : (
//                         steps.map((step, idx) => {
//                             const config = STEP_TYPE_CONFIG[step.step_type];
//                             const Icon = config.icon;
//                             return (
//                                 <div key={step.id} className="flex gap-3">
//                                     <div className="flex flex-col items-center">
//                                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
//                                             <Icon size={14} />
//                                         </div>
//                                         {idx < steps.length - 1 && <div className="w-0.5 h-4 bg-gray-200 mt-1" />}
//                                     </div>
//                                     <div className="flex-1 pb-2">
//                                         <div className="flex items-center gap-2">
//                                             <span className="text-xs font-bold text-gray-400">Step {idx + 1}</span>
//                                             <span className="text-xs font-semibold text-gray-700">{config.label}</span>
//                                         </div>
//                                         {step.message_text && (
//                                             <p className="text-sm text-gray-600 mt-0.5 bg-gray-50 rounded-lg px-3 py-2">{step.message_text}</p>
//                                         )}
//                                         {step.step_type === 'buttons' && step.buttons && (
//                                             <div className="flex flex-wrap gap-1 mt-1">
//                                                 {(step.buttons as any[]).map((b: any, i: number) => (
//                                                     <span key={i} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">{b.title}</span>
//                                                 ))}
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             );
//                         })
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }

// // --- FlowBuilder (the editor) ---
// function FlowBuilder({ flow, onClose, onSave }: {
//     flow: ChatbotFlow | null;
//     onClose: () => void;
//     onSave: () => void;
// }) {
//     const [name, setName] = useState(flow?.name || '');
//     const [description, setDescription] = useState(flow?.description || '');
//     const [triggerKeyword, setTriggerKeyword] = useState(flow?.trigger_keyword || '');
//     const [isDefault, setIsDefault] = useState(flow?.is_default || false);
//     const [steps, setSteps] = useState<FlowStep[]>(flow?.steps || []);
//     const [expanded, setExpanded] = useState<number | null>(0);
//     const [saving, setSaving] = useState(false);
//     const [templates, setTemplates] = useState<Template[]>([]);
//     const [tags, setTags] = useState<Tag[]>([]);
//     const [users, setUsers] = useState<CrmUser[]>([]);

//     // Load mock data on mount
//     useEffect(() => {
//         const load = async () => {
//             await new Promise(resolve => setTimeout(resolve, 200));
//             setTemplates(MOCK_TEMPLATES.filter(t => t.status === 'APPROVED'));
//             setTags(MOCK_TAGS);
//             setUsers(MOCK_USERS.filter(u => u.is_active));
//         };
//         load();
//     }, []);

//     const addStep = () => {
//         const newStep: FlowStep = {
//             id: `local_${Math.random().toString(36).slice(2)}`,
//             flow_id: flow?.id || '',
//             step_index: steps.length,
//             step_type: 'message',
//             message_text: '',
//             buttons: null,
//             save_response_as: null,
//             tag_id: null,
//             assign_to: null,
//             stage: null,
//             template_id: null,
//             next_step_index: null,
//             conditions: null,
//             created_at: new Date().toISOString(),
//         };
//         const updated = [...steps, newStep];
//         setSteps(updated);
//         setExpanded(updated.length - 1);
//     };

//     const removeStep = (idx: number) => {
//         const updated = steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step_index: i }));
//         setSteps(updated);
//         setExpanded(null);
//     };

//     const updateStep = (idx: number, patch: Partial<FlowStep>) => {
//         const updated = [...steps];
//         updated[idx] = { ...updated[idx], ...patch };
//         setSteps(updated);
//     };

//     const moveStep = (idx: number, dir: -1 | 1) => {
//         const target = idx + dir;
//         if (target < 0 || target >= steps.length) return;
//         const updated = [...steps];
//         [updated[idx], updated[target]] = [updated[target], updated[idx]];
//         updated[idx].step_index = idx;
//         updated[target].step_index = target;
//         setSteps(updated);
//         setExpanded(target);
//     };

//     const handleSave = async () => {
//         if (!name.trim()) return;
//         setSaving(true);
//         await new Promise(resolve => setTimeout(resolve, 500));

//         // Create or update flow in store
//         let flowId = flow?.id;
//         if (flow) {
//             const index = flowsStore.findIndex(f => f.id === flow.id);
//             if (index !== -1) {
//                 flowsStore[index] = {
//                     ...flowsStore[index],
//                     name,
//                     description: description || null,
//                     trigger_keyword: triggerKeyword || null,
//                     is_default: isDefault,
//                     updated_at: new Date().toISOString(),
//                 };
//             }
//             flowId = flow.id;
//         } else {
//             flowId = `flow_${Date.now()}`;
//             const newFlow: any = {
//                 id: flowId,
//                 name,
//                 description: description || null,
//                 is_active: true,
//                 is_default: isDefault,
//                 trigger_keyword: triggerKeyword || null,
//                 created_at: new Date().toISOString(),
//                 updated_at: new Date().toISOString(),
//             };
//             flowsStore.push(newFlow);
//         }

//         // Save steps
//         if (flowId && steps.length > 0) {
//             stepsStore[flowId] = steps.map((s, idx) => ({
//                 ...s,
//                 flow_id: flowId,
//                 step_index: idx,
//             }));
//         } else if (flowId) {
//             stepsStore[flowId] = [];
//         }

//         // Handle default flow: ensure only one default
//         if (isDefault) {
//             flowsStore.forEach(f => {
//                 if (f.id !== flowId) f.is_default = false;
//             });
//         }

//         notificationStore.push('success', 'Flow Saved', `"${name}" has been saved.`, { label: "", page: "" });
//         onSave();
//         onClose();
//         setSaving(false);
//     };

//     return (
//         <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-4">
//             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4">
//                 <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
//                     <div className="flex items-center gap-3">
//                         <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
//                             <Bot size={18} className="text-emerald-600" />
//                         </div>
//                         <h2 className="font-bold text-gray-900">{flow ? 'Edit Flow' : 'Create Flow'}</h2>
//                     </div>
//                     <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
//                         <X size={18} />
//                     </button>
//                 </div>

//                 <div className="p-6 space-y-6">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Flow Name *</label>
//                             <input
//                                 className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                                 value={name}
//                                 onChange={(e) => setName(e.target.value)}
//                                 placeholder="e.g. Welcome Flow"
//                             />
//                         </div>
//                         <div>
//                             <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Trigger Keyword</label>
//                             <div className="relative">
//                                 <Zap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
//                                 <input
//                                     className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                                     value={triggerKeyword}
//                                     onChange={(e) => setTriggerKeyword(e.target.value)}
//                                     placeholder="e.g. buy, property, info"
//                                 />
//                             </div>
//                             <p className="text-xs text-gray-400 mt-1">Triggers when message contains this word</p>
//                         </div>
//                         <div className="md:col-span-2">
//                             <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Description</label>
//                             <input
//                                 className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                                 value={description}
//                                 onChange={(e) => setDescription(e.target.value)}
//                                 placeholder="Brief description of this flow"
//                             />
//                         </div>
//                     </div>

//                     <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
//                         <input
//                             type="checkbox"
//                             id="is_default"
//                             checked={isDefault}
//                             onChange={(e) => setIsDefault(e.target.checked)}
//                             className="w-4 h-4 accent-emerald-600"
//                         />
//                         <label htmlFor="is_default" className="text-sm text-blue-800 font-medium cursor-pointer">
//                             Set as default flow (runs for all new contacts without a specific keyword match)
//                         </label>
//                     </div>

//                     <div>
//                         <div className="flex items-center justify-between mb-3">
//                             <h3 className="font-semibold text-gray-900">Flow Steps ({steps.length})</h3>
//                             <button
//                                 onClick={addStep}
//                                 className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50"
//                             >
//                                 <Plus size={13} /> Add Step
//                             </button>
//                         </div>

//                         {steps.length === 0 ? (
//                             <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
//                                 <Bot size={24} className="text-gray-300 mx-auto mb-2" />
//                                 <p className="text-sm text-gray-400">No steps yet. Add your first step below.</p>
//                                 <button onClick={addStep} className="mt-3 text-xs text-emerald-600 font-medium hover:underline">
//                                     + Add first step
//                                 </button>
//                             </div>
//                         ) : (
//                             <div className="space-y-2">
//                                 {steps.map((step, idx) => (
//                                     <StepEditor
//                                         key={step.id}
//                                         step={step}
//                                         idx={idx}
//                                         total={steps.length}
//                                         expanded={expanded === idx}
//                                         templates={templates}
//                                         tags={tags}
//                                         users={users}
//                                         onToggle={() => setExpanded(expanded === idx ? null : idx)}
//                                         onUpdate={(patch) => updateStep(idx, patch)}
//                                         onRemove={() => removeStep(idx)}
//                                         onMoveUp={() => moveStep(idx, -1)}
//                                         onMoveDown={() => moveStep(idx, 1)}
//                                     />
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
//                     <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100">
//                         Cancel
//                     </button>
//                     <button
//                         onClick={handleSave}
//                         disabled={saving || !name.trim()}
//                         className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50"
//                     >
//                         <Save size={14} />
//                         {saving ? 'Saving...' : 'Save Flow'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }

// // StepEditor component (same as before, but with mock data)
// function StepEditor({ step, idx, total, expanded, templates, tags, users, onToggle, onUpdate, onRemove, onMoveUp, onMoveDown }: any) {
//     const config = STEP_TYPE_CONFIG[step.step_type];
//     const Icon = config.icon;

//     const addButton = () => {
//         const current = step.buttons || [];
//         if (current.length >= 3) return;
//         onUpdate({ buttons: [...current, { id: `btn_${Date.now()}`, title: '', next_step: undefined }] });
//     };

//     const updateButton = (i: number, field: string, value: any) => {
//         const current = [...(step.buttons || [])];
//         current[i] = { ...current[i], [field]: value };
//         onUpdate({ buttons: current });
//     };

//     const removeButton = (i: number) => {
//         const current = (step.buttons || []).filter((_: any, bi: number) => bi !== i);
//         onUpdate({ buttons: current });
//     };

//     return (
//         <div className="border border-gray-200 rounded-xl overflow-hidden">
//             <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
//                 <span className="text-xs font-bold text-gray-400 w-6 shrink-0">{idx + 1}</span>
//                 <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
//                     <Icon size={13} />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                     <span className="text-sm font-semibold text-gray-800">{config.label}</span>
//                     {step.message_text && <span className="text-xs text-gray-400 ml-2 truncate">— {step.message_text.substring(0, 40)}</span>}
//                 </div>
//                 <div className="flex items-center gap-1 shrink-0">
//                     {idx > 0 && <button onClick={(e) => { e.stopPropagation(); onMoveUp(); }} className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700"><ChevronUp size={13} /></button>}
//                     {idx < total - 1 && <button onClick={(e) => { e.stopPropagation(); onMoveDown(); }} className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700"><ChevronDown size={13} /></button>}
//                     {expanded ? <ChevronUp size={15} className="text-gray-500" /> : <ChevronDown size={15} className="text-gray-500" />}
//                 </div>
//             </button>

//             {expanded && (
//                 <div className="px-4 py-4 bg-white border-t border-gray-100 space-y-4">
//                     {/* Step type selector */}
//                     <div>
//                         <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Step Type</label>
//                         <select
//                             value={step.step_type}
//                             onChange={(e) => onUpdate({ step_type: e.target.value, buttons: null, tag_id: null, assign_to: null, stage: null, template_id: null })}
//                             className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                         >
//                             {Object.entries(STEP_TYPE_CONFIG).map(([type, cfg]) => (
//                                 <option key={type} value={type}>{cfg.label}</option>
//                             ))}
//                         </select>
//                         <p className="text-xs text-gray-400 mt-1">{config.description}</p>
//                     </div>

//                     {['message', 'question', 'buttons', 'end'].includes(step.step_type) && (
//                         <div>
//                             <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Message Text</label>
//                             <textarea
//                                 value={step.message_text || ''}
//                                 onChange={(e) => onUpdate({ message_text: e.target.value })}
//                                 rows={3}
//                                 className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
//                                 placeholder={step.step_type === 'question' ? 'e.g. What is your preferred location?' : 'Enter message to send...'}
//                             />
//                         </div>
//                     )}

//                     {step.step_type === 'question' && (
//                         <div>
//                             <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Save Response As</label>
//                             <select
//                                 value={step.save_response_as || ''}
//                                 onChange={(e) => onUpdate({ save_response_as: e.target.value || null })}
//                                 className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                             >
//                                 <option value="">Don't save</option>
//                                 {SAVE_RESPONSE_OPTIONS.map((o) => (
//                                     <option key={o.value} value={o.value}>{o.label}</option>
//                                 ))}
//                             </select>
//                         </div>
//                     )}

//                     {step.step_type === 'buttons' && (
//                         <div>
//                             <div className="flex items-center justify-between mb-2">
//                                 <label className="text-xs font-semibold text-gray-500 uppercase">Buttons (max 3)</label>
//                                 {(step.buttons || []).length < 3 && (
//                                     <button onClick={addButton} className="text-xs text-emerald-600 font-medium hover:underline flex items-center gap-1">
//                                         <Plus size={11} /> Add Button
//                                     </button>
//                                 )}
//                             </div>
//                             <div className="space-y-2">
//                                 {(step.buttons || []).map((btn: any, bi: number) => (
//                                     <div key={btn.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
//                                         <span className="text-xs font-bold text-emerald-600 w-4 shrink-0">{bi + 1}</span>
//                                         <input
//                                             value={btn.title}
//                                             onChange={(e) => updateButton(bi, 'title', e.target.value)}
//                                             placeholder="Button label"
//                                             className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
//                                         />
//                                         <div className="flex items-center gap-1 shrink-0">
//                                             <ArrowRight size={12} className="text-gray-400" />
//                                             <input
//                                                 type="number"
//                                                 value={btn.next_step ?? ''}
//                                                 onChange={(e) => updateButton(bi, 'next_step', e.target.value !== '' ? parseInt(e.target.value) : undefined)}
//                                                 placeholder="Step"
//                                                 min={0}
//                                                 className="w-14 text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
//                                             />
//                                         </div>
//                                         <button onClick={() => removeButton(bi)} className="text-red-400 hover:text-red-600 shrink-0">
//                                             <X size={13} />
//                                         </button>
//                                     </div>
//                                 ))}
//                                 {(step.buttons || []).length === 0 && <p className="text-xs text-gray-400 italic">No buttons yet. Click "Add Button" to add options.</p>}
//                             </div>
//                         </div>
//                     )}

//                     {step.step_type === 'tag' && (
//                         <div>
//                             <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Select Tag</label>
//                             <select
//                                 value={step.tag_id || ''}
//                                 onChange={(e) => onUpdate({ tag_id: e.target.value || null })}
//                                 className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                             >
//                                 <option value="">Choose a tag...</option>
//                                 {tags.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
//                             </select>
//                         </div>
//                     )}

//                     {step.step_type === 'assign' && (
//                         <div>
//                             <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Assign To</label>
//                             <select
//                                 value={step.assign_to || ''}
//                                 onChange={(e) => onUpdate({ assign_to: e.target.value || null })}
//                                 className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                             >
//                                 <option value="">Choose a team member...</option>
//                                 {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
//                             </select>
//                         </div>
//                     )}

//                     {step.step_type === 'stage' && (
//                         <div>
//                             <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Update Stage To</label>
//                             <select
//                                 value={step.stage || ''}
//                                 onChange={(e) => onUpdate({ stage: e.target.value || null })}
//                                 className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                             >
//                                 <option value="">Choose a stage...</option>
//                                 {CONTACT_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
//                             </select>
//                         </div>
//                     )}

//                     {step.step_type === 'template' && (
//                         <div>
//                             <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">WhatsApp Template</label>
//                             <select
//                                 value={step.template_id || ''}
//                                 onChange={(e) => onUpdate({ template_id: e.target.value || null })}
//                                 className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                             >
//                                 <option value="">Choose a template...</option>
//                                 {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
//                             </select>
//                             {templates.length === 0 && <p className="text-xs text-amber-600 mt-1">No approved templates available. Create and approve templates first.</p>}
//                         </div>
//                     )}

//                     {step.step_type === 'condition' && (
//                         <div>
//                             <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Keyword → Step Mapping</label>
//                             <p className="text-xs text-gray-400 mb-2">JSON format: {"{"}"buy": 2, "sell": 4{"}"} — routes to step index based on keyword</p>
//                             <textarea
//                                 value={step.conditions ? JSON.stringify(step.conditions, null, 2) : ''}
//                                 onChange={(e) => {
//                                     try { const parsed = JSON.parse(e.target.value); onUpdate({ conditions: parsed }); } catch { /* ignore */ }
//                                 }}
//                                 rows={3}
//                                 className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
//                                 placeholder='{"buy": 2, "sell": 4, "invest": 6}'
//                             />
//                         </div>
//                     )}

//                     {!['tag', 'assign', 'stage'].includes(step.step_type) && step.step_type !== 'end' && (
//                         <div>
//                             <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Next Step Index (optional)</label>
//                             <input
//                                 type="number"
//                                 min={0}
//                                 value={step.next_step_index ?? ''}
//                                 onChange={(e) => onUpdate({ next_step_index: e.target.value !== '' ? parseInt(e.target.value) : null })}
//                                 className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                                 placeholder="Leave blank to go to next step automatically"
//                             />
//                         </div>
//                     )}

//                     <div className="flex justify-end pt-1">
//                         <button onClick={onRemove} className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700">
//                             <Trash2 size={12} /> Remove Step
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }


// src/components/chatbot/ChatbotPage.tsx
import { useState, useEffect, useCallback } from 'react';
import {
    Plus, Bot, Trash2, CreditCard as Edit2, ToggleLeft, ToggleRight, Zap,
    Save, X, ChevronDown, ChevronUp, ArrowRight, MessageSquare, HelpCircle,
    List, Tag as TagIcon, UserCheck, TrendingUp, FileText, CheckCircle,
    Hash, Eye, Loader2,
} from 'lucide-react';
import type { ChatbotFlow, FlowStep, FlowStepType, Template, Tag, CrmUser } from '../../types';
import { whatsappAPI } from '../../lib/whatsappApi';
import { notificationStore } from '../../lib/notifications';

const STEP_TYPE_CONFIG: Record<FlowStepType, { label: string; icon: React.ElementType; color: string; description: string }> = {
    message: { label: 'Send Message', icon: MessageSquare, color: 'bg-blue-100 text-blue-700', description: 'Send a text message to the contact' },
    question: { label: 'Ask Question', icon: HelpCircle, color: 'bg-amber-100 text-amber-700', description: 'Ask a question and save the response' },
    buttons: { label: 'Button Choices', icon: List, color: 'bg-emerald-100 text-emerald-700', description: 'Show clickable button options (max 3)' },
    tag: { label: 'Apply Tag', icon: TagIcon, color: 'bg-pink-100 text-pink-700', description: 'Automatically tag the contact' },
    assign: { label: 'Assign Agent', icon: UserCheck, color: 'bg-sky-100 text-sky-700', description: 'Assign the conversation to a team member' },
    stage: { label: 'Update Stage', icon: TrendingUp, color: 'bg-orange-100 text-orange-700', description: 'Move contact to a pipeline stage' },
    template: { label: 'Send Template', icon: FileText, color: 'bg-violet-100 text-violet-700', description: 'Send an approved WhatsApp template' },
    condition: { label: 'Condition', icon: Hash, color: 'bg-gray-100 text-gray-700', description: 'Branch based on keyword matching' },
    end: { label: 'End Flow', icon: CheckCircle, color: 'bg-red-100 text-red-700', description: 'End the automation sequence' },
};

const CONTACT_STAGES = ['New', 'Contacted', 'Qualified', 'Site Visit', 'Closed', 'Lost'];
const SAVE_RESPONSE_OPTIONS = [
    { value: 'name', label: 'Contact Name' },
    { value: 'email', label: 'Email Address' },
    { value: 'location', label: 'Preferred Location' },
    { value: 'budget', label: 'Budget (saved to notes)' },
    { value: 'notes', label: 'General Notes' },
];

export default function ChatbotPage() {
    const [flows, setFlows] = useState<ChatbotFlow[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingFlow, setEditingFlow] = useState<ChatbotFlow | null>(null);
    const [showBuilder, setShowBuilder] = useState(false);
    const [previewFlow, setPreviewFlow] = useState<ChatbotFlow | null>(null);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [users, setUsers] = useState<CrmUser[]>([]);

    // Fetch all required data
    const fetchFlows = useCallback(async () => {
        setLoading(true);
        try {
            const data: any = await whatsappAPI.getChatbotFlows();
            setFlows(data);
        } catch (error) {
            console.error('Failed to fetch flows:', error);
            notificationStore.push('error', 'Failed', 'Could not load chatbot flows');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTemplates = async () => {
        try {
            const data: any = await whatsappAPI.getTemplates();
            setTemplates(data.filter(t => t.status === 'APPROVED'));
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        }
    };

    const fetchTags = async () => {
        try {
            const data: any = await whatsappAPI.getTags();
            setTags(data);
        } catch (error) {
            console.error('Failed to fetch tags:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const data: any = await whatsappAPI.getSalesExecutives();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    useEffect(() => {
        fetchFlows();
        fetchTemplates();
        fetchTags();
        fetchUsers();
    }, []);

    const handleToggleActive = async (flow: ChatbotFlow) => {
        try {
            const updated = await whatsappAPI.toggleChatbotFlow(flow.id, !flow.is_active);
            setFlows((prev: any) => prev.map(f => f.id === flow.id ? updated : f));
            notificationStore.push('success', 'Flow Updated', `${flow.name} is now ${updated.is_active ? 'active' : 'inactive'}`);
        } catch (error) {
            console.error('Failed to toggle flow:', error);
            notificationStore.push('error', 'Failed', 'Could not update flow status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this flow? This cannot be undone.')) return;
        try {
            await whatsappAPI.deleteChatbotFlow(id);
            setFlows(prev => prev.filter(f => f.id !== id));
            notificationStore.push('success', 'Flow Deleted', 'Flow has been removed');
        } catch (error) {
            console.error('Failed to delete flow:', error);
            notificationStore.push('error', 'Failed', 'Could not delete flow');
        }
    };

    const handleEdit = async (flow: ChatbotFlow) => {
        try {
            const fullFlow: any = await whatsappAPI.getChatbotFlowById(flow.id);
            setEditingFlow(fullFlow);
            setShowBuilder(true);
        } catch (error) {
            console.error('Failed to fetch flow details:', error);
            notificationStore.push('error', 'Failed', 'Could not load flow details');
        }
    };

    const handleCreate = () => {
        setEditingFlow(null);
        setShowBuilder(true);
    };

    const handleSaved = () => {
        setShowBuilder(false);
        setEditingFlow(null);
        fetchFlows();
    };

    const handlePreview = async (flow: ChatbotFlow) => {
        try {
            const fullFlow: any = await whatsappAPI.getChatbotFlowById(flow.id);
            setPreviewFlow(fullFlow);
        } catch (error) {
            console.error('Failed to fetch flow details:', error);
            notificationStore.push('error', 'Failed', 'Could not load flow preview');
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <Bot size={18} className="text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900">Chatbot Flows</h1>
                        <p className="text-xs text-gray-400">Automate WhatsApp conversations with smart flows</p>
                    </div>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
                >
                    <Plus size={16} />
                    New Flow
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 size={32} className="animate-spin text-emerald-500" />
                    </div>
                ) : flows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                            <Bot size={28} className="text-gray-400" />
                        </div>
                        <p className="font-semibold text-gray-700 mb-1">No flows yet</p>
                        <p className="text-sm text-gray-400 mb-4">Create your first automation flow to start handling WhatsApp leads automatically.</p>
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700"
                        >
                            <Plus size={14} />
                            Create First Flow
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                        {flows.map((flow) => (
                            <FlowCard
                                key={flow.id}
                                flow={flow}
                                onEdit={() => handleEdit(flow)}
                                onDelete={() => handleDelete(flow.id)}
                                onToggle={() => handleToggleActive(flow)}
                                onPreview={() => handlePreview(flow)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {showBuilder && (
                <FlowBuilder
                    flow={editingFlow}
                    templates={templates}
                    tags={tags}
                    users={users}
                    onClose={() => { setShowBuilder(false); setEditingFlow(null); }}
                    onSave={handleSaved}
                />
            )}

            {previewFlow && (
                <FlowPreviewModal flow={previewFlow} onClose={() => setPreviewFlow(null)} />
            )}
        </div>
    );
}

// --- FlowCard Component ---
function FlowCard({ flow, onEdit, onDelete, onToggle, onPreview }: {
    flow: ChatbotFlow;
    onEdit: () => void;
    onDelete: () => void;
    onToggle: () => void;
    onPreview: () => void;
}) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${flow.is_active ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                        <Bot size={18} className={flow.is_active ? 'text-emerald-600' : 'text-gray-400'} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{flow.name}</h3>
                        {flow.description && <p className="text-xs text-gray-400 truncate">{flow.description}</p>}
                    </div>
                </div>
                <button onClick={onToggle} className="shrink-0 ml-2">
                    {flow.is_active ? <ToggleRight size={22} className="text-emerald-500" /> : <ToggleLeft size={22} className="text-gray-400" />}
                </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${flow.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {flow.is_active ? 'Active' : 'Inactive'}
                </span>
                {flow.is_default && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700">Default</span>
                )}
                {flow.trigger_keyword && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-700 flex items-center gap-1">
                        <Zap size={10} /> {flow.trigger_keyword}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-2">
                <button onClick={onPreview} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Eye size={12} /> Preview
                </button>
                <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50">
                    <Edit2 size={12} /> Edit
                </button>
                <button onClick={onDelete} className="p-1.5 text-red-400 border border-red-100 rounded-lg hover:bg-red-50">
                    <Trash2 size={13} />
                </button>
            </div>
        </div>
    );
}

// --- FlowPreviewModal Component ---
function FlowPreviewModal({ flow, onClose }: { flow: ChatbotFlow; onClose: () => void }) {
    const steps = flow.steps || [];
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div>
                        <h2 className="font-bold text-gray-900">{flow.name}</h2>
                        <p className="text-xs text-gray-400">{steps.length} steps</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-6 space-y-3">
                    {steps.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">No steps in this flow</p>
                    ) : (
                        steps.map((step, idx) => {
                            const config = STEP_TYPE_CONFIG[step.step_type];
                            const Icon = config.icon;
                            return (
                                <div key={step.id} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                                            <Icon size={14} />
                                        </div>
                                        {idx < steps.length - 1 && <div className="w-0.5 h-4 bg-gray-200 mt-1" />}
                                    </div>
                                    <div className="flex-1 pb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-400">Step {idx + 1}</span>
                                            <span className="text-xs font-semibold text-gray-700">{config.label}</span>
                                        </div>
                                        {step.message_text && (
                                            <p className="text-sm text-gray-600 mt-0.5 bg-gray-50 rounded-lg px-3 py-2">{step.message_text}</p>
                                        )}
                                        {step.step_type === 'buttons' && step.buttons && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {step.buttons.map((b: any, i: number) => (
                                                    <span key={i} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">{b.title}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

// --- FlowBuilder Component ---
function FlowBuilder({ flow, templates, tags, users, onClose, onSave }: {
    flow: ChatbotFlow | null;
    templates: Template[];
    tags: Tag[];
    users: CrmUser[];
    onClose: () => void;
    onSave: () => void;
}) {
    const [name, setName] = useState(flow?.name || '');
    const [description, setDescription] = useState(flow?.description || '');
    const [triggerKeyword, setTriggerKeyword] = useState(flow?.trigger_keyword || '');
    const [isDefault, setIsDefault] = useState(flow?.is_default || false);
    const [steps, setSteps] = useState<FlowStep[]>(flow?.steps || []);
    const [expanded, setExpanded] = useState<number | null>(0);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    const addStep = () => {
        const newStep: FlowStep = {
            id: `local_${Math.random().toString(36).slice(2)}`,
            flow_id: flow?.id || '',
            step_index: steps.length,
            step_type: 'message',
            message_text: '',
            buttons: null,
            save_response_as: null,
            tag_id: null,
            assign_to: null,
            stage: null,
            template_id: null,
            next_step_index: null,
            conditions: null,
            created_at: new Date().toISOString(),
        };
        const updated = [...steps, newStep];
        setSteps(updated);
        setExpanded(updated.length - 1);
    };

    const removeStep = (idx: number) => {
        const updated = steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step_index: i }));
        setSteps(updated);
        setExpanded(null);
    };

    const updateStep = (idx: number, patch: Partial<FlowStep>) => {
        const updated = [...steps];
        updated[idx] = { ...updated[idx], ...patch };
        setSteps(updated);
    };

    const moveStep = (idx: number, dir: -1 | 1) => {
        const target = idx + dir;
        if (target < 0 || target >= steps.length) return;
        const updated = [...steps];
        [updated[idx], updated[target]] = [updated[target], updated[idx]];
        updated[idx].step_index = idx;
        updated[target].step_index = target;
        setSteps(updated);
        setExpanded(target);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            notificationStore.push('error', 'Validation Error', 'Flow name is required');
            return;
        }

        setSaving(true);
        setLoading(true);
        try {
            const flowData: any = {
                name: name.trim(),
                description: description || null,
                trigger_keyword: triggerKeyword || null,
                is_default: isDefault,
                is_active: flow?.is_active ?? true,
                steps: steps.map((step, idx) => ({
                    ...step,
                    step_index: idx,
                    flow_id: undefined,
                })),
            };

            if (flow) {
                await whatsappAPI.updateChatbotFlow(flow.id, flowData);
                notificationStore.push('success', 'Flow Updated', `"${name}" has been updated`);
            } else {
                await whatsappAPI.createChatbotFlow(flowData);
                notificationStore.push('success', 'Flow Created', `"${name}" has been created`);
            }

            onSave();
            onClose();
        } catch (error) {
            console.error('Failed to save flow:', error);
            notificationStore.push('error', 'Save Failed', 'Could not save the flow');
        } finally {
            setSaving(false);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <Bot size={18} className="text-emerald-600" />
                        </div>
                        <h2 className="font-bold text-gray-900">{flow ? 'Edit Flow' : 'Create Flow'}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Flow Name *</label>
                            <input
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Welcome Flow"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Trigger Keyword</label>
                            <div className="relative">
                                <Zap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                                <input
                                    className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={triggerKeyword}
                                    onChange={(e) => setTriggerKeyword(e.target.value)}
                                    placeholder="e.g. buy, property, info"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Triggers when message contains this word</p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Description</label>
                            <input
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description of this flow"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <input
                            type="checkbox"
                            id="is_default"
                            checked={isDefault}
                            onChange={(e) => setIsDefault(e.target.checked)}
                            className="w-4 h-4 accent-emerald-600"
                        />
                        <label htmlFor="is_default" className="text-sm text-blue-800 font-medium cursor-pointer">
                            Set as default flow (runs for all new contacts without a specific keyword match)
                        </label>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">Flow Steps ({steps.length})</h3>
                            <button
                                onClick={addStep}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50"
                            >
                                <Plus size={13} /> Add Step
                            </button>
                        </div>

                        {steps.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
                                <Bot size={24} className="text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">No steps yet. Add your first step below.</p>
                                <button onClick={addStep} className="mt-3 text-xs text-emerald-600 font-medium hover:underline">
                                    + Add first step
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {steps.map((step, idx) => (
                                    <StepEditor
                                        key={step.id}
                                        step={step}
                                        idx={idx}
                                        total={steps.length}
                                        expanded={expanded === idx}
                                        templates={templates}
                                        tags={tags}
                                        users={users}
                                        onToggle={() => setExpanded(expanded === idx ? null : idx)}
                                        onUpdate={(patch) => updateStep(idx, patch)}
                                        onRemove={() => removeStep(idx)}
                                        onMoveUp={() => moveStep(idx, -1)}
                                        onMoveDown={() => moveStep(idx, 1)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !name.trim()}
                        className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50"
                    >
                        <Save size={14} />
                        {loading ? 'Saving...' : 'Save Flow'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- StepEditor Component ---
function StepEditor({ step, idx, total, expanded, templates, tags, users, onToggle, onUpdate, onRemove, onMoveUp, onMoveDown }: any) {
    const getStepConfig = (type: string) => {
        const configs: Record<string, { label: string; color: string }> = {
            message: { label: 'Send Message', color: 'bg-blue-100 text-blue-700' },
            question: { label: 'Ask Question', color: 'bg-amber-100 text-amber-700' },
            buttons: { label: 'Button Choices', color: 'bg-emerald-100 text-emerald-700' },
            tag: { label: 'Apply Tag', color: 'bg-pink-100 text-pink-700' },
            assign: { label: 'Assign Agent', color: 'bg-sky-100 text-sky-700' },
            stage: { label: 'Update Stage', color: 'bg-orange-100 text-orange-700' },
            template: { label: 'Send Template', color: 'bg-violet-100 text-violet-700' },
            condition: { label: 'Condition', color: 'bg-gray-100 text-gray-700' },
            end: { label: 'End Flow', color: 'bg-red-100 text-red-700' },
        };
        return configs[type] || configs.message;
    };

    const config = getStepConfig(step.step_type);

    const addButton = () => {
        const current = step.buttons || [];
        if (current.length >= 3) return;
        onUpdate({ buttons: [...current, { id: `btn_${Date.now()}`, title: '', next_step: undefined }] });
    };

    const updateButton = (i: number, field: string, value: any) => {
        const current = [...(step.buttons || [])];
        current[i] = { ...current[i], [field]: value };
        onUpdate({ buttons: current });
    };

    const removeButton = (i: number) => {
        const current = (step.buttons || []).filter((_: any, bi: number) => bi !== i);
        onUpdate({ buttons: current });
    };

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
                <span className="text-xs font-bold text-gray-400 w-6 shrink-0">{idx + 1}</span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                    <MessageSquare size={13} />
                </div>
                <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-gray-800">{config.label}</span>
                    {step.message_text && <span className="text-xs text-gray-400 ml-2 truncate">— {step.message_text.substring(0, 40)}</span>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {idx > 0 && <button onClick={(e) => { e.stopPropagation(); onMoveUp(); }} className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700"><ChevronUp size={13} /></button>}
                    {idx < total - 1 && <button onClick={(e) => { e.stopPropagation(); onMoveDown(); }} className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700"><ChevronDown size={13} /></button>}
                    {expanded ? <ChevronUp size={15} className="text-gray-500" /> : <ChevronDown size={15} className="text-gray-500" />}
                </div>
            </button>

            {expanded && (
                <div className="px-4 py-4 bg-white border-t border-gray-100 space-y-4">
                    {/* Step type selector */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Step Type</label>
                        <select
                            value={step.step_type}
                            onChange={(e) => onUpdate({ step_type: e.target.value, buttons: null, tag_id: null, assign_to: null, stage: null, template_id: null })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="message">Message</option>
                            <option value="question">Question</option>
                            <option value="buttons">Button Choices</option>
                            <option value="tag">Auto Tag</option>
                            <option value="assign">Assign User</option>
                            <option value="stage">Update Stage</option>
                            <option value="template">Send Template</option>
                            <option value="condition">Condition</option>
                            <option value="end">End Flow</option>
                        </select>
                    </div>

                    {['message', 'question', 'buttons', 'end'].includes(step.step_type) && (
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Message Text</label>
                            <textarea
                                value={step.message_text || ''}
                                onChange={(e) => onUpdate({ message_text: e.target.value })}
                                rows={3}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                placeholder={step.step_type === 'question' ? 'e.g. What is your preferred location?' : 'Enter message to send...'}
                            />
                        </div>
                    )}

                    {step.step_type === 'question' && (
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Save Response As</label>
                            <select
                                value={step.save_response_as || ''}
                                onChange={(e) => onUpdate({ save_response_as: e.target.value || null })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">Don't save</option>
                                {SAVE_RESPONSE_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {step.step_type === 'buttons' && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Buttons (max 3)</label>
                                {(step.buttons || []).length < 3 && (
                                    <button onClick={addButton} className="text-xs text-emerald-600 font-medium hover:underline flex items-center gap-1">
                                        <Plus size={11} /> Add Button
                                    </button>
                                )}
                            </div>
                            <div className="space-y-2">
                                {(step.buttons || []).map((btn: any, bi: number) => (
                                    <div key={btn.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                                        <span className="text-xs font-bold text-emerald-600 w-4 shrink-0">{bi + 1}</span>
                                        <input
                                            value={btn.title}
                                            onChange={(e) => updateButton(bi, 'title', e.target.value)}
                                            placeholder="Button label"
                                            className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                        <div className="flex items-center gap-1 shrink-0">
                                            <ArrowRight size={12} className="text-gray-400" />
                                            <input
                                                type="number"
                                                value={btn.next_step ?? ''}
                                                onChange={(e) => updateButton(bi, 'next_step', e.target.value !== '' ? parseInt(e.target.value) : undefined)}
                                                placeholder="Step"
                                                min={0}
                                                className="w-14 text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <button onClick={() => removeButton(bi)} className="text-red-400 hover:text-red-600 shrink-0">
                                            <X size={13} />
                                        </button>
                                    </div>
                                ))}
                                {(step.buttons || []).length === 0 && <p className="text-xs text-gray-400 italic">No buttons yet. Click "Add Button" to add options.</p>}
                            </div>
                        </div>
                    )}

                    {step.step_type === 'tag' && (
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Select Tag</label>
                            <select
                                value={step.tag_id || ''}
                                onChange={(e) => onUpdate({ tag_id: e.target.value || null })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">Choose a tag...</option>
                                {tags.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                    )}

                    {step.step_type === 'assign' && (
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Assign To</label>
                            <select
                                value={step.assign_to || ''}
                                onChange={(e) => onUpdate({ assign_to: e.target.value || null })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">Choose a team member...</option>
                                {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                    )}

                    {step.step_type === 'stage' && (
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Update Stage To</label>
                            <select
                                value={step.stage || ''}
                                onChange={(e) => onUpdate({ stage: e.target.value || null })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">Choose a stage...</option>
                                {CONTACT_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    )}

                    {step.step_type === 'template' && (
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">WhatsApp Template</label>
                            <select
                                value={step.template_id || ''}
                                onChange={(e) => onUpdate({ template_id: e.target.value || null })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">Choose a template...</option>
                                {templates.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            {templates.length === 0 && <p className="text-xs text-amber-600 mt-1">No approved templates available. Create and approve templates first.</p>}
                        </div>
                    )}

                    {step.step_type === 'condition' && (
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Keyword → Step Mapping</label>
                            <p className="text-xs text-gray-400 mb-2">JSON format: {"{"}"buy": 2, "sell": 4{"}"} — routes to step index based on keyword</p>
                            <textarea
                                value={step.conditions ? JSON.stringify(step.conditions, null, 2) : ''}
                                onChange={(e) => {
                                    try { const parsed = JSON.parse(e.target.value); onUpdate({ conditions: parsed }); } catch { /* ignore */ }
                                }}
                                rows={3}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                placeholder='{"buy": 2, "sell": 4, "invest": 6}'
                            />
                        </div>
                    )}

                    {!['tag', 'assign', 'stage'].includes(step.step_type) && step.step_type !== 'end' && (
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Next Step Index (optional)</label>
                            <input
                                type="number"
                                min={0}
                                value={step.next_step_index ?? ''}
                                onChange={(e) => onUpdate({ next_step_index: e.target.value !== '' ? parseInt(e.target.value) : null })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="Leave blank to go to next step automatically"
                            />
                        </div>
                    )}

                    <div className="flex justify-end pt-1">
                        <button onClick={onRemove} className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700">
                            <Trash2 size={12} /> Remove Step
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}