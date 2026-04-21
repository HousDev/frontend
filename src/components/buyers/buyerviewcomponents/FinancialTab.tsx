import React from 'react';
import { DollarSign, TrendingUp, Award, CreditCard, Plus, IndianRupeeIcon } from 'lucide-react';

interface FinancialTabProps {
  buyer: any;
  onShowLoanApplication: () => void;
}

const FinancialTab: React.FC<FinancialTabProps> = ({ buyer, onShowLoanApplication }) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getLoanStatusBadge = (status: string) => {
    const statusConfig = {
      'not_applied': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Not Applied', icon: '⚪' },
      'applied': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Applied', icon: '📋' },
      'pre_approved': { bg: 'bg-green-100', text: 'text-green-700', label: 'Pre-approved', icon: '✅' },
      'approved': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Approved', icon: '🎉' },
      'rejected': { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected', icon: '❌' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_applied;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs">Budget Range</p>
              <p className="text-xs font-bold">
                {formatCurrency(buyer.budget.min)} - {formatCurrency(buyer.budget.max)}
              </p>
            </div>
            <IndianRupeeIcon size={20} className="text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs">Monthly Income</p>
              <p className="text-xs font-bold">
                {formatCurrency(buyer.financials?.monthlyIncome || 0)}
              </p>
            </div>
            <TrendingUp size={20} className="text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs">Credit Score</p>
              <p className="text-xs font-bold">{buyer.financials?.creditScore || 'N/A'}</p>
            </div>
            <Award size={20} className="text-purple-200" />
          </div>
        </div>
      </div>

      {/* Loan Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-gray-900 flex items-center">
            <CreditCard className="mr-2" size={16} />
            Loan Information
          </h4>
          <button
            onClick={onShowLoanApplication}
            className="flex items-center space-x-2 px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={14} />
            <span>Apply for Loan</span>
          </button>
        </div>

        {buyer.financials?.loanRequired ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Loan Required:</span>
                <span className="font-medium ml-2 text-green-600">Yes</span>
              </div>
              <div>
                <span className="text-gray-500">Loan Amount:</span>
                <span className="font-medium ml-2">{formatCurrency(buyer.financials.loanAmount)}</span>
              </div>
              <div>
                <span className="text-gray-500">Down Payment:</span>
                <span className="font-medium ml-2">{formatCurrency(buyer.financials.downPayment)}</span>
              </div>
              <div>
                <span className="text-gray-500">Bank Preference:</span>
                <span className="font-medium ml-2">{buyer.financials.bankPreference}</span>
              </div>
              <div>
                <span className="text-gray-500">Loan Status:</span>
                <span className="ml-2">{getLoanStatusBadge(buyer.financials.loanStatus)}</span>
              </div>
              <div>
                <span className="text-gray-500">Credit Score:</span>
                <span className="font-medium ml-2">{buyer.financials.creditScore}</span>
              </div>
            </div>

            {buyer.financials.applicationId && (
              <div className="bg-blue-50 rounded-lg p-3 text-xs">
                <h5 className="font-medium text-blue-900 mb-2">Loan Application Details</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <span className="text-blue-600">Application ID:</span>
                    <span className="font-medium ml-2">{buyer.financials.applicationId}</span>
                  </div>
                  <div>
                    <span className="text-blue-600">Applied Date:</span>
                    <span className="font-medium ml-2">{new Date(buyer.financials.applicationDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-blue-600">Eligible Amount:</span>
                    <span className="font-medium ml-2">{formatCurrency(buyer.financials.eligibilityAmount)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 text-xs">
            <CreditCard className="mx-auto text-gray-300 mb-3" size={36} />
            <h4 className="font-semibold text-gray-900 mb-1">No Loan Required</h4>
            <p className="text-gray-500 mb-3">This buyer doesn't require a loan for property purchase</p>
            <button
              onClick={onShowLoanApplication}
              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Apply for Loan
            </button>
          </div>
        )}
      </div>

      {/* Financial Health Score */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h4 className="text-xs font-semibold text-gray-900 mb-3">Financial Health Score</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="text-center p-3 bg-green-50 rounded-lg text-xs">
            <div className="font-bold text-green-600">
              {buyer.financials?.creditScore || 750}
            </div>
            <div className="text-green-700">Credit Score</div>
            <div className="text-gray-500 mt-1">Excellent</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg text-xs">
            <div className="font-bold text-blue-600">
              {buyer.dealPotential === 'high' ? '85' : buyer.dealPotential === 'medium' ? '70' : '55'}%
            </div>
            <div className="text-blue-700">Deal Potential</div>
            <div className="text-gray-500 mt-1">{buyer.dealPotential}</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg text-xs">
            <div className="font-bold text-purple-600">
              {buyer.responseRate || 80}%
            </div>
            <div className="text-purple-700">Response Rate</div>
            <div className="text-gray-500 mt-1">Very Good</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialTab;