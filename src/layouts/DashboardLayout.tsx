

// import React, {
//   useState,
//   useEffect,
//   useCallback,
//   useMemo,
//   useRef,
// } from "react";
// import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
// import {
//   Home,
//   Users,
//   Building,
//   Activity,
//   BarChart3,
//   Settings,
//   Menu,
//   X,
//   Bell,
//   Search,
//   User,
//   LogOut,
//   MessageSquare,
//   Shield,
//   Zap,
//   Database,
//   Download,
//   UserCheck,
//   Crown,
//   Briefcase,
//   ShoppingBag,
//   Heart,
//   Clock,
//   Coffee,
//   FileText,
//   Receipt,
//   LayoutTemplate,
//   MessageCircle,
//   ChevronDown,
//   ChevronRight,
//   Globe,
//   Wrench,
//   MoreHorizontal,
//   Edit3,
//   Target,
//   BookOpen,
//   FileImage,
//   Video,
//   Calendar,
//   Phone,
//   Mail,
//   DollarSign,
//   TrendingUp,
//   Calculator,
//   Archive,
//   Bookmark,
//   Info,
//   PanelBottom,
// } from "lucide-react";
// import { FaEarthAsia } from "react-icons/fa6";
// import { useAuth } from "@/contexts/AuthContext";
// import { useSystemSettings } from "@/contexts/SystemSettingsContext";
// import { cn } from "@/lib/utils";
// import ActivityTrackerModal from "./ActivityTrackerModal";
// import NotificationPanel from "./NotificationPanel";
// import { notificationAPI } from "@/lib/notificationAPI";
// import UserProfileMenu from "./UserProfileMenu";
// import { can } from "@/utils/permission"; // ✅ PERMISSION HELPER IMPORT

// // 1) put these helpers near the top of DashboardLayout (outside the component is fine)
// type UILevel = "low" | "medium" | "high";

// type RawNotification = {
//   id: number | string;
//   lead_id?: string | null;
//   user_id?: number | string;
//   message?: string | null;
//   type?: string | null;
//   link?: string | null;
//   is_read?: 0 | 1 | "0" | "1" | boolean | "true" | "false" | null;
//   priority?: UILevel | null;
//   created_at?: string | null;
//   updated_at?: string | null;
//   [k: string]: any;
// };

// type NotificationItem = {
//   id: number;
//   title: string;
//   message: string;
//   type: string;
//   priority: UILevel;
//   timestamp: string; // ALWAYS created_at
//   read: boolean; // normalized
//   link?: string | null;
//   color?: string;
// };

// const toNumberId = (val: number | string) => {
//   const n = typeof val === "number" ? val : Number(val);
//   return Number.isFinite(n) ? n : Math.floor(Math.random() * 1e9);
// };

// const normalizeRead = (v: RawNotification["is_read"]): boolean => {
//   if (typeof v === "boolean") return v;
//   if (typeof v === "number") return v === 1;
//   if (typeof v === "string") {
//     const s = v.trim().toLowerCase();
//     return s === "1" || s === "true";
//   }
//   return false;
// };

// const mapRawToUI = (n: RawNotification): NotificationItem => {
//   const id = toNumberId(n.id);
//   const type = (n.type ?? "general").toString();

//   const title =
//     type === "lead_assign"
//       ? "Lead Assigned"
//       : type === "property_inquiry"
//         ? "Property Inquiry"
//         : type === "visit_scheduled"
//           ? "Visit Scheduled"
//           : type === "price_suggestion"
//             ? "Price Suggestion"
//             : type === "document_ready"
//               ? "Document Ready"
//               : type;

//   return {
//     id,
//     title,
//     message: n.message ?? "",
//     type,
//     priority: (n.priority as UILevel) ?? "medium",
//     // ✅ always created_at for display/sorting; fallback to updated/epoch if missing
//     timestamp: n.created_at ?? n.updated_at ?? "1970-01-01 00:00:00",
//     read: normalizeRead(n.is_read),
//     link: n.link ?? null,
//     color: "green",
//   };
// };

// // DashboardLayout with unified menu color (#0b3855)
// type PermissionKey = string; // e.g. "lead.read", "report.read"

// type NavigationSingle = {
//   name: string;
//   href: string;
//   icon: any;
//   exact: boolean;
//   colorClass: string;
//   type: "single";
//   required?: PermissionKey | PermissionKey[]; // ✅ NEW
// };

// type NavigationDropdown = {
//   name: string;
//   icon: any;
//   colorClass: string;
//   type: "dropdown";
//   key: string;
//   required?: PermissionKey | PermissionKey[]; // ✅ NEW
//   submenu: Array<{
//     name: string;
//     href: string;
//     icon: any;
//     colorClass: string;
//     required?: PermissionKey | PermissionKey[]; // ✅ NEW
//   }>;
// };

// type NavigationItem = NavigationSingle | NavigationDropdown;

// const DashboardLayout = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [activityModalOpen, setActivityModalOpen] = useState(false);
//   const [sessionTime, setSessionTime] = useState("00:00:00");
//   const [workTime, setWorkTime] = useState("00:00:00");
//   const [isOnBreak, setIsOnBreak] = useState(false);
//   const [loginTime, setLoginTime] = useState<number | null>(null);
//   const [totalWorkTime, setTotalWorkTime] = useState(0);
//   const [breakStartTime, setBreakStartTime] = useState<number | null>(null);
//   const [open, setOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchFocused, setSearchFocused] = useState(false);
//   const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

//   const location = useLocation();
//   const { user, logout, hasRole } = useAuth();
//   const { systemSettings } = useSystemSettings();

//   // refs
//   const loginTimeRef = useRef(loginTime);
//   const totalWorkTimeRef = useRef(totalWorkTime);
//   const isOnBreakRef = useRef(isOnBreak);
//   const sidebarRef = useRef<HTMLDivElement | null>(null);
//   const searchInputRef = useRef<HTMLInputElement | null>(null);
//   const [mobileTimersOpen, setMobileTimersOpen] = useState(false);
//   const mobileTimersRef = useRef<HTMLDivElement | null>(null);

//   const NotificationPanelAny = NotificationPanel;
//   // 2) state types: make them UI notifications
//   const [notifications, setNotifications] = useState<NotificationItem[]>([]);
//   const [unreadCount, setUnreadCount] = useState(0);

//   // Unified nav color (from image)
//   const navColorHex = "#0b3855";
//   const navTextClass = `text-[${navColorHex}]`; // will be used where text color is needed
//   const navHoverClass = `group-hover:text-[${navColorHex}]`;
//   // NOTE: tailwind arbitrary classes in template strings are fine in JSX className

//   // ✅ PERMISSION CHECK HELPER
//   const userCan = useCallback(
//     (perm?: PermissionKey | PermissionKey[]) => {
//       if (!perm) return true; // agar required nahi diya to sab dekh sakte

//       if (Array.isArray(perm)) {
//         // agar multiple diye: kisi ek ka hona enough
//         return perm.some((p) => can(user, p));
//       }

//       return can(user, perm);
//     },
//     [user]
//   );

//   // Exclusive toggleMenu: opening one menu closes others. Closing a menu only closes it.
//   const toggleMenu = useCallback((menuKey: string) => {
//     setExpandedMenus((prev) => {
//       const next = new Set(prev);
//       if (next.has(menuKey)) {
//         // close it
//         next.delete(menuKey);
//         return next;
//       } else {
//         // open this exclusively
//         return new Set([menuKey]);
//       }
//     });
//   }, []);

//   // Auto-expand menus based on route — exclusive open (only the matched menu opens)
//   useEffect(() => {
//     const currentPath = location.pathname;
//     const menuMappings: Record<string, string[]> = {
//       cms: ["/dashboard/blog-manager"],
//       crm: [
//         "/dashboard/leads",
//         "/dashboard/buyers",
//         "/dashboard/sellers",
//         "/dashboard/properties",
//         "/dashboard/contact-messages",
//       ],
//       administrator: [
//         "/dashboard/document-center",
//         "/dashboard/template-center",
//         "/dashboard/accounts",
//       ],
//       tools: ["/dashboard/vendors", "/dashboard/ai-training"],
//       reports: ["/dashboard/activities", "/dashboard/analytics"],
//       settings: [
//         "/dashboard/settings",
//         "/dashboard/settings/roles-permissions",
//         "/dashboard/settings/integrations",
//         "/dashboard/settings/ai",
//         "/dashboard/settings/master-data",
//         "/dashboard/settings/veriable-center",
//         "/dashboard/settings/import-export",
//       ],
//     };

//     // Find first matching menuKey (if any) and set it exclusively open.
//     let matchedKey: string | null = null;
//     Object.entries(menuMappings).some(([menuKey, paths]) => {
//       if (paths.some((p) => currentPath.startsWith(p))) {
//         matchedKey = menuKey;
//         return true;
//       }
//       return false;
//     });

//     if (matchedKey) {
//       setExpandedMenus(new Set([matchedKey]));
//     } else {
//       // Optional: close all dropdowns when no mapping matches current route.
//       setExpandedMenus(new Set());
//     }
//   }, [location.pathname]);

//   // findLastWorkStart remains same logic
//   const findLastWorkStart = useCallback((history: any[]) => {
//     for (let i = history.length - 1; i >= 0; i--) {
//       if (
//         history[i].type === "login" ||
//         history[i].type === "end_break"
//       )
//         return history[i].timestamp;
//       if (history[i].type === "start_break") return null;
//     }
//     return loginTimeRef.current;
//   }, []);

//   // navigation structure with unified color for icons/text
//   const navigationStructure: NavigationItem[] = useMemo(() => {
//     const structure: NavigationItem[] = [
//       {
//         name: "Overview",
//         href: "/dashboard",
//         icon: Home,
//         exact: true,
//         colorClass: navTextClass,
//         type: "single",
//         // optional: home sabko dikhana hai to required hata sakte ho
//         required: ["lead.read", "property.read", "buyer.read"],
//       },
//     ];

//     if (hasRole("admin")) {
//       structure.push({
//         name: "Admin Dashboard",
//         href: "/dashboard/admin",
//         icon: Crown,
//         exact: true,
//         colorClass: navTextClass,
//         type: "single",
//         required: "system.manage",
//       });
//     }
//     if (hasRole(["admin", "manager"])) {
//       structure.push({
//         name: "Manager Dashboard",
//         href: "/dashboard/manager",
//         icon: UserCheck,
//         exact: true,
//         colorClass: navTextClass,
//         type: "single",
//         required: ["lead.read", "report.read"],
//       });
//     }
//     if (hasRole(["admin", "manager", "agent"])) {
//       structure.push({
//         name: "Agent Dashboard",
//         href: "/dashboard/agent",
//         icon: Briefcase,
//         exact: true,
//         colorClass: navTextClass,
//         type: "single",
//         required: ["lead.read", "buyer.read", "seller.read"],
//       });
//     }

//     structure.push(
//       {
//         name: "CMS",
//         icon: Globe,
//         colorClass: navTextClass,
//         type: "dropdown",
//         key: "cms",
//         required: ["blog.read"],
//         submenu: [
//           {
//             name: "Home Manager",
//             href: "/dashboard/home-manager",
//             icon: Home,
//             colorClass: navTextClass,
//             required: "blog.read", // ya cms.read jo bhi key define karo
//           },
//           {
//             name: "Blog Manager",
//             href: "/dashboard/blog-manager",
//             icon: Edit3,
//             colorClass: navTextClass,
//             required: "blog.read",
//           },
//         ],
//       },
//       {
//         name: "CRM",
//         icon: Users,
//         colorClass: navTextClass,
//         type: "dropdown",
//         key: "crm",
//         required: [
//           "lead.read",
//           "buyer.read",
//           "seller.read",
//           "property.read",
//         ],
//         submenu: [
//           {
//             name: "Leads",
//             href: "/dashboard/leads",
//             icon: Target,
//             colorClass: navTextClass,
//             required: "lead.read",
//           },
//           {
//             name: "Buyers",
//             href: "/dashboard/buyers",
//             icon: UserCheck,
//             colorClass: navTextClass,
//             required: "buyer.read",
//           },
//           {
//             name: "Sellers",
//             href: "/dashboard/sellers",
//             icon: Users,
//             colorClass: navTextClass,
//             required: "seller.read",
//           },
//           {
//             name: "Properties",
//             href: "/dashboard/properties",
//             icon: Building,
//             colorClass: navTextClass,
//             required: "property.read",
//           },
//           {
//             name: "Contact Messages",
//             href: "/dashboard/contact-messages",
//             icon: MessageCircle,
//             colorClass: navTextClass,
//             required: "lead.read", // ya contact.read
//           },
//         ],
//       },
//       {
//         name: "Administrator",
//         icon: Shield,
//         colorClass: navTextClass,
//         type: "dropdown",
//         key: "administrator",
//         required: "system.manage",
//         submenu: [
//           {
//             name: "Document Center",
//             href: "/dashboard/document-center",
//             icon: FileText,
//             colorClass: navTextClass,
//             required: "system.manage",
//           },
//           {
//             name: "Template Center",
//             href: "/dashboard/template-center",
//             icon: LayoutTemplate,
//             colorClass: navTextClass,
//             required: "system.manage",
//           },
//           {
//             name: "Accounts",
//             href: "/dashboard/accounts",
//             icon: Receipt,
//             colorClass: navTextClass,
//             required: "system.manage",
//           },
//         ],
//       },
//       {
//         name: "Communication",
//         href: "/dashboard/communication",
//         icon: MessageSquare,
//         exact: true,
//         colorClass: navTextClass,
//         type: "single",
//         required: ["lead.read", "buyer.read", "seller.read"], // example
//       },
//       {
//         name: "Tools",
//         icon: Wrench,
//         colorClass: navTextClass,
//         type: "dropdown",
//         key: "tools",
//         required: hasRole("admin") ? undefined : ["property.read", "vendor.read"], // ✅ Add this check
//         submenu: [
//           {
//             name: "Vendors",
//             href: "/dashboard/vendors",
//             icon: Building,
//             colorClass: navTextClass,
//             required: hasRole("admin") ? undefined : "vendor.read", // ✅ Add for submenu too
//           },
//           {
//             name: "AI Training",
//             href: "/dashboard/ai-training",
//             icon: FileText,
//             colorClass: navTextClass,
//             required: "system.manage",
//           },
//         ],
//       },
//       {
//         name: "Reports",
//         icon: TrendingUp,
//         colorClass: navTextClass,
//         type: "dropdown",
//         key: "reports",
//         required: "report.read",
//         submenu: [
//           {
//             name: "Activities",
//             href: "/dashboard/activities",
//             icon: Activity,
//             colorClass: navTextClass,
//             required: "report.read",
//           },
//           {
//             name: "Analytics",
//             href: "/dashboard/analytics",
//             icon: BarChart3,
//             colorClass: navTextClass,
//             required: "report.read",
//           },
//         ],
//       }
//     );

//     // Settings dropdown
//     structure.push({
//       name: "Settings",
//       icon: Settings,
//       colorClass: navTextClass,
//       type: "dropdown",
//       key: "settings",
//       required: ["system.manage", "data.export", "data.import"],
//       submenu: [
//         {
//           name: "General Settings",
//           href: "/dashboard/settings",
//           icon: Settings,
//           colorClass: navTextClass,
//           required: "system.manage",
//         },
//         {
//           name: "Roles & Permissions",
//           href: "/dashboard/settings/roles-permissions",
//           icon: Shield,
//           colorClass: navTextClass,
//           required: "system.manage",
//         },
//         {
//           name: "Integrations",
//           href: "/dashboard/settings/integrations",
//           icon: Zap,
//           colorClass: navTextClass,
//           required: "system.manage",
//         },
//         {
//           name: "AI Settings",
//           href: "/dashboard/settings/ai",
//           icon: Zap,
//           colorClass: navTextClass,
//           required: "system.manage",
//         },
//         {
//           name: "Master Data",
//           href: "/dashboard/settings/master-data",
//           icon: Database,
//           colorClass: navTextClass,
//           required: "system.manage",
//         },
//         {
//           name: "Variable Center",
//           href: "/dashboard/settings/veriable-center",
//           icon: Database,
//           colorClass: navTextClass,
//           required: "system.manage",
//         },
//         {
//           name: "Import/Export",
//           href: "/dashboard/settings/import-export",
//           icon: Download,
//           colorClass: navTextClass,
//           required: ["data.import", "data.export"],
//         },
//       ],
//     });

//     if (hasRole("admin")) {
//       structure.push({
//         name: "Users",
//         href: "/dashboard/users",
//         icon: Users,
//         exact: true,
//         colorClass: navTextClass,
//         type: "single",
//         required: "user.read",
//       });
//     }

//     // ✅ FINAL FILTERING BY PERMISSIONS
//     const withPermissions: NavigationItem[] = structure
//       .map((item) => {
//         if (!userCan(item.required)) return null;

//         if (item.type === "dropdown") {
//           const allowedSubmenu = item.submenu.filter((s) =>
//             userCan(s.required)
//           );
//           if (allowedSubmenu.length === 0) return null; // agar koi child nahi to parent bhi hide
//           return { ...item, submenu: allowedSubmenu };
//         }

//         return item;
//       })
//       .filter((i): i is NavigationItem => i !== null);

//     return withPermissions;
//   }, [hasRole, navTextClass, userCan]);

//   const filteredNavigation = useMemo(() => {
//     if (!searchQuery.trim()) return navigationStructure;

//     const filtered: NavigationItem[] = [];
//     navigationStructure.forEach((item) => {
//       if (item.type === "single") {
//         if (
//           item.name.toLowerCase().includes(searchQuery.toLowerCase())
//         )
//           filtered.push(item);
//       } else {
//         const matchingsubmenu = item.submenu.filter((c) =>
//           c.name.toLowerCase().includes(searchQuery.toLowerCase())
//         );
//         if (
//           item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           matchingsubmenu.length > 0
//         ) {
//           filtered.push({
//             ...item,
//             submenu:
//               matchingsubmenu.length > 0
//                 ? matchingsubmenu
//                 : item.submenu,
//           });
//         }
//       }
//     });

//     return filtered;
//   }, [navigationStructure, searchQuery]);

//   // mobile timers click outside
//   useEffect(() => {
//     function handleClickOutside(e: MouseEvent) {
//       if (!mobileTimersRef.current) return;
//       if (!(e.target instanceof Node)) return;
//       if (!mobileTimersRef.current.contains(e.target))
//         setMobileTimersOpen(false);
//     }
//     document.addEventListener("click", handleClickOutside);
//     return () =>
//       document.removeEventListener("click", handleClickOutside);
//   }, []);

//   // notifications polling
//   useEffect(() => {
//     let interval: any;

//     const fetchNotifications = async () => {
//       try {
//         if (!user?.id) return;
//         const userIdNum = Number(user.id);
//         if (Number.isNaN(userIdNum)) return;

//         const res = await notificationAPI.getUserNotifications(
//           userIdNum
//         );
//         const list: RawNotification[] = Array.isArray(res?.notifications)
//           ? res.notifications
//           : res?.notifications
//             ? [res.notifications]
//             : [];

//         const ui = list.map(mapRawToUI);

//         setNotifications((prev) =>
//           JSON.stringify(prev) !== JSON.stringify(ui) ? ui : prev
//         );
//         const newUnread = ui.filter((n) => !n.read).length;
//         setUnreadCount((prev) =>
//           prev !== newUnread ? newUnread : prev
//         );
//       } catch (err) {
//         console.error("❌ Error fetching notifications:", err);
//       }
//     };

//     if (user?.id) {
//       fetchNotifications();
//       interval = setInterval(fetchNotifications, 10000);
//     }
//     return () => interval && clearInterval(interval);
//   }, [user?.id]);

//   // 4) bell click: call API, then update local to read:true (UI shape)
//   const handleBellClick = useCallback(async () => {
//     setOpen((prev) => !prev);
//     if (unreadCount > 0 && user?.id) {
//       try {
//         const userIdNum = Number(user.id);
//         if (!Number.isNaN(userIdNum))
//           await notificationAPI.markAllAsRead(userIdNum);

//         setNotifications((prev) =>
//           prev.map((n) => ({ ...n, read: true }))
//         );
//         setUnreadCount(0);
//       } catch (err) {
//         console.error(
//           "❌ Error marking notifications as read:",
//           err
//         );
//       }
//     }
//   }, [unreadCount, user?.id]);

//   useEffect(() => {
//     loginTimeRef.current = loginTime;
//   }, [loginTime]);
//   useEffect(() => {
//     totalWorkTimeRef.current = totalWorkTime;
//   }, [totalWorkTime]);
//   useEffect(() => {
//     isOnBreakRef.current = isOnBreak;
//   }, [isOnBreak]);

//   useEffect(() => {
//     if (user && !loginTime) {
//       const now = Date.now();
//       setLoginTime(now);
//       const today = new Date().toDateString();
//       localStorage.setItem("todayLoginTime", now.toString());
//       localStorage.setItem("loginDate", today);
//       const activityHistory = JSON.parse(
//         localStorage.getItem("activityHistory") || "[]"
//       );
//       activityHistory.push({
//         label: "Login",
//         type: "login",
//         time: new Date().toLocaleTimeString([], {
//           hour: "2-digit",
//           minute: "2-digit",
//           hour12: true,
//         }),
//         timestamp: now,
//       });
//       localStorage.setItem(
//         "activityHistory",
//         JSON.stringify(activityHistory)
//       );
//     }
//   }, [user, loginTime]);

//   useEffect(() => {
//     if (!loginTime) return;
//     const interval = setInterval(() => {
//       const now = Date.now();
//       const totalElapsed = Math.floor(
//         (now - (loginTimeRef.current ?? 0)) / 1000
//       );
//       const sessionHours = Math.floor(totalElapsed / 3600);
//       const sessionMinutes = Math.floor(
//         (totalElapsed % 3600) / 60
//       );
//       const sessionSeconds = totalElapsed % 60;
//       const formattedSessionTime = `${sessionHours
//         .toString()
//         .padStart(2, "0")}:${sessionMinutes
//           .toString()
//           .padStart(2, "0")}:${sessionSeconds
//             .toString()
//             .padStart(2, "0")}`;
//       setSessionTime((prev) =>
//         prev !== formattedSessionTime
//           ? formattedSessionTime
//           : prev
//       );

//       let currentWorkTime = totalWorkTimeRef.current ?? 0;
//       if (!isOnBreakRef.current) {
//         const lastActivityHistory = JSON.parse(
//           localStorage.getItem("activityHistory") || "[]"
//         );
//         const lastWorkStart =
//           findLastWorkStart(lastActivityHistory);
//         if (lastWorkStart)
//           currentWorkTime += Math.floor(
//             (now - lastWorkStart) / 1000
//           );
//       }

//       const workHours = Math.floor(currentWorkTime / 3600);
//       const workMinutes = Math.floor(
//         (currentWorkTime % 3600) / 60
//       );
//       const workSecs = currentWorkTime % 60;
//       const formattedWorkTime = `${workHours
//         .toString()
//         .padStart(2, "0")}:${workMinutes
//           .toString()
//           .padStart(2, "0")}:${workSecs
//             .toString()
//             .padStart(2, "0")}`;
//       setWorkTime((prev) =>
//         prev !== formattedWorkTime ? formattedWorkTime : prev
//       );
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [loginTime, findLastWorkStart]);

//   const startBreak = useCallback(() => {
//     if (isOnBreakRef.current) return;
//     const now = Date.now();
//     setIsOnBreak(true);
//     setBreakStartTime(now);
//     const activityHistory = JSON.parse(
//       localStorage.getItem("activityHistory") || "[]"
//     );
//     const lastWorkStart = findLastWorkStart(activityHistory);
//     if (lastWorkStart) {
//       const workDuration = Math.floor(
//         (now - lastWorkStart) / 1000
//       );
//       setTotalWorkTime((prev) => prev + workDuration);
//     }
//     activityHistory.push({
//       label: "Start Break",
//       type: "start_break",
//       time: new Date().toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: true,
//       }),
//       timestamp: now,
//     });
//     localStorage.setItem(
//       "activityHistory",
//       JSON.stringify(activityHistory)
//     );
//   }, [findLastWorkStart]);

//   const endBreak = useCallback(() => {
//     if (!isOnBreakRef.current) return;
//     const now = Date.now();
//     setIsOnBreak(false);
//     setBreakStartTime(null);
//     const activityHistory = JSON.parse(
//       localStorage.getItem("activityHistory") || "[]"
//     );
//     activityHistory.push({
//       label: "End Break",
//       type: "end_break",
//       time: new Date().toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: true,
//       }),
//       timestamp: now,
//     });
//     localStorage.setItem(
//       "activityHistory",
//       JSON.stringify(activityHistory)
//     );
//   }, []);

//   const handleLogout = useCallback(async () => {
//     try {
//       const now = Date.now();
//       const activityHistory = JSON.parse(
//         localStorage.getItem("activityHistory") || "[]"
//       );

//       if (!isOnBreakRef.current && loginTimeRef.current) {
//         const lastWorkStart = findLastWorkStart(activityHistory);
//         if (lastWorkStart) {
//           const workDuration = Math.floor(
//             (now - lastWorkStart) / 1000
//           );
//           setTotalWorkTime((prev) => prev + workDuration);
//         }
//       }

//       activityHistory.push({
//         label: "Logout",
//         type: "logout",
//         time: new Date().toLocaleTimeString([], {
//           hour: "2-digit",
//           minute: "2-digit",
//           hour12: true,
//         }),
//         timestamp: now,
//       });
//       localStorage.setItem(
//         "activityHistory",
//         JSON.stringify(activityHistory)
//       );
//       localStorage.removeItem("todayLoginTime");
//       localStorage.removeItem("loginDate");

//       await logout();
//     } catch (error) {
//       console.error("Logout error:", error);
//     }
//   }, [logout, findLastWorkStart]);

//   const isActive = useCallback(
//     (href: string, exact = false) => {
//       if (exact) return location.pathname === href;
//       return location.pathname.startsWith(href);
//     },
//     [location.pathname]
//   );

//   const isParentActive = useCallback(
//     (submenu: NavigationDropdown["submenu"]) =>
//       submenu.some((child) =>
//         location.pathname.startsWith(child.href)
//       ),
//     [location.pathname]
//   );

//   const handleSidebarLinkClick = useCallback(() => {
//     if (sidebarOpen) setSidebarOpen(false);
//   }, [sidebarOpen]);

//   const handleSearchChange = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement>) =>
//       setSearchQuery(e.target.value),
//     []
//   );
//   const handleSearchFocus = useCallback(
//     () => setSearchFocused(true),
//     []
//   );
//   const handleSearchBlur = useCallback(
//     () => setSearchFocused(false),
//     []
//   );
//   const clearSearch = useCallback(() => {
//     setSearchQuery("");
//     if (searchInputRef.current) searchInputRef.current.focus();
//   }, []);

//   const openActivityModal = useCallback(
//     () => setActivityModalOpen(true),
//     []
//   );
//   const closeActivityModal = useCallback(
//     () => setActivityModalOpen(false),
//     []
//   );
//   const closeSidebar = useCallback(
//     () => setSidebarOpen(false),
//     []
//   );
//   const openSidebar = useCallback(
//     () => setSidebarOpen(true),
//     []
//   );
//   const closeNotificationPanel = useCallback(
//     () => setOpen(false),
//     []
//   );

//   if (!user) return <Navigate to="/login" replace />;

//   const companyLogo = systemSettings?.company_logo;
//   const companyName = systemSettings?.company_name;

//   // Sidebar component with unified nav color
//   const SidebarComponent = useMemo(() => {
//     return (
//       <div className="flex flex-col h-full" ref={sidebarRef}>
//         {/* Modern header with blue gradient */}
//         <div className="flex items-center h-16 px-6 border-b border-slate-200 ">
//           {companyLogo ? (
//             <img
//               src={companyLogo}
//               alt={`${companyName}`}
//               className="h-10 max-h-10 flex-1 object-contain"
//             />
//           ) : (
//             <div className="flex items-center space-x-3">
//               <div className="hidden sm:block">
//                 <h1 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-orange-500 bg-clip-text text-transparent">
//                   {companyName}
//                 </h1>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Modern search with blue accent */}
//         <div className="px-4 py-4 border-b border-slate-200 bg-slate-50">
//           <div className="relative">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Search
//                 className={cn(
//                   "h-4 w-4 transition-colors duration-200",
//                   searchFocused
//                     ? "text-blue-600"
//                     : "text-slate-400"
//                 )}
//               />
//             </div>
//             <input
//               ref={searchInputRef}
//               type="text"
//               placeholder="Search navigation..."
//               value={searchQuery}
//               onChange={handleSearchChange}
//               onFocus={handleSearchFocus}
//               onBlur={handleSearchBlur}
//               className={cn(
//                 "block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm bg-white",
//                 "placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600",
//                 "transition-all duration-200 hover:border-slate-400 shadow-sm",
//                 searchFocused && "shadow-md"
//               )}
//               aria-label="Search navigation"
//             />
//             {searchQuery && (
//               <button
//                 onClick={clearSearch}
//                 className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-slate-700 text-slate-400 transition-colors"
//                 type="button"
//                 aria-label="Clear search"
//               >
//                 <X className="h-4 w-4" />
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Navigation with unified color for icons and labels */}
//         <nav
//           className="flex-1 px-4 py-4 space-y-1 overflow-y-auto bg-white"
//           role="navigation"
//           aria-label="Main sidebar navigation"
//         >
//           {filteredNavigation.map((item) => (
//             <div key={item.name}>
//               {item.type === "single" ? (
//                 <Link
//                   to={item.href}
//                   onClick={handleSidebarLinkClick}
//                   className={cn(
//                     "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:translate-x-1",
//                     isActive(item.href, item.exact)
//                       ? "bg-gradient-to-r from-blue-700 to-blue-800 text-white shadow-lg shadow-blue-700/25"
//                       : "text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-800 hover:shadow-md"
//                   )}
//                 >
//                   <item.icon
//                     className={cn(
//                       "mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-150",
//                       isActive(item.href, item.exact)
//                         ? "text-white"
//                         : `${item.colorClass} ${navHoverClass}`
//                     )}
//                   />
//                   <span
//                     className={cn(
//                       "flex-1",
//                       !isActive(item.href, item.exact)
//                         ? `${item.colorClass}`
//                         : ""
//                     )}
//                   >
//                     {item.name}
//                   </span>
//                   {isActive(item.href, item.exact) && (
//                     <div className="w-2 h-2 bg-white rounded-full opacity-90" />
//                   )}
//                 </Link>
//               ) : (
//                 <div>
//                   <button
//                     onClick={() => toggleMenu(item.key)}
//                     onKeyDown={(e) => {
//                       if (
//                         e.key === "Enter" ||
//                         e.key === " "
//                       )
//                         toggleMenu(item.key);
//                     }}
//                     aria-expanded={expandedMenus.has(item.key)}
//                     aria-controls={`menu-${item.key}`}
//                     tabIndex={0}
//                     className={cn(
//                       "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:translate-x-1",
//                       isParentActive(item.submenu)
//                         ? "bg-gradient-to-r from-blue-700 to-blue-800 text-white shadow-lg"
//                         : "text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-800 hover:shadow-md"
//                     )}
//                     type="button"
//                   >
//                     <item.icon
//                       className={cn(
//                         "mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-150",
//                         isParentActive(item.submenu)
//                           ? "text-white"
//                           : `${item.colorClass} ${navHoverClass}`
//                       )}
//                     />
//                     <span
//                       className={cn(
//                         "flex-1 text-left",
//                         !isParentActive(item.submenu)
//                           ? `${item.colorClass}`
//                           : ""
//                       )}
//                     >
//                       {item.name}
//                     </span>
//                     {expandedMenus.has(item.key) ? (
//                       <ChevronDown
//                         className={cn(
//                           "h-4 w-4 transition-transform duration-200",
//                           isParentActive(item.submenu)
//                             ? "text-white"
//                             : "text-blue-500"
//                         )}
//                       />
//                     ) : (
//                       <ChevronRight
//                         className={cn(
//                           "h-4 w-4 transition-transform duration-200",
//                           isParentActive(item.submenu)
//                             ? "text-white"
//                             : "text-blue-500"
//                         )}
//                       />
//                     )}
//                   </button>

//                   {expandedMenus.has(item.key) && (
//                     <div
//                       id={`menu-${item.key}`}
//                       className="ml-6 mt-2 space-y-1 border-l-2 border-blue-200 pl-4"
//                     >
//                       {item.submenu.map((child) => (
//                         <Link
//                           key={child.name}
//                           to={child.href}
//                           onClick={handleSidebarLinkClick}
//                           className={cn(
//                             "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 hover:translate-x-1",
//                             isActive(child.href)
//                               ? "bg-gradient-to-r from-blue-700 to-blue-800 text-white shadow-md"
//                               : "text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-800 hover:shadow-sm"
//                           )}
//                         >
//                           <child.icon
//                             className={cn(
//                               "mr-3 h-4 w-4 flex-shrink-0 transition-colors duration-150",
//                               isActive(child.href)
//                                 ? "text-white"
//                                 : `${child.colorClass} ${navHoverClass}`
//                             )}
//                           />
//                           <span
//                             className={cn(
//                               "flex-1",
//                               !isActive(child.href)
//                                 ? `${child.colorClass}`
//                                 : ""
//                             )}
//                           >
//                             {child.name}
//                           </span>
//                           {isActive(child.href) && (
//                             <div className="w-1.5 h-1.5 bg-white rounded-full opacity-90" />
//                           )}
//                         </Link>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           ))}

//           {searchQuery && filteredNavigation.length === 0 && (
//             <div className="text-center py-8">
//               <Search className="h-8 w-8 text-slate-300 mx-auto mb-2" />
//               <p className="text-slate-500 text-sm">
//                 No results found for "{searchQuery}"
//               </p>
//             </div>
//           )}
//         </nav>

//         {/* Modern logout button */}
//         <div className="p-4 border-t border-slate-200 bg-slate-50">
//           <button
//             onClick={handleLogout}
//             className="group flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 hover:text-red-700 transition-all duration-150 hover:translate-x-1 hover:shadow-md"
//             type="button"
//           >
//             <LogOut className="mr-3 h-5 w-5 text-red-500 group-hover:text-red-600 transition-colors duration-150" />
//             <span className="flex-1 font-semibold">
//               Sign out
//             </span>
//           </button>
//         </div>
//       </div>
//     );
//   }, [
//     companyLogo,
//     companyName,
//     searchFocused,
//     searchQuery,
//     handleSearchChange,
//     handleSearchFocus,
//     handleSearchBlur,
//     clearSearch,
//     filteredNavigation,
//     isActive,
//     isParentActive,
//     handleSidebarLinkClick,
//     handleLogout,
//     expandedMenus,
//     toggleMenu,
//     navHoverClass,
//   ]);

//   return (
//     <div className="flex h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100/50">
//       {/* Mobile sidebar with modern overlay */}
//       <div
//         className={cn(
//           "fixed inset-0 z-50 lg:hidden",
//           sidebarOpen ? "block" : "hidden"
//         )}
//       >
//         <div
//           className="fixed inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm"
//           onClick={closeSidebar}
//           aria-hidden
//         />

//         <div className="relative flex flex-col w-full max-w-xs bg-white shadow-2xl h-full max-h-screen">
//           <div className="absolute top-0 right-0 -mr-12 pt-2 z-20">
//             <button
//               type="button"
//               className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white hover:bg-slate-800 transition-colors"
//               onClick={closeSidebar}
//               aria-label="Close sidebar"
//             >
//               <X className="h-6 w-6 text-white" />
//             </button>
//           </div>

//           <div
//             className="h-full overflow-y-auto"
//             style={{ WebkitOverflowScrolling: "touch" }}
//           >
//             {SidebarComponent}
//           </div>
//         </div>
//       </div>

//       {/* Desktop sidebar with modern styling */}
//       <aside className="hidden lg:flex lg:flex-shrink-0">
//         <div className="flex flex-col w-64 bg-white shadow-2xl border-r border-slate-200">
//           {SidebarComponent}
//         </div>
//       </aside>

//       <div className="flex flex-col flex-1 overflow-hidden">
//         {/* Modern header with gradient */}
//         <header className="bg-white shadow-lg border-b border-slate-200">
//           <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
//             <div className="flex items-center">
//               <button
//                 type="button"
//                 className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-xl text-slate-500 hover:text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600 transition-colors"
//                 onClick={openSidebar}
//                 aria-label="Open sidebar"
//               >
//                 <Menu className="h-6 w-6" />
//               </button>

//               <Link
//                 to="/home"
//                 title="Go back to website"
//                 className="ml-3 flex items-center justify-center text-white font-semibold  bg-[#0c3854] px-2 py-1 rounded-xl text-sm  hover:bg-[#0b3858]/95 transition-colors shadow-md hover:shadow-lg"
//               >
//                 <FaEarthAsia className="h-4 w-4 sm:mr-2" />
//                 <span className="hidden sm:inline text-sm">
//                   Website
//                 </span>
//               </Link>
//             </div>

//             <div className="flex items-center space-x-4">
//               {/* Desktop timer buttons with unified icon color */}
//               <div className="hidden lg:flex items-center space-x-3">
//                 <button
//                   onClick={openActivityModal}
//                   title="Click to open activity tracker"
//                   className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all group shadow-sm hover:shadow-md"
//                   type="button"
//                 >
//                   <Clock
//                     className={`h-4 w-4 ${navTextClass} group-hover:opacity-90`}
//                   />
//                   <span className="text-blue-700 text-sm font-semibold group-hover:text-blue-800">
//                     {sessionTime}
//                   </span>
//                 </button>

//                 <button
//                   title="Activity progress"
//                   className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all group shadow-sm hover:shadow-md"
//                   type="button"
//                 >
//                   <Activity
//                     className={`h-4 w-4 ${navTextClass} group-hover:opacity-90`}
//                   />
//                   <span className="text-blue-700 text-sm font-semibold group-hover:text-blue-800">
//                     100%
//                   </span>
//                 </button>

//                 <button
//                   title="Coffee breaks taken"
//                   className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all group shadow-sm hover:shadow-md"
//                   type="button"
//                 >
//                   <Coffee
//                     className={`h-4 w-4 ${navTextClass} group-hover:opacity-90`}
//                   />
//                   <span className="text-blue-700 text-sm font-semibold group-hover:text-blue-800">
//                     10
//                   </span>
//                 </button>
//               </div>

//               {/* Mobile timers dropdown with unified icon color */}
//               <div
//                 className="relative lg:hidden"
//                 ref={mobileTimersRef}
//               >
//                 <button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setMobileTimersOpen((p) => !p);
//                   }}
//                   title="Open timers"
//                   className="p-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
//                   type="button"
//                   aria-haspopup="true"
//                   aria-expanded={mobileTimersOpen}
//                 >
//                   <Clock
//                     className={`h-5 w-5 ${navTextClass}`}
//                   />
//                 </button>

//                 {mobileTimersOpen && (
//                   <div
//                     className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2"
//                     onClick={(e) => e.stopPropagation()}
//                   >
//                     <div className="px-3">
//                       <button
//                         onClick={() => {
//                           setMobileTimersOpen(false);
//                           openActivityModal();
//                         }}
//                         title="Open activity tracker"
//                         className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg hover:bg-blue-50 transition-colors"
//                         type="button"
//                       >
//                         <Clock
//                           className={`h-4 w-4 ${navTextClass}`}
//                         />
//                         <span className="text-sm font-medium text-blue-700">
//                           {sessionTime}
//                         </span>
//                       </button>

//                       <button
//                         onClick={() =>
//                           setMobileTimersOpen(false)
//                         }
//                         title="Activity progress"
//                         className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg hover:bg-blue-50 transition-colors"
//                         type="button"
//                       >
//                         <Activity
//                           className={`h-4 w-4 ${navTextClass}`}
//                         />
//                         <span className="text-sm font-medium text-blue-700">
//                           100%
//                         </span>
//                       </button>

//                       <button
//                         onClick={() =>
//                           setMobileTimersOpen(false)
//                         }
//                         title="Coffee breaks"
//                         className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg hover:bg-blue-50 transition-colors"
//                         type="button"
//                       >
//                         <Coffee
//                           className={`h-4 w-4 ${navTextClass}`}
//                         />
//                         <span className="text-sm font-medium text-blue-700">
//                           10
//                         </span>
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Modern notification bell with blue accent */}
//               <div className="relative">
//                 <button
//                   onClick={handleBellClick}
//                   title="Notifications"
//                   className="relative p-2.5 text-slate-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-xl hover:bg-blue-50 transition-all shadow-sm"
//                   type="button"
//                   aria-haspopup="true"
//                   aria-expanded={open}
//                 >
//                   <Bell className="h-5 w-5" />
//                   {unreadCount > 0 && (
//                     <span className="absolute -top-1 -right-1 bg-gradient-to-br from-orange-500 to-orange-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-lg animate-pulse font-semibold">
//                       {unreadCount}
//                     </span>
//                   )}
//                 </button>

//                 {open && (
//                   <div className="absolute right-0 mt-2 z-50 w-80 md:right-0 lg:right-0 sm:right-2">
//                     <NotificationPanelAny
//                       notifications={notifications}
//                       onClose={closeNotificationPanel}
//                     />
//                   </div>
//                 )}
//               </div>

//               <UserProfileMenu />
//             </div>
//           </div>
//         </header>

//         {/* Main content with blue gradient background */}
//         <main className="flex-1 overflow-y-auto focus:outline-none bg-gradient-to-br from-blue-50/30 via-slate-50 to-blue-100/20">
//           <div className="px-4">
//             <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
//               <Outlet />
//             </div>
//           </div>
//         </main>
//       </div>

//       <ActivityTrackerModal
//         isOpen={activityModalOpen}
//         onClose={closeActivityModal}
//         sessionTime={sessionTime}
//         workTime={workTime}
//         isOnBreak={isOnBreak}
//         onStartBreak={startBreak}
//         onEndBreak={endBreak}
//         loginTime={loginTime}
//       />
//     </div>
//   );
// };

// export default DashboardLayout;




// import React, {
//   useState,
//   useEffect,
//   useCallback,
//   useMemo,
//   useRef,
// } from "react";
// import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
// import {
//   Home,
//   Users,
//   Building,
//   Activity,
//   BarChart3,
//   Settings,
//   Menu,
//   X,
//   Bell,
//   Search,
//   User,
//   LogOut,
//   MessageSquare,
//   Shield,
//   Zap,
//   Database,
//   Download,
//   UserCheck,
//   Crown,
//   Briefcase,
//   ShoppingBag,
//   Heart,
//   Clock,
//   Coffee,
//   FileText,
//   Receipt,
//   LayoutTemplate,
//   MessageCircle,
//   ChevronDown,
//   ChevronRight,
//   Globe,
//   Wrench,
//   MoreHorizontal,
//   Edit3,
//   Target,
//   BookOpen,
//   FileImage,
//   Video,
//   Calendar,
//   Phone,
//   Mail,
//   DollarSign,
//   TrendingUp,
//   Calculator,
//   Archive,
//   Bookmark,
//   Info,
//   PanelBottom,
// } from "lucide-react";
// import { FaEarthAsia } from "react-icons/fa6";
// import { useAuth } from "@/contexts/AuthContext";
// import { useSystemSettings } from "@/contexts/SystemSettingsContext";
// import { cn } from "@/lib/utils";
// import ActivityTrackerModal from "./ActivityTrackerModal";
// import NotificationPanel from "./NotificationPanel";
// import { notificationAPI } from "@/lib/notificationAPI";
// import UserProfileMenu from "./UserProfileMenu";
// import { can } from "@/utils/permission";

// // ─── Types ────────────────────────────────────────────────────────────────────
// type UILevel = "low" | "medium" | "high";

// type RawNotification = {
//   id: number | string;
//   lead_id?: string | null;
//   user_id?: number | string;
//   message?: string | null;
//   type?: string | null;
//   link?: string | null;
//   is_read?: 0 | 1 | "0" | "1" | boolean | "true" | "false" | null;
//   priority?: UILevel | null;
//   created_at?: string | null;
//   updated_at?: string | null;
//   [k: string]: any;
// };

// type NotificationItem = {
//   id: number;
//   title: string;
//   message: string;
//   type: string;
//   priority: UILevel;
//   timestamp: string;
//   read: boolean;
//   link?: string | null;
//   color?: string;
// };

// const toNumberId = (val: number | string) => {
//   const n = typeof val === "number" ? val : Number(val);
//   return Number.isFinite(n) ? n : Math.floor(Math.random() * 1e9);
// };

// const normalizeRead = (v: RawNotification["is_read"]): boolean => {
//   if (typeof v === "boolean") return v;
//   if (typeof v === "number") return v === 1;
//   if (typeof v === "string") {
//     const s = v.trim().toLowerCase();
//     return s === "1" || s === "true";
//   }
//   return false;
// };

// const mapRawToUI = (n: RawNotification): NotificationItem => {
//   const id = toNumberId(n.id);
//   const type = (n.type ?? "general").toString();
//   const title =
//     type === "lead_assign" ? "Lead Assigned"
//     : type === "property_inquiry" ? "Property Inquiry"
//     : type === "visit_scheduled" ? "Visit Scheduled"
//     : type === "price_suggestion" ? "Price Suggestion"
//     : type === "document_ready" ? "Document Ready"
//     : type;
//   return {
//     id,
//     title,
//     message: n.message ?? "",
//     type,
//     priority: (n.priority as UILevel) ?? "medium",
//     timestamp: n.created_at ?? n.updated_at ?? "1970-01-01 00:00:00",
//     read: normalizeRead(n.is_read),
//     link: n.link ?? null,
//     color: "green",
//   };
// };

// type PermissionKey = string;

// type NavigationSingle = {
//   name: string;
//   href: string;
//   icon: any;
//   exact: boolean;
//   colorClass: string;
//   type: "single";
//   required?: PermissionKey | PermissionKey[];
// };

// type NavigationDropdown = {
//   name: string;
//   icon: any;
//   colorClass: string;
//   type: "dropdown";
//   key: string;
//   required?: PermissionKey | PermissionKey[];
//   submenu: Array<{
//     name: string;
//     href: string;
//     icon: any;
//     colorClass: string;
//     required?: PermissionKey | PermissionKey[];
//   }>;
// };

// type NavigationItem = NavigationSingle | NavigationDropdown;

// // ─── Theme constants (Navy + Orange from logo) ────────────────────────────────
// // Primary: #0c3854  |  Secondary: #e87722  |  Accent-light: #f4a24c
// const NAVY = "#0c3854";
// const ORANGE = "#e87722";

// const DashboardLayout = () => {
//   // ─── State (unchanged) ──────────────────────────────────────────────────────
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [activityModalOpen, setActivityModalOpen] = useState(false);
//   const [sessionTime, setSessionTime] = useState("00:00:00");
//   const [workTime, setWorkTime] = useState("00:00:00");
//   const [isOnBreak, setIsOnBreak] = useState(false);
//   const [loginTime, setLoginTime] = useState<number | null>(null);
//   const [totalWorkTime, setTotalWorkTime] = useState(0);
//   const [breakStartTime, setBreakStartTime] = useState<number | null>(null);
//   const [open, setOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchFocused, setSearchFocused] = useState(false);
//   const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

//   const location = useLocation();
//   const { user, logout, hasRole } = useAuth();
//   const { systemSettings } = useSystemSettings();

//   const loginTimeRef = useRef(loginTime);
//   const totalWorkTimeRef = useRef(totalWorkTime);
//   const isOnBreakRef = useRef(isOnBreak);
//   const sidebarRef = useRef<HTMLDivElement | null>(null);
//   const searchInputRef = useRef<HTMLInputElement | null>(null);
//   const [mobileTimersOpen, setMobileTimersOpen] = useState(false);
//   const mobileTimersRef = useRef<HTMLDivElement | null>(null);

//   const NotificationPanelAny = NotificationPanel;
//   const [notifications, setNotifications] = useState<NotificationItem[]>([]);
//   const [unreadCount, setUnreadCount] = useState(0);

//   // ─── Color class strings ─────────────────────────────────────────────────────
//   const navTextClass = "text-[#0c3854]";
//   const navHoverClass = "group-hover:text-[#0c3854]";

//   // ─── Permission helper (unchanged) ──────────────────────────────────────────
//   const userCan = useCallback(
//     (perm?: PermissionKey | PermissionKey[]) => {
//       if (!perm) return true;
//       if (Array.isArray(perm)) return perm.some((p) => can(user, p));
//       return can(user, perm);
//     },
//     [user]
//   );

//   // ─── Exclusive toggleMenu (unchanged) ───────────────────────────────────────
//   const toggleMenu = useCallback((menuKey: string) => {
//     setExpandedMenus((prev) => {
//       const next = new Set(prev);
//       if (next.has(menuKey)) { next.delete(menuKey); return next; }
//       return new Set([menuKey]);
//     });
//   }, []);

//   // ─── Auto-expand based on route (unchanged) ──────────────────────────────────
//   useEffect(() => {
//     const currentPath = location.pathname;
//     const menuMappings: Record<string, string[]> = {
//       cms: ["/dashboard/blog-manager"],
//       crm: ["/dashboard/leads", "/dashboard/buyers", "/dashboard/sellers", "/dashboard/properties", "/dashboard/contact-messages"],
//       administrator: ["/dashboard/document-center", "/dashboard/template-center", "/dashboard/accounts"],
//       tools: ["/dashboard/vendors", "/dashboard/ai-training"],
//       reports: ["/dashboard/activities", "/dashboard/analytics"],
//       settings: ["/dashboard/settings", "/dashboard/settings/roles-permissions", "/dashboard/settings/integrations", "/dashboard/settings/ai", "/dashboard/settings/master-data", "/dashboard/settings/veriable-center", "/dashboard/settings/import-export"],
//     };
//     let matchedKey: string | null = null;
//     Object.entries(menuMappings).some(([menuKey, paths]) => {
//       if (paths.some((p) => currentPath.startsWith(p))) { matchedKey = menuKey; return true; }
//       return false;
//     });
//     if (matchedKey) setExpandedMenus(new Set([matchedKey]));
//     else setExpandedMenus(new Set());
//   }, [location.pathname]);

//   const findLastWorkStart = useCallback((history: any[]) => {
//     for (let i = history.length - 1; i >= 0; i--) {
//       if (history[i].type === "login" || history[i].type === "end_break") return history[i].timestamp;
//       if (history[i].type === "start_break") return null;
//     }
//     return loginTimeRef.current;
//   }, []);

//   // ─── Navigation structure (unchanged logic) ──────────────────────────────────
//   const navigationStructure: NavigationItem[] = useMemo(() => {
//     const structure: NavigationItem[] = [
//       { name: "Overview", href: "/dashboard", icon: Home, exact: true, colorClass: navTextClass, type: "single", required: ["lead.read", "property.read", "buyer.read"] },
//     ];
//     if (hasRole("admin")) structure.push({ name: "Admin Dashboard", href: "/dashboard/admin", icon: Crown, exact: true, colorClass: navTextClass, type: "single", required: "system.manage" });
//     if (hasRole(["admin", "manager"])) structure.push({ name: "Manager Dashboard", href: "/dashboard/manager", icon: UserCheck, exact: true, colorClass: navTextClass, type: "single", required: ["lead.read", "report.read"] });
//     if (hasRole(["admin", "manager", "agent"])) structure.push({ name: "Agent Dashboard", href: "/dashboard/agent", icon: Briefcase, exact: true, colorClass: navTextClass, type: "single", required: ["lead.read", "buyer.read", "seller.read"] });
//     structure.push(
//       { name: "CMS", icon: Globe, colorClass: navTextClass, type: "dropdown", key: "cms", required: ["blog.read"], submenu: [{ name: "Home Manager", href: "/dashboard/home-manager", icon: Home, colorClass: navTextClass, required: "blog.read" }, { name: "Blog Manager", href: "/dashboard/blog-manager", icon: Edit3, colorClass: navTextClass, required: "blog.read" }] },
//       { name: "CRM", icon: Users, colorClass: navTextClass, type: "dropdown", key: "crm", required: ["lead.read", "buyer.read", "seller.read", "property.read"], submenu: [{ name: "Leads", href: "/dashboard/leads", icon: Target, colorClass: navTextClass, required: "lead.read" }, { name: "Buyers", href: "/dashboard/buyers", icon: UserCheck, colorClass: navTextClass, required: "buyer.read" }, { name: "Sellers", href: "/dashboard/sellers", icon: Users, colorClass: navTextClass, required: "seller.read" }, { name: "Properties", href: "/dashboard/properties", icon: Building, colorClass: navTextClass, required: "property.read" }, { name: "Contact Messages", href: "/dashboard/contact-messages", icon: MessageCircle, colorClass: navTextClass, required: "lead.read" }] },
//       { name: "Administrator", icon: Shield, colorClass: navTextClass, type: "dropdown", key: "administrator", required: "system.manage", submenu: [{ name: "Document Center", href: "/dashboard/document-center", icon: FileText, colorClass: navTextClass, required: "system.manage" }, { name: "Template Center", href: "/dashboard/template-center", icon: LayoutTemplate, colorClass: navTextClass, required: "system.manage" }, { name: "Accounts", href: "/dashboard/accounts", icon: Receipt, colorClass: navTextClass, required: "system.manage" }] },
//       { name: "Communication", href: "/dashboard/communication", icon: MessageSquare, exact: true, colorClass: navTextClass, type: "single", required: ["lead.read", "buyer.read", "seller.read"] },
//       { name: "Tools", icon: Wrench, colorClass: navTextClass, type: "dropdown", key: "tools", required: hasRole("admin") ? undefined : ["property.read", "vendor.read"], submenu: [{ name: "Vendors", href: "/dashboard/vendors", icon: Building, colorClass: navTextClass, required: hasRole("admin") ? undefined : "vendor.read" }, { name: "AI Training", href: "/dashboard/ai-training", icon: FileText, colorClass: navTextClass, required: "system.manage" }] },
//       { name: "Reports", icon: TrendingUp, colorClass: navTextClass, type: "dropdown", key: "reports", required: "report.read", submenu: [{ name: "Activities", href: "/dashboard/activities", icon: Activity, colorClass: navTextClass, required: "report.read" }, { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, colorClass: navTextClass, required: "report.read" }] }
//     );
//     structure.push({ name: "Settings", icon: Settings, colorClass: navTextClass, type: "dropdown", key: "settings", required: ["system.manage", "data.export", "data.import"], submenu: [{ name: "General Settings", href: "/dashboard/settings", icon: Settings, colorClass: navTextClass, required: "system.manage" }, { name: "Roles & Permissions", href: "/dashboard/settings/roles-permissions", icon: Shield, colorClass: navTextClass, required: "system.manage" }, { name: "Integrations", href: "/dashboard/settings/integrations", icon: Zap, colorClass: navTextClass, required: "system.manage" }, { name: "AI Settings", href: "/dashboard/settings/ai", icon: Zap, colorClass: navTextClass, required: "system.manage" }, { name: "Master Data", href: "/dashboard/settings/master-data", icon: Database, colorClass: navTextClass, required: "system.manage" }, { name: "Variable Center", href: "/dashboard/settings/veriable-center", icon: Database, colorClass: navTextClass, required: "system.manage" }, { name: "Import/Export", href: "/dashboard/settings/import-export", icon: Download, colorClass: navTextClass, required: ["data.import", "data.export"] }] });
//     if (hasRole("admin")) structure.push({ name: "Users", href: "/dashboard/users", icon: Users, exact: true, colorClass: navTextClass, type: "single", required: "user.read" });

//     const withPermissions: NavigationItem[] = structure.map((item) => {
//       if (!userCan(item.required)) return null;
//       if (item.type === "dropdown") {
//         const allowedSubmenu = item.submenu.filter((s) => userCan(s.required));
//         if (allowedSubmenu.length === 0) return null;
//         return { ...item, submenu: allowedSubmenu };
//       }
//       return item;
//     }).filter((i): i is NavigationItem => i !== null);

//     return withPermissions;
//   }, [hasRole, navTextClass, userCan]);

//   const filteredNavigation = useMemo(() => {
//     if (!searchQuery.trim()) return navigationStructure;
//     const filtered: NavigationItem[] = [];
//     navigationStructure.forEach((item) => {
//       if (item.type === "single") {
//         if (item.name.toLowerCase().includes(searchQuery.toLowerCase())) filtered.push(item);
//       } else {
//         const matchingsubmenu = item.submenu.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
//         if (item.name.toLowerCase().includes(searchQuery.toLowerCase()) || matchingsubmenu.length > 0) {
//           filtered.push({ ...item, submenu: matchingsubmenu.length > 0 ? matchingsubmenu : item.submenu });
//         }
//       }
//     });
//     return filtered;
//   }, [navigationStructure, searchQuery]);

//   // ─── Side effects (unchanged) ────────────────────────────────────────────────
//   useEffect(() => {
//     function handleClickOutside(e: MouseEvent) {
//       if (!mobileTimersRef.current) return;
//       if (!(e.target instanceof Node)) return;
//       if (!mobileTimersRef.current.contains(e.target)) setMobileTimersOpen(false);
//     }
//     document.addEventListener("click", handleClickOutside);
//     return () => document.removeEventListener("click", handleClickOutside);
//   }, []);

//   useEffect(() => {
//     let interval: any;
//     const fetchNotifications = async () => {
//       try {
//         if (!user?.id) return;
//         const userIdNum = Number(user.id);
//         if (Number.isNaN(userIdNum)) return;
//         const res = await notificationAPI.getUserNotifications(userIdNum);
//         const list: RawNotification[] = Array.isArray(res?.notifications) ? res.notifications : res?.notifications ? [res.notifications] : [];
//         const ui = list.map(mapRawToUI);
//         setNotifications((prev) => JSON.stringify(prev) !== JSON.stringify(ui) ? ui : prev);
//         const newUnread = ui.filter((n) => !n.read).length;
//         setUnreadCount((prev) => prev !== newUnread ? newUnread : prev);
//       } catch (err) { console.error("❌ Error fetching notifications:", err); }
//     };
//     if (user?.id) { fetchNotifications(); interval = setInterval(fetchNotifications, 10000); }
//     return () => interval && clearInterval(interval);
//   }, [user?.id]);

//   const handleBellClick = useCallback(async () => {
//     setOpen((prev) => !prev);
//     if (unreadCount > 0 && user?.id) {
//       try {
//         const userIdNum = Number(user.id);
//         if (!Number.isNaN(userIdNum)) await notificationAPI.markAllAsRead(userIdNum);
//         setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
//         setUnreadCount(0);
//       } catch (err) { console.error("❌ Error marking notifications as read:", err); }
//     }
//   }, [unreadCount, user?.id]);

//   useEffect(() => { loginTimeRef.current = loginTime; }, [loginTime]);
//   useEffect(() => { totalWorkTimeRef.current = totalWorkTime; }, [totalWorkTime]);
//   useEffect(() => { isOnBreakRef.current = isOnBreak; }, [isOnBreak]);

//   useEffect(() => {
//     if (user && !loginTime) {
//       const now = Date.now();
//       setLoginTime(now);
//       localStorage.setItem("todayLoginTime", now.toString());
//       localStorage.setItem("loginDate", new Date().toDateString());
//       const activityHistory = JSON.parse(localStorage.getItem("activityHistory") || "[]");
//       activityHistory.push({ label: "Login", type: "login", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }), timestamp: now });
//       localStorage.setItem("activityHistory", JSON.stringify(activityHistory));
//     }
//   }, [user, loginTime]);

//   useEffect(() => {
//     if (!loginTime) return;
//     const interval = setInterval(() => {
//       const now = Date.now();
//       const totalElapsed = Math.floor((now - (loginTimeRef.current ?? 0)) / 1000);
//       const sh = Math.floor(totalElapsed / 3600), sm = Math.floor((totalElapsed % 3600) / 60), ss = totalElapsed % 60;
//       const fst = `${sh.toString().padStart(2, "0")}:${sm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
//       setSessionTime((prev) => prev !== fst ? fst : prev);
//       let cwt = totalWorkTimeRef.current ?? 0;
//       if (!isOnBreakRef.current) {
//         const lah = JSON.parse(localStorage.getItem("activityHistory") || "[]");
//         const lws = findLastWorkStart(lah);
//         if (lws) cwt += Math.floor((now - lws) / 1000);
//       }
//       const wh = Math.floor(cwt / 3600), wm = Math.floor((cwt % 3600) / 60), ws = cwt % 60;
//       const fwt = `${wh.toString().padStart(2, "0")}:${wm.toString().padStart(2, "0")}:${ws.toString().padStart(2, "0")}`;
//       setWorkTime((prev) => prev !== fwt ? fwt : prev);
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [loginTime, findLastWorkStart]);

//   const startBreak = useCallback(() => {
//     if (isOnBreakRef.current) return;
//     const now = Date.now();
//     setIsOnBreak(true); setBreakStartTime(now);
//     const ah = JSON.parse(localStorage.getItem("activityHistory") || "[]");
//     const lws = findLastWorkStart(ah);
//     if (lws) setTotalWorkTime((prev) => prev + Math.floor((now - lws) / 1000));
//     ah.push({ label: "Start Break", type: "start_break", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }), timestamp: now });
//     localStorage.setItem("activityHistory", JSON.stringify(ah));
//   }, [findLastWorkStart]);

//   const endBreak = useCallback(() => {
//     if (!isOnBreakRef.current) return;
//     const now = Date.now();
//     setIsOnBreak(false); setBreakStartTime(null);
//     const ah = JSON.parse(localStorage.getItem("activityHistory") || "[]");
//     ah.push({ label: "End Break", type: "end_break", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }), timestamp: now });
//     localStorage.setItem("activityHistory", JSON.stringify(ah));
//   }, []);

//   const handleLogout = useCallback(async () => {
//     try {
//       const now = Date.now();
//       const ah = JSON.parse(localStorage.getItem("activityHistory") || "[]");
//       if (!isOnBreakRef.current && loginTimeRef.current) {
//         const lws = findLastWorkStart(ah);
//         if (lws) setTotalWorkTime((prev) => prev + Math.floor((now - lws) / 1000));
//       }
//       ah.push({ label: "Logout", type: "logout", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }), timestamp: now });
//       localStorage.setItem("activityHistory", JSON.stringify(ah));
//       localStorage.removeItem("todayLoginTime");
//       localStorage.removeItem("loginDate");
//       await logout();
//     } catch (error) { console.error("Logout error:", error); }
//   }, [logout, findLastWorkStart]);

//   const isActive = useCallback((href: string, exact = false) => {
//     if (exact) return location.pathname === href;
//     return location.pathname.startsWith(href);
//   }, [location.pathname]);

//   const isParentActive = useCallback((submenu: NavigationDropdown["submenu"]) =>
//     submenu.some((child) => location.pathname.startsWith(child.href)),
//   [location.pathname]);

//   const handleSidebarLinkClick = useCallback(() => { if (sidebarOpen) setSidebarOpen(false); }, [sidebarOpen]);
//   const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value), []);
//   const handleSearchFocus = useCallback(() => setSearchFocused(true), []);
//   const handleSearchBlur = useCallback(() => setSearchFocused(false), []);
//   const clearSearch = useCallback(() => { setSearchQuery(""); if (searchInputRef.current) searchInputRef.current.focus(); }, []);
//   const openActivityModal = useCallback(() => setActivityModalOpen(true), []);
//   const closeActivityModal = useCallback(() => setActivityModalOpen(false), []);
//   const closeSidebar = useCallback(() => setSidebarOpen(false), []);
//   const openSidebar = useCallback(() => setSidebarOpen(true), []);
//   const closeNotificationPanel = useCallback(() => setOpen(false), []);

//   if (!user) return <Navigate to="/login" replace />;

//   const companyLogo = systemSettings?.company_logo;
//   const companyName = systemSettings?.company_name;

//   // ─── Sidebar (UI redesigned, logic untouched) ────────────────────────────────
//   const SidebarComponent = useMemo(() => (
//     <div className="flex flex-col h-full" ref={sidebarRef}>

//       {/* ── Logo / Brand header ──────────────────────────────────────────────── */}
//       <div
//         className="flex items-center h-16 px-5 shrink-0"
//         style={{ background: "#fff", borderBottom: `2px solid ${ORANGE}` }}
//       >
//         {companyLogo ? (
//           <img
//             src={companyLogo}
//             alt={companyName ?? "Logo"}
//             className="h-9 max-h-9 object-contain"
//           />
//         ) : (
//           <div className="flex items-center gap-2">
//             {/* Mini house icon accent */}
//             <span
//               className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
//               style={{ background: ORANGE }}
//             >
//               <Home className="h-4 w-4 text-white" />
//             </span>
//             <span className="font-bold text-white text-base tracking-tight leading-tight">
//               {companyName ?? "Resale Expert"}
//             </span>
//           </div>
//         )}
//       </div>

//       {/* ── Search ───────────────────────────────────────────────────────────── */}
//       <div
//         className="px-4 py-3 shrink-0"
//         style={{ background: "#f0f4f8", borderBottom: "1px solid #dce5ee" }}
//       >
//         <div className="relative">
//           <Search
//             className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
//             style={{ color: searchFocused ? ORANGE : "#7a95a8" }}
//           />
//           <input
//             ref={searchInputRef}
//             type="text"
//             placeholder="Search menu…"
//             value={searchQuery}
//             onChange={handleSearchChange}
//             onFocus={handleSearchFocus}
//             onBlur={handleSearchBlur}
//             className="w-full pl-9 pr-8 py-2 text-sm rounded-lg bg-white border outline-none transition-all"
//             style={{
//               borderColor: searchFocused ? ORANGE : "#cdd8e3",
//               boxShadow: searchFocused ? `0 0 0 2px ${ORANGE}22` : "none",
//               color: NAVY,
//             }}
//             aria-label="Search navigation"
//           />
//           {searchQuery && (
//             <button
//               onClick={clearSearch}
//               className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
//               type="button"
//               aria-label="Clear search"
//             >
//               <X className="h-3.5 w-3.5" style={{ color: "#7a95a8" }} />
//             </button>
//           )}
//         </div>
//       </div>

//       {/* ── Nav items ────────────────────────────────────────────────────────── */}
//       <nav
//         className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5"
//         style={{ background: "#f7fafc" }}
//         role="navigation"
//         aria-label="Main sidebar navigation"
//       >
//         {filteredNavigation.map((item) => (
//           <div key={item.name}>
//             {item.type === "single" ? (
//               /* ── Single link ── */
//               <Link
//                 to={item.href}
//                 onClick={handleSidebarLinkClick}
//                 className={cn(
//                   "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
//                   isActive(item.href, item.exact)
//                     ? "text-white shadow-sm"
//                     : "hover:bg-[#e8eef4]"
//                 )}
//                 style={
//                   isActive(item.href, item.exact)
//                     ? { background: NAVY, color: "#fff" }
//                     : { color: NAVY }
//                 }
//               >
//                 <item.icon
//                   className="h-4 w-4 shrink-0 transition-colors"
//                   style={{ color: isActive(item.href, item.exact) ? ORANGE : NAVY }}
//                 />
//                 <span className="flex-1 truncate">{item.name}</span>
//                 {isActive(item.href, item.exact) && (
//                   <span
//                     className="w-1.5 h-1.5 rounded-full shrink-0"
//                     style={{ background: ORANGE }}
//                   />
//                 )}
//               </Link>
//             ) : (
//               /* ── Dropdown ── */
//               <div>
//                 <button
//                   onClick={() => toggleMenu(item.key)}
//                   onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggleMenu(item.key); }}
//                   aria-expanded={expandedMenus.has(item.key)}
//                   aria-controls={`menu-${item.key}`}
//                   tabIndex={0}
//                   type="button"
//                   className={cn(
//                     "group flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
//                     isParentActive(item.submenu)
//                       ? "text-white shadow-sm"
//                       : "hover:bg-[#e8eef4]"
//                   )}
//                   style={
//                     isParentActive(item.submenu)
//                       ? { background: NAVY, color: "#fff" }
//                       : { color: NAVY }
//                   }
//                 >
//                   <item.icon
//                     className="h-4 w-4 shrink-0"
//                     style={{ color: isParentActive(item.submenu) ? ORANGE : NAVY }}
//                   />
//                   <span className="flex-1 text-left truncate">{item.name}</span>
//                   {expandedMenus.has(item.key)
//                     ? <ChevronDown className="h-3.5 w-3.5 shrink-0 transition-transform duration-200" style={{ color: isParentActive(item.submenu) ? "#fff" : "#7a95a8" }} />
//                     : <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-200" style={{ color: isParentActive(item.submenu) ? "#fff" : "#7a95a8" }} />
//                   }
//                 </button>

//                 {expandedMenus.has(item.key) && (
//                   <div
//                     id={`menu-${item.key}`}
//                     className="ml-4 mt-0.5 mb-1 space-y-0.5 pl-3"
//                     style={{ borderLeft: `2px solid ${ORANGE}55` }}
//                   >
//                     {item.submenu.map((child) => (
//                       <Link
//                         key={child.name}
//                         to={child.href}
//                         onClick={handleSidebarLinkClick}
//                         className={cn(
//                           "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150",
//                           isActive(child.href)
//                             ? "font-semibold"
//                             : "font-medium hover:bg-[#e8eef4]"
//                         )}
//                         style={
//                           isActive(child.href)
//                             ? { background: `${ORANGE}18`, color: NAVY }
//                             : { color: "#3d6178" }
//                         }
//                       >
//                         <child.icon
//                           className="h-3.5 w-3.5 shrink-0"
//                           style={{ color: isActive(child.href) ? ORANGE : "#7a95a8" }}
//                         />
//                         <span className="truncate">{child.name}</span>
//                         {isActive(child.href) && (
//                           <span
//                             className="ml-auto w-1 h-4 rounded-full shrink-0"
//                             style={{ background: ORANGE }}
//                           />
//                         )}
//                       </Link>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         ))}

//         {/* Empty search state */}
//         {searchQuery && filteredNavigation.length === 0 && (
//           <div className="flex flex-col items-center py-10 gap-2">
//             <Search className="h-7 w-7" style={{ color: "#c0cdd6" }} />
//             <p className="text-sm" style={{ color: "#7a95a8" }}>
//               No results for &ldquo;{searchQuery}&rdquo;
//             </p>
//           </div>
//         )}
//       </nav>

//       {/* ── Sign out ─────────────────────────────────────────────────────────── */}
//       <div
//         className="px-3 py-3 shrink-0"
//         style={{ borderTop: "1px solid #dce5ee", background: "#f0f4f8" }}
//       >
//         <button
//           onClick={handleLogout}
//           type="button"
//           className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 hover:bg-red-50"
//           style={{ color: "#b91c1c" }}
//         >
//           <LogOut className="h-4 w-4 shrink-0 text-red-400 group-hover:text-red-600 transition-colors" />
//           <span>Sign out</span>
//         </button>
//       </div>
//     </div>
//   ), [
//     companyLogo, companyName, searchFocused, searchQuery,
//     handleSearchChange, handleSearchFocus, handleSearchBlur, clearSearch,
//     filteredNavigation, isActive, isParentActive, handleSidebarLinkClick,
//     handleLogout, expandedMenus, toggleMenu,
//   ]);

//   // ─── Render ──────────────────────────────────────────────────────────────────
//   return (
//     <div className="flex h-screen overflow-hidden" style={{ background: "#f0f4f8" }}>

//       {/* ── Mobile sidebar overlay ──────────────────────────────────────────── */}
//       <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
//         {/* Backdrop */}
//         <div
//           className="fixed inset-0 bg-black/50 backdrop-blur-sm"
//           onClick={closeSidebar}
//           aria-hidden
//         />
//         {/* Drawer */}
//         <div
//           className="relative flex flex-col w-[280px] sm:w-72 h-full max-h-screen shadow-2xl overflow-hidden"
//           style={{ background: "#f7fafc" }}
//         >
//           {/* Close button */}
//           <div className="absolute top-3 right-3 z-20">
//             <button
//               type="button"
//               onClick={closeSidebar}
//               aria-label="Close sidebar"
//               className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
//               style={{ background: "rgba(255,255,255,0.15)" }}
//             >
//               <X className="h-4 w-4 text-white" />
//             </button>
//           </div>
//           <div className="h-full overflow-y-auto" style={{ WebkitOverflowScrolling: "touch" }}>
//             {SidebarComponent}
//           </div>
//         </div>
//       </div>

//       {/* ── Desktop sidebar ─────────────────────────────────────────────────── */}
//       <aside
//         className="hidden lg:flex lg:flex-shrink-0 shadow-xl"
//         style={{ width: 256 }}
//       >
//         <div className="flex flex-col w-full" style={{ background: "#f7fafc", borderRight: "1px solid #dce5ee" }}>
//           {SidebarComponent}
//         </div>
//       </aside>

//       {/* ── Main area ───────────────────────────────────────────────────────── */}
//       <div className="flex flex-col flex-1 overflow-hidden min-w-0">

//         {/* ── Topbar ──────────────────────────────────────────────────────── */}
//         <header
//           className="shrink-0 flex items-center justify-between h-14 sm:h-16 px-3 sm:px-5 gap-3 shadow-sm"
//           style={{ background: "#fff", borderBottom: `2px solid ${ORANGE}40` }}
//         >
//           {/* Left: hamburger + website link */}
//           <div className="flex items-center gap-2 min-w-0">
//             <button
//               type="button"
//               onClick={openSidebar}
//               aria-label="Open sidebar"
//               className="lg:hidden flex items-center justify-center h-9 w-9 rounded-lg transition-colors hover:bg-[#e8eef4]"
//               style={{ color: NAVY }}
//             >
//               <Menu className="h-5 w-5" />
//             </button>

//             <Link
//               to="/home"
//               title="Go back to website"
//               className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 shadow-sm"
//               style={{ background: NAVY }}
//             >
//               <FaEarthAsia className="h-3.5 w-3.5 shrink-0" />
//               <span className="hidden xs:inline sm:inline">Website</span>
//             </Link>
//           </div>

//           {/* Right: timers, bell, profile */}
//           <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">

//             {/* Desktop timers */}
//             <div className="hidden lg:flex items-center gap-2">
//               {/* Session time */}
//               <button
//                 onClick={openActivityModal}
//                 title="Open activity tracker"
//                 type="button"
//                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
//                 style={{ background: `${NAVY}12`, color: NAVY }}
//               >
//                 <Clock className="h-3.5 w-3.5 shrink-0" style={{ color: ORANGE }} />
//                 <span>{sessionTime}</span>
//               </button>

//               {/* Activity % */}
//               <button
//                 title="Activity progress"
//                 type="button"
//                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
//                 style={{ background: `${NAVY}12`, color: NAVY }}
//               >
//                 <Activity className="h-3.5 w-3.5 shrink-0" style={{ color: ORANGE }} />
//                 <span>100%</span>
//               </button>

//               {/* Breaks */}
//               <button
//                 title="Coffee breaks"
//                 type="button"
//                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
//                 style={{ background: `${NAVY}12`, color: NAVY }}
//               >
//                 <Coffee className="h-3.5 w-3.5 shrink-0" style={{ color: ORANGE }} />
//                 <span>10</span>
//               </button>
//             </div>

//             {/* Mobile timers dropdown */}
//             <div className="relative lg:hidden" ref={mobileTimersRef}>
//               <button
//                 onClick={(e) => { e.stopPropagation(); setMobileTimersOpen((p) => !p); }}
//                 title="Timers"
//                 type="button"
//                 aria-haspopup="true"
//                 aria-expanded={mobileTimersOpen}
//                 className="flex items-center justify-center h-9 w-9 rounded-lg transition-colors"
//                 style={{ background: `${NAVY}12`, color: NAVY }}
//               >
//                 <Clock className="h-4 w-4" style={{ color: ORANGE }} />
//               </button>

//               {mobileTimersOpen && (
//                 <div
//                   className="absolute right-0 mt-2 w-52 rounded-xl shadow-xl z-50 py-2 border"
//                   style={{ background: "#fff", borderColor: "#dce5ee" }}
//                   onClick={(e) => e.stopPropagation()}
//                 >
//                   <button onClick={() => { setMobileTimersOpen(false); openActivityModal(); }} type="button"
//                     className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium hover:bg-[#f0f4f8] transition-colors" style={{ color: NAVY }}>
//                     <Clock className="h-4 w-4 shrink-0" style={{ color: ORANGE }} />
//                     <span>{sessionTime}</span>
//                   </button>
//                   <button onClick={() => setMobileTimersOpen(false)} type="button"
//                     className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium hover:bg-[#f0f4f8] transition-colors" style={{ color: NAVY }}>
//                     <Activity className="h-4 w-4 shrink-0" style={{ color: ORANGE }} />
//                     <span>100%</span>
//                   </button>
//                   <button onClick={() => setMobileTimersOpen(false)} type="button"
//                     className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium hover:bg-[#f0f4f8] transition-colors" style={{ color: NAVY }}>
//                     <Coffee className="h-4 w-4 shrink-0" style={{ color: ORANGE }} />
//                     <span>10 breaks</span>
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* Notification bell */}
//             <div className="relative">
//               <button
//                 onClick={handleBellClick}
//                 title="Notifications"
//                 type="button"
//                 aria-haspopup="true"
//                 aria-expanded={open}
//                 className="relative flex items-center justify-center h-9 w-9 rounded-lg transition-colors hover:bg-[#e8eef4]"
//                 style={{ color: NAVY }}
//               >
//                 <Bell className="h-4.5 w-4.5 h-[18px] w-[18px]" />
//                 {unreadCount > 0 && (
//                   <span
//                     className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1"
//                     style={{ background: ORANGE }}
//                   >
//                     {unreadCount}
//                   </span>
//                 )}
//               </button>

//               {open && (
//                 <div className="absolute right-0 mt-2 z-50 w-80 max-w-[calc(100vw-1rem)]">
//                   <NotificationPanelAny notifications={notifications} onClose={closeNotificationPanel} />
//                 </div>
//               )}
//             </div>

//             <UserProfileMenu />
//           </div>
//         </header>

//         {/* ── Page content ────────────────────────────────────────────────── */}
//         <main
//           className="flex-1 overflow-y-auto focus:outline-none"
//           style={{ background: "#f0f4f8" }}
//         >
//           <div className="px-3 sm:px-5 lg:px-6 py-4 sm:py-5">
//             <div className="max-w-7xl mx-auto">
//               <Outlet />
//             </div>
//           </div>
//         </main>
//       </div>

//       {/* ── Activity tracker modal (unchanged) ──────────────────────────────── */}
//       <ActivityTrackerModal
//         isOpen={activityModalOpen}
//         onClose={closeActivityModal}
//         sessionTime={sessionTime}
//         workTime={workTime}
//         isOnBreak={isOnBreak}
//         onStartBreak={startBreak}
//         onEndBreak={endBreak}
//         loginTime={loginTime}
//       />
//     </div>
//   );
// };

// export default DashboardLayout;




import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
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
  PanelBottom,
} from "lucide-react";
import { FaEarthAsia } from "react-icons/fa6";
import { useAuth } from "@/contexts/AuthContext";
import { useSystemSettings } from "@/contexts/SystemSettingsContext";
import { cn } from "@/lib/utils";
import ActivityTrackerModal from "./ActivityTrackerModal";
import NotificationPanel from "./NotificationPanel";
import { notificationAPI } from "@/lib/notificationAPI";
import UserProfileMenu from "./UserProfileMenu";
import { can } from "@/utils/permission";

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
  const { user, logout, hasRole } = useAuth();
  const { systemSettings } = useSystemSettings();

  const loginTimeRef = useRef(loginTime);
  const totalWorkTimeRef = useRef(totalWorkTime);
  const isOnBreakRef = useRef(isOnBreak);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [mobileTimersOpen, setMobileTimersOpen] = useState(false);
  const mobileTimersRef = useRef<HTMLDivElement | null>(null);

  const NotificationPanelAny = NotificationPanel;
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const navTextClass = `text-[${COLORS.primary.main}]`;
  const navHoverClass = `group-hover:text-[${COLORS.secondary.main}]`;

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

  useEffect(() => {
    const currentPath = location.pathname;
    const menuMappings: Record<string, string[]> = {
      cms: ["/dashboard/blog-manager"],
      crm: [
        "/dashboard/leads",
        "/dashboard/buyers",
        "/dashboard/sellers",
        "/dashboard/properties",
        "/dashboard/contact-messages",
      ],
      administrator: [
        "/dashboard/document-center",
        "/dashboard/template-center",
        "/dashboard/accounts",
      ],
      tools: ["/dashboard/vendors", "/dashboard/ai-training"],
      reports: ["/dashboard/activities", "/dashboard/analytics"],
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
    const structure: NavigationItem[] = [
      {
        name: "Overview",
        href: "/dashboard",
        icon: Home,
        exact: true,
        colorClass: navTextClass,
        type: "single",
        required: ["lead.read", "property.read", "buyer.read"],
      },
    ];

    if (hasRole("admin")) {
      structure.push({
        name: "Admin Dashboard",
        href: "/dashboard/admin",
        icon: Crown,
        exact: true,
        colorClass: navTextClass,
        type: "single",
        required: "system.manage",
      });
    }
    if (hasRole(["admin", "manager"])) {
      structure.push({
        name: "Manager Dashboard",
        href: "/dashboard/manager",
        icon: UserCheck,
        exact: true,
        colorClass: navTextClass,
        type: "single",
        required: ["lead.read", "report.read"],
      });
    }
    if (hasRole(["admin", "manager", "agent"])) {
      structure.push({
        name: "Agent Dashboard",
        href: "/dashboard/agent",
        icon: Briefcase,
        exact: true,
        colorClass: navTextClass,
        type: "single",
        required: ["lead.read", "buyer.read", "seller.read"],
      });
    }

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
            name: "Properties",
            href: "/dashboard/properties",
            icon: Building,
            colorClass: navTextClass,
            required: "property.read",
          },
          {
            name: "Contact Messages",
            href: "/dashboard/contact-messages",
            icon: MessageCircle,
            colorClass: navTextClass,
            required: "lead.read",
          },
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
        href: "/dashboard/communication",
        icon: MessageSquare,
        exact: true,
        colorClass: navTextClass,
        type: "single",
        required: ["lead.read", "buyer.read", "seller.read"],
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
            name: "Activities",
            href: "/dashboard/activities",
            icon: Activity,
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
      required: ["system.manage", "data.export", "data.import"],
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
          required: "system.manage",
        },
        {
          name: "Variable Center",
          href: "/dashboard/settings/veriable-center",
          icon: Database,
          colorClass: navTextClass,
          required: "system.manage",
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

  useEffect(() => {
    let interval: any;

    const fetchNotifications = async () => {
      try {
        if (!user?.id) return;
        const userIdNum = Number(user.id);
        if (Number.isNaN(userIdNum)) return;

        const res = await notificationAPI.getUserNotifications(
          userIdNum
        );
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
        setUnreadCount((prev) =>
          prev !== newUnread ? newUnread : prev
        );
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    if (user?.id) {
      fetchNotifications();
      interval = setInterval(fetchNotifications, 10000);
    }
    return () => interval && clearInterval(interval);
  }, [user?.id]);

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
      setSessionTime((prev) =>
        prev !== formattedSessionTime
          ? formattedSessionTime
          : prev
      );

      let currentWorkTime = totalWorkTimeRef.current ?? 0;
      if (!isOnBreakRef.current) {
        const lastActivityHistory = JSON.parse(
          localStorage.getItem("activityHistory") || "[]"
        );
        const lastWorkStart =
          findLastWorkStart(lastActivityHistory);
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
      setWorkTime((prev) =>
        prev !== formattedWorkTime ? formattedWorkTime : prev
      );
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

  // Compact Sidebar Component with Orange Active State
  const SidebarComponent = useMemo(() => {
    return (
      <div className="flex flex-col h-full bg-[#0e3658]">
        {/* Header with white background for logo */}
        <div className="flex items-center justify-center h-14 px-4 border-b border-white/10 bg-white">
          {companyLogo ? (
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

        {/* Compact search bar */}
        <div className="px-3 py-3 border-b border-white/10">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Search
                className={cn(
                  "h-3.5 w-3.5 transition-colors duration-200",
                  searchFocused
                    ? "text-orange-400"
                    : "text-white/40"
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

        {/* Compact Navigation with Orange Active State */}
        <nav
          className="flex-1 px-2 py-3 space-y-2.5 overflow-y-auto custom-scrollbar"
          role="navigation"
          aria-label="Main sidebar navigation"
        >
          {filteredNavigation.map((item) => (
            <div key={item.name}>
              {item.type === "single" ? (
                <Link
                  to={item.href}
                  onClick={handleSidebarLinkClick}
                  className={cn(
                    "group flex items-center px-3 py-3 text-base font-medium rounded-sm transition-all duration-200",
                    isActive(item.href, item.exact)
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-2.5 h-4 w-4 flex-shrink-0 transition-all duration-200",
                      isActive(item.href, item.exact)
                        ? "text-white"
                        : "text-white/60 group-hover:text-orange-400"
                    )}
                  />
                  <span className="flex-1 text-xs">
                    {item.name}
                  </span>
                  {isActive(item.href, item.exact) && (
                    <div className="w-1 h-1 bg-white rounded-full" />
                  )}
                </Link>
              ) : (
                <div>
                  <button
                    onClick={() => toggleMenu(item.key)}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" ||
                        e.key === " "
                      )
                        toggleMenu(item.key);
                    }}
                    aria-expanded={expandedMenus.has(item.key)}
                    aria-controls={`menu-${item.key}`}
                    tabIndex={0}
                    className={cn(
                      "group flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                      isParentActive(item.submenu)
                        ? "bg-orange-500 text-white shadow-sm"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    )}
                    type="button"
                  >
                    <item.icon
                      className={cn(
                        "mr-2.5 h-4 w-4 flex-shrink-0 transition-all duration-200",
                        isParentActive(item.submenu)
                          ? "text-white"
                          : "text-white/60 group-hover:text-orange-400"
                      )}
                    />
                    <span className="flex-1 text-left text-xs">
                      {item.name}
                    </span>
                    {expandedMenus.has(item.key) ? (
                      <ChevronDown className="h-3 w-3 text-white/60" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-white/60" />
                    )}
                  </button>

                  {expandedMenus.has(item.key) && (
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

          {searchQuery && filteredNavigation.length === 0 && (
            <div className="text-center py-6">
              <Search className="h-6 w-6 text-white/20 mx-auto mb-2" />
              <p className="text-white/40 text-xs">
                No results found
              </p>
            </div>
          )}
        </nav>

        {/* Logout button with white background */}
        <div className="p-3 border-t border-white/10 bg-white">
          <button
            onClick={handleLogout}
            className="group flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200"
            type="button"
          >
            <LogOut className="mr-2.5 h-4 w-4 text-red-500 group-hover:text-red-600 transition-colors duration-150" />
            <span className="flex-1 text-left text-xs font-semibold">
              Sign out
            </span>
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
            {SidebarComponent}
          </div>
        </div>
      </div>

      {/* Desktop sidebar - compact width */}
      <aside className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-56 rounded-r-xl shadow-2xl overflow-hidden">
          {SidebarComponent}
        </div>
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Modern header */}
        <header className="bg-white shadow-md border-b border-slate-200">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-orange-600 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                onClick={openSidebar}
                aria-label="Open sidebar"
              >
                <Menu className="h-4 w-4" />
              </button>

              <Link
                to="/home"
                title="Go back to website"
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#1a2a6c] to-[#2a3a7c] text-white font-medium text-xs hover:shadow-lg hover:shadow-[#1a2a6c]/20 transition-all"
              >
                <FaEarthAsia className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Website</span>
              </Link>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Desktop timer buttons - compact */}
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
              <div
                className="relative lg:hidden"
                ref={mobileTimersRef}
              >
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
                        onClick={() =>
                          setMobileTimersOpen(false)
                        }
                        className="w-full flex items-center space-x-2 px-2 py-2 rounded-md hover:bg-orange-50 transition-colors"
                        type="button"
                      >
                        <Activity className="h-3.5 w-3.5 text-orange-600" />
                        <span className="text-xs font-medium text-slate-700">
                          100%
                        </span>
                      </button>

                      <button
                        onClick={() =>
                          setMobileTimersOpen(false)
                        }
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
        <main className="flex-1 overflow-y-auto focus:outline-none custom-scrollbar">
          <div className="px-0 py-0 sm:px-0 lg:px-0">
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

      {/* Custom scrollbar styles */}
      <style>{`
        @keyframes slide-in-left {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.3s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        
        /* Custom scrollbar for compact design */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;