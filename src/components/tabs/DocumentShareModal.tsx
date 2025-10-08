import React, { useState } from 'react';
import { 
  X, 
  Send, 
  MessageCircle, 
  Mail, 
  Phone, 
  User, 
  Users, 
  Check, 
  Clock, 
  AlertCircle,
  Copy,
  Link,
  Globe,
  QrCode,
  Share,
  Download,
  Eye,
  Bell,
  Settings,
  Plus,
  Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';

const DocumentShareModal = ({ isOpen, onClose, document, onShare }: any) => {
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [recipients, setRecipients] = useState<any[]>([]);
  const [newRecipient, setNewRecipient] = useState({ name: '', contact: '', type: 'phone' });
  const [isSharing, setIsSharing] = useState(false);
  const [shareResults, setShareResults] = useState<any[]>([]);

  if (!isOpen || !document) return null;

  // Auto-populate recipients based on document data
  React.useEffect(() => {
    const autoRecipients: any[] = [];
    
    if (document.data.seller_name && document.data.seller_phone) {
      autoRecipients.push({
        id: 'seller_phone',
        name: document.data.seller_name,
        contact: document.data.seller_phone,
        type: 'phone',
        role: 'Seller'
      });
    }
    
    if (document.data.seller_email) {
      autoRecipients.push({
        id: 'seller_email',
        name: document.data.seller_name,
        contact: document.data.seller_email,
        type: 'email',
        role: 'Seller'
      });
    }
    
    if (document.data.buyer_name && document.data.buyer_phone) {
      autoRecipients.push({
        id: 'buyer_phone',
        name: document.data.buyer_name,
        contact: document.data.buyer_phone,
        type: 'phone',
        role: 'Buyer'
      });
    }
    
    if (document.data.buyer_email) {
      autoRecipients.push({
        id: 'buyer_email',
        name: document.data.buyer_name,
        contact: document.data.buyer_email,
        type: 'email',
        role: 'Buyer'
      });
    }
    
    setRecipients(autoRecipients);
  }, [document]);

  const defaultMessage = `Dear ${document.data.seller_name || 'Client'},

Please find attached the ${document.template_name} document for your review.

📄 Document: ${document.title}
🆔 Document ID: ${document.data.document_id}
📅 Date: ${document.data.document_date}

🏠 Property Details:
• Address: ${document.data.property_address}
• Type: ${document.data.property_type}
• Area: ${document.data.property_area} sq ft

${document.data.sale_amount ? `💰 Sale Amount: ₹${document.data.sale_amount.toLocaleString('en-IN')}` : ''}
${document.data.token_amount ? `💳 Token Amount: ₹${document.data.token_amount.toLocaleString('en-IN')}` : ''}
${document.data.booking_amount ? `🏦 Booking Amount: ₹${document.data.booking_amount.toLocaleString('en-IN')}` : ''}

Please review the document and let us know if you have any questions.

Best regards,
${document.data.sales_executive || 'ResaleExpert Team'}

---
ResaleExpert - Your Trusted Real Estate Partner
📞 Contact: +91 99999 99999
🌐 www.resaleexpert.com`;

  const channels = [
    { 
      id: 'whatsapp', 
      label: 'WhatsApp', 
      icon: MessageCircle, 
      color: 'green',
      description: 'Send via WhatsApp with rich formatting'
    },
    { 
      id: 'email', 
      label: 'Email', 
      icon: Mail, 
      color: 'blue',
      description: 'Send detailed email with document attachment'
    },
    { 
      id: 'sms', 
      label: 'SMS', 
      icon: Phone, 
      color: 'purple',
      description: 'Send SMS with document link'
    },
    { 
      id: 'public_link', 
      label: 'Public Link', 
      icon: Globe, 
      color: 'indigo',
      description: 'Generate shareable public link'
    }
  ];

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const addRecipient = () => {
    if (newRecipient.name.trim() && newRecipient.contact.trim()) {
      setRecipients(prev => [...prev, { ...newRecipient, id: Date.now(), role: 'Custom' }]);
      setNewRecipient({ name: '', contact: '', type: 'phone' });
    }
  };

  const removeRecipient = (id: string | number) => {
    setRecipients(prev => prev.filter(r => r.id !== id));
  };

  const generatePublicLink = () => {
    const documentSlug = document.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return `https://resaleexpert.com/document/${document.data.document_id}/${documentSlug}`;
  };

  const handleShare = async () => {
    if (selectedChannels.length === 0) {
      alert('Please select at least one sharing channel');
      return;
    }

    setIsSharing(true);
    setShareResults([]);
    
    try {
      const results: any[] = [];
      
      for (const channel of selectedChannels) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        
        switch (channel) {
          case 'whatsapp': {
            const whatsappRecipients = recipients.filter(r => r.type === 'phone');
            for (const recipient of whatsappRecipients) {
              const whatsappUrl = `https://wa.me/${recipient.contact.replace(/\D/g, '')}?text=${encodeURIComponent(customMessage || defaultMessage)}`;
              window.open(whatsappUrl, '_blank');
              results.push({ 
                channel: 'WhatsApp', 
                recipient: recipient.name, 
                contact: recipient.contact,
                status: 'sent',
                timestamp: new Date().toISOString()
              });
            }
            break;
          }
          case 'email': {
            const emailRecipients = recipients.filter(r => r.type === 'email');
            for (const recipient of emailRecipients) {
              const subject = `${document.template_name} - ${document.data.document_id}`;
              const emailBody = customMessage || defaultMessage;
              const mailtoUrl = `mailto:${recipient.contact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
              window.open(mailtoUrl, '_blank');
              results.push({ 
                channel: 'Email', 
                recipient: recipient.name, 
                contact: recipient.contact,
                status: 'sent',
                timestamp: new Date().toISOString()
              });
            }
            break;
          }
          case 'sms': {
            const smsRecipients = recipients.filter(r => r.type === 'phone');
            for (const recipient of smsRecipients) {
              // SMS would be sent via SMS gateway API
              results.push({ 
                channel: 'SMS', 
                recipient: recipient.name, 
                contact: recipient.contact,
                status: 'sent',
                timestamp: new Date().toISOString()
              });
            }
            break;
          }
          case 'public_link': {
            const publicLink = generatePublicLink();
            navigator.clipboard.writeText(publicLink);
            results.push({ 
              channel: 'Public Link', 
              recipient: 'Link copied to clipboard', 
              contact: publicLink,
              status: 'generated',
              timestamp: new Date().toISOString()
            });
            break;
          }
          default: {
            results.push({ 
              channel, 
              recipient: 'Multiple', 
              contact: '',
              status: 'sent',
              timestamp: new Date().toISOString()
            });
          }
        }
      }
      
      setShareResults(results);
      
      // Call the onShare callback with sharing data
      onShare({
        document_id: document.id,
        channels: selectedChannels,
        recipients: recipients,
        message: customMessage || defaultMessage,
        results: results,
        shared_at: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Sharing failed:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 !mt-0">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <Share className="text-green-600" size={24} />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-xs">Share Document</h2>
                <p className="text-gray-600 mt-1 text-xs">{document.title}</p>
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
            <h3 className="font-semibold text-gray-900 mb-3 text-xs">Document Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-gray-500">Document:</span>
                <span className="font-semibold ml-2 text-xs">{document.data.document_id}</span>
              </div>
              <div>
                <span className="text-gray-500">Template:</span>
                <span className="font-semibold ml-2 text-xs">{document.template_name}</span>
              </div>
              <div>
                <span className="text-gray-500">Seller:</span>
                <span className="font-semibold ml-2 text-xs">{document.data.seller_name}</span>
              </div>
              <div>
                <span className="text-gray-500">Property:</span>
                <span className="font-semibold ml-2 text-xs">{document.data.property_type}</span>
              </div>
            </div>
          </div>

          {/* Sharing Channels */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-xs">Select Sharing Channels</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {channels.map((channel) => {
                const Icon = channel.icon;
                const isSelected = selectedChannels.includes(channel.id);
                return (
                  <button
                    key={channel.id}
                    onClick={() => handleChannelToggle(channel.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? `border-${channel.color}-500 bg-${channel.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Icon 
                        size={20} 
                        className={isSelected ? `text-${channel.color}-600` : 'text-gray-400'} 
                      />
                      <span className={`font-medium text-xs ${isSelected ? `text-${channel.color}-900` : 'text-gray-600'}`}>
                        {channel.label}
                      </span>
                      {isSelected && <Check size={16} className={`text-${channel.color}-600`} />}
                    </div>
                    <p className="text-xs text-gray-500">{channel.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recipients */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-xs">Recipients</h3>
            
            {/* Add Custom Recipient */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-3 text-xs">Add Custom Recipient</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={newRecipient.name}
                  onChange={(e) => setNewRecipient({...newRecipient, name: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                  placeholder="Recipient name"
                />
                <input
                  type="text"
                  value={newRecipient.contact}
                  onChange={(e) => setNewRecipient({...newRecipient, contact: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                  placeholder="Phone/Email"
                />
                <select
                  value={newRecipient.type}
                  onChange={(e) => setNewRecipient({...newRecipient, type: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                >
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                </select>
                <button
                  onClick={addRecipient}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Recipients List */}
            <div className="space-y-2">
              {recipients.map((recipient) => (
                <div key={recipient.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {recipient.type === 'email' ? 
                        <Mail size={16} className="text-blue-600" /> : 
                        <Phone size={16} className="text-blue-600" />
                      }
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-xs">{recipient.name}</div>
                      <div className="text-xs text-gray-600">{recipient.contact}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {recipient.role}
                    </span>
                    <button
                      onClick={() => removeRecipient(recipient.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Message */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-xs">Message</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCustomMessage(defaultMessage)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                >
                  Use Default Message
                </button>
                <button
                  onClick={() => copyToClipboard(customMessage || defaultMessage)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
                >
                  <Copy size={12} className="inline mr-1" />
                  Copy Message
                </button>
                <button
                  onClick={() => copyToClipboard(generatePublicLink())}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 transition-colors"
                >
                  <Link size={12} className="inline mr-1" />
                  Copy Link
                </button>
              </div>
              <textarea
                value={customMessage || defaultMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-xs"
                placeholder="Enter your custom message..."
              />
              <p className="text-xs text-gray-500">
                This message will be sent along with the document link/attachment
              </p>
            </div>
          </div>

          {/* Share Results */}
          {shareResults.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-xs">Sharing Results</h3>
              <div className="space-y-2">
                {shareResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Check className="text-green-600" size={16} />
                      <span className="text-xs font-medium text-green-800">
                        {result.channel} - {result.recipient}
                      </span>
                      {result.contact && (
                        <span className="text-xs text-green-600">({result.contact})</span>
                      )}
                    </div>
                    <span className="text-xs text-green-600 uppercase font-medium">
                      {result.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-blue-50 rounded-xl py-2 px-4">
            <h4 className="font-semibold text-blue-900 mb-3 text-xs">Quick Actions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  const publicLink = generatePublicLink();
                  copyToClipboard(publicLink);
                }}
                className="flex items-center space-x-2 p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Link className="text-blue-600" size={16} />
                <span className="text-blue-800 font-medium text-xs">Copy Public Link</span>
              </button>
              <button
                onClick={() => {
                  const qrWindow = window.open('', '_blank');
                  if (qrWindow) {
                    qrWindow.document.write(`
                      <html>
                        <head><title>QR Code - ${document.title}</title></head>
                        <body style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
                          <h2 style="font-size:12px;margin:0 0 8px 0">${document.title}</h2>
                          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generatePublicLink())}" alt="QR Code" style="margin: 12px;">
                          <p style="font-size: 12px; color: #666;">Scan to view document</p>
                          <p style="font-size: 10px; color: #666;">${generatePublicLink()}</p>
                        </body>
                      </html>
                    `);
                  }
                }}
                className="flex items-center space-x-2 p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <QrCode className="text-blue-600" size={16} />
                <span className="text-blue-800 font-medium text-xs">Generate QR Code</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {selectedChannels.length} channel{selectedChannels.length !== 1 ? 's' : ''} selected • {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                disabled={selectedChannels.length === 0 || recipients.length === 0 || isSharing}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
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

export default DocumentShareModal;
