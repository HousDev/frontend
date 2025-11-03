import React, { useEffect, useState, useMemo, useRef } from 'react';
import { ArrowLeft, User, Building, FileText, SlidersHorizontal, CreditCard, Calculator, TrendingUp, Target, Bot, Calendar, Phone, Mail, MessageCircle, MapPin, DollarSign, Eye, Download, Upload, Share, Plus, Edit, Trash2, Star, Award, CheckCircle, AlertCircle, Bell, Shield, Crown, Gem, Heart, Bookmark, Flag, Tag, Link, ExternalLink, Copy, Send, Printer, Archive, RefreshCw, Filter, Search, SortAsc, Grid, List, Maximize2, MoreHorizontal, Settings, Activity, BarChart3, PieChart, Home, Car, Wifi, Dumbbell, TreePine, Waves, Zap, Flame, Droplets, Snowflake, Sun, Moon, Wind, Mountain, Flower, Coffee, Clock, Users, Globe, Smartphone, Laptop, Headphones, Camera, Video, Music, Book, Briefcase, ShoppingBag, Gift, Plane, Train, Bus, Bike, Truck, X, Menu, LogOut, Share2, IndianRupee } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
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
import { FaWhatsapp } from 'react-icons/fa6';
import { getTagStyle, type TagTone } from '@/lib/tagStyles';
import { usePropertyMatches } from '@/hooks/usePropertyMatches';

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

  function BuyerMatchLogger({ buyer }: { buyer: any }) {
    const { count, loading, error } = usePropertyMatches({ buyer, publicOnly: true });

    useEffect(() => {
    
    }, [buyer?.id, count, loading, error]);

    if (loading) return <span className="text-gray-400">…</span>;
    if (error) return <span className="text-red-500">0</span>;
    return <span>{count}</span>;
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
            <span className="text-gray-500">Matched Properties:</span>
            <span>
              <BuyerMatchLogger buyer={buyer} /> matches
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

    if (propertyPrice >= buyerBudgetMin && propertyPrice <= buyerBudgetMax) {
      score += 30;
    } else if (propertyPrice <= buyerBudgetMax * 1.2) {
      score += 70;
    } else if (propertyPrice <= buyerBudgetMax * 1.5) {
      score += 10;
    }

    // Location match (25 points)
    const buyerLocations = buyer?.requirements?.preferredLocations || buyer?.preferred_locations || [];
    const propertyLocation = property?.location_name || property?.location || property?.area || '';

    if (Array.isArray(buyerLocations) && buyerLocations.some((loc: string) =>
      propertyLocation.toLowerCase().includes(loc.toLowerCase()))) {
      score += 25;
    } else if (buyer?.city && propertyLocation.toLowerCase().includes(buyer.city.toLowerCase())) {
      score += 15;
    }

    // Unit type match (20 points)
    const buyerUnitTypes = buyer?.requirements?.unitTypes || buyer?.preferred_units || [];
    const propertyUnitType = property?.unit_type_name || property?.unit_type || '';

    if (Array.isArray(buyerUnitTypes) && buyerUnitTypes.some((unit: string) =>
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
    return parts.length > 0 ? parts.join(' ') : 'Property Listing';
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
    if (property?.floor) return ` ${property.floor}`;
    if (property?.floor_number) return ` ${property.floor_number}`;
    if (property?.total_floors && property?.floor_range) {
      return `${property.floor_range} of ${property.total_floors}`;
    }
    return 'Floor info not available';
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

  // ✅ Property Tags Component
  // ✅ Corrected Property Tags Component
// ✅ Corrected Property Tags Component with proper TypeScript
const PropertyTags = ({ propertyId, tags }: { propertyId?: number; tags?: string[] }) => {
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
            : (style.emoji as any);

        return (
          <span
            key={index}
            className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium uppercase ${style.bg} ${style.text} ${style.ring}`}
          >
            {style.emoji &&
              (typeof style.emoji === "string" ? (
                <EmojiComponent />
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

                        <PropertyTags
                          propertyId={property._raw?.id || property.id}
                          tags={property.tags}
                        />

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

/* ---------------- Small helpers (robust to mixed shapes) ---------------- */
const toArray = (v: any): string[] => {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  if (typeof v === "string") {
    try {
      const j = JSON.parse(v);
      if (Array.isArray(j)) return j.filter(Boolean).map(String);
    } catch { }
    return v.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

const firstImage = (p: any): string | null => {
  const cands: Array<string | string[] | undefined> = [
    p?.thumbnail_url,
    p?.thumbnailUrl,
    p?.coverImage,
    p?.image,
    p?.images,
    p?.photo,
    p?.photoUrl,
    p?.photoUrls,
    p?.photos,
  ];
  for (const c of cands) {
    if (!c) continue;
    if (typeof c === "string") {
      const arr = toArray(c);
      if (arr.length) return arr[0];
      if (/^https?:\/\//i.test(c) || c.startsWith("/")) return c;
    } else if (Array.isArray(c)) {
      const arr = c.filter(Boolean).map(String);
      if (arr.length) return arr[0];
    }
  }
  return null;
};

const pickComposedTitle = (p: any): string => {
  const type = (p?.property_type_name ?? p?.property_type ?? p?.type ?? "")
    .toString()
    .trim();
  const unitType = (p?.unit_type_name ?? p?.unit_type ?? p?.unitType ?? "")
    .toString()
    .trim();
  const subtype = (p?.property_subtype_name ?? p?.property_subtype ?? p?.subtype ?? "")
    .toString()
    .trim();
  const composed = [type, unitType, subtype].filter(Boolean).join(" ");
  return composed || "Property";
};

const pickLocation = (p: any): string => {
  const locality =
    p?.location_name ??
    p?.location ??
    p?.area ??
    p?.neighbourhood ??
    p?.neighborhood ??
    "";
  const city = p?.city_name ?? p?.city ?? "";
  const state = p?.state ?? "";
  return [locality, city, state].filter(Boolean).slice(0, 2).join(", ") || "Unknown location";
};

const pickPositiveNumber = (...vals: any[]): number | null => {
  for (const v of vals) {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
};

const pickPrice = (p: any): number | null => {
  return pickPositiveNumber(p?.final_price, p?.price, p?.expected_price, p?.budget);
};

const formatCurrencyShortlist = (amount?: number | null) => {
  const v = Number(amount ?? 0);
  if (!Number.isFinite(v) || v <= 0) return "N/A";
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)}L`;
  return `₹${v.toLocaleString("en-IN")}`;
};

const areaInSqft = (p: any): number | undefined => {
  const carpet = Number(p?.carpet_area) || 0;
  const builtup = Number(p?.builtup_area) || 0;
  const superBuiltup = Number(p?.super_builtup_area) || 0;
  return carpet || builtup || superBuiltup || (Number(p?.area) || undefined);
};

const pricePerSqft = (price?: number | null, sqft?: number) => {
  if (!price || !sqft) return "-";
  const v = Math.round(price / sqft);
  return `₹${v.toLocaleString("en-IN")}`;
};

/* ---------------- Tiny Tag Pills ---------------- */
const PropertyTagsShortlist = ({ tags }: { tags: string[] }) => {
  if (!tags || tags.length === 0) return null;
  const displayTags = tags.slice(0, 2);
  return (
    <div className="flex flex-wrap gap-1.5 mb-3">
      {displayTags.map((tag, index) => {
        const style = getTagStyle(tag);
        const EmojiComponent =
          typeof style.emoji === "string"
            ? () => <span className="text-xs mr-1 uppercase" aria-hidden="true">{style.emoji as string}</span>
            : (style.emoji as any);

        return (
          <span
            key={index}
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold uppercase ${style.bg} ${style.text} ring-1 ${style.ring} transition-all duration-200`}
          >
            {style.emoji &&
              (typeof style.emoji === "string" ? (
                <EmojiComponent />
              ) : (
                <EmojiComponent size={10} className="mr-1" />
              ))}
            {tag}
          </span>
        );
      })}
      {tags.length > 2 && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          +{tags.length - 2}
        </span>
      )}
    </div>
  );
};

/* ------------------------------ Component ------------------------------ */
const ShortlistTab: React.FC<{ buyer: any }> = ({ buyer }) => {
  const [savedProps, setSavedProps] = useState<BuyerSavedWithProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!buyer?.id) return;

    const load = async () => {
      try {
        setLoading(true);

        // 1) fetch saved list
        const res = await buyerSavedAPI.listByBuyer(buyer.id, { includeProperty: true });
        const rows: BuyerSavedWithProperty[] = Array.isArray(res)
          ? (res as any)
          : Array.isArray((res as any)?.data)
            ? ((res as any).data as any)
            : [];

        // 2) enrich each row with tags (pull from API if not present)
        const enriched = await Promise.all(
          rows.map(async (row) => {
            const p: any = row.property ?? {};
            let tags: string[] = [];

            // existing inline tags if already present
            if (Array.isArray(p?.tags)) tags = p.tags.filter(Boolean).map(String);
            else if (typeof p?.tags === "string") tags = toArray(p.tags);

            // if still empty, fetch from tag service by property id
            if ((!tags || tags.length === 0) && (p?.id || row.property_id)) {
              try {
                const tagRes = await propertyTagsAPI.getById(p?.id ?? row.property_id);
                const apiTags = Array.isArray(tagRes?.tags)
                  ? tagRes.tags
                  : typeof tagRes?.tags === "string"
                    ? toArray(tagRes.tags)
                    : [];
                tags = apiTags;
              } catch (e) {
                console.warn(`Could not fetch tags for property ${p?.id ?? row.property_id}`, e);
              }
            }

            // derive extras from flags (verified/featured/new/resale)
            const extras: string[] = [];
            if (p?.rera_number || p?.rera_approved || p?.is_rera) extras.push("verified");
            if (p?.is_featured || p?.featured) extras.push("featured");
            if (p?.under_construction || p?.is_new_listing) extras.push("new listing");
            if (p?.is_resale || p?.sale_type === "resale") extras.push("resale");

            const finalTags = Array.from(new Set([...(tags || []), ...extras])).filter(Boolean);

            // attach back onto property (non-destructive)
            row.property = { ...(row.property as any), tags: finalTags } as any;
            return row;
          })
        );

        setSavedProps(enriched);
      } catch (err) {
        console.error('❌ ShortlistTab - Error loading saved properties:', err);
        toast.error("Failed to load saved properties");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [buyer?.id]);

  const handleUnsave = async (propertyId: number) => {
    try {
      await buyerSavedAPI.toggle(buyer.id, propertyId, "unsave");
      setSavedProps((prev) => prev.filter((p) => p.property_id !== propertyId));
      toast.success("Removed from shortlist");
    } catch {
      toast.error("Failed to remove");
    }
  };

  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleWhatsApp = (phoneNumber: string, propertyTitle: string) => {
    const message = `Hi, I'm interested in your property: ${propertyTitle}. Please share more details.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank', 'noopener,noreferrer');
  };

  // ✅ FIXED: View Details with filter context for ShortlistTab
  const handleViewDetails = (property: any) => {
    const p = property.property || property;

    // Build public URL
    const origin = typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://investordeal.in";

    const slug = p?.slug || p?.property_slug || p?.id;
    const baseUrl = `${origin}/properties/${encodeURIComponent(String(slug))}`;

    // Create filter context
    const TRACKING_PARAM_KEY = "fltcnt";
    const STORAGE_KEY_LATEST = "re_filter_token";
    const STORAGE_KEY_PREFIX = "re_filter_payload";

    const randomToken = () => {
      if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return (crypto as any).randomUUID();
      }
      return `flt_${Math.random().toString(36).slice(2)}_${Date.now()}`;
    };

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
        source: "ShortlistTab",
        propertyId: p?.id ?? null,
        buyer: buyerSnap,
        from: {
          path: typeof window !== "undefined" ? window.location.pathname : undefined,
          query: typeof window !== "undefined" ? window.location.search : undefined,
        },
      };

      // Store as a separate key per token
      if (typeof window !== "undefined") {
        const k = `${STORAGE_KEY_PREFIX}:${token}`;
        localStorage.setItem(k, JSON.stringify(payload));
        localStorage.setItem(STORAGE_KEY_LATEST, token);
      }

      // Append ?fltcnt=token preserving existing params/hash
      const u = new URL(baseUrl, typeof window !== "undefined" ? window.location.origin : "https://investordeal.in");
      u.searchParams.set(TRACKING_PARAM_KEY, token);

      window.open(u.toString(), '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('❌ ShortlistTab - Error creating filter context:', error);
      // Fallback to basic URL
      window.open(baseUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">My Shortlist</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-600">{savedProps.length} properties</span>
          <button
            onClick={() => toast.info("Share feature coming soon")}
            className="flex items-center space-x-1 px-3 py-1.5 
             bg-gradient-to-r from-[#E6761D] to-[#CC6A1A] 
             text-white text-xs rounded-lg 
             hover:from-[#CC6A1A] hover:to-[#B85E15] 
             transition-all duration-300 shadow-sm"
          >
            <Share size={14} />
            <span>Share Shortlist</span>
          </button>

        </div>
      </div>

      {/* Loader skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden h-full flex flex-col animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-6 space-y-3">
                <div className="h-5 w-2/3 bg-gray-200 rounded" />
                <div className="h-4 w-1/3 bg-gray-200 rounded" />
                <div className="h-6 w-1/4 bg-gray-200 rounded" />
                <div className="h-8 w-full bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cards */}
      {!loading && savedProps.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {savedProps.map((sp) => {
            const p: any = sp.property ?? {};
            const img = firstImage(p);
            const title = pickComposedTitle(p);
            const loc = pickLocation(p);
            const price = pickPrice(p);
            const sqft = areaInSqft(p);

            // ✅ FIXED: Get contact info from assigned_to_user
            const assignedUser = p?.assigned_to_user;
            const phoneNumber = assignedUser?.phone || p?.contact_number || p?.phone || p?.seller_phone || '+911234567890';
            const sellerName = assignedUser?.name || p?.seller_name || p?.owner_name || 'Property Owner';

            const tags: string[] = Array.isArray(p?.tags) ? p.tags : [];

            const rating = typeof p?.rating === "number" ? p.rating : undefined;
            const views = Number(p?.total_views ?? p?.public_views ?? p?.views ?? 0) || undefined;
            const aiScore = Number(p?.aiScore) || undefined;

            return (
              <div key={sp.id} className="bg-white rounded-2xl shadow-lg overflow-hidden group h-full flex flex-col">
                {/* Image */}
                <div className="relative">
                  {img ? (
                    <div className="relative">
                      <img
                        src={img}
                        alt={title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-white text-2xl font-bold opacity-40 select-none">ResaleExpert.in</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      <Building className="text-gray-400" size={48} />
                    </div>
                  )}

                  {/* top-left: tags + AI */}
                  <div className="absolute top-3 left-3 flex items-start flex-wrap gap-2 z-20">
                    <div className="max-w-[72vw] sm:max-w-none overflow-hidden">
                      <PropertyTagsShortlist tags={tags} />
                    </div>
                    {aiScore && aiScore >= 90 && (
                      <span className="flex-none whitespace-nowrap bg-purple-600 text-white px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold leading-none flex items-center shadow-sm">
                        <Bot size={12} className="mr-1" />
                        AI {Math.round(aiScore)}
                      </span>
                    )}
                  </div>

                  {/* top-right: remove */}
                  <button
                    onClick={() => handleUnsave(sp.property_id)}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-white/90 text-red-600 hover:bg-red-50 shadow-sm"
                    title="Remove from shortlist"
                  >
                    <Bookmark className="fill-current" size={16} />
                  </button>

                  {/* bottom-left: rating/views */}
                  {(rating || views) && (
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      {rating && (
                        <div className="bg-white/90 rounded-full px-2 py-1 flex items-center gap-1">
                          <Star className="text-yellow-500" size={12} />
                          <span className="text-xs font-semibold text-gray-900">{rating.toFixed(1)}</span>
                        </div>
                      )}
                      {typeof views === "number" && (
                        <div className="bg-white/90 rounded-full px-2 py-1">
                          <span className="text-xs font-semibold text-gray-900">{views} views</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <div className="pr-4">
                      <div className="text-lg font-bold text-[#0b3856] mb-1 group-hover:text-[#E6761D] transition-colors">
                        {title}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin size={16} className="mr-2" />
                        <span className="line-clamp-1">{loc}</span>
                      </div>
                    </div>
                    {p?.id && (
                      <div className="text-lg text-gray-500">
                        {p.property_id?.toString().trim() || `REX${String(p.id).padStart(4, "0")}`}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xl font-bold text-green-600">{formatCurrencyShortlist(price)}</div>
                      <div className="text-sm text-gray-500">
                        {(p?.unit_type_name ??
                          p?.unit_type ??
                          p?.unitType ??
                          p?.property_type_name ??
                          p?.property_type ??
                          p?.type) || "-"}{" "}
                        • {sqft || "-"} sq ft
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Price per sq ft</div>
                      <div className="font-semibold text-gray-900">{pricePerSqft(price ?? undefined, sqft)}</div>
                    </div>
                  </div>

                  {/* ✅ FIXED: Seller Info with assigned_to_user data */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{sellerName}</div>
                        <div className="text-xs text-gray-600">{phoneNumber}</div>
                        {assignedUser?.email && (
                          <div className="text-xs text-gray-500">{assignedUser.email}</div>
                        )}
                      </div>
                      {assignedUser && (
                        <div className="text-right text-xs text-gray-500">
                          Executive
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions pinned to bottom */}
                  <div className="mt-auto flex items-center gap-2">
                    <button
                      onClick={() => handleViewDetails(sp)}
                      className="flex-1 bg-[#E6761D] text-white py-2 rounded-lg hover:bg-[#CC6A1A] transition-colors text-center font-semibold text-sm"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => handleCall(phoneNumber)}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      title={`Call ${sellerName}`}
                    >
                      <Phone size={16} />
                    </button>

                    <button
                      onClick={() => handleWhatsApp(phoneNumber, title)}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      title={`WhatsApp ${sellerName}`}
                    >
                      <FaWhatsapp size={16} />
                    </button>
                  </div>

                  <div className="mt-2 text-[11px] text-gray-500">
                    Saved on {new Date(sp.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && savedProps.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Bookmark className="mx-auto text-gray-300 mb-3" size={48} />
          <h3 className="text-base font-semibold text-gray-900 mb-1">No Properties Shortlisted</h3>
          <p className="text-xs text-gray-500 mb-4">Start exploring properties and add them to your shortlist</p>
          <button
            onClick={() => toast.info("Redirect to Explore Page")}
            className="px-4 py-2 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors"
          >
            Explore Properties
          </button>
        </div>
      )}
    </div>
  );
};

// Visits Tab (unchanged)
const VisitsTab = ({ buyer, onScheduleVisit }: any) => {
  const sampleVisits = [
    {
      id: 1,
      property: 'Luxury 3BHK Apartment',
      address: 'Skyline Towers, Andheri West',
      date: '2025-01-15',
      time: '10:00 AM',
      status: 'scheduled',
      seller: 'Rajesh Kumar',
      feedback: '',
      rating: 0
    },
    {
      id: 2,
      property: 'Premium Villa',
      address: 'Green Valley, Pune',
      date: '2025-01-10',
      time: '2:00 PM',
      status: 'completed',
      seller: 'Priya Sharma',
      feedback: 'Excellent property, loved the location and amenities',
      rating: 5
    }
  ];

  const getVisitStatusBadge = (status: string) => {
    const statusConfig = {
      'scheduled': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Scheduled', icon: '📅' },
      'completed': { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed', icon: '✅' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled', icon: '❌' },
      'rescheduled': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Rescheduled', icon: '🔄' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900">Site Visits</h3>
        <button
          onClick={onScheduleVisit}
          className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs"
        >
          <Plus size={14} />
          <span>Schedule Visit</span>
        </button>
      </div>

      {/* Visit Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-lg font-bold text-blue-600">{sampleVisits.length}</div>
          <div className="text-xs text-blue-700">Total Visits</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-lg font-bold text-green-600">{sampleVisits.filter(v => v.status === 'completed').length}</div>
          <div className="text-xs text-green-700">Completed</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-3">
          <div className="text-lg font-bold text-orange-600">{sampleVisits.filter(v => v.status === 'scheduled').length}</div>
          <div className="text-xs text-orange-700">Scheduled</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="text-lg font-bold text-purple-600">
            {sampleVisits.filter(v => v.rating >= 4).length}
          </div>
          <div className="text-xs text-purple-700">Highly Rated</div>
        </div>
      </div>

      {/* Visits List */}
      <div className="space-y-3">
        {sampleVisits.map((visit) => (
          <div key={visit.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">{visit.property}</h4>
                <div className="flex items-center space-x-1 text-gray-600 mt-0.5 text-xs">
                  <MapPin size={12} />
                  <span>{visit.address}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  {getVisitStatusBadge(visit.status)}
                  <span className="text-xs text-gray-500">{visit.date} • {visit.time}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-0.5">Seller: {visit.seller}</div>
                {visit.rating > 0 && (
                  <div className="flex items-center space-x-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < visit.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {visit.feedback && (
              <div className="bg-gray-50 rounded-lg p-2">
                <span className="text-gray-500 text-xs">Feedback:</span>
                <p className="text-gray-700 mt-0.5 text-xs">{visit.feedback}</p>
              </div>
            )}

            <div className="flex items-center space-x-2 mt-3">
              <button className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs">
                <Eye size={12} />
                <span>View Property</span>
              </button>
              {visit.status === 'completed' && (
                <button className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs">
                  <Calendar size={12} />
                  <span>Schedule Revisit</span>
                </button>
              )}
              <button className="flex items-center space-x-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs">
                <MessageCircle size={12} />
                <span>Contact Seller</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Loan Center Tab (unchanged)
const LoanCenterTab = ({ buyer, onShowLoanApplication }: any) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const loanOffers = [
    { bank: 'HDFC Bank', rate: 8.5, processing: 0.5, maxAmount: 20000000, features: ['Quick approval', 'Digital process'] },
    { bank: 'ICICI Bank', rate: 8.7, processing: 0.5, maxAmount: 18000000, features: ['Pre-approved', 'Online tracking'] },
    { bank: 'SBI', rate: 8.4, processing: 0.25, maxAmount: 22000000, features: ['Lowest rates', 'Government backing'] },
    { bank: 'Axis Bank', rate: 8.8, processing: 0.5, maxAmount: 19000000, features: ['Quick disbursal', 'Flexible EMI'] }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Loan Center</h3>
        <button
          onClick={onShowLoanApplication}
          className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={14} />
          <span>Apply for Loan</span>
        </button>
      </div>

      {/* Loan Status */}
      {buyer.financials?.loanRequired && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 text-sm mb-3">Your Loan Application</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-gray-500">Application ID:</span>
              <div className="font-medium">{buyer.financials.applicationId || 'Not Applied'}</div>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <div className="font-medium">{buyer.financials.loanStatus.replace('_', ' ')}</div>
            </div>
            <div>
              <span className="text-gray-500">Bank:</span>
              <div className="font-medium">{buyer.financials.bankPreference}</div>
            </div>
          </div>
        </div>
      )}

      {/* Loan Offers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h4 className="font-semibold text-gray-900 text-sm mb-3">Available Loan Offers</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {loanOffers.map((offer, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow text-xs"
            >
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-semibold text-gray-900">{offer.bank}</h5>
                <span className="text-green-600 font-bold">{offer.rate}%</span>
              </div>

              <div className="space-y-1 mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Max Amount:</span>
                  <span className="font-medium">{formatCurrency(offer.maxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Processing:</span>
                  <span className="font-medium">{offer.processing}%</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {offer.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px]"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              <button className="bg-green-600 text-white px-3 py-1 text-sm rounded-md hover:bg-green-700 transition-colors">
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Calculators Tab (unchanged)
const CalculatorsTab = ({ buyer, onShowEMICalculator }: any) => {
  const calculators = [
    {
      id: 'emi',
      title: 'EMI Calculator',
      description: 'Calculate your monthly EMI based on loan amount, interest rate, and tenure',
      icon: Calculator,
      color: 'blue',
      action: onShowEMICalculator
    },
    {
      id: 'affordability',
      title: 'Affordability Calculator',
      description: 'Find out how much property you can afford based on your income',
      icon: DollarSign,
      color: 'green',
      action: () => console.log('Affordability calculator')
    },
    {
      id: 'stamp_duty',
      title: 'Stamp Duty Calculator',
      description: 'Calculate stamp duty and registration charges for your property',
      icon: FileText,
      color: 'purple',
      action: () => console.log('Stamp duty calculator')
    },
    {
      id: 'roi',
      title: 'ROI Calculator',
      description: 'Calculate return on investment for property purchases',
      icon: TrendingUp,
      color: 'orange',
      action: () => console.log('ROI calculator')
    }
  ];

  return (
    <div className="p-6 space-y-6 text-xs">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Financial Calculators</h3>
        <p className="text-gray-600">Make informed decisions with our financial tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {calculators.map((calc) => {
          const Icon = calc.icon;
          return (
            <div
              key={calc.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 bg-${calc.color}-100 rounded-lg`}>
                  <Icon className={`text-${calc.color}-600`} size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1 text-sm">{calc.title}</h4>
                  <p className="text-gray-600 mb-3">{calc.description}</p>
                  <button
                    onClick={calc.action}
                    className={`w-full bg-${calc.color}-600 text-white py-1.5 px-3 text-xs rounded-md hover:bg-${calc.color}-700 transition-colors`}
                  >
                    Open Calculator
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick EMI Calculation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h4 className="font-semibold text-gray-900 mb-3 text-sm">Quick EMI Preview</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">₹45,678</div>
            <div className="text-blue-700 text-xs">Estimated EMI</div>
            <div className="text-gray-500 text-[10px]">For ₹1.8Cr @ 8.5%</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">₹7L</div>
            <div className="text-green-700 text-xs">Down Payment</div>
            <div className="text-gray-500 text-[10px]">30% of property value</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">20 Years</div>
            <div className="text-purple-700 text-xs">Loan Tenure</div>
            <div className="text-gray-500 text-[10px]">Recommended</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Market Insights Tab (unchanged)
const MarketInsightsTab = ({ buyer }: any) => {
  return (
    <div className="p-6 space-y-6 text-xs">
      <h3 className="text-lg font-bold text-gray-900">Market Insights</h3>

      {/* Market Overview for Buyer's Preferred Locations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {buyer.requirements.preferredLocations.slice(0, 3).map((location: string, index: number) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">{location}</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Avg. Price/sq ft:</span>
                <span className="font-bold text-green-600">₹{(15000 + index * 2000).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Price Trend:</span>
                <span className="font-bold text-blue-600">+{5 + index}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Demand:</span>
                <span className="font-bold text-purple-600">High</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Price Trends */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Price Trends - Your Preferred Areas</h4>
        <div className="h-56 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="mx-auto text-gray-400 mb-1" size={36} />
            <p className="text-gray-500">Interactive price trend charts will be displayed here</p>
          </div>
        </div>
      </div>

      {/* Investment Recommendations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Investment Recommendations</h4>
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1.5">
              <TrendingUp className="text-green-600" size={14} />
              <span className="font-medium text-green-800">Best Time to Buy</span>
            </div>
            <p className="text-[11px] text-green-700">
              Current market conditions are favorable for buyers in your budget range.
              Interest rates are stable and inventory levels provide good negotiation opportunities.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1.5">
              <Award className="text-blue-600" size={14} />
              <span className="font-medium text-blue-800">Recommended Areas</span>
            </div>
            <p className="text-[11px] text-blue-700">
              Based on your requirements, Andheri West and Bandra West offer the best value proposition
              with strong appreciation potential and excellent connectivity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// My Documents Tab (unchanged)
const MyDocumentsTab = ({ buyer }: any) => {
  const documentCategories = [
    { id: 'financial', label: 'Financial Documents', count: 4, color: 'green' },
    { id: 'identity', label: 'Identity Proofs', count: 2, color: 'blue' },
    { id: 'property', label: 'Property Documents', count: 3, color: 'purple' },
    { id: 'loan', label: 'Loan Documents', count: 2, color: 'orange' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">My Documents</h3>
        <button className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs">
          <Upload size={14} />
          <span>Upload</span>
        </button>
      </div>

      {/* Document Categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {documentCategories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 text-xs">{category.label}</h4>
                <p className="text-xs text-gray-600">{category.count} docs</p>
              </div>
              <div className={`w-3 h-3 bg-${category.color}-500 rounded-full`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Document Upload Guidelines */}
      <div className="bg-blue-50 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 mb-3 text-xs">Document Upload Guidelines</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <h5 className="font-medium text-blue-800 mb-1">Required for Loan Application:</h5>
            <ul className="space-y-0.5 text-blue-700">
              <li>• Last 3 months salary slips</li>
              <li>• Bank statements (6 months)</li>
              <li>• ITR for last 2 years</li>
              <li>• PAN and Aadhar cards</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-blue-800 mb-1">Property Documents:</h5>
            <ul className="space-y-0.5 text-blue-700">
              <li>• Property agreement copy</li>
              <li>• Builder NOC</li>
              <li>• Approved building plans</li>
              <li>• Property tax receipts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Tab (unchanged)
const ProfileTab = ({ buyer, onUpdateBuyer }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(buyer);

  const handleSave = () => {
    onUpdateBuyer(profileData);
    setIsEditing(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Profile Settings</h3>
        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs"
        >
          <Edit size={14} />
          <span>{isEditing ? 'Save' : 'Edit'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-3 text-xs">Personal Information</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs"
                readOnly={!isEditing}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs"
                readOnly={!isEditing}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs"
                readOnly={!isEditing}
              />
            </div>
          </div>
        </div>

        {/* Property Requirements */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-3 text-xs">Property Requirements</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Budget Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={profileData.budget.min}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      budget: { ...profileData.budget, min: Number(e.target.value) },
                    })
                  }
                  className="px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs"
                  placeholder="Min"
                  readOnly={!isEditing}
                />
                <input
                  type="number"
                  value={profileData.budget.max}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      budget: { ...profileData.budget, max: Number(e.target.value) },
                    })
                  }
                  className="px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs"
                  placeholder="Max"
                  readOnly={!isEditing}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Unit Type</label>
              <select
                value={profileData.requirements.unitTypes}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    requirements: { ...profileData.requirements, unitTypes: e.target.value },
                  })
                }
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs"
                disabled={!isEditing}
              >
                <option value="1BHK">1BHK</option>
                <option value="2BHK">2BHK</option>
                <option value="3BHK">3BHK</option>
                <option value="4BHK">4BHK</option>
                <option value="Villa">Villa</option>
                <option value="Penthouse">Penthouse</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Furnishing Preference</label>
              <select
                value={profileData.requirements.furnishing}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    requirements: { ...profileData.requirements, furnishing: e.target.value },
                  })
                }
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs"
                disabled={!isEditing}
              >
                <option value="Fully Furnished">Fully Furnished</option>
                <option value="Semi Furnished">Semi Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h4 className="font-semibold text-gray-900 mb-3 text-xs">Notification Preferences</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
              <span className="text-xs text-gray-700">New property matches</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
              <span className="text-xs text-gray-700">Price drop alerts</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
              <span className="text-xs text-gray-700">Visit reminders</span>
            </label>
          </div>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
              <span className="text-xs text-gray-700">Market insights</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
              <span className="text-xs text-gray-700">Promotional offers</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
              <span className="text-xs text-gray-700">Loan updates</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerAccountPage;