import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Send,
  X,
  User,
  Minimize2,
  Maximize2,
  AlertCircle,
  RefreshCw,
  LogIn,
  Lock,
  Phone,
  ArrowLeft,
  Building2,
  ExternalLink,
  MessageSquare,
  Bot,
  CheckCheck,
  Check,
  Clock,
  Search,
  Calendar,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Info,
  Paperclip,
  Loader2,
} from "lucide-react";

import ChatbotLogo from "@/assets/images/RE.png";
import whatsapp_bg from "@/assets/images/chat_bg.png";
import { useAuth } from "@/contexts/AuthContext";
import {
  rexApi,
  RexChatMessageHistory,
  RexProfile,
  RexRequirements,
  RexPropertyCardData,
  RexPaginationInfo,
  RexVisitData,
} from "@/services/rexApi";
import {
  chatApi,
  PropertyConversation,
  PropertyChatMessage,
  generateUUID,
} from "@/services/chatApi";
import {
  ChatMediaBubble,
  ChatAttachmentDraftPreview,
  ChatLightboxModal,
} from "@/components/chat/ChatMediaAttachment";
import { playNotificationSound } from "@/utils/notificationSound";
import { connectSocket, getSocket } from "@/lib/socket";
import { REXPropertyCard } from "./REXPropertyCard";
import { REXPropertyCarousel } from "./REXPropertyCarousel";
import { REXVisitScheduler, REXVisitSchedulePayload } from "./REXVisitScheduler";
import { REXVisitConfirmedCard } from "./REXVisitConfirmedCard";
import { OpenPropertyChatOptions } from "@/services/propertyChatService";

/* ----------------------------- types & helpers ---------------------------- */
interface AIMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  suggestions?: string[];
  properties?: RexPropertyCardData[];
  pagination?: RexPaginationInfo;
  isError?: boolean;
  visitScheduler?: {
    property: RexPropertyCardData;
  };
  confirmedVisit?: RexVisitData;
  authPromptProperty?: RexPropertyCardData;
}

interface AIChatbotProps {
  isPropertyDetail?: boolean;
}

const REX_SESSION_STORAGE_KEY = "rex_session_uuid";

function cleanDisplayText(text?: string | null): string {
  if (!text) return "";
  return text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatRupeePrice(price?: number | string | null): string {
  if (!price) return "Price on Request";
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return String(price);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakh`;
  return `₹${num.toLocaleString("en-IN")}`;
}

function formatChatDateDivider(dateStr?: string | null): string {
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
}

function isSameDay(d1?: string | null, d2?: string | null): boolean {
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
}

const useWindowSize = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const handler = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    handler();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return size;
};

/* -------------------------------- component ------------------------------- */
export const AIChatbot: React.FC<AIChatbotProps> = ({ isPropertyDetail = false }) => {
  const { width } = useWindowSize();
  const isMobile = width > 0 ? width < 640 : false;
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Widget States
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<"human" | "ai">("human");
  const [activeView, setActiveView] = useState<"conversation" | "history">("history");

  // Property / Human Chat States
  const [conversations, setConversations] = useState<PropertyConversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [activeConversation, setActiveConversation] = useState<PropertyConversation | null>(null);
  const [messages, setMessages] = useState<PropertyChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [humanInput, setHumanInput] = useState("");
  const [isHumanSending, setIsHumanSending] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<{
    url: string;
    type: "image" | "video";
    title?: string;
  } | null>(null);
  const mediaInputRef = useRef<HTMLInputElement | null>(null);
  const [executiveTyping, setExecutiveTyping] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState("");
  const [authPromptData, setAuthPromptData] = useState<OpenPropertyChatOptions | null>(null);
  const [currentPropertyContext, setCurrentPropertyContext] = useState<OpenPropertyChatOptions | null>(null);

  // Dynamic Executive and Property Context derivation
  const executiveDisplayName = useMemo(() => {
    if (activeConversation) {
      const sal = activeConversation.executive_salutation ? `${activeConversation.executive_salutation} ` : "";
      const fn = activeConversation.executive_first_name || "";
      const ln = activeConversation.executive_last_name ? ` ${activeConversation.executive_last_name}` : "";
      const combined = `${sal}${fn}${ln}`.trim();
      if (combined && combined !== "Property Executive" && combined !== "Executive Not Assigned") {
        return combined;
      }
    }
    if (
      currentPropertyContext?.executiveName &&
      currentPropertyContext.executiveName !== "Property Executive" &&
      currentPropertyContext.executiveName !== "Executive Not Assigned"
    ) {
      return currentPropertyContext.executiveName;
    }
    if (activeConversation?.executive_first_name) {
      return `${activeConversation.executive_first_name} ${activeConversation.executive_last_name || ""}`.trim();
    }
    return "Property Executive";
  }, [activeConversation, currentPropertyContext]);

  const activePropertyTitle = useMemo(() => {
    return (
      activeConversation?.property_title ||
      currentPropertyContext?.propertyTitle ||
      "Residential Property"
    );
  }, [activeConversation, currentPropertyContext]);

  const activePropertyPrice = useMemo(() => {
    return (
      activeConversation?.property_price ||
      currentPropertyContext?.propertyPrice ||
      null
    );
  }, [activeConversation, currentPropertyContext]);

  const activePropertySlug = useMemo(() => {
    return (
      activeConversation?.property_slug ||
      currentPropertyContext?.propertySlug ||
      ""
    );
  }, [activeConversation, currentPropertyContext]);

  const activeExecutivePhone = useMemo(() => {
    return (
      activeConversation?.executive_phone ||
      currentPropertyContext?.executivePhone ||
      ""
    );
  }, [activeConversation, currentPropertyContext]);

  // AI Chat States
  const [aiInputMessage, setAiInputMessage] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [sessionUuid, setSessionUuid] = useState<string | null>(() => {
    return typeof window !== "undefined" ? localStorage.getItem(REX_SESSION_STORAGE_KEY) : null;
  });
  const [rexProfile, setRexProfile] = useState<RexProfile>({});
  const [rexRequirements, setRexRequirements] = useState<RexRequirements>({});

  const initialGreeting: AIMessage = useMemo(
    () => {
      if (isAuthenticated && user?.first_name) {
        return {
          id: "initial_welcome",
          text: `Welcome back, ${user.first_name}. How can I assist you with properties today?`,
          sender: "bot",
          timestamp: new Date(),
          suggestions: [
            "Buy Property",
            "Sell Property",
            "2 BHK in Wakad under 80 Lakhs",
            "Properties in Hinjewadi",
          ],
        };
      }
      return {
        id: "initial_welcome",
        text: "Welcome to Resale Expert Support. How can I assist you with properties today?",
        sender: "bot",
        timestamp: new Date(),
        suggestions: [
          "Buy Property",
          "Sell Property",
          "2 BHK in Wakad",
          "Properties in Pune",
        ],
      };
    },
    [isAuthenticated, user?.first_name]
  );

  const [aiMessages, setAiMessages] = useState<AIMessage[]>([initialGreeting]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const humanMessagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const humanInputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /* -------------------------- Guest UUID Resolution ------------------------- */
  const getGuestUuid = useCallback(() => {
    if (typeof window === "undefined") return null;
    let guestId = localStorage.getItem("app_guest_uuid");
    if (!guestId) {
      guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("app_guest_uuid", guestId);
    }
    return guestId;
  }, []);

  /* -------------------- Load User Property Conversations -------------------- */
  const loadUserConversations = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    setLoadingConversations(true);
    try {
      const res = await chatApi.getConversations({ limit: 50 });
      if (res.success && Array.isArray(res.conversations)) {
        setConversations(res.conversations);
      }
    } catch (err) {
      console.error("Failed to load user property conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserConversations();
    }
  }, [isAuthenticated, loadUserConversations]);

  /* -------------------- Open Specific Property Conversation ------------------ */
  const handleOpenPropertyConversation = useCallback(
    async (opts: OpenPropertyChatOptions) => {
      setIsOpen(true);
      setIsMinimized(false);
      setActiveTab("human");
      setCurrentPropertyContext(opts);

      if (!isAuthenticated) {
        setAuthPromptData(opts);
        setActiveView("conversation");
        return;
      }

      setAuthPromptData(null);
      setLoadingMessages(true);
      setActiveView("conversation");

      try {
        const res = await chatApi.createOrGetConversation({
          property_id: opts.propertyId,
          initial_message: opts.initialMessage || undefined,
        });

        if (res.success && res.conversation) {
          const conv = res.conversation;
          setActiveConversation(conv);

          // Zero unread count immediately in local list
          setConversations((prev) =>
            prev.map((c) => (Number(c.id) === Number(conv.id) ? { ...c, unread_user_count: 0 } : c))
          );

          const socket = getSocket();
          if (socket) {
            socket.emit("chat:join_room", { conversationId: conv.id });
            socket.emit("chat:read_receipt", { conversationId: conv.id });
          }

          // Load conversation messages
          const msgRes = await chatApi.getMessages(conv.id, { limit: 50 });
          if (msgRes.success && Array.isArray(msgRes.messages)) {
            setMessages(msgRes.messages);
          }

          // Mark as read
          await chatApi.markAsRead(conv.id).catch(() => {});
        }
      } catch (err) {
        console.error("Error opening property conversation:", err);
      } finally {
        setLoadingMessages(false);
      }
    },
    [isAuthenticated]
  );

  /* ---------------- Global Event Listener for Property Chat ----------------- */
  useEffect(() => {
    const handleGlobalOpenChat = (e: Event) => {
      const customEvent = e as CustomEvent<OpenPropertyChatOptions>;
      if (customEvent.detail && customEvent.detail.propertyId) {
        handleOpenPropertyConversation(customEvent.detail);
      }
    };

    window.addEventListener("open_property_chat", handleGlobalOpenChat);
    return () => window.removeEventListener("open_property_chat", handleGlobalOpenChat);
  }, [handleOpenPropertyConversation]);

  /* ---------------- Check URL Query Params (Post-Login Return) --------------- */
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const openChat = searchParams.get("openChat") || searchParams.get("autoChat");
    const openAiChat = searchParams.get("openAiChat");
    const propertyId = searchParams.get("propertyId");

    if (openAiChat === "true") {
      setIsOpen(true);
      setIsMinimized(false);
      setActiveTab("ai");
    } else if (openChat === "true" && propertyId && isAuthenticated) {
      handleOpenPropertyConversation({ propertyId });
    }
  }, [location.search, isAuthenticated, handleOpenPropertyConversation]);

  // Sync state refs for real-time socket events
  const activeConvRef = useRef<PropertyConversation | null>(null);
  activeConvRef.current = activeConversation;
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  const activeViewRef = useRef(activeView);
  activeViewRef.current = activeView;
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;

  /* --------------------------- Socket.IO Integration ------------------------ */
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const socket = connectSocket(user.id);
    if (!socket) return;

    const handleConnect = () => {
      const currentActive = activeConvRef.current;
      if (currentActive?.id) {
        socket.emit("chat:join_room", { conversationId: currentActive.id });
        socket.emit("chat:read_receipt", { conversationId: currentActive.id });
      }
    };

    if (activeConversation?.id) {
      socket.emit("chat:join_room", { conversationId: activeConversation.id });
      socket.emit("chat:read_receipt", { conversationId: activeConversation.id });
    }

    const onNewMessage = (raw: any) => {
      const msg: PropertyChatMessage = raw?.message || raw;
      const convId = Number(raw?.conversationId || msg?.conversation_id);
      if (!msg || !convId) return;

      const currentActive = activeConvRef.current;

      if (msg.sender_type === "executive" || msg.sender_type === "admin") {
        playNotificationSound();
      }

      const isCurrentlyOpen =
        isOpenRef.current &&
        activeTabRef.current === "human" &&
        activeViewRef.current === "conversation" &&
        currentActive &&
        Number(currentActive.id) === convId;

      if (currentActive && Number(currentActive.id) === convId) {
        setMessages((prev) => {
          if (
            prev.some(
              (m) =>
                m.id === msg.id ||
                (m.message_uuid && m.message_uuid === msg.message_uuid)
            )
          ) {
            return prev;
          }
          return [...prev, msg];
        });

        if (
          isCurrentlyOpen &&
          (msg.sender_type === "executive" || msg.sender_type === "admin")
        ) {
          chatApi.markAsRead(convId).catch(() => {});
          socket.emit("chat:read_receipt", { conversationId: convId });
        }
      }

      // Update conversation list item and unread count
      setConversations((prev) => {
        const index = prev.findIndex((c) => Number(c.id) === convId);
        if (index === -1) {
          loadUserConversations();
          return prev;
        }

        const convToUpdate = { ...prev[index] };
        convToUpdate.last_message_text = msg.message_text;
        convToUpdate.last_message_at = msg.created_at;

        if (isCurrentlyOpen) {
          convToUpdate.unread_user_count = 0;
        } else if (msg.sender_type === "executive" || msg.sender_type === "admin") {
          convToUpdate.unread_user_count = (convToUpdate.unread_user_count || 0) + 1;
        }

        const withoutUpdated = prev.filter((c) => Number(c.id) !== convId);
        return [convToUpdate, ...withoutUpdated];
      });
    };

    const onUnreadUpdate = (data: { conversationId: number; unreadCount: number }) => {
      const currentActive = activeConvRef.current;
      const isCurrentlyOpen =
        isOpenRef.current &&
        activeTabRef.current === "human" &&
        activeViewRef.current === "conversation" &&
        currentActive &&
        Number(currentActive.id) === Number(data.conversationId);

      setConversations((prev) =>
        prev.map((c) =>
          Number(c.id) === Number(data.conversationId)
            ? { ...c, unread_user_count: isCurrentlyOpen ? 0 : data.unreadCount }
            : c
        )
      );
    };

    const onTyping = (data: {
      conversationId: number;
      typing?: boolean;
      isTyping?: boolean;
      senderRole?: string;
    }) => {
      const currentActive = activeConvRef.current;
      if (currentActive && Number(currentActive.id) === Number(data.conversationId)) {
        const isTyping = typeof data.typing === "boolean" ? data.typing : !!data.isTyping;
        setExecutiveTyping(isTyping);
      }
    };

    const onMessagesRead = (data: { conversationId: number; readBy: number }) => {
      const currentActive = activeConvRef.current;
      if (currentActive && Number(currentActive.id) === Number(data.conversationId)) {
        setMessages((prev) =>
          prev.map((m) =>
            m.sender_id === Number(user.id) || m.sender_type === "user"
              ? { ...m, is_read: 1, is_delivered: 1 }
              : m
          )
        );
      }
    };

    socket.on("connect", handleConnect);
    socket.on("chat:new_message", onNewMessage);
    socket.on("chat:unread_count_update", onUnreadUpdate);
    socket.on("chat:typing", onTyping);
    socket.on("chat:user_typing", onTyping);
    socket.on("chat:messages_read", onMessagesRead);

    return () => {
      if (activeConversation?.id) {
        socket.emit("chat:leave_room", { conversationId: activeConversation.id });
      }
      socket.off("connect", handleConnect);
      socket.off("chat:new_message", onNewMessage);
      socket.off("chat:unread_count_update", onUnreadUpdate);
      socket.off("chat:typing", onTyping);
      socket.off("chat:user_typing", onTyping);
      socket.off("chat:messages_read", onMessagesRead);
    };
  }, [isAuthenticated, user?.id, activeConversation?.id, loadUserConversations]);

  /* ----------------------- Send Human Property Message ---------------------- */
  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("File size exceeds 50MB limit. Please select a smaller photo or video.");
      return;
    }

    setSelectedMedia(file);
    if (file.type.startsWith("image/")) {
      setMediaPreviewUrl(URL.createObjectURL(file));
    } else {
      setMediaPreviewUrl(null);
    }
  };

  const clearMediaAttachment = () => {
    if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
    setSelectedMedia(null);
    setMediaPreviewUrl(null);
    if (mediaInputRef.current) mediaInputRef.current.value = "";
  };

  const handleSendHumanMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = humanInput.trim();
    const mediaToSend = selectedMedia;
    if ((!text && !mediaToSend) || !activeConversation || isHumanSending || !user?.id) return;

    const tempUuid = generateUUID();
    const mimeType = mediaToSend?.type || "";
    const isImage = mimeType.startsWith("image/");
    const isVideo = mimeType.startsWith("video/");

    const tempMsg: PropertyChatMessage = {
      id: Date.now(),
      message_uuid: tempUuid,
      conversation_id: Number(activeConversation.id),
      sender_id: Number(user.id),
      sender_type: "user",
      message_type: isImage ? "image" : isVideo ? "video" : mediaToSend ? "doc" : "text",
      message_text: text || (isImage ? "📷 Photo" : isVideo ? "🎥 Video" : mediaToSend?.name || ""),
      metadata_json: mediaToSend
        ? {
            file_url: mediaPreviewUrl || "",
            file_name: mediaToSend.name,
            file_size: mediaToSend.size,
            mime_type: mediaToSend.type,
            caption: text || undefined,
          }
        : null,
      is_delivered: 0,
      is_read: 0,
      created_at: new Date().toISOString(),
      sender_first_name: user.first_name,
      sender_last_name: user.last_name,
    };

    setMessages((prev) => [...prev, tempMsg]);
    setHumanInput("");
    clearMediaAttachment();
    setIsHumanSending(true);

    try {
      let res;
      if (mediaToSend) {
        res = await chatApi.sendMedia(activeConversation.id, mediaToSend, text, tempUuid);
      } else {
        res = await chatApi.sendMessage(activeConversation.id, {
          message_text: text,
          message_uuid: tempUuid,
        });
      }

      if (res.success && res.message) {
        setMessages((prev) =>
          prev.map((m) => (m.message_uuid === tempUuid ? res.message : m))
        );
      }
      loadUserConversations();
    } catch (err) {
      console.error("Failed to send message/media:", err);
    } finally {
      setIsHumanSending(false);
    }
  };

  const handleHumanTyping = (val: string) => {
    setHumanInput(val);
    const socket = getSocket();
    if (socket && activeConversation?.id) {
      socket.emit("chat:typing_start", { conversationId: activeConversation.id });
      socket.emit("chat:typing", {
        conversationId: activeConversation.id,
        isTyping: true,
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("chat:typing_stop", { conversationId: activeConversation.id });
        socket.emit("chat:typing", {
          conversationId: activeConversation.id,
          isTyping: false,
        });
      }, 2000);
    }
  };

  /* ----------------------- Load Session on Initialization -------------------- */
  useEffect(() => {
    let isMounted = true;
    const loadExistingSession = async () => {
      const storedSession = localStorage.getItem(REX_SESSION_STORAGE_KEY);
      if (!storedSession) return;

      try {
        const response = await rexApi.getSession(storedSession);
        if (isMounted && response.success && response.session) {
          const session = response.session;
          setRexProfile(session.profile || {});
          setRexRequirements(session.requirements || {});

          if (Array.isArray(session.history) && session.history.length > 0) {
            const parsedMsgs: AIMessage[] = session.history.map((h: RexChatMessageHistory) => ({
              id: h.id || `hist_${Math.random()}`,
              text: h.text,
              sender: h.sender === "user" ? "user" : "bot",
              timestamp: h.timestamp ? new Date(h.timestamp) : new Date(),
              suggestions: h.suggestions || undefined,
              properties: h.properties && h.properties.length > 0 ? h.properties : undefined,
            }));
            setAiMessages(parsedMsgs);
          }
          if (session.session_uuid) setSessionUuid(session.session_uuid);
        }
      } catch (err) {
        console.warn("Could not reload active REX session:", err);
      }
    };

    loadExistingSession();
    return () => {
      isMounted = false;
    };
  }, []);

  /* ---------------------------- Auto Scroll Handlers ------------------------ */
  useEffect(() => {
    if (isOpen && !isMinimized) {
      if (activeTab === "human") {
        humanMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      } else {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, aiMessages, isMinimized, isOpen, isAiTyping, activeTab, executiveTyping]);

  /* ---------------------- Post-Login Pending Action Resume ------------------- */
  useEffect(() => {
    if (isAuthenticated && typeof window !== "undefined") {
      const pendingJson = sessionStorage.getItem("rex_pending_interested");
      if (pendingJson) {
        try {
          const pendingProp: RexPropertyCardData = JSON.parse(pendingJson);
          sessionStorage.removeItem("rex_pending_interested");
          setIsOpen(true);
          setIsMinimized(false);
          setActiveTab("ai");
          const scheduleMsg: AIMessage = {
            id: `sched_post_login_${Date.now()}`,
            text: `Welcome back, ${user?.first_name || "there"}! Let's schedule your site visit for ${pendingProp.title}.`,
            sender: "bot",
            timestamp: new Date(),
            visitScheduler: { property: pendingProp },
          };
          setAiMessages((prev) => [...prev, scheduleMsg]);
        } catch (e) {
          console.warn("Could not resume pending interested property:", e);
        }
      }
    }
  }, [isAuthenticated, user?.first_name]);

  /* ------------------------- Interactive REX Actions ------------------------ */
  const [isLoadingMoreProperties, setIsLoadingMoreProperties] = useState(false);
  const [isBookingVisit, setIsBookingVisit] = useState(false);

  const handlePropertyInterested = (property: RexPropertyCardData) => {
    if (!isAuthenticated) {
      sessionStorage.setItem("rex_pending_interested", JSON.stringify(property));
      const authMsg: AIMessage = {
        id: `auth_req_${Date.now()}`,
        text: `To schedule a verified site visit and connect with our dedicated executive for ${property.title}, please log in or create a quick account.`,
        sender: "bot",
        timestamp: new Date(),
        authPromptProperty: property,
      };
      setAiMessages((prev) => [...prev, authMsg]);
      return;
    }

    const scheduleMsg: AIMessage = {
      id: `sched_${Date.now()}`,
      text: `Let's schedule a site visit for ${property.title} (${formatRupeePrice(property.price)}).`,
      sender: "bot",
      timestamp: new Date(),
      visitScheduler: { property },
    };
    setAiMessages((prev) => [...prev, scheduleMsg]);
  };

  const handlePropertyNotInterested = (_property: RexPropertyCardData) => {
    const notInterestedMsg: AIMessage = {
      id: `not_int_${Date.now()}`,
      text: `Understood. Would you like to check properties in a different budget or locality?`,
      sender: "bot",
      timestamp: new Date(),
      suggestions: [
        "Different locality",
        "Change budget",
        "2 BHK in Wakad under 80 Lakhs",
        "Top projects in Pune",
      ],
    };
    setAiMessages((prev) => [...prev, notInterestedMsg]);
  };

  const handleLoadMoreProperties = async (msgId: string, currentPagination?: RexPaginationInfo) => {
    if (!currentPagination || !currentPagination.hasMore || isLoadingMoreProperties) return;
    setIsLoadingMoreProperties(true);

    try {
      const nextOffset = (currentPagination.offset || 0) + (currentPagination.limit || 5);
      const res = await rexApi.performAction({
        action: "load_more",
        payload: {
          offset: nextOffset,
          limit: 5,
        },
      });

      if (res.success && Array.isArray(res.properties) && res.properties.length > 0) {
        setAiMessages((prev) =>
          prev.map((m) => {
            if (m.id === msgId && m.properties) {
              return {
                ...m,
                properties: [...m.properties, ...res.properties],
                pagination: res.pagination || {
                  ...currentPagination,
                  offset: nextOffset,
                  hasMore: (currentPagination.total || 0) > nextOffset + res.properties.length,
                  remaining: Math.max(0, (currentPagination.total || 0) - (nextOffset + res.properties.length)),
                },
              };
            }
            return m;
          })
        );
      }
    } catch (err) {
      console.error("Failed to load more properties:", err);
    } finally {
      setIsLoadingMoreProperties(false);
    }
  };

  const handleConfirmVisitSchedule = async (
    property: RexPropertyCardData,
    payload: REXVisitSchedulePayload
  ) => {
    if (!isAuthenticated) {
      sessionStorage.setItem("rex_pending_interested", JSON.stringify(property));
      const authMsg: AIMessage = {
        id: `auth_req_${Date.now()}`,
        text: `Please log in to confirm your site visit for ${property.title}.`,
        sender: "bot",
        timestamp: new Date(),
        authPromptProperty: property,
      };
      setAiMessages((prev) => [...prev, authMsg]);
      return;
    }

    if (isBookingVisit) return;
    setIsBookingVisit(true);

    try {
      const guestName = payload.guest_name || (user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : (rexProfile?.name || "Client"));
      const guestPhone = payload.guest_phone || user?.phone || rexProfile?.phone || undefined;

      const res = await rexApi.scheduleVisit({
        property_id: property.id,
        visit_date: payload.date,
        visit_time: payload.time,
        shift: payload.shift,
        guest_name: guestName,
        guest_phone: guestPhone,
        session_uuid: sessionUuid,
      });

      if (res.success && res.visit) {
        const confirmedMsg: AIMessage = {
          id: `conf_${Date.now()}`,
          text: `Your site visit for ${property.title} has been confirmed for ${payload.formattedDisplay}.`,
          sender: "bot",
          timestamp: new Date(),
          confirmedVisit: res.visit,
          suggestions: ["Explore More Properties", "Chat with Executive"],
        };

        setAiMessages((prev) => [...prev, confirmedMsg]);
      } else {
        const errVisitMsg: AIMessage = {
          id: `err_visit_${Date.now()}`,
          text:
            res.message ||
            "Could not schedule the visit at this moment. Please try again or chat with our executive directly.",
          sender: "bot",
          timestamp: new Date(),
          suggestions: ["Try scheduling again", "Chat with Executive"],
          isError: true,
        };
        setAiMessages((prev) => [...prev, errVisitMsg]);
      }
    } catch (err: any) {
      console.error("Failed to schedule visit:", err);
      const errVisitMsg: AIMessage = {
        id: `err_visit_${Date.now()}`,
        text: "Connection issue while scheduling your visit. Please try again.",
        sender: "bot",
        timestamp: new Date(),
        isError: true,
      };
      setAiMessages((prev) => [...prev, errVisitMsg]);
    } finally {
      setIsBookingVisit(false);
    }
  };

  /* ----------------------------- Send AI Message ---------------------------- */
  const handleSendAiMessage = async (textToSend?: string) => {
    const text = (textToSend || aiInputMessage).trim();
    if (!text || isAiTyping) return;

    const userMsgId = `u_${Date.now()}`;
    const newUserMessage: AIMessage = {
      id: userMsgId,
      text,
      sender: "user",
      timestamp: new Date(),
    };

    setAiMessages((prev) => [...prev, newUserMessage]);
    setAiInputMessage("");
    setIsAiTyping(true);

    try {
      // Direct REX AI Message Processing
      const guestUuid = getGuestUuid();
      const response = await rexApi.sendMessage({
        message: text,
        session_uuid: sessionUuid,
        guest_uuid: guestUuid,
      });

      if (response.success) {
        if (response.session_uuid && response.session_uuid !== sessionUuid) {
          setSessionUuid(response.session_uuid);
          localStorage.setItem(REX_SESSION_STORAGE_KEY, response.session_uuid);
        }

        if (response.profile) setRexProfile(response.profile);
        if (response.requirements) setRexRequirements(response.requirements);

        const botMsg: AIMessage = {
          id: `r_${Date.now()}`,
          text: response.reply,
          sender: "bot",
          timestamp: new Date(),
          suggestions: response.suggestions,
          properties:
            response.properties && response.properties.length > 0
              ? response.properties
              : undefined,
          pagination: response.pagination || undefined,
        };

        setAiMessages((prev) => [...prev, botMsg]);
      } else {
        const errorMsg: AIMessage = {
          id: `err_${Date.now()}`,
          text: response.message || "I'm having trouble connecting right now. Please try again.",
          sender: "bot",
          timestamp: new Date(),
          isError: true,
          suggestions: ["Try again", "Properties under ₹80L", "Find 2 BHK in Wakad"],
        };
        setAiMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      console.error("REX chat request failed:", err);
      const errorMsg: AIMessage = {
        id: `err_${Date.now()}`,
        text: "Sorry, I ran into a connection issue. Please check your internet or try again in a moment.",
        sender: "bot",
        timestamp: new Date(),
        isError: true,
        suggestions: ["Try again", "Find 2 BHK in Wakad", "Properties in Hinjewadi"],
      };
      setAiMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAiTyping(false);
    }
  };

  /* ------------------------- Filtered Conversations ------------------------- */
  const filteredConversations = useMemo(() => {
    if (!historySearchQuery.trim()) return conversations;
    const q = historySearchQuery.toLowerCase().trim();
    return conversations.filter(
      (c) =>
        (c.property_title && c.property_title.toLowerCase().includes(q)) ||
        (c.property_location && c.property_location.toLowerCase().includes(q)) ||
        (c.executive_first_name && c.executive_first_name.toLowerCase().includes(q))
    );
  }, [conversations, historySearchQuery]);

  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((acc, c) => {
      const isCurrentlyOpen =
        isOpen &&
        activeTab === "human" &&
        activeView === "conversation" &&
        activeConversation &&
        Number(activeConversation.id) === Number(c.id);

      if (isCurrentlyOpen) return acc;
      return acc + (c.unread_user_count || 0);
    }, 0);
  }, [conversations, isOpen, activeTab, activeView, activeConversation]);

  /* -------------------------------- Rendering ------------------------------- */
  return (
    <aside aria-label="Customer Support and Property Inquiry Assistant">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
              if (activeConversation) {
                setActiveView("conversation");
              } else if (conversations.length > 0) {
                setActiveView("history");
              } else {
                setActiveTab("ai");
              }
            }}
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-slate-900 text-white shadow-[0_8px_30px_rgba(0,0,0,0.22)] hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/20 cursor-pointer"
            title="Chat with Property Executive & REX Assistant"
          >
            <MessageSquare size={26} className="text-white drop-shadow-sm group-hover:scale-110 transition-transform duration-200" />

            {totalUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-red-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md border-2 border-white">
                {totalUnreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Main Chat Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          className={`fixed z-50 flex flex-col bg-white shadow-[0_12px_40px_rgba(0,0,0,0.14)] border border-slate-200 transition-all duration-200 overflow-hidden ${
            isMobile
              ? "inset-x-2 bottom-2 top-14 rounded-2xl"
              : isMinimized
              ? "bottom-6 right-6 w-80 h-14 rounded-2xl"
              : "bottom-6 right-6 w-[400px] h-[620px] max-h-[85vh] rounded-2xl"
          }`}
        >
          {/* Header */}
          <div className="bg-white border-b border-slate-200 text-slate-900 px-4 py-3 flex items-center justify-between shrink-0 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              {activeTab === "human" && activeView === "conversation" && (
                <button
                  onClick={() => setActiveView("history")}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors mr-0.5 cursor-pointer"
                  title="Back to Inquiries List"
                >
                  <ArrowLeft size={17} />
                </button>
              )}

              {activeTab === "human" ? (
                activeView === "conversation" ? (
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                      {activeConversation?.executive_avatar ? (
                        <img
                          src={activeConversation.executive_avatar}
                          alt="Executive"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-slate-800 font-bold text-[13px]">
                          {executiveDisplayName[0] ? executiveDisplayName[0].toUpperCase() : "E"}
                        </span>
                      )}
                      <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-white rounded-full" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-semibold text-[13px] leading-tight text-slate-900 truncate">
                        {executiveDisplayName}
                      </h2>
                      <p className="text-[11px] text-emerald-600 font-medium leading-tight truncate">
                        {executiveTyping ? "typing..." : "Relationship Executive • Online"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shadow-2xs">
                      <Building2 size={16} />
                    </div>
                    <div>
                      <h2 className="font-semibold text-[13px] leading-tight text-slate-900">
                        Property Inquiries
                      </h2>
                      <p className="text-[11px] text-slate-500 font-medium">Dedicated Relationship Desk</p>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center overflow-hidden shadow-2xs">
                    <img src={ChatbotLogo} alt="REX AI" className="w-5 h-5 object-contain" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[13px] leading-tight text-slate-900">REX Support</h2>
                    <p className="text-[11px] text-slate-500 font-medium">Real Estate Assistant • 24/7</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0 text-slate-500">
              {activeTab === "human" && activeExecutivePhone && (
                <a
                  href={`tel:${activeExecutivePhone}`}
                  className="p-1.5 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors"
                  title="Call Executive"
                >
                  <Phone size={15} />
                </a>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Sticky Property Context Banner */}
              {activeTab === "human" && activeView === "conversation" && (activeConversation || currentPropertyContext) && (
                <div className="bg-slate-50 text-slate-800 px-3.5 py-2 flex items-center justify-between border-b border-slate-200 text-[12px] shrink-0 shadow-2xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Building2 size={14} className="text-slate-500 shrink-0" />
                    <div className="truncate font-medium">
                      <span>{activePropertyTitle}</span>
                      {activePropertyPrice && (
                        <span className="text-slate-900 font-bold ml-1.5">
                          • ₹{Number(activePropertyPrice).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                  {activePropertySlug && (
                    <a
                      href={`/properties/${activePropertySlug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[11px] bg-slate-200/80 hover:bg-slate-300 text-slate-800 font-semibold px-2 py-0.5 rounded transition-colors shrink-0 ml-2"
                    >
                      <span>VIEW</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              )}

              {/* Guest Authentication Prompt Overlay */}
              {authPromptData && !isAuthenticated && (
                <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-white">
                  <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center mb-3 shadow-2xs">
                    <Building2 size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-[15px] mb-1">
                    Connect with Property Executive
                  </h3>
                  <p className="text-slate-500 text-[12px] mb-5 leading-relaxed max-w-xs">
                    Please log in or sign up to start a direct verified chat with the assigned executive for{" "}
                    <span className="font-semibold text-slate-700">
                      {authPromptData.propertyTitle || "this property"}
                    </span>
                    .
                  </p>
                  <button
                    onClick={() => {
                      const returnUrl = `/properties/${authPromptData.propertySlug || authPromptData.propertyId}?openChat=true&propertyId=${authPromptData.propertyId}`;
                      navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`);
                    }}
                    className="w-full max-w-xs py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer text-xs"
                  >
                    <LogIn size={15} />
                    <span>Log In to Start Chat</span>
                  </button>
                  <button
                    onClick={() => {
                      setAuthPromptData(null);
                      setActiveTab("ai");
                    }}
                    className="mt-3 text-[12px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                  >
                    Or continue with REX Assistant as Guest
                  </button>
                </div>
              )}

              {/* Main Content Area */}
              {(!authPromptData || isAuthenticated) && (
                <div className="flex-1 flex flex-col min-h-0 relative">
                  {/* TAB 1: HUMAN PROPERTY CONVERSATION */}
                  {activeTab === "human" && (
                    <>
                      {activeView === "history" ? (
                        /* Inquiries / Conversations List */
                        <div className="flex-1 flex flex-col bg-white overflow-hidden">
                          <div className="p-3 border-b border-slate-100 bg-slate-50/70 shrink-0">
                            <div className="relative">
                              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                              <input
                                type="text"
                                value={historySearchQuery}
                                onChange={(e) => setHistorySearchQuery(e.target.value)}
                                placeholder="Search property inquiries..."
                                className="w-full pl-9 pr-3 py-1.5 text-[12px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400"
                              />
                            </div>
                          </div>

                          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1">
                            {loadingConversations ? (
                              <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-[13px] gap-2">
                                <RefreshCw className="w-5 h-5 animate-spin text-slate-600" />
                                <span>Loading your property inquiries...</span>
                              </div>
                            ) : filteredConversations.length > 0 ? (
                              filteredConversations.map((conv) => (
                                <button
                                  key={conv.id}
                                  onClick={() => {
                                    setActiveConversation(conv);
                                    setActiveView("conversation");
                                    setLoadingMessages(true);

                                    setConversations((prev) =>
                                      prev.map((c) =>
                                        Number(c.id) === Number(conv.id)
                                          ? { ...c, unread_user_count: 0 }
                                          : c
                                      )
                                    );

                                    const socket = getSocket();
                                    if (socket) {
                                      socket.emit("chat:join_room", { conversationId: conv.id });
                                      socket.emit("chat:read_receipt", { conversationId: conv.id });
                                    }

                                    chatApi
                                      .getMessages(conv.id, { limit: 50 })
                                      .then((r) => {
                                        if (r.success && Array.isArray(r.messages)) setMessages(r.messages);
                                      })
                                      .finally(() => setLoadingMessages(false));
                                    chatApi.markAsRead(conv.id).catch(() => {});
                                  }}
                                  className="w-full p-3 flex items-start gap-3 hover:bg-slate-50 transition-colors text-left rounded-lg cursor-pointer"
                                >
                                  <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                                    {conv.property_photos && conv.property_photos[0] ? (
                                      <img
                                        src={conv.property_photos[0]}
                                        alt="Property"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Building2 size={18} className="text-slate-600" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-semibold text-[13px] text-slate-900 truncate">
                                        {conv.property_title || "Property Inquiry"}
                                      </h4>
                                      <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                                        {conv.last_message_at
                                          ? new Date(conv.last_message_at).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })
                                          : ""}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-600 font-medium">
                                      {conv.executive_first_name
                                        ? `${conv.executive_salutation ? conv.executive_salutation + " " : ""}${conv.executive_first_name} ${conv.executive_last_name || ""}`.trim()
                                        : "Property Executive"} •{" "}
                                      {conv.property_location || "Pune"}
                                    </p>
                                    <p className="text-[12px] text-slate-500 truncate mt-0.5">
                                      {conv.last_message_text || "Inquiry initiated with executive"}
                                    </p>
                                  </div>
                                  {conv.unread_user_count > 0 && (
                                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                      {conv.unread_user_count}
                                    </span>
                                  )}
                                </button>
                              ))
                            ) : (
                              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                                <Building2 size={32} className="text-slate-300 mb-2" />
                                <p className="font-semibold text-slate-700 text-[13px]">
                                  No Property Inquiries Yet
                                </p>
                                <p className="text-[12px] text-slate-400 mt-1 max-w-xs">
                                  Browse properties and click &ldquo;Message&rdquo; to start a direct chat with the assigned executive.
                                </p>
                                <button
                                  onClick={() => setActiveTab("ai")}
                                  className="mt-4 px-3.5 py-1.5 bg-slate-100 text-slate-800 font-semibold rounded-lg text-[12px] hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                                >
                                  <span>Search with REX Assistant</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Active Conversation Screen */
                        <div
                          className="flex-1 flex flex-col min-h-0 relative"
                          style={{
                            backgroundImage: `url(${whatsapp_bg})`,
                            backgroundColor: "#efeae2",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                          }}
                        >
                          {/* Message Stream */}
                          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2.5">
                            {/* Executive Joined Notice */}
                            <div className="flex justify-center my-1">
                              <span className="text-[11px] text-slate-500 bg-white px-3 py-0.5 rounded-full border border-slate-200 text-center font-medium shadow-2xs">
                                {executiveDisplayName} joined the chat
                              </span>
                            </div>

                            {/* Welcome Executive Bubble */}
                            <div className="flex items-end gap-1.5 justify-start">
                              <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mb-1">
                                {executiveDisplayName[0] ? executiveDisplayName[0].toUpperCase() : "E"}
                              </div>
                              <div className="max-w-[80%] bg-white rounded-2xl rounded-bl-sm p-3 shadow-2xs border border-slate-200/90 text-[13px] text-slate-800">
                                <p className="text-[11px] font-bold text-slate-900 mb-0.5">
                                  {executiveDisplayName}
                                </p>
                                <p>
                                  Hello {user?.first_name || "there"}. I am your dedicated Property Executive
                                  for this property. How can I assist you with site visits, floor plans, or pricing?
                                </p>
                                <span className="block text-[10px] text-slate-400 text-right mt-1 font-medium">
                                  Verified Executive
                                </span>
                              </div>
                            </div>

                            {/* Chat Messages */}
                            {loadingMessages ? (
                              <div className="flex justify-center py-4">
                                <RefreshCw className="w-4 h-4 animate-spin text-slate-600" />
                              </div>
                            ) : (
                              messages.map((m, idx) => {
                                const isUser = m.sender_id === user?.id || m.sender_type === "user";
                                const prevMsg = idx > 0 ? messages[idx - 1] : null;
                                const showDateDivider = !prevMsg || !isSameDay(m.created_at, prevMsg.created_at);
                                const dateDividerText = formatChatDateDivider(m.created_at);

                                return (
                                  <React.Fragment key={m.id || m.message_uuid || idx}>
                                    {showDateDivider && (
                                      <div className="flex justify-center my-2.5 sticky top-1 z-10">
                                        <span className="px-3 py-0.5 bg-white shadow-2xs border border-slate-200 text-slate-500 text-[10px] font-semibold rounded-full tracking-wider uppercase">
                                          {dateDividerText}
                                        </span>
                                      </div>
                                    )}

                                    <div
                                      className={`flex items-end gap-1.5 ${
                                        isUser ? "justify-end" : "justify-start"
                                      }`}
                                    >
                                      {!isUser && (
                                        <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mb-1">
                                          {m.sender_first_name?.[0] || executiveDisplayName[0] || "E"}
                                        </div>
                                      )}
                                      <div
                                        className={`max-w-[82%] rounded-2xl p-2.5 shadow-2xs text-[13px] leading-relaxed break-words ${
                                          isUser
                                            ? "bg-slate-900 text-white rounded-br-sm"
                                            : "bg-white text-slate-800 rounded-bl-sm border border-slate-200/90"
                                        }`}
                                      >
                                        {!isUser && (
                                          <p className="text-[11px] font-bold text-slate-900 mb-0.5">
                                            {m.sender_first_name
                                              ? `${m.sender_first_name} ${m.sender_last_name || ""}`.trim()
                                              : executiveDisplayName}
                                          </p>
                                        )}
                                        <ChatMediaBubble
                                          message={m}
                                          isCurrentUser={isUser}
                                          onOpenLightbox={(media) => setLightboxMedia(media)}
                                        />
                                        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                                          <span>
                                            {new Date(m.created_at).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </span>
                                          {isUser && (
                                            m.is_read ? (
                                              <CheckCheck size={13} className="text-emerald-400 inline" />
                                            ) : (
                                              <Check size={13} className="text-slate-400 inline" />
                                            )
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </React.Fragment>
                                );
                              })
                            )}

                            {/* Typing indicator */}
                            {executiveTyping && (
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-white px-3 py-1 rounded-full w-fit border border-slate-200">
                                <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce" />
                                <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                                <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                                <span>{executiveDisplayName} is typing...</span>
                              </div>
                            )}

                            <div ref={humanMessagesEndRef} />
                          </div>

                          {/* Quick Action Buttons */}
                          <div className="px-3 py-1.5 bg-white border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
                            <button
                              onClick={() => setHumanInput("I would like to schedule a site visit.")}
                              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <Calendar size={12} />
                              <span>Schedule Visit</span>
                            </button>
                            <button
                              onClick={() => setHumanInput("What is the final negotiable price for this property?")}
                              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors shadow-2xs cursor-pointer"
                            >
                              <span>Ask Price Details</span>
                            </button>
                            <button
                              onClick={() => setHumanInput("I have visited this property. Please update my site visit status.")}
                              className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors shadow-2xs cursor-pointer"
                            >
                              <span>Visited property</span>
                            </button>
                            <button
                              onClick={() => setHumanInput("I have not visited this property yet. Please help me reschedule.")}
                              className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors shadow-2xs cursor-pointer"
                            >
                              <span>Reschedule visit</span>
                            </button>
                            {activeExecutivePhone && (
                              <a
                                href={`tel:${activeExecutivePhone}`}
                                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1 shadow-2xs"
                              >
                                <Phone size={12} />
                                <span>Call Executive</span>
                              </a>
                            )}
                          </div>

                          {/* Hidden File Input for Media Upload */}
                          <input
                            ref={mediaInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm,application/pdf"
                            className="hidden"
                            onChange={handleMediaSelect}
                          />

                          {/* Draft Attachment Preview */}
                          <ChatAttachmentDraftPreview
                            file={selectedMedia}
                            previewUrl={mediaPreviewUrl}
                            onClear={clearMediaAttachment}
                            accentColor="slate"
                          />

                          {/* Input Form with Pin Button */}
                          <form
                            onSubmit={handleSendHumanMessage}
                            className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-1.5 shrink-0"
                          >
                            <button
                              type="button"
                              onClick={() => mediaInputRef.current?.click()}
                              disabled={isHumanSending}
                              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer shrink-0"
                              title="Attach photos or videos"
                            >
                              <Paperclip size={17} />
                            </button>

                            <input
                              ref={humanInputRef}
                              type="text"
                              value={humanInput}
                              onChange={(e) => handleHumanTyping(e.target.value)}
                              placeholder={
                                selectedMedia
                                  ? "Add an optional caption..."
                                  : "Type your message here..."
                              }
                              className="flex-1 px-4 py-2 text-[13px] text-slate-900 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white placeholder:text-slate-400 font-medium transition-all"
                            />
                            <button
                              type="submit"
                              disabled={(!humanInput.trim() && !selectedMedia) || isHumanSending}
                              className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center transition-all shadow-2xs shrink-0 active:scale-95 cursor-pointer"
                            >
                              {isHumanSending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                            </button>
                          </form>
                        </div>
                      )}
                    </>
                  )}

                  {/* TAB 2: REX AI ADVISOR MODE */}
                  {activeTab === "ai" && (
                    <div
                      className="flex-1 flex flex-col min-h-0 relative"
                      style={{
                        backgroundImage: `url(${whatsapp_bg})`,
                        backgroundColor: "#efeae2",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }}
                    >
                      <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {aiMessages.map((m) => {
                          const isUser = m.sender === "user";
                          return (
                            <div
                              key={m.id}
                              className={`flex items-start gap-2 ${
                                isUser ? "justify-end" : "justify-start"
                              }`}
                            >
                              {!isUser && (
                                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden shadow-2xs">
                                  <img
                                    src={ChatbotLogo}
                                    alt="REX"
                                    className="w-4 h-4 object-contain"
                                  />
                                </div>
                              )}
                              <div
                                className={`max-w-[88%] rounded-2xl p-3 text-[13px] leading-relaxed shadow-2xs ${
                                  isUser
                                    ? "bg-[#d9fdd3] text-slate-900 border border-[#c4eec0] rounded-tr-sm"
                                    : m.isError
                                    ? "bg-rose-50 border border-rose-200 text-rose-700 rounded-tl-sm"
                                    : "bg-white border border-slate-200/90 text-slate-800 rounded-tl-sm"
                                }`}
                              >
                                <p className="whitespace-pre-wrap">{cleanDisplayText(m.text)}</p>

                                {/* 5-Property Paginated Carousel */}
                                {m.properties && m.properties.length > 0 && (
                                  <div className="mt-3 w-full">
                                    <REXPropertyCarousel
                                      properties={m.properties}
                                      pagination={m.pagination}
                                      onInterested={(prop) => handlePropertyInterested(prop)}
                                      onNotInterested={(prop) => handlePropertyNotInterested(prop)}
                                      onLoadMore={() => handleLoadMoreProperties(m.id, m.pagination)}
                                      loadingMore={isLoadingMoreProperties}
                                    />
                                  </div>
                                )}

                                {/* Interactive Visit Scheduler */}
                                {m.visitScheduler && (
                                  <div className="mt-3 w-full">
                                    <REXVisitScheduler
                                      propertyTitle={m.visitScheduler.property.title}
                                      onConfirm={(payload) =>
                                        handleConfirmVisitSchedule(m.visitScheduler!.property, payload)
                                      }
                                      onAskQuery={() => {
                                        handleOpenPropertyConversation({
                                          propertyId: m.visitScheduler!.property.id,
                                          propertyTitle: m.visitScheduler!.property.title,
                                          propertySlug: m.visitScheduler!.property.slug,
                                          propertyPrice: m.visitScheduler!.property.price,
                                        });
                                      }}
                                      loading={isBookingVisit}
                                    />
                                  </div>
                                )}

                                {/* Visit Confirmed Success Card */}
                                {m.confirmedVisit && (
                                  <div className="mt-3 w-full">
                                    <REXVisitConfirmedCard
                                      visitData={m.confirmedVisit}
                                      onOpenChatDesk={(propId) => {
                                        handleOpenPropertyConversation({
                                          propertyId: propId,
                                          propertyTitle: m.confirmedVisit?.property_title,
                                          propertyPrice: m.confirmedVisit?.property_price,
                                        });
                                      }}
                                      onBrowseMore={() => {
                                        handleSendAiMessage("Show more properties in Pune");
                                      }}
                                    />
                                  </div>
                                )}

                                {/* Auth Prompt Box for Unauthenticated Guests */}
                                {m.authPromptProperty && !isAuthenticated && (
                                  <div className="mt-3 p-3.5 bg-gradient-to-br from-slate-50 to-orange-50/40 rounded-xl border border-orange-200/70 text-center space-y-2.5">
                                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-800">
                                      <Lock size={14} className="text-[#e87722]" />
                                      <span>Login Required to Book Site Visit</span>
                                    </div>
                                    <p className="text-[11px] text-slate-600">
                                      Log in to choose your visit slot, get dedicated executive assistance, and receive instant booking confirmation.
                                    </p>
                                    <button
                                      onClick={() => {
                                        const cleanSearch = location.search ? `${location.search}&openAiChat=true` : `?openAiChat=true`;
                                        const returnUrl = `${location.pathname}${cleanSearch}`;
                                        navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`);
                                      }}
                                      className="w-full py-2.5 px-3 bg-[#0f2b3d] hover:bg-[#163e58] text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                                    >
                                      <LogIn size={14} />
                                      <span>Log In / Sign Up to Continue</span>
                                    </button>
                                  </div>
                                )}

                                {/* Suggestions Chips: Only show on initial greeting, not every turn */}
                                {m.id === "initial_welcome" && m.suggestions && m.suggestions.length > 0 && (
                                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                                    {m.suggestions.map((sug, i) => (
                                      <button
                                        key={i}
                                        onClick={() => {
                                          if (sug === "Chat with Executive" && m.confirmedVisit?.property_id) {
                                            handleOpenPropertyConversation({
                                              propertyId: m.confirmedVisit.property_id,
                                              propertyTitle: m.confirmedVisit.property_title,
                                              propertyPrice: m.confirmedVisit.property_price,
                                            });
                                          } else if (sug === "Log In to Continue" && m.authPromptProperty) {
                                            const cleanSearch = location.search ? `${location.search}&openAiChat=true` : `?openAiChat=true`;
                                            const returnUrl = `${location.pathname}${cleanSearch}`;
                                            navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`);
                                          } else {
                                            handleSendAiMessage(sug);
                                          }
                                        }}
                                        className="px-2.5 py-1 text-[11px] bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-full font-medium transition-all text-left cursor-pointer shadow-2xs"
                                      >
                                        {cleanDisplayText(sug)}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {isAiTyping && (
                          <div className="flex items-center gap-2 text-slate-600 text-[12px] p-2 bg-white/80 rounded-xl w-fit shadow-2xs">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-700" />
                            <span>REX is finding matching properties...</span>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* AI Input Form */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendAiMessage();
                        }}
                        className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
                      >
                        <input
                          ref={inputRef}
                          type="text"
                          value={aiInputMessage}
                          onChange={(e) => setAiInputMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-2 text-[13px] text-slate-900 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white placeholder:text-slate-400 font-medium transition-all"
                        />
                        <button
                          type="submit"
                          disabled={!aiInputMessage.trim() || isAiTyping}
                          className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center transition-all shadow-xs shrink-0 active:scale-95 cursor-pointer"
                        >
                          <Send size={15} />
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Bottom Navigation Tabs */}
                  <div className="h-12 bg-white border-t border-slate-200 flex items-center justify-around shrink-0 px-2 gap-1.5 shadow-2xs">
                    <button
                      onClick={() => {
                        setActiveTab("human");
                        if (activeTab === "human" && activeView === "conversation") {
                          setActiveView("history");
                        } else if (!activeConversation) {
                          setActiveView("history");
                        }
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[12px] font-semibold rounded-lg transition-colors cursor-pointer ${
                        activeTab === "human"
                          ? "text-red-600 bg-red-50/70 border border-red-100"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <MessageSquare size={15} />
                      <span>Property Chats</span>
                      {totalUnreadCount > 0 && (
                        <span className="px-1.5 py-0.2 bg-red-600 text-white text-[10px] font-bold rounded-full">
                          {totalUnreadCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => setActiveTab("ai")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[12px] font-semibold rounded-lg transition-colors cursor-pointer ${
                        activeTab === "ai"
                          ? "text-red-600 bg-red-50/70 border border-red-100"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <Bot size={15} />
                      <span>REX AI Agent</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Fullscreen Lightbox Modal for Photos & Videos */}
      <ChatLightboxModal
        media={lightboxMedia}
        onClose={() => setLightboxMedia(null)}
      />
    </aside>
  );
};

export default AIChatbot;