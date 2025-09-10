// import React, { useState } from 'react';
// import {
//   Search,
//   Filter,
//   MapPin,
//   Building,
//   Star,
//   Heart,
//   Eye,
//   Phone,
//   MessageCircle,
//   Home,
//   DollarSign,
//   Grid,
//   List,
//   ChevronDown,
//   Bed,
//   Car,
//   Wifi,
//   Dumbbell,
//   Shield,
//   TreePine,
//   Waves,
//   Calendar,
//   User,
//   CheckCircle,
//   ArrowRight,
//   SlidersHorizontal,
//   TrendingUp,
//   TrendingDown,
//   Bot,
//   Zap,
//   Target,
//   BarChart3
// } from 'lucide-react';
// import PublicPropertyDetailPage from './PublicPropertyDetailPage';

// const PublicPropertiesPage = ({ onPropertyView }: any) => {
//   // ALL HOOKS MUST BE DECLARED AT THE TOP - BEFORE ANY EARLY RETURNS
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedLocation, setSelectedLocation] = useState('');
//   const [selectedBudget, setSelectedBudget] = useState('');
//   const [selectedType, setSelectedType] = useState('');
//   const [selectedBedrooms, setSelectedBedrooms] = useState('');
//   const [sortBy, setSortBy] = useState('relevance');
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
//   const [showFilters, setShowFilters] = useState(false);
//   const [likedProperties, setLikedProperties] = useState<string[]>([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(12);
//   const [showAIRecommendations, setShowAIRecommendations] = useState(true);
//   const [currentPropertyView, setCurrentPropertyView] = useState('');

//   // Define functions after all hooks
//   const handlePropertyView = (property) => setCurrentPropertyView(property);

//   // Sample properties data
//   const allProperties = [
//     {
//       id: 'PROP001',
//       title: 'Luxury 3BHK Apartment',
//       location: 'Andheri West, Mumbai',
//       society: 'Skyline Towers',
//       price: 25000000,
//       area: 1250,
//       bedrooms: 3,
//       bathrooms: 3,
//       parking: 2,
//       type: 'Apartment',
//       furnishing: 'Semi Furnished',
//       possession: 'Ready to Move',
//       amenities: ['Swimming Pool', 'Gym', '24/7 Security', 'Garden', 'Club House', 'Power Backup'],
//       images: [
//         'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800',
//         'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=800'
//       ],
//       featured: true,
//       verified: true,
//       rating: 4.8,
//       reviews: 24,
//       postedDate: '2025-01-10',
//       views: 245,
//       aiScore: 94,
//       priceGrowth: '+12.5%',
//       investmentGrade: 'A+',
//       agent: {
//         name: 'Rohit Sharma',
//         phone: '+91 99999 99999',
//         rating: 4.9
//       },
//       highlights: ['Prime Location', 'Ready to Move', 'Verified Seller', 'No Brokerage'],
//       nearbyPlaces: [
//         { name: 'Metro Station', distance: '0.5 km' },
//         { name: 'Shopping Mall', distance: '1.2 km' },
//         { name: 'School', distance: '0.8 km' }
//       ]
//     },
//     {
//       id: 'PROP002',
//       title: 'Premium Sea View Penthouse',
//       location: 'Bandra West, Mumbai',
//       society: 'Ocean Heights',
//       price: 45000000,
//       area: 2200,
//       bedrooms: 4,
//       bathrooms: 4,
//       parking: 3,
//       type: 'Penthouse',
//       furnishing: 'Fully Furnished',
//       possession: 'Ready to Move',
//       amenities: ['Sea View', 'Private Terrace', 'Concierge', 'Valet Parking', 'Wine Cellar', 'Home Theater'],
//       images: [
//         'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=800',
//         'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800'
//       ],
//       featured: true,
//       verified: true,
//       rating: 4.9,
//       reviews: 18,
//       postedDate: '2025-01-08',
//       views: 189,
//       aiScore: 96,
//       priceGrowth: '+18.2%',
//       investmentGrade: 'A++',
//       agent: {
//         name: 'Priya Patel',
//         phone: '+91 99999 99998',
//         rating: 4.8
//       },
//       highlights: ['Sea View', 'Luxury Amenities', 'Prime Location', 'High ROI'],
//       nearbyPlaces: [
//         { name: 'Bandra Station', distance: '1.0 km' },
//         { name: 'Linking Road', distance: '0.5 km' },
//         { name: 'Hospital', distance: '1.5 km' }
//       ]
//     },
//     {
//       id: 'PROP003',
//       title: 'Spacious Family Villa',
//       location: 'Juhu, Mumbai',
//       society: 'Green Valley Villas',
//       price: 65000000,
//       area: 3500,
//       bedrooms: 5,
//       bathrooms: 5,
//       parking: 4,
//       type: 'Villa',
//       furnishing: 'Semi Furnished',
//       possession: 'Ready to Move',
//       amenities: ['Private Garden', 'Swimming Pool', 'Servant Quarter', 'Security', 'Generator', 'Bore Well'],
//       images: [
//         'https://images.pexels.com/photos/1370704/pexels-photo-1370704.jpeg?auto=compress&cs=tinysrgb&w=800',
//         'https://images.pexels.com/photos/1129019/pexels-photo-1129019.jpeg?auto=compress&cs=tinysrgb&w=800'
//       ],
//       featured: true,
//       verified: true,
//       rating: 5.0,
//       reviews: 12,
//       postedDate: '2025-01-05',
//       views: 156,
//       aiScore: 98,
//       priceGrowth: '+22.1%',
//       investmentGrade: 'A++',
//       agent: {
//         name: 'Amit Kumar',
//         phone: '+91 99999 99997',
//         rating: 4.7
//       },
//       highlights: ['Private Garden', 'Family Villa', 'Premium Location', 'Investment Grade'],
//       nearbyPlaces: [
//         { name: 'Airport', distance: '8 km' },
//         { name: 'Beach', distance: '2 km' },
//         { name: 'International School', distance: '1 km' }
//       ]
//     },
//     // Add more sample properties...
//     ...Array.from({ length: 20 }, (_, i) => ({
//       id: `PROP${String(i + 4).padStart(3, '0')}`,
//       title: `Property ${i + 4}`,
//       location: ['Andheri West', 'Bandra West', 'Powai', 'Worli'][i % 4] + ', Mumbai',
//       society: `Society ${i + 4}`,
//       price: (i + 1) * 2000000 + Math.random() * 10000000,
//       area: 800 + (i * 150),
//       bedrooms: (i % 3) + 2,
//       bathrooms: (i % 3) + 2,
//       parking: (i % 2) + 1,
//       type: ['Apartment', 'Villa', 'Penthouse'][i % 3],
//       furnishing: ['Fully Furnished', 'Semi Furnished', 'Unfurnished'][i % 3],
//       possession: ['Ready to Move', 'Under Construction'][i % 2],
//       amenities: ['Swimming Pool', 'Gym', 'Security', 'Garden', 'Club House'].slice(0, (i % 5) + 2),
//       images: [
//         'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'
//       ],
//       featured: i < 3,
//       verified: Math.random() > 0.2,
//       rating: 4 + Math.random(),
//       reviews: Math.floor(Math.random() * 50) + 5,
//       postedDate: `2025-01-${String(Math.floor(Math.random() * 15) + 1).padStart(2, '0')}`,
//       views: Math.floor(Math.random() * 300) + 50,
//       aiScore: Math.floor(Math.random() * 30) + 70,
//       priceGrowth: `+${(Math.random() * 20 + 5).toFixed(1)}%`,
//       investmentGrade: ['A++', 'A+', 'A', 'B+'][Math.floor(Math.random() * 4)],
//       agent: {
//         name: `Agent ${i + 4}`,
//         phone: `+91 99999 999${String(i + 4).padStart(2, '0')}`,
//         rating: 4 + Math.random()
//       },
//       highlights: ['Prime Location', 'Good Value', 'Verified', 'No Brokerage'].slice(0, (i % 4) + 1),
//       nearbyPlaces: [
//         { name: 'Metro Station', distance: `${(Math.random() * 2).toFixed(1)} km` },
//         { name: 'Shopping Mall', distance: `${(Math.random() * 3).toFixed(1)} km` }
//       ]
//     }))
//   ];

//   const locations = [
//     'All Locations',
//     'Andheri West',
//     'Bandra West',
//     'Juhu',
//     'Powai',
//     'Worli',
//     'Lower Parel',
//     'Malad West',
//     'Goregaon West'
//   ];

//   const budgetRanges = [
//     { value: '', label: 'Any Budget' },
//     { value: '0-50L', label: 'Under ₹50L' },
//     { value: '50L-1Cr', label: '₹50L - ₹1Cr' },
//     { value: '1Cr-2Cr', label: '₹1Cr - ₹2Cr' },
//     { value: '2Cr-5Cr', label: '₹2Cr - ₹5Cr' },
//     { value: '5Cr-10Cr', label: '₹5Cr - ₹10Cr' },
//     { value: '10Cr+', label: '₹10Cr+' }
//   ];

//   const propertyTypes = [
//     'All Types',
//     'Apartment',
//     'Villa',
//     'Penthouse',
//     'Studio',
//     'Row House'
//   ];

//   const bedroomOptions = [
//     'Any',
//     '1 BHK',
//     '2 BHK',
//     '3 BHK',
//     '4 BHK',
//     '5+ BHK'
//   ];

//   const sortOptions = [
//     { value: 'relevance', label: 'Most Relevant' },
//     { value: 'price_low', label: 'Price: Low to High' },
//     { value: 'price_high', label: 'Price: High to Low' },
//     { value: 'newest', label: 'Newest First' },
//     { value: 'area_large', label: 'Largest First' },
//     { value: 'rating', label: 'Highest Rated' },
//     { value: 'ai_score', label: 'AI Score High' },
//     { value: 'price_growth', label: 'Best Growth' }
//   ];

//   const filteredProperties = allProperties.filter(property => {
//     const matchesSearch = searchQuery === '' ||
//       property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       property.society.toLowerCase().includes(searchQuery.toLowerCase());

//     const matchesLocation = selectedLocation === '' || selectedLocation === 'All Locations' ||
//       property.location.includes(selectedLocation);

//     const matchesType = selectedType === '' || selectedType === 'All Types' ||
//       property.type === selectedType;

//     const matchesBedrooms = selectedBedrooms === '' || selectedBedrooms === 'Any' ||
//       (selectedBedrooms === '1 BHK' && property.bedrooms === 1) ||
//       (selectedBedrooms === '2 BHK' && property.bedrooms === 2) ||
//       (selectedBedrooms === '3 BHK' && property.bedrooms === 3) ||
//       (selectedBedrooms === '4 BHK' && property.bedrooms === 4) ||
//       (selectedBedrooms === '5+ BHK' && property.bedrooms >= 5);

//     return matchesSearch && matchesLocation && matchesType && matchesBedrooms;
//   });

//   // Sort properties
//   const sortedProperties = [...filteredProperties].sort((a, b) => {
//     switch (sortBy) {
//       case 'price_low':
//         return a.price - b.price;
//       case 'price_high':
//         return b.price - a.price;
//       case 'newest':
//         return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
//       case 'area_large':
//         return b.area - a.area;
//       case 'rating':
//         return b.rating - a.rating;
//       case 'ai_score':
//         return b.aiScore - a.aiScore;
//       case 'price_growth':
//         return parseFloat(b.priceGrowth.replace('+', '').replace('%', '')) - parseFloat(a.priceGrowth.replace('+', '').replace('%', ''));
//       default:
//         return b.featured ? 1 : -1;
//     }
//   });

//   // Pagination
//   const totalPages = Math.ceil(sortedProperties.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const paginatedProperties = sortedProperties.slice(startIndex, startIndex + itemsPerPage);

//   const formatCurrency = (amount: number) => {
//     if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
//     if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
//     return `₹${amount.toLocaleString('en-IN')}`;
//   };

//   const toggleLike = (propertyId: string) => {
//     setLikedProperties(prev =>
//       prev.includes(propertyId)
//         ? prev.filter(id => id !== propertyId)
//         : [...prev, propertyId]
//     );
//   };

//   const getAmenityIcon = (amenity: string) => {
//     switch (amenity.toLowerCase()) {
//       case 'swimming pool': return <Waves className="text-blue-500" size={14} />;
//       case 'gym': return <Dumbbell className="text-red-500" size={14} />;
//       case '24/7 security': return <Shield className="text-green-500" size={14} />;
//       case 'garden': return <TreePine className="text-green-500" size={14} />;
//       case 'parking': return <Car className="text-gray-500" size={14} />;
//       case 'wifi': return <Wifi className="text-purple-500" size={14} />;
//       default: return <CheckCircle className="text-blue-500" size={14} />;
//     }
//   };

//   // NOW the early return can happen after all hooks
//   if (currentPropertyView) {
//     return (
//       <PublicPropertyDetailPage
//         property={currentPropertyView}
//       />
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Page Header */}
//       <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center">
//             <h1 className="text-3xl md:text-5xl font-bold mb-4">
//               Explore Premium Properties
//             </h1>
//             <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
//               Discover verified properties from trusted sellers across Mumbai's most desirable locations
//             </p>

//             {/* Search Bar */}
//             <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-4 shadow-xl max-w-4xl mx-auto">
//               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                   <input
//                     type="text"
//                     placeholder="Search properties..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
//                   />
//                 </div>
//                 <select
//                   value={selectedLocation}
//                   onChange={(e) => setSelectedLocation(e.target.value)}
//                   className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900"
//                 >
//                   {locations.map((location) => (
//                     <option key={location} value={location === 'All Locations' ? '' : location}>
//                       {location}
//                     </option>
//                   ))}
//                 </select>
//                 <select
//                   value={selectedBudget}
//                   onChange={(e) => setSelectedBudget(e.target.value)}
//                   className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900"
//                 >
//                   {budgetRanges.map((range) => (
//                     <option key={range.value} value={range.value}>
//                       {range.label}
//                     </option>
//                   ))}
//                 </select>
//                 <button
//                   onClick={() => setShowFilters(!showFilters)}
//                   className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold flex items-center justify-center space-x-2"
//                 >
//                   <SlidersHorizontal size={18} />
//                   <span>Filters</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* AI Recommendations Bar */}
//       {showAIRecommendations && (
//         <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-3">
//                 <Bot className="text-yellow-300" size={20} />
//                 <span className="font-semibold">AI Recommendations:</span>
//                 <span className="text-sm">Based on your search, Andheri West shows 15% growth potential</span>
//               </div>
//               <button
//                 onClick={() => setShowAIRecommendations(false)}
//                 className="text-white hover:bg-white hover:bg-opacity-20 px-2 py-1 rounded"
//               >
//                 ×
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Advanced Filters */}
//         {showFilters && (
//           <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Filters</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
//                 <select
//                   value={selectedType}
//                   onChange={(e) => setSelectedType(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 >
//                   {propertyTypes.map((type) => (
//                     <option key={type} value={type === 'All Types' ? '' : type}>
//                       {type}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
//                 <select
//                   value={selectedBedrooms}
//                   onChange={(e) => setSelectedBedrooms(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 >
//                   {bedroomOptions.map((option) => (
//                     <option key={option} value={option}>
//                       {option}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
//                 <select
//                   value={sortBy}
//                   onChange={(e) => setSortBy(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 >
//                   {sortOptions.map((option) => (
//                     <option key={option.value} value={option.value}>
//                       {option.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="flex items-end">
//                 <button
//                   onClick={() => {
//                     setSelectedLocation('');
//                     setSelectedBudget('');
//                     setSelectedType('');
//                     setSelectedBedrooms('');
//                     setSearchQuery('');
//                   }}
//                   className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
//                 >
//                   Clear All
//                 </button>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <button
//                   onClick={() => setViewMode('grid')}
//                   className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
//                 >
//                   <Grid size={18} />
//                 </button>
//                 <button
//                   onClick={() => setViewMode('list')}
//                   className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
//                 >
//                   <List size={18} />
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Results Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h2 className="text-2xl font-bold text-gray-900">
//               {filteredProperties.length} Properties Found
//             </h2>
//             <p className="text-gray-600">
//               {selectedLocation && `in ${selectedLocation} • `}
//               {selectedBudget && `${budgetRanges.find(b => b.value === selectedBudget)?.label} • `}
//               Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedProperties.length)} results
//             </p>
//           </div>
//           <div className="flex items-center space-x-4">
//             <div className="flex items-center space-x-2 text-sm text-gray-600">
//               <Target className="text-blue-600" size={16} />
//               <span>AI-Powered Search</span>
//             </div>
//           </div>
//         </div>

//         {/* Properties Grid/List */}
//         {viewMode === 'grid' ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {paginatedProperties.map((property) => (
//               <div
//                 key={property.id}
//                 className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer"
//                 onClick={() => handlePropertyView(property)}
//               >
//                 <div className="relative">
//                   <img
//                     src={property.images[0]}
//                     alt={property.title}
//                     className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
//                   />

//                   {/* Property badges */}
//                   <div className="absolute top-3 left-3 flex space-x-2">
//                     {property.featured && (
//                       <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
//                         <Zap size={10} className="mr-1" />
//                         FEATURED
//                       </span>
//                     )}
//                     {property.verified && (
//                       <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
//                         <CheckCircle size={10} />
//                         <span>VERIFIED</span>
//                       </span>
//                     )}
//                     {property.aiScore > 90 && (
//                       <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
//                         <Bot size={10} className="mr-1" />
//                         AI {property.aiScore}
//                       </span>
//                     )}
//                   </div>

//                   {/* Like button */}
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       toggleLike(property.id);
//                     }}
//                     className="absolute top-3 right-3 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
//                   >
//                     <Heart
//                       size={16}
//                       className={likedProperties.includes(property.id) ? 'text-red-500 fill-current' : 'text-gray-600'}
//                     />
//                   </button>

//                   {/* Views counter */}
//                   <div className="absolute bottom-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
//                     <Eye size={10} />
//                     <span>{property.views}</span>
//                   </div>
//                 </div>

//                 <div className="p-6">
//                   <div className="mb-3">
//                     <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
//                       {property.title}
//                     </h3>
//                     <div className="flex items-center text-gray-600 text-sm">
//                       <MapPin size={14} className="mr-1" />
//                       <span>{property.location}</span>
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between mb-4">
//                     <div>
//                       <div className="text-2xl font-bold text-green-600">{formatCurrency(property.price)}</div>
//                       <div className="text-xs text-gray-500">{property.type} • {property.area} sq ft</div>
//                     </div>
//                     <div className="flex items-center space-x-1">
//                       <Star className="text-yellow-400 fill-current" size={14} />
//                       <span className="text-xs font-medium text-gray-700">{property.rating.toFixed(1)}</span>
//                       <span className="text-xs text-gray-500">({property.reviews})</span>
//                     </div>
//                   </div>

//                   {/* AI Insights */}
//                   <div className="flex items-center justify-between mb-3 p-2 bg-blue-50 rounded-lg">
//                     <div className="flex items-center space-x-2">
//                       <TrendingUp className="text-green-600" size={12} />
//                       <span className="text-xs text-green-600 font-semibold">{property.priceGrowth}</span>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <BarChart3 className="text-blue-600" size={12} />
//                       <span className="text-xs text-blue-600 font-semibold">Grade {property.investmentGrade}</span>
//                     </div>
//                   </div>

//                   {/* Property specs */}
//                   <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
//                     <div className="flex items-center space-x-1">
//                       <Bed size={12} />
//                       <span>{property.bedrooms} Beds</span>
//                     </div>
//                     <div className="flex items-center space-x-1">
//                       <Building size={12} />
//                       <span>{property.bathrooms} Baths</span>
//                     </div>
//                     <div className="flex items-center space-x-1">
//                       <Car size={12} />
//                       <span>{property.parking} Parking</span>
//                     </div>
//                   </div>

//                   {/* Amenities */}
//                   <div className="flex flex-wrap gap-1 mb-3">
//                     {property.amenities.slice(0, 3).map((amenity: string, i: number) => (
//                       <div key={i} className="flex items-center space-x-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
//                         {getAmenityIcon(amenity)}
//                         <span>{amenity}</span>
//                       </div>
//                     ))}
//                     {property.amenities.length > 3 && (
//                       <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
//                         +{property.amenities.length - 3}
//                       </span>
//                     )}
//                   </div>

//                   {/* Highlights */}
//                   <div className="flex flex-wrap gap-1 mb-3">
//                     {property.highlights.map((highlight: string, i: number) => (
//                       <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
//                         {highlight}
//                       </span>
//                     ))}
//                   </div>

//                   {/* Actions */}
//                   <div className="flex items-center space-x-2">
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handlePropertyView(property);
//                       }}
//                       className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all text-sm"
//                     >
//                       View Details
//                     </button>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         window.open(`tel:${property.agent.phone}`);
//                       }}
//                       className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
//                     >
//                       <Phone size={16} />
//                     </button>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         const message = `Hi, I'm interested in ${property.title} at ${property.location}. Price: ${formatCurrency(property.price)}. Can you share more details?`;
//                         window.open(`https://wa.me/${property.agent.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
//                       }}
//                       className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
//                     >
//                       <MessageCircle size={16} />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="space-y-6">
//             {paginatedProperties.map((property) => (
//               <div
//                 key={property.id}
//                 className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
//                 onClick={() => handlePropertyView(property)}
//               >
//                 <div className="md:flex">
//                   <div className="md:w-1/3 relative">
//                     <img
//                       src={property.images[0]}
//                       alt={property.title}
//                       className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                     />
//                     <div className="absolute top-3 left-3 flex space-x-2">
//                       {property.featured && (
//                         <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
//                           FEATURED
//                         </span>
//                       )}
//                       {property.verified && (
//                         <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
//                           VERIFIED
//                         </span>
//                       )}
//                     </div>
//                   </div>

//                   <div className="md:w-2/3 p-5">
//                     <div className="flex items-start justify-between mb-4">
//                       <div>
//                         <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
//                           {property.title}
//                         </h3>
//                         <div className="flex items-center text-gray-600 mb-2">
//                           <MapPin size={16} className="mr-2" />
//                           <span>{property.location}</span>
//                         </div>
//                         <div className="text-sm text-gray-600">
//                           {property.society}
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <div className="text-2xl font-bold text-green-600">{formatCurrency(property.price)}</div>
//                         <div className="text-sm text-gray-500">₹{Math.round(property.price / property.area).toLocaleString()}/sq ft</div>
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-4 gap-3 mb-4">
//                       <div className="text-center p-2 bg-gray-50 rounded-lg">
//                         <Bed className="mx-auto text-gray-600 mb-1" size={20} />
//                         <div className="font-semibold text-gray-900">{property.bedrooms}</div>
//                         <div className="text-xs text-gray-500">Bedrooms</div>
//                       </div>
//                       <div className="text-center p-2 bg-gray-50 rounded-lg">
//                         <Building className="mx-auto text-gray-600 mb-1" size={20} />
//                         <div className="font-semibold text-gray-900">{property.bathrooms}</div>
//                         <div className="text-xs text-gray-500">Bathrooms</div>
//                       </div>
//                       <div className="text-center p-2 bg-gray-50 rounded-lg">
//                         <Home className="mx-auto text-gray-600 mb-1" size={20} />
//                         <div className="font-semibold text-gray-900">{property.area}</div>
//                         <div className="text-xs text-gray-500">Sq Ft</div>
//                       </div>
//                       <div className="text-center p-2 bg-gray-50 rounded-lg">
//                         <Car className="mx-auto text-gray-600 mb-1" size={20} />
//                         <div className="font-semibold text-gray-900">{property.parking}</div>
//                         <div className="text-xs text-gray-500">Parking</div>
//                       </div>
//                     </div>

//                     {/* AI Insights for List View */}
//                     <div className="grid grid-cols-3 gap-3 mb-4">
//                       <div className="text-center p-2 bg-green-50 rounded-lg">
//                         <TrendingUp className="mx-auto text-green-600 mb-1" size={16} />
//                         <div className="text-sm font-semibold text-green-600">{property.priceGrowth}</div>
//                         <div className="text-xs text-gray-500">Growth</div>
//                       </div>
//                       <div className="text-center p-2 bg-purple-50 rounded-lg">
//                         <Bot className="mx-auto text-purple-600 mb-1" size={16} />
//                         <div className="text-sm font-semibold text-purple-600">{property.aiScore}</div>
//                         <div className="text-xs text-gray-500">AI Score</div>
//                       </div>
//                       <div className="text-center p-2 bg-blue-50 rounded-lg">
//                         <BarChart3 className="mx-auto text-blue-600 mb-1" size={16} />
//                         <div className="text-sm font-semibold text-blue-600">{property.investmentGrade}</div>
//                         <div className="text-xs text-gray-500">Grade</div>
//                       </div>
//                     </div>

//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center space-x-4">
//                         <div className="flex items-center space-x-1">
//                           <Star className="text-yellow-400 fill-current" size={16} />
//                           <span className="font-medium text-gray-700">{property.rating.toFixed(1)}</span>
//                           <span className="text-sm text-gray-500">({property.reviews} reviews)</span>
//                         </div>
//                         <div className="text-sm text-gray-500">
//                           Posted {property.postedDate}
//                         </div>
//                       </div>

//                       <div className="flex items-center space-x-2">
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handlePropertyView(property);
//                           }}
//                           className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all text-sm"
//                         >
//                           View Details
//                         </button>
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             toggleLike(property.id);
//                           }}
//                           className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//                         >
//                           <Heart
//                             size={16}
//                             className={likedProperties.includes(property.id) ? 'text-red-500 fill-current' : 'text-gray-600'}
//                           />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex items-center justify-center space-x-2 mt-12">
//             <button
//               onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//               disabled={currentPage === 1}
//               className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Previous
//             </button>

//             <div className="flex space-x-1">
//               {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                 const pageNumber = i + 1;
//                 return (
//                   <button
//                     key={pageNumber}
//                     onClick={() => setCurrentPage(pageNumber)}
//                     className={`px-4 py-2 rounded-lg ${currentPage === pageNumber
//                         ? 'bg-blue-600 text-white'
//                         : 'border border-gray-300 hover:bg-gray-50'
//                       }`}
//                   >
//                     {pageNumber}
//                   </button>
//                 );
//               })}
//             </div>

//             <button
//               onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//               disabled={currentPage === totalPages}
//               className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Next
//             </button>
//           </div>
//         )}

//         {/* No results */}
//         {filteredProperties.length === 0 && (
//           <div className="text-center py-16">
//             <Home className="mx-auto text-gray-300 mb-6" size={64} />
//             <h3 className="text-2xl font-bold text-gray-900 mb-4">No Properties Found</h3>
//             <p className="text-gray-600 mb-8">
//               Try adjusting your search criteria or browse all properties
//             </p>
//             <button
//               onClick={() => {
//                 setSearchQuery('');
//                 setSelectedLocation('');
//                 setSelectedBudget('');
//                 setSelectedType('');
//                 setSelectedBedrooms('');
//               }}
//               className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
//             >
//               Clear Filters
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PublicPropertiesPage;

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Building,
  Star,
  Heart,
  Eye,
  Phone,
  MessageCircle,
  Home,
  DollarSign,
  Grid,
  List,
  ChevronDown,
  Bed,
  Car,
  Wifi,
  Dumbbell,
  Shield,
  TreePine,
  Waves,
  Calendar,
  User,
  CheckCircle,
  ArrowRight,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  Bot,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';
import PublicPropertyDetailPage from './PublicPropertyDetailPage';
import { propertiesAPI } from '@/lib/propertiesAPI';
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
  society?: string;
  area?: number;
  parking?: number;
  type?: string;
  furnishing?: string;
  possession?: string;
  amenities?: string[];
  featured?: boolean;
  verified?: boolean;
  rating?: number;
  reviews?: number;
  postedDate?: string;
  views?: number;
  aiScore?: number;
  priceGrowth?: string;
  investmentGrade?: string;
  agent?: {
    name: string;
    phone: string;
    rating: number;
  };
  highlights?: string[];
  nearbyPlaces?: Array<{
    name: string;
    distance: string;
  }>;
}

const PublicPropertiesPage = ({ onPropertyView }: any) => {
  // ALL HOOKS MUST BE DECLARED AT THE TOP - BEFORE ANY EARLY RETURNS
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedBedrooms, setSelectedBedrooms] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [likedProperties, setLikedProperties] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [showAIRecommendations, setShowAIRecommendations] = useState(true);
  const [currentPropertyView, setCurrentPropertyView] = useState('');
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await propertiesAPI.getProperties({
          status: 'Available',
          limit: 50, // Get more properties for better filtering
        });

        console.log("Properties API Response:", response);

        if (response?.data && Array.isArray(response.data)) {
          const transformedProperties = response.data.map((p: any, index: number) => ({
            id: p.id,
            title: p.title || `${p.unit_type || ''} ${p.property_type_name || ''}`.trim() || `Property ${p.id}`,
            price: Number(p.budget) || 0,
            bedrooms: Number(p.bedrooms) || 0,
            bathrooms: Number(p.bathrooms) || 0,
            square_feet: Number(p.carpet_area) || Number(p.builtup_area) || 0,
            city: p.city_name || p.city || '',
            property_type: p.property_type_name || p.property_type || '',
            status: p.status || '',
            images: Array.isArray(p.photos) ? p.photos.map((ph: string) => ph.replace(/\\/g, '/')) : ['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'],

            // Enhanced fields for better display
            location: `${p.city_name || p.city || ''}, ${p.state || 'Mumbai'}`,
            society: p.society_name || p.project_name || `Society ${p.id}`,
            area: Number(p.carpet_area) || Number(p.builtup_area) || 0,
            parking: Number(p.parking_slots) || Math.floor(Math.random() * 3) + 1,
            type: p.property_type_name || p.property_type || 'Apartment',
            furnishing: p.furnishing_status || ['Fully Furnished', 'Semi Furnished', 'Unfurnished'][index % 3],
            possession: p.possession_status || ['Ready to Move', 'Under Construction'][index % 2],

            // Process amenities
            amenities: p.amenities ?
              (Array.isArray(p.amenities) ? p.amenities :
                typeof p.amenities === 'string' ? p.amenities.split(',').map(a => a.trim()) :
                  ['Swimming Pool', 'Gym', 'Security', 'Garden', 'Club House', 'Power Backup']) :
              ['Swimming Pool', 'Gym', 'Security', 'Garden', 'Club House', 'Power Backup'],

            // Generated fields for enhanced experience
            featured: p.featured || index < 3,
            verified: p.verified !== false,
            rating: p.rating || (4 + Math.random() * 1),
            reviews: p.reviews || Math.floor(Math.random() * 50) + 5,
            postedDate: p.created_at ? p.created_at.split('T')[0] : `2025-01-${String(Math.floor(Math.random() * 15) + 1).padStart(2, '0')}`,
            views: p.views || Math.floor(Math.random() * 300) + 50,
            aiScore: p.ai_score || Math.floor(Math.random() * 30) + 70,
            priceGrowth: p.price_growth || `+${(Math.random() * 20 + 5).toFixed(1)}%`,
            investmentGrade: p.investment_grade || ['A++', 'A+', 'A', 'B+'][Math.floor(Math.random() * 4)],

            // Agent information
            agent: {
              name: p.agent_name || `Agent ${index + 1}`,
              phone: p.agent_phone || `+91 99999 999${String(index % 100).padStart(2, '0')}`,
              rating: p.agent_rating || (4 + Math.random())
            },

            // Highlights and nearby places
            highlights: p.highlights || ['Prime Location', 'Good Value', 'Verified', 'No Brokerage'].slice(0, (index % 4) + 1),
            nearbyPlaces: p.nearby_places || [
              { name: 'Metro Station', distance: `${(Math.random() * 2).toFixed(1)} km` },
              { name: 'Shopping Mall', distance: `${(Math.random() * 3).toFixed(1)} km` },
              { name: 'School', distance: `${(Math.random() * 2).toFixed(1)} km` }
            ]
          }));

          setAllProperties(transformedProperties);
          setError('');
        } else {
          console.warn('Unexpected response data:', response);
          setError('No properties found');
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        setError('Failed to load properties. Please try again.');
        // Set fallback empty array instead of static data
        setAllProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Define functions after all hooks
  const handlePropertyView = (property) => setCurrentPropertyView(property);

  const locations = [
    'All Locations',
    'Andheri West',
    'Bandra West',
    'Juhu',
    'Powai',
    'Worli',
    'Lower Parel',
    'Malad West',
    'Goregaon West'
  ];

  const budgetRanges = [
    { value: '', label: 'Any Budget' },
    { value: '0-50L', label: 'Under ₹50L' },
    { value: '50L-1Cr', label: '₹50L - ₹1Cr' },
    { value: '1Cr-2Cr', label: '₹1Cr - ₹2Cr' },
    { value: '2Cr-5Cr', label: '₹2Cr - ₹5Cr' },
    { value: '5Cr-10Cr', label: '₹5Cr - ₹10Cr' },
    { value: '10Cr+', label: '₹10Cr+' }
  ];

  const propertyTypes = [
    'All Types',
    'Apartment',
    'Villa',
    'Penthouse',
    'Studio',
    'Row House'
  ];

  const bedroomOptions = [
    'Any',
    '1 BHK',
    '2 BHK',
    '3 BHK',
    '4 BHK',
    '5+ BHK'
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'area_large', label: 'Largest First' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'ai_score', label: 'AI Score High' },
    { value: 'price_growth', label: 'Best Growth' }
  ];

  // Budget filter function
  const matchesBudget = (property: Property, budget: string) => {
    if (!budget) return true;
    const price = property.price;

    switch (budget) {
      case '0-50L':
        return price <= 5000000;
      case '50L-1Cr':
        return price > 5000000 && price <= 10000000;
      case '1Cr-2Cr':
        return price > 10000000 && price <= 20000000;
      case '2Cr-5Cr':
        return price > 20000000 && price <= 50000000;
      case '5Cr-10Cr':
        return price > 50000000 && price <= 100000000;
      case '10Cr+':
        return price > 100000000;
      default:
        return true;
    }
  };

  const filteredProperties = allProperties.filter(property => {
    const matchesSearch = searchQuery === '' ||
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.society?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation = selectedLocation === '' || selectedLocation === 'All Locations' ||
      property.location?.includes(selectedLocation) || property.city.includes(selectedLocation);

    const matchesType = selectedType === '' || selectedType === 'All Types' ||
      property.type === selectedType || property.property_type === selectedType;

    const matchesBudgetFilter = matchesBudget(property, selectedBudget);

    const matchesBedrooms = selectedBedrooms === '' || selectedBedrooms === 'Any' ||
      (selectedBedrooms === '1 BHK' && property.bedrooms === 1) ||
      (selectedBedrooms === '2 BHK' && property.bedrooms === 2) ||
      (selectedBedrooms === '3 BHK' && property.bedrooms === 3) ||
      (selectedBedrooms === '4 BHK' && property.bedrooms === 4) ||
      (selectedBedrooms === '5+ BHK' && property.bedrooms >= 5);

    return matchesSearch && matchesLocation && matchesType && matchesBudgetFilter && matchesBedrooms;
  });

  // Sort properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'newest':
        return new Date(b.postedDate || '').getTime() - new Date(a.postedDate || '').getTime();
      case 'area_large':
        return (b.area || b.square_feet || 0) - (a.area || a.square_feet || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'ai_score':
        return (b.aiScore || 0) - (a.aiScore || 0);
      case 'price_growth':
        return parseFloat((b.priceGrowth || '0').replace('+', '').replace('%', '')) - parseFloat((a.priceGrowth || '0').replace('+', '').replace('%', ''));
      default:
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProperties = sortedProperties.slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const toggleLike = (propertyId: string) => {
    setLikedProperties(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'swimming pool': return <Waves className="text-blue-500" size={14} />;
      case 'gym': return <Dumbbell className="text-red-500" size={14} />;
      case '24/7 security':
      case 'security': return <Shield className="text-green-500" size={14} />;
      case 'garden': return <TreePine className="text-green-500" size={14} />;
      case 'parking': return <Car className="text-gray-500" size={14} />;
      case 'wifi': return <Wifi className="text-purple-500" size={14} />;
      default: return <CheckCircle className="text-blue-500" size={14} />;
    }
  };

  // NOW the early return can happen after all hooks
  if (currentPropertyView) {
    return (
      <PublicPropertyDetailPage
        property={currentPropertyView}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Explore Premium Properties
            </h1>
            <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
              Discover verified properties from trusted sellers across Mumbai's most desirable locations
            </p>

            {/* Search Bar */}
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl p-4 shadow-xl max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search properties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  {locations.map((location) => (
                    <option key={location} value={location === 'All Locations' ? '' : location}>
                      {location}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  {budgetRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold flex items-center justify-center space-x-2"
                >
                  <SlidersHorizontal size={18} />
                  <span>Filters</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations Bar */}
      {showAIRecommendations && !loading && allProperties.length > 0 && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bot className="text-yellow-300" size={20} />
                <span className="font-semibold">AI Recommendations:</span>
                <span className="text-sm">
                  Found {allProperties.length} properties. {selectedLocation || 'Mumbai'} shows strong growth potential
                </span>
              </div>
              <button
                onClick={() => setShowAIRecommendations(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 px-2 py-1 rounded"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Advanced Filters */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {propertyTypes.map((type) => (
                    <option key={type} value={type === 'All Types' ? '' : type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <select
                  value={selectedBedrooms}
                  onChange={(e) => setSelectedBedrooms(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {bedroomOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedLocation('');
                    setSelectedBudget('');
                    setSelectedType('');
                    setSelectedBedrooms('');
                    setSearchQuery('');
                  }}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Clear All
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4">Loading properties...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-16">
            <Home className="mx-auto text-gray-300 mb-6" size={64} />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Properties</h3>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results Header */}
        {!loading && !error && (
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredProperties.length} Properties Found
              </h2>
              <p className="text-gray-600">
                {selectedLocation && `in ${selectedLocation} • `}
                {selectedBudget && `${budgetRanges.find(b => b.value === selectedBudget)?.label} • `}
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedProperties.length)} results
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Target className="text-blue-600" size={16} />
                <span>AI-Powered Search</span>
              </div>
            </div>
          </div>
        )}

        {/* Properties Grid/List */}
        {!loading && !error && filteredProperties.length > 0 && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProperties.map((property) => (
                  <div
                    key={property.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer"
                    onClick={() => handlePropertyView(property)}
                  >
                    <div className="relative">
                      <img
                        src={property.images?.[0] || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'}
                        alt={property.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />

                      {/* Property badges */}
                      <div className="absolute top-3 left-3 flex space-x-2">
                        {property.featured && (
                          <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                            <Zap size={10} className="mr-1" />
                            FEATURED
                          </span>
                        )}
                        {property.verified && (
                          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                            <CheckCircle size={10} />
                            <span>VERIFIED</span>
                          </span>
                        )}
                        {(property.aiScore || 0) > 90 && (
                          <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                            <Bot size={10} className="mr-1" />
                            AI {property.aiScore}
                          </span>
                        )}
                      </div>

                      {/* Like button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(property.id.toString());
                        }}
                        className="absolute top-3 right-3 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
                      >
                        <Heart
                          size={16}
                          className={likedProperties.includes(property.id.toString()) ? 'text-red-500 fill-current' : 'text-gray-600'}
                        />
                      </button>

                      {/* Views counter */}
                      <div className="absolute bottom-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                        <Eye size={10} />
                        <span>{property.views || 0}</span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="mb-3">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {property.title}
                        </h3>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin size={14} className="mr-1" />
                          <span>{property.location || property.city}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-2xl font-bold text-green-600">{formatCurrency(property.price)}</div>
                          <div className="text-xs text-gray-500">{property.type || property.property_type} • {property.area || property.square_feet} sq ft</div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="text-yellow-400 fill-current" size={14} />
                          <span className="text-xs font-medium text-gray-700">{(property.rating || 4.5).toFixed(1)}</span>
                          <span className="text-xs text-gray-500">({property.reviews || 0})</span>
                        </div>
                      </div>

                      {/* AI Insights */}
                      <div className="flex items-center justify-between mb-3 p-2 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="text-green-600" size={12} />
                          <span className="text-xs text-green-600 font-semibold">{property.priceGrowth || '+12%'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="text-blue-600" size={12} />
                          <span className="text-xs text-blue-600 font-semibold">Grade {property.investmentGrade || 'A'}</span>
                        </div>
                      </div>

                      {/* Property specs */}
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Bed size={12} />
                          <span>{property.bedrooms} Beds</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Building size={12} />
                          <span>{property.bathrooms} Baths</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Car size={12} />
                          <span>{property.parking || 1} Parking</span>
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(property.amenities || []).slice(0, 3).map((amenity: string, i: number) => (
                          <div key={i} className="flex items-center space-x-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {getAmenityIcon(amenity)}
                            <span>{amenity}</span>
                          </div>
                        ))}
                        {(property.amenities || []).length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{(property.amenities || []).length - 3}
                          </span>
                        )}
                      </div>

                      {/* Highlights */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(property.highlights || []).map((highlight: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                            {highlight}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePropertyView(property);
                          }}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all text-sm"
                        >
                          View Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`tel:${property.agent?.phone}`);
                          }}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <Phone size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const message = `Hi, I'm interested in ${property.title} at ${property.location}. Price: ${formatCurrency(property.price)}. Can you share more details?`;
                            window.open(`https://wa.me/${(property.agent?.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                          }}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <MessageCircle size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {paginatedProperties.map((property) => (
                  <div
                    key={property.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
                    onClick={() => handlePropertyView(property)}
                  >
                    <div className="md:flex">
                      <div className="md:w-1/3 relative">
                        <img
                          src={property.images?.[0] || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'}
                          alt={property.title}
                          className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex space-x-2">
                          {property.featured && (
                            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                              FEATURED
                            </span>
                          )}
                          {property.verified && (
                            <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                              VERIFIED
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="md:w-2/3 p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                              {property.title}
                            </h3>
                            <div className="flex items-center text-gray-600 mb-2">
                              <MapPin size={16} className="mr-2" />
                              <span>{property.location || property.city}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {property.society}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(property.price)}</div>
                            <div className="text-sm text-gray-500">₹{Math.round(property.price / (property.area || property.square_feet || 1)).toLocaleString()}/sq ft</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3 mb-4">
                          <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <Bed className="mx-auto text-gray-600 mb-1" size={20} />
                            <div className="font-semibold text-gray-900">{property.bedrooms}</div>
                            <div className="text-xs text-gray-500">Bedrooms</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <Building className="mx-auto text-gray-600 mb-1" size={20} />
                            <div className="font-semibold text-gray-900">{property.bathrooms}</div>
                            <div className="text-xs text-gray-500">Bathrooms</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <Home className="mx-auto text-gray-600 mb-1" size={20} />
                            <div className="font-semibold text-gray-900">{property.area || property.square_feet}</div>
                            <div className="text-xs text-gray-500">Sq Ft</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded-lg">
                            <Car className="mx-auto text-gray-600 mb-1" size={20} />
                            <div className="font-semibold text-gray-900">{property.parking || 1}</div>
                            <div className="text-xs text-gray-500">Parking</div>
                          </div>
                        </div>

                        {/* AI Insights for List View */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="text-center p-2 bg-green-50 rounded-lg">
                            <TrendingUp className="mx-auto text-green-600 mb-1" size={16} />
                            <div className="text-sm font-semibold text-green-600">{property.priceGrowth || '+12%'}</div>
                            <div className="text-xs text-gray-500">Growth</div>
                          </div>
                          <div className="text-center p-2 bg-purple-50 rounded-lg">
                            <Bot className="mx-auto text-purple-600 mb-1" size={16} />
                            <div className="text-sm font-semibold text-purple-600">{property.aiScore || 85}</div>
                            <div className="text-xs text-gray-500">AI Score</div>
                          </div>
                          <div className="text-center p-2 bg-blue-50 rounded-lg">
                            <BarChart3 className="mx-auto text-blue-600 mb-1" size={16} />
                            <div className="text-sm font-semibold text-blue-600">{property.investmentGrade || 'A'}</div>
                            <div className="text-xs text-gray-500">Grade</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Star className="text-yellow-400 fill-current" size={16} />
                              <span className="font-medium text-gray-700">{(property.rating || 4.5).toFixed(1)}</span>
                              <span className="text-sm text-gray-500">({property.reviews || 0} reviews)</span>
                            </div>
                            <div className="text-sm text-gray-500">
                              Posted {property.postedDate}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePropertyView(property);
                              }}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all text-sm"
                            >
                              View Details
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLike(property.id.toString());
                              }}
                              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              <Heart
                                size={16}
                                className={likedProperties.includes(property.id.toString()) ? 'text-red-500 fill-current' : 'text-gray-600'}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-12">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-4 py-2 rounded-lg ${currentPage === pageNumber
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* No results */}
        {!loading && !error && filteredProperties.length === 0 && allProperties.length > 0 && (
          <div className="text-center py-16">
            <Home className="mx-auto text-gray-300 mb-6" size={64} />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Properties Found</h3>
            <p className="text-gray-600 mb-8">
              Try adjusting your search criteria or browse all properties
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLocation('');
                setSelectedBudget('');
                setSelectedType('');
                setSelectedBedrooms('');
              }}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Empty state when no properties from API */}
        {!loading && !error && allProperties.length === 0 && (
          <div className="text-center py-16">
            <Home className="mx-auto text-gray-300 mb-6" size={64} />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Properties Available</h3>
            <p className="text-gray-600 mb-8">
              Properties will appear here once they are added to the system
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
            >
              Refresh Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicPropertiesPage;