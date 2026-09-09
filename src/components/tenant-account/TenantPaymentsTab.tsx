import React, { useState } from 'react';
import {
  CreditCard, CheckCircle2, Clock, AlertCircle, Download, ShieldCheck, Zap, ArrowUpRight, Check, X
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { toast } from 'react-toastify';
import { Tenant, PaymentRecord } from './types';

interface TenantPaymentsTabProps {
  tenant: Tenant;
  fmtINR: (val: number | string) => string;
}

export default function TenantPaymentsTab({ tenant, fmtINR }: TenantPaymentsTabProps) {
  const rentAmount = Number(tenant.budget_max) || 28000;
  const [showPayModal, setShowPayModal] = useState<boolean>(false);
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState<string>('tenant@upi');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([
    {
      id: 'PAY-1003',
      invoiceNo: 'INV-2026-09',
      month: 'September 2026',
      amount: rentAmount,
      dueDate: '2026-09-05',
      status: 'Pending',
    },
    {
      id: 'PAY-1002',
      invoiceNo: 'INV-2026-08',
      month: 'August 2026',
      amount: rentAmount,
      dueDate: '2026-08-05',
      paidDate: '2026-08-03',
      status: 'Paid',
      paymentMethod: 'UPI (GPay)',
    },
    {
      id: 'PAY-1001',
      invoiceNo: 'INV-2026-07',
      month: 'July 2026',
      amount: rentAmount,
      dueDate: '2026-07-05',
      paidDate: '2026-07-04',
      status: 'Paid',
      paymentMethod: 'Credit Card',
    },
  ]);

  const handleProcessPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentHistory((prev) =>
        prev.map((item) =>
          item.id === 'PAY-1003'
            ? {
                ...item,
                status: 'Paid',
                paidDate: new Date().toISOString().split('T')[0],
                paymentMethod: selectedMethod.toUpperCase(),
              }
            : item
        )
      );
      setShowPayModal(false);
      toast.success(`Rent payment of ${fmtINR(rentAmount)} completed successfully! PDF receipt generated.`);
    }, 1200);
  };

  const handleDownloadReceipt = (payment: PaymentRecord) => {
    toast.info(`Downloading official PDF receipt for ${payment.invoiceNo}...`);
  };

  const pendingPayment = paymentHistory.find((p) => p.status === 'Pending' || p.status === 'Overdue');

  return (
    <div className="space-y-4">
      {/* Active Rent Due Banner */}
      <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[9px] border border-emerald-200 uppercase">
              <ShieldCheck size={11} />
              Verified Rent Ledger
            </div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 mt-1">
              Monthly Rent & Payment Center
            </h2>
            <p className="text-[10px] text-gray-500">
              Linked Property: <strong className="text-slate-800">{tenant.property_title || `RENT-${tenant.rental_property_id || 'Active Lease'}`}</strong>
            </p>
          </div>

          {pendingPayment ? (
            <button
              onClick={() => setShowPayModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Zap size={14} />
              <span>Pay Rent Online ({fmtINR(pendingPayment.amount)})</span>
            </button>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1">
              <CheckCircle2 size={14} />
              <span>Rent Up to Date</span>
            </span>
          )}
        </div>

        {/* Stat Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[9px] font-bold uppercase text-gray-400 block">Current Month Due</span>
            <span className="text-sm font-black text-slate-900 mt-0.5 block">{fmtINR(rentAmount)}</span>
            <span className="text-[9px] text-orange-600 font-semibold block mt-0.5">Due by 5th of every month</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[9px] font-bold uppercase text-gray-400 block">Security Deposit Held</span>
            <span className="text-sm font-black text-emerald-600 mt-0.5 block">{fmtINR(rentAmount * 3)}</span>
            <span className="text-[9px] text-gray-500 block mt-0.5">Held safely with owner</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[9px] font-bold uppercase text-gray-400 block">Credit Bureau Reporting</span>
            <span className="text-sm font-extrabold text-blue-700 mt-0.5 block flex items-center gap-1">
              <span>Active</span>
              <CheckCircle2 size={13} className="text-blue-600" />
            </span>
            <span className="text-[9px] text-gray-500 block mt-0.5">Build CIBIL score with rent</span>
          </div>
        </div>
      </div>

      {/* Payment History Ledger */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900">Rent Payment History Ledger</h3>
            <p className="text-[10px] text-gray-500">Official payment receipts and invoice tracking</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
                <th className="py-2.5 px-3">Invoice No</th>
                <th className="py-2.5 px-3">Period</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Paid Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[11px]">
              {paymentHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{item.invoiceNo}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-700">{item.month}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-600">{fmtINR(item.amount)}</td>
                  <td className="py-2.5 px-3 text-gray-500">{new Date(item.dueDate).toLocaleDateString('en-IN')}</td>
                  <td className="py-2.5 px-3 text-gray-500">{item.paidDate ? new Date(item.paidDate).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="py-2.5 px-3">
                    {item.status === 'Paid' ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[9px] inline-flex items-center gap-1">
                        <CheckCircle2 size={10} /> Paid
                      </span>
                    ) : item.status === 'Overdue' ? (
                      <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-bold text-[9px] inline-flex items-center gap-1">
                        <AlertCircle size={10} /> Overdue
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[9px] inline-flex items-center gap-1">
                        <Clock size={10} /> Due
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {item.status === 'Paid' ? (
                      <button
                        onClick={() => handleDownloadReceipt(item)}
                        className="px-2.5 py-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-slate-700 font-bold text-[10px] inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Download size={11} />
                        <span>Receipt</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowPayModal(true)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] inline-flex items-center gap-1 shadow-2xs"
                      >
                        <CreditCard size={11} />
                        <span>Pay Now</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
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
