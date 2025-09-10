import { useState, ChangeEvent } from "react";
import { Upload, Download } from "lucide-react";
import Modal from "@/components/ui/Modal";
export type ImportType = 'values' | 'master';
interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
  title: string; // This will be used for the downloaded template name
  type?: ImportType;
}

export function ImportModal({
  isOpen,
  onClose,
  onImport,
  title
}: ImportModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleSubmit = async () => {
    if (!file) return;

    setIsLoading(true);
    try {
      await onImport(file);
      onClose();
    } finally {
      setIsLoading(false);
      setFile(null);
    }
  };

  // ---------------- Download Template ----------------
  const downloadTemplate = () => {
    let csvContent = "";
    if (title.toLowerCase().includes("master type")) {
      csvContent = "name,status\nExample Name,Active";
    } else {
      csvContent = "value,status\nExample Value,Active";
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      "download",
      `${title.replace(/\s+/g, "_")}_Template.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Import ${title}`}>
      <div className="space-y-4">
        <div className="flex border-b items-center justify-between">
          <h3 className="px-4 py-2 text-sm font-medium text-blue-600">
            File Upload
          </h3>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Download size={16} /> Download Template
          </button>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Select File (CSV or Excel)
          </label>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded flex items-center gap-2">
              <Upload size={16} /> Choose File
              <input
                type="file"
                accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <span className="text-sm">
              {file ? file.name : "No file selected"}
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Supported formats: CSV, Excel (.xlsx, .xls)
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !file}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Importing..." : "Import"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
