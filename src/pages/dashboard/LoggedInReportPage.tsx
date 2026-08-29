// frontend/src/pages/dashboard/LoggedInReportPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { ShieldCheck, Filter, Download, Printer } from "lucide-react";
import { reportAPI } from "@/lib/reportAPI";
import {
  PRINT_BRAND_STYLE,
  buildWatermarkHTML,
  triggerIframePrint,
} from "@/lib/printUtils";
import { SmartFilterDrawer, SmartFilterParams } from "@/components/reports/SmartFilterDrawer";
import { LoggedInReportTab } from "@/components/reports/LoggedInReportTab";
import { TabTopStatsHeader } from "@/components/reports/TabTopStatsHeader";
import Button from "@/components/ui/Button";

export const LoggedInReportPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [logsData, setLogsData] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any>(null);

  // Filter & Drawer State
  const [filters, setFilters] = useState<SmartFilterParams>({ ignoreDate: true, status: "all" });
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // Fetch Login Logs Data
  const fetchLoginLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportAPI.getLoginLogReport(filters);
      if (res?.stats) setStatsData(res.stats);
      if (res?.logs || res?.data) setLogsData(res.logs || res.data || []);
    } catch (err) {
      console.error("Failed to load login audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLoginLogs();
  }, [fetchLoginLogs]);

  // Export to CSV
  const handleExport = () => {
    if (!logsData.length) return;
    let csv = "ID,User ID,Name,Email,Role,Session ID,IP Address,Device,Source,Latitude,Longitude,Address,Login Time,Logout Time\n";
    logsData.forEach((row) => {
      csv += `"${row.id || ""}","${row.user_id || ""}","${(row.name || "").replace(/"/g, '""')}","${row.email || ""}","${row.role || ""}","${row.session_id || ""}","${row.ip_address || ""}","${row.device_id || ""}","${row.source || ""}","${row.latitude || ""}","${row.longitude || ""}","${(row.address || "").replace(/"/g, '""')}","${row.login_time || ""}","${row.logout_time || "ACTIVE"}"\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `login_session_audit_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clean Print Preview with Stats Cards & Compact Title/Subtitle Header
  const handlePrint = () => {
    const watermark = buildWatermarkHTML();
    const logoUrl = typeof window !== "undefined" ? `${window.location.origin}/logo.png` : "/logo.png";
    const reportDateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

    // Compact Header with smaller Title & Subtitle
    const brandHeaderHTML = `
      <div class="brand-header" style="display:flex; align-items:center; background:#fff; border-bottom:2px solid #0f1f38; border-radius:6px; padding:10px 14px; margin-bottom:12px;">
        <div class="brand-logo-wrap" style="width:140px; flex-shrink:0;">
          <img class="brand-logo" src="${logoUrl}" alt="Resale Expert Logo" style="max-height:36px; max-width:130px; object-fit:contain;" />
        </div>
        <div class="brand-center" style="flex:1; text-align:center;">
          <div class="brand-name" style="font-size:15px; font-weight:800; color:#0f1f38; text-transform:uppercase; letter-spacing:-0.3px;">Logged-In Session Audit Trail</div>
          <div class="brand-sub" style="font-size:10px; font-weight:700; color:#ea580c; text-transform:uppercase; letter-spacing:1px; margin-top:2px;">User Authentication & Security Logs</div>
        </div>
        <div class="brand-right" style="width:130px; flex-shrink:0; text-align:right; font-size:9px; color:#64748b;">
          <span class="label" style="font-weight:800; text-transform:uppercase; color:#94a3b8; display:block; font-size:8px;">Report Date</span>
          <span style="font-weight:800; color:#0f1f38;">${reportDateStr}</span>
        </div>
      </div>
    `;

    // 4 Top Stat Boxes Grid for Print Preview
    const statsGridHTML = `
      <div class="stats-grid" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:10px; margin-bottom:14px;">
        <div class="stat-box" style="padding:8px 10px; border-radius:6px; border:1px solid #cbd5e1; background:#f8fafc; display:flex; flex-direction:column; justify-content:space-between;">
          <span class="stat-lbl" style="font-size:8px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:#64748b;">Total Access Logins</span>
          <span class="stat-val" style="font-size:13px; font-weight:900; color:#0f1f38; margin-top:2px;">${Number(statsData?.total_logins || logsData.length || 0).toLocaleString("en-IN")}</span>
        </div>
        <div class="stat-box" style="padding:8px 10px; border-radius:6px; border:1px solid #cbd5e1; background:#f8fafc; display:flex; flex-direction:column; justify-content:space-between;">
          <span class="stat-lbl" style="font-size:8px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:#64748b;">Client & Buyer Logins</span>
          <span class="stat-val" style="font-size:13px; font-weight:900; color:#0f1f38; margin-top:2px;">${Number(statsData?.tenant_logins || 0).toLocaleString("en-IN")}</span>
        </div>
        <div class="stat-box" style="padding:8px 10px; border-radius:6px; border:1px solid #cbd5e1; background:#f8fafc; display:flex; flex-direction:column; justify-content:space-between;">
          <span class="stat-lbl" style="font-size:8px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:#64748b;">Admin & Staff Logins</span>
          <span class="stat-val" style="font-size:13px; font-weight:900; color:#0f1f38; margin-top:2px;">${Number(statsData?.admin_logins || 0).toLocaleString("en-IN")}</span>
        </div>
        <div class="stat-box" style="padding:8px 10px; border-radius:6px; border:1px solid #cbd5e1; background:#f8fafc; display:flex; flex-direction:column; justify-content:space-between;">
          <span class="stat-lbl" style="font-size:8px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:#64748b;">Active Sessions</span>
          <span class="stat-val" style="font-size:13px; font-weight:900; color:#16a34a; margin-top:2px;">${Number(statsData?.active_sessions || 0).toLocaleString("en-IN")}</span>
        </div>
      </div>
    `;

    let tableRowsHTML = logsData
      .map(
        (r, idx) => `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td><strong>${r.name || "User #" + r.user_id}</strong><br/><span style="color:#64748b; font-size:9.5px;">${r.email || "—"}</span></td>
        <td><span style="text-transform: uppercase; font-size:9.5px; background:#f1f5f9; padding:2px 6px; border-radius:4px; font-weight:700;">${r.role || "Agent"}</span></td>
        <td>${r.login_time ? new Date(r.login_time).toLocaleString() : "—"}</td>
        <td>${r.logout_time ? new Date(r.logout_time).toLocaleString() : '<span style="color:#16a34a; font-weight:bold;">ACTIVE</span>'}</td>
        <td>${r.ip_address || "—"}</td>
        <td>${r.address || "Location Captured"}</td>
      </tr>
    `
      )
      .join("");

    const printHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Logged-In Session Audit Trail Report</title>
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
              <th>USER / EXECUTIVE</th>
              <th>ROLE</th>
              <th>LOGIN TIME</th>
              <th>LOGOUT TIME</th>
              <th>IP ADDRESS</th>
              <th>LOCATION</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHTML}
          </tbody>
        </table>

        <div style="margin-top: 16px; font-size: 9.5px; color: #94a3b8; text-align: right; font-weight:600;">
          Generated on ${new Date().toLocaleString()} | ResaleExpert Audit Logs System
        </div>
      </body>
      </html>
    `;

    triggerIframePrint(printHTML, "Logged-In Session Audit Trail Report");
  };

  return (
    <div className="p-3.5 space-y-3.5 max-w-[1700px] mx-auto min-h-screen bg-slate-50/50">
      

      {/* Top Stats Cards Header */}
      <TabTopStatsHeader activeTab="login-logs" loginLogsStats={statsData} />

      {/* Main Logged In Report Component */}
      <LoggedInReportTab
        data={logsData}
        stats={statsData}
        loading={loading}
        onOpenFilters={() => setIsFilterOpen(true)}
        onExport={handleExport}
        onRefresh={fetchLoginLogs}
        onPrint={handlePrint}
      />

      {/* Smart Filter Drawer customized for Logged-In Report */}
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
    </div>
  );
};

export default LoggedInReportPage;
