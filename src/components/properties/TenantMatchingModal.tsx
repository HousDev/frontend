import React, { useState, useEffect } from 'react';
import { X, Users, Target, Search, Star, Phone, MessageCircle, Mail, MapPin, ChevronDown, ChevronUp, IndianRupeeIcon, CheckCircle } from 'lucide-react';
import { tenantAPI } from '@/lib/tenantAPI';
import { api } from '@/lib/api';
import { toast } from 'react-toastify';
import { FaWhatsapp } from 'react-icons/fa6';

// Theme Colors matching Resale / Rental portal
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

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

const PUNE_LOCALITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'pimple saudagar': { lat: 18.5987, lng: 73.7932 },
  'wakad': { lat: 18.5986, lng: 73.7661 },
  'baner': { lat: 18.5590, lng: 73.7868 },
  'balewadi': { lat: 18.5789, lng: 73.7707 },
  'aundh': { lat: 18.5602, lng: 73.8031 },
  'kalewadi': { lat: 18.6083, lng: 73.7915 },
  'tathawade': { lat: 18.6186, lng: 73.7516 },
  'hinjewadi': { lat: 18.5912, lng: 73.7389 },
  'pashan': { lat: 18.5419, lng: 73.7925 },
  'kothrud': { lat: 18.5074, lng: 73.8077 },
  'bavdhan': { lat: 18.5158, lng: 73.7813 },
  'kharadi': { lat: 18.5515, lng: 73.9349 },
  'viman nagar': { lat: 18.5679, lng: 73.9143 },
  'wagholi': { lat: 18.5808, lng: 73.9787 },
  'hadapsar': { lat: 18.5089, lng: 73.9260 },
  'magarpatta': { lat: 18.5158, lng: 73.9272 },
  'amanora': { lat: 18.5190, lng: 73.9335 },
  'pimpri': { lat: 18.6298, lng: 73.7997 },
  'chinchwad': { lat: 18.6251, lng: 73.7868 },
  'rahatani': { lat: 18.5956, lng: 73.7864 },
  'ambegaon': { lat: 18.4550, lng: 73.8427 },
  'anand nagar': { lat: 18.4833, lng: 73.8333 },
};

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
  // Convert straight-line air distance to realistic urban driving road distance (~1.55x in Pune)
  const roadDistance = airDistance < 2.0 ? airDistance * 1.35 : airDistance * 1.55;
  return parseFloat(roadDistance.toFixed(1));
}

function getLocalityKm(propLoc: string, tenantLocStr: string): number | null {
  if (!propLoc || !tenantLocStr) return null;
  const pLower = propLoc.toLowerCase();
  
  let pCoord = null;
  for (const [name, coord] of Object.entries(PUNE_LOCALITY_COORDS)) {
    if (pLower.includes(name)) { pCoord = coord; break; }
  }
  if (!pCoord) return null;

  const tLocs = tenantLocStr.toLowerCase().split(/[;,]+/).map(s => s.trim());
  let minKm: number | null = null;

  for (const tLoc of tLocs) {
    for (const [name, coord] of Object.entries(PUNE_LOCALITY_COORDS)) {
      if (tLoc.includes(name)) {
        const d = calculateHaversineKm(pCoord.lat, pCoord.lng, coord.lat, coord.lng);
        if (minKm === null || d < minKm) minKm = d;
      }
    }
  }
  return minKm;
}

const TenantMatchingModal: React.FC<TenantMatchingModalProps> = ({ isOpen, onClose, property }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTenants, setSelectedTenants] = useState<number[]>([]);
  const [expandedTenant, setExpandedTenant] = useState<number | null>(null);

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
    if (!prefLocRaw.trim()) {
      locationScore = 15; // give baseline if tenant has no location preference
    } else {
      const prefLocs = prefLocRaw.toLowerCase().split(/[;,]+/).map(s => s.trim()).filter(Boolean);
      
      // Clean locality strings by removing city name ("pune", "mumbai" etc) for exact locality comparison
      const cleanLocs = prefLocs.map(l => l.replace(/,?\s*(pune|mumbai|pcmc|maharashtra).*/i, '').trim()).filter(Boolean);

      // Check exact locality/society match
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
      } else if (tenant.distance != null && tenant.distance <= 5.0) {
        // High accuracy location match via Haversine distance coordinates
        if (tenant.distance <= 2.0) locationScore = 40;
        else if (tenant.distance <= 5.0) locationScore = 25;
      } else {
        // Check adjacent/nearby localities
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

        let isNearby = false;
        for (const loc of cleanLocs) {
          for (const [keyLoc, adjList] of Object.entries(NEARBY_MAP)) {
            if (propLoc.includes(keyLoc) || keyLoc.includes(propLoc)) {
              if (adjList.some(adj => loc.includes(adj) || adj.includes(loc))) {
                isNearby = true;
                break;
              }
            }
          }
          if (isNearby) break;
        }

        if (isNearby) {
          locationScore = 25;
        } else {
          // City-level match only (e.g. Magarpatta vs Pimple Saudagar in Pune)
          const isSameCity = propCity && prefLocs.some(l => l.includes(propCity));
          locationScore = isSameCity ? 10 : 0;
        }
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

    const calcKm = getLocalityKm(propLoc || propSoc, prefLocRaw);
    const finalDistance = tenant.distance != null ? tenant.distance : calcKm;

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
      toast.info('Please select tenants to send property details');
      return;
    }
    toast.success(`Rental property details sent to ${selectedTenants.length} tenant(s)`);
    setSelectedTenants([]);
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
      const matchText = `${t.name} ${t.phone} ${t.email || ''} ${t.preferred_location} ${t.preferred_bhk || ''} ${t.tenant_type || ''} ${t.notes || ''}`.toLowerCase();
      return t.totalScore >= 30 && matchText.includes(searchTerm.toLowerCase().trim());
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  const getDisplayPropertyTitle = (prop: any) => {
    if (!prop) return 'Property';
    const bhkStr = (prop.bedrooms && Number(prop.bedrooms) > 0)
      ? `${prop.bedrooms}BHK`
      : (prop.unit_type || prop.unitType || '');
      
    const subtypeStr = prop.property_subtype_name || prop.propertySubtype || '';
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

          {/* Search bar — Place below statistics cards */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search matching tenants by name, location, contact, BHK..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent"
                style={{ borderColor: BD }}
              />
            </div>
          </div>

          {/* Tenants list header */}
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold" style={{ color: N }}>Matched Tenants ({matchedTenantsList.length})</h3>
            <div className="flex items-center gap-2">
              {selectedTenants.length > 0 && (
                <button
                  onClick={handleSendToSelectedTenants}
                  className="px-2 py-0.5 text-[9px] rounded text-white flex items-center gap-1 transition-all hover:opacity-90"
                  style={{ background: O }}
                >
                  <span>Send to {selectedTenants.length} Tenant(s)</span>
                </button>
              )}
              <button
                onClick={() => handleSelectAll(matchedTenantsList)}
                className="text-[10px] font-semibold"
                style={{ color: O }}
              >
                {selectedTenants.length === matchedTenantsList.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          {/* Tenants list */}
          {loading ? (
            <div className="py-8 flex justify-center items-center">
              <span className="text-xs text-gray-500">Loading matched tenants...</span>
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
                        <span className="flex items-center gap-0.5">
                          <MapPin size={9} />
                          Prefers: {tenant.preferred_location || 'Any'}
                          {(tenant as any).distance != null && (tenant as any).distance < 900 && (
                            <span className="ml-1 px-1 py-0.2 rounded text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-200">
                              📍 {(tenant as any).distance} km away
                            </span>
                          )}
                        </span>
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
          <div className="text-[10px]" style={{ color: MU }}>
            {matchedTenantsList.length} matching tenant(s) • {selectedTenants.length} selected
          </div>
          <div className="flex gap-1.5">
            <button onClick={onClose} className="px-3 py-1 text-xs border rounded transition-colors hover:bg-gray-50 font-semibold" style={{ borderColor: BD, color: N }}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantMatchingModal;
