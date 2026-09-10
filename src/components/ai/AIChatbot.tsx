import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  Send,
  X,
  Minimize2,
  Maximize2,
  RefreshCw,
  Phone,
  Building2,
  ExternalLink,
  MessageSquare,
  MessageSquareText,
  Eye,
  MapPin,
  Bot,
  CheckCheck,
  Check,
  ShieldCheck,
  Paperclip,
  Loader2,
  Calendar,
  KeyRound,
  ArrowRight,
  Search,
  ArrowLeft,
  Sparkles,
  ChevronRight,
  User as UserIcon,
} from "lucide-react";

import ChatbotLogo from "@/assets/images/RE.png";
import whatsapp_bg from "@/assets/images/whatsapp_bg.png";
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
import { REXPropertyCarousel } from "./REXPropertyCarousel";
import { REXVisitScheduler, REXVisitSchedulePayload } from "./REXVisitScheduler";
import { REXVisitConfirmedCard } from "./REXVisitConfirmedCard";
import { REXBuyerFilterCard, BuyerFilterSelection } from "./REXBuyerFilterCard";
import { REXSellerWizardCard, SellerPropertyFormData } from "./REXSellerWizardCard";
import { REXSellerConfirmedCard } from "./REXSellerConfirmedCard";
import { REXSellerInsightsCard, SellerInsightsData } from "./REXSellerInsightsCard";
import { OpenPropertyChatOptions } from "@/services/propertyChatService";

// Authentic WhatsApp doodle wallpaper
const REX_CHAT_THEME_BG = `url("data:image/svg+xml,%3Csvg width='180' height='180' viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cg transform='translate(7.5,7.5)'%3E%3Cpath d='M-5,1l5-5 5,5v4h-10zM-2,5v-3h4v3' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(15.0,15.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(22.5,7.5)'%3E%3Ccircle cx='-2' cy='0' r='2.2' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Cpath d='M0.2,0h4.5M3,0v1.8M4.7,0v1.8' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(30.0,15.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(37.5,7.5)'%3E%3Cpath d='M0,-5a3.2,3.2 0 0,0-3.2,3.2c0,3 3.2,6.5 3.2,6.5s3.2-3.5 3.2-6.5a3.2,3.2 0 0,0-3.2-3.2z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Ccircle cx='0' cy='-1.8' r='1' stroke='%235c5549' stroke-width='0.7' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(45.0,15.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(52.5,7.5)'%3E%3Cpath d='M-4,-4h8M-4,-1.5h8M-4,-4c3,0 4.5,1 4.5,2.5s-2,2.5-4.5,2.5l5.5,4.5' stroke='%235c5549' stroke-width='0.95' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(60.0,15.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(67.5,7.5)'%3E%3Cpath d='M-4.5,-3.5h9a1.5,1.5 0 0,1 1.5,1.5v4.5a1.5,1.5 0 0,1-1.5,1.5h-4.5l-2.5,2.5v-2.5h-1.5a1.5,1.5 0 0,1-1.5-1.5V-2a1.5,1.5 0 0,1 1.5-1.5z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(75.0,15.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(82.5,7.5)'%3E%3Cpath d='M0,-5l4.5,2v3.5c0,3-4.5,5-4.5,5s-4.5-2-4.5-5v-3.5zM-2,0.5l1.5,1.5 3-3' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(90.0,15.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(97.5,7.5)'%3E%3Cpath d='M-3.5,-5.5h7v11h-7zM-1.5,-3.5h1v1h-1zM0.5,-3.5h1v1h-1zM-1.5,-0.5h1v1h-1zM0.5,-0.5h1v1h-1zM-1.5,2.5h1v1h-1zM0.5,2.5h1v1h-1z' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(105.0,15.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(112.5,7.5)'%3E%3Cpath d='M-3.5,-2h7v3a3,3 0 0,1-3,3h-1a3,3 0 0,1-3-3zM3.5,-1h1.5a1,1 0 0,1 1,1v1a1,1 0 0,1-1,1h-1.5M-4.5,4.5h9' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(120.0,15.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(127.5,7.5)'%3E%3Cpath d='M0,5v-4M0,-4a3.5,3.5 0 0,1 3.5,3.5c0,2-3.5,2-3.5,2s-3.5,0-3.5-2a3.5,3.5 0 0,1 3.5-3.5z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(135.0,15.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(142.5,7.5)'%3E%3Cpath d='M-4,-4h3.5l4.5,4.5-3.5,3.5-4.5-4.5z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Ccircle cx='-1.8' cy='-1.8' r='0.8' stroke='%235c5549' stroke-width='0.6' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(150.0,15.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(157.5,7.5)'%3E%3Cpath d='M-3,-5h6v10h-6zM1.5,0a0.5,0.5 0 1,0 0.01,0' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(165.0,15.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(172.5,7.5)'%3E%3Ccircle cx='0' cy='0' r='4' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Cpath d='M0,-2v2h2' stroke='%235c5549' stroke-width='0.75' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(0.0,15.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(15.0,22.5)'%3E%3Ccircle cx='0' cy='0' r='2.2' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Cpath d='M0,-4.5v1M0,3.5v1M-4.5,0h1M3.5,0h1M-3,-3l0.8,0.8M2.2,2.2l0.8,0.8M3,-3l-0.8,0.8M-2.2,2.2l-0.8,0.8' stroke='%235c5549' stroke-width='0.7' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(22.5,30.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(30.0,22.5)'%3E%3Cpath d='M0,3.5c0,0-4-2.8-4-5a2.2,2.2 0 0,1 4,-0.6 2.2,2.2 0 0,1 4,0.6c0,2.2-4,5-4,5z' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(37.5,30.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(45.0,22.5)'%3E%3Cpath d='M-4,3.5l8-7-5,7.5-1-3z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(52.5,30.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(60.0,22.5)'%3E%3Cpath d='M-4.5,-1h9v4h-9zM-4.5,-1v2M4.5,-1v2M-3,3v1.5M3,3v1.5' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(67.5,30.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(75.0,22.5)'%3E%3Ccircle cx='-1' cy='-1' r='2.8' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Cpath d='M1.2,1.2l3.2,3.2' stroke='%235c5549' stroke-width='0.95' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(82.5,30.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(90.0,22.5)'%3E%3Cpath d='M-3.5,-3h7v6.5h-7zM-3.5,-0.5h7M-1.8,-4.5v1.5M1.8,-4.5v1.5' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(97.5,30.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(105.0,22.5)'%3E%3Cpath d='M0,-4q0,4 4,4q-4,0-4,4q0-4-4-4q4,0 4,-4z' stroke='%235c5549' stroke-width='0.75' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(112.5,30.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(120.0,22.5)'%3E%3Cpath d='M-2,-3a2.8,2.8 0 0,1 4,0c0.5,1.2-1,2.5-1,3.5h-2c0-1-1.5-2.3-1-3.5zM-1.5,1.5h3' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(127.5,30.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(135.0,22.5)'%3E%3Cpath d='M-4.5,-1l2.5,2 2,-1.5 2,1.5 2.5,-2M-2,1l1.5,1.5 1.5,-1.5' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(142.5,30.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(150.0,22.5)'%3E%3Cpath d='M-4,-1l4-3.5 4,3.5v4.5h-8zM2,-3v-1.5h1.5v2.8' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(157.5,30.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(165.0,22.5)'%3E%3Cpath d='M-3,-4.5h4.5l2,2v7h-6.5zM-1.5,-1.5h3M-1.5,1h3M-1.5,3h2' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(172.5,30.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(0.0,22.5)'%3E%3Cpath d='M-4,1.5l1.5,-3h5l1.5,3v2.5h-8zM-2.5,4a0.8,0.8 0 1,0 0.01,0M2.5,4a0.8,0.8 0 1,0 0.01,0' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(7.5,30.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(7.5,37.5)'%3E%3Cpath d='M-5,1l5-5 5,5v4h-10zM-2,5v-3h4v3' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(15.0,45.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(22.5,37.5)'%3E%3Ccircle cx='-2' cy='0' r='2.2' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Cpath d='M0.2,0h4.5M3,0v1.8M4.7,0v1.8' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(30.0,45.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(37.5,37.5)'%3E%3Cpath d='M0,-5a3.2,3.2 0 0,0-3.2,3.2c0,3 3.2,6.5 3.2,6.5s3.2-3.5 3.2-6.5a3.2,3.2 0 0,0-3.2-3.2z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Ccircle cx='0' cy='-1.8' r='1' stroke='%235c5549' stroke-width='0.7' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(45.0,45.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(52.5,37.5)'%3E%3Cpath d='M-4,-4h8M-4,-1.5h8M-4,-4c3,0 4.5,1 4.5,2.5s-2,2.5-4.5,2.5l5.5,4.5' stroke='%235c5549' stroke-width='0.95' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(60.0,45.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(67.5,37.5)'%3E%3Cpath d='M-4.5,-3.5h9a1.5,1.5 0 0,1 1.5,1.5v4.5a1.5,1.5 0 0,1-1.5,1.5h-4.5l-2.5,2.5v-2.5h-1.5a1.5,1.5 0 0,1-1.5-1.5V-2a1.5,1.5 0 0,1 1.5-1.5z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(75.0,45.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(82.5,37.5)'%3E%3Cpath d='M0,-5l4.5,2v3.5c0,3-4.5,5-4.5,5s-4.5-2-4.5-5v-3.5zM-2,0.5l1.5,1.5 3-3' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(90.0,45.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(97.5,37.5)'%3E%3Cpath d='M-3.5,-5.5h7v11h-7zM-1.5,-3.5h1v1h-1zM0.5,-3.5h1v1h-1zM-1.5,-0.5h1v1h-1zM0.5,-0.5h1v1h-1zM-1.5,2.5h1v1h-1zM0.5,2.5h1v1h-1z' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(105.0,45.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(112.5,37.5)'%3E%3Cpath d='M-3.5,-2h7v3a3,3 0 0,1-3,3h-1a3,3 0 0,1-3-3zM3.5,-1h1.5a1,1 0 0,1 1,1v1a1,1 0 0,1-1,1h-1.5M-4.5,4.5h9' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(120.0,45.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(127.5,37.5)'%3E%3Cpath d='M0,5v-4M0,-4a3.5,3.5 0 0,1 3.5,3.5c0,2-3.5,2-3.5,2s-3.5,0-3.5-2a3.5,3.5 0 0,1 3.5-3.5z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(135.0,45.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(142.5,37.5)'%3E%3Cpath d='M-4,-4h3.5l4.5,4.5-3.5,3.5-4.5-4.5z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Ccircle cx='-1.8' cy='-1.8' r='0.8' stroke='%235c5549' stroke-width='0.6' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(150.0,45.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(157.5,37.5)'%3E%3Cpath d='M-3,-5h6v10h-6zM1.5,0a0.5,0.5 0 1,0 0.01,0' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(165.0,45.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(172.5,37.5)'%3E%3Ccircle cx='0' cy='0' r='4' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Cpath d='M0,-2v2h2' stroke='%235c5549' stroke-width='0.75' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(0.0,45.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(15.0,52.5)'%3E%3Ccircle cx='0' cy='0' r='2.2' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Cpath d='M0,-4.5v1M0,3.5v1M-4.5,0h1M3.5,0h1M-3,-3l0.8,0.8M2.2,2.2l0.8,0.8M3,-3l-0.8,0.8M-2.2,2.2l-0.8,0.8' stroke='%235c5549' stroke-width='0.7' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(22.5,60.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(30.0,52.5)'%3E%3Cpath d='M0,3.5c0,0-4-2.8-4-5a2.2,2.2 0 0,1 4,-0.6 2.2,2.2 0 0,1 4,0.6c0,2.2-4,5-4,5z' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(37.5,60.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(45.0,52.5)'%3E%3Cpath d='M-4,3.5l8-7-5,7.5-1-3z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(52.5,60.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(60.0,52.5)'%3E%3Cpath d='M-4.5,-1h9v4h-9zM-4.5,-1v2M4.5,-1v2M-3,3v1.5M3,3v1.5' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(67.5,60.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(75.0,52.5)'%3E%3Ccircle cx='-1' cy='-1' r='2.8' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Cpath d='M1.2,1.2l3.2,3.2' stroke='%235c5549' stroke-width='0.95' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(82.5,60.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(90.0,52.5)'%3E%3Cpath d='M-3.5,-3h7v6.5h-7zM-3.5,-0.5h7M-1.8,-4.5v1.5M1.8,-4.5v1.5' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(97.5,60.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(105.0,52.5)'%3E%3Cpath d='M0,-4q0,4 4,4q-4,0-4,4q0-4-4-4q4,0 4,-4z' stroke='%235c5549' stroke-width='0.75' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(112.5,60.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(120.0,52.5)'%3E%3Cpath d='M-2,-3a2.8,2.8 0 0,1 4,0c0.5,1.2-1,2.5-1,3.5h-2c0-1-1.5-2.3-1-3.5zM-1.5,1.5h3' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(127.5,60.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(135.0,52.5)'%3E%3Cpath d='M-4.5,-1l2.5,2 2,-1.5 2,1.5 2.5,-2M-2,1l1.5,1.5 1.5,-1.5' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(142.5,60.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(150.0,52.5)'%3E%3Cpath d='M-4,-1l4-3.5 4,3.5v4.5h-8zM2,-3v-1.5h1.5v2.8' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(157.5,60.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(165.0,52.5)'%3E%3Cpath d='M-3,-4.5h4.5l2,2v7h-6.5zM-1.5,-1.5h3M-1.5,1h3M-1.5,3h2' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(172.5,60.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(0.0,52.5)'%3E%3Cpath d='M-4,1.5l1.5,-3h5l1.5,3v2.5h-8zM-2.5,4a0.8,0.8 0 1,0 0.01,0M2.5,4a0.8,0.8 0 1,0 0.01,0' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(7.5,60.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(7.5,67.5)'%3E%3Cpath d='M-5,1l5-5 5,5v4h-10zM-2,5v-3h4v3' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(15.0,75.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(22.5,67.5)'%3E%3Ccircle cx='-2' cy='0' r='2.2' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Cpath d='M0.2,0h4.5M3,0v1.8M4.7,0v1.8' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(30.0,75.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(37.5,67.5)'%3E%3Cpath d='M0,-5a3.2,3.2 0 0,0-3.2,3.2c0,3 3.2,6.5 3.2,6.5s3.2-3.5 3.2-6.5a3.2,3.2 0 0,0-3.2-3.2z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Ccircle cx='0' cy='-1.8' r='1' stroke='%235c5549' stroke-width='0.7' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(45.0,75.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(52.5,67.5)'%3E%3Cpath d='M-4,-4h8M-4,-1.5h8M-4,-4c3,0 4.5,1 4.5,2.5s-2,2.5-4.5,2.5l5.5,4.5' stroke='%235c5549' stroke-width='0.95' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(60.0,75.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(67.5,67.5)'%3E%3Cpath d='M-4.5,-3.5h9a1.5,1.5 0 0,1 1.5,1.5v4.5a1.5,1.5 0 0,1-1.5,1.5h-4.5l-2.5,2.5v-2.5h-1.5a1.5,1.5 0 0,1-1.5-1.5V-2a1.5,1.5 0 0,1 1.5-1.5z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(75.0,75.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(82.5,67.5)'%3E%3Cpath d='M0,-5l4.5,2v3.5c0,3-4.5,5-4.5,5s-4.5-2-4.5-5v-3.5zM-2,0.5l1.5,1.5 3-3' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(90.0,75.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(97.5,67.5)'%3E%3Cpath d='M-3.5,-5.5h7v11h-7zM-1.5,-3.5h1v1h-1zM0.5,-3.5h1v1h-1zM-1.5,-0.5h1v1h-1zM0.5,-0.5h1v1h-1zM-1.5,2.5h1v1h-1zM0.5,2.5h1v1h-1z' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(105.0,75.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(112.5,67.5)'%3E%3Cpath d='M-3.5,-2h7v3a3,3 0 0,1-3,3h-1a3,3 0 0,1-3-3zM3.5,-1h1.5a1,1 0 0,1 1,1v1a1,1 0 0,1-1,1h-1.5M-4.5,4.5h9' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(120.0,75.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(127.5,67.5)'%3E%3Cpath d='M0,5v-4M0,-4a3.5,3.5 0 0,1 3.5,3.5c0,2-3.5,2-3.5,2s-3.5,0-3.5-2a3.5,3.5 0 0,1 3.5-3.5z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(135.0,75.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(142.5,67.5)'%3E%3Cpath d='M-4,-4h3.5l4.5,4.5-3.5,3.5-4.5-4.5z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Ccircle cx='-1.8' cy='-1.8' r='0.8' stroke='%235c5549' stroke-width='0.6' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(150.0,75.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(157.5,67.5)'%3E%3Cpath d='M-3,-5h6v10h-6zM1.5,0a0.5,0.5 0 1,0 0.01,0' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(165.0,75.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(172.5,67.5)'%3E%3Ccircle cx='0' cy='0' r='4' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Cpath d='M0,-2v2h2' stroke='%235c5549' stroke-width='0.75' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(0.0,75.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(15.0,82.5)'%3E%3Ccircle cx='0' cy='0' r='2.2' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Cpath d='M0,-4.5v1M0,3.5v1M-4.5,0h1M3.5,0h1M-3,-3l0.8,0.8M2.2,2.2l0.8,0.8M3,-3l-0.8,0.8M-2.2,2.2l-0.8,0.8' stroke='%235c5549' stroke-width='0.7' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(22.5,90.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(30.0,82.5)'%3E%3Cpath d='M0,3.5c0,0-4-2.8-4-5a2.2,2.2 0 0,1 4,-0.6 2.2,2.2 0 0,1 4,0.6c0,2.2-4,5-4,5z' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(37.5,90.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(45.0,82.5)'%3E%3Cpath d='M-4,3.5l8-7-5,7.5-1-3z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(52.5,90.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(60.0,82.5)'%3E%3Cpath d='M-4.5,-1h9v4h-9zM-4.5,-1v2M4.5,-1v2M-3,3v1.5M3,3v1.5' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(67.5,90.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(75.0,82.5)'%3E%3Ccircle cx='-1' cy='-1' r='2.8' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Cpath d='M1.2,1.2l3.2,3.2' stroke='%235c5549' stroke-width='0.95' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(82.5,90.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(90.0,82.5)'%3E%3Cpath d='M-3.5,-3h7v6.5h-7zM-3.5,-0.5h7M-1.8,-4.5v1.5M1.8,-4.5v1.5' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(97.5,90.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(105.0,82.5)'%3E%3Cpath d='M0,-4q0,4 4,4q-4,0-4,4q0-4-4-4q4,0 4,-4z' stroke='%235c5549' stroke-width='0.75' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(112.5,90.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(120.0,82.5)'%3E%3Cpath d='M-2,-3a2.8,2.8 0 0,1 4,0c0.5,1.2-1,2.5-1,3.5h-2c0-1-1.5-2.3-1-3.5zM-1.5,1.5h3' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(127.5,90.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(135.0,82.5)'%3E%3Cpath d='M-4.5,-1l2.5,2 2,-1.5 2,1.5 2.5,-2M-2,1l1.5,1.5 1.5,-1.5' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(142.5,90.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(150.0,82.5)'%3E%3Cpath d='M-4,-1l4-3.5 4,3.5v4.5h-8zM2,-3v-1.5h1.5v2.8' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(157.5,90.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(165.0,82.5)'%3E%3Cpath d='M-3,-4.5h4.5l2,2v7h-6.5zM-1.5,-1.5h3M-1.5,1h3M-1.5,3h2' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(172.5,90.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(0.0,82.5)'%3E%3Cpath d='M-4,1.5l1.5,-3h5l1.5,3v2.5h-8zM-2.5,4a0.8,0.8 0 1,0 0.01,0M2.5,4a0.8,0.8 0 1,0 0.01,0' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(7.5,90.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(7.5,97.5)'%3E%3Cpath d='M-5,1l5-5 5,5v4h-10zM-2,5v-3h4v3' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(15.0,105.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(22.5,97.5)'%3E%3Ccircle cx='-2' cy='0' r='2.2' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Cpath d='M0.2,0h4.5M3,0v1.8M4.7,0v1.8' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(30.0,105.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(37.5,97.5)'%3E%3Cpath d='M0,-5a3.2,3.2 0 0,0-3.2,3.2c0,3 3.2,6.5 3.2,6.5s3.2-3.5 3.2-6.5a3.2,3.2 0 0,0-3.2-3.2z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Ccircle cx='0' cy='-1.8' r='1' stroke='%235c5549' stroke-width='0.7' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(45.0,105.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(52.5,97.5)'%3E%3Cpath d='M-4,-4h8M-4,-1.5h8M-4,-4c3,0 4.5,1 4.5,2.5s-2,2.5-4.5,2.5l5.5,4.5' stroke='%235c5549' stroke-width='0.95' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(60.0,105.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(67.5,97.5)'%3E%3Cpath d='M-4.5,-3.5h9a1.5,1.5 0 0,1 1.5,1.5v4.5a1.5,1.5 0 0,1-1.5,1.5h-4.5l-2.5,2.5v-2.5h-1.5a1.5,1.5 0 0,1-1.5-1.5V-2a1.5,1.5 0 0,1 1.5-1.5z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(75.0,105.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(82.5,97.5)'%3E%3Cpath d='M0,-5l4.5,2v3.5c0,3-4.5,5-4.5,5s-4.5-2-4.5-5v-3.5zM-2,0.5l1.5,1.5 3-3' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(90.0,105.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(97.5,97.5)'%3E%3Cpath d='M-3.5,-5.5h7v11h-7zM-1.5,-3.5h1v1h-1zM0.5,-3.5h1v1h-1zM-1.5,-0.5h1v1h-1zM0.5,-0.5h1v1h-1zM-1.5,2.5h1v1h-1zM0.5,2.5h1v1h-1z' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(105.0,105.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(112.5,97.5)'%3E%3Cpath d='M-3.5,-2h7v3a3,3 0 0,1-3,3h-1a3,3 0 0,1-3-3zM3.5,-1h1.5a1,1 0 0,1 1,1v1a1,1 0 0,1-1,1h-1.5M-4.5,4.5h9' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(120.0,105.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(127.5,97.5)'%3E%3Cpath d='M0,5v-4M0,-4a3.5,3.5 0 0,1 3.5,3.5c0,2-3.5,2-3.5,2s-3.5,0-3.5-2a3.5,3.5 0 0,1 3.5-3.5z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(135.0,105.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(142.5,97.5)'%3E%3Cpath d='M-4,-4h3.5l4.5,4.5-3.5,3.5-4.5-4.5z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Ccircle cx='-1.8' cy='-1.8' r='0.8' stroke='%235c5549' stroke-width='0.6' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(150.0,105.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(157.5,97.5)'%3E%3Cpath d='M-3,-5h6v10h-6zM1.5,0a0.5,0.5 0 1,0 0.01,0' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(165.0,105.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(172.5,97.5)'%3E%3Ccircle cx='0' cy='0' r='4' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Cpath d='M0,-2v2h2' stroke='%235c5549' stroke-width='0.75' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(0.0,105.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(15.0,112.5)'%3E%3Ccircle cx='0' cy='0' r='2.2' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Cpath d='M0,-4.5v1M0,3.5v1M-4.5,0h1M3.5,0h1M-3,-3l0.8,0.8M2.2,2.2l0.8,0.8M3,-3l-0.8,0.8M-2.2,2.2l-0.8,0.8' stroke='%235c5549' stroke-width='0.7' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(22.5,120.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(30.0,112.5)'%3E%3Cpath d='M0,3.5c0,0-4-2.8-4-5a2.2,2.2 0 0,1 4,-0.6 2.2,2.2 0 0,1 4,0.6c0,2.2-4,5-4,5z' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(37.5,120.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(45.0,112.5)'%3E%3Cpath d='M-4,3.5l8-7-5,7.5-1-3z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(52.5,120.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(60.0,112.5)'%3E%3Cpath d='M-4.5,-1h9v4h-9zM-4.5,-1v2M4.5,-1v2M-3,3v1.5M3,3v1.5' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(67.5,120.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(75.0,112.5)'%3E%3Ccircle cx='-1' cy='-1' r='2.8' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Cpath d='M1.2,1.2l3.2,3.2' stroke='%235c5549' stroke-width='0.95' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(82.5,120.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(90.0,112.5)'%3E%3Cpath d='M-3.5,-3h7v6.5h-7zM-3.5,-0.5h7M-1.8,-4.5v1.5M1.8,-4.5v1.5' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(97.5,120.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(105.0,112.5)'%3E%3Cpath d='M0,-4q0,4 4,4q-4,0-4,4q0-4-4-4q4,0 4,-4z' stroke='%235c5549' stroke-width='0.75' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(112.5,120.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(120.0,112.5)'%3E%3Cpath d='M-2,-3a2.8,2.8 0 0,1 4,0c0.5,1.2-1,2.5-1,3.5h-2c0-1-1.5-2.3-1-3.5zM-1.5,1.5h3' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(127.5,120.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(135.0,112.5)'%3E%3Cpath d='M-4.5,-1l2.5,2 2,-1.5 2,1.5 2.5,-2M-2,1l1.5,1.5 1.5,-1.5' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(142.5,120.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(150.0,112.5)'%3E%3Cpath d='M-4,-1l4-3.5 4,3.5v4.5h-8zM2,-3v-1.5h1.5v2.8' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(157.5,120.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(165.0,112.5)'%3E%3Cpath d='M-3,-4.5h4.5l2,2v7h-6.5zM-1.5,-1.5h3M-1.5,1h3M-1.5,3h2' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(172.5,120.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(0.0,112.5)'%3E%3Cpath d='M-4,1.5l1.5,-3h5l1.5,3v2.5h-8zM-2.5,4a0.8,0.8 0 1,0 0.01,0M2.5,4a0.8,0.8 0 1,0 0.01,0' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(7.5,120.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(7.5,127.5)'%3E%3Cpath d='M-5,1l5-5 5,5v4h-10zM-2,5v-3h4v3' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(15.0,135.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(22.5,127.5)'%3E%3Ccircle cx='-2' cy='0' r='2.2' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Cpath d='M0.2,0h4.5M3,0v1.8M4.7,0v1.8' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(30.0,135.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(37.5,127.5)'%3E%3Cpath d='M0,-5a3.2,3.2 0 0,0-3.2,3.2c0,3 3.2,6.5 3.2,6.5s3.2-3.5 3.2-6.5a3.2,3.2 0 0,0-3.2-3.2z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Ccircle cx='0' cy='-1.8' r='1' stroke='%235c5549' stroke-width='0.7' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(45.0,135.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(52.5,127.5)'%3E%3Cpath d='M-4,-4h8M-4,-1.5h8M-4,-4c3,0 4.5,1 4.5,2.5s-2,2.5-4.5,2.5l5.5,4.5' stroke='%235c5549' stroke-width='0.95' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(60.0,135.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(67.5,127.5)'%3E%3Cpath d='M-4.5,-3.5h9a1.5,1.5 0 0,1 1.5,1.5v4.5a1.5,1.5 0 0,1-1.5,1.5h-4.5l-2.5,2.5v-2.5h-1.5a1.5,1.5 0 0,1-1.5-1.5V-2a1.5,1.5 0 0,1 1.5-1.5z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(75.0,135.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(82.5,127.5)'%3E%3Cpath d='M0,-5l4.5,2v3.5c0,3-4.5,5-4.5,5s-4.5-2-4.5-5v-3.5zM-2,0.5l1.5,1.5 3-3' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(90.0,135.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(97.5,127.5)'%3E%3Cpath d='M-3.5,-5.5h7v11h-7zM-1.5,-3.5h1v1h-1zM0.5,-3.5h1v1h-1zM-1.5,-0.5h1v1h-1zM0.5,-0.5h1v1h-1zM-1.5,2.5h1v1h-1zM0.5,2.5h1v1h-1z' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(105.0,135.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(112.5,127.5)'%3E%3Cpath d='M-3.5,-2h7v3a3,3 0 0,1-3,3h-1a3,3 0 0,1-3-3zM3.5,-1h1.5a1,1 0 0,1 1,1v1a1,1 0 0,1-1,1h-1.5M-4.5,4.5h9' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(120.0,135.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(127.5,127.5)'%3E%3Cpath d='M0,5v-4M0,-4a3.5,3.5 0 0,1 3.5,3.5c0,2-3.5,2-3.5,2s-3.5,0-3.5-2a3.5,3.5 0 0,1 3.5-3.5z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(135.0,135.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(142.5,127.5)'%3E%3Cpath d='M-4,-4h3.5l4.5,4.5-3.5,3.5-4.5-4.5z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Ccircle cx='-1.8' cy='-1.8' r='0.8' stroke='%235c5549' stroke-width='0.6' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(150.0,135.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(157.5,127.5)'%3E%3Cpath d='M-3,-5h6v10h-6zM1.5,0a0.5,0.5 0 1,0 0.01,0' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(165.0,135.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(172.5,127.5)'%3E%3Ccircle cx='0' cy='0' r='4' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Cpath d='M0,-2v2h2' stroke='%235c5549' stroke-width='0.75' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(0.0,135.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(15.0,142.5)'%3E%3Ccircle cx='0' cy='0' r='2.2' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Cpath d='M0,-4.5v1M0,3.5v1M-4.5,0h1M3.5,0h1M-3,-3l0.8,0.8M2.2,2.2l0.8,0.8M3,-3l-0.8,0.8M-2.2,2.2l-0.8,0.8' stroke='%235c5549' stroke-width='0.7' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(22.5,150.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(30.0,142.5)'%3E%3Cpath d='M0,3.5c0,0-4-2.8-4-5a2.2,2.2 0 0,1 4,-0.6 2.2,2.2 0 0,1 4,0.6c0,2.2-4,5-4,5z' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(37.5,150.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(45.0,142.5)'%3E%3Cpath d='M-4,3.5l8-7-5,7.5-1-3z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(52.5,150.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(60.0,142.5)'%3E%3Cpath d='M-4.5,-1h9v4h-9zM-4.5,-1v2M4.5,-1v2M-3,3v1.5M3,3v1.5' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(67.5,150.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(75.0,142.5)'%3E%3Ccircle cx='-1' cy='-1' r='2.8' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Cpath d='M1.2,1.2l3.2,3.2' stroke='%235c5549' stroke-width='0.95' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(82.5,150.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(90.0,142.5)'%3E%3Cpath d='M-3.5,-3h7v6.5h-7zM-3.5,-0.5h7M-1.8,-4.5v1.5M1.8,-4.5v1.5' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(97.5,150.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(105.0,142.5)'%3E%3Cpath d='M0,-4q0,4 4,4q-4,0-4,4q0-4-4-4q4,0 4,-4z' stroke='%235c5549' stroke-width='0.75' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(112.5,150.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(120.0,142.5)'%3E%3Cpath d='M-2,-3a2.8,2.8 0 0,1 4,0c0.5,1.2-1,2.5-1,3.5h-2c0-1-1.5-2.3-1-3.5zM-1.5,1.5h3' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(127.5,150.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(135.0,142.5)'%3E%3Cpath d='M-4.5,-1l2.5,2 2,-1.5 2,1.5 2.5,-2M-2,1l1.5,1.5 1.5,-1.5' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(142.5,150.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(150.0,142.5)'%3E%3Cpath d='M-4,-1l4-3.5 4,3.5v4.5h-8zM2,-3v-1.5h1.5v2.8' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(157.5,150.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(165.0,142.5)'%3E%3Cpath d='M-3,-4.5h4.5l2,2v7h-6.5zM-1.5,-1.5h3M-1.5,1h3M-1.5,3h2' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(172.5,150.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(0.0,142.5)'%3E%3Cpath d='M-4,1.5l1.5,-3h5l1.5,3v2.5h-8zM-2.5,4a0.8,0.8 0 1,0 0.01,0M2.5,4a0.8,0.8 0 1,0 0.01,0' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(7.5,150.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(7.5,157.5)'%3E%3Cpath d='M-5,1l5-5 5,5v4h-10zM-2,5v-3h4v3' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(15.0,165.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(22.5,157.5)'%3E%3Ccircle cx='-2' cy='0' r='2.2' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Cpath d='M0.2,0h4.5M3,0v1.8M4.7,0v1.8' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(30.0,165.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(37.5,157.5)'%3E%3Cpath d='M0,-5a3.2,3.2 0 0,0-3.2,3.2c0,3 3.2,6.5 3.2,6.5s3.2-3.5 3.2-6.5a3.2,3.2 0 0,0-3.2-3.2z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Ccircle cx='0' cy='-1.8' r='1' stroke='%235c5549' stroke-width='0.7' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(45.0,165.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(52.5,157.5)'%3E%3Cpath d='M-4,-4h8M-4,-1.5h8M-4,-4c3,0 4.5,1 4.5,2.5s-2,2.5-4.5,2.5l5.5,4.5' stroke='%235c5549' stroke-width='0.95' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(60.0,165.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(67.5,157.5)'%3E%3Cpath d='M-4.5,-3.5h9a1.5,1.5 0 0,1 1.5,1.5v4.5a1.5,1.5 0 0,1-1.5,1.5h-4.5l-2.5,2.5v-2.5h-1.5a1.5,1.5 0 0,1-1.5-1.5V-2a1.5,1.5 0 0,1 1.5-1.5z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(75.0,165.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(82.5,157.5)'%3E%3Cpath d='M0,-5l4.5,2v3.5c0,3-4.5,5-4.5,5s-4.5-2-4.5-5v-3.5zM-2,0.5l1.5,1.5 3-3' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(90.0,165.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(97.5,157.5)'%3E%3Cpath d='M-3.5,-5.5h7v11h-7zM-1.5,-3.5h1v1h-1zM0.5,-3.5h1v1h-1zM-1.5,-0.5h1v1h-1zM0.5,-0.5h1v1h-1zM-1.5,2.5h1v1h-1zM0.5,2.5h1v1h-1z' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(105.0,165.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(112.5,157.5)'%3E%3Cpath d='M-3.5,-2h7v3a3,3 0 0,1-3,3h-1a3,3 0 0,1-3-3zM3.5,-1h1.5a1,1 0 0,1 1,1v1a1,1 0 0,1-1,1h-1.5M-4.5,4.5h9' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(120.0,165.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(127.5,157.5)'%3E%3Cpath d='M0,5v-4M0,-4a3.5,3.5 0 0,1 3.5,3.5c0,2-3.5,2-3.5,2s-3.5,0-3.5-2a3.5,3.5 0 0,1 3.5-3.5z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(135.0,165.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(142.5,157.5)'%3E%3Cpath d='M-4,-4h3.5l4.5,4.5-3.5,3.5-4.5-4.5z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Ccircle cx='-1.8' cy='-1.8' r='0.8' stroke='%235c5549' stroke-width='0.6' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(150.0,165.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(157.5,157.5)'%3E%3Cpath d='M-3,-5h6v10h-6zM1.5,0a0.5,0.5 0 1,0 0.01,0' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(165.0,165.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(172.5,157.5)'%3E%3Ccircle cx='0' cy='0' r='4' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Cpath d='M0,-2v2h2' stroke='%235c5549' stroke-width='0.75' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(0.0,165.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(15.0,172.5)'%3E%3Ccircle cx='0' cy='0' r='2.2' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Cpath d='M0,-4.5v1M0,3.5v1M-4.5,0h1M3.5,0h1M-3,-3l0.8,0.8M2.2,2.2l0.8,0.8M3,-3l-0.8,0.8M-2.2,2.2l-0.8,0.8' stroke='%235c5549' stroke-width='0.7' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(22.5,0.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(30.0,172.5)'%3E%3Cpath d='M0,3.5c0,0-4-2.8-4-5a2.2,2.2 0 0,1 4,-0.6 2.2,2.2 0 0,1 4,0.6c0,2.2-4,5-4,5z' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(37.5,0.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(45.0,172.5)'%3E%3Cpath d='M-4,3.5l8-7-5,7.5-1-3z' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(52.5,0.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(60.0,172.5)'%3E%3Cpath d='M-4.5,-1h9v4h-9zM-4.5,-1v2M4.5,-1v2M-3,3v1.5M3,3v1.5' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(67.5,0.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(75.0,172.5)'%3E%3Ccircle cx='-1' cy='-1' r='2.8' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3Cpath d='M1.2,1.2l3.2,3.2' stroke='%235c5549' stroke-width='0.95' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(82.5,0.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(90.0,172.5)'%3E%3Cpath d='M-3.5,-3h7v6.5h-7zM-3.5,-0.5h7M-1.8,-4.5v1.5M1.8,-4.5v1.5' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(97.5,0.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(105.0,172.5)'%3E%3Cpath d='M0,-4q0,4 4,4q-4,0-4,4q0-4-4-4q4,0 4,-4z' stroke='%235c5549' stroke-width='0.75' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(112.5,0.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(120.0,172.5)'%3E%3Cpath d='M-2,-3a2.8,2.8 0 0,1 4,0c0.5,1.2-1,2.5-1,3.5h-2c0-1-1.5-2.3-1-3.5zM-1.5,1.5h3' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(127.5,0.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(135.0,172.5)'%3E%3Cpath d='M-4.5,-1l2.5,2 2,-1.5 2,1.5 2.5,-2M-2,1l1.5,1.5 1.5,-1.5' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(142.5,0.0)'%3E%3Ccircle cx='0' cy='0' r='0.7' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(150.0,172.5)'%3E%3Cpath d='M-4,-1l4-3.5 4,3.5v4.5h-8zM2,-3v-1.5h1.5v2.8' stroke='%235c5549' stroke-width='0.9' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(157.5,0.0)'%3E%3Cpath d='M-1,0h2M0,-1v2' stroke='%235c5549' stroke-width='0.55' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(165.0,172.5)'%3E%3Cpath d='M-3,-4.5h4.5l2,2v7h-6.5zM-1.5,-1.5h3M-1.5,1h3M-1.5,3h2' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(172.5,0.0)'%3E%3Cpath d='M-0.8,-0.8l1.6,1.6M0.8,-0.8l-1.6,1.6' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(0.0,172.5)'%3E%3Cpath d='M-4,1.5l1.5,-3h5l1.5,3v2.5h-8zM-2.5,4a0.8,0.8 0 1,0 0.01,0M2.5,4a0.8,0.8 0 1,0 0.01,0' stroke='%235c5549' stroke-width='0.8' stroke-opacity='0.14'/%3E%3C/g%3E%3Cg transform='translate(7.5,0.0)'%3E%3Cpath d='M0,-1.2l1.2,1.2-1.2,1.2-1.2-1.2z' stroke='%235c5549' stroke-width='0.5' stroke-opacity='0.14'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

/* ----------------------------- types & helpers ---------------------------- */
type RexPersona = "buyer" | "seller" | "tenant" | "owner" | "broker";

interface InChatAuthData {
  first_name?: string;
  last_name?: string;
  role?: RexPersona | string;
  phone?: string;
  email?: string;
  targetProperty?: RexPropertyCardData;
  sellerPropertyData?: SellerPropertyFormData;
  actionType?: "schedule_visit" | "interested" | "executive_callback";
}

type InChatAuthStage =
  | "idle"
  | "asking_name"
  | "asking_phone"
  | "asking_email"
  | "verifying_otp";

function getBuyerSafePropertyTitle(p?: { title?: string; unit_type?: string; property_subtype?: string; property_type?: string; location?: string } | null): string {
  if (!p) return "this property";
  const ut = p.unit_type || "";
  const subType = p.property_subtype || p.property_type || "Apartment";
  const loc = p.location || "";

  if (p.title) {
    let t = p.title
      .replace(/\[REX\d+\]\s*/gi, "")
      .replace(/\s*\([^)]*\)/g, "")
      .replace(/\s+in\s+.*$/i, loc ? ` in ${loc}` : "")
      .replace(/in Others/gi, loc ? `in ${loc}` : "")
      .trim();
    if (t) return t;
  }
  return [ut, subType, loc ? `in ${loc}` : ""].filter(Boolean).join(" ").trim() || "Verified Property";
}

interface ParsedVisitDateTime {
  date: string; // YYYY-MM-DD
  time: string; // e.g. "05:00 PM"
  shift: "Morning" | "Afternoon" | "Evening";
  formattedDisplay: string;
}

function parseVisitDateTime(text: string): ParsedVisitDateTime | null {
  const lower = text.toLowerCase().trim();

  // 1. Extract Time
  let timeStr: string | null = null;
  let shift: "Morning" | "Afternoon" | "Evening" = "Evening";

  // Match e.g. "5pm", "5 pm", "5:30pm", "5:30 pm", "05:00 pm", "11am", "11:00 am"
  const timeRegex = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)\b/i;
  const timeMatch = lower.match(timeRegex);

  // Match e.g. "at 5", "at 17:00", "at 11"
  const atTimeRegex = /\bat\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i;
  const atTimeMatch = lower.match(atTimeRegex);

  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const meridian = timeMatch[3].toLowerCase().replace(/\./g, "");

    if (meridian === "pm" && hour < 12) hour += 12;
    if (meridian === "am" && hour === 12) hour = 0;

    shift = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const ampm = hour >= 12 ? "PM" : "AM";
    timeStr = `${String(displayHour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${ampm}`;
  } else if (atTimeMatch && (atTimeMatch[3] || parseInt(atTimeMatch[1], 10) <= 24)) {
    let hour = parseInt(atTimeMatch[1], 10);
    const minute = atTimeMatch[2] ? parseInt(atTimeMatch[2], 10) : 0;
    const meridian = atTimeMatch[3] ? atTimeMatch[3].toLowerCase().replace(/\./g, "") : null;

    if (meridian) {
      if (meridian === "pm" && hour < 12) hour += 12;
      if (meridian === "am" && hour === 12) hour = 0;
    } else if (hour >= 1 && hour <= 7) {
      hour += 12;
    }

    shift = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const ampm = hour >= 12 ? "PM" : "AM";
    timeStr = `${String(displayHour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${ampm}`;
  } else if (lower.includes("morning")) {
    timeStr = "10:00 AM";
    shift = "Morning";
  } else if (lower.includes("afternoon")) {
    timeStr = "02:30 PM";
    shift = "Afternoon";
  } else if (lower.includes("evening")) {
    timeStr = "05:30 PM";
    shift = "Evening";
  }

  // 2. Extract Date
  let dateObj: Date | null = null;
  let dateLabel = "";
  const now = new Date();

  if (lower.includes("day after tomorrow") || lower.includes("parso")) {
    dateObj = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    dateLabel = "Day after tomorrow";
  } else if (lower.includes("tomorrow") || lower.includes("kal") || lower.includes("tmrw")) {
    dateObj = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    dateLabel = "Tomorrow";
  } else if (lower.includes("today") || lower.includes("aaj")) {
    dateObj = new Date(now.getTime());
    dateLabel = "Today";
  } else {
    // Check weekday names
    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    for (let i = 0; i < daysOfWeek.length; i++) {
      if (lower.includes(daysOfWeek[i])) {
        const currentDay = now.getDay();
        let diff = i - currentDay;
        if (diff <= 0) diff += 7; // Next occurrence
        dateObj = new Date(now.getTime() + diff * 24 * 60 * 60 * 1000);
        dateLabel = daysOfWeek[i].charAt(0).toUpperCase() + daysOfWeek[i].slice(1);
        break;
      }
    }

    // Check specific month dates like "15th sept", "12 oct", "25 september"
    if (!dateObj) {
      const dateMonthRegex = /\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i;
      const dmMatch = lower.match(dateMonthRegex);
      if (dmMatch) {
        const day = parseInt(dmMatch[1], 10);
        const mStr = dmMatch[2].slice(0, 3).toLowerCase();
        const monthIndex = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(mStr);
        if (monthIndex >= 0) {
          const year = now.getFullYear();
          dateObj = new Date(year, monthIndex, day);
          if (dateObj.getTime() < now.getTime() - 24 * 60 * 60 * 1000) {
            dateObj.setFullYear(year + 1);
          }
          dateLabel = `${day} ${dmMatch[2]}`;
        }
      }
    }
  }

  // If neither date nor time was mentioned, return null
  if (!dateObj && !timeStr) {
    return null;
  }

  // Default to tomorrow if time is specified without date
  if (timeStr && !dateObj) {
    dateObj = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    dateLabel = "Tomorrow";
  }

  // Default to 5:00 PM if date is specified without time
  if (dateObj && !timeStr) {
    timeStr = "05:00 PM";
    shift = "Evening";
  }

  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  const formattedDate = `${yyyy}-${mm}-${dd}`;

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const formattedDisplay = `${dateLabel} (${dateObj.getDate()} ${months[dateObj.getMonth()]}) at ${timeStr}`;

  return {
    date: formattedDate,
    time: timeStr!,
    shift,
    formattedDisplay,
  };
}

function isBuyingIntentWithoutCriteria(text: string): boolean {
  const lower = text.toLowerCase().trim();

  // Non-buyer intents should not be captured
  if (
    lower.includes("sell") ||
    lower.includes("valuation") ||
    lower.includes("rent") ||
    lower.includes("tenant") ||
    lower.includes("lease") ||
    lower.includes("executive") ||
    lower.includes("status") ||
    lower.includes("broker") ||
    lower.includes("partner") ||
    lower.includes("visit")
  ) {
    return false;
  }

  const buyKeywords = [
    "i want to buy property",
    "i want to buy a property",
    "want to buy property",
    "want to buy a property",
    "buy property",
    "buy a property",
    "purchase property",
    "purchase a property",
    "buying property",
    "buying a property",
    "i want to buy",
    "i want to buy flat",
    "i want to buy a flat",
    "want to buy flat",
    "buy flat",
    "buy a flat",
    "looking to buy",
    "looking to buy property",
    "looking to buy a property",
    "i am looking to buy",
    "looking to buy flat",
    "i want to purchase",
    "search property to buy",
    "find property to buy",
    "ghar kharidna",
    "flat kharidna",
    "property purchase",
    "buy home",
    "buy house",
    "buy apartment",
  ];

  const hasBuyKeyword =
    buyKeywords.some((kw) => lower.includes(kw)) ||
    lower === "buy" ||
    lower === "buy property" ||
    lower.startsWith("buy ") ||
    lower.startsWith("buying ") ||
    lower.includes("want to buy") ||
    lower.includes("looking to buy");

  if (!hasBuyKeyword) return false;

  // Check if specific criteria are provided
  const commonAreas = [
    "wakad", "tathawade", "hinjewadi", "punawale", "rahatani", "ravet", "kiwale", "mamurdi",
    "baner", "balewadi", "mahalunge", "sus", "bavdhan", "pashan", "aundh",
    "pimple saudagar", "pimple gurav", "pimple nilakh", "kalewadi", "thergaon",
    "pimpri", "chinchwad", "akurdi", "nigdi", "katraj", "dhayari", "narhe",
    "kondhwa", "undri", "kothrud", "kharadi", "viman nagar", "koregaon park",
    "magarpatta", "hadapsar", "wagholi", "dhanori"
  ];
  const hasLocation = commonAreas.some((loc) => lower.includes(loc));
  const hasBhk = /\b(\d+(?:\.\d+)?)\s*(?:bhk|bedroom|bed)\b/i.test(lower);
  const hasBudget =
    /(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:cr|crore|crores|l|lakh|lakhs|lac|lacs)/i.test(lower) ||
    /\b(under|below|budget|upto|within|max|less than)\s*(?:₹|rs\.?)?\s*\d+/i.test(lower);

  // If user provided location AND (BHK or budget), or BHK AND budget -> it's a specific search, so return false
  if (hasLocation && (hasBhk || hasBudget)) return false;
  if (hasBhk && hasBudget) return false;

  return true;
}

function isVisitIntent(text: string): boolean {
  const lower = text.toLowerCase().trim();
  const visitKeywords = [
    "schedule a site visit",
    "schedule site visit",
    "schedule a visit",
    "schedule visit",
    "book a site visit",
    "book site visit",
    "book a visit",
    "book visit",
    "i want to visit",
    "i want to see",
    "i want to schedule visit",
    "i want to book visit",
    "i want to book a visit",
    "visit property",
    "site visit",
    "arrange visit",
    "visit tomorrow",
    "visit today",
  ];
  return (
    visitKeywords.some((kw) => lower.includes(kw)) ||
    (/\b(visit|site visit)\b/i.test(lower) && !lower.includes("visitor"))
  );
}

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
    isReschedule?: boolean;
    disabled?: boolean;
  };
  confirmedVisit?: RexVisitData;
  inChatAuthForm?: {
    initialName?: string;
    initialEmail?: string;
    initialPhone?: string;
    role?: string;
    targetProperty?: RexPropertyCardData;
    sellerPropertyData?: SellerPropertyFormData;
    actionType?: "schedule_visit" | "interested" | "executive_callback";
    disabled?: boolean;
  };
  inChatOtp?: {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    role?: string;
    targetProperty?: RexPropertyCardData;
    sellerPropertyData?: SellerPropertyFormData;
  };
  buyerFilterCard?: {
    initialLocation?: string;
    initialBhk?: string;
    initialBudget?: string;
    disabled?: boolean;
  };
  sellerWizardCard?: {
    initialData?: Partial<SellerPropertyFormData>;
    disabled?: boolean;
  };
  sellerConfirmedCard?: {
    data: SellerPropertyFormData;
  };
  sellerInsightsCard?: {
    data: SellerInsightsData;
  };
  scheduleLaterCard?: {
    property: RexPropertyCardData;
    executive?: {
      id?: number | null;
      name?: string;
      role?: string;
      phone?: string;
      email?: string;
      avatar?: string;
    };
  };
}

interface AIChatbotProps {
  isPropertyDetail?: boolean;
}

const REX_SESSION_STORAGE_KEY = "rex_session_uuid";
const REX_AI_MESSAGES_KEY = "rex_ai_messages";
const REX_AUTH_STAGE_KEY = "rex_inchat_auth_stage";
const REX_AUTH_DATA_KEY = "rex_inchat_auth_data";
const REX_PERSONA_KEY = "rex_selected_persona";
const REX_CHAT_MODE_KEY = "rex_chat_mode";
const REX_WIDGET_OPEN_KEY = "rex_widget_is_open";

function cleanDisplayText(text?: string | null): string {
  if (!text) return "";
  return text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanPropertyTitle(title?: string | null, location?: string | null): string {
  if (!title) return "Residential Property";
  let cleaned = title;
  cleaned = cleaned.replace(/\[REX\d+\]\s*/gi, "");
  cleaned = cleaned.replace(/\s*\([^)]*\)/g, "");
  cleaned = cleaned.replace(/\s+in\s+.*$/i, (match) => {
    const lower = match.toLowerCase();
    const allowedAreas = [
      "pune", "mumbai", "hinjewadi", "baner", "wakad", "punawale",
      "kharadi", "ravet", "kothrud", "hadapsar", "bavdhan", "pcmc", "maharashtra"
    ];
    if (allowedAreas.some((area) => lower.includes(area))) {
      return match;
    }
    return "";
  });
  cleaned = cleaned.trim();
  return cleaned || (location ? `Property in ${location}` : "Residential Property");
}

function formatRupeePrice(price?: number | string | null): string {
  if (!price) return "Price on Request";
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return String(price);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakh`;
  return `₹${num.toLocaleString("en-IN")}`;
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

/* ---------------- Inline In-Chat Registration & Login Form Card ------------- */
interface InlineAuthCardProps {
  title?: string;
  initialName?: string;
  initialEmail?: string;
  initialPhone?: string;
  onSendOtp: (data: { name: string; email: string; phone: string }) => Promise<void>;
  onVerifyOtp: (otp: string, data: { name: string; email: string; phone: string }) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

const InlineInChatAuthCard: React.FC<InlineAuthCardProps> = ({
  title = "Before moving forward, kindly provide your details below.",
  initialName = "",
  initialEmail = "",
  initialPhone = "",
  onSendOtp,
  onVerifyOtp,
  onCancel,
  loading = false,
}) => {
  const [step, setStep] = useState<"details" | "otp">("details");
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState<number>(60);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const handleSendOtpClick = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 2) {
      setErrorMsg("Please enter your full name (at least 2 characters).");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setIsSendingOtp(true);
      await onSendOtp({ name: cleanName, email: cleanEmail, phone: cleanPhone });
      setStep("otp");
      setCountdown(60);
      setDigits(["", "", "", "", "", ""]);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send verification code. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const submitVerification = async (otpCode: string) => {
    if (otpCode.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit OTP.");
      return;
    }
    setErrorMsg("");
    try {
      setIsVerifying(true);
      await onVerifyOtp(otpCode, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.replace(/\D/g, ""),
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid verification code. Please check and try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "");
    if (!clean) {
      const newDigits = [...digits];
      newDigits[index] = "";
      setDigits(newDigits);
      return;
    }

    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split("");
      const newDigits = [...digits];
      chars.forEach((c, i) => {
        if (i < 6) newDigits[i] = c;
      });
      setDigits(newDigits);
      const nextIdx = Math.min(chars.length, 5);
      inputRefs.current[nextIdx]?.focus();
      if (chars.length === 6) {
        submitVerification(newDigits.join(""));
      }
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = clean.slice(-1);
    setDigits(newDigits);
    setErrorMsg("");

    if (index < 5 && clean) {
      inputRefs.current[index + 1]?.focus();
    } else if (index === 5 && clean) {
      const fullOtp = newDigits.join("");
      if (fullOtp.length === 6) {
        submitVerification(fullOtp);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "Enter") {
      submitVerification(digits.join(""));
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newDigits = [...digits];
    pasted.split("").forEach((c, i) => {
      if (i < 6) newDigits[i] = c;
    });
    setDigits(newDigits);
    const nextIdx = Math.min(pasted.length, 5);
    inputRefs.current[nextIdx]?.focus();
    if (pasted.length === 6) {
      submitVerification(pasted);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isSendingOtp) return;
    setErrorMsg("");
    try {
      setIsSendingOtp(true);
      await onSendOtp({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.replace(/\D/g, ""),
      });
      setCountdown(60);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to resend code. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  if (step === "otp") {
    return (
      <div className="w-full bg-white border border-emerald-200/90 rounded-2xl p-4 shadow-sm space-y-3 text-slate-800 text-left my-1 animate-fadeIn">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={15} />
            </div>
            <div>
              <p className="text-[12.5px] font-bold text-slate-900 leading-snug">
                Verify Email Address
              </p>
              <p className="text-[11px] text-slate-500">
                OTP sent to <span className="font-semibold text-slate-800">{email}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setStep("details");
              setErrorMsg("");
            }}
            disabled={isVerifying || loading}
            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
          >
            Edit Email
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 py-1">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                onPaste={idx === 0 ? handleOtpPaste : undefined}
                disabled={isVerifying || loading}
                className={`w-9 h-11 sm:w-10 sm:h-12 text-center text-sm sm:text-base font-bold rounded-xl border transition-all ${
                  digit
                    ? "border-emerald-500 bg-emerald-50/40 text-emerald-900 font-extrabold shadow-xs"
                    : "border-slate-200 bg-slate-50 text-slate-900 focus:border-[#0f2b3d] focus:bg-white"
                } focus:outline-none`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] px-1">
            {countdown > 0 ? (
              <span className="text-slate-400 font-medium">
                Resend code in <strong className="text-slate-700">{countdown}s</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isSendingOtp || isVerifying || loading}
                className="text-emerald-700 font-bold hover:underline cursor-pointer disabled:opacity-50"
              >
                {isSendingOtp ? "Resending..." : "Resend OTP"}
              </button>
            )}
            <span className="text-slate-400">6-digit security code</span>
          </div>

          {errorMsg && (
            <p className="text-[11px] text-rose-600 font-medium bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-100">
              {errorMsg}
            </p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setStep("details");
                setErrorMsg("");
              }}
              disabled={isVerifying || loading}
              className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => submitVerification(digits.join(""))}
              disabled={digits.join("").length !== 6 || isVerifying || loading}
              className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isVerifying || loading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Verify & Submit</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3 text-slate-800 text-left my-1 animate-fadeIn">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <UserIcon size={14} />
        </div>
        <p className="text-[12.5px] font-bold text-slate-800 leading-snug">
          {title}
        </p>
      </div>

      <form onSubmit={handleSendOtpClick} className="space-y-2.5">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrorMsg(""); }}
            placeholder="Your full name"
            disabled={isSendingOtp || loading}
            className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0f2b3d] focus:bg-white transition-all text-slate-900"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            Email <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
            placeholder="your.email@example.com"
            disabled={isSendingOtp || loading}
            className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0f2b3d] focus:bg-white transition-all text-slate-900"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[11px] font-bold text-slate-600">
              Phone <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400">{phone.replace(/\D/g, "").length}/10 digits</span>
          </div>
          <input
            type="tel"
            maxLength={10}
            value={phone}
            onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setErrorMsg(""); }}
            placeholder="10-digit mobile number"
            disabled={isSendingOtp || loading}
            className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0f2b3d] focus:bg-white transition-all text-slate-900"
          />
        </div>

        {errorMsg && (
          <p className="text-[11px] text-rose-600 font-medium bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
            {errorMsg}
          </p>
        )}

        <div className="flex items-center gap-2 pt-1.5">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSendingOtp || loading}
              className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSendingOtp || loading}
            className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isSendingOtp || loading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Sending OTP...</span>
              </>
            ) : (
              <>
                <span>Verify Email & Continue</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ------------------ Inline In-Chat 6-Digit OTP Card Component --------------- */
interface InlineOtpCardProps {
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onEditEmail?: () => void;
  loading?: boolean;
}

const InlineInChatOtpCard: React.FC<InlineOtpCardProps> = ({
  email,
  onVerify,
  onResend,
  onEditEmail,
  loading = false,
}) => {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState<number>(60);
  const [resending, setResending] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, "");
    if (!clean) {
      const newDigits = [...digits];
      newDigits[index] = "";
      setDigits(newDigits);
      return;
    }

    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split("");
      const newDigits = [...digits];
      chars.forEach((c, i) => {
        if (i < 6) newDigits[i] = c;
      });
      setDigits(newDigits);
      const nextIdx = Math.min(chars.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = clean.slice(-1);
    setDigits(newDigits);
    setErrorMsg("");

    if (index < 5 && clean) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleResendClick = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setErrorMsg("");
    try {
      await onResend();
      setCountdown(60);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async () => {
    const otp = digits.join("").trim();
    if (otp.length < 6) {
      setErrorMsg("Please enter the complete 6-digit code");
      return;
    }

    try {
      setErrorMsg("");
      await onVerify(otp);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid verification code. Please try again.");
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3.5 text-slate-800 text-left">
      <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <KeyRound size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-bold text-[13px] text-slate-900 leading-tight">Verify Your Email</h4>
            {onEditEmail && (
              <button
                type="button"
                onClick={onEditEmail}
                className="text-[10.5px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer"
                title="Change or fix email address"
              >
                Edit Email
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-500 leading-tight mt-0.5 truncate">
            Code sent to <span className="font-semibold text-slate-700">{email}</span>
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center gap-1.5 py-1">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={loading}
            className={`w-10 h-11 text-center text-base font-bold rounded-xl border bg-slate-50 transition-all outline-none ${
              digit
                ? "border-emerald-500 bg-emerald-50/40 text-emerald-800 shadow-2xs"
                : "border-slate-200 text-slate-900 focus:border-[#0f2b3d] focus:bg-white"
            } disabled:opacity-50`}
          />
        ))}
      </div>

      {errorMsg && (
        <p className="text-[11px] text-rose-600 font-medium bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 text-center">
          {errorMsg}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || digits.join("").length < 6}
        className="w-full py-2.5 px-4 bg-[#0f2b3d] hover:bg-[#163e58] disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            <span>Verifying...</span>
          </>
        ) : (
          <>
            <span>Verify & Continue</span>
            <ArrowRight size={14} />
          </>
        )}
      </button>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
        <span className="flex items-center gap-1">
          <ShieldCheck size={12} className="text-emerald-600" />
          <span>Secure In-Chat Auth</span>
        </span>

        {countdown > 0 ? (
          <span className="text-slate-400">Resend code in {countdown}s</span>
        ) : (
          <button
            type="button"
            onClick={handleResendClick}
            disabled={resending}
            className="text-emerald-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            {resending && <Loader2 size={11} className="animate-spin" />}
            <span>Resend Code</span>
          </button>
        )}
      </div>
    </div>
  );
};

/* -------------------------------- component ------------------------------- */
export const AIChatbot: React.FC<AIChatbotProps> = () => {
  const { width } = useWindowSize();
  const isMobile = width > 0 ? width < 640 : false;
  const { user, isAuthenticated, setAuthSession } = useAuth();
  const location = useLocation();

  // Widget States
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(REX_WIDGET_OPEN_KEY) === "true";
    }
    return false;
  });
  const [isMinimized, setIsMinimized] = useState(false);

  // Clean Navigation Mode: "rex_ai" (AI search & persona) | "property_chat" (Dedicated Executive Chat) | "inquiries_list" (All Conversations List)
  const [chatMode, setChatMode] = useState<"rex_ai" | "property_chat" | "inquiries_list">(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(REX_CHAT_MODE_KEY);
      if (stored === "property_chat" || stored === "inquiries_list" || stored === "rex_ai") {
        return stored;
      }
    }
    return "rex_ai";
  });

  // Persona State (Identified at the very beginning)
  const [selectedPersona, setSelectedPersona] = useState<RexPersona>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(REX_PERSONA_KEY);
      if (stored && ["buyer", "seller", "tenant", "owner", "broker"].includes(stored)) {
        return stored as RexPersona;
      }
    }
    return "buyer";
  });

  // In-Chat Conversational Authentication State Machine
  const [inChatAuthStage, setInChatAuthStage] = useState<InChatAuthStage>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(REX_AUTH_STAGE_KEY);
      if (stored && ["idle", "asking_name", "asking_phone", "asking_email", "verifying_otp"].includes(stored)) {
        return stored as InChatAuthStage;
      }
    }
    return "idle";
  });

  const [inChatAuthData, setInChatAuthData] = useState<InChatAuthData>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(REX_AUTH_DATA_KEY);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return {};
  });

  // 1. Separate REX AI Stream (No overlap with property chats)
  const initialGreeting: AIMessage = useMemo(
    () => {
      const userName = isAuthenticated && user?.first_name ? user.first_name : null;
      return {
        id: "initial_welcome",
        text: userName
          ? `Welcome back, ${userName}! How can I assist you with Pune real estate today? Please choose your goal:`
          : "Welcome to Resale Expert. How can I assist you today? Please choose your goal to get started:",
        sender: "bot",
        timestamp: new Date(),
        suggestions: [
          "Buy Property",
          "Sell Property",
          "Search Rental Home",
          "List Property for Rent",
          "Broker / Partner",
        ],
      };
    },
    [isAuthenticated, user?.first_name]
  );

  const [aiMessages, setAiMessages] = useState<AIMessage[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(REX_AI_MESSAGES_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((m: any) => ({
              ...m,
              timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
            }));
          }
        }
      } catch (e) {
        console.warn("Failed to parse cached REX messages:", e);
      }
    }
    return [initialGreeting];
  });

  const [isAiTyping, setIsAiTyping] = useState(false);
  const [sessionUuid, setSessionUuid] = useState<string | null>(() => {
    return typeof window !== "undefined" ? localStorage.getItem(REX_SESSION_STORAGE_KEY) : null;
  });
  const [rexProfile, setRexProfile] = useState<RexProfile>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("rex_profile_cache");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return {};
  });
  const [rexRequirements, setRexRequirements] = useState<RexRequirements>({});

  useEffect(() => {
    if (rexProfile && Object.keys(rexProfile).length > 0) {
      localStorage.setItem("rex_profile_cache", JSON.stringify(rexProfile));
    }
  }, [rexProfile]);

  useEffect(() => {
    if (user && user.email) {
      const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
      setRexProfile((prev) => ({
        ...prev,
        name: fullName || prev?.name,
        email: user.email,
        phone: user.phone || prev?.phone || "",
      }));
      setInChatAuthData((prev) => ({
        ...prev,
        email: user.email,
        first_name: user.first_name || prev.first_name,
        last_name: user.last_name || prev.last_name,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  // 2. Separate Property Conversation Stream (Clean Executive Chat without AI overlap)
  const [activeConversation, setActiveConversation] = useState<PropertyConversation | null>(null);
  const [propertyMessages, setPropertyMessages] = useState<PropertyChatMessage[]>([]);
  const [loadingPropertyMessages, setLoadingPropertyMessages] = useState(false);
  const [allConversations, setAllConversations] = useState<PropertyConversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [inquirySearch, setInquirySearch] = useState("");
  const [currentPropertyContext, setCurrentPropertyContext] = useState<OpenPropertyChatOptions | null>(null);
  const [executiveTyping, setExecutiveTyping] = useState(false);

  // Auto-persist reactive state to LocalStorage
  useEffect(() => {
    if (aiMessages && aiMessages.length > 0) {
      localStorage.setItem(REX_AI_MESSAGES_KEY, JSON.stringify(aiMessages));
    }
  }, [aiMessages]);

  useEffect(() => {
    localStorage.setItem(REX_AUTH_STAGE_KEY, inChatAuthStage);
  }, [inChatAuthStage]);

  useEffect(() => {
    localStorage.setItem(REX_AUTH_DATA_KEY, JSON.stringify(inChatAuthData));
  }, [inChatAuthData]);

  useEffect(() => {
    localStorage.setItem(REX_PERSONA_KEY, selectedPersona);
  }, [selectedPersona]);

  useEffect(() => {
    localStorage.setItem(REX_CHAT_MODE_KEY, chatMode);
  }, [chatMode]);

  useEffect(() => {
    localStorage.setItem(REX_WIDGET_OPEN_KEY, isOpen ? "true" : "false");
  }, [isOpen]);

  // If user is already authenticated, clear any pending in-chat auth stage
  useEffect(() => {
    if (isAuthenticated) {
      if (inChatAuthStage !== "idle") {
        setInChatAuthStage("idle");
        setInChatAuthData({});
        localStorage.removeItem(REX_AUTH_STAGE_KEY);
        localStorage.removeItem(REX_AUTH_DATA_KEY);
      }
    }
  }, [isAuthenticated, inChatAuthStage]);

  // Unified Chat Input & Attachment States
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<{
    url: string;
    type: "image" | "video";
    title?: string;
  } | null>(null);
  const mediaInputRef = useRef<HTMLInputElement | null>(null);

  // Inline Visit Scheduler & Quick Property Details Drawer states
  const [propertyVisitSchedulerVisible, setPropertyVisitSchedulerVisible] = useState(false);
  const [propertyDetailsVisible, setPropertyDetailsVisible] = useState(false);

  const aiMessagesEndRef = useRef<HTMLDivElement | null>(null);
  const propertyMessagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic Property Chat Header Details
  const activeExecutiveFirstName = useMemo(() => {
    if (activeConversation?.executive_first_name) {
      return activeConversation.executive_first_name.trim();
    }
    if (activeConversation) {
      const sal = activeConversation.executive_salutation ? `${activeConversation.executive_salutation} ` : "";
      const fn = activeConversation.executive_first_name || "";
      const ln = activeConversation.executive_last_name ? ` ${activeConversation.executive_last_name}` : "";
      const combined = `${sal}${fn}${ln}`.trim();
      const cleaned = combined.replace(/^(Mr\.|Miss|Mrs\.|Ms\.|Dr\.)\s+/i, "").trim();
      const first = cleaned.split(" ")[0];
      if (first && first !== "Property" && first !== "Executive") return first;
    }
    if (currentPropertyContext?.executiveName) {
      const cleaned = currentPropertyContext.executiveName
        .replace(/^(Mr\.|Miss|Mrs\.|Ms\.|Dr\.)\s+/i, "")
        .trim();
      const first = cleaned.split(" ")[0];
      if (first && first !== "Property" && first !== "Executive") return first;
    }
    return "Executive";
  }, [activeConversation, currentPropertyContext]);

  const activeExecutiveName = useMemo(() => {
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
    return "Property Executive";
  }, [activeConversation, currentPropertyContext]);

  const activeExecutivePhone = useMemo(() => {
    return (
      activeConversation?.executive_phone ||
      currentPropertyContext?.executivePhone ||
      ""
    );
  }, [activeConversation, currentPropertyContext]);

  const rawActivePropertyTitle = useMemo(() => {
    return (
      activeConversation?.property_title ||
      currentPropertyContext?.propertyTitle ||
      ""
    );
  }, [activeConversation, currentPropertyContext]);

  const activePropertyTitle = useMemo(() => {
    return cleanPropertyTitle(rawActivePropertyTitle, activeConversation?.property_location);
  }, [rawActivePropertyTitle, activeConversation]);

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

  /* -------------------------- Reset REX Chat Helper -------------------------- */
  const handleResetChat = () => {
    localStorage.removeItem(REX_SESSION_STORAGE_KEY);
    localStorage.removeItem(REX_AI_MESSAGES_KEY);
    localStorage.removeItem(REX_AUTH_STAGE_KEY);
    localStorage.removeItem(REX_AUTH_DATA_KEY);
    localStorage.removeItem(REX_PERSONA_KEY);
    setSessionUuid(null);
    setInChatAuthStage("idle");
    setInChatAuthData({});
    setSelectedPersona("buyer");
    setAiMessages([initialGreeting]);
  };

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

  /* ----------------------- Load User Property Inquiries --------------------- */
  const loadUserConversations = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    setLoadingConversations(true);
    try {
      const res = await chatApi.getConversations({ limit: 50 });
      if (res.success && Array.isArray(res.conversations)) {
        setAllConversations(res.conversations);
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

  const totalUnreadInquiries = useMemo(() => {
    return allConversations.reduce((sum, c) => sum + (c.unread_user_count || 0), 0);
  }, [allConversations]);

  const filteredInquiries = useMemo(() => {
    if (!inquirySearch.trim()) return allConversations;
    const q = inquirySearch.toLowerCase().trim();
    return allConversations.filter(
      (c) =>
        (c.property_title && c.property_title.toLowerCase().includes(q)) ||
        (c.property_location && c.property_location.toLowerCase().includes(q)) ||
        (c.executive_first_name && c.executive_first_name.toLowerCase().includes(q))
    );
  }, [allConversations, inquirySearch]);

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

          if (session.intent) {
            const parsedIntent = session.intent.toLowerCase();
            if (["buyer", "seller", "tenant", "owner", "broker"].includes(parsedIntent)) {
              setSelectedPersona(parsedIntent as RexPersona);
            }
          }

          if (Array.isArray(session.history) && session.history.length > 0) {
            const parsedMsgs: AIMessage[] = session.history.map((h: any) => ({
              id: h.id || `hist_${Math.random()}`,
              text: h.text,
              sender: h.sender === "user" ? "user" : "bot",
              timestamp: h.timestamp ? new Date(h.timestamp) : new Date(),
              suggestions: h.suggestions || undefined,
              properties: h.properties && h.properties.length > 0 ? h.properties : undefined,
              pagination: h.pagination || undefined,
              visitScheduler: h.visitScheduler || undefined,
              confirmedVisit: h.visit || h.confirmedVisit || undefined,
              inChatOtp: h.inChatOtp || undefined,
            }));

            setAiMessages((prev) => {
              // If local state has only the greeting or backend has equal/more messages, use backend
              if (prev.length <= 1 || parsedMsgs.length >= prev.length) {
                return parsedMsgs;
              }
              // If local state contains more recent uncommitted steps (e.g. active OTP prompt), preserve them
              return prev;
            });
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
      if (chatMode === "rex_ai") {
        aiMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      } else if (chatMode === "property_chat") {
        propertyMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [aiMessages, propertyMessages, isMinimized, isOpen, isAiTyping, executiveTyping, chatMode]);

  /* --------------------------- Socket.IO Integration ------------------------ */
  const activeConvRef = useRef<PropertyConversation | null>(null);
  activeConvRef.current = activeConversation;

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
      const msg: PropertyChatMessage = raw.message || raw;
      const currentConv = activeConvRef.current;

      const isCurrentConversation =
        currentConv && Number(currentConv.id) === Number(msg.conversation_id);

      if (isCurrentConversation) {
        const isFromExecutive = msg.sender_type === "executive" || msg.sender_id !== Number(user?.id);
        if (isFromExecutive) {
          playNotificationSound();
          if (isOpen && !isMinimized && chatMode === "property_chat") {
            socket.emit("chat:read_receipt", {
              conversationId: msg.conversation_id,
              messageId: msg.id,
            });
            chatApi.markAsRead(msg.conversation_id).catch(() => {});
          }
        }

        setPropertyMessages((prev) => {
          // Avoid duplicate messages
          if (prev.some((m) => m.id === msg.id || (msg.message_uuid && m.message_uuid === msg.message_uuid))) {
            return prev;
          }
          return [...prev, msg];
        });
      }
      loadUserConversations();
    };

    const onTyping = (data: any) => {
      const currentConv = activeConvRef.current;
      if (currentConv && Number(data.conversationId) === Number(currentConv.id)) {
        if (data.userId !== Number(user?.id)) {
          setExecutiveTyping(Boolean(data.isTyping));
        }
      }
    };

    socket.on("connect", handleConnect);
    socket.on("chat:new_message", onNewMessage);
    socket.on("chat:typing", onTyping);
    socket.on("chat:user_typing", onTyping);

    return () => {
      if (activeConversation?.id) {
        socket.emit("chat:leave_room", { conversationId: activeConversation.id });
      }
      socket.off("connect", handleConnect);
      socket.off("chat:new_message", onNewMessage);
      socket.off("chat:typing", onTyping);
      socket.off("chat:user_typing", onTyping);
    };
  }, [isAuthenticated, user?.id, activeConversation?.id, activeExecutiveName, isOpen, isMinimized, chatMode, loadUserConversations]);

  /* -------------------- Open Specific Property Conversation ------------------ */
  const handleOpenPropertyConversation = useCallback(
    async (opts: OpenPropertyChatOptions) => {
      setIsOpen(true);
      setIsMinimized(false);
      setCurrentPropertyContext(opts);

      if (!isAuthenticated) {
        setChatMode("rex_ai");
        const cachedEmail = rexProfile?.email || inChatAuthData?.email || "";
        const cachedName = rexProfile?.name || (inChatAuthData?.first_name ? `${inChatAuthData.first_name} ${inChatAuthData.last_name || ""}`.trim() : "");
        const cachedPhone = rexProfile?.phone || inChatAuthData?.phone || "";

        const targetProp = {
          id: Number(opts.propertyId),
          slug: opts.propertySlug || String(opts.propertyId),
          title: opts.propertyTitle || "Property Inquiry",
          price: opts.propertyPrice ? Number(opts.propertyPrice) : 0,
        };

        const authFormMsg: AIMessage = {
          id: `auth_form_${Date.now()}`,
          text: cachedName 
            ? `Welcome back, ${cachedName}! Please confirm your details below to connect with your dedicated executive for ${opts.propertyTitle || "this property"}:`
            : `To connect with our dedicated executive for ${opts.propertyTitle || "this property"}, kindly provide your details below:`,
          sender: "bot",
          timestamp: new Date(),
          inChatAuthForm: {
            initialName: cachedName,
            initialEmail: cachedEmail,
            initialPhone: cachedPhone,
            role: "buyer",
            targetProperty: targetProp,
            actionType: "executive_callback",
          },
        };

        setAiMessages((prev) => [...prev, authFormMsg]);
        return;
      }

      setLoadingPropertyMessages(true);
      setChatMode("property_chat");

      try {
        const res = await chatApi.createOrGetConversation({
          property_id: opts.propertyId,
          initial_message: opts.initialMessage || undefined,
        });

        if (res.success && res.conversation) {
          const conv = res.conversation;
          setActiveConversation(conv);

          const socket = getSocket();
          if (socket) {
            socket.emit("chat:join_room", { conversationId: conv.id });
            socket.emit("chat:read_receipt", { conversationId: conv.id });
          }

          // Fetch messages for this specific property
          const msgRes = await chatApi.getMessages(conv.id, { limit: 50 });
          if (msgRes.success && Array.isArray(msgRes.messages)) {
            setPropertyMessages(msgRes.messages);
          }
          chatApi.markAsRead(conv.id).catch(() => {});
        }
      } catch (err) {
        console.error("Error opening property conversation:", err);
      } finally {
        setLoadingPropertyMessages(false);
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
      setChatMode("rex_ai");
    } else if (openChat === "true" && propertyId && isAuthenticated) {
      handleOpenPropertyConversation({ propertyId });
    }
  }, [location.search, isAuthenticated, handleOpenPropertyConversation]);

  /* ------------------------- Interactive REX Actions ------------------------ */
  const [isLoadingMoreProperties, setIsLoadingMoreProperties] = useState(false);
  const [isBookingVisit, setIsBookingVisit] = useState(false);

  const handlePropertyInterested = async (property: RexPropertyCardData) => {
    if (!isAuthenticated) {
      const knownEmail = rexProfile?.email || inChatAuthData?.email;

      // Returning / Known User with cached email: Trigger 1-click OTP verification directly!
      if (knownEmail) {
        const updatedAuth: InChatAuthData = {
          ...inChatAuthData,
          email: knownEmail,
          first_name: rexProfile?.name?.split(" ")[0] || inChatAuthData.first_name || "Client",
          last_name: rexProfile?.name?.split(" ").slice(1).join(" ") || inChatAuthData.last_name || "",
          phone: rexProfile?.phone || inChatAuthData.phone,
          role: selectedPersona || "buyer",
          targetProperty: property,
        };
        setInChatAuthData(updatedAuth);
        setInChatAuthStage("verifying_otp");

        const promptMsg: AIMessage = {
          id: `auth_quick_${Date.now()}`,
          text: `Welcome back${rexProfile?.name ? `, ${rexProfile.name}` : ""}! To verify and confirm your site visit for ${property.title}, I've sent a 6-digit verification code to ${knownEmail}. Please enter it below:`,
          sender: "bot",
          timestamp: new Date(),
        };
        setAiMessages((prev) => [...prev, promptMsg]);
        setIsSending(true);

        try {
          await rexApi.sendInChatOtp({
            email: knownEmail,
            first_name: updatedAuth.first_name,
            last_name: updatedAuth.last_name,
            phone: updatedAuth.phone,
            role: updatedAuth.role,
          });

          const otpCardMsg: AIMessage = {
            id: `otp_card_${Date.now()}`,
            text: `Please enter the 6-digit code sent to ${knownEmail}:`,
            sender: "bot",
            timestamp: new Date(),
            inChatOtp: {
              email: knownEmail,
              first_name: updatedAuth.first_name,
              last_name: updatedAuth.last_name,
              phone: updatedAuth.phone,
              role: updatedAuth.role,
              targetProperty: property,
            },
          };
          setAiMessages((prev) => [...prev, otpCardMsg]);
        } catch (err: any) {
          console.error("Failed to send quick OTP:", err);
          const errMsg: AIMessage = {
            id: `err_otp_${Date.now()}`,
            text: err.message || "Failed to send verification code. Please enter your details below:",
            sender: "bot",
            timestamp: new Date(),
            isError: true,
            inChatAuthForm: {
              initialEmail: knownEmail,
              role: selectedPersona || "buyer",
              targetProperty: property,
              actionType: "schedule_visit",
            },
          };
          setAiMessages((prev) => [...prev, errMsg]);
        } finally {
          setIsSending(false);
        }
        return;
      }

      // Render the clean Inline Registration/Login Form Card!
      const authFormMsg: AIMessage = {
        id: `auth_form_${Date.now()}`,
        text: `Before moving forward, kindly provide your details below to schedule your verified visit for ${getBuyerSafePropertyTitle(property)}:`,
        sender: "bot",
        timestamp: new Date(),
        inChatAuthForm: {
          initialName: inChatAuthData.first_name ? `${inChatAuthData.first_name} ${inChatAuthData.last_name || ""}`.trim() : "",
          initialEmail: inChatAuthData.email || "",
          initialPhone: inChatAuthData.phone || "",
          role: selectedPersona || "buyer",
          targetProperty: property,
          actionType: "schedule_visit",
        },
      };
      setAiMessages((prev) => [...prev, authFormMsg]);
      return;
    }

    const scheduleMsg: AIMessage = {
      id: `sched_${Date.now()}`,
      text: `Let's schedule a site visit for ${getBuyerSafePropertyTitle(property)} (${formatRupeePrice(property.price)}).`,
      sender: "bot",
      timestamp: new Date(),
      visitScheduler: { property },
    };
    setAiMessages((prev) => [...prev, scheduleMsg]);
  };

  const handleInChatSendOtp = async (
    formData: { name: string; email: string; phone: string },
    formMeta?: AIMessage["inChatAuthForm"]
  ) => {
    const nameParts = formData.name.split(/\s+/).filter(Boolean);
    const first_name = nameParts[0] || "Client";
    const last_name = nameParts.slice(1).join(" ");
    const cleanPhone = formData.phone.replace(/\D/g, "");

    const updatedAuth: InChatAuthData = {
      ...inChatAuthData,
      email: formData.email,
      first_name,
      last_name,
      phone: cleanPhone,
      role: formMeta?.role || selectedPersona || "buyer",
      targetProperty: formMeta?.targetProperty,
      sellerPropertyData: formMeta?.sellerPropertyData,
    };
    setInChatAuthData(updatedAuth);

    await rexApi.sendInChatOtp({
      email: formData.email,
      first_name,
      last_name,
      phone: cleanPhone,
      role: updatedAuth.role,
    });
  };

  const handleInChatVerifyAndComplete = async (
    otp: string,
    formData: { name: string; email: string; phone: string },
    formMeta?: AIMessage["inChatAuthForm"]
  ) => {
    const nameParts = formData.name.split(/\s+/).filter(Boolean);
    const first_name = nameParts[0] || "Client";
    const last_name = nameParts.slice(1).join(" ");
    const cleanPhone = formData.phone.replace(/\D/g, "");

    await handleVerifyInChatOtp(otp, {
      email: formData.email,
      first_name,
      last_name,
      phone: cleanPhone,
      role: formMeta?.role || selectedPersona || "buyer",
      targetProperty: formMeta?.targetProperty,
      sellerPropertyData: formMeta?.sellerPropertyData,
    });
  };

  const handleCancelAuthForm = (msgId: string) => {
    setAiMessages((prev) => prev.filter((m) => m.id !== msgId));
  };

  const handlePropertyNotInterested = (_property: RexPropertyCardData) => {
    const notInterestedMsg: AIMessage = {
      id: `not_int_${Date.now()}`,
      text: `Understood. Would you like to check properties in a different budget or locality?`,
      sender: "bot",
      timestamp: new Date(),
      suggestions: [
        "2 BHK in Wakad under 80 Lakhs",
        "Properties in Hinjewadi",
        "Budget under ₹60L",
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

  /* ----------------- In-Chat OTP Verification & Session Hook ---------------- */
  const handleVerifyInChatOtp = async (otp: string, otpData: NonNullable<AIMessage["inChatOtp"]>) => {
    const res = await rexApi.verifyInChatOtp({
      email: otpData.email,
      otp,
      first_name: otpData.first_name,
      last_name: otpData.last_name,
      phone: otpData.phone,
      role: otpData.role || selectedPersona || "buyer",
      session_uuid: sessionUuid || undefined,
    });

    if (res.success && res.user && res.accessToken) {
      setAuthSession(res.user, res.accessToken, res.session_id);
      setInChatAuthStage("idle");
      setInChatAuthData({});
      localStorage.removeItem(REX_AUTH_STAGE_KEY);
      localStorage.removeItem(REX_AUTH_DATA_KEY);

      const isSeller = (otpData.role || selectedPersona || inChatAuthData.role) === "seller" || Boolean(otpData.sellerPropertyData);

      if (otpData.sellerPropertyData) {
        const sellerData = otpData.sellerPropertyData;
        try {
          await rexApi.performAction({
            action: "submit_seller_property",
            payload: {
              ...sellerData,
              seller_name: res.user.first_name ? `${res.user.first_name} ${res.user.last_name || ""}`.trim() : (otpData.first_name || "Seller"),
              seller_phone: res.user.phone || otpData.phone,
              seller_email: res.user.email || otpData.email,
            },
            session_uuid: sessionUuid || undefined,
            guest_uuid: getGuestUuid(),
          });
        } catch (e) {
          console.error("Failed to auto-submit seller property post-auth:", e);
        }

        const successSellerMsg: AIMessage = {
          id: `auth_verified_seller_${Date.now()}`,
          text: `Verified successfully! Welcome, ${res.user.first_name || otpData.first_name || "there"}. Your property at ${sellerData.society_name}, ${sellerData.locality} has been submitted for review. Our Admin will assign your dedicated Property Executive shortly.`,
          sender: "bot",
          timestamp: new Date(),
          sellerConfirmedCard: { data: sellerData },
          suggestions: ["List Another Property", "Check Listing Status", "Get Free Property Valuation", "Talk to Property Executive"],
        };

        setAiMessages((prev) => [...prev, successSellerMsg]);
        loadUserConversations();
        return;
      }

      if (isSeller) {
        const successSellerGeneralMsg: AIMessage = {
          id: `auth_verified_seller_gen_${Date.now()}`,
          text: `Verified successfully! Welcome, ${res.user.first_name || "there"}. You are logged into your Seller Account. Please provide your property details below to submit for executive review:`,
          sender: "bot",
          timestamp: new Date(),
          sellerWizardCard: {
            initialData: { locality: "Punawale", bhk: "2 BHK" },
          },
          suggestions: ["Get Free Property Valuation", "Check Active Buyers in My Locality", "Talk to Property Executive"],
        };
        setAiMessages((prev) => [...prev, successSellerGeneralMsg]);
        loadUserConversations();
        return;
      }

      const successMsg: AIMessage = {
        id: `auth_verified_${Date.now()}`,
        text: `Verified successfully! Welcome, ${res.user.first_name || "there"}. Let's select your preferred site visit slot:`,
        sender: "bot",
        timestamp: new Date(),
        visitScheduler: otpData.targetProperty ? { property: otpData.targetProperty } : undefined,
      };

      setAiMessages((prev) => [...prev, successMsg]);
      rexApi.performAction({
        action: "save_message",
        payload: { messages: [successMsg], profile: { first_name: res.user.first_name, email: otpData.email } },
        session_uuid: sessionUuid,
        guest_uuid: getGuestUuid(),
      }).catch(() => {});
      loadUserConversations();
    } else {
      throw new Error(res.message || "Invalid verification code. Please check and try again.");
    }
  };

  const handleResendInChatOtp = async (otpData: NonNullable<AIMessage["inChatOtp"]>) => {
    await rexApi.sendInChatOtp({
      email: otpData.email,
      first_name: otpData.first_name,
      last_name: otpData.last_name,
      phone: otpData.phone,
      role: otpData.role || selectedPersona || "buyer",
    });
  };

  const handleEditEmail = () => {
    setInChatAuthStage("asking_email");
    const editPromptMsg: AIMessage = {
      id: `edit_email_prompt_${Date.now()}`,
      text: "Sure! Please enter your corrected email address below to receive the 6-digit verification code:",
      sender: "bot",
      timestamp: new Date(),
    };
    setAiMessages((prev) => [...prev, editPromptMsg]);
  };

  /* ---------------- Confirm Visit & Handover to Executive ------------------ */
  const handleConfirmVisitSchedule = async (
    property: RexPropertyCardData,
    payload: REXVisitSchedulePayload,
    messageId?: string
  ) => {
    if (isBookingVisit) return;
    setIsBookingVisit(true);

    try {
      const guestName = payload.guest_name || (user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : (inChatAuthData.first_name || "Client"));
      const guestPhone = payload.guest_phone || user?.phone || inChatAuthData.phone || undefined;

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
        if (messageId) {
          setAiMessages((prev) =>
            prev.map((m) =>
              m.id === messageId && m.visitScheduler
                ? { ...m, visitScheduler: { ...m.visitScheduler, disabled: true } }
                : m
            )
          );
        }

        const confirmedMsg: AIMessage = {
          id: `conf_${Date.now()}`,
          text: `Your site visit for ${getBuyerSafePropertyTitle(property)} has been confirmed for ${payload.formattedDisplay}.`,
          sender: "bot",
          timestamp: new Date(),
          confirmedVisit: res.visit,
        };

        setAiMessages((prev) => [...prev, confirmedMsg]);
        setPropertyVisitSchedulerVisible(false);

        // If in Property Chat mode (activeConversation exists), also post message to property conversation
        if (activeConversation?.id) {
          try {
            const visitMsgText = `📅 Site visit scheduled for ${getBuyerSafePropertyTitle(property)} on ${payload.formattedDisplay}.`;
            const visitMsgUuid = generateUUID();
            await chatApi.sendMessage(activeConversation.id, {
              message_text: visitMsgText,
              message_uuid: visitMsgUuid,
            });
          } catch (chatErr) {
            console.error("Failed to post visit confirmation to property conversation:", chatErr);
          }
        }

        rexApi.performAction({
          action: "save_message",
          payload: { messages: [confirmedMsg], visit: res.visit },
          session_uuid: sessionUuid,
          guest_uuid: getGuestUuid(),
        }).catch(() => {});
        loadUserConversations();
      } else {
        const errVisitMsg: AIMessage = {
          id: `err_visit_${Date.now()}`,
          text:
            res.message ||
            "Could not schedule the visit at this moment. Please try again.",
          sender: "bot",
          timestamp: new Date(),
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

  const handleRescheduleVisit = (visit: RexVisitData) => {
    const rescheduleCardMsg: AIMessage = {
      id: `sched_reschedule_${Date.now()}`,
      text: `Select your new preferred date and time slot to reschedule the site visit for ${getBuyerSafePropertyTitle({ title: visit.property_title })}:`,
      sender: "bot",
      timestamp: new Date(),
      visitScheduler: {
        property: {
          id: visit.property_id,
          slug: String(visit.property_id),
          title: getBuyerSafePropertyTitle({ title: visit.property_title }),
          price: Number(visit.property_price) || 0,
        },
        isReschedule: true,
        disabled: false,
      },
    };
    setAiMessages((prev) => [...prev, rescheduleCardMsg]);
  };

  const handleScheduleLater = async (property: RexPropertyCardData, msgId?: string) => {
    if (msgId) {
      setAiMessages((prev) =>
        prev.map((m) =>
          m.id === msgId && m.visitScheduler
            ? { ...m, visitScheduler: { ...m.visitScheduler, disabled: true } }
            : m
        )
      );
    }

    let assignedExec = {
      name: "Saroj Patil",
      role: "Area Relationship Manager",
      phone: "+91 98220 12345",
      email: "executive@resaleexpert.in",
    };

    try {
      const res = await rexApi.performAction({
        action: "schedule_later",
        payload: {
          property_id: property.id,
          property_title: property.title,
          property_location: property.location,
          property_price: property.price,
          guest_name: rexProfile?.name || inChatAuthData?.first_name,
          guest_phone: rexProfile?.phone || inChatAuthData?.phone,
          guest_email: rexProfile?.email || inChatAuthData?.email,
        },
        session_uuid: sessionUuid,
        guest_uuid: getGuestUuid(),
      });

      if (res.session_uuid && !sessionUuid) {
        setSessionUuid(res.session_uuid);
        localStorage.setItem(REX_SESSION_STORAGE_KEY, res.session_uuid);
      }
      if ((res as any)?.executive?.name) {
        assignedExec = (res as any).executive;
      }
    } catch (e) {
      console.warn("Could not save schedule_later action:", e);
    }

    const laterMsg: AIMessage = {
      id: `sched_later_${Date.now()}`,
      text: `No problem! I've bookmarked ${property.title} for you. Our dedicated Property Executive is assigned to assist you with visit scheduling, property details, and verified documentation.`,
      sender: "bot",
      timestamp: new Date(),
      scheduleLaterCard: {
        property,
        executive: assignedExec,
      },
      suggestions: ["Chat with Property Executive", "Show More Properties", "Change Search Location"],
    };
    setAiMessages((prev) => [...prev, laterMsg]);
  };

  const handleBuyerFilterSubmit = async (filters: BuyerFilterSelection, msgId?: string) => {
    if (msgId) {
      setAiMessages((prev) =>
        prev.map((m) =>
          m.id === msgId && m.buyerFilterCard
            ? { ...m, buyerFilterCard: { ...m.buyerFilterCard, disabled: true } }
            : m
        )
      );
    }

    const bhkPrefix = filters.bhk !== "Any BHK" ? filters.bhk : "Properties";
    const budgetSuffix = filters.budget !== "Any Budget" ? `in budget ${filters.budget}` : "";
    const userQuery = `${bhkPrefix} in ${filters.location} ${budgetSuffix}`.trim();

    const userMsg: AIMessage = {
      id: `u_${Date.now()}`,
      text: `Searching for: ${userQuery}`,
      sender: "user",
      timestamp: new Date(),
    };

    setAiMessages((prev) => [...prev, userMsg]);
    setIsAiTyping(true);

    try {
      const res = await rexApi.sendMessage({
        message: userQuery,
        session_uuid: sessionUuid || undefined,
        guest_uuid: getGuestUuid(),
        persona: "buyer",
        requirements: {
          locations: [filters.location],
          unit_type: filters.bhk !== "Any BHK" ? filters.bhk : undefined,
          budget: filters.budget !== "Any Budget" ? filters.budget : undefined,
        },
      });

      if (res.success) {
        if (res.session_uuid && !sessionUuid) {
          setSessionUuid(res.session_uuid);
          localStorage.setItem(REX_SESSION_STORAGE_KEY, res.session_uuid);
        }

        const hasProperties = Array.isArray(res.properties) && res.properties.length > 0;
        const isSellerReply = Boolean(
          res.reply && (
            res.reply.toLowerCase().includes("managed resale") ||
            res.reply.toLowerCase().includes("society name and configuration") ||
            res.reply.toLowerCase().includes("list my property")
          )
        );

        let botText = (res.reply && !isSellerReply) ? res.reply : `Here are available ${filters.bhk} properties in ${filters.location}:`;
        let suggestions = res.suggestions || [];

        if (!hasProperties) {
          botText = (res.reply && !isSellerReply)
            ? res.reply
            : `We currently don't have an exact ${filters.bhk} in ${filters.location} within ${filters.budget}. Would you like to explore other localities in Pune or adjust your budget?`;
          suggestions = res.suggestions && res.suggestions.length > 0 && !isSellerReply
            ? res.suggestions
            : [
                `Show all in ${filters.location}`,
                `2 BHK in Wakad`,
                `Properties in Hinjewadi`,
                `Modify Filters`,
              ];
        }

        const botMsg: AIMessage = {
          id: `bot_${Date.now()}`,
          text: botText,
          sender: "bot",
          timestamp: new Date(),
          properties: res.properties,
          pagination: res.pagination,
          suggestions,
        };

        setAiMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      console.error("Failed to query buyer properties:", err);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleSellerWizardSubmit = async (data: SellerPropertyFormData, msgId?: string) => {
    if (msgId) {
      setAiMessages((prev) =>
        prev.map((m) =>
          m.id === msgId && m.sellerWizardCard
            ? { ...m, sellerWizardCard: { ...m.sellerWizardCard, disabled: true } }
            : m
        )
      );
    }

    const userSummaryMsg: AIMessage = {
      id: `u_seller_${Date.now()}`,
      text: `Listing: ${data.bhk} at ${data.society_name}, ${data.locality} (Expected: ${data.expected_price})`,
      sender: "user",
      timestamp: new Date(),
    };
    setAiMessages((prev) => [...prev, userSummaryMsg]);

    // If not authenticated, prompt in-chat verification
    if (!isAuthenticated) {
      const cachedEmail = rexProfile?.email || inChatAuthData?.email || "";
      const cachedName = rexProfile?.name || (inChatAuthData?.first_name ? `${inChatAuthData.first_name} ${inChatAuthData.last_name || ""}`.trim() : "");
      const cachedPhone = rexProfile?.phone || inChatAuthData?.phone || "";

      const authFormMsg: AIMessage = {
        id: `bot_seller_auth_form_${Date.now()}`,
        text: `Great! To register your property at ${data.society_name}, please verify your details below so our Admin can assign your dedicated Property Executive:`,
        sender: "bot",
        timestamp: new Date(),
        inChatAuthForm: {
          initialName: cachedName,
          initialEmail: cachedEmail,
          initialPhone: cachedPhone,
          role: "seller",
          sellerPropertyData: data,
        },
      };
      setAiMessages((prev) => [...prev, authFormMsg]);
      rexApi.performAction({
        action: "save_message",
        payload: { messages: [userSummaryMsg, authFormMsg], sellerProperty: data, persona: "seller" },
        session_uuid: sessionUuid,
        guest_uuid: getGuestUuid(),
      }).then((r) => {
        if (r.session_uuid && !sessionUuid) {
          setSessionUuid(r.session_uuid);
          localStorage.setItem(REX_SESSION_STORAGE_KEY, r.session_uuid);
        }
      }).catch(() => {});
      return;
    }

    // If authenticated, submit seller property immediately
    setIsSending(true);
    try {
      const res = await rexApi.performAction({
        action: "submit_seller_property",
        payload: {
          ...data,
          seller_name: user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "Property Seller",
          seller_phone: user?.phone || undefined,
          seller_email: user?.email || undefined,
        },
        session_uuid: sessionUuid || undefined,
        guest_uuid: getGuestUuid(),
      });

      if (res.success) {
        if (res.session_uuid && !sessionUuid) {
          setSessionUuid(res.session_uuid);
          localStorage.setItem(REX_SESSION_STORAGE_KEY, res.session_uuid);
        }

        const confirmedMsg: AIMessage = {
          id: `seller_conf_${Date.now()}`,
          text: `Your property at ${data.society_name}, ${data.locality} has been submitted for review! Our Admin will assign your dedicated Property Executive shortly.`,
          sender: "bot",
          timestamp: new Date(),
          sellerConfirmedCard: { data },
          suggestions: ["List Another Property", "Check Listing Status", "Talk to Property Executive"],
        };

        setAiMessages((prev) => [...prev, confirmedMsg]);
        loadUserConversations();
      }
    } catch (err) {
      console.error("Failed to submit seller property:", err);
    } finally {
      setIsSending(false);
    }
  };

  /* ----------------------- Send Message Dispatcher ------------------------ */
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    const mediaToSend = selectedMedia;
    if ((!text && !mediaToSend) || isSending || isAiTyping) return;

    // Case A: User is in Dedicated Property Chat with Executive
    if (chatMode === "property_chat" && activeConversation && user?.id) {
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

      setPropertyMessages((prev) => [...prev, tempMsg]);
      setInputText("");
      clearMediaAttachment();
      setIsSending(true);

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
          setPropertyMessages((prev) =>
            prev.map((m) => (m.message_uuid === tempUuid ? res.message : m))
          );
        }
        loadUserConversations();
      } catch (err) {
        console.error("Failed to send property message:", err);
      } finally {
        setIsSending(false);
      }
      return;
    }

    // Case B: User is in REX AI Assistant Stream
    const lower = text.toLowerCase().trim();

    // 1) Up-Front Buy Property Intent:
    // If the user specifies incomplete criteria (e.g. "i want to buy property"), show the Property Preferences template (buyerFilterCard).
    // If user specifies location, BHK, and/or budget (e.g. "2.5 bhk in rahatani under 1.2 Cr"), isBuyingIntentWithoutCriteria returns false and it proceeds to search and show exact properties.
    if (isBuyingIntentWithoutCriteria(text)) {
      setSelectedPersona("buyer");
      const userMsg: AIMessage = { id: `u_${Date.now()}`, text, sender: "user", timestamp: new Date() };
      const botMsg: AIMessage = {
        id: `b_persona_buyer_${Date.now()}`,
        text: "Great! Please select your configuration, preferred locality, and budget to find exact matching properties:",
        sender: "bot",
        timestamp: new Date(),
        buyerFilterCard: {
          initialLocation: rexRequirements.locations?.[0] || "Punawale",
          initialBhk: rexRequirements.unit_type || "2 BHK",
          initialBudget: "₹50L - ₹80L",
        },
        suggestions: ["2 BHK in Wakad", "Properties in Hinjewadi", "3 BHK in Baner", "Budget under ₹60L"],
      };
      setAiMessages((prev) => [...prev, userMsg, botMsg]);
      setInputText("");
      rexApi.performAction({
        action: "save_message",
        payload: { messages: [userMsg, botMsg], persona: "buyer" },
        session_uuid: sessionUuid,
        guest_uuid: getGuestUuid(),
      }).then((r) => {
        if (r.session_uuid && !sessionUuid) {
          setSessionUuid(r.session_uuid);
          localStorage.setItem(REX_SESSION_STORAGE_KEY, r.session_uuid);
        }
      }).catch(() => {});
      return;
    }

    const isExactSellPrompt = ["sell property", "sell", "sell a property", "list my property", "list another property", "selling property"].includes(lower);
    if (isExactSellPrompt) {
      setSelectedPersona("seller");
      const userMsg: AIMessage = { id: `u_${Date.now()}`, text, sender: "user", timestamp: new Date() };
      const botMsg: AIMessage = {
        id: `b_persona_seller_${Date.now()}`,
        text: "We can help you sell your property with a dedicated Property Executive. Please provide your property details below:",
        sender: "bot",
        timestamp: new Date(),
        sellerWizardCard: {
          initialData: { locality: "Punawale", bhk: "2 BHK" },
        },
        suggestions: ["Get Free Property Valuation", "Check Active Buyers in My Locality", "Talk to Property Executive"],
      };
      setAiMessages((prev) => [...prev, userMsg, botMsg]);
      setInputText("");
      rexApi.performAction({
        action: "save_message",
        payload: { messages: [userMsg, botMsg], persona: "seller" },
        session_uuid: sessionUuid,
        guest_uuid: getGuestUuid(),
      }).then((r) => {
        if (r.session_uuid && !sessionUuid) {
          setSessionUuid(r.session_uuid);
          localStorage.setItem(REX_SESSION_STORAGE_KEY, r.session_uuid);
        }
      }).catch(() => {});
      return;
    }

    // Interactive Suggestion Interceptors
    if (lower === "modify filters" || lower.includes("modify filter") || lower.includes("change filter")) {
      const userMsg: AIMessage = { id: `u_${Date.now()}`, text: "Modify Filters", sender: "user", timestamp: new Date() };
      const lastFilter = [...aiMessages].reverse().find(m => m.buyerFilterCard)?.buyerFilterCard;
      const botMsg: AIMessage = {
        id: `b_mod_filters_${Date.now()}`,
        text: "Adjust your configuration, locality, and budget to refine matching properties:",
        sender: "bot",
        timestamp: new Date(),
        buyerFilterCard: {
          initialLocation: lastFilter?.initialLocation || rexRequirements.locations?.[0] || "Punawale",
          initialBhk: lastFilter?.initialBhk || rexRequirements.unit_type || "2 BHK",
          initialBudget: lastFilter?.initialBudget || "₹50L - ₹80L",
        },
        suggestions: ["Show all in Pune", "2 BHK in Wakad", "Properties in Hinjewadi"],
      };
      setAiMessages((prev) => [...prev, userMsg, botMsg]);
      setInputText("");
      return;
    }

    // 2) Site Visit Booking Intent:
    // When date and time are provided (e.g. "i want to book visit tomorrow at 5pm"), directly book in the database and show confirmed visit card.
    // When date and time are NOT provided (e.g. "i want to visit"), show the schedule visit template.
    if (isVisitIntent(text)) {
      const parsedDateTime = parseVisitDateTime(text);
      const userMsg: AIMessage = { id: `u_${Date.now()}`, text, sender: "user", timestamp: new Date() };

      // Resolve target property from active conversation or recent chat history
      let topProp: any =
        (activeConversation?.property_id
          ? {
              id: Number(activeConversation.property_id),
              slug: String(activeConversation.property_id),
              title: activeConversation.property_title || "Residential Property",
              price: Number(activeConversation.property_price) || 0,
            }
          : null) ||
        aiMessages
          .slice()
          .reverse()
          .map((m) => m.scheduleLaterCard?.property || m.confirmedVisit || m.visitScheduler?.property || (m.properties && m.properties[0]))
          .find(Boolean);

      if (topProp && topProp.property_id && !topProp.id) {
        topProp = {
          id: topProp.property_id,
          slug: String(topProp.property_id),
          title: topProp.property_title || "Residential Property",
          price: topProp.property_price || 0,
        };
      }

      // Case A: User specified Date and Time (e.g. "tomorrow at 5pm") -> Book in database directly!
      if (parsedDateTime) {
        setAiMessages((prev) => [...prev, userMsg]);
        setInputText("");
        setIsAiTyping(true);

        try {
          // If no property in chat history yet, fetch top Pune listing as target property
          if (!topProp) {
            try {
              const loadRes = await rexApi.performAction({
                action: "load_more",
                payload: { offset: 0 },
                session_uuid: sessionUuid,
                guest_uuid: getGuestUuid(),
              });
              if (loadRes.properties && loadRes.properties.length > 0) {
                topProp = loadRes.properties[0];
              }
            } catch (fetchErr) {
              console.warn("Could not fetch fallback property for visit booking:", fetchErr);
            }
          }

          if (topProp) {
            const guestName = user
              ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
              : (inChatAuthData.first_name || "Prospective Buyer");
            const guestPhone = user?.phone || inChatAuthData.phone || undefined;
            const guestEmail = user?.email || inChatAuthData.email || undefined;

            const res = await rexApi.scheduleVisit({
              property_id: Number(topProp.id),
              visit_date: parsedDateTime.date,
              visit_time: parsedDateTime.time,
              shift: parsedDateTime.shift,
              guest_name: guestName,
              guest_phone: guestPhone,
              guest_email: guestEmail,
              session_uuid: sessionUuid,
            });

            if (res.success && res.visit) {
              const confirmedMsg: AIMessage = {
                id: `conf_${Date.now()}`,
                text: `Your site visit for **${getBuyerSafePropertyTitle(topProp)}** has been confirmed for ${parsedDateTime.formattedDisplay}.`,
                sender: "bot",
                timestamp: new Date(),
                confirmedVisit: res.visit,
                suggestions: ["View more properties", "Modify Filters", "Talk to Executive"],
              };
              setAiMessages((prev) => [...prev, confirmedMsg]);
              setPropertyVisitSchedulerVisible(false);

              rexApi.performAction({
                action: "save_message",
                payload: { messages: [userMsg, confirmedMsg], visit: res.visit },
                session_uuid: sessionUuid,
                guest_uuid: getGuestUuid(),
              }).catch(() => {});
              loadUserConversations();
              return;
            }
          }

          const fallbackMsg: AIMessage = {
            id: `err_visit_${Date.now()}`,
            text: `Please explore and select a property from the listings below to book your visit for ${parsedDateTime.formattedDisplay}:`,
            sender: "bot",
            timestamp: new Date(),
            suggestions: ["Show all in Pune", "2 BHK in Wakad", "Properties in Hinjewadi"],
          };
          setAiMessages((prev) => [...prev, fallbackMsg]);
        } catch (bookingErr) {
          console.error("Direct visit booking failed:", bookingErr);
          const errVisitMsg: AIMessage = {
            id: `err_visit_${Date.now()}`,
            text: "Could not schedule the visit at this moment. Please select your preferred slot:",
            sender: "bot",
            timestamp: new Date(),
            visitScheduler: topProp ? { property: topProp as RexPropertyCardData } : undefined,
          };
          setAiMessages((prev) => [...prev, errVisitMsg]);
        } finally {
          setIsAiTyping(false);
        }
        return;
      }

      // Case B: User did NOT mention Date & Time (e.g. "i want to visit") -> Show Schedule Visit Template!
      if (!isAuthenticated && topProp && inChatAuthData.actionType === "schedule_visit") {
        const authFormMsg: AIMessage = {
          id: `auth_form_${Date.now()}`,
          text: `Before moving forward, kindly provide your details below to schedule your verified visit for ${getBuyerSafePropertyTitle(topProp)}:`,
          sender: "bot",
          timestamp: new Date(),
          inChatAuthForm: {
            initialName: inChatAuthData.first_name ? `${inChatAuthData.first_name} ${inChatAuthData.last_name || ""}`.trim() : "",
            initialEmail: inChatAuthData.email || "",
            initialPhone: inChatAuthData.phone || "",
            role: selectedPersona || "buyer",
            targetProperty: topProp,
            actionType: "schedule_visit",
          },
        };
        setAiMessages((prev) => [...prev, userMsg, authFormMsg]);
        setInputText("");
        return;
      }

      if (topProp) {
        const botMsg: AIMessage = {
          id: `b_sched_visit_${Date.now()}`,
          text: `Let's book your site visit for **${getBuyerSafePropertyTitle(topProp)}**. Select your preferred date and time slot:`,
          sender: "bot",
          timestamp: new Date(),
          visitScheduler: { property: topProp as RexPropertyCardData },
          suggestions: ["View more properties", "Modify Filters", "Talk to Executive"],
        };
        setAiMessages((prev) => [...prev, userMsg, botMsg]);
      } else {
        const botMsg: AIMessage = {
          id: `b_sched_visit_none_${Date.now()}`,
          text: "Please select a property from the listings above to schedule your visit, or choose an area to explore:",
          sender: "bot",
          timestamp: new Date(),
          suggestions: ["Show all in Pune", "2 BHK in Wakad", "Properties in Hinjewadi"],
        };
        setAiMessages((prev) => [...prev, userMsg, botMsg]);
      }
      setInputText("");
      return;
    }

    if (lower.includes("valuation") || lower.includes("market rate") || lower.includes("free property valuation") || lower.includes("estimate price") || lower.includes("active buyers") || lower.includes("buyers in my locality")) {
      setSelectedPersona("seller");
      const userMsg: AIMessage = { id: `u_${Date.now()}`, text, sender: "user", timestamp: new Date() };
      setAiMessages((prev) => [...prev, userMsg]);
      setInputText("");
      setIsAiTyping(true);

      const targetLoc = inChatAuthData.sellerPropertyData?.locality || rexRequirements.locations?.[0] || "Punawale";
      const targetBhk = inChatAuthData.sellerPropertyData?.bhk || rexRequirements.unit_type || "2 BHK";
      const targetArea = inChatAuthData.sellerPropertyData?.carpet_area || 750;
      const targetSociety = inChatAuthData.sellerPropertyData?.society_name;

      try {
        const insightsRes: any = await rexApi.performAction({
          action: "get_seller_dynamic_insights",
          payload: {
            locality: targetLoc,
            bhk: targetBhk,
            carpet_area: targetArea,
            society_name: targetSociety,
          },
          session_uuid: sessionUuid,
          guest_uuid: getGuestUuid(),
        });

        if (insightsRes && insightsRes.success && insightsRes.valuation) {
          const insightsCardMsg: AIMessage = {
            id: `b_seller_insights_${Date.now()}`,
            text: `Here is the live AI resale valuation and active buyer demand analysis for **${insightsRes.locality}**:`,
            sender: "bot",
            timestamp: new Date(),
            sellerInsightsCard: { data: insightsRes as SellerInsightsData },
            suggestions: ["List Another Property", "Check Listing Status", "Talk to Property Executive"],
          };
          setAiMessages((prev) => [...prev, insightsCardMsg]);
        }
      } catch (insErr) {
        const fallbackMsg: AIMessage = {
          id: `b_valuation_fb_${Date.now()}`,
          text: `In ${targetLoc}, current resale transactions average ₹6,200 – ₹7,400/sq.ft with 18+ active verified buyers seeking ${targetBhk} flats. Our Property Executive will verify your property shortly.`,
          sender: "bot",
          timestamp: new Date(),
          suggestions: ["List Another Property", "Talk to Property Executive", "Check Listing Status"],
        };
        setAiMessages((prev) => [...prev, fallbackMsg]);
      } finally {
        setIsAiTyping(false);
      }
      return;
    }

    if (
      lower.includes("chat with property executive") ||
      lower.includes("chat with executive") ||
      lower.includes("talk to property executive") ||
      lower.includes("talk to executive") ||
      lower.includes("connect with executive") ||
      lower.includes("contact executive")
    ) {
      // If we have an active or bookmarked property, open property executive chat directly
      const lastProperty = aiMessages
        .slice()
        .reverse()
        .map((m) => m.scheduleLaterCard?.property || m.confirmedVisit || m.visitScheduler?.property || (m.properties && m.properties[0]))
        .find(Boolean);

      if (lastProperty) {
        const propId = (lastProperty as any).property_id || (lastProperty as any).id;
        const propTitle = (lastProperty as any).property_title || (lastProperty as any).title;
        const propPrice = (lastProperty as any).property_price || (lastProperty as any).price;
        const propSlug = (lastProperty as any).property_slug || (lastProperty as any).slug;

        handleOpenPropertyConversation({
          propertyId: propId,
          propertyTitle: propTitle,
          propertySlug: propSlug,
          propertyPrice: propPrice,
          initialMessage: `Hi, I would like to chat with the assigned property executive regarding ${propTitle}.`,
        });
        return;
      }

      const userMsg: AIMessage = { id: `u_${Date.now()}`, text, sender: "user", timestamp: new Date() };

      if (!isAuthenticated) {
        const authFormMsg: AIMessage = {
          id: `auth_form_${Date.now()}`,
          text: "Before moving forward, kindly provide your details below so your dedicated Property Executive can connect with you:",
          sender: "bot",
          timestamp: new Date(),
          inChatAuthForm: {
            initialName: inChatAuthData.first_name ? `${inChatAuthData.first_name} ${inChatAuthData.last_name || ""}`.trim() : "",
            initialEmail: inChatAuthData.email || "",
            initialPhone: inChatAuthData.phone || "",
            role: selectedPersona || "buyer",
            actionType: "executive_callback",
          },
        };
        setAiMessages((prev) => [...prev, userMsg, authFormMsg]);
        setInputText("");
        return;
      }

      const botMsg: AIMessage = {
        id: `b_talk_exec_${Date.now()}`,
        text: "Our dedicated Area Relationship Manager has been notified. You will receive an immediate callback for physical property verification and paperwork coordination.",
        sender: "bot",
        timestamp: new Date(),
        suggestions: ["Get Free Property Valuation", "Check Listing Status", "List Another Property"],
      };
      setAiMessages((prev) => [...prev, userMsg, botMsg]);
      setInputText("");
      rexApi.performAction({
        action: "save_message",
        payload: { messages: [userMsg, botMsg], persona: selectedPersona || "seller" },
        session_uuid: sessionUuid,
        guest_uuid: getGuestUuid(),
      }).then((r) => {
        if (r.session_uuid && !sessionUuid) {
          setSessionUuid(r.session_uuid);
          localStorage.setItem(REX_SESSION_STORAGE_KEY, r.session_uuid);
        }
      }).catch(() => {});
      return;
    }

    if (lower.includes("check listing status") || lower.includes("check property status") || lower.includes("listing status")) {
      setSelectedPersona("seller");
      const userMsg: AIMessage = { id: `u_${Date.now()}`, text, sender: "user", timestamp: new Date() };
      const botMsg: AIMessage = {
        id: `b_listing_status_${Date.now()}`,
        text: "Your property has been submitted and is currently in Admin Review. A dedicated Property Executive will contact you to verify documents and coordinate buyer visits.",
        sender: "bot",
        timestamp: new Date(),
        suggestions: ["Get Free Property Valuation", "Check Active Buyers in My Locality", "Talk to Property Executive"],
      };
      setAiMessages((prev) => [...prev, userMsg, botMsg]);
      setInputText("");
      rexApi.performAction({
        action: "save_message",
        payload: { messages: [userMsg, botMsg], persona: "seller" },
        session_uuid: sessionUuid,
        guest_uuid: getGuestUuid(),
      }).then((r) => {
        if (r.session_uuid && !sessionUuid) {
          setSessionUuid(r.session_uuid);
          localStorage.setItem(REX_SESSION_STORAGE_KEY, r.session_uuid);
        }
      }).catch(() => {});
      return;
    }

    const isExactTenantPrompt = ["search rental home", "rent property", "rent", "rent a flat", "rent a home", "tenant"].includes(lower);
    if (isExactTenantPrompt) {
      setSelectedPersona("tenant");
      const userMsg: AIMessage = { id: `u_${Date.now()}`, text, sender: "user", timestamp: new Date() };
      const botMsg: AIMessage = {
        id: `b_persona_tenant_${Date.now()}`,
        text: "Looking for rental homes? Which locality and monthly rental budget are you considering?",
        sender: "bot",
        timestamp: new Date(),
        suggestions: ["Rent in Wakad", "Rent in Baner", "Rent in Hinjewadi", "1/2 BHK Rental Flat"],
      };
      setAiMessages((prev) => [...prev, userMsg, botMsg]);
      setInputText("");
      rexApi.performAction({
        action: "save_message",
        payload: { messages: [userMsg, botMsg], persona: "tenant" },
        session_uuid: sessionUuid,
        guest_uuid: getGuestUuid(),
      }).then((r) => {
        if (r.session_uuid && !sessionUuid) {
          setSessionUuid(r.session_uuid);
          localStorage.setItem(REX_SESSION_STORAGE_KEY, r.session_uuid);
        }
      }).catch(() => {});
      return;
    }

    const isExactOwnerPrompt = ["list property for rent", "rent owner", "rent out property", "rent my flat"].includes(lower);
    if (isExactOwnerPrompt) {
      setSelectedPersona("owner");
      const userMsg: AIMessage = { id: `u_${Date.now()}`, text, sender: "user", timestamp: new Date() };
      const botMsg: AIMessage = {
        id: `b_persona_owner_${Date.now()}`,
        text: "We can find verified tenants for your property quickly. Please share your property society, BHK type, and expected monthly rent:",
        sender: "bot",
        timestamp: new Date(),
        suggestions: ["List 2 BHK in Wakad", "List Flat in Hinjewadi", "List Apartment in Baner"],
      };
      setAiMessages((prev) => [...prev, userMsg, botMsg]);
      setInputText("");
      rexApi.performAction({
        action: "save_message",
        payload: { messages: [userMsg, botMsg], persona: "owner" },
        session_uuid: sessionUuid,
        guest_uuid: getGuestUuid(),
      }).then((r) => {
        if (r.session_uuid && !sessionUuid) {
          setSessionUuid(r.session_uuid);
          localStorage.setItem(REX_SESSION_STORAGE_KEY, r.session_uuid);
        }
      }).catch(() => {});
      return;
    }

    const isExactBrokerPrompt = ["broker", "channel partner", "i am a broker", "i am channel partner"].includes(lower);
    if (isExactBrokerPrompt) {
      setSelectedPersona("broker");
      const userMsg: AIMessage = { id: `u_${Date.now()}`, text, sender: "user", timestamp: new Date() };
      const botMsg: AIMessage = {
        id: `b_persona_broker_${Date.now()}`,
        text: "Welcome Channel Partner! What is your agency name and primary operational territory in Pune?",
        sender: "bot",
        timestamp: new Date(),
        suggestions: ["Wakad / Hinjewadi Territory", "Baner / Balewadi Area", "Commercial / Residential Listings"],
      };
      setAiMessages((prev) => [...prev, userMsg, botMsg]);
      setInputText("");
      rexApi.performAction({
        action: "save_message",
        payload: { messages: [userMsg, botMsg], persona: "broker" },
        session_uuid: sessionUuid,
        guest_uuid: getGuestUuid(),
      }).then((r) => {
        if (r.session_uuid && !sessionUuid) {
          setSessionUuid(r.session_uuid);
          localStorage.setItem(REX_SESSION_STORAGE_KEY, r.session_uuid);
        }
      }).catch(() => {});
      return;
    }

    // 3) Standard REX AI Assistant Message
    const userMsg: AIMessage = { id: `u_${Date.now()}`, text, sender: "user", timestamp: new Date() };
    setAiMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsAiTyping(true);

    try {
      const guestUuid = getGuestUuid();

      // Check for live browser coordinates if user asked for nearby areas / near me
      let browserCoords: { latitude: number; longitude: number } | null = null;
      if (
        lower.includes("nearby") ||
        lower.includes("near me") ||
        lower.includes("around me") ||
        lower.includes("near location") ||
        lower.includes("closest")
      ) {
        if (typeof window !== "undefined" && navigator?.geolocation) {
          try {
            browserCoords = await new Promise((resolve) => {
              navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                () => resolve(null),
                { timeout: 3500, enableHighAccuracy: false, maximumAge: 300000 }
              );
            });
          } catch {
            browserCoords = null;
          }
        }
      }

      const response = await rexApi.sendMessage({
        message: text,
        session_uuid: sessionUuid,
        guest_uuid: guestUuid,
        latitude: browserCoords?.latitude,
        longitude: browserCoords?.longitude,
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
          buyerFilterCard: response.show_buyer_filter
            ? {
                initialLocation: response.requirements?.locations?.[0] || "Punawale",
                initialBhk: response.requirements?.unit_type || "2 BHK",
                initialBudget: "₹50L - ₹80L",
              }
            : undefined,
          confirmedVisit: response.visit || undefined,
        };

        setAiMessages((prev) => [...prev, botMsg]);
      } else {
        const errorMsg: AIMessage = {
          id: `err_${Date.now()}`,
          text: response.message || "I'm having trouble connecting right now. Please try again.",
          sender: "bot",
          timestamp: new Date(),
          isError: true,
          suggestions: ["2 BHK in Wakad", "Properties under ₹80L", "Properties in Hinjewadi"],
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
        suggestions: ["Find 2 BHK in Wakad", "Properties in Hinjewadi", "Budget under ₹60L"],
      };
      setAiMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsAiTyping(false);
    }
  };

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

  const handleTypingChange = (val: string) => {
    setInputText(val);

    if (chatMode === "property_chat" && activeConversation?.id) {
      const socket = getSocket();
      if (socket) {
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
    }
  };

  const inputPlaceholderText = useMemo(() => {
    if (chatMode === "property_chat") return `Message ${activeExecutiveFirstName}...`;
    return "Ask REX about properties, locations, visits...";
  }, [chatMode, activeExecutiveFirstName]);

  /* -------------------------------- Rendering ------------------------------- */
  return (
    <aside aria-label="Resale Expert Real Estate Assistant">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
              setChatMode("rex_ai");
            }}
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#0f2b3d] text-white shadow-[0_8px_30px_rgba(15,43,61,0.35)] hover:bg-[#163e58] hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/20 cursor-pointer"
            title="Chat with REX Real Estate Assistant"
          >
            <MessageSquare size={26} className="text-white drop-shadow-sm group-hover:scale-110 transition-transform duration-200" />
            {totalUnreadInquiries > 0 ? (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-rose-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md border-2 border-white">
                {totalUnreadInquiries}
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
            )}
          </button>
        </div>
      )}

      {/* Main Unified Chat Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          style={{ overscrollBehavior: "contain" }}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          className={`fixed z-50 flex flex-col bg-white shadow-[0_12px_45px_rgba(0,0,0,0.18)] border border-slate-200 transition-all duration-200 overflow-hidden ${
            isMobile
              ? "inset-x-2 bottom-2 top-14 rounded-2xl"
              : isMinimized
              ? "bottom-6 right-6 w-80 h-[52px] rounded-2xl"
              : "bottom-6 right-6 w-[410px] h-[640px] max-h-[88vh] rounded-2xl"
          }`}
        >
          {/* Header */}
          <div className={`bg-white text-slate-900 px-3.5 flex items-center justify-between shrink-0 shadow-2xs ${
            isMinimized ? "h-[50px] py-0" : "border-b border-slate-200 py-2.5"
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Header Title / Avatar based on chatMode */}
              {chatMode === "inquiries_list" ? (
                <div>
                  <h2 className="font-bold text-[13px] leading-tight text-slate-900">
                    Property Conversations
                  </h2>
                  {!isMinimized && <p className="text-[11px] text-slate-500 font-medium">All Direct Inquiries</p>}
                </div>
              ) : chatMode === "property_chat" ? (
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                    {activeConversation?.executive_avatar ? (
                      <img
                        src={activeConversation.executive_avatar}
                        alt="Executive"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-[#0f2b3d] font-bold text-[13px]">
                        {activeExecutiveFirstName[0] ? activeExecutiveFirstName[0].toUpperCase() : "E"}
                      </span>
                    )}
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-white rounded-full" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-[13px] leading-tight text-slate-900 truncate">
                      {activeExecutiveFirstName}
                    </h2>
                    {!isMinimized && (
                      <p className="text-[11px] text-emerald-600 font-medium leading-tight truncate">
                        {executiveTyping ? "typing..." : "Property Executive • Online"}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center overflow-hidden shadow-2xs">
                    <img src={ChatbotLogo} alt="REX AI" className="w-5 h-5 object-contain" />
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-white rounded-full" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="font-bold text-[13px] leading-tight text-slate-900">REX Support</h2>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full">
                        AI Agent
                      </span>
                    </div>
                    {!isMinimized && <p className="text-[11px] text-slate-500 font-medium">Real Estate Assistant • 24/7</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0 text-slate-500">
              {chatMode === "rex_ai" && !isMinimized && (
                <button
                  onClick={handleResetChat}
                  className="p-1.5 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors cursor-pointer text-slate-500"
                  title="Start New REX AI Conversation"
                >
                  <RefreshCw size={15} />
                </button>
              )}

              {/* Inquiries List View Button (Relatable messages icon) */}
              {isAuthenticated && allConversations.length > 0 && chatMode !== "inquiries_list" && (
                <button
                  onClick={() => {
                    setChatMode("inquiries_list");
                    setPropertyDetailsVisible(false);
                    setPropertyVisitSchedulerVisible(false);
                  }}
                  className="relative p-1.5 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors cursor-pointer text-slate-600"
                  title="All Property Conversations"
                >
                  <MessageSquareText size={17} className="text-[#0f2b3d]" />
                  {totalUnreadInquiries > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-0.5 bg-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {totalUnreadInquiries}
                    </span>
                  )}
                </button>
              )}

              {chatMode === "property_chat" && activeExecutivePhone && (
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
              {/* MODE 1: PROPERTY INQUIRIES LIST DRAWER */}
              {chatMode === "inquiries_list" ? (
                <div className="flex-1 flex flex-col bg-white overflow-hidden">
                  <div className="p-3 border-b border-slate-100 bg-slate-50/70 shrink-0">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={inquirySearch}
                        onChange={(e) => setInquirySearch(e.target.value)}
                        placeholder="Search your property inquiries..."
                        className="w-full pl-9 pr-3 py-1.5 text-[12px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0f2b3d]"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1">
                    {/* Top Shortcut to REX AI Assistant */}
                    <button
                      onClick={() => setChatMode("rex_ai")}
                      className="w-full p-3 flex items-center gap-3 bg-emerald-50/40 hover:bg-emerald-50 text-left rounded-xl transition-colors mb-1 border border-emerald-100 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
                        <img src={ChatbotLogo} alt="REX AI" className="w-6 h-6 object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[13px] text-slate-900 leading-tight">
                          REX AI Assistant
                        </h4>
                        <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                          Discover properties, ask questions & schedule visits
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-emerald-600 shrink-0" />
                    </button>

                    {loadingConversations ? (
                      <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-[13px] gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-[#0f2b3d]" />
                        <span>Loading inquiries...</span>
                      </div>
                    ) : filteredInquiries.length > 0 ? (
                      filteredInquiries.map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => {
                            handleOpenPropertyConversation({
                              propertyId: conv.property_id,
                              propertyTitle: conv.property_title,
                              propertySlug: conv.property_slug,
                              propertyPrice: conv.property_price,
                              executiveName: conv.executive_first_name
                                ? `${conv.executive_first_name} ${conv.executive_last_name || ""}`.trim()
                                : undefined,
                              executivePhone: conv.executive_phone,
                            });
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
                                {cleanPropertyTitle(conv.property_title, conv.property_location) || "Property Inquiry"}
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
                                ? `${conv.executive_first_name} ${conv.executive_last_name || ""}`.trim()
                                : "Property Executive"} •{" "}
                              {conv.property_location || "Pune"}
                            </p>
                            <p className="text-[12px] text-slate-500 truncate mt-0.5">
                              {conv.last_message_text || "Inquiry initiated with executive"}
                            </p>
                          </div>
                          {conv.unread_user_count > 0 && (
                            <span className="w-5 h-5 rounded-full bg-[#0f2b3d] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                              {conv.unread_user_count}
                            </span>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                        <MessageSquareText size={32} className="text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-700 text-[13px]">No Inquiries Found</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : chatMode === "property_chat" ? (
                /* MODE 2: DEDICATED PROPERTY CHAT (No AI Overlap) */
                <div
                  className="flex-1 flex flex-col min-h-0 relative"
                  style={{
                    backgroundImage: REX_CHAT_THEME_BG,
                    backgroundColor: "#efeae2",
                    backgroundRepeat: "repeat",
                    backgroundSize: "180px 180px",
                  }}
                >
                  {/* Sticky Context Banner for Property */}
                  {activePropertyTitle && (
                    <div className="bg-slate-50/95 backdrop-blur-xs text-slate-800 px-3.5 py-2 flex items-center justify-between border-b border-slate-200 text-[12px] shrink-0 shadow-2xs z-30">
                      <div className="flex items-center gap-2 min-w-0">
                        <Building2 size={14} className="text-slate-500 shrink-0" />
                        <div className="truncate font-medium">
                          <span>{activePropertyTitle}</span>
                          {activePropertyPrice && (
                            <span className="text-slate-900 font-bold ml-1.5">
                              • {formatRupeePrice(activePropertyPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPropertyVisitSchedulerVisible(!propertyVisitSchedulerVisible);
                            setPropertyDetailsVisible(false);
                          }}
                          className="flex items-center gap-1 text-[11px] bg-[#0f2b3d] hover:bg-[#163e58] text-white font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs active:scale-95"
                        >
                          <Calendar size={11} />
                          <span>{propertyVisitSchedulerVisible ? "CLOSE" : "BOOK VISIT"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPropertyDetailsVisible(!propertyDetailsVisible);
                            setPropertyVisitSchedulerVisible(false);
                          }}
                          className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs active:scale-95 ${
                            propertyDetailsVisible
                              ? "bg-[#e87722] text-white"
                              : "bg-slate-200/90 hover:bg-slate-300 text-slate-800"
                          }`}
                        >
                          <Eye size={11} />
                          <span>VIEW</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* In-Chat Quick Property Details Drawer */}
                  {propertyDetailsVisible && (
                    <div className="absolute inset-x-2.5 top-[46px] z-40 bg-white/98 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-3.5 animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-3 max-h-[85%] overflow-y-auto">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0f2b3d] uppercase tracking-wider">
                          <Sparkles size={13} className="text-[#e87722]" />
                          <span>Property Specifications</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPropertyDetailsVisible(false)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <X size={15} />
                        </button>
                      </div>

                      {/* Header with Photo and Main Details */}
                      <div className="flex gap-3 items-start">
                        <div className="w-24 h-24 min-w-[96px] min-h-[96px] max-w-[96px] max-h-[96px] rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-2xs relative">
                          {activeConversation?.property_photos && activeConversation.property_photos[0] ? (
                            <img
                              src={activeConversation.property_photos[0]}
                              alt="Property"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                              <Building2 size={26} />
                            </div>
                          )}
                          <div className="absolute bottom-1 left-1 bg-[#0f2b3d]/90 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                            Resale
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-[13px] text-slate-900 leading-snug line-clamp-2">
                            {activePropertyTitle}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[14px] font-extrabold text-[#0f2b3d]">
                              {formatRupeePrice(activePropertyPrice)}
                            </span>
                            <span className="text-[9.5px] font-bold px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                              Verified
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                            <MapPin size={11} className="text-slate-400 shrink-0" />
                            <span className="truncate">{activeConversation?.property_location || "Pune, MH"}</span>
                          </p>
                        </div>
                      </div>

                      {/* Key Attributes 2x2 Grid */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-medium">Configuration</span>
                          <span className="font-bold text-slate-800">
                            {activeConversation?.property_unit_type || activeConversation?.property_subtype_name || "2 BHK"}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-medium">Carpet Area</span>
                          <span className="font-bold text-slate-800">
                            {activeConversation?.property_carpet_area
                              ? `${activeConversation.property_carpet_area} sq.ft`
                              : activeConversation?.property_builtup_area
                              ? `${activeConversation.property_builtup_area} sq.ft`
                              : "Standard Layout"}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-medium">Furnishing</span>
                          <span className="font-bold text-slate-800 capitalize">
                            {activeConversation?.property_furnishing || "Semi-Furnished"}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400 font-medium">Floor</span>
                          <span className="font-bold text-slate-800">
                            {activeConversation?.property_floor
                              ? `Floor ${activeConversation.property_floor}${
                                  activeConversation.property_total_floors
                                    ? ` of ${activeConversation.property_total_floors}`
                                    : ""
                                }`
                              : "Available on request"}
                          </span>
                        </div>
                        {activeConversation?.property_facing && (
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-medium">Facing</span>
                            <span className="font-bold text-slate-800">{activeConversation.property_facing}</span>
                          </div>
                        )}
                        {activeConversation?.property_balcony && (
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 font-medium">Balcony</span>
                            <span className="font-bold text-slate-800">{activeConversation.property_balcony} Balcony</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setPropertyDetailsVisible(false);
                            setPropertyVisitSchedulerVisible(true);
                          }}
                          className="w-full py-2 px-3 bg-[#0f2b3d] hover:bg-[#163e58] text-white text-[11.5px] font-semibold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Calendar size={12} />
                          <span>Book Site Visit</span>
                        </button>

                        {activePropertySlug ? (
                          <a
                            href={`/properties/${activePropertySlug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-2 px-3 bg-gradient-to-r from-[#e87722] to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-[11.5px] font-semibold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 text-center cursor-pointer active:scale-95"
                          >
                            <span>More Details</span>
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPropertyDetailsVisible(false)}
                            className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11.5px] font-semibold rounded-xl transition-all cursor-pointer"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Docked / Sticky Visit Scheduler Overlay (Always visible when opened, immune to chat scroll) */}
                  {propertyVisitSchedulerVisible && activeConversation && (
                    <div className="absolute inset-x-2 top-[48px] z-40 bg-white/98 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-2.5 max-h-[calc(100%-56px)] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex justify-end pb-1 pr-1">
                        <button
                          type="button"
                          onClick={() => setPropertyVisitSchedulerVisible(false)}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                        >
                          ✕ Close
                        </button>
                      </div>
                      <REXVisitScheduler
                        propertyTitle={activePropertyTitle}
                        onConfirm={(payload) => {
                          handleConfirmVisitSchedule(
                            {
                              id: Number(activeConversation.property_id),
                              slug: activeConversation.property_slug || String(activeConversation.property_id),
                              title: activePropertyTitle,
                              price: Number(activePropertyPrice) || 0,
                            },
                            payload
                          );
                          setPropertyVisitSchedulerVisible(false);
                        }}
                        onScheduleLater={() => setPropertyVisitSchedulerVisible(false)}
                        onAskQuery={() => setPropertyVisitSchedulerVisible(false)}
                        loading={isBookingVisit}
                      />
                    </div>
                  )}

                  {/* Message Stream */}
                  <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2.5">
                    {/* Executive Joined Notice */}
                    <div className="flex justify-center my-1">
                      <span className="text-[11px] text-slate-600 bg-white/95 px-3 py-0.5 rounded-full border border-slate-200 text-center font-medium shadow-2xs">
                        {activeExecutiveFirstName} joined the chat
                      </span>
                    </div>

                    {loadingPropertyMessages ? (
                      <div className="flex justify-center py-6">
                        <RefreshCw className="w-5 h-5 animate-spin text-[#0f2b3d]" />
                      </div>
                    ) : (
                      propertyMessages.map((m, idx) => {
                        const isUser = m.sender_id === Number(user?.id) || m.sender_type === "user";
                        return (
                          <div
                            key={m.id || m.message_uuid || idx}
                            className={`flex items-end gap-1.5 ${
                              isUser ? "justify-end" : "justify-start"
                            }`}
                          >
                            {!isUser && (
                              <div className="w-6 h-6 rounded-full bg-[#0f2b3d] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mb-1">
                                {m.sender_first_name?.[0] || activeExecutiveFirstName[0] || "E"}
                              </div>
                            )}
                            <div
                              className={`max-w-[82%] rounded-2xl p-2.5 shadow-2xs text-[13px] leading-relaxed break-words ${
                                isUser
                                  ? "bg-[#d9fdd3] text-slate-900 border border-[#c4eec0] rounded-br-sm"
                                  : "bg-white text-slate-800 rounded-bl-sm border border-slate-200/90"
                              }`}
                            >
                              {!isUser && (
                                <p className="text-[11px] font-bold text-[#0f2b3d] mb-0.5">
                                  {m.sender_first_name || activeExecutiveFirstName}
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
                                    <CheckCheck size={13} className="text-emerald-500 inline" />
                                  ) : (
                                    <Check size={13} className="text-slate-400 inline" />
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {executiveTyping && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-white px-3 py-1 rounded-full w-fit border border-slate-200">
                        <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                        <span>{activeExecutiveFirstName} is typing...</span>
                      </div>
                    )}

                    <div ref={propertyMessagesEndRef} />
                  </div>

                  {/* Draft Attachment Preview */}
                  <ChatAttachmentDraftPreview
                    file={selectedMedia}
                    previewUrl={mediaPreviewUrl}
                    onClear={clearMediaAttachment}
                    accentColor="slate"
                  />

                  {/* Hidden File Input */}
                  <input
                    ref={mediaInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm,application/pdf"
                    className="hidden"
                    onChange={handleMediaSelect}
                  />

                  {/* Dedicated Property Input Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-1.5 shrink-0 shadow-2xs"
                  >
                    <button
                      type="button"
                      onClick={() => mediaInputRef.current?.click()}
                      disabled={isSending}
                      className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer shrink-0"
                      title="Attach photos or documents"
                    >
                      <Paperclip size={17} />
                    </button>

                    <input
                      ref={inputRef}
                      type="text"
                      value={inputText}
                      onChange={(e) => handleTypingChange(e.target.value)}
                      placeholder={`Message ${activeExecutiveFirstName}...`}
                      className="flex-1 px-4 py-2 text-[13px] text-slate-900 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white placeholder:text-slate-400 font-medium transition-all"
                    />

                    <button
                      type="submit"
                      disabled={(!inputText.trim() && !selectedMedia) || isSending}
                      className="w-9 h-9 rounded-full bg-[#0f2b3d] hover:bg-[#163e58] disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center transition-all shadow-2xs shrink-0 active:scale-95 cursor-pointer"
                    >
                      {isSending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    </button>
                  </form>
                </div>
              ) : (
                /* MODE 3: REX AI ASSISTANT STREAM (Discovery, Persona, Auth, Carousels) */
                <div
                  className="flex-1 flex flex-col min-h-0 relative"
                  style={{
                    backgroundImage: REX_CHAT_THEME_BG,
                    backgroundColor: "#efeae2",
                    backgroundRepeat: "repeat",
                    backgroundSize: "180px 180px",
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
                            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden shadow-2xs mt-0.5">
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

                            {/* Inline In-Chat Auth / Registration Card */}
                            {m.inChatAuthForm && !isAuthenticated && (
                              <div className="mt-3 w-full">
                                <InlineInChatAuthCard
                                  title="Before moving forward, kindly provide your details below."
                                  initialName={m.inChatAuthForm.initialName}
                                  initialEmail={m.inChatAuthForm.initialEmail}
                                  initialPhone={m.inChatAuthForm.initialPhone}
                                  onSendOtp={(data) => handleInChatSendOtp(data, m.inChatAuthForm)}
                                  onVerifyOtp={(otp, data) => handleInChatVerifyAndComplete(otp, data, m.inChatAuthForm)}
                                  onCancel={() => handleCancelAuthForm(m.id)}
                                  loading={isSending}
                                />
                              </div>
                            )}

                            {/* In-Chat OTP Card */}
                            {m.inChatOtp && inChatAuthStage === "verifying_otp" && (
                              <div className="mt-3 w-full">
                                <InlineInChatOtpCard
                                  email={m.inChatOtp.email}
                                  onVerify={(otp) => handleVerifyInChatOtp(otp, m.inChatOtp!)}
                                  onResend={() => handleResendInChatOtp(m.inChatOtp!)}
                                  onEditEmail={handleEditEmail}
                                  loading={isSending}
                                />
                              </div>
                            )}

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

                            {/* Buyer Multi-Criteria Interactive Filter */}
                            {m.buyerFilterCard && (
                              <div className="mt-3 w-full">
                                <REXBuyerFilterCard
                                  initialLocation={m.buyerFilterCard.initialLocation}
                                  initialBhk={m.buyerFilterCard.initialBhk}
                                  initialBudget={m.buyerFilterCard.initialBudget}
                                  disabled={m.buyerFilterCard.disabled}
                                  onSubmit={(filters) => handleBuyerFilterSubmit(filters, m.id)}
                                />
                              </div>
                            )}

                            {/* Seller Managed Property Submission Wizard */}
                            {m.sellerWizardCard && (
                              <div className="mt-3 w-full">
                                <REXSellerWizardCard
                                  initialData={m.sellerWizardCard.initialData}
                                  disabled={m.sellerWizardCard.disabled}
                                  onSubmit={(data) => handleSellerWizardSubmit(data, m.id)}
                                />
                              </div>
                            )}

                            {/* Seller Property Submitted Confirmation Card */}
                            {m.sellerConfirmedCard && (
                              <div className="mt-3 w-full">
                                <REXSellerConfirmedCard data={m.sellerConfirmedCard.data} />
                              </div>
                            )}

                            {/* Seller Live Dynamic Insights Card */}
                            {m.sellerInsightsCard && (
                              <div className="mt-3 w-full">
                                <REXSellerInsightsCard
                                  data={m.sellerInsightsCard.data}
                                  onTalkToExecutive={() => handleSendMessage("Talk to Property Executive")}
                                  onListProperty={() => handleSendMessage("List Another Property")}
                                />
                              </div>
                            )}

                            {/* Interactive Visit Scheduler */}
                            {m.visitScheduler && (
                              <div className="mt-3 w-full">
                                <REXVisitScheduler
                                  propertyTitle={m.visitScheduler.property.title}
                                  disabled={m.visitScheduler.disabled}
                                  isReschedule={m.visitScheduler.isReschedule}
                                  onConfirm={(payload) =>
                                    handleConfirmVisitSchedule(m.visitScheduler!.property, payload, m.id)
                                  }
                                  onScheduleLater={() =>
                                    handleScheduleLater(m.visitScheduler!.property, m.id)
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
                                  onReschedule={(visit) => handleRescheduleVisit(visit)}
                                  onOpenChatDesk={(propId) => {
                                    handleOpenPropertyConversation({
                                      propertyId: propId,
                                      propertyTitle: m.confirmedVisit?.property_title,
                                      propertyPrice: m.confirmedVisit?.property_price,
                                    });
                                  }}
                                  onBrowseMore={() => {
                                    handleSendMessage("Show more properties in Pune");
                                  }}
                                />
                              </div>
                            )}

                            {/* Schedule Later Executive Handover Card */}
                            {m.scheduleLaterCard && (
                              <div className="mt-3 w-full bg-gradient-to-br from-orange-50/80 to-amber-50/70 border border-orange-200/90 rounded-2xl p-3 shadow-2xs space-y-2.5">
                                <div className="flex items-center justify-between pb-1.5 border-b border-orange-100">
                                  <div className="flex items-center gap-1.5 font-bold text-xs text-orange-950">
                                  
                                    <span>Assigned Property Executive</span>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                    Visit Bookmarked
                                  </span>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-[#0f2b3d] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                                    {m.scheduleLaterCard.executive?.name ? m.scheduleLaterCard.executive.name.charAt(0).toUpperCase() : <UserIcon size={16} />}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-bold text-xs text-slate-900 truncate">
                                      {m.scheduleLaterCard.executive?.name || "Saroj Patil"}
                                    </h4>
                                    <p className="text-[10px] text-slate-500 font-medium truncate">
                                      {m.scheduleLaterCard.executive?.role || "Area Relationship Manager"}
                                    </p>
                                    <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      Available for Chat & Visit Coordination
                                    </p>
                                  </div>
                                </div>

                                <div className="pt-1.5 border-t border-orange-100/80 flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleOpenPropertyConversation({
                                        propertyId: m.scheduleLaterCard!.property.id,
                                        propertyTitle: m.scheduleLaterCard!.property.title,
                                        propertySlug: m.scheduleLaterCard!.property.slug,
                                        propertyPrice: m.scheduleLaterCard!.property.price,
                                        initialMessage: `Hi ${m.scheduleLaterCard!.executive?.name || "Executive"}, I bookmarked ${m.scheduleLaterCard!.property.title} and would like to chat with you for more details.`,
                                      });
                                    }}
                                    className="flex-1 py-2 px-3 bg-[#0f2b3d] hover:bg-[#163e58] text-white text-[11.5px] font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                                  >
                                    <MessageSquare size={13} />
                                    <span>Chat with Property Executive</span>
                                  </button>

                                  {m.scheduleLaterCard.executive?.phone && (
                                    <a
                                      href={`tel:${m.scheduleLaterCard.executive.phone}`}
                                      className="py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[11.5px] font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                                    >
                                      <Phone size={12} className="text-[#e87722]" />
                                      <span>Call</span>
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Suggestions Chips without emojis */}
                            {m.suggestions && m.suggestions.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {m.suggestions.map((sug, i) => {
                                  const textLower = sug.toLowerCase();
                                  const isVisit = textLower.includes("visit") || textLower.includes("schedule") || textLower.includes("book");
                                  const isExec = textLower.includes("executive") || textLower.includes("agent") || textLower.includes("call") || textLower.includes("talk");
                                  const isSearch = textLower.includes("bhk") || textLower.includes("pune") || textLower.includes("budget") || textLower.includes("flat") || textLower.includes("property");

                                  return (
                                    <button
                                      key={i}
                                      onClick={() => handleSendMessage(sug)}
                                      className={`px-3 py-1.5 text-[11.5px] rounded-full font-semibold transition-all text-left cursor-pointer shadow-xs active:scale-95 border ${
                                        isVisit
                                          ? "bg-gradient-to-r from-orange-50 to-amber-50 text-orange-950 border-orange-200 hover:from-orange-100 hover:to-amber-100 hover:border-orange-300 hover:shadow-xs"
                                          : isExec
                                          ? "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-950 border-emerald-200 hover:from-emerald-100 hover:to-teal-100 hover:border-emerald-300 hover:shadow-xs"
                                          : isSearch
                                          ? "bg-gradient-to-r from-sky-50 to-indigo-50 text-sky-950 border-sky-200 hover:from-sky-100 hover:to-indigo-100 hover:border-sky-300 hover:shadow-xs"
                                          : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-slate-300 hover:shadow-xs"
                                      }`}
                                    >
                                      <span>{cleanDisplayText(sug)}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}

                            {/* Message Timestamp */}
                            <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                              <span>
                                {new Date(m.timestamp).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {isUser && <CheckCheck size={13} className="text-emerald-500 inline" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {isAiTyping && (
                      <div className="flex items-start gap-2 my-1 animate-fadeIn">
                        <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden shadow-2xs mt-0.5">
                          <img
                            src={ChatbotLogo}
                            alt="REX"
                            className="w-4 h-4 object-contain"
                          />
                        </div>
                        <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-sm px-4 py-3 shadow-2xs flex items-center gap-1.5 w-fit">
                          <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                        </div>
                      </div>
                    )}

                    <div ref={aiMessagesEndRef} />
                  </div>

                  {/* AI Input Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="p-2.5 bg-white border-t border-slate-200 flex flex-col gap-1.5 shrink-0 shadow-2xs"
                  >
                    {inChatAuthStage === "asking_phone" && (
                      <div className="flex justify-between items-center px-2 text-[10px] text-slate-500 font-medium">
                        <span>Mobile Number (10 digits)</span>
                        <span
                          className={
                            inputText.length === 10
                              ? "text-emerald-600 font-bold"
                              : "text-amber-600 font-semibold"
                          }
                        >
                          {inputText.length}/10 digits {inputText.length === 10 ? "✓" : ""}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 w-full">
                      <input
                        ref={inputRef}
                        type={inChatAuthStage === "asking_phone" ? "tel" : "text"}
                        maxLength={inChatAuthStage === "asking_phone" ? 10 : undefined}
                        inputMode={inChatAuthStage === "asking_phone" ? "numeric" : undefined}
                        value={inputText}
                        onChange={(e) => handleTypingChange(e.target.value)}
                        disabled={inChatAuthStage === "verifying_otp"}
                        placeholder={inputPlaceholderText}
                        className="flex-1 px-4 py-2 text-[13px] text-slate-900 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white placeholder:text-slate-400 font-medium transition-all disabled:opacity-50"
                      />

                      <button
                        type="submit"
                        disabled={
                          !inputText.trim() ||
                          isSending ||
                          isAiTyping ||
                          inChatAuthStage === "verifying_otp" ||
                          (inChatAuthStage === "asking_phone" && inputText.length !== 10)
                        }
                        className="w-9 h-9 rounded-full bg-[#0f2b3d] hover:bg-[#163e58] disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center transition-all shadow-2xs shrink-0 active:scale-95 cursor-pointer"
                        title={inChatAuthStage === "asking_phone" && inputText.length !== 10 ? "Please enter all 10 digits" : "Send"}
                      >
                        {isSending || isAiTyping ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Send size={15} />
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      <ChatLightboxModal
        media={lightboxMedia}
        onClose={() => setLightboxMedia(null)}
      />
    </aside>
  );
};

export default AIChatbot;