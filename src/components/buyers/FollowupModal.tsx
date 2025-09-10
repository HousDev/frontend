import React, { useState } from 'react';
import { X, Save, Calendar, Clock, User, Phone, MessageCircle, Mail, Bell } from 'lucide-react';

const FollowupModal = ({ isOpen, onClose, followup, onSave }: any) => {
  const [formData, setFormData] = useState({
    type: followup?.type || 'call',
    description: followup?.description || '',
    date: followup?.date || new Date().toISOString().split('T')[0],
    time: followup?.time || '10:00',
    priority: followup?.priority || 'medium',
    assignedTo: followup?.assignedTo || 'Admin User',
    status: followup?.status || 'pending',
    reminder: followup?.reminder || false,
    notes: followup?.notes || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const followupTypes = [
    { value: 'call', label: 'Phone Call', icon: Phone },
    { value: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'visit', label: 'Property Visit', icon: Calendar },
    { value: 'meeting', label: 'Meeting', icon: User }
  ];

  const priorities = [
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  const statuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const assignedUsers = ['Admin User', 'Manager User', 'Executive User'];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.description.trim()) {
      alert('Please enter follow-up description');
      return;
    }

    if (!formData.date) {
      alert('Please select follow-up date');
      return;
    }

    setIsSubmitting(true);

    try {
      const followupData = {
        ...formData,
        id: followup?.id || Date.now(),
        created_at: followup?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await onSave(followupData);
    } catch (error) {
      console.error('Error saving follow-up:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden text-xs">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                {followup ? 'Edit Follow-up' : 'Schedule Follow-up'}
              </h2>
              <p className="text-gray-600 mt-0.5 text-[11px]">
                Plan your next interaction with the buyer
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg bg-white hover:bg-gray-50 transition-colors shadow"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
          {/* Follow-up Type */}
          <div>
            <label className="block font-medium text-gray-700 mb-2">Follow-up Type</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {followupTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.type === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleInputChange('type', type.value)}
                    className={`flex items-center space-x-1 p-2 rounded-md border text-xs transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <Icon size={12} />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-xs"
              rows={2}
              placeholder="Describe the purpose of this follow-up..."
              required
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-xs"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-xs"
              />
            </div>
          </div>

          {/* Priority & Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-xs"
              >
                {priorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Assigned To</label>
              <select
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-xs"
              >
                {assignedUsers.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-xs"
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reminder */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.reminder}
                onChange={(e) => handleInputChange('reminder', e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 h-3 w-3"
              />
              <div className="flex items-center space-x-1 text-xs">
                <Bell className="text-purple-600" size={12} />
                <span className="text-gray-700 font-medium">Set reminder notification</span>
              </div>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-xs"
              rows={2}
              placeholder="Any additional notes or context..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <div>Follow-up will be added to buyer timeline</div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="px-3 py-1 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting || !formData.description.trim() || !formData.date}
                className="flex items-center space-x-1 px-4 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                <Save size={12} />
                <span>{isSubmitting ? 'Saving...' : followup ? 'Update' : 'Schedule'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowupModal;
