// import React, { useEffect, useRef, useState } from "react";

// interface PriceRangeSelectorProps {
//   /** Selected ceiling in Crores (e.g. 0.30 = 30L). Defaults to the min bound. */
//   initialMax?: number;
//   /** (Optional) lower bound in Lakhs. Default 30 (i.e., 30L). */
//   minLakh?: number;
//   /** (Optional) upper bound in Crores. Default 5 (i.e., 5Cr). */
//   maxCrore?: number;
//   /** Back-compat: ignore if you pass maxCrore. */
//   max?: number;
//   onChange?: (payload: { min: number; max: number; readable: string }) => void; // min/max returned in Crores
//   className?: string;
// }

// const CRORE_TO_RUPEE = 10_000_000;
// const LAKH_TO_RUPEE = 100_000;
// const STEP = LAKH_TO_RUPEE; // snap to 1L

// const numberFormatter = new Intl.NumberFormat("en-IN", {
//   maximumFractionDigits: 0,
// });

// const toReadable = (rupees: number) => {
//   if (rupees <= 0) return "0L";
//   if (rupees < CRORE_TO_RUPEE) {
//     const wholeL = Math.round(rupees / LAKH_TO_RUPEE);
//     return `${wholeL}L`;
//   }
//   const cr = rupees / CRORE_TO_RUPEE;
//   return `${Number(cr.toFixed(2))}Cr`;
// };

// const clamp = (v: number, min = 0, max = Infinity) => Math.max(min, Math.min(max, v));
// const snapToStep = (v: number) => Math.round(v / STEP) * STEP;

// const PriceRangeSelector: React.FC<PriceRangeSelectorProps> = ({
//   // Default range: 30L → 5Cr
//   minLakh = 20,
//   maxCrore = 5,
//   // default the selected ceiling to the min bound (i.e., 30L = 0.30 Cr)
//   initialMax = minLakh / 100,
//   onChange,
//   className = "",
// }) => {
//   // bounds (in rupees)
//   const minRupees = Math.round(minLakh * LAKH_TO_RUPEE);
//   const maxRupees = Math.round(maxCrore * CRORE_TO_RUPEE);

//   // starting value (in rupees) from initialMax in Crores
//   const requestedStart = Math.round(initialMax * CRORE_TO_RUPEE);
//   const startRupees = clamp(snapToStep(requestedStart), minRupees, maxRupees);

//   const [valueRupees, setValueRupees] = useState<number>(startRupees);
//   const [isDragging, setIsDragging] = useState(false);
//   const sliderRef = useRef<HTMLDivElement | null>(null);

//   // helper to set with clamp+snap once
//   const setValueSnapped = (next: number) => {
//     const snapped = clamp(snapToStep(next), minRupees, maxRupees);
//     setValueRupees((prev) => (prev === snapped ? prev : snapped));
//   };

//   // keep internal value in sync with prop changes (prefill on edit / toggle)
//   useEffect(() => {
//     const next = clamp(snapToStep(Math.round(initialMax * CRORE_TO_RUPEE)), minRupees, maxRupees);
//     setValueRupees((prev) => (prev === next ? prev : next));
//   }, [initialMax, minRupees, maxRupees]);

//   // stable onChange
//   const onChangeRef = useRef<typeof onChange | undefined>(onChange);
//   useEffect(() => {
//     onChangeRef.current = onChange;
//   }, [onChange]);

//   useEffect(() => {
//     const cb = onChangeRef.current;
//     if (!cb) return;
//     cb({
//       // return min/max in Crores
//       min: minRupees / CRORE_TO_RUPEE,
//       max: valueRupees / CRORE_TO_RUPEE,
//       readable: toReadable(valueRupees),
//     });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [valueRupees, minRupees]);

//   // mapping
//   const posFor = (rupees: number) => {
//     const v = clamp(rupees, minRupees, maxRupees);
//     return ((v - minRupees) / (maxRupees - minRupees)) * 100;
//   };
//   const position = posFor(valueRupees);

//   const pointerToRupees = (clientX: number) => {
//     const el = sliderRef.current;
//     if (!el) return minRupees;
//     const rect = el.getBoundingClientRect();
//     const x = clientX - rect.left;
//     const pct = clamp(x / rect.width, 0, 1);
//     const raw = Math.round(pct * (maxRupees - minRupees)) + minRupees;
//     return snapToStep(raw);
//   };

//   const handlePointerMove = (clientX: number | null) => {
//     if (!isDragging || !sliderRef.current || clientX === null) return;
//     setValueSnapped(pointerToRupees(clientX));
//   };

//   const handlePointerUp = () => setIsDragging(false);

//   useEffect(() => {
//     const onMouseMove = (ev: MouseEvent) => handlePointerMove(ev.clientX);
//     const onMouseUp = () => handlePointerUp();
//     const onTouchMove = (ev: TouchEvent) => {
//       if (ev.touches.length) {
//         ev.preventDefault();
//         handlePointerMove(ev.touches[0].clientX);
//       }
//     };
//     const onTouchEnd = () => handlePointerUp();

//     if (isDragging) {
//       window.addEventListener("mousemove", onMouseMove);
//       window.addEventListener("mouseup", onMouseUp);
//       window.addEventListener("touchmove", onTouchMove as EventListener, { passive: false });
//       window.addEventListener("touchend", onTouchEnd);
//     }
//     return () => {
//       window.removeEventListener("mousemove", onMouseMove);
//       window.removeEventListener("mouseup", onMouseUp);
//       window.removeEventListener("touchmove", onTouchMove as EventListener);
//       window.removeEventListener("touchend", onTouchEnd);
//     };
//   }, [isDragging, maxRupees, minRupees]);

//   // right-side input
//   const [rightInput, setRightInput] = useState<string>(numberFormatter.format(startRupees));

//   useEffect(() => {
//     const next = numberFormatter.format(valueRupees);
//     setRightInput((prev) => (prev === next ? prev : next));
//   }, [valueRupees]);

//   const handleRightInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const txt = e.target.value;
//     setRightInput(txt);

//     const cleaned = txt.replace(/,/g, "").replace(/₹/g, "").trim();
//     if (cleaned === "") return;

//     if (/^\d+$/.test(cleaned)) {
//       const n = parseInt(cleaned, 10);
//       if (!Number.isNaN(n)) setValueSnapped(n);
//       return;
//     }

//     // allow "80L", "1.2Cr", "0.99Cr" etc.
//     const lowered = cleaned.toLowerCase();
//     let n = NaN;
//     if (/l$/.test(lowered)) n = parseFloat(lowered.replace("l", "")) * LAKH_TO_RUPEE;
//     if (/cr$|c$/.test(lowered)) n = parseFloat(lowered.replace(/cr|c/, "").trim()) * CRORE_TO_RUPEE;
//     if (!Number.isNaN(n)) setValueSnapped(n);
//   };

//   const handleRightInputBlur = () => {
//     setRightInput(numberFormatter.format(valueRupees));
//   };

//   // ----------------------- RENDER -----------------------
//   return (
//     <div className={`w-full ${className}`}>
//       <div className="w-56 flex-shrink-0">
//         <label className="block text-xs text-gray-500 mb-2">Amount (₹)</label>

//         <div className="flex items-center">
//           <input
//             type="text"
//             inputMode="numeric"
//             pattern="[0-9,]*"
//             className="flex-1 border rounded px-2 py-1.5 text-sm outline-none"
//             value={rightInput}
//             onChange={handleRightInputChange}
//             onBlur={handleRightInputBlur}
//             placeholder="50,00,000"
//             aria-label="Price input in rupees"
//           />

//           {/* suffix outside box */}
//           <span className="ml-2 text-[11px] font-medium text-green-700 whitespace-nowrap">
//             {toReadable(valueRupees)}
//           </span>
//         </div>
//       </div>

//       {/* Slider */}
//       <div className="flex items-center gap-3">
//         <div className="flex-1  mt-4">
//           <div className="relative">
//             <div
//               ref={sliderRef}
//               className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
//               onMouseDown={(e) => {
//                 setValueSnapped(pointerToRupees(e.clientX));
//                 setIsDragging(true);
//               }}
//               onTouchStart={(e) => {
//                 if (e.touches.length) {
//                   setValueSnapped(pointerToRupees(e.touches[0].clientX));
//                   setIsDragging(true);
//                   e.preventDefault();
//                 }
//               }}
//             >
//               {/* Active track */}
//               <div className="absolute h-full rounded-full bg-orange-500" style={{ width: `${position}%` }} />

//               {/* Handle */}
//               <div
//                 role="slider"
//                 tabIndex={0}
//                 aria-valuemin={minRupees}
//                 aria-valuemax={maxRupees}
//                 aria-valuenow={valueRupees}
//                 className="absolute w-4 h-4 bg-orange-600 rounded-full cursor-pointer
//                            transform -translate-x-1/2 -translate-y-1/2 top-1/2
//                            hover:scale-110 transition-transform shadow-md z-20"
//                 style={{ left: `${position}%` }}
//                 onMouseDown={(e) => {
//                   e.preventDefault();
//                   setIsDragging(true);
//                 }}
//                 onTouchStart={(e) => {
//                   if (e.touches.length) {
//                     setIsDragging(true);
//                     e.preventDefault();
//                   }
//                 }}
//                 onKeyDown={(e: React.KeyboardEvent) => {
//                   if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
//                     setValueSnapped(valueRupees - STEP);
//                   }
//                   if (e.key === "ArrowRight" || e.key === "ArrowUp") {
//                     setValueSnapped(valueRupees + STEP);
//                   }
//                   if (e.key === "Home") setValueSnapped(minRupees);
//                   if (e.key === "End") setValueSnapped(maxRupees);
//                 }}
//               />
//             </div>

//             {/* Labels under the track */}
//             <div className="flex justify-between text-xs text-gray-500 mt-1">
//               <span className="font-medium">{toReadable(minRupees)}</span>
//               <span className="font-medium">{toReadable(maxRupees)}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PriceRangeSelector;

import React, { useEffect, useRef, useState } from "react";

interface PriceRangeSelectorProps {
  initialMax?: number;     // in Crores
  minLakh?: number;        // default 20L
  maxCrore?: number; // default 5Cr
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
  minLakh = 20,
  maxCrore = 5,
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
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const setValueSnapped = (next: number) => {
    const snapped = clamp(snapToStep(next), minRupees, maxRupees);
    setValueRupees((prev) => (prev === snapped ? prev : snapped));
  };

  useEffect(() => {
    const next = clamp(
      snapToStep(Math.round(initialMax * CRORE_TO_RUPEE)),
      minRupees,
      maxRupees
    );
    setValueRupees((prev) => (prev === next ? prev : next));
  }, [initialMax, minRupees, maxRupees]);

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
    setRightInput(numberFormatter.format(valueRupees));
  }, [valueRupees]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const txt = e.target.value;
    setRightInput(txt);

    const cleaned = txt.replace(/,/g, "").toLowerCase();

    if (/^\d+$/.test(cleaned)) {
      setValueSnapped(parseInt(cleaned, 10));
      return;
    }

    if (cleaned.endsWith("l")) {
      setValueSnapped(parseFloat(cleaned) * LAKH_TO_RUPEE);
      return;
    }

    if (cleaned.endsWith("cr")) {
      setValueSnapped(parseFloat(cleaned) * CRORE_TO_RUPEE);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <label className="block text-xs text-gray-500 mb-2">Amount (₹)</label>

      <div className="flex items-center gap-2">
        <input
          value={rightInput}
          onChange={handleInputChange}
          onBlur={() =>
            setRightInput(numberFormatter.format(valueRupees))
          }
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
