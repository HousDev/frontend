import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  ExternalLink,
  MessageSquare,
  Bed,
  Bath,
  Maximize,
  Sparkles,
  Loader2,
} from "lucide-react";
import { RexPropertyCardData } from "@/services/rexApi";
import { chatApi } from "@/services/chatApi";
import { useAuth } from "@/contexts/AuthContext";

interface REXPropertyCardProps {
  property: RexPropertyCardData;
  onRequireAuth?: (property: RexPropertyCardData) => void;
  onExecutiveChatStarted?: (conversationId: number) => void;
}

const DEFAULT_PROPERTY_IMAGE =
  "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800";

const formatPrice = (amount: number | string) => {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return "Price on Request";

  const CRORE = 10_000_000;
  const LAKH = 100_000;

  if (n >= CRORE) {
    const cr = n / CRORE;
    return `₹${parseFloat(cr.toFixed(2))} Cr`;
  }
  if (n >= LAKH) {
    const l = n / LAKH;
    return `₹${parseFloat(l.toFixed(0))} Lakh`;
  }
  return `₹${n.toLocaleString("en-IN")}`;
};

export const REXPropertyCard: React.FC<REXPropertyCardProps> = ({
  property,
  onRequireAuth,
  onExecutiveChatStarted,
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isInitiatingChat, setIsInitiatingChat] = useState(false);
  const [imgError, setImgError] = useState(false);

  const mainPhoto =
    !imgError && Array.isArray(property.photos) && property.photos.length > 0 && property.photos[0]
      ? property.photos[0]
      : DEFAULT_PROPERTY_IMAGE;

  const handleViewProperty = () => {
    const targetSlug = property.slug || String(property.id);
    navigate(`/properties/${encodeURIComponent(targetSlug)}`);
  };

  const handleChatWithExecutive = async () => {
    if (!isAuthenticated || !user) {
      const targetSlug = property.slug || String(property.id);
      try {
        sessionStorage.setItem(
          "pending_executive_chat",
          JSON.stringify({
            property_id: property.id,
            slug: targetSlug,
            title: property.title,
          })
        );
      } catch {}

      if (onRequireAuth) {
        onRequireAuth(property);
      } else {
        navigate(`/login?redirect=/properties/${encodeURIComponent(targetSlug)}`);
      }
      return;
    }

    try {
      setIsInitiatingChat(true);
      const initialMessage = `Hi, I found "${property.title || 'this property'}" (Ref #${property.id}) via REX AI and would like to speak with the assigned executive.`;

      const response = await chatApi.createOrGetConversation({
        property_id: property.id,
        initial_message: initialMessage,
      });

      if (response.success && response.conversation) {
        if (onExecutiveChatStarted) {
          onExecutiveChatStarted(response.conversation.id);
        }
        const role = String((user as any)?.role || "").toLowerCase();
        const isStaff = ["admin", "super_admin", "executive", "agent", "manager"].includes(role);
        if (isStaff) {
          navigate("/dashboard/communication");
        } else {
          navigate(`/my-chats?conversationId=${response.conversation.id}`);
        }
      }
    } catch (err: any) {
      console.error("Failed to start executive conversation:", err);
      // Fallback navigation to property page if desk routing is restricted
      navigate(`/properties/${encodeURIComponent(property.slug || String(property.id))}`);
    } finally {
      setIsInitiatingChat(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col my-2">
      {/* Property Thumbnail & Tags */}
      <div className="relative w-full h-32 bg-gray-100 overflow-hidden">
        <img
          src={mainPhoto}
          alt={property.title || "Property"}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Price Tag */}
        <div className="absolute bottom-2 left-2.5">
          <span className="text-white font-bold text-sm sm:text-base drop-shadow-md">
            {formatPrice(property.price)}
          </span>
        </div>

        {/* Premium or Type Badge */}
        <div className="absolute top-2 right-2 flex gap-1">
          {property.is_premium && (
            <span className="bg-amber-500/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
              <Sparkles size={10} /> Premium
            </span>
          )}
          {property.unit_type && (
            <span className="bg-[#0b3856]/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
              {property.unit_type}
            </span>
          )}
        </div>
      </div>

      {/* Property Details */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-semibold text-gray-900 text-xs sm:text-sm line-clamp-1 mb-1" title={property.title}>
            {property.title}
          </h4>

          <div className="flex items-center text-gray-500 text-[11px] mb-2.5">
            <MapPin size={12} className="shrink-0 mr-1 text-[#E6761D]" />
            <span className="truncate">
              {[property.location, property.city].filter(Boolean).join(", ") || "Pune"}
            </span>
          </div>

          {/* Configuration Chips */}
          <div className="flex items-center gap-2 text-[10px] text-gray-600 mb-3 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
            {property.bedrooms ? (
              <span className="flex items-center gap-1 font-medium">
                <Bed size={12} className="text-gray-400" /> {property.bedrooms} Beds
              </span>
            ) : null}
            {property.bathrooms ? (
              <span className="flex items-center gap-1 font-medium">
                <Bath size={12} className="text-gray-400" /> {property.bathrooms} Baths
              </span>
            ) : null}
            {property.carpet_area ? (
              <span className="flex items-center gap-1 font-medium truncate">
                <Maximize size={12} className="text-gray-400" /> {property.carpet_area} sq ft
              </span>
            ) : null}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
          <button
            type="button"
            onClick={handleViewProperty}
            className="flex items-center justify-center gap-1 py-1.5 px-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg text-xs font-medium transition-colors"
          >
            <ExternalLink size={12} />
            <span>View Property</span>
          </button>

          <button
            type="button"
            onClick={handleChatWithExecutive}
            disabled={isInitiatingChat}
            className="flex items-center justify-center gap-1 py-1.5 px-2 bg-[#E6761D] hover:bg-[#d56a17] text-white rounded-lg text-xs font-semibold shadow-xs hover:shadow transition-all disabled:opacity-50"
          >
            {isInitiatingChat ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <MessageSquare size={12} />
            )}
            <span>Chat Executive</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default REXPropertyCard;
