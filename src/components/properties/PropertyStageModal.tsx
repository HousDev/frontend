

import React, { useState } from 'react';
import { X, Save, TrendingUp, CheckCircle, Clock, AlertCircle, ArrowRight, ChevronRight, Target } from 'lucide-react';

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

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
    return stageIndex <= currentStageIndex + 1;
  };

  // Get stage color based on progress
  const getStageColor = (index: number, stageId: string) => {
    if (index < currentStageIndex) return '#10b981'; // Completed - Green
    if (index === currentStageIndex) return O; // Current - Orange
    if (selectedStage === stageId) return O; // Selected - Orange
    return '#94a3b8'; // Pending - Gray
  };

  const getStageBg = (index: number, stageId: string) => {
    if (index < currentStageIndex) return '#10b98110';
    if (index === currentStageIndex) return `${O}10`;
    if (selectedStage === stageId) return `${O}10`;
    return `${N}05`;
  };

  const getStageBorder = (index: number, stageId: string) => {
    if (index < currentStageIndex) return '#10b98130';
    if (index === currentStageIndex) return `${O}30`;
    if (selectedStage === stageId) return `${O}30`;
    return BD;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }}>
        
        {/* Header */}
        <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: N }}>
          <div>
            <h2 className="text-sm font-bold text-white">Update Property Stage</h2>
            <p className="text-[10px] text-white/70">{property?.title}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors text-white">
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ scrollbarWidth: 'thin' }}>
          
          {/* Current Stage Info */}
          <div className="rounded-lg p-2" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
            <h3 className="text-[9px] font-semibold mb-1" style={{ color: O }}>Current Stage</h3>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: O }}>
                {currentStageIndex + 1}
              </div>
              <div>
                <div className="text-[11px] font-semibold" style={{ color: N }}>{stages[currentStageIndex]?.label}</div>
                <div className="text-[9px]" style={{ color: MU }}>{stages[currentStageIndex]?.description}</div>
              </div>
            </div>
          </div>

          {/* Stage Selection */}
          <div>
            <h3 className="text-[9px] font-semibold mb-1.5" style={{ color: MU }}>Select New Stage</h3>
            <div className="space-y-1.5">
              {stages.map((stage: any, index: number) => {
                const isCompleted = index < currentStageIndex;
                const isCurrent = index === currentStageIndex;
                const isSelected = selectedStage === stage.id;
                const canProgress = canProgressToStage(index);
                const stageColor = getStageColor(index, stage.id);
                const stageBg = getStageBg(index, stage.id);
                const stageBorder = getStageBorder(index, stage.id);
                
                return (
                  <button
                    key={stage.id}
                    onClick={() => canProgress && setSelectedStage(stage.id)}
                    disabled={!canProgress}
                    className={`w-full flex items-start gap-2 p-2 rounded-lg transition-all text-left ${
                      !canProgress && index > currentStageIndex + 1 ? 'opacity-40' : ''
                    }`}
                    style={{
                      background: stageBg,
                      border: `1px solid ${stageBorder}`
                    }}
                  >
                    <div className="flex-shrink-0">
                      <div 
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ background: stageColor }}
                      >
                        {isCompleted ? <CheckCircle size={12} /> : index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-semibold" style={{ color: stageColor === '#10b981' ? '#10b981' : N }}>
                          {stage.label}
                        </span>
                        {!canProgress && index > currentStageIndex + 1 && (
                          <span className="text-[8px] px-1 py-0.5 rounded" style={{ background: '#fee2e2', color: '#dc2626' }}>
                            Locked
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-[8px] px-1 py-0.5 rounded" style={{ background: `${O}15`, color: O }}>
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-[9px]" style={{ color: MU }}>{stage.description}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: `${stageColor}20` }}>
                          <div className="h-full rounded-full" style={{ width: `${stage.progress}%`, background: stageColor }} />
                        </div>
                        <span className="text-[7px] font-medium" style={{ color: stageColor }}>{stage.progress}%</span>
                      </div>
                    </div>
                    {isSelected && (
                      <ChevronRight size={12} style={{ color: O }} className="flex-shrink-0 mt-1.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Stage Tasks */}
          {selectedStageData && (
            <div className="rounded-lg p-2" style={{ background: `${O}08`, border: `1px solid ${O}20` }}>
              <h3 className="text-[9px] font-semibold mb-1.5" style={{ color: O }}>Tasks for {selectedStageData.label}</h3>
              <div className="space-y-1">
                {selectedStageData.tasks.map((task: string, index: number) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <CheckCircle size={9} style={{ color: O }} />
                    <span className="text-[9px]" style={{ color: MU }}>{task}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Remarks */}
          <div>
            <label className="block text-[9px] font-medium mb-0.5" style={{ color: MU }}>
              Remarks <span className="text-red-400">*</span>
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-2 py-1 text-[11px] border rounded-lg focus:outline-none focus:ring-1 resize-none"
              style={{ borderColor: BD }}
              rows={3}
              placeholder="Provide details about the stage update..."
              required
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-2 border-t flex items-center justify-between" style={{ borderColor: BD, background: BG }}>
          <div className="flex items-center gap-1 text-[9px]" style={{ color: MU }}>
            <Clock size={10} />
            <span>Recorded in timeline</span>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={onClose}
              className="px-2 py-1 text-[10px] border rounded transition-colors hover:bg-gray-50"
              style={{ borderColor: BD, color: N }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting || !remarks.trim() || selectedStage === property.stage}
              className="px-2 py-1 text-[10px] rounded text-white flex items-center gap-1 transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: O }}
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

export default PropertyStageModal;