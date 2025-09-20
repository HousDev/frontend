// PriceRangeSelector.tsx
import React, { useEffect, useRef, useState } from "react";

interface PriceRangeSelectorProps {
    initialMax?: number; // in Crores
    max?: number; // max in Crores (default 5)
    onChange?: (payload: { min: number; max: number; readable: string }) => void; // readable like "28L" or "2.50Cr"
    className?: string;
    sliderLimit?: number; // visual slider cap (default 5)
}

const CRORE_TO_RUPEE = 10_000_000;
const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
});

const toReadable = (valCr: number) => {
    if (valCr <= 0) return "0L";
    if (valCr < 1) {
        const lacs = Math.round(valCr * 100);
        return `${lacs}L`;
    }
    return `${Number(valCr.toFixed(2))}Cr`;
};

const formatRupeesFull = (valCr: number) => {
    const rupees = valCr * CRORE_TO_RUPEE;
    return currencyFormatter.format(Math.round(rupees * 100) / 100);
};

const clamp = (v: number, min = 0, max = Infinity) => Math.max(min, Math.min(max, v));

const PriceRangeSelector: React.FC<PriceRangeSelectorProps> = ({
    initialMax = 0,
    max = 5,
    onChange,
    className = "",
    sliderLimit = 5,
}) => {
    const sliderScale = Math.max(0.1, sliderLimit);
    const start = clamp(initialMax, 0, Math.min(max, sliderScale));
    const [value, setValue] = useState<number>(Number(start.toFixed(3)));
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const readable = toReadable(value);
        onChange?.({ min: 0, max: Number(value.toFixed(3)), readable });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const posFor = (val: number) => {
        const v = clamp(val, 0, sliderScale);
        return (v / sliderScale) * 100;
    };
    const position = posFor(value);

    const pointerToValue = (clientX: number) => {
        const el = sliderRef.current;
        if (!el) return 0;
        const rect = el.getBoundingClientRect();
        const x = clientX - rect.left;
        const pct = clamp(x / rect.width, 0, 1);
        return Number((pct * sliderScale).toFixed(3));
    };

    const handleTrackPointerDown = (clientX: number) => {
        const v = pointerToValue(clientX);
        setValue(Number(clamp(v, 0, max).toFixed(3)));
        setIsDragging(true);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handlePointerMove = (clientX: number | null) => {
        if (!isDragging || !sliderRef.current || clientX === null) return;
        const newVal = pointerToValue(clientX);
        setValue(Number(clamp(newVal, 0, max).toFixed(3)));
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
    }, [isDragging, value, sliderScale]);

    // manual input parsing (support "50L", "0.50Cr", "2", "2Cr")
    const parseManualInput = (text: string) => {
        const raw = (text || "").trim().toLowerCase();
        if (raw === "") return 0;
        if (/^[\d,.]+\s*l$/.test(raw)) {
            const n = parseFloat(raw.replace(/[,l\s]/g, ""));
            if (Number.isNaN(n)) return 0;
            return Number((n / 100).toFixed(3));
        }
        if (/^[\d,.]+\s*(cr|c)$/.test(raw)) {
            const n = parseFloat(raw.replace(/[,crc\s]/g, ""));
            return Number(isNaN(n) ? 0 : n.toFixed(3));
        }
        const n = parseFloat(raw.replace(/,/g, ""));
        if (Number.isNaN(n)) return 0;
        // treat plain numbers as Crores by default
        return Number(n.toFixed(3));
    };

    const [manualInput, setManualInput] = useState<string>(() => (value < 1 ? `${Math.round(value * 100)}L` : `${value.toFixed(2)}Cr`));

    useEffect(() => {
        setManualInput(value < 1 ? `${Math.round(value * 100)}L` : `${value.toFixed(2)}Cr`);
    }, [value]);

    return (
        <div className={`w-full ${className}`}>
            <div className="flex items-center gap-6">
                <div className="w-1/2">
                    <div className="relative">
                        <div className="relative h-6 mb-2 pointer-events-none">
                            <div
                                className="absolute text-xs font-medium text-gray-700 transform -translate-x-1/2 bg-white px-2 py-1 rounded-md shadow-sm border whitespace-nowrap"
                                style={{ left: `${position}%`, top: 0 }}
                                aria-hidden
                            >
                                {value <= 0 ? "0L" : value < 1 ? `${Math.round(value * 100)}L` : `${Number(value.toFixed(2))}Cr`}
                            </div>
                        </div>

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
                                onKeyDown={(e: React.KeyboardEvent) => {
                                    const step = 0.01;
                                    if (e.key === "ArrowLeft" || e.key === "ArrowDown") setValue((v) => Number(clamp(v - step, 0, max).toFixed(3)));
                                    if (e.key === "ArrowRight" || e.key === "ArrowUp") setValue((v) => Number(clamp(v + step, 0, max).toFixed(3)));
                                    if (e.key === "Home") setValue(0);
                                    if (e.key === "End") setValue(Number(max.toFixed(3)));
                                }}
                            />
                        </div>

                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>₹0</span>
                            <span>₹{sliderScale}Cr</span>
                        </div>
                    </div>
                </div>

                <div className="w-1/2 flex items-center gap-4">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 flex-1 w-48 flex flex-col justify-center">
                        <div className="text-xs font-medium text-gray-700">Selected:</div>
                        <div className="text-sm font-bold text-purple-600">{formatRupeesFull(value)}</div>
                        <div className="text-xs text-gray-600">{toReadable(value)}</div>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-[10px] text-gray-600 mb-1">Manual</label>
                        <input
                            className="text-xs px-2 py-1 border rounded w-28"
                            value={manualInput}
                            onChange={(e) => setManualInput(e.target.value)}
                            onBlur={() => {
                                const parsed = parseManualInput(manualInput);
                                const sanitized = clamp(parsed, 0, max);
                                setValue(Number(sanitized.toFixed(3)));
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    const parsed = parseManualInput(manualInput);
                                    const sanitized = clamp(parsed, 0, max);
                                    setValue(Number(sanitized.toFixed(3)));
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PriceRangeSelector;
