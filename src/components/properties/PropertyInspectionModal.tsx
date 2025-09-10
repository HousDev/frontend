import React, { useState } from 'react';
import { X, Save, Eye } from 'lucide-react';

type AreaKey =
  | 'structural'
  | 'electrical'
  | 'plumbing'
  | 'flooring'
  | 'painting'
  | 'fixtures'
  | 'ventilation'
  | 'security';

type AreaDetail = {
  rating: number;
  notes: string;
  issues: string[];
};

type FormData = {
  date: string;
  inspector: string;
  inspectionType: string;
  overallRating: number;
  summary: string;

  structural: AreaDetail;
  electrical: AreaDetail;
  plumbing: AreaDetail;
  flooring: AreaDetail;
  painting: AreaDetail;
  fixtures: AreaDetail;
  ventilation: AreaDetail;
  security: AreaDetail;

  recommendations: string[];
  urgentRepairs: string[];
  estimatedRepairCost: number;
  marketReadiness: string;
  photos: string[]; // Could be File[] if uploading
  videos: string[];
};

type InspectionArea = {
  key: AreaKey;
  label: string;
  icon: string; // you're using emoji icons for sidebar
  description: string;
};

type InspectionType = {
  value: string;
  label: string;
  duration: string;
};

type MarketReadinessOption = {
  value: string;
  label: string;
  color: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  property: {
    title?: string;
    propertyId?: string | number;
  } | null;
  onSave: (inspectionData: any) => Promise<void> | void;
};

const DEFAULT_AREA = (): AreaDetail => ({
  rating: 8,
  notes: '',
  issues: []
});

const initialForm = (prop?: Props['property']): FormData => ({
  date: new Date().toISOString().split('T')[0],
  inspector: prop?.title ? 'Property Expert' : 'Property Expert',
  inspectionType: 'comprehensive',
  overallRating: 8,
  summary: '',

  structural: DEFAULT_AREA(),
  electrical: DEFAULT_AREA(),
  plumbing: DEFAULT_AREA(),
  flooring: DEFAULT_AREA(),
  painting: DEFAULT_AREA(),
  fixtures: DEFAULT_AREA(),
  ventilation: DEFAULT_AREA(),
  security: DEFAULT_AREA(),

  recommendations: [],
  urgentRepairs: [],
  estimatedRepairCost: 0,
  marketReadiness: 'ready',
  photos: [],
  videos: []
});

const inspectionAreas: InspectionArea[] = [
  { key: 'structural', label: 'Structural', icon: '🏗️', description: 'Foundation, walls, ceiling' },
  { key: 'electrical', label: 'Electrical', icon: '⚡', description: 'Wiring, switches, fixtures' },
  { key: 'plumbing', label: 'Plumbing', icon: '🚰', description: 'Water supply, drainage' },
  { key: 'flooring', label: 'Flooring', icon: '🏠', description: 'Tiles, marble, wood' },
  { key: 'painting', label: 'Painting', icon: '🎨', description: 'Wall paint, exterior' },
  { key: 'fixtures', label: 'Fixtures', icon: '🔧', description: 'Doors, windows, fittings' },
  { key: 'ventilation', label: 'Ventilation', icon: '💨', description: 'Air circulation, fans' },
  { key: 'security', label: 'Security', icon: '🔒', description: 'Locks, safety features' }
];

const inspectionTypes: InspectionType[] = [
  { value: 'basic', label: 'Basic Inspection', duration: '1 hour' },
  { value: 'comprehensive', label: 'Comprehensive Inspection', duration: '3 hours' },
  { value: 'technical', label: 'Technical Inspection', duration: '5 hours' },
  { value: 'pre_sale', label: 'Pre-Sale Inspection', duration: '4 hours' }
];

const marketReadinessOptions: MarketReadinessOption[] = [
  { value: 'ready', label: 'Market Ready', color: 'green' },
  { value: 'minor_repairs', label: 'Minor Repairs Needed', color: 'yellow' },
  { value: 'major_repairs', label: 'Major Repairs Needed', color: 'orange' },
  { value: 'not_ready', label: 'Not Market Ready', color: 'red' }
];

const commonIssues: Record<AreaKey, string[]> = {
  structural: ['Cracks in walls', 'Water seepage', 'Foundation issues', 'Ceiling damage'],
  electrical: ['Old wiring', 'Faulty switches', 'Inadequate points', 'Safety concerns'],
  plumbing: ['Leaky pipes', 'Low water pressure', 'Drainage issues', 'Old fixtures'],
  flooring: ['Broken tiles', 'Scratched flooring', 'Uneven surface', 'Stains'],
  painting: ['Peeling paint', 'Discoloration', 'Damp patches', 'Exterior fading'],
  fixtures: ['Broken handles', 'Warped doors', 'Window issues', 'Hardware problems'],
  ventilation: ['Poor air flow', 'Blocked vents', 'Fan issues', 'Humidity problems'],
  security: ['Faulty locks', 'Security gaps', 'Access control', 'Safety hazards']
};

const PropertyInspectionModal: React.FC<Props> = ({ isOpen, onClose, property, onSave }) => {
  const [formData, setFormData] = useState<FormData>(initialForm(property ?? undefined));
  const [activeSection, setActiveSection] = useState<AreaKey | 'overview'>('overview');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Generic input updater for top-level primitive fields
  const handleInputChange = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Area-specific helpers (type-safe)
  const handleAreaRating = (area: AreaKey, rating: number) => {
    setFormData(prev => ({ ...prev, [area]: { ...prev[area], rating } }));
  };

  const handleAreaNotes = (area: AreaKey, notes: string) => {
    setFormData(prev => ({ ...prev, [area]: { ...prev[area], notes } }));
  };

  const toggleIssue = (area: AreaKey, issue: string) => {
    setFormData(prev => {
      const current = prev[area];
      const exists = current.issues.includes(issue);
      const updatedIssues = exists ? current.issues.filter(i => i !== issue) : [...current.issues, issue];
      return { ...prev, [area]: { ...current, issues: updatedIssues } };
    });
  };

  const calculateOverallRating = () => {
    const areas = inspectionAreas.map(a => formData[a.key]);
    const total = areas.reduce((s, a) => s + (a.rating || 0), 0);
    return Math.round(total / areas.length);
  };

  const handleSave = async () => {
    if (!formData.summary.trim()) {
      window.alert('Please provide inspection summary');
      return;
    }

    setIsSubmitting(true);
    try {
      const inspectionData = {
        ...formData,
        overallRating: calculateOverallRating(),
        id: Date.now(),
        propertyId: property?.propertyId ?? null,
        created_at: new Date().toISOString()
      };

      await onSave(inspectionData);
      // Optionally close after save
      // onClose();
    } catch (err) {
      console.error('Error saving inspection:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Property Inspection</h2>
              <p className="text-gray-600 mt-1">{property?.title ?? 'Property'} - Comprehensive Analysis</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex h-[80vh]">
          {/* Sidebar */}
          <div className="w-80 border-r border-gray-200 bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Inspection Areas</h3>
            <div className="space-y-2">
              <button
                onClick={() => setActiveSection('overview')}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left ${
                  activeSection === 'overview'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Eye size={16} />
                <span>Overview</span>
              </button>

              {inspectionAreas.map(area => (
                <button
                  key={area.key}
                  onClick={() => setActiveSection(area.key)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left ${
                    activeSection === area.key
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{area.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{area.label}</div>
                    <div className="text-xs opacity-75">{area.description}</div>
                  </div>
                  <div className="ml-auto">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        formData[area.key].rating >= 8 ? 'bg-green-500 text-white' :
                        formData[area.key].rating >= 6 ? 'bg-yellow-500 text-white' :
                        'bg-red-500 text-white'
                      }`}
                    >
                      {formData[area.key].rating}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main */}
          <div className="flex-1 p-6 overflow-auto">
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Inspection Overview</h3>

                {/* Inspection Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Inspection Type</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {inspectionTypes.map(type => (
                      <button
                        key={type.value}
                        onClick={() => handleInputChange('inspectionType', type.value)}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          formData.inspectionType === type.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-gray-900">{type.label}</div>
                        <div className="text-sm text-gray-600">Duration: {type.duration}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Overall Rating */}
                <div className="bg-blue-50 rounded-xl p-6">
                  <h4 className="font-semibold text-blue-900 mb-4">Overall Property Rating</h4>
                  <div className="text-center">
                    <div className="text-6xl font-bold text-blue-600 mb-2">{calculateOverallRating()}</div>
                    <div className="text-blue-700 font-medium">out of 10</div>
                    <div className="text-sm text-blue-600 mt-2">
                      {calculateOverallRating() >= 8 ? 'Excellent Property' :
                       calculateOverallRating() >= 6 ? 'Good Property' :
                       calculateOverallRating() >= 4 ? 'Fair Property' : 'Needs Attention'}
                    </div>
                  </div>
                </div>

                {/* Market Readiness */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Market Readiness</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {marketReadinessOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleInputChange('marketReadiness', option.value)}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          formData.marketReadiness === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="font-medium text-gray-900">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inspection Summary <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Provide overall inspection summary, key findings, and recommendations..."
                    required
                  />
                </div>
              </div>
            )}

            {/* Individual Areas */}
            {inspectionAreas.map(area => (
              activeSection === area.key && (
                <div key={area.key} className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{area.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{area.label} Inspection</h3>
                      <p className="text-gray-600">{area.description}</p>
                    </div>
                  </div>

                  {/* Area Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {area.label} Rating (1-10)
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1,2,3,4,5,6,7,8,9,10].map(rating => (
                        <button
                          key={rating}
                          onClick={() => handleAreaRating(area.key, rating)}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${
                            formData[area.key].rating >= rating
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : 'border-gray-300 text-gray-500 hover:border-gray-400'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Common Issues */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Common Issues</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {commonIssues[area.key].map(issue => (
                        <label key={issue} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData[area.key].issues.includes(issue)}
                            onChange={() => toggleIssue(area.key, issue)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">{issue}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {area.label} Notes
                    </label>
                    <textarea
                      value={formData[area.key].notes}
                      onChange={(e) => handleAreaNotes(area.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder={`Detailed notes about ${area.label.toLowerCase()} condition...`}
                    />
                  </div>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Overall Rating: {calculateOverallRating()}/10 • {inspectionAreas.length} areas inspected
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
                disabled={isSubmitting || !formData.summary.trim()}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                <span>{isSubmitting ? 'Generating Report...' : 'Generate Inspection Report'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyInspectionModal;
