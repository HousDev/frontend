import React, { useEffect, useRef, useState } from "react";

interface PriceRangeSelectorProps {
  initialMax?: number;     // in Crores
  minLakh?: number;        // default 20L
  maxCrore?: number; // default 10Cr
  // ✅ ADD THIS
  max?: number;
  onChange?: (payload: { min: number; max: number; readable: string }) => void;
  className?: string;
}

const CRORE_TO_RUPEE = 10_000_000;
const LAKH_TO_RUPEE = 100_000;
const STEP = LAKH_TO_RUPEE;

const numberFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

/* ===========================
   ✅ FIXED: ACTUAL VALUE FORMAT
   =========================== */
const toReadable = (rupees: number) => {
  if (rupees <= 0) return "0L";

  // Lakhs
  if (rupees < CRORE_TO_RUPEE) {
    const lakhs = rupees / LAKH_TO_RUPEE;
    return `${parseFloat(lakhs.toFixed(0))}L`;
  }

  // Crores (NO ROUNDING — actual value)
  const crores = rupees / CRORE_TO_RUPEE;
  return `${parseFloat(crores.toFixed(2))}Cr`;
};

const clamp = (v: number, min = 0, max = Infinity) =>
  Math.max(min, Math.min(max, v));

const snapToStep = (v: number) => Math.round(v / STEP) * STEP;

const PriceRangeSelector: React.FC<PriceRangeSelectorProps> = ({
  minLakh = 0,
  maxCrore = 10,
  initialMax = minLakh / 100,
  onChange,
  className = "",
}) => {
  const minRupees = Math.round(minLakh * LAKH_TO_RUPEE);
  const maxRupees = Math.round(maxCrore * CRORE_TO_RUPEE);

  const requestedStart = Math.round(initialMax * CRORE_TO_RUPEE);
  const startRupees = clamp(
    snapToStep(requestedStart),
    minRupees,
    maxRupees
  );

  const [valueRupees, setValueRupees] = useState(startRupees);
  const [isFocused, setIsFocused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    setValueRupees(startRupees);
  }, [startRupees]);
  const setValueSnapped = (next: number) => {
    const snapped = Math.max(
      snapToStep(next),
      minRupees
    );
    setValueRupees((prev) => (prev === snapped ? prev : snapped));
  };

  useEffect(() => {
    if (isFocused) return; // typing ke time reset mat karo

    const next = clamp(
      snapToStep(Math.round(initialMax * CRORE_TO_RUPEE)),
      minRupees,
      maxRupees
    );

    setValueRupees(next);
  }, [initialMax, minRupees, maxRupees, isFocused]);

  const onChangeRef = useRef<typeof onChange>();
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onChangeRef.current?.({
      min: minRupees / CRORE_TO_RUPEE,
      max: valueRupees / CRORE_TO_RUPEE,
      readable: toReadable(valueRupees),
    });
  }, [valueRupees, minRupees]);

  const posFor = (rupees: number) =>
    ((rupees - minRupees) / (maxRupees - minRupees)) * 100;

  const position = posFor(valueRupees);

  const pointerToRupees = (clientX: number) => {
    const el = sliderRef.current;
    if (!el) return minRupees;
    const rect = el.getBoundingClientRect();
    const pct = clamp((clientX - rect.left) / rect.width, 0, 1);
    return snapToStep(minRupees + pct * (maxRupees - minRupees));
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: MouseEvent) => setValueSnapped(pointerToRupees(e.clientX));
    const onUp = () => setIsDragging(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging]);

  const [rightInput, setRightInput] = useState(
    numberFormatter.format(startRupees)
  );

  useEffect(() => {
    if (!isFocused) {
      setRightInput(numberFormatter.format(valueRupees));
    }
  }, [valueRupees, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let txt = e.target.value;

    // only numbers
    txt = txt.replace(/[^\d]/g, "");

    setRightInput(txt);

    if (!txt) {
      setValueSnapped(0);
      return;
    }

    const value = Number(txt);

    setValueSnapped(value);
  };
  return (
    <div className={`w-full ${className}`}>
      <label className="block text-xs text-gray-500 mb-2">Amount (₹)</label>

      <div className="flex items-center gap-2">
        <input
          inputMode="numeric"
          value={rightInput}
          onFocus={(e) => {
            setIsFocused(true);

            // raw value while editing
            setRightInput(String(valueRupees));

            e.target.select();
          }}
          onChange={handleInputChange}
          onBlur={() => {
            setIsFocused(false);

            if (!rightInput.trim()) {
              setValueSnapped(minRupees);
              setRightInput(numberFormatter.format(minRupees));
              return;
            }

            setRightInput(numberFormatter.format(valueRupees));
          }}
          className="border px-2 py-1.5 rounded text-sm"
        />
        <span className="text-xs font-medium text-green-700">
          {toReadable(valueRupees)}
        </span>
      </div>

      <div className="mt-4">
        <div
          ref={sliderRef}
          className="relative h-2 bg-gray-200 rounded cursor-pointer"
          onMouseDown={(e) => {
            setValueSnapped(pointerToRupees(e.clientX));
            setIsDragging(true);
          }}
        >
          <div
            className="absolute h-full bg-orange-500 rounded"
            style={{ width: `${position}%` }}
          />
          <div
            className="absolute w-4 h-4 bg-orange-600 rounded-full top-1/2 -translate-y-1/2 -translate-x-1/2"
            style={{ left: `${position}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{toReadable(minRupees)}</span>
          <span>{toReadable(maxRupees)}</span>
        </div>
      </div>
    </div>
  );
};

export default PriceRangeSelector;
