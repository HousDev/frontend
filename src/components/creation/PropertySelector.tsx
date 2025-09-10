import React, { useState } from 'react';
import { Search, X, Building, MapPin, Home, Car, Wifi, Dumbbell, Shield, Waves, TreePine, Users } from 'lucide-react';

const PropertySelector = ({ onSelect, onClose, title }: any) => {
  const [searchTerm, setSearchTerm] = useState('');

  const properties = [
    {
      id: 'PROP001',
      title: 'Luxury 3BHK Apartment',
      address: 'Flat A-404, Skyline Towers, Andheri West, Mumbai',
      type: 'Apartment',
      area: '1250',
      floor: '4th Floor',
      facing: 'North-East',
      price: '2.5 Cr',
      status: 'Ready to Move',
      developer: 'Skyline Developers',
      society: 'Skyline Towers',
      parking: '2 Covered',
      amenities: ['Swimming Pool', 'Gym', 'Security', 'Power Backup', 'Garden'],
      image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'PROP002',
      title: 'Premium Villa with Garden',
      address: 'Plot 15, Green Valley Society, Sector 21, Pune',
      type: 'Villa',
      area: '2800',
      floor: 'Ground + 2',
      facing: 'South',
      price: '4.2 Cr',
      status: 'Under Construction',
      developer: 'Green Valley Developers',
      society: 'Green Valley Society',
      parking: '3 Covered + Open',
      amenities: ['Private Garden', 'Swimming Pool', 'Club House', 'Security', 'Kids Play Area'],
      image: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'PROP003',
      title: 'Modern 2BHK Flat',
      address: 'Unit B-201, Metro Heights, Gurgaon, Haryana',
      type: 'Apartment',
      area: '980',
      floor: '2nd Floor',
      facing: 'West',
      price: '1.8 Cr',
      status: 'Ready to Move',
      developer: 'Metro Builders',
      society: 'Metro Heights',
      parking: '1 Covered',
      amenities: ['Gym', 'Security', 'Power Backup', 'Lift', 'Garden'],
      image: 'https://images.pexels.com/photos/1396125/pexels-photo-1396125.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'PROP004',
      title: 'Commercial Office Space',
      address: 'Office 501, Business Tower, BKC, Mumbai',
      type: 'Commercial',
      area: '1500',
      floor: '5th Floor',
      facing: 'East',
      price: '3.5 Cr',
      status: 'Ready to Move',
      developer: 'Business Developers',
      society: 'Business Tower',
      parking: '4 Reserved',
      amenities: ['High Speed Internet', 'Conference Room', 'Security', 'Power Backup', 'Cafeteria'],
      image: 'https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 'PROP005',
      title: 'Spacious 4BHK Penthouse',
      address: 'Penthouse PH-01, Royal Residency, Bandra, Mumbai',
      type: 'Penthouse',
      area: '3200',
      floor: '15th Floor',
      facing: 'Sea Facing',
      price: '8.5 Cr',
      status: 'Ready to Move',
      developer: 'Royal Developers',
      society: 'Royal Residency',
      parking: '3 Covered + Terrace',
      amenities: ['Private Terrace', 'Swimming Pool', 'Gym', 'Security', 'Concierge', 'Sea View'],
      image: 'https://images.pexels.com/photos/1396126/pexels-photo-1396126.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const filteredProperties = properties.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'swimming pool': return <Waves className="text-blue-500" size={14} />;
      case 'gym': return <Dumbbell className="text-red-500" size={14} />;
      case 'security': return <Shield className="text-green-500" size={14} />;
      case 'garden': case 'private garden': return <TreePine className="text-green-600" size={14} />;
      case 'kids play area': return <Users className="text-purple-500" size={14} />;
      case 'high speed internet': return <Wifi className="text-blue-600" size={14} />;
      default: return <Home className="text-gray-500" size={14} />;
    }
  };

  const getPropertyTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'villa': return <Home className="text-green-600" size={24} />;
      case 'penthouse': return <Building className="text-purple-600" size={24} />;
      case 'commercial': return <Building className="text-blue-600" size={24} />;
      default: return <Building className="text-orange-600" size={24} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{title || 'Select Property'}</h2>
              <p className="text-gray-600 mt-2 text-lg">Choose from our premium property listings</p>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-lg"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-8 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search properties by title, address, type, or property ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            />
          </div>
        </div>

        {/* Property List */}
        <div className="p-8 max-h-[60vh] overflow-y-auto">
          <div className="grid gap-6">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                onClick={() => onSelect(property)}
                className="bg-white border border-gray-200 rounded-2xl hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl group"
              >
                <div className="p-6">
                  <div className="flex items-start space-x-6">
                    {/* Property Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="w-32 h-24 object-cover rounded-xl"
                      />
                    </div>
                    
                    {/* Property Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            {getPropertyTypeIcon(property.type)}
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {property.title}
                            </h3>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {property.id}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600 mb-2">
                            <MapPin size={16} />
                            <span className="text-sm">{property.address}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600 mb-1">₹{property.price}</div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            property.status === 'Ready to Move' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {property.status}
                          </div>
                        </div>
                      </div>

                      {/* Property Specifications */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Type</div>
                          <div className="font-semibold text-gray-900">{property.type}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Area</div>
                          <div className="font-semibold text-gray-900">{property.area} sq ft</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Floor</div>
                          <div className="font-semibold text-gray-900">{property.floor}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Facing</div>
                          <div className="font-semibold text-gray-900">{property.facing}</div>
                        </div>
                      </div>

                      {/* Additional Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Developer</div>
                          <div className="font-medium text-gray-700">{property.developer}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Parking</div>
                          <div className="font-medium text-gray-700">{property.parking}</div>
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="mb-4">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Amenities</div>
                        <div className="flex flex-wrap gap-2">
                          {property.amenities.slice(0, 5).map((amenity, index) => (
                            <div key={index} className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                              {getAmenityIcon(amenity)}
                              <span>{amenity}</span>
                            </div>
                          ))}
                          {property.amenities.length > 5 && (
                            <div className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                              +{property.amenities.length - 5} more
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Select Button */}
                      <div className="flex justify-end">
                        <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg">
                          Select Property
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProperties.length === 0 && (
            <div className="text-center py-16">
              <Building className="mx-auto text-gray-300 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-500">Try adjusting your search terms to find the perfect property</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertySelector;