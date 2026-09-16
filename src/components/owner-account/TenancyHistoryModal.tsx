import React from 'react';
import {
  X, CheckCircle2, Clock, ShieldCheck, FileText,
  IndianRupee, Calendar, User, Building2, ExternalLink, Download, AlertCircle
} from 'lucide-react';

interface TenancyHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  onVerifyPayment?: (bookingId: string | number) => void;
  onVerifyKyc?: (bookingId: string | number) => void;
}

export function formatMoveInDate(dateStr?: string) {
  if (!dateStr) return 'N/A';
  try {
    if (dateStr.includes('T') || dateStr.includes('-')) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export const TenancyHistoryModal: React.FC<TenancyHistoryModalProps> = ({
  isOpen,
  onClose,
  booking,
  onVerifyPayment,
  onVerifyKyc,
}) => {
  if (!isOpen || !booking) return null;

  const tenantName = booking.tenant_name || `Tenant #${booking.tenant_id}`;
  const propTitle = booking.property_title || booking.society_name ? `${booking.unit_type || '2 BHK'} at ${booking.society_name}` : `Property #${booking.property_id}`;
  const isClaimed = booking.payment_status === 'CLAIMED';
  const isVerified = booking.payment_status === 'VERIFIED';
  const isKycApproved = booking.booking_status === 'KYC_APPROVED' || booking.booking_status === 'AGREEMENT_SENT' || booking.booking_status === 'AGREEMENT_SIGNED' || booking.booking_status === 'BOOKED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#0b3856] to-[#184d6e] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-extrabold text-sm">
              <Building2 size={18} className="text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Tenancy Complete History & Audit Ledger</h3>
              <p className="text-[11px] text-slate-300">Booking ID: {booking.booking_id || booking.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          
          {/* Tenant & Property Overview Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 block">Tenant Details</span>
              <div className="flex items-center gap-2">
                <User size={14} className="text-[#0b3856]" />
                <span className="font-extrabold text-sm text-slate-900">{tenantName}</span>
              </div>
              <p className="text-[11px] text-slate-500">Phone: {booking.tenant_phone || 'N/A'}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 block">Property & Rent Terms</span>
              <span className="font-extrabold text-xs text-slate-900 block truncate">{propTitle}</span>
              <p className="text-[11px] text-slate-500">
                Monthly Rent: <strong className="text-emerald-700">₹{Number(booking.monthly_rent || 25000).toLocaleString('en-IN')}/mo</strong>
              </p>
            </div>
          </div>

          {/* 📜 5-Step Lifecycle Timeline Visualizer */}
          <div className="space-y-2">
            <h4 className="font-black text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Clock size={14} className="text-orange-500" />
              <span>Tenancy Lifecycle Progress Timeline</span>
            </h4>
            
            <div className="grid grid-cols-5 gap-1 text-center font-bold text-[10px]">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                1. Selected ✓
              </div>
              <div className={`p-2 rounded-xl border ${isClaimed || isVerified ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300'}`}>
                2. Token Claim {isClaimed || isVerified ? '✓' : '⏳'}
              </div>
              <div className={`p-2 rounded-xl border ${isVerified ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : isClaimed ? 'bg-amber-500 text-white border-amber-600 animate-pulse' : 'bg-slate-100 text-slate-400'}`}>
                3. Verification {isVerified ? '✓' : '⏳'}
              </div>
              <div className={`p-2 rounded-xl border ${isKycApproved ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-400'}`}>
                4. KYC Record {isKycApproved ? '✓' : '⏳'}
              </div>
              <div className={`p-2 rounded-xl border ${booking.booking_status === 'BOOKED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-400'}`}>
                5. Lease Active {booking.booking_status === 'BOOKED' ? '✓' : '⏳'}
              </div>
            </div>
          </div>

          {/* Audit Event Timeline List */}
          <div className="space-y-3 pt-2">
            <h4 className="font-black text-xs uppercase tracking-wider text-slate-700">Audit History & Event Logs</h4>
            
            <div className="space-y-2 border-l-2 border-slate-200 pl-4 ml-1">
              
              {/* Event 1: Token Reservation */}
              <div className="relative space-y-1">
                <div className="absolute -left-[21px] top-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white" />
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">Token Reservation Created</span>
                  <span className="text-[10px] text-slate-400 font-mono">{formatMoveInDate(booking.created_at || booking.booking_date)}</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Advance Token Amount: <strong>₹{Number(booking.token_amount || 5000).toLocaleString('en-IN')}</strong> • Planned Move-in: {formatMoveInDate(booking.move_in_date)}
                </p>
              </div>

              {/* Event 2: Payment Claim / UTR */}
              <div className="relative space-y-1 pt-2">
                <div className={`absolute -left-[21px] top-2.5 w-3 h-3 rounded-full ring-4 ring-white ${booking.payment_reference ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">Payment Claim Reference / UTR</span>
                  <span className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded font-extrabold text-slate-800">
                    {booking.payment_reference || 'Not Claimed Yet'}
                  </span>
                </div>
                {booking.payment_notes && (
                  <p className="text-[10.5px] text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-200">
                    "{booking.payment_notes}"
                  </p>
                )}
              </div>

              {/* Event 3: KYC Documents */}
              <div className="relative space-y-1 pt-2">
                <div className={`absolute -left-[21px] top-2.5 w-3 h-3 rounded-full ring-4 ring-white ${isKycApproved ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">KYC Verification Record</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isKycApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {isKycApproved ? 'KYC Approved' : 'KYC Pending Review'}
                  </span>
                </div>
                {booking.id_proof_document && (
                  <div className="pt-1">
                    <a
                      href={booking.id_proof_document}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 underline"
                    >
                      <ExternalLink size={12} />
                      <span>View Verified KYC Document ({booking.id_proof_type || 'Aadhaar / PAN'})</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Event 4: Lease Agreement PDF */}
              <div className="relative space-y-1 pt-2">
                <div className={`absolute -left-[21px] top-2.5 w-3 h-3 rounded-full ring-4 ring-white ${booking.booking_status === 'BOOKED' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900">Lease Agreement PDF</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${booking.booking_status === 'BOOKED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                    {booking.booking_status === 'BOOKED' ? 'Tenancy Active' : 'Agreement Pending'}
                  </span>
                </div>
                {booking.agreement_document && (
                  <div className="pt-1">
                    <a
                      href={booking.agreement_document}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                    >
                      <FileText size={13} />
                      <span>View / Download Signed Agreement PDF</span>
                    </a>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
          {isClaimed && onVerifyPayment && (
            <button
              onClick={() => {
                onVerifyPayment(booking.booking_id || booking.id);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition cursor-pointer"
            >
              Verify Payment Now
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
          >
            Close History Audit
          </button>
        </div>

      </div>
    </div>
  );
};

export default TenancyHistoryModal;
