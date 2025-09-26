
import React, { useEffect, useState } from 'react';
import {
  Users, Plus, Search, Filter, Eye, Edit, Trash2, Phone, Mail, MapPin,
  Building, Activity, MoreHorizontal, User, Star, FileText, MessageCircle,
  Bell, Upload, Download, ChevronLeft, ChevronRight, X, Target, Home,
  UserCheck, PhoneCall, Send,
} from 'lucide-react';
import BuyerFormModal from '../../components/buyers/BuyerFormModal';
import BuyerViewPage from '../../components/buyers/BuyerViewPage';
import BuyerAccountPage from '../../components/buyers/BuyerAccountPage';
import ImportBuyersModal from '../../components/buyers/ImportBuyersModal';
import { buyerAPI } from '@/lib/buyerAPI';
import BuyerSidebarFilter from './components/BuyerSidebarFilter';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import TableLoader from '@/components/ui/TableLoader';

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
  // inside BuyersPage component
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const handleBulkDelete = () => {
    if (selectedBuyers.length === 0) {
      toast.info("⚠️ No buyers selected for deletion.", {
        position: "top-center",
      });
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
                  setBuyers(prev =>
                    prev.filter(b => !ids.includes(String(b.id)))
                  );
                  setSelectedBuyers([]);

                  await buyerAPI.bulkDelete(ids, false);

                  toast.success(`🗑️ ${ids.length} buyer(s) deleted successfully.`, {

                  });
                } catch (err) {
                  
                  setBuyers(prevBuyers);
                  toast.error("❌ Failed to delete buyers. Try again.", {

                  });
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
        autoClose: false, // wait for user action
        closeOnClick: false,
        draggable: false,
        position: "top-center", // 👈 toast center me
      }
    );
  };

  // Advanced Filters
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    ignoreDate: false,
    source: 'all',
    stage: 'all',
    priority: 'all',
    assigned: 'all',
    status: 'all',
    budgetRange: 'all',
    propertyType: 'all'
  });

  const [buyers, setBuyers] = useState<UIBuyer[]>([]);

  const formatDate = (val: string | null) => {
    if (!val) return " - ";
    const d = new Date(val);
    if (isNaN(d.getTime())) return " - ";
    return d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "2-digit" });
  };
  // place this inside your BuyersPage component AFTER you compute `filteredBuyers` (so it reads latest filtered list)
  const exportToCSV = (mode: 'filtered' | 'selected' | 'all' = 'filtered') => {
    // decide source based on mode
    let source: UIBuyer[] = [];
    if (mode === 'selected') {
      source = buyers.filter(b => selectedBuyers.includes(b.id));
      if (selectedBuyers.length === 0) {
        alert('No buyers selected to export.');
        return;
      }
    } else if (mode === 'filtered') {
      // IMPORTANT: use filteredBuyers (the visible list)
      source = filteredBuyers;
      if (!source || source.length === 0) {
        alert('No buyers found in current view to export.');
        return;
      }
    } else {
      // all buyers
      source = buyers;
      if (!source || source.length === 0) {
        alert('No buyers available to export.');
        return;
      }
    }

    // columns to export
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
      { key: 'leadScore', label: 'Lead Score' },
      { key: 'budgetMin', label: 'Budget Min' },
      { key: 'budgetMax', label: 'Budget Max' },
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
        leadScore: b.leadScore ?? '',
        budgetMin,
        budgetMax,
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
  };
  const toMySQLDate = (val: string | null) => {
    if (!val) return null;
    const d = new Date(val);
    if (isNaN(d.getTime())) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`; // MySQL DATE format
  };


  const formatDOB = (val: string | null) => {
    if (!val) return ' - ';
    const d = new Date(val);
    if (isNaN(d.getTime())) return ' - ';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`; // ✅ use slash separator
  };




  // -------- Utils (safe parsing + normalization) ----------
  const parseJSON = (val: any) => {
    if (!val) return null;
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return null; }
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

  const normalizeBuyer = (b: any): UIBuyer => {
    const rawReq = parseJSON(b.requirements) || b.requirements || {};
    const fin = parseJSON(b.financials) || b.financials || {};
    const reqPropertyType =
      rawReq.propertyType ?? rawReq.property_type ?? b.propertyType ?? b.property_type ?? null;
    const toStr = (v: any) => (v === null || v === undefined ? null : String(v));
    const budgetMin = toNumOrNull(b.budget_min ?? b.budgetMin);
    const budgetMax = toNumOrNull(b.budget_max ?? b.budgetMax);

    return {
      id: b.id ?? `${b.name ?? 'buyer'}-${Math.random().toString(36).slice(2)}`,
      salutation: b.salutation ?? null,
      name: b.name ?? null,
      phone: b.phone ?? b.mobile ?? null,

      whatsapp: b.whatsapp_number ?? b.whatsapp ?? null,
      email: b.email ?? null,
      dob: b.dob ?? null,
      state: b.state ?? null,
      city: b.city ?? null,
      location: b.location ?? null,
      source: b.buyer_lead_source ?? b.source ?? null,
      priority: (b.buyer_lead_priority ?? b.priority ?? null)?.toString().trim().toLowerCase() ?? null,
      is_active: b.is_active !== undefined ? Boolean(b.is_active) : true,
      stage: b.buyer_lead_stage ?? b.stage ?? null,
      status: b.buyer_lead_status ?? b.status ?? null,
      assigned: b.assigned_to ?? b.assigned ?? null,
      leadScore: toNumOrNull(b.lead_score) ?? toNumOrNull(b.leadScore) ?? 0,
      budget: { min: budgetMin, max: budgetMax },
      expectedClose: b.expected_close ?? null,
      requirements: {
        propertyType: toStr(reqPropertyType),
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
      activities: Array.isArray(b.activities) ? b.activities : [],
      followups: Array.isArray(b.followups) ? b.followups : [],
      documents: Array.isArray(b.documents) ? b.documents : [],
      visits: toNumOrNull(b.visits) ?? 0,
      totalVisits: toNumOrNull(b.totalVisits) ?? 0,
      lastActivity: b.lastActivity ?? b.updated_at ?? null,
      created_at: b.created_at ?? null,
      notifications: toNumOrNull(b.notifications) ?? 0,
      currentStage: b.currentStage ?? (b.buyer_lead_stage ?? b.stage ?? null),
      stageProgress: toNumOrNull(b.stageProgress) ?? 0,
      dealPotential: b.dealPotential ?? null,
      responseRate: toNumOrNull(b.responseRate) ?? 0,
      avgResponseTime: b.avgResponseTime ?? null,
    };
  };

  // -------- Fetch dynamic buyers ----------
  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        setLoading(true);
        const apiBuyers = await buyerAPI.getAll();
        const normalized = Array.isArray(apiBuyers) ? apiBuyers.map(normalizeBuyer) : [];
        setBuyers(normalized);
      } catch (err) {
        
        setBuyers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBuyers();
  }, []);
  // -------- Derived lists & helpers ----------
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

  const sources = ['all', 'Website', 'Referral', 'Social Media', 'Advertisement', 'Walk-in', 'Cold Call'];
  const stages = ['all', 'initial_contact', 'requirement_gathering', 'property_hunting', 'loan_processing', 'property_finalization', 'deal_closure', 'completed'];
  const priorities = ['all', 'high', 'medium', 'low'];
  const budgetRanges = ['all', '0-50L', '50L-1Cr', '1Cr-2Cr', '2Cr-5Cr', '5Cr+'];
  const propertyTypes = ['all', 'Residential', 'Commercial'];

  const safeStr = (v: any) => (v === null || v === undefined || v === '') ? ' - ' : String(v);

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return ' - ';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const filteredBuyers = buyers.filter(buyer => {
    const s = searchTerm.toLowerCase();

    const matchesSearch =
      (buyer.name ?? '').toLowerCase().includes(s) ||
      (buyer.phone ?? '').includes(searchTerm) ||
      (buyer.email ?? '').toLowerCase().includes(s) ||
      (buyer.location ?? '').toLowerCase().includes(s);

    // ---- FIXED: tabs matching aligned with counts (normalized) ----
    const stg = stageKey(buyer.stage);
    const pri = priorityKey(buyer.priority);

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'hot_leads' && pri === 'high') ||
      (activeTab === 'active' && buyer.is_active === true) ||
      (activeTab === 'property_hunting' && stg === 'property_hunting') ||
      (activeTab === 'loan_processing' && stg === 'loan_processing') ||
      (activeTab === 'ready_to_buy' && stg === 'property_finalization');

    // ---- FIXED: filters also normalized for stage/priority ----
    const matchesFilters =
      (filters.source === 'all' || key(buyer.source) === key(filters.source)) &&
      (filters.stage === 'all' || stg === filters.stage) &&
      (filters.priority === 'all' || pri === filters.priority) &&
      (filters.assigned === 'all' || key(buyer.assigned) === key(filters.assigned)) &&
      (filters.status === 'all' || key(buyer.status) === key(filters.status)) &&
      (filters.propertyType === 'all' || key(buyer.requirements?.propertyType) === key(filters.propertyType));

    const created = buyer.created_at ? new Date(buyer.created_at) : null;
    const fromOk = !filters.dateFrom || (created && created >= new Date(filters.dateFrom));
    const toOk = !filters.dateTo || (created && created <= new Date(filters.dateTo));
    const matchesDate = filters.ignoreDate || (fromOk && toOk);

    return matchesSearch && matchesTab && matchesFilters && matchesDate;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredBuyers.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBuyers = filteredBuyers.slice(startIndex, startIndex + itemsPerPage);

  const handleAddBuyer = () => {
    setEditingBuyer(null);
    setShowBuyerForm(true);
  };
  const handleEditBuyer = (buyer: UIBuyer) => {
    setEditingBuyer(buyer);
    setShowBuyerForm(true);
  };
  const handleViewBuyer = (buyer: UIBuyer) => {
    const index = filteredBuyers.findIndex(b => b.id === buyer.id);
    setCurrentBuyerIndex(index >= 0 ? index : 0);
    setCurrentBuyerView(buyer);
  };
  const handleBuyerAccount = (buyer: UIBuyer) => {
    // Navigate to the separate route instead of setting state
    navigate(`/dashboard/buyers-account/${buyer.id}`);
  };
  const handleBackToList = () => {

    setCurrentBuyerView(null);
    setCurrentBuyerIndex(0);
    setShowBuyerForm(false);
  };

  // delete/update/create
  const handleDeleteBuyer = async (buyerId: number | string) => {
    if (!window.confirm('Are you sure you want to delete this buyer?')) return;
    try {
      await buyerAPI.delete(String(buyerId));
      setBuyers(prev => prev.filter(b => b.id !== buyerId));
    } catch (err) {
      
      toast.error('Failed to delete buyer. Please try again.');
    }
  };
  const handleSaveBuyer = async (buyerData: any) => {
    const normalized = normalizeBuyer(buyerData);
    if (normalized.dob) {
      normalized.dob = toMySQLDate(normalized.dob);
    }

    try {
      if (editingBuyer) {
        await buyerAPI.update(String(editingBuyer.id), normalized);
        setBuyers(prev => prev.map(b => b.id === editingBuyer.id ? { ...normalized, id: editingBuyer.id } : b));
      } else {
        setBuyers(prev => [...prev, normalized]);
      }
      setShowBuyerForm(false);
      setEditingBuyer(null);
    } catch (err) {
      toast.error('Error saving buyer:', err);
     
    }
  };

  const handleBuyerSelection = (buyerId: number | string) => {
    setSelectedBuyers(prev =>
      prev.includes(buyerId) ? prev.filter(id => id !== buyerId) : [...prev, buyerId]
    );
  };
  const handleSelectAll = () => {
    if (selectedBuyers.length === paginatedBuyers.length) setSelectedBuyers([]);
    else setSelectedBuyers(paginatedBuyers.map(b => b.id));
  };
  const handleImportBuyers = (buyersData: any[]) => {
    const newBuyers = buyersData.map(normalizeBuyer);
    setBuyers(prev => [...prev, ...newBuyers]);
    setShowImportBuyers(false);
  };
  const handleNextBuyer = () => {
    if (currentBuyerIndex < filteredBuyers.length - 1) {
      const nextIndex = currentBuyerIndex + 1;
      setCurrentBuyerIndex(nextIndex);
      setCurrentBuyerView(filteredBuyers[nextIndex]);
    }
  };
  const handlePreviousBuyer = () => {
    if (currentBuyerIndex > 0) {
      const prevIndex = currentBuyerIndex - 1;
      setCurrentBuyerIndex(prevIndex);
      setCurrentBuyerView(filteredBuyers[prevIndex]);
    }
  };

  const getStatusBadge = (is_active: boolean | null) => {
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
  };

  const getStageBadge = (stageOrBuyer: string | any) => {
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
  };

  const getPriorityBadge = (priority: string | null | undefined) => {
    const raw = (priority ?? "").toString().trim().toLowerCase();
    const alias: Record<string, "high" | "medium" | "low"> = {
      h: "high", urgent: "high", hot: "high",
      m: "medium", normal: "medium",
      l: "low", cold: "low",
    };
    const keyP = (["high", "medium", "low"].includes(raw) ? raw : alias[raw]) ?? "";
    const priorityConfig: Record<string, { bg: string; text: string; label: string; icon: string }> = {
      high: { bg: "bg-red-100", text: "text-red-700", label: "High", icon: "🔥" },
      medium: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Medium", icon: "⚡" },
      low: { bg: "bg-green-100", text: "text-green-700", label: "Low", icon: "🌱" },
    };
    const fallbackLabel = raw ? raw.replace(/\b\w/g, c => c.toUpperCase()) : "—";
    const config = priorityConfig[keyP] ?? { bg: "bg-gray-100", text: "text-gray-700", label: fallbackLabel, icon: "" };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const getLeadScore = (score: number) => {
    const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
    const bgColor = score >= 80 ? 'bg-green-100' : score >= 60 ? 'bg-yellow-100' : 'bg-red-100';
    const label = score > 0 ? score : ' - ';
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full ${score > 0 ? bgColor : 'bg-gray-100'} ${score > 0 ? color : 'text-gray-600'}`}>
        <Star size={12} className="mr-1" />
        <span className="text-xs font-bold">{label}</span>
      </div>
    );
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
      status: 'all',
      budgetRange: 'all',
      propertyType: 'all'
    });
  };

  // --------- Views ----------
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
          totalBuyers={filteredBuyers.length}
          onUpdateBuyer={(updatedBuyer: UIBuyer) => {
            setBuyers(prev => prev.map(b => b.id === updatedBuyer.id ? updatedBuyer : b));
            setCurrentBuyerView(updatedBuyer);
          }}
        />
        ) : <div />

        {showBuyerForm && (
          <BuyerFormModal
            isOpen={showBuyerForm}
            buyer={editingBuyer}
            onClose={() => setShowBuyerForm(false)}
            onSave={handleSaveBuyer}
          />
        )}

        {showImportBuyers && (
          <ImportBuyersModal
            onClose={() => setShowImportBuyers(false)}
            onImport={handleImportBuyers}
          />
        )}
      </div>
    );
  }



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
        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-xs font-medium text-gray-500">Quick:</span>

          {/* quick stages: 'all' first, then first 4 non-'all' stages */}
          {(() => {
            const quickStages = ['all', ...stages.filter(s => s !== 'all').slice(0, 4)];
            return quickStages.map(stage => (
              <button
                key={stage}
                onClick={() => {
                  // If 'all' clicked, reset both stage and priority to 'all'
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
                {stage === 'all' ? 'All' : stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ));
          })()}

          {/* Always show priorities (but they will be reset to 'all' when All-stage is clicked) */}
          {priorities.filter(p => p !== 'all').map(priority => (
            <button
              key={priority}
              onClick={() => {
                setFilters(prev => ({ ...prev, priority }));
                setCurrentPage(1);
              }}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${filters.priority === priority
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
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
          stages={stages}
          priorities={priorities}
          budgetRanges={budgetRanges}
          propertyTypes={propertyTypes}
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
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700">Assign</button>
                <button onClick={() => exportToCSV('selected')} className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">Export</button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">Send Properties</button>
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
      <div className="flex-1 overflow-auto">
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Requirements & Budget</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Progress & Activity</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
               
                <TableLoader colSpan={7} message="Loading buyers..." size="lg" />
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
                        <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                          <User className="text-white" size={14} />
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
                          <span>{safeStr(buyer.location)}{buyer.city ? `, ${buyer.city}` : ""}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="text-gray-500">Property:</span>{" "}
                          {buyer.requirements?.propertyType || "—"}
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500">Types:</span>{" "}
                          {safeStr(buyer.requirements?.unitTypes)}
                        </div>
                        <div className="text-xs">
                          <span className="text-gray-500">Budget:</span>
                          <span className="font-medium text-green-600 ml-1">
                            {formatCurrency(buyer.budget.min)} - {formatCurrency(buyer.budget.max)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getPriorityBadge(buyer?.priority)}
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="space-y-2">
                        {getStageBadge(buyer.stage)}
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${buyer.stageProgress || 0}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          Last: {formatDate(buyer.lastActivity)}
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-xs">
                          <Building size={10} className="text-blue-500" />
                          <span>{buyer.matchedProperties?.length ?? 0} matches</span>
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
                          <Target size={10} className="text-orange-500" />
                          <span>{buyer.responseRate ? `${buyer.responseRate}% response` : " - "}</span>
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
                // ✅ Empty state (not loading + no data)
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-sm text-gray-500">
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
            {filteredBuyers.length > 0
              ? <>Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredBuyers.length)} of {filteredBuyers.length}</>
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
      {showImportBuyers && (
        <ImportBuyersModal
          isOpen={showImportBuyers}
          onClose={() => setShowImportBuyers(false)}
          onImport={handleImportBuyers}
        />
      )}
    </div>
  );
};

export default BuyersPage;
