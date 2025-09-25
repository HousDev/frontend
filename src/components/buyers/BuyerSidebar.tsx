// components/buyer/BuyerSidebar.tsx
import React from "react";
import {
  ArrowLeft,
  User,
  Building,
  FileText,
  CreditCard,
  Calculator,
  TrendingUp,
  Calendar,
  Bot,
  Heart,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface BuyerSidebarProps {
  buyer: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onShowPropertySuggestions: () => void;
  onShowEMICalculator: () => void;
}

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: Building },
  { id: "properties", label: "Property Search", icon: Building },
  { id: "shortlist", label: "My Shortlist", icon: Heart },
  { id: "visits", label: "Site Visits", icon: Calendar },
  { id: "loans", label: "Loan Center", icon: CreditCard },
  { id: "calculators", label: "Calculators", icon: Calculator },
  { id: "insights", label: "Market Insights", icon: TrendingUp },
  { id: "documents", label: "My Documents", icon: FileText },
  { id: "profile", label: "Profile", icon: User },
];

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString("en-IN")}`;
};

const BuyerSidebar: React.FC<BuyerSidebarProps> = ({
  buyer,
  activeTab,
  setActiveTab,
  onShowPropertySuggestions,
  onShowEMICalculator,
}) => {
  const { logout } = useAuth();

  return (
    <div className="w-80 shrink-0 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto scrollbar-hide">
      {/* Buyer Profile Summary */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {buyer.name.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-sm text-gray-900">
              {buyer.salutation} {buyer.name}
            </div>
            <div className="text-xs text-gray-600">
              {buyer.city}, {buyer.state}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Budget:</span>
            <span className="font-medium text-green-600">
              {formatCurrency(buyer.budget.min)} -{" "}
              {formatCurrency(buyer.budget.max)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Lead Score:</span>
            <span className="font-medium text-purple-600">
              {buyer.leadScore}/100
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-left mb-1 text-sm ${
                activeTab === tab.id
                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={16} />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2 text-sm">
        <button
          onClick={async () => {
            await logout();
            window.location.href = "/login";
          }}
          className="w-full flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Logout</span>
        </button>

        <button
          onClick={onShowPropertySuggestions}
          className="w-full flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all"
        >
          <Bot size={14} />
          <span>AI Property Search</span>
        </button>

        <button
          onClick={onShowEMICalculator}
          className="w-full flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Calculator size={14} />
          <span>EMI Calculator</span>
        </button>
      </div>
    </div>
  );
};

export default BuyerSidebar;
