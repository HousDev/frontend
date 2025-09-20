import React, { useEffect, useRef, useState } from "react";

interface PriceRangeSelectorProps {
    initialMax?: number; // in Crores (e.g. 0.5 means 50L)
    max?: number; // max in Crores (default 5)
    onChange?: (payload: { min: number; max: number; readable: string }) => void;
    className?: string;
    sliderLimit?: number; // visual slider cap (default 5)
}

const CRORE_TO_RUPEE = 10_000_000;

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
});

const PriceRangeSelector: React.FC<PriceRangeSelectorProps> = ({
    initialMax = 0.5, // Default set to 50L (0.5 Cr)
    max = 5,
    onChange,
    className = "",
    sliderLimit = 5,
}) => {
    const clamp = (v: number) => (Number.isNaN(v) ? 0.5 : Math.max(0, v)); // Default to 0.5 if NaN
    const sliderScale = sliderLimit > 0 ? sliderLimit : 5;
    const initVal = clamp(Math.min(Math.max(0.5, initialMax), Math.max(max, sliderScale))); // Minimum 0.5
    const [value, setValue] = useState<number>(Number(initVal.toFixed(3))); // in Cr

    const [isDragging, setIsDragging] = useState<boolean>(false);
    const sliderRef = useRef<HTMLDivElement | null>(null);

    // Display text helper
    const toDisplayText = (valCr: number) => {
        if (valCr <= 0) return "0L";
        if (valCr < 1) {
            const lacs = +(valCr * 100).toFixed(1);
            return `${lacs}L`;
        }
        return `${Number(valCr.toFixed(2))}Cr`;
    };

    const formatRupeesFull = (valCr: number) => {
        const rupees = valCr * CRORE_TO_RUPEE;
        return currencyFormatter.format(Math.round(rupees * 100) / 100);
    };

    useEffect(() => {
        const readable = `0 - ${toDisplayText(value)}`;
        const minRupees = 0;
        const maxRupees = Math.round(value * CRORE_TO_RUPEE);
        onChange?.({ min: minRupees, max: maxRupees, readable });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    // pointer helpers
    const pointerToValue = (clientX: number) => {
        const rect = sliderRef.current;
        if (!rect) return 0.5; // Default to 50L
        const bounds = rect.getBoundingClientRect();
        const x = clientX - bounds.left;
        const pct = Math.max(0, Math.min(1, x / bounds.width));
        return Number((pct * sliderScale).toFixed(3));
    };

    const handleTrackPointerDown = (clientX: number) => {
        const v = pointerToValue(clientX);
        setValue(Number(Math.min(max, v).toFixed(3)));
        setIsDragging(true);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handlePointerMove = (clientX: number | null) => {
        if (!isDragging || !sliderRef.current || clientX === null) return;
        const newVal = pointerToValue(clientX);
        setValue(Number(Math.min(max, Math.max(0, newVal)).toFixed(3)));
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
    }, [isDragging, value, sliderScale]);

    const posFor = (val: number) => {
        const v = Math.min(val, sliderScale);
        return (v / sliderScale) * 100;
    };
    const position = posFor(value);

    // Manual input parser
    const parseManualInput = (text: string) => {
        const raw = text.trim();
        if (raw === "") return 0.5; // Default to 50L if empty
        const lower = raw.toLowerCase();

        if (/[l]$/.test(lower)) {
            const num = parseFloat(lower.replace(/[l]$/, "").trim());
            return Number((num / 100).toFixed(3)); // Lacs → Cr
        }

        if (/(cr|c)$/.test(lower)) {
            const num = parseFloat(lower.replace(/(cr|c)$/, "").trim());
            return Number(num.toFixed(3));
        }

        const num = parseFloat(raw);
        if (Number.isNaN(num)) return 0.5; // Default to 50L if invalid

        if (value < 1) return Number((num / 100).toFixed(3)); // treat as Lacs
        return Number(num.toFixed(3)); // treat as Crores
    };

    const manualDisplay = value < 1 ? String(Number((value * 100).toFixed(1))) : String(Number(value.toFixed(2)));

    return (
        <div className={`w-full ${className}`}>
            {/* 50-50 Split Layout */}
            <div className="flex items-center gap-6">
                {/* Left Side - Slider (50%) */}
                <div className="w-1/2">
                    <div className="relative">
                        {/* Label above handle */}
                        <div className="relative h-6 mb-2 pointer-events-none">
                            <div
                                className="absolute text-xs font-medium text-gray-700 transform -translate-x-1/2 bg-white px-2 py-1 rounded-md shadow-sm border whitespace-nowrap"
                                style={{ left: `${position}%`, top: "0" }}
                                aria-hidden
                            >
                                {toDisplayText(value)}
                            </div>
                        </div>

                        {/* Track */}
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
                            <div
                                className="absolute rounded-full"
                                style={{
                                    height: "100%",
                                    left: `0%`,
                                    width: `${position}%`,
                                    background: "linear-gradient(90deg,#7c3aed,#6d28d9)",
                                }}
                            />
                            <div
                                role="slider"
                                tabIndex={0}
                                aria-valuemin={0}
                                aria-valuemax={sliderScale}
                                aria-valuenow={Number(value.toFixed(3))}
                                className="absolute w-4 h-4 bg-white border-2 border-purple-500 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 top-1/2 hover:scale-105 transition-transform shadow-md z-20"
                                style={{ left: `${position}%` }}
                                onMouseDown={handleMouseDown}
                                onTouchStart={(e) => {
                                    if (e.touches.length) {
                                        setIsDragging(true);
                                        e.preventDefault();
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "ArrowLeft" || e.key === "ArrowDown")
                                        setValue((v) => Number(Math.max(0, Number((v - 0.01).toFixed(3)))));
                                    if (e.key === "ArrowRight" || e.key === "ArrowUp")
                                        setValue((v) => Number(Math.min(max, Number((v + 0.01).toFixed(3)))));
                                }}
                            />
                        </div>

                        {/* Start/End labels */}
                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>₹0</span>
                            <span>₹{sliderScale}Cr</span>
                        </div>
                    </div>
                </div>

                {/* Right Side - Other Details (50%) */}
                {/* --- SMALL CHANGE: ensure the right side also takes 1/2 width to match left --- */}
                <div className="w-1/2 flex items-center gap-4">
                    {/* Manual Input */}
                    {/* --- SMALL CHANGE: give a fixed equal width and center content vertically --- */}
                    <div className="flex flex-col w-48 py-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Maximum Budget
                        </label>
                        <input
                            type="text"
                            value={manualDisplay}
                            onChange={(e) => {
                                const parsedCr = parseManualInput(e.target.value);
                                setValue(Number(Math.min(max, Math.max(0, parsedCr)).toFixed(3)));
                            }}
                            onBlur={(e) => {
                                const parsedCr = parseManualInput(e.target.value);
                                setValue(Number(Math.min(max, Math.max(0, parsedCr)).toFixed(3)));
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    const parsedCr = parseManualInput((e.target as HTMLInputElement).value);
                                    setValue(Number(Math.min(max, Math.max(0, parsedCr)).toFixed(3)));
                                    (e.target as HTMLInputElement).blur();
                                }
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="50"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            {value < 1 ? "L (Lakh)" : "Cr (Crore)"}
                        </div>
                    </div>

                    {/* Selected Range Display */}
                    {/* --- SMALL CHANGE: make this the same width and vertical padding to match the input box --- */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg px-2 py-2 flex-1 w-48 flex flex-col justify-center">
                        <div className="text-xs font-medium text-gray-700">Selected Range:</div>
                        <div className="text-sm font-bold text-purple-600">
                            {formatRupeesFull(value)}
                        </div>
                        <div className="text-xs text-gray-600">
                            ₹0 - {toDisplayText(value)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PriceRangeSelector;
