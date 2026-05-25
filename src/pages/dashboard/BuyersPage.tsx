

// src/pages/BuyersPage.tsx
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  Users, Plus, Search, Filter, Eye, Edit, Trash2, Phone, Mail, MapPin,
  Building, Activity, MoreHorizontal, User, Star, FileText, MessageCircle,
  Bell, Upload, Download, ChevronLeft, ChevronRight, X, Target, Home,
  UserCheck, PhoneCall, Send,
  Briefcase, UserX,
  TrendingUp, SlidersHorizontal, Clock, AlertCircle, CheckCircle, XCircle,
  Calendar
} from 'lucide-react';
import { SiWhatsapp } from "react-icons/si";
import Swal from 'sweetalert2';
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
import { can } from '@/utils/permission';
import { filterBuyersByRole } from '@/utils/roleBasedBuyerFilter';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Pagination from '@/components/ui/Pagination';
import * as XLSX from 'xlsx';
import BuyerFollowupModal from '@/components/buyers/BuyerFollowupModal';
import { buyerFollowupAPI } from '@/lib/buyerFollowupAPI';


type Executive = {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  username?: string;
  department?: string;
  role?: string;
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
  matchedPropertiesCount?: number;
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

// Resale Theme Colors
const RESALE = {
  navy: '#f3f4f6',
  navyLight: '#e5e7eb',
  navyDark: '#d1d5db',
  orange: '#e67e22',
  orangeLight: '#f39c12',
  orangeDark: '#d35400',
};

const BuyersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth() as any;

  // Permission checks
  const canRead = can(user, 'buyer.read');
  const canCreate = can(user, 'buyer.create');
  const canUpdate = can(user, 'buyer.update');
  const canDelete = can(user, 'buyer.delete');
  const canImport = can(user, 'data.import');
  const canExport = can(user, 'data.export');
  const canAssign = can(user, 'buyer.assign');
  const canBulkDelete = can(user, 'buyer.bulk_delete');

  const hasAnyActionPermission = canUpdate || canDelete || canAssign;
  const shouldShowActionsColumn = canRead && (hasAnyActionPermission || true);

  const isAdmin = useMemo(() => {
    const role = (user?.role || '').toLowerCase();
    return role.includes('admin') || role.includes('manager') || role.includes('superadmin');
  }, [user]);

  const isExecutive = useMemo(() => {
    const role = (user?.role || '').toLowerCase();
    return role.includes('executive');
  }, [user]);

  const canViewBuyer = (_buyer: UIBuyer) => canRead;
  const canEditBuyer = (buyer: UIBuyer) => {
    if (!canUpdate) return false;
    if (isAdmin) return true;
    if (isExecutive) return String(buyer.assigned_executive) === String(user?.id);
    return false;
  };
  const canDeleteBuyer = (buyer: UIBuyer) => {
    if (!canDelete) return false;
    if (isAdmin) return true;
    if (isExecutive) return String(buyer.assigned_executive) === String(user?.id);
    return false;
  };

  if (!canRead) {
    return (
      <div className="h-full flex flex-col" style={{ backgroundColor: '#f5f6f8' }}>
        <div className="flex-1 grid place-items-center">
          <div className="text-center p-6">
            <div className="text-red-600 text-lg font-semibold mb-2">Access Denied</div>
            <div className="text-gray-600 text-sm">You do not have permission to view buyers.</div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- UI state ---------------- */
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuyers, setSelectedBuyers] = useState<Array<number | string>>([]);
  const [showBuyerForm, setShowBuyerForm] = useState(false);
  const [currentBuyerView, setCurrentBuyerView] = useState<UIBuyer | null>(null);
  const [showImportBuyers, setShowImportBuyers] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<UIBuyer | null>(null);
  const [currentBuyerIndex, setCurrentBuyerIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);

  // Column-level search filters
  const [colSearch, setColSearch] = useState({
    buyer: "",
    contact: "",
    business: "",
    assigned: "",
    requirements: "",
    progress: "",
    performance: "",
  });

  // Bulk action states
  const [bulkStage, setBulkStage] = useState<string>('');
  const [bulkPriority, setBulkPriority] = useState<string>('');
  const [bulkAssignee, setBulkAssignee] = useState<string>('');
  const [bulkLoading, setBulkLoading] = useState<boolean>(false);

  // Executive state
  const [executives, setExecutives] = useState<Executive[]>([{ id: 0, name: "Not assigned", email: "", phone: "" }]);
  const [execsLoading, setExecsLoading] = useState<boolean>(true);
  const [execDropdownOpen, setExecDropdownOpen] = useState<boolean>(false);
  const [execSearch, setExecSearch] = useState<string>('');
  const [selectedExecId, setSelectedExecId] = useState<string | number | null>(null);
  const [showUnassignedToExecutives, setShowUnassignedToExecutives] = useState(false);

  const tableScrollRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
const [showBuyerFollowupModal, setShowBuyerFollowupModal] = useState(false);
const [selectedBuyerForFollowup, setSelectedBuyerForFollowup] = useState<UIBuyer | null>(null);
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

  const [allBuyers, setAllBuyers] = useState<UIBuyer[]>([]);
  const [roleFilteredBuyers, setRoleFilteredBuyers] = useState<UIBuyer[]>([]);

  // Property Matching Logic
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await propertiesAPI.getProperties();
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const publicProperties = list.filter((property: any) =>
          property.is_public === true || property.is_public === 1 ||
          property.isPublic === true || property.public === true
        );
        setProperties(publicProperties ?? []);
      } catch (err) {
        setProperties([]);
      }
    };
    fetchProperties();
  }, []);

  const getBuyerBudget = (buyer: UIBuyer) => {
    const rawMin = Number(buyer?.budget?.min ?? 0);
    const rawMax = Number(buyer?.budget?.max ?? 0);
    const min = Number.isFinite(rawMin) && rawMin > 0 ? rawMin : null;
    const max = Number.isFinite(rawMax) && rawMax > 0 ? rawMax : null;
    return { min, max };
  };

  const isWithinBuyerBudget = (p: any, buyer: UIBuyer) => {
    const { min: bMin, max: bMax } = getBuyerBudget(buyer);
    const hasMin = bMin != null;
    const hasMax = bMax != null;
    if (!hasMin && !hasMax) return false;

    const price = Number(p?.budget ?? p?.price ?? p?.expected_price ?? 0);
    if (!price) return false;
    if (hasMin && price < (bMin as number)) return false;
    if (hasMax && price > (bMax as number)) return false;
    return true;
  };

  const countMatchingProperties = (buyer: UIBuyer) => {
    if (!properties.length) return 0;
    return properties.filter((property) => isWithinBuyerBudget(property, buyer)).length;
  };

  useEffect(() => {
    if (!properties.length || !allBuyers.length) return;
    setAllBuyers(prev => prev.map(b => ({ ...b, matchedPropertiesCount: countMatchingProperties(b) })));
  }, [properties]);

  // Load Executives
  useEffect(() => {
    const loadExecutives = async () => {
      try {
        setExecsLoading(true);
        const formatName = (u: any): string => {
          const salutation = u?.salutation ? `${u.salutation} ` : '';
          const firstName = u?.first_name || u?.firstName || '';
          const lastName = u?.last_name || u?.lastName || '';
          const fullName = `${salutation}${firstName} ${lastName}`.trim();
          if (fullName) return fullName;
          if (u?.name) return u.name;
          if (u?.username) return u.username;
          return 'Sales Executive';
        };

        let executivesList: any[] = [];
        try {
          if (usersAPI.getSalesExecutives) {
            const res = await usersAPI.getSalesExecutives();
            if (res && (Array.isArray(res) || res.items || res.data)) {
              executivesList = Array.isArray(res) ? res : (res.items || res.data || []);
            }
          }
        } catch (err) {}

        if (executivesList.length === 0 && (usersAPI as any).getAll) {
          try {
            const allUsers = await (usersAPI as any).getAll({ is_active: true });
            const usersArray = Array.isArray(allUsers) ? allUsers : (allUsers?.items || allUsers?.data || []);
            if (usersArray.length > 0) {
              executivesList = usersArray.filter((u: any) => {
                const dept = String(u.department || '').toLowerCase();
                const role = String(u.role || '').toLowerCase();
                return (dept.includes('sales') || role.includes('sales')) && (role.includes('executive') || role.includes('sales'));
              });
            }
          } catch (err) {}
        }

        const processedExecutives: Executive[] = executivesList.map((u: any) => ({
          id: Number(u.id) || 0,
          name: formatName(u),
          email: u.email || null,
          phone: u.phone || u.mobile || null,
          username: u.username || null,
          department: u.department || 'Sales',
          role: u.role || 'Sales Executive',
        }));

        const uniqueExecutives = processedExecutives.filter((exec, index, self) =>
          index === self.findIndex(e => String(e.id) === String(exec.id) && e.id !== 0)
        );
        setExecutives(uniqueExecutives.length ? uniqueExecutives : [{ id: 0, name: "Not assigned", email: "", phone: "" }]);
      } catch (error) {
        setExecutives([{ id: 0, name: "Not assigned", email: "", phone: "" }]);
      } finally {
        setExecsLoading(false);
      }
    };
    loadExecutives();
  }, [user]);

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
    execSearch.trim() === '' ? true :
      exec.name.toLowerCase().includes(execSearch.toLowerCase()) ||
      (exec.email && exec.email.toLowerCase().includes(execSearch.toLowerCase())) ||
      (exec.phone && exec.phone.includes(execSearch))
  );

  // Masters Loading
  const [masterLoading, setMasterLoading] = useState(true);
  const [masters, setMasters] = useState<Record<string, any>>({});

  const normKey = (s: any) => String(s ?? '').trim().toLowerCase().replace(/[^\w]+/g, '_');
  const normalizeMasterKeys = (obj: any) => {
    const out: Record<string, any> = {};
    Object.entries(obj || {}).forEach(([k, v]) => { out[normKey(k)] = v; });
    return out;
  };

  const getMasterArray = (mastersObj: Record<string, any>, possibleKeys: string[]): any[] => {
    for (const key of possibleKeys) {
      const k = normKey(key);
      if (Array.isArray(mastersObj?.[k]) && mastersObj[k].length) return mastersObj[k];
    }
    return [];
  };

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        setMasterLoading(true);
        const data = await getMasterDropdownOptions(['lead', 'buyer']);
        setMasters(normalizeMasterKeys(data));
      } catch (err) {
        toast.error('Failed to load dropdown options');
      } finally {
        setMasterLoading(false);
      }
    };
    fetchMasters();
  }, []);

  const toOptionLabel = (o: any) => (o?.label ?? o?.name ?? o?.title ?? o?.value ?? o?.key ?? '').toString();
  const toOptionValue = (o: any) => (o?.value ?? o?.key ?? o?.code ?? o?.name ?? '').toString();

  const stageRaw = getMasterArray(masters, ['buyer_lead_stage', 'buyer stage']);
  const priorityRaw = getMasterArray(masters, ['lead_priority', 'lead priority']);

  const stageOptions = stageRaw.map((o) => ({ value: toOptionValue(o), label: toOptionLabel(o) })).filter((o) => o.value);
  const priorityOptions = priorityRaw.map((o) => ({ value: toOptionValue(o).toLowerCase(), label: toOptionLabel(o) })).filter((o) => o.value);

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

  const effectiveStageOptions = stageOptions?.length ? stageOptions : stageOptionsFallback;
  const effectivePriorityOptions = priorityOptions?.length ? priorityOptions : priorityOptionsFallback;
  const stagesFromMasters: string[] = ['all', ...effectiveStageOptions.map(o => o.value)];
  const prioritiesFromMasters: string[] = ['all', ...effectivePriorityOptions.map(o => o.value)];

  // Helpers
  const formatDate = (val: string | null) => {
    if (!val) return ' - ';
    const d = new Date(val);
    if (isNaN(d.getTime())) return ' - ';
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' });
  };

  const formatDateTime = (val: string | null) => {
    if (!val) return "Invalid Date";
    const d = new Date(val);
    if (isNaN(d.getTime())) return "Invalid Date";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day}/${month}/${year} ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
  };

  const toMySQLDate = (val: any) => {
    if (!val) return null;
    const d = new Date(val);
    if (isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const formatDOB = (val: string | null) => {
    if (!val) return ' - ';
    const d = new Date(val);
    if (isNaN(d.getTime())) return ' - ';
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const parseJSON = (val: any) => {
    if (!val) return null;
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return null; }
    }
    return typeof val === 'object' ? val : null;
  };

  const toNumOrNull = (v: any): number | null => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const key = (v: any) => String(v ?? '').trim().toLowerCase();
  const stageKey = (v: any) => key(v).replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  const priorityKey = (v: any) => key(v);

  const resolveExecutiveName = useCallback((executiveId: string | number | null): { name: string; isCurrentUser: boolean } => {
    if (!executiveId || executiveId === 0) return { name: 'Not assigned', isCurrentUser: false };
    const isCurrentUser = String(executiveId) === String(user?.id);
    if (isCurrentUser) return { name: user?.name || 'You', isCurrentUser: true };
    const exec = executives.find(e => String(e.id) === String(executiveId));
    return exec ? { name: exec.name, isCurrentUser: false } : { name: `Executive (ID: ${executiveId})`, isCurrentUser: false };
  }, [user, executives]);

  const normalizeBuyerForUI = useCallback((b: any): UIBuyer => {
    const rawReq = parseJSON(b.requirements) || b.requirements || {};
    const fin = parseJSON(b.financials) || b.financials || {};
    const toStr = (v: any) => (v === null || v === undefined ? null : String(v));

    const budgetMin = toNumOrNull(b.budget_min ?? b.budgetMin);
    const budgetMax = toNumOrNull(b.budget_max ?? b.budgetMax);
    const createdAt = toMySQLDate(b.created_at ?? null);
    const assignedExecutiveId = b.assigned_executive ?? b.assigned_to ?? null;
    const { name: execName } = resolveExecutiveName(assignedExecutiveId);

    return {
      id: b.id ?? `${b.name ?? 'buyer'}-${Math.random().toString(36).slice(2)}`,
      salutation: b.salutation ?? null,
      name: b.name ?? null,
      phone: b.phone ?? b.mobile ?? null,
      whatsapp: b.whatsapp_number ?? b.whatsapp ?? null,
      email: b.email ?? null,
      dob: toMySQLDate(b.dob ?? null),
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
      assigned_executive_name: execName !== 'Not assigned' ? execName : null,
      assigned_executive_email: null,
      assigned_executive_phone: null,
      leadScore: toNumOrNull(b.lead_score) ?? toNumOrNull(b.leadScore) ?? 0,
      budget: { min: budgetMin, max: budgetMax },
      expectedClose: toMySQLDate(b.expected_close ?? b.expectedClose ?? null),
      requirements: {
        propertyType: toStr(rawReq.propertyType ?? rawReq.property_type ?? b.propertyType ?? null),
        unitTypes: Array.isArray(rawReq.unitTypes ?? rawReq.unit_types) ? (rawReq.unitTypes ?? rawReq.unit_types).map(toStr) : null,
        preferredLocations: Array.isArray(rawReq.preferredLocations ?? rawReq.preferred_locations) ? (rawReq.preferredLocations ?? rawReq.preferred_locations).map(toStr) : null,
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
matchedPropertiesCount: b.matchedPropertiesCount ||
  (() => {
    if (properties.length > 0) {
      const tempBuyer = { id: b.id, budget: { min: budgetMin, max: budgetMax } } as UIBuyer;
      return countMatchingProperties(tempBuyer);
    }
    return 0;
  })(),     
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
}, [resolveExecutiveName, properties]);
  const fetchBuyers = useCallback(async () => {
    try {
      setLoading(true);
      const apiBuyers = await buyerAPI.getAll();
      if (!Array.isArray(apiBuyers)) {
        setAllBuyers([]);
        return;
      }
      const normalized = apiBuyers.map(normalizeBuyerForUI);
      const uniqueBuyers = normalized.reduce((acc: UIBuyer[], current: UIBuyer) => {
        const exists = acc.some(buyer => buyer.id === current.id || (buyer.phone && current.phone && buyer.phone === current.phone));
        if (!exists) acc.push(current);
        return acc;
      }, []);
      const sorted = [...uniqueBuyers].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      setAllBuyers(sorted);
    } catch (err) {
      toast.error('Failed to fetch buyers');
      setAllBuyers([]);
    } finally {
      setLoading(false);
    }
  }, [normalizeBuyerForUI]);

  useEffect(() => { fetchBuyers(); }, [fetchBuyers]);

  useEffect(() => {
    if (allBuyers.length > 0 && user) {
      const filtered = filterBuyersByRole(user, allBuyers, executives, showUnassignedToExecutives);
      setRoleFilteredBuyers(filtered);
    } else {
      setRoleFilteredBuyers([]);
    }
  }, [allBuyers, user, executives, showUnassignedToExecutives]);

  useEffect(() => {
  const updateBuyersWithExecutiveNames = async () => {
    if (allBuyers.length > 0 && executives.length > 0) {
      const updatedBuyers = allBuyers.map(buyer => {
        if (buyer.assigned_executive) {
          const { name: execName } = resolveExecutiveName(buyer.assigned_executive);
          if (execName !== buyer.assigned_executive_name) {
            return { ...buyer, assigned_executive_name: execName };
          }
        }
        return buyer;
      });
      const hasChanges = updatedBuyers.some((buyer, index) =>
        buyer.assigned_executive_name !== allBuyers[index]?.assigned_executive_name
      );
      if (hasChanges) setAllBuyers(updatedBuyers);
    }
  };
  updateBuyersWithExecutiveNames();
}, [executives, allBuyers, resolveExecutiveName]);
  const tabs = [
    { id: 'all', label: 'All', count: roleFilteredBuyers.length },
    { id: 'uncontacts', label: 'Uncontacts', count: roleFilteredBuyers.filter(b => (b.source || '').toLowerCase() === 'whatsapp').length },

    { id: 'hot_leads', label: 'Hot Leads', count: roleFilteredBuyers.filter(b => priorityKey(b.priority) === 'high').length },
    { id: 'active', label: 'Active', count: roleFilteredBuyers.filter(b => b.is_active === true).length },
    { id: 'property_hunting', label: 'Property Hunting', count: roleFilteredBuyers.filter(b => stageKey(b.stage) === 'property_hunting').length },
    { id: 'loan_processing', label: 'Loan Processing', count: roleFilteredBuyers.filter(b => stageKey(b.stage) === 'loan_processing').length },
    { id: 'ready_to_buy', label: 'Ready to Buy', count: roleFilteredBuyers.filter(b => stageKey(b.stage) === 'property_finalization').length }
  ];

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

  const filteredSortedBuyers = roleFilteredBuyers.filter(buyer => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = (buyer.name ?? '').toLowerCase().includes(s) ||
      (buyer.phone ?? '').includes(searchTerm) ||
      (buyer.email ?? '').toLowerCase().includes(s) ||
      (buyer.location ?? '').toLowerCase().includes(s) ||
      (buyer.assigned_executive_name ?? '').toLowerCase().includes(s);

    const stg = stageKey(buyer.stage);
    const pri = priorityKey(buyer.priority);

    const matchesTab = activeTab === 'all' ||
      (activeTab === 'uncontacts' && (buyer.source ?? '').toLowerCase() === 'whatsapp') ||

      (activeTab === 'hot_leads' && pri === 'high') ||
      (activeTab === 'active' && buyer.is_active === true) ||
      (activeTab === 'property_hunting' && stg === 'property_hunting') ||
      (activeTab === 'loan_processing' && stg === 'loan_processing') ||
      (activeTab === 'ready_to_buy' && stg === 'property_finalization');

    const matchesFilters = (filters.source === 'all' || key(buyer.source) === key(filters.source)) &&
  (filters.stage === 'all' || stg === filters.stage) &&
  (filters.priority === 'all' || pri === filters.priority) &&
  (filters.assigned === 'all' || key(buyer.assigned) === key(filters.assigned)) &&
  (filters.assigned_executive === 'all' || key(buyer.assigned_executive) === key(filters.assigned_executive)) &&
  (filters.status === 'all' || key(buyer.status) === key(filters.status)) &&
  (filters.propertyType === 'all' || key(buyer.requirements?.propertyType) === key(filters.propertyType)) &&
  matchesBudgetRange(buyer, filters.budgetRange); // ← यह नई line add हुई

    const created = buyer.created_at ? new Date(buyer.created_at) : null;
    const fromOk = !filters.dateFrom || (created && created >= new Date(filters.dateFrom));
    const toOk = !filters.dateTo || (created && created <= new Date(filters.dateTo));
    const matchesDate = filters.ignoreDate || (fromOk && toOk);

    // Column search
    const cs = colSearch;
    const matchesColSearch = (!cs.buyer || (buyer.name?.toLowerCase().includes(cs.buyer.toLowerCase()) || String(buyer.id).includes(cs.buyer))) &&
      (!cs.contact || (buyer.phone?.includes(cs.contact) || buyer.email?.toLowerCase().includes(cs.contact.toLowerCase()))) &&
      (!cs.business || (buyer.source?.toLowerCase().includes(cs.business.toLowerCase()) || buyer.priority?.toLowerCase().includes(cs.business.toLowerCase()))) &&
      (!cs.assigned || (buyer.assigned_executive_name?.toLowerCase().includes(cs.assigned.toLowerCase()))) &&
      (!cs.requirements || (buyer.requirements?.propertyType?.toLowerCase().includes(cs.requirements.toLowerCase()) || 
        formatCurrency(buyer.budget.min).includes(cs.requirements) || formatCurrency(buyer.budget.max).includes(cs.requirements))) &&
      (!cs.progress || (buyer.stage?.toLowerCase().includes(cs.progress.toLowerCase()))) &&
      (!cs.performance || (String(buyer.matchedPropertiesCount || 0).includes(cs.performance) || 
        String(buyer.activities?.length || 0).includes(cs.performance)));

    return matchesSearch && matchesTab && matchesFilters && matchesDate && matchesColSearch;
  }).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  useEffect(() => { setCurrentPage(1); }, [filters, searchTerm, activeTab, colSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredSortedBuyers.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBuyers = filteredSortedBuyers.slice(startIndex, startIndex + itemsPerPage);

  const handleAddBuyer = () => { setEditingBuyer(null); setShowBuyerForm(true); };
  const handleEditBuyer = (buyer: UIBuyer) => {
    if (!canEditBuyer(buyer)) { toast.error('You do not have permission to edit this buyer'); return; }
    setEditingBuyer(buyer); setShowBuyerForm(true);
  };
  const handleViewBuyer = (buyer: UIBuyer) => {
    if (!canViewBuyer(buyer)) { toast.error('You do not have permission to view this buyer'); return; }
    const index = filteredSortedBuyers.findIndex(b => b.id === buyer.id);
    setCurrentBuyerIndex(index >= 0 ? index : 0);
    setCurrentBuyerView(buyer);
  };
  const handleBuyerAccount = (buyer: UIBuyer) => {
    if (!canViewBuyer(buyer)) { toast.error('You do not have permission to view this buyer account'); return; }
    navigate(`/dashboard/buyers-account/${buyer.id}`);
  };
  const handleBackToList = () => { setCurrentBuyerView(null); setCurrentBuyerIndex(0); setShowBuyerForm(false); };

  // Updated Delete Buyer with SweetAlert
  const handleDeleteBuyer = async (buyerId: number | string, buyerName?: string) => {
    const buyer = allBuyers.find(b => b.id === buyerId);
    if (!buyer) return;
    if (!canDeleteBuyer(buyer)) {
      toast.error('You do not have permission to delete this buyer');
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete buyer "${buyerName || buyer.name || 'this buyer'}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      background: '#fff',
      backdrop: 'rgba(0,0,0,0.4)',
      width: '400px',
      padding: '1.5rem',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-lg font-bold text-gray-800',
        htmlContainer: 'text-sm text-gray-600 my-2',
        confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1',
        cancelButton: 'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1',
        actions: 'flex justify-center gap-2 mt-4'
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    try {
      await buyerAPI.delete(String(buyerId));
      setAllBuyers(prev => prev.filter(b => b.id !== buyerId));
      
      Swal.fire({
        title: 'Deleted!',
        text: 'Buyer has been deleted successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        width: '350px',
        padding: '1rem',
        customClass: {
          popup: 'rounded-xl shadow-2xl',
          title: 'text-base font-bold text-green-600',
          htmlContainer: 'text-xs text-gray-600'
        }
      });
    } catch (err) {
      toast.error('Failed to delete buyer. Please try again.');
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete buyer. Please try again.',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
        width: '350px',
        padding: '1rem',
        customClass: {
          popup: 'rounded-xl shadow-2xl',
          title: 'text-base font-bold text-red-600',
          htmlContainer: 'text-xs text-gray-600',
          confirmButton: 'px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors'
        },
        buttonsStyling: false
      });
    }
  };

  const handleSaveBuyer = async (response: any) => {
    try {
      if (!response) throw new Error('No response received from server');
      const normalizedBuyer = normalizeBuyerForUI({ ...response, assigned_executive: response.assigned_executive ?? user?.id ?? null });
      if (editingBuyer) {
        setAllBuyers(prev => prev.map(b => b.id === editingBuyer.id ? normalizedBuyer : b));
        toast.success('Buyer updated successfully');
      } else {
        setAllBuyers(prev => [normalizedBuyer, ...prev]);
        toast.success('Buyer created successfully');
      }
      setShowBuyerForm(false);
      setEditingBuyer(null);
      setCurrentPage(1);
      setTimeout(() => { if (tableScrollRef.current) tableScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' }); }, 100);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save buyer');
      fetchBuyers();
    }
  };

  const handleBuyerSelection = (buyerId: number | string) => {
    const buyer = roleFilteredBuyers.find(b => b.id === buyerId);
    if (!buyer || !canViewBuyer(buyer)) { toast.error('You do not have permission to select this buyer'); return; }
    setSelectedBuyers(prev => prev.includes(buyerId) ? prev.filter(id => id !== buyerId) : [...prev, buyerId]);
  };

  const handleSelectAll = () => {
    const selectableBuyers = paginatedBuyers.filter(b => {
      if (isAdmin) return true;
      if (isExecutive) return String(b.assigned_executive) === String(user?.id);
      return false;
    });
    if (selectedBuyers.length === selectableBuyers.length && selectableBuyers.length > 0) {
      setSelectedBuyers([]);
    } else {
      setSelectedBuyers(selectableBuyers.map(b => b.id));
    }
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

  const handleAssignExecutive = async (executiveId: string | number | null) => {
    if (selectedBuyers.length === 0) { toast.info('Please select buyers to assign executive'); return; }
    if (!canAssign) { toast.error('You do not have permission to assign executives'); return; }
    if (user?.role?.toLowerCase().includes('executive') && executiveId !== 0 && String(executiveId) !== String(user.id)) {
      toast.error("You can only assign buyers to yourself");
      return;
    }

    try {
      const buyerIds = selectedBuyers.map(id => String(id));
      const apiExecutiveId = executiveId === 0 ? null : executiveId;
      const result = await buyerAPI.bulkAssignExecutive(buyerIds, apiExecutiveId, false);
      if (result.success) {
        const executive = executives.find(exec => exec.id == executiveId);
        const execName = executive ? executive.name : 'Not assigned';
        setAllBuyers(prev => prev.map(buyer => selectedBuyers.includes(buyer.id) ? { ...buyer, assigned_executive: apiExecutiveId, assigned_executive_name: execName !== 'Not assigned' ? execName : null } : buyer));
        setSelectedBuyers([]);
        setSelectedExecId(null);
        setExecDropdownOpen(false);
        toast.success(`Executive assigned to ${selectedBuyers.length} buyer(s) successfully`);
      } else {
        toast.error(result.message || 'Failed to assign executive');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign executive');
    }
  };

  // Updated Bulk Delete with SweetAlert
  const handleBulkDelete = async () => {
    if (selectedBuyers.length === 0) {
      toast.info('⚠️ No buyers selected for deletion.');
      return;
    }

    const buyersToDelete = allBuyers.filter(b => selectedBuyers.includes(b.id));
    const unauthorizedBuyers = buyersToDelete.filter(b => !canDeleteBuyer(b));
    if (unauthorizedBuyers.length > 0) {
      toast.error(`You do not have permission to delete ${unauthorizedBuyers.length} buyer(s)`);
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete ${selectedBuyers.length} buyer(s). This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: `Yes, delete ${selectedBuyers.length} buyer(s)!`,
      cancelButtonText: 'Cancel',
      background: '#fff',
      backdrop: 'rgba(0,0,0,0.4)',
      width: '400px',
      padding: '1.5rem',
      customClass: {
        popup: 'rounded-xl shadow-2xl',
        title: 'text-lg font-bold text-gray-800',
        htmlContainer: 'text-sm text-gray-600 my-2',
        confirmButton: 'px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1',
        cancelButton: 'px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1',
        actions: 'flex justify-center gap-2 mt-4'
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    const ids = selectedBuyers.map(id => String(id));
    const prevBuyers = allBuyers;
    try {
      setBulkDeleting(true);
      setAllBuyers(prev => prev.filter(b => !ids.includes(String(b.id))));
      setSelectedBuyers([]);
      await buyerAPI.bulkDelete(ids, false);
      
      Swal.fire({
        title: 'Deleted!',
        text: `${ids.length} buyer(s) have been deleted successfully.`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        width: '350px',
        padding: '1rem',
        customClass: {
          popup: 'rounded-xl shadow-2xl',
          title: 'text-base font-bold text-green-600',
          htmlContainer: 'text-xs text-gray-600'
        }
      });
    } catch (err) {
      setAllBuyers(prevBuyers);
      toast.error('❌ Failed to delete buyers. Try again.');
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete buyers. Please try again.',
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
        width: '350px',
        padding: '1rem',
        customClass: {
          popup: 'rounded-xl shadow-2xl',
          title: 'text-base font-bold text-red-600',
          htmlContainer: 'text-xs text-gray-600',
          confirmButton: 'px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors'
        },
        buttonsStyling: false
      });
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleBulkUpdateLeadField = async (field: string, value: any, onlyEmpty: boolean = false) => {
    if (selectedBuyers.length === 0) { toast.info('Please select buyers to update'); return; }
    if (!canUpdate) { toast.error('You do not have permission to update buyers'); return; }
    const buyersToUpdate = allBuyers.filter(b => selectedBuyers.includes(b.id));
    const unauthorizedBuyers = buyersToUpdate.filter(b => !canEditBuyer(b));
    if (unauthorizedBuyers.length > 0) { toast.error(`You do not have permission to update ${unauthorizedBuyers.length} buyer(s)`); return; }

    try {
      const buyerIds = selectedBuyers.map(id => String(id));
      const result = await buyerAPI.bulkUpdateLeadField(buyerIds, field, value, onlyEmpty);
      if (result.success) {
        setAllBuyers(prev => prev.map(buyer => {
          if (!selectedBuyers.includes(buyer.id)) return buyer;
          const updatedBuyer = { ...buyer };
          if (field === 'buyer_lead_stage') { updatedBuyer.stage = value; updatedBuyer.currentStage = value; }
          else if (field === 'buyer_lead_status') updatedBuyer.status = value;
          else if (field === 'buyer_lead_priority') updatedBuyer.priority = value;
          else if (field === 'is_active') updatedBuyer.is_active = !!Number(value);
          return updatedBuyer;
        }));
        setSelectedBuyers([]);
        toast.success('Field updated successfully');
      } else {
        toast.error(result.message || 'Failed to update field');
      }
    } catch (err) {
      toast.error('Failed to update field');
    }
  };

  const exportToExcel = (mode: 'filtered' | 'selected' | 'all' = 'filtered') => {
  let source: UIBuyer[] = [];
  let modeText = '';
  
  if (mode === 'selected') {
    source = roleFilteredBuyers.filter(b => selectedBuyers.includes(b.id));
    modeText = 'selected';
    if (selectedBuyers.length === 0) { toast.info('No buyers selected to export.'); return; }
  } else if (mode === 'filtered') {
    source = filteredSortedBuyers;
    modeText = 'filtered';
    if (!source || source.length === 0) { toast.info('No buyers found in current view to export.'); return; }
  } else {
    source = roleFilteredBuyers;
    modeText = 'all';
    if (!source || source.length === 0) { toast.info('No buyers available to export.'); return; }
  }

  // Prepare data for Excel export
  const exportData = source.map(b => ({
    'ID': b.id,
    'Name': b.name || '',
    'Salutation': b.salutation || '',
    'Phone': b.phone || '',
    'Email': b.email || '',
    'WhatsApp': b.whatsapp || '',
    'City': b.city || '',
    'State': b.state || '',
    'Location': b.location || '',
    'Source': b.source || '',
    'Priority': b.priority || '',
    'Stage': b.stage || '',
    'Status': b.is_active ? 'Active' : 'Inactive',
    'Assigned Executive': b.assigned_executive_name || 'Not assigned',
    'Lead Score': b.leadScore || 0,
    'Budget Min': b.budget?.min ? `₹${(b.budget.min / 100000).toFixed(1)}L` : '',
    'Budget Max': b.budget?.max ? `₹${(b.budget.max / 100000).toFixed(1)}L` : '',
    'Property Type': b.requirements?.propertyType || '',
    'Unit Types': Array.isArray(b.requirements?.unitTypes) ? b.requirements.unitTypes.join(', ') : '',
    'Preferred Locations': Array.isArray(b.requirements?.preferredLocations) ? b.requirements.preferredLocations.join(', ') : '',
    'Furnishing': b.requirements?.furnishing || '',
    'Possession': b.requirements?.possession || '',
    'Special Requirements': b.requirements?.specialRequirements || '',
    'Loan Required': b.financials?.loanRequired ? 'Yes' : 'No',
    'Loan Amount': b.financials?.loanAmount ? `₹${(b.financials.loanAmount / 100000).toFixed(1)}L` : '',
    'Credit Score': b.financials?.creditScore || '',
    'Property Matches': b.matchedPropertiesCount || 0,
    'Activities Count': b.activities?.length || 0,
    'Total Visits': b.totalVisits || 0,
    'Response Rate': b.responseRate ? `${b.responseRate}%` : '',
    'Notifications': b.notifications || 0,
    'Created At': b.created_at ? new Date(b.created_at).toLocaleString() : '',
    'Last Activity': b.lastActivity ? new Date(b.lastActivity).toLocaleString() : '',
  }));

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(exportData);
  
  // Auto-size columns (set column widths)
  const colWidths = [
    { wch: 10 }, { wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 30 },
    { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 15 },
    { wch: 10 }, { wch: 20 }, { wch: 10 }, { wch: 20 }, { wch: 10 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 25 },
    { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 15 },
    { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
    { wch: 10 }, { wch: 20 }, { wch: 20 }
  ];
  ws['!cols'] = colWidths;

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Buyers_${modeText}`);

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  // Download file
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `buyers_${modeText}_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  toast.success(`Exported ${source.length} buyers to Excel successfully`);
};
  const resetFilters = () => {
    setFilters({
      dateFrom: '', dateTo: '', ignoreDate: false, source: 'all', stage: 'all', priority: 'all',
      assigned: 'all', assigned_executive: 'all', status: 'all', budgetRange: 'all', propertyType: 'all',
    });
    setColSearch({ buyer: "", contact: "", business: "", assigned: "", requirements: "", progress: "", performance: "" });
    setSearchTerm('');
    setActiveTab('all');
  };

  const getColSpan = () => {
    let colSpan = 8;
    if (canUpdate || canDelete || canAssign || canBulkDelete) colSpan += 1;
    if (shouldShowActionsColumn) colSpan += 1;
    return colSpan;
  };

  const assignableExecutives = useMemo(() => executives.filter(e => e.id !== 0).map(e => ({ id: String(e.id), name: e.name })), [executives]);

  const getInitials = (name: string | null) => {
    if (!name) return 'B';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

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
            setAllBuyers(prev => {
              const next = prev.map(b => (b.id === updatedBuyer.id ? updatedBuyer : b));
              return next.sort((a, b) => new Date(b.created_at || b.lastActivity || 0).getTime() - new Date(a.created_at || a.lastActivity || 0).getTime());
            });
            setCurrentBuyerView(updatedBuyer);
          }}
        />
        {showBuyerForm && <BuyerFormModal isOpen={showBuyerForm} buyer={editingBuyer} onClose={() => setShowBuyerForm(false)} onSave={handleSaveBuyer} />}
        {showImportBuyers && <ImportBuyersLeadsModal isOpen={showImportBuyers} onClose={() => setShowImportBuyers(false)} />}
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f5f6f8' }}>
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 py-0 sm:py-6">
        {/* TABS ROW */}
        <div className="hidden sm:flex items-center justify-between gap-3 mb-3">
          <div className="overflow-x-auto scrollbar-hide flex-1 min-w-0">
            <div className="flex gap-1 min-w-max bg-gray-100 p-1 rounded-xl">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${isActive ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    style={isActive ? { color: RESALE.orange } : {}}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${isActive ? `bg-orange-100 text-orange-600` : 'bg-gray-200 text-gray-600'}`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
  <button onClick={() => setShowFilters(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm text-black bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
    <SlidersHorizontal size={14} /><span>Filters</span>
  </button>
  {canExport && (
    <>
      <button onClick={() => exportToExcel('filtered')} className="flex items-center gap-1.5 px-3 py-2 text-sm text-black bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
        <Download size={14} /><span>Export</span>
      </button>
      {selectedBuyers.length > 0 && (
        <button onClick={() => exportToExcel('selected')} className="flex items-center gap-1.5 px-3 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700">
          <Download size={14} /><span>Export Selected ({selectedBuyers.length})</span>
        </button>
      )}
    </>
  )}
  {canImport && <button onClick={() => setShowImportBuyers(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm text-black bg-white border border-gray-200 rounded-lg hover:bg-gray-50"><Upload size={14} /><span>Import</span></button>}
  {canCreate && <button onClick={handleAddBuyer} className="flex items-center gap-1.5 px-3 py-2 text-sm text-white rounded-lg bg-[#0f2b3d]" ><Plus size={14} /><span>Add Buyer</span></button>}
</div>
        </div>

        {/* MOBILE TABS */}
        <div className="flex sm:hidden items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 ml-auto mt-2">
  <button onClick={() => setShowFilters(true)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-black bg-white border border-gray-200 rounded-lg"><SlidersHorizontal size={13} /><span>Filters</span></button>
  {canExport && (
    <>
      <button onClick={() => exportToExcel('filtered')} className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-black bg-white border border-gray-200 rounded-lg"><Download size={13} /><span>Export</span></button>
      {selectedBuyers.length > 0 && (
        <button onClick={() => exportToExcel('selected')} className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-white bg-green-600 rounded-lg"><Download size={13} /><span>Exp Sel ({selectedBuyers.length})</span></button>
      )}
    </>
  )}
  {canImport && <button onClick={() => setShowImportBuyers(true)} className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-black bg-white border border-gray-200 rounded-lg"><Upload size={13} /><span>Import</span></button>}
  {canCreate && <button onClick={handleAddBuyer} className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-white rounded-lg bg-[#0f2b3d]"><Plus size={13} /><span>Add Buyer</span></button>}
</div>
        </div>

        <div className="flex sm:hidden items-center gap-2 mb-3">
          <div className="overflow-x-auto scrollbar-hide flex-1 min-w-0">
            <div className="flex gap-1 min-w-max bg-gray-100 p-1 rounded-xl">
              {tabs.slice(0, 4).map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => { setActiveTab(tab.id); setCurrentPage(1); }} className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${isActive ? 'bg-white shadow-sm' : 'text-gray-500'}`} style={isActive ? { color: RESALE.orange } : {}}>
                    <span>{tab.label}</span>
                    <span className={`px-1 py-0.5 rounded-full text-[10px] font-semibold ${isActive ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-600'}`}>{tab.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <select value={itemsPerPage} onChange={(e) => setItemsPerPage(parseInt(e.target.value, 10))} className="flex-shrink-0 px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white">
            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/pg</option>)}
          </select>
        </div>

        {/* BULK ACTION BAR */}
        {selectedBuyers.length > 0 && (canUpdate || canAssign || canBulkDelete) && (
          <div className="bg-white border border-gray-200 rounded-xl p-3 mb-3 shadow-sm flex flex-col gap-2 sm:flex-wrap sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 w-full sm:w-auto flex-nowrap overflow-x-auto">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border" style={{ color: RESALE.orange, backgroundColor: `${RESALE.orange}15`, borderColor: `${RESALE.orange}40` }}>
                Selected: {selectedBuyers.length}
              </span>
              {canUpdate && (
                <>
                  <select value={bulkStage} onChange={(e) => setBulkStage(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white">
                    <option value="">Update Stage...</option>
                    {effectiveStageOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <button onClick={() => { if (bulkStage) { handleBulkUpdateLeadField('buyer_lead_stage', bulkStage); setBulkStage(''); } }} disabled={bulkLoading || !bulkStage} className="px-3 py-1 text-xs text-white rounded-lg disabled:opacity-50" style={{ backgroundColor: RESALE.orange }}>Apply</button>
                  <select value={bulkPriority} onChange={(e) => setBulkPriority(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white">
                    <option value="">Update Priority...</option>
                    {effectivePriorityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                  <button onClick={() => { if (bulkPriority) { handleBulkUpdateLeadField('buyer_lead_priority', bulkPriority); setBulkPriority(''); } }} disabled={bulkLoading || !bulkPriority} className="px-3 py-1 text-xs text-white rounded-lg disabled:opacity-50" style={{ backgroundColor: RESALE.orange }}>Apply</button>
                </>
              )}
              {canBulkDelete && <button onClick={handleBulkDelete} disabled={bulkLoading || selectedBuyers.length === 0} className="sm:hidden px-3 py-1 text-xs border border-red-300 text-red-600 rounded-lg">Delete</button>}
              <div className="hidden sm:block h-5 w-px bg-gray-200" />
              {canAssign && (
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="text-xs text-gray-500">Assign:</span>
                  <select value={bulkAssignee} onChange={(e) => setBulkAssignee(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white min-w-[130px]">
                    <option value="">Assign...</option>
                    <option value="Unassigned">Unassign</option>
                    {assignableExecutives.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                  <button onClick={() => { if (bulkAssignee) { const execId = bulkAssignee === 'Unassigned' ? null : bulkAssignee; handleAssignExecutive(execId); setBulkAssignee(''); } }} disabled={bulkLoading || !bulkAssignee} className="px-3 py-1 text-xs text-white rounded-lg disabled:opacity-50" style={{ backgroundColor: RESALE.orange }}>Apply</button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 w-full sm:hidden">
              {canAssign && (
                <div className="flex items-center gap-1.5">
                  <select value={bulkAssignee} onChange={(e) => setBulkAssignee(e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white min-w-[120px]">
                    <option value="">Assign...</option>
                    <option value="Unassigned">Unassign</option>
                    {assignableExecutives.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                  <button onClick={() => { if (bulkAssignee) { const execId = bulkAssignee === 'Unassigned' ? null : bulkAssignee; handleAssignExecutive(execId); setBulkAssignee(''); } }} disabled={bulkLoading || !bulkAssignee} className="px-3 py-1 text-xs text-white rounded-lg disabled:opacity-50" style={{ backgroundColor: RESALE.orange }}>Apply</button>
                </div>
              )}
              <button onClick={() => setSelectedBuyers([])} className="ml-auto px-3 py-1 text-xs border border-gray-200 text-gray-600 rounded-lg">Clear</button>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 ml-auto">
              {canUpdate && (
                <>
                  <button onClick={() => handleBulkUpdateLeadField('is_active', 1)} className="px-3 py-1 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Mark Active</button>
                  <button onClick={() => handleBulkUpdateLeadField('is_active', 0)} className="px-3 py-1 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-700">Mark Inactive</button>
                </>
              )}

               {/* ADD THIS Export Selected Button */}
  {canExport && (
    <button onClick={() => exportToExcel('selected')} className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700">
      Export ({selectedBuyers.length})
    </button>
  )}
              {canBulkDelete && <button onClick={handleBulkDelete} disabled={bulkLoading || selectedBuyers.length === 0} className="px-3 py-1 text-xs border border-red-300 text-red-600 rounded-lg hover:bg-red-50">Delete ({selectedBuyers.length})</button>}
              <button onClick={() => setSelectedBuyers([])} className="px-3 py-1 text-xs border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50">Clear</button>
            </div>
          </div>
        )}

        {selectedBuyers.length === 0 && (
          <div className="hidden sm:flex justify-end mb-3">
            <select value={itemsPerPage} onChange={(e) => setItemsPerPage(parseInt(e.target.value, 10))} className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white">
              {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} / page</option>)}
            </select>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search buyers by name, phone, email, location..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm" />
          </div>
        </div>

        {/* MAIN TABLE */}
<div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden h-full">  {loading ? (
            <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
          ) : (
            <>
              {isExecutive && (
                <div className="bg-blue-50 border-b border-blue-100 px-3 py-1.5 text-xs text-blue-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div className="flex items-center gap-1.5"><AlertCircle size={10} /><span>You are viewing buyers assigned to you only{showUnassignedToExecutives && <span className="text-blue-600"> (including unassigned)</span>}</span></div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-0.5 text-[10px]"><input type="checkbox" checked={showUnassignedToExecutives} onChange={(e) => setShowUnassignedToExecutives(e.target.checked)} className="rounded w-3 h-3" /> Show unassigned</label>
                    <span>Total: <span className="font-bold">{filteredSortedBuyers.length}</span> buyers</span>
                  </div>
                </div>
              )}

<div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-hidden h-full">  {loading ? (
            <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
          ) : (
            <>
              {isExecutive && (
                <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 text-xs text-blue-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2"><AlertCircle size={12} /><span>You are viewing buyers assigned to you only{showUnassignedToExecutives && <span className="text-blue-600"> (including unassigned)</span>}</span></div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 text-[11px]"><input type="checkbox" checked={showUnassignedToExecutives} onChange={(e) => setShowUnassignedToExecutives(e.target.checked)} className="rounded" /> Show unassigned</label>
                    <span>Total: <span className="font-bold">{filteredSortedBuyers.length}</span> buyers</span>
                  </div>
                </div>
              )}

<div className="overflow-y-auto max-h-[calc(100vh-300px)] sm:max-h-[calc(100vh-300px)]">
  <table className="w-full" style={{ minWidth: '1200px' }}>
    <thead className="bg-[#f3f4f6] sticky top-0 z-10">
      <tr>
        {(canUpdate || canDelete || canAssign || canBulkDelete) && <th className="w-8 px-2 py-2 text-left"><input type="checkbox" checked={selectedBuyers.length === paginatedBuyers.length && paginatedBuyers.length > 0} onChange={handleSelectAll} className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" /></th>}
        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase">BUYER DETAILS</th>
        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase">CONTACT & LOCATION</th>
        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase">BUSINESS INFO</th>
        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase">ASSIGNED TO</th>
        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase">REQUIREMENTS & BUDGET</th>
        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase">PROGRESS & ACTIVITY</th>
        <th className="px-2 py-2 text-left text-xs font-medium text-black uppercase">PERFORMANCE</th>
        {shouldShowActionsColumn && <th className="px-2 py-2 text-right text-xs font-medium text-black uppercase">ACTIONS</th>}
      </tr>
      {/* Column Search Row */}
      <tr className="bg-[#e5e7eb] text-gray-500">
        {(canUpdate || canDelete || canAssign || canBulkDelete) && <th className="px-2 py-1"></th>}
        <th className="px-1.5 py-1"><input type="text" placeholder="Search buyer..." value={colSearch.buyer} onChange={e => setColSearch(p => ({ ...p, buyer: e.target.value }))} className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded bg-[#FFFFFF26]" /></th>
        <th className="px-1.5 py-1"><input type="text" placeholder="Search contact..." value={colSearch.contact} onChange={e => setColSearch(p => ({ ...p, contact: e.target.value }))} className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded bg-[#FFFFFF26]" /></th>
        <th className="px-1.5 py-1"><input type="text" placeholder="Search source/priority..." value={colSearch.business} onChange={e => setColSearch(p => ({ ...p, business: e.target.value }))} className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded bg-[#FFFFFF26]" /></th>
        <th className="px-1.5 py-1"><input type="text" placeholder="Search assigned..." value={colSearch.assigned} onChange={e => setColSearch(p => ({ ...p, assigned: e.target.value }))} className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded bg-[#FFFFFF26]" /></th>
        <th className="px-1.5 py-1"><input type="text" placeholder="Search requirements..." value={colSearch.requirements} onChange={e => setColSearch(p => ({ ...p, requirements: e.target.value }))} className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded bg-[#FFFFFF26]" /></th>
        <th className="px-1.5 py-1"><input type="text" placeholder="Search stage..." value={colSearch.progress} onChange={e => setColSearch(p => ({ ...p, progress: e.target.value }))} className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded bg-[#FFFFFF26]" /></th>
        <th className="px-1.5 py-1"><input type="text" placeholder="Search matches/activities..." value={colSearch.performance} onChange={e => setColSearch(p => ({ ...p, performance: e.target.value }))} className="w-full px-1.5 py-1 text-xs border border-gray-300 rounded bg-[#FFFFFF26]" /></th>
        {shouldShowActionsColumn && <th className="px-1.5 py-1"></th>}
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-100">
      {paginatedBuyers.map((buyer) => {
        const { name: execName, isCurrentUser } = resolveExecutiveName(buyer.assigned_executive);
        const initials = getInitials(buyer.name);
        return (
          <tr key={buyer.id} className="hover:bg-gray-50 transition-colors">
            {(canUpdate || canDelete || canAssign || canBulkDelete) && (
              <td className="px-2 py-2"><input type="checkbox" checked={selectedBuyers.includes(buyer.id)} onChange={() => handleBuyerSelection(buyer.id)} className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" /></td>
            )}
            {/* Buyer Details */}
            <td className="px-2 py-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0 shadow-sm" style={{ backgroundColor: RESALE.orange }}>
                  {initials}
                </div>
                <div className="min-w-0">
                  <button onClick={() => handleViewBuyer(buyer)} className="font-medium text-sm text-gray-900 hover:text-orange-500 text-left leading-tight">
                    {buyer.salutation && `${buyer.salutation} `}{buyer.name || 'Unknown'}
                  </button>
                  <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-400">ID: {String(buyer.id).slice(0, 6)}</span>
                    {getStatusBadge(buyer.is_active)}
                  </div>
                </div>
              </div>
            </td>
            {/* Contact & Location */}
            <td className="px-2 py-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1"><Phone size={11} className="text-gray-400" /><a href={`tel:${buyer.phone}`} className="text-xs text-gray-600 hover:text-orange-500">{safeStr(buyer.phone)}</a></div>
                <div className="flex items-center gap-1"><Mail size={11} className="text-gray-400" /><a href={`mailto:${buyer.email}`} className="text-xs text-gray-600 hover:text-orange-500 truncate max-w-[130px]">{safeStr(buyer.email)}</a></div>
                {buyer.whatsapp && <div className="flex items-center gap-1"><SiWhatsapp size={11} className="text-green-500" /><a href={`https://wa.me/${buyer.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-600 hover:text-green-600">{buyer.whatsapp.replace(/\D/g, '')}</a></div>}
                <div className="flex items-center gap-1"><MapPin size={11} className="text-gray-400" /><span className="text-xs text-gray-600">{safeStr(buyer.location)}{buyer.city ? `, ${buyer.city}` : ''}</span></div>
              </div>
            </td>
            {/* Business Info */}
            <td className="px-2 py-2">
              <div className="space-y-0.5">
                <div className="text-[10px]"><span className="text-gray-500">Source:</span> <span className="font-medium text-blue-700">{buyer.source || 'Not specified'}</span></div>
                <div>{getPriorityBadge(buyer.priority)}</div>
                {buyer.created_at && <div className="flex items-center gap-1 text-[10px] text-gray-500"><Clock size={10} /><span>{formatDateTime(buyer.created_at)}</span></div>}
              </div>
            </td>
            {/* Assigned To */}
            <td className="px-2 py-2">
              {buyer.assigned_executive ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-[10px] text-gray-600 flex-shrink-0">
                    {execName?.charAt(0) || "U"}
                  </div>
                  <div className="font-semibold text-gray-900 text-[11px]">{execName}</div>
                  {isCurrentUser && <span className="text-[8px] bg-green-100 text-green-700 px-1 rounded">You</span>}
                </div>
              ) : <span className="text-[11px] text-gray-400 italic">Not assigned</span>}
            </td>
            {/* Requirements & Budget */}
            <td className="px-2 py-2">
              <div className="space-y-0.5">
                <div className="text-[10px]"><span className="text-gray-500">Property:</span> <span className="font-medium">{buyer.requirements?.propertyType || '—'}</span></div>
                <div className="text-[10px]"><span className="text-gray-500">Types:</span> <span className="text-gray-600">{safeStr(buyer.requirements?.unitTypes)}</span></div>
                <div className="text-[10px]"><span className="text-gray-500">Budget:</span> <span className="font-medium text-green-600 ml-1">{formatCurrency(buyer.budget.min)} - {formatCurrency(buyer.budget.max)}</span></div>
              </div>
            </td>
            {/* Progress & Activity */}
            <td className="px-2 py-2">
              <div className="space-y-0.5">
                {getStageBadge(buyer.stage)}
                <div>
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span>Stage Progress</span>
                    <span>{buyer.stageProgress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-orange-500 h-1 rounded-full" style={{ width: `${buyer.stageProgress || 0}%` }}></div>
                  </div>
                </div>
                <div className="text-[10px] text-gray-600">Last: {formatDate(buyer.lastActivity)}</div>
              </div>
            </td>
            {/* Performance - 2 ROWS (matches & acts in row1, visits & response in row2) */}
            <td className="px-2 py-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Target size={10} className="text-green-500" />
                    <span className={`text-[10px] font-medium ${(buyer.matchedPropertiesCount || 0) > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                      {buyer.matchedPropertiesCount || 0} matches
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity size={10} className="text-orange-500" />
                    <span className="text-[10px] text-gray-600">{buyer.activities?.length ?? 0} acts</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Eye size={10} className="text-purple-500" />
                    <span className="text-[10px] text-gray-600">{buyer.visits ?? 0} visits</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp size={10} className="text-blue-500" />
                    <span className="text-[10px] text-gray-600">{buyer.responseRate ? `${buyer.responseRate}%` : '-'}</span>
                  </div>
                </div>
                {buyer.notifications > 0 && (
                  <div className="flex items-center gap-1">
                    <Bell size={10} className="text-red-500" />
                    <span className="text-[10px] text-red-600 font-medium">{buyer.notifications}</span>
                  </div>
                )}
              </div>
            </td>
     {/* Actions */}
{shouldShowActionsColumn && (
  <td className="px-2 py-2 text-right">
    <div className="flex justify-end gap-0.5">
      <button onClick={() => handleViewBuyer(buyer)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-500" title="View"><Eye size={13} /></button>
      <button onClick={() => handleBuyerAccount(buyer)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-green-600" title="Account"><UserCheck size={13} /></button>
      {canEditBuyer(buyer) && <button onClick={() => handleEditBuyer(buyer)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-orange-500" title="Edit"><Edit size={13} /></button>}
      <div className="relative group">
        <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"><MoreHorizontal size={13} /></button>
        <div className="absolute right-0 top-7 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 w-36">
          <div className="p-0.5">
            {/* Call Button */}
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const phoneNumber = buyer.phone?.replace(/\D/g, '');
                if (phoneNumber && phoneNumber !== '-' && phoneNumber !== '') {
                  window.location.href = `tel:${phoneNumber}`;
                } else {
                  toast.error("No phone number available");
                }
              }} 
              className="flex items-center gap-2 px-2 py-1.5 text-[10px] text-gray-700 hover:bg-gray-100 rounded w-full"
            >
              <PhoneCall size={11} /> Call
            </button>
            
            {/* WhatsApp Button */}
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const phoneNumber = buyer.phone?.replace(/\D/g, '');
                if (phoneNumber && phoneNumber !== '-' && phoneNumber !== '') {
                  const userName = user?.username || user?.name || (user?.email?.split('@')[0]) || 'Team';
                  const message = encodeURIComponent(
                    `Hi ${buyer.salutation || ''} ${buyer.name || 'Buyer'},\n\n` +
                    `I hope you're doing well!\n\n` +
                    `This is regarding your property search for ${buyer.requirements?.propertyType || 'a property'} in ${buyer.location || buyer.city || 'your preferred location'}.\n\n` +
                    `${buyer.budget?.min || buyer.budget?.max ? `💰 Budget: ${formatCurrency(buyer.budget.min)} - ${formatCurrency(buyer.budget.max)}\n\n` : ''}` +
                    `We have found ${buyer.matchedPropertiesCount || 0} properties matching your requirements.\n\n` +
                    `Would you like to schedule a site visit?\n\n` +
                    `Looking forward to your response.\n\n` +
                    `Best Regards,\n` +
                    `${userName}`
                  );
                  window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
                } else {
                  toast.error("No phone number available for WhatsApp");
                }
              }} 
              className="flex items-center gap-2 px-2 py-1.5 text-[10px] text-gray-700 hover:bg-gray-100 rounded w-full"
            >
              <MessageCircle size={11} /> WhatsApp
            </button>
            
            {/* Email Button */}
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const email = buyer.email;
                if (email && email !== '-' && email !== '') {
                  const userName = user?.username || user?.name || (user?.email?.split('@')[0]) || 'Team';
                  const subject = encodeURIComponent(`Property Recommendations - ${buyer.requirements?.propertyType || 'Property'} Search`);
                  const body = encodeURIComponent(
                    `Dear ${buyer.salutation || ''} ${buyer.name || 'Buyer'},\n\n` +
                    `I hope this email finds you well.\n\n` +
                    `📋 Your Requirements Summary:\n` +
                    `• Property Type: ${buyer.requirements?.propertyType || 'Not specified'}\n` +
                    `• Budget: ${formatCurrency(buyer.budget.min)} - ${formatCurrency(buyer.budget.max)}\n` +
                    `• Location: ${buyer.location || buyer.city || 'Not specified'}\n` +
                    `• Unit Types: ${buyer.requirements?.unitTypes || 'Not specified'}\n\n` +
                    `🏠 We have found ${buyer.matchedPropertiesCount || 0} properties matching your requirements.\n\n` +
                    `Would you like to schedule a site visit or receive more details?\n\n` +
                    `Looking forward to your response.\n\n` +
                    `Best Regards,\n` +
                    `${userName}`
                  );
                  window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
                } else {
                  toast.error("No email address available");
                }
              }} 
              className="flex items-center gap-2 px-2 py-1.5 text-[10px] text-gray-700 hover:bg-gray-100 rounded w-full"
            >
              <Send size={11} /> Email
            </button>
            
            {/* FOLLOW-UP Button - Opens Follow-up Modal */}
<button 
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    setSelectedBuyerForFollowup(buyer);
    setShowBuyerFollowupModal(true);
  }} 
  className="flex items-center gap-2 px-2 py-1.5 text-[10px] text-blue-600 hover:bg-blue-50 rounded w-full"
>
  <Calendar size={11} /> Follow-up
</button>
            
            {/* ✅ SEND PROPERTIES Button - WhatsApp with property details */}
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const phoneNumber = buyer.phone?.replace(/\D/g, '');
                if (phoneNumber && phoneNumber !== '-' && phoneNumber !== '') {
                  const userName = user?.username || user?.name || (user?.email?.split('@')[0]) || 'Team';
                  
                  // Get property details from buyer's matched properties or requirements
                  const propertyType = buyer.requirements?.propertyType || 'property';
                  const budget = buyer.budget?.min && buyer.budget?.max 
                    ? `${formatCurrency(buyer.budget.min)} - ${formatCurrency(buyer.budget.max)}`
                    : 'your budget range';
                  const location = buyer.location || buyer.city || 'your preferred location';
                  const unitTypes = Array.isArray(buyer.requirements?.unitTypes) 
                    ? buyer.requirements.unitTypes.join(', ') 
                    : buyer.requirements?.unitTypes || 'property';
                  
                  const message = encodeURIComponent(
                    `🏠 *Property Recommendations for ${buyer.name}* 🏠\n\n` +
                    `Hi ${buyer.salutation || ''} ${buyer.name || 'Buyer'},\n\n` +
                    `Based on your requirements:\n` +
                    `📍 *Location:* ${location}\n` +
                    `💰 *Budget:* ${budget}\n` +
                    `🏢 *Property Type:* ${propertyType}\n` +
                    `📐 *Unit Types:* ${unitTypes}\n\n` +
                    `✨ We have found ${buyer.matchedPropertiesCount || 0} properties matching your criteria!\n\n` +
                    `Would you like to:\n` +
                    `• Schedule a site visit\n` +
                    `• Receive property details via email\n` +
                    `• Discuss further over a call\n\n` +
                    `Please let me know your availability.\n\n` +
                    `Best Regards,\n` +
                    `${userName}\n` +
                    `ResaleExpert Team`
                  );
                  window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
                } else {
                  toast.error("No phone number available to send properties");
                }
              }} 
              className="flex items-center gap-2 px-2 py-1.5 text-[10px] text-purple-600 hover:bg-purple-50 rounded w-full"
            >
              <Home size={11} /> Send Properties
            </button>
            
            {canDeleteBuyer(buyer) && (
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteBuyer(buyer.id, buyer.name || undefined);
                }} 
                className="flex items-center gap-2 px-2 py-1.5 text-[10px] text-red-600 hover:bg-red-100 rounded w-full"
              >
                <Trash2 size={11} /><span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  </td>
)}
          </tr>
        );
      })}
      {paginatedBuyers.length === 0 && (
        <tr><td colSpan={getColSpan()} className="text-center py-8">
          <div className="text-gray-400 mb-1 text-sm">No buyers found</div>
          <p className="text-xs text-gray-400">Try adjusting your filters or search criteria</p>
        </td></tr>
      )}
    </tbody>
  </table>
</div>

              {filteredSortedBuyers.length > 0 && (
<div className="px-4 py-3 border-t border-gray-100 flex flex-row items-center justify-between bg-white">                  <div className="text-xs text-gray-500">Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSortedBuyers.length)} of {filteredSortedBuyers.length} buyers</div>
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
              )}
            </>
          )}
        </div>

              {filteredSortedBuyers.length > 0 && (
<div className="px-3 py-1.5 border-t border-gray-100 flex flex-row items-center justify-between bg-white">                  <div className="text-[10px] text-gray-500">Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSortedBuyers.length)} of {filteredSortedBuyers.length} buyers</div>
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <BuyerSidebarFilter isOpen={showFilters} onClose={() => setShowFilters(false)} filters={filters} setFilters={setFilters} resetFilters={resetFilters} sources={sources} stages={stagesFromMasters} priorities={prioritiesFromMasters} budgetRanges={budgetRanges} propertyTypes={propertyTypes} executives={executives.map(e => ({ id: e.id, name: e.name }))} />
      <BuyerFormModal isOpen={showBuyerForm} onClose={() => { setShowBuyerForm(false); setEditingBuyer(null); }} buyer={editingBuyer} onSave={handleSaveBuyer} />
      <ImportBuyersLeadsModal isOpen={showImportBuyers} onClose={() => setShowImportBuyers(false)} />
        {/* Buyer Follow-up Modal */}
{showBuyerFollowupModal && selectedBuyerForFollowup && (
  <BuyerFollowupModal
    isOpen={showBuyerFollowupModal}
    onClose={() => {
      setShowBuyerFollowupModal(false);
      setSelectedBuyerForFollowup(null);
    }}
    onSave={async (payload) => {
      try {
        // Call API to save follow-up
        const response = await buyerFollowupAPI.create(payload);
        if (response) {
          toast.success("Follow-up added successfully");
          // Refresh buyers to update follow-ups count
          fetchBuyers();
        }
        setShowBuyerFollowupModal(false);
        setSelectedBuyerForFollowup(null);
      } catch (error) {
        console.error("Error adding follow-up:", error);
        toast.error("Failed to add follow-up");
      }
    }}
    tabId="buyer"
    buyerId={selectedBuyerForFollowup.id}
    initialForm={undefined}
  />
)}
    </div>
  );
};

// UI helper functions
function getStatusBadge(is_active: boolean | null) {
  if (is_active === true) return <span className="inline-flex items-center px-1 py-0.5 rounded-full text-[9px] font-medium bg-emerald-100 text-emerald-700">● Active</span>;
  if (is_active === false) return <span className="inline-flex items-center px-1 py-0.5 rounded-full text-[9px] font-medium bg-gray-100 text-gray-600">● Inactive</span>;
  return <span className="inline-flex items-center px-1 py-0.5 rounded-full text-[9px] font-medium bg-gray-100 text-gray-600">–</span>;
}

function getLeadScore(score: number) {
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
  const bgColor = score >= 80 ? 'bg-green-100' : score >= 60 ? 'bg-yellow-100' : 'bg-red-100';
  return <div className={`inline-flex items-center px-1.5 py-0.5 rounded-full ${score > 0 ? bgColor : 'bg-gray-100'} ${score > 0 ? color : 'text-gray-600'} text-[10px]`}><Star size={10} className="mr-0.5" /><span className="font-bold">{score > 0 ? score : '-'}</span></div>;
}

function getStageBadge(stageOrBuyer: string | any) {
  const raw = typeof stageOrBuyer === 'string' ? stageOrBuyer : stageOrBuyer?.buyer_lead_stage ?? stageOrBuyer?.stage ?? '';
  const stageConfig: Record<string, any> = {
    initial_contact: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Initial Contact', icon: '📞' },
    requirement_gathering: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Requirement Gathering', icon: '📋' },
    property_hunting: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Property Hunting', icon: '🔍' },
    loan_processing: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Loan Processing', icon: '🏦' },
    property_finalization: { bg: 'bg-green-100', text: 'text-green-700', label: 'Property Finalization', icon: '✅' },
    deal_closure: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Deal Closure', icon: '🤝' },
    completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completed', icon: '🎉' },
  };
  const keyS = raw.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  const config = stageConfig[keyS] || stageConfig.initial_contact;
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}><span className="mr-1 text-xs">{config.icon}</span><span className="text-[10px] font-normal">{config.label}</span></span>;
}


function matchesBudgetRange(buyer: UIBuyer, budgetRange: string): boolean {
  if (budgetRange === 'all') return true;
  const bMin = buyer.budget?.min;
  const bMax = buyer.budget?.max;
  if (bMin == null && bMax == null) return false;
  const val = bMin != null && bMax != null ? (bMin + bMax) / 2 : (bMin ?? bMax)!;
  const L = 100_000;
  const Cr = 10_000_000;
  switch (budgetRange) {
    case '0-50L':    return val <= 50 * L;
    case '50L-1Cr':  return val > 50 * L  && val <= Cr;
    case '1Cr-2Cr':  return val > Cr       && val <= 2 * Cr;
    case '2Cr-5Cr':  return val > 2 * Cr   && val <= 5 * Cr;
    case '5Cr+':     return val > 5 * Cr;
    default:         return true;
  }
}
function getPriorityBadge(priority: string | null | undefined) {
  const raw = (priority ?? '').toString().trim().toLowerCase();
  const priorityConfig: Record<string, { bg: string; text: string; label: string; icon: string }> = {
    high: { bg: 'bg-red-100', text: 'text-red-700', label: 'High', icon: '🔥' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium', icon: '⚡' },
    low: { bg: 'bg-green-100', text: 'text-green-700', label: 'Low', icon: '🌱' },
  };
  const config = priorityConfig[raw] || { bg: 'bg-gray-100', text: 'text-gray-700', label: raw || '-', icon: '' };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>{config.icon} {config.label}</span>;
}

export default BuyersPage;



