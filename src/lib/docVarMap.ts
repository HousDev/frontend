// src/lib/docVarMap.ts
// STRICT mapping: 1 variable => 1 exact path in formData. No fallbacks, no aliases.

export type DocTemplate = {
  id?: string | number;
  name?: string;
  variables?: string[];
  [k: string]: any;
};

export type FormDataShape = Record<string, any>;

/**
 * Naming convention:
 * - Common logged-in user vars:  user_*  (formData.current_user.*)
 * - Seller vars:  seller_*       (formData.seller.*)
 * - Buyer vars:   buyer_*        (formData.buyer.*)
 * - Property vars: property_*    (flat on formData, e.g. property_address)
 * - Finance/terms/doc meta/executive: flat on formData
 */
export const VAR_MAP: Record<string, string> = {
  /* ===================== COMMON USER (logged-in / current user) ===================== */
  user_id: 'current_user.id',
  user_username: 'current_user.username',
  user_first_name: 'current_user.first_name',
  user_last_name: 'current_user.last_name',
  user_email: 'current_user.email',
  user_phone: 'current_user.phone',
  user_role: 'current_user.role',
  user_is_active: 'current_user.is_active',
  user_avatar: 'current_user.avatar',
  user_designation: 'current_user.designation',
  user_department: 'current_user.department',
  user_dob: 'current_user.dob',
  user_blood_group: 'current_user.blood_group',
  user_last_login: 'current_user.last_login',
  user_created_at: 'current_user.created_at',
  user_updated_at: 'current_user.updated_at',
  user_total_leads: 'current_user.total_leads',
  user_total_properties: 'current_user.total_properties',
  user_total_revenue: 'current_user.total_revenue',
  user_module_permissions: 'current_user.module_permissions',
  user_salutation: 'current_user.salutation',
  user_buyer_id: 'current_user.buyer_id',
  user_seller_id: 'current_user.seller_id',

  /* ============================ SELLER (selected party) ============================ */
  salutation: 'seller.salutation',
  seller_id: 'seller.id',
  seller_salutation: 'seller.salutation',
  seller_name: 'seller.name',
  seller_phone: 'seller.phone',
  seller_whatsapp: 'seller.whatsapp',
  seller_email: 'seller.email',
  seller_address: 'seller.address',
  seller_state: 'seller.state',
  seller_city: 'seller.city',
  seller_location: 'seller.location',
  seller_countryCode: 'seller.countryCode',
  seller_stage: 'seller.stage',
  seller_leadType: 'seller.leadType',
  seller_priority: 'seller.priority',
  seller_status: 'seller.status',
  seller_source: 'seller.source',
  seller_notes: 'seller.notes',
  seller_dob: 'seller.dob',
  seller_expected_close: 'seller.expected_close',
  seller_last_activity: 'seller.last_activity',
  seller_lead_score: 'seller.lead_score',
  seller_deal_value: 'seller.deal_value',
  seller_visits: 'seller.visits',
  seller_total_visits: 'seller.total_visits',
  seller_stage_progress: 'seller.stage_progress',
  seller_deal_potential: 'seller.deal_potential',
  seller_response_rate: 'seller.response_rate',
  seller_avg_response_time: 'seller.avg_response_time',
  seller_assigned_to: 'seller.assigned_to',
  seller_assigned_to_name: 'seller.assigned_to_name',
  seller_notifications: 'seller.notifications',
  seller_is_active: 'seller.is_active',
  seller_created_at: 'seller.created_at',
  seller_updated_at: 'seller.updated_at',
  seller_current_stage: 'seller.current_stage',

  /* ------------------------ SELLER CO-SELLERS (array support) ---------------------- */
  seller_cosellers: 'seller_cosellers',
  seller_coseller1_id: 'seller_cosellers.0.id',
  seller_coseller1_seller_id: 'seller_cosellers.0.seller_id',
  seller_coseller1_salutation: 'seller_cosellers.0.salutation',
  seller_coseller1_name: 'seller_cosellers.0.name',
  seller_coseller1_phone: 'seller_cosellers.0.phone',
  seller_coseller1_whatsapp: 'seller_cosellers.0.whatsapp',
  seller_coseller1_email: 'seller_cosellers.0.email',
  seller_coseller1_relation: 'seller_cosellers.0.relation',
  seller_coseller1_dob: 'seller_cosellers.0.dob',
  seller_coseller1_created_at: 'seller_cosellers.0.created_at',
  seller_coseller1_updated_at: 'seller_cosellers.0.updated_at',

  /* ============================= BUYER (selected party) ============================ */
  buyer_id: 'buyer.id',
  buyer_salutation: 'buyer.salutation',
  buyer_name: 'buyer.name',
  buyer_phone: 'buyer.phone',
  buyer_whatsapp_number: 'buyer.whatsapp_number',
  buyer_email: 'buyer.email',
  buyer_state: 'buyer.state',
  buyer_city: 'buyer.city',
  buyer_location: 'buyer.location',
  buyer_lead_priority: 'buyer.buyer_lead_priority',
  buyer_lead_source: 'buyer.buyer_lead_source',
  buyer_lead_stage: 'buyer.buyer_lead_stage',
  buyer_lead_status: 'buyer.buyer_lead_status',
  buyer_budget_min: 'buyer.budget_min',
  buyer_budget_max: 'buyer.budget_max',
  buyer_requirements: 'buyer.requirements',
  buyer_financials: 'buyer.financials',
  buyer_is_active: 'buyer.is_active',
  buyer_created_at: 'buyer.created_at',
  buyer_updated_at: 'buyer.updated_at',
  buyer_lead_id: 'buyer.lead_id',
  buyer_lead_type: 'buyer.lead_type',
  buyer_assigned_executive: 'buyer.assigned_executive',
  buyer_created_by: 'buyer.created_by',
  buyer_updated_by: 'buyer.updated_by',
  buyer_last_contact: 'buyer.last_contact',
  buyer_last_contact_by: 'buyer.last_contact_by',
  buyer_remark: 'buyer.remark',
  buyer_dob: 'buyer.dob',
  buyer_nearbylocations: 'buyer.nearbylocations',




  /* ================================ PROPERTY (flat) ================================= */
  property_address: 'property_address',
  property_type: 'property_type',
  property_area: 'property_area',
  unit_number: 'unit_number',
  society_name: 'society_name',

  property_id: 'id',
  property_seller_name: 'seller_name',
  property_seller_id: 'seller_id',
  property_lead_id: 'lead_id',
  property_assigned_to: 'assigned_to',
  property_type_name: 'property_type_name',
  property_subtype_name: 'property_subtype_name',
  property_unit_type: 'unit_type',
  property_wing: 'wing',
  property_unit_no: 'unit_no',
  property_furnishing: 'furnishing',
  property_bedrooms: 'bedrooms',
  property_bathrooms: 'bathrooms',
  property_facing: 'facing',
  property_parking_type: 'parking_type',
  property_parking_qty: 'parking_qty',
  property_city_name: 'city_name',
  property_location_name: 'location_name',
  property_society_name_full: 'society_name',
  property_floor: 'floor',
  property_total_floors: 'total_floors',
  property_carpet_area: 'carpet_area',
  property_builtup_area: 'builtup_area',
  property_budget: 'budget',
  property_price_type: 'price_type',
  property_final_price: 'final_price',
  property_address_line: 'address',
  property_status_full: 'status',
  property_lead_source: 'lead_source',
  property_possession_month: 'possession_month',
  property_possession_year: 'possession_year',
  property_purchase_month: 'purchase_month',
  property_purchase_year: 'purchase_year',
  property_selling_rights: 'selling_rights',
  property_ownership_doc_path: 'ownership_doc_path',
  property_photos: 'photos',
  property_amenities: 'amenities',
  property_furnishing_items: 'furnishing_items',
  property_nearby_places: 'nearby_places',
  property_description: 'description',
  property_created_at: 'created_at',
  property_updated_at: 'updated_at',
  property_is_public: 'is_public',
  property_publication_date: 'publication_date',
  property_created_by: 'created_by',
  property_updated_by: 'updated_by',
  property_public_views: 'public_views',
  property_public_inquiries: 'public_inquiries',
  property_slug: 'slug',

  /* ============================ FINANCE / TERMS / DATES ============================ */
  sale_amount: 'sale_amount',
  token_amount: 'token_amount',
  booking_amount: 'booking_amount',
  commission_rate: 'commission_rate',
  validity_period: 'validity_period',
  agreement_date: 'agreement_date',
  possession_date: 'possession_date',
  related_party: 'related_party',
  amount: 'amount',
  amount_in_words: 'amount_in_words', 
  in_words: 'amount_in_words',
  payment_date: 'payment_date',
  payment_reference: 'payment_reference',
  deal_value: "deal_value",
  payment_type: "payment_type",
  payment_method: "payment_method",
  buyer_bank_name: 'transaction_details.buyer_bank_name',
  seller_bank_name: 'transaction_details.seller_bank_name',
  ledger_entries: 'ledger_entries',          // Direct mapping


  /* ===== Property Receipt: map template vars to receipt.* and finance fields ===== */
  receipt_id: 'receipt.receipt_id',

  // ⚠️ You used plain names in the template; map them to receipt.* to avoid clashes
  type: 'receipt.type',
  status: 'receipt.status',
  payment_status: 'receipt.payment_status',

  receipt_date: 'receipt.receipt_date',
  notes: 'receipt.notes',

  created_by: 'receipt.created_by',
  updated_by: 'receipt.updated_by',
  created_at: 'receipt.created_at',
  updated_at: 'receipt.updated_at',
  created_by_name:'created_by_name',
  updated_by_name:'created_by_name',


  // Finance display
  // template uses this exact key

  // Ledger (first row for simple tables)
  ledger_index: 'ledger_entries.0.index',
  ledger_date: 'ledger_entries.0.date',
  ledger_type: 'ledger_entries.0.type',
  ledger_amount: 'ledger_entries.0.amount',
  ledger_balance: 'ledger_entries.0.balance',
  ledger_description: 'ledger_entries.0.description',



  /* ================================= DOCUMENT META ================================= */
  title: 'title',
  document_id: 'document_id',
  document_date: 'document_date',

  /* ================================== EXECUTIVE ==================================== */
  sales_executive: 'sales_executive',
  executive_id: 'executive_id',
  executive_name: 'sales_executive',
  executive_phone: 'executive_phone',
  executive_email: 'executive_email',
  executive_role: 'executive_role',

  /* ===================================== LEAD ====================================== */
  lead_id: 'lead.id',
  lead_salutation: 'lead.salutation',
  lead_name: 'lead.name',
  lead_phone: 'lead.phone',
  lead_whatsapp_number: 'lead.whatsapp_number',
  lead_email: 'lead.email',
  lead_type: 'lead.lead_type',
  lead_source: 'lead.lead_source',
  lead_stage: 'lead.stage',
  lead_status: 'lead.status',
  lead_priority: 'lead.priority',
  lead_state: 'lead.state',
  lead_city: 'lead.city',
  lead_location: 'lead.location',
  lead_assigned_executive: 'lead.assigned_executive',
  lead_created_by: 'lead.created_by',
  lead_updated_by: 'lead.updated_by',
  lead_last_contact: 'lead.last_contact',
  lead_last_contact_by: 'lead.last_contact_by',
  lead_created_at: 'lead.created_at',
  lead_updated_at: 'lead.updated_at',
  lead_transferred_to_buyer_at: 'lead.transferred_to_buyer_at',
  lead_transferred_to_buyer: 'lead.transferred_to_buyer',
  lead_transferred_to_seller: 'lead.transferred_to_seller',
  lead_transferred_to_seller_at: 'lead.transferred_to_seller_at',
  lead_transferred_to_seller_by: 'lead_transferred_to_seller_by',
  lead_transferred_to_buyer_by: 'lead_transferred_to_buyer_by',
  lead_is_listed: 'lead.is_listed',

  /* ===================== SYSTEM SETTINGS ===================== */
  company_name: 'system_settings.company_name',
  company_logo: 'system_settings.company_logo',
  footer_logo: 'system_settings.footer_logo',
  company_favicon: 'system_settings.company_favicon',
  primary_color: 'system_settings.primary_color',
  secondary_color: 'system_settings.secondary_color',
  currency: 'system_settings.currency',
  date_format: 'system_settings.date_format',
  time_format: 'system_settings.time_format',
  default_language: 'system_settings.default_language',
  max_file_size: 'system_settings.max_file_size',
  backup_frequency: 'system_settings.backup_frequency',
  auto_assign_leads: 'system_settings.auto_assign_leads',
  lead_scoring_enabled: 'system_settings.lead_scoring_enabled',
  property_auto_approval: 'system_settings.property_auto_approval',
  // created_at: 'system_settings.created_at',
  // updated_at: 'system_settings.updated_at',

  /* ============== SPECIAL (computed at resolve time; not read from formData) ======= */
  current_date: '__computed.current_date',
  current_time: '__computed.current_time',
  current_datetime: '__computed.current_datetime',
};

/* ========================================================== */
/* ======================= HELPERS ========================== */
/* ========================================================== */

const isNil = (v: any) => v === null || v === undefined;

function getByPath(obj: any, path: string) {
  const segs = path.split('.');
  let cur = obj;
  for (const s of segs) {
    if (isNil(cur)) return undefined;
    cur = cur[s];
  }
  return cur;
}

const pad = (n: number) => String(n).padStart(2, '0');

function formatDate(d: Date, pattern: string): string {
  const DD = pad(d.getDate());
  const MM = pad(d.getMonth() + 1);
  const YYYY = d.getFullYear();

  return pattern
    .replace(/DD/g, DD)
    .replace(/MM/g, MM)
    .replace(/YYYY/g, String(YYYY));
}

function formatTime(d: Date, pattern: string): string {
  const HH = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());

  // 12h parts
  const h24 = d.getHours();
  const h12n = h24 % 12 || 12;
  const hh = pad(h12n);
  const A = h24 < 12 ? 'AM' : 'PM';
  const a = A.toLowerCase();

  return pattern
    .replace(/HH/g, HH)
    .replace(/hh/g, hh)
    .replace(/mm/g, mm)
    .replace(/ss/g, ss)
    .replace(/A/g, A)
    .replace(/a/g, a);
}

/**
 * STRICT RESOLUTION:
 * Always returns all requested variables (even if blank)
 * - Special keys (current_date/time/datetime) are computed here.
 * - Respects system_settings.date_format / time_format if present.
 */
export function resolveVariablesStrict(template: DocTemplate, formData: FormDataShape) {
  const requested = Array.isArray(template.variables) ? template.variables : [];
  const out: Record<string, any> = {};

  const sys = (formData && (formData as any).system_settings) || {};
  const dateFmt = typeof sys.date_format === 'string' && sys.date_format.trim()
    ? sys.date_format
    : 'DD-MM-YYYY';
  const timeFmt = typeof sys.time_format === 'string' && sys.time_format.trim()
    ? sys.time_format
    : 'hh:mm:ss A';

  const now = new Date();
  const computed: Record<string, string> = {
    current_date: formatDate(now, dateFmt),
    current_time: formatTime(now, timeFmt),
    current_datetime: `${formatDate(now, dateFmt)} ${formatTime(now, timeFmt)}`,
  };

  for (const key of requested) {
    // computed specials
    if (key in computed) {
      out[key] = computed[key];
      continue;
    }

    const path = VAR_MAP[key];
    if (!path) {
      out[key] = ''; // unknown variable => blank
      continue;
    }
    // skip __computed.* paths (handled above)
    if (path.startsWith('__computed.')) {
      out[key] = computed[key] ?? '';
      continue;
    }

    const val = getByPath(formData, path);
    out[key] = !isNil(val) ? val : ''; // always include, blank if missing
  }

  return out;
}

/**
 * Replaces {{variable}} in HTML with resolved values.
 * Undefined/null => blank, boolean => Yes/No
 */
export function interpolateStrict(html: string, cleanVars: Record<string, any>) {
  if (!html) return '';
  return html.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_m, key: string) => {
    const v = cleanVars[key];
    if (isNil(v)) return '';
    if (typeof v === 'number') return String(v);
    if (typeof v === 'boolean') return v ? 'Yes' : 'No';
    return String(v);
  });
}
