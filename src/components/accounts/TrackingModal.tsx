import React from 'react';
import { X, Clock, Check, Send, MessageCircle, Mail, Phone, User, AlertCircle, Eye } from 'lucide-react';

const TrackingModal = ({ isOpen, onClose, item, type }: any) => {
  if (!isOpen || !item) return null;

  // Sample tracking data - in real app, this would come from backend
  const trackingHistory = [
    {
      id: 1,
      action: 'Created',
      timestamp: '2025-01-12T10:30:00Z',
      user: 'Admin User',
      details: `${type === 'invoice' ? 'Invoice' : 'Receipt'} created with ID ${item.invoice_id || item.receipt_id}`,
      status: 'completed',
      icon: Check
    },
    {
      id: 2,
      action: 'Shared via WhatsApp',
      timestamp: '2025-01-12T11:15:00Z',
      user: 'Admin User',
      details: `Sent to ${item.client_name} (+91 98765 43210)`,
      status: 'completed',
      icon: MessageCircle,
      recipients: [{ name: item.client_name, contact: '+91 98765 43210', status: 'delivered' }]
    },
    {
      id: 3,
      action: 'Shared via Email',
      timestamp: '2025-01-12T11:16:00Z',
      user: 'Admin User',
      details: `Sent to ${item.client_email || 'client@email.com'}`,
      status: 'completed',
      icon: Mail,
      recipients: [{ name: item.client_name, contact: item.client_email || 'client@email.com', status: 'opened' }]
    },
    {
      id: 4,
      action: 'Viewed by Client',
      timestamp: '2025-01-12T14:22:00Z',
      user: item.client_name,
      details: 'Document opened and viewed',
      status: 'completed',
      icon: Eye
    },
    {
      id: 5,
      action: 'Payment Received',
      timestamp: type === 'invoice' ? '2025-01-12T16:45:00Z' : null,
      user: 'System',
      details: type === 'invoice' ? 'Payment confirmed and invoice marked as paid' : null,
      status: type === 'invoice' ? 'completed' : 'pending',
      icon: Check
    }
  ].filter(item => item.details); // Filter out null entries

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="text-green-500" size={16} />;
      case 'pending': return <Clock className="text-orange-500" size={16} />;
      case 'failed': return <AlertCircle className="text-red-500" size={16} />;
      default: return <Clock className="text-gray-400" size={16} />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'delivered': { bg: 'bg-green-100', text: 'text-green-800', label: 'Delivered' },
      'opened': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Opened' },
      'pending': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Pending' },
      'failed': { bg: 'bg-red-100', text: 'text-red-800', label: 'Failed' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Tracking History</h2>
              <p className="text-gray-600 mt-1">{item.invoice_id || item.receipt_id} - {item.client_name}</p>
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
            <h3 className="font-semibold text-gray-900 mb-3">Document Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Amount:</span>
                <span className="font-semibold ml-2">₹{(item.total_amount || item.amount)?.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-gray-500">Date:</span>
                <span className="font-semibold ml-2">{item.date}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="ml-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'paid' ? 'bg-green-100 text-green-800' :
                    item.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {item.status === 'paid' ? 'Paid' : item.status === 'sent' ? 'Sent' : 'Pending'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-4">Activity Timeline</h3>
            
            {trackingHistory.map((entry, index) => {
              const Icon = entry.icon;
              return (
                <div key={entry.id} className="relative">
                  {/* Timeline line */}
                  {index < trackingHistory.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                  )}
                  
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-full ${
                      entry.status === 'completed' ? 'bg-green-100' :
                      entry.status === 'pending' ? 'bg-orange-100' :
                      'bg-red-100'
                    }`}>
                      <Icon className={
                        entry.status === 'completed' ? 'text-green-600' :
                        entry.status === 'pending' ? 'text-orange-600' :
                        'text-red-600'
                      } size={20} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{entry.action}</h4>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(entry.status)}
                          <span className="text-sm text-gray-500">{formatTimestamp(entry.timestamp)}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2">{entry.details}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">by {entry.user}</span>
                        {entry.recipients && (
                          <div className="flex items-center space-x-2">
                            {entry.recipients.map((recipient, idx) => (
                              <div key={idx} className="flex items-center space-x-1">
                                <span className="text-xs text-gray-600">{recipient.contact}</span>
                                {getStatusBadge(recipient.status)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sharing Statistics */}
          <div className="mt-8 bg-blue-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Sharing Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">3</div>
                <div className="text-sm text-gray-600">Times Shared</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">2</div>
                <div className="text-sm text-gray-600">Channels Used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">1</div>
                <div className="text-sm text-gray-600">Times Viewed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Last updated: {formatTimestamp(trackingHistory[0]?.timestamp)}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingModal;