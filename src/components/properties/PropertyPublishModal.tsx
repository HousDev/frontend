// import React, { useState } from 'react';
// import { X, Save, Globe, Facebook, Instagram, Twitter, Linkedin, CheckCircle, Clock, AlertCircle, Eye, Share, Edit } from 'lucide-react';

// const PropertyPublishModal = ({ isOpen, onClose, property, onUpdate }: any) => {
//   const [selectedPortals, setSelectedPortals] = useState<string[]>(['magicbricks', '99acres']);
//   const [selectedSocial, setSelectedSocial] = useState<string[]>(['facebook', 'instagram']);
//   const [publishSettings, setPublishSettings] = useState({
//     includeContactInfo: true,
//     includePrice: true,
//     includeBrokerInfo: true,
//     autoRefresh: true,
//     featuredListing: false,
//     premiumPlacement: false
//   });
//   const [isPublishing, setIsPublishing] = useState(false);

//   if (!isOpen) return null;

//   const propertyPortals = [
//     {
//       id: 'magicbricks',
//       name: 'MagicBricks',
//       logo: '🏠',
//       reach: '2.5M users',
//       cost: 'Free',
//       features: ['High visibility', 'Lead generation', 'Analytics']
//     },
//     {
//       id: '99acres',
//       name: '99acres',
//       logo: '🏢',
//       reach: '1.8M users',
//       cost: 'Free',
//       features: ['Premium listings', 'Verified leads', 'Market insights']
//     },
//     {
//       id: 'housing',
//       name: 'Housing.com',
//       logo: '🏡',
//       reach: '1.2M users',
//       cost: 'Free',
//       features: ['Map-based search', 'Virtual tours', 'Instant connect']
//     },
//     {
//       id: 'commonfloor',
//       name: 'CommonFloor',
//       logo: '🏘️',
//       reach: '800K users',
//       cost: 'Free',
//       features: ['Society focus', 'Neighbor network', 'Local insights']
//     }
//   ];

//   const socialPlatforms = [
//     {
//       id: 'facebook',
//       name: 'Facebook',
//       icon: Facebook,
//       color: 'blue',
//       reach: '500M+ users',
//       features: ['Targeted ads', 'Local groups', 'Marketplace']
//     },
//     {
//       id: 'instagram',
//       name: 'Instagram',
//       icon: Instagram,
//       color: 'pink',
//       reach: '200M+ users',
//       features: ['Visual content', 'Stories', 'Reels']
//     },
//     {
//       id: 'twitter',
//       name: 'Twitter',
//       icon: Twitter,
//       color: 'sky',
//       reach: '100M+ users',
//       features: ['Real-time updates', 'Hashtags', 'Trending']
//     },
//     {
//       id: 'linkedin',
//       name: 'LinkedIn',
//       icon: Linkedin,
//       color: 'blue',
//       reach: '50M+ users',
//       features: ['Professional network', 'B2B reach', 'Industry groups']
//     }
//   ];

//   const handlePortalToggle = (portalId: string) => {
//     setSelectedPortals(prev => 
//       prev.includes(portalId) 
//         ? prev.filter(id => id !== portalId)
//         : [...prev, portalId]
//     );
//   };

//   const handleSocialToggle = (socialId: string) => {
//     setSelectedSocial(prev => 
//       prev.includes(socialId) 
//         ? prev.filter(id => id !== socialId)
//         : [...prev, socialId]
//     );
//   };

//   const handlePublish = async () => {
//     if (selectedPortals.length === 0 && selectedSocial.length === 0) {
//       alert('Please select at least one platform to publish');
//       return;
//     }

//     setIsPublishing(true);
    
//     try {
//       // Simulate publishing process
//       await new Promise(resolve => setTimeout(resolve, 3000));
      
//       const publishData = {
//         portals: selectedPortals,
//         socialPlatforms: selectedSocial,
//         settings: publishSettings,
//         publishedAt: new Date().toISOString(),
//         status: 'published'
//       };

//       const updatedProperty = {
//         ...property,
//         isPublic: true,
//         publishedPlatforms: [...selectedPortals, ...selectedSocial],
//         publishSettings: publishData,
//         publicViews: (property.publicViews || 0) + Math.floor(Math.random() * 50),
//         publicInquiries: (property.publicInquiries || 0) + Math.floor(Math.random() * 5)
//       };

//       onUpdate(updatedProperty);
//       alert('Property published successfully on selected platforms!');
//       onClose();
//     } catch (error) {
//       console.error('Publishing error:', error);
//       alert('Failed to publish property');
//     } finally {
//       setIsPublishing(false);
//     }
//   };

//   const formatCurrency = (amount: number) => {
//     if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
//     if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
//     return `₹${amount.toLocaleString('en-IN')}`;
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
//         {/* Header */}
//         <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900">Publish Property</h2>
//               <p className="text-gray-600 mt-1">{property.title} - Multi-platform Publishing</p>
//             </div>
//             <button
//               onClick={onClose}
//               className="p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-lg"
//             >
//               <X size={20} />
//             </button>
//           </div>
//         </div>

//         <div className="p-6 max-h-[70vh] overflow-y-auto">
//           {/* Property Summary */}
//           <div className="bg-gray-50 rounded-xl p-4 mb-6">
//             <h3 className="font-semibold text-gray-900 mb-3">Property Summary</h3>
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
//               <div>
//                 <span className="text-gray-500">Property:</span>
//                 <span className="font-semibold ml-2">{property.title}</span>
//               </div>
//               <div>
//                 <span className="text-gray-500">Location:</span>
//                 <span className="font-semibold ml-2">{property.location}, {property.city}</span>
//               </div>
//               <div>
//                 <span className="text-gray-500">Type:</span>
//                 <span className="font-semibold ml-2">{property.unitType} • {property.carpetArea} sq ft</span>
//               </div>
//               <div>
//                 <span className="text-gray-500">Price:</span>
//                 <span className="font-semibold ml-2">{formatCurrency(property.budget)}</span>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {/* Property Portals */}
//             <div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Portals</h3>
//               <div className="space-y-3">
//                 {propertyPortals.map((portal) => (
//                   <div
//                     key={portal.id}
//                     className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
//                       selectedPortals.includes(portal.id)
//                         ? 'border-blue-500 bg-blue-50'
//                         : 'border-gray-200 hover:border-gray-300'
//                     }`}
//                     onClick={() => handlePortalToggle(portal.id)}
//                   >
//                     <div className="flex items-center justify-between mb-2">
//                       <div className="flex items-center space-x-3">
//                         <span className="text-2xl">{portal.logo}</span>
//                         <div>
//                           <div className="font-medium text-gray-900">{portal.name}</div>
//                           <div className="text-sm text-gray-600">{portal.reach} • {portal.cost}</div>
//                         </div>
//                       </div>
//                       {selectedPortals.includes(portal.id) && (
//                         <CheckCircle className="text-blue-600" size={20} />
//                       )}
//                     </div>
//                     <div className="flex flex-wrap gap-1">
//                       {portal.features.map((feature, index) => (
//                         <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
//                           {feature}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Social Media */}
//             <div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h3>
//               <div className="space-y-3">
//                 {socialPlatforms.map((platform) => {
//                   const Icon = platform.icon;
//                   return (
//                     <div
//                       key={platform.id}
//                       className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
//                         selectedSocial.includes(platform.id)
//                           ? `border-${platform.color}-500 bg-${platform.color}-50`
//                           : 'border-gray-200 hover:border-gray-300'
//                       }`}
//                       onClick={() => handleSocialToggle(platform.id)}
//                     >
//                       <div className="flex items-center justify-between mb-2">
//                         <div className="flex items-center space-x-3">
//                           <Icon className={`text-${platform.color}-600`} size={24} />
//                           <div>
//                             <div className="font-medium text-gray-900">{platform.name}</div>
//                             <div className="text-sm text-gray-600">{platform.reach}</div>
//                           </div>
//                         </div>
//                         {selectedSocial.includes(platform.id) && (
//                           <CheckCircle className={`text-${platform.color}-600`} size={20} />
//                         )}
//                       </div>
//                       <div className="flex flex-wrap gap-1">
//                         {platform.features.map((feature, index) => (
//                           <span key={index} className={`px-2 py-1 bg-${platform.color}-100 text-${platform.color}-700 rounded-full text-xs`}>
//                             {feature}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           {/* Publishing Settings */}
//           <div className="mt-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Publishing Settings</h3>
//             <div className="bg-white border border-gray-200 rounded-xl p-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {[
//                   { key: 'includeContactInfo', label: 'Include Contact Information', description: 'Show seller contact details' },
//                   { key: 'includePrice', label: 'Include Price', description: 'Display property price' },
//                   { key: 'includeBrokerInfo', label: 'Include Broker Information', description: 'Show ResaleExpert details' },
//                   { key: 'autoRefresh', label: 'Auto Refresh Listings', description: 'Automatically refresh every 7 days' },
//                   { key: 'featuredListing', label: 'Featured Listing', description: 'Highlight as featured property' },
//                   { key: 'premiumPlacement', label: 'Premium Placement', description: 'Top placement in search results' }
//                 ].map((setting) => (
//                   <label key={setting.key} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
//                     <input
//                       type="checkbox"
//                       checked={publishSettings[setting.key as keyof typeof publishSettings]}
//                       onChange={(e) => setPublishSettings({
//                         ...publishSettings,
//                         [setting.key]: e.target.checked
//                       })}
//                       className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                     />
//                     <div>
//                       <div className="font-medium text-gray-900">{setting.label}</div>
//                       <div className="text-sm text-gray-600">{setting.description}</div>
//                     </div>
//                   </label>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Publishing Preview */}
//           <div className="mt-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Publishing Preview</h3>
//             <div className="bg-gray-50 rounded-xl p-4">
//               <div className="bg-white rounded-lg p-4 shadow-sm">
//                 <div className="flex items-start space-x-4">
//                   <img
//                     src={property.photos?.[0] || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=200'}
//                     alt={property.title}
//                     className="w-24 h-20 object-cover rounded-lg"
//                   />
//                   <div className="flex-1">
//                     <h4 className="font-bold text-gray-900">{property.title}</h4>
//                     <p className="text-sm text-gray-600">{property.location}, {property.city}</p>
//                     <div className="flex items-center space-x-3 mt-2">
//                       <span className="text-sm text-gray-600">{property.unitType}</span>
//                       <span className="text-sm text-gray-600">{property.carpetArea} sq ft</span>
//                       {publishSettings.includePrice && (
//                         <span className="font-bold text-green-600">{formatCurrency(property.budget)}</span>
//                       )}
//                     </div>
//                     {publishSettings.includeBrokerInfo && (
//                       <div className="mt-2 text-xs text-blue-600">
//                         Listed by ResaleExpert • Verified Property
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="p-6 border-t border-gray-200 bg-gray-50">
//           <div className="flex items-center justify-between">
//             <div className="text-sm text-gray-500">
//               Publishing to {selectedPortals.length + selectedSocial.length} platforms
//             </div>
//             <div className="flex items-center space-x-3">
//               <button
//                 onClick={onClose}
//                 className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handlePublish}
//                 disabled={isPublishing || (selectedPortals.length === 0 && selectedSocial.length === 0)}
//                 className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
//               >
//                 {isPublishing ? (
//                   <>
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                     <span>Publishing...</span>
//                   </>
//                 ) : (
//                   <>
//                     <Globe size={16} />
//                     <span>Publish Now</span>
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PropertyPublishModal;

import React, { useState } from 'react';
import { X, Save, Globe, Facebook, Instagram, Twitter, Linkedin, CheckCircle, Clock, AlertCircle, Eye, Share, Edit } from 'lucide-react';

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

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
      color: '#1877f2',
      reach: '500M+ users',
      features: ['Targeted ads', 'Local groups', 'Marketplace']
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: '#e4405f',
      reach: '200M+ users',
      features: ['Visual content', 'Stories', 'Reels']
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: '#1da1f2',
      reach: '100M+ users',
      features: ['Real-time updates', 'Hashtags', 'Trending']
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: '#0a66c2',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }}>
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between" style={{ background: N }}>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg" style={{ background: `${O}20` }}>
              <Globe size={16} className="sm:w-5 sm:h-5" style={{ color: O }} />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-bold text-white">Publish Property</h2>
              <p className="text-[10px] sm:text-xs text-white/70">{property?.title} - Multi-platform Publishing</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 sm:p-1.5 rounded hover:bg-white/10 transition-colors text-white">
            <X size={16} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 sm:space-y-6" style={{ scrollbarWidth: 'thin' }}>
          
          {/* Property Summary */}
          <div className="rounded-lg p-2 sm:p-3" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              <div>
                <p className="text-[9px] sm:text-xs font-medium" style={{ color: O }}>Property</p>
                <p className="text-[11px] sm:text-sm font-semibold truncate" style={{ color: N }}>{property?.title}</p>
              </div>
              <div>
                <p className="text-[9px] sm:text-xs font-medium" style={{ color: O }}>Location</p>
                <p className="text-[11px] sm:text-sm font-semibold truncate" style={{ color: N }}>{property?.location}, {property?.city}</p>
              </div>
              <div>
                <p className="text-[9px] sm:text-xs font-medium" style={{ color: O }}>Type</p>
                <p className="text-[11px] sm:text-sm font-semibold truncate" style={{ color: N }}>{property?.unitType} • {property?.carpetArea} sq ft</p>
              </div>
              <div>
                <p className="text-[9px] sm:text-xs font-medium" style={{ color: O }}>Price</p>
                <p className="text-[11px] sm:text-sm font-semibold truncate" style={{ color: N }}>{formatCurrency(property?.budget)}</p>
              </div>
            </div>
          </div>

          {/* Property Portals & Social Media */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Property Portals */}
            <div>
              <h3 className="text-[11px] sm:text-sm font-semibold mb-2 sm:mb-3" style={{ color: N }}>Property Portals</h3>
              <div className="space-y-2 sm:space-y-3">
                {propertyPortals.map((portal) => (
                  <div
                    key={portal.id}
                    className={`p-2 sm:p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedPortals.includes(portal.id) ? 'ring-1' : ''
                    }`}
                    style={{
                      borderColor: selectedPortals.includes(portal.id) ? O : BD,
                      background: selectedPortals.includes(portal.id) ? `${O}08` : BG
                    }}
                    onClick={() => handlePortalToggle(portal.id)}
                  >
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-lg sm:text-xl">{portal.logo}</span>
                        <div>
                          <div className="text-[11px] sm:text-sm font-medium" style={{ color: N }}>{portal.name}</div>
                          <div className="text-[9px] sm:text-xs" style={{ color: MU }}>{portal.reach} • {portal.cost}</div>
                        </div>
                      </div>
                      {selectedPortals.includes(portal.id) && (
                        <CheckCircle size={14} className="sm:w-4 sm:h-4" style={{ color: O }} />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {portal.features.map((feature, index) => (
                        <span key={index} className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px]" style={{ background: `${O}10`, color: O }}>
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
              <h3 className="text-[11px] sm:text-sm font-semibold mb-2 sm:mb-3" style={{ color: N }}>Social Media</h3>
              <div className="space-y-2 sm:space-y-3">
                {socialPlatforms.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <div
                      key={platform.id}
                      className={`p-2 sm:p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedSocial.includes(platform.id) ? 'ring-1' : ''
                      }`}
                      style={{
                        borderColor: selectedSocial.includes(platform.id) ? O : BD,
                        background: selectedSocial.includes(platform.id) ? `${O}08` : BG
                      }}
                      onClick={() => handleSocialToggle(platform.id)}
                    >
                      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Icon size={16} className="sm:w-5 sm:h-5" style={{ color: platform.color }} />
                          <div>
                            <div className="text-[11px] sm:text-sm font-medium" style={{ color: N }}>{platform.name}</div>
                            <div className="text-[9px] sm:text-xs" style={{ color: MU }}>{platform.reach}</div>
                          </div>
                        </div>
                        {selectedSocial.includes(platform.id) && (
                          <CheckCircle size={14} className="sm:w-4 sm:h-4" style={{ color: O }} />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {platform.features.map((feature, index) => (
                          <span key={index} className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[10px]" style={{ background: `${O}10`, color: O }}>
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
          <div>
            <h3 className="text-[11px] sm:text-sm font-semibold mb-2 sm:mb-3" style={{ color: N }}>Publishing Settings</h3>
            <div className="rounded-lg p-3 sm:p-4" style={{ background: BG, border: `1px solid ${BD}` }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {[
                  { key: 'includeContactInfo', label: 'Include Contact Information', description: 'Show seller contact details' },
                  { key: 'includePrice', label: 'Include Price', description: 'Display property price' },
                  { key: 'includeBrokerInfo', label: 'Include Broker Information', description: 'Show ResaleExpert details' },
                  { key: 'autoRefresh', label: 'Auto Refresh Listings', description: 'Automatically refresh every 7 days' },
                  { key: 'featuredListing', label: 'Featured Listing', description: 'Highlight as featured property' },
                  { key: 'premiumPlacement', label: 'Premium Placement', description: 'Top placement in search results' }
                ].map((setting) => (
                  <label key={setting.key} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg transition-all hover:shadow-sm" style={{ background: BG, border: `1px solid ${BD}` }}>
                    <input
                      type="checkbox"
                      checked={publishSettings[setting.key as keyof typeof publishSettings]}
                      onChange={(e) => setPublishSettings({
                        ...publishSettings,
                        [setting.key]: e.target.checked
                      })}
                      className="mt-0.5 rounded w-3 h-3 sm:w-4 sm:h-4"
                      style={{ accentColor: O }}
                    />
                    <div>
                      <div className="text-[10px] sm:text-sm font-medium" style={{ color: N }}>{setting.label}</div>
                      <div className="text-[8px] sm:text-xs" style={{ color: MU }}>{setting.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Publishing Preview */}
          <div>
            <h3 className="text-[11px] sm:text-sm font-semibold mb-2 sm:mb-3" style={{ color: N }}>Publishing Preview</h3>
            <div className="rounded-lg p-3 sm:p-4" style={{ background: `${N}05`, border: `1px solid ${BD}` }}>
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm" style={{ border: `1px solid ${BD}` }}>
                <div className="flex gap-3 sm:gap-4">
                  <img
                    src={property.photos?.[0] || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=200'}
                    alt={property.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="text-[11px] sm:text-sm font-bold" style={{ color: N }}>{property.title}</h4>
                    <p className="text-[9px] sm:text-xs" style={{ color: MU }}>{property.location}, {property.city}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="text-[9px] sm:text-xs" style={{ color: MU }}>{property.unitType}</span>
                      <span className="text-[9px] sm:text-xs" style={{ color: MU }}>{property.carpetArea} sq ft</span>
                      {publishSettings.includePrice && (
                        <span className="text-[10px] sm:text-sm font-bold" style={{ color: O }}>{formatCurrency(property.budget)}</span>
                      )}
                    </div>
                    {publishSettings.includeBrokerInfo && (
                      <div className="mt-1 text-[8px] sm:text-xs" style={{ color: O }}>Listed by ResaleExpert • Verified Property</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 sm:px-6 py-2 sm:py-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" style={{ borderColor: BD, background: BG }}>
          <div className="text-[10px] sm:text-sm" style={{ color: MU }}>
            Publishing to {selectedPortals.length + selectedSocial.length} platforms
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button onClick={onClose} className="px-2 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-sm border rounded transition-colors hover:bg-gray-50" style={{ borderColor: BD, color: N }}>
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing || (selectedPortals.length === 0 && selectedSocial.length === 0)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-sm rounded text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: O }}
            >
              {isPublishing ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-t-transparent" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Globe size={12} className="sm:w-4 sm:h-4" />
                  <span>Publish Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPublishModal;