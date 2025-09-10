import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, FileText } from 'lucide-react';

const DocumentDeleteModal = ({ isOpen, onClose, document, onSubmit, userRole }: any) => {
  const [deleteReason, setDeleteReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !document) return null;

  const predefinedReasons = [
    'Wrong client details entered',
    'Incorrect property information',
    'Duplicate document created by mistake',
    'Wrong template used',
    'Document created for wrong transaction',
    'Client requested cancellation',
    'Data entry error',
    'Template variables filled incorrectly',
    'Document no longer needed',
    'Other (specify below)'
  ];

  const handleSubmit = async () => {
    const reason = selectedReason === 'Other (specify below)' ? deleteReason : selectedReason;
    
    if (!reason.trim()) {
      alert('Please select or provide a reason for deletion');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const deleteData = {
        document_id: document.id,
        document_title: document.title,
        reason: reason,
        requested_by: userRole === 'admin' ? 'Admin User' : 'Manager User',
        requested_at: new Date().toISOString(),
        requires_approval: userRole === 'manager',
        status: userRole === 'admin' ? 'approved' : 'pending'
      };

      await onSubmit(deleteData);
      onClose();
    } catch (error) {
      console.error('Error submitting delete request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'completed': { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      'e-sign_pending': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'E-Sign Pending' },
      'otp_verified': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'OTP Verified' },
      'shared': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Shared' },
      'created': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Created' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.created;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'high': { bg: 'bg-red-100', text: 'text-red-700', label: 'High' },
      'medium': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium' },
      'low': { bg: 'bg-green-100', text: 'text-green-700', label: 'Low' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {userRole === 'admin' ? 'Delete Document' : 'Request Document Deletion'}
                </h2>
                <p className="text-gray-600 mt-1">{document.title}</p>
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

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Warning Message */}
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="text-red-600 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-red-800">
                  {userRole === 'admin' ? 'Permanent Deletion Warning' : 'Deletion Request Warning'}
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {userRole === 'admin' 
                    ? 'This action cannot be undone. The document and all its associated data will be permanently deleted.'
                    : 'This will send a deletion request to the admin. The document will remain until approved.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Document Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <FileText className="mr-2" size={16} />
              Document to be Deleted
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Title:</span>
                <span className="font-semibold ml-2">{document.title}</span>
              </div>
              <div>
                <span className="text-gray-500">Template:</span>
                <span className="font-semibold ml-2">{document.template_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">Seller:</span>
                <span className="font-semibold ml-2">{document.data?.seller_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">Buyer:</span>
                <span className="font-semibold ml-2">{document.data?.buyer_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">Created:</span>
                <span className="font-semibold ml-2">{new Date(document.created_at).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="ml-2">{getStatusBadge(document.status)}</span>
              </div>
              <div>
                <span className="text-gray-500">Priority:</span>
                <span className="ml-2">{getPriorityBadge(document.priority)}</span>
              </div>
              <div>
                <span className="text-gray-500">Created By:</span>
                <span className="font-semibold ml-2">{document.created_by}</span>
              </div>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Reason for Deletion <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {predefinedReasons.map((reason, index) => (
                <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Reason Input */}
          {selectedReason === 'Other (specify below)' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please specify the reason
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={3}
                placeholder="Please provide detailed reason for deletion..."
                required
              />
            </div>
          )}

          {/* Manager Request Info */}
          {userRole === 'manager' && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Request Process</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Your deletion request will be sent to the admin</li>
                <li>• The document will remain active until approved</li>
                <li>• You will be notified of the admin's decision</li>
                <li>• Admin can approve or reject the deletion request</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {userRole === 'admin' ? 'Document will be deleted immediately' : 'Request will be sent to admin for approval'}
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
                disabled={isSubmitting || !selectedReason || (selectedReason === 'Other (specify below)' && !deleteReason.trim())}
                className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={16} />
                <span>
                  {isSubmitting ? 'Processing...' : 
                   userRole === 'admin' ? 'Delete Document' : 'Send Delete Request'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDeleteModal;