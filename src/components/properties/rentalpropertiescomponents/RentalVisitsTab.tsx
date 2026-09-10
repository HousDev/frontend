import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar, Clock, MapPin, Phone, User, CheckCircle2,
  XCircle, Plus, Loader2, Trash2, Check, X, RefreshCw
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { toast } from 'react-toastify';
import { tenantVisitAPI } from '@/lib/tenantVisitAPI';
import { parseVisitDate, formatVisitTime } from '@/components/owner-account/OwnerVisitsTab';

const N = "#0b3856";
const O = "#e67e22";

interface RentalVisitsTabProps {
  property: any;
  onScheduleVisit: () => void;
}

const RentalVisitsTab: React.FC<RentalVisitsTabProps> = ({
  property,
  onScheduleVisit
}) => {
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const [actionLoadingId, setActionLoadingId] = useState<number | string | null>(null);

  // Delete modal state
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    visitId: number | string;
    tenantName?: string;
  } | null>(null);

  const fetchVisits = async () => {
    if (!property?.id) return;
    setLoading(true);
    try {
      const res = await tenantVisitAPI.getAll({ rentalPropertyId: property.id });
      if (res && res.data) {
        setVisits(res.data);
      } else if (Array.isArray(property.tenant_visits)) {
        setVisits(property.tenant_visits);
      }
    } catch (err) {
      console.warn('Note loading rental visits:', err);
      if (Array.isArray(property.tenant_visits)) {
        setVisits(property.tenant_visits);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [property?.id]);

  const handleUpdateStatus = async (visitId: number | string, newStatus: string) => {
    setActionLoadingId(visitId);
    try {
      await tenantVisitAPI.update(visitId, { status: newStatus });
      setVisits((prev) =>
        prev.map((v) => (v.id === visitId ? { ...v, status: newStatus } : v))
      );
      toast.success(`Visit status updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update visit status:', err);
      toast.error('Failed to update visit status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleExecuteDelete = async () => {
    if (!deleteConfirmModal) return;
    const { visitId } = deleteConfirmModal;
    setActionLoadingId(visitId);
    try {
      await tenantVisitAPI.delete(visitId);
      setVisits((prev) => prev.filter((v) => v.id !== visitId));
      toast.success('Site visit record deleted');
    } catch (err) {
      console.error('Failed to delete visit:', err);
      toast.error('Failed to delete visit');
    } finally {
      setActionLoadingId(null);
      setDeleteConfirmModal(null);
    }
  };

  const filteredVisits = useMemo(() => {
    return visits.filter((v) => {
      const status = v.status || 'Scheduled';
      const isPending = status === 'Pending Owner Approval' || status === 'Pending Approval' || status === 'Scheduled';
      const isConfirmed = status === 'Confirmed' || status === 'Approved';
      const isCompleted = status === 'Completed';

      if (filter === 'pending') return isPending;
      if (filter === 'confirmed') return isConfirmed;
      if (filter === 'completed') return isCompleted;
      return true;
    });
  }, [visits, filter]);

  const pendingCount = visits.filter((v) => {
    const s = v.status || 'Scheduled';
    return s === 'Pending Owner Approval' || s === 'Pending Approval' || s === 'Scheduled';
  }).length;

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">Tenant Site Visits & Inspections</h3>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-black text-[8.5px] uppercase tracking-wider animate-pulse">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-500">Track and schedule prospective tenant property walkthroughs</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchVisits}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            title="Refresh Visits"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={onScheduleVisit}
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg text-white flex items-center gap-1.5 shadow-2xs cursor-pointer transition hover:opacity-95"
            style={{ background: N }}
          >
            <Plus size={14} />
            <span>Schedule Tenant Visit</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 w-fit">
        {[
          { id: 'all', label: `All (${visits.length})` },
          { id: 'pending', label: `Pending (${pendingCount})` },
          { id: 'confirmed', label: 'Confirmed' },
          { id: 'completed', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id as any)}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filter === tab.id
                ? 'bg-[#0b3856] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Visits List */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Loader2 size={24} className="animate-spin mx-auto text-blue-600 mb-2" />
          <p className="text-xs text-slate-500 font-medium">Loading scheduled visits...</p>
        </div>
      ) : filteredVisits.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-10 text-center space-y-2">
          <Calendar size={32} className="mx-auto text-slate-300 opacity-60" />
          <h4 className="text-xs sm:text-sm font-bold text-slate-800">No visits scheduled</h4>
          <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
            When tenants schedule a site visit on this rental listing, the appointments will appear here with full details.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredVisits.map((v: any, idx: number) => {
            const { dateObj, dateStr, dayName, dayNum, monthShort } = parseVisitDate(v.visit_date);
            const formattedTime = formatVisitTime(v.visit_time);
            const status = v.status || 'Scheduled';
            const isConfirmed = status === 'Confirmed' || status === 'Approved';
            const isPending = status === 'Pending Owner Approval' || status === 'Pending Approval' || status === 'Scheduled';
            const isCompleted = status === 'Completed';
            const isCancelled = status === 'Cancelled' || status === 'Declined';
            const isLoading = actionLoadingId === v.id;

            return (
              <div
                key={v.id || idx}
                className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition shadow-2xs"
              >
                {/* Left info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl border flex flex-col items-center justify-center shrink-0 ${
                      isPending
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : isConfirmed || isCompleted
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-blue-50 border-blue-200 text-blue-800'
                    }`}
                  >
                    <span className="text-xs font-black leading-tight">{dayNum}</span>
                    <span className="text-[8.5px] font-bold uppercase leading-none">{monthShort}</span>
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-xs sm:text-[13px] text-slate-900 truncate">
                        {v.tenant_name || 'Prospective Tenant'}
                      </h4>
                      <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold text-[9px] flex items-center gap-0.5">
                        <Clock size={9} />
                        <span>{formattedTime}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10.5px] text-slate-500 flex-wrap">
                      <span>{dayName}, {dateStr}</span>
                      {v.meeting_point && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <MapPin size={9} />
                            <span>{v.meeting_point}</span>
                          </span>
                        </>
                      )}
                    </div>

                    {v.remarks && (
                      <p className="text-[10px] text-slate-500 italic truncate max-w-md">"{v.remarks}"</p>
                    )}

                    <div className="pt-0.5">
                      {isPending ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold text-[8.5px] border border-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>Pending Approval</span>
                        </span>
                      ) : isConfirmed ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold text-[8.5px] border border-emerald-300">
                          <CheckCircle2 size={9} className="text-emerald-600" />
                          <span>Confirmed</span>
                        </span>
                      ) : isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold text-[8.5px] border border-blue-300">
                          <CheckCircle2 size={9} className="text-blue-600" />
                          <span>Completed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold text-[8.5px] border border-rose-300">
                          <XCircle size={9} className="text-rose-600" />
                          <span>Cancelled</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right action buttons */}
                <div className="flex items-center gap-1.5 shrink-0 justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {isPending && (
                    <>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleUpdateStatus(v.id, 'Confirmed')}
                        className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold transition flex items-center gap-1 shadow-2xs cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                        <span>Confirm</span>
                      </button>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleUpdateStatus(v.id, 'Cancelled')}
                        className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition flex items-center gap-0.5 cursor-pointer disabled:opacity-50"
                      >
                        <X size={11} />
                        <span>Decline</span>
                      </button>
                    </>
                  )}

                  {v.tenant_phone && (
                    <>
                      <a
                        href={`https://wa.me/91${String(v.tenant_phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${v.tenant_name || 'Tenant'}, regarding your site visit for ${property.society_name || property.location || 'the property'} on ${dateStr} at ${formattedTime}.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <SiWhatsapp size={11} />
                        <span>WhatsApp</span>
                      </a>
                      <a
                        href={`tel:${v.tenant_phone}`}
                        className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer border border-slate-200"
                        title="Call Tenant"
                      >
                        <Phone size={11} />
                      </a>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => setDeleteConfirmModal({ isOpen: true, visitId: v.id, tenantName: v.tenant_name })}
                    className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Delete visit"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🗑️ Delete Confirmation Modal */}
      {deleteConfirmModal && deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
                <Trash2 size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">Delete Site Visit Record?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to permanently delete the scheduled visit for {deleteConfirmModal.tenantName || 'this tenant'}? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal(null)}
                className="px-3.5 py-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-slate-800 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(actionLoadingId)}
                onClick={handleExecuteDelete}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {actionLoadingId && <Loader2 size={12} className="animate-spin" />}
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalVisitsTab;
