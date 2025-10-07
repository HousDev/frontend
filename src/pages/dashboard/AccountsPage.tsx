
import type { LucideProps } from 'lucide-react';
// 🔁 CHANGED
import React, { useMemo, useState, useEffect, useCallback } from 'react';

import {
  Receipt,
  FileText,
  CreditCard,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Share,
  MoreHorizontal,
  Calendar,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Send,
  Printer,
  Copy,
  Star,
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3,
  ArrowUp,
  ArrowDown,
  History,
  UserCheck,
  Shield,
  Percent,
  Calculator,
  FileSignature,
  Users,
  Home,
  Banknote,
  Smartphone,
  Building2,
  CheckSquare,
  XCircle,
  Clock3,
  AlertTriangle
} from 'lucide-react';


import SharingModal from '../../components/accounts/SharingModal';
import TrackingModal from '../../components/accounts/TrackingModal';
import DocumentEditModal from '../../components/accounts/DocumentEditModal';
import DeleteRequestModal from '../../components/accounts/DeleteRequestModal';
import InvoiceFormModal from '../../components/accounts/InvoiceFormModal';
import ReceiptFormModal from '../../components/accounts/ReceiptFormModal';
import LedgerModal from '../../components/accounts/LedgerModal';
import ApprovalModal from '../../components/accounts/ApprovalModal';
import PropertyReceiptFormModal from '@/components/accounts/PropertyReceiptFormModal';
import { propertyPaymentReceiptAPI } from '@/lib/propertyPaymentReceiptAPI';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';



type FD = FinancialDocument;

const mapRowToFD = (row: any): FD => ({
  id: row.id,
  type: 'property_payment_receipt',
  client_name: row.buyer_name || row.seller_name || '—',
  client_phone: row.buyer_phone || row.seller_phone || '',
  client_email: row.buyer_email || row.seller_email || '',
  receipt_id: row.receipt_id,
  seller_name: row.seller_name,
  buyer_name: row.buyer_name,
  property_address: row.property_address,
  property_details: row.property_details || {},
  deal_value: row.deal_value ?? undefined,
  payment_type: row.payment_type,
  amount: row.amount ?? 0,
  amount_in_words: row.amount_in_words,
  receipt_date: row.receipt_date || undefined,
  payment_date: row.payment_date || undefined,
  payment_reference: row.payment_reference,
  status: row.status,
  payment_status: row.payment_status,
  notes: row.notes,
  ledger_entries: row.ledger_entries || [],
  related_party: row.related_party,
  created_by: String(row.created_by ?? ''),
  created_by_name: row.created_by_name || '',
  updated_by: String(row.updated_by ?? ''),
  updated_by_name: row.updated_by_name || '',
});



/**
 * Types
 */
type DocumentType = 'brokerage_invoice' | 'brokerage_receipt' | 'property_payment_receipt';

interface LedgerEntry {
  type: 'debit' | 'credit';
  amount: number;
  description?: string;
  date?: string;
  balance?: number;
}

interface PaymentDetails {
  bank_name?: string;
  account_number?: string;
  ifsc_code?: string;
  account_holder?: string;
}

interface PropertyDetails {
  type?: string;
  area?: string;
  floor?: string;
  facing?: string;
}

interface FinancialDocument {
  id: number;
  type: DocumentType;
  invoice_id?: string;
  receipt_id?: string;
  client_name: string;
  client_phone?: string;
  client_email?: string;
  seller_name?: string;
  buyer_name?: string;
  property_address?: string;
  property_details?: PropertyDetails;
  deal_value?: number;
  brokerage_percentage?: number;
  brokerage_amount?: number;
  gst_percentage?: number;
  gst_amount?: number;
  total_amount?: number;
  amount?: number; // for receipts
  amount_in_words?: string;
  date?: string; // invoice creation date
  receipt_date?: string;
  due_date?: string;
  status?: string;
  payment_status?: string;
  payment_date?: string;
  payment_method?: string;
  payment_reference?: string;
  created_by?: string;
  created_by_name?: string;    
  updated_by?:string;
  updated_by_name?:string;
  approved_by?: string | null;
  requires_approval?: boolean;
  shared_channels?: string[];
  notes?: string;
  ledger_entries?: LedgerEntry[];
  payment_details?: PaymentDetails;
  related_party?: string;
  [key: string]: any;
}

/**
 * Component
 */
const AccountsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showSharingModal, setShowSharingModal] = useState<boolean>(false);
  const [showTrackingModal, setShowTrackingModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState<boolean>(false);
  const [showReceiptForm, setShowReceiptForm] = useState<boolean>(false);
  const [showPropertyForm, setShowPropertyForm] = useState<boolean>(false);
  const [showLedgerModal, setShowLedgerModal] = useState<boolean>(false);
  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<FinancialDocument | null>(null);
  const [editingItem, setEditingItem] = useState<FinancialDocument | null>(null);
  const [userRole] = useState<'admin' | 'manager' | 'user'>('admin'); // example roles
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);

  const { user } = useAuth();
  // ✅ NEW: loading + error states
  const [loadingReceipts, setLoadingReceipts] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [receiptsBootstrapped, setReceiptsBootstrapped] = useState(false); // to avoid re-adding
  // ✅ NEW
  const loadAllPropertyReceipts = useCallback(async () => {
    try {
      setLoadingReceipts(true);
      setLoadError(null);

      const res = await propertyPaymentReceiptAPI.getAll();
      // ✅ your backend returns { items: [...] }
      const rows: any[] = res?.items ?? res?.data?.items ?? [];
console.log("first",res)
      const mapped: FD[] = rows.map(mapRowToFD);

      // merge strategy:
      // - remove any existing property_payment_receipt docs
      // - prepend the freshly fetched ones
      setDocuments(prev => {
        const others = prev.filter(d => d.type !== 'property_payment_receipt');
        return [...mapped, ...others];
      });

      setReceiptsBootstrapped(true);
      toast.success(`Loaded ${mapped.length} receipts`);
    } catch (err: any) {
      console.error("loadAllPropertyReceipts", err);
      setLoadError(err?.message || "Failed to load receipts");
      toast.error("Failed to load property receipts");
    } finally {
      setLoadingReceipts(false);
    }
  }, []);

  // ✅ NEW
  useEffect(() => {
    // load receipts only once at mount (keeps your demo invoices/receipts intact)
    if (!receiptsBootstrapped) loadAllPropertyReceipts();
  }, [receiptsBootstrapped, loadAllPropertyReceipts]);
  // ✅ NEW
  const fetchReceiptById = useCallback(async (id: number | string) => {
    try {
      const res = await propertyPaymentReceiptAPI.getById(id);
      const row = res?.data?.item ?? res?.item ?? res?.data ?? res;
      return mapRowToFD(row);
    } catch (err) {
      console.error("fetchReceiptById", err);
      toast.error("Could not fetch latest receipt");
      return null;
    }
  }, []);



  const tabs = [
    { id: 'all', label: 'All Documents', count: 28, color: 'blue' },
    { id: 'brokerage_invoice', label: 'Brokerage Invoices', count: 12, color: 'purple' },
    { id: 'brokerage_receipt', label: 'Brokerage Receipts', count: 8, color: 'green' },
    { id: 'property_payment_receipt', label: 'Property Payment Receipts', count: 8, color: 'orange' },
    { id: 'pending_approval', label: 'Pending Approval', count: 3, color: 'red' }
  ];

  // Sample data
  const [documents, setDocuments] = useState<FinancialDocument[]>([
    {
      id: 1,
      type: 'brokerage_invoice',
      invoice_id: 'INV-2025-001',
      client_name: 'Rajesh Kumar',
      client_phone: '+91 98765 43210',
      client_email: 'rajesh.kumar@email.com',
      seller_name: 'Rajesh Kumar',
      buyer_name: 'Amit Patel',
      property_address: 'Flat A-404, Skyline Towers, Andheri West, Mumbai',
      property_details: { type: 'Apartment', area: '1250 sq ft', floor: '4th Floor', facing: 'North-East' },
      deal_value: 25000000,
      brokerage_percentage: 2,
      brokerage_amount: 500000,
      gst_percentage: 18,
      gst_amount: 90000,
      total_amount: 590000,
      amount_in_words: 'Five Lakh Ninety Thousand Only',
      date: '2025-01-12',
      due_date: '2025-01-25',
      status: 'sent',
      payment_status: 'pending',
      created_by: 'Admin User',
      approved_by: null,
      requires_approval: false,
      shared_channels: ['email', 'whatsapp'],
      notes: 'Commission for property sale transaction',
      ledger_entries: [{ type: 'debit', amount: 590000, description: 'Brokerage invoice raised', date: '2025-01-12', balance: 590000 }],
      payment_details: { bank_name: 'HDFC Bank', account_number: '50100123456789', ifsc_code: 'HDFC0001234', account_holder: 'ResaleExpert Pvt Ltd' },
      related_party: 'seller'
    },
    {
      id: 2,
      type: 'brokerage_invoice',
      invoice_id: 'INV-2025-002',
      client_name: 'Priya Sharma',
      client_phone: '+91 87654 32109',
      client_email: 'priya.sharma@email.com',
      seller_name: 'Priya Sharma',
      buyer_name: 'Rohit Gupta',
      property_address: 'Villa B-201, Green Valley Society, Pune',
      property_details: { type: 'Villa', area: '2800 sq ft', floor: 'Ground + 2', facing: 'South' },
      deal_value: 42000000,
      brokerage_percentage: 1.5,
      brokerage_amount: 630000,
      gst_percentage: 18,
      gst_amount: 113400,
      total_amount: 743400,
      amount_in_words: 'Seven Lakh Forty Three Thousand Four Hundred Only',
      date: '2025-01-10',
      due_date: '2025-01-23',
      status: 'paid',
      payment_status: 'paid',
      payment_date: '2025-01-15',
      payment_method: 'RTGS',
      payment_reference: 'TXN123456789',
      created_by: 'Manager User',
      approved_by: 'Admin User',
      requires_approval: false,
      shared_channels: ['email'],
      notes: 'Premium property commission',
      ledger_entries: [
        { type: 'debit', amount: 743400, description: 'Brokerage invoice raised', date: '2025-01-10', balance: 743400 },
        { type: 'credit', amount: 743400, description: 'Payment received via RTGS', date: '2025-01-15', balance: 0 }
      ],
      payment_details: { bank_name: 'HDFC Bank', account_number: '50100123456789', ifsc_code: 'HDFC0001234', account_holder: 'ResaleExpert Pvt Ltd' },
      related_party: 'seller'
    },
    {
      id: 3,
      type: 'brokerage_receipt',
      receipt_id: 'BR-2025-001',
      client_name: 'Amit Patel',
      client_phone: '+91 76543 21098',
      client_email: 'amit.patel@email.com',
      seller_name: 'Sunita Gupta',
      buyer_name: 'Amit Patel',
      property_address: 'Penthouse PH-01, Royal Residency, Bandra, Mumbai',
      property_details: { type: 'Penthouse', area: '3200 sq ft', floor: '15th Floor', facing: 'Sea Facing' },
      deal_value: 85000000,
      brokerage_percentage: 2,
      amount: 1700000,
      amount_in_words: 'Seventeen Lakh Only',
      receipt_date: '2025-01-08',
      payment_date: '2025-01-08',
      payment_method: 'RTGS',
      payment_reference: 'TXN987654321',
      status: 'paid',
      created_by: 'Admin User',
      approved_by: 'Admin User',
      requires_approval: false,
      shared_channels: ['email', 'whatsapp'],
      notes: 'Commission received for luxury property sale',
      ledger_entries: [{ type: 'credit', amount: 1700000, description: 'Brokerage payment received', date: '2025-01-08', balance: 1700000 }],
      payment_details: { bank_name: 'ICICI Bank', account_number: '123456789012', ifsc_code: 'ICIC0001234', account_holder: 'Amit Patel' },
      related_party: 'buyer'
    },
    {
      id: 4,
      type: 'property_payment_receipt',
      receipt_id: 'PPR-2025-001',
      client_name: 'Rajesh Kumar',
      client_phone: '+91 98765 43210',
      client_email: 'rajesh.kumar@email.com',
      seller_name: 'Rajesh Kumar',
      buyer_name: 'Amit Patel',
      property_address: 'Flat A-404, Skyline Towers, Andheri West, Mumbai',
      property_details: { type: 'Apartment', area: '1250 sq ft', floor: '4th Floor', facing: 'North-East' },
      payment_type: 'Token Amount',
      amount: 500000,
      amount_in_words: 'Five Lakh Only',
      receipt_date: '2025-01-12',
      payment_date: '2025-01-12',
      payment_method: 'RTGS',
      payment_reference: 'TXN555666777',
      transaction_details: { from_account: 'Amit Patel - HDFC Bank', to_account: 'Rajesh Kumar - SBI Bank', transaction_id: 'TXN555666777', bank_charges: 25 },
      status: 'paid',
      created_by: 'Manager User',
      approved_by: 'Admin User',
      requires_approval: false,
      shared_channels: ['email', 'whatsapp'],
      notes: 'Token amount for property booking',
      ledger_entries: [{ type: 'credit', amount: 500000, description: 'Token amount received from buyer', date: '2025-01-12', balance: 500000 }],
      related_party: 'buyer_to_seller'
    },
    {
      id: 5,
      type: 'brokerage_invoice',
      invoice_id: 'INV-2025-003',
      client_name: 'Neha Agarwal',
      client_phone: '+91 65432 10987',
      client_email: 'neha.agarwal@email.com',
      seller_name: 'Neha Agarwal',
      buyer_name: 'Vikash Singh',
      property_address: 'Office 301, Tech Park, Gurgaon',
      property_details: { type: 'Commercial', area: '1500 sq ft', floor: '3rd Floor', facing: 'East' },
      deal_value: 35000000,
      brokerage_percentage: 1.8,
      brokerage_amount: 630000,
      gst_percentage: 18,
      gst_amount: 113400,
      total_amount: 743400,
      amount_in_words: 'Seven Lakh Forty Three Thousand Four Hundred Only',
      date: '2025-01-13',
      due_date: '2025-01-28',
      status: 'pending_approval',
      payment_status: 'pending',
      created_by: 'Manager User',
      approved_by: null,
      requires_approval: true,
      shared_channels: [],
      notes: 'Commercial property commission - pending admin approval',
      ledger_entries: [],
      payment_details: { bank_name: 'HDFC Bank', account_number: '50100123456789', ifsc_code: 'HDFC0001234', account_holder: 'ResaleExpert Pvt Ltd' },
      related_party: 'seller'
    }
  ]);






  /**
   * Filters
   */
  const filteredDocuments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return documents.filter(doc => {
      const client = (doc.client_name || '').toLowerCase();
      const address = (doc.property_address || '').toLowerCase();
      const invoiceId = (doc.invoice_id || '').toLowerCase();
      const receiptId = (doc.receipt_id || '').toLowerCase();

      const matchesSearch =
        term === '' ||
        client.includes(term) ||
        address.includes(term) ||
        invoiceId.includes(term) ||
        receiptId.includes(term);

      const matchesTab =
        activeTab === 'all' ||
        doc.type === activeTab ||
        (activeTab === 'pending_approval' && !!doc.requires_approval);

      return matchesSearch && matchesTab;
    });
  }, [documents, searchTerm, activeTab]);

  /**
   * Statistics
   */
  const totalAmount = useMemo(() => {
    return documents.reduce((sum, doc) => {
      const val = doc.total_amount ?? doc.amount ?? 0;
      return sum + val;
    }, 0);
  }, [documents]);

  const paidAmount = useMemo(() => {
    return documents.filter(doc => doc.payment_status === 'paid' || doc.status === 'paid')
      .reduce((sum, doc) => sum + (doc.total_amount ?? doc.amount ?? 0), 0);
  }, [documents]);

  const pendingAmount = totalAmount - paidAmount;

  const thisMonthAmount = useMemo(() => {
    const now = new Date();
    return documents.reduce((sum, doc) => {
      const dateStr = doc.date ?? doc.receipt_date;
      if (!dateStr) return sum;
      const dt = new Date(dateStr);
      if (dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear()) {
        return sum + (doc.total_amount ?? doc.amount ?? 0);
      }
      return sum;
    }, 0);
  }, [documents]);

  /**
   * Handlers
   */
  const handleCreateInvoice = () => {
    setEditingItem(null);
    setShowInvoiceForm(true);
  };

  const handleCreateReceipt = () => {
    setEditingItem(null);
    setShowReceiptForm(true);
  };

  const handleCreatePropertyReceipt = () => {
    setEditingItem(null);
    setShowPropertyForm(true);
  };

  const handleShare = (item: FinancialDocument) => {
    setSelectedItem(item);
    setShowSharingModal(true);
  };

  const handleTracking = (item: FinancialDocument) => {
    setSelectedItem(item);
    setShowTrackingModal(true);
  };

  // 🔁 CHANGED
  const handleEdit = async (item: FinancialDocument) => {
    if (item.type === 'brokerage_invoice') {
      setEditingItem(item);
      setShowInvoiceForm(true);
      return;
    }
    if (item.type === 'brokerage_receipt') {
      setEditingItem(item);
      setShowReceiptForm(true);
      return;
    }

    if (item.type === 'property_payment_receipt') {
      // pull the freshest row via GET /receipts/id/:id
      const latest = await fetchReceiptById(item.id);
      if (latest) {
        setEditingItem(latest);
      } else {
        setEditingItem(item); // fallback to existing
      }
      setShowPropertyForm(true);
    }
  };

  // ✅ NEW
  const hardDeletePropertyReceipt = useCallback(async (doc: FinancialDocument) => {
    try {
      if (!doc?.id) return;
      await propertyPaymentReceiptAPI.delete(doc.id);
      setDocuments(prev => prev.filter(d => d.id !== doc.id));
      toast.success("Receipt deleted");
    } catch (err) {
      console.error("delete receipt", err);
      toast.error("Failed to delete receipt");
    }
  }, []);


  const handleDelete = (item: FinancialDocument) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleViewLedger = (item: FinancialDocument) => {
    setSelectedItem(item);
    setShowLedgerModal(true);
  };

  const handleApproval = (item: FinancialDocument) => {
    setSelectedItem(item);
    setShowApprovalModal(true);
  };

  const handleDownload = (item: FinancialDocument) => {
    const base64Pdf = 'JVBERi0xLjQKJdPr6eEKMSAwIG9iag...'; // demo
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${base64Pdf}`;
    link.download = `${item.invoice_id ?? item.receipt_id ?? 'document'}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleSaveDocument = async (data: Partial<FinancialDocument>) => {
    try {
      // Property Payment Receipt
      if (data.type === 'property_payment_receipt') {
        // UPDATE
        if (editingItem?.type === 'property_payment_receipt' && editingItem.id) {
          const res = await propertyPaymentReceiptAPI.update(editingItem.id, {
            type: 'property_payment_receipt',
            status: data.status ?? 'paid',
            payment_status: data.payment_status ?? 'paid',
            related_party: data.related_party,

            // parties
            seller_id: data.seller_id,
            seller_name: data.seller_name,
            seller_phone: data.seller_phone,
            seller_email: data.seller_email,
            buyer_id: data.buyer_id,
            buyer_name: data.buyer_name,
            buyer_phone: data.buyer_phone,
            buyer_email: data.buyer_email,

            // property
            property_id: data.property_id,
            property_address: data.property_address,
            property_details: data.property_details,

            // money + dates
            deal_value: data.deal_value,
            payment_type: data.payment_type,
            amount: data.amount,
            amount_in_words: data.amount_in_words,
            receipt_date: data.receipt_date,
            payment_date: data.payment_date,
            payment_reference: data.payment_reference,
            payment_method:data.payment_method,

            // misc
            transaction_details: (data as any).transaction_details,
            notes: data.notes,
            ledger_entries: data.ledger_entries,
          });

          const row = res.data || res;
          const updated: FD = mapRowToFD(row); // ✅ mapper ensures client_name
          setDocuments(prev => prev.map(d => (d.id === editingItem.id ? updated : d)));
          toast.success("updated ")
        } else {
          // CREATE
          const res = await propertyPaymentReceiptAPI.create({
            type: 'property_payment_receipt',
            status: 'paid',
            payment_status: 'paid',
            related_party: data.related_party,

            // parties
            seller_id: data.seller_id,
            seller_name: data.seller_name,
            seller_phone: data.seller_phone,
            seller_email: data.seller_email,
            buyer_id: data.buyer_id,
            buyer_name: data.buyer_name,
            buyer_phone: data.buyer_phone,
            buyer_email: data.buyer_email,

            // property
            property_id: data.property_id,
            property_address: data.property_address,
            property_details: data.property_details,

            // money + dates
            deal_value: data.deal_value,
            payment_type: data.payment_type,
            amount: data.amount,
            amount_in_words: data.amount_in_words,
            receipt_date: data.receipt_date,
            payment_date: data.payment_date,
            payment_reference: data.payment_reference,

            // misc
            transaction_details: (data as any).transaction_details,
            notes: data.notes,
            ledger_entries: data.ledger_entries,
            created_by: data.created_by,
            updated_by: data.updated_by,
          });

          const row = res.data || res;
          const created: FD = mapRowToFD(row); // ✅ mapper ensures client_name
          setDocuments(prev => [created, ...prev]);
        }

      } else {
        // बाकी doc types (existing local flow)
        if (editingItem) {
          // ensure client_name exist for safety (derive from buyer/seller if missing)
          const safe: any = {
            ...editingItem,
            ...data,
          };
          if (!safe.client_name) {
            safe.client_name = data.buyer_name || data.seller_name || editingItem.client_name || '—';
          }
          setDocuments(prev => prev.map(doc => (doc.id === editingItem.id ? (safe as FinancialDocument) : doc)));
        } else {
          const maxId = documents.length ? Math.max(...documents.map(d => d.id)) : 0;
          const safe: any = { ...data, id: maxId + 1 };
          if (!safe.client_name) {
            safe.client_name = data?.buyer_name || data?.seller_name || '—';
          }
          setDocuments(prev => [safe as FinancialDocument, ...prev]);
        }
      }
    } catch (e) {
      console.error('Save error', e);
    } finally {
      setShowInvoiceForm(false);
      setShowReceiptForm(false);
      setShowPropertyForm(false);
      setEditingItem(null);
    }
  };



  const handleApproveDocument = (documentId: number, approved: boolean) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === documentId
          ? {
            ...doc,
            requires_approval: false,
            status: approved ? 'active' : 'rejected',
            approved_by: 'Admin User',
            approved_at: new Date().toISOString()
          }
          : doc
      )
    );
    setShowApprovalModal(false);
    setSelectedItem(null);
  };

  const handleDocumentSelection = (docId: number) => {
    setSelectedDocuments(prev =>
      prev.includes(docId) ? prev.filter(id => id !== docId) : [...prev, docId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map(d => d.id));
    }
  };

  /**
   * UI helpers
   */
  const getStatusBadge = (status?: string, paymentStatus?: string) => {
    if (status === 'pending_approval') {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <AlertTriangle size={14} className="mr-1" />
          Pending Approval
        </span>
      );
    }

    const statusConfig: Record<string, { bg: string; text: string; label: string; icon: React.ComponentType<LucideProps> }> = {
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid', icon: CheckCircle },
      sent: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Sent', icon: Send },
      pending: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Pending', icon: Clock },
      overdue: { bg: 'bg-red-100', text: 'text-red-800', label: 'Overdue', icon: AlertCircle },
      active: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Active', icon: CheckSquare }
    };

    const finalStatus = paymentStatus ?? status ?? 'pending';
    const config = statusConfig[finalStatus] ?? statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon size={14} className="mr-1" />
        {config.label}
      </span>
    );
  };

  const getDocumentTypeInfo = (type: DocumentType) => {
    const typeConfig: Record<DocumentType, { label: string; icon: React.ComponentType<LucideProps>; color: string; bg: string }> = {
      brokerage_invoice: { label: 'Brokerage Invoice', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100' },
      brokerage_receipt: { label: 'Brokerage Receipt', icon: Receipt, color: 'text-green-600', bg: 'bg-green-100' },
      property_payment_receipt: { label: 'Property Payment Receipt', icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-100' }
    };

    return typeConfig[type] ?? typeConfig.brokerage_invoice;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left Side */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl">
              <Receipt className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Accounts Management
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                Complete financial document management with ledger tracking
              </p>
            </div>
          </div>

          {/* Right Side (Dropdown) */}
          <div className="flex items-start sm:items-center justify-end">
            <div className="relative group">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">
                <Plus size={16} />
                <span>Create Document</span>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 w-64">
                <div className="p-2">
                  <button
                    onClick={handleCreateInvoice}
                    className="flex items-start space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg w-full text-left"
                  >
                    <FileText className="text-purple-600 mt-1" size={16} />
                    <div>
                      <div className="font-medium">Brokerage Invoice</div>
                      <div className="text-xs text-gray-500">Commission invoice to client</div>
                    </div>
                  </button>
                  <button
                    onClick={handleCreateReceipt}
                    className="flex items-start space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg w-full text-left"
                  >
                    <Receipt className="text-green-600 mt-1" size={16} />
                    <div>
                      <div className="font-medium">Brokerage Receipt</div>
                      <div className="text-xs text-gray-500">Commission payment received</div>
                    </div>
                  </button>
                  <button
                    onClick={handleCreatePropertyReceipt}
                    className="flex items-start space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg w-full text-left"
                  >
                    <CreditCard className="text-orange-600 mt-1" size={16} />
                    <div>
                      <div className="font-medium">Property Payment Receipt</div>
                      <div className="text-xs text-gray-500">Property payment acknowledgment</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Amount</p>
                <p className="text-2xl font-bold">₹{(totalAmount / 100000).toFixed(1)}L</p>
              </div>
              <DollarSign size={24} className="text-blue-200" />
            </div>
            <div className="flex items-center mt-2 text-blue-100 text-sm">
              <ArrowUp size={14} className="mr-1" />
              <span>+12% from last month</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Paid Amount</p>
                <p className="text-2xl font-bold">₹{(paidAmount / 100000).toFixed(1)}L</p>
              </div>
              <CheckCircle size={24} className="text-green-200" />
            </div>
            <div className="flex items-center mt-2 text-green-100 text-sm">
              <ArrowUp size={14} className="mr-1" />
              <span>+8% from last month</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Pending Amount</p>
                <p className="text-2xl font-bold">₹{(pendingAmount / 100000).toFixed(1)}L</p>
              </div>
              <Clock size={24} className="text-orange-200" />
            </div>
            <div className="flex items-center mt-2 text-orange-100 text-sm">
              <ArrowDown size={14} className="mr-1" />
              <span>-5% from last month</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">This Month</p>
                <p className="text-2xl font-bold">₹{(thisMonthAmount / 100000).toFixed(1)}L</p>
              </div>
              <TrendingUp size={24} className="text-purple-200" />
            </div>
            <div className="flex items-center mt-2 text-purple-100 text-sm">
              <ArrowUp size={14} className="mr-1" />
              <span>+15% from last month</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <div className="flex space-x-1 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === tab.id ? `bg-${tab.color}-100 text-${tab.color}-700 border border-${tab.color}-200` : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <span className="font-medium">{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? `bg-${tab.color}-200` : 'bg-gray-200'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter size={16} />
              <span>Filters</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {selectedDocuments.length > 0 && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm font-medium text-blue-700">{selectedDocuments.length} selected</span>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                  Bulk Action
                </button>
              </div>
            )}
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left w-8">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parties & Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Financial Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status & Approval</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.map((doc) => {
                const typeInfo = getDocumentTypeInfo(doc.type);
                const TypeIcon = typeInfo.icon;
                return (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(doc.id)}
                        onChange={() => handleDocumentSelection(doc.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${typeInfo.bg}`}>
                          <TypeIcon className={typeInfo.color} size={20} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{doc.invoice_id ?? doc.receipt_id}</div>
                          <div className="text-sm text-gray-600">{typeInfo.label}</div>
                          <div className="text-xs text-gray-500">Created: {doc.date ?? doc.receipt_date}</div>
                          {doc.payment_date && <div className="text-xs text-green-600">Paid: {doc.payment_date}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="text-sm"><span className="font-medium text-gray-700">Seller:</span> {doc.seller_name}</div>
                        <div className="text-sm"><span className="font-medium text-gray-700">Buyer:</span> {doc.buyer_name}</div>
                        <div className="flex items-start space-x-1 text-sm text-gray-600">
                          <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{doc.property_address}</span>
                        </div>
                        {doc.property_details && (
                          <div className="text-xs text-gray-500">
                            {doc.property_details.type} • {doc.property_details.area} • {doc.property_details.floor}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {doc.deal_value && (
                          <div className="text-sm">
                            <span className="text-gray-500">Deal Value:</span>
                            <span className="font-bold text-blue-600 ml-1">₹{(doc.deal_value / 100000).toFixed(1)}L</span>
                          </div>
                        )}
                        {doc.brokerage_percentage && (
                          <div className="text-sm">
                            <span className="text-gray-500">Brokerage:</span>
                            <span className="font-medium text-purple-600 ml-1">{doc.brokerage_percentage}%</span>
                          </div>
                        )}
                        <div className="font-bold text-lg text-gray-900">₹{(doc.total_amount ?? doc.amount ?? 0).toLocaleString('en-IN')}</div>
                        <div className="text-xs text-gray-500">{doc.amount_in_words}</div>
                        {doc.payment_method && <div className="text-xs text-blue-600">via {doc.payment_method}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {getStatusBadge(doc.status, doc.payment_status)}
                        {doc.requires_approval && (
                          <div className="flex items-center space-x-1 text-xs text-orange-600">
                            <Clock3 size={12} />
                            <span>Awaiting Approval</span>
                          </div>
                        )}
                        {doc.approved_by && <div className="text-xs text-green-600">Approved by {doc.approved_by}</div>}
                        {/* <div className="text-xs text-gray-500">by {doc.created_by}</div> */}
                        <div className="text-xs text-gray-500"> <span className='font-bold'>Created By: </span> {doc.created_by_name}</div>
                        <div className="text-xs text-gray-500"><span className='font-bold'> Updated By: </span>  {doc.updated_by_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewLedger(doc)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="View Ledger"
                        >
                          <History size={16} />
                        </button>
                        <button
                          onClick={() => handleTracking(doc)}
                          className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                          title="View Tracking"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleShare(doc)}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                          title="Share Document"
                        >
                          <Share size={16} />
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download size={16} />
                        </button>
                        {doc.requires_approval && userRole === 'admin' && (
                          <button
                            onClick={() => handleApproval(doc)}
                            className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                            title="Approve/Reject"
                          >
                            <Shield size={16} />
                          </button>
                        )}
                        <div className="relative group">
                          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreHorizontal size={16} />
                          </button>
                          <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <div className="p-1">
                              <button
                                onClick={() => handleEdit(doc)}
                                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded w-full text-left"
                              >
                                <Edit size={14} />
                                <span>Edit</span>
                              </button>

                              <button
                                onClick={() => {
                                  if (doc.type === 'property_payment_receipt') {
                                    if (window.confirm(`Delete receipt ${doc.receipt_id ?? doc.id}?`)) {
                                      hardDeletePropertyReceipt(doc);
                                    }
                                  } else {
                                    // fallback to your existing modal flow for other doc types
                                    handleDelete(doc);
                                  }
                                }}
                                className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-100 rounded w-full text-left"
                              >
                                <Trash2 size={14} />
                                <span>Delete</span>
                              </button>

                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showSharingModal && selectedItem && (
        <SharingModal
          isOpen={showSharingModal}
          onClose={() => {
            setShowSharingModal(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          type={selectedItem?.type}
          onShare={(shareData: any) => {
            console.log('Document shared:', shareData);
            setShowSharingModal(false);
            setSelectedItem(null);
          }}
        />
      )}

      {showTrackingModal && selectedItem && (
        <TrackingModal
          isOpen={showTrackingModal}
          onClose={() => {
            setShowTrackingModal(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          type={selectedItem?.type}
        />
      )}

      {showEditModal && selectedItem && (
        <DocumentEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          document={selectedItem}
          userRole={userRole}
          onSave={(updatedDoc: any) => {
            console.log('Document updated:', updatedDoc);
            setShowEditModal(false);
            setSelectedItem(null);
          }}
        />
      )}

      {showDeleteModal && selectedItem && (
        <DeleteRequestModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedItem(null);
          }}
          document={selectedItem}
          userRole={userRole}
          onSubmit={(deleteData: any) => {
            console.log('Delete request submitted:', deleteData);
            setShowDeleteModal(false);
            setSelectedItem(null);
          }}
        />
      )}

      {showInvoiceForm && (
        <InvoiceFormModal
          isOpen={showInvoiceForm}
          onClose={() => {
            setShowInvoiceForm(false);
            setEditingItem(null);
          }}
          invoice={editingItem}
          onSave={handleSaveDocument}
          userRole={userRole}
        />
      )}

      {showReceiptForm && (
        <ReceiptFormModal
          isOpen={showReceiptForm}
          onClose={() => {
            setShowReceiptForm(false);
            setEditingItem(null);
          }}
          receipt={editingItem}
          onSave={handleSaveDocument}
          userRole={userRole}
        />
      )}

      {showPropertyForm && (
        <PropertyReceiptFormModal
          isOpen={showPropertyForm}
          onClose={() => {
            setShowPropertyForm(false);
            setEditingItem(null);
          }}
          receipt={editingItem}        // adjust prop name if your component expects something else
          onSave={handleSaveDocument}  // forward save to same handler
          userRole={userRole}          // pass through if needed
        />
      )}

      {showLedgerModal && selectedItem && (
        <LedgerModal
          isOpen={showLedgerModal}
          onClose={() => {
            setShowLedgerModal(false);
            setSelectedItem(null);
          }}
          document={selectedItem}
        />
      )}

      {showApprovalModal && selectedItem && (
        <ApprovalModal
          isOpen={showApprovalModal}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedItem(null);
          }}
          document={selectedItem}
          onApprove={(approved: boolean) => handleApproveDocument(selectedItem.id, approved)}
          userRole={userRole}
        />
      )}
    </div>
  );
};

export default AccountsPage;
