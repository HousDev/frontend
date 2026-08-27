// src/components/properties/ImportRentalPropertiesModal.tsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  X, Upload, Download, AlertCircle, Home, Play, Pause, RotateCw,
  CheckCircle, FileSpreadsheet, Globe, ChevronDown,
  Search, Loader2, Building2, Users,
} from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
// @ts-ignore
import * as XLSXStyle from "xlsx-js-style";
import { toast } from "react-toastify";
import { rentalPropertiesAPI } from "@/lib/rentalPropertiesAPI";
import { usersAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { googleSheetsAPI } from "@/lib/googleSheetsAPI";

const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const normalizeHeader = (h: string) =>
  String(h || "").trim().toLowerCase().replace(/[._\-()/]/g, " ").replace(/\s+/g, " ").trim();

const num = (v: any): number | "" => {
  const s = String(v ?? "").trim();
  if (!s) return "";
  const n = Number(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : "";
};
const int = (v: any): number | "" => {
  const s = String(v ?? "").trim();
  if (!s) return "";
  const n = parseInt(s.replace(/,/g, ""), 10);
  return Number.isFinite(n) ? n : "";
};

function parseJSONorCSV(value: any): any[] {
  const raw = String(value ?? "").trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === "string" && parsed) return [parsed];
  } catch {
    return raw.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

const formatDateDDMMYYYY = (val: any): string => {
  if (val === undefined || val === null || String(val).trim() === "") return "";
  
  // Excel Serial Number (e.g. 45536)
  if (typeof val === "number" && Number.isFinite(val) && val > 30000) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const ms = val * 86400000;
    const d = new Date(excelEpoch.getTime() + ms);
    if (!isNaN(d.getTime())) {
      const dd = String(d.getUTCDate()).padStart(2, "0");
      const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
      const yyyy = d.getUTCFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }
  }

  const s = String(val).trim();
  if (!s) return "";

  // Already DD/MM/YYYY format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;

  // DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(s)) return s.replace(/-/g, "/");

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const parts = s.split("T")[0].split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  return s;
};

type CleanRow = {
  seller?: string;
  propertyType?: string;
  propertySubtype?: string;
  unitType?: string;
  wing?: string;
  unitNo?: string;
  furnishing?: string;
  bedrooms?: number | "";
  bathrooms?: number | "";
  facing?: string;
  balcony?: string;
  parkingType?: string;
  parkingQty?: number | "";
  city?: string;
  location?: string;
  societyName?: string;
  floor?: string;
  totalFloors?: string;
  carpetArea?: number | "";
  builtupArea?: number | "";
  address?: string;
  status?: string;
  leadSource?: string;
  amenities?: any[];
  furnishingItems?: any[];
  description?: string;
  assignedTo?: string;
  listingType?: string;
  monthlyRent?: number | "";
  securityDeposit?: number | "";
  maintenanceExtra?: string;
  maintenanceCharge?: number | "";
  preferredTenants?: string;
  lockInPeriod?: number | "";
  agreementDuration?: number | "";
  availableFrom?: string;
};

type ImportPreview = CleanRow & { __row: number; __errors: string[] };
type Executive = { id: string | number; name: string; email?: string; username?: string };
type AssignmentMode = "none" | "roundrobin";

const HEADER_MAP: Record<string, keyof CleanRow> = {
  "property type": "propertyType",
  "property subtype": "propertySubtype",
  "unit type": "unitType",
  "wing": "wing",
  "unit no": "unitNo",
  "furnishing": "furnishing",
  "bedrooms": "bedrooms",
  "bathrooms": "bathrooms",
  "facing": "facing",
  "balcony": "balcony",
  "parking type": "parkingType",
  "parking qty": "parkingQty",
  "city": "city",
  "location": "location",
  "society name": "societyName",
  "floor": "floor",
  "total floors": "totalFloors",
  "carpet area": "carpetArea",
  "carpet area sq ft": "carpetArea",
  "carpet area sqft": "carpetArea",
  "builtup area": "builtupArea",
  "address": "address",
  "status": "status",
  "lead source": "leadSource",
  "amenities": "amenities",
  "furnishing items": "furnishingItems",
  "description": "description",
  "owner name": "seller",
  "owner": "seller",
  "owner_name": "seller",
  "landlord name": "seller",
  "landlord": "seller",
  "seller name": "seller",
  "seller": "seller",
  "assigned to": "assignedTo",
  "executive": "assignedTo",
  "agent": "assignedTo",
  "listing type": "listingType",
  "monthly rent": "monthlyRent",
  "security deposit": "securityDeposit",
  "maintenance extra": "maintenanceExtra",
  "maintenance charge": "maintenanceCharge",
  "preferred tenants": "preferredTenants",
  "lock in period": "lockInPeriod",
  "lock in period months": "lockInPeriod",
  "agreement duration": "agreementDuration",
  "agreement duration months": "agreementDuration",
  "available from": "availableFrom",
  "property_type_name": "propertyType",
  "property_subtype_name": "propertySubtype",
  "unit_type": "unitType",
  "unit_no": "unitNo",
  "furnishing_items": "furnishingItems",
  "city_name": "city",
  "location_name": "location",
  "society_name": "societyName",
  "parking_type": "parkingType",
  "parking_qty": "parkingQty",
  "carpet_area": "carpetArea",
  "builtup_area": "builtupArea",
  "lead_source": "leadSource",
  "listing_type": "listingType",
  "monthly_rent": "monthlyRent",
  "security_deposit": "securityDeposit",
  "maintenance_extra": "maintenanceExtra",
  "maintenance_charge": "maintenanceCharge",
  "preferred_tenants": "preferredTenants",
  "lock_in_period": "lockInPeriod",
  "agreement_duration": "agreementDuration",
  "available_from": "availableFrom",
};

function resolveHeaderKey(rawHeader: string): keyof CleanRow | undefined {
  return HEADER_MAP[normalizeHeader(rawHeader)];
}

const getRoleString = (u: any): string => {
  const r = u?.role || u?.roles || u?.raw?.role || u?.raw?.roles || u?.user?.role || u?.user?.roles || "";
  return Array.isArray(r) ? r.join(",").toLowerCase() : String(r || "").toLowerCase();
};
const isExecutiveUser = (u: any): boolean => {
  const rs = getRoleString(u);
  return !!rs && /executive/.test(rs) && !/admin|manager|super/.test(rs);
};

const ImportRentalPropertiesModal = ({
  isOpen, onClose, onDone, onImport,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDone?: (summary: { ok: number; fail: number }) => void;
  onImport?: (rows: any[]) => void;
}) => {
  const { user } = useAuth() as any;
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [sheetUrl, setSheetUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [rows, setRows] = useState<ImportPreview[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [failedRows, setFailedRows] = useState<{ row: number; reason: string; data: CleanRow }[]>([]);
  const [importing, setImporting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState({ total: 0, done: 0, ok: 0, fail: 0 });
  const abortRef = useRef<{ abort: boolean }>({ abort: false });
  const [execsLoading, setExecsLoading] = useState(false);
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [execDropdownOpen, setExecDropdownOpen] = useState(false);
  const [execSearch, setExecSearch] = useState("");
  const [selectedExecIds, setSelectedExecIds] = useState<Set<string | number>>(new Set());
  const [assignmentMode, setAssignmentMode] = useState<AssignmentMode>("none");
  const onlyThisExecutive = isExecutiveUser(user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setExecDropdownOpen(false);
    }
    if (execDropdownOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [execDropdownOpen]);

  const getCreatorId = () => user?.id || user?.userId || user?._id || user?.raw?.id;

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        setExecsLoading(true);
        const fmt = (u: any) => {
          const sal = u?.salutation ? `${u.salutation} ` : "";
          const name = `${sal}${u?.first_name || ""} ${u?.last_name || ""}`.trim();
          return name || u?.username || u?.email || "Executive";
        };
        if (onlyThisExecutive) {
          const sid = user?.id || user?.userId || user?._id || user?.raw?.id || String(user?.email || "me");
          setExecutives([{ id: sid, name: fmt(user), email: user?.email }]);
          setSelectedExecIds(new Set([sid]));
          setAssignmentMode("roundrobin");
          return;
        }
        const res = await usersAPI.getByDeptRole({ department: "Sales", role: "Sales Executive", is_active: 1, limit: 100 });
        const list = Array.isArray(res) ? res : res?.data || res?.items || [];
        setExecutives(list.map((u: any) => ({ id: u.id || u.userId, name: fmt(u), email: u.email })));
      } catch { toast.error("Could not fetch sales executives"); }
      finally { setExecsLoading(false); }
    })();
  }, [isOpen, user, onlyThisExecutive]);

  const filteredExecs = useMemo(() => {
    if (!execSearch.trim()) return executives;
    const s = execSearch.toLowerCase();
    return executives.filter(e => String(e.name || "").toLowerCase().includes(s) || String(e.email || "").toLowerCase().includes(s));
  }, [execSearch, executives]);

  const toggleExec = (id: string | number) => {
    setSelectedExecIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };
  const selectAllExecs = () => setSelectedExecIds(new Set(executives.map(e => e.id)));
  const clearExecs = () => setSelectedExecIds(new Set());

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type !== "dragleave");
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); };
  const handleFile = (f: File) => {
    const name = f.name.toLowerCase();
    if (!name.endsWith(".csv") && !name.endsWith(".xlsx") && !name.endsWith(".xls"))
      return toast.error("Please select a CSV or Excel file");
    setFile(f); processFile(f);
  };

  const parseCSV = (f: File): Promise<Record<string, any>[]> =>
    new Promise((resolve, reject) => Papa.parse(f, { header: true, skipEmptyLines: true, complete: r => resolve(r.data as any[]), error: reject }));

  const parseXLSX = async (f: File): Promise<Record<string, any>[]> => {
    const buf = await f.arrayBuffer();
    const wb = XLSX.read(buf);
    return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" }) as any[];
  };

  const parseGoogleSheet = async (url: string): Promise<Record<string, any>[]> => {
    toast.info("Fetching data from Google Sheet...");
    const data = await googleSheetsAPI.importSheet(url);
    if (!data.success || !data.rows) throw new Error(data.error || "No data found");
    return data.rows;
  };

  const canonicalize = (raw: Record<string, any>, idx: number): ImportPreview => {
    const mapped: Record<string, any> = {};
    for (const [k, v] of Object.entries(raw)) { const nk = resolveHeaderKey(k); if (nk) mapped[nk] = v; }
    const clean: CleanRow = {
      seller: (mapped.seller ?? "").toString().trim(),
      propertyType: (mapped.propertyType ?? "").toString().trim(),
      propertySubtype: (mapped.propertySubtype ?? "").toString().trim(),
      unitType: (mapped.unitType ?? "").toString().trim(),
      wing: (mapped.wing ?? "").toString().trim(),
      unitNo: (mapped.unitNo ?? "").toString().trim(),
      furnishing: (mapped.furnishing ?? "").toString().trim(),
      bedrooms: int(mapped.bedrooms), bathrooms: int(mapped.bathrooms),
      facing: (mapped.facing ?? "").toString().trim(),
      balcony: (mapped.balcony ?? "").toString().trim(),
      parkingType: (mapped.parkingType ?? "").toString().trim(),
      parkingQty: int(mapped.parkingQty),
      city: (mapped.city ?? "").toString().trim(),
      location: (mapped.location ?? "").toString().trim(),
      societyName: (mapped.societyName ?? "").toString().trim(),
      floor: (mapped.floor ?? "").toString().trim(),
      totalFloors: (mapped.totalFloors ?? "").toString().trim(),
      carpetArea: num(mapped.carpetArea), builtupArea: num(mapped.builtupArea),
      address: (mapped.address ?? "").toString().trim(),
      status: (mapped.status ?? "").toString().trim(),
      leadSource: (mapped.leadSource ?? "").toString().trim(),
      amenities: parseJSONorCSV(mapped.amenities),
      furnishingItems: parseJSONorCSV(mapped.furnishingItems),
      description: (mapped.description ?? "").toString().trim(),
      assignedTo: (mapped.assignedTo ?? "").toString().trim(),
      listingType: (mapped.listingType ?? "rent").toString().trim() || "rent",
      monthlyRent: num(mapped.monthlyRent),
      securityDeposit: num(mapped.securityDeposit),
      maintenanceExtra: (mapped.maintenanceExtra ?? "").toString().trim(),
      maintenanceCharge: num(mapped.maintenanceCharge),
      preferredTenants: (mapped.preferredTenants ?? "").toString().trim(),
      lockInPeriod: int(mapped.lockInPeriod),
      agreementDuration: int(mapped.agreementDuration),
      availableFrom: formatDateDDMMYYYY(mapped.availableFrom),
    };
    const __errors: string[] = [];
    const required: Array<[keyof CleanRow, string, (v: any) => boolean]> = [
      ["propertyType", "Property Type is required", v => !!String(v || "").trim()],
      ["propertySubtype", "Property Subtype is required", v => !!String(v || "").trim()],
      ["unitType", "Unit Type is required", v => !!String(v || "").trim()],
      ["carpetArea", "Carpet Area is required", v => v !== "" && Number.isFinite(Number(v)) && Number(v) >= 0],
      ["societyName", "Society Name is required", v => !!String(v || "").trim()],
      ["monthlyRent", "Monthly Rent is required", v => v !== "" && Number.isFinite(Number(v)) && Number(v) > 0],
    ];
    for (const [key, msg, ok] of required) { if (!ok((clean as any)[key])) __errors.push(msg); }
    return { ...clean, __row: idx + 1, __errors };
  };

  const processFile = async (f: File) => {
    setIsProcessing(true); setErrors([]); setRows([]);
    try {
      const isCSV = f.name.toLowerCase().endsWith(".csv");
      const rawRows = isCSV ? await parseCSV(f) : await parseXLSX(f);
      if (!rawRows.length) { setErrors(["No rows found."]); return; }
      setRows(rawRows.map((r, i) => canonicalize(r, i)));
    } catch (e: any) { setErrors([`Error: ${e?.message || e}`]); }
    finally { setIsProcessing(false); }
  };

  const processGoogleSheetFlow = async (url: string) => {
    setIsProcessing(true); setErrors([]); setRows([]);
    try {
      const rawRows = await parseGoogleSheet(url);
      if (!rawRows.length) { setErrors(["No rows found."]); return; }
      setRows(rawRows.map((r, i) => canonicalize(r, i)));
      toast.success(`Loaded ${rawRows.length} rows`);
    } catch (e: any) { setErrors([`Error: ${e?.message || e}`]); }
    finally { setIsProcessing(false); }
  };

  const isRowValid = (r: ImportPreview) => r.__errors.filter(e => /required/i.test(e)).length === 0;
  const validRows = useMemo(() => rows.filter(isRowValid), [rows]);
  const validCount = validRows.length;
  const invalidCount = rows.length - validCount;

  const getAssignedExec = (row: CleanRow, idx: number): string => {
    if (onlyThisExecutive) {
      const sid = user?.id || user?.userId || user?._id || user?.raw?.id || "me";
      return executives.find(e => e.id === sid)?.name || "";
    }
    if (assignmentMode === "none") return "";
    if (assignmentMode === "roundrobin" && selectedExecIds.size > 0) {
      const ids = Array.from(selectedExecIds);
      return executives.find(e => e.id === ids[idx % ids.length])?.name || "";
    }
    return row.assignedTo || "";
  };

  function buildPayload(r: CleanRow, idx: number): Record<string, any> {
    return {
      seller: r.seller || "",
      propertyType: r.propertyType || "",
      propertySubtype: r.propertySubtype || "",
      unitType: r.unitType || "",
      wing: r.wing || "",
      unitNo: r.unitNo || "",
      furnishing: r.furnishing || "",
      bedrooms: r.bedrooms,
      bathrooms: r.bathrooms,
      facing: r.facing || "",
      balcony: r.balcony || "",
      parkingType: r.parkingType || "",
      parkingQty: r.parkingQty,
      city: r.city || "",
      location: r.location || "",
      societyName: r.societyName || "",
      floor: r.floor || "",
      totalFloors: r.totalFloors || "",
      carpetArea: r.carpetArea,
      builtupArea: r.builtupArea,
      address: r.address || "",
      status: r.status || "Available",
      leadSource: r.leadSource || "",
      amenities: r.amenities || [],
      furnishingItems: r.furnishingItems || [],
      description: r.description || "",
      assignedTo: getAssignedExec(r, idx),
      listingType: r.listingType || "rent",
      monthlyRent: r.monthlyRent,
      securityDeposit: r.securityDeposit,
      maintenanceExtra: r.maintenanceExtra || "",
      maintenanceCharge: r.maintenanceCharge,
      preferredTenants: r.preferredTenants || "",
      lockInPeriod: r.lockInPeriod,
      agreementDuration: r.agreementDuration,
      availableFrom: r.availableFrom || "",
    };
  }

  const startImport = async () => {
    if (!validRows.length) return toast.error("No valid rows to import.");
    setImporting(true); setPaused(false); setFailedRows([]);
    setProgress({ total: validRows.length, done: 0, ok: 0, fail: 0 });
    abortRef.current.abort = false;
    let okCount = 0; let failCount = 0;

    for (let i = 0; i < validRows.length; i++) {
      if (abortRef.current.abort) break;
      while (paused && !abortRef.current.abort) await sleep(200);

      const r = validRows[i];
      try {
        const payload = buildPayload(r, i);
        if (onImport) {
          await onImport([payload]);
        } else {
          await rentalPropertiesAPI.create(payload);
        }
        okCount++;
      } catch (err: any) {
        failCount++;
        setFailedRows(prev => [...prev, { row: r.__row, reason: err?.response?.data?.message || err?.message || "Creation failed", data: r }]);
      }
      setProgress({ total: validRows.length, done: i + 1, ok: okCount, fail: failCount });
    }

    setImporting(false);
    toast.success(`Import complete: ${okCount} created, ${failCount} failed.`);
    onDone?.({ ok: okCount, fail: failCount });
  };

  const togglePause = () => setPaused(p => !p);
  const cancelImport = () => { abortRef.current.abort = true; setImporting(false); };

  const exportIssues = () => {
    const all = [
      ...rows.filter(r => !isRowValid(r)).map(r => ({ "Row": r.__row, "Status": "Invalid", "Errors": r.__errors.join(" | "), ...Object.fromEntries(Object.entries(r).filter(([k]) => !k.startsWith("__"))) })),
      ...failedRows.map(r => ({ "Row": r.row, "Status": "API Error", "Errors": r.reason, ...Object.fromEntries(Object.entries(r.data).filter(([k]) => !k.startsWith("__"))) })),
    ];
    if (!all.length) return toast.info("No issues to export.");
    const ws = XLSX.utils.json_to_sheet(all);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Import Issues");
    XLSX.writeFile(wb, `rental_import_issues_${Date.now()}.xlsx`);
    toast.success("Exported import issues.");
  };

  const TEMPLATE_HEADERS = [
    "Owner Name", "Property Type", "Property Subtype", "Unit Type",
    "Wing", "Unit No", "Furnishing", "Parking Type",
    "Bedrooms", "Bathrooms", "Facing", "Balcony",
    "Parking Qty", "Total Floors", "Floor", "Property Status",
    "Society Name", "Location", "City", "Address",
    "Carpet Area", "Builtup Area", "Lead Source",
    "Listing Type", "Monthly Rent", "Security Deposit",
    "Maintenance Extra", "Maintenance Charge",
    "Preferred Tenants", "Lock In Period (Months)", "Agreement Duration (Months)",
    "Available From (DD/MM/YYYY)",
    "Amenities", "Furnishing Items", "Description", "Assigned To",
  ];

  const downloadTemplate = () => {
    const s1 = ["Rahul Sharma","Residential","Flat","2BHK","A","1204","Semi-Furnished","Covered","2","2","East","1","1","22nd Floor","12th Floor","Available","Sea View Towers","Bandra West","Mumbai","Wing A, Unit 1204, Sea View Towers, Mumbai","980","1050","FB Post","rent","35000","200000","No","","Family","12","11","01/09/2024","Gym,Lift","Wardrobe","Well maintained 2BHK.","Rajesh Kumar"];
    const s2 = ["Priya Patel","Residential","Flat","3BHK","","","Fully-Furnished","Open","3","3","North","2","2","10th Floor","5th Floor","Available","Green Valley","Koregaon Park","Pune","Green Valley, Koregaon Park, Pune","1500","1700","Referral","rent","60000","360000","Yes","5000","Family,Bachelors","6","11","01/10/2024","Pool,Gym","Bed,Sofa,AC","Spacious 3BHK.","Priya Sharma"];
    try {
      const baseStyle = { font: { bold: true }, alignment: { horizontal: "center", vertical: "center", wrapText: true }, border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } } };
      const redCols = new Set(["property type","property subtype","unit type","carpet area","society name","monthly rent"]);
      const data = [TEMPLATE_HEADERS, s1, s2];
      const ws = XLSXStyle.utils.aoa_to_sheet(data);
      ws["!cols"] = TEMPLATE_HEADERS.map(h => ({ wch: Math.max(14, Math.min(30, h.length + 2)) }));
      for (let c = 0; c < TEMPLATE_HEADERS.length; c++) {
        const ref = XLSX.utils.encode_cell({ r: 0, c });
        if (!ws[ref]) continue;
        ws[ref].s = redCols.has(TEMPLATE_HEADERS[c].toLowerCase())
          ? { ...baseStyle, font: { ...baseStyle.font, color: { rgb: "FFFF0000" } } } as any
          : baseStyle as any;
      }
      const wb = XLSXStyle.utils.book_new();
      XLSXStyle.utils.book_append_sheet(wb, ws, "Rental Template");
      XLSXStyle.writeFile(wb, "rental_properties_template.xlsx");
    } catch {
      const csv = [TEMPLATE_HEADERS, s1, s2].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      a.download = "rental_properties_template.csv"; a.click();
    }
  };

  const fmtRent = (v?: number | "") => (v === "" || v === undefined || !Number(v)) ? "—" : `₹${Number(v).toLocaleString("en-IN")}/mo`;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4" style={{ background: "rgba(15,43,61,0.6)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between" style={{ background: N }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ background: `${O}20` }}><Home size={14} style={{ color: O }} /></div>
            <div>
              <h2 className="text-sm font-bold text-white">Import Rental Properties</h2>
              <p className="text-[9px] text-white/70">Import from Excel files or Google Sheets</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white"><X size={16} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4" style={{ scrollbarWidth: "thin" }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Left */}
            <div className="space-y-3">
              <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}><FileSpreadsheet size={12} style={{ color: O }} /> Upload File</h3>
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileInput} className="hidden" />
                <div role="button" tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={e => (e.key === "Enter" || e.key === " ") && fileInputRef.current?.click()}
                  onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${dragActive ? "border-orange-400 bg-orange-50" : file ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-gray-400 bg-white"}`}>
                  {file ? (
                    <div className="space-y-1"><CheckCircle size={16} className="mx-auto" style={{ color: O }} /><p className="text-[10px] font-medium truncate px-2" style={{ color: N }}>{file.name}</p><p className="text-[9px]" style={{ color: MU }}>Click to change</p></div>
                  ) : (
                    <div className="space-y-1"><Upload size={16} className="mx-auto" style={{ color: MU }} /><p className="text-[10px] font-medium" style={{ color: N }}>Drop file or click</p><p className="text-[9px]" style={{ color: MU }}>Excel (.xlsx, .xls) or CSV</p></div>
                  )}
                </div>
                <button onClick={() => file && processFile(file)} disabled={!file || isProcessing} className="mt-2 w-full rounded-lg py-1.5 text-[10px] font-medium text-white transition-all disabled:opacity-50" style={{ background: N }}>
                  {isProcessing ? <span className="inline-flex items-center justify-center gap-1"><Loader2 size={10} className="animate-spin" />Processing...</span> : "Import from File"}
                </button>
              </div>

              <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}><Globe size={12} style={{ color: O }} /> Google Sheets</h3>
                <input type="text" placeholder="https://docs.google.com/spreadsheets/..." value={sheetUrl} onChange={e => setSheetUrl(e.target.value)} className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white mb-2" style={{ borderColor: BD }} />
                <div className="rounded-lg p-2 mb-2" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
                  <div className="flex items-start gap-1.5"><AlertCircle size={10} className="shrink-0 mt-0.5" style={{ color: O }} /><p className="text-[9px]" style={{ color: MU }}>Make sheet public: "Anyone with link can view"</p></div>
                </div>
                <button onClick={() => sheetUrl.trim() && processGoogleSheetFlow(sheetUrl)} disabled={!sheetUrl.trim() || isProcessing} className="w-full rounded-lg py-1.5 text-[10px] font-medium text-white transition-all disabled:opacity-50" style={{ background: O }}>
                  {isProcessing ? <span className="inline-flex items-center justify-center gap-1"><Loader2 size={10} className="animate-spin" />Processing...</span> : "Import from Google Sheet"}
                </button>
              </div>

              <button onClick={downloadTemplate} className="w-full rounded-lg py-1.5 text-[10px] font-medium transition-all border flex items-center justify-center gap-1" style={{ borderColor: BD, color: N }}>
                <Download size={10} /> Download Rental Template
              </button>
            </div>

            {/* Right */}
            <div className="space-y-3">
              <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}><Users size={12} style={{ color: O }} /> Property Assignment</h3>
                <div className="space-y-2">
                  <label className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer ${assignmentMode === "none" && !onlyThisExecutive ? "border-orange-300 bg-orange-50" : "border-gray-200 bg-white"} ${onlyThisExecutive ? "opacity-60 cursor-not-allowed" : ""}`}>
                    <input type="radio" className="mt-0.5 w-3 h-3" style={{ accentColor: O }} checked={assignmentMode === "none"} onChange={() => !onlyThisExecutive && setAssignmentMode("none")} disabled={onlyThisExecutive} />
                    <div><p className="text-[10px] font-medium" style={{ color: N }}>No Assignment</p><p className="text-[8px]" style={{ color: MU }}>Not assigned to any executive</p></div>
                  </label>
                  <label className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer ${assignmentMode === "roundrobin" || onlyThisExecutive ? "border-orange-300 bg-orange-50" : "border-gray-200 bg-white"}`}>
                    <input type="radio" className="mt-0.5 w-3 h-3" style={{ accentColor: O }} checked={assignmentMode === "roundrobin" || onlyThisExecutive} onChange={() => setAssignmentMode("roundrobin")} disabled={onlyThisExecutive} />
                    <div><p className="text-[10px] font-medium" style={{ color: N }}>{onlyThisExecutive ? "Assigned to you" : "Assign to executives"}</p><p className="text-[8px]" style={{ color: MU }}>{onlyThisExecutive ? "Auto-assigned" : "Distributed round-robin"}</p></div>
                  </label>
                  {!onlyThisExecutive && assignmentMode === "roundrobin" && (
                    <div className="relative" ref={dropdownRef}>
                      <button type="button" onClick={() => setExecDropdownOpen(s => !s)} className="w-full flex items-center justify-between rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-[10px]">
                        <span style={{ color: selectedExecIds.size > 0 ? N : MU }}>{selectedExecIds.size > 0 ? `${selectedExecIds.size} executive(s) selected` : "Select executives"}</span>
                        <ChevronDown size={10} className={`transition-transform ${execDropdownOpen ? "rotate-180" : ""}`} />
                      </button>
                      {execDropdownOpen && (
                        <div className="absolute z-20 mt-1 w-full rounded-lg border bg-white shadow-lg overflow-hidden">
                          <div className="p-1.5 border-b"><div className="relative"><Search size={9} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: MU }} /><input type="text" value={execSearch} onChange={e => setExecSearch(e.target.value)} placeholder="Search..." className="w-full pl-6 pr-2 py-1 text-[9px] border rounded" style={{ borderColor: BD }} /></div></div>
                          <div className="max-h-40 overflow-auto">
                            {execsLoading ? <div className="p-2 text-center text-[9px]" style={{ color: MU }}>Loading...</div>
                              : filteredExecs.length === 0 ? <div className="p-2 text-center text-[9px]" style={{ color: MU }}>No executives</div>
                              : filteredExecs.map(e => (
                                <label key={e.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 cursor-pointer">
                                  <input type="checkbox" className="w-3 h-3 rounded" style={{ accentColor: O }} checked={selectedExecIds.has(e.id)} onChange={() => toggleExec(e.id)} />
                                  <span className="text-[9px]" style={{ color: N }}>{e.name}</span>
                                </label>
                              ))}
                          </div>
                          <div className="flex items-center justify-between p-1.5 border-t bg-gray-50">
                            <div className="flex gap-1"><button onClick={selectAllExecs} className="px-2 py-0.5 text-[8px] rounded" style={{ color: N }}>All</button><button onClick={clearExecs} className="px-2 py-0.5 text-[8px] rounded" style={{ color: N }}>Clear</button></div>
                            <button onClick={() => setExecDropdownOpen(false)} className="px-2 py-0.5 text-[8px] rounded text-white" style={{ background: O }}>Done</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg p-2.5" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
                <div className="flex items-start gap-1.5">
                  <AlertCircle size={10} className="shrink-0 mt-0.5" style={{ color: O }} />
                  <div>
                    <p className="text-[9px] font-medium mb-1" style={{ color: N }}>Required fields (red in template):</p>
                    <div className="flex flex-wrap gap-1">
                      {["Property Type*", "Property Subtype*", "Unit Type*", "Carpet Area*", "Society Name*", "Monthly Rent*"].map(f => (
                        <span key={f} className="px-1.5 py-0.5 rounded text-[8px] font-medium" style={{ background: `${O}20`, color: O }}>{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mt-3 rounded-lg p-2.5" style={{ background: "#fff5f5", border: "1px solid #fed7d7" }}>
              {errors.map((e, i) => <p key={i} className="text-[10px] text-red-600">{e}</p>)}
            </div>
          )}

          {/* Preview */}
          {rows.length > 0 && (
            <div className="mt-3 rounded-lg overflow-hidden" style={{ border: `1px solid ${BD}` }}>
              <div className="px-3 py-1.5 flex items-center justify-between" style={{ background: BG, borderBottom: `1px solid ${BD}` }}>
                <div className="flex items-center gap-1.5"><Building2 size={10} style={{ color: O }} /><span className="text-[9px] font-medium" style={{ color: N }}>Preview</span></div>
                <div className="flex gap-3 text-[8px] items-center">
                  <span style={{ color: MU }}>Total: <strong style={{ color: N }}>{rows.length}</strong></span>
                  <span style={{ color: "green" }}>Valid: <strong>{validCount}</strong></span>
                  <span style={{ color: "red" }}>Invalid: <strong>{invalidCount}</strong></span>
                  {invalidCount > 0 && <button onClick={exportIssues} className="px-2 py-0.5 rounded text-[8px] bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-1"><Download size={8} /> Export Invalid</button>}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 px-3 py-1.5 text-[9px] font-semibold" style={{ background: `${O}10`, borderBottom: `1px solid ${BD}`, color: N }}>
                <div>Type</div><div>Location</div><div>Area</div><div>Monthly Rent</div>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {rows.slice(0, 10).map(r => {
                  const valid = isRowValid(r);
                  const loc = [r.societyName, r.location, r.city].filter(Boolean).join(", ");
                  return (
                    <div key={r.__row} className={`grid grid-cols-4 gap-2 px-3 py-2 text-[9px] border-b last:border-b-0 ${valid ? "bg-white" : "bg-red-50"}`} style={{ borderColor: BD }}>
                      <div><span className="font-medium" style={{ color: N }}>{r.propertyType || "—"}</span>{r.propertySubtype && <span className="text-[8px]" style={{ color: MU }}> / {r.propertySubtype}</span>}</div>
                      <div className="truncate" style={{ color: MU }}>{loc || "—"}</div>
                      <div style={{ color: MU }}>{r.carpetArea !== "" ? `${r.carpetArea} sq.ft` : "—"}</div>
                      <div className="font-medium" style={{ color: O }}>{fmtRent(r.monthlyRent)}</div>
                    </div>
                  );
                })}
                {rows.length > 10 && <div className="px-3 py-2 text-center text-[8px]" style={{ background: BG, color: MU }}>+{rows.length - 10} more rows</div>}
              </div>
            </div>
          )}

          {/* Progress */}
          {importing && (
            <div className="mt-3 rounded-lg p-3" style={{ background: BG, border: `1px solid ${BD}` }}>
              <div className="flex justify-between text-[9px] mb-1"><span style={{ color: N }}>Importing...</span><span style={{ color: MU }}>{progress.done}/{progress.total}</span></div>
              <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="h-1.5 rounded-full transition-all" style={{ width: progress.total ? `${(progress.done / progress.total) * 100}%` : "0%", background: O }} /></div>
              <div className="flex justify-between text-[8px] mt-1"><span style={{ color: "green" }}>✅ {progress.ok}</span><span style={{ color: "red" }}>❌ {progress.fail}</span></div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-2.5 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" style={{ borderColor: BD, background: BG }}>
          <div className="flex items-center"><AlertCircle size={10} style={{ color: MU }} /><span className="text-[8px] ml-1" style={{ color: MU }}>Fields marked * are required</span></div>
          <div className="flex items-center gap-2">
            {(invalidCount > 0 || failedRows.length > 0) && (
              <button onClick={exportIssues} className="mr-2 px-3 py-1.5 text-[10px] font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 flex items-center gap-1">
                <Download size={10} /> Export Issues ({invalidCount + failedRows.length})
              </button>
            )}
            {!importing ? (
              <>
                <button onClick={onClose} className="px-3 py-1.5 text-[10px] font-medium rounded-lg hover:bg-gray-50" style={{ border: `1px solid ${BD}`, color: N }}>Cancel</button>
                <button onClick={startImport} disabled={rows.length === 0 || validCount === 0 || (!onlyThisExecutive && assignmentMode === "roundrobin" && selectedExecIds.size === 0)} className="px-3 py-1.5 text-[10px] font-medium text-white rounded-lg hover:opacity-80 disabled:opacity-50 flex items-center gap-1" style={{ background: O }}>
                  <Upload size={10} /> Import {validCount} Rental Properties
                </button>
              </>
            ) : (
              <>
                <button onClick={togglePause} className="px-3 py-1.5 text-[10px] font-medium rounded-lg hover:bg-gray-50 flex items-center gap-1" style={{ border: `1px solid ${BD}`, color: N }}>
                  {paused ? <Play size={10} /> : <Pause size={10} />}{paused ? "Resume" : "Pause"}
                </button>
                <button onClick={cancelImport} className="px-3 py-1.5 text-[10px] font-medium rounded-lg flex items-center gap-1" style={{ border: `1px solid ${BD}`, color: "red" }}>
                  <RotateCw size={10} /> Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportRentalPropertiesModal;
