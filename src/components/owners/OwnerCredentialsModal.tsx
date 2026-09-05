import React, { useState, useEffect } from 'react';
import {
  KeyRound, X, Copy, Check, Eye, EyeOff, Lock,
  Mail, Loader2, Sparkles
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { toast } from 'react-toastify';
import { ownerAPI } from '@/lib/ownerAPI';

interface OwnerCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ownerId: number | string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
}

export const OwnerCredentialsModal: React.FC<OwnerCredentialsModalProps> = ({
  isOpen,
  onClose,
  ownerId,
  ownerName,
  ownerPhone,
  ownerEmail,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [credentials, setCredentials] = useState<any>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [savedPassword, setSavedPassword] = useState<string>('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchCredentials = async () => {
    if (!ownerId) return;
    setLoading(true);
    try {
      const res = await ownerAPI.getCredentials(ownerId);
      if (res?.success) {
        setCredentials(res.data);
        setPasswordInput('');
        setSavedPassword('');
      } else {
        toast.error(res?.message || 'Failed to fetch credentials');
      }
    } catch (err: any) {
      console.error('Fetch credentials error:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to generate owner credentials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && ownerId) {
      fetchCredentials();
      setShowPassword(false);
      setPasswordInput('');
      setSavedPassword('');
    }
  }, [isOpen, ownerId]);

  if (!isOpen) return null;

  const username = credentials?.username || (ownerEmail ? ownerEmail.split('@')[0] : `owner_${ownerId}`);
  const email = credentials?.email || ownerEmail || 'N/A';
  const phone = credentials?.phone || ownerPhone || '';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyAll = () => {
    let fullDetails = `👤 Name: ${ownerName || credentials?.owner_name || 'Owner'}\n` +
      `🔑 Username: @${username}\n` +
      `📧 Email: ${email}`;

    if (savedPassword) {
      fullDetails += `\n🔒 Password: ${savedPassword}`;
    }

    copyToClipboard(fullDetails, 'Credentials');
  };

  const handleShareWhatsApp = () => {
    const cleanPhone = String(phone).replace(/\D/g, '');
    let text = `Hello ${ownerName || credentials?.owner_name || 'Owner'},\n\n` +
      `Here are your login credentials for the Owner Portal:\n\n` +
      `👤 *Username:* @${username}\n` +
      `📧 *Email:* ${email}`;

    if (savedPassword) {
      text += `\n🔒 *Password:* ${savedPassword}`;
    }

    const message = encodeURIComponent(text);
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${message}`
      : `https://wa.me/?text=${message}`;

    window.open(waUrl, '_blank');
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput || passwordInput.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const res = await ownerAPI.updatePassword(ownerId, passwordInput);
      if (res?.success) {
        toast.success('Owner password set successfully!');
        setSavedPassword(passwordInput);
      } else {
        toast.error(res?.message || 'Failed to set password');
      }
    } catch (err: any) {
      console.error('Set password error:', err);
      toast.error(err?.response?.data?.message || 'Error setting password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$';
    let pass = 'Owner@';
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPasswordInput(pass);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#0f2b3d] via-[#153e56] to-[#0b3856] p-4 sm:p-5 text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
              <KeyRound size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">Owner Login Credentials</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[8px] font-black uppercase tracking-wider">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {ownerName || 'Property Owner'} • OWN{String(ownerId).padStart(4, '0')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-gray-400 flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-orange-500" size={24} />
              <span className="text-xs font-semibold">Generating & Fetching Owner Credentials...</span>
            </div>
          ) : (
            <>
              {/* Credentials Card Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                
                {/* Username */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Username</span>
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                      <span className="text-orange-600 font-mono">@{username}</span>
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(`@${username}`, 'Username')}
                    className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-slate-100 text-slate-700 transition cursor-pointer text-[10px] font-bold flex items-center gap-1"
                    title="Copy Username"
                  >
                    {copiedField === 'Username' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>Copy</span>
                  </button>
                </div>

                {/* Email Address */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Email</span>
                    <span className="text-xs font-bold text-slate-900 block truncate mt-0.5">{email}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(email, 'Email')}
                    className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-slate-100 text-slate-700 transition cursor-pointer text-[10px] font-bold flex items-center gap-1"
                    title="Copy Email"
                  >
                    {copiedField === 'Email' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>Copy</span>
                  </button>
                </div>

              </div>

              {/* Set Password Box */}
              <div className="bg-orange-50/50 border border-orange-200/80 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Lock size={13} className="text-orange-600" />
                    <span className="text-xs font-bold text-slate-800">Set Owner Password</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateRandomPassword}
                    className="text-[10px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Sparkles size={11} />
                    <span>Auto Generate</span>
                  </button>
                </div>

                <form onSubmit={handleSavePassword} className="space-y-2">
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password (min 6 characters)"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full pl-3 pr-8 py-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingPassword || passwordInput.length < 6}
                    className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-extrabold disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition active:scale-98"
                  >
                    {isUpdatingPassword ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Saving Password...</span>
                      </>
                    ) : (
                      <>
                        <Check size={13} className="stroke-[3]" />
                        <span>Set / Save Password</span>
                      </>
                    )}
                  </button>
                </form>

                {savedPassword && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-emerald-700 block uppercase">Saved Password</span>
                      <span className="font-mono font-bold text-emerald-950">{savedPassword}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(savedPassword, 'Password')}
                      className="p-1 text-emerald-700 hover:text-emerald-900 cursor-pointer"
                      title="Copy Password"
                    >
                      {copiedField === 'Password' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons: Copy All & Share WhatsApp */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCopyAll}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition active:scale-95"
                >
                  <Copy size={13} />
                  <span>{copiedField === 'Credentials' ? 'Copied Details!' : 'Copy Details'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="py-2.5 px-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition active:scale-95"
                >
                  <SiWhatsapp size={14} />
                  <span>Send WhatsApp</span>
                </button>
              </div>

            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default OwnerCredentialsModal;
