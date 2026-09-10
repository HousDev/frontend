import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Clock, AlertCircle, Key, Heart, LogOut,
  BarChart3, Building, MapPin, Phone, ExternalLink, Calendar,
  Bell, ChevronDown, User, Settings, SlidersHorizontal, RefreshCw
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { toast } from 'react-toastify';
import { connectSocket } from '@/lib/socket';
import { tenantAPI } from '@/lib/tenantAPI';
import { rentalPropertiesAPI } from '@/lib/rentalPropertiesAPI';
import { tenantFollowupAPI } from '@/lib/tenantFollowupAPI';
import { tenantVisitAPI } from '@/lib/tenantVisitAPI';
import { tenantActivityAPI } from '@/lib/tenantActivityAPI';
import { getImageUrl } from '@/lib/helpers';
import { useAuth } from '@/contexts/AuthContext';
import { getTenantEnquiries, getTenantShortlist, removeTenantShortlist } from '@/lib/tenantShortlist';

// Modals
import TenantVisitModal from '@/components/tenants/TenantVisitModal';
import TenantPreferenceSetupModal from './TenantPreferenceSetupModal';
import TenantPasswordUpdateModal from './TenantPasswordUpdateModal';

// Modular tab components & types
import { Tenant, MatchedProperty } from './types';
import TenantSidebar from './TenantSidebar';
import TenantDashboardTab from './TenantDashboardTab';
import TenantMatchedPropertiesTab from './TenantMatchedPropertiesTab';
import TenantLinkedPropertyTab from './TenantLinkedPropertyTab';
import TenantDocumentVaultTab from './TenantDocumentVaultTab';
import TenantSiteVisitsTab, { checkPastPendingVisit } from './TenantSiteVisitsTab';
import TenantCalculatorsTab from './TenantCalculatorsTab';
import TenantPaymentsTab from './TenantPaymentsTab';
import TenantMaintenanceTab from './TenantMaintenanceTab';
import TenantEnquiredPropertiesTab from './TenantEnquiredPropertiesTab';
import TenantProfileTab from './TenantProfileTab';

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
  const [selectedVisitProperty, setSelectedVisitProperty] = useState<any>(null);
  const [showEmptyFavorites, setShowEmptyFavorites] = useState(false);
  const [showPreferenceModal, setShowPreferenceModal] = useState<boolean>(false);
  const [isManualPreferenceOpen, setIsManualPreferenceOpen] = useState<boolean>(false);
  const [showPasswordUpdateModal, setShowPasswordUpdateModal] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [liveNotifications, setLiveNotifications] = useState<any[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
  const [enquiryRefreshKey, setEnquiryRefreshKey] = useState<number>(0);

  // Connect socket.io for real-time notifications
  useEffect(() => {
    if (!tenant?.id) return;
    const socket = connectSocket(tenant.id);

    const handleVisitRescheduled = (data: any) => {
      const isForTenant = !data.tenant_id || Number(data.tenant_id) === Number(tenant.id);
      if (isForTenant) {
        toast.info(`🔔 Visit Rescheduled: Owner proposed a new time for ${data.property_title || 'property'}`);
        setLiveNotifications((prev) => [
          {
            id: `resched_${Date.now()}`,
            badge: 'Owner Rescheduled',
            badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
            title: `Owner Proposed New Time: ${data.property_title || 'Site Visit'}`,
            desc: `Proposed: ${data.proposed_visit_date || data.visit_date || 'New Date'} at ${data.proposed_visit_time || data.visit_time || 'New Time'}. Click to review & confirm.`,
            time: 'Just now',
            priority: 1,
            type: 'visit_reschedule',
            tab: 'visits',
          },
          ...prev,
        ]);
        loadTimelineData();
      }
    };

    const handleVisitConfirmed = (data: any) => {
      const isForTenant = !data.tenant_id || Number(data.tenant_id) === Number(tenant.id);
      if (isForTenant) {
        toast.success(`🎉 Visit Confirmed by Owner for ${data.property_title || 'property'}!`);
        setLiveNotifications((prev) => [
          {
            id: `confirmed_${Date.now()}`,
            badge: 'Visit Confirmed',
            badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
            title: `Confirmed: ${data.property_title || 'Site Visit'}`,
            desc: `Owner approved your visit for ${data.visit_date || 'scheduled date'} at ${data.visit_time || 'scheduled time'}.`,
            time: 'Just now',
            priority: 2,
            type: 'visit_confirmed',
            tab: 'visits',
          },
          ...prev,
        ]);
        loadTimelineData();
      }
    };

    const handleVisitCreated = (data: any) => {
      const isForTenant = !data.tenant_id || Number(data.tenant_id) === Number(tenant.id);
      if (isForTenant) {
        loadTimelineData();
      }
    };

    const handleGenericNotification = (data: any) => {
      setLiveNotifications((prev) => [
        {
          id: `gen_${Date.now()}`,
          badge: data.badge || 'Alert',
          badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
          title: data.title || 'New Notification',
          desc: data.message || data.desc || '',
          time: 'Just now',
          priority: 3,
          type: data.type || 'alert',
          tab: data.tab || 'dashboard',
        },
        ...prev,
      ]);
    };

    socket?.on('visit_rescheduled', handleVisitRescheduled);
    socket?.on('visit_confirmed', handleVisitConfirmed);
    socket?.on('visit_created', handleVisitCreated);
    socket?.on('notification', handleGenericNotification);

    return () => {
      socket?.off('visit_rescheduled', handleVisitRescheduled);
      socket?.off('visit_confirmed', handleVisitConfirmed);
      socket?.off('visit_created', handleVisitCreated);
      socket?.off('notification', handleGenericNotification);
    };
  }, [tenant?.id]);

  // Listen for real-time enquiry & shortlist events across windows/components
  useEffect(() => {
    const handleEnquiriesUpdated = () => setEnquiryRefreshKey((k) => k + 1);
    const handleShortlistUpdated = () => {
      const saved = localStorage.getItem(`shortlisted_${tenant.id}`);
      const generalShortlist = getTenantShortlist();
      const idSet = new Set<string | number>();
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) parsed.forEach((id) => idSet.add(id));
        } catch { }
      }
      if (generalShortlist && Array.isArray(generalShortlist)) {
        generalShortlist.forEach((p) => {
          if (p?.id) idSet.add(p.id);
        });
      }
      setShortlistedIds(idSet);
      setEnquiryRefreshKey((k) => k + 1);
    };

    window.addEventListener('tenant_enquiries_updated', handleEnquiriesUpdated);
    window.addEventListener('tenant_shortlist_updated', handleShortlistUpdated);
    return () => {
      window.removeEventListener('tenant_enquiries_updated', handleEnquiriesUpdated);
      window.removeEventListener('tenant_shortlist_updated', handleShortlistUpdated);
    };
  }, [tenant.id]);

  // Load saved shortlist for current tenant
  useEffect(() => {
    const saved = localStorage.getItem(`shortlisted_${tenant.id}`);
    const generalShortlist = getTenantShortlist();
    const idSet = new Set<string | number>();

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((id) => idSet.add(id));
        }
      } catch (e) {
        console.error('Error loading shortlisted IDs:', e);
      }
    }

    // Also hydrate from DB record if present
    if ((tenant as any)?.shortlisted_properties) {
      try {
        const raw = (tenant as any).shortlisted_properties;
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed)) {
          parsed.forEach((p: any) => {
            const id = typeof p === 'object' && p?.id ? p.id : p;
            if (id) idSet.add(id);
          });
        }
      } catch (e) { }
    }

    if (generalShortlist && Array.isArray(generalShortlist)) {
      generalShortlist.forEach((p) => {
        if (p?.id) idSet.add(p.id);
      });
    }

    setShortlistHydratedFor(null);
    setShortlistedIds(idSet);
    setShortlistHydratedFor(tenant.id);
  }, [tenant.id, (tenant as any)?.shortlisted_properties]);

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

  // Automatic Preference Setup Prompt (Prompt mandatory modal ONLY for new tenants who have NOT completed preferences)
  useEffect(() => {
    // 1. Check if tenant already has preferences in database or configured in session
    const hasDbPreferences = Boolean(
      (tenant?.preferred_location && String(tenant.preferred_location).trim().length > 0) ||
      (tenant?.preferred_bhk && String(tenant.preferred_bhk).trim().length > 0) ||
      (Number(tenant?.budget_max) > 0 || Number(tenant?.budget_min) > 0)
    );
    const isConfigured = Boolean(tenant?.id && localStorage.getItem(`tenant_preferences_configured_${tenant.id}`) === 'true');

    // If tenant already has preferences in DB or already configured, NEVER auto-open on page refresh
    if (hasDbPreferences || isConfigured) {
      localStorage.removeItem('prompt_tenant_preferences');
      setShowPreferenceModal(false);
      return;
    }

    // New tenant without preferences -> trigger mandatory Preference Setup Modal
    const timer = setTimeout(() => {
      setIsManualPreferenceOpen(false);
      setShowPreferenceModal(true);
    }, 400);
    return () => clearTimeout(timer);
  }, [tenant?.id, tenant?.preferred_location, tenant?.preferred_bhk, tenant?.budget_max, tenant?.budget_min]);

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
    const rawSaved = getTenantShortlist();
    const propMap = new Map<number | string, any>();
    allRentalProperties.forEach((p) => propMap.set(p.id, p));

    const list: any[] = [];
    shortlistedIds.forEach((id) => {
      const activeProp = propMap.get(id);
      if (activeProp) {
        list.push(activeProp);
      } else {
        const fallbackProp = rawSaved.find((p) => String(p.id) === String(id));
        if (fallbackProp) list.push(fallbackProp);
      }
    });

    return list;
  }, [allRentalProperties, shortlistedIds]);

  const enquiredProperties = useMemo(() => {
    const propMap = new Map<number | string, any>();
    allRentalProperties.forEach((p) => {
      if (p?.id) propMap.set(String(p.id), p);
    });

    const collectedMap = new Map<number | string, any>();

    // 1. From localStorage enquiries
    const rawEnquiries = getTenantEnquiries();
    if (Array.isArray(rawEnquiries)) {
      rawEnquiries.forEach((e) => {
        if (e?.id) {
          const full = propMap.get(String(e.id)) || e;
          collectedMap.set(String(e.id), {
            ...full,
            ...e,
            enquired_at: e.enquired_at || new Date().toISOString()
          });
        }
      });
    }

    // 2. From DB tenant.enquired_properties
    if ((tenant as any)?.enquired_properties) {
      try {
        const raw = (tenant as any).enquired_properties;
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed)) {
          parsed.forEach((e: any) => {
            const id = e?.id || e;
            if (id) {
              const full = propMap.get(String(id)) || (typeof e === 'object' ? e : { id });
              if (!collectedMap.has(String(id))) {
                collectedMap.set(String(id), {
                  ...full,
                  ...(typeof e === 'object' ? e : {}),
                  enquired_at: e.enquired_at || new Date().toISOString()
                });
              }
            }
          });
        }
      } catch (e) { }
    }

    // 3. From site visits (each visit is an enquiry)
    if (Array.isArray(visits)) {
      visits.forEach((v: any) => {
        const propId = v.rental_property_id;
        if (propId) {
          const full = propMap.get(String(propId));
          if (!collectedMap.has(String(propId))) {
            collectedMap.set(String(propId), full || {
              id: propId,
              title: v.property_title || `Rental Property #${propId}`,
              status: v.status || 'Visit Scheduled',
              enquired_at: v.visit_date || new Date().toISOString(),
            });
          }
        }
      });
    }

    // 4. From linked property
    if ((tenant as any)?.rental_property_id) {
      const propId = String((tenant as any).rental_property_id);
      const full = propMap.get(propId);
      if (!collectedMap.has(propId) && full) {
        collectedMap.set(propId, full);
      }
    }

    return Array.from(collectedMap.values());
  }, [allRentalProperties, tenant, visits, enquiryRefreshKey]);

  // Derived rich notifications with exact timestamp calculation ("Kab aaya time")
  const dynamicNotifications = useMemo(() => {
    const list: any[] = [...liveNotifications];

    const formatNotificationTime = (dateStr: any, fallbackDateText?: string, fallbackTimeText?: string) => {
      if (dateStr) {
        try {
          const s = String(dateStr).trim();
          const d = s.includes('T') || s.includes('Z') ? new Date(s) : new Date(s.split('-').join('/'));
          if (!isNaN(d.getTime())) {
            const now = new Date();
            const diffMs = now.getTime() - d.getTime();
            const diffMins = Math.floor(diffMs / 60000);

            if (diffMins >= 0 && diffMins < 1) return 'Just now';
            if (diffMins >= 1 && diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;

            const isToday = d.toDateString() === now.toDateString();
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const isYesterday = d.toDateString() === yesterday.toDateString();
            const timePart = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

            if (isToday) return `Today at ${timePart}`;
            if (isYesterday) return `Yesterday at ${timePart}`;
            return `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, ${timePart}`;
          }
        } catch { }
      }
      if (fallbackDateText && fallbackTimeText) {
        return `${fallbackDateText} • ${fallbackTimeText}`;
      }
      return fallbackDateText || 'Recent';
    };

    // 1. Visits list
    visits.forEach((v: any) => {
      const isOwnerRescheduled = v.status === 'Pending Tenant Approval' || v.rescheduled_by === 'owner';
      const isPending = v.status === 'Pending Owner Approval' || v.status === 'Scheduled' || v.status === 'Pending Approval';
      const isConfirmed = v.status === 'Confirmed' || v.status === 'Approved';
      const isDeclined = v.status === 'Cancelled' || v.status === 'Declined';

      let dateText = 'Upcoming';
      if (v.visit_date) {
        try {
          const s = String(v.visit_date).trim();
          const d = s.includes('T') || s.includes('Z') ? new Date(s) : new Date(s.split('-').join('/'));
          if (!isNaN(d.getTime())) {
            dateText = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
          }
        } catch { }
      }
      const timeText = v.visit_time ? String(v.visit_time).replace(/:\d\d$/, '') : '11:00 AM';
      const notifTime = formatNotificationTime(v.updated_at || v.created_at, dateText, timeText);

      if (isOwnerRescheduled) {
        let propDateText = dateText;
        if (v.proposed_visit_date) {
          try {
            const s = String(v.proposed_visit_date).trim();
            const d = s.includes('T') || s.includes('Z') ? new Date(s) : new Date(s.split('-').join('/'));
            if (!isNaN(d.getTime())) {
              propDateText = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            }
          } catch { }
        }
        const propTime = v.proposed_visit_time ? String(v.proposed_visit_time).replace(/:\d\d$/, '') : timeText;

        list.push({
          id: `visit_resched_${v.id}`,
          badge: 'Owner Rescheduled',
          badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
          title: `Owner Proposed New Time: ${v.property_title || v.rental_property_title || 'Rental Property'}`,
          desc: `New Slot: ${propDateText} at ${propTime}${v.remarks ? ` • Note: "${v.remarks}"` : ''} • Click to Review`,
          time: notifTime,
          priority: 1,
          type: 'visit_reschedule',
          tab: 'visits',
          isLive: true,
        });
      } else if (isConfirmed) {
        list.push({
          id: `visit_conf_${v.id}`,
          badge: 'Visit Confirmed',
          badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          title: `Confirmed: ${v.property_title || v.rental_property_title || 'Rental Property'}`,
          desc: `Visit confirmed for ${dateText} at ${timeText} • Click to view details`,
          time: notifTime,
          priority: 2,
          type: 'visit_confirmed',
          tab: 'visits',
        });
      } else if (isPending) {
        list.push({
          id: `visit_pend_${v.id}`,
          badge: 'Pending Approval',
          badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
          title: `Visit Requested: ${v.property_title || v.rental_property_title || 'Rental Property'}`,
          desc: `Requested for ${dateText} at ${timeText} • Awaiting owner response`,
          time: notifTime,
          priority: 3,
          type: 'visit_pending',
          tab: 'visits',
        });
      } else if (isDeclined) {
        list.push({
          id: `visit_decl_${v.id}`,
          badge: 'Visit Declined',
          badgeColor: 'bg-rose-100 text-rose-900 border-rose-200',
          title: `Visit Cancelled: ${v.property_title || v.rental_property_title || 'Rental Property'}`,
          desc: `Visit on ${dateText} at ${timeText} could not be confirmed`,
          time: notifTime,
          priority: 4,
          type: 'visit_declined',
          tab: 'visits',
        });
      }
    });

    // 2. Enquiries list
    const tenantEnquiries = getTenantEnquiries();
    if (Array.isArray(tenantEnquiries)) {
      tenantEnquiries.forEach((enq: any, idx: number) => {
        const notifTime = formatNotificationTime(enq.created_at || enq.date || enq.enquired_at, 'Recent');
        list.push({
          id: `enq_${enq.id || idx}`,
          badge: 'Enquiry Sent',
          badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
          title: `Enquiry: ${enq.society_name || enq.property_title || enq.title || 'Rental Listing'}`,
          desc: `${enq.preferred_bhk || '2 BHK'} in ${enq.preferred_location || 'Area'}${enq.budget ? ` • Budget: ₹${Number(enq.budget).toLocaleString('en-IN')}` : ''}`,
          time: notifTime,
          priority: 5,
          type: 'enquiry',
          tab: 'enquiries',
        });
      });
    }

    // 3. Matched Properties
    if (matchedProperties.length > 0) {
      list.push({
        id: 'matched_props',
        badge: 'Matching Homes',
        badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        title: `${matchedProperties.length} Matching Homes Available`,
        desc: `Curated rental options tailored to your location & budget preferences.`,
        time: 'Active',
        priority: 6,
        type: 'matched',
        tab: 'matched',
      });
    }

    return list.sort((a, b) => (a.priority || 10) - (b.priority || 10));
  }, [liveNotifications, visits, matchedProperties, enquiryRefreshKey]);

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

  const handleOpenScheduleVisit = (property?: any) => {
    setSelectedVisitProperty(property || null);
    setShowVisitModal(true);
  };

  const handleSharePropertyWhatsApp = (p: MatchedProperty) => {
    const rawOwnerPhone =
      (p as any).owner_phone ||
      (p as any).owner_contact ||
      (p as any).owner?.phone ||
      (p as any).owner?.whatsapp ||
      (p as any).seller_phone ||
      (p as any).contact_number ||
      (p as any).owner_mobile ||
      '';
    let targetPhone = String(rawOwnerPhone).replace(/\D/g, '');

    if (!targetPhone) {
      targetPhone = (tenant.whatsapp || tenant.phone || '').replace(/\D/g, '');
    }

    if (!targetPhone) {
      toast.error('No contact number available for WhatsApp');
      return;
    }

    const ownerName =
      (p as any).owner_name ||
      (p as any).owner?.name ||
      (p as any).seller_name ||
      'Property Owner';
    const propTitle =
      p.title || p.property_type_name || p.unit_type || `Rental Unit #${p.id}`;
    const propLoc =
      p.location_name || p.society_name || p.address || p.location || 'Pune';
    const propRent = Number(p.expected_rent || p.monthly_rent || p.rent || 0);
    const rentStr =
      propRent > 0
        ? `₹${propRent.toLocaleString('en-IN')}/mo`
        : 'Contact for Rent';

    const message = encodeURIComponent(
      `Hello ${ownerName},\n\n` +
      `I am ${tenant.name || 'a prospective tenant'}. I found your property on GharDekho and I am very interested in renting it:\n\n` +
      `🏠 *${propTitle}* (ID: RENT-${p.id})\n` +
      `📍 Location: ${propLoc}\n` +
      `💰 Rent: ${rentStr}\n\n` +
      `Could you please let me know if it is available and when we can arrange a site visit?\n\n` +
      `Best Regards,\n${tenant.name || 'Tenant'}\nContact: ${tenant.phone || ''}`
    );

    window.open(`https://wa.me/${targetPhone}?text=${message}`, '_blank');
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
        shortlistedCount={shortlistedIds.size}
        enquiredCount={enquiredProperties.length}
        visitsCount={visits.length}
        onBack={onBack}
        onLogout={handleLogout}
        onBackToWebsite={() => navigate('/properties?transaction=rent&tab=rent')}
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

          {/* Action Buttons with Shortlist Count & Profile Menu */}
          <div className="flex items-center gap-2">
            {/* Favorites Heart Button */}
            <button
              onClick={() =>
                shortlistedIds.size > 0
                  ? setActiveTab('favorites')
                  : setShowEmptyFavorites(true)
              }
              className="relative p-2 text-gray-600 hover:text-red-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="View favorite properties"
              aria-label="View favorite properties"
            >
              <Heart
                size={18}
                className={
                  shortlistedIds.size > 0
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-500'
                }
              />
              {shortlistedIds.size > 0 && (
                <span className="absolute 0 top-1 right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center leading-none border-2 border-white">
                  {shortlistedIds.size}
                </span>
              )}
            </button>

            {/* 🔔 Notifications Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer relative"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell size={18} />
                {dynamicNotifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-white animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[420px] overflow-y-auto divide-y divide-gray-50">
                  <div className="flex items-center justify-between pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <Bell size={14} className="text-orange-500" />
                      <span className="font-black text-xs text-slate-900 tracking-tight">Notifications & Alerts</span>
                    </div>
                    <span className="text-[9.5px] font-extrabold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                      {dynamicNotifications.length} Alerts
                    </span>
                  </div>

                  <div className="py-2 space-y-2">
                    {dynamicNotifications.map((notif: any, idx: number) => {
                      return (
                        <div
                          key={`notif-item-${notif.id || idx}`}
                          onClick={() => {
                            if (notif.tab) setActiveTab(notif.tab);
                            setShowNotifications(false);
                          }}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer text-left space-y-1 relative ${notif.priority === 1
                              ? 'bg-amber-50/80 hover:bg-amber-100/80 border-amber-200 shadow-2xs'
                              : notif.type === 'visit_confirmed'
                                ? 'bg-emerald-50/70 hover:bg-emerald-100/70 border-emerald-200'
                                : notif.type === 'enquiry'
                                  ? 'bg-purple-50/60 hover:bg-purple-100/60 border-purple-200'
                                  : 'bg-slate-50 hover:bg-slate-100 border-slate-100'
                            }`}
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <span
                              className={`px-1.5 py-0.5 rounded border text-[8.5px] font-black uppercase tracking-wider flex items-center gap-1 ${notif.badgeColor || 'bg-slate-100 text-slate-800 border-slate-200'
                                }`}
                            >
                              {notif.priority === 1 && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block" />
                              )}
                              {notif.badge}
                            </span>
                            <span className="text-[9.5px] text-gray-500 font-semibold flex items-center gap-0.5 whitespace-nowrap bg-white/80 px-1.5 py-0.5 rounded-md border border-gray-100 shadow-2xs">
                              <Clock size={9.5} className="text-gray-400 shrink-0" />
                              {notif.time}
                            </span>
                          </div>
                          <h5 className="font-bold text-[12px] text-slate-900 leading-tight">
                            {notif.title}
                          </h5>
                          <p className="text-[10.5px] text-slate-600 leading-snug">
                            {notif.desc}
                          </p>
                        </div>
                      );
                    })}

                    {dynamicNotifications.length === 0 && (
                      <div className="py-8 text-center text-gray-400 text-xs flex flex-col items-center gap-1.5">
                        <Bell size={20} className="text-gray-300 stroke-[1.5]" />
                        <span>No new notifications yet</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 👤 Profile Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-rose-600 text-white flex items-center justify-center font-black text-xs shadow-2xs overflow-hidden">
                  {tenant.profile_image ? (
                    <img
                      src={tenant.profile_image}
                      alt="Tenant profile"
                      className="h-full w-full rounded-xl object-cover"
                    />
                  ) : (
                    tenant.name?.charAt(0)?.toUpperCase() || 'T'
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-xs font-extrabold text-slate-900 truncate max-w-[120px]">
                    {tenant.name || 'Tenant'}
                  </span>
                  <span className="text-[10px] text-orange-600 font-bold font-mono">
                    {tenant.tenant_id || 'TEN0001'}
                  </span>
                </div>

              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
                  {/* Profile Header */}
                  <div className="px-3.5 py-2.5 border-b border-gray-100 bg-slate-50/50">
                    <div className="font-extrabold text-slate-900">{tenant.name || 'Tenant'}</div>
                    <div className="text-[10px] text-gray-500 truncate">{tenant.email || 'tenant@resaleexpert.in'}</div>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="px-2 py-0.2 rounded-md bg-orange-100 text-orange-800 font-mono font-bold text-[9px]">
                        {tenant.tenant_id}
                      </span>
                      <span className="px-2 py-0.2 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                        Active Tenant
                      </span>
                    </div>
                  </div>

                  {/* Menu Links */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setIsManualPreferenceOpen(true);
                        setShowPreferenceModal(true);
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-orange-50 hover:text-orange-700 font-semibold cursor-pointer transition-colors text-left"
                    >
                      <SlidersHorizontal size={14} className="text-orange-500" />
                      <span>Edit Rental Preferences</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setActiveTab('profile');
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-orange-50 hover:text-orange-700 font-semibold cursor-pointer transition-colors text-left"
                    >
                      <User size={14} className="text-slate-400" />
                      <span>Profile & Account</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowPasswordUpdateModal(true);
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-orange-50 hover:text-orange-700 font-semibold cursor-pointer transition-colors text-left"
                    >
                      <Key size={14} className="text-slate-400" />
                      <span>Change Password</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setActiveTab('visits');
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-orange-50 hover:text-orange-700 font-semibold cursor-pointer transition-colors text-left"
                    >
                      <Calendar size={14} className="text-slate-400" />
                      <span>Scheduled Visits ({visits.length})</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="pt-1 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 hover:bg-rose-50 font-bold cursor-pointer transition-colors text-left"
                    >
                      <LogOut size={14} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tab View Container */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 scrollbar-custom-vertical">
          {/* ⏰ Global Post-Visit Feedback Prompt Banner */}
          {(() => {
            const pendingPastVisit = checkPastPendingVisit(visits, 5);
            if (!pendingPastVisit || activeTab === 'visits') return null;
            return (
              <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 text-white p-3.5 rounded-2xl shadow-lg border border-amber-400/30 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                    <Clock size={20} className="text-white animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                        Visit Outcome Needed
                      </span>
                      <span className="text-xs text-amber-100 font-medium">Scheduled Visit Passed</span>
                    </div>
                    <p className="font-extrabold text-sm text-white mt-0.5">
                      Did your visit take place for {pendingPastVisit.property_title || pendingPastVisit.rental_property_title || 'Rental Property'}?
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('visits')}
                  className="w-full sm:w-auto px-4 py-2 bg-white text-slate-900 font-extrabold text-xs rounded-xl shadow-md hover:bg-amber-50 transition cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
                >
                  <span>Confirm Visit Outcome</span>
                  <CheckCircle2 size={14} className="text-emerald-600" />
                </button>
              </div>
            );
          })()}

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
              shortlistedCount={shortlistedIds.size}
              enquiredCount={enquiredProperties.length}
              visits={visits}
              onOpenPreferences={() => {
                setIsManualPreferenceOpen(true);
                setShowPreferenceModal(true);
              }}
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
              onScheduleVisit={() => handleOpenScheduleVisit()}
              onRefresh={loadTimelineData}
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
              enquiredProperties={enquiredProperties}
              linkingId={linkingId}
              onShareWhatsApp={handleSharePropertyWhatsApp}
              onScheduleVisit={handleOpenScheduleVisit}
              onLinkProperty={handleLinkProperty}
              onNavigateTab={setActiveTab}
              tenantId={tenant.id}
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
                              removeTenantShortlist(p.id);
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

                          <div className="space-y-1.5 pt-2 border-t border-gray-100">
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                onClick={() => handleSharePropertyWhatsApp(p)}
                                className="py-1.5 px-2 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-[10px] transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                              >
                                <SiWhatsapp size={11} />
                                <span>WhatsApp</span>
                              </button>
                              <button
                                onClick={() => handleOpenScheduleVisit(p)}
                                className="py-1.5 px-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-slate-800 font-extrabold text-[10px] transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                              >
                                <Calendar size={11} className="text-orange-600" />
                                <span>Book Visit</span>
                              </button>
                            </div>
                            <button
                              onClick={() => navigate(`/rentals/${p.slug || p.id}`)}
                              className="w-full py-1.5 px-2 rounded-lg bg-[#0b3856] hover:bg-[#072438] text-white font-bold text-[10px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <span>View Details</span>
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
          onClose={() => {
            setShowVisitModal(false);
            setSelectedVisitProperty(null);
          }}
          tenant={tenant}
          initialProperty={selectedVisitProperty}
          onSave={() => loadTimelineData()}
        />
      )}

      {/* Automatic Preference Setup Modal */}
      {showPreferenceModal && (
        <TenantPreferenceSetupModal
          isOpen={showPreferenceModal}
          tenant={tenant}
          allowDismiss={isManualPreferenceOpen}
          onClose={() => {
            setShowPreferenceModal(false);
            setIsManualPreferenceOpen(false);
            localStorage.removeItem('prompt_tenant_preferences');
          }}
          onSaveSuccess={(updatedData) => {
            setTenant((prev) => ({
              ...prev,
              ...updatedData,
            }));
            setShowPreferenceModal(false);
            setIsManualPreferenceOpen(false);
            if (tenant?.id) {
              localStorage.setItem(`tenant_preferences_configured_${tenant.id}`, 'true');
            }
            localStorage.removeItem('prompt_tenant_preferences');
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
