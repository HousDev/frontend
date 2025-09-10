import React, { useState } from 'react';
import { X, Save, TrendingUp, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';

const PropertyStageModal = ({ isOpen, onClose, property, stages, onStageUpdate }: any) => {
  const [selectedStage, setSelectedStage] = useState(property.stage);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentStageIndex = stages.findIndex((s: any) => s.id === property.stage);
  const selectedStageIndex = stages.findIndex((s: any) => s.id === selectedStage);
  const selectedStageData = stages.find((s: any) => s.id === selectedStage);

  const handleSave = async () => {
    if (!remarks.trim()) {
      alert('Please provide remarks for stage update');
      return;
    }

    setIsSubmitting(true);
    try {
      await onStageUpdate(selectedStage, remarks);
      onClose();
    } catch (error) {
      console.error('Error updating stage:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProgressToStage = (stageIndex: number) => {
    return stageIndex <= currentStageIndex + 1; // Can only progress one stage at a time
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Update Property Stage</h2>
              <p className="text-gray-600 mt-1">{property.title}</p>
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
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {currentStageIndex + 1}
              </div>
              <div>
                <div className="font-medium text-blue-900">{stages[currentStageIndex]?.label}</div>
                <div className="text-sm text-blue-700">{stages[currentStageIndex]?.description}</div>
              </div>
            </div>
          </div>

          {/* Stage Selection */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Select New Stage</h3>
            <div className="space-y-3">
              {stages.map((stage: any, index: number) => {
                const isCompleted = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;
                const isSelected = selectedStage === stage.id;
                const canProgress = canProgressToStage(index);
                
                return (
                  <button
                    key={stage.id}
                    onClick={() => canProgress && setSelectedStage(stage.id)}
                    disabled={!canProgress}
                    className={`w-full flex items-center space-x-4 p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected ? 'border-blue-500 bg-blue-50' :
                      canProgress ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50' :
                      'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-green-500 text-white' :
                      isCurrent ? 'bg-blue-500 text-white' :
                      isSelected ? 'bg-blue-500 text-white' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {isCompleted ? <CheckCircle size={20} /> : index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{stage.label}</span>
                        {!canProgress && index > currentStageIndex + 1 && (
                          <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded">
                            Complete previous stages first
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{stage.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Progress: {stage.progress}%
                      </div>
                    </div>
                    <div className="text-right">
                      {isSelected && <ArrowRight className="text-blue-600" size={20} />}
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
                {selectedStageData.tasks.map((task: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="text-green-600" size={14} />
                    <span className="text-sm text-green-800">{task}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remarks */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks <span className="text-red-500">*</span>
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Provide details about the stage update, what was completed, next steps, etc."
              required
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Stage update will be recorded in property timeline
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
                disabled={isSubmitting || !remarks.trim() || selectedStage === property.stage}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

export default PropertyStageModal;