// src/components/inbox/ContactInfo.tsx
import { useState } from 'react';
import {
    Phone, Mail, MapPin, DollarSign, User, ChevronDown, ChevronUp,
    Plus, X, StickyNote, Building2, AlertCircle, UserPlus, CheckCircle, Tag,
} from 'lucide-react';
import type { WhatsAppContact, CrmUser, Tag as TagType } from '../../types';
import { formatCurrency, formatRelativeTime } from '../../lib/formatters';
import { notificationStore } from '../../lib/notifications';

const TAG_COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
];

const STAGES = ['New', 'Contacted', 'Qualified', 'Site Visit', 'Closed', 'Lost'] as const;
const STAGE_COLORS: Record<string, string> = {
    New: 'bg-blue-100 text-blue-700',
    Contacted: 'bg-yellow-100 text-yellow-700',
    Qualified: 'bg-emerald-100 text-emerald-700',
    'Site Visit': 'bg-purple-100 text-purple-700',
    Closed: 'bg-gray-100 text-gray-700',
    Lost: 'bg-red-100 text-red-700',
};

interface Props {
    contact: WhatsAppContact | null;
    users: CrmUser[];
    allTags: TagType[];
    onUpdateStage: (stage: string) => void;
    onAssign: (userId: string) => void;
    onAddTag: (tagId: string) => void;
    onRemoveTag: (tagId: string) => void;
    onUpdateNotes: (notes: string) => void;
    conversationNotes: import('../../types').ConversationNote[];
    onAddNote: (body: string) => void;
    onTagCreated?: (tag: TagType) => void;
}

export default function ContactInfo({
    contact,
    users,
    allTags,
    onUpdateStage,
    onAssign,
    onAddTag,
    onRemoveTag,
    onUpdateNotes,
    conversationNotes,
    onAddNote,
    onTagCreated,
}: Props) {
    const [showTagPicker, setShowTagPicker] = useState(false);
    const [tagSearch, setTagSearch] = useState('');
    const [creatingTag, setCreatingTag] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
    const [savingTag, setSavingTag] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [notesExpanded, setNotesExpanded] = useState(true);
    const [detailsExpanded, setDetailsExpanded] = useState(true);
    const [creatingLead, setCreatingLead] = useState(false);
    const [leadCreated, setLeadCreated] = useState(false);

    // Simulate creating a lead without Supabase
    const handleCreateLead = async () => {
        if (!contact || creatingLead) return;
        setCreatingLead(true);
        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // If stage is 'New', update it to 'Contacted' (simulate lead creation)
            if (contact.stage === 'New') {
                onUpdateStage('Contacted');
            }

            // Simulate adding a "New Lead" tag (if needed, you can add a tag with id 'new_lead')
            // For demonstration, we'll just check if a tag named 'New Lead' exists in allTags
            const newLeadTag = allTags.find(t => t.name === 'New Lead');
            if (newLeadTag) {
                onAddTag(newLeadTag.id);
            }

            notificationStore.push(
                'lead',
                'Lead Created',
                `${contact.name} · ${contact.phone} is now a lead in your CRM.`,
                { label: 'View Inbox', page: 'inbox' }
            );
            setLeadCreated(true);
            setTimeout(() => setLeadCreated(false), 4000);
        } catch (error) {
            notificationStore.push('error', 'Failed', 'Could not create lead. Try again.');
        } finally {
            setCreatingLead(false);
        }
    };

    if (!contact) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400">
                <p className="text-sm">Select a conversation</p>
            </div>
        );
    }

    const contactTags = contact.tags || [];
    const filteredAvailableTags = allTags
        .filter((t) => !contactTags.some((ct) => ct.id === t.id))
        .filter((t) => !tagSearch || t.name.toLowerCase().includes(tagSearch.toLowerCase()));

    const handleSaveNewTag = async () => {
        if (!newTagName.trim() || savingTag) return;
        setSavingTag(true);
        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 300));

            // Create a new tag object
            const newTag: TagType = {
                id: `tag_${Date.now()}`,
                name: newTagName.trim(),
                color: newTagColor,
            };

            // Notify parent component about the new tag
            onTagCreated?.(newTag);
            // Add the tag to the current contact
            onAddTag(newTag.id);

            setNewTagName('');
            setNewTagColor(TAG_COLORS[0]);
            setCreatingTag(false);
            setShowTagPicker(false);
        } catch (error) {
            console.error('Failed to create tag', error);
        } finally {
            setSavingTag(false);
        }
    };

    const handleAddNote = () => {
        if (!noteText.trim()) return;
        onAddNote(noteText.trim());
        setNoteText('');
    };

    return (
        <div className="flex flex-col h-full overflow-y-auto text-sm">
            <div className="px-4 py-5 border-b border-gray-100 text-center">
                <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-2">
                    {contact.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                <p className="text-gray-500 text-xs mt-0.5">{contact.phone}</p>
                <div className="mt-2 flex flex-col items-center gap-2">
                    <select
                        value={contact.stage}
                        onChange={(e) => onUpdateStage(e.target.value)}
                        className={`text-xs font-semibold px-3 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 ${STAGE_COLORS[contact.stage]}`}
                    >
                        {STAGES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleCreateLead}
                        disabled={creatingLead}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${leadCreated
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            } disabled:opacity-50`}
                    >
                        {creatingLead ? (
                            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        ) : leadCreated ? (
                            <CheckCircle size={12} />
                        ) : (
                            <UserPlus size={12} />
                        )}
                        {leadCreated ? 'Lead Created!' : 'Create Lead in CRM'}
                    </button>
                </div>
            </div>

            <div className="px-4 py-3 border-b border-gray-100">
                <button
                    onClick={() => setDetailsExpanded((v) => !v)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
                >
                    <span>Contact Details</span>
                    {detailsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {detailsExpanded && (
                    <div className="space-y-2">
                        <DetailRow icon={<Phone size={13} />} value={contact.phone} />
                        {contact.email && <DetailRow icon={<Mail size={13} />} value={contact.email} />}
                        {contact.preferred_location && (
                            <DetailRow icon={<MapPin size={13} />} value={contact.preferred_location} />
                        )}
                        {contact.budget_max > 0 && (
                            <DetailRow
                                icon={<DollarSign size={13} />}
                                value={`${formatCurrency(contact.budget_min)} – ${formatCurrency(contact.budget_max)}`}
                            />
                        )}
                        {contact.property_type && (
                            <DetailRow icon={<Building2 size={13} />} value={contact.property_type} />
                        )}
                        <DetailRow
                            icon={<AlertCircle size={13} />}
                            value={`Source: ${contact.source}`}
                        />
                        <DetailRow
                            icon={<User size={13} />}
                            value={`Joined: ${formatRelativeTime(contact.created_at)}`}
                        />
                    </div>
                )}
            </div>

            <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Assigned To</p>
                <select
                    value={contact.assigned_to || ''}
                    onChange={(e) => onAssign(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                </select>
            </div>

            <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <Tag size={11} /> Tags
                    </p>
                    <button
                        onClick={() => { setShowTagPicker((v) => !v); setCreatingTag(false); setTagSearch(''); }}
                        className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="Add tag"
                    >
                        <Plus size={14} />
                    </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2">
                    {contactTags.map((tag) => (
                        <span
                            key={tag.id}
                            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium"
                            style={{ backgroundColor: tag.color + '22', color: tag.color }}
                        >
                            {tag.name}
                            <button
                                onClick={() => onRemoveTag(tag.id)}
                                className="hover:opacity-70 ml-0.5 transition-opacity"
                            >
                                <X size={9} />
                            </button>
                        </span>
                    ))}
                    {contactTags.length === 0 && (
                        <button
                            onClick={() => setShowTagPicker(true)}
                            className="text-xs text-gray-400 hover:text-emerald-600 transition-colors"
                        >
                            + Add tags to this contact
                        </button>
                    )}
                </div>

                {showTagPicker && (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        {!creatingTag ? (
                            <>
                                <div className="p-2 border-b border-gray-100">
                                    <input
                                        value={tagSearch}
                                        onChange={(e) => setTagSearch(e.target.value)}
                                        placeholder="Search tags..."
                                        className="w-full text-xs px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        autoFocus
                                    />
                                </div>
                                <div className="p-2 max-h-36 overflow-y-auto">
                                    {filteredAvailableTags.length === 0 ? (
                                        <p className="text-xs text-gray-400 text-center py-2">
                                            {tagSearch ? `No tags matching "${tagSearch}"` : 'All tags already added'}
                                        </p>
                                    ) : (
                                        <div className="flex flex-wrap gap-1">
                                            {filteredAvailableTags.map((tag) => (
                                                <button
                                                    key={tag.id}
                                                    onClick={() => { onAddTag(tag.id); setShowTagPicker(false); setTagSearch(''); }}
                                                    className="text-xs px-2.5 py-1 rounded-full font-medium hover:opacity-80 transition-opacity"
                                                    style={{ backgroundColor: tag.color + '22', color: tag.color }}
                                                >
                                                    {tag.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="p-2 border-t border-gray-100">
                                    <button
                                        onClick={() => { setCreatingTag(true); setNewTagName(tagSearch); }}
                                        className="w-full text-xs text-emerald-600 font-medium hover:bg-emerald-50 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                                    >
                                        <Plus size={11} /> Create new tag
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="p-3 space-y-2">
                                <p className="text-xs font-semibold text-gray-600">Create Custom Tag</p>
                                <input
                                    value={newTagName}
                                    onChange={(e) => setNewTagName(e.target.value)}
                                    placeholder="Tag name"
                                    className="w-full text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveNewTag()}
                                />
                                <div>
                                    <p className="text-[10px] text-gray-400 mb-1">Color</p>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {TAG_COLORS.map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => setNewTagColor(c)}
                                                className={`w-5 h-5 rounded-full transition-transform ${newTagColor === c ? 'scale-125 ring-2 ring-offset-1' : 'hover:scale-110'}`}
                                                style={{ backgroundColor: c, '--tw-ring-color': c } as React.CSSProperties}
                                            />
                                        ))}
                                    </div>
                                </div>
                                {newTagName && (
                                    <div className="flex items-center gap-1">
                                        <span className="text-[10px] text-gray-400">Preview:</span>
                                        <span
                                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                                            style={{ backgroundColor: newTagColor + '22', color: newTagColor }}
                                        >
                                            {newTagName}
                                        </span>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveNewTag}
                                        disabled={!newTagName.trim() || savingTag}
                                        className="flex-1 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-40 transition-colors"
                                    >
                                        {savingTag ? 'Creating...' : 'Create & Add'}
                                    </button>
                                    <button
                                        onClick={() => setCreatingTag(false)}
                                        className="px-3 py-1.5 border border-gray-200 text-xs text-gray-500 rounded-lg hover:bg-gray-50"
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="px-4 py-3">
                <button
                    onClick={() => setNotesExpanded((v) => !v)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
                >
                    <span>Internal Notes ({conversationNotes.length})</span>
                    {notesExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {notesExpanded && (
                    <>
                        <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                            {conversationNotes.length === 0 ? (
                                <p className="text-xs text-gray-400 italic">No internal notes yet</p>
                            ) : (
                                conversationNotes.map((note) => (
                                    <div key={note.id} className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                                        <p className="text-xs text-gray-700 whitespace-pre-wrap">{note.body}</p>
                                        <p className="text-[10px] text-gray-400 mt-1">
                                            {note.author?.name || 'You'} · {formatRelativeTime(note.created_at)}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="flex gap-2">
                            <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Add internal note…"
                                rows={2}
                                className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                            />
                            <button
                                onClick={handleAddNote}
                                disabled={!noteText.trim()}
                                className="px-3 py-2 bg-amber-400 text-white rounded-lg text-xs font-semibold hover:bg-amber-500 disabled:opacity-40 self-end"
                            >
                                <StickyNote size={13} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function DetailRow({ icon, value }: { icon: React.ReactNode; value: string }) {
    return (
        <div className="flex items-center gap-2 text-gray-600">
            <span className="text-gray-400 shrink-0">{icon}</span>
            <span className="text-xs truncate">{value}</span>
        </div>
    );
}