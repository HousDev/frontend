import React, { useState } from 'react';
import { 
  X, Save, Phone, Eye, Users, Mail, MessageCircle, 
  Building, Award, CheckCircle, AlertCircle 
} from 'lucide-react';

const ActivityModal = ({ isOpen, onClose, activity, onSave }: any) => {
  const [formData, setFormData] = useState({
    type: activity?.type || 'call',
    description: activity?.description || '',
    date: activity?.date || new Date().toISOString().split('T')[0],
    time: activity?.time || '10:00',
    duration: activity?.duration || '30 minutes',
    stage: activity?.stage || 'initial_contact',
    outcome: activity?.outcome || '',
    nextAction: activity?.nextAction || '',
    executedBy: activity?.executedBy || 'Admin User',
    remarks: activity?.remarks || '',
    propertyDiscussed: activity?.propertyDiscussed || '',
    followupRequired: activity?.followupRequired || false,
    followupDate: activity?.followupDate || '',
    rating: activity?.rating || 3
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const activityTypes = [
    { value: 'call', label: 'Phone Call', icon: Phone, color: 'blue' },
    { value: 'visit', label: 'Property Visit', icon: Eye, color: 'green' },
    { value: 'meeting', label: 'Meeting', icon: Users, color: 'purple' },
    { value: 'email', label: 'Email', icon: Mail, color: 'orange' },
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'green' },
    { value: 'presentation', label: 'Presentation', icon: Building, color: 'indigo' }
  ];

  const stages = [
    { value: 'initial_contact', label: 'Initial Contact' },
    { value: 'requirement_gathering', label: 'Requirement Gathering' },
    { value: 'property_hunting', label: 'Property Hunting' },
    { value: 'loan_processing', label: 'Loan Processing' },
    { value: 'property_finalization', label: 'Property Finalization' },
    { value: 'deal_closure', label: 'Deal Closure' }
  ];

  const durations = [
    '15 minutes', '30 minutes', '45 minutes', '1 hour', '1.5 hours', '2 hours', 
    '3 hours', 'Half day', 'Full day'
  ];

  const executors = ['Admin User', 'Manager User', 'Executive User', 'Sales Team'];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.description.trim()) {
      alert('Please enter activity description');
      return;
    }

    if (!formData.outcome.trim()) {
      alert('Please enter activity outcome');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const activityData = {
        ...formData,
        id: activity?.id || Date.now(),
        created_at: activity?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await onSave(activityData);
    } catch (error) {
      console.error('Error saving activity:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Helper function to get color classes based on type
  const getColorClasses = (color: string, isSelected: boolean) => {
    const colorMap: Record<string, string> = {
      blue: isSelected 
        ? 'border-blue-500 bg-blue-50 text-blue-700' 
        : 'border-gray-200 hover:border-gray-300 text-gray-600',
      green: isSelected 
        ? 'border-green-500 bg-green-50 text-green-700' 
        : 'border-gray-200 hover:border-gray-300 text-gray-600',
      purple: isSelected 
        ? 'border-purple-500 bg-purple-50 text-purple-700' 
        : 'border-gray-200 hover:border-gray-300 text-gray-600',
      orange: isSelected 
        ? 'border-orange-500 bg-orange-50 text-orange-700' 
        : 'border-gray-200 hover:border-gray-300 text-gray-600',
      indigo: isSelected 
        ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
        : 'border-gray-200 hover:border-gray-300 text-gray-600',
    };
    
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 py-2 md:p-6 md:py-2 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">
                {activity ? 'Edit Activity' : 'Add New Activity'}
              </h2>
              <p className="text-xs text-gray-600 mt-1">Record buyer interaction and outcomes</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 md:p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-lg"
            >
              <X size={16} className="text-xs" />
            </button>
          </div>
        </div>

        <div className="p-4 md:p-6 max-h-[70vh] overflow-y-auto">
          {/* Activity Type */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-2">Activity Type</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {activityTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.type === type.value;
                const colorClasses = getColorClasses(type.color, isSelected);
                
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleInputChange('type', type.value)}
                    className={`flex items-center space-x-1 p-2 rounded-lg border-2 transition-all text-xs ${colorClasses}`}
                  >
                    <Icon size={14} />
                    <span className="font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Basic Information */}
          <div className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of the activity"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Stage</label>
                <select
                  value={formData.stage}
                  onChange={(e) => handleInputChange('stage', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {stages.map((stage) => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Date, Time, Duration */}
          <div className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {durations.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Outcome and Next Action */}
          <div className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Outcome <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.outcome}
                  onChange={(e) => handleInputChange('outcome', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="What was achieved in this activity?"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Next Action</label>
                <textarea
                  value={formData.nextAction}
                  onChange={(e) => handleInputChange('nextAction', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="What should be done next?"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Executed By</label>
                <select
                  value={formData.executedBy}
                  onChange={(e) => handleInputChange('executedBy', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {executors.map((executor) => (
                    <option key={executor} value={executor}>
                      {executor}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Property Discussed</label>
                <input
                  type="text"
                  value={formData.propertyDiscussed}
                  onChange={(e) => handleInputChange('propertyDiscussed', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Property name or ID"
                />
              </div>
            </div>
          </div>

          {/* Activity Rating */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-2">Activity Rating</label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleInputChange('rating', star)}
                  className={`p-1 rounded ${star <= formData.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                >
                  <Award size={16} className={star <= formData.rating ? 'fill-current' : ''} />
                </button>
              ))}
              <span className="text-xs text-gray-600 ml-2">
                {formData.rating === 5 ? 'Excellent' :
                 formData.rating === 4 ? 'Good' :
                 formData.rating === 3 ? 'Average' :
                 formData.rating === 2 ? 'Poor' : 'Very Poor'}
              </span>
            </div>
          </div>

          {/* Follow-up Required */}
          <div className="mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.followupRequired}
                onChange={(e) => handleInputChange('followupRequired', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-gray-700 font-medium">Follow-up required</span>
            </label>
            
            {formData.followupRequired && (
              <div className="mt-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Follow-up Date</label>
                <input
                  type="date"
                  value={formData.followupDate}
                  onChange={(e) => handleInputChange('followupDate', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* Remarks */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Detailed Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={(e) => handleInputChange('remarks', e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Detailed notes about the activity, buyer response, concerns, etc."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 py-2 md:p-6 md:py-2 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Activity will be added to buyer timeline
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="px-3 py-1 text-xs text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting || !formData.description.trim() || !formData.outcome.trim()}
                className="flex items-center space-x-1 px-4 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={14} />
                <span>{isSubmitting ? 'Saving...' : activity ? 'Update' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityModal;