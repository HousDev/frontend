import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  X,
  Save,
  Receipt,
  User,
  Building,
  CreditCard,
  Users,
  Banknote,
} from 'lucide-react';

import { sellerAPI } from '@/lib/sellersAPI';
import { buyerAPI } from '@/lib/buyerAPI';
import { useAuth } from '@/contexts/AuthContext';
import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
import { toast } from 'react-toastify';

// UI value for <input type="datetime-local"> => "YYYY-MM-DDTHH:MM"
const toLocalDatetimeInput = (v: any): string => {
  if (!v) return '';
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day}T${hh}:${mm}`;
};

// Convert "YYYY-MM-DDTHH:MM" -> "YYYY-MM-DD HH:MM:SS" (MySQL DATETIME)
const localInputToMySQL = (s: string): string | null => {
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) {
    const [date, time] = s.split('T');
    return `${date} ${time}:00`;
  }
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
};

// ---- types ----
type PropertyMini = {
  id: string | number;
  address?: string;
  type?: string;
  property_type_name?: string;
  area?: string;
  carpet_area?: string;
  floor?: string;
  floor_number?: string | number;
  facing?: string;
  direction?: string;
  price?: number;
  expected_price?: number;
  deal_value?: number;
};

type Seller = {
  id: string | number;
  salutation?: string;
  name?: string;
  phone?: string;
  email?: string;
  properties?: PropertyMini[];
};

type Buyer = {
  id: string | number;
  salutation?: string;
  name?: string;
  phone?: string;
  email?: string;
};

interface FinancialDocument {
  seller_id?: string | number;
  buyer_id?: string | number;
  property_id?: string | number;
  seller_phone?: string;
  seller_email?: string;
  buyer_phone?: string;
  buyer_email?: string;
  transaction_details?: {
    payment_method?: string;
    buyer_bank_name?: string;
    seller_bank_name?: string;
    [k: string]: any;
  };
  created_at?: string;
  updated_at?: string;
}

interface PropertyReceiptFormModalDocProps {
  isOpen: boolean;
  onClose: () => void;
  receipt?: any;
  onSave: (data: any) => Promise<void>;
  userRole: string;
  prefill?: {
    sellerId?: string | number;
    buyerId?: string | number;
    propertyId?: string | number;
  };
  lockSelections?: {
    seller?: boolean;
    buyer?: boolean;
    property?: boolean;
  };
}

const PropertyReceiptFormModalDoc: React.FC<PropertyReceiptFormModalDocProps> = ({
  isOpen,
  onClose,
  receipt,
  onSave,
  userRole,
  prefill,
  lockSelections = {}
}) => {
  // data sources
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [sellerProperties, setSellerProperties] = useState<PropertyMini[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { user } = useAuth();
  const prefilledRef = useRef(false);
  const [masterLoading, setMasterLoading] = useState(true);
  const [masters, setMasters] = useState<Record<string, MasterOption[]>>({});

  // state
  const [formData, setFormData] = useState({
    seller_id: '',
    buyer_id: '',
    property_id: '',
    receipt_id: '',
    seller_name: '',
    seller_phone: '',
    seller_email: '',
    buyer_name: '',
    buyer_phone: '',
    buyer_email: '',
    property_address: '',
    property_details: {
      type: '',
      area: '',
      floor: '',
      facing: ''
    },
    deal_value: 0,
    brokerage_percentage: 0,
    payment_type: '',
    amount: 0,
    amount_in_words: '',
    receipt_date: toLocalDatetimeInput(new Date()),
    payment_date: toLocalDatetimeInput(new Date()),
    payment_reference: '',
    transaction_details: {
      payment_method: '',
      buyer_bank_name: '',
      seller_bank_name: '',
    },
    related_party: 'buyer_to_seller' as 'buyer' | 'seller' | 'buyer_to_seller',
    notes: '',
    created_by: '' as string | number | undefined,
    updated_by: '' as string | number | undefined,
    created_at: '',
    updated_at: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const fetchedOnceRef = useRef(false);

  // ---------- helpers ----------
  const setFD = (patch: any) => setFormData(prev => ({ ...prev, ...patch }));

  const convertToWords = (amount: number): string => {
    const n = Math.floor(Math.abs(amount));
    if (!n) return 'Zero Only';
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const two = (x: number) => (x < 20 ? ones[x] : `${tens[Math.floor(x / 10)]}${x % 10 ? ' ' + ones[x % 10] : ''}`.trim());
    const three = (x: number) => {
      const h = Math.floor(x / 100);
      const r = x % 100;
      return `${h ? ones[h] + ' Hundred' : ''}${r ? (h ? ' ' : '') + two(r) : ''}`.trim();
    };
    let x = n;
    const crores = Math.floor(x / 10000000); x %= 10000000;
    const lakhs = Math.floor(x / 100000); x %= 100000;
    const thousands = Math.floor(x / 1000); x %= 1000;
    const parts: string[] = [];
    if (crores) parts.push(`${two(crores)} Crore`);
    if (lakhs) parts.push(`${two(lakhs)} Lakh`);
    if (thousands) parts.push(`${two(thousands)} Thousand`);
    if (x) parts.push(three(x));
    return `${amount < 0 ? 'Minus ' : ''}${parts.join(' ')} Only`.replace(/\s+/g, ' ').trim();
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setFD({ [field]: value });
    }
  };

  // ---------- masters data ----------
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        setMasterLoading(true);
        const data = await getMasterDropdownOptions(['common']);
        setMasters(data);
      } catch (err) {
        console.error('Error fetching master options:', err);
        toast.error('Failed to load dropdown options');
      } finally {
        setMasterLoading(false);
      }
    };
    fetchMasters();
  }, []);

  // ---------- data load ----------
  useEffect(() => {
    if (!isOpen) return;
    if (fetchedOnceRef.current) return;
    fetchedOnceRef.current = true;

    const run = async () => {
      setIsLoadingData(true);
      try {
        const [sellersData, buyersData] = await Promise.all([
          sellerAPI.getAll(),
          buyerAPI.getAll()
        ]);
        setSellers(Array.isArray(sellersData) ? sellersData : []);
        setBuyers(Array.isArray(buyersData) ? buyersData : []);
      } catch (e) {
        console.error('Failed to fetch sellers/buyers', e);
        toast.error('Failed to load data');
      } finally {
        setIsLoadingData(false);
      }
    };
    run();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      fetchedOnceRef.current = false;
    }
  }, [isOpen]);
useEffect(() => {
  if (!isOpen) return;
  if (!prefill?.propertyId) return;
  if (!formData.seller_id) return;
  if (formData.property_id) return;
  if (sellerProperties.length === 0) return;

  const p = sellerProperties.find(pp => String(pp.id) === String(prefill!.propertyId));
  if (p) {
    const details = {
      type: p.type || p.property_type_name || '',
      area: p.area || p.carpet_area || '',
      floor: (p.floor ?? p.floor_number ?? '').toString(),
      facing: p.facing || p.direction || '',
    };
    setFD({
      property_id: String(prefill!.propertyId),
      property_address: p.address || '',
      property_details: details,
      deal_value: Number(p.price ?? p.expected_price ?? p.deal_value ?? 0),
    });
  }
}, [isOpen, prefill?.propertyId, formData.seller_id, sellerProperties]);

useEffect(() => {
  if (!isOpen) return;
  if (prefilledRef.current) return;
  if (isLoadingData || masterLoading) return;

  const { sellerId, buyerId, propertyId } = prefill || {};

  // --- Seller ---
  let propsOfSeller: PropertyMini[] = [];
  if (sellerId && sellers.length > 0) {
    const seller = sellers.find(s => String(s.id) === String(sellerId));
    if (seller) {
      const sellerName = `${seller.salutation || ''} ${seller.name || ''}`.trim();
      setFD({
        seller_id: String(sellerId),
        seller_name: sellerName,
        seller_phone: seller.phone || '',
        seller_email: seller.email || '',
      });
      propsOfSeller = Array.isArray(seller.properties) ? seller.properties : [];
      setSellerProperties(propsOfSeller); // keep state in sync
    }
  }

  // --- Buyer ---
  if (buyerId && buyers.length > 0) {
    const buyer = buyers.find(b => String(b.id) === String(buyerId));
    if (buyer) {
      const buyerName = `${buyer.salutation || ''} ${buyer.name || ''}`.trim();
      setFD({
        buyer_id: String(buyerId),
        buyer_name: buyerName,
        buyer_phone: buyer.phone || '',
        buyer_email: buyer.email || '',
      });
    }
  }

  // --- Property (resolve from local propsOfSeller; don't depend on state) ---
  if (propertyId && propsOfSeller.length > 0) {
    const p = propsOfSeller.find(pp => String(pp.id) === String(propertyId));
    if (p) {
      const details = {
        type: p.type || p.property_type_name || '',
        area: p.area || p.carpet_area || '',
        floor: (p.floor ?? p.floor_number ?? '').toString(),
        facing: p.facing || p.direction || '',
      };
      setFD({
        property_id: String(propertyId),
        property_address: p.address || '',
        property_details: details,
        deal_value: Number(p.price ?? p.expected_price ?? p.deal_value ?? 0),
      });
    }
  }

  // --- Existing receipt overrides prefill (keep as you had) ---
  if (receipt) {
    const pd = receipt.property_details || {
      type: receipt.property_type || '',
      area: receipt.property_area || '',
      floor: receipt.property_floor || '',
      facing: receipt.property_facing || '',
    };
    setFormData(prev => ({
      ...prev,
      receipt_id: receipt.receipt_id || prev.receipt_id || '',
      seller_id: receipt.seller_id != null ? String(receipt.seller_id) : prev.seller_id,
      buyer_id: receipt.buyer_id != null ? String(receipt.buyer_id) : prev.buyer_id,
      property_id: receipt.property_id != null ? String(receipt.property_id) : prev.property_id,
      seller_name: receipt.seller_name || prev.seller_name,
      seller_phone: receipt.seller_phone || prev.seller_phone,
      seller_email: receipt.seller_email || prev.seller_email,
      buyer_name: receipt.buyer_name || prev.buyer_name,
      buyer_phone: receipt.buyer_phone || prev.buyer_phone,
      buyer_email: receipt.buyer_email || prev.buyer_email,
      property_address: receipt.property_address || prev.property_address,
      property_details: { type: pd.type || '', area: pd.area || '', floor: pd.floor || '', facing: pd.facing || '' },
      deal_value: Number(receipt.deal_value) || prev.deal_value,
      payment_type: receipt.payment_type || prev.payment_type || '',
      amount: Number(receipt.amount) || prev.amount,
      amount_in_words: receipt.amount_in_words || prev.amount_in_words,
      receipt_date: toLocalDatetimeInput(receipt.receipt_date) || prev.receipt_date,
      payment_date: toLocalDatetimeInput(receipt.payment_date) || prev.payment_date,
      payment_reference: receipt.payment_reference || prev.payment_reference,
      transaction_details: {
        payment_method: receipt.transaction_details?.payment_method || prev.transaction_details.payment_method || '',
        buyer_bank_name: receipt.transaction_details?.buyer_bank_name || prev.transaction_details.buyer_bank_name || '',
        seller_bank_name: receipt.transaction_details?.seller_bank_name || prev.transaction_details.seller_bank_name || '',
      },
      related_party: receipt.related_party || prev.related_party,
      notes: receipt.notes || prev.notes,
      created_by: receipt?.created_by ?? (user?.id ?? prev.created_by),
      updated_by: user?.id ?? receipt?.updated_by ?? prev.updated_by,
      created_at: receipt.created_at || prev.created_at,
      updated_at: new Date().toISOString(),
    }));
  }

  prefilledRef.current = true;
}, [isOpen, isLoadingData, masterLoading, prefill, sellers, buyers, receipt, user?.id]);

  // reset flag when modal closes
  useEffect(() => { 
    if (!isOpen) {
      prefilledRef.current = false;
    }
  }, [isOpen]);

  // ---------- options ----------
  const bankOptions: MasterOption[] = masters?.banks ?? [];
  const paymentTypeOptions: MasterOption[] = masters?.['payment types'] ?? [];
  const paymentMethodRaw: MasterOption[] = masters?.['payement methods'] || masters?.['payment methods'] || [];

  const bankOptionsSorted = useMemo(
    () => [...bankOptions].sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })),
    [bankOptions]
  );
  const paymentTypeOptionsSorted = useMemo(
    () => [...paymentTypeOptions].sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })),
    [paymentTypeOptions]
  );
  const paymentMethodOptionsSorted = useMemo(
    () => [...paymentMethodRaw].sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })),
    [paymentMethodRaw]
  );

  // ---------- keep sellerProperties in sync ----------
  useEffect(() => {
    if (!formData.seller_id || sellers.length === 0) {
      setSellerProperties([]);
      return;
    }
    const selectedSeller = sellers.find(s => String(s.id) === String(formData.seller_id));
    setSellerProperties(Array.isArray(selectedSeller?.properties) ? selectedSeller!.properties : []);
  }, [formData.seller_id, sellers]);

  // ---------- amount -> words ----------
  useEffect(() => {
    setFD({
      amount_in_words: formData.amount ? convertToWords(Number(formData.amount) || 0) : ''
    });
  }, [formData.amount]);

  // ---------- handlers ----------
  const handleSellerChange = (sellerId: string) => {
    if (lockSelections.seller) return; // Don't allow changes if locked
    
    if (!sellerId) {
      setFD({
        seller_id: '',
        seller_name: '',
        seller_phone: '',
        seller_email: '',
        property_id: '',
        property_address: '',
        property_details: { type: '', area: '', floor: '', facing: '' },
        deal_value: 0
      });
      setSellerProperties([]);
      return;
    }
    const s = sellers.find(ss => String(ss.id) === String(sellerId));
    if (s) {
      const sellerName = `${s.salutation || ''} ${s.name || ''}`.trim();
      setFD({
        seller_id: sellerId,
        seller_name: sellerName,
        seller_phone: s.phone || '',
        seller_email: s.email || '',
        // reset property when seller changes (unless property is locked)
        ...(!lockSelections.property && {
          property_id: '',
          property_address: '',
          property_details: { type: '', area: '', floor: '', facing: '' },
          deal_value: 0
        })
      });
      setSellerProperties(Array.isArray(s.properties) ? s.properties : []);
    } else {
      setFD({
        seller_id: '',
        seller_name: '',
        seller_phone: '',
        seller_email: '',
      });
      setSellerProperties([]);
    }
  };

  const handleBuyerChange = (buyerId: string) => {
    if (lockSelections.buyer) return; // Don't allow changes if locked
    
    if (!buyerId) {
      setFD({
        buyer_id: '',
        buyer_name: '',
        buyer_phone: '',
        buyer_email: ''
      });
      return;
    }
    const b = buyers.find(bb => String(bb.id) === String(buyerId));
    if (b) {
      const buyerName = `${b.salutation || ''} ${b.name || ''}`.trim();
      setFD({
        buyer_id: buyerId,
        buyer_name: buyerName,
        buyer_phone: b.phone || '',
        buyer_email: b.email || ''
      });
    } else {
      setFD({
        buyer_id: '',
        buyer_name: '',
        buyer_phone: '',
        buyer_email: ''
      });
    }
  };

  const handlePropertyChange = (propertyId: string) => {
    if (lockSelections.property) return; // Don't allow changes if locked
    
    if (!propertyId) {
      setFD({
        property_id: '',
        property_address: '',
        property_details: { type: '', area: '', floor: '', facing: '' },
        deal_value: 0
      });
      return;
    }
    const p = sellerProperties.find(pp => String(pp.id) === String(propertyId));
    if (p) {
      const details = {
        type: p.type || p.property_type_name || '',
        area: p.area || p.carpet_area || '',
        floor: (p.floor ?? p.floor_number ?? '').toString(),
        facing: p.facing || p.direction || ''
      };
      setFD({
        property_id: String(propertyId),
        property_address: p.address || '',
        property_details: details,
        deal_value: Number(p.price ?? p.expected_price ?? p.deal_value ?? 0)
      });
    } else {
      setFD({
        property_id: '',
        property_address: '',
        property_details: { type: '', area: '', floor: '', facing: '' }
      });
    }
  };

  // ---------- save ----------
  const handleSave = async () => {
    if (!formData.seller_name.trim()) {
      toast.error('Please select a seller');
      return;
    }
    if (!formData.buyer_name.trim()) {
      toast.error('Please select a buyer');
      return;
    }
    if (!formData.property_address.trim()) {
      toast.error('Please select a property');
      return;
    }
    if (!formData.payment_type) {
      toast.error('Please select a payment type');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error('Please enter valid amount');
      return;
    }
    if (!formData.payment_reference.trim()) {
      toast.error('Please enter payment reference');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();

      const receiptData = {
        type: 'property_payment_receipt',
        status: 'paid',
        payment_status: 'paid',

        receipt_id: formData.receipt_id,
        seller_id: formData.seller_id,
        seller_name: formData.seller_name,
        seller_phone: formData.seller_phone,
        seller_email: formData.seller_email,
        buyer_id: formData.buyer_id,
        buyer_name: formData.buyer_name,
        buyer_phone: formData.buyer_phone,
        buyer_email: formData.buyer_email,

        property_id: formData.property_id,
        property_address: formData.property_address,
        property_details: { ...formData.property_details },

        deal_value: formData.deal_value,

        payment_type: formData.payment_type,
        amount: Number(formData.amount) || 0,
        amount_in_words: formData.amount_in_words,
        receipt_date: localInputToMySQL(formData.receipt_date),
        payment_date: localInputToMySQL(formData.payment_date),

        payment_reference: formData.payment_reference,

        transaction_details: { ...formData.transaction_details },

        related_party: formData.related_party,
        notes: formData.notes,

        created_at: receipt?.created_at || now,
        updated_at: now,
        created_by: receipt?.created_by ?? (formData.created_by || user?.id || ''),
        updated_by: user?.id ?? formData.updated_by ?? '',

        ledger_entries: receipt?.ledger_entries || [
          {
            type: 'credit',
            amount: Number(formData.amount) || 0,
            description: 'Property payment received',
            date: localInputToMySQL(formData.payment_date) || formData.payment_date,
            balance: Number(formData.amount) || 0
          }
        ]
      };

      await onSave(receiptData);
      toast.success('Receipt saved successfully!');

    } catch (error) {
      console.error('Error saving receipt:', error);
      toast.error('Failed to save receipt');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // ---------- UI ----------
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-2 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Receipt className="text-orange-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {receipt ? 'Edit Property Payment Receipt' : 'Create Property Payment Receipt'}
                </h2>
                <p className="text-gray-600 mt-1">Property Payment acknowledgment with transaction details</p>
                {Object.values(lockSelections).some(Boolean) && (
                  <p className="text-sm text-orange-600 mt-1">
                    Some fields are locked based on document selection
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {isLoadingData ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading data...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Receipt meta */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Receipt className="mr-2" size={20} />
                    Receipt Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Receipt ID</label>
                      <input
                        type="text"
                        value={formData.receipt_id}
                        placeholder="Auto generated after Create"
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Related Party</label>
                      <select
                        value={formData.related_party}
                        onChange={(e) => handleInputChange('related_party', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="buyer">From Buyer</option>
                        <option value="seller">From Seller</option>
                        <option value="buyer_to_seller">Buyer to Seller</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Date</label>
                      <input
                        type="datetime-local"
                        value={formData.receipt_date}
                        onChange={(e) => handleInputChange('receipt_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                      <input
                        type="datetime-local"
                        value={formData.payment_date}
                        onChange={(e) => handleInputChange('payment_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Seller */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="mr-2" size={20} />
                    Seller Information
                    {lockSelections.seller && <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Locked</span>}
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Seller <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.seller_id}
                          onChange={(e) => handleSellerChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={lockSelections.seller}
                          required
                        >
                          <option value="">-- Select Seller --</option>
                          {sellers.length ? (
                            sellers.map(s => (
                              <option key={s.id} value={String(s.id)}>
                                {s.salutation} {s.name}
                              </option>
                            ))
                          ) : (
                            <option disabled>No sellers available</option>
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Seller ID</label>
                        <input
                          type="text"
                          value={formData.seller_id}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                          placeholder="Auto"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Seller Phone</label>
                        <input
                          type="tel"
                          value={formData.seller_phone}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Seller Email</label>
                        <input
                          type="email"
                          value={formData.seller_email}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buyer */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="mr-2" size={20} />
                    Buyer Information
                    {lockSelections.buyer && <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Locked</span>}
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Buyer <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.buyer_id}
                          onChange={(e) => handleBuyerChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={lockSelections.buyer}
                          required
                        >
                          <option value="">-- Select Buyer --</option>
                          {buyers.length ? (
                            buyers.map(b => (
                              <option key={b.id} value={String(b.id)}>
                                {b.salutation} {b.name}
                              </option>
                            ))
                          ) : (
                            <option disabled>No buyers available</option>
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Buyer ID</label>
                        <input
                          type="text"
                          value={formData.buyer_id}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                          placeholder="Auto"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Phone</label>
                        <input
                          type="tel"
                          value={formData.buyer_phone}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Email</label>
                        <input
                          type="email"
                          value={formData.buyer_email}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Property */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Building className="mr-2" size={20} />
                    Property Information
                    {lockSelections.property && <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">Locked</span>}
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Property <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.property_id}
                          onChange={(e) => handlePropertyChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          disabled={!formData.seller_id || sellerProperties.length === 0 || lockSelections.property}
                          required
                        >
                          <option value="">
                            {!formData.seller_id
                              ? '-- Select Seller First --'
                              : sellerProperties.length === 0
                                ? '-- No Properties Available --'
                                : '-- Select Property --'}
                          </option>
                          {sellerProperties.map((p) => (
                            <option key={String(p.id)} value={String(p.id)}>
                              {p.address} ({p.type || p.property_type_name})
                            </option>
                          ))}
                        </select>
                        {formData.seller_id && sellerProperties.length === 0 && (
                          <p className="text-sm text-orange-600 mt-1">This seller has no properties attached</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Property ID</label>
                        <input
                          type="text"
                          value={formData.property_id}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                          placeholder="Auto"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Property Address</label>
                      <textarea
                        value={formData.property_address}
                        readOnly
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                        <input
                          type="text"
                          value={formData.property_details.type}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Area (Sq ft)</label>
                        <input
                          type="text"
                          value={formData.property_details.area}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                        <input
                          type="text"
                          value={formData.property_details.floor}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Facing</label>
                        <input
                          type="text"
                          value={formData.property_details.facing}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Payment */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CreditCard className="mr-2" size={20} />
                    Payment Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type <span className="text-red-500">*</span></label>
                      <select
                        value={formData.payment_type}
                        onChange={(e) => handleInputChange('payment_type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        disabled={masterLoading}
                        required
                      >
                        <option value="">
                          {masterLoading
                            ? 'Loading payment types…'
                            : '-- Select Payment Type --'}
                        </option>
                        {(masterLoading ? [] : paymentTypeOptionsSorted).map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.amount}
                        onChange={(e) => handleInputChange('amount', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="500000"
                        required
                      />
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4">
                      <label className="block text-sm font-medium text-orange-700 mb-1">Amount in Words</label>
                      <div className="text-sm text-orange-800 font-medium">{formData.amount_in_words}</div>
                    </div>
                  </div>
                </div>

                {/* Transaction */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Banknote className="mr-2" size={20} />
                    Transaction Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                      <select
                        value={formData.transaction_details.payment_method}
                        onChange={(e) => handleInputChange('transaction_details.payment_method', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        disabled={masterLoading}
                      >
                        <option value="">
                          {masterLoading ? 'Loading payment methods…' : '-- Select Payment Method --'}
                        </option>
                        {(masterLoading ? [] : paymentMethodOptionsSorted).map((method) => (
                          <option key={method.value} value={method.value}>
                            {method.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Reference <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.payment_reference}
                        onChange={(e) => handleInputChange('payment_reference', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="TXN123456789"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Bank Name</label>
                        <select
                          value={formData.transaction_details.buyer_bank_name}
                          onChange={(e) => handleInputChange('transaction_details.buyer_bank_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          disabled={masterLoading}
                        >
                          <option value="">
                            {masterLoading
                              ? 'Loading banks…'
                              : '-- Select Buyer Bank --'}
                          </option>
                          {(masterLoading ? [] : bankOptionsSorted).map((b) => (
                            <option key={b.value} value={b.value}>{b.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Seller Bank Name</label>
                        <select
                          value={formData.transaction_details.seller_bank_name}
                          onChange={(e) => handleInputChange('transaction_details.seller_bank_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          disabled={masterLoading}
                        >
                          <option value="">
                            {masterLoading
                              ? 'Loading banks…'
                              : '-- Select Seller Bank --'}
                          </option>
                          {(masterLoading ? [] : bankOptionsSorted).map((b) => (
                            <option key={b.value} value={b.value}>{b.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Additional notes or terms..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-2 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {userRole === 'manager'
                ? 'Receipt will require admin approval'
                : 'Receipt will be created immediately'}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={
                  isSubmitting ||
                  !formData.seller_name.trim() ||
                  !formData.buyer_name.trim() ||
                  !formData.property_address.trim() ||
                  !formData.payment_type ||
                  !formData.amount ||
                  !formData.payment_reference.trim()
                }
                className="flex items-center space-x-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                <span>{isSubmitting ? 'Saving...' : receipt ? 'Update Receipt' : 'Create Receipt'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyReceiptFormModalDoc;