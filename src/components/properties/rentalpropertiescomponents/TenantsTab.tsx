import React, { useState, useEffect, useMemo } from 'react';
import { Users, Phone, Mail, Target, Search, Send, ChevronDown, ChevronUp, Loader2, CheckCircle, MapPin, IndianRupee, Building2 } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { tenantAPI } from '@/lib/tenantAPI';
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

interface TenantsTabProps {
  property: any;
  onMatchTenants: () => void;
}

function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const airDistance = R * c;

  if (airDistance === 0) return 0;
  const roadDistance = airDistance < 2.0 ? airDistance * 1.35 : airDistance * 1.55;
  return parseFloat(roadDistance.toFixed(1));
}

function getDynamicDistance(property: any, tenant: any): number | null {
  if (tenant?.distance != null && !isNaN(Number(tenant.distance)) && Number(tenant.distance) < 9000) {
    return parseFloat(Number(tenant.distance).toFixed(1));
  }

  const pLat = parseFloat(String(property?.latitude || property?.lat || property?.society?.latitude || property?.society?.lat || 0));
  const pLng = parseFloat(String(property?.longitude || property?.lng || property?.society?.longitude || property?.society?.lng || 0));

  if (isNaN(pLat) || isNaN(pLng) || pLat === 0 || pLng === 0) return null;

  let tenantCoords: Array<{ lat: number; lng: number }> = [];

  if (tenant?.preferred_locations_coords) {
    let raw = tenant.preferred_locations_coords;
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch { raw = []; }
    }
    if (Array.isArray(raw)) {
      tenantCoords = raw
        .map(c => ({ lat: parseFloat(String(c.lat || c.latitude || 0)), lng: parseFloat(String(c.lng || c.longitude || 0)) }))
        .filter(c => c.lat > 0 && c.lng > 0);
    }
  }

  const singleTLat = parseFloat(String(tenant?.latitude || tenant?.lat || 0));
  const singleTLng = parseFloat(String(tenant?.longitude || tenant?.lng || 0));
  if (singleTLat > 0 && singleTLng > 0) {
    tenantCoords.push({ lat: singleTLat, lng: singleTLng });
  }

  if (tenantCoords.length === 0) return null;

  let minDistance: number | null = null;
  for (const tc of tenantCoords) {
    const d = calculateHaversineKm(pLat, pLng, tc.lat, tc.lng);
    if (minDistance === null || d < minDistance) {
      minDistance = d;
    }
  }

  return minDistance;
}

const TenantsTab: React.FC<TenantsTabProps> = ({
  property,
  onMatchTenants
}) => {
  const [tenantsList, setTenantsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTenants, setSelectedTenants] = useState<number[]>([]);
  const [expandedTenant, setExpandedTenant] = useState<number | null>(null);
  const [modalPage, setModalPage] = useState(1);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareTenants, setShareTenants] = useState<any[]>([]);
  const PAGE_SIZE = 15;

  useEffect(() => {
    const fetchMatchedTenants = async () => {
      if (!property?.id) return;
      setLoading(true);
      try {
        let apiData: any[] = [];
        try {
          const res = await api.get(`/location/properties/${property.id}/matching-buyers`);
          if (Array.isArray(res.data)) apiData = res.data;
        } catch (e) {
          console.warn("Backend location API fetch failed:", e);
        }

        const allTenants = await tenantAPI.getAll();
        const propRent = Number(property.monthly_rent || property.budget || 0);
        const unitTypeStr = (property.unit_type || property.unitType || '').toLowerCase();
        const bhkFromUnitType = unitTypeStr.match(/(\d+(?:\.\d+)?)\s*bhk/i);
        const propBHK = parseFloat(String(property.bedrooms || (bhkFromUnitType ? bhkFromUnitType[1] : 0)));
        const propLoc = (property.location_name || property.location || "").toLowerCase().trim();
        const propCity = (property.city_name || property.city || "").toLowerCase().trim();
        const propSoc = (property.society_name || property.society || "").toLowerCase().trim();

        const processed = (allTenants || []).map((tenant: any) => {
          let locationScore = 0;
          let budgetScore = 0;
          let bhkScore = 0;

          const prefLocRaw = tenant.preferred_location || "";
          const distKm = getDynamicDistance(property, tenant);

          if (distKm !== null) {
            if (distKm <= 3.0) locationScore = 40;
            else if (distKm <= 8.0) locationScore = 25;
            else if (distKm <= 20.0) locationScore = 15;
            else locationScore = 0;
          } else if (!prefLocRaw.trim()) {
            locationScore = 15;
          } else {
            const prefLocs = prefLocRaw.toLowerCase().split(/[;,]+/).map((s: any) => s.trim()).filter(Boolean);

            const hasExactLocMatch = prefLocs.some((loc: any) => {
              const cleanL = loc.replace(/,?\s*(pune|mumbai|pcmc|maharashtra).*/i, '').trim();
              if (!cleanL) return false;
              return (
                (propLoc && (propLoc.includes(cleanL) || cleanL.includes(propLoc))) ||
                (propSoc && (propSoc.includes(cleanL) || cleanL.includes(propSoc)))
              );
            });

            if (hasExactLocMatch) {
              locationScore = 40;
            } else {
              const isSameCity = propCity && prefLocs.some((l: any) => l.includes(propCity));
              locationScore = isSameCity ? 15 : 0;
            }
          }

          // Budget Match
          const tMin = Number(tenant.budget_min) || 0;
          const tMax = Number(tenant.budget_max) || 0;
          if (tMin === 0 && tMax === 0) {
            budgetScore = 20;
          } else if (propRent > 0) {
            if (tMin > 0 && tMax > 0) {
              if (propRent >= tMin && propRent <= tMax) {
                budgetScore = 40;
              } else if (propRent < tMin) {
                budgetScore = 35;
              } else {
                const diff = propRent - tMax;
                const tolerance = tMax * 0.2;
                if (diff <= tolerance) {
                  budgetScore = Math.max(5, Math.round(30 * (1 - diff / tolerance)));
                } else {
                  budgetScore = 0;
                }
              }
            } else if (tMax > 0 && propRent <= tMax) {
              budgetScore = 40;
            } else if (tMin > 0 && propRent >= tMin) {
              budgetScore = 40;
            } else {
              budgetScore = 0;
            }
          }

          // BHK Match
          const prefBHKRaw = (tenant.preferred_bhk || "").toLowerCase().trim();
          if (!prefBHKRaw) {
            bhkScore = 10;
          } else {
            const allBhkNums = (prefBHKRaw.match(/\d+(?:\.\d+)?/g) || []).map((n: any) => parseFloat(n));
            let exactBhkMatched = false;
            let partialBhkMatched = false;

            if (propBHK > 0 && allBhkNums.length > 0) {
              exactBhkMatched = allBhkNums.some((n: any) => Math.abs(n - propBHK) <= 0.1);
              if (!exactBhkMatched) {
                partialBhkMatched = allBhkNums.some((n: any) => Math.abs(n - propBHK) <= 1.0);
              }
            } else if (unitTypeStr) {
              exactBhkMatched = prefBHKRaw.includes('bungalow') || prefBHKRaw.includes('studio') ||
                prefBHKRaw.includes('commercial') || prefBHKRaw.includes(unitTypeStr.slice(0, 5));
            }

            if (exactBhkMatched) bhkScore = 20;
            else if (partialBhkMatched) bhkScore = 10;
            else bhkScore = 0;
          }

          const distance = getDynamicDistance(property, tenant);

          const matchScore = locationScore + budgetScore + bhkScore;
          return {
            ...tenant,
            matchScore,
            locationScore,
            budgetScore,
            bhkScore,
            distance,
            displayLocation: tenant.preferred_location || '',
            displayBHK: tenant.preferred_bhk || 'Any BHK',
          };
        }).filter(t => isLocationValid(t.preferred_location) && t.matchScore >= 30).sort((a, b) => b.matchScore - a.matchScore);

        setTenantsList(processed);
      } catch (err) {
        console.error("Failed to load matched tenants:", err);
        toast.error("Failed to load matched tenants list");
      } finally {
        setLoading(false);
      }
    };
    fetchMatchedTenants();
    setSelectedTenants([]);
    setExpandedTenant(null);
    setModalPage(1);
    setSearchTerm('');
    setDebouncedSearch('');
  }, [property?.id]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setModalPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const formatCurrency = (amount: number) => {
    if (!amount || amount <= 0) return '₹—';
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const filteredMatchedTenants = useMemo(() => {
    if (!debouncedSearch) return tenantsList;
    const term = debouncedSearch.toLowerCase().trim();
    return tenantsList.filter((t: any) => {
      const matchText = `${t.name} ${t.phone} ${t.email || ''} ${t.preferred_location} ${t.preferred_bhk || ''} ${t.tenant_type || ''} ${t.notes || ''}`.toLowerCase();
      return matchText.includes(term);
    });
  }, [tenantsList, debouncedSearch]);

  const totalPages = Math.ceil(filteredMatchedTenants.length / PAGE_SIZE) || 1;
  const paginatedTenants = useMemo(() => {
    const start = (modalPage - 1) * PAGE_SIZE;
    return filteredMatchedTenants.slice(start, start + PAGE_SIZE);
  }, [filteredMatchedTenants, modalPage]);

  const handleTenantSelection = (id: number) => {
    setSelectedTenants(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllCurrentPage = () => {
    const currentIds = paginatedTenants.map(t => t.id);
    const allSelected = currentIds.every(id => selectedTenants.includes(id));
    if (allSelected) {
      setSelectedTenants(prev => prev.filter(id => !currentIds.includes(id)));
    } else {
      setSelectedTenants(prev => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  const handleShareSelected = () => {
    if (selectedTenants.length === 0) {
      toast.info("Please select tenants to send property details");
      return;
    }
    const tenantsToShare = tenantsList.filter(t => selectedTenants.includes(t.id));
    setShareTenants(tenantsToShare);
    setShareModalOpen(true);
  };

  const handleWhatsApp = (tenant: any) => {
    const rentText = formatCurrency(Number(property?.monthly_rent || 0));
    const message = `Hi ${tenant.name},\n\nI have a rental property matching your preferences!\n\n🏠 *${property?.title}*\n📍 Location: ${property?.location_name || property?.location || ''}, ${property?.city_name || property?.city || ''}\n💰 Rent: ${rentText}/month\n🛏️ Unit: ${property?.unit_type || property?.bedrooms + ' BHK'}\n\nLet me know if you would like to arrange a viewing.\n\nBest regards,\nProperty Team`;
    const cleanPhone = String(tenant.phone || '').replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('91') || cleanPhone.length > 10 ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmail = (tenant: any) => {
    const rentText = formatCurrency(Number(property?.monthly_rent || 0));
    const subject = `Rental Property Match: ${property?.title}`;
    const body = `Dear ${tenant.name},\n\nWe found a rental property matching your preferences:\n\nProperty: ${property?.title}\nLocation: ${property?.location_name || property?.location || ''}, ${property?.city_name || property?.city || ''}\nRent: ${rentText}/month\n\nPlease let us know if you want to schedule a visit.`;
    const mailtoUrl = `mailto:${tenant.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 65) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (score >= 45) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Stats */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${O}15` }}>
            <Users size={20} style={{ color: O }} />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: N }}>Matched Tenants ({tenantsList.length})</h3>
            <p className="text-[11px] text-gray-500">Tenants matching this rental property's location, rent budget, and unit type</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onMatchTenants}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white flex items-center gap-1.5 transition-all shadow-sm hover:opacity-90"
            style={{ background: O }}
          >
            <Target size={14} />
            <span>Open Matching Modal</span>
          </button>
        </div>
      </div>

      {/* Main List Box */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-y-auto max-h-[460px] flex flex-col">
        {/* Search & Actions Bar */}
        <div className="p-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 sticky top-0 z-10">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search matched tenants by name, phone, location, BHK..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={handleSelectAllCurrentPage}
              className="text-[11px] font-semibold text-slate-600 hover:text-orange-600 px-2 py-1 rounded border border-slate-200 bg-white"
            >
              {paginatedTenants.length > 0 && paginatedTenants.every(t => selectedTenants.includes(t.id)) ? 'Deselect Page' : 'Select Page'}
            </button>

            {selectedTenants.length > 0 && (
              <button
                onClick={handleShareSelected}
                className="px-3 py-1 text-xs font-semibold rounded-lg text-white flex items-center gap-1.5 transition-all"
                style={{ background: O }}
              >
                <Send size={12} />
                <span>Send to {selectedTenants.length} Tenant(s)</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400">
            <Loader2 size={24} className="animate-spin mb-2" style={{ color: O }} />
            <p className="text-xs font-medium">Finding matching tenants...</p>
          </div>
        ) : filteredMatchedTenants.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Users size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs font-semibold text-slate-600">No matching tenants found</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Try searching with different terms or open the matching modal</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginatedTenants.map((tenant) => {
              const isSelected = selectedTenants.includes(tenant.id);
              const isExpanded = expandedTenant === tenant.id;

              return (
                <div key={tenant.id} className={`transition-colors ${isSelected ? 'bg-orange-50/30' : 'hover:bg-slate-50/60'}`}>
                  <div className="p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleTenantSelection(tenant.id)}
                        className="rounded text-orange-500 accent-orange-500 w-3.5 h-3.5 flex-shrink-0 cursor-pointer"
                      />
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${O}15` }}>
                        <Users size={12} style={{ color: O }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11.5px] font-bold" style={{ color: N }}>{tenant.name}</span>
                          <span className="px-1 py-0.2 rounded text-[8px] bg-slate-200 text-slate-700 font-semibold">{tenant.tenant_type || 'Tenant'}</span>
                          <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded-full border ${getMatchScoreColor(tenant.matchScore)}`}>
                            {tenant.matchScore}% Match ({tenant.matchScore}/100)
                          </span>
                        </div>
                        <div className="text-[9.5px] mt-0.5 text-gray-500 truncate flex items-center gap-2 flex-wrap">
                          {(() => {
                            const hasLoc = isLocationValid(tenant.displayLocation);
                            const hasDist = tenant.distance !== null && tenant.distance !== undefined && Number(tenant.distance) < 9000;

                            if (!hasLoc && !hasDist) return null;

                            let text = '';
                            if (hasLoc && hasDist) text = `📍 ${tenant.displayLocation} (${tenant.distance === 0 ? '0.0' : tenant.distance} km away)`;
                            else if (hasLoc) text = `📍 ${tenant.displayLocation}`;
                            else text = `📍 ${tenant.distance === 0 ? '0.0' : tenant.distance} km away`;

                            return (
                              <>
                                <span>{text}</span>
                                <span>•</span>
                              </>
                            );
                          })()}
                          <span className="inline-flex items-center gap-1"><Building2 size={12} className="text-slate-500" /> BHK: {tenant.displayBHK}</span>
                          <span>•</span>
                          <span>💰 Rent Budget: {formatCurrency(Number(tenant.budget_min || 0))} – {formatCurrency(Number(tenant.budget_max || 0))}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleWhatsApp(tenant)}
                        className="p-1.5 rounded-lg hover:bg-green-50 transition-colors"
                        title="WhatsApp"
                      >
                        <FaWhatsapp size={14} className="text-green-600" />
                      </button>
                      <a
                        href={tenant.phone ? `tel:${tenant.phone}` : undefined}
                        onClick={!tenant.phone ? (e) => { e.preventDefault(); toast.error(`Phone number not available for ${tenant.name || 'tenant'}`); } : undefined}
                        className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Call"
                      >
                        <Phone size={13} className="text-blue-600" />
                      </a>
                      <button
                        onClick={() => handleEmail(tenant)}
                        className="p-1.5 rounded-lg hover:bg-purple-50 transition-colors"
                        title="Email"
                      >
                        <Mail size={13} className="text-purple-600" />
                      </button>
                      <button
                        onClick={() => setExpandedTenant(isExpanded ? null : tenant.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-gray-400 transition-colors"
                        title="Details"
                      >
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div className="px-3 pb-2.5 pt-2 bg-slate-50/70 border-t border-dashed border-slate-200 text-[10px] space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                        <div><strong className="text-slate-800">Phone:</strong> {tenant.phone}</div>
                        <div><strong className="text-slate-800">Email:</strong> {tenant.email}</div>
                      </div>
                      {tenant.notes && <p className="italic bg-white p-1.5 rounded border border-slate-200 text-slate-600">💬 "{tenant.notes}"</p>}
                      <div className="flex gap-3 text-[9px] pt-1 border-t border-slate-200">
                        <span className="flex items-center gap-1"><CheckCircle size={10} className={tenant.locationScore >= 20 ? "text-emerald-500" : "text-gray-300"} /> Location: {tenant.locationScore}/40</span>
                        <span className="flex items-center gap-1"><CheckCircle size={10} className={tenant.budgetScore >= 20 ? "text-emerald-500" : "text-gray-300"} /> Rent Budget: {tenant.budgetScore}/40</span>
                        <span className="flex items-center gap-1"><CheckCircle size={10} className={tenant.bhkScore > 0 ? "text-emerald-500" : "text-gray-300"} /> BHK: {tenant.bhkScore}/20</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500 sticky bottom-0 z-10">
            <span>Showing {(modalPage - 1) * PAGE_SIZE + 1}–{Math.min(modalPage * PAGE_SIZE, filteredMatchedTenants.length)} of {filteredMatchedTenants.length} tenants</span>
            <div className="flex items-center gap-1">
              <button
                disabled={modalPage === 1}
                onClick={() => setModalPage(p => p - 1)}
                className="px-2 py-1 rounded border border-slate-200 bg-white disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-2 font-semibold text-slate-700">{modalPage} / {totalPages}</span>
              <button
                disabled={modalPage === totalPages}
                onClick={() => setModalPage(p => p + 1)}
                className="px-2 py-1 rounded border border-slate-200 bg-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Property Share Modal */}
      {shareModalOpen && (
        <PropertyShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          property={property}
          buyers={shareTenants}
        />
      )}
    </div>
  );
};

export default TenantsTab;
