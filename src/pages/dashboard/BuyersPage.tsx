import React, { useEffect, useRef, useState } from 'react';
import {
  Users, Plus, Search, Filter, Eye, Edit, Trash2, Phone, Mail, MapPin,
  Building, Activity, MoreHorizontal, User, Star, FileText, MessageCircle,
  Bell, Upload, Download, ChevronLeft, ChevronRight, X, Target, Home,
  UserCheck, PhoneCall, Send,
  Briefcase,
  TrendingUp,
} from 'lucide-react';
import BuyerFormModal from '../../components/buyers/BuyerFormModal';
import BuyerViewPage from '../../components/buyers/BuyerViewPage';
import BuyerAccountPage from '../../components/buyers/BuyerAccountPage';
import ImportBuyersLeadsModal from '../../components/buyers/ImportBuyersLeadsModal';
import { buyerAPI } from '@/lib/buyerAPI';
import BuyerSidebarFilter from './components/BuyerSidebarFilter';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import TableLoader from '@/components/ui/TableLoader';
import { usersAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { getAssignableExecutives } from '@/utils/roleBasedOptions';
import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
import { propertiesAPI } from '@/lib/propertiesAPI';

type Executive = {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  username?: string;
};

type UIBuyer = {
  id: number | string;
  salutation: string | null;
  name: string | null;
  phone: string | null;
  dob: string | null;
  whatsapp: string | null;
  email: string | null;
  state: string | null;
  city: string | null;
  location: string | null;
  source: string | null;
  priority: 'high' | 'medium' | 'low' | string | null;
  stage: string | null;
  status: string | null;
  assigned: string | null;
  assigned_executive?: string | number | null;
  assigned_executive_name?: string | null;
  assigned_executive_email?: string | null;
  assigned_executive_phone?: string | null;
  leadScore: number;
  is_active: boolean | null;
  budget: { min: number | null; max: number | null };
  expectedClose: string | null;
  requirements: {
    propertyType?: string | null;
    unitType?: string | null;
    unitTypes?: string[] | null;
    preferredLocations?: string[] | null;
    amenities?: string[] | null;
    furnishing?: string | null;
    possession?: string | null;
    facing?: string | null;
    floor?: string | null;
    specialRequirements?: string | null;
  };
  financials: {
    loanRequired?: boolean | null;
    loanAmount?: number | null;
    downPayment?: number | null;
    monthlyIncome?: number | null;
    bankPreference?: string | null;
    loanStatus?: string | null;
    creditScore?: number | null;
  };
  matchedProperties: any[];
  matchedPropertiesCount?: number; // NEW: For showing match count
  activities: any[];
  followups: any[];
  documents: any[];
  visits: number;
  totalVisits: number;
  lastActivity: string | null;
  created_at: string | null;
  notifications: number;
  currentStage: string | null;
  stageProgress: number;
  dealPotential: string | null;
  responseRate: number;
  avgResponseTime: string | null;
};

const BuyersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth() as any;

  /* ---------------- UI state ---------------- */
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuyers, setSelectedBuyers] = useState<Array<number | string>>([]);
  const [showBuyerForm, setShowBuyerForm] = useState(false);
  const [currentBuyerView, setCurrentBuyerView] = useState<UIBuyer | null>(null);
  const [currentBuyerAccount, setCurrentBuyerAccount] = useState<UIBuyer | null>(null);
  const [showImportBuyers, setShowImportBuyers] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<UIBuyer | null>(null);
  const [currentBuyerIndex, setCurrentBuyerIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]); // NEW: For property matching
  const [loadingProperties, setLoadingProperties] = useState(false); // NEW: Loading state for properties

  // Executive state
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [execsLoading, setExecsLoading] = useState<boolean>(false);
  const [execDropdownOpen, setExecDropdownOpen] = useState<boolean>(false);
  const [execSearch, setExecSearch] = useState<string>('');
  const [selectedExecId, setSelectedExecId] = useState<string | number | null>(null);

  // for reliable scroll-to-top after create/update
  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  /* ---------------- Filters ---------------- */
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    ignoreDate: false,
    source: 'all',
    stage: 'all',
    priority: 'all',
    assigned: 'all',
    assigned_executive: 'all',
    status: 'all',
    budgetRange: 'all',
    propertyType: 'all',
  });

  /* ---------------- Data ---------------- */
  const [buyers, setBuyers] = useState<UIBuyer[]>([]);

  /* ===================== Property Matching Logic ===================== */
  
  // Fetch properties for matching
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoadingProperties(true);
        const res = await propertiesAPI.getProperties();
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        
        // Filter only public properties
        const publicProperties = list.filter((property: any) => 
          property.is_public === true || 
          property.is_public === 1 || 
          property.isPublic === true ||
          property.public === true
        );
        
        setProperties(publicProperties ?? []);
      } catch (err) {
        console.error("Error fetching properties:", err);
        setProperties([]);
      } finally {
        setLoadingProperties(false);
      }
    };

    fetchProperties();
  }, []);

  // Property matching helper functions
  const toArr = (v: any) => (Array.isArray(v) ? v.filter(Boolean) : v ? [v] : []);
  const norm = (s: any) => String(s || "").toLowerCase().trim();
  const hasAny = (haystack: string[], needles: string[]) =>
    needles.some((n) => haystack.some((h) => h.includes(n)));

const getBuyerBudget = (buyer: UIBuyer) => {
  const rawMin = Number(buyer?.budget?.min ?? 0);
  const rawMax = Number(buyer?.budget?.max ?? 0);

  // treat 0/NaN as "not provided"
  const min = Number.isFinite(rawMin) && rawMin > 0 ? rawMin : null;
  const max = Number.isFinite(rawMax) && rawMax > 0 ? rawMax : null;

  return { min, max };
};


 const priceFrom = (p: any) =>
  Number(p?.budget ?? p?.price ?? p?.expected_price ?? 0);

const priceRangeFrom = (p: any) => {
  const min = Number(p?.min_price ?? p?.budget_min ?? p?.minBudget ?? 0);
  const max = Number(p?.max_price ?? p?.budget_max ?? p?.maxBudget ?? 0);
  return { min, max };
};

const isWithinBuyerBudget = (p: any, buyer: UIBuyer) => {
  const { min: bMin, max: bMax } = getBuyerBudget(buyer);
  const hasMin = bMin != null;
  const hasMax = bMax != null;

  // ⛔ If buyer provided no budget, do NOT auto-pass everything.
  // Choose ONE behavior:

  // (A) Strict: require a budget to match on budget filter:
  if (!hasMin && !hasMax) return false;

  // ---- OR ----
  // (B) Soft fallback: if no budget, use a minimum match score instead:
  // if (!hasMin && !hasMax) return computeMatchScore(p, buyer) >= 50;

  const { min: pMin, max: pMax } = priceRangeFrom(p);
  const hasRange = !!pMin && !!pMax && pMax >= pMin;

  if (hasRange) {
    const left = hasMin ? (bMin as number) : Number.NEGATIVE_INFINITY;
    const right = hasMax ? (bMax as number) : Number.POSITIVE_INFINITY;
    return Math.max(pMin, left) <= Math.min(pMax, right);
  }

  const price = priceFrom(p);
  if (!price) return false;
  if (hasMin && price < (bMin as number)) return false;
  if (hasMax && price > (bMax as number)) return false;
  return true;
};

 

  // Count matching properties for a buyer
const countMatchingProperties = (buyer: UIBuyer) => {
  if (!properties.length) return 0;

  const matchingProperties = properties.filter((property) => {
    // same rule as PropertiesTab: must be within the buyer's budget
    return isWithinBuyerBudget(property, buyer);
  });

  return matchingProperties.length;
};

  // Update buyers with match counts when properties are loaded
 useEffect(() => {
  if (!properties.length || !buyers.length) return;

  setBuyers(prev => prev.map(b => ({
    ...b,
    matchedPropertiesCount: countMatchingProperties(b),
  })));
}, [properties, buyers]); // <-- depend on buyers (not buyers.length)


  /* ===================== Masters: fetch + normalize ===================== */
  const [masterLoading, setMasterLoading] = useState(true);
  const [masters, setMasters] = useState<Record<string, any>>({});

  /** "Lead Stage" -> "lead_stage" ; "buyer lead stage" -> "buyer_lead_stage" */
  const normKey = (s: any) =>
    String(s ?? '')
      .trim()
      .toLowerCase()
      .replace(/[^\w]+/g, '_');

  const normalizeMasterKeys = (obj: any) => {
    const out: Record<string, any> = {};
    Object.entries(obj || {}).forEach(([k, v]) => {
      out[normKey(k)] = v;
    });
    return out;
  };

  /** returns first non-empty array among the possible keys */
  const getMasterArray = (mastersObj: Record<string, any>, possibleKeys: string[]): any[] => {
    for (const key of possibleKeys) {
      const k = normKey(key);
      if (Array.isArray(mastersObj?.[k]) && mastersObj[k].length) {
        return mastersObj[k];
      }
    }
    return [];
  };

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        setMasterLoading(true);
        const data = await getMasterDropdownOptions(['lead', 'buyer']);
        const normalized = normalizeMasterKeys(data);
        setMasters(normalized);
      } catch (err) {
        console.error('Error fetching master options:', err);
        toast.error('Failed to load dropdown options');
      } finally {
        setMasterLoading(false);
      }
    };

    fetchMasters();
  }, []);

  /* ================= Derived Options from Masters ================= */
  const toOptionLabel = (o: any) =>
    (o?.label ?? o?.name ?? o?.title ?? o?.value ?? o?.key ?? '').toString();

  const toOptionValue = (o: any) =>
    (o?.value ?? o?.key ?? o?.code ?? o?.name ?? '').toString();

  // prefer buyer-specific; fallback to generic lead
  const stageRaw = getMasterArray(masters, [
    'buyer_lead_stage',
    'buyer stage',
  ]);

  const priorityRaw = getMasterArray(masters, [
    'lead_priority',
    'lead priority',
  ]);

  const stageOptions = stageRaw
    .map((o) => ({ value: toOptionValue(o), label: toOptionLabel(o) }))
    .filter((o) => o.value);

  const priorityOptions = priorityRaw
    .map((o) => ({ value: toOptionValue(o).toLowerCase(), label: toOptionLabel(o) }))
    .filter((o) => o.value);

  /** safe fallbacks if masters missing */
  const stageOptionsFallback = [
    { value: 'initial_contact', label: 'Initial Contact' },
    { value: 'requirement_gathering', label: 'Requirement Gathering' },
    { value: 'property_hunting', label: 'Property Hunting' },
    { value: 'loan_processing', label: 'Loan Processing' },
    { value: 'property_finalization', label: 'Property Finalization' },
    { value: 'deal_closure', label: 'Deal Closure' },
    { value: 'completed', label: 'Completed' },
  ];

  const priorityOptionsFallback = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  /** Use masters if present, else fallback */
  const effectiveStageOptions = (stageOptions?.length ? stageOptions : stageOptionsFallback);
  const effectivePriorityOptions = (priorityOptions?.length ? priorityOptions : priorityOptionsFallback);

  // convenience arrays for the Filters drawer (strings)
  const stagesFromMasters: string[] = ['all', ...effectiveStageOptions.map(o => o.value)];
  const prioritiesFromMasters: string[] = ['all', ...effectivePriorityOptions.map(o => o.value)];

  /* ---------------- Load Executives ---------------- */
  useEffect(() => {
    const loadExecutives = async () => {
      try {
        setExecsLoading(true);

        // Helper to format name with salutation
        const formatName = (u: any) => {
          const salutation = u?.salutation ? `${u.salutation} ` : '';
          const firstName = u?.first_name || '';
          const lastName = u?.last_name || '';
          const usernameFallback = u?.username || u?.email || 'Executive';
          const name = `${salutation}${firstName} ${lastName}`.trim();
          return name || usernameFallback;
        };

        // Fetch executives
        const get = async (department: string) =>
          usersAPI.getByDeptRole?.({ department, role: 'executive', is_active: 1, limit: 100 });

        let res: any;
        try { res = await get('sales'); }
        catch { res = await get('sales'); }

        const salesUsers = (res?.items ?? res?.data ?? res ?? []).map((u: any) => ({
          ...u,
          id: u.id ?? u.userId ?? u._id ?? u.uuid ?? String(u.email || u.username || Math.random()),
          name: formatName(u),
          email: u.email || null,
          phone: u.phone || u.mobile || null,
        }));

        const allowed = getAssignableExecutives(user, salesUsers) || [];
        const mapped: Executive[] = allowed.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          username: u.raw?.username || u.username,
        }));

        setExecutives(mapped);
      } catch (e) {
        console.error('Error loading executives:', e);
        toast.error('Could not fetch executives');
      } finally {
        setExecsLoading(false);
      }
    };

    loadExecutives();
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setExecDropdownOpen(false);
      }
    }
    if (execDropdownOpen) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [execDropdownOpen]);

  const filteredExecutives = executives.filter(exec =>
    exec.name.toLowerCase().includes(execSearch.toLowerCase()) ||
    exec.email?.toLowerCase().includes(execSearch.toLowerCase()) ||
    exec.username?.toLowerCase().includes(execSearch.toLowerCase())
  );

  /* ---------------- Helpers ---------------- */
  const formatDate = (val: string | null) => {
    if (!val) return ' - ';
    const d = new Date(val);
    if (isNaN(d.getTime())) return ' - ';
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' });
  };

  const toMySQLDate = (val: any) => {
    if (!val) return null;
    const d = new Date(val);
    if (isNaN(d.getTime())) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formatDOB = (val: string | null) => {
    if (!val) return ' - ';
    const d = new Date(val);
    if (isNaN(d.getTime())) return ' - ';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const parseJSON = (val: any) => {
    if (!val) return null;
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return null;
      }
    }
    if (typeof val === 'object') return val;
    return null;
  };

  const toNumOrNull = (v: any): number | null => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const key = (v: any) => String(v ?? '').trim().toLowerCase();
  const stageKey = (v: any) => key(v).replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  const priorityKey = (v: any) => key(v);

  // Normalize buyer object for API
  const normalizeBuyerForAPI = (b: any) => {
    const rawReq = parseJSON(b.requirements) || b.requirements || {};
    const fin = parseJSON(b.financials) || b.financials || {};

    return {
      salutation: b.salutation ?? null,
      name: b.name ?? null,
      phone: b.phone ?? b.mobile ?? null,
      whatsapp_number: b.whatsapp ?? b.whatsapp_number ?? null,
      email: b.email ?? null,
      dob: toMySQLDate(b.dob ?? null),
      state: b.state ?? null,
      city: b.city ?? null,
      location: b.location ?? null,
      buyer_lead_source: b.source ?? b.buyer_lead_source ?? null,
      buyer_lead_priority: b.priority ?? b.buyer_lead_priority ?? null,
      is_active: b.is_active !== undefined ? Boolean(b.is_active) : true,
      buyer_lead_stage: b.stage ?? b.buyer_lead_stage ?? null,
      buyer_lead_status: b.status ?? b.buyer_lead_status ?? null,
      assigned_to: b.assigned ?? b.assigned_to ?? null,
      assigned_executive: b.assigned_executive ?? null,
      lead_score: toNumOrNull(b.leadScore) ?? toNumOrNull(b.lead_score) ?? 0,
      budget_min: b.budget?.min ?? b.budget_min ?? null,
      budget_max: b.budget?.max ?? b.budget_max ?? null,
      expected_close: toMySQLDate(b.expectedClose ?? b.expected_close ?? null),
      requirements: {
        propertyType: rawReq.propertyType ?? rawReq.property_type ?? null,
        unitTypes: Array.isArray(rawReq.unitTypes ?? rawReq.unit_types)
          ? (rawReq.unitTypes ?? rawReq.unit_types)
          : null,
        preferredLocations: Array.isArray(rawReq.preferredLocations ?? rawReq.preferred_locations)
          ? (rawReq.preferredLocations ?? rawReq.preferred_locations)
          : null,
        amenities: Array.isArray(rawReq.amenities) ? rawReq.amenities : null,
        furnishing: rawReq.furnishing ?? null,
        possession: rawReq.possession ?? null,
        facing: rawReq.facing ?? null,
        floor: rawReq.floor ?? null,
        specialRequirements: rawReq.specialRequirements ?? rawReq.special_requirements ?? null,
      },
      financials: {
        loanRequired: fin.loanRequired ?? fin.loan_required ?? null,
        loanAmount: toNumOrNull(fin.loanAmount ?? fin.loan_amount),
        downPayment: toNumOrNull(fin.downPayment ?? fin.down_payment),
        monthlyIncome: toNumOrNull(fin.monthlyIncome ?? fin.monthly_income),
        bankPreference: fin.bankPreference ?? fin.bank_preference ?? null,
        loanStatus: fin.loanStatus ?? fin.loan_status ?? null,
        creditScore: toNumOrNull(fin.creditScore ?? fin.credit_score),
      }
    };
  };

  // Normalize buyer object for UI
  const normalizeBuyerForUI = (b: any) => {
    const rawReq = parseJSON(b.requirements) || b.requirements || {};
    const fin = parseJSON(b.financials) || b.financials || {};
    const toStr = (v: any) => (v === null || v === undefined ? null : String(v));

    // Ensure budget
    const budgetMin = toNumOrNull(b.budget_min ?? b.budgetMin);
    const budgetMax = toNumOrNull(b.budget_max ?? b.budgetMax);

    // Convert dates to MySQL-safe format
    const dob = toMySQLDate(b.dob ?? null);
    const expectedClose = toMySQLDate(b.expected_close ?? b.expectedClose ?? null);
    const createdAt = toMySQLDate(b.created_at ?? null);

    // Get executive details
    const assignedExecutiveId = b.assigned_executive ?? null;
    const assignedExecutive = executives.find(exec => exec.id == assignedExecutiveId);
    const assignedExecutiveName = assignedExecutive?.name || null;
    const assignedExecutiveEmail = assignedExecutive?.email || null;
    const assignedExecutivePhone = assignedExecutive?.phone || null;

    return {
      id: b.id ?? `${b.name ?? 'buyer'}-${Math.random().toString(36).slice(2)}`,
      salutation: b.salutation ?? null,
      name: b.name ?? null,
      phone: b.phone ?? b.mobile ?? null,
      whatsapp: b.whatsapp_number ?? b.whatsapp ?? null,
      email: b.email ?? null,
      dob,
      state: b.state ?? null,
      city: b.city ?? null,
      location: b.location ?? null,
      source: b.buyer_lead_source ?? b.source ?? null,
      priority: (b.buyer_lead_priority ?? b.priority ?? null)?.toString().trim().toLowerCase() ?? null,
      is_active: b.is_active !== undefined ? Boolean(b.is_active) : true,
      stage: b.buyer_lead_stage ?? b.stage ?? null,
      status: b.buyer_lead_status ?? b.status ?? null,
      assigned: b.assigned_to ?? b.assigned ?? null,
      assigned_executive: assignedExecutiveId,
      assigned_executive_name: assignedExecutiveName,
      assigned_executive_email: assignedExecutiveEmail,
      assigned_executive_phone: assignedExecutivePhone,
      leadScore: toNumOrNull(b.lead_score) ?? toNumOrNull(b.leadScore) ?? 0,
      budget: { min: budgetMin, max: budgetMax },
      expectedClose,
      requirements: {
        propertyType: toStr(rawReq.propertyType ?? rawReq.property_type ?? b.propertyType ?? b.property_type ?? null),
        unitTypes: Array.isArray(rawReq.unitTypes ?? rawReq.unit_types)
          ? (rawReq.unitTypes ?? rawReq.unit_types).map(toStr)
          : null,
        preferredLocations: Array.isArray(rawReq.preferredLocations ?? rawReq.preferred_locations)
          ? (rawReq.preferredLocations ?? rawReq.preferred_locations).map(toStr)
          : null,
        amenities: Array.isArray(rawReq.amenities) ? rawReq.amenities.map(toStr) : null,
        furnishing: toStr(rawReq.furnishing),
        possession: toStr(rawReq.possession),
        facing: toStr(rawReq.facing),
        floor: toStr(rawReq.floor),
        specialRequirements: rawReq.specialRequirements ?? rawReq.special_requirements ?? null,
      },
      financials: {
        loanRequired: fin.loanRequired ?? fin.loan_required ?? null,
        loanAmount: toNumOrNull(fin.loanAmount ?? fin.loan_amount),
        downPayment: toNumOrNull(fin.downPayment ?? fin.down_payment),
        monthlyIncome: toNumOrNull(fin.monthlyIncome ?? fin.monthly_income),
        bankPreference: fin.bankPreference ?? fin.bank_preference ?? null,
        loanStatus: fin.loanStatus ?? fin.loan_status ?? null,
        creditScore: toNumOrNull(fin.creditScore ?? fin.credit_score),
      },
      matchedProperties: Array.isArray(b.matchedProperties) ? b.matchedProperties : [],
      matchedPropertiesCount: b.matchedPropertiesCount ?? 0, // NEW: Initialize match count
      activities: Array.isArray(b.activities) ? b.activities : [],
      followups: Array.isArray(b.followups) ? b.followups : [],
      documents: Array.isArray(b.documents) ? b.documents : [],
      visits: toNumOrNull(b.visits) ?? 0,
      totalVisits: toNumOrNull(b.totalVisits) ?? 0,
      lastActivity: b.lastActivity ?? b.updated_at ?? null,
      created_at: createdAt || new Date().toISOString(),
      notifications: toNumOrNull(b.notifications) ?? 0,
      currentStage: b.currentStage ?? (b.buyer_lead_stage ?? b.stage ?? null),
      stageProgress: toNumOrNull(b.stageProgress) ?? 0,
      dealPotential: b.dealPotential ?? null,
      responseRate: toNumOrNull(b.responseRate) ?? 0,
      avgResponseTime: b.avgResponseTime ?? null,
    };
  };

  /* ---------------- Fetch ---------------- */
  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        setLoading(true);
        const apiBuyers = await buyerAPI.getAll();
        const normalized = Array.isArray(apiBuyers) ? apiBuyers.map(normalizeBuyerForUI) : [];

        // Proper sorting - नए records पहले दिखें
        const sorted = [...normalized].sort((a, b) => {
          // पहले created_at से sort
          const aCreated = new Date(a.created_at || 0).getTime();
          const bCreated = new Date(b.created_at || 0).getTime();

          if (aCreated !== bCreated) {
            return bCreated - aCreated; // DESC - newest first
          }

          // फिर ID से sort (backup)
          return Number(b.id) - Number(a.id);
        });

        setBuyers(sorted);
      } catch (err) {
        console.error('Error fetching buyers:', err);
        toast.error('Failed to fetch buyers');
        setBuyers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBuyers();
  }, [executives]);

  /* ---------------- Tabs, Constants ---------------- */
  const tabs = [
    { id: 'all', label: 'All', count: buyers.length, color: 'blue' },
    {
      id: 'hot_leads', label: 'Hot Leads',
      count: buyers.filter(b => priorityKey(b.priority) === 'high').length, color: 'red'
    },
    {
      id: 'active', label: 'Active',
      count: buyers.filter(b => b.is_active === true).length, color: 'green'
    },
    {
      id: 'property_hunting', label: 'Property Hunting',
      count: buyers.filter(b => stageKey(b.stage) === 'property_hunting').length, color: 'purple'
    },
    {
      id: 'loan_processing', label: 'Loan Processing',
      count: buyers.filter(b => stageKey(b.stage) === 'loan_processing').length, color: 'orange'
    },
    {
      id: 'ready_to_buy', label: 'Ready to Buy',
      count: buyers.filter(b => stageKey(b.stage) === 'property_finalization').length, color: 'indigo'
    }
  ];

  // static lists only for sources/budget/propertyTypes
  const sources = ['all', 'Website', 'Referral', 'Social Media', 'Advertisement', 'Walk-in', 'Cold Call'];
  const budgetRanges = ['all', '0-50L', '50L-1Cr', '1Cr-2Cr', '2Cr-5Cr', '5Cr+'];
  const propertyTypes = ['all', 'Residential', 'Commercial'];

  const safeStr = (v: any) => (v === null || v === undefined || v === '') ? ' - ' : String(v);

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return ' - ';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  /* ---------------- Filtered & Paginated ---------------- */
  const filteredBuyers = buyers.filter(buyer => {
    const s = searchTerm.toLowerCase();

    const matchesSearch =
      (buyer.name ?? '').toLowerCase().includes(s) ||
      (buyer.phone ?? '').includes(searchTerm) ||
      (buyer.email ?? '').toLowerCase().includes(s) ||
      (buyer.location ?? '').toLowerCase().includes(s) ||
      (buyer.assigned_executive_name ?? '').toLowerCase().includes(s);

    const stg = stageKey(buyer.stage);
    const pri = priorityKey(buyer.priority);

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'hot_leads' && pri === 'high') ||
      (activeTab === 'active' && buyer.is_active === true) ||
      (activeTab === 'property_hunting' && stg === 'property_hunting') ||
      (activeTab === 'loan_processing' && stg === 'loan_processing') ||
      (activeTab === 'ready_to_buy' && stg === 'property_finalization');

    const matchesFilters =
      (filters.source === 'all' || key(buyer.source) === key(filters.source)) &&
      (filters.stage === 'all' || stg === filters.stage) &&
      (filters.priority === 'all' || pri === filters.priority) &&
      (filters.assigned === 'all' || key(buyer.assigned) === key(filters.assigned)) &&
      (filters.assigned_executive === 'all' || key(buyer.assigned_executive) === key(filters.assigned_executive)) &&
      (filters.status === 'all' || key(buyer.status) === key(filters.status)) &&
      (filters.propertyType === 'all' || key(buyer.requirements?.propertyType) === key(filters.propertyType));

    const created = buyer.created_at ? new Date(buyer.created_at) : null;
    const fromOk = !filters.dateFrom || (created && created >= new Date(filters.dateFrom));
    const toOk = !filters.dateTo || (created && created <= new Date(filters.dateTo));
    const matchesDate = filters.ignoreDate || (fromOk && toOk);

    return matchesSearch && matchesTab && matchesFilters && matchesDate;
  });

  const filteredSortedBuyers = [...filteredBuyers].sort((a, b) => {
    // सबसे पहले created_at से sort करें
    const aCreated = new Date(a.created_at || 0).getTime();
    const bCreated = new Date(b.created_at || 0).getTime();

    // अगर created_at same है तो lastActivity से sort करें
    if (aCreated !== bCreated) {
      return bCreated - aCreated; // नए से पुराने
    }

    const aLastActivity = new Date(a.lastActivity || 0).getTime();
    const bLastActivity = new Date(b.lastActivity || 0).getTime();
    return bLastActivity - aLastActivity;
  });

  const totalPages = Math.max(1, Math.ceil(filteredSortedBuyers.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBuyers = filteredSortedBuyers.slice(startIndex, startIndex + itemsPerPage);

  /* ---------------- Actions ---------------- */
  const handleAddBuyer = () => {
    setEditingBuyer(null);
    setShowBuyerForm(true);
  };

  const handleEditBuyer = (buyer: UIBuyer) => {
    setEditingBuyer(buyer);
    setShowBuyerForm(true);
  };

  const handleViewBuyer = (buyer: UIBuyer) => {
    const index = filteredSortedBuyers.findIndex(b => b.id === buyer.id);
    setCurrentBuyerIndex(index >= 0 ? index : 0);
    setCurrentBuyerView(buyer);
  };

  const handleBuyerAccount = (buyer: UIBuyer) => {
    navigate(`/dashboard/buyers-account/${buyer.id}`);
  };

  const handleBackToList = () => {
    setCurrentBuyerView(null);
    setCurrentBuyerIndex(0);
    setShowBuyerForm(false);
  };

  const handleDeleteBuyer = async (buyerId: number | string) => {
    if (!window.confirm('Are you sure you want to delete this buyer?')) return;
    try {
      await buyerAPI.delete(String(buyerId));
      setBuyers(prev => prev.filter(b => b.id !== buyerId));
      toast.success('Buyer deleted successfully');
    } catch (err) {
      console.error('Error deleting buyer:', err);
      toast.error('Failed to delete buyer. Please try again.');
    }
  };

  /* ---------------- Save Buyer ---------------- */
  const handleSaveBuyer = async (buyerData: any) => {
    const apiData = normalizeBuyerForAPI(buyerData);

    try {
      let savedBuyer;
      if (editingBuyer) {
        // UPDATE - सिर्फ update करें, sorting नहीं
        savedBuyer = await buyerAPI.update(String(editingBuyer.id), apiData);
        const normalized = normalizeBuyerForUI(savedBuyer);
        // Update match count for the updated buyer
        const updatedWithMatchCount = {
          ...normalized,
          matchedPropertiesCount: countMatchingProperties(normalized)
        };
        setBuyers(prev =>
          prev.map(b => b.id === editingBuyer.id ? { ...updatedWithMatchCount, id: editingBuyer.id } : b)
        );
      } else {
        // CREATE - नया record सबसे ऊपर जोड़ें
        savedBuyer = await buyerAPI.create(apiData);
        const normalized = normalizeBuyerForUI(savedBuyer);
        // Calculate match count for new buyer
        const newWithMatchCount = {
          ...normalized,
          matchedPropertiesCount: countMatchingProperties(normalized)
        };
        setBuyers(prev => [{ ...newWithMatchCount }, ...prev]);
      }

      setShowBuyerForm(false);
      setEditingBuyer(null);
      setCurrentPage(1);
      setTimeout(() => tableScrollRef.current?.scrollTo(0, 0), 0);
      toast.success(editingBuyer ? 'Buyer updated successfully' : 'Buyer created successfully');
    } catch (err) {
      console.error('Error saving buyer:', err);
      toast.error('Failed to save buyer. Please check the data and try again.');
    }
  };

  const handleBuyerSelection = (buyerId: number | string) => {
    setSelectedBuyers(prev =>
      prev.includes(buyerId) ? prev.filter(id => id !== buyerId) : [...prev, buyerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBuyers.length === paginatedBuyers.length && paginatedBuyers.length > 0) setSelectedBuyers([]);
    else setSelectedBuyers(paginatedBuyers.map(b => b.id));
  };

  const handleNextBuyer = () => {
    if (currentBuyerIndex < filteredSortedBuyers.length - 1) {
      const nextIndex = currentBuyerIndex + 1;
      setCurrentBuyerIndex(nextIndex);
      setCurrentBuyerView(filteredSortedBuyers[nextIndex]);
    }
  };

  const handlePreviousBuyer = () => {
    if (currentBuyerIndex > 0) {
      const prevIndex = currentBuyerIndex - 1;
      setCurrentBuyerIndex(prevIndex);
      setCurrentBuyerView(filteredSortedBuyers[prevIndex]);
    }
  };

  /* ---------------- Executive Assignment ---------------- */
  const handleAssignExecutive = async (executiveId: string | number | null) => {
    if (selectedBuyers.length === 0) {
      toast.info('Please select buyers to assign executive');
      return;
    }

    try {
      const buyerIds = selectedBuyers.map(id => String(id));
      await buyerAPI.bulkAssignExecutive(buyerIds, executiveId, false);

      // Update local state
      const executive = executives.find(exec => exec.id == executiveId);
      setBuyers(prev => prev.map(buyer =>
        selectedBuyers.includes(buyer.id)
          ? {
            ...buyer,
            assigned_executive: executiveId,
            assigned_executive_name: executive?.name || null,
            assigned_executive_email: executive?.email || null,
            assigned_executive_phone: executive?.phone || null
          }
          : buyer
      ));

      setSelectedBuyers([]);
      setSelectedExecId(null);
      setExecDropdownOpen(false);
      toast.success(`Executive assigned to ${selectedBuyers.length} buyer(s) successfully`);
    } catch (err) {
      console.error('Error assigning executive:', err);
      toast.error('Failed to assign executive');
    }
  };

  /* ---------------- Bulk Delete ---------------- */
  const handleBulkDelete = () => {
    if (selectedBuyers.length === 0) {
      toast.info('⚠️ No buyers selected for deletion.', { position: 'top-center' });
      return;
    }

    const ids = selectedBuyers.map(id => String(id));

    toast(
      ({ closeToast }) => (
        <div className="flex flex-col items-center text-center space-y-3 p-3">
          <p className="text-sm font-medium">
            Do you want to delete <b>{ids.length}</b> selected buyer(s)?
          </p>
          <div className="flex gap-3 justify-center">
            <button
              className="px-4 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
              onClick={async () => {
                const prevBuyers = buyers;
                try {
                  setBulkDeleting(true);
                  setBuyers(prev => prev.filter(b => !ids.includes(String(b.id))));
                  setSelectedBuyers([]);
                  await buyerAPI.bulkDelete(ids, false);
                  toast.success(`🗑️ ${ids.length} buyer(s) deleted successfully.`);
                } catch (err) {
                  console.error('Error bulk deleting buyers:', err);
                  setBuyers(prevBuyers);
                  toast.error('❌ Failed to delete buyers. Try again.');
                } finally {
                  setBulkDeleting(false);
                  closeToast?.();
                }
              }}
            >
              ✅ Yes, Delete
            </button>
            <button
              className="px-4 py-1 bg-gray-300 text-gray-800 rounded text-xs hover:bg-gray-400"
              onClick={closeToast}
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        position: 'top-center',
      }
    );
  };

  /* ---------------- Bulk Actions ---------------- */
  const handleBulkUpdateLeadField = async (field: string, value: any, onlyEmpty: boolean = false) => {
    if (selectedBuyers.length === 0) {
      toast.info('Please select buyers to update');
      return;
    }

    try {
      const buyerIds = selectedBuyers.map(id => String(id));
      await buyerAPI.bulkUpdateLeadField(buyerIds, field, value, onlyEmpty);

      // Update local state
      setBuyers(prev => prev.map(buyer => {
        if (!selectedBuyers.includes(buyer.id)) return buyer;

        const updatedBuyer = { ...buyer };
        switch (field) {
          case 'buyer_lead_stage':
            updatedBuyer.stage = value;
            updatedBuyer.currentStage = value;
            break;
          case 'buyer_lead_status':
            updatedBuyer.status = value;
            break;
          case 'buyer_lead_priority':
            updatedBuyer.priority = value;
            break;
          case 'is_active':
            updatedBuyer.is_active = !!Number(value);
            break;
        }
        return updatedBuyer;
      }));

      setSelectedBuyers([]);
      toast.success('Field updated successfully');
    } catch (err) {
      console.error('Error bulk updating field:', err);
      toast.error('Failed to update field');
    }
  };

  /* ---------------- Export CSV ---------------- */
  const exportToCSV = (mode: 'filtered' | 'selected' | 'all' = 'filtered') => {
    let source: UIBuyer[] = [];
    if (mode === 'selected') {
      source = buyers.filter(b => selectedBuyers.includes(b.id));
      if (selectedBuyers.length === 0) {
        toast.info('No buyers selected to export.');
        return;
      }
    } else if (mode === 'filtered') {
      source = filteredSortedBuyers;
      if (!source || source.length === 0) {
        toast.info('No buyers found in current view to export.');
        return;
      }
    } else {
      source = buyers;
      if (!source || source.length === 0) {
        toast.info('No buyers available to export.');
        return;
      }
    }

    const columns: { key: string; label: string }[] = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'city', label: 'City' },
      { key: 'state', label: 'State' },
      { key: 'location', label: 'Location' },
      { key: 'source', label: 'Source' },
      { key: 'priority', label: 'Priority' },
      { key: 'stage', label: 'Stage' },
      { key: 'assigned', label: 'Assigned To' },
      { key: 'assigned_executive_name', label: 'Executive Name' },
      { key: 'assigned_executive_email', label: 'Executive Email' },
      { key: 'assigned_executive_phone', label: 'Executive Phone' },
      { key: 'leadScore', label: 'Lead Score' },
      { key: 'budgetMin', label: 'Budget Min' },
      { key: 'budgetMax', label: 'Budget Max' },
      { key: 'matchedPropertiesCount', label: 'Property Matches' }, // NEW: Added match count
      { key: 'requirements', label: 'Requirements' },
      { key: 'created_at', label: 'Created At' },
    ];

    const csvEscape = (v: any) => {
      if (v === null || v === undefined) return '';
      const s = typeof v === 'string' ? v : String(v);
      return `"${s.replace(/"/g, '""')}"`;
    };

    const rows = source.map(b => {
      const req = b.requirements ?? {};
      const budgetMin = b.budget?.min ?? '';
      const budgetMax = b.budget?.max ?? '';
      const reqParts: string[] = [];
      if (req.propertyType) reqParts.push(`Property:${req.propertyType}`);
      if (Array.isArray(req.unitTypes) && req.unitTypes.length) reqParts.push(`UnitTypes:${req.unitTypes.join('|')}`);
      if (Array.isArray(req.preferredLocations) && req.preferredLocations.length) reqParts.push(`Locations:${req.preferredLocations.join('|')}`);
      if (req.amenities && Array.isArray(req.amenities)) reqParts.push(`Amenities:${req.amenities.join('|')}`);
      const reqSummary = reqParts.join('; ');

      return {
        id: b.id,
        name: b.name,
        phone: b.phone,
        email: b.email,
        city: b.city,
        state: b.state,
        location: b.location,
        source: b.source,
        priority: b.priority,
        stage: b.stage,
        assigned: b.assigned,
        assigned_executive_name: b.assigned_executive_name,
        assigned_executive_email: b.assigned_executive_email,
        assigned_executive_phone: b.assigned_executive_phone,
        leadScore: b.leadScore ?? '',
        budgetMin,
        budgetMax,
        matchedPropertiesCount: b.matchedPropertiesCount ?? 0, // NEW: Include match count
        requirements: reqSummary,
        created_at: b.created_at ? new Date(b.created_at).toISOString() : '',
      };
    });

    const header = columns.map(c => csvEscape(c.label)).join(',');
    const body = rows.map(row => columns.map(c => csvEscape((row as any)[c.key])).join(',')).join('\n');

    const bom = '\uFEFF';
    const csvContent = bom + header + '\n' + body;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    a.download = mode === 'selected' ? `buyers_selected_${stamp}.csv` : mode === 'all' ? `buyers_all_${stamp}.csv` : `buyers_filtered_${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success('Exported CSV successfully');
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      ignoreDate: false,
      source: 'all',
      stage: 'all',
      priority: 'all',
      assigned: 'all',
      assigned_executive: 'all',
      status: 'all',
      budgetRange: 'all',
      propertyType: 'all',
    });
  };

  /* ---------------- Detail view ---------------- */
  if (currentBuyerView) {
    return (
      <div className="buyers-page">
        <BuyerViewPage
          buyer={currentBuyerView}
          onBack={handleBackToList}
          onEdit={handleEditBuyer}
          onAccount={handleBuyerAccount}
          onNext={handleNextBuyer}
          onPrevious={handlePreviousBuyer}
          currentIndex={currentBuyerIndex}
          totalBuyers={filteredSortedBuyers.length}
          onUpdateBuyer={(updatedBuyer: UIBuyer) => {
            setBuyers(prev => {
              const next = prev.map(b => (b.id === updatedBuyer.id ? updatedBuyer : b));
              return next.sort((a, b) => {
                const ad = new Date(a.created_at || a.lastActivity || 0).getTime();
                const bd = new Date(b.created_at || b.lastActivity || 0).getTime();
                return bd - ad;
              });
            });
            setCurrentBuyerView(updatedBuyer);
          }}
        />
        {showBuyerForm && (
          <BuyerFormModal
            isOpen={showBuyerForm}
            buyer={editingBuyer}
            onClose={() => setShowBuyerForm(false)}
            onSave={handleSaveBuyer}
          />
        )}
        {showImportBuyers && (
          <ImportBuyersLeadsModal
            isOpen={showImportBuyers}
            onClose={() => setShowImportBuyers(false)}
          />
        )}
      </div>
    );
  }

  /* ---------------- List view ---------------- */
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Buyer Management</h1>
              <p className="text-sm text-gray-600">Complete buyer lifecycle from lead to property purchase</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowImportBuyers(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all text-sm"
            >
              <Upload size={14} />
              <span>Import</span>
            </button>
            <button
              onClick={handleAddBuyer}
              className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all text-sm"
            >
              <Plus size={14} />
              <span>Add Buyer</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4">
          <div className="flex space-x-1 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap text-sm font-medium ${activeTab === tab.id
                  ? `bg-${tab.color}-100 text-${tab.color}-700 border border-${tab.color}-200`
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? `bg-${tab.color}-200` : 'bg-gray-200'
                  }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search / Filters */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 flex items-center space-x-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search buyers..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              <Filter size={14} />
              <span>Filters</span>
            </button>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded ${viewMode === 'table' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
              >
                <FileText size={16} />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded ${viewMode === 'cards' ? 'bg-purple-100 text-purple-600' : 'text-gray-400'}`}
              >
                <Building size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <button
              onClick={() => exportToCSV('filtered')}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              <Download size={14} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-xs font-medium text-gray-500">Quick:</span>

          {/* Stages from masters */}
          {(() => {
            const quickStages = ['all', ...effectiveStageOptions.map(o => o.value).slice(0, 4)];
            return quickStages.map(stage => (
              <button
                key={stage}
                onClick={() => {
                  if (stage === 'all') {
                    setFilters(prev => ({ ...prev, stage: 'all', priority: 'all' }));
                  } else {
                    setFilters(prev => ({ ...prev, stage }));
                  }
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${filters.stage === stage
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {stage === 'all'
                  ? 'All'
                  : stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ));
          })()}

          {/* Priorities from masters */}
          {effectivePriorityOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => {
                setFilters(prev => ({ ...prev, priority: opt.value }));
                setCurrentPage(1);
              }}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${filters.priority === opt.value
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <BuyerSidebarFilter
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          setFilters={setFilters}
          resetFilters={resetFilters}
          sources={sources}
          stages={stagesFromMasters}
          priorities={prioritiesFromMasters}
          budgetRanges={budgetRanges}
          propertyTypes={propertyTypes}
          executives={executives.map(e => ({ id: e.id, name: e.name }))}
        />
      </div>

      {/* Bulk Actions */}
      {selectedBuyers.length > 0 && (
        <div className="bg-purple-50 border-b border-purple-200 px-4 lg:px-6 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-purple-700">
                {selectedBuyers.length} selected
              </span>

              <div className="flex items-center flex-wrap gap-2">
                {/* Executive Assignment Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setExecDropdownOpen(!execDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50"
                  >
                    <UserCheck size={12} />
                    <span>Assign Executive</span>
                  </button>

                  {execDropdownOpen && (
                    <div className="absolute top-8 left-0 z-20 w-36 bg-white border border-gray-200 rounded-lg shadow-lg">
                      <div className="p-2 border-b">
                        <input
                          type="text"
                          placeholder="Search executives..."
                          value={execSearch}
                          onChange={(e) => setExecSearch(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                      </div>
                      <div className="max-h-48 overflow-auto">
                        {execsLoading ? (
                          <div className="p-2 text-xs text-gray-500">Loading executives...</div>
                        ) : filteredExecutives.length === 0 ? (
                          <div className="p-2 text-xs text-gray-500">No executives found</div>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                handleAssignExecutive(null);
                                setExecDropdownOpen(false);
                              }}
                              className="text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 border-b"
                            >
                              Unassign Executive
                            </button>
                            {filteredExecutives.map((exec) => (
                              <button
                                key={exec.id}
                                onClick={() => {
                                  handleAssignExecutive(exec.id);
                                  setExecDropdownOpen(false);
                                }}
                                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
                              >
                                <div className="font-medium">{exec.name}</div>
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>


                {/* Bulk: Update Stage from Masters */}
                <select
                  onChange={(e) => {
                    const v = e.target.value;
                    if (!v) return;
                    handleBulkUpdateLeadField('buyer_lead_stage', v);
                    e.currentTarget.selectedIndex = 0;
                  }}
                  className="px-3 py-1 border border-gray-300 rounded text-xs"
                >
                  <option value="">Update Stage</option>
                  {effectiveStageOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                {/* Bulk: Update Priority from Masters */}
                <select
                  onChange={(e) => {
                    const v = e.target.value;
                    if (!v) return;
                    handleBulkUpdateLeadField('buyer_lead_priority', v);
                    e.currentTarget.selectedIndex = 0;
                  }}
                  className="px-3 py-1 border border-gray-300 rounded text-xs"
                >
                  <option value="">Update Priority</option>
                  {effectivePriorityOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                {/* NEW: Bulk Activate / Inactivate */}
                <button
                  onClick={() => handleBulkUpdateLeadField('is_active', 1)}
                  className="px-3 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700"
                >
                  Mark Active
                </button>
                <button
                  onClick={() => handleBulkUpdateLeadField('is_active', 0)}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                >
                  Mark Inactive
                </button>

                {/* Export + Delete */}
                <button
                  onClick={() => exportToCSV('selected')}
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                >
                  Export
                </button>

                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
            <button onClick={() => setSelectedBuyers([])} className="text-purple-600 hover:text-purple-800">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Table */}
     <div className="flex-1 overflow-auto" ref={tableScrollRef}>
        <div className="bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left w-8">
                  <input
                    type="checkbox"
                    checked={selectedBuyers.length === paginatedBuyers.length && paginatedBuyers.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Buyer Details</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact & Location</th>
                {/* ✅ NEW Business Info Column */}
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Business Info</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Requirements & Budget</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Progress & Activity</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 ">
              {loading ? (
                <tr >
                  <td colSpan={9} > {/* ✅ colSpan 8 से 9 करें */}
                      <div className="w-full flex items-center justify-center">
                    <TableLoader colSpan={9} message="Loading buyers..." size="lg" />
                    </div>
                  </td>
                </tr>
              ) : paginatedBuyers.length > 0 ? (
                paginatedBuyers.map((buyer) => (
                  <tr key={buyer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedBuyers.includes(buyer.id)}
                        onChange={() => handleBuyerSelection(buyer.id)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex flex-col items-center space-y-1">
                          <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                            <User className="text-white" size={14} />
                          </div>
                          <div className="text-[10px] text-[#0b3856] bg-[#0b3856]/10 px-2 py-0.5 rounded-md inline-block">
                            Id : {buyer.id}
                          </div>
                        </div>

                        <div>
                          <div className="font-semibold text-gray-900 text-sm">
                            <div>{safeStr(buyer.salutation)} {safeStr(buyer.name)}</div>
                            {buyer.dob && <div className="text-gray-500 text-xs">{formatDOB(buyer.dob)}</div>}
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            {getStatusBadge(buyer.is_active)}
                            {getLeadScore(buyer.leadScore)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1 text-xs">
                          <Phone size={10} className="text-gray-400" />
                          <span className="font-medium">{safeStr(buyer.phone)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs">
                          <Mail size={10} className="text-gray-400" />
                          <span className="truncate max-w-24">{safeStr(buyer.email)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs">
                          <MapPin size={10} className="text-gray-400" />
                          <span>{safeStr(buyer.location)}{buyer.city ? `, ${buyer.city}` : ''}</span>
                        </div>
                        {/* ✅ Source को यहाँ से हटा दिया - अब Business Info में दिखेगा */}
                      </div>
                    </td>

                    {/* ✅ NEW Business Info Column */}
                    <td className="px-3 py-3">
                      <div className="space-y-2">
                        {/* Source */}
                        <div className="flex items-center space-x-1">
                         
                          <div className="text-xs">
                            <span className="text-gray-500">Source:</span>{' '}
                            <span className="font-medium text-blue-700">
                              {buyer.source || 'Not specified'}
                            </span>
                          </div>
                        </div>

                        {/* Priority */}
                        <div className="flex items-center space-x-1">
                          
                          <div className="text-xs">
                           
                            {getPriorityBadge(buyer.priority)}
                          </div>
                        </div>

                       
                        {/* Created Date */}
                        {buyer.created_at && (
                          <div className="text-xs text-gray-500">
                            Created: {formatDate(buyer.created_at)}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        {buyer.assigned_executive_name ? (
                          <>
                            <div className="flex items-center space-x-1 text-xs">
                              <UserCheck size={10} className="text-green-500" />
                              <span className="font-medium text-green-700">{buyer.assigned_executive_name}</span>
                            </div>
                            {buyer.assigned_executive_email && (
                              <div className="flex items-center space-x-1 text-xs">
                                <Mail size={10} className="text-gray-400" />
                                <span className="text-gray-600 truncate max-w-24">{buyer.assigned_executive_email}</span>
                              </div>
                            )}
                            {buyer.assigned_executive_phone && (
                              <div className="flex items-center space-x-1 text-xs">
                                <Phone size={10} className="text-gray-400" />
                                <span className="text-gray-600">{buyer.assigned_executive_phone}</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-500">Not assigned</span>
                        )}
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="text-gray-500">Property:</span>{' '}
                          {buyer.requirements?.propertyType || '—'}
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500">Types:</span>{' '}
                          {safeStr(buyer.requirements?.unitTypes)}
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500">Budget:</span>
                          <span className="font-medium text-green-600 ml-1">
                            {formatCurrency(buyer.budget.min)} - {formatCurrency(buyer.budget.max)}
                          </span>
                        </div>
                        {/* ✅ Priority को यहाँ से हटा दिया - अब Business Info में दिखेगा */}
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="space-y-2">
                        {getStageBadge(buyer.stage)}
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${buyer.stageProgress || 0}%` } as React.CSSProperties}
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          Last: {formatDate(buyer.lastActivity)}
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        
                        {/* NEW: Property Matches Count in Performance Section */}
                        <div className="flex items-center space-x-2 text-xs">
                          <Target size={10} className="text-green-500" />
                          <span className={`font-medium ${
                            (buyer.matchedPropertiesCount || 0) > 0 
                              ? 'text-green-600' 
                              : 'text-gray-500'
                          }`}>
                            {buyer.matchedPropertiesCount || 0} matches
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <Activity size={10} className="text-green-500" />
                          <span>{buyer.activities?.length ?? 0} activities</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <Eye size={10} className="text-purple-500" />
                          <span>{buyer.visits ?? 0} visits</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <TrendingUp size={10} className="text-orange-500" />
                          <span>{buyer.responseRate ? `${buyer.responseRate}% response` : ' - '}</span>
                        </div>
                        {buyer.notifications > 0 && (
                          <div className="flex items-center space-x-1 text-xs">
                            <Bell size={10} className="text-red-500" />
                            <span className="text-red-600 font-medium">{buyer.notifications}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleViewBuyer(buyer)}
                          className="p-1.5 text-purple-600 hover:bg-purple-100 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleBuyerAccount(buyer)}
                          className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                          title="Buyer Account"
                        >
                          <UserCheck size={14} />
                        </button>
                        <button
                          onClick={() => handleEditBuyer(buyer)}
                          className="p-1.5 text-orange-600 hover:bg-orange-100 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <div className="relative group">
                          <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors">
                            <MoreHorizontal size={14} />
                          </button>
                          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <div className="p-1">
                              <button className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded w-full text-left">
                                <PhoneCall size={12} />
                                <span>Call</span>
                              </button>
                              <button className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded w-full text-left">
                                <MessageCircle size={12} />
                                <span>WhatsApp</span>
                              </button>
                              <button className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded w-full text-left">
                                <Send size={12} />
                                <span>Email</span>
                              </button>
                              <button className="flex items-center space-x-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded w-full text-left">
                                <Home size={12} />
                                <span>Send Properties</span>
                              </button>
                              <button
                                onClick={() => handleDeleteBuyer(buyer.id)}
                                className="flex items-center space-x-2 px-3 py-2 text-xs text-red-600 hover:bg-red-100 rounded w-full text-left"
                              >
                                <Trash2 size={12} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-sm text-gray-500">
                    No buyers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white border-t border-gray-200 px-4 lg:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-gray-700">
            {filteredSortedBuyers.length > 0
              ? <>Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSortedBuyers.length)} of {filteredSortedBuyers.length}</>
              : 'Showing 0-0 of 0'}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2 py-1 rounded text-xs ${currentPage === page
                      ? 'bg-purple-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span className="px-1 text-xs">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`px-2 py-1 rounded text-xs ${currentPage === totalPages
                      ? 'bg-purple-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BuyerFormModal
        isOpen={showBuyerForm}
        onClose={() => { setShowBuyerForm(false); setEditingBuyer(null); }}
        buyer={editingBuyer}
        onSave={handleSaveBuyer}
      />

      <ImportBuyersLeadsModal
        isOpen={showImportBuyers}
        onClose={() => setShowImportBuyers(false)}
      />
    </div>
  );
};

// UI helper functions
function getStatusBadge(is_active: boolean | null) {
  if (is_active === true) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        🟢 Active
      </span>
    );
  }
  if (is_active === false) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        ⚫ Inactive
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
      –
    </span>
  );
}

function getLeadScore(score: number) {
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
  const bgColor = score >= 80 ? 'bg-green-100' : score >= 60 ? 'bg-yellow-100' : 'bg-red-100';
  const label = score > 0 ? score : ' - ';
  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full ${score > 0 ? bgColor : 'bg-gray-100'} ${score > 0 ? color : 'text-gray-600'}`}>
      <Star size={12} className="mr-1" />
      <span className="text-xs font-bold">{label}</span>
    </div>
  );
}

function getStageBadge(stageOrBuyer: string | any) {
  const raw =
    typeof stageOrBuyer === 'string'
      ? stageOrBuyer
      : stageOrBuyer?.buyer_lead_stage ?? stageOrBuyer?.buyer_leadStage ?? stageOrBuyer?.stage ?? '';
  const rawStr = String(raw ?? '').trim();
  const stageConfig: Record<string, any> = {
    initial_contact: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Initial Contact', icon: '📞' },
    requirement_gathering: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Requirement Gathering', icon: '📋' },
    property_hunting: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Property Hunting', icon: '🔍' },
    loan_processing: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Loan Processing', icon: '🏦' },
    property_finalization: { bg: 'bg-green-100', text: 'text-green-700', label: 'Property Finalization', icon: '✅' },
    deal_closure: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Deal Closure', icon: '🤝' },
    completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completed', icon: '🎉' },
  };
  const labelToKey: Record<string, string> = {
    'initial contact': 'initial_contact',
    'requirement gathering': 'requirement_gathering',
    'property hunting': 'property_hunting',
    'loan processing': 'loan_processing',
    'property finalization': 'property_finalization',
    'deal closure': 'deal_closure',
    'completed': 'completed',
    'property-hunting': 'property_hunting',
    'property_hunting': 'property_hunting',
    'propertyfinalization': 'property_finalization',
  };
  const lower = rawStr.toLowerCase();
  let keyS = labelToKey[lower] ?? lower.replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  if (!stageConfig[keyS]) {
    const fuzzy = Object.keys(stageConfig).find(k => k.includes(keyS) || keyS.includes(k));
    if (fuzzy) keyS = fuzzy;
  }
  if (!stageConfig[keyS]) keyS = 'initial_contact';
  const config = stageConfig[keyS];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className="mr-2">{config.icon}</span>
      <span className="flex items-center space-x-2">
        <span className="text-[10px] font-normal">{config.label}</span>
      </span>
    </span>
  );
}

function getPriorityBadge(priority: string | null | undefined) {
  const raw = (priority ?? '').toString().trim().toLowerCase();
  const alias: Record<string, 'high' | 'medium' | 'low'> = {
    h: 'high', urgent: 'high', hot: 'high',
    m: 'medium', normal: 'medium',
    l: 'low', cold: 'low',
  };
  const keyP = (['high', 'medium', 'low'].includes(raw) ? raw : alias[raw]) ?? '';
  const priorityConfig: Record<string, { bg: string; text: string; label: string; icon: string }> = {
    high: { bg: 'bg-red-100', text: 'text-red-700', label: 'High', icon: '🔥' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium', icon: '⚡' },
    low: { bg: 'bg-green-100', text: 'text-green-700', label: 'Low', icon: '🌱' },
  };
  const fallbackLabel = raw ? raw.replace(/\b\w/g, c => c.toUpperCase()) : '-';
  const config = priorityConfig[keyP] ?? { bg: 'bg-gray-100', text: 'text-gray-700', label: fallbackLabel, icon: '' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
      {config.icon} {config.label}
    </span>
  );
}

export default BuyersPage;