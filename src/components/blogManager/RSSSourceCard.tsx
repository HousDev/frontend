// import React from 'react';
// import {
//   RefreshCw,
//   Check,
//   X,
//   Trash2,
//   Edit,
//   Globe,
//   Clock,
//   Zap,
//   AlertCircle,
//   TrendingUp,
// } from 'lucide-react';
// import { RSSSource } from '../../types/blog';

// interface RSSSourceCardProps {
//   source: RSSSource;
//   isLoading?: boolean;
//   onSync: (sourceId: string | number) => void;
//   onToggle: (sourceId: string | number) => void;
//   onEdit: (source: RSSSource) => void;
//   onDelete: (sourceId: string | number) => void;
// }

// // ---- helpers ----
// function safeParseDate(iso?: string | null): Date | null {
//   if (!iso) return null;
//   const d = new Date(iso);
//   return isNaN(d.getTime()) ? null : d;
// }

// function formatDate(iso?: string | null) {
//   const d = safeParseDate(iso);
//   if (!d) return 'Never';
//   return d.toLocaleString('en-IN', {
//     day: '2-digit',
//     month: 'short',
//     hour: '2-digit',
//     minute: '2-digit',
//   });
// }

// function getSyncStatus(lastSync?: string | null): { color: 'green' | 'yellow' | 'red' | 'gray'; text: string } {
//   const d = safeParseDate(lastSync);
//   if (!d) return { color: 'gray', text: 'Not synced' };

//   const diffMs = Date.now() - d.getTime();
//   if (diffMs < 0) return { color: 'green', text: 'just now' };

//   const hours = Math.floor(diffMs / (1000 * 60 * 60));
//   if (hours < 1) return { color: 'green', text: 'Recently synced' };
//   if (hours < 24) return { color: 'yellow', text: `${hours}h ago` };

//   const days = Math.floor(hours / 24);
//   return { color: 'red', text: `${days}d ago` };
// }

// const colorClassMap = {
//   green: 'text-green-600',
//   yellow: 'text-yellow-600',
//   red: 'text-red-600',
//   gray: 'text-gray-500',
// } as const;

// const RSSSourceCard: React.FC<RSSSourceCardProps> = ({
//   source,
//   isLoading = false,
//   onSync,
//   onToggle,
//   onEdit,
//   onDelete,
// }) => {
//   const status = getSyncStatus((source as any).lastSync); // lastSync may be string|null
//   const statusColorClass = colorClassMap[status.color];

//   return (
//     <div
//       className={`border-2 rounded-xl p-6 transition-all hover:shadow-lg ${source.active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
//         }`}
//     >
//       {/* Header */}
//       <div className="flex items-start justify-between mb-4">
//         <div className="flex-1">
//           <div className="flex items-center space-x-3 mb-2">
//             <div
//               className={`w-3 h-3 rounded-full ${source.active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
//                 }`}
//             />
//             <h3 className="text-lg font-bold text-gray-900">{source.name}</h3>
//             {source.autoPublish && (
//               <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
//                 <Zap size={10} />
//                 <span>Auto</span>
//               </span>
//             )}
//           </div>

//           <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
//             <Globe size={14} />
//             <span className="truncate max-w-xs">{source.url}</span>
//           </div>

//           <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
//             {source.category}
//           </span>
//         </div>

//         <div className="flex items-center space-x-2">
//           <button
//             onClick={() => onSync(source.id as any)}
//             disabled={isLoading}
//             className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             title="Sync Now"
//           >
//             <RefreshCw className={isLoading ? 'animate-spin' : ''} size={16} />
//           </button>

//           <button
//             onClick={() => onToggle(source.id as any)}
//             className={`p-2 rounded-lg transition-colors ${source.active
//                 ? 'bg-green-100 text-green-600 hover:bg-green-200'
//                 : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//               }`}
//             title={source.active ? 'Deactivate' : 'Activate'}
//           >
//             {source.active ? <Check size={16} /> : <X size={16} />}
//           </button>

//           <button
//             onClick={() => onEdit(source)}
//             className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
//             title="Edit"
//           >
//             <Edit size={16} />
//           </button>

//           <button
//             onClick={() => onDelete(source.id as any)}
//             className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
//             title="Delete"
//           >
//             <Trash2 size={16} />
//           </button>
//         </div>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
//         <div className="bg-white rounded-lg p-3 text-center">
//           <div className="text-lg font-bold text-blue-600">{source.totalPosts}</div>
//           <div className="text-xs text-gray-600">Total Posts</div>
//         </div>

//         <div className="bg-white rounded-lg p-3 text-center">
//           <div
//             className={`text-lg font-bold ${source.newPosts > 0 ? 'text-green-600' : 'text-gray-500'
//               }`}
//           >
//             {source.newPosts}
//           </div>
//           <div className="text-xs text-gray-600">New Posts</div>
//         </div>

//         <div className="bg-white rounded-lg p-3 text-center">
//           <div className={`text-xs font-medium ${statusColorClass}`}>{status.text}</div>
//           <div className="text-xs text-gray-600">Sync Status</div>
//         </div>

//         <div className="bg-white rounded-lg p-3 text-center">
//           <div className="flex items-center justify-center space-x-1">
//             <Clock size={12} className="text-gray-500" />
//             <span className="text-xs text-gray-600">{formatDate((source as any).lastSync)}</span>
//           </div>
//           <div className="text-xs text-gray-500">Last Sync</div>
//         </div>
//       </div>

//       {/* Notifications */}
//       {source.newPosts > 0 && (
//         <div className="bg-green-100 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
//           <TrendingUp className="text-green-600" size={16} />
//           <span className="text-green-800 text-sm">
//             {source.newPosts} new articles ready to import
//           </span>
//           <button
//             onClick={() => onSync(source.id as any)}
//             className="ml-auto text-green-600 hover:text-green-700 font-medium text-sm"
//           >
//             Import Now
//           </button>
//         </div>
//       )}

//       {!source.active && (
//         <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 flex items-center space-x-2">
//           <AlertCircle className="text-gray-500" size={16} />
//           <span className="text-gray-600 text-sm">
//             Source is inactive - no automatic syncing
//           </span>
//         </div>
//       )}
//     </div>
//   );
// };

// export default RSSSourceCard;

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

const toBool = (v: boolean | 0 | 1 | undefined): boolean =>
  v === true || v === 1;

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
      className={`border-2 rounded-xl p-6 transition-all hover:shadow-lg ${isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
        }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div
              className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}
            />
            <h3 className="text-lg font-bold text-gray-900">{source.name}</h3>
            {isAuto && (
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

          {source.category && (
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
              {source.category}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
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
          <div className="flex items-center justify-center space-x-1">
            <Clock size={12} className="text-gray-500" />
            <span className="text-xs text-gray-600">{formatDate(source.lastSync ?? null)}</span>
          </div>
          <div className="text-xs text-gray-500">Last Sync</div>
        </div>
      </div>

      {/* Notifications */}
      {(source.newPosts ?? 0) > 0 && (
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

      {!isActive && (
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 flex items-center space-x-2">
          <AlertCircle className="text-gray-500" size={16} />
          <span className="text-gray-600 text-sm">
            Source is inactive - no automatic syncing
          </span>
        </div>
      )}
    </div>
  );
};

export default RSSSourceCard;
