import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
  danger?: boolean;
  action?: () => void;
  disabled?: boolean;
}

interface DropdownProps {
  options?: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  align?: "left" | "right";
  className?: string;            // existing: extra classes applied to container/button
  triggerClassName?: string;     // <-- ADDED: classes specifically for the trigger button
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  noOptionsLabel?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  label,
  align = "left",
  className = "",
  triggerClassName = "",   // default to empty string
  disabled = false,
  searchable = false,
  searchPlaceholder = "Search...",
  noOptionsLabel = "No options",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const safeOptions = useMemo<DropdownOption[]>(
    () => (Array.isArray(options) ? options : []),
    [options]
  );

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm.trim()) return safeOptions;
    const q = searchTerm.trim().toLowerCase();
    return safeOptions.filter((opt) => (opt.label || opt.value).toLowerCase().includes(q));
  }, [safeOptions, searchable, searchTerm]);

  const selectedOption = useMemo(() => {
    if (value === undefined || value === null || value === "") return undefined;
    const valStr = String(value).trim();
    const exact = safeOptions.find((option) => String(option.value) === valStr);
    if (exact) return exact;

    const normalizedVal = valStr.toLowerCase().replace(/\s+/g, "");
    const valDigits = valStr.match(/\d+/)?.[0];

    // 1. Fuzzy match by label/value ignoring case and whitespace
    const fuzzy = safeOptions.find(
      (opt) =>
        String(opt.value).toLowerCase().replace(/\s+/g, "") === normalizedVal ||
        String(opt.label).toLowerCase().replace(/\s+/g, "") === normalizedVal
    );
    if (fuzzy) return fuzzy;

    // 2. Digit match (e.g. value "3" matches option "3 Month")
    if (valDigits) {
      const digitMatch = safeOptions.find((opt) => {
        const dVal = (String(opt.value).match(/\d+/) || String(opt.label).match(/\d+/))?.[0];
        return dVal === valDigits;
      });
      if (digitMatch) return digitMatch;
    }

    return undefined;
  }, [safeOptions, value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on ESC
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Focus search input when opened and searchable
  useEffect(() => {
    if (isOpen && searchable) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    } else {
      setSearchTerm("");
    }
  }, [isOpen, searchable]);

  const handleSelect = (option: DropdownOption) => {
    if (option.disabled) return;
    if (option.action) {
      option.action();
    } else if (onChange) {
      onChange(option.value);
    }
    setIsOpen(false);
    setSearchTerm("");
  };

  const toggleOpen = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="w-full" ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      )}

      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          disabled={disabled}
          className={[
            "inline-flex justify-between items-center w-full rounded-md border border-gray-300 shadow-sm px-3 bg-white text-xs font-medium text-gray-700",
            "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 h-9",
            disabled ? "opacity-60 cursor-not-allowed" : "",
            className,                // keep existing className usage
            triggerClassName,         // apply trigger-specific classes as well
          ].join(" ").trim()}
          onClick={toggleOpen}
        >
          {selectedOption?.label || <span className="text-gray-400">{placeholder}</span>}
          <ChevronDown
            className={`ml-2 h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div
            role="listbox"
            tabIndex={-1}
            className={[
              "origin-top-right absolute mt-1 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 max-h-60 overflow-hidden",
              align === "right" ? "right-0" : "left-0",
            ].join(" ")}
          >
            {/* optional search */}
            {searchable && (
              <div className="p-2 border-b">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="py-1 max-h-44 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-xs text-gray-400 select-none">{noOptionsLabel}</div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = value === option.value;
                  const base = "block w-full text-left px-3 py-2 text-xs transition-colors";
                  const tone = option.danger ? "text-red-700 hover:bg-red-50" : "text-gray-700 hover:bg-gray-100";
                  const selectedCls = isSelected ? "bg-blue-50 text-blue-600" : "";
                  const disabledCls = option.disabled ? "opacity-50 cursor-not-allowed hover:bg-transparent" : "";

                  return (
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      key={option.value}
                      onClick={() => handleSelect(option)}
                      className={[base, tone, selectedCls, disabledCls].join(" ")}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dropdown;
