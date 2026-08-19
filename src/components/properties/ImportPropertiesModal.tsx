




// src/components/properties/ImportPropertiesModal.tsx
import React, { useMemo, useRef, useState, useEffect, ChangeEvent } from "react";
import { X, Upload, Download, AlertCircle, Home, Play, Pause, RotateCw, CheckCircle, FileSpreadsheet, FileText, Users, UserRound, CircleDot, Globe, ChevronDown, Search, Loader2, Building2, MapPin, DollarSign, Ruler, Calendar } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
// @ts-ignore - types for xlsx-js-style are not bundled; safe to import
import * as XLSXStyle from "xlsx-js-style";
import { toast } from "react-toastify";
import { propertiesAPI } from "@/lib/propertiesAPI";
import Button from "@/components/ui/Button";
import { usersAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { getAssignableExecutives } from "@/utils/roleBasedOptions";
import { googleSheetsAPI } from "@/lib/googleSheetsAPI";
// ESALE Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

/* ================= Budget helpers ================= */
const RUPEE_PER_CRORE = 10_000_000;
const RUPEE_PER_LAKH = 100_000;

function parseBudgetToRupees(text?: string): number {
  const raw = (text || "").trim().toLowerCase();
  if (!raw) return 0;
  const cleaned = raw.replace(/₹/g, "").replace(/\s+/g, "");
  const digitsOnly = cleaned.replace(/,/g, "");
  if (/^\d+$/.test(digitsOnly)) return parseInt(digitsOnly, 10) || 0;
  const lakhMatch = cleaned.match(/^([\d,.]+)\s*l/);
  if (lakhMatch) return Math.round(parseFloat(lakhMatch[1].replace(/,/g, "")) * RUPEE_PER_LAKH) || 0;
  const croreMatch = cleaned.match(/^([\d,.]+)\s*(cr|c)/);
  if (croreMatch) return Math.round(parseFloat(croreMatch[1].replace(/,/g, "")) * RUPEE_PER_CRORE) || 0;
  const n = parseFloat(digitsOnly);
  return Number.isNaN(n) ? 0 : Math.round(n);
}

const toNumberString = (val: any) => {
  const n = parseBudgetToRupees(String(val ?? ""));
  return n ? String(n) : "";
};

/* ================= Small utils ================= */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const normalizeHeader = (h: string) =>
  String(h || "")
    .trim()
    .toLowerCase()
    .replace(/[._\-()/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

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

const monthIntSafe = (v: any): string => {
  const s = String(v ?? "").trim().toLowerCase();
  if (!s) return "";
  const names = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const idx = names.findIndex(n => s.startsWith(n));
  if (idx >= 0) return String(idx + 1);
  const asInt = parseInt(s, 10);
  if (asInt >= 1 && asInt <= 12) return String(asInt);
  return "";
};

function parseJSONorCSV(value: any): any[] {
  const raw = String(value ?? "").trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === "string" && parsed) return [parsed];
  } catch {
    return raw
      .split(/[,;|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

/* ================= Types ================= */
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
  budget?: string;
  priceType?: "Fixed" | "Negotiable" | "";
  finalPrice?: string;
  address?: string;
  status?: string;
  leadSource?: string;
  possessionMonth?: string | "";
  possessionYear?: number | "";
  purchaseMonth?: string | "";
  purchaseYear?: number | "";
  sellingRights?: string;
  amenities?: any[];
  furnishingItems?: any[];
  description?: string;
  assignedTo?: string;
};

type ImportPreview = CleanRow & { __row: number; __errors: string[] };

type Executive = {
  id: string | number;
  name: string;
  email?: string;
  username?: string;
};

type AssignmentMode = "none" | "roundrobin";

/* ================= Header Map ================= */
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
  "budget": "budget",
  "price type": "priceType",
  "final price": "finalPrice",
  "address": "address",
  "status": "status",
  "possession month": "possessionMonth",
  "possession year": "possessionYear",
  "purchase month": "purchaseMonth",
  "purchase year": "purchaseYear",
  "selling rights": "sellingRights",
  "amenities": "amenities",
  "furnishing items": "furnishingItems",
  "description": "description",
  "seller name": "seller",
  "seller": "seller",
  "assigned to": "assignedTo",
  "executive": "assignedTo",
  "agent": "assignedTo",
  "property type name": "propertyType",
  "property subtype name": "propertySubtype",
  "unit no.": "unitNo",
  "property_type_name": "propertyType",
  "property_subtype_name": "propertySubtype",
  "unit_type": "unitType",
  "unit_no": "unitNo",
  "furnishing_items": "furnishingItems",
  "furnishing item": "furnishingItems",
  "city_name": "city",
  "location_name": "location",
  "society_name": "societyName",
  "parking_type": "parkingType",
  "parking_qty": "parkingQty",
  "carpet_area": "carpetArea",
  "builtup_area": "builtupArea",
  "price_type": "priceType",
  "final_price": "finalPrice",
  "lead_source": "leadSource",
  "possession_month": "possessionMonth",
  "possession_year": "possessionYear",
  "purchase_month": "purchaseMonth",
  "purchase_year": "purchaseYear",
  "selling_rights": "sellingRights",
  "lead source": "leadSource",
};

const PARTIAL_HEADER_MAP: Record<string, string> = {
  "property t": "property type",
  "property s": "property subtype",
  "unit ty": "unit type",
  "unit t": "unit type",
  "parking ty": "parking type",
  "carpet are": "carpet area",
  "society na": "society name",
  "seller na": "seller name",
};

function resolveHeaderKey(rawHeader: string): keyof CleanRow | undefined {
  const h = normalizeHeader(rawHeader);
  if (HEADER_MAP[h]) return HEADER_MAP[h];
  const partial = Object.keys(PARTIAL_HEADER_MAP).find((p) => h.startsWith(p));
  if (partial) {
    const mappedReadable = PARTIAL_HEADER_MAP[partial];
    return HEADER_MAP[mappedReadable];
  }
  const allKeys = Object.keys(HEADER_MAP);
  const find1 = allKeys.find((k) => k.startsWith(h));
  if (find1) return HEADER_MAP[find1];
  const find2 = allKeys.find((k) => h.startsWith(k));
  if (find2) return HEADER_MAP[find2];
  return undefined;
}

// Cheap, safe role detectors
const getRoleString = (u: any): string => {
  const r = u?.role || u?.roles || u?.raw?.role || u?.raw?.roles || u?.user?.role || u?.user?.roles || "";
  return Array.isArray(r) ? r.join(",").toLowerCase() : String(r || "").toLowerCase();
};

const isExecutiveUser = (u: any): boolean => {
  const rs = getRoleString(u);
  return !!rs && /executive/.test(rs) && !/admin|manager|super/.test(rs);
};

/* ================= Component ================= */
const ImportPropertiesModal = ({
  isOpen,
  onClose,
  onDone,
  onImport,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDone?: (summary: { ok: number; fail: number }) => void;
  onImport?: (rows: any[]) => void;
}) => {
  const { user } = useAuth() as any;

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [rows, setRows] = useState<ImportPreview[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [failedRows, setFailedRows] = useState<{ row: number; reason: string; data: CleanRow }[]>([]);
  const [importing, setImporting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState({ total: 0, done: 0, ok: 0, fail: 0 });
  const abortRef = useRef<{ abort: boolean }>({ abort: false });

  // Executive assignment states
  const [execsLoading, setExecsLoading] = useState<boolean>(false);
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [execDropdownOpen, setExecDropdownOpen] = useState<boolean>(false);
  const [execSearch, setExecSearch] = useState<string>("");
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

 // ✅ FETCH SALES EXECUTIVES – robust pattern (mirrors Properties modal)
useEffect(() => {
  if (!isOpen) return;
  (async () => {
    try {
      setExecsLoading(true);

      const formatName = (u: any) => {
        const salutation = u?.salutation ? `${u.salutation} ` : "";
        const firstName = u?.first_name || "";
        const lastName = u?.last_name || "";
        const usernameFallback = u?.username || u?.email || "Executive";
        const name = `${salutation}${firstName} ${lastName}`.trim();
        return name || usernameFallback;
      };

      if (onlyThisExecutive) {
        const selfId = user?.id || user?.userId || user?._id || user?.uuid || user?.raw?.id || String(user?.email || user?.username || "me");
        const selfName = formatName(user);
        const me: Executive = { id: selfId, name: selfName, email: user?.email, username: user?.username };
        setExecutives([me]);
setSelectedExecIds(new Set([selfId]));
setAssignmentMode("roundrobin");
return;
      }

      // Try "presales" first, fallback to "pre-sales"
    const res = await usersAPI.getByDeptRole({
        department: "Sales",
        role: "Sales Executive",
        is_active: 1,
        limit: 100,
      });
      const list = Array.isArray(res) ? res : res?.data || res?.items || [];

      const mapped: Executive[] = list.map((u: any) => ({
        id: u.id || u.userId || u._id,
        name: formatName(u),
        email: u.email,
        username: u.username,
      }));
      setExecutives(mapped);
      
    } catch (e) {
      console.error(e);
      toast.error("Could not fetch sales executives");
    } finally {
      setExecsLoading(false);
    }
  })();
}, [isOpen, user, onlyThisExecutive]);

  const filteredExecutives = useMemo(() => {
    if (!execSearch.trim()) return executives;
    const s = execSearch.toLowerCase();
    return executives.filter(e => String(e.name || "").toLowerCase().includes(s) || String(e.email || "").toLowerCase().includes(s) || String(e.username || "").toLowerCase().includes(s));
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

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragleave" || e.type === "dragover") {
      setDragActive(e.type !== "dragleave");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  };

  const handleFile = (selectedFile: File) => {
    const name = selectedFile.name.toLowerCase();
    const ok = name.endsWith(".csv") || name.endsWith(".xlsx") || name.endsWith(".xls");
    if (!ok) return toast.error("Please select a CSV or Excel (.xlsx/.xls) file");
    setFile(selectedFile);
    processFile(selectedFile);
  };

  const parseCSV = async (file: File): Promise<Record<string, any>[]> =>
    new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (res) => resolve(res.data as any[]),
        error: (err) => reject(err),
      });
    });

  const parseXLSX = async (file: File): Promise<Record<string, any>[]> => {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf);
    const ws = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(ws, { defval: "" }) as any[];
  };

  // UPDATED: Google Sheet parser using backend API (no CORS issues)
  const parseGoogleSheet = async (url: string): Promise<Record<string, any>[]> => {
    try {
      toast.info("Fetching data from Google Sheet...");

      const data = await googleSheetsAPI.importSheet(url);

      if (!data.success || !data.rows) {
        throw new Error(data.error || "No data found");
      }

      return data.rows;


    } catch (error: any) {
      console.error('Google Sheet fetch error:', error);

      // Show user-friendly error message
      if (error.message.includes("public")) {
        toast.error("Sheet is not public. Please set sharing to 'Anyone with link can view'");
      } else if (error.message.includes("404")) {
        toast.error("Sheet not found. Please check the URL");
      } else {
        toast.error(error.message || "Could not access Google Sheet");
      }

      throw new Error(error.message || "Could not access Google Sheet. Make sure it's public.");
    }
  };

  const canonicalize = (raw: Record<string, any>, idx: number): ImportPreview => {
    const mapped: Record<string, any> = {};
    for (const [k, v] of Object.entries(raw)) {
      const nk = resolveHeaderKey(k);
      if (nk) mapped[nk] = v;
    }

    const clean: CleanRow = {
      seller: (mapped.seller ?? "").toString().trim(),
      propertyType: (mapped.propertyType ?? "").toString().trim(),
      propertySubtype: (mapped.propertySubtype ?? "").toString().trim(),
      unitType: (mapped.unitType ?? "").toString().trim(),
      wing: (mapped.wing ?? "").toString().trim(),
      unitNo: (mapped.unitNo ?? "").toString().trim(),
      furnishing: (mapped.furnishing ?? "").toString().trim(),
      bedrooms: int(mapped.bedrooms),
      bathrooms: int(mapped.bathrooms),
      facing: (mapped.facing ?? "").toString().trim(),
       balcony: (mapped.balcony ?? "").toString().trim(),
      parkingType: (mapped.parkingType ?? "").toString().trim(),
      parkingQty: int(mapped.parkingQty),
      city: (mapped.city ?? "").toString().trim(),
      location: (mapped.location ?? "").toString().trim(),
      societyName: (mapped.societyName ?? "").toString().trim(),
      floor: (mapped.floor ?? "").toString().trim(),
      totalFloors: (mapped.totalFloors ?? "").toString().trim(),
      carpetArea: num(mapped.carpetArea),
      builtupArea: num(mapped.builtupArea),
      budget: toNumberString(mapped.budget),
      priceType: ((): "Fixed" | "Negotiable" | "" => {
        const s = String(mapped.priceType ?? "").trim();
        if (!s) return "";
        return /neg/i.test(s) ? "Negotiable" : "Fixed";
      })(),
      finalPrice: toNumberString(mapped.finalPrice),
      address: (mapped.address ?? "").toString().trim(),
      status: (mapped.status ?? "").toString().trim(),
      leadSource: (mapped.leadSource ?? "").toString().trim(),
      possessionMonth: monthIntSafe(mapped.possessionMonth),
      possessionYear: int(mapped.possessionYear),
      purchaseMonth: monthIntSafe(mapped.purchaseMonth),
      purchaseYear: int(mapped.purchaseYear),
      sellingRights: (mapped.sellingRights ?? "").toString().trim(),
      amenities: parseJSONorCSV(mapped.amenities),
      furnishingItems: parseJSONorCSV(mapped.furnishingItems),
      description: (mapped.description ?? "").toString().trim(),
      assignedTo: (mapped.assignedTo ?? "").toString().trim(),
    };

    const __errors: string[] = [];

    const requiredChecks: Array<[keyof CleanRow, string, (v: any) => boolean]> = [
      ["propertyType", "Property Type is required", (v) => !!String(v || "").trim()],
      ["propertySubtype", "Property Subtype is required", (v) => !!String(v || "").trim()],
      ["unitType", "Unit Type is required", (v) => !!String(v || "").trim()],
      ["carpetArea", "Carpet Area is required", (v) => v !== "" && Number.isFinite(Number(v)) && Number(v) >= 0],
      ["societyName", "Society Name is required", (v) => !!String(v || "").trim()],
    ];

    for (const [key, msg, ok] of requiredChecks) {
      if (!ok((clean as any)[key])) __errors.push(msg);
    }

    if (clean.carpetArea !== "" && Number(clean.carpetArea) < 0) __errors.push("Carpet Area < 0?");
    if (clean.builtupArea !== "" && Number(clean.builtupArea) < 0) __errors.push("Built-up Area < 0?");
    if (clean.finalPrice && Number(clean.finalPrice) < 0) __errors.push("Final Price < 0?");
    if (clean.budget && Number(clean.budget) < 0) __errors.push("Budget < 0?");
    if (typeof clean.possessionYear === "number" && (clean.possessionYear < 1900 || clean.possessionYear > 2100))
      __errors.push("Possession Year looks invalid");
    if (typeof clean.purchaseYear === "number" && (clean.purchaseYear < 1900 || clean.purchaseYear > 2100))
      __errors.push("Purchase Year looks invalid");

    return { ...clean, __row: idx + 1, __errors };
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setErrors([]); setRows([]);
    try {
      const isCSV = file.name.toLowerCase().endsWith(".csv");
      const rawRows = isCSV ? await parseCSV(file) : await parseXLSX(file);
      if (!rawRows.length) {
        setErrors(["No rows found in the file."]);
        return;
      }
      const canon = rawRows.map((r, i) => canonicalize(r, i));
      setRows(canon);
    } catch (e: any) {
      setErrors([`Error processing file: ${e?.message || e}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  const processGoogleSheet = async (url: string) => {
    setIsProcessing(true);
    setErrors([]); setRows([]);
    try {
      const rawRows = await parseGoogleSheet(url);
      if (!rawRows.length) {
        setErrors(["No rows found in the Google Sheet."]);
        return;
      }
      const canon = rawRows.map((r, i) => canonicalize(r, i));
      setRows(canon);
      toast.success(`Successfully loaded ${rawRows.length} rows from Google Sheet`);
    } catch (e: any) {
      console.error('Google Sheet error:', e);
      setErrors([`Error: ${e?.message || e}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  const isRowValid = (r: ImportPreview) =>
    r.__errors.filter((e) => /required/i.test(e)).length === 0;

  const validRows = useMemo(() => rows.filter(isRowValid), [rows]);
  const validCount = validRows.length;
  const invalidCount = rows.length - validCount;

  // Function to get assigned executive for a row
  const getAssignedExecutive = (row: CleanRow, index: number): string => {
    if (onlyThisExecutive) {
      const selfId = user?.id || user?.userId || user?._id || user?.uuid || user?.raw?.id || "me";
      const exec = executives.find(e => e.id === selfId);
      return exec?.name || "";
    }
    if (assignmentMode === "none") return "";
    if (assignmentMode === "roundrobin" && selectedExecIds.size > 0) {
      const ids = Array.from(selectedExecIds);
      const execIndex = index % ids.length;
      const execId = ids[execIndex];
      const exec = executives.find(e => e.id === execId);
      return exec?.name || "";
    }
    return row.assignedTo || "";
  };

  function buildFormDataFromRow(r: CleanRow, rowIndex: number): FormData {
    const fd = new FormData();
    const now = new Date();
    const defaultMonth = String(now.getMonth() + 1);
    const defaultYear = String(now.getFullYear());
    const creatorId = getCreatorId();

    const assignedExecutive = getAssignedExecutive(r, rowIndex);

    const map: Record<string, any> = {
      seller: r.seller || "",
      propertyType: r.propertyType || "",
      propertySubtype: r.propertySubtype || "",
      unitType: r.unitType || "",
      wing: r.wing || "",
      unitNo: r.unitNo || "",
      furnishing: r.furnishing || "",
      bedrooms: r.bedrooms === "" ? "" : String(r.bedrooms),
      bathrooms: r.bathrooms === "" ? "" : String(r.bathrooms),
      facing: r.facing || "",
      balcony: (r as any).balcony || "",
      parkingType: r.parkingType || "",
      parkingQty: r.parkingQty === "" ? "" : String(r.parkingQty),
      city: r.city || "",
      location: r.location || "",
      society: r.societyName || "",
      society_name: r.societyName || "",
      floor: r.floor || "",
      totalFloors: r.totalFloors || "",
      carpetArea: r.carpetArea === "" ? "" : String(r.carpetArea),
      builtupArea: r.builtupArea === "" ? "" : String(r.builtupArea),
      budget: r.budget || "",
      priceType: r.priceType || "Fixed",
      finalPrice: r.finalPrice || "",
      address: r.address || "",
      status: r.status || "Available",
      leadSource: r.leadSource || "",
      possessionMonth: r.possessionMonth || defaultMonth,
      possessionYear: r.possessionYear === "" ? defaultYear : String(r.possessionYear),
      purchaseMonth: r.purchaseMonth || defaultMonth,
      purchaseYear: r.purchaseYear === "" ? defaultYear : String(r.purchaseYear),
      sellingRights: r.sellingRights || "Standard",
      description: r.description || "",
      assignedTo: assignedExecutive,
      created_by: creatorId,
    };

    Object.entries(map).forEach(([k, v]) => fd.append(k, v));
    fd.append("amenities", JSON.stringify(r.amenities ?? []));
    fd.append("furnishingItems", JSON.stringify(r.furnishingItems ?? []));
    fd.append("nearby_places", JSON.stringify([]));

    return fd;
  }

  const startImport = async () => {
    if (!rows.length) return toast.error("No data to import");
    if (validCount === 0) {
      return toast.error("No valid rows to import. Fix required fields shown in red headers.");
    }
    if (!onlyThisExecutive && assignmentMode === "roundrobin" && selectedExecIds.size === 0) {
      return toast.error("Please select at least one executive or choose None.");
    }

    setImporting(true);
    setFailedRows([]);
    setPaused(false);
    abortRef.current.abort = false;

    const toImport = validRows;
    setProgress({ total: toImport.length, done: 0, ok: 0, fail: 0 });

    const concurrency = 3;
    let cursor = 0;
    let ok = 0;
    let fail = 0;

    const runOne = async (row: ImportPreview, idx: number) => {
      try {
        const fd = buildFormDataFromRow(row, idx);
        await propertiesAPI.createProperty(fd);
        ok++;
      } catch (e: any) {
        console.error("Import row error:", { row: row.__row, error: e });
        fail++;
        const errMsg = e?.response?.data?.message || e?.message || String(e);
        setFailedRows(prev => [...prev, { row: row.__row, reason: `API Error: ${errMsg}`, data: row }]);
      } finally {
        const done = ok + fail;
        setProgress({ total: toImport.length, done, ok, fail });
      }
    };

    const workers: Promise<void>[] = [];
    for (let i = 0; i < concurrency; i++) {
      workers.push(
        (async function worker() {
          while (cursor < toImport.length && !abortRef.current.abort) {
            if (paused) { await sleep(200); continue; }
            const idx = cursor++;
            await runOne(toImport[idx], idx);
          }
        })()
      );
    }

    await Promise.all(workers);
    setImporting(false);

    if (abortRef.current.abort) {
      toast.info("Import cancelled.");
    } else {
      if (ok) toast.success(`Imported ${ok} properties`);
      if (fail) toast.warn(`${fail} failed`);
      if (invalidCount > 0) toast.info(`${invalidCount} rows skipped (missing required fields)`);
      onDone?.({ ok, fail });
      onImport?.([]);
      if (ok > 0 && fail === 0 && invalidCount === 0) {
        setTimeout(() => onClose(), 1500);
      }
    }
  };

  const togglePause = () => setPaused((p) => !p);
  const cancelImport = () => { abortRef.current.abort = true; setPaused(false); };

  const exportImportIssues = () => {
    const localInvalids = rows.filter(r => !isRowValid(r)).map(r => ({
      "Row Number": r.__row,
      "Status": "Skipped / Invalid",
      "Issue / Error": r.__errors.join(" | "),
      ...Object.fromEntries(
        Object.entries(r).filter(([key]) => !key.startsWith("__"))
      )
    }));

    const apiValids = failedRows.map(r => ({
      "Row Number": r.row,
      "Status": "API Error",
      "Issue / Error": r.reason,
      ...Object.fromEntries(
        Object.entries(r.data).filter(([key]) => !key.startsWith("__"))
      )
    }));

    const allIssues = [...localInvalids, ...apiValids];

    if (allIssues.length === 0) {
      toast.info("No import issues or errors found to export.");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(allIssues);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Import Issues");
    XLSX.writeFile(wb, `properties_import_issues_${Date.now()}.xlsx`);
    toast.success("Successfully exported import issues to Excel.");
  };

  // Template headers
 const TEMPLATE_HEADERS_READABLE: string[] = [
  // ── Property Details ──
  "Seller Name",
  "Property Type", "Property Subtype", "Unit Type",
  "Wing", "Unit No",
  "Furnishing", "Parking Type",
  "Bedrooms", "Bathrooms", "Facing", "Balcony",
  "Parking Qty", "Total Floors", "Floor",
  "Property Status",
  // ── Location ──
  "Society Name", "Location", "City", "Address",
  // ── Area & Pricing ──
  "Carpet Area", "Builtup Area",
  "Lead Source",
  "Budget", "Price Type", "Final Price",
  // ── Timeline ──
  "Purchase Month", "Purchase Year",
  "Possession Month", "Possession Year",
  "Selling Rights",
  // ── Amenities & Furnishings ──
  "Amenities", "Furnishing Items",
  // ── Description ──
  "Description",
  // ── Assignment ──
  "Assigned To",
];

  const downloadTemplate = () => {
  const sample1 = [
  // Seller, Type, Subtype, UnitType, Wing, UnitNo
  "John Doe", "Residential", "Bungalow", "2BHK", "A", "1204",
  // Furnishing, ParkingType, Bedrooms, Bathrooms, Facing, Balcony
  "Semi-Furnished", "Covered", "2", "2", "East", "1",
  // ParkingQty, TotalFloors, Floor, Status
  "1", "22nd Floor", "12th Floor", "Available",
  // Society, Location, City, Address
  "Sea View Towers", "Bandra West", "Mumbai", "Wing A, Unit 1204, Sea View Towers, Bandra West, Mumbai 400050",
  // CarpetArea, BuiltupArea, LeadSource, Budget, PriceType, FinalPrice
  "980", "1050", "FB Post", "18000000", "Fixed", "",
  // PurchaseMonth, PurchaseYear, PossessionMonth, PossessionYear, SellingRights
  "1", "2023", "11", "2025", "Standard",
  // Amenities, FurnishingItems, Description, AssignedTo
  "Gym,Lift,Security", "Wardrobe,Modular Kitchen", "Well maintained 2BHK apartment with sea breeze.", "Rajesh Kumar"
];

const sample2 = [
  "Jane Smith", "Residential", "Flat", "3BHK", "", "",
  "Fully-Furnished", "Open", "3", "4", "North", "2",
  "2", "2nd Floor", "1st Floor", "Available",
  "Green Valley", "Koregaon Park", "Pune", "Green Valley, Koregaon Park, Pune 411001",
  "2200", "2600", "Cold Call", "35000000", "Negotiable", "34000000",
  "6", "2020", "12", "2025", "Exclusive Manadate",
  "Gym,Pool,Clubhouse,Security", "Bed,Sofa,AC,Wardrobe", "Corner villa with large garden.", "Priya Sharma"
];

const sample3 = [
  "Ravi Mehta", "Commercial", "Office", "Studio", "B", "305",
  "Unfurnished", "Covered", "", "", "West", "",
  "1", "10th Floor  ", "3rd Floor", "Available",
  "Business Hub", "Viman Nagar", "Pune", "Unit 305, Wing B, Business Hub, Viman Nagar, Pune 411014",
  "650", "750", "Referral", "12000000", "Fixed", "",
  "8", "2022", "3", "2026", "Without Mandate",
  "Lift,Security,Power Backup", "", "Prime commercial office space.", "Amit Joshi"
];
    try {
      const baseHeaderStyle = {
        font: { bold: true, color: { rgb: "FF000000" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: {
          top: { style: "thin", color: { rgb: "FFDDDDDD" } },
          bottom: { style: "thin", color: { rgb: "FFDDDDDD" } },
          left: { style: "thin", color: { rgb: "FFDDDDDD" } },
          right: { style: "thin", color: { rgb: "FFDDDDDD" } },
        },
      };

      const normalStyle = { alignment: { vertical: "center" as const } };

const data = [TEMPLATE_HEADERS_READABLE, sample1, sample2, sample3];
      const ws = XLSXStyle.utils.aoa_to_sheet(data);
      ws["!cols"] = TEMPLATE_HEADERS_READABLE.map((h) => ({ wch: Math.max(12, Math.min(28, h.length + 2)) }));

      for (let c = 0; c < TEMPLATE_HEADERS_READABLE.length; c++) {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c });
        if (!ws[cellRef]) continue;
        ws[cellRef].s = baseHeaderStyle as any;
      }

      const RED_SET = new Set([
        "property type", "property subtype", "unit type", "carpet area", "society name", 
      ]);

      for (let c = 0; c < TEMPLATE_HEADERS_READABLE.length; c++) {
        const header = TEMPLATE_HEADERS_READABLE[c];
        if (RED_SET.has(header.toLowerCase())) {
          const cellRef = XLSX.utils.encode_cell({ r: 0, c });
          if (!ws[cellRef]) continue;
          ws[cellRef].s = {
            ...baseHeaderStyle,
            font: { ...(baseHeaderStyle as any).font, color: { rgb: "FFFF0000" } },
          } as any;
        }
      }

      for (let r = 1; r < data.length; r++) {
        for (let c = 0; c < data[r].length; c++) {
          const cellRef = XLSX.utils.encode_cell({ r, c });
          if (!ws[cellRef]) continue;
          ws[cellRef].s = normalStyle as any;
        }
      }

      const wb = XLSXStyle.utils.book_new();
      XLSXStyle.utils.book_append_sheet(wb, ws, "Properties Template");
      XLSXStyle.writeFile(wb, "properties_template.xlsx");
    } catch (err) {
      console.warn("xlsx-js-style failed; falling back to CSV", err);
      const headers = TEMPLATE_HEADERS_READABLE.map(v => `"${v.replace(/"/g, '""')}"`).join(",");
      const row1 = sample1.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",");
      const row2 = sample2.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",");
      const csv = `${headers}\n${row1}\n${row2}`;
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "properties_template.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const formatCurrency = (amount?: string) => {
    if (!amount || amount === "") return "—";
    const num = Number(amount);
    if (isNaN(num) || num === 0) return "—";

    if (num >= 10000000) {
      const crores = (num / 10000000).toFixed(1);
      return `₹${crores}Cr`;
    }
    if (num >= 100000) {
      const lakhs = (num / 100000).toFixed(1);
      return `₹${lakhs}L`;
    }
    return `₹${num.toLocaleString("en-IN")}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        style={{ border: `1px solid ${BD}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between" style={{ background: N }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ background: `${O}20` }}>
              <Home size={14} style={{ color: O }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Import Properties</h2>
              <p className="text-[9px] text-white/70">Import properties from Excel files or Google Sheets</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4" style={{ scrollbarWidth: 'thin' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column - Import Methods */}
            <div className="space-y-3">
              {/* File Upload Card */}
              <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}>
                  <FileSpreadsheet size={12} style={{ color: O }} /> Upload File
                </h3>
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileInput} className="hidden" />
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileInputRef.current?.click()}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${dragActive ? "border-orange-400 bg-orange-50" : file ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-gray-400 bg-white"
                    }`}
                >
                  {file ? (
                    <div className="space-y-1">
                      <CheckCircle size={16} className="mx-auto" style={{ color: O }} />
                      <p className="text-[10px] font-medium truncate px-2" style={{ color: N }}>{file.name}</p>
                      <p className="text-[9px]" style={{ color: MU }}>Click to change</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload size={16} className="mx-auto" style={{ color: MU }} />
                      <p className="text-[10px] font-medium" style={{ color: N }}>Drop file or click</p>
                      <p className="text-[9px]" style={{ color: MU }}>Excel (.xlsx, .xls) or CSV</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => file && processFile(file)}
                  disabled={!file || isProcessing}
                  className="mt-2 w-full rounded-lg py-1.5 text-[10px] font-medium text-white transition-all disabled:opacity-50"
                  style={{ background: N }}
                >
                  {isProcessing ? (
                    <span className="inline-flex items-center justify-center gap-1">
                      <Loader2 size={10} className="animate-spin" />
                      Processing...
                    </span>
                  ) : "Import from File"}
                </button>
              </div>

              {/* Google Sheet Card */}
              <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}>
                  <Globe size={12} style={{ color: O }} /> Google Sheets
                </h3>
                <input
                  type="text"
                  placeholder="https://docs.google.com/spreadsheets/..."
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  className="border rounded-lg w-full h-7 px-2 text-[10px] focus:outline-none focus:ring-1 bg-white mb-2"
                  style={{ borderColor: BD }}
                />
                <div className="rounded-lg p-2 mb-2" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
                  <div className="flex items-start gap-1.5">
                    <AlertCircle size={10} className="shrink-0 mt-0.5" style={{ color: O }} />
                    <p className="text-[9px]" style={{ color: MU }}>Make sheet public: "Anyone with link can view"</p>
                  </div>
                </div>
                <button
                  onClick={() => sheetUrl.trim() && processGoogleSheet(sheetUrl)}
                  disabled={!sheetUrl.trim() || isProcessing}
                  className="w-full rounded-lg py-1.5 text-[10px] font-medium text-white transition-all disabled:opacity-50"
                  style={{ background: O }}
                >
                  {isProcessing ? (
                    <span className="inline-flex items-center justify-center gap-1">
                      <Loader2 size={10} className="animate-spin" />
                      Processing...
                    </span>
                  ) : "Import from Google Sheet"}
                </button>
              </div>

              {/* Download Template */}
              <button
                onClick={downloadTemplate}
                className="w-full rounded-lg py-1.5 text-[10px] font-medium transition-all border flex items-center justify-center gap-1"
                style={{ borderColor: BD, color: N }}
              >
                <Download size={10} />
                Download Template
              </button>
            </div>

            {/* Right Column - Assignment */}
            <div className="space-y-3">
              <div className="rounded-lg p-2.5" style={{ background: BG, border: `1px solid ${BD}` }}>
                <h3 className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: N }}>
                  <Users size={12} style={{ color: O }} /> Property Assignment
                </h3>

                <div className="space-y-2">
                  <label className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer ${assignmentMode === "none" && !onlyThisExecutive ? "border-orange-300 bg-orange-50" : "border-gray-200 bg-white"} ${onlyThisExecutive ? "opacity-60 cursor-not-allowed" : ""}`}>
                    <input type="radio" className="mt-0.5 w-3 h-3" style={{ accentColor: O }} checked={assignmentMode === "none"} onChange={() => !onlyThisExecutive && setAssignmentMode("none")} disabled={onlyThisExecutive} />
                    <div className="flex-1">
                      <p className="text-[10px] font-medium" style={{ color: N }}>No Assignment</p>
                      <p className="text-[8px]" style={{ color: MU }}>Properties not assigned to any executive</p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer ${assignmentMode === "roundrobin" || onlyThisExecutive ? "border-orange-300 bg-orange-50" : "border-gray-200 bg-white"}`}>
                    <input type="radio" className="mt-0.5 w-3 h-3" style={{ accentColor: O }} checked={assignmentMode === "roundrobin" || onlyThisExecutive} onChange={() => setAssignmentMode("roundrobin")} disabled={onlyThisExecutive} />
                    <div className="flex-1">
                      <p className="text-[10px] font-medium" style={{ color: N }}>{onlyThisExecutive ? "Assigned to you" : "Assign to executives"}</p>
                      <p className="text-[8px]" style={{ color: MU }}>{onlyThisExecutive ? "Auto-assigned to you" : "Distributed round-robin"}</p>
                    </div>
                  </label>

                  {!onlyThisExecutive && assignmentMode === "roundrobin" && (
                    <div className="relative" ref={dropdownRef}>
                      <button
                        type="button"
                        onClick={() => setExecDropdownOpen(s => !s)}
                        className="w-full flex items-center justify-between rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-[10px]"
                      >
                        <span style={{ color: selectedExecIds.size > 0 ? N : MU }}>
                          {selectedExecIds.size > 0 ? `${selectedExecIds.size} executive(s) selected` : "Select executives"}
                        </span>
                        <ChevronDown size={10} className={`transition-transform ${execDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {execDropdownOpen && (
                        <div className="absolute z-20 mt-1 w-full rounded-lg border bg-white shadow-lg overflow-hidden">
                          <div className="p-1.5 border-b">
                            <div className="relative">
                              <Search size={9} className="absolute left-2 top-1/2 -translate-y-1/2" style={{ color: MU }} />
                              <input type="text" value={execSearch} onChange={(e) => setExecSearch(e.target.value)} placeholder="Search..." className="w-full pl-6 pr-2 py-1 text-[9px] border rounded" style={{ borderColor: BD }} />
                            </div>
                          </div>
                          <div className="max-h-40 overflow-auto">
                            {execsLoading ? (
                              <div className="p-2 text-center text-[9px]" style={{ color: MU }}>Loading...</div>
                            ) : filteredExecutives.length === 0 ? (
                              <div className="p-2 text-center text-[9px]" style={{ color: MU }}>No executives</div>
                            ) : (
                              filteredExecutives.map(e => (
                                <label key={e.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 cursor-pointer">
                                  <input type="checkbox" className="w-3 h-3 rounded" style={{ accentColor: O }} checked={selectedExecIds.has(e.id)} onChange={() => toggleExec(e.id)} />
                                  <span className="text-[9px]" style={{ color: N }}>{e.name}</span>
                                </label>
                              ))
                            )}
                          </div>
                          <div className="flex items-center justify-between p-1.5 border-t bg-gray-50">
                            <div className="flex gap-1">
                              <button onClick={selectAllExecs} className="px-2 py-0.5 text-[8px] rounded" style={{ color: N }}>All</button>
                              <button onClick={clearExecs} className="px-2 py-0.5 text-[8px] rounded" style={{ color: N }}>Clear</button>
                            </div>
                            <button onClick={() => setExecDropdownOpen(false)} className="px-2 py-0.5 text-[8px] rounded text-white" style={{ background: O }}>Done</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Info Card */}
              <div className="rounded-lg p-2.5" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
                <div className="flex items-start gap-1.5">
                  <AlertCircle size={10} className="shrink-0 mt-0.5" style={{ color: O }} />
                  <div>
                    <p className="text-[9px] font-medium mb-0.5" style={{ color: N }}>Required fields:</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-medium" style={{ background: `${O}20`, color: O }}>Property Type*</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-medium" style={{ background: `${O}20`, color: O }}>Property Subtype*</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-medium" style={{ background: `${O}20`, color: O }}>Unit Type*</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-medium" style={{ background: `${O}20`, color: O }}>Carpet Area*</span>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-medium" style={{ background: `${O}20`, color: O }}>Society Name*</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {rows.length > 0 && (
            <div className="mt-3 rounded-lg overflow-hidden" style={{ border: `1px solid ${BD}` }}>
              <div className="px-3 py-1.5 flex items-center justify-between" style={{ background: BG, borderBottom: `1px solid ${BD}` }}>
                <div className="flex items-center gap-1.5">
                  <Building2 size={10} style={{ color: O }} />
                  <span className="text-[9px] font-medium" style={{ color: N }}>Preview</span>
                </div>
                <div className="flex gap-3 text-[8px] items-center">
                  <span style={{ color: MU }}>Total: <span className="font-medium" style={{ color: N }}>{rows.length}</span></span>
                  <span style={{ color: "green" }}>Valid: <span className="font-medium">{validCount}</span></span>
                  <span style={{ color: "red" }}>Invalid: <span className="font-medium">{invalidCount}</span></span>
                  {invalidCount > 0 && (
                    <button
                      onClick={exportImportIssues}
                      className="px-2 py-0.5 rounded text-[8px] bg-red-100 text-red-700 hover:bg-red-200 transition-colors font-medium ml-1 flex items-center gap-1"
                    >
                      <Download size={8} /> Export Invalid Rows
                    </button>
                  )}
                </div>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-4 gap-2 px-3 py-1.5 text-[9px] font-semibold" style={{ background: `${O}10`, borderBottom: `1px solid ${BD}`, color: N }}>
                <div>Type</div>
                <div>Location</div>
                <div>Area</div>
                <div>Sell Price</div>
              </div>

              {/* Table Rows */}
              <div className="max-h-48 overflow-y-auto">
                {rows.slice(0, 10).map((r, idx) => {
                  const rowIsValid = isRowValid(r);
                  const location = [r.societyName, r.location, r.city].filter(Boolean).join(", ");
                  return (
                    <div
                      key={r.__row}
                      className={`grid grid-cols-4 gap-2 px-3 py-2 text-[9px] border-b last:border-b-0 ${rowIsValid ? "bg-white" : "bg-red-50"}`}
                      style={{ borderColor: BD }}
                    >
                      <div>
                        <span className="font-medium" style={{ color: N }}>{r.propertyType || "-"}</span>
                        {r.propertySubtype && <span className="text-[8px]" style={{ color: MU }}> / {r.propertySubtype}</span>}
                      </div>
                      <div className="truncate" style={{ color: MU }} title={location}>
                        {location || "-"}
                      </div>
                      <div style={{ color: MU }}>
                        {r.carpetArea !== "" ? `${r.carpetArea} sq.ft` : "-"}
                      </div>
                      <div className="font-medium" style={{ color: O }}>
                        {formatCurrency(r.budget)}
                      </div>
                    </div>
                  );
                })}
                {rows.length > 10 && (
                  <div className="px-3 py-2 text-center text-[8px]" style={{ background: BG, color: MU }}>
                    +{rows.length - 10} more rows
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Import Progress */}
          {importing && (
            <div className="mt-3 rounded-lg p-3" style={{ background: BG, border: `1px solid ${BD}` }}>
              <div className="flex justify-between text-[9px] mb-1">
                <span style={{ color: N }}>Importing...</span>
                <span style={{ color: MU }}>{progress.done}/{progress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{ width: progress.total ? `${(progress.done / progress.total) * 100}%` : "0%", background: O }}
                />
              </div>
              <div className="flex justify-between text-[8px] mt-1">
                <span style={{ color: "green" }}>✅ Success: {progress.ok}</span>
                <span style={{ color: "red" }}>❌ Failed: {progress.fail}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-2.5 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" style={{ borderColor: BD, background: BG }}>
          <div className="flex items-center">
            <AlertCircle size={10} style={{ color: MU }} />
            <span className="text-[8px] ml-1" style={{ color: MU }}>Fields marked with * are required</span>
          </div>
          <div className="flex items-center gap-2">
            {(invalidCount > 0 || failedRows.length > 0) && (
              <button
                onClick={exportImportIssues}
                className="mr-2 px-3 py-1.5 text-[10px] font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-all flex items-center gap-1"
              >
                <Download size={10} />
                Export Issues ({invalidCount + failedRows.length})
              </button>
            )}
            {!importing ? (
              <>
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all hover:bg-gray-50"
                  style={{ border: `1px solid ${BD}`, color: N }}
                >
                  Cancel
                </button>
                <button
                  onClick={startImport}
                  disabled={rows.length === 0 || validCount === 0 || (!onlyThisExecutive && assignmentMode === "roundrobin" && selectedExecIds.size === 0)}
                  className="px-3 py-1.5 text-[10px] font-medium text-white rounded-lg transition-all hover:opacity-80 disabled:opacity-50 flex items-center gap-1"
                  style={{ background: O }}
                >
                  <Upload size={10} />
                  Import {validCount} Properties
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={togglePause}
                  className="px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all hover:bg-gray-50 flex items-center gap-1"
                  style={{ border: `1px solid ${BD}`, color: N }}
                >
                  {paused ? <Play size={10} /> : <Pause size={10} />}
                  {paused ? "Resume" : "Pause"}
                </button>
                <button
                  onClick={cancelImport}
                  className="px-3 py-1.5 text-[10px] font-medium rounded-lg transition-all flex items-center gap-1"
                  style={{ border: `1px solid ${BD}`, color: "red" }}
                >
                  <RotateCw size={10} />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportPropertiesModal;