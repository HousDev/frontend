import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bell, X, Check, Trash2, Eye, Users, FileText, TrendingUp } from "lucide-react";

type Priority = "low" | "medium" | "high";
type Kind =
  | "property_inquiry"
  | "visit_scheduled"
  | "price_suggestion"
  | "document_ready"
  | "lead_assign"
  | "general";

export type BellNotification = {
  id: number | string;
  title?: string | null;
  message?: string | null;
  type?: Kind | string | null;
  priority?: Priority | null;
  timestamp?: string | null; // ISO or "YYYY-MM-DD HH:mm:ss"
  read?: boolean | 0 | 1 | "0" | "1" | "true" | "false" | null;
  link?: string | null;
};

type Props = {
  notifications: BellNotification[];
  unreadCount?: number; // optional – if not sent, computed locally
  onMarkAsRead?: (id: number | string) => void;
  onMarkAllAsRead?: () => void;
  onDeleteNotification?: (id: number | string) => void;
  onViewAll?: () => void;
};

const normalizeRead = (v: Props["notifications"][number]["read"]): boolean => {
  if (typeof v === "boolean") return v;
  if (v === 1 || v === "1" || v === "true") return true;
  return false;
};

const parseDbTimestampToDate = (ts?: string | null): Date => {
  if (!ts) return new Date(NaN);
  if (/[tT]|\+|Z$/.test(ts)) return new Date(ts); // ISO
  const m = ts.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);
  if (m) {
    const [, y, mo, d, h, mi, s] = m;
    return new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s));
  }
  return new Date(ts);
};

const formatRelative = (timestamp?: string | null) => {
  const d = parseDbTimestampToDate(timestamp ?? "");
  if (Number.isNaN(d.getTime())) return "Unknown";
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const getIcon = (type?: string | null) => {
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

const getPriorityTone = (priority?: Priority | null) => {
  switch (priority) {
    case "high":
      return { row: "border-l-red-500 bg-red-50", pill: "bg-red-100 text-red-700" };
    case "medium":
      return { row: "border-l-orange-500 bg-orange-50", pill: "bg-orange-100 text-orange-700" };
    case "low":
      return { row: "border-l-green-500 bg-green-50", pill: "bg-green-100 text-green-700" };
    default:
      return { row: "border-l-gray-500 bg-gray-50", pill: "bg-gray-100 text-gray-700" };
  }
};

const NotificationBell: React.FC<Props> = ({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onViewAll,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popRef = useRef<HTMLDivElement | null>(null);

  const computedUnread = useMemo(
    () => notifications.filter((n) => !normalizeRead(n.read)).length,
    [notifications]
  );
  const badge = typeof unreadCount === "number" ? unreadCount : computedUnread;

  // close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (!popRef.current) return;
      if (!popRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // close on Esc
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <div className="relative" ref={popRef}>
      <button
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((s) => !s)}
        className="relative p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <Bell size={20} className={badge > 0 ? "text-blue-600" : "text-gray-600"} />
        {badge > 0 && (
          <div className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-[10px] leading-none text-white font-bold">
              {badge > 99 ? "99+" : badge}
            </span>
          </div>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-12 w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {(badge > 0) && onMarkAllAsRead && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-gray-100">
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications?.length ? (
              <div className="divide-y divide-gray-100">
                {notifications.map((n) => {
                  const read = normalizeRead(n.read);
                  const tone = getPriorityTone(n.priority ?? "medium");

                  return (
                    <div
                      key={String(n.id)}
                      className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${tone.row} ${
                        !read ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">{getIcon(n.type)}</div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-sm font-medium ${!read ? "text-gray-900" : "text-gray-700"}`}>
                                {n.title ?? "Notification"}
                              </h4>
                              {n.message ? (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{n.message}</p>
                              ) : null}
                              <div className="flex items-center space-x-2 mt-2">
                                <span className="text-xs text-gray-500">{formatRelative(n.timestamp)}</span>
                                {n.priority && (
                                  <span className={`text-xs px-2 py-1 rounded-full ${tone.pill}`}>
                                    {n.priority}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-1 ml-2">
                              {!read && onMarkAsRead && (
                                <button
                                  onClick={() => onMarkAsRead(n.id)}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                  title="Mark as read"
                                >
                                  <Check size={12} />
                                </button>
                              )}
                              {onDeleteNotification && (
                                <button
                                  onClick={() => onDeleteNotification(n.id)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                                  title="Delete"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bell className="mx-auto text-gray-300 mb-3" size={32} />
                <p className="text-gray-500">No notifications</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={onViewAll}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
              disabled={!onViewAll}
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
