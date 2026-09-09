import React from 'react';
import {
  X, Calendar, Clock, MapPin, CheckCircle2, AlertCircle, Building2,
  Users, MessageSquare, ExternalLink, XCircle, ArrowRight, Star,
  Phone, Sparkles, ShieldCheck, ChevronRight, RefreshCw, Eye
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { parseVisitDate, formatVisitTime } from './TenantSiteVisitsTab';

interface VisitHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: any;
  onReschedule?: (visit: any) => void;
  onRecordOutcome?: (visit: any) => void;
}

export default function VisitHistoryModal({
  isOpen,
  onClose,
  visit,
  onReschedule,
  onRecordOutcome,
}: VisitHistoryModalProps) {
  if (!isOpen || !visit) return null;

  const { dateStr, dayName, dayNum, monthShort } = parseVisitDate(visit.visit_date);
  const formattedTime = formatVisitTime(visit.visit_time);
  const status = visit.status || 'Scheduled';

  const isConfirmed = status === 'Confirmed' || status === 'Approved';
  const isPendingTenant = status === 'Pending Tenant Approval' || status === 'Rescheduled by Owner';
  const isPendingOwner = (status === 'Pending Owner Approval' || status === 'Pending Approval' || status === 'Scheduled' || status === 'Rescheduled by Tenant') && !isPendingTenant;
  const isPending = isPendingOwner || isPendingTenant;
  const isCompleted = status === 'Completed';
  const isDeclined = status === 'Declined' || status === 'Cancelled';
  const isMissed = status === 'Missed' || visit.missed_reason;

  // Build Chronological Timeline Events
  const timelineEvents: Array<{
    title: string;
    description: string;
    timestamp?: string;
    type: 'success' | 'warning' | 'info' | 'error' | 'default';
    icon: any;
    details?: any;
  }> = [];

  // 1. Visit Creation (Initial Booking)
  const createdAtFormatted = visit.created_at
    ? new Date(visit.created_at).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : `${dateStr}, Initial Booking`;

  timelineEvents.push({
    title: 'Site Visit Requested',
    description: `Initial booking requested for ${formattedTime} on ${dayName}, ${dateStr}.`,
    timestamp: createdAtFormatted,
    type: 'info',
    icon: Calendar,
    details: {
      'Location': visit.meeting_point || 'Property Premises',
      'Requested Slot': formattedTime,
    },
  });

  // 2. Reschedule History Logs (if present)
  let parsedReschedules: any[] = [];
  try {
    if (visit.reschedule_history) {
      parsedReschedules = typeof visit.reschedule_history === 'string'
        ? JSON.parse(visit.reschedule_history)
        : visit.reschedule_history;
    }
  } catch {}

  if (Array.isArray(parsedReschedules) && parsedReschedules.length > 0) {
    parsedReschedules.forEach((r: any) => {
      const fromTime = formatVisitTime(r.from_time || r.fromTime);
      const toTime = formatVisitTime(r.to_time || r.toTime);
      const resDate = r.timestamp || r.date || 'Slot Updated';

      timelineEvents.push({
        title: `Rescheduled to ${toTime}`,
        description: `Time adjusted: ${fromTime} ➔ ${toTime}.${r.reason ? ` Note: "${r.reason}"` : ''}`,
        timestamp: resDate,
        type: 'warning',
        icon: RefreshCw,
        details: {
          'Previous': fromTime,
          'New': toTime,
          'Reason': r.reason || r.remarks || 'Adjusted slot',
        },
      });
    });
  } else if (isPendingTenant) {
    timelineEvents.push({
      title: 'Owner Proposed New Time',
      description: `Owner requested to reschedule visit to ${formattedTime} on ${dayName}, ${dateStr}.${visit.remarks ? ` Note: "${visit.remarks}"` : ''}`,
      timestamp: visit.updated_at ? new Date(visit.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Slot Proposed',
      type: 'warning',
      icon: RefreshCw,
      details: {
        'Proposed Slot': formattedTime,
        'Proposed Date': dateStr,
        'Status': 'Awaiting Tenant Confirmation',
      },
    });
  } else if (status === 'Rescheduled by Tenant' || (isPendingOwner && visit.remarks && String(visit.remarks).toLowerCase().includes('tenant proposed'))) {
    timelineEvents.push({
      title: 'Tenant Proposed New Time',
      description: `Tenant proposed to reschedule visit to ${formattedTime} on ${dayName}, ${dateStr}.${visit.remarks ? ` Note: "${visit.remarks}"` : ''}`,
      timestamp: visit.updated_at ? new Date(visit.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Slot Proposed',
      type: 'warning',
      icon: RefreshCw,
      details: {
        'Proposed Slot': formattedTime,
        'Proposed Date': dateStr,
        'Status': 'Awaiting Owner Confirmation',
      },
    });
  } else if (visit.remarks && String(visit.remarks).toLowerCase().includes('rescheduled')) {
    timelineEvents.push({
      title: 'Visit Rescheduled',
      description: String(visit.remarks),
      timestamp: 'Slot Updated',
      type: 'warning',
      icon: RefreshCw,
    });
  }

  // 3. Confirmation Status
  if (isConfirmed || isCompleted) {
    timelineEvents.push({
      title: 'Confirmed by Owner',
      description: 'Owner confirmed appointment and arranged property access.',
      timestamp: visit.confirmed_at || 'Confirmed',
      type: 'success',
      icon: CheckCircle2,
      details: {
        'Owner': visit.owner_name || 'Property Owner',
      },
    });
  }

  // 4. Completion / Outcome & Feedback
  if (isCompleted) {
    timelineEvents.push({
      title: 'Visit Completed',
      description: visit.feedback || 'Site inspection concluded successfully.',
      timestamp: visit.completed_at || `${dateStr}`,
      type: 'success',
      icon: Star,
      details: {
        'Rating': visit.rating ? `${visit.rating} / 5 Stars` : '5 / 5 Stars',
        'Feedback': visit.feedback || 'Visit completed',
      },
    });
  } else if (isMissed) {
    timelineEvents.push({
      title: 'Visit Missed',
      description: visit.missed_reason || 'Visit could not take place.',
      timestamp: `${dateStr}`,
      type: 'error',
      icon: XCircle,
      details: {
        'Reason': visit.missed_reason || 'Unavailable',
      },
    });
  } else if (isDeclined) {
    timelineEvents.push({
      title: 'Visit Cancelled / Declined',
      description: visit.cancellation_reason || 'Visit was declined.',
      timestamp: 'Cancelled',
      type: 'error',
      icon: XCircle,
    });
  }

  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${visit.property_title || ''} ${visit.meeting_point || ''} ${visit.location_name || ''} ${visit.city_name || ''}`.trim() || 'Property Location'
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* 🌟 Compact Header */}
        <div className="bg-gradient-to-r from-[#0b3856] via-[#104369] to-[#1a5b8c] text-white p-3 sm:p-3.5 relative">
          <button
            onClick={onClose}
            className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X size={13} />
          </button>

          <div className="flex items-center gap-1.5 mb-1">
            <span className="px-2 py-0.2 rounded-full bg-white/15 backdrop-blur-md text-orange-300 font-bold text-[9.5px] border border-white/20 flex items-center gap-1">
              <Sparkles size={9} className="text-orange-400" />
              <span>Visit History Audit</span>
            </span>
            {visit.rental_property_id && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-white font-mono font-bold text-[9px]">
                RENT-{visit.rental_property_id}
              </span>
            )}
          </div>

          <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-snug truncate pr-6">
            {visit.property_title || visit.rental_property_title || 'Property Site Inspection'}
          </h3>

          <div className="flex items-center gap-2 text-[11px] text-slate-200 mt-0.5 flex-wrap">
            <span className="flex items-center gap-1 font-bold text-white">
              <Clock size={11} className="text-orange-300" />
              <span>{formattedTime}</span>
            </span>
            <span>•</span>
            <span className="text-slate-200">{dayName}, {dateStr}</span>
            {visit.monthly_rent && (
              <>
                <span>•</span>
                <span className="text-orange-200 font-extrabold">
                  ₹{Number(visit.monthly_rent).toLocaleString('en-IN')}/mo
                </span>
              </>
            )}
          </div>
        </div>

        {/* 📋 Compact Scrollable Body */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-3.5 text-[11px]">
          
          {/* Quick Info Compact Grid */}
          <div className="grid grid-cols-3 gap-1.5">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
              <div className="flex items-center gap-1 pt-0.5 truncate">
                {isConfirmed && <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />}
                {isCompleted && <Star size={11} className="text-blue-600 shrink-0" />}
                {isPending && <Clock size={11} className="text-amber-600 shrink-0" />}
                {isDeclined && <XCircle size={11} className="text-rose-600 shrink-0" />}
                <span className="font-bold text-[10.5px] text-slate-800 truncate">{status}</span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Location</span>
              <p className="font-bold text-[10.5px] text-slate-800 truncate pt-0.5 flex items-center gap-0.5">
                <MapPin size={10} className="text-orange-500 shrink-0" />
                <span className="truncate">{visit.meeting_point || 'Property Site'}</span>
              </p>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Contact</span>
              <div className="flex items-center justify-between pt-0.5">
                <span className="font-bold text-[10.5px] text-slate-800 truncate">
                  {visit.owner_name || visit.tenant_name || 'Contact'}
                </span>
                {(visit.owner_phone || visit.tenant_phone) && (
                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={`https://wa.me/91${String(visit.owner_phone || visit.tenant_phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, regarding the visit for ${visit.property_title || 'the property'}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-0.5 rounded text-emerald-600 hover:text-emerald-700"
                      title="WhatsApp"
                    >
                      <SiWhatsapp size={11} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Feedback Spotlight (if recorded) */}
          {visit.feedback && (
            <div className="p-2.5 rounded-lg bg-emerald-50/90 border border-emerald-200 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                  <Star size={10} className="text-amber-500 fill-amber-500" /> Feedback
                </span>
                {visit.rating && (
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={10}
                        className={star <= Number(visit.rating) ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}
                      />
                    ))}
                  </div>
                )}
              </div>
              <p className="text-[10.5px] text-emerald-950 font-medium italic">
                "{visit.feedback}"
              </p>
            </div>
          )}

          {/* ⏳ Chronological Compact Timeline */}
          <div>
            <h4 className="text-[10.5px] font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Clock size={11} className="text-blue-600" />
              <span>Timeline Trail</span>
            </h4>

            <div className="relative pl-4 space-y-2.5 before:absolute before:left-1.5 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-slate-200">
              {timelineEvents.map((ev, index) => {
                const IconComponent = ev.icon;

                const colorStyles = {
                  success: 'bg-emerald-500 text-white ring-emerald-100',
                  warning: 'bg-amber-500 text-white ring-amber-100',
                  error: 'bg-rose-500 text-white ring-rose-100',
                  info: 'bg-blue-500 text-white ring-blue-100',
                  default: 'bg-slate-500 text-white ring-slate-100',
                }[ev.type];

                return (
                  <div key={index} className="relative group">
                    {/* Circle Dot */}
                    <div
                      className={`absolute -left-4 top-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center ring-2 shadow-2xs ${colorStyles}`}
                    >
                      <IconComponent size={7} />
                    </div>

                    {/* Compact Box */}
                    <div className="bg-slate-50/80 hover:bg-slate-50 p-2 rounded-lg border border-slate-200/80 transition-all space-y-0.5">
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <span className="font-extrabold text-[11px] text-slate-900">
                          {ev.title}
                        </span>
                        {ev.timestamp && (
                          <span className="text-[9px] font-semibold text-slate-400">
                            {ev.timestamp}
                          </span>
                        )}
                      </div>

                      <p className="text-[10.5px] text-slate-600 leading-snug">
                        {ev.description}
                      </p>

                      {ev.details && (
                        <div className="mt-1 pt-1 border-t border-slate-200/60 flex items-center gap-3 text-[10px] text-slate-600 flex-wrap">
                          {Object.entries(ev.details).map(([k, v]) => (
                            <span key={k}>
                              <span className="text-slate-400 font-bold">{k}: </span>
                              <span className="font-semibold text-slate-800">{String(v)}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* 🧭 Compact Footer Actions */}
        <div className="p-2.5 sm:p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-1.5 flex-wrap">
          <a
            href={mapSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10.5px] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
          >
            <MapPin size={11} className="text-orange-500" />
            <span>Map Directions</span>
            <ExternalLink size={9} className="text-slate-400" />
          </a>

          <div className="flex items-center gap-1.5">
            {onReschedule && isPending && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReschedule(visit);
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-[10.5px] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw size={10} className="text-amber-700" />
                <span>Reschedule</span>
              </button>
            )}

            {onRecordOutcome && isConfirmed && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRecordOutcome(visit);
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
              >
                <Star size={10} />
                <span>Feedback</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[10.5px] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
