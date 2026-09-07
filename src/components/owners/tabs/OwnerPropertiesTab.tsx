import React, { useState, useMemo } from 'react';
import {
  Building2, Search, Filter, Plus, MapPin, ExternalLink,
  Shield, CheckCircle2, AlertCircle, Clock, Home, ArrowUpRight,
  Eye, Share2, DollarSign, Layers
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { getImageUrl } from '@/lib/helpers';
import { toast } from 'react-toastify';

interface OwnerPropertiesTabProps {
  properties: any[];
  onOpenLinkModal: () => void;
  onRefresh?: () => void;
}

export const OwnerPropertiesTab: React.FC<OwnerPropertiesTabProps> = ({
  properties,
  onOpenLinkModal,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const matchSearch =
        !searchTerm.trim() ||
        (p.society_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.unit_type || '').toLowerCase().includes(searchTerm.toLowerCase());

      const st = String(p.status || p.availability_status || '').toLowerCase();
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'available' && (st.includes('avail') || st === '' || st.includes('active'))) ||
        (statusFilter === 'rented' && st.includes('rent'));

      return matchSearch && matchStatus;
    });
  }, [properties, searchTerm, statusFilter]);

  const handleShareProperty = (prop: any) => {
    const url = `${window.location.origin}/properties/${prop.slug || prop.id}`;
    const text = `Check out this rental property: ${prop.society_name || prop.title} - ${prop.unit_type || 'Apartment'} for rent at ₹${Number(prop.monthly_rent || prop.expected_rent || 0).toLocaleString('en-IN')}/mo.\nLink: ${url}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 🏷️ Top Action & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by society, BHK, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-gray-50/50"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'all', label: `All (${properties.length})` },
              { id: 'available', label: 'Available' },
              { id: 'rented', label: 'Rented' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === f.id
                    ? 'bg-[#0f2b3d] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onOpenLinkModal}
          className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
        >
          <Plus size={14} />
          <span>Link New Property</span>
        </button>
      </div>

      {/* 🏢 Properties Grid */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center shadow-xs">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300 opacity-60" />
          <h3 className="font-bold text-slate-800 text-sm">No properties found</h3>
          <p className="text-gray-400 text-xs mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'No rental properties match your search query. Try searching with different keywords.'
              : 'You have not linked any rental properties to your owner profile yet.'}
          </p>
          <button
            onClick={onOpenLinkModal}
            className="mt-4 px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            <span>Link Rental Property</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProperties.map((prop) => {
            const rentVal = Number(prop.monthly_rent || prop.expected_rent || prop.rent) || 0;
            const depositVal = Number(prop.security_deposit || prop.deposit) || rentVal * 2;
            const img = prop.images?.[0] || prop.property_image;
            const isRented = String(prop.status || prop.availability_status || '').toLowerCase().includes('rent');

            return (
              <div
                key={prop.id}
                className="group bg-white rounded-2xl border border-gray-200/90 hover:border-orange-300 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Property Image Header */}
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    {img ? (
                      <img
                        src={getImageUrl(img)}
                        alt={prop.title || prop.society_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-slate-50">
                        <Building2 size={36} className="opacity-40 mb-1" />
                        <span className="text-[10px] font-semibold">No Property Photo</span>
                      </div>
                    )}

                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-[#0f2b3d]/90 backdrop-blur-md text-white font-black text-[10px] tracking-wide shadow-sm">
                        {prop.unit_type || prop.bhk_type || 'Residential'}
                      </span>
                      {prop.furnishing_status && (
                        <span className="px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur-md text-slate-800 font-bold text-[9px] shadow-sm">
                          {prop.furnishing_status}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black shadow-sm ${
                          isRented
                            ? 'bg-purple-600 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        ● {isRented ? 'Rented' : 'Available'}
                      </span>
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 leading-snug truncate group-hover:text-orange-600 transition-colors">
                        {prop.society_name || prop.title || 'Rental Apartment'}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 truncate">
                        <MapPin size={12} className="text-gray-400 shrink-0" />
                        <span>{prop.location || prop.city || 'Pune'}</span>
                      </div>
                    </div>

                    {/* Features Strip */}
                    <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl bg-gray-50 text-[11px] text-gray-600 font-medium">
                      <div>
                        <span className="text-[9px] text-gray-400 block font-normal">Carpet Area</span>
                        <span className="font-bold text-slate-800">{prop.carpet_area || prop.super_builtup_area || '950'} sq.ft</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 block font-normal">Floor</span>
                        <span className="font-bold text-slate-800">{prop.floor_number || '4th'} of {prop.total_floors || '12'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 block font-normal">Deposit</span>
                        <span className="font-bold text-slate-800">₹{depositVal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Rent & Actions */}
                <div className="p-4 pt-0">
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 font-semibold block leading-tight">Monthly Rent</span>
                      <div className="text-base font-black text-orange-600">
                        ₹{rentVal.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-gray-500">/mo</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleShareProperty(prop)}
                        className="p-2 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 transition-all cursor-pointer"
                        title="Share on WhatsApp"
                      >
                        <SiWhatsapp size={13} />
                      </button>
                      <a
                        href={`/properties/${prop.slug || prop.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-[#0f2b3d] hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span>View</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OwnerPropertiesTab;
