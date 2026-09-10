import React from 'react';
import {
  Building2, MessageSquare, Calendar, DollarSign, ArrowUpRight,
  TrendingUp, Phone, CheckCircle2, Clock, Plus, ExternalLink,
  ChevronRight, Shield, MapPin, UserCheck
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { getImageUrl } from '@/lib/helpers';

interface OwnerOverviewTabProps {
  owner: any;
  properties: any[];
  inquiries: any[];
  visits: any[];
  onNavigateTab: (tabId: string) => void;
  onOpenLinkModal: () => void;
  onOpenEditModal: () => void;
}

export const OwnerOverviewTab: React.FC<OwnerOverviewTabProps> = ({
  owner,
  properties,
  inquiries,
  visits,
  onNavigateTab,
  onOpenLinkModal,
  onOpenEditModal,
}) => {
  // Calculations
  const totalRentPotential = properties.reduce(
    (sum, p) => sum + (Number(p.monthly_rent || p.expected_rent || p.rent) || 0),
    0
  );

  const occupiedCount = properties.filter(
    (p) => String(p.status || '').toLowerCase() === 'rented' || String(p.availability_status || '').toLowerCase() === 'rented'
  ).length;

  const vacantCount = properties.length - occupiedCount;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 🌟 Compact Welcome & KPI Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0f2b3d] via-[#163e58] to-[#1e5274] text-white p-4 sm:p-5 shadow-sm">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-orange-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-orange-300 text-[11px] font-semibold mb-1">
              <Building2 size={11} className="text-orange-400" />
              <span>Owner Real Estate Portfolio</span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
              Welcome, {owner?.salutation || 'Mr.'} {owner?.name || 'Property Owner'}! 👋
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Live tracking for rental properties, prospective inquiries, visits, and cash flow.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenLinkModal}
              className="px-3 py-1.5 rounded-xl bg-[#e67e22] hover:bg-[#d35400] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus size={13} />
              <span>Link Property</span>
            </button>
            <button
              onClick={() => onNavigateTab('properties')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Building2 size={13} />
              <span>Assets ({properties.length})</span>
            </button>
          </div>
        </div>

        {/* Dynamic Metric Cards within Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <div className="flex items-center justify-between text-slate-300 text-[11px] font-medium">
              <span>Total Properties</span>
              <Building2 size={14} className="text-orange-400" />
            </div>
            <div className="text-xl font-black text-white mt-0.5">{properties.length}</div>
            <div className="text-[10px] text-slate-300 mt-0.5 flex items-center gap-1">
              <span className="text-emerald-300 font-semibold">{vacantCount} Available</span>
              <span>•</span>
              <span className="text-slate-300">{occupiedCount} Rented</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <div className="flex items-center justify-between text-slate-300 text-[11px] font-medium">
              <span>Tenant Inquiries</span>
              <MessageSquare size={14} className="text-blue-400" />
            </div>
            <div className="text-xl font-black text-white mt-0.5">{inquiries.length}</div>
            <div className="text-[10px] text-blue-200 mt-0.5">Verified Contacts</div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <div className="flex items-center justify-between text-slate-300 text-[11px] font-medium">
              <span>Site Visits</span>
              <Calendar size={14} className="text-purple-400" />
            </div>
            <div className="text-xl font-black text-white mt-0.5">{visits.length}</div>
            <div className="text-[10px] text-purple-200 mt-0.5">Scheduled Tours</div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 border border-white/10">
            <div className="flex items-center justify-between text-slate-300 text-[11px] font-medium">
              <span>Monthly Potential</span>
              <DollarSign size={14} className="text-emerald-400" />
            </div>
            <div className="text-xl font-black text-emerald-300 mt-0.5">
              ₹{totalRentPotential.toLocaleString('en-IN')}
            </div>
            <div className="text-[10px] text-emerald-200 mt-0.5">Expected Monthly Rent</div>
          </div>
        </div>
      </div>

      {/* 📊 Two-Column Grid: Recent Inquiries & Scheduled Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Card: Recent Inquiries */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <MessageSquare size={14} />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900">Recent Tenant Inquiries</h3>
                  <p className="text-[10px] text-gray-500">Interested tenants contacting for your properties</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('inquiries')}
                className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All ({inquiries.length})</span>
                <ChevronRight size={12} />
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {inquiries.length === 0 ? (
                <div className="py-6 text-center text-gray-400 text-xs">
                  <MessageSquare className="w-7 h-7 mx-auto mb-1.5 text-gray-300 opacity-60" />
                  <p className="font-medium text-gray-600 text-xs">No tenant inquiries yet.</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">When tenants unlock contact or request visits, they appear here.</p>
                </div>
              ) : (
                inquiries.slice(0, 3).map((inq: any, idx: number) => (
                  <div
                    key={inq.id || idx}
                    className="p-2.5 rounded-xl border border-gray-100 hover:border-orange-200 bg-gray-50/60 hover:bg-orange-50/20 transition-all flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {inq.tenant_name?.charAt(0)?.toUpperCase() || 'T'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs text-slate-900 truncate">
                            {inq.tenant_name || 'Prospective Tenant'}
                          </h4>
                          <span className="px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] font-bold">
                            Verified
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 truncate mt-0.5">
                          {inq.tenant_type || 'Tenant'} • Prefers {inq.preferred_bhk || '1/2 BHK'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {inq.tenant_phone && (
                        <>
                          <a
                            href={`https://wa.me/${String(inq.tenant_phone).replace(/\D/g, '')}?text=Hi ${inq.tenant_name}, this is ${owner?.name} regarding your inquiry.`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 transition-all cursor-pointer"
                            title="WhatsApp"
                          >
                            <SiWhatsapp size={12} />
                          </a>
                          <a
                            href={`tel:${inq.tenant_phone}`}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all cursor-pointer"
                            title="Call"
                          >
                            <Phone size={12} />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Card: Scheduled Visits */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Calendar size={14} />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-900">Upcoming Site Visits</h3>
                  <p className="text-[10px] text-gray-500">Scheduled property inspections with tenants</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('visits')}
                className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All ({visits.length})</span>
                <ChevronRight size={12} />
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {visits.length === 0 ? (
                <div className="py-6 text-center text-gray-400 text-xs">
                  <Calendar className="w-7 h-7 mx-auto mb-1.5 text-gray-300 opacity-60" />
                  <p className="font-medium text-gray-600 text-xs">No scheduled visits yet.</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">When tenants book a site inspection, appointment details appear here.</p>
                </div>
              ) : (
                visits.slice(0, 3).map((v: any, idx: number) => (
                  <div
                    key={v.id || idx}
                    className="p-2.5 rounded-xl border border-gray-100 hover:border-purple-200 bg-gray-50/60 hover:bg-purple-50/20 transition-all flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-black text-[10px] flex flex-col items-center justify-center shrink-0 leading-tight">
                        <span>{v.visit_date ? new Date(v.visit_date).getDate() : '--'}</span>
                        <span className="text-[7px] font-normal uppercase">
                          {v.visit_date ? new Date(v.visit_date).toLocaleString('default', { month: 'short' }) : 'Date'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs text-slate-900 truncate">
                            {v.tenant_name || 'Tenant Visit'}
                          </h4>
                          <span className="px-1.5 py-0.2 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[8px] font-bold">
                            {v.visit_time || '11:00 AM'}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 truncate mt-0.5">
                          {v.rental_property_title || v.rental_property_society || 'Rental Property'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {v.tenant_phone && (
                        <a
                          href={`tel:${v.tenant_phone}`}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all cursor-pointer"
                          title="Call"
                        >
                          <Phone size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🏢 Properties Quick Grid Section */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs p-4">
        <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <Building2 size={14} />
            </div>
            <div>
              <h3 className="font-bold text-xs text-slate-900">My Rental Assets</h3>
              <p className="text-[10px] text-gray-500">Managed apartments, villas, and commercial spaces</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenLinkModal}
              className="px-2.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <Plus size={12} />
              <span>Link Property</span>
            </button>
            <button
              onClick={() => onNavigateTab('properties')}
              className="text-xs font-bold text-gray-600 hover:text-slate-900 flex items-center gap-0.5 px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight size={12} />
            </button>
          </div>
        </div>

        <div className="mt-3">
          {properties.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs">
              <Building2 className="w-8 h-8 mx-auto mb-1.5 text-gray-300 opacity-60" />
              <p className="font-semibold text-gray-700 text-xs">No rental properties linked yet</p>
              <p className="text-gray-400 text-[11px] mt-0.5 max-w-sm mx-auto">
                Link your rental properties to track inquiries, schedule visits, and view rent revenue directly from your dashboard.
              </p>
              <button
                onClick={onOpenLinkModal}
                className="mt-3 px-3 py-1.5 rounded-xl bg-[#0f2b3d] text-white text-xs font-bold hover:bg-slate-800 transition-all inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} />
                <span>Link First Property</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {properties.slice(0, 4).map((prop: any) => {
                const rentVal = Number(prop.monthly_rent || prop.expected_rent || prop.rent) || 0;
                const img = prop.images?.[0] || prop.property_image;
                return (
                  <div
                    key={prop.id}
                    className="group rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-xs transition-all overflow-hidden bg-white flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-28 bg-slate-100 overflow-hidden">
                        {img ? (
                          <img
                            src={getImageUrl(img)}
                            alt={prop.title || prop.society_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-slate-50">
                            <Building2 size={24} className="opacity-40 mb-1" />
                            <span className="text-[9px] font-semibold">No Photo</span>
                          </div>
                        )}
                        <div className="absolute top-2 left-2">
                          <span className="px-1.5 py-0.5 rounded bg-[#0f2b3d]/90 backdrop-blur-md text-white font-bold text-[9px]">
                            {prop.unit_type || prop.bhk_type || 'Residential'}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold text-[9px] shadow-sm">
                            ● Available
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 space-y-1">
                        <h4 className="font-bold text-xs text-slate-900 truncate">
                          {prop.society_name || prop.title || 'Rental Property'}
                        </h4>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 truncate">
                          <MapPin size={10} className="text-gray-400 shrink-0" />
                          <span>{prop.location || prop.city || 'Pune'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 pt-0 border-t border-gray-100 flex items-center justify-between mt-1">
                      <div>
                        <div className="text-[9px] text-gray-400 font-semibold">Monthly Rent</div>
                        <div className="text-xs font-black text-orange-600">
                          ₹{rentVal.toLocaleString('en-IN')}<span className="text-[9px] font-normal text-gray-500">/mo</span>
                        </div>
                      </div>
                      <a
                        href={`/properties/${prop.slug || prop.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 text-[10px] font-bold border border-gray-200 flex items-center gap-1 transition-all"
                      >
                        <span>View</span>
                        <ExternalLink size={10} />
                      </a>
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

export default OwnerOverviewTab;
