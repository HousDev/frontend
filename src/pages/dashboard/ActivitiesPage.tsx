// frontend/src/pages/dashboard/ActivitiesPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  PhoneCall,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import { reportAPI } from "@/lib/reportAPI";
import {
  PRINT_BRAND_STYLE,
  buildBrandHeaderHTML,
  buildWatermarkHTML,
  triggerIframePrint,
} from "@/lib/printUtils";
import { SmartFilterDrawer, SmartFilterParams } from "@/components/reports/SmartFilterDrawer";
import { ReportTable, ColumnDef, StatusPill } from "@/components/reports/ReportTable";

export const ActivitiesPage: React.FC = () => {
  const [activeView, setActiveView] = useState<"user_breakdown" | "activity_logs">("user_breakdown");
  const [loading, setLoading] = useState<boolean>(true);

  // Stats & Data State
  const [stats, setStats] = useState<any>(null);
  const [userSummary, setUserSummary] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  // Filter & Drawer State
  const [filters, setFilters] = useState<SmartFilterParams>({ ignoreDate: true, status: "all" });
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [activeStatusPill, setActiveStatusPill] = useState<string>("all");

  // Fetch Activity Report Data
  const fetchActivityReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportAPI.getActivityReport(filters);
      if (res?.stats) setStats(res.stats);
      if (res?.userSummary) setUserSummary(res.userSummary);
      if (res?.data) setActivityLogs(res.data);
    } catch (err) {
      console.error("Failed to load activity report:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchActivityReport();
  }, [fetchActivityReport]);

  const safeStats = stats || { total_count: 0, call_count: 0, meeting_count: 0, whatsapp_count: 0, completed_count: 0 };

  const totalExecutiveUsers = userSummary.length;
  const totalAssignedLeads = userSummary.reduce((acc, curr) => acc + Number(curr.assigned_leads || 0), 0);
  const totalCallsDone = userSummary.reduce((acc, curr) => acc + Number(curr.calls_done || 0), 0);
  const totalFollowupsTaken = userSummary.reduce((acc, curr) => acc + Number(curr.followups_count || 0), 0);
  const totalOverdueFollowups = userSummary.reduce((acc, curr) => acc + Number(curr.overdue_followups || 0), 0);
  const totalInterestedLeads = userSummary.reduce((acc, curr) => acc + Number(curr.interested_leads || 0), 0);

  // Status Pills
  const statusPills: StatusPill[] = [
    { label: "Active Staff", key: "all", count: totalExecutiveUsers },
    { label: "Assigned Leads", key: "assigned", count: totalAssignedLeads },
    { label: "Follow-ups Taken", key: "followups", count: totalFollowupsTaken },
    { label: "Overdue Actions", key: "overdue", count: totalOverdueFollowups },
    { label: "Interested Leads", key: "interested", count: totalInterestedLeads },
    { label: "Activity Logs", key: "logs", count: safeStats.total_count || activityLogs.length },
  ];

  // Clickable Status Pills Filter Logic
  const handleSelectStatusPill = (key: string) => {
    setActiveStatusPill(key);
    if (key === "logs") {
      setActiveView("activity_logs");
    } else {
      setActiveView("user_breakdown");
    }
  };

  // Filter userSummary according to activeStatusPill & Smart Filter Drawer
  const displayUserSummary = userSummary.filter((u) => {
    if (activeStatusPill === "assigned" && Number(u.assigned_leads || 0) === 0) return false;
    if (activeStatusPill === "followups" && Number(u.followups_count || 0) === 0) return false;
    if (activeStatusPill === "overdue" && Number(u.overdue_followups || 0) === 0) return false;
    if (activeStatusPill === "interested" && Number(u.interested_leads || 0) === 0) return false;

    // Smart Filter Drawer: Lead Category Filter
    if (filters.lead_type && filters.lead_type !== "all") {
      const lt = filters.lead_type.toLowerCase();
      if (lt === "client" && Number(u.general_leads || 0) === 0) return false;
      if (lt === "buyer" && Number(u.buyer_leads || 0) === 0) return false;
      if (lt === "seller" && Number(u.seller_leads || 0) === 0) return false;
      if (lt === "owner" && Number(u.owner_leads || 0) === 0) return false;
      if (lt === "tenant" && Number(u.tenant_leads || 0) === 0) return false;
    }

    // Smart Filter Drawer: Status Filter
    if (filters.status && filters.status !== "all") {
      const st = filters.status.toLowerCase();
      if (st === "qualified" || st === "interested") {
        if (Number(u.interested_leads || 0) === 0) return false;
      } else if (st === "overdue") {
        if (Number(u.overdue_followups || 0) === 0) return false;
      } else if (st === "unqualified" || st === "not_interested") {
        if (Number(u.not_interested_leads || 0) === 0) return false;
      }
    }

    return true;
  });

  // Comprehensive User Lead Execution Table Columns
  const userColumns: ColumnDef[] = [
    {
      key: "user_name",
      header: "EXECUTIVE NAME & ROLE",
      searchPlaceholder: "Search executive...",
      render: (row) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          
          <span className="font-bold text-gray-900">{row.user_name || "N/A"}</span>
          <span className="text-[10px] text-gray-400 font-medium capitalize">({row.role || "Executive"})</span>
        </div>
      ),
    },
    {
      key: "assigned_leads",
      header: "TOTAL ASSIGNED",
      render: (row) => <span className="font-extrabold text-gray-900 text-xs">{row.assigned_leads || 0}</span>,
    },
    {
      key: "general_leads",
      header: "CLIENT LEADS",
      searchPlaceholder: "Search...",
      render: (row) => {
        const cnt = Number(row.general_leads || 0);
        return cnt > 0 ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-300">
            📋 {cnt} Client
          </span>
        ) : (
          <span className="text-gray-400 font-medium">0</span>
        );
      },
    },
    {
      key: "buyer_leads",
      header: "BUYER LEADS",
      searchPlaceholder: "Search...",
      render: (row) => {
        const cnt = Number(row.buyer_leads || 0);
        return cnt > 0 ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
            🛒 {cnt} Buyer
          </span>
        ) : (
          <span className="text-gray-400 font-medium">0</span>
        );
      },
    },
    {
      key: "seller_leads",
      header: "SELLER LEADS",
      searchPlaceholder: "Search...",
      render: (row) => {
        const cnt = Number(row.seller_leads || 0);
        return cnt > 0 ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
            🏠 {cnt} Seller
          </span>
        ) : (
          <span className="text-gray-400 font-medium">0</span>
        );
      },
    },
    {
      key: "owner_leads",
      header: "OWNER LEADS",
      searchPlaceholder: "Search...",
      render: (row) => {
        const cnt = Number(row.owner_leads || 0);
        return cnt > 0 ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
            🔑 {cnt} Owner
          </span>
        ) : (
          <span className="text-gray-400 font-medium">0</span>
        );
      },
    },
    {
      key: "tenant_leads",
      header: "TENANT LEADS",
      searchPlaceholder: "Search...",
      render: (row) => {
        const cnt = Number(row.tenant_leads || 0);
        return cnt > 0 ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 text-indigo-800 border border-indigo-200">
            👤 {cnt} Tenant
          </span>
        ) : (
          <span className="text-gray-400 font-medium">0</span>
        );
      },
    },
    {
      key: "followups_count",
      header: "FOLLOW-UPS TAKEN",
      render: (row) => <span className="font-extrabold text-purple-700">{row.followups_count || 0}</span>,
    },
    {
      key: "overdue_followups",
      header: "OVERDUE ACTIONS",
      render: (row) => {
        const overdue = Number(row.overdue_followups || 0);
        return overdue > 0 ? (
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
            ⚠️ {overdue} Overdue
          </span>
        ) : (
          <span className="text-gray-400 font-semibold">0</span>
        );
      },
    },
    {
      key: "contacted_leads",
      header: "CONTACTED LEADS",
      render: (row) => <span className="font-bold text-blue-700">{row.contacted_leads || 0}</span>,
    },
    {
      key: "interested_leads",
      header: "INTERESTED PROSPECTS",
      render: (row) => <span className="font-bold text-emerald-600">{row.interested_leads || 0}</span>,
    },
    {
      key: "not_interested_leads",
      header: "NOT INTERESTED",
      render: (row) => <span className="font-medium text-rose-600">{row.not_interested_leads || 0}</span>,
    },
    {
      key: "last_activity_at",
      header: "LAST LOGGED ACTIVITY",
      render: (row) => {
        const ts = row.last_activity_at;
        if (!ts || ts.startsWith("1970")) return <span className="text-gray-400 italic">No Activity Yet</span>;
        const d = new Date(ts);
        const isToday = new Date().toDateString() === d.toDateString();
        return (
          <div>
            <div className="font-semibold text-gray-800 text-[11px]">
              {isToday ? "Today, " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : d.toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        );
      },
    },
    {
      key: "execution_status",
      header: "STAFF PERFORMANCE",
      render: (row) => {
        const assigned = Number(row.assigned_leads || 0);
        const interested = Number(row.interested_leads || 0);
        const overdue = Number(row.overdue_followups || 0);
        const followups = Number(row.followups_count || 0);
        const rate = assigned > 0 ? (interested / assigned) * 100 : 0;

        if (overdue > 0) {
          return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800">⚠️ Needs Action</span>;
        }
        if (rate >= 25 || (followups > 10 && interested > 2)) {
          return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">🔥 Top Performer</span>;
        }
        if (followups > 0) {
          return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">⚡ Active Staff</span>;
        }
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gray-100 text-gray-700">💤 Pending Log</span>;
      },
    },
  ];

  // Comprehensive Activity Feed Log Columns
  const logColumns: ColumnDef[] = [
    {
      key: "user_name",
      header: "STAFF / PERFORMED BY",
      searchPlaceholder: "Search staff...",
      render: (row) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="font-bold text-gray-900">{row.user_name || "Staff Member"}</span>
        </div>
      ),
    },
    {
      key: "type",
      header: "ACTION & CHANNEL",
      searchPlaceholder: "Search action...",
      render: (row) => {
        const t = (row.type || "").toLowerCase();
        let badge = "bg-blue-50 text-blue-800 border-blue-200";
        let icon = "📞";
        if (t.includes("wa") || t.includes("whatsapp")) {
          badge = "bg-emerald-50 text-emerald-800 border-emerald-200";
          icon = "💬";
        } else if (t.includes("visit") || t.includes("meet") || t.includes("site")) {
          badge = "bg-purple-50 text-purple-800 border-purple-200";
          icon = "🤝";
        } else if (t.includes("follow")) {
          badge = "bg-amber-50 text-amber-800 border-amber-200";
          icon = "📝";
        }
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${badge} whitespace-nowrap`}>
            {icon} {row.type || "Activity"}
          </span>
        );
      },
    },
    {
      key: "target_lead_name",
      header: "CLIENT / LEAD TARGET",
      searchPlaceholder: "Search lead...",
      render: (row) => {
        const tag = row.lead_type_tag || "Lead";
        let tagBg = "bg-slate-100 text-slate-700 border-slate-300";
        if (tag.includes("Buyer")) tagBg = "bg-blue-50 text-blue-800 border-blue-200";
        if (tag.includes("Seller")) tagBg = "bg-emerald-50 text-emerald-800 border-emerald-200";
        if (tag.includes("Owner")) tagBg = "bg-amber-50 text-amber-800 border-amber-200";
        if (tag.includes("Tenant")) tagBg = "bg-indigo-50 text-indigo-800 border-indigo-200";

        return (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-bold text-gray-900">{row.target_lead_name || "Client Lead"}</span>
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold border ${tagBg}`}>
              {tag}
            </span>
          </div>
        );
      },
    },
    {
      key: "description",
      header: "REMARK / DETAILS",
      searchPlaceholder: "Search remark...",
      render: (row) => <span className="text-gray-700 font-medium text-[11px] truncate max-w-xs">{row.description || "N/A"}</span>,
    },
    {
      key: "status",
      header: "OUTCOME STATUS",
      searchPlaceholder: "Search status...",
      render: (row) => {
        const s = (row.status || "completed").toLowerCase();
        let color = "bg-blue-100 text-blue-800";
        if (s.includes("qualif") || s.includes("interest") || s.includes("done") || s.includes("completed")) color = "bg-emerald-100 text-emerald-800";
        else if (s.includes("progress") || s.includes("pending")) color = "bg-amber-100 text-amber-800";
        else if (s.includes("not") || s.includes("lost") || s.includes("reject")) color = "bg-rose-100 text-rose-800";
        return <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${color} whitespace-nowrap`}>{row.status || "Logged"}</span>;
      },
    },
    {
      key: "created_at",
      header: "LOGGED TIMESTAMP",
      render: (row) => {
        const d = row.created_at || row.scheduled_date;
        return d ? <span className="font-semibold text-gray-800 text-[11px] whitespace-nowrap">{new Date(d).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span> : "N/A";
      },
    },
  ];

  // Instant Client-Side CSV Export
  const handleExportCSV = () => {
    let csv = "";
    if (activeView === "user_breakdown") {
      csv = "S.NO,EXECUTIVE NAME,ROLE,DEPARTMENT,ASSIGNED LEADS,CALLS COMPLETED,PENDING CALLS,INTERESTED LEADS,NOT INTERESTED,FOLLOW-UPS LOGGED,CONVERSION RATE\n";
      displayUserSummary.forEach((r, idx) => {
        const assigned = Number(r.assigned_leads || 0);
        const interested = Number(r.interested_leads || 0);
        const rate = assigned > 0 ? Number(((interested / assigned) * 100).toFixed(1)) : 0;
        csv += `"${idx + 1}","${r.user_name || ""}","${r.role || ""}","${r.department || ""}","${r.assigned_leads || 0}","${r.calls_done || 0}","${r.pending_calls || 0}","${r.interested_leads || 0}","${r.not_interested_leads || 0}","${r.followups_count || 0}","${rate}%"\n`;
      });
    } else {
      csv = "S.NO,ACTIVITY TYPE,DESCRIPTION,STATUS,DATE,PERFORMED BY\n";
      activityLogs.forEach((r, idx) => {
        csv += `"${idx + 1}","${r.type || ""}","${(r.description || "").replace(/"/g, '""')}","${r.status || ""}","${r.scheduled_date || ""}","${r.user_name || ""}"\n`;
      });
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `user_activity_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Preview
  const handlePrint = () => {
    const orgName = "RESALE EXPERT";
    const tabName = "USER ACTIVITY REPORT";
    const pdfTitle = `${orgName}_User_Activity_Report_${new Date().toISOString().slice(0, 10)}`;

    const headerHTML = buildBrandHeaderHTML("", orgName, tabName);
    const watermarkHTML = buildWatermarkHTML(orgName);

    const activeDataset = activeView === "user_breakdown" ? displayUserSummary : activityLogs;

    const tableRows = activeDataset.length === 0
      ? `<tr><td colspan="7" style="text-align:center;padding:20px;color:#94a3b8">No activity records found for print.</td></tr>`
      : activeDataset
          .map((row, idx) => {
            if (activeView === "user_breakdown") {
              const name = row.user_name || `Executive #${row.user_id}`;
              const role = `${row.role || "Executive"} (${row.department || "Sales"})`;
              const assigned = row.assigned_leads || 0;
              const calls = row.calls_done || 0;
              const interested = row.interested_leads || 0;
              const followups = row.followups_count || 0;

              return `<tr>
                <td style="text-align:center;font-weight:700">${idx + 1}</td>
                <td style="font-weight:700">${name}</td>
                <td>${role}</td>
                <td style="font-weight:700">${assigned}</td>
                <td style="color:#1d4ed8;font-weight:700">${calls}</td>
                <td style="color:#047857;font-weight:700">${interested}</td>
                <td style="color:#6b21a8;font-weight:700">${followups}</td>
              </tr>`;
            } else {
              const type = row.type || "Call";
              const desc = row.description || "N/A";
              const status = row.status || "Completed";
              const date = row.scheduled_date ? new Date(row.scheduled_date).toLocaleString("en-IN") : "N/A";
              const agent = row.user_name || "Agent";

              return `<tr>
                <td style="text-align:center;font-weight:700">${idx + 1}</td>
                <td style="font-weight:700">${type}</td>
                <td>${desc}</td>
                <td><span style="font-weight:700;text-transform:uppercase">${status}</span></td>
                <td>${date}</td>
                <td>${agent}</td>
                <td>Log</td>
              </tr>`;
            }
          })
          .join("");

    const contentHTML = `
      ${headerHTML}
      <div class="meta-line">
        <span>Report Type: User Lead Activity & Execution Intelligence</span>
        <span>Executive Count: ${displayUserSummary.length}</span>
        <span>Generated: ${new Date().toLocaleString("en-IN")}</span>
      </div>
      <div class="stats-grid">
        <div class="stat-box"><span class="stat-lbl">TOTAL EXECUTIVES</span><span class="stat-val">${totalExecutiveUsers}</span></div>
        <div class="stat-box"><span class="stat-lbl">TOTAL ASSIGNED LEADS</span><span class="stat-val">${totalAssignedLeads}</span></div>
        <div class="stat-box"><span class="stat-lbl">CALLS COMPLETED</span><span class="stat-val">${totalCallsDone}</span></div>
        <div class="stat-box"><span class="stat-lbl">INTERESTED LEADS</span><span class="stat-val">${totalInterestedLeads}</span></div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:40px;text-align:center">S.NO.</th>
            <th>EXECUTIVE NAME</th>
            <th>ROLE / TYPE</th>
            <th>ASSIGNED LEADS</th>
            <th>CALLS COMPLETED</th>
            <th>INTERESTED LEADS</th>
            <th>FOLLOW-UPS LOGGED</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      ${watermarkHTML}
      <div class="footer">
        <span>${orgName} • User Activity Performance Export</span>
        <span>Page 1 of 1</span>
      </div>
    `;

    const fullPrintDoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${pdfTitle}</title>
          <style>${PRINT_BRAND_STYLE}</style>
        </head>
        <body>
          ${contentHTML}
        </body>
      </html>
    `;

    triggerIframePrint(fullPrintDoc, pdfTitle);
  };

  return (
    <div className="space-y-5 p-4 sm:p-6 bg-slate-50 min-h-screen">
      

      {/* Soft Pastel Top KPI Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#eef2ff] p-4 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-900 opacity-80 mb-0.5">
              TOTAL EXECUTIVES
            </div>
            <div className="text-xl font-black text-indigo-900 tracking-tight">
              {totalExecutiveUsers}
            </div>
            <div className="text-[11px] font-semibold text-indigo-700 opacity-75 mt-0.5">
              Active team members
            </div>
          </div>
          <div className="p-2.5 rounded-full bg-indigo-100 text-indigo-700">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#e0f2fe] p-4 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-sky-900 opacity-80 mb-0.5">
              ASSIGNED LEADS
            </div>
            <div className="text-xl font-black text-sky-900 tracking-tight">
              {totalAssignedLeads.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] font-semibold text-sky-700 opacity-75 mt-0.5">
              Total distributed leads
            </div>
          </div>
          <div className="p-2.5 rounded-full bg-sky-100 text-sky-700">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#f3e8ff] p-4 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-purple-900 opacity-80 mb-0.5">
              COMPLETED CALLS
            </div>
            <div className="text-xl font-black text-purple-900 tracking-tight">
              {totalCallsDone.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] font-semibold text-purple-700 opacity-75 mt-0.5">
              Phone calls done
            </div>
          </div>
          <div className="p-2.5 rounded-full bg-purple-100 text-purple-700">
            <PhoneCall className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#dcfce7] p-4 rounded-xl shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 opacity-80 mb-0.5">
              INTERESTED LEADS
            </div>
            <div className="text-xl font-black text-emerald-900 tracking-tight">
              {totalInterestedLeads.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] font-semibold text-emerald-700 opacity-75 mt-0.5">
              Qualified prospects
            </div>
          </div>
          <div className="p-2.5 rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Mode Switcher Banner (Bottom Underline Active Pill Style matching 2nd Screenshot) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-300 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveView("user_breakdown");
              setActiveStatusPill("all");
            }}
            className={`px-4 py-2 text-xs transition-all border-b-2 ${
              activeView === "user_breakdown"
                ? "border-indigo-600 text-indigo-900 font-extrabold bg-white shadow-2xs rounded-t-lg"
                : "border-transparent text-gray-500 hover:text-gray-900 font-semibold"
            }`}
          >
            Executive Lead Execution Breakdown
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveView("activity_logs");
              setActiveStatusPill("logs");
            }}
            className={`px-4 py-2 text-xs transition-all border-b-2 ${
              activeView === "activity_logs"
                ? "border-indigo-600 text-indigo-900 font-extrabold bg-white shadow-2xs rounded-t-lg"
                : "border-transparent text-gray-500 hover:text-gray-900 font-semibold"
            }`}
          >
            Chronological Activity Feed
          </button>
        </div>
        <div className="text-xs font-semibold text-gray-500">
          {activeView === "user_breakdown" ? "Showing Per-User Lead Execution & Call Metrics" : "Showing Full System Activity History Logs"}
        </div>
      </div>

      {/* Fixed 520px Height Grid Table Component */}
      <ReportTable
        title={activeView === "user_breakdown" ? "Executive Lead Activity Report" : "Activity Feed Logs"}
        columns={activeView === "user_breakdown" ? userColumns : logColumns}
        data={activeView === "user_breakdown" ? displayUserSummary : activityLogs}
        statusPills={statusPills}
        activeStatusPill={activeStatusPill}
        onSelectStatusPill={handleSelectStatusPill}
        onOpenFilters={() => setIsFilterOpen(true)}
        onExport={handleExportCSV}
        onRefresh={fetchActivityReport}
        onPrint={handlePrint}
        pagination={{ page: 1, limit: 100, totalRecords: activeView === "user_breakdown" ? displayUserSummary.length : activityLogs.length, totalPages: 1 }}
        onPageChange={() => {}}
        onLimitChange={() => {}}
        loading={loading}
      />

      {/* Smart Slide-over Filter Drawer */}
      <SmartFilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        tabKey="activities"
        onApplyFilters={(newFilters) => {
          setFilters(newFilters);
        }}
        onClearFilters={() => {
          setFilters({ ignoreDate: true, status: "all" });
        }}
      />
    </div>
  );
};

export default ActivitiesPage;