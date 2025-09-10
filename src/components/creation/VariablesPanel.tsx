import React, { useState, useEffect } from 'react';
import { Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { Variable } from './types';
import { availableVariables } from './constants';

type VariablesPanelProps = {
  showVariablePanel: boolean;
  variables?: string[]; // kept for compatibility
  onInsertVariable: (variable: Variable) => void;
};

const CATEGORIES = ['personal', 'property', 'financial', 'date'] as const;

const VariablesPanel: React.FC<VariablesPanelProps> = ({
  showVariablePanel,
  onInsertVariable
}) => {
  const [openCategory, setOpenCategory] = useState<string | null>(CATEGORIES[0]);
  const [mobileOpen, setMobileOpen] = useState(false);

  // When showVariablePanel becomes true, auto-open mobile sheet for small viewports
  useEffect(() => {
    if (!showVariablePanel) {
      setMobileOpen(false);
      return;
    }
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      // directly open mobile sheet
      setMobileOpen(true);
    } else {
      // keep desktop behavior (side panel visible via parent)
      setMobileOpen(false);
    }
  }, [showVariablePanel]);

  if (!showVariablePanel) return null;

  const toggleCategory = (cat: string) => {
    setOpenCategory(prev => (prev === cat ? null : cat));
  };

  const renderAccordion = () => (
    <div className="space-y-3">
      {CATEGORIES.map((category) => {
        const vars = availableVariables.filter((v) => v.category === category);
        const isOpen = openCategory === category;
        return (
          <div key={category} className="border border-gray-100 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between px-3 py-2 bg-white hover:bg-gray-50"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                  {category}
                </div>
                <div className="text-xs text-gray-500 font-mono">{vars.length} vars</div>
              </div>
              <div>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {isOpen && (
              <div className="p-2 bg-white">
                <div className="space-y-2">
                  {vars.map(variable => (
                    <button
                      key={variable.name}
                      onClick={() => {
                        // ensure category is open and, on small screens, keep sheet open (you can auto-close if needed)
                        setOpenCategory(category);
                        onInsertVariable(variable);

                        // If you want to auto-close the sheet right after insertion on mobile:
                        // if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                        //   setMobileOpen(false);
                        // }
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-gray-200 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{variable.label}</div>
                          <div className="text-xs text-gray-500 font-mono">{`{{${variable.name}}}`}</div>
                        </div>
                        <Copy size={14} className="text-gray-400 group-hover:text-blue-600" />
                      </div>
                    </button>
                  ))}
                  {vars.length === 0 && <div className="text-xs text-gray-500">No variables</div>}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* DESKTOP / LARGE: side panel (visible on lg and up) */}
      <div className="hidden lg:flex w-80 border-t lg:border-t-0 lg:border-l border-gray-200 bg-white flex-shrink-0 min-h-0 flex flex-col no-print">
        <div className="p-2 sm:p-3 border-b border-gray-200">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900">Variables</h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Click to insert into template</p>
        </div>

        <div className="p-2 sm:p-3 overflow-auto flex-1">
          {renderAccordion()}
        </div>
      </div>

      {/* MOBILE / TABLET: bottom sheet (auto-open when showVariablePanel is true on small viewports) */}
      <div className="lg:hidden">
        {mobileOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end"
            role="dialog"
            aria-modal="true"
          >
            {/* Backdrop */}
            <button
              className="absolute inset-0 bg-black/40"
              aria-hidden="true"
              onClick={() => setMobileOpen(false)}
            />

            {/* Sheet */}
            <div className="relative w-full max-h-[85%] bg-white rounded-t-xl shadow-xl overflow-hidden">
              <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Variables</h3>
                  <p className="text-xs text-gray-600">Tap a variable to insert</p>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-gray-600 px-2 py-1"
                  aria-label="Close variables"
                >
                  Close
                </button>
              </div>

              <div className="p-3 overflow-auto">
                {renderAccordion()}
                <div className="mt-4">
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="w-full py-2 rounded-md border border-gray-200 text-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default VariablesPanel;
