// PriceRangeSelector.tsx (min = 1L, rupee-integer, ₹1 increments)
import React, { useEffect, useRef, useState } from "react";

interface PriceRangeSelectorProps {
  initialMax?: number; // in Crores (e.g. 0.01 for 1L, 1 = 1 Cr)
  max?: number; // max in Crores (default 10)
  onChange?: (payload: { min: number; max: number; readable: string }) => void; // min/max returned in Crores
  className?: string;
}

const CRORE_TO_RUPEE = 10_000_000;
const LAKH_TO_RUPEE = 100_000;

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

const formatRupeesDisplay = (rupees: number) =>
  currencyFormatter.format(Math.round(rupees)).replace("₹", "₹ ");

const toReadable = (rupees: number) => {
  if (rupees <= 0) return "0L";
  if (rupees < CRORE_TO_RUPEE) {
    const wholeL = Math.round(rupees / LAKH_TO_RUPEE);
    return `${wholeL}L`;
  }
  const cr = rupees / CRORE_TO_RUPEE;
  return `${Number(cr.toFixed(2))}Cr`;
};

const clamp = (v: number, min = 0, max = Infinity) => Math.max(min, Math.min(max, v));

const PriceRangeSelector: React.FC<PriceRangeSelectorProps> = ({
  initialMax = 0.01, // default start = 0.01 Cr -> 1L
  max = 10,
  onChange,
  className = "",
}) => {
  // min = 1 Lakh (₹100,000)
  const minRupees = LAKH_TO_RUPEE;
  const maxRupees = Math.round(max * CRORE_TO_RUPEE);

  // start must be within [minRupees, maxRupees]
  const requestedStart = Math.round(initialMax * CRORE_TO_RUPEE);
  const startRupees = clamp(requestedStart, minRupees, maxRupees);

  const [valueRupees, setValueRupees] = useState<number>(startRupees);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  // Keep latest onChange reference in a ref so effect below doesn't need onChange in deps.
  const onChangeRef = useRef<typeof onChange | undefined>(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // notify parent, return min/max in Crores for backward compatibility
  // Only depend on valueRupees so it won't re-run when parent recreates onChange.
  useEffect(() => {
    // Only call if there's a real callback
    const cb = onChangeRef.current;
    if (!cb) return;
    const readable = toReadable(valueRupees);
    cb({
      min: minRupees / CRORE_TO_RUPEE,
      max: valueRupees / CRORE_TO_RUPEE,
      readable,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueRupees]); // intentionally only depend on valueRupees

  // position mapping based on [minRupees, maxRupees]
  const posFor = (rupees: number) => {
    const v = clamp(rupees, minRupees, maxRupees);
    return ((v - minRupees) / (maxRupees - minRupees)) * 100;
  };
  const position = posFor(valueRupees);

  const pointerToRupees = (clientX: number) => {
    const el = sliderRef.current;
    if (!el) return minRupees;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = clamp(x / rect.width, 0, 1);
    return Math.round(pct * (maxRupees - minRupees)) + minRupees;
  };

  const handleTrackPointerDown = (clientX: number) => {
    const rupees = pointerToRupees(clientX);
    setValueRupees((prev) => {
      const next = clamp(rupees, minRupees, maxRupees);
      return prev === next ? prev : next;
    });
    setIsDragging(true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handlePointerMove = (clientX: number | null) => {
    if (!isDragging || !sliderRef.current || clientX === null) return;
    const rupees = pointerToRupees(clientX);
    setValueRupees((prev) => {
      const next = clamp(rupees, minRupees, maxRupees);
      return prev === next ? prev : next;
    });
  };

  const handlePointerUp = () => setIsDragging(false);

  useEffect(() => {
    const onMouseMove = (ev: MouseEvent) => handlePointerMove(ev.clientX);
    const onMouseUp = () => handlePointerUp();
    const onTouchMove = (ev: TouchEvent) => {
      if (ev.touches.length) {
        ev.preventDefault();
        handlePointerMove(ev.touches[0].clientX);
      }
    };
    const onTouchEnd = () => handlePointerUp();

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      // use same options for add/remove (passive false to allow preventDefault)
      window.addEventListener("touchmove", onTouchMove as EventListener, { passive: false });
      window.addEventListener("touchend", onTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove as EventListener);
      window.removeEventListener("touchend", onTouchEnd);
    };
    // note: we include maxRupees only because pointerToRupees uses it to compute
  }, [isDragging, maxRupees]);

  // --- Manual input parsing (returns RUPEES integer) ---
  const parseManualInputToRupees = (text: string) => {
    const raw = (text || "").trim().toLowerCase();
    if (raw === "" || raw === "0") return minRupees;

    // strip currency symbol and spaces
    const cleaned = raw.replace(/₹/g, "").replace(/\s+/g, "");

    // Primary: pure rupee integer like "100000" or "1,23,021"
    const digitsOnly = cleaned.replace(/,/g, "");
    if (/^\d+$/.test(digitsOnly)) {
      const n = parseInt(digitsOnly, 10);
      if (Number.isNaN(n)) return minRupees;
      return Math.round(n);
    }

    // fallback: Lakh format "50L"
    const lakhMatch = cleaned.match(/^([\d,.]+)l$/);
    if (lakhMatch) {
      const n = parseFloat(lakhMatch[1].replace(/,/g, ""));
      if (Number.isNaN(n)) return minRupees;
      return Math.round(n * LAKH_TO_RUPEE);
    }

    // fallback: Crore format "1.25Cr"
    const croreMatch = cleaned.match(/^([\d,.]+)(cr|c)$/);
    if (croreMatch) {
      const n = parseFloat(croreMatch[1].replace(/,/g, ""));
      if (Number.isNaN(n)) return minRupees;
      return Math.round(n * CRORE_TO_RUPEE);
    }

    // last resort: try parseFloat of digits removed commas
    const n = parseFloat(digitsOnly);
    if (Number.isNaN(n)) return minRupees;
    return Math.round(n);
  };

  const [manualInput, setManualInput] = useState<string>("");
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    if (!showInput) {
      const next = toReadable(valueRupees);
      setManualInput((prev) => (prev === next ? prev : next));
    }
  }, [valueRupees, showInput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualInput(e.target.value);
    const parsed = parseManualInputToRupees(e.target.value);
    if (!Number.isNaN(parsed)) {
      const sanitized = clamp(parsed, minRupees, maxRupees);
      setValueRupees((prev) => (prev === sanitized ? prev : Math.round(sanitized)));
    }
  };

  const handleInputBlur = () => {
    setShowInput(false);
    const parsed = parseManualInputToRupees(manualInput);
    const sanitized = clamp(parsed, minRupees, maxRupees);
    setValueRupees((prev) => (prev === sanitized ? prev : Math.round(sanitized)));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setShowInput(false);
      const parsed = parseManualInputToRupees(manualInput);
      const sanitized = clamp(parsed, minRupees, maxRupees);
      setValueRupees((prev) => (prev === sanitized ? prev : Math.round(sanitized)));
    }
    if (e.key === "Escape") {
      setShowInput(false);
    }
  };

  // --- RIGHT-SIDE INPUT (always visible) ---
  // Now shows plain rupee number (with Indian commas) like "1,23,021" and accepts raw numbers on input
  const [rightInput, setRightInput] = useState<string>(numberFormatter.format(startRupees));

  // whenever slider value changes, update right input (we always sync)
  useEffect(() => {
    const next = numberFormatter.format(valueRupees);
    setRightInput((prev) => (prev === next ? prev : next));
  }, [valueRupees]);

  const handleRightInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const txt = e.target.value;
    // allow user to type digits and commas; keep input as-typed
    setRightInput(txt);

    // Try parse only if there are digits
    const cleaned = txt.replace(/,/g, "").replace(/₹/g, "").trim();
    if (cleaned === "") return; // don't change slider while user is deleting
    // If cleaned is pure digits, parse as rupees
    if (/^\d+$/.test(cleaned)) {
      const n = parseInt(cleaned, 10);
      if (!Number.isNaN(n)) {
        const sanitized = clamp(n, minRupees, maxRupees);
        setValueRupees((prev) => (prev === sanitized ? prev : Math.round(sanitized)));
      }
      return;
    }

    // Also accept "50L" or "1.25Cr" while typing (fallback)
    const parsed = parseManualInputToRupees(txt);
    if (!Number.isNaN(parsed)) {
      const sanitized = clamp(parsed, minRupees, maxRupees);
      setValueRupees((prev) => (prev === sanitized ? prev : Math.round(sanitized)));
    }
  };

  const handleRightInputBlur = () => {
    // normalize display to comma-formatted rupees after blur
    setRightInput(numberFormatter.format(valueRupees));
  };

  return (
    <div className={`w-full max-w-2xl mx-auto p-6 ${className}`}>
      {/* Price Display bubble above handle */}
      <div className="relative mb-6">
        <div
          className="absolute bg-white rounded-full px-4 py-2 shadow-lg border transform -translate-x-1/2 cursor-pointer hover:shadow-xl transition-all duration-200"
          style={{
            left: `${position}%`,
            top: "-50px",
            minWidth: "120px",
            textAlign: "center",
          }}
          onClick={() => setShowInput(true)}
        >
          {showInput ? (
            <input
              className="text-sm font-semibold text-gray-800 bg-transparent border-none outline-none text-center w-full"
              value={manualInput}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              autoFocus
              placeholder="Enter amount (e.g. 500000, 50L, 1.25Cr)"
            />
          ) : (
            <div className="text-sm font-semibold text-gray-800">
              {formatRupeesDisplay(valueRupees)}
            </div>
          )}
        </div>
      </div>

      {/* Slider + Right Input (row) */}
      <div className="flex items-center gap-4">
        {/* Slider track */}
        <div className="flex-1">
          <div className="relative">
            <div
              ref={sliderRef}
              className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
              onMouseDown={(e) => handleTrackPointerDown(e.clientX)}
              onTouchStart={(e) => {
                if (e.touches.length) {
                  handleTrackPointerDown(e.touches[0].clientX);
                  e.preventDefault();
                }
              }}
            >
              {/* Active track */}
              <div
                className="absolute h-full rounded-full bg-orange-500"
                style={{
                  width: `${position}%`,
                }}
              />

              {/* Slider Handle */}
              <div
                role="slider"
                tabIndex={0}
                aria-valuemin={minRupees}
                aria-valuemax={maxRupees}
                aria-valuenow={valueRupees}
                className="absolute w-5 h-5 bg-blue-600 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 top-1/2 hover:scale-110 transition-transform shadow-lg z-20"
                style={{ left: `${position}%` }}
                onMouseDown={handleMouseDown}
                onTouchStart={(e) => {
                  if (e.touches.length) {
                    setIsDragging(true);
                    e.preventDefault();
                  }
                }}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                    setValueRupees((v) => clamp(v - 1, minRupees, maxRupees));
                  }
                  if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                    setValueRupees((v) => clamp(v + 1, minRupees, maxRupees));
                  }
                  if (e.key === "Home") setValueRupees(minRupees);
                  if (e.key === "End") setValueRupees(maxRupees);
                }}
              />
            </div>

            {/* Labels under the track */}
            <div className="flex justify-between text-sm text-gray-600 mt-3">
              <span className="font-medium">{toReadable(minRupees)}</span>
              <span className="font-medium">{max}Cr</span>
            </div>
          </div>
        </div>

        {/* Right-side input - always visible (expects rupee integers like 100000 or 1,23,021) */}
        <div className="w-44 flex-shrink-0">
          <label className="block text-xs text-gray-500 mb-1">Amount (₹)</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9,]*"
            className="w-full border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200"
            value={rightInput}
            onChange={handleRightInputChange}
            onBlur={handleRightInputBlur}
            placeholder="e.g. 500000 or 1,23,021"
            aria-label="Price input in rupees"
          />
          <div className="text-xs text-gray-500 mt-1">{formatRupeesDisplay(valueRupees)}</div>
        </div>
      </div>
    </div>
  );
};

export default PriceRangeSelector;
