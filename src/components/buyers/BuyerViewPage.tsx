import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Activity,
  FileText,
  CreditCard,
  Building,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Eye,
  MessageCircle,
  Send,
  Target,
  TrendingUp,
  Award,
  Shield,
  Heart,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Home,
  DollarSign,
  Users,
  Settings,
  Bell,
  Filter,
  Search,
  Download,
  Share,
  MoreHorizontal,
  UserCheck,
  Calculator,
  Bot,
  Zap,
  Gem,
  Crown,
  Flag,

  Tag,

  CheckCircle2,
  XCircle,
  Play,
  Layers,
  CalendarIcon,
} from 'lucide-react';

import ActivityModal from './ActivityModal';
import VisitModal from './VisitModal';
import PropertyMatchModal from './PropertyMatchModal';
import PropertySuggestionModal from './PropertySuggestionModal';
import LoanApplicationModal from './LoanApplicationModal';
import { propertiesAPI } from '@/lib/propertiesAPI';
import PropertyDetailsShareModal from '../properties/PropertyDetailsShareModal';
import BuyerFollowupModal from './BuyerFollowupModal';
import { buyerFollowupAPI } from '@/lib/buyerFollowupAPI';
import { toast } from 'react-toastify';

const BuyerViewPage = ({
  buyer,
  onBack,
  onEdit,
  onAccount,
  onNext,
  onPrevious,
  currentIndex,
  totalBuyers,
  onUpdateBuyer
}: any) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showPropertyMatch, setShowPropertyMatch] = useState(false);
  const [showPropertySuggestions, setShowPropertySuggestions] = useState(false);
  const [showLoanApplication, setShowLoanApplication] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [editingFollowup, setEditingFollowup] = useState<any | null>(null);
  const [editingVisit, setEditingVisit] = useState(null);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'properties', label: 'Matched Properties', icon: Building },
    { id: 'activities', label: 'Activities', icon: Activity },
    { id: 'followups', label: 'Follow-ups', icon: Calendar },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'financial', label: 'Financial', icon: CreditCard }
  ];

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  useEffect(() => {
  }, [buyer]);

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

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'high': { bg: 'bg-red-100', text: 'text-red-700', label: 'High Priority', icon: '🔥' },
      'medium': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium Priority', icon: '⚡' },
      'low': { bg: 'bg-green-100', text: 'text-green-700', label: 'Low Priority', icon: '🌱' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
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

  const handleAddActivity = () => {
    setEditingActivity(null);
    setShowActivityModal(true);
  };

  const handleEditActivity = (activity: any) => {
    setEditingActivity(activity);
    setShowActivityModal(true);
  };

  const handleSaveActivity = (activityData: any) => {
    const updatedBuyer = {
      ...buyer,
      activities: editingActivity
        ? buyer.activities.map((a: any) => a.id === editingActivity.id ? activityData : a)
        : [...(buyer.activities || []), activityData]
    };
    onUpdateBuyer(updatedBuyer);
    setShowActivityModal(false);
    setEditingActivity(null);
  };

  const handleAddFollowup = () => {
    setEditingFollowup(null);
    setShowFollowupModal(true);
  };

  const handleEditFollowup = (followup: any) => {
    setEditingFollowup(followup);
    setShowFollowupModal(true);
  };

  const handleSaveFollowup = (followupData: any) => {
    // followupData is expected to be the payload returned from BuyerFollowupModal (has buyer_id)
    const updatedBuyer = {
      ...buyer,
      followups: editingFollowup
        ? (buyer.followups || []).map((f: any) => (f.id === editingFollowup.id ? followupData : f))
        : [...(buyer.followups || []), followupData]
    };
    onUpdateBuyer(updatedBuyer);
    setShowFollowupModal(false);
    setEditingFollowup(null);
  };

  const handleAddVisit = () => {
    setEditingVisit(null);
    setShowVisitModal(true);
  };

  const handleEditVisit = (visit: any) => {
    setEditingVisit(visit);
    setShowVisitModal(true);
  };

  const handleSaveVisit = (visitData: any) => {
    const visitActivity = {
      id: Date.now() + 1,
      type: 'visit',
      description: `Property visit to ${visitData.property}`,
      date: visitData.date,
      time: visitData.time,
      duration: visitData.duration,
      stage: 'property_hunting',
      outcome: visitData.outcome || 'Property visit completed',
      nextAction: visitData.nextAction || 'Follow up on feedback',
      executedBy: 'Admin User',
      remarks: visitData.remarks,
      rating: visitData.rating || 3
    };

    const updatedBuyer = {
      ...buyer,
      activities: [...(buyer.activities || []), visitActivity],
      visits: (buyer.visits || 0) + 1,
      lastActivity: visitData.date
    };

    onUpdateBuyer(updatedBuyer);
    setShowVisitModal(false);
    setEditingVisit(null);
  };

  const handleWhatsApp = () => {
    const unitTypes =
      Array.isArray(buyer.requirements?.unitTypes)
        ? buyer.requirements.unitTypes.join(", ")
        : buyer.requirements?.unitTypes || "—";

    const preferredLocations =
      Array.isArray(buyer.requirements?.preferredLocations)
        ? buyer.requirements.preferredLocations.join(", ")
        : buyer.requirements?.preferredLocations || "—";

    const message = `Hi ${buyer.name}, I have some property updates for you.
Your budget: ${formatCurrency(buyer.budget.min)} - ${formatCurrency(buyer.budget.max)}.
Preferred Units ${unitTypes} 
in ${preferredLocations}.
Let me know when you're free to discuss.`;

    window.open(
      `https://wa.me/${(buyer.phone ?? "").replace(/\D/g, "")}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handleEmail = () => {
    const unitTypes =
      Array.isArray(buyer.requirements?.unitTypes)
        ? buyer.requirements.unitTypes.join(", ")
        : buyer.requirements?.unitTypes || "—";

    const preferredLocations =
      Array.isArray(buyer.requirements?.preferredLocations)
        ? buyer.requirements.preferredLocations.join(", ")
        : buyer.requirements?.preferredLocations || "—";

    const subject = `Property Updates for ${buyer.name}`;
    const body = `Dear ${buyer.name},

I hope this email finds you well.

I have some exciting property updates that match your requirements:

Budget: ${formatCurrency(buyer.budget.min)} - ${formatCurrency(buyer.budget.max)}
Preferred Units ${unitTypes}
Preferred locations: ${preferredLocations}

Would you like to schedule a call to discuss these opportunities?

Best regards,
ResaleExpert Team`;

    window.open(
      `mailto:${buyer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    );
  };


  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 sticky top-0 z-50 text-xs">
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between">
          <div className="flex flex-wrap md:flex-nowrap items-center space-x-2 md:space-x-4 mb-2 md:mb-0">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-lg md:text-xl font-bold">
                {buyer.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-base md:text-xl font-bold text-gray-900">
                  {buyer.salutation} {buyer.name}
                </h1>
                <div className="flex text-xs flex-wrap items-center space-x-1 md:space-x-3 mt-1">
                  {getStatusBadge(buyer.status)}
                  {getStageBadge(buyer.stage)}
                  {getPriorityBadge(buyer.priority)}
                  {getLeadScore(buyer.leadScore)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-nowrap items-center space-x-1 md:space-x-3">
            <div className="text-[8px] text-gray-500 mb-1 md:mb-0">
              {currentIndex + 1} of {totalBuyers}
            </div>
            <button
              onClick={onPrevious}
              disabled={currentIndex === 0}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={onNext}
              disabled={currentIndex === totalBuyers - 1}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => onAccount(buyer)}
              className="flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-1 md:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <UserCheck size={16} />
              <span>Buyer Account</span>
            </button>
            <button
              onClick={() => {

                onEdit(buyer);
              }}
              className="flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-1 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit size={16} />
              <span>Edit</span>
            </button>

          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-3 md:mt-4">
          <nav className="flex space-x-1 overflow-x-auto pb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1 md:space-x-2 px-3 py-1 md:px-4 md:py-2 rounded-lg transition-colors whitespace-nowrap text-xs ${activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <Icon size={16} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-6 pt-2">
        {activeTab === 'overview' && <OverviewTab buyer={buyer} onUpdateBuyer={onUpdateBuyer} />}
        {activeTab === 'properties' && (
          <PropertiesTab
            buyer={buyer}
            onShowPropertyMatch={() => setShowPropertyMatch(true)}
            onShowPropertySuggestions={() => setShowPropertySuggestions(true)}
            onScheduleVisit={handleAddVisit}
          />
        )}
        {activeTab === 'activities' && (
          <ActivitiesTab
            buyer={buyer}
            onAddActivity={handleAddActivity}
            onEditActivity={handleEditActivity}
          />
        )}
        {activeTab === 'followups' && (
          <FollowupsTab
            buyer={buyer}
            onAddFollowup={handleAddFollowup}
            onEditFollowup={handleEditFollowup}
          />
        )}
        {activeTab === 'documents' && <DocumentsTab buyer={buyer} />}
        {activeTab === 'financial' && (
          <FinancialTab
            buyer={buyer}
            onShowLoanApplication={() => setShowLoanApplication(true)}
          />
        )}
      </div>

      {/* Quick Actions Bar (omitted for brevity in explanation; remains same) */}
      <div className="
  bg-white border-t border-gray-200 
  px-2 sm:px-3 md:px-3 lg:px-4 
  py-2 sm:py-2.5 md:py-3 lg:py-4 
  fixed bottom-0 left-0 
  w-full 
  lg:w-[calc(100%-335px)] lg:ml-[288px] 
  z-50 shadow-lg
">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-[8px] sm:text-[10px] md:text-[10px] lg:text-xs">
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-wrap md:flex-wrap lg:flex-nowrap overflow-x-auto md:overflow-x-auto lg:overflow-visible whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none]">
            <style>{`.quickbar::-webkit-scrollbar{display:none}`}</style>
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1 px-2 md:px-2.5 lg:px-3 py-1.5 md:py-1.5 lg:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <MessageCircle size={14} className="md:size-[15px] lg:size-[16px]" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleEmail}
              className="flex items-center gap-1 px-2 md:px-2.5 lg:px-3 py-1.5 md:py-1.5 lg:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Mail size={14} className="md:size-[15px] lg:size-[16px]" />
              <span>Email</span>
            </button>

            <button
              onClick={() => window.open(`tel:${buyer.phone}`)}
              className="flex items-center gap-1 px-2 md:px-2.5 lg:px-3 py-1.5 md:py-1.5 lg:py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Phone size={14} className="md:size-[15px] lg:size-[16px]" />
              <span>Call</span>
            </button>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-wrap md:flex-wrap lg:flex-nowrap overflow-x-auto md:overflow-x-auto lg:overflow-visible whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              onClick={handleAddVisit}
              className="flex items-center gap-1 px-2 md:px-2.5 lg:px-3 py-1.5 md:py-1.5 lg:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Calendar size={14} className="md:size-[15px] lg:size-[16px]" />
              <span>Schedule Visit</span>
            </button>

            <button
              onClick={handleAddActivity}
              className="flex items-center gap-1 px-2 md:px-2.5 lg:px-3 py-1.5 md:py-1.5 lg:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus size={14} className="md:size-[15px] lg:size-[16px]" />
              <span>Add Activity</span>
            </button>

            <button
              onClick={handleAddFollowup}
              className="flex items-center gap-1 px-2 md:px-2.5 lg:px-3 py-1.5 md:py-1.5 lg:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Calendar size={14} className="md:size-[15px] lg:size-[16px]" />
              <span>Schedule Follow-up</span>
            </button>

            <button
              onClick={() => setShowPropertySuggestions(true)}
              className="flex items-center gap-1 px-2 md:px-2.5 lg:px-3 py-1.5 md:py-1.5 lg:py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              <Bot size={14} className="md:size-[15px] lg:size-[16px]" />
              <span>AI Suggestions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showActivityModal && (
        <ActivityModal
          isOpen={showActivityModal}
          onClose={() => {
            setShowActivityModal(false);
            setEditingActivity(null);
          }}
          activity={editingActivity}
          onSave={handleSaveActivity}
        />
      )}

      {showFollowupModal && (
        <BuyerFollowupModal
          isOpen={showFollowupModal}
          onClose={() => {
            setShowFollowupModal(false);
            setEditingFollowup(null);
          }}
          onSave={handleSaveFollowup}
          tabId="buyer" /* <-- pass the correct master tab id so modal filters buyer-specific connected remarks */
          buyerId={buyer?.id ?? buyer?.buyerId ?? ""} /* <-- ensure buyerId is passed */
          initialForm={editingFollowup ?? undefined} /* <-- when editing, prefill fields */
        />
      )}

      {showVisitModal && (
        <VisitModal
          isOpen={showVisitModal}
          onClose={() => {
            setShowVisitModal(false);
            setEditingVisit(null);
          }}
          visit={editingVisit}
          buyer={buyer}
          onSave={handleSaveVisit}
        />
      )}

      {showPropertyMatch && (
        <PropertyMatchModal
          isOpen={showPropertyMatch}
          onClose={() => setShowPropertyMatch(false)}
          buyer={buyer}
        />
      )}

      {showPropertySuggestions && (
        <PropertySuggestionModal
          isOpen={showPropertySuggestions}
          onClose={() => setShowPropertySuggestions(false)}
          buyer={buyer}
        />
      )}

      {showLoanApplication && (
        <LoanApplicationModal
          isOpen={showLoanApplication}
          onClose={() => setShowLoanApplication(false)}
          buyer={buyer}
          onUpdateBuyer={onUpdateBuyer}
        />
      )}
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ buyer, onUpdateBuyer }: any) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };


  function setActiveTab(arg0: string): void {
    throw new Error('Function not implemented.');
  }

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
      {/* Contact Information & Budget Section */}
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

            {/* LPreferred Units */}
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
              style={{ width: `${buyer.stageProgress}%` }}
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
            onClick={() => setActiveTab('activities')}
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
            onClick={() => setActiveTab('followups')}
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






type PropertiesTabProps = {
  buyer: any;
  onShowPropertyMatch: () => void;
  onShowPropertySuggestions: () => void;
  onScheduleVisit?: () => void; // <-- added this line
  onVisitClick?: (property: any) => void; // optional
  onDetailsClick?: (property: any) => void; // optional
};
const PropertiesTab: React.FC<PropertiesTabProps> = ({
  buyer,
  onShowPropertyMatch,
  onShowPropertySuggestions,
  onScheduleVisit,
  onVisitClick,
  onDetailsClick,
}) => {
  // ---------------- state ----------------
  const [properties, setProperties] = useState<any[]>([]);
  const [loadingProps, setLoadingProps] = useState(false);
  const [propsError, setPropsError] = useState<string | null>(null);
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openPropertyDetailsShareModal, setOpenPropertyDetailsShareModal] =
    useState(false);

  // ---------------- fetch ----------------
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoadingProps(true);
      setPropsError(null);
      try {
        const res = await propertiesAPI.getProperties();
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (isMounted) setProperties(list ?? []);
      } catch (err) {
        toast.error("Error fetching property:", err);
        if (isMounted) {
          setProperties([]);
          setPropsError("Could not load properties");
        }
      } finally {
        if (isMounted) setLoadingProps(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // ---------------- helpers ----------------
  const formatCurrency = (amount?: number) => {
    if (!amount || isNaN(Number(amount))) return "₹—";
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const toArr = (v: any) => (Array.isArray(v) ? v.filter(Boolean) : v ? [v] : []);
  const norm = (s: any) => String(s || "").toLowerCase().trim();
  const hasAny = (haystack: string[], needles: string[]) =>
    needles.some((n) => haystack.some((h) => h.includes(n)));


  const req = buyer?.requirements || {};
  const reqUnitTypes = toArr(req.unitTypes).map(norm);
  const reqLocs = toArr(req.preferredLocations).map(norm);
  const reqAmenities = toArr(req.amenities).map(norm);
  const reqFacing = norm(req.facing);
  const reqFloorPref = norm(req.floor);
  const reqFurnishing = norm(req.furnishing);
  const reqPossession = norm(req.possession);
  const reqPropType = norm(req.propertyType);
  const reqKeywords = norm(req.specialRequirements || "")
    .split(/\s+/)
    .filter(Boolean);

  // ---- property pickers
  const unitTypeFrom = (p: any) => norm(p?.unit_type || p?.bhk || p?.configuration);
  const locTokensFrom = (p: any) =>
    [norm(p?.locality_name), norm(p?.location_name), norm(p?.address), norm(p?.city_name || p?.city)]
      .filter(Boolean);
  const amenitiesFrom = (p: any) => (Array.isArray(p?.amenities) ? p.amenities : []).map(norm);
  const furnishingFrom = (p: any) => norm(p?.furnishing || p?.furnished_status);
  const propTypeFrom = (p: any) => norm(p?.property_subtype_name || p?.property_type_name || "");
  const descriptionFrom = (p: any) => norm(p?.description || p?.title || "");

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-green-700 bg-green-100";
    if (score >= 80) return "text-blue-700 bg-blue-100";
    if (score >= 70) return "text-orange-700 bg-orange-100";
    return "text-red-700 bg-red-100";
  };

  const getAvailabilityBadge = (status: string) => {
    const map: any = {
      Available: "bg-emerald-100 text-emerald-700",
      Sold: "bg-red-100 text-red-700",
      "Under Negotiation": "bg-amber-100 text-amber-700",
    };
    const cls = map[status] || "bg-gray-100 text-gray-700";
    return (
      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${cls}`}>
        {status || "Available"}
      </span>
    );
  };

  const titleFrom = (p: any) => {
    const unit = p?.unit_type ? String(p.unit_type).toUpperCase() : "";
    const society = p?.society_name || p?.location_name || "";
    const type = p?.property_subtype_name || p?.property_type_name || "";
    const left = [unit, type].filter(Boolean).join(" ");
    return [left || p?.title || "Property", society].filter(Boolean).join(" - ");
  };

  const addressFrom = (p: any) =>
    p?.address || [p?.location_name || p?.locality_name, p?.city_name || p?.city].filter(Boolean).join(", ");

  // ---- budget helpers
  const getBuyerBudget = () => {
    const min = Number(buyer?.budget?.min ?? buyer?.budgetMin ?? buyer?.minBudget ?? 0);
    const max = Number(buyer?.budget?.max ?? buyer?.budgetMax ?? buyer?.maxBudget ?? 0);
    return { min, max };
  };
  const priceFrom = (p: any) => Number(p?.budget ?? p?.price ?? p?.expected_price ?? 0);
  const priceRangeFrom = (p: any) => {
    const min = Number(p?.min_price ?? p?.budget_min ?? p?.minBudget ?? 0);
    const max = Number(p?.max_price ?? p?.budget_max ?? p?.maxBudget ?? 0);
    return { min, max };
  };
  const isWithinBuyerBudget = (p: any) => {
    const { min: bMin, max: bMax } = getBuyerBudget();
    const hasBuyerMin = !!bMin;
    const hasBuyerMax = !!bMax;
    if (!hasBuyerMin && !hasBuyerMax) return true;
    const { min: pMin, max: pMax } = priceRangeFrom(p);
    const hasRange = !!pMin && !!pMax && pMax >= pMin;
    if (hasRange) {
      const left = hasBuyerMin ? bMin : Number.NEGATIVE_INFINITY;
      const right = hasBuyerMax ? bMax : Number.POSITIVE_INFINITY;
      return Math.max(pMin, left) <= Math.min(pMax, right);
    }
    const price = priceFrom(p);
    if (!price) return false;
    if (hasBuyerMin && price < bMin) return false;
    if (hasBuyerMax && price > bMax) return false;
    return true;
  };

  const sellerFrom = (p: any) => p?.seller_name || p?.owner_name || p?.contact_name || "—";
  const sellerPhoneFrom = (p: any) =>
    p?.seller_phone || p?.owner_phone || p?.phone_phone || p?.contact_phone || p?.phone || "";

  const sizeFrom = (p: any) => {
    const unit = p?.unit_type || "";
    const area = Number(p?.carpet_area ?? p?.area ?? p?.super_builtup_area ?? 0);
    const areaTxt = area ? `${Number(area).toLocaleString("en-IN")} sq ft` : "";
    return [unit, areaTxt].filter(Boolean).join(" • ");
  };


  const floorLine = (p: any) => {
    const f = p?.floor || "";
    const total = p?.total_floors ? `of ${p.total_floors}` : "";
    return [f && ` ${f}`, total].filter(Boolean).join(" ");
  };

  const facingFrom = (p: any) =>
    p?.facing ||
    p?.facing_name ||
    p?.facing_type ||
    p?.direction ||
    p?.direction_name ||
    p?.orientation ||
    p?.property_facing ||
    p?.property_facing_name ||
    "—";

  const parkingFrom = (p: any) => {
    const qty = p?.parking_qty ? String(p.parking_qty) : "";
    const type = p?.parking_type || "";
    return [qty, type].filter(Boolean).join(" ");
  };

  const possessionFrom = (p: any) => {
    const y = Number(p?.possession_year);
    const m = Number(p?.possession_month);
    if (y && m) {
      const dt = new Date(y, m - 1, 1);
      const now = new Date();
      if (dt <= now) return "Ready to Move";
      return dt.toLocaleString("en-IN", { month: "short", year: "numeric" });
    }
    return p?.status === "Available" ? "Ready to Move" : p?.status || "—";
  };

  // ---------------- reasons (chips) ----------------
  const computeReasons = (p: any) => {
    const reasons: string[] = [];
    const price = priceFrom(p);
    const bMin = Number(buyer?.budget?.min ?? buyer?.budgetMin ?? 0);
    const bMax = Number(buyer?.budget?.max ?? buyer?.budgetMax ?? 0);
    if (price && (bMin || bMax)) {
      if ((!bMin || price >= bMin) && (!bMax || price <= bMax)) reasons.push("💰 Perfect budget match");
      else if (bMin && bMax && price >= bMin * 0.9 && price <= bMax * 1.1) reasons.push("💸 Near your budget");
    }
    const u = unitTypeFrom(p);
    if (reqUnitTypes.length && u && reqUnitTypes.includes(u)) reasons.push(`🛏️ ${u.toUpperCase()} as preferred`);
    const locHits = reqLocs.length ? hasAny(locTokensFrom(p), reqLocs) : false;
    if (locHits) reasons.push("📍 Preferred location");
    const propAmns = amenitiesFrom(p);
    if (reqAmenities.length && propAmns.length) {
      const hit = reqAmenities.filter((a: string) => propAmns.includes(a));
      if (hit.length) reasons.push(`🏗️ Amenities matched (${hit.slice(0, 50).join(", ")})`);
    }
    const pfacing = norm(facingFrom(p));
    if (reqFacing && pfacing && reqFacing === pfacing) reasons.push(`🧭 ${reqFacing} facing`);
    const pfurn = furnishingFrom(p);
    if (reqFurnishing && pfurn && reqFurnishing === pfurn) reasons.push(`🛋️ ${reqFurnishing}`);
    const ppos = norm(possessionFrom(p));
    if (reqPossession && ppos && ppos.includes(reqPossession)) reasons.push(`🗓️ ${reqPossession}`);
    const ptype = propTypeFrom(p);
    if (reqPropType && ptype && ptype.includes(reqPropType)) reasons.push(`🏢 ${reqPropType} type`);
    const fl = norm(p?.floor || "");
    if (reqFloorPref) {
      if (reqFloorPref.includes("ground") && (fl.includes("ground") || fl === "0")) reasons.push("🏠 Ground floor");
      if (reqFloorPref.includes("higher") && /\d+/.test(fl) && Number(fl) >= 7) reasons.push("⬆️ Higher floor");
      if (reqFloorPref.includes("lower") && /\d+/.test(fl) && Number(fl) <= 3) reasons.push("⬇️ Lower floor");
    }
    if (reqKeywords.length) {
      const blob = descriptionFrom(p) + " " + amenitiesFrom(p).join(" ");
      const kwHit = reqKeywords.filter((k: string) => blob.includes(k)).slice(0, 50);
      if (kwHit.length) reasons.push(`✨ Matches: ${kwHit.join(", ")}`);
    }
    return reasons;
  };

  // ---------------- match score (weighted) ----------------
  const computeMatchScore = (p: any) => {
    let score = 0;
    const price = priceFrom(p);
    const bMin = Number(buyer?.budget?.min ?? buyer?.budgetMin ?? 0);
    const bMax = Number(buyer?.budget?.max ?? buyer?.budgetMax ?? 0);
    if (price && (bMin || bMax)) {
      if ((!bMin || price >= bMin) && (!bMax || price <= bMax)) score += 25;
      else if (bMin && bMax && price >= bMin * 0.9 && price <= bMax * 1.1) score += 15;
      else score += 5;
    }
    if (reqLocs.length && hasAny(locTokensFrom(p), reqLocs)) score += 20;
    if (reqUnitTypes.length && reqUnitTypes.includes(unitTypeFrom(p))) score += 15;
    if (reqAmenities.length) {
      const hits = reqAmenities.filter((a: string) => amenitiesFrom(p).includes(a)).length;
      if (hits >= 3) score += 15;
      else if (hits === 2) score += 10;
      else if (hits === 1) score += 6;
    }
    if (reqFacing && norm(facingFrom(p)) === reqFacing) score += 8;
    if (reqFurnishing && furnishingFrom(p) === reqFurnishing) score += 6;
    if (reqPossession && norm(possessionFrom(p)).includes(reqPossession)) score += 6;
    if (reqPropType && propTypeFrom(p).includes(reqPropType)) score += 3;
    const fl = norm(p?.floor || "");
    if (reqFloorPref) {
      if (reqFloorPref.includes("ground") && (fl.includes("ground") || fl === "0")) score += 2;
      else if (reqFloorPref.includes("higher") && /\d+/.test(fl) && Number(fl) >= 7) score += 2;
      else if (reqFloorPref.includes("lower") && /\d+/.test(fl) && Number(fl) <= 3) score += 2;
    }
    if (reqKeywords.length) {
      const blob = descriptionFrom(p) + " " + amenitiesFrom(p).join(" ");
      const hits = reqKeywords.filter((k: string) => blob.includes(k)).length;
      score += Math.min(5, hits * 2);
    }
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const photoFrom = (p: any) => {
    const first = Array.isArray(p?.photos) && p.photos.length ? p.photos[0] : "";
    return typeof first === "string" ? first : first?.url || "";
  };

  // ---------------- items (with budget filter) ----------------
  const items = useMemo(() => {
    const filtered = properties.filter(isWithinBuyerBudget);
    return filtered.map((p: any) => {
      const reasons = computeReasons(p);
      return {
        id: String(p?.id ?? p?.property_id ?? Math.random()),
        title: titleFrom(p),
        address: addressFrom(p),
        price: priceFrom(p),
        size: sizeFrom(p),
        floorLine: floorLine(p),
        facing: facingFrom(p),
        parking: parkingFrom(p),
        possession: possessionFrom(p),
        amenities: p?.amenities || [],
        seller: sellerFrom(p),
        sellerPhone: sellerPhoneFrom(p),
        statusText: p?.status || "Available",
        matchScore: computeMatchScore(p),
        photo: photoFrom(p),
        _raw: p, // FULL RAW OBJECT
        reasons,
      };
    });
  }, [properties, buyer]);

  // ---------------- selected items + full raw ----------------
  const selectedItems = useMemo(
    () => items.filter((it) => selected.has(it.id)),
    [items, selected]
  );
  const selectedRaw = useMemo(
    () => selectedItems.map((it) => it._raw),
    [selectedItems]
  );

  // ---------------- actions ----------------
  const toggleShortlist = (id: string) => {
    setShortlisted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const contactSeller = (name: string, phone: string, title: string) => {
    const clean = (phone || "").replace(/\D/g, "");
    if (!clean) return;
    const msg = `Hi ${name || "there"}, I’d like to discuss your property: ${title}.`;
    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // ---------------- render ----------------
  return (
    <>
      <div className="space-y-4">
        {/* Action Buttons */}
        <div className="flex items-center justify-between space-x-2">
          <button
            onClick={onShowPropertyMatch}
            className="flex items-center space-x-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
          >
            <Target size={14} />
            <span>Find Matching Properties</span>
          </button>

          {selected.size > 0 && (
            <button
              onClick={() => setOpenPropertyDetailsShareModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs"
            >
              Share ({selected.size})
            </button>
          )}
        </div>

        {/* Loading / Error */}
        {loadingProps && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-sm text-gray-600">
            Loading properties…
          </div>
        )}
        {propsError && !loadingProps && (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 text-center text-sm text-red-600">
            {propsError}
          </div>
        )}

        {/* Cards */}
        {!loadingProps && !propsError && items.length > 0 && (
          <div className="space-y-3">
            {items.map((property) => (
              <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    className="mt-2 accent-blue-600"
                    checked={selected.has(property.id)}
                    onChange={() => toggleSelect(property.id)}
                  />

                  {/* Photo */}
                  <div className="w-28 h-20 rounded-lg overflow-hidden bg-gray-100 flex-none">
                    {property.photo ? (
                      <img src={property.photo} alt={property.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Main content */}
                  <div className="flex-1">
                    {/* Title + price */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">{property.title}</h4>
                        <div className="flex items-center space-x-1 text-gray-600 mt-0.5 text-xs">
                          <MapPin size={12} />
                          <span>{property.address || "—"}</span>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <div
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${getMatchScoreColor(
                              property.matchScore
                            )}`}
                          >
                            {property.matchScore}% Match
                          </div>
                          {getAvailabilityBadge(property.statusText)}
                          {shortlisted.has(property.id) && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-100 text-purple-700">
                              ⭐ Shortlisted
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-bold text-green-600">
                          {formatCurrency(property.price)}
                        </div>
                        <div className="text-[11px] text-gray-500">{property.size}</div>
                      </div>
                    </div>

                    {/* Attributes row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 mt-3 text-xs">
                      <div>
                        <span className="text-gray-500">Floor:</span>{" "}
                        <span className="font-semibold">{property.floorLine || "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Facing:</span>{" "}
                        <span className="font-semibold">{property.facing}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Parking:</span>{" "}
                        <span className="font-semibold">{property.parking || "—"}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Possession:</span>{" "}
                        <span className="font-semibold">{property.possession}</span>
                      </div>
                    </div>

                    {/* Why it matches */}
                    {property.reasons?.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-500 mb-1">Why it matches:</div>
                        <div className="flex flex-wrap gap-1">
                          {property.reasons.slice(0, 4).map((r: string, i: number) => (
                            <span
                              key={`${r}-${i}`}
                              className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-600"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Amenities */}
                    {Array.isArray(property.amenities) && property.amenities.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs text-gray-500 mb-1">Amenities:</div>
                        <div className="flex flex-wrap gap-1">
                          {property.amenities.slice(0, 50).map((a: string, i: number) => (
                            <span
                              key={`${a}-${i}`}
                              className="px-2 py-0.5 rounded-full text-[11px] bg-gray-100 text-gray-700"
                            >
                              {a}
                            </span>
                          ))}
                          {property.amenities.length > 50 && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] bg-gray-100 text-gray-500">
                              +{property.amenities.length - 50} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Seller row + contact pill */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-xs text-gray-700">
                        <span className="text-gray-500">Seller: </span>
                        <span className="font-medium">{property.seller}</span>
                        <span className="mx-2 text-gray-400">|</span>
                        <span className="text-gray-500">Contact: </span>
                        <span className="font-medium">{property.sellerPhone || "—"}</span>
                      </div>

                      {property.sellerPhone && (
                        <button
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs hover:bg-emerald-100"
                          onClick={() => contactSeller(property.seller, property.sellerPhone, property.title)}
                        >
                          <MessageCircle size={14} /> Contact
                        </button>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
                        onClick={() => onVisitClick?.(property)}
                      >
                        <Calendar size={14} />
                        <span>Visit</span>
                      </button>


                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs"
                        onClick={() => toggleShortlist(property.id)}
                      >
                        <Heart size={12} />
                        <span>{shortlisted.has(property.id) ? "Shortlisted" : "Shortlist"}</span>
                      </button>

                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs"
                        onClick={() => onDetailsClick?.(property)}
                        disabled={!onDetailsClick}
                        title={onDetailsClick ? "Details" : "Wire a details handler to enable"}
                      >
                        Details
                      </button>

                      {property.sellerPhone && (
                        <a
                          href={`tel:${property.sellerPhone}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-xs"
                        >
                          <Phone size={14} />
                          <span>Call</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loadingProps && !propsError && items.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Building className="mx-auto text-gray-300 mb-3" size={48} />
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              No Properties in Your Budget
            </h3>
            <p className="text-gray-500 text-xs mb-4">
              Try adjusting the buyer’s budget or broaden the filters.
            </p>
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={onShowPropertyMatch}
                className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs"
              >
                <Target size={14} />
                <span>Find Properties</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {openPropertyDetailsShareModal && (
        <PropertyDetailsShareModal
          isOpen={openPropertyDetailsShareModal}
          onClose={() => setOpenPropertyDetailsShareModal(false)}
          selectedProperties={selectedRaw}  // <-- FULL RAW DATA HERE
          buyer={buyer}
        />
      )}
    </>
  );
};








// Activities Tab Component
const ActivitiesTab = ({ buyer, onAddActivity, onEditActivity }: any) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="text-blue-600" size={16} />;
      case 'visit': return <Eye className="text-green-600" size={16} />;
      case 'meeting': return <Users className="text-purple-600" size={16} />;
      case 'email': return <Mail className="text-orange-600" size={16} />;
      case 'whatsapp': return <MessageCircle className="text-green-600" size={16} />;
      default: return <Activity className="text-gray-600" size={16} />;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    const labels = {
      'call': 'Phone Call',
      'visit': 'Property Visit',
      'meeting': 'Meeting',
      'email': 'Email',
      'whatsapp': 'WhatsApp',
      'presentation': 'Presentation'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap md:flex-nowrap items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-900 mb-1 md:mb-0">
          Activity Timeline
        </h3>
        <button
          onClick={onAddActivity}
          className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={14} />
          <span>Add Activity</span>
        </button>
      </div>

      {buyer.activities?.length > 0 ? (
        <div className="space-y-2">
          {buyer.activities.map((activity: any, index: number) => (
            <div key={activity.id} className="relative">
              {/* Timeline line */}
              {index < buyer.activities.length - 1 && (
                <div className="absolute left-5 top-10 w-0.5 h-12 bg-gray-200"></div>
              )}

              <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className="p-2 bg-white border border-gray-200 rounded-full">
                  {getActivityIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900 text-xs">
                        {activity.description}
                      </h4>
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-medium">
                        {getActivityTypeLabel(activity.type)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] text-gray-500">
                        {activity.date} • {activity.time}
                      </span>
                      <button
                        onClick={() => onEditActivity(activity)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <Edit size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2 text-[11px]">
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium ml-1">{activity.duration}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Stage:</span>
                      <span className="font-medium ml-1">
                        {activity.stage.replace("_", " ")}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Executed by:</span>
                      <span className="font-medium ml-1">{activity.executedBy}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Rating:</span>
                      <div className="flex items-center space-x-0.5 ml-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            size={10}
                            className={
                              i < activity.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div>
                      <span className="text-gray-500">Outcome:</span>
                      <p className="text-gray-700">{activity.outcome}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Next Action:</span>
                      <p className="text-gray-700">{activity.nextAction}</p>
                    </div>
                    {activity.remarks && (
                      <div>
                        <span className="text-gray-500">Remarks:</span>
                        <p className="text-gray-700">{activity.remarks}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded border border-gray-200 p-6 text-center">
          <Activity className="mx-auto text-gray-300 mb-3" size={40} />
          <h3 className="text-xs font-semibold text-gray-900 mb-1">
            No Activities Yet
          </h3>
          <p className="text-[11px] text-gray-500 mb-3">
            Start tracking buyer interactions and activities
          </p>
          <button
            onClick={onAddActivity}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
          >
            Add First Activity
          </button>
        </div>
      )}
    </div>

  );
};


// --- keep your existing imports (React, useState, useEffect, icons like Layers, TrendingUp, Tag, Play, AlertCircle, Calendar, CheckCircle2, User, Clock, Plus, Edit, Bell, CalendarIcon etc.)
// --- keep your existing imports (React, useState, useEffect, icons like Layers, TrendingUp, Tag, Play, AlertCircle, Calendar, CheckCircle2, User, Clock, Plus, Edit, Bell, CalendarIcon etc.)




/** Followup interface (updated with created/updated fields) */
export interface Followup {
  id: string;
  description: string;
  status: string | null;
  date: string | null;
  time: string | null;
  priority: string | null;
  assignedTo: string | null;
  type: string | null;
  remark: string | null;
  reminder: boolean;
  raw: any;
  category?: "sales" | "presales";
  transferredFromLead?: boolean;

  buyerLeadStage?: string | null;
  buyerLeadStatus?: string | null;
  customRemark?: string | null;
  followupType?: string | null;
  nextAction?: string | null;
  scheduleDate?: string | null;
  scheduleTime?: string | null;
  transferredAt?: string | null;

  createdAt?: string | null;
  updatedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
}

interface FollowupsTabProps {
  buyer: any;
  onAddFollowup: () => void;
  onEditFollowup: (followup: any) => void;
}

const getStatusConfig = () => ({
  pending: { bg: "bg-orange-100", text: "text-orange-700", label: "Pending", icon: "⏳" },
  scheduled: { bg: "bg-blue-100", text: "text-blue-700", label: "Scheduled", icon: "📅" },
  completed: { bg: "bg-green-100", text: "text-green-700", label: "Completed", icon: "✅" },
  cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled", icon: "❌" },
  inProgress: { bg: "bg-indigo-100", text: "text-indigo-700", label: "In Progress", icon: "🔄" },
  onHold: { bg: "bg-yellow-100", text: "text-yellow-700", label: "On Hold", icon: "⏸️" },
  followUp: { bg: "bg-purple-100", text: "text-purple-700", label: "Follow Up", icon: "📞" },
  interested: { bg: "bg-green-100", text: "text-green-700", label: "Interested", icon: "👍" },
  notInterested: { bg: "bg-gray-100", text: "text-gray-700", label: "Not Interested", icon: "👎" },
  contacted: { bg: "bg-teal-100", text: "text-teal-700", label: "Contacted", icon: "📧" },
  meeting: { bg: "bg-pink-100", text: "text-pink-700", label: "Meeting", icon: "🤝" },
  proposal: { bg: "bg-amber-100", text: "text-amber-700", label: "Proposal", icon: "📋" },
  negotiation: { bg: "bg-violet-100", text: "text-violet-700", label: "Negotiation", icon: "💼" },
  closed: { bg: "bg-slate-100", text: "text-slate-700", label: "Closed", icon: "🔐" }
});

const getPriorityConfig = () => ({
  urgent: { border: "border-l-red-600", bg: "bg-red-50", text: "text-red-700", badge: "bg-red-100" },
  high: { border: "border-l-red-500", bg: "bg-red-50", text: "text-red-700", badge: "bg-red-100" },
  medium: { border: "border-l-yellow-500", bg: "bg-yellow-50", text: "text-yellow-700", badge: "bg-yellow-100" },
  normal: { border: "border-l-blue-500", bg: "bg-blue-50", text: "text-blue-700", badge: "bg-blue-100" },
  low: { border: "border-l-green-500", bg: "bg-green-50", text: "text-green-700", badge: "bg-green-100" },
  minimal: { border: "border-l-gray-400", bg: "bg-gray-50", text: "text-gray-700", badge: "bg-gray-100" }
});

const getFieldConfig = () => ({
  buyerLeadStage: { label: "Lead Stage", icon: Layers, color: "bg-indigo-100 text-indigo-700", priority: 1 },
  buyerLeadStatus: { label: "Lead Status", icon: TrendingUp, color: "bg-blue-100 text-blue-700", priority: 2 },
  followupType: { label: "Follow-up Type", icon: Tag, color: "bg-purple-100 text-purple-700", priority: 3 },
  nextAction: { label: "Next Action", icon: Play, color: "bg-yellow-100 text-yellow-700", priority: 4 },
  customRemark: { label: "Remarks", icon: AlertCircle, color: "bg-pink-100 text-pink-700", priority: 5 },
  scheduleDate: { label: "Scheduled", icon: Calendar, color: "bg-green-100 text-green-700", priority: 6 },
  transferredAt: { label: "Transferred", icon: CheckCircle2, color: "bg-orange-100 text-orange-700", priority: 7 },
  assignedTo: { label: "Assigned To", icon: User, color: "bg-teal-100 text-teal-700", priority: 8 },
  type: { label: "Type", icon: Clock, color: "bg-gray-100 text-gray-700", priority: 9 },
  priority: { label: "Priority", icon: Flag, color: "bg-gray-100 text-gray-700", priority: 11 },
  createdAt: { label: "Created", icon: Calendar, color: "bg-gray-50 text-gray-700", priority: 90 },
  updatedAt: { label: "Updated", icon: Calendar, color: "bg-gray-50 text-gray-700", priority: 91 },
  createdBy: { label: "Created By", icon: User, color: "bg-gray-50 text-gray-700", priority: 92 },
  updatedBy: { label: "Updated By", icon: User, color: "bg-gray-50 text-gray-700", priority: 93 }
});

const pad = (n: number) => String(n).padStart(2, "0");

function formatDate(isoOrDate?: string | null): string {
  if (!isoOrDate) return "";
  let d = new Date(isoOrDate);
  if (isNaN(d.getTime())) {
    const m = String(isoOrDate).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) {
      const year = Number(m[1]);
      const month = Number(m[2]) - 1;
      const day = Number(m[3]);
      d = new Date(year, month, day);
    } else {
      return "";
    }
  }
  const dd = pad(d.getDate());
  const mm = pad(d.getMonth() + 1);
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function formatTime(timeOrIso?: string | null): string {
  if (!timeOrIso) return "";
  const s = String(timeOrIso);

  let dateObj: Date | null = null;

  if (s.includes("T") || s.endsWith("Z")) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) dateObj = d;
  } else {
    const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (m) {
      const hh = Number(m[1]);
      const mm = Number(m[2]);
      const ss = Number(m[3] ?? 0);
      const d = new Date();
      d.setHours(hh, mm, ss, 0);
      dateObj = d;
    } else {
      const d2 = new Date(s);
      if (!isNaN(d2.getTime())) dateObj = d2;
    }
  }

  if (!dateObj) return "";

  let hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${hours}:${pad(minutes)} ${ampm}`;
}

const FollowupsTab: React.FC<FollowupsTabProps> = ({ buyer, onAddFollowup, onEditFollowup }) => {
  const [followups, setFollowups] = useState<Followup[]>(buyer?.followups ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"sales" | "presales">("sales");

  const statusConfig = getStatusConfig();
  const priorityConfig = getPriorityConfig();
  const fieldConfig = getFieldConfig();

  const getFollowupStatusBadge = (status: string | null) => {
    if (!status) return null;
    const normalizedStatus = status.toString().toLowerCase().replace(/[^a-z]/g, "");
    let cfg = (statusConfig as any)[normalizedStatus];
    if (!cfg) {
      const keys = Object.keys(statusConfig);
      const matched = keys.find(k => normalizedStatus.includes(k) || k.includes(normalizedStatus));
      cfg = matched ? (statusConfig as any)[matched] : null;
    }
    if (!cfg) cfg = { bg: "bg-gray-100", text: "text-gray-700", label: status, icon: "ℹ️" };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
        <span className="mr-1">{cfg.icon}</span>
        {cfg.label}
      </span>
    );
  };

  const getPriorityColor = (priority: string | null) => {
    if (!priority) return "border-l-gray-500 bg-gray-50";
    const normalized = priority.toString().toLowerCase();
    const cfg = (priorityConfig as any)[normalized] || priorityConfig.normal;
    return `${cfg.border} ${cfg.bg}`;
  };

  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return null;
    const normalized = priority.toString().toLowerCase();
    const cfg = (priorityConfig as any)[normalized] || priorityConfig.normal;
    const label = `${(priority || "").toString().charAt(0).toUpperCase() + (priority || "").toString().slice(1)}`;
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.badge} ${cfg.text}`}>
        {label}
      </span>
    );
  };

  const renderDynamicFields = (followup: Followup) => {
    const topFields: { key: string; value: any }[] = [
      { key: "buyerLeadStage", value: followup.buyerLeadStage },
      { key: "buyerLeadStatus", value: followup.buyerLeadStatus ?? getFollowupStatusBadge(followup.status) },
      { key: "priority", value: followup.priority ? getPriorityBadge(followup.priority) : null },
      { key: "followupType", value: followup.followupType ?? followup.type },
      { key: "assignedTo", value: followup.assignedTo },
      {
        key: "scheduleDate",
        value: followup.scheduleDate
          ? `${formatDate(followup.scheduleDate)}${(followup.scheduleTime || followup.time) ? ` • ${formatTime(followup.scheduleTime || followup.time)}` : ""}`
          : followup.date
            ? `${formatDate(followup.date)}${followup.time ? ` • ${formatTime(followup.time)}` : ""}`
            : null
      },
      ...(followup.transferredAt ? [{
        key: "transferredAt",
        value: `${formatDate(followup.transferredAt)}${followup.transferredAt ? ` • ${formatTime(followup.transferredAt)}` : ""}`
      }] : [])
    ].filter(f => f.value !== null && f.value !== undefined && f.value !== "");

    const bottomFields: { key: string; value: any }[] = [
      { key: "nextAction", value: followup.nextAction },
      { key: "customRemark", value: followup.customRemark ?? followup.remark }
    ].filter(f => f.value !== null && f.value !== undefined && f.value !== "");

    if (followup.category === "sales") {
      const createdVal = followup.createdAt ? `${formatDate(followup.createdAt)}${formatTime(followup.createdAt) ? ` • ${formatTime(followup.createdAt)}` : ""}` : null;
      const updatedVal = followup.updatedAt ? `${formatDate(followup.updatedAt)}${formatTime(followup.updatedAt) ? ` • ${formatTime(followup.updatedAt)}` : ""}` : null;

      if (createdVal) bottomFields.push({ key: "createdAt", value: createdVal });
      if (followup.createdBy) bottomFields.push({ key: "createdBy", value: followup.createdBy });
      if (updatedVal) bottomFields.push({ key: "updatedAt", value: updatedVal });
      if (followup.updatedBy) bottomFields.push({ key: "updatedBy", value: followup.updatedBy });
    }

    topFields.sort((a, b) => {
      const pa = (fieldConfig as any)[a.key]?.priority ?? 99;
      const pb = (fieldConfig as any)[b.key]?.priority ?? 99;
      return pa - pb;
    });

    const renderFieldRow = (field: any, fullRow: boolean) => {
      const cfg = (fieldConfig as any)[field.key];
      const IconComp = cfg?.icon;
      const iconSize = field.key === "type" ? 16 : 14;
      const iconEl = IconComp ? React.createElement(IconComp, { size: iconSize, className: "inline-block" }) : null;
      const wrapperClass = fullRow ? "md:col-span-2 flex items-start space-x-2" : "flex items-start space-x-2";

      if (!cfg) {
        return (
          <div key={field.key} className={wrapperClass}>
            <span className="text-gray-500 w-32">{field.key}:</span>
            <span className="font-medium flex-1 break-words">{field.value}</span>
          </div>
        );
      }

      if (field.key === "type") {
        return (
          <div key={field.key} className={wrapperClass}>
            <div className="w-32 flex items-center text-xs text-gray-500">
              <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full mr-2 ${cfg.color}`}>
                {iconEl}
              </span>
              <span className="text-xs">{cfg.label}:</span>
            </div>
            <div className="font-semibold text-sm flex-1 break-words">{field.value}</div>
          </div>
        );
      }

      const isElement = React.isValidElement(field.value);

      return (
        <div key={field.key} className={wrapperClass}>
          <div className="w-32 flex items-center text-xs text-gray-500">
            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-2 ${cfg.color}`}>
              {iconEl}
            </span>
            <span>{cfg.label}:</span>
          </div>
          <div className="font-medium text-xs flex-1 break-words">
            {isElement ? field.value : <span className="break-words">{field.value}</span>}
          </div>
        </div>
      );
    };

    return (
      <>
        {topFields.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {topFields.map((f) => renderFieldRow(f, false))}
          </div>
        )}

        {bottomFields.length > 0 && (
          <div className="mt-2 space-y-2 text-xs">
            {/* normal bottom fields (nextAction, remark) */}
            {bottomFields
              .filter(f => !["createdAt", "createdBy", "updatedAt", "updatedBy"].includes(f.key))
              .map((f) => {
                const cfg = (fieldConfig as any)[f.key];
                const IconComp = cfg?.icon;
                const iconEl = IconComp ? React.createElement(IconComp, { size: 14, className: "inline-block" }) : null;
                return (
                  <div key={f.key} className="flex items-start space-x-2">
                    {cfg ? (
                      <>
                        <div className="w-32 flex items-center text-xs text-gray-500">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-2 ${cfg.color}`}>
                            {iconEl}
                          </span>
                          <span>{cfg.label}:</span>
                        </div>
                        <div className="font-medium text-xs flex-1 break-words whitespace-pre-wrap">{f.value}</div>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-500 w-32">{f.key}:</span>
                        <span className="font-medium flex-1 break-words whitespace-pre-wrap">{f.value}</span>
                      </>
                    )}
                  </div>
                );
              })}

            {/* created/updated meta fields in 2-column grid */}
            {followup.category === "sales" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {["createdAt", "createdBy", "updatedAt", "updatedBy"].map((key) => {
                  const f = bottomFields.find(b => b.key === key);
                  if (!f) return null;
                  const cfg = (fieldConfig as any)[key];
                  const IconComp = cfg?.icon;
                  const iconEl = IconComp ? React.createElement(IconComp, { size: 14, className: "inline-block" }) : null;
                  return (
                    <div key={f.key} className="flex items-start space-x-2">
                      {cfg ? (
                        <>
                          <div className="w-28 flex items-center text-xs text-gray-500">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-1 ${cfg.color}`}>
                              {iconEl}
                            </span>
                            <span>{cfg.label}:</span>
                          </div>
                          <div className="font-medium text-xs flex-1 break-words whitespace-pre-wrap">{f.value}</div>
                        </>
                      ) : (
                        <>
                          <span className="text-gray-500 w-28">{f.key}:</span>
                          <span className="font-medium flex-1 break-words whitespace-pre-wrap">{f.value}</span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  // -----------------------
  // Normalizer (updated: prioritize createdByName / updatedByName)
  // -----------------------
  const mapAndNormalize = (arr: any[]) =>
    (arr || []).map((f: any) => {
      const transferredFromLead =
        f.transferredFromLead === true ||
        f.transferredFromLead === 1 ||
        f.transferredFromLead === "1" ||
        f.transferred_from_lead === 1 ||
        f.transferred_from_lead === "1" ||
        f.transferred_from_lead === true;

      const assignedToName =
        f.transferredByName ??
        f.transferred_by_name ??
        f.createdByName ??
        f.created_by_name ??
        f.updatedByName ??
        f.updated_by_name ??
        f.assignedTo ??
        f.assignee ??
        (f.createdBy || f.created_by) ??
        null;

      let transferredAtRaw =
        f.transferredAt ??
        f.transferred_at ??
        f.transfers?.map?.((t: any) => t.date || t.transferredAt || t.transferred_at)?.filter(Boolean)?.sort()?.[0] ??
        f.transfer_history?.map?.((t: any) => t.date || t.transferredAt || t.transferred_at)?.filter(Boolean)?.sort()?.[0] ??
        null;

      if (!transferredAtRaw && Array.isArray(f.transfers) && f.transfers.length > 0) {
        const dates = f.transfers.map((t: any) => new Date(t.date || t.transferredAt || t.transferred_at)).filter(d => !isNaN(d.getTime()));
        if (dates.length > 0) transferredAtRaw = dates.sort((a: Date, b: Date) => a.getTime() - b.getTime())[0].toISOString();
      }

      if (!transferredAtRaw && Array.isArray(f.transfer_history) && f.transfer_history.length > 0) {
        const dates = f.transfer_history.map((t: any) => new Date(t.date || t.transferredAt || t.transferred_at)).filter(d => !isNaN(d.getTime()));
        if (dates.length > 0) transferredAtRaw = dates.sort((a: Date, b: Date) => a.getTime() - b.getTime())[0].toISOString();
      }

      // --- CREATED / UPDATED: prefer name fields if available ---
      const createdAtRaw = f.createdAt ?? f.created_at ?? f.created_at_iso ?? f.createdOn ?? f.created_on ?? null;
      const updatedAtRaw = f.updatedAt ?? f.updated_at ?? f.updated_at_iso ?? f.updatedOn ?? f.updated_on ?? null;

      // Prefer explicit "Name" fields for display. If name not present, fallback to id/string fields.
      const createdByRaw =
        f.createdByName ?? f.created_by_name ??
        f.createdBy ?? f.created_by ??
        f.creator_name ?? f.creator ?? null;

      const updatedByRaw =
        f.updatedByName ?? f.updated_by_name ??
        f.updatedBy ?? f.updated_by ??
        f.updater_name ?? f.updater ?? null;

      return {
        id:
          f.id ??
          f.followupId ??
          f._id ??
          `${f.buyerId ?? "b"}-${Math.random().toString(36).slice(2, 8)}`,
        description: f.description ?? f.remark ?? f.customRemark ?? f.title ?? "Follow-up",
        status: (f.status ?? f.buyerLeadStatus ?? f.leadStatus ?? null) as string | null,
        date: f.date ?? f.scheduleDate ?? f.createdAt ?? null,
        time: f.time ?? f.scheduleTime ?? null,
        transferredAt: transferredAtRaw ?? null,
        priority: f.priority ?? null,
        assignedTo: assignedToName,
        type: f.type ?? f.followupType ?? null,
        remark: f.remark ?? f.customRemark ?? null,
        reminder: !!(f.reminder ?? false),
        raw: f,
        category: transferredFromLead ? "presales" : "sales",
        transferredFromLead,

        buyerLeadStage: f.buyerLeadStage ?? f.buyer_lead_stage ?? null,
        buyerLeadStatus: f.buyerLeadStatus ?? f.buyer_lead_status ?? null,
        customRemark: f.customRemark ?? f.custom_remark ?? null,
        followupType: f.followupType ?? f.followup_type ?? null,
        nextAction: f.nextAction ?? f.next_action ?? null,
        scheduleDate: f.scheduleDate ?? f.schedule_date ?? null,
        scheduleTime: f.scheduleTime ?? f.schedule_time ?? null,

        createdAt: createdAtRaw ?? null,
        updatedAt: updatedAtRaw ?? null,
        // prefer name fields for display
        createdBy: createdByRaw ?? null,
        updatedBy: updatedByRaw ?? null
      } as Followup;
    });

  useEffect(() => {
    let cancelled = false;
    const buyerId = buyer?.id ?? buyer?.buyerId ?? null;

    const fetchForBuyer = async () => {
      if (!buyerId) {
        setFollowups(mapAndNormalize(buyer?.followups ?? []));
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // replace buyerFollowupAPI.getAll with your actual API call
        const res = await (buyerFollowupAPI?.getAll?.({ buyerId, page: 1, limit: 200 }) ?? Promise.resolve({ data: buyer?.followups ?? [] }));
        
        const raw =
          res?.data ??
          res ??
          (res?.success ? res.data : undefined) ??
          (res?.data?.data ? res.data.data : undefined);
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : raw ?? [];
        if (!cancelled) setFollowups(mapAndNormalize(list));
      } catch (err: any) {
        toast.warn("Error fetching followups by buyerId:", err);
        if (!cancelled) {
          setError(err?.message ?? String(err));
          setFollowups(mapAndNormalize(buyer?.followups ?? []));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchForBuyer();
    return () => {
      cancelled = true;
    };
  }, [buyer?.id, buyer?.buyerId, buyer?.followups]);

  const filteredFollowups = followups.filter((f) =>
    activeTab === "sales" ? f.category === "sales" : f.category === "presales"
  );

  const salesCount = followups.filter(f => f.category === "sales").length;
  const presalesCount = followups.filter(f => f.category === "presales").length;

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 text-xs">
        <button
          onClick={() => setActiveTab("sales")}
          className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${activeTab === "sales" ? "bg-purple-600 text-white shadow-md transform scale-105" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          Sales Follow-ups {salesCount > 0 && `(${salesCount})`}
        </button>
        <button
          onClick={() => setActiveTab("presales")}
          className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${activeTab === "presales" ? "bg-purple-600 text-white shadow-md transform scale-105" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          Pre-Sales Follow-ups {presalesCount > 0 && `(${presalesCount})`}
        </button>
        <button
          onClick={onAddFollowup}
          className="ml-auto flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 hover:shadow-md transform hover:scale-105"
        >
          <Plus size={12} />
          <span>Schedule</span>
        </button>
      </div>

      {/* show title for active tab like you requested */}
      {activeTab === "presales" && <h3 className="text-sm font-semibold text-gray-800">Presales History</h3>}
      {activeTab === "sales" && <h3 className="text-sm font-semibold text-gray-800">Sales History</h3>}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent"></div>
          <p className="text-xs text-gray-500 ml-2">Loading followups...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-xs text-red-700 flex items-center">
          <span className="mr-2">⚠️</span>
          Failed to load followups: {error}
        </div>
      ) : filteredFollowups.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFollowups.map((followup, idx) => {
              const key = followup.id ?? `${idx}-${(followup.description ?? "followup").slice(0, 20)}`;
              const dynamicFields = renderDynamicFields(followup);

              return (
                <div key={key} className={`border-l-4 rounded-lg p-4 transition-all duration-200 hover:shadow-md ${getPriorityColor(followup.priority)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex justify-between items-center text-[11px]">
                      {/* Badge: show Pre-Sales or Sales depending on category */}
                      {followup.category === "presales" && (
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-indigo-100 text-indigo-700 font-medium flex items-center">
                          📋 <span className="ml-1">Pre-Sales</span>
                        </span>
                      )}
                      {followup.category === "sales" && (
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-100 text-amber-700 font-medium flex items-center">
                          💼 <span className="ml-1">Sales</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-2">
                      <span className="text-[10px] text-gray-500 whitespace-nowrap">
                        {followup.transferredAt && (
                          <span className="text-gray-500">
                            Transferred Date:{" "}
                            <span className="font-medium text-gray-700">
                              {formatDate(followup.transferredAt)}
                              {formatTime(followup.transferredAt) ? ` • ${formatTime(followup.transferredAt)}` : ""}
                            </span>
                          </span>
                        )}
                      </span>

                      {followup.category !== "presales" && (
                        <button
                          onClick={() => {
                            if (followup.transferredFromLead) return;
                            onEditFollowup(followup.raw ?? followup);
                          }}
                          disabled={!!followup.transferredFromLead}
                          className={`p-1.5 rounded-md transition-all duration-200 ${followup.transferredFromLead ? "text-gray-400 cursor-not-allowed" : "text-purple-600 hover:bg-purple-100 hover:scale-110"}`}
                          title={followup.transferredFromLead ? "This follow-up was transferred (pre-sales) and cannot be edited." : "Edit follow-up"}
                        >
                          <Edit size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {dynamicFields}

                  {followup.reminder && (
                    <div className="mt-3 flex items-center space-x-1 text-[11px] bg-purple-50 rounded-md px-2 py-1">
                      <Bell className="text-purple-600" size={12} />
                      <span className="text-purple-700 font-medium">🔔 Reminder set</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <CalendarIcon className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            No {activeTab === "sales" ? "Sales" : "Pre-Sales"} Follow-ups Scheduled
          </h3>
          <p className="text-gray-500 text-xs mb-6">
            {activeTab === "sales"
              ? "Schedule follow-ups to maintain buyer engagement and close deals"
              : "Track pre-sales activities and lead nurturing efforts"
            }
          </p>
          <button
            onClick={onAddFollowup}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 text-sm font-medium hover:shadow-md transform hover:scale-105"
          >
            Schedule First Follow-up
          </button>
        </div>
      )}
    </div>
  );
};








const DocumentsTab = ({ buyer }: any) => {
  const documentCategories = [
    { id: "financial", label: "Financial Documents", count: 3, color: "green" },
    { id: "identity", label: "Identity Documents", count: 2, color: "blue" },
    { id: "property", label: "Property Documents", count: 1, color: "purple" },
    { id: "loan", label: "Loan Documents", count: 2, color: "orange" },
  ];

  const sampleDocuments = [
    { id: 1, name: "Salary Slips (Last 3 months)", category: "financial", status: "verified", date: "2025-01-10", size: "2.3 MB" },
    { id: 2, name: "Bank Statements", category: "financial", status: "pending", date: "2025-01-12", size: "5.1 MB" },
    { id: 3, name: "PAN Card", category: "identity", status: "verified", date: "2025-01-08", size: "0.8 MB" },
    { id: 4, name: "Aadhar Card", category: "identity", status: "verified", date: "2025-01-08", size: "1.2 MB" },
    { id: 5, name: "Property Shortlist", category: "property", status: "updated", date: "2025-01-13", size: "0.5 MB" },
    { id: 6, name: "Loan Pre-approval Letter", category: "loan", status: "received", date: "2025-01-12", size: "1.8 MB" },
  ];

  const getDocumentStatusBadge = (status: string) => {
    const statusConfig = {
      verified: { bg: "bg-green-100", text: "text-green-700", label: "Verified", icon: "✅" },
      pending: { bg: "bg-orange-100", text: "text-orange-700", label: "Pending", icon: "⏳" },
      received: { bg: "bg-blue-100", text: "text-blue-700", label: "Received", icon: "📄" },
      updated: { bg: "bg-purple-100", text: "text-purple-700", label: "Updated", icon: "🔄" },
      rejected: { bg: "bg-red-100", text: "text-red-700", label: "Rejected", icon: "❌" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.icon} {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-900">Document Management</h3>
        <button className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={12} />
          <span>Upload</span>
        </button>
      </div>

      {/* Document Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {documentCategories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-xs text-gray-900">{category.label}</h4>
                <p className="text-xs text-gray-600">{category.count} docs</p>
              </div>
              <div className={`w-2.5 h-2.5 bg-${category.color}-500 rounded-full`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-3 border-b border-gray-200">
          <h4 className="font-semibold text-xs text-gray-900">All Documents</h4>
        </div>
        <div className="divide-y divide-gray-200">
          {sampleDocuments.map((doc) => (
            <div key={doc.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <FileText className="text-blue-600" size={16} />
                  </div>
                  <div>
                    <div className="font-medium text-xs text-gray-900">{doc.name}</div>
                    <div className="text-xs text-gray-600">
                      {doc.category} • {doc.size} • {doc.date}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getDocumentStatusBadge(doc.status)}
                  <div className="flex items-center space-x-1">
                    <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                      <Eye size={12} />
                    </button>
                    <button className="p-1 text-green-600 hover:bg-green-100 rounded">
                      <Download size={12} />
                    </button>
                    <button className="p-1 text-purple-600 hover:bg-purple-100 rounded">
                      <Share size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};




// Financial Tab Component
const FinancialTab = ({ buyer, onShowLoanApplication }: any) => {
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
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
            <DollarSign size={20} className="text-green-200" />
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

export default BuyerViewPage;