import React from 'react';
import { formatAssignedDate } from '@/lib/helpers';

interface AssignedDateCellProps {
  date?: string | Date | null;
  className?: string;
}

export const AssignedDateCell: React.FC<AssignedDateCellProps> = ({ date, className = '' }) => {
  if (!date) {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-medium text-gray-400 bg-gray-50/60 border border-dashed border-gray-200 ${className}`}>
        —
      </span>
    );
  }

  const { text, isToday, isYesterday } = formatAssignedDate(date);

  if (isToday) {
    const parts = text.split(', ');
    const time = parts[1] || '';

    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/90 shadow-2xs whitespace-nowrap ${className}`}>
        <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
        </span>
        <span className="text-[10px] font-bold text-emerald-950">Today</span>
        {time && (
          <>
            <span className="text-emerald-300 text-[9px] font-bold">•</span>
            <span className="text-[9.5px] font-medium text-emerald-700">{time}</span>
          </>
        )}
        <span className="ml-0.5 px-1 py-0.2 rounded bg-emerald-600 text-white font-extrabold text-[7.5px] uppercase tracking-wider">
          NEW
        </span>
      </div>
    );
  }

  if (isYesterday) {
    const parts = text.split(', ');
    const time = parts[1] || '';

    return (
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200/80 shadow-2xs whitespace-nowrap ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></span>
        <span className="text-[10px] font-semibold text-slate-800">Yesterday</span>
        {time && (
          <>
            <span className="text-slate-300 text-[9px] font-bold">•</span>
            <span className="text-[9.5px] font-normal text-slate-500">{time}</span>
          </>
        )}
      </div>
    );
  }

  // Older dates: e.g. "15 Sep, 02:30 PM"
  const parts = text.split(', ');
  const dateLabel = parts[0] || text;
  const time = parts[1] || '';

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-50/90 text-gray-600 border border-gray-200/70 shadow-2xs whitespace-nowrap ${className}`}>
      <span className="text-[9.5px] font-medium text-gray-700">{dateLabel}</span>
      {time && (
        <>
          <span className="text-gray-300 text-[9px]">•</span>
          <span className="text-[9px] font-normal text-gray-400">{time}</span>
        </>
      )}
    </div>
  );
};

export default AssignedDateCell;
