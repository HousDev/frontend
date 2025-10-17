// src/components/properties/ImportPropertiesModal.tsx
import React, { useMemo, useRef, useState } from "react";
import {
  X, Upload, Download, AlertCircle, Home, Play, Pause, RotateCw, CheckCircle
} from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { propertiesAPI } from "@/lib/propertiesAPI";

/* ================= Budget helpers (same semantics as your form) ================= */
const RUPEE_PER_CRORE = 10_000_000;
const RUPEE_PER_LAKH = 100_000;

function parseBudgetToRupees(text?: string): number {
  const raw = (text || "").trim().toLowerCase();
  if (!raw) return 0;
  const cleaned = raw.replace(/₹/g, "").replace(/\s+/g, "");
  const digitsOnly = cleaned.replace(/,/g, "");
  if (/^\d+$/.test(digitsOnly)) return parseInt(digitsOnly, 10) || 0;
  const lakhMatch = cleaned.match(/^([\d,.]+)l$/);
  if (lakhMatch) return Math.round(parseFloat(lakhMatch[1].replace(/,/g, "")) * RUPEE_PER_LAKH) || 0;
  const croreMatch = cleaned.match(/^([\d,.]+)(cr|c)$/);
  if (croreMatch) return Math.round(parseFloat(croreMatch[1].replace(/,/g, "")) * RUPEE_PER_CRORE) || 0;
  const n = parseFloat(digitsOnly);
  return Number.isNaN(n) ? 0 : Math.round(n);
}

const toNumberString = (val: any) => String(parseBudgetToRupees(String(val ?? "")) || "");

/* ================= Types ================= */
type CleanRow = {
  seller?: string;
  propertyType: string;
  propertySubtype: string;
  unitType: string;
  furnishing?: string;
  parkingType?: string;
  city: string;
  location: string;
  societyName: string;
  carpetArea: string; // keep string for FormData
  budget: string;     // rupee integer string
  status?: string;
};

type ImportPreview = CleanRow & { __row: number; __errors: string[] };

const REQUIRED: (keyof CleanRow)[] = [
  "propertyType", "propertySubtype", "unitType", "city", "location", "societyName", "carpetArea", "budget"
];

const normalizeHeader = (h: string) =>
  String(h || "")
    .trim()
    .toLowerCase()
    .replace(/[._\-()/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const HEADER_MAP: Record<string, keyof CleanRow> = {
  "property type": "propertyType",
  "property subtype": "propertySubtype",
  "unit type": "unitType",
  "furnishing": "furnishing",
  "parking type": "parkingType",
  "city": "city",
  "location": "location",
  "society name": "societyName",
  "carpet area sq ft": "carpetArea",
  "carpet area": "carpetArea",
  "carpet area sqft": "carpetArea",
  "budget": "budget",
  "status": "status",
  "seller name": "seller",
  "seller": "seller",
};

/* ================= Small utils ================= */
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

/* ================= Component ================= */
const ImportPropertiesModal = ({
  isOpen,
  onClose,
  onDone,
  onImport, // optional legacy
}: {
  isOpen: boolean;
  onClose: () => void;
  onDone?: (summary: { ok: number; fail: number }) => void;
  onImport?: (rows: any[]) => void; // legacy (no-op in our flow)
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rows, setRows] = useState<ImportPreview[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState({ total: 0, done: 0, ok: 0, fail: 0 });
  const abortRef = useRef<{ abort: boolean }>({ abort: false });

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
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
    if (!ok) return alert("Please select a CSV or Excel (.xlsx/.xls) file");
    setFile(selectedFile);
    processFile(selectedFile);
  };

  /* ---------- parse helpers ---------- */
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

  const canonicalize = (raw: Record<string, any>, idx: number): ImportPreview => {
    // Map arbitrary headers to our canonical keys
    const mapped: Record<string, any> = {};
    for (const [k, v] of Object.entries(raw)) {
      const nk = HEADER_MAP[normalizeHeader(k)];
      if (nk) mapped[nk] = v;
    }
    const clean: CleanRow = {
      seller: (mapped.seller ?? "").toString().trim(),
      propertyType: (mapped.propertyType ?? "").toString().trim(),
      propertySubtype: (mapped.propertySubtype ?? "").toString().trim(),
      unitType: (mapped.unitType ?? "").toString().trim(),
      furnishing: (mapped.furnishing ?? "").toString().trim(),
      parkingType: (mapped.parkingType ?? "").toString().trim(),
      city: (mapped.city ?? "").toString().trim(),
      location: (mapped.location ?? "").toString().trim(),
      societyName: (mapped.societyName ?? "").toString().trim(),
      carpetArea: (mapped.carpetArea ?? "").toString().trim(),
      budget: toNumberString(mapped.budget),
      status: (mapped.status ?? "Available").toString().trim(),
    };
    const __errors: string[] = [];
    REQUIRED.forEach((key) => {
      if (!String(clean[key] || "").trim()) __errors.push(`Missing ${key}`);
    });
    if (clean.carpetArea && isNaN(Number(clean.carpetArea))) __errors.push("Carpet Area must be numeric (sq.ft)");
    if (clean.budget && isNaN(Number(clean.budget))) __errors.push("Budget must be a number (in ₹)");

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

  /* ---------- payload builder (mirrors PropertyFormModal.buildPayload) ---------- */
  function buildFormDataFromRow(r: CleanRow): FormData {
    const fd = new FormData();

    const now = new Date();
    const month = String(now.getMonth() + 1);
    const year = String(now.getFullYear());

    const map: Record<string, string> = {
      seller: r.seller || "",
      propertyType: r.propertyType,
      propertySubtype: r.propertySubtype,
      unitType: r.unitType,
      wing: "",
      unitNo: "",
      furnishing: r.furnishing || "",
      parkingType: r.parkingType || "",
      parkingQty: "",
      city: r.city,
      location: r.location,
      society: r.societyName, // dropdown value; we also append society_name (label fallback)
      floor: "",
      totalFloors: "",
      carpetArea: r.carpetArea,
      builtupArea: "",
      budget: r.budget, // rupee integer string
      address: "",
      status: r.status || "Available",
      leadSource: "",
      possessionMonth: month,
      possessionYear: year,
      purchaseMonth: month,
      purchaseYear: year,
      sellingRights: "Standard",
      description: "",
      bedrooms: "",
      bathrooms: "",
      facing: "",
      priceType: "Fixed",
      finalPrice: "",
    };

    Object.entries(map).forEach(([k, v]) => fd.append(k, v));

    // arrays JSON (matching your form)
    fd.append("amenities", JSON.stringify([]));
    fd.append("furnishingItems", JSON.stringify([]));
    fd.append("nearby_places", JSON.stringify([]));

    // important: society_name (label/fallback)
    fd.append("society_name", r.societyName || "");

    // media skipped in bulk
    return fd;
  }

  /* ---------- import runner (concurrency + pause/cancel) ---------- */
  const validCount = useMemo(() => rows.filter(r => r.__errors.length === 0).length, [rows]);
  const invalidCount = rows.length - validCount;

  const startImport = async () => {
    if (!rows.length) return toast.error("No data to import");
    if (invalidCount) return toast.error("Fix invalid rows before importing");

    setImporting(true);
    setPaused(false);
    abortRef.current.abort = false;
    setProgress({ total: rows.length, done: 0, ok: 0, fail: 0 });

    const concurrency = 3;
    let cursor = 0;
    let ok = 0;
    let fail = 0;

    const runOne = async (row: ImportPreview) => {
      try {
        const fd = buildFormDataFromRow(row);
        await propertiesAPI.createProperty(fd);
        ok++;
      } catch (e: any) {
        console.error("Import row error:", { row: row.__row, error: e });
        fail++;
      } finally {
        const done = ok + fail;
        setProgress({ total: rows.length, done, ok, fail });
      }
    };

    const workers: Promise<void>[] = [];
    for (let i = 0; i < concurrency; i++) {
      workers.push(
        (async function worker() {
          while (cursor < rows.length && !abortRef.current.abort) {
            if (paused) { await sleep(200); continue; }
            const idx = cursor++;
            await runOne(rows[idx]);
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
      onDone?.({ ok, fail });
      onImport?.([]); // legacy no-op to keep old callers safe
    }
  };

  const togglePause = () => setPaused(p => !p);
  const cancelImport = () => { abortRef.current.abort = true; setPaused(false); };

  /* ---------- template ---------- */
  const downloadTemplate = () => {
    const headers = [
      "Property Type",
      "Property Subtype",
      "Unit Type",
      "Furnishing",
      "Parking Type",
      "City",
      "Location",
      "Society Name",
      "Carpet Area (sq.ft)",
      "Budget",
      "Status",
      "Seller Name",
    ].join(",");

    const sample = [
      [
        "Residential", "Apartment", "2BHK", "Semi-Furnished", "Covered",
        "Mumbai", "Bandra West", "Sea View Towers", "980", "18000000", "Available", "John Doe",
      ].join(","),
      [
        "Residential", "Villa", "3BHK", "Fully-Furnished", "Open",
        "Pune", "Koregaon Park", "Green Valley", "2200", "35000000", "Available", "Jane Smith",
      ].join(","),
    ].join("\n");

    const csv = `${headers}\n${sample}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "properties_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Import Properties (Bulk)</h2>
              <p className="text-gray-600 mt-1">
                Headers must be:
                <span className="ml-1 font-mono">
                  Property Type, Property Subtype, Unit Type, Furnishing, Parking Type, City, Location, Society Name, Carpet Area (sq.ft), Budget, Status, Seller Name
                </span>
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Template */}
          <div className="mb-6 bg-blue-50 rounded-xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-blue-900">Download Template</h3>
                <p className="text-sm text-blue-700 mt-1">Use the exact header row for smooth import.</p>
              </div>
              <button
                onClick={downloadTemplate}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download size={16} />
                <span>Download Template</span>
              </button>
            </div>
          </div>

          {/* Upload */}
          <div className="mb-6">
            <div
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="text-gray-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {file ? file.name : "Drop your file here, or click to browse"}
                  </h3>
                  <p className="text-gray-500 mt-1">CSV/XLSX, max 10MB</p>
                </div>
              </div>
            </div>
          </div>

          {/* Processing */}
          {isProcessing && (
            <div className="mb-6 bg-yellow-50 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                <div>
                  <h3 className="font-semibold text-yellow-900">Processing file...</h3>
                  <p className="text-sm text-yellow-700">Parsing & validating your data</p>
                </div>
              </div>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mb-6 bg-red-50 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="text-red-600 mt-0.5" size={20} />
                <div>
                  <h3 className="font-semibold text-red-900">Import Errors</h3>
                  <ul className="text-sm text-red-700 mt-1 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {rows.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Preview ({rows.length} rows)</h3>
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 text-green-700 font-semibold">
                    <CheckCircle size={14} /> {validCount} valid
                  </span>
                  <span className="text-red-600 font-semibold">{invalidCount} invalid</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {rows.slice(0, 30).map((r) => (
                    <div key={r.__row} className="bg-white rounded-lg p-3 border">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-sm">
                        <div className="font-medium">
                          {r.propertyType} • {r.propertySubtype} • {r.unitType}
                        </div>
                        <div className="text-gray-600">
                          {r.city}, {r.location} • {r.societyName}
                        </div>
                        <div className="text-gray-600">
                          {r.furnishing || "-"} {r.parkingType ? `• ${r.parkingType}` : ""}
                        </div>
                        <div className="text-gray-600">{r.carpetArea} sq.ft</div>
                        <div className="text-green-700 font-semibold">
                          ₹ {Number(r.budget || 0).toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {r.status || "Available"} {r.seller ? `• Seller: ${r.seller}` : ""}
                        {r.__errors.length > 0 && (
                          <span className="text-red-600 ml-2">({r.__errors.join("; ")})</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {rows.length > 30 && (
                    <div className="text-center text-gray-500 text-sm">
                      ... and {rows.length - 30} more rows
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Import controls */}
          {rows.length > 0 && (
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border">
              <div className="text-sm text-gray-700">
                Ready to import: <b>{validCount}</b> rows{" "}
                {invalidCount ? <span className="text-red-600">({invalidCount} invalid)</span> : null}
              </div>
              <div className="flex items-center gap-2">
                {!importing ? (
                  <button
                    onClick={startImport}
                    disabled={!validCount}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
                  >
                    <Home size={16} /> Import {validCount}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={togglePause}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg"
                    >
                      {paused ? <Play size={16} /> : <Pause size={16} />}
                      {paused ? "Resume" : "Pause"}
                    </button>
                    <button
                      onClick={cancelImport}
                      className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg"
                    >
                      <RotateCw size={16} /> Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Progress */}
          {importing && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: progress.total ? `${(progress.done / progress.total) * 100}%` : "0%" }}
                />
              </div>
              <div className="mt-2 text-xs text-gray-600">
                {progress.done}/{progress.total} • <span className="text-green-700">OK: {progress.ok}</span> •{" "}
                <span className="text-red-600">Fail: {progress.fail}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {rows.length ? `${rows.length} rows loaded` : "No file selected"}
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Close
              </button>
              {rows.length > 0 && !importing && validCount > 0 && (
                <button
                  onClick={startImport}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Home size={16} />
                  <span>Import {validCount} Properties</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportPropertiesModal;

// src/components/properties/ImportPropertiesModal.tsx
// import React, { useMemo, useRef, useState } from "react";
// import {
//   X, Upload, Download, AlertCircle, Home, Play, Pause, RotateCw, CheckCircle
// } from "lucide-react";
// import Papa from "papaparse";
// import * as XLSX from "xlsx";
// import { toast } from "react-toastify";
// import { propertiesAPI } from "@/lib/propertiesAPI";

// /* ================= Budget helpers (same semantics as your form) ================= */
// const RUPEE_PER_CRORE = 10_000_000;
// const RUPEE_PER_LAKH = 100_000;

// function parseBudgetToRupees(text?: string): number {
//   const raw = (text || "").trim().toLowerCase();
//   if (!raw) return 0;
//   const cleaned = raw.replace(/₹/g, "").replace(/\s+/g, "");
//   const digitsOnly = cleaned.replace(/,/g, "");
//   if (/^\d+$/.test(digitsOnly)) return parseInt(digitsOnly, 10) || 0;
//   const lakhMatch = cleaned.match(/^([\d,.]+)l$/);
//   if (lakhMatch) return Math.round(parseFloat(lakhMatch[1].replace(/,/g, "")) * RUPEE_PER_LAKH) || 0;
//   const croreMatch = cleaned.match(/^([\d,.]+)(cr|c)$/);
//   if (croreMatch) return Math.round(parseFloat(croreMatch[1].replace(/,/g, "")) * RUPEE_PER_CRORE) || 0;
//   const n = parseFloat(digitsOnly);
//   return Number.isNaN(n) ? 0 : Math.round(n);
// }

// const toNumberString = (val: any) => String(parseBudgetToRupees(String(val ?? "")) || "");

// /* ================= Types ================= */
// type CleanRow = {
//   seller?: string;
//   propertyType: string;
//   propertySubtype: string;
//   unitType: string;
//   furnishing?: string;
//   parkingType?: string;
//   city: string;
//   location: string;
//   societyName: string;
//   carpetArea: string; // keep string for FormData
//   budget: string;     // rupee integer string
//   status?: string;
// };

// type ImportPreview = CleanRow & { __row: number; __errors: string[] };

// const REQUIRED: (keyof CleanRow)[] = [
//   "propertyType", "propertySubtype", "unitType", "city", "location", "societyName", "carpetArea", "budget"
// ];

// const normalizeHeader = (h: string) =>
//   String(h || "")
//     .trim()
//     .toLowerCase()
//     .replace(/[._\-()/]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();

// const HEADER_MAP: Record<string, keyof CleanRow> = {
//   "property type": "propertyType",
//   "property subtype": "propertySubtype",
//   "unit type": "unitType",
//   "furnishing": "furnishing",
//   "parking type": "parkingType",
//   "city": "city",
//   "location": "location",
//   "society name": "societyName",
//   "carpet area sq ft": "carpetArea",
//   "carpet area": "carpetArea",
//   "carpet area sqft": "carpetArea",
//   "budget": "budget",
//   "status": "status",
//   "seller name": "seller",
//   "seller": "seller",
// };

// /* ================= Small utils ================= */
// const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// /* ================= Component ================= */
// const ImportPropertiesModal = ({
//   isOpen,
//   onClose,
//   onDone,
//   onImport, // optional
// }: {
//   isOpen: boolean;
//   onClose: () => void;
//   onDone?: (summary: { ok: number; fail: number }) => void;
//   onImport?: (rows: any[]) => void;
// }) => {
//   const [dragActive, setDragActive] = useState(false);
//   const [file, setFile] = useState<File | null>(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [rows, setRows] = useState<ImportPreview[]>([]);
//   const [errors, setErrors] = useState<string[]>([]);
//   const [importing, setImporting] = useState(false);
//   const [paused, setPaused] = useState(false);
//   const [progress, setProgress] = useState({ total: 0, done: 0, ok: 0, fail: 0 });
//   const abortRef = useRef<{ abort: boolean }>({ abort: false });

//   if (!isOpen) return null;

//   const handleDrag = (e: React.DragEvent) => {
//     e.preventDefault(); e.stopPropagation();
//     if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
//     else if (e.type === "dragleave") setDragActive(false);
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault(); e.stopPropagation();
//     setDragActive(false);
//     if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
//   };

//   const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
//   };

//   const handleFile = (selectedFile: File) => {
//     const name = selectedFile.name.toLowerCase();
//     const ok = name.endsWith(".csv") || name.endsWith(".xlsx") || name.endsWith(".xls");
//     if (!ok) return alert("Please select a CSV or Excel (.xlsx/.xls) file");
//     setFile(selectedFile);
//     processFile(selectedFile);
//   };

//   /* ---------- parse helpers ---------- */
//   const parseCSV = async (file: File): Promise<Record<string, any>[]> =>
//     new Promise((resolve, reject) => {
//       Papa.parse(file, {
//         header: true,
//         skipEmptyLines: true,
//         complete: (res) => resolve(res.data as any[]),
//         error: (err) => reject(err),
//       });
//     });

//   const parseXLSX = async (file: File): Promise<Record<string, any>[]> => {
//     const buf = await file.arrayBuffer();
//     const wb = XLSX.read(buf);
//     const ws = wb.Sheets[wb.SheetNames[0]];
//     return XLSX.utils.sheet_to_json(ws, { defval: "" }) as any[];
//   };

//   const canonicalize = (raw: Record<string, any>, idx: number): ImportPreview => {
//     // Map arbitrary headers to our canonical keys
//     const mapped: Record<string, any> = {};
//     for (const [k, v] of Object.entries(raw)) {
//       const nk = HEADER_MAP[normalizeHeader(k)];
//       if (nk) mapped[nk] = v;
//     }
//     const clean: CleanRow = {
//       seller: (mapped.seller ?? "").toString().trim(),
//       propertyType: (mapped.propertyType ?? "").toString().trim(),
//       propertySubtype: (mapped.propertySubtype ?? "").toString().trim(),
//       unitType: (mapped.unitType ?? "").toString().trim(),
//       furnishing: (mapped.furnishing ?? "").toString().trim(),
//       parkingType: (mapped.parkingType ?? "").toString().trim(),
//       city: (mapped.city ?? "").toString().trim(),
//       location: (mapped.location ?? "").toString().trim(),
//       societyName: (mapped.societyName ?? "").toString().trim(),
//       carpetArea: (mapped.carpetArea ?? "").toString().trim(),
//       budget: toNumberString(mapped.budget),
//       status: (mapped.status ?? "Available").toString().trim(),
//     };
//     const __errors: string[] = [];
//     REQUIRED.forEach((key) => {
//       if (!String(clean[key] || "").trim()) __errors.push(`Missing ${key}`);
//     });
//     if (clean.carpetArea && isNaN(Number(clean.carpetArea))) __errors.push("Carpet Area must be numeric (sq.ft)");
//     if (clean.budget && isNaN(Number(clean.budget))) __errors.push("Budget must be a number (in ₹)");

//     return { ...clean, __row: idx + 1, __errors };
//   };

//   const processFile = async (file: File) => {
//     setIsProcessing(true);
//     setErrors([]); setRows([]);
//     try {
//       const isCSV = file.name.toLowerCase().endsWith(".csv");
//       const rawRows = isCSV ? await parseCSV(file) : await parseXLSX(file);
//       if (!rawRows.length) {
//         setErrors(["No rows found in the file."]);
//         return;
//       }
//       const canon = rawRows.map((r, i) => canonicalize(r, i));
//       setRows(canon);
//     } catch (e: any) {
//       setErrors([`Error processing file: ${e?.message || e}`]);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   /* ---------- payload builder (mirrors PropertyFormModal.buildPayload) ---------- */
//   function buildFormDataFromRow(r: CleanRow): FormData {
//     const fd = new FormData();

//     const now = new Date();
//     const month = String(now.getMonth() + 1);
//     const year = String(now.getFullYear());

//     const map: Record<string, string> = {
//       seller: r.seller || "",
//       propertyType: r.propertyType,
//       propertySubtype: r.propertySubtype,
//       unitType: r.unitType,
//       wing: "",
//       unitNo: "",
//       furnishing: r.furnishing || "",
//       parkingType: r.parkingType || "",
//       parkingQty: "",
//       city: r.city,
//       location: r.location,
//       society: r.societyName, // dropdown value; we also append society_name (label fallback)
//       floor: "",
//       totalFloors: "",
//       carpetArea: r.carpetArea,
//       builtupArea: "",
//       budget: r.budget, // rupee integer string
//       address: "",
//       status: r.status || "Available",
//       leadSource: "",
//       possessionMonth: month,
//       possessionYear: year,
//       purchaseMonth: month,
//       purchaseYear: year,
//       sellingRights: "Standard",
//       description: "",
//       bedrooms: "",
//       bathrooms: "",
//       facing: "",
//       priceType: "Fixed",
//       finalPrice: "",
//     };

//     Object.entries(map).forEach(([k, v]) => fd.append(k, v));

//     // arrays JSON (matching your form)
//     fd.append("amenities", JSON.stringify([]));
//     fd.append("furnishingItems", JSON.stringify([]));
//     fd.append("nearby_places", JSON.stringify([]));

//     // important: society_name (label/fallback)
//     fd.append("society_name", r.societyName || "");

//     // media skipped in bulk
//     return fd;
//   }

//   /* ---------- import runner (concurrency + pause/cancel) ---------- */
//   const validCount = useMemo(() => rows.filter(r => r.__errors.length === 0).length, [rows]);
//   const invalidCount = rows.length - validCount;

//   const startImport = async () => {
//     if (!rows.length) return toast.error("No data to import");
//     if (invalidCount) return toast.error("Fix invalid rows before importing");

//     setImporting(true);
//     setPaused(false);
//     abortRef.current.abort = false;
//     setProgress({ total: rows.length, done: 0, ok: 0, fail: 0 });

//     const concurrency = 3;
//     let cursor = 0;
//     let ok = 0;
//     let fail = 0;
//     const created: any[] = [];

//     const runOne = async (row: ImportPreview) => {
//       try {
//         const fd = buildFormDataFromRow(row);
//         const res = await propertiesAPI.createProperty(fd);
//         const item = (res?.data ?? res ?? null);
//         if (item) created.push(item);
//         ok++;
//       } catch (e: any) {
//         console.error("Import row error:", { row: row.__row, error: e });
//         fail++;
//       } finally {
//         const done = ok + fail;
//         setProgress({ total: rows.length, done, ok, fail });
//       }
//     };

//     const workers: Promise<void>[] = [];
//     for (let i = 0; i < concurrency; i++) {
//       workers.push(
//         (async function worker() {
//           while (cursor < rows.length && !abortRef.current.abort) {
//             if (paused) { await sleep(200); continue; }
//             const idx = cursor++;
//             await runOne(rows[idx]);
//           }
//         })()
//       );
//     }

//     await Promise.all(workers);
//     setImporting(false);

//     if (abortRef.current.abort) {
//       toast.info("Import cancelled.");
//     } else {
//       if (ok) toast.success(`Imported ${ok} properties`);
//       if (fail) toast.warn(`${fail} failed`);
//       if (created.length) onImport?.(created);   // <-- instant update to parent
//       onDone?.({ ok, fail });                    // <-- summary callback (parent may refetch)
//     }
//   };

//   const togglePause = () => setPaused(p => !p);
//   const cancelImport = () => { abortRef.current.abort = true; setPaused(false); };

//   /* ---------- template ---------- */
//   const downloadTemplate = () => {
//     const headers = [
//       "Property Type",
//       "Property Subtype",
//       "Unit Type",
//       "Furnishing",
//       "Parking Type",
//       "City",
//       "Location",
//       "Society Name",
//       "Carpet Area (sq.ft)",
//       "Budget",
//       "Status",
//       "Seller Name",
//     ].join(",");

//     const sample = [
//       [
//         "Residential", "Apartment", "2BHK", "Semi-Furnished", "Covered",
//         "Mumbai", "Bandra West", "Sea View Towers", "980", "18000000", "Available", "John Doe",
//       ].join(","),
//       [
//         "Residential", "Villa", "3BHK", "Fully-Furnished", "Open",
//         "Pune", "Koregaon Park", "Green Valley", "2200", "35000000", "Available", "Jane Smith",
//       ].join(","),
//     ].join("\n");

//     const csv = `${headers}\n${sample}`;
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "properties_template.csv";
//     a.click();
//     window.URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
//         {/* Header */}
//         <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900">Import Properties (Bulk)</h2>
//               <p className="text-gray-600 mt-1">
//                 Headers must be:
//                 <span className="ml-1 font-mono">
//                   Property Type, Property Subtype, Unit Type, Furnishing, Parking Type, City, Location, Society Name, Carpet Area (sq.ft), Budget, Status, Seller Name
//                 </span>
//               </p>
//             </div>
//             <button onClick={onClose} className="p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-lg">
//               <X size={20} />
//             </button>
//           </div>
//         </div>

//         <div className="p-6 max-h-[70vh] overflow-y-auto">
//           {/* Template */}
//           <div className="mb-6 bg-blue-50 rounded-xl p-4">
//             <div className="flex items-center justify-between gap-3">
//               <div>
//                 <h3 className="font-semibold text-blue-900">Download Template</h3>
//                 <p className="text-sm text-blue-700 mt-1">Use the exact header row for smooth import.</p>
//               </div>
//               <button
//                 onClick={downloadTemplate}
//                 className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 <Download size={16} />
//                 <span>Download Template</span>
//               </button>
//             </div>
//           </div>

//           {/* Upload */}
//           <div className="mb-6">
//             <div
//               className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
//                 }`}
//               onDragEnter={handleDrag}
//               onDragLeave={handleDrag}
//               onDragOver={handleDrag}
//               onDrop={handleDrop}
//             >
//               <input
//                 type="file"
//                 accept=".csv,.xlsx,.xls"
//                 onChange={handleFileInput}
//                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//               />
//               <div className="space-y-4">
//                 <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
//                   <Upload className="text-gray-600" size={24} />
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-900">
//                     {file ? file.name : "Drop your file here, or click to browse"}
//                   </h3>
//                   <p className="text-gray-500 mt-1">CSV/XLSX, max 10MB</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Processing */}
//           {isProcessing && (
//             <div className="mb-6 bg-yellow-50 rounded-xl p-4">
//               <div className="flex items-center space-x-3">
//                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
//                 <div>
//                   <h3 className="font-semibold text-yellow-900">Processing file...</h3>
//                   <p className="text-sm text-yellow-700">Parsing & validating your data</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Errors */}
//           {errors.length > 0 && (
//             <div className="mb-6 bg-red-50 rounded-xl p-4">
//               <div className="flex items-start space-x-3">
//                 <AlertCircle className="text-red-600 mt-0.5" size={20} />
//                 <div>
//                   <h3 className="font-semibold text-red-900">Import Errors</h3>
//                   <ul className="text-sm text-red-700 mt-1 space-y-1">
//                     {errors.map((error, index) => (
//                       <li key={index}>• {error}</li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Preview */}
//           {rows.length > 0 && (
//             <div className="mb-6">
//               <div className="flex items-center justify-between mb-3">
//                 <h3 className="text-lg font-semibold text-gray-900">Preview ({rows.length} rows)</h3>
//                 <div className="flex items-center gap-3 text-sm">
//                   <span className="flex items-center gap-1 text-green-700 font-semibold">
//                     <CheckCircle size={14} /> {validCount} valid
//                   </span>
//                   <span className="text-red-600 font-semibold">{invalidCount} invalid</span>
//                 </div>
//               </div>

//               <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto">
//                 <div className="space-y-2">
//                   {rows.slice(0, 30).map((r) => (
//                     <div key={r.__row} className="bg-white rounded-lg p-3 border">
//                       <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-sm">
//                         <div className="font-medium">
//                           {r.propertyType} • {r.propertySubtype} • {r.unitType}
//                         </div>
//                         <div className="text-gray-600">
//                           {r.city}, {r.location} • {r.societyName}
//                         </div>
//                         <div className="text-gray-600">
//                           {r.furnishing || "-"} {r.parkingType ? `• ${r.parkingType}` : ""}
//                         </div>
//                         <div className="text-gray-600">{r.carpetArea} sq.ft</div>
//                         <div className="text-green-700 font-semibold">
//                           ₹ {Number(r.budget || 0).toLocaleString("en-IN")}
//                         </div>
//                       </div>
//                       <div className="text-xs text-gray-500 mt-1">
//                         {r.status || "Available"} {r.seller ? `• Seller: ${r.seller}` : ""}
//                         {r.__errors.length > 0 && (
//                           <span className="text-red-600 ml-2">({r.__errors.join("; ")})</span>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                   {rows.length > 30 && (
//                     <div className="text-center text-gray-500 text-sm">
//                       ... and {rows.length - 30} more rows
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Import controls */}
//           {rows.length > 0 && (
//             <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border">
//               <div className="text-sm text-gray-700">
//                 Ready to import: <b>{validCount}</b> rows{" "}
//                 {invalidCount ? <span className="text-red-600">({invalidCount} invalid)</span> : null}
//               </div>
//               <div className="flex items-center gap-2">
//                 {!importing ? (
//                   <button
//                     onClick={startImport}
//                     disabled={!validCount}
//                     className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
//                   >
//                     <Home size={16} /> Import {validCount}
//                   </button>
//                 ) : (
//                   <>
//                     <button
//                       onClick={togglePause}
//                       className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg"
//                     >
//                       {paused ? <Play size={16} /> : <Pause size={16} />}
//                       {paused ? "Resume" : "Pause"}
//                     </button>
//                     <button
//                       onClick={cancelImport}
//                       className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg"
//                     >
//                       <RotateCw size={16} /> Cancel
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Progress */}
//           {importing && (
//             <div className="mt-4">
//               <div className="w-full bg-gray-200 rounded-full h-2">
//                 <div
//                   className="bg-green-600 h-2 rounded-full transition-all"
//                   style={{ width: progress.total ? `${(progress.done / progress.total) * 100}%` : "0%" }}
//                 />
//               </div>
//               <div className="mt-2 text-xs text-gray-600">
//                 {progress.done}/{progress.total} • <span className="text-green-700">OK: {progress.ok}</span> •{" "}
//                 <span className="text-red-600">Fail: {progress.fail}</span>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="p-6 border-t border-gray-200 bg-gray-50">
//           <div className="flex items-center justify-between">
//             <div className="text-sm text-gray-500">
//               {rows.length ? `${rows.length} rows loaded` : "No file selected"}
//             </div>
//             <div className="flex items-center space-x-3">
//               <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
//                 Close
//               </button>
//               {rows.length > 0 && !importing && validCount > 0 && (
//                 <button
//                   onClick={startImport}
//                   className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                 >
//                   <Home size={16} />
//                   <span>Import {validCount} Properties</span>
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ImportPropertiesModal;
