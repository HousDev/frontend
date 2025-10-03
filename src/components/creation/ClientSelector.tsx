import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Search, X, User, Phone, Mail, MapPin, Plus } from 'lucide-react';
import { buyerAPI } from '@/lib/buyerAPI';
import { sellerAPI } from '@/lib/sellersAPI';

type Party = {
  id?: string | number;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  salutation?: string;
  type?: 'Individual' | 'Company' | string;
  [k: string]: any;
};

type ClientSelectorProps = {
  title?: string;
  mode?: 'buyer' | 'seller';
  onSelect: (party: Party) => void;
  onClose: () => void;
};

function normalizeList<T = any>(res: any): T[] {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.rows)) return res.rows;
  if (Array.isArray(res?.items)) return res.items;
  return [];
}

const ClientSelector: React.FC<ClientSelectorProps> = ({
  onSelect,
  onClose,
  title = 'Select Client',
  mode = 'buyer',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<Party[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>('');

  const fetchList = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const fetcher = mode === 'buyer' ? buyerAPI.getAll : sellerAPI.getAll;
      const res = await fetcher(); // getAll() has no args in your project
      const list = normalizeList<Party>(res);

      // Normalize to consistent shape
      const mapped = list.map((it: any) => ({
        id: it.id ?? it._id ?? it.buyer_id ?? it.seller_id,
        name: it.name ?? it.full_name ?? it.company_name ?? 'Unnamed',
        phone: it.phone ?? it.mobile ?? it.whatsapp ?? '',
        email: it.email ?? '',
        address: it.address ?? it.location ?? '',
        salutation: it.salutation ?? '',
        type: it.type ?? (it.company_name ? 'Company' : 'Individual'),
        ...it,
      }));

      setItems(mapped);
    } catch (e: any) {
      console.error('load clients failed:', e);
      setErr('Failed to load list');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  // initial load + when mode changes
  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // debounce input (local filtering only)
  useEffect(() => {
    const t = setTimeout(() => {
      // No server call; we filter locally
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const filtered = useMemo(() => {
    if (!searchTerm) return items;
    const q = searchTerm.toLowerCase();
    return items.filter(
      (c) =>
        (c.name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(searchTerm)
    );
  }, [items, searchTerm]);

  const getColors = (type?: string) => {
    if (String(type).toLowerCase() === 'company') {
      return {
        card: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
        iconBg: 'bg-purple-100',
      };
    }
    return {
      card: 'bg-green-50 border-green-200 hover:bg-green-100',
      iconBg: 'bg-green-100',
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-xs">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">
              {title || (mode === 'buyer' ? 'Select Buyer' : 'Select Seller')}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder={`Search ${mode} by name, phone, or email...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              // onClick={() => ... open add form modal }
            >
              <Plus size={14} />
              <span>Add New</span>
            </button>
          </div>

          {loading && <div className="mt-2 text-gray-500">Loading {mode}s…</div>}
          {!!err && <div className="mt-2 text-red-600">{err}</div>}
        </div>

        {/* Client List */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {filtered.length === 0 && !loading ? (
            <div className="text-center text-gray-500 py-8">No {mode}s found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((client) => {
                const colors = getColors(client.type);
                return (
                  <div
                    key={String(client.id ?? client.email ?? Math.random())}
                    onClick={() => onSelect(client)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${colors.card}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${colors.iconBg}`}>
                          <User size={16} className="text-gray-700" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900"> {client.salutation}{' '}{client.name}</h3>
                          <p className="text-gray-500 mb-1 capitalize">
                            {client.type || (mode === 'seller' ? 'Seller' : 'Buyer')}
                          </p>
                          <div className="space-y-1">
                            {(client.phone || client.whatsapp) && (
                              <div className="flex items-center space-x-1.5 text-gray-600">
                                <Phone size={12} className="text-green-600" />
                                <span>{client.phone || client.whatsapp}</span>
                              </div>
                            )}
                            {client.email && (
                              <div className="flex items-center space-x-1.5 text-gray-600">
                                <Mail size={12} className="text-blue-600" />
                                <span>{client.email}</span>
                              </div>
                            )}
                            {client.address && (
                              <div className="flex items-center space-x-1.5 text-gray-600">
                                <MapPin size={12} className="text-red-600" />
                                <span>{client.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Select
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientSelector;
