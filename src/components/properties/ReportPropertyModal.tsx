import React, { useState } from 'react';
import {
  X,
  Flag,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  Send
} from 'lucide-react';
import { tenantAPI } from '@/lib/tenantAPI';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';

interface ReportPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
  propertyType?: 'rent' | 'sale';
}

const REPORT_REASONS = [
  'Property is already rented / sold',
  'Incorrect rent / deposit amount',
  'Mismatched / fake photos',
  'Wrong location or society name',
  'Broker / Agent posing as direct Owner',
  'Owner / Contact is unresponsive',
  'Other inaccuracy / suspicious listing',
];

export const ReportPropertyModal: React.FC<ReportPropertyModalProps> = ({
  isOpen,
  onClose,
  property,
  propertyType = 'rent',
}) => {
  const { user } = useAuth();

  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [description, setDescription] = useState<string>('');
  const [email, setEmail] = useState<string>(user?.email || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const propertyCode = property?.id ? (propertyType === 'rent' ? `RENT-${property.id}` : `REX${String(property.id).padStart(4, '0')}`) : 'Property';
  const propertyTitle = property?.society_name || property?.title || propertyCode;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast.error('Please select a reason for reporting');
      return;
    }

    setLoading(true);
    try {
      const res = await tenantAPI.reportIssue({
        property_id: property?.id,
        property_type: propertyType,
        reason,
        description: description.trim(),
        reporter_email: email.trim() || undefined,
        reporter_phone: phone.trim() || undefined,
      });

      if (res?.success) {
        setSubmitted(true);
        toast.success(res.message || 'Thank you for reporting. Our audit team will review this listing!');
      } else {
        toast.error(res?.message || 'Failed to submit report. Please try again.');
      }
    } catch (err: any) {
      console.error('Report error:', err);
      toast.error(err?.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="relative px-5 py-3.5 bg-gradient-to-r from-rose-600 to-red-700 text-white">
          <button
            onClick={handleResetAndClose}
            className="absolute top-3 right-3 p-1 rounded-full bg-white/10 hover:bg-white/20 text-white/90 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/15 backdrop-blur-md text-white border border-white/20 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-amber-200" />
              Listing Integrity Report
            </span>
          </div>

          <h3 className="text-base font-extrabold tracking-tight">
            Report what was not correct
          </h3>
          <p className="text-[11px] text-rose-100 truncate mt-0.5">
            {propertyCode} • {propertyTitle}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 max-h-[80vh] overflow-y-auto">
          {submitted ? (
            <div className="text-center py-5 space-y-3 animate-in fade-in">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-800">
                  Report Received!
                </h4>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-0.5">
                  Thank you for helping us keep listings accurate. Our audit team will review <b>{propertyCode}</b> within 24 hours.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="py-2 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  What issue did you find? <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  {REPORT_REASONS.map((item) => (
                    <label
                      key={item}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-[11px] cursor-pointer transition-all ${
                        reason === item
                          ? 'border-rose-500 bg-rose-50/50 text-rose-900 font-bold shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="report_reason"
                        value={item}
                        checked={reason === item}
                        onChange={() => setReason(item)}
                        className="text-rose-600 focus:ring-rose-500 w-3.5 h-3.5"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                  Additional Details (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Rent asked by owner is different than listed..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                    Your Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-2.5 py-1 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                    Your Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Mobile number"
                    className="w-full px-2.5 py-1 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-1.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Submit Report
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportPropertyModal;
