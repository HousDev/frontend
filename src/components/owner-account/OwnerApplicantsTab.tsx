import React, { useState, useEffect, useRef } from 'react';
import {
  HeartHandshake, CheckCircle2, Building2,
  PhoneCall, Loader2, Check, X, RefreshCw, Users,
  Flame, Eye, BadgeCheck, Info, Trash2, IndianRupee,
  Clock, FolderUp, CheckSquare, Square
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { toast } from 'react-toastify';
import { tenantAPI } from '@/lib/tenantAPI';
import { tenantBookingAPI } from '@/lib/tenantBookingAPI';
import { TenantOwnerInterest } from '../tenant-account/types';
import TenancyHistoryModal from './TenancyHistoryModal';

interface OwnerApplicantsTabProps {
  ownerId?: number | string;
  ownerName?: string;
  onRefresh?: () => void;
}

function TenantProfileModal({ tenant, loading, onClose }: { tenant: any; loading: boolean; onClose: () => void; }) {
  if (!tenant) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[88vh]">
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#0b3856] to-[#184d6e] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-sm">
              {(tenant.name || 'T').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-extrabold text-sm">{tenant.name || 'Tenant'}</h3>
              <p className="text-[10px] text-slate-300">{tenant.tenant_id || 'TEN' + String(tenant.id || '').padStart(4, '0')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition cursor-pointer"><X size={15} /></button>
        </div>
        <div className="overflow-y-auto p-4 space-y-3.5 text-xs">
          {loading ? (
            <div className="flex items-center justify-center py-10 gap-2 text-slate-500">
              <Loader2 size={16} className="animate-spin text-orange-500" />
              <span>Loading full profile...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Full Name', val: tenant.name },
                  { label: 'Phone', val: tenant.phone || tenant.tenant_phone },
                  { label: 'Email', val: tenant.email },
                  { label: 'Tenant Type', val: tenant.tenant_type },
                ].map(({ label, val }) => (
                  <div key={label} className="space-y-0.5">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">{label}</span>
                    <span className="font-extrabold text-slate-900 text-[10.5px]">{val || '—'}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-extrabold text-[10px] uppercase text-slate-700 tracking-wider flex items-center gap-1">
                  <BadgeCheck size={12} className="text-orange-500" /> Preferences
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'BHK Preference', val: tenant.preferred_bhk },
                    { label: 'Budget', val: tenant.budget_max ? '₹' + Number(tenant.budget_max).toLocaleString('en-IN') + '/mo' : null },
                    { label: 'Move-in Date', val: tenant.move_in_date ? (String(tenant.move_in_date).includes('T') || String(tenant.move_in_date).includes('-') ? new Date(tenant.move_in_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : tenant.move_in_date) : 'Flexible' },
                    { label: 'Preferred Location', val: tenant.preferred_location },
                    { label: 'Monthly Income', val: tenant.monthly_income ? '₹' + Number(tenant.monthly_income).toLocaleString('en-IN') : null },
                    { label: 'Occupation', val: tenant.occupation_type },
                    { label: 'Food', val: tenant.food_preference },
                    { label: 'Pets', val: tenant.has_pets },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <span className="text-[9px] text-gray-400 font-semibold uppercase block">{label}</span>
                      <span className="font-bold text-slate-800 text-[10.5px]">{val || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
              {tenant.notes && (
                <p className="text-[10px] text-slate-600 italic bg-amber-50 border border-amber-100 px-2.5 py-1.5 rounded-lg">{tenant.notes}</p>
              )}
            </>
          )}
        </div>
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 rounded-xl bg-[#0b3856] text-white text-xs font-bold hover:bg-[#072438] transition cursor-pointer">Close Profile</button>
        </div>
      </div>
    </div>
  );
}

export const OwnerApplicantsTab: React.FC<OwnerApplicantsTabProps> = ({ ownerId, ownerName = 'Owner', onRefresh }) => {
  const [interestsList, setInterestsList] = useState<TenantOwnerInterest[]>([]);
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [selectedTenantForProfile, setSelectedTenantForProfile] = useState<any>(null);
  const [fetchingFullTenant, setFetchingFullTenant] = useState(false);
  const [historyModalBooking, setHistoryModalBooking] = useState<any | null>(null);

  // Modals state
  const [viewingKycBooking, setViewingKycBooking] = useState<any | null>(null);
  const [uploadAgreementModalBooking, setUploadAgreementModalBooking] = useState<any | null>(null);
  const [agreementFile, setAgreementFile] = useState<File | null>(null);
  const [agreementCustomUrl, setAgreementCustomUrl] = useState<string>('/agreements/sample_rental_agreement.pdf');
  const [uploadingAgreement, setUploadingAgreement] = useState<boolean>(false);
  const agreementFileInputRef = useRef<HTMLInputElement>(null);

  const [activateTenancyModalBooking, setActivateTenancyModalBooking] = useState<any | null>(null);
  const [activateRentDueDay, setActivateRentDueDay] = useState<number>(5);
  const [activateOwnerUpiId, setActivateOwnerUpiId] = useState<string>('');
  const [activateUpiConfirmed, setActivateUpiConfirmed] = useState<boolean>(true);

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

  const fetchInterests = async () => {
    if (!ownerId) return;
    try {
      const res = await tenantAPI.getOwnerInterests(ownerId);
      if (res?.success && Array.isArray(res.data)) {
        setInterestsList(res.data);
      }
    } catch (e) { console.warn('Could not load owner interests:', e); }
  };

  const fetchBookings = async () => {
    if (!ownerId) return;
    try {
      const res = await tenantBookingAPI.getByOwnerId(ownerId);
      if (res?.success && Array.isArray(res.data)) {
        setBookingsList(res.data);
      }
    } catch (e) { console.warn('Could not load owner bookings:', e); }
  };

  const fetchAllData = async () => {
    if (!ownerId) return;
    setLoading(true);
    await Promise.all([fetchInterests(), fetchBookings()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();

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

  // Actions
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
      } catch (e) { console.warn('Error fetching full tenant profile:', e); }
      finally { setFetchingFullTenant(false); }
    }
  };

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
    setActionLoadingId(Number(bookingId) || 999999);
    try {
      const res = await tenantBookingAPI.updateStatus(bookingId, { payment_status: 'ISSUE' });
      if (res?.success) {
        toast.warning("Payment flagged as issue. Tenant notified.");
        await fetchBookings();
        onRefresh?.();
      } else {
        toast.error(res?.message || "Failed to flag issue");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to flag issue");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRequestKyc = async (bookingId: string | number) => {
    setActionLoadingId(Number(bookingId) || 999999);
    try {
      const res = await tenantBookingAPI.updateStatus(bookingId, { booking_status: 'KYC_PENDING' });
      if (res?.success) {
        toast.info("KYC submission link sent to Tenant!");
        await fetchBookings();
        onRefresh?.();
      }
    } catch (err: any) {
      toast.error("Failed to send KYC request");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleVerifyKyc = async (bookingId: string | number) => {
    setActionLoadingId(Number(bookingId) || 999999);
    try {
      const res = await tenantBookingAPI.verifyKyc(bookingId);
      if (res?.success) {
        toast.success("KYC documents approved! Booking moved to Agreement Stage.");
        await fetchBookings();
        onRefresh?.();
      }
    } catch (err: any) {
      toast.error("Failed to approve KYC");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectKyc = async (bookingId: string | number) => {
    setActionLoadingId(Number(bookingId) || 999999);
    try {
      const res = await tenantBookingAPI.updateStatus(bookingId, { booking_status: 'KYC_REJECTED' });
      if (res?.success) {
        toast.warning("KYC document rejected.");
        await fetchBookings();
        onRefresh?.();
      }
    } catch (err: any) {
      toast.error("Failed to reject KYC");
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

  const handleConfirmCandidate = async (interestId: number) => {
    if (!ownerId) return;
    setActionLoadingId(interestId);
    try {
      const res = await tenantAPI.ownerConfirmTenant(interestId, ownerId);
      if (res?.success) { toast.success(res.message || 'Candidate confirmed!'); await fetchAllData(); onRefresh?.(); }
      else toast.error(res?.message || 'Failed to confirm candidate');
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Failed to confirm candidate'); }
    finally { setActionLoadingId(null); }
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
          if (res?.success) { toast.info(res.message || 'Candidate rejected.'); await fetchAllData(); onRefresh?.(); }
          else toast.error(res?.message || 'Failed to reject candidate');
        } catch (err: any) { toast.error(err?.response?.data?.message || 'Failed to reject candidate'); }
        finally { setActionLoadingId(null); }
      },
    });
  };

  const handleDeleteCandidate = async (interestId: number) => {
    setConfirmModalConfig({
      isOpen: true,
      title: 'Delete Applicant Request',
      message: 'Are you sure you want to delete this applicant request permanently?',
      onConfirm: async () => {
        setActionLoadingId(interestId);
        try {
          await tenantAPI.deleteInterest(interestId);
          toast.success('Applicant interest request deleted.');
          setInterestsList((prev) => prev.filter((i) => i.id !== interestId));
          await fetchAllData();
          onRefresh?.();
        } catch (err: any) {
          toast.error(err?.response?.data?.message || 'Failed to delete applicant request');
        } finally {
          setActionLoadingId(null);
        }
      },
    });
  };

  const pendingCount = interestsList.filter(i => !['OWNER_CONFIRMED', 'TENANT_ACCEPTED', 'OWNER_REJECTED', 'TENANT_DECLINED'].includes(i.status || '')).length;
  const confirmedCount = interestsList.filter(i => i.status === 'OWNER_CONFIRMED' || i.status === 'TENANT_ACCEPTED').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0b3856] via-[#10344d] to-[#184d6e] p-4 rounded-2xl text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center text-orange-400 shrink-0">
            <HeartHandshake size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm sm:text-base text-white">Tenant Applicants & Reservations</h2>
              <span className="px-2 py-0.5 rounded bg-orange-500 text-white text-[9px] font-black uppercase tracking-wider">Verification Center</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">Manage token payments, KYC documents, lease agreements, and applicant selections.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-right">
            <span className="text-[9px] text-slate-300 block font-medium uppercase tracking-wider">Reservations</span>
            <span className="text-sm font-black text-amber-300">{bookingsList.length} Active</span>
          </div>
          <button onClick={fetchAllData} disabled={loading} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition cursor-pointer disabled:opacity-50" title="Refresh">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl border bg-slate-100 text-slate-800 border-slate-200 flex items-center gap-2.5">
          <Users size={16} className="text-slate-600 shrink-0" />
          <div><div className="text-base font-black">{interestsList.length}</div><div className="text-[10px] opacity-75">Applicants</div></div>
        </div>
        <div className="p-3 rounded-xl border bg-amber-50 text-amber-800 border-amber-200 flex items-center gap-2.5">
          <IndianRupee size={16} className="text-amber-600 shrink-0" />
          <div><div className="text-base font-black">{bookingsList.length}</div><div className="text-[10px] opacity-75">Token Claims</div></div>
        </div>
        <div className="p-3 rounded-xl border bg-blue-50 text-blue-800 border-blue-200 flex items-center gap-2.5">
          <Info size={16} className="text-blue-500 shrink-0" />
          <div><div className="text-base font-black">{pendingCount}</div><div className="text-[10px] opacity-75">Pending Review</div></div>
        </div>
        <div className="p-3 rounded-xl border bg-emerald-50 text-emerald-800 border-emerald-200 flex items-center gap-2.5">
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          <div><div className="text-base font-black">{confirmedCount}</div><div className="text-[10px] opacity-75">Confirmed</div></div>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-2 text-slate-500">
          <Loader2 size={18} className="animate-spin text-orange-500" />
          <span className="text-sm font-medium">Loading tenant applications & token claims...</span>
        </div>
      )}

      {/* SECTION 1: 💳 Property Reservations & Token Payment Claims */}
      {!loading && bookingsList.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
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
              const isKycApproved = b.booking_status === 'KYC_APPROVED' || b.booking_status === 'AGREEMENT_SENT' || b.booking_status === 'AGREEMENT_SIGNED' || b.booking_status === 'BOOKED';

              const tenantName = b.tenant_name || `Tenant #${b.tenant_id}`;

              return (
                <div
                  key={`owner-bkg-${b.id || b.booking_id}`}
                  onClick={() => setHistoryModalBooking(b)}
                  className={`rounded-2xl border p-4 space-y-3 shadow-xs transition-all cursor-pointer hover:shadow-md ${
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
                        Token: <strong className="text-slate-800">₹{Number(b.token_amount || 0).toLocaleString('en-IN')}</strong> • Move-in: {formatMoveInDate(b.move_in_date)}
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
                      <div className={`p-1 rounded border ${b.booking_status === 'BOOKED' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : b.booking_status === 'AGREEMENT_SENT' || b.booking_status === 'AGREEMENT_SIGNED' ? 'bg-amber-100 text-amber-800 border-amber-200 font-extrabold' : 'bg-slate-100 text-slate-400'}`}>
                        5. Lease {b.booking_status === 'BOOKED' ? '✓' : b.booking_status === 'AGREEMENT_SIGNED' ? '✍️' : b.booking_status === 'AGREEMENT_SENT' ? '📄' : ''}
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
                      <div className="flex flex-col gap-2 w-full">
                        {Boolean(b.id_proof_document && String(b.id_proof_document).trim() !== '') ? (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                                KYC Review Required
                              </span>
                              <button
                                type="button"
                                onClick={() => setViewingKycBooking(b)}
                                className="text-[10.5px] font-bold text-blue-700 underline cursor-pointer"
                              >
                                View KYC Details
                              </button>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleVerifyKyc(b.booking_id)}
                                className="flex-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10.5px] font-bold hover:bg-emerald-700 cursor-pointer"
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
                          </>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                              Tenant Hasn't Uploaded KYC Document Yet
                            </span>
                            <button
                              type="button"
                              disabled={actionLoadingId === b.id}
                              onClick={() => handleRequestKyc(b.booking_id)}
                              className="px-2.5 py-1 rounded-lg bg-[#0b3856] hover:bg-[#072438] text-white text-[10.5px] font-bold cursor-pointer disabled:opacity-50 shrink-0"
                            >
                              Request KYC Documents
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {isKycApproved && b.booking_status === 'KYC_APPROVED' && (
                      <div className="flex flex-col gap-2 w-full mt-1">
                        <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 size={11} /> KYC Approved — Ready for Agreement PDF
                        </span>
                        <button
                          type="button"
                          disabled={actionLoadingId === b.id || actionLoadingId === b.booking_id}
                          onClick={() => handleOpenAgreementUpload(b)}
                          className="w-full py-2 px-3 rounded-xl bg-[#0b3856] hover:bg-[#072438] text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all disabled:opacity-50"
                        >
                          {actionLoadingId === b.id ? <Loader2 size={13} className="animate-spin" /> : <FolderUp size={14} />}
                          <span>📁 Upload & Send Agreement PDF for E-Sign</span>
                        </button>
                      </div>
                    )}

                    {b.booking_status === 'AGREEMENT_SENT' && (
                      <div className="flex flex-col gap-2 w-full mt-1">
                        <span className="text-[10.5px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-md flex items-center gap-1">
                          <Clock size={11} className="text-amber-600 animate-pulse" /> 🟡 Agreement Sent — Awaiting Tenant E-Signature
                        </span>
                        <button
                          type="button"
                          disabled={actionLoadingId === b.id || actionLoadingId === b.booking_id}
                          onClick={() => handleOpenAgreementUpload(b)}
                          className="w-full py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                        >
                          <FolderUp size={12} />
                          <span>Re-upload / Change Agreement PDF</span>
                        </button>
                      </div>
                    )}

                    {b.booking_status === 'AGREEMENT_SIGNED' && (
                      <div className="flex flex-col gap-2 w-full mt-1">
                        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                          <span className="text-[10.5px] font-extrabold text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 size={12} className="text-emerald-600" /> ✅ Agreement Signed by Tenant!
                          </span>
                          <p className="text-[10px] text-emerald-700">
                            Finalize rent payment schedule & owner UPI ID to activate tenancy.
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={actionLoadingId === b.id || actionLoadingId === b.booking_id}
                          onClick={() => handleOpenActivateTenancyModal(b)}
                          className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all disabled:opacity-50"
                        >
                          {actionLoadingId === b.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={14} />}
                          <span>🚀 Activate Tenancy & Finalize Agreement</span>
                        </button>
                      </div>
                    )}

                    {b.booking_status === 'BOOKED' && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 flex items-center justify-between w-full">
                        <span className="text-[11px] font-black flex items-center gap-1">
                          <CheckCircle2 size={13} className="text-emerald-600" /> 🎉 Tenancy Active & Agreement Finalized!
                        </span>
                        {b.agreement_document && (
                          <a
                            href={b.agreement_document}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                          >
                            <span>View PDF</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: 🤝 Interested Tenant Applicants & Selection */}
      {!loading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <HeartHandshake size={14} className="text-orange-500" />
              <span>Interested Tenant Applicants & Selection ({interestsList.length})</span>
            </h3>
          </div>

          {interestsList.length === 0 ? (
            <div className="py-12 text-center space-y-2 bg-white rounded-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 text-orange-400 flex items-center justify-center mx-auto">
                <HeartHandshake size={24} />
              </div>
              <h3 className="font-extrabold text-slate-800 text-xs">No Applicant Interest Requests Yet</h3>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">When tenants express interest in your properties, their applications will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interestsList.map((item: any) => {
                const isConfirmed = item.status === 'OWNER_CONFIRMED';
                const isAccepted = item.status === 'TENANT_ACCEPTED' || item.status === 'BOOKING_PENDING';
                const isSelectedOthers = item.status === 'PROPERTY_SELECTED';
                const isRejected = item.status === 'OWNER_REJECTED' || item.status === 'TENANT_DECLINED';
                const isPending = !isConfirmed && !isAccepted && !isSelectedOthers && !isRejected;

                const matchingBooking = bookingsList.find(
                  (b) => String(b.property_id) === String(item.rental_property_id) || String(b.interest_id) === String(item.id)
                );
                const hasPaymentClaimed = matchingBooking && matchingBooking.payment_status === 'CLAIMED';
                const hasPaymentVerified = matchingBooking && matchingBooking.payment_status === 'VERIFIED';

                const phone = item.tenant_phone || '';
                const tenantName = item.tenant_name || 'Tenant Applicant';
                const propTitle = item.society_name ? (item.unit_type || '2 BHK') + ' at ' + item.society_name : 'Property #' + item.rental_property_id;

                return (
                  <div key={'applicant-' + item.id} className={`rounded-2xl border p-4 flex flex-col justify-between gap-3 transition-all ${
                    hasPaymentClaimed
                      ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/30 shadow-md'
                      : isConfirmed
                      ? 'bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white border-emerald-400 shadow-md ring-2 ring-emerald-400/20'
                      : isAccepted
                      ? 'bg-indigo-50/40 border-indigo-200'
                      : isSelectedOthers
                      ? 'bg-amber-50/40 border-amber-200'
                      : isRejected
                      ? 'bg-rose-50/40 border-rose-200 opacity-75'
                      : 'bg-white border-slate-200 shadow-xs hover:shadow-md'
                  }`}>
                    <div className="space-y-2.5">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-900 to-slate-800 text-white font-black text-sm flex items-center justify-center shrink-0">
                            {tenantName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-extrabold text-sm text-slate-900 truncate">{tenantName}</h4>
                              {item.match_score != null && (
                                <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-blue-100 text-blue-800 border border-blue-200 shrink-0">
                                  {item.match_score}% Match
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-500">{item.occupation_type || 'Salaried'}{item.company_name ? ' - ' + item.company_name : ''}</p>
                          </div>
                        </div>
                        <div className="shrink-0">
                          {hasPaymentClaimed ? (
                            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-amber-500 text-white flex items-center gap-1 shadow-xs animate-pulse">
                              <Clock size={11} /> 🟡 Token Payment Claimed
                            </span>
                          ) : hasPaymentVerified ? (
                            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                              <CheckCircle2 size={11} /> Payment Verified
                            </span>
                          ) : isConfirmed ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white flex items-center gap-1"><CheckCircle2 size={11} /> Confirmed Candidate</span>
                          ) : isAccepted ? (
                            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">Tenant Accepted!</span>
                          ) : isSelectedOthers ? (
                            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-100 text-amber-800 border border-amber-300">In Reserve</span>
                          ) : isRejected ? (
                            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-medium bg-rose-100 text-rose-700 border border-rose-200">Rejected</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Pending Review</span>
                          )}
                        </div>
                      </div>

                      {/* Property */}
                      <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Building2 size={12} className="text-orange-500 shrink-0" />
                          <span className="font-bold text-[11px] text-slate-800 truncate">{propTitle}</span>
                        </div>
                        <span className="font-mono text-[9px] font-extrabold px-1.5 py-0.5 bg-slate-900 text-white rounded shrink-0">RENT-{item.rental_property_id}</span>
                      </div>

                      {/* Profile Snapshot */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
                        {[
                          { label: 'Type', val: item.tenant_type || 'Family' },
                          { label: 'Income', val: item.monthly_income ? '₹' + Number(item.monthly_income).toLocaleString('en-IN') : 'Any' },
                          { label: 'Food', val: item.food_preference || 'Any' },
                          { label: 'Pets', val: item.has_pets || 'No' },
                        ].map(({ label, val }) => (
                          <div key={label}>
                            <span className="text-[8.5px] text-gray-400 font-semibold uppercase block">{label}</span>
                            <span className="font-bold text-slate-800 text-[10.5px]">{val}</span>
                          </div>
                        ))}
                      </div>

                      {item.message && (
                        <p className="text-[10px] text-slate-600 italic bg-amber-50/60 p-2 rounded-lg border border-amber-100">"{item.message}"</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        {phone && (
                          <>
                            <a href={'https://wa.me/91' + String(phone).replace(/\D/g, '') + '?text=' + encodeURIComponent('Hi ' + tenantName + '! Application received for ' + propTitle + '. Match: ' + item.match_score + '%. Lets discuss!')} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                              <SiWhatsapp size= {11} /><span>WhatsApp</span>
                            </a>
                            <a href={'tel:' + phone} className="px-2.5 py-1 rounded-lg bg-[#0b3856] hover:bg-[#072438] text-white text-[10px] font-extrabold flex items-center gap-1 shadow-xs">
                              <PhoneCall size={11} /><span>Call</span>
                            </a>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <button type="button" onClick={() => handleOpenProfile(item)} className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 border border-slate-200 hover:border-orange-200 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer">
                          <Eye size={11} /><span>View Profile</span>
                        </button>
                        <button
                          type="button"
                          disabled={actionLoadingId === item.id}
                          onClick={() => handleDeleteCandidate(item.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 border border-rose-200 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                          title="Delete Applicant Request"
                        >
                          <Trash2 size={11} /><span>Delete</span>
                        </button>
                        {isPending && (
                          <>
                            <button type="button" disabled={actionLoadingId === item.id} onClick={() => handleConfirmCandidate(item.id)} className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs transition cursor-pointer disabled:opacity-50">
                              {actionLoadingId === item.id ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}<span>Confirm Candidate</span>
                            </button>
                            <button type="button" disabled={actionLoadingId === item.id} onClick={() => handleRejectCandidate(item.id)} className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 text-[10px] font-medium transition cursor-pointer disabled:opacity-50">
                              Reject
                            </button>
                          </>
                        )}
                        {isConfirmed && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md">✓ Confirmed & Waiting Acceptance</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 👤 Tenant Profile Modal */}
      {selectedTenantForProfile && (
        <TenantProfileModal tenant={selectedTenantForProfile} loading={fetchingFullTenant} onClose={() => setSelectedTenantForProfile(null)} />
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

              {/* Rent Due Day Dropdown */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">
                  Monthly Rent Due Date (Day of Month) *
                </label>
                <select
                  value={activateRentDueDay}
                  onChange={(e) => setActivateRentDueDay(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#0b3856] text-slate-900"
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

              {/* Owner UPI ID */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-700 mb-1">
                  Owner Bank UPI ID for Rent Credit *
                </label>
                <input
                  type="text"
                  value={activateOwnerUpiId}
                  onChange={(e) => setActivateOwnerUpiId(e.target.value)}
                  placeholder="e.g. prachi@oksbi or 9876543210@paytm"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#0b3856] text-slate-900"
                />
                <p className="text-[10px] text-slate-500 mt-1">
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
                    The tenant hasn't uploaded their Aadhaar / PAN / Passport document yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      handleRequestKyc(viewingKycBooking.booking_id);
                      setViewingKycBooking(null);
                    }}
                    className="w-full py-2 rounded-xl bg-[#0b3856] text-white font-bold text-xs shadow-xs hover:bg-[#072438] cursor-pointer"
                  >
                    Send Instant KYC Upload Reminder
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 📄 Upload & Send Rental Agreement PDF Modal */}
      {uploadAgreementModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="px-4 py-3 bg-[#0b3856] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderUp size={18} className="text-amber-400" />
                <h3 className="font-extrabold text-sm">Upload & Send Rental Agreement PDF</h3>
              </div>
              <button
                type="button"
                onClick={() => setUploadAgreementModalBooking(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                <span className="font-bold block">Tenant: {uploadAgreementModalBooking?.tenant_name || `Tenant #${uploadAgreementModalBooking?.tenant_id}`}</span>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Upload your customized Rental Agreement PDF file (or use sample template URL). The tenant will receive an instant notification to review and sign.
                </p>
              </div>

              {/* Upload PDF File */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase text-slate-700">
                  Select Agreement PDF File from Computer
                </label>
                <input
                  ref={agreementFileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setAgreementFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => agreementFileInputRef.current?.click()}
                  className="w-full p-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 hover:bg-amber-50/40 text-slate-700 font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer"
                >
                  <FolderUp size={20} className="text-amber-500" />
                  <span>{agreementFile ? `Selected: ${agreementFile.name}` : 'Click to Browse & Upload PDF File'}</span>
                  <span className="text-[10px] text-slate-400 font-normal">Supports .PDF documents up to 10MB</span>
                </button>
              </div>

              {/* Or enter custom PDF link */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-slate-700">
                  Or Document URL / Sample Template
                </label>
                <input
                  type="text"
                  value={agreementCustomUrl}
                  onChange={(e) => setAgreementCustomUrl(e.target.value)}
                  placeholder="/agreements/sample_rental_agreement.pdf"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#0b3856] text-slate-900"
                />
              </div>

              <button
                type="button"
                disabled={uploadingAgreement || (!agreementFile && !agreementCustomUrl.trim())}
                onClick={handleSubmitAgreementUpload}
                className="w-full py-3 px-4 rounded-xl bg-[#0b3856] hover:bg-[#072438] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 transition-all active:scale-[0.99]"
              >
                {uploadingAgreement ? <Loader2 size={15} className="animate-spin" /> : <FolderUp size={16} />}
                <span>Send Agreement PDF to Tenant for E-Sign</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🗑️ Custom Delete Confirmation Modal */}
      {confirmModalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-100">
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

      {/* 📜 Tenancy History & Audit Ledger Modal */}
      <TenancyHistoryModal
        isOpen={Boolean(historyModalBooking)}
        onClose={() => setHistoryModalBooking(null)}
        booking={historyModalBooking}
        onVerifyPayment={handleVerifyPayment}
        onVerifyKyc={handleVerifyKyc}
      />
    </div>
  );
};

export default OwnerApplicantsTab;
