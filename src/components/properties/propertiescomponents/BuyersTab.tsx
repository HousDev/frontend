// import React from 'react';
// import { Users, MessageCircle, Phone, User } from 'lucide-react';

// interface BuyersTabProps {
//   property: any;
//   onMatchBuyers: () => void;
// }

// const BuyersTab: React.FC<BuyersTabProps> = ({
//   property,
//   onMatchBuyers
// }) => {
//   const formatINRShort = (amount: number | string) => {
//     const num = Number(amount);
//     if (!num && num !== 0) return '-';
//     if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
//     if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
//     return `₹${num.toLocaleString('en-IN')}`;
//   };

//   return (
//     <div className="space-y-6">
//       {/* Buyer Matching */}
//       <div className="bg-white rounded-xl border border-gray-200 p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-semibold text-gray-900">Buyer Matching</h3>
//           <button
//             onClick={onMatchBuyers}
//             className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
//           >
//             Find Matching Buyers
//           </button>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="text-center p-4 bg-green-50 rounded-lg">
//             <div className="text-2xl font-bold text-green-600">{property.interestedBuyers || 0}</div>
//             <div className="text-sm text-green-700">Interested Buyers</div>
//           </div>
//           <div className="text-center p-4 bg-red-50 rounded-lg">
//             <div className="text-2xl font-bold text-red-600">{property.hotLeads || 0}</div>
//             <div className="text-sm text-red-700">Hot Leads</div>
//           </div>
//           <div className="text-center p-4 bg-blue-50 rounded-lg">
//             <div className="text-2xl font-bold text-blue-600">{property.visits || 0}</div>
//             <div className="text-sm text-blue-700">Property Visits</div>
//           </div>
//         </div>
//       </div>

//       {/* Matched Buyers */}
//       <div className="bg-white rounded-xl border border-gray-200 p-6">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Matched Buyers</h3>
//         <div className="space-y-3">
//           {property.matchedBuyers?.map((buyer: any, index: number) => (
//             <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//               <div className="flex items-center space-x-3">
//                 <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
//                   <User className="text-blue-600" size={16} />
//                 </div>
//                 <div>
//                   <div className="font-medium text-gray-900">{buyer.name}</div>
//                   <div className="text-sm text-gray-600">Budget: {formatINRShort(buyer.budget)} • {buyer.matchScore}% match</div>
//                 </div>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <button className="p-2 text-green-600 hover:bg-green-100 rounded">
//                   <MessageCircle size={16} />
//                 </button>
//                 <button className="p-2 text-blue-600 hover:bg-blue-100 rounded">
//                   <Phone size={16} />
//                 </button>
//               </div>
//             </div>
//           )) || (
//               <div className="text-center py-8 text-gray-500">
//                 <Users className="mx-auto mb-2" size={32} />
//                 <p>No matched buyers yet</p>
//               </div>
//             )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BuyersTab;

import React from 'react';
import { Users, MessageCircle, Phone, User, Target, Eye, Flame } from 'lucide-react';

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

interface BuyersTabProps {
  property: any;
  onMatchBuyers: () => void;
}

const BuyersTab: React.FC<BuyersTabProps> = ({
  property,
  onMatchBuyers
}) => {
  const formatINRShort = (amount: number | string) => {
    const num = Number(amount);
    if (!num && num !== 0) return '-';
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-3">
      {/* Buyer Matching Section */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: BD }}>
        <div className="p-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
          <div className="flex flex-row items-center justify-between sm:flex-row sm:items-center sm:justify-between gap-2">
  <h3 className="text-[11px] font-semibold" style={{ color: N }}>
    Buyer Matching
  </h3>

  <button
    onClick={onMatchBuyers}
    className="px-2 py-1.5 sm:py-2 rounded-md text-[11px] sm:text-[12px] text-white whitespace-nowrap transition-all hover:opacity-90"
    style={{ background: O }}
  >
    Find Matching Buyers
  </button>
</div>
        </div>

        <div className="p-3">
          <div className="grid grid-cols-3 gap-2">
            {/* Interested Buyers - Green */}
            <div className="rounded-lg p-2 text-center transition-all hover:shadow-sm" style={{ background: '#10b98110', border: '1px solid #10b98120' }}>
              <div className="text-lg font-bold" style={{ color: '#10b981' }}>{property.interestedBuyers || 0}</div>
              <div className="text-[10px] font-medium" style={{ color: '#10b981' }}>Interested Buyer</div>
            </div>
            
            {/* Hot Leads - Red/Orange */}
            <div className="rounded-lg p-2 text-center transition-all hover:shadow-sm" style={{ background: '#ef444410', border: '1px solid #ef444420' }}>
              <div className="text-lg font-bold" style={{ color: '#ef4444' }}>{property.hotLeads || 0}</div>
              <div className="text-[10px] font-medium" style={{ color: '#ef4444' }}>Hot Leads</div>
            </div>
            
            {/* Property Visits - Blue */}
            <div className="rounded-lg p-2 text-center transition-all hover:shadow-sm" style={{ background: '#3b82f610', border: '1px solid #3b82f620' }}>
              <div className="text-lg font-bold" style={{ color: '#3b82f6' }}>{property.visits || 0}</div>
              <div className="text-[10px] font-medium" style={{ color: '#3b82f6' }}>Property Visits</div>
            </div>
          </div>
        </div>
      </div>

      {/* Matched Buyers Section */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: BD }}>
        <div className="p-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
          <h3 className="text-[11px] font-semibold" style={{ color: N }}>Matched Buyers</h3>
          <p className="text-[9px] mt-0.5" style={{ color: MU }}>Buyers who match this property</p>
        </div>

        <div className="p-3">
          <div className="space-y-2 max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {property.matchedBuyers?.length > 0 ? (
              property.matchedBuyers.map((buyer: any, index: number) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 rounded-lg" style={{ background: BG, border: `1px solid ${BD}` }}>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${O}15` }}>
                      <User size={12} style={{ color: O }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold truncate" style={{ color: N }}>{buyer.name}</div>
                      <div className="text-[9px]" style={{ color: MU }}>
                        Budget: {formatINRShort(buyer.budget)} • <span className="font-medium" style={{ color: O }}>{buyer.matchScore}% match</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-10 sm:ml-0">
                    <button className="p-1.5 rounded transition-colors" style={{ color: '#25D366' }} title="WhatsApp">
                      <MessageCircle size={12} />
                    </button>
                    <button className="p-1.5 rounded transition-colors" style={{ color: '#3b82f6' }} title="Call">
                      <Phone size={12} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 rounded-lg" style={{ background: BG, border: `1px solid ${BD}` }}>
                <Users size={24} style={{ color: MU }} className="mx-auto mb-1.5" />
                <p className="text-[10px]" style={{ color: MU }}>No matched buyers yet</p>
                <p className="text-[8px] mt-0.5" style={{ color: MU }}>Click "Find Matching Buyers" to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyersTab;