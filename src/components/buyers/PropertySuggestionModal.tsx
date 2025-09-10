import React, { useState } from 'react';
import { X, Target, Star, Building, MapPin, DollarSign, Eye, Heart, Calendar, Phone, MessageCircle, Share, Bookmark, CheckCircle, AlertCircle, TrendingUp, Award, Shield, Bot, FileText, Percent } from 'lucide-react';

const PropertySuggestionModal = ({ isOpen, onClose, buyer }: any) => {
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [filterType, setFilterType] = useState('all');

  if (!isOpen || !buyer) return null;

  // AI-powered property suggestions based on buyer profile
  const suggestions = [
    {
      id: 'PROP001',
      title: 'Luxury 3BHK Apartment',
      address: 'Skyline Towers, Andheri West, Mumbai',
      price: 25000000,
      area: 1250,
      matchScore: 95,
      aiReasons: [
        'Perfect budget match within your range',
        'Located in your preferred area (Andheri West)',
        'Has all required amenities (Swimming Pool, Gym, Security)',
        'Ready to move - matches your possession requirement',
        'North facing - good for natural light'
      ],
      highlights: ['Premium location', 'Ready to move', 'All amenities', 'Good connectivity'],
      seller: { name: 'Rajesh Kumar', phone: '+91 98765 43210', rating: 4.8 },
      images: ['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400'],
      amenities: ['Swimming Pool', 'Gym', 'Security', 'Parking', 'Garden', 'Club House'],
      nearbyPlaces: [
        { name: 'Andheri Metro Station', distance: '0.5 km', type: 'transport' },
        { name: 'Infiniti Mall', distance: '1.2 km', type: 'shopping' },
        { name: 'Kokilaben Hospital', distance: '2.1 km', type: 'healthcare' }
      ],
      priceHistory: { trend: 'up', change: '+5.2%', period: '6 months' },
      investmentPotential: 'high',
      rentalYield: '3.2%',
      appreciationRate: '8-12%'
    },
    {
      id: 'PROP002',
      title: 'Premium 3BHK with Sea View',
      address: 'Ocean Heights, Bandra West, Mumbai',
      price: 28000000,
      area: 1400,
      matchScore: 88,
      aiReasons: [
        'Slightly above budget but excellent investment potential',
        'Premium location with sea view',
        'High appreciation rate (12% annually)',
        'Luxury amenities match your lifestyle',
        'Strong rental demand in the area'
      ],
      highlights: ['Sea view', 'Premium location', 'High ROI', 'Luxury amenities'],
      seller: { name: 'Priya Sharma', phone: '+91 87654 32109', rating: 4.9 },
      images: ['https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=400'],
      amenities: ['Swimming Pool', 'Gym', 'Security', 'Sea View', 'Club House', 'Concierge'],
      nearbyPlaces: [
        { name: 'Bandra Station', distance: '1.0 km', type: 'transport' },
        { name: 'Linking Road', distance: '0.8 km', type: 'shopping' },
        { name: 'Lilavati Hospital', distance: '1.5 km', type: 'healthcare' }
      ],
      priceHistory: { trend: 'up', change: '+8.1%', period: '6 months' },
      investmentPotential: 'very_high',
      rentalYield: '2.8%',
      appreciationRate: '10-15%'
    },
    {
      id: 'PROP003',
      title: 'Modern 2BHK in Prime Location',
      address: 'Metro Heights, Andheri East, Mumbai',
      price: 18000000,
      area: 980,
      matchScore: 75,
      aiReasons: [
        'Budget-friendly option within your range',
        'Good connectivity to business districts',
        'Emerging area with development potential',
        'Suitable for first-time buyers',
        'Good rental potential'
      ],
      highlights: ['Budget friendly', 'Good connectivity', 'Growth potential', 'Metro nearby'],
      seller: { name: 'Amit Gupta', phone: '+91 76543 21098', rating: 4.6 },
      images: ['https://images.pexels.com/photos/1396125/pexels-photo-1396125.jpeg?auto=compress&cs=tinysrgb&w=400'],
      amenities: ['Gym', 'Security', 'Parking', 'Garden', 'Kids Play Area'],
      nearbyPlaces: [
        { name: 'Andheri East Metro', distance: '0.3 km', type: 'transport' },
        { name: 'Phoenix Mall', distance: '2.0 km', type: 'shopping' },
        { name: 'Seven Hills Hospital', distance: '1.8 km', type: 'healthcare' }
      ],
      priceHistory: { trend: 'up', change: '+3.5%', period: '6 months' },
      investmentPotential: 'medium',
      rentalYield: '4.1%',
      appreciationRate: '6-9%'
    }
  ];

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100 border-green-200';
    if (score >= 80) return 'text-blue-600 bg-blue-100 border-blue-200';
    if (score >= 70) return 'text-orange-600 bg-orange-100 border-orange-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const getInvestmentPotentialBadge = (potential: string) => {
    const config = {
      'very_high': { bg: 'bg-green-100', text: 'text-green-700', label: 'Very High', icon: '🚀' },
      'high': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'High', icon: '📈' },
      'medium': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium', icon: '📊' },
      'low': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Low', icon: '📉' }
    };
    
    const potentialConfig = config[potential as keyof typeof config] || config.medium;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${potentialConfig.bg} ${potentialConfig.text}`}>
        {potentialConfig.icon} {potentialConfig.label}
      </span>
    );
  };

  const handlePropertySelection = (propertyId: string) => {
    setSelectedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleScheduleVisit = (property: any) => {
    console.log('Scheduling visit for:', property.title);
    alert(`Visit scheduled for ${property.title}. You will receive confirmation shortly.`);
  };

  const handleContactSeller = (property: any) => {
    const message = `Hi ${property.seller.name}, I'm interested in your property ${property.title}. My budget is ${formatCurrency(buyer.budget.min)} - ${formatCurrency(buyer.budget.max)}. Can we schedule a visit?`;
    window.open(`https://wa.me/${property.seller.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSaveToShortlist = (property: any) => {
    console.log('Saving to shortlist:', property.title);
    alert(`${property.title} added to your shortlist!`);
  };

  const handleRequestMoreInfo = (property: any) => {
    console.log('Requesting more info for:', property.title);
    alert(`More information requested for ${property.title}. Seller will be notified.`);
  };

  const filteredSuggestions = suggestions.filter(property => {
    if (filterType === 'all') return true;
    if (filterType === 'budget_match') return property.price >= buyer.budget.min && property.price <= buyer.budget.max;
    if (filterType === 'high_match') return property.matchScore >= 85;
    if (filterType === 'investment') return property.investmentPotential === 'high' || property.investmentPotential === 'very_high';
    return true;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden text-xs">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="text-purple-600" size={18} />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">AI Property Suggestions</h2>
                <p className="text-gray-600 mt-0.5">Personalized recommendations for {buyer.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white hover:bg-gray-50 transition-colors shadow-md"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-4 max-h-[80vh] overflow-y-auto">
          {/* Buyer Profile Summary */}
          <div className="bg-purple-50 rounded-lg p-3 mb-4">
            <h3 className="font-semibold text-purple-900 mb-2">Your Profile Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <span className="text-purple-600">Budget:</span>
                <span className="font-bold text-purple-900 ml-1">
                  {formatCurrency(buyer.budget.min)} - {formatCurrency(buyer.budget.max)}
                </span>
              </div>
              <div>
                <span className="text-purple-600">Preferred Units</span>
                <span className="font-bold text-purple-900 ml-1">{buyer.requirements.unitType}</span>
              </div>
              <div>
                <span className="text-purple-600">Preferred Areas:</span>
                <span className="font-bold text-purple-900 ml-1">
                  {buyer.requirements.preferredLocations.slice(0, 2).join(', ')}
                </span>
              </div>
              <div>
                <span className="text-purple-600">Lead Score:</span>
                <span className="font-bold text-purple-900 ml-1">{buyer.leadScore}/100</span>
              </div>
            </div>
          </div>

          {/* Filter Options */}
          <div className="flex items-center space-x-2 mb-4 flex-wrap gap-1">
            <span className="font-medium text-gray-700">Filter by:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'budget_match', label: 'Budget Match' },
              { id: 'high_match', label: 'High Match' },
              { id: 'investment', label: 'Best Investment' }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterType(filter.id)}
                className={`px-2 py-1 rounded-full font-medium transition-colors ${
                  filterType === filter.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Property Suggestions */}
          <div className="space-y-4">
            {filteredSuggestions.map((property) => (
              <div key={property.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all">
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedProperties.includes(property.id)}
                      onChange={() => handlePropertySelection(property.id)}
                      className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-24 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 truncate">{property.title}</h4>
                          <div className="flex items-center space-x-1 text-gray-600 mt-0.5">
                            <MapPin size={12} />
                            <span className="truncate">{property.address}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1 flex-wrap gap-1">
                            <div className={`px-2 py-0.5 rounded-full border ${getMatchScoreColor(property.matchScore)}`}>
                              {property.matchScore}% Match
                            </div>
                            {getInvestmentPotentialBadge(property.investmentPotential)}
                            <div className="flex items-center space-x-0.5">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  size={10}
                                  className={i < property.seller.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                                />
                              ))}
                              <span className="text-gray-600 ml-0.5">({property.seller.rating})</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 pl-2">
                          <div className="font-bold text-green-600">{formatCurrency(property.price)}</div>
                          <div className="text-gray-500">{property.area} sq ft</div>
                          <div className="text-gray-500 mt-0.5">₹{Math.round(property.price / property.area).toLocaleString()}/sq ft</div>
                        </div>
                      </div>

                      {/* AI Reasoning */}
                      <div className="mb-3">
                        <h5 className="font-medium text-gray-900 mb-1 flex items-center">
                          <Bot className="mr-1 text-blue-600" size={12} />
                          Why AI recommends:
                        </h5>
                        <div className="space-y-0.5">
                          {property.aiReasons.slice(0, 2).map((reason: string, index: number) => (
                            <div key={index} className="flex items-start space-x-1">
                              <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={10} />
                              <span className="text-gray-700">{reason}</span>
                            </div>
                          ))}
                          {property.aiReasons.length > 2 && (
                            <div className="text-blue-600 cursor-pointer hover:underline">
                              +{property.aiReasons.length - 2} more reasons
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Investment Metrics */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-green-50 rounded p-2">
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="text-green-600" size={10} />
                            <span className="font-medium text-green-800">Price Trend</span>
                          </div>
                          <div className="font-bold text-green-900">{property.priceHistory.change}</div>
                          <div className="text-green-700">{property.priceHistory.period}</div>
                        </div>
                        <div className="bg-blue-50 rounded p-2">
                          <div className="flex items-center space-x-1">
                            <Percent className="text-blue-600" size={10} />
                            <span className="font-medium text-blue-800">Rental Yield</span>
                          </div>
                          <div className="font-bold text-blue-900">{property.rentalYield}</div>
                          <div className="text-blue-700">per annum</div>
                        </div>
                        <div className="bg-purple-50 rounded p-2">
                          <div className="flex items-center space-x-1">
                            <Award className="text-purple-600" size={10} />
                            <span className="font-medium text-purple-800">Appreciation</span>
                          </div>
                          <div className="font-bold text-purple-900">{property.appreciationRate}</div>
                          <div className="text-purple-700">expected</div>
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {property.highlights.slice(0, 3).map((highlight: string, index: number) => (
                            <span key={index} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Seller Info */}
                      <div className="mb-3 p-2 bg-gray-50 rounded">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">Seller: {property.seller.name}</div>
                            <div className="text-gray-600">{property.seller.phone}</div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="flex items-center space-x-0.5">
                              <Star className="text-yellow-400 fill-current" size={10} />
                              <span className="font-medium">{property.seller.rating}</span>
                            </div>
                            <button
                              onClick={() => handleContactSeller(property)}
                              className="flex items-center space-x-0.5 px-1.5 py-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                            >
                              <MessageCircle size={10} />
                              <span>Contact</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Nearby Places */}
                      <div className="mb-3">
                        <h6 className="font-medium text-gray-700 mb-1">Nearby Places</h6>
                        <div className="grid grid-cols-3 gap-1">
                          {property.nearbyPlaces.slice(0, 3).map((place: any, index: number) => (
                            <div key={index} className="bg-gray-50 p-1 rounded">
                              <div className="font-medium text-gray-900 truncate">{place.name}</div>
                              <div className="text-gray-600">{place.distance} • {place.type}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1 flex-wrap gap-1">
                        <button
                          onClick={() => handleScheduleVisit(property)}
                          className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          <Calendar size={12} />
                          <span>Visit</span>
                        </button>
                        <button
                          onClick={() => handleSaveToShortlist(property)}
                          className="flex items-center space-x-1 px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                        >
                          <Heart size={12} />
                          <span>Shortlist</span>
                        </button>
                        <button
                          onClick={() => handleRequestMoreInfo(property)}
                          className="flex items-center space-x-1 px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                        >
                          <FileText size={12} />
                          <span>Info</span>
                        </button>
                        <button className="flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                          <Share size={12} />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Insights */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
              <Bot className="mr-1" size={16} />
              AI Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="bg-white rounded p-2">
                <h4 className="font-medium text-gray-900 mb-1">Market Recommendation</h4>
                <p className="text-gray-700">
                  Andheri West offers the best value with 8-12% appreciation and strong rental demand.
                </p>
              </div>
              <div className="bg-white rounded p-2">
                <h4 className="font-medium text-gray-900 mb-1">Timing Advice</h4>
                <p className="text-gray-700">
                  Current market conditions are favorable for buyers with stable interest rates.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-gray-500">
              {filteredSuggestions.length} properties • {selectedProperties.length} selected
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="px-3 py-1 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              {selectedProperties.length > 0 && (
                <button className="flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                  <Heart size={14} />
                  <span>Save {selectedProperties.length}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertySuggestionModal;