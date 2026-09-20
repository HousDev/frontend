import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Users,
  PlayCircle,
  Coffee,
  Clock,
  AlertTriangle,
  Zap,
  Search,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Edit,
  X,
  Target,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Mail,
  Eye,
  Trash2,
  Download,
  ArrowLeft,
  CalendarDays,
  Activity,
  BarChart3,
  CheckSquare,
  Square as SquareIcon,
  MinusSquare,
} from "lucide-react";
import { workSessionAPI } from "@/lib/api";
import AdminBreakTypesMasterModal from "./AdminBreakTypesMasterModal";

// ── Brand tokens ───────────────────────────────────────
const NAVY = "#0B3854";
const NAVY_SOFT = "#11507A";
const ORANGE = "#E6761D";
const LINE = "#dbe4ee";
const V_LINE = "#e8eef5";
const CARD_SHADOW = "0 1px 2px rgba(11,56,84,0.06), 0 4px 12px -6px rgba(11,56,84,0.10)";

// ── Table layout ──
const ROW_H = 52;
const HEAD_H = 38;
const SEARCH_H = 40;
const PAGE_SIZE_OPTIONS = [8, 10, 15, 25];

const STATUS_OPTIONS = [
  { value: "", label: "All status" },
  { value: "ACHIEVED", label: "Achieved" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "BEHIND", label: "Behind" },
  { value: "NOT_STARTED", label: "Not started" },
  { value: "PENDING", label: "Pending" },
];

const getPageNumbers = (total: number, current: number): (number | "...")[] => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("...");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("...");
  pages.push(total);
  return pages;
};

// ── Helper: Extract Initials (First + Last Name) ──
const getInitials = (name: string): string => {
  if (!name) return "E";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  const first = parts[0].charAt(0);
  const last = parts[parts.length - 1].charAt(0);
  return (first + last).toUpperCase();
};

// ── Helper: Format seconds to HH:MM:SS ──
const formatSeconds = (seconds: number) => {
  const total = Math.max(0, Math.round(seconds || 0));
  const hours = String(Math.floor(total / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const remaining = String(total % 60).padStart(2, "0");
  return `${hours}:${minutes}:${remaining}`;
};

/** Format a date-like value to DD-MM-YYYY */
const formatDateDDMMYYYY = (value?: string | null): string => {
  if (!value) return "—";
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return `${d}-${m}-${y}`;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
};

/** Format a time-like value to HH:MM (12-hour) */
const formatSessionTime = (value?: string | null) => {
  if (!value) return "Not ended";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatBreakDetails = (details?: string) => {
  if (!details) return "Completed break";

  try {
    const parsed = JSON.parse(details);
    if (!parsed || typeof parsed !== "object") return String(parsed);

    const labels: Record<string, string> = {
      clientName: "Client",
      property: "Property",
      meetingNotes: "Notes",
      meetingPurpose: "Purpose",
      meetingWith: "With",
      meetingType: "Type",
      priority: "Priority",
      duration: "Duration",
      customDuration: "Duration",
    };

    const values = Object.entries(parsed)
      .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "")
      .map(([key, value]) => `${labels[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())}: ${String(value)}`);

    return values.length > 0 ? values.join(" | ") : "Completed break";
  } catch {
    return details;
  }
};

/** Normalize a date-like value to YYYY-MM-DD for grouping */
const toDateKey = (value?: string | null): string => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

interface AdminStats {
  totalEmployee: number;
  workingNow: number;
  onBreak: number;
  notStarted: number;
  targetMissed: number;
  totalProductiveHours: string;
}

interface EmployeeItem {
  employee_id: number;
  employee_name: string;
  email: string;
  role: string;
  department: string;
  target: string;
  target_seconds: number;
  worked: string;
  worked_seconds: number;
  break_time: string;
  break_seconds: number;
  productive: string;
  productive_seconds: number;
  current_state: string;
  status: "ACHIEVED" | "IN_PROGRESS" | "BEHIND" | "NOT_STARTED" | "PENDING";
}

interface EmployeeBreakItem {
  break_type?: string;
  started_at?: string;
  ended_at?: string;
  actual_duration?: number;
  allocated_duration?: number;
  efficiency?: string;
  details?: string;
}

interface EmployeeDailyItem {
  date: string;
  started_at?: string | null;
  ended_at?: string | null;
  target?: string;
  worked?: string;
  break_time?: string;
  productive?: string;
  status?: string;
}

interface MergedDayRow {
  dateKey: string;
  dateLabel: string;
  daily?: EmployeeDailyItem;
  breaks: EmployeeBreakItem[];
  breakSeconds: number;
  breakCount: number;
}

type ActivityView = "user_breakdown" | "activity_logs" | "daily_work_tracker";

interface AdminDailyWorkTrackerProps {
  activeView?: ActivityView;
  onActiveViewChange?: (view: ActivityView) => void;
}

export const AdminDailyWorkTracker: React.FC<AdminDailyWorkTrackerProps> = ({
  activeView = "daily_work_tracker",
  onActiveViewChange,
}) => {
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [showEmployeePage, setShowEmployeePage] = useState<boolean>(false);

  const [employeeBreaks, setEmployeeBreaks] = useState<EmployeeBreakItem[]>([]);
  const [employeeDailyItems, setEmployeeDailyItems] = useState<EmployeeDailyItem[]>([]);
  const [employeeBreaksLoading, setEmployeeBreaksLoading] = useState<boolean>(false);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);

  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  const printableRef = useRef<HTMLDivElement>(null);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [colSearches, setColSearches] = useState({
    name: "",
    dept: "",
    target: "",
    worked: "",
    break: "",
    productive: "",
    state: "",
    status: "",
  });

  const [stats, setStats] = useState<AdminStats>({
    totalEmployee: 0,
    workingNow: 0,
    onBreak: 0,
    notStarted: 0,
    targetMissed: 0,
    totalProductiveHours: "0h 0m",
  });
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);

  const [targetModalOpen, setTargetModalOpen] = useState<boolean>(false);
  const [targetEmp, setTargetEmp] = useState<EmployeeItem | null>(null);
  const [newTargetHours, setNewTargetHours] = useState<number>(8);
  const [settingTarget, setSettingTarget] = useState<boolean>(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [deleteEmp, setDeleteEmp] = useState<EmployeeItem | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const [breakMasterOpen, setBreakMasterOpen] = useState<boolean>(false);

  // ── NEW: bulk selection & bulk delete ──
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<number>>(new Set());
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState<boolean>(false);
  const [bulkDeleting, setBulkDeleting] = useState<boolean>(false);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await workSessionAPI.getAdminDailyUpdates(undefined, fromDate || undefined, toDate || undefined);
      if (res?.success) {
        if (res.stats) setStats(res.stats);
        if (Array.isArray(res.data)) setEmployees(res.data);
      }
    } catch (err) {
      console.error("Failed to load admin daily work updates:", err);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, colSearches, fromDate, toDate, pageSize]);

  // Clear selection when filters / date range change (avoid stale selection)
  useEffect(() => {
    setSelectedEmployeeIds(new Set());
  }, [searchTerm, colSearches, fromDate, toDate]);

  const handleColSearch = (key: keyof typeof colSearches, value: string) => {
    setColSearches((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveTarget = async () => {
    if (!targetEmp) return;
    setSettingTarget(true);
    try {
      const targetDateForSave = toDate || fromDate || new Date().toISOString().split("T")[0];
      await workSessionAPI.setEmployeeTarget({
        employeeId: targetEmp.employee_id,
        targetDate: targetDateForSave,
        targetHours: newTargetHours,
      });
      setTargetModalOpen(false);
      fetchAdminData();
    } catch (err) {
      console.error("Failed to update employee target:", err);
    } finally {
      setSettingTarget(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!deleteEmp) return;
    setDeleting(true);
    try {
      console.log("Deleting employee:", deleteEmp.employee_id);
      setEmployees((prev) => prev.filter((e) => e.employee_id !== deleteEmp.employee_id));
      setDeleteModalOpen(false);
      setDeleteEmp(null);
    } catch (err) {
      console.error("Failed to delete employee:", err);
    } finally {
      setDeleting(false);
    }
  };

  // ── NEW: bulk selection helpers ──
  const toggleSelectEmployee = (id: number) => {
    setSelectedEmployeeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedEmployeeIds(new Set());

  const toggleSelectAllFiltered = () => {
    setSelectedEmployeeIds((prev) => {
      const allFilteredIds = filteredEmployeesRef.current.map((e) => e.employee_id);
      const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => prev.has(id));
      if (allSelected) {
        // Deselect only filtered ones
        const next = new Set(prev);
        allFilteredIds.forEach((id) => next.delete(id));
        return next;
      }
      // Select all filtered
      const next = new Set(prev);
      allFilteredIds.forEach((id) => next.add(id));
      return next;
    });
  };

  // ── NEW: bulk delete handler (functional parity with single delete) ──
  const handleBulkDelete = async () => {
    if (selectedEmployeeIds.size === 0) return;
    setBulkDeleting(true);
    try {
      const ids = Array.from(selectedEmployeeIds);
      // If workSessionAPI exposes a bulk endpoint in future, wire it here.
      // For now, we mirror the single-delete behavior (local removal).
      console.log("Bulk deleting employees:", ids);
      setEmployees((prev) => prev.filter((e) => !selectedEmployeeIds.has(e.employee_id)));
      setBulkDeleteModalOpen(false);
      clearSelection();
    } catch (err) {
      console.error("Failed to bulk delete employees:", err);
    } finally {
      setBulkDeleting(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const q = searchTerm.toLowerCase().trim();
      if (q) {
        const matchesGlobal =
          (emp.employee_name && emp.employee_name.toLowerCase().includes(q)) ||
          (emp.email && emp.email.toLowerCase().includes(q)) ||
          (emp.department && emp.department.toLowerCase().includes(q)) ||
          (emp.role && emp.role.toLowerCase().includes(q));
        if (!matchesGlobal) return false;
      }

      const matchName = !colSearches.name || (emp.employee_name && emp.employee_name.toLowerCase().includes(colSearches.name.toLowerCase()));
      const matchDept = !colSearches.dept || (emp.department && emp.department.toLowerCase().includes(colSearches.dept.toLowerCase())) || (emp.role && emp.role.toLowerCase().includes(colSearches.dept.toLowerCase()));
      const matchTarget = !colSearches.target || (emp.target && emp.target.includes(colSearches.target));
      const matchWorked = !colSearches.worked || (emp.worked && emp.worked.includes(colSearches.worked));
      const matchBreak = !colSearches.break || (emp.break_time && emp.break_time.includes(colSearches.break));
      const matchProductive = !colSearches.productive || (emp.productive && emp.productive.includes(colSearches.productive));
      const matchState = !colSearches.state || (emp.current_state && emp.current_state.toLowerCase().includes(colSearches.state.toLowerCase()));
      const matchStatus = !colSearches.status || (emp.status && emp.status === colSearches.status);

      return matchName && matchDept && matchTarget && matchWorked && matchBreak && matchProductive && matchState && matchStatus;
    });
  }, [employees, searchTerm, colSearches]);

  // ref mirror for header select-all (avoids stale closure issues)
  const filteredEmployeesRef = useRef<EmployeeItem[]>(filteredEmployees);
  useEffect(() => {
    filteredEmployeesRef.current = filteredEmployees;
  }, [filteredEmployees]);

  const selectedEmployee = filteredEmployees.find((emp) => emp.employee_id === selectedEmployeeId) || employees.find((emp) => emp.employee_id === selectedEmployeeId) || null;

  const openEmployeeDetails = async (employee: EmployeeItem) => {
    setSelectedEmployeeId(employee.employee_id);
    setShowEmployeePage(true);
    setExpandedDates(new Set());
  };

  const closeEmployeePage = () => {
    setShowEmployeePage(false);
    setSelectedEmployeeId(null);
    setEmployeeBreaks([]);
    setEmployeeDailyItems([]);
    setExpandedDates(new Set());
  };

  useEffect(() => {
    if (!showEmployeePage || !selectedEmployee) return;
    let cancelled = false;
    const loadEmployeeBreaks = async () => {
      setEmployeeBreaksLoading(true);
      try {
        const today = new Date().toISOString().split("T")[0];
        const res = await workSessionAPI.getEmployeeBreakHistory(
          selectedEmployee.employee_id,
          fromDate || today,
          toDate || fromDate || today,
        );
        if (!cancelled) {
          setEmployeeBreaks(res?.success && Array.isArray(res.breaks) ? res.breaks : []);
        }

        const dailyRes = await workSessionAPI.getEmployeeDailyUpdates(
          selectedEmployee.employee_id,
          undefined,
          fromDate || today,
          toDate || fromDate || today,
        );
        if (!cancelled) {
          setEmployeeDailyItems(dailyRes?.success && Array.isArray(dailyRes.updates) ? dailyRes.updates : []);
        }
      } catch (err) {
        console.error("Failed to load employee break details:", err);
        if (!cancelled) setEmployeeBreaks([]);
        if (!cancelled) setEmployeeDailyItems([]);
      } finally {
        if (!cancelled) setEmployeeBreaksLoading(false);
      }
    };
    loadEmployeeBreaks();
    return () => { cancelled = true; };
  }, [showEmployeePage, selectedEmployee, fromDate, toDate]);

  const breakTypeSummary = employeeBreaks.reduce<Record<string, { count: number; seconds: number }>>((summary, item) => {
    const type = item.break_type || "Other";
    if (!summary[type]) summary[type] = { count: 0, seconds: 0 };
    summary[type].count += 1;
    summary[type].seconds += Number(item.actual_duration || 0);
    return summary;
  }, {});

  const mergedDayRows: MergedDayRow[] = useMemo(() => {
    const map = new Map<string, MergedDayRow>();

    employeeDailyItems.forEach((d) => {
      const key = toDateKey(d.date);
      if (!key) return;
      const existing = map.get(key);
      if (existing) {
        existing.daily = d;
      } else {
        map.set(key, {
          dateKey: key,
          dateLabel: formatDateDDMMYYYY(d.date),
          daily: d,
          breaks: [],
          breakSeconds: 0,
          breakCount: 0,
        });
      }
    });

    employeeBreaks.forEach((b) => {
      const key = toDateKey(b.started_at) || toDateKey(b.ended_at);
      if (!key) return;
      const existing = map.get(key);
      if (existing) {
        existing.breaks.push(b);
        existing.breakSeconds += Number(b.actual_duration || 0);
        existing.breakCount += 1;
      } else {
        map.set(key, {
          dateKey: key,
          dateLabel: formatDateDDMMYYYY(key),
          breaks: [b],
          breakSeconds: Number(b.actual_duration || 0),
          breakCount: 1,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1));
  }, [employeeDailyItems, employeeBreaks]);

  const toggleDate = (key: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const allExpanded = mergedDayRows.length > 0 && mergedDayRows.every((r) => expandedDates.has(r.dateKey));

  const toggleAllDates = () => {
    if (allExpanded) {
      setExpandedDates(new Set());
    } else {
      setExpandedDates(new Set(mergedDayRows.map((r) => r.dateKey)));
    }
  };

  const totalRecords = filteredEmployees.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const pagedEmployees = filteredEmployees.slice(startIdx, startIdx + pageSize);
  const showingFrom = totalRecords === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + pageSize, totalRecords);
  const fillerCount = Math.max(0, pageSize - pagedEmployees.length);

  // ── NEW: page-level selection state for header checkbox ──
  const pageIds = pagedEmployees.map((e) => e.employee_id);
  const selectedOnPage = pageIds.filter((id) => selectedEmployeeIds.has(id));
  const isAllPageSelected = pageIds.length > 0 && selectedOnPage.length === pageIds.length;
  const isSomePageSelected = selectedOnPage.length > 0 && !isAllPageSelected;

  const handleToggleSelectPage = () => {
    setSelectedEmployeeIds((prev) => {
      const next = new Set(prev);
      if (isAllPageSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const detailRangeLabel = fromDate || toDate
    ? `${fromDate ? formatDateDDMMYYYY(fromDate) : "Start"} to ${toDate ? formatDateDDMMYYYY(toDate) : "End"}`
    : "Today";

  const handleDownloadPDF = async () => {
    if (!selectedEmployee) return;
    setDownloadingPdf(true);
    try {
      const jsPDFModule = await import("jspdf");
      const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;

      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const drawTable = (options: {
        startY: number;
        head: string[];
        body: string[][];
        widths: number[];
        fontSize?: number;
      }) => {
        const rowHeight = 22;
        const fontSize = options.fontSize || 9;
        const left = 40;
        const right = pageWidth - 40;
        let currentY = options.startY;

        const drawRow = (cells: string[], header = false) => {
          if (currentY + rowHeight > pageHeight - 50) {
            doc.addPage();
            currentY = 40;
          }

          let x = left;
          cells.forEach((cell, index) => {
            const width = options.widths[index] || (right - left) / cells.length;
            doc.setFillColor(...(header ? [11, 56, 84] : [255, 255, 255]) as [number, number, number]);
            doc.rect(x, currentY, width, rowHeight, "F");
            doc.setDrawColor(219, 228, 238);
            doc.rect(x, currentY, width, rowHeight, "S");
            doc.setTextColor(...(header ? [255, 255, 255] : [30, 41, 59]) as [number, number, number]);
            doc.setFont("helvetica", header ? "bold" : "normal");
            doc.setFontSize(fontSize);
            doc.text(String(cell || "-"), x + 6, currentY + 14, { maxWidth: Math.max(10, width - 12) });
            x += width;
          });
          currentY += rowHeight;
        };

        drawRow(options.head, true);
        options.body.forEach((row) => drawRow(row));
        (doc as any).lastAutoTable = { finalY: currentY };
      };

      doc.setFillColor(11, 56, 84);
      doc.rect(0, 0, pageWidth, 80, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Employee Activity Report", 40, 35);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, 55);
      doc.text(`Report Period: ${detailRangeLabel}`, pageWidth - 40, 55, { align: "right" });

      let yPos = 110;
      doc.setTextColor(11, 56, 84);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(selectedEmployee.employee_name || "N/A", 40, yPos);

      yPos += 20;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.text(`${selectedEmployee.department || "General"}  |  ${selectedEmployee.role || "Agent"}`, 40, yPos);

      yPos += 16;
      doc.text(`Email: ${selectedEmployee.email || "N/A"}`, 40, yPos);

      yPos += 16;
      doc.setDrawColor(219, 228, 238);
      doc.setLineWidth(1);
      doc.line(40, yPos, pageWidth - 40, yPos);

      yPos += 20;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(11, 56, 84);
      doc.text("Performance Summary", 40, yPos);

      yPos += 10;
      const cardY = yPos;
      const cardHeight = 55;
      const cardGap = 10;
      const cardWidth = (pageWidth - 80 - cardGap * 3) / 4;

      const summaryCards = [
        { label: "Total Working Hours", value: selectedEmployee.worked || "00:00:00", color: [11, 56, 84] },
        { label: "Break Time", value: selectedEmployee.break_time || "00:00:00", color: [184, 90, 16] },
        { label: "Productive Hours", value: selectedEmployee.productive || "00:00:00", color: [5, 150, 105] },
        { label: "Status", value: (selectedEmployee.status || "PENDING").replace("_", " "), color: [11, 56, 84] },
      ];

      summaryCards.forEach((card, i) => {
        const x = 40 + i * (cardWidth + cardGap);
        doc.setFillColor(244, 247, 250);
        doc.roundedRect(x, cardY, cardWidth, cardHeight, 6, 6, "F");
        doc.setDrawColor(219, 228, 238);
        doc.roundedRect(x, cardY, cardWidth, cardHeight, 6, 6, "S");

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(card.label.toUpperCase(), x + 8, cardY + 16);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(card.color[0], card.color[1], card.color[2]);
        doc.text(String(card.value), x + 8, cardY + 38);
      });

      yPos = cardY + cardHeight + 25;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(11, 56, 84);
      doc.text("Break Types Taken", 40, yPos);

      yPos += 8;
      const breakTypeRows = Object.entries(breakTypeSummary).map(([type, summary]) => [
        type.charAt(0).toUpperCase() + type.slice(1),
        `${summary.count} break${summary.count === 1 ? "" : "s"}`,
        formatSeconds(summary.seconds),
      ]);

      drawTable({
        startY: yPos,
        head: ["Break Type", "Count", "Total Duration"],
        body: breakTypeRows.length > 0 ? breakTypeRows : [["No breaks recorded", "-", "-"]],
        widths: [200, 100, 150],
        fontSize: 10,
      });

      // @ts-ignore
      yPos = (doc as any).lastAutoTable.finalY + 25;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(11, 56, 84);
      doc.text("Break Activity Log", 40, yPos);

      yPos += 8;

      const breakActivityRows = employeeBreaks.map((item) => {
        const actualSeconds = Number(item.actual_duration || 0);
        const allocatedSeconds = Number(item.allocated_duration || 0) * 60;
        const efficiency =
          allocatedSeconds > 0
            ? Math.min(100, Math.round((allocatedSeconds / Math.max(actualSeconds, allocatedSeconds)) * 100))
            : Number.parseInt(String(item.efficiency || "0"), 10) || 0;
        const started = item.started_at ? new Date(item.started_at) : null;
        const startedValid = started && !Number.isNaN(started.getTime());
        const startedStr = startedValid
          ? `${started!.toLocaleDateString([], { day: "2-digit", month: "short" })} ${started!.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
          : "—";
        return [
          (item.break_type || "Other").charAt(0).toUpperCase() + (item.break_type || "Other").slice(1),
          startedStr,
          formatSeconds(actualSeconds),
          `${efficiency}%`,
          formatBreakDetails(item.details),
        ];
      });

      drawTable({
        startY: yPos,
        head: ["Break Type", "Date / Time", "Duration", "Efficiency", "Details"],
        body: breakActivityRows.length > 0 ? breakActivityRows : [["No break activity found", "-", "-", "-", "-"]],
        widths: [90, 100, 70, 70, pageWidth - 80 - 330],
        fontSize: 9,
      });

      const totalPagesCount = doc.getNumberOfPages();
      for (let i = 1; i <= totalPagesCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(219, 228, 238);
        doc.setLineWidth(0.5);
        doc.line(40, pageHeight - 40, pageWidth - 40, pageHeight - 40);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text("Admin Daily Work Tracker - Confidential", 40, pageHeight - 25);
        doc.text(`Page ${i} of ${totalPagesCount}`, pageWidth - 40, pageHeight - 25, { align: "right" });
      }

      const safeName = (selectedEmployee.employee_name || "employee").replace(/\s+/g, "_");
      const dateStamp = new Date().toISOString().split("T")[0];
      doc.save(`${safeName}_Activity_Report_${dateStamp}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACHIEVED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Achieved
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap bg-[#0B3854]/[0.07] text-[#0B3854] border border-[#0B3854]/15 animate-pulse">
            <TrendingUp className="w-3 h-3 text-[#11507A]" /> In progress
          </span>
        );
      case "BEHIND":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" /> Behind
          </span>
        );
      case "NOT_STARTED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap bg-slate-100 text-slate-600 border border-slate-200">
            <Clock className="w-3 h-3 text-slate-400" /> Not started
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap bg-slate-100 text-slate-600 border border-slate-200">
            Pending
          </span>
        );
    }
  };

  const getLiveStateBadge = (state: string) => {
    if (state === "BREAK") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap bg-[#E6761D]/10 text-[#B85A10] border border-[#E6761D]/25">
          <Coffee className="w-3 h-3 text-[#E6761D]" /> On Break
        </span>
      );
    }
    if (["ACTIVE", "ACTIVITY_CHECK", "RUNNING"].includes(state)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="relative flex w-1.5 h-1.5">
            <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-500 opacity-70 animate-ping" />
            <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </span>
          Working Now
        </span>
      );
    }
    if (state === "LOGGED_OUT") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap bg-slate-100 text-slate-600 border border-slate-200">
          <LogOut className="w-3 h-3 text-slate-400" /> Logged Out
        </span>
      );
    }
    if (state === "IDLE") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap bg-amber-50 text-amber-700 border border-amber-200">
          Idle
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap bg-slate-100 text-slate-500">
        Not Started
      </span>
    );
  };

  const getEfficiencyMeta = (item: EmployeeBreakItem) => {
    const actualSeconds = Number(item.actual_duration || 0);
    const allocatedSeconds = Number(item.allocated_duration || 0) * 60;
    const efficiency = allocatedSeconds > 0
      ? Math.min(100, Math.round((allocatedSeconds / Math.max(actualSeconds, allocatedSeconds)) * 100))
      : Number.parseInt(String(item.efficiency || "0"), 10) || 0;
    const label = efficiency >= 90 ? "Stable" : efficiency >= 75 ? "Watch" : "Review";
    const color = efficiency >= 90 ? "#059669" : efficiency >= 75 ? "#b45309" : "#dc2626";
    return { efficiency, label, color };
  };

  const metrics = [
    { label: "Total Employees", value: stats.totalEmployee, icon: Users, tint: NAVY, mono: false, pulse: false },
    { label: "Working Now", value: stats.workingNow, icon: PlayCircle, tint: "#16a34a", mono: false, pulse: true },
    { label: "On Break", value: stats.onBreak, icon: Coffee, tint: ORANGE, mono: false, pulse: false },
    { label: "Not Started", value: stats.notStarted, icon: Clock, tint: "#64748b", mono: false, pulse: false },
    { label: "Target Missed", value: stats.targetMissed, icon: AlertTriangle, tint: "#e11d48", mono: false, pulse: false },
    { label: "Productive Hrs", value: stats.totalProductiveHours, icon: Zap, tint: NAVY_SOFT, mono: true, pulse: false },
  ];

  const pageBtn = "min-w-[28px] h-7 px-2 flex items-center justify-center rounded-md text-[11px] font-semibold transition-all";

  // ═══════════════════════════════════════════════════════════
  // RENDER: SEPARATE EMPLOYEE DETAILS PAGE (compact hero)
  // ═══════════════════════════════════════════════════════════
  if (showEmployeePage && selectedEmployee) {
    return (
      <div className="space-y-2.5">
        {/* ── Compact Page Header / Hero ── */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: `1px solid ${LINE}`, boxShadow: CARD_SHADOW }}
        >
          <div
            className="px-4 py-3"
            style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_SOFT} 100%)` }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={closeEmployeePage}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer active:scale-95 shrink-0"
                  title="Back to list"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div
                  className="w-11 h-11 rounded-full text-white flex items-center justify-center font-bold text-[15px] shrink-0"
                  style={{ background: `linear-gradient(135deg, ${ORANGE} 0%, #f59e4b 100%)`, boxShadow: `0 0 0 2px rgba(255,255,255,0.18)` }}
                >
                  {getInitials(selectedEmployee.employee_name)}
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60 leading-3">
                    Employee Activity Details
                  </p>
                  <h1 className="mt-0.5 text-[16px] font-bold text-white truncate leading-5">
                    {selectedEmployee.employee_name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                    <span className="text-[10.5px] text-white/75 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {selectedEmployee.department || "General"} · {selectedEmployee.role || "Agent"}
                    </span>
                    <span className="text-[10.5px] text-white/75 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {selectedEmployee.email}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-1 text-[9px] font-semibold text-white/70">
                  From
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                    className="rounded-md border border-white/15 bg-white/10 px-1.5 py-1 text-[10px] text-white outline-none"
                  />
                </label>
                <label className="flex items-center gap-1 text-[9px] font-semibold text-white/70">
                  To
                  <input
                    type="date"
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                    className="rounded-md border border-white/15 bg-white/10 px-1.5 py-1 text-[10px] text-white outline-none"
                  />
                </label>

                <button
                  onClick={handleDownloadPDF}
                  disabled={downloadingPdf || employeeBreaksLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#E6761D] hover:bg-[#c9640f] px-2.5 py-1.5 text-[10.5px] font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  title="Download PDF report"
                >
                  {downloadingPdf ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-3.5 w-3.5" />
                      Download PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ── Report Period Strip (compact) ── */}
          <div className="flex items-center justify-between px-4 py-1.5 bg-slate-50 border-b border-slate-100">
            <span className="text-[9.5px] font-semibold uppercase tracking-wide text-slate-500">
              Report period
            </span>
            <span className="font-mono text-[10.5px] font-semibold" style={{ color: NAVY }}>
              {detailRangeLabel}
            </span>
          </div>
        </div>

        {/* ── KPI Summary Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {[
            { label: "Total Working Hours", value: selectedEmployee.worked, icon: Clock, color: NAVY, bg: "#eef3f8" },
            { label: "Break Time", value: selectedEmployee.break_time, icon: Coffee, color: "#B85A10", bg: "#fff7ed" },
            { label: "Productive Hours", value: selectedEmployee.productive, icon: Zap, color: "#059669", bg: "#ecfdf5" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{ background: card.bg, border: `1px solid ${LINE}`, boxShadow: CARD_SHADOW }}
              >
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${card.color}1a` }}
                >
                  <Icon className="w-4 h-4" style={{ color: card.color }} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-slate-500 truncate">{card.label}</p>
                  <p className="mt-0.5 font-mono text-[17px] font-bold leading-5" style={{ color: card.color }}>
                    {card.value || "00:00:00"}
                  </p>
                </div>
              </div>
            );
          })}
          <div
            className="rounded-xl px-4 py-3 flex items-center gap-3"
            style={{ background: "#f4f7fa", border: `1px solid ${LINE}`, boxShadow: CARD_SHADOW }}
          >
            <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${NAVY}1a` }}>
              <Activity className="w-4 h-4" style={{ color: NAVY }} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Daily Status</p>
              <div className="mt-1">{getStatusBadge(selectedEmployee.status)}</div>
            </div>
          </div>
        </div>

        {/* ── MERGED: Daily Work + Break Activity (single table) ── */}
        <div
          className="rounded-xl overflow-hidden bg-white"
          style={{ border: `1px solid ${LINE}`, boxShadow: CARD_SHADOW }}
        >
          {/* ── CHANGED: White header with dark text and bottom border ── */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-white border-b border-slate-200">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" style={{ color: NAVY }} />
              <h2 className="text-[12.5px] font-bold" style={{ color: NAVY }}>
                Daily Work Activity &amp; Break Log
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-slate-500">
                {mergedDayRows.length} day{mergedDayRows.length === 1 ? "" : "s"} · {employeeBreaks.length} break{employeeBreaks.length === 1 ? "" : "s"}
              </span>
              <button
                onClick={toggleAllDates}
                disabled={mergedDayRows.length === 0}
                className="inline-flex items-center gap-1 rounded-md bg-slate-100 hover:bg-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-700 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <ChevronDown className={`w-3 h-3 transition-transform ${allExpanded ? "rotate-180" : ""}`} />
                {allExpanded ? "Collapse all" : "Expand all"}
              </button>
            </div>
          </div>

          {employeeBreaksLoading ? (
            <div className="p-8 text-center text-[11px] text-slate-500">
              <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2" style={{ color: ORANGE }} />
              Loading activity &amp; break details...
            </div>
          ) : mergedDayRows.length === 0 ? (
            <div className="p-8 text-center text-[11px] text-slate-500">
              No daily work activity or breaks found for this date range.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-left text-[11px] border-collapse">
                <colgroup>
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "24%" }} />
                </colgroup>
                <thead>
                  <tr className="bg-slate-50 text-[9px] uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2.5" style={{ borderRight: `1px solid ${V_LINE}` }}>Date</th>
                    <th className="px-3 py-2.5" style={{ borderRight: `1px solid ${V_LINE}` }}>Work Started</th>
                    <th className="px-3 py-2.5" style={{ borderRight: `1px solid ${V_LINE}` }}>Work Ended</th>
                    <th className="px-3 py-2.5 text-center" style={{ borderRight: `1px solid ${V_LINE}` }}>Worked</th>
                    <th className="px-3 py-2.5 text-center" style={{ borderRight: `1px solid ${V_LINE}` }}>Break</th>
                    <th className="px-3 py-2.5 text-center" style={{ borderRight: `1px solid ${V_LINE}` }}>Productive</th>
                    <th className="px-3 py-2.5">Status &amp; Breaks</th>
                  </tr>
                </thead>
                <tbody>
                  {mergedDayRows.map((row) => {
                    const isOpen = expandedDates.has(row.dateKey);
                    const daily = row.daily;
                    return (
                      <React.Fragment key={row.dateKey}>
                        {/* ── Master row (day summary) ── */}
                        <tr
                          className={`border-t border-slate-100 cursor-pointer transition-colors ${isOpen ? "bg-[#0B3854]/[0.03]" : "hover:bg-slate-50/60"}`}
                          onClick={() => toggleDate(row.dateKey)}
                        >
                          <td className="px-3 py-2.5" style={{ borderRight: `1px solid ${V_LINE}` }}>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#0B3854]/[0.07] border border-[#0B3854]/15">
                                <CalendarDays className="w-3.5 h-3.5 text-[#0B3854]" />
                              </span>
                              <div>
                                <div className="font-semibold text-slate-800 font-mono text-[11px]">{row.dateLabel}</div>
                                {row.breakCount > 0 && (
                                  <div className="text-[9px] text-slate-400 flex items-center gap-1">
                                    <Coffee className="w-2.5 h-2.5" />
                                    {row.breakCount} break{row.breakCount === 1 ? "" : "s"} · {formatSeconds(row.breakSeconds)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 font-mono text-slate-600 text-[11px]" style={{ borderRight: `1px solid ${V_LINE}` }}>
                            {daily ? formatSessionTime(daily.started_at) : "—"}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-slate-600 text-[11px]" style={{ borderRight: `1px solid ${V_LINE}` }}>
                            {daily ? formatSessionTime(daily.ended_at) : "—"}
                          </td>
                          <td className="px-3 py-2.5 text-center" style={{ borderRight: `1px solid ${V_LINE}` }}>
                            <span className="inline-flex items-center justify-center min-w-[70px] rounded-md bg-slate-50 border border-slate-200 px-2 py-1 font-mono font-semibold text-[10.5px] text-slate-700">
                              {daily?.worked || "00:00:00"}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-center" style={{ borderRight: `1px solid ${V_LINE}` }}>
                            <span className="inline-flex items-center justify-center min-w-[70px] rounded-md bg-[#fff7ed] border border-[#fed7aa] px-2 py-1 font-mono font-semibold text-[10.5px] text-[#B85A10]">
                              {daily?.break_time || (row.breakSeconds > 0 ? formatSeconds(row.breakSeconds) : "00:00:00")}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-center" style={{ borderRight: `1px solid ${V_LINE}` }}>
                            <span className="inline-flex items-center justify-center min-w-[70px] rounded-md bg-emerald-50 border border-emerald-200 px-2 py-1 font-mono font-bold text-[10.5px] text-emerald-700">
                              {daily?.productive || "00:00:00"}
                            </span>
                          </td>
                          {/* ── Status column now contains the status badge + expand chevron ── */}
                          <td className="px-3 py-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {getStatusBadge(daily?.status || "PENDING")}
                              </div>
                              <span
                                className={`inline-flex items-center justify-center w-5 h-5 rounded-md border transition-all shrink-0 ${isOpen ? "bg-[#0B3854] border-[#0B3854] text-white" : "border-slate-300 text-slate-500"}`}
                                title={isOpen ? "Collapse break details" : "Expand break details"}
                              >
                                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                              </span>
                            </div>
                          </td>
                        </tr>

                        {/* ── Detail row (breaks for that day) ── */}
                        {isOpen && (
                          <tr className="bg-slate-50/40">
                            <td colSpan={7} className="px-0 py-0">
                              <div className="px-3 pb-3 pt-1.5">
                                {row.breaks.length === 0 ? (
                                  <div className="rounded-lg border border-dashed border-slate-200 bg-white/70 px-4 py-4 text-center text-[10.5px] text-slate-500">
                                    No breaks recorded on this day.
                                  </div>
                                ) : (
                                  <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
                                    <div className="flex items-center gap-2 px-3 py-2 bg-[#f4f7fa] border-b border-slate-200">
                                      <Coffee className="w-3.5 h-3.5" style={{ color: ORANGE }} />
                                      <span className="text-[10.5px] font-bold" style={{ color: NAVY }}>
                                        Break Activity
                                      </span>
                                      <span className="text-[9.5px] text-slate-500 ml-auto">
                                        Total: {formatSeconds(row.breakSeconds)}
                                      </span>
                                    </div>
                                    <div className="overflow-x-auto">
                                      <table className="w-full min-w-[700px] text-left text-[10.5px] border-collapse">
                                        <thead>
                                          <tr className="bg-white text-[9px] uppercase tracking-wide text-slate-500">
                                            <th className="px-3 py-1.5" style={{ borderRight: `1px solid ${V_LINE}`, borderBottom: `1px solid ${V_LINE}` }}>Break Type</th>
                                            <th className="px-3 py-1.5" style={{ borderRight: `1px solid ${V_LINE}`, borderBottom: `1px solid ${V_LINE}` }}>Date / Time</th>
                                            <th className="px-3 py-1.5" style={{ borderRight: `1px solid ${V_LINE}`, borderBottom: `1px solid ${V_LINE}` }}>Duration</th>
                                            <th className="px-3 py-1.5" style={{ borderRight: `1px solid ${V_LINE}`, borderBottom: `1px solid ${V_LINE}` }}>Efficiency</th>
                                            <th className="px-3 py-1.5" style={{ borderBottom: `1px solid ${V_LINE}` }}>Details</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {row.breaks.map((item, index) => {
                                            const { efficiency, label, color } = getEfficiencyMeta(item);
                                            const started = item.started_at ? new Date(item.started_at) : null;
                                            const startedValid = started && !Number.isNaN(started.getTime());
                                            return (
                                              <tr
                                                key={`${item.break_type}-${item.started_at}-${index}`}
                                                className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors"
                                              >
                                                <td className="px-3 py-2 font-semibold capitalize text-slate-800" style={{ borderRight: `1px solid ${V_LINE}` }}>
                                                  {item.break_type || "Other"}
                                                </td>
                                                <td className="px-3 py-2 text-slate-500" style={{ borderRight: `1px solid ${V_LINE}` }}>
                                                  {startedValid
                                                    ? `${formatDateDDMMYYYY(item.started_at)} · ${started.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                                                    : "—"}
                                                </td>
                                                <td className="px-3 py-2 font-mono font-semibold text-slate-700" style={{ borderRight: `1px solid ${V_LINE}` }}>
                                                  {formatSeconds(Number(item.actual_duration || 0))}
                                                </td>
                                                <td className="px-3 py-2 font-semibold" style={{ borderRight: `1px solid ${V_LINE}`, color }}>
                                                  <span className="inline-flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                                                    {label} {efficiency}%
                                                  </span>
                                                </td>
                                                <td className="max-w-[300px] px-3 py-2 text-slate-500">
                                                  <span className="block truncate" title={formatBreakDetails(item.details)}>
                                                    {formatBreakDetails(item.details)}
                                                  </span>
                                                </td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Break Types Summary Footer Strip ── */}
          {Object.keys(breakTypeSummary).length > 0 && (
            <div className="border-t border-slate-200 bg-[#f4f7fa] px-4 py-3">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-3.5 h-3.5" style={{ color: ORANGE }} />
                <span className="text-[10.5px] font-bold" style={{ color: NAVY }}>
                  Break Types Taken
                </span>
                <span className="text-[9.5px] text-slate-500">
                  · {employeeBreaks.length} total break{employeeBreaks.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {Object.entries(breakTypeSummary).map(([type, summary]) => (
                  <div
                    key={type}
                    className="rounded-lg px-3 py-2"
                    style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}
                  >
                    <p className="text-[11px] font-bold capitalize" style={{ color: "#9a3412" }}>
                      {type}
                    </p>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[9.5px] text-slate-600">
                        {summary.count} break{summary.count === 1 ? "" : "s"}
                      </span>
                      <span className="font-mono text-[11px] font-bold" style={{ color: "#c2410c" }}>
                        {formatSeconds(summary.seconds)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: MAIN LIST VIEW
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px rounded-lg overflow-hidden" style={{ background: LINE, border: `1px solid ${LINE}`, boxShadow: CARD_SHADOW }}>
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white relative flex items-center gap-2.5 px-3 py-2.5">
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.pulse ? "animate-pulse" : ""}`} style={{ background: `${m.tint}1a` }}>
                <Icon className="w-4 h-4" style={{ color: m.tint }} />
              </span>
              <div className="min-w-0">
                <p className="text-[10.5px] font-medium text-slate-500 leading-4 truncate">{m.label}</p>
                <p className={`font-bold leading-5 truncate ${m.mono ? "text-[15px] font-mono" : "text-[19px]"}`} style={{ color: NAVY }}>
                  {m.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl flex flex-col" style={{ border: `1px solid ${LINE}`, boxShadow: CARD_SHADOW, height: "calc(100vh - 130px)" }}>

        <div className="px-4 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex w-full flex-wrap items-center justify-end gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[12px] font-bold text-slate-700">All</span>
              <span className="text-[12px] font-bold text-[#E6761D]">{totalRecords}</span>
            </div>

            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              {[
                ["daily_work_tracker", "Daily Work Tracker"],
                ["user_breakdown", "Lead Execution Breakdown"],
                ["activity_logs", "Activity Feed"],
              ].map(([view, label]) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => onActiveViewChange?.(view as ActivityView)}
                  className={`rounded-md px-2.5 py-1.5 text-[10px] font-bold whitespace-nowrap transition-all ${activeView === view ? "text-white shadow-sm" : "text-slate-700 hover:bg-white"}`}
                  style={activeView === view ? { background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_SOFT} 100%)` } : undefined}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="relative group">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#E6761D] transition-colors" />
              <input
                type="text"
                placeholder="Global search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-52 h-9 pl-9 pr-3 text-[11.5px] rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E6761D]/20 focus:border-[#E6761D] transition-all"
              />
            </div>

            <div className="flex items-center h-9 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
              <div className="flex items-center gap-1.5 px-2.5 h-full text-[11px] font-semibold text-slate-600 border-r border-slate-200">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="bg-transparent border-none outline-none cursor-pointer font-sans text-[11px] w-[100px]" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 h-full text-[11px] font-semibold text-slate-600">
                <span className="text-slate-400 text-[10px]">to</span>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="bg-transparent border-none outline-none cursor-pointer font-sans text-[11px] w-[100px]" />
              </div>
            </div>

            {(fromDate || toDate) && (
              <button
                onClick={() => { setFromDate(""); setToDate(""); setSelectedEmployeeId(null); }}
                className="flex items-center justify-center h-9 px-3 rounded-lg text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
              >
                Clear
              </button>
            )}

            <button
              onClick={() => setBreakMasterOpen(true)}
              className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg text-[11px] font-semibold bg-[#E6761D]/10 hover:bg-[#E6761D]/20 text-[#B85A10] border border-[#E6761D]/30 transition-all cursor-pointer active:scale-95"
              title="Configure break types"
            >
              <Coffee className="w-3.5 h-3.5" style={{ color: ORANGE }} />
              Break Types
            </button>

            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg text-[11px] font-semibold text-white transition-all cursor-pointer active:scale-95 disabled:opacity-70"
              style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_SOFT} 100%)`, boxShadow: "0 3px 10px -4px rgba(11,56,84,0.55)" }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── NEW: Bulk actions bar ── */}
        {selectedEmployeeIds.size > 0 && (
          <div
            className="px-4 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0"
            style={{ background: "linear-gradient(90deg, rgba(230,118,29,0.10), rgba(230,118,29,0.02))", borderBottom: `1px solid ${LINE}` }}
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold" style={{ color: NAVY }}>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#E6761D] text-white text-[10px] font-bold">
                {selectedEmployeeIds.size}
              </span>
              employee{selectedEmployeeIds.size === 1 ? "" : "s"} selected
              <button
                onClick={toggleSelectAllFiltered}
                className="ml-2 text-[10.5px] font-semibold text-[#B85A10] hover:text-[#8a3f08] underline-offset-2 hover:underline"
              >
                {filteredEmployees.every((e) => selectedEmployeeIds.has(e.employee_id)) ? "Unselect all filtered" : "Select all filtered"}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearSelection}
                className="h-7 px-2.5 rounded-md text-[10.5px] font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Clear selection
              </button>
              <button
                onClick={() => setBulkDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-[10.5px] font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-sm cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3 h-3" />
                Delete Selected
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 space-y-2 bg-white z-20">
              <RefreshCw className="w-5 h-5 animate-spin" style={{ color: ORANGE }} />
              <p className="text-[11px] font-medium">Fetching real-time work updates...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-slate-400 space-y-1 bg-white z-20">
              <Users className="w-8 h-8 text-slate-300" />
              <p className="text-[13px] font-semibold text-slate-600">No Employees Found</p>
              <p className="text-[11px] text-slate-400">Try adjusting search or date range.</p>
            </div>
          ) : (
            <table className="w-full min-w-[1160px] table-fixed text-left border-collapse">
              <colgroup>
                {/* NEW leading column for selection */}
                <col style={{ width: "40px" }} />
                <col style={{ width: "19%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "15%" }} />
              </colgroup>

              <thead className="sticky top-0 z-10 shadow-sm">
                <tr className="text-white/90 font-semibold uppercase tracking-wide text-[9.5px]" style={{ height: HEAD_H, background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_SOFT} 100%)` }}>
                  {/* NEW: header checkbox */}
                  <th className="px-2 text-center" style={{ borderRight: "1px solid rgba(255,255,255,0.15)" }}>
                    <button
                      type="button"
                      onClick={handleToggleSelectPage}
                      title={isAllPageSelected ? "Unselect page" : "Select page"}
                      className="inline-flex items-center justify-center w-4 h-4 rounded-[4px] border transition-all cursor-pointer"
                      style={{
                        background: isAllPageSelected ? ORANGE : "transparent",
                        borderColor: isAllPageSelected ? ORANGE : "rgba(255,255,255,0.5)",
                        color: "#fff",
                      }}
                    >
                      {isAllPageSelected ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : isSomePageSelected ? (
                        <MinusSquare className="w-3 h-3" />
                      ) : null}
                    </button>
                  </th>
                  <th className="px-4 text-left" style={{ borderRight: "1px solid rgba(255,255,255,0.15)" }}>Buyer Details</th>
                  <th className="px-4 text-left" style={{ borderRight: "1px solid rgba(255,255,255,0.15)" }}>Department / Role</th>
                  <th className="px-4 text-center" style={{ borderRight: "1px solid rgba(255,255,255,0.15)" }}>Target</th>
                  <th className="px-4 text-center" style={{ borderRight: "1px solid rgba(255,255,255,0.15)" }}>Worked</th>
                  <th className="px-4 text-center" style={{ borderRight: "1px solid rgba(255,255,255,0.15)" }}>Break</th>
                  <th className="px-4 text-center" style={{ borderRight: "1px solid rgba(255,255,255,0.15)" }}>Productive</th>
                  <th className="px-4 text-center" style={{ borderRight: "1px solid rgba(255,255,255,0.15)" }}>Live State</th>
                  <th className="px-4 text-center" style={{ borderRight: "1px solid rgba(255,255,255,0.15)" }}>Daily Status</th>
                  <th className="px-4 text-right">Action</th>
                </tr>
                <tr className="bg-white border-b border-slate-200" style={{ height: SEARCH_H }}>
                  {/* NEW: empty search cell */}
                  <th className="px-2" style={{ borderRight: `1px solid ${V_LINE}` }} />
                  <th className="px-3 py-1.5" style={{ borderRight: `1px solid ${V_LINE}` }}>
                    <input type="text" placeholder="Search buyer..." value={colSearches.name} onChange={(e) => handleColSearch("name", e.target.value)} className="w-full h-7 px-2 text-[10px] rounded border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#E6761D] transition-all" />
                  </th>
                  <th className="px-3 py-1.5" style={{ borderRight: `1px solid ${V_LINE}` }}>
                    <input type="text" placeholder="Search dept..." value={colSearches.dept} onChange={(e) => handleColSearch("dept", e.target.value)} className="w-full h-7 px-2 text-[10px] rounded border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#E6761D] transition-all" />
                  </th>
                  <th className="px-3 py-1.5" style={{ borderRight: `1px solid ${V_LINE}` }}>
                    <input type="text" placeholder="e.g. 08:00" value={colSearches.target} onChange={(e) => handleColSearch("target", e.target.value)} className="w-full h-7 px-2 text-[10px] rounded border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#E6761D] text-center transition-all" />
                  </th>
                  <th className="px-3 py-1.5" style={{ borderRight: `1px solid ${V_LINE}` }}>
                    <input type="text" placeholder="e.g. 04:00" value={colSearches.worked} onChange={(e) => handleColSearch("worked", e.target.value)} className="w-full h-7 px-2 text-[10px] rounded border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#E6761D] text-center transition-all" />
                  </th>
                  <th className="px-3 py-1.5" style={{ borderRight: `1px solid ${V_LINE}` }}>
                    <input type="text" placeholder="e.g. 01:00" value={colSearches.break} onChange={(e) => handleColSearch("break", e.target.value)} className="w-full h-7 px-2 text-[10px] rounded border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#E6761D] text-center transition-all" />
                  </th>
                  <th className="px-3 py-1.5" style={{ borderRight: `1px solid ${V_LINE}` }}>
                    <input type="text" placeholder="e.g. 03:00" value={colSearches.productive} onChange={(e) => handleColSearch("productive", e.target.value)} className="w-full h-7 px-2 text-[10px] rounded border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#E6761D] text-center transition-all" />
                  </th>
                  <th className="px-3 py-1.5" style={{ borderRight: `1px solid ${V_LINE}` }}>
                    <input type="text" placeholder="Search state..." value={colSearches.state} onChange={(e) => handleColSearch("state", e.target.value)} className="w-full h-7 px-2 text-[10px] rounded border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#E6761D] text-center transition-all" />
                  </th>
                  <th className="px-3 py-1.5" style={{ borderRight: `1px solid ${V_LINE}` }}>
                    <select
                      value={colSearches.status}
                      onChange={(e) => handleColSearch("status", e.target.value)}
                      className="w-full h-7 px-1.5 text-[10px] rounded border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#E6761D] text-center transition-all cursor-pointer"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </th>
                  <th className="px-3 py-1.5"></th>
                </tr>
              </thead>

              <tbody className="font-medium text-slate-700">
                {pagedEmployees.map((emp, i) => {
                  const isSelected = selectedEmployeeIds.has(emp.employee_id);
                  return (
                    <tr
                      key={emp.employee_id}
                      className={`group transition-colors cursor-pointer ${isSelected ? "bg-[#E6761D]/[0.06]" : i % 2 === 1 ? "bg-slate-50/50" : "bg-white"} hover:bg-[#0B3854]/[0.03]`}
                      style={{ height: ROW_H, borderBottom: `1px solid #eef2f6` }}
                      onClick={() => openEmployeeDetails(emp)}
                    >
                      {/* NEW: row checkbox */}
                      <td className="px-2 text-center" style={{ borderRight: `1px solid ${V_LINE}` }}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleSelectEmployee(emp.employee_id); }}
                          title={isSelected ? "Unselect" : "Select"}
                          className={`inline-flex items-center justify-center w-4 h-4 rounded-[4px] border transition-all cursor-pointer ${isSelected ? "bg-[#E6761D] border-[#E6761D] text-white" : "border-slate-300 text-transparent hover:border-[#E6761D]"}`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                        </button>
                      </td>
                      <td className="px-4" style={{ borderRight: `1px solid ${V_LINE}` }}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-[11px] shrink-0 shadow-sm" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_SOFT} 100%)`, boxShadow: `0 0 0 2px ${ORANGE}33` }}>
                            {getInitials(emp.employee_name)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-[12px] leading-4 truncate text-slate-800 group-hover:text-[#0B3854] transition-colors">{emp.employee_name}</div>
                            <div className="text-[10px] text-slate-400 font-mono leading-3.5 truncate flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {emp.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4" style={{ borderRight: `1px solid ${V_LINE}` }}>
                        <div className="font-semibold text-slate-800 text-[11.5px] leading-4 truncate">{emp.department || "General"}</div>
                        <div className="text-[10px] text-slate-400 capitalize leading-3.5 truncate">{emp.role || "Agent"}</div>
                      </td>
                      <td className="px-4 text-center font-mono font-semibold" style={{ borderRight: `1px solid ${V_LINE}` }}>
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-md text-[10.5px] bg-[#0B3854]/[0.07] text-[#0B3854] border border-[#0B3854]/15 min-w-[64px]">{emp.target || "08:00:00"}</span>
                      </td>
                      <td className="px-4 text-center font-mono font-semibold" style={{ borderRight: `1px solid ${V_LINE}` }}>
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-md text-[10.5px] bg-slate-100 text-slate-800 min-w-[64px]">{emp.worked || "00:00:00"}</span>
                      </td>
                      <td className="px-4 text-center font-mono font-semibold" style={{ borderRight: `1px solid ${V_LINE}` }}>
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-md text-[10.5px] bg-[#E6761D]/10 text-[#B85A10] border border-[#E6761D]/20 min-w-[64px]">{emp.break_time || "00:00:00"}</span>
                      </td>
                      <td className="px-4 text-center font-mono font-bold" style={{ borderRight: `1px solid ${V_LINE}` }}>
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-md text-[10.5px] bg-emerald-50 text-emerald-700 border border-emerald-100 min-w-[64px]">{emp.productive || "00:00:00"}</span>
                      </td>
                      <td className="px-4 text-center" style={{ borderRight: `1px solid ${V_LINE}` }}>{getLiveStateBadge(emp.current_state)}</td>
                      <td className="px-4 text-center" style={{ borderRight: `1px solid ${V_LINE}` }}>{getStatusBadge(emp.status)}</td>
                      <td className="px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); openEmployeeDetails(emp); }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10.5px] font-semibold text-[#0B3854] bg-white border border-slate-200 hover:border-[#0B3854] hover:bg-[#0B3854]/5 transition-all cursor-pointer shadow-sm active:scale-95"
                            title="View employee details"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); setTargetEmp(emp); setNewTargetHours(emp.target_seconds ? emp.target_seconds / 3600 : 8); setTargetModalOpen(true); }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10.5px] font-semibold text-[#0B3854] bg-white border border-slate-200 hover:border-[#E6761D] hover:text-[#B85A10] hover:bg-[#E6761D]/5 transition-all cursor-pointer shadow-sm active:scale-95"
                            title="Set Daily Target"
                          >
                            <Edit className="w-3 h-3" /> Target
                          </button>

                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteEmp(emp); setDeleteModalOpen(true); }}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-rose-600 bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 transition-all cursor-pointer shadow-sm active:scale-95"
                            title="Delete employee"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {Array.from({ length: fillerCount }).map((_, i) => (
                  <tr key={`filler-${i}`} style={{ height: ROW_H }}>
                    <td colSpan={10} />
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-50/80 shrink-0" style={{ borderTop: `1px solid ${LINE}` }}>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>
              Showing <span className="font-semibold" style={{ color: NAVY }}>{showingFrom}–{showingTo}</span> of <span className="font-semibold" style={{ color: NAVY }}>{totalRecords}</span>
            </span>
            <span className="flex items-center gap-2">
              Rows per page
              <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="h-7 px-2 rounded-md border border-slate-200 bg-white text-[11px] font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#E6761D]/20 focus:border-[#E6761D] cursor-pointer shadow-sm">
                {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage(Math.max(1, safePage - 1))} disabled={safePage <= 1} className={`${pageBtn} border border-slate-200 bg-white text-slate-600 hover:border-[#E6761D] hover:text-[#B85A10] disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 disabled:cursor-not-allowed shadow-sm`} title="Previous page">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {getPageNumbers(totalPages, safePage).map((p, idx) =>
              p === "..." ? (
                <span key={`dots-${idx}`} className="px-1 text-[11px] text-slate-400 font-semibold">…</span>
              ) : (
                <button key={p} onClick={() => setPage(p)} className={`${pageBtn} ${p === safePage ? "text-white shadow-md" : "border border-slate-200 bg-white text-slate-600 hover:border-[#E6761D] hover:text-[#B85A10] shadow-sm"}`} style={p === safePage ? { background: ORANGE, boxShadow: "0 3px 10px -3px rgba(230,118,29,0.65)" } : undefined}>
                  {p}
                </button>
              )
            )}
            <button onClick={() => setPage(Math.min(totalPages, safePage + 1))} disabled={safePage >= totalPages} className={`${pageBtn} border border-slate-200 bg-white text-slate-600 hover:border-[#E6761D] hover:text-[#B85A10] disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 disabled:cursor-not-allowed shadow-sm`} title="Next page">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {targetModalOpen && targetEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn" style={{ background: "rgba(4,24,38,0.70)" }}>
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden" style={{ border: `1px solid ${LINE}`, boxShadow: "0 30px 70px -20px rgba(4,24,38,0.6)" }}>
            <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${ORANGE}, #f59e4b, transparent)` }} />
            <div className="flex items-center justify-between px-4 py-2.5" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_SOFT} 100%)` }}>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(230,118,29,0.20)", border: "1px solid rgba(230,118,29,0.45)" }}>
                  <Target className="w-3.5 h-3.5" style={{ color: ORANGE }} />
                </span>
                <h3 className="font-semibold text-white text-[13px]">Set Daily Target</h3>
              </div>
              <button onClick={() => setTargetModalOpen(false)} className="p-1 text-white/60 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-lg px-3 py-2" style={{ background: "#eef3f8", border: `1px solid ${LINE}` }}>
                  <p className="text-[10px] font-medium text-slate-500">Employee</p>
                  <p className="text-[12px] font-semibold mt-0.5 truncate" style={{ color: NAVY }}>{targetEmp.employee_name}</p>
                </div>
                <div className="rounded-lg px-3 py-2" style={{ background: "#eef3f8", border: `1px solid ${LINE}` }}>
                  <p className="text-[10px] font-medium text-slate-500">Target Date</p>
                  <p className="text-[12px] font-mono font-semibold mt-0.5" style={{ color: ORANGE }}>{formatDateDDMMYYYY(toDate || fromDate || new Date().toISOString().split("T")[0])}</p>
                </div>
              </div>

              <div>
                <label className="block text-[11.5px] font-semibold text-slate-700 mb-1">Target Hours (Default 8 Hours):</label>
                <input type="number" step="0.5" min="1" max="24" value={newTargetHours} onChange={(e) => setNewTargetHours(parseFloat(e.target.value) || 8)} className="w-full h-9 px-3 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E6761D]/30 focus:border-[#E6761D]" />
                <p className="text-[10.5px] text-slate-400 mt-1">Equivalents: {Math.round(newTargetHours * 3600)} seconds ({newTargetHours} Hours)</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-4 py-2.5 bg-slate-50/70" style={{ borderTop: `1px solid ${LINE}` }}>
              <button onClick={() => setTargetModalOpen(false)} className="px-3 py-1.5 rounded-lg text-[11.5px] font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">Cancel</button>
              <button onClick={handleSaveTarget} disabled={settingTarget} className="px-4 py-1.5 rounded-lg text-[11.5px] font-semibold text-white cursor-pointer active:scale-95 disabled:opacity-70" style={{ background: ORANGE, boxShadow: "0 4px 12px -4px rgba(230,118,29,0.7)" }}>
                {settingTarget ? "Saving..." : "Save Target"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModalOpen && deleteEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(4,24,38,0.70)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden" style={{ border: `1px solid ${LINE}`, boxShadow: "0 30px 70px -20px rgba(4,24,38,0.6)" }}>
            <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border-b border-rose-100">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-rose-900 text-[13px]">Delete Employee</h3>
                <p className="text-[10px] text-rose-600">This action cannot be undone.</p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-[12px] text-slate-600">
                Are you sure you want to delete <span className="font-bold text-slate-800">{deleteEmp.employee_name}</span>? All associated data will be permanently removed.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-2.5 bg-slate-50/70" style={{ borderTop: `1px solid ${LINE}` }}>
              <button onClick={() => { setDeleteModalOpen(false); setDeleteEmp(null); }} className="px-3 py-1.5 rounded-lg text-[11.5px] font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">Cancel</button>
              <button onClick={handleDeleteEmployee} disabled={deleting} className="px-4 py-1.5 rounded-lg text-[11.5px] font-semibold text-white cursor-pointer active:scale-95 disabled:opacity-70 bg-rose-600 hover:bg-rose-700">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW: Bulk Delete Confirmation Modal ── */}
      {bulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(4,24,38,0.70)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden" style={{ border: `1px solid ${LINE}`, boxShadow: "0 30px 70px -20px rgba(4,24,38,0.6)" }}>
            <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border-b border-rose-100">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-rose-900 text-[13px]">Delete Selected Employees</h3>
                <p className="text-[10px] text-rose-600">This action cannot be undone.</p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-[12px] text-slate-600">
                Are you sure you want to delete{" "}
                <span className="font-bold text-slate-800">
                  {selectedEmployeeIds.size} employee{selectedEmployeeIds.size === 1 ? "" : "s"}
                </span>
                ? All associated data will be permanently removed.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 px-4 py-2.5 bg-slate-50/70" style={{ borderTop: `1px solid ${LINE}` }}>
              <button onClick={() => setBulkDeleteModalOpen(false)} className="px-3 py-1.5 rounded-lg text-[11.5px] font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">Cancel</button>
              <button onClick={handleBulkDelete} disabled={bulkDeleting} className="px-4 py-1.5 rounded-lg text-[11.5px] font-semibold text-white cursor-pointer active:scale-95 disabled:opacity-70 bg-rose-600 hover:bg-rose-700">
                {bulkDeleting ? "Deleting..." : "Delete All"}
              </button>
            </div>
          </div>
        </div>
      )}

      {breakMasterOpen && (
        <AdminBreakTypesMasterModal isOpen={breakMasterOpen} onClose={() => setBreakMasterOpen(false)} />
      )}
    </div>
  );
};

export default AdminDailyWorkTracker;