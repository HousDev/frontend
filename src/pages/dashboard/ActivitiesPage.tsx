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
        <div className="flex items-center gap-1.5 whitespace-nowrap min-w-[200px]">
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
            {cnt} Client
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
            {cnt} Buyer
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
            {cnt} Seller
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
            {cnt} Owner
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
            {cnt} Tenant
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
            {overdue} Overdue
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
          return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800">Needs Action</span>;
        }
        if (rate >= 25 || (followups > 10 && interested > 2)) {
          return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">Top Performer</span>;
        }
        if (followups > 0) {
          return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">Active Staff</span>;
        }
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gray-100 text-gray-700">Pending Log</span>;
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
        <div className="flex items-center gap-1.5 whitespace-nowrap min-w-[200px]">
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
        if (t.includes("wa") || t.includes("whatsapp")) {
          badge = "bg-emerald-50 text-emerald-800 border-emerald-200";
        } else if (t.includes("visit") || t.includes("meet") || t.includes("site")) {
          badge = "bg-purple-50 text-purple-800 border-purple-200";
        } else if (t.includes("follow")) {
          badge = "bg-amber-50 text-amber-800 border-amber-200";
        }
        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${badge} whitespace-nowrap`}>
            {row.type || "Activity"}
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

  // CSV Export
  const handleExportCSV = () => {
    const targetData = activeView === "user_breakdown" ? displayUserSummary : activityLogs;
    if (!targetData.length) return;

    const headers = activeView === "user_breakdown"
      ? ["Executive Name", "Role", "Department", "Assigned Leads", "Client Leads", "Buyer Leads", "Seller Leads", "Owner Leads", "Tenant Leads", "Followups Taken", "Overdue Actions", "Contacted", "Interested", "Performance Status"]
      : ["Staff Performed By", "Action & Channel", "Client Lead Target", "Lead Category", "Remark Details", "Outcome Status", "Timestamp"];

    const rows = activeView === "user_breakdown"
      ? displayUserSummary.map((u) => [
          `"${u.user_name || "N/A"}"`,
          `"${u.role || "Executive"}"`,
          `"${u.department || "Sales"}"`,
          u.assigned_leads || 0,
          u.general_leads || 0,
          u.buyer_leads || 0,
          u.seller_leads || 0,
          u.owner_leads || 0,
          u.tenant_leads || 0,
          u.followups_count || 0,
          u.overdue_followups || 0,
          u.contacted_leads || 0,
          u.interested_leads || 0,
          `"${Number(u.overdue_followups || 0) > 0 ? "Needs Action" : "Active Staff"}"`,
        ])
      : activityLogs.map((l) => [
          `"${l.user_name || "Staff Member"}"`,
          `"${l.type || "Activity"}"`,
          `"${l.target_lead_name || "Client Lead"}"`,
          `"${l.lead_type_tag || "Lead"}"`,
          `"${(l.description || "").replace(/"/g, '""')}"`,
          `"${l.status || "Completed"}"`,
          `"${l.created_at || ""}"`,
        ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Activities_Report_${activeView}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print PDF Trigger
  const handlePrintPDF = () => {
    const titleText = activeView === "user_breakdown" ? "Staff Activity Execution Summary" : "Chronological Activity Feed Log";
    const headerHTML = buildBrandHeaderHTML({ title: titleText, subtitle: "Company Wide Activity Execution & Audit Trail" });
    const watermarkHTML = buildWatermarkHTML();

    const tableRowsHTML = activeView === "user_breakdown"
      ? displayUserSummary.map((u, idx) => `
          <tr>
            <td style="text-align:center;font-weight:700">${idx + 1}</td>
            <td style="font-weight:800;color:#0f172a">${u.user_name || "N/A"}</td>
            <td style="text-align:center;font-weight:800;color:#1e1b4b">${u.assigned_leads || 0}</td>
            <td style="text-align:center">${u.general_leads || 0}</td>
            <td style="text-align:center">${u.buyer_leads || 0}</td>
            <td style="text-align:center">${u.seller_leads || 0}</td>
            <td style="text-align:center">${u.owner_leads || 0}</td>
            <td style="text-align:center">${u.tenant_leads || 0}</td>
            <td style="text-align:center;font-weight:800;color:#6b21a8">${u.followups_count || 0}</td>
            <td style="text-align:center;font-weight:800;color:#991b1b">${u.overdue_followups || 0}</td>
            <td style="text-align:center;color:#1e40af">${u.contacted_leads || 0}</td>
            <td style="text-align:center;font-weight:800;color:#166534">${u.interested_leads || 0}</td>
          </tr>
        `).join("")
      : activityLogs.map((l, idx) => `
          <tr>
            <td style="text-align:center;font-weight:700">${idx + 1}</td>
            <td style="font-weight:800;color:#0f172a">${l.user_name || "Staff Member"}</td>
            <td style="text-align:center;font-weight:800">${l.type || "Activity"}</td>
            <td style="font-weight:700">${l.target_lead_name || "Client Lead"} (${l.lead_type_tag || "Lead"})</td>
            <td style="color:#334155">${l.description || "N/A"}</td>
            <td style="text-align:center;font-weight:800;color:#166534">${l.status || "Completed"}</td>
            <td style="text-align:center;font-size:9px">${l.created_at ? new Date(l.created_at).toLocaleString("en-IN") : ""}</td>
          </tr>
        `).join("");

    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Activity Report</title>
          <style>${PRINT_BRAND_STYLE}</style>
        </head>
        <body>
          ${watermarkHTML}
          ${headerHTML}
          <table>
            <thead>
              <tr>
                <th style="width:30px;text-align:center">#</th>
                <th>${activeView === "user_breakdown" ? "EXECUTIVE NAME" : "STAFF"}</th>
                <th>${activeView === "user_breakdown" ? "TOTAL ASSIGNED" : "ACTION & CHANNEL"}</th>
                <th>${activeView === "user_breakdown" ? "CLIENT" : "TARGET LEAD"}</th>
                <th>${activeView === "user_breakdown" ? "BUYER" : "REMARK"}</th>
                <th>${activeView === "user_breakdown" ? "SELLER" : "OUTCOME"}</th>
                <th>${activeView === "user_breakdown" ? "OWNER" : "TIMESTAMP"}</th>
                ${activeView === "user_breakdown" ? `
                  <th>TENANT</th>
                  <th>FOLLOWUPS</th>
                  <th>OVERDUE</th>
                  <th>CONTACTED</th>
                  <th>INTERESTED</th>
                ` : ""}
              </tr>
            </thead>
            <tbody>
              ${tableRowsHTML}
            </tbody>
          </table>
        </body>
      </html>
    `;

    triggerIframePrint(printHTML, "Activities Audit Trail");
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1600px] mx-auto bg-slate-50 min-h-screen">
      {/* Top Banner & Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Executives</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{totalExecutiveUsers}</div>
            <div className="text-[10px] text-gray-400 font-medium">Active team members</div>
          </div>
          <div className="p-2.5 rounded-full bg-indigo-50 text-indigo-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Assigned Leads</div>
            <div className="text-xl font-black text-indigo-950 mt-0.5">{totalAssignedLeads}</div>
            <div className="text-[10px] text-gray-400 font-medium">Total distributed leads</div>
          </div>
          <div className="p-2.5 rounded-full bg-blue-50 text-blue-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Completed Calls</div>
            <div className="text-xl font-black text-purple-950 mt-0.5">{totalCallsDone || safeStats.call_count || 0}</div>
            <div className="text-[10px] text-gray-400 font-medium">Phone calls done</div>
          </div>
          <div className="p-2.5 rounded-full bg-purple-50 text-purple-600">
            <PhoneCall className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Interested Leads</div>
            <div className="text-xl font-black text-emerald-950 mt-0.5">{totalInterestedLeads}</div>
            <div className="text-[10px] text-emerald-600 font-medium">Qualified prospects</div>
          </div>
          <div className="p-2.5 rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Mode View Toggle */}
      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveView("user_breakdown");
              setActiveStatusPill("all");
            }}
            className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${
              activeView === "user_breakdown"
                ? "bg-indigo-900 text-white shadow-2xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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
            className={`px-4 py-2 text-xs font-extrabold rounded-lg transition-all ${
              activeView === "activity_logs"
                ? "bg-indigo-900 text-white shadow-2xs"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Chronological Activity Feed
          </button>
        </div>

        <div className="text-xs font-semibold text-gray-500">
          {activeView === "user_breakdown" ? "Showing Per-User Lead Execution & Call Metrics" : "Chronological Audit Log of All User Actions"}
        </div>
      </div>

      {/* Main Interactive Table */}
      <ReportTable
        title={activeView === "user_breakdown" ? "Executive Activity Summary" : "Activity Logs"}
        columns={activeView === "user_breakdown" ? userColumns : logColumns}
        data={activeView === "user_breakdown" ? displayUserSummary : activityLogs}
        statusPills={statusPills}
        activeStatusPill={activeStatusPill}
        onSelectStatusPill={handleSelectStatusPill}
        onOpenFilters={() => setIsFilterOpen(true)}
        onExport={handleExportCSV}
        onRefresh={fetchActivityReport}
        onPrint={handlePrintPDF}
        pagination={{ page: 1, limit: 100, totalRecords: activeView === "user_breakdown" ? displayUserSummary.length : activityLogs.length, totalPages: 1 }}
        onPageChange={() => {}}
        onLimitChange={() => {}}
        loading={loading}
      />

      {/* Smart Filter Drawer */}
      <SmartFilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApplyFilters={(newFilters) => {
          setFilters(newFilters);
          setIsFilterOpen(false);
        }}
        onResetFilters={() => {
          setFilters({ ignoreDate: true, status: "all" });
          setIsFilterOpen(false);
        }}
      />
    </div>
  );
};

export default ActivitiesPage;