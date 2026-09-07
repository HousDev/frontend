import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Clock, AlertCircle, Key, Heart, LogOut,
  BarChart3, Building, MapPin, Phone, ExternalLink
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { toast } from 'react-toastify';
import { tenantAPI } from '@/lib/tenantAPI';
import { rentalPropertiesAPI } from '@/lib/rentalPropertiesAPI';
import { tenantFollowupAPI } from '@/lib/tenantFollowupAPI';
import { tenantVisitAPI } from '@/lib/tenantVisitAPI';
import { tenantActivityAPI } from '@/lib/tenantActivityAPI';
import { getImageUrl } from '@/lib/helpers';
import { useAuth } from '@/contexts/AuthContext';

// Modals
import TenantVisitModal from './TenantVisitModal';
import TenantPreferenceSetupModal from './TenantPreferenceSetupModal';
import TenantPasswordUpdateModal from './TenantPasswordUpdateModal';

// Modular tab components & types
import { Tenant, MatchedProperty } from './tabs/types';
import TenantSidebar from './tabs/TenantSidebar';
import TenantDashboardTab from './tabs/TenantDashboardTab';
import TenantMatchedPropertiesTab from './tabs/TenantMatchedPropertiesTab';
import TenantLinkedPropertyTab from './tabs/TenantLinkedPropertyTab';
import TenantDocumentVaultTab from './tabs/TenantDocumentVaultTab';
import TenantSiteVisitsTab from './tabs/TenantSiteVisitsTab';
import TenantCalculatorsTab from './tabs/TenantCalculatorsTab';
import TenantPaymentsTab from './tabs/TenantPaymentsTab';
import TenantMaintenanceTab from './tabs/TenantMaintenanceTab';
import TenantEnquiredPropertiesTab from './tabs/TenantEnquiredPropertiesTab';
import TenantProfileTab from './tabs/TenantProfileTab';

export type { Tenant };

interface TenantAccountPageProps {
  tenant: Tenant;
  onBack?: () => void;
  onUpdateTenant?: (updated: Tenant) => void;
}

const statusConfig: Record<
  string,
  { bg: string; text: string; icon: React.ReactNode }
> = {
  'Active Search': {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    text: 'text-emerald-700',
    icon: <CheckCircle2 size={11} />,
  },
  Interested: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    text: 'text-amber-700',
    icon: <AlertCircle size={11} />,
  },
  'Agreement Signed': {
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    text: 'text-purple-700',
    icon: <Key size={11} />,
  },
  Inactive: {
    bg: 'bg-gray-100 text-gray-600 border-gray-200',
    text: 'text-gray-500',
    icon: <Clock size={11} />,
  },
};

export default function TenantAccountPage({
  tenant: initialTenant,
  onBack,
  onUpdateTenant,
}: TenantAccountPageProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [tenant, setTenant] = useState<Tenant>(initialTenant);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showMobileSidebar, setShowMobileSidebar] = useState<boolean>(false);

  // Modals & Dialog State
  const [showVisitModal, setShowVisitModal] = useState<boolean>(false);
  const [showEmptyFavorites, setShowEmptyFavorites] = useState(false);
  const [showPreferenceModal, setShowPreferenceModal] = useState<boolean>(false);
  const [showPasswordUpdateModal, setShowPasswordUpdateModal] = useState<boolean>(false);

  // Rent Calculators State
  const [calcMonthlyIncome, setCalcMonthlyIncome] = useState<number>(90000);
  const [calcSecurityMonths] = useState<number>(2);

  // Property Listing & Linking State
  const [allRentalProperties, setAllRentalProperties] = useState<any[]>([]);
  const [loadingProperties, setLoadingProperties] = useState<boolean>(false);
  const [linkingId, setLinkingId] = useState<number | string | null>(null);

  // Timeline / Visits State
  const [, setFollowups] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [, setActivities] = useState<any[]>([]);

  // Shortlist State - persists in localStorage
  const [shortlistedIds, setShortlistedIds] = useState<Set<string | number>>(new Set());
  const [shortlistHydratedFor, setShortlistHydratedFor] = useState<number | string | null>(null);

  // Load saved shortlist for current tenant
  useEffect(() => {
    const saved = localStorage.getItem(`shortlisted_${tenant.id}`);
    setShortlistHydratedFor(null);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setShortlistedIds(new Set(parsed));
      } catch (e) {
        console.error('Error loading shortlisted IDs:', e);
        setShortlistedIds(new Set());
      }
    } else {
      setShortlistedIds(new Set());
    }
    setShortlistHydratedFor(tenant.id);
  }, [tenant.id]);

  // Persist shortlist changes
  useEffect(() => {
    if (shortlistHydratedFor !== tenant.id) return;
    localStorage.setItem(
      `shortlisted_${tenant.id}`,
      JSON.stringify(Array.from(shortlistedIds))
    );
  }, [shortlistedIds, tenant.id, shortlistHydratedFor]);

  // Sync with initialTenant props
  useEffect(() => {
    const savedProfileImage = localStorage.getItem(
      `tenant_profile_image_${initialTenant.id}`
    );
    setTenant({
      ...initialTenant,
      profile_image: savedProfileImage || initialTenant.profile_image || '',
    });
  }, [initialTenant]);

  // Automatic Preference Setup Prompt (Pehle Requirements & Preferences modal dikhega)
  useEffect(() => {
    const shouldPrompt =
      localStorage.getItem('prompt_tenant_preferences') === 'true' ||
      (!tenant.preferred_location && !tenant.budget_max);
    if (shouldPrompt) {
      const timer = setTimeout(() => {
        setShowPreferenceModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [tenant.id, tenant.preferred_location, tenant.budget_max]);

  // Load properties and timeline
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

  const handleLogout = () => {
    localStorage.removeItem('verified_tenant');
    localStorage.removeItem('prompt_tenant_preferences');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (logout) logout();
    toast.info('Logged out of tenant account');
    navigate('/login');
  };

  const fmtINR = (val: number | string) => {
    const n = Number(val);
    return n > 0 ? `₹${n.toLocaleString('en-IN')}` : '—';
  };

  const budgetMin = Number(tenant.budget_min) || 0;
  const budgetMax = Number(tenant.budget_max) || 0;

  // Compute matching algorithm
  const matchedProperties = useMemo<MatchedProperty[]>(() => {
    if (!allRentalProperties || allRentalProperties.length === 0) return [];

    const prefBhk = (tenant.preferred_bhk || '').toLowerCase().trim();
    const bhkList = prefBhk.split(/[;,]+/).map((s) => s.trim()).filter(Boolean);
    const prefLoc = (tenant.preferred_location || '').toLowerCase().trim();
    const locList = prefLoc.split(/[;,]+/).map((s) => s.trim()).filter(Boolean);

    return allRentalProperties
      .map((p: any) => {
        let score = 40;
        const reasons: string[] = [];
        const pType = (
          p.property_type_name ||
          p.property_type ||
          p.unit_type ||
          p.title ||
          ''
        ).toLowerCase();

        const bhkMatches =
          bhkList.some((b) => pType.includes(b) || b.includes(pType)) ||
          (prefBhk && (pType.includes(prefBhk) || prefBhk.includes(pType)));

        if (bhkMatches || bhkList.length === 0) {
          score += 30;
          if (bhkMatches) reasons.push(`${tenant.preferred_bhk || 'BHK'} Match`);
        } else {
          reasons.push('Verified Rental Unit');
        }

        const rent = Number(
          p.expected_rent || p.monthly_rent || p.rent || p.price || 0
        );
        if (rent > 0 && (budgetMin > 0 || budgetMax > 0)) {
          if (rent >= budgetMin && rent <= budgetMax) {
            score += 20;
            reasons.push('Exact Budget Match');
          } else if (rent <= budgetMax * 1.25 && rent >= budgetMin * 0.75) {
            score += 10;
            reasons.push('Near Budget');
          }
        }

        const pLoc = (
          p.location_name ||
          p.society_name ||
          p.address ||
          p.city_name ||
          p.location ||
          ''
        ).toLowerCase();
        const locMatches =
          locList.some((loc) => pLoc.includes(loc) || loc.includes(pLoc)) ||
          (prefLoc && pLoc.includes(prefLoc));

        if (locMatches || locList.length === 0) {
          score += 20;
          if (locMatches) reasons.push('Location Match');
        } else if (!prefLoc) {
          score += 10;
        }

        return {
          ...p,
          matchScore: Math.min(99, Math.max(50, p.matchScore || score)),
          matchReasons: p.matchReasons || reasons,
        };
      })
      .sort((a: any, b: any) => b.matchScore - a.matchScore);
  }, [
    allRentalProperties,
    tenant.preferred_bhk,
    tenant.preferred_location,
    budgetMin,
    budgetMax,
  ]);

  const shortlistedProperties = useMemo(() => {
    return matchedProperties.filter((p) => shortlistedIds.has(p.id));
  }, [matchedProperties, shortlistedIds]);

  const handleLinkProperty = async (prop: MatchedProperty) => {
    try {
      setLinkingId(prop.id);
      const updatedData = {
        rental_property_id: prop.id,
        property_title:
          prop.title || prop.property_type_name || `RENT-${prop.id}`,
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

    let matchedPropsText = '';
    if (matchedProperties && matchedProperties.length > 0) {
      matchedPropsText =
        '\n\nWe found the following matching rental property options for you:\n' +
        matchedProperties
          .slice(0, 3)
          .map((p: MatchedProperty, idx: number) => {
            const title =
              p.title ||
              p.property_type_name ||
              p.unit_type ||
              `Rental Unit #${p.id}`;
            const location =
              p.location_name ||
              p.society_name ||
              p.address ||
              p.location ||
              '';
            const rent = Number(
              p.expected_rent || p.monthly_rent || p.rent || 0
            );
            const rentStr =
              rent > 0
                ? `₹${rent.toLocaleString('en-IN')}/mo`
                : 'Contact for Rent';
            return `${idx + 1}. *${title}*\n   📍 Location: ${location}\n   💰 Rent: ${rentStr}\n   ⭐ Match Score: ${p.matchScore}%`;
          })
          .join('\n\n');
    } else {
      matchedPropsText =
        '\n\nCurrently, we are searching for matching rental properties for you.';
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

  const handleSharePropertyWhatsApp = (p: MatchedProperty) => {
    const phone = (tenant.whatsapp || tenant.phone || '').replace(/\D/g, '');
    if (!phone) {
      toast.error('No phone number available for WhatsApp');
      return;
    }
    const propTitle =
      p.title || p.property_type_name || p.unit_type || `Rental Unit #${p.id}`;
    const propLoc =
      p.location_name || p.society_name || p.address || p.location || '';
    const propRent = Number(p.expected_rent || p.monthly_rent || p.rent || 0);
    const rentStr =
      propRent > 0
        ? `₹${propRent.toLocaleString('en-IN')}/mo`
        : 'Contact for Rent';

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

  const handleUpdateTenant = async (formData: any) => {
    try {
      const { profile_image, ...tenantData } = formData;
      await tenantAPI.update(tenant.id, tenantData);
      const updatedTenant = {
        ...tenant,
        ...formData,
        name:
          formData.name ||
          `${formData.first_name || ''} ${formData.last_name || ''}`.trim(),
      };
      if (profile_image) {
        localStorage.setItem(
          `tenant_profile_image_${tenant.id}`,
          profile_image
        );
      }
      setTenant(updatedTenant);
      onUpdateTenant?.(updatedTenant);
      toast.success('Tenant profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update tenant profile');
    }
  };

  const derivedUsername = useMemo(() => {
    if (tenant.username) return tenant.username;
    if (!tenant.name) return 'tenant';
    const nameParts = tenant.name.trim().split(/\s+/);
    const firstName = nameParts[0] || 'tenant';
    const lastName = nameParts.slice(1).join('') || '';
    if (lastName) {
      return `${firstName.charAt(0).toLowerCase()}${lastName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    }
    return firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
  }, [tenant.username, tenant.name]);

  const statusInfo = statusConfig[tenant.status] ?? statusConfig['Inactive'];

  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-100 text-[11px] font-sans antialiased">
      {/* Sidebar Component */}
      <TenantSidebar
        tenant={tenant}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        matchedCount={matchedProperties.length}
        enquiredCount={
          matchedProperties.length > 0
            ? Math.min(2, matchedProperties.length)
            : 0
        }
        visitsCount={visits.length}
        onBack={onBack}
        showMobileSidebar={showMobileSidebar}
        setShowMobileSidebar={setShowMobileSidebar}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-100">
        {/* Compact Header Toolbar */}
        <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileSidebar(true)}
              className="md:hidden p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              <BarChart3 size={16} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-sm sm:text-base">
                  Tenant Workspace
                </h1>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 ${statusInfo.bg}`}
                >
                  {statusInfo.icon}
                  <span>{tenant.status}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons with Shortlist Count */}
          <div className="flex items-center gap-1.5">
            {/* Favorites Button */}
            <button
              onClick={() =>
                shortlistedIds.size > 0
                  ? setActiveTab('favorites')
                  : setShowEmptyFavorites(true)
              }
              className="relative p-1.5 text-gray-700 hover:text-black transition-colors cursor-pointer"
              title="View favorite properties"
              aria-label="View favorite properties"
            >
              <Heart
                size={20}
                className={
                  shortlistedIds.size > 0
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-600'
                }
              />
              {shortlistedIds.size > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none border-2 border-white">
                  {shortlistedIds.size}
                </span>
              )}
            </button>

            <div className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-[10px] font-bold text-slate-900 truncate max-w-[120px]">
                {tenant.name ||
                  `${tenant.first_name || ''} ${tenant.last_name || ''}`.trim() ||
                  'Tenant'}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 pl-1 pr-0 py-1 transition-colors cursor-pointer"
              title="Open Profile & Preferences"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0 overflow-hidden">
                {tenant.profile_image ? (
                  <img
                    src={tenant.profile_image}
                    alt="Tenant profile"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  tenant.name?.charAt(0)?.toUpperCase() || 'T'
                )}
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] shadow-2xs transition-colors cursor-pointer"
              title="Log Out"
            >
              <LogOut size={12} />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </header>

        {/* Tab View Container */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 scrollbar-custom-vertical">
          {activeTab === 'dashboard' && (
            <TenantDashboardTab
              tenant={tenant}
              matchedProperties={matchedProperties}
              loadingProperties={loadingProperties}
              linkingId={linkingId}
              onNavigateTab={setActiveTab}
              onShareWhatsApp={handleSharePropertyWhatsApp}
              onLinkProperty={handleLinkProperty}
              fmtINR={fmtINR}
              budgetMin={budgetMin}
              budgetMax={budgetMax}
            />
          )}

          {activeTab === 'matched' && (
            <TenantMatchedPropertiesTab
              matchedProperties={matchedProperties}
              linkingId={linkingId}
              onShareWhatsApp={handleSharePropertyWhatsApp}
              onLinkProperty={handleLinkProperty}
              onSendAllWhatsApp={handleWhatsApp}
              shortlistedIds={shortlistedIds}
              onToggleShortlist={(id) => {
                setShortlistedIds((prev) => {
                  const next = new Set(prev);
                  if (next.has(id)) next.delete(id);
                  else next.add(id);
                  return next;
                });
              }}
            />
          )}

          {activeTab === 'linked' && (
            <TenantLinkedPropertyTab tenant={tenant} />
          )}

          {activeTab === 'documents' && (
            <TenantDocumentVaultTab tenant={tenant} />
          )}

          {activeTab === 'visits' && (
            <TenantSiteVisitsTab
              visits={visits}
              onScheduleVisit={() => setShowVisitModal(true)}
            />
          )}

          {activeTab === 'calculators' && (
            <TenantCalculatorsTab
              calcMonthlyIncome={calcMonthlyIncome}
              setCalcMonthlyIncome={setCalcMonthlyIncome}
              calcSecurityMonths={calcSecurityMonths}
              budgetMax={budgetMax}
            />
          )}

          {activeTab === 'payments' && (
            <TenantPaymentsTab tenant={tenant} fmtINR={fmtINR} />
          )}

          {activeTab === 'maintenance' && (
            <TenantMaintenanceTab tenant={tenant} />
          )}

          {activeTab === 'enquired' && (
            <TenantEnquiredPropertiesTab
              enquiredProperties={matchedProperties.slice(0, 2)}
              linkingId={linkingId}
              onShareWhatsApp={handleSharePropertyWhatsApp}
              onLinkProperty={handleLinkProperty}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'profile' && (
            <TenantProfileTab
              tenant={tenant}
              matchedProperties={matchedProperties}
              onUpdate={handleUpdateTenant}
            />
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <Heart size={16} className="text-red-500 fill-red-500" />
                  <span>My Favorite Properties ({shortlistedIds.size})</span>
                </h2>
                {shortlistedIds.size > 0 && (
                  <button
                    onClick={() => setActiveTab('matched')}
                    className="text-xs text-orange-600 hover:text-orange-700 font-bold cursor-pointer"
                  >
                    Browse All Properties →
                  </button>
                )}
              </div>

              {shortlistedIds.size === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Heart size={44} className="text-gray-300 mb-3" />
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      You Don't Have Any Favorite Properties
                    </h3>
                    <p className="text-xs text-gray-500 max-w-sm mb-4">
                      Start exploring properties and click the heart icon on any listing to save your favorites here.
                    </p>
                    <button
                      onClick={() => setActiveTab('matched')}
                      className="px-5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-xs cursor-pointer"
                    >
                      Explore Matching Properties
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {shortlistedProperties.map((p) => {
                    const rawPhoto =
                      p.photos?.[0] ??
                      p.images?.[0] ??
                      p.mediaItems?.[0]?.file_path ??
                      null;
                    const photoPath =
                      typeof rawPhoto === 'string'
                        ? rawPhoto
                        : (rawPhoto as any)?.url || null;
                    const img = getImageUrl(photoPath);
                    const propTitle =
                      p.society_name ||
                      p.title ||
                      p.property_type_name ||
                      `Rental Unit #${p.id}`;
                    const location =
                      [p.location_name, p.city_name].filter(Boolean).join(', ') ||
                      p.location ||
                      'Location';
                    const rent = Number(
                      p.monthly_rent || p.expected_rent || p.price || 0
                    );

                    return (
                      <div
                        key={p.id}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
                      >
                        <div className="h-36 relative bg-gray-100">
                          {img ? (
                            <img
                              src={img}
                              alt={propTitle}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Building size={32} />
                            </div>
                          )}
                          <button
                            onClick={() => {
                              setShortlistedIds((prev) => {
                                const next = new Set(prev);
                                next.delete(p.id);
                                return next;
                              });
                            }}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-red-500 flex items-center justify-center shadow-xs cursor-pointer transition-transform hover:scale-105"
                            title="Remove from favorites"
                          >
                            <Heart size={14} className="fill-red-500" />
                          </button>
                          <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                            RENT-{p.id}
                          </span>
                        </div>

                        <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 truncate">
                              {propTitle}
                            </h4>
                            <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin size={10} className="text-orange-500 shrink-0" />
                              <span className="truncate">{location}</span>
                            </p>
                            <div className="text-xs font-black text-emerald-600 mt-1.5">
                              {rent > 0
                                ? `₹${rent.toLocaleString('en-IN')}/mo`
                                : 'Contact for Rent'}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-gray-100">
                            <button
                              onClick={() => handleSharePropertyWhatsApp(p)}
                              className="py-1.5 px-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <SiWhatsapp size={11} />
                              <span>WhatsApp</span>
                            </button>
                            <button
                              onClick={() => navigate(`/rentals/${p.slug || p.id}`)}
                              className="py-1.5 px-2 rounded-lg bg-[#0b3856] hover:bg-[#072438] text-white font-bold text-[10px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>View</span>
                              <ExternalLink size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Empty Favorites Modal */}
      {showEmptyFavorites && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setShowEmptyFavorites(false)}
        >
          <div
            className="relative w-full max-w-xs overflow-hidden rounded-2xl border border-gray-200 bg-white text-center shadow-2xl p-5 space-y-3"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <Heart size={24} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              No Favorite Properties Yet
            </h3>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              You haven't bookmarked any rental properties yet. Browse matching properties and click the heart icon to save them.
            </p>
            <button
              onClick={() => {
                setShowEmptyFavorites(false);
                setActiveTab('matched');
              }}
              className="w-full py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-all"
            >
              Browse Properties
            </button>
          </div>
        </div>
      )}

      {/* Visit Modal */}
      {showVisitModal && (
        <TenantVisitModal
          isOpen={showVisitModal}
          onClose={() => setShowVisitModal(false)}
          tenant={tenant}
          onSave={() => loadTimelineData()}
        />
      )}

      {/* Mandatory Automatic Preference Setup Modal (Shows FIRST) */}
      {showPreferenceModal && (
        <TenantPreferenceSetupModal
          isOpen={showPreferenceModal}
          tenant={tenant}
          allowDismiss={false}
          onSaveSuccess={(updatedData) => {
            setTenant((prev) => ({
              ...prev,
              ...updatedData,
            }));
            setShowPreferenceModal(false);
            onUpdateTenant?.({
              ...tenant,
              ...updatedData,
            });
            // Open Password Update Modal right after preference submission
            setShowPasswordUpdateModal(true);
          }}
        />
      )}

      {/* Password Update Modal (Shows ONLY ONCE after preference submission) */}
      {showPasswordUpdateModal && (
        <TenantPasswordUpdateModal
          isOpen={showPasswordUpdateModal}
          onClose={() => {
            setShowPasswordUpdateModal(false);
            localStorage.removeItem('show_password_reminder');
          }}
          tenantEmail={tenant.email}
          tenantId={tenant.id}
          tenantName={tenant.name}
          username={tenant.username || derivedUsername}
          onSuccess={() => {
            setShowPasswordUpdateModal(false);
            localStorage.removeItem('show_password_reminder');
          }}
        />
      )}
    </div>
  );
}
