// // ImportModal.tsx
// import { useState, ChangeEvent } from "react";
// import { Upload, Download, X } from "lucide-react";

// export type ImportType = 'values' | 'master';

// interface ImportModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onImport: (file: File) => Promise<void>;
//   title: string; // used for template filename and modal heading
//   type?: ImportType;
// }

// export function ImportModal({
//   isOpen,
//   onClose,
//   onImport,
//   title,
// }: ImportModalProps) {
//   const [isLoading, setIsLoading] = useState(false);
//   const [file, setFile] = useState<File | null>(null);

//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const selectedFile = e.target.files?.[0];
//     if (selectedFile) setFile(selectedFile);
//   };

//   const handleSubmit = async () => {
//     if (!file) return;
//     setIsLoading(true);
//     try {
//       await onImport(file);
//       onClose();
//     } finally {
//       setIsLoading(false);
//       setFile(null);
//     }
//   };

//   const downloadTemplate = () => {
//     let csvContent = "";
//     if (title.toLowerCase().includes("master type")) {
//       csvContent = "name,status\nExample Name,Active";
//     } else {
//       csvContent = "value,status\nExample Value,Active";
//     }
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.setAttribute("download", `${title.replace(/\s+/g, "_")}_Template.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   if (!isOpen) return null;

//   return (
//     <div
//       className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
//       onClick={(e) => {
//         if (e.target === e.currentTarget) onClose();
//       }}
//     >
//       <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
//         {/* Custom Header (navy background, orange accent) */}
//         <div
//           className="px-4 py-3 flex items-center justify-between border-b"
//           style={{ backgroundColor: "#0f2b3d" }}
//         >
//           <div className="flex items-center gap-2">
//             <div className="w-1 h-5 rounded-full bg-[#e67e22]" />
//             <h2 className="text-sm font-semibold text-white">Import {title}</h2>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-1 rounded hover:bg-white/10 transition-colors text-white"
//           >
//             <X size={18} />
//           </button>
//         </div>

//         {/* Body – compact and responsive */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//           {/* Template download button */}
//           <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//               <div className="flex items-center gap-2">
//                 <Download size={16} className="text-orange-600" />
//                 <div>
//                   <p className="text-xs font-semibold text-orange-800">
//                     Need a template?
//                   </p>
//                   <p className="text-[10px] text-orange-600">
//                     Download sample file with headers
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={downloadTemplate}
//                 className="flex items-center justify-center gap-1 px-3 py-1.5 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700 transition-colors"
//               >
//                 <Download size={12} />
//                 Download Template
//               </button>
//             </div>
//           </div>

//           {/* File upload area */}
//           <div>
//             <label className="block text-xs font-medium text-gray-700 mb-1.5">
//               Select File (CSV or Excel)
//             </label>
//             <div
//               className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-400 transition-colors cursor-pointer"
//               onClick={() => document.getElementById("import-file-input")?.click()}
//             >
//               <input
//                 id="import-file-input"
//                 type="file"
//                 accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
//                 onChange={handleFileChange}
//                 className="hidden"
//               />
//               <Upload size={20} className="mx-auto text-gray-400 mb-2" />
//               <p className="text-xs text-gray-600">
//                 {file ? file.name : "Drop your file here, or click to browse"}
//               </p>
//               <p className="text-[10px] text-gray-400 mt-1">
//                 Supports CSV, Excel (.xlsx, .xls)
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="px-4 py-3 border-t bg-gray-50 flex justify-end gap-2">
//           <button
//             onClick={onClose}
//             className="px-4 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={isLoading || !file}
//             className="px-4 py-1.5 text-xs bg-[#e67e22] text-white rounded-lg hover:bg-[#d35400] transition-colors disabled:opacity-50 flex items-center gap-1"
//           >
//             {isLoading ? (
//               <>
//                 <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
//                 Importing...
//               </>
//             ) : (
//               "Import"
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, ChangeEvent } from "react";
import { Upload, Download, X } from "lucide-react";
import { toast } from "react-toastify";

export type ImportType = 'values' | 'master';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
  title: string;
  type?: ImportType;
}

export function ImportModal({
  isOpen,
  onClose,
  onImport,
  title = "", // 🔥 Default empty string
}: ImportModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // 🔥 DEFINE safeTitle HERE - at component top level
  const safeTitle = title || "";

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setIsLoading(true);
    try {
      await onImport(file);
      onClose();
      setFile(null);
      toast.success("Import completed successfully");
    } catch (error: any) {
      console.error("Import error:", error);
      const errorMessage = error?.response?.data?.error || error?.message || "Import failed";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 Use safeTitle directly
  const downloadTemplate = () => {
    let csvContent = "";

    if (safeTitle.toLowerCase().includes("master") ||
      safeTitle.toLowerCase().includes("property") ||
      safeTitle.toLowerCase().includes("buyer") ||
      safeTitle.toLowerCase().includes("seller") ||
      safeTitle.toLowerCase().includes("lead") ||
      safeTitle.toLowerCase().includes("common")) {
      csvContent = "name,status\nExample Name,Active";
    } else {
      csvContent = "value,status\nExample Value,Active";
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const fileName = safeTitle ? `${safeTitle.replace(/\s+/g, "_")}_Template.csv` : "template.csv";
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast.info("Template downloaded");
  };

  const resetForm = () => {
    setFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) resetForm();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        {/* Custom Header */}
        <div
          className="px-4 py-3 flex items-center justify-between border-b"
          style={{ backgroundColor: "#0f2b3d" }}
        >
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-[#e67e22]" />
            <h2 className="text-sm font-semibold text-white">
              Import {safeTitle || "Data"}
            </h2>
          </div>
          <button
            onClick={resetForm}
            className="p-1 rounded hover:bg-white/10 transition-colors text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Template download button */}
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <Download size={16} className="text-orange-600" />
                <div>
                  <p className="text-xs font-semibold text-orange-800">
                    Need a template?
                  </p>
                  <p className="text-[10px] text-orange-600">
                    Download sample file with headers
                  </p>
                </div>
              </div>
              <button
                onClick={downloadTemplate}
                className="flex items-center justify-center gap-1 px-3 py-1.5 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Download size={12} />
                Download Template
              </button>
            </div>
          </div>

          {/* File upload area */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Select File (CSV or Excel)
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${file
                  ? "border-green-400 bg-green-50"
                  : "border-gray-300 hover:border-orange-400"
                }`}
              onClick={() => document.getElementById("import-file-input")?.click()}
            >
              <input
                id="import-file-input"
                type="file"
                accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload size={20} className={`mx-auto mb-2 ${file ? "text-green-500" : "text-gray-400"}`} />
              <p className="text-xs text-gray-600">
                {file ? file.name : "Drop your file here, or click to browse"}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                Supports CSV, Excel (.xlsx, .xls)
              </p>
              {file && (
                <p className="text-[10px] text-green-600 mt-2">
                  File selected: {(file.size / 1024).toFixed(2)} KB
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t bg-gray-50 flex justify-end gap-2">
          <button
            onClick={resetForm}
            className="px-4 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !file}
            className="px-4 py-1.5 text-xs bg-[#e67e22] text-white rounded-lg hover:bg-[#d35400] transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                Importing...
              </>
            ) : (
              "Import"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}