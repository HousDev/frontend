// import React, { useState } from 'react';
// import { 
//   X, 
//   Share, 
//   MessageCircle, 
//   Mail, 
//   Phone, 
//   Globe, 
//   QrCode, 
//   Copy, 
//   Send,
//   User,
//   Users,
//   Building,
//   MapPin,
//   DollarSign,
//   Eye,
//   Download,
//   Link,
//   Facebook,
//   Twitter,
//   Instagram,
//   Linkedin,
//   CheckCircle,
//   Clock,
//   AlertCircle
// } from 'lucide-react';

// const PropertyShareModal = ({ isOpen, onClose, property }: any) => {
//   const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
//   const [customMessage, setCustomMessage] = useState('');
//   const [recipients, setRecipients] = useState<any[]>([]);
//   const [newRecipient, setNewRecipient] = useState({ name: '', contact: '', type: 'phone' });
//   const [isSharing, setIsSharing] = useState(false);
//   const [shareResults, setShareResults] = useState<any[]>([]);

//   if (!isOpen || !property) return null;

//   const formatCurrency = (amount: number) => {
//     if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
//     if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
//     return `₹${amount.toLocaleString('en-IN')}`;
//   };

//   const defaultMessage = `🏠 *${property.title}*

// 📍 *Location:* ${property.location}, ${property.city}
// 🏢 *Type:* ${property.unitType} • ${property.carpetArea} sq ft
// 💰 *Price:* ${formatCurrency(property.budget)}
// 🏗️ *Floor:* ${property.floor} of ${property.totalFloors}
// 🚗 *Parking:* ${property.parkingQty} ${property.parkingType}
// 🛋️ *Furnishing:* ${property.furnishing}

// ✨ *Amenities:*
// ${property.amenities?.slice(0, 5).map((amenity: string) => `• ${amenity}`).join('\n') || '• Premium amenities available'}

// 📞 *Contact:* ${property.seller?.phone}
// 📧 *Email:* ${property.seller?.email}

// *Interested? Contact us for a site visit!*

// ---
// Shared via ResaleExpert
// 🌐 www.resaleexpert.com`;

//   const sharingChannels = [
//     { 
//       id: 'whatsapp', 
//       label: 'WhatsApp', 
//       icon: MessageCircle, 
//       color: 'green',
//       description: 'Share via WhatsApp with rich formatting'
//     },
//     { 
//       id: 'email', 
//       label: 'Email', 
//       icon: Mail, 
//       color: 'blue',
//       description: 'Send detailed email with property information'
//     },
//     { 
//       id: 'sms', 
//       label: 'SMS', 
//       icon: Phone, 
//       color: 'purple',
//       description: 'Send SMS with property summary'
//     },
//     { 
//       id: 'public_link', 
//       label: 'Public Link', 
//       icon: Globe, 
//       color: 'indigo',
//       description: 'Generate shareable public link'
//     },
//     { 
//       id: 'qr_code', 
//       label: 'QR Code', 
//       icon: QrCode, 
//       color: 'gray',
//       description: 'Generate QR code for easy sharing'
//     },
//     { 
//       id: 'social_media', 
//       label: 'Social Media', 
//       icon: Share, 
//       color: 'pink',
//       description: 'Share on social media platforms'
//     }
//   ];

//   const socialPlatforms = [
//     { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'blue' },
//     { id: 'twitter', label: 'Twitter', icon: Twitter, color: 'sky' },
//     { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'pink' },
//     { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'blue' }
//   ];

//   const handleChannelToggle = (channelId: string) => {
//     setSelectedChannels(prev => 
//       prev.includes(channelId) 
//         ? prev.filter(id => id !== channelId)
//         : [...prev, channelId]
//     );
//   };

//   const addRecipient = () => {
//     if (newRecipient.name.trim() && newRecipient.contact.trim()) {
//       setRecipients(prev => [...prev, { ...newRecipient, id: Date.now() }]);
//       setNewRecipient({ name: '', contact: '', type: 'phone' });
//     }
//   };

//   const removeRecipient = (id: number) => {
//     setRecipients(prev => prev.filter(r => r.id !== id));
//   };

//   const generatePublicLink = () => {
//     const propertySlug = property.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
//     return `https://resaleexpert.com/property/${property.propertyId}/${propertySlug}`;
//   };

//   const generateQRCode = () => {
//     const link = generatePublicLink();
//     // In real implementation, you would generate actual QR code
//     return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
//   };

//   const handleShare = async () => {
//     if (selectedChannels.length === 0) {
//       alert('Please select at least one sharing channel');
//       return;
//     }

//     setIsSharing(true);
//     setShareResults([]);

//     try {
//       const results = [];

//       for (const channel of selectedChannels) {
//         await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

//         switch (channel) {
//           case 'whatsapp':
//             if (recipients.length > 0) {
//               for (const recipient of recipients) {
//                 if (recipient.type === 'phone') {
//                   const whatsappUrl = `https://wa.me/${recipient.contact.replace(/\D/g, '')}?text=${encodeURIComponent(customMessage || defaultMessage)}`;
//                   window.open(whatsappUrl, '_blank');
//                   results.push({ channel: 'WhatsApp', recipient: recipient.name, status: 'sent' });
//                 }
//               }
//             }
//             break;

//           case 'email':
//             if (recipients.length > 0) {
//               for (const recipient of recipients) {
//                 if (recipient.type === 'email') {
//                   const subject = `Property Listing - ${property.title}`;
//                   const emailBody = customMessage || defaultMessage;
//                   const mailtoUrl = `mailto:${recipient.contact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
//                   window.open(mailtoUrl, '_blank');
//                   results.push({ channel: 'Email', recipient: recipient.name, status: 'sent' });
//                 }
//               }
//             }
//             break;

//           case 'public_link':
//             const publicLink = generatePublicLink();
//             navigator.clipboard.writeText(publicLink);
//             results.push({ channel: 'Public Link', recipient: 'Copied to clipboard', status: 'generated' });
//             break;

//           case 'qr_code':
//             const qrCodeUrl = generateQRCode();
//             const qrWindow = window.open('', '_blank');
//             if (qrWindow) {
//               qrWindow.document.write(`
//                 <html>
//                   <head><title>QR Code - ${property.title}</title></head>
//                   <body style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
//                     <h2>${property.title}</h2>
//                     <img src="${qrCodeUrl}" alt="QR Code" style="margin: 20px;">
//                     <p>Scan to view property details</p>
//                     <p style="font-size: 12px; color: #666;">${generatePublicLink()}</p>
//                   </body>
//                 </html>
//               `);
//             }
//             results.push({ channel: 'QR Code', recipient: 'Generated', status: 'created' });
//             break;

//           default:
//             results.push({ channel, recipient: 'Multiple', status: 'sent' });
//         }
//       }

//       setShareResults(results);

//       // Auto-close after 3 seconds if successful
//       setTimeout(() => {
//         onClose();
//       }, 3000);

//     } catch (error) {
//       console.error('Sharing failed:', error);
//     } finally {
//       setIsSharing(false);
//     }
//   };

//   const copyToClipboard = (text: string) => {
//     navigator.clipboard.writeText(text);
//     alert('Copied to clipboard!');
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
//         {/* Header */}
//         <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="p-3 bg-purple-100 rounded-xl">
//                 <Share className="text-purple-600" size={24} />
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-900">Share Property</h2>
//                 <p className="text-gray-600 mt-1">{property.title}</p>
//               </div>
//             </div>
//             <button
//               onClick={onClose}
//               className="p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-lg"
//             >
//               <X size={20} />
//             </button>
//           </div>
//         </div>

//         <div className="p-6 max-h-[70vh] overflow-y-auto">
//           {/* Property Summary */}
//           <div className="bg-gray-50 rounded-xl p-4 mb-6">
//             <h3 className="font-semibold text-gray-900 mb-3">Property Summary</h3>
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
//               <div>
//                 <span className="text-gray-500">Property:</span>
//                 <span className="font-semibold ml-2">{property.title}</span>
//               </div>
//               <div>
//                 <span className="text-gray-500">Location:</span>
//                 <span className="font-semibold ml-2">{property.location}, {property.city}</span>
//               </div>
//               <div>
//                 <span className="text-gray-500">Type:</span>
//                 <span className="font-semibold ml-2">{property.unitType} • {property.carpetArea} sq ft</span>
//               </div>
//               <div>
//                 <span className="text-gray-500">Price:</span>
//                 <span className="font-semibold ml-2">{formatCurrency(property.budget)}</span>
//               </div>
//             </div>
//           </div>

//           {/* Sharing Channels */}
//           <div className="mb-6">
//             <h3 className="font-semibold text-gray-900 mb-4">Select Sharing Channels</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {sharingChannels.map((channel) => {
//                 const Icon = channel.icon;
//                 const isSelected = selectedChannels.includes(channel.id);
//                 return (
//                   <button
//                     key={channel.id}
//                     onClick={() => handleChannelToggle(channel.id)}
//                     className={`p-4 rounded-xl border-2 transition-all text-left ${
//                       isSelected
//                         ? `border-${channel.color}-500 bg-${channel.color}-50`
//                         : 'border-gray-200 hover:border-gray-300'
//                     }`}
//                   >
//                     <div className="flex items-center space-x-3 mb-2">
//                       <Icon 
//                         size={20} 
//                         className={isSelected ? `text-${channel.color}-600` : 'text-gray-400'} 
//                       />
//                       <span className={`font-medium ${isSelected ? `text-${channel.color}-900` : 'text-gray-600'}`}>
//                         {channel.label}
//                       </span>
//                       {isSelected && <CheckCircle size={16} className={`text-${channel.color}-600`} />}
//                     </div>
//                     <p className="text-xs text-gray-500">{channel.description}</p>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Social Media Platforms */}
//           {selectedChannels.includes('social_media') && (
//             <div className="mb-6">
//               <h3 className="font-semibold text-gray-900 mb-4">Social Media Platforms</h3>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                 {socialPlatforms.map((platform) => {
//                   const Icon = platform.icon;
//                   return (
//                     <button
//                       key={platform.id}
//                       className={`p-3 rounded-lg border border-gray-200 hover:bg-${platform.color}-50 transition-colors`}
//                     >
//                       <div className="flex items-center space-x-2">
//                         <Icon className={`text-${platform.color}-600`} size={16} />
//                         <span className="text-sm font-medium">{platform.label}</span>
//                       </div>
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

//           {/* Recipients */}
//           <div className="mb-6">
//             <h3 className="font-semibold text-gray-900 mb-4">Recipients</h3>

//             {/* Add Recipient */}
//             <div className="bg-gray-50 rounded-lg p-4 mb-4">
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
//                 <input
//                   type="text"
//                   value={newRecipient.name}
//                   onChange={(e) => setNewRecipient({...newRecipient, name: e.target.value})}
//                   className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                   placeholder="Recipient name"
//                 />
//                 <input
//                   type="text"
//                   value={newRecipient.contact}
//                   onChange={(e) => setNewRecipient({...newRecipient, contact: e.target.value})}
//                   className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                   placeholder="Phone/Email"
//                 />
//                 <select
//                   value={newRecipient.type}
//                   onChange={(e) => setNewRecipient({...newRecipient, type: e.target.value})}
//                   className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="phone">Phone</option>
//                   <option value="email">Email</option>
//                 </select>
//                 <button
//                   onClick={addRecipient}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   Add
//                 </button>
//               </div>
//             </div>

//             {/* Recipients List */}
//             <div className="space-y-2">
//               {recipients.map((recipient) => (
//                 <div key={recipient.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
//                   <div className="flex items-center space-x-3">
//                     <div className="p-2 bg-blue-100 rounded-lg">
//                       {recipient.type === 'email' ? <Mail size={16} className="text-blue-600" /> : <Phone size={16} className="text-blue-600" />}
//                     </div>
//                     <div>
//                       <div className="font-medium text-gray-900">{recipient.name}</div>
//                       <div className="text-sm text-gray-600">{recipient.contact}</div>
//                     </div>
//                   </div>
//                   <button
//                     onClick={() => removeRecipient(recipient.id)}
//                     className="text-red-600 hover:text-red-800"
//                   >
//                     <X size={16} />
//                   </button>
//                 </div>
//               ))}

//               {recipients.length === 0 && (
//                 <div className="text-center py-4 text-gray-500">
//                   No recipients added. Add recipients to send property details.
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Custom Message */}
//           <div className="mb-6">
//             <h3 className="font-semibold text-gray-900 mb-4">Message</h3>
//             <div className="space-y-3">
//               <div className="flex items-center space-x-2">
//                 <button
//                   onClick={() => setCustomMessage(defaultMessage)}
//                   className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
//                 >
//                   Use Default
//                 </button>
//                 <button
//                   onClick={() => copyToClipboard(customMessage || defaultMessage)}
//                   className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
//                 >
//                   <Copy size={12} className="inline mr-1" />
//                   Copy
//                 </button>
//               </div>
//               <textarea
//                 value={customMessage || defaultMessage}
//                 onChange={(e) => setCustomMessage(e.target.value)}
//                 className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
//                 placeholder="Enter your custom message..."
//               />
//             </div>
//           </div>

//           {/* Quick Actions */}
//           <div className="mb-6">
//             <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <button
//                 onClick={() => copyToClipboard(generatePublicLink())}
//                 className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
//               >
//                 <Link className="text-blue-600" size={20} />
//                 <div className="text-left">
//                   <div className="font-medium text-gray-900">Copy Public Link</div>
//                   <div className="text-sm text-gray-600">Share direct property link</div>
//                 </div>
//               </button>

//               <button
//                 onClick={() => {
//                   const qrWindow = window.open('', '_blank');
//                   if (qrWindow) {
//                     qrWindow.document.write(`
//                       <html>
//                         <head><title>QR Code - ${property.title}</title></head>
//                         <body style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
//                           <h2>${property.title}</h2>
//                           <img src="${generateQRCode()}" alt="QR Code" style="margin: 20px;">
//                           <p>Scan to view property details</p>
//                           <p style="font-size: 12px; color: #666;">${generatePublicLink()}</p>
//                         </body>
//                       </html>
//                     `);
//                   }
//                 }}
//                 className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
//               >
//                 <QrCode className="text-gray-600" size={20} />
//                 <div className="text-left">
//                   <div className="font-medium text-gray-900">Generate QR Code</div>
//                   <div className="text-sm text-gray-600">Create scannable QR code</div>
//                 </div>
//               </button>
//             </div>
//           </div>

//           {/* Share Results */}
//           {shareResults.length > 0 && (
//             <div className="mb-6">
//               <h3 className="font-semibold text-gray-900 mb-4">Sharing Results</h3>
//               <div className="space-y-2">
//                 {shareResults.map((result, index) => (
//                   <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
//                     <div className="flex items-center space-x-2">
//                       <CheckCircle className="text-green-600" size={16} />
//                       <span className="text-sm font-medium text-green-800">
//                         {result.channel} - {result.recipient}
//                       </span>
//                     </div>
//                     <span className="text-xs text-green-600 uppercase font-medium">
//                       {result.status}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="p-6 border-t border-gray-200 bg-gray-50">
//           <div className="flex items-center justify-between">
//             <div className="text-sm text-gray-500">
//               {selectedChannels.length} channel{selectedChannels.length !== 1 ? 's' : ''} selected • {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}
//             </div>
//             <div className="flex items-center space-x-3">
//               <button
//                 onClick={onClose}
//                 className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleShare}
//                 disabled={selectedChannels.length === 0 || isSharing}
//                 className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isSharing ? (
//                   <>
//                     <Clock size={16} className="animate-spin" />
//                     <span>Sharing...</span>
//                   </>
//                 ) : (
//                   <>
//                     <Send size={16} />
//                     <span>Share Now</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PropertyShareModal;


import React, { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import {
  X,
  Share,
  MessageCircle,
  Mail,
  Phone,
  Globe,
  QrCode,
  Copy,
  Send,
  User,
  Users,
  Building,
  MapPin,
  DollarSign,
  Eye,
  Download,
  Link,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

const PropertyShareModal = ({ isOpen, onClose, property, buyer, buyers }: any) => {
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedSocialPlatforms, setSelectedSocialPlatforms] = useState<string[]>(['facebook', 'twitter', 'linkedin', 'telegram']);
  const [customMessage, setCustomMessage] = useState('');
  const [recipients, setRecipients] = useState<any[]>([]);
  const [newRecipient, setNewRecipient] = useState({ name: '', contact: '', type: 'phone' });
  const [isSharing, setIsSharing] = useState(false);
  const [shareResults, setShareResults] = useState<any[]>([]);

  const handleSocialPlatformToggle = (platformId: string) => {
    setSelectedSocialPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  // Auto-fill buyer details (single or multi-selected buyers) when modal opens
  React.useEffect(() => {
    const list = buyers && buyers.length > 0 ? buyers : buyer ? [buyer] : [];
    if (isOpen && list.length > 0) {
      const autoRecipients: any[] = [];
      let idCounter = 1;

      list.forEach((b: any) => {
        if (b.phone) {
          const phone = String(b.phone).replace(/\D/g, '');
          if (phone) {
            autoRecipients.push({ id: idCounter++, name: b.name || 'Buyer', contact: phone, type: 'phone' });
          }
        }

        if (b.email) {
          autoRecipients.push({ id: idCounter++, name: b.name || 'Buyer', contact: b.email, type: 'email' });
        }
      });

      setRecipients(autoRecipients);
      setSelectedChannels([]); // Do NOT pre-select channels, let user choose
    } else if (isOpen && list.length === 0) {
      setRecipients([]);
      setSelectedChannels([]);
    }
  }, [isOpen, buyer, buyers]);

  if (!isOpen || !property) return null;

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const defaultMessage = `🏠 *${property.title}*

📍 *Location:* ${property.location}, ${property.city}
🏢 *Type:* ${property.unitType} • ${property.carpetArea} sq ft
💰 *Price:* ${formatCurrency(property.budget)}
🏗️ *Floor:* ${property.floor} of ${property.totalFloors}
🚗 *Parking:* ${property.parkingQty} ${property.parkingType}
🛋️ *Furnishing:* ${property.furnishing}

✨ *Amenities:*
${property.amenities?.slice(0, 5).map((amenity: string) => `• ${amenity}`).join('\n') || '• Premium amenities available'}

📞 *Contact:* ${property.seller?.phone}
📧 *Email:* ${property.seller?.email}

*Interested? Contact us for a site visit!*

---
Shared via ResaleExpert
🌐 www.resaleexpert.com`;

  const sharingChannels = [
    { id: 'whatsapp', label: 'WhatsApp', icon: FaWhatsapp, color: '#25D366', description: 'Share via WhatsApp' },
    { id: 'email', label: 'Email', icon: Mail, color: '#3b82f6', description: 'Send detailed email' },
    { id: 'sms', label: 'SMS', icon: Phone, color: '#8b5cf6', description: 'Send SMS summary' },
    { id: 'public_link', label: 'Public Link', icon: Globe, color: N, description: 'Generate shareable link' },
    { id: 'qr_code', label: 'QR Code', icon: QrCode, color: MU, description: 'Generate QR code' },
    { id: 'social_media', label: 'Social Media', icon: Share, color: O, description: 'Share on social media' }
  ];

  const socialPlatforms = [
    { id: 'facebook', label: 'Facebook', icon: Facebook, color: '#1877f2' },
    { id: 'twitter', label: 'Twitter / X', icon: Twitter, color: '#1da1f2' },
    { id: 'instagram', label: 'Instagram', icon: Instagram, color: '#e4405f' },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: '#0a66c2' },
    { id: 'telegram', label: 'Telegram', icon: Send, color: '#0088cc' },
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
      setRecipients(prev => [...prev, { ...newRecipient, id: Date.now() }]);
      setNewRecipient({ name: '', contact: '', type: 'phone' });
    }
  };

  const removeRecipient = (id: number) => {
    setRecipients(prev => prev.filter(r => r.id !== id));
  };

  const generatePublicLink = () => {
    const propertySlug = property.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return `https://resaleexpert.com/property/${property.propertyId}/${propertySlug}`;
  };

  const generateQRCode = () => {
    const link = generatePublicLink();
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
  };

  const handleShare = async () => {
    if (selectedChannels.length === 0) {
      toast.error('Please select at least one sharing channel');
      return;
    }

    const message = customMessage || defaultMessage;

    setIsSharing(true);
    setShareResults([]);

    try {
      const results: any[] = [];
      let toastShown = false;

      for (const channel of selectedChannels) {
        await new Promise(resolve => setTimeout(resolve, 300));

        switch (channel) {
          case 'whatsapp': {
            const phoneRecipients = recipients.filter(r => r.type === 'phone' && r.contact);
            if (phoneRecipients.length > 0) {
              for (const r of phoneRecipients) {
                const phone = String(r.contact).replace(/\D/g, '');
                window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                results.push({ channel: 'WhatsApp', recipient: r.name, status: 'sent' });
              }
            } else {
              if (!toastShown) {
                toast.error("Phone / WhatsApp number missing for selected buyer(s)");
                toastShown = true;
              }
              results.push({ channel: 'WhatsApp', recipient: '—', status: 'no phone recipients' });
            }
            break;
          }

          case 'email': {
            const emailRecipients = recipients.filter(r => r.type === 'email' && r.contact);
            if (emailRecipients.length > 0) {
              for (const r of emailRecipients) {
                const subject = `Property Listing – ${property.title || 'Property Details'}`;
                window.open(`mailto:${r.contact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`, '_blank');
                results.push({ channel: 'Email', recipient: r.name, status: 'sent' });
              }
            } else {
              if (!toastShown) {
                toast.error("Email address missing for selected buyer(s)");
                toastShown = true;
              }
              results.push({ channel: 'Email', recipient: '—', status: 'no email recipients' });
            }
            break;
          }

          case 'sms': {
            const phoneRecipients = recipients.filter(r => r.type === 'phone' && r.contact);
            if (phoneRecipients.length > 0) {
              for (const r of phoneRecipients) {
                const phone = String(r.contact).replace(/\D/g, '');
                // Short SMS-friendly message
                const smsText = `Property: ${property.title || ''} | ${property.location || ''} | Price: ${property.budget ? (property.budget >= 100000 ? '₹' + (property.budget / 100000).toFixed(1) + 'L' : '₹' + property.budget) : ''} | Contact us for site visit.`;
                window.open(`sms:${phone}?body=${encodeURIComponent(smsText)}`, '_blank');
                results.push({ channel: 'SMS', recipient: r.name, status: 'sent' });
              }
            } else {
              if (!toastShown) {
                toast.error("Phone number missing for SMS sharing");
                toastShown = true;
              }
              results.push({ channel: 'SMS', recipient: '—', status: 'no phone recipients' });
            }
            break;
          }

          case 'public_link': {
            const publicLink = generatePublicLink();
            navigator.clipboard.writeText(publicLink);
            results.push({ channel: 'Public Link', recipient: 'Copied to clipboard', status: 'generated' });
            break;
          }

          case 'qr_code': {
            const qrCodeUrl = generateQRCode();
            const qrWindow = window.open('', '_blank');
            if (qrWindow) {
              qrWindow.document.write(`<html><head><title>QR Code – ${property.title}</title></head><body style="text-align:center;padding:20px;font-family:Arial,sans-serif;"><h2>${property.title}</h2><img src="${qrCodeUrl}" alt="QR Code" style="margin:20px;"><p>Scan to view property details</p><p style="font-size:12px;color:#666;">${generatePublicLink()}</p></body></html>`);
            }
            results.push({ channel: 'QR Code', recipient: 'Generated', status: 'created' });
            break;
          }

          case 'social_media': {
            const publicLink = generatePublicLink();
            const link = encodeURIComponent(publicLink);
            const titleText = customMessage || `Check out this property: ${property.title || ''} at ${property.location || ''}. Price: ${formatCurrency(property.budget)}`;
            const text = encodeURIComponent(titleText);

            if (selectedSocialPlatforms.length === 0) {
              if (!toastShown) {
                toast.error('Please select at least one social media platform (Facebook, Twitter, LinkedIn, Telegram)');
                toastShown = true;
              }
              results.push({ channel: 'Social Media', recipient: '—', status: 'no platform selected' });
              break;
            }

            for (const platformId of selectedSocialPlatforms) {
              if (platformId === 'facebook') {
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${link}&quote=${text}`, '_blank');
                results.push({ channel: 'Social Media', recipient: 'Facebook', status: 'opened' });
              } else if (platformId === 'twitter') {
                window.open(`https://twitter.com/intent/tweet?url=${link}&text=${text}`, '_blank');
                results.push({ channel: 'Social Media', recipient: 'Twitter / X', status: 'opened' });
              } else if (platformId === 'linkedin') {
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${link}`, '_blank');
                results.push({ channel: 'Social Media', recipient: 'LinkedIn', status: 'opened' });
              } else if (platformId === 'telegram') {
                window.open(`https://t.me/share/url?url=${link}&text=${text}`, '_blank');
                results.push({ channel: 'Social Media', recipient: 'Telegram', status: 'opened' });
              } else if (platformId === 'instagram') {
                try {
                  navigator.clipboard.writeText(`${titleText}\n\nLink: ${publicLink}`);
                  toast.info('Copied caption & link for Instagram! Opening Instagram...');
                } catch { /* ignore */ }
                window.open('https://www.instagram.com/', '_blank');
                results.push({ channel: 'Social Media', recipient: 'Instagram', status: 'copied & opened' });
              }
            }
            break;
          }

          default:
            results.push({ channel, recipient: 'Multiple', status: 'sent' });
        }
      }

      setShareResults(results);
      setTimeout(() => { onClose(); }, 3000);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }}>

        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between" style={{ background: N }}>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg" style={{ background: `${O}20` }}>
              <Share size={16} className="sm:w-5 sm:h-5" style={{ color: O }} />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-bold text-white">Share Property</h2>
              <p className="text-[10px] sm:text-xs text-white/70">{property?.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 sm:p-1.5 rounded hover:bg-white/10 transition-colors text-white">
            <X size={16} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 sm:space-y-6" style={{ scrollbarWidth: 'thin' }}>

          {/* Property Summary */}
          <div className="rounded-lg p-2 sm:p-3" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              <div>
                <p className="text-[9px] sm:text-xs font-medium" style={{ color: O }}>Property</p>
                <p className="text-[11px] sm:text-sm font-semibold truncate" style={{ color: N }}>{property?.title}</p>
              </div>
              <div>
                <p className="text-[9px] sm:text-xs font-medium" style={{ color: O }}>Location</p>
                <p className="text-[11px] sm:text-sm font-semibold truncate" style={{ color: N }}>{property?.location}, {property?.city}</p>
              </div>
              <div>
                <p className="text-[9px] sm:text-xs font-medium" style={{ color: O }}>Type</p>
                <p className="text-[11px] sm:text-sm font-semibold truncate" style={{ color: N }}>{property?.unitType} • {property?.carpetArea} sq ft</p>
              </div>
              <div>
                <p className="text-[9px] sm:text-xs font-medium" style={{ color: O }}>Price</p>
                <p className="text-[11px] sm:text-sm font-semibold truncate" style={{ color: N }}>{formatCurrency(property?.budget)}</p>
              </div>
            </div>
          </div>

          {/* Sharing Channels */}
          <div>
            <h3 className="text-[11px] sm:text-sm font-semibold mb-2 sm:mb-3" style={{ color: N }}>Select Sharing Channels</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {sharingChannels.map((channel) => {
                const Icon = channel.icon;
                const isSelected = selectedChannels.includes(channel.id);
                return (
                  <button
                    key={channel.id}
                    onClick={() => handleChannelToggle(channel.id)}
                    className={`p-2 sm:p-3 rounded-lg border transition-all text-left ${isSelected ? 'ring-1' : ''}`}
                    style={{
                      borderColor: isSelected ? O : BD,
                      background: isSelected ? `${O}08` : BG
                    }}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                      <Icon size={14} className="sm:w-4 sm:h-4" style={{ color: isSelected ? O : channel.color }} />
                      <span className={`text-[11px] sm:text-sm font-medium ${isSelected ? 'font-semibold' : ''}`} style={{ color: isSelected ? O : N }}>
                        {channel.label}
                      </span>
                      {isSelected && <CheckCircle size={10} className="sm:w-3 sm:h-3" style={{ color: O }} />}
                    </div>
                    <p className="text-[8px] sm:text-xs" style={{ color: MU }}>{channel.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Social Media Platforms */}
          {selectedChannels.includes('social_media') && (
            <div className="rounded-xl p-3 sm:p-4 border space-y-2.5" style={{ background: `${O}05`, borderColor: `${O}30` }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[11px] sm:text-sm font-semibold" style={{ color: N }}>Select Social Media Platforms</h3>
                  <p className="text-[9px] sm:text-xs" style={{ color: MU }}>Multi-select platforms to post or share property details</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedSocialPlatforms.length === socialPlatforms.length) {
                      setSelectedSocialPlatforms([]);
                    } else {
                      setSelectedSocialPlatforms(socialPlatforms.map(p => p.id));
                    }
                  }}
                  className="text-[9px] sm:text-xs font-bold px-2 py-0.5 rounded border bg-white hover:bg-orange-50 transition-colors"
                  style={{ borderColor: `${O}50`, color: O }}
                >
                  {selectedSocialPlatforms.length === socialPlatforms.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {socialPlatforms.map((platform) => {
                  const Icon = platform.icon;
                  const isSelected = selectedSocialPlatforms.includes(platform.id);
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => handleSocialPlatformToggle(platform.id)}
                      className={`p-2 sm:p-2.5 rounded-lg border text-center transition-all flex flex-col items-center justify-center relative ${
                        isSelected ? 'shadow-2xs bg-white font-bold' : 'bg-gray-50/70 opacity-60 hover:opacity-100 hover:bg-white'
                      }`}
                      style={{
                        borderColor: isSelected ? O : BD,
                      }}
                    >
                      {isSelected && (
                        <span className="absolute top-1 right-1">
                          <CheckCircle size={12} style={{ color: O }} />
                        </span>
                      )}
                      <Icon size={18} className="mx-auto" style={{ color: isSelected ? platform.color : MU }} />
                      <span className="text-[9px] sm:text-xs mt-1 block truncate w-full" style={{ color: isSelected ? N : MU }}>
                        {platform.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recipients */}
          <div>
            <h3 className="text-[11px] sm:text-sm font-semibold mb-2 sm:mb-3" style={{ color: N }}>Recipients</h3>

            <div className="rounded-lg p-2 sm:p-3 mb-3" style={{ background: `${N}05`, border: `1px solid ${BD}` }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-3">
                <input
                  type="text"
                  value={newRecipient.name}
                  onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm border rounded focus:outline-none focus:ring-1"
                  style={{ borderColor: BD }}
                  placeholder="Name"
                />
                <input
                  type="text"
                  value={newRecipient.contact}
                  onChange={(e) => setNewRecipient({ ...newRecipient, contact: e.target.value })}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm border rounded focus:outline-none focus:ring-1"
                  style={{ borderColor: BD }}
                  placeholder="Phone/Email"
                />
                <select
                  value={newRecipient.type}
                  onChange={(e) => setNewRecipient({ ...newRecipient, type: e.target.value })}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm border rounded focus:outline-none focus:ring-1"
                  style={{ borderColor: BD }}
                >
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                </select>
                <button
                  onClick={addRecipient}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 rounded text-white text-[11px] sm:text-sm transition-all hover:opacity-90"
                  style={{ background: O }}
                >
                  Add
                </button>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2 max-h-40 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              {recipients.map((recipient) => (
                <div key={recipient.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg" style={{ background: BG, border: `1px solid ${BD}` }}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 rounded" style={{ background: `${O}15` }}>
                      {recipient.type === 'email' ? <Mail size={12} className="sm:w-4 sm:h-4" style={{ color: O }} /> : <Phone size={12} className="sm:w-4 sm:h-4" style={{ color: O }} />}
                    </div>
                    <div>
                      <div className="text-[11px] sm:text-sm font-medium" style={{ color: N }}>{recipient.name}</div>
                      <div className="text-[9px] sm:text-xs" style={{ color: MU }}>{recipient.contact}</div>
                    </div>
                  </div>
                  <button onClick={() => removeRecipient(recipient.id)} className="text-red-400 hover:text-red-600">
                    <X size={12} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              ))}

              {recipients.length === 0 && (
                <div className="text-center py-3 text-[10px] sm:text-sm" style={{ color: MU }}>
                  No recipients added
                </div>
              )}
            </div>
          </div>

          {/* Custom Message */}
          <div>
            <h3 className="text-[11px] sm:text-sm font-semibold mb-2 sm:mb-3" style={{ color: N }}>Message</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCustomMessage(defaultMessage)}
                  className="px-2 sm:px-3 py-1 rounded text-[10px] sm:text-xs transition-colors"
                  style={{ background: `${O}10`, color: O }}
                >
                  Use Default
                </button>
                <button
                  onClick={() => copyToClipboard(customMessage || defaultMessage)}
                  className="px-2 sm:px-3 py-1 rounded text-[10px] sm:text-xs transition-colors"
                  style={{ background: `${N}10`, color: N }}
                >
                  <Copy size={10} className="sm:w-3 sm:h-3 inline mr-1" />
                  Copy
                </button>
              </div>
              <textarea
                value={customMessage || defaultMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full h-28 sm:h-32 px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm border rounded focus:outline-none focus:ring-1 resize-none"
                style={{ borderColor: BD }}
                placeholder="Enter your custom message..."
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-[11px] sm:text-sm font-semibold mb-2 sm:mb-3" style={{ color: N }}>Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <button
                onClick={() => copyToClipboard(generatePublicLink())}
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg transition-all hover:shadow-sm"
                style={{ border: `1px solid ${BD}`, background: BG }}
              >
                <Link size={14} className="sm:w-4 sm:h-4" style={{ color: O }} />
                <div className="text-left">
                  <div className="text-[11px] sm:text-sm font-medium" style={{ color: N }}>Copy Public Link</div>
                  <div className="text-[8px] sm:text-xs" style={{ color: MU }}>Share direct link</div>
                </div>
              </button>

              <button
                onClick={() => {
                  const qrWindow = window.open('', '_blank');
                  if (qrWindow) {
                    qrWindow.document.write(`
                      <html>
                        <head><title>QR Code - ${property.title}</title></head>
                        <body style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
                          <h2>${property.title}</h2>
                          <img src="${generateQRCode()}" alt="QR Code" style="margin: 20px;">
                          <p>Scan to view property details</p>
                          <p style="font-size: 12px; color: #666;">${generatePublicLink()}</p>
                        </body>
                      </html>
                    `);
                  }
                }}
                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg transition-all hover:shadow-sm"
                style={{ border: `1px solid ${BD}`, background: BG }}
              >
                <QrCode size={14} className="sm:w-4 sm:h-4" style={{ color: O }} />
                <div className="text-left">
                  <div className="text-[11px] sm:text-sm font-medium" style={{ color: N }}>Generate QR Code</div>
                  <div className="text-[8px] sm:text-xs" style={{ color: MU }}>Scannable code</div>
                </div>
              </button>
            </div>
          </div>

          {/* Share Results */}
          {shareResults.length > 0 && (
            <div>
              <h3 className="text-[11px] sm:text-sm font-semibold mb-2 sm:mb-3" style={{ color: N }}>Sharing Results</h3>
              <div className="space-y-1.5">
                {shareResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-2 sm:p-3 rounded-lg" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <CheckCircle size={12} className="sm:w-4 sm:h-4" style={{ color: O }} />
                      <span className="text-[10px] sm:text-sm font-medium" style={{ color: O }}>{result.channel} - {result.recipient}</span>
                    </div>
                    <span className="text-[8px] sm:text-xs uppercase font-medium" style={{ color: O }}>{result.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 sm:px-6 py-2 sm:py-4 border-t flex items-center justify-between" style={{ borderColor: BD, background: BG }}>
          <div className="text-[10px] sm:text-sm" style={{ color: MU }}>
            {selectedChannels.length} channel{selectedChannels.length !== 1 ? 's' : ''} • {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button onClick={onClose} className="px-2 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-sm border rounded transition-colors hover:bg-gray-50" style={{ borderColor: BD, color: N }}>
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={selectedChannels.length === 0 || isSharing}
              className="px-2 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-sm rounded text-white flex items-center gap-1 sm:gap-2 transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: O }}
            >
              {isSharing ? (
                <>
                  <Clock size={12} className="sm:w-4 sm:h-4 animate-spin" />
                  <span>Sharing...</span>
                </>
              ) : (
                <>
                  <Send size={12} className="sm:w-4 sm:h-4" />
                  <span>Share Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyShareModal;