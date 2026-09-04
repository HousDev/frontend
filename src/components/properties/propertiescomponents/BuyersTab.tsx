import React, { useState, useEffect, useMemo } from 'react';
import { Users, MessageCircle, Phone, Mail, User, Target, Search, Send, ChevronDown, ChevronUp, Loader2, Flame } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import PropertyShareModal from '../PropertyShareModal';

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

const isLocationValid = (loc: any): boolean => {
  if (!loc || typeof loc !== 'string') return false;
  const cleaned = loc.trim().toLowerCase();
  if (!cleaned) return false;
  return !(
    cleaned === 'any location' ||
    cleaned === 'any' ||
    cleaned === '-' ||
    cleaned === '--' ||
    cleaned === 'n/a' ||
    cleaned === 'not specified' ||
    cleaned === 'undefined' ||
    cleaned === 'null'
  );
};

interface BuyersTabProps {
  property: any;
  onMatchBuyers: () => void;
}

const BuyersTab: React.FC<BuyersTabProps> = ({
  property,
  onMatchBuyers
}) => {
  const [buyersList, setBuyersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedBuyers, setSelectedBuyers] = useState<number[]>([]);
  const [expandedBuyer, setExpandedBuyer] = useState<number | null>(null);
  const [modalPage, setModalPage] = useState(1);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareBuyers, setShareBuyers] = useState<any[]>([]);
  const PAGE_SIZE = 15;

  const isRental = useMemo(() => {
    if (!property) return false;
    return Boolean(
      property.monthly_rent ||
      property.expected_rent ||
      property.listing_type === 'rent' ||
      property.transaction_type === 'rent' ||
      property.propertyId?.startsWith('RENT-') ||
      String(property.id).startsWith('RENT-')
    );
  }, [property]);

  // Load matched buyers directly from backend API for 100% logic and count parity
  useEffect(() => {
    const fetchMatchedBuyers = async () => {
      if (!property?.id) return;
      setLoading(true);
      try {
        const res = await api.get(`/location/properties/${property.id}/matching-buyers`);
        const data = Array.isArray(res.data) ? res.data : [];
        setBuyersList(data);
      } catch (err) {
        console.error("Failed to load matched buyers:", err);
        toast.error("Failed to load matched buyers list");
      } finally {
        setLoading(false);
      }
    };
    fetchMatchedBuyers();
    setSelectedBuyers([]);
    setExpandedBuyer(null);
    setModalPage(1);
    setSearchTerm('');
    setDebouncedSearch('');
  }, [property?.id]);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setModalPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const propPriceDisplay = useMemo(() => {
    const v = Number(property?.monthly_rent) || Number(property?.expected_rent) ||
      Number(property?.budget) || Number(property?.final_price) || Number(property?.price) || 0;
    return Number.isFinite(v) && v > 0 ? v : 0;
  }, [property]);

  const formatCurrency = (amount: number) => {
    if (!amount || amount <= 0) return '₹—';
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const filteredMatchedBuyers = useMemo(() => {
    const validLocBuyers = buyersList.filter((b: any) => isLocationValid(b.displayLocation || b.location || b.preferred_location));
    if (!debouncedSearch) return validLocBuyers;
    const term = debouncedSearch.toLowerCase().trim();

    return validLocBuyers.filter((b: any) => {
      const name = String(b.name || '').toLowerCase();
      const phone = String(b.phone || b.whatsapp || '');
      const email = String(b.email || '').toLowerCase();

      const displayLoc = String(b.displayLocation || '').toLowerCase();
      const rawLoc = String(b.location || b.preferred_location || '').toLowerCase();

      const displayBHK = String(b.displayBHK || '').toLowerCase();
      const prefBhk = String(b.preferred_bhk || b.unit_type || '').toLowerCase();

      let reqs = b.requirements;
      if (typeof reqs === 'string') {
        try { reqs = JSON.parse(reqs); } catch { reqs = {}; }
      }
      if (!reqs) reqs = {};
      const propType = String(reqs.propertyType || reqs.property_type || '').toLowerCase();
      const prefLocs = Array.isArray(reqs.preferredLocations) ? reqs.preferredLocations.join(' ').toLowerCase() : '';

      const minArea = String(reqs.minCarpetArea || reqs.minArea || '');
      const maxArea = String(reqs.maxCarpetArea || reqs.maxArea || '');

      const bMin = Number(b.budget_min || 0);
      const bMax = Number(b.budget_max || 0);
      const bMinStr = bMin > 0 ? (bMin >= 10000000 ? `${(bMin / 10000000).toFixed(1)}cr` : `${(bMin / 100000).toFixed(1)}l`) : '';
      const bMaxStr = bMax > 0 ? (bMax >= 10000000 ? `${(bMax / 10000000).toFixed(1)}cr` : `${(bMax / 100000).toFixed(1)}l`) : '';
      const budgetFullStr = `${bMin} ${bMax} ${bMinStr} ${bMaxStr}`.toLowerCase();

      const notes = String(b.notes || '').toLowerCase();

      return (
        name.includes(term) ||
        phone.includes(term) ||
        email.includes(term) ||
        displayLoc.includes(term) ||
        rawLoc.includes(term) ||
        prefLocs.includes(term) ||
        displayBHK.includes(term) ||
        prefBhk.includes(term) ||
        propType.includes(term) ||
        minArea.includes(term) ||
        maxArea.includes(term) ||
        budgetFullStr.includes(term) ||
        notes.includes(term)
      );
    });
  }, [debouncedSearch, buyersList]);

  // Paginated buyers slice
  const totalPages = Math.max(1, Math.ceil(filteredMatchedBuyers.length / PAGE_SIZE));
  const pagedBuyers = filteredMatchedBuyers.slice((modalPage - 1) * PAGE_SIZE, modalPage * PAGE_SIZE);

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 70) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (score >= 50) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  };

  const visitsCount = useMemo(() => {
    if (!property) return 0;
    return Array.isArray(property.visitHistory)
      ? property.visitHistory.length
      : (Array.isArray(property.activities)
        ? property.activities.filter((a: any) => a.activity_type === 'Site Visit' || a.type === 'visit').length
        : 0);
  }, [property]);

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

  const handleSendToSelectedBuyers = () => {
    if (selectedBuyers.length === 0) {
      toast.error('Please select buyers to share details');
      return;
    }
    const selectedObjs = buyersList.filter(b => selectedBuyers.includes(b.id));
    setShareBuyers(selectedObjs);
    setShareModalOpen(true);
  };

  const buildWhatsAppMessage = (buyer: any) => {
    const priceStr = propPriceDisplay > 0 ? formatCurrency(propPriceDisplay) + (isRental ? '/mo' : '') : 'Contact for Price';
    return `Hi ${buyer.name},\n\nI found a matching property for you!\n\n🏠 *${property.title || (isRental ? 'Rental Property' : 'Property') + ' #' + property.id}*\n📍 Location: ${property.location || property.society_name || 'Pune'}\n💰 ${priceStr}\n⭐ Match Score: ${buyer.matchScore}%\n\nLet me know if you would like to schedule a site visit.\n\nBest regards,\nResaleExpert Team`;
  };

  const handleWhatsApp = (buyer: any) => {
    const phone = String(buyer.whatsapp || buyer.phone || '').replace(/\D/g, '');
    if (!phone) { toast.error(`WhatsApp / Phone number not available for ${buyer.name || 'buyer'}`); return; }
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(buildWhatsAppMessage(buyer))}`, '_blank');
  };

  const handleCall = (buyer: any) => {
    const phone = String(buyer.phone || '').replace(/\D/g, '');
    if (!phone) { toast.error(`Phone number not available for ${buyer.name || 'buyer'}`); return; }
    window.open(`tel:${phone}`);
  };

  const handleEmail = (buyer: any) => {
    if (!buyer.email) { toast.error(`Email address not available for ${buyer.name || 'buyer'}`); return; }
    const subject = encodeURIComponent(`Property Match: ${property.title || '#' + property.id}`);
    const body = encodeURIComponent(buildWhatsAppMessage(buyer));
    window.open(`mailto:${buyer.email}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="space-y-3">
      {/* Summary Stat Cards */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: BD }}>
        <div className="p-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
          <div className="flex flex-row items-center justify-between gap-2">
            <h3 className="text-[11px] font-semibold" style={{ color: N }}>
              {isRental ? 'Tenant Matching Summary' : 'Buyer Matching Summary'}
            </h3>

            <button
              onClick={onMatchBuyers}
              className="px-2.5 py-1.5 rounded-md text-[11px] font-bold text-white whitespace-nowrap transition-all hover:opacity-90 flex items-center gap-1"
              style={{ background: O }}
            >
              <Target size={12} />
              <span>{isRental ? 'Find Matching Tenants' : 'Find Matching Buyers'}</span>
            </button>
          </div>
        </div>

        <div className="p-3">
          {loading ? (
            <div className="flex items-center justify-center py-4 text-gray-400 gap-1.5">
              <Loader2 className="animate-spin text-orange-500" size={16} />
              <span className="text-[11px]">Calculating matched leads...</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {/* Interested - Green */}
              <div className="rounded-lg p-2.5 text-center transition-all hover:shadow-sm" style={{ background: '#10b98110', border: '1px solid #10b98120' }}>
                <div className="text-lg font-bold" style={{ color: '#10b981' }}>{buyersList.length}</div>
                <div className="text-[10px] font-medium" style={{ color: '#10b981' }}>
                  {isRental ? 'Interested Tenants' : 'Interested Buyers'}
                </div>
              </div>

              {/* Hot Leads - Red */}
              <div className="rounded-lg p-2.5 text-center transition-all hover:shadow-sm" style={{ background: '#ef444410', border: '1px solid #ef444420' }}>
                <div className="text-lg font-bold" style={{ color: '#ef4444' }}>
                  {buyersList.filter((x: any) => x.matchScore >= 75).length}
                </div>
                <div className="text-[10px] font-medium" style={{ color: '#ef4444' }}>Hot Leads</div>
              </div>

              {/* Property Visits - Blue */}
              <div className="rounded-lg p-2.5 text-center transition-all hover:shadow-sm" style={{ background: '#3b82f610', border: '1px solid #3b82f620' }}>
                <div className="text-lg font-bold" style={{ color: '#3b82f6' }}>{visitsCount}</div>
                <div className="text-[10px] font-medium" style={{ color: '#3b82f6' }}>Property Visits</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Matched Buyers Section with Search, Checkboxes, Bulk Share, Details Expand, and Pagination */}
      <div className="bg-white rounded-xl border overflow-y-auto max-h-[390px]" style={{ borderColor: BD }}>

        {/* Sub-header Controls */}
        <div className="p-3 border-b space-y-3" style={{ background: `${N}05`, borderColor: BD }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[11px] font-semibold" style={{ color: N }}>
                {isRental ? 'Matched Tenants' : 'Matched Buyers'}
              </h3>
              <p className="text-[9px] text-gray-500">
                {isRental ? 'Tenants matching this property preferences' : 'Buyers matching this property preferences'}
              </p>
            </div>

            <div className="flex gap-2 items-center">
              <button
                onClick={handleSelectAll}
                className="h-7 px-2.5 rounded border text-[10px] font-semibold hover:bg-slate-50 transition-colors"
                style={{ borderColor: BD, color: N }}
              >
                {selectedBuyers.length === filteredMatchedBuyers.length && filteredMatchedBuyers.length > 0 ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={handleSendToSelectedBuyers}
                disabled={selectedBuyers.length === 0}
                className="h-7 px-2.5 rounded text-white text-[10px] font-bold transition-all flex items-center gap-1 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: O }}
              >
                <Send size={11} />
                <span>Share Details ({selectedBuyers.length})</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search by name, location, BHK, budget or carpet area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-8 pl-8 pr-3 border rounded-lg text-xs focus:outline-none focus:border-orange-500 bg-white"
              style={{ borderColor: BD }}
            />
            <Search className="absolute left-2.5 top-2 text-gray-400" size={12} />
          </div>
        </div>

        {/* Buyers List Container */}
        <div className="p-3 space-y-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
              <Loader2 className="animate-spin text-orange-500" size={20} />
              <span className="text-xs">Finding matching leads...</span>
            </div>
          ) : filteredMatchedBuyers.length > 0 ? (
            <>
              {pagedBuyers.map((buyer: any) => {
                const isSelected = selectedBuyers.includes(buyer.id);
                const isExpanded = expandedBuyer === buyer.id;

                return (
                  <div
                    key={buyer.id}
                    className="border rounded-xl transition-all overflow-hidden bg-white hover:border-slate-300"
                    style={{ borderColor: isSelected ? O : BD }}
                  >
                    <div className="p-2.5 flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleBuyerSelection(buyer.id)}
                          className="rounded text-orange-500 accent-orange-500 w-3.5 h-3.5 flex-shrink-0"
                        />
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${O}15` }}>
                          <Users size={12} style={{ color: O }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold" style={{ color: N }}>{buyer.name}</span>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${getMatchScoreColor(buyer.matchScore)}`}>
                              {buyer.matchScore}% Match ({buyer.matchScore}/100)
                            </span>
                          </div>
                          <div className="text-[9px] mt-0.5 text-gray-500 truncate flex items-center gap-1.5 flex-wrap">
                            {(() => {
                              const hasLoc = isLocationValid(buyer.displayLocation);
                              const hasDist = buyer.distance !== null && buyer.distance !== undefined && Number(buyer.distance) < 9000;

                              if (!hasLoc && !hasDist) return null;

                              let text = '';
                              if (hasLoc && hasDist) text = `📍 ${buyer.displayLocation} (${buyer.distance} km)`;
                              else if (hasLoc) text = `📍 ${buyer.displayLocation}`;
                              else text = `📍 ${buyer.distance} km away`;

                              return (
                                <>
                                  <span>{text}</span>
                                  <span>•</span>
                                </>
                              );
                            })()}
                            <span>🏢 {buyer.displayBHK}</span>
                            {(() => {
                              let req = buyer.requirements;
                              if (typeof req === 'string') { try { req = JSON.parse(req); } catch { req = {}; } }
                              const minA = req?.minCarpetArea || req?.minArea;
                              const maxA = req?.maxCarpetArea || req?.maxArea;
                              if (minA || maxA) {
                                return (
                                  <>
                                    <span>•</span>
                                    <span>📐 {minA || '—'} – {maxA || '—'} sq ft</span>
                                  </>
                                );
                              }
                              return null;
                            })()}
                            <span>•</span>
                            <span>💰 {formatCurrency(Number(buyer.budget_min || 0))} – {formatCurrency(Number(buyer.budget_max || 0))}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons: WhatsApp | Call | Email | Expand */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleWhatsApp(buyer)}
                          className="p-1.5 rounded-lg hover:bg-green-50 transition-colors"
                          title="WhatsApp"
                        >
                          <FaWhatsapp size={14} className="text-green-600" />
                        </button>
                        <a
                          href={buyer.phone ? `tel:${buyer.phone}` : undefined}
                          onClick={!buyer.phone ? (e) => { e.preventDefault(); toast.error(`Phone number not available for ${buyer.name || 'buyer'}`); } : undefined}
                          className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Call"
                        >
                          <Phone size={13} className="text-blue-600" />
                        </a>
                        <button
                          onClick={() => handleEmail(buyer)}
                          className="p-1.5 rounded-lg hover:bg-purple-50 transition-colors"
                          title="Email"
                        >
                          <Mail size={13} className="text-purple-600" />
                        </button>
                        <button
                          onClick={() => setExpandedBuyer(isExpanded ? null : buyer.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-gray-400 transition-colors"
                          title="Details"
                        >
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details View */}
                    {isExpanded && (
                      <div className="px-3 pb-2.5 pt-2 bg-slate-50/70 border-t border-dashed border-slate-200 text-[10px] space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-slate-600">
                          <div>
                            <span className="font-semibold text-slate-800">Preferred BHK / Unit:</span> {buyer.displayBHK}
                            {(() => {
                              let req = buyer.requirements;
                              if (typeof req === 'string') { try { req = JSON.parse(req); } catch { req = {}; } }
                              const minA = req?.minCarpetArea || req?.minArea;
                              const maxA = req?.maxCarpetArea || req?.maxArea;
                              if (minA || maxA) {
                                return (
                                  <span className="ml-3">
                                    <span className="font-semibold text-slate-800">Carpet Area:</span> {minA || '—'} – {maxA || '—'} sq ft
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800">Phone:</span> {buyer.phone || '—'} &nbsp;|&nbsp; <span className="font-semibold text-slate-800">Email:</span> {buyer.email || '—'}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="font-semibold text-slate-800 mr-1">Score Breakdown:</span>
                          <span className="text-[9px] font-medium bg-white px-2 py-0.5 border rounded">📍 Location: {buyer.locationScore}/35</span>
                          <span className="text-[9px] font-medium bg-white px-2 py-0.5 border rounded">💰 Budget: {buyer.budgetScore}/30</span>
                          <span className="text-[9px] font-medium bg-white px-2 py-0.5 border rounded">🏠 BHK: {buyer.bhkScore}/20</span>
                          <span className="text-[9px] font-medium bg-white px-2 py-0.5 border rounded">📐 Carpet Area: {buyer.areaScore}/15</span>
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

              {/* Pagination controls */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-500 sticky bottom-0 z-10 bg-white">
                <span>
                  Showing <strong>{Math.min((modalPage - 1) * PAGE_SIZE + 1, filteredMatchedBuyers.length)}–{Math.min(modalPage * PAGE_SIZE, filteredMatchedBuyers.length)}</strong> of <strong>{filteredMatchedBuyers.length}</strong> matched leads
                </span>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={modalPage === 1}
                      onClick={() => setModalPage(p => p - 1)}
                      className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 font-semibold"
                    >
                      ← Prev
                    </button>
                    <span>Page <strong>{modalPage}</strong> of <strong>{totalPages}</strong></span>
                    <button
                      disabled={modalPage === totalPages}
                      onClick={() => setModalPage(p => p + 1)}
                      className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50 font-semibold"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 rounded-lg" style={{ background: BG, border: `1px solid ${BD}` }}>
              <Users size={24} style={{ color: MU }} className="mx-auto mb-1.5" />
              <p className="text-xs font-semibold" style={{ color: N }}>No matching leads found</p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {debouncedSearch ? 'Try a different search query' : 'Click "Find Matching Buyers" to trigger matching recalculation'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Share Property Modal */}
      {shareModalOpen && (
        <PropertyShareModal
          isOpen={shareModalOpen}
          onClose={() => { setShareModalOpen(false); setShareBuyers([]); setSelectedBuyers([]); }}
          property={property}
          buyers={shareBuyers}
        />
      )}
    </div>
  );
};

export default BuyersTab;