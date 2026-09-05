// frontend/src/pages/communication/components/UserMyChatsDesk.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { connectSocket, getSocket } from "@/lib/socket";
import {
  chatApi,
  generateUUID,
  PropertyConversation,
  PropertyChatMessage,
} from "@/services/chatApi";
import { playNotificationSound } from "@/utils/notificationSound";
import {
  MessageSquare,
  Send,
  Building2,
  MapPin,
  Clock,
  CheckCheck,
  Check,
  ChevronLeft,
  Search,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Circle,
  Paperclip,
  Loader2,
} from "lucide-react";
import {
  ChatMediaBubble,
  ChatAttachmentDraftPreview,
  ChatLightboxModal,
} from "@/components/chat/ChatMediaAttachment";

export interface UserMyChatsDeskProps {
  initialConversationId?: number | null;
  onBackToPortal?: () => void;
  compact?: boolean;
}

export const UserMyChatsDesk: React.FC<UserMyChatsDeskProps> = ({
  initialConversationId,
  onBackToPortal,
  compact = false,
}) => {
  const { user } = useAuth();
  const currentUserId = user ? Number(user.id) : 0;
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState<PropertyConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<PropertyConversation | null>(null);
  const [messages, setMessages] = useState<PropertyChatMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<{
    url: string;
    type: "image" | "video";
    title?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [filterTab, setFilterTab] = useState<"all" | "unread">("all");

  // Phase 3C-2 Real-Time States: Typing & Presence
  const [isExecutiveTyping, setIsExecutiveTyping] = useState(false);
  const [executivePresence, setExecutivePresence] = useState<{
    status: "online" | "offline";
    lastSeen: string | null;
  }>({ status: "offline", lastSeen: null });

  const selectedConvRef = useRef<PropertyConversation | null>(null);
  selectedConvRef.current = selectedConversation;
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const remoteTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isExecutiveTyping]);

  // Format timestamps
  const formatTime = (isoString?: string | null) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const formatChatDateDivider = (dateStr?: string | null): string => {
    if (!dateStr) return "Today";
    try {
      const d = new Date(dateStr);
      const now = new Date();
      if (isNaN(d.getTime())) return "Today";

      const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const diffTime = today.getTime() - msgDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays > 1 && diffDays < 7) {
        return d.toLocaleDateString("en-IN", { weekday: "long" });
      }

      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    } catch {
      return "Today";
    }
  };

  const isSameDay = (d1?: string | null, d2?: string | null): boolean => {
    if (!d1 || !d2) return false;
    try {
      const date1 = new Date(d1);
      const date2 = new Date(d2);
      return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
      );
    } catch {
      return false;
    }
  };

  const formatPrice = (val?: string | number) => {
    if (!val) return "";
    const num = Number(val);
    if (isNaN(num)) return String(val);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lac`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  // 1. Fetch Conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const res = await chatApi.getConversations();
      if (res.success && Array.isArray(res.conversations)) {
        setConversations(res.conversations);

        const targetId =
          initialConversationId ||
          (searchParams.get("conversationId") ? Number(searchParams.get("conversationId")) : null);

        if (targetId) {
          const match = res.conversations.find((c) => Number(c.id) === Number(targetId));
          if (match) {
            selectConversation(match);
          }
        } else if (selectedConvRef.current) {
          const updated = res.conversations.find((c) => c.id === selectedConvRef.current?.id);
          if (updated) setSelectedConversation(updated);
        }
      }
    } catch (err) {
      console.error("Failed to load user conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  }, [initialConversationId, searchParams]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 2. Select Conversation
  const selectConversation = useCallback(
    async (conv: PropertyConversation) => {
      const prevConv = selectedConvRef.current;
      const socket = getSocket();

      // Reset typing state on room change
      setIsExecutiveTyping(false);
      if (remoteTypingTimeoutRef.current) clearTimeout(remoteTypingTimeoutRef.current);

      if (prevConv && prevConv.id !== conv.id && socket) {
        socket.emit("chat:leave_room", { conversationId: prevConv.id });
        if (isTypingRef.current) {
          socket.emit("chat:typing_stop", { conversationId: prevConv.id });
          isTypingRef.current = false;
        }
      }

      setSelectedConversation(conv);
      setMobileView("chat");
      setLoadingMessages(true);

      try {
        if (socket) {
          socket.emit("chat:join_room", { conversationId: conv.id });

          // Request executive presence
          if (conv.executive_id) {
            socket.emit("user:get_presence", { userIds: [conv.executive_id] });
          }
        }

        const res = await chatApi.getMessages(conv.id);
        if (res.success) {
          setMessages(res.messages || []);

          // Acknowledge delivery for incoming messages
          if (socket && Array.isArray(res.messages)) {
            res.messages.forEach((m) => {
              if (m.sender_type !== "user" && !m.is_delivered) {
                socket.emit("chat:message_delivered", {
                  conversationId: conv.id,
                  messageId: m.id,
                  messageUuid: m.message_uuid,
                });
              }
            });
          }
        }

        // Reset unread count if user had unread messages
        if ((conv.unread_user_count || 0) > 0) {
          await chatApi.markAsRead(conv.id);
          setConversations((prev) =>
            prev.map((c) => (c.id === conv.id ? { ...c, unread_user_count: 0 } : c))
          );
          if (socket) {
            socket.emit("chat:read_receipt", { conversationId: conv.id });
          }
        }
      } catch (err) {
        console.error("Failed to load conversation messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    },
    []
  );

  // 3. Socket.IO Real-time Subscriptions (Phase 3C-2 enhanced)
  useEffect(() => {
    if (!currentUserId) return;
    const socket = connectSocket(currentUserId);
    if (!socket) return;

    // Handle Socket Reconnection
    const handleConnect = () => {
      const activeConv = selectedConvRef.current;
      if (activeConv) {
        socket.emit("chat:join_room", { conversationId: activeConv.id });
        if (activeConv.executive_id) {
          socket.emit("user:get_presence", { userIds: [activeConv.executive_id] });
        }
      }
    };

    // Incoming New Message
    const handleNewMessage = (msg: PropertyChatMessage) => {
      const activeConv = selectedConvRef.current;

      // Clear typing indicator when message arrives from executive
      if (msg.sender_type !== "user") {
        playNotificationSound();
        setIsExecutiveTyping(false);
        if (remoteTypingTimeoutRef.current) clearTimeout(remoteTypingTimeoutRef.current);
      }

      if (activeConv && Number(activeConv.id) === Number(msg.conversation_id)) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id || m.message_uuid === msg.message_uuid)) {
            return prev;
          }
          return [...prev, msg];
        });

        // Acknowledge delivery
        if (msg.sender_type !== "user") {
          socket.emit("chat:message_delivered", {
            conversationId: activeConv.id,
            messageId: msg.id,
            messageUuid: msg.message_uuid,
          });

          // Mark as read immediately in active view
          chatApi.markAsRead(activeConv.id).catch(() => {});
          socket.emit("chat:read_receipt", { conversationId: activeConv.id });
        }
      }

      // Update conversation list preview
      setConversations((prev) => {
        const index = prev.findIndex((c) => Number(c.id) === Number(msg.conversation_id));
        if (index === -1) {
          fetchConversations();
          return prev;
        }

        const convToUpdate = { ...prev[index] };
        convToUpdate.last_message_text = msg.message_text;
        convToUpdate.last_message_at = msg.created_at;

        if (!activeConv || Number(activeConv.id) !== Number(msg.conversation_id)) {
          if (msg.sender_type !== "user") {
            convToUpdate.unread_user_count = (convToUpdate.unread_user_count || 0) + 1;
          }
        }

        const withoutUpdated = prev.filter((c) => Number(c.id) !== Number(msg.conversation_id));
        return [convToUpdate, ...withoutUpdated];
      });
    };

    // Typing Indicator Event
    const handleTyping = (data: {
      conversationId: number;
      senderId: number;
      senderRole: string;
      typing: boolean;
    }) => {
      const activeConv = selectedConvRef.current;
      if (activeConv && Number(activeConv.id) === Number(data.conversationId)) {
        if (Number(data.senderId) !== currentUserId) {
          setIsExecutiveTyping(data.typing);

          if (remoteTypingTimeoutRef.current) clearTimeout(remoteTypingTimeoutRef.current);
          if (data.typing) {
            // Auto-dismiss after 3.5s if no typing_stop arrives
            remoteTypingTimeoutRef.current = setTimeout(() => {
              setIsExecutiveTyping(false);
            }, 3500);
          }
        }
      }
    };

    // Message Delivered Event (Double checkmark update)
    const handleMessageDelivered = (data: {
      conversationId: number;
      messageId: number | null;
      messageUuid: string | null;
    }) => {
      const activeConv = selectedConvRef.current;
      if (activeConv && Number(activeConv.id) === Number(data.conversationId)) {
        setMessages((prev) =>
          prev.map((m) =>
            (data.messageId && m.id === data.messageId) ||
            (data.messageUuid && m.message_uuid === data.messageUuid)
              ? { ...m, is_delivered: 1 }
              : m
          )
        );
      }
    };

    // Read Receipts Event (Blue double checkmark update)
    const handleMessagesRead = (data: { conversationId: number; readBy: number }) => {
      const activeConv = selectedConvRef.current;
      if (activeConv && Number(activeConv.id) === Number(data.conversationId)) {
        setMessages((prev) =>
          prev.map((m) => (m.sender_type === "user" ? { ...m, is_read: 1, is_delivered: 1 } : m))
        );
      }
    };

    // In-Memory Presence Event
    const handlePresence = (data: {
      userId: number;
      status: "online" | "offline";
      lastSeen?: string | null;
    }) => {
      const activeConv = selectedConvRef.current;
      if (activeConv && Number(activeConv.executive_id) === Number(data.userId)) {
        setExecutivePresence({
          status: data.status,
          lastSeen: data.lastSeen || null,
        });
      }
    };

    // Batch Presence Event
    const handlePresenceBatch = (data: Record<string, { status: "online" | "offline"; lastSeen: string | null }>) => {
      const activeConv = selectedConvRef.current;
      if (activeConv && activeConv.executive_id && data[activeConv.executive_id]) {
        const info = data[activeConv.executive_id];
        setExecutivePresence({
          status: info.status,
          lastSeen: info.lastSeen,
        });
      }
    };

    // Unread count updates
    const handleUnreadCount = (data: { conversationId: number; unreadCount: number }) => {
      setConversations((prev) =>
        prev.map((c) =>
          Number(c.id) === Number(data.conversationId)
            ? { ...c, unread_user_count: data.unreadCount }
            : c
        )
      );
    };

    socket.on("connect", handleConnect);
    socket.on("chat:new_message", handleNewMessage);
    socket.on("chat:typing", handleTyping);
    socket.on("chat:message_delivered", handleMessageDelivered);
    socket.on("chat:messages_read", handleMessagesRead);
    socket.on("chat:unread_count_update", handleUnreadCount);
    socket.on("user:presence", handlePresence);
    socket.on("user:presence_batch", handlePresenceBatch);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("chat:new_message", handleNewMessage);
      socket.off("chat:typing", handleTyping);
      socket.off("chat:message_delivered", handleMessageDelivered);
      socket.off("chat:messages_read", handleMessagesRead);
      socket.off("chat:unread_count_update", handleUnreadCount);
      socket.off("user:presence", handlePresence);
      socket.off("user:presence_batch", handlePresenceBatch);
    };
  }, [currentUserId, fetchConversations]);

  // Handle Input Typing Debouncer
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    const socket = getSocket();
    if (!socket || !selectedConversation) return;

    if (!isTypingRef.current && e.target.value.trim().length > 0) {
      isTypingRef.current = true;
      socket.emit("chat:typing_start", { conversationId: selectedConversation.id });
    }

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    typingTimerRef.current = setTimeout(() => {
      if (isTypingRef.current && selectedConvRef.current) {
        isTypingRef.current = false;
        socket.emit("chat:typing_stop", { conversationId: selectedConvRef.current.id });
      }
    }, 2500);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("File size exceeds 50MB limit. Please select a smaller photo or video.");
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const clearAttachment = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 4. Send Message Handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedConversation || (!inputText.trim() && !selectedFile) || sendingMessage) return;

    const socket = getSocket();
    if (socket && isTypingRef.current) {
      isTypingRef.current = false;
      socket.emit("chat:typing_stop", { conversationId: selectedConversation.id });
    }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    const textToSend = inputText.trim();
    const fileToSend = selectedFile;

    setInputText("");
    clearAttachment();
    setSendingMessage(true);

    const messageUuid = generateUUID();

    try {
      let res;
      if (fileToSend) {
        res = await chatApi.sendMedia(selectedConversation.id, fileToSend, textToSend, messageUuid);
      } else {
        res = await chatApi.sendMessage(selectedConversation.id, {
          message_text: textToSend,
          message_type: "text",
          message_uuid: messageUuid,
        });
      }

      if (res.success && res.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === res.message.id || m.message_uuid === res.message.message_uuid)) {
            return prev;
          }
          return [...prev, res.message];
        });

        // Update conversation list preview
        setConversations((prev) => {
          const index = prev.findIndex((c) => c.id === selectedConversation.id);
          if (index === -1) return prev;
          const updated = { ...prev[index] };
          updated.last_message_text = textToSend || (fileToSend?.type.startsWith("image/") ? "📷 Photo" : fileToSend?.type.startsWith("video/") ? "🎥 Video" : `📎 ${fileToSend?.name}`);
          updated.last_message_at = new Date().toISOString();
          const rest = prev.filter((c) => c.id !== selectedConversation.id);
          return [updated, ...rest];
        });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSendingMessage(false);
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (filterTab === "unread" && (c.unread_user_count || 0) === 0) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = (c.property_title || "").toLowerCase().includes(q);
    const locMatch = (c.property_location || "").toLowerCase().includes(q);
    const socMatch = (c.property_society || "").toLowerCase().includes(q);
    const execMatch = `${c.executive_first_name || ""} ${c.executive_last_name || ""}`
      .toLowerCase()
      .includes(q);
    const msgMatch = (c.last_message_text || "").toLowerCase().includes(q);
    return titleMatch || locMatch || socMatch || execMatch || msgMatch;
  });

  const totalUnreadCount = conversations.reduce(
    (sum, c) => sum + (c.unread_user_count || 0),
    0
  );

  return (
    <div
      className={`w-full bg-white flex flex-col md:flex-row overflow-hidden ${
        compact ? "h-[calc(100vh-140px)] rounded-xl border border-gray-200 shadow-sm" : "h-full"
      }`}
    >
      {/* ================= LEFT PANEL: CONVERSATION LIST ================= */}
      <div
        className={`w-full md:w-80 lg:w-96 shrink-0 border-r border-gray-200 flex flex-col bg-slate-50/50 ${
          mobileView === "chat" ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Header */}
        <div className="p-3.5 border-b border-gray-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBackToPortal && (
              <button
                onClick={onBackToPortal}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                title="Back to portal"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <MessageSquare size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 leading-tight">My Chats</h2>
                <p className="text-[11px] text-gray-500">Property Executive Inquiries</p>
              </div>
            </div>
          </div>
          <button
            onClick={fetchConversations}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Refresh conversations"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Filter / Search */}
        <div className="p-3 border-b border-gray-200 bg-white space-y-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search properties or messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-100 border-none rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterTab("all")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                filterTab === "all"
                  ? "bg-orange-500 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All ({conversations.length})
            </button>
            <button
              onClick={() => setFilterTab("unread")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1 ${
                filterTab === "unread"
                  ? "bg-orange-500 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Unread
              {totalUnreadCount > 0 && (
                <span className="px-1.5 py-0.2 bg-red-500 text-white text-[10px] rounded-full font-bold">
                  {totalUnreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {loadingConversations ? (
            <div className="p-8 text-center text-xs text-gray-400">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading your chats...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-3">
                <MessageSquare size={20} />
              </div>
              <h3 className="text-xs font-semibold text-gray-800 mb-1">
                {searchQuery ? "No matching chats" : "No property conversations yet"}
              </h3>
              <p className="text-[11px] text-gray-500 mb-4 max-w-[200px] mx-auto">
                {searchQuery
                  ? "Try searching with a different property name or location."
                  : "Start chatting with REX to discover properties and connect with an executive."}
              </p>
              {!searchQuery && (
                <Link
                  to="/properties"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 shadow-sm transition-colors"
                >
                  <Sparkles size={13} />
                  Discover Properties
                </Link>
              )}
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = selectedConversation?.id === conv.id;
              const hasUnread = (conv.unread_user_count || 0) > 0;
              const thumbnail =
                Array.isArray(conv.property_photos) && conv.property_photos.length > 0
                  ? conv.property_photos[0]
                  : null;

              return (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full text-left p-3 flex gap-3 transition-colors ${
                    isSelected
                      ? "bg-orange-50/80 border-l-4 border-orange-500"
                      : "hover:bg-white bg-transparent"
                  }`}
                >
                  {/* Property Image / Avatar */}
                  <div className="relative shrink-0">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt="Property"
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                        <Building2 size={20} />
                      </div>
                    )}
                    {conv.status === "closed" && (
                      <span className="absolute -top-1 -right-1 px-1 py-0.2 bg-gray-500 text-white text-[9px] rounded font-medium">
                        Closed
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="text-xs font-semibold text-gray-900 truncate">
                        {conv.property_title || "Property Inquiry"}
                      </h4>
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {formatTime(conv.last_message_at || conv.created_at)}
                      </span>
                    </div>

                    {(conv.property_location || conv.property_society) && (
                      <p className="text-[11px] text-gray-500 flex items-center gap-1 truncate mb-1">
                        <MapPin size={10} className="shrink-0 text-gray-400" />
                        <span className="truncate">
                          {[conv.property_society, conv.property_location].filter(Boolean).join(", ")}
                        </span>
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-gray-600 truncate">
                        {conv.last_message_text || (
                          <span className="italic text-gray-400">No messages yet</span>
                        )}
                      </p>
                      {hasUnread && (
                        <span className="px-1.5 py-0.2 bg-orange-600 text-white text-[10px] rounded-full font-bold shrink-0 animate-pulse">
                          {conv.unread_user_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ================= RIGHT PANEL: CONVERSATION VIEW ================= */}
      <div
        className={`flex-1 flex flex-col bg-white overflow-hidden ${
          mobileView === "list" ? "hidden md:flex" : "flex"
        }`}
      >
        {selectedConversation ? (
          <>
            {/* Conversation Header */}
            <div className="p-3.5 border-b border-gray-200 bg-white flex items-center justify-between shrink-0 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setMobileView("list")}
                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 md:hidden"
                  title="Back to list"
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Property Details Header */}
                <div className="flex items-center gap-3 min-w-0">
                  {selectedConversation.property_photos &&
                  selectedConversation.property_photos.length > 0 ? (
                    <img
                      src={selectedConversation.property_photos[0]}
                      alt="Property"
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200">
                      <Building2 size={18} />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900 truncate">
                        {selectedConversation.property_title || "Property Conversation"}
                      </h3>
                      {selectedConversation.property_price && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] rounded font-semibold shrink-0">
                          {formatPrice(selectedConversation.property_price)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-0.5">
                      {selectedConversation.property_location && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin size={11} className="text-gray-400 shrink-0" />
                          <span className="truncate">{selectedConversation.property_location}</span>
                        </span>
                      )}
                      {selectedConversation.executive_first_name && (
                        <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <ShieldCheck size={12} className="text-emerald-600" />
                          <span>
                            Exec: {selectedConversation.executive_first_name}{" "}
                            {selectedConversation.executive_last_name || ""}
                          </span>
                          {/* Online / Offline Presence Pill */}
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-semibold ${
                              executivePresence.status === "online"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                executivePresence.status === "online"
                                  ? "bg-emerald-500 animate-pulse"
                                  : "bg-slate-400"
                              }`}
                            />
                            {executivePresence.status === "online" ? "Online" : "Offline"}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* View Property CTA */}
              <div className="flex items-center gap-2 shrink-0">
                {selectedConversation.property_slug ? (
                  <Link
                    to={`/properties/${selectedConversation.property_slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors border border-orange-200"
                  >
                    <span>View Property</span>
                    <ExternalLink size={12} />
                  </Link>
                ) : (
                  <span className="px-2 py-1 text-[11px] bg-gray-100 text-gray-500 rounded font-medium">
                    Property no longer available
                  </span>
                )}
              </div>
            </div>

            {/* Message History List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/60">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full text-xs text-gray-400">
                  <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-2" />
                  Loading message history...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-6">
                  <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-2 shadow-xs">
                    <MessageSquare size={20} className="text-gray-400" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">No messages in this inquiry yet</p>
                  <p className="text-[11px] text-gray-400 mt-1 max-w-xs">
                    Send a message to speak directly with our assigned property executive.
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isUser = msg.sender_type === "user";
                  const isSystem = msg.sender_type === "system";
                  const prevMsg = index > 0 ? messages[index - 1] : null;
                  const showDateDivider = !prevMsg || !isSameDay(prevMsg.created_at, msg.created_at);

                  return (
                    <React.Fragment key={msg.id || msg.message_uuid || index}>
                      {showDateDivider && (
                        <div className="flex justify-center my-3 sticky top-1 z-10">
                          <span className="px-3.5 py-1 bg-white/90 backdrop-blur-xs text-slate-600 text-[11px] font-bold rounded-full shadow-2xs border border-slate-200/80 tracking-wide uppercase">
                            {formatChatDateDivider(msg.created_at)}
                          </span>
                        </div>
                      )}

                      {isSystem ? (
                        <div className="text-center my-2">
                          <span className="px-3 py-1 bg-gray-200/70 text-gray-600 text-[11px] rounded-full font-medium">
                            {msg.message_text}
                          </span>
                        </div>
                      ) : (
                        <div
                          className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[78%] md:max-w-[65%] rounded-2xl p-3 shadow-2xs ${
                              isUser
                                ? "bg-orange-600 text-white rounded-br-xs"
                                : "bg-white text-gray-900 border border-gray-200 rounded-bl-xs"
                            }`}
                          >
                            {!isUser && (
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-[11px] font-bold text-slate-800">
                                  {msg.sender_first_name
                                    ? `${msg.sender_first_name} ${msg.sender_last_name || ""}`
                                    : "Property Executive"}
                                </span>
                                <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 text-[9px] rounded font-semibold">
                                  Executive
                                </span>
                              </div>
                            )}

                            <ChatMediaBubble
                              message={msg}
                              isCurrentUser={isUser}
                              onOpenLightbox={(media) => setLightboxMedia(media)}
                            />

                            {/* Message Footer: Timestamp + Delivery/Read ticks */}
                            <div
                              className={`flex items-center justify-end gap-1 mt-1.5 text-[10px] ${
                                isUser ? "text-orange-200" : "text-gray-400"
                              }`}
                            >
                              <span>{formatTime(msg.created_at)}</span>
                              {isUser && (
                                <span className="ml-0.5">
                                  {msg.is_read ? (
                                    <span title="Read">
                                      <CheckCheck size={12} className="text-sky-300" />
                                    </span>
                                  ) : msg.is_delivered ? (
                                    <span title="Delivered">
                                      <CheckCheck size={12} className="text-orange-200" />
                                    </span>
                                  ) : (
                                    <span title="Sent">
                                      <Check size={12} className="text-orange-200" />
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })
              )}

              {/* Ephemeral Typing Indicator Bubble */}
              {isExecutiveTyping && (
                <div className="flex justify-start items-center gap-2 mt-2">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-xs px-3.5 py-2 shadow-2xs flex items-center gap-2 text-xs text-slate-600">
                    <span className="text-[11px] font-medium text-slate-700">
                      {selectedConversation.executive_first_name || "Executive"} is typing
                    </span>
                    <span className="flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" />
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Hidden File Input for Media Upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm,application/pdf"
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Draft Attachment Preview */}
            <ChatAttachmentDraftPreview
              file={selectedFile}
              previewUrl={previewUrl}
              onClear={clearAttachment}
              accentColor="orange"
            />

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-gray-200 bg-white flex items-center gap-2 shrink-0"
            >
              {/* Pin / Paperclip Attachment Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={sendingMessage}
                className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors cursor-pointer shrink-0"
                title="Attach photos or videos"
              >
                <Paperclip size={18} />
              </button>

              <input
                type="text"
                placeholder={
                  selectedFile
                    ? "Add an optional caption..."
                    : "Type your message here..."
                }
                value={inputText}
                onChange={handleInputChange}
                onBlur={() => {
                  const socket = getSocket();
                  if (socket && isTypingRef.current && selectedConversation) {
                    isTypingRef.current = false;
                    socket.emit("chat:typing_stop", { conversationId: selectedConversation.id });
                  }
                }}
                disabled={sendingMessage}
                className="flex-1 px-4 py-2 text-xs bg-gray-100 border border-transparent rounded-full focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={(!inputText.trim() && !selectedFile) || sendingMessage}
                className="p-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white rounded-full transition-colors shrink-0 shadow-sm cursor-pointer"
                title="Send Message"
              >
                {sendingMessage ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </form>
          </>
        ) : (
          /* Empty Chat View */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/40">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3 shadow-xs">
              <Building2 size={32} />
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1">
              Select a property conversation
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mb-4">
              Choose an inquiry from the list to view the full chat history and chat directly with your assigned property executive.
            </p>
            <Link
              to="/properties"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-700 shadow-sm transition-colors"
            >
              <Sparkles size={14} />
              Explore All Properties
            </Link>
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox Modal for Photos & Videos */}
      <ChatLightboxModal
        media={lightboxMedia}
        onClose={() => setLightboxMedia(null)}
      />
    </div>
  );
};
