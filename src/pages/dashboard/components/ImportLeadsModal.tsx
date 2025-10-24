import React, { useEffect, useMemo, useRef, useState, ChangeEvent } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import * as XLSXRaw from "xlsx-js-style";
import { leadsAPI, usersAPI } from "@/lib/api";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { getAssignableExecutives } from "@/utils/roleBasedOptions";
import { Upload, X } from "lucide-react";

const XLSX = XLSXRaw as any;

/* ============================ Types ============================ */
type RawRow = Record<string, any>;

type SkippedRow = {
  row: number;
  reason: string;
  data: RawRow;
};

type UpdatedRow = {
  row?: number;
  id?: string | number;
  note?: string;
  data: RawRow;
  assigned_executive?: string | number;
};

type DuplicateRow = {
  row?: number;
  reason: string;
  data: RawRow;
  duplicateFields?: string[];
  existingId?: string | number;
};

type SummaryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  duplicates: DuplicateRow[];
  skippedRows: SkippedRow[];
  updatedRows: UpdatedRow[];
};

type ImportLeadsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Executive = {
  id: string | number;
  name: string;
  email?: string;
  username?: string;
};

type AssignmentMode = "none" | "selected";

/* ======================= Utility / Helpers ===================== */

// Cheap, safe role detectors (works with many backends)
const getRoleString = (u: any): string => {
  const r =
    u?.role ||
    u?.roles ||
    u?.raw?.role ||
    u?.raw?.roles ||
    u?.user?.role ||
    u?.user?.roles ||
    "";
  return Array.isArray(r) ? r.join(",").toLowerCase() : String(r || "").toLowerCase();
};
const isExecutiveUser = (u: any): boolean => {
  const rs = getRoleString(u);
  // treat pure executives as “executive” or “pre-sales executive”, but not admins/managers
  return !!rs && /executive/.test(rs) && !/admin|manager|super/.test(rs);
};

const normalizeSalutation = (s: string): string =>
  (s || "").trim().replace(/\.{2,}/g, ".");

// return display + canonical key for dup checks
const toCanonicalPhone = (raw: any): { display: string; key: string } => {
  if (raw === null || raw === undefined || String(raw).trim() === "") {
    return { display: "", key: "" };
  }
  let phoneStr = String(raw).trim();

  // handle 9.12345E9 etc.
  if (/e\+\d+$/i.test(phoneStr)) {
    const n = Number(phoneStr);
    if (!isNaN(n)) phoneStr = Math.round(n).toString();
  }

  // strip everything except digits and +
  phoneStr = phoneStr.replace(/[^\d+]/g, "");
  // remove leading zeros
  phoneStr = phoneStr.replace(/^0+/, "");

  const justDigits = phoneStr.replace(/[^\d]/g, "");
  // India-friendly
  if (/^\+?91\d{10}$/.test(phoneStr) || /^91\d{10}$/.test(phoneStr) || /^\d{10}$/.test(justDigits)) {
    const last10 = justDigits.slice(-10);
    return { display: `+91${last10}`, key: last10 };
  }
  // fallback
  return { display: phoneStr.startsWith("+") ? phoneStr : `+${phoneStr}`, key: justDigits };
};
const parsePhoneNumber = (val: any) => toCanonicalPhone(val).display;

/* ========================== Summary Modal ========================== */

function SummaryModal({
  isOpen,
  onClose,
  title = "Import Summary",
  duplicates,
  skippedRows,
  updatedRows,
}: SummaryModalProps) {
  if (!isOpen) return null;

  const keySet = new Set<string>();
  [...duplicates.map(r => r.data), ...skippedRows.map(r => r.data), ...updatedRows.map(r => r.data)].forEach((row) => {
    Object.entries(row || {}).forEach(([k, v]) => {
      if (v !== null && v !== undefined && String(v).trim() !== "") keySet.add(k);
    });
  });
  const allKeys = Array.from(keySet);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} width="max-w-6xl">
      <div className="p-4 space-y-6">
        <div className="text-sm text-gray-700 flex flex-wrap gap-4">
          <span>Duplicates: <span className="font-semibold">{duplicates.length}</span></span>
          <span>Skipped: <span className="font-semibold">{skippedRows.length}</span></span>
          {updatedRows.length > 0 && <span>Updated: <span className="font-semibold">{updatedRows.length}</span></span>}
        </div>

        {duplicates.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-purple-700 mb-2">Duplicates (in file or CRM)</h4>
            <div className="max-h-[260px] overflow-auto border rounded-lg">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-purple-50 sticky top-0 z-10">
                  <tr>
                    <th className="border px-2 py-1">Row</th>
                    <th className="border px-2 py-1">Duplicate Fields</th>
                    <th className="border px-2 py-1">Existing ID</th>
                    <th className="border px-2 py-1">Reason</th>
                    {allKeys.map((key) => (
                      <th key={key} className="border px-2 py-1 text-left">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {duplicates.map((row, idx) => (
                    <tr key={idx} className="hover:bg-purple-50/30">
                      <td className="border px-2 py-1 text-center">{row.row ?? "-"}</td>
                      <td className="border px-2 py-1">
                        {row.duplicateFields && row.duplicateFields.length > 0 ? row.duplicateFields.join(", ") : "-"}
                      </td>
                      <td className="border px-2 py-1 text-center">{row.existingId ?? "-"}</td>
                      <td className="border px-2 py-1 text-purple-700">{row.reason}</td>
                      {allKeys.map((key) => (
                        <td key={key} className="border px-2 py-1">
                          {row.data?.[key] && String(row.data[key]).trim() !== "" ? row.data[key] : ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {skippedRows.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-red-700 mb-2">Skipped (non-duplicate issues)</h4>
            <div className="max-h-[240px] overflow-auto border rounded-lg">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-red-50 sticky top-0 z-10">
                  <tr>
                    <th className="border px-2 py-1">Row</th>
                    <th className="border px-2 py-1">Reason</th>
                    {allKeys.map((key) => (
                      <th key={key} className="border px-2 py-1 text-left">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {skippedRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-red-50/30">
                      <td className="border px-2 py-1 text-center">{row.row}</td>
                      <td className="border px-2 py-1 text-red-600">{row.reason}</td>
                      {allKeys.map((key) => (
                        <td key={key} className="border px-2 py-1">
                          {row.data[key] && String(row.data[key]).trim() !== "" ? row.data[key] : ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {updatedRows.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-green-700 mb-2">Updated (existing in CRM)</h4>
            <div className="max-h-[240px] overflow-auto border rounded-lg">
              <table className="w-full text-xs border-collapse">
                <thead className="bg-green-50 sticky top-0 z-10">
                  <tr>
                    <th className="border px-2 py-1">Row</th>
                    <th className="border px-2 py-1">ID</th>
                    <th className="border px-2 py-1">Note</th>
                    {allKeys.map((key) => (
                      <th key={key} className="border px-2 py-1 text-left">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {updatedRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-green-50/30">
                      <td className="border px-2 py-1 text-center">{row.row ?? "-"}</td>
                      <td className="border px-2 py-1 text-center">{row.id ?? "-"}</td>
                      <td className="border px-2 py-1 text-green-700">{row.note || "Updated"}</td>
                      {allKeys.map((key) => (
                        <td key={key} className="border px-2 py-1">
                          {row.data?.[key] && String(row.data[key]).trim() !== "" ? row.data[key] : ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}

/* ====================== Template Download (xlsx) ====================== */

const downloadLeadTemplate = () => {
  const data = [
    ["Salutation*", "Name*", "Phone*", "Email", "Lead_type", "Lead_source", "Whatsapp_number", "State", "City", "Location", "Status", "Stage", "Priority"],
    ["Mr", "Rahul Sharma", "9876543210", "rahul.sharma@gmail.com", "Walk-In Lead", "Website", "9876543210", "Maharashtra", "Mumbai", "Bandra", "New", "New", "Medium"],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  const mandatoryCols = [0, 1, 2];
  mandatoryCols.forEach((c: number) => {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    if (!ws[addr]) return;
    (ws as any)[addr].s = { font: { color: { rgb: "FF0000" }, bold: true }, alignment: { horizontal: "center", vertical: "center" } };
  });
  for (let c = 3; c < data[0].length; c++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c });
    if (ws[addr]) (ws as any)[addr].s = { font: { bold: true }, alignment: { horizontal: "center", vertical: "center" } };
  }
  for (let r = 1; r < data.length; r++) {
    for (let c = 0; c < data[r].length; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      if (ws[addr]) (ws as any)[addr].s = { alignment: { horizontal: "left", vertical: "center" } };
    }
  }
  (ws as any)["!cols"] = [12, 16, 15, 24, 16, 16, 16, 16, 12, 16, 12, 12, 12].map((width) => ({ width }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Leads Template");
  XLSX.writeFile(wb, "Leads_Import_Template.xlsx");
};

/* ============================== Component ============================== */

export default function ImportLeadsModal({ isOpen, onClose }: ImportLeadsModalProps) {
  const { user } = useAuth() as any;

  const [file, setFile] = useState<File | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string>("");

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const [skippedRows, setSkippedRows] = useState<SkippedRow[]>([]);
  const [updatedRows, setUpdatedRows] = useState<UpdatedRow[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateRow[]>([]);
  const [showSummary, setShowSummary] = useState<boolean>(false);

  const [execsLoading, setExecsLoading] = useState<boolean>(false);
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [execDropdownOpen, setExecDropdownOpen] = useState<boolean>(false);
  const [execSearch, setExecSearch] = useState<string>("");
  const [selectedExecIds, setSelectedExecIds] = useState<Set<string | number>>(new Set());
  const [assignmentMode, setAssignmentMode] = useState<AssignmentMode>("none");

  const onlyThisExecutive = isExecutiveUser(user); // lock UI if true

  // Close dropdown on outside click
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setExecDropdownOpen(false);
    }
    if (execDropdownOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [execDropdownOpen]);

  // Load executives (or lock to current exec)
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        setExecsLoading(true);

        // Helper to format name with salutation
        const formatName = (u: any) => {
          const salutation = u?.salutation ? `${u.salutation} ` : "";
          const firstName = u?.first_name || "";
          const lastName = u?.last_name || "";
          const usernameFallback = u?.username || u?.email || "Executive";
          const name = `${salutation}${firstName} ${lastName}`.trim();
          return name || usernameFallback;
        };

        // If logged in as an executive, only show self (and preselect)
        if (onlyThisExecutive) {
          const selfId =
            user?.id || user?.userId || user?._id || user?.uuid || user?.raw?.id || String(user?.email || user?.username || "me");
          const selfName = formatName(user);

          const me: Executive = { id: selfId, name: selfName, email: user?.email, username: user?.username };
          setExecutives([me]);
          setSelectedExecIds(new Set([selfId]));
          setAssignmentMode("selected");
          return;
        }

        // Managers/Admins — fetch allowed executives
        const get = async (department: string) =>
          usersAPI.getByDeptRole?.({ department, role: "executive", is_active: 1, limit: 100 });

        let res: any;
        try { res = await get("presales"); }
        catch { res = await get("pre-sales"); }

        const salesUsers = (res?.items ?? res?.data ?? res ?? []).map((u: any) => ({
          ...u,
          id: u.id ?? u.userId ?? u._id ?? u.uuid ?? String(u.email || u.username || Math.random()),
          name: formatName(u),
        }));

        const allowed = getAssignableExecutives(user, salesUsers) || [];
        const mapped: Executive[] = allowed.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          username: u.raw?.username || u.username,
        }));

        setExecutives(mapped);
      } catch (e) {
        console.error(e);
        toast.error("Could not fetch executives");
      } finally {
        setExecsLoading(false);
      }
    })();
  }, [isOpen, user, onlyThisExecutive]);

  const filteredExecutives = useMemo(() => {
    if (!execSearch.trim()) return executives;
    const s = execSearch.toLowerCase();
    return executives.filter(
      (e) =>
        String(e.name || "").toLowerCase().includes(s) ||
        String(e.email || "").toLowerCase().includes(s) ||
        String(e.username || "").toLowerCase().includes(s)
    );
  }, [execSearch, executives]);

  const toggleExec = (id: string | number) => {
    setSelectedExecIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const selectAllExecs = () => setSelectedExecIds(new Set(executives.map((e) => e.id)));
  const clearExecs = () => setSelectedExecIds(new Set());

  const isDuplicateReason = (reason: string) => /duplicate/i.test(reason || "");
  const guessDuplicateFields = (reason: string, data: RawRow): string[] => {
    const fields: string[] = [];
    const lower = (reason || "").toLowerCase();
    if (lower.includes("phone")) fields.push("phone");
    if (lower.includes("email")) fields.push("email");
    if (fields.length === 0) {
      if (data["Phone*"] || data["phone"] || data["Phone"]) fields.push("phone");
      if (data["Email"] || data["email"]) fields.push("email");
    }
    return Array.from(new Set(fields));
  };

  /* ---------- Validation + intra-file duplicate detection ---------- */
  const filterValidLeads = (data: RawRow[]) => {
    const seenPhoneKeys = new Set<string>();
    const seenEmails = new Set<string>();

    const validData: any[] = [];
    const skipped: SkippedRow[] = [];
    const localDuplicates: DuplicateRow[] = [];

    data.forEach((row, index) => {
      const rowNum = index + 2; // header row = 1
      const rawSal = row["Salutation*"] ? String(row["Salutation*"]).trim() : "";
      const salutation = rawSal ? normalizeSalutation(rawSal) : "";
      const name = row["Name*"] ? String(row["Name*"]).trim() : "";

      const phoneParsed = toCanonicalPhone(row["Phone*"]);
      const phone = phoneParsed.display;
      const phoneKey = phoneParsed.key;

      const email = row["Email"] ? String(row["Email"]).trim() : "";

      if (!salutation || !name || !phoneKey) {
        const missing: string[] = [];
        if (!salutation) missing.push("Salutation");
        if (!name) missing.push("Name");
        if (!phoneKey) missing.push("Phone");
        skipped.push({
          row: rowNum,
          reason: `Missing mandatory fields: ${missing.join(", ")}`,
          data: { ...row, "Phone* (parsed)": phone, "Salutation (normalized)": salutation }
        });
        return;
      }

      // intra-file dup checks
      if (phoneKey && seenPhoneKeys.has(phoneKey)) {
        localDuplicates.push({
          row: rowNum,
          reason: `Duplicate in file (phone)`,
          data: { ...row, "Phone* (parsed)": phone, "Salutation (normalized)": salutation },
          duplicateFields: ["phone"],
        });
        return;
      }
      if (email && seenEmails.has(email.toLowerCase())) {
        localDuplicates.push({
          row: rowNum,
          reason: `Duplicate in file (email)`,
          data: { ...row, "Phone* (parsed)": phone, "Salutation (normalized)": salutation },
          duplicateFields: ["email"],
        });
        return;
      }

      // format checks
      const phoneDigits = phone.replace(/[^\d+]/g, "");
      const okPhone =
        /^\+91\d{10}$/.test(phoneDigits) || // India normalized
        /^\+\d{10,15}$/.test(phoneDigits);  // generic E.164-ish
      if (!okPhone) {
        skipped.push({ row: rowNum, reason: `Invalid phone format (${phone})`, data: { ...row, "Phone* (parsed)": phone, "Salutation (normalized)": salutation } });
        return;
      }

      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          skipped.push({ row: rowNum, reason: "Invalid email format", data: { ...row, "Phone* (parsed)": phone, "Salutation (normalized)": salutation } });
          return;
        }
      }

      const whatsappRaw = row["Whatsapp_number"];
      const whatsapp_number = whatsappRaw ? parsePhoneNumber(whatsappRaw) : "";

      validData.push({
        salutation,
        name,
        phone,
        email: email || "",
        lead_type: row["Lead_type"] || "",
        lead_source: row["Lead_source"] || "",
        whatsapp_number,
        state: row["State"] || "",
        city: row["City"] || "",
        location: row["Location"] || "",
        status: row["Status"] || "",
        stage: row["Stage"] || "",
        priority: row["Priority"] || "",
      });

      seenPhoneKeys.add(phoneKey);
      if (email) seenEmails.add(email.toLowerCase());
    });

    return { validData, nonDuplicateSkipped: skipped, localDuplicates };
  };

  const applyAssignmentPolicy = (rows: any[]): any[] => {
    // If logged in as executive, force assignment to self
    if (onlyThisExecutive) {
      const selfId =
        user?.id || user?.userId || user?._id || user?.uuid || user?.raw?.id || String(user?.email || user?.username || "me");
      return rows.map((r) => ({ ...r, assigned_executive: selfId }));
    }

    if (assignmentMode === "none") {
      return rows.map((r) => ({ ...r, assigned_executive: "" }));
    }
    const ids = Array.from(selectedExecIds);
    if (ids.length === 0) return rows.map((r) => ({ ...r, assigned_executive: "" }));
    const n = ids.length;
    return rows.map((r, i) => ({ ...r, assigned_executive: ids[i % n] }));
  };

  // Very tolerant import caller (supports multiple backend signatures)
  const callImportAPI = async (payloadRows: any[]) => {
    try {
      // 🔹 Most backends expect just array
      return await (leadsAPI as any).importLeads(payloadRows);
    } catch (err1) {
      try {
        // 🔹 Some expect wrapped object
        return await (leadsAPI as any).importLeads({ rows: payloadRows });
      } catch (err2) {
        try {
          // 🔹 Some expect { data: [...] }
          return await (leadsAPI as any).importLeads({ data: payloadRows });
        } catch (err3) {
          console.error("All importLeads formats failed:", err3);
          throw err3;
        }
      }
    }
  };

  /* ========================== Core Import Flow ========================== */

  const processAndSend = async (data: RawRow[], sourceLabel: string) => {
    // Clear previous summary BEFORE running (prevents "success + fail" mix)
    setDuplicates([]);
    setSkippedRows([]);
    setUpdatedRows([]);
    setShowSummary(false);

    const { validData, nonDuplicateSkipped, localDuplicates } = filterValidLeads(data);

    if (validData.length === 0) {
      setSkippedRows(nonDuplicateSkipped);
      setDuplicates(localDuplicates);
      setUpdatedRows([]);
      setShowSummary(true);
      if (localDuplicates.length === 0) toast.error(`No valid leads found in the ${sourceLabel}`);
      return;
    }

    const payload = applyAssignmentPolicy(validData);

    let res: any;
    try {
      res = await callImportAPI(payload);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || `Import failed from ${sourceLabel}`);
      return;
    }

    // Normalize success flag
    const ok =
      res?.success === true ||
      res?.ok === true ||
      (typeof res?.status === "number" && res.status >= 200 && res.status < 300) ||
      typeof res?.inserted !== "undefined" ||
      Array.isArray(res?.insertedRows);

    if (!ok) {
      toast.error(res?.message || `Import failed from ${sourceLabel}`);
      return;
    }

    const insertedRows: any[] =
      res?.insertedRows ?? res?.data?.insertedRows ?? res?.meta?.insertedRows ?? [];

    const insertedCount =
      res?.inserted ??
      res?.data?.inserted ??
      res?.meta?.inserted ??
      (Array.isArray(insertedRows) ? insertedRows.length : undefined) ??
      payload.length;

    const serverSkipped: any[] = res?.skippedRows ?? res?.data?.skippedRows ?? res?.meta?.skippedRows ?? [];
    const serverUpdated: UpdatedRow[] = res?.updatedRows ?? res?.data?.updatedRows ?? res?.meta?.updatedRows ?? [];

    // Classify serverSkipped into duplicates vs others
    const serverDuplicates: DuplicateRow[] = [];
    const serverNonDupSkipped: SkippedRow[] = [];

    if (Array.isArray(serverSkipped)) {
      for (const item of serverSkipped) {
        const reason = String(item?.reason || "");
        const dataRow: RawRow = item?.data || item || {};
        if (isDuplicateReason(reason)) {
          serverDuplicates.push({
            row: item?.row,
            reason: reason || "Duplicate in CRM",
            data: dataRow,
            duplicateFields: guessDuplicateFields(reason, dataRow),
            existingId: item?.id || item?.existingId,
          });
        } else {
          serverNonDupSkipped.push({
            row: item?.row ?? 0,
            reason: reason || "Skipped by server",
            data: dataRow,
          });
        }
      }
    }

    const allDuplicates = [...localDuplicates, ...serverDuplicates];
    const allSkipped = [...nonDuplicateSkipped, ...serverNonDupSkipped];

    setDuplicates(allDuplicates);
    setSkippedRows(allSkipped);
    setUpdatedRows(serverUpdated || []);

    // Show one clear result — avoid mixed toasts
    if ((insertedCount ?? 0) > 0 && allDuplicates.length === 0 && allSkipped.length === 0) {
      toast.success(`Imported ${insertedCount} lead(s) successfully.`);
      // Optionally refresh data
      if (typeof (leadsAPI as any).getLeads === "function") {
        try { await (leadsAPI as any).getLeads(); } catch { }
      }
      resetAndClose();
    } else {
      const parts: string[] = [];
      if ((insertedCount ?? 0) > 0) parts.push(`${insertedCount} imported`);
      if (allDuplicates.length > 0) parts.push(`${allDuplicates.length} duplicate`);
      if (allSkipped.length > 0) parts.push(`${allSkipped.length} skipped`);
      toast.info(`Import summary: ${parts.join(" • ")}`);
      setShowSummary(true);
    }
  };

  /* ============================== Handlers ============================== */

  const handleFileImport = async () => {
    if (!file) return toast.error("Please select an Excel/CSV file");
    if (!onlyThisExecutive && assignmentMode === "selected" && selectedExecIds.size === 0) {
      return toast.error("Please select at least one executive or choose None.");
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (evt: ProgressEvent<FileReader>) => {
        try {
          const result = evt.target?.result;
          if (!result) {
            toast.error("Failed to read file");
            return;
          }

          let wb: any;
          const lower = file.name.toLowerCase();
          if (lower.endsWith(".csv")) {
            const csvText = typeof result === "string" ? result : String(result);
            wb = XLSX.read(csvText, { type: "string", raw: true });
          } else {
            // modern + safest for xlsx/xls
            const buf = result as ArrayBuffer;
            wb = XLSX.read(buf, { type: "array", raw: true });
          }

          const ws = wb.Sheets[wb.SheetNames[0]];
          if (!ws) {
            toast.error("No sheet found in file");
            return;
          }

          const data: RawRow[] = XLSX.utils.sheet_to_json(ws, { raw: true, defval: "" });
          if (!data || data.length === 0) {
            toast.error("File appears to be empty");
            return;
          }

          await processAndSend(data, "file");
        } catch (e) {
          console.error(e);
          toast.error("Error processing file. Please check the format.");
        } finally {
          setIsUploading(false);
        }
      };

      const lower = file.name.toLowerCase();
      if (lower.endsWith(".csv")) reader.readAsText(file);
      else reader.readAsArrayBuffer(file);
    } catch (e) {
      console.error(e);
      toast.error("Error reading file");
      setIsUploading(false);
    }
  };

  const handleGoogleSheetImport = async () => {
    if (!sheetUrl.trim()) return toast.error("Please enter a Google Sheet URL");
    if (!onlyThisExecutive && assignmentMode === "selected" && selectedExecIds.size === 0) {
      return toast.error("Please select at least one executive or choose None.");
    }

    setIsUploading(true);
    try {
      const sheetIdMatch = sheetUrl.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!sheetIdMatch) {
        toast.error("Invalid Google Sheet URL");
        setIsUploading(false);
        return;
      }
      const sheetId = sheetIdMatch[1];
      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

      const response = await fetch(exportUrl);
      if (!response.ok) {
        toast.error(
          response.status === 403
            ? "Sheet is not publicly accessible. Make it 'Anyone with link can view'."
            : "Failed to access Google Sheet."
        );
        setIsUploading(false);
        return;
      }

      const csvText = await response.text();
      if (!csvText.trim()) {
        toast.error("Google Sheet appears to be empty");
        setIsUploading(false);
        return;
      }

      const wb = XLSX.read(csvText, { type: "string", raw: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      if (!ws) {
        toast.error("No sheet found in Google Sheet");
        setIsUploading(false);
        return;
      }

      const data: RawRow[] = XLSX.utils.sheet_to_json(ws, { raw: true, defval: "" });
      if (!data || data.length === 0) {
        toast.error("No data found in Google Sheet");
        setIsUploading(false);
        return;
      }

      await processAndSend(data, "Google Sheet");
    } catch (e) {
      console.error(e);
      toast.error("Error processing Google Sheet");
    } finally {
      setIsUploading(false);
    }
  };

  const resetAndClose = () => {
    setFile(null);
    setSheetUrl("");
    setSkippedRows([]);
    setUpdatedRows([]);
    setDuplicates([]);
    setShowSummary(false);
    setIsUploading(false);
    setDragActive(false);
    onClose();
  };

  const handleClose = () => {
    // full reset to avoid stale state
    resetAndClose();
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["csv", "xlsx", "xls"].includes(ext)) {
      toast.error("Please upload only Excel (.xlsx, .xls) or CSV files");
      return;
    }
    setFile(f);
  };

  /* =============================== UI =============================== */

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="" width="max-w-5xl">
        <div className="space-y-4 p-2">
          {/* Header */}
          <div className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Import Leads</h2>
                  <p className="text-sm text-gray-600">Import leads from Excel files or Google Sheets</p>
                </div>
              </div>
              <X 
               onClick={handleClose}
              className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Import Methods */}
            <div className="grid md:grid-cols-2 gap-3 items-stretch">
              {/* File Upload */}
              <div className="flex flex-col h-full p-3 space-y-2 border rounded-md bg-white shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Upload File</h3>
                </div>

                <div
                  className={`relative border-2 border-dashed rounded-md p-4 text-center flex-1 min-h-0 transition-all duration-200 ${dragActive
                    ? "border-blue-400 bg-blue-50"
                    : file
                      ? "border-green-400 bg-green-50"
                      : "border-gray-300 hover:border-gray-400 bg-gray-50"
                    }`}
                  onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
                  onDrop={(e) => {
                    e.preventDefault(); e.stopPropagation(); setDragActive(false);
                    const dtFiles = e.dataTransfer?.files;
                    if (dtFiles && dtFiles.length > 0) {
                      const droppedFile = dtFiles[0];
                      const ext = droppedFile.name.split(".").pop()?.toLowerCase() ?? "";
                      if (["csv", "xlsx", "xls"].includes(ext)) setFile(droppedFile);
                      else toast.error("Please upload only Excel (.xlsx, .xls) or CSV files");
                    }
                  }}
                >
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={onFileInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  {file ? (
                    <div className="space-y-1">
                      <div className="w-8 h-8 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-xs font-medium text-green-700 truncate">{file.name}</p>
                      <p className="text-[10px] text-green-600">Click to change file</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="w-8 h-8 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-xs font-medium text-gray-900">Drop file or click</p>
                      <p className="text-[10px] text-gray-500">Excel (.xlsx, .xls) or CSV</p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleFileImport}
                  disabled={!file || isUploading}
                  className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 text-xs rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <span className="inline-flex items-center justify-center gap-1">
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    "Import from File"
                  )}
                </Button>
              </div>

              {/* Google Sheet */}
              <div className="flex flex-col h-full p-3 space-y-2 border rounded-md bg-white shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Google Sheets</h3>
                </div>

                <div className="space-y-2 flex-1 min-h-0">
                  <input
                    type="text"
                    placeholder="https://docs.google.com/spreadsheets/..."
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />

                  <div className="bg-blue-50 border border-blue-200 rounded-md p-2.5">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-[11px] leading-5 text-blue-700">
                        <p className="font-medium mb-0.5">Make sure your Google Sheet is:</p>
                        <ul className="space-y-0.5">
                          <li>• Anyone with link can view</li>
                          <li>• Headers same as template</li>
                          <li>• Phone numbers are text</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleGoogleSheetImport}
                  disabled={!sheetUrl.trim() || isUploading}
                  className="mt-auto w-full bg-green-600 hover:bg-green-700 text-white font-medium py-1.5 text-xs rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <span className="inline-flex items-center justify-center gap-1">
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Importing...
                    </span>
                  ) : (
                    "Import from Google Sheet"
                  )}
                </Button>
              </div>
            </div>

            {/* Assignment */}
            <div className="p-3 border rounded-md bg-white shadow-sm">
              <div className="grid md:grid-cols-3 gap-3">
                <div className="md:col-span-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Lead Assignment</h3>

                  {/* If executive, lock to selected/self */}
                  <label className={`flex items-center gap-2 text-sm mb-1.5 ${onlyThisExecutive ? "opacity-50 cursor-not-allowed" : ""}`}>
                    <input
                      type="radio"
                      className="accent-blue-600"
                      checked={assignmentMode === "none"}
                      onChange={() => !onlyThisExecutive && setAssignmentMode("none")}
                      disabled={onlyThisExecutive}
                    />
                    <span>None</span>
                  </label>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      className="accent-blue-600"
                      checked={assignmentMode === "selected" || onlyThisExecutive}
                      onChange={() => setAssignmentMode("selected")}
                      disabled={onlyThisExecutive ? true : false}
                    />
                    <span>{onlyThisExecutive ? "Assigned to you" : "Selected executives (round-robin)"}</span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setExecDropdownOpen((s) => !s)}
                      className={`w-full flex items-center justify-between rounded-md border px-3 py-1.5 text-sm ${(assignmentMode === "selected" || onlyThisExecutive) ? "bg-white border-gray-300" : "bg-gray-100 border-gray-200 cursor-not-allowed"
                        }`}
                      disabled={!(assignmentMode === "selected" || onlyThisExecutive)}
                    >
                      <span className="truncate">
                        {onlyThisExecutive
                          ? (executives[0]?.name || "You")
                          : selectedExecIds.size > 0
                            ? `${selectedExecIds.size} executive(s) selected`
                            : "Select executives (checkbox)"}
                      </span>
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {(execDropdownOpen && (assignmentMode === "selected" || onlyThisExecutive)) && !onlyThisExecutive && (
                      <div className="absolute z-20 mt-1 w-full rounded-md border bg-white shadow-lg">
                        <div className="p-2 border-b">
                          <input
                            type="text"
                            value={execSearch}
                            onChange={(e) => setExecSearch(e.target.value)}
                            placeholder="Search executive..."
                            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div className="max-h-56 overflow-auto">
                          {execsLoading ? (
                            <div className="p-3 text-sm text-gray-500">Loading...</div>
                          ) : filteredExecutives.length === 0 ? (
                            <div className="p-3 text-sm text-gray-500">No executives found</div>
                          ) : (
                            filteredExecutives.map((e) => (
                              <label key={e.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="accent-blue-600"
                                  checked={selectedExecIds.has(e.id)}
                                  onChange={() => toggleExec(e.id)}
                                />
                                <span className="truncate">
                                  {e.name}
                                  {e.email ? <span className="text-gray-500"> — {e.email}</span> : null}
                                </span>
                              </label>
                            ))
                          )}
                        </div>

                        <div className="flex items-center justify-between p-2 border-t bg-gray-50">
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={selectAllExecs} className="px-3 py-1 text-xs">Select All</Button>
                            <Button variant="outline" onClick={clearExecs} className="px-3 py-1 text-xs">Clear</Button>
                          </div>
                          <Button variant="outline" onClick={() => setExecDropdownOpen(false)} className="px-3 py-1 text-xs">Done</Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {!onlyThisExecutive && (
                    <p className="mt-1.5 text-[10px] text-gray-600">
                      Tip: If you select 3 executives and import 50 leads, they'll be assigned ~16/17 each (round-robin).
                    </p>
                  )}
                  {onlyThisExecutive && (
                    <p className="mt-1.5 text-[10px] text-gray-600">
                      You are logged in as an Executive — imports will be assigned to you automatically.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-amber-800 mb-1">Required Fields & Validation Rules</h4>
                <div className="text-xs text-amber-700 space-y-1">
                  <p className="font-medium">Mandatory fields (marked with *):</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-medium">Salutation*</span>
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-medium">Name*</span>
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-medium">Phone*</span>
                  </div>
                  <p className="text-[11px] mt-2 text-amber-600">
                    • Email is optional but recommended
                    <br />
                    • Intra-file duplicate phone/emails will be skipped (handles +91 / 91 / leading zero / scientific notation)
                    <br />
                    • CRM duplicates are <b>never updated</b>; they're shown as "Duplicate in CRM"
                    <br />
                    • Scientific notation in phone numbers will be converted automatically
                    <br />
                    • Salutation cleaning: multiple dots collapse to a single dot (e.g., Dr.. → Dr.)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button
              onClick={downloadLeadTemplate}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Template
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 sm:flex-none border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-8 rounded-lg transition-colors"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <SummaryModal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        duplicates={duplicates}
        skippedRows={skippedRows}
        updatedRows={updatedRows}
      />
    </>
  );
}
