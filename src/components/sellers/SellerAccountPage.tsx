import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  ArrowLeft, Users, Eye, Target, Bot, Brain, FileText, Plus, Upload, Settings, Menu, X,
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
  const firstLetter = sellerName?.[0]?.toUpperCase?.() || '?';
  const salutation = seller?.salutation ? `${seller.salutation} ` : '';
  const locationStr = [seller?.location, seller?.city].filter(Boolean).join(', ');

  return (
    <div className="h-screen w-full bg-gray-50 flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-68 shrink-0 bg-white border-r sticky top-0 h-screen overflow-y-auto">
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
          className={`absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-white border-r shadow-xl transform transition-transform duration-300 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } relative`}   // 👈 make it relative so the X can be absolutely positioned
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
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 bg-gradient-to-r from-purple-500 to-pink-600 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left */}
            <div className="flex items-center space-x-3 md:space-x-4">
              {/* Hamburger (mobile only) */}
              <button
                onClick={openMobileSidebar}
                className="p-2 rounded-lg bg-white/90 text-gray-700 hover:bg-white transition-colors md:hidden"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>

              <button
                onClick={onBack}
                className="p-2 rounded-lg bg-white/90 text-gray-700 hover:bg-white transition-colors hidden sm:inline-flex"
                aria-label="Back"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                {/* text column */}
                <div className="min-w-0 max-w-[70vw] sm:max-w-[60vw] md:max-w-none">
                  <h1 className="text-base sm:text-lg md:text-xl font-bold text-white leading-tight truncate">
                    Welcome, {salutation}{sellerName || 'Seller'}
                  </h1>

                  <p className="text-purple-100 text-[10px] sm:text-[11px] md:text-xs leading-snug">
                    Your personalized property selling dashboard
                  </p>

                  {/* meta row: becomes 2-line on tiny screens, inline on sm+ */}
                  <div className="flex  gap-x-2 md:gap-x-3 gap-y-0.5 text-[11px] sm:text-xs md:text-sm text-white/95 mt-1">
                    <span className="shrink-0">Seller Account</span>

                    {locationStr && (
                      <>
                        {/* show bullet only when space allows */}
                        <span className="hidden sm:inline">•</span>
                        <span
                          className="truncate max-w-[65vw] sm:max-w-[32ch]"
                          title={locationStr}
                        >
                          {locationStr}
                        </span>
                      </>
                    )}

                    {/* status */}
                    <span className="hidden sm:inline">•</span>
                    <span
                      className={`font-medium ${seller?.is_active ? 'text-green-300' : 'text-red-200'
                        }`}
                    >
                      {seller?.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right */}
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-white">{seller?.seller?.leadScore ?? 92}</div>
                <div className="text-purple-100 text-xs">Profile Score</div>
              </div>

              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={markNotificationAsRead}
                onMarkAllAsRead={markAllAsRead}
                onDeleteNotification={deleteNotification}
              />

              <button
                className="p-2 rounded-lg bg-white/90 text-gray-700 hover:bg-white transition-colors"
                aria-label="Settings"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <main className="flex-1 overflow-y-auto">
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
    { id: 1, type: "price_optimization", title: "Price Optimization Suggestion", description: "Consider reducing price by 3% to attract more buyers", impact: "High", confidence: 85, action: "Adjust pricing strategy" },
    { id: 2, type: "marketing_boost", title: "Marketing Enhancement", description: "Add professional photos to increase inquiry rate by 40%", impact: "Medium", confidence: 92, action: "Schedule photoshoot" },
    { id: 3, type: "timing_advice", title: "Market Timing", description: "Current market conditions favor sellers in your area", impact: "High", confidence: 78, action: "Accelerate marketing" },
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

  const stats = [
    { label: "Properties Listed", value: String(computed.totalProps), icon: () => <span className="font-semibold">🏠</span>, color: "blue" },
    { label: "Total Inquiries", value: String(computed.inquiries), icon: Users, color: "green" },
    { label: "Site Visits", value: String(computed.visits), icon: Eye, color: "purple" },
    { label: "Hot Leads", value: String(computed.hotLeads), icon: Target, color: "red" },
  ] as const;

  const colorClass = {
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    green: { bg: "bg-green-100", text: "text-green-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
    red: { bg: "bg-red-100", text: "text-red-600" },
  } as const;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat, index) => {
          const Icon: any = stat.icon;
          const cc = colorClass[stat.color as keyof typeof colorClass];
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-2 md:p-3 rounded-xl ${cc.bg}`}>
                  {typeof Icon === 'function' ? <Icon className={cc.text} size={22} /> : <Icon className={cc.text} size={22} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Suggestions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
              <Bot className="text-white" size={18} />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900">AI Recommendations</h3>
          </div>
          <button className="text-xs md:text-sm text-purple-600 hover:text-purple-800 font-medium">View All</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {aiSuggestions.map((suggestion) => (
            <div key={suggestion.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 md:p-4 border border-purple-100">
              <div className="flex items-start justify-between mb-2 md:mb-3">
                <div className="flex items-center space-x-2">
                  <Brain className="text-purple-600" size={14} />
                  <span className="text-xs md:text-sm font-medium text-purple-800">{suggestion.type.replace("_", " ").toUpperCase()}</span>
                </div>
                <span className="text-[10px] md:text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                  {suggestion.confidence}% confidence
                </span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1.5 md:mb-2 text-sm md:text-base">{suggestion.title}</h4>
              <p className="text-xs md:text-sm text-gray-700 mb-2 md:mb-3">{suggestion.description}</p>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] md:text-xs px-2 py-1 rounded-full ${suggestion.impact === "High"
                    ? "bg-red-100 text-red-700"
                    : suggestion.impact === "Medium"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-green-100 text-green-700"
                    }`}
                >
                  {suggestion.impact} Impact
                </span>
                <button className="text-[10px] md:text-xs bg-purple-600 text-white px-3 py-1 rounded-full hover:bg-purple-700 transition-colors">
                  {suggestion.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">Recent Activities</h3>
          <button className="text-xs md:text-sm text-blue-600 hover:text-blue-800 font-medium">View All Activities</button>
        </div>

        <div className="space-y-3 md:space-y-4">
          {[
            { id: 1, type: "inquiry", title: "New inquiry from Amit Patel", description: "Interested in Skyline Towers property", timestamp: "2 hours ago", priority: "high" },
            { id: 2, type: "visit", title: "Property visit completed", description: "Priya Shah visited Ocean Heights property", timestamp: "5 hours ago", priority: "medium" },
            { id: 3, type: "document", title: "Mandate agreement signed", description: "Digital signature completed for PROP001", timestamp: "1 day ago", priority: "low" },
          ].map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 md:space-x-4 p-3 md:p-4 bg-gray-50 rounded-lg">
              <div
                className={`p-2 rounded-lg ${activity.type === "inquiry" ? "bg-blue-100" : activity.type === "visit" ? "bg-green-100" : "bg-purple-100"
                  }`}
              >
                {activity.type === "inquiry" ? <Users className="text-blue-600" size={14} /> : activity.type === "visit" ? <Eye className="text-green-600" size={14} /> : <FileText className="text-purple-600" size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm md:text-base">{activity.title}</h4>
                <p className="text-xs md:text-sm text-gray-600">{activity.description}</p>
                <p className="text-[10px] md:text-xs text-gray-500 mt-1">{activity.timestamp}</p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-medium ${activity.priority === "high" ? "bg-red-100 text-red-700" : activity.priority === "medium" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                  }`}
              >
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
});

const PropertiesTab = ({ seller, onUpdateSeller }: any) => {
  const [list, setList] = useState(
    (Array.isArray(seller?.properties) ? seller.properties : []).map(mapApiPropertyToUI)
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handlePropertySubmit = (createdOrUpdated: any) => {
    const ui = mapApiPropertyToUI(createdOrUpdated);
    setList(prev => {
      const idx = prev.findIndex(p => p.id === ui.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = ui;
        return copy;
      }
      return [ui, ...prev];
    });
    onUpdateSeller?.(ui);
    handleCloseModal();
  };

  return (
    <>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">My Properties</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenModal}
              className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Plus size={16} />
              <span>Add Property</span>
            </button>
            <button
              className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Upload size={16} />
              <span>Bulk Upload</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
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
  <div className="p-4 md:p-6">
    <SellerActivityTimeline seller={seller} />
  </div>
);

const VisitsTab = ({ seller }: any) => (
  <div className="p-4 md:p-6">
    <VisitDetails seller={seller} />
  </div>
);

const AnalyticsTab = ({ seller }: any) => (
  <div className="p-4 md:p-6">
    <AnalyticsDashboard seller={seller} />
  </div>
);

const VendorsTab = ({ seller }: any) => (
  <div className="p-4 md:p-6">
    <VendorDirectory seller={seller} />
  </div>
);

const DealsTab = ({ seller }: any) => (
  <div className="p-4 md:p-6">
    <DealsManagement seller={seller} />
  </div>
);

const TransactionsTab = ({ seller }: any) => (
  <div className="p-4 md:p-6">
    <TransactionHistory seller={seller} />
  </div>
);

const CalculatorsTab = ({ seller }: any) => (
  <div className="p-4 md:p-6">
    <FinancialCalculators seller={seller} />
  </div>
);

const DocumentsTab = ({ seller }: any) => (
  <div className="p-4 md:p-6">
    <DocumentsManagement seller={seller} />
  </div>
);

export default SellerAccountPage;
