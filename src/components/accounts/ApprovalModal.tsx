import React, { useState } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, FileText, User, Building, CreditCard, Clock, Shield } from 'lucide-react';

const ApprovalModal = ({ isOpen, onClose, document, onApprove, userRole }: any) => {
  const [approvalReason, setApprovalReason] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !document) return null;

  const handleApprove = async () => {
    if (!approvalReason.trim()) {
      alert('Please provide approval reason');
      return;
    }

    setIsProcessing(true);
    try {
      await onApprove(true);
      // Log approval activity
      console.log('Document approved:', {
        document_id: document.id,
        reason: approvalReason,
        approved_by: 'Admin User',
        approved_at: new Date().toISOString()
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide rejection reason');
      return;
    }

    setIsProcessing(true);
    try {
      await onApprove(false);
      // Log rejection activity
      console.log('Document rejected:', {
        document_id: document.id,
        reason: rejectionReason,
        rejected_by: 'Admin User',
        rejected_at: new Date().toISOString()
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'brokerage_invoice': return 'Brokerage Invoice';
      case 'brokerage_receipt': return 'Brokerage Receipt';
      case 'property_payment_receipt': return 'Property Payment Receipt';
      default: return 'Document';
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Shield className="text-orange-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Document Approval</h2>
                <p className="text-gray-600 mt-1">{document.invoice_id || document.receipt_id} - Pending Admin Review</p>
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

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Document Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <FileText className="mr-2" size={16} />
              Document Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="font-semibold ml-2">{getDocumentTypeLabel(document.type)}</span>
              </div>
              <div>
                <span className="text-gray-500">ID:</span>
                <span className="font-semibold ml-2">{document.invoice_id || document.receipt_id}</span>
              </div>
              <div>
                <span className="text-gray-500">Created By:</span>
                <span className="font-semibold ml-2">{document.created_by}</span>
              </div>
              <div>
                <span className="text-gray-500">Created Date:</span>
                <span className="font-semibold ml-2">{new Date(document.date).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Seller:</span>
                <span className="font-semibold ml-2">{document.seller_name}</span>
              </div>
              <div>
                <span className="text-gray-500">Buyer:</span>
                <span className="font-semibold ml-2">{document.buyer_name}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-gray-500">Property:</span>
                <span className="font-semibold ml-2">{document.property_address}</span>
              </div>
            </div>
          </div>

          {/* Financial Details */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <CreditCard className="mr-2" size={16} />
              Financial Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {document.deal_value && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(document.deal_value)}
                  </div>
                  <div className="text-sm text-gray-600">Deal Value</div>
                </div>
              )}
              {document.brokerage_percentage && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {document.brokerage_percentage}%
                  </div>
                  <div className="text-sm text-gray-600">Brokerage Rate</div>
                </div>
              )}
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(document.total_amount || document.amount)}
                </div>
                <div className="text-sm text-gray-600">Total Amount</div>
              </div>
            </div>
            {document.amount_in_words && (
              <div className="mt-3 text-center text-sm text-gray-600 font-medium">
                {document.amount_in_words}
              </div>
            )}
          </div>

          {/* Approval Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Approve Section */}
            <div className="bg-green-50 rounded-xl p-4">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                <CheckCircle className="mr-2" size={20} />
                Approve Document
              </h3>
              <textarea
                value={approvalReason}
                onChange={(e) => setApprovalReason(e.target.value)}
                className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows={3}
                placeholder="Reason for approval (e.g., All details verified, amounts correct, documentation complete)"
              />
              <button
                onClick={handleApprove}
                disabled={isProcessing || !approvalReason.trim()}
                className="w-full mt-3 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle size={16} />
                <span>{isProcessing ? 'Processing...' : 'Approve Document'}</span>
              </button>
            </div>

            {/* Reject Section */}
            <div className="bg-red-50 rounded-xl p-4">
              <h3 className="font-semibold text-red-800 mb-3 flex items-center">
                <XCircle className="mr-2" size={20} />
                Reject Document
              </h3>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={3}
                placeholder="Reason for rejection (e.g., Incorrect amounts, missing information, invalid data)"
              />
              <button
                onClick={handleReject}
                disabled={isProcessing || !rejectionReason.trim()}
                className="w-full mt-3 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle size={16} />
                <span>{isProcessing ? 'Processing...' : 'Reject Document'}</span>
              </button>
            </div>
          </div>

          {/* Approval Guidelines */}
          <div className="mt-6 bg-yellow-50 rounded-xl p-4">
            <h3 className="font-semibold text-yellow-800 mb-3 flex items-center">
              <AlertTriangle className="mr-2" size={20} />
              Approval Guidelines
            </h3>
            <ul className="text-sm text-yellow-700 space-y-2">
              <li>• Verify all party details (seller, buyer) are correct</li>
              <li>• Check property address and details for accuracy</li>
              <li>• Validate financial calculations and amounts</li>
              <li>• Ensure payment details and references are proper</li>
              <li>• Confirm all required fields are filled</li>
              <li>• Review notes and additional information</li>
            </ul>
          </div>

          {/* Document Notes */}
          {document.notes && (
            <div className="mt-6 bg-blue-50 rounded-xl p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Document Notes</h3>
              <p className="text-sm text-blue-700">{document.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Review carefully before approving or rejecting
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal;