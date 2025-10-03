// // PriceRangeSelector.tsx (min = 1L, rupee-integer, ₹1 increments)
// import React, { useEffect, useRef, useState } from "react";

// interface PriceRangeSelectorProps {
//   initialMax?: number; // in Crores (e.g. 0.01 for 1L, 1 = 1 Cr)
//   max?: number; // max in Crores (default 10)
//   onChange?: (payload: { min: number; max: number; readable: string }) => void; // min/max returned in Crores
//   className?: string;
// }

// const CRORE_TO_RUPEE = 10_000_000;
// const LAKH_TO_RUPEE = 100_000;

// const currencyFormatter = new Intl.NumberFormat("en-IN", {
//   style: "currency",
//   currency: "INR",
//   maximumFractionDigits: 0,
// });

// const numberFormatter = new Intl.NumberFormat("en-IN", {
//   maximumFractionDigits: 0,
// });

// const formatRupeesDisplay = (rupees: number) =>
//   currencyFormatter.format(Math.round(rupees)).replace("₹", "₹ ");

// const toReadable = (rupees: number) => {
//   if (rupees <= 0) return "0L";
//   if (rupees < CRORE_TO_RUPEE) {
//     const wholeL = Math.round(rupees / LAKH_TO_RUPEE);
//     return `${wholeL}L`;
//   }
//   const cr = rupees / CRORE_TO_RUPEE;
//   return `${Number(cr.toFixed(2))}Cr`;
// };

// const clamp = (v: number, min = 0, max = Infinity) =>
//   Math.max(min, Math.min(max, v));

// const PriceRangeSelector: React.FC<PriceRangeSelectorProps> = ({
//   initialMax = 0.01, // 1L
//   max = 10,
//   onChange,
//   className = "",
// }) => {
//   // bounds
//   const minRupees = LAKH_TO_RUPEE; // 1L
//   const maxRupees = Math.round(max * CRORE_TO_RUPEE);

//   // starting value
//   const requestedStart = Math.round(initialMax * CRORE_TO_RUPEE);
//   const startRupees = clamp(requestedStart, minRupees, maxRupees);

//   const [valueRupees, setValueRupees] = useState<number>(startRupees);
//   const [isDragging, setIsDragging] = useState(false);
//   const sliderRef = useRef<HTMLDivElement | null>(null);

//   // stable onChange
//   const onChangeRef = useRef<typeof onChange | undefined>(onChange);
//   useEffect(() => {
//     onChangeRef.current = onChange;
//   }, [onChange]);

//   useEffect(() => {
//     const cb = onChangeRef.current;
//     if (!cb) return;
//     cb({
//       min: minRupees / CRORE_TO_RUPEE,
//       max: valueRupees / CRORE_TO_RUPEE,
//       readable: toReadable(valueRupees),
//     });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [valueRupees]);

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
//     return Math.round(pct * (maxRupees - minRupees)) + minRupees;
//   };

//   const handleTrackPointerDown = (clientX: number) => {
//     const rupees = pointerToRupees(clientX);
//     setValueRupees((prev) => {
//       const next = clamp(rupees, minRupees, maxRupees);
//       return prev === next ? prev : next;
//     });
//     setIsDragging(true);
//   };

//   const handleMouseDown = (e: React.MouseEvent) => {
//     e.preventDefault();
//     setIsDragging(true);
//   };

//   const handlePointerMove = (clientX: number | null) => {
//     if (!isDragging || !sliderRef.current || clientX === null) return;
//     const rupees = pointerToRupees(clientX);
//     setValueRupees((prev) => {
//       const next = clamp(rupees, minRupees, maxRupees);
//       return prev === next ? prev : next;
//     });
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
//       window.addEventListener("touchmove", onTouchMove as EventListener, {
//         passive: false,
//       });
//       window.addEventListener("touchend", onTouchEnd);
//     }
//     return () => {
//       window.removeEventListener("mousemove", onMouseMove);
//       window.removeEventListener("mouseup", onMouseUp);
//       window.removeEventListener("touchmove", onTouchMove as EventListener);
//       window.removeEventListener("touchend", onTouchEnd);
//     };
//   }, [isDragging, maxRupees]);

//   // manual input (bubble)
//   const parseManualInputToRupees = (text: string) => {
//     const raw = (text || "").trim().toLowerCase();
//     if (raw === "" || raw === "0") return minRupees;
//     const cleaned = raw.replace(/₹/g, "").replace(/\s+/g, "");
//     const digitsOnly = cleaned.replace(/,/g, "");

//     if (/^\d+$/.test(digitsOnly)) {
//       const n = parseInt(digitsOnly, 10);
//       if (Number.isNaN(n)) return minRupees;
//       return Math.round(n);
//     }
//     const lakhMatch = cleaned.match(/^([\d,.]+)l$/);
//     if (lakhMatch) {
//       const n = parseFloat(lakhMatch[1].replace(/,/g, ""));
//       if (Number.isNaN(n)) return minRupees;
//       return Math.round(n * LAKH_TO_RUPEE);
//     }
//     const croreMatch = cleaned.match(/^([\d,.]+)(cr|c)$/);
//     if (croreMatch) {
//       const n = parseFloat(croreMatch[1].replace(/,/g, ""));
//       if (Number.isNaN(n)) return minRupees;
//       return Math.round(n * CRORE_TO_RUPEE);
//     }
//     const n = parseFloat(digitsOnly);
//     if (Number.isNaN(n)) return minRupees;
//     return Math.round(n);
//   };

//   const [manualInput, setManualInput] = useState<string>("");
//   const [showInput, setShowInput] = useState(false);

//   useEffect(() => {
//     if (!showInput) {
//       const next = toReadable(valueRupees);
//       setManualInput((prev) => (prev === next ? prev : next));
//     }
//   }, [valueRupees, showInput]);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setManualInput(e.target.value);
//     const parsed = parseManualInputToRupees(e.target.value);
//     if (!Number.isNaN(parsed)) {
//       const sanitized = clamp(parsed, minRupees, maxRupees);
//       setValueRupees((prev) =>
//         prev === sanitized ? prev : Math.round(sanitized)
//       );
//     }
//   };

//   const handleInputBlur = () => {
//     setShowInput(false);
//     const parsed = parseManualInputToRupees(manualInput);
//     const sanitized = clamp(parsed, minRupees, maxRupees);
//     setValueRupees((prev) =>
//       prev === sanitized ? prev : Math.round(sanitized)
//     );
//   };

//   const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter") {
//       setShowInput(false);
//       const parsed = parseManualInputToRupees(manualInput);
//       const sanitized = clamp(parsed, minRupees, maxRupees);
//       setValueRupees((prev) =>
//         prev === sanitized ? prev : Math.round(sanitized)
//       );
//     }
//     if (e.key === "Escape") setShowInput(false);
//   };

//   // right-side input
//   const [rightInput, setRightInput] = useState<string>(
//     numberFormatter.format(startRupees)
//   );

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
//       if (!Number.isNaN(n)) {
//         const sanitized = clamp(n, minRupees, maxRupees);
//         setValueRupees((prev) =>
//           prev === sanitized ? prev : Math.round(sanitized)
//         );
//       }
//       return;
//     }
//     const parsed = parseManualInputToRupees(txt);
//     if (!Number.isNaN(parsed)) {
//       const sanitized = clamp(parsed, minRupees, maxRupees);
//       setValueRupees((prev) =>
//         prev === sanitized ? prev : Math.round(sanitized)
//       );
//     }
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

//       {/* Slider + Right Input */}
//       <div className="flex items-center gap-3">
//         {/* Slider track */}
//         <div className="flex-1  mt-4">
//           <div className="relative">
//             <div
//               ref={sliderRef}
//               className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
//               onMouseDown={(e) => handleTrackPointerDown(e.clientX)}
//               onTouchStart={(e) => {
//                 if (e.touches.length) {
//                   handleTrackPointerDown(e.touches[0].clientX);
//                   e.preventDefault();
//                 }
//               }}
//             >
//               {/* Active track */}
//               <div
//                 className="absolute h-full rounded-full bg-orange-500"
//                 style={{ width: `${position}%` }}
//               />

//               {/* Slider Handle */}
//               <div
//                 role="slider"
//                 tabIndex={0}
//                 aria-valuemin={minRupees}
//                 aria-valuemax={maxRupees}
//                 aria-valuenow={valueRupees}
//                 className="absolute w-5 h-5 bg-orange-600 rounded-full cursor-pointer
//                            transform -translate-x-1/2 -translate-y-1/2 top-1/2
//                            hover:scale-110 transition-transform shadow-md z-20"
//                 style={{ left: `${position}%` }}
//                 onMouseDown={handleMouseDown}
//                 onTouchStart={(e) => {
//                   if (e.touches.length) {
//                     setIsDragging(true);
//                     e.preventDefault();
//                   }
//                 }}
//                 onKeyDown={(e: React.KeyboardEvent) => {
//                   if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
//                     setValueRupees((v) => clamp(v - 1, minRupees, maxRupees));
//                   }
//                   if (e.key === "ArrowRight" || e.key === "ArrowUp") {
//                     setValueRupees((v) => clamp(v + 1, minRupees, maxRupees));
//                   }
//                   if (e.key === "Home") setValueRupees(minRupees);
//                   if (e.key === "End") setValueRupees(maxRupees);
//                 }}
//               />
//             </div>

//             {/* Labels under the track */}
//             <div className="flex justify-between text-xs text-gray-500 mt-1">
//               <span className="font-medium">1 L</span>
//               <span className="font-medium">{max} Cr</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PriceRangeSelector;

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

const toReadable = (rupees: number) => {
  if (rupees <= 0) return "0L";
  if (rupees < CRORE_TO_RUPEE) {
    const wholeL = Math.round(rupees / LAKH_TO_RUPEE);
    return `${wholeL}L`;
  }
  const cr = rupees / CRORE_TO_RUPEE;
  return `${Number(cr.toFixed(2))}Cr`;
};

const clamp = (v: number, min = 0, max = Infinity) =>
  Math.max(min, Math.min(max, v));

const PriceRangeSelector: React.FC<PriceRangeSelectorProps> = ({
  initialMax = 0.01, // 1L
  max = 10,
  onChange,
  className = "",
}) => {
  // bounds
  const minRupees = LAKH_TO_RUPEE; // 1L
  const maxRupees = Math.round(max * CRORE_TO_RUPEE);

  // starting value
  const requestedStart = Math.round(initialMax * CRORE_TO_RUPEE);
  const startRupees = clamp(requestedStart, minRupees, maxRupees);

  const [valueRupees, setValueRupees] = useState<number>(startRupees);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  // keep internal value in sync with prop changes (prefill on edit / toggle)
  useEffect(() => {
    const next = clamp(Math.round(initialMax * CRORE_TO_RUPEE), minRupees, maxRupees);
    setValueRupees((prev) => (prev === next ? prev : next));
  }, [initialMax, minRupees, maxRupees]);

  // stable onChange
  const onChangeRef = useRef<typeof onChange | undefined>(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const cb = onChangeRef.current;
    if (!cb) return;
    cb({
      min: minRupees / CRORE_TO_RUPEE,
      max: valueRupees / CRORE_TO_RUPEE,
      readable: toReadable(valueRupees),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueRupees]);

  // mapping
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
      window.addEventListener("touchmove", onTouchMove as EventListener, {
        passive: false,
      });
      window.addEventListener("touchend", onTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove as EventListener);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDragging, maxRupees]);

  // right-side input
  const [rightInput, setRightInput] = useState<string>(
    numberFormatter.format(startRupees)
  );

  useEffect(() => {
    const next = numberFormatter.format(valueRupees);
    setRightInput((prev) => (prev === next ? prev : next));
  }, [valueRupees]);

  const handleRightInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const txt = e.target.value;
    setRightInput(txt);

    const cleaned = txt.replace(/,/g, "").replace(/₹/g, "").trim();
    if (cleaned === "") return;

    if (/^\d+$/.test(cleaned)) {
      const n = parseInt(cleaned, 10);
      if (!Number.isNaN(n)) {
        const sanitized = clamp(n, minRupees, maxRupees);
        setValueRupees((prev) =>
          prev === sanitized ? prev : Math.round(sanitized)
        );
      }
      return;
    }

    // allow "80L", "1.2Cr" etc.
    const lowered = cleaned.toLowerCase();
    let n = NaN;
    if (/l$/.test(lowered)) n = parseFloat(lowered.replace('l', '')) * LAKH_TO_RUPEE;
    if (/cr$|c$/.test(lowered)) n = parseFloat(lowered.replace(/cr|c/, '').trim()) * CRORE_TO_RUPEE;
    if (!Number.isNaN(n)) {
      const sanitized = clamp(Math.round(n), minRupees, maxRupees);
      setValueRupees((prev) =>
        prev === sanitized ? prev : Math.round(sanitized)
      );
    }
  };

  const handleRightInputBlur = () => {
    setRightInput(numberFormatter.format(valueRupees));
  };

  // ----------------------- RENDER -----------------------
  return (
    <div className={`w-full ${className}`}>
      <div className="w-56 flex-shrink-0">
        <label className="block text-xs text-gray-500 mb-2">Amount (₹)</label>

        <div className="flex items-center">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9,]*"
            className="flex-1 border rounded px-2 py-1.5 text-sm outline-none"
            value={rightInput}
            onChange={handleRightInputChange}
            onBlur={handleRightInputBlur}
            placeholder="50,00,000"
            aria-label="Price input in rupees"
          />

          {/* suffix outside box */}
          <span className="ml-2 text-[11px] font-medium text-green-700 whitespace-nowrap">
            {toReadable(valueRupees)}
          </span>
        </div>
      </div>

      {/* Slider */}
      <div className="flex items-center gap-3">
        <div className="flex-1  mt-4">
          <div className="relative">
            <div
              ref={sliderRef}
              className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
              onMouseDown={(e) => {
                const rectX = e.clientX;
                const rupees = pointerToRupees(rectX);
                setValueRupees(clamp(rupees, minRupees, maxRupees));
                setIsDragging(true);
              }}
              onTouchStart={(e) => {
                if (e.touches.length) {
                  const rectX = e.touches[0].clientX;
                  const rupees = pointerToRupees(rectX);
                  setValueRupees(clamp(rupees, minRupees, maxRupees));
                  setIsDragging(true);
                  e.preventDefault();
                }
              }}
            >
              {/* Active track */}
              <div
                className="absolute h-full rounded-full bg-orange-500"
                style={{ width: `${position}%` }}
              />

              {/* Handle */}
              <div
                role="slider"
                tabIndex={0}
                aria-valuemin={minRupees}
                aria-valuemax={maxRupees}
                aria-valuenow={valueRupees}
                className="absolute w-5 h-5 bg-orange-600 rounded-full cursor-pointer
                           transform -translate-x-1/2 -translate-y-1/2 top-1/2
                           hover:scale-110 transition-transform shadow-md z-20"
                style={{ left: `${position}%` }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
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
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span className="font-medium">1 L</span>
              <span className="font-medium">{max} Cr</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceRangeSelector;
