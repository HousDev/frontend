import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar, Clock, MapPin, Phone, Building2, User,
  CheckCircle2, AlertCircle, XCircle, ChevronRight, ExternalLink,
  Check, X, Loader2, Bell, Star, MessageSquare, PhoneCall, Copy, Shield,
  ArrowRight, Sparkles, CheckCheck, Trash2, CheckSquare, Square, RefreshCw, Eye, History,
  Filter, Search
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { toast } from 'react-toastify';
import { tenantVisitAPI } from '@/lib/tenantVisitAPI';
import VisitHistoryModal from '../tenant-account/VisitHistoryModal';

// Helper for exact date parsing in local timezone (IST) without 1-day UTC drift
export function parseVisitDate(val: any): { dateObj: Date; dateStr: string; dayName: string; dayNum: number; monthShort: string; ymd: string } {
  const now = new Date();
  if (!val) {
    const yr = now.getFullYear();
    const mo = String(now.getMonth() + 1).padStart(2, '0');
    const da = String(now.getDate()).padStart(2, '0');
    return {
      dateObj: now,
      dateStr: now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      dayName: 'Today',
      dayNum: now.getDate(),
      monthShort: now.toLocaleString('en-IN', { month: 'short' }),
      ymd: `${yr}-${mo}-${da}`,
    };
  }

  let d: Date | null = null;
  if (val instanceof Date) {
    d = val;
  } else {
    const s = String(val).trim();
    if (s.includes('T') || s.endsWith('Z')) {
      // ISO format e.g. "2026-09-08T18:30:00.000Z" -> converts properly to local 9 Sept
      d = new Date(s);
    } else if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) {
      const parts = s.split('-');
      d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(s)) {
      const parts = s.split('-');
      d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
      const parts = s.split('/');
      d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    } else {
      d = new Date(s);
    }
  }

  if (!d || isNaN(d.getTime())) {
    d = new Date();
  }

  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  const ymd = `${yr}-${mo}-${da}`;

  const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' });
  const dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const dayNum = d.getDate();
  const monthShort = d.toLocaleString('en-IN', { month: 'short' });

  return { dateObj: d, dateStr, dayName, dayNum, monthShort, ymd };
}

// Helper to format visit time (e.g. 19:00:00 -> 7:00 PM, 11:00:00 -> 11:00 AM)
export function formatVisitTime(timeStr: string | null | undefined): string {
  if (!timeStr) return '11:00 AM';
  const clean = String(timeStr).trim();
  if (clean.toUpperCase().includes('AM') || clean.toUpperCase().includes('PM')) {
    return clean;
  }
  const match = clean.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }
  return clean;
}

// Helper to safely format time to 24h HH:MM:SS for MySQL
export function formatTo24h(timeStr: string): string {
  if (!timeStr) return '11:00:00';
  const clean = String(timeStr).trim();
  if (/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(clean)) {
    return clean.length === 5 ? `${clean}:00` : clean;
  }
  const match = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)?$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2] || '00';
    const ampm = (match[3] || '').toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}:00`;
  }
  return '11:00:00';
}

// Helper to accurately parse visit date and time into a Date object in local timezone
export function parseVisitDateTime(dateInput: any, timeInput: any): Date | null {
  if (!dateInput) return null;
  try {
    const parsed = parseVisitDate(dateInput);
    if (!parsed || !parsed.dateObj || isNaN(parsed.dateObj.getTime())) return null;

    const year = parsed.dateObj.getFullYear();
    const month = parsed.dateObj.getMonth();
    const day = parsed.dateObj.getDate();

    if (!year || year < 2000) return null;

    let hours = 11;
    let mins = 0;
    const timeStr = String(timeInput || '11:00 AM').trim();

    // Match first time pattern (supports 12h/24h, dots/colons, ranges like "04:10 PM - 04:30 PM")
    const timeMatch = timeStr.match(/(\d{1,2})[:.](\d{2})(?::\d{2})?\s*(AM|PM)?/i);

    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const m = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3] ? timeMatch[3].toUpperCase() : null;

      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      hours = h;
      mins = m;
    }

    return new Date(year, month, day, hours, mins, 0, 0);
  } catch {
    return null;
  }
}

// Helper to check if a visit's scheduled time has passed and needs completion confirmation
export function checkPastPendingVisit(visits: any[], bufferMinutes = 0): any | null {
  if (!Array.isArray(visits) || visits.length === 0) return null;
  const now = new Date();

  for (const v of visits) {
    const st = String(v.status || '').trim().toLowerCase();
    if (st.includes('complete') || st.includes('cancel') || st.includes('decline') || st.includes('missed')) {
      continue;
    }

    if (bufferMinutes > 0 && sessionStorage.getItem(`dismissed_visit_feedback_${v.id}`)) {
      continue;
    }

    if (!v.visit_date) continue;

    try {
      const visitDateObj = parseVisitDateTime(v.visit_date, v.visit_time);
      if (!visitDateObj) continue;

      const triggerTimestamp = visitDateObj.getTime() + (bufferMinutes * 60 * 1000);

      if (now.getTime() >= triggerTimestamp) {
        return v;
      }
    } catch (err) {
      console.warn('Error checking visit time for completion prompt:', err);
    }
  }
  return null;
}

interface OwnerVisitsTabProps {
  visits: any[];
  ownerName?: string;
  onRefreshVisits?: () => void;
}

export const OwnerVisitsTab: React.FC<OwnerVisitsTabProps> = ({
  visits: initialVisits,
  ownerName = 'Owner',
  onRefreshVisits,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'upcoming' | 'completed'>('all');
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState<string>('all');
  const [visitsList, setVisitsList] = useState<any[]>(initialVisits || []);
  const [actionLoadingId, setActionLoadingId] = useState<number | string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number | string>>(new Set());
  const [deletingId, setDeletingId] = useState<number | string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState<boolean>(false);

  // Completion / Missed Reason Modal State
  const [activeFeedbackVisit, setActiveFeedbackVisit] = useState<any | null>(null);
  const [completionStatus, setCompletionStatus] = useState<'Completed' | 'Missed' | 'Rescheduled'>('Completed');
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleTime, setRescheduleTime] = useState<string>('11:00 AM');
  const [isFeedbackCustomTimeMode, setIsFeedbackCustomTimeMode] = useState<boolean>(false);
  const [feedbackCustomTime, setFeedbackCustomTime] = useState<string>('');
  const [missedReason, setMissedReason] = useState<string>('Tenant did not show up');
  const [customMissedNote, setCustomMissedNote] = useState<string>('');
  const [visitRating, setVisitRating] = useState<number>(5);
  const [visitFeedbackText, setVisitFeedbackText] = useState<string>('');
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);
  const [selectedTenantVisitModal, setSelectedTenantVisitModal] = useState<any | null>(null);

  // 🎛️ Slide-Over Drawer Filter State (Specific for Site Visits)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);
  const [drawerProperty, setDrawerProperty] = useState<string>('All');
  const [drawerStatus, setDrawerStatus] = useState<string>('All');
  const [drawerTimeSlot, setDrawerTimeSlot] = useState<string>('All');
  const [drawerFromDate, setDrawerFromDate] = useState<string>('');
  const [drawerToDate, setDrawerToDate] = useState<string>('');
  const [drawerIgnoreDate, setDrawerIgnoreDate] = useState<boolean>(true);

  const [appliedFilters, setAppliedFilters] = useState<{
    property: string;
    status: string;
    timeSlot: string;
    fromDate: string;
    toDate: string;
    ignoreDate: boolean;
  }>({
    property: 'All',
    status: 'All',
    timeSlot: 'All',
    fromDate: '',
    toDate: '',
    ignoreDate: true,
  });

  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (appliedFilters.property !== 'All') c++;
    if (appliedFilters.status !== 'All') c++;
    if (appliedFilters.timeSlot !== 'All') c++;
    if (!appliedFilters.ignoreDate && (appliedFilters.fromDate || appliedFilters.toDate)) c++;
    return c;
  }, [appliedFilters]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      property: drawerProperty,
      status: drawerStatus,
      timeSlot: drawerTimeSlot,
      fromDate: drawerFromDate,
      toDate: drawerToDate,
      ignoreDate: drawerIgnoreDate,
    });
    setIsFilterDrawerOpen(false);
    toast.info('Visit filters applied');
  };

  const handleResetFilters = () => {
    setDrawerProperty('All');
    setDrawerStatus('All');
    setDrawerTimeSlot('All');
    setDrawerFromDate('');
    setDrawerToDate('');
    setDrawerIgnoreDate(true);
    setAppliedFilters({
      property: 'All',
      status: 'All',
      timeSlot: 'All',
      fromDate: '',
      toDate: '',
      ignoreDate: true,
    });
    toast.info('Visit filters reset');
  };

  // Full History Modal State
  const [viewingHistoryVisit, setViewingHistoryVisit] = useState<any | null>(null);

  // Sync if prop updates
  React.useEffect(() => {
    setVisitsList(initialVisits || []);
  }, [initialVisits]);

  // Configuration for buffer time after visit (Set to 5 minutes for testing as requested; change to 60 for 1 hour in prod)
  const VISIT_FEEDBACK_BUFFER_MINUTES = 5;

  // Auto-detect and open completion feedback modal when a scheduled visit has passed by at least 5 minutes
  React.useEffect(() => {
    if (!activeFeedbackVisit && visitsList.length > 0) {
      const pastVisit = checkPastPendingVisit(visitsList, VISIT_FEEDBACK_BUFFER_MINUTES);
      if (pastVisit) {
        const timer = setTimeout(() => {
          setActiveFeedbackVisit(pastVisit);
          setCompletionStatus('Completed');
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [visitsList, activeFeedbackVisit]);

  // Distinct properties list for property-wise filtering
  const distinctProperties = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    visitsList.forEach((v) => {
      const pId = String(v.rental_property_id || 'other');
      const pName = v.rental_property_society || v.property_title || `Property #${pId}`;
      if (!map.has(pId)) {
        map.set(pId, { id: pId, name: pName, count: 0 });
      }
      map.get(pId)!.count += 1;
    });
    return Array.from(map.values());
  }, [visitsList]);

  const handleUpdateStatus = async (visitId: number | string, newStatus: string, tenantName: string) => {
    setActionLoadingId(visitId);
    try {
      await tenantVisitAPI.update(visitId, { status: newStatus });
      setVisitsList((prev) =>
        prev.map((v) => (v.id === visitId ? { ...v, status: newStatus } : v))
      );
      if (newStatus === 'Confirmed') {
        toast.success(`🎉 Visit confirmed for ${tenantName || 'tenant'}!`);
      } else if (newStatus === 'Cancelled') {
        toast.info(`Visit request declined.`);
      } else {
        toast.success(`Visit status updated to ${newStatus}`);
      }
      onRefreshVisits?.();
    } catch (err) {
      console.error('Failed to update visit status:', err);
      toast.error('Failed to update visit status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    type: 'single' | 'bulk';
    visitId?: number | string;
    tenantName?: string;
    count?: number;
  } | null>(null);

  const handleDeleteSinglePrompt = (visitId: number | string, tenantName: string) => {
    setDeleteConfirmModal({
      isOpen: true,
      type: 'single',
      visitId,
      tenantName: tenantName || 'Tenant',
    });
  };

  const handleBulkDeletePrompt = () => {
    if (selectedIds.size === 0) return;
    setDeleteConfirmModal({
      isOpen: true,
      type: 'bulk',
      count: selectedIds.size,
    });
  };

  const handleExecuteDelete = async () => {
    if (!deleteConfirmModal) return;

    if (deleteConfirmModal.type === 'single' && deleteConfirmModal.visitId) {
      const visitId = deleteConfirmModal.visitId;
      setDeletingId(visitId);
      try {
        await tenantVisitAPI.delete(visitId);
        setVisitsList((prev) => prev.filter((v) => v.id !== visitId));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(visitId);
          return next;
        });
        toast.success('Site visit record deleted');
        onRefreshVisits?.();
      } catch (err) {
        console.error('Failed to delete visit:', err);
        toast.error('Failed to delete visit');
      } finally {
        setDeletingId(null);
        setDeleteConfirmModal(null);
      }
    } else if (deleteConfirmModal.type === 'bulk') {
      setBulkDeleting(true);
      try {
        const idsArray = Array.from(selectedIds);
        await tenantVisitAPI.bulkDelete(idsArray);
        setVisitsList((prev) => prev.filter((v) => !selectedIds.has(v.id)));
        setSelectedIds(new Set());
        toast.success(`${idsArray.length} site visit records deleted`);
        onRefreshVisits?.();
      } catch (err) {
        console.error('Failed to bulk delete visits:', err);
        toast.error('Failed to bulk delete visits');
      } finally {
        setBulkDeleting(false);
        setDeleteConfirmModal(null);
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredVisits.length) {
      setSelectedIds(new Set());
    } else {
      const next = new Set<number | string>();
      filteredVisits.forEach((v) => next.add(v.id));
      setSelectedIds(next);
    }
  };

  const handleToggleSelect = (id: number | string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openRescheduleModal = (v: any) => {
    setActiveFeedbackVisit(v);
    setCompletionStatus('Rescheduled');
    const parsed = parseVisitDate(v.visit_date);
    const now = new Date();
    const nextDate = parsed.dateObj < now ? new Date(Date.now() + 86400000) : parsed.dateObj;
    const yr = nextDate.getFullYear();
    const mo = String(nextDate.getMonth() + 1).padStart(2, '0');
    const da = String(nextDate.getDate()).padStart(2, '0');
    setRescheduleDate(`${yr}-${mo}-${da}`);
    setRescheduleTime(formatVisitTime(v.visit_time) || '11:00 AM');
    setIsFeedbackCustomTimeMode(false);
    setFeedbackCustomTime('');
    setVisitFeedbackText('');
  };

  const handleSaveVisitFeedback = async () => {
    if (!activeFeedbackVisit) return;
    setSubmittingFeedback(true);
    try {
      const finalTime = completionStatus === 'Rescheduled' && isFeedbackCustomTimeMode && feedbackCustomTime ? feedbackCustomTime : rescheduleTime;
      const proposedDateStr = rescheduleDate ? parseVisitDate(rescheduleDate).dateStr : parseVisitDate(activeFeedbackVisit.visit_date).dateStr;
      const proposedTimeFormatted = formatVisitTime(finalTime || activeFeedbackVisit.visit_time);
      const noteText = visitFeedbackText.trim();

      const payload: any = {
        status: completionStatus === 'Rescheduled' ? 'Pending Tenant Approval' : completionStatus,
        rating: completionStatus === 'Completed' ? visitRating : null,
        feedback: completionStatus === 'Completed' ? (visitFeedbackText.trim() || 'Visit completed successfully') : null,
        missed_reason: completionStatus === 'Missed' ? (customMissedNote.trim() || missedReason) : null,
        visit_date: completionStatus === 'Rescheduled' && rescheduleDate ? rescheduleDate : undefined,
        visit_time: completionStatus === 'Rescheduled' && finalTime ? formatTo24h(finalTime) : undefined,
        remarks: completionStatus === 'Rescheduled'
          ? (noteText ? `Owner proposed: ${proposedDateStr} at ${proposedTimeFormatted} (${noteText})` : `Owner proposed new slot: ${proposedDateStr} at ${proposedTimeFormatted}`)
          : undefined,
      };

      await tenantVisitAPI.update(activeFeedbackVisit.id, payload);
      setVisitsList((prev) =>
        prev.map((v) => (v.id === activeFeedbackVisit.id ? { ...v, ...payload } : v))
      );

      toast.success(
        completionStatus === 'Completed'
          ? 'Visit marked as Completed!'
          : completionStatus === 'Rescheduled'
          ? `Proposed new slot sent to tenant for approval!`
          : 'Visit outcome saved.'
      );
      setActiveFeedbackVisit(null);
      setIsFeedbackCustomTimeMode(false);
      setFeedbackCustomTime('');
      onRefreshVisits?.();
    } catch (err) {
      console.error('Failed to submit visit feedback:', err);
      toast.error('Failed to update visit record');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // 2-Hour Visit Reminder calculation
  const upcomingTwoHourVisits = useMemo(() => {
    const now = new Date();

    return visitsList.filter((v) => {
      const parsed = parseVisitDate(v.visit_date);
      const isToday = parsed.dateObj.toDateString() === now.toDateString();
      if (!isToday) return false;
      const status = v.status || 'Scheduled';
      if (status === 'Cancelled' || status === 'Completed' || status === 'Missed' || status === 'Declined') return false;

      // Check visit time within ~2.5 hours
      const timeStr = String(v.visit_time || '').trim();
      const match = timeStr.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2] || '0', 10);
        const ampm = (match[3] || '').toUpperCase();
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;

        const visitDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
        const diffMs = visitDateTime.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        return diffHours >= -0.5 && diffHours <= 2.5;
      }
      return false;
    });
  }, [visitsList]);

  // Smart Post-Visit Auto Prompt (Triggers once visit time + 5min buffer has passed)
  useEffect(() => {
    if (activeFeedbackVisit) return;
    const candidate = checkPastPendingVisit(visitsList, 5) || checkPastPendingVisit(visitsList, 0);
    if (candidate) {
      const timer = setTimeout(() => {
        setActiveFeedbackVisit(candidate);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [visitsList, activeFeedbackVisit]);

  const filteredVisits = useMemo(() => {
    const yr = new Date().getFullYear();
    const mo = String(new Date().getMonth() + 1).padStart(2, '0');
    const da = String(new Date().getDate()).padStart(2, '0');
    const todayStr = `${yr}-${mo}-${da}`;

    return visitsList.filter((v) => {
      const parsed = parseVisitDate(v.visit_date);
      const vDateStr = parsed.ymd;
      const status = v.status || 'Scheduled';
      const isPending = status.includes('Pending') || status === 'Scheduled' || status.includes('Rescheduled');

      const matchFilter =
        filter === 'all' ||
        (filter === 'pending' && isPending) ||
        (filter === 'upcoming' && vDateStr >= todayStr && status !== 'Cancelled' && status !== 'Declined' && status !== 'Completed') ||
        (filter === 'completed' && (vDateStr < todayStr || status === 'Completed' || status === 'Missed'));

      const pId = String(v.rental_property_id || 'other');
      const matchProp = selectedPropertyFilter === 'all' || pId === selectedPropertyFilter;

      // Drawer Filter checks (Site Visit Specific)
      if (appliedFilters.property !== 'All') {
        if (pId !== appliedFilters.property) return false;
      }

      if (appliedFilters.status !== 'All') {
        if (!status.toLowerCase().includes(appliedFilters.status.toLowerCase())) return false;
      }

      if (appliedFilters.timeSlot !== 'All') {
        const timeStr = String(v.visit_time || '').trim().toLowerCase();
        let hour = 11;
        const m = timeStr.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?/i);
        if (m) {
          let h = parseInt(m[1], 10);
          const ampm = (m[3] || '').toUpperCase();
          if (ampm === 'PM' && h < 12) h += 12;
          if (ampm === 'AM' && h === 12) h = 0;
          hour = h;
        }
        if (appliedFilters.timeSlot === 'Morning' && (hour < 8 || hour >= 12)) return false;
        if (appliedFilters.timeSlot === 'Afternoon' && (hour < 12 || hour >= 16)) return false;
        if (appliedFilters.timeSlot === 'Evening' && (hour < 16 || hour > 21)) return false;
      }

      // Date Range Filter (if Ignore Date is unchecked)
      if (!appliedFilters.ignoreDate) {
        if (appliedFilters.fromDate && vDateStr < appliedFilters.fromDate) return false;
        if (appliedFilters.toDate && vDateStr > appliedFilters.toDate) return false;
      }

      return matchFilter && matchProp;
    });
  }, [visitsList, filter, selectedPropertyFilter, appliedFilters]);

  const pendingCount = useMemo(() => {
    return visitsList.filter((v) => {
      const status = v.status || 'Scheduled';
      return status.includes('Pending') || status === 'Scheduled' || status.includes('Rescheduled');
    }).length;
  }, [visitsList]);

  return (
    <div className="space-y-3.5 animate-in fade-in duration-200">
      
      {/* 🔔 2-Hour Visit Reminder Banner */}
      {upcomingTwoHourVisits.length > 0 && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-900 via-[#0b3856] to-slate-900 text-white shadow-sm border border-blue-700/80 space-y-2 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Bell size={12} /> 2-Hour Site Visit Alert
              </span>
            </div>
            <span className="text-[9.5px] font-bold bg-white/10 px-2 py-0.5 rounded-full text-slate-200">
              Happening Today
            </span>
          </div>

          <div className="space-y-1.5">
            {upcomingTwoHourVisits.map((v) => {
              const formattedTime = formatVisitTime(v.visit_time);
              return (
                <div key={v.id} className="p-2.5 bg-white/10 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-xs text-white">{v.property_title || 'Property Site Visit'}</h4>
                    <p className="text-[11px] text-slate-300">
                      Scheduled at <strong className="text-amber-200">{formattedTime}</strong> with <strong>{v.tenant_name || 'Tenant'}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {v.tenant_phone && (
                      <a
                        href={`tel:${v.tenant_phone}`}
                        className="px-2 py-1 rounded-md bg-white text-slate-900 font-bold text-[11px] flex items-center gap-1 hover:bg-slate-100 transition"
                      >
                        <Phone size={10} /> Call
                      </a>
                    )}
                    {v.tenant_phone && (
                      <a
                        href={`https://wa.me/${String(v.tenant_phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${v.tenant_name || 'Tenant'}, this is ${ownerName}. I am ready for our property visit today at ${formattedTime}.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded-md bg-[#25D366] text-white font-bold text-[11px] flex items-center gap-1 hover:bg-[#20bd5a] transition"
                      >
                        <SiWhatsapp size={10} /> WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 🏢 Property-Wise Filter Bar */}
      {distinctProperties.length > 1 && (
        <div className="bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200 flex items-center gap-1.5 overflow-x-auto shadow-2xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 pl-1">
            Filter by Property:
          </span>
          <button
            onClick={() => setSelectedPropertyFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
              selectedPropertyFilter === 'all'
                ? 'bg-[#0b3856] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Properties ({visitsList.length})
          </button>
          {distinctProperties.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPropertyFilter(p.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                selectedPropertyFilter === p.id
                  ? 'bg-purple-700 text-white shadow-2xs'
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

      {/* 📅 Filter Pill Bar + Bulk Delete Controls */}
      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Calendar size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">Tenant Site Visits</h3>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-black text-[8.5px] uppercase tracking-wider animate-pulse">
                  {pendingCount} Pending Approval
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-500">Manage inspection appointments & approve requested timing slots</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
          <div className="flex items-center gap-1">
            {[
              { id: 'all', label: `All (${visitsList.length})` },
              { id: 'pending', label: `Pending (${pendingCount})` },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'completed', label: 'Past / Done' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  filter === f.id
                    ? 'bg-[#0b3856] text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* 🎛️ Drawer Filter Trigger Button */}
          <button
            type="button"
            onClick={() => setIsFilterDrawerOpen(true)}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 border shrink-0 ${
              activeFilterCount > 0
                ? 'bg-[#0f2b3d] text-white border-[#0f2b3d] shadow-2xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-2xs'
            }`}
          >
            <Filter size={12} className={activeFilterCount > 0 ? 'text-amber-400' : 'text-slate-500'} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[9px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Bulk Select & Delete Controls */}
          {filteredVisits.length > 0 && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-gray-200">
              <button
                onClick={handleSelectAll}
                className="p-1 rounded text-slate-600 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                title={selectedIds.size === filteredVisits.length ? 'Deselect All' : 'Select All'}
              >
                {selectedIds.size === filteredVisits.length ? (
                  <CheckSquare size={14} className="text-purple-600" />
                ) : (
                  <Square size={14} />
                )}
                <span className="hidden sm:inline">Select All</span>
              </button>

              {selectedIds.size > 0 && (
                <button
                  onClick={handleBulkDeletePrompt}
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

      {/* 📋 Visits List - Compact, Modern with Scroll */}
      {filteredVisits.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-10 text-center shadow-2xs space-y-2">
          <Calendar className="w-10 h-10 mx-auto text-gray-300 opacity-60" />
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm">No Site Visits Found</h3>
          <p className="text-gray-400 text-[11px] max-w-sm mx-auto">
            {selectedPropertyFilter !== 'all'
              ? 'No visits for the selected property filter.'
              : 'When tenants schedule a visit matching your preferred hours, appointments appear here automatically.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
          {filteredVisits.map((v: any, idx: number) => {
            const isSelected = selectedIds.has(v.id);
            const { dateObj, dateStr, dayName, dayNum, monthShort } = parseVisitDate(v.visit_date);
            const formattedTime = formatVisitTime(v.visit_time);

            const status = v.status || 'Scheduled';
            const isConfirmed = status === 'Confirmed' || status === 'Approved';
            const isPendingTenant = status === 'Pending Tenant Approval' || status === 'Rescheduled by Owner';
            const isPendingOwner = (status === 'Pending Owner Approval' || status === 'Pending Approval' || status === 'Scheduled' || status === 'Rescheduled by Tenant') && !isPendingTenant;
            const isPending = isPendingOwner || isPendingTenant;
            const isCancelled = status === 'Cancelled' || status === 'Declined';
            const isCompleted = status === 'Completed';
            const isMissed = status === 'Missed';
            const isLoading = actionLoadingId === v.id;

            // Check if past visit needs completion prompt
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const visitD = new Date(dateObj);
            visitD.setHours(0, 0, 0, 0);
            const isPast = visitD < today;
            const isPastVisit = (() => {
              if (!v.visit_date) return false;
              try {
                const now = new Date();
                const timeStr = String(v.visit_time || '11:00 AM').trim();
                let hours = 11, mins = 0;
                const m12 = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
                const m24 = timeStr.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
                if (m12 && m12[3]) {
                  let h = parseInt(m12[1], 10);
                  const ampm = m12[3].toUpperCase();
                  if (ampm === 'PM' && h < 12) h += 12;
                  if (ampm === 'AM' && h === 12) h = 0;
                  hours = h;
                  mins = parseInt(m12[2], 10);
                } else if (m24) {
                  hours = parseInt(m24[1], 10);
                  mins = parseInt(m24[2], 10);
                }
                const visitDateTime = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), hours, mins);
                return now.getTime() > visitDateTime.getTime();
              } catch {
                return false;
              }
            })();
            const needsCompletionPrompt = (isPastVisit || isConfirmed) && !isCompleted && !isCancelled && !isMissed && !isPendingTenant;

            return (
              <div
                key={v.id || idx}
                className={`bg-white rounded-xl border transition-all p-2.5 sm:p-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5 relative ${
                  isSelected
                    ? 'border-purple-400 bg-purple-50/20 ring-1 ring-purple-300'
                    : isPendingTenant
                    ? 'border-amber-300 bg-amber-50/25 shadow-2xs ring-1 ring-amber-200'
                    : isPendingOwner
                    ? 'border-orange-300 bg-orange-50/20 shadow-2xs'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/10'
                    : 'border-slate-200 hover:border-blue-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Select Checkbox */}
                  <button
                    type="button"
                    onClick={() => handleToggleSelect(v.id)}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer shrink-0"
                  >
                    {isSelected ? (
                      <CheckSquare size={15} className="text-purple-600" />
                    ) : (
                      <Square size={15} />
                    )}
                  </button>

                  {/* Date Badge */}
                  <div
                    className={`w-10 h-10 rounded-lg border flex flex-col items-center justify-center shrink-0 ${
                      isPendingTenant
                        ? 'bg-amber-100 border-amber-300 text-amber-900'
                        : isPendingOwner
                        ? 'bg-orange-100 border-orange-300 text-orange-900'
                        : isConfirmed || isCompleted
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-blue-50 border-blue-200 text-blue-800'
                    }`}
                  >
                    <span className="text-xs font-black leading-tight">{dayNum}</span>
                    <span className="text-[8.5px] font-bold uppercase leading-none">
                      {monthShort}
                    </span>
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(() => {
                        const t = String(v.property_title || v.rental_property_title || '').trim();
                        const meeting = String(v.meeting_point || v.society_name || '').trim();
                        let displayTitle = t;
                        if (t && t.length <= 15 && meeting && !t.toLowerCase().includes(meeting.toLowerCase())) {
                          displayTitle = `${t} for Rent in ${meeting}`;
                        } else if (!t) {
                          displayTitle = meeting ? `Rental Unit in ${meeting}` : `Site Inspection #${v.id}`;
                        }
                        return (
                          <button
                            type="button"
                            onClick={() => setViewingHistoryVisit(v)}
                            className="font-bold text-xs sm:text-sm text-slate-900 hover:text-blue-600 hover:underline truncate text-left cursor-pointer flex items-center gap-1.5 transition"
                            title="Click to view full visit history & audit timeline"
                          >
                            <span className="truncate">{displayTitle}</span>
                            <Eye size={12} className="text-slate-400 hover:text-blue-600 shrink-0" />
                          </button>
                        );
                      })()}
                      {v.rental_property_id && (
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono font-bold text-[8.5px]">
                          RENT-{v.rental_property_id}
                        </span>
                      )}
                      <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold text-[8.5px] flex items-center gap-0.5">
                        <Clock size={9} />
                        <span>{formattedTime}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10.5px] text-slate-600 flex-wrap">
                      <span className="flex items-center gap-1">
                        <User size={10} className="text-gray-400 shrink-0" />
                        <span className="font-bold text-slate-800">{v.tenant_name || 'Prospective Tenant'}</span>
                      </span>
                      <span>•</span>
                      <span className="text-gray-500 font-medium">
                        {dayName}, {dateStr}
                      </span>
                      {v.accompanied_by && (
                        <>
                          <span>•</span>
                          <span className="text-purple-700 bg-purple-50 px-1 py-0.2 rounded font-semibold text-[9.5px]">
                            Acc: {v.accompanied_by}
                          </span>
                        </>
                      )}
                    </div>

                    {(() => {
                      if (!v.remarks) return null;
                      const rem = String(v.remarks).trim();
                      if (rem.startsWith('Rescheduled to') && (rem.includes('AM') || rem.includes('PM')) && !rem.toLowerCase().includes(formattedTime.toLowerCase())) {
                        return null;
                      }
                      return (
                        <p className="text-[9.5px] text-slate-500 italic truncate max-w-md">
                          "{rem}"
                        </p>
                      );
                    })()}

                    {/* Status Badge */}
                    <div className="pt-0.5 flex items-center gap-1.5 flex-wrap">
                      {isPendingTenant ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold text-[8.5px] border border-amber-300 animate-pulse">
                          <Clock size={9} className="text-amber-700" />
                          <span>Waiting for Tenant Approval</span>
                        </span>
                      ) : isPendingOwner && !isPastVisit ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-orange-100 text-orange-900 font-bold text-[8.5px] border border-orange-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                          <span>Tenant Requested • Pending Your Confirmation</span>
                        </span>
                      ) : isPending && isPastVisit ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-rose-100 text-rose-900 font-bold text-[8.5px] border border-rose-300">
                          <Clock size={9} className="text-rose-600" />
                          <span>Unattended (Time Passed)</span>
                        </span>
                      ) : isConfirmed ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold text-[8.5px] border border-emerald-300">
                          <CheckCircle2 size={9} className="text-emerald-600" />
                          <span>Confirmed Appointment</span>
                        </span>
                      ) : isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold text-[8.5px] border border-blue-300">
                          <CheckCircle2 size={9} className="text-blue-600" />
                          <span>Completed</span>
                        </span>
                      ) : isMissed ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold text-[8.5px] border border-rose-300">
                          <XCircle size={9} className="text-rose-600" />
                          <span>Missed</span>
                        </span>
                      ) : isCancelled ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-red-100 text-red-800 font-bold text-[8.5px] border border-red-300">
                          <XCircle size={9} className="text-red-600" />
                          <span>Declined</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold text-[8.5px] border border-amber-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>Slot Pending Approval</span>
                        </span>
                      )}

                      {/* Post-Visit Confirmation Button */}
                      {needsCompletionPrompt && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveFeedbackVisit(v);
                            setCompletionStatus('Completed');
                          }}
                          className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[8.5px] font-bold transition cursor-pointer"
                        >
                          Did visit happen? Confirm
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 flex-wrap justify-between md:justify-end">
                  {/* View History Button */}
                  <button
                    type="button"
                    onClick={() => setViewingHistoryVisit(v)}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-200"
                    title="View complete audit trail & event history"
                  >
                    <History size={11} className="text-slate-500" />
                    <span>History</span>
                  </button>

                  {/* View Tenant Info Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedTenantVisitModal(v)}
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-200"
                  >
                    <User size={11} className="text-blue-600" />
                    <span>Tenant Info</span>
                  </button>

                  {/* Actions for Pending Owner Approval */}
                  {isPendingOwner && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleUpdateStatus(v.id, 'Confirmed', v.tenant_name)}
                        className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold transition-all flex items-center gap-1 shadow-2xs cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                        <span>Confirm Slot</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openRescheduleModal(v)}
                        className="px-2 py-1 rounded-lg bg-[#0b3856] hover:bg-[#07263b] text-white text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                        title="Propose another date/time to tenant"
                      >
                        <Clock size={11} className="text-amber-300" />
                        <span>Reschedule</span>
                      </button>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleUpdateStatus(v.id, 'Cancelled', v.tenant_name)}
                        className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition-all flex items-center gap-0.5 cursor-pointer disabled:opacity-50"
                      >
                        <X size={11} />
                        <span>Decline</span>
                      </button>
                    </div>
                  )}

                  {/* Actions for Pending Tenant Approval (Owner proposed time) */}
                  {isPendingTenant && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openRescheduleModal(v)}
                        className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                        title="Change proposed time"
                      >
                        <Clock size={11} className="text-amber-700" />
                        <span>Modify Time</span>
                      </button>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleUpdateStatus(v.id, 'Cancelled', v.tenant_name)}
                        className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition-all flex items-center gap-0.5 cursor-pointer disabled:opacity-50"
                      >
                        <X size={11} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}

                  {/* Actions for Confirmed Visit */}
                  {isConfirmed && !isCompleted && (
                    <button
                      type="button"
                      onClick={() => openRescheduleModal(v)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                      title="Reschedule this confirmed visit"
                    >
                      <Clock size={11} className="text-blue-600" />
                      <span>Reschedule</span>
                    </button>
                  )}

                  {/* Direct WhatsApp / Call if phone exists */}
                  {v.tenant_phone && (
                    <div className="flex items-center gap-1">
                      <a
                        href={`https://wa.me/91${String(v.tenant_phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${v.tenant_name || 'Tenant'}! This is ${ownerName}. Looking forward to our site visit on ${dateStr} at ${formattedTime}.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                        title="Chat on WhatsApp"
                      >
                        <SiWhatsapp size={11} />
                        <span>WhatsApp</span>
                      </a>
                      <a
                        href={`tel:${v.tenant_phone}`}
                        className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer border border-slate-200"
                        title="Call Tenant"
                      >
                        <PhoneCall size={11} />
                      </a>
                    </div>
                  )}

                  {/* Single Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteSinglePrompt(v.id, v.tenant_name)}
                    disabled={deletingId === v.id}
                    className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Delete visit record"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 🔍 Tenant Full Details Modal */}
      {selectedTenantVisitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0b3856] to-[#1e4e6d] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 font-black">
                  <User size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Prospective Tenant Profile</h3>
                  <p className="text-[10.5px] text-slate-200">Verified visit lead</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTenantVisitModal(null)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="w-11 h-11 rounded-xl bg-[#0b3856] text-white font-black text-base flex items-center justify-center shrink-0">
                  {(selectedTenantVisitModal.tenant_name || 'T').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-sm text-slate-900 truncate">
                      {selectedTenantVisitModal.tenant_name || 'Tenant Name'}
                    </h4>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-mono mt-0.5">
                    {selectedTenantVisitModal.tenant_phone || 'Phone not available'}
                  </p>
                </div>
              </div>

              {/* Preferences Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-gray-500 block">Tenant Category</span>
                  <span className="font-extrabold text-slate-900">{selectedTenantVisitModal.tenant_type || 'Family'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-gray-500 block">BHK Preference</span>
                  <span className="font-extrabold text-slate-900">{selectedTenantVisitModal.preferred_bhk || '2 BHK'}</span>
                </div>
              </div>

              {/* Property Details */}
              {(() => {
                const modalParsed = parseVisitDate(selectedTenantVisitModal.visit_date);
                const modalTime = formatVisitTime(selectedTenantVisitModal.visit_time);
                return (
                  <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">Requested Property</span>
                    <p className="font-extrabold text-slate-900">
                      {selectedTenantVisitModal.property_title || selectedTenantVisitModal.rental_property_title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-600 pt-1">
                      <Clock size={11} className="text-orange-600" />
                      <span className="font-bold">{modalTime}</span>
                      <span>•</span>
                      <span>{modalParsed.dateStr}</span>
                    </div>
                  </div>
                );
              })()}

              {selectedTenantVisitModal.remarks && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                  <span className="font-bold text-slate-900 block mb-0.5">Tenant Note / Visit Remarks:</span>
                  <p className="text-slate-600">{selectedTenantVisitModal.remarks}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              {selectedTenantVisitModal.tenant_phone && (
                <a
                  href={`tel:${selectedTenantVisitModal.tenant_phone}`}
                  className="px-3 py-1.5 rounded-xl bg-[#0b3856] text-white font-bold text-xs flex items-center gap-1 hover:bg-[#072438] transition"
                >
                  <Phone size={12} /> Call
                </a>
              )}
              {selectedTenantVisitModal.tenant_phone && (
                <a
                  href={`https://wa.me/91${String(selectedTenantVisitModal.tenant_phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${selectedTenantVisitModal.tenant_name || 'Tenant'}! I am ${ownerName}. I received your visit request for ${selectedTenantVisitModal.property_title || 'my property'}.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center gap-1 hover:bg-[#20bd5a] transition"
                >
                  <SiWhatsapp size={12} /> WhatsApp
                </a>
              )}
              <button
                type="button"
                onClick={() => setSelectedTenantVisitModal(null)}
                className="px-3 py-1.5 rounded-xl bg-gray-200 text-gray-800 font-bold text-xs hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📝 Visit Feedback / Reschedule / Status Confirmation Modal */}
      {activeFeedbackVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-[#0b3856] to-[#1e4e6d] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-300" />
                <div>
                  <h3 className="font-extrabold text-sm text-white">Did your visit take place?</h3>
                  <p className="text-[10px] text-slate-200">Confirm outcome for scheduled site inspection</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (activeFeedbackVisit?.id) {
                    sessionStorage.setItem(`dismissed_visit_feedback_${activeFeedbackVisit.id}`, 'true');
                  }
                  setActiveFeedbackVisit(null);
                }}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-4 space-y-3.5">
              {/* Scheduled Visit Summary Banner */}
              {(() => {
                const parsed = parseVisitDate(activeFeedbackVisit.visit_date);
                const time = formatVisitTime(activeFeedbackVisit.visit_time);
                return (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/90 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                        <Clock size={11} className="text-orange-600" />
                        <span>Scheduled Visit Passed</span>
                      </span>
                      <span className="px-2 py-0.2 rounded-md bg-amber-200/70 text-amber-900 font-bold text-[9px]">
                        Follow-up Prompt
                      </span>
                    </div>
                    <p className="font-extrabold text-slate-900 text-xs">
                      {activeFeedbackVisit.property_title || activeFeedbackVisit.rental_property_title || 'Rental Property'}
                    </p>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Tenant: <span className="font-bold text-slate-800">{activeFeedbackVisit.tenant_name || 'Tenant'}</span> • {parsed.dateStr} at {time}
                    </p>
                  </div>
                );
              })()}

              <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCompletionStatus('Completed')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    completionStatus === 'Completed'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ✓ Completed
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCompletionStatus('Rescheduled');
                    if (!rescheduleDate) {
                      const tmrw = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                      setRescheduleDate(tmrw);
                    }
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    completionStatus === 'Rescheduled'
                      ? 'bg-[#0b3856] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🔄 Reschedule
                </button>
                <button
                  type="button"
                  onClick={() => setCompletionStatus('Missed')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    completionStatus === 'Missed'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ✗ Missed
                </button>
              </div>

              {completionStatus === 'Completed' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Rate your visit experience
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setVisitRating(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition cursor-pointer"
                        >
                          <Star
                            size={20}
                            fill={star <= visitRating ? 'currentColor' : 'none'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Feedback / Follow-up Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={visitFeedbackText}
                      onChange={(e) => setVisitFeedbackText(e.target.value)}
                      placeholder="E.g. Tenant liked the flat, discussing lease terms..."
                      className="w-full p-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {completionStatus === 'Rescheduled' && (
                <div className="space-y-3 animate-in fade-in duration-150 p-3 rounded-xl bg-blue-50/50 border border-blue-200">
                  <span className="text-[11px] font-extrabold text-[#0b3856] block">
                    Propose New Date & Time for Tenant
                  </span>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                      New Inspection Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={rescheduleDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full p-2 text-xs rounded-xl border border-blue-300 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold text-slate-700 uppercase">
                        New Inspection Time <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsFeedbackCustomTimeMode(!isFeedbackCustomTimeMode)}
                        className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                      >
                        {isFeedbackCustomTimeMode ? 'Use Quick Preset Slots' : '+ Set Custom Time'}
                      </button>
                    </div>

                    {!isFeedbackCustomTimeMode ? (
                      <select
                        value={rescheduleTime}
                        onChange={(e) => setRescheduleTime(e.target.value)}
                        className="w-full p-2 text-xs rounded-xl border border-blue-300 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="09:00 AM">09:00 AM (Morning)</option>
                        <option value="10:00 AM">10:00 AM (Morning)</option>
                        <option value="11:00 AM">11:00 AM (Morning)</option>
                        <option value="12:00 PM">12:00 PM (Noon)</option>
                        <option value="02:00 PM">02:00 PM (Afternoon)</option>
                        <option value="03:00 PM">03:00 PM (Afternoon)</option>
                        <option value="04:00 PM">04:00 PM (Evening)</option>
                        <option value="05:00 PM">05:00 PM (Evening)</option>
                        <option value="06:00 PM">06:00 PM (Evening)</option>
                        <option value="07:00 PM">07:00 PM (Evening)</option>
                        <option value="08:00 PM">08:00 PM (Night)</option>
                      </select>
                    ) : (
                      <div className="space-y-1 p-2 bg-white rounded-xl border border-blue-300">
                        <input
                          type="time"
                          value={feedbackCustomTime}
                          onChange={(e) => setFeedbackCustomTime(e.target.value)}
                          className="w-full p-2 rounded-lg border border-blue-300 bg-slate-50 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <p className="text-[10px] text-blue-700">
                          Select any custom time (e.g. 04:15 PM, 06:45 PM).
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {completionStatus === 'Missed' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Reason for Missed Visit
                    </label>
                    <select
                      value={missedReason}
                      onChange={(e) => setMissedReason(e.target.value)}
                      className="w-full p-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    >
                      <option value="Tenant did not show up (No-show)">Tenant did not show up (No-show)</option>
                      <option value="Tenant cancelled last minute">Tenant cancelled last minute</option>
                      <option value="Tenant requested postponement">Tenant requested postponement</option>
                      <option value="I was unavailable / Busy">I was unavailable / Busy</option>
                      <option value="Tenant unreachable on phone/WhatsApp">Tenant unreachable on phone/WhatsApp</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {missedReason === 'Other' && (
                    <input
                      type="text"
                      value={customMissedNote}
                      onChange={(e) => setCustomMissedNote(e.target.value)}
                      placeholder="Specify reason..."
                      className="w-full p-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveFeedbackVisit(null)}
                className="px-3 py-1.5 rounded-xl bg-gray-200 text-gray-800 font-bold text-xs hover:bg-gray-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingFeedback}
                onClick={handleSaveVisitFeedback}
                className={`px-4 py-1.5 rounded-xl text-white font-extrabold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                  completionStatus === 'Completed'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {submittingFeedback && <Loader2 size={12} className="animate-spin" />}
                <span>Save Outcome</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🗑️ Custom In-App Delete Confirmation Modal */}
      {deleteConfirmModal && deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
                <Trash2 size={24} />
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  {deleteConfirmModal.type === 'bulk'
                    ? `Delete ${deleteConfirmModal.count} Visit Records?`
                    : 'Delete Site Visit Record?'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {deleteConfirmModal.type === 'bulk'
                    ? `Are you sure you want to permanently delete ${deleteConfirmModal.count} selected site visit records? This action cannot be undone.`
                    : `Are you sure you want to delete the scheduled visit record for ${deleteConfirmModal.tenantName || 'this tenant'}? This action cannot be undone.`}
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
                disabled={Boolean(deletingId || bulkDeleting)}
                onClick={handleExecuteDelete}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {(deletingId || bulkDeleting) && <Loader2 size={12} className="animate-spin" />}
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📜 Full Site Visit Lifecycle History & Audit Modal */}
      {viewingHistoryVisit && (
        <VisitHistoryModal
          isOpen={!!viewingHistoryVisit}
          onClose={() => setViewingHistoryVisit(null)}
          visit={viewingHistoryVisit}
          onReschedule={(v) => {
            setActiveFeedbackVisit(v);
            setCompletionStatus('Rescheduled');
            const tmrw = new Date(Date.now() + 86400000).toISOString().split('T')[0];
            setRescheduleDate(tmrw);
          }}
          onRecordOutcome={(v) => {
            setActiveFeedbackVisit(v);
            setCompletionStatus('Completed');
          }}
        />
      )}

      {/* 🎛️ Slide-over Filters Drawer (Matches Screenshot) */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsFilterDrawerOpen(false)}
          />

          {/* Drawer Box */}
          <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="bg-[#0f2b3d] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-amber-400" />
                <h3 className="font-bold text-base text-white">Filters</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Form Fields - Site Visit Specific */}
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              {/* Property */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Property</label>
                <select
                  value={drawerProperty}
                  onChange={(e) => setDrawerProperty(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-[#0f2b3d]/20 focus:border-[#0f2b3d] focus:outline-none"
                >
                  <option value="All">All Properties ({visitsList.length})</option>
                  {distinctProperties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Visit Status</label>
                <select
                  value={drawerStatus}
                  onChange={(e) => setDrawerStatus(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-[#0f2b3d]/20 focus:border-[#0f2b3d] focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending Approval</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed / Done</option>
                  <option value="Missed">Missed</option>
                  <option value="Rescheduled">Rescheduled</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Timing Slot */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Visit Timing Slot</label>
                <select
                  value={drawerTimeSlot}
                  onChange={(e) => setDrawerTimeSlot(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-[#0f2b3d]/20 focus:border-[#0f2b3d] focus:outline-none"
                >
                  <option value="All">All Slots (Any Time)</option>
                  <option value="Morning">Morning (8:00 AM - 12:00 PM)</option>
                  <option value="Afternoon">Afternoon (12:00 PM - 4:00 PM)</option>
                  <option value="Evening">Evening (4:00 PM - 8:00 PM)</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">From Date</label>
                  <input
                    type="date"
                    value={drawerFromDate}
                    onChange={(e) => {
                      setDrawerFromDate(e.target.value);
                      if (e.target.value) setDrawerIgnoreDate(false);
                    }}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-[#0f2b3d]/20 focus:border-[#0f2b3d] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">To Date</label>
                  <input
                    type="date"
                    value={drawerToDate}
                    onChange={(e) => {
                      setDrawerToDate(e.target.value);
                      if (e.target.value) setDrawerIgnoreDate(false);
                    }}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-[#0f2b3d]/20 focus:border-[#0f2b3d] focus:outline-none"
                  />
                </div>
              </div>

              {/* Ignore Date Checkbox */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="owner-ignore-date"
                  checked={drawerIgnoreDate}
                  onChange={(e) => setDrawerIgnoreDate(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0f2b3d] focus:ring-[#0f2b3d] cursor-pointer"
                />
                <label htmlFor="owner-ignore-date" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Ignore Date
                </label>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 py-2.5 rounded-lg border border-orange-500 text-orange-600 font-bold text-xs hover:bg-orange-50 transition cursor-pointer text-center"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="flex-1 py-2.5 rounded-lg bg-[#0f2b3d] hover:bg-[#091b26] text-white font-bold text-xs shadow-sm transition cursor-pointer text-center"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OwnerVisitsTab;
