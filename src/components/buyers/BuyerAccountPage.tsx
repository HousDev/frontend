import React, { useEffect, useState, useMemo, useRef } from 'react';
import { ArrowLeft, User, Building, FileText, SlidersHorizontal, CreditCard, Calculator, TrendingUp, Target, Bot, Calendar, Phone, Mail, MessageCircle, MapPin, DollarSign, Eye, Download, Upload, Share, Plus, Edit, Trash2, Star, Award, CheckCircle, AlertCircle, Bell, Shield, Crown, Gem, Heart, Bookmark, Flag, Tag, Link, ExternalLink, Copy, Send, Printer, Archive, RefreshCw, Filter, Search, SortAsc, Grid, List, Maximize2, MoreHorizontal, Settings, Activity, BarChart3, PieChart, Home, Car, Wifi, Dumbbell, TreePine, Waves, Zap, Flame, Droplets, Snowflake, Sun, Moon, Wind, Mountain, Flower, Coffee, Clock, Users, Globe, Smartphone, Laptop, Headphones, Camera, Video, Music, Book, Briefcase, ShoppingBag, Gift, Plane, Train, Bus, Bike, Truck } from 'lucide-react';
import PropertySuggestionModal from './PropertySuggestionModal';
import LoanApplicationModal from './LoanApplicationModal';
import EMICalculatorModal from './EMICalculatorModal';
import PropertyMatchModal from './PropertyMatchModal';
import VisitModal from './VisitModal';
import { useProperties } from '@/hooks/properties';


const BuyerAccountPage = ({ buyer, onBack, onUpdateBuyer }: any) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPropertySuggestions, setShowPropertySuggestions] = useState(false);
  const [showLoanApplication, setShowLoanApplication] = useState(false);
  const [showEMICalculator, setShowEMICalculator] = useState(false);
  const [showPropertyMatch, setShowPropertyMatch] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'properties', label: 'Property Search', icon: Building },
    { id: 'shortlist', label: 'My Shortlist', icon: Heart },
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
    <div className="h-screen min-h-[100svh] flex bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 shrink-0 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-base font-bold text-gray-900">Buyer Portal</h2>
              <p className="text-xs text-gray-600">{buyer.name}</p>
            </div>
          </div>
        </div>

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
              <div className="text-xs text-gray-600">{buyer.city}, {buyer.state}</div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Budget:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(buyer.budget.min)} - {formatCurrency(buyer.budget.max)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Preferred Units</span>
              <span className="font-medium">
                {Array.isArray(buyer.requirements?.unitTypes)
                  ? buyer.requirements.unitTypes.join(", ")
                  : buyer.requirements?.unitTypes || "—"}
              </span>

            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Lead Score:</span>
              <span className="font-medium text-purple-600">{buyer.leadScore}/100</span>
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
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-left mb-1 text-sm ${activeTab === tab.id
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <Icon size={16} />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className="p-4 border-t border-gray-200">
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden text-sm">
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
          <VisitsTab
            buyer={buyer}
            onScheduleVisit={() => setShowVisitModal(true)}
          />
        )}
        {activeTab === 'loans' && (
          <LoanCenterTab
            buyer={buyer}
            onShowLoanApplication={() => setShowLoanApplication(true)}
          />
        )}
        {activeTab === 'calculators' && (
          <CalculatorsTab
            buyer={buyer}
            onShowEMICalculator={() => setShowEMICalculator(true)}
          />
        )}
        {activeTab === 'insights' && <MarketInsightsTab buyer={buyer} />}
        {activeTab === 'documents' && <MyDocumentsTab buyer={buyer} />}
        {activeTab === 'profile' && <ProfileTab buyer={buyer} onUpdateBuyer={onUpdateBuyer} />}
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
            console.log('Visit scheduled:', visitData);
            setShowVisitModal(false);
          }}
        />
      )}
    </div>

  );
};

// Dashboard Tab for Buyer Account
const DashboardTab = ({ buyer }: any) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const stats = [
    { label: 'Properties Viewed', value: buyer.visits || 0, icon: Eye, color: 'blue' },
    { label: 'Shortlisted', value: buyer.matchedProperties?.filter((p: any) => p.status === 'shortlisted').length || 0, icon: Heart, color: 'red' },
    { label: 'Visits Scheduled', value: buyer.followups?.filter((f: any) => f.type === 'visit').length || 0, icon: Calendar, color: 'green' },
    { label: 'Documents', value: buyer.documents?.length || 0, icon: FileText, color: 'purple' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold mb-1">Welcome, {buyer.name}!</h2>
            <p className="text-xs text-purple-100">Your personalized property search dashboard</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold">{buyer.leadScore}</div>
            <div className="text-xs text-purple-100">Profile Score</div>
          </div>
        </div>
      </div>

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
                <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`text-${stat.color}-600`} size={18} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Activity</h3>
        {buyer.activities?.length > 0 ? (
          <div className="space-y-2">
            {buyer.activities.slice(0, 5).map((activity: any) => (
              <div key={activity.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Activity className="text-blue-600" size={14} />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-900">{activity.description}</div>
                  <div className="text-[10px] text-gray-600">{activity.date} • {activity.time}</div>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Recommended for You</h3>
          <button className="text-xs text-purple-600 hover:text-purple-800 font-medium">
            View All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {buyer.matchedProperties?.slice(0, 2).map((property: any) => (
            <div key={property.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
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
  onDetailsClick,
}) => {
  // ✅ hook (server fetch + server search)
  const {
    properties,
    loadingProps,
    propsError,
    fetchProperties, // GET /properties -> all
    searchProperties, // GET /properties/search -> server-side filter
    logProperties,
    utils,
  } = useProperties({ autoLog: true });

  // helpers
  const {
    norm,
    toArr,
    hasAny,
    formatCurrency,
    getAvailabilityBadgeClass,
    unitTypeFrom,
    locTokensFrom,
    propTypeFrom,
    titleFrom,
    addressFrom,
    priceFrom,
    priceRangeFrom,
    sizeFrom,
    floorLine,
    facingFrom,
    parkingFrom,
    possessionFrom,
    sellerFrom,
    sellerPhoneFrom,
    photoFrom,
    computeReasons,
    computeMatchScore,
    isWithinBuyerBudget,
  } = utils;

  // ---------------- state ----------------
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

  // ✅ filters actually used to refine UI; only updated on Search
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [respectBuyerBudget, setRespectBuyerBudget] = useState(false);
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
const filtersRef = useRef<HTMLDivElement | null>(null);
  // first load → all properties
  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      propertyType: searchFilters.propertyType || undefined,
      unitTypes: searchFilters.unitTypes.length ? searchFilters.unitTypes : undefined,
    };
    await searchProperties(params);
    // ✅ now “commit” the UI filters only after successful server search
    setAppliedFilters(searchFilters);
    // optional: collapse the filter panel after searching
    // setShowFilters(false);
    setHasSearched(true);
     setShowFilters(true);
  };

  const handleResetFilters = async () => {
    setSearchFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    await fetchProperties();
    setHasSearched(false);
  };

  // ---------------- mapping (presentation) ----------------
  const mappedItems = useMemo(() => {
    const locQuery = norm(appliedFilters.location);
    const minP = Number(appliedFilters.minPrice || 0);
    const maxP = Number(appliedFilters.maxPrice || 0);
    const fType = norm(appliedFilters.propertyType);
    const fUnits = toArr(appliedFilters.unitTypes).map(norm);

    const withinSearchFilters = (p: any) => {
      // Location (light client refine; server already filtered)
      if (locQuery && !hasAny(locTokensFrom(p), [locQuery])) return false;

      // Price overlap (property range or single price)
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

    let list = properties.filter(withinSearchFilters);
    if (respectBuyerBudget) list = list.filter((p) => isWithinBuyerBudget(p, buyer));

    return list.map((p: any) => ({
      id: String(p?.id ?? p?.property_id ?? p?._id ?? Math.random()),
      title: titleFrom(p),
      address: addressFrom(p),
      price: priceFrom(p),
      size: sizeFrom(p),
      floorLine: p?.floor ? `Floor ${p.floor}` : floorLine(p),
      facing: facingFrom(p),
      parking: parkingFrom(p),
      possession: possessionFrom(p),
      amenities: p?.amenities || [],
      seller: sellerFrom(p),
      sellerPhone: sellerPhoneFrom(p),
      statusText: p?.status || "Available",
      matchScore: computeMatchScore(p, buyer),
      photo: photoFrom(p),
      _raw: p,
      reasons: computeReasons(p, buyer),
    }));
  }, [
    properties,
    appliedFilters,
    respectBuyerBudget,
    buyer,
    // utils:
    norm,
    toArr,
    hasAny,
    locTokensFrom,
    priceRangeFrom,
    priceFrom,
    propTypeFrom,
    unitTypeFrom,
    isWithinBuyerBudget,
    titleFrom,
    addressFrom,
    sizeFrom,
    floorLine,
    facingFrom,
    parkingFrom,
    possessionFrom,
    sellerFrom,
    sellerPhoneFrom,
    photoFrom,
    computeMatchScore,
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

  const toggleShortlist = (id: string) => {
    setShortlisted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const contactSeller = (name: string, phone: string, title: string) => {
    const clean = (phone || "").replace(/\D/g, "");
    if (!clean) return;
    const msg = `Hi ${name || "there"}, I’d like to discuss your property: ${title}.`;
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="p-6 pt-2 space-y-6">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 pt-0 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 flex-shrink-0">
            Property Search
          </h3>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Smart Match */}
            <button
              onClick={onShowPropertyMatch}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Target size={14} />
              <span>Smart Match</span>
            </button>

            {/* AI Suggestions */}
            <button
              onClick={onShowPropertySuggestions}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all"
            >
              <Bot size={14} />
              <span>AI Suggestions</span>
            </button>

            {/* Filters Toggle */}
         <button
  onClick={() => {
    if (showFilters) {
      // already open → hide
      setShowFilters(false);
    } else {
      // closed → open + scroll
      setShowFilters(true);
      requestAnimationFrame(() => {
        filtersRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }}
  className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs hover:bg-purple-700 transition"
>
  <SlidersHorizontal size={14} className="text-white" />
  <span>{showFilters ? "Hide Filters" : "Search Filters"}</span>
</button>


          </div>
        </div>
      </div>


      {/* Filters */}
      <div className="">


        {/* Filters form (collapsible) */}
        <div ref={filtersRef} className="scroll-mt-20">  
        {showFilters && (
          <div className="mt-2">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={searchFilters.location}
                  onChange={(e) => setSearchFilters({ ...searchFilters, location: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-xs"
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
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-xs"
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
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-xs"
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
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-xs"
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
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-xs"
                >
                  <option value="newest">Newest</option>
                  <option value="low_to_high">Price: Low to High</option>
                  <option value="high_to_low">Price: High to Low</option>
                  <option value="medium">Price: Mid</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                onClick={handleResetFilters}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleSearch}
                className="px-4 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
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
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all"
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
                    {property.photo ? (
                      <img
                        src={property.photo}
                        alt={property.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // graceful fallback if 404
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Main */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          {property.title}
                        </h4>
                        <div className="flex items-center gap-1 text-gray-600 mt-0.5 text-xs">
                          <MapPin size={12} />
                          <span>{property.address || "—"}</span>
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

                      <div className="text-right">
                        <div className="text-base font-bold text-green-600">
                          {formatCurrency(property.price)}
                        </div>
                        <div className="text-[11px] text-gray-500">{property.size}</div>
                      </div>
                    </div>

                    {/* Attributes */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 mt-3 text-xs">
                      <div>
                        <span className="text-gray-500">Floor:</span>{" "}
                        <span className="font-semibold">{property.floorLine || "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Facing:</span>{" "}
                        <span className="font-semibold">{property.facing}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Parking:</span>{" "}
                        <span className="font-semibold">{property.parking || "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Possession:</span>{" "}
                        <span className="font-semibold">{property.possession}</span>
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

                    {/* Seller row + contact */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-xs text-gray-700">
                        <span className="text-gray-500">Seller: </span>
                        <span className="font-medium">{property.seller}</span>
                        <span className="mx-2 text-gray-400">|</span>
                        <span className="text-gray-500">Contact: </span>
                        <span className="font-medium">{property.sellerPhone || "—"}</span>
                      </div>

                      {property.sellerPhone && (
                        <button
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs hover:bg-emerald-100"
                          onClick={() =>
                            contactSeller(property.seller, property.sellerPhone, property.title)
                          }
                        >
                          <MessageCircle size={14} /> Contact
                        </button>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex items-center gap-2">
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
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs"
                        onClick={() => toggleShortlist(property.id)}
                      >
                        <Heart size={12} />
                        <span>{shortlisted.has(property.id) ? "Shortlisted" : "Shortlist"}</span>
                      </button>

                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs"
                        onClick={() => onDetailsClick?.(property)}
                        disabled={!onDetailsClick}
                        title={onDetailsClick ? "Details" : "Wire a details handler to enable"}
                      >
                        Details
                      </button>

                      {property.sellerPhone && (
                        <a
                          href={`tel:${property.sellerPhone}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-xs"
                        >
                          <Phone size={14} />
                          <span>Call</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  );
};



// Shortlist Tab
const ShortlistTab = ({ buyer }: any) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const shortlistedProperties = buyer.matchedProperties?.filter((p: any) => p.status === 'shortlisted') || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">My Shortlist</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-600">{shortlistedProperties.length} properties</span>
          <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors">
            <Share size={14} />
            <span>Share Shortlist</span>
          </button>
        </div>
      </div>

      {shortlistedProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shortlistedProperties.map((property: any) => (
            <div
              key={property.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{property.title}</h4>
                    <p className="text-xs text-gray-600 mt-0.5">{property.address}</p>
                  </div>
                  <button className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg">
                    <Heart className="fill-current" size={16} />
                  </button>
                </div>

                <div className="text-lg font-bold text-green-600 mb-3">
                  {formatCurrency(property.price)}
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 bg-blue-600 text-white text-xs py-1.5 px-2 rounded-lg hover:bg-blue-700 transition-colors">
                    View Details
                  </button>
                  <button className="flex-1 bg-green-600 text-white text-xs py-1.5 px-2 rounded-lg hover:bg-green-700 transition-colors">
                    Schedule Visit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Heart className="mx-auto text-gray-300 mb-3" size={48} />
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            No Properties Shortlisted
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Start exploring properties and add them to your shortlist
          </p>
          <button className="px-4 py-2 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors">
            Explore Properties
          </button>
        </div>
      )}
    </div>

  );
};

// Visits Tab
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

// Loan Center Tab
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

// Calculators Tab
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

// Market Insights Tab
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

// My Documents Tab
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

// Profile Tab
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