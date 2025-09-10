import React, { useState } from 'react';
import { X, Save, Calendar, Clock, User, Eye, Camera, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const PropertyVisitModal = ({ isOpen, onClose, property, onSave }: any) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    purpose: 'initial_inspection',
    inspector: 'Admin User',
    duration: '2 hours',
    findings: '',
    photos: [],
    videos: [],
    rating: 8,
    recommendations: '',
    nextSteps: '',
    visitType: 'physical',
    accompaniedBy: [],
    weatherConditions: 'clear',
    accessibilityNotes: '',
    safetyObservations: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const visitPurposes = [
    { value: 'initial_inspection', label: 'Initial Inspection', description: 'First property assessment' },
    { value: 'detailed_inspection', label: 'Detailed Inspection', description: 'Comprehensive property evaluation' },
    { value: 'buyer_visit', label: 'Buyer Visit', description: 'Showing property to potential buyer' },
    { value: 'maintenance_check', label: 'Maintenance Check', description: 'Maintenance and repair assessment' },
    { value: 'documentation', label: 'Documentation', description: 'Document verification visit' },
    { value: 'photography', label: 'Photography/Videography', description: 'Media capture session' }
  ];

  const visitTypes = [
    { value: 'physical', label: 'Physical Visit' },
    { value: 'virtual', label: 'Virtual Tour' },
    { value: 'drone', label: 'Drone Survey' }
  ];

  const weatherOptions = [
    { value: 'clear', label: 'Clear/Sunny' },
    { value: 'cloudy', label: 'Cloudy' },
    { value: 'rainy', label: 'Rainy' },
    { value: 'foggy', label: 'Foggy' }
  ];

  const inspectors = [
    'Admin User',
    'Property Expert',
    'Technical Inspector',
    'Senior Manager'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.findings.trim()) {
      alert('Please provide visit findings');
      return;
    }

    setIsSubmitting(true);
    try {
      const visitData = {
        ...formData,
        id: Date.now(),
        propertyId: property.propertyId,
        created_at: new Date().toISOString()
      };

      await onSave(visitData);
    } catch (error) {
      console.error('Error saving visit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Property Visit</h2>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Visit Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Visit Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inspector</label>
                    <select
                      value={formData.inspector}
                      onChange={(e) => handleInputChange('inspector', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {inspectors.map((inspector) => (
                        <option key={inspector} value={inspector}>
                          {inspector}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <select
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1 hour">1 hour</option>
                      <option value="2 hours">2 hours</option>
                      <option value="3 hours">3 hours</option>
                      <option value="Half day">Half day</option>
                      <option value="Full day">Full day</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Visit Purpose */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Visit Purpose</h3>
                <div className="space-y-3">
                  {visitPurposes.map((purpose) => (
                    <button
                      key={purpose.value}
                      onClick={() => handleInputChange('purpose', purpose.value)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        formData.purpose === purpose.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">{purpose.label}</div>
                      <div className="text-sm text-gray-600">{purpose.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Visit Type */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Visit Type</h3>
                <div className="grid grid-cols-1 gap-3">
                  {visitTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleInputChange('visitType', type.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formData.visitType === type.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium text-gray-900">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Weather Conditions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weather Conditions</label>
                <select
                  value={formData.weatherConditions}
                  onChange={(e) => handleInputChange('weatherConditions', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {weatherOptions.map((weather) => (
                    <option key={weather.value} value={weather.value}>
                      {weather.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Property Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Rating (1-10)</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleInputChange('rating', rating)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        formData.rating >= rating
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 text-gray-500 hover:border-gray-400'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.rating >= 8 ? 'Excellent condition' :
                   formData.rating >= 6 ? 'Good condition' :
                   formData.rating >= 4 ? 'Fair condition' : 'Needs attention'}
                </p>
              </div>

              {/* Findings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visit Findings <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.findings}
                  onChange={(e) => handleInputChange('findings', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Describe your observations, property condition, any issues found, etc."
                  required
                />
              </div>

              {/* Recommendations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
                <textarea
                  value={formData.recommendations}
                  onChange={(e) => handleInputChange('recommendations', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Recommendations for improvements, repairs, or next steps..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Visit will be recorded in property timeline
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
                disabled={isSubmitting || !formData.findings.trim()}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                <span>{isSubmitting ? 'Saving...' : 'Save Visit'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyVisitModal;