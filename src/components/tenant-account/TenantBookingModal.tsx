import React, { useState } from 'react';
import {
  X, ShieldCheck, Check, Calendar,
  CreditCard, Lock, Building2, User,
  Printer, ArrowRight, Loader2, MapPin
} from 'lucide-react';
import { toast } from 'react-toastify';
import { tenantBookingAPI } from '@/lib/tenantBookingAPI';
import { Tenant } from './types';

interface TenantBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  property: any;
  onBookingSuccess?: (bookingData: any) => void;
}

export default function TenantBookingModal({
  isOpen,
  onClose,
  tenant,
  property,
  onBookingSuccess,
}: TenantBookingModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');

  // Phase 1 Essential Booking Form State
  const [moveInDate, setMoveInDate] = useState<string>(() => {
    const d = new Date(Date.now() + 7 * 86400000);
    return d.toISOString().split('T')[0];
  });
  const [tokenAmountSelect, setTokenAmountSelect] = useState<string>('5000');
  const [customTokenAmount, setCustomTokenAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('UPI');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [bookingResult, setBookingResult] = useState<any | null>(null);

  if (!isOpen || !property) return null;

  const propPrice = Number(property.monthly_rent || property.expected_rent || property.price || property.rent || 0);
  const securityDeposit = Number(property.security_deposit || propPrice * 2 || 0);
  const propLocation = [
    property.society_name || property.building_name,
    property.location_name || property.location || property.locality,
    property.city_name || property.city
  ].filter(Boolean).join(', ') || 'Pune';

  const propTitle = property.title || (property.property_type_name && property.society_name ? `${property.property_type_name} in ${property.society_name}` : (property.property_type_name || `Rental Property RENT-${property.id}`));
  const ownerName = property.owner_name || property.seller_name || property.owner?.name || 'Property Owner';
  const ownerId = property.owner_id || property.seller_id || property.owner?.id || null;

  const effectiveToken = tokenAmountSelect === 'custom'
    ? Number(customTokenAmount) || 5000
    : Number(tokenAmountSelect);

  const handleProcessBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveInDate) {
      toast.error('Please select an intended move-in date');
      return;
    }

    if (effectiveToken <= 0) {
      toast.error('Please specify a valid advance token amount');
      return;
    }

    setIsProcessing(true);

    try {
      const payload = {
        tenant_id: tenant.id,
        property_id: property.id,
        property_title: propTitle,
        monthly_rent: propPrice,
        security_deposit: securityDeposit,
        token_amount: effectiveToken,
        move_in_date: moveInDate,
        lock_in_period: '11 Months',
        payment_method: paymentMethod,
        owner_id: ownerId,
        owner_name: ownerName,
      };

      const res = await tenantBookingAPI.create(payload);

      if (res && res.success) {
        const bookingData = res.data || {
          booking_id: `BKG-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
          ...payload,
          booking_status: 'RESERVED',
          payment_status: 'PAID',
          booking_date: new Date().toISOString(),
        };

        // Cache for instant local synchronization
        localStorage.setItem(`tenant_booking_${tenant.id}`, JSON.stringify(bookingData));
        localStorage.setItem(`property_reserved_${property.id}`, JSON.stringify(bookingData));

        // Dispatch window event for UI components to immediately update
        window.dispatchEvent(new CustomEvent('tenant_property_booked', { detail: bookingData }));

        setBookingResult(bookingData);
        setStep('success');
        toast.success(`🎉 ${res.message || 'Property reserved successfully!'}`);
        onBookingSuccess?.(bookingData);
      } else {
        toast.error(res?.message || 'Failed to complete reservation. Please try again.');
      }
    } catch (err: any) {
      console.error('Booking failed:', err);
      const msg = err?.response?.data?.message || 'Failed to reserve property. Please try again.';
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[94vh]">

        {/* Clean Corporate Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
              <Building2 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                {step === 'form' ? 'Reserve Property (Token Advance)' : 'Booking Confirmation Voucher'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {step === 'form'
                  ? 'Select token amount and move-in date to reserve this rental home'
                  : 'Official property reservation receipt'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
          >
            <X size={17} />
          </button>
        </div>

        {/* Modal Body */}
        {step === 'form' ? (
          <form onSubmit={handleProcessBooking} className="p-5 space-y-4 text-xs overflow-y-auto">

            {/* 🏠 Selected Property Summary Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[9.5px] font-mono font-bold">
                      RENT-{property.id}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9.5px] font-bold">
                      Available for Lock
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mt-1">
                    {propTitle}
                  </h4>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin size={11} className="text-slate-400 shrink-0" />
                    <span className="truncate">{propLocation}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-[11px]">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] block font-semibold uppercase">Monthly Rent</span>
                  <span className="font-bold text-slate-900 text-xs">
                    {propPrice > 0 ? `₹${propPrice.toLocaleString('en-IN')}/mo` : 'Contact for Rent'}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 text-[10px] block font-semibold uppercase">Security Deposit</span>
                  <span className="font-bold text-slate-900 text-xs">
                    ₹{securityDeposit.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* 📅 Booking Details */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[10.5px] font-semibold text-slate-700">
                  Target Move-in Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={moveInDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setMoveInDate(e.target.value)}
                  className="w-full h-9 px-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-slate-800 text-xs text-slate-800 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10.5px] font-semibold text-slate-700">
                    Advance Token Amount <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={tokenAmountSelect}
                    onChange={(e) => setTokenAmountSelect(e.target.value)}
                    className="w-full h-9 px-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-slate-800 text-xs text-slate-800 font-medium"
                  >
                    <option value="5000">₹5,000 (Standard Token)</option>
                    <option value="10000">₹10,000 (Priority Reservation)</option>
                    <option value="15000">₹15,000 (Extended Token)</option>
                    <option value="custom">Custom Amount</option>
                  </select>
                </div>

                {tokenAmountSelect === 'custom' ? (
                  <div className="space-y-1">
                    <label className="block text-[10.5px] font-semibold text-slate-700">
                      Enter Amount (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="E.g. 7500"
                      value={customTokenAmount}
                      onChange={(e) => setCustomTokenAmount(e.target.value)}
                      className="w-full h-9 px-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-slate-800 text-xs text-slate-800 font-medium"
                      min={1000}
                      required
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="block text-[10.5px] font-semibold text-slate-700">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full h-9 px-3 border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-slate-800 text-xs text-slate-800 font-medium"
                    >
                      <option value="UPI">UPI / Instant QR Code</option>
                      <option value="Net Banking">Net Banking (NEFT / IMPS)</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Credit Card">Credit Card</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* 🛡️ Secure Guarantee Box */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center gap-2.5">
              <ShieldCheck size={16} className="text-slate-800 shrink-0" />
              <div className="text-[11px] leading-snug">
                <span className="font-bold text-slate-900">100% Protected Reservation:</span> Token advance locks this rental unit exclusively for your lease agreement.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all text-xs shadow-xs cursor-pointer flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Reserving Property...</span>
                  </>
                ) : (
                  <>
                    <Lock size={13} />
                    <span>Pay ₹{effectiveToken.toLocaleString('en-IN')} & Reserve</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* 🧾 Booking Confirmation Voucher View */
          <div className="p-5 space-y-4 overflow-y-auto text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xs">
                <Check size={20} className="stroke-[2.5]" />
              </div>
              <h4 className="font-bold text-sm text-slate-900 mt-2">
                Property Successfully Reserved!
              </h4>
              <p className="text-[11px] text-slate-500">
                Booking Reference: <strong className="font-mono text-slate-900">{bookingResult?.booking_id}</strong>
              </p>
            </div>

            {/* Official Digital Voucher Card */}
            <div id="booking-voucher" className="border border-slate-300 rounded-xl p-4 bg-white space-y-3 font-sans shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Reservation Reference</div>
                  <div className="font-mono font-bold text-xs text-slate-900">{bookingResult?.booking_id}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-semibold">Booking Date</div>
                  <div className="font-bold text-[11px] text-slate-700">
                    {new Date(bookingResult?.booking_date || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-400 text-[10px] block font-semibold uppercase">Reserved Property</span>
                  <strong className="text-slate-900">{bookingResult?.property_title}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-semibold uppercase">Property Landlord</span>
                  <strong className="text-slate-900">{bookingResult?.owner_name || 'Landlord'}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-400 text-[10px] block font-semibold uppercase">Tenant Name</span>
                  <strong className="text-slate-900">{tenant?.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-semibold uppercase">Target Move-in Date</span>
                  <strong className="text-slate-900">{bookingResult?.move_in_date}</strong>
                </div>
              </div>

              {/* Financial Ledger */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Monthly Agreed Rent:</span>
                  <span className="font-bold text-slate-900">₹{bookingResult?.monthly_rent?.toLocaleString('en-IN')}/mo</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Security Deposit:</span>
                  <span className="font-bold text-slate-900">₹{bookingResult?.security_deposit?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold border-t border-slate-200 pt-1.5">
                  <span>Advance Token Paid ({bookingResult?.payment_method}):</span>
                  <span>₹{bookingResult?.token_amount?.toLocaleString('en-IN')} (PAID)</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer text-xs flex items-center gap-1.5"
              >
                <Printer size={13} />
                <span>Print Receipt</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all text-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Go to Linked Property</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
