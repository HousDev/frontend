import React, { useMemo } from 'react';
import {
  Calendar, Eye, Wrench, FileText, Star, Clock, User, MapPin, Building
} from 'lucide-react';

type VisitHistoryItem = {
  id?: string | number;
  purpose?: string;            // e.g. "Site Visit", "Inspection"
  status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  date?: string;               // ISO or dd/mm/yyyy
  time?: string;               // "10:00"
  duration?: string;           // "60 minutes"
  rating?: number;             // 1..5 or 1..10 (we’ll render both)
  inspector?: string;          // Agent/exec name
  accomp?: string[];           // Accompanied by
  notes?: string;
  addressLine?: string;        // short location line
};

interface VisitsTabProps {
  property: {
    id?: string | number;
    title?: string;
    property_type_name?: string;
    unit_type?: string;
    society_name?: string;
    location?: string;
    address?: string;
    visitHistory?: VisitHistoryItem[];
  };
  onScheduleVisit: () => void;
  onStartInspection: () => void;
  onMaintenanceSuggestions: () => void;
  onGenerateReport: () => void;
}

const statusTone: Record<
  NonNullable<VisitHistoryItem['status']>,
  { bg: string; text: string; dot: string }
> = {
  scheduled: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  confirmed: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  completed: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

const safeDate = (d?: string) => (d ? new Date(d) : null);
const fmtDate = (d?: string) => {
  const dt = safeDate(d);
  if (!dt || Number.isNaN(dt.getTime())) return d || '';
  return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const fmtTime = (t?: string) => (t && /^\d{1,2}:\d{2}/.test(t) ? t : '');

const Stars5: React.FC<{ value?: number }> = ({ value }) => {
  const v = Math.max(0, Math.min(5, Math.round(Number(value || 0))));
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={14} className={n <= v ? 'fill-yellow-400 text-yellow-500' : 'text-gray-300'} />
      ))}
    </div>
  );
};

const VisitsTab: React.FC<VisitsTabProps> = ({
  property,
  onScheduleVisit,
  onStartInspection,
  onMaintenanceSuggestions,
  onGenerateReport,
}) => {
  const list = useMemo(() => property?.visitHistory ?? [], [property]);

  const headerTitle =
    property?.title ||
    [property?.property_type_name, property?.unit_type?.toUpperCase(), property?.society_name]
      .filter(Boolean)
      .join(' ') ||
    'Property';

  const subLine = property?.location || property?.address || '';

  return (
    <div className="space-y-6">
      {/* Header (matches VisitModal tone) */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <Building size={14} />
                <span className="truncate">{headerTitle}</span>
              </div>
              {subLine ? <div className="text-[11px] text-gray-600 mt-0.5 flex items-center gap-1"><MapPin size={12} />{subLine}</div> : null}
            </div>
            <div className="text-[11px] text-gray-600">
              ID: <span className="font-medium">{property?.id ?? '-'}</span>
            </div>
          </div>
        </div>

        {/* Visit Actions */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Property Visit & Inspection</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={onScheduleVisit}
              className="flex flex-col items-center gap-2 p-3 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Calendar className="text-blue-600" size={22} />
              <span className="text-xs font-medium text-blue-700">Schedule Visit</span>
            </button>
            <button
              onClick={onStartInspection}
              className="flex flex-col items-center gap-2 p-3 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
            >
              <Eye className="text-green-600" size={22} />
              <span className="text-xs font-medium text-green-700">Start Inspection</span>
            </button>
            <button
              onClick={onMaintenanceSuggestions}
              className="flex flex-col items-center gap-2 p-3 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
            >
              <Wrench className="text-orange-600" size={22} />
              <span className="text-xs font-medium text-orange-700">Maintenance</span>
            </button>
            <button
              onClick={onGenerateReport}
              className="flex flex-col items-center gap-2 p-3 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
            >
              <FileText className="text-purple-600" size={22} />
              <span className="text-xs font-medium text-purple-700">Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visit History */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Visit History</h3>
          <p className="text-[11px] text-gray-600 mt-0.5">
            Latest visits and inspections logged for this property.
          </p>
        </div>

        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {list.length > 0 ? (
            list.map((v, idx) => {
              const status = v.status || 'scheduled';
              const tone = statusTone[status] || statusTone.scheduled;
              const dateStr = fmtDate(v.date);
              const timeStr = fmtTime(v.time);
              const showOutOf10 = typeof v.rating === 'number' && v.rating > 5;

              return (
                <div key={v.id ?? idx} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 bg-green-100 rounded-lg shrink-0">
                      <Eye className="text-green-700" size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-medium text-gray-900 text-sm">
                          {v.purpose || 'Visit'}
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ${tone.bg} ${tone.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-700 mt-0.5 flex items-center gap-3 flex-wrap">
                        {(dateStr || timeStr) && (
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={12} />
                            {dateStr}{dateStr && timeStr ? ' • ' : ''}{timeStr}
                          </span>
                        )}
                        {v.duration && (
                          <span className="inline-flex items-center gap-1">
                            <Clock size={12} />
                            {v.duration}
                          </span>
                        )}
                        {v.inspector && (
                          <span className="inline-flex items-center gap-1">
                            <User size={12} />
                            {v.inspector}
                          </span>
                        )}
                        {v.addressLine && (
                          <span className="inline-flex items-center gap-1 truncate max-w-[28ch]">
                            <MapPin size={12} />
                            {v.addressLine}
                          </span>
                        )}
                      </div>

                      {v.accomp && v.accomp.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {v.accomp.map((p, i) => (
                            <span
                              key={`${p}-${i}`}
                              className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[11px]"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      )}

                      {v.notes && (
                        <div className="mt-1 text-[11px] text-gray-600 line-clamp-2">
                          {v.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    {typeof v.rating === 'number' && (
                      <div className="flex flex-col items-end">
                        {/* If rating <=5 show stars, else show x/10 */}
                        {showOutOf10 ? (
                          <div className="text-sm font-medium text-gray-900">{v.rating}/10</div>
                        ) : (
                          <Stars5 value={v.rating} />
                        )}
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {status === 'completed' ? 'Rated' : 'Scheduled'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-gray-500">
              <Calendar className="mx-auto mb-2" size={32} />
              <p className="text-sm">No visits recorded yet</p>
              <button
                onClick={onScheduleVisit}
                className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Calendar size={14} />
                Schedule first visit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitsTab;
