// import { useState, useEffect } from 'react';
// import { Plus, Trash2, ChevronDown, ChevronUp, Save, X } from 'lucide-react';
// import type { ChatbotFlow, FlowStep, Template, Tag } from '../../types';
// import { MOCK_FLOWS, MOCK_TAGS, MOCK_TEMPLATES } from '../../lib/mockData';
// import { notificationStore } from '../../lib/notifications';

// // In‑memory stores (shared with ChatbotPage)
// let flowsStore: ChatbotFlow[] = JSON.parse(JSON.stringify(MOCK_FLOWS));
// let stepsStore: Record<string, FlowStep[]> = {};
// MOCK_FLOWS.forEach(flow => {
//     if (flow.steps) stepsStore[flow.id] = JSON.parse(JSON.stringify(flow.steps));
// });

// interface Props {
//     flow: ChatbotFlow | null;
//     onClose: () => void;
//     onSave: () => void;
// }

// export default function ChatbotBuilder({ flow, onClose, onSave }: Props) {
//     const [steps, setSteps] = useState<FlowStep[]>([]);
//     const [templates, setTemplates] = useState<Template[]>([]);
//     const [tags, setTags] = useState<Tag[]>([]);
//     const [name, setName] = useState(flow?.name || '');
//     const [expanded, setExpanded] = useState<number | null>(0);
//     const [saving, setSaving] = useState(false);

//     // Load mock data
//     useEffect(() => {
//         const load = async () => {
//             await new Promise(resolve => setTimeout(resolve, 200));
//             setTemplates(MOCK_TEMPLATES.filter(t => t.status === 'APPROVED'));
//             setTags(MOCK_TAGS);
//         };
//         load();
//     }, []);

//     const handleAddStep = () => {
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
//         setSteps([...steps, newStep]);
//     };

//     const handleRemoveStep = (index: number) => {
//         setSteps(steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, step_index: i })));
//     };

//     const handleUpdateStep = (index: number, updates: Partial<FlowStep>) => {
//         const updated = [...steps];
//         updated[index] = { ...updated[index], ...updates };
//         setSteps(updated);
//     };

//     const handleSave = async () => {
//         if (!name.trim() || steps.length === 0) return;
//         setSaving(true);
//         await new Promise(resolve => setTimeout(resolve, 500));

//         let flowId = flow?.id;
//         if (flow) {
//             const index = flowsStore.findIndex(f => f.id === flow.id);
//             if (index !== -1) {
//                 flowsStore[index] = { ...flowsStore[index], name, updated_at: new Date().toISOString() };
//             }
//             flowId = flow.id;
//         } else {
//             flowId = `flow_${Date.now()}`;
//             const newFlow: any = {
//                 id: flowId,
//                 name,
//                 is_active: true,
//                 created_at: new Date().toISOString(),
//                 updated_at: new Date().toISOString(),
//             };
//             flowsStore.push(newFlow);
//         }

//         if (flowId) {
//             stepsStore[flowId] = steps.map((s, idx) => ({
//                 ...s,
//                 flow_id: flowId,
//                 step_index: idx,
//             }));
//         }

//         notificationStore.push('success', 'Flow Saved', `"${name}" has been saved.`, { label: "", page: "" });
//         onSave();
//         onClose();
//         setSaving(false);
//     };

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
//             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[95vh] overflow-y-auto">
//                 <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
//                     <h2 className="font-bold text-gray-900">Chatbot Flow Builder</h2>
//                     <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
//                         <X size={18} />
//                     </button>
//                 </div>

//                 <div className="p-6 space-y-6">
//                     <div>
//                         <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Flow Name</label>
//                         <input
//                             className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                             value={name}
//                             onChange={(e) => setName(e.target.value)}
//                             placeholder="e.g. Welcome Flow"
//                         />
//                     </div>

//                     <div>
//                         <div className="flex items-center justify-between mb-3">
//                             <h3 className="font-semibold text-gray-900">Flow Steps ({steps.length})</h3>
//                             <button
//                                 onClick={handleAddStep}
//                                 className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50"
//                             >
//                                 <Plus size={14} /> Add Step
//                             </button>
//                         </div>

//                         <div className="space-y-2">
//                             {steps.length === 0 ? (
//                                 <p className="text-sm text-gray-400 italic">No steps yet. Add your first step to get started.</p>
//                             ) : (
//                                 steps.map((step, idx) => (
//                                     <div key={step.id} className="border border-gray-200 rounded-xl overflow-hidden">
//                                         <button
//                                             onClick={() => setExpanded(expanded === idx ? null : idx)}
//                                             className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
//                                         >
//                                             <div className="flex items-center gap-3 min-w-0">
//                                                 <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Step {idx + 1}</span>
//                                                 <span className="text-sm font-medium text-gray-900 capitalize">{step.step_type}</span>
//                                                 {step.message_text && <span className="text-sm text-gray-500 truncate">"{step.message_text.substring(0, 30)}"</span>}
//                                             </div>
//                                             {expanded === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
//                                         </button>

//                                         {expanded === idx && (
//                                             <div className="px-4 py-4 bg-white space-y-3 border-t border-gray-100">
//                                                 <div>
//                                                     <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Step Type</label>
//                                                     <select
//                                                         value={step.step_type}
//                                                         onChange={(e) => handleUpdateStep(idx, { step_type: e.target.value as any })}
//                                                         className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//                                                     >
//                                                         <option value="message">Message</option>
//                                                         <option value="question">Question</option>
//                                                         <option value="buttons">Button Choices</option>
//                                                         <option value="tag">Auto Tag</option>
//                                                         <option value="assign">Assign User</option>
//                                                         <option value="stage">Update Stage</option>
//                                                         <option value="template">Send Template</option>
//                                                         <option value="end">End Flow</option>
//                                                     </select>
//                                                 </div>

//                                                 {['message', 'question', 'end'].includes(step.step_type) && (
//                                                     <div>
//                                                         <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Message</label>
//                                                         <textarea
//                                                             value={step.message_text || ''}
//                                                             onChange={(e) => handleUpdateStep(idx, { message_text: e.target.value })}
//                                                             rows={2}
//                                                             className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
//                                                             placeholder="Enter message text…"
//                                                         />
//                                                     </div>
//                                                 )}

//                                                 {step.step_type === 'buttons' && (
//                                                     <div>
//                                                         <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Buttons</p>
//                                                         <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
//                                                             <p className="text-xs text-gray-500">Add button choices (max 3 per step)</p>
//                                                         </div>
//                                                     </div>
//                                                 )}

//                                                 <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
//                                                     <button
//                                                         onClick={() => handleRemoveStep(idx)}
//                                                         className="flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
//                                                     >
//                                                         <Trash2 size={13} /> Remove
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                         )}
//                                     </div>
//                                 ))
//                             )}
//                         </div>
//                     </div>
//                 </div>

//                 <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
//                     <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">
//                         Cancel
//                     </button>
//                     <button
//                         onClick={handleSave}
//                         disabled={saving || !name.trim() || steps.length === 0}
//                         className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50"
//                     >
//                         <Save size={14} />
//                         {saving ? 'Saving…' : 'Save Flow'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }
// src/components/chatbot/FlowBuilder.tsx
import { useState } from 'react';
import {
    Plus, Trash2, ChevronDown, ChevronUp, Save, X, ArrowRight,
    MessageSquare, HelpCircle, List, Tag as TagIcon, UserCheck,
    TrendingUp, FileText, Hash, CheckCircle, Bot, Zap
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

interface Props {
    flow: ChatbotFlow | null;
    templates: Template[];
    tags: Tag[];
    users: CrmUser[];
    onClose: () => void;
    onSave: () => void;
}

export default function FlowBuilder({ flow, templates, tags, users, onClose, onSave }: Props) {
    const [name, setName] = useState(flow?.name || '');
    const [description, setDescription] = useState(flow?.description || '');
    const [triggerKeyword, setTriggerKeyword] = useState(flow?.trigger_keyword || '');
    const [isDefault, setIsDefault] = useState(flow?.is_default || false);
    const [steps, setSteps] = useState<FlowStep[]>(flow?.steps || []);
    const [expanded, setExpanded] = useState<number | null>(0);
    const [saving, setSaving] = useState(false);

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
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4">
                {/* Header */}
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

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                                Flow Name <span className="text-red-500">*</span>
                            </label>
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

                    {/* Default Flow Toggle */}
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

                    {/* Flow Steps */}
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

                {/* Footer */}
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
                        {saving ? 'Saving...' : 'Save Flow'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// StepEditor Component
function StepEditor({
    step, idx, total, expanded, templates, tags, users,
    onToggle, onUpdate, onRemove, onMoveUp, onMoveDown
}: any) {
    const config = STEP_TYPE_CONFIG[step.step_type as FlowStepType];

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
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
                <span className="text-xs font-bold text-gray-400 w-6 shrink-0">{idx + 1}</span>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                    <config.icon size={13} />
                </div>
                <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-gray-800">{config.label}</span>
                    {step.message_text && (
                        <span className="text-xs text-gray-400 ml-2 truncate">— {step.message_text.substring(0, 40)}</span>
                    )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {idx > 0 && (
                        <button onClick={(e) => { e.stopPropagation(); onMoveUp(); }} className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700">
                            <ChevronUp size={13} />
                        </button>
                    )}
                    {idx < total - 1 && (
                        <button onClick={(e) => { e.stopPropagation(); onMoveDown(); }} className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-700">
                            <ChevronDown size={13} />
                        </button>
                    )}
                    {expanded ? <ChevronUp size={15} className="text-gray-500" /> : <ChevronDown size={15} className="text-gray-500" />}
                </div>
            </button>

            {expanded && (
                <div className="px-4 py-4 bg-white border-t border-gray-100 space-y-4">
                    {/* Step Type Selector */}
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Step Type</label>
                        <select
                            value={step.step_type}
                            onChange={(e) => onUpdate({
                                step_type: e.target.value as FlowStepType,
                                buttons: null,
                                tag_id: null,
                                assign_to: null,
                                stage: null,
                                template_id: null
                            })}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            {Object.entries(STEP_TYPE_CONFIG).map(([type, cfg]) => (
                                <option key={type} value={type}>{cfg.label}</option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-400 mt-1">{config.description}</p>
                    </div>

                    {/* Message Text (for message, question, buttons, end) */}
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

                    {/* Save Response As (for question) */}
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

                    {/* Buttons Editor */}
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
                                {(step.buttons || []).length === 0 && (
                                    <p className="text-xs text-gray-400 italic">No buttons yet. Click "Add Button" to add options.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Tag Selection */}
                    {step.step_type === 'tag' && (
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Select Tag</label>
                            <select
                                value={step.tag_id || ''}
                                onChange={(e) => onUpdate({ tag_id: e.target.value || null })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">Choose a tag...</option>
                                {tags.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Assign User Selection */}
                    {step.step_type === 'assign' && (
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Assign To</label>
                            <select
                                value={step.assign_to || ''}
                                onChange={(e) => onUpdate({ assign_to: e.target.value || null })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">Choose a team member...</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Stage Selection */}
                    {step.step_type === 'stage' && (
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Update Stage To</label>
                            <select
                                value={step.stage || ''}
                                onChange={(e) => onUpdate({ stage: e.target.value || null })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">Choose a stage...</option>
                                {CONTACT_STAGES.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Template Selection */}
                    {step.step_type === 'template' && (
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">WhatsApp Template</label>
                            <select
                                value={step.template_id || ''}
                                onChange={(e) => onUpdate({ template_id: e.target.value || null })}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="">Choose a template...</option>
                                {templates.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                            {templates.length === 0 && (
                                <p className="text-xs text-amber-600 mt-1">
                                    No approved templates available. Create and approve templates first.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Condition Mapping */}
                    {step.step_type === 'condition' && (
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Keyword → Step Mapping</label>
                            <p className="text-xs text-gray-400 mb-2">
                                JSON format: {"{"}"buy": 2, "sell": 4{"}"} — routes to step index based on keyword
                            </p>
                            <textarea
                                value={step.conditions ? JSON.stringify(step.conditions, null, 2) : ''}
                                onChange={(e) => {
                                    try {
                                        const parsed = JSON.parse(e.target.value);
                                        onUpdate({ conditions: parsed });
                                    } catch {
                                        // Invalid JSON, ignore
                                    }
                                }}
                                rows={3}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                placeholder='{"buy": 2, "sell": 4, "invest": 6}'
                            />
                        </div>
                    )}

                    {/* Next Step Index */}
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

                    {/* Remove Step Button */}
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