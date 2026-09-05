import React, { useState, useMemo } from 'react';
import {
  MessageSquare, Search, Filter, Phone, Mail, User,
  Calendar, CheckCircle2, Clock, Copy, Shield, Sparkles,
  ArrowUpRight, Building2, MapPin
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { toast } from 'react-toastify';

interface OwnerInquiriesTabProps {
  inquiries: any[];
  ownerName?: string;
}

export const OwnerInquiriesTab: React.FC<OwnerInquiriesTabProps> = ({
  inquiries,
  ownerName = 'Owner',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        (inq.tenant_name || '').toLowerCase().includes(q) ||
        (inq.tenant_phone || '').includes(q) ||
        (inq.preferred_bhk || '').toLowerCase().includes(q) ||
        (inq.notes || '').toLowerCase().includes(q) ||
        (inq.society_name || '').toLowerCase().includes(q);

      const tType = String(inq.tenant_type || '').toLowerCase();
      const matchType =
        typeFilter === 'all' ||
        (typeFilter === 'family' && tType.includes('family')) ||
        (typeFilter === 'bachelor' && tType.includes('bachelor'));

      return matchSearch && matchType;
    });
  }, [inquiries, searchTerm, typeFilter]);

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    toast.success(`Copied phone number: ${phone}`);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 🔍 Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search inquiries by name, phone, BHK, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 bg-gray-50/50"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: `All Inquiries (${inquiries.length})` },
            { id: 'family', label: 'Family' },
            { id: 'bachelor', label: 'Bachelor' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setTypeFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                typeFilter === f.id
                  ? 'bg-[#0f2b3d] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 📋 Inquiries List */}
      {filteredInquiries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center shadow-xs">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300 opacity-60" />
          <h3 className="font-bold text-slate-800 text-sm">No tenant inquiries found</h3>
          <p className="text-gray-400 text-xs mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'No inquiries match your current search filters.'
              : 'Prospective tenants who view or request visits for your properties will be listed here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInquiries.map((inq: any, idx: number) => {
            const dateStr = inq.created_at
              ? new Date(inq.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Recent';

            return (
              <div
                key={inq.id || idx}
                className="bg-white rounded-2xl border border-gray-200/90 hover:border-orange-300 hover:shadow-md transition-all p-4.5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                        {inq.tenant_name?.charAt(0)?.toUpperCase() || 'T'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 leading-tight">
                            {inq.tenant_name || 'Prospective Tenant'}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold">
                            Verified Lead
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Inquired on {dateStr}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-bold">
                      {inq.tenant_type || 'Family'}
                    </span>
                  </div>

                  {/* Inquired Property Banner */}
                  {(inq.society_name || inq.rental_property_title) && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 text-xs font-bold truncate">
                      <Building2 size={13} className="text-orange-600 shrink-0" />
                      <span className="truncate">Property: {inq.society_name || inq.rental_property_title}</span>
                    </div>
                  )}

                  {/* Requirements Strip */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-gray-50 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-medium">BHK Preference</span>
                      <span className="font-bold text-slate-800">{inq.preferred_bhk || '2 BHK / 3 BHK'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-medium">Expected Move-in</span>
                      <span className="font-bold text-slate-800">{inq.move_in_date ? new Date(inq.move_in_date).toLocaleDateString() : 'Immediate'}</span>
                    </div>
                  </div>

                  {inq.notes && (
                    <div className="text-xs text-gray-600 bg-amber-50/60 border border-amber-100 p-2.5 rounded-xl">
                      <span className="font-semibold text-amber-900">Tenant Note: </span>
                      {inq.notes}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div className="text-xs text-gray-500 font-medium">
                    {inq.tenant_phone ? inq.tenant_phone : 'Phone verified'}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {inq.tenant_phone && (
                      <>
                        <button
                          onClick={() => handleCopyPhone(inq.tenant_phone)}
                          className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 transition-all cursor-pointer"
                          title="Copy Phone"
                        >
                          <Copy size={13} />
                        </button>
                        <a
                          href={`https://wa.me/${String(inq.tenant_phone).replace(/\D/g, '')}?text=Hello ${inq.tenant_name}, this is ${ownerName}. I received your inquiry for my rental property at ${inq.society_name || inq.rental_property_title || 'our listing'}. Let me know when you would like to connect.`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <SiWhatsapp size={13} />
                          <span>WhatsApp</span>
                        </a>
                        <a
                          href={`tel:${inq.tenant_phone}`}
                          className="px-3 py-1.5 rounded-xl bg-[#0f2b3d] hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Phone size={13} />
                          <span>Call</span>
                        </a>
                      </>
                    )}
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

export default OwnerInquiriesTab;
