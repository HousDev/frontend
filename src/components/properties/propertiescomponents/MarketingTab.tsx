import React from 'react';
import { FileText, Share, Camera, Globe, Eye, MessageCircle, Share2, Download } from 'lucide-react';

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
    <div className="space-y-4">
      {/* Marketing Actions - Compact for Mobile */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
        <h3 className="text-[11px] sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Marketing Tools</h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <button
            onClick={onCreateBrochure}
            className="flex flex-col items-center space-y-1 p-2 sm:p-3 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FileText className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[9px] sm:text-[11px] font-medium text-blue-700 text-center whitespace-nowrap">Create Brochure</span>
          </button>
          <button
            onClick={onShareProperty}
            className="flex flex-col items-center space-y-1 p-2 sm:p-3 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
          >
            <Share className="text-green-600 w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[9px] sm:text-[11px] font-medium text-green-700 text-center whitespace-nowrap">Share Property</span>
          </button>
          <button
            onClick={onManageMedia}
            className="flex flex-col items-center space-y-1 p-2 sm:p-3 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
          >
            <Camera className="text-purple-600 w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[9px] sm:text-[11px] font-medium text-purple-700 text-center whitespace-nowrap">Manage Media</span>
          </button>
          <button
            onClick={onPublishProperty}
            className="flex flex-col items-center space-y-1 p-2 sm:p-3 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
          >
            <Globe className="text-orange-600 w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[9px] sm:text-[11px] font-medium text-orange-700 text-center whitespace-nowrap">Publish Online</span>
          </button>
        </div>
      </div>

      {/* Marketing Performance - Compact Stats Cards */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
        <h3 className="text-[11px] sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Marketing Performance</h3>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2">
          {/* Online Views Card */}
          <div className="rounded-lg p-1.5 sm:p-2.5 transition-all hover:shadow-sm" style={{ background: '#eff6ff', border: '1px solid #3b82f620' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[7px] sm:text-[8px] font-medium uppercase tracking-wider text-blue-600">Views</p>
                <p className="text-sm sm:text-base font-bold mt-0.5 text-gray-900">{property.publicViews || 0}</p>
              </div>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center bg-blue-100">
                <Eye size={10} className="text-blue-600" />
              </div>
            </div>
          </div>

          {/* Inquiries Card */}
          <div className="rounded-lg p-1.5 sm:p-2.5 transition-all hover:shadow-sm" style={{ background: '#f0fdf4', border: '1px solid #22c55e20' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[7px] sm:text-[8px] font-medium uppercase tracking-wider text-green-600">Inquiries</p>
                <p className="text-sm sm:text-base font-bold mt-0.5 text-gray-900">{property.publicInquiries || 0}</p>
              </div>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center bg-green-100">
                <MessageCircle size={10} className="text-green-600" />
              </div>
            </div>
          </div>

          {/* Social Shares Card */}
          <div className="rounded-lg p-1.5 sm:p-2.5 transition-all hover:shadow-sm" style={{ background: '#faf5ff', border: '1px solid #a855f720' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[7px] sm:text-[8px] font-medium uppercase tracking-wider text-purple-600">Shares</p>
                <p className="text-sm sm:text-base font-bold mt-0.5 text-gray-900">{property.socialShares || 0}</p>
              </div>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center bg-purple-100">
                <Share2 size={10} className="text-purple-600" />
              </div>
            </div>
          </div>

          {/* Brochure Downloads Card */}
          <div className="rounded-lg p-1.5 sm:p-2.5 transition-all hover:shadow-sm" style={{ background: '#fff7ed', border: '1px solid #f9731620' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[7px] sm:text-[8px] font-medium uppercase tracking-wider text-orange-600">Downloads</p>
                <p className="text-sm sm:text-base font-bold mt-0.5 text-gray-900">{property.brochureDownloads || 0}</p>
              </div>
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center bg-orange-100">
                <Download size={10} className="text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Published Platforms */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
        <h3 className="text-[11px] sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Published Platforms</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {[
            { name: 'MagicBricks', status: 'published', views: 1250, inquiries: 15 },
            { name: '99acres', status: 'published', views: 980, inquiries: 12 },
            { name: 'Housing.com', status: 'pending', views: 0, inquiries: 0 }
          ].map((platform, index) => (
            <div key={index} className="p-2 sm:p-2.5 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] sm:text-[11px] font-medium text-gray-900">{platform.name}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[7px] sm:text-[8px] font-medium ${
                  platform.status === 'published' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {platform.status}
                </span>
              </div>
              <div className="text-[8px] sm:text-[9px] text-gray-500">
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