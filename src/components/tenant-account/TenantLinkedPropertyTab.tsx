import React, { useState, useEffect } from 'react';
import { Building2, Calendar, Lock, CheckCircle2, ShieldCheck, User, ArrowRight, IndianRupee } from 'lucide-react';
import { Tenant } from './types';
import { tenantBookingAPI } from '@/lib/tenantBookingAPI';

interface TenantLinkedPropertyTabProps {
  tenant: Tenant;
}

export default function TenantLinkedPropertyTab({ tenant }: TenantLinkedPropertyTabProps) {
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check localStorage first for instant rendering
    try {
      const cached = localStorage.getItem(`tenant_booking_${tenant.id}`);
      if (cached) {
        setActiveBooking(JSON.parse(cached));
      }
    } catch {}

    // 2. Fetch from backend API
    const fetchBooking = async () => {
      if (!tenant.id) return;
      try {
        setLoading(true);
        const res = await tenantBookingAPI.getByTenantId(tenant.id);
        if (res && res.success && res.data && res.data.length > 0) {
          const latest = res.data[0];
          setActiveBooking(latest);
          localStorage.setItem(`tenant_booking_${tenant.id}`, JSON.stringify(latest));
        }
      } catch (err) {
        console.warn('Fetch booking notice:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();

    // 3. Listen to booking events
    const handleBooked = (e: any) => {
      if (e.detail) {
        setActiveBooking(e.detail);
      }
    };
    window.addEventListener('tenant_property_booked', handleBooked);
    return () => window.removeEventListener('tenant_property_booked', handleBooked);
  }, [tenant.id]);

  const hasLinkedProperty = Boolean(tenant.rental_property_id || activeBooking?.property_id);
  const propTitle = activeBooking?.property_title || tenant.property_title || (tenant.rental_property_id ? `Rental Unit RENT-${tenant.rental_property_id}` : '');
  const ownerName = activeBooking?.owner_name || tenant.owner_name || 'Property Owner';
  const bookingId = activeBooking?.booking_id || `BKG-${tenant.id}`;
  const tokenAmount = activeBooking?.token_amount ? Number(activeBooking.token_amount) : 10000;
  const moveInDate = activeBooking?.move_in_date || 'Upcoming';
  const paymentStatus = activeBooking?.payment_status || 'PAID';
  const bookingStatus = activeBooking?.booking_status || 'RESERVED';

  return (
    <div className="space-y-4">
      {hasLinkedProperty ? (
        /* 🔒 Property Reserved Card */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Top Status Header */}
          <div className="bg-slate-900 text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 text-emerald-400 flex items-center justify-center font-bold">
                <Lock size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white">Property Reserved</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9.5px] font-bold uppercase tracking-wider">
                    {bookingStatus}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  This property is locked exclusively for your tenancy.
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Booking Reference</span>
              <span className="font-mono font-bold text-xs text-white">{bookingId}</span>
            </div>
          </div>

          {/* Reserved Details Body */}
          <div className="p-5 space-y-4 text-xs">
            {/* Property and Landlord Summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[9.5px] font-mono font-bold">
                    RENT-{activeBooking?.property_id || tenant.rental_property_id}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 mt-1">{propTitle}</h4>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200 text-[11px]">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] font-semibold block uppercase">Token Paid</span>
                  <span className="font-bold text-slate-900 text-xs mt-0.5 block">
                    ₹{tokenAmount.toLocaleString('en-IN')} <span className="text-emerald-600 font-bold text-[10px]">({paymentStatus})</span>
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] font-semibold block uppercase">Target Move-in</span>
                  <span className="font-bold text-slate-900 text-xs mt-0.5 block">{moveInDate}</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] font-semibold block uppercase">Landlord</span>
                  <span className="font-bold text-slate-900 text-xs mt-0.5 block truncate">{ownerName}</span>
                </div>
              </div>
            </div>

            {/* Next Step Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-900">Next Step: Tenant KYC & Verification</h5>
                  <p className="text-[10.5px] text-slate-500">
                    Aadhaar, PAN & Salary slip verification will unlock in Phase 3.
                  </p>
                </div>
              </div>

              <button
                disabled
                className="px-4 py-2 rounded-lg bg-slate-200 text-slate-500 font-bold text-xs cursor-not-allowed flex items-center gap-1.5 self-start sm:self-auto opacity-80"
              >
                <span>Complete KYC</span>
                <span className="text-[9px] font-semibold">(Phase 3)</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* No property linked yet */
        <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Building2 size={24} />
          </div>
          <h3 className="font-bold text-sm text-slate-900">No Rental Property Linked</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Complete a site visit and click "Reserve Property" on any confirmed listing to lock your next home.
          </p>
        </div>
      )}
    </div>
  );
}
