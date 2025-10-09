import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Target,
  Brain,
  Wand2,
  FileText,
  Image,
  Share,
  CheckCircle,
  Clock,
  TrendingUp,
  Search,
  Tag,
  Eye,
  Calendar,
  BarChart3,
  Zap,
  Globe,
  Crown,
  Star,
  Award,
  Settings,
  RefreshCw,
  Plus,
  X
} from 'lucide-react';

import { toast } from 'react-toastify';
interface AIBlogWriterProps {
  isOpen?: boolean;
  onClose?: () => void;
  onGenerate: (prompt: string, keywords: string[]) => void;
  isGenerating: boolean;
}

const AIBlogWriter: React.FC<AIBlogWriterProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isGenerating
}) => {
  const [prompt, setPrompt] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedLength, setSelectedLength] = useState('medium');
  const [selectedCategory, setSelectedCategory] = useState('Real Estate');
  const [includeImages, setIncludeImages] = useState(true);
  const [includeSEO, setIncludeSEO] = useState(true);
  const [includeTableOfContents, setIncludeTableOfContents] = useState(true);
  const [targetAudience, setTargetAudience] = useState('property-investors');
  const [generatedSuggestions, setGeneratedSuggestions] = useState<string[]>([]);

  const tones = [
    { value: 'professional', label: 'Professional', description: 'Formal and authoritative' },
    { value: 'conversational', label: 'Conversational', description: 'Friendly and approachable' },
    { value: 'expert', label: 'Expert', description: 'Technical and detailed' },
    { value: 'beginner-friendly', label: 'Beginner-Friendly', description: 'Simple and educational' }
  ];

  const lengths = [
    { value: 'short', label: 'Short', description: '300-500 words', time: '2-3 min read' },
    { value: 'medium', label: 'Medium', description: '800-1200 words', time: '4-6 min read' },
    { value: 'long', label: 'Long', description: '1500-2500 words', time: '7-12 min read' },
    { value: 'comprehensive', label: 'Comprehensive', description: '3000+ words', time: '15+ min read' }
  ];

  const categories = [
    'Real Estate', 'Investment', 'Market Analysis', 'Legal', 'Home Buying',
    'Home Selling', 'Property News', 'Construction', 'Finance', 'Legal Updates'
  ];

  const audiences = [
    { value: 'property-investors', label: 'Property Investors', description: 'Looking for investment opportunities' },
    { value: 'first-time-buyers', label: 'First-time Buyers', description: 'New to property buying' },
    { value: 'real-estate-agents', label: 'Real Estate Agents', description: 'Industry professionals' },
    { value: 'property-sellers', label: 'Property Sellers', description: 'Looking to sell properties' },
    { value: 'general-public', label: 'General Public', description: 'Broad audience interest' }
  ];

  const topicSuggestions = [
    'Best Areas for Real Estate Investment in Mumbai 2025',
    'Complete Guide to Home Loan Process in India',
    'How to Calculate Property ROI and Investment Returns',
    'Legal Documents Required for Property Purchase',
    'Real Estate Market Predictions for Next 5 Years',
    'Commercial vs Residential Property Investment',
    'Tax Benefits and Deductions for Property Owners',
    'How to Evaluate Property Before Buying',
    'Real Estate Investment Trusts (REITs) Guide',
    'Property Valuation Methods and Techniques',
    'Understanding RERA and its Impact on Buyers',
    'Rental Property Management Best Practices'
  ];

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const generateAISuggestions = () => {
    const audienceKeywords = {
      'property-investors': ['investment', 'ROI', 'returns', 'portfolio', 'analysis'],
      'first-time-buyers': ['guide', 'beginners', 'process', 'tips', 'checklist'],
      'real-estate-agents': ['market', 'leads', 'sales', 'clients', 'strategies'],
      'property-sellers': ['selling', 'valuation', 'marketing', 'pricing', 'documents'],
      'general-public': ['trends', 'news', 'market', 'overview', 'updates']
    };

    const suggestions = topicSuggestions
      .filter(suggestion => {
        const relevantKeywords = audienceKeywords[targetAudience as keyof typeof audienceKeywords] || [];
        return relevantKeywords.some(keyword =>
          suggestion.toLowerCase().includes(keyword.toLowerCase())
        );
      })
      .slice(0, 4);

    setGeneratedSuggestions(suggestions);
  };

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error('Please enter a topic or title');
      return;
    }

    // Add automatic keywords based on category and audience
    const autoKeywords = [
      selectedCategory.toLowerCase(),
      targetAudience.replace('-', ' '),
      '2025',
      'mumbai',
      'india'
    ];

    const finalKeywords = [...new Set([...keywords, ...autoKeywords])];
    onGenerate(prompt, finalKeywords);
  };

  React.useEffect(() => {
    generateAISuggestions();
  }, [targetAudience]);

  if (isOpen !== undefined && !isOpen) return null;

  return (
    <div className={isOpen !== undefined ? 'space-y-6' : 'bg-white rounded-xl shadow-sm border border-gray-200 p-6'}>
      {isOpen !== undefined && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">AI Blog Writer</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
      )}

      {!isOpen && (
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bot className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Blog Writer</h2>
          <p className="text-gray-600">Generate high-quality, SEO-optimized blog content with AI</p>
        </div>
      )}

      {/* Topic Input */}
      <div className="bg-gray-50 rounded-xl p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Blog Topic or Title *
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Enter your blog topic or specific title you want to write about..."
          />
        </div>

        {/* Topic Suggestions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">AI Topic Suggestions</h3>
            <button
              onClick={generateAISuggestions}
              className="text-sm text-purple-600 hover:text-purple-700 flex items-center space-x-1"
            >
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {generatedSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setPrompt(suggestion)}
                className="p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all text-left"
              >
                <div className="flex items-start space-x-2">
                  <Sparkles className="text-purple-600 mt-1" size={14} />
                  <span className="text-sm text-gray-700">{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Configuration Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Target Audience</label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {audiences.map((audience) => (
                <option key={audience.value} value={audience.value}>
                  {audience.label} - {audience.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Writing Tone</label>
            <div className="grid grid-cols-1 gap-3">
              {tones.map((tone) => (
                <label key={tone.value} className="flex items-center">
                  <input
                    type="radio"
                    name="tone"
                    value={tone.value}
                    checked={selectedTone === tone.value}
                    onChange={(e) => setSelectedTone(e.target.value)}
                    className="text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <span className="font-medium text-gray-900">{tone.label}</span>
                    <span className="block text-sm text-gray-600">{tone.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Content Length</label>
            <div className="grid grid-cols-1 gap-3">
              {lengths.map((length) => (
                <label key={length.value} className="flex items-center">
                  <input
                    type="radio"
                    name="length"
                    value={length.value}
                    checked={selectedLength === length.value}
                    onChange={(e) => setSelectedLength(e.target.value)}
                    className="text-purple-600 focus:ring-purple-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <span className="font-medium text-gray-900">{length.label}</span>
                    <span className="block text-sm text-gray-600">{length.description} • {length.time}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Keywords & Tags
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                placeholder="Add keyword..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={addKeyword}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            {keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center space-x-1"
                  >
                    <span>{keyword}</span>
                    <button
                      onClick={() => removeKeyword(keyword)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Options */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Settings className="text-blue-600" size={20} />
          <span>Advanced AI Options</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeTableOfContents}
              onChange={(e) => setIncludeTableOfContents(e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <div className="ml-3">
              <span className="font-medium text-gray-900">Table of Contents</span>
              <span className="block text-sm text-gray-600">Auto-generate navigation</span>
            </div>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeImages}
              onChange={(e) => setIncludeImages(e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <div className="ml-3">
              <span className="font-medium text-gray-900">Auto Images</span>
              <span className="block text-sm text-gray-600">AI-selected relevant images</span>
            </div>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeSEO}
              onChange={(e) => setIncludeSEO(e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <div className="ml-3">
              <span className="font-medium text-gray-900">SEO Optimization</span>
              <span className="block text-sm text-gray-600">Meta tags and descriptions</span>
            </div>
          </label>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Brain className="text-green-600" size={20} />
          <span>AI Content Insights</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="text-green-600" size={18} />
              <span className="font-medium text-gray-900">Trending Topics</span>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Property investment strategies</li>
              <li>• Mumbai market analysis</li>
              <li>• Home loan updates</li>
              <li>• RERA compliance guide</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Search className="text-blue-600" size={18} />
              <span className="font-medium text-gray-900">High-Ranking Keywords</span>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• "real estate investment"</li>
              <li>• "property market trends"</li>
              <li>• "home buying guide"</li>
              <li>• "Mumbai properties"</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="text-purple-600" size={18} />
              <span className="font-medium text-gray-900">Content Performance</span>
            </div>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Investment content: +15% engagement</li>
              <li>• Market analysis: +22% shares</li>
              <li>• Guide format: +30% time on page</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Generation Status */}
      {isGenerating && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span className="font-semibold text-purple-900">AI is generating your blog post...</span>
          </div>
          <div className="space-y-2 text-sm text-purple-800">
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-600" size={14} />
              <span>Analyzing topic and keywords</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="text-yellow-600 animate-pulse" size={14} />
              <span>Generating SEO-optimized content</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="text-gray-400" size={14} />
              <span>Creating table of contents</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="text-gray-400" size={14} />
              <span>Optimizing for search rankings</span>
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <div className="text-center">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 mx-auto"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Generating with AI...</span>
            </>
          ) : (
            <>
              <Wand2 size={20} />
              <span>Generate AI Blog Post</span>
              <Sparkles size={16} />
            </>
          )}
        </button>

        <p className="text-sm text-gray-600 mt-3">
          AI will create SEO-optimized content with table of contents, proper formatting, and relevant images
        </p>
      </div>

      {/* Preview Features */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Content Will Include:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-600" size={16} />
              <span className="text-sm text-gray-700">Professional formatting with headings</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-600" size={16} />
              <span className="text-sm text-gray-700">Table of contents with anchor links</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-600" size={16} />
              <span className="text-sm text-gray-700">Bold text for key points</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-600" size={16} />
              <span className="text-sm text-gray-700">SEO-optimized meta tags</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-600" size={16} />
              <span className="text-sm text-gray-700">Relevant high-quality images</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-600" size={16} />
              <span className="text-sm text-gray-700">Keyword optimization for ranking</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-600" size={16} />
              <span className="text-sm text-gray-700">Ready for social media sharing</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-600" size={16} />
              <span className="text-sm text-gray-700">Plagiarism-free original content</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBlogWriter;  