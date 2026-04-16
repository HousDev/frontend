import React from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Activity,
  Calendar,
  Star,
  Building,
  Eye,
  TrendingUp,
  ArrowLeft
} from 'lucide-react';

interface OverviewTabProps {
  buyer: any;
  onUpdateBuyer: (buyer: any) => void;
  setActiveTab?: (tab: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ buyer, onUpdateBuyer, setActiveTab }) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getStatusBadge = (status: string, size: string = 'text-xs') => {
    const statusConfig = {
      'active': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Active', icon: '🟢' },
      'inactive': { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Inactive', icon: '⚫' },
      'blocked': { bg: 'bg-red-100', text: 'text-red-700', label: 'Blocked', icon: '🔴' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full ${size} ${config.bg} ${config.text}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const getStageBadge = (stage: string) => {
    const stageConfig = {
      'initial_contact': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Initial Contact', icon: '📞' },
      'requirement_gathering': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Requirement Gathering', icon: '📋' },
      'property_hunting': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Property Hunting', icon: '🔍' },
      'loan_processing': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Loan Processing', icon: '🏦' },
      'property_finalization': { bg: 'bg-green-100', text: 'text-green-700', label: 'Property Finalization', icon: '✅' },
      'deal_closure': { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Deal Closure', icon: '🤝' },
      'completed': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completed', icon: '🎉' }
    };

    const config = stageConfig[stage as keyof typeof stageConfig] || stageConfig.initial_contact;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority?: string) => {
    const priorityConfig = {
      high: { bg: 'bg-red-100', text: 'text-red-700', label: 'High Priority', icon: '🔥' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium Priority', icon: '⚡' },
      low: { bg: 'bg-green-100', text: 'text-green-700', label: 'Low Priority', icon: '🌱' },
    };

    const normalized = (priority || '').toLowerCase().trim();
    const config = priorityConfig[normalized as keyof typeof priorityConfig];

    if (!config) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          ⚪ No Priority
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.icon} {config.label}
      </span>
    );
  };

  const getLeadScore = (score: number) => {
    const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
    const bgColor = score >= 80 ? 'bg-green-100' : score >= 60 ? 'bg-yellow-100' : 'bg-red-100';

    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full ${bgColor} ${color} text-xs font-bold`}>
        <Star size={14} className="mr-1" />
        <span>{score}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs">Lead Score</p>
              <p className="text-xs font-bold">{buyer.leadScore}</p>
            </div>
            <Star size={24} className="text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs">Properties Matched</p>
              <p className="text-xs font-bold">{buyer.matchedProperties?.length || 0}</p>
            </div>
            <Building size={24} className="text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs">Total Visits</p>
              <p className="text-xs font-bold">{buyer.visits || 0}</p>
            </div>
            <Eye size={24} className="text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs">Response Rate</p>
              <p className="text-xs font-bold">{buyer.responseRate || 80}%</p>
            </div>
            <TrendingUp size={24} className="text-orange-200" />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <User className="mr-2 text-gray-500" size={16} />
            Contact Information
          </h3>
          <div className="space-y-2 text-xs grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
            {/* Phone */}
            <div className="flex items-center space-x-2">
              <Phone className="text-gray-400" size={14} />
              <span className="font-medium">{buyer.phone}</span>
              <button
                onClick={() => window.open(`tel:${buyer.phone}`)}
                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
              >
                <Phone size={12} />
              </button>
            </div>

            {/* WhatsApp */}
            <div className="flex items-center space-x-2">
              <MessageCircle className="text-gray-400" size={14} />
              <span className="font-medium">{buyer.whatsapp || buyer.phone}</span>
              <button
                onClick={() => {
                  const message = `Hi ${buyer.name}, this is regarding your property requirements.`;
                  window.open(
                    `https://wa.me/${buyer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`,
                    '_blank'
                  );
                }}
                className="p-1 text-green-600 hover:bg-green-100 rounded"
              >
                <MessageCircle size={12} />
              </button>
            </div>

            {/* Email */}
            <div className="flex items-center space-x-2">
              <Mail className="text-gray-400" size={14} />
              <span className="font-medium">{buyer.email}</span>
              <button
                onClick={() => window.open(`mailto:${buyer.email}`)}
                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
              >
                <Mail size={12} />
              </button>
            </div>

            {/* Location */}
            <div className="flex items-center space-x-2">
              <MapPin className="text-gray-400" size={14} />
              <span className="text-gray-700">
                {buyer.location}, {buyer.city}, {buyer.state}
              </span>
            </div>
          </div>
        </div>

        {/* Budget & Requirements */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <DollarSign className="mr-2 text-gray-500" size={16} />
            Budget & Requirements
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 text-xs">
            {/* Budget Range */}
            <div>
              <div className="text-gray-500">Budget Range:</div>
              <div className="font-bold text-green-600 text-sm mt-1">
                {formatCurrency(buyer.budget.min)} - {formatCurrency(buyer.budget.max)}
              </div>
            </div>

            {/* Possession & Furnishing */}
            <div>
              <div className="text-gray-500">Possession:</div>
              <div className="font-medium mt-1">
                {buyer.requirements?.possession || "—"}
              </div>

              <div className="text-gray-500 mt-2">Furnishing:</div>
              <div className="font-medium mt-1">
                {buyer.requirements?.furnishing || "—"}
              </div>
            </div>

            {/* Preferred Units */}
            <div>
              <div className="text-gray-500">Preferred Units</div>
              <div className="font-medium mt-1">
                {Array.isArray(buyer.requirements?.unitTypes)
                  ? buyer.requirements.unitTypes.join(", ")
                  : buyer.requirements?.unitTypes || "—"}
              </div>
            </div>

            {/* Preferred Locations */}
            <div>
              <div className="text-gray-500">Preferred Locations:</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {Array.isArray(buyer.requirements?.preferredLocations) &&
                  buyer.requirements.preferredLocations.length > 0 ? (
                  buyer.requirements.preferredLocations.map((location: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-medium"
                    >
                      {location}
                    </span>
                  ))
                ) : (
                  <span className="font-medium">—</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Tracking */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Buyer Journey Progress
        </h3>
        <div className="space-y-3 text-xs">
          {/* Overall Progress */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">Overall Progress</span>
            <span className="font-bold text-purple-600">{buyer.stageProgress}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${buyer.stageProgress || 0}%` } as any}
            ></div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            <div className="text-center">
              <div className="text-sm font-bold text-blue-600">
                {buyer.activities?.length || 0}
              </div>
              <div className="text-[10px] text-gray-600">Activities</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-green-600">
                {buyer.visits || 0}
              </div>
              <div className="text-[10px] text-gray-600">Property Visits</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-purple-600">
                {buyer.matchedProperties?.length || 0}
              </div>
              <div className="text-[10px] text-gray-600">Matched Properties</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-orange-600">
                {buyer.responseRate || 80}%
              </div>
              <div className="text-[10px] text-gray-600">Response Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Recent Activities</h3>
          <button
            onClick={() => setActiveTab?.('activities')}
            className="text-purple-600 hover:text-purple-800 text-xs font-medium"
          >
            View All
          </button>
        </div>
        {buyer.activities?.length > 0 ? (
          <div className="space-y-2">
            {buyer.activities.slice(0, 3).map((activity: any) => (
              <div
                key={activity.id}
                className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
              >
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Activity className="text-blue-600" size={14} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800 text-xs">
                    {activity.description}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {activity.date} • {activity.time}
                  </div>
                </div>
                <div className="text-[10px] text-gray-400">{activity.duration}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Activity className="mx-auto text-gray-300 mb-3" size={36} />
            <p className="text-gray-500 text-xs">No activities recorded yet</p>
          </div>
        )}
      </div>

      {/* Upcoming Follow-ups */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Upcoming Follow-ups</h3>
          <button
            onClick={() => setActiveTab?.('followups')}
            className="text-purple-600 hover:text-purple-800 text-xs font-medium"
          >
            View All
          </button>
        </div>
        {buyer.followups?.filter((f: any) => f.status === 'pending').length > 0 ? (
          <div className="space-y-2">
            {buyer.followups
              .filter((f: any) => f.status === 'pending')
              .slice(0, 3)
              .map((followup: any) => (
                <div
                  key={followup.id}
                  className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <Calendar className="text-yellow-600" size={14} />
                    <div>
                      <div className="font-medium text-gray-800 text-xs">
                        {followup.description}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {followup.date} • {followup.time}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${followup.priority === 'high'
                      ? 'bg-red-100 text-red-700'
                      : followup.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                      }`}
                  >
                    {followup.priority}
                  </span>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Calendar className="mx-auto text-gray-300 mb-3" size={36} />
            <p className="text-gray-500 text-xs">No pending follow-ups</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Add the missing import for MessageCircle
const MessageCircle = ({ className, size }: { className?: string; size?: number }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

export default OverviewTab;