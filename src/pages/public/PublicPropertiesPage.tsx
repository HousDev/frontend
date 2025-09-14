// import React, { useState, useEffect } from 'react';
// import {
//   Search,
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
//   Bed,
//   Car,
//   Wifi,
//   Dumbbell,
//   Shield,
//   TreePine,
//   Waves,
//   CheckCircle,
//   SlidersHorizontal,
//   Bot,
//   Zap,
//   Target,
//   BarChart3,
//   TrendingUp
// } from 'lucide-react';
// import PublicPropertyDetailPage from './PublicPropertyDetailPage';
// import { propertiesAPI } from '@/lib/propertiesAPI';
// import LoadingSpinner from '@/components/ui/LoadingSpinner';
// import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';

// interface Property {
//   id: number;
//   title: string;
//   price: number;
//   bedrooms: number;
//   bathrooms: number;
//   square_feet: number;
//   city: string;
//   property_type: string;
//   status: string;
//   images?: string[];
//   location?: string;
//   society?: string;
//   area?: number;
//   parking?: number;
//   type?: string;
//   furnishing?: string;
//   possession?: string;
//   amenities?: string[];
//   featured?: boolean;
//   verified?: boolean;
//   rating?: number;
//   reviews?: number;
//   postedDate?: string;
//   views?: number;
//   aiScore?: number;
//   priceGrowth?: string;
//   investmentGrade?: string;
//   agent?: {
//     name: string;
//     phone: string;
//     rating: number;
//   };
//   highlights?: string[];
//   nearbyPlaces?: Array<{
//     name: string;
//     distance: string;
//   }>;
// }

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
//   const [allProperties, setAllProperties] = useState<Property[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   const [masterLoading, setMasterLoading] = useState(true);
//   const [masters, setMasters] = useState<Record<string, MasterOption[]>>({});

//   useEffect(() => {
//     const fetchMasters = async () => {
//       try {
//         setMasterLoading(true);
//         const data = await getMasterDropdownOptions(['common', 'lead', 'property']);
//         setMasters(data || {});
//         console.log('Fetched master data:', data);
//       } catch (err) {
//         console.error('Error fetching master options:', err);
//       } finally {
//         setMasterLoading(false);
//       }
//     };

//     fetchMasters();
//   }, []);

//   // Fetch properties from API
//   useEffect(() => {
//     const fetchProperties = async () => {
//       try {
//         setLoading(true);
//         const response = await propertiesAPI.getProperties({
//           status: 'Available',
//           limit: 50,
//         });

//         console.log('Properties API Response:', response);

//         if (response?.data && Array.isArray(response.data)) {
//           const transformedProperties = response.data.map((p: any, index: number) => ({
//             id: p.id,
//             title: p.title || `${p.unit_type || ''} ${p.property_type_name || ''}`.trim() || `Property ${p.id}`,
//             price: Number(p.budget) || 0,
//             bedrooms: Number(p.bedrooms) || 0,
//             bathrooms: Number(p.bathrooms) || 0,
//             square_feet: Number(p.carpet_area) || Number(p.builtup_area) || 0,
//             city: p.city_name || p.city || '',
//             property_type: p.property_type_name || p.property_type || '',
//             status: p.status || '',
//             images: Array.isArray(p.photos) ? p.photos.map((ph: string) => ph.replace(/\\/g, '/')) : ['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'],
//             location: `${p.city_name || p.city || ''}, ${p.state || 'Mumbai'}`,
//             society: p.society_name || p.project_name || `Society ${p.id}`,
//             area: Number(p.carpet_area) || Number(p.builtup_area) || 0,
//             parking: Number(p.parking_slots) || Math.floor(Math.random() * 3) + 1,
//             type: p.property_type_name || p.property_type || 'Apartment',
//             furnishing: p.furnishing_status || ['Fully Furnished', 'Semi Furnished', 'Unfurnished'][index % 3],
//             possession: p.possession_status || ['Ready to Move', 'Under Construction'][index % 2],
//             amenities: p.amenities ?
//               (Array.isArray(p.amenities) ? p.amenities :
//                 typeof p.amenities === 'string' ? p.amenities.split(',').map(a => a.trim()) :
//                   ['Swimming Pool', 'Gym', 'Security', 'Garden', 'Club House', 'Power Backup']) :
//               ['Swimming Pool', 'Gym', 'Security', 'Garden', 'Club House', 'Power Backup'],
//             featured: p.featured || index < 3,
//             verified: p.verified !== false,
//             rating: p.rating || (4 + Math.random() * 1),
//             reviews: p.reviews || Math.floor(Math.random() * 50) + 5,
//             postedDate: p.created_at ? p.created_at.split('T')[0] : `2025-01-${String(Math.floor(Math.random() * 15) + 1).padStart(2, '0')}`,
//             views: p.views || Math.floor(Math.random() * 300) + 50,
//             aiScore: p.ai_score || Math.floor(Math.random() * 30) + 70,
//             priceGrowth: p.price_growth || `+${(Math.random() * 20 + 5).toFixed(1)}%`,
//             investmentGrade: p.investment_grade || ['A++', 'A+', 'A', 'B+'][Math.floor(Math.random() * 4)],
//             agent: {
//               name: p.agent_name || `Agent ${index + 1}`,
//               phone: p.agent_phone || `+91 99999 999${String(index % 100).padStart(2, '0')}`,
//               rating: p.agent_rating || (4 + Math.random())
//             },
//             highlights: p.highlights || ['Prime Location', 'Good Value', 'Verified', 'No Brokerage'].slice(0, (index % 4) + 1),
//             nearbyPlaces: p.nearby_places || [
//               { name: 'Metro Station', distance: `${(Math.random() * 2).toFixed(1)} km` },
//               { name: 'Shopping Mall', distance: `${(Math.random() * 3).toFixed(1)} km` },
//               { name: 'School', distance: `${(Math.random() * 2).toFixed(1)} km` }
//             ]
//           }));

//           setAllProperties(transformedProperties);
//           setError('');
//         } else {
//           console.warn('Unexpected response data:', response);
//           setError('No properties found');
//           setAllProperties([]);
//         }
//       } catch (error) {
//         console.error('Error fetching properties:', error);
//         setError('Failed to load properties. Please try again.');
//         setAllProperties([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProperties();
//   }, []);

//   // -------------------------
//   // Helper: master normalization
//   // -------------------------
//   const findMasterOptions = (candidateKeys: string[]) => {
//     if (!masters || typeof masters !== 'object') return [];
//     const normalizedMap: Record<string, string> = {};
//     Object.keys(masters).forEach((k) => {
//       normalizedMap[k.toLowerCase().replace(/\s+/g, '')] = k;
//     });

//     for (const ck of candidateKeys) {
//       const nk = ck.toLowerCase().replace(/\s+/g, '');
//       if (normalizedMap[nk]) {
//         const realKey = normalizedMap[nk];
//         const arr = masters[realKey];
//         if (Array.isArray(arr)) return arr;
//       }
//     }

//     // fuzzy contains
//     for (const ck of candidateKeys) {
//       const nk = ck.toLowerCase().replace(/\s+/g, '');
//       const foundKey = Object.keys(masters).find(k => k.toLowerCase().replace(/\s+/g, '').includes(nk));
//       if (foundKey) {
//         const arr = masters[foundKey];
//         if (Array.isArray(arr)) return arr;
//       }
//     }

//     return [];
//   };

//   // -------------------------
//   // Build dynamic option lists
//   // -------------------------
//   // Locations
//   const locationsMaster: MasterOption[] = findMasterOptions(['location', 'locations', 'place', 'place name', 'city', 'area']);
//   const locationOptions = locationsMaster.map(o => ({ value: o.value, label: o.label }));

//   // Budget / Price Range
//   const budgetMaster: MasterOption[] = findMasterOptions(['price range', 'price_range', 'budget', 'budget range', 'priceRange', 'price']);
//   const budgetOptions = budgetMaster.map(o => ({ value: o.value, label: o.label }));

//   // Property types
//   const propertyTypesMaster: MasterOption[] = findMasterOptions(['property type', 'property_type', 'type', 'place type', 'category']);
//   const propertyTypeOptions = propertyTypesMaster.map(o => ({ value: o.value || o.label, label: o.label || o.value }));

//   // Bedrooms / unit types - normalize into numeric values and readable labels (e.g., "1 BHK")
//   const bedroomsMaster: MasterOption[] = findMasterOptions(['bedrooms', 'bhk', 'beds', 'unit type', 'unit', 'unit_type']);
//   // create bedroom options array like [{ value: '1', label: '1 BHK' }, ...]
//   const bedroomOptions = bedroomsMaster
//     .map(o => {
//       // try to extract a number from value or label
//       const text = (o.value || o.label || '').toString();
//       const m = text.match(/(\d+)/);
//       if (m) {
//         const num = m[1];
//         return { value: num, label: `${num} BHK` };
//       }
//       // fallback: use raw label as value
//       return { value: text, label: o.label || text };
//     })
//     // deduplicate by value
//     .filter((v, i, arr) => arr.findIndex(x => x.value === v.value) === i);

//   // If any of these lists are empty, we gracefully show empty select (disabled while loading)
//   // -------------------------
//   // Helper: parse budget master value to numeric range
//   // -------------------------
//   const parseMoneyToken = (tok: string) => {
//     // Accept tokens like '50L', '1Cr', '1000000', '50 L', '50 lakh', '10Cr+'
//     if (!tok) return NaN;
//     const t = tok.toLowerCase().replace(/\s+/g, '');
//     // handle K, L, Cr
//     const match = t.match(/^([0-9.,]+)(k|m|l|cr|crore|lakh)?\+?$/i);
//     if (match) {
//       let num = parseFloat(match[1].replace(/,/g, ''));
//       const unit = (match[2] || '').toLowerCase();
//       if (unit === 'k') num *= 1000;
//       else if (unit === 'm') num *= 1000000;
//       else if (unit === 'l' || unit === 'lakh') num *= 100000;
//       else if (unit === 'cr' || unit === 'crore') num *= 10000000;
//       return Math.round(num);
//     }
//     // try parse integers directly
//     const plain = parseFloat(t.replace(/,/g, ''));
//     return isNaN(plain) ? NaN : plain;
//   };

//   const parseBudgetRange = (value: string): [number, number] => {
//     // value formats: '0-50L', '50L-1Cr', '10Cr+', '', 'Any'
//     if (!value) return [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];
//     const v = value.toString().trim();

//     // if contains '-' treat as range
//     if (v.includes('-')) {
//       const parts = v.split('-').map(s => s.trim());
//       const minTok = parts[0];
//       const maxTok = parts[1];
//       const min = parseMoneyToken(minTok);
//       const max = parseMoneyToken(maxTok);
//       return [isNaN(min) ? Number.NEGATIVE_INFINITY : min, isNaN(max) ? Number.POSITIVE_INFINITY : max];
//     }

//     // if ends with + (like 10Cr+)
//     if (v.endsWith('+')) {
//       const tok = v.replace(/\+$/, '');
//       const min = parseMoneyToken(tok);
//       return [isNaN(min) ? Number.NEGATIVE_INFINITY : min, Number.POSITIVE_INFINITY];
//     }

//     // If it's a label like 'Under ₹50L' or contains numbers, try to extract number(s)
//     const nums = v.match(/([0-9.,]+)\s*(k|m|l|cr|crore|lakh)?/gi);
//     if (nums && nums.length === 1) {
//       const max = parseMoneyToken(nums[0]);
//       return [Number.NEGATIVE_INFINITY, isNaN(max) ? Number.POSITIVE_INFINITY : max];
//     }

//     // fallback - no constraint
//     return [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];
//   };

//   // Budget filter function (robust)
//   const matchesBudget = (property: Property, budget: string) => {
//     if (!budget) return true;
//     // first try: if budget equals one of known encoded values (like '0-50L' etc), parse
//     const [min, max] = parseBudgetRange(budget);
//     const price = property.price || 0;
//     // property.price is assumed to be in rupees (numbers)
//     return price >= (isFinite(min) ? min : Number.NEGATIVE_INFINITY) && price <= (isFinite(max) ? max : Number.POSITIVE_INFINITY);
//   };

//   // -------------------------
//   // Filters and derived lists
//   // -------------------------
//   const filteredProperties = allProperties.filter(property => {
//     const matchesSearch =
//       searchQuery === '' ||
//       property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       property.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       property.society?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       property.city.toLowerCase().includes(searchQuery.toLowerCase());

//     const matchesLocation =
//       selectedLocation === '' ||
//       property.location?.includes(selectedLocation) ||
//       property.city.includes(selectedLocation);

//     const matchesType =
//       selectedType === '' ||
//       property.type === selectedType ||
//       property.property_type === selectedType;

//     const matchesBudgetFilter = matchesBudget(property, selectedBudget);

//     const matchesBedrooms =
//       selectedBedrooms === '' ||
//       selectedBedrooms === 'Any' ||
//       // selectedBedrooms may be numeric string like '1'
//       (Number(selectedBedrooms) > 0 ? property.bedrooms === Number(selectedBedrooms) :
//         // or match labels like '1 BHK'
//         (selectedBedrooms.toString().toLowerCase().includes('1') ? property.bedrooms === 1 : true)
//       );

//     return matchesSearch && matchesLocation && matchesType && matchesBudgetFilter && matchesBedrooms;
//   });

//   // Sort properties
//   const sortedProperties = [...filteredProperties].sort((a, b) => {
//     switch (sortBy) {
//       case 'price_low':
//         return a.price - b.price;
//       case 'price_high':
//         return b.price - a.price;
//       case 'newest':
//         return new Date(b.postedDate || '').getTime() - new Date(a.postedDate || '').getTime();
//       case 'area_large':
//         return (b.area || b.square_feet || 0) - (a.area || a.square_feet || 0);
//       case 'rating':
//         return (b.rating || 0) - (a.rating || 0);
//       case 'ai_score':
//         return (b.aiScore || 0) - (a.aiScore || 0);
//       case 'price_growth':
//         return parseFloat((b.priceGrowth || '0').replace('+', '').replace('%', '')) - parseFloat((a.priceGrowth || '0').replace('+', '').replace('%', ''));
//       default:
//         return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
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
//       case '24/7 security':
//       case 'security': return <Shield className="text-green-500" size={14} />;
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

//   // -------------------------
//   // UI: render
//   // -------------------------
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

//                 {/* Location select (dynamic) */}
//                 <select
//                   value={selectedLocation}
//                   onChange={(e) => setSelectedLocation(e.target.value)}
//                   disabled={masterLoading}
//                   className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-60"
//                 >
//                   <option value="">{masterLoading ? 'Loading locations...' : 'All Locations'}</option>
//                   {locationOptions.map((loc) => (
//                     <option key={loc.value} value={loc.value}>
//                       {loc.label}
//                     </option>
//                   ))}
//                 </select>

//                 {/* Budget select (dynamic) */}
//                 <select
//                   value={selectedBudget}
//                   onChange={(e) => setSelectedBudget(e.target.value)}
//                   disabled={masterLoading}
//                   className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-60"
//                 >
//                   <option value="">{masterLoading ? 'Loading budgets...' : 'Any Budget'}</option>
//                   {budgetOptions.map((b) => (
//                     <option key={b.value || b.label} value={b.value || b.label}>
//                       {b.label || b.value}
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
//       {showAIRecommendations && !loading && allProperties.length > 0 && (
//         <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-3">
//                 <Bot className="text-yellow-300" size={20} />
//                 <span className="font-semibold">AI Recommendations:</span>
//                 <span className="text-sm">
//                   Found {allProperties.length} properties. {selectedLocation || 'Mumbai'} shows strong growth potential
//                 </span>
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
//                   disabled={masterLoading}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
//                 >
//                   <option value="">{masterLoading ? 'Loading types...' : 'All Types'}</option>
//                   {propertyTypeOptions.map(pt => (
//                     <option key={pt.value} value={pt.value}>
//                       {pt.label}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
//                 <select
//                   value={selectedBedrooms}
//                   onChange={(e) => setSelectedBedrooms(e.target.value)}
//                   disabled={masterLoading}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
//                 >
//                   <option value="">{masterLoading ? 'Loading...' : 'Any'}</option>
//                   {bedroomOptions.map(b => (
//                     <option key={b.value} value={b.value}>
//                       {b.label}
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
//                   {[
//                     { value: 'relevance', label: 'Most Relevant' },
//                     { value: 'price_low', label: 'Price: Low to High' },
//                     { value: 'price_high', label: 'Price: High to Low' },
//                     { value: 'newest', label: 'Newest First' },
//                     { value: 'area_large', label: 'Largest First' },
//                     { value: 'rating', label: 'Highest Rated' },
//                     { value: 'ai_score', label: 'AI Score High' },
//                     { value: 'price_growth', label: 'Best Growth' }
//                   ].map(opt => (
//                     <option key={opt.value} value={opt.value}>{opt.label}</option>
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

//         {/* Loading State */}
//         {loading && (
//           <div className="flex flex-col items-center justify-center py-16">
//             <LoadingSpinner size="lg" />
//             <p className="text-gray-600 mt-4">Loading properties...</p>
//           </div>
//         )}

//         {/* Error State */}
//         {error && !loading && (
//           <div className="text-center py-16">
//             <Home className="mx-auto text-gray-300 mb-6" size={64} />
//             <h3 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Properties</h3>
//             <p className="text-gray-600 mb-8">{error}</p>
//             <button
//               onClick={() => window.location.reload()}
//               className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
//             >
//               Try Again
//             </button>
//           </div>
//         )}

//         {/* Results Header */}
//         {!loading && !error && (
//           <div className="flex items-center justify-between mb-8">
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900">
//                 {filteredProperties.length} Properties Found
//               </h2>
//               <p className="text-gray-600">
//                 {selectedLocation && `in ${selectedLocation} • `}
//                 {selectedBudget && `${(budgetOptions.find(b => (b.value || b.label) === selectedBudget)?.label) || selectedBudget} • `}
//                 Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedProperties.length)} results
//               </p>
//             </div>
//             <div className="flex items-center space-x-4">
//               <div className="flex items-center space-x-2 text-sm text-gray-600">
//                 <Target className="text-blue-600" size={16} />
//                 <span>AI-Powered Search</span>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Properties Grid/List */}
//         {!loading && !error && filteredProperties.length > 0 && (
//           <>
//             {viewMode === 'grid' ? (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                 {paginatedProperties.map((property) => (
//                   <div
//                     key={property.id}
//                     className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer"
//                     onClick={() => {
//                       setCurrentPropertyView(property);
//                       if (onPropertyView) onPropertyView(property);
//                     }}
//                   >
//                     <div className="relative">
//                       <img
//                         src={property.images?.[0] || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'}
//                         alt={property.title}
//                         className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
//                       />

//                       {/* Property badges */}
//                       <div className="absolute top-3 left-3 flex space-x-2">
//                         {property.featured && (
//                           <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
//                             <Zap size={10} className="mr-1" />
//                             FEATURED
//                           </span>
//                         )}
//                         {property.verified && (
//                           <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
//                             <CheckCircle size={10} />
//                             <span>VERIFIED</span>
//                           </span>
//                         )}
//                         {(property.aiScore || 0) > 90 && (
//                           <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
//                             <Bot size={10} className="mr-1" />
//                             AI {property.aiScore}
//                           </span>
//                         )}
//                       </div>

//                       {/* Like button */}
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           toggleLike(property.id.toString());
//                         }}
//                         className="absolute top-3 right-3 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
//                       >
//                         <Heart
//                           size={16}
//                           className={likedProperties.includes(property.id.toString()) ? 'text-red-500 fill-current' : 'text-gray-600'}
//                         />
//                       </button>

//                       {/* Views counter */}
//                       <div className="absolute bottom-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
//                         <Eye size={10} />
//                         <span>{property.views || 0}</span>
//                       </div>
//                     </div>

//                     <div className="p-6">
//                       <div className="mb-3">
//                         <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
//                           {property.title}
//                         </h3>
//                         <div className="flex items-center text-gray-600 text-sm">
//                           <MapPin size={14} className="mr-1" />
//                           <span>{property.location || property.city}</span>
//                         </div>
//                       </div>

//                       <div className="flex items-center justify-between mb-4">
//                         <div>
//                           <div className="text-2xl font-bold text-green-600">{formatCurrency(property.price)}</div>
//                           <div className="text-xs text-gray-500">{property.type || property.property_type} • {property.area || property.square_feet} sq ft</div>
//                         </div>
//                         <div className="flex items-center space-x-1">
//                           <Star className="text-yellow-400 fill-current" size={14} />
//                           <span className="text-xs font-medium text-gray-700">{(property.rating || 4.5).toFixed(1)}</span>
//                           <span className="text-xs text-gray-500">({property.reviews || 0})</span>
//                         </div>
//                       </div>

//                       {/* AI Insights */}
//                       <div className="flex items-center justify-between mb-3 p-2 bg-blue-50 rounded-lg">
//                         <div className="flex items-center space-x-2">
//                           <TrendingUp className="text-green-600" size={12} />
//                           <span className="text-xs text-green-600 font-semibold">{property.priceGrowth || '+12%'}</span>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <BarChart3 className="text-blue-600" size={12} />
//                           <span className="text-xs text-blue-600 font-semibold">Grade {property.investmentGrade || 'A'}</span>
//                         </div>
//                       </div>

//                       {/* Property specs */}
//                       <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
//                         <div className="flex items-center space-x-1">
//                           <Bed size={12} />
//                           <span>{property.bedrooms} Beds</span>
//                         </div>
//                         <div className="flex items-center space-x-1">
//                           <Building size={12} />
//                           <span>{property.bathrooms} Baths</span>
//                         </div>
//                         <div className="flex items-center space-x-1">
//                           <Car size={12} />
//                           <span>{property.parking || 1} Parking</span>
//                         </div>
//                       </div>

//                       {/* Amenities */}
//                       <div className="flex flex-wrap gap-1 mb-3">
//                         {(property.amenities || []).slice(0, 3).map((amenity: string, i: number) => (
//                           <div key={i} className="flex items-center space-x-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
//                             {getAmenityIcon(amenity)}
//                             <span>{amenity}</span>
//                           </div>
//                         ))}
//                         {(property.amenities || []).length > 3 && (
//                           <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
//                             +{(property.amenities || []).length - 3}
//                           </span>
//                         )}
//                       </div>

//                       {/* Highlights */}
//                       <div className="flex flex-wrap gap-1 mb-3">
//                         {(property.highlights || []).map((highlight: string, i: number) => (
//                           <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
//                             {highlight}
//                           </span>
//                         ))}
//                       </div>

//                       {/* Actions */}
//                       <div className="flex items-center space-x-2">
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             setCurrentPropertyView(property);
//                             if (onPropertyView) onPropertyView(property);
//                           }}
//                           className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all text-sm"
//                         >
//                           View Details
//                         </button>
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             window.open(`tel:${property.agent?.phone}`);
//                           }}
//                           className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
//                         >
//                           <Phone size={16} />
//                         </button>
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             const message = `Hi, I'm interested in ${property.title} at ${property.location}. Price: ${formatCurrency(property.price)}. Can you share more details?`;
//                             window.open(`https://wa.me/${(property.agent?.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
//                           }}
//                           className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
//                         >
//                           <MessageCircle size={16} />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="space-y-6">
//                 {paginatedProperties.map((property) => (
//                   <div
//                     key={property.id}
//                     className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
//                     onClick={() => {
//                       setCurrentPropertyView(property);
//                       if (onPropertyView) onPropertyView(property);
//                     }}
//                   >
//                     <div className="md:flex">
//                       <div className="md:w-1/3 relative">
//                         <img
//                           src={property.images?.[0] || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'}
//                           alt={property.title}
//                           className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                         />
//                         <div className="absolute top-3 left-3 flex space-x-2">
//                           {property.featured && (
//                             <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
//                               FEATURED
//                             </span>
//                           )}
//                           {property.verified && (
//                             <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
//                               VERIFIED
//                             </span>
//                           )}
//                         </div>
//                       </div>

//                       <div className="md:w-2/3 p-5">
//                         <div className="flex items-start justify-between mb-4">
//                           <div>
//                             <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
//                               {property.title}
//                             </h3>
//                             <div className="flex items-center text-gray-600 mb-2">
//                               <MapPin size={16} className="mr-2" />
//                               <span>{property.location || property.city}</span>
//                             </div>
//                             <div className="text-sm text-gray-600">
//                               {property.society}
//                             </div>
//                           </div>
//                           <div className="text-right">
//                             <div className="text-2xl font-bold text-green-600">{formatCurrency(property.price)}</div>
//                             <div className="text-sm text-gray-500">₹{Math.round(property.price / (property.area || property.square_feet || 1)).toLocaleString()}/sq ft</div>
//                           </div>
//                         </div>

//                         <div className="grid grid-cols-4 gap-3 mb-4">
//                           <div className="text-center p-2 bg-gray-50 rounded-lg">
//                             <Bed className="mx-auto text-gray-600 mb-1" size={20} />
//                             <div className="font-semibold text-gray-900">{property.bedrooms}</div>
//                             <div className="text-xs text-gray-500">Bedrooms</div>
//                           </div>
//                           <div className="text-center p-2 bg-gray-50 rounded-lg">
//                             <Building className="mx-auto text-gray-600 mb-1" size={20} />
//                             <div className="font-semibold text-gray-900">{property.bathrooms}</div>
//                             <div className="text-xs text-gray-500">Bathrooms</div>
//                           </div>
//                           <div className="text-center p-2 bg-gray-50 rounded-lg">
//                             <Home className="mx-auto text-gray-600 mb-1" size={20} />
//                             <div className="font-semibold text-gray-900">{property.area || property.square_feet}</div>
//                             <div className="text-xs text-gray-500">Sq Ft</div>
//                           </div>
//                           <div className="text-center p-2 bg-gray-50 rounded-lg">
//                             <Car className="mx-auto text-gray-600 mb-1" size={20} />
//                             <div className="font-semibold text-gray-900">{property.parking || 1}</div>
//                             <div className="text-xs text-gray-500">Parking</div>
//                           </div>
//                         </div>

//                         {/* AI Insights for List View */}
//                         <div className="grid grid-cols-3 gap-3 mb-4">
//                           <div className="text-center p-2 bg-green-50 rounded-lg">
//                             <TrendingUp className="mx-auto text-green-600 mb-1" size={16} />
//                             <div className="text-sm font-semibold text-green-600">{property.priceGrowth || '+12%'}</div>
//                             <div className="text-xs text-gray-500">Growth</div>
//                           </div>
//                           <div className="text-center p-2 bg-purple-50 rounded-lg">
//                             <Bot className="mx-auto text-purple-600 mb-1" size={16} />
//                             <div className="text-sm font-semibold text-purple-600">{property.aiScore || 85}</div>
//                             <div className="text-xs text-gray-500">AI Score</div>
//                           </div>
//                           <div className="text-center p-2 bg-blue-50 rounded-lg">
//                             <BarChart3 className="mx-auto text-blue-600 mb-1" size={16} />
//                             <div className="text-sm font-semibold text-blue-600">{property.investmentGrade || 'A'}</div>
//                             <div className="text-xs text-gray-500">Grade</div>
//                           </div>
//                         </div>

//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center space-x-4">
//                             <div className="flex items-center space-x-1">
//                               <Star className="text-yellow-400 fill-current" size={16} />
//                               <span className="font-medium text-gray-700">{(property.rating || 4.5).toFixed(1)}</span>
//                               <span className="text-sm text-gray-500">({property.reviews || 0} reviews)</span>
//                             </div>
//                             <div className="text-sm text-gray-500">
//                               Posted {property.postedDate}
//                             </div>
//                           </div>

//                           <div className="flex items-center space-x-2">
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 setCurrentPropertyView(property);
//                                 if (onPropertyView) onPropertyView(property);
//                               }}
//                               className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all text-sm"
//                             >
//                               View Details
//                             </button>
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 toggleLike(property.id.toString());
//                               }}
//                               className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//                             >
//                               <Heart
//                                 size={16}
//                                 className={likedProperties.includes(property.id.toString()) ? 'text-red-500 fill-current' : 'text-gray-600'}
//                               />
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Pagination */}
//             {totalPages > 1 && (
//               <div className="flex items-center justify-center space-x-2 mt-12">
//                 <button
//                   onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                   disabled={currentPage === 1}
//                   className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Previous
//                 </button>

//                 <div className="flex space-x-1">
//                   {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                     const pageNumber = i + 1;
//                     return (
//                       <button
//                         key={pageNumber}
//                         onClick={() => setCurrentPage(pageNumber)}
//                         className={`px-4 py-2 rounded-lg ${currentPage === pageNumber
//                           ? 'bg-blue-600 text-white'
//                           : 'border border-gray-300 hover:bg-gray-50'
//                           }`}
//                       >
//                         {pageNumber}
//                       </button>
//                     );
//                   })}
//                 </div>

//                 <button
//                   onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                   disabled={currentPage === totalPages}
//                   className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Next
//                 </button>
//               </div>
//             )}
//           </>
//         )}

//         {/* No results */}
//         {!loading && !error && filteredProperties.length === 0 && allProperties.length > 0 && (
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

//         {/* Empty state when no properties from API */}
//         {!loading && !error && allProperties.length === 0 && (
//           <div className="text-center py-16">
//             <Home className="mx-auto text-gray-300 mb-6" size={64} />
//             <h3 className="text-2xl font-bold text-gray-900 mb-4">No Properties Available</h3>
//             <p className="text-gray-600 mb-8">
//               Properties will appear here once they are added to the system
//             </p>
//             <button
//               onClick={() => window.location.reload()}
//               className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold"
//             >
//               Refresh Page
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default PublicPropertiesPage;




// PublicPropertiesPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Search,
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
  Bed,
  Car,
  Wifi,
  Dumbbell,
  Shield,
  TreePine,
  Waves,
  CheckCircle,
  SlidersHorizontal,
  Bot,
  Zap,
  Target,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import PublicPropertyDetailPage from './PublicPropertyDetailPage';
import { propertiesAPI } from '@/lib/propertiesAPI';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import viewsAPI from '@/lib/viewAPI';

interface Property {
  id: number;
  title: number | string;
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
  unit_type?: string;
  property_subtype?: string;
  carpet_area?: number;
  builtup_area?: number;
  _raw?: any;
  slug?: string;
  total_views?: number;
  public_views?: number | null;
}

const PublicPropertiesPage = ({ onPropertyView }: any) => {
  const navigate = useNavigate();
  const location = useLocation();

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
  const [currentPropertyView, setCurrentPropertyView] = useState<any>('');
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [masterLoading, setMasterLoading] = useState(true);
  const [masters, setMasters] = useState<Record<string, MasterOption[]>>({});

  // Track viewed properties in current session to prevent duplicate views
  const [viewedProperties, setViewedProperties] = useState<Set<number>>(new Set());

  // Parse filter token from URL
  const queryParams = new URLSearchParams(location.search);
  const filterParamKey =
    queryParams.has('filterToken') ? 'filterToken' :
    (queryParams.has('fltcnt') ? 'fltcnt' : undefined);
  const filterTokenFromUrl = filterParamKey ? (queryParams.get(filterParamKey) as string | null) ?? undefined : undefined;

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        setMasterLoading(true);
        const data = await getMasterDropdownOptions(['common', 'lead', 'property']);
        setMasters(data || {});
      } catch (err) {
        console.error('Error fetching master options:', err);
      } finally {
        setMasterLoading(false);
      }
    };

    fetchMasters();
  }, []);

  // Function to fetch view counts for properties - only total views
  const fetchPropertyViews = async (propertyId: number): Promise<{ total_views: number }> => {
    try {
      const viewData = await viewsAPI.getByProperty(propertyId, false); // Get total views only
      
      return {
        total_views: viewData?.total_views || 0
      };
    } catch (err) {
      console.error(`Error fetching views for property ${propertyId}:`, err);
      return { total_views: 0 };
    }
  };

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await propertiesAPI.getProperties({
          status: 'Available',
          limit: 50,
        });

        if (response?.data && Array.isArray(response.data)) {
          // Map properties and fetch view counts
          const transformedProperties = await Promise.all(response.data.map(async (p: any, index: number) => {
            // Fetch actual view counts from API - only total views
            const viewCounts = await fetchPropertyViews(p.id);

            return {
              id: p.id,
              slug: p.slug,
              title: p.title || `${p.unit_type || ''} ${p.property_type_name || ''}`.trim() || `Property ${p.id}`,
              price: Number(p.budget) || 0,
              bedrooms: Number(p.bedrooms) || 0,
              bathrooms: Number(p.bathrooms) || 0,
              square_feet: Number(p.carpet_area) || Number(p.builtup_area) || 0,
              city: p.city_name || p.city || '',
              property_type: p.property_type_name || p.property_type || '',
              status: p.status || '',
              images: Array.isArray(p.photos) ? p.photos.map((ph: string) => ph.replace(/\\/g, '/')) : ['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'],
              location: `${p.location_name || p.location || ''}`.replace(/\s*,\s*$/, ''),
              society: p.society_name || p.project_name || `Society ${p.id}`,
              area: Number(p.carpet_area) || Number(p.builtup_area) || 0,
              parking: Number(p.parking_slots) || Math.floor(Math.random() * 3) + 1,
              type: p.unit_type || p.property_subtype || p.property_type_name || p.property_type || 'Apartment',
              furnishing: p.furnishing_status || ['Fully Furnished', 'Semi Furnished', 'Unfurnished'][index % 3],
              possession: p.possession_status || ['Ready to Move', 'Under Construction'][index % 2],
              amenities: p.amenities ?
                (Array.isArray(p.amenities) ? p.amenities :
                  typeof p.amenities === 'string' ? p.amenities.split(',').map((a: string) => a.trim()) :
                    ['Swimming Pool', 'Gym', 'Security', 'Garden', 'Club House', 'Power Backup']) :
                ['Swimming Pool', 'Gym', 'Security', 'Garden', 'Club House', 'Power Backup'],
              featured: p.featured || index < 3,
              verified: p.verified !== false,
              // Enhanced rating logic - use API data or generate realistic static rating
              rating: p.rating ? Number(p.rating) : (4.0 + Math.random() * 1.0),
              reviews: p.reviews ? Number(p.reviews) : Math.floor(Math.random() * 50) + 5,
              postedDate: p.created_at ? p.created_at.split('T')[0] : `2025-01-${String(Math.floor(Math.random() * 15) + 1).padStart(2, '0')}`,
              // Use API view counts instead of random values - only total views
              views: viewCounts.total_views || 0,
              total_views: viewCounts.total_views,
              aiScore: p.ai_score || Math.floor(Math.random() * 30) + 70,
              priceGrowth: p.price_growth || `+${(Math.random() * 20 + 5).toFixed(1)}%`,
              investmentGrade: p.investment_grade || ['A++', 'A+', 'A', 'B+'][Math.floor(Math.random() * 4)],
              agent: {
                name: p.agent_name || `Agent ${index + 1}`,
                phone: p.agent_phone || `+91 99999 999${String(index % 100).padStart(2, '0')}`,
                rating: p.agent_rating || (4 + Math.random())
              },
              highlights: p.highlights || ['Prime Location', 'Good Value', 'Verified', 'No Brokerage'].slice(0, (index % 4) + 1),
              nearbyPlaces: p.nearby_places || [
                { name: 'Metro Station', distance: `${(Math.random() * 2).toFixed(1)} km` },
                { name: 'Shopping Mall', distance: `${(Math.random() * 3).toFixed(2)} km` },
                { name: 'School', distance: `${(Math.random() * 2).toFixed(1)} km` }
              ],
              public_views: p.public_views ?? null,
              _raw: p
            };
          }));

          setAllProperties(transformedProperties);
          setError('');
        } else {
          console.warn('Unexpected response data:', response);
          setError('No properties found');
          setAllProperties([]);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
        setError('Failed to load properties. Please try again.');
        setAllProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const findMasterOptions = (candidateKeys: string[]) => {
    if (!masters || typeof masters !== 'object') return [];
    const normalizedMap: Record<string, string> = {};
    Object.keys(masters).forEach((k) => {
      normalizedMap[k.toLowerCase().replace(/\s+/g, '')] = k;
    });

    for (const ck of candidateKeys) {
      const nk = ck.toLowerCase().replace(/\s+/g, '');
      if (normalizedMap[nk]) {
        const realKey = normalizedMap[nk];
        const arr = masters[realKey];
        if (Array.isArray(arr)) return arr;
      }
    }

    for (const ck of candidateKeys) {
      const nk = ck.toLowerCase().replace(/\s+/g, '');
      const foundKey = Object.keys(masters).find(k => k.toLowerCase().replace(/\s+/g, '').includes(nk));
      if (foundKey) {
        const arr = masters[foundKey];
        if (Array.isArray(arr)) return arr;
      }
    }

    return [];
  };

  const locationsMaster: MasterOption[] = findMasterOptions(['location', 'locations', 'place', 'place name', 'city', 'area']);
  const locationOptions = locationsMaster.map(o => ({ value: o.value, label: o.label }));

  const budgetMaster: MasterOption[] = findMasterOptions(['price range', 'price_range', 'budget', 'budget range', 'priceRange', 'price']);
  const budgetOptions = budgetMaster.map(o => ({ value: o.value, label: o.label }));

  const propertyTypesMaster: MasterOption[] = findMasterOptions(['property type', 'property_type', 'type', 'place type', 'category']);
  const propertyTypeOptions = propertyTypesMaster.map(o => ({ value: o.value || o.label, label: o.label || o.value }));

  const bedroomsMaster: MasterOption[] = findMasterOptions(['bedrooms', 'bhk', 'beds', 'unit type', 'unit', 'unit_type']);
  const bedroomOptions = bedroomsMaster
    .map(o => {
      const text = (o.value || o.label || '').toString();
      const m = text.match(/(\d+)/);
      if (m) {
        const num = m[1];
        return { value: num, label: `${num} BHK` };
      }
      return { value: text, label: o.label || text };
    })
    .filter((v, i, arr) => arr.findIndex(x => x.value === v.value) === i);

  const parseMoneyToken = (tok: string) => {
    if (!tok) return NaN;
    const t = tok.toLowerCase().replace(/\s+/g, '');
    const match = t.match(/^([0-9.,]+)(k|m|l|cr|crore|lakh)?\+?$/i);
    if (match) {
      let num = parseFloat(match[1].replace(/,/g, ''));
      const unit = (match[2] || '').toLowerCase();
      if (unit === 'k') num *= 1000;
      else if (unit === 'm') num *= 1000000;
      else if (unit === 'l' || unit === 'lakh') num *= 100000;
      else if (unit === 'cr' || unit === 'crore') num *= 10000000;
      return Math.round(num);
    }
    const plain = parseFloat(t.replace(/,/g, ''));
    return isNaN(plain) ? NaN : plain;
  };

  const parseBudgetRange = (value: string): [number, number] => {
    if (!value) return [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];
    const v = value.toString().trim();
    if (v.includes('-')) {
      const parts = v.split('-').map(s => s.trim());
      const min = parseMoneyToken(parts[0]);
      const max = parseMoneyToken(parts[1]);
      return [isNaN(min) ? Number.NEGATIVE_INFINITY : min, isNaN(max) ? Number.POSITIVE_INFINITY : max];
    }
    if (v.endsWith('+')) {
      const tok = v.replace(/\+$/, '');
      const min = parseMoneyToken(tok);
      return [isNaN(min) ? Number.NEGATIVE_INFINITY : min, Number.POSITIVE_INFINITY];
    }
    const nums = v.match(/([0-9.,]+)\s*(k|m|l|cr|crore|lakh)?/gi);
    if (nums && nums.length === 1) {
      const max = parseMoneyToken(nums[0]);
      return [Number.NEGATIVE_INFINITY, isNaN(max) ? Number.POSITIVE_INFINITY : max];
    }
    return [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];
  };

  const matchesBudget = (property: Property, budget: string) => {
    if (!budget) return true;
    const [min, max] = parseBudgetRange(budget);
    const price = property.price || 0;
    return price >= (isFinite(min) ? min : Number.NEGATIVE_INFINITY) && price <= (isFinite(max) ? max : Number.POSITIVE_INFINITY);
  };

  const extractUnitType = (p: Property) => {
    const candidates = [
      p.type,
      (p as any)._raw?.unit_type,
      (p as any)._raw?.unit_type_name,
      p.title as any,
      p.property_type,
    ].filter(Boolean).map(String);

    for (const c of candidates) {
      const m = c.match(/(\d+\s*BHK|\d+BHK|studio|Studio|1RK|1RK)/i);
      if (m) return m[0].replace(/\s+/g, '');
    }

    if (p.bedrooms && Number.isFinite(p.bedrooms) && p.bedrooms > 0) return `${p.bedrooms}BHK`;

    return '';
  };

  const composeHeaderTitle = (p: Property) => {
    const parts: string[] = [];

    const type = (p.property_type || p.type || (p as any)._raw?.property_type_name || '').toString().trim();
    if (type) parts.push(type);

    const unit = extractUnitType(p);
    if (unit) parts.push(unit);

    const subtype = ((p as any)._raw?.property_subtype_name || (p as any)._raw?.property_subtype || (p as any)._raw?.subtype || p.society || '').toString().trim();
    if (subtype) parts.push(subtype);

    if (parts.length === 0 && p.title) {
      return p.title as any;
    }

    return parts.join(' ');
  };

  const formatUnitAreaLine = (p: Property) => {
    const unit = extractUnitType(p);
    const area = p.area || p.square_feet || (p as any)._raw?.carpet_area || (p as any)._raw?.builtup_area;
    const areaText = area ? `${Number(area).toFixed(area % 1 === 0 ? 0 : 2).replace(/\.0+$/, '')} sq ft` : '';
    return [unit, areaText].filter(Boolean).join(' \u2022 ');
  };

  const splitLocationCity = (p: Property) => {
    const loc = (p.location || '').toString();
    if (!loc) return { locationPart: '', cityPart: p.city || '' };
    const parts = loc.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === 1) return { locationPart: parts[0], cityPart: p.city || '' };
    const cityPart = parts.slice(-1).join(', ');
    const locationPart = parts.slice(0, -1).join(', ');
    return { locationPart, cityPart: cityPart || (p.city || '') };
  };

  const filteredProperties = allProperties.filter(property => {
    const matchesSearch =
      searchQuery === '' ||
      String(property.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (property.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (property.society || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (property.city || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation =
      selectedLocation === '' ||
      (property.location || '').includes(selectedLocation) ||
      (property.city || '').includes(selectedLocation);

    const matchesType =
      selectedType === '' ||
      property.type === selectedType ||
      property.property_type === selectedType;

    const matchesBudgetFilter = matchesBudget(property, selectedBudget);

    const matchesBedrooms =
      selectedBedrooms === '' ||
      selectedBedrooms === 'Any' ||
      (Number(selectedBedrooms) > 0 ? property.bedrooms === Number(selectedBedrooms) :
        (selectedBedrooms.toString().toLowerCase().includes('1') ? property.bedrooms === 1 : true)
      );

    return matchesSearch && matchesLocation && matchesType && matchesBudgetFilter && matchesBedrooms;
  });

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

  const preserveAndAddToken = (existingSearch: string, paramKey: string, token?: string | null) => {
    const params = new URLSearchParams(existingSearch || '');
    if (token) {
      params.set(paramKey, token);
    }
    const s = params.toString();
    return s ? `?${s}` : '';
  };

  // Enhanced navigation function - ONLY analytics, NO view recording
  const handleNavigateToProperty = async (property: Property) => {
    const id = property.id;
    const slug = property.slug;
    if (!slug) {
      console.warn('Attempted to navigate to property without slug:', id);
      setCurrentPropertyView(property);
      if (onPropertyView) onPropertyView(property);
      return;
    }

    // Check if this property has already been clicked in this session
    if (viewedProperties.has(id)) {
      console.log(`Property ${id} already clicked in this session`);
      // Still navigate but don't send analytics
      let dest = `/properties/${encodeURIComponent(String(slug))}`;
      const mergedQs = preserveAndAddToken(location.search, filterParamKey || 'fltcnt', filterTokenFromUrl);
      navigate(dest + mergedQs);
      return;
    }

    let finalToken = filterTokenFromUrl ?? null;
    const finalParamKey = filterParamKey ?? 'fltcnt';

    const inferredFilters = {
      search: searchQuery || null,
      location: selectedLocation || null,
      budget: selectedBudget || null,
      propertyType: selectedType || null,
      bedrooms: selectedBedrooms || null,
      clickedPropertyId: id,
      source: 'properties_list',
    };

    if (!finalToken) {
      try {
        const createRes = await propertiesAPI.createFilterContext({ filters: inferredFilters });
        if (createRes) {
          const idFromRes = (createRes as any).id || (createRes as any).filterId || null;
          if (idFromRes) finalToken = String(idFromRes);
          else if ((createRes as any).data && (createRes as any).data.id) {
            finalToken = String((createRes as any).data.id);
          } else {
            if ((createRes as any).success && (createRes as any).id) {
              finalToken = String((createRes as any).id);
            }
          }
        }
      } catch (err) {
        console.warn('createFilterContext failed (continuing without token):', err);
      }
    }

    // *** REMOVED VIEW RECORDING - Let page load handle it ***
    // Only send click analytics event
    try {
      await propertiesAPI.sendPropertyEvent(
        id,
        'click',
        'listing_card_click',
        { source: 'properties_list', title: property.title || null },
        { slug, filterToken: finalToken || undefined, filterParamKey: finalParamKey }
      );
      
      // Mark this property as clicked in current session (prevent duplicate clicks)
      setViewedProperties(prev => new Set(prev).add(id));
      
      console.log(`Click event sent for property ${id}`);
    } catch (err) {
      console.warn('sendPropertyEvent failed (we will still navigate):', err);
    }

    const mergedQs = preserveAndAddToken(location.search, finalParamKey, finalToken);
    const dest = `/properties/${encodeURIComponent(String(slug))}${mergedQs}`;
    navigate(dest);
  };

  if (currentPropertyView) {
    return (
      <PublicPropertyDetailPage
        property={currentPropertyView}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Explore Premium Properties
            </h1>
            <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
              Discover verified properties from trusted sellers across Mumbai's most desirable locations
            </p>

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
                  disabled={masterLoading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-60"
                >
                  <option value="">{masterLoading ? 'Loading locations...' : 'All Locations'}</option>
                  {locationOptions.map((loc) => (
                    <option key={loc.value} value={loc.value}>
                      {loc.label}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  disabled={masterLoading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:opacity-60"
                >
                  <option value="">{masterLoading ? 'Loading budgets...' : 'Any Budget'}</option>
                  {budgetOptions.map((b) => (
                    <option key={b.value || b.label} value={b.value || b.label}>
                      {b.label || b.value}
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
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  disabled={masterLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                >
                  <option value="">{masterLoading ? 'Loading types...' : 'All Types'}</option>
                  {propertyTypeOptions.map(pt => (
                    <option key={pt.value} value={pt.value}>
                      {pt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <select
                  value={selectedBedrooms}
                  onChange={(e) => setSelectedBedrooms(e.target.value)}
                  disabled={masterLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                >
                  <option value="">{masterLoading ? 'Loading...' : 'Any'}</option>
                  {bedroomOptions.map(b => (
                    <option key={b.value} value={b.value}>
                      {b.label}
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
                  {[
                    { value: 'relevance', label: 'Most Relevant' },
                    { value: 'price_low', label: 'Price: Low to High' },
                    { value: 'price_high', label: 'Price: High to Low' },
                    { value: 'newest', label: 'Newest First' },
                    { value: 'area_large', label: 'Largest First' },
                    { value: 'rating', label: 'Highest Rated' },
                    { value: 'ai_score', label: 'AI Score High' },
                    { value: 'price_growth', label: 'Best Growth' }
                  ].map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
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

        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4">Loading properties...</p>
          </div>
        )}

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

        {!loading && !error && (
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredProperties.length} Properties Found
              </h2>
              <p className="text-gray-600">
                {selectedLocation && `in ${selectedLocation} • `}
                {selectedBudget && `${(budgetOptions.find(b => (b.value || b.label) === selectedBudget)?.label) || selectedBudget} • `}
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

        {!loading && !error && filteredProperties.length > 0 && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProperties.map((property) => {
                  const composedTitle = composeHeaderTitle(property);
                  const unitAreaLine = formatUnitAreaLine(property);
                  const { locationPart, cityPart } = splitLocationCity(property);
                  return (
                    <div
                      key={property.id}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group cursor-pointer"
                      onClick={() => {
                        if (property.slug) {
                          handleNavigateToProperty(property);
                          return;
                        }
                        setCurrentPropertyView(property);
                        if (onPropertyView) onPropertyView(property);
                      }}
                    >
                      <div className="relative">
                        <img
                          src={property.images?.[0] || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'}
                          alt={String(property.title)}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        />

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

                        <div className="absolute bottom-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                          <Eye size={10} />
                          <span>
                            {/* Display only total view count from API */}
                            {property.total_views || property.views || 0}
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="mb-3">
                          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                            {composedTitle}
                          </h3>

                          <div className="flex items-center text-gray-600 text-sm mb-1">
                            <MapPin size={14} className="mr-1" />
                            <span>{locationPart}{locationPart && cityPart ? ', ' : ''}{cityPart}</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="text-2xl font-bold text-green-600">{formatCurrency(property.price)}</div>
                          <div className="text-xs text-gray-500">{property.type || property.property_type} • {property.area || property.square_feet} sq ft</div>
                        </div>

                        {/* Rating Display - Added */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-1">
                            <Star className="text-yellow-400 fill-current" size={14} />
                            <span className="text-sm font-medium text-gray-700">
                              {(property.rating || 4.2).toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({property.reviews || 0} reviews)
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {property.postedDate}
                          </div>
                        </div>

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

                        <div className="flex flex-wrap gap-1 mb-3">
                          {(property.highlights || []).map((highlight: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                              {highlight}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center space-x-2">
                          {(typeof property.slug === 'string' && property.slug.trim().length > 0) ? (
                            <div className="flex-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNavigateToProperty(property);
                                }}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all text-sm"
                              >
                                View Details
                              </button>
                            </div>
                          ) : (
                            <button
                              disabled
                              aria-disabled="true"
                              title="Details not available – missing backend slug"
                              className="w-full bg-gray-300 text-gray-600 py-2 px-3 rounded-lg cursor-not-allowed"
                            >
                              View Details
                            </button>
                          )}

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
                  );
                })}
              </div>
            ) : (
              <div className="space-y-6">
                {paginatedProperties.map((property) => {
                  const composedTitle = composeHeaderTitle(property);
                  const unitAreaLine = formatUnitAreaLine(property);
                  const { locationPart, cityPart } = splitLocationCity(property);
                  return (
                    <div
                      key={property.id}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
                      onClick={() => {
                        if (property.slug) {
                          handleNavigateToProperty(property);
                          return;
                        }
                        setCurrentPropertyView(property);
                        if (onPropertyView) onPropertyView(property);
                      }}
                    >
                      <div className="md:flex">
                        <div className="md:w-1/3 relative">
                          <img
                            src={property.images?.[0] || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'}
                            alt={String(property.title)}
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

                          <div className="absolute bottom-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                            <Eye size={10} />
                            <span>
                              {/* Display only total view count from API */}
                              {property.total_views || property.views || 0} views
                            </span>
                          </div>
                        </div>

                        <div className="md:w-2/3 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                {composedTitle}
                              </h3>
                              <div className="flex items-center text-gray-600 mb-2">
                                <MapPin size={16} className="mr-2" />
                                <span>{locationPart}{locationPart && cityPart ? ', ' : ''}{cityPart}</span>
                              </div>
                              <div className="text-sm text-gray-600">
                                <span>{unitAreaLine}</span>
                              </div>
                            </div>

                            {/* Rating Display in List View - Added */}
                            <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-lg">
                              <Star className="text-yellow-400 fill-current" size={16} />
                              <span className="font-semibold text-gray-700">
                                {(property.rating || 4.2).toFixed(1)}
                              </span>
                              <span className="text-sm text-gray-500">
                                ({property.reviews || 0})
                              </span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(property.price)}</div>
                            <div className="text-sm text-gray-500">₹{Math.round(property.price / (property.area || property.square_feet || 1)).toLocaleString()}/sq ft</div>
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
                              <div className="text-sm text-gray-500">
                                Posted {property.postedDate}
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {(typeof property.slug === 'string' && property.slug.trim().length > 0) ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNavigateToProperty(property);
                                  }}
                                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                  View Details
                                </button>
                              ) : (
                                <button
                                  disabled
                                  aria-disabled="true"
                                  title="Details not available – missing backend slug"
                                  className="bg-gray-300 text-gray-600 px-6 py-2 rounded-lg cursor-not-allowed"
                                >
                                  View Details
                                </button>
                              )}

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
                  );
                })}
              </div>
            )}

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