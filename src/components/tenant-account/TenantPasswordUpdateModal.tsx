import React, { useState } from 'react';
import {
  X,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  KeyRound,
  UserCheck,
  XCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { tenantAPI } from '@/lib/tenantAPI';

interface TenantPasswordUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantEmail?: string;
  tenantId?: number | string;
  tenantName?: string;
  username?: string;
  onSuccess?: () => void;
  allowDismiss?: boolean;
}

export const TenantPasswordUpdateModal: React.FC<TenantPasswordUpdateModalProps> = ({
  isOpen,
  onClose,
  tenantEmail = '',
  tenantId,
  tenantName = 'Tenant',
  username = '',
  onSuccess,
  allowDismiss = true,
}) => {
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const derivedUsername = username || (tenantEmail ? tenantEmail.split('@')[0] : 'tenant');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.trim().length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match. Please re-enter.');
      return;
    }

    const email = tenantEmail || localStorage.getItem('verified_tenant')
      ? JSON.parse(localStorage.getItem('verified_tenant') || '{}').email
      : '';

    setLoading(true);
    try {
      const res = await tenantAPI.updatePassword({
        email: email || undefined,
        tenant_id: tenantId || undefined,
        new_password: newPassword.trim(),
      });

      if (res?.success) {
        toast.success(res.message || 'Password updated successfully! You can now use this password to sign in.');
        localStorage.removeItem('show_password_reminder');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res?.message || 'Failed to update password');
      }
    } catch (err: any) {
      console.error('Password update error:', err);
      toast.error(err?.response?.data?.message || 'Error saving password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-100 animate-in zoom-in-95 duration-200">
        
        {/* Header Ribbon / Banner */}
        <div className="bg-gradient-to-r from-[#0b3856] via-[#0f2b3d] to-[#1e4e6d] p-5 sm:p-6 text-white relative">
          {allowDismiss && (
            <button
              onClick={() => {
                localStorage.removeItem('show_password_reminder');
                onClose();
              }}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">
                  Set Your Password
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-wider">
                  Important
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Hi {tenantName}, secure your account for instant direct sign in.
              </p>
            </div>
          </div>
        </div>

        {/* Username Info Box */}
        <div className="px-5 pt-4">
          <div className="p-3 bg-amber-50/90 rounded-2xl border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-200/80 text-amber-950 flex items-center justify-center shrink-0 shadow-2xs">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Your Account Username
                </span>
                <span className="font-mono font-black text-xs text-amber-950 truncate block">
                  @{derivedUsername}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(`@${derivedUsername}`);
                toast.success(`Copied username: @${derivedUsername}`);
              }}
              className="px-2.5 py-1 text-[10px] font-extrabold text-amber-900 bg-amber-200/70 hover:bg-amber-200 rounded-lg transition-colors cursor-pointer border border-amber-300/60"
            >
              Copy Username
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          
          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create password (min 6 chars)"
                className={`w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 transition-all font-medium text-slate-800 ${
                  newPassword.length >= 6
                    ? 'border-slate-300 focus:ring-amber-500'
                    : newPassword.length > 0
                    ? 'border-amber-300 focus:ring-amber-500'
                    : 'border-slate-200 focus:ring-amber-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPassword.length > 0 && newPassword.length < 6 && (
              <span className="text-[10.5px] text-amber-600 font-semibold block mt-1">
                Min 6 characters required ({newPassword.length}/6)
              </span>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Confirm Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type your password"
                className={`w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border focus:outline-none focus:ring-2 transition-all font-medium text-slate-800 ${
                  confirmPassword.length > 0
                    ? newPassword === confirmPassword
                      ? 'border-emerald-400 focus:ring-emerald-500 bg-emerald-50/20'
                      : 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
                    : 'border-slate-200 focus:ring-amber-500'
                }`}
              />
              <Lock className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            {confirmPassword.length > 0 && (
              newPassword === confirmPassword ? (
                <span className="text-[10.5px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
                  <CheckCircle2 size={12} className="text-emerald-600" />
                  Passwords match perfectly
                </span>
              ) : (
                <span className="text-[10.5px] text-rose-600 font-bold flex items-center gap-1 mt-1">
                  <XCircle size={12} className="text-rose-600" />
                  Passwords do not match
                </span>
              )
            )}
          </div>

          {/* Security Note */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Encrypted with industry-standard bcrypt hashing.</span>
          </div>

          {/* Submit CTA */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={loading || !newPassword || newPassword !== confirmPassword}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FFCC00] to-[#f59e0b] hover:from-[#F5B800] hover:to-[#d97706] active:scale-[0.99] text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-400/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Password...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Save Password & Continue</span>
                </>
              )}
            </button>

            {allowDismiss && (
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('show_password_reminder');
                  onClose();
                }}
                className="w-full py-2 text-center text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
              >
                Skip for now
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};

export default TenantPasswordUpdateModal;
