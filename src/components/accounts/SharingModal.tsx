import React, { useState } from 'react';
import { X, Send, MessageCircle, Mail, Phone, User, Building, Check, Clock, AlertCircle } from 'lucide-react';

const SharingModal = ({ isOpen, onClose, item, type, onShare }: any) => {
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  if (!isOpen || !item) return null;

  // Get the correct field names based on document type
  const getAmount = () => {
    if (type === 'invoice') {
      return item.total_amount || item.amount || 0;
    }
    return item.amount || item.total_amount || 0;
  };

  const getClientName = () => {
    return item.client_name || item.buyer_name || item.from_party || 'N/A';
  };

  const getPropertyAddress = () => {
    return item.property_address || item.property || 'N/A';
  };

  const getDocumentId = () => {
    return item.invoice_id || item.receipt_id || item.id || 'N/A';
  };

  const getDate = () => {
    return item.date || item.created_date || new Date().toLocaleDateString();
  };

  const defaultMessage = type === 'invoice' 
    ? `Dear ${getClientName()},\n\nPlease find attached your brokerage invoice ${getDocumentId()} for the property transaction.\n\nAmount: ₹${getAmount()?.toLocaleString('en-IN')}\nProperty: ${getPropertyAddress()}\n\nThank you for choosing ResaleExpert.\n\nBest regards,\nResaleExpert Team`
    : `Dear ${getClientName()},\n\nThis is to acknowledge the receipt of payment for ${getDocumentId()}.\n\nAmount: ₹${getAmount()?.toLocaleString('en-IN')}\nDate: ${getDate()}\n\nThank you.\n\nBest regards,\nResaleExpert Team`;

  const channels = [
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'green' },
    { id: 'email', label: 'Email', icon: Mail, color: 'blue' },
    { id: 'sms', label: 'SMS', icon: Phone, color: 'purple' }
  ];

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handleShare = async () => {
    if (selectedChannels.length === 0) {
      alert('Please select at least one sharing channel');
      return;
    }

    setIsSharing(true);
    
    try {
      // Simulate sharing process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const shareData = {
        channels: selectedChannels,
        message: customMessage || defaultMessage,
        timestamp: new Date().toISOString(),
        recipients: getRecipients()
      };

      onShare(shareData);
      onClose();
    } catch (error) {
      console.error('Sharing failed:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const getRecipients = () => {
    const recipients = [];
    
    // Add client/buyer contact
    const clientPhone = item.client_phone || item.buyer_phone || item.phone;
    const clientName = getClientName();
    if (clientPhone && clientName !== 'N/A') {
      recipients.push({ type: 'client', contact: clientPhone, name: clientName });
    }
    
    // Add seller contact if available
    if (item.seller_phone && item.seller_name) {
      recipients.push({ type: 'seller', contact: item.seller_phone, name: item.seller_name });
    }
    
    // Add additional contacts if available
    if (item.to_party && item.to_party_phone) {
      recipients.push({ type: 'recipient', contact: item.to_party_phone, name: item.to_party });
    }
    
    return recipients;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Share {type === 'invoice' ? 'Invoice' : 'Receipt'}</h2>
              <p className="text-gray-600 mt-1">{getDocumentId()}</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Amount:</span>
                <span className="font-semibold ml-2">₹{getAmount()?.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-gray-500">Date:</span>
                <span className="font-semibold ml-2">{getDate()}</span>
              </div>
              <div>
                <span className="text-gray-500">Client:</span>
                <span className="font-semibold ml-2">{getClientName()}</span>
              </div>
              <div>
                <span className="text-gray-500">Property:</span>
                <span className="font-semibold ml-2">{getPropertyAddress()}</span>
              </div>
            </div>
          </div>

          {/* Recipients */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Recipients</h3>
            <div className="space-y-2">
              {getRecipients().map((recipient, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {recipient.type === 'client' ? <User size={16} className="text-blue-600" /> : <Building size={16} className="text-blue-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{recipient.name}</p>
                    <p className="text-sm text-gray-600">{recipient.contact}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                    {recipient.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sharing Channels */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Select Sharing Channels</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {channels.map((channel) => {
                const Icon = channel.icon;
                const isSelected = selectedChannels.includes(channel.id);
                return (
                  <button
                    key={channel.id}
                    onClick={() => handleChannelToggle(channel.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? `border-${channel.color}-500 bg-${channel.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon 
                        size={20} 
                        className={isSelected ? `text-${channel.color}-600` : 'text-gray-400'} 
                      />
                      <span className={`font-medium ${isSelected ? `text-${channel.color}-900` : 'text-gray-600'}`}>
                        {channel.label}
                      </span>
                      {isSelected && <Check size={16} className={`text-${channel.color}-600`} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Message */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Message</h3>
            <textarea
              value={customMessage || defaultMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full h-32 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Enter your message..."
            />
            <p className="text-xs text-gray-500 mt-2">
              This message will be sent along with the {type} document
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {selectedChannels.length} channel{selectedChannels.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                disabled={selectedChannels.length === 0 || isSharing}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSharing ? (
                  <>
                    <Clock size={16} className="animate-spin" />
                    <span>Sharing...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Share Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharingModal;