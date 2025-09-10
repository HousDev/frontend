// import React, { useState } from 'react';
// import { X, Upload, MapPin, Home, Camera, FileText, User, Phone, Mail, DollarSign, Check, ChevronRight, Building, Star } from 'lucide-react';

// interface SellPropertyFormProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// const PublicSellPropertyForm: React.FC<SellPropertyFormProps> = ({ isOpen, onClose }) => {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [formData, setFormData] = useState({
//     salutation: '',
//     ownerName: '',
//     ownerPhone: '',
//     ownerWhatsapp: '',
//     ownerEmail: '',
//     ownerType: 'individual',
//     propertyType: '',
//     propertyTitle: '',
//     address: '',
//     city: 'Mumbai',
//     locality: '',
//     pincode: '',
//     area: '',
//     bedrooms: '',
//     bathrooms: '',
//     parking: '',
//     floor: '',
//     totalFloors: '',
//     facing: '',
//     expectedPrice: '',
//     priceNegotiable: true,
//     furnishing: '',
//     possession: '',
//     builtYear: '',
//     amenities: [] as string[],
//     description: '',
//     images: [] as File[],
//     hasDocuments: false,
//     documentTypes: [] as string[]
//   });

//   const [isSubmitting, setIsSubmitting] = useState(false);

//   if (!isOpen) return null;

//   const propertyTypes = [
//     'Apartment/Flat',
//     'Independent House/Villa',
//     'Builder Floor',
//     'Penthouse',
//     'Studio Apartment',
//     'Row House',
//     'Commercial Space',
//     'Plot/Land'
//   ];

//   const furnishingOptions = [
//     'Fully Furnished',
//     'Semi Furnished',
//     'Unfurnished'
//   ];

//   const possessionOptions = [
//     'Ready to Move',
//     'Under Construction',
//     'New Launch'
//   ];

//   const facingOptions = [
//     'North',
//     'South',
//     'East',
//     'West',
//     'North-East',
//     'North-West',
//     'South-East',
//     'South-West'
//   ];

//   const amenitiesList = [
//     'Swimming Pool',
//     'Gym/Fitness Center',
//     '24/7 Security',
//     'Power Backup',
//     'Lift/Elevator',
//     'Club House',
//     'Garden/Park',
//     'Children\'s Play Area',
//     'Car Parking',
//     'Visitor Parking',
//     'Intercom Facility',
//     'High Speed Internet',
//     'Water Storage',
//     'Rainwater Harvesting',
//     'Solar Panels',
//     'CCTV Surveillance'
//   ];

//   const documentTypes = [
//     'Sale Deed',
//     'Title Certificate',
//     'Approved Building Plan',
//     'NOC from Society',
//     'Property Tax Receipt',
//     'Electricity Bill',
//     'Occupancy Certificate',
//     'Encumbrance Certificate'
//   ];

//   const stepTitles = [
//     'Owner Information',
//     'Property Details',
//     'Pricing & Features',
//     'Images & Documents'
//   ];

//   const stepDescriptions = [
//     'Tell us about yourself',
//     'Describe your property',
//     'Set price and add features',
//     'Add photos and documents'
//   ];

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value, type } = e.target;
//     const checked = (e.target as HTMLInputElement).checked;

//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const handleAmenityChange = (amenity: string) => {
//     setFormData(prev => ({
//       ...prev,
//       amenities: prev.amenities.includes(amenity)
//         ? prev.amenities.filter(a => a !== amenity)
//         : [...prev.amenities, amenity]
//     }));
//   };

//   const handleDocumentTypeChange = (docType: string) => {
//     setFormData(prev => ({
//       ...prev,
//       documentTypes: prev.documentTypes.includes(docType)
//         ? prev.documentTypes.filter(d => d !== docType)
//         : [...prev.documentTypes, docType]
//     }));
//   };

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []);
//     setFormData(prev => ({
//       ...prev,
//       images: [...prev.images, ...files].slice(0, 10)
//     }));
//   };

//   const removeImage = (index: number) => {
//     setFormData(prev => ({
//       ...prev,
//       images: prev.images.filter((_, i) => i !== index)
//     }));
//   };

//   const nextStep = () => {
//     if (currentStep < 4) {
//       setCurrentStep(currentStep + 1);
//     }
//   };

//   const prevStep = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       await new Promise(resolve => setTimeout(resolve, 2000));
//       alert('Property listed successfully! Our team will review and publish it within 24 hours.');
//       onClose();
//       setCurrentStep(1);
//       setFormData({
//         salutation: '', ownerName: '', ownerPhone: '', ownerWhatsapp: '', ownerEmail: '', ownerType: 'individual',
//         propertyType: '', propertyTitle: '', address: '', city: 'Mumbai', locality: '', pincode: '',
//         area: '', bedrooms: '', bathrooms: '', parking: '', floor: '', totalFloors: '', facing: '',
//         expectedPrice: '', priceNegotiable: true, furnishing: '', possession: '', builtYear: '',
//         amenities: [], description: '', images: [], hasDocuments: false, documentTypes: []
//       });
//     } catch (error) {
//       alert('Failed to submit property. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const formatPrice = (value: string) => {
//     if (!value) return '';
//     const num = parseInt(value);
//     if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
//     if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
//     return `₹${num.toLocaleString()}`;
//   };

//   const renderStepContent = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <div className="space-y-6 md:space-y-8">
//             <div className="text-center mb-6">
//               <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl  flex items-center justify-center mx-auto mb-4">
//                 <User className="w-8 h-8 text-white" />
//               </div>
//               <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Owner Information</h3>
//               <p className="text-gray-600">Let us know who you are</p>
//             </div>

//             <div className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">Full Name *</label>
//                   <input
//                     type="text"
//                     name="ownerName"
//                     value={formData.ownerName}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
//                     placeholder="Enter your full name"
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">Owner Type *</label>
//                   <select
//                     name="ownerType"
//                     value={formData.ownerType}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
//                   >
//                     <option value="individual">Individual Owner</option>
//                     <option value="builder">Builder/Developer</option>
//                     <option value="agent">Real Estate Agent</option>
//                   </select>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">Phone Number *</label>
//                   <div className="relative">
//                     <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
//                     <input
//                       type="tel"
//                       name="ownerPhone"
//                       value={formData.ownerPhone}
//                       onChange={handleInputChange}
//                       className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
//                       placeholder="+91 98765 43210"
//                       required
//                     />
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">Email Address *</label>
//                   <div className="relative">
//                     <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
//                     <input
//                       type="email"
//                       name="ownerEmail"
//                       value={formData.ownerEmail}
//                       onChange={handleInputChange}
//                       className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
//                       placeholder="your.email@example.com"
//                       required
//                     />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       case 2:
//         return (
//           <div className="space-y-6 md:space-y-8">
//             <div className="text-center mb-6">
//               <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
//                 <Home className="w-8 h-8 text-white" />
//               </div>
//               <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Property Details</h3>
//               <p className="text-gray-600">Tell us about your property</p>
//             </div>

//             <div className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">Property Type *</label>
//                   <select
//                     name="propertyType"
//                     value={formData.propertyType}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
//                     required
//                   >
//                     <option value="">Select property type</option>
//                     {propertyTypes.map(type => (
//                       <option key={type} value={type}>{type}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">Property Title *</label>
//                   <input
//                     type="text"
//                     name="propertyTitle"
//                     value={formData.propertyTitle}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
//                     placeholder="e.g., Spacious 3BHK with Garden View"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700">Complete Address *</label>
//                 <div className="relative">
//                   <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
//                   <input
//                     type="text"
//                     name="address"
//                     value={formData.address}
//                     onChange={handleInputChange}
//                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
//                     placeholder="Enter complete address with building name"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">City *</label>
//                   <select
//                     name="city"
//                     value={formData.city}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
//                   >
//                     <option value="Mumbai">Mumbai</option>
//                     <option value="Delhi">Delhi</option>
//                     <option value="Pune">Pune</option>
//                     <option value="Bangalore">Bangalore</option>
//                     <option value="Chennai">Chennai</option>
//                     <option value="Hyderabad">Hyderabad</option>
//                   </select>
//                 </div>
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">Locality *</label>
//                   <input
//                     type="text"
//                     name="locality"
//                     value={formData.locality}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
//                     placeholder="e.g., Andheri West"
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">PIN Code *</label>
//                   <input
//                     type="text"
//                     name="pincode"
//                     value={formData.pincode}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
//                     placeholder="400058"
//                     pattern="[0-9]{6}"
//                     required
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
//                 <div className="space-y-2">
//                   <label className="block text-xs md:text-sm font-semibold text-gray-700">Area (sq ft) *</label>
//                   <input
//                     type="number"
//                     name="area"
//                     value={formData.area}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2.5 md:px-4 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 text-sm"
//                     placeholder="1200"
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <label className="block text-xs md:text-sm font-semibold text-gray-700">Bedrooms *</label>
//                   <select
//                     name="bedrooms"
//                     value={formData.bedrooms}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2.5 md:px-4 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 text-sm"
//                     required
//                   >
//                     <option value="">Select</option>
//                     <option value="1">1 BHK</option>
//                     <option value="2">2 BHK</option>
//                     <option value="3">3 BHK</option>
//                     <option value="4">4 BHK</option>
//                     <option value="5+">5+ BHK</option>
//                   </select>
//                 </div>
//                 <div className="space-y-2">
//                   <label className="block text-xs md:text-sm font-semibold text-gray-700">Bathrooms *</label>
//                   <select
//                     name="bathrooms"
//                     value={formData.bathrooms}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2.5 md:px-4 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 text-sm"
//                     required
//                   >
//                     <option value="">Select</option>
//                     <option value="1">1</option>
//                     <option value="2">2</option>
//                     <option value="3">3</option>
//                     <option value="4">4</option>
//                     <option value="5+">5+</option>
//                   </select>
//                 </div>
//                 <div className="space-y-2">
//                   <label className="block text-xs md:text-sm font-semibold text-gray-700">Parking</label>
//                   <select
//                     name="parking"
//                     value={formData.parking}
//                     onChange={handleInputChange}
//                     className="w-full px-3 py-2.5 md:px-4 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 text-sm"
//                   >
//                     <option value="">None</option>
//                     <option value="1">1 Car</option>
//                     <option value="2">2 Cars</option>
//                     <option value="3">3 Cars</option>
//                     <option value="4+">4+ Cars</option>
//                   </select>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">Floor</label>
//                   <input
//                     type="number"
//                     name="floor"
//                     value={formData.floor}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
//                     placeholder="5"
//                     min="0"
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">Total Floors</label>
//                   <input
//                     type="number"
//                     name="totalFloors"
//                     value={formData.totalFloors}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
//                     placeholder="20"
//                     min="1"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700">Facing Direction</label>
//                 <select
//                   name="facing"
//                   value={formData.facing}
//                   onChange={handleInputChange}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
//                 >
//                   <option value="">Select facing direction</option>
//                   {facingOptions.map(option => (
//                     <option key={option} value={option}>{option}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>
//         );

//       case 3:
//         return (
//           <div className="space-y-6 md:space-y-8">
//             <div className="text-center mb-6">
//               <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
//                 <DollarSign className="w-8 h-8 text-white" />
//               </div>
//               <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Pricing & Features</h3>
//               <p className="text-gray-600">Set your price and highlight features</p>
//             </div>

//             <div className="space-y-6">
//               <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
//                   <div className="md:col-span-2 space-y-2">
//                     <label className="block text-sm font-semibold text-gray-700">Expected Price (₹) *</label>
//                     <div className="relative">
//                       <input
//                         type="number"
//                         name="expectedPrice"
//                         value={formData.expectedPrice}
//                         onChange={handleInputChange}
//                         className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
//                         placeholder="25000000"
//                         required
//                       />
//                       {formData.expectedPrice && (
//                         <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 bg-white px-2 rounded">
//                           {formatPrice(formData.expectedPrice)}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                   <div className="flex items-center justify-center md:justify-start">
//                     <label className="flex items-center bg-white px-4 py-3 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer">
//                       <input
//                         type="checkbox"
//                         name="priceNegotiable"
//                         checked={formData.priceNegotiable}
//                         onChange={handleInputChange}
//                         className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
//                       />
//                       <span className="text-sm font-medium text-gray-700">Negotiable</span>
//                     </label>
//                   </div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">Furnishing Status *</label>
//                   <select
//                     name="furnishing"
//                     value={formData.furnishing}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
//                     required
//                   >
//                     <option value="">Select furnishing</option>
//                     {furnishingOptions.map(option => (
//                       <option key={option} value={option}>{option}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">Possession Status *</label>
//                   <select
//                     name="possession"
//                     value={formData.possession}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
//                     required
//                   >
//                     <option value="">Select possession</option>
//                     {possessionOptions.map(option => (
//                       <option key={option} value={option}>{option}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700">Year Built</label>
//                   <input
//                     type="number"
//                     name="builtYear"
//                     value={formData.builtYear}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
//                     placeholder="2020"
//                     min="1950"
//                     max="2025"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-4">
//                 <label className="block text-sm font-semibold text-gray-700">
//                   <Building className="inline w-4 h-4 mr-2" />
//                   Amenities & Features
//                 </label>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//                   {amenitiesList.map(amenity => (
//                     <label key={amenity} className="flex items-center bg-gray-50 hover:bg-blue-50 p-3 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer group">
//                       <input
//                         type="checkbox"
//                         checked={formData.amenities.includes(amenity)}
//                         onChange={() => handleAmenityChange(amenity)}
//                         className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
//                       />
//                       <span className="text-sm text-gray-700 group-hover:text-blue-700 transition-colors duration-200">{amenity}</span>
//                       {formData.amenities.includes(amenity) && (
//                         <Star className="w-3 h-3 text-blue-600 ml-auto" />
//                       )}
//                     </label>
//                   ))}
//                 </div>
//                 <p className="text-xs text-gray-500 mt-2">Select all amenities that apply to your property</p>
//               </div>

//               <div className="space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700">Property Description *</label>
//                 <textarea
//                   name="description"
//                   value={formData.description}
//                   onChange={handleInputChange}
//                   rows={4}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 resize-none"
//                   placeholder="Describe your property in detail. Highlight unique features, nearby landmarks, transportation, schools, hospitals, shopping centers, etc. This helps buyers understand what makes your property special."
//                   required
//                 />
//                 <div className="text-xs text-gray-500 text-right">
//                   {formData.description.length}/500 characters
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       case 4:
//         return (
//           <div className="space-y-6 md:space-y-8">
//             <div className="text-center mb-6">
//               <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
//                 <Camera className="w-8 h-8 text-white" />
//               </div>
//               <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Images & Documents</h3>
//               <p className="text-gray-600">Add photos and verify documents</p>
//             </div>

//             <div className="space-y-6">
//               <div className="space-y-4">
//                 <label className="block text-sm font-semibold text-gray-700">Property Images *</label>
//                 <div className="border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-2xl p-6 md:p-8 text-center transition-all duration-200 group">
//                   <div className="space-y-4">
//                     <div className="w-16 h-16 bg-gray-100 group-hover:bg-blue-50 rounded-full flex items-center justify-center mx-auto transition-all duration-200">
//                       <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
//                     </div>
//                     <div>
//                       <p className="text-gray-700 font-medium mb-1">Upload property photos</p>
//                       <p className="text-sm text-gray-500">Drag & drop or click to browse (Max 10 images, 5MB each)</p>
//                       <p className="text-xs text-gray-400 mt-2">Supported formats: JPG, PNG, WEBP</p>
//                     </div>
//                     <input
//                       type="file"
//                       multiple
//                       accept="image/*"
//                       onChange={handleImageUpload}
//                       className="hidden"
//                       id="image-upload"
//                     />
//                     <label
//                       htmlFor="image-upload"
//                       className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 font-medium"
//                     >
//                       <Camera className="w-4 h-4 mr-2" />
//                       Choose Images
//                     </label>
//                   </div>
//                 </div>

//                 {formData.images.length > 0 && (
//                   <div className="space-y-3">
//                     <div className="flex items-center justify-between">
//                       <p className="text-sm font-medium text-gray-700">
//                         {formData.images.length} image{formData.images.length !== 1 ? 's' : ''} selected
//                       </p>
//                       <div className="text-xs text-gray-500">
//                         {10 - formData.images.length} more allowed
//                       </div>
//                     </div>
//                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
//                       {formData.images.map((image, index) => (
//                         <div key={index} className="relative group">
//                           <img
//                             src={URL.createObjectURL(image)}
//                             alt={`Property ${index + 1}`}
//                             className="w-full h-24 md:h-28 object-cover rounded-xl border-2 border-gray-200 group-hover:border-blue-400 transition-all duration-200"
//                           />
//                           <button
//                             type="button"
//                             onClick={() => removeImage(index)}
//                             className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-all duration-200 transform hover:scale-110 shadow-lg"
//                           >
//                             <X className="w-3 h-3" />
//                           </button>
//                           <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-xl transition-all duration-200"></div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="bg-gray-50 p-4 md:p-6 rounded-2xl space-y-4">
//                 <div className="flex items-center space-x-3">
//                   <input
//                     type="checkbox"
//                     name="hasDocuments"
//                     checked={formData.hasDocuments}
//                     onChange={handleInputChange}
//                     className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
//                   />
//                   <label className="text-sm font-semibold text-gray-700 flex items-center">
//                     <FileText className="w-4 h-4 mr-2 text-blue-600" />
//                     I have the required property documents
//                   </label>
//                 </div>

//                 {formData.hasDocuments && (
//                   <div className="space-y-3 pl-8">
//                     <label className="block text-sm font-medium text-gray-700 mb-3">Available Documents</label>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                       {documentTypes.map(docType => (
//                         <label key={docType} className="flex items-center bg-white p-3 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer group">
//                           <input
//                             type="checkbox"
//                             checked={formData.documentTypes.includes(docType)}
//                             onChange={() => handleDocumentTypeChange(docType)}
//                             className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
//                           />
//                           <span className="text-sm text-gray-700 group-hover:text-blue-700 transition-colors duration-200">{docType}</span>
//                           {formData.documentTypes.includes(docType) && (
//                             <Check className="w-4 h-4 text-green-600 ml-auto" />
//                           )}
//                         </label>
//                       ))}
//                     </div>
//                     <p className="text-xs text-gray-500 mt-2">
//                       Having proper documents increases buyer confidence and speeds up the selling process
//                     </p>
//                   </div>
//                 )}
//               </div>

//               <div className="bg-blue-50 border border-blue-200 p-4 md:p-6 rounded-2xl">
//                 <div className="flex items-start space-x-3">
//                   <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
//                     <FileText className="w-4 h-4 text-blue-600" />
//                   </div>
//                   <div className="space-y-2">
//                     <h4 className="text-sm font-semibold text-blue-900">Important Notes</h4>
//                     <ul className="text-xs text-blue-800 space-y-1">
//                       <li>• High-quality images get 3x more inquiries</li>
//                       <li>• Include photos of all rooms, balcony, and building exterior</li>
//                       <li>• Avoid blurry or dark images</li>
//                       <li>• Our team will review and publish within 24 hours</li>
//                     </ul>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
//       {/* Make modal a column flex with fixed height so footer stays visible; content scrolls inside */}
//       <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] md:h-[85vh] flex flex-col">
//         {/* Header */}
//         <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
//           <div className="absolute inset-0 bg-black bg-opacity-10"></div>
//           <div className="relative flex items-center justify-between p-4 md:p-6">
//             <div className="space-y-1">
//               <h2 className="text-lg md:text-2xl font-bold">Sell Your Property</h2>
//               <p className="text-blue-100 text-sm md:text-base">{stepTitles[currentStep - 1]}</p>
//             </div>
//             <button
//               onClick={onClose}
//               className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-xl transition-all duration-200 transform hover:scale-110"
//             >
//               <X size={20} className="md:w-6 md:h-6" />
//             </button>
//           </div>
//         </div>

//         {/* Progress Bar */}
//         <div className="px-4 md:px-6 py-3 md:py-4 bg-gray-50">
//           <div className="flex items-center justify-between">
//             {[1, 2, 3, 4].map((step, index) => (
//               <div key={step} className="flex items-center flex-1">
//                 <div className="flex items-center space-x-2 md:space-x-3">
//                   <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base font-bold transition-all duration-300 ${step < currentStep
//                     ? 'bg-green-500 text-white'
//                     : step === currentStep
//                       ? 'bg-blue-600 text-white ring-4 ring-blue-200'
//                       : 'bg-gray-200 text-gray-600'
//                     }`}>
//                     {step < currentStep ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : step}
//                   </div>
//                   <div className="hidden md:block">
//                     <div className={`text-sm font-semibold ${step <= currentStep ? 'text-blue-600' : 'text-gray-500'}`}>
//                       {stepTitles[step - 1]}
//                     </div>
//                     <div className="text-xs text-gray-500">
//                       {stepDescriptions[step - 1]}
//                     </div>
//                   </div>
//                 </div>
//                 {step < 4 && (
//                   <div className={`flex-1 h-1 mx-2 md:mx-4 rounded-full transition-all duration-300 ${step < currentStep ? 'bg-green-500' : 'bg-gray-200'
//                     }`} />
//                 )}
//               </div>
//             ))}
//           </div>

//           {/* Mobile step info */}
//           <div className="md:hidden mt-3 text-center">
//             <div className="text-sm font-semibold text-blue-600">{stepTitles[currentStep - 1]}</div>
//             <div className="text-xs text-gray-500">{stepDescriptions[currentStep - 1]}</div>
//           </div>
//         </div>

//         {/* Content: make this flex-1 and scrollable */}
//         <div className="p-4 md:p-6 overflow-y-auto flex-1" style={{ paddingBottom: 24 }}>
//           <form onSubmit={handleSubmit}>
//             {renderStepContent()}
//           </form>
//         </div>

//         {/* Footer (stays visible because parent is fixed-height and content scrolls) */}
//         <div className="flex items-center justify-between p-4 md:p-6 border-t border-gray-200 bg-gray-50">
//           <button
//             type="button"
//             onClick={prevStep}
//             disabled={currentStep === 1}
//             className="flex items-center px-4 md:px-6 py-2 md:py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
//           >
//             Previous
//           </button>

//           <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
//             <span>Step {currentStep} of 4</span>
//             <div className="w-24 bg-gray-200 rounded-full h-2">
//               <div
//                 className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//                 style={{ width: `${(currentStep / 4) * 100}%` }}
//               ></div>
//             </div>
//           </div>

//           {currentStep < 4 ? (
//             <button
//               type="button"
//               onClick={nextStep}
//               className="flex items-center px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 font-medium shadow-lg"
//             >
//               Next
//               <ChevronRight className="w-4 h-4 ml-1" />
//             </button>
//           ) : (
//             <button
//               type="submit"
//               disabled={isSubmitting || formData.images.length === 0}
//               className="flex items-center px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg transform hover:scale-105"
//             >
//               {isSubmitting ? (
//                 <>
//                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                   Publishing...
//                 </>
//               ) : (
//                 <>
//                   <FileText className="w-4 h-4 mr-2" />
//                   List Property
//                 </>
//               )}
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };
// export default PublicSellPropertyForm;


import React, { useState } from 'react';
import { X, Upload, MapPin, Home, Camera, FileText, User, Phone, Mail, DollarSign, Check, ChevronRight, Building, Star } from 'lucide-react';

interface SellPropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const PublicSellPropertyForm: React.FC<SellPropertyFormProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Owner Details
    salutation: 'Mr',                 // pre-filled
    ownerName: 'Rahul Sharma',        // pre-filled
    ownerPhone: '9876543210',         // pre-filled
    ownerWhatsapp: '9876543210',      // pre-filled (same as phone)
    ownerEmail: 'rahul@example.com',  // pre-filled
    ownerType: 'individual',
    sameAsPhone: true,                // checkbox state for syncing whatsapp

    // Property Details
    propertyType: '',
    propertyTitle: '',
    address: '',
    city: 'Mumbai',
    locality: '',
    pincode: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    parking: '',
    floor: '',
    totalFloors: '',
    facing: '',

    // Pricing & Details
    expectedPrice: '',
    priceNegotiable: true,
    furnishing: '',
    possession: '',
    builtYear: '',

    // Amenities
    amenities: [] as string[],

    // Description
    description: '',

    // Images (file references)
    images: [] as File[],

    // Documents
    hasDocuments: false,
    documentTypes: [] as string[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const propertyTypes = [
    'Apartment/Flat',
    'Independent House/Villa',
    'Builder Floor',
    'Penthouse',
    'Studio Apartment',
    'Row House',
    'Commercial Space',
    'Plot/Land'
  ];

  const furnishingOptions = [
    'Fully Furnished',
    'Semi Furnished',
    'Unfurnished'
  ];

  const possessionOptions = [
    'Ready to Move',
    'Under Construction',
    'New Launch'
  ];

  const facingOptions = [
    'North',
    'South',
    'East',
    'West',
    'North-East',
    'North-West',
    'South-East',
    'South-West'
  ];

  const amenitiesList = [
    'Swimming Pool',
    'Gym/Fitness Center',
    '24/7 Security',
    'Power Backup',
    'Lift/Elevator',
    'Club House',
    'Garden/Park',
    'Children\'s Play Area',
    'Car Parking',
    'Visitor Parking',
    'Intercom Facility',
    'High Speed Internet',
    'Water Storage',
    'Rainwater Harvesting',
    'Solar Panels',
    'CCTV Surveillance'
  ];

  const documentTypes = [
    'Sale Deed',
    'Title Certificate',
    'Approved Building Plan',
    'NOC from Society',
    'Property Tax Receipt',
    'Electricity Bill',
    'Occupancy Certificate',
    'Encumbrance Certificate'
  ];

  const stepTitles = [
    'Owner Information',
    'Property Details',
    'Pricing & Features',
    'Images & Documents'
  ];

  const stepDescriptions = [
    'Tell us about yourself',
    'Describe your property',
    'Set price and add features',
    'Add photos and documents'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => {
      // Special handling for sameAsPhone checkbox
      if (name === 'sameAsPhone') {
        // If user checks sameAsPhone, copy ownerPhone to ownerWhatsapp
        return {
          ...prev,
          sameAsPhone: checked,
          ownerWhatsapp: checked ? prev.ownerPhone : prev.ownerWhatsapp
        };
      }

      // If ownerPhone changes and sameAsPhone is true, sync ownerWhatsapp too
      if (name === 'ownerPhone') {
        return {
          ...prev,
          ownerPhone: value,
          ownerWhatsapp: prev.sameAsPhone ? value : prev.ownerWhatsapp
        };
      }

      // Default behavior for checkboxes and other inputs
      return {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
    });
  };

  const handleAmenityChange = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleDocumentTypeChange = (docType: string) => {
    setFormData(prev => ({
      ...prev,
      documentTypes: prev.documentTypes.includes(docType)
        ? prev.documentTypes.filter(d => d !== docType)
        : [...prev.documentTypes, docType]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 10)
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Property listed successfully! Our team will review and publish it within 24 hours.');
      onClose();
      setCurrentStep(1);
      setFormData({
        salutation: 'Mr', ownerName: '', ownerPhone: '', ownerWhatsapp: '', ownerEmail: '', ownerType: 'individual', sameAsPhone: false,
        propertyType: '', propertyTitle: '', address: '', city: 'Mumbai', locality: '', pincode: '',
        area: '', bedrooms: '', bathrooms: '', parking: '', floor: '', totalFloors: '', facing: '',
        expectedPrice: '', priceNegotiable: true, furnishing: '', possession: '', builtYear: '',
        amenities: [], description: '', images: [], hasDocuments: false, documentTypes: []
      });
    } catch (error) {
      alert('Failed to submit property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (value: string) => {
    if (!value) return '';
    const num = parseInt(value);
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
    return `₹${num.toLocaleString()}`;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 md:space-y-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Owner Information</h3>
              <p className="text-gray-600">Let us know who you are</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Salutation</label>
                  <select
                    name="salutation"
                    value={formData.salutation}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                  >
                    <option value="Mr">Mr</option>
                    <option value="Ms">Ms</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Dr">Dr</option>
                    <option value="Mx">Mx</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700">Full Name *</label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      name="ownerPhone"
                      value={formData.ownerPhone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">WhatsApp Number</label>
                  <div className="flex items-center space-x-3">
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        name="ownerWhatsapp"
                        value={formData.ownerWhatsapp}
                        onChange={handleInputChange}
                        disabled={formData.sameAsPhone}
                        className={`w-full pl-10 pr-4 py-3 border ${formData.sameAsPhone ? 'border-gray-200 bg-gray-50' : 'border-gray-300 bg-white'} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300`}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        name="sameAsPhone"
                        checked={formData.sameAsPhone}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-600">Same as phone</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="ownerEmail"
                      value={formData.ownerEmail}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Owner Type *</label>
                  <select
                    name="ownerType"
                    value={formData.ownerType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                  >
                    <option value="individual">Individual Owner</option>
                    <option value="builder">Builder/Developer</option>
                    <option value="agent">Real Estate Agent</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 md:space-y-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Property Details</h3>
              <p className="text-gray-600">Tell us about your property</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Property Type *</label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                    required
                  >
                    <option value="">Select property type</option>
                    {propertyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Property Title *</label>
                  <input
                    type="text"
                    name="propertyTitle"
                    value={formData.propertyTitle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                    placeholder="e.g., Spacious 3BHK with Garden View"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Complete Address *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                    placeholder="Enter complete address with building name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">City *</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                  >
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Pune">Pune</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Locality *</label>
                  <input
                    type="text"
                    name="locality"
                    value={formData.locality}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                    placeholder="e.g., Andheri West"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">PIN Code *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                    placeholder="400058"
                    pattern="[0-9]{6}"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="space-y-2">
                  <label className="block text-xs md:text-sm font-semibold text-gray-700">Area (sq ft) *</label>
                  <input
                    type="number"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 md:px-4 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 text-sm"
                    placeholder="1200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs md:text-sm font-semibold text-gray-700">Bedrooms *</label>
                  <select
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 md:px-4 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 text-sm"
                    required
                  >
                    <option value="">Select</option>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4 BHK</option>
                    <option value="5+">5+ BHK</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs md:text-sm font-semibold text-gray-700">Bathrooms *</label>
                  <select
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 md:px-4 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 text-sm"
                    required
                  >
                    <option value="">Select</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5+">5+</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-xs md:text-sm font-semibold text-gray-700">Parking</label>
                  <select
                    name="parking"
                    value={formData.parking}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 md:px-4 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 text-sm"
                  >
                    <option value="">None</option>
                    <option value="1">1 Car</option>
                    <option value="2">2 Cars</option>
                    <option value="3">3 Cars</option>
                    <option value="4+">4+ Cars</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Floor</label>
                  <input
                    type="number"
                    name="floor"
                    value={formData.floor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                    placeholder="5"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Total Floors</label>
                  <input
                    type="number"
                    name="totalFloors"
                    value={formData.totalFloors}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                    placeholder="20"
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Facing Direction</label>
                <select
                  name="facing"
                  value={formData.facing}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                >
                  <option value="">Select facing direction</option>
                  {facingOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 md:space-y-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Pricing & Features</h3>
              <p className="text-gray-600">Set your price and highlight features</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Expected Price (₹) *</label>
                    <div className="relative">
                      <input
                        type="number"
                        name="expectedPrice"
                        value={formData.expectedPrice}
                        onChange={handleInputChange}
                        className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                        placeholder="25000000"
                        required
                      />
                      {formData.expectedPrice && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 bg-white px-2 rounded">
                          {formatPrice(formData.expectedPrice)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-center md:justify-start">
                    <label className="flex items-center bg-white px-4 py-3 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        name="priceNegotiable"
                        checked={formData.priceNegotiable}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                      />
                      <span className="text-sm font-medium text-gray-700">Negotiable</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Furnishing Status *</label>
                  <select
                    name="furnishing"
                    value={formData.furnishing}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                    required
                  >
                    <option value="">Select furnishing</option>
                    {furnishingOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Possession Status *</label>
                  <select
                    name="possession"
                    value={formData.possession}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                    required
                  >
                    <option value="">Select possession</option>
                    {possessionOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Year Built</label>
                  <input
                    type="number"
                    name="builtYear"
                    value={formData.builtYear}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300"
                    placeholder="2020"
                    min="1950"
                    max="2025"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">
                  <Building className="inline w-4 h-4 mr-2" />
                  Amenities & Features
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {amenitiesList.map(amenity => (
                    <label key={amenity} className="flex items-center bg-gray-50 hover:bg-blue-50 p-3 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={() => handleAmenityChange(amenity)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-blue-700 transition-colors duration-200">{amenity}</span>
                      {formData.amenities.includes(amenity) && (
                        <Star className="w-3 h-3 text-blue-600 ml-auto" />
                      )}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Select all amenities that apply to your property</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Property Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 resize-none"
                  placeholder="Describe your property in detail. Highlight unique features, nearby landmarks, transportation, schools, hospitals, shopping centers, etc. This helps buyers understand what makes your property special."
                  required
                />
                <div className="text-xs text-gray-500 text-right">
                  {formData.description.length}/500 characters
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 md:space-y-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Images & Documents</h3>
              <p className="text-gray-600">Add photos and verify documents</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">Property Images *</label>
                <div className="border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-2xl p-6 md:p-8 text-center transition-all duration-200 group">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gray-100 group-hover:bg-blue-50 rounded-full flex items-center justify-center mx-auto transition-all duration-200">
                      <Upload className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                    </div>
                    <div>
                      <p className="text-gray-700 font-medium mb-1">Upload property photos</p>
                      <p className="text-sm text-gray-500">Drag & drop or click to browse (Max 10 images, 5MB each)</p>
                      <p className="text-xs text-gray-400 mt-2">Supported formats: JPG, PNG, WEBP</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 font-medium"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Choose Images
                    </label>
                  </div>
                </div>

                {formData.images.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">
                        {formData.images.length} image{formData.images.length !== 1 ? 's' : ''} selected
                      </p>
                      <div className="text-xs text-gray-500">
                        {10 - formData.images.length} more allowed
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Property ${index + 1}`}
                            className="w-full h-24 md:h-28 object-cover rounded-xl border-2 border-gray-200 group-hover:border-blue-400 transition-all duration-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-all duration-200 transform hover:scale-110 shadow-lg"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-xl transition-all duration-200"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-4 md:p-6 rounded-2xl space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="hasDocuments"
                    checked={formData.hasDocuments}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
                  />
                  <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-blue-600" />
                    I have the required property documents
                  </label>
                </div>

                {formData.hasDocuments && (
                  <div className="space-y-3 pl-8">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Available Documents</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {documentTypes.map(docType => (
                        <label key={docType} className="flex items-center bg-white p-3 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={formData.documentTypes.includes(docType)}
                            onChange={() => handleDocumentTypeChange(docType)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-blue-700 transition-colors duration-200">{docType}</span>
                          {formData.documentTypes.includes(docType) && (
                            <Check className="w-4 h-4 text-green-600 ml-auto" />
                          )}
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Having proper documents increases buyer confidence and speeds up the selling process
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 md:p-6 rounded-2xl">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-blue-900">Important Notes</h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• High-quality images get 3x more inquiries</li>
                      <li>• Include photos of all rooms, balcony, and building exterior</li>
                      <li>• Avoid blurry or dark images</li>
                      <li>• Our team will review and publish within 24 hours</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4">
      {/* Increased border-radius (rounded-3xl + md:rounded-[32px]) */}
      <div className="bg-white rounded-3xl md:rounded-[32px] shadow-2xl w-full max-w-6xl h-[90vh] md:h-[85vh] flex flex-col">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="relative flex items-center justify-between p-4 md:p-6">
            <div className="space-y-1">
              <h2 className="text-lg md:text-2xl font-bold">Sell Your Property</h2>
              <p className="text-blue-100 text-sm md:text-base">{stepTitles[currentStep - 1]}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-xl transition-all duration-200 transform hover:scale-110"
            >
              <X size={20} className="md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 md:px-6 py-3 md:py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step, index) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-base font-bold transition-all duration-300 ${step < currentStep
                    ? 'bg-green-500 text-white'
                    : step === currentStep
                      ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                      : 'bg-gray-200 text-gray-600'
                    }`}>
                    {step < currentStep ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : step}
                  </div>
                  <div className="hidden md:block">
                    <div className={`text-sm font-semibold ${step <= currentStep ? 'text-blue-600' : 'text-gray-500'}`}>
                      {stepTitles[step - 1]}
                    </div>
                    <div className="text-xs text-gray-500">
                      {stepDescriptions[step - 1]}
                    </div>
                  </div>
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-1 mx-2 md:mx-4 rounded-full transition-all duration-300 ${step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                )}
              </div>
            ))}
          </div>

          {/* Mobile step info */}
          <div className="md:hidden mt-3 text-center">
            <div className="text-sm font-semibold text-blue-600">{stepTitles[currentStep - 1]}</div>
            <div className="text-xs text-gray-500">{stepDescriptions[currentStep - 1]}</div>
          </div>
        </div>

        {/* Content: make this flex-1 and scrollable */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1" style={{ paddingBottom: 24 }}>
          <form onSubmit={handleSubmit}>
            {renderStepContent()}
          </form>
        </div>

        {/* Footer (stays visible because parent is fixed-height and content scrolls) */}
        <div className="flex items-center justify-between p-4 md:p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center px-4 md:px-6 py-2 md:py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Previous
          </button>

          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
            <span>Step {currentStep} of 4</span>
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 font-medium shadow-lg"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || formData.images.length === 0}
              className="flex items-center px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg transform hover:scale-105"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Publishing...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  List Property
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default PublicSellPropertyForm;
