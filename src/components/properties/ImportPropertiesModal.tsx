// // src/components/properties/ImportPropertiesModal.tsx
// import React, {  useMemo, useRef, useState } from "react";
// import { X, Upload, Download, AlertCircle, Home, Play, Pause, RotateCw, CheckCircle } from "lucide-react";
// import Papa from "papaparse";
// import * as XLSX from "xlsx";
// // @ts-ignore - types for xlsx-js-style are not bundled; safe to import
// import * as XLSXStyle from "xlsx-js-style";
// import { toast } from "react-toastify";
// import { propertiesAPI } from "@/lib/propertiesAPI";

// /* ================= Budget helpers ================= */
// const RUPEE_PER_CRORE = 10_000_000;
// const RUPEE_PER_LAKH = 100_000;

// function parseBudgetToRupees(text?: string): number {
//   const raw = (text || "").trim().toLowerCase();
//   if (!raw) return 0;
//   const cleaned = raw.replace(/₹/g, "").replace(/\s+/g, "");
//   const digitsOnly = cleaned.replace(/,/g, "");
//   if (/^\d+$/.test(digitsOnly)) return parseInt(digitsOnly, 10) || 0;
//   const lakhMatch = cleaned.match(/^([\d,.]+)\s*l/);
//   if (lakhMatch) return Math.round(parseFloat(lakhMatch[1].replace(/,/g, "")) * RUPEE_PER_LAKH) || 0;
//   const croreMatch = cleaned.match(/^([\d,.]+)\s*(cr|c)/);
//   if (croreMatch) return Math.round(parseFloat(croreMatch[1].replace(/,/g, "")) * RUPEE_PER_CRORE) || 0;
//   const n = parseFloat(digitsOnly);
//   return Number.isNaN(n) ? 0 : Math.round(n);
// }

// const toNumberString = (val: any) => {
//   const n = parseBudgetToRupees(String(val ?? ""));
//   return n ? String(n) : "";
// };

// /* ================= Small utils ================= */
// const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
// const normalizeHeader = (h: string) =>
//   String(h || "")
//     .trim()
//     .toLowerCase()
//     .replace(/[._\-()/]/g, " ")
//     .replace(/\s+/g, " ")
//     .trim();

// const num = (v: any): number | "" => {
//   const s = String(v ?? "").trim();
//   if (!s) return "";
//   const n = Number(s.replace(/,/g, ""));
//   return Number.isFinite(n) ? n : "";
// };

// const int = (v: any): number | "" => {
//   const s = String(v ?? "").trim();
//   if (!s) return "";
//   const n = parseInt(s.replace(/,/g, ""), 10);
//   return Number.isFinite(n) ? n : "";
// };

// const monthIntSafe = (v: any): string => {
//   const s = String(v ?? "").trim().toLowerCase();
//   if (!s) return "";
//   const names = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
//   const idx = names.findIndex(n => s.startsWith(n));
//   if (idx >= 0) return String(idx + 1);
//   const asInt = parseInt(s, 10);
//   if (asInt >= 1 && asInt <= 12) return String(asInt);
//   return "";
// };

// function parseJSONorCSV(value: any): any[] {
//   const raw = String(value ?? "").trim();
//   if (!raw) return [];
//   try {
//     const parsed = JSON.parse(raw);
//     if (Array.isArray(parsed)) return parsed;
//     if (typeof parsed === "string" && parsed) return [parsed];
//   } catch {
//     return raw
//       .split(/[,;|]/)
//       .map((s) => s.trim())
//       .filter(Boolean);
//   }
//   return [];
// }

// /* ================= Types ================= */
// type CleanRow = {
//   seller?: string;

//   propertyType?: string;
//   propertySubtype?: string;
//   unitType?: string;
//   wing?: string;
//   unitNo?: string;

//   furnishing?: string;
//   bedrooms?: number | "";
//   bathrooms?: number | "";
//   facing?: string;

//   parkingType?: string;
//   parkingQty?: number | "";

//   city?: string;
//   location?: string;
//   societyName?: string;

//   floor?: string;
//   totalFloors?: string;

//   carpetArea?: number | "";
//   builtupArea?: number | "";

//   budget?: string;
//   priceType?: "Fixed" | "Negotiable" | "";
//   finalPrice?: string;

//   address?: string;
//   status?: string;
//   leadSource?: string;

//   possessionMonth?: string | "";
//   possessionYear?: number | "";
//   purchaseMonth?: string | "";
//   purchaseYear?: number | "";

//   sellingRights?: string;

//   amenities?: any[];
//   furnishingItems?: any[];
//   description?: string;
// };

// type ImportPreview = CleanRow & { __row: number; __errors: string[] };

// //
// // REQUIRED: only the red headers
// //
// const REQUIRED: (keyof CleanRow)[] = [
//   "propertyType",
//   "propertySubtype",
//   "unitType",
//   "city",
//   "location",
//   "societyName",
//   "carpetArea",
// ];

// /* ================= Header Map ================= */
// const HEADER_MAP: Record<string, keyof CleanRow> = {
//   "property type": "propertyType",
//   "property subtype": "propertySubtype",
//   "unit type": "unitType",
//   "wing": "wing",
//   "unit no": "unitNo",
//   "furnishing": "furnishing",
//   "bedrooms": "bedrooms",
//   "bathrooms": "bathrooms",
//   "facing": "facing",
//   "parking type": "parkingType",
//   "parking qty": "parkingQty",
//   "city": "city",
//   "location": "location",
//   "society name": "societyName",
//   "floor": "floor",
//   "total floors": "totalFloors",
//   "carpet area": "carpetArea",
//   "carpet area sq ft": "carpetArea",
//   "carpet area sqft": "carpetArea",
//   "builtup area": "builtupArea",
//   "budget": "budget",
//   "price type": "priceType",
//   "final price": "finalPrice",
//   "address": "address",
//   "status": "status",
//   "possession month": "possessionMonth",
//   "possession year": "possessionYear",
//   "purchase month": "purchaseMonth",
//   "purchase year": "purchaseYear",
//   "selling rights": "sellingRights",
//   "amenities": "amenities",
//   "furnishing items": "furnishingItems",
//   "description": "description",
//   "seller name": "seller",
//   "seller": "seller",

//   "property type name": "propertyType",
//   "property subtype name": "propertySubtype",
//   "unit no.": "unitNo",

//   "property_type_name": "propertyType",
//   "property_subtype_name": "propertySubtype",
//   "unit_type": "unitType",
//   "unit_no": "unitNo",
//   "furnishing_items": "furnishingItems",
//   "furnishing item": "furnishingItems",

//   "city_name": "city",
//   "location_name": "location",
//   "society_name": "societyName",

//   "parking_type": "parkingType",
//   "parking_qty": "parkingQty",

//   "carpet_area": "carpetArea",
//   "builtup_area": "builtupArea",
//   "price_type": "priceType",
//   "final_price": "finalPrice",

//   "lead_source": "leadSource",
//   "possession_month": "possessionMonth",
//   "possession_year": "possessionYear",
//   "purchase_month": "purchaseMonth",
//   "purchase_year": "purchaseYear",
//   "selling_rights": "sellingRights",
// };

// const PARTIAL_HEADER_MAP: Record<string, string> = {
//   "property t": "property type",
//   "property s": "property subtype",
//   "unit ty": "unit type",
//   "unit t": "unit type",
//   "parking ty": "parking type",
//   "carpet are": "carpet area",
//   "society na": "society name",
//   "seller na": "seller name",
// };

// function resolveHeaderKey(rawHeader: string): keyof CleanRow | undefined {
//   const h = normalizeHeader(rawHeader);
//   if (HEADER_MAP[h]) return HEADER_MAP[h];

//   const partial = Object.keys(PARTIAL_HEADER_MAP).find((p) => h.startsWith(p));
//   if (partial) {
//     const mappedReadable = PARTIAL_HEADER_MAP[partial];
//     return HEADER_MAP[mappedReadable];
//   }

//   const allKeys = Object.keys(HEADER_MAP);
//   const find1 = allKeys.find((k) => k.startsWith(h));
//   if (find1) return HEADER_MAP[find1];
//   const find2 = allKeys.find((k) => h.startsWith(k));
//   if (find2) return HEADER_MAP[find2];

//   return undefined;
// }

// /* ================= Component ================= */
// const ImportPropertiesModal = ({
//   isOpen,
//   onClose,
//   onDone,
//   onImport,
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
//     if (e.type === "dragenter" || e.type === "dragleave" || e.type === "dragover") {
//       setDragActive(e.type !== "dragleave");
//     }
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
//     const mapped: Record<string, any> = {};
//     for (const [k, v] of Object.entries(raw)) {
//       const nk = resolveHeaderKey(k);
//       if (nk) mapped[nk] = v;
//     }

//     const clean: CleanRow = {
//       seller: (mapped.seller ?? "").toString().trim(),

//       propertyType: (mapped.propertyType ?? "").toString().trim(),
//       propertySubtype: (mapped.propertySubtype ?? "").toString().trim(),
//       unitType: (mapped.unitType ?? "").toString().trim(),

//       wing: (mapped.wing ?? "").toString().trim(),
//       unitNo: (mapped.unitNo ?? "").toString().trim(),

//       furnishing: (mapped.furnishing ?? "").toString().trim(),
//       bedrooms: int(mapped.bedrooms),
//       bathrooms: int(mapped.bathrooms),
//       facing: (mapped.facing ?? "").toString().trim(),

//       parkingType: (mapped.parkingType ?? "").toString().trim(),
//       parkingQty: int(mapped.parkingQty),

//       city: (mapped.city ?? "").toString().trim(),
//       location: (mapped.location ?? "").toString().trim(),
//       societyName: (mapped.societyName ?? "").toString().trim(),

//       floor: (mapped.floor ?? "").toString().trim(),
//       totalFloors: (mapped.totalFloors ?? "").toString().trim(),

//       carpetArea: num(mapped.carpetArea),
//       builtupArea: num(mapped.builtupArea),

//       budget: toNumberString(mapped.budget),
//       priceType: ((): "Fixed" | "Negotiable" | "" => {
//         const s = String(mapped.priceType ?? "").trim();
//         if (!s) return "";
//         return /neg/i.test(s) ? "Negotiable" : "Fixed";
//       })(),
//       finalPrice: toNumberString(mapped.finalPrice),

//       address: (mapped.address ?? "").toString().trim(),
//       status: (mapped.status ?? "").toString().trim(),
//       leadSource: (mapped.leadSource ?? "").toString().trim(),

//       possessionMonth: monthIntSafe(mapped.possessionMonth),
//       possessionYear: int(mapped.possessionYear),
//       purchaseMonth: monthIntSafe(mapped.purchaseMonth),
//       purchaseYear: int(mapped.purchaseYear),

//       sellingRights: (mapped.sellingRights ?? "").toString().trim(),

//       amenities: parseJSONorCSV(mapped.amenities),
//       furnishingItems: parseJSONorCSV(mapped.furnishingItems),
//       description: (mapped.description ?? "").toString().trim(),
//     };

//     // Validate REQUIREDs (blocking). Only red headers.
//     const __errors: string[] = [];

//     const requiredChecks: Array<[keyof CleanRow, string, (v: any) => boolean]> = [
//       ["propertyType", "Property Type is required", (v) => !!String(v || "").trim()],
//       ["propertySubtype", "Property Subtype is required", (v) => !!String(v || "").trim()],
//       ["unitType", "Unit Type is required", (v) => !!String(v || "").trim()],
//       ["city", "City is required", (v) => !!String(v || "").trim()],
//       ["location", "Location is required", (v) => !!String(v || "").trim()],
//       ["societyName", "Society Name is required", (v) => !!String(v || "").trim()],
//       ["carpetArea", "Carpet Area is required", (v) => v !== "" && Number.isFinite(Number(v)) && Number(v) >= 0],
//     ];

//     for (const [key, msg, ok] of requiredChecks) {
//       if (!ok((clean as any)[key])) __errors.push(msg);
//     }

//     // Non-blocking sanity warnings
//     if (clean.carpetArea !== "" && Number(clean.carpetArea) < 0) __errors.push("Carpet Area < 0?");
//     if (clean.builtupArea !== "" && Number(clean.builtupArea) < 0) __errors.push("Built-up Area < 0?");
//     if (clean.finalPrice && Number(clean.finalPrice) < 0) __errors.push("Final Price < 0?");
//     if (clean.budget && Number(clean.budget) < 0) __errors.push("Budget < 0?");
//     if (typeof clean.possessionYear === "number" && (clean.possessionYear < 1900 || clean.possessionYear > 2100))
//       __errors.push("Possession Year looks invalid");
//     if (typeof clean.purchaseYear === "number" && (clean.purchaseYear < 1900 || clean.purchaseYear > 2100))
//       __errors.push("Purchase Year looks invalid");

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

//   /* ---------- helpers for validation ---------- */
//   const isRowValid = (r: ImportPreview) =>
//     r.__errors.filter((e) => /required/i.test(e)).length === 0;

//   const validRows = useMemo(() => rows.filter(isRowValid), [rows]);
//   const validCount = validRows.length;
//   const invalidCount = rows.length - validCount;

//   /* ---------- payload builder ---------- */
//   function buildFormDataFromRow(r: CleanRow): FormData {
//     const fd = new FormData();

//     const now = new Date();
//     const defaultMonth = String(now.getMonth() + 1);
//     const defaultYear = String(now.getFullYear());

//     const map: Record<string, any> = {
//       seller: r.seller || "",

//       propertyType: r.propertyType || "",
//       propertySubtype: r.propertySubtype || "",
//       unitType: r.unitType || "",

//       wing: r.wing || "",
//       unitNo: r.unitNo || "",

//       furnishing: r.furnishing || "",
//       bedrooms: r.bedrooms === "" ? "" : String(r.bedrooms),
//       bathrooms: r.bathrooms === "" ? "" : String(r.bathrooms),
//       facing: r.facing || "",

//       parkingType: r.parkingType || "",
//       parkingQty: r.parkingQty === "" ? "" : String(r.parkingQty),

//       city: r.city || "",
//       location: r.location || "",
//       society: r.societyName || "",
//       society_name: r.societyName || "",

//       floor: r.floor || "",
//       totalFloors: r.totalFloors || "",

//       carpetArea: r.carpetArea === "" ? "" : String(r.carpetArea),
//       builtupArea: r.builtupArea === "" ? "" : String(r.builtupArea),

//       budget: r.budget || "",
//       priceType: r.priceType || "Fixed",
//       finalPrice: r.finalPrice || "",

//       address: r.address || "",
//       status: r.status || "Available",
//       leadSource: r.leadSource || "",

//       possessionMonth: r.possessionMonth || defaultMonth,
//       possessionYear: r.possessionYear === "" ? defaultYear : String(r.possessionYear),
//       purchaseMonth: r.purchaseMonth || defaultMonth,
//       purchaseYear: r.purchaseYear === "" ? defaultYear : String(r.purchaseYear),

//       sellingRights: r.sellingRights || "Standard",

//       description: r.description || "",
//     };

//     Object.entries(map).forEach(([k, v]) => fd.append(k, v));
//     fd.append("amenities", JSON.stringify(r.amenities ?? []));
//     fd.append("furnishingItems", JSON.stringify(r.furnishingItems ?? []));
//     fd.append("nearby_places", JSON.stringify([]));

//     return fd;
//   }

//   /* ---------- import runner (only valid rows) ---------- */
//   const startImport = async () => {
//     if (!rows.length) return toast.error("No data to import");

//     if (validCount === 0) {
//       return toast.error("No valid rows to import. Fix required fields shown in red headers.");
//     }

//     setImporting(true);
//     setPaused(false);
//     abortRef.current.abort = false;

//     const toImport = validRows; // only valid ones
//     setProgress({ total: toImport.length, done: 0, ok: 0, fail: 0 });

//     const concurrency = 3;
//     let cursor = 0;
//     let ok = 0;
//     let fail = 0;

//     const runOne = async (row: ImportPreview) => {
//       try {
//         const fd = buildFormDataFromRow(row);
//         await propertiesAPI.createProperty(fd);
//         ok++;
//       } catch (e: any) {
//         console.error("Import row error:", { row: row.__row, error: e });
//         fail++;
//       } finally {
//         const done = ok + fail;
//         setProgress({ total: toImport.length, done, ok, fail });
//       }
//     };

//     const workers: Promise<void>[] = [];
//     for (let i = 0; i < concurrency; i++) {
//       workers.push(
//         (async function worker() {
//           while (cursor < toImport.length && !abortRef.current.abort) {
//             if (paused) { await sleep(200); continue; }
//             const idx = cursor++;
//             await runOne(toImport[idx]);
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
//       if (invalidCount > 0) toast.info(`${invalidCount} rows skipped (missing required fields)`);
//       onDone?.({ ok, fail });
//       onImport?.([]);
//     }
//   };

//   const togglePause = () => setPaused((p) => !p);
//   const cancelImport = () => { abortRef.current.abort = true; setPaused(false); };

//   /* ---------- Template (readable headers) ---------- */
//   const TEMPLATE_HEADERS_READABLE: string[] = [
//     "Property Type",
//     "Property Subtype",
//     "Unit Type",
//     "Wing",
//     "Unit No",

//     "Furnishing",
//     "Bedrooms",
//     "Bathrooms",
//     "Facing",

//     "Parking Type",
//     "Parking Qty",

//     "City",
//     "Location",
//     "Society Name",

//     "Floor",
//     "Total Floors",
//     "Carpet Area",
//     "Builtup Area",

//     "Budget",
//     "Price Type",
//     "Final Price",

//     "Address",
//     "Status",

//     "Possession Month",
//     "Possession Year",
//     "Purchase Month",
//     "Purchase Year",

//     "Selling Rights",

//     "Amenities",
//     "Furnishing Items",
//     "Description",

//     "Seller Name",
//   ];

//   // Chips me red (same as REQUIRED list)
//   const IMPORTANT_HEADERS_READABLE = new Set([
//     "property type",
//     "property subtype",
//     "unit type",
//     "city",
//     "location",
//     "society name",
//     "carpet area",
//   ]);

//   const csvEscape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;

//   // --- Styled Excel (.xlsx) template: only selected headers' TEXT in red ---
//   const downloadTemplate = () => {
//     try {
//       const baseHeaderStyle = {
//         font: { bold: true, color: { rgb: "FF000000" } }, // black
//         alignment: { horizontal: "center", vertical: "center", wrapText: true },
//         border: {
//           top: { style: "thin", color: { rgb: "FFDDDDDD" } },
//           bottom: { style: "thin", color: { rgb: "FFDDDDDD" } },
//           left: { style: "thin", color: { rgb: "FFDDDDDD" } },
//           right: { style: "thin", color: { rgb: "FFDDDDDD" } },
//         },
//       };

//       const normalStyle = { alignment: { vertical: "center" as const } };

//       const sample1 = [
//         "Residential", "Apartment", "2BHK", "A", "1204",
//         "Semi-Furnished", "2", "2", "East",
//         "Covered", "1",
//         "Mumbai", "Bandra West", "Sea View Towers",
//         "12", "22", "980", "1050",
//         "18000000", "Fixed", "",
//         "Near Joggers Park", "Available",
//         "Nov", "2025", "Jan", "2023",
//         "Standard",
//         '["Gym","Lift","Security"]',
//         '["Wardrobe","Modular Kitchen"]',
//         "Well maintained apartment with sea breeze.",
//         "John Doe"
//       ];

//       const sample2 = [
//         "Residential", "Villa", "3BHK", "", "",
//         "Fully-Furnished", "3", "4", "North",
//         "Open", "2",
//         "Pune", "Koregaon Park", "Green Valley",
//         "", "", "2200", "2600",
//         "35000000", "Negotiable", "34000000",
//         "", "Available",
//         "12", "2025", "6", "2020",
//         "Exclusive",
//         "Gym, Pool, Clubhouse",
//         "Bed, Sofa, AC",
//         "Corner villa with large garden.",
//         "Jane Smith"
//       ];

//       const data = [TEMPLATE_HEADERS_READABLE, sample1, sample2];

//       const ws = XLSXStyle.utils.aoa_to_sheet(data);

//       ws["!cols"] = TEMPLATE_HEADERS_READABLE.map((h) => ({ wch: Math.max(12, Math.min(28, h.length + 2)) }));

//       // Base header style first
//       for (let c = 0; c < TEMPLATE_HEADERS_READABLE.length; c++) {
//         const cellRef = XLSX.utils.encode_cell({ r: 0, c });
//         if (!ws[cellRef]) continue;
//         ws[cellRef].s = baseHeaderStyle as any;
//       }

//       // Red text for required headers
//       const RED_SET = new Set([
//         "property type",
//         "property subtype",
//         "unit type",
//         "city",
//         "location",
//         "society name",
//         "carpet area",
//       ]);

//       for (let c = 0; c < TEMPLATE_HEADERS_READABLE.length; c++) {
//         const header = TEMPLATE_HEADERS_READABLE[c];
//         if (RED_SET.has(header.toLowerCase())) {
//           const cellRef = XLSX.utils.encode_cell({ r: 0, c });
//           if (!ws[cellRef]) continue;
//           ws[cellRef].s = {
//             ...baseHeaderStyle,
//             font: { ...(baseHeaderStyle as any).font, color: { rgb: "FFFF0000" } }, // red text
//           } as any;
//         }
//       }

//       // Data rows
//       for (let r = 1; r < data.length; r++) {
//         for (let c = 0; c < data[r].length; c++) {
//           const cellRef = XLSX.utils.encode_cell({ r, c });
//           if (!ws[cellRef]) continue;
//           ws[cellRef].s = normalStyle as any;
//         }
//       }

//       const wb = XLSXStyle.utils.book_new();
//       XLSXStyle.utils.book_append_sheet(wb, ws, "Properties Template");
//       XLSXStyle.writeFile(wb, "properties_template.xlsx");
//     } catch (err) {
//       console.warn("xlsx-js-style failed; falling back to CSV", err);
//       const headers = TEMPLATE_HEADERS_READABLE.map(csvEscape).join(",");
//       const row1 = [
//         "Residential", "Apartment", "2BHK", "A", "1204",
//         "Semi-Furnished", "2", "2", "East",
//         "Covered", "1",
//         "Mumbai", "Bandra West", "Sea View Towers",
//         "12", "22", "980", "1050",
//         "18000000", "Fixed", "",
//         "Near Joggers Park", "Available",
//         "Nov", "2025", "Jan", "2023",
//         "Standard",
//         '["Gym","Lift","Security"]',
//         '["Wardrobe","Modular Kitchen"]',
//         "Well maintained apartment with sea breeze.",
//         "John Doe"
//       ].map(csvEscape).join(",");
//       const row2 = [
//         "Residential", "Villa", "3BHK", "", "",
//         "Fully-Furnished", "3", "4", "North",
//         "Open", "2",
//         "Pune", "Koregaon Park", "Green Valley",
//         "", "", "2200", "2600",
//         "35000000", "Negotiable", "34000000",
//         "", "Available",
//         "12", "2025", "6", "2020",
//         "Exclusive",
//         "Gym, Pool, Clubhouse",
//         "Bed, Sofa, AC",
//         "Corner villa with large garden.",
//         "Jane Smith"
//       ].map(csvEscape).join(",");
//       const csv = `${headers}\n${row1}\n${row2}`;
//       const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = "properties_template.csv";
//       a.click();
//       window.URL.revokeObjectURL(url);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
//         {/* Header */}
//         <div className="px-6 py-2 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900">Import Properties (Bulk)</h2>
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
//               <div className="min-w-0">
//                 <h3 className="font-semibold text-blue-900">Download Template</h3>
              
//               </div>
//               <button
//                 onClick={downloadTemplate}
//                 className="flex-shrink-0 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 <Download size={16} />
//                 <span>Download Template</span>
//               </button>
//             </div>
//           </div>

//           {/* Upload */}
//           <div className="mb-6">
//             <div
//               className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
//                 dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
//               }`}
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

//           {/* Errors (file-level) */}
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
//                     <CheckCircle size={14} /> {validCount} ready
//                   </span>
//                   <span className="text-red-600 font-semibold">{invalidCount} invalid</span>
//                 </div>
//               </div>

//               <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto">
//                 <div className="space-y-2">
//                   {rows.slice(0, 30).map((r) => {
//                     const rowIsValid = isRowValid(r);
//                     return (
//                       <div key={r.__row} className={`rounded-lg p-3 border ${rowIsValid ? "bg-white" : "bg-red-50 border-red-200"}`}>
//                         <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-sm">
//                           <div className="font-medium">
//                             {(r.propertyType || "-")} • {(r.propertySubtype || "-")} • {(r.unitType || "-")}
//                           </div>
//                           <div className="text-gray-600">
//                             {(r.city || "-")}{r.location ? `, ${r.location}` : ""} • {(r.societyName || "-")}
//                           </div>
//                           <div className="text-gray-600">
//                             {(r.furnishing || "-")}
//                             {r.parkingType ? ` • ${r.parkingType}` : ""}
//                             {r.parkingQty !== "" ? ` x${r.parkingQty}` : ""}
//                           </div>
//                           <div className="text-gray-600">
//                             {r.carpetArea !== "" ? `${r.carpetArea} sq.ft` : "-"}
//                             {r.bedrooms !== "" ? ` • ${r.bedrooms} BR` : ""}
//                             {r.bathrooms !== "" ? `/${r.bathrooms} Bath` : ""}
//                           </div>
//                           <div className="text-green-700 font-semibold">
//                             ₹ {Number(r.budget || 0).toLocaleString("en-IN")}
//                             {r.priceType ? ` • ${r.priceType}` : ""}
//                           </div>
//                         </div>
//                         <div className="text-xs mt-1">
//                           <span className="text-gray-500">
//                             {(r.status || "Available")}{r.seller ? ` • Seller: ${r.seller}` : ""}
//                           </span>
//                           {r.__errors.length > 0 && (
//                             <ul className="mt-1 text-red-600 list-disc list-inside">
//                               {r.__errors.map((e, i) => (
//                                 <li key={i}>{e}</li>
//                               ))}
//                             </ul>
//                           )}
//                         </div>
//                         {r.description ? (
//                           <div className="text-xs text-gray-600 mt-1 line-clamp-2">{r.description}</div>
//                         ) : null}
//                       </div>
//                     );
//                   })}
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
//             <div className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-xl border">
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
//                   style={{ width: progress.total ? `${(progress.done / progress.total) * 100}%` : "0%" } as any}
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
//         <div className="px-6 py-2 border-t border-gray-200 bg-gray-50">
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



// src/components/properties/ImportPropertiesModal.tsx
import React, { useMemo, useRef, useState } from "react";
import { X, Upload, Download, AlertCircle, Home, Play, Pause, RotateCw, CheckCircle, FileSpreadsheet, FileText } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
// @ts-ignore - types for xlsx-js-style are not bundled; safe to import
import * as XLSXStyle from "xlsx-js-style";
import { toast } from "react-toastify";
import { propertiesAPI } from "@/lib/propertiesAPI";
import Button from "@/components/ui/Button";

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
  const names = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
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
};

type ImportPreview = CleanRow & { __row: number; __errors: string[] };

const REQUIRED: (keyof CleanRow)[] = [
  "propertyType",
  "propertySubtype",
  "unitType",
  "city",
  "location",
  "societyName",
  "carpetArea",
];

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
    };

    const __errors: string[] = [];

    const requiredChecks: Array<[keyof CleanRow, string, (v: any) => boolean]> = [
      ["propertyType", "Property Type is required", (v) => !!String(v || "").trim()],
      ["propertySubtype", "Property Subtype is required", (v) => !!String(v || "").trim()],
      ["unitType", "Unit Type is required", (v) => !!String(v || "").trim()],
      ["city", "City is required", (v) => !!String(v || "").trim()],
      ["location", "Location is required", (v) => !!String(v || "").trim()],
      ["societyName", "Society Name is required", (v) => !!String(v || "").trim()],
      ["carpetArea", "Carpet Area is required", (v) => v !== "" && Number.isFinite(Number(v)) && Number(v) >= 0],
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

  const isRowValid = (r: ImportPreview) =>
    r.__errors.filter((e) => /required/i.test(e)).length === 0;

  const validRows = useMemo(() => rows.filter(isRowValid), [rows]);
  const validCount = validRows.length;
  const invalidCount = rows.length - validCount;

  function buildFormDataFromRow(r: CleanRow): FormData {
    const fd = new FormData();
    const now = new Date();
    const defaultMonth = String(now.getMonth() + 1);
    const defaultYear = String(now.getFullYear());

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

    setImporting(true);
    setPaused(false);
    abortRef.current.abort = false;

    const toImport = validRows;
    setProgress({ total: toImport.length, done: 0, ok: 0, fail: 0 });

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
            await runOne(toImport[idx]);
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
    }
  };

  const togglePause = () => setPaused((p) => !p);
  const cancelImport = () => { abortRef.current.abort = true; setPaused(false); };

  const TEMPLATE_HEADERS_READABLE: string[] = [
    "Property Type", "Property Subtype", "Unit Type", "Wing", "Unit No",
    "Furnishing", "Bedrooms", "Bathrooms", "Facing", "Parking Type", "Parking Qty",
    "City", "Location", "Society Name", "Floor", "Total Floors", "Carpet Area", "Builtup Area",
    "Budget", "Price Type", "Final Price", "Address", "Status",
    "Possession Month", "Possession Year", "Purchase Month", "Purchase Year",
    "Selling Rights", "Amenities", "Furnishing Items", "Description", "Seller Name",
  ];

  const IMPORTANT_HEADERS_READABLE = new Set([
    "property type", "property subtype", "unit type", "city", "location", "society name", "carpet area"
  ]);

  // const downloadTemplate = () => {
  //   try {
  //     const baseHeaderStyle = {
  //       font: { bold: true, color: { rgb: "FF000000" } },
  //       alignment: { horizontal: "center", vertical: "center", wrapText: true },
  //       border: {
  //         top: { style: "thin", color: { rgb: "FFDDDDDD" } },
  //         bottom: { style: "thin", color: { rgb: "FFDDDDDD" } },
  //         left: { style: "thin", color: { rgb: "FFDDDDDD" } },
  //         right: { style: "thin", color: { rgb: "FFDDDDDD" } },
  //       },
  //     };

  //     const normalStyle = { alignment: { vertical: "center" as const } };

  //     const sample1 = [
  //       "Residential", "Apartment", "2BHK", "A", "1204",
  //       "Semi-Furnished", "2", "2", "East",
  //       "Covered", "1",
  //       "Mumbai", "Bandra West", "Sea View Towers",
  //       "12", "22", "980", "1050",
  //       "18000000", "Fixed", "",
  //       "Near Joggers Park", "Available",
  //       "Nov", "2025", "Jan", "2023",
  //       "Standard",
  //       '["Gym","Lift","Security"]',
  //       '["Wardrobe","Modular Kitchen"]',
  //       "Well maintained apartment with sea breeze.",
  //       "John Doe"
  //     ];

  //     const sample2 = [
  //       "Residential", "Villa", "3BHK", "", "",
  //       "Fully-Furnished", "3", "4", "North",
  //       "Open", "2",
  //       "Pune", "Koregaon Park", "Green Valley",
  //       "", "", "2200", "2600",
  //       "35000000", "Negotiable", "34000000",
  //       "", "Available",
  //       "12", "2025", "6", "2020",
  //       "Exclusive",
  //       "Gym, Pool, Clubhouse",
  //       "Bed, Sofa, AC",
  //       "Corner villa with large garden.",
  //       "Jane Smith"
  //     ];

  //     const data = [TEMPLATE_HEADERS_READABLE, sample1, sample2];
  //     const ws = XLSXStyle.utils.aoa_to_sheet(data);
  //     ws["!cols"] = TEMPLATE_HEADERS_READABLE.map((h) => ({ wch: Math.max(12, Math.min(28, h.length + 2)) }));

  //     for (let c = 0; c < TEMPLATE_HEADERS_READABLE.length; c++) {
  //       const cellRef = XLSX.utils.encode_cell({ r: 0, c });
  //       if (!ws[cellRef]) continue;
  //       ws[cellRef].s = baseHeaderStyle as any;
  //     }

  //     const RED_SET = new Set([
  //       "property type", "property subtype", "unit type", "city", "location", "society name", "carpet area"
  //     ]);

  //     for (let c = 0; c < TEMPLATE_HEADERS_READABLE.length; c++) {
  //       const header = TEMPLATE_HEADERS_READABLE[c];
  //       if (RED_SET.has(header.toLowerCase())) {
  //         const cellRef = XLSX.utils.encode_cell({ r: 0, c });
  //         if (!ws[cellRef]) continue;
  //         ws[cellRef].s = {
  //           ...baseHeaderStyle,
  //           font: { ...(baseHeaderStyle as any).font, color: { rgb: "FFFF0000" } },
  //         } as any;
  //       }
  //     }

  //     for (let r = 1; r < data.length; r++) {
  //       for (let c = 0; c < data[r].length; c++) {
  //         const cellRef = XLSX.utils.encode_cell({ r, c });
  //         if (!ws[cellRef]) continue;
  //         ws[cellRef].s = normalStyle as any;
  //       }
  //     }

  //     const wb = XLSXStyle.utils.book_new();
  //     XLSXStyle.utils.book_append_sheet(wb, ws, "Properties Template");
  //     XLSXStyle.writeFile(wb, "properties_template.xlsx");
  //   } catch (err) {
  //     console.warn("xlsx-js-style failed; falling back to CSV", err);
  //     const headers = TEMPLATE_HEADERS_READABLE.map(v => `"${v.replace(/"/g, '""')}"`).join(",");
  //     const row1 = sample1.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",");
  //     const row2 = sample2.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",");
  //     const csv = `${headers}\n${row1}\n${row2}`;
  //     const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = "properties_template.csv";
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //   }
  // };


  const downloadTemplate = () => {
  // Define sample data outside try-catch so it's available in catch as well
  const sample1 = [
    "Residential", "Apartment", "2BHK", "A", "1204",
    "Semi-Furnished", "2", "2", "East",
    "Covered", "1",
    "Mumbai", "Bandra West", "Sea View Towers",
    "12", "22", "980", "1050",
    "18000000", "Fixed", "",
    "Near Joggers Park", "Available",
    "Nov", "2025", "Jan", "2023",
    "Standard",
    '["Gym","Lift","Security"]',
    '["Wardrobe","Modular Kitchen"]',
    "Well maintained apartment with sea breeze.",
    "John Doe"
  ];

  const sample2 = [
    "Residential", "Villa", "3BHK", "", "",
    "Fully-Furnished", "3", "4", "North",
    "Open", "2",
    "Pune", "Koregaon Park", "Green Valley",
    "", "", "2200", "2600",
    "35000000", "Negotiable", "34000000",
    "", "Available",
    "12", "2025", "6", "2020",
    "Exclusive",
    "Gym, Pool, Clubhouse",
    "Bed, Sofa, AC",
    "Corner villa with large garden.",
    "Jane Smith"
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

    const data = [TEMPLATE_HEADERS_READABLE, sample1, sample2];

    const ws = XLSXStyle.utils.aoa_to_sheet(data);
    ws["!cols"] = TEMPLATE_HEADERS_READABLE.map((h) => ({ wch: Math.max(12, Math.min(28, h.length + 2)) }));

    for (let c = 0; c < TEMPLATE_HEADERS_READABLE.length; c++) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c });
      if (!ws[cellRef]) continue;
      ws[cellRef].s = baseHeaderStyle as any;
    }

    const RED_SET = new Set([
      "property type", "property subtype", "unit type", "city", "location", "society name", "carpet area"
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
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Compact Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b" style={{ backgroundColor: '#0f2b3d' }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/10">
              <Home size={16} className="text-white" />
            </div>
            <h2 className="text-sm font-semibold text-white">Import Properties</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white">
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Template Download - Compact Card */}
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-orange-600" />
                <div>
                  <h3 className="text-xs font-semibold text-orange-800">Need a template?</h3>
                  <p className="text-[10px] text-orange-600">Download sample file with headers</p>
                </div>
              </div>
              <Button
                onClick={downloadTemplate}
                variant="outline"
                size="sm"
                className="text-xs py-1 px-3 border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                <Download size={12} className="mr-1" />
                Download Template
              </Button>
            </div>
          </div>

          {/* Upload Area */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Upload File</label>
            <div
              className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                dragActive ? "border-orange-500 bg-orange-50" : "border-gray-300 hover:border-orange-400"
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
              <Upload size={20} className="mx-auto text-gray-400 mb-2" />
              <p className="text-xs text-gray-600">
                {file ? file.name : "Drop your file here, or click to browse"}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">Supports CSV, XLSX, XLS</p>
            </div>
          </div>

          {/* Processing State */}
          {isProcessing && (
            <div className="bg-yellow-50 rounded-lg p-3 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
              <span className="text-xs text-yellow-700">Processing file...</span>
            </div>
          )}

          {/* File Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-red-800">File Errors</p>
                  <ul className="text-[10px] text-red-700 mt-1 space-y-0.5">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Preview Section */}
          {rows.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-700">Preview</h3>
                <div className="flex gap-2 text-[10px]">
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle size={10} /> {validCount} valid
                  </span>
                  <span className="text-red-600">{invalidCount} invalid</span>
                  <span className="text-gray-500">| Total: {rows.length}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg border max-h-48 overflow-y-auto">
                {rows.slice(0, 20).map((r) => {
                  const rowIsValid = isRowValid(r);
                  return (
                    <div key={r.__row} className={`p-2 border-b text-xs ${rowIsValid ? "bg-white" : "bg-red-50"}`}>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div>
                          <span className="text-gray-500">Type:</span>{" "}
                          <span className="font-medium">{r.propertyType || "-"} / {r.propertySubtype || "-"}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Location:</span>{" "}
                          <span>{r.city || "-"}{r.location ? `, ${r.location}` : ""}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Area:</span>{" "}
                          <span>{r.carpetArea !== "" ? `${r.carpetArea} sq.ft` : "-"}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Budget:</span>{" "}
                          <span className="text-green-600 font-medium">
                            ₹ {Number(r.budget || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                      {r.__errors.length > 0 && (
                        <ul className="mt-1 text-red-500 text-[9px] list-disc list-inside">
                          {r.__errors.slice(0, 3).map((e, i) => (
                            <li key={i}>{e}</li>
                          ))}
                          {r.__errors.length > 3 && <li>+{r.__errors.length - 3} more errors</li>}
                        </ul>
                      )}
                    </div>
                  );
                })}
                {rows.length > 20 && (
                  <div className="p-2 text-center text-[10px] text-gray-500 border-t">
                    + {rows.length - 20} more rows
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Import Progress */}
          {importing && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Importing...</span>
                <span>{progress.done}/{progress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-green-600 h-1.5 rounded-full transition-all"
                  style={{ width: progress.total ? `${(progress.done / progress.total) * 100}%` : "0%" }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>✅ Success: {progress.ok}</span>
                <span>❌ Failed: {progress.fail}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t flex justify-end gap-2 bg-gray-50">
          <Button variant="outline" onClick={onClose} size="sm">
            Cancel
          </Button>
          {!importing && rows.length > 0 && validCount > 0 && (
            <Button onClick={startImport} size="sm" style={{ backgroundColor: '#e67e22' }} className="text-white">
              <Home size={14} className="mr-1" />
              Import {validCount} Properties
            </Button>
          )}
          {importing && (
            <>
              <Button onClick={togglePause} size="sm" variant="outline">
                {paused ? <Play size={12} className="mr-1" /> : <Pause size={12} className="mr-1" />}
                {paused ? "Resume" : "Pause"}
              </Button>
              <Button onClick={cancelImport} size="sm" variant="outline" className="text-red-600 border-red-300">
                <RotateCw size={12} className="mr-1" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportPropertiesModal;