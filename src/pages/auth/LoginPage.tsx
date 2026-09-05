import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Eye, EyeOff, ShoppingBag, Home, Key, UserCheck, Briefcase,
  ArrowLeft, Sparkles, Mail, KeyRound, RefreshCw, CheckCircle2
} from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';
import { integrationsAPI } from '@/lib/integrationsAPI';
import { toast } from 'react-toastify';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';
import logo from '@/assets/images/logo.png';
import { requestMandatoryPreLoginLocation, getDeviceId, getBrowserSource } from '@/utils/deviceInfo';

interface User {
  id: string | number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'agent' | 'buyer' | 'seller' | 'team leader' | 'sales team leader' | 'presales team leader' | 'sales manager' | 'marketing executive' | 'presales executive' | 'sales executive';
  phone?: string;
  avatar?: string;
  is_active: boolean;
  buyer_id?: number | string;
  seller_id?: number | string;
}

type Persona = 'buyer' | 'seller' | 'owner' | 'tenant' | 'broker';

const PERSONAS: Array<{ id: Persona; label: string; icon: any }> = [
  { id: 'buyer', label: 'Buyer', icon: ShoppingBag },
  { id: 'seller', label: 'Seller', icon: Home },
  { id: 'owner', label: 'Owner', icon: Key },
  { id: 'tenant', label: 'Tenant', icon: UserCheck },
  { id: 'broker', label: 'Broker', icon: Briefcase },
];

interface LoginFormData {
  username: string;
  password: string;
}

const SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
    title: 'Your Trusted Resale Experts',
    sub: 'Simplifying resale property transactions across Maharashtra',
  },
  {
    img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
    title: 'Buy or Sell with Confidence',
    sub: 'Verified listings, fair prices & zero-hassle experience',
  },
  {
    img: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=900&q=80',
    title: 'Resale Made Simple',
    sub: 'Expert guidance from search to final documentation',
  },
];

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slide, setSlide] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  // Authentication Mode: Password vs OTP Login
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [otpStep, setOtpStep] = useState<'input_email' | 'input_otp'>('input_email');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Google OAuth state
  const [googleActive, setGoogleActive] = useState<boolean>(false);
  const [googleClientId, setGoogleClientId] = useState<string>('');
  const googleBtnRef = React.useRef<HTMLDivElement>(null);

  const { login, setAuthSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  const { systemSettings } = useSystemSettings();
  const companyName = systemSettings?.company_name;

  useEffect(() => {
    const reason = sessionStorage.getItem("logout_reason");
    if (reason) {
      toast.info(reason, { autoClose: 5000 });
      sessionStorage.removeItem("logout_reason");
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setSlide(s => (s + 1) % SLIDES.length);
        setFadeIn(true);
      }, 400);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dynamic Google OAuth Config
  useEffect(() => {
    integrationsAPI.getPublicGoogleConfig().then((cfg) => {
      if (cfg && cfg.client_id && cfg.is_active) {
        setGoogleClientId(cfg.client_id);
        setGoogleActive(true);
      }
    });
  }, []);

  // Render Google Button reliably across route transitions
  useEffect(() => {
    if (!googleActive || !googleClientId) return;

    let timerId: any = null;
    let attempts = 0;

    const tryRender = () => {
      attempts++;
      const btnContainer = googleBtnRef.current || document.getElementById('google-login-btn');

      if ((window as any).google?.accounts?.id && btnContainer) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleSuccess,
          });
          btnContainer.innerHTML = '';
          (window as any).google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'rectangular',
          });
          return;
        } catch (err) {
          console.warn('Google button render note:', err);
        }
      }

      if (attempts < 20) {
        timerId = setTimeout(tryRender, 100);
      }
    };

    const SCRIPT_ID = 'google-gsi-client';
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setTimeout(tryRender, 50);
      };
      document.body.appendChild(script);
    } else {
      setTimeout(tryRender, 50);
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [googleActive, googleClientId, authMode]);

  // Handle successful Google OAuth verification & login/registration
  const handleGoogleSuccess = async (response: any) => {
    if (!response || !response.credential) return;
    setLoading(true);
    try {
      const res = await authAPI.googleAuth({
        credential: response.credential,
      });

      // If new user and profile completion is required, route directly to the standard Register Page
      if (res.requires_profile_completion) {
        toast.info('Please complete your registration details.');
        navigate(`/register${location.search || ''}`, {
          state: {
            googleCredential: response.credential,
            googleProfile: {
              email: res.data?.email,
              first_name: res.data?.first_name,
              last_name: res.data?.last_name,
              salutation: 'Mr.',
              role: 'buyer',
            },
          },
        });
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

        const isNewUser = Boolean(res.is_new_user || res.data?.is_new_user);
        const role = (res.data.user.role ?? '').toString().trim().toLowerCase();
        const params = new URLSearchParams(location.search);
        const redirect = params.get('redirect');

        if (redirect) {
          navigate(redirect, { replace: true });
          return;
        }

        // New user on first registration -> redirect to properties
        if (isNewUser) {
          navigate('/properties', { replace: true });
          return;
        }

        // Existing user -> route to role-specific dashboard
        const uid = res.data.user.id || 1;
        if (role === 'buyer') {
          navigate(`/buyer-dashboard/${res.data.user.buyer_id || uid}`, { replace: true });
          return;
        }
        if (role === 'seller') {
          navigate(`/seller-dashboard/${res.data.user.seller_id || uid}`, { replace: true });
          return;
        }
        if (role === 'tenant') {
          navigate(`/tenant-dashboard/${res.data.user.tenant_id || uid}`, { replace: true });
          return;
        }
        if (role === 'owner') {
          navigate(`/owner-dashboard/${res.data.user.owner_id || uid}`, { replace: true });
          return;
        }
        if (role === 'broker') {
          navigate('/properties', { replace: true });
          return;
        }

        const generalRoles = ['marketing executive', 'sales executive', 'presales executive'];
        if (generalRoles.includes(role)) {
          navigate(from || '/dashboard', { replace: true });
          return;
        }

        navigate(from || '/dashboard', { replace: true });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Countdown timer
  useEffect(() => {
    let timer: any;
    if (otpCountdown > 0) {
      timer = setInterval(() => setOtpCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // Send Login OTP to Email / Username
  const handleSendLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpEmail.trim()) {
      setErrors({ otpEmail: 'Email or Username is required' });
      return;
    }
    setOtpLoading(true);
    setErrors({});
    try {
      const res = await authAPI.sendLoginOTP({ emailOrUsername: otpEmail.trim() });
      if (res.success) {
        toast.success(res.message || 'OTP sent successfully!');
        if (res.email) setOtpEmail(res.email);
        setOtpStep('input_otp');
        setOtpCountdown(60);
      } else {
        toast.error(res.message || 'Failed to send OTP.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error sending login code.';
      toast.error(msg);
      setErrors({ otpEmail: msg });
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify Login OTP & Complete Sign In
  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setErrors({ otpCode: 'Please enter the 6-digit OTP code' });
      return;
    }
    setOtpLoading(true);
    setErrors({});
    try {
      const locResult = await requestMandatoryPreLoginLocation();
      const deviceId = getDeviceId();
      const source = getBrowserSource();

      const res = await authAPI.verifyOTPAndLogin({
        email: otpEmail.trim(),
        otp: otpCode.trim(),
        latitude: locResult.latitude,
        longitude: locResult.longitude,
        address: locResult.address,
        device_id: deviceId,
        source: source,
      });

      if (res.success && res.data?.accessToken) {
        if (setAuthSession) {
          setAuthSession(res.data.user, res.data.accessToken, res.data.session_id);
        } else {
          localStorage.setItem('token', res.data.accessToken);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }

        toast.success(`Welcome back ${res.data.user.first_name || ''}! Logged in successfully.`);

        const isNewUser = Boolean(res.is_new_user || res.data?.is_new_user);
        const role = (res.data.user.role ?? '').toString().trim().toLowerCase();
        const params = new URLSearchParams(location.search);
        const redirect = params.get('redirect');

        if (redirect) {
          navigate(redirect, { replace: true });
          return;
        }

        if (isNewUser) {
          navigate('/properties', { replace: true });
          return;
        }

        const uid = res.data.user.id || 1;
        if (role === 'buyer') {
          navigate(`/buyer-dashboard/${res.data.user.buyer_id || uid}`, { replace: true });
          return;
        }
        if (role === 'seller') {
          navigate(`/seller-dashboard/${res.data.user.seller_id || uid}`, { replace: true });
          return;
        }
        if (role === 'tenant') {
          navigate(`/tenant-dashboard/${res.data.user.tenant_id || uid}`, { replace: true });
          return;
        }
        if (role === 'owner') {
          navigate(`/owner-dashboard/${res.data.user.owner_id || uid}`, { replace: true });
          return;
        }
        if (role === 'broker') {
          navigate('/properties', { replace: true });
          return;
        }

        const generalRoles = ['marketing executive', 'sales executive', 'presales executive'];
        if (generalRoles.includes(role)) {
          navigate(from || '/dashboard', { replace: true });
          return;
        }

        navigate(from || '/dashboard', { replace: true });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'OTP verification failed.';
      toast.error(msg);
      setErrors({ otpCode: msg });
    } finally {
      setOtpLoading(false);
    }
  };

  const goToSlide = (i: number) => {
    if (i === slide) return;
    setFadeIn(false);
    setTimeout(() => { setSlide(i); setFadeIn(true); }, 400);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      // 1. Mandatory Location Access Request
      const locResult = await requestMandatoryPreLoginLocation();
      if (locResult.error || !locResult.latitude || !locResult.longitude) {
        const errorMsg = locResult.error || 'Location access is required to log in. Please enable location permissions in your browser and try again.';
        toast.error(errorMsg);
        setErrors(prev => ({ ...prev, password: errorMsg }));
        setLoading(false);
        return;
      }

      const deviceId = getDeviceId();
      const source = getBrowserSource();

      const response = (await (login as any)({
        ...formData,
        latitude: locResult.latitude,
        longitude: locResult.longitude,
        address: locResult.address,
        device_id: deviceId,
        source: source,
      })) as unknown as User;
      const user = response;
      if (!user) { toast.error('Invalid login response'); return; }
      
      const role = (user.role ?? '').toString().trim().toLowerCase();
      const params = new URLSearchParams(location.search);
      const redirect = params.get('redirect');

      if (redirect) {
        navigate(redirect, { replace: true });
        return;
      }

      const uid = (user as any)?.id || 1;
      if (role === 'buyer') {
        navigate(`/buyer-dashboard/${user.buyer_id || uid}`, { replace: true });
        return;
      }
      if (role === 'seller') {
        navigate(`/seller-dashboard/${user.seller_id || uid}`, { replace: true });
        return;
      }
      if (role === 'tenant') {
        navigate(`/tenant-dashboard/${(user as any)?.tenant_id || uid}`, { replace: true });
        return;
      }
      if (role === 'owner') {
        navigate(`/owner-dashboard/${(user as any)?.owner_id || uid}`, { replace: true });
        return;
      }
      if (role === 'broker') {
        navigate('/properties', { replace: true });
        return;
      }

      const generalRoles = ['marketing executive', 'sales executive', 'presales executive'];
      if (generalRoles.includes(role)) { navigate(from || '/dashboard', { replace: true }); return; }
      navigate(from || '/dashboard', { replace: true });
    } catch (err: any) {
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('location')) {
        toast.error(err?.message || 'Location permission is required to log in.');
      } else if (msg.includes('password') || msg.includes('incorrect')) {
        setErrors(prev => ({ ...prev, password: 'Incorrect password. Please try again.' }));
        toast.error('Incorrect password. Please try again.');
      } else if (msg.includes('user') || msg.includes('not found')) {
        setErrors(prev => ({ ...prev, username: 'Username not found.' }));
        toast.error('Username not found.');
      } else {
        setErrors(prev => ({ ...prev, password: 'Invalid credentials.' }));
        toast.error('Invalid username or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const current = SLIDES[slide];

  return (
    <div className="min-h-screen flex bg-white md:bg-[#eef2f6] font-sans overflow-hidden flex-col md:flex-row">
      {/* LEFT SLIDER - Hidden on mobile */}
      <div className="hidden md:flex relative flex-[0_0_46%] md:min-h-screen overflow-hidden flex-col justify-between md:rounded-r-[56px] z-20 shadow-[12px_0_48px_rgba(0,0,0,0.22)]">
        {/* Images */}
        {SLIDES.map((s, i) => (
          <img
            key={i}
            src={s.img}
            alt="Property"
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-450 ${
              i === slide ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(6,6,16,0.30)] via-[rgba(6,6,16,0.06)] to-[rgba(6,6,16,0.75)] rounded-inherit" />

        {/* Brand */}
        <div className="relative z-30 flex items-center px-6 py-5 md:px-[38px] md:py-[34px]">
          <img
            src={logo}
            alt={companyName || 'ResaleExpert'}
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* Caption */}
        <div className="relative z-30 p-[36px_42px_44px] md:p-[36px_42px_44px]">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white/14 backdrop-blur-[8px] border border-white/22 rounded-full mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-[lp-blink_2s_infinite]" />
            <span className="text-[11px] text-white font-semibold text-white/88 tracking-[0.06em] uppercase">
              Live listings
            </span>
          </div>

          <h2 className={`text-[clamp(24px,3vw,38px)] font-extrabold text-white leading-[1.18] tracking-[-0.02em] mb-2.5 transition-opacity duration-400 ${
            fadeIn ? 'opacity-100' : 'opacity-0'
          }`}>
            {current.title}
          </h2>
          <p className={`text-sm text-white/65 leading-[1.55] mb-6 max-w-[270px] transition-opacity duration-400 ${
            fadeIn ? 'opacity-100' : 'opacity-0'
          } md:block hidden`}>
            {current.sub}
          </p>

          <div className="flex gap-1.5 items-center">
            {SLIDES.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full bg-white/32 cursor-pointer transition-all duration-350 ${
                  i === slide ? 'w-[42px] bg-white' : 'w-5'
                }`}
                onClick={() => goToSlide(i)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-6 md:p-[48px_36px] relative min-h-screen md:min-h-0">
        <div className="absolute -top-[100px] -right-[100px] w-[380px] h-[380px] rounded-full bg-radial-gradient from-[rgba(193,163,120,0.13)] to-transparent pointer-events-none hidden md:block" />
        <div className="absolute -bottom-20 left-0 w-[280px] h-[280px] rounded-full bg-radial-gradient from-[rgba(100,120,180,0.07)] to-transparent pointer-events-none hidden md:block" />

        <div className="w-full max-w-[420px] bg-white rounded-[32px] sm:rounded-[40px] p-[28px_22px_32px] sm:p-[40px_36px_34px] relative z-10 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_4px_16px_rgba(0,0,0,0.07),0_20px_56px_rgba(0,0,0,0.08)]">
          
          {/* Top accent bar */}
          <div className="absolute top-0 left-9 right-9 h-[3.5px] bg-gradient-to-r from-transparent via-[#E8720C] to-transparent rounded-b-md" />
          
          {/* Corner accent */}
          <div className="absolute -bottom-px -right-px w-20 h-20 rounded-br-[28px] bg-gradient-to-tr from-transparent via-transparent to-[rgba(193,163,120,0.08)] pointer-events-none" />

          {/* LOGIN FORM */}
          <h1 className="text-[26px] sm:text-[23px] font-extrabold text-[#111] tracking-[-0.025em] mb-1 sm:mb-1">
            Welcome back!
          </h1>
          <p className="text-[14px] sm:text-[13.5px] text-[#9a9a9a] font-normal mb-[16px]">
            Sign in to continue to your account
          </p>

              {/* Login Method Switcher Pill */}
              <div className="flex p-1 bg-blue-50/80 rounded-2xl mb-5 border border-blue-100 max-w-[280px] mx-auto shadow-inner">
                <button
                  type="button"
                  onClick={() => { setAuthMode('password'); setErrors({}); }}
                  className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                    authMode === 'password'
                      ? 'bg-[#1a3a5c] text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Password Login
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('otp'); setErrors({}); }}
                  className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                    authMode === 'otp'
                      ? 'bg-[#1a3a5c] text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  OTP Login
                </button>
              </div>

              {/* PASSWORD LOGIN FORM */}
              {authMode === 'password' && (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-[15px]">
                    <label className="block text-[11px] font-bold text-[#1B4B72] tracking-[0.08em] uppercase mb-1.5" htmlFor="lp-username">
                      Username or Email
                    </label>
                    <div className="relative">
                      <input
                        id="lp-username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter your username or email"
                        className={`w-full p-[12px_16px] border-[1.5px] rounded-[14px] font-inherit text-[14.5px] text-[#111] bg-[#faf8f5] outline-none transition-all duration-200 placeholder:text-[#c0bab0] focus:border-[#c1a378] focus:bg-white focus:shadow-[0_0_0_3.5px_rgba(193,163,120,0.15)] ${
                          errors.username ? 'border-[#e05555] shadow-[0_0_0_3px_rgba(224,85,85,0.12)]' : 'border-[#ece8e0]'
                        }`}
                      />
                    </div>
                    {errors.username && <p className="text-xs text-[#e05555] mt-1">{errors.username}</p>}
                  </div>

                  <div className="mb-[15px]">
                    <label className="block text-[11px] font-bold text-[#1B4B72] tracking-[0.08em] uppercase mb-1.5" htmlFor="lp-password">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="lp-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className={`w-full p-[12px_44px_12px_16px] border-[1.5px] rounded-[14px] font-inherit text-[14.5px] text-[#111] bg-[#faf8f5] outline-none transition-all duration-200 placeholder:text-[#c0bab0] focus:border-[#c1a378] focus:bg-white focus:shadow-[0_0_0_3.5px_rgba(193,163,120,0.15)] ${
                          errors.password ? 'border-[#e05555] shadow-[0_0_0_3px_rgba(224,85,85,0.12)]' : 'border-[#ece8e0]'
                        }`}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-[#c0bab0] p-1 hover:text-[#c1a378] transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-[#e05555] mt-1">{errors.password}</p>}
                  </div>

                  <div className="flex items-center justify-between my-2 mb-[20px]">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" className="w-[15px] h-[15px] accent-[#c1a378] cursor-pointer" />
                      <span className="text-[13px] text-[#666]">Remember me</span>
                    </label>
                    <a href="#" onClick={(e) => e.preventDefault()} className="text-[13px] font-medium text-[#E8720C] hover:underline">
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-[13.5px] bg-gradient-to-br from-[#16162a] to-[#2a2a4a] hover:from-[#e87722] hover:to-[#d0681a] text-white border-none rounded-[14px] font-inherit text-[15px] font-bold tracking-[0.03em] cursor-pointer relative overflow-hidden transition-all duration-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? 'Signing in…' : 'Sign In'}
                  </button>
                </form>
              )}

              {/* OTP LOGIN FORM */}
              {authMode === 'otp' && (
                <div className="space-y-4">
                  {otpStep === 'input_email' ? (
                    <form onSubmit={handleSendLoginOtp} noValidate className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#1B4B72] tracking-[0.08em] uppercase mb-1.5" htmlFor="lp-otp-email">
                          Email or Username
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            id="lp-otp-email"
                            type="text"
                            value={otpEmail}
                            onChange={(e) => {
                              setOtpEmail(e.target.value);
                              if (errors.otpEmail) setErrors((prev) => ({ ...prev, otpEmail: '' }));
                            }}
                            placeholder="Enter your registered email or username"
                            className={`w-full pl-10 pr-4 py-3 border-[1.5px] rounded-[14px] text-[14px] text-[#111] bg-[#faf8f5] outline-none transition-all duration-200 placeholder:text-[#c0bab0] focus:border-[#c1a378] focus:bg-white focus:shadow-[0_0_0_3.5px_rgba(193,163,120,0.15)] ${
                              errors.otpEmail ? 'border-[#e05555]' : 'border-[#ece8e0]'
                            }`}
                          />
                        </div>
                        {errors.otpEmail && <p className="text-xs text-[#e05555] mt-1">{errors.otpEmail}</p>}
                      </div>

                      <button
                        type="submit"
                        disabled={otpLoading}
                        className="w-full py-[13.5px] flex items-center justify-center gap-2 bg-[#1a3a5c] hover:bg-[#e87722] text-white border-none rounded-[14px] font-inherit text-[14.5px] font-bold tracking-[0.03em] cursor-pointer transition-all duration-200 shadow-sm disabled:opacity-60 cursor-pointer"
                      >
                        <Mail className="h-4 w-4" />
                        <span>{otpLoading ? 'Sending Code...' : 'SEND OTP'}</span>
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyLoginOtp} noValidate className="space-y-4">
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                          <span className="truncate">Code sent to <strong>{otpEmail}</strong></span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setOtpStep('input_email'); setOtpCode(''); }}
                          className="text-[11px] font-bold text-[#e87722] hover:underline shrink-0 ml-2 cursor-pointer"
                        >
                          Change
                        </button>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#1B4B72] tracking-[0.08em] uppercase mb-1.5" htmlFor="lp-otp-code">
                          6-Digit Verification Code
                        </label>
                        <div className="relative">
                          <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            id="lp-otp-code"
                            type="text"
                            maxLength={6}
                            autoFocus
                            value={otpCode}
                            onChange={(e) => {
                              setOtpCode(e.target.value.replace(/\D/g, ''));
                              if (errors.otpCode) setErrors((prev) => ({ ...prev, otpCode: '' }));
                            }}
                            placeholder="• • • • • •"
                            className={`w-full pl-10 pr-4 py-3 border-[1.5px] rounded-[14px] text-center tracking-[0.3em] font-mono font-bold text-[18px] text-[#111] bg-[#faf8f5] outline-none transition-all duration-200 focus:border-[#c1a378] focus:bg-white focus:shadow-[0_0_0_3.5px_rgba(193,163,120,0.15)] ${
                              errors.otpCode ? 'border-[#e05555]' : 'border-[#ece8e0]'
                            }`}
                          />
                        </div>
                        {errors.otpCode && <p className="text-xs text-[#e05555] mt-1">{errors.otpCode}</p>}
                      </div>

                      <button
                        type="submit"
                        disabled={otpLoading || otpCode.length < 6}
                        className="w-full py-[13.5px] flex items-center justify-center gap-2 bg-[#1a3a5c] hover:bg-[#e87722] text-white border-none rounded-[14px] font-inherit text-[14.5px] font-bold tracking-[0.03em] cursor-pointer transition-all duration-200 shadow-sm disabled:opacity-60 cursor-pointer"
                      >
                        <span>{otpLoading ? 'Verifying...' : 'Verify & Log In →'}</span>
                      </button>

                      <div className="text-center pt-1">
                        {otpCountdown > 0 ? (
                          <span className="text-xs text-gray-400">Resend code in <strong className="text-gray-600">{otpCountdown}s</strong></span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendLoginOtp}
                            disabled={otpLoading}
                            className="text-xs font-bold text-[#e87722] hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="h-3 w-3" /> Resend Code
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Dynamic Google Sign-In Button Below */}
              {googleActive && (
                <div className="mt-4">
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-[#ece8e0]"></div>
                    <span className="flex-shrink mx-3 text-[#aaa] text-[11px] font-semibold uppercase tracking-wider">or continue with</span>
                    <div className="flex-grow border-t border-[#ece8e0]"></div>
                  </div>
                  <div ref={googleBtnRef} id="google-login-btn" className="w-full flex justify-center min-h-[44px] mt-1" />
                </div>
              )}

              {/* Registration Link on Login Page */}
              <div className="mt-5 text-center text-[13px] text-gray-600">
                <span>Don't have an account?</span>
                <Link to={location.search ? `/register${location.search}` : '/register'} className="font-bold text-[#E8720C] hover:underline ml-1.5">
                  Create Free Account
                </Link>
              </div>

          <div className="flex items-center gap-2.5 my-[20px] mb-3">
            <div className="flex-1 h-px bg-[#ece8e0]" />
            <span className="text-[11px] text-[#c0bab0] whitespace-nowrap tracking-[0.04em]">🔒 secure platform</span>
            <div className="flex-1 h-px bg-[#ece8e0]" />
          </div>

          <div className="flex justify-center">
            <Link to="/" className="text-[13px] text-[#1B4B72] no-underline inline-flex items-center gap-1 hover:text-[#555] transition-colors group">
              <span className="inline-block transition-transform group-hover:-translate-x-1">←</span>
              Back to website
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes lp-blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .animate-lp-blink {
          animation: lp-blink 2s infinite;
        }
        .bg-radial-gradient {
          background-image: radial-gradient(circle, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 70%);
        }
        .rounded-inherit {
          border-radius: inherit;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;