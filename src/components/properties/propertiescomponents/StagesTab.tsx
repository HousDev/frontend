// import React, {  useState } from 'react';
// import { Activity, CheckCircle, RefreshCw } from 'lucide-react';

// interface Stage {
//   id: string;
//   label: string;
//   progress: number;
//   description: string;
//   tasks: string[];
//   nextStage: string | null;
// }

// interface StatusHistory {
//   id: string;
//   previous_status: string;
//   status: string;
//   remarks?: string;
//   update_reason?: string;
//   updated_by?: string;
//   timestamp: string;
//   price_adjustment?: boolean;
//   new_price?: number;
//   notify_parties?: boolean;
//   effective_date?: string;
// }

// interface StagesTabProps {
//   property: any;
//   stages: Stage[];
//   onStageUpdate: (newStage: string, remarks: string) => void;
//   onShowStageModal: () => void;
//   statusHistory: StatusHistory[];
//   loadingStatusHistory: boolean;
//   onRefreshHistory: () => void;
// }

// const StagesTab: React.FC<StagesTabProps> = ({
//   property,
//   stages,
//   onStageUpdate,
//   onShowStageModal,
//   statusHistory,
//   loadingStatusHistory,
//   onRefreshHistory
// }) => {
//   const [activeSubTab, setActiveSubTab] = useState('stage');
//   const currentStage = stages.find((s) => s.id === property.stage) || stages[0];
//   const currentStageIndex = stages.findIndex((s) => s.id === property.stage);

//   const getStatusBadge = (status: string) => {
//     const statusConfig: Record<string, { bg: string; text: string; icon: string; label: string }> = {
//       'Available': { bg: 'bg-green-100', text: 'text-green-700', icon: '🟢', label: 'Available' },
//       'Sold': { bg: 'bg-blue-100', text: 'text-blue-700', icon: '🔵', label: 'Sold' },
//       'Under Negotiation': { bg: 'bg-orange-100', text: 'text-orange-700', icon: '🟡', label: 'Under Negotiation' },
//       'On Hold': { bg: 'bg-gray-100', text: 'text-gray-700', icon: '⚫', label: 'On Hold' },
//       'Finalization': { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🟣', label: 'Finalization' }
//     };

//     const config = statusConfig[status] || statusConfig['Available'];
//     return (
//       <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
//         {config.icon} {config.label}
//       </span>
//     );
//   };

//   const formatDateTime = (dateTimeString: string) => {
//     if (!dateTimeString) return 'Not set';
//     const date = new Date(dateTimeString);
//     return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
//   };

//   return (
//     <div className="space-y-6">
//       {/* Sub Tabs */}
//       <div className="bg-white rounded-xl border border-gray-200 p-6">
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
//             <button
//               onClick={() => setActiveSubTab('stage')}
//               className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeSubTab === 'stage'
//                 ? 'bg-white text-blue-600 shadow-sm'
//                 : 'text-gray-600 hover:text-gray-900'
//                 }`}
//             >
//               Stage Progress
//             </button>
//             <button
//               onClick={() => setActiveSubTab('status')}
//               className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeSubTab === 'status'
//                 ? 'bg-white text-blue-600 shadow-sm'
//                 : 'text-gray-600 hover:text-gray-900'
//                 }`}
//             >
//               Status Progress
//             </button>
//           </div>

//           <div className="flex space-x-2">
//             {activeSubTab === 'status' && (
//               <button
//                 onClick={onRefreshHistory}
//                 disabled={loadingStatusHistory}
//                 className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center space-x-1"
//               >
//                 <RefreshCw size={14} className={loadingStatusHistory ? 'animate-spin' : ''} />
//                 <span>Refresh</span>
//               </button>
//             )}
//             {activeSubTab === 'stage' && (
//               <button
//                 onClick={onShowStageModal}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 Update Sta
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Stage Progress Content */}
//         {activeSubTab === 'stage' && (
//           <>
//             <div className="mb-6">
//               <div className="flex justify-between text-sm text-gray-600 mb-2">
//                 <span>{currentStage.label}</span>
//                 <span>{currentStage.progress}%</span>
//               </div>
//               <div className="w-full bg-gray-200 rounded-full h-3">
//                 <div
//                   className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
//                   style={{ width: `${currentStage.progress}%` } as any}
//                 />
//               </div>
//             </div>

//             {/* Current Stage Tasks */}
//             <div className="bg-blue-50 rounded-lg p-4 mb-4">
//               <h4 className="font-medium text-blue-900 mb-2">Current Stage: {currentStage.label}</h4>
//               <p className="text-sm text-blue-700 mb-3">{currentStage.description}</p>
//               <div className="space-y-2">
//                 {currentStage.tasks.map((task: string, index: number) => (
//                   <div key={index} className="flex items-center space-x-2">
//                     <CheckCircle className="text-blue-600" size={14} />
//                     <span className="text-sm text-blue-800">{task}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Stage Timeline */}
//             <div className="space-y-3">
//               {stages.map((stage: Stage, index: number) => {
//                 const isCompleted = index < currentStageIndex;
//                 const isCurrent = index === currentStageIndex;

//                 return (
//                   <div key={stage.id} className="flex items-center space-x-4">
//                     <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500 text-white' :
//                       isCurrent ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
//                       }`}>
//                       {isCompleted ? <CheckCircle size={16} /> : index + 1}
//                     </div>
//                     <div className="flex-1">
//                       <div className={`font-medium ${isCurrent ? 'text-blue-600' :
//                         isCompleted ? 'text-green-600' : 'text-gray-500'
//                         }`}>
//                         {stage.label}
//                       </div>
//                       <div className="text-sm text-gray-500">{stage.description}</div>
//                     </div>
//                     <div className="text-sm text-gray-400">
//                       {stage.progress}%
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </>
//         )}

//         {/* Status Progress Content with API data */}
//         {activeSubTab === 'status' && (
//           <>
//             {/* Current Status Display */}
//             <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4 mb-6 border border-gray-100">
//               <h4 className="font-medium text-gray-900 mb-3">Current Property Status</h4>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   {getStatusBadge(property.status)}
//                   <div className="text-sm text-gray-600">
//                     Last updated: {property.lastStatusUpdate ?
//                       new Date(property.lastStatusUpdate).toLocaleDateString() :
//                       'Not updated yet'
//                     }
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => {
//                     const event = new CustomEvent('openStatusUpdateModal', { detail: property });
//                     window.dispatchEvent(event);
//                   }}
//                   className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
//                 >
//                   Update Status
//                 </button>
//               </div>
//             </div>

//             {/* Status History Timeline from API */}
//             <div className="space-y-4">
//               <h4 className="font-medium text-gray-900">Status History</h4>

//               {loadingStatusHistory ? (
//                 <div className="text-center py-8">
//                   <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//                   <p className="text-gray-500 mt-2">Loading status history...</p>
//                 </div>
//               ) : statusHistory.length > 0 ? (
//                 <div className="space-y-3">
//                   {statusHistory.map((record: StatusHistory) => (
//                     <div key={record.id} className="flex items-start space-x-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
//                       <div className="flex-shrink-0">
//                         <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
//                           <Activity className="text-blue-600" size={16} />
//                         </div>
//                       </div>

//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-center justify-between mb-1">
//                           <h5 className="font-medium text-gray-900 truncate">
//                             Status changed from "{record.previous_status || 'Unknown'}" to "{record.status}"
//                           </h5>
//                           <time className="text-xs text-gray-500 flex-shrink-0">
//                             {formatDateTime(record.timestamp)}
//                           </time>
//                         </div>

//                         {record.remarks && (
//                           <p className="text-sm text-gray-600 mb-2">
//                             <strong>Remarks:</strong> {record.remarks}
//                           </p>
//                         )}

//                         {record.update_reason && (
//                           <p className="text-sm text-gray-600 mb-2">
//                             <strong>Reason:</strong> {record.update_reason}
//                           </p>
//                         )}

//                         <div className="flex items-center justify-between">
//                           <span className="text-xs text-gray-500">
//                             By: {record.updated_by || 'Unknown User'}
//                           </span>

//                           <div className="flex items-center space-x-2">
//                             {record.price_adjustment && (
//                               <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
//                                 Price Updated: ₹{Number(record.new_price || 0).toLocaleString('en-IN')}
//                               </span>
//                             )}
//                             {record.notify_parties && (
//                               <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
//                                 Parties Notified
//                               </span>
//                             )}
//                           </div>
//                         </div>

//                         {/* Show additional details if available */}
//                         {record.effective_date && (
//                           <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
//                             <div>
//                               <span className="font-medium">Effective Date:</span> {formatDateTime(record.effective_date)}
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
//                   <Activity className="mx-auto mb-2" size={32} />
//                   <p>No status updates recorded yet</p>
//                   <p className="text-sm">Status changes will appear here when they occur</p>
//                 </div>
//               )}
//             </div>
//           </>
//         )}
//       </div>

//       {/* Recent Activities (All Types) */}
//       <div className="bg-white rounded-xl border border-gray-200 p-6">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
//         <div className="space-y-3">
//           {property.activities?.slice(0, 5).map((activity: any) => (
//             <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
//               <div className="p-2 bg-blue-100 rounded-lg">
//                 <Activity className="text-blue-600" size={16} />
//               </div>
//               <div className="flex-1">
//                 <div className="font-medium text-gray-900">{activity.description}</div>
//                 <div className="text-sm text-gray-600">{activity.remarks}</div>
//                 <div className="text-xs text-gray-500">{activity.date} • {activity.user}</div>
//               </div>
//             </div>
//           )) || (
//               <div className="text-center py-8 text-gray-500">
//                 <Activity className="mx-auto mb-2" size={32} />
//                 <p>No activities recorded yet</p>
//               </div>
//             )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StagesTab;


import React, { useState } from 'react';
import { Activity, CheckCircle, RefreshCw, Clock, User, Calendar, TrendingUp, Target, ArrowRight } from 'lucide-react';

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

interface Stage {
  id: string;
  label: string;
  progress: number;
  description: string;
  tasks: string[];
  nextStage: string | null;
}

interface StatusHistory {
  id: string;
  previous_status: string;
  status: string;
  remarks?: string;
  update_reason?: string;
  updated_by?: string;
  timestamp: string;
  price_adjustment?: boolean;
  new_price?: number;
  notify_parties?: boolean;
  effective_date?: string;
}

interface StagesTabProps {
  property: any;
  stages: Stage[];
  onStageUpdate: (newStage: string, remarks: string) => void;
  onShowStageModal: () => void;
  statusHistory: StatusHistory[];
  loadingStatusHistory: boolean;
  onRefreshHistory: () => void;
}

const StagesTab: React.FC<StagesTabProps> = ({
  property,
  stages,
  onStageUpdate,
  onShowStageModal,
  statusHistory,
  loadingStatusHistory,
  onRefreshHistory
}) => {
  const [activeSubTab, setActiveSubTab] = useState('stage');
  const currentStage = stages.find((s) => s.id === property.stage) || stages[0];
  const currentStageIndex = stages.findIndex((s) => s.id === property.stage);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; icon: string; label: string }> = {
      'Available': { bg: '#10b98110', text: '#10b981', icon: '🟢', label: 'Available' },
      'Sold': { bg: '#ef444410', text: '#ef4444', icon: '🔵', label: 'Sold' },
      'Under Negotiation': { bg: '#f59e0b10', text: '#f59e0b', icon: '🟡', label: 'Under Negotiation' },
      'On Hold': { bg: '#64748b10', text: '#64748b', icon: '⚫', label: 'On Hold' },
      'Finalization': { bg: '#8b5cf610', text: '#8b5cf6', icon: '🟣', label: 'Finalization' }
    };

    const config = statusConfig[status] || statusConfig['Available'];
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: config.bg, color: config.text }}>
        {config.icon} {config.label}
      </span>
    );
  };

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return 'Not set';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="space-y-4">
      {/* Main Card */}
      <div className="bg-white rounded-xl border p-4" style={{ borderColor: BD }}>
        
        {/* Sub Tabs - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 w-fit">
            <button
              onClick={() => setActiveSubTab('stage')}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                activeSubTab === 'stage'
                  ? 'text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={activeSubTab === 'stage' ? { background: N } : {}}
            >
              Stage Progress
            </button>
            <button
              onClick={() => setActiveSubTab('status')}
              className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                activeSubTab === 'status'
                  ? 'text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={activeSubTab === 'status' ? { background: N } : {}}
            >
              Status History
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeSubTab === 'status' && (
              <button
                onClick={onRefreshHistory}
                disabled={loadingStatusHistory}
                className="px-2.5 py-1 rounded-md text-[11px] transition-colors disabled:opacity-50 flex items-center gap-1"
                style={{ background: `${N}10`, color: N }}
              >
                <RefreshCw size={11} className={loadingStatusHistory ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            )}
            {activeSubTab === 'stage' && (
              <button
                onClick={onShowStageModal}
                className="px-3 py-1 rounded-md text-[11px] text-white transition-all hover:opacity-90"
                style={{ background: O }}
              >
                Update Stage
              </button>
            )}
          </div>
        </div>

        {/* Stage Progress Content */}
        {activeSubTab === 'stage' && (
          <>
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-[11px] mb-1" style={{ color: MU }}>
                <span className="font-medium">{currentStage.label}</span>
                <span className="font-medium">{currentStage.progress}%</span>
              </div>
              <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: `${N}10` }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${currentStage.progress}%`, background: O }}
                />
              </div>
            </div>

            {/* Current Stage Tasks */}
            <div className="rounded-lg p-3 mb-4" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
              <h4 className="text-[12px] font-semibold mb-1.5" style={{ color: O }}>Current Stage: {currentStage.label}</h4>
              <p className="text-[11px] mb-2.5" style={{ color: MU }}>{currentStage.description}</p>
              <div className="space-y-1.5">
                {currentStage.tasks.slice(0, 3).map((task: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle size={10} style={{ color: O }} />
                    <span className="text-[11px]" style={{ color: MU }}>{task}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage Timeline */}
            <div className="space-y-2 max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              {stages.map((stage: Stage, index: number) => {
                const isCompleted = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;
                const stageColor = isCompleted ? '#10b981' : (isCurrent ? O : MU);

                return (
                  <div key={stage.id} className="flex items-center gap-2.5 p-2 rounded-lg transition-all hover:shadow-sm" style={{ background: `${N}05` }}>
                    <div className="flex-shrink-0">
                      <div 
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
                        style={{ background: stageColor }}
                      >
                        {isCompleted ? <CheckCircle size={13} /> : index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold" style={{ color: isCurrent ? O : (isCompleted ? '#10b981' : N) }}>
                        {stage.label}
                      </div>
                      <div className="text-[10px]" style={{ color: MU }}>{stage.description}</div>
                    </div>
                    <div className="text-[11px] font-medium" style={{ color: stageColor }}>{stage.progress}%</div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Status Progress Content */}
        {activeSubTab === 'status' && (
          <>
            {/* Current Status Display */}
            <div className="rounded-lg p-3 mb-4" style={{ background: `${N}05`, border: `1px solid ${BD}` }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h4 className="text-[12px] font-semibold mb-1.5" style={{ color: N }}>Current Property Status</h4>
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(property.status)}
                    <div className="text-[10px]" style={{ color: MU }}>
                      Last updated: {property.lastStatusUpdate ?
                        new Date(property.lastStatusUpdate).toLocaleDateString() :
                        'Not updated'
                      }
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const event = new CustomEvent('openStatusUpdateModal', { detail: property });
                    window.dispatchEvent(event);
                  }}
                  className="px-3 py-1 rounded-md text-[11px] text-white transition-all hover:opacity-90 w-full sm:w-auto"
                  style={{ background: O }}
                >
                  Update Status
                </button>
              </div>
            </div>

            {/* Status History Timeline */}
            <div className="space-y-3">
              <h4 className="text-[12px] font-semibold" style={{ color: N }}>Status History</h4>

              {loadingStatusHistory ? (
                <div className="text-center py-6">
                  <div className="inline-block w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: O, borderTopColor: 'transparent' }} />
                  <p className="text-[10px] mt-1" style={{ color: MU }}>Loading...</p>
                </div>
              ) : statusHistory.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                  {statusHistory.map((record: StatusHistory) => (
                    <div key={record.id} className="p-2.5 rounded-lg border" style={{ background: BG, borderColor: BD }}>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${O}15` }}>
                            <Activity size={11} style={{ color: O }} />
                          </div>
                          <h5 className="text-[13px] font-semibold" style={{ color: N }}>
                            {record.previous_status ? `"${record.previous_status}" → "${record.status}"` : `Status: ${record.status}`}
                          </h5>
                        </div>
                        <div className="flex items-center gap-1 text-[9px]" style={{ color: MU }}>
                          <Calendar size={9} />
                          <span>{formatDateTime(record.timestamp)}</span>
                        </div>
                      </div>

                      {record.remarks && (
                        <p className="text-[12px] mb-1.5" style={{ color: MU }}>
                          <span className="font-semibold" style={{ color: N }}>Remarks:</span> {record.remarks}
                        </p>
                      )}

                      {record.update_reason && (
                        <p className="text-[12px] mb-1.5" style={{ color: MU }}>
                          <span className="font-semibold" style={{ color: N }}>Reason:</span> {record.update_reason}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-1 mt-1.5">
                        <div className="flex items-center gap-1 text-[9px]" style={{ color: MU }}>
                          <User size={9} />
                          <span>By: {record.updated_by || 'Unknown'}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                         {!!record.price_adjustment && (
  <span className="px-1.5 py-1.5 rounded text-[10px] font-medium" style={{ background: `${O}15`, color: O }}>
    Price: ₹{Number(record.new_price || 0).toLocaleString('en-IN')}
  </span>
)}
                          {record.notify_parties && (
                            <span className="px-1.5 py-1.5 rounded text-[10px] font-medium" style={{ background: '#3b82f610', color: '#3b82f6' }}>
                              Notified
                            </span>
                          )}
                        </div>
                      </div>

                      {record.effective_date && (
                        <div className="mt-2 p-1.5 rounded text-[9px]" style={{ background: `${N}05`, color: MU }}>
                          <span className="font-medium" style={{ color: N }}>Effective Date:</span> {formatDateTime(record.effective_date)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 rounded-lg" style={{ background: BG, border: `1px solid ${BD}` }}>
                  <Activity size={22} style={{ color: MU }} className="mx-auto mb-1.5" />
                  <p className="text-[10px]" style={{ color: MU }}>No status updates recorded yet</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl border p-4" style={{ borderColor: BD }}>
        <h3 className="text-[13px] font-semibold mb-3" style={{ color: N }}>Recent Activities</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {property.activities?.slice(0, 5).map((activity: any) => (
            <div key={activity.id} className="flex items-start gap-2.5 p-2.5 rounded-lg" style={{ background: BG, border: `1px solid ${BD}` }}>
              <div className="p-1.5 rounded" style={{ background: `${O}15` }}>
                <Activity size={11} style={{ color: O }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium truncate" style={{ color: N }}>{activity.description}</div>
                <div className="text-[9px] truncate" style={{ color: MU }}>{activity.remarks}</div>
                <div className="flex items-center gap-2 mt-0.5 text-[8px]" style={{ color: MU }}>
                  <span>{activity.date}</span>
                  <span>•</span>
                  <span>{activity.user}</span>
                </div>
              </div>
            </div>
          )) || (
            <div className="text-center py-5 rounded-lg" style={{ background: BG, border: `1px solid ${BD}` }}>
              <Activity size={18} style={{ color: MU }} className="mx-auto mb-1" />
              <p className="text-[10px]" style={{ color: MU }}>No activities recorded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StagesTab;