import React, { useState, ChangeEvent } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import * as XLSXRaw from "xlsx-js-style";
import { leadsAPI } from "@/lib/api";
import { toast } from "react-toastify";

/**
 * Notes:
 * - If your project provides types for xlsx-js-style, replace XLSXAny: any with those types.
 * - If leadsAPI has typed methods, replace the any return types below with the correct interfaces.
 */

const XLSX = XLSXRaw as any;

type RawRow = Record<string, any>;

type SkippedRow = {
  row: number;
  reason: string;
  data: RawRow;
};

type SkippedRowsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  skippedRows: SkippedRow[];
};

function SkippedRowsModal({ isOpen, onClose, skippedRows }: SkippedRowsModalProps) {
  if (!isOpen || !skippedRows || skippedRows.length === 0) return null;

  // Collect only keys which have at least 1 non-empty value
  const allKeys = Array.from(
    skippedRows.reduce((set, row) => {
      Object.entries(row.data).forEach(([key, value]) => {
        if (value !== null && value !== undefined && String(value).trim() !== "") {
          set.add(key);
        }
      });
      return set;
    }, new Set<string>())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Skipped / Duplicate Leads" width="max-w-6xl">
      <div className="p-4 space-y-4">
        <p className="text-sm text-gray-600">
          Total <span className="font-semibold">{skippedRows.length}</span> rows were skipped.
        </p>

        <div className="max-h-[500px] overflow-auto border rounded-lg">
          <table className="w-full text-xs border-collapse">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="border px-2 py-1">Row</th>
                <th className="border px-2 py-1">Reason</th>
                {allKeys.map((key) => (
                  <th key={key} className="border px-2 py-1 text-left">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {skippedRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
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

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// Helper function to parse phone numbers from scientific notation
const parsePhoneNumber = (phoneValue: any): string => {
  if (phoneValue === null || phoneValue === undefined || String(phoneValue).trim() === "") return "";

  let phoneStr = String(phoneValue).trim();

  // Handle scientific notation (e.g., 9.88E+09)
  if (phoneStr.includes("E+") || phoneStr.includes("e+")) {
    try {
      const number = parseFloat(phoneStr);
      if (!isNaN(number)) {
        phoneStr = Math.round(number).toString();
      }
    } catch (error) {
      console.warn("Error parsing phone number:", phoneStr, error);
    }
  }

  // Remove any non-digit characters except leading +
  phoneStr = phoneStr.replace(/[^\d+]/g, "");

  // If it starts with +91, keep it
  if (phoneStr.startsWith("+91")) {
    return phoneStr;
  } else if (phoneStr.startsWith("91") && phoneStr.length > 10) {
    return "+" + phoneStr;
  } else {
    // Remove leading zeros then return
    phoneStr = phoneStr.replace(/^0+/, "");
    return phoneStr;
  }
};

// Template download function
const downloadLeadTemplate = () => {
  const header = [
    "Salutation*",
    "Name*",
    "Phone*",
    "Email",
    "Lead_type",
    "Lead_source",
    "Whatsapp_number",
    "State",
    "City",
    "Location",
    "Status",
    "Stage",
    "Priority",
    "Assigned_executive",
  ];

  const worksheet = XLSX.utils.aoa_to_sheet([header]);

  const mandatoryCols = [0, 1, 2]; // salutation, name, phone
  mandatoryCols.forEach((colIndex) => {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIndex });
    if (!worksheet[cellAddress]) return;

    worksheet[cellAddress].s = {
      font: { color: { rgb: "FF0000" }, bold: true },
      alignment: { horizontal: "center", vertical: "center" },
    };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, worksheet, "Leads Template");

  XLSX.writeFile(wb, "Leads_Import_Template.xlsx");
};

type ImportLeadsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ImportLeadsModal({ isOpen, onClose }: ImportLeadsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const [skippedRows, setSkippedRows] = useState<SkippedRow[]>([]);
  const [showSkippedModal, setShowSkippedModal] = useState<boolean>(false);

  // Drag handlers
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const dtFiles = e.dataTransfer?.files;
    if (dtFiles && dtFiles.length > 0) {
      const droppedFile = dtFiles[0];
      const fileType = droppedFile.name.split(".").pop()?.toLowerCase() ?? "";

      if (["csv", "xlsx", "xls"].includes(fileType)) {
        setFile(droppedFile);
      } else {
        toast.error("Please upload only Excel (.xlsx, .xls) or CSV files");
      }
    }
  };

  // Validation & Filtering with phone parsing
  const filterValidLeads = (data: RawRow[]) => {
    const seenPhones = new Set<string>();
    const seenEmails = new Set<string>();
    const validData: any[] = [];
    const skipped: SkippedRow[] = [];

    data.forEach((row, index) => {
      const rowNum = index + 2; // header = 1

      const salutation = row["Salutation*"] ? String(row["Salutation*"]).trim() : "";
      const name = row["Name*"] ? String(row["Name*"]).trim() : "";

      const rawPhone = row["Phone*"];
      const phone = parsePhoneNumber(rawPhone);

      const email = row["Email"] ? String(row["Email"]).trim() : "";

      if (!salutation || !name || !phone) {
        skipped.push({
          row: rowNum,
          reason: "Missing mandatory field",
          data: { ...row, "Phone* (parsed)": phone },
        });
        return;
      }

      if (seenPhones.has(phone)) {
        skipped.push({
          row: rowNum,
          reason: `Duplicate phone (${phone})`,
          data: { ...row, "Phone* (parsed)": phone },
        });
        return;
      }

      if (email && seenEmails.has(email)) {
        skipped.push({
          row: rowNum,
          reason: `Duplicate email (${email})`,
          data: { ...row, "Phone* (parsed)": phone },
        });
        return;
      }

      const phoneRegex = /^[\+]?[\d]{10,13}$/;
      if (!phoneRegex.test(phone)) {
        skipped.push({
          row: rowNum,
          reason: `Invalid phone format (${phone})`,
          data: { ...row, "Phone* (parsed)": phone },
        });
        return;
      }

      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          skipped.push({
            row: rowNum,
            reason: "Invalid email format",
            data: { ...row, "Phone* (parsed)": phone },
          });
          return;
        }
      }

      const whatsappRaw = row["Whatsapp_number"];
      const whatsappNumber = whatsappRaw ? parsePhoneNumber(whatsappRaw) : "";

      validData.push({
        salutation,
        name,
        phone,
        email,
        lead_type: row["Lead_type"] || "",
        lead_source: row["Lead_source"] || "",
        whatsapp_number: whatsappNumber,
        state: row["State"] || "",
        city: row["City"] || "",
        location: row["Location"] || "",
        status: row["Status"] || "",
        stage: row["Stage"] || "",
        priority: row["Priority"] || "",
        assigned_executive: row["Assigned_executive"] || "",
      });

      seenPhones.add(phone);
      if (email) seenEmails.add(email);
    });

    return { validData, skippedRows: skipped };
  };

  // File import
  const handleFileImport = async () => {
    if (!file) {
      toast.error("Please select an Excel/CSV file");
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();

      reader.onload = async (evt: ProgressEvent<FileReader>) => {
        try {
          const result = evt.target?.result;
          if (!result) {
            toast.error("Failed to read file");
            setIsUploading(false);
            return;
          }

          let wb: any;

          if (file.name.toLowerCase().endsWith(".csv")) {
            // result as string
            const csvText = typeof result === "string" ? result : String(result);
            wb = XLSX.read(csvText, { type: "string", raw: true });
          } else {
            // binary string expected
            const binaryStr = typeof result === "string" ? result : String(result);
            wb = XLSX.read(binaryStr, { type: "binary", raw: true });
          }

          const ws = wb.Sheets[wb.SheetNames[0]];
          if (!ws) {
            toast.error("No sheet found in file");
            setIsUploading(false);
            return;
          }

          const data: RawRow[] = XLSX.utils.sheet_to_json(ws, { raw: true, defval: "" });

          if (!data || data.length === 0) {
            toast.error("File appears to be empty or has no data");
            setIsUploading(false);
            return;
          }

          const { validData, skippedRows } = filterValidLeads(data);

          if (skippedRows.length > 0) {
            setSkippedRows(skippedRows);
            setShowSkippedModal(true);
          }

          if (validData.length === 0) {
            toast.error("No valid leads found in the file");
            setIsUploading(false);
            return;
          }

          try {
            // leadsAPI.importLeads is assumed to accept the array and return { inserted: number, skippedRows?: any[] }
            const response: any = await leadsAPI.importLeads(validData);

            toast.success(`Successfully imported ${response.inserted ?? validData.length} leads!`);

            if (response.skippedRows && response.skippedRows.length > 0) {
              setSkippedRows((prev) => [...prev, ...response.skippedRows]);
              setShowSkippedModal(true);
            }

            // optionally refresh leads list if leadsAPI.getLeads exists
            if (typeof leadsAPI.getLeads === "function") {
              try {
                await leadsAPI.getLeads();
              } catch {
                // ignore refresh errors
              }
            }

            setFile(null);
            onClose();
          } catch (err: any) {
            console.error("API Error:", err);
            toast.error(err?.message || "Failed to save leads to server");
          }
        } catch (err) {
          console.error("File processing error:", err);
          toast.error("Error processing file. Please check the file format.");
        } finally {
          setIsUploading(false);
        }
      };

      if (file.name.toLowerCase().endsWith(".csv")) {
        reader.readAsText(file);
      } else {
        // read as binary string to preserve formatting (xlsx-js-style supports this)
        reader.readAsBinaryString(file);
      }
    } catch (err) {
      console.error("File import error:", err);
      toast.error("Error reading file");
      setIsUploading(false);
    }
  };

  // Google Sheet import
  const handleGoogleSheetImport = async () => {
    if (!sheetUrl.trim()) {
      toast.error("Please enter a Google Sheet URL");
      return;
    }

    setIsUploading(true);

    try {
      const sheetIdMatch = sheetUrl.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!sheetIdMatch) {
        toast.error("Invalid Google Sheet URL format");
        setIsUploading(false);
        return;
      }

      const sheetId = sheetIdMatch[1];
      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

      try {
        const response = await fetch(exportUrl);

        if (!response.ok) {
          if (response.status === 403) {
            toast.error("Sheet is not publicly accessible. Please make it viewable by anyone with the link.");
          } else {
            toast.error("Failed to access Google Sheet. Please check the URL and permissions.");
          }
          setIsUploading(false);
          return;
        }

        const csvText = await response.text();

        if (!csvText.trim()) {
          toast.error("Google Sheet appears to be empty");
          setIsUploading(false);
          return;
        }

        // Read CSV text as workbook and preserve raw values
        const wb = XLSX.read(csvText, { type: "string", raw: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        if (!ws) {
          toast.error("No sheet found in Google Sheet");
          setIsUploading(false);
          return;
        }

        const data: RawRow[] = XLSX.utils.sheet_to_json(ws, { raw: true, defval: "" });

        if (!data || data.length === 0) {
          toast.error("No data found in the Google Sheet");
          setIsUploading(false);
          return;
        }

        const { validData, skippedRows } = filterValidLeads(data);

        if (skippedRows.length > 0) {
          setSkippedRows(skippedRows);
          setShowSkippedModal(true);
        }

        if (validData.length === 0) {
          toast.error("No valid leads found in the Google Sheet");
          setIsUploading(false);
          return;
        }

        try {
          const response = await leadsAPI.importLeads(validData);

          toast.success(`Successfully imported ${response.inserted ?? validData.length} leads from Google Sheet!`);

          if (response.skippedRows && response.skippedRows.length > 0) {
            setSkippedRows((prev) => [...prev, ...response.skippedRows]);
            setShowSkippedModal(true);
          }

          if (typeof leadsAPI.getLeads === "function") {
            try {
              await leadsAPI.getLeads();
            } catch {
              // ignore
            }
          }

          setSheetUrl("");
          onClose();
        } catch (err: any) {
          console.error("API Error:", err);
          toast.error(err?.message || "Failed to save leads to server");
        }
      } catch (fetchError) {
        console.error("Network error:", fetchError);
        toast.error("Failed to fetch data from Google Sheet. Please check your internet connection and try again.");
      }
    } catch (err) {
      console.error("Google sheet import error:", err);
      toast.error("Error processing Google Sheet");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setSheetUrl("");
    setSkippedRows([]);
    setShowSkippedModal(false);
    setIsUploading(false);
    setDragActive(false);
    onClose();
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    const fileType = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["csv", "xlsx", "xls"].includes(fileType)) {
      toast.error("Please upload only Excel (.xlsx, .xls) or CSV files");
      return;
    }
    setFile(f);
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="" width="max-w-4xl">
        <div className="space-y-8 p-6">
          {/* Header */}
          <div className="border-b pb-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Import Leads</h2>
                <p className="text-sm text-gray-600">Import leads from Excel files or Google Sheets</p>
              </div>
            </div>
          </div>

          {/* Import Methods */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* File Upload Section */}
            <div className="flex flex-col h-full space-y-3 p-4 border rounded-lg bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Upload File</h3>
              </div>

              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center flex-1 transition-all duration-200 ${
                  dragActive ? "border-blue-400 bg-blue-50" : file ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-gray-400 bg-gray-50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input type="file" accept=".csv,.xlsx,.xls" onChange={onFileInputChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />

                {file ? (
                  <div className="space-y-1">
                    <div className="w-10 h-10 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-green-700 truncate">{file.name}</p>
                    <p className="text-[11px] text-green-600">Click to change file</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="w-10 h-10 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-gray-900">Drop file or click</p>
                    <p className="text-[11px] text-gray-500">Excel (.xlsx, .xls) or CSV</p>
                  </div>
                )}
              </div>

              <Button onClick={handleFileImport} disabled={!file || isUploading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isUploading ? (
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  "Import from File"
                )}
              </Button>
            </div>

            {/* Google Sheet Section */}
            <div className="flex flex-col h-full space-y-3 p-4 border rounded-lg bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Google Sheets</h3>
              </div>

              <div className="space-y-3 flex-1">
                <div className="relative">
                  <input type="text" placeholder="https://docs.google.com/spreadsheets/..." value={sheetUrl} onChange={(e) => setSheetUrl(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xs text-blue-700">
                      <p className="font-medium mb-1">Make sure your Google Sheet is:</p>
                      <ul className="space-y-0.5">
                        <li>• Shared as "Anyone with link can view"</li>
                        <li>• Has same headers as template</li>
                        <li>• Phone numbers are formatted as text (not numbers)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleGoogleSheetImport} disabled={!sheetUrl.trim() || isUploading} className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isUploading ? (
                  <div className="flex items-center justify-center gap-1">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Importing...
                  </div>
                ) : (
                  "Import from Google Sheet"
                )}
              </Button>
            </div>
          </div>

          {/* Requirements Section */}
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
                    • Duplicate phone numbers and emails will be skipped
                    <br />
                    • Phone format will be validated (10-13 digits)
                    <br />
                    • Scientific notation in phone numbers will be automatically converted
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button onClick={downloadLeadTemplate} className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-105">
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Template
              </div>
            </Button>

            <Button variant="outline" onClick={handleClose} className="flex-1 sm:flex-none border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-8 rounded-lg transition-colors">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <SkippedRowsModal isOpen={showSkippedModal} onClose={() => setShowSkippedModal(false)} skippedRows={skippedRows} />
    </>
  );
}
