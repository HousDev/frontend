import React, { useState, useMemo, useEffect } from 'react';
import {
  Building, MapPin, Link2, Loader2, MessageSquare, CalendarDays, ExternalLink, ShieldCheck, Eye,
  Trash2, CheckSquare, Square, Filter, CheckCircle, Clock, AlertTriangle, Sparkles, Check, X
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getImageUrl } from '@/lib/helpers';
import { MatchedProperty, TenantOwnerInterest } from './types';
import { tenantAPI } from '@/lib/tenantAPI';
import TenantBookingPaymentModal from './TenantBookingPaymentModal';
import { tenantBookingAPI } from '@/lib/tenantBookingAPI';
interface TenantEnquiredPropertiesTabProps {
  enquiredProperties: MatchedProperty[];
  linkingId: number | string | null;
  onShareWhatsApp: (p: MatchedProperty) => void;
  onScheduleVisit?: (p: MatchedProperty) => void;
  onLinkProperty: (p: MatchedProperty) => void;
  onNavigateTab: (tab: string) => void;
  tenantId?: number | string;
}

export default function TenantEnquiredPropertiesTab({
  enquiredProperties: initialEnquired,
  linkingId,
  onShareWhatsApp,
  onScheduleVisit,
  onLinkProperty,
  onNavigateTab,
  tenantId,
}: TenantEnquiredPropertiesTabProps) {
  const navigate = useNavigate();
  const [enquiredList, setEnquiredList] = useState<MatchedProperty[]>(initialEnquired || []);
  const [interestsList, setInterestsList] = useState<TenantOwnerInterest[]>([]);
  const [tenantBookings, setTenantBookings] = useState<any[]>([]);
  const [loadingInterests, setLoadingInterests] = useState(false);
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [activeBookingModal, setActiveBookingModal] = useState<any | null>(null);
  const [creatingBookingId, setCreatingBookingId] = useState<number | null>(null);

  const fetchInterests = async () => {
    if (!tenantId) return;
    try {
      setLoadingInterests(true);
      const res = await tenantAPI.getTenantInterests(tenantId);
      if (res?.success && Array.isArray(res.data)) {
        setInterestsList(res.data);
      }
    } catch (e) {
      console.warn("Could not fetch tenant interests:", e);
    } finally {
      setLoadingInterests(false);
    }
  };

  const fetchBookings = async () => {
    if (!tenantId) return;
    try {
      const res = await tenantBookingAPI.getByTenantId(tenantId);
      if (res?.success && Array.isArray(res.data)) {
        setTenantBookings(res.data);
      }
    } catch (e) {
      console.warn("Could not fetch tenant bookings:", e);
    }
  };

  useEffect(() => {
    fetchInterests();
    fetchBookings();
  }, [tenantId]);

  const handleTenantResponse = async (item: TenantOwnerInterest, action: 'accept' | 'decline') => {
    if (!tenantId) return;
    setActionLoadingId(item.id);
    try {
      const res = await tenantAPI.tenantRespondConfirmation(item.id, tenantId, action);
      if (res?.success) {
        toast.success(res.message || `Interest updated: ${action}`);
        await fetchInterests();
        if (action === 'accept') {
          handleReserveAndPay(item);
        }
      } else {
        toast.error(res?.message || "Failed to update response");
      }
    } catch (err: any) {
      console.error("Error responding to interest:", err);
      toast.error(err?.response?.data?.message || "Failed to submit response");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Sync with prop changes
  React.useEffect(() => {
    setEnquiredList(initialEnquired || []);
  }, [initialEnquired]);

  // Extract unique properties for Property-wise filtering
  const propertyOptions = useMemo(() => {
    const map = new Map<string, { id: string; title: string; count: number }>();
    enquiredList.forEach((p: any) => {
      const propId = String(p.id || 'other');
      const title = p.society_name
        ? `${p.unit_type || '2 BHK'} in ${p.society_name}`
        : (p.title || `Property #${propId}`);
      if (!map.has(propId)) {
        map.set(propId, { id: propId, title, count: 1 });
      } else {
        map.get(propId)!.count++;
      }
    });
    return Array.from(map.values());
  }, [enquiredList]);

  // Filtered properties
  const filteredProperties = useMemo(() => {
    if (selectedPropertyFilter === 'all') return enquiredList;
    return enquiredList.filter((p: any) => String(p.id) === selectedPropertyFilter);
  }, [enquiredList, selectedPropertyFilter]);

  // Handle single enquiry delete
  const handleDeleteSingle = (propId: number | string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Remove this property enquiry from your list?')) return;

    setEnquiredList((prev) => prev.filter((p) => String(p.id) !== String(propId)));
    setSelectedIds((prev) => prev.filter((id) => String(id) !== String(propId)));

    // Clean up from local storage keys if stored
    try {
      const keysToClean = [
        'enquired_properties',
        'unlocked_properties',
        `tenant_enquiries_${tenantId}`,
        `unlocked_owner_${tenantId}`,
      ];
      keysToClean.forEach((k) => {
        const raw = localStorage.getItem(k);
        if (raw) {
          try {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) {
              const updated = arr.filter((item: any) => (item?.id || item) !== propId && (item?.id || item) !== Number(propId));
              localStorage.setItem(k, JSON.stringify(updated));
            }
          } catch { }
        }
      });
    } catch { }

    toast.success('Property enquiry removed');
  };

  const handleReserveAndPay = async (item: TenantOwnerInterest) => {
    if (!tenantId) return;
    setCreatingBookingId(item.id);
    try {
      const res = await tenantBookingAPI.create({
        tenant_id: tenantId,
        property_id: item.rental_property_id,
        property_title: item.society_name ? `${item.unit_type || '2 BHK'} at ${item.society_name}` : undefined,
        interest_id: item.id,
        owner_id: (item as any).owner_id,
        monthly_rent: Number(item.monthly_rent) || 0,
        token_amount: 5000, // ya jo bhi default token amount aapka hai
        move_in_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      });
      if (res?.success) {
        setActiveBookingModal(res.data);
      } else {
        toast.error(res?.message || 'Failed to reserve property');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reserve property');
    } finally {
      setCreatingBookingId(null);
    }
  };
  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Remove ${selectedIds.length} selected enquiry(s)?`)) return;

    const idsSet = new Set(selectedIds.map(String));
    setEnquiredList((prev) => prev.filter((p) => !idsSet.has(String(p.id))));
    setSelectedIds([]);

    // Clean up local storage
    try {
      const keysToClean = [
        'enquired_properties',
        'unlocked_properties',
        `tenant_enquiries_${tenantId}`,
        `unlocked_owner_${tenantId}`,
      ];
      keysToClean.forEach((k) => {
        const raw = localStorage.getItem(k);
        if (raw) {
          try {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) {
              const updated = arr.filter((item: any) => !idsSet.has(String(item?.id || item)));
              localStorage.setItem(k, JSON.stringify(updated));
            }
          } catch { }
        }
      });
    } catch { }

    toast.success(`${idsSet.size} enquiries removed successfully`);
  };

  const toggleSelect = (id: number | string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    const visibleIds = filteredProperties.map((p) => p.id).filter(Boolean);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  return (
    <div className="space-y-3.5 animate-in fade-in duration-200">

      {/* 🌟 Header Banner */}
      <div className="bg-[#0b3856] p-4 sm:p-5 rounded-2xl text-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0 shadow-inner">
            <MessageSquare size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm sm:text-base text-white">
                Enquired Rental Properties
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[9px] font-black uppercase tracking-wider">
                Direct Contacted
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Properties where you have unlocked owner contact, requested callbacks, or scheduled visits.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-xs text-right">
            <span className="text-[10px] text-slate-300 block font-medium">Active Enquiries</span>
            <span className="text-xs sm:text-sm font-black text-amber-300">{enquiredList.length} Properties</span>
          </div>
        </div>
      </div>

      {/* 🏷️ Property-Wise Filter Pills */}
      {propertyOptions.length > 1 && (
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1 pr-1 shrink-0 flex items-center gap-1">
            <Filter size={11} className="text-slate-400" /> Property Filter:
          </span>
          <button
            onClick={() => setSelectedPropertyFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer ${selectedPropertyFilter === 'all'
              ? 'bg-[#0b3856] text-white shadow-2xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
          >
            All Properties ({enquiredList.length})
          </button>
          {propertyOptions.map((prop) => (
            <button
              key={prop.id}
              onClick={() => setSelectedPropertyFilter(prop.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${selectedPropertyFilter === prop.id
                ? 'bg-[#0b3856] text-white shadow-2xs font-bold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
            >
              <span className="truncate max-w-[160px]">{prop.title}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${selectedPropertyFilter === prop.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600 font-bold'
                }`}>
                {prop.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* 🌟 0. Live Interest Requests & Owner Decisions */}
      {interestsList.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Sparkles size={14} className="text-orange-500" />
              <span>Interest Requests & Owner Decisions ({interestsList.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {interestsList.map((item) => {
              const isConfirmed = item.status === 'OWNER_CONFIRMED';
              const isOffered = item.status === 'OWNER_OFFERED';
              const isSelectedOthers = item.status === 'PROPERTY_SELECTED';
              const isAccepted = item.status === 'TENANT_ACCEPTED' || item.status === 'BOOKING_PENDING';
              const isRejected = item.status === 'OWNER_REJECTED' || item.status === 'TENANT_DECLINED';

              return (
                <div
                  key={`interest-${item.id}`}
                  className={`rounded-2xl border p-4 transition-all ${isConfirmed
                    ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-emerald-300 shadow-md ring-2 ring-emerald-400/30'
                    : isOffered
                      ? 'bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border-purple-300 shadow-md ring-2 ring-purple-400/30'
                      : isSelectedOthers
                        ? 'bg-amber-50/50 border-amber-200'
                        : isAccepted
                          ? 'bg-indigo-50/50 border-indigo-200'
                          : isRejected
                            ? 'bg-rose-50/50 border-rose-200 opacity-80'
                            : 'bg-white border-slate-200 shadow-xs'
                    }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white">
                          RENT-{item.rental_property_id}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900 truncate">
                          {item.society_name ? `${item.unit_type || '2 BHK'} at ${item.society_name}` : `Rental Property #${item.rental_property_id}`}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                          {item.match_score}% Match
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-600 flex-wrap">
                        {item.location_name && (
                          <span className="flex items-center gap-1">
                            <MapPin size={11} className="text-orange-500" />
                            {item.location_name}
                          </span>
                        )}
                        {item.monthly_rent && (
                          <span className="font-bold text-slate-900">
                            ₹{Number(item.monthly_rent).toLocaleString('en-IN')}/mo
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">
                          Requested: {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="shrink-0">
                      {isConfirmed ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white shadow-xs animate-pulse">
                          <CheckCircle size={14} />
                          <span>Owner Selected You!</span>
                        </span>
                      ) : isOffered ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-600 text-white shadow-xs animate-pulse">
                          <Sparkles size={14} />
                          <span>Owner Sent Direct Offer!</span>
                        </span>
                      ) : isSelectedOthers ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <Clock size={13} />
                          <span>Under Owner Review (Reserve Queue)</span>
                        </span>
                      ) : isAccepted ? (() => {
                        const matchingBooking = tenantBookings.find(
                          (b) => String(b.property_id) === String(item.rental_property_id) || String(b.interest_id) === String(item.id)
                        );
                        if (matchingBooking) {
                          if (matchingBooking.payment_status === 'CLAIMED') {
                            return (
                              <button
                                type="button"
                                onClick={() => setActiveBookingModal(matchingBooking)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition cursor-pointer"
                              >
                                <Clock size={13} />
                                <span>🟡 Payment Claimed — Awaiting Verification</span>
                              </button>
                            );
                          }
                          if (matchingBooking.payment_status === 'VERIFIED') {
                            return (
                              <button
                                type="button"
                                onClick={() => onNavigateTab('linked')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer"
                              >
                                <CheckCircle size={13} />
                                <span>✓ Verified — View Linked Lease</span>
                              </button>
                            );
                          }
                          return (
                            <button
                              type="button"
                              onClick={() => setActiveBookingModal(matchingBooking)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition cursor-pointer"
                            >
                              <Check size={13} />
                              <span>Complete Payment Claim</span>
                            </button>
                          );
                        }
                        return (
                          <button
                            type="button"
                            disabled={creatingBookingId === item.id}
                            onClick={() => handleReserveAndPay(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition cursor-pointer disabled:opacity-50"
                          >
                            {creatingBookingId === item.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                            <span>Reserve & Pay Token</span>
                          </button>
                        );
                      })() : isRejected ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
                          <X size={13} />
                          <span>{item.status.replace(/_/g, ' ')}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <Clock size={13} />
                          <span>Pending Owner Review</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Confirmed Action Box */}
                  {isConfirmed && (
                    <div className="mt-3 pt-3 border-t border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 p-3 rounded-xl">
                      <div className="text-xs text-emerald-950 font-medium">
                        🎉 <strong>Great news!</strong> The landlord has reviewed your profile and confirmed selection. Please accept to proceed to token reservation.
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={actionLoadingId === item.id}
                          onClick={() => handleTenantResponse(item, 'accept')}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                        >
                          {actionLoadingId === item.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                          <span>Accept Selection</span>
                        </button>
                        <button
                          type="button"
                          disabled={actionLoadingId === item.id}
                          onClick={() => handleTenantResponse(item, 'decline')}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Offered Action Box */}
                  {isOffered && (
                    <div className="mt-3 pt-3 border-t border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-50/60 p-3 rounded-xl">
                      <div className="text-xs text-purple-950 font-medium">
                        🎁 <strong>Direct Offer!</strong> Landlord has sent you a direct tenancy offer for this property. Click below to accept and reserve your unit.
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={actionLoadingId === item.id}
                          onClick={() => handleTenantResponse(item, 'accept')}
                          className="px-4 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                        >
                          {actionLoadingId === item.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                          <span>Confirm & Proceed</span>
                        </button>
                        <button
                          type="button"
                          disabled={actionLoadingId === item.id}
                          onClick={() => handleTenantResponse(item, 'decline')}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 📦 Bulk Selection & Action Bar */}
      {filteredProperties.length > 0 && (
        <div className="bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-200/90 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAllVisible}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              {filteredProperties.length > 0 && filteredProperties.every((p) => selectedIds.includes(p.id)) ? (
                <CheckSquare size={15} className="text-blue-600" />
              ) : (
                <Square size={15} className="text-slate-400" />
              )}
              <span>Select All Visible ({filteredProperties.length})</span>
            </button>
            {selectedIds.length > 0 && (
              <span className="text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                {selectedIds.length} Selected
              </span>
            )}
          </div>

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}
        </div>
      )}

      {/* 📋 Grid of Enquired Properties */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredProperties.map((p: any, idx: number) => {
            const rawPhoto = p.cover_image || p.images?.[0] || p.photos?.[0] || p.mediaItems?.[0]?.file_path;
            const photoPath = typeof rawPhoto === 'string' ? rawPhoto : (rawPhoto as any)?.url || null;
            const imgUrl = getImageUrl(photoPath);
            const price = Number(p.monthly_rent || p.expected_rent || p.price || p.rent || 0);

            const title = p.society_name
              ? `${p.unit_type || '2 BHK'} in ${p.society_name}`
              : (p.title || p.property_type_name || `Rental Unit #${p.id}`);

            const location = [p.location_name || p.locality || p.location, p.city_name || p.city].filter(Boolean).join(', ') || 'Pune';
            const bhk = p.unit_type || p.preferred_bhk || '2 BHK';
            const furnishing = p.furnishing_status || p.furnishing || 'Semi-Furnished';
            const ownerName = p.owner_name || p.owner?.name || p.seller_name || 'Landlord / Owner';

            const statusLabel = idx === 0 ? "Owner Contact Unlocked" : (idx % 2 === 0 ? "Callback Scheduled" : "Enquiry Active");
            const statusColor = idx === 0 ? "bg-emerald-50 text-emerald-800 border-emerald-200" : (idx % 2 === 0 ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-blue-50 text-blue-800 border-blue-200");
            const isSelected = selectedIds.includes(p.id);

            return (
              <div
                key={`enquired-${p.id || idx}`}
                className={`bg-white rounded-2xl border overflow-hidden transition-all flex flex-col justify-between ${isSelected ? 'border-blue-400 bg-blue-50/10 shadow-xs' : 'border-gray-200/90 shadow-2xs hover:shadow-md'
                  }`}
              >
                {/* Media Header */}
                <div className="h-36 relative bg-slate-100 overflow-hidden group">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100">
                      <Building size={36} />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Top Left Selection Checkbox & Rent ID */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {p.id && (
                      <button
                        type="button"
                        onClick={() => toggleSelect(p.id)}
                        className="w-6 h-6 rounded-md bg-slate-900/80 text-white flex items-center justify-center hover:bg-slate-900 transition-colors cursor-pointer"
                        title="Select enquiry"
                      >
                        {isSelected ? <CheckSquare size={14} className="text-blue-400" /> : <Square size={14} className="text-slate-300" />}
                      </button>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-slate-950/80 text-white font-mono font-bold text-[9px] shadow-xs">
                      RENT-{p.id}
                    </span>
                  </div>

                  {/* Top Right: Delete Icon & Status Pill */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full font-extrabold text-[9px] border shadow-xs ${statusColor}`}>
                      ● {statusLabel}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSingle(p.id, e)}
                      className="w-6 h-6 rounded-md bg-rose-600/90 hover:bg-rose-700 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                      title="Delete enquiry"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white">
                    <span className="font-black text-sm text-amber-300 drop-shadow-xs">
                      {price > 0 ? `₹${price.toLocaleString('en-IN')}/mo` : 'Contact for Rent'}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-white/20 backdrop-blur-xs text-[9px] font-semibold">
                      {bhk}
                    </span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1" title={title}>
                        {title}
                      </h4>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} className="text-orange-500 shrink-0" />
                        <span className="truncate">{location}</span>
                      </p>
                    </div>

                    {/* Features Strip */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[9px] font-bold">
                        {furnishing}
                      </span>
                      {p.carpet_area && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[9px] font-bold">
                          {p.carpet_area} sq.ft
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 text-[9px] font-bold flex items-center gap-1">
                        <ShieldCheck size={10} className="text-amber-600" />
                        <span>{ownerName}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => onShareWhatsApp(p)}
                        className="py-1.5 px-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-[10px] transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <SiWhatsapp size={11} />
                        <span>WhatsApp</span>
                      </button>
                      <button
                        onClick={() => {
                          if (onScheduleVisit) onScheduleVisit(p);
                          else onNavigateTab('visits');
                        }}
                        className="py-1.5 px-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-slate-800 font-extrabold text-[10px] transition-colors flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <CalendarDays size={11} className="text-orange-600" />
                        <span>Book Visit</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => navigate(`/rentals/${p.slug || p.id}`)}
                        className="py-1.5 px-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[10px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye size={11} />
                        <span>View Details</span>
                      </button>

                      <button
                        onClick={() => onLinkProperty(p)}
                        disabled={linkingId === p.id}
                        className="py-1.5 px-2 rounded-xl bg-[#0b3856] hover:bg-[#072438] text-white font-extrabold text-[10px] transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {linkingId === p.id ? (
                          <Loader2 className="animate-spin" size={11} />
                        ) : (
                          <>
                            <Link2 size={11} />
                            <span>Link Lease</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center text-gray-400 border border-dashed border-gray-200 rounded-2xl text-xs bg-white p-6">
          <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300 opacity-60" />
          <h4 className="font-bold text-slate-800 text-sm">No property enquiries recorded yet</h4>
          <p className="text-gray-400 text-xs mt-1 max-w-sm mx-auto mb-4">
            Browse matching properties and click "Contact Owner" or "Schedule Visit" to track your enquiries here.
          </p>
          <button
            onClick={() => onNavigateTab('matched')}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer"
          >
            Explore Matching Properties
          </button>
        </div>
      )}

      {/* 👇 YE BLOCK ADD KARO — Payment Popup */}
      {activeBookingModal && (
        <TenantBookingPaymentModal
          isOpen={!!activeBookingModal}
          onClose={() => setActiveBookingModal(null)}
          booking={activeBookingModal}
          onPaymentClaimed={(updated) => {
            setActiveBookingModal(updated);
          }}
        />
      )}
    </div>

  );
}
