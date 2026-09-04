import React, { useState, useMemo, useEffect } from 'react';
import { X, Tag, Plus, Trash2, Search, Check, AlertCircle } from 'lucide-react';
import getTagStyle, { DEFAULT_TAG_STYLE } from '@/lib/tagStyles';
import { toast } from 'react-toastify';

interface BulkTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPropertyIds: (number | string)[];
  knownTags: string[];
  propTags: Record<string, string[]>;
  onAddTags: (tags: string[]) => void;
  onRemoveTags: (tags: string[]) => void;
  isLoading?: boolean;
}

export const BulkTagModal: React.FC<BulkTagModalProps> = ({
  isOpen,
  onClose,
  selectedPropertyIds,
  knownTags,
  propTags,
  onAddTags,
  onRemoveTags,
  isLoading = false,
}) => {
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all currently applied tags across the selected properties
  const currentTagsMap = useMemo(() => {
    const map: Record<string, number> = {};
    selectedPropertyIds.forEach((id) => {
      const tags = propTags[String(id)] || [];
      tags.forEach((tag) => {
        const key = String(tag).trim();
        if (key) {
          map[key] = (map[key] || 0) + 1;
        }
      });
    });
    return map;
  }, [selectedPropertyIds, propTags]);

  const allAvailableTags = useMemo(() => {
    const base = (knownTags?.length ? knownTags : Object.keys(DEFAULT_TAG_STYLE))
      .map((t) => String(t).trim())
      .filter(Boolean);
    const uniq = Array.from(new Map(base.map((t) => [t.toLowerCase(), t])).values());
    return uniq.sort((a, b) => a.localeCompare(b));
  }, [knownTags]);

  // Reset selected tags when opening or changing mode
  useEffect(() => {
    if (isOpen) {
      setSelectedTags([]);
      setSearchQuery('');
    }
  }, [isOpen, mode]);

  // Filtered list based on search and mode
  const displayedTags = useMemo(() => {
    let list = allAvailableTags;

    if (mode === 'remove') {
      const activeInSelection = Object.keys(currentTagsMap);
      list = allAvailableTags.filter((t) =>
        activeInSelection.some((active) => active.toLowerCase() === t.toLowerCase())
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((t) => t.toLowerCase().includes(q));
    }

    return list;
  }, [allAvailableTags, mode, currentTagsMap, searchQuery]);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSelectAll = () => {
    setSelectedTags(displayedTags);
  };

  const handleClearAll = () => {
    setSelectedTags([]);
  };

  const handleApply = () => {
    if (selectedTags.length === 0) {
      toast.warn(`Please select at least one tag to ${mode}`);
      return;
    }

    if (mode === 'add') {
      onAddTags(selectedTags);
    } else {
      onRemoveTags(selectedTags);
    }
    onClose();
  };

  const handleCreateCustomTag = () => {
    const custom = searchQuery.trim();
    if (!custom) return;
    if (!selectedTags.includes(custom)) {
      setSelectedTags((prev) => [...prev, custom]);
    }
    setSearchQuery('');
  };

  const isAdd = mode === 'add';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isAdd ? 'bg-orange-100 text-[#E6761D]' : 'bg-rose-100 text-rose-600'
              }`}
            >
              <Tag size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {isAdd ? 'Add Tags in Bulk' : 'Remove Tags in Bulk'}
              </h3>
              <p className="text-xs text-slate-500">
                Applying to <span className="font-semibold text-slate-700">{selectedPropertyIds.length}</span> selected properties
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mode Selector (Add / Remove) */}
        <div className="p-4 pb-2">
          <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-xl gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode('add')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                isAdd
                  ? 'bg-white text-[#E6761D] shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus size={14} />
              <span>Add Tags</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('remove')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                !isAdd
                  ? 'bg-white text-rose-600 shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Trash2 size={14} />
              <span>Remove Tags</span>
            </button>
          </div>
        </div>

        {/* Search & Quick Controls */}
        <div className="px-4 py-2 flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={isAdd ? 'Search or type new tag...' : 'Search tags to remove...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && isAdd && searchQuery.trim()) {
                  e.preventDefault();
                  handleCreateCustomTag();
                }
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6761D]/20 focus:border-[#E6761D] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleSelectAll}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors whitespace-nowrap"
          >
            Select All
          </button>
          {selectedTags.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>

        {/* Custom tag add suggestion when searching in Add mode */}
        {isAdd && searchQuery.trim() && !displayedTags.some((t) => t.toLowerCase() === searchQuery.trim().toLowerCase()) && (
          <div className="px-4 pt-1">
            <button
              type="button"
              onClick={handleCreateCustomTag}
              className="w-full text-left px-3 py-1.5 bg-orange-50/80 hover:bg-orange-100/90 border border-orange-200/90 rounded-lg text-xs text-[#E6761D] font-bold flex items-center justify-between transition-colors"
            >
              <span>+ Add &ldquo;{searchQuery.trim()}&rdquo; as custom tag</span>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded font-normal text-slate-500">Press Enter</span>
            </button>
          </div>
        )}

        {/* Tag List / Grid */}
        <div className="flex-1 overflow-y-auto px-4 py-3 max-h-64 scrollbar-thin">
          {displayedTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {displayedTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                const style = getTagStyle(tag);
                const countOnSelected = currentTagsMap[tag] || 0;

                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? isAdd
                          ? 'bg-[#E6761D] text-white border-[#CC6A1A] shadow-sm ring-2 ring-orange-400/30'
                          : 'bg-rose-600 text-white border-rose-700 shadow-sm ring-2 ring-rose-400/30'
                        : `${style.bg} ${style.text} ${style.ring} hover:scale-[1.02] active:scale-95`
                    }`}
                  >
                    <span className="text-xs">
                      {isSelected ? <Check size={13} className="stroke-[3]" /> : '🏷️'}
                    </span>
                    <span className="capitalize">{tag}</span>

                    {/* Show occurrence count in remove mode */}
                    {!isAdd && countOnSelected > 0 && (
                      <span
                        className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                        }`}
                      >
                        {countOnSelected}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <AlertCircle size={22} className="text-slate-300 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-slate-600">
                {isAdd ? 'No tags found' : 'None of the selected properties currently have tags to remove'}
              </p>
              {isAdd && searchQuery && (
                <p className="text-[11px] text-slate-400 mt-1">
                  Press Enter to create &ldquo;{searchQuery}&rdquo; as a new tag.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
          <div className="text-xs font-semibold text-slate-600">
            {selectedTags.length > 0 ? (
              <span className={isAdd ? 'text-[#E6761D]' : 'text-rose-600'}>
                {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''} selected
              </span>
            ) : (
              <span className="text-slate-400">Select tags to proceed</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={selectedTags.length === 0 || isLoading}
              className={`px-5 py-2 text-xs font-extrabold text-white rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 ${
                isAdd
                  ? 'bg-gradient-to-r from-[#E6761D] to-[#CC6A1A] hover:shadow-md'
                  : 'bg-gradient-to-r from-rose-600 to-rose-700 hover:shadow-md'
              }`}
            >
              {isLoading
                ? 'Processing...'
                : isAdd
                ? `Add ${selectedTags.length ? selectedTags.length : ''} Tag${selectedTags.length > 1 ? 's' : ''}`
                : `Remove ${selectedTags.length ? selectedTags.length : ''} Tag${selectedTags.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkTagModal;
