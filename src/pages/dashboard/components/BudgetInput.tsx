import React, { useState } from "react";

interface BudgetInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  onFocus?: () => void; // optional now
}

/** Convert number → words (Indian system) */
const numberToWords = (num: number | null): string => {
  if (num === null || num === undefined || Number.isNaN(num) || num === 0)
    return "";

  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const makeWords = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100)
      return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " + makeWords(n % 100) : "")
      );
    return "";
  };

  let str = "";
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num / 100000) % 100);
  const thousand = Math.floor((num / 1000) % 100);
  const hundred = Math.floor((num / 100) % 10);
  const rest = num % 100;

  if (crore) str += makeWords(crore) + " Crore ";
  if (lakh) str += makeWords(lakh) + " Lakh ";
  if (thousand) str += makeWords(thousand) + " Thousand ";
  if (hundred) str += makeWords(hundred) + " Hundred ";
  if (rest) str += makeWords(rest);

  return str.trim();
};

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
  const [inWords, setInWords] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // remove all non-digit characters
    const cleaned = raw.replace(/\D+/g, "");
    onChange(cleaned);

    const num = cleaned ? Number(cleaned) : NaN;
    setInWords(!Number.isNaN(num) && num > 0 ? numberToWords(num) : "");
  };

  // display value with commas for user friendliness
  const displayValue = value ? formatWithCommas(value) : "";

  return (
    <div className="flex-1">
      <label className="block text-xs font-medium text-gray-700 mb-1">
        Budget (₹, Indian format)*
      </label>
      <input
        type="text"
        placeholder="e.g., 50,00,000"
        value={displayValue}
        onChange={handleChange}
        onFocus={() => onFocus?.()}
        className={`w-full px-3 py-2 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent ${error ? "border-red-500" : "border-gray-300"
          }`}
        required
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {inWords && (
        <p className="text-xs text-green-600 mt-2">{inWords} Rupees</p>
      )}
    </div>
  );
};

export default BudgetInput;
