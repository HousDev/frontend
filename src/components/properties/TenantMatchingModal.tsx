import React, { useState, useEffect } from 'react';
import { X, Users, Target, Search, Star, Phone, MessageCircle, Mail, MapPin, ChevronDown, ChevronUp, IndianRupeeIcon, CheckCircle } from 'lucide-react';
import { tenantAPI } from '@/lib/tenantAPI';
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
      const data = await tenantAPI.getAll();
      setTenants(data || []);
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
  const getMatchDetails = (tenant: Tenant) => {
    let locationScore = 0;
    let budgetScore = 0;
    let bhkScore = 0;

    const propRent = property.monthly_rent || property.budget || 0;
    const propBHK = property.bedrooms || 0;
    const propLoc = (property.location || "").toLowerCase().trim();
    const propCity = (property.city || "").toLowerCase().trim();
    const propSoc = (property.society || "").toLowerCase().trim();

    // 1. Location Match (Weight: 40)
    const prefLocRaw = tenant.preferred_location || "";
    if (!prefLocRaw.trim()) {
      locationScore = 0; // no preference means 0
    } else {
      const prefLocs = prefLocRaw.toLowerCase().split(/[;,]+/).map(s => s.trim()).filter(Boolean);
      const hasMatch = prefLocs.some(loc =>
        propLoc.includes(loc) ||
        loc.includes(propLoc) ||
        propCity.includes(loc) ||
        propSoc.includes(loc)
      );
      if (hasMatch) {
        locationScore = 40;
      } else {
        // partial match if any word overlaps
        const words = prefLocs.flatMap(l => l.split(/\s+/));
        const partial = words.some(word => word.length > 2 && (propLoc.includes(word) || propSoc.includes(word)));
        locationScore = partial ? 20 : 0;
      }
    }

    // 2. Budget Match (Weight: 40)
    const tMin = Number(tenant.budget_min) || 0;
    const tMax = Number(tenant.budget_max) || 0;
    if (tMin === 0 && tMax === 0) {
      budgetScore = 0; // unspecified means 0
    } else if (propRent > 0) {
      if (tMin > 0 && tMax > 0) {
        if (propRent >= tMin && propRent <= tMax) {
          budgetScore = 40;
        } else {
          // Out of range but close
          const distMin = Math.abs(propRent - tMin) / tMin;
          const distMax = Math.abs(propRent - tMax) / tMax;
          const minDiff = Math.min(distMin, distMax);
          if (minDiff < 0.2) {
            budgetScore = Math.max(0, Math.round(40 * (1 - minDiff / 0.2)));
          }
        }
      } else if (tMax > 0 && propRent <= tMax) {
        budgetScore = 40;
      } else if (tMin > 0 && propRent >= tMin) {
        budgetScore = 40;
      }
    }

    // 3. BHK Match (Weight: 20)
    const prefBHKRaw = (tenant.preferred_bhk || "").toLowerCase().trim();
    if (!prefBHKRaw) {
      bhkScore = 0; // no BHK preference means 0
    } else if (propBHK > 0) {
      // e.g. "3 bhk", "3", "3bhk"
      const matchNum = prefBHKRaw.match(/\d+/);
      const tenantBhkNum = matchNum ? parseInt(matchNum[0], 10) : 0;
      if (tenantBhkNum === propBHK) {
        bhkScore = 20;
      } else if (prefBHKRaw.includes(String(propBHK))) {
        bhkScore = 20;
      }
    }

    const totalScore = locationScore + budgetScore + bhkScore;
    return {
      totalScore,
      locationMatch: locationScore > 0,
      budgetMatch: budgetScore > 0,
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
    const message = `Hi ${tenant.name},\n\nI have a rental property that matches your search criteria!\n\n🏠 *${property.title}*\n📍 Location: ${property.location || ''}, ${property.city || ''}\n💰 Rent: ${rentText}/month\n🛏️ Bedrooms: ${property.bedrooms || ''} BHK\n\nLet me know if you would like to arrange a viewing.\n\nBest regards,\nProperty Team`;
    const cleanPhone = tenant.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('91') || cleanPhone.length > 10 ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmail = (tenant: Tenant) => {
    const rentText = formatCurrency(property.monthly_rent || 0);
    const subject = `Rental Property Match: ${property.title}`;
    const body = `Dear ${tenant.name},\n\nWe have found a rental property matching your preferences:\n\nProperty: ${property.title}\nLocation: ${property.location || ''}, ${property.city || ''}\nRent: ${rentText}/month\nBedrooms: ${property.bedrooms || ''} BHK\n\nPlease let us know if you want to schedule a visit.\n\nBest regards,\nProperty Team`;
    const mailtoUrl = `mailto:${tenant.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
  };

  // Compute matched items
  const matchedTenantsList = tenants
    .map(tenant => {
      const match = getMatchDetails(tenant);
      return { ...tenant, ...match };
    })
    .filter(t => {
      const matchText = `${t.name} ${t.phone} ${t.preferred_location} ${t.notes || ''}`.toLowerCase();
      return t.totalScore >= 45 && matchText.includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => b.totalScore - a.totalScore);

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
              <p className="text-[9px] text-white/70">{property?.title} - Find matching tenants</p>
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
                <p className="font-bold truncate text-[11px]" style={{ color: N }}>{property?.title}</p>
              </div>
              <div>
                <p className="text-[8px] font-semibold text-gray-500 uppercase">Location</p>
                <p className="font-bold truncate text-[11px]" style={{ color: N }}>{property?.location}, {property?.city}</p>
              </div>
              <div>
                <p className="text-[8px] font-semibold text-gray-500 uppercase">BHK • Rent</p>
                <p className="font-bold truncate text-[11px]" style={{ color: N }}>{property?.bedrooms} BHK • {formatCurrency(property?.monthly_rent)}/mo</p>
              </div>
              <div>
                <p className="text-[8px] font-semibold text-gray-500 uppercase">Tenant Preference</p>
                <p className="font-bold truncate text-[11px]" style={{ color: N }}>{property?.preferred_tenants || 'Any'}</p>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search matching tenants by name, location, contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent"
                style={{ borderColor: BD }}
              />
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatCard label="Excellent Match (85%+)" value={matchedTenantsList.filter(t => t.totalScore >= 85).length} color="#10b981" />
            <StatCard label="Good Match (65-84%)" value={matchedTenantsList.filter(t => t.totalScore >= 65 && t.totalScore < 85).length} color="#3b82f6" />
            <StatCard label="Potential Match (45-64%)" value={matchedTenantsList.filter(t => t.totalScore >= 45 && t.totalScore < 65).length} color={O} />
            <StatCard label="Total Candidates" value={matchedTenantsList.length} color="#8b5cf6" />
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
                            {tenant.totalScore}% Match
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
                        <span className="flex items-center gap-0.5"><MapPin size={9} />Prefers: {tenant.preferred_location || 'Any'}</span>
                        <span className="font-semibold text-gray-600">BHK: {tenant.preferred_bhk || 'Any'}</span>
                      </div>

                      {/* Expanded Details */}
                      {expandedTenant === tenant.id && (
                        <div className="mt-2 pt-2 border-t border-gray-200 text-[9.5px] text-gray-600 space-y-1">
                          <p><strong>Phone:</strong> {tenant.phone} | <strong>Email:</strong> {tenant.email}</p>
                          {tenant.notes && <p className="italic bg-white p-1 rounded border border-gray-100">💬 "{tenant.notes}"</p>}
                          <div className="flex gap-2.5 mt-1 text-[8.5px]">
                            <span className="flex items-center gap-0.5"><CheckCircle size={9} className="text-green-500" /> Location score: {tenant.locationMatch ? 'Match (40)' : 'No Match (0)'}</span>
                            <span className="flex items-center gap-0.5"><CheckCircle size={9} className="text-green-500" /> Budget score: {tenant.budgetMatch ? 'Match (40)' : 'No Match (0)'}</span>
                            <span className="flex items-center gap-0.5"><CheckCircle size={9} className="text-green-500" /> BHK score: {tenant.bhkMatch ? 'Match (20)' : 'No Match (0)'}</span>
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
