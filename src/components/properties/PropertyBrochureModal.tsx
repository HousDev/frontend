import React, { useEffect, useState } from 'react';
import {
  X,
  Download,
  Send,
  FileText,
  Eye,
  Palette,
  Image,
  Type,
  Layout,
  Save
} from 'lucide-react';

type Property = {
  title?: string;
  propertyId?: string | number;
  location?: string;
  city?: string;
  budget?: number | string | null;
  unitType?: string;
  carpetArea?: number | string;
  photos?: string[];
  amenities?: string[];
  seller?: { phone?: string } | null;
};

type Customizations = {
  primaryColor: string;
  secondaryColor: string;
  fontStyle: 'modern' | 'classic' | 'elegant' | 'bold' | string;
  layout: 'standard' | 'magazine' | 'grid' | 'story' | string;
  includeFloorPlan: boolean;
  includeLocationMap: boolean;
  includeAmenities: boolean;
  includePricing: boolean;
  includeContactInfo: boolean;
  watermark: boolean;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
};

const brochureTemplates = [
  {
    value: 'premium',
    label: 'Premium Template',
    description: 'Luxury design with elegant layout',
    preview:
      'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    value: 'modern',
    label: 'Modern Template',
    description: 'Clean and contemporary design',
    preview:
      'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    value: 'classic',
    label: 'Classic Template',
    description: 'Traditional and professional',
    preview:
      'https://images.pexels.com/photos/1396125/pexels-photo-1396125.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    value: 'minimal',
    label: 'Minimal Template',
    description: 'Simple and focused design',
    preview:
      'https://images.pexels.com/photos/1396126/pexels-photo-1396126.jpeg?auto=compress&cs=tinysrgb&w=300'
  }
];

const fontStyles = [
  { value: 'modern', label: 'Modern Sans' },
  { value: 'classic', label: 'Classic Serif' },
  { value: 'elegant', label: 'Elegant Script' },
  { value: 'bold', label: 'Bold Impact' }
];

const layoutOptions = [
  { value: 'standard', label: 'Standard Layout' },
  { value: 'magazine', label: 'Magazine Style' },
  { value: 'grid', label: 'Grid Layout' },
  { value: 'story', label: 'Story Format' }
];

const defaultCustomizations = (): Customizations => ({
  primaryColor: '#3B82F6',
  secondaryColor: '#10B981',
  fontStyle: 'modern',
  layout: 'standard',
  includeFloorPlan: true,
  includeLocationMap: true,
  includeAmenities: true,
  includePricing: true,
  includeContactInfo: true,
  watermark: true
});

const safeNumber = (v?: number | string | null): number => {
  if (v == null || v === '') return 0;
  if (typeof v === 'number') return v;
  const n = Number(String(v).replace(/[^\d.-]/g, ''));
  return Number.isNaN(n) ? 0 : n;
};

const formatCurrency = (amount?: number | string | null) => {
  const n = safeNumber(amount);
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
};

const PropertyBrochureModal: React.FC<Props> = ({ isOpen, onClose, property }) => {
  const [brochureTemplate, setBrochureTemplate] = useState<string>('premium');
  const [customizations, setCustomizations] = useState<Customizations>(defaultCustomizations());
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBrochureTemplate('premium');
      setCustomizations(defaultCustomizations());
    }
  }, [isOpen, property]);

  if (!isOpen) return null;

  const generateBrochure = async () => {
    setIsGenerating(true);
    try {
      // simulate generation
      await new Promise((r) => setTimeout(r, 2000));

      const brochureData = {
        template: brochureTemplate,
        customizations,
        property,
        generatedAt: new Date().toISOString()
      };

      console.log('Generated brochure:', brochureData);

      // create dummy pdf blob (small placeholder PDF in base64)
      const base64Pdf =
        'JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVGl0bGUgKFByb2R1Y3QgYnJvY2h1cmUpCj4+CmVuZG9iago='; // tiny placeholder
      const binary = atob(base64Pdf);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(property?.title ?? 'property').replace(/\s+/g, '_')}_brochure.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      alert('Brochure generated successfully!');
    } catch (err) {
      console.error('Error generating brochure:', err);
      alert('Failed to generate brochure');
    } finally {
      setIsGenerating(false);
    }
  };

  const shareBrochure = (channel: 'whatsapp' | 'email' | 'sms' | 'copy' = 'copy') => {
    const brochureUrl = `https://resaleexpert.com/brochure/${property?.propertyId ?? ''}`;
    const message = `🏠 ${property?.title ?? ''}\n📍 ${property?.location ?? ''}, ${property?.city ?? ''}\n💰 ${formatCurrency(
      property?.budget
    )}\n🏢 ${property?.unitType ?? ''} • ${property?.carpetArea ?? ''}\n\nView brochure: ${brochureUrl}`;

    switch (channel) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'email': {
        const subject = `Property Brochure - ${property?.title ?? ''}`;
        window.open(
          `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`,
          '_blank',
          'noopener,noreferrer'
        );
        break;
      }
      case 'sms':
        // sms: scheme varies by platform; just alert for now
        alert('SMS sharing would be implemented via an SMS gateway in production.');
        break;
      default:
        navigator.clipboard
          .writeText(brochureUrl)
          .then(() => alert('Brochure link copied to clipboard!'))
          .catch(() => alert('Could not copy link — please copy manually.'));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Create Property Brochure</h2>
              <p className="text-gray-600 mt-1">{property?.title ?? 'Property'} - Professional Marketing Material</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors" aria-label="Close">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Template Selection */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Template</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {brochureTemplates.map((template) => (
                    <button
                      key={template.value}
                      onClick={() => setBrochureTemplate(template.value)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        brochureTemplate === template.value ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      type="button"
                    >
                      <img src={template.preview} alt={template.label} className="w-full h-32 object-cover rounded-lg mb-2" />
                      <div className="text-left">
                        <div className="font-medium text-gray-900">{template.label}</div>
                        <div className="text-sm text-gray-600">{template.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Customization Options */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customization</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                      <input
                        type="color"
                        value={customizations.primaryColor}
                        onChange={(e) => setCustomizations({ ...customizations, primaryColor: e.target.value })}
                        className="w-full h-10 rounded-lg border border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Color</label>
                      <input
                        type="color"
                        value={customizations.secondaryColor}
                        onChange={(e) => setCustomizations({ ...customizations, secondaryColor: e.target.value })}
                        className="w-full h-10 rounded-lg border border-gray-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Font Style</label>
                    <select
                      value={customizations.fontStyle}
                      onChange={(e) => setCustomizations({ ...customizations, fontStyle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      {fontStyles.map((font) => (
                        <option key={font.value} value={font.value}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Layout Style</label>
                    <select
                      value={customizations.layout}
                      onChange={(e) => setCustomizations({ ...customizations, layout: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      {layoutOptions.map((layout) => (
                        <option key={layout.value} value={layout.value}>
                          {layout.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Content Options */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Options</h3>
                <div className="space-y-3">
                  {[
                    { key: 'includeFloorPlan', label: 'Include Floor Plan', description: 'Property layout diagram' },
                    { key: 'includeLocationMap', label: 'Include Location Map', description: 'Area map with landmarks' },
                    { key: 'includeAmenities', label: 'Include Amenities', description: 'List of property amenities' },
                    { key: 'includePricing', label: 'Include Pricing', description: 'Price details and payment plans' },
                    { key: 'includeContactInfo', label: 'Include Contact Info', description: 'Seller and agent contact details' },
                    { key: 'watermark', label: 'ResaleExpert Watermark', description: 'Company branding' }
                  ].map((option) => (
                    <label key={option.key} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={(customizations as any)[option.key]}
                        onChange={(e) => setCustomizations({ ...customizations, ...( { [option.key]: e.target.checked } as any ) })}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brochure Preview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                <div className="bg-gray-50 rounded-xl p-4 h-80 overflow-auto">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-center mb-4" style={{ color: customizations.primaryColor }}>
                      <h1 className="text-xl font-bold">{property?.title ?? 'Property Title'}</h1>
                      <p className="text-sm">{property?.location ?? ''}{property?.city ? `, ${property.city}` : ''}</p>
                    </div>

                    <img
                      src={property?.photos?.[0] ?? 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt={property?.title ?? 'property'}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium">{property?.unitType ?? '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Area:</span>
                        <span className="font-medium">{property?.carpetArea ?? '—'} sq ft</span>
                      </div>
                      {customizations.includePricing && (
                        <div className="flex justify-between">
                          <span>Price:</span>
                          <span className="font-bold" style={{ color: customizations.secondaryColor }}>
                            {formatCurrency(property?.budget)}
                          </span>
                        </div>
                      )}
                      {customizations.includeAmenities && property?.amenities && (
                        <div>
                          <span>Amenities:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {property.amenities.slice(0, 4).map((amenity, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {customizations.watermark && (
                      <div className="text-center mt-4 pt-2 border-t">
                        <p className="text-xs text-gray-500">Powered by ResaleExpert</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Brochure will be generated in high-quality PDF format</div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => shareBrochure('whatsapp')}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                type="button"
              >
                <Send size={16} />
                <span>Share via WhatsApp</span>
              </button>
              <button
                onClick={generateBrochure}
                disabled={isGenerating}
                className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                type="button"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>Generate Brochure</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyBrochureModal;
