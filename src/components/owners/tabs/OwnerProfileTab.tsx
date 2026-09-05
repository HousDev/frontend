import React, { useState } from 'react';
import {
  User, Mail, Phone, MapPin, Calendar, Key, Lock,
  Copy, Check, Edit, Shield, Sparkles, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { toast } from 'react-toastify';
import ownerAPI from '@/lib/ownerAPI';

interface OwnerProfileTabProps {
  owner: any;
  derivedUsername: string;
  onOpenEditModal: () => void;
}

export const OwnerProfileTab: React.FC<OwnerProfileTabProps> = ({
  owner,
  derivedUsername,
  onOpenEditModal,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [updatingPass, setUpdatingPass] = useState(false);

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(derivedUsername);
    toast.success(`Copied username: @${derivedUsername}`);
  };

  const handleCopyEmail = () => {
    if (owner?.email) {
      navigator.clipboard.writeText(owner.email);
      toast.success(`Copied email: ${owner.email}`);
    }
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$';
    let pass = 'Owner@';
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
    setConfirmPassword(pass);
    setShowPass(true);
    toast.info(`Generated password: ${pass}`);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!owner?.id) {
      toast.error('Owner ID missing');
      return;
    }

    setUpdatingPass(true);
    try {
      await ownerAPI.updatePassword(owner.id, newPassword);
      toast.success(`Password updated successfully! Username: @${derivedUsername}`);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Password update error:', err);
      toast.error(err?.response?.data?.message || 'Failed to update owner password');
    } finally {
      setUpdatingPass(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 👤 Profile Details Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0f2b3d] to-[#1e5274] text-white font-black text-xl flex items-center justify-center shadow-md">
              {owner?.name?.charAt(0)?.toUpperCase() || 'O'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg text-slate-900 leading-tight">
                  {owner?.salutation || 'Mr.'} {owner?.name || 'Property Owner'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  ● {owner?.status || 'Active Owner'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Owner ID: <span className="font-bold text-slate-700">OWN{String(owner?.id || '1').padStart(4, '0')}</span> • Real Estate Investor
              </p>
            </div>
          </div>

          <button
            onClick={onOpenEditModal}
            className="px-4 py-2 rounded-xl bg-[#0f2b3d] hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Edit size={13} />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-6">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Phone Number</span>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Phone size={13} className="text-gray-400" />
              <span>{owner?.phone || 'Not provided'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">WhatsApp</span>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <SiWhatsapp size={13} className="text-green-600" />
              <span>{owner?.whatsapp || owner?.phone || 'Not provided'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Email Address</span>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 truncate">
              <Mail size={13} className="text-gray-400 shrink-0" />
              <span className="truncate">{owner?.email || 'Not provided'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">City & State</span>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <MapPin size={13} className="text-gray-400" />
              <span>{owner?.city || 'Pune'}, {owner?.state || 'Maharashtra'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Assigned Executive</span>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <User size={13} className="text-gray-400" />
              <span>{owner?.assigned_to_name || 'Direct / CRM Team'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Lead Stage / Priority</span>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Shield size={13} className="text-gray-400" />
              <span>{owner?.stage || 'Active'} • {owner?.priority || 'High'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🔐 Login Credentials & Password Management */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            <Key size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Portal Login Credentials & Security</h3>
            <p className="text-xs text-gray-500">Manage owner dashboard credentials and update login password</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Username & Email display */}
          <div className="space-y-3.5 bg-gray-50/70 p-4 rounded-2xl border border-gray-200/70">
            <div>
              <span className="text-[11px] font-bold text-gray-500 block mb-1">Login Username</span>
              <div className="flex items-center justify-between bg-white px-3.5 py-2 rounded-xl border border-gray-200">
                <span className="font-mono text-xs font-bold text-slate-900">@{derivedUsername}</span>
                <button
                  type="button"
                  onClick={handleCopyUsername}
                  className="text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy size={13} />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-gray-500 block mb-1">Registered Email</span>
              <div className="flex items-center justify-between bg-white px-3.5 py-2 rounded-xl border border-gray-200">
                <span className="font-mono text-xs font-bold text-slate-900 truncate">
                  {owner?.email || `${derivedUsername}@resaleexpert.in`}
                </span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="text-xs text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                >
                  <Copy size={13} />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
              <AlertCircle size={14} className="shrink-0 text-amber-600 mt-0.5" />
              <span>You can log in to your owner dashboard using either your <strong>Username</strong> or <strong>Registered Email</strong>.</span>
            </div>
          </div>

          {/* Right: Password Update Form */}
          <form onSubmit={handleUpdatePassword} className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Set New Owner Password</span>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[11px] text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles size={12} />
                <span>Auto-Generate</span>
              </button>
            </div>

            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Enter new password (min. 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-orange-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            <div>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={updatingPass || !newPassword}
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Lock size={13} />
              <span>{updatingPass ? 'Updating Password...' : 'Save & Update Password'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OwnerProfileTab;
