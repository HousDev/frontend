// import React, { useState } from 'react';
// import {
//   X,
//   Save,
//   TrendingUp,
//   CheckCircle,
//   Clock,
//   AlertCircle,
//   ArrowRight,
//   User,
//   Building,
//   Calendar,
//   FileText,
//   Target,
//   Award,
//   Shield,
//   Crown
// } from 'lucide-react';

// type Seller = {
//   id?: string | number;
//   name?: string;
//   stage?: string;
//   stageProgress?: number;
//   [k: string]: any;
// };

// type Props = {
//   isOpen: boolean;
//   onClose: () => void;
//   seller?: Seller;
//   onUpdateStage: (newStage: string, remarks: string, nextAction: string) => Promise<any> | any;
// };

// const SellerStageUpdateModal: React.FC<Props> = ({ isOpen, onClose, seller = {}, onUpdateStage }) => {
//   if (!isOpen) return null;

//   const [selectedStage, setSelectedStage] = useState<string>(seller?.stage ?? '');
//   const [remarks, setRemarks] = useState<string>('');
//   const [nextAction, setNextAction] = useState<string>('');
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

//   const sellerStages: {
//     id: string;
//     label: string;
//     description: string;
//     progress: number;
//     icon: React.ReactNode;
//     tasks: string[];
//   }[] = [
//       {
//         id: 'initial_contact',
//         label: 'Initial Contact',
//         description: 'First contact with seller',
//         progress: 10,
//         icon: '📞',
//         tasks: [
//           'Contact seller and introduce services',
//           'Understand seller requirements',
//           'Schedule property visit',
//           'Collect basic property information'
//         ]
//       },
//       {
//         id: 'property_collection',
//         label: 'Property Collection',
//         description: 'Collecting property details',
//         progress: 25,
//         icon: '🏠',
//         tasks: [
//           'Visit property for inspection',
//           'Collect property documents',
//           'Take professional photos',
//           'Gather all property specifications'
//         ]
//       },
//       {
//         id: 'mandate_discussion',
//         label: 'Mandate Discussion',
//         description: 'Discussing mandate terms',
//         progress: 40,
//         icon: '💬',
//         tasks: [
//           'Explain mandate agreement benefits',
//           'Discuss commission structure',
//           'Negotiate terms and conditions',
//           'Address seller concerns'
//         ]
//       },
//       {
//         id: 'mandate_signed',
//         label: 'Mandate Signed',
//         description: 'Exclusive mandate agreement signed',
//         progress: 60,
//         icon: '✅',
//         tasks: [
//           'Prepare mandate agreement',
//           'Get seller signature',
//           'Complete OTP verification',
//           'File signed agreement'
//         ]
//       },
//       {
//         id: 'selling_process',
//         label: 'Selling Process',
//         description: 'Active marketing and selling',
//         progress: 75,
//         icon: '🔄',
//         tasks: [
//           'List property on portals',
//           'Market to potential buyers',
//           'Arrange property visits',
//           'Handle buyer inquiries'
//         ]
//       },
//       {
//         id: 'deal_negotiation',
//         label: 'Deal Negotiation',
//         description: 'Negotiating with buyers',
//         progress: 85,
//         icon: '🤝',
//         tasks: [
//           'Receive buyer offers',
//           'Negotiate price and terms',
//           'Facilitate buyer-seller meetings',
//           'Finalize deal terms'
//         ]
//       },
//       {
//         id: 'deal_closure',
//         label: 'Deal Closure',
//         description: 'Completing the sale',
//         progress: 95,
//         icon: '📋',
//         tasks: [
//           'Prepare sale agreement',
//           'Coordinate documentation',
//           'Handle registration process',
//           'Ensure smooth handover'
//         ]
//       },
//       {
//         id: 'completed',
//         label: 'Completed',
//         description: 'Sale successfully completed',
//         progress: 100,
//         icon: '🎉',
//         tasks: [
//           'Sale completed successfully',
//           'All documents finalized',
//           'Commission received',
//           'Relationship maintained'
//         ]
//       }
//     ];

//   const currentStageIndex = Math.max(0, sellerStages.findIndex(s => s.id === seller.stage));
//   const selectedStageIndex = sellerStages.findIndex(s => s.id === selectedStage);
//   const selectedStageData = sellerStages.find(s => s.id === selectedStage) ?? null;

//   const handleSave = async () => {
//     if (!remarks.trim()) {
//       alert('Please provide remarks for stage update');
//       return;
//     }

//     if (!nextAction.trim()) {
//       alert('Please specify the next action');
//       return;
//     }

//     setIsSubmitting(true);
//     try {
//       await onUpdateStage(selectedStage, remarks, nextAction);
//     } catch (error) {
//       console.error('Error updating stage:', error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const canProgressToStage = (stageIndex: number) => {
//     // allow selecting current stage or progressing at most one step ahead
//     const safeCurrent = Math.max(0, currentStageIndex);
//     return stageIndex <= safeCurrent + 1;
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
//         {/* Header */}
//         <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900">Update Seller Stage</h2>
//               <p className="text-gray-600 mt-1">{seller.name} - Stage Progression</p>
//             </div>
//             <button
//               onClick={onClose}
//               className="p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-lg"
//             >
//               <X size={20} />
//             </button>
//           </div>
//         </div>

//         <div className="p-6 max-h-[70vh] overflow-y-auto">
//           {/* Current Stage Info */}
//           <div className="bg-blue-50 rounded-xl p-4 mb-6">
//             <h3 className="font-semibold text-blue-900 mb-2">Current Stage</h3>
//             <div className="flex items-center space-x-3">
//               <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
//                 {currentStageIndex + 1}
//               </div>
//               <div>
//                 <div className="font-medium text-blue-900">{sellerStages[currentStageIndex]?.label}</div>
//                 <div className="text-sm text-blue-700">{sellerStages[currentStageIndex]?.description}</div>
//                 <div className="text-xs text-blue-600">Progress: {sellerStages[currentStageIndex]?.progress}%</div>
//               </div>
//             </div>
//           </div>

//           {/* Stage Selection */}
//           <div className="mb-6">
//             <h3 className="font-semibold text-gray-900 mb-4">Select New Stage</h3>
//             <div className="space-y-3">
//               {sellerStages.map((stage, index) => {
//                 const isCompleted = index < currentStageIndex;
//                 const isCurrent = index === currentStageIndex;
//                 const isSelected = selectedStage === stage.id;
//                 const canProgress = canProgressToStage(index);

//                 return (
//                   <button
//                     key={stage.id}
//                     onClick={() => canProgress && setSelectedStage(stage.id)}
//                     disabled={!canProgress}
//                     className={`w-full flex items-center space-x-4 p-4 rounded-xl border-2 transition-all text-left ${isSelected ? 'border-purple-500 bg-purple-50' :
//                         canProgress ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50' :
//                           'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
//                       }`}
//                   >
//                     <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${isCompleted ? 'bg-green-500 text-white' :
//                         isCurrent ? 'bg-blue-500 text-white' :
//                           isSelected ? 'bg-purple-500 text-white' :
//                             'bg-gray-200 text-gray-500'
//                       }`}>
//                       {isCompleted ? <CheckCircle size={20} /> : stage.icon}
//                     </div>
//                     <div className="flex-1">
//                       <div className="flex items-center space-x-2 mb-1">
//                         <span className="font-medium text-gray-900">{stage.label}</span>
//                         {!canProgress && index > currentStageIndex + 1 && (
//                           <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
//                             Complete previous stages first
//                           </span>
//                         )}
//                       </div>
//                       <div className="text-sm text-gray-600 mb-2">{stage.description}</div>
//                       <div className="w-full bg-gray-200 rounded-full h-2">
//                         <div
//                           className="bg-purple-500 h-2 rounded-full transition-all"
//                           style={{ width: `${stage.progress}%` }}
//                         />
//                       </div>
//                       <div className="text-xs text-gray-500 mt-1">Progress: {stage.progress}%</div>
//                     </div>
//                     <div className="text-right">
//                       {isSelected && <ArrowRight className="text-purple-600" size={20} />}
//                     </div>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Selected Stage Tasks */}
//           {selectedStageData && (
//             <div className="bg-green-50 rounded-xl p-4 mb-6">
//               <h3 className="font-semibold text-green-900 mb-3">Tasks for {selectedStageData.label}</h3>
//               <div className="space-y-2">
//                 {selectedStageData.tasks.map((task, idx) => (
//                   <div key={idx} className="flex items-center space-x-2">
//                     <CheckCircle className="text-green-600" size={14} />
//                     <span className="text-sm text-green-800">{task}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Remarks and Next Action */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Remarks <span className="text-red-500">*</span>
//               </label>
//               <textarea
//                 value={remarks}
//                 onChange={(e) => setRemarks(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
//                 rows={4}
//                 placeholder="Provide details about the stage update, what was completed, challenges faced, etc."
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Next Action <span className="text-red-500">*</span>
//               </label>
//               <textarea
//                 value={nextAction}
//                 onChange={(e) => setNextAction(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
//                 rows={4}
//                 placeholder="Specify what needs to be done next, timeline, and responsible person..."
//                 required
//               />
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="p-6 border-t border-gray-200 bg-gray-50">
//           <div className="flex items-center justify-between">
//             <div className="text-sm text-gray-500">
//               Stage update will be recorded in seller timeline
//             </div>
//             <div className="flex items-center space-x-3">
//               <button
//                 onClick={onClose}
//                 className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSave}
//                 disabled={isSubmitting || !remarks.trim() || !nextAction.trim() || selectedStage === seller.stage}
//                 className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <Save size={16} />
//                 <span>{isSubmitting ? 'Updating...' : 'Update Stage'}</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SellerStageUpdateModal;


import React, { useState } from 'react';
import {
  X,
  Save,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  User,
  Building,
  Calendar,
  FileText,
  Target,
  Award,
  Shield,
  Crown,
  ChevronRight,
  ChevronLeft,
  Star,
  Zap,
  MessageSquare,
  ClipboardList
} from 'lucide-react';

// Professional Theme Colors
const N = "#1e293b";
const P = "#6366f1";
const PLight = "#eef2ff";
const PGray = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#64748b";
const O ="#e67e22"

type Seller = {
  id?: string | number;
  name?: string;
  stage?: string;
  stageProgress?: number;
  [k: string]: any;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  seller?: Seller;
  onUpdateStage: (newStage: string, remarks: string, nextAction: string) => Promise<any> | any;
};

// Form Field Component
const FormField: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
  error?: string;
}> = ({ label, required, children, icon, error }) => (
  <div className="space-y-1">
    <label className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide" style={{ color: MU }}>
      {icon && <span className="text-indigo-500">{icon}</span>}
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-[9px] mt-0.5">{error}</p>}
  </div>
);

const SellerStageUpdateModal: React.FC<Props> = ({ isOpen, onClose, seller = {}, onUpdateStage }) => {
  if (!isOpen) return null;

  const [selectedStage, setSelectedStage] = useState<string>(seller?.stage ?? '');
  const [remarks, setRemarks] = useState<string>('');
  const [nextAction, setNextAction] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const sellerStages: {
    id: string;
    label: string;
    description: string;
    progress: number;
    icon: React.ReactNode;
    tasks: string[];
  }[] = [
      {
        id: 'initial_contact',
        label: 'Initial Contact',
        description: 'First contact with seller',
        progress: 10,
        icon: '📞',
        tasks: [
          'Contact seller and introduce services',
          'Understand seller requirements',
          'Schedule property visit',
          'Collect basic property information'
        ]
      },
      {
        id: 'property_collection',
        label: 'Property Collection',
        description: 'Collecting property details',
        progress: 25,
        icon: '🏠',
        tasks: [
          'Visit property for inspection',
          'Collect property documents',
          'Take professional photos',
          'Gather all property specifications'
        ]
      },
      {
        id: 'mandate_discussion',
        label: 'Mandate Discussion',
        description: 'Discussing mandate terms',
        progress: 40,
        icon: '💬',
        tasks: [
          'Explain mandate agreement benefits',
          'Discuss commission structure',
          'Negotiate terms and conditions',
          'Address seller concerns'
        ]
      },
      {
        id: 'mandate_signed',
        label: 'Mandate Signed',
        description: 'Exclusive mandate agreement signed',
        progress: 60,
        icon: '✅',
        tasks: [
          'Prepare mandate agreement',
          'Get seller signature',
          'Complete OTP verification',
          'File signed agreement'
        ]
      },
      {
        id: 'selling_process',
        label: 'Selling Process',
        description: 'Active marketing and selling',
        progress: 75,
        icon: '🔄',
        tasks: [
          'List property on portals',
          'Market to potential buyers',
          'Arrange property visits',
          'Handle buyer inquiries'
        ]
      },
      {
        id: 'deal_negotiation',
        label: 'Deal Negotiation',
        description: 'Negotiating with buyers',
        progress: 85,
        icon: '🤝',
        tasks: [
          'Receive buyer offers',
          'Negotiate price and terms',
          'Facilitate buyer-seller meetings',
          'Finalize deal terms'
        ]
      },
      {
        id: 'deal_closure',
        label: 'Deal Closure',
        description: 'Completing the sale',
        progress: 95,
        icon: '📋',
        tasks: [
          'Prepare sale agreement',
          'Coordinate documentation',
          'Handle registration process',
          'Ensure smooth handover'
        ]
      },
      {
        id: 'completed',
        label: 'Completed',
        description: 'Sale successfully completed',
        progress: 100,
        icon: '🎉',
        tasks: [
          'Sale completed successfully',
          'All documents finalized',
          'Commission received',
          'Relationship maintained'
        ]
      }
    ];

  const currentStageIndex = Math.max(0, sellerStages.findIndex(s => s.id === seller.stage));
  const selectedStageData = sellerStages.find(s => s.id === selectedStage) ?? null;

  const handleSave = async () => {
    if (!remarks.trim()) {
      alert('Please provide remarks for stage update');
      return;
    }

    if (!nextAction.trim()) {
      alert('Please specify the next action');
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdateStage(selectedStage, remarks, nextAction);
      onClose();
    } catch (error) {
      console.error('Error updating stage:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProgressToStage = (stageIndex: number) => {
    const safeCurrent = Math.max(0, currentStageIndex);
    return stageIndex <= safeCurrent + 1;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }}>
        
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b bg-[#0f2b3d]" >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg text-orange-600" >
              <TrendingUp size={16}  />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white " >Update Seller Stage</h2>
              <p className="text-[10px] text-white" >{seller.name || 'Seller'} - Track progression</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={16} style={{ color: MU }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: 'thin' }}>
          
          {/* Current Stage Info */}
          <div className="rounded-lg p-3 mb-4" style={{ background: PLight, border: `2px solid ${O}80` }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-semibold flex items-center gap-1 " style={{ color: O }}>
                <Target size={10} /> Current Stage
              </h3>
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: P, color: 'white' }}>
                {sellerStages[currentStageIndex]?.progress}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: P }}>
                {currentStageIndex + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium text-[10px]" style={{ color: N }}>{sellerStages[currentStageIndex]?.label}</div>
                <div className="text-[8px]" style={{ color: MU }}>{sellerStages[currentStageIndex]?.description}</div>
                <div className="flex items-center gap-1 mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-1">
                    <div className="h-1 rounded-full" style={{ width: `${sellerStages[currentStageIndex]?.progress}%`, background: P }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stage Selection Grid */}
          <div className="mb-4">
            <h3 className="text-[10px] font-semibold mb-2 flex items-center gap-1" style={{ color: N }}>
              <ClipboardList size={10} style={{ color: P }} /> Select New Stage
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sellerStages.map((stage, index) => {
                const isCompleted = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;
                const isSelected = selectedStage === stage.id;
                const canProgress = canProgressToStage(index);

                return (
                  <button
                    key={stage.id}
                    onClick={() => canProgress && setSelectedStage(stage.id)}
                    disabled={!canProgress}
                    className={`flex items-start gap-2 p-2 rounded-lg border transition-all text-left ${isSelected ? 'border-orange-600 bg-indigo-50' :
                        canProgress ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50' :
                          'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                      }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${isCompleted ? 'bg-green-500 text-white' :
                        isCurrent ? 'bg-indigo-500 text-white' :
                          isSelected ? 'bg-indigo-500 text-white' :
                            'bg-gray-200 text-gray-500'
                      }`}>
                      {isCompleted ? <CheckCircle size={10} /> : <span className="text-[10px]">{stage.icon}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-medium text-[9px]" style={{ color: N }}>{stage.label}</span>
                        {!canProgress && index > currentStageIndex + 1 && (
                          <span className="text-[6px] px-1 py-0.5 rounded" style={{ background: '#fee2e2', color: '#dc2626' }}>
                            Locked
                          </span>
                        )}
                      </div>
                      <div className="text-[7px]" style={{ color: MU }}>{stage.description}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="flex-1 bg-gray-200 rounded-full h-0.5">
                          <div className="h-0.5 rounded-full transition-all" style={{ width: `${stage.progress}%`, background: P }} />
                        </div>
                        <span className="text-[6px]" style={{ color: MU }}>{stage.progress}%</span>
                      </div>
                    </div>
                    {isSelected && <ChevronRight size={10} style={{ color: P }} className="flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Stage Tasks */}
          {selectedStageData && (
            <div className="rounded-lg p-2.5 mb-4" style={{ background: PLight, border: `1px solid ${P}20` }}>
              <h3 className="text-[9px] font-semibold mb-1.5 flex items-center gap-1" style={{ color: P }}>
                <CheckCircle size={9} /> Tasks for {selectedStageData.label}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
                {selectedStageData.tasks.map((task, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <div className="w-1 h-1 rounded-full mt-1" style={{ background: P }} />
                    <span className="text-[8px]" style={{ color: N }}>{task}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remarks and Next Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Remarks" required icon={<MessageSquare size={7} />}>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-2 py-1.5 text-[10px] border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white resize-none"
                style={{ borderColor: O }}
                rows={3}
                placeholder="Details about stage update..."
              />
            </FormField>
            <FormField label="Next Action" required icon={<Target size={7} />}>
              <textarea
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                className="w-full px-2 py-1.5 text-[10px] border rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white resize-none"
                style={{ borderColor: O }}
                rows={3}
                placeholder="Next steps, timeline, responsible person..."
              />
            </FormField>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" style={{ borderColor: BD, background: PGray }}>
          <div className="text-[8px]" style={{ color: MU }}>Stage update will be recorded in seller timeline</div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1 text-[9px] font-medium rounded-lg transition-all hover:bg-gray-100"
              style={{ border: `1px solid ${BD}`, color: N }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting || !remarks.trim() || !nextAction.trim() || selectedStage === seller.stage}
              className="flex items-center gap-1 px-3 py-1 text-[9px] font-medium text-white bg-[#0f2b3d] rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
             
            >
              <Save size={10} />
              <span>{isSubmitting ? 'Updating...' : 'Update Stage'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerStageUpdateModal;