import React, { useState } from 'react';
import {
  X, User, Phone, Mail, MapPin, Building, Calendar, Edit,
  Home, Banknote, FileText, CheckCircle2, Clock, AlertCircle,
  Users2, UserCheck, Eye, StickyNote,
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';

interface Tenant {
  id: number;
  tenant_id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  preferred_location: string;
  budget_min: string | number;
  budget_max: string | number;
  preferred_bhk: string;
  tenant_type: string;
  move_in_date?: string;
  current_address?: string;
  notes?: string;
  status: string;
  rental_property_id?: number | string | null;
  property_title?: string;
  owner_name?: string;
  assigned_to?: number | string;
  assigned_to_name?: string;
  created_at?: string;
}

interface TenantViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant | null;
  onEdit?: (tenant: Tenant) => void;
}

const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  'Active Search':    { bg: 'bg-green-100',  text: 'text-green-700',  icon: <CheckCircle2 size={12} /> },
  'Interested':       { bg: 'bg-blue-100',   text: 'text-blue-700',   icon: <AlertCircle size={12} /> },
  'Agreement Signed': { bg: 'bg-purple-100', text: 'text-purple-700', icon: <CheckCircle2 size={12} /> },
  'Inactive':         { bg: 'bg-gray-100',   text: 'text-gray-500',   icon: <Clock size={12} /> },
};

type Tab = 'overview' | 'requirements' | 'notes';

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2 py-2 border-b border-gray-100 last:border-0">
      <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wide flex-shrink-0">{label}</span>
      <span className="text-xs font-semibold text-gray-800 text-right">{value}</span>
    </div>
  );
}

export default function TenantViewModal({ isOpen, onClose, tenant, onEdit }: TenantViewModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  if (!isOpen || !tenant) return null;

  const statusCfg = statusConfig[tenant.status] ?? statusConfig['Inactive'];
  const budgetMin = Number(tenant.budget_min);
  const budgetMax = Number(tenant.budget_max);
  const hasBudget = budgetMin > 0 || budgetMax > 0;
  const fmtINR = (n: number) => (n > 0 ? `\u20b9${n.toLocaleString('en-IN')}` : '\u2014');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview',     label: 'Overview',     icon: <Home size={14} /> },
    { id: 'requirements', label: 'Requirements', icon: <Building size={14} /> },
    { id: 'notes',        label: 'Notes & Remarks', icon: <StickyNote size={14} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-200 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header matching TenantFormModal style */}
        <div className="px-4 py-3 bg-[#0f2b3d] flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <div className="w-7 h-7 rounded-full bg-orange-500/20 text-[#e67e22] flex items-center justify-center font-bold text-xs">
              {tenant.name?.charAt(0)?.toUpperCase() || 'T'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{tenant.name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
                  {tenant.tenant_id}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${statusCfg.bg} ${statusCfg.text}`}>
              {statusCfg.icon} {tenant.status}
            </span>
            <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-gray-100 bg-gray-50/70 px-4 pt-2 space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-t-lg transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-orange-500 bg-white text-orange-600 shadow-xs'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs" style={{ scrollbarWidth: 'thin' }}>
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50/60 rounded-xl p-4 border border-gray-100 space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-1">
                    Contact & Category
                  </h4>
                  <DetailRow label="Phone" value={tenant.phone || '—'} />
                  <DetailRow label="Email" value={tenant.email || '—'} />
                  <DetailRow label="WhatsApp" value={tenant.whatsapp || tenant.phone || '—'} />
                  <DetailRow label="Category" value={tenant.tenant_type || '—'} />
                </div>

                <div className="bg-gray-50/60 rounded-xl p-4 border border-gray-100 space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-1">
                    Search & Budget
                  </h4>
                  <DetailRow label="Preferred BHK" value={tenant.preferred_bhk || '—'} />
                  <DetailRow label="Preferred Location" value={tenant.preferred_location || 'Any Location'} />
                  <DetailRow label="Budget Range" value={
                    hasBudget ? `${fmtINR(budgetMin)} – ${fmtINR(budgetMax)}` : 'Not set'
                  } />
                  <DetailRow label="Move-In Date" value={
                    tenant.move_in_date
                      ? new Date(tenant.move_in_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'
                  } />
                </div>
              </div>

              {tenant.rental_property_id && (
                <div className="bg-orange-50/40 rounded-xl p-4 border border-orange-100">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-orange-600 mb-2">
                    Linked Rental Property
                  </h4>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-800">{tenant.property_title || `RENT-${tenant.rental_property_id}`}</span>
                    {tenant.owner_name && <span className="text-gray-500">Owner: {tenant.owner_name}</span>}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requirements' && (
            <div className="bg-gray-50/60 rounded-xl p-4 border border-gray-100 space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-1">
                Property Criteria
              </h4>
              <DetailRow label="Preferred BHK" value={tenant.preferred_bhk || '—'} />
              <DetailRow label="Target Location" value={tenant.preferred_location || 'Any Location'} />
              <DetailRow label="Min Rent" value={fmtINR(budgetMin)} />
              <DetailRow label="Max Rent" value={fmtINR(budgetMax)} />
              <DetailRow label="Move-In Date" value={
                tenant.move_in_date
                  ? new Date(tenant.move_in_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '—'
              } />
              <DetailRow label="Executive" value={tenant.assigned_to_name || 'Unassigned'} />
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="bg-gray-50/60 rounded-xl p-4 border border-gray-100 space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-1">
                  Notes & Remarks
                </h4>
                {tenant.notes ? (
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{tenant.notes}</p>
                ) : (
                  <p className="text-xs text-gray-400 italic">No notes added.</p>
                )}
              </div>

              {tenant.current_address && (
                <div className="bg-gray-50/60 rounded-xl p-4 border border-gray-100 space-y-1">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Current Address</h4>
                  <p className="text-xs text-gray-700">{tenant.current_address}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {tenant.phone && (
              <a
                href={`https://wa.me/${tenant.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                title="WhatsApp"
              >
                <SiWhatsapp size={16} />
              </a>
            )}
            {tenant.phone && (
              <a
                href={`tel:${tenant.phone}`}
                className="p-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                title="Call"
              >
                <Phone size={16} />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 font-semibold hover:bg-gray-100 transition-colors text-xs"
            >
              Close
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(tenant)}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-white font-bold text-xs transition-colors bg-[#0f2b3d] hover:bg-[#1a4a6a]"
              >
                <Edit size={13} />
                <span>Edit</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
