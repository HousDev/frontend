// src/components/public/PropertyAccessModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Lock, CheckCircle2, ShieldAlert, Sparkles, Mail,
  KeyRound, Eye, EyeOff, ShoppingBag, Home, Key, UserCheck, Briefcase, X
} from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import { authAPI } from '@/lib/api';
import { integrationsAPI } from '@/lib/integrationsAPI';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

type Persona = 'buyer' | 'seller' | 'owner' | 'tenant' | 'broker';

const PERSONAS: Array<{ id: Persona; label: string; icon: any }> = [
  { id: 'buyer', label: 'Buyer', icon: ShoppingBag },
  { id: 'seller', label: 'Seller', icon: Home },
  { id: 'owner', label: 'Owner', icon: Key },
  { id: 'tenant', label: 'Tenant', icon: UserCheck },
  { id: 'broker', label: 'Broker', icon: Briefcase },
];

interface PropertyAccessModalProps {
  isOpen: boolean;
  limit: number;
  companyName?: string;
  onSuccess: () => void;
}

export const PropertyAccessModal: React.FC<PropertyAccessModalProps> = ({
  isOpen,
  limit,
  companyName = 'Resale Expert',
  onSuccess,
}) => {
  const { setAuthSession } = useAuth();
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [step, setStep] = useState<'form' | 'otp' | 'google_phone'>('form');
  const [googleCredential, setGoogleCredential] = useState<string>('');

  // Register Form State
  const [formData, setFormData] = useState({
    salutation: 'Mr.',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'buyer' as Persona,
    password: '',
  });

  // Login Form State
  const [loginData, setLoginData] = useState({
    emailOrUsername: '',
    password: '',
  });

  // OTP State
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [googleActive, setGoogleActive] = useState(false);

  // Initialize Google OAuth
  useEffect(() => {
    if (!isOpen) return;
    integrationsAPI.getPublicGoogleConfig().then((cfg) => {
      if (cfg && cfg.client_id && cfg.is_active) {
        setGoogleActive(true);
        if (typeof window !== 'undefined') {
          const existingScript = document.getElementById('google-gsi-modal');
          if (!existingScript) {
            const script = document.createElement('script');
            script.id = 'google-gsi-modal';
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => initGoogle(cfg.client_id);
            document.body.appendChild(script);
          } else {
            initGoogle(cfg.client_id);
          }
        }
      }
    });
  }, [isOpen]);

  const initGoogle = (clientId: string) => {
    if ((window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleSuccess,
      });
      const el = document.getElementById('google-modal-btn');
      if (el) {
        (window as any).google.accounts.id.renderButton(el, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: 250,
        });
      }
    }
  };

  const handleGoogleSuccess = async (response: any) => {
    if (!response || !response.credential) return;
    setGoogleCredential(response.credential);
    setLoading(true);
    try {
      const res = await authAPI.googleAuth({
        credential: response.credential,
        role: formData.role,
        salutation: formData.salutation,
        phone: formData.phone || undefined,
      });

      if (res.requires_profile_completion) {
        setFormData((prev) => ({
          ...prev,
          email: res.data?.email || prev.email,
          first_name: res.data?.first_name || prev.first_name,
          last_name: res.data?.last_name || prev.last_name,
        }));
        setStep('google_phone');
        toast.info('Please enter your phone number to complete registration.');
        return;
      }

      if (res.success && res.data?.accessToken) {
        if (setAuthSession) {
          setAuthSession(res.data.user, res.data.accessToken, res.data.session_id);
        } else {
          localStorage.setItem('token', res.data.accessToken);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
        toast.success(`Welcome ${res.data.user.first_name || ''}!`);
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGooglePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || formData.phone.length < 8) {
      setErrors({ phone: 'Valid phone number with country code is required' });
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.googleAuth({
        credential: googleCredential,
        phone: formData.phone,
        role: formData.role,
        salutation: formData.salutation,
      });

      if (res.success && res.data?.accessToken) {
        if (setAuthSession) {
          setAuthSession(res.data.user, res.data.accessToken, res.data.session_id);
        } else {
          localStorage.setItem('token', res.data.accessToken);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
        toast.success(`Welcome ${res.data.user.first_name || ''}!`);
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown for OTP
  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  const validateRegister = () => {
    const errs: Record<string, string> = {};
    if (!formData.first_name.trim()) errs.first_name = 'Required';
    if (!formData.last_name.trim()) errs.last_name = 'Required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Valid email required';
    if (!formData.phone || formData.phone.length < 8) errs.phone = 'Valid phone required';
    if (!formData.password || formData.password.length < 6) errs.password = 'Min 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegister()) return;

    setLoading(true);
    try {
      await authAPI.sendRegistrationOTP({
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        salutation: formData.salutation,
      });
      toast.success(`OTP sent to ${formData.email}`);
      setStep('otp');
      setTimer(60);
      setCanResend(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpCode.join('');
    if (fullOtp.length !== 6) {
      toast.error('Enter 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.verifyOTPAndRegister({
        email: formData.email,
        otp: fullOtp,
        password: formData.password,
        salutation: formData.salutation,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        role: formData.role,
      });
      if (res.success && res.data?.accessToken) {
        if (setAuthSession) {
          setAuthSession(res.data.user, res.data.accessToken, res.data.session_id);
        } else {
          localStorage.setItem('token', res.data.accessToken);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
        toast.success('Registration successful!');
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.emailOrUsername || !loginData.password) {
      toast.error('Please enter username and password');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login({ username: loginData.emailOrUsername, password: loginData.password });
      const token = res.accessToken || res.data?.accessToken;
      const user = res.user || res.data?.user;
      if (token && user) {
        if (setAuthSession) {
          setAuthSession(user, token, res.session_id || res.data?.session_id);
        } else {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        }
        toast.success(`Welcome back ${user.first_name || res.first_name || ''}!`);
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otpCode];
    newOtp[index] = val.slice(-1);
    setOtpCode(newOtp);

    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#0c2540] to-[#1a3a5c] p-6 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#e87722] rounded-2xl mb-2.5 shadow-md">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-extrabold tracking-tight">
            Unlock Unlimited Property Access
          </h3>
          <p className="text-xs text-blue-200/80 mt-1 max-w-xs mx-auto">
            You've viewed your free limit of <strong>{limit} properties</strong>. Register or sign in to continue viewing unlimited verified resale listings!
          </p>
        </div>

        {/* Tab Switcher (Register vs Login) */}
        <div className="flex border-b border-gray-200 bg-gray-50/50">
          <button
            type="button"
            onClick={() => { setAuthMode('register'); setStep('form'); }}
            className={`flex-1 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              authMode === 'register'
                ? 'bg-white text-[#e87722] border-b-2 border-[#e87722]'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Create Free Account
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-white text-[#e87722] border-b-2 border-[#e87722]'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* REGISTER STEP 1 */}
          {authMode === 'register' && step === 'form' && (
            <form onSubmit={handleSendOtp} className="space-y-3">
              {/* Persona */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">I am a...</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {PERSONAS.map((p) => {
                    const Icon = p.icon;
                    const selected = formData.role === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, role: p.id }))}
                        className={`flex flex-col items-center justify-center p-1.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${
                          selected
                            ? 'bg-orange-50 border-[#e87722] text-[#1a3a5c]'
                            : 'border-gray-200 text-gray-600 bg-gray-50/50'
                        }`}
                      >
                        <Icon className={`h-3.5 w-3.5 mb-0.5 ${selected ? 'text-[#e87722]' : 'text-gray-400'}`} />
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Name */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-3">
                  <select
                    value={formData.salutation}
                    onChange={(e) => setFormData((prev) => ({ ...prev, salutation: e.target.value }))}
                    className="w-full px-2 py-2 text-xs border border-gray-300 rounded-xl bg-white outline-none"
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Dr.">Dr.</option>
                  </select>
                </div>
                <div className="col-span-5">
                  <input
                    type="text"
                    placeholder="First Name *"
                    value={formData.first_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, first_name: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-1 focus:ring-[#e87722]"
                  />
                  {errors.first_name && <p className="text-[10px] text-red-500">{errors.first_name}</p>}
                </div>
                <div className="col-span-4">
                  <input
                    type="text"
                    placeholder="Last Name *"
                    value={formData.last_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, last_name: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-1 focus:ring-[#e87722]"
                  />
                  {errors.last_name && <p className="text-[10px] text-red-500">{errors.last_name}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-1 focus:ring-[#e87722]"
                />
                {errors.email && <p className="text-[10px] text-red-500">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <PhoneInput
                  country={'in'}
                  value={formData.phone}
                  onChange={(phone) => setFormData((prev) => ({ ...prev, phone }))}
                  inputProps={{ required: true }}
                  inputStyle={{ width: '100%', height: '34px', fontSize: '12px', borderRadius: '0.75rem' }}
                  buttonStyle={{ borderRadius: '0.75rem 0 0 0.75rem' }}
                />
                {errors.phone && <p className="text-[10px] text-red-500">{errors.phone}</p>}
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password (min 6 chars) *"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-1 focus:ring-[#e87722] pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                {errors.password && <p className="text-[10px] text-red-500">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#1a3a5c] hover:bg-[#e87722] text-white text-xs font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Sending OTP...' : 'Verify Email & Unlock Properties →'}
              </button>
            </form>
          )}

          {/* STEP: GOOGLE PHONE & ROLE COMPLETION */}
          {authMode === 'register' && step === 'google_phone' && (
            <form onSubmit={handleGooglePhoneSubmit} className="space-y-3 py-1">
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Authenticated as <strong>{formData.email}</strong>. Please enter your phone number to finish.</span>
              </div>

              {/* Persona */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">I am a...</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {PERSONAS.map((p) => {
                    const Icon = p.icon;
                    const selected = formData.role === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, role: p.id }))}
                        className={`flex flex-col items-center justify-center p-1.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${
                          selected
                            ? 'bg-orange-50 border-[#e87722] text-[#1a3a5c]'
                            : 'border-gray-200 text-gray-600 bg-gray-50/50'
                        }`}
                      >
                        <Icon className={`h-3.5 w-3.5 mb-0.5 ${selected ? 'text-[#e87722]' : 'text-gray-400'}`} />
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Phone */}
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-4">
                  <select
                    value={formData.salutation}
                    onChange={(e) => setFormData((prev) => ({ ...prev, salutation: e.target.value }))}
                    className="w-full px-2 py-2 text-xs border border-gray-300 rounded-xl bg-white outline-none"
                  >
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Mrs.">Mrs.</option>
                    <option value="Dr.">Dr.</option>
                  </select>
                </div>
                <div className="col-span-8">
                  <PhoneInput
                    country={'in'}
                    value={formData.phone}
                    onChange={(phone) => setFormData((prev) => ({ ...prev, phone }))}
                    inputProps={{ required: true, autoFocus: true }}
                    inputStyle={{ width: '100%', height: '34px', fontSize: '12px', borderRadius: '0.75rem' }}
                    buttonStyle={{ borderRadius: '0.75rem 0 0 0.75rem' }}
                  />
                  {errors.phone && <p className="text-[10px] text-red-500">{errors.phone}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#1a3a5c] hover:bg-[#e87722] text-white text-xs font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Completing...' : 'Complete & Unlock Properties →'}
              </button>
            </form>
          )}

          {/* OTP STEP */}
          {authMode === 'register' && step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 py-1">
              <div className="text-center space-y-1">
                <div className="w-10 h-10 bg-orange-50 text-[#e87722] rounded-xl mx-auto flex items-center justify-center border border-orange-100">
                  <KeyRound className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-gray-800">Enter Verification Code</h4>
                <p className="text-xs text-gray-500">Sent to <strong>{formData.email}</strong></p>
              </div>

              <div className="flex justify-center gap-2">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-9 h-10 text-center font-bold border-2 border-gray-200 rounded-lg text-sm focus:border-[#e87722] outline-none"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#1a3a5c] hover:bg-[#e87722] text-white text-xs font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Verifying...' : 'Complete & Unlock'}
              </button>
            </form>
          )}

          {/* LOGIN MODE */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email or Username</label>
                <input
                  type="text"
                  placeholder="Enter email or username"
                  value={loginData.emailOrUsername}
                  onChange={(e) => setLoginData((prev) => ({ ...prev, emailOrUsername: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-1 focus:ring-[#e87722]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={loginData.password}
                  onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl outline-none focus:ring-1 focus:ring-[#e87722]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#1a3a5c] hover:bg-[#e87722] text-white text-xs font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 cursor-pointer mt-2"
              >
                {loading ? 'Signing In...' : 'Sign In & Unlock'}
              </button>
            </form>
          )}

          {/* Google Button Below */}
          {googleActive && step === 'form' && (
            <div className="mt-4">
              <div className="relative flex py-1.5 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-2 text-gray-400 text-[11px] font-semibold uppercase">Or continue with</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>
              <div id="google-modal-btn" className="w-full flex justify-center min-h-[44px] mt-1" />
            </div>
          )}

          {/* Quick links to full page */}
          <div className="mt-4 pt-3 border-t border-gray-100 text-center text-[11px] text-gray-500">
            <span>Prefer full screen? </span>
            <a
              href={`/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/properties')}`}
              className="text-[#e87722] font-bold hover:underline ml-1"
            >
              Open Full Login Page →
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
