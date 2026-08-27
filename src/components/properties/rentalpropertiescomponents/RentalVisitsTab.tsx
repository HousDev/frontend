import React from 'react';
import { Eye, Calendar, Clock, Plus, User, MapPin } from 'lucide-react';

const N = "#0f2b3d";
const O = "#e67e22";
const BD = "#e2e8f0";

interface RentalVisitsTabProps {
  property: any;
  onScheduleVisit: () => void;
}

const RentalVisitsTab: React.FC<RentalVisitsTabProps> = ({
  property,
  onScheduleVisit
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold" style={{ color: N }}>Tenant Site Visits & Inspections</h3>
          <p className="text-[11px] text-gray-500">Schedule and record tenant property inspection walkthroughs</p>
        </div>
        <button
          onClick={onScheduleVisit}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white flex items-center gap-1.5 shadow-sm"
          style={{ background: O }}
        >
          <Plus size={14} />
          <span>Schedule Tenant Visit</span>
        </button>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-xl border p-8 text-center" style={{ borderColor: BD }}>
        <Eye size={28} className="mx-auto mb-2 text-slate-400 opacity-40" />
        <p className="text-xs font-bold" style={{ color: N }}>No tenant visits scheduled</p>
        <p className="text-[11px] text-gray-400 mt-0.5">Click "Schedule Tenant Visit" to set up a property walkthrough for prospective tenants</p>
      </div>
    </div>
  );
};

export default RentalVisitsTab;
