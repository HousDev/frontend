import React from "react";

interface BudgetInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  onFocus?: () => void; // optional now
}

/** Format with Indian commas safely */
const formatWithCommas = (s: string) => {
  if (!s) return "";
  const num = Number(s);
  if (isNaN(num)) return s;
  return num.toLocaleString("en-IN", {
    maximumFractionDigits: 2, // allow up to 2 decimals
  });
};

const BudgetInput: React.FC<BudgetInputProps> = ({
  value,
  onChange,
  error = null,
  onFocus,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // remove all non-digit characters
    const cleaned = raw.replace(/\D+/g, "");
    onChange(cleaned);
  };

  // display value with commas for user friendliness
  const displayValue = value ? formatWithCommas(value) : "";

  return (
    <div className="flex-1">
      <label className="block text-xs font-medium text-gray-700 mb-1">
       Budget (INR)
      </label>
      <input
        type="text"
        placeholder="e.g., 50,00,000"
        value={displayValue}
        onChange={handleChange}
        onFocus={() => onFocus?.()}
        onWheel={(e) => (e.target as HTMLInputElement).blur()}
        className={`w-full px-3 py-2 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent ${error ? "border-red-500" : "border-gray-300"
          }`}
        required
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default BudgetInput;
