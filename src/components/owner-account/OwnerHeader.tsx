import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  BarChart3, LogOut, CheckCircle2, User, Bell, ChevronDown,
  Shield, Building2, Calendar, Settings, ExternalLink, Clock, MessageSquare, PhoneCall
} from 'lucide-react';
import { connectSocket, getSocket } from '@/lib/socket';
import { toast } from 'react-toastify';

interface OwnerHeaderProps {
  owner: any;
  visits?: any[];
  inquiries?: any[];
  onOpenMobileSidebar: () => void;
  onLogout: () => void;
  onOpenEditModal: () => void;
  onNavigateTab?: (tabId: string) => void;
}

export const OwnerHeader: React.FC<OwnerHeaderProps> = ({
  owner,
  visits = [],
  inquiries = [],
  onOpenMobileSidebar,
  onLogout,
  onOpenEditModal,
  onNavigateTab,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [liveNotifications, setLiveNotifications] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Connect socket.io for real-time notifications
  useEffect(() => {
    if (!owner?.id) return;
    const socket = connectSocket(owner.id);

    const handleVisitCreated = (data: any) => {
      const isForThisOwner = !data.owner_id || Number(data.owner_id) === Number(owner.id);
      if (isForThisOwner) {
        toast.info(`🔔 New visit booked: ${data.property_title || 'Property'} by ${data.tenant_name || 'Tenant'}`);
        setLiveNotifications((prev) => [
          {
            id: `created_${Date.now()}`,
            badge: 'New Visit Request',
            badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
            title: `New Site Visit Request from ${data.tenant_name || 'Tenant'}`,
            desc: `${data.tenant_name || 'A tenant'} booked a visit for ${data.property_title || 'your property'} at ${data.visit_time || 'scheduled time'}.`,
            time: 'Just now',
            priority: 1,
            type: 'visit',
            tab: 'visits',
          },
          ...prev,
        ]);
      }
    };

    const handleVisitRescheduled = (data: any) => {
      const isForThisOwner = !data.owner_id || Number(data.owner_id) === Number(owner.id);
      if (isForThisOwner) {
        toast.info(`🔔 Visit Rescheduled: Tenant suggested a new time for ${data.property_title || 'Property'}`);
        setLiveNotifications((prev) => [
          {
            id: `resched_${Date.now()}`,
            badge: 'Tenant Rescheduled',
            badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
            title: `Tenant Suggested New Time: ${data.tenant_name || 'Tenant'}`,
            desc: `Proposed: ${data.proposed_visit_date || data.visit_date || 'New Date'} at ${data.proposed_visit_time || data.visit_time || 'New Time'}. Please review & confirm.`,
            time: 'Just now',
            priority: 1,
            type: 'visit_reschedule',
            tab: 'visits',
          },
          ...prev,
        ]);
      }
    };

    const handleVisitConfirmed = (data: any) => {
      const isForThisOwner = !data.owner_id || Number(data.owner_id) === Number(owner.id);
      if (isForThisOwner) {
        toast.success(`🎉 Visit confirmed for ${data.property_title || 'property'}`);
        setLiveNotifications((prev) => [
          {
            id: `conf_${Date.now()}`,
            badge: 'Visit Confirmed',
            badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
            title: `Confirmed: Visit with ${data.tenant_name || 'Tenant'}`,
            desc: `Visit locked in for ${data.visit_date || 'Date'} at ${data.visit_time || 'Time'}.`,
            time: 'Just now',
            priority: 2,
            type: 'visit_confirmed',
            tab: 'visits',
          },
          ...prev,
        ]);
      }
    };

    const handleGenericNotification = (data: any) => {
      setLiveNotifications((prev) => [
        {
          id: `gen_${Date.now()}`,
          badge: data.badge || 'Alert',
          badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
          title: data.title || 'New Alert',
          desc: data.message || '',
          time: 'Just now',
          priority: 3,
          type: data.type || 'alert',
        },
        ...prev,
      ]);
    };

    socket?.on('visit_created', handleVisitCreated);
    socket?.on('visit_rescheduled', handleVisitRescheduled);
    socket?.on('visit_confirmed', handleVisitConfirmed);
    socket?.on('notification', handleGenericNotification);

    return () => {
      socket?.off('visit_created', handleVisitCreated);
      socket?.off('visit_rescheduled', handleVisitRescheduled);
      socket?.off('visit_confirmed', handleVisitConfirmed);
      socket?.off('notification', handleGenericNotification);
    };
  }, [owner?.id]);

  // Derived initial notifications from real visits and inquiries
  const dynamicNotifications = useMemo(() => {
    const list: any[] = [...liveNotifications];

    const formatNotificationTime = (dateStr: any, fallbackDateText: string, fallbackTimeText?: string) => {
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

    // From visits array (passed from page or owner object)
    const allVisits = Array.isArray(visits) && visits.length > 0 ? visits : (Array.isArray(owner?.tenant_visits) ? owner.tenant_visits : []);
    allVisits.forEach((v: any) => {
      const isTenantRescheduled = (v.status === 'Pending Owner Approval' || v.status === 'Rescheduled') && v.rescheduled_by === 'tenant';
      const isPendingTenantApproval = v.status === 'Pending Tenant Approval' || v.rescheduled_by === 'owner';
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
      const notifTime = formatNotificationTime(v.updated_at || v.created_at || v.createdAt, dateText, timeText);

      if (isTenantRescheduled) {
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
          id: `visit_tresched_${v.id}`,
          badge: 'Tenant Rescheduled',
          badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
          title: `Tenant Suggested New Time: ${v.tenant_name || 'Tenant'}`,
          desc: `${v.property_title || v.rental_property_title || 'Rental Unit'} • Proposed ${propDateText} at ${propTime}${v.remarks ? ` ("${v.remarks}")` : ''}`,
          time: notifTime,
          priority: 1,
          type: 'visit_reschedule',
          tab: 'visits',
        });
      } else if (isPendingTenantApproval) {
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
          id: `visit_await_${v.id}`,
          badge: 'Awaiting Tenant',
          badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-200',
          title: `Offered New Slot to ${v.tenant_name || 'Tenant'}`,
          desc: `${v.property_title || v.rental_property_title || 'Rental Unit'} • Offered ${propDateText} at ${propTime}`,
          time: notifTime,
          priority: 2,
          type: 'visit_awaiting',
          tab: 'visits',
        });
      } else if (isConfirmed) {
        list.push({
          id: `visit_conf_${v.id}`,
          badge: 'Confirmed Visit',
          badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          title: `Confirmed: Visit with ${v.tenant_name || 'Tenant'}`,
          desc: `${v.property_title || v.rental_property_title || 'Rental Property'} • ${dateText} at ${timeText}`,
          time: notifTime,
          priority: 3,
          type: 'visit_confirmed',
          tab: 'visits',
        });
      } else if (isPending) {
        list.push({
          id: `visit_pend_${v.id}`,
          badge: 'Visit Request',
          badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
          title: `Site Visit Request from ${v.tenant_name || 'Tenant'}`,
          desc: `${v.property_title || v.rental_property_title || 'Rental Property'} • ${dateText} at ${timeText}`,
          time: notifTime,
          priority: 1,
          type: 'visit_pending',
          tab: 'visits',
        });
      } else if (isDeclined) {
        list.push({
          id: `visit_decl_${v.id}`,
          badge: 'Declined',
          badgeColor: 'bg-rose-100 text-rose-900 border-rose-200',
          title: `Declined Visit: ${v.tenant_name || 'Tenant'}`,
          desc: `${v.property_title || v.rental_property_title || 'Rental Property'} • ${dateText} at ${timeText}`,
          time: notifTime,
          priority: 4,
          type: 'visit_declined',
          tab: 'visits',
        });
      }
    });

    // From inquiries
    const allInquiries = Array.isArray(inquiries) && inquiries.length > 0 ? inquiries : (Array.isArray(owner?.prospective_inquiries) ? owner.prospective_inquiries : []);
    allInquiries.forEach((inq: any) => {
      const notifTime = formatNotificationTime(inq.created_at || inq.createdAt || inq.date, 'Recent');
      list.push({
        id: `inq_${inq.id || inq.phone || Math.random()}`,
        badge: 'Direct Lead',
        badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
        title: `Direct Inquiry: ${inq.tenant_name || inq.name || 'Prospective Tenant'}`,
        desc: `${inq.society_name || inq.rental_property_title || inq.property_title || 'Rental Listing'} • ${inq.preferred_bhk || '2 BHK'}`,
        time: notifTime,
        priority: 2,
        type: 'inquiry',
        tab: 'inquiries',
      });
    });

    if (list.length === 0) {
      list.push({
        id: 'welcome',
        badge: 'System',
        badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
        title: 'Account Live & Active',
        desc: 'Your landlord account is verified. You will receive real-time visit and inquiry alerts here.',
        time: 'Today',
        priority: 9,
        type: 'system',
      });
    }

    // Sort by priority (Pending visits first)
    return list.sort((a, b) => (a.priority || 5) - (b.priority || 5));
  }, [owner, visits, inquiries, liveNotifications]);

  const ownerName = owner?.name || 'Owner';
  const ownerInitial = ownerName.charAt(0).toUpperCase();
  const ownerCode = `OWN${String(owner?.id || '1').padStart(4, '0')}`;

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shrink-0 shadow-2xs z-30 relative">
      {/* Left Title & Status */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
          title="Open Menu"
        >
          <BarChart3 size={16} />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
              Owner Portal Account
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border border-emerald-200 bg-emerald-50 text-emerald-700 flex items-center gap-1">
              <CheckCircle2 size={10} />
              <span>{owner?.status || 'Active Owner'}</span>
            </span>
          </div>
          <p className="text-[10px] text-gray-500 hidden sm:block">
            Track rental properties, prospective inquiries, site visits, and monthly cash flow.
          </p>
        </div>
      </div>

      {/* Right Controls: Notifications & Profile Dropdown */}
      <div className="flex items-center gap-2">
        {/* 🔔 Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-gray-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer relative"
            title="Notifications"
          >
            <Bell size={18} />
            {dynamicNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-92 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[420px] overflow-y-auto divide-y divide-gray-50">
              <div className="flex items-center justify-between pb-2.5">
                <div className="flex items-center gap-1.5">
                  <Bell size={14} className="text-orange-500" />
                  <span className="font-black text-xs text-slate-900 tracking-tight">Notifications & Alerts</span>
                </div>
                <span className="text-[9.5px] font-extrabold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                  {dynamicNotifications.length} Alerts
                </span>
              </div>
              <div className="py-2 space-y-2 max-h-80 overflow-y-auto">
                {dynamicNotifications.map((notif, idx) => (
                  <div
                    key={notif.id || idx}
                    onClick={() => {
                      if (notif.tab) onNavigateTab?.(notif.tab);
                      setShowNotifications(false);
                    }}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer text-left space-y-1 border ${
                      notif.priority === 1
                        ? 'bg-amber-50/80 hover:bg-amber-100/80 border-amber-200 shadow-2xs'
                        : notif.type === 'visit_confirmed'
                          ? 'bg-emerald-50/70 hover:bg-emerald-100/70 border-emerald-200'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className={`px-1.5 py-0.5 rounded border text-[8.5px] font-black uppercase tracking-wider flex items-center gap-1 ${notif.badgeColor || 'bg-slate-100 text-slate-800'}`}>
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
                    <p className="text-[10.5px] text-slate-600 leading-snug">{notif.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 👤 Profile Avatar Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0b3856] to-[#1e4e6d] text-white flex items-center justify-center font-black text-xs shadow-2xs">
              {ownerInitial}
            </div>
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-xs font-extrabold text-slate-900 truncate max-w-[130px]">
                {ownerName}
              </span>
              <span className="text-[10px] text-orange-600 font-bold font-mono">
                {ownerCode}
              </span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
              {/* Profile Card Header */}
              <div className="px-3.5 py-2.5 border-b border-gray-100 bg-slate-50/50">
                <div className="font-extrabold text-slate-900">{ownerName}</div>
                <div className="text-[10px] text-gray-500 truncate">{owner?.email || 'owner@resaleexpert.in'}</div>
                <div className="mt-1 flex items-center gap-1">
                  <span className="px-2 py-0.2 rounded-md bg-orange-100 text-orange-800 font-mono font-bold text-[9px]">
                    {ownerCode}
                  </span>
                  <span className="px-2 py-0.2 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                    Verified Owner
                  </span>
                </div>
              </div>

              {/* Menu Links */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigateTab?.('profile');
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-orange-50 hover:text-orange-700 font-semibold cursor-pointer transition-colors text-left"
                >
                  <User size={14} className="text-slate-400" />
                  <span>Profile & Credentials</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenEditModal();
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-orange-50 hover:text-orange-700 font-semibold cursor-pointer transition-colors text-left"
                >
                  <Settings size={14} className="text-slate-400" />
                  <span>Edit Personal Info</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigateTab?.('properties');
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-orange-50 hover:text-orange-700 font-semibold cursor-pointer transition-colors text-left"
                >
                  <Building2 size={14} className="text-slate-400" />
                  <span>My Properties</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigateTab?.('visits');
                  }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-slate-700 hover:bg-orange-50 hover:text-orange-700 font-semibold cursor-pointer transition-colors text-left"
                >
                  <Calendar size={14} className="text-slate-400" />
                  <span>Site Visits & Tours</span>
                </button>
              </div>

              {/* Logout */}
              <div className="pt-1 border-t border-gray-100">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
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
  );
};

export default OwnerHeader;
