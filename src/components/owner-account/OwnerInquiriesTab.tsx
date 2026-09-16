import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  MessageSquare, Search, Filter, Phone, Mail, User,
  Calendar, CheckCircle2, Clock, Copy, Shield, Building2,
  MapPin, PhoneCall, ExternalLink, CalendarDays,
  Flame, HeartHandshake, CheckCheck, Bookmark, Trash2, CheckSquare, Square,
  Check, X, Loader2, Briefcase, IndianRupee, Utensils, Dog,
  Eye, FileCheck, Upload, FolderUp, FileText, Paperclip
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { toast } from 'react-toastify';
import { tenantAPI } from '@/lib/tenantAPI';
import { tenantBookingAPI } from '@/lib/tenantBookingAPI';
import { TenantOwnerInterest } from '../tenant-account/types';
import { getImageUrl } from '@/lib/helpers';

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
  const [viewingKycBooking, setViewingKycBooking] = useState<any | null>(null);
  const [uploadAgreementModalBooking, setUploadAgreementModalBooking] = useState<any | null>(null);
  const [agreementFile, setAgreementFile] = useState<File | null>(null);
  const [agreementCustomUrl, setAgreementCustomUrl] = useState<string>('/agreements/sample_rental_agreement.pdf');
  const [uploadingAgreement, setUploadingAgreement] = useState<boolean>(false);
  const agreementFileInputRef = useRef<HTMLInputElement>(null);
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const formatMoveInDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      if (dateStr.includes('T') || dateStr.includes('-')) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        }
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const [activateTenancyModalBooking, setActivateTenancyModalBooking] = useState<any | null>(null);
  const [activateRentDueDay, setActivateRentDueDay] = useState<number>(5);
  const [activateOwnerUpiId, setActivateOwnerUpiId] = useState<string>('');
  const [activateUpiConfirmed, setActivateUpiConfirmed] = useState<boolean>(true);

  const handleOpenActivateTenancyModal = (booking: any) => {
    setActivateTenancyModalBooking(booking);
    setActivateRentDueDay(5);
    setActivateOwnerUpiId(booking?.owner_upi_id || '');
    setActivateUpiConfirmed(true);
  };

  const handleFinalizeAgreement = async () => {
    if (!activateTenancyModalBooking) return;
    const bookingId = activateTenancyModalBooking?.booking_id || activateTenancyModalBooking?.id;
    if (!bookingId) return;

    if (!activateOwnerUpiId.trim() || !activateOwnerUpiId.includes('@')) {
      toast.error('Please enter a valid Owner UPI ID (e.g. name@oksbi, phone@paytm)');
      return;
    }
    if (!activateUpiConfirmed) {
      toast.error('Please confirm that this UPI ID belongs to you for receiving rent credits');
      return;
    }

    setActionLoadingId(bookingId as any);
    try {
      const res = await tenantBookingAPI.finalizeAgreement(bookingId, {
        rent_due_day: Number(activateRentDueDay),
        owner_upi_id: activateOwnerUpiId.trim(),
      });
      if (res?.success) {
        toast.success('🎉 Lease Agreement Finalized & Tenancy Activated with Rent Ledger!');
        setActivateTenancyModalBooking(null);
        await fetchBookings();
        onRefresh?.();
      } else {
        toast.error(res?.message || 'Failed to finalize agreement');
      }
    } catch (err: any) {
      console.error('Error finalizing agreement:', err);
      toast.error(err?.response?.data?.message || 'Failed to finalize agreement');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenAgreementUpload = (booking: any) => {
    setUploadAgreementModalBooking(booking);
    setAgreementFile(null);
    setAgreementCustomUrl(booking?.agreement_document || '/agreements/sample_rental_agreement.pdf');
  };

  const handleSubmitAgreementUpload = async () => {
    if (!uploadAgreementModalBooking) return;
    const bookingId = uploadAgreementModalBooking.booking_id || uploadAgreementModalBooking.id;
    setUploadingAgreement(true);
    try {
      let res;
      if (agreementFile) {
        const fd = new FormData();
        fd.append('agreement_file', agreementFile);
        if (uploadAgreementModalBooking.property_id) {
          fd.append('property_id', String(uploadAgreementModalBooking.property_id));
        }
        res = await tenantBookingAPI.uploadAgreement(bookingId, fd);
      } else {
        res = await tenantBookingAPI.uploadAgreement(bookingId, { agreement_document: agreementCustomUrl.trim() });
      }

      if (res?.success) {
        toast.success('📄 Rental Agreement PDF uploaded & sent to Tenant for E-Sign!');
        setUploadAgreementModalBooking(null);
        setAgreementFile(null);
        await fetchBookings();
        window.dispatchEvent(new Event('tenant_booking_updated'));
        onRefresh?.();
      } else {
        toast.error(res?.message || 'Failed to send agreement PDF');
      }
    } catch (err: any) {
      console.error('Error sending agreement:', err);
      toast.error(err?.response?.data?.message || 'Failed to send agreement PDF');
    } finally {
      setUploadingAgreement(false);
    }
  };
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

    const handleUpdate = () => {
      fetchInterests();
      fetchBookings();
    };

    window.addEventListener('tenant_booking_updated', handleUpdate);
    window.addEventListener('tenant_property_booked', handleUpdate);
    window.addEventListener('focus', handleUpdate);

    return () => {
      window.removeEventListener('tenant_booking_updated', handleUpdate);
      window.removeEventListener('tenant_property_booked', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
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
    setActionLoadingId(bookingId as any);
    try {
      const res = await tenantBookingAPI.verifyKyc(bookingId);
      if (res?.success) {
        toast.success("KYC approved! Ready for agreement and move-in.");
        await fetchBookings();
        window.dispatchEvent(new Event('tenant_booking_updated'));
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

  const handleRequestKyc = async (bookingId: string | number) => {
  setActionLoadingId(Number(bookingId) || 999999);
  try {
    const res = await tenantBookingAPI.requestKyc(bookingId);
    if (res?.success) {
      toast.success("KYC request sent to tenant!");
    } else {
      toast.error(res?.message || "Failed to send KYC request");
    }
  } catch (err: any) {
    toast.error(err?.response?.data?.message || "Failed to send KYC request");
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
    setConfirmModalConfig({
      isOpen: true,
      title: 'Reject Candidate Application',
      message: 'Are you sure you want to reject this candidate application?',
      onConfirm: async () => {
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
      },
    });
  };

  const handleDeleteInterest = async (interestId: number) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Delete Application Request',
      message: 'Are you sure you want to delete this candidate application permanently?',
      onConfirm: async () => {
        setActionLoadingId(interestId);
        try {
          await tenantAPI.deleteInterest(interestId);
          toast.success("Candidate interest request deleted.");
          setInterestsList((prev) => prev.filter((i) => i.id !== interestId));
          await fetchInterests();
          onRefresh?.();
        } catch (err: any) {
          console.error("Error deleting interest:", err);
          toast.error(err?.response?.data?.message || "Failed to delete interest request");
        } finally {
          setActionLoadingId(null);
        }
      },
    });
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
    setConfirmModalConfig({
      isOpen: true,
      title: 'Remove Inquiry',
      message: `Are you sure you want to remove inquiry from ${inq.tenant_name || 'this tenant'}?`,
      onConfirm: async () => {
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
      },
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setConfirmModalConfig({
      isOpen: true,
      title: 'Delete Selected Inquiries',
      message: `Are you sure you want to delete ${selectedIds.size} selected inquiries?`,
      onConfirm: async () => {
        setBulkDeleting(true);
        try {
          setInquiriesList((prev) => prev.filter((item, i) => !selectedIds.has(getInqKey(item, i))));
          setSelectedIds(new Set());
          toast.success('Selected inquiries deleted');
          onRefresh?.();
        } catch (e) {
          toast.error('Failed to delete inquiries');
        } finally {
          setBulkDeleting(false);
        }
      },
    });
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



{/* 🚀 Activate Tenancy & Rent Payment Setup Modal */}
{activateTenancyModalBooking && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
      <div className="px-4 py-3 bg-[#0b3856] text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <h3 className="font-extrabold text-sm">Activate Tenancy & Rent Payment Setup</h3>
        </div>
        <button
          type="button"
          onClick={() => setActivateTenancyModalBooking(null)}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4 text-xs">
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
          <span className="font-bold block">✓ Agreement E-Signed by Tenant</span>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            Set up your monthly rent due date and UPI ID to generate dynamic QR code for tenant monthly rent payments.
          </p>
        </div>

        {/* Rent Details Summary */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px]">
          <div>
            <span className="text-slate-400 block text-[9.5px] uppercase font-bold">Monthly Rent</span>
            <strong className="text-slate-900 text-sm font-extrabold">
              ₹{Number(activateTenancyModalBooking.monthly_rent || activateTenancyModalBooking.prop_monthly_rent || 25000).toLocaleString('en-IN')}
            </strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[9.5px] uppercase font-bold">Tenant Name</span>
            <strong className="text-slate-900 text-xs truncate block font-bold">
              {activateTenancyModalBooking.tenant_signature_name || activateTenancyModalBooking.tenant_name || 'Tenant'}
            </strong>
          </div>
        </div>

        {/* 1. Rent Due Date Dropdown */}
        <div className="space-y-1">
          <label className="font-bold text-slate-800 text-[11px] block">
            Select Monthly Rent Due Date:
          </label>
          <select
            value={activateRentDueDay}
            onChange={(e) => setActivateRentDueDay(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-xs bg-white text-slate-900 outline-none focus:ring-2 focus:ring-[#0b3856]"
          >
            <option value={1}>1st of every month</option>
            <option value={5}>5th of every month (Recommended)</option>
            <option value={7}>7th of every month</option>
            <option value={10}>10th of every month</option>
            <option value={15}>15th of every month</option>
            <option value={20}>20th of every month</option>
            <option value={25}>25th of every month</option>
          </select>
        </div>

        {/* 2. Owner UPI ID Input */}
        <div className="space-y-1">
          <label className="font-bold text-slate-800 text-[11px] flex items-center justify-between">
            <span>Owner UPI ID for Rent Direct Credit:</span>
            <span className="text-[9.5px] text-amber-600 font-semibold">Required</span>
          </label>
          <input
            type="text"
            value={activateOwnerUpiId}
            onChange={(e) => setActivateOwnerUpiId(e.target.value)}
            placeholder="e.g. owner@oksbi or 9876543210@paytm"
            className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-xs bg-white text-slate-900 outline-none focus:ring-2 focus:ring-[#0b3856]"
          />
          <p className="text-[10px] text-slate-500">
            A dynamic UPI QR Code will be generated automatically for the tenant from this UPI ID.
          </p>
        </div>

        {/* Confirmation Checkbox */}
        <label
          onClick={() => setActivateUpiConfirmed(!activateUpiConfirmed)}
          className="flex items-start gap-2 cursor-pointer select-none text-slate-800 text-[11px] font-semibold pt-1"
        >
          {activateUpiConfirmed ? (
            <CheckSquare size={16} className="text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <Square size={16} className="text-slate-400 shrink-0 mt-0.5" />
          )}
          <span>I confirm this UPI ID belongs to me and rent payments will be credited to this account.</span>
        </label>

        {/* Action Button */}
        <button
          type="button"
          disabled={actionLoadingId === activateTenancyModalBooking.id || !activateOwnerUpiId.trim() || !activateUpiConfirmed}
          onClick={handleFinalizeAgreement}
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 transition-all active:scale-[0.99]"
        >
          {actionLoadingId === activateTenancyModalBooking.id ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={16} />}
          <span>Activate Tenancy & Save Rent Payment Setup</span>
        </button>
      </div>
    </div>
  </div>
)}

{/* 🪪 KYC Document Viewer Modal */}
{viewingKycBooking && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
      <div className="px-4 py-3 bg-[#0b3856] text-white flex items-center justify-between">
        <h3 className="font-extrabold text-sm">🪪 Tenant KYC Documents</h3>
        <button onClick={() => setViewingKycBooking(null)} className="p-1 rounded-lg hover:bg-white/10">
          <X size={16} />
        </button>
      </div>
      <div className="p-4 space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[9px] text-gray-400 uppercase block">ID Proof Type</span>
            <span className="font-bold text-slate-900">{viewingKycBooking.id_proof_type || '—'}</span>
          </div>
          <div>
            <span className="text-[9px] text-gray-400 uppercase block">ID Number</span>
            <span className="font-bold text-slate-900">{viewingKycBooking.id_proof_number || '—'}</span>
          </div>
        </div>
        {viewingKycBooking.id_proof_document ? (
          <div className="space-y-3">
            <a href={viewingKycBooking.id_proof_document} target="_blank" rel="noreferrer" className="block">
              <img
                src={viewingKycBooking.id_proof_document}
                alt="ID Proof"
                className="w-full max-h-64 object-contain rounded-xl border border-slate-200"
              />
            </a>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  handleVerifyKyc(viewingKycBooking.booking_id);
                  setViewingKycBooking(null);
                }}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition cursor-pointer"
              >
                Approve KYC Document
              </button>
              <button
                type="button"
                onClick={() => {
                  handleRejectKyc(viewingKycBooking.booking_id);
                  setViewingKycBooking(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs transition cursor-pointer"
              >
                Reject
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-amber-50/90 rounded-xl border border-amber-200 space-y-2.5 text-center">
            <p className="text-amber-900 font-extrabold text-xs">⚠️ No document uploaded yet.</p>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              Tenant must upload their ID proof document (Aadhaar / PAN / Passport) in their Profile tab before you can approve KYC.
            </p>
            <button
              type="button"
              onClick={() => {
                handleRequestKyc(viewingKycBooking.booking_id);
                setViewingKycBooking(null);
              }}
              className="w-full py-2 rounded-xl bg-[#0b3856] hover:bg-[#072438] text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              Request KYC Documents from Tenant
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
)}

{/* 📄 Upload Agreement PDF Modal for Owner */}
{uploadAgreementModalBooking && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 space-y-0">
      <div className="px-5 py-3.5 bg-[#0b3856] text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
            <FolderUp size={16} />
          </div>
          <h3 className="font-extrabold text-sm text-white">Upload Rental Agreement (PDF)</h3>
        </div>
        <button
          onClick={() => { setUploadAgreementModalBooking(null); setAgreementFile(null); }}
          className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-5 space-y-4 text-xs">
        {/* Booking & Tenant Brief */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px]">
          <div>
            <span className="text-slate-400 text-[9.5px] uppercase font-bold block">Tenant</span>
            <strong className="text-slate-900 text-xs">{uploadAgreementModalBooking.tenant_name || `Tenant #${uploadAgreementModalBooking.tenant_id}`}</strong>
          </div>
          <div className="text-right">
            <span className="text-slate-400 text-[9.5px] uppercase font-bold block">Booking ID</span>
            <span className="font-mono font-black text-slate-800 text-xs">{uploadAgreementModalBooking.booking_id}</span>
          </div>
        </div>

        {/* File Dropzone */}
        <div>
          <label className="text-[10px] font-bold text-slate-700 block uppercase mb-1.5">
            Select Agreement Document File (PDF / DOC / Image)
          </label>
          <input
            type="file"
            ref={agreementFileInputRef}
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setAgreementFile(e.target.files[0]);
              }
            }}
          />

          {agreementFile ? (
            <div className="p-3.5 rounded-xl border-2 border-emerald-400 bg-emerald-50/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-xs truncate">{agreementFile.name}</p>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {(agreementFile.size / 1024).toFixed(1)} KB • Ready to send
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAgreementFile(null)}
                className="p-1 rounded-lg text-rose-500 hover:bg-rose-100 cursor-pointer"
                title="Remove file"
              >
                <X size={15} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => agreementFileInputRef.current?.click()}
              className="p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-orange-500 bg-slate-50 hover:bg-orange-50/30 text-center cursor-pointer transition-all space-y-2 group"
            >
              <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <FolderUp size={22} />
              </div>
              <div>
                <p className="font-extrabold text-xs text-slate-900">Click to browse or drop Agreement PDF here</p>
                <p className="text-[10.5px] text-slate-400 mt-0.5">Supports PDF, DOCX, PNG, JPG (Max 50MB)</p>
              </div>
            </div>
          )}
        </div>

        {/* Fallback Custom URL / Template Path */}
        <div>
          <label className="text-[9.5px] font-bold text-slate-500 block uppercase mb-1">
            Or Agreement Document Link (Optional)
          </label>
          <input
            type="text"
            value={agreementCustomUrl}
            onChange={(e) => setAgreementCustomUrl(e.target.value)}
            placeholder="/agreements/sample_rental_agreement.pdf"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-orange-500 text-slate-800"
          />
        </div>

        {/* Action Button */}
        <button
          type="button"
          disabled={uploadingAgreement || (!agreementFile && !agreementCustomUrl.trim())}
          onClick={handleSubmitAgreementUpload}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all disabled:opacity-50"
        >
          {uploadingAgreement ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Uploading & Sending Agreement...</span>
            </>
          ) : (
            <>
              <Upload size={14} />
              <span>Send Agreement to Tenant for E-Sign</span>
            </>
          )}
        </button>
      </div>
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

      {/* 🗑️ Custom Confirmation Modal */}
      {confirmModalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-2.5 rounded-xl bg-amber-100">
                <Trash2 size={20} />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">{confirmModalConfig.title}</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{confirmModalConfig.message}</p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModalConfig.onConfirm();
                  setConfirmModalConfig((prev) => ({ ...prev, isOpen: false }));
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition shadow-sm cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerInquiriesTab;
