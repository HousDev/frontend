import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Outlet, Link, useLocation, Navigate, useNavigate } from "react-router-dom";
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
  ShieldCheck,
  Zap,
  Database,
  Download,
  UserCheck,
  Crown,
  Briefcase,
  Clock,
  Coffee,
  FileText,
  Receipt,
  LayoutTemplate,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Globe,
  Wrench,
  Edit3,
  Target,
  TrendingUp,
  KeyRound,
  Bot,
} from "lucide-react";
import { FaEarthAsia, FaWhatsapp } from "react-icons/fa6";
import { useAuth } from "@/contexts/AuthContext";
import { useSystemSettings } from "@/contexts/SystemSettingsContext";
import { cn } from "@/lib/utils";
import ActivityTrackerModal from "./ActivityTrackerModal";
import NotificationPanel from "./NotificationPanel";
import { notificationAPI } from "@/lib/notificationAPI";
import UserProfileMenu from "./UserProfileMenu";
import { can } from "@/utils/permission";
import { whatsappAPI } from "@/lib/whatsappApi";
import { initNotificationSound, playNotificationSound } from "../../src/utils/notificationSound";
import { io } from "socket.io-client";

// Socket connection function (same as ChatWindow)
function connectSocket(userId: string | number) {
  const socketUrl = import.meta.env.VITE_API_URL || (typeof window !== "undefined" && window.location.hostname === "localhost" ? "http://localhost:3000" : "https://resaleexpert.in");
  return io(socketUrl, {
    path: "/socket.io",
    transports: ["websocket", "polling"],
    query: { userId: String(userId) },
    withCredentials: true,
  });
}

// Color configuration
const COLORS = {
  primary: {
    main: "#1a2a6c",
    light: "#2a3a7c",
    dark: "#0f1a4a",
  },
  secondary: {
    main: "#f97316",
    light: "#fb923c",
    dark: "#ea580c",
  },
};

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
  timestamp: string;
  read: boolean;
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
      : type === "buyer_assign"
        ? "Buyer Assigned"
        : type === "seller_assign"
          ? "Seller Assigned"
          : type === "property_assign"
            ? "Property Assigned"
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
    timestamp: n.created_at ?? n.updated_at ?? "1970-01-01 00:00:00",
    read: normalizeRead(n.is_read),
    link: n.link ?? null,
    color: "orange",
  };
};

type PermissionKey = string;

type NavigationSingle = {
  name: string;
  href: string;
  icon: any;
  exact: boolean;
  colorClass: string;
  type: "single";
  required?: PermissionKey | PermissionKey[];
};

type NavigationDropdown = {
  name: string;
  icon: any;
  colorClass: string;
  type: "dropdown";
  key: string;
  required?: PermissionKey | PermissionKey[];
  submenu: Array<{
    name: string;
    href: string;
    icon: any;
    colorClass: string;
    required?: PermissionKey | PermissionKey[];
  }>;
};

type NavigationItem = NavigationSingle | NavigationDropdown;

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [sessionTime, setSessionTime] = useState("00:00:00");
  const [workTime, setWorkTime] = useState("00:00:00");
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [loginTime, setLoginTime] = useState<number | null>(null);
  const [totalWorkTime, setTotalWorkTime] = useState(0);
  const [breakStartTime, setBreakStartTime] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasRole } = useAuth();
  const { systemSettings } = useSystemSettings();

  // Redirect clients/customers away from admin dashboard layout to their dedicated clean portal
  useEffect(() => {
    if (!user) return;
    const role = ((user as any).role || "").toLowerCase().trim();
    const uid = (user as any)?.tenant_id || (user as any)?.buyer_id || (user as any)?.seller_id || user?.id || 1;
    if (role === "tenant") {
      navigate(`/tenant-dashboard/${uid}`, { replace: true });
    } else if (role === "buyer") {
      navigate(`/buyer-dashboard/${uid}`, { replace: true });
    } else if (role === "seller") {
      navigate(`/seller-dashboard/${uid}`, { replace: true });
    } else if (role === "owner") {
      const ownerUid = (user as any)?.owner_id || (user as any)?.id || 1;
      navigate(`/owner-dashboard/${ownerUid}`, { replace: true });
    } else if (role === "broker") {
      navigate("/properties", { replace: true });
    }
  }, [user, navigate]);

  const loginTimeRef = useRef(loginTime);
  const totalWorkTimeRef = useRef(totalWorkTime);
  const isOnBreakRef = useRef(isOnBreak);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [mobileTimersOpen, setMobileTimersOpen] = useState(false);
  const mobileTimersRef = useRef<HTMLDivElement | null>(null);
  const prevUnreadCountRef = useRef<number>(0);

  // ✅ Socket.IO ref (same as ChatWindow)
  const socketRef = useRef<any>(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const NotificationPanelAny = NotificationPanel;
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [whatsappCount, setWhatsappCount] = useState<number>(0);
  const prevWhatsappCountRef = useRef<number>(0);

  const navTextClass = `text-[${COLORS.primary.main}]`;

  const userCan = useCallback(
    (perm?: PermissionKey | PermissionKey[]) => {
      if (!perm) return true;
      if (Array.isArray(perm)) {
        return perm.some((p) => can(user, p));
      }
      return can(user, perm);
    },
    [user]
  );

  const toggleMenu = useCallback((menuKey: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(menuKey)) {
        next.delete(menuKey);
        return next;
      } else {
        return new Set([menuKey]);
      }
    });
  }, []);

  // ✅ Fetch notifications function
  const fetchNotifications = useCallback(async () => {
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

      setNotifications((prev) =>
        JSON.stringify(prev) !== JSON.stringify(ui) ? ui : prev
      );
      const newUnread = ui.filter((n) => !n.read).length;

      if (newUnread > prevUnreadCountRef.current) {
        playNotificationSound();
      }
      prevUnreadCountRef.current = newUnread;

      setUnreadCount((prev) =>
        prev !== newUnread ? newUnread : prev
      );
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, [user?.id]);

  // ✅ Fetch WhatsApp count function
  const fetchWhatsappCount = useCallback(async () => {
    try {
      const contacts = await whatsappAPI.getContacts();
      if (!Array.isArray(contacts)) {
        setWhatsappCount(0);
        return;
      }

      let totalUnread = 0;
      contacts.forEach((contact: any) => {
        totalUnread += Number(contact.unread_count) || 0;
      });

      if (totalUnread > prevWhatsappCountRef.current) {
        playNotificationSound();
      }
      prevWhatsappCountRef.current = totalUnread;
      setWhatsappCount(totalUnread);
    } catch (err) {
      console.error('Failed to fetch whatsapp count:', err);
      setWhatsappCount(0);
    }
  }, []);

  // ✅ Socket.IO Setup (SAME AS CHATWINDOW)
  useEffect(() => {
    if (!user?.id) return;

    console.log("🔌 [Dashboard] Connecting socket for userId:", user.id);

    const socket = connectSocket(user.id);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ [Dashboard] Socket connected successfully, id:", socket.id);
      setSocketConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ [Dashboard] Socket disconnected");
      setSocketConnected(false);
    });

    // ✅ Listen for new notifications (same pattern as ChatWindow)
    const handleNewNotification = (data: any) => {
      console.log("🔔 [Dashboard] New notification received:", data);
      playNotificationSound();
      fetchNotifications();

      // Browser notification
      if (Notification.permission === "granted" && data?.message) {
        new Notification(data.title || "New Notification", {
          body: data.message,
          icon: systemSettings?.company_logo || "/vite.svg",
        });
      }
    };

    // ✅ Listen for notifications updated (bulk)
    const handleNotificationsUpdated = () => {
      console.log("📢 [Dashboard] Notifications updated");
      playNotificationSound();
      fetchNotifications();
    };

    // ✅ Listen for WhatsApp new message (real-time count update)
    const handleWhatsAppNew = (data: any) => {
      console.log("💬 [Dashboard] New WhatsApp message via socket:", data);
      playNotificationSound();
      fetchWhatsappCount();

      // Increment count immediately for better UX
      setWhatsappCount(prev => prev + 1);
    };

    // ✅ Listen for WhatsApp messages read
    const handleWhatsAppRead = (data: any) => {
      console.log("✅ [Dashboard] WhatsApp messages read:", data);
      fetchWhatsappCount();
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("notifications_updated", handleNotificationsUpdated);
    socket.on("whatsapp:new", handleWhatsAppNew);
    socket.on("whatsapp:read", handleWhatsAppRead);

    // Initial fetch
    fetchNotifications();
    fetchWhatsappCount();

    return () => {
      console.log("🧹 [Dashboard] Cleaning up socket");
      if (socket) {
        socket.off("notification:new", handleNewNotification);
        socket.off("notifications_updated", handleNotificationsUpdated);
        socket.off("whatsapp:new", handleWhatsAppNew);
        socket.off("whatsapp:read", handleWhatsAppRead);
        socket.off("connect");
        socket.off("disconnect");
        socket.disconnect();
      }
      socketRef.current = null;
    };
  }, [user?.id, fetchNotifications, fetchWhatsappCount, systemSettings?.company_logo]);

  // ✅ Fallback polling only when socket is disconnected
  // 30s interval — each call now only makes 1 request (contacts embeds unread_count)
  useEffect(() => {
    if (!user?.id) return;

    let interval: NodeJS.Timeout | null = null;

    if (!socketConnected) {
      console.log("🔄 [Dashboard] Socket disconnected, starting polling fallback (30s)");
      interval = setInterval(() => {
        fetchNotifications();
        fetchWhatsappCount();
      }, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [socketConnected, user?.id, fetchNotifications, fetchWhatsappCount]);


  // Auto-expand menus based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    const menuMappings: Record<string, string[]> = {
      cms: ["/dashboard/blog-manager"],
      crm: [
        "/dashboard/leads",
        "/dashboard/buyers",
        "/dashboard/sellers",
        "/dashboard/owners",
        "/dashboard/owners-account",
        "/dashboard/properties",
        "/dashboard/rental-properties",
        "/dashboard/tenants",
        "/dashboard/contact-messages",
      ],
      administrator: [
        "/dashboard/document-center",
        "/dashboard/template-center",
        "/dashboard/accounts",
      ],
      tools: ["/dashboard/vendors", "/dashboard/ai-training"],
      reports: ["/dashboard/activities", "/reports/activities", "/reports/logged-in", "/dashboard/analytics", "/admin/reports"],
      settings: [
        "/dashboard/settings",
        "/dashboard/settings/roles-permissions",
        "/dashboard/settings/integrations",
        "/dashboard/settings/ai",
        "/dashboard/settings/master-data",
        "/dashboard/settings/veriable-center",
        "/dashboard/settings/import-export",
      ],
    };

    let matchedKey: string | null = null;
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
      setExpandedMenus(new Set());
    }
  }, [location.pathname]);

  const findLastWorkStart = useCallback((history: any[]) => {
    for (let i = history.length - 1; i >= 0; i--) {
      if (
        history[i].type === "login" ||
        history[i].type === "end_break"
      )
        return history[i].timestamp;
      if (history[i].type === "start_break") return null;
    }
    return loginTimeRef.current;
  }, []);

  const navigationStructure: NavigationItem[] = useMemo(() => {
    const showOverview = 
      hasRole("admin") || 
      hasRole("presales") || 
      hasRole("sales") || 
      (user?.role || "").toLowerCase().includes("presales") || 
      (user?.role || "").toLowerCase().includes("sales");

    const structure: NavigationItem[] = [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: Home,
        exact: true,
        colorClass: navTextClass,
        type: "single",
        required: showOverview ? undefined : "overview.access",
      },
    ];


    structure.push(
      {
        name: "CMS",
        icon: Globe,
        colorClass: navTextClass,
        type: "dropdown",
        key: "cms",
        required: ["blog.read"],
        submenu: [
          {
            name: "Home Manager",
            href: "/dashboard/home-manager",
            icon: Home,
            colorClass: navTextClass,
            required: "blog.read",
          },
          {
            name: "Blog Manager",
            href: "/dashboard/blog-manager",
            icon: Edit3,
            colorClass: navTextClass,
            required: "blog.read",
          },
        ],
      },
      {
        name: "CRM",
        icon: Users,
        colorClass: navTextClass,
        type: "dropdown",
        key: "crm",
        required: [
          "lead.read",
          "buyer.read",
          "seller.read",
          "property.read",
        ],
        submenu: [
          {
            name: "Leads",
            href: "/dashboard/leads",
            icon: Target,
            colorClass: navTextClass,
            required: "lead.read",
          },
          {
            name: "Buyers",
            href: "/dashboard/buyers",
            icon: UserCheck,
            colorClass: navTextClass,
            required: "buyer.read",
          },
          {
            name: "Sellers",
            href: "/dashboard/sellers",
            icon: Users,
            colorClass: navTextClass,
            required: "seller.read",
          },
          {
            name: "Owners",
            href: "/dashboard/owners",
            icon: KeyRound,
            colorClass: navTextClass,
            required: "owner.read",
          },
          {
            name: "Properties",
            href: "/dashboard/properties",
            icon: Building,
            colorClass: navTextClass,
            required: "property.read",
          },
          {
            name: "Tenants",
            href: "/dashboard/tenants",
            icon: Users,
            colorClass: navTextClass,
            required: "property.read",
          },
          // {
          //   name: "Contact Messages",
          //   href: "/dashboard/contact-messages",
          //   icon: MessageCircle,
          //   colorClass: navTextClass,
          //   required: "lead.read",
          // },
        ],
      },
      {
        name: "Administrator",
        icon: Shield,
        colorClass: navTextClass,
        type: "dropdown",
        key: "administrator",
        required: "system.manage",
        submenu: [
          {
            name: "Document Center",
            href: "/dashboard/document-center",
            icon: FileText,
            colorClass: navTextClass,
            required: "system.manage",
          },
          {
            name: "Template Center",
            href: "/dashboard/template-center",
            icon: LayoutTemplate,
            colorClass: navTextClass,
            required: "system.manage",
          },
          {
            name: "Accounts",
            href: "/dashboard/accounts",
            icon: Receipt,
            colorClass: navTextClass,
            required: "system.manage",
          },
        ],
      },
      {
        name: "Communication",
        icon: MessageSquare,
        colorClass: navTextClass,
        type: "dropdown",
        key: "communication",
        required: ["lead.read", "buyer.read", "seller.read"],
        submenu: [
          {
            name: "Overview & Tools",
            href: "/dashboard/communication/overview",
            icon: BarChart3,
            colorClass: navTextClass,
            required: ["lead.read", "buyer.read", "seller.read"],
          },
          {
            name: "Property Chat",
            href: "/dashboard/communication/chat",
            icon: MessageSquare,
            colorClass: navTextClass,
            required: ["lead.read", "buyer.read", "seller.read"],
          },
          {
            name: "REX AI Sessions",
            href: "/dashboard/communication/ai-sessions",
            icon: Bot,
            colorClass: navTextClass,
            required: ["lead.read", "buyer.read", "seller.read"],
          },
        ],
      },
      {
        name: "WhatsAppCRM",
        href: "/dashboard/whatsapp-crm",
        icon: FaWhatsapp,
        exact: true,
        colorClass: navTextClass,
        type: "single",
        required: ["lead.read"],
      },
      {
        name: "Tools",
        icon: Wrench,
        colorClass: navTextClass,
        type: "dropdown",
        key: "tools",
        required: hasRole("admin") ? undefined : ["property.read", "vendor.read"],
        submenu: [
          {
            name: "Vendors",
            href: "/dashboard/vendors",
            icon: Building,
            colorClass: navTextClass,
            required: hasRole("admin") ? undefined : "vendor.read",
          },
          {
            name: "AI Training",
            href: "/dashboard/ai-training",
            icon: FileText,
            colorClass: navTextClass,
            required: "system.manage",
          },
        ],
      },
      {
        name: "Reports",
        icon: TrendingUp,
        colorClass: navTextClass,
        type: "dropdown",
        key: "reports",
        required: "report.read",
        submenu: [
          {
            name: "Reports & BI",
            href: "/admin/reports",
            icon: BarChart3,
            colorClass: navTextClass,
            required: "report.read",
          },
          {
            name: "Activities",
            href: "/reports/activities",
            icon: Activity,
            colorClass: navTextClass,
            required: "report.read",
          },
          {
            name: "Logged-In",
            href: "/reports/logged-in",
            icon: ShieldCheck,
            colorClass: navTextClass,
            required: "report.read",
          },
          {
            name: "Analytics",
            href: "/dashboard/analytics",
            icon: BarChart3,
            colorClass: navTextClass,
            required: "report.read",
          },
        ],
      }
    );

    structure.push({
      name: "Settings",
      icon: Settings,
      colorClass: navTextClass,
      type: "dropdown",
      key: "settings",
      required: [
        "settings_master.manage",
        "data.import",
        "data.export",
        "system.manage",
      ],
      submenu: [
        {
          name: "General Settings",
          href: "/dashboard/settings",
          icon: Settings,
          colorClass: navTextClass,
          required: "system.manage",
        },
        {
          name: "Roles & Permissions",
          href: "/dashboard/settings/roles-permissions",
          icon: Shield,
          colorClass: navTextClass,
          required: "system.manage",
        },
        {
          name: "Integrations",
          href: "/dashboard/settings/integrations",
          icon: Zap,
          colorClass: navTextClass,
          required: "system.manage",
        },
        {
          name: "AI Settings",
          href: "/dashboard/settings/ai",
          icon: Zap,
          colorClass: navTextClass,
          required: "system.manage",
        },
        {
          name: "Master Data",
          href: "/dashboard/settings/master-data",
          icon: Database,
          colorClass: navTextClass,
          required: "settings_master.manage",
        },
        {
          name: "Variable Center",
          href: "/dashboard/settings/veriable-center",
          icon: Database,
          colorClass: navTextClass,
          required: "settings_master.manage",
        },
        {
          name: "Import/Export",
          href: "/dashboard/settings/import-export",
          icon: Download,
          colorClass: navTextClass,
          required: ["data.import", "data.export"],
        },
      ],
    });

    if (hasRole("admin")) {
      structure.push({
        name: "Users",
        href: "/dashboard/users",
        icon: Users,
        exact: true,
        colorClass: navTextClass,
        type: "single",
        required: "user.read",
      });
    }

    const withPermissions: NavigationItem[] = structure
      .map((item) => {
        if (!userCan(item.required)) return null;
        if (item.type === "dropdown") {
          const allowedSubmenu = item.submenu.filter((s) =>
            userCan(s.required)
          );
          if (allowedSubmenu.length === 0) return null;
          return { ...item, submenu: allowedSubmenu };
        }
        return item;
      })
      .filter((i): i is NavigationItem => i !== null);

    return withPermissions;
  }, [hasRole, navTextClass, userCan]);

  const moduleConfigs: Record<string, { title: string; subtitle: string }> = {
    "Dashboard": { title: "Dashboard Overview", subtitle: "Key metrics and performance indicators" },
    "Home Manager": { title: "Home Page Management", subtitle: "Manage hero sections and banners" },
    "Blog Manager": { title: "Blog Management", subtitle: "Create, edit and manage blog posts" },
    "CMS": { title: "Content Management", subtitle: "Manage your website content" },
    "Leads": { title: "Lead Management", subtitle: "Track and manage potential clients" },
    "Buyers": { title: "Buyer Management", subtitle: "Manage buyer profiles and requirements" },
    "Sellers": { title: "Seller Management", subtitle: "Manage seller profiles and properties" },
    "Properties": { title: "Property Management", subtitle: "Manage all property listings" },
    "Contact Messages": { title: "Contact Messages", subtitle: "View and respond to inquiries" },
    "CRM": { title: "Customer Relationship Management", subtitle: "Manage clients and properties" },
    "Document Center": { title: "Document Center", subtitle: "Manage and organize documents" },
    "Template Center": { title: "Template Center", subtitle: "Manage email and document templates" },
    "Accounts": { title: "Accounts Management", subtitle: "Track payments and invoices" },
    "Administrator": { title: "Administrator Panel", subtitle: "System administration tools" },
    "Communication": { title: "Communication Center", subtitle: "Manage messages and communications" },
    "Property Chat": { title: "Property Chat Desk", subtitle: "Real-time client inquiries and property communications" },
    "Overview & Tools": { title: "Communication Overview & Tools", subtitle: "Manage campaigns, templates, and analytics" },
    "Vendors": { title: "Vendor Management", subtitle: "Manage vendor partnerships" },
    "AI Training": { title: "AI Training Center", subtitle: "Configure and train AI models" },
    "Tools": { title: "Tools & Utilities", subtitle: "Additional tools and features" },
    "Activities": { title: "Activity Reports", subtitle: "Track user activities and logs" },
    "Analytics": { title: "Analytics Dashboard", subtitle: "View insights and analytics" },
    "Reports": { title: "Reports Center", subtitle: "Generate and view reports" },
    "General Settings": { title: "General Settings", subtitle: "Configure system preferences" },
    "Roles & Permissions": { title: "Roles & Permissions", subtitle: "Manage user roles and access" },
    "Integrations": { title: "Integrations", subtitle: "Connect third-party services" },
    "AI Settings": { title: "AI Configuration", subtitle: "Configure AI features" },
    "Master Data": { title: "Master Data Management", subtitle: "Manage master data entries" },
    "Variable Center": { title: "Variable Center", subtitle: "Manage system variables" },
    "Import/Export": { title: "Import/Export Data", subtitle: "Bulk data operations" },
    "Settings": { title: "System Settings", subtitle: "Configure application settings" },
    "Users": { title: "User Management", subtitle: "Manage system users" },
   };

  const getCurrentModuleInfo = useCallback((pathname: string) => {
    for (const item of navigationStructure) {
      if (item.type === "single") {
        const matches = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);

        if (matches) {
          const config = moduleConfigs[item.name];
          return {
            title: config?.title || item.name,
            subtitle: config?.subtitle || "Manage and configure settings",
          };
        }
      }
      if (item.type === "dropdown") {
        for (const sub of item.submenu) {
          const isPropertiesRoute = sub.href === "/dashboard/properties" && pathname.startsWith("/dashboard/rental-properties");
          if (pathname.startsWith(sub.href) || isPropertiesRoute) {
            const config = moduleConfigs[sub.name];
            return {
              title: config?.title || sub.name,
              subtitle: config?.subtitle || "Manage and configure settings",
              parent: item.name,
            };
          }
        }
      }
    }
    return null;
  }, [navigationStructure]);

  const filteredNavigation = useMemo(() => {
    if (!searchQuery.trim()) return navigationStructure;

    const filtered: NavigationItem[] = [];
    navigationStructure.forEach((item) => {
      if (item.type === "single") {
        if (
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
          filtered.push(item);
      } else {
        const matchingsubmenu = item.submenu.filter((c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          matchingsubmenu.length > 0
        ) {
          filtered.push({
            ...item,
            submenu:
              matchingsubmenu.length > 0
                ? matchingsubmenu
                : item.submenu,
          });
        }
      }
    });

    return filtered;
  }, [navigationStructure, searchQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!mobileTimersRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!mobileTimersRef.current.contains(e.target))
        setMobileTimersOpen(false);
    }
    document.addEventListener("click", handleClickOutside);
    return () =>
      document.removeEventListener("click", handleClickOutside);
  }, []);

  // Audio setup
  useEffect(() => {
    const unlockAudio = () => {
      initNotificationSound();
      window.removeEventListener("click", unlockAudio);
    };
    window.addEventListener("click", unlockAudio);
    return () => window.removeEventListener("click", unlockAudio);
  }, []);

  const handleBellClick = useCallback(async () => {
    setOpen((prev) => !prev);
    if (unreadCount > 0 && user?.id) {
      try {
        const userIdNum = Number(user.id);
        if (!Number.isNaN(userIdNum))
          await notificationAPI.markAllAsRead(userIdNum);

        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true }))
        );
        setUnreadCount(0);
      } catch (err) {
        console.error("Error marking notifications as read:", err);
      }
    }
  }, [unreadCount, user?.id]);

  // Session and work time tracking effects
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
      localStorage.setItem("todayLoginTime", now.toString());
      localStorage.setItem("loginDate", today);
      const activityHistory = JSON.parse(
        localStorage.getItem("activityHistory") || "[]"
      );
      activityHistory.push({
        label: "Login",
        type: "login",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        timestamp: now,
      });
      localStorage.setItem(
        "activityHistory",
        JSON.stringify(activityHistory)
      );
    }
  }, [user, loginTime]);

  useEffect(() => {
    if (!loginTime) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const totalElapsed = Math.floor(
        (now - (loginTimeRef.current ?? 0)) / 1000
      );
      const sessionHours = Math.floor(totalElapsed / 3600);
      const sessionMinutes = Math.floor(
        (totalElapsed % 3600) / 60
      );
      const sessionSeconds = totalElapsed % 60;
      const formattedSessionTime = `${sessionHours
        .toString()
        .padStart(2, "0")}:${sessionMinutes
          .toString()
          .padStart(2, "0")}:${sessionSeconds
            .toString()
            .padStart(2, "0")}`;
      setSessionTime(formattedSessionTime);

      let currentWorkTime = totalWorkTimeRef.current ?? 0;
      if (!isOnBreakRef.current) {
        const lastActivityHistory = JSON.parse(
          localStorage.getItem("activityHistory") || "[]"
        );
        const lastWorkStart = findLastWorkStart(lastActivityHistory);
        if (lastWorkStart)
          currentWorkTime += Math.floor(
            (now - lastWorkStart) / 1000
          );
      }

      const workHours = Math.floor(currentWorkTime / 3600);
      const workMinutes = Math.floor(
        (currentWorkTime % 3600) / 60
      );
      const workSecs = currentWorkTime % 60;
      const formattedWorkTime = `${workHours
        .toString()
        .padStart(2, "0")}:${workMinutes
          .toString()
          .padStart(2, "0")}:${workSecs
            .toString()
            .padStart(2, "0")}`;
      setWorkTime(formattedWorkTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [loginTime, findLastWorkStart]);

  const startBreak = useCallback(() => {
    if (isOnBreakRef.current) return;
    const now = Date.now();
    setIsOnBreak(true);
    setBreakStartTime(now);
    const activityHistory = JSON.parse(
      localStorage.getItem("activityHistory") || "[]"
    );
    const lastWorkStart = findLastWorkStart(activityHistory);
    if (lastWorkStart) {
      const workDuration = Math.floor(
        (now - lastWorkStart) / 1000
      );
      setTotalWorkTime((prev) => prev + workDuration);
    }
    activityHistory.push({
      label: "Start Break",
      type: "start_break",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      timestamp: now,
    });
    localStorage.setItem(
      "activityHistory",
      JSON.stringify(activityHistory)
    );
  }, [findLastWorkStart]);

  const endBreak = useCallback(() => {
    if (!isOnBreakRef.current) return;
    const now = Date.now();
    setIsOnBreak(false);
    setBreakStartTime(null);
    const activityHistory = JSON.parse(
      localStorage.getItem("activityHistory") || "[]"
    );
    activityHistory.push({
      label: "End Break",
      type: "end_break",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      timestamp: now,
    });
    localStorage.setItem(
      "activityHistory",
      JSON.stringify(activityHistory)
    );
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      const now = Date.now();
      const activityHistory = JSON.parse(
        localStorage.getItem("activityHistory") || "[]"
      );

      if (!isOnBreakRef.current && loginTimeRef.current) {
        const lastWorkStart = findLastWorkStart(activityHistory);
        if (lastWorkStart) {
          const workDuration = Math.floor(
            (now - lastWorkStart) / 1000
          );
          setTotalWorkTime((prev) => prev + workDuration);
        }
      }

      activityHistory.push({
        label: "Logout",
        type: "logout",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        timestamp: now,
      });
      localStorage.setItem(
        "activityHistory",
        JSON.stringify(activityHistory)
      );
      localStorage.removeItem("todayLoginTime");
      localStorage.removeItem("loginDate");

      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [logout, findLastWorkStart]);

  const isActive = useCallback(
    (href: string, exact = false) => {
      if (exact) return location.pathname === href;
      return location.pathname.startsWith(href);
    },
    [location.pathname]
  );

  const isParentActive = useCallback(
    (submenu: NavigationDropdown["submenu"]) =>
      submenu.some((child) =>
        location.pathname.startsWith(child.href)
      ),
    [location.pathname]
  );

  const handleSidebarLinkClick = useCallback(() => {
    if (sidebarOpen) setSidebarOpen(false);
  }, [sidebarOpen]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setSearchQuery(e.target.value),
    []
  );
  const handleSearchFocus = useCallback(
    () => setSearchFocused(true),
    []
  );
  const handleSearchBlur = useCallback(
    () => setSearchFocused(false),
    []
  );
  const clearSearch = useCallback(() => {
    setSearchQuery("");
    if (searchInputRef.current) searchInputRef.current.focus();
  }, []);

  const openActivityModal = useCallback(
    () => setActivityModalOpen(true),
    []
  );
  const closeActivityModal = useCallback(
    () => setActivityModalOpen(false),
    []
  );
  const closeSidebar = useCallback(
    () => setSidebarOpen(false),
    []
  );
  const openSidebar = useCallback(
    () => setSidebarOpen(true),
    []
  );
  const closeNotificationPanel = useCallback(
    () => setOpen(false),
    []
  );

  if (!user) return <Navigate to="/login" replace />;

  const companyLogo = systemSettings?.company_logo;
  const companyName = systemSettings?.company_name;

  const [desktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("desktop_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const toggleDesktopSidebar = useCallback(() => {
    setDesktopSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("desktop_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  }, []);

  // Sidebar Component Renderer
  const renderSidebar = useCallback((isCollapsed = false) => {
    return (
      <div className="flex flex-col h-full bg-[#0e3658]">
        {/* Sidebar Logo Header */}
        <div className="flex items-center justify-center h-14 px-3 border-b border-white/10 bg-white">
          {isCollapsed ? (
            <div className="w-8 h-8 rounded-lg bg-[#0e3658] text-white flex items-center justify-center font-black text-sm shadow-xs">
              RE
            </div>
          ) : companyLogo ? (
            <img
              src={companyLogo}
              alt={`${companyName}`}
              className="h-8 max-h-8 object-contain"
            />
          ) : (
            <div className="flex items-center">
              <h1 className="text-lg font-bold text-[#1a2a6c]">
                {companyName}
              </h1>
            </div>
          )}
        </div>

        {/* Search Navigation Bar (visible when expanded) */}
        {!isCollapsed && (
          <div className="px-3 py-3 border-b border-white/10">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search
                  className={cn(
                    "h-3.5 w-3.5 transition-colors duration-200",
                    searchFocused ? "text-orange-400" : "text-white/40"
                  )}
                />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className={cn(
                  "block w-full pl-8 pr-8 py-1.5 rounded-lg text-xs",
                  "bg-white/10 text-white placeholder-white/40",
                  "border border-white/20 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent",
                  "transition-all duration-200 hover:bg-white/15"
                )}
                aria-label="Search navigation"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center hover:text-white text-white/60 transition-colors"
                  type="button"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        )}

        <nav
          className={cn(
            "flex-1 py-3 space-y-2 overflow-y-auto custom-scrollbar",
            isCollapsed ? "px-2" : "px-2"
          )}
          role="navigation"
          aria-label="Main sidebar navigation"
        >
          {filteredNavigation.map((item) => (
            <div key={item.name}>
              {item.type === "single" ? (
                <Link
                  to={item.href}
                  onClick={handleSidebarLinkClick}
                  title={isCollapsed ? item.name : undefined}
                  className={cn(
                    "group flex items-center text-sm font-medium rounded-lg transition-all duration-200",
                    isCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2",
                    isActive(item.href, item.exact)
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 flex-shrink-0 transition-all duration-200",
                      isCollapsed ? "" : "mr-2.5",
                      isActive(item.href, item.exact)
                        ? "text-white"
                        : "text-white/60 group-hover:text-orange-400"
                    )}
                  />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-xs">
                        {item.name}
                      </span>

                      {item.name === 'WhatsAppCRM' && whatsappCount > 0 ? (
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight",
                          isActive(item.href, item.exact)
                            ? "bg-white text-orange-500"
                            : "bg-orange-500 text-white"
                        )}>
                          {whatsappCount > 99 ? '99+' : whatsappCount}
                        </span>
                      ) : (
                        isActive(item.href, item.exact) && (
                          <div className="w-1 h-1 bg-white rounded-full" />
                        )
                      )}
                    </>
                  )}
                </Link>
              ) : (
                <div>
                  <button
                    onClick={() => toggleMenu(item.key)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        toggleMenu(item.key);
                    }}
                    aria-expanded={expandedMenus.has(item.key)}
                    aria-controls={`menu-${item.key}`}
                    tabIndex={0}
                    title={isCollapsed ? item.name : undefined}
                    className={cn(
                      "group flex items-center w-full text-sm font-medium rounded-lg transition-all duration-200",
                      isCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2",
                      isParentActive(item.submenu)
                        ? "bg-orange-500 text-white shadow-sm"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    )}
                    type="button"
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 flex-shrink-0 transition-all duration-200",
                        isCollapsed ? "" : "mr-2.5",
                        isParentActive(item.submenu)
                          ? "text-white"
                          : "text-white/60 group-hover:text-orange-400"
                      )}
                    />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left text-xs">
                          {item.name}
                        </span>
                        {expandedMenus.has(item.key) ? (
                          <ChevronDown className="h-3 w-3 text-white/60" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-white/60" />
                        )}
                      </>
                    )}
                  </button>

                  {!isCollapsed && expandedMenus.has(item.key) && (
                    <div
                      id={`menu-${item.key}`}
                      className="ml-5 mt-0.5 space-y-0.5 border-l border-orange-500/30 pl-2"
                    >
                      {item.submenu.map((child) => (
                        <Link
                          key={child.name}
                          to={child.href}
                          onClick={handleSidebarLinkClick}
                          className={cn(
                            "group flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200",
                            isActive(child.href)
                              ? "bg-orange-500 text-white shadow-sm"
                              : "text-white/70 hover:text-white hover:bg-white/10"
                          )}
                        >
                          <child.icon
                            className={cn(
                              "mr-2 h-3.5 w-3.5 flex-shrink-0 transition-all duration-200",
                              isActive(child.href)
                                ? "text-white"
                                : "text-white/50 group-hover:text-orange-400"
                            )}
                          />
                          <span className="flex-1">
                            {child.name}
                          </span>
                          {isActive(child.href) && (
                            <div className="w-1 h-1 bg-orange-300 rounded-full" />
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {!isCollapsed && searchQuery && filteredNavigation.length === 0 && (
            <div className="text-center py-6">
              <Search className="h-6 w-6 text-white/20 mx-auto mb-2" />
              <p className="text-white/40 text-xs">
                No results found
              </p>
            </div>
          )}
        </nav>

        <div className="p-2.5 border-t border-white/10 bg-white">
          <button
            onClick={handleLogout}
            title={isCollapsed ? "Sign out" : undefined}
            className={cn(
              "group flex items-center w-full text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200",
              isCollapsed ? "justify-center p-2" : "px-3 py-2"
            )}
            type="button"
          >
            <LogOut className={cn("h-4 w-4 text-red-500 group-hover:text-red-600 transition-colors duration-150", isCollapsed ? "" : "mr-2.5")} />
            {!isCollapsed && (
              <span className="flex-1 text-left text-xs font-semibold">
                Sign out
              </span>
            )}
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
    isActive,
    isParentActive,
    handleSidebarLinkClick,
    handleLogout,
    expandedMenus,
    toggleMenu,
    whatsappCount,
  ]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Mobile sidebar overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
      >
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={closeSidebar}
          aria-hidden
        />
        <div className="relative flex flex-col w-64 h-full max-h-screen animate-slide-in-left">
          <div className="absolute top-3 right-3 z-20">
            <button
              type="button"
              className="flex items-center justify-center h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              onClick={closeSidebar}
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
          <div
            className="h-full overflow-y-auto rounded-r-xl"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {renderSidebar(false)}
          </div>
        </div>
      </div>

      {/* Desktop sidebar with toggle button (Screenshot 1 expand / unexpand) */}
      <aside className="hidden lg:flex lg:flex-shrink-0 relative group/sidebar">
        <div
          className={cn(
            "flex flex-col h-full rounded-r-xl shadow-2xl overflow-hidden transition-all duration-300 relative",
            desktopSidebarCollapsed ? "w-[72px]" : "w-56"
          )}
        >
          {renderSidebar(desktopSidebarCollapsed)}
        </div>

        {/* Floating Circular Toggle Button on the border edge */}
        <button
          type="button"
          onClick={toggleDesktopSidebar}
          className="absolute top-5 -right-3.5 z-40 w-7 h-7 bg-[#0e3658] hover:bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white cursor-pointer transition-all duration-200 hover:scale-110 focus:outline-none"
          title={desktopSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label={desktopSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {desktopSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4 text-white" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-white" />
          )}
        </button>
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-md border-b border-slate-200">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-orange-600 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                onClick={openSidebar}
                aria-label="Open sidebar"
              >
                <Menu className="h-6 w-6" />
              </button>

              {(() => {
                const moduleInfo = getCurrentModuleInfo(location.pathname);
                if (!moduleInfo) return null;
                return (
                  <>
                    <div className="flex md:hidden flex-col -ml-2 max-w-[180px]">
                      <div className="flex items-center gap-1">
                        <h2 className="text-[11px] font-semibold truncate" style={{ color: '#e67e22' }}>
                          {moduleInfo.title}
                        </h2>
                      </div>
                      <p className="text-[9px] line-clamp-2 leading-tight" style={{ color: '#5a7184' }}>
                        {moduleInfo.subtitle}
                      </p>
                    </div>
                    <div className="hidden md:flex flex-col">
                      <div className="flex items-center gap-2">
                        {moduleInfo.parent && (
                          <>
                            <span className="text-xs text-[#e67e22]">{moduleInfo.parent}</span>
                            <ChevronRight className="h-3 w-3 text-slate-300" />
                          </>
                        )}
                        <h2 className="text-sm font-bold text-slate-800">
                          {moduleInfo.title}
                        </h2>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {moduleInfo.subtitle}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <Link
                to="/home"
                title="Go back to website"
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#1a2a6c] to-[#2a3a7c] text-white font-medium text-xs hover:shadow-lg hover:shadow-[#1a2a6c]/20 transition-all"
              >
                <FaEarthAsia className="h-3.5 w-3.5" />
                <span className="hidden sm:inline"> Visit Website</span>
              </Link>

              {/* Desktop timer buttons */}
              <div className="hidden lg:flex items-center space-x-1.5">
                <button
                  onClick={openActivityModal}
                  title="Activity tracker"
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 transition-all shadow-sm"
                  type="button"
                >
                  <Clock className="h-3.5 w-3.5 text-orange-600" />
                  <span className="text-slate-700 text-xs font-semibold">
                    {sessionTime}
                  </span>
                </button>

                <button
                  title="Activity progress"
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 transition-all shadow-sm"
                  type="button"
                >
                  <Activity className="h-3.5 w-3.5 text-orange-600" />
                  <span className="text-slate-700 text-xs font-semibold">
                    100%
                  </span>
                </button>

                <button
                  title="Coffee breaks"
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 transition-all shadow-sm"
                  type="button"
                >
                  <Coffee className="h-3.5 w-3.5 text-orange-600" />
                  <span className="text-slate-700 text-xs font-semibold">
                    10
                  </span>
                </button>
              </div>

              {/* Mobile timers dropdown */}
              <div className="relative lg:hidden" ref={mobileTimersRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMobileTimersOpen((p) => !p);
                  }}
                  title="Open timers"
                  className="p-1.5 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={mobileTimersOpen}
                >
                  <Clock className="h-4 w-4 text-orange-600" />
                </button>

                {mobileTimersOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1.5 animate-fade-in"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-2">
                      <button
                        onClick={() => {
                          setMobileTimersOpen(false);
                          openActivityModal();
                        }}
                        className="w-full flex items-center space-x-2 px-2 py-2 rounded-md hover:bg-orange-50 transition-colors"
                        type="button"
                      >
                        <Clock className="h-3.5 w-3.5 text-orange-600" />
                        <span className="text-xs font-medium text-slate-700">
                          {sessionTime}
                        </span>
                      </button>
                      <button
                        onClick={() => setMobileTimersOpen(false)}
                        className="w-full flex items-center space-x-2 px-2 py-2 rounded-md hover:bg-orange-50 transition-colors"
                        type="button"
                      >
                        <Activity className="h-3.5 w-3.5 text-orange-600" />
                        <span className="text-xs font-medium text-slate-700">
                          100%
                        </span>
                      </button>
                      <button
                        onClick={() => setMobileTimersOpen(false)}
                        className="w-full flex items-center space-x-2 px-2 py-2 rounded-md hover:bg-orange-50 transition-colors"
                        type="button"
                      >
                        <Coffee className="h-3.5 w-3.5 text-orange-600" />
                        <span className="text-xs font-medium text-slate-700">
                          10
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Notification bell */}
              <div className="relative">
                <button
                  onClick={handleBellClick}
                  title="Notifications"
                  className="relative p-1.5 text-slate-500 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-lg hover:bg-orange-50 transition-all"
                  type="button"
                  aria-haspopup="true"
                  aria-expanded={open}
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-br from-orange-500 to-orange-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full shadow-lg font-semibold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 z-50 w-80 animate-fade-in">
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

        {/* Main content */}
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto focus:outline-none custom-main-scrollbar">
          <div className="flex-1 flex flex-col min-h-0 h-full w-full">
            <Outlet />
          </div>
        </main>
      </div>

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

      <style>{`
        @keyframes slide-in-left {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in-left { animation: slide-in-left 0.3s ease-out; }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.5); }
        .custom-main-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-main-scrollbar::-webkit-scrollbar-track { background: #fef3c7; border-radius: 10px; }
        .custom-main-scrollbar::-webkit-scrollbar-thumb { background: #fb923c; border-radius: 10px; }
        .custom-main-scrollbar::-webkit-scrollbar-thumb:hover { background: #f97316; }
      `}</style>
    </div>
  );
};

export default DashboardLayout;