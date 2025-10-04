// DocumentForm.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, Save, Eye, Share, FileText, X, Users, Building, DollarSign,
  CheckCircle, AlertCircle, CreditCard, User, Phone, Mail, MapPin,
} from 'lucide-react';

import DocumentPreview from './DocumentPreview';
import ClientSelector from './ClientSelector';
import PropertySelector from './PropertySelector';
import PaymentTracker from './PaymentTracker';
import { documentsGeneratedAPI } from '@/lib/documentsGeneratedAPI';

// 🔐 strict resolver + interpolator
import { resolveVariablesStrict, interpolateStrict } from '@/lib/docVarMap';

// (optional) properties/sellers libs if you use them elsewhere
import propertiesAPI from '@/lib/propertiesAPI';
import { sellerAPI } from '@/lib/sellersAPI';
import {systemSettingsAPI} from '@/lib/systemSettingsAPI';
import { useAuth } from '@/contexts/AuthContext';

/* =================== Helpers =================== */

function normalizeList<T = any>(res: any): T[] {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.rows)) return res.rows;
  if (Array.isArray(res?.items)) return res.items;
  return [];
}


const extractVarsFromHtml = (html?: string) => {
  if (!html) return [] as string[];
  const set = new Set<string>();
  const re = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) set.add(m[1]);
  return Array.from(set);
};

// 🧩 DEBUG HELPER — Template variable mapping check
function debugVariableMapping(template: any, formData: any) {
  const cleanVars = resolveVariablesStrict(template, formData);
  const totalVars = Array.isArray(template.variables) ? template.variables.length : 0;
  const filledVars = Object.entries(cleanVars).filter(([_, v]) => v !== '').length;
  const emptyVars = Object.entries(cleanVars).filter(([_, v]) => v === '').map(([k]) => k);

  console.groupCollapsed(
    `%c🧩 Template Variable Mapping Report`,
    'color:#0366d6;font-weight:bold;'
  );
  console.log('Template Name:', template?.name);
  console.log('Total Variables in Template:', totalVars);
  console.log('Resolved (non-empty):', filledVars);
  console.log('Empty / Missing:', emptyVars.length);
  console.log('List of Missing Variables:', emptyVars);
  console.table(cleanVars);
  console.groupEnd();

  return cleanVars;
}

// ✅ seller id strict match
const matchesSeller = (it: any, sellerId?: string | number) => {
  if (!sellerId) return true;
  const S = String(sellerId);
  const cand = [it.seller_id, it?.seller?.id].map(v => (v == null ? undefined : String(v)));
  return cand.some(v => v === S);
};

// ✅ map property -> unified shape
function normalizeProperty(it: any) {
  const toList = (v: any) =>
    Array.isArray(v) ? v :
      typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : [];

  return {
    id: it.id ?? it.property_id ?? it._id,
    seller_id: it.seller_id,
    title: it.unit_no
      ? `${it.society_name ?? it.project ?? 'Property'} • ${it.unit_no}`
      : it.society_name ?? it.project ?? it.title ?? 'Property',

    address: it.address ?? [it.unit_no, it.wing, it.society_name, it.location_name, it.city_name].filter(Boolean).join(', '),

    type: it.property_type_name ?? it.unit_type ?? it.property_type ?? 'Apartment',
    property_subtype_name: it.property_subtype_name,
    unit_type: it.unit_type,
    wing: it.wing,
    unitNo: it.unit_no,
    furnishing: it.furnishing,
    bedrooms: it.bedrooms,
    bathrooms: it.bathrooms,
    facing: it.facing,
    parking_type: it.parking_type,
    parking_qty: it.parking_qty,
    city_name: it.city_name,
    location_name: it.location_name,
    society: it.society_name,
    floor: it.floor,
    total_floors: it.total_floors,

    carpet_area: it.carpet_area,
    builtup_area: it.builtup_area,
    area: it.carpet_area ?? it.builtup_area,

    budget: it.budget,
    price_type: it.price_type,
    final_price: it.final_price,
    price: it.final_price ?? it.budget,

    status: it.status,
    lead_source: it.lead_source,
    possession_month: it.possession_month,
    possession_year: it.possession_year,
    purchase_month: it.purchase_month,
    purchase_year: it.purchase_year,
    selling_rights: it.selling_rights,
    created_at: it.created_at,
    updated_at: it.updated_at,
    is_public: it.is_public,
    publication_date: it.publication_date,
    created_by: it.created_by,
    updated_by: it.updated_by,
    public_views: it.public_views,
    public_inquiries: it.public_inquiries,
    slug: it.slug,

    ownership_doc_path: it.ownership_doc_path,
    photos: it.photos,
    image: Array.isArray(it.photos) && it.photos.length ? it.photos[0] : it.image ?? it.cover_image,
    amenities: toList(it.amenities),
    furnishing_items: toList(it.furnishing_items),
    nearby_places: toList(it.nearby_places),

    seller_name: it.seller_name,
    lead_id: it.lead_id,
    assigned_to: it.assigned_to,

    ...it,
  };
}

// ⬆️ near the top
const normalizeAuthUser = (u: any = {}) => ({
  id: u.id ?? u.user_id ?? u._id ?? '',
  username: u.username ?? (u.email ? u.email.split('@')[0] : '') ?? '',
  first_name: u.first_name ?? u.given_name ?? (u.name ? String(u.name).split(' ')[0] : '') ?? '',
  last_name:
    u.last_name ??
    u.family_name ??
    (u.name ? String(u.name).split(' ').slice(1).join(' ') : '') ??
    '',
  email: u.email ?? '',
  phone: u.phone ?? u.mobile ?? u.whatsapp ?? '',
  role: u.role ?? u.user_role ?? u.type ?? '',
  is_active: u.is_active ?? u.active ?? 1,
  avatar: u.avatar ?? u.profile_image ?? '',
  designation: u.designation ?? '',
  department: u.department ?? '',
  dob: u.dob ?? u.date_of_birth ?? '',
  blood_group: u.blood_group ?? '',
  last_login: u.last_login ?? u.lastLogin ?? '',
  created_at: u.created_at ?? '',
  updated_at: u.updated_at ?? '',
  total_leads: u.total_leads ?? 0,
  total_properties: u.total_properties ?? 0,
  total_revenue: u.total_revenue ?? 0,
  module_permissions: u.module_permissions ?? u.permissions ?? {},
  salutation: u.salutation ?? '',
  buyer_id: u.buyer_id ?? '',
  seller_id: u.seller_id ?? '',
});

/* =================== Types =================== */

export type Template = {
  id: number | string;
  name: string;
  category?: string;
  variables: string[];
  content?: string;
  css?: string;
  pageType?: 'A4' | 'Legal' | string;
};

type Party = {
  id?: string | number;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  [k: string]: any;
};

type PropertyType = {
  id?: string | number;
  title?: string;
  address?: string;
  type?: string;
  area?: string | number;
  unitNo?: string;
  society?: string;
  [k: string]: any;
};

type DocumentFormProps = {
  template?: Template;
  documentData?: Record<string, any>;
  onDataChange?: (data: Record<string, any>) => void;
  onBack?: () => void;
};

/* =================== Defaults =================== */

const defaultTemplate: Template = {
  id: 1,
  name: 'Sale Agreement',
  category: 'Agreement',
  variables: [
    'salutation', 'seller_name', 'buyer_name', 'property_address', 'sale_amount',
    'token_amount', 'booking_amount', 'commission_rate', 'validity_period',
    'agreement_date', 'possession_date',
  ],
};

/* =================== Utils =================== */

function interpolateTemplate(html: string, vars: Record<string, any>): string {
  if (!html) return '';
  return html.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_m, key: string) => {
    const v = vars[key];
    if (v === null || v === undefined) return '';
    if (typeof v === 'number') return String(v);
    if (typeof v === 'boolean') return v ? 'Yes' : 'No';
    return String(v);
  });
}

/* =================== Component =================== */

const DocumentForm: React.FC<DocumentFormProps> = ({
  template = defaultTemplate,
  documentData = {},
  onDataChange = () => { },
  onBack = () => { },
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({
    title: '',
    seller: null as Party | null,
    buyer: null as Party | null,
    property: null as PropertyType | null,
    document_id: '',
    document_date: new Date().toISOString().split('T')[0],
    sales_executive: 'Admin User',
    executive_id: 'EXE001',
    executive_phone: '+91 99999 99999',
    executive_email: 'admin@resaleexpert.com',
    status: 'draft',
    ...documentData,
  });

  const [serverId, setServerId] = useState<number | string | null>(
    (documentData as any)?.id ?? null
  );
  const [showSellerSelector, setShowSellerSelector] = useState(false);
  const [showBuyerSelector, setShowBuyerSelector] = useState(false);
  const [showPropertySelector, setShowPropertySelector] = useState(false);
  const [showPaymentTracker, setShowPaymentTracker] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [navSaving, setNavSaving] = useState(false);
  const [sellerProperties] = useState<PropertyType[]>([]);
 const { user } = useAuth();
  // Page type
  const [pageType, setPageType] = useState<'A4' | 'Legal'>('A4');
  const effectivePageType = (template as any)?.pageType || pageType;

  // ===== Dynamic Requirements (from template variables) =====
  const tVars = Array.isArray(template.variables) ? template.variables : [];
  const hasVarStartsWith = (prefix: string) => tVars.some(v => v.startsWith(prefix));
  const requiresBuyer = tVars.includes('buyer_name') || hasVarStartsWith('buyer_');
  const requiresSeller = tVars.includes('seller_name') || hasVarStartsWith('seller_');
  const requiresAnyParty = requiresBuyer || requiresSeller;

  const requiresProperty =
    tVars.includes('property_address') || hasVarStartsWith('property_') ||
    // common fallbacks:
    tVars.some(v => ['unit_number', 'society_name', 'property_area', 'property_type'].includes(v));

  // ===== Steps (DYNAMIC) =====
  type StepDef = {
    key: 'parties' | 'property' | 'document' | 'review' | 'final';
    label: string;
    description: string;
    icon: any;
  };
useEffect(() => {
  (async () => {
    try {
      const res = await systemSettingsAPI.getSettings();
      const sys = res?.data ?? res;

      setFormData(prev => ({
        ...prev,
        system_settings: sys || {},
        current_user: user || {},
      }));
    } catch (e) {
      console.error('system settings fetch failed', e);
      setFormData(prev => ({
        ...prev,
        current_user: user || {},
      }));
    }
  })();
}, [user]);


// inside component, before any tVars logic:
const effectiveTemplate = useMemo(() => {
  const declared = Array.isArray(template.variables) ? template.variables : [];
  const inHtml = extractVarsFromHtml(template.content);
  const merged = Array.from(new Set([...declared, ...inHtml]));
  return { ...template, variables: merged };
}, [template]);

  const steps = useMemo<StepDef[]>(() => {
    const base: StepDef[] = [];
    if (requiresAnyParty) {
      base.push({ key: 'parties', label: 'Parties', description: 'Select seller/buyer', icon: Users });
    }
    if (requiresProperty) {
      base.push({ key: 'property', label: 'Property', description: 'Choose property', icon: Building });
    }
    base.push({ key: 'document', label: 'Document', description: 'Fill document data', icon: FileText });
    base.push({ key: 'review', label: 'Review', description: 'Review and checklist', icon: Eye });
    base.push({ key: 'final', label: 'Final Preview', description: 'Print-accurate view', icon: Eye });
    return base;
  }, [requiresAnyParty, requiresProperty, template.id]);

  const [activeIndex, setActiveIndex] = useState(0);

  // If template changes and some steps got removed/added, clamp the active index
  useEffect(() => {
    setActiveIndex(idx => Math.min(idx, Math.max(steps.length - 1, 0)));
  }, [steps.length]);

  // Generate a doc id on template change when missing
  useEffect(() => {
    if (!formData.document_id) {
      const prefix = (template?.category ?? 'DOC').toString().toUpperCase().slice(0, 3);
      const timestamp = Date.now().toString().slice(-6);
      setFormData((prev) => ({ ...prev, document_id: `${prefix}${timestamp}` }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template?.id]);

  // Auto title
  useEffect(() => {
    if (template && formData.seller && formData.buyer) {
      const title = `${template.name} - ${formData.seller.name} to ${formData.buyer.name}`;
      setFormData((prev) => ({ ...prev, title }));
    } else if (template && formData.seller) {
      const title = `${template.name} - ${formData.seller.name}`;
      setFormData((prev) => ({ ...prev, title }));
    } else {
      setFormData((prev) => ({ ...prev, title: prev.title || template.name }));
    }
  }, [template, formData.seller, formData.buyer]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      onDataChange?.(next);
      return next;
    });
  };

  // ---------- Party Selectors ----------
  const normalizeCoSeller = (c: any, sellerId: any) => ({
    id: c.id ?? c.coseller_id ?? c._id ?? '',
    seller_id: c.seller_id ?? sellerId ?? '',
    salutation: c.salutation ?? '',
    name: c.name ?? c.full_name ?? '',
    phone: c.phone ?? c.mobile ?? '',
    whatsapp: c.whatsapp ?? '',
    email: c.email ?? '',
    relation: c.relation ?? c.relationship ?? '',
    dob: c.dob ?? c.date_of_birth ?? '',
    created_at: c.created_at ?? c.createdAt ?? '',
    updated_at: c.updated_at ?? c.updatedAt ?? '',
  });

  const handleSellerSelect = async (seller: any) => {
    const baseSeller = {
      id: seller.id ?? seller.seller_id ?? seller._id,
      salutation: seller.salutation ?? '',
      name: seller.name ?? seller.full_name ?? seller.company_name ?? '',
      phone: seller.phone ?? seller.mobile ?? '',
      whatsapp: seller.whatsapp ?? '',
      email: seller.email ?? '',
      address: seller.address ?? seller.location ?? '',
      state: seller.state ?? '',
      city: seller.city ?? '',
      location: seller.location ?? '',
      ...seller,
    };

    let seller_cosellers: any[] = [];
    try {
      const detailPromise =
        (sellerAPI as any).getById?.(baseSeller.id) ??
        (sellerAPI as any).getOne?.(baseSeller.id) ??
        (sellerAPI as any).get?.(baseSeller.id);

      if (!detailPromise) throw new Error('sellerAPI.getById/getOne/get is not available');
      const res = await detailPromise;

      const data = res?.data?.data ?? res?.data ?? res;
      const cos =
        data?.seller_cosellers ??
        data?.cosellers ??
        data?.data?.cosellers ??
        [];

      seller_cosellers = Array.isArray(cos)
        ? cos.map((c: any) => normalizeCoSeller(c, baseSeller.id))
        : [];
    } catch (e) {
      console.warn('co-sellers fetch failed', e);
      seller_cosellers = [];
    }

    setFormData((prev: any) => ({
      ...prev,
      seller: baseSeller,
      seller_cosellers,
      seller_name: baseSeller.name,
      seller_phone: baseSeller.phone,
      seller_email: baseSeller.email,
      seller_address: baseSeller.address,
    }));

    setShowSellerSelector(false);
  };

  const handleBuyerSelect = (buyer: Party) => {
    const normalizedBuyer = {
      ...buyer,
      whatsapp_number: (buyer as any).whatsapp ?? (buyer as any).phone ?? '',
      state: (buyer as any).state ?? '',
      city: (buyer as any).city ?? '',
      location: (buyer as any).location ?? '',
    };

    setFormData((prev) => ({
      ...prev,
      buyer: normalizedBuyer,
      salutation: prev.salutation || '',
      buyer_name: normalizedBuyer.name,
      buyer_phone: normalizedBuyer.phone,
      buyer_email: normalizedBuyer.email,
      buyer_address: normalizedBuyer.address,
    }));
    setShowBuyerSelector(false);
  };

  const handlePropertySelect = (prop: PropertyType) => {
    const p = prop as any;

    setFormData((prev: any) => ({
      ...prev,
      property: prop,

      // quick placeholders
      property_address: p.address ?? '',
      property_type: p.type ?? p.property_type_name ?? '',
      property_area: p.carpet_area ?? p.area ?? '',
      unit_number: p.unit_no ?? p.unitNo ?? '',
      society_name: p.society_name ?? p.society ?? '',

      // flat property fields (STRICT)
      id: p.id,
      seller_name: p.seller_name ?? '',
      seller_id: p.seller_id ?? p?.seller?.id ?? '',
      lead_id: p.lead_id ?? '',
      assigned_to: p.assigned_to ?? '',

      property_type_name: p.property_type_name ?? '',
      property_subtype_name: p.property_subtype_name ?? '',
      unit_type: p.unit_type ?? '',
      wing: p.wing ?? '',
      unit_no: p.unit_no ?? p.unitNo ?? '',

      furnishing: p.furnishing ?? '',
      bedrooms: p.bedrooms ?? '',
      bathrooms: p.bathrooms ?? '',
      facing: p.facing ?? '',

      parking_type: p.parking_type ?? '',
      parking_qty: p.parking_qty ?? '',

      city_name: p.city_name ?? '',
      location_name: p.location_name ?? '',
      society_name_full: p.society_name ?? '',

      floor: p.floor_raw ?? p.floor ?? '',
      total_floors: p.total_floors ?? '',

      carpet_area: p.carpet_area ?? p.area ?? '',
      builtup_area: p.builtup_area ?? '',

      budget: p.budget ?? '',
      price_type: p.price_type ?? '',
      final_price: p.final_price ?? p.price ?? '',

      address: p.address ?? '',
      status: p.status_raw ?? p.status ?? '',
      lead_source: p.lead_source ?? '',

      possession_month: p.possession_month ?? '',
      possession_year: p.possession_year ?? '',
      purchase_month: p.purchase_month ?? '',
      purchase_year: p.purchase_year ?? '',
      selling_rights: p.selling_rights ?? '',

      ownership_doc_path: p.ownership_doc_path ?? '',
      photos: Array.isArray(p.photos) ? p.photos : [],
      amenities: Array.isArray(p.amenities) ? p.amenities : [],
      furnishing_items: Array.isArray(p.furnishing_items) ? p.furnishing_items : [],
      nearby_places: Array.isArray(p.nearby_places) ? p.nearby_places : [],
      description: p.description ?? '',

      created_at: p.created_at ?? '',
      updated_at: p.updated_at ?? '',
      is_public: p.is_public ?? 0,
      publication_date: p.publication_date ?? '',
      created_by: p.created_by ?? '',
      updated_by: p.updated_by ?? '',
      public_views: p.public_views ?? 0,
      public_inquiries: p.public_inquiries ?? 0,
      slug: p.slug ?? '',
    }));

    setShowPropertySelector(false);

    console.log('[DOC] property->formData patch:', {
      id: p.id,
      address: p.address,
      status: p.status_raw ?? p.status,
      unit_no: p.unit_no ?? p.unitNo,
      floor: p.floor_raw ?? p.floor,
      final_price: p.final_price ?? p.price,
    });
  };

  /* ---------- Payload (STRICT) ---------- */
  const docVars = useMemo(
    () => resolveVariablesStrict(template, formData),
    [template, formData]
  );
  const mergedDocData = useMemo(
    () => ({ ...formData, ...docVars }),
    [formData, docVars]
  );

  const buildPayload = (statusOverride?: 'draft' | 'created') => {
    const status = statusOverride ?? (formData.status || 'draft');
    debugVariableMapping(template, formData);
    const cleanVars = docVars;
    const interpolatedHtml = interpolateStrict(template.content || '', cleanVars);

    return {
      template_id: template.id,
      name: formData.title || `${template.name} - Draft`,
      category: template.category ?? null,
      content: interpolatedHtml,
      variables: cleanVars,
      status,
    };
  };

  const ensureCreatedThenUpdate = async (statusOverride?: 'draft' | 'created') => {
    const payload = buildPayload(statusOverride);
    if (!serverId) {
      const created = await documentsGeneratedAPI.create(payload);
      const newId = (created?.id ?? created?.data?.id) as number | string | undefined;
      if (newId !== undefined) setServerId(newId);
    } else {
      await documentsGeneratedAPI.update(serverId, payload);
    }
  };

  /* ---------- Top-level actions ---------- */
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await ensureCreatedThenUpdate('draft');
      alert('Draft saved successfully!');
    } catch (err) {
      console.error('Error saving draft:', err);
      alert('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateDocument = async () => {
    // Only guard what’s actually required by template
    if (requiresSeller && !formData.seller) {
      alert('Please select Seller');
      return;
    }
    if (requiresBuyer && !formData.buyer) {
      alert('Please select Buyer');
      return;
    }
    if (requiresProperty && !formData.property_address && !formData.property) {
      alert('Please select/enter Property');
      return;
    }

    setIsGenerating(true);
    try {
      await ensureCreatedThenUpdate('created');
      setFormData((prev) => ({ ...prev, status: 'created' }));
      alert('Document generated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to generate');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    try {
      await ensureCreatedThenUpdate('draft');
      alert('Document prepared & ready to share!');
    } catch (e) {
      console.error(e);
      alert('Could not prepare document for sharing.');
    }
  };

  /* ---------- Step completion logic (INDEX-BASED) ---------- */
  const isStepCompleteByKey = (key: StepDef['key']) => {
    switch (key) {
      case 'parties': {
        const okSeller = !requiresSeller || Boolean(formData.seller);
        const okBuyer  = !requiresBuyer  || Boolean(formData.buyer);
        return okSeller && okBuyer;
      }
      case 'property': {
        return !requiresProperty || Boolean(formData.property) || Boolean(formData.property_address);
      }
      case 'document': {
        return Boolean(formData.title) && Boolean(formData.document_date);
      }
      case 'review':
      case 'final':
        return true;
      default:
        return true;
    }
  };

  const canProceedToIndex = (targetIdx: number) => {
    for (let i = 0; i < targetIdx; i++) {
      const ok = isStepCompleteByKey(steps[i].key);
      if (!ok) return false;
    }
    return true;
  };

  const handleNext = async () => {
    const currentKey = steps[activeIndex].key;
    if (!isStepCompleteByKey(currentKey)) return;

    setNavSaving(true);
    try {
      await ensureCreatedThenUpdate('draft');
      setActiveIndex((prev) => Math.min(prev + 1, steps.length - 1));
    } catch (e) {
      console.error('Failed to save on Next:', e);
      alert('Failed to save. Please try again.');
    } finally {
      setNavSaving(false);
    }
  };

  const usedVariables = useMemo(
    () => [...new Set(tVars)].sort(),
    [tVars]
  );

  /* =================== RENDER =================== */
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-xs">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              type="button"
              aria-label="Back"
            >
              <ArrowLeft size={16} />
            </button>

            <div>
              <h1 className="text-lg font-bold text-gray-900">Create Document</h1>
              <p className="text-gray-600 mt-1">
                Template: {template.name}
                {serverId ? ` • #${serverId}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Page type selector */}
            <div className="hidden sm:flex items-center space-x-2 mr-2">
              <label htmlFor="page-type-select" className="text-sm text-gray-600">Page:</label>
              <select
                id="page-type-select"
                value={pageType}
                onChange={(e) => setPageType(e.target.value as 'A4' | 'Legal')}
                className="px-2 py-1 border rounded bg-white text-sm"
              >
                <option value="A4">A4</option>
                <option value="Legal">Legal</option>
              </select>
            </div>

            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              type="button"
            >
              <Save size={14} />
              <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              type="button"
            >
              <Share size={14} />
              <span>Share</span>
            </button>

            <button
              onClick={handleGenerateDocument}
              disabled={isGenerating}
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              <FileText size={14} />
              <span>{isGenerating ? 'Generating...' : 'Generate Document'}</span>
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mt-4">
          <div className="flex items-center justify-between overflow-x-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeIndex === index;
              const isCompleted = isStepCompleteByKey(step.key);
              const canAccess = canProceedToIndex(index);

              return (
                <div key={step.key} className="flex items-center shrink-0">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!canAccess) return;
                      setNavSaving(true);
                      try {
                        await ensureCreatedThenUpdate('draft');
                        setActiveIndex(index);
                      } catch (e) {
                        console.error('Failed to save on step jump:', e);
                        alert('Failed to save. Please try again.');
                      } finally {
                        setNavSaving(false);
                      }
                    }}
                    disabled={!canAccess || navSaving}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : isCompleted
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : canAccess
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-lg ${
                        isActive ? 'bg-blue-200' : isCompleted ? 'bg-green-200' : 'bg-gray-200'
                      }`}
                    >
                      <Icon size={12} />
                    </div>

                    <div className="text-left">
                      <div className="font-medium">{step.label}</div>
                      <div className="opacity-75">{step.description}</div>
                    </div>

                    {isCompleted && <CheckCircle className="text-green-600" size={12} />}
                  </button>

                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 sm:w-24 h-0.5 mx-1 ${
                        isStepCompleteByKey(step.key) ? 'bg-green-300' : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Parties (optional whole step) */}
          {steps[activeIndex]?.key === 'parties' && (
            <PartiesStep
              formData={formData}
              onInputChange={handleInputChange}
              onSellerSelect={() => setShowSellerSelector(true)}
              onBuyerSelect={() => setShowBuyerSelector(true)}
              template={template}
              requiresBuyer={requiresBuyer}
              requiresSeller={requiresSeller}
            />
          )}

          {/* Property (optional whole step) */}
          {steps[activeIndex]?.key === 'property' && (
            <PropertyStep
              formData={formData}
              onInputChange={handleInputChange}
              onPropertySelect={() => setShowPropertySelector(true)}
              template={template}
              requiresProperty={requiresProperty}
              onContinue={() => handleNext()}
            />
          )}

          {/* Document (always) */}
          {steps[activeIndex]?.key === 'document' && (
            <DocumentStep
              formData={formData}
              onInputChange={handleInputChange}
              template={template}
              usedVariables={usedVariables}
              onVariableInsert={(name) => {
                alert(`Variable {{${name}}} inserted!`);
              }}
            />
          )}

          {/* Review (always) */}
          {steps[activeIndex]?.key === 'review' && (
            <ReviewStep
              formData={formData}
              template={template}
              onShowPayments={() => setShowPaymentTracker(true)}
              requiresBuyer={requiresBuyer}
              requiresSeller={requiresSeller}
              requiresProperty={requiresProperty}
            />
          )}

          {/* Final Preview (always) */}
          {steps[activeIndex]?.key === 'final' && (
            <FinalPreviewStep
              template={template}
              formData={formData}
              pageType={effectivePageType === 'Legal' ? 'Legal' : 'A4'}
            />
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white border-t border-gray-200 px-6 py-3 text-xs">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setActiveIndex((prev) => Math.max(prev - 1, 0))}
              disabled={activeIndex === 0 || navSaving}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={12} />
              <span>Previous</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="text-gray-500">
              Step {activeIndex + 1} of {steps.length} • {template.name}
              {formData.status ? ` • ${String(formData.status).toUpperCase()}` : ''}
              {navSaving ? ' • Saving…' : ''}
            </div>

            {activeIndex < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!isStepCompleteByKey(steps[activeIndex].key) || navSaving}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{navSaving ? 'Saving…' : 'Next'}</span>
                <ArrowLeft size={12} className="rotate-180" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGenerateDocument}
                disabled={isGenerating}
                className="flex items-center space-x-1.5 px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText size={12} />
                <span>{isGenerating ? 'Generating...' : 'Generate Document'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSellerSelector && (
        <ClientSelector
          title="Select Seller"
          mode="seller"
          onSelect={handleSellerSelect}
          onClose={() => setShowSellerSelector(false)}
        />
      )}
      {showBuyerSelector && (
        <ClientSelector
          title="Select Buyer"
          mode="buyer"
          onSelect={handleBuyerSelect}
          onClose={() => setShowBuyerSelector(false)}
        />
      )}
      {showPropertySelector && (
        <PropertySelector
          title="Select Property"
          sellerId={formData.seller?.id}
          prefetchedItems={sellerProperties}
          onSelect={handlePropertySelect}
          onClose={() => setShowPropertySelector(false)}
        />
      )}
      {showPaymentTracker && (
        <PaymentTrackerModal
          isOpen={showPaymentTracker}
          onClose={() => setShowPaymentTracker(false)}
          documentData={formData}
          onDataChange={handleInputChange}
        />
      )}
    </div>
  );
};

/* =================== Internal Step Components =================== */

type PartiesStepProps = {
  formData: Record<string, any>;
  onInputChange: (field: string, value: any) => void;
  onSellerSelect: () => void;
  onBuyerSelect: () => void;
  template: Template;
  requiresBuyer: boolean;
  requiresSeller: boolean;
};

const PartiesStep: React.FC<PartiesStepProps> = ({
  formData,
  onSellerSelect,
  onBuyerSelect,
  requiresBuyer,
  requiresSeller,
}) => {
  // Agar seller/buyer dono optional hote, yeh whole step UI kabhi call hi nahi hota (steps me add nahi hua)
  return (
    <div className="space-y-6 text-xs">
      <div>
        <h2 className="font-bold text-gray-900 mb-2">Select Parties</h2>
        <p className="text-gray-600">Choose the seller and buyer for this document</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seller (optional) */}
        {requiresSeller && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <User className="mr-2" size={16} />
              Seller Information <span className="ml-2 text-red-500">*</span>
            </h3>

            {formData.seller ? (
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="text-green-600" size={18} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="font-semibold text-gray-900">
                      {[formData?.seller?.salutation, formData?.seller?.name].filter(Boolean).join(' ')}
                    </div>

                    {formData?.seller?.phone ? (
                      <a href={`tel:${formData.seller.phone}`} className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
                        <Phone size={12} className="shrink-0 text-green-600" />
                        <span className="truncate">{formData.seller.phone}</span>
                      </a>
                    ) : null}

                    {formData?.seller?.email ? (
                      <a href={`mailto:${formData.seller.email}`} className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
                        <Mail size={12} className="shrink-0 text-blue-600" />
                        <span className="truncate">{formData.seller.email}</span>
                      </a>
                    ) : null}

                    {formData?.seller?.address || formData?.seller?.location ? (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin size={12} className="shrink-0 text-red-600" />
                        <span className="truncate">
                          {formData.seller.address || formData.seller.location}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onSellerSelect}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Change Seller
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onSellerSelect}
                className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <div className="text-center">
                  <User className="mx-auto text-gray-400 mb-2" size={24} />
                  <div className="font-medium text-gray-900">Select Seller</div>
                  <div className="text-gray-500">Choose from existing clients or add new</div>
                </div>
              </button>
            )}
          </div>
        )}

        {/* Buyer (optional) */}
        {requiresBuyer && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="mr-2" size={16} />
              Buyer Information <span className="ml-2 text-red-500">*</span>
            </h3>

            {formData.buyer ? (
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="text-green-600" size={18} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="font-semibold text-gray-900">
                      {[formData?.buyer?.salutation ?? formData?.salutation, formData?.buyer?.name]
                        .filter(Boolean)
                        .join(' ')}
                    </div>

                    {formData?.buyer?.phone ? (
                      <a href={`tel:${formData.buyer.phone}`} className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
                        <Phone size={12} className="shrink-0 text-green-600" />
                        <span className="truncate">{formData.buyer.phone}</span>
                      </a>
                    ) : null}

                    {formData?.buyer?.email ? (
                      <a href={`mailto:${formData.buyer.email}`} className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
                        <Mail size={12} className="shrink-0 text-blue-600" />
                        <span className="truncate">{formData.buyer.email}</span>
                      </a>
                    ) : null}

                    {formData?.buyer?.address || formData?.buyer?.location ? (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin size={12} className="shrink-0 text-red-600" />
                        <span className="truncate">
                          {formData.buyer.address || formData.buyer.location}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onBuyerSelect}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Change Buyer
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onBuyerSelect}
                className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                <div className="text-center">
                  <Users className="mx-auto text-gray-400 mb-2" size={24} />
                  <div className="font-medium text-gray-900">Select Buyer</div>
                  <div className="text-gray-500">Choose from existing clients or add new</div>
                </div>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

type PropertyStepProps = {
  formData: Record<string, any>;
  onInputChange: (field: string, value: any) => void;
  onPropertySelect: () => void;
  template: Template;
  requiresProperty: boolean;
  onContinue: () => void;
};

const PropertyStep: React.FC<PropertyStepProps> = ({
  formData,
  onInputChange,
  onPropertySelect,
  requiresProperty,
  onContinue
}) => {
  if (!requiresProperty) {
    // is step UI kabhi call nahi hota jab steps me add nahi hua ho – but safe guard:
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Building className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Property Not Required</h3>
          <p className="text-gray-500">This template doesn't require property information</p>
          <button
            type="button"
            onClick={onContinue}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue to Next Step
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Property Information</h2>
        <p className="text-gray-600">Select or enter property details for this document</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Building className="mr-2" size={20} />
          Property Details <span className="ml-2 text-red-500">*</span>
        </h3>

        {formData.property ? (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Building className="text-green-600" size={24} />
              </div>
              <div>
                <div className="font-semibold text-gray-900">{formData.property.title}</div>
                <div className="text-sm text-gray-600">{formData.property.address}</div>
                <div className="text-sm text-gray-600">
                  {formData.property.type} • {formData.property.area}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onPropertySelect}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Change Property
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onPropertySelect}
            className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all"
          >
            <div className="text-center">
              <Building className="mx-auto text-gray-400 mb-2" size={32} />
              <div className="font-medium text-gray-900">Select Property</div>
              <div className="text-sm text-gray-500">Choose from existing properties or add new</div>
            </div>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          Or Enter Property Details Manually
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Property Address
            </label>
            <textarea
              value={formData.property_address || ''}
              onChange={(e) => onInputChange('property_address', e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
              rows={2}
              placeholder="Enter complete property address"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Property Type</label>
            <select
              value={formData.property_type || ''}
              onChange={(e) => onInputChange('property_type', e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
            >
              <option value="">Select type</option>
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Commercial">Commercial</option>
              <option value="Plot">Plot</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">
              Property Area (sq ft)
            </label>
            <input
              type="number"
              value={formData.property_area || ''}
              onChange={(e) => onInputChange('property_area', e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
              placeholder="e.g., 1250"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Unit Number</label>
            <input
              type="text"
              value={formData.unit_number || ''}
              onChange={(e) => onInputChange('unit_number', e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
              placeholder="e.g., A-404"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

type DocumentStepProps = {
  formData: Record<string, any>;
  onInputChange: (field: string, value: any) => void;
  template: Template;
  usedVariables: string[];
  onVariableInsert: (name: string) => void;
};

const DocumentStep: React.FC<DocumentStepProps> = ({
  formData,
  onInputChange,
  template,
  usedVariables,
  onVariableInsert,
}) => {
  return (
    <div className="space-y-4 text-xs">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: form */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Document Information</h2>
            <p className="text-gray-600">Fill in the document details and financial information</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
              <FileText className="mr-2" size={16} />
              Document Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  Document Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => onInputChange('title', e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                  placeholder="Enter document title"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  Document ID
                </label>
                <input
                  type="text"
                  value={formData.document_id}
                  readOnly
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg bg-gray-50 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  Document Date
                </label>
                <input
                  type="date"
                  value={formData.document_date}
                  onChange={(e) => onInputChange('document_date', e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                />
              </div>
            </div>
          </div>

          {(template.variables.includes('sale_amount') ||
            template.variables.includes('token_amount') ||
            template.variables.includes('booking_amount')) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                <DollarSign className="mr-2" size={16} />
                Financial Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {template.variables.includes('sale_amount') && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      Sale Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.sale_amount || ''}
                      onChange={(e) => onInputChange('sale_amount', Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                      placeholder="25000000"
                    />
                  </div>
                )}

                {template.variables.includes('token_amount') && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      Token Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.token_amount || ''}
                      onChange={(e) => onInputChange('token_amount', Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                      placeholder="500000"
                    />
                  </div>
                )}

                {template.variables.includes('booking_amount') && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      Booking Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.booking_amount || ''}
                      onChange={(e) => onInputChange('booking_amount', Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                      placeholder="1000000"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {template.variables.includes('commission_rate') && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    value={formData.commission_rate || ''}
                    onChange={(e) => onInputChange('commission_rate', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                    placeholder="2"
                    step="0.1"
                  />
                </div>
              )}

              {template.variables.includes('validity_period') && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    Validity Period
                  </label>
                  <input
                    type="text"
                    value={formData.validity_period || ''}
                    onChange={(e) => onInputChange('validity_period', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                    placeholder="6 months"
                  />
                </div>
              )}

              {template.variables.includes('agreement_date') && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    Agreement Date
                  </label>
                  <input
                    type="date"
                    value={formData.agreement_date || ''}
                    onChange={(e) => onInputChange('agreement_date', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>
              )}

              {template.variables.includes('possession_date') && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    Possession Date
                  </label>
                  <input
                    type="date"
                    value={formData.possession_date || ''}
                    onChange={(e) => onInputChange('possession_date', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Variables Sidebar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-fit">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Variables</h3>
          </div>

          <label className="block text-xs font-medium text-gray-700 mb-1">
            Insert Placeholder
          </label>
          <select
            className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs bg-white"
            defaultValue=""
            onChange={(e) => {
              const name = e.target.value;
              if (!name) return;
              onVariableInsert(name);
              e.currentTarget.value = '';
            }}
          >
            <option value="" disabled>
              Select a variable
            </option>
            {usedVariables.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          <div className="mt-3 text-[11px] text-gray-500">
            Only variables used by this template are listed.
          </div>
        </div>
      </div>
    </div>
  );
};

type ReviewStepProps = {
  formData: Record<string, any>;
  template: Template;
  onShowPayments: () => void;
  requiresBuyer: boolean;
  requiresSeller: boolean;
  requiresProperty: boolean;
};

const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  template,
  onShowPayments,
  requiresBuyer,
  requiresSeller,
  requiresProperty
}) => {
  return (
    <div className="space-y-4 text-xs">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Review & Finalize</h2>
        <p className="text-gray-600">Review all information before generating the document</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 pt-1">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Document Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Document Information</h4>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-600">Template:</span>
                <span className="font-medium">{template.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Title:</span>
                <span className="font-medium">{formData.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Document ID:</span>
                <span className="font-medium">{formData.document_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{formData.document_date}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Parties Information</h4>
            <div className="space-y-1.5">
              {requiresSeller && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Seller:</span>
                  <span className="font-medium">{formData.seller?.name || '-'}</span>
                </div>
              )}
              {requiresBuyer && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Buyer:</span>
                  <span className="font-medium">{formData.buyer?.name || '-'}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Executive:</span>
                <span className="font-medium">{formData.sales_executive}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {requiresProperty && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 pt-1">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Property Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <span className="text-gray-600">Address:</span>
              <div className="font-medium">{formData.property_address || '-'}</div>
            </div>
            <div>
              <span className="text-gray-600">Type:</span>
              <div className="font-medium">{formData.property_type || '-'}</div>
            </div>
            <div>
              <span className="text-gray-600">Area:</span>
              <div className="font-medium">
                {formData.property_area ? `${formData.property_area} sq ft` : '-'}
              </div>
            </div>
          </div>
        </div>
      )}

      {(formData.sale_amount || formData.token_amount || formData.booking_amount) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 pt-1 ">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">Financial Summary</h3>
            <button
              type="button"
              onClick={onShowPayments}
              className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
            >
              <CreditCard size={14} />
              <span>Payment Tracking</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {formData.sale_amount && (
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  ₹{(Number(formData.sale_amount) / 100000).toFixed(1)}L
                </div>
                <div className="text-xs text-green-700">Sale Amount</div>
              </div>
            )}

            {formData.token_amount && (
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  ₹{(Number(formData.token_amount) / 100000).toFixed(1)}L
                </div>
                <div className="text-xs text-blue-700">Token Amount</div>
              </div>
            )}

            {formData.booking_amount && (
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  ₹{(Number(formData.booking_amount) / 100000).toFixed(1)}L
                </div>
                <div className="text-xs text-purple-700">Booking Amount</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 pt-1">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Pre-Generation Checklist</h3>
        <div className="space-y-2">
          {requiresSeller && (
            <div className="flex items-center space-x-2">
              {formData.seller ? (
                <CheckCircle className="text-green-600" size={16} />
              ) : (
                <AlertCircle className="text-red-600" size={16} />
              )}
              <span className={formData.seller ? 'text-green-700' : 'text-red-700'}>
                Seller information is complete
              </span>
            </div>
          )}

          {requiresBuyer && (
            <div className="flex items-center space-x-2">
              {formData.buyer ? (
                <CheckCircle className="text-green-600" size={16} />
              ) : (
                <AlertCircle className="text-red-600" size={16} />
              )}
              <span className={formData.buyer ? 'text-green-700' : 'text-red-700'}>
                Buyer information is complete
              </span>
            </div>
          )}

          {requiresProperty && (
            <div className="flex items-center space-x-2">
              {formData.property_address || formData.property ? (
                <CheckCircle className="text-green-600" size={16} />
              ) : (
                <AlertCircle className="text-red-600" size={16} />
              )}
              <span className={formData.property_address || formData.property ? 'text-green-700' : 'text-red-700'}>
                Property information is complete
              </span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            {formData.title && formData.document_date ? (
              <CheckCircle className="text-green-600" size={16} />
            ) : (
              <AlertCircle className="text-red-600" size={16} />
            )}
            <span className={formData.title && formData.document_date ? 'text-green-700' : 'text-red-700'}>
              Document details are complete
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FinalPreviewStep: React.FC<{
  template: Template;
  formData: Record<string, any>;
  pageType: 'A4' | 'Legal';
}> = ({ template, formData, pageType }) => {
  const resolvedVars = useMemo(
    () => resolveVariablesStrict(template, formData),
    [template, formData]
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
        <Eye className="mr-2" size={16} />
        Final Preview
      </h3>
      <DocumentPreview
        template={template}
        documentData={{ ...formData, ...resolvedVars }}
        isVisible={true}
        pageType={pageType}
      />
    </div>
  );
};

/* Payment Tracker Modal (simple wrapper) */
type PaymentTrackerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  documentData: Record<string, any>;
  onDataChange: (field: string, value: any) => void;
};

const PaymentTrackerModal: React.FC<PaymentTrackerModalProps> = ({
  isOpen,
  onClose,
  documentData,
  onDataChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Payment Tracking</h3>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded"
              aria-label="Close payment tracker"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <PaymentTracker documentData={documentData} onDataChange={onDataChange} />
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentForm;
