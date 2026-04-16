// import React, { useMemo } from 'react';
// import {
//   Calendar, Eye, Wrench, FileText, Star, Clock, User, MapPin, Building
// } from 'lucide-react';

// type VisitHistoryItem = {
//   id?: string | number;
//   purpose?: string;            // e.g. "Site Visit", "Inspection"
//   status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
//   date?: string;               // ISO or dd/mm/yyyy
//   time?: string;               // "10:00"
//   duration?: string;           // "60 minutes"
//   rating?: number;             // 1..5 or 1..10 (we’ll render both)
//   inspector?: string;          // Agent/exec name
//   accomp?: string[];           // Accompanied by
//   notes?: string;
//   addressLine?: string;        // short location line
// };

// interface VisitsTabProps {
//   property: {
//     id?: string | number;
//     title?: string;
//     property_type_name?: string;
//     unit_type?: string;
//     society_name?: string;
//     location?: string;
//     address?: string;
//     visitHistory?: VisitHistoryItem[];
//   };
//   onScheduleVisit: () => void;
//   onStartInspection: () => void;
//   onMaintenanceSuggestions: () => void;
//   onGenerateReport: () => void;
// }

// const statusTone: Record<
//   NonNullable<VisitHistoryItem['status']>,
//   { bg: string; text: string; dot: string }
// > = {
//   scheduled: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
//   confirmed: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
//   completed: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
//   cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
// };

// const safeDate = (d?: string) => (d ? new Date(d) : null);
// const fmtDate = (d?: string) => {
//   const dt = safeDate(d);
//   if (!dt || Number.isNaN(dt.getTime())) return d || '';
//   return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
// };

// const fmtTime = (t?: string) => (t && /^\d{1,2}:\d{2}/.test(t) ? t : '');

// const Stars5: React.FC<{ value?: number }> = ({ value }) => {
//   const v = Math.max(0, Math.min(5, Math.round(Number(value || 0))));
//   return (
//     <div className="flex items-center gap-0.5">
//       {[1, 2, 3, 4, 5].map((n) => (
//         <Star key={n} size={14} className={n <= v ? 'fill-yellow-400 text-yellow-500' : 'text-gray-300'} />
//       ))}
//     </div>
//   );
// };

// const VisitsTab: React.FC<VisitsTabProps> = ({
//   property,
//   onScheduleVisit,
//   onStartInspection,
//   onMaintenanceSuggestions,
//   onGenerateReport,
// }) => {
//   const list = useMemo(() => property?.visitHistory ?? [], [property]);

//   const headerTitle =
//     property?.title ||
//     [property?.property_type_name, property?.unit_type?.toUpperCase(), property?.society_name]
//       .filter(Boolean)
//       .join(' ') ||
//     'Property';

//   const subLine = property?.location || property?.address || '';

//   return (
//     <div className="space-y-6">
//       {/* Header (matches VisitModal tone) */}
//       <div className="rounded-xl border border-gray-200 overflow-hidden">
//         <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
//           <div className="flex items-start justify-between">
//             <div className="min-w-0">
//               <div className="flex items-center gap-2 text-xs text-gray-700">
//                 <Building size={14} />
//                 <span className="truncate">{headerTitle}</span>
//               </div>
//               {subLine ? <div className="text-[11px] text-gray-600 mt-0.5 flex items-center gap-1"><MapPin size={12} />{subLine}</div> : null}
//             </div>
//             <div className="text-[11px] text-gray-600">
//               ID: <span className="font-medium">{property?.id ?? '-'}</span>
//             </div>
//           </div>
//         </div>

//         {/* Visit Actions */}
//         <div className="p-4">
//           <h3 className="text-sm font-semibold text-gray-900 mb-3">Property Visit & Inspection</h3>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//             <button
//               onClick={onScheduleVisit}
//               className="flex flex-col items-center gap-2 p-3 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
//             >
//               <Calendar className="text-blue-600" size={22} />
//               <span className="text-xs font-medium text-blue-700">Schedule Visit</span>
//             </button>
//             <button
//               onClick={onStartInspection}
//               className="flex flex-col items-center gap-2 p-3 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
//             >
//               <Eye className="text-green-600" size={22} />
//               <span className="text-xs font-medium text-green-700">Start Inspection</span>
//             </button>
//             <button
//               onClick={onMaintenanceSuggestions}
//               className="flex flex-col items-center gap-2 p-3 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
//             >
//               <Wrench className="text-orange-600" size={22} />
//               <span className="text-xs font-medium text-orange-700">Maintenance</span>
//             </button>
//             <button
//               onClick={onGenerateReport}
//               className="flex flex-col items-center gap-2 p-3 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
//             >
//               <FileText className="text-purple-600" size={22} />
//               <span className="text-xs font-medium text-purple-700">Generate Report</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Visit History */}
//       <div className="bg-white rounded-xl border border-gray-200">
//         <div className="p-4 border-b border-gray-200">
//           <h3 className="text-sm font-semibold text-gray-900">Visit History</h3>
//           <p className="text-[11px] text-gray-600 mt-0.5">
//             Latest visits and inspections logged for this property.
//           </p>
//         </div>

//         <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
//           {list.length > 0 ? (
//             list.map((v, idx) => {
//               const status = v.status || 'scheduled';
//               const tone = statusTone[status] || statusTone.scheduled;
//               const dateStr = fmtDate(v.date);
//               const timeStr = fmtTime(v.time);
//               const showOutOf10 = typeof v.rating === 'number' && v.rating > 5;

//               return (
//                 <div key={v.id ?? idx} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
//                   <div className="flex items-start gap-3 min-w-0">
//                     <div className="p-2 bg-green-100 rounded-lg shrink-0">
//                       <Eye className="text-green-700" size={16} />
//                     </div>
//                     <div className="min-w-0">
//                       <div className="flex items-center gap-2 flex-wrap">
//                         <div className="font-medium text-gray-900 text-sm">
//                           {v.purpose || 'Visit'}
//                         </div>
//                         <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ${tone.bg} ${tone.text}`}>
//                           <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
//                           {status.charAt(0).toUpperCase() + status.slice(1)}
//                         </span>
//                       </div>
//                       <div className="text-xs text-gray-700 mt-0.5 flex items-center gap-3 flex-wrap">
//                         {(dateStr || timeStr) && (
//                           <span className="inline-flex items-center gap-1">
//                             <Calendar size={12} />
//                             {dateStr}{dateStr && timeStr ? ' • ' : ''}{timeStr}
//                           </span>
//                         )}
//                         {v.duration && (
//                           <span className="inline-flex items-center gap-1">
//                             <Clock size={12} />
//                             {v.duration}
//                           </span>
//                         )}
//                         {v.inspector && (
//                           <span className="inline-flex items-center gap-1">
//                             <User size={12} />
//                             {v.inspector}
//                           </span>
//                         )}
//                         {v.addressLine && (
//                           <span className="inline-flex items-center gap-1 truncate max-w-[28ch]">
//                             <MapPin size={12} />
//                             {v.addressLine}
//                           </span>
//                         )}
//                       </div>

//                       {v.accomp && v.accomp.length > 0 && (
//                         <div className="mt-1 flex flex-wrap gap-1">
//                           {v.accomp.map((p, i) => (
//                             <span
//                               key={`${p}-${i}`}
//                               className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-[11px]"
//                             >
//                               {p}
//                             </span>
//                           ))}
//                         </div>
//                       )}

//                       {v.notes && (
//                         <div className="mt-1 text-[11px] text-gray-600 line-clamp-2">
//                           {v.notes}
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   <div className="text-right shrink-0 pl-2">
//                     {typeof v.rating === 'number' && (
//                       <div className="flex flex-col items-end">
//                         {/* If rating <=5 show stars, else show x/10 */}
//                         {showOutOf10 ? (
//                           <div className="text-sm font-medium text-gray-900">{v.rating}/10</div>
//                         ) : (
//                           <Stars5 value={v.rating} />
//                         )}
//                         <div className="text-[11px] text-gray-500 mt-0.5">
//                           {status === 'completed' ? 'Rated' : 'Scheduled'}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               );
//             })
//           ) : (
//             <div className="text-center py-10 text-gray-500">
//               <Calendar className="mx-auto mb-2" size={32} />
//               <p className="text-sm">No visits recorded yet</p>
//               <button
//                 onClick={onScheduleVisit}
//                 className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
//               >
//                 <Calendar size={14} />
//                 Schedule first visit
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VisitsTab;


import React, { useMemo } from 'react';
import {
  Calendar, Eye, Wrench, FileText, Star, Clock, User, MapPin, Building, CheckCircle
} from 'lucide-react';

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

type VisitHistoryItem = {
  id?: string | number;
  purpose?: string;
  status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  date?: string;
  time?: string;
  duration?: string;
  rating?: number;
  inspector?: string;
  accomp?: string[];
  notes?: string;
  addressLine?: string;
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
  scheduled: { bg: '#fef3c7', text: '#d97706', dot: '#f59e0b' },
  confirmed: { bg: '#dbeafe', text: '#2563eb', dot: '#3b82f6' },
  completed: { bg: '#d1fae5', text: '#059669', dot: '#10b981' },
  cancelled: { bg: '#fee2e2', text: '#dc2626', dot: '#ef4444' },
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
        <Star key={n} size={10} className={n <= v ? 'fill-yellow-400 text-yellow-500' : 'text-gray-300'} />
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
    <div className="space-y-3">
      {/* Header Card */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: BD }}>
        <div className="p-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px]" style={{ color: MU }}>
                <Building size={12} style={{ color: O }} />
                <span className="truncate">{headerTitle}</span>
              </div>
              {subLine ? (
                <div className="text-[9px] mt-0.5 flex items-center gap-1" style={{ color: MU }}>
                  <MapPin size={10} style={{ color: O }} />
                  <span className="truncate">{subLine}</span>
                </div>
              ) : null}
            </div>
            <div className="text-[9px]" style={{ color: MU }}>
              ID: <span className="font-medium" style={{ color: N }}>{property?.id ?? '-'}</span>
            </div>
          </div>
        </div>

        {/* Visit Actions */}
        <div className="p-3">
          <h3 className="text-[11px] font-semibold mb-2" style={{ color: N }}>Property Visit & Inspection</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={onScheduleVisit}
              className="flex flex-col items-center gap-1 p-3 rounded-lg transition-all hover:shadow-md"
              style={{ background: `${O}10`, border: `1px solid ${O}20` }}
            >
              <Calendar size={16} style={{ color: O }} />
              <span className="text-[10px] font-medium" style={{ color: O }}>Schedule Schedule</span>
            </button>
            <button
              onClick={onStartInspection}
              className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all hover:shadow-md"
              style={{ background: '#3b82f610', border: '1px solid #3b82f620' }}
            >
              <Eye size={16} style={{ color: '#3b82f6' }} />
              <span className="text-[10px] font-medium" style={{ color: '#3b82f6' }}>Start Inspect</span>
            </button>
            <button
              onClick={onMaintenanceSuggestions}
              className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all hover:shadow-md"
              style={{ background: '#f59e0b10', border: '1px solid #f59e0b20' }}
            >
              <Wrench size={16} style={{ color: '#f59e0b' }} />
              <span className="text-[10px] font-medium" style={{ color: '#f59e0b' }}>Maintenance</span>
            </button>
            <button
              onClick={onGenerateReport}
              className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all hover:shadow-md"
              style={{ background: '#8b5cf610', border: '1px solid #8b5cf620' }}
            >
              <FileText size={16} style={{ color: '#8b5cf6' }} />
              <span className="text-[10px] font-medium" style={{ color: '#8b5cf6' }}>Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visit History */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: BD }}>
        <div className="p-3 border-b" style={{ borderColor: BD }}>
          <h3 className="text-[11px] font-semibold" style={{ color: N }}>Visit History</h3>
          <p className="text-[9px] mt-0.5" style={{ color: MU }}>Latest visits and inspections logged</p>
        </div>

        <div className="p-3 space-y-2 max-h-[55vh] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {list.length > 0 ? (
            list.map((v, idx) => {
              const status = v.status || 'scheduled';
              const tone = statusTone[status] || statusTone.scheduled;
              const dateStr = fmtDate(v.date);
              const timeStr = fmtTime(v.time);
              const showOutOf10 = typeof v.rating === 'number' && v.rating > 5;

              return (
                <div key={v.id ?? idx} className="p-2 rounded-lg border" style={{ background: BG, borderColor: BD }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <div className="p-1.5 rounded flex-shrink-0" style={{ background: `${O}15` }}>
                        <Eye size={12} style={{ color: O }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <div className="font-semibold text-[11px]" style={{ color: N }}>
                            {v.purpose || 'Visit'}
                          </div>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium" style={{ background: tone.bg, color: tone.text }}>
                            <span className="w-1 h-1 rounded-full" style={{ background: tone.dot }} />
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[9px]" style={{ color: MU }}>
                          {(dateStr || timeStr) && (
                            <span className="inline-flex items-center gap-0.5">
                              <Calendar size={9} style={{ color: O }} />
                              {dateStr}{dateStr && timeStr ? ' • ' : ''}{timeStr}
                            </span>
                          )}
                          {v.duration && (
                            <span className="inline-flex items-center gap-0.5">
                              <Clock size={9} style={{ color: O }} />
                              {v.duration}
                            </span>
                          )}
                          {v.inspector && (
                            <span className="inline-flex items-center gap-0.5">
                              <User size={9} style={{ color: O }} />
                              {v.inspector}
                            </span>
                          )}
                          {v.addressLine && (
                            <span className="inline-flex items-center gap-0.5 truncate max-w-[20ch]">
                              <MapPin size={9} style={{ color: O }} />
                              {v.addressLine}
                            </span>
                          )}
                        </div>

                        {v.accomp && v.accomp.length > 0 && (
                          <div className="flex flex-wrap gap-0.5 mt-1">
                            {v.accomp.map((p, i) => (
                              <span key={`${p}-${i}`} className="px-1.5 py-0.5 rounded-full text-[8px] font-medium" style={{ background: `${O}10`, color: O }}>
                                {p}
                              </span>
                            ))}
                          </div>
                        )}

                        {v.notes && (
                          <div className="mt-1 text-[9px] line-clamp-2" style={{ color: MU }}>
                            {v.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      {typeof v.rating === 'number' && (
                        <div>
                          {showOutOf10 ? (
                            <div className="text-[11px] font-semibold" style={{ color: O }}>{v.rating}/10</div>
                          ) : (
                            <Stars5 value={v.rating} />
                          )}
                          <div className="text-[8px] mt-0.5" style={{ color: MU }}>
                            {status === 'completed' ? 'Rated' : 'Scheduled'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6">
              <Calendar size={24} style={{ color: MU }} className="mx-auto mb-2" />
              <p className="text-[10px]" style={{ color: MU }}>No visits recorded yet</p>
              <button
                onClick={onScheduleVisit}
                className="mt-2 inline-flex items-center gap-1 px-2 py-2 rounded-md text-[12px] font-medium text-white transition-all hover:opacity-90"
                style={{ background: O }}
              >
                <Calendar size={12} />
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