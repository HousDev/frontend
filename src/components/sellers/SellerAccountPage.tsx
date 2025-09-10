import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Bell, User, Home, Activity, Eye, BarChart3, Users, Handshake, CreditCard, Calculator, TrendingUp, DollarSign, Building, MapPin, Phone, Mail, MessageCircle, Calendar, Star, Target, Award, Shield, Zap, Bot, Brain, Lightbulb, PieChart, LineChart, BarChart, TrendingDown, Plus, Edit, Share, Download, Settings, Filter, Search, RefreshCw, Clock, CheckCircle, AlertCircle, FileText, Camera, Video, Globe, Heart, Bookmark, Send, Printer, ExternalLink, ChevronRight, ChevronDown, X, Save, Upload, Link, Copy, QrCode, Percent, IndianRupee, Banknote, Wallet, PiggyBank, TrendingDown as TrendingUpDown, Calculator as CalcIcon, Coins, Receipt, FileCheck, Briefcase, Crown, Gem, Flame, Rocket, Sparkles } from 'lucide-react';
import SellerAccountSidebar from './SellerAccountSidebar';
import NotificationBell from './NotificationBell';
import PropertyCard from './PropertyCard';
import SellerActivityTimeline from './SellerActivityTimeline';
import ActivityTimeline from './ActivityTimeline';
import VisitDetails from './VisitDetails';
import AnalyticsDashboard from './AnalyticsDashboard';
import VendorDirectory from './VendorDirectory';
import DealsManagement from './DealsManagement';
import TransactionHistory from './TransactionHistory';
import FinancialCalculators from './FinancialCalculators';
import AIPropertySuggestions from './AIPropertySuggestions';
import DocumentsManagement from './DocumentsManagement';
import { normalizeStage, safe } from '@/pages/utils/uiSafe';
import PropertyFormModal from '@/pages/dashboard/components/PropertyFormModal';


const SellerAccountPage = ({ seller, onBack, onUpdateSeller }: any) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState([
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

  const [unreadCount, setUnreadCount] = useState(
    notifications.filter(n => !n.read).length
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

      if (Math.random() > 0.7) { // 30% chance every 30 seconds
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
        setUnreadCount(prev => prev + 1);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const markNotificationAsRead = (notificationId: number) => {
    setNotifications(prev => prev.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId: number) => {
    const notification = notifications.find(n => n.id === notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  return (
    <div className="h-full flex bg-gray-50">
      {/* Sidebar */}
      <SellerAccountSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        seller={seller}
        unreadCount={unreadCount}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {seller.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{seller.salutation} {seller.name}</h1>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <span>Seller Account</span>
                    <span>•</span>
                    <span>{seller.location}, {seller.city}</span>
                    <span>•</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={markNotificationAsRead}
                onMarkAllAsRead={markAllAsRead}
                onDeleteNotification={deleteNotification}
              />
              <button className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto">
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
        </div>
      </div>
    </div>
  );
};

/* ---------------- Dashboard Tab (replace your current one) ---------------- */
const DashboardTab = ({ seller }: any) => {
  // ---------- AI suggestions (same as yours) ----------
  const [aiSuggestions] = useState([
    { id: 1, type: "price_optimization", title: "Price Optimization Suggestion", description: "Consider reducing price by 3% to attract more buyers", impact: "High", confidence: 85, action: "Adjust pricing strategy" },
    { id: 2, type: "marketing_boost",    title: "Marketing Enhancement",        description: "Add professional photos to increase inquiry rate by 40%", impact: "Medium", confidence: 92, action: "Schedule photoshoot" },
    { id: 3, type: "timing_advice",       title: "Market Timing",                description: "Current market conditions favor sellers in your area",     impact: "High", confidence: 78, action: "Accelerate marketing" },
  ]);

  // ---------- Properties array (if already present on seller) ----------
  const properties = Array.isArray(seller?.properties) ? seller.properties : [];

  // ---------- OPTION A: Compute counts from seller.properties ----------
  const computed = useMemo(() => {
    const totalProps = properties.length;
    let inquiries = 0, visits = 0, hotLeads = 0;

    for (const p of properties) {
      inquiries += Number(p?.inquiries ?? 0);
      visits    += Number(p?.visits ?? 0);
      hotLeads  += Number(p?.hotLeads ?? p?.hot_leads ?? 0);
    }
    return { totalProps, inquiries, visits, hotLeads };
  }, [properties]);


  const [agg, setAgg] = useState<{properties?: number; inquiries?: number; visits?: number; leads?: number}>({});


  // ---------- Tailwind-safe color classes ----------
  const colorClass = {
    blue:   { bg: "bg-blue-100",   text: "text-blue-600" },
    green:  { bg: "bg-green-100",  text: "text-green-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
    red:    { bg: "bg-red-100",    text: "text-red-600" },
  } as const;

  const stats = [
    { label: "Properties Listed", value: String(agg.properties ?? computed.totalProps), icon: Home,  color: "blue",   change: "" },
    { label: "Total Inquiries",   value: String(agg.inquiries  ?? computed.inquiries),  icon: Users, color: "green",  change: "" },
    { label: "Site Visits",       value: String(agg.visits     ?? computed.visits),     icon: Eye,   color: "purple", change: "" },
    { label: "Hot Leads",         value: String(agg.leads      ?? computed.hotLeads),   icon: Target,color: "red",    change: "" },
  ] as const;

  const recentActivities = [
    { id: 1, type: "inquiry",  title: "New inquiry from Amit Patel",  description: "Interested in Skyline Towers property", timestamp: "2 hours ago", priority: "high" },
    { id: 2, type: "visit",    title: "Property visit completed",     description: "Priya Shah visited Ocean Heights property", timestamp: "5 hours ago", priority: "medium" },
    { id: 3, type: "document", title: "Mandate agreement signed",     description: "Digital signature completed for PROP001", timestamp: "1 day ago", priority: "low" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome, {seller.name}! 👋</h2>
            <p className="text-purple-100 text-lg">Your personalized property selling dashboard</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{seller.leadScore || 92}</div>
            <div className="text-purple-100">Profile Score</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const cc = colorClass[stat.color];
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  {stat.change ? <p className="text-sm text-green-600 mt-1">{stat.change}</p> : null}
                </div>
                <div className={`p-3 rounded-xl ${cc.bg}`}>
                  <Icon className={cc.text} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Suggestions (unchanged) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
              <Bot className="text-white" size={20} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
          </div>
          <button className="text-sm text-purple-600 hover:text-purple-800 font-medium">View All</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiSuggestions.map((suggestion) => (
            <div key={suggestion.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Brain className="text-purple-600" size={16} />
                  <span className="text-sm font-medium text-purple-800">{suggestion.type.replace("_", " ").toUpperCase()}</span>
                </div>
                <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                  {suggestion.confidence}% confidence
                </span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{suggestion.title}</h4>
              <p className="text-sm text-gray-700 mb-3">{suggestion.description}</p>
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    suggestion.impact === "High"
                      ? "bg-red-100 text-red-700"
                      : suggestion.impact === "Medium"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {suggestion.impact} Impact
                </span>
                <button className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full hover:bg-purple-700 transition-colors">
                  {suggestion.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities (unchanged) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All Activities</button>
        </div>

        <div className="space-y-4">
          {[
            { id: 1, type: "inquiry",  title: "New inquiry from Amit Patel",  description: "Interested in Skyline Towers property", timestamp: "2 hours ago", priority: "high" },
            { id: 2, type: "visit",    title: "Property visit completed",     description: "Priya Shah visited Ocean Heights property", timestamp: "5 hours ago", priority: "medium" },
            { id: 3, type: "document", title: "Mandate agreement signed",     description: "Digital signature completed for PROP001", timestamp: "1 day ago", priority: "low" },
          ].map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div
                className={`p-2 rounded-lg ${
                  activity.type === "inquiry" ? "bg-blue-100" : activity.type === "visit" ? "bg-green-100" : "bg-purple-100"
                }`}
              >
                {activity.type === "inquiry" ? <Users className="text-blue-600" size={16} /> : activity.type === "visit" ? <Eye className="text-green-600" size={16} /> : <FileText className="text-purple-600" size={16} />}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{activity.title}</h4>
                <p className="text-sm text-gray-600">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  activity.priority === "high" ? "bg-red-100 text-red-700" : activity.priority === "medium" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
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

// Properties Tab Component
// API property -> UI shape mapper
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

const PropertiesTab = ({ seller }: any) => {
  const [list, setList] = useState(
    (Array.isArray(seller?.properties) ? seller.properties : []).map(mapApiPropertyToUI)
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handlePropertySubmit = (createdOrUpdated: any) => {
    // normalize API shape → UI shape
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
  };

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">My Properties</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleOpenModal}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={16} />
              <span>Add Property</span>
            </button>
            <button
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload size={16} />
              <span>Bulk Upload</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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


// Activities Tab Component
const ActivitiesTab = ({ seller }: any) => {
  return (
    <div className="p-6">
      <SellerActivityTimeline seller={seller} />
    </div>
  );
};

// Visits Tab Component
const VisitsTab = ({ seller }: any) => {
  return (
    <div className="p-6">
      <VisitDetails seller={seller} />
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab = ({ seller }: any) => {
  return (
    <div className="p-6">
      <AnalyticsDashboard seller={seller} />
    </div>
  );
};

// Vendors Tab Component
const VendorsTab = ({ seller }: any) => {
  return (
    <div className="p-6">
      <VendorDirectory seller={seller} />
    </div>
  );
};

// Deals Tab Component
const DealsTab = ({ seller }: any) => {
  return (
    <div className="p-6">
      <DealsManagement seller={seller} />
    </div>
  );
};

// Transactions Tab Component
const TransactionsTab = ({ seller }: any) => {
  return (
    <div className="p-6">
      <TransactionHistory seller={seller} />
    </div>
  );
};

// Calculators Tab Component
const CalculatorsTab = ({ seller }: any) => {
  return (
    <div className="p-6">
      <FinancialCalculators seller={seller} />
    </div>
  );
};

// Documents Tab Component
const DocumentsTab = ({ seller }: any) => {
  return (
    <div className="p-6">
      <DocumentsManagement seller={seller} />
    </div>
  );
};

export default SellerAccountPage;