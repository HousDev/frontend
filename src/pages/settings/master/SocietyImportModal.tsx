import React, { useState, useRef } from "react";
import { X, Download, Upload, Check, AlertTriangle } from "lucide-react";
import * as XLSX from "xlsx";
import { societyAPI } from "@/lib/societyAPI";
import { toast } from "react-toastify";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onImported: () => Promise<void>; // call loadSocieties() after success
}

interface ParsedRow {
    societyName: string;
    locality: string;
    city: string;
    pincode: string;
    amenities: string[];
    isValid: boolean;
    isDuplicate: boolean;
    errors: string[];
    rowNumber: number;
}

export const SocietyImportModal: React.FC<Props> = ({ isOpen, onClose, onImported }) => {
    const [fileName, setFileName] = useState<string>("");
    const [rows, setRows] = useState<ParsedRow[]>([]);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const downloadTemplate = () => {
        const sample = [
            { "Society Name": "Green Valley Residency", Locality: "Hinjewadi Phase 1", City: "Pune", Pincode: 411057, Amenities: "Parking, Security, Gym" },
        ];
        const ws = XLSX.utils.json_to_sheet(sample);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, "society_import_template.xlsx");
    };

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);

        const existing = await societyAPI.getAllSocieties();

        const reader = new FileReader();
        reader.onload = (ev) => {
            const data = new Uint8Array(ev.target?.result as ArrayBuffer);
            const wb = XLSX.read(data, { type: "array" });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const json: any[] = XLSX.utils.sheet_to_json(ws);

            const parsed: ParsedRow[] = json.map((row, i) => {
                const societyName = row["Society Name"] || row.societyName || "";
                const locality = row["Locality"] || row.locality || "";
                const city = row["City"] || row.city || "";
                const pincode = String(row["Pincode"] || row.pincode || "");
                const amenities = row["Amenities"]
                    ? String(row["Amenities"]).split(",").map((a: string) => a.trim())
                    : [];

                const errors: string[] = [];
                if (!societyName) errors.push("Society name required");
                if (!locality) errors.push("Locality required");
                if (!city) errors.push("City required");
                if (!/^[1-9][0-9]{5}$/.test(pincode)) errors.push("Invalid pincode");

                const isDuplicate = existing.some(
                    (s: any) =>
                        s.societyName?.toLowerCase() === societyName.toLowerCase() &&
                        s.locality?.toLowerCase() === locality.toLowerCase() &&
                        s.pincode === pincode
                );
                if (isDuplicate) errors.push("Duplicate record");

                return {
                    societyName, locality, city, pincode, amenities,
                    isValid: errors.length === 0,
                    isDuplicate,
                    errors,
                    rowNumber: i + 2,
                };
            });

            setRows(parsed);
        };
        reader.readAsArrayBuffer(file);
    };

    const validCount = rows.filter((r) => r.isValid).length;

    const confirmImport = async () => {
        setIsImporting(true);
        try {
            const valid = rows.filter((r) => r.isValid);
            let success = 0;
            for (const r of valid) {
                try {
                    await societyAPI.createSociety({
                        societyName: r.societyName,
                        locality: r.locality,
                        city: r.city,
                        pincode: r.pincode,
                        amenities: r.amenities,
                    });
                    success++;
                } catch (err) {
                    console.error(err);
                }
            }
            toast.success(`✅ Imported ${success} societies`);
            await onImported();
            handleClose();
        } catch {
            toast.error("Import failed ❌");
        } finally {
            setIsImporting(false);
        }
    };

    const handleClose = () => {
        setRows([]);
        setFileName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        onClose();
    };

    // group amenities-style preview like screenshot: category -> sub items
    const categoryCount = rows.length;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
                {/* Header - Sticky */}
                <div className="flex items-center justify-between px-4 py-3  rounded-t-xl flex-shrink-0" style={{ background: '#0f2b3d', borderColor: '#e2e8f0' }}>
                    <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                        Import Societies
                    </h3>
                    <button onClick={handleClose}><X size={18} className="text-white" /></button>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Step 1 */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <p className="text-sm font-semibold text-blue-800">Step 1: Download Template</p>
                        <p className="text-xs text-blue-600 mb-2">
                            Columns: Society Name, Locality, City, Pincode, Amenities (comma separated).
                        </p>
                        <button
                            onClick={downloadTemplate}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white border border-blue-300 rounded-full text-blue-700 hover:bg-blue-100"
                        >
                            <Download size={12} /> Download Template
                        </button>
                    </div>

                    {/* Step 2 */}
                    <div>
                        <p className="text-sm font-medium mb-2">Step 2: Upload Filled Excel</p>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400"
                        >
                            <Upload size={22} className="mx-auto text-gray-400 mb-1" />
                            <p className="text-xs text-gray-600">{fileName || "Click to upload .xlsx / .xls"}</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                className="hidden"
                                onChange={handleFile}
                            />
                        </div>
                    </div>

                    {/* Step 3 Preview */}
                    {rows.length > 0 && (
                        <div>
                            <p className="text-sm font-medium mb-2">Step 3: Preview ({rows.length} records found)</p>

                            {/* Summary in colored text */}
                            <div className="flex flex-wrap items-center gap-3 mb-3 text-xs">
                                <span className="text-green-600 font-medium">
                                    Valid: <span className="font-bold">{rows.filter(r => r.isValid && !r.isDuplicate).length}</span>
                                </span>
                                <span className="text-yellow-600 font-medium">
                                    Duplicate: <span className="font-bold">{rows.filter(r => r.isDuplicate).length}</span>
                                </span>
                                <span className="text-red-600 font-medium">
                                    Invalid: <span className="font-bold">{rows.filter(r => !r.isValid && !r.isDuplicate).length}</span>
                                </span>
                                <span className="text-gray-500 font-medium">
                                    Total: <span className="font-bold">{rows.length}</span>
                                </span>
                            </div>

                            <div className="border rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                                <table className="w-full text-xs">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="text-left p-2">Society</th>
                                            <th className="text-left p-2">Locality</th>
                                            <th className="text-left p-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rows.map((r, idx) => (
                                            <tr key={idx} className="border-t">
                                                <td className="p-2">{r.societyName || "-"}</td>
                                                <td className="p-2">{r.locality || "-"}</td>
                                                <td className="p-2">
                                                    {r.isValid && !r.isDuplicate ? (
                                                        <span className="text-green-600 flex items-center gap-1">
                                                            <Check size={12} /> Valid
                                                        </span>
                                                    ) : r.isDuplicate ? (
                                                        <span className="text-yellow-600 flex items-center gap-1" title={r.errors.join(", ")}>
                                                            <AlertTriangle size={12} /> Duplicate
                                                        </span>
                                                    ) : (
                                                        <span className="text-red-500 flex items-center gap-1" title={r.errors.join(", ")}>
                                                            <AlertTriangle size={12} /> {r.errors[0]}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-[11px] text-yellow-700">
                                ⚠️ Duplicate / invalid records will be skipped.
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer - Sticky */}
                <div className="flex gap-2 p-4 border-t flex-shrink-0 bg-white rounded-b-xl">
                    <button onClick={handleClose} className="flex-1 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button
                        onClick={confirmImport}
                        disabled={validCount === 0 || isImporting}
                        className="flex-1 py-2 text-sm rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50"
                    >
                        {isImporting ? "Importing..." : `✓ Import (${validCount} societies)`}
                    </button>
                </div>
            </div>
        </div>
    );
};