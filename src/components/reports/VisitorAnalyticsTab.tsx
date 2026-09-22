// frontend/src/components/reports/VisitorAnalyticsTab.tsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Users,
  Eye,
  Calculator,
  Search,
  Activity,
  Clock,
  TrendingUp,
  MapPin,
  Smartphone,
  Globe,
  RefreshCw,
  Calendar,
  Shield,
  Laptop,
  Check,
  Copy,
  Download,
  Filter,
  ExternalLink,
  ChevronRight,
  Layers,
  ArrowUpRight,
  Building,
  Tag,
  Monitor,
  Printer,
  Sparkles,
  Zap,
} from 'lucide-react';
import { api } from '@/lib/api';
import { ReportTable, ColumnDef, StatusPill } from './ReportTable';
import { VisitorDetailJourneyModal } from './VisitorDetailJourneyModal';
import { SmartFilterDrawer, SmartFilterParams } from './SmartFilterDrawer';
import {
  PRINT_BRAND_STYLE,
  buildWatermarkHTML,
  triggerIframePrint,
} from '@/lib/printUtils';

export const VisitorAnalyticsTab: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [activeStatusPill, setActiveStatusPill] = useState<string>('all');
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  // View Mode: 'sessions' (main activity table) or 'trends' (top properties & searches)
  const [viewMode, setViewMode] = useState<'sessions' | 'trends'>('sessions');
  const [showSplitOverview, setShowSplitOverview] = useState<boolean>(false);

  // Filter Drawer State
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<SmartFilterParams>({ ignoreDate: true, status: 'all' });

  // Pagination state for the main ReportTable
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(25);

  // Selected session for Deep-dive inspection modal
  const [selectedSession, setSelectedSession] = useState<any | null>(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await api.get('/analytics/overview', {
        params: {
          dateRange: filters.startDate && filters.endDate ? undefined : dateRange,
          startDate: filters.startDate,
          endDate: filters.endDate,
        },
      });

      if (resp.data?.success) {
        setData(resp.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch visitor analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange, filters]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIp(text);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return '< 1 min';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hrs}h ${remMins}m`;
    }
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const parseDevice = (userAgent?: string) => {
    if (!userAgent) return { label: 'Windows / Web', isMobile: false };
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone') || ua.includes('ios')) {
      return { label: 'Mobile Device', isMobile: true };
    }
    return { label: 'Desktop / PC', isMobile: false };
  };

  const summary = data?.summary || {};
  const topProperties: any[] = data?.topProperties || [];
  const topSearches: any[] = data?.topSearches || [];
  const recentSessions: any[] = data?.recentSessions || [];

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return recentSessions.filter((s: any) => {
      if (activeStatusPill === 'all') return true;
      const role = String(s.exact_role || '').toLowerCase();
      const source = String(s.source || '').toLowerCase();

      if (activeStatusPill === 'buyer') return role === 'buyer' || source === 'buyer_portal';
      if (activeStatusPill === 'seller') return role === 'seller' || source === 'seller_portal';
      if (activeStatusPill === 'owner') return role === 'owner' || source === 'owner_portal';
      if (activeStatusPill === 'tenant') return role === 'tenant' || source === 'tenant_portal';
      if (activeStatusPill === 'website') return !s.user_id && source === 'website';
      if (activeStatusPill === 'leads') return Boolean(s.lead_id);
      return true;
    });
  }, [recentSessions, activeStatusPill]);

  // Status Pills with Live Counts
  const statusPills: StatusPill[] = [
    { label: 'All Sessions', key: 'all', count: recentSessions.length },
    {
      label: 'Buyers',
      key: 'buyer',
      count: recentSessions.filter((s) => String(s.exact_role).toLowerCase() === 'buyer' || s.source === 'buyer_portal').length,
    },
    {
      label: 'Sellers',
      key: 'seller',
      count: recentSessions.filter((s) => String(s.exact_role).toLowerCase() === 'seller' || s.source === 'seller_portal').length,
    },
    {
      label: 'Owners',
      key: 'owner',
      count: recentSessions.filter((s) => String(s.exact_role).toLowerCase() === 'owner' || s.source === 'owner_portal').length,
    },
    {
      label: 'Tenants',
      key: 'tenant',
      count: recentSessions.filter((s) => String(s.exact_role).toLowerCase() === 'tenant' || s.source === 'tenant_portal').length,
    },
    {
      label: 'Website Guests',
      key: 'website',
      count: recentSessions.filter((s) => !s.user_id).length,
    },
    {
      label: 'Converted Leads',
      key: 'leads',
      count: recentSessions.filter((s) => Boolean(s.lead_id)).length,
    },
  ];

  // Render Exact Role Pill (matching LoggedInReportTab)
  const renderExactRoleBadge = (role?: string, source?: string) => {
    const r = String(role || (source?.includes('portal') ? source.replace('_portal', '') : 'GUEST')).toUpperCase();
    let bg = 'bg-slate-100 text-slate-700 border-slate-300';

    if (r === 'BUYER' || source === 'buyer_portal') {
      bg = 'bg-blue-100 text-blue-800 border-blue-300';
    } else if (r === 'SELLER' || source === 'seller_portal') {
      bg = 'bg-purple-100 text-purple-800 border-purple-300';
    } else if (r === 'OWNER' || source === 'owner_portal') {
      bg = 'bg-amber-100 text-amber-800 border-amber-300';
    } else if (r === 'TENANT' || source === 'tenant_portal') {
      bg = 'bg-teal-100 text-teal-800 border-teal-300';
    }

    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide border whitespace-nowrap ${bg}`}>
        {r}
      </span>
    );
  };

  // Main ReportTable Columns
  const columns: ColumnDef[] = [
    {
      key: 'user_identity',
      header: 'USER / VISITOR IDENTITY',
      searchPlaceholder: 'Name, Guest ID..',
      width: '230px',
      render: (row) => {
        const displayName = row.user_full_name || row.username;
        const hasUser = Boolean(row.user_id || displayName);
        const hasLead = Boolean(row.lead_id && row.lead_name);

        return (
          <div className="space-y-0.5 py-0.5">
            {hasUser ? (
              <div>
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="truncate max-w-[140px]" title={displayName || `User #${row.user_id}`}>
                    {displayName || `User #${row.user_id}`}
                  </span>
                  {row.user_id && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold bg-indigo-100 text-indigo-800 rounded border border-indigo-200 shrink-0">
                      #{row.user_id}
                    </span>
                  )}
                </div>
                {row.user_email && <div className="text-[10px] text-slate-500 font-mono truncate max-w-[190px]">{row.user_email}</div>}
              </div>
            ) : hasLead ? (
              <div>
                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <span className="truncate max-w-[140px]">{row.lead_name}</span>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold bg-rose-100 text-rose-800 rounded border border-rose-200 shrink-0">
                    Lead #{row.lead_id}
                  </span>
                </div>
                {row.lead_phone && <div className="text-[10px] text-slate-500 font-mono">{row.lead_phone}</div>}
              </div>
            ) : (
              <div>
                <div className="font-semibold text-slate-700 text-xs">Anonymous Guest</div>
              </div>
            )}
            <span className="text-[9.5px] text-slate-400 font-mono block truncate max-w-[190px]" title={row.guest_id}>
              {row.guest_id ? row.guest_id : '—'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'exact_role',
      header: 'ROLE / PORTAL',
      width: '130px',
      searchPlaceholder: 'Role..',
      render: (row) => (
        <div className="flex flex-col gap-1 items-start">
          {renderExactRoleBadge(row.exact_role, row.source)}
          <span className="text-[9.5px] text-slate-400 capitalize">
            {(row.source || 'website').replace(/_/g, ' ')}
          </span>
        </div>
      ),
    },
    {
      key: 'ip_address',
      header: 'FULL IP ADDRESS',
      width: '140px',
      searchPlaceholder: 'IP..',
      render: (row) => {
        if (!row.ip_address) return <span className="text-slate-400 text-xs italic">N/A</span>;
        return (
          <div className="flex items-center gap-1.5 font-mono">
            <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold text-[11px] border border-slate-200">
              {row.ip_address}
            </span>
            <button
              onClick={() => handleCopy(row.ip_address)}
              className="text-slate-400 hover:text-indigo-600 transition-colors p-0.5 cursor-pointer shrink-0"
              title="Copy IP"
            >
              {copiedIp === row.ip_address ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        );
      },
    },
    {
      key: 'device_name',
      header: 'DEVICE / PLATFORM',
      width: '135px',
      searchPlaceholder: 'Device..',
      render: (row) => {
        const device = parseDevice(row.user_agent);
        return (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            {device.isMobile ? (
              <Smartphone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            ) : (
              <Monitor className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            )}
            <div>
              <div className="font-semibold text-slate-900 text-[11px]">{device.label}</div>
              <div className="font-mono text-[9px] text-slate-400 truncate max-w-[90px]">
                {row.user_agent ? row.user_agent.split(' ')[0] : 'Browser'}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'ai_interest',
      header: 'AI PROPERTY INTEREST',
      width: '260px',
      searchPlaceholder: 'Interest / Role / Property..',
      render: (row) => {
        const ai = row.ai_interest;
        if (!ai) return <span className="text-slate-400 text-[11px]">—</span>;

        const isHigh = ai.intent_level === 'HIGH';
        const isMedium = ai.intent_level === 'MEDIUM';

        const personaBadgeClass =
          ai.persona === 'BUYER'
            ? 'bg-blue-50 text-blue-700 border-blue-200'
            : ai.persona === 'SELLER'
            ? 'bg-purple-50 text-purple-700 border-purple-200'
            : ai.persona === 'OWNER'
            ? 'bg-amber-50 text-amber-800 border-amber-200'
            : ai.persona === 'TENANT'
            ? 'bg-teal-50 text-teal-700 border-teal-200'
            : 'bg-slate-50 text-slate-700 border-slate-200';

        return (
          <div className="space-y-1 py-0.5" title={ai.summary}>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-black tracking-wide border ${personaBadgeClass}`}>
                <span>{ai.role_icon || '🎯'}</span>
                <span>{ai.persona || 'BUYER'}</span>
              </span>

              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-black tracking-wide border ${
                  isHigh
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : isMedium
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {ai.intent_label}
              </span>

              {ai.formatted_price && (
                <span className="font-extrabold text-[10px] text-emerald-800 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                  {ai.formatted_price}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-slate-900 font-bold text-[11px] truncate max-w-[240px]">
              {ai.has_detected_property ? (
                <>
                  <Building className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="truncate">{ai.property_title}</span>
                  {ai.property_locality && (
                    <span className="text-slate-500 text-[10px] font-medium shrink-0">
                      📍 {ai.property_locality}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-slate-600 text-[10.5px] font-medium truncate">
                  {ai.summary}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'key_actions',
      header: 'KEY ACTIONS & INTERACTION LOG',
      width: '260px',
      searchPlaceholder: 'Actions..',
      render: (row) => (
        <span className="text-slate-700 text-xs truncate max-w-xs block font-medium" title={row.key_actions}>
          {row.key_actions ? row.key_actions.replace(/_/g, ' ') : 'Page Browsing'}
        </span>
      ),
    },
    {
      key: 'total_events',
      header: 'EVENTS',
      width: '80px',
      render: (row) => (
        <div className="text-center">
          <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-300 text-[11px]">
            {row.total_events}
          </span>
        </div>
      ),
    },
    {
      key: 'session_start',
      header: 'SESSION START',
      width: '120px',
      render: (row) => (
        <span className="text-slate-600 text-[11px] font-semibold whitespace-nowrap">
          {row.session_start
            ? new Date(row.session_start).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
            : '—'}
        </span>
      ),
    },
    {
      key: 'duration_seconds',
      header: 'DURATION',
      width: '100px',
      render: (row) => {
        const dur = formatDuration(row.duration_seconds);
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
            {dur}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'ACTION',
      width: '95px',
      className: 'text-center',
      render: (row) => (
        <button
          type="button"
          onClick={() => setSelectedSession(row)}
          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 mx-auto cursor-pointer shadow-2xs"
          title="Inspect complete journey & calculator inputs"
        >
          <Eye className="w-3 h-3" />
          <span>Inspect</span>
        </button>
      ),
    },
  ];

  // 1. Export CSV Action
  const handleExport = () => {
    if (!filteredSessions.length) return;
    let csv = 'Guest ID,User ID,Name,Email,Phone,Exact Role,Lead ID,Lead Name,Portal/Source,IP Address,Device,Total Events,Session Start,Duration (Seconds),Key Actions\n';
    filteredSessions.forEach((s: any) => {
      csv += `"${s.guest_id || ''}","${s.user_id || ''}","${(s.user_full_name || s.username || '').replace(/"/g, '""')}","${s.user_email || ''}","${s.user_phone || ''}","${s.exact_role || 'Guest'}","${s.lead_id || ''}","${(s.lead_name || '').replace(/"/g, '""')}","${s.source || ''}","${s.ip_address || ''}","${parseDevice(s.user_agent).label}","${s.total_events || 0}","${s.session_start || ''}","${s.duration_seconds || 0}","${(s.key_actions || '').replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `visitor_and_user_activity_report_${Date.now()}.csv`;
    link.click();
  };

  // 2. Print Preview with Branded Design & Stats Boxes
  const handlePrint = () => {
    const watermark = buildWatermarkHTML();
    const logoUrl = typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : '/logo.png';
    const reportDateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const brandHeaderHTML = `
      <div class="brand-header" style="display:flex; align-items:center; background:#fff; border-bottom:2px solid #0f1f38; border-radius:6px; padding:10px 14px; margin-bottom:12px;">
        <div class="brand-logo-wrap" style="width:140px; flex-shrink:0;">
          <img class="brand-logo" src="${logoUrl}" alt="Resale Expert Logo" style="max-height:36px; max-width:130px; object-fit:contain;" />
        </div>
        <div class="brand-center" style="flex:1; text-align:center;">
          <div class="brand-name" style="font-size:15px; font-weight:800; color:#0f1f38; text-transform:uppercase; letter-spacing:-0.3px;">Visitor & Web Activity Tracking Report</div>
          <div class="brand-sub" style="font-size:10px; font-weight:700; color:#4f46e5; text-transform:uppercase; letter-spacing:1px; margin-top:2px;">User Journey, Calculator & Web Engagement Logs</div>
        </div>
        <div class="brand-right" style="width:130px; flex-shrink:0; text-align:right; font-size:9px; color:#64748b;">
          <span class="label" style="font-weight:800; text-transform:uppercase; color:#94a3b8; display:block; font-size:8px;">Report Date</span>
          <span style="font-weight:800; color:#0f1f38;">${reportDateStr}</span>
        </div>
      </div>
    `;

    const statsGridHTML = `
      <div class="stats-grid" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; margin-bottom:14px;">
        <div class="stat-box" style="padding:8px 10px; border-radius:6px; border:1px solid #cbd5e1; background:#f8fafc; display:flex; flex-direction:column; justify-content:space-between;">
          <span class="stat-lbl" style="font-size:8px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:#64748b;">Total Visitors</span>
          <span class="stat-val" style="font-size:13px; font-weight:900; color:#0f1f38; margin-top:2px;">${Number(summary.total_visitors || 0).toLocaleString('en-IN')}</span>
        </div>
        <div class="stat-box" style="padding:8px 10px; border-radius:6px; border:1px solid #cbd5e1; background:#f8fafc; display:flex; flex-direction:column; justify-content:space-between;">
          <span class="stat-lbl" style="font-size:8px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:#64748b;">Property Views</span>
          <span class="stat-val" style="font-size:13px; font-weight:900; color:#16a34a; margin-top:2px;">${Number(summary.property_views_count || 0).toLocaleString('en-IN')}</span>
        </div>
        <div class="stat-box" style="padding:8px 10px; border-radius:6px; border:1px solid #cbd5e1; background:#f8fafc; display:flex; flex-direction:column; justify-content:space-between;">
          <span class="stat-lbl" style="font-size:8px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:#64748b;">EMI Calculations</span>
          <span class="stat-val" style="font-size:13px; font-weight:900; color:#7e22ce; margin-top:2px;">${Number(summary.emi_calculations_count || 0).toLocaleString('en-IN')}</span>
        </div>
        <div class="stat-box" style="padding:8px 10px; border-radius:6px; border:1px solid #cbd5e1; background:#f8fafc; display:flex; flex-direction:column; justify-content:space-between;">
          <span class="stat-lbl" style="font-size:8px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:#64748b;">Stitched Leads</span>
          <span class="stat-val" style="font-size:13px; font-weight:900; color:#e11d48; margin-top:2px;">${Number(summary.converted_lead_visitors || 0).toLocaleString('en-IN')}</span>
        </div>
      </div>
    `;

    const tableRowsHTML = filteredSessions
      .map(
        (row, idx) => `
        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 10px;">
          <td style="padding: 6px 8px; text-align: center; color: #64748b;">${idx + 1}</td>
          <td style="padding: 6px 8px; font-weight: 700; color: #0f1f38;">
            ${row.user_full_name || row.username || row.lead_name || 'Anonymous Guest'}
            <div style="font-size: 8.5px; color: #94a3b8; font-family: monospace;">${row.guest_id ? row.guest_id.slice(0, 16) + '...' : ''}</div>
          </td>
          <td style="padding: 6px 8px; text-transform: uppercase; font-size: 9px; font-weight: 700;">
            <span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; border: 1px solid #cbd5e1;">${row.exact_role || 'GUEST'}</span>
          </td>
          <td style="padding: 6px 8px; font-family: monospace; color: #475569; font-size: 9px;">${row.ip_address || '—'}</td>
          <td style="padding: 6px 8px; color: #334155;">${row.key_actions || 'Page Browsing'}</td>
          <td style="padding: 6px 8px; text-align:center; font-weight: 700;">${row.total_events || 0}</td>
          <td style="padding: 6px 8px; color: #64748b;">${formatDuration(row.duration_seconds)}</td>
        </tr>
      `
      )
      .join('');

    const printHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Visitor & Web Activity Tracking Report</title>
        ${PRINT_BRAND_STYLE}
      </head>
      <body>
        ${watermark}
        ${brandHeaderHTML}
        ${statsGridHTML}
        
        <table class="report-table" style="width:100%; border-collapse:collapse; margin-top:8px;">
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">S.NO</th>
              <th>USER / VISITOR IDENTITY</th>
              <th>ROLE / PORTAL</th>
              <th>IP ADDRESS</th>
              <th>KEY ACTIONS</th>
              <th style="text-align: center;">EVENTS</th>
              <th>DURATION</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHTML}
          </tbody>
        </table>

        <div style="margin-top: 16px; font-size: 9.5px; color: #94a3b8; text-align: right; font-weight:600;">
          Generated on ${new Date().toLocaleString()} | ResaleExpert Activity Tracking System
        </div>
      </body>
      </html>
    `;

    triggerIframePrint(printHTML, 'Visitor & Web Activity Tracking Report');
  };

  return (
    <div className="h-full flex flex-col min-h-0 space-y-2 overflow-hidden">
      {/* Top 6 KPI Summary Cards Grid - Compact & Screen-Fitted */}
      <div className="shrink-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <div className="bg-white p-2 px-3 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Total Visitors</div>
            <div className="text-base font-black text-slate-900 mt-0.5">
              {Number(summary.total_visitors || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="w-7 h-7 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <Users className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="bg-white p-2 px-3 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Total Sessions</div>
            <div className="text-base font-black text-slate-900 mt-0.5">
              {Number(summary.total_sessions || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="w-7 h-7 rounded-md bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="bg-white p-2 px-3 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Property Views</div>
            <div className="text-base font-black text-emerald-700 mt-0.5">
              {Number(summary.property_views_count || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="w-7 h-7 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Eye className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="bg-white p-2 px-3 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">EMI Calculations</div>
            <div className="text-base font-black text-purple-700 mt-0.5">
              {Number(summary.emi_calculations_count || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="w-7 h-7 rounded-md bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
            <Calculator className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="bg-white p-2 px-3 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Searches Made</div>
            <div className="text-base font-black text-cyan-700 mt-0.5">
              {Number(summary.searches_count || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="w-7 h-7 rounded-md bg-cyan-50 flex items-center justify-center text-cyan-600 shrink-0">
            <Search className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="bg-white p-2 px-3 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Identified Leads</div>
            <div className="text-base font-black text-rose-700 mt-0.5">
              {Number(summary.converted_lead_visitors || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="w-7 h-7 rounded-md bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* View Switcher & Split Overview Bar */}
      <div className="shrink-0 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 p-0.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode('sessions')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'sessions'
                ? 'bg-[#0f1f38] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Visitor Activity Sessions ({filteredSessions.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('trends')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'trends'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Top Properties & Search Keywords ({topProperties.length + topSearches.length})</span>
          </button>
        </div>

        {viewMode === 'sessions' && (
          <button
            type="button"
            onClick={() => setShowSplitOverview(!showSplitOverview)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
              showSplitOverview
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
            title="Toggle compact side-by-side trends"
          >
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>{showSplitOverview ? 'Hide Trends Panel' : 'Show Trends Panel'}</span>
          </button>
        )}
      </div>

      {/* Optional Split Overview in Sessions Mode */}
      {viewMode === 'sessions' && showSplitOverview && (
        <div className="shrink-0 grid grid-cols-1 lg:grid-cols-2 gap-2 h-[150px]">
          {/* Table 1: Most Viewed Properties */}
          <div className="bg-white rounded-lg border border-gray-300 shadow-2xs overflow-hidden flex flex-col h-full">
            <div className="py-1.5 px-2.5 bg-[#f8fafc] border-b border-gray-200 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-[11px] text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                <Eye className="w-3 h-3 text-emerald-600" /> Most Viewed Properties
              </h3>
              <span className="text-[9.5px] text-slate-400 font-bold">{topProperties.length} Properties</span>
            </div>
            <div className="overflow-y-auto flex-1 scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-100/90 border-b border-slate-200 text-slate-600 text-[9.5px] font-bold uppercase">
                  <tr>
                    <th className="py-1 px-2">PROPERTY</th>
                    <th className="py-1 px-2">LOCALITY</th>
                    <th className="py-1 px-2 text-right">PRICE</th>
                    <th className="py-1 px-2 text-center">VIEWS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topProperties.slice(0, 10).map((p: any, idx: number) => (
                    <tr key={p.property_id || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-1 px-2 font-bold text-slate-900 truncate max-w-[130px] text-[10.5px]">
                        {p.property_title}
                      </td>
                      <td className="py-1 px-2 text-slate-600 text-[10px] truncate max-w-[90px]">
                        {p.locality ? `📍 ${p.locality}` : '—'}
                      </td>
                      <td className="py-1 px-2 text-right font-semibold text-emerald-800 text-[10px]">
                        {p.price ? `₹${Number(p.price).toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="py-1 px-2 text-center">
                        <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 font-extrabold rounded text-[9.5px] border border-emerald-200">
                          {p.total_views}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Top Searches */}
          <div className="bg-white rounded-lg border border-gray-300 shadow-2xs overflow-hidden flex flex-col h-full">
            <div className="py-1.5 px-2.5 bg-[#f8fafc] border-b border-gray-200 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-[11px] text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                <Search className="w-3 h-3 text-cyan-600" /> Top Search Keywords
              </h3>
              <span className="text-[9.5px] text-slate-400 font-bold">{topSearches.length} Queries</span>
            </div>
            <div className="overflow-y-auto flex-1 scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-100/90 border-b border-slate-200 text-slate-600 text-[9.5px] font-bold uppercase">
                  <tr>
                    <th className="py-1 px-2">QUERY / FILTER</th>
                    <th className="py-1 px-2">LOCALITY</th>
                    <th className="py-1 px-2 text-center">COUNT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topSearches.slice(0, 10).map((s: any, idx: number) => {
                    let payload: any = null;
                    try {
                      payload = typeof s.payload === 'string' ? JSON.parse(s.payload) : s.payload;
                    } catch (e) {}
                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-1 px-2 font-bold text-slate-900 capitalize truncate max-w-[130px] text-[10.5px]">
                          {payload?.search_query || s.event_name.replace(/_/g, ' ')}
                        </td>
                        <td className="py-1 px-2 text-slate-600 text-[10px] truncate max-w-[90px]">
                          {payload?.locality ? `📍 ${payload.locality}` : '—'}
                        </td>
                        <td className="py-1 px-2 text-center">
                          <span className="px-1.5 py-0.2 bg-cyan-50 text-cyan-800 font-extrabold rounded-full text-[9.5px] border border-cyan-200">
                            {s.count}x
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Mode 1: Main Standard ReportTable Component */}
      {viewMode === 'sessions' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <ReportTable
            title="Visitor & User Web Activity Audit Logs"
            columns={columns}
            data={filteredSessions}
            statusPills={statusPills}
            activeStatusPill={activeStatusPill}
            onSelectStatusPill={(key) => {
              setActiveStatusPill(key);
              setPage(1);
            }}
            onOpenFilters={() => setIsFilterOpen(true)}
            onExport={handleExport}
            onRefresh={() => {
              fetchOverview();
            }}
            onPrint={handlePrint}
            pagination={{
              page,
              limit,
              totalRecords: filteredSessions.length,
              totalPages: Math.ceil(filteredSessions.length / limit) || 1,
            }}
            onPageChange={(p) => setPage(p)}
            onLimitChange={(l) => {
              setLimit(l);
              setPage(1);
            }}
            loading={loading}
          />
        </div>
      )}

      {/* Mode 2: Dedicated Top Properties & Search Trends View */}
      {viewMode === 'trends' && (
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3 overflow-hidden">
          {/* Most Viewed Properties */}
          <div className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="py-2 px-3 bg-[#f8fafc] border-b border-gray-200 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                <Eye className="w-3.5 h-3.5 text-emerald-600" /> Most Viewed Properties
              </h3>
              <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                {topProperties.length} Properties
              </span>
            </div>

            <div className="overflow-y-auto flex-1 scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-3">PROPERTY TITLE</th>
                    <th className="py-2 px-3">LOCALITY</th>
                    <th className="py-2 px-3 text-right">PRICE</th>
                    <th className="py-2 px-3 text-center">TOTAL VIEWS</th>
                    <th className="py-2 px-3 text-center">UNIQUE VISITORS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topProperties.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                        No property views recorded in this period
                      </td>
                    </tr>
                  ) : (
                    topProperties.map((p: any, idx: number) => (
                      <tr key={p.property_id || idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 font-bold text-slate-900 truncate max-w-[150px]" title={p.property_title}>
                          {p.property_title}
                        </td>
                        <td className="py-2 px-3 text-slate-600 text-[11px] truncate max-w-[120px]">
                          {p.locality ? `📍 ${p.locality}` : '—'}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-800 text-[11px]">
                          {p.price ? `₹${Number(p.price).toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-extrabold rounded text-[10.5px] border border-emerald-200">
                            {p.total_views}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center text-slate-600 text-[11px] font-semibold">
                          {p.unique_visitors}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Search Keywords & Filters */}
          <div className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="py-2 px-3 bg-[#f8fafc] border-b border-gray-200 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-xs text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                <Search className="w-3.5 h-3.5 text-cyan-600" /> Top Search Keywords & Filters
              </h3>
              <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                {topSearches.length} Queries
              </span>
            </div>

            <div className="overflow-y-auto flex-1 scrollbar-thin">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-3">SEARCH QUERY / FILTER</th>
                    <th className="py-2 px-3">LOCALITY</th>
                    <th className="py-2 px-3">BHK / BUDGET</th>
                    <th className="py-2 px-3 text-center">USAGE COUNT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topSearches.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                        No search events recorded in this period
                      </td>
                    </tr>
                  ) : (
                    topSearches.map((s: any, idx: number) => {
                      let payload: any = null;
                      try {
                        payload = typeof s.payload === 'string' ? JSON.parse(s.payload) : s.payload;
                      } catch (e) {}

                      return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2 px-3 font-bold text-slate-900 capitalize truncate max-w-[140px]">
                            {payload?.search_query || s.event_name.replace(/_/g, ' ')}
                          </td>
                          <td className="py-2 px-3 text-slate-600 text-[11px] truncate max-w-[110px]">
                            {payload?.locality ? `📍 ${payload.locality}` : '—'}
                          </td>
                          <td className="py-2 px-3 text-slate-600 text-[11px]">
                            {payload?.bhk ? `🛏️ ${payload.bhk}` : payload?.budget ? `💰 ${payload.budget}` : '—'}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="px-2.5 py-0.5 bg-cyan-50 text-cyan-800 font-extrabold rounded-full text-[10.5px] border border-cyan-200">
                              {s.count} times
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Smart Filter Drawer */}
      <SmartFilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        activeFilters={filters}
        tabKey="logged-in"
        onApplyFilters={(newFilters) => {
          setFilters(newFilters);
          setIsFilterOpen(false);
        }}
      />

      {/* Deep-Dive Activity Modal */}
      {selectedSession && (
        <VisitorDetailJourneyModal
          isOpen={Boolean(selectedSession)}
          onClose={() => setSelectedSession(null)}
          sessionId={selectedSession.session_id}
          guestId={selectedSession.guest_id}
          userId={selectedSession.user_id}
          leadId={selectedSession.lead_id}
          userName={selectedSession.user_full_name || selectedSession.username || selectedSession.lead_name}
          userEmail={selectedSession.user_email}
          userPhone={selectedSession.user_phone || selectedSession.lead_phone}
          userRole={selectedSession.exact_role || selectedSession.source}
          ipAddress={selectedSession.ip_address}
          initialAiInterest={selectedSession.ai_interest}
        />
      )}
    </div>
  );
};

export default VisitorAnalyticsTab;
