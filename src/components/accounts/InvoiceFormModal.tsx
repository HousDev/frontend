import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  Calculator,
  User,
  Building,
  CreditCard,
  FileText,
  Users
} from 'lucide-react';

import { sellerAPI } from '@/lib/sellersAPI';
import { buyerAPI } from '@/lib/buyerAPI';
import { useAuth } from '@/contexts/AuthContext';

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

type InvoiceIn = any; // whatever you pass as `invoice` prop

type InvoiceFormData = {
  invoice_id: string;
  // party refs
  seller_id: string;
  seller_name: string;
  seller_phone: string;
  seller_email: string;
  buyer_id: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_email: string;
  // property refs
  property_id: string;
  property_address: string;
  property_details: {
    type: string;
    area: string;
    floor: string;
    facing: string;
  };
  // amounts
  deal_value: number;
  brokerage_percentage: number;
  brokerage_amount: number;
  gst_applicable: boolean;
  gst_percentage: number;
  gst_amount: number;
  total_amount: number;
  amount_in_words: string;
  // dates
  date: string;
  due_date: string;
  // payment (JSON ONLY)
  payment_details: {
    bank_name: string;
    account_number: string;
    ifsc_code: string;
    account_holder: string;
  };
  // misc
  related_party: 'seller' | 'buyer' | 'both';
  notes: string;
  created_by: string | number | undefined;
  updated_by: string | number | undefined;
};

const InvoiceFormModal = ({
  isOpen,
  onClose,
  invoice,
  onSave,
  userRole
}: any) => {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [sellerProperties, setSellerProperties] = useState<PropertyMini[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { user } = useAuth();

  const [formData, setFormData] = useState<InvoiceFormData>({
    invoice_id: '',
    seller_id: '',
    seller_name: '',
    seller_phone: '',
    seller_email: '',
    buyer_id: '',
    buyer_name: '',
    buyer_phone: '',
    buyer_email: '',
    property_id: '',
    property_address: '',
    property_details: {
      type: '',
      area: '',
      floor: '',
      facing: ''
    },
    deal_value: 0,
    brokerage_percentage: 2,
    brokerage_amount: 0,
    gst_applicable: true,
    gst_percentage: 18,
    gst_amount: 0,
    total_amount: 0,
    amount_in_words: '',
    date: new Date().toISOString().split('T')[0],
    due_date: '',
    payment_details: {
      bank_name: 'HDFC Bank',
      account_number: '50100123456789',
      ifsc_code: 'HDFC0001234',
      account_holder: 'ResaleExpert Pvt Ltd'
    },
    related_party: 'seller',
    notes: '',
    created_by: '',
    updated_by: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // guards
  const fetchedOnceRef = useRef(false);
  const submitGuardRef = useRef(false);

  // helpers
  const convertToWords = (num: number): string => {
    const n = Math.round(num);
    if (n === 0) return 'Zero Only';
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const twoDigits = (x: number) => {
      if (x < 20) return ones[x];
      const t = Math.floor(x / 10), o = x % 10;
      return `${tens[t]}${o ? ' ' + ones[o] : ''}`.trim();
    };
    const threeDigits = (x: number) => {
      const h = Math.floor(x / 100), r = x % 100;
      let s = '';
      if (h) s += `${ones[h]} Hundred`;
      if (r) s += `${s ? ' ' : ''}${twoDigits(r)}`;
      return s.trim();
    };
    const parts: string[] = [];
    let x = n;
    const crores = Math.floor(x / 10000000); x %= 10000000;
    const lakhs = Math.floor(x / 100000); x %= 100000;
    const thousands = Math.floor(x / 1000); x %= 1000;
    const hundreds = x;

    if (crores) parts.push(`${twoDigits(crores)} Crore`);
    if (lakhs) parts.push(`${twoDigits(lakhs)} Lakh`);
    if (thousands) parts.push(`${twoDigits(thousands)} Thousand`);
    if (hundreds) parts.push(threeDigits(hundreds));

    return `${parts.join(' ')} Only`.replace(/\s+/g, ' ').trim();
  };

  const setFD = (patch: Partial<InvoiceFormData>) =>
    setFormData(prev => ({ ...prev, ...patch }));

  // numbers
  const handleNumberInput = (field: keyof InvoiceFormData | string, value: string) => {
    const clean = value.trim();
    const isPercent = String(field).includes('percentage') || String(field).includes('gst_percentage');
    const normalized = clean === '' ? '0' : clean.replace(/^0+(?=\d)/, '');
    const parsed = isPercent ? parseFloat(normalized) : parseInt(normalized, 10);
    setFD({ [field]: (isNaN(parsed) ? 0 : parsed) } as any);
  };

  // data load
  useEffect(() => {
    if (!isOpen) return;
    if (fetchedOnceRef.current) return;
    fetchedOnceRef.current = true;

    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [sellersData, buyersData] = await Promise.all([
          sellerAPI.getAll(),
          buyerAPI.getAll()
        ]);
        setSellers(Array.isArray(sellersData) ? sellersData : []);
        setBuyers(Array.isArray(buyersData) ? buyersData : []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      fetchedOnceRef.current = false;
    }
  }, [isOpen]);

  // init from invoice or new
  useEffect(() => {
    if (!isOpen) return;

    if (invoice) {
      const pd = invoice.property_details || {
        type: invoice.property_type || '',
        area: invoice.property_area || '',
        floor: invoice.property_floor || '',
        facing: invoice.property_facing || ''
      };

      const pay = invoice.payment_details || {
        bank_name: invoice.payment_bank_name || 'HDFC Bank',
        account_number: invoice.payment_account_number || '50100123456789',
        ifsc_code: invoice.payment_ifsc_code || 'HDFC0001234',
        account_holder: invoice.payment_account_holder || 'ResaleExpert Pvt Ltd'
      };

      setFormData(prev => ({
        ...prev,
        invoice_id: invoice.invoice_id || prev.invoice_id || `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
        seller_id: invoice.seller_id != null ? String(invoice.seller_id) : '',
        seller_name: invoice.seller_name || '',
        seller_phone: invoice.seller_phone || '',
        seller_email: invoice.seller_email || '',
        buyer_id: invoice.buyer_id != null ? String(invoice.buyer_id) : '',
        buyer_name: invoice.buyer_name || '',
        buyer_phone: invoice.buyer_phone || '',
        buyer_email: invoice.buyer_email || '',
        property_id: invoice.property_id != null ? String(invoice.property_id) : '',
        property_address: invoice.property_address || '',
        property_details: {
          type: pd.type || '',
          area: pd.area || '',
          floor: pd.floor || '',
          facing: pd.facing || ''
        },
        deal_value: Number(invoice.deal_value) || 0,
        brokerage_percentage: Number(invoice.brokerage_percentage) || 0,
        brokerage_amount: Number(invoice.brokerage_amount) || 0,
        gst_applicable: typeof invoice.gst_applicable === 'boolean' ? invoice.gst_applicable : true,
        gst_percentage: Number(invoice.gst_percentage) || 0,
        gst_amount: Number(invoice.gst_amount) || 0,
        total_amount: Number(invoice.total_amount) || 0,
        amount_in_words: invoice.amount_in_words || '',
        date: invoice.date || new Date().toISOString().split('T')[0],
        due_date: invoice.due_date || '',
        payment_details: {
          bank_name: pay.bank_name || 'HDFC Bank',
          account_number: pay.account_number || '50100123456789',
          ifsc_code: pay.ifsc_code || 'HDFC0001234',
          account_holder: pay.account_holder || 'ResaleExpert Pvt Ltd'
        },
        related_party: invoice.related_party || 'seller',
        notes: invoice.notes || '',
        created_by: invoice.created_by ?? (user?.id ?? ''),
        updated_by: user?.id ?? invoice.updated_by ?? ''
      }));
    } else {
      const newInvoiceId = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      setFormData(prev => ({
        ...prev,
        invoice_id: newInvoiceId,
        created_by: user?.id ?? '',
        updated_by: user?.id ?? ''
      }));
    }
  }, [invoice, isOpen, user?.id]);

  // sync sellerProperties when seller changes
  useEffect(() => {
    if (!formData.seller_id || sellers.length === 0) {
      setSellerProperties([]);
      return;
    }
    const selectedSeller = sellers.find(s => String(s.id) === String(formData.seller_id));
    setSellerProperties(Array.isArray(selectedSeller?.properties) ? selectedSeller!.properties : []);
  }, [formData.seller_id, sellers]);

  // totals calculation (single source of truth)
  useEffect(() => {
    const dv = Number(formData.deal_value) || 0;
    const bp = Number(formData.brokerage_percentage) || 0;
    const gp = Number(formData.gst_percentage) || 0;

    const brokerage = Math.round((dv * bp) / 100);
    const gst = formData.gst_applicable ? Math.round((brokerage * gp) / 100) : 0;
    const total = Math.round(brokerage + gst);
    const words = convertToWords(total);

    if (
      brokerage !== formData.brokerage_amount ||
      gst !== formData.gst_amount ||
      total !== formData.total_amount ||
      words !== formData.amount_in_words
    ) {
      setFD({
        brokerage_amount: brokerage,
        gst_amount: gst,
        total_amount: total,
        amount_in_words: words
      });
    }
  }, [
    formData.deal_value,
    formData.brokerage_percentage,
    formData.gst_applicable,
    formData.gst_percentage
  ]);

  // auto due date (15 days)
  useEffect(() => {
    if (formData.date && !formData.due_date) {
      const dueDate = new Date(formData.date);
      dueDate.setDate(dueDate.getDate() + 15);
      const iso = dueDate.toISOString().split('T')[0];
      if (iso !== formData.due_date) {
        setFD({ due_date: iso });
      }
    }
  }, [formData.date, formData.due_date]);

  // handlers
  const handleSellerChange = (sellerId: string) => {
    if (!sellerId) {
      setFD({
        seller_id: '',
        seller_name: '',
        seller_phone: '',
        seller_email: '',
        property_id: '',
        property_address: '',
        property_details: { type: '', area: '', floor: '', facing: '' }
      });
      setSellerProperties([]);
      return;
    }
    const selectedSeller = sellers.find(s => String(s.id) === String(sellerId));
    if (selectedSeller) {
      const sellerName = `${selectedSeller.salutation || ''} ${selectedSeller.name || ''}`.trim();
      setFD({
        seller_id: sellerId,
        seller_name: sellerName,
        seller_phone: selectedSeller.phone || '',
        seller_email: selectedSeller.email || '',
        // reset property when seller changes
        property_id: '',
        property_address: '',
        property_details: { type: '', area: '', floor: '', facing: '' }
      });
      setSellerProperties(Array.isArray(selectedSeller.properties) ? selectedSeller.properties : []);
    } else {
      setFD({
        seller_id: '',
        seller_name: '',
        seller_phone: '',
        seller_email: ''
      });
      setSellerProperties([]);
    }
  };

  const handleBuyerChange = (buyerId: string) => {
    if (!buyerId) {
      setFD({
        buyer_id: '',
        buyer_name: '',
        buyer_phone: '',
        buyer_email: ''
      });
      return;
    }
    const selectedBuyer = buyers.find(b => String(b.id) === String(buyerId));
    if (selectedBuyer) {
      const buyerName = `${selectedBuyer.salutation || ''} ${selectedBuyer.name || ''}`.trim();
      setFD({
        buyer_id: buyerId,
        buyer_name: buyerName,
        buyer_phone: selectedBuyer.phone || '',
        buyer_email: selectedBuyer.email || ''
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

  const handleSave = async () => {
    if (submitGuardRef.current) return;

    // validations
    if (!formData.seller_name.trim()) {
      alert('Please select a seller');
      return;
    }
    if (!formData.buyer_name.trim()) {
      alert('Please select a buyer');
      return;
    }
    if (!formData.property_address.trim()) {
      alert('Please select a property');
      return;
    }
    if (!formData.deal_value || formData.deal_value <= 0) {
      alert('Please enter valid deal value');
      return;
    }

    submitGuardRef.current = true;
    setIsSubmitting(true);
    try {
      const nowIso = new Date().toISOString();

      // --- IMPORTANT: SAVE ONLY JSON (no flattened duplicates) ---
      const invoiceData = {
        invoice_id: formData.invoice_id,
        type: 'brokerage_invoice',
        // parties
        seller_id: formData.seller_id,
        seller_name: formData.seller_name,
        seller_phone: formData.seller_phone,
        seller_email: formData.seller_email,
        buyer_id: formData.buyer_id,
        buyer_name: formData.buyer_name,
        buyer_phone: formData.buyer_phone,
        buyer_email: formData.buyer_email,
        // property
        property_id: formData.property_id,
        property_address: formData.property_address,
        property_details: { ...formData.property_details }, // JSON kept
        // money
        deal_value: formData.deal_value,
        brokerage_percentage: formData.brokerage_percentage,
        brokerage_amount: formData.brokerage_amount,
        gst_applicable: formData.gst_applicable,
        gst_percentage: formData.gst_percentage,
        gst_amount: formData.gst_amount,
        total_amount: formData.total_amount,
        amount_in_words: formData.amount_in_words,
        // dates
        date: formData.date,
        due_date: formData.due_date,
        // payment JSON ONLY
        payment_details: { ...formData.payment_details },
        // misc
        related_party: formData.related_party,
        notes: formData.notes,
        created_at: invoice?.created_at || nowIso,
        updated_at: nowIso,
        created_by: invoice?.created_by ?? formData.created_by,
        updated_by: user?.id ?? formData.updated_by,
        // default first ledger entry
        ledger_entries: invoice?.ledger_entries || [
          {
            type: 'debit',
            amount: formData.total_amount,
            description: 'Brokerage invoice raised',
            date: formData.date,
            balance: formData.total_amount
          }
        ]
      };

      await onSave(invoiceData);
     
    } catch (error) {
    
    } finally {
      setIsSubmitting(false);
      submitGuardRef.current = false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-2 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FileText className="text-purple-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {invoice ? 'Edit Brokerage Invoice' : 'Create Brokerage Invoice'}
                </h2>
                <p className="text-gray-600 mt-1 text-xs">Commission invoice with GST calculation</p>
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
                {/* Invoice Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="mr-2" size={20} />
                    Invoice Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Invoice ID</label>
                      <input
                        type="text"
                        value={formData.invoice_id}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Related Party</label>
                      <select
                        value={formData.related_party}
                        onChange={(e) => setFD({ related_party: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="seller">Seller</option>
                        <option value="buyer">Buyer</option>
                        <option value="both">Both Parties</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFD({ date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                      <input
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFD({ due_date: e.target.value })}
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
                          required
                        >
                          <option value="">-- Select Seller --</option>
                          {sellers.length > 0
                            ? sellers.map((seller) => (
                                <option key={seller.id} value={String(seller.id)}>
                                  {seller.salutation} {seller.name}
                                </option>
                              ))
                            : <option disabled>No sellers available</option>}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Seller ID</label>
                        <input
                          type="text"
                          value={formData.seller_id}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                          readOnly
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Seller Email</label>
                        <input
                          type="email"
                          value={formData.seller_email}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          readOnly
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
                          required
                        >
                          <option value="">-- Select Buyer --</option>
                          {buyers.length > 0
                            ? buyers.map((buyer) => (
                                <option key={buyer.id} value={String(buyer.id)}>
                                  {buyer.salutation} {buyer.name}
                                </option>
                              ))
                            : <option disabled>No buyers available</option>}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Buyer ID</label>
                        <input
                          type="text"
                          value={formData.buyer_id}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                          readOnly
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Email</label>
                        <input
                          type="email"
                          value={formData.buyer_email}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          readOnly
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
                          disabled={!formData.seller_id || sellerProperties.length === 0}
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                          readOnly
                          placeholder="Auto"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Property Address</label>
                      <textarea
                        value={formData.property_address}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        rows={2}
                        readOnly
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                        <input
                          type="text"
                          value={formData.property_details.type}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Area (Sq fit)</label>
                        <input
                          type="text"
                          value={formData.property_details.area}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                        <input
                          type="text"
                          value={formData.property_details.floor}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          readOnly
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Facing</label>
                        <input
                          type="text"
                          value={formData.property_details.facing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Financial */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calculator className="mr-2" size={20} />
                    Financial Calculation
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Deal Value (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.deal_value || ''}
                        onChange={(e) => handleNumberInput('deal_value', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="25000000"
                        min="0"
                        step="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Brokerage Percentage (%) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.brokerage_percentage || ''}
                        onChange={(e) => handleNumberInput('brokerage_percentage', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        step="0.1"
                        min="0"
                        max="10"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brokerage Amount (₹)</label>
                      <input
                        type="text"
                        value={`₹${formData.brokerage_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold"
                        readOnly
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.gst_applicable}
                        onChange={(e) => setFD({ gst_applicable: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label className="text-sm font-medium text-gray-700">GST Applicable</label>
                    </div>

                    {formData.gst_applicable && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">GST Percentage (%)</label>
                          <input
                            type="number"
                            value={formData.gst_percentage || ''}
                            onChange={(e) => handleNumberInput('gst_percentage', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            step="0.1"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">GST Amount (₹)</label>
                          <input
                            type="text"
                            value={`₹${formData.gst_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold"
                            readOnly
                          />
                        </div>
                      </>
                    )}

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200">
                      <label className="block text-sm font-semibold text-blue-700 mb-2">Total Invoice Amount</label>
                      <div className="text-3xl font-bold text-blue-900 mb-2">
                        ₹{formData.total_amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-blue-700 font-medium leading-relaxed">
                        {formData.amount_in_words}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment JSON */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CreditCard className="mr-2" size={20} />
                    Payment Details
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={formData.payment_details.bank_name}
                        onChange={(e) =>
                          setFD({ payment_details: { ...formData.payment_details, bank_name: e.target.value } })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                      <input
                        type="text"
                        value={formData.payment_details.account_number}
                        onChange={(e) =>
                          setFD({ payment_details: { ...formData.payment_details, account_number: e.target.value } })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                      <input
                        type="text"
                        value={formData.payment_details.ifsc_code}
                        onChange={(e) =>
                          setFD({ payment_details: { ...formData.payment_details, ifsc_code: e.target.value } })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                      <input
                        type="text"
                        value={formData.payment_details.account_holder}
                        onChange={(e) =>
                          setFD({ payment_details: { ...formData.payment_details, account_holder: e.target.value } })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFD({ notes: e.target.value })}
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
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {userRole === 'manager' ? 'Invoice will require admin approval' : 'Invoice will be created immediately'}
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
                  !formData.deal_value
                }
                className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                <span>{isSubmitting ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceFormModal;
