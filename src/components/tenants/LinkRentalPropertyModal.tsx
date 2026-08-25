import React, { useState, useEffect } from 'react';
import { Search, X, Building, MapPin, Check, Loader2, Link2 } from 'lucide-react';
import { rentalPropertiesAPI } from '@/lib/rentalPropertiesAPI';
import { getImageUrl } from '@/lib/helpers';
import { toast } from 'react-toastify';

interface LinkRentalPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantName: string;
  onLinkProperty: (propertyId: number | string, propertyTitle: string) => Promise<void>;
  currentLinkedPropertyId?: number | string | null;
}

export default function LinkRentalPropertyModal({
  isOpen,
  onClose,
  tenantName,
  onLinkProperty,
  currentLinkedPropertyId
}: LinkRentalPropertyModalProps) {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [submittingId, setSubmittingId] = useState<number | string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadProperties();
    }
  }, [isOpen]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await rentalPropertiesAPI.getAll();
      setProperties(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load rental properties list');
    } finally {
      setLoading(false);
    }
  };

  const filtered = properties.filter((p) => {
    const term = searchTerm.toLowerCase();
    const title = (p.title || p.property_title || '').toLowerCase();
    const loc = (p.location || p.city || '').toLowerCase();
    const idStr = String(p.id || p.property_id || '').toLowerCase();
    return title.includes(term) || loc.includes(term) || idStr.includes(term);
  });

  const handleSelect = async (p: any) => {
    try {
      setSubmittingId(p.id);
      const title = p.title || p.property_title || `RENT-${p.id}`;
      await onLinkProperty(p.id, title);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] border border-gray-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Link2 size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base">Link Rental Property</h3>
              <p className="text-xs text-slate-300">Select a rental property to link with <strong className="text-orange-400">{tenantName}</strong></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search property title, locality, BHK or ID (e.g. RENT-101)..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
        </div>

        {/* Property List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-custom-vertical">
          {loading ? (
            <div className="py-12 text-center text-gray-400 flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-orange-500" size={24} />
              <span className="text-xs">Loading available rental properties...</span>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((p) => {
              const isCurrentlyLinked = String(currentLinkedPropertyId) === String(p.id);
              const imgUrl = getImageUrl(p.images?.[0] || p.photos?.[0] || p.mediaItems?.[0]?.file_path);
              const price = Number(p.monthly_rent || p.expected_rent || p.price || 0);

              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-xl border transition-all flex items-center gap-4 ${
                    isCurrentlyLinked
                      ? 'border-orange-500 bg-orange-50/40 shadow-xs'
                      : 'border-gray-200 bg-white hover:border-orange-200 hover:shadow-md'
                  }`}
                >
                  {/* Property Image */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200 relative">
                    {imgUrl ? (
                      <img src={imgUrl} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Building size={20} />
                      </div>
                    )}
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] font-bold text-white text-center py-0.5">
                      RENT-{p.id}
                    </span>
                  </div>

                  {/* Property Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-sm text-slate-800 truncate">
                        {p.title || p.property_title || `Rental Property #${p.id}`}
                      </h4>
                      <span className="text-xs font-extrabold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200 whitespace-nowrap">
                        ₹{price.toLocaleString('en-IN')}/mo
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Building size={11} className="text-gray-400" />
                        <span className="truncate">{p.location || p.city || 'Location N/A'}</span>
                      </span>
                      {p.preferred_bhk || p.bhk ? (
                        <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                          {p.preferred_bhk || p.bhk} BHK
                        </span>
                      ) : null}
                      {p.tenant_type ? (
                        <span className="text-[10px] text-gray-400 capitalize">• {p.tenant_type}</span>
                      ) : null}
                    </div>
                  </div>

                  {/* Select / Link Button */}
                  <button
                    onClick={() => handleSelect(p)}
                    disabled={submittingId === p.id}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                      isCurrentlyLinked
                        ? 'bg-orange-500 text-white shadow-xs'
                        : 'bg-slate-900 text-white hover:bg-orange-500 shadow-xs'
                    }`}
                  >
                    {submittingId === p.id ? (
                      <Loader2 className="animate-spin" size={13} />
                    ) : isCurrentlyLinked ? (
                      <>
                        <Check size={13} />
                        <span>Linked</span>
                      </>
                    ) : (
                      <>
                        <Link2 size={13} />
                        <span>Link Property</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-gray-400 italic">
              No rental properties match your search.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Showing {filtered.length} of {properties.length} rental properties
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
