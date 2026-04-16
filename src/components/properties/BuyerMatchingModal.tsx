// import React, { useState } from 'react';
// import { X, Users, Target, Search, Filter, Star, Phone, MessageCircle, Mail, MapPin, DollarSign, Calendar, Eye, Send, UserPlus } from 'lucide-react';

// const BuyerMatchingModal = ({ isOpen, onClose, property }: any) => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedBuyers, setSelectedBuyers] = useState<number[]>([]);
//   const [matchingCriteria, setMatchingCriteria] = useState({
//     budgetRange: 10, // percentage
//     locationRadius: 5, // km
//     propertyType: true,
//     amenities: true
//   });

//   if (!isOpen || !property) return null;

//   // Sample buyers data with matching scores
//   const buyers = [
//     {
//       id: 1,
//       name: 'Amit Patel',
//       phone: '+91 98765 11111',
//       email: 'amit.patel@email.com',
//       budget: { min: 22000000, max: 26000000 },
//       preferredLocation: ['Andheri West', 'Bandra West', 'Juhu'],
//       propertyType: 'Apartment',
//       unitType: '3BHK',
//       requirements: ['Ready to move', 'Good parking', 'Near metro'],
//       matchScore: 95,
//       status: 'hot_lead',
//       lastContact: '2025-01-10',
//       source: 'Website',
//       visitHistory: 2,
//       feedback: 'Very interested, looking for immediate purchase'
//     },
//     {
//       id: 2,
//       name: 'Priya Shah',
//       phone: '+91 98765 22222',
//       email: 'priya.shah@email.com',
//       budget: { min: 20000000, max: 24000000 },
//       preferredLocation: ['Andheri West', 'Versova', 'Oshiwara'],
//       propertyType: 'Apartment',
//       unitType: '2BHK',
//       requirements: ['Good amenities', 'Security', 'Parking'],
//       matchScore: 87,
//       status: 'warm_lead',
//       lastContact: '2025-01-08',
//       source: 'Referral',
//       visitHistory: 1,
//       feedback: 'Interested but needs family approval'
//     },
//     {
//       id: 3,
//       name: 'Rohit Gupta',
//       phone: '+91 98765 33333',
//       email: 'rohit.gupta@email.com',
//       budget: { min: 24000000, max: 28000000 },
//       preferredLocation: ['Andheri West', 'Malad West', 'Goregaon West'],
//       propertyType: 'Apartment',
//       unitType: '3BHK',
//       requirements: ['Investment purpose', 'Good rental yield', 'Branded builder'],
//       matchScore: 92,
//       status: 'hot_lead',
//       lastContact: '2025-01-12',
//       source: 'Social Media',
//       visitHistory: 0,
//       feedback: 'Looking for investment property'
//     },
//     {
//       id: 4,
//       name: 'Neha Sharma',
//       phone: '+91 98765 44444',
//       email: 'neha.sharma@email.com',
//       budget: { min: 18000000, max: 22000000 },
//       preferredLocation: ['Andheri East', 'Powai', 'Vikhroli'],
//       propertyType: 'Apartment',
//       unitType: '2BHK',
//       requirements: ['First home', 'Good connectivity', 'Family-friendly'],
//       matchScore: 78,
//       status: 'warm_lead',
//       lastContact: '2025-01-09',
//       source: 'Advertisement',
//       visitHistory: 1,
//       feedback: 'Budget constraints, looking for better deals'
//     }
//   ];

//   const filteredBuyers = buyers.filter(buyer =>
//     buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     buyer.phone.includes(searchTerm) ||
//     buyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     buyer.requirements.some(req => req.toLowerCase().includes(searchTerm.toLowerCase()))
//   ).sort((a, b) => b.matchScore - a.matchScore);

//   const handleBuyerSelection = (buyerId: number) => {
//     setSelectedBuyers(prev => 
//       prev.includes(buyerId) 
//         ? prev.filter(id => id !== buyerId)
//         : [...prev, buyerId]
//     );
//   };

//   const handleSelectAll = () => {
//     if (selectedBuyers.length === filteredBuyers.length) {
//       setSelectedBuyers([]);
//     } else {
//       setSelectedBuyers(filteredBuyers.map(b => b.id));
//     }
//   };

//   const handleSendToSelectedBuyers = () => {
//     if (selectedBuyers.length === 0) {
//       alert('Please select buyers to send property details');
//       return;
//     }
    
//     const selectedBuyerData = buyers.filter(b => selectedBuyers.includes(b.id));
   
//     alert(`Property details sent to ${selectedBuyers.length} buyers via WhatsApp and Email`);
//     setSelectedBuyers([]);
//   };

//   const getMatchScoreColor = (score: number) => {
//     if (score >= 90) return 'text-green-600 bg-green-100';
//     if (score >= 80) return 'text-blue-600 bg-blue-100';
//     if (score >= 70) return 'text-orange-600 bg-orange-100';
//     return 'text-red-600 bg-red-100';
//   };

//   const getBuyerStatusBadge = (status: string) => {
//     const statusConfig = {
//       'hot_lead': { bg: 'bg-red-100', text: 'text-red-700', label: 'Hot Lead', icon: '🔥' },
//       'warm_lead': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Warm Lead', icon: '⚡' },
//       'cold_lead': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Cold Lead', icon: '❄️' }
//     };
    
//     const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.cold_lead;
//     return (
//       <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
//         {config.icon} {config.label}
//       </span>
//     );
//   };

//   const formatCurrency = (amount: number) => {
//     if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
//     if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
//     return `₹${amount.toLocaleString('en-IN')}`;
//   };

//   const handleWhatsApp = (buyer: any) => {
//     const message = `Hi ${buyer.name}, I have a perfect property match for you!\n\n🏠 ${property.title}\n📍 ${property.location}, ${property.city}\n💰 ${formatCurrency(property.budget)}\n🏢 ${property.unitType} • ${property.carpetArea} sq ft\n\nWould you like to schedule a visit?\n\nBest regards,\nResaleExpert Team`;
//     const whatsappUrl = `https://wa.me/${buyer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
//     window.open(whatsappUrl, '_blank');
//   };

//   const handleEmail = (buyer: any) => {
//     const subject = `Perfect Property Match - ${property.title}`;
//     const body = `Dear ${buyer.name},\n\nWe have found a perfect property match based on your requirements:\n\nProperty: ${property.title}\nLocation: ${property.location}, ${property.city}\nPrice: ${formatCurrency(property.budget)}\nType: ${property.unitType}\nArea: ${property.carpetArea} sq ft\n\nThis property matches ${buyers.find(b => b.id === buyer.id)?.matchScore}% of your requirements.\n\nWould you like to schedule a visit?\n\nBest regards,\nResaleExpert Team`;
//     const mailtoUrl = `mailto:${buyer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
//     window.open(mailtoUrl, '_blank');
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
//         {/* Header */}
//         <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-3">
//               <div className="p-3 bg-green-100 rounded-xl">
//                 <Target className="text-green-600" size={24} />
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-900">Buyer Matching</h2>
//                 <p className="text-gray-600 mt-1">{property.title} - Find perfect buyers</p>
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

//         <div className="p-6 max-h-[75vh] overflow-y-auto">
//           {/* Property Summary */}
//           <div className="bg-blue-50 rounded-xl p-4 mb-6">
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//               <div>
//                 <div className="text-sm text-blue-600">Property</div>
//                 <div className="font-bold text-blue-900">{property.title}</div>
//               </div>
//               <div>
//                 <div className="text-sm text-blue-600">Location</div>
//                 <div className="font-bold text-blue-900">{property.location}, {property.city}</div>
//               </div>
//               <div>
//                 <div className="text-sm text-blue-600">Type</div>
//                 <div className="font-bold text-blue-900">{property.unitType} • {property.carpetArea} sq ft</div>
//               </div>
//               <div>
//                 <div className="text-sm text-blue-600">Price</div>
//                 <div className="font-bold text-blue-900">{formatCurrency(property.budget)}</div>
//               </div>
//             </div>
//           </div>

//           {/* Search and Actions */}
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center space-x-4 flex-1">
//               <div className="relative flex-1 max-w-md">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
//                 <input
//                   type="text"
//                   placeholder="Search buyers..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 />
//               </div>
//               <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
//                 <Filter size={16} />
//                 <span>Filters</span>
//               </button>
//             </div>
            
//             {selectedBuyers.length > 0 && (
//               <button
//                 onClick={handleSendToSelectedBuyers}
//                 className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//               >
//                 <Send size={16} />
//                 <span>Send to {selectedBuyers.length} Buyers</span>
//               </button>
//             )}
//           </div>

//           {/* Matching Statistics */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//             <div className="bg-green-50 rounded-xl p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-green-600">Perfect Match</p>
//                   <p className="text-2xl font-bold text-green-900">{filteredBuyers.filter(b => b.matchScore >= 90).length}</p>
//                 </div>
//                 <Target className="text-green-600" size={24} />
//               </div>
//             </div>
//             <div className="bg-blue-50 rounded-xl p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-blue-600">Good Match</p>
//                   <p className="text-2xl font-bold text-blue-900">{filteredBuyers.filter(b => b.matchScore >= 80 && b.matchScore < 90).length}</p>
//                 </div>
//                 <Star className="text-blue-600" size={24} />
//               </div>
//             </div>
//             <div className="bg-orange-50 rounded-xl p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-orange-600">Potential Match</p>
//                   <p className="text-2xl font-bold text-orange-900">{filteredBuyers.filter(b => b.matchScore >= 70 && b.matchScore < 80).length}</p>
//                 </div>
//                 <Users className="text-orange-600" size={24} />
//               </div>
//             </div>
//             <div className="bg-purple-50 rounded-xl p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-purple-600">Total Buyers</p>
//                   <p className="text-2xl font-bold text-purple-900">{filteredBuyers.length}</p>
//                 </div>
//                 <UserPlus className="text-purple-600" size={24} />
//               </div>
//             </div>
//           </div>

//           {/* Buyers List */}
//           <div className="space-y-4">
//             <div className="flex items-center justify-between">
//               <h3 className="text-lg font-semibold text-gray-900">Matched Buyers</h3>
//               <button
//                 onClick={handleSelectAll}
//                 className="text-sm text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 {selectedBuyers.length === filteredBuyers.length ? 'Deselect All' : 'Select All'}
//               </button>
//             </div>
            
//             {filteredBuyers.map((buyer) => (
//               <div key={buyer.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
//                 <div className="flex items-start space-x-4">
//                   <input
//                     type="checkbox"
//                     checked={selectedBuyers.includes(buyer.id)}
//                     onChange={() => handleBuyerSelection(buyer.id)}
//                     className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                   />
                  
//                   <div className="flex-1">
//                     <div className="flex items-start justify-between mb-3">
//                       <div>
//                         <h4 className="font-semibold text-gray-900 text-lg">{buyer.name}</h4>
//                         <div className="flex items-center space-x-3 mt-1">
//                           {getBuyerStatusBadge(buyer.status)}
//                           <div className={`px-3 py-1 rounded-full text-sm font-bold ${getMatchScoreColor(buyer.matchScore)}`}>
//                             {buyer.matchScore}% Match
//                           </div>
//                         </div>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <button
//                           onClick={() => handleWhatsApp(buyer)}
//                           className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
//                           title="WhatsApp"
//                         >
//                           <MessageCircle size={16} />
//                         </button>
//                         <button
//                           onClick={() => handleEmail(buyer)}
//                           className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
//                           title="Email"
//                         >
//                           <Mail size={16} />
//                         </button>
//                         <button className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors">
//                           <Phone size={16} />
//                         </button>
//                       </div>
//                     </div>
                    
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
//                       <div>
//                         <span className="text-sm text-gray-500">Budget Range:</span>
//                         <span className="font-medium ml-2 text-green-600">
//                           {formatCurrency(buyer.budget.min)} - {formatCurrency(buyer.budget.max)}
//                         </span>
//                       </div>
//                       <div>
//                         <span className="text-sm text-gray-500">Preferred Units</span>
//                         <span className="font-medium ml-2">{buyer.unitType} {buyer.propertyType}</span>
//                       </div>
//                       <div>
//                         <span className="text-sm text-gray-500">Contact:</span>
//                         <span className="font-medium ml-2">{buyer.phone}</span>
//                       </div>
//                       <div>
//                         <span className="text-sm text-gray-500">Source:</span>
//                         <span className="font-medium ml-2">{buyer.source}</span>
//                       </div>
//                     </div>
                    
//                     <div className="mb-3">
//                       <span className="text-sm text-gray-500">Preferred Locations:</span>
//                       <div className="flex flex-wrap gap-1 mt-1">
//                         {buyer.preferredLocation.map((location, index) => (
//                           <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
//                             {location}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
                    
//                     <div className="mb-3">
//                       <span className="text-sm text-gray-500">Requirements:</span>
//                       <div className="flex flex-wrap gap-1 mt-1">
//                         {buyer.requirements.map((req, index) => (
//                           <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
//                             {req}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center justify-between text-sm text-gray-600">
//                       <div className="flex items-center space-x-4">
//                         <span>Last Contact: {buyer.lastContact}</span>
//                         <span>Visits: {buyer.visitHistory}</span>
//                       </div>
//                       <div className="text-right">
//                         <div className="font-medium text-gray-900">{buyer.feedback}</div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="p-6 border-t border-gray-200 bg-gray-50">
//           <div className="flex items-center justify-between">
//             <div className="text-sm text-gray-500">
//               {filteredBuyers.length} buyers found • {selectedBuyers.length} selected
//             </div>
//             <div className="flex items-center space-x-3">
//               <button
//                 onClick={onClose}
//                 className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//               >
//                 Close
//               </button>
//               {selectedBuyers.length > 0 && (
//                 <button
//                   onClick={handleSendToSelectedBuyers}
//                   className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                 >
//                   <Send size={16} />
//                   <span>Send to {selectedBuyers.length} Buyers</span>
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BuyerMatchingModal;


import React, { useState } from 'react';
import { X, Users, Target, Search, Filter, Star, Phone, MessageCircle, Mail, MapPin, DollarSign, Calendar, Eye, Send, UserPlus, ChevronDown, ChevronUp } from 'lucide-react';

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

const BuyerMatchingModal = ({ isOpen, onClose, property }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuyers, setSelectedBuyers] = useState<number[]>([]);
  const [expandedBuyer, setExpandedBuyer] = useState<number | null>(null);

  if (!isOpen || !property) return null;

  const buyers = [
    {
      id: 1,
      name: 'Amit Patel',
      phone: '+91 98765 11111',
      email: 'amit.patel@email.com',
      budget: { min: 22000000, max: 26000000 },
      preferredLocation: ['Andheri West', 'Bandra West', 'Juhu'],
      propertyType: 'Apartment',
      unitType: '3BHK',
      requirements: ['Ready to move', 'Good parking', 'Near metro'],
      matchScore: 95,
      status: 'hot_lead',
      lastContact: '2025-01-10',
      source: 'Website',
      visitHistory: 2,
      feedback: 'Very interested, looking for immediate purchase'
    },
    {
      id: 2,
      name: 'Priya Shah',
      phone: '+91 98765 22222',
      email: 'priya.shah@email.com',
      budget: { min: 20000000, max: 24000000 },
      preferredLocation: ['Andheri West', 'Versova', 'Oshiwara'],
      propertyType: 'Apartment',
      unitType: '2BHK',
      requirements: ['Good amenities', 'Security', 'Parking'],
      matchScore: 87,
      status: 'warm_lead',
      lastContact: '2025-01-08',
      source: 'Referral',
      visitHistory: 1,
      feedback: 'Interested but needs family approval'
    },
    {
      id: 3,
      name: 'Rohit Gupta',
      phone: '+91 98765 33333',
      email: 'rohit.gupta@email.com',
      budget: { min: 24000000, max: 28000000 },
      preferredLocation: ['Andheri West', 'Malad West', 'Goregaon West'],
      propertyType: 'Apartment',
      unitType: '3BHK',
      requirements: ['Investment purpose', 'Good rental yield', 'Branded builder'],
      matchScore: 92,
      status: 'hot_lead',
      lastContact: '2025-01-12',
      source: 'Social Media',
      visitHistory: 0,
      feedback: 'Looking for investment property'
    },
    {
      id: 4,
      name: 'Neha Sharma',
      phone: '+91 98765 44444',
      email: 'neha.sharma@email.com',
      budget: { min: 18000000, max: 22000000 },
      preferredLocation: ['Andheri East', 'Powai', 'Vikhroli'],
      propertyType: 'Apartment',
      unitType: '2BHK',
      requirements: ['First home', 'Good connectivity', 'Family-friendly'],
      matchScore: 78,
      status: 'warm_lead',
      lastContact: '2025-01-09',
      source: 'Advertisement',
      visitHistory: 1,
      feedback: 'Budget constraints, looking for better deals'
    }
  ];

  const filteredBuyers = buyers.filter(buyer =>
    buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buyer.phone.includes(searchTerm) ||
    buyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buyer.requirements.some(req => req.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => b.matchScore - a.matchScore);

  const handleBuyerSelection = (buyerId: number) => {
    setSelectedBuyers(prev => 
      prev.includes(buyerId) 
        ? prev.filter(id => id !== buyerId)
        : [...prev, buyerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBuyers.length === filteredBuyers.length) {
      setSelectedBuyers([]);
    } else {
      setSelectedBuyers(filteredBuyers.map(b => b.id));
    }
  };

  const handleSendToSelectedBuyers = () => {
    if (selectedBuyers.length === 0) {
      alert('Please select buyers to send property details');
      return;
    }
    alert(`Property details sent to ${selectedBuyers.length} buyer${selectedBuyers.length > 1 ? 's' : ''}`);
    setSelectedBuyers([]);
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-700';
    if (score >= 80) return 'bg-blue-100 text-blue-700';
    if (score >= 70) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  const getBuyerStatusBadge = (status: string) => {
    const statusConfig = {
      'hot_lead': { bg: 'bg-red-100', text: 'text-red-700', label: 'Hot', icon: '🔥' },
      'warm_lead': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Warm', icon: '⚡' },
      'cold_lead': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Cold', icon: '❄️' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.cold_lead;
    return (
      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium ${config.bg} ${config.text}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const handleWhatsApp = (buyer: any) => {
    const message = `Hi ${buyer.name}, I have a perfect property match for you!\n\n🏠 ${property.title}\n📍 ${property.location}, ${property.city}\n💰 ${formatCurrency(property.budget)}\n🏢 ${property.unitType} • ${property.carpetArea} sq ft\n\nWould you like to schedule a visit?\n\nBest regards,\nResaleExpert Team`;
    const whatsappUrl = `https://wa.me/${buyer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmail = (buyer: any) => {
    const subject = `Perfect Property Match - ${property.title}`;
    const body = `Dear ${buyer.name},\n\nWe have found a perfect property match based on your requirements:\n\nProperty: ${property.title}\nLocation: ${property.location}, ${property.city}\nPrice: ${formatCurrency(property.budget)}\nType: ${property.unitType}\nArea: ${property.carpetArea} sq ft\n\nThis property matches ${buyers.find(b => b.id === buyer.id)?.matchScore}% of your requirements.\n\nWould you like to schedule a visit?\n\nBest regards,\nResaleExpert Team`;
    const mailtoUrl = `mailto:${buyer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
  };

  // Stat Card Component
  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="rounded-lg p-2 transition-all hover:shadow-sm" style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[8px] font-medium uppercase tracking-wider" style={{ color }}>{label}</p>
          <p className="text-sm font-bold mt-0.5" style={{ color: N }}>{value}</p>
        </div>
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon size={12} style={{ color }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }}>
        
        {/* Header */}
        <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: N }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ background: `${O}20` }}>
              <Target size={14} style={{ color: O }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Buyer Matching</h2>
              <p className="text-[9px] text-white/70">{property?.title} - Find perfect buyers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors text-white">
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Property Summary - Compact */}
          <div className="rounded-lg p-2" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div>
                <p className="text-[8px] font-medium" style={{ color: O }}>Property</p>
                <p className="font-semibold truncate text-[11px]" style={{ color: N }}>{property?.title}</p>
              </div>
              <div>
                <p className="text-[8px] font-medium" style={{ color: O }}>Location</p>
                <p className="font-semibold truncate text-[11px]" style={{ color: N }}>{property?.location}, {property?.city}</p>
              </div>
              <div>
                <p className="text-[8px] font-medium" style={{ color: O }}>Type</p>
                <p className="font-semibold truncate text-[11px]" style={{ color: N }}>{property?.unitType} • {property?.carpetArea} sq ft</p>
              </div>
              <div>
                <p className="text-[8px] font-medium" style={{ color: O }}>Price</p>
                <p className="font-semibold truncate text-[11px]" style={{ color: N }}>{formatCurrency(property?.budget)}</p>
              </div>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: MU }} />
              <input
                type="text"
                placeholder="Search buyers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-2 py-1.5 text-[11px] border rounded-lg focus:outline-none focus:ring-1"
                style={{ borderColor: BD }}
              />
            </div>
            <button className="px-2 py-1.5 text-[11px] border rounded-lg hover:bg-gray-50 flex items-center gap-1" style={{ borderColor: BD, color: MU }}>
              <Filter size={11} /> <span>Filter</span>
            </button>
          </div>

          {/* Stats Cards - Compact */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <StatCard icon={Target} label="Perfect Match" value={filteredBuyers.filter(b => b.matchScore >= 90).length} color="#10b981" />
            <StatCard icon={Star} label="Good Match" value={filteredBuyers.filter(b => b.matchScore >= 80 && b.matchScore < 90).length} color="#3b82f6" />
            <StatCard icon={Users} label="Potential" value={filteredBuyers.filter(b => b.matchScore >= 70 && b.matchScore < 80).length} color={O} />
            <StatCard icon={UserPlus} label="Total" value={filteredBuyers.length} color="#8b5cf6" />
          </div>

          {/* Buyers List Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-semibold" style={{ color: N }}>Matched Buyers</h3>
            <div className="flex items-center gap-2">
              {selectedBuyers.length > 0 && (
                <button
                  onClick={handleSendToSelectedBuyers}
                  className="px-2 py-0.5 text-[9px] rounded text-white flex items-center gap-1 transition-all hover:opacity-90"
                  style={{ background: O }}
                >
                  <Send size={9} />
                  <span>Send to {selectedBuyers.length} Buyer</span>
                </button>
              )}
              <button onClick={handleSelectAll} className="text-[9px] font-medium" style={{ color: O }}>
                {selectedBuyers.length === filteredBuyers.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          {/* Buyers List - Compact Cards */}
          <div className="space-y-2 max-h-[38vh] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {filteredBuyers.map((buyer) => (
              <div 
                key={buyer.id} 
                className={`rounded-lg p-2 transition-all hover:shadow-sm ${selectedBuyers.includes(buyer.id) ? 'ring-1' : ''}`} 
                style={{ 
                  border: `1px solid ${BD}`, 
                  background: selectedBuyers.includes(buyer.id) ? `${O}05` : BG,
                  ringColor: O
                }}
              >
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={selectedBuyers.includes(buyer.id)}
                    onChange={() => handleBuyerSelection(buyer.id)}
                    className="mt-0.5 rounded w-3 h-3 flex-shrink-0" 
                    style={{ accentColor: O }}
                  />
                  
                  <div className="flex-1 min-w-0">
                    {/* Row 1: Name and Status */}
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-[11px] font-semibold" style={{ color: N }}>{buyer.name}</h4>
                        {getBuyerStatusBadge(buyer.status)}
                        <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold ${getMatchScoreColor(buyer.matchScore)}`}>
                          {buyer.matchScore}% Match
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleWhatsApp(buyer)} className="p-0.5 rounded hover:bg-gray-100" style={{ color: '#25D366' }}>
                          <MessageCircle size={10} />
                        </button>
                        <button onClick={() => handleEmail(buyer)} className="p-0.5 rounded hover:bg-gray-100" style={{ color: '#EA4335' }}>
                          <Mail size={10} />
                        </button>
                        <button className="p-0.5 rounded hover:bg-gray-100" style={{ color: N }}>
                          <Phone size={10} />
                        </button>
                        <button 
                          onClick={() => setExpandedBuyer(expandedBuyer === buyer.id ? null : buyer.id)} 
                          className="p-0.5 rounded hover:bg-gray-100"
                        >
                          {expandedBuyer === buyer.id ? <ChevronUp size={10} style={{ color: MU }} /> : <ChevronDown size={10} style={{ color: MU }} />}
                        </button>
                      </div>
                    </div>

                    {/* Row 2: Budget and Contact - Always visible */}
                    <div className="flex flex-wrap items-center gap-2 text-[9px] mb-1" style={{ color: MU }}>
                      <span className="flex items-center gap-0.5"><DollarSign size={8} />{formatCurrency(buyer.budget.min)} - {formatCurrency(buyer.budget.max)}</span>
                      <span className="flex items-center gap-0.5"><Phone size={8} />{buyer.phone}</span>
                    </div>

                    {/* Row 3: Preferred Units and Source */}
                    <div className="flex flex-wrap items-center gap-2 text-[8px] mb-1" style={{ color: MU }}>
                      <span>{buyer.unitType} {buyer.propertyType}</span>
                      <span>•</span>
                      <span>Source: {buyer.source}</span>
                      <span>•</span>
                      <span>Last: {buyer.lastContact}</span>
                      <span>•</span>
                      <span>Visits: {buyer.visitHistory}</span>
                    </div>

                    {/* Expanded Details - Shows more info when expanded */}
                    {expandedBuyer === buyer.id && (
                      <div className="mt-2 pt-1.5 border-t" style={{ borderColor: BD }}>
                        <div className="mb-1.5">
                          <p className="text-[8px] font-medium mb-0.5" style={{ color: MU }}>📍 Preferred Locations:</p>
                          <div className="flex flex-wrap gap-1">
                            {buyer.preferredLocation.map((loc, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded text-[8px]" style={{ background: `${O}10`, color: O }}>{loc}</span>
                            ))}
                          </div>
                        </div>
                        <div className="mb-1.5">
                          <p className="text-[8px] font-medium mb-0.5" style={{ color: MU }}>📋 Requirements:</p>
                          <div className="flex flex-wrap gap-1">
                            {buyer.requirements.map((req, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 rounded text-[8px]" style={{ background: `${N}10`, color: N }}>{req}</span>
                            ))}
                          </div>
                        </div>
                        {buyer.feedback && (
                          <div className="text-[8px] italic mt-1 p-1.5 rounded" style={{ background: `${O}10`, color: O }}>
                            💬 "{buyer.feedback}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-2 border-t flex items-center justify-between" style={{ borderColor: BD, background: BG }}>
          <div className="text-[9px]" style={{ color: MU }}>
            {filteredBuyers.length} buyer{filteredBuyers.length !== 1 ? 's' : ''} • {selectedBuyers.length} selected
          </div>
          <div className="flex gap-1.5">
            <button onClick={onClose} className="px-2 py-1 text-[10px] border rounded transition-colors hover:bg-gray-50" style={{ borderColor: BD, color: N }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerMatchingModal;