import React, { useState } from 'react';
import { Edit } from 'lucide-react';

interface ProfileTabProps {
  buyer: any;
  onUpdateBuyer: (data: any) => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ buyer, onUpdateBuyer }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(buyer);

  const handleSave = () => {
    onUpdateBuyer(profileData);
    setIsEditing(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Profile Settings</h3>
        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs"
        >
          <Edit size={14} />
          <span>{isEditing ? 'Save' : 'Edit'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-3 text-xs">Personal Information</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs"
                readOnly={!isEditing}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs"
                readOnly={!isEditing}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs"
                readOnly={!isEditing}
              />
            </div>
          </div>
        </div>

        {/* Property Requirements */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-3 text-xs">Property Requirements</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Budget Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={profileData.budget.min}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      budget: { ...profileData.budget, min: Number(e.target.value) },
                    })
                  }
                  className="px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs"
                  placeholder="Min"
                  readOnly={!isEditing}
                />
                <input
                  type="number"
                  value={profileData.budget.max}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      budget: { ...profileData.budget, max: Number(e.target.value) },
                    })
                  }
                  className="px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs"
                  placeholder="Max"
                  readOnly={!isEditing}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Unit Type</label>
              <select
                value={profileData.requirements.unitTypes}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    requirements: { ...profileData.requirements, unitTypes: e.target.value },
                  })
                }
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs"
                disabled={!isEditing}
              >
                <option value="1BHK">1BHK</option>
                <option value="2BHK">2BHK</option>
                <option value="3BHK">3BHK</option>
                <option value="4BHK">4BHK</option>
                <option value="Villa">Villa</option>
                <option value="Penthouse">Penthouse</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Furnishing Preference</label>
              <select
                value={profileData.requirements.furnishing}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    requirements: { ...profileData.requirements, furnishing: e.target.value },
                  })
                }
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs"
                disabled={!isEditing}
              >
                <option value="Fully Furnished">Fully Furnished</option>
                <option value="Semi Furnished">Semi Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h4 className="font-semibold text-gray-900 mb-3 text-xs">Notification Preferences</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
              <span className="text-xs text-gray-700">New property matches</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
              <span className="text-xs text-gray-700">Price drop alerts</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
              <span className="text-xs text-gray-700">Visit reminders</span>
            </label>
          </div>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
              <span className="text-xs text-gray-700">Market insights</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
              <span className="text-xs text-gray-700">Promotional offers</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" defaultChecked className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
              <span className="text-xs text-gray-700">Loan updates</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;