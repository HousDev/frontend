import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Mail,
  User,
  Users,
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
  IndianRupee
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { tenantAPI } from '@/lib/tenantAPI';
import { tenantVisitAPI } from '@/lib/tenantVisitAPI';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import { saveTenantShortlist } from '@/lib/tenantShortlist';
import { saveTenantShortlist, saveTenantEnquiry } from '@/lib/tenantShortlist';
import { getImageUrl } from '@/lib/helpers';

interface ContactOwnerTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: any;
  defaultAction?: 'contact' | 'schedule' | 'shortlist';
  initialVisitDate?: string;
  initialVisitTime?: string;
}

export function formatToAmPm(timeInput: string): string {
  if (!timeInput) return '11:00 AM';
  const clean = String(timeInput).trim();
  if (clean.toUpperCase().includes('AM') || clean.toUpperCase().includes('PM')) {
    return clean;
  }
  const match = clean.match(/^(\d{1,2}):(\d{2})/);
  if (match) {
    let h = parseInt(match[1], 10);
    const m = match[2];
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
  }
  return '11:00 AM';
}

export function parseSlotMinutes(timeStr: string): number {
  if (!timeStr) return 9999;
  const clean = String(timeStr).trim();

  // 1. Find all time segments (e.g., "10:00 AM", "1:00 PM", "5:00 PM", "8:00 PM", "2 PM", "5 PM")
  const timeMatches = Array.from(clean.matchAll(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)?/gi));
  
  const validTimes = timeMatches.filter(m => {
    const h = parseInt(m[1], 10);
    return h >= 1 && h <= 24;
  });

  if (validTimes.length >= 2) {
    // Range detected: take the END time of the range to determine if window has passed
    const endMatch = validTimes[validTimes.length - 1];
    let h = parseInt(endMatch[1], 10);
    const m = endMatch[2] ? parseInt(endMatch[2], 10) : 0;
    const ampm = (endMatch[3] || '').toUpperCase();

    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    if (!ampm && h < 9 && h >= 1) h += 12; // 1 to 8 without AM/PM in range is afternoon/evening PM

    return h * 60 + m;
  }

  if (validTimes.length === 1) {
    const m = validTimes[0];
    let h = parseInt(m[1], 10);
    const min = m[2] ? parseInt(m[2], 10) : 0;
    const ampm = (m[3] || '').toUpperCase();

    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    if (!ampm && h < 8 && h >= 1) h += 12;

    return h * 60 + min;
  }

  // 2. Direct 24h format (e.g., "14:30")
  const m24 = clean.match(/^(\d{1,2}):(\d{2})/);
  if (m24) {
    return parseInt(m24[1], 10) * 60 + parseInt(m24[2], 10);
  }

  return 9999;
}

export function isSlotPassed(slot: string, selectedDate: string): boolean {
  if (!slot || !selectedDate) return false;
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayYMD = `${year}-${month}-${day}`;

  // If the selected visit date is in the future (not today), it has NOT passed!
  if (selectedDate !== todayYMD) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const slotMinutes = parseSlotMinutes(slot);

  if (slotMinutes >= 9999) return false;

  return slotMinutes <= currentMinutes;
}

const ALL_STANDARD_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM',
  '08:00 PM',
];

export const ContactOwnerTenantModal: React.FC<ContactOwnerTenantModalProps> = ({
  isOpen,
  onClose,
  property,
  defaultAction = 'contact',
  initialVisitDate,
  initialVisitTime,
}) => {
  const navigate = useNavigate();
  const { user: currentUser, setAuthSession } = useAuth();

  // Steps: 'email' -> 'otp' -> 'details' -> 'unlocked'
  const [step, setStep] = useState<'email' | 'otp' | 'details' | 'unlocked'>('email');
  const [loading, setLoading] = useState<boolean>(false);
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [copiedPhone, setCopiedPhone] = useState<boolean>(false);
  const [existingUserDetected, setExistingUserDetected] = useState<boolean>(false);

  const rawPhoto = property?.cover_image || property?.images?.[0] || property?.photos?.[0] || property?.mediaItems?.[0]?.file_path;
  const photoPath = typeof rawPhoto === 'string' ? rawPhoto : (rawPhoto as any)?.url || null;
  const propertyCoverUrl = getImageUrl(photoPath);

  // Form State
  const [email, setEmail] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [tenantType, setTenantType] = useState<string>('Family');
  const [moveInDate, setMoveInDate] = useState<string>('Immediately');
  const [message, setMessage] = useState<string>('');

  // Visit Scheduling State
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // Check if today still has future slots
  const firstAvailableTodaySlot = ALL_STANDARD_SLOTS.find((s) => !isSlotPassed(s, todayStr));
  const initialDefaultDate = firstAvailableTodaySlot ? todayStr : tomorrowStr;
  const initialDefaultTime = firstAvailableTodaySlot || '10:00 AM';

  const [wantsScheduleVisit, setWantsScheduleVisit] = useState<boolean>(defaultAction === 'schedule');
  const [visitDate, setVisitDate] = useState<string>(initialDefaultDate);
  const [visitTime, setVisitTime] = useState<string>(initialDefaultTime);
  const [isCustomTimeMode, setIsCustomTimeMode] = useState<boolean>(false);
  const [customTimeInput, setCustomTimeInput] = useState<string>('11:00');
  const [timeCategory, setTimeCategory] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [visitRemarks, setVisitRemarks] = useState<string>('');
  const [schedulingVisitDirect, setSchedulingVisitDirect] = useState<boolean>(false);
  const [visitBookedSuccess, setVisitBookedSuccess] = useState<boolean>(false);

  // 7 Upcoming Days
  const upcomingDays = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayNum = String(d.getDate()).padStart(2, '0');
      const dayName = i === 0 ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short' });
      const monthShort = d.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase();
      days.push({ dateStr, dayNum, dayName, monthShort, isToday: i === 0 });
    }
    return days;
  }, []);

  const MORNING_SLOTS = ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM'];
  const AFTERNOON_SLOTS = ['12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '05:00 PM'];
  const EVENING_SLOTS = ['05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM'];

  const currentCategorySlots = useMemo(() => {
    if (timeCategory === 'morning') return MORNING_SLOTS;
    if (timeCategory === 'afternoon') return AFTERNOON_SLOTS;
    return EVENING_SLOTS;
  }, [timeCategory]);

  // Unlocked Owner details
  const [ownerData, setOwnerData] = useState<any>(null);

  // OTP input refs
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Owner Preferred Visit Slots (from owner profile / storage / property)
  const ownerPreferredVisitSlots: string[] = useMemo(() => {
    let slots: string[] = [];
    try {
      // 1. Direct property / owner fields
      const rawSlots =
        property?.preferred_visit_slots ||
        property?.visiting_hours ||
        property?.preferred_time_to_call ||
        property?.owner_preferred_visit_slots ||
        property?.owner?.preferred_visit_slots;

      if (rawSlots) {
        if (Array.isArray(rawSlots)) {
          slots = rawSlots;
        } else if (typeof rawSlots === 'string') {
          try {
            const parsed = JSON.parse(rawSlots);
            if (Array.isArray(parsed)) slots = parsed;
          } catch {
            slots = rawSlots.split(';').map((s: string) => s.trim()).filter(Boolean);
          }
        }
      }

      // 2. Storage by ownerId
      const ownerId = property?.owner_id || property?.owner?.id || ownerData?.id;
      if (slots.length === 0 && ownerId) {
        const saved = localStorage.getItem(`owner_preferred_slots_${ownerId}`);
        if (saved) slots = JSON.parse(saved);
      }
    } catch {}

    if (slots.length === 0) {
      slots = [
        'Morning (10:00 AM - 1:00 PM)',
        'Afternoon (2:00 PM - 5:00 PM)',
        'Evening (5:00 PM - 8:00 PM)',
        'Weekends (11:00 AM - 6:00 PM)',
      ];
    }
    return slots;
  }, [property?.owner_id, property?.owner?.id, property?.preferred_visit_slots, property?.visiting_hours, property?.preferred_time_to_call, ownerData?.id]);

  useEffect(() => {
    if (isOpen) {
      setEmail(currentUser?.email || '');
      setName(currentUser ? `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() : '');
      setPhone(currentUser?.phone || '');
      setOtpDigits(['', '', '', '', '', '']);
      setCopiedPhone(false);
      setWantsScheduleVisit(defaultAction === 'schedule');
      setVisitBookedSuccess(false);

      if (initialVisitDate) {
        setVisitDate(initialVisitDate);
      }
      if (initialVisitTime) {
        setVisitTime(initialVisitTime);
      }

      // ✅ Check if logged in as Admin, Staff, Agent, or Tenant → Skip OTP, directly unlock owner details
      let activeUser: any = currentUser;
      if (!activeUser) {
        try {
          const uStr = localStorage.getItem('user');
          if (uStr) activeUser = JSON.parse(uStr);
        } catch {}
      }

      const isAdminOrStaff = activeUser && ['admin', 'superadmin', 'staff', 'employee', 'executive', 'agent', 'manager'].includes(String(activeUser.role || activeUser.user_type || '').toLowerCase());
      const isTenantUser = activeUser && (activeUser.role === 'tenant' || activeUser.user_type === 'tenant' || activeUser.tenant_id);
      const isAnyLoggedIn = Boolean(activeUser?.id || activeUser?.email || localStorage.getItem('token'));

      if ((isAdminOrStaff || isTenantUser || isAnyLoggedIn) && property?.id) {
        setStep('unlocked');
        setLoading(true);
        setOwnerData(null);

        // Record enquiry for this property in tenant enquired list if tenant
        if (isTenantUser || !isAdminOrStaff) {
          saveTenantEnquiry(property);
        }

        tenantAPI.getOwnerDetails(property.id, activeUser?.email || currentUser?.email || '')
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
        // Guest user — show quick email verification flow
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

    const rawTime = isCustomTimeMode && customTimeInput ? customTimeInput : (visitTime || '11:00 AM');
    const finalVisitTime = formatToAmPm(rawTime);

    if (isSlotPassed(finalVisitTime, visitDate)) {
      toast.error(`The selected time slot (${finalVisitTime}) has already passed for today. Please choose an upcoming time slot or a future date.`);
      return;
    }

    setVisitTime(finalVisitTime);
    setSchedulingVisitDirect(true);
    try {
      const tenantId = currentUser?.id || null;

      await tenantVisitAPI.create({
        tenant_id: tenantId,
        rental_property_id: property?.id,
        property_title: propertyTitle,
        visit_date: visitDate,
        visit_time: finalVisitTime,
        meeting_point: property?.society_name || property?.location || 'Property Location',
        remarks: visitRemarks || 'Scheduled via Rental Property page',
        status: 'Pending Owner Approval',
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
        const rawTime = isCustomTimeMode && customTimeInput ? customTimeInput : (visitTime || '11:00 AM');
        const finalVisitTime = formatToAmPm(rawTime);

        if (isSlotPassed(finalVisitTime, visitDate)) {
          toast.error(`The selected time slot (${finalVisitTime}) has already passed for today. Please choose an upcoming time slot or a future date.`);
          setLoading(false);
          return;
        }

        setVisitTime(finalVisitTime);
        payload.schedule_visit = {
          visit_date: visitDate,
          visit_time: finalVisitTime,
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

          // Save to enquired properties as well
          saveTenantEnquiry(property);
        }

        // ✅ Save owner details so tenant dashboard can show them immediately
        if (res.owner) {
          localStorage.setItem('last_unlocked_owner', JSON.stringify({
            ...res.owner,
            property_title: propertyTitle,
            property_id: property?.id,
          }));
        }

        // Send Interest Request to Owner
        try {
          const tenantId = res?.tenant?.id || res?.user?.id;
          if (tenantId && property?.id) {
            await tenantAPI.sendInterest({
              rental_property_id: property.id,
              tenant_id: tenantId,
              owner_id: property.owner_id || property.owner?.id,
              sender_type: 'tenant',
              message: visitRemarks || `Interested in ${propertyTitle}`,
            });
          }
        } catch (interestErr) {
          console.warn("Interest dispatch note:", interestErr);
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
                        <span className="text-[10px] font-bold text-slate-700 block mb-1">Time Slot (Select Dropdown)</span>
                        <select
                          value={visitTime}
                          onChange={(e) => setVisitTime(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold text-slate-800 cursor-pointer shadow-2xs"
                        >
                          {ownerPreferredVisitSlots.length > 0 && (
                            <optgroup label="🌟 Owner Available Preferred Slots">
                              {ownerPreferredVisitSlots.map((slot) => {
                                const passed = isSlotPassed(slot, visitDate);
                                return (
                                  <option key={slot} value={slot} disabled={passed}>
                                    {slot} {passed ? '(Time Passed)' : '(Owner Available)'}
                                  </option>
                                );
                              })}
                            </optgroup>
                          )}
                          <optgroup label="⏰ Standard Hourly Slots">
                            {[
                              { value: '09:00 AM', label: '09:00 AM (Early Morning)' },
                              { value: '10:00 AM', label: '10:00 AM (Morning)' },
                              { value: '11:00 AM', label: '11:00 AM (Morning)' },
                              { value: '12:00 PM', label: '12:00 PM (Noon)' },
                              { value: '01:00 PM', label: '01:00 PM (Lunch Hour)' },
                              { value: '02:00 PM', label: '02:00 PM (Afternoon)' },
                              { value: '03:00 PM', label: '03:00 PM (Afternoon)' },
                              { value: '04:00 PM', label: '04:00 PM (Evening)' },
                              { value: '05:00 PM', label: '05:00 PM (Evening)' },
                              { value: '06:00 PM', label: '06:00 PM (Evening)' },
                              { value: '07:00 PM', label: '07:00 PM (Night)' },
                              { value: '08:00 PM', label: '08:00 PM (Night)' },
                            ].map((item) => {
                              const passed = isSlotPassed(item.value, visitDate);
                              return (
                                <option key={item.value} value={item.value} disabled={passed}>
                                  {item.label} {passed ? '(Passed)' : ''}
                                </option>
                              );
                            })}
                          </optgroup>
                        </select>
                      </div>
                    </div>

                    {/* Owner's Preferred Visit Slots */}
                    {ownerPreferredVisitSlots.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[9px] font-bold text-orange-900 block mb-1 flex items-center gap-1">
                          <IndianRupee size={10} className="text-orange-600" />
                          <span>Owner's Preferred Visit Timings (1-Click Pick):</span>
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {ownerPreferredVisitSlots.map((slot) => {
                            const isSelected = visitTime === slot;
                            const passed = isSlotPassed(slot, visitDate);
                            return (
                              <button
                                key={slot}
                                type="button"
                                disabled={passed}
                                onClick={() => setVisitTime(slot)}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                  isSelected
                                    ? 'bg-orange-500 text-white shadow-2xs font-bold'
                                    : 'bg-white text-slate-700 hover:bg-orange-100/80 border border-amber-200'
                                }`}
                              >
                                {slot} {passed ? '(Passed)' : ''}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
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

          {/* STEP 4: OWNER CONTACT UNLOCKED (Clean & Compact) */}
          {step === 'unlocked' && (
            <div className="space-y-4 text-center animate-in zoom-in-95 duration-200">
              {loading ? (
                <div className="py-10 flex flex-col items-center gap-3 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                  <p className="text-sm font-semibold">Fetching owner contact details...</p>
                </div>
              ) : wantsScheduleVisit ? (
                /* Schedule Visit View */
                <div className="text-left space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                        <CalendarDays size={16} className="text-orange-500" />
                        <span>Schedule Site Inspection</span>
                      </h4>
                      <p className="text-[10px] text-slate-500">Select date & time for property visit</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWantsScheduleVisit(false)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                    >
                      View Owner Details
                    </button>
                  </div>

                  {visitBookedSuccess ? (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1.5 text-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                      <p className="font-black text-sm">Site Visit Requested!</p>
                      <p className="font-semibold">{visitDate} at {visitTime}</p>
                      <p className="text-[10.5px] text-emerald-700">
                        Details added to your Tenant Portal. The owner will review and confirm.
                      </p>
                      <button
                        type="button"
                        onClick={onClose}
                        className="mt-2 px-4 py-1.5 rounded-xl bg-[#0b3856] text-white font-bold text-xs"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleDirectScheduleVisit} className="space-y-3">
                      {/* Date Selection */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Inspection Date <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="date"
                          min={todayStr}
                          value={visitDate}
                          onChange={(e) => setVisitDate(e.target.value)}
                          required
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b3856] font-medium text-slate-800"
                        />
                      </div>

                      {/* Time Slot Selection (Presets or Custom Time Picker) */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-bold text-slate-700">
                            Preferred Time Slot <span className="text-rose-500">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsCustomTimeMode(!isCustomTimeMode)}
                            className="text-[10.5px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                          >
                            {isCustomTimeMode ? '← Use Standard Slots' : '+ Set Custom Time (Clock Picker)'}
                          </button>
                        </div>

                        {!isCustomTimeMode ? (
                          <select
                            value={visitTime}
                            onChange={(e) => {
                              if (e.target.value === '__custom__') {
                                setIsCustomTimeMode(true);
                              } else {
                                setVisitTime(e.target.value);
                              }
                            }}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b3856] font-bold text-slate-800 cursor-pointer"
                          >
                            {ownerPreferredVisitSlots.length > 0 && (
                              <optgroup label="🌟 Owner's Available Preferred Timings">
                                {ownerPreferredVisitSlots.map((slot) => {
                                  const passed = isSlotPassed(slot, visitDate);
                                  return (
                                    <option key={slot} value={slot} disabled={passed}>
                                      ⚡ {slot} {passed ? '(Passed for Today)' : '(Owner Preferred)'}
                                    </option>
                                  );
                                })}
                              </optgroup>
                            )}
                            <optgroup label="⏰ Standard Hourly Slots">
                              {[
                                { value: '09:00 AM', label: '09:00 AM (Early Morning)' },
                                { value: '10:00 AM', label: '10:00 AM (Morning)' },
                                { value: '11:00 AM', label: '11:00 AM (Morning)' },
                                { value: '12:00 PM', label: '12:00 PM (Noon)' },
                                { value: '01:00 PM', label: '01:00 PM (Lunch Hour)' },
                                { value: '02:00 PM', label: '02:00 PM (Afternoon)' },
                                { value: '03:00 PM', label: '03:00 PM (Afternoon)' },
                                { value: '04:00 PM', label: '04:00 PM (Evening)' },
                                { value: '05:00 PM', label: '05:00 PM (Evening)' },
                                { value: '06:00 PM', label: '06:00 PM (Evening)' },
                                { value: '07:00 PM', label: '07:00 PM (Night)' },
                                { value: '08:00 PM', label: '08:00 PM (Night)' },
                              ].map((item) => {
                                const passed = isSlotPassed(item.value, visitDate);
                                return (
                                  <option key={item.value} value={item.value} disabled={passed}>
                                    {item.label} {passed ? '(Passed for Today)' : ''}
                                  </option>
                                );
                              })}
                            </optgroup>
                            <option value="__custom__">⏰ + Custom Time (Select Exact Hour & Minute)...</option>
                          </select>
                        ) : (
                          /* Custom Time Input Picker (Hour / Minute / AM / PM Clock) */
                          <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1.5 animate-in fade-in duration-150">
                            <label className="block text-[10px] font-bold text-blue-900 uppercase">
                              Pick Exact Time (Hour : Minute)
                            </label>
                            <input
                              type="time"
                              value={customTimeInput}
                              onChange={(e) => setCustomTimeInput(e.target.value)}
                              className="w-full px-3 py-2 text-xs rounded-xl border border-blue-300 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required={isCustomTimeMode}
                            />
                            {customTimeInput && isSlotPassed(formatToAmPm(customTimeInput), visitDate) ? (
                              <p className="text-[10.5px] text-rose-600 font-bold flex items-center gap-1">
                                ⚠️ This time has already passed for today ({formatToAmPm(customTimeInput)}). Please select a future time.
                              </p>
                            ) : (
                              <p className="text-[10px] text-blue-700 leading-tight">
                                Select your exact time (e.g., 07:15 PM, 11:45 AM, 06:30 PM).
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Remarks */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Note / Remark (Optional)
                        </label>
                        <input
                          type="text"
                          value={visitRemarks}
                          onChange={(e) => setVisitRemarks(e.target.value)}
                          placeholder="E.g. want to see parking & kitchen..."
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b3856] font-medium text-slate-800"
                        />
                      </div>

                      <div className="pt-1 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setWantsScheduleVisit(false)}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={schedulingVisitDirect}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-[#0b3856] hover:bg-[#07263b] text-white font-extrabold text-xs shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {schedulingVisitDirect ? (
                            <>
                              <Loader2 size={13} className="animate-spin" />
                              <span>Booking Visit...</span>
                            </>
                          ) : (
                            <>
                              <Calendar size={13} />
                              <span>Confirm Schedule Visit</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                /* Compact Owner Details View */
                <>
                  <div className="w-11 h-11 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      {currentUser?.role === 'tenant' ? `Welcome Back, ${currentUser.first_name || 'Tenant'}!` : 'Owner Contact Unlocked!'}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      You are verified. Contact the landlord directly below.
                    </p>
                  </div>

                  {/* Compact Owner Contact Card */}
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
                          type="button"
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
                        className="py-2.5 px-3 rounded-xl bg-[#0b3856] hover:bg-[#07263b] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <PhoneCall className="w-3.5 h-3.5" /> Direct Call
                      </a>

                      <a
                        href={`https://wa.me/91${(ownerData?.whatsapp || ownerData?.phone || property?.owner_phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi! I'm interested in renting your property: ${propertyTitle}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <FaWhatsapp className="w-4 h-4" /> WhatsApp
                      </a>
                    </div>
                  </div>

                  {/* Compact Secondary Action: Schedule Site Visit */}
                  <div className="pt-1 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setWantsScheduleVisit(true)}
                      className="w-full py-2.5 px-3 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <CalendarDays size={14} className="text-orange-600" />
                      <span>Book / Schedule Site Visit Inspection</span>
                    </button>

                    <button
                      type="button"
                      onClick={onClose}
                      className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer pt-1"
                    >
                      Close Window
                    </button>
                  </div>
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
