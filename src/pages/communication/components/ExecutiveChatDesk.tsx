// frontend/src/pages/communication/components/ExecutiveChatDesk.tsx
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

export const ExecutiveChatDesk: React.FC = () => {
  const { user } = useAuth();
  const currentUserId = user ? Number(user.id) : 0;
  const currentUserRole = user ? String(user.role || "").toLowerCase() : "executive";

  const [conversations, setConversations] = useState<PropertyConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<PropertyConversation | null>(null);
  const [messages, setMessages] = useState<PropertyChatMessage[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "unread" | "active" | "closed" | "archived">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [socketConnected, setSocketConnected] = useState(true);

  const [isCustomerTyping, setIsCustomerTyping] = useState(false);
  const [customerPresence, setCustomerPresence] = useState<{
    status: "online" | "offline";
    lastSeen: string | null;
  }>({ status: "offline", lastSeen: null });

  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const [locationsCollapsed, setLocationsCollapsed] = useState<boolean>(false);
  const [propertiesCollapsed, setPropertiesCollapsed] = useState<boolean>(false);
  const [usersCollapsed, setUsersCollapsed] = useState<boolean>(false);

  const selectedConvRef = useRef<PropertyConversation | null>(null);
  selectedConvRef.current = selectedConversation;
  const remoteTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Rollup Locations Summary for empty state
  const locationsSummary = useMemo(() => {
    const locMap = new Map<string, { properties: Set<number>; inquiries: number; unread: number }>();
    for (const c of conversations) {
      const loc = (c.property_location || c.property_city || "Other Locations").trim();
      const unread = c.unread_executive_count || 0;
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
      const unread = c.unread_executive_count || 0;

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

  // 1. Fetch Conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const res = await chatApi.getConversations();
      if (res.success && Array.isArray(res.conversations)) {
        setConversations(res.conversations);

        const convList = res.conversations || [];
        setConversations(
          convList.map((c) =>
            selectedConvRef.current && Number(c.id) === Number(selectedConvRef.current.id)
              ? { ...c, unread_executive_count: 0 }
              : c
          )
        );
        if (selectedConvRef.current) {
          const updated = convList.find((c) => Number(c.id) === Number(selectedConvRef.current?.id));
          if (updated) setSelectedConversation({ ...updated, unread_executive_count: 0 });
        }
      }
    } catch (err) {
      console.error("Failed to load executive conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 2. Fetch Messages when Conversation is selected
  const selectConversation = useCallback(
    async (conv: PropertyConversation) => {
      const prevConv = selectedConvRef.current;
      const socket = getSocket();

      setIsCustomerTyping(false);
      if (remoteTypingTimeoutRef.current) clearTimeout(remoteTypingTimeoutRef.current);

      const loc = (conv.property_location || conv.property_city || "Other Locations").trim();
      setSelectedLocation(loc);
      setSelectedPropertyId(conv.property_id || null);

      // Leave previous socket room if any
      if (prevConv && prevConv.id !== conv.id && socket) {
        socket.emit("chat:leave_room", { conversationId: prevConv.id });
        socket.emit("chat:typing_stop", { conversationId: prevConv.id });
      }

      // Immediately zero unread in state
      setSelectedConversation({ ...conv, unread_executive_count: 0 });
      setConversations((prev) =>
        prev.map((c) => (Number(c.id) === Number(conv.id) ? { ...c, unread_executive_count: 0 } : c))
      );
      setMobileView("chat");
      setLoadingMessages(true);

      try {
        // Join new conversation room & acknowledge read
        if (socket) {
          socket.emit("chat:join_room", { conversationId: conv.id });
          socket.emit("chat:read_receipt", { conversationId: conv.id });
          if (conv.user_id) {
            socket.emit("user:get_presence", { userIds: [conv.user_id] });
          }
        }

        // Fetch messages
        const res = await chatApi.getMessages(conv.id);
        if (res.success) {
          setMessages(res.messages || []);

          // Acknowledge delivery for incoming user messages
          if (socket && Array.isArray(res.messages)) {
            res.messages.forEach((m) => {
              if (m.sender_type === "user" && !m.is_delivered) {
                socket.emit("chat:message_delivered", {
                  conversationId: conv.id,
                  messageId: m.id,
                  messageUuid: m.message_uuid,
                });
              }
            });
          }
        }

        // Mark as read in backend
        await chatApi.markAsRead(conv.id).catch(() => {});
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    },
    []
  );

  // 3. Socket.IO Real-time Subscriptions
  useEffect(() => {
    if (!currentUserId) return;
    const socket = connectSocket(currentUserId);
    if (!socket) return;

    const handleConnect = () => {
      setSocketConnected(true);
      const activeConv = selectedConvRef.current;
      if (activeConv) {
        socket.emit("chat:join_room", { conversationId: activeConv.id });
        socket.emit("chat:read_receipt", { conversationId: activeConv.id });
        if (activeConv.user_id) {
          socket.emit("user:get_presence", { userIds: [activeConv.user_id] });
        }
      }
    };

    const handleDisconnect = () => setSocketConnected(false);

    const handleNewMessage = (msg: PropertyChatMessage) => {
      const activeConv = selectedConvRef.current;

      if (msg.sender_type === "user") {
        playNotificationSound();
      }

      if (activeConv && Number(activeConv.id) === Number(msg.conversation_id)) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id || m.message_uuid === msg.message_uuid)) {
            return prev;
          }
          return [...prev, msg];
        });

        if (msg.sender_type === "user") {
          socket.emit("chat:read_receipt", { conversationId: activeConv.id });
          chatApi.markAsRead(activeConv.id).catch(() => {});
        }
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

        if (msg.sender_type === "user") {
          if (!activeConv || Number(activeConv.id) !== Number(msg.conversation_id)) {
            convToUpdate.unread_executive_count = (convToUpdate.unread_executive_count || 0) + 1;
          }
        }

        const withoutUpdated = prev.filter((c) => Number(c.id) !== Number(msg.conversation_id));
        return [convToUpdate, ...withoutUpdated];
      });
    };

    const handleReceiptUpdate = (data: { conversationId: number; readerRole: string }) => {
      const activeConv = selectedConvRef.current;
      if (activeConv && Number(activeConv.id) === Number(data.conversationId)) {
        if (data.readerRole === "user") {
          setMessages((prev) =>
            prev.map((m) =>
              (m.sender_type === "executive" || m.sender_type === "admin")
                ? { ...m, is_read: 1, is_delivered: 1 }
                : m
            )
          );
        }
      }
    };

    const handleMessageDelivered = (data: { messageId?: number; messageUuid?: string }) => {
      setMessages((prev) =>
        prev.map((m) =>
          (data.messageId && m.id === data.messageId) ||
          (data.messageUuid && m.message_uuid === data.messageUuid)
            ? { ...m, is_delivered: 1 }
            : m
        )
      );
    };

    const handleRemoteTypingStart = (data: { conversationId: number }) => {
      const activeConv = selectedConvRef.current;
      if (activeConv && Number(activeConv.id) === Number(data.conversationId)) {
        setIsCustomerTyping(true);
        if (remoteTypingTimeoutRef.current) clearTimeout(remoteTypingTimeoutRef.current);
        remoteTypingTimeoutRef.current = setTimeout(() => {
          setIsCustomerTyping(false);
        }, 3000);
      }
    };

    const handleRemoteTypingStop = (data: { conversationId: number }) => {
      const activeConv = selectedConvRef.current;
      if (activeConv && Number(activeConv.id) === Number(data.conversationId)) {
        setIsCustomerTyping(false);
        if (remoteTypingTimeoutRef.current) clearTimeout(remoteTypingTimeoutRef.current);
      }
    };

    const handlePresenceUpdate = (data: {
      userId: number;
      status: "online" | "offline";
      lastSeen: string | null;
    }) => {
      const activeConv = selectedConvRef.current;
      if (activeConv && Number(activeConv.user_id) === Number(data.userId)) {
        setCustomerPresence({
          status: data.status,
          lastSeen: data.lastSeen,
        });
      }
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("chat:new_message", handleNewMessage);
    socket.on("chat:receipt_updated", handleReceiptUpdate);
    socket.on("chat:message_delivered", handleMessageDelivered);
    socket.on("chat:remote_typing_start", handleRemoteTypingStart);
    socket.on("chat:remote_typing_stop", handleRemoteTypingStop);
    socket.on("user:presence_update", handlePresenceUpdate);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("chat:new_message", handleNewMessage);
      socket.off("chat:receipt_updated", handleReceiptUpdate);
      socket.off("chat:message_delivered", handleMessageDelivered);
      socket.off("chat:remote_typing_start", handleRemoteTypingStart);
      socket.off("chat:remote_typing_stop", handleRemoteTypingStop);
      socket.off("user:presence_update", handlePresenceUpdate);
    };
  }, [currentUserId, fetchConversations]);

  // 4. Send Message Handler
  const handleSendMessage = async (text: string) => {
    if (!selectedConversation || !text.trim()) return;

    const messageUuid = generateUUID();
    const optimisticMessage: PropertyChatMessage = {
      id: Math.floor(Math.random() * 1000000),
      conversation_id: selectedConversation.id,
      sender_id: currentUserId,
      sender_type: "executive",
      message_text: text,
      message_type: "text",
      message_uuid: messageUuid,
      is_delivered: 0,
      is_read: 0,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversation.id
          ? {
              ...c,
              last_message_text: text,
              last_message_at: optimisticMessage.created_at,
            }
          : c
      )
    );

    try {
      const res = await chatApi.sendMessage(selectedConversation.id, {
        message_text: text,
        message_uuid: messageUuid,
      });

      if (res.success && (res.message || (res as any).chatMessage)) {
        const sentMsg = res.message || (res as any).chatMessage;
        setMessages((prev) =>
          prev.map((m) => (m.message_uuid === messageUuid ? sentMsg : m))
        );
      }
    } catch (err) {
      console.error("Failed to send executive message:", err);
      setMessages((prev) => prev.filter((m) => m.message_uuid !== messageUuid));
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

        // Update list preview
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConversation.id
              ? {
                  ...c,
                  last_message_text: caption || (file.type.startsWith("image/") ? "📷 Photo" : file.type.startsWith("video/") ? "🎥 Video" : `📎 ${file.name}`),
                  last_message_at: res.message.created_at,
                }
              : c
          )
        );
      }
    } catch (err) {
      console.error("Failed to send executive media:", err);
    }
  };

  const handleTypingStart = () => {
    const socket = getSocket();
    if (socket && selectedConversation) {
      socket.emit("chat:typing_start", { conversationId: selectedConversation.id });
    }
  };

  const handleTypingStop = () => {
    const socket = getSocket();
    if (socket && selectedConversation) {
      socket.emit("chat:typing_stop", { conversationId: selectedConversation.id });
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
          isAdmin={false}
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

      {/* Column 2: Chat Transcript or Step-by-Step Drilldown Empty State */}
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
          isAdmin={false}
          isRemoteTyping={isCustomerTyping}
          remotePresence={customerPresence}
          onTypingStart={handleTypingStart}
          onTypingStop={handleTypingStop}
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

      {/* Property & Customer Context Modal Popup */}
      {showContext && selectedConversation && (
        <ChatContextPanel
          conversation={selectedConversation}
          onClose={() => setShowContext(false)}
          isAdmin={false}
        />
      )}
    </div>
  );
};
