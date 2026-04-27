// export type UserRole = 'admin' | 'sales' | 'pre_sales';

// export interface CrmUser {
//   id: string;
//   auth_id: string | null;
//   name: string;
//   email: string;
//   phone: string | null;
//   role: UserRole;
//   avatar_url: string | null;
//   is_active: boolean;
//   created_at: string;
// }

// export interface Tag {
//   id: string;
//   name: string;
//   color: string;
//   created_at: string;
// }

// export type ContactStage = 'New' | 'Contacted' | 'Qualified' | 'Site Visit' | 'Closed' | 'Lost';

// export interface WhatsAppContact {
//   id: string;
//   phone: string;
//   name: string;
//   email: string | null;
//   source: string;
//   stage: ContactStage;
//   assigned_to: string | null;
//   budget_min: number;
//   budget_max: number;
//   preferred_location: string | null;
//   property_type: string | null;
//   notes: string | null;
//   is_opted_out: boolean;
//   last_message_at: string | null;
//   created_at: string;
//   updated_at: string;
//   tags?: Tag[];
//   assigned_user?: CrmUser | null;
// }

// export interface LeadTag {
//   id: string;
//   contact_id: string;
//   tag_id: string;
//   created_at: string;
//   tag?: Tag;
// }

// export type ConversationStatus = 'open' | 'resolved' | 'pending';

// export interface WhatsAppConversation {
//   id: string;
//   contact_id: string;
//   assigned_to: string | null;
//   status: ConversationStatus;
//   unread_count: number;
//   last_message: string | null;
//   last_message_at: string | null;
//   bot_active: boolean;
//   flow_id: string | null;
//   current_step_index: number;
//   created_at: string;
//   updated_at: string;
//   contact?: WhatsAppContact;
//   assigned_user?: CrmUser | null;
// }

// export type MessageDirection = 'in' | 'out';
// export type MessageType = 'text' | 'image' | 'document' | 'video' | 'audio' | 'template' | 'interactive' | 'location' | 'sticker';
// export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

// export interface WhatsAppMessage {
//   id: string;
//   conversation_id: string;
//   contact_id: string;
//   wa_message_id: string | null;
//   direction: MessageDirection;
//   message_type: MessageType;
//   body: string | null;
//   text?: string | null;
//   media_url: string | null;
//   media_mime_type: string | null;
//   caption: string | null;
//   template_name: string | null;
//   template_vars: Record<string, string> | null;
//   status: MessageStatus;
//   error_message: string | null;
//   sent_by: string | null;
//   timestamp: string;
//   created_at: string;
//   sender?: CrmUser | null;
// }

// export interface ConversationNote {
//   id: string;
//   conversation_id: string;
//   author_id: string | null;
//   body: string;
//   created_at: string;
//   author?: CrmUser | null;
// }

// export type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
// export type TemplateStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_APPEAL';
// export type TemplateHeaderType = 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VIDEO';
// export type TemplateType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION' | 'CAROUSEL' | 'LIMITED_TIME_OFFER';

// export interface TemplateButton {
//   type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'COPY_CODE';
//   text: string;
//   url?: string;
//   phone_number?: string;
//   coupon_code?: string;
//   country_code?: string;
// }

// export interface CarouselCard {
//   header_type: 'IMAGE' | 'VIDEO';
//   header_url: string;
//   body: string;
//   buttons: TemplateButton[];
// }

// export interface Template {
//   id: string;
//   name: string;
//   category: TemplateCategory;
//   language: string;
//   template_type: TemplateType;
//   header_type: TemplateHeaderType | null;
//   header_text: string | null;
//   header_media_url: string | null;
//   body: string;
//   footer: string | null;
//   buttons: TemplateButton[] | null;
//   variables: string[] | null;
//   carousel_cards: CarouselCard[] | null;
//   lto_expiration_time_ms: number | null;
//   lto_has_expiry: boolean;
//   lto_coupon_code: string | null;
//   status: TemplateStatus;
//   meta_template_id: string | null;
//   rejection_reason: string | null;
//   created_by: string | null;
//   created_at: string;
//   updated_at: string;
// }

// export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'completed' | 'failed' | 'paused';

// export interface CampaignFilters {
//   tags?: string[];
//   stage?: ContactStage[];
//   location?: string;
//   budget_min?: number;
//   budget_max?: number;
//   property_type?: string;
//   template_vars?: string[];
// }

// export interface Campaign {
//   id: string;
//   name: string;
//   template_id: string | null;
//   filters: CampaignFilters;
//   status: CampaignStatus;
//   scheduled_at: string | null;
//   started_at: string | null;
//   completed_at: string | null;
//   total_contacts: number;
//   sent_count: number;
//   delivered_count: number;
//   read_count: number;
//   failed_count: number;
//   created_by: string | null;
//   created_at: string;
//   updated_at: string;
//   template?: Template | null;
// }

// export type CampaignLogStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

// export interface CampaignLog {
//   id: string;
//   campaign_id: string;
//   contact_id: string;
//   wa_message_id: string | null;
//   status: CampaignLogStatus;
//   error_message: string | null;
//   sent_at: string | null;
//   delivered_at: string | null;
//   read_at: string | null;
//   created_at: string;
//   contact?: WhatsAppContact | null;
// }

// export type FlowStepType = 'message' | 'question' | 'buttons' | 'tag' | 'assign' | 'stage' | 'template' | 'condition' | 'end';

// export interface FlowStep {
//   id: string;
//   flow_id: string;
//   step_index: number;
//   step_type: FlowStepType;
//   message_text: string | null;
//   buttons: { id: string; title: string; next_step?: number }[] | null;
//   save_response_as: string | null;
//   tag_id: string | null;
//   assign_to: string | null;
//   stage: string | null;
//   template_id: string | null;
//   next_step_index: number | null;
//   conditions: Record<string, unknown> | null;
//   created_at: string;
// }

// export interface ChatbotFlow {
//   id: string;
//   name: string;
//   description: string | null;
//   trigger_keyword: string | null;
//   is_active: boolean;
//   is_default: boolean;
//   created_by: string | null;
//   created_at: string;
//   updated_at: string;
//   steps?: FlowStep[];
// }

// export type PropertyType = 'Apartment' | 'Villa' | 'Plot' | 'Commercial' | 'Office' | 'Shop' | 'Warehouse';
// export type ListingType = 'Sale' | 'Rent';
// export type PropertyStatus = 'available' | 'sold' | 'rented' | 'hold';

// export interface Property {
//   id: string;
//   title: string;
//   property_type: PropertyType;
//   listing_type: ListingType;
//   location: string;
//   area_sqft: number | null;
//   price: number;
//   bedrooms: number | null;
//   bathrooms: number | null;
//   description: string | null;
//   images: string[];
//   amenities: string[];
//   status: PropertyStatus;
//   added_by: string | null;
//   created_at: string;
//   updated_at: string;
//   match_count?: number;
// }

// export interface PropertyMatch {
//   id: string;
//   property_id: string;
//   contact_id: string;
//   match_score: number;
//   notified: boolean;
//   notified_at: string | null;
//   created_at: string;
//   contact?: WhatsAppContact | null;
//   property?: Property | null;
// }

// export interface AutoReplySettings {
//   id: string;
//   welcome_message: string;
//   outside_hours_message: string | null;
//   business_hours_start: string;
//   business_hours_end: string;
//   auto_reply_enabled: boolean;
//   default_flow_id: string | null;
//   default_assigned_to: string | null;
//   updated_at: string;
// }

// export interface AnalyticsOverview {
//   total_contacts: number;
//   new_leads_today: number;
//   new_leads_week: number;
//   open_conversations: number;
//   messages_sent_today: number;
//   messages_received_today: number;
//   response_rate: number;
//   active_campaigns: number;
// }
// types/index.ts

export type UserRole = 'admin' | 'sales' | 'pre_sales';

export interface CrmUser {
  id: string;
  auth_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  first_name?: string;
  last_name?: string;
  designation?: string;
  department?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_by?: string | null;
  created_at: string;
  updated_at?: string;
}

export type ContactStage = 'New' | 'Contacted' | 'Qualified' | 'Site Visit' | 'Closed' | 'Lost';

export interface WhatsAppContact {
  id: string;
  phone: string;
  name: string;
  email: string | null;
  source: string;
  stage: ContactStage;
  assigned_to: string | null;
  budget_min: number;
  budget_max: number;
  preferred_location: string | null;
  property_type: string | null;
  notes: string | null;
  is_opted_out: boolean;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
  assigned_user?: CrmUser | null;
  last_message?: string;
  last_contact_time?: string;
  color?: string;
  initials?: string;
  messages?: WhatsAppMessage[];
  notesList?: ConversationNote[];
}

export interface LeadTag {
  id: string;
  contact_id: string;
  tag_id: string;
  created_at: string;
  tag?: Tag;
}

export type ConversationStatus = 'open' | 'resolved' | 'pending';

export interface WhatsAppConversation {
  id: string;
  contact_id: string;
  assigned_to: string | null;
  status: ConversationStatus;
  unread_count: number;
  last_message: string | null;
  last_message_at: string | null;
  bot_active: boolean;
  flow_id: string | null;
  current_step_index: number;
  created_at: string;
  updated_at: string;
  contact?: WhatsAppContact;
  assigned_user?: CrmUser | null;
}

export type MessageDirection = 'in' | 'out';
export type MessageType = 'text' | 'image' | 'document' | 'video' | 'audio' | 'template' | 'interactive' | 'location' | 'sticker';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface WhatsAppMessage {
  id: string;
  conversation_id: string;
  contact_id: string;
  wa_message_id: string | null;
  direction: MessageDirection;
  message_type: MessageType;
  body: string | null;
  text?: string | null;
  media_url: string | null;
  media_mime_type: string | null;
  caption: string | null;
  template_name: string | null;
  template_vars: Record<string, string> | null;
  status: MessageStatus;
  error_message: string | null;
  sent_by: string | null;
  timestamp: string;
  created_at: string;
  sender?: CrmUser | null;
  time_sent?: string;
  is_read?: boolean;
}

export interface ConversationNote {
  id: string;
  conversation_id: string;
  contact_id?: string;
  author_id: string | null;
  author_name?: string;
  body: string;
  note?: string;
  created_at: string;
  updated_at?: string;
  author?: CrmUser | null;
}

export type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
export type TemplateStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_APPEAL';
export type TemplateHeaderType = 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VIDEO';
export type TemplateType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOCATION' | 'CAROUSEL' | 'LIMITED_TIME_OFFER';

export interface TemplateButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'COPY_CODE';
  text: string;
  url?: string;
  phone_number?: string;
  coupon_code?: string;
  country_code?: string;
}

export interface CarouselCard {
  header_type: 'IMAGE' | 'VIDEO';
  header_url: string;
  body: string;
  buttons: TemplateButton[];
}

export interface Template {
  id: string;
  name: string;
  label?: string;
  category: TemplateCategory;
  language: string;
  template_type: TemplateType;
  header_type: TemplateHeaderType | null;
  header_text: string | null;
  header_media_url: string | null;
  body: string;
  footer: string | null;
  buttons: TemplateButton[] | null;
  variables: string[] | null;
  carousel_cards: CarouselCard[] | null;
  lto_expiration_time_ms: number | null;
  lto_has_expiry: boolean;
  lto_coupon_code: string | null;
  status: TemplateStatus;
  meta_id: string | null;
  meta_template_id: string | null;
  rejection_reason: string | null;
  usage_count?: number;
  last_used?: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  location_name?: string;
  location_address?: string;
  location_lat?: number;
  location_lng?: number;
}

export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'completed' | 'failed' | 'paused';

export interface CampaignFilters {
  tags?: string[];
  stage?: ContactStage[];
  location?: string;
  budget_min?: number;
  budget_max?: number;
  property_type?: string;
  template_vars?: string[];
  media_url?: string;
}

export interface Campaign {
  id: string;
  name: string;
  template_id: string | null;
  template?: Template | null;
  filters: CampaignFilters;
  status: CampaignStatus;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  total_contacts: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  audience_mode?: 'segment' | 'upload' | 'manual';
  audience_filters?: any;
  selected_contact_ids?: string[];
  uploaded_contacts?: { name: string; phone: string }[];
  template_variables?: string[];
  media_url?: string;
  carousel_media?: string[];
  estimated_cost?: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type CampaignLogStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface CampaignLog {
  id: string;
  campaign_id: string;
  contact_id: string;
  wa_message_id: string | null;
  status: CampaignLogStatus;
  error_message: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  created_at: string;
  updated_at?: string;
  contact?: WhatsAppContact | null;
}

export type FlowStepType = 'message' | 'question' | 'buttons' | 'tag' | 'assign' | 'stage' | 'template' | 'condition' | 'end';

export interface FlowButton {
  id?: string;
  title: string;
  next_step?: number;
}

export interface FlowStep {
  id: string;
  flow_id: string;
  step_index: number;
  step_type: FlowStepType;
  message_text: string | null;
  buttons: FlowButton[] | null;
  save_response_as: string | null;
  tag_id: string | null;
  assign_to: string | null;
  stage: string | null;
  template_id: string | null;
  next_step_index: number | null;
  conditions: Record<string, number> | null;
  created_at: string;
  updated_at?: string;
}

export interface ChatbotFlow {
  id: string;
  name: string;
  description: string | null;
  trigger_keyword: string | null;
  is_active: boolean;
  is_default: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  steps?: FlowStep[];
}

export type PropertyType = 'Apartment' | 'Villa' | 'Plot' | 'Commercial' | 'Office' | 'Shop' | 'Warehouse';
export type ListingType = 'Sale' | 'Rent';
export type PropertyStatus = 'available' | 'sold' | 'rented' | 'hold';

export interface Property {
  id: string;
  title: string;
  property_type: PropertyType;
  listing_type: ListingType;
  location: string;
  area_sqft: number | null;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  description: string | null;
  images: string[];
  amenities: string[];
  status: PropertyStatus;
  added_by: string | null;
  created_at: string;
  updated_at: string;
  match_count?: number;
}

export interface PropertyMatch {
  id: string;
  property_id: string;
  contact_id: string;
  match_score: number;
  notified: boolean;
  notified_at: string | null;
  created_at: string;
  contact?: WhatsAppContact | null;
  property?: Property | null;
}

export interface AutoReplySettings {
  id: string;
  welcome_message: string;
  outside_hours_message: string | null;
  business_hours_start: string;
  business_hours_end: string;
  auto_reply_enabled: boolean;
  default_flow_id: string | null;
  default_assigned_to: string | null;
  updated_at: string;
}

export interface AnalyticsOverview {
  total_contacts: number;
  new_leads_today: number;
  new_leads_week: number;
  open_conversations: number;
  messages_sent_today: number;
  messages_received_today: number;
  response_rate: number;
  active_campaigns: number;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'lead' | 'message' | 'alert' | 'success' | 'error' | 'info';
  title: string;
  message: string;
  action?: { label: string; page: string };
  read: boolean;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}