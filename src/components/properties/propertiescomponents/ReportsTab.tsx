import React from 'react';
import { BarChart3 } from 'lucide-react';

interface ReportsTabProps {
  property: any;
}

const ReportsTab: React.FC<ReportsTabProps> = ({ property }) => {
  const views = property.publicViews || 0;
  const visits = property.visits || 0;
  const conversion = views ? ((visits / views) * 100).toFixed(1) : '0.0';

  const safeDaysOnMarket = (createdAt?: string) => {
    if (!createdAt) return 0;
    const created = new Date(createdAt).getTime();
    if (Number.isNaN(created)) return 0;
    return Math.floor((Date.now() - created) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Engagement Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Views:</span>
                <span className="font-medium">{views}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Inquiries:</span>
                <span className="font-medium">{property.publicInquiries || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Site Visits:</span>
                <span className="font-medium">{visits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Conversion Rate:</span>
                <span className="font-medium">{conversion}%</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Market Position</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Price/sq ft:</span>
                <span className="font-medium">
                  ₹{Math.round((Number(property.budget) || 0) / (Number(property.carpetArea) || 1)).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Market Average:</span>
                <span className="font-medium">₹18,500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Price Variance:</span>
                <span className="font-medium text-green-600">+5.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Days on Market:</span>
                <span className="font-medium">{safeDaysOnMarket(property.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Insights */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Insights</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="mx-auto text-gray-400 mb-2" size={48} />
            <p className="text-gray-500">Market analysis charts will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsTab;