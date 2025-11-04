
import React from 'react';
import { Plus } from 'lucide-react';

interface LoanCenterTabProps {
  buyer: any;
  onShowLoanApplication: () => void;
}

const LoanCenterTab: React.FC<LoanCenterTabProps> = ({ buyer, onShowLoanApplication }) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const loanOffers = [
    { bank: 'HDFC Bank', rate: 8.5, processing: 0.5, maxAmount: 20000000, features: ['Quick approval', 'Digital process'] },
    { bank: 'ICICI Bank', rate: 8.7, processing: 0.5, maxAmount: 18000000, features: ['Pre-approved', 'Online tracking'] },
    { bank: 'SBI', rate: 8.4, processing: 0.25, maxAmount: 22000000, features: ['Lowest rates', 'Government backing'] },
    { bank: 'Axis Bank', rate: 8.8, processing: 0.5, maxAmount: 19000000, features: ['Quick disbursal', 'Flexible EMI'] }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Loan Center</h3>
        <button
          onClick={onShowLoanApplication}
          className="flex items-center space-x-2 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={14} />
          <span>Apply for Loan</span>
        </button>
      </div>

      {/* Loan Status */}
      {buyer.financials?.loanRequired && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 text-sm mb-3">Your Loan Application</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-gray-500">Application ID:</span>
              <div className="font-medium">{buyer.financials.applicationId || 'Not Applied'}</div>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <div className="font-medium">{buyer.financials.loanStatus.replace('_', ' ')}</div>
            </div>
            <div>
              <span className="text-gray-500">Bank:</span>
              <div className="font-medium">{buyer.financials.bankPreference}</div>
            </div>
          </div>
        </div>
      )}

      {/* Loan Offers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h4 className="font-semibold text-gray-900 text-sm mb-3">Available Loan Offers</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {loanOffers.map((offer, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow text-xs"
            >
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-semibold text-gray-900">{offer.bank}</h5>
                <span className="text-green-600 font-bold">{offer.rate}%</span>
              </div>

              <div className="space-y-1 mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Max Amount:</span>
                  <span className="font-medium">{formatCurrency(offer.maxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Processing:</span>
                  <span className="font-medium">{offer.processing}%</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {offer.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px]"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              <button className="bg-green-600 text-white px-3 py-1 text-sm rounded-md hover:bg-green-700 transition-colors">
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoanCenterTab;