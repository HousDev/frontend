import React, { useState } from 'react';
import { X, Save, Wrench, Plus, Trash2, DollarSign, Calendar, User, AlertCircle, CheckCircle, Star } from 'lucide-react';

const PropertyMaintenanceModal = ({ isOpen, onClose, property, onSave }: any) => {
  const [formData, setFormData] = useState({
    inspectionDate: new Date().toISOString().split('T')[0],
    inspector: 'Maintenance Expert',
    summary: '',
    suggestions: [],
    urgentRepairs: [],
    totalEstimatedCost: 0,
    timelineWeeks: 4,
    vendorRecommendations: [],
    priorityLevel: 'medium'
  });

  const [newSuggestion, setNewSuggestion] = useState({
    category: 'electrical',
    item: '',
    description: '',
    priority: 'medium',
    estimatedCost: 0,
    timeRequired: '1 week',
    vendor: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const maintenanceCategories = [
    { value: 'electrical', label: 'Electrical', icon: '⚡' },
    { value: 'plumbing', label: 'Plumbing', icon: '🚰' },
    { value: 'painting', label: 'Painting', icon: '🎨' },
    { value: 'flooring', label: 'Flooring', icon: '🏠' },
    { value: 'structural', label: 'Structural', icon: '🏗️' },
    { value: 'fixtures', label: 'Fixtures', icon: '🔧' },
    { value: 'cleaning', label: 'Cleaning', icon: '🧹' },
    { value: 'landscaping', label: 'Landscaping', icon: '🌿' }
  ];

  const priorityLevels = [
    { value: 'urgent', label: 'Urgent', color: 'red', description: 'Immediate attention required' },
    { value: 'high', label: 'High', color: 'orange', description: 'Should be done soon' },
    { value: 'medium', label: 'Medium', color: 'yellow', description: 'Can be planned' },
    { value: 'low', label: 'Low', color: 'green', description: 'Nice to have' }
  ];

  const timeOptions = [
    '1 day', '3 days', '1 week', '2 weeks', '1 month', '2 months', '3 months'
  ];

  const recommendedVendors = [
    { name: 'Rajesh Plumbing Services', category: 'plumbing', rating: 4.8, contact: '+91 98765 43210' },
    { name: 'Color Magic Painters', category: 'painting', rating: 4.7, contact: '+91 87654 32109' },
    { name: 'Expert Electricians', category: 'electrical', rating: 4.9, contact: '+91 76543 21098' },
    { name: 'Premium Tiles & Marble', category: 'flooring', rating: 4.8, contact: '+91 65432 10987' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSuggestion = () => {
    if (!newSuggestion.item.trim() || !newSuggestion.description.trim()) {
      alert('Please fill in item name and description');
      return;
    }

    const suggestion = {
      ...newSuggestion,
      id: Date.now()
    };

    setFormData(prev => ({
      ...prev,
      suggestions: [...prev.suggestions, suggestion],
      totalEstimatedCost: prev.totalEstimatedCost + newSuggestion.estimatedCost
    }));

    setNewSuggestion({
      category: 'electrical',
      item: '',
      description: '',
      priority: 'medium',
      estimatedCost: 0,
      timeRequired: '1 week',
      vendor: ''
    });
  };

  const removeSuggestion = (id: number) => {
    const suggestion = formData.suggestions.find((s: any) => s.id === id);
    setFormData(prev => ({
      ...prev,
      suggestions: prev.suggestions.filter((s: any) => s.id !== id),
      totalEstimatedCost: prev.totalEstimatedCost - (suggestion?.estimatedCost || 0)
    }));
  };

  const getPriorityBadge = (priority: string) => {
    const config = priorityLevels.find(p => p.value === priority);
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${config?.color}-100 text-${config?.color}-700`}>
        {config?.label}
      </span>
    );
  };

  const handleSave = async () => {
    if (!formData.summary.trim()) {
      alert('Please provide maintenance summary');
      return;
    }

    if (formData.suggestions.length === 0) {
      alert('Please add at least one maintenance suggestion');
      return;
    }

    setIsSubmitting(true);
    try {
      const maintenanceData = {
        ...formData,
        id: Date.now(),
        propertyId: property.propertyId,
        created_at: new Date().toISOString()
      };

      await onSave(maintenanceData);
    } catch (error) {
      console.error('Error saving maintenance data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-yellow-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Maintenance Suggestions</h2>
              <p className="text-gray-600 mt-1">{property.title} - Repair & Maintenance Analysis</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Add Suggestions */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Maintenance Item</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={newSuggestion.category}
                      onChange={(e) => setNewSuggestion({...newSuggestion, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      {maintenanceCategories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.icon} {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item/Work</label>
                    <input
                      type="text"
                      value={newSuggestion.item}
                      onChange={(e) => setNewSuggestion({...newSuggestion, item: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g., Fix bathroom leakage"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newSuggestion.description}
                      onChange={(e) => setNewSuggestion({...newSuggestion, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      rows={2}
                      placeholder="Detailed description of the work required..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        value={newSuggestion.priority}
                        onChange={(e) => setNewSuggestion({...newSuggestion, priority: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      >
                        {priorityLevels.map((priority) => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time Required</label>
                      <select
                        value={newSuggestion.timeRequired}
                        onChange={(e) => setNewSuggestion({...newSuggestion, timeRequired: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      >
                        {timeOptions.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost (₹)</label>
                      <input
                        type="number"
                        value={newSuggestion.estimatedCost}
                        onChange={(e) => setNewSuggestion({...newSuggestion, estimatedCost: Number(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="5000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Recommended Vendor</label>
                      <select
                        value={newSuggestion.vendor}
                        onChange={(e) => setNewSuggestion({...newSuggestion, vendor: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Select vendor</option>
                        {recommendedVendors
                          .filter(v => v.category === newSuggestion.category)
                          .map((vendor) => (
                            <option key={vendor.name} value={vendor.name}>
                              {vendor.name} ({vendor.rating}⭐)
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  
                  <button
                    onClick={addSuggestion}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Plus size={16} />
                    <span>Add Suggestion</span>
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overall Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  rows={4}
                  placeholder="Overall maintenance assessment and recommendations..."
                  required
                />
              </div>
            </div>

            {/* Right Column - Suggestions List */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Suggestions</h3>
                
                {/* Cost Summary */}
                <div className="bg-orange-50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Total Estimated Cost</p>
                      <p className="text-2xl font-bold text-orange-900">₹{formData.totalEstimatedCost.toLocaleString('en-IN')}</p>
                    </div>
                    <DollarSign className="text-orange-600" size={24} />
                  </div>
                  <div className="text-sm text-orange-700 mt-2">
                    Timeline: {formData.timelineWeeks} weeks
                  </div>
                </div>

                {/* Suggestions List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {formData.suggestions.map((suggestion: any) => (
                    <div key={suggestion.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">
                            {maintenanceCategories.find(c => c.value === suggestion.category)?.icon}
                          </span>
                          <div>
                            <div className="font-medium text-gray-900">{suggestion.item}</div>
                            <div className="text-sm text-gray-600">{suggestion.description}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeSuggestion(suggestion.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Cost:</span>
                          <span className="font-medium ml-2">₹{suggestion.estimatedCost.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Time:</span>
                          <span className="font-medium ml-2">{suggestion.timeRequired}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        {getPriorityBadge(suggestion.priority)}
                        {suggestion.vendor && (
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            {suggestion.vendor}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {formData.suggestions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Wrench className="mx-auto mb-2" size={32} />
                      <p>No maintenance suggestions added yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommended Vendors */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Vendors</h3>
                <div className="space-y-2">
                  {recommendedVendors.map((vendor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{vendor.name}</div>
                        <div className="text-sm text-gray-600 capitalize">{vendor.category}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Star className="text-yellow-400 fill-current" size={12} />
                          <span className="text-xs font-medium">{vendor.rating}</span>
                        </div>
                        <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                          Contact
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {formData.suggestions.length} suggestions • ₹{formData.totalEstimatedCost.toLocaleString('en-IN')} total cost
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
                disabled={isSubmitting || !formData.summary.trim() || formData.suggestions.length === 0}
                className="flex items-center space-x-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                <span>{isSubmitting ? 'Saving...' : 'Save Maintenance Report'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyMaintenanceModal;