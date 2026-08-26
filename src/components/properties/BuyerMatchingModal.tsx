import React, { useState, useEffect, useMemo } from 'react';
import { X, Users, Target, Search, Star, Phone, MessageCircle, Mail, MapPin, DollarSign, Calendar, Eye, Send, UserPlus, ChevronDown, ChevronUp, IndianRupeeIcon, Loader2 } from 'lucide-react';
import { buyerAPI } from '@/lib/buyerAPI';
import { toast } from 'react-toastify';
import { FaWhatsapp } from 'react-icons/fa6';
import { api } from '@/lib/api';
import PropertyDetailsShareModal from './PropertyDetailsShareModal';

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

// Helper to extract buyer location string from any schema variation
const getBuyerLocationStr = (buyer: any): string => {
  if (buyer.location && typeof buyer.location === 'string' && buyer.location.trim()) return buyer.location.trim();
  if (buyer.preferred_location && typeof buyer.preferred_location === 'string' && buyer.preferred_location.trim()) return buyer.preferred_location.trim();
  if (buyer.locations && typeof buyer.locations === 'string' && buyer.locations.trim()) return buyer.locations.trim();

  let req = buyer.requirements;
  if (typeof req === 'string') {
    try { req = JSON.parse(req); } catch { req = null; }
  }

  if (req && typeof req === 'object') {
    if (req.preferredLocations) {
      if (Array.isArray(req.preferredLocations) && req.preferredLocations.length > 0) return req.preferredLocations.join(', ');
      if (typeof req.preferredLocations === 'string' && req.preferredLocations.trim()) return req.preferredLocations.trim();
    }
    if (req.preferred_locations) {
      if (Array.isArray(req.preferred_locations) && req.preferred_locations.length > 0) return req.preferred_locations.join(', ');
      if (typeof req.preferred_locations === 'string' && req.preferred_locations.trim()) return req.preferred_locations.trim();
    }
    if (req.location && typeof req.location === 'string' && req.location.trim()) return req.location.trim();
  }
  if (buyer.city && typeof buyer.city === 'string' && buyer.city.trim()) return buyer.city.trim();
  return '';
};

// Helper to extract buyer BHK / Unit Type requirement from any schema variation
const getBuyerBHKStr = (buyer: any): string => {
  if (buyer.preferred_bhk && typeof buyer.preferred_bhk === 'string' && buyer.preferred_bhk.trim()) return buyer.preferred_bhk.trim();
  if (buyer.unit_type && typeof buyer.unit_type === 'string' && buyer.unit_type.trim()) return buyer.unit_type.trim();

  let req = buyer.requirements;
  if (typeof req === 'string') {
    try { req = JSON.parse(req); } catch { req = null; }
  }

  if (req && typeof req === 'object') {
    if (req.preferred_bhk) return String(req.preferred_bhk);
    if (req.unit_type) return String(req.unit_type);
    if (req.unitTypes) {
      if (Array.isArray(req.unitTypes) && req.unitTypes.length > 0) return req.unitTypes.join(', ');
      if (typeof req.unitTypes === 'string' && req.unitTypes.trim()) return req.unitTypes.trim();
    }
    if (req.propertyType && typeof req.propertyType === 'string' && req.propertyType.trim()) return req.propertyType.trim();
    if (req.property_type && typeof req.property_type === 'string' && req.property_type.trim()) return req.property_type.trim();
  }
  return '';
};

// Pune nearby / adjacent localities lookup map
const NEARBY_MAP: Record<string, string[]> = {
  tathawade: ['wakad', 'punawale', 'ravet', 'hinjewadi', 'marunji', 'pimpri'],
  wakad: ['tathawade', 'baner', 'balewadi', 'hinjewadi', 'thergaon', 'rahatani', 'pimple saudagar'],
  baner: ['balewadi', 'wakad', 'aundh', 'pashan', 'pimple saudagar', 'model colony'],
  balewadi: ['baner', 'wakad', 'aundh', 'pashan'],
  kharadi: ['viman nagar', 'wagholi', 'hadapsar', 'kalyani nagar', 'mundhwa', 'chandan nagar'],
  'viman nagar': ['kharadi', 'kalyani nagar', 'vishrantwadi', 'tingre nagar', 'yerwada'],
  hinjewadi: ['wakad', 'tathawade', 'marunji', 'punawale', 'pimpri', 'bavdhan'],
  kothrud: ['bavdhan', 'karve nagar', 'erandwane', 'deccan', 'warje'],
  bavdhan: ['kothrud', 'pashan', 'baner', 'warje', 'hinjewadi'],
  hadapsar: ['magarpatta', 'amanora', 'kharadi', 'fursungi', 'wanowrie', 'loni kalbhor'],
  rahatani: ['pimple saudagar', 'pimple nilakh', 'wakad', 'kalewadi', 'chinchwad'],
  'pimple saudagar': ['rahatani', 'pimple nilakh', 'wakad', 'baner', 'sangvi'],
};

const BuyerMatchingModal = ({ isOpen, onClose, property }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [buyersList, setBuyersList] = useState<any[]>([]);
  const [selectedBuyers, setSelectedBuyers] = useState<number[]>([]);
  const [expandedBuyer, setExpandedBuyer] = useState<number | null>(null);
  const [openActionMenu, setOpenActionMenu] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalPage, setModalPage] = useState(1);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareBuyer, setShareBuyer] = useState<any>(null);
  const MODAL_PAGE_SIZE = 20;

  useEffect(() => {
    const loadBuyers = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/location/properties/${property.id}/matching-buyers`);
        const list = Array.isArray(res.data) ? res.data : [];
        setBuyersList(list);
      } catch (err) {
        console.error("Failed to load buyers:", err);
        toast.error("Failed to load buyers list");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && property) {
      loadBuyers();
      setSelectedBuyers([]);
      setExpandedBuyer(null);
      setOpenActionMenu(null);
      setModalPage(1);
      setSearchTerm('');
      setDebouncedSearch('');
    }
  }, [isOpen, property]);

  // Close action menu on outside click
  useEffect(() => {
    if (openActionMenu === null) return;
    const handler = () => setOpenActionMenu(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [openActionMenu]);

  // Debounce modal search — avoids re-filtering huge lists on every keystroke
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(searchTerm); setModalPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Robust price extraction — same logic as PropertiesPage getBuyerMatchCount
  const propPrice = useMemo(() => {
    if (!property) return 0;
    const v = Number(property.budget) || Number(property.finalPrice) || Number(property.final_price) || Number(property.price) || Number(property.expected_price) || 0;
    return Number.isFinite(v) && v > 0 ? v : 0;
  }, [property]);

  // Matching Score is calculated on the backend
  const computedMatchedBuyers = useMemo(() => {
    return buyersList;
  }, [buyersList]);

  const filteredMatchedBuyers = useMemo(() => {
    if (!debouncedSearch) return computedMatchedBuyers;
    const term = debouncedSearch.toLowerCase();
    return computedMatchedBuyers.filter((b: any) =>
      String(b.name || '').toLowerCase().includes(term) ||
      String(b.phone || '').includes(debouncedSearch) ||
      String(b.displayLocation || '').toLowerCase().includes(term) ||
      String(b.displayBHK || '').toLowerCase().includes(term)
    );
  }, [debouncedSearch, computedMatchedBuyers]);

  // Paginated slice — renders max MODAL_PAGE_SIZE rows at a time
  const totalModalPages = Math.max(1, Math.ceil(filteredMatchedBuyers.length / MODAL_PAGE_SIZE));
  const pagedBuyers = filteredMatchedBuyers.slice((modalPage - 1) * MODAL_PAGE_SIZE, modalPage * MODAL_PAGE_SIZE);

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 70) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (score >= 50) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  };

  const formatCurrency = (amount: number) => {
    if (!amount || amount <= 0) return '₹—';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const buildWhatsAppMessage = (buyer: any) => {
    const priceStr = propPrice > 0 ? formatCurrency(propPrice) : 'Contact for Price';
    return `Hi ${buyer.name},\n\nI have a perfect property match for you!\n\n🏠 ${property.title || `Property #${property.id}`}\n📍 ${property.location || property.society || ''}, ${property.city || ''}\n💰 ${priceStr}\n🏢 ${property.unitType || (property.bedrooms ? property.bedrooms + 'BHK' : '')} • ${property.carpetArea || property.area || ''} sq ft\n\nWould you like to schedule a visit?\n\nBest regards,\nResaleExpert Team`;
  };

  const handleWhatsApp = (buyer: any) => {
    const phoneNum = String(buyer.whatsapp || buyer.phone || '').replace(/\D/g, '');
    if (!phoneNum) { toast.error("Phone number not available"); return; }
    window.open(`https://wa.me/${phoneNum}?text=${encodeURIComponent(buildWhatsAppMessage(buyer))}`, '_blank');
  };

  const handleCall = (buyer: any) => {
    const phone = String(buyer.phone || '').replace(/\D/g, '');
    if (!phone) { toast.error("Phone number not available"); return; }
    window.open(`tel:${phone}`);
  };

  const handleEmail = (buyer: any) => {
    if (!buyer.email) { toast.error("Email not available"); return; }
    const subject = encodeURIComponent(`Property Match: ${property.title || `Property #${property.id}`}`);
    const body = encodeURIComponent(buildWhatsAppMessage(buyer));
    window.open(`mailto:${buyer.email}?subject=${subject}&body=${body}`);
  };

  const handleBuyerSelection = (buyerId: number) => {
    setSelectedBuyers(prev =>
      prev.includes(buyerId) ? prev.filter(id => id !== buyerId) : [...prev, buyerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBuyers.length === filteredMatchedBuyers.length) {
      setSelectedBuyers([]);
    } else {
      setSelectedBuyers(filteredMatchedBuyers.map(b => b.id));
    }
  };

  const handleSendToSelectedBuyers = async () => {
    if (selectedBuyers.length === 0) { toast.error('Please select buyers to share details'); return; }
    
    if (selectedBuyers.length === 1) {
      const buyerObj = buyersList.find(b => b.id === selectedBuyers[0]);
      if (buyerObj) {
        setShareBuyer({ name: buyerObj.name, phone: buyerObj.phone, email: buyerObj.email });
        setShareModalOpen(true);
      }
    } else {
      setLoading(true);
      try {
        await api.post(`/location/properties/${property.id}/share`, {
          buyerIds: selectedBuyers,
          channels: ['whatsapp', 'email']
        });
        toast.success(`Shared property details with ${selectedBuyers.length} buyers in batch!`);
        setSelectedBuyers([]);
      } catch (err) {
        console.error("Batch share failed:", err);
        toast.error("Failed to share details with selected buyers");
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isOpen || !property) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" style={{ border: `1px solid ${BD}` }}>

        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between" style={{ background: N }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ background: `${O}20` }}>
              <Target size={14} style={{ color: O }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Buyer Matching</h2>
              <p className="text-[9px] text-white/70">{property?.title || `Property #${property?.id}`} - Find perfect buyers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-white/10 transition-colors text-white">
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Property Summary */}
          <div className="rounded-lg p-2.5" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-wider text-orange-600">Property</p>
                <p className="font-semibold truncate text-[11px]" style={{ color: N }}>{property?.title || `Property #${property?.id}`}</p>
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-wider text-orange-600">Location</p>
                <p className="font-semibold truncate text-[11px]" style={{ color: N }}>{property?.location || property?.society || property?.society_name || 'Pune'}</p>
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-wider text-orange-600">BHK / Area</p>
                <p className="font-semibold truncate text-[11px]" style={{ color: N }}>
                  {property?.unitType || (property?.bedrooms ? property.bedrooms + 'BHK' : '—')} • {property?.carpetArea || property?.builtupArea || property?.area || '—'} sq ft
                </p>
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-wider text-orange-600">Price</p>
                <p className="font-semibold truncate text-[11px]" style={{ color: N }}>
                  {propPrice > 0 ? formatCurrency(propPrice) : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                placeholder="Search buyers by name, phone or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-8 pl-8 pr-3 border rounded-lg text-xs focus:outline-none focus:border-orange-500"
                style={{ borderColor: BD }}
              />
              <Search className="absolute left-2.5 top-2 text-gray-400" size={12} />
            </div>

            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleSelectAll}
                className="h-8 px-3 rounded-lg border text-xs font-semibold hover:bg-slate-50 transition-colors"
                style={{ borderColor: BD, color: N }}
              >
                {selectedBuyers.length === filteredMatchedBuyers.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={handleSendToSelectedBuyers}
                disabled={selectedBuyers.length === 0}
                className="h-8 px-3 rounded-lg text-white text-xs font-bold transition-all flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: O }}
              >
                <Send size={12} />
                <span>Share Details ({selectedBuyers.length})</span>
              </button>
            </div>
          </div>

          {/* Buyers List */}
          <div className="space-y-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                <Loader2 className="animate-spin text-orange-500" size={24} />
                <span className="text-xs">Finding matching buyer leads...</span>
              </div>
            ) : filteredMatchedBuyers.length > 0 ? (
              <>
                {pagedBuyers.map((buyer: any) => {
                const isSelected = selectedBuyers.includes(buyer.id);
                const isExpanded = expandedBuyer === buyer.id;
                const menuOpen = openActionMenu === buyer.id;
                return (
                  <div
                    key={buyer.id}
                    className="border rounded-xl transition-all overflow-hidden bg-white hover:border-slate-300"
                    style={{ borderColor: isSelected ? O : BD }}
                  >
                    <div className="p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleBuyerSelection(buyer.id)}
                          className="rounded text-orange-500 accent-orange-500 w-3.5 h-3.5 flex-shrink-0"
                        />
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${O}15` }}>
                          <Users size={13} style={{ color: O }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold" style={{ color: N }}>{buyer.name}</span>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${getMatchScoreColor(buyer.matchScore)}`}>
                              {buyer.matchScore}% Match
                            </span>
                          </div>
                          <div className="text-[9px] mt-0.5 text-gray-500 truncate flex items-center gap-1.5 flex-wrap">
                            <span>📍 {buyer.displayLocation} {buyer.distance !== null && buyer.distance !== undefined ? `(${buyer.distance} km)` : ''}</span>
                            <span>•</span>
                            <span>🏢 {buyer.displayBHK}</span>
                            <span>•</span>
                            <span>💰 {formatCurrency(Number(buyer.budget_min || 0))} – {formatCurrency(Number(buyer.budget_max || 0))}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons: WhatsApp | Call | Email | Expand */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* WhatsApp */}
                        <button
                          onClick={() => handleWhatsApp(buyer)}
                          className="p-1.5 rounded-lg hover:bg-green-50 transition-colors"
                          title="WhatsApp"
                        >
                          <FaWhatsapp size={14} className="text-green-600" />
                        </button>
                        {/* Call */}
                        <a
                          href={buyer.phone ? `tel:${buyer.phone}` : undefined}
                          onClick={!buyer.phone ? (e) => { e.preventDefault(); toast.error('Phone not available'); } : undefined}
                          className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Call"
                        >
                          <Phone size={13} className="text-blue-600" />
                        </a>
                        {/* Email */}
                        <button
                          onClick={() => handleEmail(buyer)}
                          className="p-1.5 rounded-lg hover:bg-purple-50 transition-colors"
                          title="Email"
                        >
                          <Mail size={13} className="text-purple-600" />
                        </button>
                        {/* Expand */}
                        <button
                          onClick={() => setExpandedBuyer(isExpanded ? null : buyer.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-gray-400 transition-colors"
                          title="Details"
                        >
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-4 pb-3 pt-2 bg-slate-50/70 border-t border-dashed border-slate-200 text-[10px] space-y-2">
                        <div className="grid grid-cols-2 gap-3 text-slate-600">
                          <div>
                            <span className="font-semibold text-slate-800">Preferred BHK / Unit:</span> {buyer.displayBHK}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800">Phone:</span> {buyer.phone || '—'} &nbsp;|&nbsp; <span className="font-semibold text-slate-800">Email:</span> {buyer.email || '—'}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="font-semibold text-slate-800 mr-1">Score:</span>
                          <span className="text-[9px] font-medium bg-white px-2 py-0.5 border rounded">📍 Location: {buyer.locationScore}/40</span>
                          <span className="text-[9px] font-medium bg-white px-2 py-0.5 border rounded">💰 Budget: {buyer.budgetScore}/40</span>
                          <span className="text-[9px] font-medium bg-white px-2 py-0.5 border rounded">🏠 BHK: {buyer.bhkScore}/20</span>
                          <span className="text-[9px] font-bold bg-orange-50 text-orange-700 px-2 py-0.5 border border-orange-200 rounded">Total: {buyer.matchScore}/100</span>
                        </div>
                        {buyer.notes && (
                          <div className="text-slate-500 italic">
                            <strong>Notes:</strong> {buyer.notes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
                })}
                {/* Modal Pagination */}
                {totalModalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-100">
                    <button disabled={modalPage === 1} onClick={() => setModalPage(p => p - 1)} className="px-3 py-1 text-xs rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50">← Prev</button>
                    <span className="text-[10px] text-slate-500">Page {modalPage} / {totalModalPages}</span>
                    <button disabled={modalPage === totalModalPages} onClick={() => setModalPage(p => p + 1)} className="px-3 py-1 text-xs rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50">Next →</button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 rounded-lg bg-slate-50 border border-dashed border-slate-200">
                <Users size={32} style={{ color: MU }} className="mx-auto mb-2" />
                <p className="text-xs font-semibold" style={{ color: N }}>No matching buyers found</p>
                <p className="text-[10px] text-gray-500 mt-1">Try expanding buyer preferences or check property price/location details</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t flex items-center justify-between shrink-0" style={{ borderColor: BD, background: BG }}>
          <span className="text-[9px] text-slate-400">
            Showing <strong className="text-slate-600">{Math.min((modalPage - 1) * MODAL_PAGE_SIZE + 1, filteredMatchedBuyers.length)}–{Math.min(modalPage * MODAL_PAGE_SIZE, filteredMatchedBuyers.length)}</strong> of <strong className="text-slate-600">{filteredMatchedBuyers.length}</strong> matched buyers (from {buyersList.length} total)
          </span>
          <button onClick={onClose} className="px-4 py-1.5 border rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors" style={{ borderColor: BD, color: N }}>
            Close
          </button>
        </div>

      </div>

      {shareModalOpen && (
        <PropertyDetailsShareModal
          isOpen={shareModalOpen}
          onClose={() => { setShareModalOpen(false); setShareBuyer(null); setSelectedBuyers([]); }}
          selectedProperties={[property]}
          buyer={shareBuyer}
        />
      )}
    </div>
  );
};

export default BuyerMatchingModal;
