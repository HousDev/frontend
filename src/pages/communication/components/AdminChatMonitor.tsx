// frontend/src/pages/communication/components/AdminChatMonitor.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { connectSocket, getSocket } from "@/lib/socket";
import {
  chatApi,
  generateUUID,
  PropertyConversation,
  PropertyChatMessage,
} from "@/services/chatApi";
import { ChatConversationList } from "./ChatConversationList";
import { ChatConversationView } from "./ChatConversationView";
import { ChatContextPanel } from "./ChatContextPanel";
import { playNotificationSound } from "@/utils/notificationSound";

export const AdminChatMonitor: React.FC = () => {
  const { user } = useAuth();
  const currentUserId = user ? Number(user.id) : 0;
  const currentUserRole = user ? String(user.role || "").toLowerCase() : "admin";

  const [conversations, setConversations] = useState<PropertyConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<PropertyConversation | null>(null);
  const [messages, setMessages] = useState<PropertyChatMessage[]>([]);
  const [executives, setExecutives] = useState<any[]>([]);
  const [selectedExecutiveFilter, setSelectedExecutiveFilter] = useState("all");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "unread" | "active" | "closed" | "archived">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [socketConnected, setSocketConnected] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [locationsCollapsed, setLocationsCollapsed] = useState<boolean>(false);
  const [propertiesCollapsed, setPropertiesCollapsed] = useState<boolean>(false);
  const [usersCollapsed, setUsersCollapsed] = useState<boolean>(false);

  const selectedConvRef = useRef<PropertyConversation | null>(null);
  selectedConvRef.current = selectedConversation;

  // Rollup Locations Summary for empty state
  const locationsSummary = useMemo(() => {
    const locMap = new Map<string, { properties: Set<number>; inquiries: number; unread: number }>();
    for (const c of conversations) {
      const loc = (c.property_location || c.property_city || "Other Locations").trim();
      const unread = (c.unread_executive_count || 0) + (c.unread_user_count || 0);
      const pid = c.property_id || 0;

      if (!locMap.has(loc)) {
        locMap.set(loc, { properties: new Set(), inquiries: 0, unread: 0 });
      }
      const existing = locMap.get(loc)!;
      existing.properties.add(pid);
      existing.inquiries += 1;
      existing.unread += unread;
    }

    const list = Array.from(locMap.entries()).map(([name, data]) => ({
      locationName: name,
      totalProperties: data.properties.size,
      totalInquiries: data.inquiries,
      totalUnread: data.unread,
    }));

    return list.sort((a, b) => b.totalUnread - a.totalUnread || b.totalInquiries - a.totalInquiries);
  }, [conversations]);

  // Rollup Properties for empty state
  const propertiesList = useMemo(() => {
    const propMap = new Map<number, any>();
    for (const c of conversations) {
      const loc = (c.property_location || c.property_city || "Other Locations").trim();
      if (selectedLocation && selectedLocation !== "all" && loc !== selectedLocation) {
        continue;
      }

      const pid = c.property_id || 0;
      const unread = (c.unread_executive_count || 0) + (c.unread_user_count || 0);

      if (!propMap.has(pid)) {
        propMap.set(pid, {
          propertyId: pid,
          propertyTitle: c.property_title || "Residential Property",
          propertyLocation: loc,
          propertyPrice: c.property_price,
          propertyPhotos: c.property_photos,
          totalInquiries: 0,
          totalUnread: 0,
        });
      }

      const item = propMap.get(pid)!;
      item.totalInquiries += 1;
      item.totalUnread += unread;
    }

    return Array.from(propMap.values()).sort((a, b) => b.totalUnread - a.totalUnread || b.totalInquiries - a.totalInquiries);
  }, [conversations, selectedLocation]);

  // Rollup User Conversations for empty state
  const userConversationsList = useMemo(() => {
    return conversations.filter((c) => {
      if (selectedLocation && selectedLocation !== "all") {
        const loc = (c.property_location || c.property_city || "Other Locations").trim();
        if (loc !== selectedLocation) return false;
      }
      if (selectedPropertyId && Number(c.property_id) !== Number(selectedPropertyId)) {
        return false;
      }
      return true;
    });
  }, [conversations, selectedLocation, selectedPropertyId]);

  // 1. Fetch Conversations & Available Executives
  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const [convRes, execRes] = await Promise.all([
        chatApi.getConversations({
          status: filterTab !== "all" && filterTab !== "unread" ? filterTab : undefined,
          executive_id: selectedExecutiveFilter !== "all" ? selectedExecutiveFilter : undefined,
        }),
        chatApi.getAvailableExecutives(),
      ]);

      if (convRes.success && Array.isArray(convRes.conversations)) {
        setConversations(convRes.conversations);

        if (selectedConvRef.current) {
          const updated = convRes.conversations.find((c) => c.id === selectedConvRef.current?.id);
          if (updated) setSelectedConversation(updated);
        }
      }

      if (Array.isArray(execRes)) {
        setExecutives(execRes);
      }
    } catch (err) {
      console.error("Failed to load admin conversations monitor:", err);
    } finally {
      setLoadingConversations(false);
    }
  }, [filterTab, selectedExecutiveFilter]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 2. Select Conversation
  const selectConversation = useCallback(
    async (conv: PropertyConversation) => {
      const prevConv = selectedConvRef.current;
      const socket = getSocket();

      if (prevConv && prevConv.id !== conv.id && socket) {
        socket.emit("chat:leave_room", { conversationId: prevConv.id });
      }

      const loc = (conv.property_location || conv.property_city || "Other Locations").trim();
      setSelectedLocation(loc);
      setSelectedPropertyId(conv.property_id || null);

      setSelectedConversation(conv);
      setMobileView("chat");
      setLoadingMessages(true);

      try {
        if (socket) {
          socket.emit("chat:join_room", { conversationId: conv.id });
        }

        const res = await chatApi.getMessages(conv.id);
        if (res.success) {
          setMessages(res.messages || []);
        }

        // Mark as read for admin view
        if ((conv.unread_executive_count || 0) > 0 || (conv.unread_user_count || 0) > 0) {
          await chatApi.markAsRead(conv.id);
          setConversations((prev) =>
            prev.map((c) =>
              c.id === conv.id
                ? { ...c, unread_executive_count: 0, unread_user_count: 0 }
                : c
            )
          );
        }
      } catch (err) {
        console.error("Failed to load conversation messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    },
    []
  );

  // 3. Socket.IO Real-Time Subscriptions
  useEffect(() => {
    if (!currentUserId) return;
    const socket = connectSocket(currentUserId);
    if (!socket) return;

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    const handleNewMessage = (msg: PropertyChatMessage) => {
      playNotificationSound();
      const activeConv = selectedConvRef.current;

      if (activeConv && Number(activeConv.id) === Number(msg.conversation_id)) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id || m.message_uuid === msg.message_uuid)) {
            return prev;
          }
          return [...prev, msg];
        });
      }

      setConversations((prev) => {
        const index = prev.findIndex((c) => Number(c.id) === Number(msg.conversation_id));
        if (index === -1) {
          fetchConversations();
          return prev;
        }

        const convToUpdate = { ...prev[index] };
        convToUpdate.last_message_text = msg.message_text;
        convToUpdate.last_message_at = msg.created_at;

        const withoutUpdated = prev.filter((c) => Number(c.id) !== Number(msg.conversation_id));
        return [convToUpdate, ...withoutUpdated];
      });
    };

    const handleReassigned = (data: { conversationId: number; newExecutiveId: number; executiveName?: string }) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (Number(c.id) === Number(data.conversationId)) {
            return {
              ...c,
              executive_id: data.newExecutiveId,
              executive_first_name: data.executiveName || c.executive_first_name,
            };
          }
          return c;
        })
      );

      if (selectedConvRef.current && Number(selectedConvRef.current.id) === Number(data.conversationId)) {
        setSelectedConversation((prev) =>
          prev
            ? {
                ...prev,
                executive_id: data.newExecutiveId,
                executive_first_name: data.executiveName || prev.executive_first_name,
              }
            : null
        );
      }
    };

    // Live message delivery status
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

    // Live read receipts
    const handleMessagesRead = (data: { conversationId: number; readBy: number }) => {
      const activeConv = selectedConvRef.current;
      if (activeConv && Number(activeConv.id) === Number(data.conversationId)) {
        setMessages((prev) =>
          prev.map((m) => (m.sender_type !== "user" ? { ...m, is_read: 1, is_delivered: 1 } : m))
        );
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("chat:new_message", handleNewMessage);
    socket.on("chat:message_delivered", handleMessageDelivered);
    socket.on("chat:messages_read", handleMessagesRead);
    socket.on("conversation:reassigned", handleReassigned);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("chat:new_message", handleNewMessage);
      socket.off("chat:message_delivered", handleMessageDelivered);
      socket.off("chat:messages_read", handleMessagesRead);
      socket.off("conversation:reassigned", handleReassigned);
    };
  }, [currentUserId, fetchConversations]);

  // 4. Send Administrative Message
  const handleSendMessage = async (text: string) => {
    if (!selectedConversation) return;

    const messageUuid = generateUUID();
    const res = await chatApi.sendMessage(selectedConversation.id, {
      message_text: text,
      message_type: "text",
      message_uuid: messageUuid,
    });

    if (res.success && res.message) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.message.id || m.message_uuid === res.message.message_uuid)) {
          return prev;
        }
        return [...prev, res.message];
      });

      setConversations((prev) => {
        const withoutUpdated = prev.filter((c) => c.id !== selectedConversation.id);
        const updatedConv = {
          ...selectedConversation,
          last_message_text: text,
          last_message_at: res.message.created_at,
        };
        return [updatedConv, ...withoutUpdated];
      });
    }
  };

  const handleSendMedia = async (file: File, caption?: string) => {
    if (!selectedConversation) return;
    const messageUuid = generateUUID();
    try {
      const res = await chatApi.sendMedia(selectedConversation.id, file, caption, messageUuid);
      if (res.success && res.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === res.message.id || m.message_uuid === messageUuid)) {
            return prev;
          }
          return [...prev, res.message];
        });

        setConversations((prev) => {
          const withoutUpdated = prev.filter((c) => c.id !== selectedConversation.id);
          const updatedConv = {
            ...selectedConversation,
            last_message_text: caption || (file.type.startsWith("image/") ? "📷 Photo" : file.type.startsWith("video/") ? "🎥 Video" : `📎 ${file.name}`),
            last_message_at: res.message.created_at,
          };
          return [updatedConv, ...withoutUpdated];
        });
      }
    } catch (err) {
      console.error("Failed to send admin media:", err);
    }
  };

  // 5. Executive Reassignment Handler
  const handleReassign = async (newExecutiveId: number) => {
    if (!selectedConversation) return;

    const res = await chatApi.reassignExecutive(selectedConversation.id, newExecutiveId);
    if (res.success && res.conversation) {
      setSelectedConversation(res.conversation);
      setConversations((prev) =>
        prev.map((c) => (c.id === res.conversation.id ? res.conversation : c))
      );

      // Refresh messages to display the system reassignment timeline chip
      const msgRes = await chatApi.getMessages(selectedConversation.id);
      if (msgRes.success) {
        setMessages(msgRes.messages || []);
      }
    }
  };

  const handleSelectLocationFromEmptyState = (locName: string) => {
    setSelectedLocation(locName);
    setSelectedPropertyId(null);
    setLocationsCollapsed(true);
    setPropertiesCollapsed(false);
  };

  const handleSelectPropertyFromEmptyState = (pid: number | null) => {
    setSelectedPropertyId(pid);
    setPropertiesCollapsed(true);
    setUsersCollapsed(false);
  };

  return (
    <div className="flex flex-1 h-full w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm min-h-0">
      {/* Sections 1, 2 & 3: Locations + Properties + Client Inquiries */}
      <div
        className={`w-full md:w-auto flex-shrink-0 h-full ${
          mobileView === "chat" ? "hidden md:flex" : "flex"
        }`}
      >
        <ChatConversationList
          conversations={conversations}
          selectedId={selectedConversation?.id || null}
          onSelect={selectConversation}
          loading={loadingConversations}
          filterTab={filterTab}
          setFilterTab={setFilterTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isAdmin={true}
          executives={executives}
          selectedExecutiveFilter={selectedExecutiveFilter}
          setSelectedExecutiveFilter={setSelectedExecutiveFilter}
          socketConnected={socketConnected}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          selectedPropertyId={selectedPropertyId}
          setSelectedPropertyId={setSelectedPropertyId}
          locationsCollapsed={locationsCollapsed}
          setLocationsCollapsed={setLocationsCollapsed}
          propertiesCollapsed={propertiesCollapsed}
          setPropertiesCollapsed={setPropertiesCollapsed}
          usersCollapsed={usersCollapsed}
          setUsersCollapsed={setUsersCollapsed}
        />
      </div>

      {/* Column 2: Chat Transcript (Admin Monitor) */}
      <div
        className={`flex-1 flex flex-col h-full ${
          mobileView === "list" ? "hidden md:flex" : "flex"
        }`}
      >
        <ChatConversationView
          conversation={selectedConversation}
          messages={messages}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          onSendMessage={handleSendMessage}
          onSendMedia={handleSendMedia}
          loadingMessages={loadingMessages}
          onToggleContext={() => setShowContext(!showContext)}
          showContext={showContext}
          onBackToList={() => setMobileView("list")}
          isAdmin={true}
          onReassignClick={() => setShowContext(true)}
          selectedLocation={selectedLocation}
          selectedPropertyId={selectedPropertyId}
          locationsSummary={locationsSummary}
          propertiesList={propertiesList}
          userConversationsList={userConversationsList}
          onSelectLocation={handleSelectLocationFromEmptyState}
          onSelectProperty={handleSelectPropertyFromEmptyState}
          onSelectConversation={selectConversation}
        />
      </div>

      {/* Property & Customer Context Modal Popup (with Reassignment Control) */}
      {showContext && selectedConversation && (
        <ChatContextPanel
          conversation={selectedConversation}
          onClose={() => setShowContext(false)}
          isAdmin={true}
          executives={executives}
          onReassign={handleReassign}
        />
      )}
    </div>
  );
};
