// components/userPageCompoents/UserViewModal.tsx
import React from 'react';
import { X, Mail, Phone, Calendar, Briefcase, Droplet, Activity, CheckCircle, XCircle, Edit } from 'lucide-react';
import Button from '@/components/ui/Button';

const N = "#0f2b3d";
const O = "#e67e22";
const BD = "#e2e8f0";
const BG = "#f8fafc";
const MU = "#5a7184";

interface User {
  id?: string | number;
  username?: string;
  email: string;
  first_name: string;
  last_name: string;
  salutation?: string;
  role: string;
  phone?: string;
  avatar?: string;
  designation?: string;
  department?: string;
  is_active?: boolean;
  last_login?: string;
  created_at?: string;
  total_leads?: number;
  total_properties?: number;
  total_revenue?: number;
  dob?: string;
  blood_group?: string;
}

interface Props {
  user: User;
  onClose: () => void;
  onEdit: () => void;
  getLabelFromValue: (key: string, val: string) => string;
  formatCurrency: (n?: number) => string;
  formatDateTime: (s?: string) => string;
  formatDateForDisplay: (s?: string | null) => string;
}

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value?: string | null }> = ({ icon, label, value }) => (
  value ? (
    <div className="flex items-center gap-2 py-1.5 text-xs">
      <span style={{ color: O }}>{icon}</span>
      <span className="min-w-[90px] font-medium" style={{ color: N }}>{label}</span>
      <span style={{ color: MU }}>{value}</span>
    </div>
  ) : null
);

const UserViewModal: React.FC<Props> = ({
  user, onClose, onEdit, getLabelFromValue, formatCurrency, formatDateTime, formatDateForDisplay
}) => {
  const initials = ((user.first_name?.[0] || '') + (user.last_name?.[0] || '')).toUpperCase();
  const fullName = `${user.salutation ? user.salutation + ' ' : ''}${user.first_name} ${user.last_name}`;
  const roleLabel = getLabelFromValue('role', user.role) || user.role;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[70] p-3 sm:p-4"
      style={{ background: 'rgba(15,43,61,0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden" style={{ border: `1px solid ${BD}` }}>
        
        {/* Header */}
        <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: N }}>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg" style={{ background: `${O}20` }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={O} strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            </div>
            <span className="text-sm font-bold text-white">User Details</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${user.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
              {user.is_active ? 'Active' : 'Inactive'}
            </span>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: 'thin' }}>
          
          {/* Profile top */}
          <div className="flex items-center gap-3 mb-3">
            {user.avatar ? (
              <img src={user.avatar} alt={fullName} className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <div className="h-12 w-12 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0" style={{ background: O }}>
                {initials}
              </div>
            )}
            <div>
              <p className="font-semibold text-sm" style={{ color: N }}>{fullName}</p>
              {user.username && <p className="text-xs" style={{ color: MU }}>@{user.username}</p>}
              <div className="flex gap-1.5 mt-1 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800">{roleLabel}</span>
                {user.department && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">{user.department}</span>
                )}
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="flex gap-4 mb-3">
            {user.created_at && (
              <div className="flex items-center gap-1 text-[10px]" style={{ color: MU }}>
                <Calendar size={11} /> Joined: {formatDateTime(user.created_at)}
              </div>
            )}
            {user.last_login && (
              <div className="flex items-center gap-1 text-[10px]" style={{ color: MU }}>
                <Activity size={11} /> Last login: {formatDateTime(user.last_login)}
              </div>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: `0.5px solid ${BD}`, margin: '10px 0' }} />

          {/* Contact info */}
          <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: MU }}>Contact info</p>
          <InfoRow icon={<Mail size={12} />} label="Email" value={user.email} />
          <InfoRow icon={<Phone size={12} />} label="Phone" value={user.phone} />
          <InfoRow icon={<Calendar size={12} />} label="DOB" value={formatDateForDisplay(user.dob)} />
          <InfoRow icon={<Droplet size={12} />} label="Blood Group" value={user.blood_group} />
          <InfoRow icon={<Briefcase size={12} />} label="Designation" value={user.designation} />

          {/* Performance */}
          {(user.total_leads !== undefined || user.total_properties !== undefined || user.total_revenue !== undefined) && (
            <>
              <hr style={{ border: 'none', borderTop: `0.5px solid ${BD}`, margin: '10px 0' }} />
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-2" style={{ color: MU }}>Performance</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Leads', value: String(user.total_leads ?? 0) },
                  { label: 'Properties', value: String(user.total_properties ?? 0) },
                  { label: 'Revenue', value: formatCurrency(user.total_revenue) },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg p-2 text-center" style={{ background: BG, border: `0.5px solid ${BD}` }}>
                    <p className="text-base font-medium" style={{ color: N }}>{value}</p>
                    <p className="text-[10px]" style={{ color: MU }}>{label}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 flex justify-end gap-1.5 border-t" style={{ background: BG, borderColor: BD }}>
          <Button onClick={onEdit} size="sm" className="text-xs py-1.5 text-white" style={{ background: O }}>
            <Edit size={12} className="mr-1" /> Edit User
          </Button>
          <Button variant="outline" onClick={onClose} size="sm" className="text-xs py-1.5" style={{ borderColor: BD, color: N }}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserViewModal;