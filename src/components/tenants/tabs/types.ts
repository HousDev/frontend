export interface Tenant {
  id: number;
  tenant_id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  profile_image?: string;
  email: string;
  phone: string;
  whatsapp?: string;
  preferred_location: string;
  budget_min: string | number;
  budget_max: string | number;
  preferred_bhk: string;
  tenant_type: string;
  move_in_date?: string;
  current_address?: string;
  notes?: string;
  status: string;
  rental_property_id?: number | string | null;
  property_title?: string;
  owner_name?: string;
  assigned_to?: number | string;
  assigned_to_name?: string;
  created_at?: string;
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
