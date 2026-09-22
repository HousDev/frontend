import React, { useState, useEffect } from "react";
import { Coffee, Play, Clock, Sparkles } from "lucide-react";
import { useActivityTracker } from "../../context/ActivityTrackerContext";

const N = "#0f2b3d";
const O = "#e67e22";
const BD = "#e2e8f0";

const SmartBreakTimerOverlay: React.FC = () => {
  const { activeBreak, endBreak, currentState } = useActivityTracker();
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    if (!activeBreak || currentState !== "BREAK") {
      setElapsedSeconds(0);
      return;
    }

    const startTime = new Date(activeBreak.started_at).getTime();

    const timer = setInterval(() => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - startTime) / 1000));
      setElapsedSeconds(diffSec);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeBreak, currentState]);

  if (!activeBreak || currentState !== "BREAK") return null;

  const allocatedSec = (activeBreak.allocated_duration || 15) * 60;
  const remainingSec = Math.max(0, allocatedSec - elapsedSeconds);

  const formatMinSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? `0${m}` : m}:${s < 10 ? `0${s}` : s}`;
  };

  const targetEndTimeStr = new Date(
    new Date(activeBreak.started_at).getTime() + allocatedSec * 1000
  ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      className="fixed bottom-6 right-6 z-[90] animate-bounce-in shadow-2xl rounded-2xl overflow-hidden border border-slate-200 flex flex-col w-80"
      style={{ background: "#ffffff", borderColor: BD }}
    >
      {/* Header Banner */}
      <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: N }}>
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg" style={{ background: `${O}25` }}>
            <Coffee size={14} style={{ color: O }} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white leading-tight">{activeBreak.break_type}</h4>
            <p className="text-[9px] text-white/60">Break ends at: {targetEndTimeStr}</p>
          </div>
        </div>
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
      </div>

      {/* Main Timer Body */}
      <div className="p-4 bg-slate-50 flex flex-col items-center justify-center space-y-3">
        <div className="text-center">
          <div className="text-3xl font-black font-mono tracking-tight" style={{ color: N }}>
            {formatMinSec(elapsedSeconds)}
          </div>
          <div className="flex items-center gap-1 justify-center text-[10px] text-slate-500 font-medium mt-0.5">
            <Clock size={10} />
            <span>
              {remainingSec > 0 ? `${formatMinSec(remainingSec)} remaining` : "Break duration complete"}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => endBreak()}
          className="w-full py-2 px-3 rounded-xl font-bold text-xs text-white shadow-md transition-all flex items-center justify-center gap-1.5 hover:opacity-95"
          style={{ background: O }}
        >
          <Play size={12} />
          <span>Resume Work Early</span>
        </button>
      </div>
    </div>
  );
};

export default SmartBreakTimerOverlay;
