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
} from 'lucide-react';
import { RSSSource } from '../../types/blog';

/** UI-only shape added on top of the base model */
type SourceView = RSSSource & {
  active?: boolean | 0 | 1;
  autoPublish?: boolean | 0 | 1;
  totalPosts?: number;
  newPosts?: number;
  lastSync?: string | null;
};

interface RSSSourceCardProps {
  source: SourceView;
  isLoading?: boolean;
  onSync: (sourceId: RSSSource['id']) => void;
  onToggle: (sourceId: RSSSource['id']) => void;
  onEdit: (source: RSSSource) => void;
  onDelete: (sourceId: RSSSource['id']) => void;
}

// ---- helpers ----
function safeParseDate(iso?: string | null): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

function formatDate(iso?: string | null) {
  const d = safeParseDate(iso);
  if (!d) return 'Never';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getSyncStatus(lastSync?: string | null): {
  color: 'green' | 'yellow' | 'red' | 'gray';
  text: string;
} {
  const d = safeParseDate(lastSync);
  if (!d) return { color: 'gray', text: 'Not synced' };

  const diffMs = Date.now() - d.getTime();
  if (diffMs < 0) return { color: 'green', text: 'just now' };

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return { color: 'green', text: 'Recently synced' };
  if (hours < 24) return { color: 'yellow', text: `${hours}h ago` };

  const days = Math.floor(hours / 24);
  return { color: 'red', text: `${days}d ago` };
}

const colorClassMap = {
  green: 'text-green-600',
  yellow: 'text-yellow-600',
  red: 'text-red-600',
  gray: 'text-gray-500',
} as const;

const toBool = (v: boolean | 0 | 1 | undefined): boolean => v === true || v === 1;

const RSSSourceCard: React.FC<RSSSourceCardProps> = ({
  source,
  isLoading = false,
  onSync,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const isActive = toBool(source.active);
  const isAuto = toBool(source.autoPublish);
  const status = getSyncStatus(source.lastSync ?? null);
  const statusColorClass = colorClassMap[status.color];

  return (
    <div
      className={`border-2 rounded-xl p-4 sm:p-5 md:p-6 transition-all hover:shadow-lg ${isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
        }`}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
        {/* Left: identity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <div
              className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}
            />
            <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">
              {source.name}
            </h3>
            {isAuto && (
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1">
                <Zap size={10} />
                <span>Auto</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2 min-w-0">
            <Globe size={14} className="shrink-0" />
            {/* robust truncation on small screens; break-long tokens if needed */}
            <span className="truncate break-all max-w-full sm:max-w-[28rem] md:max-w-[36rem]">
              {source.url}
            </span>
          </div>

          {source.category && (
            <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
              {source.category}
            </span>
          )}
        </div>

        {/* Right: actions (wrap nicely on small screens) */}
        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <button
            onClick={() => onSync(source.id)}
            disabled={isLoading}
            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Sync Now"
          >
            <RefreshCw className={isLoading ? 'animate-spin' : ''} size={16} />
          </button>

          <button
            onClick={() => onToggle(source.id)}
            className={`p-2 rounded-lg transition-colors ${isActive
                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            title={isActive ? 'Deactivate' : 'Activate'}
          >
            {isActive ? <Check size={16} /> : <X size={16} />}
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-blue-600">{source.totalPosts ?? 0}</div>
          <div className="text-xs text-gray-600">Total Posts</div>
        </div>

        <div className="bg-white rounded-lg p-3 text-center">
          <div
            className={`text-lg font-bold ${(source.newPosts ?? 0) > 0 ? 'text-green-600' : 'text-gray-500'
              }`}
          >
            {source.newPosts ?? 0}
          </div>
          <div className="text-xs text-gray-600">New Posts</div>
        </div>

        <div className="bg-white rounded-lg p-3 text-center">
          <div className={`text-xs font-medium ${statusColorClass}`}>{status.text}</div>
          <div className="text-xs text-gray-600">Sync Status</div>
        </div>

        <div className="bg-white rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <Clock size={12} className="text-gray-500" />
            <span className="text-xs text-gray-600">
              {formatDate(source.lastSync ?? null)}
            </span>
          </div>
          <div className="text-xs text-gray-500">Last Sync</div>
        </div>
      </div>

      {/* Notifications */}
      {(source.newPosts ?? 0) > 0 && (
        <div className="bg-green-100 border border-green-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-green-600" size={16} />
            <span className="text-green-800 text-sm">
              {source.newPosts} new articles ready to import
            </span>
          </div>
          <button
            onClick={() => onSync(source.id)}
            className="sm:ml-auto text-green-700 hover:text-green-800 font-medium text-sm"
          >
            Import Now
          </button>
        </div>
      )}

      {!isActive && (
        <div className="mt-2 bg-gray-100 border border-gray-200 rounded-lg p-3 flex items-start sm:items-center gap-2">
          <AlertCircle className="text-gray-500 shrink-0" size={16} />
          <span className="text-gray-600 text-sm">
            Source is inactive — no automatic syncing
          </span>
        </div>
      )}
    </div>
  );
};

export default RSSSourceCard;
