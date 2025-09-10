import React, { useState } from 'react';
import { X, Save, AlertCircle, User, Building, MapPin, CreditCard } from 'lucide-react';

const DocumentEditModal = ({ isOpen, onClose, document, onSave, userRole }: any) => {
  const [formData, setFormData] = useState({
    ...document,
    client_name: document?.client_name || '',
    client_phone: document?.client_phone || '',
    client_email: document?.client_email || '',
    property_address: document?.property_address || '',
    amount: document?.amount || document?.total_amount || 0,
    brokerage_amount: document?.brokerage_amount || 0,
    gst_amount: document?.gst_amount || 0,
    total_amount: document?.total_amount || 0,
    date: document?.date || new Date().toISOString().split('T')[0],
    status: document?.status || 'pending',
    notes: document?.notes || ''
  });

  const [editReason, setEditReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !document) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate GST and total for invoices
      if (field === 'brokerage_amount' && document.type === 'invoice') {
        const brokerageAmount = parseFloat(value) || 0;
        const gstAmount = brokerageAmount * 0.18;
        const totalAmount = brokerageAmount + gstAmount;
        
        updated.gst_amount = gstAmount;
        updated.total_amount = totalAmount;
        updated.amount = totalAmount;
      }
      
      return updated;
    });
  };

  const handleSave = async () => {
    if (userRole === 'manager' && !editReason.trim()) {
      alert('Please provide a reason for editing this document');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const updateData = {
        ...formData,
        edit_reason: editReason,
        edited_by: userRole === 'admin' ? 'Admin User' : 'Manager User',
        edited_at: new Date().toISOString(),
        requires_approval: userRole === 'manager'
      };

      await onSave(updateData);
      onClose();
    } catch (error) {
      console.error('Error updating document:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'invoice': return 'Brokerage Invoice';
      case 'brokerage_receipt': return 'Brokerage Receipt';
      case 'payment_receipt': return 'Payment Receipt';
      default: return 'Document';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit {getDocumentTypeLabel(document.type)}</h2>
              <p className="text-gray-600 mt-1">{document.invoice_id || document.receipt_id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Manager Edit Warning */}
          {userRole === 'manager' && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="text-orange-600" size={20} />
                <div>
                  <h3 className="font-semibold text-orange-800">Manager Edit Request</h3>
                  <p className="text-sm text-orange-700">Your changes will be sent to admin for approval before being applied.</p>
                </div>
              </div>
            </div>
          )}

          {/* Edit Reason (Required for Managers) */}
          {userRole === 'manager' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Edit <span className="text-red-500">*</span>
              </label>
              <textarea
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Please explain why this document needs to be edited..."
                required
              />
            </div>
          )}

          {/* Client Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="mr-2" size={20} />
              Client Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                <input
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => handleInputChange('client_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.client_phone}
                  onChange={(e) => handleInputChange('client_phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => handleInputChange('client_email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Property Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="mr-2" size={20} />
              Property Information
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Address</label>
              <textarea
                value={formData.property_address}
                onChange={(e) => handleInputChange('property_address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="mr-2" size={20} />
              Financial Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {document.type === 'invoice' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brokerage Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.brokerage_amount}
                      onChange={(e) => handleInputChange('brokerage_amount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.gst_amount}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.total_amount}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Additional notes or comments..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {userRole === 'manager' ? 'Changes will require admin approval' : 'Changes will be applied immediately'}
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
                disabled={isSubmitting || (userRole === 'manager' && !editReason.trim())}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                <span>{isSubmitting ? 'Saving...' : userRole === 'manager' ? 'Send for Approval' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditModal;