// import React, { useState, useEffect } from 'react';
// import {
//   Home,
//   Search,
//   MapPin,
//   Building,
//   Star,
//   CheckCircle,
//   ArrowRight,
//   Phone,
//   Shield,
//   TrendingUp,
//   Eye,
//   Heart,
//   ChevronLeft,
//   ChevronRight,
//   Camera,
//   DollarSign,
//   Target,
//   Users,
//   Award,
//   Zap,
//   Brain,
//   BarChart3,
//   Sparkles,
//   Bot,
//   Car,
//   Wifi,
//   Dumbbell,
//   TreePine
// } from 'lucide-react';
// import SubscriptionModal from '@/components/subscription/SubscriptionModal';
// import { Link } from 'react-router-dom';
// import PublicPropertyDetailPage from './PublicPropertyDetailPage';
// import { propertiesAPI } from '@/lib/propertiesAPI';
// const HomePage = ({ onPageChange, onPropertyView, onAuthAction }: any) => {
//   // All hooks must be declared at the top, before any early returns
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedLocation, setSelectedLocation] = useState('');
//   const [selectedBudget, setSelectedBudget] = useState('');
//   const [selectedPropertyType, setSelectedPropertyType] = useState('');
//   const [featuredIndex, setFeaturedIndex] = useState(0);
//   const [isSubOpen, setIsSubOpen] = useState(false);
//   const [currentPropertyView, setCurrentPropertyView] = useState('');

//   // Move useEffect to the top as well
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setFeaturedIndex((prev) => (prev + 1) % featuredProperties.length);
//     }, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   // Define all functions after hooks
//   const handleViewProperty = (property) => setCurrentPropertyView(property);

//   const internalAuthAction = (action: string) => {
//     if (action === 'subscribe') {
//       setIsSubOpen(true);
//     }
//     // preserve external callback too:
//     if (onAuthAction) onAuthAction(action);
//   };

//   const featuredProperties = [
//     {
//       id: 'PROP001',
//       title: 'Luxury 3BHK Apartment',
//       location: 'Andheri West, Mumbai',
//       price: 25000000,
//       area: 1250,
//       bedrooms: 3,
//       bathrooms: 3,
//       type: '3BHK',
//       amenities: ['Swimming Pool', 'Gym', 'Security', 'Garden'],
//       image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
//       featured: true,
//       badge: 'Premium',
//       rating: 4.8,
//       views: 245,
//       aiScore: 92
//     },
//     {
//       id: 'PROP002',
//       title: 'Sea View Penthouse',
//       location: 'Bandra West, Mumbai',
//       price: 45000000,
//       area: 2200,
//       bedrooms: 4,
//       bathrooms: 4,
//       type: '4BHK',
//       amenities: ['Sea View', 'Private Terrace', 'Concierge'],
//       image: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=800',
//       featured: true,
//       badge: 'Luxury',
//       rating: 4.9,
//       views: 189,
//       aiScore: 96
//     },
//     {
//       id: 'PROP003',
//       title: 'Family Villa',
//       location: 'Juhu, Mumbai',
//       price: 65000000,
//       area: 3500,
//       bedrooms: 5,
//       bathrooms: 5,
//       type: 'Villa',
//       amenities: ['Private Garden', 'Pool', 'Theater'],
//       image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800',
//       featured: true,
//       badge: 'Exclusive',
//       rating: 5.0,
//       views: 156,
//       aiScore: 98
//     }
//   ];

//   const locations = ['Andheri West', 'Bandra West', 'Juhu', 'Powai', 'Worli'];
//   const budgetRanges = [
//     { value: '0-50L', label: 'Under ₹50L' },
//     { value: '50L-1Cr', label: '₹50L - ₹1Cr' },
//     { value: '1Cr-2Cr', label: '₹1Cr - ₹2Cr' },
//     { value: '2Cr+', label: '₹2Cr+' }
//   ];
//   const propertyTypes = ['1BHK', '2BHK', '3BHK', '4BHK', 'Villa'];

//   const formatCurrency = (amount: number) => {
//     if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
//     if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
//     return `₹${amount.toLocaleString('en-IN')}`;
//   };

//   const nextFeatured = () => {
//     setFeaturedIndex((prev) => (prev + 1) % featuredProperties.length);
//   };

//   const previousFeatured = () => {
//     setFeaturedIndex((prev) => (prev - 1 + featuredProperties.length) % featuredProperties.length);
//   };

//   // Now the early return can happen after all hooks
//   if (currentPropertyView) {
//     return (
//       <PublicPropertyDetailPage
//         property={currentPropertyView}
//       />
//     );
//   }

//   return (
//     <div className="min-h-screen">
//       {/* Compact Hero Section */}
//       <section className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
//         <div className="absolute inset-0 bg-black bg-opacity-30"></div>
//         <div
//           className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
//           style={{
//             backgroundImage: `url(${featuredProperties[featuredIndex].image})`,
//             filter: 'brightness(0.3)'
//           }}
//         ></div>

//         <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
//           <div className="text-center">
//             <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
//               Find Your
//               <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
//                 Dream Property
//               </span>
//             </h1>
//             <p className="text-lg sm:text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
//               AI-powered property search in Mumbai's premium locations
//             </p>

//             {/* Compact Search Bar */}
//             <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl max-w-4xl mx-auto">
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                   <input
//                     type="text"
//                     placeholder="Search properties..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
//                   />
//                 </div>
//                 <select
//                   value={selectedLocation}
//                   onChange={(e) => setSelectedLocation(e.target.value)}
//                   className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
//                 >
//                   <option value="">Location</option>
//                   {locations.map((location) => (
//                     <option key={location} value={location}>{location}</option>
//                   ))}
//                 </select>
//                 <select
//                   value={selectedBudget}
//                   onChange={(e) => setSelectedBudget(e.target.value)}
//                   className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
//                 >
//                   <option value="">Budget</option>
//                   {budgetRanges.map((range) => (
//                     <option key={range.value} value={range.value}>{range.label}</option>
//                   ))}
//                 </select>
//                 <button
//                   onClick={() => onPageChange('properties')}
//                   className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold text-sm"
//                 >
//                   Search
//                 </button>
//               </div>

//               <div className="flex flex-wrap gap-2 mt-4 justify-center">
//                 {propertyTypes.map((type) => (
//                   <button
//                     key={type}
//                     onClick={() => setSelectedPropertyType(type)}
//                     className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${selectedPropertyType === type
//                         ? 'bg-blue-100 text-blue-700'
//                         : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                       }`}
//                   >
//                     {type}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Compact Stats */}
//             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 text-center">
//               <div>
//                 <div className="text-xl sm:text-2xl font-bold">10K+</div>
//                 <div className="text-blue-200 text-sm">Properties</div>
//               </div>
//               <div>
//                 <div className="text-xl sm:text-2xl font-bold">25K+</div>
//                 <div className="text-blue-200 text-sm">Customers</div>
//               </div>
//               <div>
//                 <div className="text-xl sm:text-2xl font-bold">15+</div>
//                 <div className="text-blue-200 text-sm">Years</div>
//               </div>
//               <div>
//                 <div className="text-xl sm:text-2xl font-bold">4.9★</div>
//                 <div className="text-blue-200 text-sm">Rating</div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Navigation */}
//         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
//           {featuredProperties.map((_, index) => (
//             <button
//               key={index}
//               onClick={() => setFeaturedIndex(index)}
//               className={`w-2 h-2 rounded-full transition-all ${index === featuredIndex ? 'bg-white' : 'bg-white bg-opacity-50'
//                 }`}
//             />
//           ))}
//         </div>

//         <button
//           onClick={previousFeatured}
//           className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30"
//         >
//           <ChevronLeft className="text-white" size={20} />
//         </button>
//         <button
//           onClick={nextFeatured}
//           className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30"
//         >
//           <ChevronRight className="text-white" size={20} />
//         </button>
//       </section>

//       {/* AI Insights Section */}
//       <section className="py-12 bg-gradient-to-r from-gray-50 to-blue-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-8">
//             <div className="flex items-center justify-center space-x-2 mb-4">
//               <Brain className="text-purple-600" size={28} />
//               <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">AI Market Intelligence</h2>
//             </div>
//             <p className="text-gray-600 max-w-2xl mx-auto">
//               Real-time market analysis powered by advanced AI algorithms
//             </p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
//               <div className="flex items-center space-x-3 mb-4">
//                 <div className="p-2 bg-green-100 rounded-lg">
//                   <TrendingUp className="text-green-600" size={20} />
//                 </div>
//                 <h3 className="font-semibold text-gray-900">Price Trends</h3>
//               </div>
//               <div className="space-y-2">
//                 <div className="text-2xl font-bold text-green-600">+12.5%</div>
//                 <div className="text-sm text-gray-600">Andheri West growth</div>
//                 <div className="text-xs text-gray-500">Last 6 months</div>
//               </div>
//             </div>

//             <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
//               <div className="flex items-center space-x-3 mb-4">
//                 <div className="p-2 bg-blue-100 rounded-lg">
//                   <Target className="text-blue-600" size={20} />
//                 </div>
//                 <h3 className="font-semibold text-gray-900">Best ROI</h3>
//               </div>
//               <div className="space-y-2">
//                 <div className="text-2xl font-bold text-blue-600">18.2%</div>
//                 <div className="text-sm text-gray-600">Bandra West</div>
//                 <div className="text-xs text-gray-500">Annual returns</div>
//               </div>
//             </div>

//             <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
//               <div className="flex items-center space-x-3 mb-4">
//                 <div className="p-2 bg-purple-100 rounded-lg">
//                   <BarChart3 className="text-purple-600" size={20} />
//                 </div>
//                 <h3 className="font-semibold text-gray-900">Market Heat</h3>
//               </div>
//               <div className="space-y-2">
//                 <div className="text-2xl font-bold text-purple-600">Hot</div>
//                 <div className="text-sm text-gray-600">Powai sector</div>
//                 <div className="text-xs text-gray-500">High demand</div>
//               </div>
//             </div>

//             <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
//               <div className="flex items-center space-x-3 mb-4">
//                 <div className="p-2 bg-orange-100 rounded-lg">
//                   <Sparkles className="text-orange-600" size={20} />
//                 </div>
//                 <h3 className="font-semibold text-gray-900">AI Score</h3>
//               </div>
//               <div className="space-y-2">
//                 <div className="text-2xl font-bold text-orange-600">94/100</div>
//                 <div className="text-sm text-gray-600">Juhu properties</div>
//                 <div className="text-xs text-gray-500">Investment grade</div>
//               </div>
//             </div>
//           </div>

//           <div className="text-center mt-8">
//             <button
//               onClick={() => internalAuthAction('subscribe')}
//               className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
//             >
//               Get Full AI Report
//             </button>

//             <SubscriptionModal isOpen={isSubOpen} onClose={() => setIsSubOpen(false)} />
//           </div>
//         </div>
//       </section>

//       {/* Featured Properties - Compact */}
//       <section className="py-12 bg-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-8">
//             <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Featured Properties</h2>
//             <p className="text-gray-600">Handpicked premium properties with AI recommendations</p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {featuredProperties.map((property, index) => (
//               <div
//                 key={property.id}
//                 className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer"
//                 onClick={() => onPropertyView(property)}
//               >
//                 <div className="relative">
//                   <img
//                     src={property.image}
//                     alt={property.title}
//                     className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
//                   />
//                   <div className="absolute top-4 left-4">
//                     <span className={`px-3 py-1 rounded-full text-white text-sm font-bold ${property.badge === 'Premium' ? 'bg-blue-500' :
//                       property.badge === 'Luxury' ? 'bg-purple-500' :
//                         'bg-orange-500'
//                       }`}>
//                       {property.badge}
//                     </span>
//                   </div>
//                   <div className="absolute top-4 right-4 flex space-x-2">
//                     <button className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all">
//                       <Heart className="text-red-500" size={16} />
//                     </button>
//                     <button className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all">
//                       <Eye className="text-blue-500" size={16} />
//                     </button>
//                   </div>
//                   <div className="absolute bottom-4 left-4 flex items-center space-x-2">
//                     <div className="flex items-center space-x-1 bg-white bg-opacity-90 rounded-full px-2 py-1">
//                       <Star className="text-yellow-500 fill-current" size={12} />
//                       <span className="text-xs font-bold text-gray-900">{property.rating}</span>
//                     </div>
//                     <div className="bg-white bg-opacity-90 rounded-full px-2 py-1">
//                       <span className="text-xs font-bold text-gray-900">{property.views} views</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="p-6">
//                   <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
//                     {property.title}
//                   </h3>
//                   <div className="flex items-center text-gray-600 mb-4">
//                     <MapPin size={16} className="mr-2" />
//                     <span>{property.location}</span>
//                   </div>

//                   <div className="flex items-center justify-between mb-4">
//                     <div>
//                       <div className="text-3xl font-bold text-green-600">{formatCurrency(property.price)}</div>
//                       <div className="text-sm text-gray-500">{property.type} • {property.area} sq ft</div>
//                     </div>
//                     <div className="text-right">
//                       <div className="text-sm text-gray-500">Price per sq ft</div>
//                       <div className="font-semibold text-gray-900">₹{Math.round(property.price / property.area).toLocaleString()}</div>
//                     </div>
//                   </div>

//                   <div className="flex flex-wrap gap-2 mb-4">
//                     {property.amenities.slice(0, 3).map((amenity: string, i: number) => (
//                       <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
//                         {amenity}
//                       </span>
//                     ))}
//                     {property.amenities.length > 3 && (
//                       <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
//                         +{property.amenities.length - 3} more
//                       </span>
//                     )}
//                   </div>

//                   <div className="flex items-center space-x-3">
//                     <button
//                       onClick={() => handleViewProperty(property)}
//                       className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
//                     >
//                       View Details
//                     </button>
//                     <button className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
//                       <Phone size={16} className="text-gray-600" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="text-center mt-12">
//             <Link to="/properties">
//               <button
//                 onClick={() => onPageChange('properties')}
//                 className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
//               >
//                 View All Properties
//               </button>
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Sell Property CTA - Compact */}
//       <section className="py-12 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
//             <div>
//               <h2 className="text-2xl sm:text-3xl font-bold mb-4">
//                 Sell Your Property with AI Pricing
//               </h2>
//               <p className="text-green-100 mb-6">
//                 Get the best price with our AI-powered valuation and reach verified buyers instantly.
//               </p>

//               <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
//                 <div className="flex items-center space-x-2">
//                   <CheckCircle className="text-green-300" size={16} />
//                   <span>AI Price Optimization</span>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <CheckCircle className="text-green-300" size={16} />
//                   <span>Verified Buyers</span>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <CheckCircle className="text-green-300" size={16} />
//                   <span>Free Photography</span>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <CheckCircle className="text-green-300" size={16} />
//                   <span>Legal Support</span>
//                 </div>
//               </div>

//               <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
//                 <button
//                   onClick={() => onAuthAction('sell')}
//                   className="bg-white text-green-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all"
//                 >
//                   List My Property
//                 </button>
//                 <button className="border-2 border-white text-white px-6 py-3 rounded-xl font-bold hover:bg-white hover:text-green-600 transition-all">
//                   Free Valuation
//                 </button>
//               </div>
//             </div>

//             <div className="relative">
//               <img
//                 src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600"
//                 alt="Sell Property"
//                 className="rounded-2xl shadow-xl"
//               />
//               <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg">
//                 <div className="flex items-center space-x-3">
//                   <div className="p-2 bg-green-100 rounded-lg">
//                     <DollarSign className="text-green-600" size={20} />
//                   </div>
//                   <div>
//                     <div className="text-lg font-bold text-gray-900">₹500Cr+</div>
//                     <div className="text-xs text-gray-600">Properties Sold</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Why Choose Us - Compact */}
//       <section className="py-12 bg-gray-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-8">
//             <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Why Choose ResaleExpert?</h2>
//             <p className="text-gray-600">AI-powered real estate platform trusted by thousands</p>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="text-center group">
//               <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all">
//                 <Shield className="text-white" size={24} />
//               </div>
//               <h3 className="text-lg font-bold text-gray-900 mb-3">100% Verified</h3>
//               <p className="text-gray-600 text-sm">
//                 Every property verified for legal compliance and authenticity.
//               </p>
//             </div>

//             <div className="text-center group">
//               <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all">
//                 <Brain className="text-white" size={24} />
//               </div>
//               <h3 className="text-lg font-bold text-gray-900 mb-3">AI-Powered</h3>
//               <p className="text-gray-600 text-sm">
//                 Smart property matching based on your preferences and budget.
//               </p>
//             </div>

//             <div className="text-center group">
//               <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all">
//                 <Users className="text-white" size={24} />
//               </div>
//               <h3 className="text-lg font-bold text-gray-900 mb-3">Expert Support</h3>
//               <p className="text-gray-600 text-sm">
//                 Dedicated real estate experts guide you throughout the process.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Stats - Compact */}
//       <section className="py-8 bg-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
//             <div className="group">
//               <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
//                 <Home className="text-blue-600" size={20} />
//               </div>
//               <div className="text-2xl font-bold text-gray-900">10K+</div>
//               <div className="text-gray-600 text-sm">Properties</div>
//             </div>
//             <div className="group">
//               <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
//                 <Users className="text-green-600" size={20} />
//               </div>
//               <div className="text-2xl font-bold text-gray-900">25K+</div>
//               <div className="text-gray-600 text-sm">Customers</div>
//             </div>
//             <div className="group">
//               <div className="bg-orange-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
//                 <Award className="text-orange-600" size={20} />
//               </div>
//               <div className="text-2xl font-bold text-gray-900">15+</div>
//               <div className="text-gray-600 text-sm">Years</div>
//             </div>
//             <div className="group">
//               <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
//                 <Star className="text-purple-600" size={20} />
//               </div>
//               <div className="text-2xl font-bold text-gray-900">4.9★</div>
//               <div className="text-gray-600 text-sm">Rating</div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Testimonials - Compact */}
//       <section className="py-12 bg-gray-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-8">
//             <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Customer Success Stories</h2>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {[
//               {
//                 name: 'Rajesh Kumar',
//                 text: 'Found my dream home in 2 weeks with AI matching!',
//                 rating: 5,
//                 property: '3BHK Andheri'
//               },
//               {
//                 name: 'Priya Sharma',
//                 text: 'Sold my property 20% above market rate with their AI pricing.',
//                 rating: 5,
//                 property: 'Villa Koregaon'
//               },
//               {
//                 name: 'Amit Patel',
//                 text: 'Seamless process from search to registration.',
//                 rating: 5,
//                 property: '2BHK Gurgaon'
//               }
//             ].map((testimonial, index) => (
//               <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
//                 <div className="flex items-center space-x-1 mb-3">
//                   {Array.from({ length: 5 }, (_, i) => (
//                     <Star key={i} size={14} className="text-yellow-400 fill-current" />
//                   ))}
//                 </div>
//                 <p className="text-gray-700 mb-4 text-sm italic">"{testimonial.text}"</p>
//                 <div className="flex items-center space-x-3">
//                   <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
//                     {testimonial.name.split(' ').map(n => n[0]).join('')}
//                   </div>
//                   <div>
//                     <div className="font-semibold text-gray-900 text-sm">{testimonial.name}</div>
//                     <div className="text-xs text-gray-500">{testimonial.property}</div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA - Compact */}
//       <section className="py-12 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <h2 className="text-2xl sm:text-3xl font-bold mb-4">
//             Ready to Find Your Perfect Property?
//           </h2>
//           <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
//             Join thousands who found their dream properties with AI-powered search
//           </p>

//           <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
//             <button
//               onClick={() => onPageChange('properties')}
//               className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all"
//             >
//               Browse Properties
//             </button>
//             <button
//               onClick={() => onAuthAction('sell')}
//               className="border-2 border-white text-white px-6 py-3 rounded-xl font-bold hover:bg-white hover:text-blue-600 transition-all"
//             >
//               Sell Property
//             </button>
//           </div>

//           <div className="mt-8 flex items-center justify-center space-x-6 text-blue-100 text-sm">
//             <div className="flex items-center space-x-1">
//               <Phone size={16} />
//               <span>+91 99999 99999</span>
//             </div>
//             <div className="flex items-center space-x-1">
//               <Shield size={16} />
//               <span>100% Verified</span>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default HomePage;



import React, { useState, useEffect } from 'react';
import {
  Home,
  Search,
  MapPin,
  Building,
  Star,
  CheckCircle,
  ArrowRight,
  Phone,
  Shield,
  TrendingUp,
  Eye,
  Heart,
  ChevronLeft,
  ChevronRight,
  Camera,
  DollarSign,
  Target,
  Users,
  Award,
  Zap,
  Brain,
  BarChart3,
  Sparkles,
  Bot,
  Car,
  Wifi,
  Dumbbell,
  TreePine
} from 'lucide-react';
import SubscriptionModal from '@/components/subscription/SubscriptionModal';
import { Link } from 'react-router-dom';
import PublicPropertyDetailPage from './PublicPropertyDetailPage';
import { propertiesAPI } from '@/lib/propertiesAPI';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Property {
  id: number;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  city: string;
  property_type: string;
  status: string;
  images?: string[];
  location?: string;
  area?: number;
  type?: string;
  amenities?: string[];
  badge?: string;
  rating?: number;
  views?: number;
  aiScore?: number;
}

const HomePage = ({ onPageChange, onPropertyView, onAuthAction }: any) => {
  // All hooks must be declared at the top, before any early returns
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedPropertyType, setSelectedPropertyType] = useState('');
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isSubOpen, setIsSubOpen] = useState(false);
  const [currentPropertyView, setCurrentPropertyView] = useState('');

  // System settings context
  const { systemSettings } = useSystemSettings();
  const companyName = systemSettings?.company_name || 'ResaleExpert';

  // Fetch featured properties from API
  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        const response = await propertiesAPI.getProperties({
          status: 'Available',
          limit: 6,
        });
        console.log("API Response:", response);

        if (response?.data && Array.isArray(response.data)) {
          const properties = response.data.map((p: any) => ({
            id: p.id,
            title: p.title || `${p.unit_type || ''} ${p.property_type_name || ''}`,
            price: Number(p.budget) || 0,
            bedrooms: Number(p.bedrooms) || 0,
            bathrooms: Number(p.bathrooms) || 0,
            square_feet: Number(p.carpet_area) || Number(p.builtup_area) || 0,
            city: p.city_name || p.city || '',
            property_type: p.property_type_name || p.property_type || '',
            status: p.status || '',
            images: Array.isArray(p.photos) ? p.photos.map((ph: string) => ph.replace(/\\/g, '/')) : [],
            // Additional fields for enhanced display
            location: `${p.city_name || p.city || ''}, ${p.state || 'Mumbai'}`,
            area: Number(p.carpet_area) || Number(p.builtup_area) || 0,
            type: p.property_type_name || p.property_type || '',
            amenities: p.amenities ? (Array.isArray(p.amenities) ? p.amenities : p.amenities.split(',')) : ['Swimming Pool', 'Gym', 'Security'],
            badge: p.featured ? 'Premium' : 'Standard',
            rating: 4.5 + Math.random() * 0.5, // Generate random rating between 4.5-5.0
            views: Math.floor(Math.random() * 300) + 100, // Generate random views
            aiScore: Math.floor(Math.random() * 20) + 80 // Generate AI score between 80-100
          }));
          setFeaturedProperties(properties);
        } else {
          console.warn('Unexpected response data:', response);
          // Fallback to static data if API fails
          setFeaturedProperties(getStaticProperties());
        }
      } catch (error) {
        console.error('Error fetching featured properties:', error);
        // Fallback to static data on error
        setFeaturedProperties(getStaticProperties());
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  // Carousel effect for featured properties
  useEffect(() => {
    if (featuredProperties.length > 0) {
      const interval = setInterval(() => {
        setFeaturedIndex((prev) => (prev + 1) % featuredProperties.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [featuredProperties.length]);

  // Fallback static properties
  // const getStaticProperties = () => [
  //   {
  //     id: 1,
  //     title: 'Luxury 3BHK Apartment',
  //     location: 'Andheri West, Mumbai',
  //     price: 25000000,
  //     area: 1250,
  //     bedrooms: 3,
  //     bathrooms: 3,
  //     type: '3BHK',
  //     amenities: ['Swimming Pool', 'Gym', 'Security', 'Garden'],
  //     images: ['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'],
  //     badge: 'Premium',
  //     rating: 4.8,
  //     views: 245,
  //     aiScore: 92,
  //     square_feet: 1250,
  //     city: 'Mumbai',
  //     property_type: 'Apartment',
  //     status: 'Available'
  //   },
  //   {
  //     id: 2,
  //     title: 'Sea View Penthouse',
  //     location: 'Bandra West, Mumbai',
  //     price: 45000000,
  //     area: 2200,
  //     bedrooms: 4,
  //     bathrooms: 4,
  //     type: '4BHK',
  //     amenities: ['Sea View', 'Private Terrace', 'Concierge'],
  //     images: ['https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=800'],
  //     badge: 'Luxury',
  //     rating: 4.9,
  //     views: 189,
  //     aiScore: 96,
  //     square_feet: 2200,
  //     city: 'Mumbai',
  //     property_type: 'Penthouse',
  //     status: 'Available'
  //   },
  //   {
  //     id: 3,
  //     title: 'Family Villa',
  //     location: 'Juhu, Mumbai',
  //     price: 65000000,
  //     area: 3500,
  //     bedrooms: 5,
  //     bathrooms: 5,
  //     type: 'Villa',
  //     amenities: ['Private Garden', 'Pool', 'Theater'],
  //     images: ['https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800'],
  //     badge: 'Exclusive',
  //     rating: 5.0,
  //     views: 156,
  //     aiScore: 98,
  //     square_feet: 3500,
  //     city: 'Mumbai',
  //     property_type: 'Villa',
  //     status: 'Available'
  //   }
  // ];

  // Define all functions after hooks
  const handleViewProperty = (property) => setCurrentPropertyView(property);

  const internalAuthAction = (action: string) => {
    if (action === 'subscribe') {
      setIsSubOpen(true);
    }
    // preserve external callback too:
    if (onAuthAction) onAuthAction(action);
  };

  const locations = ['Andheri West', 'Bandra West', 'Juhu', 'Powai', 'Worli'];
  const budgetRanges = [
    { value: '0-50L', label: 'Under ₹50L' },
    { value: '50L-1Cr', label: '₹50L - ₹1Cr' },
    { value: '1Cr-2Cr', label: '₹1Cr - ₹2Cr' },
    { value: '2Cr+', label: '₹2Cr+' }
  ];
  const propertyTypes = ['1BHK', '2BHK', '3BHK', '4BHK', 'Villa'];

  // Format price in Indian currency format
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lakh`;
    } else if (price >= 1000) {
      return `₹${(price / 1000).toFixed(2)} K`;
    }
    return `₹${price}`;
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const nextFeatured = () => {
    setFeaturedIndex((prev) => (prev + 1) % featuredProperties.length);
  };

  const previousFeatured = () => {
    setFeaturedIndex((prev) => (prev - 1 + featuredProperties.length) % featuredProperties.length);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery && onPageChange) {
      onPageChange('properties', { search: trimmedQuery });
    }
  };

  // Now the early return can happen after all hooks
  if (currentPropertyView) {
    return (
      <PublicPropertyDetailPage
        property={currentPropertyView}
      />
    );
  }

  return (
    <div className="min-h-screen">
      {/* Compact Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        {featuredProperties.length > 0 && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
            style={{
              backgroundImage: `url(${featuredProperties[featuredIndex]?.images?.[0] || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'})`,
              filter: 'brightness(0.3)'
            }}
          ></div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Find Your
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Dream Property
              </span>
            </h1>
            <p className="text-lg sm:text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              AI-powered property search in Mumbai's premium locations
            </p>

            {/* Compact Search Bar */}
            <form onSubmit={handleSearch} className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl max-w-4xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search properties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
                  />
                </div>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
                >
                  <option value="">Location</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                <select
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
                >
                  <option value="">Budget</option>
                  {budgetRanges.map((range) => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold text-sm"
                >
                  Search
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {propertyTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedPropertyType(type)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${selectedPropertyType === type
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </form>

            {/* Compact Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 text-center">
              <div>
                <div className="text-xl sm:text-2xl font-bold">10K+</div>
                <div className="text-blue-200 text-sm">Properties</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold">25K+</div>
                <div className="text-blue-200 text-sm">Customers</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold">15+</div>
                <div className="text-blue-200 text-sm">Years</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold">4.9★</div>
                <div className="text-blue-200 text-sm">Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        {featuredProperties.length > 0 && (
          <>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {featuredProperties.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setFeaturedIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${index === featuredIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                />
              ))}
            </div>

            <button
              onClick={previousFeatured}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30"
            >
              <ChevronLeft className="text-white" size={20} />
            </button>
            <button
              onClick={nextFeatured}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30"
            >
              <ChevronRight className="text-white" size={20} />
            </button>
          </>
        )}
      </section>

      {/* AI Insights Section */}
      <section className="py-12 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Brain className="text-purple-600" size={28} />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">AI Market Intelligence</h2>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real-time market analysis powered by advanced AI algorithms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="text-green-600" size={20} />
                </div>
                <h3 className="font-semibold text-gray-900">Price Trends</h3>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-600">+12.5%</div>
                <div className="text-sm text-gray-600">Andheri West growth</div>
                <div className="text-xs text-gray-500">Last 6 months</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="text-blue-600" size={20} />
                </div>
                <h3 className="font-semibold text-gray-900">Best ROI</h3>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-600">18.2%</div>
                <div className="text-sm text-gray-600">Bandra West</div>
                <div className="text-xs text-gray-500">Annual returns</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="text-purple-600" size={20} />
                </div>
                <h3 className="font-semibold text-gray-900">Market Heat</h3>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-purple-600">Hot</div>
                <div className="text-sm text-gray-600">Powai sector</div>
                <div className="text-xs text-gray-500">High demand</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Sparkles className="text-orange-600" size={20} />
                </div>
                <h3 className="font-semibold text-gray-900">AI Score</h3>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-orange-600">94/100</div>
                <div className="text-sm text-gray-600">Juhu properties</div>
                <div className="text-xs text-gray-500">Investment grade</div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => internalAuthAction('subscribe')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Get Full AI Report
            </button>

            <SubscriptionModal isOpen={isSubOpen} onClose={() => setIsSubOpen(false)} />
          </div>
        </div>
      </section>

      {/* Featured Properties - Dynamic Data */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Featured Properties</h2>
            <p className="text-gray-600">Handpicked premium properties with AI recommendations</p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property, index) => (
                <div
                  key={property.id}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer"
                  onClick={() => onPropertyView && onPropertyView(property)}
                >
                  <div className="relative">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-48 bg-gray-200 flex items-center justify-center">
                        <Building className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-white text-sm font-bold ${property.badge === 'Premium' ? 'bg-blue-500' :
                        property.badge === 'Luxury' ? 'bg-purple-500' :
                          'bg-orange-500'
                        }`}>
                        {property.badge || 'Featured'}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all">
                        <Heart className="text-red-500" size={16} />
                      </button>
                      <button className="p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all">
                        <Eye className="text-blue-500" size={16} />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                      <div className="flex items-center space-x-1 bg-white bg-opacity-90 rounded-full px-2 py-1">
                        <Star className="text-yellow-500 fill-current" size={12} />
                        <span className="text-xs font-bold text-gray-900">{property.rating?.toFixed(1) || '4.5'}</span>
                      </div>
                      <div className="bg-white bg-opacity-90 rounded-full px-2 py-1">
                        <span className="text-xs font-bold text-gray-900">{property.views || 150} views</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {property.title}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin size={16} className="mr-2" />
                      <span>{property.location || property.city}</span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-3xl font-bold text-green-600">{formatPrice(property.price)}</div>
                        <div className="text-sm text-gray-500">{property.type || property.property_type} • {property.square_feet || property.area} sq ft</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Price per sq ft</div>
                        <div className="font-semibold text-gray-900">₹{Math.round(property.price / (property.square_feet || property.area || 1)).toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {(property.amenities || ['Swimming Pool', 'Gym', 'Security']).slice(0, 3).map((amenity: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {amenity}
                        </span>
                      ))}
                      {(property.amenities || []).length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{(property.amenities || []).length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleViewProperty(property)}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        View Details
                      </button>
                      <button className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                        <Phone size={16} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/properties">
              <button
                onClick={() => onPageChange('properties')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                View All Properties
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Sell Property CTA - Compact */}
      <section className="py-12 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Sell Your Property with AI Pricing
              </h2>
              <p className="text-green-100 mb-6">
                Get the best price with our AI-powered valuation and reach verified buyers instantly.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="text-green-300" size={16} />
                  <span>Verified Buyers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="text-green-300" size={16} />
                  <span>Free Photography</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="text-green-300" size={16} />
                  <span>Legal Support</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => onAuthAction && onAuthAction('sell')}
                  className="bg-white text-green-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all"
                >
                  List My Property
                </button>
                <button className="border-2 border-white text-white px-6 py-3 rounded-xl font-bold hover:bg-white hover:text-green-600 transition-all">
                  Free Valuation
                </button>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Sell Property"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="text-green-600" size={20} />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">₹500Cr+</div>
                    <div className="text-xs text-gray-600">Properties Sold</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Compact */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Why Choose {companyName}?</h2>
            <p className="text-gray-600">AI-powered real estate platform trusted by thousands</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center group">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all">
                <Shield className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">100% Verified</h3>
              <p className="text-gray-600 text-sm">
                Every property verified for legal compliance and authenticity.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all">
                <Brain className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">AI-Powered</h3>
              <p className="text-gray-600 text-sm">
                Smart property matching based on your preferences and budget.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all">
                <Users className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Expert Support</h3>
              <p className="text-gray-600 text-sm">
                Dedicated real estate experts guide you throughout the process.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats - Compact */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="group">
              <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Home className="text-blue-600" size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900">10K+</div>
              <div className="text-gray-600 text-sm">Properties</div>
            </div>
            <div className="group">
              <div className="bg-green-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="text-green-600" size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900">25K+</div>
              <div className="text-gray-600 text-sm">Customers</div>
            </div>
            <div className="group">
              <div className="bg-orange-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Award className="text-orange-600" size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900">15+</div>
              <div className="text-gray-600 text-sm">Years</div>
            </div>
            <div className="group">
              <div className="bg-purple-100 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Star className="text-purple-600" size={20} />
              </div>
              <div className="text-2xl font-bold text-gray-900">4.9★</div>
              <div className="text-gray-600 text-sm">Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Compact */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Customer Success Stories</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Rajesh Kumar',
                text: 'Found my dream home in 2 weeks with AI matching!',
                rating: 5,
                property: '3BHK Andheri'
              },
              {
                name: 'Priya Sharma',
                text: 'Sold my property 20% above market rate with their AI pricing.',
                rating: 5,
                property: 'Villa Koregaon'
              },
              {
                name: 'Amit Patel',
                text: 'Seamless process from search to registration.',
                rating: 5,
                property: '2BHK Gurgaon'
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center space-x-1 mb-3">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={14} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 text-sm italic">"{testimonial.text}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{testimonial.name}</div>
                    <div className="text-xs text-gray-500">{testimonial.property}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Compact */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to Find Your Perfect Property?
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join thousands who found their dream properties with AI-powered search
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => onPageChange && onPageChange('properties')}
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all"
            >
              Browse Properties
            </button>
            <button
              onClick={() => onAuthAction && onAuthAction('sell')}
              className="border-2 border-white text-white px-6 py-3 rounded-xl font-bold hover:bg-white hover:text-blue-600 transition-all"
            >
              Sell Property
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-6 text-blue-100 text-sm">
            <div className="flex items-center space-x-1">
              <Phone size={16} />
              <span>+91 99999 99999</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield size={16} />
              <span>100% Verified</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;