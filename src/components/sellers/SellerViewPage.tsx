// import React, { useState } from 'react';
// import { 
//   ArrowLeft, 
//   Phone, 
//   MessageCircle, 
//   Mail, 
//   Edit, 
//   Share, 
//   Eye, 
//   User,
//   MapPin,
//   Calendar,
//   Star,
//   Building,
//   Activity,
//   FileText,
//   Users,
//   BarChart3,
//   Target,
//   TrendingUp,
//   Plus,
//   CheckCircle,
//   Clock,
//   Send,
//   Shield,
//   Award,
//   Camera,
//   ChevronRight
// } from 'lucide-react';
// import SellerStageUpdateModal from './SellerStageUpdateModal';
// import SellerSharingModal from './SellerSharingModal';
// import ActivityModal from '../buyers/ActivityModal';
// import VisitModal from '../buyers/VisitModal';
// import PropertyFormModal from '@/pages/dashboard/components/PropertyFormModal';

// const SellerViewPage = ({ 
//   seller, 
//   onBack, 
//   onEdit, 
//   onAccount, 
//   onNext, 
//   onPrevious, 
//   currentIndex, 
//   totalSellers, 
//   onUpdateSeller 
// }: any) => {
//   const [activeTab, setActiveTab] = useState('overview');
//   const [showStageUpdateModal, setShowStageUpdateModal] = useState(false);
//   const [showSharingModal, setShowSharingModal] = useState(false);
//   const [showActivityModal, setShowActivityModal] = useState(false);
//   const [showVisitModal, setShowVisitModal] = useState(false);
//   const [showPropertyForm, setShowPropertyForm] = useState(false);
//   const [editingActivity, setEditingActivity] = useState<any>(null);
//   const [editingProperty, setEditingProperty] = useState<any>(null);
//   const [expandedSection, setExpandedSection] = useState<string | null>(null);

//   const tabs = [
//     { id: 'overview', label: 'Overview', icon: User, count: null },
//     { id: 'details', label: 'Details', icon: FileText, count: null },
//     { id: 'buyers', label: 'Buyers', icon: Users, count: seller.interestedBuyers || 0 },
//     { id: 'activities', label: 'Activities', icon: Activity, count: seller.activities?.length || 0 },
//     { id: 'documents', label: 'Documents', icon: FileText, count: seller.documents?.length || 0 },
//     { id: 'visits', label: 'Visits', icon: Eye, count: seller.visits || 0 },
//     { id: 'deal', label: 'Deal', icon: Target, count: null },
//     { id: 'analytics', label: 'Analytics', icon: BarChart3, count: null }
//   ];

//   const sellerStages = [
//     { id: 'initial_contact', label: 'Initial Contact', progress: 10, color: 'blue' },
//     { id: 'property_collection', label: 'Property Collection', progress: 25, color: 'purple' },
//     { id: 'mandate_discussion', label: 'Mandate Discussion', progress: 40, color: 'orange' },
//     { id: 'mandate_signed', label: 'Mandate Signed', progress: 60, color: 'green' },
//     { id: 'selling_process', label: 'Selling Process', progress: 75, color: 'indigo' },
//     { id: 'deal_negotiation', label: 'Deal Negotiation', progress: 85, color: 'yellow' },
//     { id: 'deal_closure', label: 'Deal Closure', progress: 95, color: 'pink' },
//     { id: 'completed', label: 'Completed', progress: 100, color: 'emerald' }
//   ];

//   const currentStage = sellerStages.find(stage => stage.id === seller.stage) || sellerStages[0];

//   const formatCurrency = (amount: number) => {
//     if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
//     if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
//     return `₹${amount.toLocaleString('en-IN')}`;
//   };

//   const getStatusBadge = (status: string) => {
//     const statusConfig = {
//       'active': { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Active' },
//       'inactive': { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Inactive' },
//       'blocked': { bg: 'bg-red-100', text: 'text-red-700', label: 'Blocked' }
//     };
    
//     const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
//     return (
//       <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
//         {config.label}
//       </span>
//     );
//   };

//   const getPriorityBadge = (priority: string) => {
//     const priorityConfig = {
//       'high': { bg: 'bg-red-100', text: 'text-red-700', label: 'High Priority' },
//       'medium': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium Priority' },
//       'low': { bg: 'bg-green-100', text: 'text-green-700', label: 'Low Priority' }
//     };
    
//     const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.low;
//     return (
//       <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
//         {config.label}
//       </span>
//     );
//   };

//   const handleStageUpdate = async (newStage: string, remarks: string, nextAction: string) => {
//     const updatedSeller = {
//       ...seller,
//       stage: newStage,
//       stageProgress: sellerStages.find(s => s.id === newStage)?.progress || 0,
//       lastActivity: new Date().toISOString().split('T')[0],
//       activities: [
//         ...(seller.activities || []),
//         {
//           id: Date.now(),
//           type: 'stage_update',
//           description: `Stage updated to ${sellerStages.find(s => s.id === newStage)?.label}`,
//           date: new Date().toISOString().split('T')[0],
//           time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
//           stage: newStage,
//           outcome: remarks,
//           nextAction: nextAction,
//           executedBy: 'Admin User',
//           remarks: remarks
//         }
//       ]
//     };
    
//     onUpdateSeller(updatedSeller);
//     setShowStageUpdateModal(false);
//   };

//   const handleAddActivity = (activityData: any) => {
//     const updatedSeller = {
//       ...seller,
//       activities: [...(seller.activities || []), activityData],
//       lastActivity: new Date().toISOString().split('T')[0]
//     };
    
//     onUpdateSeller(updatedSeller);
//     setShowActivityModal(false);
//     setEditingActivity(null);
//   };

//   const handleAddVisit = (visitData: any) => {
//     const updatedSeller = {
//       ...seller,
//       visits: (seller.visits || 0) + 1,
//       totalVisits: (seller.totalVisits || 0) + 1,
//       lastActivity: new Date().toISOString().split('T')[0],
//       activities: [
//         ...(seller.activities || []),
//         {
//           id: Date.now(),
//           type: 'visit',
//           description: `Property visit scheduled for ${visitData.property}`,
//           date: visitData.date,
//           time: visitData.time,
//           stage: seller.stage,
//           outcome: visitData.feedback || 'Visit scheduled',
//           nextAction: visitData.nextAction || 'Follow up after visit',
//           executedBy: 'Admin User',
//           remarks: visitData.remarks || ''
//         }
//       ]
//     };
    
//     onUpdateSeller(updatedSeller);
//     setShowVisitModal(false);
//   };

//   const handleAddProperty = (propertyData: any) => {
//     // This is called by PropertyFormModal via onSubmit
//     const updatedSeller = {
//       ...seller,
//       properties: [...(seller.properties || []), propertyData]
//     };
    
//     onUpdateSeller(updatedSeller);
//     setShowPropertyForm(false);
//     setEditingProperty(null);
//   };

//   const renderOverviewTab = () => (
//     <div className="space-y-6">
//       {/* Seller Profile Card */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
//           <div className="flex items-center space-x-4">
//             <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
//               {seller.name?.charAt(0) || ''}
//             </div>
//             <div className="flex-1">
//               <h2 className="text-2xl font-bold">{seller.salutation} {seller.name}</h2>
//               <p className="text-blue-100 text-lg">ID: #{seller.id} • {seller.location}, {seller.city}</p>
//               <div className="flex items-center space-x-4 mt-2">
//                 <span className="text-blue-100">{seller.source} Lead</span>
//                 <div className="flex items-center space-x-1">
//                   <Star className="text-yellow-300 fill-current" size={16} />
//                   <span className="text-white font-medium">{seller.leadScore}/100</span>
//                 </div>
//               </div>
//             </div>
//             <div className="text-right">
//               <div className="text-3xl font-bold">{seller.stageProgress}%</div>
//               <div className="text-blue-100">Progress</div>
//             </div>
//           </div>
//         </div>
        
//         {/* Stage Progress Bar */}
//         <div className="p-4 bg-gray-50">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm font-medium text-gray-700">Stage Progress:</span>
//             <div className="flex items-center space-x-2">
//               <span className={`px-3 py-1 rounded-full text-sm font-medium`}>
//                 {currentStage.label}
//               </span>
//               <span className="text-sm font-bold text-blue-600">{seller.stageProgress}%</span>
//             </div>
//           </div>
//           <div className="w-full bg-gray-200 rounded-full h-3">
//             <div 
//               className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
//               style={{ width: `${seller.stageProgress}%` }}
//             ></div>
//           </div>
//           <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
//             <span>Initial Contact</span>
//             <span>Completed</span>
//           </div>
//         </div>

//         {/* Quick Stats */}
//         <div className="p-6 border-t border-gray-100">
//           <div className="grid grid-cols-4 gap-4">
//             <div className="text-center">
//               <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
//                 <Eye size={16} />
//                 <span className="text-xl font-bold">{seller.visits || 0}</span>
//               </div>
//               <div className="text-xs text-gray-500">visits</div>
//             </div>
//             <div className="text-center">
//               <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
//                 <Users size={16} />
//                 <span className="text-xl font-bold">{seller.interestedBuyers || 0}</span>
//               </div>
//               <div className="text-xs text-gray-500">buyers</div>
//             </div>
//             <div className="text-center">
//               <div className="flex items-center justify-center space-x-1 text-purple-600 mb-1">
//                 <Building size={16} />
//                 <span className="text-xl font-bold">{seller.properties?.length || 0}</span>
//               </div>
//               <div className="text-xs text-gray-500">properties</div>
//             </div>
//             <div className="text-center">
//               <div className="flex items-center justify-center space-x-1 text-orange-600 mb-1">
//                 <Activity size={16} />
//                 <span className="text-xl font-bold">{seller.activities?.length || 0}</span>
//               </div>
//               <div className="text-xs text-gray-500">activities</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Property Images Section */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-semibold text-gray-900">Property Images</h3>
//           <button className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
//             <Camera size={16} />
//             <span>Add Photos</span>
//           </button>
//         </div>
        
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {seller.properties?.[0]?.photos?.slice(0, 3).map((photo: string, index: number) => (
//             <div key={index} className="relative group">
//               <img
//                 src={photo}
//                 alt={`Property ${index + 1}`}
//                 className="w-full h-32 object-cover rounded-xl"
//               />
//               <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-xl flex items-center justify-center">
//                 <Eye className="text-white opacity-0 group-hover:opacity-100 transition-all" size={24} />
//               </div>
//             </div>
//           ))}
//           <div className="border-2 border-dashed border-gray-300 rounded-xl h-32 flex items-center justify-center hover:border-blue-400 transition-colors cursor-pointer">
//             <div className="text-center">
//               <Camera className="mx-auto text-gray-400 mb-2" size={24} />
//               <span className="text-sm text-gray-500">Add Photo</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Property Details & Seller Information Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Property Details */}
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
//           <div className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <div className="text-sm text-gray-500">Type:</div>
//                 <div className="font-semibold text-gray-900 text-lg">3BHK</div>
//               </div>
//               <div>
//                 <div className="text-sm text-gray-500">Carpet Area:</div>
//                 <div className="font-semibold text-gray-900 text-lg">1250 sq ft</div>
//               </div>
//               <div>
//                 <div className="text-sm text-gray-500">Floor:</div>
//                 <div className="font-semibold text-gray-900 text-lg">4th Floor</div>
//               </div>
//               <div>
//                 <div className="text-sm text-gray-500">Parking:</div>
//                 <div className="font-semibold text-gray-900 text-lg">2 Covered</div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Seller Information */}
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h3>
//           <div className="space-y-4">
//             <div className="flex items-center space-x-3">
//               <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
//                 <User className="text-blue-600" size={20} />
//               </div>
//               <div>
//                 <div className="font-semibold text-gray-900">{seller.name}</div>
//                 <div className="text-sm text-gray-600">{seller.phone}</div>
//               </div>
//             </div>
//             <div className="space-y-2">
//               <div className="flex items-center space-x-2 text-sm">
//                 <Mail size={14} className="text-gray-400" />
//                 <span>Email: {seller.email}</span>
//               </div>
//               <div className="flex items-center space-x-2 text-sm">
//                 <MapPin size={14} className="text-gray-400" />
//                 <span>Lead Source: {seller.source}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   const renderDetailsTab = () => (
//     <div className="space-y-6">
//       {/* Personal Information */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="space-y-4">
//             <div>
//               <label className="text-sm font-medium text-gray-500">Full Name</label>
//               <div className="text-lg font-semibold text-gray-900">{seller.salutation} {seller.name}</div>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-500">Phone Number</label>
//               <div className="text-lg font-semibold text-gray-900">{seller.phone}</div>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-500">Email Address</label>
//               <div className="text-lg font-semibold text-gray-900">{seller.email}</div>
//             </div>
//           </div>
//           <div className="space-y-4">
//             <div>
//               <label className="text-sm font-medium text-gray-500">Location</label>
//               <div className="text-lg font-semibold text-gray-900">{seller.location}, {seller.city}</div>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-500">Lead Source</label>
//               <div className="text-lg font-semibold text-gray-900">{seller.source}</div>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-500">Status</label>
//               <div className="mt-1">{getStatusBadge(seller.status)}</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Business Information */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div>
//             <label className="text-sm font-medium text-gray-500">Priority Level</label>
//             <div className="mt-1">{getPriorityBadge(seller.priority)}</div>
//           </div>
//           <div>
//             <label className="text-sm font-medium text-gray-500">Assigned To</label>
//             <div className="text-lg font-semibold text-gray-900">{seller.assigned}</div>
//           </div>
//           <div>
//             <label className="text-sm font-medium text-gray-500">Lead Score</label>
//             <div className="flex items-center space-x-2">
//               <div className="text-lg font-semibold text-gray-900">{seller.leadScore}/100</div>
//               <div className="flex items-center space-x-1">
//                 <Star className="text-yellow-400 fill-current" size={16} />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Properties Portfolio */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-lg font-semibold text-gray-900">Properties Portfolio</h3>
//           <button 
//             onClick={() => {
//               setEditingProperty(null);
//               setShowPropertyForm(true);
//             }}
//             className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             <Plus size={16} />
//             <span>Add Property</span>
//           </button>
//         </div>
        
//         {seller.properties && seller.properties.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {seller.properties.map((property: any, index: number) => (
//               <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
//                 <div className="flex items-start space-x-3">
//                   <img
//                     src={property.photos?.[0] || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=200'}
//                     alt={property.title}
//                     className="w-16 h-12 object-cover rounded-lg"
//                   />
//                   <div className="flex-1">
//                     <h4 className="font-semibold text-gray-900">{property.title}</h4>
//                     <p className="text-sm text-gray-600">{property.address}</p>
//                     <div className="flex items-center justify-between mt-2">
//                       <span className="text-sm font-medium text-green-600">{property.price}</span>
//                       <span className="text-xs text-gray-500">{property.area}</span>
//                     </div>
//                   </div>
//                   <div className="flex items-start space-x-2">
//                     <button
//                       onClick={() => {
//                         setEditingProperty(property);
//                         setShowPropertyForm(true);
//                       }}
//                       className="p-1 rounded hover:bg-gray-100"
//                       title="Edit property"
//                     >
//                       <Edit size={16} />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-8">
//             <Building className="mx-auto text-gray-300 mb-3" size={48} />
//             <p className="text-gray-500 mb-4">No properties added yet</p>
//             <button 
//               onClick={() => {
//                 setEditingProperty(null);
//                 setShowPropertyForm(true);
//               }}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Add First Property
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   const renderActivitiesTab = () => (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
//         <button 
//           onClick={() => setShowActivityModal(true)}
//           className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//         >
//           <Plus size={16} />
//           <span>Add Activity</span>
//         </button>
//       </div>

//       {seller.activities && seller.activities.length > 0 ? (
//         <div className="space-y-4">
//           {seller.activities.map((activity: any, index: number) => (
//             <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
//               <div className="flex items-start space-x-4">
//                 <div className="p-2 bg-blue-100 rounded-lg">
//                   <Activity className="text-blue-600" size={16} />
//                 </div>
//                 <div className="flex-1">
//                   <div className="flex items-center justify-between mb-2">
//                     <h4 className="font-semibold text-gray-900">{activity.description}</h4>
//                     <span className="text-sm text-gray-500">{activity.date}</span>
//                   </div>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
//                     <div>Stage: {activity.stage}</div>
//                     <div>Duration: {activity.duration}</div>
//                     <div>By: {activity.executedBy}</div>
//                   </div>
//                   {activity.outcome && (
//                     <div className="mt-2 text-sm text-gray-700">
//                       <span className="font-medium">Outcome:</span> {activity.outcome}
//                     </div>
//                   )}
//                   {activity.nextAction && (
//                     <div className="text-sm text-blue-600">
//                       <span className="font-medium">Next:</span> {activity.nextAction}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
//           <Activity className="mx-auto text-gray-300 mb-4" size={48} />
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities recorded</h3>
//           <p className="text-gray-500 mb-4">Start tracking seller interactions</p>
//           <button 
//             onClick={() => setShowActivityModal(true)}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Add First Activity
//           </button>
//         </div>
//       )}
//     </div>
//   );

//   const renderDocumentsTab = () => (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
//         <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
//           <Plus size={16} />
//           <span>Create Document</span>
//         </button>
//       </div>

//       {/* Document Workflow */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//         <h4 className="font-semibold text-gray-900 mb-4">Document Workflow</h4>
//         <div className="space-y-4">
//           {[
//             { stage: 'creation', label: 'Document Creation', status: 'completed', icon: FileText },
//             { stage: 'sharing', label: 'Sharing with Seller', status: 'completed', icon: Send },
//             { stage: 'otp', label: 'OTP Verification', status: 'pending', icon: Shield },
//             { stage: 'esign', label: 'E-Signature', status: 'pending', icon: Award },
//             { stage: 'completion', label: 'Document Completion', status: 'pending', icon: CheckCircle }
//           ].map((step, index) => (
//             <div key={index} className="flex items-center space-x-4">
//               <div className={`p-2 rounded-lg ${ step.status === 'completed' ? 'bg-green-100' : step.status === 'pending' ? 'bg-orange-100' : 'bg-gray-100' }`}>
//                 <step.icon className={ step.status === 'completed' ? 'text-green-600' : step.status === 'pending' ? 'text-orange-600' : 'text-gray-600' } size={16} />
//               </div>
//               <div className="flex-1">
//                 <div className="font-medium text-gray-900">{step.label}</div>
//                 <div className={`text-sm ${ step.status === 'completed' ? 'text-green-600' : step.status === 'pending' ? 'text-orange-600' : 'text-gray-500' }`}>
//                   {step.status === 'completed' ? 'Completed' : step.status === 'pending' ? 'Pending' : 'Not Started'}
//                 </div>
//               </div>
//               {step.status === 'pending' && (
//                 <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
//                   {step.stage === 'otp' ? 'Send OTP' : step.stage === 'esign' ? 'Initiate E-Sign' : 'Process'}
//                 </button>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Documents List */}
//       {seller.documents && seller.documents.length > 0 ? (
//         <div className="space-y-4">
//           {seller.documents.map((doc: any, index: number) => (
//             <div key={index} className="bg-white rounded-xl border border-gray-200 p-4">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <FileText className="text-blue-600" size={20} />
//                   <div>
//                     <div className="font-semibold text-gray-900">{doc.name}</div>
//                     <div className="text-sm text-gray-600">{doc.category} • {doc.date}</div>
//                   </div>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${ doc.status === 'completed' ? 'bg-green-100 text-green-700' : doc.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700' }`}>
//                     {doc.status}
//                   </span>
//                   <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
//                     <Eye size={16} />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
//           <FileText className="mx-auto text-gray-300 mb-4" size={48} />
//           <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents created</h3>
//           <p className="text-gray-500">Create documents for this seller</p>
//         </div>
//       )}
//     </div>
//   );

//   const renderAnalyticsTab = () => (
//     <div className="space-y-6">
//       {/* Performance Metrics */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-blue-100 text-sm">Response Rate</p>
//               <p className="text-2xl font-bold">{seller.responseRate}%</p>
//             </div>
//             <TrendingUp size={24} className="text-blue-200" />
//           </div>
//         </div>
//         <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-green-100 text-sm">Deal Potential</p>
//               <p className="text-2xl font-bold capitalize">{seller.dealPotential}</p>
//             </div>
//             <Target size={24} className="text-green-200" />
//           </div>
//         </div>
//         <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-purple-100 text-sm">Avg Response</p>
//               <p className="text-2xl font-bold">{seller.avgResponseTime}</p>
//             </div>
//             <Clock size={24} className="text-purple-200" />
//           </div>
//         </div>
//         <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-orange-100 text-sm">Total Visits</p>
//               <p className="text-2xl font-bold">{seller.totalVisits}</p>
//             </div>
//             <Eye size={24} className="text-orange-200" />
//           </div>
//         </div>
//       </div>

//       {/* Progress Chart */}
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Stage Progress</h3>
//         <div className="space-y-3">
//           {sellerStages.map((stage, index) => (
//             <div key={stage.id} className="flex items-center space-x-4">
//               <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ seller.stage === stage.id ? 'bg-blue-500 text-white' : sellerStages.findIndex(s => s.id === seller.stage) > index ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500' }`}>
//                 {sellerStages.findIndex(s => s.id === seller.stage) > index ? (
//                   <CheckCircle size={16} />
//                 ) : (
//                   index + 1
//                 )}
//               </div>
//               <div className="flex-1">
//                 <div className="font-medium text-gray-900">{stage.label}</div>
//                 <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
//                   <div 
//                     className="bg-blue-500 h-2 rounded-full transition-all"
//                     style={{ 
//                       width: seller.stage === stage.id ? `${seller.stageProgress}%` :
//                              sellerStages.findIndex(s => s.id === seller.stage) > index ? '100%' : '0%'
//                     }}
//                   ></div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="h-full flex flex-col bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200 px-6 py-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={onBack}
//               className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
//             >
//               <ArrowLeft size={20} />
//             </button>
//             <div className="flex items-center space-x-4">
//               <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
//                 {seller.name?.charAt(0) || ''}
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-gray-900">{seller.salutation} {seller.name}</h1>
//                 <div className="flex items-center space-x-3 text-sm text-gray-600">
//                   <span>ID: #{seller.id}</span>
//                   <span>•</span>
//                   <span>{seller.location}, {seller.city}</span>
//                   <span>•</span>
//                   <span>{seller.source} Lead</span>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           <div className="flex items-center space-x-3">
//             {/* Navigation */}
//             <div className="flex items-center space-x-2 text-sm text-gray-500">
//               <span>{currentIndex + 1} of {totalSellers}</span>
//               <div className="flex space-x-1">
//                 <button
//                   onClick={onPrevious}
//                   disabled={currentIndex === 0}
//                   className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <ChevronRight size={16} className="rotate-180" />
//                 </button>
//                 <button
//                   onClick={onNext}
//                   disabled={currentIndex === totalSellers - 1}
//                   className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <ChevronRight size={16} />
//                 </button>
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <button
//               onClick={() => window.open(`tel:${seller.phone}`)}
//               className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
//               title="Call"
//             >
//               <Phone size={20} />
//             </button>
//             <button
//               onClick={() => {
//                 const message = `Hi ${seller.name}, this is regarding your property inquiry. How can I assist you today?`;
//                 window.open(`https://wa.me/${seller.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
//               }}
//               className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
//               title="WhatsApp"
//             >
//               <MessageCircle size={20} />
//             </button>
//             <button
//               onClick={() => {
//                 const subject = `Regarding Your Property - ${seller.name}`;
//                 const body = `Dear ${seller.name},\n\nI hope this email finds you well. I wanted to follow up regarding your property inquiry.\n\nBest regards,\nResaleExpert Team`;
//                 window.open(`mailto:${seller.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
//               }}
//               className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
//               title="Email"
//             >
//               <Mail size={20} />
//             </button>
//             <button
//               onClick={onEdit}
//               className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
//               title="Edit"
//             >
//               <Edit size={20} />
//             </button>
//           </div>
//         </div>

//         {/* Tab Navigation */}
//         <div className="mt-4">
//           <nav className="flex space-x-1">
//             {tabs.map((tab) => {
//               const Icon = tab.icon;
//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${ activeTab === tab.id ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'text-gray-600 hover:bg-gray-100' }`}
//                 >
//                   <Icon size={16} />
//                   <span className="font-medium">{tab.label}</span>
//                   {tab.count !== null && (
//                     <span className={`px-2 py-0.5 rounded-full text-xs ${ activeTab === tab.id ? 'bg-blue-200' : 'bg-gray-200' }`}>
//                       {tab.count}
//                     </span>
//                   )}
//                 </button>
//               );
//             })}
//           </nav>
//         </div>
//       </div>

//       {/* Tab Content */}
//       <div className="flex-1 overflow-auto p-6">
//         {activeTab === 'overview' && renderOverviewTab()}
//         {activeTab === 'details' && renderDetailsTab()}
//         {activeTab === 'activities' && renderActivitiesTab()}
//         {activeTab === 'documents' && renderDocumentsTab()}
//         {activeTab === 'analytics' && renderAnalyticsTab()}
//         {/* Add other tab renderers as needed */}
//       </div>

//       {/* Bottom Action Buttons - Fixed Position */}
//       <div className="bg-white border-t border-gray-200 px-6 py-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <button
//               onClick={() => setShowStageUpdateModal(true)}
//               className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
//             >
//               <TrendingUp size={16} />
//               <span>Update Stage</span>
//             </button>
//             <button
//               onClick={() => setShowSharingModal(true)}
//               className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
//             >
//               <Share size={16} />
//               <span>Share</span>
//             </button>
//             <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
//               <Eye size={16} />
//               <span>Track</span>
//             </button>
//           </div>
          
//           <div className="flex items-center space-x-3">
//             <button
//               onClick={() => { setEditingProperty(null); setShowPropertyForm(true); }}
//               className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               <Plus size={16} />
//               <span>Add Activity</span>
//             </button>
//             <button
//               onClick={() => setShowVisitModal(true)}
//               className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//             >
//               <Calendar size={16} />
//               <span>Schedule Visit</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Modals */}
//       {showStageUpdateModal && (
//         <SellerStageUpdateModal
//           isOpen={showStageUpdateModal}
//           onClose={() => setShowStageUpdateModal(false)}
//           seller={seller}
//           onUpdateStage={handleStageUpdate}
//         />
//       )}

//       {showSharingModal && (
//         <SellerSharingModal
//           isOpen={showSharingModal}
//           onClose={() => setShowSharingModal(false)}
//           seller={seller}
//           onShare={(shareData: any) => {
//             console.log('Seller shared:', shareData);
//             setShowSharingModal(false);
//           }}
//         />
//       )}

//       {showActivityModal && (
//         <ActivityModal
//           isOpen={showActivityModal}
//           onClose={() => {
//             setShowActivityModal(false);
//             setEditingActivity(null);
//           }}
//           activity={editingActivity}
//           onSave={handleAddActivity}
//         />
//       )}

//       {showVisitModal && (
//         <VisitModal
//           isOpen={showVisitModal}
//           onClose={() => setShowVisitModal(false)}
//           visit={null}
//           onSave={handleAddVisit}
//           buyer={seller} // Using seller as the context
//         />
//       )}

//       {showPropertyForm && (
//         <PropertyFormModal
//           isOpen={showPropertyForm}
//           onClose={() => {
//             setShowPropertyForm(false);
//             setEditingProperty(null);
//           }}
//           onSubmit={handleAddProperty}                // <-- matches PropertyFormModalProps
//           mode={editingProperty ? 'edit' : 'create'} // create vs edit
//           propertyId={editingProperty?.id}            // optional id when editing
//           initialData={editingProperty || null}       // pass initial data for edit
//         />
//       )}
//     </div>
//   );
// };

// export default SellerViewPage;
import React, { useState } from 'react';
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Mail,
  Edit,
  Share,
  Eye,
  User,
  MapPin,
  Calendar,
  Star,
  Building,
  Activity,
  FileText,
  Users,
  BarChart3,
  Target,
  TrendingUp,
  Plus,
  CheckCircle,
  Clock,
  Send,
  Shield,
  Award,
  Camera,
  ChevronRight
} from 'lucide-react';
import SellerStageUpdateModal from './SellerStageUpdateModal';
import SellerSharingModal from './SellerSharingModal';
import ActivityModal from '../buyers/ActivityModal';
import VisitModal from '../buyers/VisitModal';
import PropertyFormModal from '@/pages/dashboard/components/PropertyFormModal';

type AnyObj = Record<string, any>;

const SellerViewPage: React.FC<{
  seller?: AnyObj;
  onBack?: () => void;
  onEdit?: () => void;
  onAccount?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  currentIndex?: number;
  totalSellers?: number;
  onUpdateSeller?: (s: AnyObj) => void;
}> = ({
  seller = {},
  onBack = () => {},
  onEdit = () => {},
  onAccount = () => {},
  onNext = () => {},
  onPrevious = () => {},
  currentIndex = 0,
  totalSellers = 1,
  onUpdateSeller = () => {}
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showStageUpdateModal, setShowStageUpdateModal] = useState(false);
  const [showSharingModal, setShowSharingModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [editingProperty, setEditingProperty] = useState<any>(null);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User, count: null },
    { id: 'details', label: 'Details', icon: FileText, count: null },
    { id: 'buyers', label: 'Buyers', icon: Users, count: seller.interestedBuyers || 0 },
    { id: 'activities', label: 'Activities', icon: Activity, count: seller.activities?.length || 0 },
    { id: 'documents', label: 'Documents', icon: FileText, count: seller.documents?.length || 0 },
    { id: 'visits', label: 'Visits', icon: Eye, count: seller.visits || 0 },
    { id: 'deal', label: 'Deal', icon: Target, count: null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, count: null }
  ];

  const sellerStages = [
    { id: 'initial_contact', label: 'Initial Contact', progress: 10, color: 'blue' },
    { id: 'property_collection', label: 'Property Collection', progress: 25, color: 'purple' },
    { id: 'mandate_discussion', label: 'Mandate Discussion', progress: 40, color: 'orange' },
    { id: 'mandate_signed', label: 'Mandate Signed', progress: 60, color: 'green' },
    { id: 'selling_process', label: 'Selling Process', progress: 75, color: 'indigo' },
    { id: 'deal_negotiation', label: 'Deal Negotiation', progress: 85, color: 'yellow' },
    { id: 'deal_closure', label: 'Deal Closure', progress: 95, color: 'pink' },
    { id: 'completed', label: 'Completed', progress: 100, color: 'emerald' }
  ];

  const currentStage = sellerStages.find(stage => stage.id === seller.stage) || sellerStages[0];

  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return '—';
    if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(1)}Cr`;
    if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`;
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, any> = {
      active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Active' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Inactive' },
      blocked: { bg: 'bg-red-100', text: 'text-red-700', label: 'Blocked' }
    };
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, any> = {
      high: { bg: 'bg-red-100', text: 'text-red-700', label: 'High Priority' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium Priority' },
      low: { bg: 'bg-green-100', text: 'text-green-700', label: 'Low Priority' }
    };
    const config = priorityConfig[priority] || priorityConfig.low;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const safeString = (v: any) => (v === undefined || v === null ? '' : String(v));
  const safeNumber = (v: any) => {
    if (v === undefined || v === null || v === '') return '';
    const n = Number(v);
    return Number.isNaN(n) ? v : n;
  };
  const ensureArray = (v: any) => {
    if (!v) return [];
    if (Array.isArray(v)) return v;
    if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean);
    return [v];
  };

  const mapPropertyToInitialData = (property: AnyObj | null) => {
    if (!property) return null;

    const mappedPhotos = Array.isArray(property.photos)
      ? property.photos
          .map((p: any, idx: number) => {
            if (!p) return null;
            if (typeof p === 'string') return { id: `${property.id ?? 'p'}-${idx}`, url: p, name: `photo-${idx + 1}` };
            return { id: p.id ?? `${property.id ?? 'p'}-${idx}`, url: p.url ?? p.path ?? '', name: p.name ?? `photo-${idx + 1}` };
          })
          .filter(Boolean)
      : Array.isArray(property.photoUrls)
      ? property.photoUrls.map((u: string, idx: number) => ({ id: `${property.id ?? 'p'}-${idx}`, url: u, name: `photo-${idx + 1}` }))
      : [];

    const mappedNearby = Array.isArray(property.nearby_places)
      ? property.nearby_places.map((n: any) => ({
          name: n.name ?? n.place ?? '',
          type: n.type ?? n.category ?? '',
          distance: n.distance ?? '',
          unit: n.unit ?? ''
        }))
      : [];

    console.log('property', property);
    console.log('parkingQty', property.parking_qty);
    console.log('passisiiion', property.possession_month);
    console.log('passionyear', property.possession_year);
    console.log('puchase', property.purchase_month);
    console.log('puchaseyear', property.purchase_year);

    return {
      id: property.id ?? property._id,
      salutation: property.salutation ?? property.ownerSalutation ?? 'Mr',
      ownerName: property.ownerName ?? property.owner_name ?? property.contactName ?? property.seller_name ?? '',
      ownerPhone: property.ownerPhone ?? property.owner_phone ?? property.contactPhone ?? property.phone ?? '',
      ownerWhatsapp: property.ownerWhatsapp ?? property.owner_whatsapp ?? property.contactWhatsapp ?? '',
      sameAsPhone: !!(
        (property.ownerWhatsapp && property.ownerPhone && property.ownerWhatsapp === property.ownerPhone) ||
        (property.ownerWhatsapp && property.ownerWhatsapp === property.phone)
      ),
      ownerEmail: property.ownerEmail ?? property.owner_email ?? property.contactEmail ?? property.email ?? '',
      ownerType: property.ownerType ?? property.owner_type ?? 'individual',
      seller: property.seller ?? property.seller_name ?? `${safeString(seller?.salutation ? seller.salutation + ' ' : '')}${safeString(seller?.name)}` ?? '',
      propertyType: property.propertyType ?? property.type ?? property.property_type_name ?? '',
      propertySubtype: property.propertySubtype ?? property.subtype ?? property.property_subtype_name ?? '',
      unitType: property.unitType ?? property.unit_type ?? safeString(property.unit_type_name) ?? '',
      wing: property.wing ?? property.block ?? '',
      unitNo: property.unitNo ?? property.unit_no ?? property.unit ?? '',
      furnishing: property.furnishing ?? '',
      parkingType: property.parkingType ?? property.parking_type ?? '',
      parkingQty: safeNumber(property.parkingQty ?? property.parking_qty),
      city: property.city ?? property.city_name ?? seller?.city ?? '',
      location: property.location ?? property.location_name ?? '',
      society: property.society ?? property.society_name ?? '',
      floor: property.floor ?? '',
      totalFloors: property.totalFloors ?? property.total_floors ?? '',
      carpetArea: safeNumber(property.carpetArea ?? property.carpet_area ?? property.area),
      builtupArea: safeNumber(property.builtupArea ?? property.builtup_area),
      budget: safeNumber(property.budget ?? property.price ?? property.expectedPrice),
      address: property.address ?? property.displayAddress ?? property.full_address ?? '',
      status: property.status ?? '',
      leadSource: property.leadSource ?? property.lead_source ?? property.source ?? seller?.source ?? 'Website',
      possessionMonth: property.possessionMonth ?? property.possession_month ?? '',
      possessionYear: property.possessionYear ?? property.possession_year ?? '',
      purchaseMonth: property.purchaseMonth ?? property.purchase_month ?? '',
      purchaseYear: property.purchaseYear ?? property.purchase_year ?? '',
      sellingRights: property.sellingRights ?? property.selling_rights ?? '',
      amenities: ensureArray(property.amenities ?? property.amenities_list ?? []),
      furnishingItems: ensureArray(property.furnishingItems ?? property.furnishing_items ?? []),
      description: property.description ?? property.longDescription ?? property.desc ?? '',
      nearby_places: mappedNearby,
      existingOwnershipDocUrl: property.ownership_doc_path ?? property.ownershipDocUrl ?? '',
      existingOwnershipDocName: property.ownership_doc_name ?? '',
      existingOwnershipDocId: property.ownership_doc_id ?? '',
      existingPhotos: mappedPhotos,
      public_inquiries: property.public_inquiries ?? property.publicInquiries ?? 0,
      public_views: property.public_views ?? property.publicViews ?? 0,
      publication_date: property.publication_date ?? property.publicationDate ?? null
    };
  };

  const openPropertyFormForEdit = (property: AnyObj) => {
    const mapped = mapPropertyToInitialData(property);
    setEditingProperty(mapped);
    setShowPropertyForm(true);
  };

  const openPropertyFormForCreate = () => {
    const prefill = {
      seller: `${seller?.salutation ? seller.salutation + ' ' : ''}${seller?.name ?? ''}`,
      city: seller?.city ?? '',
      location: seller?.location ?? '',
      leadSource: seller?.source ?? 'Website'
    };
    setEditingProperty(prefill);
    setShowPropertyForm(true);
  };

  const handleStageUpdate = (newStage: string, remarks: string, nextAction: string) => {
    const updatedSeller = {
      ...seller,
      stage: newStage,
      stageProgress: sellerStages.find(s => s.id === newStage)?.progress ?? 0,
      lastActivity: new Date().toISOString().split('T')[0],
      activities: [
        ...(seller.activities || []),
        {
          id: Date.now(),
          type: 'stage_update',
          description: `Stage updated to ${sellerStages.find(s => s.id === newStage)?.label ?? newStage}`,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          stage: newStage,
          outcome: remarks,
          nextAction,
          executedBy: 'Admin User',
          remarks
        }
      ]
    };
    onUpdateSeller(updatedSeller);
    setShowStageUpdateModal(false);
  };

  const handleAddActivity = (activityData: AnyObj) => {
    const updatedSeller = {
      ...seller,
      activities: [...(seller.activities || []), activityData],
      lastActivity: new Date().toISOString().split('T')[0]
    };
    onUpdateSeller(updatedSeller);
    setShowActivityModal(false);
    setEditingActivity(null);
  };

  const handleAddVisit = (visitData: AnyObj) => {
    const updatedSeller = {
      ...seller,
      visits: (seller.visits || 0) + 1,
      totalVisits: (seller.totalVisits || 0) + 1,
      lastActivity: new Date().toISOString().split('T')[0],
      activities: [
        ...(seller.activities || []),
        {
          id: Date.now(),
          type: 'visit',
          description: `Property visit scheduled for ${visitData.property}`,
          date: visitData.date,
          time: visitData.time,
          stage: seller.stage,
          outcome: visitData.feedback || 'Visit scheduled',
          nextAction: visitData.nextAction || 'Follow up after visit',
          executedBy: 'Admin User',
          remarks: visitData.remarks || ''
        }
      ]
    };
    onUpdateSeller(updatedSeller);
    setShowVisitModal(false);
  };

  const handleAddProperty = (propertyData: AnyObj) => {
    const updatedSeller = {
      ...seller,
      properties: [...(seller.properties || []), propertyData]
    };
    onUpdateSeller(updatedSeller);
    setShowPropertyForm(false);
    setEditingProperty(null);
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
              {safeString(seller.name).charAt(0) || ''}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{seller.salutation} {seller.name}</h2>
              <p className="text-blue-100 text-lg">ID: #{seller.id ?? '—'} • {seller.location ?? '—'}, {seller.city ?? '—'}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-blue-100">{seller.source ?? '—'} Lead</span>
                <div className="flex items-center space-x-1">
                  <Star className="text-yellow-300 fill-current" size={16} />
                  <span className="text-white font-medium">{seller.leadScore ?? 0}/100</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{seller.stageProgress ?? 0}%</div>
              <div className="text-blue-100">Progress</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Stage Progress:</span>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-sm font-medium">{currentStage.label}</span>
              <span className="text-sm font-bold text-blue-600">{seller.stageProgress ?? 0}%</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${seller.stageProgress ?? 0}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>Initial Contact</span>
            <span>Completed</span>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
                <Eye size={16} />
                <span className="text-xl font-bold">{seller.visits ?? 0}</span>
              </div>
              <div className="text-xs text-gray-500">visits</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
                <Users size={16} />
                <span className="text-xl font-bold">{seller.interestedBuyers ?? 0}</span>
              </div>
              <div className="text-xs text-gray-500">buyers</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-purple-600 mb-1">
                <Building size={16} />
                <span className="text-xl font-bold">{(seller.properties || []).length}</span>
              </div>
              <div className="text-xs text-gray-500">properties</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-orange-600 mb-1">
                <Activity size={16} />
                <span className="text-xl font-bold">{(seller.activities || []).length}</span>
              </div>
              <div className="text-xs text-gray-500">activities</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Property Images</h3>
          <button className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
            <Camera size={16} />
            <span>Add Photos</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {((seller.properties?.[0]?.photos ?? []) as string[]).slice(0, 3).map((photo: string, index: number) => (
            <div key={index} className="relative group">
              <img src={photo} alt={`Property ${index + 1}`} className="w-full h-32 object-cover rounded-xl" />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-xl flex items-center justify-center">
                <Eye className="text-white opacity-0 group-hover:opacity-100 transition-all" size={24} />
              </div>
            </div>
          ))}
          <div className="border-2 border-dashed border-gray-300 rounded-xl h-32 flex items-center justify-center hover:border-blue-400 transition-colors cursor-pointer">
            <div className="text-center">
              <Camera className="mx-auto text-gray-400 mb-2" size={24} />
              <span className="text-sm text-gray-500">Add Photo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Type:</div>
                <div className="font-semibold text-gray-900 text-lg">{seller.properties?.[0]?.unit_type || seller.properties?.[0]?.property_type || '—'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Carpet Area:</div>
                <div className="font-semibold text-gray-900 text-lg">{seller.properties?.[0]?.carpet_area ?? '—'} sq ft</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Floor:</div>
                <div className="font-semibold text-gray-900 text-lg">{seller.properties?.[0]?.floor ?? '—'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Parking:</div>
                <div className="font-semibold text-gray-900 text-lg">
                  {seller.properties?.[0]?.parking_type ? `${seller.properties?.[0]?.parking_qty || ''} ${seller.properties?.[0]?.parking_type}` : '—'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="text-blue-600" size={20} />
              </div>
              <div>
                <div className="font-semibold text-gray-900">{seller.name ?? '—'}</div>
                <div className="text-sm text-gray-600">{seller.phone ?? '—'}</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Mail size={14} className="text-gray-400" />
                <span>Email: {seller.email ?? '—'}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <MapPin size={14} className="text-gray-400" />
                <span>Lead Source: {seller.source ?? '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetailsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Full Name</label>
              <div className="text-lg font-semibold text-gray-900">{seller.salutation} {seller.name}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone Number</label>
              <div className="text-lg font-semibold text-gray-900">{seller.phone}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email Address</label>
              <div className="text-lg font-semibold text-gray-900">{seller.email}</div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Location</label>
              <div className="text-lg font-semibold text-gray-900">{seller.location}, {seller.city}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Lead Source</label>
              <div className="text-lg font-semibold text-gray-900">{seller.source}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">{getStatusBadge(seller.status)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Priority Level</label>
            <div className="mt-1">{getPriorityBadge(seller.priority)}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Assigned To</label>
            <div className="text-lg font-semibold text-gray-900">{seller.assigned ?? '—'}</div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Lead Score</label>
            <div className="flex items-center space-x-2">
              <div className="text-lg font-semibold text-gray-900">{seller.leadScore ?? 0}/100</div>
              <div className="flex items-center space-x-1">
                <Star className="text-yellow-400 fill-current" size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Properties Portfolio</h3>
          <button
            onClick={openPropertyFormForCreate}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span>Add Property</span>
          </button>
        </div>

        {seller.properties && seller.properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {seller.properties.map((property: AnyObj, index: number) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <img
                    src={property.photos?.[0] ?? 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=200'}
                    alt={property.title ?? 'property'}
                    className="w-16 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{property.title ?? property.slug ?? (property.unit_type || property.property_subtype_name || 'Untitled')}</h4>
                    <p className="text-sm text-gray-600">{property.address ?? property.location_name ?? property.location}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-medium text-green-600">{property.price ?? property.budget ?? ''}</span>
                      <span className="text-xs text-gray-500">{property.area ?? property.carpet_area ?? ''}</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <button
                      onClick={() => openPropertyFormForEdit(property)}
                      className="p-1 rounded hover:bg-gray-100"
                      title="Edit property"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Building className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500 mb-4">No properties added yet</p>
            <button onClick={openPropertyFormForCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Add First Property
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderActivitiesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Activity Timeline</h3>
        <button onClick={() => setShowActivityModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={16} />
          <span>Add Activity</span>
        </button>
      </div>

      {seller.activities && seller.activities.length > 0 ? (
        <div className="space-y-4">
          {seller.activities.map((activity: any, index: number) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="text-blue-600" size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{activity.description}</h4>
                    <span className="text-sm text-gray-500">{activity.date}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                    <div>Stage: {activity.stage}</div>
                    <div>Duration: {activity.duration}</div>
                    <div>By: {activity.executedBy}</div>
                  </div>
                  {activity.outcome && <div className="mt-2 text-sm text-gray-700"><span className="font-medium">Outcome:</span> {activity.outcome}</div>}
                  {activity.nextAction && <div className="text-sm text-blue-600"><span className="font-medium">Next:</span> {activity.nextAction}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Activity className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities recorded</h3>
          <p className="text-gray-500 mb-4">Start tracking seller interactions</p>
          <button onClick={() => setShowActivityModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Add First Activity</button>
        </div>
      )}
    </div>
  );

  const renderDocumentsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          <Plus size={16} />
          <span>Create Document</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Document Workflow</h4>
        <div className="space-y-4">
          {[
            { stage: 'creation', label: 'Document Creation', status: 'completed', icon: FileText },
            { stage: 'sharing', label: 'Sharing with Seller', status: 'completed', icon: Send },
            { stage: 'otp', label: 'OTP Verification', status: 'pending', icon: Shield },
            { stage: 'esign', label: 'E-Signature', status: 'pending', icon: Award },
            { stage: 'completion', label: 'Document Completion', status: 'pending', icon: CheckCircle }
          ].map((step, idx) => (
            <div key={idx} className="flex items-center space-x-4">
              <div className={`p-2 rounded-lg ${step.status === 'completed' ? 'bg-green-100' : step.status === 'pending' ? 'bg-orange-100' : 'bg-gray-100'}`}>
                <step.icon className={step.status === 'completed' ? 'text-green-600' : step.status === 'pending' ? 'text-orange-600' : 'text-gray-600'} size={16} />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{step.label}</div>
                <div className={`text-sm ${step.status === 'completed' ? 'text-green-600' : step.status === 'pending' ? 'text-orange-600' : 'text-gray-500'}`}>
                  {step.status === 'completed' ? 'Completed' : step.status === 'pending' ? 'Pending' : 'Not Started'}
                </div>
              </div>
              {step.status === 'pending' && (
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                  {step.stage === 'otp' ? 'Send OTP' : step.stage === 'esign' ? 'Initiate E-Sign' : 'Process'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {seller.documents && seller.documents.length > 0 ? (
        <div className="space-y-4">
          {seller.documents.map((doc: any, index: number) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="text-blue-600" size={20} />
                  <div>
                    <div className="font-semibold text-gray-900">{doc.name}</div>
                    <div className="text-sm text-gray-600">{doc.category} • {doc.date}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${doc.status === 'completed' ? 'bg-green-100 text-green-700' : doc.status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                    {doc.status}
                  </span>
                  <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents created</h3>
          <p className="text-gray-500">Create documents for this seller</p>
        </div>
      )}
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Response Rate</p>
              <p className="text-2xl font-bold">{seller.responseRate ?? '—'}%</p>
            </div>
            <TrendingUp size={24} className="text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Deal Potential</p>
              <p className="text-2xl font-bold capitalize">{seller.dealPotential ?? '—'}</p>
            </div>
            <Target size={24} className="text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Avg Response</p>
              <p className="text-2xl font-bold">{seller.avgResponseTime ?? '—'}</p>
            </div>
            <Clock size={24} className="text-purple-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Visits</p>
              <p className="text-2xl font-bold">{seller.totalVisits ?? 0}</p>
            </div>
            <Eye size={24} className="text-orange-200" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stage Progress</h3>
        <div className="space-y-3">
          {sellerStages.map((stage, index) => (
            <div key={stage.id} className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${seller.stage === stage.id ? 'bg-blue-500 text-white' : sellerStages.findIndex(s => s.id === seller.stage) > index ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {sellerStages.findIndex(s => s.id === seller.stage) > index ? <CheckCircle size={16} /> : index + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{stage.label}</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: seller.stage === stage.id ? `${seller.stageProgress ?? 0}%` : sellerStages.findIndex(s => s.id === seller.stage) > index ? '100%' : '0%' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50 text-xs">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {safeString(seller.name).charAt(0) || ''}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{seller.salutation} {seller.name}</h1>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <span>ID: #{seller.id ?? '—'}</span>
                  <span>•</span>
                  <span>{seller.location ?? '—'}, {seller.city ?? '—'}</span>
                  <span>•</span>
                  <span>{seller.source ?? '—'} Lead</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{currentIndex + 1} of {totalSellers}</span>
              <div className="flex space-x-1">
                <button onClick={onPrevious} disabled={currentIndex === 0} className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronRight size={16} className="rotate-180" />
                </button>
                <button onClick={onNext} disabled={currentIndex === totalSellers - 1} className="p-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <button onClick={() => window.open(`tel:${(seller.phone || '').replace(/\D/g, '')}`)} className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors" title="Call">
              <Phone size={20} />
            </button>

            <button onClick={() => {
              const message = `Hi ${seller.name}, this is regarding your property inquiry. How can I assist you today?`;
              window.open(`https://wa.me/${(seller.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
            }} className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors" title="WhatsApp">
              <MessageCircle size={20} />
            </button>

            <button onClick={() => {
              const subject = `Regarding Your Property - ${seller.name}`;
              const body = `Dear ${seller.name},\n\nI hope this email finds you well. I wanted to follow up regarding your property inquiry.\n\nBest regards,\nResaleExpert Team`;
              window.open(`mailto:${seller.email ?? ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
            }} className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors" title="Email">
              <Mail size={20} />
            </button>

            <button onClick={onEdit} className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors" title="Edit">
              <Edit size={20} />
            </button>
          </div>
        </div>

        <div className="mt-4">
          <nav className="flex space-x-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <Icon size={16} />
                  <span className="font-medium">{tab.label}</span>
                  {tab.count !== null && <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id ? 'bg-blue-200' : 'bg-gray-200'}`}>{tab.count}</span>}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'details' && renderDetailsTab()}
        {activeTab === 'activities' && renderActivitiesTab()}
        {activeTab === 'documents' && renderDocumentsTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
      </div>

      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => setShowStageUpdateModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <TrendingUp size={16} />
              <span>Update Stage</span>
            </button>
            <button onClick={() => setShowSharingModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              <Share size={16} />
              <span>Share</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              <Eye size={16} />
              <span>Track</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button onClick={() => { setEditingProperty(null); openPropertyFormForCreate(); }} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus size={16} />
              <span>Add Activity</span>
            </button>
            <button onClick={() => setShowVisitModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Calendar size={16} />
              <span>Schedule Visit</span>
            </button>
          </div>
        </div>
      </div>

      {showStageUpdateModal && (
        <SellerStageUpdateModal isOpen={showStageUpdateModal} onClose={() => setShowStageUpdateModal(false)} seller={seller} onUpdateStage={handleStageUpdate} />
      )}

      {showSharingModal && (
        <SellerSharingModal isOpen={showSharingModal} onClose={() => setShowSharingModal(false)} seller={seller} onShare={() => setShowSharingModal(false)} />
      )}

      {showActivityModal && (
        <ActivityModal isOpen={showActivityModal} onClose={() => { setShowActivityModal(false); setEditingActivity(null); }} activity={editingActivity} onSave={handleAddActivity} />
      )}

      {showVisitModal && (
        <VisitModal
          isOpen={showVisitModal}
          onClose={() => setShowVisitModal(false)}
          visit={null}
          onSave={handleAddVisit}
          buyer={{ id: seller.id ?? '', name: seller.name ?? '' }}
        />
      )}

      {showPropertyForm && (
        <PropertyFormModal
          isOpen={showPropertyForm}
          onClose={() => { setShowPropertyForm(false); setEditingProperty(null); }}
          onSubmit={handleAddProperty}
          mode={editingProperty && editingProperty.id ? 'edit' : 'create'}
          propertyId={editingProperty?.id}
          initialData={editingProperty ?? { seller: `${seller?.salutation ?? ''} ${seller?.name ?? ''}` }}
        />
      )}
    </div>
  );
};

export default SellerViewPage;
