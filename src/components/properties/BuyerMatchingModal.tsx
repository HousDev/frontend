import React, { useState } from 'react';
import { X, Users, Target, Search, Filter, Star, Phone, MessageCircle, Mail, MapPin, DollarSign, Calendar, Eye, Send, UserPlus } from 'lucide-react';

const BuyerMatchingModal = ({ isOpen, onClose, property }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuyers, setSelectedBuyers] = useState<number[]>([]);
  const [matchingCriteria, setMatchingCriteria] = useState({
    budgetRange: 10, // percentage
    locationRadius: 5, // km
    propertyType: true,
    amenities: true
  });

  if (!isOpen || !property) return null;

  // Sample buyers data with matching scores
  const buyers = [
    {
      id: 1,
      name: 'Amit Patel',
      phone: '+91 98765 11111',
      email: 'amit.patel@email.com',
      budget: { min: 22000000, max: 26000000 },
      preferredLocation: ['Andheri West', 'Bandra West', 'Juhu'],
      propertyType: 'Apartment',
      unitType: '3BHK',
      requirements: ['Ready to move', 'Good parking', 'Near metro'],
      matchScore: 95,
      status: 'hot_lead',
      lastContact: '2025-01-10',
      source: 'Website',
      visitHistory: 2,
      feedback: 'Very interested, looking for immediate purchase'
    },
    {
      id: 2,
      name: 'Priya Shah',
      phone: '+91 98765 22222',
      email: 'priya.shah@email.com',
      budget: { min: 20000000, max: 24000000 },
      preferredLocation: ['Andheri West', 'Versova', 'Oshiwara'],
      propertyType: 'Apartment',
      unitType: '2BHK',
      requirements: ['Good amenities', 'Security', 'Parking'],
      matchScore: 87,
      status: 'warm_lead',
      lastContact: '2025-01-08',
      source: 'Referral',
      visitHistory: 1,
      feedback: 'Interested but needs family approval'
    },
    {
      id: 3,
      name: 'Rohit Gupta',
      phone: '+91 98765 33333',
      email: 'rohit.gupta@email.com',
      budget: { min: 24000000, max: 28000000 },
      preferredLocation: ['Andheri West', 'Malad West', 'Goregaon West'],
      propertyType: 'Apartment',
      unitType: '3BHK',
      requirements: ['Investment purpose', 'Good rental yield', 'Branded builder'],
      matchScore: 92,
      status: 'hot_lead',
      lastContact: '2025-01-12',
      source: 'Social Media',
      visitHistory: 0,
      feedback: 'Looking for investment property'
    },
    {
      id: 4,
      name: 'Neha Sharma',
      phone: '+91 98765 44444',
      email: 'neha.sharma@email.com',
      budget: { min: 18000000, max: 22000000 },
      preferredLocation: ['Andheri East', 'Powai', 'Vikhroli'],
      propertyType: 'Apartment',
      unitType: '2BHK',
      requirements: ['First home', 'Good connectivity', 'Family-friendly'],
      matchScore: 78,
      status: 'warm_lead',
      lastContact: '2025-01-09',
      source: 'Advertisement',
      visitHistory: 1,
      feedback: 'Budget constraints, looking for better deals'
    }
  ];

  const filteredBuyers = buyers.filter(buyer =>
    buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buyer.phone.includes(searchTerm) ||
    buyer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buyer.requirements.some(req => req.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => b.matchScore - a.matchScore);

  const handleBuyerSelection = (buyerId: number) => {
    setSelectedBuyers(prev => 
      prev.includes(buyerId) 
        ? prev.filter(id => id !== buyerId)
        : [...prev, buyerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBuyers.length === filteredBuyers.length) {
      setSelectedBuyers([]);
    } else {
      setSelectedBuyers(filteredBuyers.map(b => b.id));
    }
  };

  const handleSendToSelectedBuyers = () => {
    if (selectedBuyers.length === 0) {
      alert('Please select buyers to send property details');
      return;
    }
    
    const selectedBuyerData = buyers.filter(b => selectedBuyers.includes(b.id));
    console.log('Sending property to buyers:', selectedBuyerData);
    alert(`Property details sent to ${selectedBuyers.length} buyers via WhatsApp and Email`);
    setSelectedBuyers([]);
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getBuyerStatusBadge = (status: string) => {
    const statusConfig = {
      'hot_lead': { bg: 'bg-red-100', text: 'text-red-700', label: 'Hot Lead', icon: '🔥' },
      'warm_lead': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Warm Lead', icon: '⚡' },
      'cold_lead': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Cold Lead', icon: '❄️' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.cold_lead;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const handleWhatsApp = (buyer: any) => {
    const message = `Hi ${buyer.name}, I have a perfect property match for you!\n\n🏠 ${property.title}\n📍 ${property.location}, ${property.city}\n💰 ${formatCurrency(property.budget)}\n🏢 ${property.unitType} • ${property.carpetArea} sq ft\n\nWould you like to schedule a visit?\n\nBest regards,\nResaleExpert Team`;
    const whatsappUrl = `https://wa.me/${buyer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmail = (buyer: any) => {
    const subject = `Perfect Property Match - ${property.title}`;
    const body = `Dear ${buyer.name},\n\nWe have found a perfect property match based on your requirements:\n\nProperty: ${property.title}\nLocation: ${property.location}, ${property.city}\nPrice: ${formatCurrency(property.budget)}\nType: ${property.unitType}\nArea: ${property.carpetArea} sq ft\n\nThis property matches ${buyers.find(b => b.id === buyer.id)?.matchScore}% of your requirements.\n\nWould you like to schedule a visit?\n\nBest regards,\nResaleExpert Team`;
    const mailtoUrl = `mailto:${buyer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <Target className="text-green-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Buyer Matching</h2>
                <p className="text-gray-600 mt-1">{property.title} - Find perfect buyers</p>
              </div>
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
          {/* Property Summary */}
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-blue-600">Property</div>
                <div className="font-bold text-blue-900">{property.title}</div>
              </div>
              <div>
                <div className="text-sm text-blue-600">Location</div>
                <div className="font-bold text-blue-900">{property.location}, {property.city}</div>
              </div>
              <div>
                <div className="text-sm text-blue-600">Type</div>
                <div className="font-bold text-blue-900">{property.unitType} • {property.carpetArea} sq ft</div>
              </div>
              <div>
                <div className="text-sm text-blue-600">Price</div>
                <div className="font-bold text-blue-900">{formatCurrency(property.budget)}</div>
              </div>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search buyers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter size={16} />
                <span>Filters</span>
              </button>
            </div>
            
            {selectedBuyers.length > 0 && (
              <button
                onClick={handleSendToSelectedBuyers}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Send size={16} />
                <span>Send to {selectedBuyers.length} Buyers</span>
              </button>
            )}
          </div>

          {/* Matching Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Perfect Match</p>
                  <p className="text-2xl font-bold text-green-900">{filteredBuyers.filter(b => b.matchScore >= 90).length}</p>
                </div>
                <Target className="text-green-600" size={24} />
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Good Match</p>
                  <p className="text-2xl font-bold text-blue-900">{filteredBuyers.filter(b => b.matchScore >= 80 && b.matchScore < 90).length}</p>
                </div>
                <Star className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Potential Match</p>
                  <p className="text-2xl font-bold text-orange-900">{filteredBuyers.filter(b => b.matchScore >= 70 && b.matchScore < 80).length}</p>
                </div>
                <Users className="text-orange-600" size={24} />
              </div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Buyers</p>
                  <p className="text-2xl font-bold text-purple-900">{filteredBuyers.length}</p>
                </div>
                <UserPlus className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          {/* Buyers List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Matched Buyers</h3>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {selectedBuyers.length === filteredBuyers.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            {filteredBuyers.map((buyer) => (
              <div key={buyer.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedBuyers.includes(buyer.id)}
                    onChange={() => handleBuyerSelection(buyer.id)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">{buyer.name}</h4>
                        <div className="flex items-center space-x-3 mt-1">
                          {getBuyerStatusBadge(buyer.status)}
                          <div className={`px-3 py-1 rounded-full text-sm font-bold ${getMatchScoreColor(buyer.matchScore)}`}>
                            {buyer.matchScore}% Match
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleWhatsApp(buyer)}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleEmail(buyer)}
                          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="Email"
                        >
                          <Mail size={16} />
                        </button>
                        <button className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors">
                          <Phone size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-sm text-gray-500">Budget Range:</span>
                        <span className="font-medium ml-2 text-green-600">
                          {formatCurrency(buyer.budget.min)} - {formatCurrency(buyer.budget.max)}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Preferred Units</span>
                        <span className="font-medium ml-2">{buyer.unitType} {buyer.propertyType}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Contact:</span>
                        <span className="font-medium ml-2">{buyer.phone}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Source:</span>
                        <span className="font-medium ml-2">{buyer.source}</span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <span className="text-sm text-gray-500">Preferred Locations:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {buyer.preferredLocation.map((location, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {location}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <span className="text-sm text-gray-500">Requirements:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {buyer.requirements.map((req, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span>Last Contact: {buyer.lastContact}</span>
                        <span>Visits: {buyer.visitHistory}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{buyer.feedback}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {filteredBuyers.length} buyers found • {selectedBuyers.length} selected
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              {selectedBuyers.length > 0 && (
                <button
                  onClick={handleSendToSelectedBuyers}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Send size={16} />
                  <span>Send to {selectedBuyers.length} Buyers</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerMatchingModal;