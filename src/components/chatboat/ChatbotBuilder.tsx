import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Save, X } from 'lucide-react';
import type { ChatbotFlow, FlowStep, Template, Tag } from '../../types';
import { MOCK_FLOWS, MOCK_TAGS, MOCK_TEMPLATES } from '../../lib/mockData';
import { notificationStore } from '../../lib/notifications';

// In‑memory stores (shared with ChatbotPage)
let flowsStore: ChatbotFlow[] = JSON.parse(JSON.stringify(MOCK_FLOWS));
let stepsStore: Record<string, FlowStep[]> = {};
MOCK_FLOWS.forEach(flow => {
    if (flow.steps) stepsStore[flow.id] = JSON.parse(JSON.stringify(flow.steps));
});

interface Props {
    flow: ChatbotFlow | null;
    onClose: () => void;
    onSave: () => void;
}

export default function ChatbotBuilder({ flow, onClose, onSave }: Props) {
    const [steps, setSteps] = useState<FlowStep[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [name, setName] = useState(flow?.name || '');
    const [expanded, setExpanded] = useState<number | null>(0);
    const [saving, setSaving] = useState(false);

    // Load mock data
    useEffect(() => {
        const load = async () => {
            await new Promise(resolve => setTimeout(resolve, 200));
            setTemplates(MOCK_TEMPLATES.filter(t => t.status === 'APPROVED'));
            setTags(MOCK_TAGS);
        };
        load();
    }, []);

    const handleAddStep = () => {
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
        setSteps([...steps, newStep]);
    };

    const handleRemoveStep = (index: number) => {
        setSteps(steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, step_index: i })));
    };

    const handleUpdateStep = (index: number, updates: Partial<FlowStep>) => {
        const updated = [...steps];
        updated[index] = { ...updated[index], ...updates };
        setSteps(updated);
    };

    const handleSave = async () => {
        if (!name.trim() || steps.length === 0) return;
        setSaving(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        let flowId = flow?.id;
        if (flow) {
            const index = flowsStore.findIndex(f => f.id === flow.id);
            if (index !== -1) {
                flowsStore[index] = { ...flowsStore[index], name, updated_at: new Date().toISOString() };
            }
            flowId = flow.id;
        } else {
            flowId = `flow_${Date.now()}`;
            const newFlow: any = {
                id: flowId,
                name,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            flowsStore.push(newFlow);
        }

        if (flowId) {
            stepsStore[flowId] = steps.map((s, idx) => ({
                ...s,
                flow_id: flowId,
                step_index: idx,
            }));
        }

        notificationStore.push('success', 'Flow Saved', `"${name}" has been saved.`, { label: "", page: "" });
        onSave();
        onClose();
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[95vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="font-bold text-gray-900">Chatbot Flow Builder</h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Flow Name</label>
                        <input
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Welcome Flow"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">Flow Steps ({steps.length})</h3>
                            <button
                                onClick={handleAddStep}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50"
                            >
                                <Plus size={14} /> Add Step
                            </button>
                        </div>

                        <div className="space-y-2">
                            {steps.length === 0 ? (
                                <p className="text-sm text-gray-400 italic">No steps yet. Add your first step to get started.</p>
                            ) : (
                                steps.map((step, idx) => (
                                    <div key={step.id} className="border border-gray-200 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setExpanded(expanded === idx ? null : idx)}
                                            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Step {idx + 1}</span>
                                                <span className="text-sm font-medium text-gray-900 capitalize">{step.step_type}</span>
                                                {step.message_text && <span className="text-sm text-gray-500 truncate">"{step.message_text.substring(0, 30)}"</span>}
                                            </div>
                                            {expanded === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>

                                        {expanded === idx && (
                                            <div className="px-4 py-4 bg-white space-y-3 border-t border-gray-100">
                                                <div>
                                                    <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Step Type</label>
                                                    <select
                                                        value={step.step_type}
                                                        onChange={(e) => handleUpdateStep(idx, { step_type: e.target.value as any })}
                                                        className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                    >
                                                        <option value="message">Message</option>
                                                        <option value="question">Question</option>
                                                        <option value="buttons">Button Choices</option>
                                                        <option value="tag">Auto Tag</option>
                                                        <option value="assign">Assign User</option>
                                                        <option value="stage">Update Stage</option>
                                                        <option value="template">Send Template</option>
                                                        <option value="end">End Flow</option>
                                                    </select>
                                                </div>

                                                {['message', 'question', 'end'].includes(step.step_type) && (
                                                    <div>
                                                        <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Message</label>
                                                        <textarea
                                                            value={step.message_text || ''}
                                                            onChange={(e) => handleUpdateStep(idx, { message_text: e.target.value })}
                                                            rows={2}
                                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                                            placeholder="Enter message text…"
                                                        />
                                                    </div>
                                                )}

                                                {step.step_type === 'buttons' && (
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Buttons</p>
                                                        <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                                                            <p className="text-xs text-gray-500">Add button choices (max 3 per step)</p>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                                    <button
                                                        onClick={() => handleRemoveStep(idx)}
                                                        className="flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                                                    >
                                                        <Trash2 size={13} /> Remove
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !name.trim() || steps.length === 0}
                        className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50"
                    >
                        <Save size={14} />
                        {saving ? 'Saving…' : 'Save Flow'}
                    </button>
                </div>
            </div>
        </div>
    );
}