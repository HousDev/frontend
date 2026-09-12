import React from 'react';
import {
  IndianRupee,
  TrendingUp,
  Award,
  CreditCard,
  Plus,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck2,
  Sparkles,
} from 'lucide-react';

interface FinancialTabProps {
  buyer: any;
  onShowLoanApplication: () => void;
}

const FinancialTab: React.FC<FinancialTabProps> = ({ buyer, onShowLoanApplication }) => {
  const formatCurrency = (amount: number | string | undefined | null) => {
    if (!amount || amount === '0' || amount === 0) return '₹0';
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d.-]/g, '')) : amount;
    if (isNaN(num)) return `₹${amount}`;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lac`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const getLoanStatusBadge = (status?: string) => {
    const s = (status || 'not_applied').toLowerCase().trim();

    const config: Record<string, { bg: string; text: string; label: string; icon: React.ReactNode }> = {
      not_applied: {
        bg: 'bg-gray-100 border-gray-200',
        text: 'text-gray-700',
        label: 'Not Applied',
        icon: <Clock size={11} className="text-gray-500" />,
      },
      applied: {
        bg: 'bg-blue-50 border-blue-200',
        text: 'text-blue-700',
        label: 'Applied',
        icon: <Clock size={11} className="text-blue-600" />,
      },
      pre_approved: {
        bg: 'bg-amber-50 border-amber-200',
        text: 'text-amber-700',
        label: 'Pre-Approved',
        icon: <FileCheck2 size={11} className="text-amber-600" />,
      },
      approved: {
        bg: 'bg-emerald-50 border-emerald-200',
        text: 'text-emerald-700',
        label: 'Approved',
        icon: <CheckCircle2 size={11} className="text-emerald-600" />,
      },
      rejected: {
        bg: 'bg-red-50 border-red-200',
        text: 'text-red-700',
        label: 'Rejected',
        icon: <AlertCircle size={11} className="text-red-600" />,
      },
    };

    const item = config[s] || config.not_applied;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${item.bg} ${item.text}`}
      >
        {item.icon}
        <span>{item.label}</span>
      </span>
    );
  };

  const minBudget = buyer.budget?.min || buyer.minBudget || 0;
  const maxBudget = buyer.budget?.max || buyer.maxBudget || 0;
  const monthlyIncome = buyer.financials?.monthlyIncome || 0;
  const creditScore = buyer.financials?.creditScore || 750;
  const isLoanRequired = Boolean(buyer.financials?.loanRequired);

  return (
    <div className="space-y-4">
      {/* 1. Top KPI Stats Cards (Exact Seller/Overview Design Match) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-medium text-gray-500 uppercase tracking-wider">
                Budget Range
              </p>
              <p className="text-base font-bold text-gray-900 mt-0.5 truncate">
                {formatCurrency(minBudget)} - {formatCurrency(maxBudget)}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <IndianRupee size={14} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-medium text-gray-500 uppercase tracking-wider">
                Monthly Income
              </p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">
                {formatCurrency(monthlyIncome)}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp size={14} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-medium text-gray-500 uppercase tracking-wider">
                Credit Score
              </p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">
                {creditScore}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Award size={14} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-medium text-gray-500 uppercase tracking-wider">
                Loan Requirement
              </p>
              <p className="text-sm font-bold text-gray-900 mt-1">
                {isLoanRequired ? 'Loan Required' : 'Self Funded'}
              </p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CreditCard size={14} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Loan Information Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 border-b pb-2">
          <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
            <CreditCard size={13} className="text-blue-600" />
            <span>Loan & Financing Information</span>
          </h3>

          <div className="flex items-center gap-2">
            {isLoanRequired && getLoanStatusBadge(buyer.financials?.loanStatus)}
            <button
              onClick={onShowLoanApplication}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
            >
              <Plus size={12} />
              <span>{isLoanRequired ? 'Update Application' : 'Apply for Loan'}</span>
            </button>
          </div>
        </div>

        {isLoanRequired ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-gray-500">Loan Status</p>
                <div>{getLoanStatusBadge(buyer.financials?.loanStatus)}</div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-medium text-gray-500">Required Loan Amount</p>
                <p className="text-xs font-bold text-emerald-600">
                  {formatCurrency(buyer.financials?.loanAmount)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-medium text-gray-500">Down Payment Available</p>
                <p className="text-xs font-bold text-gray-900">
                  {formatCurrency(buyer.financials?.downPayment)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-medium text-gray-500">Bank Preference</p>
                <p className="text-xs font-semibold text-gray-800 flex items-center gap-1">
                  <Building2 size={12} className="text-gray-400" />
                  <span>{buyer.financials?.bankPreference || 'No Preference'}</span>
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-medium text-gray-500">CIBIL / Credit Score</p>
                <p className="text-xs font-semibold text-gray-900 flex items-center gap-1">
                  <ShieldCheck size={12} className="text-emerald-600" />
                  <span>{buyer.financials?.creditScore || creditScore}</span>
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-medium text-gray-500">Employment / Income Type</p>
                <p className="text-xs font-semibold text-gray-900 capitalize">
                  {buyer.financials?.employmentType || 'Salaried'}
                </p>
              </div>
            </div>

            {buyer.financials?.applicationId && (
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs">
                <div className="flex items-center gap-1.5 text-blue-900 font-semibold mb-2.5">
                  <Sparkles size={13} className="text-blue-600" />
                  <span>Active Loan Application Details</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] font-medium text-blue-600 uppercase">Application ID</span>
                    <p className="font-semibold text-gray-900 mt-0.5">{buyer.financials.applicationId}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-blue-600 uppercase">Application Date</span>
                    <p className="font-semibold text-gray-900 mt-0.5">
                      {buyer.financials.applicationDate
                        ? new Date(buyer.financials.applicationDate).toLocaleDateString('en-IN')
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-medium text-blue-600 uppercase">Pre-Eligible Amount</span>
                    <p className="font-bold text-emerald-700 mt-0.5">
                      {formatCurrency(buyer.financials.eligibilityAmount)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <CreditCard size={32} className="mx-auto mb-2 text-gray-300" />
            <h4 className="text-xs font-semibold text-gray-800 mb-0.5">
              Self-Funded / No Active Loan Required
            </h4>
            <p className="text-[10px] text-gray-400 mb-3 max-w-sm mx-auto">
              This buyer currently does not require bank financing or has planned their own funds for purchase.
            </p>
            <button
              onClick={onShowLoanApplication}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={12} />
              <span>Apply for Home Loan</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Financial Health & Assessment Score Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 border-b pb-2">
          <h3 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>Financial Assessment & Deal Readiness</span>
          </h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Verified Profile
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="text-center p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl">
            <div className="text-xl font-extrabold text-emerald-600">
              {creditScore}
            </div>
            <div className="text-xs font-semibold text-emerald-800 mt-0.5">Credit Score (CIBIL)</div>
            <div className="text-[10px] text-emerald-600/80 mt-1 font-medium">
              {creditScore >= 750 ? 'Excellent Rating' : creditScore >= 650 ? 'Good Rating' : 'Needs Review'}
            </div>
          </div>

          <div className="text-center p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl">
            <div className="text-xl font-extrabold text-blue-600">
              {buyer.dealPotential === 'high' ? '85%' : buyer.dealPotential === 'medium' ? '70%' : '55%'}
            </div>
            <div className="text-xs font-semibold text-blue-800 mt-0.5">Deal Closure Potential</div>
            <div className="text-[10px] text-blue-600/80 mt-1 font-medium capitalize">
              {buyer.dealPotential ? `${buyer.dealPotential} Probability` : 'High Probability'}
            </div>
          </div>

          <div className="text-center p-3.5 bg-purple-50/50 border border-purple-100 rounded-xl">
            <div className="text-xl font-extrabold text-purple-600">
              {buyer.responseRate || 80}%
            </div>
            <div className="text-xs font-semibold text-purple-800 mt-0.5">Response & Engagement</div>
            <div className="text-[10px] text-purple-600/80 mt-1 font-medium">
              Active Buyer Profile
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialTab;