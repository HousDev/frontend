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
  MessageCircle
} from 'lucide-react';
import { FaEarthAsia } from "react-icons/fa6";
import { useAuth } from '@/contexts/AuthContext';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';
import { cn } from '@/lib/utils';
import ActivityTrackerModal from "./ActivityTrackerModal";
import NotificationPanel from './NotificationPanel';
import { notificationAPI } from '@/lib/notificationAPI';
import UserProfileMenu from "./UserProfileMenu";

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [sessionTime, setSessionTime] = useState('00:00:00');
  const [workTime, setWorkTime] = useState('00:00:00');
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [loginTime, setLoginTime] = useState<number | null>(null);
  const [totalWorkTime, setTotalWorkTime] = useState(0);
  const [breakStartTime, setBreakStartTime] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const location = useLocation();
  const { user, logout, hasRole } = useAuth();
  const { systemSettings } = useSystemSettings();

  // Use refs to prevent unnecessary re-renders for interval logic
  const loginTimeRef = useRef(loginTime);
  const totalWorkTimeRef = useRef(totalWorkTime);
  const isOnBreakRef = useRef(isOnBreak);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  // mobile timers popover state / ref
  const [mobileTimersOpen, setMobileTimersOpen] = useState(false);
  const mobileTimersRef = useRef<HTMLDivElement | null>(null);

  // ---- NOTE: If NotificationPanel's props are typed differently in its file,
  // this cast prevents a compile error here. If you want strict typing,
  // update NotificationPanel's props interface and remove this cast.
  const NotificationPanelAny = NotificationPanel as any;
  // close mobile timers popover when clicking outside or on route change
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!mobileTimersRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!mobileTimersRef.current.contains(e.target)) {
        setMobileTimersOpen(false);
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // ✅ Get notifications from API (with polling) - only when user exists
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    const fetchNotifications = async () => {
      try {
        if (!user?.id) return;
        // Ensure we pass a number (API expects number)
        const userIdNum = Number(user.id);
        if (Number.isNaN(userIdNum)) return;

        const res = await notificationAPI.getUserNotifications(userIdNum);

        // backend returns { success, notifications } (defensive)
        const list = res?.notifications || [];

        setNotifications(prev => {
          // Only update if notifications actually changed
          if (JSON.stringify(prev) !== JSON.stringify(list)) {
            return list;
          }
          return prev;
        });

        const newUnreadCount = list.filter((n: any) => !n.is_read).length;
        setUnreadCount(prev => prev !== newUnreadCount ? newUnreadCount : prev);
      } catch (err) {
        console.error("❌ Error fetching notifications:", err);
      }
    };

    if (user?.id) {
      fetchNotifications(); // initial load
      interval = setInterval(fetchNotifications, 10000); // refresh every 10s
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user?.id]);

  // ✅ Bell click handler - memoized to prevent recreating
  const handleBellClick = useCallback(async () => {
    setOpen((prev) => !prev);

    if (unreadCount > 0 && user?.id) {
      try {
        const userIdNum = Number(user.id);
        if (!Number.isNaN(userIdNum)) {
          await notificationAPI.markAllAsRead(userIdNum); // backend API call
        }

        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);
      } catch (err) {
        console.error("❌ Error marking notifications as read:", err);
      }
    }
  }, [unreadCount, user?.id]);

  // Update refs when state changes
  useEffect(() => { loginTimeRef.current = loginTime; }, [loginTime]);
  useEffect(() => { totalWorkTimeRef.current = totalWorkTime; }, [totalWorkTime]);
  useEffect(() => { isOnBreakRef.current = isOnBreak; }, [isOnBreak]);

  // Memoize helper function to prevent recreation on every render
  const findLastWorkStart = useCallback((history: any[]) => {
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].type === 'login' || history[i].type === 'end_break') {
        return history[i].timestamp;
      }
      if (history[i].type === 'start_break') {
        return null;
      }
    }
    return loginTimeRef.current;
  }, []);

  // Initialize login time when user logs in
  useEffect(() => {
    if (user && !loginTime) {
      const now = Date.now();
      setLoginTime(now);

      // Save login time for today
      const today = new Date().toDateString();
      localStorage.setItem('todayLoginTime', now.toString());
      localStorage.setItem('loginDate', today);

      // Add login event to activity history
      const activityHistory = JSON.parse(localStorage.getItem("activityHistory") || "[]");
      activityHistory.push({
        label: "Login",
        type: "login",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }),
        timestamp: now,
      });
      localStorage.setItem("activityHistory", JSON.stringify(activityHistory));
    }
  }, [user, loginTime]);

  // Update timers every second - optimized to prevent unnecessary re-renders
  useEffect(() => {
    if (!loginTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const totalElapsed = Math.floor((now - (loginTimeRef.current ?? 0)) / 1000);

      // Format total session time
      const sessionHours = Math.floor(totalElapsed / 3600);
      const sessionMinutes = Math.floor((totalElapsed % 3600) / 60);
      const sessionSeconds = totalElapsed % 60;
      const formattedSessionTime = `${sessionHours.toString().padStart(2, '0')}:${sessionMinutes.toString().padStart(2, '0')}:${sessionSeconds.toString().padStart(2, '0')}`;

      setSessionTime(prev => prev !== formattedSessionTime ? formattedSessionTime : prev);

      // Calculate work time (exclude break periods)
      let currentWorkTime = totalWorkTimeRef.current ?? 0;

      if (!isOnBreakRef.current) {
        const lastActivityHistory = JSON.parse(localStorage.getItem("activityHistory") || "[]");
        const lastWorkStart = findLastWorkStart(lastActivityHistory);
        if (lastWorkStart) {
          currentWorkTime += Math.floor((now - lastWorkStart) / 1000);
        }
      }

      // Format work time
      const workHours = Math.floor(currentWorkTime / 3600);
      const workMinutes = Math.floor((currentWorkTime % 3600) / 60);
      const workSecs = currentWorkTime % 60;
      const formattedWorkTime = `${workHours.toString().padStart(2, '0')}:${workMinutes.toString().padStart(2, '0')}:${workSecs.toString().padStart(2, '0')}`;

      setWorkTime(prev => prev !== formattedWorkTime ? formattedWorkTime : prev);

    }, 1000);

    return () => clearInterval(interval);
  }, [loginTime, findLastWorkStart]);

  // Start Break Function - memoized
  const startBreak = useCallback(() => {
    if (isOnBreakRef.current) return;

    const now = Date.now();
    setIsOnBreak(true);
    setBreakStartTime(now);

    const activityHistory = JSON.parse(localStorage.getItem("activityHistory") || "[]");
    const lastWorkStart = findLastWorkStart(activityHistory);
    if (lastWorkStart) {
      const workDuration = Math.floor((now - lastWorkStart) / 1000);
      setTotalWorkTime(prev => prev + workDuration);
    }

    activityHistory.push({
      label: "Start Break",
      type: "start_break",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }),
      timestamp: now,
    });
    localStorage.setItem("activityHistory", JSON.stringify(activityHistory));
  }, [findLastWorkStart]);

  // End Break Function - memoized
  const endBreak = useCallback(() => {
    if (!isOnBreakRef.current) return;

    const now = Date.now();
    setIsOnBreak(false);
    setBreakStartTime(null);

    const activityHistory = JSON.parse(localStorage.getItem("activityHistory") || "[]");
    activityHistory.push({
      label: "End Break",
      type: "end_break",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }),
      timestamp: now,
    });
    localStorage.setItem("activityHistory", JSON.stringify(activityHistory));
  }, []);

  // Memoize role-specific dashboards - stable reference
  const roleDashboards = useMemo(() => {
    const dashboards: Array<{ name: string; href: string; icon: any; description?: string; color?: string }> = [];
    if (hasRole('admin')) {
      dashboards.push({
        name: 'Admin Dashboard',
        href: '/dashboard/admin',
        icon: Crown,
        description: 'System administration',
        color: 'text-purple-600'
      });
    }
    if (hasRole(['admin', 'manager'])) {
      dashboards.push({
        name: 'Manager Dashboard',
        href: '/dashboard/manager',
        icon: UserCheck,
        description: 'Team management',
        color: 'text-indigo-600'
      });
    }
    if (hasRole(['admin', 'manager', 'agent'])) {
      dashboards.push({
        name: 'Agent Dashboard',
        href: '/dashboard/agent',
        icon: Briefcase,
        description: 'Personal workspace',
        color: 'text-blue-600'
      });
    }
    dashboards.push(
      {
        name: 'Seller Dashboard',
        href: '/dashboard/seller',
        icon: ShoppingBag,
        description: 'Seller tools',
        color: 'text-green-600'
      },
      {
        name: 'Buyer Dashboard',
        href: '/dashboard/buyer',
        icon: Heart,
        description: 'Buyer tools',
        color: 'text-pink-600'
      }
    );
    return dashboards;
  }, [hasRole]);

  // Stable navigation array - memoized with proper dependencies
  const navigation = useMemo(() => {
    const nav: Array<{ name: string; href: string; icon: any; exact?: boolean; color?: string }> = [
      { name: 'Overview', href: '/dashboard', icon: Home, exact: true, color: 'text-blue-600' },
      ...roleDashboards,
      { name: 'Leads', href: '/dashboard/leads', icon: Users, color: 'text-emerald-600' },
      { name: 'Buyers', href: '/dashboard/buyers', icon: UserCheck, color: 'text-teal-600' },
      { name: 'Sellers', href: '/dashboard/sellers', icon: Users, color: 'text-cyan-600' },
      { name: 'Properties', href: '/dashboard/properties', icon: Building, color: 'text-orange-600' },
      { name: 'Blog Manager', href: '/dashboard/blog-manager', icon: FileText, color: 'text-rose-600' },
      { name: 'Contact Messages', href: '/dashboard/contact-messages', icon: MessageCircle, color: 'text-rose-600' },
      { name: 'AI Training', href: '/dashboard/ai-training', icon: FileText, color: 'text-violet-600' },
      { name: 'Document Center', href: '/dashboard/document-center', icon: FileText, color: 'text-amber-600' },
      { name: 'Template Center', href: '/dashboard/template-center', icon: LayoutTemplate, color: 'text-lime-600' },
      { name: 'Accounts', href: '/dashboard/accounts', icon: Receipt, color: 'text-yellow-600' },
      { name: 'Vendors', href: '/dashboard/vendors', icon: Building, color: 'text-stone-600' },
      { name: 'Activities', href: '/dashboard/activities', icon: Activity, color: 'text-red-600' },
      { name: 'Communication', href: '/dashboard/communication', icon: MessageSquare, color: 'text-sky-600' },
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, color: 'text-fuchsia-600' },
    ];

    if (hasRole('admin')) {
      nav.push({ name: 'Users', href: '/dashboard/users', icon: Users, color: 'text-slate-600' });
    }

    return nav;
  }, [roleDashboards, hasRole]);

  // Stable settings navigation - memoized
  const settingsNavigation = useMemo(() => [
    { name: 'General Settings', href: '/dashboard/settings', icon: Settings, color: 'text-gray-600' },
    { name: 'Roles & Permissions', href: '/dashboard/settings/roles-permissions', icon: Shield, color: 'text-red-600' },
    { name: 'Integrations', href: '/dashboard/settings/integrations', icon: Zap, color: 'text-yellow-600' },
    { name: 'AI Settings', href: '/dashboard/settings/ai', icon: Zap, color: 'text-purple-600' },
    { name: 'Master Data', href: '/dashboard/settings/master-data', icon: Database, color: 'text-blue-600' },
    { name: 'Import/Export', href: '/dashboard/settings/import-export', icon: Download, color: 'text-green-600' },
  ], []);

  // Filter navigation based on search query - optimized
  const filteredNavigation = useMemo(() => {
    if (!searchQuery.trim()) return navigation;
    return navigation.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [navigation, searchQuery]);

  // Filter settings navigation based on search query - optimized
  const filteredSettingsNavigation = useMemo(() => {
    if (!searchQuery.trim()) return settingsNavigation;
    return settingsNavigation.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [settingsNavigation, searchQuery]);

  // Logout with activity tracking - memoized
  const handleLogout = useCallback(async () => {
    try {
      const now = Date.now();
      const activityHistory = JSON.parse(localStorage.getItem("activityHistory") || "[]");

      if (!isOnBreakRef.current && loginTimeRef.current) {
        const lastWorkStart = findLastWorkStart(activityHistory);
        if (lastWorkStart) {
          const workDuration = Math.floor((now - lastWorkStart) / 1000);
          setTotalWorkTime(prev => prev + workDuration);
        }
      }

      activityHistory.push({
        label: "Logout",
        type: "logout",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }),
        timestamp: now,
      });
      localStorage.setItem("activityHistory", JSON.stringify(activityHistory));

      localStorage.removeItem('todayLoginTime');
      localStorage.removeItem('loginDate');

      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout, findLastWorkStart]);

  // Stable isActive function
  const isActive = useCallback((href: string, exact = false) => {
    if (exact) return location.pathname === href;
    return location.pathname.startsWith(href);
  }, [location.pathname]);

  // Handle sidebar link click - memoized and stable
  const handleSidebarLinkClick = useCallback(() => {
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [sidebarOpen]);

  // Search handlers - memoized to prevent focus loss
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleSearchFocus = useCallback(() => {
    setSearchFocused(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    setSearchFocused(false);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    // Keep focus on input after clearing
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Activity modal handlers - memoized
  const openActivityModal = useCallback(() => {
    setActivityModalOpen(true);
  }, []);

  const closeActivityModal = useCallback(() => {
    setActivityModalOpen(false);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const closeNotificationPanel = useCallback(() => {
    setOpen(false);
  }, []);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Company info from system settings
  const companyLogo = systemSettings?.company_logo;
  const companyName = systemSettings?.company_name;

  // Stable Sidebar component - properly memoized
  const SidebarComponent = useMemo(() => {
    return (
      <div className="flex flex-col h-full" ref={sidebarRef}>
        {/* Company Header */}
        <div className="flex items-center h-16 px-6 border-b">
          {companyLogo ? (
            <img
              src={companyLogo}
              alt="Company Logo"
              className="h-full max-h-16 flex-1 object-contain rounded-lg shadow-sm bg-white p-1"
            />
          ) : (
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                {companyName || "Dashboard"}
              </span>
            </div>
          )}
        </div>


        {/* Search Bar */}
        <div className="px-4 py-3 border-b bg-gray-50">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className={cn(
                "h-4 w-4 transition-colors duration-200",
                searchFocused ? "text-blue-500" : "text-gray-400"
              )} />
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
                "block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm",
                "placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500",
                "transition-all duration-200 hover:border-gray-400",
                searchFocused && "shadow-sm"
              )}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700 text-gray-400 transition-colors"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={handleSidebarLinkClick}
              className={cn(
                'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 hover:translate-x-1',
                isActive(item.href, item.exact)
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-gray-900 hover:shadow-sm'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-150',
                  isActive(item.href, item.exact)
                    ? 'text-white'
                    : `${item.color || 'text-gray-400'} group-hover:${item.color || 'text-gray-500'}`
                )}
              />
              <span className="flex-1">{item.name}</span>
              {isActive(item.href, item.exact) && (
                <div className="w-2 h-2 bg-white rounded-full opacity-75"></div>
              )}
            </Link>
          ))}

          {/* Settings Section */}
          {(filteredSettingsNavigation.length > 0 || !searchQuery) && (
            <div className="pt-6">
              <h3 className="px-3 text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </h3>
              <div className="mt-3 space-y-1">
                {filteredSettingsNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={handleSidebarLinkClick}
                    className={cn(
                      'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 hover:translate-x-1',
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:text-gray-900 hover:shadow-sm'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-150',
                        isActive(item.href)
                          ? 'text-white'
                          : `${item.color || 'text-gray-400'} group-hover:${item.color || 'text-gray-500'}`
                      )}
                    />
                    <span className="flex-1">{item.name}</span>
                    {isActive(item.href) && (
                      <div className="w-2 h-2 bg-white rounded-full opacity-75"></div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* No results message */}
          {searchQuery && filteredNavigation.length === 0 && filteredSettingsNavigation.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No results found for "{searchQuery}"</p>
            </div>
          )}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t bg-gray-50 py-1">
          <button
            onClick={handleLogout}
            className="group flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-all duration-150 hover:translate-x-1 hover:shadow-sm"
            type="button"
          >
            <LogOut className="mr-3 h-5 w-5 text-red-500 group-hover:text-red-600 transition-colors duration-150" />
            <span className="flex-1">Sign out</span>
          </button>
        </div>
      </div>
    );
  }, [
    companyLogo,
    companyName,
    searchFocused,
    searchQuery,
    handleSearchChange,
    handleSearchFocus,
    handleSearchBlur,
    clearSearch,
    filteredNavigation,
    filteredSettingsNavigation,
    isActive,
    handleSidebarLinkClick,
    handleLogout
  ]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Mobile sidebar */}
      {/* Mobile sidebar */}
      {/* Mobile sidebar */}
      <div className={cn('fixed inset-0 z-50 lg:hidden', sidebarOpen ? 'block' : 'hidden')}>
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm"
          onClick={closeSidebar}
        />

        {/* Sidebar container */}
        <div className="relative flex flex-col w-full max-w-xs bg-white shadow-2xl h-full max-h-screen">

          {/* Floating close button (same as your original) */}
          <div className="absolute top-0 right-0 -mr-12 pt-2 z-20">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full
                   focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white
                   hover:bg-gray-800 transition-colors"
              onClick={closeSidebar}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Scrollable sidebar content */}
          <div
            className="h-full overflow-y-auto"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {SidebarComponent}
          </div>
        </div>
      </div>



      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white shadow-xl border-r border-gray-200">
          {SidebarComponent}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                type="button"
                className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
                onClick={openSidebar}
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Back to Website moved to left so it doesn't shift when right-side changes */}
              <Link
                to="/home"
                title="Go back to website"
                className="ml-3 flex items-center justify-center text-white font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-sm"
              >
                <FaEarthAsia className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline text-sm">Website</span>
              </Link>
            </div>

            {/* Header -- right side controls */}
            <div className="flex items-center space-x-3">
              {/* ---------- DESKTOP: show full buttons ---------- */}
              <div className="hidden lg:flex items-center space-x-3">
                {/* Timer Display */}
                <button
                  onClick={openActivityModal}
                  title="Click to open activity tracker"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 transition-colors group"
                  type="button"
                >
                  <Clock className="h-4 w-4 text-green-600 group-hover:text-green-700" />
                  <span className="text-green-600 text-sm font-semibold group-hover:text-green-700">
                    {sessionTime}
                  </span>
                </button>

                <button
                  title="Activity progress"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors group"
                  type="button"
                >
                  <Activity className="h-4 w-4 text-purple-600 group-hover:text-purple-700" />
                  <span className="text-purple-600 text-sm font-semibold group-hover:text-purple-700">
                    100%
                  </span>
                </button>

                <button
                  title="Coffee breaks taken"
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors group"
                  type="button"
                >
                  <Coffee className="h-4 w-4 text-orange-600 group-hover:text-orange-700" />
                  <span className="text-orange-600 text-sm font-semibold group-hover:text-orange-700">
                    10
                  </span>
                </button>
              </div>

              {/* ---------- MOBILE: single icon button that toggles the timers panel ---------- */}
              <div className="relative lg:hidden" ref={mobileTimersRef}>
                <button
                  onClick={(e) => { e.stopPropagation(); setMobileTimersOpen(prev => !prev); }}
                  title="Open timers"
                  className="p-2 rounded-lg bg-green-50 hover:bg-green-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
                  type="button"
                >
                  {/* use Clock icon as requested */}
                  <Clock className="h-5 w-5 text-green-700" />
                </button>

                {mobileTimersOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-3">
                      <button
                        onClick={() => { setMobileTimersOpen(false); openActivityModal(); }}
                        title="Open activity tracker"
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50"
                        type="button"
                      >
                        <Clock className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">{sessionTime}</span>
                      </button>

                      <button
                        onClick={() => setMobileTimersOpen(false)}
                        title="Activity progress"
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50"
                        type="button"
                      >
                        <Activity className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-700">100%</span>
                      </button>

                      <button
                        onClick={() => setMobileTimersOpen(false)}
                        title="Coffee breaks"
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50"
                        type="button"
                      >
                        <Coffee className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-gray-700">10</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Notifications bell + profile (unchanged) */}
              <div className="relative">
                <button
                  onClick={handleBellClick}
                  title="Notifications"
                  className="relative p-2 text-gray-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
                  type="button"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-md animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 z-50 w-80 md:right-0 lg:right-0 sm:right-2">
                    <NotificationPanelAny
                      notifications={notifications}
                      onClose={closeNotificationPanel}
                    />
                  </div>

                )}
              </div>

              <UserProfileMenu />
            </div>
          </div>
        </header>


        {/* Main content area */}
        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Activity Tracker Modal */}
      <ActivityTrackerModal
        isOpen={activityModalOpen}
        onClose={closeActivityModal}
        sessionTime={sessionTime}
        workTime={workTime}
        isOnBreak={isOnBreak}
        onStartBreak={startBreak}
        onEndBreak={endBreak}
        loginTime={loginTime}
      />
    </div>
  );
};

export default DashboardLayout;
