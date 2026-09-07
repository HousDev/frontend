import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Mail,
  User,
  Phone,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  Loader2,
  ArrowRight,
  RefreshCw,
  Lock,
  UserCheck,
  ChevronRight,
  Copy,
  Check,
  PhoneForwarded,
  Info,
  Repeat,
  ChevronDown,
  Building,
  CalendarDays,
  Bookmark,
  ExternalLink,
  LayoutDashboard,
  Clock,
  MapPin,
  Sparkles
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { tenantAPI } from '@/lib/tenantAPI';
import { tenantVisitAPI } from '@/lib/tenantVisitAPI';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import { saveTenantShortlist } from '@/lib/tenantShortlist';
import { EmailOtpLottie, SecurityShieldLottie, SuccessCelebrationLottie } from '@/components/animations/LottieAnimations';

interface ContactOwnerTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
  defaultAction?: 'contact' | 'schedule';
}

export const ContactOwnerTenantModal: React.FC<ContactOwnerTenantModalProps> = ({
  isOpen,
  onClose,
  property,
  defaultAction = 'contact',
}) => {
  const navigate = useNavigate();
  const { user: currentUser, setAuthSession } = useAuth();

  // Steps: 'email' -> 'otp' -> 'details' -> 'unlocked'
  const [step, setStep] = useState<'email' | 'otp' | 'details' | 'unlocked'>('email');
  const [loading, setLoading] = useState<boolean>(false);
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [copiedPhone, setCopiedPhone] = useState<boolean>(false);
  const [existingUserDetected, setExistingUserDetected] = useState<boolean>(false);

  // Form State
  const [email, setEmail] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [tenantType, setTenantType] = useState<string>('Family');
  const [moveInDate, setMoveInDate] = useState<string>('Immediately');
  const [message, setMessage] = useState<string>('');

  // Visit Scheduling State
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [wantsScheduleVisit, setWantsScheduleVisit] = useState<boolean>(defaultAction === 'schedule');
  const [visitDate, setVisitDate] = useState<string>(tomorrowStr);
  const [visitTime, setVisitTime] = useState<string>('11:00 AM');
  const [visitRemarks, setVisitRemarks] = useState<string>('');
  const [schedulingVisitDirect, setSchedulingVisitDirect] = useState<boolean>(false);
  const [visitBookedSuccess, setVisitBookedSuccess] = useState<boolean>(false);

  // Unlocked Owner details
  const [ownerData, setOwnerData] = useState<any>(null);

  // OTP input refs
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setEmail(currentUser?.email || '');
      setName(currentUser ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() : '');
      setPhone(currentUser?.phone || '');
      setOtpDigits(['', '', '', '', '', '']);
      setCopiedPhone(false);
      setWantsScheduleVisit(defaultAction === 'schedule');
      setVisitBookedSuccess(false);

      // ✅ If already logged in as tenant → skip OTP, directly show owner details
      if (currentUser?.role === 'tenant' && property?.id) {
        setStep('unlocked');
        setLoading(true);
        setOwnerData(null);
        tenantAPI.getOwnerDetails(property.id, currentUser.email)
          .then((res: any) => {
            const fallbackName = property?.owner_name || property?.owner?.name || 'Property Owner';
            const fallbackPhone = property?.owner_phone || property?.owner?.phone || null;
            const fallbackEmail = property?.owner_email || property?.owner?.email || null;
            const fallbackWhatsapp = property?.owner_whatsapp || property?.owner?.whatsapp || fallbackPhone;

            if (res?.owner) {
              setOwnerData({
                ...res.owner,
                name: (res.owner.name && res.owner.name !== 'Property Owner') ? res.owner.name : fallbackName,
                phone: res.owner.phone || fallbackPhone,
                email: res.owner.email || fallbackEmail,
                whatsapp: res.owner.whatsapp || fallbackWhatsapp,
              });
            } else {
              setOwnerData({
                name: fallbackName,
                phone: fallbackPhone,
                email: fallbackEmail,
                whatsapp: fallbackWhatsapp,
              });
            }
          })
          .catch(() => {
            setOwnerData({
              name: property?.owner_name || property?.owner?.name || 'Property Owner',
              phone: property?.owner_phone || property?.owner?.phone || null,
              email: property?.owner_email || property?.owner?.email || null,
              whatsapp: property?.owner_whatsapp || property?.owner?.whatsapp || null,
            });
          })
          .finally(() => setLoading(false));
      } else {
        // New user — show email verification flow
        setStep('email');
        setLoading(false);
        setOwnerData(null);
      }
    } else {
      setStep('email');
      setEmail('');
      setName('');
      setPhone('');
      setOtpDigits(['', '', '', '', '', '']);
      setLoading(false);
      setOwnerData(null);
      setCopiedPhone(false);
      setVisitBookedSuccess(false);
      setExistingUserDetected(false);
    }
  }, [isOpen, property?.id, currentUser?.role, currentUser?.email, defaultAction]);

  // Direct schedule visit for already logged in tenant
  const handleDirectScheduleVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitDate) {
      toast.error('Please select a visit date');
      return;
    }
    setSchedulingVisitDirect(true);
    try {
      const tenantId = currentUser?.id || null;

      await tenantVisitAPI.create({
        tenant_id: tenantId,
        rental_property_id: property?.id,
        property_title: propertyTitle,
        visit_date: visitDate,
        visit_time: visitTime || '11:00 AM',
        meeting_point: property?.society_name || property?.location || 'Property Location',
        remarks: visitRemarks || 'Scheduled via Rental Property page',
        status: 'Scheduled',
      });

      setVisitBookedSuccess(true);
      toast.success('Site visit scheduled successfully! Details saved to your Tenant Account & Owner Portal.');
    } catch (err: any) {
      console.error('Direct visit schedule error:', err);
      toast.error(err?.message || 'Failed to schedule site visit');
    } finally {
      setSchedulingVisitDirect(false);
    }
  };


  // Resend countdown timer
  useEffect(() => {
    let interval: any = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (!isOpen) return null;

  const propertyTitle = property?.society_name
    ? `${property?.unit_type || '2 BHK'} Flat for Rent in ${property?.society_name}`
    : `Rental Property in ${property?.location || property?.city || 'Pune'}`;

  const fullOtp = otpDigits.join('');

  const handleOtpChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length > 1) {
      const digits = cleaned.slice(0, 6).split('');
      const updated = [...otpDigits];
      digits.forEach((d, i) => {
        if (i < 6) updated[i] = d;
      });
      setOtpDigits(updated);
      const nextFocus = Math.min(digits.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    const updated = [...otpDigits];
    updated[index] = cleaned;
    setOtpDigits(updated);

    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // 1. STEP 1: Send OTP to Email (If email already exists, show sign in prompt or redirect)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error('Please enter a valid Email address');
      return;
    }

    setLoading(true);
    setExistingUserDetected(false);
    try {
      const res = await tenantAPI.sendOtp({
        email: email.trim(),
        name: name.trim() || 'Tenant',
        rental_property_id: property?.id,
      });

      if (res?.exists) {
        setExistingUserDetected(true);
        toast.info(res.message || 'Account already exists for this email. Please sign in to continue.');
        return;
      }

      if (res?.success) {
        toast.success(res.message || 'Security verification code sent to your email!');
        setStep('otp');
        setResendTimer(60);
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      } else {
        toast.error(res?.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err: any) {
      console.error('Send OTP error:', err);
      if (err?.response?.data?.exists) {
        setExistingUserDetected(true);
        toast.info(err.response.data.message || 'Account already exists for this email. Please sign in to continue.');
        return;
      }
      toast.error(err?.response?.data?.message || 'Error sending code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2. STEP 2: Verify OTP -> Proceed to Details
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullOtp.length < 6) {
      toast.error('Please enter the complete 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      const res = await tenantAPI.verifyOtp({
        email: email.trim(),
        otp: fullOtp.trim(),
      });

      if (res?.success) {
        setStep('details');
        toast.success(res.message || 'Email verified successfully! Please complete your tenant info.');
      } else {
        toast.error(res?.message || 'Invalid verification code. Please check your email.');
      }
    } catch (err: any) {
      console.error('OTP check error:', err);
      toast.error(err?.response?.data?.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  // 3. STEP 3: Complete Details & Register in Tenant Table
  const handleCompleteTenantRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your full Name');
      return;
    }
    if (!phone || phone.trim().length < 10) {
      toast.error('Please enter a valid 10-digit Mobile Number');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        email: email.trim(),
        otp: fullOtp.trim(),
        name: name.trim(),
        phone: phone.trim(),
        whatsapp: phone.trim(),
        tenant_type: tenantType,
        move_in_date: moveInDate,
        preferred_bhk: property?.unit_type || '2 BHK',
        rental_property_id: property?.id,
      };

      if (wantsScheduleVisit && visitDate) {
        payload.schedule_visit = {
          visit_date: visitDate,
          visit_time: visitTime || '11:00 AM',
          meeting_point: property?.society_name || property?.location || 'Property Location',
          remarks: visitRemarks || 'Scheduled via Rental Property page',
          property_title: propertyTitle,
        };
      }

      const res = await tenantAPI.verifyAndRegister(payload);

      if (res?.success) {
        toast.success('Registration verified! Redirecting to your Tenant Dashboard...');

        // Save verified tenant data for instant multi-property access
        localStorage.setItem('verified_tenant', JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          phone: phone.trim(),
        }));

        // Trigger 3-second preference prompt in tenant dashboard
        localStorage.setItem('prompt_tenant_preferences', 'true');

        // ✅ Password reminder — tenant got auto-generated password, should update it
        localStorage.setItem('show_password_reminder', 'true');

        // Save auto-login session
        if (res.token && res.user) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          if (setAuthSession) {
            try {
              setAuthSession(res.user, res.token);
            } catch (e) {
              console.warn('Auto login session sync note:', e);
            }
          }
        }

        // ✅ Save shortlist ONLY after successful verified registration
        if (property) {
          saveTenantShortlist({
            ...property,
            owner_name: res?.owner?.name || property.owner_name,
            owner_phone: res?.owner?.phone || property.owner_phone,
            owner_email: res?.owner?.email || property.owner_email,
            owner_whatsapp: res?.owner?.whatsapp || property.owner_whatsapp,
          });
        }

        // ✅ Save owner details so tenant dashboard can show them immediately
        if (res.owner) {
          localStorage.setItem('last_unlocked_owner', JSON.stringify({
            ...res.owner,
            property_title: propertyTitle,
            property_id: property?.id,
          }));
        }

        onClose();
        navigate('/tenant-dashboard');
      } else {
        toast.error(res?.message || 'Failed to complete registration. Please try again.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      toast.error(err?.response?.data?.message || 'Failed to save tenant information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPhone(true);
    toast.info('Phone number copied to clipboard');
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">

        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-all flex items-center justify-center shadow-xs cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT COLUMN: Pastel Cream Box with 3D Hand Graphic & 3 Benefit Cards */}
        <div className="md:col-span-5 bg-[#FFFBEB] p-6 sm:p-7 flex flex-col justify-between relative border-b md:border-b-0 md:border-r border-amber-100/80">

          <div>
            {/* Graphic Badge */}
            <div className="flex justify-end mb-2">
              <div className="w-14 h-14 bg-amber-200/50 rounded-2xl flex items-center justify-center shadow-xs rotate-6">
                <span className="text-3xl animate-bounce">👋</span>
              </div>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight mb-4">
              Contact the Listing Owner Directly
            </h3>

            {/* 3 Benefit Cards */}
            <div className="space-y-3">

              <div className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl border border-amber-200/60 shadow-2xs flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <PhoneForwarded className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] font-semibold text-slate-700 leading-snug">
                  Check current availability and plan an immediate site visit.
                </p>
              </div>

              <div className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl border border-amber-200/60 shadow-2xs flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Info className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] font-semibold text-slate-700 leading-snug">
                  Discuss rent, security deposit, furnishing, and move-in date directly.
                </p>
              </div>

              <div className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl border border-amber-200/60 shadow-2xs flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Repeat className="w-3.5 h-3.5" />
                </div>
                <p className="text-[11px] font-semibold text-slate-700 leading-snug">
                  Shortlist similar 0% brokerage rental homes in this locality faster.
                </p>
              </div>

            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-amber-200/50 flex items-center gap-1.5 text-[10px] text-amber-900/70 font-semibold">
            <Lock className="w-3.5 h-3.5 text-amber-700" /> 100% Privacy Protected • Zero Spam
          </div>

        </div>

        {/* RIGHT COLUMN: 4-Step Interactive Flow */}
        <div className="md:col-span-7 p-6 sm:p-7 flex flex-col justify-center bg-white min-h-[420px]">

          {/* STEP 1: EMAIL ENTRY */}
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  Step 1 of 3: Email Verification
                </span>
                <h4 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                  Connect with Property Owner
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your email address to receive a secure 6-digit OTP verification code.
                </p>
              </div>

              {/* Owner Privacy Verified Badge */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-[#0b3856] text-white font-black text-sm flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    Verified Property Owner
                  </h5>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Direct Owner • 0% Brokerage
                  </span>
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-3.5 pr-10 py-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent transition-all font-medium text-slate-800"
                  />
                  <Mail className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Existing User Banner if detected */}
              {existingUserDetected && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-start gap-2.5">
                    <UserCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <h6 className="text-xs font-black text-amber-950">
                        Account Already Exists!
                      </h6>
                      <p className="text-[11px] text-amber-900 mt-0.5 leading-snug">
                        An account with <span className="font-bold">{email}</span> already exists. Please sign in to view owner contact details instantly.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}&email=${encodeURIComponent(email)}`);
                        }}
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b3856] hover:bg-[#07263b] text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-300" />
                        <span>Sign In to Your Account</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons: Send OTP + Sign In Option */}
              <div className="pt-2 space-y-2.5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3.5 px-4 rounded-xl bg-[#FFCC00] hover:bg-[#F5B800] active:scale-[0.99] text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-400/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Security Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Verification Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}&email=${encodeURIComponent(email)}`);
                    }}
                    className="py-3.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-2xs"
                    title="Already have an account? Sign In"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Sign In</span>
                  </button>
                </div>

                <div className="text-center">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Already registered with us?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}&email=${encodeURIComponent(email)}`);
                      }}
                      className="text-[#0b3856] hover:text-amber-600 font-black underline cursor-pointer"
                    >
                      Sign In here
                    </button>
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                By continuing, you agree to our Terms of Service & Privacy Policy.
              </p>
            </form>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 uppercase tracking-wider">
                  Step 2 of 3: Security Code
                </span>
                <h4 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                  Enter 6-Digit Code
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  We've sent a verification code to <span className="font-bold text-slate-800">{email}</span>
                </p>
              </div>

              {/* 6-Digit Input Box Grid */}
              <div className="flex justify-center gap-2 sm:gap-2.5 py-2">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpInputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-10 h-12 sm:w-11 sm:h-13 text-center text-lg font-black rounded-xl border-2 border-slate-200 focus:border-[#f59e0b] focus:ring-2 focus:ring-amber-200 outline-none transition-all bg-slate-50 focus:bg-white text-slate-900"
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || fullOtp.length < 6}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0b3856] hover:bg-[#07263b] active:scale-[0.99] text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>

              {/* Resend & Change Email Buttons */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  Change Email
                </button>

                <button
                  type="button"
                  disabled={resendTimer > 0 || loading}
                  onClick={handleSendOtp}
                  className="text-[#E6761D] hover:underline font-bold disabled:opacity-50 disabled:no-underline cursor-pointer"
                >
                  {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend Code'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: FULL TENANT DETAILS FORM */}
          {step === 'details' && (
            <form onSubmit={handleCompleteTenantRegistration} className="space-y-3.5">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-900 uppercase tracking-wider">
                  Step 3 of 3: Tenant Profile
                </span>
                <h4 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                  Complete Tenant Information
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Save your details to unlock direct owner phone & WhatsApp contact.
                </p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#f59e0b] font-medium"
                  />
                  <User className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="flex rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-[#f59e0b] overflow-hidden">
                  <div className="bg-slate-50 px-3 py-2.5 border-r border-slate-200 text-xs font-bold text-slate-700">
                    +91
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit mobile number"
                      className="w-full pl-3 pr-10 py-2.5 text-xs focus:outline-none font-medium"
                    />
                    <Phone className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Tenant Type & Move-in Date Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tenant Type
                  </label>
                  <select
                    value={tenantType}
                    onChange={(e) => setTenantType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#f59e0b] bg-white font-medium"
                  >
                    <option value="Family">Family</option>
                    <option value="Working Professional">Working Professional</option>
                    <option value="Bachelor">Bachelor</option>
                    <option value="Company Lease">Company Lease</option>
                    <option value="Student">Student</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Expected Move-In
                  </label>
                  <select
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#f59e0b] bg-white font-medium"
                  >
                    <option value="Immediately">Immediately</option>
                    <option value="Within 15 Days">Within 15 Days</option>
                    <option value="Next Month">Next Month</option>
                    <option value="After 2 Months">After 2 Months</option>
                  </select>
                </div>
              </div>

              {/* Visit Scheduling Details (Visible if defaultAction === 'schedule' or toggled) */}
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-950">
                    <CalendarDays size={14} className="text-orange-600" />
                    <span>Schedule Site Visit (Optional)</span>
                  </div>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wantsScheduleVisit}
                      onChange={(e) => setWantsScheduleVisit(e.target.checked)}
                      className="rounded text-orange-500 accent-orange-500"
                    />
                    <span>Book Visit</span>
                  </label>
                </div>

                {wantsScheduleVisit && (
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-700 block mb-1">Visit Date</span>
                        <input
                          type="date"
                          min={todayStr}
                          value={visitDate}
                          onChange={(e) => setVisitDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-700 block mb-1">Time Slot</span>
                        <select
                          value={visitTime}
                          onChange={(e) => setVisitTime(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold text-slate-800"
                        >
                          <option value="10:00 AM">10:00 AM (Morning)</option>
                          <option value="11:30 AM">11:30 AM (Late Morning)</option>
                          <option value="02:00 PM">02:00 PM (Afternoon)</option>
                          <option value="04:30 PM">04:30 PM (Evening)</option>
                          <option value="06:00 PM">06:00 PM (Sunset)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FFCC00] to-[#f59e0b] hover:from-[#F5B800] hover:to-[#d97706] active:scale-[0.99] text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-400/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Tenant Profile...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-slate-950" />
                      <span>{wantsScheduleVisit ? 'Schedule Visit & Unlock Owner Contact' : 'Save Details & Unlock Contact'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: OWNER CONTACT UNLOCKED */}
          {step === 'unlocked' && (
            <div className="space-y-3.5 text-center animate-in zoom-in-95 duration-200">
              {loading ? (
                <div className="py-10 flex flex-col items-center gap-3 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                  <p className="text-sm font-semibold">Fetching owner contact details...</p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>

                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      {currentUser?.role === 'tenant' ? `Welcome Back, ${currentUser.first_name || 'Tenant'}!` : 'Owner Contact Unlocked!'}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {currentUser?.role === 'tenant'
                        ? 'You are verified. Contact the landlord or book a site visit below.'
                        : 'Your tenant profile is saved. You can now contact the owner directly.'}
                    </p>
                  </div>

                  {/* Owner Contact Card */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 text-left space-y-2.5">
                    <div className="flex items-center justify-between pb-1.5 border-b border-amber-200/80">
                      <div>
                        <h5 className="text-xs font-black text-slate-900">
                          {ownerData?.name && ownerData.name !== 'Property Owner'
                            ? ownerData.name
                            : (property?.owner_name || property?.owner?.name || ownerData?.name || 'Property Owner')}
                        </h5>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[8px] font-black bg-emerald-600 text-white">
                        VERIFIED
                      </span>
                    </div>

                    {/* Phone number display & copy */}
                    {(ownerData?.phone || property?.owner_phone) ? (
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-amber-200/80">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-black text-slate-900">
                            {ownerData?.phone || property?.owner_phone}
                          </span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(ownerData?.phone || property?.owner_phone || '')}
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                        >
                          {copiedPhone ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-white p-2.5 rounded-xl border border-amber-200/80 text-center text-xs text-slate-400">
                        Phone number not available for this property
                      </div>
                    )}

                    {/* Action Buttons: Call & WhatsApp */}
                    <div className="grid grid-cols-2 gap-2 pt-0.5">
                      <a
                        href={`tel:${ownerData?.phone || property?.owner_phone || ''}`}
                        className="py-2 px-3 rounded-xl bg-[#0b3856] hover:bg-[#07263b] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <PhoneCall className="w-3.5 h-3.5" /> Direct Call
                      </a>

                      <a
                        href={`https://wa.me/91${(ownerData?.whatsapp || ownerData?.phone || property?.owner_phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi! I'm interested in renting your property: ${propertyTitle}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <FaWhatsapp className="w-4 h-4" /> WhatsApp
                      </a>
                    </div>
                  </div>

                  {/* Site Visit Scheduling Card for Verified Tenant */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <CalendarDays size={13} className="text-orange-500" />
                        <span>Schedule Site Inspection Visit</span>
                      </h5>
                      {visitBookedSuccess && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                          ✓ Confirmed
                        </span>
                      )}
                    </div>

                    {visitBookedSuccess ? (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                        <p className="font-bold">✓ Visit scheduled for {visitDate} at {visitTime}!</p>
                        <p className="text-[10px] text-emerald-700 mt-0.5">Saved in your Tenant Portal & Owner Account.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleDirectScheduleVisit} className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[9px] font-bold text-slate-600 block mb-0.5">Date</span>
                            <input
                              type="date"
                              min={todayStr}
                              value={visitDate}
                              onChange={(e) => setVisitDate(e.target.value)}
                              className="w-full px-2 py-1.5 text-xs bg-white rounded-lg border border-slate-300 font-semibold"
                            />
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-slate-600 block mb-0.5">Time Slot</span>
                            <select
                              value={visitTime}
                              onChange={(e) => setVisitTime(e.target.value)}
                              className="w-full px-2 py-1.5 text-xs bg-white rounded-lg border border-slate-300 font-semibold"
                            >
                              <option value="10:00 AM">10:00 AM</option>
                              <option value="11:30 AM">11:30 AM</option>
                              <option value="02:00 PM">02:00 PM</option>
                              <option value="04:30 PM">04:30 PM</option>
                              <option value="06:00 PM">06:00 PM</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={schedulingVisitDirect}
                          className="w-full py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {schedulingVisitDirect ? (
                            <>
                              <Loader2 size={13} className="animate-spin" />
                              <span>Booking Site Visit...</span>
                            </>
                          ) : (
                            <>
                              <Calendar size={13} />
                              <span>Confirm & Book Site Visit</span>
                            </>
                          )}
                        </button>
                      </form>
                    )}
                  </div>

                  <button
                    onClick={onClose}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                  >
                    Close Window
                  </button>
                </>
              )}
            </div>
          )}


        </div>

      </div>
    </div>
  );
};

export default ContactOwnerTenantModal;
