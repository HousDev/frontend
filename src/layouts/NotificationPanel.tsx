// src/components/notifications/NotificationPanel.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Users, Eye, TrendingUp, FileText, Check, Trash2, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { notificationAPI } from "@/lib/notificationAPI";

type UILevel = "low" | "medium" | "high";
type Kind =
  | "property_inquiry"
  | "visit_scheduled"
  | "price_suggestion"
  | "document_ready"
  | "lead_assign"
  | "general";

type RawNotification = {
  id: number | string;
  lead_id?: string | number | null;
  user_id?: string | number | null;
  message?: string | null;
  type?: Kind | string | null;
  link?: string | null;
  is_read?: 0 | 1 | "0" | "1" | boolean | "true" | "false" | null;
  priority?: UILevel | null;
  created_at?: string | null;
  updated_at?: string | null;
  [k: string]: any;
};

export type NotificationItem = {
  id: number;
  title: string;
  message: string;
  type: string;
  priority: UILevel;
  timestamp: string; // created_at preferred
  read: boolean;
  link?: string | null;
};

const toNumberId = (val: number | string): number => {
  const n = typeof val === "number" ? val : Number(val);
  return Number.isFinite(n) ? n : Math.floor(Math.random() * 1e9);
};

const normalizeRead = (v: RawNotification["is_read"]): boolean => {
  if (typeof v === "boolean") return v;
  if (v === 1 || v === "1" || v === "true") return true;
  return false;
};

const parseDbTimestampToDate = (ts?: string | null): Date => {
  if (!ts) return new Date(NaN);
  if (/[tT]|\+|Z$/.test(ts)) return new Date(ts);
  const m = ts.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);
  if (m) {
    const [, y, mo, d, h, mi, s] = m;
    return new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s));
  }
  return new Date(ts);
};

const formatAbsoluteLocal = (date: Date) => {
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return new Intl.DateTimeFormat(undefined, {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatRelative = (timestamp: string) => {
  const when = parseDbTimestampToDate(timestamp);
  if (Number.isNaN(when.getTime())) return "Unknown time";
  const diffMin = Math.floor((Date.now() - when.getTime()) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
};

interface NotificationPanelProps {
  notifications?: NotificationItem[]; // controlled mode if provided and forceFetch=false
  onClose?: () => void;
  userId?: number | string;
  forceFetch?: boolean; // set true to force fetch even if notifications provided
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications: controlledNotifications,
  onClose,
  userId: userIdProp,
  forceFetch = false,
}) => {
  const { user } = useAuth();
  const currentUserId = userIdProp ?? user?.id;

  const isControlled = Array.isArray(controlledNotifications) && !forceFetch;

  const [notifications, setNotifications] = useState<NotificationItem[]>(
    controlledNotifications ?? []
  );
  const [loading, setLoading] = useState<boolean>(!isControlled);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (controlledNotifications && !forceFetch) {
      setNotifications(controlledNotifications);
      setLoading(false);
    }
  }, [controlledNotifications, forceFetch]);

  // Fetch when uncontrolled
  useEffect(() => {
    if (isControlled) return;

    let mounted = true;
    const uid = Number(currentUserId);

    if (!currentUserId || Number.isNaN(uid)) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await notificationAPI.getUserNotifications(uid);
        const rows: RawNotification[] = Array.isArray(res?.notifications)
          ? res.notifications
          : res?.notifications
          ? [res.notifications]
          : [];

        const formatted: NotificationItem[] = rows.map((n) => {
          const id = toNumberId(n.id);
          const type = String(n.type ?? "general");

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

          const message = n.message ?? "";
          const timestamp = n.created_at ?? n.updated_at ?? "1970-01-01 00:00:00";

          return {
            id,
            title,
            message,
            type,
            priority: (n.priority as UILevel) ?? "medium",
            timestamp,
            read: normalizeRead(n.is_read),
            link: n.link ?? null,
          };
        });

        if (mounted) setNotifications(formatted);
      } catch (err: any) {
        console.error("❌ Error fetching notifications:", err);
        if (mounted) setError(err?.message ?? "Failed to fetch notifications");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [currentUserId, isControlled]);

  const markAsRead = useCallback(async (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await notificationAPI.markAsRead(id);
    } catch (err) {
      console.error("❌ Error marking as read:", err);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
    }
  }, []);

  /** 🔥 Delete integrated with API (optimistic + rollback) */
  const deleteNotification = useCallback(async (id: number) => {
    // optimistic remove
    setDeletingIds((s) => new Set(s).add(id));
    const prev = notifications;

    setNotifications((prevList) => prevList.filter((n) => n.id !== id));

    try {
      await notificationAPI.delete(id); // <-- MUST exist in your API layer
      // success: keep state
    } catch (err) {
      console.error("❌ Error deleting notification:", err);
      // rollback on failure
      setNotifications(prev);
    } finally {
      setDeletingIds((s) => {
        const copy = new Set(s);
        copy.delete(id);
        return copy;
      });
    }
  }, [notifications]);

  const markAllAsRead = useCallback(async (uid: number) => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await notificationAPI.markAllAsRead(uid);
    } catch (err) {
      console.error("❌ Error marking all as read:", err);
    }
  }, []);

  const viewNotification = useCallback(
    async (id: number, link?: string | null) => {
      await markAsRead(id);
      if (link && typeof window !== "undefined") window.location.href = link;
    },
    [markAsRead]
  );

  const getIcon = (type: string) => {
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

  const getPriorityRow = (priority: UILevel) => {
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

  const unread = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const displayed = useMemo(() => {
    const sorted = [...notifications].sort((a, b) => {
      const da = parseDbTimestampToDate(a.timestamp).getTime();
      const db = parseDbTimestampToDate(b.timestamp).getTime();
      return db - da;
    });
    return sorted.slice(0, showAll ? 10 : 5);
  }, [notifications, showAll]);

  const canToggle = notifications.length > 5;

  return (
    <div className="relative z-50 bg-white shadow-md rounded-xl border border-gray-200 w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 rounded-t-xl">
        <div className="flex items-center space-x-3">
          <h2 className="text-base font-semibold text-gray-800">Notifications</h2>
        </div>

        <div className="flex items-center space-x-3">
          {canToggle && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              title={showAll ? "Show latest 5" : "Show latest 10"}
            >
              {showAll ? "View less" : "View all"}
            </button>
          )}

          {onClose && (
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100" title="Close">
              <X size={16} />
            </button>
          )}

          {unread > 0 && currentUserId && (
            <button
              onClick={() => {
                const uid = Number(currentUserId);
                if (!Number.isNaN(uid)) markAllAsRead(uid);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              title="Mark all as read"
            >
              Mark all as read
            </button>
          )}

          <div className="text-sm text-gray-500">{unread} unread</div>
        </div>
      </div>

      <ul className="divide-y divide-gray-100 max-h-[28rem] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {loading ? (
          <li className="p-4 text-center text-gray-500 text-sm">Loading notifications...</li>
        ) : error ? (
          <li className="p-4 text-center text-red-500 text-sm">{error}</li>
        ) : displayed.length === 0 ? (
          <li className="p-6 text-center text-gray-500 text-sm">No notifications yet</li>
        ) : (
          displayed.map((n) => {
            const d = parseDbTimestampToDate(n.timestamp);
            const isDeleting = deletingIds.has(n.id);
            return (
              <li
                key={n.id}
                onClick={() => viewNotification(n.id, n.link)}
                className={`p-4 flex items-start space-x-3 transition-colors border-l-4 min-w-0
                  ${getPriorityRow(n.priority)} ${!n.read ? "bg-blue-50" : ""}
                  hover:bg-gray-100 cursor-pointer`}
              >
                <div className="p-2 rounded-lg shadow-sm flex items-center justify-center min-w-[36px] shrink-0 bg-white">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 max-w-full">
                      <h4 className={`text-sm font-medium ${!n.read ? "text-gray-900" : "text-gray-700"} truncate`}>
                        {n.title}
                      </h4>

                      {n.message ? (
                        <p
                          className="text-xs text-gray-700 mt-1 break-words whitespace-normal leading-5"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                          title={n.message}
                        >
                          {n.message}
                        </p>
                      ) : null}

                      <div className="flex items-center flex-wrap gap-2 mt-2">
                        <span className="text-xs text-gray-500" title={formatAbsoluteLocal(d)}>
                          {formatRelative(n.timestamp)}
                        </span>

                        {n.priority && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              n.priority === "high"
                                ? "bg-red-100 text-red-700"
                                : n.priority === "medium"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {n.priority}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-1 ml-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          viewNotification(n.id, n.link);
                        }}
                        className="p-1 text-green-600 hover:bg-green-100 rounded disabled:opacity-50"
                        title="View"
                        disabled={isDeleting}
                      >
                        <Eye size={14} />
                      </button>

                      {!n.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(n.id);
                          }}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded disabled:opacity-50"
                          title="Mark as read"
                          disabled={isDeleting}
                        >
                          <Check size={14} />
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(n.id);
                        }}
                        className="p-1 text-red-600 hover:bg-red-100 rounded disabled:opacity-50"
                        title="Delete"
                        disabled={isDeleting}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
};

export default NotificationPanel;
