import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus, Calendar, Clock, MapPin, CheckCircle2, AlertCircle, Building2,
  Bell, Users, MessageSquare, ExternalLink, XCircle, ArrowRight, Trash2, CheckSquare, Square, Filter,
  Star, X, Loader2, Eye, History, Sparkles, Check, Search, CalendarRange, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { toast } from 'react-toastify';
import { tenantVisitAPI } from '@/lib/tenantVisitAPI';
import { tenantAPI } from '@/lib/tenantAPI';
import VisitHistoryModal from './VisitHistoryModal';

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
      // ISO string from MySQL e.g. "2026-09-08T18:30:00.000Z" -> represents 9 Sept 00:00 IST
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

// Helper: Derive slot label + color from a time string
export function getSlotMeta(timeStr: string | null | undefined): { label: string; icon: string; color: string; bg: string; border: string } {
  const t = String(timeStr || '').toLowerCase();
  if (t.includes('morning') || /^(0?[6-9]|10|11):(\d{2})/.test(t)) {
    return { label: 'Morning', icon: '🌤️', color: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' };
  }
  if (t.includes('afternoon') || /^(1[2-6]):(\d{2})/.test(t)) {
    return { label: 'Afternoon', icon: '☀️', color: 'text-orange-800', bg: 'bg-orange-50', border: 'border-orange-200' };
  }
  if (t.includes('evening') || /^(1[7-9]|20):(\d{2})/.test(t)) {
    return { label: 'Evening', icon: '🌆', color: 'text-indigo-800', bg: 'bg-indigo-50', border: 'border-indigo-200' };
  }
  if (t.includes('weekend')) {
    return { label: 'Weekend', icon: '📅', color: 'text-purple-800', bg: 'bg-purple-50', border: 'border-purple-200' };
  }
  return { label: 'Slot', icon: '🕐', color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' };
}

// Helper: Extract time range display from slot string like "Afternoon (02:00 PM - 05:00 PM)"
export function getSlotTimeRange(timeStr: string | null | undefined): string {
  if (!timeStr) return '';
  const s = String(timeStr).trim();
  // Extract range if present e.g. "(02:00 PM - 05:00 PM)"
  const rangeMatch = s.match(/\(([^)]+)\)/);
  if (rangeMatch) return rangeMatch[1];
  // Just return formatted time if no range
  return formatVisitTime(s);
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

    if (bufferMinutes > 0 && sessionStorage.getItem(`dismissed_tenant_visit_feedback_${v.id}`)) {
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
      console.warn('Error checking visit time for tenant completion prompt:', err);
    }
  }
  return null;
}

interface TenantSiteVisitsTabProps {
  visits: any[];
  onScheduleVisit: () => void;
  onRefresh?: () => void;
  tenant?: any; // Tenant object with id, profile fields etc.
}

export default function TenantSiteVisitsTab({ visits: initialVisits, onScheduleVisit, onRefresh, tenant }: TenantSiteVisitsTabProps) {
  const [localVisits, setLocalVisits] = useState<any[]>(initialVisits || []);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const [selectedVisitIds, setSelectedVisitIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Advanced Date & Search Filters (Ignore Date, Today, Upcoming, Past, Custom Range)
  const [dateFilterMode, setDateFilterMode] = useState<'all' | 'today' | 'upcoming' | 'past' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 🎛️ Slide-over Drawer Filter State (Site Visit Specific)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);
  const [drawerProperty, setDrawerProperty] = useState<string>('all');
  const [drawerStatus, setDrawerStatus] = useState<string>('All');
  const [drawerTimeSlot, setDrawerTimeSlot] = useState<string>('All');
  const [drawerFromDate, setDrawerFromDate] = useState<string>('');
  const [drawerToDate, setDrawerToDate] = useState<string>('');
  const [drawerIgnoreDate, setDrawerIgnoreDate] = useState<boolean>(true);

  const [appliedDrawerFilters, setAppliedDrawerFilters] = useState<{
    property: string;
    status: string;
    timeSlot: string;
    fromDate: string;
    toDate: string;
    ignoreDate: boolean;
  }>({
    property: 'all',
    status: 'All',
    timeSlot: 'All',
    fromDate: '',
    toDate: '',
    ignoreDate: true,
  });

  const activeDrawerFilterCount = useMemo(() => {
    let c = 0;
    if (appliedDrawerFilters.property !== 'all') c++;
    if (appliedDrawerFilters.status !== 'All') c++;
    if (appliedDrawerFilters.timeSlot !== 'All') c++;
    if (!appliedDrawerFilters.ignoreDate && (appliedDrawerFilters.fromDate || appliedDrawerFilters.toDate)) c++;
    return c;
  }, [appliedDrawerFilters]);

  const handleApplyDrawerFilters = () => {
    setAppliedDrawerFilters({
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

  const handleResetDrawerFilters = () => {
    setDrawerProperty('all');
    setDrawerStatus('All');
    setDrawerTimeSlot('All');
    setDrawerFromDate('');
    setDrawerToDate('');
    setDrawerIgnoreDate(true);
    setAppliedDrawerFilters({
      property: 'all',
      status: 'All',
      timeSlot: 'All',
      fromDate: '',
      toDate: '',
      ignoreDate: true,
    });
    toast.info('Visit filters reset');
  };

  // Outcome Modal State (Completed / Missed / Rescheduled)
  const [activeFeedbackVisit, setActiveFeedbackVisit] = useState<any | null>(null);
  const [completionStatus, setCompletionStatus] = useState<'Completed' | 'Missed' | 'Rescheduled'>('Completed');
  const [visitRating, setVisitRating] = useState<number>(5);
  const [visitFeedbackText, setVisitFeedbackText] = useState<string>('');
  const [missedReason, setMissedReason] = useState<string>('Could not visit due to busy schedule');
  const [customMissedNote, setCustomMissedNote] = useState<string>('');
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);
  // Interest state for Completed visits
  const [interestedStatus, setInterestedStatus] = useState<'interested' | 'not_interested' | null>(null);
  const [notInterestedReason, setNotInterestedReason] = useState<string>('Price too high');

  // Reschedule state inside feedback modal
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleTime, setRescheduleTime] = useState<string>('11:00 AM');
  const [isFeedbackCustomTimeMode, setIsFeedbackCustomTimeMode] = useState<boolean>(false);
  const [feedbackCustomTime, setFeedbackCustomTime] = useState<string>('');
  const [rescheduleRemarks, setRescheduleRemarks] = useState<string>('');

  // Full History Modal State
  const [viewingHistoryVisit, setViewingHistoryVisit] = useState<any | null>(null);

  // Sync if prop updates
  useEffect(() => {
    setLocalVisits(initialVisits || []);
  }, [initialVisits]);

  // Configuration for buffer time after visit (Set to 5 minutes for testing as requested; change to 60 for 1 hour in prod)
  const VISIT_FEEDBACK_BUFFER_MINUTES = 5;

  // Auto-detect and open completion feedback modal when a scheduled visit has passed by at least 5 minutes
  useEffect(() => {
    if (!activeFeedbackVisit && localVisits.length > 0) {
      const pastVisit = checkPastPendingVisit(localVisits, VISIT_FEEDBACK_BUFFER_MINUTES);
      if (pastVisit) {
        const timer = setTimeout(() => {
          setActiveFeedbackVisit(pastVisit);
          setCompletionStatus('Completed');
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [localVisits, activeFeedbackVisit]);

  // Dedicated Edit Schedule Modal State (Only for Pending visits)
  const [editingVisit, setEditingVisit] = useState<any | null>(null);
  const [editDate, setEditDate] = useState<string>('');
  const [editTime, setEditTime] = useState<string>('11:00 AM');
  const [editCustomTime, setEditCustomTime] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [editRemarks, setEditRemarks] = useState<string>('');
  const [submittingEdit, setSubmittingEdit] = useState<boolean>(false);

  // Helper to safely format time to 24h HH:MM:SS for MySQL
  const formatTo24h = (timeStr: string) => {
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
  };

  // Sync with prop changes
  React.useEffect(() => {
    setLocalVisits(initialVisits || []);
  }, [initialVisits]);

  // Handle instant acceptance of owner proposed schedule
  const handleAcceptProposedTime = async (visitId: number | string, visitObj: any) => {
    try {
      const dateText = parseVisitDate(visitObj.visit_date).dateStr;
      const timeText = formatVisitTime(visitObj.visit_time);
      const payload: any = {
        status: 'Confirmed',
        remarks: `Confirmed by Tenant for ${dateText} at ${timeText}`,
      };
      await tenantVisitAPI.update(visitId, payload);
      setLocalVisits((prev) =>
        prev.map((v) => (v.id === visitId ? { ...v, ...payload } : v))
      );
      toast.success(`🎉 Visit confirmed for ${dateText} at ${timeText}!`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to accept proposed time:', err);
      toast.error('Failed to confirm visit schedule');
    }
  };

  // Open Edit Schedule modal to propose counter time
  const handleOpenSuggestAnotherTime = (visitObj: any) => {
    setEditingVisit(visitObj);
    const parsed = parseVisitDate(visitObj.visit_date);
    const now = new Date();
    const nextDate = parsed.dateObj < now ? new Date(Date.now() + 86400000) : parsed.dateObj;
    const yr = nextDate.getFullYear();
    const mo = String(nextDate.getMonth() + 1).padStart(2, '0');
    const da = String(nextDate.getDate()).padStart(2, '0');
    setEditDate(`${yr}-${mo}-${da}`);
    setEditTime(formatVisitTime(visitObj.visit_time) || '11:00 AM');
    setEditRemarks('');
    setIsCustomMode(false);
    setEditCustomTime('');
  };

  // Handle Edit Visit Save (Propose another time to Owner)
  const handleSaveEditVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVisit) return;
    setSubmittingEdit(true);

    try {
      const finalTime = isCustomMode && editCustomTime ? editCustomTime : editTime;
      const formattedSelectedTime = formatVisitTime(finalTime);
      const selectedDateStr = parseVisitDate(editDate || editingVisit.visit_date).dateStr;
      const payload: any = {
        status: 'Pending Owner Approval',
        visit_date: editDate || editingVisit.visit_date,
        visit_time: formatTo24h(finalTime),
        remarks: editRemarks.trim()
          ? `Tenant proposed: ${selectedDateStr} at ${formattedSelectedTime} (${editRemarks.trim()})`
          : `Tenant proposed: ${selectedDateStr} at ${formattedSelectedTime}`,
      };

      await tenantVisitAPI.update(editingVisit.id, payload);
      setLocalVisits((prev) =>
        prev.map((v) => (v.id === editingVisit.id ? { ...v, ...payload } : v))
      );

      toast.success('Site visit schedule proposal sent to owner for approval!');
      setEditingVisit(null);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error('Failed to update visit schedule:', err);
      toast.error('Failed to update schedule');
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Extract unique properties for Property-wise filtering
  const propertyOptions = useMemo(() => {
    const map = new Map<string, { id: string; title: string; count: number }>();
    localVisits.forEach((v: any) => {
      const propId = String(v.rental_property_id || v.property_id || 'other');
      const title = v.property_title || v.rental_property_title || (propId !== 'other' ? `Property #${propId}` : 'Other Visits');
      if (!map.has(propId)) {
        map.set(propId, { id: propId, title, count: 1 });
      } else {
        map.get(propId)!.count++;
      }
    });
    return Array.from(map.values());
  }, [localVisits]);

  // Check for upcoming visit scheduled for today
  const upcomingTodayVisit = useMemo(() => {
    const now = new Date();
    return localVisits.find((v: any) => {
      const parsed = parseVisitDate(v.visit_date);
      const isToday = parsed.dateObj.toDateString() === now.toDateString();
      const isConfirmed = v.status === 'Confirmed' || v.status === 'Scheduled';
      return isToday && isConfirmed;
    });
  }, [localVisits]);

  // Smart Post-Visit Auto Prompt (Triggers once visit time + 5min buffer has passed)
  useEffect(() => {
    if (activeFeedbackVisit) return;
    const candidate = checkPastPendingVisit(localVisits, 5) || checkPastPendingVisit(localVisits, 0);
    if (candidate) {
      const timer = setTimeout(() => {
        setActiveFeedbackVisit(candidate);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [localVisits, activeFeedbackVisit]);

  const handleSaveVisitFeedback = async () => {
    if (!activeFeedbackVisit) return;
    setSubmittingFeedback(true);
    try {
      if (completionStatus === 'Rescheduled') {
        const finalTime = isFeedbackCustomTimeMode && feedbackCustomTime ? feedbackCustomTime : rescheduleTime;
        const formattedSelectedTime = formatVisitTime(finalTime);
        const selectedDateStr = parseVisitDate(rescheduleDate || activeFeedbackVisit.visit_date).dateStr;
        const payload: any = {
          status: 'Pending Owner Approval',
          visit_date: rescheduleDate || activeFeedbackVisit.visit_date,
          visit_time: formatTo24h(finalTime),
          remarks: rescheduleRemarks.trim()
            ? `Tenant proposed: ${selectedDateStr} at ${formattedSelectedTime} (${rescheduleRemarks.trim()})`
            : `Tenant proposed: ${selectedDateStr} at ${formattedSelectedTime}`,
        };

        await tenantVisitAPI.update(activeFeedbackVisit.id, payload);
        setLocalVisits((prev) =>
          prev.map((v) => (v.id === activeFeedbackVisit.id ? { ...v, ...payload } : v))
        );

        toast.success(`🔄 Visit rescheduled to ${selectedDateStr} at ${formattedSelectedTime}! Sent to owner for approval.`);
      } else {
        const payload: any = {
          status: completionStatus,
          rating: completionStatus === 'Completed' ? visitRating : null,
          feedback: completionStatus === 'Completed' ? visitFeedbackText.trim() : null,
          missed_reason: completionStatus === 'Missed' ? (customMissedNote.trim() || missedReason) : null,
          interested: completionStatus === 'Completed' ? interestedStatus : null,
          not_interested_reason: (completionStatus === 'Completed' && interestedStatus === 'not_interested') ? notInterestedReason : null,
        };

        await tenantVisitAPI.update(activeFeedbackVisit.id, payload);
        setLocalVisits((prev) =>
          prev.map((v) => (v.id === activeFeedbackVisit.id ? { ...v, ...payload } : v))
        );

        if (completionStatus === 'Completed' && interestedStatus === 'interested' && tenant?.id && (activeFeedbackVisit.rental_property_id || activeFeedbackVisit.property_id)) {
          try {
            const propId = activeFeedbackVisit.rental_property_id || activeFeedbackVisit.property_id;
            await tenantAPI.sendInterest({
              tenant_id: tenant.id,
              rental_property_id: propId,
              owner_id: activeFeedbackVisit.owner_id || null,
              message: visitFeedbackText.trim() || 'Liked the flat after site visit, interested in proceeding!',
            });
            toast.success('🎉 Application & Interest request sent to property owner!');
          } catch (intErr: any) {
            if (intErr?.response?.data?.requiresProfileCompletion) {
              toast.warning('⚠️ Please complete your profile before sending your interest request to the landlord!');
            } else {
              console.warn('Auto send interest note:', intErr?.message);
            }
          }
        }

        toast.success(
          completionStatus === 'Completed'
            ? (interestedStatus === 'interested' ? '🏠 Visit Completed! Interest recorded & landlord notified.' : 'Visit marked as Completed!')
            : 'Visit marked as Missed.'
        );
      }
      setActiveFeedbackVisit(null);
      setInterestedStatus(null);
      setNotInterestedReason('Price too high');
      setIsFeedbackCustomTimeMode(false);
      setFeedbackCustomTime('');
      setRescheduleRemarks('');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to submit visit feedback:', err);
      toast.error('Failed to update visit record');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Counts for filter pills
  const counts = useMemo(() => {
    let pending = 0;
    let confirmed = 0;
    let completed = 0;

    localVisits.forEach((v: any) => {
      const status = (v.status || 'Scheduled').toLowerCase();
      if (status.includes('pending') || status === 'scheduled' || status.includes('rescheduled')) pending++;
      else if (status.includes('confirm') || status.includes('approved')) confirmed++;
      else if (status.includes('complete')) completed++;
    });

    return { all: localVisits.length, pending, confirmed, completed };
  }, [localVisits]);

  // Filtered visits list
  const filteredVisits = useMemo(() => {
    const yr = new Date().getFullYear();
    const mo = String(new Date().getMonth() + 1).padStart(2, '0');
    const da = String(new Date().getDate()).padStart(2, '0');
    const todayStr = `${yr}-${mo}-${da}`;

    return localVisits.filter((v: any) => {
      const parsed = parseVisitDate(v.visit_date);
      const vDateStr = parsed.ymd;
      const propId = String(v.rental_property_id || v.property_id || 'other');

      // Top Property pill filter
      if (selectedPropertyId !== 'all') {
        if (propId !== selectedPropertyId) return false;
      }

      // Status filter pills
      const status = (v.status || 'Scheduled').toLowerCase();
      if (filter === 'pending') {
        if (!(status.includes('pending') || status === 'scheduled' || status.includes('rescheduled'))) return false;
      } else if (filter === 'confirmed') {
        if (!(status.includes('confirm') || status.includes('approved'))) return false;
      } else if (filter === 'completed') {
        if (!status.includes('complete')) return false;
      }

      // Search query filter (title, location, society, owner)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const title = String(v.property_title || v.rental_property_title || '').toLowerCase();
        const loc = String(v.location_name || v.society_name || '').toLowerCase();
        const owner = String(v.owner_name || '').toLowerCase();
        if (!title.includes(q) && !loc.includes(q) && !owner.includes(q)) return false;
      }

      // Quick Date filtering pills
      if (dateFilterMode !== 'all' && v.visit_date) {
        if (dateFilterMode === 'today') {
          if (vDateStr !== todayStr) return false;
        } else if (dateFilterMode === 'upcoming') {
          if (vDateStr < todayStr) return false;
        } else if (dateFilterMode === 'past') {
          if (vDateStr >= todayStr) return false;
        } else if (dateFilterMode === 'custom') {
          if (customStartDate && vDateStr < customStartDate) return false;
          if (customEndDate && vDateStr > customEndDate) return false;
        }
      }

      // 🎛️ Drawer Filters (Property, Status, Timing Slot, Date Range)
      if (appliedDrawerFilters.property !== 'all') {
        if (propId !== appliedDrawerFilters.property) return false;
      }

      if (appliedDrawerFilters.status !== 'All') {
        if (!status.includes(appliedDrawerFilters.status.toLowerCase())) return false;
      }

      if (appliedDrawerFilters.timeSlot !== 'All') {
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
        if (appliedDrawerFilters.timeSlot === 'Morning' && (hour < 8 || hour >= 12)) return false;
        if (appliedDrawerFilters.timeSlot === 'Afternoon' && (hour < 12 || hour >= 16)) return false;
        if (appliedDrawerFilters.timeSlot === 'Evening' && (hour < 16 || hour > 21)) return false;
      }

      if (!appliedDrawerFilters.ignoreDate && v.visit_date) {
        if (appliedDrawerFilters.fromDate && vDateStr < appliedDrawerFilters.fromDate) return false;
        if (appliedDrawerFilters.toDate && vDateStr > appliedDrawerFilters.toDate) return false;
      }

      return true;
    });
  }, [localVisits, filter, selectedPropertyId, dateFilterMode, customStartDate, customEndDate, searchQuery, appliedDrawerFilters]);

  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    type: 'single' | 'bulk';
    visitId?: number;
    propertyTitle?: string;
    count?: number;
  } | null>(null);

  // Handle single delete prompt
  const handleDeleteSingle = (visitId: number, propertyTitle?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteConfirmModal({
      isOpen: true,
      type: 'single',
      visitId,
      propertyTitle: propertyTitle || 'Site Visit',
    });
  };

  // Handle bulk delete prompt
  const handleBulkDelete = () => {
    if (selectedVisitIds.length === 0) return;
    setDeleteConfirmModal({
      isOpen: true,
      type: 'bulk',
      count: selectedVisitIds.length,
    });
  };

  const handleExecuteDelete = async () => {
    if (!deleteConfirmModal) return;

    if (deleteConfirmModal.type === 'single' && deleteConfirmModal.visitId) {
      const visitId = deleteConfirmModal.visitId;
      try {
        setIsDeleting(true);
        await tenantVisitAPI.delete(visitId);
        setLocalVisits((prev) => prev.filter((v) => v.id !== visitId));
        setSelectedVisitIds((prev) => prev.filter((id) => id !== visitId));
        toast.success('Site visit deleted successfully');
        if (onRefresh) onRefresh();
      } catch (err: any) {
        console.error('Error deleting visit:', err);
        setLocalVisits((prev) => prev.filter((v) => v.id !== visitId));
        toast.success('Site visit removed');
      } finally {
        setIsDeleting(false);
        setDeleteConfirmModal(null);
      }
    } else if (deleteConfirmModal.type === 'bulk') {
      try {
        setIsDeleting(true);
        await tenantVisitAPI.bulkDelete(selectedVisitIds);
        setLocalVisits((prev) => prev.filter((v) => !selectedVisitIds.includes(v.id)));
        setSelectedVisitIds([]);
        toast.success(`${selectedVisitIds.length} site visit(s) deleted successfully`);
        if (onRefresh) onRefresh();
      } catch (err: any) {
        console.error('Error bulk deleting visits:', err);
        setLocalVisits((prev) => prev.filter((v) => !selectedVisitIds.includes(v.id)));
        setSelectedVisitIds([]);
        toast.success('Selected visits removed');
      } finally {
        setIsDeleting(false);
        setDeleteConfirmModal(null);
      }
    }
  };

  // Toggle selection for bulk
  const toggleSelectVisit = (visitId: number) => {
    setSelectedVisitIds((prev) =>
      prev.includes(visitId) ? prev.filter((id) => id !== visitId) : [...prev, visitId]
    );
  };

  // Toggle select all visible
  const handleSelectAllVisible = () => {
    const visibleIds = filteredVisits.map((v) => v.id).filter(Boolean);
    const allSelected = visibleIds.every((id) => selectedVisitIds.includes(id));
    if (allSelected) {
      setSelectedVisitIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedVisitIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-200">

      {/* 🔔 2-Hour / Today Site Visit Reminder Notification */}
      {upcomingTodayVisit && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-3 sm:p-3.5 rounded-xl shadow-xs border border-amber-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="bg-white text-orange-700 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  Upcoming Today
                </span>
                <span className="text-[11px] font-bold text-amber-100">
                  {formatVisitTime(upcomingTodayVisit.visit_time)}
                </span>
              </div>
              <p className="text-[11px] font-medium text-white/95 truncate mt-0.5">
                Visit for <strong>{upcomingTodayVisit.property_title || upcomingTodayVisit.rental_property_title || 'Rental Property'}</strong> is scheduled today!
              </p>
            </div>
          </div>
          {upcomingTodayVisit.owner_phone && (
            <a
              href={`https://wa.me/91${String(upcomingTodayVisit.owner_phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I have scheduled a visit for ${upcomingTodayVisit.property_title || 'your rental property'} today at ${formatVisitTime(upcomingTodayVisit.visit_time)}.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-xs flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer transition-all self-end sm:self-auto"
            >
              <SiWhatsapp size={12} className="text-emerald-600" /> Chat with Owner
            </a>
          )}
        </div>
      )}

      {/* 🧭 Top Bar: Title + Compact Filters + Schedule Button */}
      <div className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0 border border-emerald-100">
            <Calendar size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm text-slate-900">Scheduled Site Visits</h2>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                {localVisits.length} Total
              </span>
            </div>
            <p className="text-[10.5px] text-gray-400">Track and manage property inspections</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between md:justify-end">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100/90 p-0.5 rounded-lg border border-slate-200/80 text-[11px] font-semibold text-slate-600">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${filter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'}`}
            >
              All ({counts.all})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${filter === 'pending' ? 'bg-white text-amber-700 shadow-2xs font-bold' : 'hover:text-amber-700'}`}
            >
              Pending ({counts.pending})
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${filter === 'confirmed' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'hover:text-emerald-700'}`}
            >
              Confirmed ({counts.confirmed})
            </button>
            {counts.completed > 0 && (
              <button
                onClick={() => setFilter('completed')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${filter === 'completed' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'hover:text-blue-700'}`}
              >
                Done ({counts.completed})
              </button>
            )}
          </div>

          {/* 🎛️ Drawer Filter Trigger Button */}
          <button
            type="button"
            onClick={() => setIsFilterDrawerOpen(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shrink-0 ${
              activeDrawerFilterCount > 0
                ? 'bg-[#0f2b3d] text-white border-[#0f2b3d] shadow-2xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-2xs'
            }`}
          >
            <Filter size={12} className={activeDrawerFilterCount > 0 ? 'text-amber-400' : 'text-slate-500'} />
            <span>Filters</span>
            {activeDrawerFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[9px] font-black flex items-center justify-center">
                {activeDrawerFilterCount}
              </span>
            )}
          </button>

          <button
            onClick={onScheduleVisit}
            className="px-3 py-1.5 rounded-lg bg-[#0b3856] hover:bg-[#07263b] text-white font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer transition-all shrink-0"
          >
            <Plus size={13} />
            <span>Schedule Visit</span>
          </button>
        </div>
      </div>

      {/* 🏷️ Property-Wise Filter Pills */}
      {propertyOptions.length > 1 && (
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1 pr-1 shrink-0 flex items-center gap-1">
            <Filter size={11} className="text-slate-400" /> Filter by Property:
          </span>
          <button
            onClick={() => setSelectedPropertyId('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer ${selectedPropertyId === 'all'
                ? 'bg-[#0b3856] text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
          >
            All Properties ({localVisits.length})
          </button>
          {propertyOptions.map((prop) => (
            <button
              key={prop.id}
              onClick={() => setSelectedPropertyId(prop.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${selectedPropertyId === prop.id
                  ? 'bg-[#0b3856] text-white shadow-2xs font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
            >
              <span className="truncate max-w-[150px]">{prop.title}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${selectedPropertyId === prop.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600 font-bold'
                }`}>
                {prop.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* 🔍 Advanced Search & Date Range Filter Toolbar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Search box */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search visits by property, society, location or owner..."
              className="w-full pl-9 pr-8 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b3856]/20 focus:border-[#0b3856]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Quick Date Filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 shrink-0 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setDateFilterMode('all')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${dateFilterMode === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'hover:text-slate-900'
              }`}
            >
              All Dates (Ignore Date)
            </button>
            <button
              type="button"
              onClick={() => setDateFilterMode('today')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${dateFilterMode === 'today'
                ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                : 'hover:text-emerald-700'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setDateFilterMode('upcoming')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${dateFilterMode === 'upcoming'
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'hover:text-blue-700'
              }`}
            >
              Upcoming
            </button>
            <button
              type="button"
              onClick={() => setDateFilterMode('past')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${dateFilterMode === 'past'
                ? 'bg-white text-amber-700 shadow-2xs font-bold'
                : 'hover:text-amber-700'
              }`}
            >
              Past Visits
            </button>
            <button
              type="button"
              onClick={() => setDateFilterMode('custom')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${dateFilterMode === 'custom'
                ? 'bg-white text-purple-700 shadow-2xs font-bold'
                : 'hover:text-purple-700'
              }`}
            >
              <CalendarRange size={12} />
              <span>Date Range</span>
            </button>
          </div>
        </div>

        {/* Custom Date Range Picker (Only when Custom is selected) */}
        {dateFilterMode === 'custom' && (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-600 font-bold flex items-center gap-1 text-[11px]">
              <Calendar size={12} className="text-purple-600" /> From:
            </span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
            />
            <span className="text-slate-600 font-bold text-[11px]">To:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
            />
            {(customStartDate || customEndDate) && (
              <button
                type="button"
                onClick={() => { setCustomStartDate(''); setCustomEndDate(''); }}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline ml-auto cursor-pointer"
              >
                Clear Range
              </button>
            )}
          </div>
        )}

        {/* Filter Summary / Clear All button */}
        {(searchQuery || dateFilterMode !== 'all' || selectedPropertyId !== 'all' || filter !== 'all') && (
          <div className="pt-1.5 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-50">
            <span>
              Showing <strong>{filteredVisits.length}</strong> of {localVisits.length} site visits
            </span>
            <button
              type="button"
              onClick={() => {
                setFilter('all');
                setSelectedPropertyId('all');
                setDateFilterMode('all');
                setCustomStartDate('');
                setCustomEndDate('');
                setSearchQuery('');
              }}
              className="font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <X size={11} /> Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* 📦 Bulk Selection & Action Bar */}
      {filteredVisits.length > 0 && (
        <div className="bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-200/90 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAllVisible}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              {filteredVisits.length > 0 && filteredVisits.every((v) => selectedVisitIds.includes(v.id)) ? (
                <CheckSquare size={15} className="text-blue-600" />
              ) : (
                <Square size={15} className="text-slate-400" />
              )}
              <span>Select All Visible ({filteredVisits.length})</span>
            </button>
            {selectedVisitIds.length > 0 && (
              <span className="text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                {selectedVisitIds.length} Selected
              </span>
            )}
          </div>

          {selectedVisitIds.length > 0 && (
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleBulkDelete}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Trash2 size={13} />
              <span>Delete Selected ({selectedVisitIds.length})</span>
            </button>
          )}
        </div>
      )}

      {/* 📋 Compact Site Visits List with Scroll Container */}
      {filteredVisits.length > 0 ? (
        <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
          {filteredVisits.map((v: any, idx: number) => {
            const { dateStr, dayName, dayNum, monthShort } = parseVisitDate(v.visit_date);
            const formattedTime = formatVisitTime(v.visit_time);
            const slotMeta = getSlotMeta(v.visit_time);
            const slotRange = getSlotTimeRange(v.visit_time);
            const isSelected = selectedVisitIds.includes(v.id);

            const status = v.status || 'Scheduled';
            const isConfirmed = status === 'Confirmed' || status === 'Approved';
            const isPendingTenant = status === 'Pending Tenant Approval' || status === 'Rescheduled by Owner' || (status.includes('Pending') && String(v.remarks || '').toLowerCase().includes('owner proposed'));
            const isPendingOwner = (status === 'Pending Owner Approval' || status === 'Pending Approval' || status === 'Scheduled' || status === 'Rescheduled by Tenant') && !isPendingTenant;
            const isPending = isPendingOwner || isPendingTenant;
            const isCompleted = status === 'Completed';
            const isDeclined = status === 'Declined' || status === 'Cancelled';

            return (
              <div
                key={v.id || idx}
                className={`bg-white rounded-xl border transition-all p-3 sm:p-3.5 flex flex-col gap-2.5 ${isSelected
                    ? 'border-blue-400 bg-blue-50/20 shadow-xs ring-1 ring-blue-300'
                    : isPendingTenant
                      ? 'border-amber-300 bg-amber-50/20 shadow-xs ring-1 ring-amber-200'
                      : 'border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                  }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Left: Checkbox + Compact Date Chip + Property Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Select Checkbox */}
                    {v.id && (
                      <button
                        type="button"
                        onClick={() => toggleSelectVisit(v.id)}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 transition-colors cursor-pointer shrink-0"
                        title="Select visit"
                      >
                        {isSelected ? (
                          <CheckSquare size={16} className="text-blue-600" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    )}

                    {/* Compact Date Badge */}
                    <div className={`w-11 h-11 rounded-lg flex flex-col items-center justify-center shrink-0 border ${isPendingTenant
                        ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold'
                        : isConfirmed || isCompleted
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : isDeclined
                            ? 'bg-rose-50 border-rose-200 text-rose-800'
                            : 'bg-amber-50 border-amber-200 text-amber-800'
                      }`}>
                      <span className="text-sm font-black leading-tight">{dayNum}</span>
                      <span className="text-[9px] font-extrabold uppercase leading-none">
                        {monthShort}
                      </span>
                    </div>

                    {/* Title & Metadata */}
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
                              className="font-bold text-xs sm:text-sm text-slate-900 hover:text-blue-600 hover:underline truncate text-left cursor-pointer flex items-center gap-1.5 transition-colors"
                              title="Click to view full visit history & audit timeline"
                            >
                              <span className="truncate">{displayTitle}</span>
                              <Eye size={12} className="text-slate-400 hover:text-blue-600 shrink-0" />
                            </button>
                          );
                        })()}
                        {v.rental_property_id && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono font-bold text-[9px]">
                            RENT-{v.rental_property_id}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                        {/* Slot chip */}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-bold text-[10px] ${slotMeta.bg} ${slotMeta.color} ${slotMeta.border}`}>
                          <Clock size={9} />
                          <span>{slotMeta.icon} {slotMeta.label}</span>
                          {slotRange && <span className="font-normal opacity-80">· {slotRange}</span>}
                        </span>
                        <span>•</span>
                        <span className="font-medium text-slate-600">{dayName}, {dateStr}</span>
                        {v.meeting_point && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 truncate text-gray-500 max-w-[200px]">
                              <MapPin size={10} className="text-orange-500 shrink-0" />
                              <span className="truncate">{v.meeting_point}</span>
                            </span>
                          </>
                        )}
                      </div>

                      {(() => {
                        if (!v.remarks) return null;
                        const rem = String(v.remarks).trim();
                        // If remark is an obsolete reschedule text containing a different time, skip displaying obsolete time
                        if (rem.startsWith('Rescheduled to') && (rem.includes('AM') || rem.includes('PM')) && !rem.toLowerCase().includes(formattedTime.toLowerCase())) {
                          return null;
                        }
                        return (
                          <p className="text-[10px] text-slate-500 italic truncate max-w-md">
                            Note: {rem}
                          </p>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Right: Status Pill & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 flex-wrap">
                    {(() => {
                      const isPastVisit = (() => {
                        if (!v.visit_date) return false;
                        try {
                          const { dateObj } = parseVisitDate(v.visit_date);
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

                      return (
                        <>
                          {isPendingTenant && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10.5px] animate-pulse">
                              <Clock size={12} className="text-amber-700" />
                              <span>Pending Your Approval</span>
                            </div>
                          )}

                          {isConfirmed && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10.5px]">
                              <CheckCircle2 size={12} className="text-emerald-600" />
                              <span>Confirmed Visit</span>
                            </div>
                          )}

                          {isCompleted && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-bold text-[10.5px]">
                              <CheckCircle2 size={12} className="text-blue-600" />
                              <span>Completed</span>
                            </div>
                          )}

                          {isPendingOwner && !isPastVisit && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10.5px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span>Pending Owner Approval</span>
                            </div>
                          )}

                          {isPendingOwner && isPastVisit && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 font-bold text-[10.5px]">
                              <Clock size={12} className="text-rose-600" />
                              <span>Unattended (Time Passed)</span>
                            </div>
                          )}

                          {isDeclined && (
                            <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 font-bold text-[10.5px]">
                              <XCircle size={12} className="text-rose-600" />
                              <span>Declined</span>
                            </div>
                          )}

                          {/* Action Buttons */}
                          {/* If Pending Owner Approval & Past: Show Prominent Reschedule Button */}
                          {isPendingOwner && isPastVisit && (
                            <button
                              type="button"
                              onClick={() => handleOpenSuggestAnotherTime(v)}
                              className="px-2.5 py-1 rounded-lg bg-[#0b3856] hover:bg-[#07263b] text-white font-bold text-[10.5px] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            >
                              <Clock size={11} className="text-amber-300" />
                              <span>Reschedule Visit</span>
                            </button>
                          )}

                          {/* If Pending Owner Approval & Upcoming: Show Edit Schedule Button */}
                          {isPendingOwner && !isPastVisit && (
                            <button
                              type="button"
                              onClick={() => handleOpenSuggestAnotherTime(v)}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-[10px] transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Clock size={11} className="text-amber-700" />
                              <span>Edit Schedule</span>
                            </button>
                          )}

                          {/* If Confirmed: Show Reschedule & Record Outcome Buttons */}
                          {isConfirmed && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenSuggestAnotherTime(v)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold text-[10px] transition-colors cursor-pointer flex items-center gap-1"
                                title="Reschedule visit"
                              >
                                <Clock size={11} className="text-blue-600" />
                                <span>Reschedule</span>
                              </button>
                              {isPastVisit && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveFeedbackVisit(v);
                                    setCompletionStatus('Completed');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px] transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <CheckCircle2 size={11} className="text-emerald-700" />
                                  <span>Record Outcome</span>
                                </button>
                              )}
                            </div>
                          )}
                        </>
                      );
                    })()}

                    {/* View Full History Button */}
                    <button
                      type="button"
                      onClick={() => setViewingHistoryVisit(v)}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors border border-slate-200 cursor-pointer flex items-center gap-1 text-[10.5px] font-bold"
                      title="View complete visit history & timeline"
                    >
                      <History size={13} className="text-slate-500" />
                      <span className="hidden sm:inline">History</span>
                    </button>

                    {/* Owner WhatsApp Action */}
                    {v.owner_phone && (
                      <a
                        href={`https://wa.me/91${String(v.owner_phone).replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, regarding my scheduled visit for ${v.property_title || 'your property'} on ${dateStr} at ${formattedTime}.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200 cursor-pointer"
                        title="Chat with Owner on WhatsApp"
                      >
                        <SiWhatsapp size={13} />
                      </a>
                    )}

                    {/* Single Delete Action */}
                    {v.id && (
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={(e) => handleDeleteSingle(v.id, v.property_title, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                        title="Delete site visit"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* 🌟 2-Way Reschedule Action Banner for Tenant when Owner proposes a new time */}
                {isPendingTenant && (
                  <div className="mt-1 p-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50/70 border border-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 animate-bounce">
                        🔔
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-amber-950 block text-[11.5px] sm:text-xs">
                          Owner Proposed New Time: <strong className="text-[#0b3856] underline">{formattedTime}</strong> on <strong className="text-[#0b3856] underline">{dayName}, {dateStr}</strong>
                        </span>
                        {v.remarks && (
                          <span className="text-[10px] text-amber-800 italic truncate block max-w-md">{v.remarks}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleAcceptProposedTime(v.id, v)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] transition shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Check size={12} />
                        <span>Accept Proposed Time</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenSuggestAnotherTime(v)}
                        className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                      >
                        <Clock size={12} className="text-amber-700" />
                        <span>Suggest Another Time</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center shadow-2xs space-y-2">
          <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-xs">No Scheduled Visits</h3>
          <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
            Book site inspections directly from property listings matching your preferred schedule.
          </p>
          <button
            onClick={onScheduleVisit}
            className="mt-1 px-3 py-1.5 rounded-lg bg-[#0b3856] text-white font-bold text-xs hover:bg-[#07263b] transition-all cursor-pointer inline-flex items-center gap-1"
          >
            <Plus size={12} /> Schedule New Visit
          </button>
        </div>
      )}

      {/* ✏️ Dedicated Edit Site Visit Schedule Modal (Only for Pending Visits) */}
      {editingVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="bg-[#0b3856] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-amber-300" />
                <div>
                  <h3 className="font-extrabold text-sm text-white">Edit Visit Schedule</h3>
                  <p className="text-[10px] text-slate-300 truncate max-w-xs">
                    {editingVisit.property_title || editingVisit.rental_property_title || 'Rental Property'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingVisit(null)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveEditVisit} className="p-4 space-y-3.5">
              {/* Date Picker */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Select Inspection Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={editDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setEditDate(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#0b3856] focus:outline-none"
                />
              </div>

              {/* Time Picker */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    Preferred Time Slot <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomMode(!isCustomMode)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                  >
                    {isCustomMode ? 'Use Quick Preset Slots' : '+ Set Custom Time'}
                  </button>
                </div>

                {!isCustomMode ? (
                  <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-200/80">
                    {['09:00 AM', '10:00 AM', '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setEditTime(t)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${editTime === t
                            ? 'bg-[#0b3856] text-white border-[#0b3856] shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1 p-2.5 bg-blue-50/60 rounded-xl border border-blue-200">
                    <label className="block text-[10px] font-bold text-blue-900 uppercase">
                      Enter Custom Time (24h or Clock Picker)
                    </label>
                    <input
                      type="time"
                      value={editCustomTime}
                      onChange={(e) => setEditCustomTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-blue-300 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required={isCustomMode}
                    />
                    <p className="text-[10px] text-blue-700">
                      You can select any precise time (e.g. 06:45 PM, 07:15 PM).
                    </p>
                  </div>
                )}
              </div>

              {/* Remarks Note */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Note for Landlord (Optional)
                </label>
                <textarea
                  rows={2}
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  placeholder="E.g., requested evening slot due to office hours..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#0b3856] focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 -mx-4 -mb-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingVisit(null)}
                  className="px-3 py-1.5 rounded-xl bg-gray-200 text-gray-800 font-bold text-xs hover:bg-gray-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="px-4 py-1.5 rounded-xl bg-[#0b3856] hover:bg-[#07263b] text-white font-extrabold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submittingEdit && <Loader2 size={12} className="animate-spin" />}
                  <span>Save & Request Approval</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📝 Visit Outcome Modal (Completed or Missed) */}
      {activeFeedbackVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="bg-[#0b3856] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-300" />
                <div>
                  <h3 className="font-extrabold text-sm text-white">Did your visit take place?</h3>
                  <p className="text-[10px] text-slate-300 truncate max-w-xs">
                    {activeFeedbackVisit.property_title || activeFeedbackVisit.rental_property_title || 'Rental Property'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (activeFeedbackVisit?.id) {
                    sessionStorage.setItem(`dismissed_tenant_visit_feedback_${activeFeedbackVisit.id}`, 'true');
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
                        Feedback Prompt
                      </span>
                    </div>
                    <p className="font-extrabold text-slate-900 text-xs">
                      {activeFeedbackVisit.property_title || activeFeedbackVisit.rental_property_title || 'Rental Property'}
                    </p>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Inspection Date: <span className="font-bold text-slate-800">{parsed.dateStr} at {time}</span>
                    </p>
                  </div>
                );
              })()}

              <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCompletionStatus('Completed')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${completionStatus === 'Completed'
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
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${completionStatus === 'Rescheduled'
                      ? 'bg-[#0b3856] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  🔄 Reschedule
                </button>
                <button
                  type="button"
                  onClick={() => setCompletionStatus('Missed')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${completionStatus === 'Missed'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  ✗ Missed
                </button>
              </div>

              {completionStatus === 'Completed' && (
                <div className="space-y-3">
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

                  {/* 🏠 Interest in Property Section */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2.5">
                    <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Building2 size={13} className="text-[#0b3856]" />
                      Are you interested in this property?
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setInterestedStatus('interested')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border-2 transition cursor-pointer ${
                          interestedStatus === 'interested'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-700'
                        }`}
                      >
                        <ThumbsUp size={13} />
                        Yes, Interested!
                      </button>
                      <button
                        type="button"
                        onClick={() => setInterestedStatus('not_interested')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border-2 transition cursor-pointer ${
                          interestedStatus === 'not_interested'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-rose-400 hover:text-rose-700'
                        }`}
                      >
                        <ThumbsDown size={13} />
                        Not Interested
                      </button>
                    </div>

                    {interestedStatus === 'interested' && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                        Great! Our team will help you reserve this property. You can also book directly from the Site Visits tab.
                      </div>
                    )}

                    {interestedStatus === 'not_interested' && (
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">Reason for not interested</label>
                        <select
                          value={notInterestedReason}
                          onChange={(e) => setNotInterestedReason(e.target.value)}
                          className="w-full p-2 rounded-xl border border-rose-200 bg-white text-xs font-medium focus:ring-2 focus:ring-rose-400 focus:outline-none"
                        >
                          <option>Price too high</option>
                          <option>Location not suitable</option>
                          <option>Property condition not as expected</option>
                          <option>Owner terms not acceptable</option>
                          <option>Found another property</option>
                          <option>Size / layout not suitable</option>
                          <option>Other reason</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Feedback / Notes for Landlord (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={visitFeedbackText}
                      onChange={(e) => setVisitFeedbackText(e.target.value)}
                      placeholder="Liked the flat, discussing terms with owner..."
                      className="w-full p-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {completionStatus === 'Rescheduled' && (
                <div className="space-y-3 animate-in fade-in duration-150 p-3 rounded-xl bg-blue-50/50 border border-blue-200">
                  <span className="text-[11px] font-extrabold text-[#0b3856] block">
                    Propose New Date & Time for Landlord
                  </span>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                      New Visit Date <span className="text-rose-500">*</span>
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

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                      Note for Landlord (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={rescheduleRemarks}
                      onChange={(e) => setRescheduleRemarks(e.target.value)}
                      placeholder="Requesting rescheduled slot due to busy schedule..."
                      className="w-full p-2 rounded-xl border border-blue-200 bg-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {completionStatus === 'Missed' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Reason
                    </label>
                    <select
                      value={missedReason}
                      onChange={(e) => setMissedReason(e.target.value)}
                      className="w-full p-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    >
                      <option value="Could not visit due to busy schedule">Could not visit due to busy schedule</option>
                      <option value="Owner was unavailable">Owner was unavailable</option>
                      <option value="Visited another property">Visited another property</option>
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
                className={`px-4 py-1.5 rounded-xl text-white font-extrabold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${completionStatus === 'Completed'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : completionStatus === 'Rescheduled'
                    ? 'bg-[#0b3856] hover:bg-[#08283d]'
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
                    ? `Delete ${deleteConfirmModal.count} Site Visits?`
                    : 'Delete Scheduled Site Visit?'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {deleteConfirmModal.type === 'bulk'
                    ? `Are you sure you want to permanently delete ${deleteConfirmModal.count} selected site visits? This action cannot be undone.`
                    : `Are you sure you want to remove the scheduled site visit for "${deleteConfirmModal.propertyTitle || 'this property'}"?`}
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
                disabled={isDeleting}
                onClick={handleExecuteDelete}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isDeleting && <Loader2 size={12} className="animate-spin" />}
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
            setEditingVisit(v);
            const parsed = parseVisitDate(v.visit_date);
            const yr = parsed.dateObj.getFullYear();
            const mo = String(parsed.dateObj.getMonth() + 1).padStart(2, '0');
            const da = String(parsed.dateObj.getDate()).padStart(2, '0');
            setEditDate(`${yr}-${mo}-${da}`);
            setEditTime(formatVisitTime(v.visit_time) || '11:00 AM');
            setEditRemarks(v.remarks || '');
            setIsCustomMode(false);
            setEditCustomTime('');
          }}
          onRecordOutcome={(v) => {
            setActiveFeedbackVisit(v);
            setCompletionStatus('Completed');
          }}
        />
      )}

      {/* 🎛️ Slide-over Filter Drawer (Site Visit Specific) */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 bg-[#0f2b3d] text-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-amber-400" />
                <h3 className="font-bold text-sm text-white">Filter Site Visits</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetDrawerFilters}
                  className="text-xs text-amber-300 hover:text-amber-200 font-semibold underline cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-1 rounded-md text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <X size={18} />
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
                  <option value="all">All Properties ({localVisits.length})</option>
                  {propertyOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.count})
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
                  <option value="Pending">Pending / Scheduled</option>
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
                  id="tenant-ignore-date"
                  checked={drawerIgnoreDate}
                  onChange={(e) => setDrawerIgnoreDate(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0f2b3d] focus:ring-[#0f2b3d] cursor-pointer"
                />
                <label htmlFor="tenant-ignore-date" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Ignore Date
                </label>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetDrawerFilters}
                className="flex-1 py-2.5 rounded-lg border border-orange-500 text-orange-600 font-bold text-xs hover:bg-orange-50 transition cursor-pointer text-center"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleApplyDrawerFilters}
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
}
