import React, { useState } from 'react';
import { X, Save, AlertCircle, User, Building, MapPin, CreditCard, FileText } from 'lucide-react';

const DocumentEditModal = ({ isOpen, onClose, document, onSave, userRole }: any) => {
  const [formData, setFormData] = useState({
    ...document,
    title: document?.title || '',
    seller_name: document?.data?.seller_name || '',
    seller_phone: document?.data?.seller_phone || '',
    seller_email: document?.data?.seller_email || '',
    buyer_name: document?.data?.buyer_name || '',
    buyer_phone: document?.data?.buyer_phone || '',
    buyer_email: document?.data?.buyer_email || '',
    property_address: document?.data?.property_address || '',
    property_type: document?.data?.property_type || '',
    property_area: document?.data?.property_area || '',
    sale_amount: document?.data?.sale_amount || 0,
    token_amount: document?.data?.token_amount || 0,
    booking_amount: document?.data?.booking_amount || 0,
    sales_executive: document?.data?.sales_executive || '',
    status: document?.status || 'created',
    priority: document?.priority || 'medium',
    notes: document?.notes || ''
  });

  const [editReason, setEditReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !document) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        data: {
          ...document.data,
          seller_name: formData.seller_name,
          seller_phone: formData.seller_phone,
          seller_email: formData.seller_email,
          buyer_name: formData.buyer_name,
          buyer_phone: formData.buyer_phone,
          buyer_email: formData.buyer_email,
          property_address: formData.property_address,
          property_type: formData.property_type,
          property_area: formData.property_area,
          sale_amount: formData.sale_amount,
          token_amount: formData.token_amount,
          booking_amount: formData.booking_amount,
          sales_executive: formData.sales_executive
        },
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit Document</h2>
              <p className="text-gray-600 mt-1">{document.title}</p>
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

          {/* Document Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="mr-2" size={20} />
              Document Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="created">Created</option>
                  <option value="shared">Shared</option>
                  <option value="otp_verified">OTP Verified</option>
                  <option value="e-sign_pending">E-Sign Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sales Executive</label>
                <input
                  type="text"
                  value={formData.sales_executive}
                  onChange={(e) => handleInputChange('sales_executive', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Seller Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="mr-2" size={20} />
              Seller Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seller Name</label>
                <input
                  type="text"
                  value={formData.seller_name}
                  onChange={(e) => handleInputChange('seller_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seller Phone</label>
                <input
                  type="tel"
                  value={formData.seller_phone}
                  onChange={(e) => handleInputChange('seller_phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Seller Email</label>
                <input
                  type="email"
                  value={formData.seller_email}
                  onChange={(e) => handleInputChange('seller_email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Buyer Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="mr-2" size={20} />
              Buyer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Name</label>
                <input
                  type="text"
                  value={formData.buyer_name}
                  onChange={(e) => handleInputChange('buyer_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Phone</label>
                <input
                  type="tel"
                  value={formData.buyer_phone}
                  onChange={(e) => handleInputChange('buyer_phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Email</label>
                <input
                  type="email"
                  value={formData.buyer_email}
                  onChange={(e) => handleInputChange('buyer_email', e.target.value)}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Address</label>
                <textarea
                  value={formData.property_address}
                  onChange={(e) => handleInputChange('property_address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <input
                  type="text"
                  value={formData.property_type}
                  onChange={(e) => handleInputChange('property_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Area (sq ft)</label>
                <input
                  type="number"
                  value={formData.property_area}
                  onChange={(e) => handleInputChange('property_area', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="mr-2" size={20} />
              Financial Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sale Amount (₹)</label>
                <input
                  type="number"
                  value={formData.sale_amount}
                  onChange={(e) => handleInputChange('sale_amount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Token Amount (₹)</label>
                <input
                  type="number"
                  value={formData.token_amount}
                  onChange={(e) => handleInputChange('token_amount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking Amount (₹)</label>
                <input
                  type="number"
                  value={formData.booking_amount}
                  onChange={(e) => handleInputChange('booking_amount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
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