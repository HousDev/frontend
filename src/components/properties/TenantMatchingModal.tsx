import React, { useState, useEffect } from 'react';
import { X, Users, Target, Search, Phone, Mail, MapPin, ChevronDown, ChevronUp, IndianRupeeIcon, CheckCircle, Send, Loader2 } from 'lucide-react';
import { tenantAPI } from '@/lib/tenantAPI';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';
import { FaWhatsapp } from 'react-icons/fa6';
import PropertyShareModal from './PropertyShareModal';

// Theme Colors matching Resale / Rental portal
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

interface Tenant {
  id: number;
  tenant_id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  preferred_location: string;
  budget_min: string;
  budget_max: string;
  preferred_bhk: string;
  tenant_type: string;
  notes: string;
  status: string;
}

interface TenantMatchingModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
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

const TenantMatchingModal: React.FC<TenantMatchingModalProps> = ({ isOpen, onClose, property }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTenants, setSelectedTenants] = useState<number[]>([]);
  const [expandedTenant, setExpandedTenant] = useState<number | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareTenants, setShareTenants] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && property) {
      loadTenants();
    }
  }, [isOpen, property]);

  const loadTenants = async () => {
    try {
      setLoading(true);
      // First try fetching matching leads (with calculated Haversine distance in km) from location API
      let matchedApiData: any[] = [];
      try {
        const res = await api.get(`/location/properties/${property.id}/matching-buyers`);
        if (Array.isArray(res.data) && res.data.length > 0) {
          matchedApiData = res.data;
        }
      } catch (e) {
        console.warn("Backend location API matching failed, falling back to tenant DB:", e);
      }

      const allTenants = await tenantAPI.getAll();
      
      // Merge distance and backend score if available
      const merged = (allTenants || []).map((t: any) => {
        const apiMatch = matchedApiData.find((m: any) => String(m.id) === String(t.id) || String(m.tenant_id) === String(t.tenant_id));
        return {
          ...t,
          distance: apiMatch?.distance != null ? apiMatch.distance : null,
          apiMatchScore: apiMatch?.matchScore ?? null,
        };
      });

      setTenants(merged);
      setSelectedTenants([]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load tenant database for matching");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !property) return null;

  // Matching algorithm
  const getMatchDetails = (tenant: Tenant & { distance?: number | null; apiMatchScore?: number | null }) => {
    let locationScore = 0;
    let budgetScore = 0;
    let bhkScore = 0;

    const propRent = Number(property.monthly_rent || property.budget || 0);
    // Extract BHK from bedrooms field, fallback to parsing unit_type (e.g. "2BHK", "3.5BHK", "2.5BHK")
    const unitTypeStr = (property.unit_type || property.unitType || '').toLowerCase();
    const bhkFromUnitType = unitTypeStr.match(/(\d+(?:\.\d+)?)\s*bhk/i);
    const propBHK = parseFloat(String(property.bedrooms || (bhkFromUnitType ? bhkFromUnitType[1] : 0)));

    // Support both camelCase (from form) and snake_case (from API)
    const propLoc = (property.location_name || property.location || "").toLowerCase().trim();
    const propCity = (property.city_name || property.city || "").toLowerCase().trim();
    const propSoc = (property.society_name || property.society || "").toLowerCase().trim();

    // 1. Location Match (Weight: 40)
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
      const prefLocs = prefLocRaw.toLowerCase().split(/[;,]+/).map(s => s.trim()).filter(Boolean);

      const hasExactLocMatch = prefLocs.some(loc => {
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
        const isSameCity = propCity && prefLocs.some(l => l.includes(propCity));
        locationScore = isSameCity ? 15 : 0;
      }
    }

    // 2. Budget Match (Weight: 40)
    const tMin = Number(tenant.budget_min) || 0;
    const tMax = Number(tenant.budget_max) || 0;
    if (tMin === 0 && tMax === 0) {
      budgetScore = 20; // give baseline if no budget specified
    } else if (propRent > 0) {
      if (tMin > 0 && tMax > 0) {
        if (propRent >= tMin && propRent <= tMax) {
          budgetScore = 40; // Exact budget range match
        } else if (propRent < tMin) {
          budgetScore = 35; // Affordable for tenant!
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

    // 3. BHK Match (Weight: 20)
    const prefBHKRaw = (tenant.preferred_bhk || "").toLowerCase().trim();
    if (!prefBHKRaw) {
      bhkScore = 10; // baseline if no BHK preference
    } else {
      const allBhkNums = (prefBHKRaw.match(/\d+(?:\.\d+)?/g) || []).map(n => parseFloat(n));
      let exactBhkMatched = false;
      let partialBhkMatched = false;

      if (propBHK > 0 && allBhkNums.length > 0) {
        exactBhkMatched = allBhkNums.some(n => Math.abs(n - propBHK) <= 0.1);
        if (!exactBhkMatched) {
          // 2.5 BHK vs 2 BHK or 3 BHK (difference <= 1.0) -> partial match
          partialBhkMatched = allBhkNums.some(n => Math.abs(n - propBHK) <= 1.0);
        }
      } else if (unitTypeStr) {
        exactBhkMatched = prefBHKRaw.includes('bungalow') || prefBHKRaw.includes('studio') ||
          prefBHKRaw.includes('commercial') || prefBHKRaw.includes(unitTypeStr.slice(0, 5));
      }

      if (exactBhkMatched) {
        bhkScore = 20;
      } else if (partialBhkMatched) {
        bhkScore = 10; // 10 points for close/adjacent BHK (e.g. 2.5 BHK property matched with 2 BHK tenant preference)
      } else {
        bhkScore = 0;
      }
    }

    const finalDistance = getDynamicDistance(property, tenant);

    const totalScore = locationScore + budgetScore + bhkScore;
    return {
      totalScore,
      locationScore,
      budgetScore,
      bhkScore,
      distance: finalDistance,
      locationMatch: locationScore >= 25,
      budgetMatch: budgetScore >= 35,
      bhkMatch: bhkScore > 0
    };
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 85) return 'bg-green-100 text-green-700';
    if (score >= 65) return 'bg-blue-100 text-blue-700';
    if (score >= 45) return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
  };

  const handleTenantSelection = (tenantId: number) => {
    setSelectedTenants(prev =>
      prev.includes(tenantId)
        ? prev.filter(id => id !== tenantId)
        : [...prev, tenantId]
    );
  };

  const handleSelectAll = (filteredList: any[]) => {
    if (selectedTenants.length === filteredList.length) {
      setSelectedTenants([]);
    } else {
      setSelectedTenants(filteredList.map(t => t.id));
    }
  };

  const handleSendToSelectedTenants = () => {
    if (selectedTenants.length === 0) {
      toast.error('Please select tenants to share property details');
      return;
    }
    const selectedObjs = tenants.filter(t => selectedTenants.includes(t.id));
    setShareTenants(selectedObjs);
    setShareModalOpen(true);
  };

  const handleWhatsApp = (tenant: Tenant) => {
    const rentText = formatCurrency(property.monthly_rent || 0);
    const message = `Hi ${tenant.name},\n\nI have a rental property that matches your search criteria!\n\n🏠 *${property.title}*\n📍 Location: ${property.location_name || property.location || ''}, ${property.city_name || property.city || ''}\n💰 Rent: ${rentText}/month\n🛏️ Bedrooms: ${property.bedrooms || ''} BHK\n\nLet me know if you would like to arrange a viewing.\n\nBest regards,\nProperty Team`;
    const cleanPhone = tenant.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('91') || cleanPhone.length > 10 ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmail = (tenant: Tenant) => {
    const rentText = formatCurrency(property.monthly_rent || 0);
    const subject = `Rental Property Match: ${property.title}`;
    const body = `Dear ${tenant.name},\n\nWe have found a rental property matching your preferences:\n\nProperty: ${property.title}\nLocation: ${property.location_name || property.location || ''}, ${property.city_name || property.city || ''}\nRent: ${rentText}/month\nBedrooms: ${property.bedrooms || ''} BHK\n\nPlease let us know if you want to schedule a visit.\n\nBest regards,\nProperty Team`;
    const mailtoUrl = `mailto:${tenant.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
  };

  // Compute matched items — filter by search term across all tenant fields
  const matchedTenantsList = tenants
    .map(tenant => {
      const match = getMatchDetails(tenant);
      return { ...tenant, ...match };
    })
    .filter(t => {
      const hasLoc = isLocationValid(t.preferred_location);
      const matchText = `${t.name} ${t.phone} ${t.email || ''} ${t.preferred_location} ${t.preferred_bhk || ''} ${t.tenant_type || ''} ${t.notes || ''}`.toLowerCase();
      return hasLoc && t.totalScore >= 30 && matchText.includes(searchTerm.toLowerCase().trim());
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  const getDisplayPropertyTitle = (prop: any) => {
    if (!prop) return 'Property';
    // unit_type (DB snake_case) or mapped unitType (camelCase) — e.g. "3.5BHK"
    const unitType = prop.unit_type || prop.unitType || '';
    const bhkStr = (prop.bedrooms && Number(prop.bedrooms) > 0)
      ? `${prop.bedrooms} BHK`
      : unitType;

    // If prop.title exists and doesn't start with "0 BHK", use it directly
    if (prop.title && !/^0\s*BHK/i.test(prop.title)) return prop.title;

    const subtypeStr = prop.property_subtype_name || prop.propertySubtype || prop.subtype || '';
    const typeStr = prop.property_type_name || prop.propertyType || prop.type || '';
    const socStr = prop.society_name || prop.society || prop.location_name || prop.location || '';

    const titleParts = [];
    if (bhkStr) titleParts.push(bhkStr);
    if (subtypeStr) titleParts.push(subtypeStr);
    else if (typeStr) titleParts.push(typeStr);
    if (socStr) titleParts.push(`in ${socStr}`);

    return titleParts.length > 0 ? titleParts.join(' ') : (prop.title || 'Property');
  };

  const StatCard = ({ label, value, color }: any) => (
    <div className="rounded-lg p-2 transition-all" style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
      <p className="text-[8px] font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className="text-base font-bold mt-0.5" style={{ color: N }}>{value}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2" style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }}>

        {/* Header */}
        <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: N }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ background: `${O}20` }}>
              <Target size={14} style={{ color: O }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Tenant Matching</h2>
              <p className="text-[9px] text-white/70">
                {getDisplayPropertyTitle(property)} - Find matching tenants
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors text-white">
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Property Summary */}
          <div className="rounded-lg p-2" style={{ background: `${O}10`, border: `1px solid ${O}20` }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div>
                <p className="text-[8px] font-semibold text-gray-500 uppercase">Property</p>
                <p className="font-bold truncate text-[11px]" style={{ color: N }}>{getDisplayPropertyTitle(property)}</p>
              </div>
              <div>
                <p className="text-[8px] font-semibold text-gray-500 uppercase">Location</p>
                <p className="font-bold truncate text-[11px]" style={{ color: N }}>{property?.location_name || property?.location}, {property?.city_name || property?.city}</p>
              </div>
              <div>
                <p className="text-[8px] font-semibold text-gray-500 uppercase">Unit • Rent</p>
                <p className="font-bold truncate text-[11px]" style={{ color: N }}>
                  {property?.unit_type || (property?.bedrooms ? `${property.bedrooms} BHK` : 'N/A')} • {formatCurrency(Number(property?.monthly_rent || 0))}/mo
                </p>
              </div>
              <div>
                <p className="text-[8px] font-semibold text-gray-500 uppercase">Tenant Preference</p>
                <p className="font-bold truncate text-[11px]" style={{ color: N }}>{property?.preferred_tenants || 'Any'}</p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatCard label="Excellent Match (85%+)" value={matchedTenantsList.filter(t => t.totalScore >= 85).length} color="#10b981" />
            <StatCard label="Good Match (65-84%)" value={matchedTenantsList.filter(t => t.totalScore >= 65 && t.totalScore < 85).length} color="#3b82f6" />
            <StatCard label="Potential Match (30-64%)" value={matchedTenantsList.filter(t => t.totalScore >= 30 && t.totalScore < 65).length} color={O} />
            <StatCard label="Total Candidates" value={matchedTenantsList.length} color="#8b5cf6" />
          </div>

          {/* Search bar + Share button row */}
          <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search matching tenants by name, location, contact, BHK..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-8 pl-8 pr-3 border rounded-lg text-xs focus:outline-none focus:border-orange-500"
                style={{ borderColor: BD }}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => handleSelectAll(matchedTenantsList)}
                className="h-8 px-3 rounded-lg border text-xs font-semibold hover:bg-slate-50 transition-colors"
                style={{ borderColor: BD, color: N }}
              >
                {selectedTenants.length === matchedTenantsList.length && matchedTenantsList.length > 0 ? 'Deselect All' : 'Select All'}
              </button>
              <button
                onClick={handleSendToSelectedTenants}
                disabled={selectedTenants.length === 0}
                className="h-8 px-3 rounded-lg text-white text-xs font-bold transition-all flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: O }}
              >
                <Send size={12} />
                <span>Share Details ({selectedTenants.length})</span>
              </button>
            </div>
          </div>

          {/* Tenants list header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold" style={{ color: N }}>Matched Tenants ({matchedTenantsList.length})</h3>
          </div>

          {/* Tenants list */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <Loader2 className="animate-spin text-orange-500" size={24} />
              <span className="text-xs">Finding matching tenants...</span>
            </div>
          ) : matchedTenantsList.length === 0 ? (
            <div className="py-8 text-center border border-dashed rounded-lg">
              <p className="text-xs text-gray-500">No matching tenants found.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[35vh] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
              {matchedTenantsList.map((tenant) => (
                <div
                  key={tenant.id}
                  className={`rounded-lg p-2.5 transition-all border ${selectedTenants.includes(tenant.id) ? 'ring-1 border-orange-300' : 'border-gray-200'}`}
                  style={{
                    background: selectedTenants.includes(tenant.id) ? `${O}05` : BG
                  }}
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={selectedTenants.includes(tenant.id)}
                      onChange={() => handleTenantSelection(tenant.id)}
                      className="mt-0.5 rounded w-3.5 h-3.5 flex-shrink-0"
                      style={{ accentColor: O }}
                    />

                    <div className="flex-1 min-w-0">
                      {/* Title row */}
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-[11.5px] font-bold" style={{ color: N }}>{tenant.name}</h4>
                          <span className="px-1 py-0.2 rounded text-[8px] bg-slate-200 text-slate-700 font-semibold">{tenant.tenant_type}</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${getMatchScoreColor(tenant.totalScore)}`}>
                            {tenant.totalScore}% Match ({tenant.totalScore}/100)
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {/* WhatsApp */}
                          <div className="relative group">
                            <button
                              onClick={() => handleWhatsApp(tenant)}
                              className="p-0.5 rounded hover:bg-gray-100"
                              style={{ color: '#25D366' }}
                            >
                              <FaWhatsapp size={11} />
                            </button>

                            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:block whitespace-nowrap rounded bg-gray-800 px-1.5 py-0.5 text-[9px] text-white z-50">
                              WhatsApp
                            </span>
                          </div>

                          {/* Email */}
                          <div className="relative group">
                            <button
                              onClick={() => handleEmail(tenant)}
                              className="p-0.5 rounded hover:bg-gray-100"
                              style={{ color: '#EA4335' }}
                            >
                              <Mail size={11} />
                            </button>

                            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:block whitespace-nowrap rounded bg-gray-800 px-1.5 py-0.5 text-[9px] text-white z-50">
                              Email
                            </span>
                          </div>

                          {/* Phone */}
                          <div className="relative group">
                            <button
                              className="p-0.5 rounded hover:bg-gray-100"
                              style={{ color: N }}
                            >
                              <Phone size={11} />
                            </button>

                            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:block whitespace-nowrap rounded bg-gray-800 px-1.5 py-0.5 text-[9px] text-white z-50">
                              Phone
                            </span>
                          </div>

                          {/* Expand / Collapse */}
                          <div className="relative group">
                            <button
                              onClick={() =>
                                setExpandedTenant(
                                  expandedTenant === tenant.id ? null : tenant.id
                                )
                              }
                              className="p-0.5 rounded hover:bg-gray-100"
                            >
                              {expandedTenant === tenant.id ? (
                                <ChevronUp size={11} style={{ color: MU }} />
                              ) : (
                                <ChevronDown size={11} style={{ color: MU }} />
                              )}
                            </button>

                            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:block whitespace-nowrap rounded bg-gray-800 px-1.5 py-0.5 text-[9px] text-white z-50">
                              {expandedTenant === tenant.id ? 'Collapse' : 'Expand'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Main info row */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[9.5px] text-gray-500 mb-1">
                        <span className="flex items-center gap-0.5"><IndianRupeeIcon size={9} />Budget: {formatCurrency(Number(tenant.budget_min))} - {formatCurrency(Number(tenant.budget_max))}</span>
                        {(() => {
                          const hasLoc = isLocationValid(tenant.preferred_location);
                          const hasDist = (tenant as any).distance !== null && (tenant as any).distance !== undefined && Number((tenant as any).distance) < 9000;

                          if (!hasLoc && !hasDist) return null;

                          return (
                            <span className="flex items-center gap-0.5">
                              <MapPin size={9} />
                              {hasLoc && <span>Prefers: {tenant.preferred_location}</span>}
                              {hasDist && (
                                <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold text-orange-700 bg-orange-50 border border-orange-200 inline-flex items-center gap-0.5">
                                  📍 {(tenant as any).distance === 0 ? '0.0' : (tenant as any).distance} km away
                                </span>
                              )}
                            </span>
                          );
                        })()}
                        <span className="font-semibold text-gray-600">BHK: {tenant.preferred_bhk || 'Any'}</span>
                      </div>

                      {/* Expanded Details */}
                      {expandedTenant === tenant.id && (
                        <div className="mt-2 pt-2 border-t border-gray-200 text-[9.5px] text-gray-600 space-y-1">
                          <p><strong>Phone:</strong> {tenant.phone} | <strong>Email:</strong> {tenant.email}</p>
                          {tenant.notes && <p className="italic bg-white p-1 rounded border border-gray-100">💬 "{tenant.notes}"</p>}
                          <div className="flex gap-2.5 mt-1 text-[8.5px]">
                            <span className="flex items-center gap-0.5"><CheckCircle size={9} className={tenant.locationMatch ? "text-green-500" : "text-gray-300"} /> Location: {tenant.locationScore ?? 0}/40</span>
                            <span className="flex items-center gap-0.5"><CheckCircle size={9} className={tenant.budgetMatch ? "text-green-500" : "text-gray-300"} /> Budget: {tenant.budgetScore ?? 0}/40</span>
                            <span className="flex items-center gap-0.5"><CheckCircle size={9} className={tenant.bhkMatch ? "text-green-500" : "text-gray-300"} /> BHK: {tenant.bhkScore ?? 0}/20</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 border-t flex items-center justify-between" style={{ borderColor: BD, background: BG }}>
          <span className="text-[10px]" style={{ color: MU }}>
            <strong className="text-slate-600">{matchedTenantsList.length}</strong> matched tenant(s) • <strong className="text-slate-600">{selectedTenants.length}</strong> selected
          </span>
          <button onClick={onClose} className="px-4 py-1.5 border rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors" style={{ borderColor: BD, color: N }}>
            Close
          </button>
        </div>
      </div>

      {shareModalOpen && (
        <PropertyShareModal
          isOpen={shareModalOpen}
          onClose={() => { setShareModalOpen(false); setShareTenants([]); setSelectedTenants([]); }}
          property={property}
          buyer={null}
          buyers={shareTenants}
        />
      )}
    </div>
  );
};

export default TenantMatchingModal;
