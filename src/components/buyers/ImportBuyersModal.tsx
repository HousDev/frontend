import React, { useState } from "react";
import { X, Upload, Download, AlertCircle, CheckCircle, Users } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
// import your API and toast helpers

import { toast } from "react-toastify";
import { buyerAPI } from "@/lib/buyerAPI";

const ImportBuyersModal = ({ isOpen, onClose, onImportComplete }: any) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [skippedRows, setSkippedRows] = useState<any[]>([]);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  };

  const handleFile = (selectedFile: File) => {
    const name = selectedFile.name.toLowerCase();
    if (!name.endsWith(".csv") && !name.endsWith(".xlsx") && !name.endsWith(".xls")) {
      alert("Please select a CSV or Excel file");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("File exceeds maximum size of 10MB");
      return;
    }
    setFile(selectedFile);
    processFile(selectedFile);
  };

  // helper: safely parse JSON-like cell values (handles extra wrapping quotes/backslashes)
const safeJsonParse = (v: any) => {
  if (v === undefined || v === null) return undefined;
  if (typeof v === "object") return v;
  let s = String(v).trim();

  // remove wrapping single quotes if present:  ' {...} '
  if (s.startsWith("'") && s.endsWith("'")) {
    s = s.slice(1, -1).trim();
  }
  // remove wrapping double quotes if they wrap the entire JSON (common when CSV quotes JSON)
  if (s.startsWith('"') && s.endsWith('"')) {
    s = s.slice(1, -1);
  }

  // unescape common escape sequences like \" (from CSV)
  s = s.replace(/\\"/g, '"').replace(/\\'/g, "'");

  try {
    return JSON.parse(s);
  } catch (err) {
    // not valid JSON — try to interpret simple arrays like a,b,c
    if (s.includes(",") && !s.includes("{")) {
      return s.split(",").map((p) => p.trim()).filter(Boolean);
    }
    // Fallback: return original string
    return s;
  }
};

// replacement normalizeRow that handles requirements, financials, budgets robustly
const normalizeRow = (row: any, rowIndex?: number) => {
  const normalized: Record<string, any> = {};
  Object.keys(row || {}).forEach((k) => {
    normalized[String(k).trim().toLowerCase()] = row[k];
  });

  const toNumber = (v: any) => {
    if (v === undefined || v === null || v === "") return undefined;
    // remove commas/currency symbols etc.
    const cleaned = String(v).replace(/[^\d.-]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : undefined;
  };

  // find budget fields with flexibility
  const budgetMinCandidates = [
    "budgetmin", "budget_min", "budget min", "budget_minimum", "minbudget", "budgetmin_inr"
  ];
  const budgetMaxCandidates = [
    "budgetmax", "budget_max", "budget max", "budget_maximum", "maxbudget", "budgetmax_inr"
  ];

  let budgetMin: number | undefined;
  let budgetMax: number | undefined;

  for (const k of budgetMinCandidates) {
    if (normalized[k] !== undefined) {
      budgetMin = toNumber(normalized[k]);
      break;
    }
  }
  for (const k of budgetMaxCandidates) {
    if (normalized[k] !== undefined) {
      budgetMax = toNumber(normalized[k]);
      break;
    }
  }

  // sometimes CSV has columns reversed or both present in different names
  // also try swapped guess: if one exists and second exists under alt name
  if (budgetMin === undefined && budgetMax !== undefined) {
    // try to see if original had them reversed (rare) — keep as-is for now
  }
  // if only one numeric value present in other ambiguous columns, try to parse
  if ((budgetMin === undefined && budgetMax === undefined)) {
    // look for any numeric-looking columns named budget or amount
    const possible = Object.keys(normalized).filter(k => /budget|amount|min|max/i.test(k));
    for (const k of possible) {
      const val = toNumber(normalized[k]);
      if (val !== undefined) {
        if (budgetMin === undefined) budgetMin = val;
        else if (budgetMax === undefined) budgetMax = val;
      }
    }
  }

  // ensure min <= max
  if (budgetMin !== undefined && budgetMax !== undefined && budgetMin > budgetMax) {
    const temp = budgetMin; budgetMin = budgetMax; budgetMax = temp;
  }

  // parse requirements & financials as JSON if present
  const rawRequirements = normalized["requirements"] ?? normalized["requirement"] ?? normalized["propertyrequirements"];
  const rawFinancials = normalized["financials"] ?? normalized["finance"] ?? normalized["financial"];

  const requirementsParsed = safeJsonParse(rawRequirements);
  const financialsParsed = safeJsonParse(rawFinancials);

  // normalize arrays inside requirements if they are string lists
  const ensureArray = (v: any) => {
    if (v === undefined || v === null) return [];
    if (Array.isArray(v)) return v;
    if (typeof v === "string") return v.split(",").map(s => s.trim()).filter(Boolean);
    return [v];
  };

  const buyer: any = {
    salutation: normalized["salutation"] ?? undefined,
    name: (normalized["name"] ?? normalized["full name"] ?? "").toString().trim(),
    phone: (normalized["phone"] ?? normalized["mobile"] ?? normalized["contact"] ?? "").toString().trim(),
    whatsapp_number: (normalized["whatsapp_number"] ?? normalized["whatsapp"] ?? "").toString().trim(),
    email: (normalized["email"] ?? "").toString().trim(),
    state: normalized["state"] ?? undefined,
    city: normalized["city"] ?? undefined,
    location: normalized["location"] ?? undefined,
    buyer_lead_priority: normalized["buyer_lead_priority"] ?? normalized["priority"] ?? undefined,
    buyer_lead_source: normalized["buyer_lead_source"] ?? normalized["source"] ?? undefined,
    buyer_lead_stage: normalized["buyer_lead_stage"] ?? normalized["stage"] ?? undefined,
    buyer_lead_status: normalized["buyer_lead_status"] ?? normalized["status"] ?? undefined,
    budget: { min: budgetMin, max: budgetMax },
    // prefer parsed JSON object, otherwise try to build from columns
    requirements: (() => {
      if (requirementsParsed && typeof requirementsParsed === "object") {
        // ensure arrays inside
        if (requirementsParsed.unitTypes) requirementsParsed.unitTypes = ensureArray(requirementsParsed.unitTypes);
        if (requirementsParsed.preferredLocations) requirementsParsed.preferredLocations = ensureArray(requirementsParsed.preferredLocations);
        return requirementsParsed;
      }
      // fallback to columns
      return {
        propertyType: normalized["propertytype"] ?? normalized["property_type"] ?? undefined,
        unitTypes: ensureArray(normalized["unittype"] ?? normalized["unit_type"] ?? normalized["unittype(s)"]),
        preferredLocations: ensureArray(normalized["preferredlocations"] ?? normalized["preferred_locations"] ?? normalized["preferred locations"]),
        furnishing: normalized["furnishing"] ?? undefined,
        possession: normalized["possession"] ?? undefined,
      };
    })(),
    financials: (() => {
      if (financialsParsed && typeof financialsParsed === "object") return financialsParsed;
      // fallback to detect some columns
      const f: any = {};
      if (normalized["loanamount"]) f.loanAmount = toNumber(normalized["loanamount"]);
      if (normalized["loan_status"] || normalized["loanstatus"]) f.loanStatus = normalized["loan_status"] ?? normalized["loanstatus"];
      if (normalized["creditscore"]) f.creditScore = toNumber(normalized["creditscore"]);
      if (normalized["downpayment"]) f.downPayment = toNumber(normalized["downpayment"]);
      if (normalized["loanrequired"]) f.loanRequired = String(normalized["loanrequired"]).toLowerCase() === "true";
      if (normalized["monthlyincome"]) f.monthlyIncome = toNumber(normalized["monthlyincome"]);
      if (normalized["bankpreference"]) f.bankPreference = normalized["bankpreference"];
      return Object.keys(f).length ? f : undefined;
    })(),
  };

  // simple validation
  const rowErrors: string[] = [];
  if (!buyer.name) rowErrors.push("Missing name");
  if (!buyer.phone && !buyer.email) rowErrors.push("Missing phone and email");
  if (!buyer.budget?.min && !buyer.budget?.max) rowErrors.push("Missing budget");

  return { buyer, rowErrors };
};



  const processFile = async (f: File) => {
    setIsProcessing(true);
    setErrors([]);
    setPreviewData([]);
    setSkippedRows([]);

    try {
      const ext = f.name.split(".").pop()?.toLowerCase();
      let rawRows: any[] = [];

      if (ext === "csv") {
        const text = await f.text();
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        if (parsed.errors && parsed.errors.length > 0) {
          const msgs = parsed.errors.map((e: any) => `Row ${e.row}: ${e.message}`);
          setErrors((prev) => [...prev, ...msgs]);
        }
        rawRows = parsed.data as any[];
      } else {
        const ab = await f.arrayBuffer();
        const workbook = XLSX.read(ab, { type: "array" });
        const sheet = workbook.SheetNames[0];
        const ws = workbook.Sheets[sheet];
        rawRows = XLSX.utils.sheet_to_json(ws, { defval: "" }) as any[];
      }

      if (!Array.isArray(rawRows) || rawRows.length === 0) {
        setErrors(["No rows found in file"]);
        return;
      }

      const previews: any[] = [];
      const skips: any[] = [];
      const rowLevelErrors: string[] = [];

      rawRows.forEach((row, idx) => {
        const { buyer, rowErrors } = normalizeRow(row);
        if (rowErrors.length > 0) {
          skips.push({ row: idx + 1, errors: rowErrors, raw: row });
          rowLevelErrors.push(`Row ${idx + 1}: ${rowErrors.join("; ")}`);
        } else {
          previews.push(buyer);
        }
      });

      if (rowLevelErrors.length > 0) setErrors(rowLevelErrors);
      setSkippedRows(skips);
      setPreviewData(previews);
    } catch (err: any) {
      console.error("processFile error:", err);
      setErrors([String(err?.message ?? err)]);
    } finally {
      setIsProcessing(false);
    }
  };

  // This function performs the API import directly from the modal
  const handleImport = async () => {
    if (previewData.length === 0) {
      alert("No data to import");
      return;
    }

    try {
      setIsImporting(true);
      toast.info(`Importing ${previewData.length} buyer(s)...`, { position: "top-center", autoClose: 2000 });

      // Call your backend import endpoint - adjust buyerAPI.import signature as needed
      const res = await buyerAPI  .import(previewData);

      const inserted = res?.inserted ?? 0;
      const skipped = res?.skipped ?? (res?.skippedRows ? res.skippedRows.length : 0);
      const resSkippedRows = res?.skippedRows ?? [];

      // Optionally refresh list inside modal; better to let parent refresh
      toast.success(`Import complete — ${inserted} inserted, ${skipped} skipped.`, { position: "top-center", autoClose: 5000 });

      if (Array.isArray(resSkippedRows) && resSkippedRows.length > 0) {
        console.table(resSkippedRows);
        toast.warn(`${resSkippedRows.length} rows skipped — check console for details.`, { position: "top-center", autoClose: 7000 });
      }

      // Call parent callback so it can refresh buyers or react
      if (typeof onImportComplete === "function") {
        onImportComplete({ inserted, skipped, skippedRows: resSkippedRows });
      }

      // close modal
      onClose();
    } catch (err: any) {
      console.error("Error importing buyers:", err);
      toast.error(`Failed to import buyers: ${err?.message || err}`, { position: "top-center" });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `Salutation,Name,Phone,Whatsapp_Number,Email,State,City,Location,Source,Priority,Stage,Status,BudgetMin,BudgetMax,PropertyType,UnitType,PreferredLocations,Furnishing,Possession
Mr.,John Doe,9876543210,9876543210,john.doe@email.com,Maharashtra,Mumbai,Andheri West,Website,medium,initial_contact,active,20000000,25000000,Residential,3BHK,"Andheri West,Bandra West",Semi Furnished,Ready to Move
Mrs.,Jane Smith,8765432109,8765432109,jane.smith@email.com,Karnataka,Bangalore,Koramangala,Referral,high,property_hunting,active,15000000,18000000,Residential,2BHK,"Koramangala,Indiranagar",Fully Furnished,Ready to Move`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "buyers_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount || Number.isNaN(amount)) return "—";
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Import Buyers</h2>
              <p className="text-gray-600 mt-1">Upload CSV or Excel file to import multiple buyers</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Download Template */}
          <div className="mb-6 bg-purple-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-purple-900">Download Template</h3>
                <p className="text-sm text-purple-700 mt-1">Download our CSV template to ensure proper formatting</p>
              </div>
              <button onClick={downloadTemplate} className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Download size={16} />
                <span>Download Template</span>
              </button>
            </div>
          </div>

          {/* File Upload Area */}
          <div className="mb-6">
            <div className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-gray-400"}`}
                 onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
              <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileInput} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Upload className="text-gray-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{file ? file.name : "Drop your file here, or click to browse"}</h3>
                  <p className="text-gray-500 mt-1">Supports CSV and Excel files (max 10MB)</p>
                </div>
                {!file && <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">Choose File</button>}
              </div>
            </div>
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <div className="mb-6 bg-yellow-50 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                <div>
                  <h3 className="font-semibold text-yellow-900">Processing File...</h3>
                  <p className="text-sm text-yellow-700">Parsing and validating file</p>
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
                    {errors.map((error, index) => (<li key={index}>• {error}</li>))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Preview Data */}
          {previewData.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Preview Data</h3>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="text-green-600 font-medium">{previewData.length} buyers ready to import</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto">
                <div className="space-y-3">
                  {previewData.slice(0, 5).map((buyer, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                        <div><span className="font-medium">{buyer.salutation ?? ""} {buyer.name}</span></div>
                        <div className="text-gray-600">{buyer.phone} • {buyer.email}</div>
                        <div className="text-gray-600">{buyer.location ?? ""}{buyer.city ? `, ${buyer.city}` : ""}</div>
                        <div className="text-green-600 font-medium">{formatCurrency(buyer.budget?.min)} - {formatCurrency(buyer.budget?.max)}</div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Preferred Units {Array.isArray(buyer.requirements?.unitType) ? buyer.requirements.unitType.join(", ") : buyer.requirements?.unitType} {buyer.requirements?.propertyType} in {(buyer.requirements?.preferredLocations || []).join(", ")}
                      </div>
                    </div>
                  ))}
                  {previewData.length > 5 && (<div className="text-center text-gray-500 text-sm">... and {previewData.length - 5} more buyers</div>)}
                </div>
              </div>
            </div>
          )}

          {/* Skipped rows summary */}
          {skippedRows.length > 0 && (
            <div className="mb-6 bg-yellow-50 rounded-xl p-4">
              <h4 className="font-semibold text-yellow-900">Skipped Rows</h4>
              <div className="text-sm text-yellow-800 mt-2">{skippedRows.length} row(s) skipped — check console for details.</div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Import Instructions</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start space-x-2"><span className="text-purple-600 font-bold">1.</span><span>Download the template and fill buyer data</span></li>
              <li className="flex items-start space-x-2"><span className="text-purple-600 font-bold">2.</span><span>Ensure required fields (Name, Phone or Email, Budget) are filled</span></li>
              <li className="flex items-start space-x-2"><span className="text-purple-600 font-bold">3.</span><span>Use numeric values for BudgetMin/BudgetMax and comma-separated PreferredLocations</span></li>
              <li className="flex items-start space-x-2"><span className="text-purple-600 font-bold">4.</span><span>Save as CSV or Excel and upload</span></li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">{previewData.length > 0 ? `${previewData.length} buyers ready to import` : "No file selected"}</div>
            <div className="flex items-center space-x-3">
              <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={handleImport} disabled={previewData.length === 0 || isProcessing || isImporting}
                      className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <Users size={16} />
                <span>{isImporting ? "Importing..." : `Import ${previewData.length} Buyers`}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportBuyersModal;
