import React from 'react';
import { Plus } from 'lucide-react';

interface TenantSiteVisitsTabProps {
  visits: any[];
  onScheduleVisit: () => void;
}

export default function TenantSiteVisitsTab({ visits, onScheduleVisit }: TenantSiteVisitsTabProps) {
  return (
    <div className="space-y-3">
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-xs sm:text-sm text-slate-900">Scheduled Site Visits</h2>
            <p className="text-[10px] text-gray-500">Track requested property inspection visits</p>
          </div>
          <button
            onClick={onScheduleVisit}
            className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] flex items-center gap-1 shadow-2xs"
          >
            <Plus size={13} />
            <span>Schedule Visit</span>
          </button>
        </div>

        {visits.length > 0 ? (
          <div className="space-y-2">
            {visits.map((v: any, idx: number) => (
              <div key={idx} className="p-3 rounded-lg border border-gray-200 flex items-center justify-between bg-white">
                <div>
                  <h4 className="font-bold text-xs text-slate-800">{v.property_title || `Site Visit #${v.id}`}</h4>
                  <p className="text-[9px] text-gray-500 mt-0.5">Visit Date: {v.visit_date ? new Date(v.visit_date).toLocaleDateString('en-IN') : 'TBD'}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[9px]">
                  {v.status || 'Scheduled'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 italic border border-dashed border-gray-200 rounded-xl text-[10px]">
            No property site visits scheduled yet.
          </div>
        )}
      </div>
    </div>
  );
}
