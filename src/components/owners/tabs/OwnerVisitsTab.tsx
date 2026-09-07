import React, { useState, useMemo } from 'react';
import {
  Calendar, Clock, MapPin, Phone, Building2, User,
  CheckCircle2, AlertCircle, XCircle, ChevronRight, ExternalLink
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';

interface OwnerVisitsTabProps {
  visits: any[];
  ownerName?: string;
}

export const OwnerVisitsTab: React.FC<OwnerVisitsTabProps> = ({
  visits,
  ownerName = 'Owner',
}) => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  const filteredVisits = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return visits.filter((v) => {
      const vDate = v.visit_date ? String(v.visit_date).split('T')[0] : '';
      if (filter === 'upcoming') return vDate >= today;
      if (filter === 'completed') return vDate < today;
      return true;
    });
  }, [visits, filter]);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 📅 Filter Pill Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Calendar size={16} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Site Inspections & Tours</h3>
            <p className="text-[11px] text-gray-500">Appointments scheduled by interested tenants</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {[
            { id: 'all', label: `All (${visits.length})` },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'completed', label: 'Past' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === f.id
                  ? 'bg-[#0f2b3d] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 📋 Visits List */}
      {filteredVisits.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center shadow-xs">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300 opacity-60" />
          <h3 className="font-bold text-slate-800 text-sm">No site visits found</h3>
          <p className="text-gray-400 text-xs mt-1 max-w-sm mx-auto">
            When tenants schedule an in-person or virtual property visit, the appointment schedule and contact details will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredVisits.map((v: any, idx: number) => {
            const vDate = v.visit_date ? new Date(v.visit_date) : new Date();
            const dateStr = vDate.toLocaleDateString('en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={v.id || idx}
                className="bg-white rounded-2xl border border-gray-200/90 hover:border-purple-300 hover:shadow-md transition-all p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 min-w-0">
                  {/* Date Badge */}
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-200/80 text-purple-800 flex flex-col items-center justify-center shrink-0">
                    <span className="text-base font-black leading-none">{vDate.getDate()}</span>
                    <span className="text-[10px] font-bold uppercase mt-0.5">
                      {vDate.toLocaleString('default', { month: 'short' })}
                    </span>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 truncate">
                        {v.rental_property_title || v.rental_property_society || 'Property Site Inspection'}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-extrabold text-[10px] flex items-center gap-1">
                        <Clock size={11} />
                        <span>{v.visit_time || '11:00 AM'}</span>
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 flex items-center gap-1.5">
                      <User size={12} className="text-gray-400 shrink-0" />
                      <span className="font-semibold text-slate-800">{v.tenant_name || 'Prospective Tenant'}</span>
                      {v.tenant_type && <span>({v.tenant_type})</span>}
                    </p>

                    <p className="text-[11px] text-gray-400">{dateStr}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                  {v.tenant_phone && (
                    <>
                      <a
                        href={`https://wa.me/${String(v.tenant_phone).replace(/\D/g, '')}?text=Hi ${v.tenant_name}, this is ${ownerName} regarding your scheduled visit on ${dateStr} at ${v.visit_time || '11:00 AM'}.`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <SiWhatsapp size={13} />
                        <span>WhatsApp</span>
                      </a>
                      <a
                        href={`tel:${v.tenant_phone}`}
                        className="px-3 py-2 rounded-xl bg-[#0f2b3d] hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Phone size={13} />
                        <span>Call</span>
                      </a>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OwnerVisitsTab;
