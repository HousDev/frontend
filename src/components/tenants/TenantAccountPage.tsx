import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, User, Phone, Mail, MapPin, Building, Calendar, Edit,
  Home, CheckCircle2, Clock, AlertCircle, StickyNote, Plus, Bell,
  Sparkles, Link2, Loader2, X, FileText, Shield, TrendingUp,
  BarChart3, Calculator, MessageSquare, Key, Bookmark, ExternalLink,
  ChevronRight, ArrowUpRight, DollarSign, Check, Award, Eye
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { toast } from 'react-toastify';
import { tenantAPI } from '@/lib/tenantAPI';
import { rentalPropertiesAPI } from '@/lib/rentalPropertiesAPI';
import { tenantFollowupAPI } from '@/lib/tenantFollowupAPI';
import { tenantVisitAPI } from '@/lib/tenantVisitAPI';
import { tenantActivityAPI } from '@/lib/tenantActivityAPI';
import { getImageUrl } from '@/lib/helpers';
import TenantFormModal from './TenantFormModal';
import TenantFollowupModal from './TenantFollowupModal';
import TenantVisitModal from './TenantVisitModal';
import TenantActivityModal from './TenantActivityModal';

interface Tenant {
  id: number;
  tenant_id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  preferred_location: string;
  budget_min: string | number;
  budget_max: string | number;
  preferred_bhk: string;
  tenant_type: string;
  move_in_date?: string;
  current_address?: string;
  notes?: string;
  status: string;
  rental_property_id?: number | string | null;
  property_title?: string;
  owner_name?: string;
  assigned_to?: number | string;
  assigned_to_name?: string;
  created_at?: string;
}

interface TenantAccountPageProps {
  tenant: Tenant;
  onBack?: () => void;
  onUpdateTenant?: (updated: Tenant) => void;
}

const BRAND_ORANGE = '#e67e22';
const BRAND_NAVY = '#0f2b3d';

const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  'Active Search': { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', icon: <CheckCircle2 size={11} /> },
  'Interested': { bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700', icon: <AlertCircle size={11} /> },
  'Agreement Signed': { bg: 'bg-purple-50 text-purple-700 border-purple-200', text: 'text-purple-700', icon: <Key size={11} /> },
  'Inactive': { bg: 'bg-gray-100 text-gray-600 border-gray-200', text: 'text-gray-500', icon: <Clock size={11} /> },
};

export default function TenantAccountPage({ tenant: initialTenant, onBack, onUpdateTenant }: TenantAccountPageProps) {
  const [tenant, setTenant] = useState<Tenant>(initialTenant);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showMobileSidebar, setShowMobileSidebar] = useState<boolean>(false);

  // Modals
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showFollowupModal, setShowFollowupModal] = useState<boolean>(false);
  const [showVisitModal, setShowVisitModal] = useState<boolean>(false);
  const [showActivityModal, setShowActivityModal] = useState<boolean>(false);

  // Rent Calculators State
  const [calcMonthlyIncome, setCalcMonthlyIncome] = useState<number>(90000);
  const [calcSecurityMonths, setCalcSecurityMonths] = useState<number>(3);

  // Properties & Timeline Data
  const [allRentalProperties, setAllRentalProperties] = useState<any[]>([]);
  const [loadingProperties, setLoadingProperties] = useState<boolean>(false);
  const [followups, setFollowups] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [linkingId, setLinkingId] = useState<number | string | null>(null);

  useEffect(() => {
    setTenant(initialTenant);
  }, [initialTenant]);

  const loadRentalProperties = async () => {
    setLoadingProperties(true);
    try {
      const res = await rentalPropertiesAPI.getAll();
      setAllRentalProperties(res || []);
    } catch (err) {
      console.error('Error fetching rental properties:', err);
    } finally {
      setLoadingProperties(false);
    }
  };

  const loadTimelineData = async () => {
    if (!tenant?.id) return;
    try {
      const [fData, vData, aData] = await Promise.all([
        tenantFollowupAPI.getByTenantId(tenant.id).catch(() => ({ data: [] })),
        tenantVisitAPI.getByTenantId(tenant.id).catch(() => ({ data: [] })),
        tenantActivityAPI.getByTenantId(tenant.id).catch(() => ({ data: [] })),
      ]);
      setFollowups(fData?.data || []);
      setVisits(vData?.data || []);
      setActivities(aData?.data || []);
    } catch (err) {
      console.error('Error loading timeline data:', err);
    }
  };

  useEffect(() => {
    loadRentalProperties();
    loadTimelineData();
  }, [tenant.id]);

  const fmtINR = (val: number | string) => {
    const n = Number(val);
    return n > 0 ? `₹${n.toLocaleString('en-IN')}` : '—';
  };

  const budgetMin = Number(tenant.budget_min) || 0;
  const budgetMax = Number(tenant.budget_max) || 0;

  const matchedProperties = useMemo(() => {
    if (!allRentalProperties || allRentalProperties.length === 0) return [];
    const prefBhk = (tenant.preferred_bhk || '').toLowerCase().trim();
    const prefLoc = (tenant.preferred_location || '').toLowerCase().trim();

    return allRentalProperties
      .map((p: any) => {
        let score = 0;
        let reasons: string[] = [];
        const pType = (p.property_type_name || p.property_type || p.unit_type || p.title || '').toLowerCase();

        if (prefBhk && (pType.includes(prefBhk) || prefBhk.includes(pType))) {
          score += 40;
          reasons.push(`${tenant.preferred_bhk} BHK Match`);
        }

        const rent = Number(p.expected_rent || p.monthly_rent || p.rent || p.price || 0);
        if (rent > 0 && (budgetMin > 0 || budgetMax > 0)) {
          if (rent >= budgetMin && rent <= budgetMax) {
            score += 40;
            reasons.push('Exact Budget Match');
          } else if (rent <= budgetMax * 1.15 && rent >= budgetMin * 0.85) {
            score += 25;
            reasons.push('Near Budget');
          }
        } else {
          score += 20;
        }

        const pLoc = (p.location_name || p.society_name || p.address || p.city_name || '').toLowerCase();
        if (prefLoc && pLoc.includes(prefLoc)) {
          score += 20;
          reasons.push('Location Match');
        } else if (!prefLoc) {
          score += 10;
        }

        return {
          ...p,
          matchScore: Math.min(100, score),
          matchReasons: reasons,
        };
      })
      .filter((p: any) => p.matchScore >= 30)
      .sort((a: any, b: any) => b.matchScore - a.matchScore);
  }, [allRentalProperties, tenant.preferred_bhk, tenant.preferred_location, budgetMin, budgetMax]);

  const handleLinkProperty = async (prop: any) => {
    try {
      setLinkingId(prop.id);
      const updatedData = {
        rental_property_id: prop.id,
        property_title: prop.title || prop.property_type_name || `RENT-${prop.id}`,
        owner_name: prop.seller_name || prop.owner_name || 'Landlord',
      };
      await tenantAPI.update(tenant.id, updatedData);
      const updatedTenant = { ...tenant, ...updatedData };
      setTenant(updatedTenant);
      onUpdateTenant?.(updatedTenant);
      toast.success(`Linked property RENT-${prop.id} to ${tenant.name}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to link property');
    } finally {
      setLinkingId(null);
    }
  };

  const handleWhatsApp = () => {
    const phone = (tenant.whatsapp || tenant.phone || '').replace(/\D/g, '');
    if (!phone) {
      toast.error('No phone number available for WhatsApp');
      return;
    }

    // Construct matched properties text
    let matchedPropsText = '';
    if (matchedProperties && matchedProperties.length > 0) {
      matchedPropsText = '\n\nWe found the following matching rental property options for you:\n' +
        matchedProperties.slice(0, 3).map((p: any, idx: number) => {
          const title = p.title || p.property_type_name || p.unit_type || `Rental Unit #${p.id}`;
          const location = p.location_name || p.society_name || p.address || p.location || '';
          const rent = Number(p.expected_rent || p.monthly_rent || p.rent || 0);
          const rentStr = rent > 0 ? `₹${rent.toLocaleString('en-IN')}/mo` : 'Contact for Rent';
          return `${idx + 1}. *${title}*\n   📍 Location: ${location}\n   💰 Rent: ${rentStr}\n   ⭐ Match Score: ${p.matchScore}%`;
        }).join('\n\n');
    } else {
      matchedPropsText = '\n\nCurrently, we are searching for matching rental properties for you.';
    }

    const message = encodeURIComponent(
      `Hi ${tenant.name},\n\n` +
      `Welcome to your Tenant Account Portal!\n` +
      `Requirement: ${tenant.preferred_bhk || 'BHK'} in ${tenant.preferred_location || 'preferred location'}.\n` +
      `Budget: ${fmtINR(budgetMin)} - ${fmtINR(budgetMax)}/mo.` +
      `${matchedPropsText}\n\n` +
      `Best Regards,\nResaleExpert Team`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleSharePropertyWhatsApp = (p: any) => {
    const phone = (tenant.whatsapp || tenant.phone || '').replace(/\D/g, '');
    if (!phone) {
      toast.error('No phone number available for WhatsApp');
      return;
    }
    const propTitle = p.title || p.property_type_name || p.unit_type || `Rental Unit #${p.id}`;
    const propLoc = p.location_name || p.society_name || p.address || p.location || '';
    const propRent = Number(p.expected_rent || p.monthly_rent || p.rent || 0);
    const rentStr = propRent > 0 ? `₹${propRent.toLocaleString('en-IN')}/mo` : 'Contact for Rent';

    const message = encodeURIComponent(
      `Hi ${tenant.name},\n\n` +
      `I found a rental property that matches your criteria!\n\n` +
      `🏠 *${propTitle}*\n` +
      `📍 Location: ${propLoc}\n` +
      `💰 Rent: ${rentStr}\n` +
      `⭐ Match Score: ${p.matchScore}%\n\n` +
      `Let me know if you would like to arrange a site visit.\n\n` +
      `Best Regards,\nResaleExpert Team`
    );

    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const handleCall = () => {
    const phone = (tenant.phone || '').replace(/\D/g, '');
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      toast.error('No phone number available');
    }
  };

  const handleEmail = () => {
    if (!tenant.email) {
      toast.error('No email address available');
      return;
    }
    const subject = encodeURIComponent(`Tenant Portal Summary - ${tenant.name}`);
    const body = encodeURIComponent(
      `Dear ${tenant.name},\n\n` +
      `Here is a summary of your Tenant Account Portal:\n` +
      `Tenant ID: ${tenant.tenant_id}\n` +
      `Preferred BHK: ${tenant.preferred_bhk || 'Not specified'}\n` +
      `Preferred Location: ${tenant.preferred_location || 'Not specified'}\n` +
      `Monthly Rent Budget: ${fmtINR(budgetMin)} - ${fmtINR(budgetMax)}/mo\n\n` +
      `Best Regards,\nResaleExpert Team`
    );
    window.location.href = `mailto:${tenant.email}?subject=${subject}&body=${body}`;
  };

  const statusInfo = statusConfig[tenant.status] ?? statusConfig['Inactive'];

  const sidebarNavItems = [
    { id: 'dashboard', label: 'Portal Dashboard', icon: BarChart3 },
    { id: 'matched', label: `Property Matches (${matchedProperties.length})`, icon: Sparkles },
    { id: 'linked', label: 'Linked Lease Property', icon: Home },
    { id: 'documents', label: 'Lease & Doc Vault', icon: FileText },
    { id: 'visits', label: `Site Visits (${visits.length})`, icon: Calendar },
    { id: 'calculators', label: 'Rent Calculators', icon: Calculator },
    { id: 'profile', label: 'Profile & Preferences', icon: User },
  ];

  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-100 text-[11px] font-sans antialiased">
      {/* Sidebar - Clean White Theme */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col h-full bg-white text-slate-800 border-r border-gray-200">

        {/* Brand & Tenant Header */}
        <div className="p-3.5 border-b border-gray-100 flex items-center gap-2.5 bg-slate-50/50">
          <div className="w-9 h-9 rounded-lg bg-orange-500 text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
            {tenant.name?.charAt(0)?.toUpperCase() || 'T'}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-slate-900 text-xs truncate leading-tight">{tenant.name}</h2>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[9px] font-bold text-orange-600">{tenant.tenant_id}</span>
              <span className="text-[9px] text-gray-400 capitalize truncate">• Portal</span>
            </div>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {sidebarNavItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${active
                  ? 'bg-orange-50 text-orange-600 border border-orange-200 font-bold shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-slate-900 font-medium'
                  }`}
              >
                <Icon size={14} className={active ? 'text-orange-600' : 'text-gray-400'} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Back Button */}
        <div className="p-3 border-t border-gray-200 bg-gray-50/50">
          {onBack && (
            <button
              onClick={onBack}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-bold hover:bg-gray-100 transition-colors text-xs shadow-2xs"
            >
              <ArrowLeft size={13} />
              <span>Back to CRM List</span>
            </button>
          )}
        </div>
      </aside>


      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-100">

        {/* Compact Header Toolbar */}
        <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="md:hidden p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <BarChart3 size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-sm sm:text-base">Tenant Portal Account</h1>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 ${statusInfo.bg}`}>
                  {statusInfo.icon}
                  <span>{tenant.status}</span>
                </span>
              </div>
              <p className="text-[10px] text-gray-500 hidden sm:block">
                View matching rental listings, linked property agreement, site visits, and rental calculators.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCall}
              className="p-1.5 rounded-lg border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
              title="Call Tenant"
            >
              <Phone size={13} />
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] shadow-2xs transition-colors"
            >
              <SiWhatsapp size={12} />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
            <button
              onClick={handleEmail}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] shadow-2xs transition-colors"
            >
              <Mail size={12} />
              <span className="hidden sm:inline">Email</span>
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-slate-700 font-bold text-[10px] shadow-2xs"
            >
              <Edit size={12} />
              <span className="hidden sm:inline">Edit Profile</span>
            </button>
          </div>
        </header>

        {/* Tab View Container */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 scrollbar-custom-vertical">

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">

              {/* Compact Welcome Card */}
              <div className="p-4 rounded-xl bg-[#0f2b3d] text-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-bold text-[9px] uppercase border border-orange-500/30">
                    Tenant Account Dashboard
                  </div>
                  <h2 className="text-base sm:text-lg font-extrabold mt-1">Hello, {tenant.name}!</h2>
                  <p className="text-slate-300 text-[10px] mt-0.5">
                    Browse verified rental property recommendations, check active lease details, or schedule property site visits.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('matched')}
                  className="px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles size={13} />
                  <span>View Matches ({matchedProperties.length})</span>
                </button>
              </div>

              {/* Compact Stat Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-2xs">
                  <span className="text-gray-400 font-bold text-[9px] uppercase tracking-wider block">Monthly Budget</span>
                  <span className="text-sm font-extrabold text-emerald-600 mt-0.5 block">
                    {budgetMin || budgetMax ? `${fmtINR(budgetMin)} - ${fmtINR(budgetMax)}` : 'Not Set'}
                  </span>
                  <span className="text-[9px] text-gray-500 block mt-0.5">Per Month</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-2xs">
                  <span className="text-gray-400 font-bold text-[9px] uppercase tracking-wider block">Preferred BHK</span>
                  <span className="text-sm font-extrabold text-slate-800 mt-0.5 block">
                    {tenant.preferred_bhk || 'Any BHK'}
                  </span>
                  <span className="text-[9px] text-gray-500 block mt-0.5">{tenant.tenant_type || 'Renter'}</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-2xs">
                  <span className="text-gray-400 font-bold text-[9px] uppercase tracking-wider block">Move-in Date</span>
                  <span className="text-sm font-extrabold text-slate-800 mt-0.5 block">
                    {tenant.move_in_date ? new Date(tenant.move_in_date).toLocaleDateString('en-IN') : 'Flexible'}
                  </span>
                  <span className="text-[9px] text-gray-500 block mt-0.5">Target Date</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-2xs">
                  <span className="text-gray-400 font-bold text-[9px] uppercase tracking-wider block">Assigned Executive</span>
                  <span className="text-sm font-bold text-slate-900 truncate mt-0.5 block">
                    {tenant.assigned_to_name || 'CRM Team'}
                  </span>
                  <span className="text-[9px] text-orange-600 font-semibold block mt-0.5">Relationship Executive</span>
                </div>
              </div>

              {/* Linked Property Card */}
              {tenant.rental_property_id ? (
                <div className="bg-white rounded-xl border border-orange-200 p-4 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                        <Home size={14} />
                      </div>
                      <div>
                        <h3 className="font-bold text-xs text-slate-900">Your Current Linked Rental Property</h3>
                        <span className="text-[9px] text-orange-600 font-bold">RENT-{tenant.rental_property_id}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('linked')}
                      className="px-2.5 py-1 rounded-lg border border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100 font-bold text-[10px] flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{tenant.property_title || `Rental Property #${tenant.rental_property_id}`}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Owner / Landlord: <strong className="text-slate-700">{tenant.owner_name || 'Landlord'}</strong></p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold text-[9px]">
                      Active Lease Agreement
                    </span>
                  </div>
                </div>
              ) : null}

              {/* Top Recommendations Preview */}
              <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900">Top Rental Property Recommendations</h3>
                    <p className="text-[10px] text-gray-500">Based on your {tenant.preferred_bhk || ''} preference in {tenant.preferred_location || 'preferred locality'}</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('matched')}
                    className="text-[10px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    <span>View All ({matchedProperties.length})</span>
                    <ChevronRight size={12} />
                  </button>
                </div>

                {loadingProperties ? (
                  <div className="py-8 text-center text-gray-400 flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-orange-500" size={20} />
                    <span className="text-[10px]">Loading matching rental properties...</span>
                  </div>
                ) : matchedProperties.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {matchedProperties.slice(0, 3).map((p: any) => {
                      const imgUrl = getImageUrl(p.images?.[0] || p.photos?.[0] || p.mediaItems?.[0]?.file_path);
                      const price = Number(p.monthly_rent || p.expected_rent || p.price || 0);

                      return (
                        <div key={p.id} className="rounded-xl border border-gray-200 overflow-hidden bg-white hover:shadow-xs transition-all flex flex-col">
                          <div className="h-28 relative bg-gray-100">
                            {imgUrl ? (
                              <img src={imgUrl} alt={p.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Building size={24} />
                              </div>
                            )}
                            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-slate-900/80 text-white font-bold text-[8px]">
                              RENT-{p.id}
                            </span>
                            <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[9px]">
                              {p.matchScore}% Match
                            </span>
                          </div>

                          <div className="p-3 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="font-bold text-xs text-slate-900 truncate">{p.title || p.property_type_name || `Rental Property #${p.id}`}</h4>
                              <p className="text-[10px] text-gray-500 mt-0.5 truncate">{p.location_name || p.city_name || 'Location'}</p>
                              <div className="text-xs font-black text-emerald-600 mt-1.5">₹{price.toLocaleString('en-IN')}/mo</div>
                            </div>

                            <div className="flex items-center gap-1 mt-2.5 w-full">
                              <button
                                onClick={() => handleSharePropertyWhatsApp(p)}
                                className="p-2 rounded-lg border border-green-200 bg-green-50 text-green-600 hover:bg-green-100 transition shadow-xs flex-shrink-0"
                                title="Share via WhatsApp"
                              >
                                <SiWhatsapp size={12} />
                              </button>
                              <button
                                onClick={() => handleLinkProperty(p)}
                                disabled={linkingId === p.id}
                                className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-orange-500 text-white font-bold text-[10px] transition-colors flex items-center justify-center gap-1"
                              >
                                {linkingId === p.id ? (
                                  <Loader2 className="animate-spin" size={12} />
                                ) : (
                                  <>
                                    <Link2 size={12} />
                                    <span>Link Property</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-400 italic border border-dashed border-gray-200 rounded-xl text-[10px]">
                    No rental properties matched your filter criteria yet.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: MATCHED PROPERTIES */}
          {activeTab === 'matched' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs flex-wrap gap-2">
                <div>
                  <h2 className="font-bold text-xs sm:text-sm text-slate-900">Matching Rental Properties</h2>
                  <p className="text-[10px] text-gray-500">Showing {matchedProperties.length} verified listings matching your preferences</p>
                </div>
                {matchedProperties.length > 0 && (
                  <button
                    onClick={handleWhatsApp}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg transition-colors"
                  >
                    <SiWhatsapp size={12} />
                    <span>Send all matches to WhatsApp</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {matchedProperties.map((p: any) => {
                  const imgUrl = getImageUrl(p.images?.[0] || p.photos?.[0] || p.mediaItems?.[0]?.file_path);
                  const price = Number(p.monthly_rent || p.expected_rent || p.price || 0);

                  return (
                    <div key={p.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col">
                      <div className="h-32 relative bg-gray-100">
                        {imgUrl ? (
                          <img src={imgUrl} alt={p.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Building size={28} />
                          </div>
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white font-bold text-[8px]">
                          RENT-{p.id}
                        </span>
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[9px]">
                          {p.matchScore}% Match
                        </span>
                      </div>

                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 truncate">{p.title || p.property_type_name || `Rental Property #${p.id}`}</h4>
                          <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                            <MapPin size={10} className="text-gray-400" />
                            <span className="truncate">{p.location_name || p.city_name || 'Location'}</span>
                          </div>
                          <div className="text-xs font-black text-emerald-600 mt-1.5">₹{price.toLocaleString('en-IN')}/mo</div>
                        </div>

                        <div className="flex items-center gap-1 mt-3 w-full">
                          <button
                            onClick={() => handleSharePropertyWhatsApp(p)}
                            className="p-2 rounded-lg border border-green-200 bg-green-50 text-green-600 hover:bg-green-100 transition shadow-xs flex-shrink-0"
                            title="Share via WhatsApp"
                          >
                            <SiWhatsapp size={12} />
                          </button>
                          <button
                            onClick={() => handleLinkProperty(p)}
                            disabled={linkingId === p.id}
                            className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-orange-500 text-white font-bold text-[10px] transition-colors flex items-center justify-center gap-1"
                          >
                            {linkingId === p.id ? (
                              <Loader2 className="animate-spin" size={12} />
                            ) : (
                              <>
                                <Link2 size={12} />
                                <span>Link Property</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: LINKED PROPERTY */}
          {activeTab === 'linked' && (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                <h2 className="font-bold text-xs sm:text-sm text-slate-900 mb-0.5">Linked Property & Lease Status</h2>
                <p className="text-[10px] text-gray-500 mb-4">Official linked property details and landlord information</p>

                {tenant.rental_property_id ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 font-bold text-[9px]">
                          RENT-{tenant.rental_property_id}
                        </span>
                        <h3 className="font-bold text-xs text-slate-900 mt-1">{tenant.property_title || `Rental Property #${tenant.rental_property_id}`}</h3>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[9px]">
                        Lease Active
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                      <div>
                        <span className="text-gray-400 font-semibold block text-[10px]">Landlord / Owner</span>
                        <span className="font-bold text-slate-800 text-xs mt-0.5 block">{tenant.owner_name || 'Landlord'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-semibold block text-[10px]">Assigned Relationship Executive</span>
                        <span className="font-bold text-slate-800 text-xs mt-0.5 block">{tenant.assigned_to_name || 'CRM Team'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-400 italic border border-dashed border-gray-200 rounded-xl text-[10px]">
                    No rental property currently linked to this tenant profile.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: DOCUMENTS VAULT */}
          {activeTab === 'documents' && (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                <h2 className="font-bold text-xs sm:text-sm text-slate-900 mb-0.5">Lease & Document Vault</h2>
                <p className="text-[10px] text-gray-500 mb-4">Checklist of tenant verification and rent agreement documents</p>

                <div className="space-y-2">
                  {[
                    { title: 'Aadhaar / Passport ID Proof', status: 'Verified', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                    { title: 'PAN Card Copy', status: 'Verified', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                    { title: 'Salary Slip / Employment Proof', status: 'Uploaded', color: 'bg-blue-50 text-blue-700 border-blue-200' },
                    { title: 'Police Verification Form', status: 'Pending Verification', color: 'bg-amber-50 text-amber-700 border-amber-200' },
                    { title: 'Registered Rent Agreement', status: tenant.rental_property_id ? 'Executed' : 'Pending Link', color: 'bg-purple-50 text-purple-700 border-purple-200' },
                  ].map((doc, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-gray-200 flex items-center justify-between bg-white hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <FileText size={15} className="text-gray-400" />
                        <span className="font-bold text-xs text-slate-800">{doc.title}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${doc.color}`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SITE VISITS */}
          {activeTab === 'visits' && (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="font-bold text-xs sm:text-sm text-slate-900">Scheduled Site Visits</h2>
                    <p className="text-[10px] text-gray-500">Track requested property inspection visits</p>
                  </div>
                  <button
                    onClick={() => setShowVisitModal(true)}
                    className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] flex items-center gap-1 shadow-2xs"
                  >
                    <Plus size={13} />
                    <span>Schedule Visit</span>
                  </button>
                </div>

                {visits.length > 0 ? (
                  <div className="space-y-2">
                    {visits.map((v: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-lg border border-gray-200 flex items-center justify-between bg-white">
                        <div>
                          <h4 className="font-bold text-xs text-slate-800">{v.property_title || `Site Visit #${v.id}`}</h4>
                          <p className="text-[9px] text-gray-500 mt-0.5">Visit Date: {v.visit_date ? new Date(v.visit_date).toLocaleDateString('en-IN') : 'TBD'}</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[9px]">
                          {v.status || 'Scheduled'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-400 italic border border-dashed border-gray-200 rounded-xl text-[10px]">
                    No property site visits scheduled yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: CALCULATORS */}
          {activeTab === 'calculators' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                <h2 className="font-bold text-xs sm:text-sm text-slate-900 mb-0.5">Rent Budget & Initial Move-in Calculator</h2>
                <p className="text-[10px] text-gray-500 mb-4">Estimate initial setup costs and affordability limit</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Rent Affordability */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Calculator size={14} className="text-orange-500" />
                      <span>Rent Affordability (30% Rule)</span>
                    </h3>

                    <div>
                      <label className="text-[10px] font-semibold text-gray-600 block mb-1">Gross Monthly Income (₹)</label>
                      <input
                        type="number"
                        value={calcMonthlyIncome}
                        onChange={(e) => setCalcMonthlyIncome(Number(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                      <span className="text-[9px] text-emerald-700 font-semibold block uppercase">Recommended Max Rent</span>
                      <span className="text-base font-black text-emerald-700 mt-0.5 block">₹{Math.round(calcMonthlyIncome * 0.3).toLocaleString('en-IN')} /mo</span>
                    </div>
                  </div>

                  {/* Initial Move-in Setup Cost */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <DollarSign size={14} className="text-orange-500" />
                      <span>Estimated Initial Move-In Cost</span>
                    </h3>

                    <div className="space-y-1.5 text-[10px]">
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-gray-600">1st Month Rent (Est.)</span>
                        <span className="font-bold text-slate-800">₹{(budgetMax || 30000).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-gray-600">Security Deposit ({calcSecurityMonths} Months)</span>
                        <span className="font-bold text-slate-800">₹{((budgetMax || 30000) * calcSecurityMonths).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                      <span className="text-[9px] text-orange-700 font-semibold block uppercase">Total Move-in Capital</span>
                      <span className="text-base font-black text-orange-700 mt-0.5 block">
                        ₹{((budgetMax || 30000) * (1 + calcSecurityMonths + 1)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-xs sm:text-sm text-slate-900">Tenant Profile & Contact Info</h2>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-3 py-1 rounded-lg bg-slate-900 text-white font-bold text-[10px] hover:bg-slate-800"
                  >
                    Edit Profile
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-gray-400 font-semibold block text-[9px]">Full Name</span>
                    <span className="font-bold text-slate-900 text-xs mt-0.5 block">{tenant.name}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-gray-400 font-semibold block text-[9px]">Phone Number</span>
                    <span className="font-bold text-slate-900 text-xs mt-0.5 block">{tenant.phone}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-gray-400 font-semibold block text-[9px]">Email Address</span>
                    <span className="font-bold text-slate-900 text-xs mt-0.5 block">{tenant.email || 'N/A'}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-gray-400 font-semibold block text-[9px]">Preferred Location</span>
                    <span className="font-bold text-slate-900 text-xs mt-0.5 block">{tenant.preferred_location || 'Flexible'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Modals */}
      {showEditModal && (
        <TenantFormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          mode="edit"
          initialData={tenant}
          onSubmit={async (formData) => {
            await tenantAPI.update(tenant.id, formData);
            setTenant({ ...tenant, ...formData });
            onUpdateTenant?.({ ...tenant, ...formData });
            setShowEditModal(false);
            toast.success('Tenant profile updated successfully!');
          }}
        />
      )}

      {showVisitModal && (
        <TenantVisitModal
          isOpen={showVisitModal}
          onClose={() => setShowVisitModal(false)}
          tenant={tenant}
          onSave={() => loadTimelineData()}
        />
      )}
    </div>
  );
}
