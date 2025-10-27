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
  Plus
} from 'lucide-react';

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
  photos?: string[]; // array of photo URLs
  videos?: MediaVideo[]; // structured video objects
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
    { id: 'drone', label: 'Drone Footage', icon: Video }
  ] as const;

  const photoCategories = [
    'Exterior', 'Living Room', 'Bedrooms', 'Kitchen', 'Bathrooms', 'Balcony', 'Amenities', 'Parking'
  ];

  // sample/static data (you likely will load real media)
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
      // Simulate upload of each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress(progress);
          // small delay to animate
          // eslint-disable-next-line no-await-in-loop
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
          // photo
          const updated: PropertyShape = {
            ...property,
            photos: [...(property.photos || []), objectUrl],
          };
          onUpdate(updated);
        }
      }

      // Finalize
      window.alert('Media uploaded successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      window.alert('Upload failed');
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
      window.alert('Please select media to delete');
      return;
    }

    // confirm
    if (!window.confirm(`Delete ${selectedMedia.length} selected items?`)) return;

    // Remove selected from photos and videos (IDs are compared as strings)
    const remainingPhotos = (property.photos || []).filter((pUrl: string, idx: number) => {
      // some samplePhotos use numeric ids; your real photos likely use URLs - selection uses strings.
      return !selectedMedia.includes(`photo-${idx}`) && !selectedMedia.includes(pUrl);
    });

    const remainingVideos = (property.videos || []).filter((v: MediaVideo) => !selectedMedia.includes(String(v.id)) && !selectedMedia.includes(v.url));

    const updated: PropertyShape = {
      ...property,
      photos: remainingPhotos,
      videos: remainingVideos
    };

    onUpdate(updated);
    setSelectedMedia([]);
    window.alert('Selected media deleted successfully!');
  };

  const schedulePhotoshoot = () => {
    const photoshootData = {
      type: 'professional_photoshoot',
      scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      photographer: 'Professional Photographer',
      requirements: ['Exterior shots', 'Interior rooms', 'Amenities', 'Drone footage'],
      estimatedDuration: '4 hours',
      cost: 15000
    };

 
    window.alert('Professional photoshoot scheduled! Photographer will contact you within 24 hours.');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Property Media Management</h2>
              <p className="text-gray-600 mt-1">{property?.title} - Photos, Videos & Virtual Tours</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {/* Upload Area */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upload {tabs.find(t => t.id === activeTab)?.label}</h3>
              <div className="flex items-center space-x-3">
                {selectedMedia.length > 0 && (
                  <button
                    onClick={deleteSelectedMedia}
                    className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                    <span>Delete Selected ({selectedMedia.length})</span>
                  </button>
                )}
                <button
                  onClick={schedulePhotoshoot}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Camera size={16} />
                  <span>Schedule Professional Shoot</span>
                </button>
              </div>
            </div>

            {/* Upload Zone */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
              <input
                type="file"
                multiple
                accept={activeTab === 'videos' ? 'video/*' : 'image/*'}
                onChange={(e) => handleFileUpload(e.target.files, 'general')}
                className="hidden"
                id="media-upload"
              />
              <label htmlFor="media-upload" className="cursor-pointer">
                <div className="space-y-2">
                  {activeTab === 'videos' ? (
                    <Video className="mx-auto text-gray-400" size={32} />
                  ) : (
                    <Camera className="mx-auto text-gray-400" size={32} />
                  )}
                  <div>
                    <p className="text-gray-600">
                      Drop {activeTab === 'videos' ? 'videos' : 'photos'} here or click to browse
                    </p>
                    <p className="text-sm text-gray-500">
                      {activeTab === 'videos' ? 'MP4, MOV, AVI up to 100MB' : 'JPG, PNG up to 10MB each'}
                    </p>
                  </div>
                </div>
              </label>

              {isUploading && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Uploading... {uploadProgress}%</p>
                </div>
              )}
            </div>
          </div>

          {/* Media Grid */}
          {activeTab === 'photos' && (
            <div className="space-y-4">
              {photoCategories.map((category) => (
                <div key={category} className="bg-white border border-gray-200 rounded-xl p-4">
                  <h4 className="font-medium text-gray-900 mb-3">{category}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {samplePhotos
                      .filter(photo => photo.category === category)
                      .map((photo) => (
                        <div key={photo.id} className="relative group">
                          <input
                            type="checkbox"
                            checked={selectedMedia.includes(String(photo.id))}
                            onChange={() => handleMediaSelection(String(photo.id))}
                            className="absolute top-2 left-2 z-10 rounded border-gray-300 text-purple-600"
                          />
                          <img
                            src={photo.url}
                            alt={photo.title}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                              <button className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100">
                                <Eye size={16} />
                              </button>
                              <button className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100">
                                <Edit size={16} />
                              </button>
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-gray-600 text-center">{photo.title}</div>
                        </div>
                      ))}

                    {/* Add Photo Button */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg h-24 flex items-center justify-center hover:border-purple-400 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileUpload(e.target.files, category)}
                        className="hidden"
                        id={`upload-${category}`}
                      />
                      <label htmlFor={`upload-${category}`} className="cursor-pointer">
                        <Plus className="text-gray-400" size={20} />
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sampleVideos.map((video) => (
                  <div key={video.id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={selectedMedia.includes(String(video.id))}
                        onChange={() => handleMediaSelection(String(video.id))}
                        className="absolute top-2 left-2 z-10 rounded border-gray-300 text-purple-600"
                      />
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
                        <Play className="text-white" size={32} />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                        {video.duration}
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="font-medium text-gray-900">{video.title}</div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex space-x-2">
                          <button className="p-1 bg-blue-100 text-blue-600 rounded">
                            <Play size={12} />
                          </button>
                          <button className="p-1 bg-green-100 text-green-600 rounded">
                            <Download size={12} />
                          </button>
                          <button className="p-1 bg-purple-100 text-purple-600 rounded">
                            <Edit size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'virtual_tour' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Virtual Tour</h3>
                <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center">
                    <Maximize2 className="mx-auto text-gray-400 mb-2" size={48} />
                    <p className="text-gray-500">360° Virtual Tour will be displayed here</p>
                    <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      Create Virtual Tour
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'drone' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Drone Footage</h3>
                <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center">
                    <Video className="mx-auto text-gray-400 mb-2" size={48} />
                    <p className="text-gray-500">Aerial drone footage will be displayed here</p>
                    <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Schedule Drone Shoot
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {selectedMedia.length} items selected • Professional photography available
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => window.alert('Media management saved!')}
                className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Save size={16} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyMediaModal;
