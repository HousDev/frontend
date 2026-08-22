
import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  Activity,
  FileText,
  CreditCard,
  Building,
  Star,
  Clock,
  AlertCircle,
  Plus,
  Edit,
  MessageCircle,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Bell,
  UserCheck,
  Bot,
  Flag,
  Tag,
  CheckCircle2,
  Play,
  Layers,
  CalendarIcon,
} from 'lucide-react';

import ActivityModal from './ActivityModal';
import VisitModal from './VisitModal';
import PropertyMatchModal from './PropertyMatchModal';
import PropertySuggestionModal from './PropertySuggestionModal';
import LoanApplicationModal from './LoanApplicationModal';
import BuyerFollowupModal from './BuyerFollowupModal';
import { buyerFollowupAPI } from '@/lib/buyerFollowupAPI';
import { toast } from 'react-toastify';
import DocumentsTab from './buyerviewcomponents/DocumentsTab';
import FinancialTab from './buyerviewcomponents/FinancialTab';
import ActivitiesTab from './buyerviewcomponents/ActivitiesTab';
import PropertiesTab from './buyerviewcomponents/PropertiesTab';
import OverviewTab from './buyerviewcomponents/OverviewTab';
import VisitScheduleTab from './buyerviewcomponents/VisitScheduleTab';

// ---- Permission helpers (adjust import paths to match your project) ----
import { useAuth } from '@/contexts/AuthContext';
import { can } from '@/utils/permission';
import Swal from 'sweetalert2';

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
  const [showVisitSchedule, setShowVisitSchedule] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'properties', label: 'Matched Properties', icon: Building },
    { id: 'visit-schedule', label: 'Visit Schedule', icon: Calendar },
    { id: 'activities', label: 'Activities', icon: Activity },
    { id: 'followups', label: 'Follow-ups', icon: Calendar },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'financial', label: 'Financial', icon: CreditCard }
  ];
  const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

  // ---- Auth & Permissions ----
  const { user } = useAuth() as { user: any | null };

  // Follow-up permissions
  const canViewFollowups = can(user, "followup.read");
  const canCreateFollowups = can(user, "followup.create");
  const canUpdateFollowups = can(user, "followup.update");
  const canDeleteFollowups = can(user, "followup.delete");

  // Buyer update permission (used for edit)
  const canUpdateBuyer = can(user, "buyer.update");

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
      'initial_contact': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Initial Contact' },
      'requirement_gathering': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Requirement Gathering' },
      'property_hunting': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Property Hunting' },
      'loan_processing': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Loan Processing' },
      'property_finalization': { bg: 'bg-green-100', text: 'text-green-700', label: 'Property Finalization' },
      'deal_closure': { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Deal Closure' },
      'completed': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completed' }
    };

    const config = stageConfig[stage as keyof typeof stageConfig] || stageConfig.initial_contact;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
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

  // ----- Handlers with permission checks for followups + edit -----
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

  // FOLLOW-UP handlers now check permissions before opening modal
  const handleAddFollowup = () => {
    if (!canCreateFollowups) {
      toast.error("You do not have permission to create follow-ups");
      return;
    }
    setEditingFollowup(null);
    setShowFollowupModal(true);
  };

  const handleEditFollowup = (followup: any) => {
    if (!canUpdateFollowups) {
      toast.error("You do not have permission to edit follow-ups");
      return;
    }
    setEditingFollowup(followup);
    setShowFollowupModal(true);
  };

  const handleSaveFollowup = (followupData: any) => {
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
 const handleDeleteVisit = async (visitId: string) => {
    // Confirmation dialog
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to delete this visit. This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      background: "#fff",
      backdrop: `rgba(15, 43, 61, 0.45)`,
      width: "400px",
      padding: "1.5rem",
      customClass: {
        popup: "rounded-xl shadow-2xl",
        title: "text-lg font-bold text-gray-800",
        htmlContainer: "text-sm text-gray-600 my-2",
        confirmButton: "px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors mx-1",
        cancelButton: "px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors mx-1",
      },
      buttonsStyling: false,
    });
    if (!result.isConfirmed) return;

    const updatedBuyer = {
      ...buyer,
      visits: buyer.visits.filter((v: any) => v.id !== visitId)
    };
    onUpdateBuyer(updatedBuyer);
    toast.success('Visit deleted successfully');
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
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 sticky top-0 z-50 text-xs">
<>
  {/* ================= MOBILE VIEW ================= */}
 <div className="block md:hidden">

  {/* ROW 1 → Arrow + Avatar + Name */}
  <div className="flex items-center gap-2">
    <button
      onClick={onBack}
      className="p-2 rounded-lg bg-gray-100 text-[#0f2b3d] flex-shrink-0"
    >
      <ArrowLeft size={20} />
    </button>

    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
      style={{ background: 'linear-gradient(135deg, #e67e22, #f39c12)' }}
    >
      {buyer.name.charAt(0)}
    </div>

    <h1 className="text-sm font-bold truncate">
      {buyer.salutation} {buyer.name}
    </h1>
  </div>

  {/* ROW 2 → Badges (UNCHANGED) */}
  <div className="flex overflow-x-auto gap-2 mt-2 no-scrollbar">
    <div className="whitespace-nowrap flex-shrink-0">
      {getStatusBadge(buyer.status)}
    </div>
    <div className="whitespace-nowrap flex-shrink-0">
      {getStageBadge(buyer.stage)}
    </div>
    <div className="whitespace-nowrap flex-shrink-0">
      {getPriorityBadge(buyer.priority)}
    </div>
    <div className="whitespace-nowrap flex-shrink-0">
      {getLeadScore(buyer.leadScore)}
    </div>
  </div>

  {/* ✅ ROW 3 → Newly Added */}
  <div className="flex items-center justify-between mt-2">

    {/* LEFT → count + navigation */}
    <div className="flex items-center gap-1">
      <div className="text-[10px] text-gray-500">
        {currentIndex + 1} of {totalBuyers}
      </div>

      <button
        onClick={onPrevious}
        disabled={currentIndex === 0}
        className="p-1.5 rounded-lg bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-[#0f2b3d]"
      >
        <ChevronLeft size={14} />
      </button>

      <button
        onClick={onNext}
        disabled={currentIndex === totalBuyers - 1}
        className="p-1.5 rounded-lg bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-[#0f2b3d]"
      >
        <ChevronRight size={14} />
      </button>
    </div>

    {/* RIGHT → actions */}
    <div className="flex items-center gap-2">

      <button
        onClick={() => onAccount(buyer)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-white text-[11px]"
        style={{ background: '#e67e22' }}
      >
        <UserCheck size={14} />
        <span>Account</span>
      </button>

      <button
        onClick={() => {
          if (!canUpdateBuyer) {
            toast.error("You do not have permission to edit buyer");
            return;
          }
          onEdit(buyer);
        }}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-white text-[11px]"
        style={{ background: '#0f2b3d' }}
      >
        <Edit size={14} />
        <span>Edit</span>
      </button>

    </div>
  </div>

</div>

  {/* ================= DESKTOP VIEW (UNCHANGED) ================= */}
  <div className="hidden md:flex flex-wrap md:flex-nowrap items-center justify-between">

    <div className="flex flex-wrap md:flex-nowrap items-center space-x-2 md:space-x-4 mb-2 md:mb-0">
      <button
        onClick={onBack}
        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-[#0f2b3d]"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="flex items-center space-x-2 md:space-x-4">
        <div
          className="w-12 h-12 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white text-lg md:text-xl font-bold"
          style={{ background: 'linear-gradient(135deg, #e67e22, #f39c12)' }}
        >
          {buyer.name.charAt(0)}
        </div>

        <div>
          <h1 className="text-base md:text-xl font-bold" style={{ color: '#0f2b3d' }}>
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
        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[#0f2b3d]"
      >
        <ChevronLeft size={16} />
      </button>

      <button
        onClick={onNext}
        disabled={currentIndex === totalBuyers - 1}
        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[#0f2b3d]"
      >
        <ChevronRight size={16} />
      </button>

      <button
        onClick={() => onAccount(buyer)}
        className="flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-1 md:py-2 text-white rounded-lg transition-colors"
        style={{ background: '#e67e22' }}
      >
        <UserCheck size={16} />
        <span>Buyer Account</span>
      </button>

      <button
        onClick={() => {
          if (!canUpdateBuyer) {
            toast.error("You do not have permission to edit buyer");
            return;
          }
          onEdit(buyer);
        }}
        className="flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-1 md:py-2 text-white rounded-lg transition-colors"
        style={{ background: '#0f2b3d' }}
      >
        <Edit size={16} />
        <span>Edit</span>
      </button>
    </div>

  </div>
</>

  {/* Tab Navigation */}
  <div className="mt-3 md:mt-4">
    <nav className="flex space-x-1 overflow-x-auto pb-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-1 md:space-x-2 px-3 py-1 md:px-4 md:py-2 rounded-lg transition-colors whitespace-nowrap text-xs ${
              activeTab === tab.id
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
      <div className="flex-1 overflow-auto p-6 pt-2 ">
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
         {activeTab === 'visit-schedule' && (
    <VisitScheduleTab
      buyer={buyer}
      onAddVisit={handleAddVisit}
      onEditVisit={handleEditVisit}
      onDeleteVisit={handleDeleteVisit}
    />
  )}
</div>

      {/* Quick Actions Bar */}
   <div className="sticky bottom-0 left-0 right-0 z-50 bg-white shadow-lg border-t" style={{ borderTopColor: BD }}>
  <div className="px-2 sm:px-3 py-2">

    {/* ================= MOBILE VIEW ================= */}
    <div className="flex flex-col gap-2 sm:hidden">

      {/* ROW 1 → Communication buttons */}
      <div className="flex justify-center items-center gap-2 flex-wrap">
        
        <button
          onClick={handleWhatsApp}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-[11px] font-medium whitespace-nowrap"
          style={{ background: '#25D366' }}
        >
          <MessageCircle size={12} />
          <span>WhatsApp</span>
        </button>

        <button
          onClick={handleEmail}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-[11px] font-medium whitespace-nowrap"
          style={{ background: '#3b82f6' }}
        >
          <Mail size={12} />
          <span>Email</span>
        </button>

        <button
          onClick={() => window.open(`tel:${buyer.phone}`)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-[11px] font-medium whitespace-nowrap"
          style={{ background: O }}
        >
          <Phone size={12} />
          <span>Call</span>
        </button>

      </div>

      {/* ROW 2 → Action buttons */}
      <div className="flex overflow-x-auto gap-2 no-scrollbar">

        <button
          onClick={handleAddVisit}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg whitespace-nowrap bg-green-600 text-white flex-shrink-0"
        >
          <Calendar size={12} />
          <span className="text-[11px]">Schedule Visit</span>
        </button>

        <button
          onClick={handleAddActivity}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg whitespace-nowrap bg-blue-500 text-white flex-shrink-0"
        >
          <Plus size={12} />
          <span className="text-[11px]">Add Activity</span>
        </button>

        <button
          onClick={handleAddFollowup}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg whitespace-nowrap bg-orange-500 text-white flex-shrink-0"
        >
          <Bell size={12} />
          <span className="text-[11px]">Schedule Follow-up</span>
        </button>

        <button
          onClick={() => setShowPropertySuggestions(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg whitespace-nowrap bg-violet-600 text-white flex-shrink-0"
        >
          <Bot size={12} />
          <span className="text-[11px]">AI Suggestions</span>
        </button>

      </div>

    </div>

    {/* ================= DESKTOP VIEW (UNCHANGED) ================= */}
    <div className="hidden sm:flex flex-nowrap items-center justify-between gap-1 overflow-x-auto sm:overflow-visible">

      {/* LEFT */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <button onClick={handleWhatsApp}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-white text-[10px] sm:text-xs whitespace-nowrap"
          style={{ background: '#25D366' }}>
          <MessageCircle size={12} />
          <span>WhatsApp</span>
        </button>

        <button onClick={handleEmail}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-white text-[10px] sm:text-xs whitespace-nowrap"
          style={{ background: '#3b82f6' }}>
          <Mail size={12} />
          <span>Email</span>
        </button>

        <button onClick={() => window.open(`tel:${buyer.phone}`)}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-white text-[10px] sm:text-xs whitespace-nowrap"
          style={{ background: O }}>
          <Phone size={12} />
          <span>Call</span>
        </button>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <button onClick={handleAddVisit}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-green-600 text-white whitespace-nowrap">
          <Calendar size={12} />
          <span className="text-[10px] sm:text-xs">Schedule Visit</span>
        </button>

        <button onClick={handleAddActivity}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-blue-500 text-white whitespace-nowrap">
          <Plus size={12} />
          <span className="text-[10px] sm:text-xs">Add Activity</span>
        </button>

        <button onClick={handleAddFollowup}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-orange-500 text-white whitespace-nowrap">
          <Bell size={12} />
          <span className="text-[10px] sm:text-xs">Schedule Follow-up</span>
        </button>

        <button onClick={() => setShowPropertySuggestions(true)}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-violet-600 text-white whitespace-nowrap">
          <Bot size={12} />
          <span className="text-[10px] sm:text-xs">AI Suggestions</span>
        </button>
      </div>

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
          tabId="buyer"
          buyerId={buyer?.id ?? buyer?.buyerId ?? ""}
          initialForm={editingFollowup ?? undefined}
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
      {/* {activeTab === 'visit-schedule' && (
        <VisitScheduleTab
          buyer={buyer}
          onAddVisit={handleAddVisit}
          onEditVisit={handleEditVisit}
          onDeleteVisit={handleDeleteVisit}
        />
      )} */}
    </div>
  );
};

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
  <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 text-xs">
    <div className="flex space-x-2">
      <button
        onClick={() => setActiveTab("sales")}
        className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 flex-1 sm:flex-none ${
          activeTab === "sales"
            ? "bg-purple-600 text-white shadow-md transform scale-105"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        Sales Follow-ups {salesCount > 0 && `(${salesCount})`}
      </button>
      <button
        onClick={() => setActiveTab("presales")}
        className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 flex-1 sm:flex-none ${
          activeTab === "presales"
            ? "bg-purple-600 text-white shadow-md transform scale-105"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        Pre-Sales Follow-ups {presalesCount > 0 && `(${presalesCount})`}
      </button>
    </div>
    <button
      onClick={onAddFollowup}
      className="ml-auto flex items-center justify-center space-x-1 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 hover:shadow-md transform hover:scale-105 w-full sm:w-auto"
    >
      <Plus size={12} />
      <span>Schedule</span>
    </button>
  </div>

  {/* show title for active tab like you requested */}
  {activeTab === "presales" && (
    <h3 className="text-sm font-semibold text-gray-800">Presales History</h3>
  )}
  {activeTab === "sales" && (
    <h3 className="text-sm font-semibold text-gray-800">Sales History</h3>
  )}

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
          const key =
            followup.id ?? `${idx}-${(followup.description ?? "followup").slice(0, 20)}`;
          const dynamicFields = renderDynamicFields(followup);

          return (
            <div
              key={key}
              className={`border-l-4 rounded-lg p-4 transition-all duration-200 hover:shadow-md ${getPriorityColor(
                followup.priority
              )}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
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

                <div className="flex items-center justify-between sm:justify-end space-x-2 w-full sm:w-auto">
                  <span className="text-[10px] text-gray-500 whitespace-normal sm:whitespace-nowrap">
                    {followup.transferredAt && (
                      <span className="text-gray-500">
                        Transferred Date:{" "}
                        <span className="font-medium text-gray-700">
                          {formatDate(followup.transferredAt)}
                          {formatTime(followup.transferredAt)
                            ? ` • ${formatTime(followup.transferredAt)}`
                            : ""}
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
                      className={`p-1.5 rounded-md transition-all duration-200 ${
                        followup.transferredFromLead
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-purple-600 hover:bg-purple-100 hover:scale-110"
                      }`}
                      title={
                        followup.transferredFromLead
                          ? "This follow-up was transferred (pre-sales) and cannot be edited."
                          : "Edit follow-up"
                      }
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
                  <span className="text-purple-700 font-medium">
                    🔔 Reminder set
                  </span>
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
          : "Track pre-sales activities and lead nurturing efforts"}
      </p>
      <button
        onClick={onAddFollowup}
        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 text-sm font-medium hover:shadow-md transform hover:scale-105 w-full sm:w-auto"
      >
        Schedule First Follow-up
      </button>
    </div>
  )}
</div>
  );
};


export default BuyerViewPage;
