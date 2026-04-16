// // components/PropertyMediaModal.tsx
// import React, { useState } from 'react';
// import {
//   X,
//   Save,
//   Camera,
//   Video,
//   Upload,
//   Download,
//   Edit,
//   Trash2,
//   Play,
//   Pause,
//   RotateCcw,
//   Maximize2,
//   Eye,
//   Plus
// } from 'lucide-react';

// type MediaPhoto = {
//   id: number | string;
//   url: string;
//   category?: string;
//   title?: string;
//   type?: 'photo' | 'video';
//   uploadedAt?: string;
// };

// type MediaVideo = {
//   id: number | string;
//   url: string;
//   thumbnail?: string;
//   title?: string;
//   duration?: string;
//   uploadedAt?: string;
// };

// type PropertyShape = {
//   id?: string | number;
//   title?: string;
//   photos?: string[]; // array of photo URLs
//   videos?: MediaVideo[]; // structured video objects
//   [k: string]: any;
// };

// type Props = {
//   isOpen: boolean;
//   onClose: () => void;
//   property: PropertyShape;
//   onUpdate: (updated: PropertyShape) => void;
// };

// const PropertyMediaModal: React.FC<Props> = ({ isOpen, onClose, property, onUpdate }) => {
//   const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'virtual_tour' | 'drone'>('photos');
//   const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
//   const [uploadProgress, setUploadProgress] = useState<number>(0);
//   const [isUploading, setIsUploading] = useState<boolean>(false);

//   if (!isOpen) return null;

//   const tabs = [
//     { id: 'photos', label: 'Photos', icon: Camera },
//     { id: 'videos', label: 'Videos', icon: Video },
//     { id: 'virtual_tour', label: 'Virtual Tour', icon: Maximize2 },
//     { id: 'drone', label: 'Drone Footage', icon: Video }
//   ] as const;

//   const photoCategories = [
//     'Exterior', 'Living Room', 'Bedrooms', 'Kitchen', 'Bathrooms', 'Balcony', 'Amenities', 'Parking'
//   ];

//   // sample/static data (you likely will load real media)
//   const samplePhotos: MediaPhoto[] = [
//     { id: 1, url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400', category: 'Exterior', title: 'Building Front View' },
//     { id: 2, url: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=400', category: 'Living Room', title: 'Spacious Living Area' },
//     { id: 3, url: 'https://images.pexels.com/photos/1396125/pexels-photo-1396125.jpeg?auto=compress&cs=tinysrgb&w=400', category: 'Kitchen', title: 'Modern Kitchen' },
//     { id: 4, url: 'https://images.pexels.com/photos/1396126/pexels-photo-1396126.jpeg?auto=compress&cs=tinysrgb&w=400', category: 'Bedrooms', title: 'Master Bedroom' }
//   ];

//   const sampleVideos: MediaVideo[] = [
//     { id: 1, url: '#', thumbnail: samplePhotos[0].url, title: 'Property Walkthrough', duration: '3:45' },
//     { id: 2, url: '#', thumbnail: samplePhotos[1].url, title: 'Amenities Tour', duration: '2:30' }
//   ];

//   const handleFileUpload = async (files: FileList | null, category = 'general') => {
//     if (!files || files.length === 0) return;

//     setIsUploading(true);
//     setUploadProgress(0);

//     try {
//       // Simulate upload of each file
//       for (let i = 0; i < files.length; i++) {
//         const file = files[i];

//         // Simulate progress
//         for (let progress = 0; progress <= 100; progress += 10) {
//           setUploadProgress(progress);
//           // small delay to animate
//           // eslint-disable-next-line no-await-in-loop
//           await new Promise((resolve) => setTimeout(resolve, 80));
//         }

//         const isVideo = file.type.startsWith('video/');
//         const objectUrl = URL.createObjectURL(file);

//         if (isVideo) {
//           const newVideo: MediaVideo = {
//             id: Date.now() + i,
//             url: objectUrl,
//             thumbnail: objectUrl,
//             title: file.name,
//             uploadedAt: new Date().toISOString(),
//           };
//           const updated: PropertyShape = {
//             ...property,
//             videos: [...(property.videos || []), newVideo],
//           };
//           onUpdate(updated);
//         } else {
//           // photo
//           const updated: PropertyShape = {
//             ...property,
//             photos: [...(property.photos || []), objectUrl],
//           };
//           onUpdate(updated);
//         }
//       }

//       // Finalize
//       window.alert('Media uploaded successfully!');
//     } catch (err) {
//       console.error('Upload error:', err);
//       window.alert('Upload failed');
//     } finally {
//       setIsUploading(false);
//       setUploadProgress(0);
//     }
//   };

//   const handleMediaSelection = (mediaId: string) => {
//     setSelectedMedia((prev) =>
//       prev.includes(mediaId) ? prev.filter((id) => id !== mediaId) : [...prev, mediaId]
//     );
//   };

//   const deleteSelectedMedia = () => {
//     if (selectedMedia.length === 0) {
//       window.alert('Please select media to delete');
//       return;
//     }

//     // confirm
//     if (!window.confirm(`Delete ${selectedMedia.length} selected items?`)) return;

//     // Remove selected from photos and videos (IDs are compared as strings)
//     const remainingPhotos = (property.photos || []).filter((pUrl: string, idx: number) => {
//       // some samplePhotos use numeric ids; your real photos likely use URLs - selection uses strings.
//       return !selectedMedia.includes(`photo-${idx}`) && !selectedMedia.includes(pUrl);
//     });

//     const remainingVideos = (property.videos || []).filter((v: MediaVideo) => !selectedMedia.includes(String(v.id)) && !selectedMedia.includes(v.url));

//     const updated: PropertyShape = {
//       ...property,
//       photos: remainingPhotos,
//       videos: remainingVideos
//     };

//     onUpdate(updated);
//     setSelectedMedia([]);
//     window.alert('Selected media deleted successfully!');
//   };

//   const schedulePhotoshoot = () => {
//     const photoshootData = {
//       type: 'professional_photoshoot',
//       scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//       photographer: 'Professional Photographer',
//       requirements: ['Exterior shots', 'Interior rooms', 'Amenities', 'Drone footage'],
//       estimatedDuration: '4 hours',
//       cost: 15000
//     };

 
//     window.alert('Professional photoshoot scheduled! Photographer will contact you within 24 hours.');
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
//         {/* Header */}
//         <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900">Property Media Management</h2>
//               <p className="text-gray-600 mt-1">{property?.title} - Photos, Videos & Virtual Tours</p>
//             </div>
//             <button
//               onClick={onClose}
//               className="p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-lg"
//             >
//               <X size={20} />
//             </button>
//           </div>
//         </div>

//         {/* Tab Navigation */}
//         <div className="border-b border-gray-200 px-6">
//           <nav className="flex space-x-8">
//             {tabs.map((tab) => {
//               const Icon = tab.icon;
//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
//                     activeTab === tab.id
//                       ? 'border-purple-500 text-purple-600'
//                       : 'border-transparent text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   <Icon size={16} />
//                   <span>{tab.label}</span>
//                 </button>
//               );
//             })}
//           </nav>
//         </div>

//         <div className="p-6 max-h-[65vh] overflow-y-auto">
//           {/* Upload Area */}
//           <div className="mb-6">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-gray-900">Upload {tabs.find(t => t.id === activeTab)?.label}</h3>
//               <div className="flex items-center space-x-3">
//                 {selectedMedia.length > 0 && (
//                   <button
//                     onClick={deleteSelectedMedia}
//                     className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//                   >
//                     <Trash2 size={16} />
//                     <span>Delete Selected ({selectedMedia.length})</span>
//                   </button>
//                 )}
//                 <button
//                   onClick={schedulePhotoshoot}
//                   className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
//                 >
//                   <Camera size={16} />
//                   <span>Schedule Professional Shoot</span>
//                 </button>
//               </div>
//             </div>

//             {/* Upload Zone */}
//             <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
//               <input
//                 type="file"
//                 multiple
//                 accept={activeTab === 'videos' ? 'video/*' : 'image/*'}
//                 onChange={(e) => handleFileUpload(e.target.files, 'general')}
//                 className="hidden"
//                 id="media-upload"
//               />
//               <label htmlFor="media-upload" className="cursor-pointer">
//                 <div className="space-y-2">
//                   {activeTab === 'videos' ? (
//                     <Video className="mx-auto text-gray-400" size={32} />
//                   ) : (
//                     <Camera className="mx-auto text-gray-400" size={32} />
//                   )}
//                   <div>
//                     <p className="text-gray-600">
//                       Drop {activeTab === 'videos' ? 'videos' : 'photos'} here or click to browse
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       {activeTab === 'videos' ? 'MP4, MOV, AVI up to 100MB' : 'JPG, PNG up to 10MB each'}
//                     </p>
//                   </div>
//                 </div>
//               </label>

//               {isUploading && (
//                 <div className="mt-4">
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div
//                       className="bg-purple-600 h-2 rounded-full transition-all"
//                       style={{ width: `${uploadProgress}%` }}
//                     />
//                   </div>
//                   <p className="text-sm text-gray-600 mt-2">Uploading... {uploadProgress}%</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Media Grid */}
//           {activeTab === 'photos' && (
//             <div className="space-y-4">
//               {photoCategories.map((category) => (
//                 <div key={category} className="bg-white border border-gray-200 rounded-xl p-4">
//                   <h4 className="font-medium text-gray-900 mb-3">{category}</h4>
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                     {samplePhotos
//                       .filter(photo => photo.category === category)
//                       .map((photo) => (
//                         <div key={photo.id} className="relative group">
//                           <input
//                             type="checkbox"
//                             checked={selectedMedia.includes(String(photo.id))}
//                             onChange={() => handleMediaSelection(String(photo.id))}
//                             className="absolute top-2 left-2 z-10 rounded border-gray-300 text-purple-600"
//                           />
//                           <img
//                             src={photo.url}
//                             alt={photo.title}
//                             className="w-full h-24 object-cover rounded-lg"
//                           />
//                           <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
//                             <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
//                               <button className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100">
//                                 <Eye size={16} />
//                               </button>
//                               <button className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100">
//                                 <Edit size={16} />
//                               </button>
//                             </div>
//                           </div>
//                           <div className="mt-1 text-xs text-gray-600 text-center">{photo.title}</div>
//                         </div>
//                       ))}

//                     {/* Add Photo Button */}
//                     <div className="border-2 border-dashed border-gray-300 rounded-lg h-24 flex items-center justify-center hover:border-purple-400 transition-colors cursor-pointer">
//                       <input
//                         type="file"
//                         accept="image/*"
//                         multiple
//                         onChange={(e) => handleFileUpload(e.target.files, category)}
//                         className="hidden"
//                         id={`upload-${category}`}
//                       />
//                       <label htmlFor={`upload-${category}`} className="cursor-pointer">
//                         <Plus className="text-gray-400" size={20} />
//                       </label>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {activeTab === 'videos' && (
//             <div className="space-y-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {sampleVideos.map((video) => (
//                   <div key={video.id} className="bg-white border border-gray-200 rounded-xl p-4">
//                     <div className="relative">
//                       <input
//                         type="checkbox"
//                         checked={selectedMedia.includes(String(video.id))}
//                         onChange={() => handleMediaSelection(String(video.id))}
//                         className="absolute top-2 left-2 z-10 rounded border-gray-300 text-purple-600"
//                       />
//                       <img
//                         src={video.thumbnail}
//                         alt={video.title}
//                         className="w-full h-32 object-cover rounded-lg"
//                       />
//                       <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
//                         <Play className="text-white" size={32} />
//                       </div>
//                       <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
//                         {video.duration}
//                       </div>
//                     </div>
//                     <div className="mt-2">
//                       <div className="font-medium text-gray-900">{video.title}</div>
//                       <div className="flex items-center justify-between mt-2">
//                         <div className="flex space-x-2">
//                           <button className="p-1 bg-blue-100 text-blue-600 rounded">
//                             <Play size={12} />
//                           </button>
//                           <button className="p-1 bg-green-100 text-green-600 rounded">
//                             <Download size={12} />
//                           </button>
//                           <button className="p-1 bg-purple-100 text-purple-600 rounded">
//                             <Edit size={12} />
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {activeTab === 'virtual_tour' && (
//             <div className="space-y-6">
//               <div className="bg-white border border-gray-200 rounded-xl p-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Virtual Tour</h3>
//                 <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
//                   <div className="text-center">
//                     <Maximize2 className="mx-auto text-gray-400 mb-2" size={48} />
//                     <p className="text-gray-500">360° Virtual Tour will be displayed here</p>
//                     <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
//                       Create Virtual Tour
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {activeTab === 'drone' && (
//             <div className="space-y-6">
//               <div className="bg-white border border-gray-200 rounded-xl p-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Drone Footage</h3>
//                 <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
//                   <div className="text-center">
//                     <Video className="mx-auto text-gray-400 mb-2" size={48} />
//                     <p className="text-gray-500">Aerial drone footage will be displayed here</p>
//                     <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
//                       Schedule Drone Shoot
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="p-6 border-t border-gray-200 bg-gray-50">
//           <div className="flex items-center justify-between">
//             <div className="text-sm text-gray-500">
//               {selectedMedia.length} items selected • Professional photography available
//             </div>
//             <div className="flex items-center space-x-3">
//               <button
//                 onClick={onClose}
//                 className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
//               >
//                 Close
//               </button>
//               <button
//                 onClick={() => window.alert('Media management saved!')}
//                 className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
//               >
//                 <Save size={16} />
//                 <span>Save Changes</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PropertyMediaModal;
// components/PropertyMediaModal.tsx
import React, { useState } from 'react';
import {
  X,
  Save,
  Camera,
  Video,
  Upload,
  Download,
  Edit,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Eye,
  Plus,
  Calendar,
  Clock,
  CheckCircle
} from 'lucide-react';

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

type MediaPhoto = {
  id: number | string;
  url: string;
  category?: string;
  title?: string;
  type?: 'photo' | 'video';
  uploadedAt?: string;
};

type MediaVideo = {
  id: number | string;
  url: string;
  thumbnail?: string;
  title?: string;
  duration?: string;
  uploadedAt?: string;
};

type PropertyShape = {
  id?: string | number;
  title?: string;
  photos?: string[];
  videos?: MediaVideo[];
  [k: string]: any;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyShape;
  onUpdate: (updated: PropertyShape) => void;
};

const PropertyMediaModal: React.FC<Props> = ({ isOpen, onClose, property, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'virtual_tour' | 'drone'>('photos');
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  if (!isOpen) return null;

  const tabs = [
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'virtual_tour', label: 'Virtual Tour', icon: Maximize2 },
    { id: 'drone', label: 'Drone', icon: Video }
  ] as const;

  const photoCategories = [
    'Exterior', 'Living Room', 'Bedrooms', 'Kitchen', 'Bathrooms', 'Balcony', 'Amenities', 'Parking'
  ];

  const samplePhotos: MediaPhoto[] = [
    { id: 1, url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=400', category: 'Exterior', title: 'Building Front View' },
    { id: 2, url: 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=400', category: 'Living Room', title: 'Spacious Living Area' },
    { id: 3, url: 'https://images.pexels.com/photos/1396125/pexels-photo-1396125.jpeg?auto=compress&cs=tinysrgb&w=400', category: 'Kitchen', title: 'Modern Kitchen' },
    { id: 4, url: 'https://images.pexels.com/photos/1396126/pexels-photo-1396126.jpeg?auto=compress&cs=tinysrgb&w=400', category: 'Bedrooms', title: 'Master Bedroom' }
  ];

  const sampleVideos: MediaVideo[] = [
    { id: 1, url: '#', thumbnail: samplePhotos[0].url, title: 'Property Walkthrough', duration: '3:45' },
    { id: 2, url: '#', thumbnail: samplePhotos[1].url, title: 'Amenities Tour', duration: '2:30' }
  ];

  const handleFileUpload = async (files: FileList | null, category = 'general') => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress(progress);
          await new Promise((resolve) => setTimeout(resolve, 80));
        }

        const isVideo = file.type.startsWith('video/');
        const objectUrl = URL.createObjectURL(file);

        if (isVideo) {
          const newVideo: MediaVideo = {
            id: Date.now() + i,
            url: objectUrl,
            thumbnail: objectUrl,
            title: file.name,
            uploadedAt: new Date().toISOString(),
          };
          const updated: PropertyShape = {
            ...property,
            videos: [...(property.videos || []), newVideo],
          };
          onUpdate(updated);
        } else {
          const updated: PropertyShape = {
            ...property,
            photos: [...(property.photos || []), objectUrl],
          };
          onUpdate(updated);
        }
      }
      alert('Media uploaded successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      alert('Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleMediaSelection = (mediaId: string) => {
    setSelectedMedia((prev) =>
      prev.includes(mediaId) ? prev.filter((id) => id !== mediaId) : [...prev, mediaId]
    );
  };

  const deleteSelectedMedia = () => {
    if (selectedMedia.length === 0) {
      alert('Please select media to delete');
      return;
    }

    if (!confirm(`Delete ${selectedMedia.length} selected items?`)) return;

    const remainingPhotos = (property.photos || []).filter((pUrl: string, idx: number) => {
      return !selectedMedia.includes(`photo-${idx}`) && !selectedMedia.includes(pUrl);
    });

    const remainingVideos = (property.videos || []).filter((v: MediaVideo) => 
      !selectedMedia.includes(String(v.id)) && !selectedMedia.includes(v.url)
    );

    const updated: PropertyShape = {
      ...property,
      photos: remainingPhotos,
      videos: remainingVideos
    };

    onUpdate(updated);
    setSelectedMedia([]);
    alert('Selected media deleted successfully!');
  };

  const schedulePhotoshoot = () => {
    alert('Professional photoshoot scheduled! Photographer will contact you within 24 hours.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }}>
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between" style={{ background: N }}>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg" style={{ background: `${O}20` }}>
              <Camera size={16} className="sm:w-5 sm:h-5" style={{ color: O }} />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-bold text-white">Property Media Management</h2>
              <p className="text-[10px] sm:text-xs text-white/70">{property?.title} - Photos, Videos & Tours</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 sm:p-1.5 rounded hover:bg-white/10 transition-colors text-white">
            <X size={16} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b px-3 sm:px-6" style={{ borderColor: BD, background: BG }}>
          <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 border-b-2 text-[11px] sm:text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={14} className="sm:w-4 sm:h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 sm:space-y-6" style={{ scrollbarWidth: 'thin' }}>
          
          {/* Upload Area */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4">
              <h3 className="text-[11px] sm:text-sm font-semibold" style={{ color: N }}>
                Upload {tabs.find(t => t.id === activeTab)?.label}
              </h3>
              <div className="flex items-center gap-2">
                {selectedMedia.length > 0 && (
                  <button
                    onClick={deleteSelectedMedia}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-white text-[10px] sm:text-xs transition-all hover:opacity-90"
                    style={{ background: '#dc2626' }}
                  >
                    <Trash2 size={12} className="sm:w-3 sm:h-3" />
                    <span>Delete ({selectedMedia.length})</span>
                  </button>
                )}
                <button
                  onClick={schedulePhotoshoot}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-white text-[10px] sm:text-xs transition-all hover:opacity-90"
                  style={{ background: O }}
                >
                  <Camera size={12} className="sm:w-3 sm:h-3" />
                  <span>Schedule Shoot</span>
                </button>
              </div>
            </div>

            {/* Upload Zone */}
            <div className="border-2 border-dashed rounded-xl p-3 sm:p-5 text-center transition-all hover:border-orange-400" style={{ borderColor: BD }}>
              <input
                type="file"
                multiple
                accept={activeTab === 'videos' ? 'video/*' : 'image/*'}
                onChange={(e) => handleFileUpload(e.target.files, 'general')}
                className="hidden"
                id="media-upload"
              />
              <label htmlFor="media-upload" className="cursor-pointer">
                <div className="space-y-1.5 sm:space-y-2">
                  {activeTab === 'videos' ? (
                    <Video size={24} className="sm:w-8 sm:h-8 mx-auto" style={{ color: MU }} />
                  ) : (
                    <Camera size={24} className="sm:w-8 sm:h-8 mx-auto" style={{ color: MU }} />
                  )}
                  <div>
                    <p className="text-[11px] sm:text-sm" style={{ color: MU }}>
                      Drop {activeTab === 'videos' ? 'videos' : 'photos'} here or click to browse
                    </p>
                    <p className="text-[9px] sm:text-xs" style={{ color: MU }}>
                      {activeTab === 'videos' ? 'MP4, MOV up to 100MB' : 'JPG, PNG up to 10MB each'}
                    </p>
                  </div>
                </div>
              </label>

              {isUploading && (
                <div className="mt-3 sm:mt-4">
                  <div className="w-full rounded-full h-1.5 sm:h-2 overflow-hidden" style={{ background: `${N}10` }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${uploadProgress}%`, background: O }} />
                  </div>
                  <p className="text-[10px] sm:text-xs mt-1.5" style={{ color: MU }}>Uploading... {uploadProgress}%</p>
                </div>
              )}
            </div>
          </div>

          {/* Photos Grid */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              {photoCategories.map((category) => (
                <div key={category} className="rounded-lg p-3 sm:p-4" style={{ background: BG, border: `1px solid ${BD}` }}>
                  <h4 className="text-[11px] sm:text-sm font-medium mb-2 sm:mb-3" style={{ color: N }}>{category}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                    {samplePhotos
                      .filter(photo => photo.category === category)
                      .map((photo) => (
                        <div key={photo.id} className="relative group">
                          <input
                            type="checkbox"
                            checked={selectedMedia.includes(String(photo.id))}
                            onChange={() => handleMediaSelection(String(photo.id))}
                            className="absolute top-1 left-1 sm:top-2 sm:left-2 z-10 rounded w-3 h-3 sm:w-4 sm:h-4"
                            style={{ accentColor: O }}
                          />
                          <img
                            src={photo.url}
                            alt={photo.title}
                            className="w-full h-20 sm:h-24 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 flex gap-1 sm:gap-2">
                              <button className="p-1 sm:p-1.5 bg-white rounded-lg hover:bg-gray-100 transition-colors">
                                <Eye size={10} className="sm:w-3 sm:h-3" style={{ color: N }} />
                              </button>
                              <button className="p-1 sm:p-1.5 bg-white rounded-lg hover:bg-gray-100 transition-colors">
                                <Edit size={10} className="sm:w-3 sm:h-3" style={{ color: N }} />
                              </button>
                            </div>
                          </div>
                          <div className="mt-1 text-[9px] sm:text-xs text-center" style={{ color: MU }}>{photo.title}</div>
                        </div>
                      ))}

                    {/* Add Photo Button */}
                    <div className="border-2 border-dashed rounded-lg h-20 sm:h-24 flex items-center justify-center transition-all cursor-pointer hover:border-orange-400" style={{ borderColor: BD }}>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileUpload(e.target.files, category)}
                        className="hidden"
                        id={`upload-${category}`}
                      />
                      <label htmlFor={`upload-${category}`} className="cursor-pointer">
                        <Plus size={16} className="sm:w-5 sm:h-5" style={{ color: MU }} />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Videos Grid */}
          {activeTab === 'videos' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {sampleVideos.map((video) => (
                <div key={video.id} className="rounded-lg p-3 sm:p-4" style={{ background: BG, border: `1px solid ${BD}` }}>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={selectedMedia.includes(String(video.id))}
                      onChange={() => handleMediaSelection(String(video.id))}
                      className="absolute top-2 left-2 z-10 rounded w-3 h-3 sm:w-4 sm:h-4"
                      style={{ accentColor: O }}
                    />
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-28 sm:h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
                      <Play size={24} className="sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white px-1.5 py-0.5 rounded text-[9px] sm:text-xs">
                      {video.duration}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="text-[11px] sm:text-sm font-medium" style={{ color: N }}>{video.title}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button className="p-1 rounded transition-colors" style={{ background: `${O}10`, color: O }}>
                        <Play size={10} className="sm:w-3 sm:h-3" />
                      </button>
                      <button className="p-1 rounded transition-colors" style={{ background: `${N}10`, color: N }}>
                        <Download size={10} className="sm:w-3 sm:h-3" />
                      </button>
                      <button className="p-1 rounded transition-colors" style={{ background: `${O}10`, color: O }}>
                        <Edit size={10} className="sm:w-3 sm:h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Virtual Tour */}
          {activeTab === 'virtual_tour' && (
            <div className="rounded-lg p-4 sm:p-6" style={{ background: BG, border: `1px solid ${BD}` }}>
              <h3 className="text-[13px] sm:text-base font-semibold mb-3 sm:mb-4" style={{ color: N }}>Virtual Tour</h3>
              <div className="rounded-lg h-48 sm:h-64 flex items-center justify-center" style={{ background: `${N}05` }}>
                <div className="text-center">
                  <Maximize2 size={32} className="sm:w-12 sm:h-12 mx-auto mb-2" style={{ color: MU }} />
                  <p className="text-[11px] sm:text-sm" style={{ color: MU }}>360° Virtual Tour will be displayed here</p>
                  <button className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-white text-[11px] sm:text-sm transition-all hover:opacity-90" style={{ background: O }}>
                    Create Virtual Tour
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Drone Footage */}
          {activeTab === 'drone' && (
            <div className="rounded-lg p-4 sm:p-6" style={{ background: BG, border: `1px solid ${BD}` }}>
              <h3 className="text-[13px] sm:text-base font-semibold mb-3 sm:mb-4" style={{ color: N }}>Drone Footage</h3>
              <div className="rounded-lg h-48 sm:h-64 flex items-center justify-center" style={{ background: `${N}05` }}>
                <div className="text-center">
                  <Video size={32} className="sm:w-12 sm:h-12 mx-auto mb-2" style={{ color: MU }} />
                  <p className="text-[11px] sm:text-sm" style={{ color: MU }}>Aerial drone footage will be displayed here</p>
                  <button className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-white text-[11px] sm:text-sm transition-all hover:opacity-90" style={{ background: O }}>
                    Schedule Drone Shoot
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 sm:px-6 py-2 sm:py-4 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2" style={{ borderColor: BD, background: BG }}>
          <div className="text-[10px] sm:text-sm" style={{ color: MU }}>
            {selectedMedia.length} item{selectedMedia.length !== 1 ? 's' : ''} selected • Professional photography available
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button onClick={onClose} className="px-2 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-sm border rounded transition-colors hover:bg-gray-50" style={{ borderColor: BD, color: N }}>
              Close
            </button>
            <button onClick={() => alert('Media management saved!')} className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-sm rounded text-white transition-all hover:opacity-90" style={{ background: O }}>
              <Save size={12} className="sm:w-4 sm:h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyMediaModal;