import React from 'react';
import { Target } from 'lucide-react';

interface NegotiationsTabProps {
  property: any;
  onStartNegotiation: () => void;
}

const NegotiationsTab: React.FC<NegotiationsTabProps> = ({
  property,
  onStartNegotiation
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
      {/* Active Negotiations */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Active Negotiations</h3>
          <button
            onClick={onStartNegotiation}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Start New Negotiation
          </button>
        </div>

        <div className="space-y-3">
          {property.negotiations?.map((negotiation: any, index: number) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-gray-900">{negotiation.buyerName}</div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${negotiation.status === 'active' ? 'bg-green-100 text-green-800' :
                  negotiation.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                  {negotiation.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Offered:</span>
                  <span className="font-medium ml-2">{formatINRShort(negotiation.offeredPrice)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Counter:</span>
                  <span className="font-medium ml-2">{formatINRShort(negotiation.counterPrice)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Last Update:</span>
                  <span className="font-medium ml-2">{negotiation.lastUpdate}</span>
                </div>
              </div>
            </div>
          )) || (
              <div className="text-center py-8 text-gray-500">
                <Target className="mx-auto mb-2" size={32} />
                <p>No active negotiations</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default NegotiationsTab;