// src/components/NotificationPanel.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  Users,
  Eye,
  TrendingUp,
  FileText,
  Check,
  Trash2,
} from "lucide-react";
import { notificationAPI } from "@/lib/notificationAPI";
import { useAuth } from "@/contexts/AuthContext";

type RawNotification = {
  id: number | string;
  type: string;
  lead_name?: string | null;
  message?: string | null;
  created_at?: string | null;
  is_read?: 0 | 1 | boolean;
  link?: string | null;
  [key: string]: any;
};

type UILevel = "low" | "medium" | "high";

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

const toNumberId = (id: number | string) => (typeof id === "number" ? id : Number(id));

const NotificationPanel: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // if user or id missing -> clear and stop
    if (!user?.id) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    // coerce user.id to number because API expects number
    const uid = Number(user.id);
    if (Number.isNaN(uid)) {
      // don't call API with NaN
      console.warn("NotificationPanel: user.id is not a number, skipping fetch:", user.id);
      setNotifications([]);
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);

      try {
        // <-- safe numeric id passed here
        const res = await notificationAPI.getUserNotifications(uid);
        const apiData: RawNotification[] =
          Array.isArray(res?.notifications) ? res.notifications : res?.notifications ? [res.notifications] : [];

        const formatted: NotificationItem[] = apiData.map((n) => {
          const id = toNumberId(n.id ?? Math.floor(Math.random() * 1e9));
          const type = n.type ?? "general";
          const title =
            type === "lead_assign" ? `Lead Assigned:` : type === "property_inquiry" ? "Property Inquiry" : type;

          const message = `${n.lead_name ? n.lead_name + " - " : ""}${n.message ?? ""}`;

          return {
            id,
            title,
            message,
            type,
            priority: "medium" as UILevel,
            timestamp: n.created_at ?? new Date().toISOString(),
            read: n.is_read === 1 || n.is_read === true,
            link: n.link ?? undefined,
            color: "green",
          };
        });

        if (mounted) {
          setNotifications(formatted);
        }
      } catch (err: any) {
        console.error("❌ Error fetching notifications:", err);
        if (mounted) setError(err?.message ?? "Failed to fetch notifications");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchNotifications();

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  // mark single as read (optimistic)
  const markAsRead = useCallback(async (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

    try {
      await notificationAPI.markAsRead(id);
    } catch (err) {
      console.error("❌ Error marking as read:", err);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
    }
  }, []);

  // delete (local only)
  const deleteNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    // optionally call API delete here if available
  }, []);

  // IMPORTANT: markAllAsRead now accepts the userId parameter and calls API with it
  const markAllAsRead = useCallback(
    async (userId: number) => {
      // optimistic UI update
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

      try {
        // notificationAPI.markAllAsRead expects userId: number
        await notificationAPI.markAllAsRead(userId);
      } catch (err) {
        console.error("❌ Error marking all as read:", err);
        // If you want to revert on failure, consider refetching notifications here instead
      }
    },
    []
  );

  const viewNotification = useCallback(
    async (id: number, link?: string | null) => {
      await markAsRead(id);
      if (typeof window !== "undefined" && link) {
        window.location.href = link;
      }
    },
    [markAsRead]
  );

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "property_inquiry":
        return <Users className="text-blue-600" size={16} />;
      case "visit_scheduled":
        return <Eye className="text-green-600" size={16} />;
      case "price_suggestion":
        return <TrendingUp className="text-purple-600" size={16} />;
      case "document_ready":
        return <FileText className="text-orange-600" size={16} />;
      case "lead_assign":
        return <Users className="text-indigo-600" size={16} />;
      default:
        return <Bell className="text-gray-600" size={16} />;
    }
  };

  const getPriorityColor = (priority: UILevel) => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50";
      case "medium":
        return "border-l-orange-500 bg-orange-50";
      case "low":
        return "border-l-green-500 bg-green-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const parsed = new Date(timestamp);
    if (Number.isNaN(parsed.getTime())) return "Unknown time";
    const diffInMinutes = Math.floor((now.getTime() - parsed.getTime()) / (1000 * 60));
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  return (
    <div className="relative z-50 bg-white shadow-md rounded-xl border border-gray-200 w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 rounded-t-xl">
        <h2 className="text-base font-semibold text-gray-800">Notifications</h2>
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && user?.id && (
            <button
              onClick={() => {
                // coerce to number because API expects number
                const uid = Number(user.id);
                if (!Number.isNaN(uid)) markAllAsRead(uid);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              title="Mark all as read"
            >
              Mark all as read
            </button>
          )}
          <div className="text-sm text-gray-500">{unreadCount} unread</div>
        </div>
      </div>

      <ul className="divide-y divide-gray-100 max-h-[28rem] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {loading ? (
          <li className="p-4 text-center text-gray-500 text-sm">Loading notifications...</li>
        ) : error ? (
          <li className="p-4 text-center text-red-500 text-sm">{error}</li>
        ) : notifications.length === 0 ? (
          <li className="p-4 text-center text-gray-500 text-sm">No notifications yet</li>
        ) : (
          notifications.map((n) => (
            <li
              key={n.id}
              onClick={() => viewNotification(n.id, n.link)}
              className={`p-4 flex space-x-3 transition-colors border-l-4 ${getPriorityColor(
                n.priority
              )} ${!n.read ? "bg-blue-50" : ""} hover:bg-gray-100 cursor-pointer`}
            >
              <div className="p-2 rounded-lg shadow-sm flex items-center justify-center min-w-[36px]">
                {getNotificationIcon(n.type)}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <h4 className={`text-sm font-medium ${!n.read ? "text-gray-900" : "text-gray-700"}`}>{n.title}</h4>
                    <p className="text-xs text-gray-600 truncate">{n.message}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-gray-500">{formatTimestamp(n.timestamp)}</span>
                      {n.priority && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            n.priority === "high" ? "bg-red-100 text-red-700" : n.priority === "medium" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                          }`}
                        >
                          {n.priority}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        viewNotification(n.id, n.link);
                      }}
                      className="p-1 text-green-600 hover:bg-green-100 rounded"
                      title="View"
                    >
                      <Eye size={14} />
                    </button>

                    {!n.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(n.id);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n.id);
                      }}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default NotificationPanel;
