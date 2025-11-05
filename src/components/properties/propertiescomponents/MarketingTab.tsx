import React from 'react';
import { FileText, Share, Camera, Globe } from 'lucide-react';

interface MarketingTabProps {
  property: any;
  onCreateBrochure: () => void;
  onShareProperty: () => void;
  onManageMedia: () => void;
  onPublishProperty: () => void;
}

const MarketingTab: React.FC<MarketingTabProps> = ({
  property,
  onCreateBrochure,
  onShareProperty,
  onManageMedia,
  onPublishProperty
}) => {
  return (
    <div className="space-y-6">
      {/* Marketing Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Marketing Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={onCreateBrochure}
            className="flex flex-col items-center space-y-2 p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FileText className="text-blue-600" size={24} />
            <span className="text-sm font-medium text-blue-700">Create Brochure</span>
          </button>
          <button
            onClick={onShareProperty}
            className="flex flex-col items-center space-y-2 p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
          >
            <Share className="text-green-600" size={24} />
            <span className="text-sm font-medium text-green-700">Share Property</span>
          </button>
          <button
            onClick={onManageMedia}
            className="flex flex-col items-center space-y-2 p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
          >
            <Camera className="text-purple-600" size={24} />
            <span className="text-sm font-medium text-purple-700">Manage Media</span>
          </button>
          <button
            onClick={onPublishProperty}
            className="flex flex-col items-center space-y-2 p-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
          >
            <Globe className="text-orange-600" size={24} />
            <span className="text-sm font-medium text-orange-700">Publish Online</span>
          </button>
        </div>
      </div>

      {/* Marketing Performance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Marketing Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{property.publicViews || 0}</div>
            <div className="text-sm text-blue-700">Online Views</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{property.publicInquiries || 0}</div>
            <div className="text-sm text-green-700">Inquiries</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{property.socialShares || 0}</div>
            <div className="text-sm text-purple-700">Social Shares</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{property.brochureDownloads || 0}</div>
            <div className="text-sm text-orange-700">Brochure Downloads</div>
          </div>
        </div>
      </div>

      {/* Published Platforms */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Published Platforms</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'MagicBricks', status: 'published', views: 1250, inquiries: 15 },
            { name: '99acres', status: 'published', views: 980, inquiries: 12 },
            { name: 'Housing.com', status: 'pending', views: 0, inquiries: 0 }
          ].map((platform, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{platform.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${platform.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                  {platform.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Views: {platform.views} • Inquiries: {platform.inquiries}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketingTab;