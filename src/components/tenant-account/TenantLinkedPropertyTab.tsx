import React, { useState, useEffect } from 'react';
import { Building2, Calendar, Lock, CheckCircle2, ShieldCheck, User, ArrowRight, IndianRupee, Clock, FileCheck, Check, AlertCircle } from 'lucide-react';
import { Tenant } from './types';
import { tenantBookingAPI } from '@/lib/tenantBookingAPI';

interface TenantLinkedPropertyTabProps {
  tenant: Tenant;
}

export default function TenantLinkedPropertyTab({ tenant }: TenantLinkedPropertyTabProps) {
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(`tenant_booking_${tenant.id}`);
      if (cached) {
        setActiveBooking(JSON.parse(cached));
      }
    } catch {}

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
  const tokenAmount = activeBooking?.token_amount ? Number(activeBooking.token_amount) : 5000;
  const moveInDate = activeBooking?.move_in_date || 'Upcoming';
  const paymentStatus = activeBooking?.payment_status || 'PENDING';
  const bookingStatus = activeBooking?.booking_status || 'RESERVED';
  const paymentRef = activeBooking?.payment_reference || null;

  // Stepper timeline step states:
  const isStep1Done = true; // Selection & Acceptance completed
  const isStep2Done = paymentStatus === 'CLAIMED' || paymentStatus === 'VERIFIED';
  const isStep3Done = paymentStatus === 'VERIFIED';
  const isStep4Done = bookingStatus === 'KYC_APPROVED';
  const isStep5Done = bookingStatus === 'BOOKED';

  const steps = [
    {
      num: 1,
      title: 'Selection & Acceptance',
      desc: 'Owner selected profile & tenant accepted confirmation',
      status: 'COMPLETED',
      time: 'Phase 1 Complete',
      icon: CheckCircle2,
      isDone: isStep1Done,
      isCurrent: !isStep2Done,
    },
    {
      num: 2,
      title: 'Token Hold & Payment Claim',
      desc: paymentRef ? `Payment Claimed — UTR: ${paymentRef}` : 'Submit UPI/Bank reference number for 48h hold',
      status: isStep2Done ? 'CLAIMED' : 'PENDING',
      time: activeBooking?.payment_claimed_at ? new Date(activeBooking.payment_claimed_at).toLocaleDateString('en-IN') : 'Awaiting Claim',
      icon: IndianRupee,
      isDone: isStep2Done,
      isCurrent: isStep1Done && !isStep2Done,
    },
    {
      num: 3,
      title: 'Landlord Credit Verification',
      desc: isStep3Done ? 'Payment verified in bank by landlord' : 'Landlord verifying bank credit & UTR reference',
      status: isStep3Done ? 'VERIFIED' : 'UNDER_REVIEW',
      time: activeBooking?.payment_verified_at ? new Date(activeBooking.payment_verified_at).toLocaleDateString('en-IN') : 'In Progress',
      icon: ShieldCheck,
      isDone: isStep3Done,
      isCurrent: isStep2Done && !isStep3Done,
    },
    {
      num: 4,
      title: 'KYC Document Review',
      desc: isStep4Done ? 'Aadhaar & Profile KYC verified' : 'Landlord reviewing uploaded Aadhaar & Profile ID',
      status: isStep4Done ? 'APPROVED' : 'PENDING',
      time: tenant.kyc_verified_at ? new Date(tenant.kyc_verified_at).toLocaleDateString('en-IN') : 'Pending',
      icon: FileCheck,
      isDone: isStep4Done,
      isCurrent: isStep3Done && !isStep4Done,
    },
    {
      num: 5,
      title: 'Agreement & Active Tenancy',
      desc: isStep5Done ? 'Lease agreement eSigned & move-in active' : 'Drafting rental agreement & move-in confirmation',
      status: isStep5Done ? 'ACTIVE' : 'UPCOMING',
      time: moveInDate,
      icon: Lock,
      isDone: isStep5Done,
      isCurrent: isStep4Done && !isStep5Done,
    },
  ];

  return (
    <div className="space-y-4">
      {hasLinkedProperty ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
          {/* Top Status Header */}
          <div className="bg-[#0b3856] text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center font-bold shrink-0">
                <Lock size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-sm text-white">Property Reserved & Linked</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider">
                    {bookingStatus}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Exclusive 48-hour hold active for your tenancy.
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-300 font-bold block uppercase tracking-wider">Booking Ref</span>
              <span className="font-mono font-black text-xs text-amber-300">{bookingId}</span>
            </div>
          </div>

          <div className="p-5 space-y-5 text-xs">
            {/* Property Summary Bar */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[9.5px] font-mono font-bold">
                    RENT-{activeBooking?.property_id || tenant.rental_property_id}
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900 mt-1">{propTitle}</h4>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200 text-[11px]">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] font-bold block uppercase">Token Hold Amount</span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">
                    ₹{tokenAmount.toLocaleString('en-IN')}
                    <span className={`ml-1 text-[10px] font-bold ${isStep3Done ? 'text-emerald-600' : 'text-amber-600'}`}>
                      ({paymentStatus})
                    </span>
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] font-bold block uppercase">Target Move-in Date</span>
                  <span className="font-bold text-slate-900 text-xs mt-0.5 block">{moveInDate}</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] font-bold block uppercase">Landlord</span>
                  <span className="font-bold text-slate-900 text-xs mt-0.5 block truncate">{ownerName}</span>
                </div>
              </div>
            </div>

            {/* 📜 5-Step Tenancy Lifecycle Stepper Timeline */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Tenancy Lifecycle & Progress History</span>
              </h4>

              <div className="relative pl-6 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {steps.map((s) => {
                  const StepIcon = s.icon;
                  return (
                    <div key={`step-${s.num}`} className="relative group">
                      {/* Step Circle Marker */}
                      <div
                        className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                          s.isDone
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                            : s.isCurrent
                            ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {s.isDone ? <Check size={12} /> : s.num}
                      </div>

                      {/* Step Card Content */}
                      <div
                        className={`p-3.5 rounded-xl border transition-all ${
                          s.isDone
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : s.isCurrent
                            ? 'bg-amber-50/60 border-amber-300 shadow-2xs'
                            : 'bg-slate-50/60 border-slate-200 opacity-70'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <StepIcon size={14} className={s.isDone ? 'text-emerald-600' : s.isCurrent ? 'text-amber-600' : 'text-slate-400'} />
                            <h5 className="font-bold text-xs text-slate-900">{s.title}</h5>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase ${
                              s.isDone
                                ? 'bg-emerald-100 text-emerald-800'
                                : s.isCurrent
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {s.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{s.desc}</p>
                        <span className="text-[9.5px] text-slate-400 font-mono mt-1 block">{s.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
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
            Complete a site visit and click "Reserve & Pay Token" on any confirmed listing to lock your next home and track tenancy progress here.
          </p>
        </div>
      )}
    </div>
  );
}
