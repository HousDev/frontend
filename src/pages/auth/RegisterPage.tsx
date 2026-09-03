import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Building, Eye, EyeOff, ShieldCheck, Zap, Sparkles, Mail,
  ArrowRight, KeyRound, CheckCircle2, RotateCcw, User, Phone as PhoneIcon,
  Home, ShoppingBag, Key, UserCheck, Briefcase
} from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';
import { integrationsAPI } from '@/lib/integrationsAPI';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';
import { toast } from 'react-toastify';

type Persona = 'buyer' | 'seller' | 'owner' | 'tenant' | 'broker';

const PERSONAS: Array<{ id: Persona; label: string; sub: string; icon: any }> = [
  { id: 'buyer', label: 'Buyer', sub: 'Looking to purchase', icon: ShoppingBag },
  { id: 'seller', label: 'Seller', sub: 'Looking to sell', icon: Home },
  { id: 'owner', label: 'Owner', sub: 'Property owner / landlord', icon: Key },
  { id: 'tenant', label: 'Tenant', sub: 'Looking to rent', icon: UserCheck },
  { id: 'broker', label: 'Broker / CP', sub: 'Real estate partner', icon: Briefcase },
];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthSession } = useAuth();
  const { systemSettings } = useSystemSettings();
  const companyName = systemSettings?.company_name || 'Resale Expert';

  // Step 1: Form details, Step 2: OTP verification, Step 3: Google Profile Completion (Phone & Role)
  const [step, setStep] = useState<'form' | 'otp' | 'google_phone'>('form');
  const [googleCredential, setGoogleCredential] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState({
    salutation: 'Mr.',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'buyer' as Persona,
    company_name: '',
    password: '',
    confirmPassword: '',
  });

  // OTP State
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [googleClientId, setGoogleClientId] = useState<string>('');
  const [googleActive, setGoogleActive] = useState<boolean>(false);

  // If navigated from login with googleCredential
  useEffect(() => {
    if (location.state?.googleCredential) {
      setGoogleCredential(location.state.googleCredential);
      if (location.state.googleProfile) {
        setFormData((prev) => ({
          ...prev,
          email: location.state.googleProfile.email || prev.email,
          first_name: location.state.googleProfile.first_name || prev.first_name,
          last_name: location.state.googleProfile.last_name || prev.last_name,
          salutation: location.state.googleProfile.salutation || prev.salutation,
          role: location.state.googleProfile.role || prev.role,
        }));
      }
      setStep('google_phone');
    }
  }, [location.state]);

  // Fetch dynamic Google OAuth Client ID
  useEffect(() => {
    integrationsAPI.getPublicGoogleConfig().then((cfg) => {
      if (cfg && cfg.client_id && cfg.is_active) {
        setGoogleClientId(cfg.client_id);
        setGoogleActive(true);
        loadGoogleScript(cfg.client_id);
      }
    });
  }, []);

  // Initialize Google Identity Services
  const loadGoogleScript = (clientId: string) => {
    if (typeof window === 'undefined') return;
    const existingScript = document.getElementById('google-gsi-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => renderGoogleButton(clientId);
      document.body.appendChild(script);
    } else {
      renderGoogleButton(clientId);
    }
  };

  const renderGoogleButton = (clientId: string) => {
    if ((window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCallback,
      });
      const target = document.getElementById('google-register-btn');
      if (target) {
        (window as any).google.accounts.id.renderButton(target, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          shape: 'rectangular',
        });
      }
    }
  };

  // Google OAuth Callback Handler
  const handleGoogleCallback = async (response: any) => {
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

      // If new user and phone number is required
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
        toast.success(`Welcome ${res.data.user.first_name || 'back'}! Logged in with Google.`);
        
        const params = new URLSearchParams(location.search);
        const redirect = params.get('redirect') || '/properties';
        navigate(redirect, { replace: true });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Submit Phone & Persona for Google User
  const handleGooglePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.first_name?.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name?.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.phone || formData.phone.length < 8) {
      newErrors.phone = 'Valid phone number with country code is required';
    }
    if (formData.role === 'broker' && !formData.company_name?.trim()) {
      newErrors.company_name = 'Company Name / Firm Name is required for brokers';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.googleAuth({
        credential: googleCredential,
        phone: formData.phone,
        role: formData.role,
        salutation: formData.salutation,
        first_name: formData.first_name,
        last_name: formData.last_name,
        company_name: formData.company_name,
      });

      if (res.success && res.data?.accessToken) {
        if (setAuthSession) {
          setAuthSession(res.data.user, res.data.accessToken, res.data.session_id);
        } else {
          localStorage.setItem('token', res.data.accessToken);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
        toast.success(`Welcome ${res.data.user.first_name || ''}! Registration complete.`);
        
        const params = new URLSearchParams(location.search);
        const redirect = params.get('redirect') || '/properties';
        navigate(redirect, { replace: true });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone || formData.phone.length < 8) {
      newErrors.phone = 'Valid phone number with country code is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.role === 'broker' && !formData.company_name?.trim()) {
      newErrors.company_name = 'Company Name / Firm Name is required for brokers';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 1 Submit: Send OTP to Email
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await authAPI.sendRegistrationOTP({
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        salutation: formData.salutation,
      });

      toast.success(`Verification code sent to ${formData.email}!`);
      setStep('otp');
      setTimer(60);
      setCanResend(false);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!canResend) return;
    setLoading(true);
    try {
      await authAPI.sendRegistrationOTP({
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        salutation: formData.salutation,
      });
      toast.info('A new verification code has been sent!');
      setTimer(60);
      setCanResend(false);
      setOtpCode(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  // Handle individual OTP digit inputs
  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otpCode];
    newOtp[index] = val.slice(-1);
    setOtpCode(newOtp);

    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Step 2 Submit: Verify OTP & Complete Registration
  const handleVerifyAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpCode.join('');
    if (fullOtp.length !== 6) {
      toast.error('Please enter the full 6-digit verification code.');
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
        toast.success('Registration and email verification successful!');
        
        const params = new URLSearchParams(location.search);
        const redirect = params.get('redirect') || '/properties';
        navigate(redirect, { replace: true });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c2540] via-[#1a3a5c] to-[#0a1b2d] flex items-center justify-center p-4 py-8 relative overflow-hidden">
      {/* Background Decorative Blur Circles */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#e87722]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Branding & Value Props */}
        <div className="lg:col-span-5 text-white space-y-6 px-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs font-semibold text-orange-300">
            <Sparkles className="h-3.5 w-3.5" />
            Verified Real Estate Platform
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              Join <span className="text-[#e87722]">{companyName}</span>
            </h1>
            <p className="text-sm text-blue-100/80 leading-relaxed">
              Create an account to browse verified property resale listings, connect with top agents, schedule visits, and manage inquiries seamlessly.
            </p>
          </div>

          {/* Persona Benefits Preview */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
              <div className="p-2 bg-[#e87722]/20 rounded-xl text-orange-400 mt-0.5">
                <Home className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Exclusive Resale Inventory</h4>
                <p className="text-[11px] text-blue-200/70">Access direct-from-owner and verified broker listings before they hit open portals.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
              <div className="p-2 bg-blue-500/20 rounded-xl text-blue-300 mt-0.5">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Direct Agent & Owner Follow-Up</h4>
                <p className="text-[11px] text-blue-200/70">Get instant WhatsApp and phone notifications for property matches tailored to your persona.</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs text-blue-200/70">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-400 font-bold hover:underline ml-1">
                Sign in here →
              </Link>
            </p>
          </div>
        </div>

        {/* Right Column: Registration / OTP Card */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-8 relative">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#1a3a5c]">
                  {step === 'form'
                    ? 'Create Your Account'
                    : step === 'google_phone'
                    ? 'Complete Your Profile'
                    : 'Verify Email Address'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {step === 'form'
                    ? 'Fill your details below to get started'
                    : step === 'google_phone'
                    ? `Welcome ${formData.first_name}! Please enter your phone number to finish setup.`
                    : `We sent a 6-digit code to ${formData.email}`}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#e87722] tracking-wider">
                  {step === 'form' ? 'Step 1 of 2' : 'Step 2 of 2'}
                </span>
                <div className="flex gap-1 mt-1">
                  <div className="w-6 h-1.5 bg-[#e87722] rounded-full" />
                  <div className={`w-6 h-1.5 rounded-full ${step !== 'form' ? 'bg-[#e87722]' : 'bg-gray-200'}`} />
                </div>
              </div>
            </div>

            {/* STEP 1: REGISTRATION FORM */}
            {step === 'form' && (
              <form onSubmit={handleSendOTP} className="space-y-4">

                {/* Persona / Role Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    I am a... <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {PERSONAS.map((p) => {
                      const Icon = p.icon;
                      const selected = formData.role === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, role: p.id }))}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all cursor-pointer text-center ${
                            selected
                              ? 'bg-orange-50/80 border-[#e87722] text-[#1a3a5c] ring-2 ring-orange-500/20 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-gray-50/50'
                          }`}
                        >
                          <Icon className={`h-4 w-4 mb-1 ${selected ? 'text-[#e87722]' : 'text-gray-400'}`} />
                          <span className="text-xs font-bold">{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Name Row with Salutation */}
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-3 sm:col-span-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Title</label>
                    <select
                      name="salutation"
                      value={formData.salutation}
                      onChange={handleChange}
                      className="w-full px-2.5 py-2 text-xs border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-[#e87722] focus:border-transparent outline-none font-medium text-gray-800"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Dr.">Dr.</option>
                    </select>
                  </div>

                  <div className="col-span-5 sm:col-span-5">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="e.g. John"
                      className={`w-full px-3 py-2 text-xs border rounded-xl outline-none transition-all ${
                        errors.first_name ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:ring-2 focus:ring-[#e87722]'
                      }`}
                    />
                    {errors.first_name && <p className="text-[10px] text-red-500 mt-0.5">{errors.first_name}</p>}
                  </div>

                  <div className="col-span-4 sm:col-span-4">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="e.g. Doe"
                      className={`w-full px-3 py-2 text-xs border rounded-xl outline-none transition-all ${
                        errors.last_name ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:ring-2 focus:ring-[#e87722]'
                      }`}
                    />
                    {errors.last_name && <p className="text-[10px] text-red-500 mt-0.5">{errors.last_name}</p>}
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className={`w-full pl-9 pr-3 py-2 text-xs border rounded-xl outline-none transition-all ${
                          errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:ring-2 focus:ring-[#e87722]'
                        }`}
                      />
                    </div>
                    {errors.email && <p className="text-[10px] text-red-500 mt-0.5">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <PhoneInput
                      country={'in'}
                      value={formData.phone}
                      onChange={(phone) => {
                        setFormData((prev) => ({ ...prev, phone }));
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                      }}
                      inputProps={{
                        name: 'phone',
                        required: true,
                        autoFocus: false,
                      }}
                      inputStyle={{
                        width: '100%',
                        height: '34px',
                        fontSize: '12px',
                        borderRadius: '0.75rem',
                        borderColor: errors.phone ? '#f87171' : '#d1d5db',
                      }}
                      buttonStyle={{
                        borderRadius: '0.75rem 0 0 0.75rem',
                        borderColor: errors.phone ? '#f87171' : '#d1d5db',
                      }}
                    />
                    {errors.phone && <p className="text-[10px] text-red-500 mt-0.5">{errors.phone}</p>}
                  </div>
                </div>

                {/* Password & Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Min. 6 characters"
                        className={`w-full pr-9 pl-3 py-2 text-xs border rounded-xl outline-none transition-all ${
                          errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:ring-2 focus:ring-[#e87722]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-[10px] text-red-500 mt-0.5">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter password"
                        className={`w-full pr-9 pl-3 py-2 text-xs border rounded-xl outline-none transition-all ${
                          errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:ring-2 focus:ring-[#e87722]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-[10px] text-red-500 mt-0.5">{errors.confirmPassword}</p>}
                  </div>
                </div>

                {/* Broker Mandatory Company Name - Placed after Password & Confirm Password */}
                {formData.role === 'broker' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Company Name / Firm Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        placeholder="e.g. Apex Realty & Consultants"
                        className={`w-full pl-9 pr-3 py-2 text-xs border rounded-xl outline-none transition-all ${
                          errors.company_name ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:ring-2 focus:ring-[#e87722]'
                        }`}
                      />
                    </div>
                    {errors.company_name && <p className="text-[10px] text-red-500 mt-0.5">{errors.company_name}</p>}
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1a3a5c] hover:bg-[#e87722] text-white text-sm font-bold rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer mt-2"
                >
                  {loading ? 'Sending Verification Code...' : 'Send Verification OTP →'}
                </button>

                {/* Google Sign-In Option Below */}
                {googleActive && (
                  <div className="pt-2 space-y-3">
                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-gray-200"></div>
                      <span className="flex-shrink mx-3 text-gray-400 text-xs font-semibold uppercase">Or continue with</span>
                      <div className="flex-grow border-t border-gray-200"></div>
                    </div>
                    <div id="google-register-btn" className="w-full flex justify-center min-h-[44px]" />
                  </div>
                )}
              </form>
            )}

            {/* STEP 3: GOOGLE PROFILE COMPLETION (PHONE & PERSONA) */}
            {step === 'google_phone' && (
              <form onSubmit={handleGooglePhoneSubmit} className="space-y-4 py-2">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>
                    Authenticated as <strong>{formData.email}</strong>. Please complete phone & persona to finalize your account.
                  </span>
                </div>

                {/* Persona */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    I am a... <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {PERSONAS.map((p) => {
                      const Icon = p.icon;
                      const selected = formData.role === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, role: p.id }))}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all cursor-pointer text-center ${
                            selected
                              ? 'bg-orange-50/80 border-[#e87722] text-[#1a3a5c] ring-2 ring-orange-500/20 shadow-sm'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-gray-50/50'
                          }`}
                        >
                          <Icon className={`h-4 w-4 mb-1 ${selected ? 'text-[#e87722]' : 'text-gray-400'}`} />
                          <span className="text-xs font-bold">{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Salutation, First Name & Last Name */}
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Title</label>
                    <select
                      name="salutation"
                      value={formData.salutation}
                      onChange={handleChange}
                      className="w-full px-2.5 py-2 text-xs border border-gray-300 rounded-xl bg-white outline-none"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Dr.">Dr.</option>
                    </select>
                  </div>

                  <div className="col-span-4">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="e.g. John"
                      className={`w-full px-3 py-2 text-xs border rounded-xl outline-none transition-all ${
                        errors.first_name ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:ring-2 focus:ring-[#e87722]'
                      }`}
                    />
                    {errors.first_name && <p className="text-[10px] text-red-500 mt-0.5">{errors.first_name}</p>}
                  </div>

                  <div className="col-span-5">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="e.g. Doe"
                      className={`w-full px-3 py-2 text-xs border rounded-xl outline-none transition-all ${
                        errors.last_name ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:ring-2 focus:ring-[#e87722]'
                      }`}
                    />
                    {errors.last_name && <p className="text-[10px] text-red-500 mt-0.5">{errors.last_name}</p>}
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <PhoneInput
                    country={'in'}
                    value={formData.phone}
                    onChange={(phone) => {
                      setFormData((prev) => ({ ...prev, phone }));
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                    }}
                    inputProps={{ required: true, autoFocus: true }}
                    inputStyle={{ width: '100%', height: '36px', fontSize: '13px', borderRadius: '0.75rem' }}
                    buttonStyle={{ borderRadius: '0.75rem 0 0 0.75rem' }}
                  />
                  {errors.phone && <p className="text-[10px] text-red-500 mt-0.5">{errors.phone}</p>}
                </div>

                {/* Conditional Broker Company Name */}
                {formData.role === 'broker' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Company / Agency Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      placeholder="e.g. Apex Realty & Consultants"
                      className={`w-full px-3 py-2 text-xs border rounded-xl outline-none transition-all ${
                        errors.company_name ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:ring-2 focus:ring-[#e87722]'
                      }`}
                    />
                    {errors.company_name && <p className="text-[10px] text-red-500 mt-0.5">{errors.company_name}</p>}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#1a3a5c] hover:bg-[#e87722] text-white text-sm font-bold rounded-2xl transition-all duration-200 shadow-md disabled:opacity-50 cursor-pointer mt-2"
                >
                  {loading ? 'Completing Registration...' : 'Complete Registration & Continue →'}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleCredential('');
                      setStep('form');
                    }}
                    className="text-xs text-gray-500 hover:text-gray-800 font-medium cursor-pointer inline-flex items-center gap-1"
                  >
                    ← Cancel & register with another method
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: OTP VERIFICATION SCREEN */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyAndRegister} className="space-y-6 py-2">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-orange-50 text-[#e87722] rounded-2xl mx-auto flex items-center justify-center border border-orange-100">
                    <KeyRound className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">Enter 6-Digit Code</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    We sent a security code to <strong className="text-gray-800">{formData.email}</strong>. Please enter it below to activate your account.
                  </p>
                </div>

                {/* 6 Digit Inputs */}
                <div className="flex justify-center gap-2.5">
                  {otpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-12 text-center text-lg font-extrabold border-2 border-gray-200 rounded-xl focus:border-[#e87722] focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-[#1a3a5c] bg-gray-50/50"
                    />
                  ))}
                </div>

                {/* Actions & Resend Timer */}
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#1a3a5c] hover:bg-[#e87722] text-white text-sm font-bold rounded-2xl transition-all duration-200 shadow-md disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? 'Verifying & Creating Account...' : 'Verify OTP & Complete Registration'}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1 px-1">
                    <button
                      type="button"
                      onClick={() => setStep('form')}
                      className="text-gray-500 hover:text-gray-800 font-medium cursor-pointer"
                    >
                      ← Change Details
                    </button>

                    <div>
                      {canResend ? (
                        <button
                          type="button"
                          onClick={handleResendOTP}
                          disabled={loading}
                          className="text-[#e87722] font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <RotateCcw className="h-3 w-3" /> Resend Code
                        </button>
                      ) : (
                        <span className="text-gray-400">
                          Resend in <strong className="text-gray-600">{timer}s</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Direct Sign-In Link */}
            <div className="mt-5 text-center text-xs text-gray-600">
              <span>Already have an account?</span>
              <Link to={location.search ? `/login${location.search}` : '/login'} className="font-bold text-[#e87722] hover:underline ml-1.5">
                Sign In
              </Link>
            </div>

            {/* Terms Notice */}
            <p className="text-[10px] text-gray-400 text-center mt-4">
              By continuing, you agree to {companyName}'s{' '}
              <Link to="/terms-conditions" className="underline hover:text-gray-600">Terms of Service</Link>{' '}
              and <Link to="/privacy-policy" className="underline hover:text-gray-600">Privacy Policy</Link>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;