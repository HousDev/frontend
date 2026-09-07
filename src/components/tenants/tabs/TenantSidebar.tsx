import React from "react";
import {
  BarChart3,
  Sparkles,
  Home,
  FileText,
  Building2,
  Calendar,
  Calculator,
  User,
  ArrowLeft,
  X,
  CreditCard,
  Wrench,
  MessageSquare,
} from "lucide-react";
import { Tenant } from "./types";

interface SidebarNavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface TenantSidebarProps {
  tenant: Tenant;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  matchedCount: number;
  enquiredCount?: number;
  visitsCount: number;
  onBack?: () => void;
  showMobileSidebar: boolean;
  setShowMobileSidebar: (show: boolean) => void;
}

export default function TenantSidebar({
  tenant,
  activeTab,
  setActiveTab,
  matchedCount,
  enquiredCount = 0,
  visitsCount,
  onBack,
  showMobileSidebar,
  setShowMobileSidebar,
}: TenantSidebarProps) {
  const sidebarNavItems: SidebarNavItem[] = [
    { id: "dashboard", label: "Tenant Dashboard", icon: BarChart3 },
    {
      id: "matched",
      label: `Property Matches (${matchedCount})`,
      icon: Building2,
    },
    {
      id: "enquired",
      label: `Enquired Properties (${enquiredCount})`,
      icon: MessageSquare,
    },
    { id: "linked", label: "Linked Lease Property", icon: Home },
    { id: "payments", label: "Rent Pay & Ledger", icon: CreditCard },
    { id: "maintenance", label: "Maintenance & Repairs", icon: Wrench },
    { id: "documents", label: "Lease & Doc Vault", icon: FileText },
    { id: "visits", label: `Site Visits (${visitsCount})`, icon: Calendar },
    { id: "calculators", label: "Rent Calculators", icon: Calculator },
    { id: "profile", label: "Profile", icon: User },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setShowMobileSidebar(false);
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white text-slate-800 border-r border-gray-200">
      {/* Brand & Tenant Header */}
      <div className="p-3.5 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="/logo.png"
            alt="Company Logo"
            className="h-10 w-auto object-contain"
          />
        </div>

        <button
          onClick={() => setShowMobileSidebar(false)}
          className="md:hidden p-1 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <X size={16} />
        </button>
      </div>

      {/* Sidebar Nav */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {sidebarNavItems.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${active
                  ? "bg-orange-50 text-orange-600 border border-orange-200 font-bold shadow-2xs"
                  : "text-gray-600 hover:bg-gray-50 hover:text-slate-900 font-medium"
                }`}
            >
              <Icon
                size={14}
                className={active ? "text-orange-600" : "text-gray-400"}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Back Button */}
      <div className="p-3 border-t border-gray-200 bg-gray-50/50">
        {onBack && (
          <button
            onClick={onBack}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-bold hover:bg-gray-100 transition-colors text-xs shadow-2xs"
          >
            <ArrowLeft size={13} />
            <span>Back to CRM List</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col h-full">
        {navContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setShowMobileSidebar(false)}
          />
          <aside className="relative z-10 w-64 max-w-[80vw] h-full shadow-xl">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
