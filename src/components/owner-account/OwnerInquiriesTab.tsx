import React, { useState, useMemo, useEffect } from 'react';
import {
  MessageSquare, Search, Filter, Phone, Mail, User,
  Calendar, CheckCircle2, Clock, Copy, Shield, Building2,
  MapPin, PhoneCall, ExternalLink, CalendarDays,
  Flame, HeartHandshake, CheckCheck, Bookmark, Trash2, CheckSquare, Square,
  Check, X, Loader2, Briefcase, IndianRupee, Utensils, Dog,
  Eye
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { toast } from 'react-toastify';
import { tenantAPI } from '@/lib/tenantAPI';
import { tenantBookingAPI } from '@/lib/tenantBookingAPI';
import { TenantOwnerInterest } from '../tenant-account/types';

interface OwnerInquiriesTabProps {
  inquiries: any[];
  ownerName?: string;
  ownerId?: number | string;
  onRefresh?: () => void;
}

export const OwnerInquiriesTab: React.FC<OwnerInquiriesTabProps> = ({
  inquiries: initialInquiries,
  ownerName = 'Owner',
  ownerId,
  onRefresh,
}) => {
  const [inquiriesList, setInquiriesList] = useState<any[]>(initialInquiries || []);
  const [interestsList, setInterestsList] = useState<TenantOwnerInterest[]>([]);
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [loadingInterests, setLoadingInterests] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState<boolean>(false);
  const [selectedTenantForProfile, setSelectedTenantForProfile] = useState<any>(null);
  const [fetchingFullTenant, setFetchingFullTenant] = useState<boolean>(false);

  const handleOpenProfile = async (rawTenant: any) => {
    const targetId = rawTenant.tenant_id || rawTenant.id;
    setSelectedTenantForProfile(rawTenant);
    if (targetId) {
      try {
        setFetchingFullTenant(true);
        const res = await tenantAPI.getById(targetId);
        const full = res?.data || res?.tenant || res;
        if (full && typeof full === 'object') {
          setSelectedTenantForProfile((prev: any) => ({ ...prev, ...full }));
        }
      } catch (e) {
        console.warn("Error fetching full tenant profile:", e);
      } finally {
        setFetchingFullTenant(false);
      }
    }
  };

  const computeInquiryMatchScore = (inq: any) => {
    let score = 45;
    const bhk = String(inq.preferred_bhk || inq.unit_type || '').toLowerCase();
    const propTitle = String(inq.society_name || inq.rental_property_title || inq.property_title || '').toLowerCase();

    if (bhk && propTitle) {
      if (propTitle.includes(bhk) || bhk.split(',').some((b: string) => propTitle.includes(b.trim()))) {
        score += 25;
      } else {
        score += 15;
      }
    } else {
      score += 15;
    }

    const tType = String(inq.tenant_type || '').toLowerCase();
    if (tType.includes('family') || tType.includes('working') || tType.includes('professional')) {
      score += 20;
    } else {
      score += 10;
    }

    if (inq.notes || inq.tenant_phone || inq.phone) score += 10;

    return Math.min(98, Math.max(68, score));
  };

  const handleOwnerExpressInterest = async (inq: any) => {
    const tenantId = inq.tenant_id || inq.id;
    const propId = inq.rental_property_id || inq.property_id || inq.id;
    if (!tenantId || !propId) {
      toast.error("Tenant or property reference missing");
      return;
    }
    const matchPct = computeInquiryMatchScore(inq);
    setActionLoadingId(inq.id || tenantId);
    try {
      const res = await tenantAPI.sendInterest({
        tenant_id: tenantId,
        rental_property_id: propId,
        owner_id: ownerId,
        sender_type: 'owner',
        message: `Hi! Owner ${ownerName || ''} reviewed your profile (${matchPct}% match score) and expressed interest in renting their property to you!`,
      });
      if (res?.success) {
        toast.success(res.message || "Interest request sent to tenant!");
        await fetchInterests();
      } else {
        toast.error(res?.message || "Failed to send interest to tenant");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send interest to tenant");
    } finally {
      setActionLoadingId(null);
    }
  };

  const fetchInterests = async () => {
    if (!ownerId) return;
    try {
      setLoadingInterests(true);
      const res = await tenantAPI.getOwnerInterests(ownerId);
      if (res?.success && Array.isArray(res.data)) {
        setInterestsList(res.data);
      }
    } catch (e) {
      console.warn("Could not load owner interests:", e);
    } finally {
      setLoadingInterests(false);
    }
  };

  const fetchBookings = async () => {
    if (!ownerId) return;
    try {
      setLoadingBookings(true);
      const res = await tenantBookingAPI.getByOwnerId(ownerId);
      if (res?.success && Array.isArray(res.data)) {
        setBookingsList(res.data);
      }
    } catch (e) {
      console.warn("Could not load owner bookings:", e);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchInterests();
    fetchBookings();
  }, [ownerId]);

  const handleVerifyPayment = async (bookingId: string | number) => {
    setActionLoadingId(Number(bookingId) || 999999);
    try {
      const res = await tenantBookingAPI.verifyPayment(bookingId, { verified_by_user_id: ownerId });
      if (res?.success) {
        toast.success("Payment verified! Booking status updated to KYC Pending.");
        await fetchBookings();
        onRefresh?.();
      } else {
        toast.error(res?.message || "Failed to verify payment");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to verify payment");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleFlagIssue = async (bookingId: string | number) => {
    const note = window.prompt("Enter payment issue details (e.g., Transaction reference not received):");
    if (note === null) return;
    setActionLoadingId(Number(bookingId) || 999999);
    try {
      const res = await tenantBookingAPI.flagIssue(bookingId, { notes: note });
      if (res?.success) {
        toast.info("Payment issue flagged.");
        await fetchBookings();
      } else {
        toast.error(res?.message || "Failed to flag issue");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to flag issue");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleVerifyKyc = async (bookingId: string | number) => {
    setActionLoadingId(Number(bookingId) || 999999);
    try {
      const res = await tenantBookingAPI.verifyKyc(bookingId);
      if (res?.success) {
        toast.success("KYC approved! Ready for agreement and move-in.");
        await fetchBookings();
        onRefresh?.();
      } else {
        toast.error(res?.message || "Failed to approve KYC");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to approve KYC");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectKyc = async (bookingId: string | number) => {
    const reason = window.prompt("Enter KYC rejection reason (e.g. Blurred document image):");
    if (reason === null) return;
    setActionLoadingId(Number(bookingId) || 999999);
    try {
      const res = await tenantBookingAPI.rejectKyc(bookingId, { reason });
      if (res?.success) {
        toast.warn("KYC document rejected.");
        await fetchBookings();
      } else {
        toast.error(res?.message || "Failed to reject KYC");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reject KYC");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmCandidate = async (interestId: number) => {
    if (!ownerId) return;
    setActionLoadingId(interestId);
    try {
      const res = await tenantAPI.ownerConfirmTenant(interestId, ownerId);
      if (res?.success) {
        toast.success(res.message || "Candidate confirmed! Other applicants moved to reserve queue.");
        await fetchInterests();
        onRefresh?.();
      } else {
        toast.error(res?.message || "Failed to confirm candidate");
      }
    } catch (err: any) {
      console.error("Error confirming candidate:", err);
      toast.error(err?.response?.data?.message || "Failed to confirm candidate");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectCandidate = async (interestId: number) => {
    if (!window.confirm("Reject this candidate application?")) return;
    setActionLoadingId(interestId);
    try {
      const res = await tenantAPI.ownerRejectTenant(interestId);
      if (res?.success) {
        toast.info(res.message || "Candidate rejected.");
        await fetchInterests();
        onRefresh?.();
      } else {
        toast.error(res?.message || "Failed to reject candidate");
      }
    } catch (err: any) {
      console.error("Error rejecting candidate:", err);
      toast.error(err?.response?.data?.message || "Failed to reject candidate");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Sync if prop updates
  React.useEffect(() => {
    setInquiriesList(initialInquiries || []);
  }, [initialInquiries]);

  // Distinct properties list for property-wise filtering
  const distinctProperties = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    inquiriesList.forEach((inq) => {
      const pId = String(inq.rental_property_id || inq.property_id || inq.id || 'other');
      const pName = inq.society_name || inq.rental_property_title || inq.property_title || `Property #${pId}`;
      if (!map.has(pId)) {
        map.set(pId, { id: pId, name: pName, count: 0 });
      }
      map.get(pId)!.count += 1;
    });
    return Array.from(map.values());
  }, [inquiriesList]);

  const filteredInquiries = useMemo(() => {
    return inquiriesList.filter((inq) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        (inq.tenant_name || '').toLowerCase().includes(q) ||
        (inq.tenant_phone || '').includes(q) ||
        (inq.preferred_bhk || '').toLowerCase().includes(q) ||
        (inq.notes || '').toLowerCase().includes(q) ||
        (inq.society_name || '').toLowerCase().includes(q) ||
        (inq.rental_property_title || '').toLowerCase().includes(q);

      const tType = String(inq.tenant_type || '').toLowerCase();
      const matchType =
        typeFilter === 'all' ||
        (typeFilter === 'family' && tType.includes('family')) ||
        (typeFilter === 'bachelor' && tType.includes('bachelor')) ||
        (typeFilter === 'working' && (tType.includes('working') || tType.includes('professional')));

      const pId = String(inq.rental_property_id || inq.property_id || inq.id || 'other');
      const matchProp = selectedPropertyFilter === 'all' || pId === selectedPropertyFilter;

      return matchSearch && matchType && matchProp;
    });
  }, [inquiriesList, searchTerm, typeFilter, selectedPropertyFilter]);

  const getInqKey = (inq: any, idx: number) => {
    return String(inq.id || `${inq.tenant_id}_${inq.rental_property_id || inq.property_id || idx}`);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredInquiries.length) {
      setSelectedIds(new Set());
    } else {
      const newSet = new Set<string>();
      filteredInquiries.forEach((inq, idx) => newSet.add(getInqKey(inq, idx)));
      setSelectedIds(newSet);
    }
  };

  const handleToggleSelect = (key: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleDeleteSingle = async (inq: any, idx: number) => {
    const key = getInqKey(inq, idx);
    if (!window.confirm(`Are you sure you want to remove inquiry from ${inq.tenant_name || 'this tenant'}?`)) return;

    setDeletingId(key);
    try {
      setInquiriesList((prev) => prev.filter((item, i) => getInqKey(item, i) !== key));
      toast.success('Inquiry removed');
      onRefresh?.();
    } catch (e) {
      toast.error('Failed to remove inquiry');
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected inquiries?`)) return;

    setBulkDeleting(true);
    try {
      setInquiriesList((prev) => prev.filter((item, i) => !selectedIds.has(getInqKey(item, i))));
      setSelectedIds(new Set());
      toast.success('Selected inquiries deleted');
      onRefresh?.();
    } catch (e) {
      toast.error('Failed to bulk delete inquiries');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleCopyPhone = (phone: string) => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    toast.success(`Copied phone: ${phone}`);
  };

  const formatPhoneNumber = (phone: string | number | undefined) => {
    if (!phone) return 'Phone Verified';
    const str = String(phone).replace(/\D/g, '');
    if (str.length === 10) {
      return `+91 ${str.slice(0, 5)} ${str.slice(5)}`;
    }
    return str ? `+91 ${str}` : 'Phone Verified';
  };

  return (
    <div className="space-y-3.5 animate-in fade-in duration-200">

      {/* 🌟 Compact Header Banner */}
      <div className="bg-gradient-to-r from-[#0b3856] via-[#10344d] to-[#184d6e] p-3.5 sm:p-4 rounded-xl text-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-500/20 border border-orange-400/30 flex items-center justify-center text-orange-400 shrink-0 shadow-inner">
            <MessageSquare size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                Prospective Tenant Inquiries
              </h2>
              <span className="px-2 py-0.5 rounded bg-orange-500 text-white text-[9px] font-black uppercase tracking-wider">
                Direct Leads
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Tenants who unlocked owner details, contacted via WhatsApp, or enquired on your rental listings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <div className="px-3 py-1 rounded-lg bg-white/10 border border-white/15 backdrop-blur-xs text-right">
            <span className="text-[9px] text-slate-300 block font-medium uppercase tracking-wider">Total Leads</span>
            <span className="text-xs sm:text-sm font-black text-amber-300">{inquiriesList.length} Enquiries</span>
          </div>
        </div>
      </div>

      {/* 🏢 Property-Wise Filter Bar */}
      {distinctProperties.length > 1 && (
        <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200 flex items-center gap-1.5 overflow-x-auto shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 pl-1">
            Filter by Property:
          </span>
          <button
            onClick={() => setSelectedPropertyFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${selectedPropertyFilter === 'all'
              ? 'bg-[#0b3856] text-white shadow-2xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
          >
            All Properties ({inquiriesList.length})
          </button>
          {distinctProperties.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPropertyFilter(p.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${selectedPropertyFilter === p.id
                ? 'bg-orange-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              <Building2 size={11} />
              <span>{p.name}</span>
              <span className="opacity-80 font-mono text-[9.5px]">({p.count})</span>
            </button>
          ))}
        </div>
      )}

      {/* 💳 Property Reservations & Offline Payment Verification */}
      {bookingsList.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <IndianRupee size={14} className="text-emerald-600" />
              <span>Property Reservations & Token Payment Claims ({bookingsList.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bookingsList.map((b) => {
              const isClaimed = b.payment_status === 'CLAIMED';
              const isVerified = b.payment_status === 'VERIFIED';
              const isPending = b.payment_status === 'PENDING';
              const isIssue = b.payment_status === 'ISSUE';

              const isKycPending = b.booking_status === 'KYC_PENDING';
              const isKycApproved = b.booking_status === 'KYC_APPROVED';
              const isKycRejected = b.booking_status === 'KYC_REJECTED';

              const tenantName = b.tenant_name || `Tenant #${b.tenant_id}`;

              return (
                <div
                  key={`owner-bkg-${b.id || b.booking_id}`}
                  className={`rounded-2xl border p-4 space-y-3 shadow-xs transition-all ${
                    isClaimed
                      ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-300/30'
                      : isVerified
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : isIssue
                      ? 'bg-rose-50/60 border-rose-300'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-900">{tenantName}</span>
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          {b.booking_id}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Token: <strong className="text-slate-800">₹{Number(b.token_amount || 0).toLocaleString('en-IN')}</strong> • Move-in: {b.move_in_date || 'N/A'}
                      </p>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {isClaimed && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-xs">
                          🟡 Payment Claimed
                        </span>
                      )}
                      {isVerified && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white flex items-center gap-1">
                          <CheckCircle2 size={11} /> Verified
                        </span>
                      )}
                      {isPending && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          Pending Payment
                        </span>
                      )}
                      {isIssue && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                          ⚠️ Payment Issue
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Payment Ref Details */}
                  {b.payment_reference && (
                    <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/80 text-[11px] space-y-1">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-slate-500 font-bold uppercase text-[9.5px]">Reference / UTR</span>
                        <strong className="text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">{b.payment_reference}</strong>
                      </div>
                      {b.payment_notes && (
                        <p className="text-slate-600 italic text-[10.5px]">"{b.payment_notes}"</p>
                      )}
                    </div>
                  )}

                  {/* 📜 Mini 5-Step Lifecycle Progress Tracker for Owner */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[10px] space-y-1.5">
                    <span className="font-extrabold uppercase tracking-wider text-slate-500 text-[9px] block">Tenancy Lifecycle Progress</span>
                    <div className="grid grid-cols-5 gap-1 text-center font-bold">
                      <div className="p-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        1. Select ✓
                      </div>
                      <div className={`p-1 rounded border ${isClaimed || isVerified ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'}`}>
                        2. Claim {isClaimed || isVerified ? '✓' : '⏳'}
                      </div>
                      <div className={`p-1 rounded border ${isVerified ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : isClaimed ? 'bg-amber-500 text-white border-amber-600 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                        3. Verify {isVerified ? '✓' : isClaimed ? '👈' : '⏳'}
                      </div>
                      <div className={`p-1 rounded border ${isKycApproved ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : isKycPending ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-400'}`}>
                        4. KYC {isKycApproved ? '✓' : '⏳'}
                      </div>
                      <div className={`p-1 rounded border ${b.booking_status === 'BOOKED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
                        5. Lease
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons for Owner */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 flex-wrap gap-2">
                    {/* Payment verification actions */}
                    {isClaimed && (
                      <div className="flex items-center gap-1.5 w-full">
                        <button
                          type="button"
                          disabled={actionLoadingId === b.id}
                          onClick={() => handleVerifyPayment(b.booking_id)}
                          className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          {actionLoadingId === b.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                          <span>Verify Payment</span>
                        </button>
                        <button
                          type="button"
                          disabled={actionLoadingId === b.id}
                          onClick={() => handleFlagIssue(b.booking_id)}
                          className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                        >
                          Issue
                        </button>
                      </div>
                    )}

                    {/* KYC Actions once payment verified */}
                    {isVerified && isKycPending && (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                          KYC Review Required
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleVerifyKyc(b.booking_id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10.5px] font-bold hover:bg-emerald-700 cursor-pointer"
                          >
                            Approve KYC
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectKyc(b.booking_id)}
                            className="px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10.5px] font-semibold hover:bg-rose-100 hover:text-rose-700 cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    )}

                    {isKycApproved && (
                      <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 size={11} /> KYC Approved — Move to Agreement
                      </span>
                    )}

                    {isKycRejected && (
                      <span className="text-[10.5px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                        ✕ KYC Rejected
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 🌟 0. Live Tenant Interest Requests & Candidate Selection (Single-Tenant Confirmation Rule) */}
      {interestsList.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <HeartHandshake size={14} className="text-orange-500" />
              <span>Interested Tenant Applicants & Selection ({interestsList.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {interestsList.map((item) => {
              const isConfirmed = item.status === 'OWNER_CONFIRMED';
              const isSelectedOthers = item.status === 'PROPERTY_SELECTED';
              const isAccepted = item.status === 'TENANT_ACCEPTED' || item.status === 'BOOKING_PENDING';
              const isRejected = item.status === 'OWNER_REJECTED' || item.status === 'TENANT_DECLINED';

              const phone = item.tenant_phone || '';
              const tenantName = item.tenant_name || 'Tenant Applicant';
              const propTitle = item.society_name ? `${item.unit_type || '2 BHK'} at ${item.society_name}` : `Rental Property #${item.rental_property_id}`;

              return (
                <div
                  key={`owner-interest-${item.id}`}
                  className={`rounded-2xl border p-3.5 sm:p-4 transition-all flex flex-col justify-between space-y-3 ${isConfirmed
                    ? 'bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white border-emerald-400 shadow-md ring-2 ring-emerald-400/20'
                    : isSelectedOthers
                      ? 'bg-amber-50/40 border-amber-200'
                      : isAccepted
                        ? 'bg-indigo-50/40 border-indigo-200'
                        : isRejected
                          ? 'bg-rose-50/40 border-rose-200 opacity-75'
                          : 'bg-white border-slate-200 shadow-2xs hover:shadow-sm'
                    }`}
                >
                  <div className="space-y-2.5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-inner">
                          {tenantName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                              {tenantName}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                              {item.match_score}% Match
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {item.occupation_type || 'Salaried'} {item.company_name ? `• ${item.company_name}` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Status Tag */}
                      <div className="shrink-0">
                        {isConfirmed ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                            <CheckCircle2 size={12} /> Confirmed Candidate
                          </span>
                        ) : isSelectedOthers ? (
                          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            In Reserve Queue
                          </span>
                        ) : isAccepted ? (
                          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
                            Tenant Accepted!
                          </span>
                        ) : isRejected ? (
                          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-medium bg-rose-100 text-rose-800 border border-rose-200">
                            Rejected
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            Pending Review
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Property Reference */}
                    <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 text-[11px] truncate">
                        {propTitle}
                      </span>
                      <span className="font-mono text-[9px] font-extrabold px-1.5 py-0.5 bg-slate-900 text-white rounded shrink-0">
                        RENT-{item.rental_property_id}
                      </span>
                    </div>

                    {/* Profile Snapshot Grid (Privacy Preserved - No KYC) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100 text-[10.5px]">
                      <div>
                        <span className="text-[8.5px] text-gray-400 font-semibold uppercase block">Tenant Type</span>
                        <span className="font-bold text-slate-800">{item.tenant_type || 'Family'}</span>
                      </div>
                      <div>
                        <span className="text-[8.5px] text-gray-400 font-semibold uppercase block">Income</span>
                        <span className="font-bold text-slate-800">
                          {item.monthly_income ? `₹${Number(item.monthly_income).toLocaleString('en-IN')}` : '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[8.5px] text-gray-400 font-semibold uppercase block">Food</span>
                        <span className="font-bold text-slate-800">{item.food_preference || 'Any'}</span>
                      </div>
                      <div>
                        <span className="text-[8.5px] text-gray-400 font-semibold uppercase block">Pets</span>
                        <span className="font-bold text-slate-800">{item.has_pets || 'No'}</span>
                      </div>
                    </div>

                    {item.message && (
                      <p className="text-[10px] text-slate-600 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100/80">
                        "{item.message}"
                      </p>
                    )}
                  </div>

                  {/* Confirmation / Decision Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {phone && (
                        <>
                          <a
                            href={`https://wa.me/91${String(phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${tenantName}! I received your application for my property at ${propTitle}. Match score is ${item.match_score}%. Let's discuss!`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-[10px] font-extrabold flex items-center gap-1 shadow-2xs"
                          >
                            <SiWhatsapp size={11} />
                            <span>WhatsApp</span>
                          </a>
                          <a
                            href={`tel:${phone}`}
                            className="px-2.5 py-1 rounded-lg bg-[#0b3856] hover:bg-[#072438] text-white text-[10px] font-extrabold flex items-center gap-1 shadow-2xs"
                          >
                            <PhoneCall size={11} />
                            <span>Call</span>
                          </a>
                        </>
                      )}
                    </div>

                    {/* Confirm Candidate Button */}
                    <div className="flex items-center gap-1.5">
                      {!isConfirmed && !isAccepted && (
                        <>
                          <button
                            type="button"
                            disabled={actionLoadingId === item.id}
                            onClick={() => handleConfirmCandidate(item.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-bold flex items-center gap-1 shadow-xs transition cursor-pointer disabled:opacity-50"
                            title="Confirm this candidate and move other property applicants to reserve queue"
                          >
                            {actionLoadingId === item.id ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                            <span>Confirm Candidate</span>
                          </button>
                          <button
                            type="button"
                            disabled={actionLoadingId === item.id}
                            onClick={() => handleRejectCandidate(item.id)}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 text-[10.5px] font-semibold transition cursor-pointer disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {isConfirmed && (
                        <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-md">
                          ✓ Confirmed & Waiting Acceptance
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 🔍 Search & Filter Bar + Bulk Actions */}
      <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="relative flex-1 w-full max-w-md">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search inquiries by name, phone, BHK, property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-slate-50/70 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto justify-between sm:justify-end">
          {/* Tenant Type Filters */}
          <div className="flex items-center gap-1">
            {[
              { id: 'all', label: `All (${inquiriesList.length})` },
              { id: 'family', label: 'Family' },
              { id: 'working', label: 'Working Pro' },
              { id: 'bachelor', label: 'Bachelor' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${typeFilter === f.id
                  ? 'bg-[#0b3856] text-white shadow-2xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Bulk Select & Delete Controls */}
          {filteredInquiries.length > 0 && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-gray-200">
              <button
                onClick={handleSelectAll}
                className="p-1 rounded text-slate-600 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                title={selectedIds.size === filteredInquiries.length ? 'Deselect All' : 'Select All'}
              >
                {selectedIds.size === filteredInquiries.length ? (
                  <CheckSquare size={14} className="text-blue-600" />
                ) : (
                  <Square size={14} />
                )}
                <span className="hidden sm:inline">Select All</span>
              </button>

              {selectedIds.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={11} />
                  <span>Delete ({selectedIds.size})</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 📋 Inquiries Grid - Modern & Compact */}
      {filteredInquiries.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center shadow-2xs">
          <MessageSquare className="w-10 h-10 mx-auto mb-2.5 text-gray-300 opacity-60" />
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm">No tenant inquiries found</h3>
          <p className="text-gray-400 text-[11px] mt-1 max-w-sm mx-auto">
            {searchTerm || selectedPropertyFilter !== 'all'
              ? 'No inquiries match your current filters.'
              : 'Prospective tenants who contact or view your properties will appear here automatically.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredInquiries.map((inq: any, idx: number) => {
            const inqKey = getInqKey(inq, idx);
            const isSelected = selectedIds.has(inqKey);

            const dateStr = inq.created_at
              ? new Date(inq.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
              : 'Recent';

            const tenantName = inq.tenant_name || inq.name || 'Prospective Tenant';
            const propName = inq.society_name || inq.rental_property_title || inq.property_title || inq.title || `Property Listing`;
            const propId = inq.rental_property_id || inq.property_id || inq.id;
            const bhk = inq.preferred_bhk || inq.unit_type || '2 BHK';
            const moveIn = inq.move_in_date ? (String(inq.move_in_date).includes('-') ? new Date(inq.move_in_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : inq.move_in_date) : 'Immediately';
            const phone = inq.tenant_phone || inq.phone || '';

            return (
              <div
                key={inqKey}
                className={`bg-white rounded-xl border transition-all p-3 sm:p-3.5 flex flex-col justify-between space-y-2.5 relative ${isSelected
                  ? 'border-blue-400 bg-blue-50/20 ring-1 ring-blue-300'
                  : 'border-slate-200 hover:border-orange-400/80 hover:shadow-sm'
                  }`}
              >
                <div className="space-y-2">
                  {/* Card Header: Checkbox + Avatar + Name + Badges + Trash */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Checkbox for bulk delete */}
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(inqKey)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer shrink-0"
                      >
                        {isSelected ? (
                          <CheckSquare size={15} className="text-blue-600" />
                        ) : (
                          <Square size={15} />
                        )}
                      </button>

                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0b3856] to-[#1e4e6d] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {tenantName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-extrabold text-xs sm:text-[13px] text-slate-900 truncate">
                            {tenantName}
                          </h4>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8.5px] font-black uppercase tracking-wider flex items-center gap-0.5">
                            <CheckCheck size={9} /> Verified Lead
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-0.5">
                            <Flame size={9} className="text-blue-600" /> {computeInquiryMatchScore(inq)}% Match
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.2">
                          Inquired on <span className="font-semibold text-slate-700">{dateStr}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-800 border border-orange-200 text-[9.5px] font-bold">
                        {inq.tenant_type || 'Family'}
                      </span>
                      {/* Single Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteSingle(inq, idx)}
                        disabled={deletingId === inqKey}
                        className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete inquiry"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Inquired Property Strip - Compact */}
                  <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                        <Building2 size={11} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block leading-none">
                          Inquired Property
                        </span>
                        <span className="font-bold text-[11px] text-slate-900 truncate block leading-tight">
                          {propName}
                        </span>
                      </div>
                    </div>
                    {propId && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white font-mono font-bold text-[8.5px] shrink-0">
                        RENT-{propId}
                      </span>
                    )}
                  </div>

                  {/* 2-Column Info Strip */}
                  <div className="grid grid-cols-2 gap-2 px-2.5 py-1.5 rounded-lg bg-amber-50/40 border border-amber-100/70 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-500 font-medium block">BHK Preference</span>
                      <span className="font-extrabold text-slate-900 text-[11px]">{bhk}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 font-medium block">Expected Move-in</span>
                      <span className="font-extrabold text-slate-900 text-[11px]">{moveIn}</span>
                    </div>
                  </div>

                  {/* Notes / Remark */}
                  {inq.notes && (
                    <div className="text-[10px] text-slate-600 bg-slate-50 border border-slate-200/60 px-2.5 py-1.5 rounded-lg line-clamp-2">
                      <span className="font-bold text-slate-800">Note: </span>
                      <span>{inq.notes}</span>
                    </div>
                  )}
                </div>

                {/* Footer Action Bar */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-mono font-black text-xs text-slate-800 truncate">
                      {formatPhoneNumber(phone)}
                    </span>
                    {phone && (
                      <button
                        onClick={() => handleCopyPhone(phone)}
                        className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition cursor-pointer"
                        title="Copy Phone Number"
                      >
                        <Copy size={11} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={actionLoadingId === (inq.id || inq.tenant_id)}
                      onClick={() => handleOwnerExpressInterest(inq)}
                      className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-extrabold transition-all flex items-center gap-1 shadow-2xs cursor-pointer disabled:opacity-50"
                      title="Express owner interest & send request to tenant"
                    >
                      {actionLoadingId === (inq.id || inq.tenant_id) ? <Loader2 size={11} className="animate-spin" /> : <HeartHandshake size={11} />}
                      <span>Send Interest</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenProfile(inq)}
                      className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-[10.5px] font-extrabold transition-all flex items-center gap-1 cursor-pointer"
                      title="View complete tenant profile & preferences"
                    >
                      <Eye size={11} />
                      <span>View Profile</span>
                    </button>
                    {phone ? (
                      <>
                        <a
                          href={`https://wa.me/91${String(phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${tenantName}! I'm ${ownerName}. I received your inquiry for my rental property at ${propName}. When are you planning to visit?`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-[10.5px] font-extrabold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <SiWhatsapp size={11} />
                          <span>WhatsApp</span>
                        </a>
                        <a
                          href={`tel:${phone}`}
                          className="px-2.5 py-1 rounded-lg bg-[#0b3856] hover:bg-[#072438] text-white text-[10.5px] font-extrabold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <PhoneCall size={11} />
                          <span>Call</span>
                        </a>
                      </>
                    ) : (
                      <span className="text-[9.5px] text-gray-400 font-semibold italic">Verified Lead</span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 👤 Tenant Full Profile Modal for Owner */}
      {selectedTenantForProfile && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0b3856] via-[#10344d] to-[#184d6e] p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center text-orange-400 font-black text-base shrink-0 shadow-inner">
                  {(selectedTenantForProfile.tenant_name || selectedTenantForProfile.name || 'T').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-white">
                      {selectedTenantForProfile.tenant_name || selectedTenantForProfile.name || 'Tenant Profile'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider">
                      {selectedTenantForProfile.tenant_type || 'Family'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {selectedTenantForProfile.occupation_type || 'Salaried'} {selectedTenantForProfile.company_name ? `at ${selectedTenantForProfile.company_name}` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTenantForProfile(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              {fetchingFullTenant && (
                <div className="p-2 text-center text-orange-600 bg-orange-50 rounded-lg font-bold flex items-center justify-center gap-2 text-[11px]">
                  <Loader2 size={13} className="animate-spin" /> Fetching latest details from database...
                </div>
              )}

              {/* 1. Contact Information */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-500 block">📞 Contact & Verification</span>
                <div className="grid grid-cols-2 gap-2 text-slate-800 font-semibold">
                  <div><span className="text-gray-400 font-normal">Phone:</span> {selectedTenantForProfile.tenant_phone || selectedTenantForProfile.phone || '—'}</div>
                  <div><span className="text-gray-400 font-normal">Email:</span> {selectedTenantForProfile.tenant_email || selectedTenantForProfile.email || '—'}</div>
                  <div><span className="text-gray-400 font-normal">WhatsApp:</span> {selectedTenantForProfile.tenant_whatsapp || selectedTenantForProfile.whatsapp || selectedTenantForProfile.phone || '—'}</div>
                  <div><span className="text-gray-400 font-normal">Status:</span> <span className="text-emerald-700 font-bold">{selectedTenantForProfile.status || 'Active Search'}</span></div>
                </div>
              </div>

              {/* 2. Employment & Financial Snapshot */}
              <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 space-y-2">
                <span className="text-[9.5px] font-black uppercase tracking-wider text-blue-900 block flex items-center gap-1">
                  <Briefcase size={12} className="text-blue-600" /> Employment & Financial Profile
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase block">Occupation</span>
                    <span className="font-extrabold text-slate-900">{selectedTenantForProfile.occupation_type || 'Salaried'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase block">Company</span>
                    <span className="font-extrabold text-slate-900">{selectedTenantForProfile.company_name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase block">Designation</span>
                    <span className="font-extrabold text-slate-900">{selectedTenantForProfile.designation || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase block">Monthly Income</span>
                    <span className="font-extrabold text-emerald-700">
                      {selectedTenantForProfile.monthly_income ? `₹${Number(selectedTenantForProfile.monthly_income).toLocaleString('en-IN')}/mo` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase block">Office Location</span>
                    <span className="font-extrabold text-slate-900">{selectedTenantForProfile.office_location || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase block">Stay Duration</span>
                    <span className="font-extrabold text-slate-900">{selectedTenantForProfile.expected_stay_duration || '11 Months'}</span>
                  </div>
                </div>
              </div>

              {/* 3. Property Requirements & Budget */}
              <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100 space-y-2">
                <span className="text-[9.5px] font-black uppercase tracking-wider text-amber-900 block flex items-center gap-1">
                  <Building2 size={12} className="text-amber-600" /> Rental Requirements & Budget
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase block">BHK Preference</span>
                    <span className="font-extrabold text-slate-900">{selectedTenantForProfile.preferred_bhk || '2 BHK'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase block">Budget Range</span>
                    <span className="font-extrabold text-slate-900">
                      {selectedTenantForProfile.budget_min || selectedTenantForProfile.budget_max
                        ? `₹${Number(selectedTenantForProfile.budget_min || 0).toLocaleString('en-IN')} - ₹${Number(selectedTenantForProfile.budget_max || 0).toLocaleString('en-IN')}`
                        : 'Flexible'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase block">Move-in Date</span>
                    <span className="font-extrabold text-slate-900">
                      {selectedTenantForProfile.move_in_date
                        ? new Date(selectedTenantForProfile.move_in_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Immediately'}
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-3">
                    <span className="text-[9px] text-gray-500 uppercase block">Preferred Locations</span>
                    <span className="font-bold text-slate-900">{selectedTenantForProfile.preferred_location || 'Pune / PCMC'}</span>
                  </div>
                </div>
              </div>

              {/* 4. Lifestyle & Personal Preferences */}
              <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 space-y-2">
                <span className="text-[9.5px] font-black uppercase tracking-wider text-emerald-900 block flex items-center gap-1">
                  <Utensils size={12} className="text-emerald-600" /> Lifestyle & Personal Preferences
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase block">Food Habit</span>
                    <span className="font-bold text-slate-900">{selectedTenantForProfile.food_preference || 'Any'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase block">Has Pets?</span>
                    <span className="font-bold text-slate-900">{selectedTenantForProfile.has_pets || 'No'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase block">Smoking Habit</span>
                    <span className="font-bold text-slate-900">{selectedTenantForProfile.smoking_habits || 'No'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase block">Vehicle</span>
                    <span className="font-bold text-slate-900">{selectedTenantForProfile.vehicle_type || 'None'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedTenantForProfile(null)}
                className="px-4 py-1.5 rounded-lg bg-[#0b3856] text-white font-extrabold text-xs hover:bg-[#072438] transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerInquiriesTab;
