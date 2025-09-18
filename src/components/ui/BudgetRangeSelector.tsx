// src/components/BudgetRangeSelector.tsx
import React, { useEffect, useRef, useState } from "react";

interface BudgetRangeSelectorProps {
  /**
   * initialMin / initialMax are expected to be in CRORES.
   * Example: 0.85 means 0.85 Cr (i.e. 8.5 Lacs).
   */
  initialMin?: number; // in Crores (e.g. 0.32 means 32 L)
  initialMax?: number; // in Crores
  max?: number; // upper bound in Crores (logical max for data, but visual slider cap is sliderLimit)
  /**
   * onChange payload:
   * - min, max: numeric RUPEES (integers) — ready to send to backend/db
   * - readable: human-friendly string (e.g. "₹0.85Cr - ₹2.00Cr")
   */
  onChange?: (payload: { min: number; max: number; readable: string }) => void;
  className?: string;
  sliderLimit?: number; // visual slider cap (default 6)
  collisionThresholdPercent?: number; // optional tweak for when labels "collide"
}

const BudgetRangeSelector: React.FC<BudgetRangeSelectorProps> = ({
  initialMin = 0.32,
  initialMax = 4.95,
  max = 10,
  onChange,
  className = "",
  sliderLimit = 6,
  collisionThresholdPercent = 6,
}) => {
  // Helper
  const clamp = (v: number) => (Number.isNaN(v) ? 0 : Math.max(0, v));

  // init in CRORES (component internal unit)
  const initMin = clamp(Math.min(initialMin, initialMax));
  const initMax = clamp(Math.max(initialMin, initialMax));

  const [minBudget, setMinBudget] = useState<number>(initMin); // in crores
  const [maxBudget, setMaxBudget] = useState<number>(initMax); // in crores
  const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const sliderScale = sliderLimit > 0 ? sliderLimit : 6;
  const TICKS = Array.from({ length: Math.floor(sliderScale) + 1 }, (_, i) => i);

  // Format the value for UI display
  const formatBudget = (value: number) => {
    if (value <= 0) return "₹0";
    if (value < 1) {
      // value is fractional crores, show as Lacs (rounded)
      return `₹${Math.round(value * 100)}L`;
    }
    const suffix = value >= sliderScale ? "+" : "";
    const display = Number.isInteger(value) ? value.toString() : value.toFixed(2);
    return `₹${display}Cr${suffix}`;
  };

  // Convert crores -> rupees and emit to parent whenever min/max change
  useEffect(() => {
    const readable = `${formatBudget(minBudget)} - ${formatBudget(maxBudget)}`;

    // Convert crores to rupees (1 Cr = 10,000,000)
    const CRORE_TO_RUPEE = 10_000_000;
    const minRupees = Math.round(minBudget * CRORE_TO_RUPEE);
    const maxRupees = Math.round(maxBudget * CRORE_TO_RUPEE);

    onChange?.({ min: minRupees, max: maxRupees, readable });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minBudget, maxBudget]);

  const pointerToValue = (clientX: number) => {
    const rect = sliderRef.current;
    if (!rect) return 0;
    const bounds = rect.getBoundingClientRect();
    const x = clientX - bounds.left;
    const pct = Math.max(0, Math.min(1, x / bounds.width));
    return Number((pct * sliderScale).toFixed(2));
  };

  const handleTrackPointerDown = (clientX: number) => {
    const value = pointerToValue(clientX);
    const minCompare = Math.min(minBudget, sliderScale);
    const maxCompare = Math.min(maxBudget, sliderScale);
    const distToMin = Math.abs(value - minCompare);
    const distToMax = Math.abs(value - maxCompare);
    if (distToMin <= distToMax) {
      const v = Math.min(value, sliderScale);
      setMinBudget(Number(Math.max(0, v).toFixed(2)));
      setIsDragging("min");
    } else {
      const v = Math.min(value, sliderScale);
      setMaxBudget(Number(Math.min(max, v).toFixed(2)));
      setIsDragging("max");
    }
  };

  const handleMouseDown = (e: React.MouseEvent, type: "min" | "max") => {
    e.preventDefault();
    setIsDragging(type);
  };

  const handlePointerMove = (clientX: number | null) => {
    if (!isDragging || !sliderRef.current || clientX === null) return;
    const newVal = pointerToValue(clientX);
    if (isDragging === "min") {
      setMinBudget(Number(Math.max(0, Math.min(sliderScale, newVal)).toFixed(2)));
    } else {
      setMaxBudget(Number(Math.max(0, Math.min(max, newVal)).toFixed(2)));
    }
  };

  const handlePointerUp = () => setIsDragging(null);

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
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("touchend", onTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, minBudget, maxBudget, sliderScale]);

  const posFor = (val: number) => {
    const v = Math.min(val, sliderScale);
    return (v / sliderScale) * 100;
  };
  const minPosition = posFor(minBudget);
  const maxPosition = posFor(maxBudget);
  const midPosition = (minPosition + maxPosition) / 2;

  // Manual numeric inputs: when user types in the small input boxes
  // For values < 1 (crore) the UI expects Lacs input (e.g. 32), we convert to crores internally.
  const handleManualMinChange = (rawVal: number) => {
    const v = Number.isNaN(rawVal) ? 0 : rawVal;
    const value = minBudget < 1 ? v / 100 : v;
    if (value >= 0) setMinBudget(Number(value.toFixed(2)));
  };

  const handleManualMaxChange = (rawVal: number) => {
    const v = Number.isNaN(rawVal) ? 0 : rawVal;
    const value = maxBudget < 1 ? v / 100 : v;
    if (value >= 0) setMaxBudget(Number(value.toFixed(2)));
  };

  const compactStyleBlock = `
    /* hide number input spinners (Chrome, Edge, Safari) */
    input[type=number]::-webkit-outer-spin-button,
    input[type=number]::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    /* hide Firefox spinner */
    input[type=number] {
      -moz-appearance: textfield;
    }
  `;

  const minDisplayValue =
    minBudget < 1 ? String(Math.round(minBudget * 100)) : String(Number(minBudget.toFixed(2)));
  const maxDisplayValue =
    maxBudget < 1 ? String(Math.round(maxBudget * 100)) : String(Number(maxBudget.toFixed(2)));

  // collision logic: if handles are within collisionThresholdPercent, show single centered label
  const distance = Math.abs(maxPosition - minPosition);
  const isColliding = distance <= collisionThresholdPercent;

  return (
    <>
      <div className="grid grid-cols-3 gap-2 items-end text-xs mb-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Minimum Budget {minBudget < 1 ? "(Lacs)" : "(Crores)"}
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              step={minBudget < 1 ? 1 : 0.01}
              value={minDisplayValue}
              onChange={(e) => {
                const raw = e.target.value === "" ? "0" : e.target.value;
                const parsed = parseFloat(raw);
                handleManualMinChange(parsed);
              }}
              className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              placeholder={minBudget < 1 ? "e.g. 32" : "e.g. 0.32"}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
              {minBudget < 1 ? "L" : "Cr"}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Maximum Budget {maxBudget < 1 ? "(Lacs)" : "(Crores)"}
          </label>
          <div className="relative">
            <input
              type="number"
              min={0}
              step={maxBudget < 1 ? 1 : 0.01}
              value={maxDisplayValue}
              onChange={(e) => {
                const raw = e.target.value === "" ? "0" : e.target.value;
                const parsed = parseFloat(raw);
                handleManualMaxChange(parsed);
              }}
              className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
              placeholder={maxBudget < 1 ? "e.g. 32" : "e.g. 0.32"}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
              {maxBudget < 1 ? "L" : "Cr"}
              {maxBudget >= sliderScale ? "+" : ""}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => {
              setMinBudget(0.32);
              setMaxBudget(Math.min(4.95, max));
            }}
            className="px-3 py-1 text-xs border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            Reset to Default
          </button>
        </div>
      </div>

      <div className={`max-w-full ${className}`}>
        <style>{compactStyleBlock}</style>

        <div className="relative">
          {/* Hover / Tooltip labels */}
          <div className="relative h-6 mb-1 pointer-events-none">
            {isColliding ? (
              // single centered aggregated label when close
              <div
                className="absolute text-xs font-medium text-gray-700 transform -translate-x-1/2 bg-white px-2 py-0.5 rounded shadow-sm border"
                style={{ left: `${midPosition}%`, top: "-.2rem", whiteSpace: "nowrap" }}
                aria-hidden
              >
                {formatBudget(minBudget)} - {formatBudget(maxBudget)}
              </div>
            ) : (
              <>
                <div
                  className="absolute text-xs font-medium text-gray-700 transform -translate-x-1/2 bg-white px-2 py-0.5 rounded shadow-sm border"
                  style={{
                    left: `${minPosition}%`,
                    top: "-.2rem",
                    whiteSpace: "nowrap",
                  }}
                  aria-hidden
                >
                  {formatBudget(minBudget)}
                </div>
                <div
                  className="absolute text-xs font-medium text-gray-700 transform -translate-x-1/2 bg-white px-2 py-0.5 rounded shadow-sm border"
                  style={{
                    left: `${maxPosition}%`,
                    top: "-.2rem",
                    whiteSpace: "nowrap",
                  }}
                  aria-hidden
                >
                  {formatBudget(maxBudget)}
                </div>
              </>
            )}
          </div>

          {/* Track */}
          <div
            ref={sliderRef}
            className="relative h-2 bg-gray-200 rounded-full mb-2 cursor-pointer"
            onMouseDown={(e) => handleTrackPointerDown(e.clientX)}
            onTouchStart={(e) => {
              if (e.touches.length) {
                handleTrackPointerDown(e.touches[0].clientX);
                e.preventDefault();
              }
            }}
          >
            <div
              className="absolute rounded-full"
              style={{
                height: "100%",
                left: `${Math.min(minPosition, maxPosition)}%`,
                width: `${Math.abs(maxPosition - minPosition)}%`,
                background: "linear-gradient(90deg,#7c3aed,#6d28d9)",
              }}
            />

            {/* left handle */}
            <div
              role="slider"
              tabIndex={0}
              aria-valuemin={0}
              aria-valuemax={sliderScale}
              aria-valuenow={Math.min(minBudget, sliderScale)}
              className="absolute w-4 h-4 bg-white border-2 border-purple-500 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 top-1/2 hover:scale-105 transition-transform shadow z-20"
              style={{ left: `${minPosition}%` }}
              onMouseDown={(e) => handleMouseDown(e, "min")}
              onTouchStart={(e) => {
                if (e.touches.length) {
                  setIsDragging("min");
                  e.preventDefault();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft" || e.key === "ArrowDown")
                  setMinBudget((v) => Number(Math.max(0, Number((v - 0.01).toFixed(2)))));
                if (e.key === "ArrowRight" || e.key === "ArrowUp")
                  setMinBudget((v) => Number(Math.min(sliderScale, Number((v + 0.01).toFixed(2)))));
              }}
            />

            {/* right handle */}
            <div
              role="slider"
              tabIndex={0}
              aria-valuemin={0}
              aria-valuemax={sliderScale}
              aria-valuenow={Math.min(maxBudget, sliderScale)}
              className="absolute w-4 h-4 bg-white border-2 border-purple-500 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 top-1/2 hover:scale-105 transition-transform shadow z-20"
              style={{ left: `${maxPosition}%` }}
              onMouseDown={(e) => handleMouseDown(e, "max")}
              onTouchStart={(e) => {
                if (e.touches.length) {
                  setIsDragging("max");
                  e.preventDefault();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft" || e.key === "ArrowDown")
                  setMaxBudget((v) => Number(Math.max(0, Number((v - 0.01).toFixed(2)))));
                if (e.key === "ArrowRight" || e.key === "ArrowUp")
                  setMaxBudget((v) => Number(Math.min(max, Number((v + 0.01).toFixed(2)))));
              }}
            />

            {/* Tick marks */}
            {TICKS.map((t) => {
              const left = (t / sliderScale) * 100;
              return (
                <div
                  key={String(t)}
                  style={{ left: `${left}%` }}
                  className="absolute top-0 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                >
                  <div className="w-0.5 h-3 bg-gray-400 rounded" />
                </div>
              );
            })}
          </div>

          {/* Tick labels */}
          <div className="flex justify-between text-xs text-gray-600 mb-2">
            {TICKS.map((t) => (
              <span key={String(t)} className="transform -translate-x-1/2">
                {t === 0 ? "₹0" : t === sliderScale ? `₹${t}Cr+` : `₹${t}Cr`}
              </span>
            ))}
          </div>

          <div className="flex justify-center items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-600">Selected Range :</span>
            <span className="text-xs font-bold text-purple-600">
              {formatBudget(minBudget)} - {formatBudget(maxBudget)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default BudgetRangeSelector;
