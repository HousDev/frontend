// src/components/blogManager/RSSSourceManager.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Globe,
  RefreshCw,
  X,
  CheckCircle,
  TrendingUp,
  Bot,
  Shield,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { rssAPI } from '@/lib/rssAPI';
import RSSSourceCard from './RSSSourceCard';
import { RSSSource as SharedRSSSource } from '../../types/blog';

/* =========================================================
   Types
   - Use the shared RSSSource so it matches RSSSourceCard.
   - Card expects id: string (from ../../types/blog)
   ========================================================= */

type RSSSyncFrequency = 'hourly' | 'daily' | 'weekly' | 'manual';

// Match your shared union; many projects use 'all' to mean no filtering.
type RSSContentFilter = 'keywords' | 'all';

// Shape we keep in this component (same as shared, with required fields).
type RSSSource = SharedRSSSource & {
  // Ensure the required fields are present (shared types might mark some optional)
  id: string; // IMPORTANT: string id to match card
  name: string;
  url: string;
  category: string;
  description?: string | null;
  active: boolean | 0 | 1;
  autoPublish: boolean | 0 | 1;
  syncFrequency?: RSSSyncFrequency;
  contentFilter?: RSSContentFilter;
  keywords?: string[];
  lastSync?: string | null;
  totalPosts?: number;
  newPosts?: number;
  createdAt?: string;
  updatedAt?: string;
};

interface RSSSourceManagerProps {
  /** Optional modal mode */
  isOpen?: boolean;
  onClose?: () => void;
}

/* =========================================================
   Helpers: normalize backend rows -> front-end shape
   ========================================================= */

function toStringBool(v: any): boolean {
  if (v === true || v === 1 || v === '1') return true;
  return !!v;
}

function normalizeOne(raw: any): RSSSource {
  return {
    id: String(raw.id ?? raw.source_id ?? ''), // <-- make sure it's string
    name: raw.name ?? '',
    url: raw.url ?? '',
    category: raw.category ?? 'Property News',
    description: raw.description ?? null,
    active: raw.active ?? true,
    autoPublish: raw.autoPublish ?? false,
    syncFrequency: (raw.syncFrequency ?? 'daily') as RSSSyncFrequency,
    contentFilter: (raw.contentFilter ?? 'keywords') as RSSContentFilter,
    keywords: Array.isArray(raw.keywords)
      ? raw.keywords
      : typeof raw.keywords === 'string'
        ? raw.keywords
          .split(',')
          .map((k: string) => k.trim())
          .filter(Boolean)
        : [],
    lastSync: raw.lastSync ?? null,
    totalPosts: Number(raw.totalPosts ?? 0),
    newPosts: Number(raw.newPosts ?? 0),
    createdAt: raw.createdAt ?? raw.created_at ?? undefined,
    updatedAt: raw.updatedAt ?? raw.updated_at ?? undefined,
  };
}

function normalizeList(resp: any): RSSSource[] {
  const arr = Array.isArray(resp?.data) ? resp.data : Array.isArray(resp) ? resp : [];
  return arr.map(normalizeOne);
}

/* =========================================================
   Component
   ========================================================= */

const RSSSourceManager: React.FC<RSSSourceManagerProps> = ({ isOpen, onClose }) => {
  const [sources, setSources] = useState<RSSSource[]>([]);
  const [loading, setLoading] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSource, setEditingSource] = useState<RSSSource | null>(null);
  const [syncingSourceId, setSyncingSourceId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);

  const [form, setForm] = useState<Partial<RSSSource>>({
    name: '',
    url: '',
    category: 'Property News',
    description: '',
    active: true,
    autoPublish: false,
    syncFrequency: 'daily',
    contentFilter: 'keywords',
    keywords: [],
  });

  const categories = [
    'Property News',
    'Market Analysis',
    'Investment',
    'Legal',
    'Home Buying',
    'Home Selling',
    'Construction',
    'Finance',
  ];

  const predefinedSources: Array<Pick<RSSSource, 'name' | 'url' | 'category' | 'description'>> = [
    {
      name: 'Economic Times Real Estate',
      url: 'https://economictimes.indiatimes.com/rssfeeds/wealth/real-estate.cms',
      category: 'Market Analysis',
      description: 'Leading business news on real estate market',
    },
    {
      name: 'Housing.com News',
      url: 'https://housing.com/news/feed/',
      category: 'Property News',
      description: 'Latest property news and updates',
    },
    {
      name: 'MoneyControl Real Estate',
      url: 'https://www.moneycontrol.com/rss/realestate.xml',
      category: 'Investment',
      description: 'Investment focused real estate content',
    },
    {
      name: 'PropTiger Blog',
      url: 'https://www.proptiger.com/blog/feed/',
      category: 'Property News',
      description: 'Property insights and market trends',
    },
    {
      name: 'Magicbricks Blog',
      url: 'https://www.magicbricks.com/blog/feed/',
      category: 'Home Buying',
      description: 'Home buying and selling guides',
    },
    {
      name: 'Square Yards News',
      url: 'https://www.squareyards.com/news/feed/',
      category: 'Market Analysis',
      description: 'Real estate market analysis and trends',
    },
  ];

  /* =================== Load sources =================== */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await rssAPI.getAll();
        const list = normalizeList(resp);
        setSources(list);
      } catch (e: any) {
        toast.error(e?.message || 'Failed to load sources');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* =================== Handlers =================== */
  const handleAddPredefined = async (pre: typeof predefinedSources[number]) => {
    try {
      const payload = {
        ...pre,
        active: true,
        autoPublish: false,
        syncFrequency: 'daily' as RSSSyncFrequency,
        contentFilter: 'keywords' as RSSContentFilter,
        keywords: ['real estate', 'property', 'investment'],
      };

      // Backend likely expects numeric id internally; it returns a row
      const resp = await rssAPI.create(payload);
      const created = normalizeOne(resp?.data);
      setSources((prev) => [created, ...prev]);
      setShowAddForm(false);
      toast.success('RSS source added');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to add source');
    }
  };

  const handleAddSource = async () => {
    if (!form.name || !form.url) {
      toast.error('Name and URL are required');
      return;
    }
    try {
      const payload = {
        ...form,
        active: toStringBool(form.active),
        autoPublish: toStringBool(form.autoPublish),
        contentFilter: (form.contentFilter ?? 'keywords') as RSSContentFilter,
        syncFrequency: (form.syncFrequency ?? 'daily') as RSSSyncFrequency,
        keywords: (form.keywords ?? []).map((k) => String(k)),
      };

      const resp = await rssAPI.create(payload);
      const created = normalizeOne(resp?.data);
      setSources((prev) => [created, ...prev]);
      setForm({
        name: '',
        url: '',
        category: 'Property News',
        description: '',
        active: true,
        autoPublish: false,
        syncFrequency: 'daily',
        contentFilter: 'keywords',
        keywords: [],
      });
      setShowAddForm(false);
      toast.success('RSS source added');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to add source');
    }
  };

  const handleEditSource = (src: RSSSource) => {
    setEditingSource(src);
    setForm({ ...src });
    setShowAddForm(true);
  };

  const handleUpdateSource = async () => {
    if (!editingSource) return;
    try {
      const numericId = Number(editingSource.id);
      const payload = {
        ...form,
        active: toStringBool(form.active),
        autoPublish: toStringBool(form.autoPublish),
        contentFilter: (form.contentFilter ?? 'keywords') as RSSContentFilter,
        syncFrequency: (form.syncFrequency ?? 'daily') as RSSSyncFrequency,
        keywords: (form.keywords ?? []).map((k) => String(k)),
      };

      const resp = await rssAPI.update(numericId, payload);
      const updated = normalizeOne(resp?.data);
      setSources((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setEditingSource(null);
      setShowAddForm(false);
      setForm({
        name: '',
        url: '',
        category: 'Property News',
        description: '',
        active: true,
        autoPublish: false,
        syncFrequency: 'daily',
        contentFilter: 'keywords',
        keywords: [],
      });
      toast.success('Source updated');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update source');
    }
  };

  const handleToggleSource = async (id: string) => {
    try {
      const resp = await rssAPI.toggle(Number(id));
      const updated = normalizeOne(resp?.data);
      setSources((prev) => prev.map((s) => (s.id === id ? updated : s)));
      toast.success('Source status updated');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to toggle');
    }
  };

  const handleDeleteSource = async (id: string) => {
    if (!confirm('Delete this RSS source?')) return;
    try {
      await rssAPI.delete(Number(id));
      setSources((prev) => prev.filter((s) => s.id !== id));
      toast.success('Source deleted');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete');
    }
  };

  const handleSyncSingle = async (id: string) => {
    try {
      setSyncingSourceId(id);
      const resp = await rssAPI.syncOne(Number(id));
      const updated = normalizeOne(resp?.data);
      setSources((prev) => prev.map((s) => (s.id === id ? updated : s)));
      const meta = resp?.meta || {};
      toast.success(`Synced: ${meta?.inserted ?? 0} new / ${meta?.fetched ?? 0} fetched`);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to sync');
    } finally {
      setSyncingSourceId(null);
    }
  };

  const handleSyncAll = async () => {
    try {
      setSyncingAll(true);
      await rssAPI.syncAll();
      const resp = await rssAPI.getAll();
      const fresh = normalizeList(resp);
      setSources(fresh);
      toast.success('Sync all completed');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to sync all');
    } finally {
      setSyncingAll(false);
    }
  };

  /* =================== Derived stats =================== */
  const totals = useMemo(() => {
    return {
      sources: sources.length,
      active: sources.filter((s) => toStringBool(s.active)).length,
      totalPosts: sources.reduce((a, s) => a + Number(s.totalPosts ?? 0), 0),
      newPosts: sources.reduce((a, s) => a + Number(s.newPosts ?? 0), 0),
    };
  }, [sources]);

  /* =================== UI pieces =================== */
  const Header = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 sm:mb-1">RSS Source Management</h2>
          <p className="text-gray-600">Manage and monitor RSS feeds for automatic blog content</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus size={18} />
            <span>Add Source</span>
          </button>

          <button
            onClick={handleSyncAll}
            disabled={syncingAll || loading}
            className="bg-green-600 disabled:opacity-60 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <RefreshCw size={18} className={syncingAll ? 'animate-spin' : ''} />
            <span>{syncingAll ? 'Syncing…' : 'Sync All'}</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Globe className="text-blue-600" size={20} />
            <div>
              <div className="text-xl font-bold text-blue-600">{totals.sources}</div>
              <div className="text-sm text-blue-700">Total Sources</div>
            </div>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-600" size={20} />
            <div>
              <div className="text-xl font-bold text-green-600">{totals.active}</div>
              <div className="text-sm text-green-700">Active Sources</div>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-purple-600" size={20} />
            <div>
              <div className="text-xl font-bold text-purple-600">{totals.totalPosts}</div>
              <div className="text-sm text-purple-700">Total Posts</div>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Bot className="text-orange-600" size={20} />
            <div>
              <div className="text-xl font-bold text-orange-600">{totals.newPosts}</div>
              <div className="text-sm text-orange-700">Pending Import</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AddEditForm = showAddForm && (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          {editingSource ? 'Edit RSS Source' : 'Add New RSS Source'}
        </h3>
        <button
          onClick={() => {
            setShowAddForm(false);
            setEditingSource(null);
            setForm({
              name: '',
              url: '',
              category: 'Property News',
              description: '',
              active: true,
              autoPublish: false,
              syncFrequency: 'daily',
              contentFilter: 'keywords',
              keywords: [],
            });
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>

      {!editingSource && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Quick Add Popular Sources</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {predefinedSources.map((source, index) => (
              <button
                key={index}
                onClick={() => handleAddPredefined(source)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
              >
                <div className="flex items-start gap-3">
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
            value={form.name ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Economic Times Real Estate"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">RSS Feed URL *</label>
          <input
            type="url"
            value={form.url ?? ''}
            onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/rss"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
          <select
            value={form.category ?? 'Property News'}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sync Frequency</label>
          <select
            value={(form.syncFrequency as RSSSyncFrequency) ?? 'daily'}
            onChange={(e) =>
              setForm((p) => ({ ...p, syncFrequency: e.target.value as RSSSyncFrequency }))
            }
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
            value={(form.keywords ?? []).join(', ')}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                keywords: e.target.value
                  .split(',')
                  .map((k) => k.trim())
                  .filter(Boolean),
              }))
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Only content containing these keywords will be imported (unless filter is set to “all”)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={!!form.active}
              onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Active</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={!!form.autoPublish}
              onChange={(e) => setForm((p) => ({ ...p, autoPublish: e.target.checked }))}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="ml-2 text-sm text-gray-700">Auto Publish</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={(form.contentFilter ?? 'keywords') !== 'all'}
              onChange={(e) =>
                setForm((p) => ({ ...p, contentFilter: e.target.checked ? 'keywords' : 'all' }))
              }
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="ml-2 text-sm text-gray-700">Use Keyword Filter</span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6">
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
          onClick={editingSource ? handleUpdateSource : handleAddSource}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {editingSource ? 'Update Source' : 'Add Source'}
        </button>
      </div>
    </div>
  );

  const Grid = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {(loading ? [] : sources).map((source) => (
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
  );

  const EmptyState =
    !loading && sources.length === 0 ? (
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
    ) : null;

  const AdvancedSection = (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Bot className="text-purple-600" size={20} />
        <span>Advanced RSS Features</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="text-blue-600" size={18} />
            <span className="font-medium text-gray-900">Plagiarism Check</span>
          </div>
          <p className="text-sm text-gray-600">
            AI automatically checks and rewrites content to ensure 95%+ originality score
          </p>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-green-600" size={18} />
            <span className="font-medium text-gray-900">Smart Formatting</span>
          </div>
          <p className="text-sm text-gray-600">
            Auto-generates table of contents, proper headings, and professional formatting
          </p>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-purple-600" size={18} />
            <span className="font-medium text-gray-900">SEO Optimization</span>
          </div>
          <p className="text-sm text-gray-600">
            Automatically optimizes content for search engines with meta tags and keywords
          </p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => (
    <div className="space-y-6">
      {Header}
      {AddEditForm}
      {Grid}
      {EmptyState}
      {AdvancedSection}
    </div>
  );

  if (isOpen !== undefined && !isOpen) return null;

  return isOpen !== undefined ? (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
  ) : (
    renderContent()
  );
};

export default RSSSourceManager;
