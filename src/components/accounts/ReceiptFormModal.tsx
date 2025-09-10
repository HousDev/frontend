import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Receipt, 
  User, 
  Building, 
  CreditCard, 
  IndianRupee,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Users,
  Home,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  Banknote,
  Smartphone,
  Building2
} from 'lucide-react';

const ReceiptFormModal = ({ isOpen, onClose, receipt, onSave, userRole }: any) => {
  const [receiptType, setReceiptType] = useState('brokerage_receipt');
  const [formData, setFormData] = useState({
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
    brokerage_percentage: 2,
    payment_type: 'Token Amount',
    amount: 0,
    amount_in_words: '',
    receipt_date: new Date().toISOString().split('T')[0],
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'RTGS',
    payment_reference: '',
    transaction_details: {
      from_account: '',
      to_account: '',
      transaction_id: '',
      bank_charges: 0
    },
    payment_details: {
      bank_name: '',
      account_number: '',
      ifsc_code: '',
      account_holder: ''
    },
    related_party: 'buyer_to_seller',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (receipt) {
      setReceiptType(receipt.type);
      setFormData({
        ...receipt,
        receipt_date: receipt.receipt_date || new Date().toISOString().split('T')[0],
        payment_date: receipt.payment_date || new Date().toISOString().split('T')[0],
        property_details: receipt.property_details || {
          type: '',
          area: '',
          floor: '',
          facing: ''
        },
        transaction_details: receipt.transaction_details || {
          from_account: '',
          to_account: '',
          transaction_id: '',
          bank_charges: 0
        },
        payment_details: receipt.payment_details || {
          bank_name: '',
          account_number: '',
          ifsc_code: '',
          account_holder: ''
        }
      });
    } else {
      // Generate new receipt ID
      const prefix = receiptType === 'brokerage_receipt' ? 'BR' : 'PPR';
      const newReceiptId = `${prefix}-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
      setFormData(prev => ({ ...prev, receipt_id: newReceiptId }));
    }
  }, [receipt, receiptType]);

  // Auto-calculate brokerage amount for brokerage receipts
  useEffect(() => {
    if (receiptType === 'brokerage_receipt' && formData.deal_value && formData.brokerage_percentage) {
      const brokerageAmount = (formData.deal_value * formData.brokerage_percentage) / 100;
      setFormData(prev => ({
        ...prev,
        amount: brokerageAmount,
        amount_in_words: convertToWords(brokerageAmount)
      }));
    }
  }, [formData.deal_value, formData.brokerage_percentage, receiptType]);

  // Auto-convert amount to words
  useEffect(() => {
    if (formData.amount && receiptType === 'property_payment_receipt') {
      setFormData(prev => ({
        ...prev,
        amount_in_words: convertToWords(formData.amount)
      }));
    }
  }, [formData.amount, receiptType]);

  const convertToWords = (amount: number): string => {
    // Simplified number to words conversion
    const crores = Math.floor(amount / 10000000);
    const lakhs = Math.floor((amount % 10000000) / 100000);
    const thousands = Math.floor((amount % 100000) / 1000);
    const hundreds = Math.floor((amount % 1000) / 100);
    const remainder = amount % 100;

    let words = '';
    if (crores > 0) words += `${crores} Crore `;
    if (lakhs > 0) words += `${lakhs} Lakh `;
    if (thousands > 0) words += `${thousands} Thousand `;
    if (hundreds > 0) words += `${hundreds} Hundred `;
    if (remainder > 0) words += `${remainder} `;
    
    return words.trim() + ' Only';
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...((prev[parent as keyof typeof prev] || {}) as object),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleReceiptTypeChange = (type: string) => {
    setReceiptType(type);
    const prefix = type === 'brokerage_receipt' ? 'BR' : 'PPR';
    const newReceiptId = `${prefix}-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
    setFormData(prev => ({ 
      ...prev, 
      receipt_id: newReceiptId,
      related_party: type === 'brokerage_receipt' ? 'buyer' : 'buyer_to_seller'
    }));
  };

  const handleSave = async () => {
    if (!formData.seller_name.trim()) {
      alert('Please enter seller name');
      return;
    }

    if (!formData.buyer_name.trim()) {
      alert('Please enter buyer name');
      return;
    }

    if (!formData.property_address.trim()) {
      alert('Please enter property address');
      return;
    }

    if (!formData.amount || formData.amount <= 0) {
      alert('Please enter valid amount');
      return;
    }

    if (!formData.payment_reference.trim()) {
      alert('Please enter payment reference');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const receiptData = {
        ...formData,
        type: receiptType,
        status: 'paid',
        payment_status: 'paid',
        created_at: receipt?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ledger_entries: receipt?.ledger_entries || [
          { 
            type: 'credit', 
            amount: formData.amount, 
            description: receiptType === 'brokerage_receipt' ? 'Brokerage payment received' : 'Property payment received', 
            date: formData.payment_date, 
            balance: formData.amount 
          }
        ]
      };

      await onSave(receiptData);
    } catch (error) {
      console.error('Error saving receipt:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentTypes = [
    'Token Amount',
    'First Installment',
    'Second Installment',
    'Final Payment',
    'Registration Amount',
    'Stamp Duty',
    'Other'
  ];

  const paymentMethods = [
    { value: 'RTGS', label: 'RTGS', icon: Building2 },
    { value: 'NEFT', label: 'NEFT', icon: Building2 },
    { value: 'IMPS', label: 'IMPS', icon: Smartphone },
    { value: 'UPI', label: 'UPI', icon: Smartphone },
    { value: 'Cheque', label: 'Cheque', icon: Banknote },
    { value: 'Cash', label: 'Cash', icon: IndianRupee },
    { value: 'DD', label: 'Demand Draft', icon: Banknote }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <Receipt className="text-green-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {receipt ? 'Edit Receipt' : 'Create Receipt'}
                </h2>
                <p className="text-gray-600 mt-1">Payment acknowledgment with transaction details</p>
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
          {/* Receipt Type Selection */}
          {!receipt && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Receipt Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleReceiptTypeChange('brokerage_receipt')}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    receiptType === 'brokerage_receipt'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Receipt className="text-green-600" size={24} />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Brokerage Receipt</div>
                      <div className="text-sm text-gray-600">Commission payment received</div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleReceiptTypeChange('property_payment_receipt')}
                  className={`p-4 border-2 rounded-xl transition-all ${
                    receiptType === 'property_payment_receipt'
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <CreditCard className="text-orange-600" size={24} />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Property Payment Receipt</div>
                      <div className="text-sm text-gray-600">Property transaction payment</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Receipt Details */}
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
                      onChange={(e) => handleInputChange('receipt_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                      readOnly
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
                      type="date"
                      value={formData.receipt_date}
                      onChange={(e) => handleInputChange('receipt_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                    <input
                      type="date"
                      value={formData.payment_date}
                      onChange={(e) => handleInputChange('payment_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Seller Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="mr-2" size={20} />
                  Seller Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Seller Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.seller_name}
                      onChange={(e) => handleInputChange('seller_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter seller name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seller Phone</label>
                    <input
                      type="tel"
                      value={formData.seller_phone}
                      onChange={(e) => handleInputChange('seller_phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seller Email</label>
                    <input
                      type="email"
                      value={formData.seller_email}
                      onChange={(e) => handleInputChange('seller_email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="seller@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Buyer Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="mr-2" size={20} />
                  Buyer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Buyer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.buyer_name}
                      onChange={(e) => handleInputChange('buyer_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter buyer name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Phone</label>
                    <input
                      type="tel"
                      value={formData.buyer_phone}
                      onChange={(e) => handleInputChange('buyer_phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Email</label>
                    <input
                      type="email"
                      value={formData.buyer_email}
                      onChange={(e) => handleInputChange('buyer_email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="buyer@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Property Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building className="mr-2" size={20} />
                  Property Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.property_address}
                      onChange={(e) => handleInputChange('property_address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      placeholder="Enter complete property address"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                      <select
                        value={formData.property_details.type}
                        onChange={(e) => handleInputChange('property_details.type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                      <input
                        type="text"
                        value={formData.property_details.area}
                        onChange={(e) => handleInputChange('property_details.area', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 1250 sq ft"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="mr-2" size={20} />
                  Payment Information
                </h3>
                <div className="space-y-4">
                  {receiptType === 'brokerage_receipt' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deal Value (₹)</label>
                        <input
                          type="number"
                          value={formData.deal_value}
                          onChange={(e) => handleInputChange('deal_value', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="25000000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Brokerage Percentage (%)</label>
                        <input
                          type="number"
                          value={formData.brokerage_percentage}
                          onChange={(e) => handleInputChange('brokerage_percentage', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          step="0.1"
                          min="0"
                          max="10"
                        />
                      </div>
                    </>
                  )}
                  
                  {receiptType === 'property_payment_receipt' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                      <select
                        value={formData.payment_type}
                        onChange={(e) => handleInputChange('payment_type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {paymentTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="500000"
                      required
                      readOnly={receiptType === 'brokerage_receipt'}
                    />
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-green-700 mb-1">Amount in Words</label>
                    <div className="text-sm text-green-800 font-medium">{formData.amount_in_words}</div>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Banknote className="mr-2" size={20} />
                  Transaction Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <select
                      value={formData.payment_method}
                      onChange={(e) => handleInputChange('payment_method', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {paymentMethods.map((method) => {
                        const Icon = method.icon;
                        return (
                          <option key={method.value} value={method.value}>
                            {method.label}
                          </option>
                        );
                      })}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Account</label>
                    <input
                      type="text"
                      value={formData.transaction_details.from_account}
                      onChange={(e) => handleInputChange('transaction_details.from_account', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Buyer Name - Bank Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Account</label>
                    <input
                      type="text"
                      value={formData.transaction_details.to_account}
                      onChange={(e) => handleInputChange('transaction_details.to_account', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Seller Name - Bank Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                    <input
                      type="text"
                      value={formData.transaction_details.transaction_id}
                      onChange={(e) => handleInputChange('transaction_details.transaction_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Bank transaction ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Charges (₹)</label>
                    <input
                      type="number"
                      value={formData.transaction_details.bank_charges}
                      onChange={(e) => handleInputChange('transaction_details.bank_charges', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="25"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="mr-2" size={20} />
                  Bank Details
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={formData.payment_details.bank_name}
                      onChange={(e) => handleInputChange('payment_details.bank_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="HDFC Bank"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={formData.payment_details.account_number}
                      onChange={(e) => handleInputChange('payment_details.account_number', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="50100123456789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={formData.payment_details.ifsc_code}
                      onChange={(e) => handleInputChange('payment_details.ifsc_code', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="HDFC0001234"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={formData.payment_details.account_holder}
                      onChange={(e) => handleInputChange('payment_details.account_holder', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Account holder name"
                    />
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
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {userRole === 'manager' ? 'Receipt will require admin approval' : 'Receipt will be created immediately'}
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
                disabled={isSubmitting || !formData.seller_name.trim() || !formData.buyer_name.trim() || !formData.property_address.trim() || !formData.amount}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

export default ReceiptFormModal;