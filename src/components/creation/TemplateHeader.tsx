import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Template, TemplateData } from './types';

type TemplateHeaderProps = {
  template?: Template | null;
  templateData: TemplateData;
  setTemplateData: (data: TemplateData) => void;
  variables: string[];
  viewMode: string;
  onSave: () => void;
  onClose: () => void;
  onCreateNew: () => void;
  onDownload: () => void;
};

const TemplateHeader: React.FC<TemplateHeaderProps> = ({
  template,
  templateData,
  setTemplateData,
  variables,
  viewMode,
  onSave,
  onClose,
  onCreateNew,
  onDownload
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="py-2 px-6 border-b border-gray-200 no-print">
      <div className="flex items-center justify-between">
        <div>
          
          <p className="text-xs text-gray-600 mt-1">
            Design your document template with rich formatting
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      <div className="no-print flex-shrink-0 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4">
          {/* Status + Variables Dropdown */}
          <div className="flex flex-col sm:flex-row items-center gap-2 order-2 sm:order-1">
            <div className="text-xs text-gray-500 text-center sm:text-left">
              {variables.length} variables used •{" "}
              {viewMode === "visual"
                ? "Visual Editor"
                : viewMode === "code"
                ? "HTML Editor"
                : "Preview"}{" "}
              • {template ? "Editing" : "Creating"}
            </div>

            {/* Variables Dropdown */}
            {variables.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Show Variables ▼
                </button>

                {showDropdown && (
                  <div className="absolute left-0 mt-1 w-48 max-h-48 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <ul className="text-xs text-gray-700">
                      {variables.map((v, i) => (
                        <li
                          key={i}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => navigator.clipboard.writeText(v)}
                        >
                          {v}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="order-1 sm:order-2 flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={onCreateNew}
              className="px-3 sm:px-4 py-2 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
              title="Start a new blank template"
            >
              New (Blank)
            </button>

            <button
              onClick={onDownload}
              className="px-3 sm:px-4 py-2 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              title="Download / Save as PDF"
            >
              Download
            </button>

            <button
              onClick={onClose}
              className="px-3 sm:px-4 py-2 text-xs text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={onSave}
              disabled={!templateData.name.trim()}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={14} />
              <span>{template ? "Update Template" : "Save Template"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateHeader;
