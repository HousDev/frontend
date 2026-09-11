import React, { useState } from 'react';
import { X, IndianRupee, Loader2, Clock, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { tenantBookingAPI } from '@/lib/tenantBookingAPI';

interface TenantBookingPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: any; // { booking_id, token_amount, monthly_rent, ... }
    onPaymentClaimed?: (updatedBooking: any) => void;
}

export default function TenantBookingPaymentModal({
    isOpen,
    onClose,
    booking,
    onPaymentClaimed,
}: TenantBookingPaymentModalProps) {
    const [step, setStep] = useState<'ask' | 'form' | 'done'>('ask');
    const [paymentRef, setPaymentRef] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen || !booking) return null;

    const tokenAmount = Number(booking.token_amount) || 0;

    const handleSubmitClaim = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentRef.trim()) {
            toast.error('Please enter your UPI/Bank transaction reference number');
            return;
        }
        setSubmitting(true);
        try {
            const res = await tenantBookingAPI.claimPayment(booking.booking_id, {
                payment_reference: paymentRef.trim(),
                payment_notes: notes.trim() || null,
            });
            if (res?.success) {
                toast.success('Payment submitted! Owner will verify it shortly.');
                setStep('done');
                onPaymentClaimed?.(res.data);
            } else {
                toast.error(res?.message || 'Failed to submit payment');
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to submit payment claim');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                <div className="flex items-center justify-between px-4 py-3 bg-[#0b3856] text-white">
                    <div className="flex items-center gap-2">
                        <IndianRupee size={18} className="text-amber-300" />
                        <h3 className="font-extrabold text-sm">Complete Token Payment</h3>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 cursor-pointer">
                        <X size={16} />
                    </button>
                </div>

                <div className="p-4 space-y-4 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Token Amount to Pay</span>
                        <div className="text-2xl font-black text-slate-900">
                            ₹{tokenAmount.toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Booking Ref: {booking.booking_id}</span>
                    </div>

                    {step === 'ask' && (
                        <>
                            {booking.payment_status === 'CLAIMED' ? (
                                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-center">
                                    <div className="flex items-center justify-center gap-1.5 text-amber-800 font-extrabold text-xs">
                                        <Clock size={15} />
                                        <span>Payment Claimed — Awaiting Verification</span>
                                    </div>
                                    <p className="text-slate-600 text-[11px]">
                                        Submitted UTR/Reference: <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200">{booking.payment_reference || 'N/A'}</strong>
                                    </p>
                                    <button
                                        onClick={() => setStep('form')}
                                        className="text-[11px] font-bold text-amber-900 underline cursor-pointer"
                                    >
                                        Update Reference / Notes
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed text-[11px] space-y-1">
                                        <p className="font-bold text-slate-900">🛡️ Direct Landlord Token Hold Guarantee</p>
                                        <p>
                                            Transfer the token hold amount (₹{tokenAmount.toLocaleString('en-IN')}) directly to the landlord via UPI, GooglePay, PhonePe, or NetBanking. Once done, enter your bank UTR reference number below to claim reservation.
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={onClose}
                                            className="flex-1 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold cursor-pointer text-xs"
                                        >
                                            Not Yet
                                        </button>
                                        <button
                                            onClick={() => setStep('form')}
                                            className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer text-xs"
                                        >
                                            Yes, I've Paid (Enter UTR)
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-1.5 justify-center text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
                                        <Clock size={12} />
                                        <span>Exclusive 48-hour reservation hold started.</span>
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {step === 'form' && (
                        <form onSubmit={handleSubmitClaim} className="space-y-3">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    UPI / Bank Transaction Reference <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={paymentRef}
                                    onChange={(e) => setPaymentRef(e.target.value)}
                                    placeholder="e.g. UPI-489201938210"
                                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Notes (optional)</label>
                                <textarea
                                    rows={2}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Paid via GPay to owner's number..."
                                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setStep('ask')}
                                    className="flex-1 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold cursor-pointer"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                                >
                                    {submitting && <Loader2 size={13} className="animate-spin" />}
                                    <span>Submit Payment</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 'done' && (
                        <div className="text-center space-y-2 py-3">
                            <CheckCircle2 size={36} className="mx-auto text-emerald-500" />
                            <h4 className="font-bold text-slate-900">Payment Submitted!</h4>
                            <p className="text-slate-500">Owner will verify your payment shortly. You'll be notified once confirmed.</p>
                            <button
                                onClick={onClose}
                                className="mt-2 px-4 py-2 rounded-xl bg-[#0b3856] text-white font-bold cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}