import React from 'react';
import { Building, MapPin, Link2, Loader2, MessageSquare, CalendarDays } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { getImageUrl } from '@/lib/helpers';
import { MatchedProperty } from './types';

interface TenantEnquiredPropertiesTabProps {
  enquiredProperties: MatchedProperty[];
  linkingId: number | string | null;
  onShareWhatsApp: (p: MatchedProperty) => void;
  onLinkProperty: (p: MatchedProperty) => void;
  onNavigateTab: (tab: string) => void;
}

export default function TenantEnquiredPropertiesTab({
  enquiredProperties,
  linkingId,
  onShareWhatsApp,
  onLinkProperty,
  onNavigateTab,
}: TenantEnquiredPropertiesTabProps) {
  return (
    <div className="space-y-3">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex-wrap gap-2">
        <div>
          <h2 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
            <MessageSquare size={18} className="text-orange-500" />
            <span>Enquired Rental Properties</span>
          </h2>
          <p className="text-[10px] text-gray-500 mt-0.5">
            Properties you have expressed interest in, requested callbacks for, or enquired about.
          </p>
        </div>
        <span className="px-3 py-1 bg-orange-50 text-orange-700 border border-orange-200 font-bold text-xs rounded-lg">
          {enquiredProperties.length} Active Enquiries
        </span>
      </div>

      {/* Grid of Enquired Properties */}
      {enquiredProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {enquiredProperties.map((p: MatchedProperty, idx: number) => {
            const imgUrl = getImageUrl(p.images?.[0] || p.photos?.[0] || p.mediaItems?.[0]?.file_path);
            const price = Number(p.monthly_rent || p.expected_rent || p.price || 0);
            const statusLabel = idx % 2 === 0 ? "Callback Scheduled" : "Enquiry Received";
            const statusColor = idx % 2 === 0 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200";

            return (
              <div key={`enquired-${p.id}`} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col">
                <div className="h-32 relative bg-gray-100">
                  {imgUrl ? (
                    <img src={imgUrl} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Building size={28} />
                    </div>
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white font-bold text-[8px]">
                    RENT-{p.id}
                  </span>
                  <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-md font-bold text-[9px] border ${statusColor}`}>
                    {statusLabel}
                  </span>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 truncate">
                      {p.title || p.property_type_name || `Rental Property #${p.id}`}
                    </h4>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                      <MapPin size={10} className="text-gray-400" />
                      <span className="truncate">{p.location_name || p.city_name || 'Location'}</span>
                    </div>
                    <div className="text-xs font-black text-emerald-600 mt-1.5">₹{price.toLocaleString('en-IN')}/mo</div>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => onShareWhatsApp(p)}
                      className="py-1.5 px-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] transition-colors flex items-center justify-center gap-1"
                    >
                      <SiWhatsapp size={11} />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      onClick={() => onNavigateTab('visits')}
                      className="py-1.5 px-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-slate-700 font-bold text-[10px] transition-colors flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <CalendarDays size={11} />
                      <span>Book Visit</span>
                    </button>
                  </div>

                  <button
                    onClick={() => onLinkProperty(p)}
                    disabled={linkingId === p.id}
                    className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-orange-500 text-white font-bold text-[10px] transition-colors flex items-center justify-center gap-1 mt-1"
                  >
                    {linkingId === p.id ? (
                      <Loader2 className="animate-spin" size={12} />
                    ) : (
                      <>
                        <Link2 size={12} />
                        <span>Link Lease Property</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center text-gray-400 italic border border-dashed border-gray-200 rounded-xl text-xs bg-white">
          No property enquiries recorded yet. Browse property matches to send an enquiry.
        </div>
      )}
    </div>
  );
}
