import { api } from "@/lib/api";

export interface RexProfile {
  name?: string | null;
  gender?: string | null;
  phone?: string | null;
  email?: string | null;
  role?: "buyer" | "seller" | "tenant" | "owner" | "broker" | null;
}

export interface RexRequirements {
  transaction_type?: "buy" | "rent" | "sell" | null;
  city?: string | null;
  locations?: string[];
  property_type?: "Residential" | "Commercial" | "Agriculture Land" | null;
  property_subtype?: "Apartment" | "Villa" | "Row House" | "Plot" | "Office" | "Shop" | null;
  unit_type?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  budget_min?: number | null;
  budget_max?: number | null;
  carpet_area_min?: number | null;
}

export interface RexPropertyCardData {
  id: number;
  slug: string;
  title: string;
  property_type?: string | null;
  property_subtype?: string | null;
  unit_type?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  carpet_area?: number | string | null;
  city?: string | null;
  location?: string | null;
  society?: string | null;
  price: number;
  photos?: string[];
  is_featured?: boolean;
  is_premium?: boolean;
}

export interface RexPaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  remaining: number;
}

export interface RexVisitData {
  id: number;
  property_id: number;
  property_title: string;
  property_address: string;
  property_photos?: string[];
  property_price?: number | string;
  visit_date: string;
  visit_time: string;
  shift?: string;
  executive_id?: number | null;
  executive_name?: string;
}

export interface RexChatResponse {
  success: boolean;
  reply: string;
  suggestions?: string[];
  properties?: RexPropertyCardData[];
  pagination?: RexPaginationInfo;
  session_uuid: string;
  intent: string;
  profile: RexProfile;
  requirements: RexRequirements;
  is_qualified: boolean;
  message?: string;
}

export interface RexChatMessageHistory {
  id: string;
  sender: "user" | "rex";
  text: string;
  suggestions?: string[];
  properties?: RexPropertyCardData[];
  pagination?: RexPaginationInfo;
  visit?: RexVisitData;
  timestamp: string;
}

export interface RexSessionData {
  session_uuid: string;
  intent: string;
  profile: RexProfile;
  requirements: RexRequirements;
  history: RexChatMessageHistory[];
  is_qualified: boolean;
}

export interface RexSessionResponse {
  success: boolean;
  session?: RexSessionData;
  message?: string;
}

export const rexApi = {
  /**
   * Send message to REX AI Assistant
   */
  async sendMessage({
    message,
    session_uuid,
    guest_uuid,
  }: {
    message: string;
    session_uuid?: string | null;
    guest_uuid?: string | null;
  }): Promise<RexChatResponse> {
    const headers: Record<string, string> = {};
    if (guest_uuid) {
      headers["x-guest-uuid"] = guest_uuid;
    }

    const response = await api.post<RexChatResponse>(
      "/rex/chat",
      {
        message,
        session_uuid: session_uuid || undefined,
        guest_uuid: guest_uuid || undefined,
      },
      { headers }
    );

    return response.data;
  },

  /**
   * Perform structured interactive action (load_more, set_role, interested, etc.)
   */
  async performAction({
    action,
    payload,
    session_uuid,
    guest_uuid,
  }: {
    action: string;
    payload?: any;
    session_uuid?: string | null;
    guest_uuid?: string | null;
  }): Promise<{
    success: boolean;
    reply?: string;
    suggestions?: string[];
    properties?: RexPropertyCardData[];
    pagination?: RexPaginationInfo;
    property?: RexPropertyCardData;
    lead_id?: number | null;
  }> {
    const headers: Record<string, string> = {};
    if (guest_uuid) {
      headers["x-guest-uuid"] = guest_uuid;
    }

    const response = await api.post(
      "/rex/action",
      {
        action,
        payload,
        session_uuid: session_uuid || undefined,
        guest_uuid: guest_uuid || undefined,
      },
      { headers }
    );
    return response.data;
  },

  /**
   * Schedule a site visit via REX AI Chatbot
   */
  async scheduleVisit({
    property_id,
    visit_date,
    visit_time,
    shift = "Evening",
    guest_name,
    guest_phone,
    guest_email,
    session_uuid,
  }: {
    property_id: number;
    visit_date: string;
    visit_time: string;
    shift?: string;
    guest_name?: string;
    guest_phone?: string;
    guest_email?: string;
    session_uuid?: string | null;
  }): Promise<{
    success: boolean;
    message: string;
    visit: RexVisitData;
    conversation_id?: number | null;
  }> {
    const response = await api.post("/rex/schedule-visit", {
      property_id,
      visit_date,
      visit_time,
      shift,
      guest_name,
      guest_phone,
      guest_email,
      session_uuid,
    });
    return response.data;
  },

  /**
   * Retrieve active REX AI Session details and history
   */
  async getSession(sessionId: string): Promise<RexSessionResponse> {
    const response = await api.get<RexSessionResponse>(`/rex/session/${sessionId}`);
    return response.data;
  },

  /**
   * List all REX AI sessions with filtering and pagination
   */
  async listSessions({
    search = "",
    role = "",
    is_qualified,
    date_range = "all",
    location = "",
    page = 1,
    limit = 25,
  }: {
    search?: string;
    role?: string;
    is_qualified?: string | number | boolean;
    date_range?: string;
    location?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    success: boolean;
    sessions: Array<{
      id: number;
      session_uuid: string;
      user_id?: number | null;
      guest_uuid?: string | null;
      current_intent?: string;
      extracted_profile?: RexProfile;
      extracted_requirements?: RexRequirements;
      message_history?: RexChatMessageHistory[];
      is_qualified?: boolean;
      lead_id?: number | null;
      created_at?: string;
      updated_at?: string;
      first_name?: string;
      last_name?: string;
      user_email?: string;
      user_phone?: string;
      user_avatar?: string;
    }>;
    metrics?: {
      totalAll: number;
      totalToday: number;
      totalQualified: number;
      totalBuyers: number;
    };
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const params: any = { page, limit };
    if (search) params.search = search;
    if (role && role !== "all") params.role = role;
    if (is_qualified !== undefined && is_qualified !== "" && is_qualified !== "all") params.is_qualified = is_qualified;
    if (date_range && date_range !== "all") params.date_range = date_range;
    if (location) params.location = location;

    const response = await api.get("/rex/sessions", { params });
    return response.data;
  },
};

