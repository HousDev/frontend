import { api } from "@/lib/api";

export function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface PropertyConversation {
  id: number;
  conversation_uuid: string;
  user_id: number;
  property_id: number;
  executive_id: number;
  lead_id?: number | null;
  status: "active" | "closed" | "archived";
  deal_stage: "inquiry" | "visit_scheduled" | "negotiating";
  last_message_text?: string | null;
  last_message_at?: string | null;
  unread_user_count: number;
  unread_executive_count: number;
  ai_summary_json?: {
    looking_for?: string;
    preferred_location?: string;
    budget?: string;
    intent?: string;
    notes?: string;
    [key: string]: any;
  } | null;
  created_at: string;
  updated_at: string;
  property_title?: string;
  property_slug?: string;
  property_price?: string | number;
  property_city?: string;
  property_location?: string;
  property_society?: string;
  property_photos?: string[];
  property_furnishing?: string;
  property_carpet_area?: number | string;
  property_builtup_area?: number | string;
  property_floor?: number | string;
  property_total_floors?: number | string;
  property_bedrooms?: number | string;
  property_bathrooms?: number | string;
  property_balcony?: number | string;
  property_facing?: string;
  property_unit_type?: string;
  property_type_name?: string;
  property_subtype_name?: string;
  property_is_public?: boolean | number;
  property_status?: string;
  user_first_name?: string;
  user_last_name?: string;
  user_email?: string;
  user_phone?: string;
  user_role?: string;
  user_avatar?: string;
  executive_salutation?: string;
  executive_first_name?: string;
  executive_last_name?: string;
  executive_email?: string;
  executive_phone?: string;
  executive_role?: string;
  executive_avatar?: string;
}

export interface PropertyChatMessage {
  id: number;
  message_uuid: string;
  conversation_id: number;
  sender_id: number;
  sender_type: "user" | "executive" | "admin" | "system";
  message_type: "text" | "system" | "property_card" | "image" | "video" | "doc" | "media";
  message_text: string;
  metadata_json?: any;
  is_delivered: number | boolean;
  is_read: number | boolean;
  read_at?: string | null;
  created_at: string;
  sender_first_name?: string;
  sender_last_name?: string;
  sender_role?: string;
  sender_avatar?: string;
}

export interface ChatConversationParams {
  status?: string;
  executive_id?: number | string;
  property_id?: number | string;
  user_id?: number | string;
  limit?: number;
  offset?: number;
}

export const chatApi = {
  /**
   * Create or retrieve existing conversation for a property inquiry
   */
  createOrGetConversation: async (data: {
    property_id: number | string;
    lead_id?: number | null;
    initial_message?: string;
    initial_message_uuid?: string;
  }) => {
    const res = await api.post<{
      success: boolean;
      isNew?: boolean;
      reopened?: boolean;
      conversation: PropertyConversation;
    }>("/chat/conversations", data);
    return res.data;
  },

  /**
   * Get conversations (scoped by role automatically on backend)
   */
  getConversations: async (params?: ChatConversationParams) => {
    const res = await api.get<{
      success: boolean;
      count: number;
      conversations: PropertyConversation[];
    }>("/chat/conversations", { params });
    return res.data;
  },

  /**
   * Get single conversation details
   */
  getConversationById: async (conversationId: number | string) => {
    const res = await api.get<{
      success: boolean;
      conversation: PropertyConversation;
    }>(`/chat/conversations/${conversationId}`);
    return res.data;
  },

  /**
   * Get messages for a conversation
   */
  getMessages: async (
    conversationId: number | string,
    params?: { limit?: number; beforeId?: number }
  ) => {
    const res = await api.get<{
      success: boolean;
      count: number;
      messages: PropertyChatMessage[];
    }>(`/chat/conversations/${conversationId}/messages`, { params });
    return res.data;
  },

  /**
   * Send a message in a conversation
   */
  sendMessage: async (
    conversationId: number | string,
    data: {
      message_text: string;
      message_type?: string;
      message_uuid?: string;
      metadata_json?: any;
    }
  ) => {
    const res = await api.post<{
      success: boolean;
      isDuplicate?: boolean;
      message: PropertyChatMessage;
    }>(`/chat/conversations/${conversationId}/messages`, data);
    return res.data;
  },

  /**
   * Send a media file (photo, video, doc) in a conversation
   */
  sendMedia: async (
    conversationId: number | string,
    file: File,
    caption?: string,
    messageUuid?: string
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    if (caption) formData.append("caption", caption);
    if (messageUuid) formData.append("message_uuid", messageUuid);

    const res = await api.post<{
      success: boolean;
      isDuplicate?: boolean;
      message: PropertyChatMessage;
    }>(`/chat/conversations/${conversationId}/media`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  /**
   * Mark messages as read
   */
  markAsRead: async (conversationId: number | string) => {
    const res = await api.post<{
      success: boolean;
      message: string;
      affectedRows?: number;
    }>(`/chat/conversations/${conversationId}/read`);
    return res.data;
  },

  /**
   * Reassign conversation to another executive (admin / manager)
   */
  reassignExecutive: async (
    conversationId: number | string,
    executiveId: number | string
  ) => {
    const res = await api.post<{
      success: boolean;
      message: string;
      conversation: PropertyConversation;
    }>(`/chat/conversations/${conversationId}/reassign`, {
      executive_id: executiveId,
    });
    return res.data;
  },

  /**
   * Get dynamic AI smart reply suggestions for an executive
   */
  getSmartReplies: async (conversationId: number | string, lastMessage?: string) => {
    const res = await api.post<{
      success: boolean;
      suggestions: Array<{
        id: string;
        label: string;
        category?: string;
        reply_text: string;
      }>;
    }>(`/chat/conversations/${conversationId}/smart-replies`, {
      last_message: lastMessage,
    });
    return res.data;
  },

  /**
   * Get list of active executives & agents
   */
  getAvailableExecutives: async () => {
    const res = await api.get<{
      success: boolean;
      executives: Array<{
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        phone?: string;
        role: string;
        avatar?: string;
      }>;
    }>("/chat/executives");
    return res.data;
  },
};

