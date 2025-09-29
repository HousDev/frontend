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
    <div className="py-1 px-3 border-b border-gray-200 no-print">
      {/* Top row: title/help + close */}
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          {/* 8px helper text */}
          <p className="text-[10px] leading-none text-gray-600 truncate">
            Design your document template with rich formatting
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>

      {/* Bottom row: status / variables + actions */}
      <div className="no-print flex-shrink-0 border-t border-gray-200 bg-gray-50 mt-1">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-2">
          {/* Status + Variables Dropdown */}
          <div className="flex flex-col sm:flex-row items-center gap-1 order-2 sm:order-1">
            {/* 8px status line */}
            <div className="text-[10px] leading-none text-gray-500 text-center sm:text-left">
              {variables.length} variables used •{' '}
              {viewMode === 'visual'
                ? 'Visual Editor'
                : viewMode === 'code'
                ? 'HTML Editor'
                : 'Preview'}{' '}
              • {template ? 'Editing' : 'Creating'}
            </div>

            {/* Variables Dropdown */}
            {variables.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown((s) => !s)}
                  className="px-2 py-1 text-[8px] leading-none bg-white border border-gray-300 rounded-md hover:bg-gray-100"
                >
                  Show Variables ▼
                </button>

                {showDropdown && (
                  <div className="absolute left-0 mt-1 w-44 max-h-40 overflow-auto bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <ul className="text-[10px] text-gray-700">
                      {variables.map((v, i) => (
                        <li
                          key={i}
                          className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                          onClick={() => navigator.clipboard.writeText(v)}
                          title="Click to copy"
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
          <div className="order-1 sm:order-2 flex flex-wrap items-center gap-1 sm:gap-2">
            <button
              onClick={onCreateNew}
              className="px-2 sm:px-3 py-1 text-[10px] leading-none bg-white border border-gray-300 rounded-md hover:bg-gray-100"
              title="Start a new blank template"
            >
              New (Blank)
            </button>

            <button
              onClick={onDownload}
              className="px-2 sm:px-3 py-1 text-[10px] leading-none bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              title="Download / Save as PDF"
            >
              Download
            </button>

            <button
              onClick={onClose}
              className="px-2 sm:px-3 py-1 text-[10px] leading-none text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              title="Close without saving"
            >
              Cancel
            </button>

            <button
              onClick={onSave}
              disabled={!templateData.name.trim()}
              className="flex items-center gap-1 px-2 sm:px-3 py-1 text-[10px] leading-none bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={template ? 'Update Template' : 'Save Template'}
            >
              <Save size={12} />
              <span>{template ? 'Update Template' : 'Save Template'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateHeader;
