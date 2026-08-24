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
  const totalInterestedLeads = userSummary.reduce((acc, curr) => acc + Number(curr.interested_leads || 0), 0);
  const totalCallsDone = userSummary.reduce((acc, curr) => acc + Number(curr.calls_done || 0), 0);

  // Status Pills
  const statusPills: StatusPill[] = [
    { label: "Total Executive Users", key: "all", count: totalExecutiveUsers },
    { label: "Assigned Leads", key: "assigned", count: totalAssignedLeads },
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

  // Filter userSummary according to activeStatusPill
  const displayUserSummary = userSummary.filter((u) => {
    if (activeStatusPill === "assigned") return Number(u.assigned_leads || 0) > 0;
    if (activeStatusPill === "interested") return Number(u.interested_leads || 0) > 0;
    return true;
  });

  // User Lead Activity Execution Table Columns
  const userColumns: ColumnDef[] = [
    {
      key: "user_name",
      header: "EXECUTIVE NAME & ROLE",
      searchPlaceholder: "Search executive...",
      render: (row) => (
        <div>
          <div className="font-bold text-gray-900 flex items-center gap-2">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            {row.user_name || "N/A"}
          </div>
          <div className="text-[11px] text-gray-400 capitalize">{row.role || "Executive"} | {row.department || "Sales"}</div>
        </div>
      ),
    },
    {
      key: "assigned_leads",
      header: "ASSIGNED LEADS",
      render: (row) => <span className="font-bold text-gray-900">{row.assigned_leads || 0}</span>,
    },
    {
      key: "calls_done",
      header: "CALLS COMPLETED",
      render: (row) => <span className="font-semibold text-blue-700">{row.calls_done || 0}</span>,
    },
    {
      key: "pending_calls",
      header: "NOT CALLED / PENDING",
      render: (row) => <span className="font-semibold text-amber-700">{row.pending_calls || 0}</span>,
    },
    {
      key: "interested_leads",
      header: "INTERESTED LEADS",
      render: (row) => <span className="font-bold text-emerald-600">{row.interested_leads || 0}</span>,
    },
    {
      key: "not_interested_leads",
      header: "NOT INTERESTED",
      render: (row) => <span className="font-medium text-rose-600">{row.not_interested_leads || 0}</span>,
    },
    {
      key: "followups_count",
      header: "FOLLOW-UPS LOGGED",
      render: (row) => <span className="font-bold text-purple-700">{row.followups_count || 0}</span>,
    },
    {
      key: "conversion_rate",
      header: "CONVERSION RATE",
      render: (row) => {
        const assigned = Number(row.assigned_leads || 0);
        const interested = Number(row.interested_leads || 0);
        const rate = assigned > 0 ? Number(((interested / assigned) * 100).toFixed(1)) : 0;
        return <span className="font-bold text-navy-900">{rate}%</span>;
      },
    },
  ];

  // Activity History Logs Columns
  const logColumns: ColumnDef[] = [
    {
      key: "type",
      header: "ACTIVITY TYPE",
      searchPlaceholder: "Search type...",
      render: (row) => <span className="font-bold text-gray-900 capitalize">{row.type || "Call"}</span>,
    },
    {
      key: "description",
      header: "DESCRIPTION / REMARK",
      searchPlaceholder: "Search description...",
      render: (row) => row.description || "N/A",
    },
    {
      key: "status",
      header: "STATUS",
      searchPlaceholder: "Search status...",
      render: (row) => {
        const s = (row.status || "completed").toLowerCase();
        const color = s === "completed" || s === "done" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800";
        return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${color}`}>{row.status || "Completed"}</span>;
      },
    },
    {
      key: "scheduled_date",
      header: "DATE & TIME",
      render: (row) => (row.scheduled_date ? new Date(row.scheduled_date).toLocaleString("en-IN") : "N/A"),
    },
    {
      key: "user_name",
      header: "PERFORMED BY",
      render: (row) => row.user_name || "Agent",
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