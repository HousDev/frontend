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
  MessageSquare,
  ArrowUpRight,
  Sparkles,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
  Home,
  Compass,
  Layers,
  FileText,
  UserCheck,
  Send,
} from 'lucide-react';
import { getImageUrl } from '@/lib/helpers';

interface OverviewTabProps {
  buyer: any;
  onUpdateBuyer?: (buyer: any) => void;
  setActiveTab?: (tab: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  buyer,
  onUpdateBuyer,
  setActiveTab,
}) => {
  const formatCurrency = (amount: number | string | undefined | null) => {
    if (!amount || amount === '0' || amount === 0) return '₹0';
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d.-]/g, '')) : amount;
    if (isNaN(num)) return `₹${amount}`;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lac`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const getStageLabel = (stage: string) => {
    const stageConfig: Record<string, string> = {
      initial_contact: 'Initial Contact',
      requirement_gathering: 'Requirement Gathering',
      property_hunting: 'Property Hunting',
      loan_processing: 'Loan Processing',
      property_finalization: 'Property Finalization',
      deal_closure: 'Deal Closure',
      completed: 'Completed',
    };
    return stageConfig[stage] || stageConfig[stage?.toLowerCase()] || (stage ? stage.replace(/_/g, ' ') : 'Initial Contact');
  };

  const matchedProps = Array.isArray(buyer.matchedProperties)
    ? buyer.matchedProperties
    : Array.isArray(buyer.properties)
    ? buyer.properties
    : [];

  const activities = Array.isArray(buyer.activities) ? buyer.activities : [];
  const followups = Array.isArray(buyer.followups) ? buyer.followups : [];
  const pendingFollowups = followups.filter((f: any) => f.status === 'pending');

  const preferredLocations = Array.isArray(buyer.requirements?.preferredLocations)
    ? buyer.requirements.preferredLocations
    : typeof buyer.requirements?.preferredLocations === 'string'
    ? buyer.requirements.preferredLocations.split(',').map((s: string) => s.trim()).filter(Boolean)
    : Array.isArray(buyer.preferredLocations)
    ? buyer.preferredLocations
    : [];

  const preferredUnits = Array.isArray(buyer.requirements?.unitTypes)
    ? buyer.requirements.unitTypes
    : typeof buyer.requirements?.unitTypes === 'string'
    ? buyer.requirements.unitTypes.split(',').map((s: string) => s.trim()).filter(Boolean)
    : Array.isArray(buyer.unitTypes)
    ? buyer.unitTypes
    : typeof buyer.unitTypes === 'string'
    ? buyer.unitTypes.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  const stageProgress = buyer.stageProgress ?? 0;
  const currentStageLabel = getStageLabel(buyer.stage || buyer.leadStage || 'initial_contact');
  const minBudget = buyer.budget?.min || buyer.minBudget || buyer.requirements?.minBudget || 0;
  const maxBudget = buyer.budget?.max || buyer.maxBudget || buyer.requirements?.maxBudget || 0;

  const priorityNormalized = (buyer.priority || 'low').toLowerCase().trim();
  const priorityColor =
    priorityNormalized === 'high'
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : priorityNormalized === 'medium'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  const fullAddress = [buyer.location, buyer.city, buyer.state]
    .filter((x) => x && x !== '-' && x !== '—')
    .join(', ');

  return (
    <div className="space-y-3 max-w-[1600px] mx-auto text-slate-800">
      {/* 1. TOP METRICS STRIP (Compact & Premium KPI Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-blue-300 hover:shadow-sm transition-all flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
              Property Visits
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-slate-900 leading-none">
                {buyer.visits ?? 0}
              </span>
              <span className="text-[10px] font-medium text-slate-400">visits done</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100">
            <Eye size={16} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-emerald-300 hover:shadow-sm transition-all flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
              Properties Matched
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-slate-900 leading-none">
                {matchedProps.length}
              </span>
              <span className="text-[10px] font-medium text-slate-400">inventory matches</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 border border-emerald-100">
            <Building size={16} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-purple-300 hover:shadow-sm transition-all flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
              Lead Score
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-slate-900 leading-none">
                {buyer.leadScore ?? 0}
              </span>
              <span className="text-[10px] font-medium text-purple-600 font-semibold">/ 100</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 border border-purple-100">
            <Star size={16} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-amber-300 hover:shadow-sm transition-all flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
              Response Rate
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-slate-900 leading-none">
                {buyer.responseRate || 80}%
              </span>
              <span className="text-[10px] font-medium text-emerald-600">Active</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 border border-amber-100">
            <TrendingUp size={16} />
          </div>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN HIGH-DENSITY DASHBOARD LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* ================= LEFT COLUMN: Contact, Requirements, Portfolio (7 Cols) ================= */}
        <div className="lg:col-span-7 space-y-3">
          {/* Card A: Buyer Profile & Contact Information */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="px-3.5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-orange-100 text-orange-600">
                  <User size={13} />
                </span>
                <h3 className="text-xs font-bold text-slate-900">
                  Buyer Profile & Contact Information
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${priorityColor} capitalize`}
                >
                  {buyer.priority || 'Low'} Priority
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                    buyer.status === 'inactive' || buyer.isActive === false
                      ? 'bg-slate-100 text-slate-600 border-slate-200'
                      : buyer.status === 'blocked'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {buyer.status ? buyer.status.toUpperCase() : 'ACTIVE'}
                </span>
              </div>
            </div>

            <div className="p-3.5 space-y-3">
              {/* Quick Communication Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 bg-slate-50/90 rounded-lg border border-slate-100 text-xs">
                {/* Phone */}
                <div className="flex items-center justify-between gap-1.5 bg-white px-2.5 py-1.5 rounded-md border border-slate-200/70 shadow-2xs">
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase">Phone</p>
                    <p className="font-bold text-slate-800 text-[11px] truncate">
                      {buyer.phone || '—'}
                    </p>
                  </div>
                  {buyer.phone && buyer.phone !== '—' && (
                    <a
                      href={`tel:${String(buyer.phone).replace(/\D/g, '')}`}
                      className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors flex-shrink-0"
                      title="Call Buyer"
                    >
                      <Phone size={12} />
                    </a>
                  )}
                </div>

                {/* WhatsApp */}
                <div className="flex items-center justify-between gap-1.5 bg-white px-2.5 py-1.5 rounded-md border border-slate-200/70 shadow-2xs">
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase">WhatsApp</p>
                    <p className="font-bold text-slate-800 text-[11px] truncate">
                      {buyer.whatsapp || buyer.phone || '—'}
                    </p>
                  </div>
                  {(buyer.whatsapp || buyer.phone) && (
                    <a
                      href={`https://wa.me/${String(buyer.whatsapp || buyer.phone).replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Hi ${buyer.name || ''}, regarding your property search...`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors flex-shrink-0"
                      title="Send WhatsApp Message"
                    >
                      <MessageSquare size={12} />
                    </a>
                  )}
                </div>

                {/* Email */}
                <div className="flex items-center justify-between gap-1.5 bg-white px-2.5 py-1.5 rounded-md border border-slate-200/70 shadow-2xs">
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase">Email</p>
                    <p className="font-bold text-slate-800 text-[11px] truncate">
                      {buyer.email || '—'}
                    </p>
                  </div>
                  {buyer.email && buyer.email !== '—' && (
                    <a
                      href={`mailto:${buyer.email}`}
                      className="p-1.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex-shrink-0"
                      title="Send Email"
                    >
                      <Mail size={12} />
                    </a>
                  )}
                </div>
              </div>

              {/* Structured Key Details Table Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                <div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase">Full Name</span>
                  <p className="font-bold text-slate-900 mt-0.5 truncate">
                    {buyer.salutation ? `${buyer.salutation} ` : ''}
                    {buyer.name || '—'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase">Location / Address</span>
                  <p className="font-semibold text-slate-800 mt-0.5 truncate flex items-center gap-1">
                    <MapPin size={11} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">{fullAddress || '—'}</span>
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase">Lead Source</span>
                  <p className="font-semibold text-slate-800 mt-0.5 truncate">
                    {buyer.source || buyer.leadSource || 'WhatsApp'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase">Assigned Executive</span>
                  <p className="font-bold text-slate-800 mt-0.5 truncate flex items-center gap-1">
                    <UserCheck size={12} className="text-blue-600 flex-shrink-0" />
                    <span>{buyer.assigned_to_name || buyer.assigned_to || buyer.assignedTo || buyer.assigned || 'Miss Saroj Patil'}</span>
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase">Date of Birth</span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {buyer.dob || '—'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase">Deal Potential</span>
                  <p className="font-semibold text-emerald-600 mt-0.5 capitalize">
                    {buyer.dealPotential || 'High'} Probability
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card B: Budget & Requirements Matrix */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="px-3.5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-emerald-100 text-emerald-600">
                  <DollarSign size={13} />
                </span>
                <h3 className="text-xs font-bold text-slate-900">
                  Budget & Requirement Preferences
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {formatCurrency(minBudget)} - {formatCurrency(maxBudget)}
              </span>
            </div>

            <div className="p-3.5 space-y-3 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                    Budget Range
                  </span>
                  <p className="font-extrabold text-emerald-600 text-xs mt-0.5 truncate">
                    {formatCurrency(minBudget)} - {formatCurrency(maxBudget)}
                  </p>
                </div>

                <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                    Possession
                  </span>
                  <p className="font-bold text-slate-800 text-xs mt-0.5 truncate">
                    {buyer.requirements?.possession || buyer.possession || 'Ready to Move'}
                  </p>
                </div>

                <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                    Furnishing
                  </span>
                  <p className="font-bold text-slate-800 text-xs mt-0.5 truncate">
                    {buyer.requirements?.furnishing || buyer.furnishing || 'Semi-Furnished'}
                  </p>
                </div>

                <div className="bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                    Property Type
                  </span>
                  <p className="font-bold text-slate-800 text-xs mt-0.5 truncate">
                    {buyer.requirements?.propertyType || buyer.propertyType || 'Residential Flat'}
                  </p>
                </div>
              </div>

              {/* Units & Locations Tag Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Preferred Unit Configurations
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {preferredUnits.length > 0 ? (
                      preferredUnits.map((unit: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200"
                        >
                          {unit}
                        </span>
                      ))
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600">
                        2 BHK, 3 BHK
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Target / Preferred Locations
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {preferredLocations.length > 0 ? (
                      preferredLocations.map((loc: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200"
                        >
                          {loc}
                        </span>
                      ))
                    ) : (
                      <>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                          Wakad
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                          Rahatani
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card C: Matched Properties Inventory Showcase */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="px-3.5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-blue-100 text-blue-600">
                  <Building size={13} />
                </span>
                <h3 className="text-xs font-bold text-slate-900">
                  Matching Properties Showcase
                </h3>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  {matchedProps.length}
                </span>
              </div>
              <button
                onClick={() => setActiveTab?.('properties')}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                <span>View All In Inventory</span>
                <ArrowUpRight size={12} />
              </button>
            </div>

            <div className="p-3">
              {matchedProps.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {matchedProps.slice(0, 4).map((property: any, index: number) => {
                    const propType = property.property_type_name || property.property_type || '';
                    const unitType = property.unit_type || property.bhk || property.configuration || '';
                    const subtype = property.property_subtype_name || property.property_sub_type || property.subtype || '';
                    const title = [propType, unitType, subtype].filter(Boolean).join(' ') || property.title || property.name || 'Matched Property';

                    const address =
                      property.address ??
                      property.location ??
                      ([property.location_name, property.city_name || property.city].filter(Boolean).join(', ') || '—');

                    const rawPhoto =
                      property.photos?.[0]?.url ||
                      property.photos?.[0] ||
                      property.image ||
                      property.photo ||
                      property.images?.[0];

                    const photo = getImageUrl(rawPhoto) || null;
                    const price = property.price ?? property.budget ?? property.expected_price;

                    return (
                      <div
                        key={index}
                        className="border border-slate-200 rounded-lg p-2 hover:border-blue-300 hover:shadow-sm transition-all bg-white flex gap-2.5 items-center justify-between"
                      >
                        <div className="flex gap-2.5 items-center min-w-0 flex-1">
                          {photo ? (
                            <img
                              src={photo}
                              alt={title}
                              className="w-12 h-11 object-cover rounded-md flex-shrink-0 border border-slate-100"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                const next = (e.target as HTMLImageElement).nextElementSibling;
                                if (next) (next as HTMLElement).classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-12 h-11 rounded-md bg-slate-100 flex items-center justify-center text-[8px] text-slate-400 flex-shrink-0 ${
                              photo ? 'hidden' : ''
                            }`}
                          >
                            No Pic
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[11px] font-bold truncate text-slate-900 leading-tight">
                              {title}
                            </h4>
                            <p className="text-[10px] truncate text-slate-500 mt-0.5">
                              {address}
                            </p>
                            {price !== undefined && price !== null && (
                              <span className="text-[10px] font-black text-emerald-600 block mt-0.5">
                                {typeof price === 'number' ? `₹${price.toLocaleString('en-IN')}` : `₹${price}`}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => setActiveTab?.('properties')}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors flex-shrink-0"
                          title="Open Property"
                        >
                          <ArrowUpRight size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-5 border border-dashed border-slate-200 rounded-xl bg-slate-50/60">
                  <Building size={24} className="mx-auto mb-1.5 text-slate-300" />
                  <p className="text-xs text-slate-700 font-bold mb-0.5">
                    No Direct Property Matches Yet
                  </p>
                  <p className="text-[10px] text-slate-400 mb-2.5 max-w-sm mx-auto">
                    Search properties fitting {formatCurrency(minBudget)} - {formatCurrency(maxBudget)} range.
                  </p>
                  <button
                    onClick={() => setActiveTab?.('properties')}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs"
                  >
                    <Sparkles size={11} />
                    <span>Run Smart Property Matching</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: Journey, Follow-ups, Activities, Remarks (5 Cols) ================= */}
        <div className="lg:col-span-5 space-y-3">
          {/* Card 1: Stage Progress & Buyer Journey */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="px-3.5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-purple-100 text-purple-600">
                  <TrendingUp size={13} />
                </span>
                <h3 className="text-xs font-bold text-slate-900">
                  Stage Progress & Journey
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  {currentStageLabel}
                </span>
                <span className="text-xs font-black text-blue-600">
                  {stageProgress}%
                </span>
              </div>
            </div>

            <div className="p-3.5 space-y-3">
              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-blue-600 to-indigo-600"
                  style={{ width: `${Math.max(stageProgress, 5)}%` }}
                />
              </div>

              {/* 4 Mini Stat Blocks */}
              <div className="grid grid-cols-4 gap-1.5 text-center pt-1 border-t border-slate-100">
                <div className="p-1.5 rounded-lg bg-slate-50">
                  <p className="text-xs font-black text-slate-800">{activities.length}</p>
                  <p className="text-[9px] font-medium text-slate-400 mt-0.5">Activities</p>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50">
                  <p className="text-xs font-black text-blue-600">{buyer.visits || 0}</p>
                  <p className="text-[9px] font-medium text-slate-400 mt-0.5">Visits</p>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50">
                  <p className="text-xs font-black text-emerald-600">{matchedProps.length}</p>
                  <p className="text-[9px] font-medium text-slate-400 mt-0.5">Matched</p>
                </div>
                <div className="p-1.5 rounded-lg bg-slate-50">
                  <p className="text-xs font-black text-purple-600">{buyer.responseRate || 80}%</p>
                  <p className="text-[9px] font-medium text-slate-400 mt-0.5">Response</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Upcoming Follow-ups & Next Actions */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="px-3.5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-amber-100 text-amber-600">
                  <Calendar size={13} />
                </span>
                <h3 className="text-xs font-bold text-slate-900">
                  Upcoming Follow-ups ({pendingFollowups.length})
                </h3>
              </div>
              <button
                onClick={() => setActiveTab?.('followups')}
                className="text-[11px] font-bold text-amber-700 hover:text-amber-800 transition-colors"
              >
                View All
              </button>
            </div>

            <div className="p-3">
              {pendingFollowups.length > 0 ? (
                <div className="space-y-2">
                  {pendingFollowups.slice(0, 3).map((fu: any, index: number) => (
                    <div
                      key={fu.id || index}
                      className="p-2 rounded-lg border border-amber-200/80 bg-amber-50/40 hover:bg-amber-50 transition-colors flex items-start justify-between gap-2"
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <div className="p-1 bg-amber-100 rounded text-amber-700 mt-0.5 flex-shrink-0">
                          <Clock size={11} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-800 truncate">
                            {fu.description || fu.notes || fu.title || 'Follow-up Scheduled'}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {fu.date} {fu.time ? `• ${fu.time}` : ''}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase flex-shrink-0 ${
                          fu.priority === 'high'
                            ? 'bg-rose-100 text-rose-700'
                            : fu.priority === 'medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {fu.priority || 'Normal'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-xs">
                  <Calendar size={20} className="mx-auto text-slate-300 mb-1" />
                  <p className="text-[11px] font-bold text-slate-600">No Pending Follow-ups</p>
                  <p className="text-[10px] text-slate-400">All scheduled follow-ups are up to date.</p>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Recent Activities Timeline */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="px-3.5 py-2.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-blue-100 text-blue-600">
                  <Activity size={13} />
                </span>
                <h3 className="text-xs font-bold text-slate-900">
                  Recent Activities
                </h3>
              </div>
              <button
                onClick={() => setActiveTab?.('activities')}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                View Timeline
              </button>
            </div>

            <div className="p-3">
              {activities.length > 0 ? (
                <div className="space-y-2">
                  {activities.slice(0, 3).map((act: any, index: number) => (
                    <div
                      key={act.id || index}
                      className="p-2 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-start gap-2"
                    >
                      <div className="p-1 bg-blue-100 rounded text-blue-600 mt-0.5 flex-shrink-0">
                        <Activity size={11} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-[11px] font-bold text-slate-800 truncate">
                            {act.description || act.title || 'Activity Logged'}
                          </p>
                          <span className="text-[9px] text-slate-400 flex-shrink-0">
                            {act.date || act.createdAt ? `${act.date || ''}` : ''}
                          </span>
                        </div>
                        {act.outcome && (
                          <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                            Outcome: <span className="font-medium text-slate-800">{act.outcome}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-xs">
                  <Activity size={20} className="mx-auto text-slate-300 mb-1" />
                  <p className="text-[11px] font-bold text-slate-600">No Activities Logged</p>
                  <p className="text-[10px] text-slate-400">Interaction logs will appear here.</p>
                </div>
              )}
            </div>
          </div>

          {/* Card 4: Remarks / Notes Box */}
          {(buyer.notes || buyer.remarks) && (
            <div className="bg-amber-50/50 rounded-xl border border-amber-200/70 p-3 shadow-2xs">
              <div className="flex items-center gap-1.5 text-amber-800 font-bold text-[11px] mb-1">
                <FileText size={12} className="text-amber-600" />
                <span>Executive Notes & Remarks</span>
              </div>
              <p className="text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed">
                {buyer.notes || buyer.remarks}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
