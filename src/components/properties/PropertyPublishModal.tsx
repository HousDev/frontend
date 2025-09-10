import React, { useState } from 'react';
import { X, Save, Globe, Facebook, Instagram, Twitter, Linkedin, CheckCircle, Clock, AlertCircle, Eye, Share, Edit } from 'lucide-react';

const PropertyPublishModal = ({ isOpen, onClose, property, onUpdate }: any) => {
  const [selectedPortals, setSelectedPortals] = useState<string[]>(['magicbricks', '99acres']);
  const [selectedSocial, setSelectedSocial] = useState<string[]>(['facebook', 'instagram']);
  const [publishSettings, setPublishSettings] = useState({
    includeContactInfo: true,
    includePrice: true,
    includeBrokerInfo: true,
    autoRefresh: true,
    featuredListing: false,
    premiumPlacement: false
  });
  const [isPublishing, setIsPublishing] = useState(false);

  if (!isOpen) return null;

  const propertyPortals = [
    {
      id: 'magicbricks',
      name: 'MagicBricks',
      logo: '🏠',
      reach: '2.5M users',
      cost: 'Free',
      features: ['High visibility', 'Lead generation', 'Analytics']
    },
    {
      id: '99acres',
      name: '99acres',
      logo: '🏢',
      reach: '1.8M users',
      cost: 'Free',
      features: ['Premium listings', 'Verified leads', 'Market insights']
    },
    {
      id: 'housing',
      name: 'Housing.com',
      logo: '🏡',
      reach: '1.2M users',
      cost: 'Free',
      features: ['Map-based search', 'Virtual tours', 'Instant connect']
    },
    {
      id: 'commonfloor',
      name: 'CommonFloor',
      logo: '🏘️',
      reach: '800K users',
      cost: 'Free',
      features: ['Society focus', 'Neighbor network', 'Local insights']
    }
  ];

  const socialPlatforms = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'blue',
      reach: '500M+ users',
      features: ['Targeted ads', 'Local groups', 'Marketplace']
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'pink',
      reach: '200M+ users',
      features: ['Visual content', 'Stories', 'Reels']
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: 'sky',
      reach: '100M+ users',
      features: ['Real-time updates', 'Hashtags', 'Trending']
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'blue',
      reach: '50M+ users',
      features: ['Professional network', 'B2B reach', 'Industry groups']
    }
  ];

  const handlePortalToggle = (portalId: string) => {
    setSelectedPortals(prev => 
      prev.includes(portalId) 
        ? prev.filter(id => id !== portalId)
        : [...prev, portalId]
    );
  };

  const handleSocialToggle = (socialId: string) => {
    setSelectedSocial(prev => 
      prev.includes(socialId) 
        ? prev.filter(id => id !== socialId)
        : [...prev, socialId]
    );
  };

  const handlePublish = async () => {
    if (selectedPortals.length === 0 && selectedSocial.length === 0) {
      alert('Please select at least one platform to publish');
      return;
    }

    setIsPublishing(true);
    
    try {
      // Simulate publishing process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const publishData = {
        portals: selectedPortals,
        socialPlatforms: selectedSocial,
        settings: publishSettings,
        publishedAt: new Date().toISOString(),
        status: 'published'
      };

      const updatedProperty = {
        ...property,
        isPublic: true,
        publishedPlatforms: [...selectedPortals, ...selectedSocial],
        publishSettings: publishData,
        publicViews: (property.publicViews || 0) + Math.floor(Math.random() * 50),
        publicInquiries: (property.publicInquiries || 0) + Math.floor(Math.random() * 5)
      };

      onUpdate(updatedProperty);
      alert('Property published successfully on selected platforms!');
      onClose();
    } catch (error) {
      console.error('Publishing error:', error);
      alert('Failed to publish property');
    } finally {
      setIsPublishing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Publish Property</h2>
              <p className="text-gray-600 mt-1">{property.title} - Multi-platform Publishing</p>
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
          {/* Property Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Property Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Property:</span>
                <span className="font-semibold ml-2">{property.title}</span>
              </div>
              <div>
                <span className="text-gray-500">Location:</span>
                <span className="font-semibold ml-2">{property.location}, {property.city}</span>
              </div>
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="font-semibold ml-2">{property.unitType} • {property.carpetArea} sq ft</span>
              </div>
              <div>
                <span className="text-gray-500">Price:</span>
                <span className="font-semibold ml-2">{formatCurrency(property.budget)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Property Portals */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Portals</h3>
              <div className="space-y-3">
                {propertyPortals.map((portal) => (
                  <div
                    key={portal.id}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedPortals.includes(portal.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePortalToggle(portal.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{portal.logo}</span>
                        <div>
                          <div className="font-medium text-gray-900">{portal.name}</div>
                          <div className="text-sm text-gray-600">{portal.reach} • {portal.cost}</div>
                        </div>
                      </div>
                      {selectedPortals.includes(portal.id) && (
                        <CheckCircle className="text-blue-600" size={20} />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {portal.features.map((feature, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
              <div className="space-y-3">
                {socialPlatforms.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <div
                      key={platform.id}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedSocial.includes(platform.id)
                          ? `border-${platform.color}-500 bg-${platform.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleSocialToggle(platform.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <Icon className={`text-${platform.color}-600`} size={24} />
                          <div>
                            <div className="font-medium text-gray-900">{platform.name}</div>
                            <div className="text-sm text-gray-600">{platform.reach}</div>
                          </div>
                        </div>
                        {selectedSocial.includes(platform.id) && (
                          <CheckCircle className={`text-${platform.color}-600`} size={20} />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {platform.features.map((feature, index) => (
                          <span key={index} className={`px-2 py-1 bg-${platform.color}-100 text-${platform.color}-700 rounded-full text-xs`}>
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Publishing Settings */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Publishing Settings</h3>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'includeContactInfo', label: 'Include Contact Information', description: 'Show seller contact details' },
                  { key: 'includePrice', label: 'Include Price', description: 'Display property price' },
                  { key: 'includeBrokerInfo', label: 'Include Broker Information', description: 'Show ResaleExpert details' },
                  { key: 'autoRefresh', label: 'Auto Refresh Listings', description: 'Automatically refresh every 7 days' },
                  { key: 'featuredListing', label: 'Featured Listing', description: 'Highlight as featured property' },
                  { key: 'premiumPlacement', label: 'Premium Placement', description: 'Top placement in search results' }
                ].map((setting) => (
                  <label key={setting.key} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={publishSettings[setting.key as keyof typeof publishSettings]}
                      onChange={(e) => setPublishSettings({
                        ...publishSettings,
                        [setting.key]: e.target.checked
                      })}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{setting.label}</div>
                      <div className="text-sm text-gray-600">{setting.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Publishing Preview */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Publishing Preview</h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-start space-x-4">
                  <img
                    src={property.photos?.[0] || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=200'}
                    alt={property.title}
                    className="w-24 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{property.title}</h4>
                    <p className="text-sm text-gray-600">{property.location}, {property.city}</p>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className="text-sm text-gray-600">{property.unitType}</span>
                      <span className="text-sm text-gray-600">{property.carpetArea} sq ft</span>
                      {publishSettings.includePrice && (
                        <span className="font-bold text-green-600">{formatCurrency(property.budget)}</span>
                      )}
                    </div>
                    {publishSettings.includeBrokerInfo && (
                      <div className="mt-2 text-xs text-blue-600">
                        Listed by ResaleExpert • Verified Property
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
            <div className="text-sm text-gray-500">
              Publishing to {selectedPortals.length + selectedSocial.length} platforms
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing || (selectedPortals.length === 0 && selectedSocial.length === 0)}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isPublishing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Globe size={16} />
                    <span>Publish Now</span>
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

export default PropertyPublishModal;