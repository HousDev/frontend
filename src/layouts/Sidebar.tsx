
import {
    MessageSquare, Megaphone, BarChart3, Bot, FileText,
    Settings, Phone, DollarSign, Bell, X,
    Users, ShoppingBag, Home, Building2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { notificationStore, type AppNotification } from "../lib/notifications";

export type Page =
    | "inbox"
    | "leads"
    | "buyers"
    | "sellers"
    | "properties"
    | "templates"
    | "campaigns"
    | "analytics"
    | "chatbot"
    | "settings"
    | "meta-spend";

interface SidebarProps {
    activePage: Page;
    onNavigate: (page: Page) => void;
    unreadCount: number;
    pendingTemplatesCount?:number
}

const NAV_ITEMS = [
    { id: "inbox", label: "Inbox", icon: MessageSquare },
    // { id: "leads", label: "All Leads", icon: Users },
    // { id: "buyers", label: "Buyers", icon: ShoppingBag },
    // { id: "sellers", label: "Sellers", icon: Home },
    // { id: "properties", label: "Properties", icon: Building2 },
    // { id: "templates", label: "Templates", icon: FileText },
    { id: "campaigns", label: "Campaigns", icon: Megaphone },
    { id: "chatbot", label: "Chatbot Flows", icon: Bot },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "meta-spend", label: "Meta Spend", icon: DollarSign },
    { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar({
    activePage,
    onNavigate,
    unreadCount,
    pendingTemplatesCount
}: SidebarProps) {
    const [bellOpen, setBellOpen] = useState(false);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [notifUnread, setNotifUnread] = useState(0);

    useEffect(() => {
        notificationStore.subscribe((all) => {
            setNotifications(all);
            setNotifUnread(all.filter((n) => !n.read).length);
        });
    }, []);

    const handleBellClick = () => {
        setBellOpen((v) => !v);
        if (!bellOpen) notificationStore.markAllRead();
    };

    const handleNotifClick = (n: AppNotification) => {
        if (n.action) onNavigate(n.action.page as Page);
        setBellOpen(false);
    };

    return (
        <aside className="relative flex flex-col h-screen w-16 bg-white border-r border-gray-200 overflow-visible">

            {/* Logo */}
            <div className="flex items-center justify-center h-14">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Phone size={16} className="text-white" />
                </div>
            </div>

            {/* Bell */}
            <div className="absolute top-3 right-3 z-50">
                <button
                    onClick={handleBellClick}
                    className="relative p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                >
                    <Bell size={16} />
                    {notifUnread > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] rounded-full px-1">
                            {notifUnread > 9 ? "9+" : notifUnread}
                        </span>
                    )}
                </button>
            </div>

            {/* Notification Dropdown */}
            {bellOpen && (
                <div className="absolute top-12 left-16 z-50 w-80 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                    <div className="flex justify-between items-center px-4 py-2 border-b">
                        <span className="text-xs font-semibold text-gray-600">
                            Notifications
                        </span>
                        <div className="flex gap-2">
                            {notifications.length > 0 && (
                                <button
                                    onClick={() => notificationStore.clear()}
                                    className="text-[10px] text-gray-400 hover:text-gray-600"
                                >
                                    Clear
                                </button>
                            )}
                            <button
                                onClick={() => setBellOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={13} />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-400 text-xs">
                                No notifications
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <button
                                    key={n.id}
                                    onClick={() => handleNotifClick(n)}
                                    className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 ${!n.read ? "bg-blue-50" : ""
                                        }`}
                                >
                                    <p className="text-xs font-semibold text-gray-700">
                                        {n.title}
                                    </p>
                                    <p className="text-[11px] text-gray-500">{n.body}</p>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 py-4 flex flex-col items-center gap-2 overflow-visible">
                {NAV_ITEMS.map((item:any) => {
                    const isActive = activePage === item.id;

                    return (
                        <div key={item.id} className="relative group">
                            <button
                                onClick={() => onNavigate(item.id)}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isActive
                                        ? "bg-blue-100 text-blue-600"
                                        : "text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                                    }`}
                            >
                                <item.icon size={20} />
                            </button>

                            {/* Tooltip FIXED */}
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 
              bg-gray-800 text-white text-xs rounded whitespace-nowrap 
              opacity-0 group-hover:opacity-100 transition-all duration-200 
              z-[9999] pointer-events-none shadow-lg">
                                {item.label}
                                {item.id === "inbox" && unreadCount > 0 && ` (${unreadCount})`}
                            </div>
                        </div>
                    );
                })}
            </nav>
        </aside>
    );
}