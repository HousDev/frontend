// frontend/src/pages/communication/components/ChatConversationView.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Send,
  Building,
  Building2,
  User,
  Info,
  ArrowLeft,
  Check,
  CheckCheck,
  Shield,
  RotateCcw,
  UserCheck,
  AlertCircle,
  MapPin,
  Sparkles,
  ChevronRight,
  MessageSquare,
  Users,
  Compass,
  Paperclip,
  Loader2,
  Calendar,
  FileText,
  PhoneCall,
  CheckCircle2,
  Clock,
  Zap,
  X,
  Search,
  Copy,
  Plus,
  BadgePercent,
  HelpCircle,
} from "lucide-react";
import { PropertyConversation, PropertyChatMessage, chatApi } from "@/services/chatApi";
import { LocationItem, PropertyItem, formatRupeePrice } from "./ChatConversationList";
import {
  ChatMediaBubble,
  ChatAttachmentDraftPreview,
  ChatLightboxModal,
} from "@/components/chat/ChatMediaAttachment";

export interface QuickActionTemplate {
  id: string;
  category: "visits" | "pricing" | "location" | "general";
  categoryLabel: string;
  label: string;
  shortTag: string;
  iconName: "calendar" | "map" | "file" | "phone" | "check" | "clock" | "pricing" | "general";
  getText: (data: { clientFirst: string; clientName: string; propName: string; propLocation: string; propPrice?: string }) => string;
}

export const QUICK_ACTION_TEMPLATES: QuickActionTemplate[] = [
  {
    id: "visit_slot",
    category: "visits",
    categoryLabel: "Site Visits",
    label: "Site Visit Slot",
    shortTag: "Visit",
    iconName: "calendar",
    getText: ({ clientFirst, propName }) =>
      `Hello ${clientFirst}! Are you available for an on-site visit for ${propName} this week? Let us know your preferred date & time slot.`,
  },
  {
    id: "share_location",
    category: "location",
    categoryLabel: "Location & Directions",
    label: "Location Pin",
    shortTag: "Location",
    iconName: "map",
    getText: ({ propName, propLocation }) =>
      `Here is the location & landmark details for ${propName}: ${propLocation || "Pune"}. We can also guide you directly when you arrive on site.`,
  },
  {
    id: "brochure_price",
    category: "pricing",
    categoryLabel: "Pricing & Brochure",
    label: "Brochure & Price Sheet",
    shortTag: "Price Sheet",
    iconName: "file",
    getText: ({ propName }) =>
      `I can share the complete price sheet breakdown, floor plan layout, and payment schedule for ${propName}. Would you like me to send it over WhatsApp or here?`,
  },
  {
    id: "call_request",
    category: "general",
    categoryLabel: "Quick Connect",
    label: "Request Call",
    shortTag: "Call",
    iconName: "phone",
    getText: ({ clientFirst }) =>
      `Hello ${clientFirst}, may I have the best time to connect with you for a quick 2-minute call to discuss your property requirements?`,
  },
  {
    id: "confirm_available",
    category: "visits",
    categoryLabel: "Site Visits",
    label: "Available for Visit",
    shortTag: "Available",
    iconName: "check",
    getText: ({ propName }) =>
      `Yes, ${propName} is actively available and ready for immediate site inspection. Shall I reserve a visit slot for you?`,
  },
  {
    id: "reschedule_visit",
    category: "visits",
    categoryLabel: "Site Visits",
    label: "Reschedule Visit",
    shortTag: "Reschedule",
    iconName: "clock",
    getText: ({ clientFirst }) =>
      `No problem at all! Please let us know your preferred revised date and time for the visit, and I will update your visit schedule.`,
  },
  {
    id: "budget_discuss",
    category: "pricing",
    categoryLabel: "Pricing & Brochure",
    label: "Pricing Discussion",
    shortTag: "Offer",
    iconName: "pricing",
    getText: ({ clientFirst, propName }) =>
      `Hello ${clientFirst}, we can also discuss negotiable terms and payment structure options for ${propName}. What is your target budget range?`,
  },
  {
    id: "loan_assistance",
    category: "pricing",
    categoryLabel: "Pricing & Brochure",
    label: "Home Loan Assistance",
    shortTag: "Loan",
    iconName: "pricing",
    getText: ({ clientFirst }) =>
      `Hello ${clientFirst}, we provide zero-fee home loan assistance with leading partner banks (SBI, HDFC, ICICI) at attractive interest rates. Would you like a quick eligibility check?`,
  },
  {
    id: "general_greeting",
    category: "general",
    categoryLabel: "Quick Connect",
    label: "Welcome Greeting",
    shortTag: "Greeting",
    iconName: "general",
    getText: ({ clientFirst, propName }) =>
      `Hello ${clientFirst}! Glad to connect with you. How can I assist you with ${propName} today?`,
  },
];

export const SELLER_QUICK_ACTION_TEMPLATES: QuickActionTemplate[] = [
  {
    id: "seller_welcome",
    category: "general",
    categoryLabel: "Quick Connect",
    label: "Acknowledge & Welcome",
    shortTag: "Welcome",
    iconName: "check",
    getText: ({ clientFirst, propName }) =>
      `Hello ${clientFirst}! I am your dedicated Property Executive for ${propName}. I have reviewed your submission and will be managing the marketing, verification, and buyer negotiations for your property.`,
  },
  {
    id: "seller_inspection",
    category: "visits",
    categoryLabel: "Property Inspection",
    label: "Schedule Inspection",
    shortTag: "Inspection",
    iconName: "calendar",
    getText: ({ clientFirst, propName }) =>
      `Hello ${clientFirst}, I would like to schedule a 15-minute physical inspection of ${propName} to verify details, take professional photos, and initiate buyer matching. Are you available this week?`,
  },
  {
    id: "seller_pricing",
    category: "pricing",
    categoryLabel: "Pricing & Valuation",
    label: "Pricing & Valuation",
    shortTag: "Valuation",
    iconName: "pricing",
    getText: ({ clientFirst, propName, propLocation }) =>
      `Hello ${clientFirst}, regarding ${propName}, we have strong active buyer demand in ${propLocation || "your locality"}. Let us discuss pricing strategy and recent market benchmarks.`,
  },
  {
    id: "seller_docs",
    category: "pricing",
    categoryLabel: "Verification & Docs",
    label: "Request Index II / Docs",
    shortTag: "Documents",
    iconName: "file",
    getText: ({ clientFirst, propName }) =>
      `Hello ${clientFirst}, to make ${propName} 100% Verified and publish it to verified buyers, please share a soft copy of your Index II or property tax receipt.`,
  },
  {
    id: "seller_call",
    category: "general",
    categoryLabel: "Quick Connect",
    label: "Request 2-Min Call",
    shortTag: "Call",
    iconName: "phone",
    getText: ({ clientFirst, propName }) =>
      `Hello ${clientFirst}, may I have the best time to connect for a quick 2-minute call to discuss your property listing at ${propName} and next steps?`,
  },
  {
    id: "seller_photos",
    category: "visits",
    categoryLabel: "Property Inspection",
    label: "Photos & Key Handover",
    shortTag: "Keys/Photos",
    iconName: "check",
    getText: ({ clientFirst, propName }) =>
      `Hello ${clientFirst}, shall we arrange high-definition property photoshoot and key holding agreement for ${propName} to facilitate seamless buyer visits?`,
  },
];

interface ChatConversationViewProps {
  conversation: PropertyConversation | null;
  messages: PropertyChatMessage[];
  currentUserId: number;
  currentUserRole: string;
  onSendMessage: (text: string) => Promise<void>;
  onSendMedia?: (file: File, caption?: string) => Promise<void>;
  loadingMessages: boolean;
  onToggleContext: () => void;
  showContext: boolean;
  onBackToList?: () => void;
  isAdmin?: boolean;
  onReopen?: () => void;
  onReassignClick?: () => void;
  isRemoteTyping?: boolean;
  remotePresence?: { status: "online" | "offline"; lastSeen: string | null };
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  // Step-by-step interactive empty states:
  selectedLocation?: string | null;
  selectedPropertyId?: number | null;
  locationsSummary?: LocationItem[];
  propertiesList?: PropertyItem[];
  userConversationsList?: PropertyConversation[];
  onSelectLocation?: (loc: string) => void;
  onSelectProperty?: (propId: number | null) => void;
  onSelectConversation?: (conv: PropertyConversation) => void;
}

function formatMessageTime(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

export function formatChatDateDivider(dateStr?: string | null): string {
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

export function isSameDay(d1?: string | null, d2?: string | null): boolean {
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

function getRoleBadge(role?: string) {
  const norm = String(role || "buyer").toLowerCase().trim();
  if (norm.includes("seller")) {
    return { label: "Seller", bg: "bg-amber-50 text-amber-700 border-amber-200" };
  }
  if (norm.includes("tenant")) {
    return { label: "Tenant", bg: "bg-purple-50 text-purple-700 border-purple-200" };
  }
  if (norm.includes("owner")) {
    return { label: "Owner", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  }
  return { label: "Buyer", bg: "bg-blue-50 text-blue-700 border-blue-200" };
}

export const ChatConversationView: React.FC<ChatConversationViewProps> = ({
  conversation,
  messages,
  currentUserId,
  currentUserRole,
  onSendMessage,
  onSendMedia,
  loadingMessages,
  onToggleContext,
  showContext,
  onBackToList,
  isAdmin = false,
  onReopen,
  onReassignClick,
  isRemoteTyping = false,
  remotePresence = { status: "offline", lastSeen: null },
  onTypingStart,
  onTypingStop,
  selectedLocation = null,
  selectedPropertyId = null,
  locationsSummary = [],
  propertiesList = [],
  userConversationsList = [],
  onSelectLocation,
  onSelectProperty,
  onSelectConversation,
}) => {
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<{
    url: string;
    type: "image" | "video";
    title?: string;
  } | null>(null);

  // Dynamic AI Smart Replies state
  const [smartReplies, setSmartReplies] = useState<
    Array<{ id: string; label: string; category?: string; reply_text: string }>
  >([]);
  const [loadingSmartReplies, setLoadingSmartReplies] = useState(false);
  const [showQuickRepliesModal, setShowQuickRepliesModal] = useState(false);
  const [selectedQuickCategory, setSelectedQuickCategory] = useState<string>("all");
  const [quickReplySearch, setQuickReplySearch] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const lastUserMsg = useMemo(() => {
    return (
      messages
        .slice()
        .reverse()
        .find((m) => m.sender_type === "user")?.message_text || ""
    );
  }, [messages]);

  const loadSmartReplies = async () => {
    if (!conversation?.id) return;
    try {
      setLoadingSmartReplies(true);
      const res = await chatApi.getSmartReplies(conversation.id, lastUserMsg);
      if (res.success && Array.isArray(res.suggestions) && res.suggestions.length > 0) {
        setSmartReplies(res.suggestions);
      }
    } catch (err) {
      console.warn("Could not fetch AI smart replies:", err);
    } finally {
      setLoadingSmartReplies(false);
    }
  };

  useEffect(() => {
    if (conversation?.id) {
      loadSmartReplies();
    }
  }, [conversation?.id, lastUserMsg]);

  const renderTemplateIcon = (iconName: QuickActionTemplate["iconName"], className = "w-3.5 h-3.5") => {
    switch (iconName) {
      case "calendar":
        return <Calendar className={`${className} text-orange-500`} />;
      case "map":
        return <MapPin className={`${className} text-emerald-500`} />;
      case "file":
        return <FileText className={`${className} text-blue-500`} />;
      case "phone":
        return <PhoneCall className={`${className} text-purple-500`} />;
      case "check":
        return <CheckCircle2 className={`${className} text-teal-500`} />;
      case "clock":
        return <Clock className={`${className} text-amber-500`} />;
      case "pricing":
        return <BadgePercent className={`${className} text-rose-500`} />;
      default:
        return <Sparkles className={`${className} text-indigo-500`} />;
    }
  };

  const insertQuickText = (text: string) => {
    setInputText((prev) => {
      if (!prev.trim()) return text;
      return `${prev}\n\n${text}`;
    });
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const isSellerConversation = useMemo(() => {
    const role = (conversation?.user_role || "").toLowerCase();
    if (role === "seller" || role === "owner") return true;
    if (lastUserMsg.toLowerCase().includes("seller") || lastUserMsg.toLowerCase().includes("selling")) return true;
    if (conversation?.property_title && lastUserMsg.toLowerCase().includes("listing")) return true;
    return false;
  }, [conversation?.user_role, conversation?.property_title, lastUserMsg]);

  const activeTemplates = useMemo(() => {
    return isSellerConversation ? SELLER_QUICK_ACTION_TEMPLATES : QUICK_ACTION_TEMPLATES;
  }, [isSellerConversation]);

  const filteredQuickTemplates = useMemo(() => {
    let list = activeTemplates;
    if (selectedQuickCategory !== "all") {
      list = list.filter((t) => t.category === selectedQuickCategory);
    }
    if (quickReplySearch.trim()) {
      const q = quickReplySearch.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.label.toLowerCase().includes(q) ||
          t.shortTag.toLowerCase().includes(q) ||
          t.categoryLabel.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeTemplates, selectedQuickCategory, quickReplySearch]);

  // Auto-scroll to bottom on messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 50MB
    if (file.size > 50 * 1024 * 1024) {
      alert("File size exceeds 50MB limit. Please choose a smaller photo or video.");
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const clearAttachment = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !selectedFile) || sending) return;

    const textToSend = inputText.trim();
    const fileToSend = selectedFile;

    setInputText("");
    clearAttachment();
    setSending(true);

    if (onTypingStop) onTypingStop();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    isTypingRef.current = false;

    try {
      if (fileToSend) {
        if (onSendMedia) {
          await onSendMedia(fileToSend, textToSend);
        } else if (conversation) {
          await chatApi.sendMedia(conversation.id, fileToSend, textToSend);
        }
      } else {
        await onSendMessage(textToSend);
      }
    } catch (err) {
      console.error("Failed to send message/media:", err);
      setInputText(textToSend);
    } finally {
      setSending(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);

    if (!isTypingRef.current && e.target.value.trim().length > 0) {
      isTypingRef.current = true;
      if (onTypingStart) onTypingStart();
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        if (onTypingStop) onTypingStop();
      }
    }, 2500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // =========================================================================
  // EXECUTIVE WORKSPACE EMPTY STATE (When no conversation is selected)
  // =========================================================================
  if (!conversation) {
    const totalInquiries = locationsSummary.reduce((sum, l) => sum + (l.totalInquiries || 0), 0);
    const totalUnread = locationsSummary.reduce((sum, l) => sum + (l.totalUnread || 0), 0);
    const totalProperties = locationsSummary.reduce((sum, l) => sum + (l.totalProperties || 0), 0);

    return (
      <div className="flex-1 flex flex-col h-full bg-slate-50/50 overflow-y-auto custom-scrollbar p-5 sm:p-7">
        {!selectedLocation ? (
          <div className="max-w-4xl mx-auto w-full my-auto space-y-5">
            {/* Header Banner */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#e87722]"></span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Executive Communication Desk
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Property Inquiries & Client Chats
                </h2>
                <p className="text-xs text-slate-500 max-w-md">
                  Select an inquiry from the left directory to start messaging with buyers and manage site visits.
                </p>
              </div>

              {/* Quick Summary Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/70 text-center min-w-[80px]">
                  <span className="text-[10px] text-slate-400 font-medium block">Total Inquiries</span>
                  <span className="text-sm font-bold text-slate-900">{totalInquiries}</span>
                </div>
                <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200/70 text-center min-w-[80px]">
                  <span className="text-[10px] text-emerald-600 font-medium block">Unread</span>
                  <span className="text-sm font-bold text-emerald-700">{totalUnread}</span>
                </div>
                <div className="px-3 py-2 rounded-xl bg-orange-50 border border-orange-200/70 text-center min-w-[80px]">
                  <span className="text-[10px] text-orange-600 font-medium block">Active Areas</span>
                  <span className="text-sm font-bold text-orange-800">{locationsSummary.length}</span>
                </div>
              </div>
            </div>

            {/* Quick Location Cards Grid */}
            {locationsSummary.length > 0 && onSelectLocation && (
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#e87722]" />
                  Active Inquiries by Locality
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {locationsSummary.map((loc) => (
                    <div
                      key={loc.locationName}
                      onClick={() => onSelectLocation(loc.locationName)}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-[#e87722] hover:shadow-sm transition-all cursor-pointer group flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#e87722] transition-colors truncate">
                            {loc.locationName}
                          </h4>
                          {loc.totalUnread > 0 && (
                            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-bold text-[9px] rounded-full">
                              {loc.totalUnread} new
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {loc.totalProperties} {loc.totalProperties === 1 ? "Property" : "Properties"} • {loc.totalInquiries} {loc.totalInquiries === 1 ? "Chat" : "Chats"}
                        </p>
                      </div>

                      <span className="p-1.5 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-[#e87722] transition-colors shrink-0">
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : selectedLocation && !selectedPropertyId ? (
          /* Step 2: Location is chosen, prompting for Property */
          <div className="max-w-3xl mx-auto w-full my-auto flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-orange-100/90 text-orange-600 flex items-center justify-center shadow-md mb-4 ring-8 ring-orange-50">
              <Building size={32} />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-widest text-orange-600 bg-orange-100/80 px-3 py-1 rounded-full mb-2">
              📍 {selectedLocation === "all" ? "All Locations" : selectedLocation}
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Select a Property to View Inquiries
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mt-1 mb-6">
              Select a property from the left or choose from the list below to review client chats and start responding.
            </p>

            {propertiesList.length > 0 && onSelectProperty && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
                {propertiesList.map((prop) => (
                  <button
                    key={prop.propertyId}
                    onClick={() => onSelectProperty(prop.propertyId)}
                    className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-orange-400 hover:shadow-md transition-all group cursor-pointer flex items-start gap-3"
                  >
                    <div className="w-12 h-12 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 overflow-hidden shrink-0">
                      {prop.propertyPhotos && prop.propertyPhotos[0] ? (
                        <img
                          src={prop.propertyPhotos[0]}
                          alt={prop.propertyTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building size={22} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                          {prop.propertyTitle}
                        </h4>
                        {prop.totalUnread > 0 && (
                          <span className="px-1.5 py-0.2 bg-emerald-600 text-white font-bold text-[9px] rounded-full shrink-0">
                            {prop.totalUnread} new
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-bold text-orange-600 mt-0.5">
                        {formatRupeePrice(prop.propertyPrice)}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span>📍 {prop.propertyLocation}</span>
                        <span className="font-bold text-slate-700">👥 {prop.totalInquiries} {prop.totalInquiries === 1 ? "Inquirer" : "Inquirers"}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Step 3: Property is selected, prompting to pick a Client Conversation */
          <div className="max-w-3xl mx-auto w-full my-auto flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-orange-100/90 text-orange-600 flex items-center justify-center shadow-md mb-4 ring-8 ring-orange-50">
              <Users size={32} />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-widest text-orange-600 bg-orange-100/80 px-3 py-1 rounded-full mb-2">
              Step 3: Pick a Client Inquiry
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Ready to Start Live Conversation
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mt-1 mb-6">
              Select a customer inquiry from the left panel to load the full transcript, send messages, and schedule visits.
            </p>

            {userConversationsList.length > 0 && onSelectConversation && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
                {userConversationsList.map((conv) => {
                  const customerName = `${conv.user_first_name || "Customer"} ${conv.user_last_name || ""}`.trim();
                  const roleBadge = getRoleBadge(conv.user_role);

                  return (
                    <button
                      key={conv.id}
                      onClick={() => onSelectConversation(conv)}
                      className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-orange-400 hover:shadow-md transition-all group cursor-pointer flex items-start gap-3"
                    >
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                        {customerName.charAt(0).toUpperCase() || "U"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-bold text-xs text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                            {customerName}
                          </h4>
                          <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border ${roleBadge.bg}`}>
                            {roleBadge.label}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-500 truncate mt-1">
                          {conv.last_message_text || "Started conversation"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // ACTIVE CHAT TRANSCRIPT (When conversation is selected)
  // =========================================================================
  const customerName = `${conversation.user_first_name || "Customer"} ${conversation.user_last_name || ""}`.trim();
  const executiveName = `${conversation.executive_first_name || "Executive"} ${conversation.executive_last_name || ""}`.trim();
  const isClosed = conversation.status === "closed";
  const isArchived = conversation.status === "archived";

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8fafc] overflow-hidden">
      {/* Top Header */}
      <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button for mobile */}
          {onBackToList && (
            <button
              onClick={onBackToList}
              className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              title="Back to conversation list"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          {/* User initials / avatar */}
          <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-inner border border-orange-200">
            {customerName.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 truncate">{customerName}</h3>
              {/* Presence Pill */}
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-semibold ${
                  remotePresence.status === "online"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-500 border border-slate-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    remotePresence.status === "online" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                  }`}
                />
                {remotePresence.status === "online" ? "Online" : "Offline"}
              </span>

              {isAdmin && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Shield size={10} /> Admin Monitor
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate mt-0.5">
              <span className="font-semibold text-slate-700 flex items-center gap-1 truncate">
                <span>📍 {conversation.property_location || conversation.property_city || "Pune"}</span>
              </span>
              <span className="text-slate-300">›</span>
              <span className="font-medium text-orange-600 flex items-center gap-1 truncate">
                <Building size={12} className="flex-shrink-0" />
                <span>{conversation.property_title || `Property #${conversation.property_id}`}</span>
                {conversation.property_price && (
                  <span className="text-xs font-bold text-slate-800 bg-slate-100 px-1.5 py-0.2 rounded ml-1">
                    {formatRupeePrice(conversation.property_price)}
                  </span>
                )}
              </span>
              <span className="text-slate-300">›</span>
              <span className="truncate text-slate-500 font-medium">Exec: {executiveName}</span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isAdmin && onReassignClick && (
            <button
              onClick={onReassignClick}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
              title="Reassign to another executive"
            >
              <UserCheck size={14} />
              <span>Reassign</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleContext}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shadow-2xs cursor-pointer bg-white text-slate-700 border-slate-300 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600"
            title="Open Inquiry Details Modal"
          >
            <Building2 size={14} className="text-[#e87722]" />
            <span>Inquiry Details</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#e87722]" />
          </button>
        </div>
      </div>

      {/* Admin Monitoring Banner */}
      {isAdmin && (
        <div className="bg-indigo-50/90 border-b border-indigo-100 px-4 py-1.5 text-[11px] text-indigo-800 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Shield size={13} className="text-indigo-600" />
            <span>
              <strong>Monitoring Mode:</strong> Viewing inquiry between <strong>{customerName}</strong> and executive{" "}
              <strong>{executiveName}</strong>.
            </span>
          </span>
          <span className="text-[10px] bg-indigo-100/70 text-indigo-700 px-2 py-0.5 rounded font-mono">
            Conv #{conversation.id}
          </span>
        </div>
      )}

      {/* Status Warning Banner (if Closed or Archived) */}
      {(isClosed || isArchived) && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-800">
          <div className="flex items-center gap-1.5">
            <AlertCircle size={14} className="text-amber-600" />
            <span>This inquiry conversation is <strong>{conversation.status}</strong>.</span>
          </div>
          {onReopen && (
            <button
              onClick={onReopen}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-semibold transition-colors"
            >
              <RotateCcw size={12} />
              <span>Reopen</span>
            </button>
          )}
        </div>
      )}

      {/* Messages Transcript Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-xs">
            <span>Loading message history...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-300">
              <MessageSquare size={24} />
            </div>
            <p className="font-semibold text-slate-600 text-xs">No Messages Yet</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Send a message to start communicating with {customerName} about {conversation.property_title || "this property"}.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUserSender = msg.sender_type === "user";
            const isExecutiveSender = msg.sender_type === "executive" || msg.sender_type === "admin";
            const isCurrentSender = msg.sender_id === currentUserId && isExecutiveSender;

            const prevMsg = index > 0 ? messages[index - 1] : null;
            const showDateDivider = !prevMsg || !isSameDay(msg.created_at, prevMsg.created_at);
            const dateDividerText = formatChatDateDivider(msg.created_at);

            return (
              <React.Fragment key={msg.id || msg.message_uuid || index}>
                {showDateDivider && (
                  <div className="flex justify-center my-3 sticky top-1 z-10">
                    <span className="px-3.5 py-1 bg-slate-100/95 backdrop-blur-xs shadow-2xs border border-slate-200 text-slate-700 text-[11px] font-bold rounded-full uppercase tracking-wider">
                      {dateDividerText}
                    </span>
                  </div>
                )}

                <div
                  className={`flex flex-col ${isUserSender ? "items-start" : "items-end"}`}
                >
                  <div className="flex items-center gap-1 mb-1 px-1">
                    <span className="text-[10px] font-semibold text-slate-400">
                      {isUserSender ? customerName : isCurrentSender ? "You" : "Executive"}
                    </span>
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 shadow-2xs text-xs sm:text-[13px] leading-relaxed break-words ${
                      isUserSender
                        ? "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs"
                        : isCurrentSender
                        ? "bg-[#0e3658] text-white rounded-tr-xs"
                        : "bg-slate-800 text-white rounded-tr-xs"
                    }`}
                  >
                    <ChatMediaBubble
                      message={msg}
                      isCurrentUser={isCurrentSender}
                      onOpenLightbox={(media) => setLightboxMedia(media)}
                    />

                    <div
                      className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${
                        isUserSender ? "text-slate-400" : "text-white/70"
                      }`}
                    >
                      <span>{formatMessageTime(msg.created_at)}</span>

                      {/* Read Receipts for Outgoing Executive Messages */}
                      {!isUserSender && (
                        <span className="inline-flex items-center ml-0.5">
                          {msg.is_read ? (
                            <span title="Read by user"><CheckCheck size={13} className="text-cyan-400" /></span>
                          ) : msg.is_delivered ? (
                            <span title="Delivered to user"><CheckCheck size={13} className="text-white/60" /></span>
                          ) : (
                            <span title="Sent"><Check size={13} className="text-white/40" /></span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}

        {/* Remote Typing Indicator */}
        {isRemoteTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic bg-white border border-slate-200 rounded-full px-3 py-1.5 w-fit shadow-2xs animate-pulse">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            <span>{customerName} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Hidden File Input for Pin Attachment */}
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

      {/* Message Composer Footer */}
      <div className="p-3 bg-white border-t border-slate-200">
        {/* Dynamic AI Smart Reply Suggestions Strip */}
        <div className="flex items-center gap-1.5 pb-2.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 text-[11px] font-bold text-orange-600 uppercase tracking-wider shrink-0 mr-1 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
            
            <span>AI Suggestions:</span>
            <button
              type="button"
              onClick={loadSmartReplies}
              disabled={loadingSmartReplies}
              className="p-0.5 hover:bg-orange-200/60 rounded text-orange-700 transition-colors ml-0.5 cursor-pointer"
              title="Refresh AI smart suggestions"
            >
              <RotateCcw size={10} className={loadingSmartReplies ? "animate-spin" : ""} />
            </button>
          </div>

          {loadingSmartReplies && smartReplies.length === 0 ? (
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium px-2 py-1">
              <Loader2 size={12} className="animate-spin text-orange-500" />
              <span>Generating AI replies...</span>
            </div>
          ) : smartReplies.length > 0 ? (
            smartReplies.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => insertQuickText(item.reply_text)}
                disabled={isClosed || isArchived}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 hover:border-orange-300 border border-orange-200/90 rounded-lg text-xs font-semibold text-slate-800 hover:text-orange-950 transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95 disabled:opacity-40 group"
                title={`Click to insert: "${item.reply_text}"`}
              >
                <Zap size={11} className="text-orange-500 fill-orange-500" />
                <span>{item.label}</span>
              </button>
            ))
          ) : (
            <button
              type="button"
              onClick={loadSmartReplies}
              disabled={loadingSmartReplies || isClosed || isArchived}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer shadow-2xs group"
              title="Click to generate AI smart replies for this conversation"
            >
              <Sparkles size={11} className="text-orange-600" />
              <span>Generate AI Suggestions</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowQuickRepliesModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer shadow-2xs ml-auto"
            title="Browse all quick reply templates"
          >
            <span>Templates</span>
            <ChevronRight size={12} />
          </button>
        </div>

        <form onSubmit={handleSend} className="flex items-center gap-2">
          {/* Quick Replies Toggle Button */}
          <button
            type="button"
            onClick={() => setShowQuickRepliesModal(true)}
            disabled={isClosed || isArchived || sending}
            className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors disabled:opacity-40 cursor-pointer shrink-0"
            title="Quick Replies & Shortcuts"
          >
            <Zap size={19} className="text-amber-500" />
          </button>

          {/* Pin / Paperclip Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isClosed || isArchived || sending}
            className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors disabled:opacity-40 cursor-pointer shrink-0"
            title="Attach photos or videos"
          >
            <Paperclip size={19} />
          </button>

          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedFile
                ? "Add an optional caption... (Press Enter to send)"
                : "Type your reply... (Press Enter to send, Shift+Enter for new line)"
            }
            rows={1}
            disabled={isClosed || isArchived || sending}
            className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={(!inputText.trim() && !selectedFile) || sending || isClosed || isArchived}
            className="p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all disabled:opacity-40 shadow-xs flex items-center justify-center shrink-0 cursor-pointer"
            title="Send Message"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
      </div>

      {/* Quick Replies / All Templates Drawer Modal */}
      {showQuickRepliesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-scaleUp">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                  <Zap size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Executive Quick Replies & Shortcuts</h3>
                  <p className="text-[11px] text-slate-500">Insert flexible pre-written responses with dynamic property details</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickRepliesModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search and Category Filter */}
            <div className="p-3.5 border-b border-slate-100 space-y-2.5 bg-white">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={quickReplySearch}
                  onChange={(e) => setQuickReplySearch(e.target.value)}
                  placeholder="Search templates (e.g. visit, loan, location, pricing)..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                {[
                  { id: "all", label: "All" },
                  { id: "ai", label: "✨ AI Suggestions" },
                  { id: "visits", label: "Site Visits" },
                  { id: "pricing", label: "Pricing & Docs" },
                  { id: "location", label: "Location" },
                  { id: "general", label: "Quick Connect" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedQuickCategory(cat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                      selectedQuickCategory === cat.id
                        ? "bg-[#0f2b3d] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Template List & AI Smart Replies */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px]">
              {/* Dynamic AI Suggestions Section in Modal */}
              {(selectedQuickCategory === "all" || selectedQuickCategory === "ai") && (
                <div className="space-y-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-orange-700">
                      <Sparkles size={13} className="text-orange-500" />
                      <span>
                        AI Suggestions {lastUserMsg ? `for "${lastUserMsg.slice(0, 30)}${lastUserMsg.length > 30 ? "..." : ""}"` : ""}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={loadSmartReplies}
                      disabled={loadingSmartReplies}
                      className="text-[11px] text-orange-600 hover:text-orange-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={11} className={loadingSmartReplies ? "animate-spin" : ""} />
                      <span>Refresh AI</span>
                    </button>
                  </div>

                  {loadingSmartReplies ? (
                    <div className="p-3 text-center bg-orange-50/50 rounded-xl border border-orange-100 flex items-center justify-center gap-2 text-xs text-orange-700">
                      <Loader2 size={13} className="animate-spin" />
                      <span>Generating tailored AI responses...</span>
                    </div>
                  ) : smartReplies.length > 0 ? (
                    smartReplies.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl border border-orange-200/90 bg-gradient-to-r from-orange-50/40 to-amber-50/40 hover:from-orange-50 hover:to-amber-50 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <Zap size={13} className="text-orange-500 fill-orange-500" />
                            <span className="font-bold text-xs text-slate-900">{item.label}</span>
                            <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                              AI Generated
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                insertQuickText(item.reply_text);
                                setShowQuickRepliesModal(false);
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-orange-500 hover:text-white border border-slate-200 hover:border-orange-500 rounded-lg text-xs font-bold text-slate-700 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <Copy size={11} />
                              <span>Insert</span>
                            </button>

                            <button
                              type="button"
                              onClick={async () => {
                                setShowQuickRepliesModal(false);
                                await onSendMessage(item.reply_text);
                              }}
                              className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <Send size={11} />
                              <span>Send</span>
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white/80 p-2.5 rounded-lg border border-orange-100">
                          {item.reply_text}
                        </p>
                      </div>
                    ))
                  ) : null}
                </div>
              )}

              {selectedQuickCategory !== "ai" && filteredQuickTemplates.length > 0 ? (
                filteredQuickTemplates.map((template) => {
                  const clientFirst = conversation.user_first_name || "there";
                  const clientName = `${conversation.user_first_name || "Customer"} ${conversation.user_last_name || ""}`.trim();
                  const propName = conversation.property_title || "this property";
                  const propLocation = conversation.property_location || "Pune";
                  const fullText = template.getText({ clientName, clientFirst, propName, propLocation });

                  return (
                    <div
                      key={template.id}
                      className="p-3 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/30 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          {renderTemplateIcon(template.iconName)}
                          <span className="font-bold text-xs text-slate-900">{template.label}</span>
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            {template.categoryLabel}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => {
                              insertQuickText(fullText);
                              setShowQuickRepliesModal(false);
                            }}
                            className="px-2.5 py-1 bg-white hover:bg-orange-500 hover:text-white border border-slate-200 hover:border-orange-500 rounded-lg text-xs font-bold text-slate-700 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <Copy size={11} />
                            <span>Insert</span>
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              setShowQuickRepliesModal(false);
                              await onSendMessage(fullText);
                            }}
                            className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <Send size={11} />
                            <span>Send</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-normal bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {fullText}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <HelpCircle size={28} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">No matching templates found</p>
                  <p className="text-[11px] text-slate-400">Try a different search keyword</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for viewing photos/videos in full size */}
      <ChatLightboxModal
        media={lightboxMedia}
        onClose={() => setLightboxMedia(null)}
      />
    </div>
  );
};
