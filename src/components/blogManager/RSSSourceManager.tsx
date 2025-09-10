import React, { useState } from 'react';
import { 
  Plus, 
  Globe, 
  RefreshCw, 
  Settings, 
  Check, 
  X,
  Trash2,
  Edit,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Bot,
  Zap,
  Shield,
  Eye,
  Calendar
} from 'lucide-react';
import { RSSSource } from '../../types/blog';
import RSSSourceCard from './RSSSourceCard';
import toast from 'react-hot-toast';

interface RSSSourceManagerProps {
  sources: RSSSource[];
  isOpen?: boolean;
  onClose?: () => void;
  onUpdate: (sources: RSSSource[]) => void;
  onSync: () => void;
  autoApprove: boolean;
}

const RSSSourceManager: React.FC<RSSSourceManagerProps> = ({ 
  sources, 
  isOpen, 
  onClose, 
  onUpdate, 
  onSync, 
  autoApprove 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSource, setEditingSource] = useState<RSSSource | null>(null);
  const [syncingSourceId, setSyncingSourceId] = useState<string | null>(null);
  const [newSource, setNewSource] = useState<Partial<RSSSource>>({
    name: '',
    url: '',
    category: 'Real Estate',
    active: true,
    autoPublish: false,
    syncFrequency: 'daily',
    contentFilter: 'keywords',
    keywords: []
  });

  const predefinedSources = [
    {
      name: 'Economic Times Real Estate',
      url: 'https://economictimes.indiatimes.com/rssfeeds/wealth/real-estate.cms',
      category: 'Market Analysis',
      description: 'Leading business news on real estate market'
    },
    {
      name: 'Housing.com News',
      url: 'https://housing.com/news/feed/',
      category: 'Property News',
      description: 'Latest property news and updates'
    },
    {
      name: 'MoneyControl Real Estate',
      url: 'https://www.moneycontrol.com/rss/realestate.xml',
      category: 'Investment',
      description: 'Investment focused real estate content'
    },
    {
      name: 'PropTiger Blog',
      url: 'https://www.proptiger.com/blog/feed/',
      category: 'Property News',
      description: 'Property insights and market trends'
    },
    {
      name: 'Magicbricks Blog',
      url: 'https://www.magicbricks.com/blog/feed/',
      category: 'Home Buying',
      description: 'Home buying and selling guides'
    },
    {
      name: 'Square Yards News',
      url: 'https://www.squareyards.com/news/feed/',
      category: 'Market Analysis',
      description: 'Real estate market analysis and trends'
    }
  ];

  const categories = [
    'Real Estate', 'Investment', 'Market Analysis', 'Legal', 'Home Buying', 
    'Home Selling', 'Property News', 'Construction', 'Finance'
  ];

  const handleAddSource = (predefined?: any) => {
    let sourceData = newSource;
    
    if (predefined) {
      sourceData = {
        ...predefined,
        active: true,
        autoPublish: autoApprove,
        syncFrequency: 'daily',
        contentFilter: 'keywords',
        keywords: ['real estate', 'property', 'investment']
      };
    }

    if (!sourceData.name || !sourceData.url) {
      toast.error('Name and URL are required');
      return;
    }

    const newRSSSource: RSSSource = {
      id: `RSS${Date.now()}`,
      ...sourceData,
      lastSync: new Date().toISOString(),
      totalPosts: 0,
      newPosts: 0
    } as RSSSource;

    onUpdate([...sources, newRSSSource]);
    setNewSource({
      name: '',
      url: '',
      category: 'Real Estate',
      active: true,
      autoPublish: false,
      syncFrequency: 'daily',
      contentFilter: 'keywords',
      keywords: []
    });
    setShowAddForm(false);
    toast.success('RSS source added successfully!');
  };

  const handleToggleSource = (sourceId: string) => {
    onUpdate(sources.map(source =>
      source.id === sourceId 
        ? { ...source, active: !source.active }
        : source
    ));
    toast.success('Source status updated');
  };

  const handleEditSource = (source: RSSSource) => {
    setEditingSource(source);
    setNewSource(source);
    setShowAddForm(true);
  };

  const handleUpdateSource = () => {
    if (!editingSource) return;

    onUpdate(sources.map(source =>
      source.id === editingSource.id 
        ? { ...source, ...newSource }
        : source
    ));
    setEditingSource(null);
    setNewSource({
      name: '',
      url: '',
      category: 'Real Estate',
      active: true,
      autoPublish: false,
      syncFrequency: 'daily',
      contentFilter: 'keywords',
      keywords: []
    });
    setShowAddForm(false);
    toast.success('Source updated successfully!');
  };

  const handleDeleteSource = (sourceId: string) => {
    if (window.confirm('Are you sure you want to delete this RSS source?')) {
      onUpdate(sources.filter(source => source.id !== sourceId));
      toast.success('Source deleted successfully');
    }
  };

  const handleSyncSingle = async (sourceId: string) => {
    setSyncingSourceId(sourceId);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update source stats
      onUpdate(sources.map(source =>
        source.id === sourceId 
          ? { 
              ...source, 
              lastSync: new Date().toISOString(),
              newPosts: Math.floor(Math.random() * 3) + 1,
              totalPosts: source.totalPosts + Math.floor(Math.random() * 3) + 1
            }
          : source
      ));
      
      toast.success('Source synced successfully!');
    } catch (error) {
      toast.error('Failed to sync source');
    } finally {
      setSyncingSourceId(null);
    }
  };

  if (isOpen !== undefined && !isOpen) return null;

  const renderContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">RSS Source Management</h2>
            <p className="text-gray-600">Manage and monitor RSS feeds for automatic blog content</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>Add Source</span>
            </button>
            <button
              onClick={onSync}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <RefreshCw size={18} />
              <span>Sync All</span>
            </button>
          </div>
        </div>

        {/* RSS Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Globe className="text-blue-600" size={20} />
              <div>
                <div className="text-xl font-bold text-blue-600">{sources.length}</div>
                <div className="text-sm text-blue-700">Total Sources</div>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-600" size={20} />
              <div>
                <div className="text-xl font-bold text-green-600">{sources.filter(s => s.active).length}</div>
                <div className="text-sm text-green-700">Active Sources</div>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="text-purple-600" size={20} />
              <div>
                <div className="text-xl font-bold text-purple-600">
                  {sources.reduce((acc, s) => acc + s.totalPosts, 0)}
                </div>
                <div className="text-sm text-purple-700">Total Posts</div>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Bot className="text-orange-600" size={20} />
              <div>
                <div className="text-xl font-bold text-orange-600">
                  {sources.reduce((acc, s) => acc + s.newPosts, 0)}
                </div>
                <div className="text-sm text-orange-700">Pending Import</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {editingSource ? 'Edit RSS Source' : 'Add New RSS Source'}
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingSource(null);
                setNewSource({
                  name: '',
                  url: '',
                  category: 'Real Estate',
                  active: true,
                  autoPublish: false,
                  syncFrequency: 'daily',
                  contentFilter: 'keywords',
                  keywords: []
                });
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* Predefined Sources */}
          {!editingSource && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Quick Add Popular Sources</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {predefinedSources.map((source, index) => (
                  <button
                    key={index}
                    onClick={() => handleAddSource(source)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Globe className="text-blue-600" size={16} />
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">{source.name}</h5>
                        <p className="text-sm text-gray-600 mb-1">{source.description}</p>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {source.category}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or add custom source</span>
                </div>
              </div>
            </div>
          )}

          {/* Custom Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source Name *</label>
              <input
                type="text"
                value={newSource.name}
                onChange={(e) => setNewSource(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Economic Times Real Estate"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">RSS Feed URL *</label>
              <input
                type="url"
                value={newSource.url}
                onChange={(e) => setNewSource(prev => ({ ...prev, url: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/rss"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                value={newSource.category}
                onChange={(e) => setNewSource(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sync Frequency</label>
              <select
                value={newSource.syncFrequency}
                onChange={(e) => setNewSource(prev => ({ ...prev, syncFrequency: e.target.value as any }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="hourly">Every Hour</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="manual">Manual Only</option>
              </select>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Keywords (for filtering)
              </label>
              <input
                type="text"
                placeholder="real estate, property, investment (comma separated)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setNewSource(prev => ({ 
                  ...prev, 
                  keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                }))}
              />
              <p className="text-xs text-gray-500 mt-1">
                Only content containing these keywords will be imported
              </p>
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newSource.active}
                  onChange={(e) => setNewSource(prev => ({ ...prev, active: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newSource.autoPublish}
                  onChange={(e) => setNewSource(prev => ({ ...prev, autoPublish: e.target.checked }))}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Auto Publish</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingSource(null);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={editingSource ? handleUpdateSource : () => handleAddSource()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingSource ? 'Update Source' : 'Add Source'}
            </button>
          </div>
        </div>
      )}

      {/* RSS Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sources.map((source) => (
          <RSSSourceCard
            key={source.id}
            source={source}
            isLoading={syncingSourceId === source.id}
            onSync={() => handleSyncSingle(source.id)}
            onToggle={() => handleToggleSource(source.id)}
            onEdit={() => handleEditSource(source)}
            onDelete={() => handleDeleteSource(source.id)}
          />
        ))}
      </div>

      {sources.length === 0 && (
        <div className="text-center py-12">
          <Globe className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No RSS Sources Found</h3>
          <p className="text-gray-600 mb-6">Add RSS sources to automatically generate blog content</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Source
          </button>
        </div>
      )}

      {/* Advanced RSS Features */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Bot className="text-purple-600" size={20} />
          <span>Advanced RSS Features</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="text-blue-600" size={18} />
              <span className="font-medium text-gray-900">Plagiarism Check</span>
            </div>
            <p className="text-sm text-gray-600">
              AI automatically checks and rewrites content to ensure 95%+ originality score
            </p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="text-green-600" size={18} />
              <span className="font-medium text-gray-900">Smart Formatting</span>
            </div>
            <p className="text-sm text-gray-600">
              Auto-generates table of contents, proper headings, and professional formatting
            </p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="text-purple-600" size={18} />
              <span className="font-medium text-gray-900">SEO Optimization</span>
            </div>
            <p className="text-sm text-gray-600">
              Automatically optimizes content for search engines with meta tags and keywords
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return isOpen !== undefined ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">RSS Source Management</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  ) : renderContent();
};

export default RSSSourceManager;