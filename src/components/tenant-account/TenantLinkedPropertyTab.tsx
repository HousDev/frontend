import React, { useState, useEffect, useRef } from 'react';
import { Building2, Calendar, Lock, CheckCircle2, ShieldCheck, User, ArrowRight, IndianRupee, Clock, FileCheck, Check, AlertCircle, FileText, CheckSquare, Square, ExternalLink, Loader2, PenTool } from 'lucide-react';
import { toast } from 'react-toastify';
import { Tenant } from './types';
import { tenantBookingAPI } from '@/lib/tenantBookingAPI';
import { getImageUrl } from '@/lib/helpers';
import { TenantSignatureCanvas } from './TenantSignatureCanvas';

interface TenantLinkedPropertyTabProps {
  tenant: Tenant;
}

export default function TenantLinkedPropertyTab({ tenant }: TenantLinkedPropertyTabProps) {
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [signatureName, setSignatureName] = useState<string>(tenant.name || (tenant as any).full_name || '');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [signingLoading, setSigningLoading] = useState<boolean>(false);

  useEffect(() => {
    try {
      const cached = localStorage.getItem(`tenant_booking_${tenant.id}`);
      if (cached) {
        setActiveBooking(JSON.parse(cached));
      }
    } catch {}

    const fetchBooking = async () => {
      const targetId = tenant.id || (tenant as any).tenant_id || (tenant as any).user_id;
      if (!targetId) return;
      try {
        setLoading(true);
        const res = await tenantBookingAPI.getByTenantId(targetId);
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

    const handleBookingUpdate = (e?: any) => {
      if (e?.detail) {
        setActiveBooking(e.detail);
      } else {
        fetchBooking();
      }
    };

    window.addEventListener('tenant_property_booked', handleBookingUpdate);
    window.addEventListener('tenant_booking_updated', handleBookingUpdate);
    window.addEventListener('focus', handleBookingUpdate);

    return () => {
      window.removeEventListener('tenant_property_booked', handleBookingUpdate);
      window.removeEventListener('tenant_booking_updated', handleBookingUpdate);
      window.removeEventListener('focus', handleBookingUpdate);
    };
  }, [tenant.id, (tenant as any).tenant_id, (tenant as any).user_id]);

  useEffect(() => {
    if (tenant.name || (tenant as any).full_name) {
      setSignatureName(tenant.name || (tenant as any).full_name);
    }
  }, [tenant]);

  const [signedFile, setSignedFile] = useState<File | null>(null);
  const signedFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSignAgreement = async () => {
    if (!agreedToTerms) {
      toast.error('Please check the terms consent box before signing');
      return;
    }
    if (!signatureName.trim()) {
      toast.error('Please enter your full legal name to e-sign');
      return;
    }
    setSigningLoading(true);
    try {
      const bId = activeBooking?.booking_id || activeBooking?.id || `BKG-${tenant.id}`;

      // Upload signed agreement file if provided by tenant
      if (signedFile) {
        const fd = new FormData();
        fd.append('agreement_file', signedFile);
        if (activeBooking?.property_id) {
          fd.append('property_id', String(activeBooking.property_id));
        }
        await tenantBookingAPI.uploadAgreement(bId, fd);
      }

      const res = await tenantBookingAPI.signAgreement(bId, {
        tenant_signature_name: signatureName.trim(),
        signature_image: signatureDataUrl || undefined,
      });
      if (res?.success) {
        toast.success('🎉 Rental Agreement Signed & Uploaded successfully!');
        const updatedBooking = {
          ...(activeBooking || {}),
          ...(res.data || {}),
          booking_status: 'AGREEMENT_SIGNED',
          tenant_signature_name: signatureName.trim(),
          signature_image_url: signatureDataUrl || res.data?.signature_image_url || activeBooking?.signature_image_url,
          tenant_signed_at: new Date().toISOString(),
        };
        setActiveBooking(updatedBooking);
        localStorage.setItem(`tenant_booking_${tenant.id}`, JSON.stringify(updatedBooking));
        window.dispatchEvent(new CustomEvent('tenant_booking_updated', { detail: updatedBooking }));
      } else {
        toast.error(res?.message || 'Failed to sign agreement');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to sign agreement');
    } finally {
      setSigningLoading(false);
    }
  };

  const hasLinkedProperty = Boolean(tenant.rental_property_id || activeBooking?.property_id);
  const propTitle = activeBooking?.property_title || tenant.property_title || (tenant.rental_property_id ? `Rental Unit RENT-${tenant.rental_property_id}` : '');
  const ownerName = activeBooking?.owner_name || tenant.owner_name || 'Property Owner';
  const bookingId = activeBooking?.booking_id || `BKG-${tenant.id}`;
  const tokenAmount = activeBooking?.token_amount ? Number(activeBooking.token_amount) : 5000;
  const rawMoveIn = activeBooking?.move_in_date || tenant?.move_in_date;
  const moveInDate = rawMoveIn
    ? (String(rawMoveIn).includes('T') || String(rawMoveIn).includes('-')
        ? new Date(rawMoveIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : rawMoveIn)
    : 'Upcoming';
  const paymentStatus = activeBooking?.payment_status || 'PENDING';
  const bookingStatus = activeBooking?.booking_status || 'RESERVED';
  const paymentRef = activeBooking?.payment_reference || null;

  // Stepper timeline step states:
  const isStep1Done = true; // Selection & Acceptance completed
  const isStep2Done = paymentStatus === 'CLAIMED' || paymentStatus === 'VERIFIED';
  const isStep3Done = paymentStatus === 'VERIFIED';
  const isStep4Done = bookingStatus === 'KYC_APPROVED' || bookingStatus === 'AGREEMENT_SENT' || bookingStatus === 'AGREEMENT_SIGNED' || bookingStatus === 'BOOKED' || (tenant as any).kyc_status === 'KYC_VERIFIED';
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
      desc: isStep4Done ? 'Aadhaar & Profile KYC verified & approved by landlord' : 'Landlord reviewing uploaded Aadhaar & Profile ID',
      status: isStep4Done ? 'APPROVED' : 'PENDING',
      time: (tenant as any).kyc_verified_at || activeBooking?.kyc_verified_at ? new Date((tenant as any).kyc_verified_at || activeBooking?.kyc_verified_at).toLocaleDateString('en-IN') : (isStep4Done ? 'Approved' : 'Pending'),
      icon: FileCheck,
      isDone: isStep4Done,
      isCurrent: isStep3Done && !isStep4Done,
    },
    {
      num: 5,
      title: 'Agreement & Active Tenancy',
      desc: isStep5Done
        ? 'Lease agreement eSigned & move-in active'
        : bookingStatus === 'AGREEMENT_SENT'
        ? 'Owner sent PDF Agreement. Awaiting your E-Signature below.'
        : bookingStatus === 'AGREEMENT_SIGNED'
        ? 'Agreement E-Signed! Waiting for landlord activation.'
        : 'Drafting rental agreement & move-in confirmation',
      status: isStep5Done
        ? 'ACTIVE'
        : bookingStatus === 'AGREEMENT_SENT'
        ? 'SIGNATURE REQUIRED'
        : bookingStatus === 'AGREEMENT_SIGNED'
        ? 'SIGNED'
        : 'PENDING',
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
                {/* Status Chip inside Linked Card */}
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Agreement Status</span>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase mt-0.5 ${
                    bookingStatus === 'BOOKED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : bookingStatus === 'AGREEMENT_SIGNED'
                      ? 'bg-purple-100 text-purple-800 border border-purple-300'
                      : bookingStatus === 'AGREEMENT_SENT'
                      ? 'bg-amber-500 text-white shadow-xs animate-pulse'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {bookingStatus === 'BOOKED'
                      ? 'Active Tenancy'
                      : bookingStatus === 'AGREEMENT_SIGNED'
                      ? 'Signed by Tenant'
                      : bookingStatus === 'AGREEMENT_SENT'
                      ? 'Action Required: E-Sign'
                      : 'Agreement: Pending'}
                  </span>
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
                  const isStep5 = s.num === 5;
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

                        {/* ✍️ Step 5 Interactive E-Sign Box for Tenant */}
                        {isStep5 && bookingStatus === 'AGREEMENT_SENT' && (
                          <div className="mt-3 p-4 rounded-2xl bg-white border-2 border-amber-300 shadow-md space-y-4">
                            <div className="flex items-center justify-between border-b border-amber-200 pb-2.5">
                              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs">
                                <PenTool size={16} className="text-amber-600 animate-bounce" />
                                <span>Action Required: Review & Consent E-Sign Rental Agreement</span>
                              </div>
                              <a
                                href={getImageUrl(activeBooking?.agreement_document, '/agreements/sample_rental_agreement.pdf')}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10.5px] font-bold border border-blue-200 inline-flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <FileText size={12} />
                                <span>View Agreement PDF</span>
                                <ExternalLink size={10} />
                              </a>
                            </div>

                            {/* 📜 Owner Uploaded Agreement PDF Document Viewer */}
                            <div className="rounded-xl border border-slate-300 bg-slate-100 p-2.5 space-y-2">
                              <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-800">
                                <span className="flex items-center gap-1.5">
                                  <FileText size={14} className="text-[#0b3856]" />
                                  <span>Owner Uploaded Agreement PDF Document:</span>
                                </span>
                                <a
                                  href={getImageUrl(activeBooking?.agreement_document, '/agreements/sample_rental_agreement.pdf')}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 text-[10px] font-bold"
                                >
                                  <span>Open PDF in New Window</span>
                                  <ExternalLink size={10} />
                                </a>
                              </div>

                              {/* Document Sheet Viewer */}
                              <div className="relative rounded-lg overflow-hidden border border-slate-300 bg-white min-h-[220px] max-h-[350px] flex items-center justify-center shadow-inner">
                                {activeBooking?.agreement_document && (activeBooking.agreement_document.endsWith('.webp') || activeBooking.agreement_document.endsWith('.jpg') || activeBooking.agreement_document.endsWith('.png')) ? (
                                  <img
                                    src={getImageUrl(activeBooking.agreement_document)}
                                    alt="Rental Agreement PDF Document"
                                    className="w-full h-full object-contain max-h-[340px]"
                                  />
                                ) : (
                                  <iframe
                                    src={getImageUrl(activeBooking?.agreement_document, '/agreements/sample_rental_agreement.pdf')}
                                    title="Rental Agreement PDF Document"
                                    className="w-full h-[320px] border-0"
                                  />
                                )}
                              </div>
                            </div>

                            {/* 🖋️ Official Agreement Signature Section Stamp Attachment */}
                            <div className="p-3.5 rounded-xl bg-slate-50 border-2 border-[#0b3856]/30 shadow-xs font-sans space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                <div className="flex items-center gap-2">
                                  <ShieldCheck size={16} className="text-[#0b3856]" />
                                  <div>
                                    <span className="text-[8.5px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                                      OFFICIAL SIGNATURE SECTION STAMP
                                    </span>
                                    <h5 className="font-serif font-extrabold text-slate-900 text-xs">
                                      Rental Agreement Signature Attachment (Ref: {bookingId})
                                    </h5>
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-mono font-bold border border-amber-300">
                                  {signatureDataUrl || activeBooking?.signature_image_url ? '✓ STAMPED ON AGREEMENT' : 'AWAITING TENANT SIGNATURE'}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-2.5 rounded-lg border border-slate-200 text-[10.5px]">
                                <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Property:</span> <strong className="text-slate-800 truncate block">{propTitle}</strong></div>
                                <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Landlord:</span> <strong className="text-slate-800 truncate block">{ownerName}</strong></div>
                                <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Tenant:</span> <strong className="text-slate-800 truncate block">{signatureName || tenant.name}</strong></div>
                                <div><span className="text-slate-400 block text-[9px] uppercase font-bold">Move-In Date:</span> <strong className="text-slate-800 block">{moveInDate}</strong></div>
                              </div>

                              {/* 🖋️ Designated Agreement Signature Boxes */}
                              <div className="pt-2 border-t border-dashed border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Landlord Pre-Stamp */}
                                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-center space-y-1">
                                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Landlord Authorization</span>
                                  <div className="h-11 flex items-center justify-center border-b border-slate-200">
                                    <span className="font-serif italic font-extrabold text-slate-800 text-xs">
                                      Issued by {ownerName}
                                    </span>
                                  </div>
                                  <span className="text-[8.5px] text-emerald-600 font-bold block">✓ Verified Landlord E-Stamp</span>
                                </div>

                                {/* Tenant Live Signature Stamp Box */}
                                <div className={`p-2.5 bg-white rounded-lg border-2 text-center space-y-1 transition-all ${
                                  signatureDataUrl || activeBooking?.signature_image_url ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-amber-300'
                                }`}>
                                  <span className="text-[9px] uppercase font-bold text-amber-700 block">Tenant E-Signature Box</span>
                                  <div className="h-11 flex items-center justify-center border-b border-slate-200 relative bg-slate-50/50 rounded">
                                    {(signatureDataUrl || activeBooking?.signature_image_url) ? (
                                      <img
                                        src={signatureDataUrl || getImageUrl(activeBooking?.signature_image_url)}
                                        alt="Tenant Live Signature"
                                        className="max-h-10 max-w-[170px] object-contain mx-auto"
                                      />
                                    ) : signatureName ? (
                                      <span className="font-serif italic font-bold text-[#0b3856] text-sm">
                                        "{signatureName}"
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 text-[10px] italic">
                                        Draw signature below to stamp here...
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[8.5px] font-bold block text-slate-500">
                                    {(signatureDataUrl || activeBooking?.signature_image_url) ? '✓ Signature Stamped on Document' : 'Draw or type signature below'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-600">
                              Please review the agreement above, draw/upload your signature below OR attach your signed agreement PDF document, tick consent, and click <strong>Sign & Upload Agreement</strong>.
                            </p>

                            {/* ✍️ Canvas Signature Pad */}
                            <TenantSignatureCanvas
                              initialName={signatureName}
                              onSignatureChange={(dataUrl) => {
                                setSignatureDataUrl(dataUrl);
                              }}
                            />

                            {/* 📁 Upload Signed Document File (PDF / Scanned Image) */}
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                                <span className="flex items-center gap-1.5">
                                  <FileText size={13} className="text-amber-600" />
                                  <span>Or Upload Signed Agreement Document (PDF / Scan):</span>
                                </span>
                                {signedFile && (
                                  <button
                                    type="button"
                                    onClick={() => setSignedFile(null)}
                                    className="text-rose-600 hover:underline text-[10px] font-bold"
                                  >
                                    Remove File
                                  </button>
                                )}
                              </div>

                              <input
                                type="file"
                                ref={signedFileInputRef}
                                accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (file.size > 10 * 1024 * 1024) {
                                      toast.error('File size must be under 10MB');
                                      return;
                                    }
                                    setSignedFile(file);
                                    toast.success(`📎 Attached signed file: ${file.name}`);
                                  }
                                }}
                              />

                              {signedFile ? (
                                <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2 truncate">
                                    <FileCheck size={16} className="text-emerald-600 shrink-0" />
                                    <span className="font-bold text-emerald-900 truncate">{signedFile.name}</span>
                                  </div>
                                  <span className="text-[10px] text-emerald-700 font-mono font-bold">✓ Ready to Upload</span>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => signedFileInputRef.current?.click()}
                                  className="w-full py-2 px-3 bg-white border border-dashed border-slate-300 hover:border-amber-500 rounded-lg text-xs font-bold text-slate-700 hover:text-amber-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <FileText size={13} className="text-amber-600" />
                                  <span>Attach Signed PDF or Scanned Agreement Document</span>
                                </button>
                              )}
                            </div>

                            <div className="space-y-2.5 pt-1">
                              <label
                                onClick={() => setAgreedToTerms(!agreedToTerms)}
                                className="flex items-start gap-2 cursor-pointer select-none text-slate-800 text-[11px] font-semibold"
                              >
                                {agreedToTerms ? (
                                  <CheckSquare size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                ) : (
                                  <Square size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                )}
                                <span>I have read and agree to all terms and conditions of this rental agreement.</span>
                              </label>

                              <div>
                                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                                  Type Full Name (Legal E-Signature)
                                </label>
                                <input
                                  type="text"
                                  value={signatureName}
                                  onChange={(e) => setSignatureName(e.target.value)}
                                  placeholder="e.g. Rahul Sharma"
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
                                />
                              </div>

                              <button
                                type="button"
                                disabled={signingLoading || !agreedToTerms || !signatureName.trim()}
                                onClick={handleSignAgreement}
                                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50 transition-all active:scale-[0.99]"
                              >
                                {signingLoading ? <Loader2 size={14} className="animate-spin" /> : <PenTool size={14} />}
                                <span>Sign, Stamp & Upload Agreement</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {isStep5 && (bookingStatus === 'AGREEMENT_SIGNED' || bookingStatus === 'BOOKED') && (
                          <div className="mt-3 p-4 rounded-2xl bg-purple-50/80 border border-purple-200 text-xs space-y-3 shadow-xs">
                            <div className="flex items-center justify-between border-b border-purple-200/80 pb-2">
                              <div className="flex items-center gap-2 text-purple-900 font-extrabold">
                                <CheckCircle2 size={16} className="text-purple-600" />
                                <span>Official Rental Agreement E-Signed</span>
                              </div>
                              <span className="text-[9.5px] font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded border border-purple-200">
                                Verified Stamp
                              </span>
                            </div>

                            {/* Official Signed Agreement Sheet Box */}
                            <div className="p-3 bg-white rounded-xl border border-purple-200 shadow-2xs space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <span className="text-[9px] uppercase font-mono font-bold text-slate-400 block tracking-wider">Signed Legal Name</span>
                                  <strong className="text-sm font-extrabold text-slate-900 block">{activeBooking?.tenant_signature_name || signatureName}</strong>
                                  <span className="text-[10px] text-slate-500 font-mono block">
                                    📅 Signed: {activeBooking?.tenant_signed_at ? new Date(activeBooking.tenant_signed_at).toLocaleString('en-IN') : 'Recently'}
                                  </span>
                                </div>

                                {(activeBooking?.signature_image_url || signatureDataUrl) && (
                                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-center shrink-0">
                                    <span className="text-[8.5px] uppercase font-bold text-slate-400 block mb-1">Handwritten Signature</span>
                                    <img
                                      src={activeBooking?.signature_image_url || signatureDataUrl}
                                      alt="Tenant Signature"
                                      className="h-10 max-w-36 object-contain mx-auto"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>

                            <span className="text-[10.5px] text-purple-800 font-semibold block">
                              ⏳ Waiting for Landlord activation. Once activated, rent ledger will be enabled.
                            </span>
                          </div>
                        )}

                        {isStep5 && bookingStatus === 'BOOKED' && (
                          <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                            <div className="flex items-center gap-2 text-emerald-900 font-extrabold">
                              <CheckCircle2 size={15} className="text-emerald-600" />
                              <span>Tenancy Active & Agreement Finalized!</span>
                            </div>
                            <p className="text-[11px] text-emerald-800">
                              Your lease agreement is active. You can track & pay monthly rent in the Rent Pay & Ledger tab.
                            </p>
                          </div>
                        )}
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
