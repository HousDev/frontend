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
  LayoutTemplate
} from 'lucide-react';

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

  const location = useLocation();
  const { user, logout, hasRole } = useAuth();

  const { systemSettings } = useSystemSettings();

  // Use refs to prevent unnecessary re-renders for interval logic
  const loginTimeRef = useRef(loginTime);
  const totalWorkTimeRef = useRef(totalWorkTime);
  const isOnBreakRef = useRef(isOnBreak);

  // ---- NOTE: If NotificationPanel's props are typed differently in its file,
  // this cast prevents a compile error here. If you want strict typing,
  // update NotificationPanel's props interface and remove this cast.
  const NotificationPanelAny = NotificationPanel as any;

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

        setNotifications(list);
        setUnreadCount(list.filter((n: any) => !n.is_read).length);
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

  // ✅ Bell click handler
  const handleBellClick = async () => {
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
  };

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

  // Update timers every second
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

  // Start Break Function
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

  // End Break Function
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

  // Memoize role-specific dashboards
  const roleDashboards = useMemo(() => {
    const dashboards: Array<{ name: string; href: string; icon: any; description?: string }> = [];
    if (hasRole('admin')) {
      dashboards.push({ name: 'Admin Dashboard', href: '/dashboard/admin', icon: Crown, description: 'System administration' });
    }
    if (hasRole(['admin', 'manager'])) {
      dashboards.push({ name: 'Manager Dashboard', href: '/dashboard/manager', icon: UserCheck, description: 'Team management' });
    }
    if (hasRole(['admin', 'manager', 'agent'])) {
      dashboards.push({ name: 'Agent Dashboard', href: '/dashboard/agent', icon: Briefcase, description: 'Personal workspace' });
    }
    dashboards.push(
      { name: 'Seller Dashboard', href: '/dashboard/seller', icon: ShoppingBag, description: 'Seller tools' },
      { name: 'Buyer Dashboard', href: '/dashboard/buyer', icon: Heart, description: 'Buyer tools' }
    );
    return dashboards;
  }, [hasRole]);

  // Memoize navigation
  const navigation = useMemo(() => {
    const nav: Array<{ name: string; href: string; icon: any; exact?: boolean }> = [
      { name: 'Overview', href: '/dashboard', icon: Home, exact: true },
      ...roleDashboards,
      { name: 'Leads', href: '/dashboard/leads', icon: Users },
      { name: 'Buyers', href: '/dashboard/buyers', icon: UserCheck },
      { name: 'Sellers', href: '/dashboard/sellers', icon: Users },
      { name: 'Properties', href: '/dashboard/properties', icon: Building },
      { name: 'Blog Manager', href: '/dashboard/blog-manager', icon: FileText },
      { name: 'AI Training', href: '/dashboard/ai-training', icon: FileText },
      { name: 'Document Center', href: '/dashboard/document-center', icon: FileText },
      { name: 'Template Center', href: '/dashboard/template-center', icon: LayoutTemplate },
      { name: 'Accounts', href: '/dashboard/accounts', icon: Receipt },
      { name: 'Vendors', href: '/dashboard/vendors', icon: Building },
      { name: 'Activities', href: '/dashboard/activities', icon: Activity },
      { name: 'Communication', href: '/dashboard/communication', icon: MessageSquare },
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    ];

    if (hasRole('admin')) {
      nav.push({ name: 'Users', href: '/dashboard/users', icon: Users });
    }

    return nav;
  }, [roleDashboards, hasRole]);

  // Memoize settings navigation
  const settingsNavigation = useMemo(() => [
    { name: 'General Settings', href: '/dashboard/settings', icon: Settings },
    { name: 'Roles & Permissions', href: '/dashboard/settings/roles-permissions', icon: Shield },
    { name: 'Integrations', href: '/dashboard/settings/integrations', icon: Zap },
    { name: 'AI Settings', href: '/dashboard/settings/ai', icon: Zap },
    { name: 'Master Data', href: '/dashboard/settings/master-data', icon: Database },
    { name: 'Import/Export', href: '/dashboard/settings/import-export', icon: Download },
  ], []);

  // Logout with activity tracking
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

  // Memoize isActive function
  const isActive = useCallback((href: string, exact = false) => {
    if (exact) return location.pathname === href;
    return location.pathname.startsWith(href);
  }, [location.pathname]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Company info from system settings
  const companyLogo = systemSettings?.company_logo;
  const companyName = systemSettings?.company_name;

  const Sidebar = useMemo(() => () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-16 px-6 border-b space-x-3">
        {companyLogo ? (
          <img
            src={companyLogo}
            alt="Company Logo"
            className="h-10 w-25 object-contain rounded-xs shadow-sm bg-white p-1"
          />
        ) : (
          <span className="text-2xl font-bold text-gray-900 tracking-tight">
            {companyName}
          </span>
        )}
      </div>

      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
              isActive(item.href, item.exact)
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <item.icon
              className={cn(
                'mr-3 h-5 w-5 flex-shrink-0',
                isActive(item.href, item.exact)
                  ? 'text-blue-700'
                  : 'text-gray-400 group-hover:text-gray-500'
              )}
            />
            {item.name}
          </Link>
        ))}

        <div className="pt-6">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Settings</h3>
          <div className="mt-2 space-y-1">
            {settingsNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive(item.href)
                      ? 'text-blue-700'
                      : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
          Sign out
        </button>
      </div>
    </div>
  ), [user, navigation, settingsNavigation, isActive, handleLogout, companyName, companyLogo]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={cn('fixed inset-0 z-40 lg:hidden', sidebarOpen ? 'block' : 'hidden')}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex flex-col w-full max-w-xs bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <Sidebar />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 bg-white border-r">
          <Sidebar />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                type="button"
                className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/home"
                className="text-sm text-blue-600 hover:text-blue-500 font-semibold"
              >
                ← Back to website
              </Link>
              {/* Timer Display */}
              <button
                onClick={() => setActivityModalOpen(true)}
                className="flex items-center space-x-2 p-2 rounded-md"
                title="Click to open activity tracker"
              >
                <Clock className="h-5 w-5 text-green-500" />
                <span className="text-green-500 text-sm font-semibold">
                  {sessionTime}
                </span>
              </button>

              <button className="flex items-center space-x-1 p-2 rounded-md">
                <Activity className="h-5 w-5 text-purple-500" />
                <span className="text-purple-500 text-sm font-semibold">
                  100%
                </span>
              </button>

              <button className="flex items-center space-x-1 p-2 rounded-md">
                <Coffee className="h-5 w-5 text-orange-500" />
                <span className="text-orange-500 text-sm font-semibold">
                  10
                </span>
              </button>

              <div className="relative">
                <button
                  onClick={handleBellClick}
                  className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                >
                  <Bell className="h-4 w-4 text-blue-600" />

                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-80">
                    <NotificationPanelAny
                      notifications={notifications}
                      onClose={() => setOpen(false)}
                    />
                  </div>
                )}
              </div>

              <UserProfileMenu />

            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      <ActivityTrackerModal
        isOpen={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
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
