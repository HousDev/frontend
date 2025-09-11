import React, { useState } from 'react';

import {
  ArrowLeft,
  MapPin,
  Building,
  Car,
  Wifi,
  Dumbbell,
  Shield,
  TreePine,
  Waves,
  Home,
  DollarSign,
  Eye,
  Heart,
  Share,
  Phone,
  MessageCircle,
  Mail,
  Calendar,
  User,
  Star,
  CheckCircle,
  Camera,
  Video,
  Download,
  Bookmark,
  Flag,
  Info,
  Award,
  Target,
  TrendingUp,
  BarChart3,
  Clock,
  Users,
  Globe,
  Zap,
  Crown,
  Gem,
  Bot,
  Sparkles,
  TrendingDown,
  AlertCircle,
  Lightbulb,
  Calculator,
  PieChart,
  Lock,
  X
} from 'lucide-react';
import AIPaywallOverlay from '@/components/paywall/AIPaywallOverlay';

const PublicPropertyDetailPage = ({ property, onBack }: any) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState<'ai-recommendations' | 'ai-investment' | 'premium-details'>('ai-recommendations');
  const [hasSubscription, setHasSubscription] = useState(false); // This would come from user context
  const [isLoggedIn, setIsLoggedIn] = useState(false); // This would come from auth context
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  // ---- safe back handler: use parent callback if provided, otherwise fallback ----
  const handleBack = () => {
    if (typeof onBack === 'function') {
      try {
        onBack();
        return;
      } catch (err) {
        // ignore and fallback
        // console.warn('onBack threw', err);
      }
    }

    // fallback: go back in history if possible
    if (typeof window !== 'undefined' && window.history && window.history.length > 1) {
      window.history.back();
      return;
    }

    // final fallback: navigate to a sensible route
    if (typeof window !== 'undefined') {
      window.location.href = '/properties';
    }
  };

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Home className="mx-auto text-gray-300 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist.</p>
          <button
            onClick={handleBack}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'swimming pool': return <Waves className="text-blue-500" size={20} />;
      case 'gym': return <Dumbbell className="text-red-500" size={20} />;
      case 'security': case '24/7 security': return <Shield className="text-green-500" size={20} />;
      case 'garden': case 'private garden': return <TreePine className="text-green-500" size={20} />;
      case 'parking': case 'covered parking': return <Car className="text-gray-500" size={20} />;
      case 'wifi': case 'high-speed internet': return <Wifi className="text-purple-500" size={20} />;
      default: return <CheckCircle className="text-blue-500" size={20} />;
    }
  };

  const images = property.images || [
    'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
    'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
    'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'
  ];

  const amenities = property.amenities || [
    'Swimming Pool',
    'Gym',
    '24/7 Security',
    'Private Garden',
    'Covered Parking',
    'High-speed Internet'
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', contactForm);
    setShowContactForm(false);
    setContactForm({ name: '', phone: '', email: '', message: '' });
  };

  const handlePaywallOpen = (feature: 'ai-recommendations' | 'ai-investment' | 'premium-details') => {
    if (!isLoggedIn) {
      // fallback behaviour: open paywall that will prompt to login
      setPaywallFeature(feature);
      setShowPaywall(true);
      return;
    }
    setPaywallFeature(feature);
    setShowPaywall(true);
  };

  const handleSubscribe = (plan: string) => {
    setHasSubscription(true);
    console.log('Subscribed to plan:', plan);
    setShowPaywall(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              <ArrowLeft size={18} className="mr-1" />
              Back to Properties
            </button>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-100">
                <Heart size={18} />
              </button>
              <button className="p-2 text-gray-600 hover:text-blue-500 transition-colors rounded-lg hover:bg-gray-100">
                <Share size={18} />
              </button>
              <button className="p-2 text-gray-600 hover:text-yellow-500 transition-colors rounded-lg hover:bg-gray-100">
                <Bookmark size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative h-80 bg-gray-900">
        <img
          src={images[currentImageIndex]}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20" />

        {/* Image Navigation */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                  }`}
              />
            ))}
          </div>
        )}

        {/* Image Counter */}
        <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
          {currentImageIndex + 1} / {images.length}
        </div>

        {/* View Options */}
        <div className="absolute bottom-3 right-3 flex space-x-2">
          <button className="bg-white bg-opacity-90 text-gray-900 px-3 py-1.5 rounded-lg flex items-center space-x-1 hover:bg-white transition-colors text-sm">
            <Camera size={16} />
            <span className="text-sm">Photos</span>
          </button>
          <button className="bg-white bg-opacity-90 text-gray-900 px-3 py-1.5 rounded-lg flex items-center space-x-1 hover:bg-white transition-colors text-sm">
            <Video size={16} />
            <span className="text-sm">Tour</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Header */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    {/* <h1 className="text-2xl font-bold text-gray-900">
                      {property.title || 'Luxury Villa in Prime Location'}
                    </h1> */}
                    <div className=" font-bold text-gray-900 text-lg">
                      {(property.type && property.type !== ' - ') && <span className="mr-2">{property.type}</span>}
                      {(property.unitType && property.unitType !== ' - ') && <span className="mr-2"> {property.unitType}</span>}
                      {(property.subtype && property.subtype !== ' - ') && <span className="mr-2"> {property.subtype}</span>}
                    </div>
                    {property.verified && (
                      <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                        <CheckCircle size={14} />
                        <span>Verified</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin size={16} className="mr-1" />
                    <span>{property.location || 'Bandra West, Mumbai'}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Eye size={14} className="mr-1" />
                      {property.views || '1,234'} views
                    </span>
                    <span className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      Listed {property.listedDays || '5'} days ago
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(property.price || 25000000)}
                  </div>
                  <div className="text-sm text-gray-500">
                    ₹{((property.price || 25000000) / (property.area || 1200)).toLocaleString('en-IN')}/sq ft
                  </div>
                </div>
              </div>

              {/* AI Insights Banner */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-4 border border-purple-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Bot className="text-purple-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">AI Property Analysis</h3>
                    {hasSubscription || !isLoggedIn ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">AI Score: </span>
                          <span className="font-bold text-purple-600">{property.aiScore || '94'}/100</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Growth: </span>
                          <span className="font-bold text-green-600">{property.priceGrowth || '+12.5%'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Investment: </span>
                          <span className="font-bold text-blue-600">{property.investmentGrade || 'A+'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">ROI Potential: </span>
                          <span className="font-bold text-orange-600">18.2%</span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm blur-sm">
                          <div>
                            <span className="text-gray-600">AI Score: </span>
                            <span className="font-bold text-purple-600">••/100</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Growth: </span>
                            <span className="font-bold text-green-600">+••.•%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Investment: </span>
                            <span className="font-bold text-blue-600">••</span>
                          </div>
                          <div>
                            <span className="text-gray-600">ROI Potential: </span>
                            <span className="font-bold text-orange-600">••.•%</span>
                          </div>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <button
                            onClick={() => handlePaywallOpen('ai-investment')}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
                          >
                            <Lock size={16} />
                            <span>Unlock AI Analysis - ₹299</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{property.bedrooms || 4}</div>
                  <div className="text-sm text-gray-600">Bedrooms</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{property.bathrooms || 3}</div>
                  <div className="text-sm text-gray-600">Bathrooms</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{property.area || 1200}</div>
                  <div className="text-sm text-gray-600">Sq Ft</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{property.parking || 2}</div>
                  <div className="text-sm text-gray-600">Parking</div>
                </div>
              </div>

              {/* Property Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {property.type || 'Villa'}
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {property.possession || 'Ready to Move'}
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  {property.furnishing || 'Semi-Furnished'}
                </span>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-white rounded-xl shadow-sm p-5 relative">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Lightbulb className="text-blue-600" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">AI Recommendations</h2>
              </div>

              {hasSubscription ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="text-green-600" size={18} />
                      <span className="font-semibold text-green-800">Price Appreciation</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-1">+15.2%</div>
                    <div className="text-sm text-green-700">Expected in next 12 months</div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <PieChart className="text-blue-600" size={18} />
                      <span className="font-semibold text-blue-800">Market Position</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">Top 10%</div>
                    <div className="text-sm text-blue-700">In this locality</div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="text-orange-600" size={18} />
                      <span className="font-semibold text-orange-800">Investment Timing</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600 mb-1">Excellent</div>
                    <div className="text-sm text-orange-700">Buy now recommended</div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 blur-md">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="text-green-600" size={18} />
                        <span className="font-semibold text-green-800">Price Appreciation</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600 mb-1">+••.•%</div>
                      <div className="text-sm text-green-700">Expected in next 12 months</div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <PieChart className="text-blue-600" size={18} />
                        <span className="font-semibold text-blue-800">Market Position</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mb-1">Top ••%</div>
                      <div className="text-sm text-blue-700">In this locality</div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="text-orange-600" size={18} />
                        <span className="font-semibold text-orange-800">Investment Timing</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-600 mb-1">••••••••</div>
                      <div className="text-sm text-orange-700">Buy now recommended</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center bg-white bg-opacity-95 p-6 rounded-xl shadow-lg border border-gray-200">
                      <Lock className="text-blue-600 mx-auto mb-3" size={32} />
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Premium AI Insights</h3>
                      <p className="text-gray-600 mb-4">Get detailed recommendations and market analysis</p>
                      <button
                        onClick={() => handlePaywallOpen('ai-recommendations')}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                      >
                        Unlock for ₹299
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Property Description</h2>
              <p className="text-gray-700 leading-relaxed">
                {property.description ||
                  'This stunning luxury property offers an exceptional living experience in one of Mumbai\'s most prestigious neighborhoods. Featuring spacious interiors, premium finishes, and modern amenities. Premium facilities and world-class amenities make this an ideal choice for discerning buyers.'}
              </p>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Premium Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenities.map((amenity: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                    {getAmenityIcon(amenity)}
                    <span className="text-gray-700 text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location & Nearby */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Location & Connectivity</h2>
              <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin size={48} className="mx-auto mb-2" />
                  <p>Interactive Map Coming Soon</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Transportation</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Bandra Station - 0.5 km</li>
                    <li>• Airport - 8 km</li>
                    <li>• Highway Access - 1 km</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Essential Services</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Shopping Mall - 0.3 km</li>
                    <li>• Hospital - 1.2 km</li>
                    <li>• School - 0.8 km</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Customer Reviews</h2>
              <div className="flex items-center mb-6">
                <div className="flex items-center space-x-1 mr-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={20} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900">4.8</span>
                <span className="text-gray-600 ml-2">(24 reviews)</span>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Rajesh Kumar', rating: 5, comment: 'Excellent property with great amenities. Highly recommended!', date: '2 days ago' },
                  { name: 'Priya Sharma', rating: 4, comment: 'Beautiful location and well-maintained property.', date: '1 week ago' },
                  { name: 'Amit Patel', rating: 5, comment: 'Perfect for families. Great connectivity and facilities.', date: '2 weeks ago' }
                ].map((review, index) => (
                  <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                          <User size={16} className="text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">{review.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Contact Agent */}
            <div className="bg-white rounded-xl shadow-sm p-5 sticky top-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{property.agent?.name || 'Rohit Sharma'}</h3>
                  <p className="text-gray-600 text-sm">Senior Property Consultant</p>
                  <div className="flex items-center mt-1">
                    <Star size={14} className="text-yellow-400 fill-current mr-1" />
                    <span className="text-xs text-gray-600">4.9 (127 reviews)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm">
                  <Phone size={16} />
                  <span>Call Agent</span>
                </button>
                <button
                  onClick={() => setShowContactForm(true)}
                  className="w-full bg-gray-100 text-gray-900 py-2.5 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2 text-sm"
                >
                  <MessageCircle size={16} />
                  <span>Send Message</span>
                </button>
                <button className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm">
                  <Calendar size={16} />
                  <span>Schedule Visit</span>
                </button>
              </div>

              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <button
                  onClick={() => {
                    const message = `Hi! I'm interested in ${property.title} at ${property.location}. Price: ${formatCurrency(property.price)}. Can you provide more details?`;
                    if (typeof window !== 'undefined') {
                      window.open(`https://wa.me/919999999999?text=${encodeURIComponent(message)}`, '_blank');
                    }
                  }}
                  className="w-full bg-green-500 text-white py-2.5 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 text-sm"
                >
                  <MessageCircle size={16} />
                  <span>Chat on WhatsApp</span>
                </button>
              </div>
            </div>

            {/* AI Investment Analysis */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-sm p-5 relative">
              <div className="flex items-center space-x-2 mb-4">
                <Bot className="text-purple-600" size={20} />
                <h3 className="font-bold text-gray-900">AI Investment Analysis</h3>
              </div>

              {hasSubscription ? (
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Purchase Recommendation</span>
                      <span className="font-bold text-green-600">Strong Buy</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Expected ROI (5 years)</span>
                      <span className="font-bold text-blue-600">18.2%</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Risk Level</span>
                      <span className="font-bold text-yellow-600">Low</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Market Timing</span>
                      <span className="font-bold text-purple-600">Excellent</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-white rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Sparkles className="text-purple-600 mt-0.5" size={16} />
                      <div>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          <strong>AI Insight:</strong> This property is in the top 5% for investment potential in this area. Current market conditions favor immediate purchase.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="space-y-3 blur-sm">
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Purchase Recommendation</span>
                        <span className="font-bold text-green-600">•••••• •••</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Expected ROI (5 years)</span>
                        <span className="font-bold text-blue-600">••.•%</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Risk Level</span>
                        <span className="font-bold text-yellow-600">•••</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Market Timing</span>
                        <span className="font-bold text-purple-600">••••••••••</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center bg-white bg-opacity-95 p-4 rounded-xl shadow-lg border border-gray-200">
                      <Crown className="text-purple-600 mx-auto mb-2" size={28} />
                      <h4 className="font-bold text-gray-900 mb-1">Investment Analysis</h4>
                      <p className="text-xs text-gray-600 mb-3">Get AI-powered investment insights</p>
                      <button
                        onClick={() => handlePaywallOpen('ai-investment')}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:shadow-lg transition-all"
                      >
                        Unlock ₹299
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Property Highlights */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">Property Highlights</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Building className="text-blue-600" size={16} />
                    <span className="text-sm font-medium text-gray-600">Property Type</span>
                  </div>
                  <div className="font-semibold text-gray-900">{property.type || 'Villa'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="text-green-600" size={16} />
                    <span className="text-sm font-medium text-gray-600">Built Year</span>
                  </div>
                  <div className="font-semibold text-gray-900">{property.builtYear || '2020'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Home className="text-purple-600" size={16} />
                    <span className="text-sm font-medium text-gray-600">Furnishing</span>
                  </div>
                  <div className="font-semibold text-gray-900">{property.furnishing || 'Semi-Furnished'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="text-orange-600" size={16} />
                    <span className="text-sm font-medium text-gray-600">Facing</span>
                  </div>
                  <div className="font-semibold text-gray-900">{property.facing || 'North-East'}</div>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">Price Breakdown</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Base Price</span>
                  <span className="font-medium text-gray-900">{formatCurrency(property.price || 25000000)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Maintenance (Annual)</span>
                  <span className="font-medium text-gray-900">₹2.4L</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Registration</span>
                  <span className="font-medium text-gray-900">₹2.5L</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Stamp Duty</span>
                  <span className="font-medium text-gray-900">₹15L</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Society Charges</span>
                  <span className="font-medium text-gray-900">₹3L</span>
                </div>
                <div className="border-t pt-3 flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Total Cost</span>
                  <span className="font-bold text-blue-600 text-lg">
                    {formatCurrency((property.price || 25000000) + 240000 + 250000 + 1500000 + 300000)}
                  </span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <Calculator size={16} className="mr-1" />
                  Smart EMI Calculator
                </h4>
                <div className="text-sm text-blue-800">
                  <p>For ₹20L loan at 8.5% for 20 years:</p>
                  <p className="font-bold">Monthly EMI: ₹17,456</p>
                </div>
              </div>
            </div>

            {/* Interest & Shortlisted */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">Property Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Eye className="text-green-600" size={16} />
                    <span className="text-sm font-medium text-gray-700">Total Views</span>
                  </div>
                  <span className="font-bold text-green-600">{property.views || 245}</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Heart className="text-blue-600" size={16} />
                    <span className="text-sm font-medium text-gray-700">Shortlisted By</span>
                  </div>
                  <span className="font-bold text-blue-600">23 People</span>
                </div>

                <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Phone className="text-orange-600" size={16} />
                    <span className="text-sm font-medium text-gray-700">Contact Requests</span>
                  </div>
                  <span className="font-bold text-orange-600">12 This Week</span>
                </div>
              </div>
            </div>

            {/* Similar Properties */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-4">Similar Properties</h3>
              <div className="space-y-4">
                {[
                  { title: 'Modern Apartment', price: 18000000, location: 'Andheri West', image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg' },
                  { title: 'Luxury Penthouse', price: 35000000, location: 'Worli', image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg' }
                ].map((similar, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
                    <img src={similar.image} alt={similar.title} className="w-12 h-12 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{similar.title}</h4>
                      <p className="text-xs text-gray-600 flex items-center">
                        <MapPin size={12} className="mr-1" />
                        {similar.location}
                      </p>
                      <p className="text-xs font-semibold text-blue-600">{formatCurrency(similar.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Contact Agent</h3>
              <button
                onClick={() => setShowContactForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="I'm interested in this property..."
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Paywall Modal */}
      <AIPaywallOverlay
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSubscribe={handleSubscribe}
        featureType={paywallFeature}
      />
    </div>
  );
};

export default PublicPropertyDetailPage;


