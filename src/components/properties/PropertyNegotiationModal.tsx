// import React, { useState } from 'react';
// import { X, Save, Target, DollarSign, User, Calendar, MessageCircle, Phone, Mail, TrendingUp, TrendingDown } from 'lucide-react';

// const PropertyNegotiationModal = ({ isOpen, onClose, property }: any) => {
//   const [formData, setFormData] = useState({
//     buyerName: '',
//     buyerPhone: '',
//     buyerEmail: '',
//     initialOffer: 0,
//     counterOffer: 0,
//     finalPrice: 0,
//     negotiationStage: 'initial_offer',
//     paymentTerms: '',
//     possessionDate: '',
//     conditions: '',
//     brokerageTerms: '',
//     remarks: ''
//   });

//   const [negotiationHistory, setNegotiationHistory] = useState([
//     {
//       id: 1,
//       date: '2025-01-10',
//       action: 'Initial Offer',
//       amount: 23000000,
//       party: 'Buyer',
//       remarks: 'First offer submitted',
//       status: 'received'
//     },
//     {
//       id: 2,
//       date: '2025-01-11',
//       action: 'Counter Offer',
//       amount: 24500000,
//       party: 'Seller',
//       remarks: 'Counter offer with minor adjustment',
//       status: 'sent'
//     }
//   ]);

//   const [isSubmitting, setIsSubmitting] = useState(false);

//   if (!isOpen) return null;

//   const negotiationStages = [
//     { value: 'initial_offer', label: 'Initial Offer', description: 'First offer from buyer' },
//     { value: 'counter_offer', label: 'Counter Offer', description: 'Seller counter proposal' },
//     { value: 'negotiation', label: 'Active Negotiation', description: 'Back and forth negotiation' },
//     { value: 'final_offer', label: 'Final Offer', description: 'Last and final offer' },
//     { value: 'accepted', label: 'Offer Accepted', description: 'Deal terms agreed' },
//     { value: 'rejected', label: 'Offer Rejected', description: 'Negotiation ended' }
//   ];

//   const paymentTermOptions = [
//     'Immediate payment',
//     '10% token, 90% on registration',
//     '20% token, 80% on registration',
//     '30% token, 70% on registration',
//     'Custom payment plan'
//   ];

//   const handleInputChange = (field: string, value: any) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//   };

//   const addNegotiationEntry = () => {
//     if (!formData.buyerName.trim() || !formData.initialOffer) {
//       alert('Please fill in buyer details and offer amount');
//       return;
//     }

//     const newEntry = {
//       id: Date.now(),
//       date: new Date().toISOString().split('T')[0],
//       action: 'New Negotiation',
//       amount: formData.initialOffer,
//       party: 'Buyer',
//       remarks: formData.remarks || 'New negotiation started',
//       status: 'active'
//     };

//     setNegotiationHistory(prev => [...prev, newEntry]);
//     alert('Negotiation entry added successfully!');
//   };

//   const handleSave = async () => {
//     if (!formData.buyerName.trim()) {
//       alert('Please enter buyer name');
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       const negotiationData = {
//         ...formData,
//         id: Date.now(),
//         propertyId: property.propertyId,
//         history: negotiationHistory,
//         created_at: new Date().toISOString()
//       };
//       alert('Negotiation details saved successfully!');
//       onClose();
//     } catch (error) {
//       console.error('Error saving negotiation:', error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const formatCurrency = (amount: number) => {
//     if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
//     if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
//     return `₹${amount.toLocaleString('en-IN')}`;
//   };

//   const sendNegotiationUpdate = (channel: string) => {
//     const message = `Negotiation Update - ${property.title}\n\nDear ${formData.buyerName},\n\nYour offer: ${formatCurrency(formData.initialOffer)}\nCounter offer: ${formatCurrency(formData.counterOffer)}\n\nProperty: ${property.title}\nLocation: ${property.location}, ${property.city}\n\nPlease review and respond.\n\nBest regards,\nResaleExpert Team`;

//     switch (channel) {
//       case 'whatsapp':
//         window.open(`https://wa.me/${formData.buyerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
//         break;
//       case 'email':
//         const subject = `Negotiation Update - ${property.title}`;
//         window.open(`mailto:${formData.buyerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`, '_blank');
//         break;
//       case 'sms':
//         alert('SMS functionality would be integrated with SMS gateway');
//         break;
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden">
//         {/* Header */}
//         <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900">Property Negotiation</h2>
//               <p className="text-gray-600 mt-1">{property.title} - Price Negotiation Management</p>
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
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {/* Left Column - Negotiation Details */}
//             <div className="space-y-6">
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Buyer Information</h3>
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Name</label>
//                     <input
//                       type="text"
//                       value={formData.buyerName}
//                       onChange={(e) => handleInputChange('buyerName', e.target.value)}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                       placeholder="Enter buyer name"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
//                     <input
//                       type="tel"
//                       value={formData.buyerPhone}
//                       onChange={(e) => handleInputChange('buyerPhone', e.target.value)}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                       placeholder="+91 98765 43210"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
//                     <input
//                       type="email"
//                       value={formData.buyerEmail}
//                       onChange={(e) => handleInputChange('buyerEmail', e.target.value)}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                       placeholder="buyer@email.com"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Negotiation Terms</h3>
//                 <div className="space-y-4">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Initial Offer (₹)</label>
//                       <input
//                         type="number"
//                         value={formData.initialOffer}
//                         onChange={(e) => handleInputChange('initialOffer', Number(e.target.value))}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                         placeholder="23000000"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Counter Offer (₹)</label>
//                       <input
//                         type="number"
//                         value={formData.counterOffer}
//                         onChange={(e) => handleInputChange('counterOffer', Number(e.target.value))}
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                         placeholder="24500000"
//                       />
//                     </div>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Negotiation Stage</label>
//                     <select
//                       value={formData.negotiationStage}
//                       onChange={(e) => handleInputChange('negotiationStage', e.target.value)}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                     >
//                       {negotiationStages.map((stage) => (
//                         <option key={stage.value} value={stage.value}>
//                           {stage.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
//                     <select
//                       value={formData.paymentTerms}
//                       onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                     >
//                       <option value="">Select payment terms</option>
//                       {paymentTermOptions.map((term) => (
//                         <option key={term} value={term}>
//                           {term}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Possession Date</label>
//                     <input
//                       type="date"
//                       value={formData.possessionDate}
//                       onChange={(e) => handleInputChange('possessionDate', e.target.value)}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Right Column - Negotiation History */}
//             <div className="space-y-6">
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Negotiation History</h3>
//                 <div className="space-y-3 max-h-64 overflow-y-auto">
//                   {negotiationHistory.map((entry) => (
//                     <div key={entry.id} className="bg-white border border-gray-200 rounded-lg p-4">
//                       <div className="flex items-center justify-between mb-2">
//                         <div className="flex items-center space-x-2">
//                           {entry.action.includes('Offer') ? (
//                             <Target className="text-blue-600" size={16} />
//                           ) : (
//                             <MessageCircle className="text-green-600" size={16} />
//                           )}
//                           <span className="font-medium text-gray-900">{entry.action}</span>
//                         </div>
//                         <span className="text-sm text-gray-500">{entry.date}</span>
//                       </div>
                      
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <div className="text-lg font-bold text-green-600">
//                             {formatCurrency(entry.amount)}
//                           </div>
//                           <div className="text-sm text-gray-600">by {entry.party}</div>
//                         </div>
//                         <div className="text-right">
//                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                             entry.status === 'accepted' ? 'bg-green-100 text-green-800' :
//                             entry.status === 'rejected' ? 'bg-red-100 text-red-800' :
//                             entry.status === 'active' ? 'bg-blue-100 text-blue-800' :
//                             'bg-orange-100 text-orange-800'
//                           }`}>
//                             {entry.status}
//                           </span>
//                         </div>
//                       </div>
                      
//                       <div className="text-sm text-gray-600 mt-2">{entry.remarks}</div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Price Comparison */}
//               <div className="bg-blue-50 rounded-xl p-4">
//                 <h4 className="font-semibold text-blue-900 mb-3">Price Analysis</h4>
//                 <div className="space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-blue-700">Asking Price:</span>
//                     <span className="font-bold text-blue-900">{formatCurrency(property.budget)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-blue-700">Negotiable Price:</span>
//                     <span className="font-bold text-blue-900">{formatCurrency(property.negotiablePrice || property.budget * 0.95)}</span>
//                   </div>
//                   {formData.initialOffer > 0 && (
//                     <div className="flex justify-between">
//                       <span className="text-blue-700">Buyer Offer:</span>
//                       <span className="font-bold text-green-600">{formatCurrency(formData.initialOffer)}</span>
//                     </div>
//                   )}
//                   {formData.counterOffer > 0 && (
//                     <div className="flex justify-between">
//                       <span className="text-blue-700">Counter Offer:</span>
//                       <span className="font-bold text-orange-600">{formatCurrency(formData.counterOffer)}</span>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Quick Actions */}
//               <div>
//                 <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
//                 <div className="grid grid-cols-1 gap-2">
//                   <button
//                     onClick={() => sendNegotiationUpdate('whatsapp')}
//                     className="flex items-center space-x-2 p-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
//                   >
//                     <MessageCircle size={16} />
//                     <span>Send WhatsApp Update</span>
//                   </button>
//                   <button
//                     onClick={() => sendNegotiationUpdate('email')}
//                     className="flex items-center space-x-2 p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
//                   >
//                     <Mail size={16} />
//                     <span>Send Email Update</span>
//                   </button>
//                   <button
//                     onClick={() => window.open(`tel:${formData.buyerPhone}`)}
//                     className="flex items-center space-x-2 p-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
//                   >
//                     <Phone size={16} />
//                     <span>Call Buyer</span>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Additional Terms */}
//           <div className="mt-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Terms & Conditions</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Special Conditions</label>
//                 <textarea
//                   value={formData.conditions}
//                   onChange={(e) => handleInputChange('conditions', e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                   rows={3}
//                   placeholder="Any special conditions or requirements..."
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Brokerage Terms</label>
//                 <textarea
//                   value={formData.brokerageTerms}
//                   onChange={(e) => handleInputChange('brokerageTerms', e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                   rows={3}
//                   placeholder="Brokerage payment terms and conditions..."
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="p-6 border-t border-gray-200 bg-gray-50">
//           <div className="flex items-center justify-between">
//             <div className="text-sm text-gray-500">
//               Negotiation will be tracked in property timeline
//             </div>
//             <div className="flex items-center space-x-3">
//               <button
//                 onClick={addNegotiationEntry}
//                 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//               >
//                 Add Entry
//               </button>
//               <button
//                 onClick={onClose}
//                 className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSave}
//                 disabled={isSubmitting || !formData.buyerName.trim()}
//                 className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <Save size={16} />
//                 <span>{isSubmitting ? 'Saving...' : 'Save Negotiation'}</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PropertyNegotiationModal;



import React, { useState } from 'react';
import { X, Save, Target, DollarSign, User, Calendar, MessageCircle, Phone, Mail, TrendingUp, TrendingDown } from 'lucide-react';

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

const PropertyNegotiationModal = ({ isOpen, onClose, property }: any) => {
  const [formData, setFormData] = useState({
    buyerName: '',
    buyerPhone: '',
    buyerEmail: '',
    initialOffer: 0,
    counterOffer: 0,
    finalPrice: 0,
    negotiationStage: 'initial_offer',
    paymentTerms: '',
    possessionDate: '',
    conditions: '',
    brokerageTerms: '',
    remarks: ''
  });

  const [negotiationHistory, setNegotiationHistory] = useState([
    {
      id: 1,
      date: '2025-01-10',
      action: 'Initial Offer',
      amount: 23000000,
      party: 'Buyer',
      remarks: 'First offer submitted',
      status: 'received'
    },
    {
      id: 2,
      date: '2025-01-11',
      action: 'Counter Offer',
      amount: 24500000,
      party: 'Seller',
      remarks: 'Counter offer with minor adjustment',
      status: 'sent'
    }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const negotiationStages = [
    { value: 'initial_offer', label: 'Initial Offer', description: 'First offer from buyer' },
    { value: 'counter_offer', label: 'Counter Offer', description: 'Seller counter proposal' },
    { value: 'negotiation', label: 'Active Negotiation', description: 'Back and forth negotiation' },
    { value: 'final_offer', label: 'Final Offer', description: 'Last and final offer' },
    { value: 'accepted', label: 'Offer Accepted', description: 'Deal terms agreed' },
    { value: 'rejected', label: 'Offer Rejected', description: 'Negotiation ended' }
  ];

  const paymentTermOptions = [
    'Immediate payment',
    '10% token, 90% on registration',
    '20% token, 80% on registration',
    '30% token, 70% on registration',
    'Custom payment plan'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addNegotiationEntry = () => {
    if (!formData.buyerName.trim() || !formData.initialOffer) {
      alert('Please fill in buyer details and offer amount');
      return;
    }

    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      action: 'New Negotiation',
      amount: formData.initialOffer,
      party: 'Buyer',
      remarks: formData.remarks || 'New negotiation started',
      status: 'active'
    };

    setNegotiationHistory(prev => [...prev, newEntry]);
    alert('Negotiation entry added successfully!');
  };

  const handleSave = async () => {
    if (!formData.buyerName.trim()) {
      alert('Please enter buyer name');
      return;
    }

    setIsSubmitting(true);
    try {
      const negotiationData = {
        ...formData,
        id: Date.now(),
        propertyId: property.propertyId,
        history: negotiationHistory,
        created_at: new Date().toISOString()
      };
      alert('Negotiation details saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving negotiation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const sendNegotiationUpdate = (channel: string) => {
    const message = `Negotiation Update - ${property.title}\n\nDear ${formData.buyerName},\n\nYour offer: ${formatCurrency(formData.initialOffer)}\nCounter offer: ${formatCurrency(formData.counterOffer)}\n\nProperty: ${property.title}\nLocation: ${property.location}, ${property.city}\n\nPlease review and respond.\n\nBest regards,\nResaleExpert Team`;

    switch (channel) {
      case 'whatsapp':
        window.open(`https://wa.me/${formData.buyerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'email':
        const subject = `Negotiation Update - ${property.title}`;
        window.open(`mailto:${formData.buyerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'sms':
        alert('SMS functionality would be integrated with SMS gateway');
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }}>
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between" style={{ background: N }}>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg" style={{ background: `${O}20` }}>
              <Target size={16} className="sm:w-5 sm:h-5" style={{ color: O }} />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-bold text-white">Property Negotiation</h2>
              <p className="text-[10px] sm:text-xs text-white/70">{property?.title} - Price Negotiation</p>
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
                <p className="text-[9px] sm:text-xs font-medium" style={{ color: O }}>Price</p>
                <p className="text-[11px] sm:text-sm font-semibold truncate" style={{ color: N }}>{formatCurrency(property?.budget)}</p>
              </div>
              <div>
                <p className="text-[9px] sm:text-xs font-medium" style={{ color: O }}>Negotiable</p>
                <p className="text-[11px] sm:text-sm font-semibold truncate" style={{ color: N }}>{formatCurrency(property?.negotiablePrice || property?.budget * 0.95)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Left Column - Negotiation Details */}
            <div className="space-y-4 sm:space-y-6">
              {/* Buyer Information */}
              <div>
                <h3 className="text-[11px] sm:text-sm font-semibold mb-2 sm:mb-3" style={{ color: N }}>Buyer Information</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <label className="block text-[9px] sm:text-xs font-medium mb-0.5" style={{ color: MU }}>Buyer Name</label>
                    <input
                      type="text"
                      value={formData.buyerName}
                      onChange={(e) => handleInputChange('buyerName', e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm border rounded-lg focus:outline-none focus:ring-1"
                      style={{ borderColor: BD }}
                      placeholder="Enter buyer name"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] sm:text-xs font-medium mb-0.5" style={{ color: MU }}>Phone Number</label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={formData.buyerPhone}
                        onChange={(e) => handleInputChange('buyerPhone', e.target.value)}
                        className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm border rounded-lg focus:outline-none focus:ring-1"
                        style={{ borderColor: BD }}
                        maxLength={10}
                        placeholder="+91 98765 43210"
                      />
                      {formData.buyerPhone && (
                        <button
                          onClick={() => window.open(`tel:${formData.buyerPhone}`)}
                          className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-white transition-all hover:opacity-90"
                          style={{ background: O }}
                        >
                          <Phone size={14} className="sm:w-4 sm:h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] sm:text-xs font-medium mb-0.5" style={{ color: MU }}>Email Address</label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={formData.buyerEmail}
                        onChange={(e) => handleInputChange('buyerEmail', e.target.value)}
                        className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm border rounded-lg focus:outline-none focus:ring-1"
                        style={{ borderColor: BD }}
                        placeholder="buyer@email.com"
                      />
                      {formData.buyerEmail && (
                        <button
                          onClick={() => sendNegotiationUpdate('email')}
                          className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-white transition-all hover:opacity-90"
                          style={{ background: O }}
                        >
                          <Mail size={14} className="sm:w-4 sm:h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Negotiation Terms */}
              <div>
                <h3 className="text-[11px] sm:text-sm font-semibold mb-2 sm:mb-3" style={{ color: N }}>Negotiation Terms</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div>
                      <label className="block text-[9px] sm:text-xs font-medium mb-0.5" style={{ color: MU }}>Initial Offer (₹)</label>
                      <input
                        type="number"
                        value={formData.initialOffer}
                        onChange={(e) => handleInputChange('initialOffer', Number(e.target.value))}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm border rounded-lg focus:outline-none focus:ring-1"
                        style={{ borderColor: BD }}
                        placeholder="23000000"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] sm:text-xs font-medium mb-0.5" style={{ color: MU }}>Counter Offer (₹)</label>
                      <input
                        type="number"
                        value={formData.counterOffer}
                        onChange={(e) => handleInputChange('counterOffer', Number(e.target.value))}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm border rounded-lg focus:outline-none focus:ring-1"
                        style={{ borderColor: BD }}
                        placeholder="24500000"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[9px] sm:text-xs font-medium mb-0.5" style={{ color: MU }}>Negotiation Stage</label>
                    <select
                      value={formData.negotiationStage}
                      onChange={(e) => handleInputChange('negotiationStage', e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm border rounded-lg focus:outline-none focus:ring-1"
                      style={{ borderColor: BD }}
                    >
                      {negotiationStages.map((stage) => (
                        <option key={stage.value} value={stage.value}>
                          {stage.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[9px] sm:text-xs font-medium mb-0.5" style={{ color: MU }}>Payment Terms</label>
                    <select
                      value={formData.paymentTerms}
                      onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm border rounded-lg focus:outline-none focus:ring-1"
                      style={{ borderColor: BD }}
                    >
                      <option value="">Select payment terms</option>
                      {paymentTermOptions.map((term) => (
                        <option key={term} value={term}>{term}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[9px] sm:text-xs font-medium mb-0.5" style={{ color: MU }}>Possession Date</label>
                    <input
                      type="date"
                      value={formData.possessionDate}
                      onChange={(e) => handleInputChange('possessionDate', e.target.value)}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm border rounded-lg focus:outline-none focus:ring-1"
                      style={{ borderColor: BD }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Negotiation History */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-[11px] sm:text-sm font-semibold mb-2 sm:mb-3" style={{ color: N }}>Negotiation History</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                  {negotiationHistory.map((entry) => (
                    <div key={entry.id} className="p-2 sm:p-3 rounded-lg" style={{ background: BG, border: `1px solid ${BD}` }}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Target size={12} className="sm:w-3 sm:h-3" style={{ color: O }} />
                          <span className="text-[11px] sm:text-sm font-medium" style={{ color: N }}>{entry.action}</span>
                        </div>
                        <span className="text-[8px] sm:text-xs" style={{ color: MU }}>{entry.date}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <div>
                          <div className="text-sm sm:text-base font-bold" style={{ color: O }}>
                            {formatCurrency(entry.amount)}
                          </div>
                          <div className="text-[8px] sm:text-xs" style={{ color: MU }}>by {entry.party}</div>
                        </div>
                        <div>
                          <span className={`px-1.5 py-0.5 rounded-full text-[7px] sm:text-[10px] font-medium ${
                            entry.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            entry.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            entry.status === 'active' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {entry.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-[8px] sm:text-xs mt-1" style={{ color: MU }}>{entry.remarks}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Analysis */}
              <div className="rounded-lg p-3 sm:p-4" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
                <h4 className="text-[11px] sm:text-sm font-semibold mb-2 sm:mb-3" style={{ color: O }}>Price Analysis</h4>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex justify-between text-[10px] sm:text-sm">
                    <span style={{ color: MU }}>Asking Price:</span>
                    <span className="font-semibold" style={{ color: N }}>{formatCurrency(property.budget)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] sm:text-sm">
                    <span style={{ color: MU }}>Negotiable Price:</span>
                    <span className="font-semibold" style={{ color: N }}>{formatCurrency(property.negotiablePrice || property.budget * 0.95)}</span>
                  </div>
                  {formData.initialOffer > 0 && (
                    <div className="flex justify-between text-[10px] sm:text-sm">
                      <span style={{ color: MU }}>Buyer Offer:</span>
                      <span className="font-semibold" style={{ color: O }}>{formatCurrency(formData.initialOffer)}</span>
                    </div>
                  )}
                  {formData.counterOffer > 0 && (
                    <div className="flex justify-between text-[10px] sm:text-sm">
                      <span style={{ color: MU }}>Counter Offer:</span>
                      <span className="font-semibold" style={{ color: O }}>{formatCurrency(formData.counterOffer)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h4 className="text-[11px] sm:text-sm font-semibold mb-2 sm:mb-3" style={{ color: N }}>Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => sendNegotiationUpdate('whatsapp')}
                    disabled={!formData.buyerPhone}
                    className="flex items-center justify-center gap-1.5 p-2 sm:p-3 rounded-lg text-[10px] sm:text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: '#25D366', color: 'white' }}
                  >
                    <MessageCircle size={14} className="sm:w-4 sm:h-4" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => sendNegotiationUpdate('email')}
                    disabled={!formData.buyerEmail}
                    className="flex items-center justify-center gap-1.5 p-2 sm:p-3 rounded-lg text-[10px] sm:text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: '#3b82f6', color: 'white' }}
                  >
                    <Mail size={14} className="sm:w-4 sm:h-4" />
                    <span>Email</span>
                  </button>
                  <button
                    onClick={() => window.open(`tel:${formData.buyerPhone}`)}
                    disabled={!formData.buyerPhone}
                    className="flex items-center justify-center gap-1.5 p-2 sm:p-3 rounded-lg text-[10px] sm:text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ background: '#8b5cf6', color: 'white' }}
                  >
                    <Phone size={14} className="sm:w-4 sm:h-4" />
                    <span>Call</span>
                  </button>
                  <button
                    onClick={addNegotiationEntry}
                    className="flex items-center justify-center gap-1.5 p-2 sm:p-3 rounded-lg text-[10px] sm:text-sm font-medium transition-all hover:opacity-90"
                    style={{ background: O, color: 'white' }}
                  >
                    <Target size={14} className="sm:w-4 sm:h-4" />
                    <span>Add Entry</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Terms */}
          <div>
            <h3 className="text-[11px] sm:text-sm font-semibold mb-2 sm:mb-3" style={{ color: N }}>Additional Terms & Conditions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-[9px] sm:text-xs font-medium mb-0.5" style={{ color: MU }}>Special Conditions</label>
                <textarea
                  value={formData.conditions}
                  onChange={(e) => handleInputChange('conditions', e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm border rounded-lg focus:outline-none focus:ring-1 resize-none"
                  style={{ borderColor: BD }}
                  rows={3}
                  placeholder="Any special conditions or requirements..."
                />
              </div>
              <div>
                <label className="block text-[9px] sm:text-xs font-medium mb-0.5" style={{ color: MU }}>Brokerage Terms</label>
                <textarea
                  value={formData.brokerageTerms}
                  onChange={(e) => handleInputChange('brokerageTerms', e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-sm border rounded-lg focus:outline-none focus:ring-1 resize-none"
                  style={{ borderColor: BD }}
                  rows={3}
                  placeholder="Brokerage payment terms and conditions..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 sm:px-6 py-2 sm:py-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" style={{ borderColor: BD, background: BG }}>
          <div className="text-[9px] sm:text-sm" style={{ color: MU }}>
            Negotiation will be tracked in property timeline
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button onClick={onClose} className="px-2 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-sm border rounded transition-colors hover:bg-gray-50" style={{ borderColor: BD, color: N }}>
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting || !formData.buyerName.trim()}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-sm rounded text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: O }}
            >
              <Save size={12} className="sm:w-4 sm:h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Negotiation'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyNegotiationModal;