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
  Crown
} from 'lucide-react';

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
  const selectedStageIndex = sellerStages.findIndex(s => s.id === selectedStage);
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
    } catch (error) {
      console.error('Error updating stage:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProgressToStage = (stageIndex: number) => {
    // allow selecting current stage or progressing at most one step ahead
    const safeCurrent = Math.max(0, currentStageIndex);
    return stageIndex <= safeCurrent + 1;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Update Seller Stage</h2>
              <p className="text-gray-600 mt-1">{seller.name} - Stage Progression</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Current Stage Info */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Current Stage</h3>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {currentStageIndex + 1}
              </div>
              <div>
                <div className="font-medium text-blue-900">{sellerStages[currentStageIndex]?.label}</div>
                <div className="text-sm text-blue-700">{sellerStages[currentStageIndex]?.description}</div>
                <div className="text-xs text-blue-600">Progress: {sellerStages[currentStageIndex]?.progress}%</div>
              </div>
            </div>
          </div>

          {/* Stage Selection */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Select New Stage</h3>
            <div className="space-y-3">
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
                    className={`w-full flex items-center space-x-4 p-4 rounded-xl border-2 transition-all text-left ${isSelected ? 'border-purple-500 bg-purple-50' :
                        canProgress ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50' :
                          'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                      }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${isCompleted ? 'bg-green-500 text-white' :
                        isCurrent ? 'bg-blue-500 text-white' :
                          isSelected ? 'bg-purple-500 text-white' :
                            'bg-gray-200 text-gray-500'
                      }`}>
                      {isCompleted ? <CheckCircle size={20} /> : stage.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{stage.label}</span>
                        {!canProgress && index > currentStageIndex + 1 && (
                          <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                            Complete previous stages first
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{stage.description}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${stage.progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Progress: {stage.progress}%</div>
                    </div>
                    <div className="text-right">
                      {isSelected && <ArrowRight className="text-purple-600" size={20} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Stage Tasks */}
          {selectedStageData && (
            <div className="bg-green-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-green-900 mb-3">Tasks for {selectedStageData.label}</h3>
              <div className="space-y-2">
                {selectedStageData.tasks.map((task, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <CheckCircle className="text-green-600" size={14} />
                    <span className="text-sm text-green-800">{task}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remarks and Next Action */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks <span className="text-red-500">*</span>
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                rows={4}
                placeholder="Provide details about the stage update, what was completed, challenges faced, etc."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Action <span className="text-red-500">*</span>
              </label>
              <textarea
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                rows={4}
                placeholder="Specify what needs to be done next, timeline, and responsible person..."
                required
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Stage update will be recorded in seller timeline
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting || !remarks.trim() || !nextAction.trim() || selectedStage === seller.stage}
                className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                <span>{isSubmitting ? 'Updating...' : 'Update Stage'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerStageUpdateModal;
