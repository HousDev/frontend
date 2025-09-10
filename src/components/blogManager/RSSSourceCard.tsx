import React from 'react';
import { 
  RefreshCw, 
  Check, 
  X, 
  Trash2, 
  Edit, 
  Globe, 
  Clock,
  Zap,
  AlertCircle,
  TrendingUp,
  Eye,
  Calendar
} from 'lucide-react';
import { RSSSource } from '../../types/blog';

interface RSSSourceCardProps {
  source: RSSSource;
  isLoading?: boolean;
  onSync: (sourceId: string) => void;
  onToggle: (sourceId: string) => void;
  onEdit: (source: RSSSource) => void;
  onDelete: (sourceId: string) => void;
}

const RSSSourceCard: React.FC<RSSSourceCardProps> = ({ 
  source, 
  isLoading = false,
  onSync, 
  onToggle, 
  onEdit, 
  onDelete 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSyncStatus = () => {
    const lastSync = new Date(source.lastSync);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < 1) return { color: 'green', text: 'Recently synced' };
    if (hoursDiff < 24) return { color: 'yellow', text: `${Math.floor(hoursDiff)}h ago` };
    return { color: 'red', text: `${Math.floor(hoursDiff / 24)}d ago` };
  };

  const status = getSyncStatus();

  return (
    <div className={`border-2 rounded-xl p-6 transition-all hover:shadow-lg ${
      source.active 
        ? 'border-green-200 bg-green-50' 
        : 'border-gray-200 bg-gray-50'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`w-3 h-3 rounded-full ${
              source.active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`} />
            <h3 className="text-lg font-bold text-gray-900">{source.name}</h3>
            {source.autoPublish && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                <Zap size={10} />
                <span>Auto</span>
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <Globe size={14} />
            <span className="truncate max-w-xs">{source.url}</span>
          </div>
          
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
            {source.category}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onSync(source.id)}
            disabled={isLoading}
            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Sync Now"
          >
            <RefreshCw className={`${isLoading ? 'animate-spin' : ''}`} size={16} />
          </button>
          
          <button
            onClick={() => onToggle(source.id)}
            className={`p-2 rounded-lg transition-colors ${
              source.active 
                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={source.active ? 'Deactivate' : 'Activate'}
          >
            {source.active ? <Check size={16} /> : <X size={16} />}
          </button>
          
          <button
            onClick={() => onEdit(source)}
            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            title="Edit"
          >
            <Edit size={16} />
          </button>
          
          <button
            onClick={() => onDelete(source.id)}
            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-blue-600">{source.totalPosts}</div>
          <div className="text-xs text-gray-600">Total Posts</div>
        </div>
        
        <div className="bg-white rounded-lg p-3 text-center">
          <div className={`text-lg font-bold ${source.newPosts > 0 ? 'text-green-600' : 'text-gray-500'}`}>
            {source.newPosts}
          </div>
          <div className="text-xs text-gray-600">New Posts</div>
        </div>
        
        <div className="bg-white rounded-lg p-3 text-center">
          <div className={`text-xs font-medium text-${status.color}-600`}>
            {status.text}
          </div>
          <div className="text-xs text-gray-600">Sync Status</div>
        </div>
        
        <div className="bg-white rounded-lg p-3 text-center">
          <div className="flex items-center justify-center space-x-1">
            <Clock size={12} className="text-gray-500" />
            <span className="text-xs text-gray-600">
              {formatDate(source.lastSync)}
            </span>
          </div>
          <div className="text-xs text-gray-500">Last Sync</div>
        </div>
      </div>

      {/* Notifications */}
      {source.newPosts > 0 && (
        <div className="bg-green-100 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
          <TrendingUp className="text-green-600" size={16} />
          <span className="text-green-800 text-sm">
            {source.newPosts} new articles ready to import
          </span>
          <button
            onClick={() => onSync(source.id)}
            className="ml-auto text-green-600 hover:text-green-700 font-medium text-sm"
          >
            Import Now
          </button>
        </div>
      )}

      {!source.active && (
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 flex items-center space-x-2">
          <AlertCircle className="text-gray-500" size={16} />
          <span className="text-gray-600 text-sm">Source is inactive - no automatic syncing</span>
        </div>
      )}
    </div>
  );
};

export default RSSSourceCard;