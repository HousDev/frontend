import React, { useState, useEffect } from 'react';
import {
  CreditCard, CheckCircle2, Clock, AlertCircle, Download, ShieldCheck, Zap, ArrowUpRight, Check, X, Lock, ArrowRight, FileCheck, Send, Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Tenant, PaymentRecord } from './types';
import { tenantBookingAPI } from '@/lib/tenantBookingAPI';

interface TenantPaymentsTabProps {
  tenant: Tenant;
  fmtINR: (val: number | string) => string;
  onNavigateTab?: (tab: string) => void;
}

export default function TenantPaymentsTab({ tenant, fmtINR, onNavigateTab }: TenantPaymentsTabProps) {
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [leaseData, setLeaseData] = useState<any>(null);
  const [currentDue, setCurrentDue] = useState<any>(null);
  const [ledgerHistory, setLedgerHistory] = useState<any[]>([]);
  const [showPayModal, setShowPayModal] = useState<boolean>(false);
  const [showClaimModal, setShowClaimModal] = useState<boolean>(false);
  const [claimReference, setClaimReference] = useState<string>('');
  const [claimNotes, setClaimNotes] = useState<string>('Paid via GPay / UPI');
  const [claimLoading, setClaimLoading] = useState<boolean>(false);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card'>('upi');
  const [upiId, setUpiId] = useState<string>('tenant@upi');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleProcessPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowPayModal(false);
      setShowClaimModal(true);
      toast.success('Online gateway simulation completed! Please enter/confirm your UTR number.');
    }, 1200);
  };

  const fetchLeaseAndLedger = async (bId?: string) => {
    const targetBookingId = bId || activeBooking?.booking_id || activeBooking?.id || `BKG-${tenant.id}`;
    try {
      const apiRes = await fetch(`http://localhost:3000/api/rent-leases/tenant/${tenant.id}`);
      const json = await apiRes.json();
      if (json?.success && json?.data) {
        if (json.data.lease) setLeaseData(json.data.lease);
        if (json.data.current_due) setCurrentDue(json.data.current_due);
        if (Array.isArray(json.data.ledger)) setLedgerHistory(json.data.ledger);
      }
    } catch (e) {
      console.warn('Could not load lease ledger:', e);
    }
  };

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
        const res = await tenantBookingAPI.getByTenantId(tenant.id);
        if (res && res.success && res.data && res.data.length > 0) {
          const latest = res.data[0];
          setActiveBooking(latest);
          localStorage.setItem(`tenant_booking_${tenant.id}`, JSON.stringify(latest));
          fetchLeaseAndLedger(latest.booking_id || latest.id);
        }
      } catch (err) {
        console.warn('Fetch booking notice:', err);
      }
    };

    fetchBooking();
  }, [tenant.id]);

  const bookingStatus = activeBooking?.booking_status || 'RESERVED';
  const bookingId = activeBooking?.booking_id || activeBooking?.id || `BKG-${tenant.id}`;
  const rentAmount = Number(leaseData?.monthly_rent || activeBooking?.monthly_rent || tenant.budget_max || 25000);
  const ownerUpiId = leaseData?.owner_upi_id || activeBooking?.owner_upi_id || 'owner@oksbi';
  const rentDueDay = leaseData?.rent_due_day || activeBooking?.rent_due_day || 5;

  // Generate Dynamic UPI Deep-Link URL & QR Image
  const ownerName = activeBooking?.owner_name || 'Landlord';
  const monthYearStr = currentDue?.billing_month ? new Date(currentDue.billing_month).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Current Month';
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(ownerUpiId)}&pn=${encodeURIComponent(ownerName)}&am=${rentAmount}&cu=INR&tn=${encodeURIComponent('Monthly Rent ' + monthYearStr + ' - ' + bookingId)}`;
  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(upiDeepLink)}`;

  const handleSubmitPaymentClaim = async () => {
    if (!claimReference.trim() || claimReference.trim().length < 6) {
      toast.error('Please enter a valid 12-digit UPI UTR Transaction Reference number');
      return;
    }
    setClaimLoading(true);
    try {
      const bId = activeBooking?.booking_id || activeBooking?.id || `BKG-${tenant.id}`;
      const res = await fetch(`http://localhost:3000/api/rent-leases/booking/${bId}/claim-rent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utr_number: claimReference.trim(),
          payment_notes: claimNotes.trim(),
          payment_id: currentDue?.id,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        toast.success('🎉 Rent payment claim submitted to Landlord for bank verification!');
        setShowClaimModal(false);
        setClaimReference('');
        fetchLeaseAndLedger(bId);
      } else {
        toast.error(data?.message || 'Failed to submit rent claim');
      }
    } catch (err: any) {
      toast.error('Failed to submit rent claim');
    } finally {
      setClaimLoading(false);
    }
  };

  const handleDownloadReceipt = (payment: PaymentRecord) => {
    toast.info(`Downloading official PDF receipt for ${payment.invoiceNo}...`);
  };

  const pendingPayment = currentDue || ledgerHistory.find((p) => p.payment_status === 'DUE' || p.payment_status === 'CLAIMED');

  // 🔒 If tenancy is not active (booking_status !== 'BOOKED'), render locked tab screen
  if (bookingStatus !== 'BOOKED') {
    return (
      <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-xs text-center space-y-4 max-w-md mx-auto my-6 animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-inner">
          <Lock size={28} />
        </div>
        <div className="space-y-1.5">
          <h3 className="font-extrabold text-base text-slate-900">Rent Pay & Ledger Locked</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Rent payment tracking and verified ledger will automatically unlock once your Landlord finalizes the agreement and activates your tenancy (Step 5 in Linked Lease Property).
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Progress</span>
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-800 text-xs">Tenancy Status:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-black text-[10px] uppercase">
              {bookingStatus}
            </span>
          </div>
        </div>
        {onNavigateTab && (
          <button
            type="button"
            onClick={() => onNavigateTab('linked')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0b3856] hover:bg-[#072438] text-white text-xs font-bold shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <span>Go to Linked Lease Property</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 💡 Monthly Rent Claim Popup Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0b3856] to-[#184d6e] text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm text-white">Did you pay this month's rent directly?</h3>
            <span className="px-2 py-0.5 rounded bg-emerald-500 text-white text-[9px] font-black uppercase">
              Quick Claim
            </span>
          </div>
          <p className="text-[11px] text-slate-200">
            Submit your UPI/Bank UTR reference number so your landlord can instantly verify and credit your rent ledger.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowClaimModal(true)}
          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Zap size={14} />
          <span>Claim Rent Payment</span>
        </button>
      </div>

      {/* 🚀 Active Monthly Rent Payment Card with Dynamic QR Code */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-[10px] border border-emerald-200 uppercase">
              <ShieldCheck size={12} className="text-emerald-600" />
              <span>Active Tenancy Rent Pay & Ledger</span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
              Monthly Rent Due Center — {monthYearStr}
            </h2>
            <p className="text-[11px] text-slate-500">
              Linked Property: <strong className="text-slate-800">{activeBooking?.property_title || tenant.property_title || `RENT-${tenant.rental_property_id || 'Active Lease'}`}</strong>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Status</span>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase mt-0.5 ${
              currentDue?.payment_status === 'VERIFIED'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : currentDue?.payment_status === 'CLAIMED'
                ? 'bg-purple-100 text-purple-800 border border-purple-300 animate-pulse'
                : currentDue?.payment_status === 'ISSUE'
                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}>
              {currentDue?.payment_status === 'VERIFIED'
                ? '✓ Paid & Verified'
                : currentDue?.payment_status === 'CLAIMED'
                ? '⏳ Claimed (Under Landlord Verification)'
                : currentDue?.payment_status === 'ISSUE'
                ? '⚠️ Payment Issue Flagged'
                : '🟡 Rent Due'}
            </span>
          </div>
        </div>

        {/* Dynamic Rent Payment & QR Code Container */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
          {/* Left Details Column */}
          <div className="md:col-span-7 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Monthly Rent</span>
                <strong className="text-xl font-black text-slate-900 block">{fmtINR(rentAmount)}</strong>
                <span className="text-[10px] text-slate-500 font-semibold block">Fixed monthly lease rate</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Rent Due Date</span>
                <strong className="text-sm font-extrabold text-slate-900 block">
                  {currentDue?.due_date ? new Date(currentDue.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : `${rentDueDay}th of every month`}
                </strong>
                <span className="text-[10px] text-orange-600 font-bold block">Every Month Cycle</span>
              </div>
            </div>

            {/* Owner UPI Info Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Landlord Direct UPI ID</span>
              <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-300">
                <span className="font-mono font-extrabold text-xs text-slate-900">{ownerUpiId}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(ownerUpiId);
                    setCopiedUpi(true);
                    toast.success('📋 Owner UPI ID copied to clipboard!');
                    setTimeout(() => setCopiedUpi(false), 2500);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold border border-slate-300 transition cursor-pointer"
                >
                  {copiedUpi ? '✓ Copied' : 'Copy UPI'}
                </button>
              </div>
            </div>

            {/* 📱 Mobile 1-Click Pay Buttons */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10.5px] font-bold text-slate-700 block">1-Click Mobile App Payment:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <a
                  href={upiDeepLink}
                  className="py-2 px-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[11px] text-center shadow-2xs transition cursor-pointer"
                >
                  GPay / PhonePe
                </a>
                <a
                  href={upiDeepLink}
                  className="py-2 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] text-center shadow-2xs transition cursor-pointer"
                >
                  Paytm UPI
                </a>
                <a
                  href={upiDeepLink}
                  className="py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] text-center shadow-2xs transition cursor-pointer"
                >
                  BHIM UPI
                </a>
                <button
                  type="button"
                  onClick={() => setShowClaimModal(true)}
                  className="py-2 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[11px] text-center shadow-2xs transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Zap size={12} />
                  <span>I've Paid</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Dynamic QR Code Column */}
          <div className="md:col-span-5 p-4 rounded-xl bg-slate-50 border-2 border-slate-200 text-center flex flex-col items-center justify-center space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-extrabold block">
              DYNAMIC RENT UPI QR CODE
            </span>
            
            <div className="p-2.5 bg-white rounded-2xl border-2 border-[#0b3856] shadow-sm inline-block">
              <img
                src={dynamicQrUrl}
                alt="Dynamic Rent UPI QR Code"
                className="w-44 h-44 object-contain mx-auto"
              />
            </div>

            <div className="space-y-0.5">
              <strong className="text-xs font-black text-slate-900 block">Scan & Pay {fmtINR(rentAmount)}</strong>
              <span className="text-[10px] text-slate-500 block">Scan with GPay, PhonePe, Paytm or BHIM</span>
            </div>

            <button
              type="button"
              onClick={() => setShowClaimModal(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1 active:scale-[0.99]"
            >
              <CheckCircle2 size={15} />
              <span>Did you complete payment? Click to Enter UTR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Historical Payment Ledger Table */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">Monthly Rent History & Verified Ledger</h3>
            <p className="text-[10px] text-gray-500">Permanent month-by-month rent records</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                <th className="py-2.5 px-3">Invoice No</th>
                <th className="py-2.5 px-3">Billing Month</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">UTR / Ref No</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[11px]">
              {(ledgerHistory.length > 0 ? ledgerHistory : [
                {
                  id: 1,
                  invoice_no: currentDue?.invoice_no || `INV-2026-09-${tenant.id}`,
                  billing_month: currentDue?.billing_month || '2026-09-01',
                  amount: rentAmount,
                  due_date: currentDue?.due_date || '2026-09-05',
                  utr_number: currentDue?.utr_number || null,
                  payment_status: currentDue?.payment_status || 'DUE',
                }
              ]).map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{item.invoice_no || `INV-${item.id}`}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                    {item.billing_month ? new Date(item.billing_month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'Current Month'}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-emerald-600">{fmtINR(item.amount)}</td>
                  <td className="py-2.5 px-3 text-gray-500">
                    {item.due_date ? new Date(item.due_date).toLocaleDateString('en-IN') : '5th'}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-700">
                    {item.utr_number || '—'}
                  </td>
                  <td className="py-2.5 px-3">
                    {item.payment_status === 'VERIFIED' ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[9px] inline-flex items-center gap-1">
                        <CheckCircle2 size={10} /> Verified & Paid
                      </span>
                    ) : item.payment_status === 'CLAIMED' ? (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300 font-bold text-[9px] inline-flex items-center gap-1">
                        <Clock size={10} /> Claimed (Under Review)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[9px] inline-flex items-center gap-1">
                        <Clock size={10} /> Due
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📄 Rent Payment Claim UTR Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Rent Payment Confirmation</h3>
                <p className="text-[10px] text-gray-500">Submit 12-digit UTR reference for Landlord verification</p>
              </div>
              <button onClick={() => setShowClaimModal(false)} className="p-1 text-gray-400 hover:text-slate-700">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[9.5px] font-bold uppercase text-slate-400 block">Monthly Rent Amount</span>
                  <span className="font-black text-slate-900 text-base">{fmtINR(rentAmount)}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[9.5px]">
                  {monthYearStr}
                </span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 block uppercase mb-1">
                  12-Digit UPI UTR / Transaction Ref Number *
                </label>
                <input
                  type="text"
                  value={claimReference}
                  onChange={(e) => setClaimReference(e.target.value)}
                  placeholder="e.g. 425198273614"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-[#0b3856] text-slate-900"
                />
                <span className="text-[9.5px] text-slate-400 mt-1 block">Found in GPay, PhonePe, or Paytm payment details</span>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 block uppercase mb-1">
                  Payment Notes (Optional)
                </label>
                <input
                  type="text"
                  value={claimNotes}
                  onChange={(e) => setClaimNotes(e.target.value)}
                  placeholder="e.g. Paid via PhonePe on 5th Oct"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#0b3856] text-slate-900"
                />
              </div>

              <button
                type="button"
                disabled={claimLoading || !claimReference.trim()}
                onClick={handleSubmitPaymentClaim}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {claimLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                <span>Submit Payment UTR to Landlord</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Online Rent Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Pay Monthly Rent Online</h3>
                <p className="text-[10px] text-gray-500">Invoice {pendingPayment?.invoiceNo || 'INV-2026-09'}</p>
              </div>
              <button onClick={() => setShowPayModal(false)} className="p-1 text-gray-400 hover:text-slate-700">
                <X size={16} />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold text-gray-400 uppercase">Total Rent Payable</span>
                <div className="text-xl font-black text-emerald-600">{fmtINR(rentAmount)}</div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold">
                Zero Convenience Fee
              </span>
            </div>

            {/* Payment Options */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-700 block uppercase">Select Payment Method</label>

              <div
                onClick={() => setSelectedMethod('upi')}
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  selectedMethod === 'upi' ? 'border-orange-500 bg-orange-50/40 font-bold' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px]">
                    UPI
                  </div>
                  <div>
                    <span className="block text-slate-800">UPI Instant Pay (GPay / PhonePe / Paytm)</span>
                    <span className="text-[9px] text-gray-400 font-normal">Instant settlement & receipt</span>
                  </div>
                </div>
                {selectedMethod === 'upi' && <Check size={16} className="text-orange-500" />}
              </div>

              <div
                onClick={() => setSelectedMethod('card')}
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  selectedMethod === 'card' ? 'border-orange-500 bg-orange-50/40 font-bold' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2.5 text-xs">
                  <CreditCard size={18} className="text-blue-600" />
                  <div>
                    <span className="block text-slate-800">Credit / Debit Card</span>
                    <span className="text-[9px] text-gray-400 font-normal">Earn card rewards & cashback</span>
                  </div>
                </div>
                {selectedMethod === 'card' && <Check size={16} className="text-orange-500" />}
              </div>
            </div>

            {selectedMethod === 'upi' && (
              <div>
                <label className="text-[9px] font-bold text-gray-500 block mb-1">Enter UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-gray-300 rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            )}

            <button
              onClick={handleProcessPayment}
              disabled={isProcessing}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={15} />
                  <span>Confirm & Pay {fmtINR(rentAmount)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
