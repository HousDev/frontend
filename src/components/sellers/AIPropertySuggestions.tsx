import React, { useState, useMemo } from 'react';
import { 
  Bot, 
  Brain, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Star, 
  Award, 
  Zap,
  Building,
  MapPin,
  DollarSign,
  Eye,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Rocket,
  Crown,
  Gem,
  Flame,
  Heart,
  Bookmark,
  Share,
  Phone,
  MessageCircle,
  Mail,
  Download,
  RefreshCw,
  Settings,
  Filter,
  Search,
  BarChart3,
  PieChart,
  LineChart,
  TrendingDown,
  Percent,
  Home,
  Shield,
  Globe,
  Brain as BrainIcon
} from 'lucide-react';

const DEFAULT_SUGGESTIONS = [
  {
    id: 1,
    category: 'pricing',
    type: 'price_optimization',
    title: 'Optimal Pricing Strategy',
    description: 'Your Skyline Towers property is priced 2% above market average. Consider a strategic 3% reduction to attract 40% more inquiries.',
    confidence: 92,
    impact: 'High',
    urgency: 'Medium',
    expectedOutcome: '+40% inquiries, faster sale',
    timeframe: '1-2 weeks',
    reasoning: [
      'Similar properties in Andheri West sold 15% faster with competitive pricing',
      'Current market sentiment favors value-conscious buyers',
      'Your property has premium amenities that justify slight premium'
    ],
    actionItems: [
      'Reduce price from ₹2.5Cr to ₹2.42Cr',
      'Update all portal listings',
      'Notify interested buyers about price adjustment',
      'Monitor inquiry rate for 2 weeks'
    ],
    marketData: {
      averagePrice: 24200000,
      yourPrice: 25000000,
      recommendedPrice: 24200000,
      competitorCount: 8,
      averageDaysOnMarket: 45
    }
  },
  {
    id: 2,
    category: 'marketing',
    type: 'content_enhancement',
    title: 'Professional Photography Impact',
    description: 'Adding professional photos and virtual tour can increase inquiry rate by 65% and reduce time to sale by 30%.',
    confidence: 89,
    impact: 'Very High',
    urgency: 'High',
    expectedOutcome: '+65% inquiries, 30% faster sale',
    timeframe: '3-5 days',
    reasoning: [
      'Properties with professional photos get 3x more views',
      'Virtual tours increase engagement time by 250%',
      'High-quality visuals build buyer confidence'
    ],
    actionItems: [
      'Schedule professional photographer (₹15,000)',
      'Create 360° virtual tour (₹8,000)',
      'Update all listings with new media',
      'Share enhanced listings on social media'
    ],
    costBenefit: {
      investment: 23000,
      expectedReturn: 150000,
      roi: '550%',
      paybackPeriod: '2 weeks'
    }
  },
  {
    id: 3,
    category: 'investment',
    type: 'reinvestment_opportunity',
    title: 'Strategic Reinvestment Opportunity',
    description: 'Based on your sale proceeds, investing in Bandra West 2BHK could yield 18% annual returns with lower maintenance.',
    confidence: 85,
    impact: 'High',
    urgency: 'Low',
    expectedOutcome: '18% annual returns',
    timeframe: '2-3 months',
    reasoning: [
      'Bandra West showing strong appreciation (12% YoY)',
      'Rental yields in the area are 4.2% (above average)',
      'Infrastructure development planned for 2025-26'
    ],
    actionItems: [
      'Research 2BHK properties in Bandra West',
      'Analyze rental potential and tenant demand',
      'Plan tax-efficient reinvestment strategy',
      'Connect with Bandra West property consultants'
    ],
    investmentAnalysis: {
      recommendedBudget: 28000000,
      expectedAppreciation: '12-15% annually',
      rentalYield: '4.2%',
      totalReturns: '16-19% annually'
    }
  },
  {
    id: 4,
    category: 'timing',
    type: 'market_timing',
    title: 'Optimal Sale Timing',
    description: 'Current market conditions are 85% favorable for sellers. Consider accelerating your sale process to capitalize on high demand.',
    confidence: 78,
    impact: 'Medium',
    urgency: 'High',
    expectedOutcome: 'Better price realization',
    timeframe: 'Next 6 weeks',
    reasoning: [
      'Buyer activity increased 25% in January',
      'Interest rates stable for next 3 months',
      'Festival season approaching (higher buyer sentiment)'
    ],
    actionItems: [
      'Increase marketing intensity',
      'Schedule more property visits',
      'Prepare all documentation in advance',
      'Consider limited-time offers for serious buyers'
    ],
    marketIndicators: {
      buyerSentiment: 'Positive',
      inventoryLevels: 'Low',
      priceGrowth: '+8.5% YoY',
      demandSupplyRatio: '1.8:1'
    }
  },
  {
    id: 5,
    category: 'marketing',
    type: 'social_media_boost',
    title: 'Social Media Marketing Strategy',
    description: 'Targeted social media campaigns can reach 50,000+ potential buyers in your price segment with ₹10,000 budget.',
    confidence: 82,
    impact: 'Medium',
    urgency: 'Low',
    expectedOutcome: '+25% brand visibility',
    timeframe: '2-4 weeks',
    reasoning: [
      'Social media generates 35% of property inquiries',
      'Your target demographic is highly active on Instagram/Facebook',
      'Video content performs 5x better than static posts'
    ],
    actionItems: [
      'Create property showcase videos',
      'Run targeted Facebook/Instagram ads',
      'Engage with local real estate groups',
      'Share customer testimonials and success stories'
    ],
    campaignDetails: {
      budget: 10000,
      expectedReach: 50000,
      targetAudience: 'Families, 25-45 years, Mumbai',
      platforms: ['Facebook', 'Instagram', 'YouTube']
    }
  },
  {
    id: 6,
    category: 'pricing',
    type: 'dynamic_pricing',
    title: 'Dynamic Pricing Strategy',
    description: 'Implement time-based pricing adjustments to optimize sale velocity while maximizing returns.',
    confidence: 75,
    impact: 'Medium',
    urgency: 'Low',
    expectedOutcome: 'Optimized price-time balance',
    timeframe: '4-8 weeks',
    reasoning: [
      'Properties with flexible pricing sell 20% faster',
      'Seasonal demand patterns favor gradual adjustments',
      'Buyer psychology responds well to perceived value'
    ],
    actionItems: [
      'Set initial price at market premium',
      'Plan 2% reduction after 30 days if needed',
      'Create urgency with limited-time offers',
      'Monitor competitor pricing weekly'
    ],
    pricingSchedule: [
      { week: '1-4', price: 25000000, strategy: 'Premium positioning' },
      { week: '5-8', price: 24500000, strategy: 'Market alignment' },
      { week: '9-12', price: 24000000, strategy: 'Quick sale focus' }
    ]
  }
];

const suggestionCategories = [
  { id: 'all', label: 'All Suggestions', count: 12 },
  { id: 'pricing', label: 'Pricing', count: 3 },
  { id: 'marketing', label: 'Marketing', count: 4 },
  { id: 'investment', label: 'Investment', count: 2 },
  { id: 'timing', label: 'Timing', count: 3 }
];

const AIPropertySuggestions = ({ seller }: any) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState(70);
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);

  const filteredSuggestions = useMemo(() => {
    return suggestions.filter(suggestion => {
      const matchesCategory = activeCategory === 'all' || suggestion.category === activeCategory;
      const matchesConfidence = suggestion.confidence >= confidenceFilter;
      return matchesCategory && matchesConfidence;
    });
  }, [suggestions, activeCategory, confidenceFilter]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Very High': return 'text-red-600 bg-red-100';
      case 'High': return 'text-orange-600 bg-orange-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'High': return 'text-red-600 bg-red-100';
      case 'Medium': return 'text-orange-600 bg-orange-100';
      case 'Low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (value: number | string | undefined | null) => {
    if (value == null || Number.isNaN(Number(value))) return '—';
    const n = Number(value);
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    return `₹${n.toLocaleString('en-IN')}`;
  };

  const implementSuggestion = (suggestion: any) => {
    console.log('Implementing suggestion:', suggestion);
    // Replace with real implementation hook/analytics call
    alert(`Implementing: ${suggestion.title}\n\nThis will start the process for: ${suggestion.actionItems?.[0] || '—'}`);
  };

  const dismissSuggestion = (suggestionId: number) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const refreshSuggestions = () => {
    // In a real app you'd call the AI service — here we reset to defaults (simulated refresh)
    setSuggestions(DEFAULT_SUGGESTIONS);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
            <Bot className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Property Suggestions</h2>
            <p className="text-gray-600 mt-1">Intelligent recommendations to optimize your property performance</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshSuggestions}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RefreshCw size={16} />
            <span>Refresh Suggestions</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Settings size={16} />
            <span>AI Settings</span>
          </button>
        </div>
      </div>

      {/* AI Performance Summary */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">AI Performance Summary</h3>
            <p className="text-indigo-100">Your AI assistant has analyzed 1,247 data points to generate these recommendations</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">94%</div>
            <div className="text-indigo-100">Accuracy Score</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold">12</div>
            <div className="text-indigo-100 text-sm">Active Suggestions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">8</div>
            <div className="text-indigo-100 text-sm">Implemented</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">₹2.3L</div>
            <div className="text-indigo-100 text-sm">Value Generated</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-1">
              {suggestionCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    activeCategory === category.id
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="font-medium">{category.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeCategory === category.id ? 'bg-purple-200' : 'bg-gray-200'
                  }`}>
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Min Confidence:</span>
              <input
                type="range"
                min="50"
                max="100"
                value={confidenceFilter}
                onChange={(e) => setConfidenceFilter(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm font-medium text-gray-900">{confidenceFilter}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSuggestions.map((suggestion) => (
          <div key={suggestion.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden">
            {/* Suggestion Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                    <Brain className="text-white" size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                      {suggestion.category} • {String(suggestion.type).replace(/_/g, ' ')}
                    </span>
                    <h3 className="font-bold text-gray-900 text-lg mt-1">{suggestion.title}</h3>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    {suggestion.confidence}% confidence
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(suggestion.impact)}`}>
                    {suggestion.impact} impact
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getUrgencyColor(suggestion.urgency)}`}>
                    {suggestion.urgency} urgency
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{suggestion.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-xs text-green-600 uppercase tracking-wider mb-1">Expected Outcome</div>
                  <div className="font-semibold text-green-900">{suggestion.expectedOutcome}</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-xs text-blue-600 uppercase tracking-wider mb-1">Timeframe</div>
                  <div className="font-semibold text-blue-900">{suggestion.timeframe}</div>
                </div>
              </div>
            </div>

            {/* AI Reasoning */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
              <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                <Lightbulb className="mr-2" size={16} />
                AI Reasoning
              </h4>
              <div className="space-y-2">
                {suggestion.reasoning?.map((reason: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <Sparkles className="text-purple-600 mt-0.5 flex-shrink-0" size={12} />
                    <span className="text-sm text-purple-800">{reason}</span>
                  </div>
                )) || <div className="text-sm text-gray-500">No reasoning available</div>}
              </div>
            </div>

            {/* Action Items */}
            <div className="p-6 border-b border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Target className="mr-2" size={16} />
                Recommended Actions
              </h4>
              <div className="space-y-2">
                {suggestion.actionItems?.map((action: string, index: number) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-sm text-gray-700 flex-1">{action}</span>
                  </div>
                )) || <div className="text-sm text-gray-500">No action items</div>}
              </div>
            </div>

            {/* Additional Data */}
            {suggestion.marketData && (
              <div className="p-6 border-b border-gray-100 bg-blue-50">
                <h4 className="font-semibold text-blue-900 mb-3">Market Data</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Market Average:</span>
                    <span className="font-bold">{formatCurrency(suggestion.marketData.averagePrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Your Price:</span>
                    <span className="font-bold">{formatCurrency(suggestion.marketData.yourPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Recommended:</span>
                    <span className="font-bold text-green-600">{formatCurrency(suggestion.marketData.recommendedPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Competitors:</span>
                    <span className="font-bold">{suggestion.marketData.competitorCount}</span>
                  </div>
                </div>
              </div>
            )}

            {suggestion.costBenefit && (
              <div className="p-6 border-b border-gray-100 bg-green-50">
                <h4 className="font-semibold text-green-900 mb-3">Cost-Benefit Analysis</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Investment:</span>
                    <span className="font-bold">{formatCurrency(suggestion.costBenefit.investment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Expected Return:</span>
                    <span className="font-bold">{formatCurrency(suggestion.costBenefit.expectedReturn)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">ROI:</span>
                    <span className="font-bold text-green-600">{suggestion.costBenefit.roi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Payback:</span>
                    <span className="font-bold">{suggestion.costBenefit.paybackPeriod}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="p-6">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => implementSuggestion(suggestion)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
                >
                  Implement Suggestion
                </button>
                <button
                  onClick={() => dismissSuggestion(suggestion.id)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Dismiss
                </button>
                <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                  <Share size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Learning Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
            <BrainIcon className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI Learning & Adaptation</h3>
            <p className="text-gray-600">How our AI improves recommendations based on your actions</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-4 border border-indigo-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">1,247</div>
              <div className="text-sm text-indigo-700">Data Points Analyzed</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-indigo-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">87%</div>
              <div className="text-sm text-green-700">Prediction Accuracy</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-indigo-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">₹2.3L</div>
              <div className="text-sm text-purple-700">Value Generated</div>
            </div>
          </div>
        </div>
      </div>

      {filteredSuggestions.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Bot className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No suggestions available</h3>
          <p className="text-gray-500">Try adjusting your confidence filter or check back later for new recommendations</p>
        </div>
      )}
    </div>
  );
};

export default AIPropertySuggestions;
