import React from 'react';
import { BarChart3, TrendingUp, Award } from 'lucide-react';

interface MarketInsightsTabProps {
  buyer: any;
}

const MarketInsightsTab: React.FC<MarketInsightsTabProps> = ({ buyer }) => {
  // Safe access to preferred locations with fallback
  const preferredLocations = buyer?.requirements?.preferredLocations || 
                            buyer?.preferred_locations || 
                            buyer?.preferredLocations || 
                            ['Mumbai', 'Pune', 'Bangalore'];

  // Ensure it's an array and take first 3
  const displayLocations = Array.isArray(preferredLocations) 
    ? preferredLocations.slice(0, 3) 
    : ['Mumbai', 'Pune', 'Bangalore'];

  return (
    <div className="p-6 space-y-6 text-xs">
      <h3 className="text-lg font-bold text-gray-900">Market Insights</h3>

      {/* Market Overview for Buyer's Preferred Locations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayLocations.map((location: string, index: number) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">{location}</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Avg. Price/sq ft:</span>
                <span className="font-bold text-green-600">₹{(15000 + index * 2000).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Price Trend:</span>
                <span className="font-bold text-blue-600">+{5 + index}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Demand:</span>
                <span className="font-bold text-purple-600">High</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Price Trends */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Price Trends - Your Preferred Areas</h4>
        <div className="h-56 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="mx-auto text-gray-400 mb-1" size={36} />
            <p className="text-gray-500">Interactive price trend charts will be displayed here</p>
          </div>
        </div>
      </div>

      {/* Investment Recommendations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Investment Recommendations</h4>
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1.5">
              <TrendingUp className="text-green-600" size={14} />
              <span className="font-medium text-green-800">Best Time to Buy</span>
            </div>
            <p className="text-[11px] text-green-700">
              Current market conditions are favorable for buyers in your budget range.
              Interest rates are stable and inventory levels provide good negotiation opportunities.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1.5">
              <Award className="text-blue-600" size={14} />
              <span className="font-medium text-blue-800">Recommended Areas</span>
            </div>
            <p className="text-[11px] text-blue-700">
              Based on your requirements, {displayLocations[0] || 'your preferred areas'} offer the best value proposition
              with strong appreciation potential and excellent connectivity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketInsightsTab;