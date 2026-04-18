// import React from 'react';
// import { Phone, Eye, Users, Mail, MessageCircle, Activity, Plus, Edit, Star } from 'lucide-react';

// interface ActivitiesTabProps {
//   buyer: any;
//   onAddActivity: () => void;
//   onEditActivity: (activity: any) => void;
// }

// const ActivitiesTab: React.FC<ActivitiesTabProps> = ({ buyer, onAddActivity, onEditActivity }) => {
//   const getActivityIcon = (type: string) => {
//     switch (type) {
//       case 'call': return <Phone className="text-blue-600" size={16} />;
//       case 'visit': return <Eye className="text-green-600" size={16} />;
//       case 'meeting': return <Users className="text-purple-600" size={16} />;
//       case 'email': return <Mail className="text-orange-600" size={16} />;
//       case 'whatsapp': return <MessageCircle className="text-green-600" size={16} />;
//       default: return <Activity className="text-gray-600" size={16} />;
//     }
//   };

//   const getActivityTypeLabel = (type: string) => {
//     const labels = {
//       'call': 'Phone Call',
//       'visit': 'Property Visit',
//       'meeting': 'Meeting',
//       'email': 'Email',
//       'whatsapp': 'WhatsApp',
//       'presentation': 'Presentation'
//     };
//     return labels[type as keyof typeof labels] || type;
//   };

//   return (
//     <div className="space-y-1">
//       <div className="flex flex-wrap md:flex-nowrap items-center justify-between">
//         <h3 className="text-xs font-semibold text-gray-900 mb-1 md:mb-0">
//           Activity Timeline
//         </h3>
//         <button
//           onClick={onAddActivity}
//           className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
//         >
//           <Plus size={14} />
//           <span>Add Activity</span>
//         </button>
//       </div>

//       {buyer.activities?.length > 0 ? (
//         <div className="space-y-2">
//           {buyer.activities.map((activity: any, index: number) => (
//             <div key={activity.id} className="relative">
//               {/* Timeline line */}
//               {index < buyer.activities.length - 1 && (
//                 <div className="absolute left-5 top-10 w-0.5 h-12 bg-gray-200"></div>
//               )}

//               <div className="flex items-start space-x-3">
//                 {/* Icon */}
//                 <div className="p-2 bg-white border border-gray-200 rounded-full">
//                   {getActivityIcon(activity.type)}
//                 </div>

//                 {/* Content */}
//                 <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3">
//                   <div className="flex items-center justify-between mb-1">
//                     <div className="flex items-center space-x-2">
//                       <h4 className="font-semibold text-gray-900 text-xs">
//                         {activity.description}
//                       </h4>
//                       <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-medium">
//                         {getActivityTypeLabel(activity.type)}
//                       </span>
//                     </div>
//                     <div className="flex items-center space-x-1">
//                       <span className="text-[10px] text-gray-500">
//                         {activity.date} • {activity.time}
//                       </span>
//                       <button
//                         onClick={() => onEditActivity(activity)}
//                         className="p-1 text-blue-600 hover:bg-blue-100 rounded"
//                       >
//                         <Edit size={12} />
//                       </button>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2 text-[11px]">
//                     <div>
//                       <span className="text-gray-500">Duration:</span>
//                       <span className="font-medium ml-1">{activity.duration}</span>
//                     </div>
//                     <div>
//                       <span className="text-gray-500">Stage:</span>
//                       <span className="font-medium ml-1">
//                         {activity.stage.replace("_", " ")}
//                       </span>
//                     </div>
//                     <div>
//                       <span className="text-gray-500">Executed by:</span>
//                       <span className="font-medium ml-1">{activity.executedBy}</span>
//                     </div>
//                     <div>
//                       <span className="text-gray-500">Rating:</span>
//                       <div className="flex items-center space-x-0.5 ml-1">
//                         {Array.from({ length: 5 }, (_, i) => (
//                           <Star
//                             key={i}
//                             size={10}
//                             className={
//                               i < activity.rating
//                                 ? "text-yellow-400 fill-current"
//                                 : "text-gray-300"
//                             }
//                           />
//                         ))}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="space-y-1 text-[11px]">
//                     <div>
//                       <span className="text-gray-500">Outcome:</span>
//                       <p className="text-gray-700">{activity.outcome}</p>
//                     </div>
//                     <div>
//                       <span className="text-gray-500">Next Action:</span>
//                       <p className="text-gray-700">{activity.nextAction}</p>
//                     </div>
//                     {activity.remarks && (
//                       <div>
//                         <span className="text-gray-500">Remarks:</span>
//                         <p className="text-gray-700">{activity.remarks}</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="bg-white rounded border border-gray-200 p-6 text-center">
//           <Activity className="mx-auto text-gray-300 mb-3" size={40} />
//           <h3 className="text-xs font-semibold text-gray-900 mb-1">
//             No Activities Yet
//           </h3>
//           <p className="text-[11px] text-gray-500 mb-3">
//             Start tracking buyer interactions and activities
//           </p>
//           <button
//             onClick={onAddActivity}
//             className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
//           >
//             Add First Activity
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ActivitiesTab;


import React from 'react';
import { Phone, Eye, Users, Mail, MessageCircle, Activity, Plus, Edit, Star, Calendar, Clock, UserCheck } from 'lucide-react';

// ESALE Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

interface ActivitiesTabProps {
  buyer: any;
  onAddActivity: () => void;
  onEditActivity: (activity: any) => void;
}

const ActivitiesTab: React.FC<ActivitiesTabProps> = ({ buyer, onAddActivity, onEditActivity }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone size={14} style={{ color: O }} />;
      case 'visit': return <Eye size={14} style={{ color: O }} />;
      case 'meeting': return <Users size={14} style={{ color: O }} />;
      case 'email': return <Mail size={14} style={{ color: O }} />;
      case 'whatsapp': return <MessageCircle size={14} style={{ color: '#25D366' }} />;
      default: return <Activity size={14} style={{ color: MU }} />;
    }
  };

  const getActivityTypeLabel = (type: string) => {
    const labels = {
      'call': 'Phone Call',
      'visit': 'Property Visit',
      'meeting': 'Meeting',
      'email': 'Email',
      'whatsapp': 'WhatsApp',
      'presentation': 'Presentation'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getActivityTypeColor = (type: string) => {
    const colors = {
      'call': { bg: `${O}10`, text: O },
      'visit': { bg: `${O}10`, text: O },
      'meeting': { bg: `${O}10`, text: O },
      'email': { bg: `${O}10`, text: O },
      'whatsapp': { bg: '#25D36610', text: '#25D366' },
      'presentation': { bg: `${O}10`, text: O }
    };
    return colors[type as keyof typeof colors] || { bg: `${O}10`, text: O };
  };

  return (
    <div className="space-y-3 mb-72">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-semibold" style={{ color: N }}>Activity Timeline</h3>
          <p className="text-[8px]" style={{ color: MU }}>Track buyer interactions and activities</p>
        </div>
        <button
          onClick={onAddActivity}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-white text-[10px] font-medium transition-all hover:opacity-80"
          style={{ background: O }}
        >
          <Plus size={12} />
          <span>Add Activity</span>
        </button>
      </div>

      {buyer.activities?.length > 0 ? (
        <div className="space-y-3">
          {buyer.activities.map((activity: any, index: number) => {
            const typeColor = getActivityTypeColor(activity.type);
            
            return (
              <div key={activity.id} className="relative">
                {/* Timeline line */}
                {index < buyer.activities.length - 1 && (
                  <div className="absolute left-5 top-8 w-0.5 h-12" style={{ background: BD }}></div>
                )}

                <div className="flex items-start gap-3">
                  {/* Icon Circle */}
                  <div className="p-1.5 rounded-full flex-shrink-0" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Content Card */}
                  <div className="flex-1 bg-white rounded-xl overflow-hidden" style={{ border: `1px solid ${BD}` }}>
                    <div className="p-2.5">
                      {/* Header */}
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h4 className="text-xs font-semibold truncate" style={{ color: N }}>
                              {activity.description}
                            </h4>
                            <span 
                              className="px-1.5 py-0.5 rounded-full text-[8px] font-medium"
                              style={{ background: typeColor.bg, color: typeColor.text }}
                            >
                              {getActivityTypeLabel(activity.type)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-[8px]" style={{ color: MU }}>
                            {activity.date}
                          </span>
                          <button
                            onClick={() => onEditActivity(activity)}
                            className="p-0.5 rounded transition-colors hover:bg-gray-100"
                            style={{ color: O }}
                          >
                            <Edit size={10} />
                          </button>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-2 text-[9px]">
                        <div className="flex items-center gap-1">
                          <Clock size={8} style={{ color: MU }} />
                          <span style={{ color: MU }}>Duration:</span>
                          <span className="font-medium" style={{ color: N }}>{activity.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <UserCheck size={8} style={{ color: MU }} />
                          <span style={{ color: MU }}>Executed by:</span>
                          <span className="font-medium truncate" style={{ color: N }}>{activity.executedBy}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity size={8} style={{ color: MU }} />
                          <span style={{ color: MU }}>Stage:</span>
                          <span className="font-medium" style={{ color: N }}>
                            {activity.stage?.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star size={8} style={{ color: MU }} />
                          <span style={{ color: MU }}>Rating:</span>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }, (_, i) => (
                              <Star
                                key={i}
                                size={8}
                                className={i < activity.rating ? "fill-current" : ""}
                                style={i < activity.rating ? { color: '#eab308' } : { color: BD }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Outcome */}
                      <div className="mb-1.5">
                        <div className="text-[7px] uppercase font-medium mb-0.5" style={{ color: MU }}>Outcome</div>
                        <p className="text-[9px]" style={{ color: N }}>{activity.outcome}</p>
                      </div>

                      {/* Next Action */}
                      <div className="mb-1.5">
                        <div className="text-[7px] uppercase font-medium mb-0.5" style={{ color: MU }}>Next Action</div>
                        <p className="text-[9px]" style={{ color: N }}>{activity.nextAction}</p>
                      </div>

                      {/* Remarks */}
                      {activity.remarks && (
                        <div className="pt-1 mt-0.5" style={{ borderTop: `1px solid ${BD}` }}>
                          <div className="text-[7px] uppercase font-medium mb-0.5" style={{ color: MU }}>Remarks</div>
                          <p className="text-[9px]" style={{ color: N }}>{activity.remarks}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl text-center p-6" style={{ border: `1px solid ${BD}` }}>
          <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3" style={{ background: `${O}10` }}>
            <Activity size={24} style={{ color: O }} />
          </div>
          <h3 className="text-sm font-semibold mb-1" style={{ color: N }}>No Activities Yet</h3>
          <p className="text-[10px] mb-4" style={{ color: MU }}>Start tracking buyer interactions and activities</p>
          <button
            onClick={onAddActivity}
            className="px-3 py-1.5 rounded-lg text-white text-[10px] font-medium transition-all hover:opacity-80"
            style={{ background: O }}
          >
            Add First Activity
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivitiesTab;