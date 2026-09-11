import React, { useState, useEffect } from 'react';
import {
  HeartHandshake, CheckCircle2, Building2,
  PhoneCall, Loader2, Check, X, RefreshCw, Users,
  Flame, Eye, BadgeCheck, Info
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { toast } from 'react-toastify';
import { tenantAPI } from '@/lib/tenantAPI';
import { TenantOwnerInterest } from '../tenant-account/types';

interface OwnerApplicantsTabProps {
  ownerId?: number | string;
  ownerName?: string;
  onRefresh?: () => void;
}

function TenantProfileModal({ tenant, loading, onClose }: { tenant: any; loading: boolean; onClose: () => void; }) {
  if (!tenant) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[88vh]">
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#0b3856] to-[#184d6e] text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-sm">
              {(tenant.name || 'T').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-extrabold text-sm">{tenant.name || 'Tenant'}</h3>
              <p className="text-[10px] text-slate-300">{tenant.tenant_id || 'TEN' + String(tenant.id || '').padStart(4, '0')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition cursor-pointer"><X size={15} /></button>
        </div>
        <div className="overflow-y-auto p-4 space-y-3.5 text-xs">
          {loading ? (
            <div className="flex items-center justify-center py-10 gap-2 text-slate-500">
              <Loader2 size={16} className="animate-spin text-orange-500" />
              <span>Loading full profile...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Full Name', val: tenant.name },
                  { label: 'Phone', val: tenant.phone || tenant.tenant_phone },
                  { label: 'Email', val: tenant.email },
                  { label: 'Tenant Type', val: tenant.tenant_type },
                ].map(({ label, val }) => (
                  <div key={label} className="space-y-0.5">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">{label}</span>
                    <span className="font-extrabold text-slate-900 text-[10.5px]">{val || '—'}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-extrabold text-[10px] uppercase text-slate-700 tracking-wider flex items-center gap-1">
                  <BadgeCheck size={12} className="text-orange-500" /> Preferences
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'BHK Preference', val: tenant.preferred_bhk },
                    { label: 'Budget', val: tenant.budget_max ? 'Rs.' + Number(tenant.budget_max).toLocaleString('en-IN') + '/mo' : null },
                    { label: 'Move-in Date', val: tenant.move_in_date },
                    { label: 'Preferred Location', val: tenant.preferred_location },
                    { label: 'Monthly Income', val: tenant.monthly_income ? 'Rs.' + Number(tenant.monthly_income).toLocaleString('en-IN') : null },
                    { label: 'Occupation', val: tenant.occupation_type },
                    { label: 'Food', val: tenant.food_preference },
                    { label: 'Pets', val: tenant.has_pets },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <span className="text-[9px] text-gray-400 font-semibold uppercase block">{label}</span>
                      <span className="font-bold text-slate-800 text-[10.5px]">{val || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
              {tenant.notes && (
                <p className="text-[10px] text-slate-600 italic bg-amber-50 border border-amber-100 px-2.5 py-1.5 rounded-lg">{tenant.notes}</p>
              )}
            </>
          )}
        </div>
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 rounded-xl bg-[#0b3856] text-white text-xs font-bold hover:bg-[#072438] transition cursor-pointer">Close Profile</button>
        </div>
      </div>
    </div>
  );
}

export const OwnerApplicantsTab: React.FC<OwnerApplicantsTabProps> = ({ ownerId, ownerName = 'Owner', onRefresh }) => {
  const [interestsList, setInterestsList] = useState<TenantOwnerInterest[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [selectedTenantForProfile, setSelectedTenantForProfile] = useState<any>(null);
  const [fetchingFullTenant, setFetchingFullTenant] = useState(false);

  const fetchInterests = async () => {
    if (!ownerId) return;
    setLoading(true);
    try {
      const res = await tenantAPI.getOwnerInterests(ownerId);
      if (res?.success && Array.isArray(res.data)) {
        setInterestsList(res.data);
      }
    } catch (e) { console.warn('Could not load owner interests:', e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchInterests(); }, [ownerId]);

  const handleOpenProfile = async (rawTenant: any) => {
    const targetId = rawTenant.tenant_id || rawTenant.id;
    setSelectedTenantForProfile(rawTenant);
    if (targetId) {
      try {
        setFetchingFullTenant(true);
        const res = await tenantAPI.getById(targetId);
        const full = res?.data || res?.tenant || res;
        if (full && typeof full === 'object') {
          setSelectedTenantForProfile((prev: any) => ({ ...prev, ...full }));
        }
      } catch (e) { console.warn('Error fetching full tenant profile:', e); }
      finally { setFetchingFullTenant(false); }
    }
  };

  const handleConfirmCandidate = async (interestId: number) => {
    if (!ownerId) return;
    setActionLoadingId(interestId);
    try {
      const res = await tenantAPI.ownerConfirmTenant(interestId, ownerId);
      if (res?.success) { toast.success(res.message || 'Candidate confirmed!'); await fetchInterests(); onRefresh?.(); }
      else toast.error(res?.message || 'Failed to confirm candidate');
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Failed to confirm candidate'); }
    finally { setActionLoadingId(null); }
  };

  const handleRejectCandidate = async (interestId: number) => {
    if (!window.confirm('Reject this candidate application?')) return;
    setActionLoadingId(interestId);
    try {
      const res = await tenantAPI.ownerRejectTenant(interestId);
      if (res?.success) { toast.info(res.message || 'Candidate rejected.'); await fetchInterests(); onRefresh?.(); }
      else toast.error(res?.message || 'Failed to reject candidate');
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Failed to reject candidate'); }
    finally { setActionLoadingId(null); }
  };

  const pendingCount = interestsList.filter(i => !['OWNER_CONFIRMED', 'TENANT_ACCEPTED', 'OWNER_REJECTED', 'TENANT_DECLINED'].includes(i.status || '')).length;
  const confirmedCount = interestsList.filter(i => i.status === 'OWNER_CONFIRMED' || i.status === 'TENANT_ACCEPTED').length;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0b3856] via-[#10344d] to-[#184d6e] p-4 rounded-xl text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center text-orange-400 shrink-0">
            <HeartHandshake size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm sm:text-base text-white">Tenant Applications</h2>
              <span className="px-2 py-0.5 rounded bg-orange-500 text-white text-[9px] font-black uppercase tracking-wider">Interest Requests</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">Tenants who expressed interest in your rental properties.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-right">
            <span className="text-[9px] text-slate-300 block font-medium uppercase tracking-wider">Total</span>
            <span className="text-sm font-black text-amber-300">{interestsList.length} Applicants</span>
          </div>
          <button onClick={fetchInterests} disabled={loading} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 transition cursor-pointer disabled:opacity-50" title="Refresh">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stats */}
      {interestsList.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl border bg-slate-100 text-slate-800 border-slate-200 flex items-center gap-2.5">
            <Users size={14} className="text-slate-600 shrink-0" />
            <div><div className="text-lg font-black">{interestsList.length}</div><div className="text-[10px] opacity-75">Total Applicants</div></div>
          </div>
          <div className="p-3 rounded-xl border bg-amber-50 text-amber-800 border-amber-200 flex items-center gap-2.5">
            <Info size={14} className="text-amber-500 shrink-0" />
            <div><div className="text-lg font-black">{pendingCount}</div><div className="text-[10px] opacity-75">Pending Review</div></div>
          </div>
          <div className="p-3 rounded-xl border bg-emerald-50 text-emerald-800 border-emerald-200 flex items-center gap-2.5">
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            <div><div className="text-lg font-black">{confirmedCount}</div><div className="text-[10px] opacity-75">Confirmed</div></div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-2 text-slate-500">
          <Loader2 size={18} className="animate-spin text-orange-500" />
          <span className="text-sm font-medium">Loading applicants...</span>
        </div>
      )}

      {/* Empty */}
      {!loading && interestsList.length === 0 && (
        <div className="py-16 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 text-orange-400 flex items-center justify-center mx-auto">
            <HeartHandshake size={28} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm">No Applicants Yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">When tenants express interest in your properties, their applications will appear here.</p>
          </div>
        </div>
      )}

      {/* Cards */}
      {!loading && interestsList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {interestsList.map((item: any) => {
            const isConfirmed = item.status === 'OWNER_CONFIRMED';
            const isAccepted = item.status === 'TENANT_ACCEPTED' || item.status === 'BOOKING_PENDING';
            const isSelectedOthers = item.status === 'PROPERTY_SELECTED';
            const isRejected = item.status === 'OWNER_REJECTED' || item.status === 'TENANT_DECLINED';
            const isPending = !isConfirmed && !isAccepted && !isSelectedOthers && !isRejected;
            const phone = item.tenant_phone || '';
            const tenantName = item.tenant_name || 'Tenant Applicant';
            const propTitle = item.society_name ? (item.unit_type || '2 BHK') + ' at ' + item.society_name : 'Property #' + item.rental_property_id;

            return (
              <div key={'applicant-' + item.id} className={`rounded-2xl border p-4 flex flex-col gap-3 transition-all ${isConfirmed ? 'bg-gradient-to-br from-emerald-50 to-white border-emerald-400 shadow-md ring-2 ring-emerald-400/20' : isAccepted ? 'bg-indigo-50/40 border-indigo-200' : isRejected ? 'bg-rose-50/40 border-rose-200 opacity-70' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}`}>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-900 to-slate-800 text-white font-black text-sm flex items-center justify-center shrink-0">
                      {tenantName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-extrabold text-sm text-slate-900 truncate">{tenantName}</h4>
                        {item.match_score != null && (
                          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-0.5 shrink-0">
                            <Flame size={9} className="text-blue-500" /> {item.match_score}% Match
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500">{item.occupation_type || 'Salaried'}{item.company_name ? ' - ' + item.company_name : ''}</p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {isConfirmed ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white flex items-center gap-1"><CheckCircle2 size={11} /> Confirmed</span>
                    ) : isAccepted ? (
                      <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">Tenant Accepted!</span>
                    ) : isSelectedOthers ? (
                      <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-100 text-amber-800 border border-amber-300">In Reserve</span>
                    ) : isRejected ? (
                      <span className="px-2 py-0.5 rounded-full text-[9.5px] font-medium bg-rose-100 text-rose-700 border border-rose-200">Rejected</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Pending Review</span>
                    )}
                  </div>
                </div>

                {/* Property */}
                <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Building2 size={12} className="text-orange-500 shrink-0" />
                    <span className="font-bold text-[11px] text-slate-800 truncate">{propTitle}</span>
                  </div>
                  <span className="font-mono text-[9px] font-extrabold px-1.5 py-0.5 bg-slate-900 text-white rounded shrink-0">RENT-{item.rental_property_id}</span>
                </div>

                {/* Profile Snapshot */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
                  {[
                    { label: 'Type', val: item.tenant_type || 'Family' },
                    { label: 'Income', val: item.monthly_income ? 'Rs.' + Number(item.monthly_income).toLocaleString('en-IN') : 'Any' },
                    { label: 'Food', val: item.food_preference || 'Any' },
                    { label: 'Pets', val: item.has_pets || 'No' },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <span className="text-[8.5px] text-gray-400 font-semibold uppercase block">{label}</span>
                      <span className="font-bold text-slate-800 text-[10.5px]">{val}</span>
                    </div>
                  ))}
                </div>

                {item.message && (
                  <p className="text-[10px] text-slate-600 italic bg-amber-50/60 p-2 rounded-lg border border-amber-100">"{item.message}"</p>
                )}

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    {phone && (
                      <>
                        <a href={'https://wa.me/91' + String(phone).replace(/\D/g, '') + '?text=' + encodeURIComponent('Hi ' + tenantName + '! Application received for ' + propTitle + '. Match: ' + item.match_score + '%. Lets discuss!')} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                          <SiWhatsapp size={11} /><span>WhatsApp</span>
                        </a>
                        <a href={'tel:' + phone} className="px-2.5 py-1 rounded-lg bg-[#0b3856] hover:bg-[#072438] text-white text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                          <PhoneCall size={11} /><span>Call</span>
                        </a>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <button type="button" onClick={() => handleOpenProfile(item)} className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 border border-slate-200 hover:border-orange-200 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer">
                      <Eye size={11} /><span>View Profile</span>
                    </button>
                    {isPending && (
                      <>
                        <button type="button" disabled={actionLoadingId === item.id} onClick={() => handleConfirmCandidate(item.id)} className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm transition cursor-pointer disabled:opacity-50">
                          {actionLoadingId === item.id ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}<span>Confirm Candidate</span>
                        </button>
                        <button type="button" disabled={actionLoadingId === item.id} onClick={() => handleRejectCandidate(item.id)} className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 text-[10px] font-medium transition cursor-pointer disabled:opacity-50">
                          Reject
                        </button>
                      </>
                    )}
                    {isConfirmed && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md">? Confirmed & Waiting Acceptance</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedTenantForProfile && (
        <TenantProfileModal tenant={selectedTenantForProfile} loading={fetchingFullTenant} onClose={() => setSelectedTenantForProfile(null)} />
      )}
    </div>
  );
};

export default OwnerApplicantsTab;
