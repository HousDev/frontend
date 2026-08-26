import React, { useState, useEffect, useMemo } from 'react';
import { Users, MessageCircle, Phone, Mail, User, Target, Eye, Flame, Loader2 } from 'lucide-react';
import { buyerAPI } from '@/lib/buyerAPI';
import { tenantAPI } from '@/lib/tenantAPI';
import { FaWhatsapp } from 'react-icons/fa6';
import { toast } from 'react-toastify';

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

interface BuyersTabProps {
  property: any;
  onMatchBuyers: () => void;
}

const BuyersTab: React.FC<BuyersTabProps> = ({
  property,
  onMatchBuyers
}) => {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (isRental) {
          const res = await tenantAPI.getAll();
          setList(res || []);
        } else {
          const res = await buyerAPI.getAll();
          const arr = Array.isArray(res) ? res : (res?.data || []);
          setList(arr);
        }
      } catch (err) {
        console.error("Failed to load match database:", err);
      } finally {
        setLoading(false);
      }
    };
    if (property?.id) {
      fetchData();
    }
  }, [property?.id, isRental]);

  const matchedList = useMemo(() => {
    if (!property || !list.length) return [];

    // Helper inside matchedList to parse and resolve locations for buyers/tenants
    const getLocStr = (item: any): string => {
      if (item.location && typeof item.location === 'string' && item.location.trim()) return item.location.trim();
      if (item.preferred_location && typeof item.preferred_location === 'string' && item.preferred_location.trim()) return item.preferred_location.trim();
      if (item.locations && typeof item.locations === 'string' && item.locations.trim()) return item.locations.trim();
      let req = item.requirements;
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
      if (item.city && typeof item.city === 'string' && item.city.trim()) return item.city.trim();
      return '';
    };

    // Helper inside matchedList to parse and resolve BHK/Unit types
    const getBhkStr = (item: any): string => {
      if (item.preferred_bhk && typeof item.preferred_bhk === 'string' && item.preferred_bhk.trim()) return item.preferred_bhk.trim();
      if (item.unit_type && typeof item.unit_type === 'string' && item.unit_type.trim()) return item.unit_type.trim();
      let req = item.requirements;
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

    const NEAR_MAP: Record<string, string[]> = {
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

    const propPrice = isRental
      ? (property.monthly_rent || property.expected_rent || property.budget || 0)
      : (() => {
          const v = Number(property.budget) || Number(property.finalPrice) || Number(property.final_price) || Number(property.price) || Number(property.expected_price) || 0;
          return Number.isFinite(v) && v > 0 ? v : 0;
        })();

    const propBHK = Number(property.bedrooms) || (property.title?.match(/(\d+)\s*bhk/i)?.[1] ? parseInt(property.title.match(/(\d+)\s*bhk/i)[1], 10) : 0);
    const propUnitType = (property.unitType || property.property_type || property.property_type_name || property.title || '').toLowerCase().trim();
    const propLoc = (property.location || property.society || property.society_name || property.address || '').toLowerCase().trim();
    const propCity = (property.city || '').toLowerCase().trim();

    return list.map((item: any) => {
      let locationScore = 0;
      let budgetScore = 0;
      let bhkScore = 0;

      const itemLocRaw = getLocStr(item);
      const itemBhkRaw = getBhkStr(item);

      // 1. Location Match (Weight: 40)
      if (!itemLocRaw) {
        locationScore = 15;
      } else {
        const itemLocs = itemLocRaw.toLowerCase().split(/[;,]+/).map((s: any) => s.trim()).filter(Boolean);
        const hasExactMatch = itemLocs.some((loc: any) =>
          propLoc.includes(loc) ||
          loc.includes(propLoc) ||
          (propCity && loc.includes(propCity))
        );

        if (hasExactMatch) {
          locationScore = 40;
        } else {
          let isNearby = false;
          for (const loc of itemLocs) {
            for (const [keyLoc, adjList] of Object.entries(NEAR_MAP)) {
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
            const words = itemLocs.flatMap((l: any) => l.split(/\s+/));
            const partial = words.some((word: any) => word.length > 2 && propLoc.includes(word));
            locationScore = partial ? 20 : (item.city && propCity && item.city.toLowerCase() === propCity ? 15 : 10);
          }
        }
      }

      // 2. Budget Match (Weight: 40)
      const tMin = Number(item.budget_min || item.budget?.min) || 0;
      const tMax = Number(item.budget_max || item.budget?.max) || 0;
      if (tMin === 0 && tMax === 0) {
        budgetScore = 20;
      } else if (propPrice > 0) {
        if (tMin > 0 && tMax > 0) {
          if (propPrice >= tMin && propPrice <= tMax) {
            budgetScore = 40;
          } else {
            const diff = Math.min(Math.abs(propPrice - tMin), Math.abs(propPrice - tMax));
            const tolerance = tMax * 0.2;
            if (diff <= tolerance) budgetScore = 25;
            else budgetScore = 10;
          }
        } else if (tMax > 0 && propPrice <= tMax) {
          budgetScore = 40;
        } else if (tMin > 0 && propPrice >= tMin) {
          budgetScore = 40;
        }
      }

      // 3. BHK Match (Weight: 20)
      if (!itemBhkRaw) {
        bhkScore = 10;
      } else {
        const prefBhkLower = itemBhkRaw.toLowerCase();
        let matched = false;

        if (propBHK > 0 && (prefBhkLower.includes(`${propBHK}bhk`) || prefBhkLower.includes(`${propBHK} bhk`) || prefBhkLower.includes(String(propBHK)))) {
          matched = true;
        }

        if (propUnitType) {
          if (propUnitType.includes('commercial') && prefBhkLower.includes('commercial')) matched = true;
          if (propUnitType.includes('flat') || propUnitType.includes('apartment') || propUnitType.includes('residential')) {
            if (prefBhkLower.includes('bhk') || prefBhkLower.includes('apartment') || prefBhkLower.includes('flat')) matched = true;
          }
        }

        if (matched) {
          bhkScore = 20;
        } else {
          bhkScore = 10;
        }
      }

      const totalScore = Math.min(100, locationScore + budgetScore + bhkScore);

      return {
        ...item,
        displayLocation: itemLocRaw || 'Any Location',
        displayBHK: itemBhkRaw || 'Any BHK / Type',
        matchScore: totalScore,
      };
    })
    .filter((item: any) => {
      // Threshold 35 for both to keep modal counts and list counts completely identical!
      return item.matchScore >= 35;
    })
    .sort((a: any, b: any) => b.matchScore - a.matchScore);
  }, [list, property, isRental]);

  const visitsCount = useMemo(() => {
    if (!property) return 0;
    return Array.isArray(property.visitHistory) 
      ? property.visitHistory.length 
      : (Array.isArray(property.activities) 
          ? property.activities.filter((a: any) => a.activity_type === 'Site Visit' || a.type === 'visit').length 
          : 0);
  }, [property]);

  const formatINRShort = (amount: number | string) => {
    const num = Number(amount);
    if (!num && num !== 0) return '-';
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const propPriceDisplay = useMemo(() => {
    const v = Number(property?.monthly_rent) || Number(property?.expected_rent) ||
      Number(property?.budget) || Number(property?.final_price) || Number(property?.price) || 0;
    return Number.isFinite(v) && v > 0 ? v : 0;
  }, [property]);

  const handleWhatsApp = (item: any) => {
    const phone = String(item.whatsapp || item.phone || '').replace(/\D/g, '');
    if (!phone) { toast.error('No phone number available'); return; }
    const priceStr = propPriceDisplay > 0 ? formatINRShort(propPriceDisplay) + (isRental ? '/mo' : '') : 'Contact for Price';
    const message = `Hi ${item.name},\n\nI found a matching property for you!\n\n🏠 *${property.title || (isRental ? 'Rental Property' : 'Property') + ' #' + property.id}*\n📍 Location: ${property.location || property.society_name || 'Pune'}\n💰 ${priceStr}\n⭐ Match Score: ${item.matchScore}%\n\nLet me know if you would like to schedule a site visit.\n\nBest regards,\nResaleExpert Team`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCall = (item: any) => {
    const phone = String(item.phone || '').replace(/\D/g, '');
    if (!phone) { toast.error('Phone not available'); return; }
    window.open(`tel:${phone}`);
  };

  const handleEmail = (item: any) => {
    if (!item.email) { toast.error('Email not available'); return; }
    const priceStr = propPriceDisplay > 0 ? formatINRShort(propPriceDisplay) : 'Contact for Price';
    const subject = encodeURIComponent(`Property Match: ${property.title || '#' + property.id}`);
    const body = encodeURIComponent(`Hi ${item.name},\n\nI found a matching property for you!\n📍 ${property.location || ''}, ${property.city || ''}\n💰 ${priceStr}\n⭐ Match Score: ${item.matchScore}%`);
    window.open(`mailto:${item.email}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="space-y-3">
      {/* Matching Header Section */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: BD }}>
        <div className="p-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
          <div className="flex flex-row items-center justify-between gap-2">
            <h3 className="text-[11px] font-semibold" style={{ color: N }}>
              {isRental ? 'Tenant Matching' : 'Buyer Matching'}
            </h3>

            <button
              onClick={onMatchBuyers}
              className="px-2 py-1.5 sm:py-2 rounded-md text-[11px] sm:text-[12px] text-white whitespace-nowrap transition-all hover:opacity-90"
              style={{ background: O }}
            >
              {isRental ? 'Find Matching Tenants' : 'Find Matching Buyers'}
            </button>
          </div>
        </div>

        <div className="p-3">
          {loading ? (
            <div className="flex items-center justify-center py-4 text-gray-400 gap-1.5">
              <Loader2 className="animate-spin text-orange-500" size={16} />
              <span className="text-[11px]">Finding matches...</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {/* Interested - Green */}
              <div className="rounded-lg p-2 text-center transition-all hover:shadow-sm" style={{ background: '#10b98110', border: '1px solid #10b98120' }}>
                <div className="text-lg font-bold" style={{ color: '#10b981' }}>{matchedList.length}</div>
                <div className="text-[10px] font-medium" style={{ color: '#10b981' }}>
                  {isRental ? 'Interested Tenant' : 'Interested Buyer'}
                </div>
              </div>
              
              {/* Hot Leads - Red */}
              <div className="rounded-lg p-2 text-center transition-all hover:shadow-sm" style={{ background: '#ef444410', border: '1px solid #ef444420' }}>
                <div className="text-lg font-bold" style={{ color: '#ef4444' }}>
                  {matchedList.filter((x: any) => x.matchScore >= 75).length}
                </div>
                <div className="text-[10px] font-medium" style={{ color: '#ef4444' }}>Hot Leads</div>
              </div>
              
              {/* Property Visits - Blue */}
              <div className="rounded-lg p-2 text-center transition-all hover:shadow-sm" style={{ background: '#3b82f610', border: '1px solid #3b82f620' }}>
                <div className="text-lg font-bold" style={{ color: '#3b82f6' }}>{visitsCount}</div>
                <div className="text-[10px] font-medium" style={{ color: '#3b82f6' }}>Property Visits</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Matched List Section */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: BD }}>
        <div className="p-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
          <h3 className="text-[11px] font-semibold" style={{ color: N }}>
            {isRental ? 'Matched Tenants' : 'Matched Buyers'}
          </h3>
          <p className="text-[9px] mt-0.5" style={{ color: MU }}>
            {isRental ? 'Tenants who match this property' : 'Buyers who match this property'}
          </p>
        </div>

        <div className="p-3">
          <div className="space-y-2 max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {loading ? (
              <div className="text-center py-6 text-gray-400">Loading matched list...</div>
            ) : matchedList.length > 0 ? (
              matchedList.map((item: any, index: number) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-2 rounded-lg" style={{ background: BG, border: `1px solid ${BD}` }}>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${O}15` }}>
                      <User size={12} style={{ color: O }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold truncate" style={{ color: N }}>
                        {item.name}
                      </div>
                      <div className="text-[9px]" style={{ color: MU }}>
                        Budget: {formatINRShort(item.budget_min || item.budget?.min || 0)} - {formatINRShort(item.budget_max || item.budget?.max || 0)} • <span className="font-medium" style={{ color: O }}>{item.matchScore}% match</span>
                      </div>
                    </div>
                  </div>
                  {/* Action buttons: WhatsApp | Call | Email */}
                  <div className="flex items-center gap-1 ml-10 sm:ml-0 flex-shrink-0">
                    <button
                      onClick={() => handleWhatsApp(item)}
                      className="p-1.5 rounded-lg hover:bg-green-50 transition-colors"
                      title="WhatsApp"
                    >
                      <FaWhatsapp size={14} className="text-green-600" />
                    </button>
                    <button
                      onClick={() => handleCall(item)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Call"
                    >
                      <Phone size={13} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleEmail(item)}
                      className="p-1.5 rounded-lg hover:bg-purple-50 transition-colors"
                      title="Email"
                    >
                      <Mail size={13} className="text-purple-600" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 rounded-lg" style={{ background: BG, border: `1px solid ${BD}` }}>
                <Users size={24} style={{ color: MU }} className="mx-auto mb-1.5" />
                <p className="text-[10px]" style={{ color: MU }}>
                  {isRental ? 'No matched tenants yet' : 'No matched buyers yet'}
                </p>
                <p className="text-[8px] mt-0.5" style={{ color: MU }}>
                  {isRental ? "Click 'Find Matching Tenants' to get started" : "Click 'Find Matching Buyers' to get started"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyersTab;