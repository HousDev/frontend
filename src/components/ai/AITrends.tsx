import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, MapPin, BarChart3, Target, Brain, Zap, Calendar, DollarSign, Home, Activity } from 'lucide-react';

const AITrends = () => {
  const [selectedLocation, setSelectedLocation] = useState('Andheri West');
  const [timeframe, setTimeframe] = useState('6M');

  // Sample AI-generated data
  const trendData = {
    'Andheri West': {
      currentPrice: 18500,
      priceChange: 12.5,
      prediction: 15.8,
      demandScore: 8.2,
      supplyScore: 6.8,
      roi: 14.2,
      factors: [
        { name: 'Metro Connectivity', impact: '+8.5%', positive: true },
        { name: 'New IT Parks', impact: '+5.2%', positive: true },
        { name: 'Infrastructure Growth', impact: '+3.8%', positive: true },
        { name: 'Supply Increase', impact: '-2.1%', positive: false }
      ]
    },
    'Bandra West': {
      currentPrice: 22300,
      priceChange: 8.7,
      prediction: 11.2,
      demandScore: 9.1,
      supplyScore: 5.2,
      roi: 16.8,
      factors: [
        { name: 'Premium Location', impact: '+6.8%', positive: true },
        { name: 'Sea Facing Premium', impact: '+4.5%', positive: true },
        { name: 'Limited Supply', impact: '+2.9%', positive: true },
        { name: 'High Base Price', impact: '-1.5%', positive: false }
      ]
    }
  };

  const locations = ['Andheri West', 'Bandra West', 'Juhu', 'Powai', 'Worli'];
  const timeframes = ['3M', '6M', '1Y', '2Y'];

  const currentData = trendData[selectedLocation as keyof typeof trendData] || trendData['Andheri West'];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <Brain className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI Market Insights</h3>
            <p className="text-sm text-gray-600">Powered by machine learning algorithms</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
          >
            {locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
          <div className="flex space-x-1">
            {timeframes.map(period => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  timeframe === period
                    ? 'bg-purple-100 text-purple-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="text-blue-600" size={20} />
            <span className="text-sm font-medium text-gray-700">Current Average Price</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            ₹{currentData.currentPrice.toLocaleString()}/sq ft
          </div>
          <div className={`flex items-center text-sm ${
            currentData.priceChange > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {currentData.priceChange > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="ml-1">
              {Math.abs(currentData.priceChange)}% vs last {timeframe}
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="text-green-600" size={20} />
            <span className="text-sm font-medium text-gray-700">AI Prediction</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            +{currentData.prediction}%
          </div>
          <div className="text-sm text-gray-600">
            Expected growth in next 12 months
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="text-purple-600" size={20} />
            <span className="text-sm font-medium text-gray-700">Investment Score</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {currentData.roi}%
          </div>
          <div className="text-sm text-gray-600">
            Projected annual ROI
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Demand vs Supply</h4>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Demand Score</span>
                <span className="text-sm font-semibold text-green-600">
                  {currentData.demandScore}/10
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${(currentData.demandScore / 10) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Supply Score</span>
                <span className="text-sm font-semibold text-orange-600">
                  {currentData.supplyScore}/10
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-orange-500 to-red-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${(currentData.supplyScore / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Price Factors</h4>
          <div className="space-y-3">
            {currentData.factors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">{factor.name}</span>
                <span className={`text-sm font-semibold ${
                  factor.positive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {factor.impact}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
        <div className="flex items-start space-x-3">
          <Zap className="text-purple-600 mt-1" size={20} />
          <div>
            <h5 className="font-semibold text-gray-900 mb-1">AI Recommendation</h5>
            <p className="text-sm text-gray-700">
              Based on current market analysis, {selectedLocation} shows strong growth potential 
              with high demand and moderate supply. The area is experiencing significant infrastructure 
              development which is likely to drive prices up by {currentData.prediction}% in the next year.
              {currentData.roi > 15 ? ' This location offers excellent investment opportunities.' : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITrends;