import React, { useEffect, useState, useMemo, useRef } from 'react';
import { ArrowLeft, User, Building, FileText, SlidersHorizontal, CreditCard, Calculator, TrendingUp, Target, Bot, Calendar, MapPin,  Eye, Bookmark, ExternalLink, Activity, BarChart3, X, Menu, LogOut, Share2 } from 'lucide-react';
import PropertySuggestionModal from './PropertySuggestionModal';
import LoanApplicationModal from './LoanApplicationModal';
import EMICalculatorModal from './EMICalculatorModal';
import PropertyMatchModal from './PropertyMatchModal';
import VisitModal from './VisitModal';
import { useProperties } from '@/hooks/properties';
import { useAuth } from '@/contexts/AuthContext';
import ShareModal from '@/pages/public/ShareModal';
import { toast } from 'react-toastify';
import { buyerSavedAPI, BuyerSavedWithProperty } from '@/lib/buyerSavedPropertiesAPI';
import propertyTagsAPI from '@/lib/propertyTagsAPI';
import { getTagStyle, type TagTone } from '@/lib/tagStyles';
import ShortlistTab from './buyeraccountcomponents/ShortlistTab';
import VisitsTab from './buyeraccountcomponents/VisitsTab';
import LoanCenterTab from './buyeraccountcomponents/LoanCenterTab';
import CalculatorsTab from './buyeraccountcomponents/CalculatorsTab';
import MarketInsightsTab from './buyeraccountcomponents/MarketInsightsTab';
import MyDocumentsTab from './buyeraccountcomponents/MyDocumentsTab';
import ProfileTab from './buyeraccountcomponents/ProfileTab';

const BuyerAccountPage = ({ buyer, onBack, onUpdateBuyer }: any) => {
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSidebar, setShowSidebar] = useState(false);

  const [showPropertySuggestions, setShowPropertySuggestions] = useState(false);
  const [showLoanApplication, setShowLoanApplication] = useState(false);
  const [showEMICalculator, setShowEMICalculator] = useState(false);
  const [showPropertyMatch, setShowPropertyMatch] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);

  const sidebarRef = useRef<HTMLDivElement | null>(null);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setShowSidebar(false);
    if (showSidebar) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showSidebar]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!showSidebar) return;
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setShowSidebar(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSidebar]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'properties', label: 'Property Search', icon: Building },
    { id: 'shortlist', label: 'My Shortlist', icon: Bookmark },
    { id: 'visits', label: 'Site Visits', icon: Calendar },
    { id: 'loans', label: 'Loan Center', icon: CreditCard },
    { id: 'calculators', label: 'Calculators', icon: Calculator },
    { id: 'insights', label: 'Market Insights', icon: TrendingUp },
    { id: 'documents', label: 'My Documents', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="h-screen w-full bg-gray-50 flex overflow-hidden relative">
      {/* Sidebar (desktop always visible) */}
      <aside className="hidden md:flex w-80 shrink-0 bg-white border-r flex-col h-full">
        {/* Sidebar content */}
        <SidebarContent
          buyer={buyer}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          logout={logout}
          setShowPropertySuggestions={setShowPropertySuggestions}
          setShowEMICalculator={setShowEMICalculator}
        />
      </aside>

      {/* Mobile Drawer + Overlay */}
      {showSidebar && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity"
            onClick={() => setShowSidebar(false)}
          />
          <div
            ref={sidebarRef}
            className={`absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-white border-r shadow-xl transform transition-transform duration-300 ${showSidebar ? 'translate-x-0' : '-translate-x-full'
              } relative`}
          >
            <button
              className="absolute top-2 right-2 p-2 rounded-md hover:bg-gray-100"
              onClick={() => setShowSidebar(false)}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            <SidebarContent
              buyer={buyer}
              activeTab={activeTab}
              setActiveTab={(id) => {
                setActiveTab(id);
                setShowSidebar(false);
              }}
              logout={logout}
              setShowPropertySuggestions={setShowPropertySuggestions}
              setShowEMICalculator={setShowEMICalculator}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 h-full flex flex-col">
        {/* Welcome Section */}
        <div className="bg-[#0b3856] text-[#E6761D]">
          <header className="sticky top-0 z-30 bg-[#0b3856] hover:bg-[#0c3854] px-4 md:px-6 py-4 transition-colors">
            <div className="flex items-center justify-between">
              {/* Left: Hamburger + Titles */}
              <div className="flex items-center gap-3">
                {/* Mobile menu button */}
                <button
                  onClick={() => setShowSidebar(true)}
                  className="p-2 rounded-lg bg-white/90 text-[#0b3856] hover:bg-white transition-colors md:hidden"
                  aria-label="Open menu"
                >
                  <Menu size={20} />
                </button>

                <div>
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#E6761D] leading-tight truncate">
                    Welcome, {buyer.salutation} {buyer.name}!
                  </h2>
                  <p className="text-xs text-white">
                    Your personalized property search dashboard
                  </p>
                  <h2 className="flex gap-x-2 md:gap-x-3 gap-y-0.5 text-[11px] sm:text-xs md:text-sm text-[#E6761D] font-bold mt-1">
                    Buyer Account
                  </h2>
                </div>
              </div>

              {/* Right: Profile Score */}
              <div className="text-right space-y-1">
                {/* Visit Website button */}
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E6761D] text-white rounded-lg hover:bg-[#CC6A1A] transition-colors text-xs"
                  title="Open public property page"
                  onClick={() => window.open('http://investordeal.in/', '_blank')}
                >
                  <ExternalLink size={14} />
                  <span>Visit Website</span>
                </button>

                <div className="text-xl font-bold text-[#E6761D]">
                  {buyer.leadScore || "-"}
                </div>
                <div className="text-xs text-white">Profile Score</div>
              </div>
            </div>
          </header>
        </div>

        {/* Tabs Content */}
        <main className="flex-1 overflow-y-auto text-sm">
          {activeTab === 'dashboard' && <DashboardTab buyer={buyer} />}
          {activeTab === 'properties' && (
            <PropertySearchTab
              buyer={buyer}
              onShowPropertySuggestions={() => setShowPropertySuggestions(true)}
              onShowPropertyMatch={() => setShowPropertyMatch(true)}
            />
          )}
          {activeTab === 'shortlist' && <ShortlistTab buyer={buyer} />}
          {activeTab === 'visits' && (
            <VisitsTab buyer={buyer} onScheduleVisit={() => setShowVisitModal(true)} />
          )}
          {activeTab === 'loans' && (
            <LoanCenterTab buyer={buyer} onShowLoanApplication={() => setShowLoanApplication(true)} />
          )}
          {activeTab === 'calculators' && (
            <CalculatorsTab buyer={buyer} onShowEMICalculator={() => setShowEMICalculator(true)} />
          )}
          {activeTab === 'insights' && <MarketInsightsTab buyer={buyer} />}
          {activeTab === 'documents' && <MyDocumentsTab buyer={buyer} />}
          {activeTab === 'profile' && <ProfileTab buyer={buyer} onUpdateBuyer={onUpdateBuyer} />}
        </main>
      </div>

      {/* Modals */}
      {showPropertySuggestions && (
        <PropertySuggestionModal
          isOpen={showPropertySuggestions}
          onClose={() => setShowPropertySuggestions(false)}
          buyer={buyer}
        />
      )}
      {showLoanApplication && (
        <LoanApplicationModal
          isOpen={showLoanApplication}
          onClose={() => setShowLoanApplication(false)}
          buyer={buyer}
          onUpdateBuyer={onUpdateBuyer}
        />
      )}
      {showEMICalculator && (
        <EMICalculatorModal
          isOpen={showEMICalculator}
          onClose={() => setShowEMICalculator(false)}
          buyer={buyer}
        />
      )}
      {showPropertyMatch && (
        <PropertyMatchModal
          isOpen={showPropertyMatch}
          onClose={() => setShowPropertyMatch(false)}
          buyer={buyer}
        />
      )}
      {showVisitModal && (
        <VisitModal
          isOpen={showVisitModal}
          onClose={() => setShowVisitModal(false)}
          buyer={buyer}
          onSave={(visitData: any) => {
      
            setShowVisitModal(false);
          }}
        />
      )}
    </div>
  );
};

/* ================= Sidebar Content Component ================= */
const SidebarContent = ({
  buyer,
  activeTab,
  setActiveTab,
  logout,
  setShowPropertySuggestions,
  setShowEMICalculator,
}: any) => {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "properties", label: "Property Search", icon: Building },
    { id: "shortlist", label: "My Shortlist", icon: Bookmark },
    { id: "visits", label: "Site Visits", icon: Calendar },
    { id: "loans", label: "Loan Center", icon: CreditCard },
    { id: "calculators", label: "Calculators", icon: Calculator },
    { id: "insights", label: "Market Insights", icon: TrendingUp },
    { id: "documents", label: "My Documents", icon: FileText },
    { id: "profile", label: "Profile", icon: User },
  ];

  // ---- helpers ----
  const safeJson = (v: any) => {
    if (!v) return null;
    if (typeof v === "object") return v;
    if (typeof v === "string") {
      try {
        return JSON.parse(v);
      } catch {
        return null;
      }
    }
    return null;
  };

  const toArray = (v: any): string[] => {
    if (v == null) return [];
    if (Array.isArray(v)) return v.filter(Boolean).map(String);
    if (typeof v === "number") return [String(v)];
    if (typeof v === "string") {
      const parsed = safeJson(v);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
      return v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  const formatCurrency = (amount: any) => {
    const n = Number(amount ?? 0) || 0;
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    return `₹${n.toLocaleString("en-IN")}`;
  };

  // ---- normalize requirements ----
  const reqRaw =
    typeof buyer?.requirements === "string"
      ? safeJson(buyer.requirements)
      : buyer?.requirements || {};

  const unitTypesRaw =
    reqRaw?.unitTypes ??
    reqRaw?.unit_types ??
    reqRaw?.preferred_units ??
    reqRaw?.preferredUnitTypes ??
    reqRaw?.unitType ??
    reqRaw?.unit_type ??
    reqRaw?.unit ??
    reqRaw?.bhk ??
    reqRaw?.bedrooms ??
    null;

  let unitTypes = toArray(unitTypesRaw);
  if (unitTypes.length && unitTypes.every((x) => /^\d+(\s*bhk)?$/i.test(x))) {
    unitTypes = unitTypes.map((x) =>
      /\b\b/i.test(x) ? x.replace(/\s+/g, " ").toUpperCase() : `${x}`
    );
  }

  // ---- normalize budget ----
  const budgetMin =
    buyer?.budget?.min ??
    buyer?.budget_min ??
    buyer?.budgetMin ??
    (Array.isArray(buyer?.budget) ? buyer.budget[0] : undefined);

  const budgetMax =
    buyer?.budget?.max ??
    buyer?.budget_max ??
    buyer?.budgetMax ??
    (Array.isArray(buyer?.budget) ? buyer.budget[1] : undefined);

  const minVal = Number(budgetMin ?? 0);
  const maxVal = Number(budgetMax ?? 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 shrink-0">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-[#E6761D] to-[#CC6A1A] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
            {(buyer?.name || "U")?.charAt(0)}
          </div>

          <div>
            <div className="font-semibold text-sm text-gray-900">
              {(buyer?.salutation ? buyer.salutation + " " : "") + (buyer?.name || "Unknown")}
            </div>
            <div className="text-xs text-gray-600">
              {[buyer?.city, buyer?.state].filter(Boolean).join(", ") || "—"}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Budget:</span>
            <span className="font-medium text-green-600">
              {minVal || maxVal
                ? `${formatCurrency(minVal)} - ${formatCurrency(maxVal)}`
                : "—"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Preferred Units</span>
            <span className="font-medium">
              {unitTypes.length ? unitTypes.join(", ") : "—"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Lead Score:</span>
            <span className="font-medium text-purple-600">
              {(buyer?.leadScore ?? 0).toString()}/100
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <nav className="flex-1 overflow-y-auto px-4 py-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-left mb-1 text-sm ${activeTab === tab.id
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

      {/* Bottom */}
      <div className="p-4 border-t border-gray-200 shrink-0">
        <div className="space-y-2 text-sm">
          <button
            onClick={() => setShowPropertySuggestions(true)}
            className="w-full flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all"
          >
            <Bot size={14} />
            <span>AI Property Search</span>
          </button>

          <button
            onClick={() => setShowEMICalculator(true)}
            className="w-full flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Calculator size={14} />
            <span>EMI Calculator</span>
          </button>

          <button
            onClick={async () => {
              await logout();
              window.location.href = "/login";
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          >
            <LogOut size={15} />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Dashboard Tab for Buyer Account
const DashboardTab: React.FC<{ buyer: any }> = ({ buyer }) => {
  const [shortlistedCount, setShortlistedCount] = useState<number>(0);
  const [shortlistLoading, setShortlistLoading] = useState<boolean>(true);

  const localShortlistCount = useMemo(() => {
    return buyer?.matchedProperties?.filter((p: any) => p?.status === "shortlisted").length || 0;
  }, [buyer?.matchedProperties]);

  const buyerId = useMemo(() => Number(buyer?.id ?? buyer?.buyer_id ?? 0), [buyer?.id, buyer?.buyer_id]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!buyerId) {
        setShortlistedCount(localShortlistCount);
        setShortlistLoading(false);
        return;
      }
      try {
        setShortlistLoading(true);
        const res = await buyerSavedAPI.countByBuyer(buyerId);
        if (!cancelled) setShortlistedCount(res?.count ?? localShortlistCount);
      } catch {
        if (!cancelled) setShortlistedCount(localShortlistCount);
      } finally {
        if (!cancelled) setShortlistLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [buyerId, localShortlistCount]);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount?.toLocaleString("en-IN")}`;
  };

  const colorBg: Record<string, string> = {
    blue: "bg-blue-100",
    red: "bg-red-100",
    green: "bg-green-100",
    purple: "bg-purple-100",
  };
  const colorText: Record<string, string> = {
    blue: "text-blue-600",
    red: "text-red-600",
    green: "text-green-600",
    purple: "text-purple-600",
  };

  const stats = [
    { label: "Properties Viewed", value: buyer?.visits || 0, icon: Eye, color: "blue" },
    {
      label: "Shortlisted",
      value: shortlistLoading ? "—" : shortlistedCount,
      icon: Bookmark,
      color: "red",
    },
    {
      label: "Visits Scheduled",
      value: buyer?.followups?.filter((f: any) => f?.type === "visit").length || 0,
      icon: Calendar,
      color: "green",
    },
    { label: "Documents", value: buyer?.documents?.length || 0, icon: FileText, color: "purple" },
  ];

  return (
    <div className="">
      <div className="px-4 md:px-6 py-4 z-30 top-0 sticky">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">{stat.label}</p>
                    <p className="text-lg font-bold text-gray-900 mt-0.5">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${colorBg[stat.color]}`}>
                    <Icon className={`${colorText[stat.color]}`} size={18} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Property Search</h3>
            <div className="space-y-2">
              <button className="w-full text-xs bg-gradient-to-r from-purple-500 to-pink-600 text-white py-1.5 px-3 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all">
                AI Property Suggestions
              </button>
              <button className="w-full text-xs bg-blue-600 text-white py-1.5 px-3 rounded-lg hover:bg-blue-700 transition-colors">
                Browse All Properties
              </button>
              <button className="w-full text-xs bg-green-600 text-white py-1.5 px-3 rounded-lg hover:bg-green-700 transition-colors">
                Schedule Site Visit
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Financial Tools</h3>
            <div className="space-y-2">
              <button className="w-full text-xs bg-orange-600 text-white py-1.5 px-3 rounded-lg hover:bg-orange-700 transition-colors">
                EMI Calculator
              </button>
              <button className="w-full text-xs bg-indigo-600 text-white py-1.5 px-3 rounded-lg hover:bg-indigo-700 transition-colors">
                Loan Application
              </button>
              <button className="w-full text-xs bg-teal-600 text-white py-1.5 px-3 rounded-lg hover:bg-teal-700 transition-colors">
                Affordability Calculator
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Market Analysis</h3>
            <div className="space-y-2">
              <button className="w-full text-xs bg-cyan-600 text-white py-1.5 px-3 rounded-lg hover:bg-cyan-700 transition-colors">
                Price Trends
              </button>
              <button className="w-full text-xs bg-pink-600 text-white py-1.5 px-3 rounded-lg hover:bg-pink-700 transition-colors">
                Area Analysis
              </button>
              <button className="w-full text-xs bg-violet-600 text-white py-1.5 px-3 rounded-lg hover:bg-violet-700 transition-colors">
                Investment Insights
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Activity</h3>
          {buyer?.activities?.length > 0 ? (
            <div className="space-y-2">
              {buyer.activities.slice(0, 5).map((activity: any) => (
                <div key={activity.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Activity className="text-blue-600" size={14} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-gray-900">{activity.description}</div>
                    <div className="text-[10px] text-gray-600">
                      {activity.date} • {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Activity className="mx-auto text-gray-300 mb-3" size={36} />
              <p className="text-xs text-gray-500">No recent activities</p>
            </div>
          )}
        </div>

        {/* Recommended Properties */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Recommended for You</h3>
            <button className="text-xs text-purple-600 hover:text-purple-800 font-medium">View All</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {buyer?.matchedProperties?.slice(0, 2).map((property: any) => (
              <div
                key={property.id}
                className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <h4 className="text-xs font-semibold text-gray-900">{property.title}</h4>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-medium">
                    {property.matchScore}% Match
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 mb-1.5">{property.address}</p>
                <div className="text-sm font-bold text-green-600 mb-2">{formatCurrency(property.price)}</div>
                <div className="flex space-x-1.5">
                  <button className="flex-1 text-xs bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-700 transition-colors">
                    View Details
                  </button>
                  <button className="flex-1 text-xs bg-green-600 text-white py-1 px-2 rounded hover:bg-green-700 transition-colors">
                    Schedule Visit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

type PropertySearchTabProps = {
  buyer: any;
  onShowPropertySuggestions: () => void;
  onShowPropertyMatch: () => void;
  onVisitClick?: (p: any) => void;
  onDetailsClick?: (p: any) => void;
};

export const PropertySearchTab: React.FC<PropertySearchTabProps> = ({
  buyer,
  onShowPropertySuggestions,
  onShowPropertyMatch,
  onVisitClick,
}) => {
  // ✅ Enhanced property matching scoring
  const computeEnhancedMatchScore = (property: any, buyer: any) => {
    let score = 0;
    const maxScore = 100;

    // Budget match (30 points)
    const propertyPrice = Number(property?.price || property?.final_price || 0);
    const buyerBudgetMin = Number(buyer?.budget?.min || buyer?.budget_min || 0);
    const buyerBudgetMax = Number(buyer?.budget?.max || buyer?.budget_max || 0);

    if (buyerBudgetMin > 0 && buyerBudgetMax > 0) {
      if (propertyPrice >= buyerBudgetMin && propertyPrice <= buyerBudgetMax) {
        score += 30;
      } else if (propertyPrice <= buyerBudgetMax * 1.2) {
        score += 15;
      } else if (propertyPrice <= buyerBudgetMax * 1.5) {
        score += 10;
      }
    }

    // Location match (25 points)
    const buyerLocations = buyer?.requirements?.preferredLocations || buyer?.preferred_locations || [];
    const propertyLocation = property?.location_name || property?.location || property?.area || '';

    if (Array.isArray(buyerLocations) && buyerLocations.length > 0) {
      if (buyerLocations.some((loc: string) =>
        propertyLocation.toLowerCase().includes(loc.toLowerCase()))) {
        score += 25;
      }
    } else if (buyer?.city && propertyLocation.toLowerCase().includes(buyer.city.toLowerCase())) {
      score += 15;
    }

    // Unit type match (20 points)
    const buyerUnitTypes = buyer?.requirements?.unitTypes || buyer?.preferred_units || [];
    const propertyUnitType = property?.unit_type_name || property?.unit_type || '';

    if (Array.isArray(buyerUnitTypes) && buyerUnitTypes.length > 0 && 
        buyerUnitTypes.some((unit: string) =>
          propertyUnitType.toLowerCase().includes(unit.toLowerCase()))) {
      score += 20;
    }

    // Property type match (15 points)
    const buyerPropertyType = buyer?.requirements?.propertyType || buyer?.preferred_property_type || '';
    const propertyType = property?.property_type_name || property?.property_type || '';

    if (buyerPropertyType && propertyType.toLowerCase().includes(buyerPropertyType.toLowerCase())) {
      score += 15;
    }

    // Additional features (10 points)
    if (property?.is_featured || property?.is_rera || property?.rera_number) {
      score += 10;
    }

    return Math.min(score, maxScore);
  };

  // ✅ Enhanced title composition
  const composePropertyTitle = (property: any) => {
    const type = property?.property_type_name || property?.property_type || '';
    const unitType = property?.unit_type_name || property?.unit_type || '';
    const subtype = property?.property_subtype_name || property?.property_subtype || '';

    const parts = [type, unitType, subtype].filter(Boolean);
    return parts.length > 0 ? parts.join(' • ') : 'Property Listing';
  };

  // ✅ Enhanced possession display
  const getPossessionDisplay = (property: any) => {
    if (property?.possession_status) return property.possession_status;
    if (property?.possession_date) return `Ready by ${property.possession_date}`;
    if (property?.under_construction) return 'Under Construction';
    if (property?.ready_to_move) return 'Ready to Move';
    return 'Immediate';
  };

  // ✅ Enhanced floor display
  const getFloorDisplay = (property: any) => {
    if (property?.floor) return `${property.floor}`;
    if (property?.floor_number) return `${property.floor_number}`;
    if (property?.total_floors && property?.floor_range) {
      return `${property.floor_range} of ${property.total_floors}`;
    }
    return 'Info not available';
  };

  const {
    properties,
    loadingProps,
    propsError,
    fetchProperties,
    searchProperties,
    utils,
  } = useProperties({ autoLog: true });

  const {
    norm,
    toArr,
    hasAny,
    formatCurrency,
    getAvailabilityBadgeClass,
    unitTypeFrom,
    locTokensFrom,
    propTypeFrom,
    addressFrom,
    priceFrom,
    priceRangeFrom,
    sizeFrom,
    facingFrom,
    parkingFrom,
    photoFrom,
    computeReasons,
    isWithinBuyerBudget,
    makeItem,
  } = utils;

  /* ---------------- Local helpers for robust image handling ---------------- */
  const ORIGIN =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://investordeal.in";

  const NO_IMAGE_SVG =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200" role="img" aria-label="No image">
         <rect width="320" height="200" fill="#f3f4f6"/>
         <g fill="#9ca3af" font-family="Arial,Helvetica,sans-serif" font-size="14">
           <text x="160" y="102" text-anchor="middle">No Image</text>
         </g>
       </svg>`
    );

  const absolutize = (url?: string | null): string | null => {
    if (!url) return null;
    const s = String(url).trim();
    if (!s) return null;
    if (/^https?:\/\//i.test(s)) return s;
    if (s.startsWith("//")) return `https:${s}`;
    if (s.startsWith("/")) return `${ORIGIN}${s}`;
    return `${ORIGIN}/${s.replace(/^\/+/, "")}`;
  };

  const toArraySafe = (v: any): string[] => {
    if (!v) return [];
    if (Array.isArray(v)) return v.filter(Boolean).map(String);
    if (typeof v === "string") {
      try {
        const j = JSON.parse(v);
        if (Array.isArray(j)) return j.filter(Boolean).map(String);
      } catch { }
      return v
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  const firstImageFromAny = (raw: any): string | null => {
    const candidates: Array<string | string[] | undefined> = [
      raw?.thumbnail_url,
      raw?.thumbnailUrl,
      raw?.coverImage,
      raw?.image,
      raw?.images,
      raw?.photo,
      raw?.photoUrl,
      raw?.photoUrls,
      raw?.photos,
      raw?.primary_image,
      raw?.media,
    ];

    for (const c of candidates) {
      if (!c) continue;
      if (typeof c === "string") {
        const arr = toArraySafe(c);
        if (arr.length) return absolutize(arr[0]);
        return absolutize(c);
      }
      if (Array.isArray(c) && c.length) {
        const first = String(c[0]);
        if (first) return absolutize(first);
      }
    }
    return null;
  };

  const resolvePhoto = (p: any): string | null => {
    const utilPick = photoFrom(p);
    if (utilPick) {
      const s = absolutize(utilPick);
      if (s) return s;
    }
    const raw = p?._raw ?? p;
    const got = firstImageFromAny(raw);
    if (got) return got;

    const deep = (() => {
      try {
        if (raw?.media && typeof raw.media === "object") {
          const arr = Array.isArray(raw.media) ? raw.media : Object.values(raw.media);
          const first = arr?.[0];
          if (typeof first === "string") return absolutize(first);
          if (first?.url) return absolutize(first.url);
          if (first?.src) return absolutize(first.src);
        }
      } catch { }
      return null;
    })();

    return deep || null;
  };

  const PropertyImage: React.FC<{ src?: string | null; alt?: string }> = ({ src, alt }) => {
    const [imgSrc, setImgSrc] = useState<string>(src || NO_IMAGE_SVG);
    useEffect(() => setImgSrc(src || NO_IMAGE_SVG), [src]);
    return (
      <img
        src={imgSrc}
        alt={alt || "Property"}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover"
        onError={() => setImgSrc(NO_IMAGE_SVG)}
      />
    );
  };

  /* ---------------- state ---------------- */
  type SortKey = "low_to_high" | "high_to_low" | "medium" | "newest";

  const defaultFilters = {
    location: "",
    minPrice: null as number | null,
    maxPrice: null as number | null,
    propertyType: "",
    unitTypes: [] as string[],
    sort: "newest" as SortKey,
  };

  const [searchFilters, setSearchFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [respectBuyerBudget, setRespectBuyerBudget] = useState(false);
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const filtersRef = useRef<HTMLDivElement | null>(null);

  // Share modal state
  const [shareOpen, setShareOpen] = useState(false);
  const [shareData, setShareData] = useState<{
    url?: string;
    title?: string;
    description?: string;
    image?: string;
    trackingToken?: string;
  } | null>(null);

  // first load → all properties (only is_public)
  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Robust public property detection
  const isPublicProperty = (property: any) => {
    if (!property) return false;
    const raw = property._raw || property;
    const publicFlags = [
      raw?.is_public,
      raw?.isPublic,
      raw?.public,
      raw?.is_public_listing,
      raw?.public_listing,
      raw?.visible_to_buyers,
      raw?.buyer_visible,
      property?.is_public,
      property?.isPublic,
      property?.public,
      property?.is_public_listing,
      property?.public_listing,
      property?.visible_to_buyers,
      property?.buyer_visible,
    ];
    return publicFlags.some(
      (flag) => flag === true || flag === 1 || flag === "1" || flag === "true" || flag === "yes"
    );
  };

  const normalized = useMemo(
    () => (Array.isArray(properties) ? properties.map((p) => makeItem(p, buyer)) : []),
    [properties, buyer, makeItem]
  );

  // Filter only public properties
  const publicProperties = useMemo(
    () => normalized.filter(isPublicProperty),
    [normalized]
  );

  // ---------------- search handler (ONLY user inputs) ----------------
  const handleSearch = async () => {
    const params = {
      location: searchFilters.location || undefined,
      minPrice:
        searchFilters.minPrice !== null && searchFilters.minPrice !== undefined
          ? searchFilters.minPrice
          : undefined,
      maxPrice:
        searchFilters.maxPrice !== null && searchFilters.maxPrice !== undefined
          ? searchFilters.maxPrice
          : undefined,
      sort: searchFilters.sort,
      propertyType: (searchFilters as any).propertyType || undefined,
      unitTypes: searchFilters.unitTypes.length ? searchFilters.unitTypes : undefined,
      is_public: 1,
    };
    await searchProperties(params);
    setAppliedFilters(searchFilters);
    setHasSearched(true);
    setShowFilters(true);
  };

  const handleResetFilters = async () => {
    setSearchFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    await fetchProperties();
    setHasSearched(false);
  };

  // ---------- URL + Filter Context Tracking ----------
  const TRACKING_PARAM_KEY = "fltcnt";
  const STORAGE_KEY_LATEST = "re_filter_token";
  const STORAGE_KEY_PREFIX = "re_filter_payload";

  const randomToken = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return (crypto as any).randomUUID();
    }
    return `flt_${Math.random().toString(36).slice(2)}_${Date.now()}`;
  };

  const withFilterContext = (rawUrl: string, property: any) => {
    try {
      const token = randomToken();

      const buyerSnap = (() => {
        const b = buyer || {};
        const req = b?.requirements || {};
        return {
          name: b?.name || undefined,
          budgetMin: b?.budget?.min ?? b?.budget_min ?? undefined,
          budgetMax: b?.budget?.max ?? b?.budget_max ?? undefined,
          unitType: req?.unitType ?? req?.unitTypes ?? undefined,
          preferredLocations: req?.preferredLocations ?? req?.preferredlocations ?? undefined,
          city: req?.city ?? b?.city ?? undefined,
        };
      })();

      const payload = {
        ts: Date.now(),
        source: "PropertySearchTab",
        propertyId: property?.id ?? property?._raw?.id ?? null,
        respectBuyerBudget,
        appliedFilters,
        buyer: buyerSnap,
        from: {
          path:
            typeof window !== "undefined" ? window.location.pathname : undefined,
          query:
            typeof window !== "undefined" ? window.location.search : undefined,
        },
      };

      if (typeof window !== "undefined") {
        const k = `${STORAGE_KEY_PREFIX}:${token}`;
        localStorage.setItem(k, JSON.stringify(payload));
        localStorage.setItem(STORAGE_KEY_LATEST, token);
      }

      const u = new URL(rawUrl, ORIGIN);
      u.searchParams.set(TRACKING_PARAM_KEY, token);
      return { token, urlWithToken: u.toString() };
    } catch {
      return { token: undefined, urlWithToken: rawUrl };
    }
  };

  // ---------- Robust public URL builder (plural `/properties`) ----------
  const buildPropertyUrl = (raw: any) => {
    const given =
      raw?.external_url || raw?.public_url || raw?.website || raw?.url || null;

    if (typeof given === "string" && given.trim()) {
      const s = given.trim();
      if (/^https?:\/\//i.test(s)) return s;
      if (s.startsWith("//")) return `https:${s}`;
      if (s.startsWith("/")) return `${ORIGIN}${s}`;
      return `${ORIGIN}/${s.replace(/^\/+/, "")}`;
    }

    const slug =
      raw?.slug || raw?.property_slug || raw?.public_slug || raw?.seo_slug;
    const id = raw?.id || raw?.property_id || raw?._id;

    if (slug) return `${ORIGIN}/properties/${encodeURIComponent(String(slug).replace(/^\/+/, ""))}`;
    if (id) return `${ORIGIN}/properties/${encodeURIComponent(String(id))}`;
    return `${ORIGIN}/properties`;
  };

  // ✅ Enhanced property tags extraction
  const extractPropertyTags = (property: any): string[] => {
    const raw = property._raw || property;
    const tags: string[] = [];

    // Extract from tags field
    if (Array.isArray(raw?.tags)) {
      tags.push(...raw.tags.filter(Boolean).map(String));
    } else if (typeof raw?.tags === "string") {
      const parsedTags = toArraySafe(raw.tags);
      tags.push(...parsedTags);
    }

    // Extract from features/amenities
    if (Array.isArray(raw?.amenities)) {
      const importantAmenities = raw.amenities.slice(0, 3);
      tags.push(...importantAmenities.filter(Boolean).map(String));
    }

    // Add property status tags
    if (raw?.is_featured) tags.push("Featured");
    if (raw?.is_rera || raw?.rera_number) tags.push("RERA Approved");
    if (raw?.ready_to_move) tags.push("Ready to Move");
    if (raw?.under_construction) tags.push("Under Construction");
    if (raw?.is_resale) tags.push("Resale");

    return Array.from(new Set(tags)).slice(0, 5); // Limit to 5 tags
  };

  // ---------------- mapping (presentation) ----------------
  const mappedItems = useMemo(() => {
    const locQuery = norm(appliedFilters.location);
    const minP = Number(appliedFilters.minPrice || 0);
    const maxP = Number(appliedFilters.maxPrice || 0);
    const fType = norm((appliedFilters as any).propertyType);
    const fUnits = toArr(appliedFilters.unitTypes).map(norm);

    const withinSearchFilters = (p: any) => {
      if (locQuery && !hasAny(locTokensFrom(p), [locQuery])) return false;

      const { min: pMin, max: pMax } = priceRangeFrom(p);
      const pPrice = priceFrom(p);
      const hasRange = !!pMin && !!pMax && pMax >= pMin;
      if (minP || maxP) {
        if (hasRange) {
          const left = minP || Number.NEGATIVE_INFINITY;
          const right = maxP || Number.POSITIVE_INFINITY;
          if (Math.max(pMin ?? -Infinity, left) > Math.min(pMax ?? Infinity, right)) return false;
        } else if (pPrice) {
          if (minP && pPrice < minP) return false;
          if (maxP && pPrice > maxP) return false;
        }
      }

      if (fType && !propTypeFrom(p).includes(fType)) return false;
      if (fUnits.length) {
        const u = norm(unitTypeFrom(p));
        if (!u || !fUnits.includes(u)) return false;
      }
      return true;
    };

    let list = publicProperties.filter(withinSearchFilters);
    if (respectBuyerBudget) list = list.filter((p) => isWithinBuyerBudget(p, buyer));

    return list.map((p: any) => {
      const raw = p._raw ?? p;
      const publicUrl = buildPropertyUrl(raw);

      return {
        id: String(raw?.id ?? raw?.property_id ?? raw?._id ?? Math.random()),
        title: composePropertyTitle(raw), // ✅ Enhanced title
        address: addressFrom(p),
        price: priceFrom(p),
        size: sizeFrom(p),
        floorLine: getFloorDisplay(raw), // ✅ Enhanced floor display
        facing: facingFrom(p),
        parking: parkingFrom(p),
        possession: getPossessionDisplay(raw), // ✅ Enhanced possession display
        amenities: p?.amenities || [],
        statusText: p?.status || "Available",
        matchScore: computeEnhancedMatchScore(raw, buyer), // ✅ Enhanced matching score
        photo: resolvePhoto(p),
        _raw: raw,
        reasons: computeReasons(p, buyer),
        publicUrl,
        tags: extractPropertyTags(p), // ✅ Added tags
      };
    });
  }, [
    publicProperties,
    appliedFilters,
    respectBuyerBudget,
    buyer,
    norm,
    toArr,
    hasAny,
    locTokensFrom,
    priceRangeFrom,
    priceFrom,
    propTypeFrom,
    unitTypeFrom,
    isWithinBuyerBudget,
    addressFrom,
    sizeFrom,
    facingFrom,
    parkingFrom,
    computeReasons,
  ]);

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-700 bg-green-100";
    if (score >= 80) return "text-blue-700 bg-blue-100";
    if (score >= 70) return "text-orange-700 bg-orange-100";
    return "text-red-700 bg-red-100";
  };

  const AvailabilityBadge = ({ status }: { status: string }) => {
    const cls = getAvailabilityBadgeClass(status);
    return (
      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${cls}`}>
        {status || "Available"}
      </span>
    );
  };

  // ✅ Enhanced shortlist functionality
  const toggleShortlist = async (property: any) => {
    const propertyId = Number(property._raw?.id || property.id);

    if (!propertyId) {
      toast.error("Invalid property ID");
      return;
    }

    try {
      if (shortlisted.has(property.id)) {
        // Remove from shortlist
        await buyerSavedAPI.toggle(buyer.id, propertyId, "unsave");
        setShortlisted((prev) => {
          const next = new Set(prev);
          next.delete(property.id);
          return next;
        });
        toast.success("Removed from shortlist");
      } else {
        // Add to shortlist
        await buyerSavedAPI.toggle(buyer.id, propertyId, "save");
        setShortlisted((prev) => new Set(prev.add(property.id)));
        toast.success("Added to shortlist");
      }
    } catch (error) {
      console.error("Shortlist toggle error:", error);
      toast.error("Failed to update shortlist");
    }
  };

  // Load existing shortlisted properties
  useEffect(() => {
    const loadShortlisted = async () => {
      if (!buyer?.id) return;

      try {
        const saved = await buyerSavedAPI.listByBuyer(buyer.id, { includeProperty: true });
        const savedIds = (Array.isArray(saved) ? saved : []).map((item: any) =>
          String(item.property_id || item.property?.id)
        );
        setShortlisted(new Set(savedIds));
      } catch (error) {
        console.error("Failed to load shortlisted properties:", error);
      }
    };

    loadShortlisted();
  }, [buyer?.id]);

  // ---------- Actions that include filter context token ----------
  const openShare = (p: any) => {
    const baseUrl = p.publicUrl || buildPropertyUrl(p._raw);
    const { token, urlWithToken } = withFilterContext(baseUrl, p);
    setShareData({
      url: urlWithToken,
      title: p.title,
      description: p.address || "",
      image: p.photo,
      trackingToken: token,
    });
    setShareOpen(true);
  };

  const openWebsite = (p: any) => {
    const baseUrl = p.publicUrl || buildPropertyUrl(p._raw);
    const { urlWithToken } = withFilterContext(baseUrl, p);
    if (urlWithToken) window.open(urlWithToken, "_blank", "noopener,noreferrer");
  };

  const handleViewDetails = (property: any) => {
    const baseUrl = property.publicUrl || buildPropertyUrl(property._raw);
    const { urlWithToken } = withFilterContext(baseUrl, property);
    if (urlWithToken) window.open(urlWithToken, "_blank", "noopener,noreferrer");
  };

  // ✅ Corrected Property Tags Component
  const PropertyTags = ({ propertyId, tags }: { propertyId?: string | number; tags?: string[] }) => {
    const [propertyTags, setPropertyTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch tags from API when propertyId is provided
    useEffect(() => {
      const fetchTags = async () => {
        if (!propertyId) {
          // If no propertyId, use provided tags or empty array
          setPropertyTags(tags || []);
          return;
        }

        try {
          setLoading(true);
          const tagRes = await propertyTagsAPI.getById(propertyId);
          
          // Handle API response with proper type checking
          let apiTags: string[] = [];
          
          if (tagRes && typeof tagRes === 'object') {
            // Case 1: tags is an array
            if (Array.isArray((tagRes as any).tags)) {
              apiTags = (tagRes as any).tags.filter((tag: any) => tag != null).map(String);
            }
            // Case 2: tags is a string
            else if (typeof (tagRes as any).tags === 'string') {
              apiTags = (tagRes as any).tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
            }
            // Case 3: tags is directly in response
            else if (Array.isArray(tagRes)) {
              apiTags = tagRes.filter((tag: any) => tag != null).map(String);
            }
          }
          
          // If no tags from API, use provided tags as fallback
          setPropertyTags(apiTags.length > 0 ? apiTags : (tags || []));
        } catch (error) {
          console.warn(`Could not fetch tags for property ${propertyId}`, error);
          // Fallback to provided tags if API fails
          setPropertyTags(tags || []);
        } finally {
          setLoading(false);
        }
      };

      fetchTags();
    }, [propertyId, tags]);

    if (loading) {
      return (
        <div className="flex flex-wrap gap-1 mt-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-gray-200 text-gray-200 animate-pulse"
            >
              Loading...
            </span>
          ))}
        </div>
      );
    }

    if (!propertyTags || propertyTags.length === 0) return null;
    
    const displayTags = propertyTags.slice(0, 3);
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {displayTags.map((tag, index) => {
          const style = getTagStyle(tag);
          const EmojiComponent =
            typeof style.emoji === "string"
              ? () => <span className="text-xs mr-1" aria-hidden="true">{style.emoji as string}</span>
              : (style.emoji as React.ComponentType<{ size?: number; className?: string }>);

          return (
            <span
              key={index}
              className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium ${style.bg} ${style.text} ${style.ring}`}
            >
              {style.emoji &&
                (typeof style.emoji === "string" ? (
                  <span className="text-xs mr-1" aria-hidden="true">{style.emoji}</span>
                ) : (
                  <EmojiComponent size={8} className="mr-1" />
                ))}
              {tag}
            </span>
          );
        })}
        {propertyTags.length > 3 && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
            +{propertyTags.length - 3}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 pt-2 space-y-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 pt-1 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-lg font-bold text-gray-900">Property Search</h3>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onShowPropertyMatch}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Target size={14} />
              <span>Smart Match</span>
            </button>

            <button
              onClick={onShowPropertySuggestions}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#E6761D] to-[#CC6A1A] text-white text-xs rounded-lg hover:from-[#CC6A1A] hover:to-[#B85E15] transition-all"
            >
              <Bot size={14} />
              <span>AI Suggestions</span>
            </button>

            <button
              onClick={() => {
                if (showFilters) {
                  setShowFilters(false);
                } else {
                  setShowFilters(true);
                  requestAnimationFrame(() => {
                    filtersRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  });
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#E6761D] to-[#CC6A1A] text-white rounded-lg text-xs hover:from-[#CC6A1A] hover:to-[#B85E15] transition-all"
            >
              <SlidersHorizontal size={14} />
              <span>{showFilters ? "Hide Filters" : "Search Filters"}</span>
            </button>

            <label className="flex items-center gap-2 ml-1 cursor-pointer">
              <input
                type="checkbox"
                id="respectBudget"
                checked={respectBuyerBudget}
                onChange={(e) => setRespectBuyerBudget(e.target.checked)}
                className="w-4 h-4 text-[#E6761D] bg-gray-100 border-gray-300 rounded focus:ring-[#E6761D] focus:ring-2"
              />
              <span className="text-xs text-gray-700">Respect Buyer Budget</span>
            </label>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div>
        <div ref={filtersRef} className="scroll-mt-20">
          {showFilters && (
            <div className="mt-2">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={searchFilters.location}
                    onChange={(e) =>
                      setSearchFilters({ ...searchFilters, location: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E6761D] text-xs"
                    placeholder="Enter location (e.g., hinjewadi)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Min Price</label>
                  <input
                    type="number"
                    placeholder="500000"
                    value={searchFilters.minPrice ?? ""}
                    onChange={(e) =>
                      setSearchFilters({
                        ...searchFilters,
                        minPrice: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E6761D] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Max Price</label>
                  <input
                    type="number"
                    placeholder="1000000"
                    value={searchFilters.maxPrice ?? ""}
                    onChange={(e) =>
                      setSearchFilters({
                        ...searchFilters,
                        maxPrice: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E6761D] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Unit Types</label>
                  <input
                    type="text"
                    value={searchFilters.unitTypes.join(",")}
                    onChange={(e) =>
                      setSearchFilters({
                        ...searchFilters,
                        unitTypes: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E6761D] text-xs"
                    placeholder="1BHK,2BHK,3BHK"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Sort</label>
                  <select
                    value={searchFilters.sort}
                    onChange={(e) =>
                      setSearchFilters({
                        ...searchFilters,
                        sort: e.target.value as SortKey,
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E6761D] text-xs"
                  >
                    <option value="newest">Newest</option>
                    <option value="low_to_high">Price: Low to High</option>
                    <option value="high_to_low">Price: High to Low</option>
                    <option value="medium">Price: Mid</option>
                  </select>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  onClick={handleResetFilters}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={handleSearch}
                  className="px-4 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Search Properties
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Search Results</h4>

        {loadingProps && (
          <div className="text-center py-10 text-sm text-gray-600">Loading properties…</div>
        )}

        {propsError && !loadingProps && (
          <div className="text-center py-10 text-sm text-red-600">{propsError}</div>
        )}

        {!loadingProps && !propsError && mappedItems.length === 0 && (
          <div className="text-center py-10">
            <Building className="mx-auto text-gray-300 mb-3" size={48} />
            {hasSearched ? (
              <>
                <h3 className="text-base font-semibold text-gray-900 mb-1">No Results Found</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Try adjusting your filters to find matching properties.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={handleResetFilters}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  Start Your Property Search
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  Use our AI-powered tools to find your perfect home
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={onShowPropertySuggestions}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#E6761D] to-[#CC6A1A] text-white text-xs rounded-lg hover:from-[#CC6A1A] hover:to-[#B85E15] transition-all"
                  >
                    <Bot size={14} />
                    <span>AI Property Search</span>
                  </button>
                  <button
                    onClick={onShowPropertyMatch}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Target size={14} />
                    <span>Smart Matching</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {!loadingProps && !propsError && mappedItems.length > 0 && (
          <div className="space-y-3">
            {mappedItems.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
              >
                <div className="flex items-start gap-3">
                  {/* Photo */}
                  <div className="w-28 h-20 rounded-lg overflow-hidden bg-gray-100 flex-none">
                    <PropertyImage src={property.photo} alt={property.title} />
                  </div>

                  {/* Main */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-[#0b3856]">{property.title}</h4>
                        <div className="flex items-center gap-1 text-gray-600 mt-0.5 text-xs">
                          <MapPin size={12} />
                          <span className="truncate max-w-[60vw] sm:max-w-[40vw]">
                            {property.address || "—"}
                          </span>
                        </div>

                        {/* ✅ Property Tags */}
                        <div className='uppercase'>

                        <PropertyTags
                          propertyId={property._raw?.id || property.id}
                          tags={property.tags}
                          />
                          </div>

                        <div className="flex items-center gap-2 mt-2">
                          <div
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${getMatchScoreColor(
                              property.matchScore
                            )}`}
                          >
                            {property.matchScore}% Match
                          </div>
                          <AvailabilityBadge status={property.statusText} />
                          {shortlisted.has(property.id) && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-100 text-purple-700">
                              ⭐ Shortlisted
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-base font-bold text-green-600">
                          {formatCurrency(property.price)}
                        </div>
                        <div className="text-[11px] text-gray-500">{property.size}</div>
                      </div>
                    </div>

                    {/* ✅ Enhanced Attributes - Fixed Floor and Possession Display */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 mt-3 text-xs">
                      <div>
                        <span className="text-gray-500">Floor:</span>{" "}
                        <span className="font-semibold">{property.floorLine}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Facing:</span>{" "}
                        <span className="font-semibold">{property.facing}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Possession:</span>{" "}
                        <span className="font-semibold">{property.possession}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Parking:</span>{" "}
                        <span className="font-semibold">{property.parking}</span>
                      </div>
                    </div>

                    {/* Why it matches */}
                    {property.reasons?.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-500 mb-1">Why it matches:</div>
                        <div className="flex flex-wrap gap-1">
                          {property.reasons.slice(0, 4).map((r: string, i: number) => (
                            <span
                              key={`${r}-${i}`}
                              className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-600"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                        onClick={() =>
                          onVisitClick ? onVisitClick(property) : console.log("Visit", property)
                        }
                      >
                        <Calendar size={14} />
                        <span>Visit</span>
                      </button>

                      <button
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-xs ${shortlisted.has(property.id)
                            ? "bg-purple-600 text-white hover:bg-purple-700"
                            : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                          }`}
                        onClick={() => toggleShortlist(property)}
                      >
                        <Bookmark size={12} className={shortlisted.has(property.id) ? "fill-current" : ""} />
                        <span>{shortlisted.has(property.id) ? "Shortlisted" : "Shortlist"}</span>
                      </button>

                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-300 transition-colors"
                        onClick={() => handleViewDetails(property)}
                        title="View property details"
                      >
                        <Eye size={14} />
                        <span>View Details</span>
                      </button>

                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs"
                        onClick={() => openWebsite(property)}
                        title="Open public property page"
                      >
                        <ExternalLink size={14} />
                        <span>Visit Website</span>
                      </button>

                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-xs"
                        onClick={() => openShare(property)}
                        title="Share property"
                      >
                        <Share2 size={14} />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {shareOpen && shareData && (
        <ShareModal
          url={shareData.url}
          title={shareData.title}
          description={shareData.description}
          image={shareData.image}
          trackingToken={shareData.trackingToken}
          onClose={() => {
            setShareOpen(false);
            setShareData(null);
          }}
        />
      )}
    </div>
  );
};


export default BuyerAccountPage;