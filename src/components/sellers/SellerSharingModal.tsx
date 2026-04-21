// import React, { useState } from 'react';
// import {
//   X,
//   Send,
//   MessageCircle,
//   Mail,
//   Phone,
//   Globe,
//   QrCode,
//   Copy,
//   Share,
//   User,
//   Building,
//   MapPin,
//   DollarSign,
//   Eye,
//   Download,
//   Link,
//   Smartphone,
//   Tablet,
//   Monitor,
//   Printer,
//   CheckCircle,
//   Clock,
//   AlertCircle,
//   Shield,
//   FileText,
//   Camera,
//   Video
// } from 'lucide-react';

// /* ------------ Types (minimal & safe) ------------ */
// type AnyObj = Record<string, any>;

// type Seller = {
//   id?: string | number;
//   name?: string;
//   phone?: string;
//   email?: string;
//   location?: string;
//   city?: string;
//   leadScore?: number;
//   stage?: string;
//   responseRate?: number | string;
//   avgResponseTime?: string;
//   properties?: AnyObj[];
//   [k: string]: any;
// };

// type Recipient = {
//   id: number;
//   name: string;
//   contact: string;
//   type: 'phone' | 'email';
// };

// type ShareResult = {
//   channel: string;
//   recipient: string;
//   status: string;
// };

// type Props = {
//   isOpen: boolean;
//   onClose: () => void;
//   seller: Seller;
//   onShare: (data: AnyObj) => void;
// };

// /* util first (was used earlier in template) */
// const formatCurrency = (amount: number) => {
//   if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
//   if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
//   return `₹${Number(amount).toLocaleString('en-IN')}`;
// };

// const SellerSharingModal: React.FC<Props> = ({ isOpen, onClose, seller, onShare }) => {
//   const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
//   const [customMessage, setCustomMessage] = useState('');
//   const [recipients, setRecipients] = useState<Recipient[]>([]);
//   const [newRecipient, setNewRecipient] = useState<{ name: string; contact: string; type: 'phone' | 'email' }>({
//     name: '',
//     contact: '',
//     type: 'phone'
//   });
//   const [isSharing, setIsSharing] = useState(false);
//   const [shareResults, setShareResults] = useState<ShareResult[]>([]);
//   const [shareType, setShareType] = useState<'profile' | 'properties' | 'contact'>('profile');

//   if (!isOpen || !seller) return null;

//   const stageLabel = (seller.stage ?? '')
//     .replace('_', ' ')
//     .replace(/\b\w/g, (l: string) => l.toUpperCase());

//   const defaultMessages = {
//     profile: `👤 *Seller Profile - ${seller.name ?? ''}*

// 📞 *Contact:* ${seller.phone ?? '—'}
// 📧 *Email:* ${seller.email ?? '—'}
// 📍 *Location:* ${seller.location ?? '—'}, ${seller.city ?? '—'}
// ⭐ *Lead Score:* ${seller.leadScore ?? 0}/100
// 📊 *Stage:* ${stageLabel}

// 🏠 *Properties:* ${seller.properties?.length || 0} listed
// 📈 *Response Rate:* ${seller.responseRate ?? '—'}%
// ⏱️ *Avg Response:* ${seller.avgResponseTime ?? '—'}

// ---
// Shared via ResaleExpert
// 🌐 www.resaleexpert.com`,

//     properties: `🏠 *${seller.name ?? ''}'s Properties*

// 📍 *Seller Location:* ${seller.location ?? '—'}, ${seller.city ?? '—'}
// 📞 *Contact:* ${seller.phone ?? '—'}

// ${seller.properties?.map((prop: any, index: number) =>
//       `${index + 1}. *${prop.title ?? 'Property'}*
//    📍 ${prop.address ?? prop.location ?? '—'}
//    💰 ${prop.price != null ? formatCurrency(Number(prop.price)) : '—'}
//    🏢 ${prop.unitType ?? prop.unit_type ?? '—'} • ${prop.area ?? prop.carpet_area ?? '—'} sq ft`
//     ).join('\n\n') || 'No properties listed yet'}

// *Interested in any property? Contact us!*

// ---
// ResaleExpert - Your Trusted Partner
// 📞 +91 99999 99999`,

//     contact: `📞 *Contact Details - ${seller.name ?? ''}*

// *Primary Contact:*
// 📱 Phone: ${seller.phone ?? '—'}
// 📧 Email: ${seller.email ?? '—'}

// *Location:*
// 📍 ${seller.location ?? '—'}, ${seller.city ?? '—'}

// *Business Details:*
// ⭐ Lead Score: ${seller.leadScore ?? 0}/100
// 📊 Current Stage: ${stageLabel}
// 📈 Response Rate: ${seller.responseRate ?? '—'}%

// ---
// ResaleExpert Team
// 🌐 www.resaleexpert.com`
//   };

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
//       description: 'Send detailed email with seller information'
//     },
//     {
//       id: 'sms',
//       label: 'SMS',
//       icon: Phone,
//       color: 'purple',
//       description: 'Send SMS with seller contact details'
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
//       id: 'business_card',
//       label: 'Digital Business Card',
//       icon: User,
//       color: 'pink',
//       description: 'Create digital business card'
//     }
//   ] as const;

//   const shareTypes: { id: 'profile' | 'properties' | 'contact'; label: string; description: string }[] = [
//     { id: 'profile', label: 'Seller Profile', description: 'Complete seller information' },
//     { id: 'properties', label: "Property List", description: "Seller's property listings" },
//     { id: 'contact', label: 'Contact Details', description: 'Contact information only' }
//   ];

//   const handleChannelToggle = (channelId: string) => {
//     setSelectedChannels(prev => (prev.includes(channelId) ? prev.filter(id => id !== channelId) : [...prev, channelId]));
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
//     const slug = String(seller.name ?? '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
//     const sid = seller.id ?? 'seller';
//     return `https://resaleexpert.com/seller/${sid}/${slug}`;
//   };

//   const generateQRCode = () => {
//     const link = generatePublicLink();
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
//       const results: ShareResult[] = [];
//       const message = customMessage || defaultMessages[shareType];

//       for (const channel of selectedChannels) {
//         // simulate async op
//         await new Promise(resolve => setTimeout(resolve, 500));

//         switch (channel) {
//           case 'whatsapp': {
//             if (recipients.length > 0) {
//               for (const recipient of recipients) {
//                 if (recipient.type === 'phone') {
//                   const whatsappUrl = `https://wa.me/${recipient.contact.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
//                   window.open(whatsappUrl, '_blank');
//                   results.push({ channel: 'WhatsApp', recipient: recipient.name, status: 'sent' });
//                 }
//               }
//             }
//             break;
//           }
//           case 'email': {
//             if (recipients.length > 0) {
//               for (const recipient of recipients) {
//                 if (recipient.type === 'email') {
//                   const subject = `Seller Information - ${seller.name ?? ''}`;
//                   const mailtoUrl = `mailto:${recipient.contact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
//                   window.open(mailtoUrl, '_blank');
//                   results.push({ channel: 'Email', recipient: recipient.name, status: 'sent' });
//                 }
//               }
//             }
//             break;
//           }
//           case 'sms': {
//             // integrate SMS gateway here
//             results.push({ channel: 'SMS', recipient: 'Multiple', status: 'sent' });
//             break;
//           }
//           case 'public_link': {
//             const publicLink = generatePublicLink();
//             try {
//               await navigator.clipboard.writeText(publicLink);
//               results.push({ channel: 'Public Link', recipient: 'Copied to clipboard', status: 'generated' });
//             } catch {
//               results.push({ channel: 'Public Link', recipient: publicLink, status: 'generated' });
//             }
//             break;
//           }
//           case 'qr_code': {
//             const qrCodeUrl = generateQRCode();
//             const qrWindow = window.open('', '_blank');
//             if (qrWindow) {
//               qrWindow.document.write(`
//                 <html>
//                   <head><title>QR Code - ${seller.name ?? ''}</title></head>
//                   <body style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
//                     <h2>Seller: ${seller.name ?? ''}</h2>
//                     <img src="${qrCodeUrl}" alt="QR Code" style="margin: 20px;">
//                     <p>Scan to view seller profile</p>
//                     <p style="font-size: 12px; color: #666;">${generatePublicLink()}</p>
//                   </body>
//                 </html>
//               `);
//             }
//             results.push({ channel: 'QR Code', recipient: 'Generated', status: 'created' });
//             break;
//           }
//           default: {
//             results.push({ channel, recipient: 'Multiple', status: 'sent' });
//           }
//         }
//       }

//       setShareResults(results);

//       onShare({
//         seller_id: seller.id,
//         channels: selectedChannels,
//         recipients,
//         message,
//         shareType,
//         results,
//         shared_at: new Date().toISOString()
//       });
//     } catch (error) {
//       console.error('Sharing failed:', error);
//     } finally {
//       setIsSharing(false);
//     }
//   };

//   const copyToClipboard = async (text: string) => {
//     try {
//       await navigator.clipboard.writeText(text);
//       alert('Copied to clipboard!');
//     } catch {
//       // fallback prompt
//       window.prompt('Copy to clipboard:', text);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
//         {/* Header */}
//         <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="p-3 bg-green-100 rounded-xl">
//                 <Share className="text-green-600" size={24} />
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-900">Share Seller Information</h2>
//                 <p className="text-gray-600 mt-1">{seller.name} - Multi-channel Sharing</p>
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
//           {/* Share Type Selection */}
//           <div className="mb-6">
//             <h3 className="font-semibold text-gray-900 mb-4">What to Share</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               {shareTypes.map((type) => (
//                 <button
//                   key={type.id}
//                   onClick={() => setShareType(type.id)}
//                   className={`p-4 rounded-xl border-2 transition-all text-left ${shareType === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
//                     }`}
//                 >
//                   <div className="font-medium text-gray-900">{type.label}</div>
//                   <div className="text-sm text-gray-600 mt-1">{type.description}</div>
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Seller Summary */}
//           <div className="bg-gray-50 rounded-xl p-4 mb-6">
//             <h3 className="font-semibold text-gray-900 mb-3">Seller Summary</h3>
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
//               <div>
//                 <span className="text-gray-500">Name:</span>
//                 <span className="font-semibold ml-2">{seller.name}</span>
//               </div>
//               <div>
//                 <span className="text-gray-500">Phone:</span>
//                 <span className="font-semibold ml-2">{seller.phone}</span>
//               </div>
//               <div>
//                 <span className="text-gray-500">Location:</span>
//                 <span className="font-semibold ml-2">
//                   {seller.location}, {seller.city}
//                 </span>
//               </div>
//               <div>
//                 <span className="text-gray-500">Properties:</span>
//                 <span className="font-semibold ml-2">{seller.properties?.length || 0}</span>
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
//                     className={`p-4 rounded-xl border-2 transition-all text-left ${isSelected ? `border-${channel.color}-500 bg-${channel.color}-50` : 'border-gray-200 hover:border-gray-300'
//                       }`}
//                   >
//                     <div className="flex items-center space-x-3 mb-2">
//                       <Icon size={20} className={isSelected ? `text-${channel.color}-600` : 'text-gray-400'} />
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

//           {/* Recipients */}
//           <div className="mb-6">
//             <h3 className="font-semibold text-gray-900 mb-4">Recipients</h3>

//             {/* Add Recipient */}
//             <div className="bg-gray-50 rounded-lg p-4 mb-4">
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
//                 <input
//                   type="text"
//                   value={newRecipient.name}
//                   onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })}
//                   className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                   placeholder="Recipient name"
//                 />
//                 <input
//                   type="text"
//                   value={newRecipient.contact}
//                   onChange={(e) => setNewRecipient({ ...newRecipient, contact: e.target.value })}
//                   className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                   placeholder="Phone/Email"
//                 />
//                 <select
//                   value={newRecipient.type}
//                   onChange={(e) => setNewRecipient({ ...newRecipient, type: e.target.value as 'phone' | 'email' })}
//                   className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="phone">Phone</option>
//                   <option value="email">Email</option>
//                 </select>
//                 <button onClick={addRecipient} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
//                   <button onClick={() => removeRecipient(recipient.id)} className="text-red-600 hover:text-red-800">
//                     <X size={16} />
//                   </button>
//                 </div>
//               ))}

//               {recipients.length === 0 && (
//                 <div className="text-center py-4 text-gray-500">No recipients added. Add recipients to share seller information.</div>
//               )}
//             </div>
//           </div>

//           {/* Message */}
//           <div className="mb-6">
//             <h3 className="font-semibold text-gray-900 mb-4">Message</h3>
//             <div className="space-y-3">
//               <div className="flex items-center space-x-2">
//                 <button
//                   onClick={() => setCustomMessage(defaultMessages[shareType])}
//                   className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
//                 >
//                   Use Default
//                 </button>
//                 <button
//                   onClick={() => copyToClipboard(customMessage || defaultMessages[shareType])}
//                   className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
//                 >
//                   <Copy size={12} className="inline mr-1" />
//                   Copy
//                 </button>
//               </div>
//               <textarea
//                 value={customMessage || defaultMessages[shareType]}
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
//                   <div className="font-medium text-gray-900">Copy Profile Link</div>
//                   <div className="text-sm text-gray-600">Share direct seller profile</div>
//                 </div>
//               </button>

//               <button
//                 onClick={() => {
//                   const qrWindow = window.open('', '_blank');
//                   if (qrWindow) {
//                     qrWindow.document.write(`
//                       <html>
//                         <head><title>QR Code - ${seller.name ?? ''}</title></head>
//                         <body style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
//                           <h2>Seller: ${seller.name ?? ''}</h2>
//                           <img src="${generateQRCode()}" alt="QR Code" style="margin: 20px;">
//                           <p>Scan to view seller profile</p>
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
//                     <span className="text-xs text-green-600 uppercase font-medium">{result.status}</span>
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
//               {selectedChannels.length} channel{selectedChannels.length !== 1 ? 's' : ''} selected • {recipients.length} recipient
//               {recipients.length !== 1 ? 's' : ''}
//             </div>
//             <div className="flex items-center space-x-3">
//               <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
//                 Cancel
//               </button>
//               <button
//                 onClick={handleShare}
//                 disabled={selectedChannels.length === 0 || isSharing}
//                 className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

// export default SellerSharingModal;



import React, { useState } from 'react';
import {
  X,
  Send,
  MessageCircle,
  Mail,
  Phone,
  Globe,
  QrCode,
  Copy,
  Share,
  User,
  Building,
  MapPin,
  DollarSign,
  Eye,
  Download,
  Link,
  Smartphone,
  Tablet,
  Monitor,
  Printer,
  CheckCircle,
  Clock,
  AlertCircle,
  Shield,
  FileText,
  Camera,
  Video,
  ChevronRight,
  Plus,
  Trash2,
  Users,
  FileSpreadsheet,
  Hash
} from 'lucide-react';

// ESALE Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

/* ------------ Types (minimal & safe) ------------ */
type AnyObj = Record<string, any>;

type Seller = {
  id?: string | number;
  name?: string;
  phone?: string;
  email?: string;
  location?: string;
  city?: string;
  leadScore?: number;
  stage?: string;
  responseRate?: number | string;
  avgResponseTime?: string;
  properties?: AnyObj[];
  [k: string]: any;
};

type Recipient = {
  id: number;
  name: string;
  contact: string;
  type: 'phone' | 'email';
};

type ShareResult = {
  channel: string;
  recipient: string;
  status: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  seller: Seller;
  onShare: (data: AnyObj) => void;
};

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

const SellerSharingModal: React.FC<Props> = ({ isOpen, onClose, seller, onShare }) => {
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [customMessage, setCustomMessage] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [newRecipient, setNewRecipient] = useState<{ name: string; contact: string; type: 'phone' | 'email' }>({
    name: '',
    contact: '',
    type: 'phone'
  });
  const [isSharing, setIsSharing] = useState(false);
  const [shareResults, setShareResults] = useState<ShareResult[]>([]);
  const [shareType, setShareType] = useState<'profile' | 'properties' | 'contact'>('profile');

  if (!isOpen || !seller) return null;

  const stageLabel = (seller.stage ?? '')
    .replace('_', ' ')
    .replace(/\b\w/g, (l: string) => l.toUpperCase());

  const defaultMessages = {
    profile: `👤 *Seller Profile - ${seller.name ?? ''}*

📞 *Contact:* ${seller.phone ?? '—'}
📧 *Email:* ${seller.email ?? '—'}
📍 *Location:* ${seller.location ?? '—'}, ${seller.city ?? '—'}
⭐ *Lead Score:* ${seller.leadScore ?? 0}/100
📊 *Stage:* ${stageLabel}

🏠 *Properties:* ${seller.properties?.length || 0} listed
📈 *Response Rate:* ${seller.responseRate ?? '—'}%
⏱️ *Avg Response:* ${seller.avgResponseTime ?? '—'}

---
Shared via ResaleExpert
🌐 www.resaleexpert.com`,

    properties: `🏠 *${seller.name ?? ''}'s Properties*

📍 *Seller Location:* ${seller.location ?? '—'}, ${seller.city ?? '—'}
📞 *Contact:* ${seller.phone ?? '—'}

${seller.properties?.map((prop: any, index: number) =>
      `${index + 1}. *${prop.title ?? 'Property'}*
   📍 ${prop.address ?? prop.location ?? '—'}
   💰 ${prop.price != null ? formatCurrency(Number(prop.price)) : '—'}
   🏢 ${prop.unitType ?? prop.unit_type ?? '—'} • ${prop.area ?? prop.carpet_area ?? '—'} sq ft`
    ).join('\n\n') || 'No properties listed yet'}

*Interested in any property? Contact us!*

---
ResaleExpert - Your Trusted Partner
📞 +91 99999 99999`,

    contact: `📞 *Contact Details - ${seller.name ?? ''}*

*Primary Contact:*
📱 Phone: ${seller.phone ?? '—'}
📧 Email: ${seller.email ?? '—'}

*Location:*
📍 ${seller.location ?? '—'}, ${seller.city ?? '—'}

*Business Details:*
⭐ Lead Score: ${seller.leadScore ?? 0}/100
📊 Current Stage: ${stageLabel}
📈 Response Rate: ${seller.responseRate ?? '—'}%

---
ResaleExpert Team
🌐 www.resaleexpert.com`
  };

  const sharingChannels = [
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: '#25D366', bg: '#E8F5E9', description: 'Share via WhatsApp with rich formatting' },
    { id: 'email', label: 'Email', icon: Mail, color: '#3B82F6', bg: '#EFF6FF', description: 'Send detailed email with seller information' },
    { id: 'sms', label: 'SMS', icon: Phone, color: '#8B5CF6', bg: '#F3E8FF', description: 'Send SMS with seller contact details' },
    { id: 'public_link', label: 'Public Link', icon: Globe, color: '#6366F1', bg: '#EEF2FF', description: 'Generate shareable public link' },
    { id: 'qr_code', label: 'QR Code', icon: QrCode, color: N, bg: `${N}10`, description: 'Generate QR code for easy sharing' },
    { id: 'business_card', label: 'Digital Card', icon: User, color: '#EC4899', bg: '#FDF2F8', description: 'Create digital business card' }
  ] as const;

  const shareTypes: { id: 'profile' | 'properties' | 'contact'; label: string; icon: any; description: string }[] = [
    { id: 'profile', label: 'Seller Profile', icon: User, description: 'Complete seller information' },
    { id: 'properties', label: 'Property List', icon: Building, description: "Seller's property listings" },
    { id: 'contact', label: 'Contact Details', icon: Phone, description: 'Contact information only' }
  ];

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels(prev => (prev.includes(channelId) ? prev.filter(id => id !== channelId) : [...prev, channelId]));
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
    const slug = String(seller.name ?? '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const sid = seller.id ?? 'seller';
    return `https://resaleexpert.com/seller/${sid}/${slug}`;
  };

  const generateQRCode = () => {
    const link = generatePublicLink();
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
  };

  const handleShare = async () => {
    if (selectedChannels.length === 0) {
      alert('Please select at least one sharing channel');
      return;
    }

    setIsSharing(true);
    setShareResults([]);

    try {
      const results: ShareResult[] = [];
      const message = customMessage || defaultMessages[shareType];

      for (const channel of selectedChannels) {
        await new Promise(resolve => setTimeout(resolve, 500));

        switch (channel) {
          case 'whatsapp': {
            if (recipients.length > 0) {
              for (const recipient of recipients) {
                if (recipient.type === 'phone') {
                  const whatsappUrl = `https://wa.me/${recipient.contact.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, '_blank');
                  results.push({ channel: 'WhatsApp', recipient: recipient.name, status: 'sent' });
                }
              }
            }
            break;
          }
          case 'email': {
            if (recipients.length > 0) {
              for (const recipient of recipients) {
                if (recipient.type === 'email') {
                  const subject = `Seller Information - ${seller.name ?? ''}`;
                  const mailtoUrl = `mailto:${recipient.contact}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
                  window.open(mailtoUrl, '_blank');
                  results.push({ channel: 'Email', recipient: recipient.name, status: 'sent' });
                }
              }
            }
            break;
          }
          case 'sms': {
            results.push({ channel: 'SMS', recipient: 'Multiple', status: 'sent' });
            break;
          }
          case 'public_link': {
            const publicLink = generatePublicLink();
            try {
              await navigator.clipboard.writeText(publicLink);
              results.push({ channel: 'Public Link', recipient: 'Copied to clipboard', status: 'generated' });
            } catch {
              results.push({ channel: 'Public Link', recipient: publicLink, status: 'generated' });
            }
            break;
          }
          case 'qr_code': {
            const qrCodeUrl = generateQRCode();
            const qrWindow = window.open('', '_blank');
            if (qrWindow) {
              qrWindow.document.write(`
                <html>
                  <head><title>QR Code - ${seller.name ?? ''}</title></head>
                  <body style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
                    <h2>Seller: ${seller.name ?? ''}</h2>
                    <img src="${qrCodeUrl}" alt="QR Code" style="margin: 20px;">
                    <p>Scan to view seller profile</p>
                    <p style="font-size: 12px; color: #666;">${generatePublicLink()}</p>
                  </body>
                </html>
              `);
            }
            results.push({ channel: 'QR Code', recipient: 'Generated', status: 'created' });
            break;
          }
          default: {
            results.push({ channel, recipient: 'Multiple', status: 'sent' });
          }
        }
      }

      setShareResults(results);

      onShare({
        seller_id: seller.id,
        channels: selectedChannels,
        recipients,
        message,
        shareType,
        results,
        shared_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Sharing failed:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch {
      window.prompt('Copy to clipboard:', text);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }}>
        
        {/* Header */}
        <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between shrink-0" style={{ background: N }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ background: `${O}20` }}>
              <Share size={14} style={{ color: O }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Share Seller Information</h2>
              <p className="text-[9px] text-white/70">{seller.name} - Multi-channel Sharing</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4" style={{ scrollbarWidth: 'thin' }}>
          
          {/* Share Type Selection */}
          <div className="mb-4">
            <h3 className="text-[10px] font-semibold mb-2 flex items-center gap-1" style={{ color: N }}>
              <Hash size={10} style={{ color: O }} /> What to Share
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {shareTypes.map((type) => {
                const Icon = type.icon;
                const isActive = shareType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setShareType(type.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-left ${isActive ? 'border-orange-300 bg-orange-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                  >
                    <div className={`p-1 rounded-lg ${isActive ? 'bg-orange-100' : 'bg-gray-100'}`}>
                      <Icon size={12} style={isActive ? { color: O } : { color: MU }} />
                    </div>
                    <div>
                      <div className="text-[10px] font-medium" style={{ color: isActive ? O : N }}>{type.label}</div>
                      <div className="text-[8px]" style={{ color: MU }}>{type.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seller Summary */}
          <div className="rounded-lg p-2.5 mb-4" style={{ background: BG, border: `1px solid ${BD}` }}>
            <h3 className="text-[10px] font-semibold mb-2 flex items-center gap-1" style={{ color: N }}>
              <User size={10} style={{ color: O }} /> Seller Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px]">
              <div><span style={{ color: MU }}>Name:</span> <span className="font-semibold" style={{ color: N }}>{seller.name}</span></div>
              <div><span style={{ color: MU }}>Phone:</span> <span className="font-semibold" style={{ color: N }}>{seller.phone}</span></div>
              <div><span style={{ color: MU }}>Location:</span> <span className="font-semibold" style={{ color: N }}>{seller.location}, {seller.city}</span></div>
              <div><span style={{ color: MU }}>Properties:</span> <span className="font-semibold" style={{ color: O }}>{seller.properties?.length || 0}</span></div>
            </div>
          </div>

          {/* Sharing Channels */}
          <div className="mb-4">
            <h3 className="text-[10px] font-semibold mb-2 flex items-center gap-1" style={{ color: N }}>
              <Share size={10} style={{ color: O }} /> Select Sharing Channels
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
              {sharingChannels.map((channel) => {
                const Icon = channel.icon;
                const isSelected = selectedChannels.includes(channel.id);
                return (
                  <button
                    key={channel.id}
                    onClick={() => handleChannelToggle(channel.id)}
                    className={`flex flex-col items-center p-2 rounded-lg border transition-all ${isSelected ? 'border-orange-300' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                    style={isSelected ? { background: `${O}10` } : { background: 'white' }}
                  >
                    <Icon size={14} style={isSelected ? { color: O } : { color: MU }} />
                    <span className="text-[9px] font-medium mt-1" style={isSelected ? { color: O } : { color: MU }}>{channel.label}</span>
                    {isSelected && <CheckCircle size={8} className="mt-0.5" style={{ color: O }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recipients */}
          <div className="mb-4">
            <h3 className="text-[10px] font-semibold mb-2 flex items-center gap-1" style={{ color: N }}>
              <Users size={10} style={{ color: O }} /> Recipients
            </h3>

            {/* Add Recipient */}
            <div className="rounded-lg p-2.5 mb-2" style={{ background: BG, border: `1px solid ${BD}` }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                <input type="text" value={newRecipient.name} onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })} className="h-7 px-2 text-[10px] border rounded-lg focus:outline-none focus:ring-1" style={{ borderColor: BD }} placeholder="Recipient name" />
                <input type="text" value={newRecipient.contact} onChange={(e) => setNewRecipient({ ...newRecipient, contact: e.target.value })} className="h-7 px-2 text-[10px] border rounded-lg focus:outline-none focus:ring-1" style={{ borderColor: BD }} placeholder="Phone/Email" />
                <select value={newRecipient.type} onChange={(e) => setNewRecipient({ ...newRecipient, type: e.target.value as 'phone' | 'email' })} className="h-7 px-2 text-[10px] border rounded-lg focus:outline-none focus:ring-1" style={{ borderColor: BD }}>
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                </select>
                <button onClick={addRecipient} className="h-7 px-2 rounded-lg text-[10px] font-medium text-white flex items-center justify-center gap-1" style={{ background: O }}><Plus size={10} /> Add</button>
              </div>
            </div>

            {/* Recipients List */}
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {recipients.map((recipient) => (
                <div key={recipient.id} className="flex items-center justify-between p-2 rounded-lg" style={{ background: BG, border: `1px solid ${BD}` }}>
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded" style={{ background: `${O}15` }}>
                      {recipient.type === 'email' ? <Mail size={10} style={{ color: O }} /> : <Phone size={10} style={{ color: O }} />}
                    </div>
                    <div><div className="text-[9px] font-medium" style={{ color: N }}>{recipient.name}</div><div className="text-[8px]" style={{ color: MU }}>{recipient.contact}</div></div>
                  </div>
                  <button onClick={() => removeRecipient(recipient.id)} className="p-1 rounded hover:bg-red-50"><X size={10} style={{ color: '#ef4444' }} /></button>
                </div>
              ))}
              {recipients.length === 0 && (
                <div className="text-center py-3 text-[9px]" style={{ color: MU }}>No recipients added</div>
              )}
            </div>
          </div>

          {/* Message */}
          <div className="mb-3">
            <h3 className="text-[10px] font-semibold mb-2 flex items-center gap-1" style={{ color: N }}>
              <FileText size={10} style={{ color: O }} /> Message
            </h3>
            <div className="space-y-2">
              <div className="flex gap-1.5">
                <button onClick={() => setCustomMessage(defaultMessages[shareType])} className="px-2 py-1 rounded text-[9px] font-medium transition-colors" style={{ background: `${O}15`, color: O }}>Use Default</button>
                <button onClick={() => copyToClipboard(customMessage || defaultMessages[shareType])} className="px-2 py-1 rounded text-[9px] font-medium transition-colors flex items-center gap-1" style={{ background: BG, border: `1px solid ${BD}`, color: MU }}><Copy size={9} /> Copy</button>
              </div>
              <textarea value={customMessage || defaultMessages[shareType]} onChange={(e) => setCustomMessage(e.target.value)} rows={6} className="w-full px-2 py-1.5 text-[9px] border rounded-lg focus:outline-none focus:ring-1 resize-none" style={{ borderColor: BD }} placeholder="Enter your custom message..." />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-4">
            <h3 className="text-[10px] font-semibold mb-2 flex items-center gap-1" style={{ color: N }}>
              <Link size={10} style={{ color: O }} /> Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <button onClick={() => copyToClipboard(generatePublicLink())} className="flex items-center gap-2 p-2 rounded-lg border transition-colors hover:bg-gray-50" style={{ borderColor: BD }}>
                <Link size={12} style={{ color: O }} /><div className="text-left"><div className="text-[9px] font-medium" style={{ color: N }}>Copy Profile Link</div><div className="text-[7px]" style={{ color: MU }}>Share direct seller profile</div></div>
              </button>
              <button onClick={() => { const qrWindow = window.open('', '_blank'); if (qrWindow) { qrWindow.document.write(`<html><head><title>QR Code - ${seller.name ?? ''}</title></head><body style="text-align:center;padding:20px;font-family:Arial;"><h2>Seller: ${seller.name ?? ''}</h2><img src="${generateQRCode()}" alt="QR Code" style="margin:20px;"><p>Scan to view seller profile</p><p style="font-size:12px;color:#666;">${generatePublicLink()}</p></body></html>`); } }} className="flex items-center gap-2 p-2 rounded-lg border transition-colors hover:bg-gray-50" style={{ borderColor: BD }}>
                <QrCode size={12} style={{ color: O }} /><div className="text-left"><div className="text-[9px] font-medium" style={{ color: N }}>Generate QR Code</div><div className="text-[7px]" style={{ color: MU }}>Create scannable QR code</div></div>
              </button>
            </div>
          </div>

          {/* Share Results */}
          {shareResults.length > 0 && (
            <div>
              <h3 className="text-[10px] font-semibold mb-2 flex items-center gap-1" style={{ color: N }}>
                <CheckCircle size={10} style={{ color: O }} /> Sharing Results
              </h3>
              <div className="space-y-1.5">
                {shareResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
                    <div className="flex items-center gap-1.5"><CheckCircle size={10} style={{ color: O }} /><span className="text-[9px] font-medium" style={{ color: N }}>{result.channel} - {result.recipient}</span></div>
                    <span className="text-[8px] font-medium uppercase px-1.5 py-0.5 rounded" style={{ background: `${O}20`, color: O }}>{result.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-2.5 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0" style={{ borderColor: BD, background: BG }}>
          <div className="text-[9px]" style={{ color: MU }}>
            {selectedChannels.length} channel{selectedChannels.length !== 1 ? 's' : ''} selected • {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all hover:bg-gray-50" style={{ border: `1px solid ${BD}`, color: N }}>Cancel</button>
            <button onClick={handleShare} disabled={selectedChannels.length === 0 || isSharing} className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium text-white rounded-lg transition-all hover:opacity-80 disabled:opacity-50" style={{ background: O }}>
              {isSharing ? <><Clock size={10} className="animate-spin" /><span>Sharing...</span></> : <><Send size={10} /><span>Share Now</span></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerSharingModal;