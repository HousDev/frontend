import React from 'react';
import { Users, MessageCircle, Phone, User } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Buyer Matching */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Buyer Matching</h3>
          <button
            onClick={onMatchBuyers}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Find Matching Buyers
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{property.interestedBuyers || 0}</div>
            <div className="text-sm text-green-700">Interested Buyers</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{property.hotLeads || 0}</div>
            <div className="text-sm text-red-700">Hot Leads</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{property.visits || 0}</div>
            <div className="text-sm text-blue-700">Property Visits</div>
          </div>
        </div>
      </div>

      {/* Matched Buyers */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Matched Buyers</h3>
        <div className="space-y-3">
          {property.matchedBuyers?.map((buyer: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="text-blue-600" size={16} />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{buyer.name}</div>
                  <div className="text-sm text-gray-600">Budget: {formatINRShort(buyer.budget)} • {buyer.matchScore}% match</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-green-600 hover:bg-green-100 rounded">
                  <MessageCircle size={16} />
                </button>
                <button className="p-2 text-blue-600 hover:bg-blue-100 rounded">
                  <Phone size={16} />
                </button>
              </div>
            </div>
          )) || (
              <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto mb-2" size={32} />
                <p>No matched buyers yet</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default BuyersTab;