import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Lock,
} from "lucide-react";

export interface REXVisitSchedulePayload {
  date: string; // YYYY-MM-DD
  time: string; // e.g. "07:00 PM"
  shift: "Morning" | "Afternoon" | "Evening";
  formattedDisplay: string; // e.g. "4th September 7:00 pm"
  guest_name?: string;
  guest_phone?: string;
}

interface REXVisitSchedulerProps {
  propertyTitle?: string;
  isGuest?: boolean;
  defaultName?: string;
  defaultPhone?: string;
  initialDate?: string;
  initialTime?: string;
  initialShift?: "Morning" | "Afternoon" | "Evening";
  disabled?: boolean;
  isReschedule?: boolean;
  onConfirm: (payload: REXVisitSchedulePayload) => void;
  onAskQuery?: () => void;
  onScheduleLater?: () => void;
  loading?: boolean;
}

const SHIFT_SLOTS = {
  Morning: ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"],
  Afternoon: ["12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "03:30 PM", "04:00 PM"],
  Evening: ["06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM", "09:00 PM", "09:30 PM", "10:00 PM"],
};

export const REXVisitScheduler: React.FC<REXVisitSchedulerProps> = ({
  propertyTitle,
  isGuest = false,
  defaultName = "",
  defaultPhone = "",
  initialTime = "07:00 PM",
  initialShift = "Evening",
  disabled = false,
  isReschedule = false,
  onConfirm,
  onAskQuery,
  onScheduleLater,
  loading = false,
}) => {
  const [dayType, setDayType] = useState<"today" | "tomorrow" | "other">("today");
  const [activeShift, setActiveShift] = useState<"Morning" | "Afternoon" | "Evening">(initialShift);
  const [selectedSlot, setSelectedSlot] = useState<string>(initialTime);
  const [guestName, setGuestName] = useState(defaultName);
  const [guestPhone, setGuestPhone] = useState(defaultPhone);
  const [contactError, setContactError] = useState("");

  // Custom Calendar State for "Other"
  const now = new Date();
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedCustomDate, setSelectedCustomDate] = useState<Date>(new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000));

  const getSelectedDate = (): Date => {
    const current = new Date();
    if (dayType === "today") return current;
    if (dayType === "tomorrow") {
      return new Date(current.getTime() + 24 * 60 * 60 * 1000);
    }
    return selectedCustomDate;
  };

  const formatOrdinal = (day: number) => {
    if (day > 3 && day < 21) return `${day}th`;
    switch (day % 10) {
      case 1: return `${day}st`;
      case 2: return `${day}nd`;
      case 3: return `${day}rd`;
      default: return `${day}th`;
    }
  };

  const shouldAskContact = isGuest;

  const handleConfirmClick = () => {
    if (disabled || loading) return;

    if (shouldAskContact) {
      if (!guestName.trim()) {
        setContactError("Please enter your name");
        return;
      }
      const cleanPhone = guestPhone.replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        setContactError("Please enter a valid 10-digit mobile number");
        return;
      }
    }
    setContactError("");

    const d = getSelectedDate();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    const monthName = d.toLocaleDateString("en-IN", { month: "long" });
    const formattedDisplay = `${formatOrdinal(d.getDate())} ${monthName} ${selectedSlot.toLowerCase()}`;

    onConfirm({
      date: dateStr,
      time: selectedSlot,
      shift: activeShift,
      formattedDisplay,
      guest_name: shouldAskContact ? guestName.trim() : undefined,
      guest_phone: shouldAskContact ? guestPhone.trim() : undefined,
    });
  };

  const year = calendarMonth.getFullYear();
  const monthIdx = calendarMonth.getMonth();
  const monthName = calendarMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
  const firstDayOfWeek = new Date(year, monthIdx, 1).getDay();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  const prevMonth = () => setCalendarMonth(new Date(year, monthIdx - 1, 1));
  const nextMonth = () => setCalendarMonth(new Date(year, monthIdx + 1, 1));

  return (
    <div className={`w-full max-w-[340px] sm:max-w-[380px] bg-white rounded-2xl border shadow-xs overflow-hidden my-2 text-slate-800 transition-all ${
      disabled ? "border-emerald-300 opacity-90" : "border-slate-200"
    }`}>
      {/* Header Banner */}
      <div className={`p-3.5 border-b flex items-center justify-between ${
        disabled ? "bg-emerald-50/70 border-emerald-100" : "bg-slate-50 border-slate-100"
      }`}>
        <div>
          <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            {disabled ? (
              <>
                <Lock size={12} className="text-emerald-700" />
                <span className="text-emerald-900">Visit Confirmed & Locked</span>
              </>
            ) : (
              <span>{isReschedule ? "Reschedule Property Visit" : "Schedule Property Visit"}</span>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-0.5 truncate">
            {propertyTitle
              ? propertyTitle
                  .replace(/\[REX\d+\]\s*/gi, "")
                  .replace(/\s*\([^)]*\)/g, "")
                  .replace(/\s+in\s+.*$/i, (match) => {
                    const lower = match.toLowerCase();
                    const allowedAreas = [
                      "pune", "mumbai", "hinjewadi", "baner", "wakad", "punawale",
                      "kharadi", "ravet", "kothrud", "hadapsar", "bavdhan", "pcmc", "maharashtra"
                    ];
                    if (allowedAreas.some((area) => lower.includes(area))) {
                      return match;
                    }
                    return "";
                  })
                  .trim() || "Select date and time slot"
              : "Select date and time slot"}
          </p>
        </div>
      </div>

      <div className="p-3.5 space-y-3">
        {/* Day Selector Chips */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setDayType("today")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              dayType === "today"
                ? "bg-[#0f2b3d] border-[#0f2b3d] text-white shadow-2xs"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            } disabled:cursor-not-allowed`}
          >
            Today
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setDayType("tomorrow")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
              dayType === "tomorrow"
                ? "bg-[#0f2b3d] border-[#0f2b3d] text-white shadow-2xs"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            } disabled:cursor-not-allowed`}
          >
            Tomorrow
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setDayType("other")}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-1 cursor-pointer ${
              dayType === "other"
                ? "bg-[#0f2b3d] border-[#0f2b3d] text-white shadow-2xs"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            } disabled:cursor-not-allowed`}
          >
            <CalendarIcon size={13} />
            <span>Other</span>
          </button>
        </div>

        {/* Custom Calendar Picker */}
        {dayType === "other" && (
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800">{monthName}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={prevMonth}
                  className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-50"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={nextMonth}
                  className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-50"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-slate-400 mb-1">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <span key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const d = new Date(year, monthIdx, dayNum);
                const isSelected =
                  d.getDate() === selectedCustomDate.getDate() &&
                  d.getMonth() === selectedCustomDate.getMonth() &&
                  d.getFullYear() === selectedCustomDate.getFullYear();
                const isPast = d < new Date(now.getFullYear(), now.getMonth(), now.getDate());

                return (
                  <button
                    key={`day-${dayNum}`}
                    type="button"
                    disabled={isPast || disabled}
                    onClick={() => setSelectedCustomDate(d)}
                    className={`h-7 w-7 mx-auto rounded-md flex items-center justify-center font-medium transition-all ${
                      isSelected
                        ? "bg-[#0f2b3d] text-white font-bold shadow-xs"
                        : isPast || disabled
                        ? "text-slate-300 cursor-not-allowed"
                        : "hover:bg-slate-200 text-slate-700 cursor-pointer"
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Shift Tabs */}
        <div className="flex border-b border-slate-200 text-xs font-semibold">
          {(["Morning", "Afternoon", "Evening"] as const).map((shift) => (
            <button
              key={shift}
              type="button"
              disabled={disabled}
              onClick={() => {
                setActiveShift(shift);
                setSelectedSlot(SHIFT_SLOTS[shift][0]);
              }}
              className={`flex-1 py-1.5 text-center transition-colors border-b-2 -mb-px cursor-pointer ${
                activeShift === shift
                  ? "border-[#e87722] text-[#e87722] font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              } disabled:cursor-not-allowed`}
            >
              {shift}
            </button>
          ))}
        </div>

        {/* Time Slots Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 pt-1">
          {SHIFT_SLOTS[activeShift].map((slot) => {
            const isSelected = selectedSlot === slot;
            return (
              <button
                key={slot}
                type="button"
                disabled={disabled}
                onClick={() => setSelectedSlot(slot)}
                className={`py-1.5 px-2 text-[11px] font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-[#0f2b3d] to-[#1a4a6b] text-white border-[#0f2b3d] shadow-xs"
                    : "bg-slate-50 hover:bg-orange-50/60 hover:text-[#0f2b3d] hover:border-orange-200 text-slate-700 border-slate-200"
                } disabled:cursor-not-allowed`}
              >
                {slot}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-1.5">
          {!disabled && (
            <button
              type="button"
              disabled={loading || !selectedSlot}
              onClick={handleConfirmClick}
              className="w-full py-2.5 bg-gradient-to-r from-[#e87722] to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <CheckCircle2 size={14} />
              <span>{loading ? "Scheduling visit..." : isReschedule ? "Confirm New Visit Slot" : "Confirm Visit"}</span>
            </button>
          )}

          {disabled && (
            <div className="w-full py-2 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center justify-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Slot Booked Successfully</span>
            </div>
          )}

          {!disabled && (
            <div className="flex items-center gap-1.5">
              {onScheduleLater && (
                <button
                  type="button"
                  onClick={onScheduleLater}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors text-center cursor-pointer active:scale-95"
                >
                  Schedule Later
                </button>
              )}
              {onAskQuery && (
                <button
                  type="button"
                  onClick={onAskQuery}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors text-center cursor-pointer active:scale-95"
                >
                  Ask a Question
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default REXVisitScheduler;
