import { useState } from 'react';
import { Search, RefreshCw, MessageSquare, SlidersHorizontal, X, Calendar, CheckCircle } from 'lucide-react';
import type { WhatsAppConversation } from '../../types';
import { formatRelativeTime, getInitials, truncate } from '../../lib/formatters';
import type { InboxFilter } from '../../hooks/useInbox';

const STAGE_DOT: Record<string, string> = {
    New: 'bg-blue-500', Contacted: 'bg-yellow-500', Qualified: 'bg-emerald-500',
    'Site Visit': 'bg-orange-500', Closed: 'bg-gray-400', Lost: 'bg-red-500',
};

const PRIORITY_TAGS = ['Buyer', 'Seller', 'Investor', 'Hot Lead', 'VIP'];

const STAGES = ['New', 'Contacted', 'Qualified', 'Site Visit', 'Closed', 'Lost'];
const DATE_PRESETS = ['Today', 'This Week', 'This Month'] as const;

export interface AdvancedFilter {
    datePreset: typeof DATE_PRESETS[number] | null;
    dateFrom: string;
    dateTo: string;
    stages: string[];
    hasUnread: boolean | null;
    tagSearch: string;
}

const emptyAdvanced: AdvancedFilter = {
    datePreset: null, dateFrom: '', dateTo: '', stages: [], hasUnread: null, tagSearch: '',
};

interface Props {
    conversations: WhatsAppConversation[];
    loading: boolean;
    selectedId: string | null;
    filter: InboxFilter;
    search: string;
    onSelect: (conv: WhatsAppConversation) => void;
    onFilterChange: (f: InboxFilter) => void;
    onSearchChange: (s: string) => void;
    onRefresh: () => void;
}

export default function ConversationList({
    conversations, loading, selectedId, filter, search,
    onSelect, onFilterChange, onSearchChange, onRefresh,
}: Props) {
    const [showFilter, setShowFilter] = useState(false);
    const [advanced, setAdvanced] = useState<AdvancedFilter>(emptyAdvanced);
    const [pendingFilter, setPendingFilter] = useState<AdvancedFilter>(emptyAdvanced);

    const hasActiveFilter = advanced.datePreset !== null || advanced.dateFrom || advanced.dateTo
        || advanced.stages.length > 0 || advanced.hasUnread !== null || advanced.tagSearch;

    // ✅ Calculate counts for filter tabs (WhatsApp style)
    const totalCount = conversations.length;
    const unreadCount = conversations.filter(c => c.unread_count > 0).length;
    const newCount = conversations.filter(c => c.contact?.stage === 'New').length;
    const assignedCount = conversations.filter(c => c.assigned_to).length;
    const buyerCount = conversations.filter(c => {
        const tags = c.contact?.tags || [];
        return tags.some((t: any) => t.name?.toLowerCase() === 'buyer');
    }).length;
    const sellerCount = conversations.filter(c => {
        const tags = c.contact?.tags || [];
        return tags.some((t: any) => t.name?.toLowerCase() === 'seller');
    }).length;

    const applyAdvanced = (f: AdvancedFilter) => {
        setAdvanced(f);
        setShowFilter(false);
    };

    const filteredConversations = conversations.filter((conv) => {
        if (advanced.stages.length > 0) {
            const stage = conv.contact?.stage || 'New';
            if (!advanced.stages.includes(stage)) return false;
        }
        if (advanced.hasUnread === true && !conv.unread_count) return false;
        if (advanced.hasUnread === false && conv.unread_count > 0) return false;
        if (advanced.tagSearch) {
            const tags = conv.contact?.tags || [];
            const match = tags.some((t) => t.name.toLowerCase().includes(advanced.tagSearch.toLowerCase()));
            if (!match) return false;
        }
        if (advanced.datePreset || advanced.dateFrom || advanced.dateTo) {
            const msgDate = conv.last_message_at ? new Date(conv.last_message_at) : null;
            if (!msgDate) return false;
            const now = new Date();
            if (advanced.datePreset === 'Today') {
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                if (msgDate < today) return false;
            } else if (advanced.datePreset === 'This Week') {
                const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
                if (msgDate < weekAgo) return false;
            } else if (advanced.datePreset === 'This Month') {
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                if (msgDate < monthStart) return false;
            }
            if (advanced.dateFrom && msgDate < new Date(advanced.dateFrom)) return false;
            if (advanced.dateTo) {
                const to = new Date(advanced.dateTo); to.setDate(to.getDate() + 1);
                if (msgDate > to) return false;
            }
        }
        return true;
    });

    const openFilter = () => {
        setPendingFilter({ ...advanced });
        setShowFilter(true);
    };

    return (
        <div className="flex flex-col h-full w-80 bg-white border-r border-gray-200 shrink-0 relative">
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-gray-900 text-sm">Conversations</h2>
                        {filteredConversations.length > 0 && (
                            <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">
                                {filteredConversations.length}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={openFilter}
                            className={`relative p-1.5 rounded-lg transition-colors ${hasActiveFilter ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                            title="Advanced filters"
                        >
                            <SlidersHorizontal size={14} />
                            {hasActiveFilter && (
                                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full" />
                            )}
                        </button>
                        <button onClick={onRefresh} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors" title="Refresh">
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>

                <div className="relative mb-3">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search name or phone..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                </div>

                {/* ✅ WhatsApp Style Filter Tabs with Counts */}
                <div className="flex gap-1 overflow-x-auto whitespace-nowrap scrollbar-hide">

                    {/* All Tab */}
                    <button
                        onClick={() => onFilterChange('all')}
                        className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all shrink-0 ${filter === 'all'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        All
                        <span className="ml-1 text-[9px] opacity-80">({totalCount})</span>
                    </button>

                    {/* Unread Tab */}
                    <button
                        onClick={() => onFilterChange('unread')}
                        className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all flex items-center gap-1 shrink-0 ${filter === 'unread'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Unread
                        {unreadCount > 0 ? (
                            <span className="bg-emerald-500 text-white text-[9px] px-1 py-0.5 rounded-full font-bold min-w-[16px] text-center">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        ) : (
                            <span className="text-[9px] text-gray-400">(0)</span>
                        )}
                    </button>

                    {/* Assigned Tab */}
                    <button
                        onClick={() => onFilterChange('assigned')}
                        className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all shrink-0 ${filter === 'assigned'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Assigned
                        <span className="ml-1 text-[9px] opacity-80">({assignedCount})</span>
                    </button>

                    {/* Buyer Tab */}
                    <button
                        onClick={() => onFilterChange('buyer')}
                        className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all shrink-0 ${filter === 'buyer'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Buyer
                        <span className="ml-1 text-[9px] opacity-80">({buyerCount})</span>
                    </button>

                    {/* Seller Tab */}
                    <button
                        onClick={() => onFilterChange('seller')}
                        className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all shrink-0 ${filter === 'seller'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Seller
                        <span className="ml-1 text-[9px] opacity-80">({sellerCount})</span>
                    </button>
                </div>
                {hasActiveFilter && (
                    <div className="flex items-center justify-between mt-2 px-1">
                        <span className="text-[10px] text-emerald-600 font-medium">Filters active</span>
                        <button
                            onClick={() => setAdvanced(emptyAdvanced)}
                            className="text-[10px] text-gray-400 hover:text-red-500 flex items-center gap-0.5 transition-colors"
                        >
                            <X size={9} /> Clear
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading && filteredConversations.length === 0 ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
                        <MessageSquare size={28} className="opacity-30" />
                        <p className="text-sm">{hasActiveFilter ? 'No matches for current filters' : 'No conversations'}</p>
                    </div>
                ) : (
                    filteredConversations.map((conv) => {
                        const contact = conv.contact;
                        const isSelected = conv.id === selectedId;
                        const hasUnread = conv.unread_count > 0;
                        const stage = contact?.stage || 'New';
                        const tags = contact?.tags || [];
                        const priorityTag = tags.find((t) => PRIORITY_TAGS.includes(t.name));
                        const otherTags = tags.filter((t) => !PRIORITY_TAGS.includes(t.name)).slice(0, 1);
                        const displayName = contact?.name || contact?.phone || 'Unknown';
                        const initials = getInitials(displayName);

                        return (
                            <button
                                key={conv.id}
                                onClick={() => onSelect(conv)}
                                className={`w-full flex items-start gap-3 px-4 py-3 border-b border-gray-50 text-left transition-all ${isSelected ? 'bg-emerald-50 border-l-2 border-l-emerald-500' : 'hover:bg-gray-50 border-l-2 border-l-transparent'
                                    }`}
                            >
                                <div className="relative shrink-0 mt-0.5">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${isSelected ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                                        {initials}
                                    </div>
                                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${STAGE_DOT[stage] || 'bg-gray-400'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-1 mb-0.5">
                                        <span className={`text-sm font-semibold truncate leading-tight ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>{displayName}</span>
                                        <span className="text-[10px] text-gray-400 shrink-0 mt-0.5 leading-tight">{formatRelativeTime(conv.last_message_at)}</span>
                                    </div>
                                    <p className={`text-xs leading-tight truncate mb-1 ${hasUnread ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                                        {truncate(conv.last_message || '', 38) || 'No messages yet'}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 flex-wrap">
                                            {priorityTag && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                                                    style={{ backgroundColor: priorityTag.color + '22', color: priorityTag.color }}>
                                                    {priorityTag.name}
                                                </span>
                                            )}
                                            {otherTags.map((tag) => (
                                                <span key={tag.id} className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                                                    style={{ backgroundColor: tag.color + '15', color: tag.color }}>
                                                    {tag.name}
                                                </span>
                                            ))}
                                        </div>
                                        {hasUnread && (
                                            <span className="shrink-0 min-w-[18px] h-[18px] bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none px-1">
                                                {conv.unread_count > 99 ? '99+' : conv.unread_count}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>

            {showFilter && (
                <FilterModal
                    value={pendingFilter}
                    onChange={setPendingFilter}
                    onApply={() => applyAdvanced(pendingFilter)}
                    onClear={() => { setPendingFilter(emptyAdvanced); applyAdvanced(emptyAdvanced); }}
                    onClose={() => setShowFilter(false)}
                />
            )}
        </div>
    );
}

function FilterModal({
    value, onChange, onApply, onClear, onClose,
}: {
    value: AdvancedFilter;
    onChange: (f: AdvancedFilter) => void;
    onApply: () => void;
    onClear: () => void;
    onClose: () => void;
}) {
    const toggleStage = (s: string) => {
        onChange({
            ...value,
            stages: value.stages.includes(s) ? value.stages.filter((x) => x !== s) : [...value.stages, s],
        });
    };

    return (
        <div className="absolute inset-0 z-40 flex flex-col bg-white border-r border-gray-200">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
                <div>
                    <h3 className="font-bold text-gray-900 text-sm">Filter Conversations</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Narrow down your inbox view</p>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
                    <X size={15} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
                <FilterSection title="Date" icon={Calendar}>
                    <div className="flex gap-2 flex-wrap">
                        {DATE_PRESETS.map((p) => (
                            <button key={p}
                                onClick={() => onChange({ ...value, datePreset: value.datePreset === p ? null : p, dateFrom: '', dateTo: '' })}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${value.datePreset === p ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 text-gray-600 hover:border-emerald-300'
                                    }`}>
                                {p}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                            <label className="text-[10px] text-gray-400 font-medium block mb-1">From</label>
                            <input type="date" value={value.dateFrom}
                                onChange={(e) => onChange({ ...value, dateFrom: e.target.value, datePreset: null })}
                                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                        </div>
                        <div>
                            <label className="text-[10px] text-gray-400 font-medium block mb-1">To</label>
                            <input type="date" value={value.dateTo}
                                onChange={(e) => onChange({ ...value, dateTo: e.target.value, datePreset: null })}
                                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                        </div>
                    </div>
                </FilterSection>

                <FilterSection title="Pipeline Stage">
                    <div className="flex flex-wrap gap-1.5">
                        {STAGES.map((s) => (
                            <button key={s} onClick={() => toggleStage(s)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${value.stages.includes(s) ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 text-gray-600 hover:border-emerald-300'
                                    }`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </FilterSection>

                <FilterSection title="Read Status">
                    <div className="flex gap-2">
                        {[
                            { label: 'All', val: null },
                            { label: 'Unread only', val: true },
                            { label: 'Read only', val: false },
                        ].map((opt) => (
                            <button key={String(opt.val)}
                                onClick={() => onChange({ ...value, hasUnread: opt.val })}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${value.hasUnread === opt.val ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 text-gray-600 hover:border-emerald-300'
                                    }`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </FilterSection>

                <FilterSection title="Filter by Tag">
                    <div className="relative">
                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={value.tagSearch}
                            onChange={(e) => onChange({ ...value, tagSearch: e.target.value })}
                            placeholder="e.g. Buyer, Hot Lead..."
                            className="w-full pl-7 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </FilterSection>
            </div>

            <div className="px-4 py-3 border-t border-gray-100 space-y-2 shrink-0">
                <button onClick={onApply}
                    className="w-full py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                    <CheckCircle size={14} /> Apply Filters
                </button>
                <button onClick={onClear}
                    className="w-full py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    Clear All
                </button>
            </div>
        </div>
    );
}

function FilterSection({ title, icon: Icon, children }: { title: string; icon?: React.ElementType; children: React.ReactNode }) {
    return (
        <div>
            <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                {Icon && <Icon size={12} className="text-gray-400" />}
                {title}
            </p>
            {children}
        </div>
    );
}