// // src/components/marketing/PropertyBrochureModal.tsx
// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import {
//   X,
//   Download,
//   Send,
//   MapPin,
//   BedDouble,
//   Bath,
//   Car,
//   Ruler,
//   CheckCircle,
//   Sparkles,
//   Phone,
//   User,
// } from 'lucide-react';
// import { toast } from 'react-toastify';
// import propertiesAPI from '@/lib/propertiesAPI';
// import propertyTagsAPI from '@/lib/propertyTagsAPI';
// import getTagStyle, { DEFAULT_TAG_STYLE, TagTone } from '@/lib/tagStyles';

// /* -------------------- Types -------------------- */
// type AssignedTo = { name?: string; email?: string; phone?: string } | null;

// type Property = {
//   id?: string | number;
//   title?: string;
//   propertyId?: string | number;
//   location?: string;
//   locationNormalized?: string;
//   city?: string;
//   budget?: number | string | null;
//   price?: number | string | null;
//   type?: string;
//   unitType?: string;
//   subtype?: string;
//   carpetArea?: number | string;
//   square_feet?: number | string;
//   bedrooms?: number;
//   bathrooms?: number;
//   parking?: number;
//   photos?: string[];
//   images?: string[];
//   amenities?: string[];
//   furnishingItems?: string[];
//   description?: string;
//   furnishing?: string;
//   possession?: string;
//   possessionMonth?: string | number;
//   possessionYear?: string | number;
//   facing?: string;
//   builtYear?: string | number;
//   verified?: boolean;
//   featured?: boolean;
//   listedDays?: number;
//   aiScore?: number;
//   priceGrowth?: string;
//   investmentGrade?: string;
//   assigned_to?: AssignedTo;
//   raw?: any;
//   executive?: { name?: string; email?: string; phone?: string } | null;
//   assignedTo?: { name?: string; email?: string; phone?: string } | null;
//   executive_name?: string;
//   executive_email?: string;
//   executive_phone?: string;
// };

// type ContentOption = {
//   key: string;
//   label: string;
//   description: string;
//   category: 'basic' | 'details' | 'features' | 'location' | 'investment' | 'contact';
// };

// type Customizations = {
//   primaryColor: string;
//   secondaryColor: string;
//   fontStyle: 'modern' | 'classic' | 'elegant' | 'bold' | string;
//   layout: 'standard' | 'magazine' | 'grid' | 'story' | string;
//   watermark: boolean;
//   selectedContent: Set<string> | string[];
// };

// type Props = {
//   isOpen: boolean;
//   onClose: () => void;
//   property: Property | null;
// };

// /* -------------------- Content Options -------------------- */
// const CONTENT_OPTIONS: ContentOption[] = [
//   { key: 'propertyType', label: 'Property Type', description: 'Property type, unit type, subtype', category: 'basic' },
//   { key: 'location', label: 'Location', description: 'Full address and locality', category: 'basic' },
//   { key: 'price', label: 'Price', description: 'Property price and price per sq ft', category: 'basic' },
//   { key: 'carpetArea', label: 'Carpet Area', description: 'Total carpet area in sq ft', category: 'basic' },
//   { key: 'mainImage', label: 'Main Property Image', description: 'Primary property photo', category: 'basic' },
//   { key: 'bedrooms', label: 'Bedrooms', description: 'Number of bedrooms', category: 'details' },
//   { key: 'bathrooms', label: 'Bathrooms', description: 'Number of bathrooms', category: 'details' },
//   { key: 'parking', label: 'Parking', description: 'Parking spaces available', category: 'details' },
//   { key: 'furnishing', label: 'Furnishing Status', description: 'Furnished/Semi/Unfurnished', category: 'details' },
//   { key: 'possession', label: 'Possession', description: 'Possession date/status', category: 'details' },
//   { key: 'facing', label: 'Facing Direction', description: 'Property facing direction', category: 'details' },
//   { key: 'builtYear', label: 'Built Year', description: 'Year of construction', category: 'details' },
//   { key: 'floor', label: 'Floor Details', description: 'Floor number and total floors', category: 'details' },
//   { key: 'wing', label: 'Wing/Tower', description: 'Wing or tower name', category: 'details' },
//   { key: 'unitNo', label: 'Unit Number', description: 'Specific unit number', category: 'details' },
//   { key: 'description', label: 'Property Description', description: 'Detailed description', category: 'features' },
//   { key: 'amenities', label: 'Amenities', description: 'All property amenities', category: 'features' },
//   { key: 'furnishingItems', label: 'Furnishing Items', description: 'List of furnishing items', category: 'features' },
//   { key: 'verified', label: 'Verification Badge', description: 'Verified property badge', category: 'features' },
//   { key: 'featured', label: 'Featured Badge', description: 'Premium/Featured badge', category: 'features' },
//   { key: 'nearbyPlaces', label: 'Nearby Places', description: 'Schools, hospitals, transport', category: 'location' },
//   { key: 'locationMap', label: 'Location Map', description: 'Area map visualization', category: 'location' },
//   { key: 'aiScore', label: 'AI Property Score', description: 'AI-based property rating', category: 'investment' },
//   { key: 'priceGrowth', label: 'Price Growth', description: 'Expected price appreciation', category: 'investment' },
//   { key: 'investmentGrade', label: 'Investment Grade', description: 'Investment rating', category: 'investment' },
//   { key: 'roiPotential', label: 'ROI Potential', description: 'Return on investment', category: 'investment' },
//   { key: 'marketPosition', label: 'Market Position', description: 'Position in locality', category: 'investment' },
//   { key: 'assignedToInfo', label: 'Assigned Executive', description: 'Assigned person name & contact', category: 'contact' },
//   { key: 'contactDetails', label: 'Contact Phone', description: 'Primary contact phone', category: 'contact' },
// ];

// const CATEGORY_LABELS: Record<string, string> = {
//   basic: 'Basic Information',
//   details: 'Property Details',
//   features: 'Features & Amenities',
//   location: 'Location & Connectivity',
//   investment: 'Investment Analytics',
//   contact: 'Contact Information',
// };

// /* -------------------- Options -------------------- */
// const brochureTemplates = [
//   { value: 'premium', label: 'Premium Template', description: 'Luxury design with elegant layout', preview: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=300' },
//   { value: 'modern', label: 'Modern Template', description: 'Clean and contemporary design', preview: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=300' },
//   { value: 'classic', label: 'Classic Template', description: 'Traditional and professional', preview: 'https://images.pexels.com/photos/1396125/pexels-photo-1396125.jpeg?auto=compress&cs=tinysrgb&w=300' },
//   { value: 'minimal', label: 'Minimal Template', description: 'Simple and focused design', preview: 'https://images.pexels.com/photos/1396126/pexels-photo-1396126.jpeg?auto=compress&cs=tinysrgb&w=300' },
// ];

// const fontStyles = [
//   { value: 'modern', label: 'Modern Sans' },
//   { value: 'classic', label: 'Classic Serif' },
//   { value: 'elegant', label: 'Elegant Script' },
//   { value: 'bold', label: 'Bold Impact' },
// ];

// const layoutOptions = [
//   { value: 'standard', label: 'Standard Layout' },
//   { value: 'magazine', label: 'Magazine Style' },
//   { value: 'grid', label: 'Grid Layout' },
//   { value: 'story', label: 'Story Format' },
// ];

// const defaultCustomizations = (): Customizations => ({
//   primaryColor: '#E6761D',
//   secondaryColor: '#0b3856',
//   fontStyle: 'modern',
//   layout: 'standard',
//   watermark: true,
//   selectedContent: new Set(['propertyType', 'location', 'price', 'carpetArea', 'mainImage', 'bedrooms', 'bathrooms', 'description']),
// });

// /* -------------------- Utils -------------------- */
// const safeNumber = (v?: number | string | null): number => {
//   if (v == null || v === '') return 0;
//   if (typeof v === 'number') return v;
//   const n = Number(String(v).replace(/[^\d.-]/g, ''));
//   return Number.isNaN(n) ? 0 : n;
// };

// const formatCurrency = (amount?: number | string | null) => {
//   const n = safeNumber(amount);
  
//   // Fixed lakhs formatting - properly handle 60.5L, 75L, etc.
//   if (n >= 10_000_000) {
//     return `₹${(n / 10_000_000).toFixed(1)}Cr`;
//   }
//   if (n >= 100_000) {
//     const lakhs = n / 100_000;
//     // Check if it's a whole number or has decimal
//     if (lakhs % 1 === 0) {
//       return `₹${lakhs.toFixed(0)}L`;
//     } else {
//       return `₹${lakhs.toFixed(1)}L`;
//     }
//   }
//   return `₹${n.toLocaleString('en-IN')}`;
// };

// const displayOrDash = (val: any) => {
//   if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) return '—';
//   if (typeof val === 'number' && !Number.isFinite(val)) return '—';
//   return val;
// };

// const getMonthName = (value?: string | number | null) => {
//   if (!value) return '';
//   const month = typeof value === 'string' ? parseInt(value) : value;
//   if (isNaN(month) || month < 1 || month > 12) return '';
//   return new Date(0, month - 1).toLocaleString('en', { month: 'long' });
// };

// function useOutsideClick<T extends HTMLElement>(onClose: () => void) {
//   const ref = useRef<T | null>(null);
//   useEffect(() => {
//     function handler(e: MouseEvent) {
//       if (ref.current && !ref.current.contains(e.target as Node)) onClose();
//     }
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, [onClose]);
//   return ref;
// }

// /* -------------------- Small helpers -------------------- */
// const isDataUrl = (s: string) => /^data:/.test(s);

// async function fetchAsDataUrl(url: string): Promise<string | null> {
//   try {
//     const res = await fetch(url, { mode: 'cors' });
//     const blob = await res.blob();
//     return await new Promise<string>((resolve) => {
//       const reader = new FileReader();
//       reader.onloadend = () => resolve(String(reader.result || ''));
//       reader.readAsDataURL(blob);
//     });
//   } catch {
//     return null;
//   }
// }

// /** Normalize assigned executive */
// function normalizeAssignedTo(p?: Property | null): AssignedTo {
//   if (!p) return null;

//   const candidates: AssignedTo[] = [
//     p.assigned_to ?? null,
//     p.assignedTo ?? null,
//     p.executive ?? null,
//   ].filter(Boolean) as AssignedTo[];

//   const flat: AssignedTo = {
//     name: p.executive_name || p.raw?.assigned_to_name || p.raw?.executive_name,
//     email: p.executive_email || p.raw?.assigned_to_email || p.raw?.executive_email,
//     phone: p.executive_phone || p.raw?.assigned_to_phone || p.raw?.executive_phone,
//   };

//   const base = { ...(candidates[0] || {}) };
//   const name = base.name || flat.name;
//   const email = base.email || flat.email;
//   const phone = base.phone || flat.phone;

//   if (!name && !email && !phone) return null;

//   return { name, email, phone };
// }

// /* ==================== Tag Badge ==================== */
// const TagBadge: React.FC<{ label: string }> = ({ label }) => {
//   const tone: TagTone = getTagStyle(label, DEFAULT_TAG_STYLE);
//   const maybeIconOrEmoji = tone.emoji;
//   const IconComp = typeof maybeIconOrEmoji === 'function' ? (maybeIconOrEmoji as any) : null;
//   const emoji = typeof maybeIconOrEmoji === 'string' ? maybeIconOrEmoji : null;

//   return (
//     <span
//       className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] leading-tight ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}
//       style={{ backdropFilter: 'saturate(1.2) blur(2px)' }}
//       title={label}
//     >
//       {IconComp ? <IconComp size={12} /> : emoji ? <span>{emoji}</span> : null}
//       <span className="font-semibold">{label}</span>
//     </span>
//   );
// };

// /* ==================== Content Options Dropdown ==================== */
// type ContentDropdownProps = {
//   customizations: Customizations;
//   setCustomizations: React.Dispatch<React.SetStateAction<Customizations>>;
// };

// const ContentOptionsDropdown: React.FC<ContentDropdownProps> = ({ customizations, setCustomizations }) => {
//   const [open, setOpen] = useState(false);
//   const panelRef = useOutsideClick<HTMLDivElement>(() => setOpen(false));
//   const selected = customizations.selectedContent as Set<string>;
//   const selectedCount = selected.size;

//   const toggleKey = (key: string) => {
//     setCustomizations(prev => {
//       const next = new Set(prev.selectedContent as Set<string>);
//       next.has(key) ? next.delete(key) : next.add(key);
//       return { ...prev, selectedContent: next };
//     });
//   };

//   const selectAll = () => {
//     setCustomizations(prev => ({ ...prev, selectedContent: new Set(CONTENT_OPTIONS.map(o => o.key)) }));
//   };

//   const clearAll = () => {
//     setCustomizations(prev => ({ ...prev, selectedContent: new Set() }));
//   };

//   const selectCategory = (category: ContentOption['category']) => {
//     const keys = CONTENT_OPTIONS.filter(o => o.category === category).map(o => o.key);
//     setCustomizations(prev => {
//       const next = new Set(prev.selectedContent as Set<string>);
//       keys.forEach(k => next.add(k));
//       return { ...prev, selectedContent: next };
//     });
//   };

//   const groupedOptions = useMemo(() => {
//     return CONTENT_OPTIONS.reduce((acc, option) => {
//       (acc[option.category] ||= []).push(option);
//       return acc;
//     }, {} as Record<ContentOption['category'], ContentOption[]>);
//   }, []);

//   return (
//     <div className="relative">
//       <button
//         type="button"
//         onClick={() => setOpen(s => !s)}
//         aria-haspopup="true"
//         aria-expanded={open}
//         className="w-full justify-between inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 transition-all"
//       >
//         <span className="font-medium text-gray-900">Select Content to Include</span>
//         <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold">
//           {selectedCount} selected
//         </span>
//       </button>

//       {open && (
//         <div
//           ref={panelRef}
//           role="menu"
//           aria-label="Content Options"
//           className="absolute z-10 mt-2 w-full min-w-[32rem] right-0 bg-white rounded-xl shadow-2xl border border-gray-200"
//         >
//           <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
//             <div className="flex items-center justify-between">
//               <div className="text-sm font-medium text-gray-700">Choose what to include in your brochure</div>
//               <div className="flex items-center gap-2">
//                 <button onClick={selectAll} type="button" className="text-xs px-3 py-1.5 rounded-md bg-purple-600 text-white hover:bg-purple-700 font-medium transition-colors">
//                   Select All
//                 </button>
//                 <button onClick={clearAll} type="button" className="text-xs px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 font-medium transition-colors">
//                   Clear
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="max-h-96 overflow-y-auto">
//             {(Object.keys(groupedOptions) as ContentOption['category'][]).map(category => (
//               <div key={category} className="border-b border-gray-100 last:border-b-0">
//                 <div className="sticky top-0 bg-gray-50 px-4 py-2 flex items-center justify-between z-10">
//                   <h4 className="text-sm font-semibold text-gray-900">{CATEGORY_LABELS[category]}</h4>
//                   <button
//                     onClick={() => selectCategory(category)}
//                     type="button"
//                     className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
//                   >
//                     Select All
//                   </button>
//                 </div>
//                 <div className="p-2">
//                   {groupedOptions[category].map(opt => {
//                     const isSelected = (customizations.selectedContent as Set<string>).has(opt.key);
//                     return (
//                       <label
//                         key={opt.key}
//                         className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
//                           isSelected ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50'
//                         }`}
//                       >
//                         <input
//                           type="checkbox"
//                           checked={isSelected}
//                           onChange={() => toggleKey(opt.key)}
//                           className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
//                         />
//                         <div className="flex-1">
//                           <div className="font-medium text-gray-900 text-sm">{opt.label}</div>
//                           <div className="text-xs text-gray-600 mt-0.5">{opt.description}</div>
//                         </div>
//                       </label>
//                     );
//                   })}
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
//             <div className="text-xs text-gray-600">{(customizations.selectedContent as Set<string>).size} items selected</div>
//             <button
//               type="button"
//               onClick={() => setOpen(false)}
//               className="px-4 py-2 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700 font-medium transition-colors"
//             >
//               Done
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// /* ==================== Preview Component ==================== */
// const BrochurePreview: React.FC<{
//   property: Property | null;
//   customizations: Customizations;
//   tags: string[];
// }> = ({ property, customizations, tags }) => {
//   const selected = customizations.selectedContent instanceof Set ? customizations.selectedContent : new Set(customizations.selectedContent);
//   const images = property?.images || property?.photos || [];
//   const mainImage =
//     images[0] || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400';

//   const price = property?.price || property?.budget;
//   const sqft = property?.square_feet || property?.carpetArea;
//   const pricePerSqFt = price && sqft ? Math.round(safeNumber(price) / safeNumber(sqft)) : null;

//   return (
//     <div className="bg-gray-50 rounded-xl p-4 h-[500px] overflow-auto">
//       <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//         {/* Header */}
//         {(selected.has('propertyType') || selected.has('location') || selected.has('verified') || selected.has('featured')) && (
//           <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
//             {selected.has('propertyType') && (
//               <h1 className="text-xl font-bold mb-1" style={{ color: customizations.primaryColor }}>
//                 {[property?.type, property?.unitType, property?.subtype].filter(Boolean).join('  ') || 'Property Title'}
//               </h1>
//             )}
//             {selected.has('location') && (
//               <div className="flex items-center text-sm text-gray-600 mb-2">
//                 <MapPin size={14} className="mr-1" />
//                 {property?.locationNormalized || property?.location || 'Location'}
//                 {property?.city ? `, ${property.city}` : ''}
//               </div>
//             )}
//             <div className="flex items-center gap-2">
//               {selected.has('featured') && property?.featured && (
//                 <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full">
//                   FEATURED
//                 </span>
//               )}
//               {selected.has('verified') && property?.verified && (
//                 <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
//                   <CheckCircle size={12} />
//                   VERIFIED
//                 </span>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Main Image + OVERLAID TAGS */}
//         {selected.has('mainImage') && (
//           <div className="relative w-full h-48">
//             <img
//               src={mainImage}
//               alt="Property"
//               className="w-full h-48 object-cover"
//               crossOrigin="anonymous"
//               referrerPolicy="no-referrer"
//             />
//             {tags.length > 0 && (
//               <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 max-w-[92%]">
//                 {tags.slice(0, 5).map((t, i) => (
//                   <TagBadge key={`${t}-${i}`} label={t} />
//                 ))}
//               </div>
//             )}
//           </div>
//         )}

//         {/* Price - FIXED LAKHS FORMATTING */}
//         {selected.has('price') && (
//           <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <div className="text-xs text-gray-600 mb-1">Property Price</div>
//                 <div className="text-2xl font-bold" style={{ color: customizations.secondaryColor }}>
//                   {formatCurrency(price)}
//                 </div>
//               </div>
//               {pricePerSqFt && (
//                 <div className="text-right">
//                   <div className="text-xs text-gray-600 mb-1">Per Sq Ft</div>
//                   <div className="text-lg font-semibold text-gray-900">₹{pricePerSqFt.toLocaleString('en-IN')}</div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Basic Stats */}
//         {(selected.has('bedrooms') || selected.has('bathrooms') || selected.has('parking') || selected.has('carpetArea')) && (
//           <div className="p-4 grid grid-cols-2 gap-3 border-b border-gray-200">
//             {selected.has('bedrooms') && (
//               <div className="flex items-center gap-2">
//                 <BedDouble size={16} className="text-blue-600" />
//                 <div>
//                   <div className="text-xs text-gray-600">Bedrooms</div>
//                   <div className="font-semibold">{displayOrDash(property?.bedrooms)}</div>
//                 </div>
//               </div>
//             )}
//             {selected.has('bathrooms') && (
//               <div className="flex items-center gap-2">
//                 <Bath size={16} className="text-green-600" />
//                 <div>
//                   <div className="text-xs text-gray-600">Bathrooms</div>
//                   <div className="font-semibold">{displayOrDash(property?.bathrooms)}</div>
//                 </div>
//               </div>
//             )}
//             {selected.has('parking') && (
//               <div className="flex items-center gap-2">
//                 <Car size={16} className="text-orange-600" />
//                 <div>
//                   <div className="text-xs text-gray-600">Parking</div>
//                   <div className="font-semibold">{displayOrDash(property?.parking)}</div>
//                 </div>
//               </div>
//             )}
//             {selected.has('carpetArea') && (
//               <div className="flex items-center gap-2">
//                 <Ruler size={16} className="text-purple-600" />
//                 <div>
//                   <div className="text-xs text-gray-600">Carpet Area</div>
//                   <div className="font-semibold">{displayOrDash(property?.square_feet || property?.carpetArea)} sq ft</div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Description */}
//         {selected.has('description') && property?.description && (
//           <div className="p-4 border-b border-gray-200">
//             <h3 className="font-semibold text-gray-900 mb-2 text-sm">About Property</h3>
//             <p className="text-xs text-gray-700 line-clamp-3">{property.description}</p>
//           </div>
//         )}

//         {/* Property Details */}
//         {(selected.has('furnishing') ||
//           selected.has('possession') ||
//           selected.has('facing') ||
//           selected.has('builtYear') ||
//           selected.has('floor') ||
//           selected.has('wing') ||
//           selected.has('unitNo')) && (
//           <div className="p-4 border-b border-gray-200">
//             <h3 className="font-semibold text-gray-900 mb-3 text-sm">Property Details</h3>
//             <div className="grid grid-cols-2 gap-2 text-xs">
//               {selected.has('furnishing') && (
//                 <div>
//                   <span className="text-gray-600">Furnishing: </span>
//                   <span className="font-medium">{displayOrDash(property?.furnishing)}</span>
//                 </div>
//               )}
//               {selected.has('possession') && (property?.possessionMonth || property?.possessionYear) && (
//                 <div>
//                   <span className="text-gray-600">Possession: </span>
//                   <span className="font-medium">
//                     {[getMonthName(property?.possessionMonth), property?.possessionYear].filter(Boolean).join(' ')}
//                   </span>
//                 </div>
//               )}
//               {selected.has('facing') && (
//                 <div>
//                   <span className="text-gray-600">Facing: </span>
//                   <span className="font-medium">{displayOrDash(property?.facing)}</span>
//                 </div>
//               )}
//               {selected.has('builtYear') && (
//                 <div>
//                   <span className="text-gray-600">Built Year: </span>
//                   <span className="font-medium">{displayOrDash(property?.builtYear || property?.possessionYear)}</span>
//                 </div>
//               )}
//               {selected.has('floor') && (property?.raw?.floor || property?.raw?.totalFloors) && (
//                 <div>
//                   <span className="text-gray-600">Floor: </span>
//                   <span className="font-medium">
//                     {property?.raw?.floor && property?.raw?.totalFloors
//                       ? `${property.raw.floor} / ${property.raw.totalFloors}`
//                       : displayOrDash(property?.raw?.floor)}
//                   </span>
//                 </div>
//               )}
//               {selected.has('wing') && property?.raw?.wing && (
//                 <div>
//                   <span className="text-gray-600">Wing: </span>
//                   <span className="font-medium">{property.raw.wing}</span>
//                 </div>
//               )}
//               {selected.has('unitNo') && property?.raw?.unitNo && (
//                 <div>
//                   <span className="text-gray-600">Unit No: </span>
//                   <span className="font-medium">{property.raw.unitNo}</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Amenities */}
//         {selected.has('amenities') && property?.amenities && property.amenities.length > 0 && (
//           <div className="p-4 border-b border-gray-200">
//             <h3 className="font-semibold text-gray-900 mb-2 text-sm">Amenities</h3>
//             <div className="flex flex-wrap gap-1">
//               {property.amenities.slice(0, 8).map((amenity, idx) => (
//                 <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
//                   {amenity}
//                 </span>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Furnishing Items */}
//         {selected.has('furnishingItems') && property?.furnishingItems && property.furnishingItems.length > 0 && (
//           <div className="p-4 border-b border-gray-200">
//             <h3 className="font-semibold text-gray-900 mb-2 text-sm">Furnishing Items</h3>
//             <div className="flex flex-wrap gap-1">
//               {property.furnishingItems.slice(0, 6).map((item, idx) => (
//                 <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
//                   {item}
//                 </span>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Nearby Places */}
//         {selected.has('nearbyPlaces') && property?.raw?.nearby_places && property.raw.nearby_places.length > 0 && (
//           <div className="p-4 border-b border-gray-200">
//             <h3 className="font-semibold text-gray-900 mb-2 text-sm">Nearby Places</h3>
//             <div className="space-y-1">
//               {property.raw.nearby_places.slice(0, 4).map((place: any, idx: number) => (
//                 <div key={idx} className="text-xs text-gray-700">
//                   • {place.name} {place.distance && `(${place.distance}${place.unit || ''})`}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Investment Analytics */}
//         {(selected.has('aiScore') ||
//           selected.has('priceGrowth') ||
//           selected.has('investmentGrade') ||
//           selected.has('roiPotential') ||
//           selected.has('marketPosition')) && (
//           <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
//             <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-1">
//               <Sparkles size={14} />
//               AI Investment Analysis
//             </h3>
//             <div className="grid grid-cols-2 gap-2 text-xs">
//               {selected.has('aiScore') && (
//                 <div>
//                   <span className="text-gray-600">AI Score: </span>
//                   <span className="font-bold text-purple-600">{property?.aiScore ?? '94'}/100</span>
//                 </div>
//               )}
//               {selected.has('priceGrowth') && (
//                 <div>
//                   <span className="text-gray-600">Growth: </span>
//                   <span className="font-bold text-green-600">{property?.priceGrowth ?? '+12.5%'}</span>
//                 </div>
//               )}
//               {selected.has('investmentGrade') && (
//                 <div>
//                   <span className="text-gray-600">Investment: </span>
//                   <span className="font-bold text-blue-600">{property?.investmentGrade ?? 'A+'}</span>
//                 </div>
//               )}
//               {selected.has('roiPotential') && (
//                 <div>
//                   <span className="text-gray-600">ROI Potential: </span>
//                   <span className="font-bold text-orange-600">18.2%</span>
//                 </div>
//               )}
//               {selected.has('marketPosition') && (
//                 <div>
//                   <span className="text-gray-600">Market: </span>
//                   <span className="font-bold text-purple-600">Top 10%</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Contact Info */}
//         {(selected.has('assignedToInfo') || selected.has('contactDetails')) && (
//           <div className="p-4 bg-gray-50">
//             <h3 className="font-semibold text-gray-900 mb-3 text-sm">Contact Information</h3>

//             {selected.has('assignedToInfo') && (
//               <div className="flex items-center gap-2 mb-2">
//                 <User size={16} className="text-blue-600" />
//                 <div>
//                   <div className="text-xs text-gray-600">Assigned Executive</div>
//                   <div className="font-medium text-sm">{displayOrDash(property?.assigned_to?.name)}</div>
//                   {property?.assigned_to?.email ? (
//                     <div className="text-xs text-gray-600">{property.assigned_to.email}</div>
//                   ) : null}
//                 </div>
//               </div>
//             )}

//             {selected.has('contactDetails') && property?.assigned_to?.phone && (
//               <div className="flex items-center gap-2">
//                 <Phone size={16} className="text-green-600" />
//                 <div>
//                   <div className="text-xs text-gray-600">Contact Number</div>
//                   <div className="font-medium text-sm">
//                     {property.assigned_to.phone}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Watermark */}
//         {(customizations as any).watermark && (
//           <div className="p-3 text-center border-t border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
//             <p className="text-xs text-gray-600 font-medium">Powered by ResaleExpert.in</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// /* ==================== Main Component ==================== */
// const PropertyBrochureModal: React.FC<Props> = ({ isOpen, onClose, property }) => {
//   const [brochureTemplate, setBrochureTemplate] = useState<string>('premium');
//   const [customizations, setCustomizations] = useState<Customizations>(defaultCustomizations());
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [tags, setTags] = useState<string[]>([]);
//   const [mainImageDataUrl, setMainImageDataUrl] = useState<string | null>(null);

//   /** Normalize property with assigned_to */
//   const normalizedProperty: Property | null = useMemo(() => {
//     if (!property) return null;
//     const assigned = normalizeAssignedTo(property);
//     return {
//       ...property,
//       assigned_to: assigned,
//     };
//   }, [property]);

//   // Load tags
//   useEffect(() => {
//     let cancelled = false;
//     async function loadTags() {
//       try {
//         if (!normalizedProperty?.id && !normalizedProperty?.propertyId) {
//           setTags([]);
//           return;
//         }
//         const pid = (normalizedProperty?.id ?? normalizedProperty?.propertyId) as number | string;
//         const row = await propertyTagsAPI.getById(pid);
//         if (!cancelled) setTags(row?.tags || []);
//       } catch {
//         if (!cancelled) setTags([]);
//       }
//     }
//     if (isOpen) loadTags();
//     return () => {
//       cancelled = true;
//     };
//   }, [isOpen, normalizedProperty?.id, normalizedProperty?.propertyId]);

//   // Prepare inline image
//   useEffect(() => {
//     let cancelled = false;
//     async function makeInline() {
//       const images = normalizedProperty?.images || normalizedProperty?.photos || [];
//       const src =
//         images[0] || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200';
//       if (!src) {
//         setMainImageDataUrl(null);
//         return;
//       }
//       if (isDataUrl(src)) {
//         setMainImageDataUrl(src);
//         return;
//       }
//       const data = await fetchAsDataUrl(src);
//       if (!cancelled) setMainImageDataUrl(data);
//     }
//     if (isOpen) makeInline();
//     return () => {
//       cancelled = true;
//     };
//   }, [isOpen, normalizedProperty?.images, normalizedProperty?.photos]);

//   useEffect(() => {
//     if (isOpen) {
//       setBrochureTemplate('premium');
//       setCustomizations(defaultCustomizations());
//     }
//   }, [isOpen, normalizedProperty]);

//   if (!isOpen) return null;

//   /* Generate Brochure */
//   const generateBrochure = async () => {
//     setIsGenerating(true);

//     const safeFilename = (s: string) =>
//       (s || 'property')
//         .replace(/[^\w\-]+/g, '_')
//         .replace(/_+/g, '_')
//         .replace(/^_+|_+$/g, '')
//         .slice(0, 80);

//     const downloadBlob = (blob: Blob, name: string) => {
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = name.endsWith('.pdf') ? name : `${name}.pdf`;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       setTimeout(() => URL.revokeObjectURL(url), 1500);
//     };

//     const b64ToBlob = (b64: string, mime = 'application/pdf') => {
//       const fixed = b64.replace(/-/g, '+').replace(/_/g, '/');
//       const pad = fixed.length % 4 === 0 ? fixed : fixed + '='.repeat(4 - (fixed.length % 4));
//       const binary = atob(pad);
//       const bytes = new Uint8Array(binary.length);
//       for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
//       return new Blob([bytes], { type: mime });
//     };

//     try {
//       const selectedContent =
//         customizations.selectedContent instanceof Set
//           ? Array.from(customizations.selectedContent as Set<string>)
//           : Array.isArray(customizations.selectedContent)
//           ? customizations.selectedContent
//           : [];

//       const brochureData = {
//         template: brochureTemplate,
//         customizations: { ...customizations, selectedContent },
//         property: normalizedProperty,
//         tags,
//         assets: {
//           mainImageDataUrl: mainImageDataUrl || null,
//         },
//         generatedAt: new Date().toISOString(),
//       };

//       const res: any = await propertiesAPI.downloadBrochure(
//         normalizedProperty?.id ?? normalizedProperty?.propertyId,
//         brochureData
//       );

//       const filename = `${safeFilename(normalizedProperty?.title ?? 'property')}_brochure`;

//       if (res instanceof Blob) {
//         downloadBlob(res, filename);
//         toast.success('✅ Brochure generated successfully!');
//         return;
//       }

//       if (res?.data instanceof Blob) {
//         downloadBlob(res.data, filename);
//         toast.success('✅ Brochure generated successfully!');
//         return;
//       }

//       const base64Pdf: string | undefined =
//         typeof res === 'string' ? res :
//         typeof res?.base64 === 'string' ? res.base64 :
//         undefined;

//       if (base64Pdf) {
//         downloadBlob(b64ToBlob(base64Pdf, 'application/pdf'), filename);
//         toast.success('✅ Brochure generated successfully!');
//         return;
//       }

//       if (res?.url) {
//         const a = document.createElement('a');
//         a.href = res.url;
//         a.download = `${filename}.pdf`;
//         document.body.appendChild(a);
//         a.click();
//         a.remove();
//         toast.success('✅ Brochure generated successfully!');
//         return;
//       }

//       // Fallback
//       const SAMPLE_B64 =
//         'JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVGl0bGUgKFByb3BlcnR5IEJyb2NodXJlKQo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMyAwIFIKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFs0IDAgUl0KL0NvdW50IDEKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAzIDAgUgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjUgMCBvYmoKPDwKL0xlZmd0aCA0NAo+PgpzdHJlYW0KQlQKL0YxIDI0IFRmCjEwMCA3MDAgVGQKKFByb3BlcnR5IEJyb2NodXJlKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDc0IDAwMDAwIG4gCjAwMDAwMDAxMjEgMDAwMDAgbiAKMDAwMDAwMDIwMCAwMDAwMCBuIAowMDAwMDAwMjY5IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAyIDAgUgovSW5mbyAxIDAgUgo+PgpzdGFydHhyZWYKMzYyCiUlRU9G';
//       downloadBlob(b64ToBlob(SAMPLE_B64), filename);
//       toast.success('✅ Brochure generated (fallback).');
//     } catch (err: any) {
//       console.error('Error generating brochure:', err);
//       toast.error(`❌ Failed to generate brochure${err?.message ? `: ${err.message}` : ''}`);
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   /* Share Brochure */
//   const shareBrochure = (channel: 'whatsapp' | 'email' | 'sms' | 'copy' = 'copy') => {
//     const brochureUrl = `https://resaleexpert.in/brochure/${normalizedProperty?.propertyId ?? normalizedProperty?.id ?? ''}`;
//     const price = formatCurrency(normalizedProperty?.price || normalizedProperty?.budget);
//     const message = `🏠 ${normalizedProperty?.title || [normalizedProperty?.type, normalizedProperty?.unitType].filter(Boolean).join(' ')}
// 📍 ${normalizedProperty?.locationNormalized || normalizedProperty?.location || ''}${normalizedProperty?.city ? `, ${normalizedProperty.city}` : ''}
// 💰 ${price}
// 🏢 ${normalizedProperty?.unitType ?? ''} ${normalizedProperty?.carpetArea || normalizedProperty?.square_feet ? `• ${normalizedProperty?.carpetArea || normalizedProperty?.square_feet} sq ft` : ''}

// 📄 View detailed brochure: ${brochureUrl}`;

//     switch (channel) {
//       case 'whatsapp':
//         window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
//         break;
//       case 'email': {
//         const subject = `Property Brochure - ${normalizedProperty?.title || 'Property Listing'}`;
//         window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
//         break;
//       }
//       case 'sms':
//         window.open(`sms:?body=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
//         break;
//       default:
//         navigator.clipboard
//           .writeText(brochureUrl)
//           .then(() => alert('✅ Brochure link copied to clipboard!'))
//           .catch(() => alert('❌ Could not copy link'));
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
//         {/* Header */}
//         <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 flex-shrink-0">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900">Create Property Brochure</h2>
//               <p className="text-gray-600 mt-1">
//                 {normalizedProperty?.title ||
//                   [normalizedProperty?.type, normalizedProperty?.unitType, normalizedProperty?.subtype].filter(Boolean).join(' ') ||
//                   'Property'}{' '}
//                 - Professional Marketing Material
//               </p>
//             </div>
//             <button onClick={onClose} className="p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors" aria-label="Close">
//               <X size={20} />
//             </button>
//           </div>
//         </div>

//         {/* Body */}
//         <div className="p-6 overflow-y-auto flex-1">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {/* Left: Template + Customization */}
//             <div className="space-y-6">
//               {/* Template Selection */}
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Template</h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   {brochureTemplates.map(template => (
//                     <button
//                       key={template.value}
//                       onClick={() => setBrochureTemplate(template.value)}
//                       className={`p-3 rounded-xl border-2 transition-all ${
//                         brochureTemplate === template.value ? 'border-purple-500 bg-purple-50 shadow-md' : 'border-gray-200 hover:border-gray-300'
//                       }`}
//                       type="button"
//                     >
//                       <img src={template.preview} alt={template.label} className="w-full h-28 object-cover rounded-lg mb-2" />
//                       <div className="text-left">
//                         <div className="font-medium text-gray-900 text-sm">{template.label}</div>
//                         <div className="text-xs text-gray-600">{template.description}</div>
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Customization */}
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Design Customization</h3>
//                 <div className="space-y-4">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
//                       <input
//                         type="color"
//                         value={customizations.primaryColor as string}
//                         onChange={e => setCustomizations({ ...customizations, primaryColor: e.target.value })}
//                         className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
//                       <input
//                         type="color"
//                         value={customizations.secondaryColor as string}
//                         onChange={e => setCustomizations({ ...customizations, secondaryColor: e.target.value })}
//                         className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Font Style</label>
//                     <select
//                       value={customizations.fontStyle}
//                       onChange={e => setCustomizations({ ...customizations, fontStyle: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
//                     >
//                       {fontStyles.map(font => (
//                         <option key={font.value} value={font.value}>
//                           {font.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Layout Style</label>
//                     <select
//                       value={customizations.layout}
//                       onChange={e => setCustomizations({ ...customizations, layout: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
//                     >
//                       {layoutOptions.map(layout => (
//                         <option key={layout.value} value={layout.value}>
//                           {layout.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div className="flex items-center gap-2">
//                     <input
//                       type="checkbox"
//                       id="watermark"
//                       checked={Boolean((customizations as any).watermark)}
//                       onChange={e => setCustomizations({ ...customizations, watermark: e.target.checked })}
//                       className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
//                     />
//                     <label htmlFor="watermark" className="text-sm font-medium text-gray-700">
//                       Include ResaleExpert Watermark
//                     </label>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Right: Content Options + Preview */}
//             <div className="space-y-6">
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Selection</h3>
//                 <ContentOptionsDropdown customizations={customizations} setCustomizations={setCustomizations} />
//               </div>

//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>
//                 <BrochurePreview property={normalizedProperty} customizations={customizations} tags={tags} />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
//           <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//             <div className="text-sm text-gray-600">📄 Brochure will be generated in high-quality PDF format</div>
//             <div className="flex items-center gap-3 flex-wrap justify-end">
//               <button
//                 onClick={() => shareBrochure('email')}
//                 className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
//                 type="button"
//               >
//                 <Send size={16} />
//                 <span>Email</span>
//               </button>
//               <button
//                 onClick={() => shareBrochure('whatsapp')}
//                 className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
//                 type="button"
//               >
//                 <Send size={16} />
//                 <span>WhatsApp</span>
//               </button>
//               <button
//                 onClick={generateBrochure}
//                 disabled={isGenerating}
//                 className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
//                 type="button"
//               >
//                 {isGenerating ? (
//                   <>
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
//                     <span>Generating...</span>
//                   </>
//                 ) : (
//                   <>
//                     <Download size={16} />
//                     <span>Generate PDF</span>
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

// export default PropertyBrochureModal;


// src/components/marketing/PropertyBrochureModal.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  Download,
  Send,
  MapPin,
  BedDouble,
  Bath,
  Car,
  Ruler,
  CheckCircle,
  Sparkles,
  Phone,
  User,
  Mail,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import propertiesAPI from '@/lib/propertiesAPI';
import propertyTagsAPI from '@/lib/propertyTagsAPI';
import getTagStyle, { DEFAULT_TAG_STYLE, TagTone } from '@/lib/tagStyles';

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

/* -------------------- Types -------------------- */
type AssignedTo = { name?: string; email?: string; phone?: string } | null;

type Property = {
  id?: string | number;
  title?: string;
  propertyId?: string | number;
  location?: string;
  locationNormalized?: string;
  city?: string;
  budget?: number | string | null;
  price?: number | string | null;
  type?: string;
  unitType?: string;
  subtype?: string;
  carpetArea?: number | string;
  square_feet?: number | string;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  photos?: string[];
  images?: string[];
  amenities?: string[];
  furnishingItems?: string[];
  description?: string;
  furnishing?: string;
  possession?: string;
  possessionMonth?: string | number;
  possessionYear?: string | number;
  facing?: string;
  builtYear?: string | number;
  verified?: boolean;
  featured?: boolean;
  listedDays?: number;
  aiScore?: number;
  priceGrowth?: string;
  investmentGrade?: string;
  assigned_to?: AssignedTo;
  raw?: any;
  executive?: { name?: string; email?: string; phone?: string } | null;
  assignedTo?: { name?: string; email?: string; phone?: string } | null;
  executive_name?: string;
  executive_email?: string;
  executive_phone?: string;
};

type ContentOption = {
  key: string;
  label: string;
  description: string;
  category: 'basic' | 'details' | 'features' | 'location' | 'investment' | 'contact';
};

type Customizations = {
  primaryColor: string;
  secondaryColor: string;
  fontStyle: 'modern' | 'classic' | 'elegant' | 'bold' | string;
  layout: 'standard' | 'magazine' | 'grid' | 'story' | string;
  watermark: boolean;
  selectedContent: Set<string> | string[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
};

/* -------------------- Content Options -------------------- */
const CONTENT_OPTIONS: ContentOption[] = [
  { key: 'propertyType', label: 'Property Type', description: 'Property type, unit type, subtype', category: 'basic' },
  { key: 'location', label: 'Location', description: 'Full address and locality', category: 'basic' },
  { key: 'price', label: 'Price', description: 'Property price and price per sq ft', category: 'basic' },
  { key: 'carpetArea', label: 'Carpet Area', description: 'Total carpet area in sq ft', category: 'basic' },
  { key: 'mainImage', label: 'Main Property Image', description: 'Primary property photo', category: 'basic' },
  { key: 'bedrooms', label: 'Bedrooms', description: 'Number of bedrooms', category: 'details' },
  { key: 'bathrooms', label: 'Bathrooms', description: 'Number of bathrooms', category: 'details' },
  { key: 'parking', label: 'Parking', description: 'Parking spaces available', category: 'details' },
  { key: 'furnishing', label: 'Furnishing Status', description: 'Furnished/Semi/Unfurnished', category: 'details' },
  { key: 'possession', label: 'Possession', description: 'Possession date/status', category: 'details' },
  { key: 'facing', label: 'Facing Direction', description: 'Property facing direction', category: 'details' },
  { key: 'builtYear', label: 'Built Year', description: 'Year of construction', category: 'details' },
  { key: 'floor', label: 'Floor Details', description: 'Floor number and total floors', category: 'details' },
  { key: 'wing', label: 'Wing/Tower', description: 'Wing or tower name', category: 'details' },
  { key: 'unitNo', label: 'Unit Number', description: 'Specific unit number', category: 'details' },
  { key: 'description', label: 'Property Description', description: 'Detailed description', category: 'features' },
  { key: 'amenities', label: 'Amenities', description: 'All property amenities', category: 'features' },
  { key: 'furnishingItems', label: 'Furnishing Items', description: 'List of furnishing items', category: 'features' },
  { key: 'verified', label: 'Verification Badge', description: 'Verified property badge', category: 'features' },
  { key: 'featured', label: 'Featured Badge', description: 'Premium/Featured badge', category: 'features' },
  { key: 'nearbyPlaces', label: 'Nearby Places', description: 'Schools, hospitals, transport', category: 'location' },
  { key: 'locationMap', label: 'Location Map', description: 'Area map visualization', category: 'location' },
  { key: 'aiScore', label: 'AI Property Score', description: 'AI-based property rating', category: 'investment' },
  { key: 'priceGrowth', label: 'Price Growth', description: 'Expected price appreciation', category: 'investment' },
  { key: 'investmentGrade', label: 'Investment Grade', description: 'Investment rating', category: 'investment' },
  { key: 'roiPotential', label: 'ROI Potential', description: 'Return on investment', category: 'investment' },
  { key: 'marketPosition', label: 'Market Position', description: 'Position in locality', category: 'investment' },
  { key: 'assignedToInfo', label: 'Assigned Executive', description: 'Assigned person name & contact', category: 'contact' },
  { key: 'contactDetails', label: 'Contact Phone', description: 'Primary contact phone', category: 'contact' },
];

const CATEGORY_LABELS: Record<string, string> = {
  basic: 'Basic Information',
  details: 'Property Details',
  features: 'Features & Amenities',
  location: 'Location & Connectivity',
  investment: 'Investment Analytics',
  contact: 'Contact Information',
};

/* -------------------- Options -------------------- */
const brochureTemplates = [
  { value: 'premium', label: 'Premium Template', description: 'Luxury design with elegant layout', preview: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { value: 'modern', label: 'Modern Template', description: 'Clean and contemporary design', preview: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { value: 'classic', label: 'Classic Template', description: 'Traditional and professional', preview: 'https://images.pexels.com/photos/1396125/pexels-photo-1396125.jpeg?auto=compress&cs=tinysrgb&w=300' },
  { value: 'minimal', label: 'Minimal Template', description: 'Simple and focused design', preview: 'https://images.pexels.com/photos/1396126/pexels-photo-1396126.jpeg?auto=compress&cs=tinysrgb&w=300' },
];

const fontStyles = [
  { value: 'modern', label: 'Modern Sans' },
  { value: 'classic', label: 'Classic Serif' },
  { value: 'elegant', label: 'Elegant Script' },
  { value: 'bold', label: 'Bold Impact' },
];

const layoutOptions = [
  { value: 'standard', label: 'Standard Layout' },
  { value: 'magazine', label: 'Magazine Style' },
  { value: 'grid', label: 'Grid Layout' },
  { value: 'story', label: 'Story Format' },
];

const defaultCustomizations = (): Customizations => ({
  primaryColor: O,
  secondaryColor: N,
  fontStyle: 'modern',
  layout: 'standard',
  watermark: true,
  selectedContent: new Set(['propertyType', 'location', 'price', 'carpetArea', 'mainImage', 'bedrooms', 'bathrooms', 'description']),
});

/* -------------------- Utils -------------------- */
const safeNumber = (v?: number | string | null): number => {
  if (v == null || v === '') return 0;
  if (typeof v === 'number') return v;
  const n = Number(String(v).replace(/[^\d.-]/g, ''));
  return Number.isNaN(n) ? 0 : n;
};

const formatCurrency = (amount?: number | string | null) => {
  const n = safeNumber(amount);
  if (n >= 10_000_000) {
    return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  }
  if (n >= 100_000) {
    const lakhs = n / 100_000;
    if (lakhs % 1 === 0) {
      return `₹${lakhs.toFixed(0)}L`;
    } else {
      return `₹${lakhs.toFixed(1)}L`;
    }
  }
  return `₹${n.toLocaleString('en-IN')}`;
};

const displayOrDash = (val: any) => {
  if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) return '—';
  if (typeof val === 'number' && !Number.isFinite(val)) return '—';
  return val;
};

const getMonthName = (value?: string | number | null) => {
  if (!value) return '';
  const month = typeof value === 'string' ? parseInt(value) : value;
  if (isNaN(month) || month < 1 || month > 12) return '';
  return new Date(0, month - 1).toLocaleString('en', { month: 'long' });
};

function useOutsideClick<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);
  return ref;
}

const isDataUrl = (s: string) => /^data:/.test(s);

async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    const blob = await res.blob();
    return await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result || ''));
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function normalizeAssignedTo(p?: Property | null): AssignedTo {
  if (!p) return null;
  const candidates: AssignedTo[] = [
    p.assigned_to ?? null,
    p.assignedTo ?? null,
    p.executive ?? null,
  ].filter(Boolean) as AssignedTo[];
  const flat: AssignedTo = {
    name: p.executive_name || p.raw?.assigned_to_name || p.raw?.executive_name,
    email: p.executive_email || p.raw?.assigned_to_email || p.raw?.executive_email,
    phone: p.executive_phone || p.raw?.assigned_to_phone || p.raw?.executive_phone,
  };
  const base = { ...(candidates[0] || {}) };
  const name = base.name || flat.name;
  const email = base.email || flat.email;
  const phone = base.phone || flat.phone;
  if (!name && !email && !phone) return null;
  return { name, email, phone };
}

/* ==================== Tag Badge ==================== */
const TagBadge: React.FC<{ label: string }> = ({ label }) => {
  const tone: TagTone = getTagStyle(label, DEFAULT_TAG_STYLE);
  const maybeIconOrEmoji = tone.emoji;
  const IconComp = typeof maybeIconOrEmoji === 'function' ? (maybeIconOrEmoji as any) : null;
  const emoji = typeof maybeIconOrEmoji === 'string' ? maybeIconOrEmoji : null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] leading-tight ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}
      style={{ backdropFilter: 'saturate(1.2) blur(2px)' }}
      title={label}
    >
      {IconComp ? <IconComp size={10} /> : emoji ? <span className="text-[10px]">{emoji}</span> : null}
      <span className="font-semibold text-[9px]">{label}</span>
    </span>
  );
};

/* ==================== Content Options Dropdown ==================== */
type ContentDropdownProps = {
  customizations: Customizations;
  setCustomizations: React.Dispatch<React.SetStateAction<Customizations>>;
};

const ContentOptionsDropdown: React.FC<ContentDropdownProps> = ({ customizations, setCustomizations }) => {
  const [open, setOpen] = useState(false);
  const panelRef = useOutsideClick<HTMLDivElement>(() => setOpen(false));
  const selected = customizations.selectedContent as Set<string>;
  const selectedCount = selected.size;

  const toggleKey = (key: string) => {
    setCustomizations(prev => {
      const next = new Set(prev.selectedContent as Set<string>);
      next.has(key) ? next.delete(key) : next.add(key);
      return { ...prev, selectedContent: next };
    });
  };

  const selectAll = () => {
    setCustomizations(prev => ({ ...prev, selectedContent: new Set(CONTENT_OPTIONS.map(o => o.key)) }));
  };

  const clearAll = () => {
    setCustomizations(prev => ({ ...prev, selectedContent: new Set() }));
  };

  const selectCategory = (category: ContentOption['category']) => {
    const keys = CONTENT_OPTIONS.filter(o => o.category === category).map(o => o.key);
    setCustomizations(prev => {
      const next = new Set(prev.selectedContent as Set<string>);
      keys.forEach(k => next.add(k));
      return { ...prev, selectedContent: next };
    });
  };

  const groupedOptions = useMemo(() => {
    return CONTENT_OPTIONS.reduce((acc, option) => {
      (acc[option.category] ||= []).push(option);
      return acc;
    }, {} as Record<ContentOption['category'], ContentOption[]>);
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(s => !s)}
        aria-haspopup="true"
        aria-expanded={open}
        className="w-full justify-between inline-flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-all text-[11px] sm:text-xs"
        style={{ borderColor: BD }}
      >
        <span className="font-medium" style={{ color: N }}>Select Content to Include</span>
        <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `${O}15`, color: O }}>
          {selectedCount} selected
        </span>
      </button>

      {open && (
        <div
          ref={panelRef}
          role="menu"
          aria-label="Content Options"
          className="absolute z-10 mt-2 w-full sm:min-w-[32rem] right-0 bg-white rounded-xl shadow-2xl border overflow-hidden"
          style={{ borderColor: BD }}
        >
          <div className="p-3 border-b" style={{ background: `${O}08`, borderColor: BD }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-[11px] sm:text-xs font-medium" style={{ color: MU }}>Choose what to include in your brochure</div>
              <div className="flex items-center gap-2">
                <button onClick={selectAll} type="button" className="text-[9px] sm:text-[10px] px-2 py-1 rounded-md text-white font-medium transition-colors" style={{ background: O }}>
                  Select All
                </button>
                <button onClick={clearAll} type="button" className="text-[9px] sm:text-[10px] px-2 py-1 rounded-md transition-colors" style={{ background: `${N}10`, color: N }}>
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {(Object.keys(groupedOptions) as ContentOption['category'][]).map(category => (
              <div key={category} className="border-b last:border-b-0" style={{ borderColor: BD }}>
                <div className="sticky top-0 px-3 py-1.5 flex items-center justify-between z-10" style={{ background: BG, borderBottom: `1px solid ${BD}` }}>
                  <h4 className="text-[10px] sm:text-[11px] font-semibold" style={{ color: N }}>{CATEGORY_LABELS[category]}</h4>
                  <button onClick={() => selectCategory(category)} type="button" className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded transition-colors" style={{ background: `${N}10`, color: N }}>
                    Select All
                  </button>
                </div>
                <div className="p-1.5">
                  {groupedOptions[category].map(opt => {
                    const isSelected = (customizations.selectedContent as Set<string>).has(opt.key);
                    return (
                      <label
                        key={opt.key}
                        className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-all ${isSelected ? 'ring-1' : ''}`}
                        style={{
                          background: isSelected ? `${O}08` : 'transparent',
                          ringColor: O
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleKey(opt.key)}
                          className="mt-0.5 rounded w-3 h-3"
                          style={{ accentColor: O }}
                        />
                        <div className="flex-1">
                          <div className="text-[10px] sm:text-[11px] font-medium" style={{ color: N }}>{opt.label}</div>
                          <div className="text-[8px] sm:text-[9px] mt-0.5" style={{ color: MU }}>{opt.description}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="p-2 border-t flex items-center justify-between" style={{ borderColor: BD, background: BG }}>
            <div className="text-[9px] sm:text-[10px]" style={{ color: MU }}>{(customizations.selectedContent as Set<string>).size} items selected</div>
            <button type="button" onClick={() => setOpen(false)} className="px-3 py-1 text-[9px] sm:text-[10px] rounded-lg text-white font-medium transition-colors" style={{ background: O }}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ==================== Preview Component ==================== */
const BrochurePreview: React.FC<{
  property: Property | null;
  customizations: Customizations;
  tags: string[];
}> = ({ property, customizations, tags }) => {
  const selected = customizations.selectedContent instanceof Set ? customizations.selectedContent : new Set(customizations.selectedContent);
  const images = property?.images || property?.photos || [];
  const mainImage =
    images[0] || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400';

  const price = property?.price || property?.budget;
  const sqft = property?.square_feet || property?.carpetArea;
  const pricePerSqFt = price && sqft ? Math.round(safeNumber(price) / safeNumber(sqft)) : null;

  return (
    <div className="bg-gray-50 rounded-xl p-3 h-[450px] overflow-auto" style={{ scrollbarWidth: 'thin' }}>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        {(selected.has('propertyType') || selected.has('location') || selected.has('verified') || selected.has('featured')) && (
          <div className="p-3 border-b" style={{ background: `${O}08`, borderColor: BD }}>
            {selected.has('propertyType') && (
              <h1 className="text-base sm:text-lg font-bold mb-1" style={{ color: customizations.primaryColor }}>
                {[property?.type, property?.unitType, property?.subtype].filter(Boolean).join('  ') || 'Property Title'}
              </h1>
            )}
            {selected.has('location') && (
              <div className="flex items-center text-[11px] sm:text-xs mb-1.5" style={{ color: MU }}>
                <MapPin size={12} className="mr-1" />
                {property?.locationNormalized || property?.location || 'Location'}
                {property?.city ? `, ${property.city}` : ''}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              {selected.has('featured') && property?.featured && (
                <span className="px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold rounded-full text-white" style={{ background: `linear-gradient(135deg, ${O}, #f39c12)` }}>
                  FEATURED
                </span>
              )}
              {selected.has('verified') && property?.verified && (
                <span className="px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold rounded-full flex items-center gap-0.5 text-white" style={{ background: '#10b981' }}>
                  <CheckCircle size={10} />
                  VERIFIED
                </span>
              )}
            </div>
          </div>
        )}

        {/* Main Image + OVERLAID TAGS */}
        {selected.has('mainImage') && (
          <div className="relative w-full h-40 sm:h-48">
            <img
              src={mainImage}
              alt="Property"
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
            {tags.length > 0 && (
              <div className="absolute top-2 left-2 flex flex-wrap gap-1 max-w-[92%]">
                {tags.slice(0, 3).map((t, i) => (
                  <TagBadge key={`${t}-${i}`} label={t} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Price */}
        {selected.has('price') && (
          <div className="p-3 border-b" style={{ background: `${O}08`, borderColor: BD }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[9px] sm:text-[10px] mb-0.5" style={{ color: MU }}>Property Price</div>
                <div className="text-lg sm:text-xl font-bold" style={{ color: customizations.secondaryColor }}>
                  {formatCurrency(price)}
                </div>
              </div>
              {pricePerSqFt && (
                <div className="text-right">
                  <div className="text-[9px] sm:text-[10px] mb-0.5" style={{ color: MU }}>Per Sq Ft</div>
                  <div className="text-sm sm:text-base font-semibold" style={{ color: N }}>₹{pricePerSqFt.toLocaleString('en-IN')}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Basic Stats */}
        {(selected.has('bedrooms') || selected.has('bathrooms') || selected.has('parking') || selected.has('carpetArea')) && (
          <div className="p-3 grid grid-cols-2 gap-2 border-b" style={{ borderColor: BD }}>
            {selected.has('bedrooms') && (
              <div className="flex items-center gap-1.5">
                <BedDouble size={14} style={{ color: O }} />
                <div>
                  <div className="text-[8px] sm:text-[9px]" style={{ color: MU }}>Bedrooms</div>
                  <div className="text-[11px] sm:text-xs font-semibold" style={{ color: N }}>{displayOrDash(property?.bedrooms)}</div>
                </div>
              </div>
            )}
            {selected.has('bathrooms') && (
              <div className="flex items-center gap-1.5">
                <Bath size={14} style={{ color: O }} />
                <div>
                  <div className="text-[8px] sm:text-[9px]" style={{ color: MU }}>Bathrooms</div>
                  <div className="text-[11px] sm:text-xs font-semibold" style={{ color: N }}>{displayOrDash(property?.bathrooms)}</div>
                </div>
              </div>
            )}
            {selected.has('parking') && (
              <div className="flex items-center gap-1.5">
                <Car size={14} style={{ color: O }} />
                <div>
                  <div className="text-[8px] sm:text-[9px]" style={{ color: MU }}>Parking</div>
                  <div className="text-[11px] sm:text-xs font-semibold" style={{ color: N }}>{displayOrDash(property?.parking)}</div>
                </div>
              </div>
            )}
            {selected.has('carpetArea') && (
              <div className="flex items-center gap-1.5">
                <Ruler size={14} style={{ color: O }} />
                <div>
                  <div className="text-[8px] sm:text-[9px]" style={{ color: MU }}>Carpet Area</div>
                  <div className="text-[11px] sm:text-xs font-semibold" style={{ color: N }}>{displayOrDash(property?.square_feet || property?.carpetArea)} sq ft</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {/* About Property - Fixed Spacing */}
{selected.has('description') && property?.description && (
  <div className="p-3 border-b" style={{ borderColor: BD }}>
    <h3 className="text-[11px] sm:text-xs font-semibold mb-2" style={{ color: N }}>About Property</h3>
    <div className="space-y-1.5">
      <p className="text-[10px] sm:text-[11px] leading-relaxed" style={{ color: MU, lineHeight: '1.5' }}>
        {property.description}
      </p>
    </div>
  </div>
)}

        {/* Property Details */}
        {(selected.has('furnishing') || selected.has('possession') || selected.has('facing') || selected.has('builtYear')) && (
          <div className="p-3 border-b" style={{ borderColor: BD }}>
            <h3 className="text-[11px] sm:text-xs font-semibold mb-2" style={{ color: N }}>Property Details</h3>
            <div className="grid grid-cols-2 gap-1.5 text-[9px] sm:text-[10px]">
              {selected.has('furnishing') && (
                <div><span style={{ color: MU }}>Furnishing: </span><span className="font-medium" style={{ color: N }}>{displayOrDash(property?.furnishing)}</span></div>
              )}
              {selected.has('possession') && (property?.possessionMonth || property?.possessionYear) && (
                <div><span style={{ color: MU }}>Possession: </span><span className="font-medium" style={{ color: N }}>{[getMonthName(property?.possessionMonth), property?.possessionYear].filter(Boolean).join(' ')}</span></div>
              )}
              {selected.has('facing') && (
                <div><span style={{ color: MU }}>Facing: </span><span className="font-medium" style={{ color: N }}>{displayOrDash(property?.facing)}</span></div>
              )}
              {selected.has('builtYear') && (
                <div><span style={{ color: MU }}>Built Year: </span><span className="font-medium" style={{ color: N }}>{displayOrDash(property?.builtYear || property?.possessionYear)}</span></div>
              )}
            </div>
          </div>
        )}

        {/* Amenities */}
        {selected.has('amenities') && property?.amenities && property.amenities.length > 0 && (
          <div className="p-3 border-b" style={{ borderColor: BD }}>
            <h3 className="text-[11px] sm:text-xs font-semibold mb-1.5" style={{ color: N }}>Amenities</h3>
            <div className="flex flex-wrap gap-1">
              {property.amenities.slice(0, 6).map((amenity, idx) => (
                <span key={idx} className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px]" style={{ background: `${O}10`, color: O }}>
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Furnishing Items */}
        {selected.has('furnishingItems') && property?.furnishingItems && property.furnishingItems.length > 0 && (
          <div className="p-3 border-b" style={{ borderColor: BD }}>
            <h3 className="text-[11px] sm:text-xs font-semibold mb-1.5" style={{ color: N }}>Furnishing Items</h3>
            <div className="flex flex-wrap gap-1">
              {property.furnishingItems.slice(0, 5).map((item, idx) => (
                <span key={idx} className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px]" style={{ background: `${N}10`, color: N }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Nearby Places */}
        {selected.has('nearbyPlaces') && property?.raw?.nearby_places && property.raw.nearby_places.length > 0 && (
          <div className="p-3 border-b" style={{ borderColor: BD }}>
            <h3 className="text-[11px] sm:text-xs font-semibold mb-1.5" style={{ color: N }}>Nearby Places</h3>
            <div className="space-y-0.5">
              {property.raw.nearby_places.slice(0, 3).map((place: any, idx: number) => (
                <div key={idx} className="text-[9px] sm:text-[10px]" style={{ color: MU }}>• {place.name} {place.distance && `(${place.distance}${place.unit || ''})`}</div>
              ))}
            </div>
          </div>
        )}

        {/* Investment Analytics */}
        {(selected.has('aiScore') || selected.has('priceGrowth') || selected.has('investmentGrade')) && (
          <div className="p-3 border-b" style={{ background: `${O}08`, borderColor: BD }}>
            <h3 className="text-[11px] sm:text-xs font-semibold mb-2 flex items-center gap-1" style={{ color: N }}>
              <Sparkles size={12} style={{ color: O }} />
              AI Investment Analysis
            </h3>
            <div className="grid grid-cols-2 gap-1.5 text-[9px] sm:text-[10px]">
              {selected.has('aiScore') && (
                <div><span style={{ color: MU }}>AI Score: </span><span className="font-bold" style={{ color: O }}>{property?.aiScore ?? '94'}/100</span></div>
              )}
              {selected.has('priceGrowth') && (
                <div><span style={{ color: MU }}>Growth: </span><span className="font-bold" style={{ color: '#10b981' }}>{property?.priceGrowth ?? '+12.5%'}</span></div>
              )}
              {selected.has('investmentGrade') && (
                <div><span style={{ color: MU }}>Investment: </span><span className="font-bold" style={{ color: O }}>{property?.investmentGrade ?? 'A+'}</span></div>
              )}
            </div>
          </div>
        )}

        {/* Contact Info */}
        {(selected.has('assignedToInfo') || selected.has('contactDetails')) && (
          <div className="p-3" style={{ background: BG }}>
            <h3 className="text-[11px] sm:text-xs font-semibold mb-2" style={{ color: N }}>Contact Information</h3>
            {selected.has('assignedToInfo') && (
              <div className="flex items-center gap-1.5 mb-1.5">
                <User size={12} style={{ color: O }} />
                <div>
                  <div className="text-[8px] sm:text-[9px]" style={{ color: MU }}>Assigned Executive</div>
                  <div className="text-[10px] sm:text-[11px] font-medium" style={{ color: N }}>{displayOrDash(property?.assigned_to?.name)}</div>
                </div>
              </div>
            )}
            {selected.has('contactDetails') && property?.assigned_to?.phone && (
              <div className="flex items-center gap-1.5">
                <Phone size={12} style={{ color: O }} />
                <div>
                  <div className="text-[8px] sm:text-[9px]" style={{ color: MU }}>Contact Number</div>
                  <div className="text-[10px] sm:text-[11px] font-medium" style={{ color: N }}>{property.assigned_to.phone}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Watermark */}
        {(customizations as any).watermark && (
          <div className="p-2 text-center border-t" style={{ borderColor: BD, background: BG }}>
            <p className="text-[8px] sm:text-[9px] font-medium" style={{ color: MU }}>Powered by ResaleExpert.in</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ==================== Main Component ==================== */
const PropertyBrochureModal: React.FC<Props> = ({ isOpen, onClose, property }) => {
  const [brochureTemplate, setBrochureTemplate] = useState<string>('premium');
  const [customizations, setCustomizations] = useState<Customizations>(defaultCustomizations());
  const [isGenerating, setIsGenerating] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [mainImageDataUrl, setMainImageDataUrl] = useState<string | null>(null);

  const normalizedProperty: Property | null = useMemo(() => {
    if (!property) return null;
    const assigned = normalizeAssignedTo(property);
    return {
      ...property,
      assigned_to: assigned,
    };
  }, [property]);

  useEffect(() => {
    let cancelled = false;
    async function loadTags() {
      try {
        if (!normalizedProperty?.id && !normalizedProperty?.propertyId) {
          setTags([]);
          return;
        }
        const pid = (normalizedProperty?.id ?? normalizedProperty?.propertyId) as number | string;
        const row = await propertyTagsAPI.getById(pid);
        if (!cancelled) setTags(row?.tags || []);
      } catch {
        if (!cancelled) setTags([]);
      }
    }
    if (isOpen) loadTags();
    return () => {
      cancelled = true;
    };
  }, [isOpen, normalizedProperty?.id, normalizedProperty?.propertyId]);

  useEffect(() => {
    let cancelled = false;
    async function makeInline() {
      const images = normalizedProperty?.images || normalizedProperty?.photos || [];
      const src =
        images[0] || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1200';
      if (!src) {
        setMainImageDataUrl(null);
        return;
      }
      if (isDataUrl(src)) {
        setMainImageDataUrl(src);
        return;
      }
      const data = await fetchAsDataUrl(src);
      if (!cancelled) setMainImageDataUrl(data);
    }
    if (isOpen) makeInline();
    return () => {
      cancelled = true;
    };
  }, [isOpen, normalizedProperty?.images, normalizedProperty?.photos]);

  useEffect(() => {
    if (isOpen) {
      setBrochureTemplate('premium');
      setCustomizations(defaultCustomizations());
    }
  }, [isOpen, normalizedProperty]);

  if (!isOpen) return null;

  const generateBrochure = async () => {
    setIsGenerating(true);

    const safeFilename = (s: string) =>
      (s || 'property')
        .replace(/[^\w\-]+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 80);

    const downloadBlob = (blob: Blob, name: string) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name.endsWith('.pdf') ? name : `${name}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    };

    const b64ToBlob = (b64: string, mime = 'application/pdf') => {
      const fixed = b64.replace(/-/g, '+').replace(/_/g, '/');
      const pad = fixed.length % 4 === 0 ? fixed : fixed + '='.repeat(4 - (fixed.length % 4));
      const binary = atob(pad);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return new Blob([bytes], { type: mime });
    };

    try {
      const selectedContent =
        customizations.selectedContent instanceof Set
          ? Array.from(customizations.selectedContent as Set<string>)
          : Array.isArray(customizations.selectedContent)
          ? customizations.selectedContent
          : [];

      const brochureData = {
        template: brochureTemplate,
        customizations: { ...customizations, selectedContent },
        property: normalizedProperty,
        tags,
        assets: {
          mainImageDataUrl: mainImageDataUrl || null,
        },
        generatedAt: new Date().toISOString(),
      };

      const res: any = await propertiesAPI.downloadBrochure(
        normalizedProperty?.id ?? normalizedProperty?.propertyId,
        brochureData
      );

      const filename = `${safeFilename(normalizedProperty?.title ?? 'property')}_brochure`;

      if (res instanceof Blob) {
        downloadBlob(res, filename);
        toast.success('✅ Brochure generated successfully!');
        return;
      }

      if (res?.data instanceof Blob) {
        downloadBlob(res.data, filename);
        toast.success('✅ Brochure generated successfully!');
        return;
      }

      const base64Pdf: string | undefined =
        typeof res === 'string' ? res :
        typeof res?.base64 === 'string' ? res.base64 :
        undefined;

      if (base64Pdf) {
        downloadBlob(b64ToBlob(base64Pdf, 'application/pdf'), filename);
        toast.success('✅ Brochure generated successfully!');
        return;
      }

      if (res?.url) {
        const a = document.createElement('a');
        a.href = res.url;
        a.download = `${filename}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success('✅ Brochure generated successfully!');
        return;
      }

      const SAMPLE_B64 =
        'JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVGl0bGUgKFByb3BlcnR5IEJyb2NodXJlKQo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMyAwIFIKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFs0IDAgUl0KL0NvdW50IDEKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAzIDAgUgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjUgMCBvYmoKPDwKL0xlZmd0aCA0NAo+PgpzdHJlYW0KQlQKL0YxIDI0IFRmCjEwMCA3MDAgVGQKKFByb3BlcnR5IEJyb2NodXJlKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDc0IDAwMDAwIG4gCjAwMDAwMDAxMjEgMDAwMDAgbiAKMDAwMDAwMDIwMCAwMDAwMCBuIAowMDAwMDAwMjY5IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAyIDAgUgovSW5mbyAxIDAgUgo+PgpzdGFydHhyZWYKMzYyCiUlRU9G';
      downloadBlob(b64ToBlob(SAMPLE_B64), filename);
      toast.success('✅ Brochure generated (fallback).');
    } catch (err: any) {
      console.error('Error generating brochure:', err);
      toast.error(`❌ Failed to generate brochure${err?.message ? `: ${err.message}` : ''}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const shareBrochure = (channel: 'whatsapp' | 'email' | 'sms' | 'copy' = 'copy') => {
    const brochureUrl = `https://resaleexpert.in/brochure/${normalizedProperty?.propertyId ?? normalizedProperty?.id ?? ''}`;
    const price = formatCurrency(normalizedProperty?.price || normalizedProperty?.budget);
    const message = `🏠 ${normalizedProperty?.title || [normalizedProperty?.type, normalizedProperty?.unitType].filter(Boolean).join(' ')}
📍 ${normalizedProperty?.locationNormalized || normalizedProperty?.location || ''}${normalizedProperty?.city ? `, ${normalizedProperty.city}` : ''}
💰 ${price}
🏢 ${normalizedProperty?.unitType ?? ''} ${normalizedProperty?.carpetArea || normalizedProperty?.square_feet ? `• ${normalizedProperty?.carpetArea || normalizedProperty?.square_feet} sq ft` : ''}

📄 View detailed brochure: ${brochureUrl}`;

    switch (channel) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'email': {
        const subject = `Property Brochure - ${normalizedProperty?.title || 'Property Listing'}`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
        break;
      }
      case 'sms':
        window.open(`sms:?body=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
        break;
      default:
        navigator.clipboard
          .writeText(brochureUrl)
          .then(() => alert('✅ Brochure link copied to clipboard!'))
          .catch(() => alert('❌ Could not copy link'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }}>
        
        {/* Header */}
        <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: N }}>
          <div>
            <h2 className="text-sm font-bold text-white">Create Property Brochure</h2>
            <p className="text-[10px] text-white/70">
              {normalizedProperty?.title ||
                [normalizedProperty?.type, normalizedProperty?.unitType, normalizedProperty?.subtype].filter(Boolean).join(' ') ||
                'Property'} - Professional Marketing Material
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors text-white">
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ scrollbarWidth: 'thin' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            
            {/* Left: Template + Customization */}
            <div className="space-y-3">
              {/* Template Selection */}
              <div>
                <h3 className="text-[11px] font-semibold mb-2" style={{ color: N }}>Choose Template</h3>
                <div className="grid grid-cols-2 gap-2">
                  {brochureTemplates.map(template => (
                    <button
                      key={template.value}
                      onClick={() => setBrochureTemplate(template.value)}
                      className={`p-2 rounded-lg border-2 transition-all ${brochureTemplate === template.value ? 'ring-1' : ''}`}
                      style={{
                        borderColor: brochureTemplate === template.value ? O : BD,
                        background: brochureTemplate === template.value ? `${O}08` : BG
                      }}
                      type="button"
                    >
                      <img src={template.preview} alt={template.label} className="w-full h-20 object-cover rounded-md mb-1.5" />
                      <div className="text-left">
                        <div className="text-[10px] font-medium" style={{ color: brochureTemplate === template.value ? O : N }}>{template.label}</div>
                        <div className="text-[8px]" style={{ color: MU }}>{template.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Customization */}
              <div>
                <h3 className="text-[11px] font-semibold mb-2" style={{ color: N }}>Design Customization</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-medium mb-0.5" style={{ color: MU }}>Primary Color</label>
                      <input
                        type="color"
                        value={customizations.primaryColor as string}
                        onChange={e => setCustomizations({ ...customizations, primaryColor: e.target.value })}
                        className="w-full h-8 rounded border cursor-pointer"
                        style={{ borderColor: BD }}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-medium mb-0.5" style={{ color: MU }}>Secondary Color</label>
                      <input
                        type="color"
                        value={customizations.secondaryColor as string}
                        onChange={e => setCustomizations({ ...customizations, secondaryColor: e.target.value })}
                        className="w-full h-8 rounded border cursor-pointer"
                        style={{ borderColor: BD }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-medium mb-0.5" style={{ color: MU }}>Font Style</label>
                    <select
                      value={customizations.fontStyle}
                      onChange={e => setCustomizations({ ...customizations, fontStyle: e.target.value })}
                      className="w-full px-2 py-1 text-[10px] border rounded focus:outline-none focus:ring-1"
                      style={{ borderColor: BD }}
                    >
                      {fontStyles.map(font => (
                        <option key={font.value} value={font.value}>{font.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-medium mb-0.5" style={{ color: MU }}>Layout Style</label>
                    <select
                      value={customizations.layout}
                      onChange={e => setCustomizations({ ...customizations, layout: e.target.value })}
                      className="w-full px-2 py-1 text-[10px] border rounded focus:outline-none focus:ring-1"
                      style={{ borderColor: BD }}
                    >
                      {layoutOptions.map(layout => (
                        <option key={layout.value} value={layout.value}>{layout.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      id="watermark"
                      checked={Boolean((customizations as any).watermark)}
                      onChange={e => setCustomizations({ ...customizations, watermark: e.target.checked })}
                      className="rounded w-3 h-3"
                      style={{ accentColor: O }}
                    />
                    <label htmlFor="watermark" className="text-[9px] font-medium" style={{ color: MU }}>Include ResaleExpert Watermark</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Content Options + Preview */}
            <div className="space-y-3">
              <div>
                <h3 className="text-[11px] font-semibold mb-2" style={{ color: N }}>Content Selection</h3>
                <ContentOptionsDropdown customizations={customizations} setCustomizations={setCustomizations} />
              </div>

              <div>
                <h3 className="text-[11px] font-semibold mb-2" style={{ color: N }}>Live Preview</h3>
                <BrochurePreview property={normalizedProperty} customizations={customizations} tags={tags} />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
       <div
  className="px-3 py-2 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
  style={{ borderColor: BD, background: BG }}
>
  <div className="text-[9px] sm:text-[10px]" style={{ color: MU }}>
    📄 Brochure will be generated in high-quality PDF format
  </div>

  <div className="flex items-center gap-1.5 flex-wrap justify-end">
    
    <button
      onClick={() => shareBrochure('email')}
      className="px-2 py-1 text-[9px] sm:text-[10px] rounded text-white flex items-center gap-1 transition-colors"
      style={{ background: '#3b82f6' }}
      type="button"
    >
      <Mail size={10} />
      <span>Email</span>
    </button>

    <button
      onClick={() => shareBrochure('whatsapp')}
      className="px-2 py-1 text-[9px] sm:text-[10px] rounded text-white flex items-center gap-1 transition-colors"
      style={{ background: '#25D366' }}
      type="button"
    >
      <MessageCircle size={10} />
      <span>WhatsApp</span>
    </button>

    <button
      onClick={generateBrochure}
      disabled={isGenerating}
      className="px-3 py-1 text-[9px] sm:text-[10px] rounded text-white flex items-center gap-1 transition-all hover:opacity-90 disabled:opacity-50 font-medium"
      style={{ background: O }}
      type="button"
    >
      {isGenerating ? (
        <>
          <div className="animate-spin rounded-full h-2 w-2 border-2 border-white border-t-transparent" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <Download size={10} />
          <span>Generate PDF</span>
        </>
      )}
    </button>
  </div>
</div>
      </div>
    </div>
  );
};

export default PropertyBrochureModal;