import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Calculator, 
  User, 
  Building, 
  CreditCard, 
  FileText, 
  Percent,
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
  Shield
} from 'lucide-react';

const InvoiceFormModal = ({ isOpen, onClose, invoice, onSave, userRole }: any) => {
  const [formData, setFormData] = useState({
    invoice_id: '',
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
    brokerage_amount: 0,
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
    gst_applicable: true
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (invoice) {
      setFormData({
        ...invoice,
        date: invoice.date || new Date().toISOString().split('T')[0],
        due_date: invoice.due_date || '',
        property_details: invoice.property_details || {
          type: '',
          area: '',
          floor: '',
          facing: ''
        },
        payment_details: invoice.payment_details || {
          bank_name: 'HDFC Bank',
          account_number: '50100123456789',
          ifsc_code: 'HDFC0001234',
          account_holder: 'ResaleExpert Pvt Ltd'
        }
      });
    } else {
      // Generate new invoice ID
      const newInvoiceId = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
      setFormData(prev => ({ ...prev, invoice_id: newInvoiceId }));
    }
  }, [invoice]);

  // Auto-calculate amounts when deal value or percentage changes
  useEffect(() => {
    if (formData.deal_value && formData.brokerage_percentage) {
      const brokerageAmount = (formData.deal_value * formData.brokerage_percentage) / 100;
      const gstAmount = formData.gst_applicable ? (brokerageAmount * formData.gst_percentage) / 100 : 0;
      const totalAmount = brokerageAmount + gstAmount;
      
      setFormData(prev => ({
        ...prev,
        brokerage_amount: brokerageAmount,
        gst_amount: gstAmount,
        total_amount: totalAmount,
        amount_in_words: convertToWords(totalAmount)
      }));
    }
  }, [formData.deal_value, formData.brokerage_percentage, formData.gst_applicable, formData.gst_percentage]);

  // Auto-set due date (15 days from invoice date)
  useEffect(() => {
    if (formData.date && !formData.due_date) {
      const dueDate = new Date(formData.date);
      dueDate.setDate(dueDate.getDate() + 15);
      setFormData(prev => ({
        ...prev,
        due_date: dueDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.date]);

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
          ...((prev as any)[parent] || {}),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
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

    if (!formData.deal_value || formData.deal_value <= 0) {
      alert('Please enter valid deal value');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const invoiceData = {
        ...formData,
        type: 'brokerage_invoice',
        created_at: invoice?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
      console.error('Error saving invoice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FileText className="text-purple-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {invoice ? 'Edit Brokerage Invoice' : 'Create Brokerage Invoice'}
                </h2>
                <p className="text-gray-600 mt-1">Commission invoice with GST calculation</p>
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
                      onChange={(e) => handleInputChange('invoice_id', e.target.value)}
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
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => handleInputChange('due_date', e.target.value)}
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                      <input
                        type="text"
                        value={formData.property_details.floor}
                        onChange={(e) => handleInputChange('property_details.floor', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., 4th Floor"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Facing</label>
                      <select
                        value={formData.property_details.facing}
                        onChange={(e) => handleInputChange('property_details.facing', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select facing</option>
                        <option value="North">North</option>
                        <option value="South">South</option>
                        <option value="East">East</option>
                        <option value="West">West</option>
                        <option value="North-East">North-East</option>
                        <option value="North-West">North-West</option>
                        <option value="South-East">South-East</option>
                        <option value="South-West">South-West</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Financial Calculation */}
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
                      type="number"
                      value={formData.deal_value}
                      onChange={(e) => handleInputChange('deal_value', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="25000000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brokerage Percentage (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.brokerage_percentage}
                      onChange={(e) => handleInputChange('brokerage_percentage', Number(e.target.value))}
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
                      type="number"
                      value={formData.brokerage_amount}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      readOnly
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.gst_applicable}
                      onChange={(e) => handleInputChange('gst_applicable', e.target.checked)}
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
                          value={formData.gst_percentage}
                          onChange={(e) => handleInputChange('gst_percentage', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">GST Amount (₹)</label>
                        <input
                          type="number"
                          value={formData.gst_amount}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                          readOnly
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-blue-700 mb-1">Total Amount (₹)</label>
                    <div className="text-2xl font-bold text-blue-900">
                      ₹{formData.total_amount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-sm text-blue-600 mt-1">{formData.amount_in_words}</div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
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
                      onChange={(e) => handleInputChange('payment_details.bank_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={formData.payment_details.account_number}
                      onChange={(e) => handleInputChange('payment_details.account_number', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={formData.payment_details.ifsc_code}
                      onChange={(e) => handleInputChange('payment_details.ifsc_code', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={formData.payment_details.account_holder}
                      onChange={(e) => handleInputChange('payment_details.account_holder', e.target.value)}
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
                disabled={isSubmitting || !formData.seller_name.trim() || !formData.buyer_name.trim() || !formData.property_address.trim() || !formData.deal_value}
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