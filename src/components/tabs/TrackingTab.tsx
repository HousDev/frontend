
import React, { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Share,
  Download,
  MoreHorizontal,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Building,
  Calendar,
  Star,
  Target,
  TrendingUp,
  Users,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  DollarSign,
  Award,
  Activity,
  Bell,
  Settings,
  Plus,
  Trash2,
  Copy,
  Send,
  Archive,
  Flag,
  Bookmark,
  Heart,
  Shield,
  Crown,
  Gem,
  Zap,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Link,
  QrCode,
  Globe,
  Printer,
  Upload,
  Maximize2,
  Home,
  Car,
  Wifi,
  Dumbbell,
  TreePine,
  Waves
} from 'lucide-react';
import DocumentEditModal from '../creation/DocumentEditModal';
import DocumentDeleteModal from '../creation/DocumentDeleteModal';
import DocumentViewModal from './DocumentViewModal';
import DocumentShareModal from './DocumentShareModal';
import { documentsGeneratedAPI } from '@/lib/documentsGeneratedAPI';
// add near the other imports
import { documentStatusAPI, StatusCode } from '@/lib/documentStatusAPI';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import StatusStepper from './StatusStepper';
import PartyVerificationModal from './PartyVerificationModal';
import EsignAadhaarModal from './EsignAadhaarModal';


const normalizeStatus = (s?: string) =>
  (s === 'e-sign_pending' ? 'esign_pending' : s || 'created');


const toExcelIST = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';

  // Format to 12-hour with AM/PM in IST
  const parts = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).formatToParts(d);

  const get = (t: string) => parts.find(p => p.type === t)?.value || '';
  const yyyy = get('year');
  const mm = get('month');
  const dd = get('day');
  const hh = get('hour');
  const mi = get('minute');
  const ss = get('second');
  const dayPeriod = get('dayPeriod'); // AM / PM

  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss} ${dayPeriod}`;
};
export type GenStatus = "draft" | "created";


export type DocumentsGeneratedPayload = {
  template_id: number | string;
  name: string | null;
  description?: string | null;
  category?: string | null;
  content?: string | null;
  variables?: any | null;
  status?: GenStatus;
  created_by?: number;
  updated_by?: number;
};
// Add this interface before your component
export interface DocumentData {
  seller_name: string;
  buyer_name: string;
  seller_phone: string;
  seller_email: string;
  buyer_phone: string;
  buyer_email: string;
  property_address: string;
  property_type: string;
  property_area: string;
  property_area_label: string;
  type_area_line: string;
  sale_amount: number;
  token_amount: number;
  sales_executive: string;
  executive_phone: string;
  executive_email: string;
  document_id: string;
  document_date: string;
  booking_amount: number;
  executive_id: string;
  buyer_id: string;
  seller_id: string;
  property_id: string;
  property_ids: string[];
  total_paid: number;
  total_due: number;
  outstanding_amount: number;
  receipt_count: number;
  last_payment_date: string;
  next_due_date: string;
  notes: string;
  // Optional fields for specific document types
  society_name?: string;
  flat_number?: string;
  commission_rate?: string;
  validity_period?: string;
  loan_account?: string;
}


interface TrackingHistoryItem {
  id: number;
  action: string;
  timestamp: string;
  user: string;
  details: string;
  stage: string;
  icon: string;
}
interface Document {
  id: number;
  title: string;
  template_name: string;
  template_id: number;
  data: DocumentData;
  status: string;
  priority: string;
  created_by: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
  shared_channels: string[];
  stage_progress: number;
  tracking_history: TrackingHistoryItem[];
  otp_verified_at?: string;
  completed_at?: string;
}

const TrackingTab = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [templateFilter, setTemplateFilter] = useState('all');
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [userRole] = useState('admin'); // This would come from auth context
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | string | null>(null);

  const [statusModalInit, setStatusModalInit] = useState<StatusCode | ''>('');
  const [statusModalCurrent, setStatusModalCurrent] = useState<StatusCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // state bucket (component top me)
  const [pendingStepDoc, setPendingStepDoc] = useState<Document | null>(null);
  const [statusAllowed, setStatusAllowed] = useState<StatusCode[] | undefined>(undefined);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyDoc, setVerifyDoc] = useState<Document | null>(null);
  const [showEsignModal, setShowEsignModal] = React.useState(false);
  const [esignDoc, setEsignDoc] = React.useState<Document | null>(null);

  useEffect(() => {
    const onStatus = (e: any) => {
      const { id, status } = e.detail || {};
      // refresh stepper status here
    };
    window.addEventListener("doc:status", onStatus);
    return () => window.removeEventListener("doc:status", onStatus);
  }, []);



  const openStatusModal = async () => {
    if (!selectedDocuments.length) return;

    // 1) fetch fresh snapshots from backend (ensures UI is in sync)
    const snaps = await Promise.all(
      selectedDocuments.map(id => documentStatusAPI.getSnapshot(id))
    );

    // 2) reflect latest status/progress in the table right away
    setDocuments(prev =>
      prev.map(d => {
        const i = selectedDocuments.indexOf(d.id);
        if (i === -1) return d;
        const s = snaps[i];
        return {
          ...d,
          status: normalizeStatus(s?.current_status) || d.status,
          stage_progress: typeof s?.progress_pct === 'number' ? s.progress_pct : d.stage_progress,
        };
      })
    );

    // 3) compute what to preselect in the modal
    const statuses = snaps.map(s => normalizeStatus(s?.current_status) as StatusCode);
    const common = statuses.length && statuses.every(st => st === statuses[0]) ? statuses[0] : '';

    setStatusModalCurrent(statuses);
    setStatusModalInit(common);
    setShowStatusModal(true);
  };

  // Then your useEffect
  const setStatusAndSync = async (docId: number, target: StatusCode, reason: string) => {
    await documentStatusAPI.setStatus(docId, {
      new_status: target,
      reason,
      details: { source: 'ui-stepper' },
      changed_by: Number(user?.id) || null,
    });
    const snap = await documentStatusAPI.getSnapshot(docId);
    setDocuments(prev => prev.map(d =>
      d.id === docId
        ? {
          ...d,
          status: normalizeStatus(snap?.current_status),
          stage_progress: typeof snap?.progress_pct === 'number' ? snap.progress_pct : undefined,
          updated_at: snap?.updated_at ?? d.updated_at,
        }
        : d
    ));
  };

  // ✅ Reusable fetch (TOP-LEVEL, NOT inside useEffect)
  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);

      const res = await documentsGeneratedAPI.getAllWithRelations();
    

      /* ---------- normalize API shapes to an array ---------- */
      const toArray = (r: any): any[] => {
        if (Array.isArray(r)) return r;
        if (Array.isArray(r?.rows)) return r.rows;
        if (Array.isArray(r?.data)) return r.data;
        if (Array.isArray(r?.data?.rows)) return r.data.rows;
        if (Array.isArray(r?.list)) return r.list;
        return [];
      };
      const list = toArray(res);

      /* ---------- tiny helpers ---------- */
      const get = (o: any, paths: string[]) => {
        for (const p of paths) {
          const v = p.split('.').reduce((a: any, k: string) => (a ? a[k] : undefined), o);
          if (v != null && v !== '') return v;
        }
        return undefined;
      };
      const join = (...parts: (string | null | undefined)[]) =>
        parts.map(s => (s ?? '').trim()).filter(Boolean).join(' ');
      const withDot = (s?: string) => (s ? (/\.$/.test(s) ? s : `${s}.`) : '');
      const num = (v: any) => {
        if (v == null || v === '') return null;
        const x = Number(String(v).replace(/[, ]/g, ''));
        return Number.isFinite(x) ? x : null;
      };
      const fmtIST = (iso?: string) => {
        if (!iso) return '';
        const d = new Date(iso);
        if (isNaN(d as any)) return '';
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        const t = new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }).format(d);
        return `${dd}/${mm}/${yyyy} ${t}`;
      };
      const nonEmptyJoin = (...parts: (string | undefined)[]) => parts.filter(Boolean).join(' • ');
      const toStr = (v: any) => (v == null ? '' : String(v));
      const arrIds = (v: any): string[] => {
        if (!v) return [];
        if (Array.isArray(v)) return v.map(x => String(x?.id ?? x)).filter(Boolean);
        return [];
      };

      /* ---------- map safely & match UI types ---------- */
      const mapped: Document[] = list.map((doc: any) => {
        const vars =
          typeof doc?.variables === 'string'
            ? (() => {
              try {
                return JSON.parse(doc.variables);
              } catch {
                return {};
              }
            })()
            : doc?.variables || {};
        const snap = vars.__form_snapshot || {};
        const p = vars.property || snap.property || {};

        // salutations + names
        const sellerSal = get({ vars, snap, doc }, [
          'vars.seller_salutation',
          'vars.seller.salutation',
          'vars.seller_title',
          'vars.seller.title',
          'snap.seller.salutation',
          'doc.seller.salutation',
          'vars.salutation',
        ]) as string | undefined;

        const buyerSal = get({ vars, snap, doc }, [
          'vars.buyer_salutation',
          'vars.buyer.salutation',
          'vars.buyer_title',
          'vars.buyer.title',
          'snap.buyer.salutation',
          'doc.buyer.salutation',
        ]) as string | undefined;

        const sellerFull =
          (get({ vars, snap, doc }, [
            'vars.seller_name',
            'vars.seller.name',
            'snap.seller.name',
            'doc.seller.name',
          ]) as string | undefined) ||
          join(
            get({ vars, snap }, ['vars.seller.first_name', 'snap.seller.first_name']) as string,
            get({ vars, snap }, ['vars.seller.middle_name', 'snap.seller.middle_name']) as string,
            get({ vars, snap }, ['vars.seller.last_name', 'snap.seller.last_name']) as string
          );

        const buyerFull =
          (get({ vars, snap, doc }, [
            'vars.buyer_name',
            'vars.buyer.name',
            'snap.buyer.name',
            'doc.buyer.name',
          ]) as string | undefined) ||
          join(
            get({ vars, snap }, ['vars.buyer.first_name', 'snap.buyer.first_name']) as string,
            get({ vars, snap }, ['vars.buyer.middle_name', 'snap.buyer.middle_name']) as string,
            get({ vars, snap }, ['vars.buyer.last_name', 'snap.buyer.last_name']) as string
          );

        const seller_name = join(withDot(sellerSal), sellerFull) || 'N/A';
        const buyer_name = join(withDot(buyerSal), buyerFull) || 'N/A';

        // contacts
        const seller_phone =
          get({ vars, snap, doc }, [
            'vars.seller_phone',
            'vars.seller.phone',
            'snap.seller_phone',
            'snap.seller.phone',
            'doc.seller.phone',
            'vars.seller_phone_number',
            'vars.seller.contact_phone',
          ]) || '';

        const seller_email =
          get({ vars, snap, doc }, [
            'vars.seller_email',
            'vars.seller.email',
            'snap.seller_email',
            'snap.seller.email',
            'doc.seller.email',
          ]) || '';

        const buyer_phone =
          get({ vars, snap, doc }, [
            'vars.buyer_phone',
            'vars.buyer.phone',
            'snap.buyer_phone',
            'snap.buyer.phone',
            'doc.buyer.phone',
            'vars.buyer_phone_number',
            'vars.buyer.contact_phone',
          ]) || '';

        const buyer_email =
          get({ vars, snap, doc }, [
            'vars.buyer_email',
            'vars.buyer.email',
            'snap.buyer_email',
            'snap.buyer.email',
            'doc.buyer.email',
          ]) || '';

        // property basics
        const areaRaw = get({ vars, p, snap }, [
          'vars.carpet_area',
          'vars.property_area',
          'p.carpet_area',
          'p.area',
          'p.property_area',
          'snap.carpet_area',
          'snap.property_area',
          'snap.property.area',
        ]);
        const areaNum = num(areaRaw);
        const property_area_label = areaNum == null ? '' : `${areaNum} sq ft`;
        const property_area = areaNum == null ? '' : String(areaNum);

        const property_address =
          get({ vars, p, snap }, ['vars.property_address', 'p.address', 'snap.address']) || 'N/A';

        // type lines
        const typeName = (get({ vars, p, snap }, [
          'vars.property_type_name',
          'p.property_type_name',
          'snap.property_type_name',
          'vars.property_type',
          'p.property_type',
        ]) as string | undefined)?.trim();

        const subType = (get({ vars, p, snap }, [
          'vars.property_subtype_name',
          'p.property_subtype_name',
          'snap.property_subtype_name',
        ]) as string | undefined)?.trim();

        const unitType = (get({ vars, p, snap }, [
          'vars.unit_type',
          'p.unit_type',
          'snap.unit_type',
        ]) as string | undefined)?.trim();

        const property_type_line =
          typeName && typeName.toLowerCase() === 'commercial'
            ? typeName
            : nonEmptyJoin(typeName, subType, unitType);

        const type_area_line = nonEmptyJoin(property_type_line, property_area_label);

        // amounts + dates
        const sale_amount = num(get({ vars }, ['vars.deal_price'])) ?? 0;
        const token_amount = num(get({ vars }, ['vars.token_amount'])) ?? 0;

        const booking_amount =
          num(get({ vars }, ['vars.booking_amount', 'vars.token_amount'])) ?? token_amount ?? 0;
        const total_paid = num(get({ vars }, ['vars.total_paid', 'vars.amount_paid'])) ?? 0;
        const total_due = Math.max(sale_amount - total_paid, 0);
        const outstanding_amount = total_due;

        const document_date = fmtIST(doc?.created_at || doc?.createdAt);
        const last_payment_date = fmtIST(get({ vars }, ['vars.last_payment_date']));
        const next_due_date = fmtIST(get({ vars }, ['vars.next_due_date']));
        const receipt_count = Number(get({ vars }, ['vars.receipt_count'])) || 0;

        // IDs as strings
        const executive_id = toStr(
          get({ vars, snap, doc }, [
            'vars.executive_id',
            'snap.executive.id',
            'doc.executive_id',
            'vars.executive.id',
          ])
        );
        const buyer_id = toStr(get({ vars, snap, doc }, ['vars.buyer.id', 'doc.buyer_id', 'snap.buyer.id']));
        const seller_id = toStr(get({ vars, snap, doc }, ['vars.seller.id', 'doc.seller_id', 'snap.seller.id']));
        const property_id = toStr(
          get({ vars, p, snap, doc }, ['p.id', 'vars.property.id', 'doc.property_id', 'snap.property.id'])
        );
        const property_ids = arrIds(vars.properties || snap.properties);

        const exec_name =
          get({ vars, snap, doc }, [
            'vars.executive_name',
            'vars.executive.name',
            'snap.executive.name',
            'doc.executive.name',
            'vars.sales_executive',
          ]) || 'Unassigned';

        const exec_sal = get({ vars, snap, doc }, [
          'vars.executive_salutation',
          'vars.executive.salutation',
          'vars.executive_title',
          'vars.executive.title',
          'snap.executive.salutation',
          'doc.executive.salutation',
        ]) as string | undefined;

        const status = 'created'; // default (will update below)

        return {
          id: Number(doc?.id) || 0,
          title: String(doc?.name || vars?.title || 'Untitled Document'),
          template_name: String(doc?.template_name || doc?.template_description || 'Untitled Template'),
          template_id: Number(doc?.template_id ?? vars?.template_id) || 0,
          data: {
            seller_name,
            buyer_name,
            seller_phone: String(seller_phone),
            seller_email: String(seller_email),
            buyer_phone: String(buyer_phone),
            buyer_email: String(buyer_email),
            property_address: String(property_address),
            property_type: property_type_line || String(vars.property_type || 'N/A'),
            property_area,
            property_area_label,
            type_area_line,
            sale_amount,
            token_amount,
            sales_executive: join(withDot(exec_sal), exec_name) || 'Unassigned',
            executive_phone: String(get({ vars, snap }, ['vars.executive_phone', 'snap.executive_phone']) || ''),
            executive_email: String(get({ vars, snap }, ['vars.executive_email', 'snap.executive_email']) || ''),
            document_id: String(doc?.id || 0),
            document_date,
            booking_amount,
            executive_id,
            buyer_id,
            seller_id,
            property_id,
            property_ids,
            total_paid,
            total_due,
            outstanding_amount,
            receipt_count,
            last_payment_date,
            next_due_date,
            notes: toStr(get({ vars }, ['vars.notes'])),
          },
          status,
          priority: 'medium',
          created_by: doc?.created_by_name || 'Unknown',
          assigned_to: exec_name,
          created_at: doc?.created_at || '',
          updated_at: doc?.updated_at || '',
          shared_channels: [] as string[],
          stage_progress: 0,
          tracking_history: [
            {
              id: 1,
              action: 'Document Created',
              timestamp: doc?.created_at || new Date().toISOString(),
              user: doc?.created_by_name || 'System',
              details: `Generated from template ${doc?.template_id ?? vars?.template_id ?? '?'}`,
              stage: 'created',
              icon: 'FileText',
            },
          ],
        };
      });

      // Step 1 — base docs
      setDocuments(mapped);

      // Step 2 — live snapshots
      try {
        const snapshots = await Promise.all(mapped.map(d => documentStatusAPI.getSnapshot(d.id)));
        setDocuments(prev =>
          prev.map((doc, idx) => {
            const snap = snapshots[idx];
            if (!snap) return doc;
            return {
              ...doc,
              status: normalizeStatus(snap.current_status || doc.status),
              stage_progress:
                typeof snap.progress_pct === 'number' ? snap.progress_pct : doc.stage_progress,
            };
          })
        );
      } catch (e) {
        console.warn('⚠️ Failed to load live snapshots:', e);
      }
    } catch (e) {
      console.error('❌ Error fetching documents:', e);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ Mount par ek hi useEffect me call
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);



  // Helps Excel + proper CSV escaping
  const csvEscape = (v: any) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const toISTFileStamp = () => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${yyyy}${mm}${dd}_${hh}${mi}${ss}`;
  };

  const normalizeStatusKey = (s?: string) =>
    s === 'e-sign_pending' ? 'esign_pending' : s || 'created';





  const [documents, setDocuments] = useState([
  ]);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.data.seller_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.data.buyer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.data.property_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.template_name.toLowerCase().includes(searchTerm.toLowerCase());

    // 👇 normalize both sides (handles "e-sign_pending" vs "esign_pending")
    const normDocStatus = normalizeStatusKey(doc.status);
    const normFilterStatus = normalizeStatusKey(statusFilter);

    const matchesStatus = statusFilter === 'all' || normDocStatus === normFilterStatus;
    const matchesPriority = priorityFilter === 'all' || doc.priority === priorityFilter;
    const matchesTemplate = templateFilter === 'all' || doc.template_name === templateFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesTemplate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDocuments = filteredDocuments.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: string) => {
    // normalize: UI sometimes had "e-sign_pending"
    const key = status === 'e-sign_pending' ? 'esign_pending' : status;


    const statusConfig: Record<string, { bg: string; text: string; label: string; icon: any }> = {
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed', icon: CheckCircle },
      esign_pending: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'E-Sign Pending', icon: Clock },
      otp_verified: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'OTP Verified', icon: Shield },
      shared: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Shared', icon: Send },
      created: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Created', icon: FileText },
      on_hold: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'On Hold', icon: AlertCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled', icon: AlertCircle },
    };

    const conf = statusConfig[key] ?? statusConfig.created;
    const Icon = conf.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${conf.bg} ${conf.text}`}>
        <Icon size={14} className="mr-1" />
        {conf.label}
      </span>
    );
  };


  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'high': { bg: 'bg-red-100', text: 'text-red-700', label: 'High', icon: AlertCircle },
      'medium': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium', icon: Clock },
      'low': { bg: 'bg-green-100', text: 'text-green-700', label: 'Low', icon: CheckCircle }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon size={12} className="mr-1" />
        {config.label}
      </span>
    );
  };

  const getStageProgress = (status: string, progress: number) => {
    const key = status === 'e-sign_pending' ? 'esign_pending' : status;
    const stageColors: Record<string, string> = {
      created: 'bg-gray-400',
      shared: 'bg-purple-500',
      otp_verified: 'bg-blue-500',
      esign_pending: 'bg-orange-500',
      completed: 'bg-green-500',
      on_hold: 'bg-yellow-500',
      cancelled: 'bg-red-500',
    };
    const color = stageColors[key] || 'bg-gray-400';
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${progress}%` }} />
      </div>

    );
  };

  const handleDocumentSelection = (docId: number) => {
    setSelectedDocuments(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === paginatedDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(paginatedDocuments.map(d => d.id));
    }
  };

  const handleViewDocument = (doc: any) => {
    setSelectedDocument(doc);
    setShowViewModal(true);
  };

  const handleEditDocument = (doc: any) => {
    setSelectedDocument(doc);
    setShowEditModal(true);
  };

  const handleDeleteDocument = (doc: any) => {
    setSelectedDocument(doc);
    setShowDeleteModal(true);
  };

  const handleShareDocument = (doc: any) => {
    setSelectedDocument(doc);
    setShowShareModal(true);
  };

 const handleDownloadDocument = async (doc: any) => {
  try {
    setDownloadingId(doc.id);

    // ✅ call the new Final PDF API (includes audit page)
    await documentsGeneratedAPI.downloadFinalPdf(doc.id, {
      filenameFallback: `${(doc.title || doc.name || "document")
        .toString()
        .trim()
        .replace(/[^\w\s.-]+/g, "_")}.pdf`,
    });

  } catch (err: any) {
    console.error("Final PDF download failed:", err);
    alert(err?.message || "Final PDF download failed");
  } finally {
    setDownloadingId(null);
  }
};

  const handleSaveDocument = (updatedDoc: any) => {
    setDocuments(prev => prev.map(doc =>
      doc.id === updatedDoc.id ? { ...doc, ...updatedDoc } : doc
    ));
    setShowEditModal(false);
    setSelectedDocument(null);
  };

  const handleDeleteConfirm = async (deleteData: any) => {
    if (!selectedDocument) return;
    try {
      // 🔥 API call to backend
      await documentsGeneratedAPI.softDelete(selectedDocument.id);

      // ✅ Local state update (optimistic)
      setDocuments(prev => prev.filter(doc => doc.id !== selectedDocument.id));

      toast.success("Document deleted successfully (soft delete).");
    } catch (err: any) {
      console.error("Soft delete failed:", err);
      toast.error(err?.message || "Failed to delete document.");
    } finally {
      setShowDeleteModal(false);
      setSelectedDocument(null);
    }
  };





  const handleBulkStatusChange = async (newStatus: string, reason?: string) => {
    const ids = selectedDocuments.slice();
    if (!ids.length) return;

    const normalized = (newStatus === "e-sign_pending" ? "esign_pending" : newStatus) as StatusCode;

    // snapshot for rollback
    const prevState = documents;

    // optimistic UI
    const nowISO = new Date().toISOString();
    setDocuments(prev =>
      prev.map(doc =>
        ids.includes(doc.id)
          ? {
            ...doc,
            status: normalized,
            updated_at: nowISO,
            assigned_to: doc.assigned_to,
            tracking_history: [
              ...doc.tracking_history,
              {
                id: doc.tracking_history.length + 1,
                action: `Status changed to ${(normalized as string).replace(/_/g, " ")}`,
                timestamp: nowISO,
                user: user?.id || null,
                details: `Reason: ${reason || "—"}`,
                stage: normalized,
                icon: "Settings",
              },
            ],
          }
          : doc
      )
    );

    try {
      // 1) Try transactional bulk
      const result = await documentStatusAPI.bulkSetStatus({
        ids,
        new_status: normalized,
        reason: reason || null,
        details: { source: "ui-bulk" },
        changed_by: Number(user?.id) || null,
      });

      // 2) Sync snapshots
      const byId = new Map(result.snapshots.map(s => [s.document_id, s]));
      setDocuments(prev =>
        prev.map(doc => {
          const snap = byId.get(doc.id);
          return snap
            ? {
              ...doc,
              status: snap.current_status,
              stage_progress:
                typeof snap.progress_pct === "number" ? snap.progress_pct : doc.stage_progress,
              updated_at: snap.updated_at ?? doc.updated_at,
            }
            : doc;
        })
      );

      toast.success(`Status updated for ${result.count} document${result.count > 1 ? "s" : ""}`);
    } catch (bulkErr: any) {
      console.error("Bulk update error (may still have committed):", bulkErr);

      // ✅ VERIFY FIRST: maybe server committed but client errored
      try {
        const snaps = await Promise.all(ids.map(id => documentStatusAPI.getSnapshot(id)));
        const already = snaps.filter(s => s && s.current_status === normalized).map(s => s!.document_id);
        const pending = ids.filter(id => !already.includes(id));

        if (already.length === ids.length) {
          // All done at server — just sync UI & show success
          const byId = new Map(snaps.filter(Boolean).map(s => [s!.document_id, s!]));
          setDocuments(prev =>
            prev.map(doc => {
              const snap = byId.get(doc.id);
              return snap
                ? {
                  ...doc,
                  status: snap.current_status,
                  stage_progress:
                    typeof snap.progress_pct === "number" ? snap.progress_pct : doc.stage_progress,
                  updated_at: snap.updated_at ?? doc.updated_at,
                }
                : doc;
            })
          );
          toast.success(`Status updated for all ${ids.length} documents`);
        } else {
          // Some pending — fallback only for those
          const results = await Promise.allSettled(
            pending.map(id =>
              documentStatusAPI.setStatus(id, {
                new_status: normalized,
                reason: reason || null,
                details: { source: "ui-bulk update" },
                changed_by: Number(user?.id) || null,
              })
            )
          );

          const okIds = results
            .map((r, i) => (r.status === "fulfilled" ? pending[i] : null))
            .filter(Boolean) as number[];

          if (okIds.length) {
            const okSnaps = await Promise.all(okIds.map(id => documentStatusAPI.getSnapshot(id)));
            const byId2 = new Map(okSnaps.filter(Boolean).map(s => [s!.document_id, s!]));
            setDocuments(prev =>
              prev.map(doc => {
                const snap = byId2.get(doc.id);
                return snap
                  ? {
                    ...doc,
                    status: snap.current_status,
                    stage_progress:
                      typeof snap.progress_pct === "number" ? snap.progress_pct : doc.stage_progress,
                    updated_at: snap.updated_at ?? doc.updated_at,
                  }
                  : doc;
              })
            );
          }

          const totalOk = already.length + okIds.length;
          const failCount = ids.length - totalOk;

          if (failCount === 0) {
            toast.success(`Status updated for all ${ids.length} documents`);
          } else if (totalOk > 0) {
            toast.warn(`Partially updated: ${totalOk} succeeded, ${failCount} failed.`);
          } else {
            // full failure — rollback UI
            setDocuments(prevState);
            toast.error(bulkErr?.message || "Bulk update failed and no fallback updates succeeded.");
          }
        }
      } catch (verifyErr) {
        // If even verify failed, be safe: rollback & show error
        console.error("Verification after bulk error failed:", verifyErr);
        setDocuments(prevState);
        toast.error(bulkErr?.message || "Bulk update failed.");
      }
    } finally {
      setSelectedDocuments([]);
      setShowStatusModal(false);
    }
  };
  const handleBulkShare = async () => {
    const selected = documents.filter(d => selectedDocuments.includes(d.id));
    if (!selected.length) return;

    // For demo: share the same payload to all selected docs.
    const payload = {
      channels: ['whatsapp', 'email'],
      message: 'Please review and sign.',
      public_link: '',     // if you have per-doc link, compute in loop
      recipients: [],      // or pass actual recipients
    };

    // optimistic UI
    setDocuments(prev => prev.map(d =>
      selectedDocuments.includes(d.id)
        ? {
          ...d,
          shared_channels: Array.from(new Set([...(d.shared_channels || []), ...payload.channels])),
          tracking_history: [
            ...d.tracking_history,
            {
              id: d.tracking_history.length + 1,
              action: `Shared via ${payload.channels.join(', ')}`,
              timestamp: new Date().toISOString(),
              user: 'Admin User',
              details: payload.message || 'Shared',
              stage: 'shared',
              icon: 'Send',
            },
          ],
        }
        : d
    ));

    // API calls (parallel)
    const results = await Promise.allSettled(
      selected.map(d => documentStatusAPI.createShareBatch(d.id, payload))
    );

    // refresh snapshots for successes
    const okIds = results
      .map((r, i) => (r.status === 'fulfilled' ? selected[i].id : null))
      .filter(Boolean) as number[];

    if (okIds.length) {
      const snaps = await Promise.all(okIds.map(id => documentStatusAPI.getSnapshot(id)));
      setDocuments(prev => prev.map(d => {
        const idx = okIds.indexOf(d.id);
        if (idx === -1) return d;
        const s = snaps[idx];
        return {
          ...d,
          status: s?.current_status || 'shared',
          stage_progress: typeof s?.progress_pct === 'number' ? s.progress_pct : d.stage_progress,
        };
      }));
    }

    setSelectedDocuments([]);
  };



  const handleBulkDownload = async () => {
    const ids = selectedDocuments.length
      ? selectedDocuments
      : filteredDocuments.map(d => d.id);

    if (!ids.length) {
      toast.info("Select at least one document.");
      return;
    }

    try {
      setDownloadingId("bulk");
      await documentsGeneratedAPI.bulkDownloadZip(ids, {
        page: "a4",
        filenamePrefix: "documents",
      });
      toast.success(`Downloading ${ids.length} PDFs as ZIP`);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Bulk download failed");
    } finally {
      setDownloadingId(null);
      setSelectedDocuments([]);
    }
  };


  const handleBulkExport = () => {
    // Prefer selected → else export current filtered view
    const pool = selectedDocuments.length
      ? documents.filter(doc => selectedDocuments.includes(doc.id))
      : filteredDocuments;

    if (!pool.length) {
      toast.info('Nothing to export.');
      return;
    }

    // Columns to export (adjust/order as you like)
    const headers = [
      'ID',
      'Title',
      'Template',
      'Seller',
      'Buyer',
      'Property Type',
      'Property Area (sq ft)',
      'Property Address',
      'Sale Amount',
      'Token Amount',
      'Total Paid',
      'Outstanding',
      'Receipt Count',
      'Last Payment Date',
      'Next Due Date',
      'Status',
      'Progress (%)',
      'Priority',
      'Shared Channels',
      'Assigned To',
      'Created By',
      'Created At',
      'Updated At',
    ];

    const rows = pool.map(doc => {
      const st = normalizeStatusKey(doc.status);
      const channels = (doc.shared_channels || []).join('|');

      return [
        doc.id,
        doc.title,
        doc.template_name,
        doc.data?.seller_name ?? '',
        doc.data?.buyer_name ?? '',
        doc.data?.property_type ?? '',
        doc.data?.property_area ?? '',
        doc.data?.property_address ?? '',
        doc.data?.sale_amount ?? '',
        doc.data?.token_amount ?? '',
        doc.data?.total_paid ?? '',
        doc.data?.outstanding_amount ?? doc.data?.total_due ?? '',
        doc.data?.receipt_count ?? '',
        // 👇👇 convert these to IST for Excel
        toExcelIST(doc.data?.last_payment_date),
        toExcelIST(doc.data?.next_due_date),
        st,
        doc.stage_progress ?? 0,
        doc.priority ?? '',
        channels,
        doc.assigned_to ?? '',
        doc.created_by ?? '',
        toExcelIST(doc.created_at),   // 👈 created_at in IST
        toExcelIST(doc.updated_at),   // 👈 updated_at in IST
      ]
        .map(csvEscape)
        .join(',');
    });


    const csv = [headers.map(csvEscape).join(','), ...rows].join('\r\n');

    // Add UTF-8 BOM so Excel parses UTF-8 correctly
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = toISTFileStamp();
    const scope = selectedDocuments.length ? `selected_${selectedDocuments.length}` : 'filtered';
    a.href = url;
    a.download = `documents_export_${scope}_${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    // Clear selection only if we exported from selection
    if (selectedDocuments.length) setSelectedDocuments([]);

    toast.success(`Exported ${pool.length} row${pool.length > 1 ? 's' : ''} to CSV`);
  };
  // ✅ drop-in replacement
  const handleDuplicateDocument = async (doc: any) => {
    try {
      const source = await documentsGeneratedAPI.getById(doc.id);
      const sourceContent =
        source?.content ??
        source?.templateContent ??
        source?.template_html ??
        source?.template_html_snapshot ??
        null;

      if (!sourceContent) {
        toast.error("Source document has no content to duplicate.");
        return;
      }

      const fallbackCopyCode =
        doc?.data?.document_id ? `${doc.data.document_id}_COPY` : `DOC_COPY_${Date.now()}`;
      const nowISO = new Date().toISOString();

      const payload: DocumentsGeneratedPayload = {
        template_id: doc.template_id,
        name: `${doc.title} (Copy)`,
        description: doc.description ?? null,
        category: doc.category ?? null,
        status: "created",
        content: String(sourceContent),
        created_by: user?.id || doc.created_by || null,  // 👈 keep correct creator
        updated_by: Number(user?.id) || null,                    // 👈 record who duplicated
        variables: {
          __cloned_from: doc.id,
          __source_document_id: doc.data?.document_id,
          document_id: fallbackCopyCode,
          // 🔽 preserve full executive info
          sales_executive: doc.data?.sales_executive,
          executive_id: doc.data?.executive_id,
          executive_phone: doc.data?.executive_phone,
          executive_email: doc.data?.executive_email,
          executive_name: doc.data?.sales_executive,
          // 🔽 preserve seller/buyer
          seller_name: doc.data?.seller_name,
          seller_phone: doc.data?.seller_phone,
          seller_email: doc.data?.seller_email,
          seller_id: doc.data?.seller_id,
          buyer_name: doc.data?.buyer_name,
          buyer_phone: doc.data?.buyer_phone,
          buyer_email: doc.data?.buyer_email,
          buyer_id: doc.data?.buyer_id,
          // 🔽 property data
          property_address: doc.data?.property_address,
          property_type: doc.data?.property_type,
          property_area: doc.data?.property_area,
          property_ids: doc.data?.property_ids ?? [],
          property_id: doc.data?.property_id,
          // 🔽 amounts + misc
          sale_amount: doc.data?.sale_amount,
          token_amount: doc.data?.token_amount,
          booking_amount: doc.data?.booking_amount,
          document_date: nowISO,
          notes: doc.data?.notes || "",
        },
      };

      const created = await documentsGeneratedAPI.create(payload);

      const newId =
        created?.id ?? created?.document?.id ?? created?.data?.id ?? Date.now();
      const createdVars =
        created?.variables || created?.document?.variables || created?.data?.variables;

      let serverDocCode = "";
      try {
        const v = typeof createdVars === "string" ? JSON.parse(createdVars) : createdVars;
        serverDocCode = v?.document_id || "";
      } catch { }

      const now = nowISO;

      setDocuments(prev => [
        ...prev,
        {
          ...doc,
          id: newId,
          title: `${doc.title} (Copy)`,
          assigned_to: doc.assigned_to || doc.data?.sales_executive || "Unassigned",
          data: {
            ...doc.data,
            document_id: serverDocCode || fallbackCopyCode,
            document_date: now.split("T")[0],
          },
          status: "created",
          stage_progress: 10,
          created_at: created?.created_at || now,
          updated_at: created?.updated_at || now,
          shared_channels: [],
          otp_verified_at: null,
          completed_at: null,
          tracking_history: [
            ...(doc.tracking_history || []),
            {
              id: (doc.tracking_history?.length || 0) + 1,
              action: "Document Duplicated",
              timestamp: now,
              user: "Admin User",
              details: `Duplicated from ${doc.data?.document_id}`,
              stage: "created",
              icon: "Copy",
            },
          ],
        },
      ]);

      toast.success("Document duplicated successfully!");
      await fetchDocuments();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Duplicate failed");
    }
  };




  const handleArchiveDocument = (doc: any) => {
    setDocuments(prev => prev.map(d =>
      d.id === doc.id
        ? {
          ...d,
          status: 'archived',
          updated_at: new Date().toISOString(),
          tracking_history: [
            ...d.tracking_history,
            {
              id: d.tracking_history.length + 1,
              action: 'Document Archived',
              timestamp: new Date().toISOString(),
              user: 'Admin User',
              details: 'Document moved to archive',
              stage: 'archived',
              icon: 'Archive'
            }
          ]
        }
        : d
    ));
    alert('Document archived successfully!');
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUniqueTemplates = () => {
    const templates = [...new Set(documents.map(doc => doc.template_name))];
    return templates;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header with Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs">Total Documents</p>
              <p className="text-xl font-bold">{documents.length}</p>
            </div>
            <FileText size={24} className="text-blue-200" />
          </div>
          <div className="mt-1 text-blue-100 text-xs">📄 All document types</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs">Completed</p>
              <p className="text-xl font-bold">
                {documents.filter(d => d.status === 'completed').length}
              </p>
            </div>
            <CheckCircle size={24} className="text-green-200" />
          </div>
          <div className="mt-1 text-green-100 text-xs">✅ Fully processed</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs">In Progress</p>
              <p className="text-xl font-bold">
                {documents.filter(d => d.status !== 'completed' && d.status !== 'created').length}
              </p>
            </div>
            <Clock size={24} className="text-orange-200" />
          </div>
          <div className="mt-1 text-orange-100 text-xs">⏳ Being processed</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs">High Priority</p>
              <p className="text-xl font-bold">
                {documents.filter(d => d.priority === 'high').length}
              </p>
            </div>
            <AlertCircle size={24} className="text-purple-200" />
          </div>
          <div className="mt-1 text-purple-100 text-xs">🔥 Urgent documents</div>
        </div>
      </div>

      {/* Search and Filters */}
      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-lg 
focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-xs"
            >
              <Filter size={14} />
              <span>Filters</span>
            </button>
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-white shadow-sm' : ''}`}
              >
                <FileText size={14} className={viewMode === 'table' ? 'text-blue-600' : 'text-gray-400'} />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded ${viewMode === 'cards' ? 'bg-white shadow-sm' : ''}`}
              >
                <Building size={14} className={viewMode === 'cards' ? 'text-blue-600' : 'text-gray-400'} />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                >
                  <option value="all">All Status</option>
                  <option value="created">Created</option>
                  <option value="shared">Shared</option>
                  <option value="otp_verified">OTP Verified</option>
                  <option value="esign_pending">E-Sign Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Template</label>
                <select
                  value={templateFilter}
                  onChange={(e) => setTemplateFilter(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                >
                  <option value="all">All Templates</option>
                  {getUniqueTemplates().map(template => (
                    <option key={template} value={template}>{template}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setPriorityFilter('all');
                    setTemplateFilter('all');
                    setSearchTerm('');
                  }}
                  className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Bulk Actions */}
      {selectedDocuments.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-blue-700">
                {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleBulkShare}
                  className="px-2.5 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                >
                  Bulk Share
                </button>
                <button
                  onClick={handleBulkDownload}
                  className="px-2.5 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                >
                  Bulk Download
                </button>
                <button
                  onClick={handleBulkExport}
                  disabled={!selectedDocuments.length && !filteredDocuments.length}
                  className="px-2.5 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Bulk Export
                </button>

                <button
                  onClick={openStatusModal}
                  className="px-2.5 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
                >
                  Change Status
                </button>

              </div>
            </div>
            <button
              onClick={() => setSelectedDocuments([])}
              className="text-blue-600 hover:text-blue-800"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}


      {/* Documents Table/Cards */}
      {/* Documents Table/Cards */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* ✅ Horizontal + Vertical scroll */}
          <div className="overflow-x-auto">
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full min-w-[900px] border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2 text-left w-8 bg-gray-50">
                      <input
                        type="checkbox"
                        checked={
                          selectedDocuments.length === paginatedDocuments.length &&
                          paginatedDocuments.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Document
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Parties
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Property
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Status & Progress
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Timeline
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-xs">
                  {paginatedDocuments.map((doc) => {
                    const st = doc.status === 'e-sign_pending' ? 'esign_pending' : doc.status;
                    const isCancelled = st === 'cancelled';
                    const isOnHold = st === 'on_hold';

                    return (
                      <React.Fragment key={doc.id}>
                        {/* ===== MAIN ROW (KEEP EXACTLY AS YOU HAVE) ===== */}
                        <tr className="hover:bg-gray-50 transition-colors">

                          {/* ✅ your checkbox cell */}
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={selectedDocuments.includes(doc.id)}
                              onChange={() => handleDocumentSelection(doc.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>

                          {/* ✅ your Document cell */}
                          <td className="px-3 py-2">
                            <div className="flex items-center space-x-2">
                              <div className="p-1.5 bg-blue-100 rounded-lg">
                                <FileText className="text-blue-600" size={16} />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 text-xs">{doc.title}</div>
                                <div className="text-gray-500">{doc.template_name}</div>
                                <div className="text-gray-400">ID: {doc.data.document_id}</div>
                                <div className="text-gray-400">by {doc.created_by}</div>
                              </div>
                            </div>
                          </td>

                          {/* ✅ your Parties cell */}
                          <td className="px-3 py-2">
                            <div className="space-y-0.5">
                              <div><span className="font-medium text-gray-700">Seller:</span> {doc.data.seller_name}</div>
                              {doc.data.buyer_name && (
                                <div><span className="font-medium text-gray-700">Buyer:</span> {doc.data.buyer_name}</div>
                              )}
                              <div className="text-gray-500">Assigned to: {doc.assigned_to}</div>
                            </div>
                          </td>

                          {/* ✅ your Property cell */}
                          <td className="px-3 py-2">
                            <div className="space-y-0.5">
                              <div className="font-medium text-gray-900">{doc.data.property_type}</div>
                              <div className="text-gray-600">{doc.data.property_area} sq ft</div>
                              <div className="text-gray-500 line-clamp-2">{doc.data.property_address}</div>
                              {doc.data.sale_amount && (
                                <div className="font-medium text-green-600">₹{(doc.data.sale_amount / 100000).toFixed(1)}L</div>
                              )}
                              {doc.data.token_amount && (
                                <div className="font-medium text-blue-600">Token: ₹{(doc.data.token_amount / 100000).toFixed(1)}L</div>
                              )}
                            </div>
                          </td>

                          {/* ✅ your Status & Progress cell (chaho to yahan minimal dikhana) */}
                          <td className="px-3 py-2">
                            <div className="space-y-1">
                              {getStatusBadge(st)}
                              {getPriorityBadge(doc.priority)}
                              <div className="space-y-0.5">
                                <div className="flex justify-between">
                                  <span>Progress</span><span>{doc.stage_progress}%</span>
                                </div>
                                {getStageProgress(st, doc.stage_progress)}
                              </div>
                              {!!doc.shared_channels.length && (
                                <div className="flex items-center space-x-1">
                                  {doc.shared_channels.includes('email') && <Mail size={12} className="text-blue-500" />}
                                  {doc.shared_channels.includes('whatsapp') && <MessageCircle size={12} className="text-green-500" />}
                                  {doc.shared_channels.includes('sms') && <Phone size={12} className="text-purple-500" />}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* ✅ your Timeline cell */}
                          <td className="px-3 py-2">
                            <div className="space-y-0.5 text-gray-500">
                              <div>Created: {formatTimestamp(doc.created_at)}</div>
                              <div>Updated: {formatTimestamp(doc.updated_at)}</div>
                              {doc.otp_verified_at && <div className="text-green-600">OTP: {formatTimestamp(doc.otp_verified_at)}</div>}
                              {doc.completed_at && <div className="text-blue-600">Done: {formatTimestamp(doc.completed_at)}</div>}
                            </div>
                          </td>

                          {/* ✅ your Actions cell */}
                          <td className="px-3 py-2">
                            <div className="flex items-center space-x-1.5">
                              <button onClick={() => handleViewDocument(doc)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg" title="View Document">
                                <Eye size={12} />
                              </button>
                              <button onClick={() => handleShareDocument(doc)} className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg" title="Share Document">
                                <Share size={12} />
                              </button>
                              <button onClick={() => handleDownloadDocument(doc)} className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg" title="Download PDF">
                                <Download size={12} />
                              </button>

                              <div className="relative group">
                                <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                  <MoreHorizontal size={12} />
                                </button>
                                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                  <div className="p-1">
                                    <button
                                      onClick={() => handleEditDocument(doc)}
                                      className="flex items-center space-x-1.5 px-2 py-1 text-gray-700 hover:bg-gray-100 rounded w-full text-left"
                                    >
                                      <Edit size={11} />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteDocument(doc)}
                                      className="flex items-center space-x-1.5 px-2 py-1 text-red-600 hover:bg-red-100 rounded w-full text-left"
                                    >
                                      <AlertCircle size={11} />
                                      <span>Delete</span>
                                    </button>
                                    <button
                                      onClick={() => handleDuplicateDocument(doc)}
                                      className="flex items-center space-x-1.5 px-2 py-1 text-gray-700 hover:bg-gray-100 rounded w-full text-left"
                                    >
                                      <Copy size={11} />
                                      <span>Duplicate</span>
                                    </button>
                                    <button
                                      onClick={() => handleArchiveDocument(doc)}
                                      className="flex items-center space-x-1.5 px-2 py-1 text-gray-700 hover:bg-gray-100 rounded w-full text-left"
                                    >
                                      <Archive size={11} />
                                      <span>Archive</span>
                                    </button>
                                  </div>
                                </div>
                              </div>

                            </div>
                          </td>
                        </tr>

                        {/* ===== DETAIL ROW (FULL-WIDTH) ===== */}
                        <tr className="">
                          <td colSpan={7} className="">
                            <div className=" ">
                              <div className="p-3 mb-2">
                                <div className="flex flex-wrap items-center gap-3">
                                  <StatusStepper
                                    docId={doc.id}
                                    currentStatus={st}
                                    disabled={isCancelled}
                                    onSynced={({ id, status, progress, updated_at }) => {
                                      setDocuments(prev => prev.map(d =>
                                        d.id === id ? {
                                          ...d,
                                          status,
                                          stage_progress: typeof progress === 'number' ? progress : d.stage_progress,
                                          updated_at: updated_at ?? d.updated_at
                                        } : d
                                      ));
                                    }}
                                    onRequestStep={(target) => {
                                      switch (target) {
                                        case 'shared': {
                                          setSelectedDocument(doc);
                                          setShowShareModal(true);
                                          return true;
                                        }
                                        case 'on_hold': {
                                          setPendingStepDoc(doc);
                                          setStatusAllowed(['on_hold']);
                                          setStatusModalInit('on_hold');
                                          setStatusModalCurrent([st as StatusCode]);
                                          setShowStatusModal(true);
                                          return true;
                                        }
                                        case 'completed': {
                                          setPendingStepDoc(doc);
                                          setStatusAllowed(['completed']);
                                          setStatusModalInit('completed');
                                          setStatusModalCurrent([st as StatusCode]);
                                          setShowStatusModal(true);
                                          return true;
                                        }
                                        case 'cancelled': {
                                          setPendingStepDoc(doc);
                                          setStatusAllowed(['cancelled']);
                                          setStatusModalInit('cancelled');
                                          setStatusModalCurrent([st as StatusCode]);
                                          setShowStatusModal(true);
                                          return true;
                                        }
                                        case 'otp_verified': {

                                          setVerifyDoc(doc);
                                          setShowVerifyModal(true);
                                          setPendingStepDoc(doc);
                                          return true;
                                        }
                                        case 'esign_pending': {
                                          // 🔓 Aadhaar e-sign flow open karega (reason modal nahi)
                                          setEsignDoc(doc);
                                          setShowEsignModal(true);
                                          setPendingStepDoc(doc); // optional (aap already use kar rahe ho)
                                          return true;
                                        }

                                        default:
                                          return false;
                                      }
                                    }}
                                  />



                                  {!!(doc.shared_channels && doc.shared_channels.length) && (
                                    <div className="flex items-center gap-2 ml-auto">
                                      {doc.shared_channels.includes('email') && (
                                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                                          <Mail size={12} /> Email
                                        </span>
                                      )}
                                      {doc.shared_channels.includes('whatsapp') && (
                                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-green-50 text-green-700 rounded-full">
                                          <MessageCircle size={12} /> WhatsApp
                                        </span>
                                      )}
                                      {doc.shared_channels.includes('sms') && (
                                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full">
                                          <Phone size={12} /> SMS
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>



                                {isOnHold && (
                                  <div className="mt-2 text-[11px] text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1 inline-block">
                                    On Hold — advance the step to resume workflow.
                                  </div>
                                )}
                                {isCancelled && (
                                  <div className="mt-2 text-[11px] text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1 inline-block">
                                    Cancelled — stepper disabled; reopen from Actions if allowed.
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>


              </table>
            </div>
          </div>
        </div>

      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow text-xs"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.includes(doc.id)}
                    onChange={() => handleDocumentSelection(doc.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <FileText className="text-blue-600" size={18} />
                  </div>
                </div>
                <div className="flex items-center space-x-1">{getStatusBadge(doc.status)}</div>
              </div>

              <h3 className="font-semibold text-gray-900 text-sm mb-1">{doc.title}</h3>
              <p className="text-gray-600 mb-2">{doc.template_name}</p>

              <div className="space-y-1 mb-3">
                <div>
                  <span className="text-gray-500">Seller:</span> {doc.data.seller_name}
                </div>
                {doc.data.buyer_name && (
                  <div>
                    <span className="text-gray-500">Buyer:</span> {doc.data.buyer_name}
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Property:</span> {doc.data.property_type} • {doc.data.property_area} sq ft
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                {getPriorityBadge(doc.priority)}
                <div className="text-gray-500">{formatTimestamp(doc.created_at)}</div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between mb-1">
                  <span>Progress</span>
                  <span>{doc.stage_progress}%</span>
                </div>
                {getStageProgress(doc.status, doc.stage_progress)}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleViewDocument(doc)}
                  className="flex-1 bg-blue-600 text-white py-1.5 px-2 rounded-lg hover:bg-blue-700 transition-colors text-xs"
                >
                  View
                </button>
                <button
                  onClick={() => handleShareDocument(doc)}
                  className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Share size={14} />
                </button>
                <button
                  onClick={() => handleDownloadDocument(doc)}
                  className="p-1.5 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="bg-white rounded-lg border border-gray-200 px-4 py-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-xs text-gray-700">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredDocuments.length)} of {filteredDocuments.length}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            <div className="flex items-center space-x-0.5">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2 py-1 rounded text-xs ${currentPage === page
                      ? 'bg-blue-600 text-white'
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
                      ? 'bg-blue-600 text-white'
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
      {showStatusModal && (
        <StatusChangeModal
          isOpen={showStatusModal}
          onClose={() => {
            setShowStatusModal(false);
            setPendingStepDoc(null);
            setStatusAllowed(undefined);
          }}
          selectedCount={pendingStepDoc ? 1 : selectedDocuments.length}
          onStatusChange={async (newStatus, reason) => {
            const docId = pendingStepDoc?.id ?? null;
            if (!docId) return;
            await setStatusAndSync(docId, normalizeStatusKey(newStatus) as StatusCode, reason || '-');
            setShowStatusModal(false);
            setPendingStepDoc(null);
            setStatusAllowed(undefined);
          }}
          initialStatus={statusModalInit}
          currentStatuses={statusModalCurrent}
          allowedStatuses={statusAllowed}     // 👈 NEW
        />
      )}



      {showViewModal && (
        <DocumentViewModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedDocument(null);
          }}
          document={selectedDocument}
        />
      )}

      {showEditModal && (
        <DocumentEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedDocument(null);
          }}
          document={selectedDocument}
          userRole={userRole}
          onSave={handleSaveDocument}
        />
      )}

      {showDeleteModal && (
        <DocumentDeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedDocument(null);
          }}
          document={selectedDocument}
          userRole={userRole}
          onSubmit={handleDeleteConfirm}
        />
      )}
      {showEsignModal && esignDoc && (
        <EsignAadhaarModal
          isOpen={showEsignModal}
          onClose={() => {
          
            setShowEsignModal(false);
            setEsignDoc(null);
            setPendingStepDoc(null);
          }}
          documentId={esignDoc.id}
          defaultBuyer={{
            name: esignDoc.data?.buyer_name || '',
            email: esignDoc.data?.buyer_email || '',
            phone: esignDoc.data?.buyer_phone || '',
          }}
          defaultSeller={{
            name: esignDoc.data?.seller_name || '',
            email: esignDoc.data?.seller_email || '',
            phone: esignDoc.data?.seller_phone || '',
          }}
          onProgress={async ({ docId, sessionIds }) => {
            

            // ✅ SAFETY CHECK 1: Must have sessions
            if (!sessionIds || !Array.isArray(sessionIds)) {
              console.error('[TrackingTab] ❌ BLOCKED: Invalid sessionIds', sessionIds);
              return;
            }

            // ✅ SAFETY CHECK 2: Must have BOTH parties (2 sessions minimum)
            if (sessionIds.length < 2) {
              console.error('[TrackingTab] ❌ BLOCKED: Incomplete sessions', {
                expected: 2,
                received: sessionIds.length,
                sessions: sessionIds
              });
              toast.error('Both Buyer and Seller must verify before updating status!');
              return;
            }


            try {
              await setStatusAndSync(Number(docId), 'esign_pending', 'Aadhaar OTP verified for both parties; signing in progress');
              toast.success('[TrackingTab] ✅ Status updated successfully');
            } catch (error) {
              console.error('[TrackingTab] ❌ Status update failed:', error);
              toast.error('Failed to update document status');
            }
          }}
          onBothSigned={async ({ docId }) => {
           
            await setStatusAndSync(Number(docId), 'completed', 'Both parties signed via Aadhaar eSign');
            setShowEsignModal(false);
            setEsignDoc(null);
            setPendingStepDoc(null);
          }}
        />
      )}


      {showVerifyModal && verifyDoc && (
        <PartyVerificationModal
          isOpen={showVerifyModal}
          documentId={verifyDoc.id}
          defaultBuyer={{
            name: verifyDoc.data?.buyer_name || '',
            email: verifyDoc.data?.buyer_email || '',
            phone: verifyDoc.data?.buyer_phone || '',
          }}
          defaultSeller={{
            name: verifyDoc.data?.seller_name || '',
            email: verifyDoc.data?.seller_email || '',
            phone: verifyDoc.data?.seller_phone || '',
          }}
          onClose={() => {
            setShowVerifyModal(false);
            setVerifyDoc(null);
            setPendingStepDoc(null);
          }}
          onBothVerified={async (payload) => {
            const { note } = payload;
            if (!pendingStepDoc) return;
            await setStatusAndSync(
              pendingStepDoc.id,
              'otp_verified',
              note || 'Buyer & Seller verified'
            );
            setShowVerifyModal(false);
            setVerifyDoc(null);
            setPendingStepDoc(null);
          }}
        />
      )}

      {showShareModal && selectedDocument && (
        <DocumentShareModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSelectedDocument(null);
          }}
          document={selectedDocument}
          onShare={(shareData: any) => {
            try {

              setDocuments(prev =>
                prev.map(d =>
                  d.id === selectedDocument.id
                    ? {
                      ...d,
                      status: (shareData?.snapshot?.current_status as string) || 'shared',
                      stage_progress:
                        typeof shareData?.snapshot?.progress_pct === 'number'
                          ? shareData.snapshot.progress_pct
                          : d.stage_progress,
                      shared_channels: Array.from(
                        new Set([...(d.shared_channels || []), ...(shareData.channels || [])])
                      ),
                      tracking_history: [
                        ...d.tracking_history,
                        {
                          id: d.tracking_history.length + 1,
                          action: `Shared via ${shareData.channels.join(', ')}`,
                          timestamp: new Date().toISOString(),
                          user: 'Admin User',
                          details: shareData.message || 'Shared',
                          stage: 'shared',
                          icon: 'Send',
                        },
                      ],
                    }
                    : d
                )
              );
            } catch (err) {
              console.error('Share UI update failed:', err);
              alert('Share UI update failed');
            } finally {
              setShowShareModal(false);
              setSelectedDocument(null);
            }
          }}
        />
      )}


    </div>
  );
};

const StatusChangeModal = ({
  isOpen,
  onClose,
  selectedCount,
  onStatusChange,
  initialStatus = '',
  currentStatuses = [],
  allowedStatuses,

}: {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  onStatusChange: (newStatus: string, reason?: string) => void;
  initialStatus?: StatusCode | '';
  currentStatuses?: StatusCode[];
  allowedStatuses?: StatusCode[]; // 👈 NEW
}) => {

  const [newStatus, setNewStatus] = useState<string>(initialStatus || '');
  const [reason, setReason] = useState('');

  useEffect(() => {
    // whenever it opens (or initial changes), preselect
    setNewStatus(initialStatus || '');
    setReason('');
  }, [initialStatus, isOpen]);

  if (!isOpen) return null;

  const ALL = [
    { value: 'created', label: 'Created', description: 'Document is created but not shared' },
    { value: 'shared', label: 'Shared', description: 'Document has been shared with parties' },
    { value: 'otp_verified', label: 'OTP Verified', description: 'Identity verification completed' },
    { value: 'esign_pending', label: 'E-Sign Pending', description: 'Awaiting digital signature' },
    { value: 'completed', label: 'Completed', description: 'All processes finished' },
    { value: 'on_hold', label: 'On Hold', description: 'Document processing paused' },
    { value: 'cancelled', label: 'Cancelled', description: 'Document cancelled' },
  ] as const;

  const statusOptions = (allowedStatuses?.length
    ? ALL.filter(s => allowedStatuses.includes(s.value as StatusCode))
    : ALL
  );


  const handleSubmit = () => {
    if (!newStatus) return alert('Please select a status');
    if (!reason.trim()) return alert('Please provide a reason for status change');
    onStatusChange(newStatus, reason);
    setNewStatus('');
    setReason('');
  };

  const currentBadge = (() => {
    if (!currentStatuses?.length) return null;
    const allSame = currentStatuses.every(s => s === currentStatuses[0]);
    return (
      <div className="mt-2 text-xs text-gray-600">
        {allSame ? (
          <>Current status: <span className="font-medium">{currentStatuses[0]}</span></>
        ) : (
          <>Current statuses: <span className="font-medium">{Array.from(new Set(currentStatuses)).join(', ')}</span></>
        )}
      </div>
    );
  })();


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 !mt-0">
      {/* modal */}
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl
                      max-h-[85vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* header (fixed) */}
        <div className="p-6 border-b border-gray-200 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Change Document Status</h3>
              <p className="text-gray-600 mt-1">Update status for {selectedCount} selected documents</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* content (scrollable) */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {statusOptions.map((status) => (
                  <label
                    key={status.value}
                    className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="status"
                      value={status.value}
                      checked={newStatus === status.value}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="mt-1 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{status.label}</div>
                      <div className="text-sm text-gray-600">{status.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Change <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Please provide a reason for changing the status..."
                required
              />
            </div>
          </div>
        </div>

        {/* footer (fixed) */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              This will update {selectedCount} documents
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!newStatus || !reason.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default TrackingTab;
