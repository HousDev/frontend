import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Send,
  X,
  Minus,
  Minimize2,
  Maximize2,
  RefreshCw,
  Phone,
  Building2,
  Home,
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
  UserCheck,
  Clock,
  Lock,
  LogIn,
  PhoneCall,
} from "lucide-react";

import ChatbotLogo from "@/assets/images/RE.png";
import RexAvatar from "@/assets/images/rex_avatar.jpg";
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
import { REXTenantFilterCard, TenantFilterSelection } from "./REXTenantFilterCard";
import { REXSellerWizardCard, SellerPropertyFormData } from "./REXSellerWizardCard";
import { REXSellerConfirmedCard } from "./REXSellerConfirmedCard";
import { REXOwnerRentalWizardCard, OwnerRentalFormData } from "./REXOwnerRentalWizardCard";
import { REXOwnerRentalConfirmedCard } from "./REXOwnerRentalConfirmedCard";
import { REXCallRequestCard, CallRequestData } from "./REXCallRequestCard";
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
  actionType?: "schedule_visit" | "interested" | "executive_callback" | "owner_listing" | "seller_listing";
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

  // Non-buyer intents or consultative/advisory questions should not trigger the buyer preference filter card
  if (
    lower.includes("?") ||
    lower.includes("which") ||
    lower.includes("where") ||
    lower.includes("how") ||
    lower.includes("what") ||
    lower.includes("why") ||
    lower.includes("price") ||
    lower.includes("prices") ||
    lower.includes("rate") ||
    lower.includes("rates") ||
    lower.includes("insight") ||
    lower.includes("insights") ||
    lower.includes("trend") ||
    lower.includes("recommend") ||
    lower.includes("best") ||
    lower.includes("suggest") ||
    lower.includes("explore popular") ||
    lower.includes("popular localities") ||
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
    "🏠 buy property",
    "🏠 buy",
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

function isRentingIntentWithoutCriteria(text: string): boolean {
  const lower = text.toLowerCase().trim();

  // Exclude seller, valuation, resale buyer, or status queries
  if (
    lower.includes("sell") ||
    lower.includes("valuation") ||
    lower.includes("buy") ||
    lower.includes("purchase") ||
    lower.includes("status") ||
    lower.includes("executive") ||
    lower.includes("owner of") ||
    lower.includes("market rent") ||
    lower.includes("market rate") ||
    lower.includes("current rent") ||
    lower.includes("what is the rent") ||
    lower.includes("what is the current") ||
    lower.includes("how much is rent") ||
    lower.includes("agreement") ||
    lower.includes("rule") ||
    lower.includes("rules") ||
    lower.includes("process") ||
    lower.includes("deposit") ||
    lower.includes("lock-in") ||
    lower.includes("police") ||
    lower.includes("stamp duty") ||
    lower.includes("registration")
  ) {
    return false;
  }

  // Exact matching for greeting pill or generic rent keywords
  const rentKeywords = [
    "search rental home",
    "search rental homes",
    "search rentals",
    "i want rent property",
    "i want rent flat",
    "i want to rent property",
    "i want to rent a property",
    "i want a flat on rent",
    "i want rent",
    "want rent property",
    "want flat on rent",
    "want to rent property",
    "want to rent flat",
    "rent property",
    "rent flat",
    "rent a flat",
    "rent house",
    "rent home",
    "looking for rent",
    "looking for rental",
    "flat for rent",
    "house for rent",
    "rental flat",
    "rental home",
    "rental properties",
    "find rental",
    "find rent property",
    "kiraye par flat",
    "kiraya",
    "renting",
  ];

  const hasRentKeyword =
    rentKeywords.some((kw) => lower === kw || lower.includes(kw)) ||
    lower === "rent" ||
    lower.startsWith("rent ") ||
    lower.startsWith("renting ") ||
    lower.includes("want rent") ||
    lower.includes("want to rent") ||
    lower.includes("looking to rent");

  if (!hasRentKeyword) return false;

  // Check if specific criteria (locality + bhk/budget) are provided
  const commonAreas = [
    "wakad", "tathawade", "hinjewadi", "punawale", "rahatani", "ravet", "kiwale", "mamurdi",
    "baner", "balewadi", "mahalunge", "sus", "bavdhan", "pashan", "aundh",
    "pimple saudagar", "pimple gurav", "pimple nilakh", "kalewadi", "thergaon",
    "pimpri", "chinchwad", "akurdi", "nigdi", "katraj", "dhayari", "narhe",
    "kondhwa", "undri", "kothrud", "kharadi", "viman nagar", "koregaon park",
    "magarpatta", "hadapsar", "wagholi", "dhanori", "swargate", "swarget", "camp"
  ];
  const hasLocation = commonAreas.some((loc) => lower.includes(loc));
  const hasBhk = /\b(\d+(?:\.\d+)?)\s*(?:bhk|bedroom|bed|rk)\b/i.test(lower);
  const hasBudget =
    /(?:₹|rs\.?|inr)?\s*(\d+)\s*(?:k|thousand)/i.test(lower) ||
    /\b(under|below|budget|upto|within|max|less than)\s*(?:₹|rs\.?)?\s*\d+/i.test(lower);

  // If user provided ANY location, BHK, or budget -> specific criteria provided, search properties instead of showing filter card
  if (hasLocation || hasBhk || hasBudget) return false;

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

function isSellerIntent(text: string): boolean {
  const lower = text.toLowerCase().trim();

  // Exclude non-form seller inquiries
  if (
    lower.includes("active buyers") ||
    lower.includes("buyers in") ||
    lower.includes("valuation") ||
    lower.includes("estimate price") ||
    lower.includes("market rate") ||
    lower.includes("listing status") ||
    lower.includes("rent") ||
    lower.includes("rental") ||
    lower.includes("tenant") ||
    lower.includes("to let") ||
    lower.includes("lease") ||
    lower.includes("check status") ||
    lower.includes("status") ||
    lower.includes("executive") ||
    lower.includes("contact")
  ) {
    return false;
  }

  const sellPhrases = [
    "i want to sell property",
    "i want to sell a property",
    "i want to sell my property",
    "i want to sell flat",
    "i want to sell my flat",
    "i want to sell home",
    "i want to sell my home",
    "i want to sell house",
    "i want to sell my house",
    "want to sell property",
    "want to sell my property",
    "want to sell flat",
    "want to sell my flat",
    "sell property",
    "🏷️ sell property",
    "sell my property",
    "sell flat",
    "sell my flat",
    "sell home",
    "sell my home",
    "sell house",
    "sell my house",
    "list my property",
    "list my flat",
    "list property",
    "list property for sale",
    "list my property for sale",
    "list another property",
    "selling property",
    "selling my flat",
    "selling flat",
    "looking to sell",
    "looking to sell property",
    "looking to sell my property",
    "looking to sell flat",
    "looking to sell my flat",
    "i am looking to sell",
    "ghar bechna",
    "flat bechna",
    "property bechna",
    "bechna hai",
    "i want to sell",
  ];
  return (
    sellPhrases.some((p) => lower.includes(p)) ||
    lower === "sell" ||
    lower === "sell property" ||
    lower.startsWith("sell ") ||
    lower.startsWith("selling ")
  );
}

function isOwnerRentalListingIntent(text: string): boolean {
  const lower = text.toLowerCase().trim();

  // Exclude non-form inquiries (tenant demand, rules, finding flats, dashboard, etc.)
  if (
    lower.includes("interested tenant") ||
    lower.includes("tenant demand") ||
    lower.includes("check demand") ||
    lower.includes("rules") ||
    lower.includes("agreement") ||
    lower.includes("executive") ||
    lower.includes("dashboard") ||
    lower.includes("portal") ||
    lower.startsWith("rent in ") ||
    lower.includes("explore") ||
    lower.includes("modify")
  ) {
    return false;
  }

  const explicitListingPhrases = [
    "list property for rent",
    "list another rental property",
    "list my property for rent",
    "list flat for rent",
    "list my flat for rent",
    "add my property for rent",
    "add property for rent",
    "add flat for rent",
    "add my flat for rent",
    "rent out property",
    "rent out my property",
    "rent out flat",
    "rent out my flat",
    "rent out home",
    "rent out house",
    "rent my flat",
    "rent my house",
    "rent my home",
    "rent my apartment",
    "rent my property",
    "upload rental property",
    "upload property for rent",
    "upload flat for rent",
    "give flat on rent",
    "give my flat on rent",
    "give property on rent",
    "give on rent",
    "giving on rent",
    "post property for rent",
    "post flat for rent",
    "post rental",
    "add rental property",
    "kiraye pe dena",
    "kiraye par dena",
    "kiraye pe dena hai",
    "bhade pe dena",
    "bhade par dena",
    "bhade pe dena hai",
    "bhadya ne dene",
    "ghar bhadya ne dene ahe",
    "ghar kiraye pe dena hai",
    "flat kiraye pe dena hai",
  ];

  return explicitListingPhrases.some((p) => lower.includes(p));
}

function parseSellerDetails(text: string): Partial<SellerPropertyFormData> {
  const lower = text.toLowerCase().trim();
  const data: Partial<SellerPropertyFormData> = {};

  // Extract locality
  const localities = ["Punawale", "Wakad", "Hinjewadi", "Baner", "Ravet", "Tathawade", "Kharadi", "Pimple Saudagar", "Pimple Gurav", "Kothrud", "Bavdhan", "Hadapsar"];
  for (const loc of localities) {
    if (lower.includes(loc.toLowerCase())) {
      data.locality = loc;
      break;
    }
  }

  // Extract BHK
  const bhkMatch = lower.match(/\b(\d+(?:\.\d+)?)\s*(?:bhk|bedroom|bed)\b/i);
  if (bhkMatch) {
    data.bhk = `${bhkMatch[1]} BHK`;
  }

  // Extract Carpet Area
  const carpetMatch = lower.match(/(\d+)\s*(?:sq\.?\s*ft|sqft|sq\s*feet|carpet)/i);
  if (carpetMatch) {
    data.carpet_area = `${carpetMatch[1]} sq.ft`;
  }

  // Extract Expected Price
  const priceMatch = lower.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(cr|crore|crores|l|lakh|lakhs|lac|lacs)/i);
  if (priceMatch) {
    data.expected_price = `₹${priceMatch[1]} ${priceMatch[2].toUpperCase()}`;
  }

  // Extract Society Name (e.g. "Roomac , 333 sq ft", "at VTP HiLife", "in My Home Punawale")
  const societyRegex = /(?:in|at|society|project)\s+([A-Za-z0-9\s]{3,30}?)(?:,|\.|locality|area|pune|\d|$)/i;
  const sMatch = text.match(societyRegex);
  if (sMatch && sMatch[1]) {
    const sName = sMatch[1].trim();
    if (!["pune", "mumbai", "flat", "apartment", "property"].includes(sName.toLowerCase())) {
      data.society_name = sName;
    }
  } else if (text.includes(",")) {
    const firstPart = text.split(",")[0].trim();
    if (firstPart && firstPart.length >= 3 && !firstPart.toLowerCase().includes("sell") && !firstPart.toLowerCase().includes("want")) {
      data.society_name = firstPart;
    }
  }

  return data;
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
    actionType?: "schedule_visit" | "interested" | "executive_callback" | "owner_listing" | "seller_listing";
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
  tenantFilterCard?: {
    initialLocation?: string;
    initialBhk?: string;
    initialBudget?: string;
    initialFurnishing?: string;
    disabled?: boolean;
  };
  sellerWizardCard?: {
    initialData?: Partial<SellerPropertyFormData>;
    disabled?: boolean;
  };
  sellerConfirmedCard?: {
    data: SellerPropertyFormData;
    executiveCard?: any;
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
  sellerExecutiveCard?: {
    executiveName: string;
    executiveFirstName?: string;
    executivePhone?: string;
    executiveEmail?: string;
    executiveRole?: string;
    propertyTitle?: string;
    propertyId?: number | string;
    propertySlug?: string;
    propertyPrice?: number | string;
    conversationId?: number | string | null;
  };
  rentalOwnerCard?: {
    ownerId?: number | null;
    ownerName: string;
    ownerPhone?: string | null;
    ownerWhatsapp?: string | null;
    ownerEmail?: string | null;
    propertyTitle?: string;
    propertyId?: number | string;
    monthlyRent?: number | string;
    securityDeposit?: number | string;
    location?: string;
    verifiedBadge?: boolean;
  };
  ownerWizardCard?: {
    disabled?: boolean;
  };
  ownerConfirmedCard?: {
    propertyTitle?: string;
    societyName?: string;
    locality?: string;
    unitType?: string;
    monthlyRent?: number | string;
    securityDeposit?: number | string;
    executiveName?: string;
    executivePhone?: string;
    executiveEmail?: string;
    executiveRole?: string;
  };
  executiveDeskCard?: {
    deskName?: string;
    phone?: string;
    displayPhone?: string;
    persona?: string;
  };
  callRequestCard?: {
    initialPhone?: string;
    initialName?: string;
    persona?: string;
    disabled?: boolean;
  };
  accountExistsCard?: {
    email: string;
    name?: string;
    message?: string;
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
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/gu, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

/** FormattedChatMessage handles rich bullet lists, linebreaks, bold markdown, and spacing */
const FormattedChatMessage: React.FC<{ text?: string | null }> = ({ text }) => {
  if (!text) return null;

  // 1. Normalize bullet points: ensure • or - has a newline before it if glued to preceding text
  let normalized = text
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}]/gu, "")
    .replace(/([^\n])\s*•\s*/g, "$1\n• ");

  // 2. Separate trailing prompt questions after bullet lists if glued together
  normalized = normalized.replace(/(\b[a-z0-9\.\)\]])\s+(Would you like|Our Property Executives|Shall I|If you would like|Let me know)\b/g, "$1\n\n$2");

  const lines = normalized.split("\n");

  const renderInline = (str: string) => {
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <React.Fragment key={i}>{part}</React.Fragment>;
    });
  };

  return (
    <div className="space-y-1.5 text-[13px] leading-relaxed break-words">
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();
        if (!line) {
          return <div key={idx} className="h-1" />;
        }

        // Bullet point line (•, -, *)
        if (line.startsWith("•") || line.startsWith("- ") || line.startsWith("* ")) {
          const content = line.replace(/^[•\-\*]\s*/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="text-emerald-600 font-bold select-none shrink-0 mt-0.5">•</span>
              <span className="flex-1 text-slate-800">{renderInline(content)}</span>
            </div>
          );
        }

        // Numbered list item (e.g. 1., 2.)
        const numMatch = line.match(/^(\d+[\.\)])\s*(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="font-bold text-slate-700 select-none shrink-0">{numMatch[1]}</span>
              <span className="flex-1 text-slate-800">{renderInline(numMatch[2])}</span>
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={idx} className="text-slate-800">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
};

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
  const [size, setSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
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
              className="py-2 px-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSendingOtp || loading}
            className="flex-1 py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            {isSendingOtp || loading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Sending OTP...</span>
              </>
            ) : (
              <>
                <span>Send OTP & Continue</span>
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
export const AIChatbot: React.FC<AIChatbotProps> = ({ isPropertyDetail = false }) => {
  const { width } = useWindowSize();
  const isMobile = width > 0 ? width < 768 : (typeof window !== "undefined" ? window.innerWidth < 768 : false);
  const { user, isAuthenticated, setAuthSession } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Widget States
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(REX_WIDGET_OPEN_KEY) === "true";
    }
    return false;
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);

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

  // Cached user geolocation coordinates for nearby property searches
  const [userLocationCoords, setUserLocationCoords] = useState<{ latitude: number; longitude: number } | null>(null);

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
      const stored = localStorage.getItem(REX_AI_MESSAGES_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((m: any) => ({
              ...m,
              timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
            }));
          }
        } catch {}
      }
    }
    return [initialGreeting];
  });

  const [sessionUuid, setSessionUuid] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(REX_SESSION_STORAGE_KEY);
    }
    return null;
  });
  const [rexProfile, setRexProfile] = useState<Record<string, any>>({});
  const [rexRequirements, setRexRequirements] = useState<Record<string, any>>({});
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Sync authenticated user details into REX profile so REX never asks for them again
  useEffect(() => {
    if (user) {
      const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
      setRexProfile((prev) => ({
        ...prev,
        userId: user.id,
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

  // UI-only: greeting bubble next to the launcher avatar
  const [teaserReady, setTeaserReady] = useState(false);
  const [teaserDismissed, setTeaserDismissed] = useState(false);

  useEffect(() => {
    if (!isOpen && !teaserDismissed) {
      // 1. Initial show after 1.5 seconds
      const showTimer = setTimeout(() => setTeaserReady(true), 1500);

      // 2. Auto-hide: on mobile hide after 3 seconds; on desktop 6.8 seconds
      const autoHideMs = isMobile ? 3000 : 6800;
      const hideTimer = setTimeout(() => setTeaserReady(false), 1500 + autoHideMs);

      // 3. Periodically trigger a subtle attract pulse only on desktop (never on mobile to keep screen clear)
      let attractInterval: any = null;
      if (!isMobile) {
        attractInterval = setInterval(() => {
          setTeaserReady(true);
          setTimeout(() => setTeaserReady(false), 4200);
        }, 30000);
      }

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
        if (attractInterval) clearInterval(attractInterval);
      };
    } else {
      setTeaserReady(false);
    }
  }, [isOpen, teaserDismissed, isMobile]);

  const dismissTeaser = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTeaserDismissed(true);
    setTeaserReady(false);
  }, []);

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

  // Auto-heal inChatAuthStage if no active OTP card exists in aiMessages
  useEffect(() => {
    if (inChatAuthStage === "verifying_otp") {
      const hasOtpCard = aiMessages.some((m) => m.inChatOtp);
      if (!hasOtpCard) {
        setInChatAuthStage("idle");
        localStorage.removeItem(REX_AUTH_STAGE_KEY);
      }
    }
  }, [inChatAuthStage, aiMessages]);

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

  const activePropertyDetailUrl = useMemo(() => {
    if (!activePropertySlug) return "";
    const isRental =
      selectedPersona === "tenant" ||
      (activeConversation as any)?.property_listing_type === "rent" ||
      (activeConversation as any)?.listing_type === "rent" ||
      (currentPropertyContext as any)?.propertyType === "rent";
    return isRental ? `/rentals/${activePropertySlug}` : `/properties/${activePropertySlug}`;
  }, [activePropertySlug, selectedPersona, activeConversation, currentPropertyContext]);

  const isSellerChat = useMemo(() => {
    // 1. Explicit buyer role / persona overrides: buyers never see seller controls
    if (
      selectedPersona === "buyer" ||
      user?.role === "buyer" ||
      activeConversation?.user_role === "buyer" ||
      activeConversation?.user_role === "tenant"
    ) {
      return false;
    }

    // 2. Otherwise check for seller / owner criteria
    return (
      activeConversation?.user_role === "seller" ||
      activeConversation?.user_role === "owner" ||
      selectedPersona === "seller" ||
      selectedPersona === "owner" ||
      user?.role === "seller" ||
      user?.role === "owner" ||
      Boolean(
        activeConversation?.last_message_text &&
          String(activeConversation?.last_message_text).toLowerCase().startsWith("new seller listing")
      )
    );
  }, [activeConversation, selectedPersona, user?.role]);

  const isPropertyPublic = useMemo(() => {
    if (activeConversation?.property_is_public === 1 || (activeConversation as any)?.property_is_public === true) return true;
    if ((activeConversation as any)?.property_status === "Available" || (activeConversation as any)?.property_status === "Active") return true;
    return false;
  }, [activeConversation]);

  /* -------------------------- Reset REX Chat Helper -------------------------- */
  const handleResetChat = useCallback(() => {
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
    setShowRestartConfirm(false);
    setShowResumePrompt(false);
  }, [initialGreeting]);

  // Track if previous conversation exists
  const hasPreviousChat = useMemo(() => {
    return aiMessages.some(
      (m) => m.sender === "user" || (m.sender === "bot" && m.id !== "initial_welcome")
    );
  }, [aiMessages]);

  // Action: Continue with previous chat
  const handleContinuePreviousChat = useCallback(() => {
    setShowResumePrompt(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("rex_resume_decision_made", "true");
      localStorage.setItem("rex_last_active_time", Date.now().toString());
    }
    setTimeout(() => {
      aiMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  }, []);

  // Action: Start fresh new chat
  const handleStartFreshChat = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("rex_resume_decision_made", "true");
      localStorage.setItem("rex_last_active_time", Date.now().toString());
    }
    handleResetChat();
  }, [handleResetChat]);

  // Check if resume prompt should be shown upon opening widget or page load
  useEffect(() => {
    if (!isOpen || isMinimized || chatMode !== "rex_ai" || !hasPreviousChat) {
      return;
    }

    if (typeof window !== "undefined") {
      const sessionDecision = sessionStorage.getItem("rex_resume_decision_made");
      const lastActive = Number(localStorage.getItem("rex_last_active_time") || 0);
      const thirtyMinutesMs = 30 * 60 * 1000;
      const isInactive = lastActive > 0 && Date.now() - lastActive > thirtyMinutesMs;

      if (!sessionDecision || isInactive) {
        setShowResumePrompt(true);
      }
    }
  }, [isOpen, isMinimized, chatMode, hasPreviousChat]);

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
        const activeId = activeConvRef.current?.id;
        const isCurrentActive = isOpen && !isMinimized && chatMode === "property_chat";
        setAllConversations(
          res.conversations.map((c: any) =>
            isCurrentActive && activeId && Number(c.id) === Number(activeId)
              ? { ...c, unread_user_count: 0 }
              : c
          )
        );
      }
    } catch (err) {
      console.error("Failed to load user property conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  }, [isAuthenticated, user?.id, isOpen, isMinimized, chatMode]);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserConversations();
    }
  }, [isAuthenticated, loadUserConversations]);

  // When active conversation is open in property chat, immediately mark as read & clear unread count
  useEffect(() => {
    if (isOpen && !isMinimized && chatMode === "property_chat" && activeConversation?.id) {
      chatApi.markAsRead(activeConversation.id).catch(() => {});
      setAllConversations((prev) =>
        prev.map((c) =>
          Number(c.id) === Number(activeConversation.id)
            ? { ...c, unread_user_count: 0 }
            : c
        )
      );
    }
  }, [isOpen, isMinimized, chatMode, activeConversation?.id]);

  const totalUnreadInquiries = useMemo(() => {
    return allConversations.reduce((sum, c) => sum + (c.unread_user_count || 0), 0);
  }, [allConversations]);

  const filteredInquiries = useMemo(() => {
    if (!inquirySearch.trim()) return allConversations;
    const q = inquirySearch.toLowerCase().trim();
    const words = q.split(/\s+/).filter(Boolean);

    return allConversations.filter((c) => {
      const rawTitle = (c.property_title || "").toLowerCase();
      const cleanedTitle = cleanPropertyTitle(c.property_title, c.property_location).toLowerCase();
      const location = (c.property_location || "").toLowerCase();
      const firstName = (c.executive_first_name || "").toLowerCase();
      const lastName = (c.executive_last_name || "").toLowerCase();
      const fullName = `${firstName} ${lastName}`.trim();
      const lastMsg = (c.last_message_text || "").toLowerCase();

      const combined = `${rawTitle} ${cleanedTitle} ${location} ${fullName} ${firstName} ${lastName} ${lastMsg}`;
      return words.every((word) => combined.includes(word));
    });
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
            setAllConversations((prev) =>
              prev.map((c) =>
                Number(c.id) === Number(msg.conversation_id) ? { ...c, unread_user_count: 0 } : c
              )
            );
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

    const onUnreadUpdate = (data: any) => {
      if (data && data.conversationId) {
        setAllConversations((prev) =>
          prev.map((c) =>
            Number(c.id) === Number(data.conversationId)
              ? { ...c, unread_user_count: data.unreadCount ?? 0 }
              : c
          )
        );
      }
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
    socket.on("chat:unread_count_update", onUnreadUpdate);
    socket.on("chat:typing", onTyping);
    socket.on("chat:user_typing", onTyping);

    return () => {
      if (activeConversation?.id) {
        socket.emit("chat:leave_room", { conversationId: activeConversation.id });
      }
      socket.off("connect", handleConnect);
      socket.off("chat:new_message", onNewMessage);
      socket.off("chat:unread_count_update", onUnreadUpdate);
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
          setAllConversations((prev) =>
            prev.map((c) =>
              Number(c.id) === Number(conv.id) ? { ...c, unread_user_count: 0 } : c
            )
          );
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

  /* ---------------- Resume Pending Chat Action Post-Login ---------------- */
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const pendingResumeRaw = sessionStorage.getItem("rex_pending_resume");
    if (!pendingResumeRaw) return;

    try {
      const pendingResume = JSON.parse(pendingResumeRaw);
      sessionStorage.removeItem("rex_pending_resume");

      // Only resume if initiated within last 2 hours
      if (Date.now() - (pendingResume.timestamp || 0) < 7200000) {
        setIsOpen(true);
        setIsMinimized(false);
        setChatMode("rex_ai");

        if (pendingResume.type === "get_rental_owner" && pendingResume.property) {
          const welcomeResumeMsg: AIMessage = {
            id: `resumed_${Date.now()}`,
            text: `Welcome back, ${user.first_name || "there"}! Fetching the verified owner contact details for ${pendingResume.property.title}...`,
            sender: "bot",
            timestamp: new Date(),
          };
          setAiMessages((prev) => [...prev, welcomeResumeMsg]);
          handlePropertyInterested(pendingResume.property);
        } else if (pendingResume.type === "schedule_visit" && pendingResume.property) {
          const schedMsg: AIMessage = {
            id: `sched_resume_${Date.now()}`,
            text: `Welcome back, ${user.first_name || "there"}! Let's choose your site visit schedule for ${getBuyerSafePropertyTitle(pendingResume.property)}:`,
            sender: "bot",
            timestamp: new Date(),
            visitScheduler: { property: pendingResume.property },
          };
          setAiMessages((prev) => [...prev, schedMsg]);
        } else if (pendingResume.type === "seller_property" && pendingResume.sellerPropertyData) {
          handleSellerWizardSubmit(pendingResume.sellerPropertyData);
        } else if (pendingResume.type === "owner_rental_wizard") {
          const ownerMsg: AIMessage = {
            id: `owner_resume_${Date.now()}`,
            text: `Welcome back, ${user.first_name || "there"}! You can now list your rental property below:`,
            sender: "bot",
            timestamp: new Date(),
            ownerWizardCard: {},
          };
          setAiMessages((prev) => [...prev, ownerMsg]);
        }
      }
    } catch (e) {
      console.error("Failed to resume pending chat action post-login:", e);
      sessionStorage.removeItem("rex_pending_resume");
    }
  }, [isAuthenticated, user]);

  /* ---------------- Helper: Existing Account Notification ----------------- */
  const promptExistingUserLogin = (
    email: string,
    firstName?: string,
    pendingAction?: any
  ) => {
    if (pendingAction) {
      sessionStorage.setItem(
        "rex_pending_resume",
        JSON.stringify({
          ...pendingAction,
          email,
          timestamp: Date.now(),
        })
      );
    }

    const existMsg: AIMessage = {
      id: `exist_user_${Date.now()}`,
      text: `Your account already exists (${email}). Please login to continue forward.`,
      sender: "bot",
      timestamp: new Date(),
      accountExistsCard: {
        email,
        name: firstName || "Client",
        message: "Your account already exists in our system. Please login to your account to continue directly without re-verification.",
      },
      suggestions: [
        "Login to Your Account",
        "Explore Rental Listings",
        "Talk to Property Executive",
      ],
    };
    setAiMessages((prev) => [...prev, existMsg]);
  };

  /* ------------------------- Interactive REX Actions ------------------------ */
  const [isLoadingMoreProperties, setIsLoadingMoreProperties] = useState(false);
  const [isBookingVisit, setIsBookingVisit] = useState(false);

  const handlePropertyInterested = async (property: RexPropertyCardData) => {
    const isRentalProperty =
      property.listing_type === "rent" ||
      Boolean(property.price_display?.includes("/mo")) ||
      (selectedPersona as string) === "tenant";

    if (isRentalProperty) {
      if (isAuthenticated) {
        setIsSending(true);
        try {
          const res = await rexApi.performAction({
            action: "get_rental_owner_details",
            payload: {
              property_id: property.id,
              userId: user?.id,
              phone: user?.phone,
              email: user?.email,
              name: user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : undefined,
            },
            session_uuid: sessionUuid || undefined,
            guest_uuid: getGuestUuid(),
          });

          if (res.success && res.rental_owner_card) {
            const ownerMsg: AIMessage = {
              id: `rental_owner_${Date.now()}`,
              text: res.message || `Here are the verified owner contact details for ${property.title}:`,
              sender: "bot",
              timestamp: new Date(),
              rentalOwnerCard: res.rental_owner_card,
              suggestions: [
                "Go to Tenant Dashboard",
                "Find more rental properties",
                "Rental agreement process",
                "Talk to Property Executive",
              ],
            };
            setAiMessages((prev) => [...prev, ownerMsg]);
            return;
          }
        } catch (err: any) {
          console.error("Failed to fetch rental owner details:", err);
        } finally {
          setIsSending(false);
        }
      }

      const knownEmail = rexProfile?.email || inChatAuthData?.email;
      const knownPhone = rexProfile?.phone || inChatAuthData?.phone;
      if (knownEmail || knownPhone) {
        try {
          const statusRes = await rexApi.performAction({
            action: "check_user_status",
            payload: { email: knownEmail, phone: knownPhone },
            session_uuid: sessionUuid || undefined,
            guest_uuid: getGuestUuid(),
          });
          if (statusRes.is_registered) {
            promptExistingUserLogin(knownEmail || knownPhone || "", statusRes.first_name, {
              type: "get_rental_owner",
              property,
            });
            return;
          }
        } catch (e) {
          console.error("Error checking user status in handlePropertyInterested:", e);
        }

        const updatedAuth: InChatAuthData = {
          ...inChatAuthData,
          email: knownEmail,
          first_name: rexProfile?.name?.split(" ")[0] || inChatAuthData.first_name || "Client",
          last_name: rexProfile?.name?.split(" ").slice(1).join(" ") || inChatAuthData.last_name || "",
          phone: rexProfile?.phone || inChatAuthData.phone,
          role: "tenant",
          targetProperty: property,
        };
        setInChatAuthData(updatedAuth);
        setInChatAuthStage("verifying_otp");

        const promptMsg: AIMessage = {
          id: `auth_quick_${Date.now()}`,
          text: `Welcome back${rexProfile?.name ? `, ${rexProfile.name}` : ""}! To view the verified owner contact details for ${property.title}, I've sent a 6-digit verification code to ${knownEmail}. Please enter it below:`,
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
            role: "tenant",
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
              role: "tenant",
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
              role: "tenant",
              targetProperty: property,
              actionType: "interested",
            },
          };
          setAiMessages((prev) => [...prev, errMsg]);
        } finally {
          setIsSending(false);
        }
        return;
      }

      // Unauthenticated new user: Show inline auth form for Tenant
      const authFormMsg: AIMessage = {
        id: `auth_form_tenant_${Date.now()}`,
        text: `To connect directly with the verified owner of ${property.title}, please share your details below:`,
        sender: "bot",
        timestamp: new Date(),
        inChatAuthForm: {
          initialName: inChatAuthData.first_name ? `${inChatAuthData.first_name} ${inChatAuthData.last_name || ""}`.trim() : "",
          initialEmail: inChatAuthData.email || "",
          initialPhone: inChatAuthData.phone || "",
          role: "tenant",
          targetProperty: property,
          actionType: "interested",
        },
      };
      setAiMessages((prev) => [...prev, authFormMsg]);
      return;
    }

    if (!isAuthenticated) {
      const knownEmail = rexProfile?.email || inChatAuthData?.email;
      const knownPhone = rexProfile?.phone || inChatAuthData?.phone;

      if (knownEmail || knownPhone) {
        try {
          const statusRes = await rexApi.performAction({
            action: "check_user_status",
            payload: { email: knownEmail, phone: knownPhone },
            session_uuid: sessionUuid || undefined,
            guest_uuid: getGuestUuid(),
          });
          if (statusRes.is_registered) {
            promptExistingUserLogin(knownEmail || knownPhone || "", statusRes.first_name, {
              type: "schedule_visit",
              property,
            });
            return;
          }
        } catch (e) {
          console.error("Error checking user status in buyer flow:", e);
        }

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
    formMeta?: AIMessage["inChatAuthForm"],
    msgId?: string
  ) => {
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanPhone = formData.phone.replace(/\D/g, "");

    // 1. Check if user already exists
    try {
      const statusRes = await rexApi.performAction({
        action: "check_user_status",
        payload: { email: cleanEmail, phone: cleanPhone },
        session_uuid: sessionUuid || undefined,
        guest_uuid: getGuestUuid(),
      });

      if (statusRes.is_registered) {
        if (msgId) {
          setAiMessages((prev) => prev.filter((m) => m.id !== msgId));
        }

        const isRental =
          formMeta?.targetProperty?.listing_type === "rent" ||
          Boolean(formMeta?.targetProperty?.price_display?.includes("/mo")) ||
          formMeta?.role === "tenant";

        promptExistingUserLogin(cleanEmail, statusRes.first_name, {
          type: formMeta?.sellerPropertyData ? "seller_property" : (isRental ? "get_rental_owner" : "schedule_visit"),
          property: formMeta?.targetProperty,
          sellerPropertyData: formMeta?.sellerPropertyData,
        });
        return;
      }
    } catch (e) {
      console.error("Error checking user registration status in handleInChatSendOtp:", e);
    }

    const nameParts = formData.name.split(/\s+/).filter(Boolean);
    const first_name = nameParts[0] || "Client";
    const last_name = nameParts.slice(1).join(" ");

    const updatedAuth: InChatAuthData = {
      ...inChatAuthData,
      email: cleanEmail,
      first_name,
      last_name,
      phone: cleanPhone,
      role: formMeta?.role || selectedPersona || "buyer",
      targetProperty: formMeta?.targetProperty,
      sellerPropertyData: formMeta?.sellerPropertyData,
    };
    setInChatAuthData(updatedAuth);

    await rexApi.sendInChatOtp({
      email: cleanEmail,
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

  const handleOpenCallRequest = (_deskPhone?: string, _deskName?: string) => {
    const callReqMsg: AIMessage = {
      id: `call_req_${Date.now()}`,
      text: "Please provide your mobile number and preferred time below so our Property Executive can call you back directly.",
      sender: "bot",
      timestamp: new Date(),
      callRequestCard: {
        initialPhone: user?.phone || "",
        initialName: user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "",
        persona: selectedPersona || "tenant",
      },
    };
    setAiMessages((prev) => [...prev, callReqMsg]);
    rexApi.performAction({
      action: "save_message",
      payload: {
        messages: [
          {
            id: `u_req_click_${Date.now()}`,
            sender: "user",
            text: "Request Callback",
            timestamp: new Date().toISOString(),
          },
          callReqMsg,
        ],
        persona: selectedPersona || "buyer",
      },
      session_uuid: sessionUuid,
      guest_uuid: getGuestUuid(),
    }).then((r) => {
      if (r.session_uuid && !sessionUuid) {
        setSessionUuid(r.session_uuid);
        localStorage.setItem(REX_SESSION_STORAGE_KEY, r.session_uuid);
      }
    }).catch(() => {});
  };

  const handleCancelCallRequest = (msgId: string) => {
    setAiMessages((prev) => prev.filter((m) => m.id !== msgId));
  };

  const handleSubmitCallRequest = async (data: CallRequestData, msgId: string) => {
    try {
      const res = await rexApi.performAction({
        action: "create_call_request_lead",
        payload: {
          phone: data.phone,
          name: data.name,
          timing: data.timing,
          persona: data.persona || selectedPersona || "tenant",
          location: rexRequirements.locations?.[0] || "",
          society_name: rexRequirements.society_name || "",
        },
        session_uuid: sessionUuid,
        guest_uuid: getGuestUuid(),
      });

      if (res?.session_uuid && !sessionUuid) {
        setSessionUuid(res.session_uuid);
        localStorage.setItem(REX_SESSION_STORAGE_KEY, res.session_uuid);
      }

      // Mark card as disabled/completed
      setAiMessages((prev) =>
        prev.map((m) =>
          m.id === msgId && m.callRequestCard
            ? { ...m, callRequestCard: { ...m.callRequestCard, disabled: true } }
            : m
        )
      );

      // Bot confirmation response
      setTimeout(() => {
        const confirmMsg: AIMessage = {
          id: `b_call_confirmed_${Date.now()}`,
          text: `✅ Callback Request Registered!\n\nThank you ${data.name}! Our Property Executive will call you ${data.timing === "Immediately" ? "immediately" : data.timing} at +91 ${data.phone}.\n\nYour request has been saved and routed to our CRM team. How else can we assist you today?`,
          sender: "bot",
          timestamp: new Date(),
          suggestions:
            selectedPersona === "tenant"
              ? ["Rent in Baner", "Rent in Wakad", "Rent in Hinjewadi", "Modify Filters"]
              : ["Explore 2 BHK in Pune", "Book Site Visit", "Properties under ₹80L", "Filter Properties"],
        };
        setAiMessages((prev) => [...prev, confirmMsg]);

        // Save submitted callback details & bot confirmation to REX AI session
        rexApi.performAction({
          action: "save_message",
          payload: {
            messages: [
              {
                id: `u_call_data_${Date.now()}`,
                sender: "user",
                text: `Callback Request Submitted:\n• Name: ${data.name}\n• Phone: +91 ${data.phone}\n• Preferred Time: ${data.timing}`,
                timestamp: new Date().toISOString(),
              },
              confirmMsg,
            ],
            persona: selectedPersona || "buyer",
            profile: {
              name: data.name,
              phone: data.phone,
            },
          },
          session_uuid: res?.session_uuid || sessionUuid,
          guest_uuid: getGuestUuid(),
        }).catch(() => {});
      }, 350);
    } catch (err: any) {
      console.error("Submit Call Request error:", err);
      throw new Error(err?.response?.data?.message || err?.message || "Could not submit call request");
    }
  };

  const handlePropertyNotInterested = (_property: RexPropertyCardData) => {
    const isTenant =
      selectedPersona === "tenant" ||
      _property.listing_type === "rent" ||
      _property.price_display?.includes("/mo");

    const notInterestedMsg: AIMessage = {
      id: `not_int_${Date.now()}`,
      text: isTenant
        ? `Understood. Would you like to check rental homes in a different budget or locality?`
        : `Understood. Would you like to check properties in a different budget or locality?`,
      sender: "bot",
      timestamp: new Date(),
      suggestions: isTenant
        ? [
            "Rent in Baner",
            "Rent in Wakad",
            "Rent in Hinjewadi",
            "Modify Filters",
          ]
        : [
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
        setIsSending(true);
        try {
          const submitRes = await rexApi.performAction({
            action: "submit_seller_property",
            payload: {
              ...sellerData,
              seller_name: res.user.first_name ? `${res.user.first_name} ${res.user.last_name || ""}`.trim() : (otpData.first_name || "Seller"),
              seller_phone: res.user.phone || otpData.phone,
              seller_email: res.user.email || otpData.email,
              user_id: res.user.id,
              seller_id: (res.user as any).seller_id || undefined,
            },
            session_uuid: sessionUuid || undefined,
            guest_uuid: getGuestUuid(),
          });

          const loc = sellerData.location_name || (sellerData as any).locality || "Pune";
          const unit = sellerData.unit_type || (sellerData as any).bhk || "Property";

          const successSellerMsg: AIMessage = {
            id: `auth_verified_seller_${Date.now()}`,
            text: submitRes.reply || `Verified successfully! Welcome, ${res.user.first_name || otpData.first_name || "there"}. Your property at ${sellerData.society_name}, ${loc} has been submitted for review. Dedicated Property Executive ${submitRes.executive_card?.executiveName || ""} has been assigned to your property.`,
            sender: "bot",
            timestamp: new Date(),
            sellerConfirmedCard: {
              data: {
                ...sellerData,
                location_name: loc,
                unit_type: unit,
              },
              executiveCard: submitRes.executive_card,
            },
            suggestions: ["Chat with Executive", "List Another Property", "Check Active Buyers in My Locality", "Talk to Property Executive"],
          };

          setRexRequirements((prev) => ({
            ...prev,
            locations: [loc],
            society_name: sellerData.society_name,
            unit_type: unit,
            carpet_area: sellerData.carpet_area,
            budget: sellerData.expected_price,
            transaction_type: "sell",
          }));

          setAiMessages((prev) => [...prev, successSellerMsg]);
          loadUserConversations();
          return;
        } catch (sErr) {
          console.error("Failed to auto-submit seller property post-auth:", sErr);
        } finally {
          setIsSending(false);
        }
      }

      if (isSeller) {
        const successSellerGeneralMsg: AIMessage = {
          id: `auth_verified_seller_gen_${Date.now()}`,
          text: `Verified successfully! Welcome, ${res.user.first_name || "there"}. You are logged into your Seller Account. Please provide your property details below to submit for executive review:`,
          sender: "bot",
          timestamp: new Date(),
          sellerWizardCard: {
            initialData: { location_name: "Punawale", unit_type: "2 BHK" },
          },
          suggestions: ["Check Active Buyers in My Locality", "Get Free Property Valuation", "Talk to Property Executive"],
        };
        setAiMessages((prev) => [...prev, successSellerGeneralMsg]);
        loadUserConversations();
        return;
      }

      const isTenant =
        (otpData.role || selectedPersona || inChatAuthData.role) === "tenant" ||
        otpData.targetProperty?.listing_type === "rent" ||
        Boolean(otpData.targetProperty?.price_display?.includes("/mo"));

      // Ensure targetProperty is preserved or recovered if available from anywhere in the conversation
      let targetRentalProp = otpData.targetProperty;
      if (!targetRentalProp) {
        const lastPropMsg = [...aiMessages].reverse().find(
          (m) =>
            m.inChatAuthForm?.targetProperty ||
            m.rentalOwnerCard ||
            m.properties?.find((p) => p.listing_type === "rent" || p.price_display?.includes("/mo")) ||
            (m.properties && m.properties.length > 0)
        );
        targetRentalProp =
          lastPropMsg?.inChatAuthForm?.targetProperty ||
          lastPropMsg?.properties?.find((p) => p.listing_type === "rent" || p.price_display?.includes("/mo")) ||
          lastPropMsg?.properties?.[0];
      }

      if (isTenant && targetRentalProp) {
        setIsSending(true);
        try {
          const resOwner = await rexApi.performAction({
            action: "get_rental_owner_details",
            payload: {
              property_id: targetRentalProp.id,
              userId: res.user.id,
              phone: res.user.phone || otpData.phone,
              email: res.user.email || otpData.email,
              name: res.user.first_name ? `${res.user.first_name} ${res.user.last_name || ""}`.trim() : otpData.first_name,
            },
            session_uuid: sessionUuid || undefined,
            guest_uuid: getGuestUuid(),
          });

          if (resOwner.success && resOwner.rental_owner_card) {
            const ownerMsg: AIMessage = {
              id: `auth_verified_tenant_${Date.now()}`,
              text: `Verified successfully! Welcome, ${res.user.first_name || "there"}. Here are the verified contact details of the property owner for ${targetRentalProp.title}:`,
              sender: "bot",
              timestamp: new Date(),
              rentalOwnerCard: resOwner.rental_owner_card,
              suggestions: [
                "Go to Tenant Dashboard",
                "Find more rental properties",
                "Rental agreement process",
                "Talk to Property Executive",
              ],
            };
            setAiMessages((prev) => [...prev, ownerMsg]);
            loadUserConversations();
            return;
          }
        } catch (err) {
          console.error("Failed to fetch rental owner details post-auth:", err);
        } finally {
          setIsSending(false);
        }
      }

      if (isTenant) {
        const tenantWelcomeMsg: AIMessage = {
          id: `auth_verified_tenant_gen_${Date.now()}`,
          text: `Verified successfully! Welcome, ${res.user.first_name || "there"}. Which area in Pune are you looking for a rental flat? (e.g. Baner, Hinjewadi, Wakad)`,
          sender: "bot",
          timestamp: new Date(),
          suggestions: [
            "1 BHK for rent in Baner",
            "2 BHK flat in Wakad under ₹25k",
            "Rental agreement process",
            "Talk to Property Executive",
          ],
        };
        setAiMessages((prev) => [...prev, tenantWelcomeMsg]);
        loadUserConversations();
        return;
      }

      const isOwner =
        (otpData.role || selectedPersona || inChatAuthData.role) === "owner" ||
        res.user.role === "owner";

      const savedRentalDraft = sessionStorage.getItem("rex_pending_owner_rental");
      if (isOwner && savedRentalDraft) {
        sessionStorage.removeItem("rex_pending_owner_rental");
        const rentalData: OwnerRentalFormData = JSON.parse(savedRentalDraft);
        setIsSending(true);
        try {
          const submitRes = await rexApi.performAction({
            action: "submit_owner_rental_property",
            payload: {
              ...rentalData,
              owner_name: res.user.first_name ? `${res.user.first_name} ${res.user.last_name || ""}`.trim() : (otpData.first_name || "Owner"),
              owner_phone: res.user.phone || otpData.phone,
              owner_email: res.user.email || otpData.email,
              user_id: res.user.id,
              owner_id: (res.user as any).owner_id || undefined,
            },
            session_uuid: sessionUuid || undefined,
            guest_uuid: getGuestUuid(),
          });

          const successOwnerMsg: AIMessage = {
            id: `auth_owner_sub_${Date.now()}`,
            text: submitRes.message || `Verified successfully! Your rental property at ${rentalData.society_name}, ${rentalData.location_name} has been registered! A dedicated Sales Executive has been assigned.`,
            sender: "bot",
            timestamp: new Date(),
            ownerConfirmedCard: {
              propertyTitle: submitRes.property?.title || `${rentalData.unit_type} at ${rentalData.society_name}`,
              societyName: rentalData.society_name,
              locality: rentalData.location_name,
              unitType: rentalData.unit_type,
              monthlyRent: rentalData.monthly_rent,
              securityDeposit: rentalData.security_deposit,
              executiveName: submitRes.executive_card?.executiveName || "Soniya Singh",
              executivePhone: submitRes.executive_card?.executivePhone || "+91 9604 350 255",
              executiveEmail: submitRes.executive_card?.executiveEmail || "support@resaleexpert.in",
              executiveRole: submitRes.executive_card?.executiveRole || "Sales Executive",
            },
            suggestions: ["Go to Owner Dashboard", "List Another Rental Property", "Check Interested Tenants", "Talk to Sales Executive"],
          };
          setAiMessages((prev) => [...prev, successOwnerMsg]);
          loadUserConversations();
          return;
        } catch (e) {
          console.error("Failed to auto-submit owner rental property post-auth:", e);
        } finally {
          setIsSending(false);
        }
      } else if (isOwner) {
        const successOwnerGenMsg: AIMessage = {
          id: `auth_verified_owner_gen_${Date.now()}`,
          text: `Verified successfully! Welcome, ${res.user.first_name || "there"}. You are logged into your Owner Account. Please fill in your rental property details below to find tenants:`,
          sender: "bot",
          timestamp: new Date(),
          ownerWizardCard: {},
          suggestions: ["Go to Owner Dashboard", "Explore Rental Listings", "Talk to Sales Executive"],
        };
        setAiMessages((prev) => [...prev, successOwnerGenMsg]);
        loadUserConversations();
        return;
      }

      // Check if there was a pending visit scheduled
      const pendingVisitRaw = sessionStorage.getItem("rex_pending_visit_schedule");
      if (pendingVisitRaw) {
        sessionStorage.removeItem("rex_pending_visit_schedule");
        try {
          const pendingVisit = JSON.parse(pendingVisitRaw);
          if (pendingVisit?.property && pendingVisit?.payload) {
            await handleConfirmVisitSchedule(pendingVisit.property, pendingVisit.payload, pendingVisit.messageId);
            loadUserConversations();
            return;
          }
        } catch (err) {
          console.error("Failed to confirm pending visit post-auth:", err);
        }
      }

      const successMsg: AIMessage = {
        id: `auth_verified_${Date.now()}`,
        text: `Verified successfully! Welcome, ${res.user.first_name || "there"}. Let's select your preferred site visit slot:`,
        sender: "bot",
        timestamp: new Date(),
        visitScheduler: otpData.targetProperty ? { property: otpData.targetProperty } : undefined,
        suggestions: ["View more properties", "Modify Filters", "Talk to Executive"],
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
    if (!isAuthenticated) {
      sessionStorage.setItem(
        "rex_pending_visit_schedule",
        JSON.stringify({ property, payload, messageId })
      );
      const cachedEmail = rexProfile?.email || inChatAuthData?.email || "";
      const cachedPhone = rexProfile?.phone || inChatAuthData?.phone || "";
      const cachedName = rexProfile?.name || (inChatAuthData?.first_name ? `${inChatAuthData.first_name} ${inChatAuthData.last_name || ""}`.trim() : "");

      const authFormMsg: AIMessage = {
        id: `auth_form_${Date.now()}`,
        text: `To confirm your site visit for ${getBuyerSafePropertyTitle(property)} on ${payload.formattedDisplay} and connect with your dedicated Property Executive, please provide your details below:`,
        sender: "bot",
        timestamp: new Date(),
        inChatAuthForm: {
          initialName: cachedName,
          initialEmail: cachedEmail,
          initialPhone: cachedPhone,
          role: "buyer",
          targetProperty: property,
          actionType: "schedule_visit",
        },
      };
      setAiMessages((prev) => [...prev, authFormMsg]);
      return;
    }

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
      name: "Dedicated Property Executive",
      role: "Area Relationship Manager",
      phone: "+91 9637 00 9639",
      email: "support@resaleexpert.in",
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

  const handleTenantFilterSubmit = async (filters: TenantFilterSelection, msgId?: string) => {
    if (msgId) {
      setAiMessages((prev) =>
        prev.map((m) =>
          m.id === msgId && m.tenantFilterCard
            ? { ...m, tenantFilterCard: { ...m.tenantFilterCard, disabled: true } }
            : m
        )
      );
    }

    const bhkPrefix = filters.bhk !== "Any BHK" ? filters.bhk : "Rental flat";
    const budgetSuffix = filters.budget !== "Any Budget" ? `under ${filters.budget}` : "";
    const furnishSuffix = filters.furnishing && filters.furnishing !== "Any" ? `(${filters.furnishing})` : "";
    const userQuery = `Rent ${bhkPrefix} in ${filters.location} ${budgetSuffix} ${furnishSuffix}`.trim();

    const userMsg: AIMessage = {
      id: `u_${Date.now()}`,
      text: `Searching for rent: ${bhkPrefix} in ${filters.location} ${budgetSuffix}`.trim(),
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
        persona: "tenant",
        requirements: {
          locations: [filters.location],
          unit_type: filters.bhk !== "Any BHK" ? filters.bhk : undefined,
          budget: filters.budget !== "Any Budget" ? filters.budget : undefined,
          property_type: "Residential",
          transaction_type: "rent",
        },
      });

      if (res.success) {
        if (res.session_uuid && !sessionUuid) {
          setSessionUuid(res.session_uuid);
          localStorage.setItem(REX_SESSION_STORAGE_KEY, res.session_uuid);
        }

        const hasProperties = Array.isArray(res.properties) && res.properties.length > 0;
        let botText = res.reply || `Here are verified rental properties in ${filters.location}:`;
        let suggestions = (res.suggestions || []).filter((s) => {
          const low = s.toLowerCase();
          return !low.includes("site visit") && !low.includes("schedule") && !low.includes("resale") && !low.includes("valuation") && !low.includes("sell");
        });

        if (!hasProperties) {
          botText = res.reply || `Currently, no rental properties are available in ${filters.location} for ${filters.bhk}. Would you like to adjust your filters or explore other areas?`;
          if (!suggestions.length) {
            suggestions = [
              `Rent in Baner`,
              `Rent in Wakad`,
              `Rent in Hinjewadi`,
              `Modify Filters`,
            ];
          }
        }

        const botMsg: AIMessage = {
          id: `bot_${Date.now()}`,
          text: botText,
          sender: "bot",
          timestamp: new Date(),
          properties: res.properties,
          pagination: res.pagination,
          suggestions: suggestions.length > 0 ? suggestions : ["Contact Owner", "Explore nearby rentals", "Modify Filters"],
        };

        setAiMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      console.error("Failed to query rental properties:", err);
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

    const locName = data.location_name || (data as any).locality || "Pune";
    const unitName = data.unit_type || (data as any).bhk || "Property";

    const userSummaryMsg: AIMessage = {
      id: `u_seller_${Date.now()}`,
      text: `Listing for Resale: ${unitName} at ${data.society_name}, ${locName} (Expected: ${data.expected_price})`,
      sender: "user",
      timestamp: new Date(),
    };
    setAiMessages((prev) => [...prev, userSummaryMsg]);

    // If not authenticated, prompt in-chat verification
    if (!isAuthenticated) {
      const cachedEmail = rexProfile?.email || inChatAuthData?.email || "";
      const cachedName = rexProfile?.name || (inChatAuthData?.first_name ? `${inChatAuthData.first_name} ${inChatAuthData.last_name || ""}`.trim() : "");
      const cachedPhone = rexProfile?.phone || inChatAuthData?.phone || "";

      sessionStorage.setItem("rex_pending_seller_property", JSON.stringify(data));

      if (cachedEmail || cachedPhone) {
        try {
          const statusRes = await rexApi.performAction({
            action: "check_user_status",
            payload: { email: cachedEmail, phone: cachedPhone },
            session_uuid: sessionUuid || undefined,
            guest_uuid: getGuestUuid(),
          });
          if (statusRes.is_registered) {
            promptExistingUserLogin(cachedEmail || cachedPhone || "", statusRes.first_name, {
              type: "seller_property",
              sellerPropertyData: data,
            });
            return;
          }
        } catch (e) {
          console.error("Check user status error in handleSellerWizardSubmit:", e);
        }
      }

      const authFormMsg: AIMessage = {
        id: `bot_seller_auth_form_${Date.now()}`,
        text: `Great! To register your property at ${data.society_name} and assign your dedicated Property Executive, please verify your details below:`,
        sender: "bot",
        timestamp: new Date(),
        inChatAuthForm: {
          initialName: cachedName,
          initialEmail: cachedEmail,
          initialPhone: cachedPhone,
          role: "seller",
          actionType: "seller_listing",
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
          location_name: locName,
          unit_type: unitName,
          seller_name: user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "Property Seller",
          seller_phone: user?.phone || undefined,
          seller_email: user?.email || undefined,
          user_id: user?.id,
          seller_id: (user as any)?.seller_id || undefined,
        },
        session_uuid: sessionUuid || undefined,
        guest_uuid: getGuestUuid(),
      });

      if (res.success) {
        const confirmedMsg: AIMessage = {
          id: `seller_conf_${Date.now()}`,
          text: res.reply || `Your property at ${data.society_name}, ${locName} has been submitted for review! Our team has assigned dedicated Property Executive ${res.executive_card?.executiveName || ""} to your property.`,
          sender: "bot",
          timestamp: new Date(),
          sellerConfirmedCard: {
            data: {
              ...data,
              location_name: locName,
              unit_type: unitName,
            },
            executiveCard: res.executive_card,
          },
          suggestions: ["Chat with Executive", "List Another Property", "Check Active Buyers in My Locality", "Talk to Property Executive"],
        };

        if (res.session_uuid && !sessionUuid) {
          setSessionUuid(res.session_uuid);
          localStorage.setItem(REX_SESSION_STORAGE_KEY, res.session_uuid);
        }

        setRexRequirements((prev) => ({
          ...prev,
          locations: [locName],
          society_name: data.society_name,
          unit_type: unitName,
          carpet_area: data.carpet_area,
          budget: data.expected_price,
          transaction_type: "sell",
        }));

        setAiMessages((prev) => [...prev, confirmedMsg]);
        loadUserConversations();
      }
    } catch (err) {
      console.error("Failed to submit seller property:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleOwnerRentalSubmit = async (data: OwnerRentalFormData, msgId?: string) => {
    if (msgId) {
      setAiMessages((prev) =>
        prev.map((m) =>
          m.id === msgId && m.ownerWizardCard
            ? { ...m, ownerWizardCard: { ...m.ownerWizardCard, disabled: true } }
            : m
        )
      );
    }

    const userSummaryMsg: AIMessage = {
      id: `u_owner_${Date.now()}`,
      text: `Listing for Rent: ${data.unit_type || data.property_subtype_name} at ${data.society_name}, ${data.location_name} (Rent: ₹${Number(data.monthly_rent).toLocaleString("en-IN")}/mo, Deposit: ₹${Number(data.security_deposit).toLocaleString("en-IN")})`,
      sender: "user",
      timestamp: new Date(),
    };
    setAiMessages((prev) => [...prev, userSummaryMsg]);

    // If not authenticated, prompt in-chat verification or existing user login
    if (!isAuthenticated) {
      const cachedEmail = rexProfile?.email || inChatAuthData?.email || "";
      const cachedName = rexProfile?.name || (inChatAuthData?.first_name ? `${inChatAuthData.first_name} ${inChatAuthData.last_name || ""}`.trim() : "");
      const cachedPhone = rexProfile?.phone || inChatAuthData?.phone || "";

      sessionStorage.setItem("rex_pending_owner_rental", JSON.stringify(data));

      if (cachedEmail || cachedPhone) {
        try {
          const statusRes = await rexApi.performAction({
            action: "check_user_status",
            payload: { email: cachedEmail, phone: cachedPhone },
            session_uuid: sessionUuid || undefined,
            guest_uuid: getGuestUuid(),
          });
          if (statusRes.is_registered) {
            promptExistingUserLogin(cachedEmail || cachedPhone || "", statusRes.first_name, {
              type: "owner_rental_wizard",
            });
            return;
          }
        } catch (e) {
          console.error("Check user status error in handleOwnerRentalSubmit:", e);
        }
      }

      const authFormMsg: AIMessage = {
        id: `bot_owner_auth_form_${Date.now()}`,
        text: `Great! To list your rental property at ${data.society_name} and assign your dedicated Sales Executive, please verify your details below:`,
        sender: "bot",
        timestamp: new Date(),
        inChatAuthForm: {
          initialName: cachedName,
          initialEmail: cachedEmail,
          initialPhone: cachedPhone,
          role: "owner",
          actionType: "interested",
        },
      };
      setAiMessages((prev) => [...prev, authFormMsg]);
      return;
    }

    // If authenticated, submit immediately
    setIsSending(true);
    try {
      const res = await rexApi.performAction({
        action: "submit_owner_rental_property",
        payload: {
          ...data,
          owner_name: user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "Property Owner",
          owner_phone: user?.phone || undefined,
          owner_email: user?.email || undefined,
          user_id: user?.id,
          owner_id: (user as any)?.owner_id || undefined,
        },
        session_uuid: sessionUuid || undefined,
        guest_uuid: getGuestUuid(),
      });

      if (res.success) {
        const confirmedMsg: AIMessage = {
          id: `owner_conf_${Date.now()}`,
          text: res.message || `Your rental property at ${data.society_name}, ${data.location_name} has been registered! A dedicated Sales Executive has been assigned to find and verify tenants.`,
          sender: "bot",
          timestamp: new Date(),
          ownerConfirmedCard: {
            propertyTitle: res.property?.title || `${data.unit_type} at ${data.society_name}`,
            societyName: data.society_name,
            locality: data.location_name,
            unitType: data.unit_type,
            monthlyRent: data.monthly_rent,
            securityDeposit: data.security_deposit,
            executiveName: res.executive_card?.executiveName || "Soniya Singh",
            executivePhone: res.executive_card?.executivePhone || "+91 9604 350 255",
            executiveEmail: res.executive_card?.executiveEmail || "support@resaleexpert.in",
            executiveRole: res.executive_card?.executiveRole || "Sales Executive",
          },
          suggestions: [
            "Go to Owner Dashboard",
            "List Another Rental Property",
            "Check Interested Tenants",
            "Talk to Sales Executive",
          ],
        };
        setAiMessages((prev) => [...prev, confirmedMsg]);
      }
    } catch (err) {
      console.error("Failed to submit owner rental property:", err);
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
    if (typeof window !== "undefined") {
      sessionStorage.setItem("rex_resume_decision_made", "true");
      localStorage.setItem("rex_last_active_time", Date.now().toString());
    }
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

    // Up-Front Rent Property / Tenant Search Intent:
    // When user clicks "Search Rental Home" or asks "i want rent property / flat" without specifications
    if (isRentingIntentWithoutCriteria(text)) {
      setSelectedPersona("tenant");
      localStorage.setItem(REX_PERSONA_KEY, "tenant");
      const userMsg: AIMessage = { id: `u_${Date.now()}`, text, sender: "user", timestamp: new Date() };
      const botMsg: AIMessage = {
        id: `b_persona_tenant_${Date.now()}`,
        text: "Looking for a home on rent? Filter by preferred locality, monthly budget, and BHK configuration to find verified rental matches:",
        sender: "bot",
        timestamp: new Date(),
        tenantFilterCard: {
          initialLocation: rexRequirements.locations?.[0] || "Baner",
          initialBhk: rexRequirements.unit_type || "2 BHK",
          initialBudget: "₹15k - ₹25k",
          initialFurnishing: "Any",
        },
        suggestions: ["Rent in Baner", "Rent in Wakad", "Rent in Hinjewadi", "1 BHK in Hinjewadi"],
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

    // 2) Seller Suggestion Pill Interceptors (High Priority)
    if (
      lower.includes("active buyers") ||
      lower.includes("check active buyers") ||
      lower.includes("buyers in my locality") ||
      lower === "check active buyers in my locality"
    ) {
      const userMsg: AIMessage = { id: `u_${Date.now()}`, text, sender: "user", timestamp: new Date() };
      const loc = rexRequirements.locations?.[0] || "Baner, Wakad & West Pune";
      const botMsg: AIMessage = {
        id: `b_active_buyers_${Date.now()}`,
        text: `Live Verified Buyer Demand for ${loc}:\n\n• 48+ Active Verified Buyers currently looking for 1, 1.5, 2 & 3 BHK resale flats\n• Average Budget Demand: ₹38 Lakh – ₹85 Lakh\n• High Demand For: Gated Societies, Lift, Covered Parking & Open Balconies\n\nOur Property Executives match verified buyers directly with your property without spam calls.`,
        sender: "bot",
        timestamp: new Date(),
        suggestions: ["Talk to Property Executive", "Get Free Property Valuation", "Check Listing Status", "List Another Property"],
      };
      setAiMessages((prev) => [...prev, userMsg, botMsg]);
      setInputText("");
      rexApi.performAction({
        action: "save_message",
        payload: { messages: [userMsg, botMsg], persona: "seller" },
        session_uuid: sessionUuid,
        guest_uuid: getGuestUuid(),
      }).catch(() => {});
      return;
    }

    if (
      lower.includes("listing status") ||
      lower.includes("check listing status") ||
      lower.includes("check status") ||
      lower === "check listing status"
    ) {
      const userMsg: AIMessage = { id: `u_${Date.now()}`, text, sender: "user", timestamp: new Date() };
      setAiMessages((prev) => [...prev, userMsg]);
      setInputText("");
      setIsAiTyping(true);

      rexApi.performAction({
        action: "get_listing_status",
        payload: {
          userId: user?.id,
          phone: user?.phone,
          email: user?.email,
          society_name: rexRequirements.society_name,
        },
        session_uuid: sessionUuid,
        guest_uuid: getGuestUuid(),
      }).then((res) => {
        const society = rexRequirements.society_name || "your submitted property";
        const loc = rexRequirements.locations?.[0] || "Pune";
        const botMsg: AIMessage = {
          id: `b_listing_status_${Date.now()}`,
          text: res.reply || `Property Listing Status:\n\n• Property: ${society} (${loc})\n• Status: Under Review • Executive Assignment in Progress\n• Stage: Document & Society Verification\n\nOur operations team is currently reviewing your property details. A dedicated Property Executive will contact you shortly to verify ownership documents and initiate buyer matching.`,
          sender: "bot",
          timestamp: new Date(),
          suggestions: res.suggestions || ["Talk to Property Executive", "Check Active Buyers in My Locality", "Get Free Property Valuation", "List Another Property"],
        };
        setAiMessages((prev) => [...prev, botMsg]);
        if (res.session_uuid && !sessionUuid) {
          setSessionUuid(res.session_uuid);
          localStorage.setItem(REX_SESSION_STORAGE_KEY, res.session_uuid);
        }
      }).catch((err) => {
        console.error("get_listing_status error:", err);
        const society = rexRequirements.society_name || "your submitted property";
        const loc = rexRequirements.locations?.[0] || "Pune";
        const botMsg: AIMessage = {
          id: `b_listing_status_${Date.now()}`,
          text: `Property Listing Status:\n\n• Property: ${society} (${loc})\n• Status: Under Review • Executive Assignment in Progress\n• Stage: Document & Society Verification\n\nOur operations team is currently reviewing your property details. A dedicated Property Executive will contact you shortly to verify ownership documents and initiate buyer matching.`,
          sender: "bot",
          timestamp: new Date(),
          suggestions: ["Talk to Property Executive", "Check Active Buyers in My Locality", "Get Free Property Valuation", "List Another Property"],
        };
        setAiMessages((prev) => [...prev, botMsg]);
      }).finally(() => {
        setIsAiTyping(false);
      });
      return;
    }

    if (
      lower.includes("property valuation") ||
      lower.includes("resale valuation") ||
      lower.includes("free property valuation") ||
      lower.includes("estimate price") ||
      lower === "get free property valuation"
    ) {
      const userMsg: AIMessage = { id: `u_${Date.now()}`, text, sender: "user", timestamp: new Date() };
      const loc = rexRequirements.locations?.[0] || "Baner, Pune";
      const botMsg: AIMessage = {
        id: `b_valuation_${Date.now()}`,
        text: `Resale Valuation Overview for ${loc}:\n\n• Current Market Rate: ₹6,400 – ₹8,900 / sq.ft\n• Typical 1.5 BHK Resale Bracket: ₹38 Lakh – ₹48 Lakh\n• Typical 2 BHK Resale Bracket: ₹55 Lakh – ₹78 Lakh\n• Average Selling Timeline: 25 – 45 days with 100% managed resale assistance\n\nWould you like our Property Executive to schedule an on-site inspection for an exact valuation report?`,
        sender: "bot",
        timestamp: new Date(),
        suggestions: ["Talk to Property Executive", "Check Active Buyers in My Locality", "Check Listing Status", "List Another Property"],
      };
      setAiMessages((prev) => [...prev, userMsg, botMsg]);
      setInputText("");
      rexApi.performAction({
        action: "save_message",
        payload: { messages: [userMsg, botMsg], persona: "seller" },
        session_uuid: sessionUuid,
        guest_uuid: getGuestUuid(),
      }).catch(() => {});
      return;
    }

    // Check for Call Request intent
    if (
      lower === "call request" ||
      lower === "request call" ||
      lower === "request callback" ||
      lower === "call me back" ||
      lower.includes("call request")
    ) {
      const userMsg: AIMessage = { id: `u_${Date.now()}`, text, sender: "user", timestamp: new Date() };
      setAiMessages((prev) => [...prev, userMsg]);
      setInputText("");
      handleOpenCallRequest();
      return;
    }

    // Broker / Channel Partner Intent:
    if (
      lower.includes("i am a broker") ||
      lower.includes("i am broker") ||
      lower.includes("i am an agent") ||
      lower.includes("i am agent") ||
      lower.includes("channel partner") ||
      lower.includes("cp registration") ||
      lower.includes("broker tie up") ||
      lower.includes("brokerage") ||
      lower.includes("commission slab") ||
      lower.includes("commission structure") ||
      lower === "broker"
    ) {
      setSelectedPersona("broker");
      localStorage.setItem(REX_PERSONA_KEY, "broker");
      const userMsg: AIMessage = { id: `u_${Date.now()}`, text, sender: "user", timestamp: new Date() };
      const botMsg: AIMessage = {
        id: `b_broker_${Date.now()}`,
        text: `Welcome to the Resale Expert Channel Partner Network!\n\n• Partnership Desk: B2B Channel Partner Relations\n• Direct Phone / WhatsApp: +91 9637 00 9639\n• Email: partners@resaleexpert.in\n• Office Hours: Mon – Sun, 9:30 AM – 7:30 PM\n• Collaboration: Verified Pune resale & rental inventory, transparent commission slabs, dedicated relationship manager, and swift deal closures.\n\nYou can chat, call, or reach us on WhatsApp directly!`,
        sender: "bot",
        timestamp: new Date(),
        suggestions: ["Channel Partner Registration", "Commission Structure", "Inventory Sharing", "Talk to Partner Desk"],
        executiveDeskCard: {
          deskName: "Dedicated Channel Partner Desk",
          phone: "+919637009639",
          displayPhone: "+91 9637 00 9639",
          persona: "broker",
        },
      };
      setAiMessages((prev) => [...prev, userMsg, botMsg]);
      setInputText("");
      rexApi.performAction({
        action: "save_message",
        payload: { messages: [userMsg, botMsg], persona: "broker" },
        session_uuid: sessionUuid,
        guest_uuid: getGuestUuid(),
      }).catch(() => {});
      return;
    }

    // Dedicated Interceptor: Chat with Executive for submitted property
    if (lower === "chat with executive" || lower === "chat with property executive") {
      const lastConfirmed = [...aiMessages].reverse().find(
        (m) => m.sellerConfirmedCard?.executiveCard?.propertyId || (m as any).rentalOwnerCard?.property_id
      );
      const propId =
        lastConfirmed?.sellerConfirmedCard?.executiveCard?.propertyId ||
        (lastConfirmed as any)?.rentalOwnerCard?.property_id ||
        (activeConversation as any)?.property_id;

      if (propId) {
        handleOpenPropertyConversation({ propertyId: Number(propId) });
        return;
      }
    }

    if (
      lower.includes("talk to sales executive") ||
      lower.includes("talk to property executive") ||
      lower.includes("talk to executive") ||
      lower.includes("connect with executive") ||
      lower.includes("contact executive") ||
      lower.includes("talk to agent") ||
      lower.includes("talk to partner desk") ||
      lower.includes("talk to owner desk") ||
      lower === "talk to sales executive" ||
      lower === "talk to property executive" ||
      lower === "talk to executive"
    ) {
      const userMsg: AIMessage = { id: `u_${Date.now()}`, text, sender: "user", timestamp: new Date() };
      setAiMessages((prev) => [...prev, userMsg]);
      setInputText("");
      setIsAiTyping(true);

      // Handle Tenant persona explicitly - connect to Dedicated Rental Support Desk
      if (selectedPersona === "tenant") {
        setTimeout(() => {
          const botMsg: AIMessage = {
            id: `b_talk_exec_${Date.now()}`,
            text: `You are connected with our Dedicated Rental Assistance Desk:\n\n• Dedicated Rental Desk: Tenant Support Team\n• Direct Phone / WhatsApp: +91 9637 00 9639\n• Email: info@resaleexpert.in\n• Office Hours: Mon - Fri: 9:00 AM - 8:00 PM | Sat - Sun: 9:00 AM - 9:00 PM\n• Assistance: Our rental team assists you with owner contact details, physical flat verification, rental agreement drafting, and move-in coordination.\n\nYou can chat, call, or reach us on WhatsApp directly!`,
            sender: "bot",
            timestamp: new Date(),
            suggestions: ["Rent in Baner", "Rent in Wakad", "Rent in Hinjewadi", "Modify Filters"],
            executiveDeskCard: {
              deskName: "Dedicated Rental Desk",
              phone: "+919637009639",
              displayPhone: "+91 9637 00 9639",
              persona: "tenant",
            },
          };
          setAiMessages((prev) => [...prev, botMsg]);
          setIsAiTyping(false);

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
        }, 350);
        return;
      }

      // Handle Buyer persona explicitly - connect to Dedicated Buyer Advisory Desk
      if (selectedPersona === "buyer") {
        setTimeout(() => {
          const botMsg: AIMessage = {
            id: `b_talk_exec_${Date.now()}`,
            text: `You are connected with our Dedicated Buyer Advisory Desk:\n\n• Advisory Team: Resale Expert Property Advisory\n• Direct Phone / WhatsApp: +91 9637 00 9639\n• Email: info@resaleexpert.in\n• Office Hours: Mon - Fri: 9:00 AM - 8:00 PM | Sat - Sun: 9:00 AM - 9:00 PM\n• Assistance: Our property advisors assist with verified property visits, legal documentation review, pricing negotiations, and home loan processing.\n\nYou can call, message on WhatsApp, or let me know what property you'd like to visit!`,
            sender: "bot",
            timestamp: new Date(),
            suggestions: ["Explore 2 BHK in Pune", "Book Site Visit", "Properties under ₹80L", "Filter Properties"],
            executiveDeskCard: {
              deskName: "Dedicated Buyer Advisory Desk",
              phone: "+919637009639",
              displayPhone: "+91 9637 00 9639",
              persona: "buyer",
            },
          };
          setAiMessages((prev) => [...prev, botMsg]);
          setIsAiTyping(false);

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
        }, 350);
        return;
      }

      // Handle Broker persona explicitly - connect to Dedicated Channel Partner Desk
      if (selectedPersona === "broker") {
        setTimeout(() => {
          const botMsg: AIMessage = {
            id: `b_talk_exec_${Date.now()}`,
            text: `You are connected with our Dedicated Channel Partner & Broker Desk:\n\n• Partnership Desk: B2B Channel Partner Relations\n• Direct Phone / WhatsApp: +91 9637 00 9639\n• Email: info@resaleexpert.in\n• Office Hours: Mon - Fri: 9:00 AM - 8:00 PM | Sat - Sun: 9:00 AM - 9:00 PM\n• Collaboration: Verified Pune inventory access, guaranteed fast commission payouts, dedicated CP relationship manager, and joint client site visit coordination.\n\nYou can call, reach us on WhatsApp, or schedule a partnership discussion!`,
            sender: "bot",
            timestamp: new Date(),
            suggestions: ["Channel Partner Registration", "Commission Structure", "Inventory Sharing", "Talk to Partner Desk"],
            executiveDeskCard: {
              deskName: "Dedicated Channel Partner Desk",
              phone: "+919637009639",
              displayPhone: "+91 9637 00 9639",
              persona: "broker",
            },
          };
          setAiMessages((prev) => [...prev, botMsg]);
          setIsAiTyping(false);

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
        }, 350);
        return;
      }

      rexApi.performAction({
        action: "get_property_executive",
        payload: {
          userId: user?.id,
          phone: user?.phone,
          email: user?.email,
          society_name: rexRequirements.society_name,
          persona: selectedPersona || "seller",
          userMessage: text,
        },
        session_uuid: sessionUuid,
        guest_uuid: getGuestUuid(),
      }).then((res: any) => {
        const botMsg: AIMessage = {
          id: `b_talk_exec_${Date.now()}`,
          text: res.reply || `You can connect with the Resale Expert team directly:\n\n• Dedicated Support: Resale Expert Property Executive Team\n• Direct Phone / WhatsApp: +91 9637 00 9639\n• Email: info@resaleexpert.in\n• Office Hours: Mon - Fri: 9:00 AM - 8:00 PM | Sat - Sun: 9:00 AM - 9:00 PM\n\nOur assigned Executive handles physical verification, key holding, legal documentation, and verified buyer visits.`,
          sender: "bot",
          timestamp: new Date(),
          suggestions: res.suggestions || ["Check Active Buyers in My Locality", "Get Free Property Valuation", "Check Listing Status", "List Another Property"],
          executiveDeskCard: !res.executive_card ? {
            deskName: res.executive_desk?.deskName || (selectedPersona === "owner" ? "Dedicated Owner Assistance Desk" : "Resale Expert Property Executive Team"),
            phone: res.executive_desk?.phone || "+919637009639",
            displayPhone: res.executive_desk?.displayPhone || "+91 9637 00 9639",
            persona: selectedPersona || "seller",
          } : undefined,
          sellerExecutiveCard: res.executive_card ? {
            executiveName: res.executive_card.executiveName || 'Executive Desk',
            propertyTitle: res.executive_card.propertyTitle,
            propertyId: res.executive_card.propertyId,
            propertySlug: res.executive_card.propertySlug,
            propertyPrice: res.executive_card.propertyPrice,
            conversationId: res.executive_card.conversationId,
          } : undefined,
        };
        setAiMessages((prev) => [...prev, botMsg]);
        if (res.session_uuid && !sessionUuid) {
          setSessionUuid(res.session_uuid);
          localStorage.setItem(REX_SESSION_STORAGE_KEY, res.session_uuid);
        }

        rexApi.performAction({
          action: "save_message",
          payload: { messages: [userMsg, botMsg], persona: selectedPersona || "seller" },
          session_uuid: res.session_uuid || sessionUuid,
          guest_uuid: getGuestUuid(),
        }).catch(() => {});
      }).catch((err) => {
        console.error("get_property_executive error:", err);
        const botMsg: AIMessage = {
          id: `b_talk_exec_${Date.now()}`,
          text: `You can connect with the Resale Expert team directly:\n\n• Dedicated Support: Resale Expert Property Executive Team\n• Direct Phone / WhatsApp: +91 9637 00 9639\n• Email: info@resaleexpert.in\n• Office Hours: Mon - Fri: 9:00 AM - 8:00 PM | Sat - Sun: 9:00 AM - 9:00 PM\n\nOur assigned Executive handles physical verification, key holding, legal documentation, and verified buyer visits.`,
          sender: "bot",
          timestamp: new Date(),
          suggestions: ["Check Active Buyers in My Locality", "Get Free Property Valuation", "Check Listing Status", "List Another Property"],
          executiveDeskCard: {
            deskName: "Resale Expert Property Executive Team",
            phone: "+919637009639",
            displayPhone: "+91 9637 00 9639",
            persona: selectedPersona || "seller",
          },
        };
        setAiMessages((prev) => [...prev, botMsg]);
      }).finally(() => {
        setIsAiTyping(false);
      });
      return;
    }

    // Dedicated Owner Inquiry: Check Interested Tenants / Demand
    if (
      lower.includes("interested tenant") ||
      lower.includes("tenant demand") ||
      lower.includes("track interested") ||
      lower.includes("check interested") ||
      lower.includes("check tenant")
    ) {
      const userMsg: AIMessage = { id: `u_${Date.now()}`, text, sender: "user", timestamp: new Date() };
      const botMsg: AIMessage = {
        id: `b_tenants_${Date.now()}`,
        text: `We are actively tracking verified tenant requirements across Pune!\n\n• High Tenant Demand: IT working professionals & families are looking for 1, 2 & 3 BHKs in Baner, Wakad, Hinjewadi, and Kharadi.\n• Verified Backgrounds: All interested tenants undergo phone screening, corporate ID verification, and biometric Leave & License drafting.\n• Owner Dashboard: You can review matching tenant inquiries, move-in timelines, and contact details directly in your Owner Portal.`,
        sender: "bot",
        timestamp: new Date(),
        suggestions: ["Open Your Dashboard", "List Another Rental Property", "Talk to Sales Executive", "Rental Agreement Rules"],
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
      });
      return;
    }

    // Dedicated Owner Rental Property Intent:
    // When user clicks "List Property for Rent" or expresses intent to list rental property:
    // 1. If not authenticated:
    //    - If known email/phone in chat session, check registration status via check_user_status.
    //      If already registered, prompt them: "Your account already exists. Please login to continue forward" with login button.
    //    - If new user, show In-Chat Registration Card with role: "owner", actionType: "owner_listing".
    //      Once OTP is verified, handleVerifyInChatOtp logs them in and renders the ownerWizardCard!
    // 2. If already authenticated:
    //    - Render the ownerWizardCard immediately!
    if (isOwnerRentalListingIntent(text)) {
      setSelectedPersona("owner");
      localStorage.setItem(REX_PERSONA_KEY, "owner");
      const userMsg: AIMessage = { id: `u_${Date.now()}`, text, sender: "user", timestamp: new Date() };

      if (!isAuthenticated) {
        const cachedEmail = rexProfile?.email || inChatAuthData?.email || "";
        const cachedName = rexProfile?.name || (inChatAuthData?.first_name ? `${inChatAuthData.first_name} ${inChatAuthData.last_name || ""}`.trim() : "");
        const cachedPhone = rexProfile?.phone || inChatAuthData?.phone || "";

        if (cachedEmail || cachedPhone) {
          try {
            const statusRes = await rexApi.performAction({
              action: "check_user_status",
              payload: { email: cachedEmail, phone: cachedPhone },
              session_uuid: sessionUuid || undefined,
              guest_uuid: getGuestUuid(),
            });
            if (statusRes.is_registered) {
              setAiMessages((prev) => [...prev, userMsg]);
              setInputText("");
              promptExistingUserLogin(cachedEmail || cachedPhone || "", statusRes.first_name, {
                type: "owner_rental_wizard",
              });
              return;
            }
          } catch (e) {
            console.error("Check user status error in owner intent:", e);
          }
        }

        const authFormMsg: AIMessage = {
          id: `b_owner_reg_${Date.now()}`,
          text: "To list your rental property with Resale Expert and connect with verified tenants, please register your owner profile below:",
          sender: "bot",
          timestamp: new Date(),
          inChatAuthForm: {
            initialName: cachedName,
            initialEmail: cachedEmail,
            initialPhone: cachedPhone,
            role: "owner",
            actionType: "owner_listing",
          },
          suggestions: ["Login to Your Account", "Talk to Sales Executive", "Explore Pune Rentals"],
        };
        setAiMessages((prev) => [...prev, userMsg, authFormMsg]);
        setInputText("");
        return;
      }

      // If user is already authenticated:
      const botMsg: AIMessage = {
        id: `b_owner_wizard_${Date.now()}`,
        text: `Welcome, ${user?.first_name || "Owner"}! Please fill in your rental property details below to find verified tenants and have a dedicated Sales Executive assigned:`,
        sender: "bot",
        timestamp: new Date(),
        ownerWizardCard: {},
        suggestions: ["Go to Owner Dashboard", "Talk to Sales Executive", "Explore Pune Rentals"],
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

    // 3) Seller Intent & Property Submission Wizard:
    // When user expresses seller intent (e.g. "i want to sell property", "sell property", "list my property", "list another property", "Roomac , 333 sq ft", etc.)
    // Immediately open the interactive Seller Listing Wizard with any extracted details pre-filled!
    if (isSellerIntent(text) || (selectedPersona === "seller" && (lower.includes("sq ft") || lower.includes("bhk") || lower.includes(",") || lower.includes("sqft")) && !lower.includes("status") && !lower.includes("valuation") && !lower.includes("buyers"))) {
      setSelectedPersona("seller");
      localStorage.setItem(REX_PERSONA_KEY, "seller");
      const userMsg: AIMessage = { id: `u_${Date.now()}`, text, sender: "user", timestamp: new Date() };

      const parsed = parseSellerDetails(text);
      const initialLoc = parsed.locality || rexRequirements.locations?.[0] || "Punawale";
      const initialBhk = parsed.bhk || rexRequirements.unit_type || "2 BHK";
      const initialSociety = parsed.society_name || "";
      const initialCarpet = parsed.carpet_area || "";
      const initialPrice = parsed.expected_price || "";

      if (!isAuthenticated) {
        const cachedEmail = rexProfile?.email || inChatAuthData?.email || "";
        const cachedName = rexProfile?.name || (inChatAuthData?.first_name ? `${inChatAuthData.first_name} ${inChatAuthData.last_name || ""}`.trim() : "");
        const cachedPhone = rexProfile?.phone || inChatAuthData?.phone || "";

        if (cachedEmail || cachedPhone) {
          try {
            const statusRes = await rexApi.performAction({
              action: "check_user_status",
              payload: { email: cachedEmail, phone: cachedPhone },
              session_uuid: sessionUuid || undefined,
              guest_uuid: getGuestUuid(),
            });
            if (statusRes.is_registered) {
              setAiMessages((prev) => [...prev, userMsg]);
              setInputText("");
              promptExistingUserLogin(cachedEmail || cachedPhone || "", statusRes.first_name, {
                type: "seller_property",
                sellerPropertyData: {
                  society_name: initialSociety,
                  location_name: initialLoc,
                  unit_type: initialBhk,
                  expected_price: initialPrice,
                  carpet_area: initialCarpet,
                  property_type_name: "Residential",
                  property_subtype_name: "Apartment / Flat",
                },
              });
              return;
            }
          } catch (e) {
            console.error("Check user status error in seller intent:", e);
          }
        }

        const authFormMsg: AIMessage = {
          id: `b_seller_reg_${Date.now()}`,
          text: "To list your property for resale with Resale Expert and connect with verified buyers, please register your seller profile below:",
          sender: "bot",
          timestamp: new Date(),
          inChatAuthForm: {
            initialName: cachedName,
            initialEmail: cachedEmail,
            initialPhone: cachedPhone,
            role: "seller",
            actionType: "seller_listing",
          },
          suggestions: ["Login to Your Account", "Talk to Property Executive", "Explore Pune Resale Properties"],
        };
        setAiMessages((prev) => [...prev, userMsg, authFormMsg]);
        setInputText("");
        return;
      }

      // If user is already authenticated:
      const botMsg: AIMessage = {
        id: `b_persona_seller_${Date.now()}`,
        text: `Welcome, ${user?.first_name || "Seller"}! Please provide your property details below to submit for dedicated executive inspection and buyer matching:`,
        sender: "bot",
        timestamp: new Date(),
        sellerWizardCard: {
          initialData: {
            society_name: initialSociety,
            location_name: initialLoc,
            unit_type: initialBhk,
            carpet_area: initialCarpet,
            expected_price: initialPrice,
          },
        },
        suggestions: ["Check Active Buyers in My Locality", "Get Free Property Valuation", "Talk to Property Executive"],
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

    // Interactive Suggestion Interceptors: Contact Owner
    if (lower === "contact owner" || lower.includes("contact owner") || lower.includes("owner details") || lower.includes("owner contact")) {
      const rentalProp = aiMessages
        .slice()
        .reverse()
        .map((m) => m.properties?.find((p) => p.listing_type === "rent" || p.price_display?.includes("/mo")) || (m.properties && m.properties[0]))
        .find(Boolean);

      if (rentalProp) {
        handlePropertyInterested(rentalProp);
        return;
      }
    }

    // Interactive Suggestion Interceptors: Persona-Aware Dashboard Navigation
    if (
      lower === "open your dashboard" ||
      lower === "open dashboard" ||
      lower === "my dashboard" ||
      lower === "dashboard" ||
      lower === "go to dashboard" ||
      lower === "go to tenant dashboard" ||
      lower === "open tenant dashboard" ||
      lower === "tenant dashboard" ||
      lower.includes("tenant dashboard") ||
      lower.includes("owner dashboard") ||
      lower.includes("seller dashboard") ||
      lower.includes("buyer dashboard")
    ) {
      const isOwner = selectedPersona === "owner" || user?.role === "owner" || lower.includes("owner");
      const isSeller = selectedPersona === "seller" || user?.role === "seller" || lower.includes("seller");
      const isBuyer = selectedPersona === "buyer" || user?.role === "buyer" || lower.includes("buyer");
      const isTenant = selectedPersona === "tenant" || user?.role === "tenant" || lower.includes("tenant");

      let targetUrl = "/dashboard";
      let portalName = "Dashboard";
      if (isOwner) {
        targetUrl = "/dashboard/rental-properties";
        portalName = "Owner Portal";
      } else if (isSeller) {
        targetUrl = "/seller-dashboard";
        portalName = "Seller Dashboard";
      } else if (isBuyer) {
        targetUrl = "/buyer-dashboard";
        portalName = "Buyer Portal";
      } else if (isTenant) {
        targetUrl = "/dashboard/rental-properties";
        portalName = "Tenant Portal";
      }

      setIsOpen(false);
      navigate(targetUrl);
      return;
    }

    // Dedicated Owner Suggestion Interceptor: Rental Agreement Rules
    if (
      lower === "rental agreement rules" ||
      lower.includes("agreement rules") ||
      lower === "rental agreement"
    ) {
      const userMsg: AIMessage = { id: `u_${Date.now()}`, text, sender: "user", timestamp: new Date() };
      const botMsg: AIMessage = {
        id: `b_rules_${Date.now()}`,
        text: `Key Maharashtra Rental Agreement (Leave & License) Rules for Owners:\n\n• Mandatory Online Registration: As per the Maharashtra Rent Control Act, 1999, all rental agreements must be officially registered.\n• Biometric Verification: Both Owner and Tenant must undergo Aadhaar-based biometric e-registration. Our executive assists at your doorstep.\n• Standard Tenure: Typical agreements are drafted for 11 months with an optional renewal and standard 30-day notice clause.\n• Police Intimation: Submission of tenant verification details to the local Pune police station is legally required and coordinated by our team.\n• Security Deposit: Standard deposit in Pune is 2 to 3 months of rent, held securely until move-out inspection.`,
        sender: "bot",
        timestamp: new Date(),
        suggestions: ["Open Your Dashboard", "List Another Rental Property", "Talk to Sales Executive", "Check Interested Tenants"],
      };
      setAiMessages((prev) => [...prev, userMsg, botMsg]);
      setInputText("");
      rexApi.performAction({
        action: "save_message",
        payload: { messages: [userMsg, botMsg], persona: "owner" },
        session_uuid: sessionUuid,
        guest_uuid: getGuestUuid(),
      }).catch(() => {});
      return;
    }

    // Interactive Suggestion Interceptors: Modify Filters
    if (lower === "modify filters" || lower.includes("modify filter") || lower.includes("change filter") || lower.includes("modify rent budget")) {
      const userMsg: AIMessage = { id: `u_${Date.now()}`, text: "Modify Filters", sender: "user", timestamp: new Date() };
      if (selectedPersona === "tenant" || lower.includes("rent")) {
        const lastTenantFilter = [...aiMessages].reverse().find((m) => m.tenantFilterCard)?.tenantFilterCard;
        const botMsg: AIMessage = {
          id: `b_mod_filters_${Date.now()}`,
          text: "Adjust your rental preferences to find verified rental homes:",
          sender: "bot",
          timestamp: new Date(),
          tenantFilterCard: {
            initialLocation: lastTenantFilter?.initialLocation || rexRequirements.locations?.[0] || "Baner",
            initialBhk: lastTenantFilter?.initialBhk || rexRequirements.unit_type || "2 BHK",
            initialBudget: lastTenantFilter?.initialBudget || "₹15k - ₹25k",
            initialFurnishing: lastTenantFilter?.initialFurnishing || "Any",
          },
          suggestions: ["Rent in Baner", "Rent in Wakad", "Rent in Hinjewadi"],
        };
        setAiMessages((prev) => [...prev, userMsg, botMsg]);
        setInputText("");
        return;
      }

      const lastFilter = [...aiMessages].reverse().find((m) => m.buyerFilterCard)?.buyerFilterCard;
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

      // If user is not authenticated, prompt in-chat registration first!
      if (!isAuthenticated) {
        if (parsedDateTime) {
          sessionStorage.setItem(
            "rex_pending_visit_schedule",
            JSON.stringify({
              property: topProp,
              payload: {
                date: parsedDateTime.date,
                time: parsedDateTime.time,
                shift: parsedDateTime.shift,
                formattedDisplay: parsedDateTime.formattedDisplay,
              },
            })
          );
        }

        const cachedEmail = rexProfile?.email || inChatAuthData?.email || "";
        const cachedPhone = rexProfile?.phone || inChatAuthData?.phone || "";
        const cachedName = rexProfile?.name || (inChatAuthData?.first_name ? `${inChatAuthData.first_name} ${inChatAuthData.last_name || ""}`.trim() : "");

        if (cachedEmail || cachedPhone) {
          try {
            const statusRes = await rexApi.performAction({
              action: "check_user_status",
              payload: { email: cachedEmail, phone: cachedPhone },
              session_uuid: sessionUuid || undefined,
              guest_uuid: getGuestUuid(),
            });
            if (statusRes.is_registered) {
              setAiMessages((prev) => [...prev, userMsg]);
              setInputText("");
              promptExistingUserLogin(cachedEmail || cachedPhone || "", statusRes.first_name, {
                type: "schedule_visit",
                property: topProp,
              });
              return;
            }
          } catch (e) {
            console.error("Check user status error in visit intent:", e);
          }
        }

        const authFormMsg: AIMessage = {
          id: `auth_form_${Date.now()}`,
          text: topProp
            ? `To schedule your verified site visit for ${getBuyerSafePropertyTitle(topProp)} and connect directly with your dedicated Property Executive, please provide your details below:`
            : "To schedule a verified site visit and connect directly with your dedicated Property Executive, please provide your details below:",
          sender: "bot",
          timestamp: new Date(),
          inChatAuthForm: {
            initialName: cachedName,
            initialEmail: cachedEmail,
            initialPhone: cachedPhone,
            role: "buyer",
            targetProperty: topProp,
            actionType: "schedule_visit",
          },
          suggestions: ["Explore 2 BHK in Pune", "Properties under ₹80L", "Filter Properties"],
        };
        setAiMessages((prev) => [...prev, userMsg, authFormMsg]);
        setInputText("");
        return;
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

      // Case B: User did NOT mention Date & Time -> Show Interactive Schedule Visit Template!
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



    // 3) Executive Contact / Purpose Routing Intent
    const isExecutiveInquiry =
      lower.includes("chat with property executive") ||
      lower.includes("chat with executive") ||
      lower.includes("talk to property executive") ||
      lower.includes("talk to executive") ||
      lower.includes("connect with executive") ||
      lower.includes("contact executive") ||
      lower.includes("contact with executive") ||
      lower.includes("contact with the executive") ||
      lower.includes("talk with executive") ||
      lower.includes("speak to executive") ||
      lower.includes("talk to agent") ||
      lower.includes("connect with agent") ||
      lower.includes("call executive");

    if (isExecutiveInquiry) {
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
      const botMsg: AIMessage = {
        id: `b_exec_purpose_${Date.now()}`,
        text: "I would be glad to connect you with our specialized team! Could you please let me know the purpose of your request so I can route you to the right executive?",
        sender: "bot",
        timestamp: new Date(),
        suggestions: ["🏠 Buy Property", "🏷️ Sell Property", "🔑 Rent Property", "📞 General Admin Support"],
      };
      setAiMessages((prev) => [...prev, userMsg, botMsg]);
      setInputText("");
      rexApi.performAction({
        action: "save_message",
        payload: { messages: [userMsg, botMsg], persona: selectedPersona || "buyer" },
        session_uuid: sessionUuid,
        guest_uuid: getGuestUuid(),
      }).catch(() => {});
      return;
    }

    // 4) Admin Support & General Queries
    const isAdminSupportQuery =
      lower.includes("general admin support") ||
      lower.includes("admin support") ||
      lower.includes("admin contact") ||
      lower.includes("admin number") ||
      lower.includes("contact admin") ||
      lower.includes("general query") ||
      lower.includes("support number") ||
      lower.includes("helpline") ||
      lower.includes("customer care");

    if (isAdminSupportQuery) {
      const userMsg: AIMessage = { id: `u_${Date.now()}`, text, sender: "user", timestamp: new Date() };
      const botMsg: AIMessage = {
        id: `b_admin_contact_${Date.now()}`,
        text: "You can directly connect with our Resale Expert Admin & Support team:\n\n📞 **Phone / WhatsApp**: +91 9637 00 9639\n✉️ **Email**: info@resaleexpert.in\n⏰ **Hours**: Mon - Fri: 9:00 AM - 8:00 PM | Sat - Sun: 9:00 AM - 9:00 PM\n📍 **Office**: Shubhchandra, Nakhate Chowk, Rahatani, Pimpri-Chinchwad, Pune, Maharashtra 411017, India\n\nHow else can I assist you with your real estate needs today?",
        sender: "bot",
        timestamp: new Date(),
        suggestions: ["🏠 Buy Property", "🏷️ Sell Property", "📅 Schedule a Site Visit", "📊 Check Property Valuation"],
      };
      setAiMessages((prev) => [...prev, userMsg, botMsg]);
      setInputText("");
      rexApi.performAction({
        action: "save_message",
        payload: { messages: [userMsg, botMsg], persona: selectedPersona || "buyer" },
        session_uuid: sessionUuid,
        guest_uuid: getGuestUuid(),
      }).catch(() => {});
      return;
    }

    if (lower.includes("check listing status") || lower.includes("check property status") || lower.includes("listing status")) {
      setSelectedPersona("seller");
      const userMsg: AIMessage = { id: `u_${Date.now()}`, text, sender: "user", timestamp: new Date() };
      setAiMessages((prev) => [...prev, userMsg]);
      setInputText("");
      setIsAiTyping(true);

      rexApi.performAction({
        action: "get_listing_status",
        payload: {
          userId: user?.id,
          phone: user?.phone,
          email: user?.email,
          society_name: rexRequirements.society_name,
        },
        session_uuid: sessionUuid,
        guest_uuid: getGuestUuid(),
      }).then((res) => {
        const botMsg: AIMessage = {
          id: `b_listing_status_${Date.now()}`,
          text: res.reply || "Your property has been submitted and is currently in Admin Review. A dedicated Property Executive will contact you to verify documents and coordinate buyer visits.",
          sender: "bot",
          timestamp: new Date(),
          suggestions: res.suggestions || ["Get Free Property Valuation", "Check Active Buyers in My Locality", "Talk to Property Executive"],
        };
        setAiMessages((prev) => [...prev, botMsg]);
        if (res.session_uuid && !sessionUuid) {
          setSessionUuid(res.session_uuid);
          localStorage.setItem(REX_SESSION_STORAGE_KEY, res.session_uuid);
        }
      }).catch(() => {
        const botMsg: AIMessage = {
          id: `b_listing_status_${Date.now()}`,
          text: "Your property has been submitted and is currently in Admin Review. A dedicated Property Executive will contact you to verify documents and coordinate buyer visits.",
          sender: "bot",
          timestamp: new Date(),
          suggestions: ["Get Free Property Valuation", "Check Active Buyers in My Locality", "Talk to Property Executive"],
        };
        setAiMessages((prev) => [...prev, botMsg]);
      }).finally(() => {
        setIsAiTyping(false);
      });
      return;
    }

    if (lower === "login to your account" || lower === "login" || lower === "log in") {
      const emailParam = rexProfile?.email || inChatAuthData?.email || "";
      navigate(`/login${emailParam ? `?email=${encodeURIComponent(emailParam)}` : ""}`);
      return;
    }

    const isExactTenantPrompt =
      !lower.includes("agreement") &&
      !lower.includes("rule") &&
      !lower.includes("process") &&
      !lower.includes("deposit") &&
      !lower.includes("police") &&
      ["search rental home", "rent property", "🔑 rent property", "rent", "rent a flat", "rent a home", "tenant"].includes(lower);
    if (isExactTenantPrompt) {
      setSelectedPersona("tenant");
      localStorage.setItem(REX_PERSONA_KEY, "tenant");
      const userMsg: AIMessage = { id: `u_${Date.now()}`, text, sender: "user", timestamp: new Date() };
      const botMsg: AIMessage = {
        id: `b_persona_tenant_${Date.now()}`,
        text: "Looking for a home on rent? Filter by preferred locality, monthly budget, and BHK configuration to find verified rental matches:",
        sender: "bot",
        timestamp: new Date(),
        tenantFilterCard: {
          initialLocation: rexRequirements.locations?.[0] || "Baner",
          initialBhk: rexRequirements.unit_type || "2 BHK",
          initialBudget: "₹15k - ₹25k",
          initialFurnishing: "Any",
        },
        suggestions: ["Rent in Baner", "Rent in Wakad", "Rent in Hinjewadi", "1 BHK in Hinjewadi"],
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
      let browserCoords: { latitude: number; longitude: number } | null = userLocationCoords || null;
      if (
        !browserCoords &&
        (lower.includes("nearby") ||
          lower.includes("near me") ||
          lower.includes("around me") ||
          lower.includes("near location") ||
          lower.includes("closest") ||
          lower.includes("current location") ||
          lower.includes("explore nearby"))
      ) {
        if (typeof window !== "undefined" && navigator?.geolocation) {
          try {
            browserCoords = await new Promise((resolve) => {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                  setUserLocationCoords(coords);
                  resolve(coords);
                },
                () => resolve(null),
                { timeout: 8000, enableHighAccuracy: true, maximumAge: 300000 }
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
        persona: selectedPersona,
      });

      if (response.success) {
        if (response.session_uuid && response.session_uuid !== sessionUuid) {
          setSessionUuid(response.session_uuid);
          localStorage.setItem(REX_SESSION_STORAGE_KEY, response.session_uuid);
        }

        if (response.profile) setRexProfile(response.profile);
        if (response.requirements) setRexRequirements(response.requirements);

        if (response.intent === "tenant" || response.profile?.role === "tenant") {
          setSelectedPersona("tenant");
          localStorage.setItem(REX_PERSONA_KEY, "tenant");
        }

        const filteredSuggestions = (response.suggestions || []).filter((s) => {
          if (response.intent === "tenant" || response.profile?.role === "tenant" || selectedPersona === "tenant") {
            const low = s.toLowerCase();
            return !low.includes("site visit") && !low.includes("schedule") && !low.includes("resale") && !low.includes("valuation") && !low.includes("sell");
          }
          return true;
        });

        const botMsg: AIMessage = {
          id: `r_${Date.now()}`,
          text: response.reply,
          sender: "bot",
          timestamp: new Date(),
          suggestions: filteredSuggestions,
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
          tenantFilterCard: response.show_tenant_filter
            ? {
                initialLocation: response.requirements?.locations?.[0] || "Baner",
                initialBhk: response.requirements?.unit_type || "2 BHK",
                initialBudget: "₹15k - ₹25k",
                initialFurnishing: "Any",
              }
            : undefined,
          sellerWizardCard: (Boolean(response.show_seller_wizard) && isAuthenticated)
            ? {
                initialData: {
                  society_name: response.requirements?.society_name || "",
                  location_name: response.requirements?.locations?.[0] || "Punawale",
                  unit_type: response.requirements?.unit_type || "2 BHK",
                  carpet_area: response.requirements?.carpet_area ? String(response.requirements.carpet_area) : "",
                  expected_price: response.requirements?.budget_max ? `₹${response.requirements.budget_max}` : "",
                },
              }
            : undefined,
          ownerWizardCard: undefined,
          confirmedVisit: response.visit || undefined,
        };

        const isSellerIntentResponse = Boolean(response.show_seller_wizard);
        if (isSellerIntentResponse) {
          setSelectedPersona("seller");
          localStorage.setItem(REX_PERSONA_KEY, "seller");

          if (!isAuthenticated) {
            botMsg.sellerWizardCard = undefined;
            const cachedEmail = rexProfile?.email || inChatAuthData?.email || "";
            const cachedName = rexProfile?.name || (inChatAuthData?.first_name ? `${inChatAuthData.first_name} ${inChatAuthData.last_name || ""}`.trim() : "");
            const cachedPhone = rexProfile?.phone || inChatAuthData?.phone || "";

            if (cachedEmail || cachedPhone) {
              try {
                const statusRes = await rexApi.performAction({
                  action: "check_user_status",
                  payload: { email: cachedEmail, phone: cachedPhone },
                  session_uuid: sessionUuid || undefined,
                  guest_uuid: getGuestUuid(),
                });
                if (statusRes.is_registered) {
                  botMsg.suggestions = ["Login to Your Account", "Talk to Property Executive", "Explore Pune Resale Properties"];
                  setAiMessages((prev) => [...prev, botMsg]);
                  promptExistingUserLogin(cachedEmail || cachedPhone || "", statusRes.first_name, {
                    type: "seller_property",
                  });
                  return;
                }
              } catch (statusErr) {
                console.warn("Seller status check error:", statusErr);
              }
            }

            botMsg.inChatAuthForm = {
              initialName: cachedName,
              initialEmail: cachedEmail,
              initialPhone: cachedPhone,
              role: "seller",
              actionType: "seller_listing",
            };
            botMsg.suggestions = ["Login to Your Account", "Talk to Property Executive", "Explore Pune Resale Properties"];
          }
        }

        const isOwnerIntent = Boolean(
          response.show_owner_wizard ||
          (response as any).show_owner_registration
        );

        if (isOwnerIntent) {
          setSelectedPersona("owner");
          localStorage.setItem(REX_PERSONA_KEY, "owner");

          if (!isAuthenticated) {
            // STRICT GATE: NEVER open owner rental wizard for unregistered / unauthenticated user!
            const cachedEmail = rexProfile?.email || inChatAuthData?.email || "";
            const cachedName = rexProfile?.name || (inChatAuthData?.first_name ? `${inChatAuthData.first_name} ${inChatAuthData.last_name || ""}`.trim() : "");
            const cachedPhone = rexProfile?.phone || inChatAuthData?.phone || "";

            if (cachedEmail || cachedPhone) {
              try {
                const statusRes = await rexApi.performAction({
                  action: "check_user_status",
                  payload: { email: cachedEmail, phone: cachedPhone },
                  session_uuid: sessionUuid || undefined,
                  guest_uuid: getGuestUuid(),
                });
                if (statusRes.is_registered) {
                  botMsg.suggestions = ["Login to Your Account", "Talk to Sales Executive", "Explore Pune Rentals"];
                  setAiMessages((prev) => [...prev, botMsg]);
                  promptExistingUserLogin(cachedEmail || cachedPhone || "", statusRes.first_name, {
                    type: "owner_rental_wizard",
                  });
                  return;
                }
              } catch (statusErr) {
                console.warn("Owner status check error:", statusErr);
              }
            }

            // Prompt In-Chat Owner Registration / Login
            botMsg.inChatAuthForm = {
              initialName: cachedName,
              initialEmail: cachedEmail,
              initialPhone: cachedPhone,
              role: "owner",
              actionType: "owner_listing",
            };
            botMsg.suggestions = ["Login to Your Account", "Talk to Sales Executive", "Explore Pune Rentals"];
          } else {
            botMsg.ownerWizardCard = {};
          }
        }

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
      {/* Floating Launcher: avatar + greeting teaser */}
      {!(isMobile && isOpen) && (
        <div
          className={`fixed z-50 flex items-end gap-2 sm:gap-3 pointer-events-auto transition-all duration-300 right-3 sm:right-6 ${
            isPropertyDetail
              ? "bottom-[120px] sm:bottom-6"
              : "bottom-20 sm:bottom-6"
          }`}
        >
          {!isOpen && teaserReady && !teaserDismissed && (
            <div className="relative mb-2 animate-in fade-in slide-in-from-right-3 duration-300">
              <div className="group relative block max-w-[165px] sm:max-w-[240px] text-left bg-gradient-to-r from-[#0f2b3d] to-[#163e58] text-white text-[11px] sm:text-[13px] font-bold leading-snug rounded-2xl px-2.5 py-1.5 sm:px-3.5 sm:py-2.5 pr-6 sm:pr-7 shadow-[0_8px_25px_rgba(15,43,61,0.32)] transition-all">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(true);
                    setChatMode("rex_ai");
                  }}
                  className="text-left w-full cursor-pointer hover:opacity-90 pr-1"
                >
                  <span>Hello! 👋 I am REX here to help you.</span>
                </button>
                {/* Pointer tail pointing right to the avatar button */}
                <span className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rotate-45 rounded-[2px] bg-[#163e58] transition-colors pointer-events-none" />
              </div>
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => {
                if (isOpen) {
                  setIsOpen(false);
                  return;
                }
                setIsOpen(true);
                setChatMode("rex_ai");
              }}
              className="group relative flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white border border-slate-200 shadow-[0_8px_30px_rgba(15,43,61,0.28)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer overflow-hidden p-0.5"
              title={isOpen ? "Close chat" : "Chat with REX Real Estate Assistant"}
            >
              <img
                src={RexAvatar}
                alt="REX"
                className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-200"
              />
              {totalUnreadInquiries > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 bg-rose-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md border-2 border-white animate-in zoom-in-50 duration-200">
                  {totalUnreadInquiries}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Unified Chat Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          style={{ overscrollBehavior: "contain" }}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          className={`fixed z-50 flex flex-col bg-white shadow-[0_12px_40px_rgba(15,43,61,0.25)] border border-slate-200 transition-all duration-300 ease-in-out overflow-hidden ${
            isMobile
              ? "inset-0 w-full h-[100dvh] max-h-[100dvh] rounded-none border-0"
              : isExpanded
              ? "bottom-[96px] right-6 w-[560px] max-w-[calc(100vw-36px)] h-[660px] max-h-[calc(100vh-120px)] rounded-2xl"
              : "bottom-[96px] right-6 w-[365px] sm:w-[375px] h-[505px] max-h-[82vh] rounded-2xl"
          }`}
        >
          {/* Restart Confirmation Modal (SIA Inspired) */}
          {showRestartConfirm && (
            <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-[320px] text-center transform animate-in zoom-in-95 duration-200 border border-slate-100">
                <h3 className="text-[18px] font-bold text-slate-800 leading-snug mb-1.5">
                  Want to restart this conversation?
                </h3>
                <p className="text-[13.5px] text-slate-500 font-medium mb-6">
                  Let's make a fresh start.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetChat}
                    className="flex-1 py-2.5 px-5 rounded-xl bg-[#00d284] hover:bg-[#00be76] text-white font-bold text-[14px] transition-all active:scale-95 shadow-xs cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRestartConfirm(false)}
                    className="flex-1 py-2.5 px-5 rounded-xl bg-[#ff5666] hover:bg-[#eb4354] text-white font-bold text-[14px] transition-all active:scale-95 shadow-xs cursor-pointer"
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Resume Previous Chat or Start Fresh Prompt Modal */}
          {showResumePrompt && chatMode === "rex_ai" && !showRestartConfirm && (
            <div className="absolute inset-0 z-50 bg-black/45 backdrop-blur-[2.5px] flex items-center justify-center p-5 animate-in fade-in duration-200">
              <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-[325px] text-center transform animate-in zoom-in-95 duration-200 border border-slate-100 space-y-4">
                {/* Dismiss button (defaults to non-destructive continue) */}
                <button
                  type="button"
                  onClick={handleContinuePreviousChat}
                  className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Close and continue"
                >
                  <X size={16} />
                </button>

                {/* Avatar with pulse */}
                <div className="relative w-14 h-14 mx-auto rounded-full bg-slate-50 border-2 border-emerald-500/30 flex items-center justify-center p-0.5 shadow-sm">
                  <img
                    src={RexAvatar}
                    alt="REX AI"
                    className="w-full h-full rounded-full object-cover"
                  />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full ring-2 ring-emerald-100" />
                </div>

                <div>
                  <h3 className="text-[17px] font-bold text-slate-900 leading-snug">
                    {isAuthenticated && user?.first_name ? `Welcome back, ${user.first_name}!` : "Welcome back!"}
                  </h3>
                  <p className="text-[12.5px] text-slate-500 font-medium mt-1 leading-relaxed">
                    You have an existing conversation with REX. Would you like to continue with previous chat or start a fresh new chat?
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleContinuePreviousChat}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0f2b3d] hover:bg-[#163e58] text-white font-bold text-[13px] transition-all active:scale-95 shadow-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ArrowRight size={15} />
                    <span>Continue Previous Chat</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStartFreshChat}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-[13px] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-slate-200"
                  >
                    <RefreshCw size={14} className="text-slate-500" />
                    <span>Start Fresh New Chat</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="bg-[#0f2b3d] text-white px-3.5 h-[48px] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              {chatMode === "inquiries_list" ? (
                <div>
                  <h2 className="font-bold text-[14px] leading-tight">Property Conversations</h2>
                  <p className="text-[10px] text-white/70 font-medium">All Direct Inquiries</p>
                </div>
              ) : chatMode === "property_chat" ? (
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative w-8 h-8 rounded-full bg-white/15 border border-white/30 flex items-center justify-center shrink-0">
                    {activeConversation?.executive_avatar ? (
                      <img
                        src={activeConversation.executive_avatar}
                        alt="Executive"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-[12px]">
                        {activeExecutiveFirstName[0] ? activeExecutiveFirstName[0].toUpperCase() : "E"}
                      </span>
                    )}
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 border-2 border-[#0f2b3d] rounded-full" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-[13px] leading-tight truncate">
                      {activeExecutiveFirstName}
                    </h2>
                    <p className="text-[10px] text-emerald-300 font-medium leading-tight truncate">
                      {executiveTyping ? "typing..." : "Property Executive • Online"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="relative w-7 h-7 rounded-full overflow-hidden border border-white/30 shrink-0">
                    <img src={RexAvatar} alt="REX AI" className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 border border-[#0f2b3d] rounded-full" />
                  </div>
                  <div>
                    <h2 className="font-bold text-[14.5px] leading-tight tracking-wide">REX AI</h2>
                    <p className="text-[10px] text-white/70 font-medium leading-tight">
                      Real Estate Assistant • 24/7
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-0.5 shrink-0 text-white">
              {chatMode === "rex_ai" && (
                <button
                  onClick={() => setShowRestartConfirm(true)}
                  className="p-1.5 hover:bg-white/15 rounded-md transition-colors cursor-pointer"
                  title="Restart conversation"
                >
                  <RefreshCw size={16} />
                </button>
              )}

              {isAuthenticated && allConversations.length > 0 && chatMode !== "inquiries_list" && (
                <button
                  onClick={() => {
                    setChatMode("inquiries_list");
                    setPropertyDetailsVisible(false);
                    setPropertyVisitSchedulerVisible(false);
                  }}
                  className="relative p-1.5 hover:bg-white/15 rounded-md transition-colors cursor-pointer"
                  title="All Property Conversations"
                >
                  <MessageSquareText size={17} />
                  {totalUnreadInquiries > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-0.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-[#0f2b3d] animate-pulse">
                      {totalUnreadInquiries}
                    </span>
                  )}
                </button>
              )}

              {chatMode === "property_chat" && activeExecutivePhone && (
                <a
                  href={`tel:${activeExecutivePhone}`}
                  className="p-1.5 hover:bg-white/15 rounded-md transition-colors"
                  title="Call Executive"
                >
                  <Phone size={16} />
                </a>
              )}

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/15 rounded-md transition-colors cursor-pointer"
                title="Minimize"
              >
                <Minus size={16} />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:inline-flex p-1.5 hover:bg-white/15 rounded-md transition-colors cursor-pointer"
                title={isExpanded ? "Exit full screen" : "Full screen"}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/15 rounded-md transition-colors cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* MODE 1: PROPERTY INQUIRIES LIST DRAWER */}
              {chatMode === "inquiries_list" ? (
                <div className="flex-1 flex flex-col bg-white overflow-hidden">
                  <div className="p-3 border-b border-slate-100 bg-slate-50/70 shrink-0">
                    <div className="relative flex items-center">
                      <Search size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={inquirySearch}
                        onChange={(e) => setInquirySearch(e.target.value)}
                        placeholder="Search your property inquiries..."
                        style={{ color: "#0f172a", backgroundColor: "#ffffff" }}
                        className="w-full pl-9 pr-8 py-2 text-[13px] text-slate-900 placeholder:text-slate-400 font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0f2b3d] focus:border-[#0f2b3d]"
                      />
                      {inquirySearch && (
                        <button
                          type="button"
                          onClick={() => setInquirySearch("")}
                          className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="Clear search"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1">
                    {/* Top Shortcut to REX AI Assistant */}
                    <button
                      onClick={() => setChatMode("rex_ai")}
                      className="w-full p-3 flex items-center gap-3 bg-emerald-50/40 hover:bg-emerald-50 text-left rounded-xl transition-colors mb-1 border border-emerald-100 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-white border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                        <img src={RexAvatar} alt="REX AI" className="w-full h-full object-cover" />
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
                        {isSellerChat ? (
                          <>
                            {isPropertyPublic ? (
                              <span className="flex items-center gap-1 text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/90 px-2 py-0.5 rounded-md shadow-2xs">
                                <ShieldCheck size={11} className="text-emerald-600" />
                                <span>Public Listing</span>
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200/90 px-2 py-0.5 rounded-md shadow-2xs">
                                <ShieldCheck size={11} className="text-amber-600" />
                                <span>Listing Under Review</span>
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setPropertyDetailsVisible(!propertyDetailsVisible);
                                setPropertyVisitSchedulerVisible(false);
                              }}
                              className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs active:scale-95 ${
                                propertyDetailsVisible
                                  ? "bg-[#0f2b3d] text-white"
                                  : "bg-slate-200/90 hover:bg-slate-300 text-slate-800"
                              }`}
                            >
                              <Eye size={11} />
                              <span>{isPropertyPublic ? "VIEW" : "Details"}</span>
                            </button>
                          </>
                        ) : (
                          <>
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
                          </>
                        )}
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
                      {isSellerChat ? (
                        <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                          {isPropertyPublic ? (
                            <>
                              <div className="flex items-start gap-2 bg-emerald-50/90 border border-emerald-200/90 p-2.5 rounded-xl text-emerald-900 text-[11px] leading-relaxed">
                                <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                  <p className="font-bold text-emerald-950">Property is Live & Verified</p>
                                  <p className="text-emerald-800 mt-0.5">
                                    Your property is published and visible to all verified buyers.
                                  </p>
                                </div>
                              </div>
                              {activePropertyDetailUrl && (
                                <a
                                  href={activePropertyDetailUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-full py-2 px-3 bg-gradient-to-r from-[#e87722] to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-[11.5px] font-semibold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 text-center cursor-pointer active:scale-95"
                                >
                                  <span>View Public Property Page</span>
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </>
                          ) : (
                            <div className="flex items-start gap-2 bg-amber-50/90 border border-amber-200/90 p-2.5 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                              <ShieldCheck size={16} className="text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <p className="font-bold text-amber-950">Property Under Executive Verification</p>
                                <p className="text-amber-800 mt-0.5">
                                  Your listing is currently private. Your assigned Property Executive will complete verification and review before publishing it to verified buyers.
                                </p>
                              </div>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => setPropertyDetailsVisible(false)}
                            className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11.5px] font-semibold rounded-xl transition-all cursor-pointer"
                          >
                            Close Details
                          </button>
                        </div>
                      ) : (
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

                          {activePropertyDetailUrl ? (
                            <a
                              href={activePropertyDetailUrl}
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
                      )}
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
                                {activeExecutiveFirstName?.[0] || m.sender_first_name?.[0] || "E"}
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
                                  {activeExecutiveFirstName || m.sender_first_name || "Executive"}
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
                      style={{ color: "#0f172a" }}
                      className="flex-1 px-4 py-2 text-[13px] text-slate-900 focus:text-slate-900 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-slate-400 focus:bg-white placeholder:text-slate-400 font-medium transition-all"
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
                <div className="flex-1 flex flex-col min-h-0 relative bg-white">
                  <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3">
                    {aiMessages.map((m, mIdx) => {
                      const isUser = m.sender === "user";

                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}
                        >
                          {!isUser && (
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden shadow-2xs">
                              <img
                                src={RexAvatar}
                                alt="REX"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          <div className={`text-[13px] leading-relaxed ${isUser ? "max-w-[85%]" : "w-full"}`}>
                            {/* Text bubble (cards / chips render below it, outside the gray bubble) */}
                            <div
                              className={
                                isUser
                                  ? "bg-[#0f2b3d] text-white rounded-2xl rounded-br-md px-4 py-2.5 shadow-2xs"
                                  : m.isError
                                  ? "w-fit max-w-[92%] bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl rounded-tl-md px-4 py-3"
                                  : "w-fit max-w-[92%] bg-slate-100 text-slate-700 rounded-2xl rounded-tl-md px-4 py-3"
                              }
                            >
                              {isUser ? (
                                <p className="whitespace-pre-wrap">{m.text}</p>
                              ) : (
                                <FormattedChatMessage text={m.text} />
                              )}
                            </div>

                            {/* Inline In-Chat Auth / Registration Card */}
                            {m.inChatAuthForm && !isAuthenticated && (
                              <div className="mt-3 w-full">
                                <InlineInChatAuthCard
                                  title="Before moving forward, kindly provide your details below."
                                  initialName={m.inChatAuthForm.initialName}
                                  initialEmail={m.inChatAuthForm.initialEmail}
                                  initialPhone={m.inChatAuthForm.initialPhone}
                                  onSendOtp={(data) => handleInChatSendOtp(data, m.inChatAuthForm, m.id)}
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

                            {/* Tenant Multi-Criteria Interactive Filter */}
                            {m.tenantFilterCard && (
                              <div className="mt-3 w-full">
                                <REXTenantFilterCard
                                  initialLocation={m.tenantFilterCard.initialLocation}
                                  initialBhk={m.tenantFilterCard.initialBhk}
                                  initialBudget={m.tenantFilterCard.initialBudget}
                                  initialFurnishing={m.tenantFilterCard.initialFurnishing}
                                  disabled={m.tenantFilterCard.disabled}
                                  onSubmit={(filters) => handleTenantFilterSubmit(filters, m.id)}
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
                                <REXSellerConfirmedCard
                                  data={m.sellerConfirmedCard.data}
                                  executiveCard={m.sellerConfirmedCard.executiveCard}
                                  onChatWithExecutive={
                                    m.sellerConfirmedCard.executiveCard?.propertyId
                                      ? () => handleOpenPropertyConversation({ propertyId: Number(m.sellerConfirmedCard!.executiveCard!.propertyId!) })
                                      : undefined
                                  }
                                />
                              </div>
                            )}

                            {/* Owner Rental Property Listing Wizard */}
                            {m.ownerWizardCard && (
                              <div className="mt-3 w-full">
                                <REXOwnerRentalWizardCard
                                  disabled={m.ownerWizardCard.disabled}
                                  onSubmit={(data) => handleOwnerRentalSubmit(data, m.id)}
                                />
                              </div>
                            )}

                            {/* Owner Rental Confirmed Card */}
                            {m.ownerConfirmedCard && (
                              <div className="mt-3 w-full">
                                <REXOwnerRentalConfirmedCard {...m.ownerConfirmedCard} />
                              </div>
                            )}

                            {/* Account Already Exists Banner Card */}
                            {m.accountExistsCard && (
                              <div className="mt-3 w-full bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/30 rounded-2xl p-4 shadow-sm backdrop-blur-sm">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                                    <Lock className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                      Account Already Registered
                                    </h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                                      {m.accountExistsCard.message || `An account with ${m.accountExistsCard.email} already exists. Please login to continue forward directly.`}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-3.5 pt-3 border-t border-amber-500/20 flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigate(`/login?email=${encodeURIComponent(m.accountExistsCard?.email || "")}`);
                                    }}
                                    className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow hover:opacity-95 transition-all cursor-pointer"
                                  >
                                    <LogIn className="w-3.5 h-3.5" />
                                    Login to Your Account
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setInChatAuthData({});
                                      const retryMsg: AIMessage = {
                                        id: `retry_auth_${Date.now()}`,
                                        text: "Please enter your alternative email and phone number:",
                                        sender: "bot",
                                        timestamp: new Date(),
                                        inChatAuthForm: {
                                          role: selectedPersona || "tenant",
                                          actionType: "interested",
                                        },
                                      };
                                      setAiMessages((prev) => [...prev, retryMsg]);
                                    }}
                                    className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer"
                                  >
                                    Use different email
                                  </button>
                                </div>
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
                                      {m.scheduleLaterCard.executive?.name || "Dedicated Property Executive"}
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

                            {/* Seller Assigned Executive Contact Card */}
                            {m.sellerExecutiveCard && (
                              <div className="mt-3 w-full bg-gradient-to-br from-blue-50/90 via-white to-orange-50/80 border border-blue-200/80 rounded-2xl p-3 shadow-2xs space-y-2.5">
                                <div className="flex items-center justify-between pb-1.5 border-b border-blue-100">
                                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#0f2b3d]">
                                    <UserCheck size={14} className="text-[#e87722]" />
                                    <span>Assigned Property Executive</span>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Active Assigned
                                  </span>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-[#0f2b3d] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs ring-2 ring-orange-200">
                                    {m.sellerExecutiveCard.executiveName
                                      ? m.sellerExecutiveCard.executiveName.charAt(0).toUpperCase()
                                      : <UserIcon size={16} />}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-bold text-xs text-slate-900 truncate">
                                      {m.sellerExecutiveCard.executiveName}
                                    </h4>
                                    <p className="text-[10px] text-slate-500 font-medium truncate">
                                      {m.sellerExecutiveCard.executiveRole || "Dedicated Property Executive"}
                                    </p>
                                    {m.sellerExecutiveCard.propertyTitle && (
                                      <p className="text-[10px] text-orange-700 font-semibold truncate mt-0.5">
                                        Listing: {m.sellerExecutiveCard.propertyTitle}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="pt-1.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (m.sellerExecutiveCard?.propertyId) {
                                        handleOpenPropertyConversation({
                                          propertyId: Number(m.sellerExecutiveCard.propertyId),
                                          propertyTitle: m.sellerExecutiveCard.propertyTitle || "My Property Listing",
                                          propertySlug: m.sellerExecutiveCard.propertySlug || String(m.sellerExecutiveCard.propertyId),
                                          propertyPrice: Number(m.sellerExecutiveCard.propertyPrice || 0),
                                          initialMessage: `Hi ${m.sellerExecutiveCard.executiveFirstName || m.sellerExecutiveCard.executiveName}, I am reaching out regarding my property listing for ${m.sellerExecutiveCard.propertyTitle || "my property"}.`,
                                        });
                                      } else {
                                        navigate("/my-chats");
                                      }
                                    }}
                                    className="flex-1 py-2 px-3 bg-[#0f2b3d] hover:bg-[#163e58] text-white text-[11.5px] font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                                  >
                                    <MessageSquare size={13} />
                                    <span>Chat with {m.sellerExecutiveCard.executiveFirstName || "Executive"}</span>
                                  </button>

                                  {m.sellerExecutiveCard.executivePhone && (
                                    <a
                                      href={`tel:${m.sellerExecutiveCard.executivePhone}`}
                                      className="py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[11.5px] font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1 cursor-pointer shrink-0"
                                      title="Call Executive"
                                    >
                                      <Phone size={12} className="text-[#e87722]" />
                                      <span>Call</span>
                                    </a>
                                  )}

                                  {m.sellerExecutiveCard.executivePhone && (
                                    <a
                                      href={`https://wa.me/91${String(m.sellerExecutiveCard.executivePhone).replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
                                        `Hello ${m.sellerExecutiveCard.executiveFirstName || m.sellerExecutiveCard.executiveName}, I am contacting you regarding my property listing ${m.sellerExecutiveCard.propertyTitle || ""} on Resale Expert.`
                                      )}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[11.5px] font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1 cursor-pointer shrink-0"
                                      title="WhatsApp Executive"
                                    >
                                      <span>WhatsApp</span>
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Rental Property Verified Owner Contact Details Card */}
                            {m.rentalOwnerCard && (
                              <div className="mt-3 w-full bg-gradient-to-br from-teal-50/90 via-white to-emerald-50/80 border border-teal-200/90 rounded-2xl p-3 shadow-2xs space-y-2.5 text-left">
                                <div className="flex items-center justify-between pb-1.5 border-b border-teal-100">
                                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#0f2b3d]">
                                    <Home size={14} className="text-teal-700" />
                                    <span>Verified Property Owner Details</span>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                    <ShieldCheck size={11} className="text-emerald-600" />
                                    Verified Owner
                                  </span>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-teal-800 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs ring-2 ring-teal-200">
                                    {m.rentalOwnerCard.ownerName
                                      ? m.rentalOwnerCard.ownerName.charAt(0).toUpperCase()
                                      : <UserIcon size={16} />}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-bold text-xs text-slate-900 truncate">
                                      {m.rentalOwnerCard.ownerName}
                                    </h4>
                                    <p className="text-[10px] text-teal-800 font-semibold truncate">
                                      {m.rentalOwnerCard.propertyTitle}
                                    </p>
                                    {m.rentalOwnerCard.monthlyRent && (
                                      <p className="text-[10px] text-slate-600 font-medium truncate mt-0.5">
                                        Rent: <span className="font-bold text-[#0f2b3d]">₹{Number(m.rentalOwnerCard.monthlyRent).toLocaleString("en-IN")}/mo</span>
                                        {m.rentalOwnerCard.securityDeposit ? ` • Deposit: ₹${Number(m.rentalOwnerCard.securityDeposit).toLocaleString("en-IN")}` : ""}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div className="pt-1.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                                  {m.rentalOwnerCard.ownerPhone && (
                                    <a
                                      href={`tel:${m.rentalOwnerCard.ownerPhone}`}
                                      className="flex-1 py-2 px-3 bg-teal-800 hover:bg-teal-900 text-white text-[11.5px] font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
                                      title="Call Property Owner"
                                    >
                                      <Phone size={12} />
                                      <span>Call Owner ({m.rentalOwnerCard.ownerPhone})</span>
                                    </a>
                                  )}

                                  {m.rentalOwnerCard.ownerWhatsapp && (
                                    <a
                                      href={`https://wa.me/91${String(m.rentalOwnerCard.ownerWhatsapp).replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
                                        `Hello ${m.rentalOwnerCard.ownerName}, I saw your rental listing for ${m.rentalOwnerCard.propertyTitle} on Resale Expert and would like to know if it is available for rent.`
                                      )}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[11.5px] font-bold rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1 cursor-pointer shrink-0 active:scale-95"
                                      title="WhatsApp Owner"
                                    >
                                      <span>WhatsApp</span>
                                    </a>
                                  )}
                                </div>

                                {/* Tenant Dashboard Callout */}
                                <div className="mt-2 pt-2 border-t border-teal-100 flex flex-col gap-1.5 bg-teal-50/70 p-2.5 rounded-xl">
                                  <div className="flex items-center justify-between text-[11.5px] text-teal-950 font-bold">
                                    <span>Want more details & rental tools?</span>
                                    <span className="text-[9.5px] bg-teal-200/80 text-teal-900 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Tenant Dashboard</span>
                                  </div>
                                  <p className="text-[10.5px] text-slate-600 leading-tight">
                                    Visit your Tenant Dashboard for direct owner messaging, rental agreements, saved properties & inquiry management.
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsOpen(false);
                                      navigate("/dashboard/rental-properties");
                                    }}
                                    className="w-full py-1.5 px-3 bg-gradient-to-r from-teal-700 to-[#0f2b3d] hover:from-teal-800 hover:to-[#163e58] text-white text-[11px] font-bold rounded-lg transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                                  >
                                    <ExternalLink size={12} />
                                    <span>Open Tenant Dashboard</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* General Executive / Rental Desk Call & Call Request Action Buttons */}
                            {(m.executiveDeskCard ||
                              (!m.sellerExecutiveCard &&
                                !m.rentalOwnerCard &&
                                !m.visitScheduler &&
                                !m.confirmedVisit &&
                                (m.text.includes("Dedicated Rental Assistance Desk") ||
                                  m.text.includes("Dedicated Rental Desk") ||
                                  m.text.includes("Dedicated Buyer Advisory Desk") ||
                                  m.text.includes("Resale Expert Property Executive Team")))) && (
                              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2">
                                <a
                                  href={`tel:${m.executiveDeskCard?.phone || "+919637009639"}`}
                                  className="flex-1 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-lg transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 text-center whitespace-nowrap"
                                  title={`Call Desk Directly: ${m.executiveDeskCard?.displayPhone || "+91 9637 00 9639"}`}
                                >
                                  <Phone size={12} className="shrink-0" />
                                  <span>Call Desk</span>
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleOpenCallRequest(m.executiveDeskCard?.phone, m.executiveDeskCard?.deskName)}
                                  className="flex-1 py-1.5 px-2.5 bg-teal-800 hover:bg-teal-900 text-white text-[11px] font-semibold rounded-lg transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
                                  title="Request Executive Callback"
                                >
                                  <PhoneCall size={12} className="shrink-0" />
                                  <span>Call Request</span>
                                </button>
                              </div>
                            )}

                            {/* Inline 3-Step Call Request Wizard */}
                            {m.callRequestCard && (
                              <div className="mt-3 w-full">
                                <REXCallRequestCard
                                  initialPhone={m.callRequestCard.initialPhone}
                                  initialName={m.callRequestCard.initialName}
                                  persona={m.callRequestCard.persona}
                                  disabled={m.callRequestCard.disabled}
                                  onSubmit={(data) => handleSubmitCallRequest(data, m.id)}
                                  onCancel={() => handleCancelCallRequest(m.id)}
                                />
                              </div>
                            )}

                            {/* Suggestion chips: outlined pills, 2-column grid */}
                            {m.suggestions && m.suggestions.length > 0 && (() => {
                              const hasUserRepliedAfter = aiMessages.slice(mIdx + 1).some((nextMsg) => nextMsg.sender === "user");
                              const isSuggestionsDisabled = hasUserRepliedAfter || isSending || isAiTyping;

                              return (
                                <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                                  {m.suggestions
                                    .filter((sug) => {
                                      if (m.id === "initial_welcome") return true;
                                      const low = sug.toLowerCase();
                                      if (selectedPersona === "seller") {
                                        return (
                                          !low.includes("rent in") &&
                                          !low.includes("rental") &&
                                          !low.includes("tenant") &&
                                          !low.includes("site visit") &&
                                          !low.includes("book visit") &&
                                          !low.includes("schedule visit") &&
                                          !low.includes("explore 2 bhk") &&
                                          !low.includes("properties under") &&
                                          !low.includes("find ") &&
                                          !low.includes("buy flat") &&
                                          !low.includes("buy property")
                                        );
                                      }
                                      if (selectedPersona === "owner") {
                                        return (
                                          !low.includes("site visit") &&
                                          !low.includes("book visit") &&
                                          !low.includes("schedule visit") &&
                                          !low.includes("resale") &&
                                          !low.includes("buy ") &&
                                          !low.includes("buyer") &&
                                          !low.includes("properties under") &&
                                          !low.includes("find ")
                                        );
                                      }
                                      if (selectedPersona === "tenant") {
                                        return (
                                          !low.includes("site visit") &&
                                          !low.includes("schedule") &&
                                          !low.includes("resale") &&
                                          !low.includes("valuation") &&
                                          !low.includes("sell") &&
                                          !low.includes("buyer")
                                        );
                                      }
                                      if (selectedPersona === "buyer") {
                                        return (
                                          !low.includes("rent in") &&
                                          !low.includes("rental") &&
                                          !low.includes("tenant") &&
                                          !low.includes("list property") &&
                                          !low.includes("sell property")
                                        );
                                      }
                                      return true;
                                    })
                                    .map((sug, i) => (
                                      <button
                                        key={i}
                                        type="button"
                                        disabled={isSuggestionsDisabled}
                                        onClick={() => {
                                          if (!isSuggestionsDisabled) {
                                            handleSendMessage(sug);
                                          }
                                        }}
                                        className={`px-3 py-2 text-[12px] leading-snug font-bold text-center rounded-xl border transition-all break-words [&:last-child:nth-child(odd)]:col-span-2 ${
                                          isSuggestionsDisabled
                                            ? "border-[#0f2b3d] text-slate-400 bg-[#edf1f5] cursor-not-allowed pointer-events-none shadow-none"
                                            : "border-[#0f2b3d] text-[#0f2b3d] bg-white hover:bg-[#0f2b3d] hover:text-white active:scale-95 cursor-pointer shadow-2xs"
                                        }`}
                                      >
                                        {cleanDisplayText(sug)}
                                      </button>
                                    ))}
                                </div>
                              );
                            })()}

                            {/* Message Timestamp (below the bubble) */}
                            <div
                              className={`flex items-center gap-1 mt-1 text-[10px] text-slate-400 ${
                                isUser ? "justify-end" : "justify-start"
                              }`}
                            >
                              <span>
                                {new Date(m.timestamp).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {isUser && <CheckCheck size={12} className="text-emerald-500 inline" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {isAiTyping && (
                      <div className="flex flex-col items-start gap-1 animate-fadeIn">
                        <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden shadow-2xs">
                          <img src={RexAvatar} alt="REX" className="w-full h-full object-cover" />
                        </div>
                        <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-3.5 py-2 flex items-center gap-1.5 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                        </div>
                      </div>
                    )}

                    <div ref={aiMessagesEndRef} />
                  </div>

                  {/* Footer: powered-by line + input row */}
                  <div className="shrink-0 bg-white">
                    <p className="text-center text-[10px] text-slate-400 pb-1">
                      Powered by <span className="font-semibold text-slate-500">Resale Expert</span>
                    </p>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                      className="px-2.5 py-2 border-t border-slate-200 flex flex-col gap-1"
                    >
                      {inChatAuthStage === "asking_phone" && (
                        <div className="flex justify-between items-center px-1.5 text-[10px] text-slate-500 font-medium">
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

                      <div className="flex items-center gap-2 w-full">
                        <span className="w-7 h-7 rounded-full bg-[#0f2b3d] text-white flex items-center justify-center shrink-0">
                          <MessageSquare size={13} />
                        </span>

                        <input
                          ref={inputRef}
                          type={inChatAuthStage === "asking_phone" ? "tel" : "text"}
                          maxLength={inChatAuthStage === "asking_phone" ? 10 : undefined}
                          inputMode={inChatAuthStage === "asking_phone" ? "numeric" : undefined}
                          value={inputText}
                          onChange={(e) => handleTypingChange(e.target.value)}
                          disabled={inChatAuthStage === "verifying_otp"}
                          placeholder={inputPlaceholderText}
                          style={{ color: "#0f172a" }}
                          className="flex-1 min-w-0 px-2 py-1.5 text-[13px] text-slate-900 focus:text-slate-900 bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-slate-400 font-medium disabled:opacity-50"
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
                          className="w-8 h-8 rounded-full bg-[#0f2b3d] hover:bg-[#163e58] disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center transition-all shrink-0 active:scale-95 cursor-pointer"
                          title={
                            inChatAuthStage === "asking_phone" && inputText.length !== 10
                              ? "Please enter all 10 digits"
                              : "Send"
                          }
                        >
                          {isSending || isAiTyping ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Send size={13} />
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
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