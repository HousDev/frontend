export interface Tenant {
  id: number;
  tenant_id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  profile_image?: string;
  profile_photo?: string;
  email: string;
  phone: string;
  whatsapp?: string;
  preferred_location: string;
  budget_min: string | number;
  budget_max: string | number;
  preferred_bhk: string;
  tenant_type: string;
  furnishing?: string;
  move_in_date?: string;
  current_address?: string;
  notes?: string;
  status: string;
  username?: string;
  rental_property_id?: number | string | null;
  property_title?: string;
  owner_name?: string;
  kyc_verified_at?: string;
  assigned_to?: number | string;
  assigned_to_name?: string;
  occupation_type?: string;
  company_name?: string;
  designation?: string;
  monthly_income?: number | string;
  office_location?: string;
  food_preference?: 'Veg Only' | 'Veg/Non-Veg' | 'Any' | string;
  has_pets?: 'Yes' | 'No' | string;
  smoking_habits?: 'No' | 'Yes' | 'Occasionally' | string;
  marital_status?: 'Single' | 'Married' | 'Other' | string;
  family_members_count?: number | string;
  vehicle_type?: '2-Wheeler' | '4-Wheeler' | 'Both' | 'None' | string;
  expected_stay_duration?: string;
  created_at?: string;
}

export type InterestStatus =
  | 'PENDING'
  | 'OWNER_CONFIRMED'
  | 'OWNER_OFFERED'
  | 'OWNER_REJECTED'
  | 'TENANT_ACCEPTED'
  | 'TENANT_DECLINED'
  | 'PROPERTY_SELECTED'
  | 'BOOKING_PENDING'
  | 'BOOKED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface TenantOwnerInterest {
  id: number;
  rental_property_id: number;
  tenant_id: number;
  owner_id?: number | null;
  sender_type: 'tenant' | 'owner';
  status: InterestStatus;
  match_score: number;
  message?: string;
  owner_notes?: string;
  confirmed_at?: string;
  tenant_responded_at?: string;
  created_at: string;
  updated_at?: string;
  // Joins
  tenant_name?: string;
  tenant_phone?: string;
  tenant_email?: string;
  tenant_type?: string;
  occupation_type?: string;
  company_name?: string;
  monthly_income?: number | string;
  food_preference?: string;
  has_pets?: string;
  family_members_count?: number;
  property_type_name?: string;
  unit_type?: string;
  society_name?: string;
  location_name?: string;
  expected_rent?: number | string;
  monthly_rent?: number | string;
  photos?: string[];
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
}

export interface MatchedProperty {
  id: number | string;
  title?: string;
  property_type_name?: string;
  property_type?: string;
  unit_type?: string;
  monthly_rent?: number | string;
  expected_rent?: number | string;
  rent?: number | string;
  price?: number | string;
  location_name?: string;
  society_name?: string;
  address?: string;
  city_name?: string;
  location?: string;
  images?: string[];
  photos?: string[];
  mediaItems?: { file_path: string }[];
  matchScore: number;
  matchReasons?: string[];
  seller_name?: string;
  owner_name?: string;
  [key: string]: any;
}

export interface PaymentRecord {
  id: string;
  invoiceNo: string;
  month: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: "Paid" | "Pending" | "Overdue";
  paymentMethod?: string;
  receiptUrl?: string;
}

export interface MaintenanceTicket {
  id: string;
  ticketNo: string;
  title: string;
  category:
  | "Plumbing"
  | "Electrical"
  | "Appliance"
  | "Pest Control"
  | "Painting"
  | "Carpentry"
  | "General";
  priority: "Low" | "Medium" | "High" | "Emergency";
  description: string;
  status:
  | "Pending Approval"
  | "Technician Assigned"
  | "In Progress"
  | "Completed";
  createdAt: string;
  technicianName?: string;
  estimatedCost?: number;
}

export interface InspectionItem {
  id: string;
  room: string;
  item: string;
  condition: "Good" | "Minor Wear" | "Needs Repair";
  notes?: string;
  hasPhoto?: boolean;
}
