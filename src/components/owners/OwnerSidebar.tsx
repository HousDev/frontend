import React from 'react';
import {
  Home, Building2, MessageSquare, Calendar, FileText,
  DollarSign, User, ArrowLeft, LogOut, Shield, ChevronRight, X
} from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  icon: any;
  badge?: string | number;
}

interface OwnerSidebarProps {
  owner: any;
  derivedUsername: string;
  activeTab: string;
  tabs: TabItem[];
  isOwnerUser: boolean;
  onSelectTab: (tabId: string) => void;
  onBack: () => void;
}

export const OwnerSidebar: React.FC<OwnerSidebarProps> = ({
  owner,
  derivedUsername,
  activeTab,
  tabs,
  isOwnerUser,
  onSelectTab,
  onBack,
}) => {
  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col h-full bg-white text-slate-800 border-r border-gray-200">
      {/* 🏷️ Owner Brand & Profile Header */}
      <div className="p-3.5 border-b border-gray-100 flex items-center gap-2.5 bg-slate-50/50">
        <div className="w-9 h-9 rounded-lg bg-orange-500 text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
          {owner?.name?.charAt(0)?.toUpperCase() || 'O'}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-slate-900 text-xs truncate leading-tight">
            {owner?.name || 'Property Owner'}
          </h2>
          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
            <span className="text-[9px] font-bold text-orange-600">
              OWN{String(owner?.id || '1').padStart(4, '0')}
            </span>
            <span className="text-[9px] font-mono font-bold text-slate-600 bg-slate-200/80 px-1 py-0.2 rounded">
              @{derivedUsername}
            </span>
          </div>
        </div>
      </div>

      {/* 🧭 Vertical Navigation Items */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {tabs.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all cursor-pointer ${
                active
                  ? 'bg-orange-50 text-orange-600 border border-orange-200 font-bold shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Icon size={14} className={active ? 'text-orange-600' : 'text-gray-400'} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[8px] font-black ${
                    active ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-800'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 🚪 Back Actions Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50/70 space-y-1.5">
        <button
          onClick={onBack}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-bold hover:bg-gray-100 transition-colors text-xs shadow-2xs cursor-pointer"
        >
          <ArrowLeft size={13} />
          <span>{isOwnerUser ? 'Back to Properties' : 'Back to Owners'}</span>
        </button>
      </div>
    </aside>
  );
};

export default OwnerSidebar;
