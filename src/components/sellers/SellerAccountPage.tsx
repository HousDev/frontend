// src/pages/dashboard/SellerAccountPage.tsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { trackEvent } from '@/utils/tracker';
import {
  ArrowLeft, Users, Eye, Target, Bot, Brain, FileText, Plus, Settings, Menu, X,
  Home,
  MessageCircle,
} from 'lucide-react';

import SellerAccountSidebar from './SellerAccountSidebar';
import NotificationBell from './NotificationBell';
import PropertyCard from './PropertyCard';
import SellerActivityTimeline from './SellerActivityTimeline';
import VisitDetails from './VisitDetails';
import AnalyticsDashboard from './AnalyticsDashboard';
import VendorDirectory from './VendorDirectory';
import DealsManagement from './DealsManagement';
import TransactionHistory from './TransactionHistory';
import FinancialCalculators from './FinancialCalculators';
import AIPropertySuggestions from './AIPropertySuggestions';
import DocumentsManagement from './DocumentsManagement';

import PropertyFormModal from '@/pages/dashboard/components/PropertyFormModal';
import { normalizeStage, safe } from '@/utils/uiSafe';

// ✅ NEW: tags api + style resolver
import { propertyTagsAPI } from '@/lib/propertyTagsAPI';
import getTagStyle from '@/lib/tagStyles';

/* ======================== MAIN PAGE ======================== */

const SellerAccountPage = ({ seller, onBack, onUpdateSeller }: any) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'properties' | 'activities' | 'visits' | 'analytics' | 'vendors' | 'deals' | 'transactions' | 'calculators' | 'documents'
  >('dashboard');

  // ---- Mobile sidebar (hamburger) state ----
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const openMobileSidebar = useCallback(() => setIsMobileSidebarOpen(true), []);
  const closeMobileSidebar = useCallback(() => setIsMobileSidebarOpen(false), []);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsMobileSidebarOpen(false);
    if (isMobileSidebarOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobileSidebarOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!isMobileSidebarOpen) return;
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setIsMobileSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isMobileSidebarOpen]);

  // Track seller portal tab switching
  useEffect(() => {
    trackEvent({
      eventType: 'portal',
      eventName: `seller_${activeTab}_viewed`,
      source: 'seller_portal',
      payload: {
        seller_id: seller?.id,
        seller_name: seller?.name,
        tab: activeTab,
      },
    });
  }, [activeTab, seller?.id]);

  // Wrap tab change so mobile drawer closes after navigating
  const handleTabChange = useCallback((tabId: any) => {
    setActiveTab(tabId);
    closeMobileSidebar();
  }, [closeMobileSidebar]);

  const [notifications, setNotifications] = useState<any[]>([
    {
      id: 1,
      type: 'property_inquiry',
      title: 'New Property Inquiry',
      message: 'Amit Patel is interested in your Skyline Towers property',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      read: false,
      priority: 'high',
      actionUrl: '/property/PROP001'
    },
    {
      id: 2,
      type: 'visit_scheduled',
      title: 'Visit Scheduled',
      message: 'Property visit scheduled for tomorrow at 2:00 PM',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      read: false,
      priority: 'medium',
      actionUrl: '/visits'
    },
    {
      id: 3,
      type: 'price_suggestion',
      title: 'AI Price Suggestion',
      message: 'Consider adjusting price by 3% based on market trends',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: true,
      priority: 'low',
      actionUrl: '/analytics'
    },
    {
      id: 4,
      type: 'document_ready',
      title: 'Document Ready',
      message: 'Mandate agreement is ready for signature',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'high',
      actionUrl: '/documents'
    }
  ]);

  // Derive unread count from notifications
  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  // Simulate live notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const newNotification = {
        id: Date.now(),
        type: ['property_inquiry', 'visit_scheduled', 'price_suggestion', 'document_ready'][Math.floor(Math.random() * 4)],
        title: 'New Activity',
        message: 'You have a new update on your property',
        timestamp: new Date().toISOString(),
        read: false,
        priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
        actionUrl: '/dashboard'
      };

      if (Math.random() > 0.7) {
        setNotifications(prev => [newNotification, ...prev].slice(0, 10));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const markNotificationAsRead = (notificationId: number) => {
    setNotifications(prev => prev.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (notificationId: number) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  // Safe initials & labels
  const sellerName: string = seller?.name || '';
  const salutation = seller?.salutation ? `${seller.salutation} ` : '';
  const locationStr = [seller?.location, seller?.city].filter(Boolean).join(', ');

  return (
    <div className=" w-full h-full bg-gray-50 flex ">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-68 shrink-0 bg-white border-r sticky top-0 z-10 h-full">
        <SellerAccountSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          seller={seller}
          unreadCount={unreadCount}
        />
      </aside>

      {/* Mobile Drawer + Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${isMobileSidebarOpen ? 'block' : 'hidden'}`}
        aria-hidden={!isMobileSidebarOpen}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity"
          onClick={closeMobileSidebar}
        />

        {/* Drawer */}
        <div
          ref={sidebarRef}
          className={`absolute left-0 top-0  w-60 max-w-[85vw] h-full bg-white border-r shadow-xl transform transition-transform duration-300 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } relative`}
          role="dialog"
          aria-modal="true"
          aria-label="Seller menu"
        >
          {/* Close (X) at top-right inside drawer */}
          <button
            className="absolute top-2 right-2 p-2 rounded-md hover:bg-gray-100"
            onClick={closeMobileSidebar}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>

          <SellerAccountSidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            seller={seller}
            unreadCount={unreadCount}
          />
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col ">
        {/* Sticky Header */}
       <header className="sticky top-0 z-10 bg-[#0f2b3d]">
  <div className="px-3 sm:px-5 py-2.5">
    <div className="flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Hamburger (mobile only) */}
        <button
          onClick={openMobileSidebar}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors md:hidden text-white"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        {/* Back Button (desktop) */}
       <button
  onClick={() => window.history.back()}
  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors hidden sm:inline-flex text-white"
  aria-label="Back"
>
  <ArrowLeft size={18} />
</button>

        {/* Text Column */}
        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-white leading-tight truncate">
            Welcome, {salutation}{sellerName || 'Seller'}
          </h1>
          <p className="text-white/70 text-[9px] sm:text-[10px] leading-snug">
            Your personalized property selling dashboard
          </p>

          {/* Meta Row */}
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1 text-[8px] sm:text-[9px] text-white/80">
            <span className="shrink-0 font-medium">Seller Account</span>
            {locationStr && (
              <>
                <span className="hidden sm:inline text-white/50">•</span>
                <span className="truncate max-w-[50vw] sm:max-w-[32ch]" title={locationStr}>
                  {locationStr}
                </span>
              </>
            )}
            <span className="hidden sm:inline text-white/50">•</span>
            <span className={`font-medium ${seller?.is_active ? 'text-green-300' : 'text-red-300'}`}>
              {seller?.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Profile Score - Desktop only */}
        <div className="text-right hidden sm:block">
          <div className="text-sm font-bold text-white">{seller?.seller?.leadScore ?? 92}</div>
          <div className="text-white/60 text-[9px]">Profile Score</div>
        </div>

        {/* Notification Bell */}
        <NotificationBell
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markNotificationAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDeleteNotification={deleteNotification}
        />

        {/* Settings Button */}
        <button 
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white" 
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </div>
  </div>
</header>

        {/* Tab Content */}
        <main className="flex-1 h-screen">
          {activeTab === 'dashboard' && <DashboardTab seller={seller} />}
          {activeTab === 'properties' && <PropertiesTab seller={seller} onUpdateSeller={onUpdateSeller} />}
          {activeTab === 'activities' && <ActivitiesTab seller={seller} />}
          {activeTab === 'visits' && <VisitsTab seller={seller} />}
          {activeTab === 'analytics' && <AnalyticsTab seller={seller} />}
          {activeTab === 'vendors' && <VendorsTab seller={seller} />}
          {activeTab === 'deals' && <DealsTab seller={seller} />}
          {activeTab === 'transactions' && <TransactionsTab seller={seller} />}
          {activeTab === 'calculators' && <CalculatorsTab seller={seller} />}
          {activeTab === 'documents' && <DocumentsTab seller={seller} />}
        </main>
      </div>
    </div>
  );
};

/* ======================== DASHBOARD TAB ======================== */

const DashboardTab = ({ seller }: any) => {
  const [aiSuggestions] = useState([
    { id: 1, type: "price_optimization", title: "Price Optimization", description: "Consider reducing price by 3% to attract more buyers", impact: "High", confidence: 85, action: "Adjust pricing" },
    { id: 2, type: "marketing_boost", title: "Marketing Enhancement", description: "Add professional photos to increase inquiry rate by 40%", impact: "Medium", confidence: 92, action: "Schedule shoot" },
    { id: 3, type: "timing_advice", title: "Market Timing", description: "Current market conditions favor sellers in your area", impact: "High", confidence: 78, action: "Accelerate" },
  ]);

  const properties = Array.isArray(seller?.properties) ? seller.properties : [];

  const computed = useMemo(() => {
    const totalProps = properties.length;
    let inquiries = 0, visits = 0, hotLeads = 0;
    for (const p of properties) {
      inquiries += Number(p?.inquiries ?? 0);
      visits += Number(p?.visits ?? 0);
      hotLeads += Number(p?.hotLeads ?? p?.hot_leads ?? 0);
    }
    return { totalProps, inquiries, visits, hotLeads };
  }, [properties]);

  // ESALE Theme Colors
  const N = "#0f2b3d";
  const O = "#e67e22";
  const BG = "#f8fafc";
  const BD = "#e2e8f0";
  const MU = "#5a7184";

  const stats = [
    { label: "Properties", value: String(computed.totalProps), icon: Home, color: "#3B82F6", bg: "#DBEAFE" },
    { label: "Inquiries", value: String(computed.inquiries), icon: MessageCircle, color: "#10B981", bg: "#DCFCE7" },
    { label: "Visits", value: String(computed.visits), icon: Eye, color: "#8B5CF6", bg: "#F3E8FF" },
    { label: "Hot Leads", value: String(computed.hotLeads), icon: Target, color: "#EF4444", bg: "#FEE2E2" },
  ];

  const activities = [
    { id: 1, type: "inquiry", title: "New inquiry from Amit Patel", description: "Interested in Skyline Towers", timestamp: "2h ago", priority: "high" },
    { id: 2, type: "visit", title: "Property visit completed", description: "Priya Shah visited Ocean Heights", timestamp: "5h ago", priority: "medium" },
    { id: 3, type: "document", title: "Mandate agreement signed", description: "Digital signature completed", timestamp: "1d ago", priority: "low" },
  ];

  return (
    <div className="p-3 space-y-3">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="rounded-lg p-2.5" style={{ background: 'white', border: `1px solid ${BD}` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-medium uppercase" style={{ color: MU }}>{stat.label}</p>
                  <p className="text-base font-bold mt-0.5" style={{ color: N }}>{stat.value}</p>
                </div>
                <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: stat.bg }}>
                  <Icon size={12} style={{ color: stat.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Suggestions */}
      <div className="rounded-lg p-3" style={{ background: 'white', border: `1px solid ${BD}` }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded" style={{ background: `${O}15` }}>
              <Bot size={12} style={{ color: O }} />
            </div>
            <h3 className="text-[10px] font-semibold" style={{ color: N }}>AI Recommendations</h3>
          </div>
          <button className="text-[8px] font-medium" style={{ color: O }}>View All</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {aiSuggestions.map((suggestion) => (
            <div key={suggestion.id} className="rounded-lg p-2" style={{ background: `${O}5`, border: `1px solid ${O}15` }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <Brain size={10} style={{ color: O }} />
                  <span className="text-[8px] font-medium uppercase" style={{ color: O }}>{suggestion.type.replace("_", " ")}</span>
                </div>
                <span className="text-[7px] px-1 py-0.5 rounded-full" style={{ background: `${O}15`, color: O }}>{suggestion.confidence}%</span>
              </div>
              <h4 className="text-[9px] font-semibold mb-0.5" style={{ color: N }}>{suggestion.title}</h4>
              <p className="text-[8px] mb-1.5" style={{ color: MU }}>{suggestion.description}</p>
              <div className="flex items-center justify-between">
                <span className={`text-[7px] px-1 py-0.5 rounded-full ${
                  suggestion.impact === "High" ? "bg-red-100 text-red-700" : 
                  suggestion.impact === "Medium" ? "bg-orange-100 text-orange-700" : 
                  "bg-green-100 text-green-700"
                }`}>
                  {suggestion.impact} Impact
                </span>
                <button className="text-[7px] px-2 py-0.5 rounded-full text-white" style={{ background: O }}>
                  {suggestion.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="rounded-lg p-3" style={{ background: 'white', border: `1px solid ${BD}` }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] font-semibold" style={{ color: N }}>Recent Activities</h3>
          <button className="text-[8px] font-medium" style={{ color: O }}>View All</button>
        </div>

        <div className="space-y-1.5">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-2 p-2 rounded-lg" style={{ background: BG }}>
              <div className={`p-1 rounded ${
                activity.type === "inquiry" ? "bg-blue-100" : 
                activity.type === "visit" ? "bg-green-100" : 
                "bg-purple-100"
              }`}>
                {activity.type === "inquiry" ? (
                  <MessageCircle size={10} className="text-blue-600" />
                ) : activity.type === "visit" ? (
                  <Eye size={10} className="text-green-600" />
                ) : (
                  <FileText size={10} className="text-purple-600" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-[9px] font-medium" style={{ color: N }}>{activity.title}</h4>
                <p className="text-[8px]" style={{ color: MU }}>{activity.description}</p>
                <p className="text-[7px] mt-0.5" style={{ color: MU }}>{activity.timestamp}</p>
              </div>
              <span className={`px-1.5 py-0.5 rounded-full text-[7px] font-medium ${
                activity.priority === "high" ? "bg-red-100 text-red-700" : 
                activity.priority === "medium" ? "bg-orange-100 text-orange-700" : 
                "bg-green-100 text-green-700"
              }`}>
                {activity.priority}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ======================== PROPERTIES TAB ======================== */

const mapApiPropertyToUI = (api: any) => ({
  id: String(api.id ?? api.property_id ?? api._id ?? "-"),
  address: safe(api.address) as string,
  type: safe(api.type) as string,
  unitType: safe(api.unitType ?? api.unit_type) as string,
  carpet_area: Number(api.carpet_area ?? 0),
  builtup_area: Number(api.builtup_area ?? 0),
  unit_type: safe(api.unit_type, "-") as string,
  price: Number(api.budget ?? 0),
  status: safe(api.status, "-") as string,
  furnishing: safe(api.furnishing, "-") as string,
  property_subtype_name: safe(api.property_subtype_name, "-") as string,
  location_name: safe(api.location_name, "-") as string,
  stage: normalizeStage(api.stage),
  stageProgress: Number(api.stage_progress ?? api.progress ?? 0),
  visits: Number(api.visits ?? 0),
  inquiries: Number(api.inquiries ?? 0),
  hotLeads: Number(api.hotLeads ?? api.hot_leads ?? 0),
  photos: Array.isArray(api.photos) ? api.photos : [],
  amenities: Array.isArray(api.amenities) ? api.amenities : [],
  isPublic: !!api.is_public,
  publicViews: Number(api.public_views ?? 0),
  lastActivity: api.last_activity ?? api.updated_at ?? api.created_at ?? null,

  // ✅ NEW: tags field for UI (defaults empty, filled after API fetch)
  tags: Array.isArray(api.tags) ? api.tags : [],
});

const PropertiesTab = ({ seller, onUpdateSeller }: any) => {
  const initialList = (Array.isArray(seller?.properties) ? seller.properties : []).map(mapApiPropertyToUI);
  const [list, setList] = useState(initialList);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Fetch & merge tags once for all properties
  useEffect(() => {
    let isMounted = true;

    async function loadTags() {
      try {
        const all = await propertyTagsAPI.getAll(); // [{ property_id, tags }, ...]
        const tagsById = new Map<string, string[]>();
        all.forEach(row => tagsById.set(String(row.property_id), Array.isArray(row.tags) ? row.tags : []));

        if (!isMounted) return;
        setList(prev =>
          prev.map(p => ({
            ...p,
            tags: tagsById.get(p.id) ?? p.tags ?? [],
          }))
        );
      } catch (err) {
        console.error("Failed to load property tags:", err);
      }
    }

    // Only attempt if we have properties
    if (initialList.length > 0) loadTags();

    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seller?.properties?.length]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // ✅ When a property is created/updated, also refresh its tags
  const handlePropertySubmit = async (createdOrUpdated: any) => {
    const ui = mapApiPropertyToUI(createdOrUpdated);

    // merge or prepend property
    setList(prev => {
      const idx = prev.findIndex(p => p.id === ui.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...ui };
        return copy;
      }
      return [ui, ...prev];
    });

    // pull tags for this property specifically
    try {
      const row = await propertyTagsAPI.getById(ui.id);
      setList(prev =>
        prev.map(p => (p.id === ui.id ? { ...p, tags: Array.isArray(row.tags) ? row.tags : [] } : p))
      );
    } catch (e) {
      console.warn("Tags not found for property", ui.id, e);
    }

    onUpdateSeller?.(ui);
    handleCloseModal();
  };

  return (
    <>
      <div className="p-4 md:p-2 space-y-1">
      <div className="flex items-center justify-between gap-2 sm:gap-3">
  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
    My Properties
  </h2>

  <div className="flex items-center gap-2">
    <button
      onClick={handleOpenModal}
      className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm"
    >
      <Plus size={14} className="sm:w-4 sm:h-4" />
      <span className="whitespace-nowrap">Add Property</span>
    </button>
  </div>
</div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-2">
          {list.length > 0 ? (
            list.map((property) => <PropertyCard key={property.id} property={property} />)
          ) : (
            <div className="text-sm text-gray-500">No properties found.</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <PropertyFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handlePropertySubmit}
          mode="create"
        />
      )}
    </>
  );
};

/* ======================== SIMPLE TABS ======================== */

const ActivitiesTab = ({ seller }: any) => (
  <div className="p-4 md:p-2">
    <SellerActivityTimeline seller={seller} />
  </div>
);

const VisitsTab = ({ seller }: any) => (
  <div className="p-4 md:p-2">
    <VisitDetails seller={seller} />
  </div>
);

const AnalyticsTab = ({ seller }: any) => (
  <div className="p-4 md:p-2">
    <AnalyticsDashboard seller={seller} />
  </div>
);

const VendorsTab = ({ seller }: any) => (
  <div className="p-4 md:p-2">
    <VendorDirectory seller={seller} />
  </div>
);

const DealsTab = ({ seller }: any) => (
  <div className="p-4 md:p-2">
    <DealsManagement seller={seller} />
  </div>
);

const TransactionsTab = ({ seller }: any) => (
  <div className="p-4 md:p-2">
    <TransactionHistory seller={seller} />
  </div>
);

const CalculatorsTab = ({ seller }: any) => (
  <div className="p-4 md:p-2">
    <FinancialCalculators seller={seller} />
  </div>
);

const DocumentsTab = ({ seller }: any) => (
  <div className="p-4 md:p-2">
    <DocumentsManagement seller={seller} />
  </div>
);

export default SellerAccountPage;
