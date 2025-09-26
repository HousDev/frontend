import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import {
  Home,
  Users,
  Building,
  Activity,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  User,
  LogOut,
  MessageSquare,
  Shield,
  Zap,
  Database,
  Download,
  UserCheck,
  Crown,
  Briefcase,
  ShoppingBag,
  Heart,
  Clock,
  Coffee,
  FileText,
  Receipt,
  LayoutTemplate,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  Globe,
  Wrench,
  MoreHorizontal,
  Edit3,
  Target,
  BookOpen,
  FileImage,
  Video,
  Calendar,
  Phone,
  Mail,
  DollarSign,
  TrendingUp,
  Calculator,
  Archive,
  Bookmark,
  Info,
  PanelBottom
} from 'lucide-react';
import { FaEarthAsia } from 'react-icons/fa6';
import { useAuth } from '@/contexts/AuthContext';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';
import { cn } from '@/lib/utils';
import ActivityTrackerModal from './ActivityTrackerModal';
import NotificationPanel from './NotificationPanel';
import { notificationAPI } from '@/lib/notificationAPI';
import UserProfileMenu from './UserProfileMenu';

// 1) put these helpers near the top of DashboardLayout (outside the component is fine)
type UILevel = "low" | "medium" | "high";

type RawNotification = {
  id: number | string;
  lead_id?: string | null;
  user_id?: number | string;
  message?: string | null;
  type?: string | null;
  link?: string | null;
  is_read?: 0 | 1 | "0" | "1" | boolean | "true" | "false" | null;
  priority?: UILevel | null;
  created_at?: string | null;
  updated_at?: string | null;
  [k: string]: any;
};

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: UILevel;
  timestamp: string;      // ALWAYS created_at
  read: boolean;          // normalized
  link?: string | null;
  color?: string;
};

const toNumberId = (val: number | string) => {
  const n = typeof val === "number" ? val : Number(val);
  return Number.isFinite(n) ? n : Math.floor(Math.random() * 1e9);
};

const normalizeRead = (v: RawNotification["is_read"]): boolean => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return s === "1" || s === "true";
  }
  return false;
};

const mapRawToUI = (n: RawNotification): NotificationItem => {
  const id = toNumberId(n.id);
  const type = (n.type ?? "general").toString();

  const title =
    type === "lead_assign"
      ? "Lead Assigned"
      : type === "property_inquiry"
      ? "Property Inquiry"
      : type === "visit_scheduled"
      ? "Visit Scheduled"
      : type === "price_suggestion"
      ? "Price Suggestion"
      : type === "document_ready"
      ? "Document Ready"
      : type;

  return {
    id,
    title,
    message: n.message ?? "",
    type,
    priority: (n.priority as UILevel) ?? "medium",
    // ✅ always created_at for display/sorting; fallback to updated/epoch if missing
    timestamp: n.created_at ?? n.updated_at ?? "1970-01-01 00:00:00",
    read: normalizeRead(n.is_read),
    link: n.link ?? null,
    color: "green",
  };
};




// DashboardLayout with unified menu color (#0b3855)
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [sessionTime, setSessionTime] = useState('00:00:00');
  const [workTime, setWorkTime] = useState('00:00:00');
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [loginTime, setLoginTime] = useState(null);
  const [totalWorkTime, setTotalWorkTime] = useState(0);
  const [breakStartTime, setBreakStartTime] = useState(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState(new Set());

  const location = useLocation();
  const { user, logout, hasRole } = useAuth();
  const { systemSettings } = useSystemSettings();

  // refs
  const loginTimeRef = useRef(loginTime);
  const totalWorkTimeRef = useRef(totalWorkTime);
  const isOnBreakRef = useRef(isOnBreak);
  const sidebarRef = useRef(null);
  const searchInputRef = useRef(null);
  const [mobileTimersOpen, setMobileTimersOpen] = useState(false);
  const mobileTimersRef = useRef(null);

  const NotificationPanelAny = NotificationPanel;
// 2) state types: make them UI notifications
const [notifications, setNotifications] = useState<NotificationItem[]>([]);
const [unreadCount, setUnreadCount] = useState(0);

  // Unified nav color (from image)
  const navColorHex = '#0b3855';
  const navTextClass = `text-[${navColorHex}]`; // will be used where text color is needed
  const navHoverClass = `group-hover:text-[${navColorHex}]`;
  // NOTE: tailwind arbitrary classes in template strings are fine in JSX className

  // Exclusive toggleMenu: opening one menu closes others. Closing a menu only closes it.
  const toggleMenu = useCallback((menuKey) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(menuKey)) {
        // close it
        next.delete(menuKey);
        return next;
      } else {
        // open this exclusively
        return new Set([menuKey]);
      }
    });
  }, []);

  // Auto-expand menus based on route — exclusive open (only the matched menu opens)
  useEffect(() => {
    const currentPath = location.pathname;
    const menuMappings = {
      cms: ['/dashboard/blog-manager'],
      crm: [
        '/dashboard/leads',
        '/dashboard/buyers',
        '/dashboard/sellers',
        '/dashboard/properties',
        '/dashboard/contact-messages'
      ],
      administrator: ['/dashboard/document-center', '/dashboard/template-center', '/dashboard/accounts'],
      tools: ['/dashboard/vendors', '/dashboard/ai-training'],
      reports: ['/dashboard/activities', '/dashboard/analytics'],
      settings: [
        '/dashboard/settings',
        '/dashboard/settings/roles-permissions',
        '/dashboard/settings/integrations',
        '/dashboard/settings/ai',
        '/dashboard/settings/master-data',
        '/dashboard/settings/import-export'
      ]
    };

    // Find first matching menuKey (if any) and set it exclusively open.
    let matchedKey = null;
    Object.entries(menuMappings).some(([menuKey, paths]) => {
      if (paths.some((p) => currentPath.startsWith(p))) {
        matchedKey = menuKey;
        return true;
      }
      return false;
    });

    if (matchedKey) {
      setExpandedMenus(new Set([matchedKey]));
    } else {
      // Optional: close all dropdowns when no mapping matches current route.
      setExpandedMenus(new Set());
    }
  }, [location.pathname]);

  // findLastWorkStart remains same logic
  const findLastWorkStart = useCallback((history) => {
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].type === 'login' || history[i].type === 'end_break') return history[i].timestamp;
      if (history[i].type === 'start_break') return null;
    }
    return loginTimeRef.current;
  }, []);

  // navigation structure with unified color for icons/text
  type NavigationSingle = {
    name: string;
    href: string;
    icon: any;
    exact: boolean;
    colorClass: string;
    type: 'single';
  };

  type NavigationDropdown = {
    name: string;
    icon: any;
    colorClass: string;
    type: 'dropdown';
    key: string;
    submenu: Array<{
      name: string;
      href: string;
      icon: any;
      colorClass: string;
    }>;
  };

  type NavigationItem = NavigationSingle | NavigationDropdown;

  const navigationStructure: NavigationItem[] = useMemo(() => {
    const structure: NavigationItem[] = [
      {
        name: 'Overview',
        href: '/dashboard',
        icon: Home,
        exact: true,
        colorClass: navTextClass,
        type: 'single'
      }
    ];

    if (hasRole('admin')) {
      structure.push({
        name: 'Admin Dashboard',
        href: '/dashboard/admin',
        icon: Crown,
        exact: true,
        colorClass: navTextClass,
        type: 'single'
      });
    }
    if (hasRole(['admin', 'manager'])) {
      structure.push({
        name: 'Manager Dashboard',
        href: '/dashboard/manager',
        icon: UserCheck,
        exact: true,
        colorClass: navTextClass,
        type: 'single'
      });
    }
    if (hasRole(['admin', 'manager', 'agent'])) {
      structure.push({
        name: 'Agent Dashboard',
        href: '/dashboard/agent',
        icon: Briefcase,
        exact: true,
        colorClass: navTextClass,
        type: 'single'
      });
    }

    structure.push(
      { name: 'Seller Dashboard', href: '/dashboard/seller', icon: ShoppingBag, exact: true, colorClass: navTextClass, type: 'single' },
      { name: 'Buyer Dashboard', href: '/dashboard/buyer', icon: Heart, exact: true, colorClass: navTextClass, type: 'single' }
    );

    structure.push(
      {
        name: 'CMS',
        icon: Globe,
        colorClass: navTextClass,
        type: 'dropdown',
        key: 'cms',
        submenu: [
          { name: 'Blog Manager', href: '/dashboard/blog-manager', icon: Edit3, colorClass: navTextClass },
          { name: 'About Manager', href: '/dashboard/about-cms', icon: Info, colorClass: navTextClass },
          { name: 'Contact Manager', href: '/dashboard/contact-cms', icon: Phone, colorClass: navTextClass },
          { name: 'Service Manager', href: '/dashboard/service-cms', icon: Shield, colorClass: navTextClass },
          { name: 'Footer Manager', href: '/dashboard/footer-cms', icon: PanelBottom, colorClass: navTextClass },
        ]
      },
      {
        name: 'CRM',
        icon: Users,
        colorClass: navTextClass,
        type: 'dropdown',
        key: 'crm',
        submenu: [
          { name: 'Leads', href: '/dashboard/leads', icon: Target, colorClass: navTextClass },
          { name: 'Buyers', href: '/dashboard/buyers', icon: UserCheck, colorClass: navTextClass },
          { name: 'Sellers', href: '/dashboard/sellers', icon: Users, colorClass: navTextClass },
          { name: 'Properties', href: '/dashboard/properties', icon: Building, colorClass: navTextClass },
          { name: 'Contact Messages', href: '/dashboard/contact-messages', icon: MessageCircle, colorClass: navTextClass }
        ]
      },
      {
        name: 'Administrator',
        icon: Shield,
        colorClass: navTextClass,
        type: 'dropdown',
        key: 'administrator',
        submenu: [
          { name: 'Document Center', href: '/dashboard/document-center', icon: FileText, colorClass: navTextClass },
          { name: 'Template Center', href: '/dashboard/template-center', icon: LayoutTemplate, colorClass: navTextClass },
          { name: 'Accounts', href: '/dashboard/accounts', icon: Receipt, colorClass: navTextClass }
        ]
      },
      { name: 'Communication', href: '/dashboard/communication', icon: MessageSquare, exact: true, colorClass: navTextClass, type: 'single' },
      {
        name: 'Tools',
        icon: Wrench,
        colorClass: navTextClass,
        type: 'dropdown',
        key: 'tools',
        submenu: [
          { name: 'Vendors', href: '/dashboard/vendors', icon: Building, colorClass: navTextClass },
          { name: 'AI Training', href: '/dashboard/ai-training', icon: FileText, colorClass: navTextClass }
        ]
      },
      {
        name: 'Reports',
        icon: TrendingUp,
        colorClass: navTextClass,
        type: 'dropdown',
        key: 'reports',
        submenu: [
          { name: 'Activities', href: '/dashboard/activities', icon: Activity, colorClass: navTextClass },
          { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, colorClass: navTextClass }
        ]
      }
    );

    // Settings dropdown
    structure.push({
      name: 'Settings',
      icon: Settings,
      colorClass: navTextClass,
      type: 'dropdown',
      key: 'settings',
      submenu: [
        { name: 'General Settings', href: '/dashboard/settings', icon: Settings, colorClass: navTextClass },
        { name: 'Roles & Permissions', href: '/dashboard/settings/roles-permissions', icon: Shield, colorClass: navTextClass },
        { name: 'Integrations', href: '/dashboard/settings/integrations', icon: Zap, colorClass: navTextClass },
        { name: 'AI Settings', href: '/dashboard/settings/ai', icon: Zap, colorClass: navTextClass },
        { name: 'Master Data', href: '/dashboard/settings/master-data', icon: Database, colorClass: navTextClass },
        { name: 'Import/Export', href: '/dashboard/settings/import-export', icon: Download, colorClass: navTextClass }
      ]
    });

    if (hasRole('admin')) {
      structure.push({ name: 'Users', href: '/dashboard/users', icon: Users, exact: true, colorClass: navTextClass, type: 'single' });
    }

    return structure;
  }, [hasRole, navTextClass]);

  const filteredNavigation = useMemo(() => {
    if (!searchQuery.trim()) return navigationStructure;

    const filtered = [];
    navigationStructure.forEach((item) => {
      if (item.type === 'single') {
        if (item.name.toLowerCase().includes(searchQuery.toLowerCase())) filtered.push(item);
      } else {
        const matchingsubmenu = item.submenu.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
        if (item.name.toLowerCase().includes(searchQuery.toLowerCase()) || matchingsubmenu.length > 0) {
          filtered.push({ ...item, submenu: matchingsubmenu.length > 0 ? matchingsubmenu : item.submenu });
        }
      }
    });

    return filtered;
  }, [navigationStructure, searchQuery]);

  // mobile timers click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (!mobileTimersRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!mobileTimersRef.current.contains(e.target)) setMobileTimersOpen(false);
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // notifications polling
// 3) notifications polling: map -> UI, compute unread from .read
useEffect(() => {
  let interval: any;

  const fetchNotifications = async () => {
    try {
      if (!user?.id) return;
      const userIdNum = Number(user.id);
      if (Number.isNaN(userIdNum)) return;

      const res = await notificationAPI.getUserNotifications(userIdNum);
      const list: RawNotification[] = Array.isArray(res?.notifications)
        ? res.notifications
        : res?.notifications
        ? [res.notifications]
        : [];

      const ui = list.map(mapRawToUI);

      setNotifications((prev) => (JSON.stringify(prev) !== JSON.stringify(ui) ? ui : prev));
      const newUnread = ui.filter((n) => !n.read).length;
      setUnreadCount((prev) => (prev !== newUnread ? newUnread : prev));
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
    }
  };

  if (user?.id) {
    fetchNotifications();
    interval = setInterval(fetchNotifications, 10000);
  }
  return () => interval && clearInterval(interval);
}, [user?.id]);

  // 4) bell click: call API, then update local to read:true (UI shape)
const handleBellClick = useCallback(async () => {
  setOpen((prev) => !prev);
  if (unreadCount > 0 && user?.id) {
    try {
      const userIdNum = Number(user.id);
      if (!Number.isNaN(userIdNum)) await notificationAPI.markAllAsRead(userIdNum);

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("❌ Error marking notifications as read:", err);
    }
  }
}, [unreadCount, user?.id]);


  useEffect(() => {
    loginTimeRef.current = loginTime;
  }, [loginTime]);
  useEffect(() => {
    totalWorkTimeRef.current = totalWorkTime;
  }, [totalWorkTime]);
  useEffect(() => {
    isOnBreakRef.current = isOnBreak;
  }, [isOnBreak]);

  useEffect(() => {
    if (user && !loginTime) {
      const now = Date.now();
      setLoginTime(now);
      const today = new Date().toDateString();
      localStorage.setItem('todayLoginTime', now.toString());
      localStorage.setItem('loginDate', today);
      const activityHistory = JSON.parse(localStorage.getItem('activityHistory') || '[]');
      activityHistory.push({
        label: 'Login',
        type: 'login',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        timestamp: now
      });
      localStorage.setItem('activityHistory', JSON.stringify(activityHistory));
    }
  }, [user, loginTime]);

  useEffect(() => {
    if (!loginTime) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const totalElapsed = Math.floor((now - (loginTimeRef.current ?? 0)) / 1000);
      const sessionHours = Math.floor(totalElapsed / 3600);
      const sessionMinutes = Math.floor((totalElapsed % 3600) / 60);
      const sessionSeconds = totalElapsed % 60;
      const formattedSessionTime = `${sessionHours.toString().padStart(2, '0')}:${sessionMinutes.toString().padStart(2, '0')}:${sessionSeconds.toString().padStart(2, '0')}`;
      setSessionTime((prev) => (prev !== formattedSessionTime ? formattedSessionTime : prev));

      let currentWorkTime = totalWorkTimeRef.current ?? 0;
      if (!isOnBreakRef.current) {
        const lastActivityHistory = JSON.parse(localStorage.getItem('activityHistory') || '[]');
        const lastWorkStart = findLastWorkStart(lastActivityHistory);
        if (lastWorkStart) currentWorkTime += Math.floor((now - lastWorkStart) / 1000);
      }

      const workHours = Math.floor(currentWorkTime / 3600);
      const workMinutes = Math.floor((currentWorkTime % 3600) / 60);
      const workSecs = currentWorkTime % 60;
      const formattedWorkTime = `${workHours.toString().padStart(2, '0')}:${workMinutes.toString().padStart(2, '0')}:${workSecs.toString().padStart(2, '0')}`;
      setWorkTime((prev) => (prev !== formattedWorkTime ? formattedWorkTime : prev));
    }, 1000);
    return () => clearInterval(interval);
  }, [loginTime, findLastWorkStart]);

  const startBreak = useCallback(() => {
    if (isOnBreakRef.current) return;
    const now = Date.now();
    setIsOnBreak(true);
    setBreakStartTime(now);
    const activityHistory = JSON.parse(localStorage.getItem('activityHistory') || '[]');
    const lastWorkStart = findLastWorkStart(activityHistory);
    if (lastWorkStart) {
      const workDuration = Math.floor((now - lastWorkStart) / 1000);
      setTotalWorkTime((prev) => prev + workDuration);
    }
    activityHistory.push({ label: 'Start Break', type: 'start_break', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }), timestamp: now });
    localStorage.setItem('activityHistory', JSON.stringify(activityHistory));
  }, [findLastWorkStart]);

  const endBreak = useCallback(() => {
    if (!isOnBreakRef.current) return;
    const now = Date.now();
    setIsOnBreak(false);
    setBreakStartTime(null);
    const activityHistory = JSON.parse(localStorage.getItem('activityHistory') || '[]');
    activityHistory.push({ label: 'End Break', type: 'end_break', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }), timestamp: now });
    localStorage.setItem('activityHistory', JSON.stringify(activityHistory));
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      const now = Date.now();
      const activityHistory = JSON.parse(localStorage.getItem('activityHistory') || '[]');

      if (!isOnBreakRef.current && loginTimeRef.current) {
        const lastWorkStart = findLastWorkStart(activityHistory);
        if (lastWorkStart) {
          const workDuration = Math.floor((now - lastWorkStart) / 1000);
          setTotalWorkTime((prev) => prev + workDuration);
        }
      }

      activityHistory.push({ label: 'Logout', type: 'logout', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }), timestamp: now });
      localStorage.setItem('activityHistory', JSON.stringify(activityHistory));
      localStorage.removeItem('todayLoginTime');
      localStorage.removeItem('loginDate');

      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout, findLastWorkStart]);

  const isActive = useCallback((href, exact = false) => {
    if (exact) return location.pathname === href;
    return location.pathname.startsWith(href);
  }, [location.pathname]);

  const isParentActive = useCallback((submenu) => submenu.some((child) => location.pathname.startsWith(child.href)), [location.pathname]);

  const handleSidebarLinkClick = useCallback(() => {
    if (sidebarOpen) setSidebarOpen(false);
  }, [sidebarOpen]);

  const handleSearchChange = useCallback((e) => setSearchQuery(e.target.value), []);
  const handleSearchFocus = useCallback(() => setSearchFocused(true), []);
  const handleSearchBlur = useCallback(() => setSearchFocused(false), []);
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    if (searchInputRef.current) searchInputRef.current.focus();
  }, []);

  const openActivityModal = useCallback(() => setActivityModalOpen(true), []);
  const closeActivityModal = useCallback(() => setActivityModalOpen(false), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeNotificationPanel = useCallback(() => setOpen(false), []);

  if (!user) return <Navigate to="/login" replace />;

  const companyLogo = systemSettings?.company_logo;
  const companyName = systemSettings?.company_name;

  // Sidebar component with unified nav color
  const SidebarComponent = useMemo(() => {
    return (
      <div className="flex flex-col h-full" ref={sidebarRef}>
        {/* Modern header with blue gradient */}
        <div className="flex items-center h-16 px-6 border-b border-slate-200 ">
          {companyLogo ? (
            <img
              src={companyLogo}
              alt={`${companyName}`}
              className="h-10 max-h-10 flex-1 object-contain" />
          ) : (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-orange-500 bg-clip-text text-transparent">
                  {companyName}
                </h1>
              </div>
            </div>
          )}
        </div>

        {/* Modern search with blue accent */}
        <div className="px-4 py-4 border-b border-slate-200 bg-slate-50">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className={cn('h-4 w-4 transition-colors duration-200', searchFocused ? 'text-blue-600' : 'text-slate-400')} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search navigation..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className={cn(
                'block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm bg-white',
                'placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600',
                'transition-all duration-200 hover:border-slate-400 shadow-sm',
                searchFocused && 'shadow-md'
              )}
              aria-label="Search navigation"
            />
            {searchQuery && (
              <button onClick={clearSearch} className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-slate-700 text-slate-400 transition-colors" type="button" aria-label="Clear search">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation with unified color for icons and labels */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto bg-white" role="navigation" aria-label="Main sidebar navigation">
          {filteredNavigation.map((item) => (
            <div key={item.name}>
              {item.type === 'single' ? (
                <Link to={item.href} onClick={handleSidebarLinkClick} className={cn(
                  'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:translate-x-1',
                  isActive(item.href, item.exact)
                    ? 'bg-gradient-to-r from-blue-700 to-blue-800 text-white shadow-lg shadow-blue-700/25'
                    : 'text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-800 hover:shadow-md'
                )}>
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-150',
                      isActive(item.href, item.exact)
                        ? 'text-white'
                        : `${item.colorClass} ${navHoverClass}`
                    )}
                  />
                  <span className={cn('flex-1', !isActive(item.href, item.exact) ? `${item.colorClass}` : '')}>{item.name}</span>
                  {isActive(item.href, item.exact) && <div className="w-2 h-2 bg-white rounded-full opacity-90" />}
                </Link>
              ) : (
                <div>
                  <button
                    onClick={() => toggleMenu(item.key)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleMenu(item.key); }}
                    aria-expanded={expandedMenus.has(item.key)}
                    aria-controls={`menu-${item.key}`}
                    tabIndex={0}
                    className={cn(
                      'group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:translate-x-1',
                      isParentActive(item.submenu)
                        ? 'bg-gradient-to-r from-blue-700 to-blue-800 text-white shadow-lg'
                        : 'text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-800 hover:shadow-md'
                    )}
                    type="button"
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-150',
                        isParentActive(item.submenu)
                          ? 'text-white'
                          : `${item.colorClass} ${navHoverClass}`
                      )}
                    />
                    <span className={cn('flex-1 text-left', !isParentActive(item.submenu) ? `${item.colorClass}` : '')}>{item.name}</span>
                    {expandedMenus.has(item.key) ? (
                      <ChevronDown className={cn('h-4 w-4 transition-transform duration-200',
                        isParentActive(item.submenu) ? 'text-white' : 'text-blue-500'
                      )} />
                    ) : (
                      <ChevronRight className={cn('h-4 w-4 transition-transform duration-200',
                        isParentActive(item.submenu) ? 'text-white' : 'text-blue-500'
                      )} />
                    )}
                  </button>

                  {expandedMenus.has(item.key) && (
                    <div id={`menu-${item.key}`} className="ml-6 mt-2 space-y-1 border-l-2 border-blue-200 pl-4">
                      {item.submenu.map((child) => (
                        <Link key={child.name} to={child.href} onClick={handleSidebarLinkClick} className={cn(
                          'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 hover:translate-x-1',
                          isActive(child.href)
                            ? 'bg-gradient-to-r from-blue-700 to-blue-800 text-white shadow-md'
                            : 'text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-800 hover:shadow-sm'
                        )}>
                          <child.icon className={cn('mr-3 h-4 w-4 flex-shrink-0 transition-colors duration-150',
                            isActive(child.href)
                              ? 'text-white'
                              : `${child.colorClass} ${navHoverClass}`
                          )} />
                          <span className={cn('flex-1', !isActive(child.href) ? `${child.colorClass}` : '')}>{child.name}</span>
                          {isActive(child.href) && <div className="w-1.5 h-1.5 bg-white rounded-full opacity-90" />}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {searchQuery && filteredNavigation.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No results found for "{searchQuery}"</p>
            </div>
          )}
        </nav>

        {/* Modern logout button */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button onClick={handleLogout} className="group flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 hover:text-red-700 transition-all duration-150 hover:translate-x-1 hover:shadow-md" type="button">
            <LogOut className="mr-3 h-5 w-5 text-red-500 group-hover:text-red-600 transition-colors duration-150" />
            <span className="flex-1 font-semibold">Sign out</span>
          </button>
        </div>
      </div>
    );
  }, [companyLogo, companyName, searchFocused, searchQuery, handleSearchChange, handleSearchFocus, handleSearchBlur, clearSearch, filteredNavigation, isActive, isParentActive, handleSidebarLinkClick, handleLogout, expandedMenus, toggleMenu, navHoverClass]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100/50">
      {/* Mobile sidebar with modern overlay */}
      <div className={cn('fixed inset-0 z-50 lg:hidden', sidebarOpen ? 'block' : 'hidden')}>
        <div className="fixed inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm" onClick={closeSidebar} aria-hidden />

        <div className="relative flex flex-col w-full max-w-xs bg-white shadow-2xl h-full max-h-screen">
          <div className="absolute top-0 right-0 -mr-12 pt-2 z-20">
            <button type="button" className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white hover:bg-slate-800 transition-colors" onClick={closeSidebar} aria-label="Close sidebar">
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className="h-full overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>{SidebarComponent}</div>
        </div>
      </div>

      {/* Desktop sidebar with modern styling */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white shadow-2xl border-r border-slate-200">{SidebarComponent}</div>
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Modern header with gradient */}
        <header className="bg-white shadow-lg border-b border-slate-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button type="button" className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-xl text-slate-500 hover:text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600 transition-colors" onClick={openSidebar} aria-label="Open sidebar">
                <Menu className="h-6 w-6" />
              </button>

              <Link to="/home" title="Go back to website" className="ml-3 flex items-center justify-center text-white font-semibold  bg-[#0c3854] px-2 py-1 rounded-xl text-sm  hover:bg-[#0b3858]/95 transition-colors shadow-md hover:shadow-lg">
                <FaEarthAsia className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline text-sm">Website</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {/* Desktop timer buttons with unified icon color */}
              <div className="hidden lg:flex items-center space-x-3">
                <button onClick={openActivityModal} title="Click to open activity tracker" className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all group shadow-sm hover:shadow-md" type="button">
                  <Clock className={`h-4 w-4 ${navTextClass} group-hover:opacity-90`} />
                  <span className="text-blue-700 text-sm font-semibold group-hover:text-blue-800">{sessionTime}</span>
                </button>

                <button title="Activity progress" className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all group shadow-sm hover:shadow-md" type="button">
                  <Activity className={`h-4 w-4 ${navTextClass} group-hover:opacity-90`} />
                  <span className="text-blue-700 text-sm font-semibold group-hover:text-blue-800">100%</span>
                </button>

                <button title="Coffee breaks taken" className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all group shadow-sm hover:shadow-md" type="button">
                  <Coffee className={`h-4 w-4 ${navTextClass} group-hover:opacity-90`} />
                  <span className="text-blue-700 text-sm font-semibold group-hover:text-blue-800">10</span>
                </button>
              </div>

              {/* Mobile timers dropdown with unified icon color */}
              <div className="relative lg:hidden" ref={mobileTimersRef}>
                <button onClick={(e) => { e.stopPropagation(); setMobileTimersOpen((p) => !p); }} title="Open timers" className="p-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm" type="button" aria-haspopup="true" aria-expanded={mobileTimersOpen}>
                  <Clock className={`h-5 w-5 ${navTextClass}`} />
                </button>

                {mobileTimersOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2" onClick={(e) => e.stopPropagation()}>
                    <div className="px-3">
                      <button onClick={() => { setMobileTimersOpen(false); openActivityModal(); }} title="Open activity tracker" className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg hover:bg-blue-50 transition-colors" type="button">
                        <Clock className={`h-4 w-4 ${navTextClass}`} />
                        <span className="text-sm font-medium text-blue-700">{sessionTime}</span>
                      </button>

                      <button onClick={() => setMobileTimersOpen(false)} title="Activity progress" className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg hover:bg-blue-50 transition-colors" type="button">
                        <Activity className={`h-4 w-4 ${navTextClass}`} />
                        <span className="text-sm font-medium text-blue-700">100%</span>
                      </button>

                      <button onClick={() => setMobileTimersOpen(false)} title="Coffee breaks" className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg hover:bg-blue-50 transition-colors" type="button">
                        <Coffee className={`h-4 w-4 ${navTextClass}`} />
                        <span className="text-sm font-medium text-blue-700">10</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modern notification bell with blue accent */}
              <div className="relative">
                <button onClick={handleBellClick} title="Notifications" className="relative p-2.5 text-slate-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-xl hover:bg-blue-50 transition-all shadow-sm" type="button" aria-haspopup="true" aria-expanded={open}>
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-gradient-to-br from-orange-500 to-orange-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-lg animate-pulse font-semibold">{unreadCount}</span>}
                </button>

                {/* // 5) render panel with normalized items (controlled mode works now) */}
{open && (
  <div className="absolute right-0 mt-2 z-50 w-80 md:right-0 lg:right-0 sm:right-2">
    <NotificationPanelAny
      notifications={notifications}
      onClose={closeNotificationPanel}
      // OR: remove notifications prop & pass forceFetch with userId to let panel fetch itself
      // userId={user?.id}
      // forceFetch
    />
  </div>
)}

              </div>

              <UserProfileMenu />
            </div>
          </div>
        </header>

        {/* Main content with blue gradient background */}
        <main className="flex-1 overflow-y-auto focus:outline-none bg-gradient-to-br from-blue-50/30 via-slate-50 to-blue-100/20">
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      <ActivityTrackerModal isOpen={activityModalOpen} onClose={closeActivityModal} sessionTime={sessionTime} workTime={workTime} isOnBreak={isOnBreak} onStartBreak={startBreak} onEndBreak={endBreak} loginTime={loginTime} />
    </div>
  );
};

export default DashboardLayout;
