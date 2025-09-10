import React, { useMemo, useState } from "react";
import { ChevronLeft, Calendar, User, Gift } from "lucide-react";

type DOBStepCalendarProps = {
    value?: string;                       // ISO yyyy-mm-dd
    onChange: (iso: string) => void;      // return ISO
    label?: string;
    required?: boolean;
    placeholder?: string;
    size?: "sm" | "md";                   // control trigger size
    min?: string;                         // ISO lower bound (optional)
    max?: string;                         // ISO upper bound (use 18y back)
    showAge?: boolean;                    // default true
};

const pad2 = (n: number) => String(n).padStart(2, "0");

const DOBStepCalendar: React.FC<DOBStepCalendarProps> = ({
    value,
    onChange,
    label = "Date of Birth",
    required,
    placeholder = "Select your date of birth",
    size = "md",
    min,
    max,
    showAge = true,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

    const months = [
        { name: "January", value: 0, short: "Jan" },
        { name: "February", value: 1, short: "Feb" },
        { name: "March", value: 2, short: "Mar" },
        { name: "April", value: 3, short: "Apr" },
        { name: "May", value: 4, short: "May" },
        { name: "June", value: 5, short: "Jun" },
        { name: "July", value: 6, short: "Jul" },
        { name: "August", value: 7, short: "Aug" },
        { name: "September", value: 8, short: "Sep" },
        { name: "October", value: 9, short: "Oct" },
        { name: "November", value: 10, short: "Nov" },
        { name: "December", value: 11, short: "Dec" },
    ];

    const { years, minYear, maxYear } = useMemo(() => {
        const now = new Date();
        const minD = min ? new Date(min) : new Date(now.getFullYear() - 100, 0, 1);
        const maxD = max ? new Date(max) : now;
        const lo = minD.getFullYear();
        const hi = maxD.getFullYear();
        const list: number[] = [];
        for (let y = hi; y >= lo; y--) list.push(y);
        return { years: list, minYear: lo, maxYear: hi };
    }, [min, max]);

    const getDaysInMonth = () => {
        if (selectedYear == null || selectedMonth == null) return [];
        const daysCount = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        return Array.from({ length: daysCount }, (_, i) => i + 1);
    };

    const getFirstDayOfMonth = () => {
        if (selectedYear == null || selectedMonth == null) return 0;
        return new Date(selectedYear, selectedMonth, 1).getDay();
    };

    const handleYearSelect = (year: number) => {
        setSelectedYear(year);
        setStep(2);
    };

    const handleMonthSelect = (month: number) => {
        setSelectedMonth(month);
        setStep(3);
    };

    const withinBounds = (y: number, m: number, d: number) => {
        const iso = `${y}-${pad2(m + 1)}-${pad2(d)}`;
        const dt = new Date(iso);
        return (!min || dt >= new Date(min)) && (!max || dt <= new Date(max));
    };

    const handleDateSelect = (date: number) => {
        const y = selectedYear ?? maxYear;
        const m = selectedMonth ?? 0;
        if (!withinBounds(y, m, date)) return;
        const iso = `${y}-${pad2(m + 1)}-${pad2(date)}`;
        onChange(iso); // still return ISO
        setIsOpen(false);
        setStep(1);
        setSelectedYear(null);
        setSelectedMonth(null);
    };

    const goBack = () => {
        if (step === 2) {
            setSelectedYear(null);
            setStep(1);
        } else if (step === 3) {
            setSelectedMonth(null);
            setStep(2);
        }
    };

   const calculateAge = () => {
    if (!value) return null;
    const today = new Date();
    const d = new Date(value);

    let years = today.getFullYear() - d.getFullYear();
    let months = today.getMonth() - d.getMonth();
    let days = today.getDate() - d.getDate();

    if (days < 0) {
        months -= 1;
        days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); // adjust days
    }
    if (months < 0) {
        years -= 1;
        months += 12;
    }

    return { years, months };
};


    // ✅ Show as DD/MM/YYYY
    const formatDate = (iso?: string) => {
        if (!iso) return "";
        const date = new Date(iso);
        const dd = pad2(date.getDate());
        const mm = pad2(date.getMonth() + 1);
        const yyyy = date.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };

    const triggerClass =
        size === "sm"
            ? "w-full px-3 py-2 border rounded-md bg-white text-left flex items-center justify-between text-xs"
            : "w-full px-4 py-3 border-2 rounded-lg bg-white text-left flex items-center justify-between";

    return (
        <div>
            {label && (
                <label className="block text-xs font-medium text-gray-700 mb-1">
                    <User className="inline w-3.5 h-3.5 mr-1" />
                    {label} {required && "*"}
                </label>
            )}

            <button
                type="button"
                onClick={() => {
                    setStep(1);
                    setSelectedYear(null);
                    setSelectedMonth(null);
                    setIsOpen(true);
                }}
                className={`${triggerClass} border-gray-300 hover:border-blue-400 focus:border-blue-500 focus:outline-none transition-colors`}
            >
                <span className={value ? "text-gray-900" : "text-gray-400"}>
                    {value ? formatDate(value) : placeholder}
                </span>
                <Calendar className="w-4 h-4 text-gray-400" />
            </button>

         {showAge && !!value && (
  <div className="mt-1 flex items-center text-[11px] text-green-600">
    <Gift className="w-3.5 h-3.5 mr-1" />
    {(() => {
      const age = calculateAge();
      return age ? `Age: ${age.years} years ${age.months} months` : "";
    })()}
  </div>
)}


            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[1000]">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-xs">
                        {/* Header */}
                        <div className="p-2 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                                {step > 1 && (
                                    <button
                                        onClick={goBack}
                                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                                    </button>
                                )}
                                <h3 className="text-sm font-semibold text-gray-800">
                                    {step === 1 && "Select Year"}
                                    {step === 2 && `Select Month${selectedYear ? ` — ${selectedYear}` : ""}`}
                                    {step === 3 &&
                                        `Select Date — ${months[selectedMonth ?? 0]?.short} ${selectedYear ?? ""}`}
                                </h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600 text-lg font-semibold"
                            >
                                ×
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-3 max-h-72 overflow-y-auto">
                            {step === 1 && (
                                <div className="grid grid-cols-3 gap-2">
                                    {years.map((year) => (
                                        <button
                                            key={year}
                                            onClick={() => handleYearSelect(year)}
                                            className="p-2 text-xs border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-400 transition-colors text-center"
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {step === 2 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {months.map((month) => (
                                        <button
                                            key={month.value}
                                            onClick={() => handleMonthSelect(month.value)}
                                            className="p-2 text-xs border border-gray-300 rounded-md hover:bg-blue-50 hover:border-blue-400 transition-colors text-center"
                                        >
                                            <div className="font-medium">{month.short}</div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {step === 3 && (
                                <div>
                                    <div className="grid grid-cols-7 gap-1 mb-1">
                                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                                            <div key={d} className="text-center text-[10px] font-medium text-gray-600">
                                                {d}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-7 gap-1">
                                        {Array.from({ length: getFirstDayOfMonth() }, (_, i) => (
                                            <div key={`empty-${i}`} className="h-7" />
                                        ))}

                                        {getDaysInMonth().map((date) => {
                                            const y = selectedYear ?? maxYear;
                                            const m = selectedMonth ?? 0;
                                            const disabled = !withinBounds(y, m, date);
                                            return (
                                                <button
                                                    key={date}
                                                    onClick={() => handleDateSelect(date)}
                                                    disabled={disabled}
                                                    className={`h-7 w-7 text-[11px] rounded-md border transition-colors ${
                                                        disabled
                                                            ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                                            : "border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                                                    }`}
                                                >
                                                    {date}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DOBStepCalendar;
