import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Phone, Mail, MapPin, Building, Calendar, Edit,
  Home, CheckCircle2, Clock, AlertCircle, StickyNote, Plus, Bell,
  Link2, Loader2, X, FileText, Shield, TrendingUp, SlidersHorizontal,
  BarChart3, Calculator, MessageSquare, Key, Bookmark, ExternalLink,
  ChevronRight, ArrowUpRight, DollarSign, Check, Award, Eye, Globe, LogOut,
  PhoneCall, UserCheck, Lock, Building2, Search, ChevronDown, CheckSquare,
  Square, Filter, Copy, CopyCheck,
  IndianRupee,
  IndianRupeeIcon
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { toast } from 'react-toastify';
import { tenantAPI } from '@/lib/tenantAPI';
import { rentalPropertiesAPI } from '@/lib/rentalPropertiesAPI';
import { tenantFollowupAPI } from '@/lib/tenantFollowupAPI';
import { tenantVisitAPI } from '@/lib/tenantVisitAPI';
import { tenantActivityAPI } from '@/lib/tenantActivityAPI';
import { getImageUrl } from '@/lib/helpers';
import { getTenantShortlist, removeTenantShortlist, ShortlistedRentalProperty } from '@/lib/tenantShortlist';
import { useAuth } from '@/contexts/AuthContext';
import { getMasterDropdownOptions } from '@/lib/useMasterData';
import TenantFormModal from './TenantFormModal';
import TenantFollowupModal from './TenantFollowupModal';
import TenantVisitModal from './TenantVisitModal';
import TenantActivityModal from './TenantActivityModal';
import TenantPreferenceSetupModal from './TenantPreferenceSetupModal';

interface Tenant {
  id: number;
  tenant_id: string;
  username?: string;
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
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [tenant, setTenant] = useState<Tenant>(initialTenant);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showMobileSidebar, setShowMobileSidebar] = useState<boolean>(false);

  const handleLogout = () => {
    localStorage.removeItem('verified_tenant');
    localStorage.removeItem('prompt_tenant_preferences');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (logout) logout();
    toast.info('Logged out of tenant account');
    navigate('/login');
  };

  // Shortlisted Properties & Preferences Modal State
  const [shortlistedList, setShortlistedList] = useState<ShortlistedRentalProperty[]>(getTenantShortlist());
  const [showPreferenceModal, setShowPreferenceModal] = useState<boolean>(false);
  const [masterLocations, setMasterLocations] = useState<string[]>([]);
  const [masterBhkOptions, setMasterBhkOptions] = useState<string[]>([
    '1 RK', '1 BHK', '1.5 BHK', '2 BHK', '2.5 BHK', '3 BHK', '3+ BHK', '4 BHK'
  ]);
  const [masterTenantTypes, setMasterTenantTypes] = useState<string[]>([
    'Family', 'Bachelor', 'Bachelor (Male)', 'Bachelor (Female)', 'Company Lease', 'Any'
  ]);

  // Preferred Locations (Multi-Select)
  const [prefLocationList, setPrefLocationList] = useState<string[]>(() => {
    const raw = tenant.preferred_location || '';
    return raw ? raw.split(/[;,]+/).map((s) => s.trim()).filter(Boolean) : [];
  });
  const [locationSearchTerm, setLocationSearchTerm] = useState<string>('');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState<boolean>(false);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // Preferred Budget
  const [prefBudgetMin, setPrefBudgetMin] = useState<string>(tenant.budget_min ? String(tenant.budget_min) : '');
  const [prefBudgetMax, setPrefBudgetMax] = useState<string>(tenant.budget_max ? String(tenant.budget_max) : '');

  // Preferred BHK (Multi-Select)
  const [prefBhkList, setPrefBhkList] = useState<string[]>(() => {
    const raw = tenant.preferred_bhk || '';
    return raw ? raw.split(/[;,]+/).map((s) => s.trim()).filter(Boolean) : [];
  });
  const [isBhkDropdownOpen, setIsBhkDropdownOpen] = useState<boolean>(false);
  const [bhkSearchTerm, setBhkSearchTerm] = useState<string>('');
  const bhkDropdownRef = useRef<HTMLDivElement>(null);

  // Preferred Tenant Type
  const [prefTenantType, setPrefTenantType] = useState<string>(tenant.tenant_type || 'Family');
  const [savingPrefs, setSavingPrefs] = useState<boolean>(false);

  // Fetch Master Data (Location from Common Master, Unit Type from Property Master, Tenant Types)
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const data = await getMasterDropdownOptions(['common', 'property', 'location', 'lead', 'buyer']);

        // 1. Common Master -> Location (95+ active values)
        const locs = (data['location'] || data['locations'] || data['preferred_location'] || data['locality'] || [])
          .map((o: any) => o.label || o.value || o.name || String(o))
          .filter(Boolean);
        if (locs.length > 0) {
          setMasterLocations(Array.from(new Set(locs)).sort((a: string, b: string) => a.localeCompare(b)));
        }

        // 2. Property Master -> Unit Type / Preferred BHK
        const bhks = (data['unit type'] || data['unit_type'] || data['preferred_bhk'] || data['property type'] || [])
          .map((o: any) => o.label || o.value || o.name || String(o))
          .filter(Boolean);
        if (bhks.length > 0) {
          setMasterBhkOptions(Array.from(new Set(bhks)));
        }

        // 3. Tenant Types
        const tTypes = (data['tenant type'] || data['tenant_type'] || data['tenant_types'] || [])
          .map((o: any) => o.label || o.value || o.name || String(o))
          .filter(Boolean);
        if (tTypes.length > 0) {
          setMasterTenantTypes(Array.from(new Set(tTypes)));
        }
      } catch (err) {
        console.warn('Error fetching master locations & options:', err);
      }
    };
    fetchMasterData();
  }, []);

  // Refresh shortlist on tab change
  useEffect(() => {
    setShortlistedList(getTenantShortlist());
  }, [activeTab]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(e.target as Node)) {
        setIsLocationDropdownOpen(false);
      }
      if (bhkDropdownRef.current && !bhkDropdownRef.current.contains(e.target as Node)) {
        setIsBhkDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLocationSelection = (loc: string) => {
    setPrefLocationList((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  };

  const removeLocationSelection = (loc: string) => {
    setPrefLocationList((prev) => prev.filter((l) => l !== loc));
  };

  const toggleBhkSelection = (bhk: string) => {
    setPrefBhkList((prev) =>
      prev.includes(bhk) ? prev.filter((b) => b !== bhk) : [...prev, bhk]
    );
  };

  // Password Update State
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPass, setShowPass] = useState<boolean>(false);
  const [updatingPass, setUpdatingPass] = useState<boolean>(false);

  // Owner Unlock Banner State (from localStorage after Contact Owner verification)
  const [unlockedOwner, setUnlockedOwner] = useState<any>(() => {
    try { return JSON.parse(localStorage.getItem('last_unlocked_owner') || 'null'); } catch { return null; }
  });
  const dismissOwnerBanner = () => {
    localStorage.removeItem('last_unlocked_owner');
    setUnlockedOwner(null);
  };

  // Password Reminder Banner State
  const [showPasswordReminder, setShowPasswordReminder] = useState<boolean>(
    localStorage.getItem('show_password_reminder') === 'true'
  );
  const dismissPasswordReminder = () => {
    localStorage.removeItem('show_password_reminder');
    setShowPasswordReminder(false);
  };

  // Calculator states
  const [calcMonthlyIncome, setCalcMonthlyIncome] = useState<number>(75000);
  const [calcSecurityMonths, setCalcSecurityMonths] = useState<number>(2);

  const [copiedUsername, setCopiedUsername] = useState<boolean>(false);

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

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(derivedUsername);
    setCopiedUsername(true);
    toast.success(`Username @${derivedUsername} copied to clipboard!`);
    setTimeout(() => setCopiedUsername(false), 2000);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setUpdatingPass(true);
    try {
      const res = await tenantAPI.updatePassword({
        email: tenant.email,
        tenant_id: tenant.id,
        new_password: newPassword,
      });

      if (res?.success) {
        toast.success(res.message || 'Password updated successfully!');
        if (res.username && res.username !== tenant.username) {
          setTenant((prev) => ({ ...prev, username: res.username }));
          onUpdateTenant?.({ ...tenant, username: res.username });
        }
        setNewPassword('');
        setConfirmPassword('');
        dismissPasswordReminder();
      } else {
        toast.error(res?.message || 'Failed to update password');
      }
    } catch (err: any) {
      console.error('Password update error:', err);
      toast.error(err?.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setUpdatingPass(false);
    }
  };

  const [allRentalProperties, setAllRentalProperties] = useState<any[]>([]);
  const [loadingProperties, setLoadingProperties] = useState<boolean>(false);
  const [linkingId, setLinkingId] = useState<number | null>(null);

  // Timeline Data
  const [followups, setFollowups] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState<boolean>(false);

  // Modal Controls
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showVisitModal, setShowVisitModal] = useState<boolean>(false);
  const [showActivityModal, setShowActivityModal] = useState<boolean>(false);
  const [showFollowupModal, setShowFollowupModal] = useState<boolean>(false);

  // Combined Location options from Master + Properties
  const locationOptions = useMemo(() => {
    const fromProps = allRentalProperties.map((p) => p.location || p.city || p.location_name).filter(Boolean);
    return Array.from(new Set([...masterLocations, ...fromProps])).filter(Boolean).sort((a: string, b: string) => a.localeCompare(b));
  }, [masterLocations, allRentalProperties]);

  const filteredLocationOptions = useMemo(() => {
    if (!locationSearchTerm.trim()) return locationOptions;
    const term = locationSearchTerm.toLowerCase().trim();
    return locationOptions.filter((loc) => loc.toLowerCase().includes(term));
  }, [locationOptions, locationSearchTerm]);

  const filteredBhkOptions = useMemo(() => {
    if (!bhkSearchTerm.trim()) return masterBhkOptions;
    const term = bhkSearchTerm.toLowerCase().trim();
    return masterBhkOptions.filter((bhk) => bhk.toLowerCase().includes(term));
  }, [masterBhkOptions, bhkSearchTerm]);

  useEffect(() => {
    setTenant(initialTenant);
    setShortlistedList(getTenantShortlist());
  }, [initialTenant]);

  // 3-Second Automatic Preference Setup Prompt
  useEffect(() => {
    const shouldPrompt = localStorage.getItem('prompt_tenant_preferences') === 'true' || (!tenant.preferred_location && !tenant.budget_max);
    if (shouldPrompt) {
      const timer = setTimeout(() => {
        const locs = tenant.preferred_location
          ? String(tenant.preferred_location).split(/[;,]+/).map((s) => s.trim()).filter(Boolean)
          : [];
        setPrefLocationList(locs);
        setPrefBudgetMin(tenant.budget_min ? String(tenant.budget_min) : '');
        setPrefBudgetMax(tenant.budget_max ? String(tenant.budget_max) : '');
        const bhks = tenant.preferred_bhk
          ? String(tenant.preferred_bhk).split(/[;,]+/).map((s) => s.trim()).filter(Boolean)
          : [];
        setPrefBhkList(bhks);
        setPrefTenantType(tenant.tenant_type || 'Family');
        setShowPreferenceModal(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [tenant.id, tenant.preferred_location, tenant.budget_max]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrefs(true);
    try {
      const locString = prefLocationList.join(', ');
      const bhkString = prefBhkList.join(', ');
      const updatedData = {
        preferred_location: locString,
        budget_min: prefBudgetMin ? Number(prefBudgetMin) : null,
        budget_max: prefBudgetMax ? Number(prefBudgetMax) : null,
        preferred_bhk: bhkString,
        tenant_type: prefTenantType,
      };
      await tenantAPI.update(tenant.id, updatedData);
      setTenant((prev) => ({ ...prev, ...updatedData }));
      if (onUpdateTenant) onUpdateTenant({ ...tenant, ...updatedData });
      localStorage.removeItem('prompt_tenant_preferences');
      setShowPreferenceModal(false);
      toast.success('Your rental preferences have been saved!');
    } catch (err) {
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setSavingPrefs(false);
    }
  };

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
    const rawBhk = (tenant.preferred_bhk || '').toLowerCase().trim();
    const bhkList = rawBhk.split(/[;,]+/).map((s) => s.trim()).filter(Boolean);
    const rawLoc = (tenant.preferred_location || '').toLowerCase().trim();
    const locList = rawLoc.split(/[;,]+/).map((s) => s.trim()).filter(Boolean);

    return allRentalProperties
      .map((p: any) => {
        let score = 0;
        let reasons: string[] = [];
        const pType = (p.property_type_name || p.property_type || p.unit_type || p.title || '').toLowerCase();

        const bhkMatches = bhkList.some((b) => pType.includes(b) || b.includes(pType));
        if (bhkMatches || bhkList.length === 0) {
          score += 40;
          if (bhkMatches) reasons.push(`BHK Match`);
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
        const locMatches = locList.some((loc) => pLoc.includes(loc) || loc.includes(pLoc));
        if (locMatches || locList.length === 0) {
          score += 20;
          if (locMatches) reasons.push('Location Match');
        } else if (!rawLoc) {
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
    { id: 'shortlisted', label: `Shortlisted Homes (${shortlistedList.length})`, icon: Bookmark },
    { id: 'matched', label: `Property Matches (${matchedProperties.length})`, icon: CheckCircle2 },
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
            <div className="flex items-center gap-1 mt-0.5 flex-wrap">
              <span className="text-[9px] font-bold text-orange-600">{tenant.tenant_id}</span>
              <span className="text-[9px] font-mono font-bold text-slate-600 bg-slate-200/80 px-1 py-0.2 rounded">@{derivedUsername}</span>
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

        {/* Back Actions Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50/70 space-y-1.5">
          {/* <button
            onClick={() => navigate('/rentals')}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0b3856] text-white font-bold hover:bg-[#07263b] transition-all text-xs shadow-xs cursor-pointer"
          >
            <Globe size={13} className="text-amber-400" />
            <span>Back to Website</span>
          </button> */}

          {onBack && (
            <button
              onClick={onBack}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-bold hover:bg-gray-100 transition-colors text-xs shadow-2xs cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Back to Website</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in"
            onClick={() => setShowMobileSidebar(false)}
          />
          <div className="relative w-64 max-w-[80vw] bg-white h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="p-3.5 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500 text-white font-black flex items-center justify-center text-xs">
                  {tenant.name?.charAt(0)?.toUpperCase() || 'T'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-xs truncate">{tenant.name}</h3>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-orange-600">{tenant.tenant_id}</span>
                    <span className="text-[9px] font-mono font-bold text-slate-600 bg-slate-200/80 px-1 py-0.2 rounded">@{derivedUsername}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowMobileSidebar(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
              {sidebarNavItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setShowMobileSidebar(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${active
                      ? 'bg-orange-50 text-orange-600 border border-orange-200 font-bold'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <Icon size={14} className={active ? 'text-orange-600' : 'text-gray-400'} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Footer Actions */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 space-y-1.5">
              {/* <button
                onClick={() => {
                  setShowMobileSidebar(false);
                  navigate('/rentals');
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0b3856] text-white font-bold hover:bg-[#07263b] text-xs shadow-xs"
              >
                <Globe size={13} className="text-amber-400" />
                <span>Back to Website</span>
              </button> */}

              {onBack && (
                <button
                  onClick={() => {
                    setShowMobileSidebar(false);
                    onBack();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-bold hover:bg-gray-100 text-xs"
                >
                  <ArrowLeft size={13} />
                  <span>Back to Website</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}


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

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">

              {/* Password Reminder Banner */}
              {showPasswordReminder && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 shadow-2xs">
                  <div className="w-7 h-7 shrink-0 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Lock size={14} className="text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-amber-800 text-xs">Set Your Password</p>
                    <p className="text-amber-700 text-[10px] mt-0.5">
                      Your account was created with a temporary auto-generated password. Please update it to secure your account.
                    </p>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className="mt-1.5 px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] transition-colors"
                    >
                      Update Password Now →
                    </button>
                  </div>
                  <button
                    onClick={dismissPasswordReminder}
                    className="p-1 rounded-lg text-amber-400 hover:text-amber-700 hover:bg-amber-100 transition-colors shrink-0"
                    title="Dismiss"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}

              {/* Owner Unlock Banner — shown after "Contact Owner" OTP verification */}
              {unlockedOwner && (
                <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-xs overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-emerald-600">
                    <div className="flex items-center gap-2">
                      <UserCheck size={14} className="text-white" />
                      <span className="text-white font-bold text-[10px] uppercase tracking-wide">Owner Contact Unlocked ✨</span>
                    </div>
                    <button
                      onClick={dismissOwnerBanner}
                      className="p-0.5 rounded text-emerald-200 hover:text-white transition-colors"
                      title="Dismiss"
                    >
                      <X size={13} />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] text-emerald-700 mb-3">
                      You successfully unlocked the owner's contact details for:
                      <strong className="text-emerald-900 ml-1">{unlockedOwner.property_title || `Property #${unlockedOwner.property_id}`}</strong>
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="flex items-center gap-2.5 bg-white rounded-lg border border-emerald-100 p-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <span className="text-base">{(unlockedOwner.name || 'O').charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{unlockedOwner.name || 'Property Owner'}</p>
                          <p className="text-[9px] text-gray-500">Owner / Landlord</p>
                        </div>
                      </div>
                      {unlockedOwner.phone && (
                        <a
                          href={`tel:${unlockedOwner.phone}`}
                          className="flex items-center gap-2 bg-white rounded-lg border border-emerald-100 p-2.5 hover:bg-emerald-50 transition-colors group"
                        >
                          <PhoneCall size={14} className="text-emerald-600 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900 text-xs group-hover:text-emerald-700">{unlockedOwner.phone}</p>
                            <p className="text-[9px] text-gray-500">Tap to Call</p>
                          </div>
                        </a>
                      )}
                      {(unlockedOwner.whatsapp || unlockedOwner.phone) && (
                        <a
                          href={`https://wa.me/${(unlockedOwner.whatsapp || unlockedOwner.phone).replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-white rounded-lg border border-green-200 p-2.5 hover:bg-green-50 transition-colors group"
                        >
                          <span className="text-green-600 text-base shrink-0">💬</span>
                          <div>
                            <p className="font-bold text-slate-900 text-xs group-hover:text-green-700">WhatsApp</p>
                            <p className="text-[9px] text-gray-500">Message Owner</p>
                          </div>
                        </a>
                      )}
                      {unlockedOwner.email && (
                        <a
                          href={`mailto:${unlockedOwner.email}`}
                          className="flex items-center gap-2 bg-white rounded-lg border border-blue-100 p-2.5 hover:bg-blue-50 transition-colors group"
                        >
                          <Mail size={14} className="text-blue-500 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900 text-xs group-hover:text-blue-600 truncate max-w-[100px]">{unlockedOwner.email}</p>
                            <p className="text-[9px] text-gray-500">Send Email</p>
                          </div>
                        </a>
                      )}
                    </div>
                    {unlockedOwner.society_name && (
                      <p className="text-[9px] text-emerald-600 mt-2 flex items-center gap-1">
                        <Building size={10} />
                        <span>{unlockedOwner.society_name}</span>
                        {unlockedOwner.monthly_rent && <span className="ml-2 font-bold">₹{Number(unlockedOwner.monthly_rent).toLocaleString('en-IN')}/mo</span>}
                      </p>
                    )}
                  </div>
                </div>
              )}

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
                  <CheckCircle2 size={13} />
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

          {/* TAB: SHORTLISTED & SAVED PROPERTIES */}
          {activeTab === 'shortlisted' && (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <h2 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                      <Bookmark size={15} className="text-orange-500 fill-orange-500" />
                      <span>My Shortlisted & Saved Rental Homes</span>
                    </h2>
                    <p className="text-[10px] text-gray-500">Properties you bookmarked or contacted owners for</p>
                  </div>
                  <button
                    onClick={() => navigate('/properties?transaction=rent&tab=rent')}
                    className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Explore More Rentals</span>
                  </button>
                </div>

                {shortlistedList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {shortlistedList.map((p) => (
                      <div key={p.id} className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div className="relative h-36 bg-gray-900 overflow-hidden group">
                          <img
                            src={getImageUrl(p.cover_image || (p.photos && p.photos[0]) || '/property.png')}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => { e.currentTarget.src = '/property.png'; }}
                          />
                          <div className="absolute top-2 left-2 bg-[#0b3856]/90 text-amber-300 text-[9px] font-black px-2 py-0.5 rounded shadow">
                            RENT-{String(p.id).padStart(4, '0')}
                          </div>
                          <button
                            onClick={() => {
                              removeTenantShortlist(p.id);
                              setShortlistedList(getTenantShortlist());
                              toast.info('Removed from shortlist');
                            }}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/80 hover:bg-white text-gray-700 flex items-center justify-center shadow hover:scale-110 transition cursor-pointer"
                            title="Remove from shortlist"
                          >
                            <X size={12} className="text-rose-600" />
                          </button>
                          <div className="absolute bottom-2 left-2 text-white font-black text-xs drop-shadow">
                            ₹{p.monthly_rent?.toLocaleString('en-IN')} / mo
                          </div>
                        </div>

                        <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{p.title}</h4>
                            <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin size={10} className="text-orange-500 shrink-0" />
                              <span className="truncate">{p.location}, {p.city}</span>
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-[9.5px] text-slate-600 font-medium">
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded">{p.unit_type || '2 BHK'}</span>
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded">{p.carpet_area} sq ft</span>
                              <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">0% Brokerage</span>
                            </div>
                          </div>

                          {(p.owner_phone || p.owner_whatsapp || p.owner_email) && (
                            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] gap-2">
                              <div className="truncate">
                                <span className="text-[8.5px] text-gray-400 block font-semibold">Owner / Landlord</span>
                                <span className="font-bold text-slate-800 truncate block text-[11px]">{p.owner_name || 'Verified Owner'}</span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {p.owner_phone && (
                                  <a
                                    href={`tel:${p.owner_phone}`}
                                    className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[10px] flex items-center gap-1 transition"
                                    title={`Call ${p.owner_phone}`}
                                  >
                                    <Phone size={11} />
                                    <span className="hidden sm:inline">Call</span>
                                  </a>
                                )}
                                {(p.owner_whatsapp || p.owner_phone) && (
                                  <a
                                    href={`https://wa.me/${String(p.owner_whatsapp || p.owner_phone).replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg bg-green-100 hover:bg-green-200 text-green-900 font-bold text-[10px] flex items-center gap-1 transition"
                                    title="WhatsApp Owner"
                                  >
                                    <span>💬</span>
                                  </a>
                                )}
                                {p.owner_email && (
                                  <a
                                    href={`mailto:${p.owner_email}`}
                                    className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-[10px] flex items-center gap-1 transition"
                                    title={`Email ${p.owner_email}`}
                                  >
                                    <Mail size={11} />
                                  </a>
                                )}
                              </div>
                            </div>
                          )}

                          <button
                            onClick={() => navigate(`/rentals/${p.slug || p.id}`)}
                            className="w-full mt-1 py-1.5 rounded-lg bg-[#0b3856] hover:bg-[#072438] text-white text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition"
                          >
                            <span>View Property</span>
                            <ExternalLink size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl space-y-2">
                    <Bookmark size={28} className="mx-auto text-gray-300" />
                    <p className="text-xs font-semibold text-gray-600">No shortlisted properties yet</p>
                    <p className="text-[10px] text-gray-400 max-w-sm mx-auto">
                      Explore rental properties and click the bookmark or contact owner button to save them to your account.
                    </p>
                    <button
                      onClick={() => navigate('/properties?transaction=rent&tab=rent')}
                      className="mt-2 px-3 py-1.5 rounded-lg bg-orange-500 text-white font-bold text-[10px] hover:bg-orange-600 cursor-pointer"
                    >
                      Browse Rental Listings
                    </button>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-[11px]">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-gray-400 font-semibold block text-[9px]">Full Name</span>
                    <span className="font-bold text-slate-900 text-xs mt-0.5 block">{tenant.name}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-orange-50/60 border border-orange-200 flex items-center justify-between">
                    <div>
                      <span className="text-orange-600 font-bold block text-[9px] uppercase tracking-wide">Login Username</span>
                      <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block">@{derivedUsername}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUsername}
                      className="p-1.5 rounded-md bg-white border border-orange-200 hover:bg-orange-100 text-orange-700 transition-colors shadow-2xs cursor-pointer"
                      title="Copy Username"
                    >
                      {copiedUsername ? <CopyCheck size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-gray-400 font-semibold block text-[9px]">Phone Number</span>
                    <span className="font-bold text-slate-900 text-xs mt-0.5 block">{tenant.phone}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-gray-400 font-semibold block text-[9px]">Email Address</span>
                    <span className="font-bold text-slate-900 text-xs mt-0.5 block truncate">{tenant.email || 'N/A'}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 sm:col-span-2 lg:col-span-2">
                    <span className="text-gray-400 font-semibold block text-[9px]">Preferred Location</span>
                    <span className="font-bold text-slate-900 text-xs mt-0.5 block">{tenant.preferred_location || 'Flexible'}</span>
                  </div>
                </div>

                {/* Account Login Password Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <Key size={14} className="text-orange-500" />
                        <span>Account Login Password</span>
                      </h3>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Set or update your login password to access your tenant portal anytime using your username or email.
                      </p>
                    </div>
                  </div>

                  {/* Username Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-white border border-orange-200/80 shadow-2xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                        @
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold text-gray-500 block uppercase tracking-wider">Your Portal Login Username</span>
                        <span className="font-mono font-bold text-xs text-orange-600 truncate block">@{derivedUsername}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUsername}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-[10px] border border-orange-200 transition-colors cursor-pointer"
                    >
                      {copiedUsername ? <CopyCheck size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      <span>{copiedUsername ? 'Copied!' : 'Copy Username'}</span>
                    </button>
                  </div>

                  <form onSubmit={handleUpdatePassword} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-gray-600 block mb-1">New Password</label>
                        <div className="relative">
                          <input
                            type={showPass ? 'text' : 'password'}
                            required
                            minLength={6}
                            placeholder="Min 6 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-2.5 py-1.5 pr-8 bg-white border border-gray-300 rounded-lg text-xs font-medium outline-none focus:ring-1 focus:ring-orange-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass(!showPass)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            <Eye size={13} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-gray-600 block mb-1">Confirm Password</label>
                        <input
                          type={showPass ? 'text' : 'password'}
                          required
                          minLength={6}
                          placeholder="Re-enter password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium outline-none focus:ring-1 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={updatingPass || !newPassword}
                        className="px-4 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {updatingPass ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <Check size={12} />
                            <span>Set / Update Password</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
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

      {/* Mandatory Automatic Preference Setup Modal */}
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
          }}
        />
      )}
    </div>
  );
}
