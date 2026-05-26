

// export default BuyerAccountPage;
import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  ArrowLeft,
  User,
  Building,
  FileText,
  SlidersHorizontal,
  CreditCard,
  Calculator,
  TrendingUp,
  Target,
  Bot,
  Calendar,
  MapPin,
  Eye,
  Bookmark,
  ExternalLink,
  Activity,
  BarChart3,
  X,
  Menu,
  LogOut,
  Share2,
  Home,
  Heart,
  Clock,
  FileCheck,
  Award,
  ChevronRight,
} from "lucide-react";
import PropertySuggestionModal from "./PropertySuggestionModal";
import LoanApplicationModal from "./LoanApplicationModal";
import EMICalculatorModal from "./EMICalculatorModal";
import PropertyMatchModal from "./PropertyMatchModal";
import VisitModal from "./VisitModal";
import { useProperties } from "@/hooks/properties";
import { useAuth } from "@/contexts/AuthContext";
import ShareModal from "@/pages/public/ShareModal";
import { toast } from "react-toastify";
import {
  buyerSavedAPI,
  BuyerSavedWithProperty,
} from "@/lib/buyerSavedPropertiesAPI";
import propertyTagsAPI from "@/lib/propertyTagsAPI";
import { getTagStyle, type TagTone } from "@/lib/tagStyles";
import ShortlistTab from "./buyeraccountcomponents/ShortlistTab";
import VisitsTab from "./buyeraccountcomponents/VisitsTab";
import LoanCenterTab from "./buyeraccountcomponents/LoanCenterTab";
import CalculatorsTab from "./buyeraccountcomponents/CalculatorsTab";
import MarketInsightsTab from "./buyeraccountcomponents/MarketInsightsTab";
import MyDocumentsTab from "./buyeraccountcomponents/MyDocumentsTab";
import ProfileTab from "./buyeraccountcomponents/ProfileTab";

// ESALE Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

const BuyerAccountPage = ({ buyer, onBack, onUpdateBuyer }: any) => {
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [showSidebar, setShowSidebar] = useState(false);

  const [showPropertySuggestions, setShowPropertySuggestions] = useState(false);
  const [showLoanApplication, setShowLoanApplication] = useState(false);
  const [showEMICalculator, setShowEMICalculator] = useState(false);
  const [showPropertyMatch, setShowPropertyMatch] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);

  const sidebarRef = useRef<HTMLDivElement | null>(null);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setShowSidebar(false);
    if (showSidebar) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showSidebar]);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!showSidebar) return;
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setShowSidebar(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSidebar]);

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

  return (
    <div
      className="h-screen w-full flex overflow-hidden"
      style={{ background: BG }}
    >
      {/* Sidebar - Compact, No Scroll */}
      <aside
        className="hidden md:flex w-64 shrink-0 flex-col h-full"
        style={{ background: "white", borderRight: `1px solid ${BD}` }}
      >
        <SidebarContent
          buyer={buyer}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          logout={logout}
          setShowPropertySuggestions={setShowPropertySuggestions}
          setShowEMICalculator={setShowEMICalculator}
        />
      </aside>

      {/* Mobile Drawer */}
      {showSidebar && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
            onClick={() => setShowSidebar(false)}
          />
          <div
            ref={sidebarRef}
            className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 translate-x-0"
            style={{ borderRight: `1px solid ${BD}` }}
          >
            <button
              className="absolute top-3 right-3 p-2 rounded-md hover:bg-gray-100"
              onClick={() => setShowSidebar(false)}
            >
              <X size={18} style={{ color: MU }} />
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
      <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0" style={{ background: N }}>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSidebar(true)}
                  className="p-1.5 rounded-lg text-white hover:bg-white/10 transition-colors md:hidden"
                >
                  <Menu size={18} />
                </button>
               <button
  onClick={() => window.history.back()}
  className="p-1.5 rounded-lg text-white hover:bg-white/10 transition-colors hidden sm:inline-flex"
>
  <ArrowLeft size={18} />
</button>
                <div>
                  <h2 className="text-sm font-bold" style={{ color: O }}>
                    Welcome, {buyer.salutation} {buyer.name}!
                  </h2>
                  <p className="text-[10px] text-white/70">
                    Your personalized property dashboard
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px]"
                  style={{ background: O, color: "white" }}
                  onClick={() =>
                    window.open("http://resaleexpert.in/", "_blank")
                  }
                >
                  <ExternalLink size={12} />
                  <span className="hidden sm:inline">Website</span>
                </button>
                <div className="text-right">
                  <div className="text-base font-bold" style={{ color: O }}>
                    {buyer.leadScore || "-"}
                  </div>
                  <div className="text-[8px] text-white/70">Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Full text on mobile */}
        <div
          className="shrink-0 overflow-x-auto border-b"
          style={{ background: "white", borderColor: BD }}
        >
          <div className="flex px-3 gap-0.5 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium transition-all border-b-2 whitespace-nowrap ${
                    isActive
                      ? `border-orange-500 text-orange-600`
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon size={13} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === "dashboard" && <DashboardTab buyer={buyer} />}
          {activeTab === "properties" && (
            <PropertySearchTab
              buyer={buyer}
              onShowPropertySuggestions={() => setShowPropertySuggestions(true)}
              onShowPropertyMatch={() => setShowPropertyMatch(true)}
            />
          )}
          {activeTab === "shortlist" && <ShortlistTab buyer={buyer} />}
          {activeTab === "visits" && (
            <VisitsTab
              buyer={buyer}
              onScheduleVisit={() => setShowVisitModal(true)}
            />
          )}
          {activeTab === "loans" && (
            <LoanCenterTab
              buyer={buyer}
              onShowLoanApplication={() => setShowLoanApplication(true)}
            />
          )}
          {activeTab === "calculators" && (
            <CalculatorsTab
              buyer={buyer}
              onShowEMICalculator={() => setShowEMICalculator(true)}
            />
          )}
          {activeTab === "insights" && <MarketInsightsTab buyer={buyer} />}
          {activeTab === "documents" && <MyDocumentsTab buyer={buyer} />}
          {activeTab === "profile" && (
            <ProfileTab buyer={buyer} onUpdateBuyer={onUpdateBuyer} />
          )}
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
          onSave={() => setShowVisitModal(false)}
        />
      )}
    </div>
  );
};

/* ================= Sidebar Content - Compact, No Scroll ================= */
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

  const reqRaw =
    typeof buyer?.requirements === "string"
      ? safeJson(buyer.requirements)
      : buyer?.requirements || {};
  let unitTypes = toArray(
    reqRaw?.unitTypes ??
      reqRaw?.unit_types ??
      reqRaw?.preferred_units ??
      reqRaw?.bhk,
  );
  if (unitTypes.length && unitTypes.every((x) => /^\d+(\s*bhk)?$/i.test(x))) {
    unitTypes = unitTypes.map((x) =>
      /\b\b/i.test(x) ? x.replace(/\s+/g, " ").toUpperCase() : `${x}`,
    );
  }

  const budgetMin =
    buyer?.budget?.min ?? buyer?.budget_min ?? buyer?.budgetMin ?? 0;
  const budgetMax =
    buyer?.budget?.max ?? buyer?.budget_max ?? buyer?.budgetMax ?? 0;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Profile Header - Compact */}
      <div className="p-3 border-b shrink-0" style={{ borderColor: BD }}>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm"
            style={{ background: O }}
          >
            {(buyer?.name || "U")?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="font-semibold text-xs truncate"
              style={{ color: N }}
            >
              {(buyer?.salutation ? buyer.salutation + " " : "") +
                (buyer?.name || "Unknown")}
            </div>
            <div className="text-[9px] truncate" style={{ color: MU }}>
              {[buyer?.city, buyer?.state].filter(Boolean).join(", ") || "—"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 text-[9px]">
          <div className="flex justify-between">
            <span style={{ color: MU }}>Budget</span>
            <span className="font-medium" style={{ color: O }}>
              {budgetMin || budgetMax
                ? `${formatCurrency(budgetMin)}-${formatCurrency(budgetMax)}`
                : "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: MU }}>Units</span>
            <span className="font-medium truncate" style={{ color: N }}>
              {unitTypes.length ? unitTypes.join(",") : "—"}
            </span>
          </div>
          <div className="flex justify-between col-span-2">
            <span style={{ color: MU }}>Lead Score</span>
            <span
              className="font-medium px-1.5 py-0 rounded-full text-[8px]"
              style={{ background: `${O}15`, color: O }}
            >
              {buyer?.leadScore ?? 0}/100
            </span>
          </div>
        </div>
      </div>

      {/* Navigation - Compact, No Scroll */}
      <nav className=" overflow-y-auto min-h-0 py-2 px-2 space-y-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-all text-left ${
                isActive ? "shadow-sm" : "hover:bg-gray-50"
              }`}
              style={
                isActive ? { background: `${O}10`, color: O } : { color: MU }
              }
            >
              <Icon size={14} />
              <span className="text-xs font-medium">{tab.label}</span>
              {isActive && (
                <ChevronRight
                  size={12}
                  className="ml-auto"
                  style={{ color: O }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions - Compact */}
      <div
        className="p-2 border-t space-y-1.5 shrink-0 overflow-hidden "
        style={{ borderColor: BD }}
      >
        <button
          onClick={() => setShowPropertySuggestions(true)}
          className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-white text-[10px] font-medium transition-all"
          style={{ background: O }}
        >
          <Bot size={12} />
          <span>AI Search</span>
        </button>
        <button
          onClick={() => setShowEMICalculator(true)}
          className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-white text-[10px] font-medium transition-all"
          style={{ background: N }}
        >
          <Calculator size={12} />
          <span>EMI Calc</span>
        </button>
        <button
          onClick={async () => {
            await logout();
            window.location.href = "/login";
          }}
          className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all hover:bg-gray-100"
          style={{ color: MU }}
        >
          <LogOut size={12} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

// Dashboard Tab
const DashboardTab: React.FC<{ buyer: any }> = ({ buyer }) => {
  const [shortlistedCount, setShortlistedCount] = useState<number>(0);
  const [shortlistLoading, setShortlistLoading] = useState<boolean>(true);

  const localShortlistCount = useMemo(
    () =>
      buyer?.matchedProperties?.filter((p: any) => p?.status === "shortlisted")
        .length || 0,
    [buyer?.matchedProperties],
  );
  const buyerId = useMemo(
    () => Number(buyer?.id ?? buyer?.buyer_id ?? 0),
    [buyer?.id, buyer?.buyer_id],
  );

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

  const stats = [
    {
      label: "Property Viewed",
      value: buyer?.visits || 0,
      icon: Eye,
      color: "blue",
    },
    {
      label: "Shortlisted",
      value: shortlistLoading ? "—" : shortlistedCount,
      icon: Heart,
      color: "red",
    },
    {
      label: "Visits Scheduled",
      value:
        buyer?.followups?.filter((f: any) => f?.type === "visit").length || 0,
      icon: Calendar,
      color: "green",
    },
    {
      label: "Documents",
      value: buyer?.documents?.length || 0,
      icon: FileText,
      color: "purple",
    },
  ];

  const getColorStyles = (color: string) => {
    const styles: Record<string, { bg: string; text: string }> = {
      blue: { bg: "#dbeafe", text: "#2563eb" },
      red: { bg: "#fee2e2", text: "#dc2626" },
      green: { bg: "#dcfce7", text: "#16a34a" },
      purple: { bg: "#f3e8ff", text: "#9333ea" },
    };
    return styles[color] || styles.blue;
  };

  return (
    <div className="p-3 space-y-3">
      {/* Stats Cards - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colors = getColorStyles(stat.color);
          return (
            <div
              key={index}
              className="rounded-lg p-2"
              style={{ background: "white", border: `1px solid ${BD}` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-[9px] font-medium uppercase"
                    style={{ color: MU }}
                  >
                    {stat.label}
                  </p>
                  <p className="text-sm font-bold" style={{ color: N }}>
                    {stat.value}
                  </p>
                </div>
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ background: colors.bg }}
                >
                  <Icon size={12} style={{ color: colors.text }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div
          className="rounded-lg p-2"
          style={{ background: "white", border: `1px solid ${BD}` }}
        >
          <h3
            className="text-[10px] font-semibold mb-1.5 flex items-center gap-1"
            style={{ color: N }}
          >
            <Home size={10} style={{ color: O }} /> Property
          </h3>
          <div className="space-y-1">
            {" "}
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
        <div
          className="rounded-lg p-2"
          style={{ background: "white", border: `1px solid ${BD}` }}
        >
          <h3
            className="text-[10px] font-semibold mb-1.5 flex items-center gap-1"
            style={{ color: N }}
          >
            <CreditCard size={10} style={{ color: O }} /> Financial
          </h3>
          <div className="space-y-1">
            {" "}
            <button
              className="w-full text-xs text-white py-1.5 px-3 rounded-lg hover:bg-orange-700 transition-colors"
              style={{ background: O }}
            >
              EMI Calculator
            </button>
            <button className="w-full text-xs bg-blue-400 text-white py-1.5 px-3 rounded-lg hover:bg-indigo-700 transition-colors">
              Loan Application
            </button>
            <button className="w-full text-xs bg-teal-600 text-white py-1.5 px-3 rounded-lg hover:bg-teal-700 transition-colors">
              Affordability Calculator
            </button>
          </div>
        </div>
        <div
          className="rounded-lg p-2"
          style={{ background: "white", border: `1px solid ${BD}` }}
        >
          <h3
            className="text-[10px] font-semibold mb-1.5 flex items-center gap-1"
            style={{ color: N }}
          >
            <TrendingUp size={10} style={{ color: O }} /> Market
          </h3>
          <div className="space-y-1">
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
      <div
        className="rounded-lg p-2"
        style={{ background: "white", border: `1px solid ${BD}` }}
      >
        <h3
          className="text-[10px] font-semibold mb-1.5 flex items-center gap-1"
          style={{ color: N }}
        >
          <Activity size={10} style={{ color: O }} /> Recent Activity
        </h3>
        {buyer?.activities?.length > 0 ? (
          <div className="space-y-1">
            {buyer.activities.slice(0, 3).map((activity: any) => (
              <div
                key={activity.id}
                className="flex items-center gap-2 p-1.5 rounded"
                style={{ background: BG }}
              >
                <div
                  className="w-5 h-5 rounded flex items-center justify-center"
                  style={{ background: `${O}15` }}
                >
                  <Activity size={10} style={{ color: O }} />
                </div>
                <div className="flex-1">
                  <div className="text-[9px] font-medium" style={{ color: N }}>
                    {activity.description}
                  </div>
                  <div className="text-[8px]" style={{ color: MU }}>
                    {activity.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <Activity
              size={20}
              className="mx-auto mb-1"
              style={{ color: MU }}
            />
            <p className="text-[9px]" style={{ color: MU }}>
              No recent activities
            </p>
          </div>
        )}
      </div>

      {/* Recommended Properties */}
      <div
        className="rounded-lg p-2"
        style={{ background: "white", border: `1px solid ${BD}` }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <h3
            className="text-[10px] font-semibold flex items-center gap-1"
            style={{ color: N }}
          >
            <Award size={10} style={{ color: O }} /> Recommended
          </h3>
          <button className="text-[8px] font-medium" style={{ color: O }}>
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {buyer?.matchedProperties?.slice(0, 2).map((property: any) => (
            <div
              key={property.id}
              className="rounded p-2"
              style={{ border: `1px solid ${BD}`, background: BG }}
            >
              <div className="flex items-start justify-between mb-1">
                <h4
                  className="text-[9px] font-semibold truncate"
                  style={{ color: N }}
                >
                  {property.title}
                </h4>
                <span
                  className="px-1 py-0 rounded text-[7px] font-medium"
                  style={{ background: `${O}15`, color: O }}
                >
                  {property.matchScore}%
                </span>
              </div>
              <p className="text-[8px] mb-1 truncate" style={{ color: MU }}>
                {property.address}
              </p>
              <div className="text-[9px] font-bold mb-1.5" style={{ color: O }}>
                {formatCurrency(property.price)}
              </div>
              <div className="flex gap-1">
                <button
                  className="flex-1 text-[8px] py-1 rounded text-white"
                  style={{ background: N }}
                >
                  Details
                </button>
                <button
                  className="flex-1 text-[8px] py-1 rounded text-white"
                  style={{ background: O }}
                >
                  Visit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Property Search Tab - Keep all existing logic, just update styling for compactness
type PropertySearchTabProps = {
  buyer: any;
  onShowPropertySuggestions: () => void;
  onShowPropertyMatch: () => void;
  onVisitClick?: (p: any) => void;
};

export const PropertySearchTab: React.FC<PropertySearchTabProps> = ({
  buyer,
  onShowPropertySuggestions,
  onShowPropertyMatch,
  onVisitClick,
}) => {
  // All existing logic remains exactly the same
  // Only the JSX styling is updated for compact layout

  const computeEnhancedMatchScore = (property: any, buyer: any) => {
    let score = 0;
    const propertyPrice = Number(property?.price || property?.final_price || 0);
    const buyerBudgetMin = Number(buyer?.budget?.min || buyer?.budget_min || 0);
    const buyerBudgetMax = Number(buyer?.budget?.max || buyer?.budget_max || 0);
    if (buyerBudgetMin > 0 && buyerBudgetMax > 0) {
      if (propertyPrice >= buyerBudgetMin && propertyPrice <= buyerBudgetMax)
        score += 30;
      else if (propertyPrice <= buyerBudgetMax * 1.2) score += 15;
      else if (propertyPrice <= buyerBudgetMax * 1.5) score += 10;
    }
    const buyerLocations =
      buyer?.requirements?.preferredLocations ||
      buyer?.preferred_locations ||
      [];
    const propertyLocation =
      property?.location_name || property?.location || property?.area || "";
    if (Array.isArray(buyerLocations) && buyerLocations.length > 0) {
      if (
        buyerLocations.some((loc: string) =>
          propertyLocation.toLowerCase().includes(loc.toLowerCase()),
        )
      )
        score += 25;
    } else if (
      buyer?.city &&
      propertyLocation.toLowerCase().includes(buyer.city.toLowerCase())
    )
      score += 15;
    const buyerUnitTypes =
      buyer?.requirements?.unitTypes || buyer?.preferred_units || [];
    const propertyUnitType =
      property?.unit_type_name || property?.unit_type || "";
    if (
      Array.isArray(buyerUnitTypes) &&
      buyerUnitTypes.length > 0 &&
      buyerUnitTypes.some((unit: string) =>
        propertyUnitType.toLowerCase().includes(unit.toLowerCase()),
      )
    )
      score += 20;
    const buyerPropertyType =
      buyer?.requirements?.propertyType || buyer?.preferred_property_type || "";
    const propertyType =
      property?.property_type_name || property?.property_type || "";
    if (
      buyerPropertyType &&
      propertyType.toLowerCase().includes(buyerPropertyType.toLowerCase())
    )
      score += 15;
    if (property?.is_featured || property?.is_rera || property?.rera_number)
      score += 10;
    return Math.min(score, 100);
  };

  const composePropertyTitle = (property: any) => {
    const type = property?.property_type_name || property?.property_type || "";
    const unitType = property?.unit_type_name || property?.unit_type || "";
    const subtype =
      property?.property_subtype_name || property?.property_subtype || "";
    const parts = [type, unitType, subtype].filter(Boolean);
    return parts.length > 0 ? parts.join(" • ") : "Property Listing";
  };

  const getPossessionDisplay = (property: any) => {
    if (property?.possession_status) return property.possession_status;
    if (property?.possession_date)
      return `Ready by ${property.possession_date}`;
    if (property?.under_construction) return "Under Construction";
    if (property?.ready_to_move) return "Ready to Move";
    return "Immediate";
  };

  const getFloorDisplay = (property: any) => {
    if (property?.floor) return `${property.floor}`;
    if (property?.floor_number) return `${property.floor_number}`;
    if (property?.total_floors && property?.floor_range)
      return `${property.floor_range} of ${property.total_floors}`;
    return "Info not available";
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

  const ORIGIN =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://resaleexpert.in";
  const NO_IMAGE_SVG =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200"><rect width="320" height="200" fill="#f3f4f6"/><g fill="#9ca3af" font-family="Arial" font-size="14"><text x="160" y="102" text-anchor="middle">No Image</text></g></svg>`,
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
      } catch {}
      return v
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  const firstImageFromAny = (raw: any): string | null => {
    const candidates = [
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
    try {
      if (raw?.media && typeof raw.media === "object") {
        const arr = Array.isArray(raw.media)
          ? raw.media
          : Object.values(raw.media);
        const first = arr?.[0];
        if (typeof first === "string") return absolutize(first);
        if (first?.url) return absolutize(first.url);
        if (first?.src) return absolutize(first.src);
      }
    } catch {}
    return null;
  };

  const PropertyImage: React.FC<{ src?: string | null; alt?: string }> = ({
    src,
    alt,
  }) => {
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
  const [shareOpen, setShareOpen] = useState(false);
  const [shareData, setShareData] = useState<any>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

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
      (flag) =>
        flag === true ||
        flag === 1 ||
        flag === "1" ||
        flag === "true" ||
        flag === "yes",
    );
  };

  const normalized = useMemo(
    () =>
      Array.isArray(properties)
        ? properties.map((p) => makeItem(p, buyer))
        : [],
    [properties, buyer, makeItem],
  );
  const publicProperties = useMemo(
    () => normalized.filter(isPublicProperty),
    [normalized],
  );

  const handleSearch = async () => {
    await searchProperties({
      location: searchFilters.location || undefined,
      minPrice:
        searchFilters.minPrice !== null ? searchFilters.minPrice : undefined,
      maxPrice:
        searchFilters.maxPrice !== null ? searchFilters.maxPrice : undefined,
      sort: searchFilters.sort,
      propertyType: (searchFilters as any).propertyType || undefined,
      unitTypes: searchFilters.unitTypes.length
        ? searchFilters.unitTypes
        : undefined,
      // is_public: 1,
    });
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

  const TRACKING_PARAM_KEY = "fltcnt";
  const STORAGE_KEY_LATEST = "re_filter_token";
  const STORAGE_KEY_PREFIX = "re_filter_payload";

  const randomToken = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto)
      return (crypto as any).randomUUID();
    return `flt_${Math.random().toString(36).slice(2)}_${Date.now()}`;
  };

  const withFilterContext = (rawUrl: string, property: any) => {
    try {
      const token = randomToken();
      const buyerSnap = {
        name: buyer?.name || undefined,
        budgetMin: buyer?.budget?.min ?? buyer?.budget_min ?? undefined,
        budgetMax: buyer?.budget?.max ?? buyer?.budget_max ?? undefined,
        unitType:
          buyer?.requirements?.unitType ??
          buyer?.requirements?.unitTypes ??
          undefined,
        preferredLocations:
          buyer?.requirements?.preferredLocations ??
          buyer?.requirements?.preferredlocations ??
          undefined,
        city: buyer?.requirements?.city ?? buyer?.city ?? undefined,
      };
      const payload = {
        ts: Date.now(),
        source: "PropertySearchTab",
        propertyId: property?.id ?? property?._raw?.id ?? null,
        respectBuyerBudget,
        appliedFilters,
        buyer: buyerSnap,
        from: {
          path:
            typeof window !== "undefined"
              ? window.location.pathname
              : undefined,
          query:
            typeof window !== "undefined" ? window.location.search : undefined,
        },
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(
          `${STORAGE_KEY_PREFIX}:${token}`,
          JSON.stringify(payload),
        );
        localStorage.setItem(STORAGE_KEY_LATEST, token);
      }
      const u = new URL(rawUrl, ORIGIN);
      u.searchParams.set(TRACKING_PARAM_KEY, token);
      return { token, urlWithToken: u.toString() };
    } catch {
      return { token: undefined, urlWithToken: rawUrl };
    }
  };

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
    if (slug)
      return `${ORIGIN}/properties/${encodeURIComponent(String(slug).replace(/^\/+/, ""))}`;
    if (id) return `${ORIGIN}/properties/${encodeURIComponent(String(id))}`;
    return `${ORIGIN}/properties`;
  };

  const extractPropertyTags = (property: any): string[] => {
    const raw = property._raw || property;
    const tags: string[] = [];
    if (Array.isArray(raw?.tags))
      tags.push(...raw.tags.filter(Boolean).map(String));
    else if (typeof raw?.tags === "string") tags.push(...toArraySafe(raw.tags));
    if (Array.isArray(raw?.amenities))
      tags.push(...raw.amenities.slice(0, 3).filter(Boolean).map(String));
    if (raw?.is_featured) tags.push("Featured");
    if (raw?.is_rera || raw?.rera_number) tags.push("RERA Approved");
    if (raw?.ready_to_move) tags.push("Ready to Move");
    if (raw?.under_construction) tags.push("Under Construction");
    if (raw?.is_resale) tags.push("Resale");
    return Array.from(new Set(tags)).slice(0, 5);
  };

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
          if (
            Math.max(pMin ?? -Infinity, left) >
            Math.min(pMax ?? Infinity, right)
          )
            return false;
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
    if (respectBuyerBudget)
      list = list.filter((p) => isWithinBuyerBudget(p, buyer));
    return list.map((p: any) => {
      const raw = p._raw ?? p;
      return {
        id: String(raw?.id ?? raw?.property_id ?? raw?._id ?? Math.random()),
        title: composePropertyTitle(raw),
        address: addressFrom(p),
        price: priceFrom(p),
        size: sizeFrom(p),
        floorLine: getFloorDisplay(raw),
        facing: facingFrom(p),
        parking: parkingFrom(p),
        possession: getPossessionDisplay(raw),
        amenities: p?.amenities || [],
        statusText: p?.status || "Available",
        matchScore: computeEnhancedMatchScore(raw, buyer),
        photo: resolvePhoto(p),
        _raw: raw,
        reasons: computeReasons(p, buyer),
        publicUrl: buildPropertyUrl(raw),
        tags: extractPropertyTags(p),
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
      <span
        className={`px-1.5 py-0.5 rounded-full text-[8px] font-medium ${cls}`}
      >
        {status || "Available"}
      </span>
    );
  };

  const toggleShortlist = async (property: any) => {
    const propertyId = Number(property._raw?.id || property.id);
    if (!propertyId) {
      toast.error("Invalid property ID");
      return;
    }
    try {
      if (shortlisted.has(property.id)) {
        await buyerSavedAPI.toggle(buyer.id, propertyId, "unsave");
        setShortlisted((prev) => {
          const next = new Set(prev);
          next.delete(property.id);
          return next;
        });
        toast.success("Removed");
      } else {
        await buyerSavedAPI.toggle(buyer.id, propertyId, "save");
        setShortlisted((prev) => new Set(prev.add(property.id)));
        toast.success("Added");
      }
    } catch (error) {
      toast.error("Failed to update shortlist");
    }
  };

  useEffect(() => {
    const loadShortlisted = async () => {
      if (!buyer?.id) return;
      try {
        const saved = await buyerSavedAPI.listByBuyer(buyer.id, {
          includeProperty: true,
        });
        const savedIds = (Array.isArray(saved) ? saved : []).map((item: any) =>
          String(item.property_id || item.property?.id),
        );
        setShortlisted(new Set(savedIds));
      } catch (error) {
        console.error(error);
      }
    };
    loadShortlisted();
  }, [buyer?.id]);

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
    if (urlWithToken)
      window.open(urlWithToken, "_blank", "noopener,noreferrer");
  };
  const handleViewDetails = (property: any) => {
    const baseUrl = property.publicUrl || buildPropertyUrl(property._raw);
    const { urlWithToken } = withFilterContext(baseUrl, property);
    if (urlWithToken)
      window.open(urlWithToken, "_blank", "noopener,noreferrer");
  };

  const PropertyTags = ({
    propertyId,
    tags,
  }: {
    propertyId?: string | number;
    tags?: string[];
  }) => {
    const [propertyTags, setPropertyTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
      const fetchTags = async () => {
        if (!propertyId) {
          setPropertyTags(tags || []);
          return;
        }
        try {
          setLoading(true);
          const tagRes = await propertyTagsAPI.getById(propertyId);
          let apiTags: string[] = [];
          if (tagRes && typeof tagRes === "object") {
            if (Array.isArray((tagRes as any).tags))
              apiTags = (tagRes as any).tags
                .filter((tag: any) => tag != null)
                .map(String);
            else if (typeof (tagRes as any).tags === "string")
              apiTags = (tagRes as any).tags
                .split(",")
                .map((tag: string) => tag.trim())
                .filter(Boolean);
            else if (Array.isArray(tagRes))
              apiTags = tagRes.filter((tag: any) => tag != null).map(String);
          }
          setPropertyTags(apiTags.length > 0 ? apiTags : tags || []);
        } catch (error) {
          setPropertyTags(tags || []);
        } finally {
          setLoading(false);
        }
      };
      fetchTags();
    }, [propertyId, tags]);
    if (loading)
      return (
        <div className="flex flex-wrap gap-1 mt-1">
          <span className="px-1.5 py-0.5 rounded-full text-[7px] bg-gray-200 text-gray-200 animate-pulse">
            Loading
          </span>
        </div>
      );
    if (!propertyTags || propertyTags.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {propertyTags.slice(0, 3).map((tag, idx) => {
          const style = getTagStyle(tag);
          return (
            <span
              key={idx}
              className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[7px] font-medium ${style.bg} ${style.text}`}
            >
              {tag}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-3 space-y-3">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold" style={{ color: N }}>
          Property Search
        </h3>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={onShowPropertyMatch}
            className="flex items-center gap-1 px-2 py-1 text-[9px] rounded-md"
            style={{ background: N, color: "white" }}
          >
            <Target size={10} />
            <span>Smart Match</span>
          </button>
          <button
            onClick={onShowPropertySuggestions}
            className="flex items-center gap-1 px-2 py-1 text-[9px] rounded-md"
            style={{ background: O, color: "white" }}
          >
            <Bot size={10} />
            <span>AI Search</span>
          </button>
          <button
            onClick={() => {
              if (showFilters) setShowFilters(false);
              else {
                setShowFilters(true);
                setTimeout(
                  () =>
                    filtersRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    }),
                  100,
                );
              }
            }}
            className="flex items-center gap-1 px-2 py-1 text-[9px] rounded-md"
            style={{ background: `${O}15`, color: O }}
          >
            <SlidersHorizontal size={10} />
            <span>{showFilters ? "Hide" : "Filters"}</span>
          </button>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={respectBuyerBudget}
              onChange={(e) => setRespectBuyerBudget(e.target.checked)}
              className="w-3 h-3 rounded"
              style={{ accentColor: O }}
            />
            <span className="text-[8px]" style={{ color: MU }}>
              Budget
            </span>
          </label>
        </div>
      </div>

      {/* Filters */}
      <div ref={filtersRef} className="scroll-mt-16">
        {showFilters && (
          <div
            className="rounded-lg p-2"
            style={{ background: BG, border: `1px solid ${BD}` }}
          >
            <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5">
              <div>
                <label
                  className="block text-[8px] font-medium mb-0.5"
                  style={{ color: MU }}
                >
                  Location
                </label>
                <input
                  type="text"
                  value={searchFilters.location}
                  onChange={(e) =>
                    setSearchFilters({
                      ...searchFilters,
                      location: e.target.value,
                    })
                  }
                  className="w-full px-1.5 py-1 border rounded text-[9px]"
                  style={{ borderColor: BD }}
                  placeholder="Location"
                />
              </div>
              <div>
                <label
                  className="block text-[8px] font-medium mb-0.5"
                  style={{ color: MU }}
                >
                  Min Price
                </label>
                <input
                  type="number"
                  placeholder="Min"
                  value={searchFilters.minPrice ?? ""}
                  onChange={(e) =>
                    setSearchFilters({
                      ...searchFilters,
                      minPrice:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                  className="w-full px-1.5 py-1 border rounded text-[9px]"
                  style={{ borderColor: BD }}
                />
              </div>
              <div>
                <label
                  className="block text-[8px] font-medium mb-0.5"
                  style={{ color: MU }}
                >
                  Max Price
                </label>
                <input
                  type="number"
                  placeholder="Max"
                  value={searchFilters.maxPrice ?? ""}
                  onChange={(e) =>
                    setSearchFilters({
                      ...searchFilters,
                      maxPrice:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                  className="w-full px-1.5 py-1 border rounded text-[9px]"
                  style={{ borderColor: BD }}
                />
              </div>
              <div>
                <label
                  className="block text-[8px] font-medium mb-0.5"
                  style={{ color: MU }}
                >
                  Unit Types
                </label>
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
                  className="w-full px-1.5 py-1 border rounded text-[9px]"
                  style={{ borderColor: BD }}
                  placeholder="1BHK,2BHK"
                />
              </div>
              <div>
                <label
                  className="block text-[8px] font-medium mb-0.5"
                  style={{ color: MU }}
                >
                  Sort
                </label>
                <select
                  value={searchFilters.sort}
                  onChange={(e) =>
                    setSearchFilters({
                      ...searchFilters,
                      sort: e.target.value as SortKey,
                    })
                  }
                  className="w-full px-1.5 py-1 border rounded text-[9px]"
                  style={{ borderColor: BD }}
                >
                  <option value="newest">Newest</option>
                  <option value="low_to_high">Price Low-High</option>
                  <option value="high_to_low">Price High-Low</option>
                </select>
              </div>
            </div>
            <div className="mt-1.5 flex items-center justify-end gap-1.5">
              <button
                onClick={handleResetFilters}
                className="px-2 py-0.5 text-[8px] rounded"
                style={{ background: BG, border: `1px solid ${BD}`, color: MU }}
              >
                Reset
              </button>
              <button
                onClick={handleSearch}
                className="px-2 py-0.5 text-[8px] rounded text-white"
                style={{ background: O }}
              >
                Search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div
        className="rounded-lg p-2"
        style={{ background: "white", border: `1px solid ${BD}` }}
      >
        <h4 className="text-[10px] font-semibold mb-2" style={{ color: N }}>
          Results ({mappedItems.length})
        </h4>
        {loadingProps && (
          <div className="text-center py-6 text-[10px]" style={{ color: MU }}>
            Loading properties...
          </div>
        )}
        {propsError && !loadingProps && (
          <div className="text-center py-6 text-[10px] text-red-600">
            {propsError}
          </div>
        )}
        {!loadingProps && !propsError && mappedItems.length === 0 && (
          <div className="text-center py-6">
            <Building
              size={28}
              className="mx-auto mb-2"
              style={{ color: MU }}
            />
            {hasSearched ? (
              <>
                <p className="text-[9px] mb-2" style={{ color: MU }}>
                  No results found
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-2 py-0.5 text-[8px] rounded"
                  style={{
                    background: BG,
                    border: `1px solid ${BD}`,
                    color: MU,
                  }}
                >
                  Reset
                </button>
              </>
            ) : (
              <>
                <p className="text-[9px] mb-2" style={{ color: MU }}>
                  Start your property search
                </p>
                <div className="flex gap-1 justify-center">
                  <button
                    onClick={onShowPropertySuggestions}
                    className="px-2 py-0.5 text-[8px] rounded text-white"
                    style={{ background: O }}
                  >
                    AI Search
                  </button>
                  <button
                    onClick={onShowPropertyMatch}
                    className="px-2 py-0.5 text-[8px] rounded text-white"
                    style={{ background: N }}
                  >
                    Smart Match
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        {!loadingProps && !propsError && mappedItems.length > 0 && (
          <div className="space-y-2">
            {mappedItems.map((property) => (
              <div
                key={property.id}
                className="rounded-lg p-2"
                style={{ background: BG, border: `1px solid ${BD}` }}
              >
                <div className="flex gap-2">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-none">
                    <PropertyImage src={property.photo} alt={property.title} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-1">
                      <div className="flex-1">
                        <h4
                          className="text-[10px] font-semibold truncate"
                          style={{ color: N }}
                        >
                          {property.title}
                        </h4>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          <MapPin size={8} style={{ color: MU }} />
                          <span
                            className="text-[8px] truncate"
                            style={{ color: MU }}
                          >
                            {property.address || "—"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          <span
                            className={`px-1 py-0 rounded-full text-[7px] font-semibold ${getMatchScoreColor(property.matchScore)}`}
                          >
                            {property.matchScore}%
                          </span>
                          <AvailabilityBadge status={property.statusText} />
                          {shortlisted.has(property.id) && (
                            <span
                              className="px-1 py-0 rounded-full text-[7px]"
                              style={{ background: `${O}15`, color: O }}
                            >
                              ⭐
                            </span>
                          )}
                        </div>
                        <PropertyTags
                          propertyId={property._raw?.id || property.id}
                          tags={property.tags}
                        />
                      </div>
                      <div className="text-right">
                        <div
                          className="text-[10px] font-bold"
                          style={{ color: O }}
                        >
                          {formatCurrency(property.price)}
                        </div>
                        <div className="text-[7px]" style={{ color: MU }}>
                          {property.size}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-1 mt-1 text-[7px]">
                      <div>
                        <span style={{ color: MU }}>Floor:</span>{" "}
                        <span style={{ color: N }}>{property.floorLine}</span>
                      </div>
                      <div>
                        <span style={{ color: MU }}>Facing:</span>{" "}
                        <span style={{ color: N }}>{property.facing}</span>
                      </div>
                      <div>
                        <span style={{ color: MU }}>Possession:</span>{" "}
                        <span style={{ color: N }}>{property.possession}</span>
                      </div>
                      <div>
                        <span style={{ color: MU }}>Parking:</span>{" "}
                        <span style={{ color: N }}>{property.parking}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                      <button
                        onClick={() =>
                          onVisitClick ? onVisitClick(property) : null
                        }
                        className="flex items-center gap-0.5 px-1.5 py-0.5 text-[7px] rounded"
                        style={{ background: N, color: "white" }}
                      >
                        <Calendar size={8} />
                        <span>Visit</span>
                      </button>
                      <button
                        onClick={() => toggleShortlist(property)}
                        className={`flex items-center gap-0.5 px-1.5 py-0.5 text-[7px] rounded ${shortlisted.has(property.id) ? "text-white" : ""}`}
                        style={
                          shortlisted.has(property.id)
                            ? { background: O }
                            : { background: `${O}15`, color: O }
                        }
                      >
                        <Bookmark size={8} />
                        <span>
                          {shortlisted.has(property.id) ? "Saved" : "Save"}
                        </span>
                      </button>
                      <button
                        onClick={() => handleViewDetails(property)}
                        className="flex items-center gap-0.5 px-1.5 py-0.5 text-[7px] rounded"
                        style={{
                          background: BG,
                          border: `1px solid ${BD}`,
                          color: MU,
                        }}
                      >
                        <Eye size={8} />
                        <span>Details</span>
                      </button>
                      <button
                        onClick={() => openWebsite(property)}
                        className="flex items-center gap-0.5 px-1.5 py-0.5 text-[7px] rounded"
                        style={{
                          background: BG,
                          border: `1px solid ${BD}`,
                          color: MU,
                        }}
                      >
                        <ExternalLink size={8} />
                        <span>Site</span>
                      </button>
                      <button
                        onClick={() => openShare(property)}
                        className="flex items-center gap-0.5 px-1.5 py-0.5 text-[7px] rounded"
                        style={{
                          background: BG,
                          border: `1px solid ${BD}`,
                          color: MU,
                        }}
                      >
                        <Share2 size={8} />
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
