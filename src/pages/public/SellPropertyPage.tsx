

// export default SellPropertyPage;
import React, { useState, useRef } from 'react';
import {
  CheckCircle, ArrowRight, Users, Eye, TrendingUp, Star, Shield, Zap,
  ChevronDown, ChevronUp, Home, Building2, MapPin, Phone, Mail, User,
  Smartphone, Sparkles, Clock, ThumbsUp, Award, Globe, MessageCircle,
  Camera, FileText, Heart, Target, Rocket, BadgeCheck, Headphones, Plus,
  Loader2
} from 'lucide-react';
import PublicSellPropertyForm from './PublicSellPropertyForm';
import { sellerAPI } from '@/lib/sellersAPI';
import { toast } from 'react-toastify';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { FaWhatsapp } from 'react-icons/fa';

import { leadsAPI } from '@/lib/leadAPI';

/* ─── Font Stack ─── */
const fontStack = {
  fontFamily: `ui-sans-serif, system-ui, sans-serif, "Apple SD Gothic Neo", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
};

/* ─── Brand Palette — Navy primary, Orange for key CTAs/headings only ─── */
const NAVY         = '#0b3856';
const NAVY_DARK    = '#072c42';
const NAVY_LIGHT   = '#eef2f6';
const ORANGE       = '#E6761D';
const ORANGE_DARK  = '#c95f0c';
const ORANGE_LIGHT = '#FEF3E8';
const GRAY_50      = '#fafbfc';
const GRAY_100     = '#f4f5f7';

/* ═══════════════════════════════════════════
   MINI STEP-1 FORM WITH TWO BUTTONS
═══════════════════════════════════════════ */
const MiniStep1Form: React.FC<{
  onNext: (data: { name: string; email: string; phone: string; whatsapp: string; salutation: string; sameAsPhone: boolean }) => void;
  onPostPropertyClick: (data: { name: string; email: string; phone: string; whatsapp: string; salutation: string; sameAsPhone: boolean; sellerId?: string }) => void;
}> = ({ onNext, onPostPropertyClick }) => {
  const [form, setForm] = useState({
    salutation: 'Mr',
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    sameAsPhone: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focused, setFocused] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onlyDigits = (s = '') => s.replace(/\D/g, '');

  const buildApiPhone = (raw: string) => {
    const d = onlyDigits(raw);
    if (!d) return '';
    if (d.startsWith('91') && d.length === 12) return `+${d}`;
    if (d.length === 10) return `+91${d}`;
    return `+${d}`;
  };

  const handlePhoneChange = (value: string) => {
    setForm(prev => {
      const next = { ...prev, phone: value };
      if (prev.sameAsPhone) next.whatsapp = value;
      return next;
    });
    if (errors.phone) setErrors(p => ({ ...p, phone: '' }));
  };

  const handleWhatsappChange = (value: string) => {
    setForm(prev => ({ ...prev, whatsapp: value }));
    if (errors.whatsapp) setErrors(p => ({ ...p, whatsapp: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Enter a valid full name';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.phone || onlyDigits(form.phone).length < 10) e.phone = '10-digit number required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const getPayload = () => ({
    salutation: form.salutation,
    name: form.name,
    email: form.email,
    phone: form.phone,
    whatsapp: form.sameAsPhone ? form.phone : form.whatsapp,
    sameAsPhone: form.sameAsPhone,
  });

  // Create lead in CRM (status: 'new'), then open property details modal
  const handlePostProperty = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const apiPhone = buildApiPhone(form.phone);
      const apiWhatsapp = buildApiPhone(form.sameAsPhone ? form.phone : form.whatsapp);
      
      const leadData = {
        salutation: form.salutation || 'Mr.',
        name: form.name.trim(),
        email: form.email.trim(),
        phone: apiPhone,
        whatsapp_number: apiWhatsapp,
        whatsapp: apiWhatsapp,
        lead_type: 'seller',
        lead_source: 'Website',
        status: 'new',
        priority: 'hot',
      };
      
      await leadsAPI.createLead(leadData);
      console.log('✅ Lead created/updated in CRM with status new');
      
      toast.success(`Details saved! Now add your property.`);
      
      // Open property details modal
      onPostPropertyClick({
        ...getPayload(),
        phone: apiPhone,
        whatsapp: apiWhatsapp,
      });
    } catch (error: any) {
      console.error('Error saving lead details:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to save details');
      // Still open modal so user can proceed
      onPostPropertyClick(getPayload());
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitOnly = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const apiPhone = buildApiPhone(form.phone);
      const apiWhatsapp = buildApiPhone(form.sameAsPhone ? form.phone : form.whatsapp);

      const leadData = {
        salutation: form.salutation || 'Mr.',
        name: form.name.trim(),
        email: form.email.trim(),
        phone: apiPhone,
        whatsapp_number: apiWhatsapp,
        whatsapp: apiWhatsapp,
        lead_type: 'seller',
        lead_source: 'Website',
        status: 'new',
        priority: 'hot',
      };
      await leadsAPI.createLead(leadData);
      toast.success(`Thank you! Our team will contact you shortly.`);
      onNext(getPayload());
    } catch (error: any) {
      console.error('Error creating lead:', error);
      toast.error(error?.response?.data?.message || error?.message || 'Failed to submit details');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappDisplayValue = () => {
    const src = form.sameAsPhone ? form.phone : form.whatsapp;
    if (!src) return '';
    const d = onlyDigits(src);
    if (!d) return '';
    if (d.startsWith('91') && d.length === 12) return `+91 ${d.slice(2)}`;
    if (d.length === 10) return `+91 ${d}`;
    return `+${d}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black text-white"
          style={{ background: `linear-gradient(135deg,${NAVY},${NAVY_DARK})` }}>1</div>
        <span className="text-[13px] font-bold text-gray-500 uppercase tracking-widest">Your Details</span>
      </div>

      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-3 sm:col-span-2 mb-3">
          <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">Title</label>
          <select
            value={form.salutation}
            onChange={e => setForm(p => ({ ...p, salutation: e.target.value }))}
            className="w-full h-9 px-2 rounded-lg text-[13px] border border-gray-200 bg-white focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all cursor-pointer"
          >
            {['Mr', 'Ms', 'Mrs', 'Dr'].map(s => <option key={s} value={s}>{s}.</option>)}
          </select>
        </div>
        <div className="col-span-9 sm:col-span-10">
          <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">
            Full Name <span className="text-orange-500">*</span>
          </label>
          <div className="relative">
            <User size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text" placeholder="Your full name"
              value={form.name}
              onFocus={() => setFocused('name')} onBlur={() => setFocused(null)}
              onChange={e => { setForm(p => ({ ...p, name: e.target.value.replace(/[0-9]/g, '') })); if (errors.name) setErrors(p => ({ ...p, name: '' })); }}
              className={`w-full h-9 pl-8 pr-3 rounded-lg text-[13px] bg-white border transition-all focus:outline-none placeholder:text-gray-400 ${errors.name ? 'border-red-300' : focused === 'name' ? 'border-orange-400 ring-2 ring-orange-100' : 'border-gray-200 hover:border-gray-300'}`}
            />
          </div>
          {errors.name && <p className="text-red-400 text-[10px] mt-0.5">{errors.name}</p>}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-12 mb-3">
          <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">
            Email <span className="text-orange-500">*</span>
          </label>
          <div className="relative">
            <Mail size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="email" placeholder="you@example.com"
              value={form.email}
              onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
              onChange={e => { setForm(p => ({ ...p, email: e.target.value })); if (errors.email) setErrors(p => ({ ...p, email: '' })); }}
              className={`w-full h-9 pl-8 pr-3 rounded-lg text-[13px] bg-white border transition-all focus:outline-none placeholder:text-gray-400 ${errors.email ? 'border-red-300' : focused === 'email' ? 'border-orange-400 ring-2 ring-orange-100' : 'border-gray-200 hover:border-gray-300'}`}
            />
          </div>
          {errors.email && <p className="text-red-400 text-[10px] mt-0.5">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">
            Phone <span className="text-orange-500">*</span>
          </label>
          <PhoneInput
            country={'in'}
            value={form.phone}
            onChange={handlePhoneChange}
            inputClass={`!w-full !h-9 !rounded-lg !border !text-[13px] !pl-10 ${
              errors.phone
                ? '!border-red-300 !bg-red-50/40'
                : focused === 'phone'
                ? '!border-orange-400 !ring-2 !ring-orange-100'
                : '!border-gray-200 hover:!border-gray-300'
            }`}
            containerClass="!w-full"
            buttonClass="!rounded-l-lg"
            inputProps={{
              name: 'phone',
              onFocus: () => setFocused('phone'),
              onBlur: () => setFocused(null),
            }}
            enableSearch={true}
            searchPlaceholder="Search country..."
          />
          {errors.phone && <p className="text-red-400 text-[10px] mt-0.5">{errors.phone}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
              <FaWhatsapp className="text-green-500" size={11} />
              WhatsApp
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.sameAsPhone}
                onChange={e => {
                  const checked = e.target.checked;
                  setForm(prev => ({
                    ...prev,
                    sameAsPhone: checked,
                    whatsapp: checked ? prev.phone : prev.whatsapp,
                  }));
                }}
                className="w-3 h-3 rounded accent-orange-500"
              />
              <span className="text-[9px] text-gray-400">Same as phone</span>
            </label>
          </div>
          <input
            type="tel"
            name="ownerWhatsapp"
            value={whatsappDisplayValue()}
            onChange={e => {
              if (!form.sameAsPhone) handleWhatsappChange(e.target.value);
            }}
            disabled={form.sameAsPhone}
            placeholder="WhatsApp number"
            onFocus={() => setFocused('whatsapp')}
            onBlur={() => setFocused(null)}
            className={`w-full h-9 px-3 rounded-lg text-[13px] bg-white border transition-all focus:outline-none placeholder:text-gray-400 ${
              form.sameAsPhone
                ? 'bg-gray-50 text-gray-400 cursor-not-allowed border-gray-200'
                : focused === 'whatsapp'
                ? 'border-orange-400 ring-2 ring-orange-100'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          />
        </div>
      </div>

      {/* 🔥 MODIFIED BUTTON - Shows spinner while creating seller */}
      <div className="grid gap-3 pt-1">
        <button
          type="button"
          onClick={handlePostProperty}
          disabled={submitting}
          className="h-10 rounded-xl text-[13px] font-bold text-white flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60"
          style={{ background: submitting ? '#94a3b8' : `linear-gradient(135deg,${ORANGE},${ORANGE_DARK})` }}
        >
          {submitting ? (
            <><Loader2 size={13} className="animate-spin" /> Saving details...</>
          ) : (
            <><Plus size={13} /> Next - Add property details</>
          )}
        </button>
      </div>

      <p className="text-[10px] text-gray-400 text-center">
        By continuing you agree to our{' '}
        <span className="underline cursor-pointer" style={{ color: ORANGE }}>Terms</span> &amp;{' '}
        <span className="underline cursor-pointer" style={{ color: ORANGE }}>Privacy Policy</span>
      </p>
      <div className="flex items-center justify-center gap-3 sm:gap-5 mt-3 sm:mt-0">
        {[{ icon: Shield, text: 'Secure' }, { icon: BadgeCheck, text: 'Verified' }, { icon: Headphones, text: '24/7 Support' }].map((b, i) => (
          <div key={i} className="flex items-center gap-1.5 text-gray-400">
            <b.icon size={12} style={{ color: NAVY }} />
            <span className="text-[10px] sm:text-[11px] font-medium">{b.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Static Data ─── */
const stats = [
  { icon: Users,     label: 'Active Buyers',  value: '2.5L+' },
  { icon: Eye,       label: 'Monthly Views',  value: '12L+'  },
  { icon: Home,      label: 'Listings',       value: '75K+'  },
  { icon: TrendingUp,label: 'Deals Closed',   value: '18K+'  },
];

const steps = [
  { num: '01', icon: User,     title: 'Owner Details',   desc: 'Share your name, email & phone to get started instantly.' },
  { num: '02', icon: Home,     title: 'Property Info',   desc: 'Add type, location, area, pricing & key features.' },
  { num: '03', icon: Camera,   title: 'Photos & Docs',   desc: 'Upload images & ownership documents for verification.' },
];

const features = [
  { icon: BadgeCheck,  title: 'Verified Listings',  desc: 'Get a trust badge for maximum buyer confidence.' },
  { icon: Rocket,      title: 'Instant Visibility', desc: 'Connect with lakhs of genuine buyers immediately.' },
  { icon: Sparkles,    title: '100% Free',          desc: 'Post your property at absolutely zero cost.' },
  { icon: Headphones,  title: 'Expert Support',     desc: 'Dedicated team guides you every step of the way.' },
];

const faqs = [
  { q: 'Is it really free to post my property?',     a: 'Yes, completely free. No hidden charges. Our team will help you maximise visibility.' },
  { q: 'How fast can I expect buyer enquiries?',     a: 'Most listings receive enquiries within 24-48 hours of going live.' },
  { q: 'Can I sell without a broker?',               a: 'Absolutely. Our platform is built for direct owner listings —  no middlemen.' },
  { q: 'What documents are required?',               a: 'Ownership proof (sale deed / index 2), property photos, and your contact details are enough to begin.' },
  { q: 'Can I edit my listing after posting?',       a: 'Yes. Update details, photos, or pricing anytime from your seller dashboard.' },
];

const testimonials = [
  { name: 'Rajesh Sharma', loc: 'Pune',   text: 'Got 5 genuine enquiries within 2 days. Smooth process and very helpful team!',         init: 'RS', stars: 5 },
  { name: 'Priya Mehta',   loc: 'Karad',  text: 'Sold my 2BHK without paying any brokerage. Highly recommend this platform!',            init: 'PM', stars: 5 },
  { name: 'Amit Joshi',    loc: 'Satara', text: 'Very easy. Uploaded photos in minutes and got a buyer within a week!',                   init: 'AJ', stars: 5 },
];

/* ─── FAQ Item ─── */
const FAQItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-2xl border overflow-hidden transition-colors duration-150"
      style={{ borderColor: open ? `${ORANGE}55` : '#e5e7eb' }}
    >
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-4 text-left text-[14px] font-semibold text-gray-800 hover:bg-orange-50/40 transition-colors"
      >
        <span className="text-sm sm:text-base">{q}</span>
        {open
          ? <ChevronUp  size={16} style={{ color: ORANGE }} />
          : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && (
        <div className="px-4 sm:px-6 pb-5 pt-3 text-[13.5px] text-gray-600 leading-relaxed border-t bg-orange-50/20" style={{ borderColor: `${ORANGE}22` }}>
          {a}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
const SellPropertyPage: React.FC = () => {
  const [isModalOpen,      setIsModalOpen]      = useState(false);
  const [modalInitialData, setModalInitialData] = useState<any>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const handlePostPropertyClick = (data: { name: string; email: string; phone: string; whatsapp: string; salutation: string; sameAsPhone: boolean,sellerId?: string; }) => {
    const onlyDigits = (s = '') => s.replace(/\D/g, '');
    const buildApiPhone = (raw: string) => {
      const d = onlyDigits(raw);
      if (!d) return '';
      if (d.startsWith('91') && d.length === 12) return `+${d}`;
      if (d.length === 10) return `+91${d}`;
      return `+${d}`;
    };

    setModalInitialData({
      salutation:    data.salutation,
      ownerName:     data.name,
      ownerEmail:    data.email,
      ownerPhone:    buildApiPhone(data.phone),
      ownerWhatsapp: buildApiPhone(data.sameAsPhone ? data.phone : data.whatsapp),
      sameAsPhone:   data.sameAsPhone,
      sellerId: data.sellerId,
    });
    setIsModalOpen(true);
  };

  const handleSubmitOnly = (data: any) => {
    console.log('Seller submitted:', data);
  };

  const handleModalSubmit = (result: any) => {
    console.log('Property submitted:', result);
    setIsModalOpen(false);
    toast.success('Property posted successfully!');
  };

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  return (
    <div style={fontStack} className="min-h-screen bg-white text-gray-900">
      <style>{`
        *, *::before, *::after {
          font-family: ui-sans-serif, system-ui, sans-serif, "Apple SD Gothic Neo", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
      `}</style>

      {/* ════════════════════════════════════
          HERO — Form moved slightly down (pt-24 instead of pt-20)
      ════════════════════════════════════ */}
      <section className="relative pt-12 sm:pt-16 pb-8 sm:pb-14 overflow-hidden bg-white">

        {/* Very subtle warm tint strip on the right */}
        <div
          className="absolute inset-y-0 right-0 w-[55%] pointer-events-none hidden lg:block"
          style={{ background: 'linear-gradient(120deg, #fff 0%, #eef2f6 60%, #e2e8f0 100%)', borderRadius: '0 0 0 80px' }}
        />

        {/* Dot grid watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle, #0b3856 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:gap-16">

            {/* ── LEFT: Copy ── */}
<div className="flex-1 pt-2 sm:pt-19 lg:pt-16 order-2 lg:order-1">
              {/* Eyebrow — Navy */}
              <div
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-[12px] font-bold mb-5 sm:mb-7 border mt-9 md:mt-0"
                style={{ background: NAVY_LIGHT, borderColor: '#cbd5e1', color: NAVY }}
              >
                <Sparkles size={13} />
                Post Your Property — 100% Free
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-[3.2rem] font-black leading-[1.2] sm:leading-[1.12] tracking-tight text-gray-900 mb-4 sm:mb-5">
                Sell or Rent Your<br />
                <span style={{ color: ORANGE }}>Property Faster</span>
              </h1>

              <p className="text-[14px] sm:text-[15.5px] text-gray-500 leading-relaxed max-w-md mb-6 sm:mb-9">
                Connect with <strong className="font-semibold text-gray-700">2.5 lakh+ genuine buyers</strong> across Maharashtra.
                List in minutes —  no hidden fees.
              </p>

              {/* Benefit chips */}
              <div className="flex flex-wrap gap-2 mb-6 sm:mb-10">
                {[
                  'Legal documentation support', 'Hassle-free transactions', 'Direct buyer connect',
                  'Verified badge', 'Free expert help', '24/7 support',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-[12.5px] font-medium border"
                    style={{ background: '#f8fafb', borderColor: '#e4e7ec', color: '#374151' }}
                  >
                    <CheckCircle size={11} style={{ color: ORANGE }} />
                    {item}
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 pt-5 sm:pt-7 border-t"
                style={{ borderColor: '#e9eaec' }}
              >
                {stats.map((s, i) => (
                  <div key={i} className="text-center sm:text-left">
                    <p className="text-xl sm:text-[1.65rem] font-black tracking-tight" style={{ color: ORANGE }}>{s.value}</p>
                    <p className="text-[10px] sm:text-[11.5px] text-gray-500 font-medium mt-0.5 uppercase tracking-wide">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Step-1 Form Card ── */}
<div ref={formRef} className="w-full lg:w-[500px] flex-shrink-0 mt-12 sm:mt-16 lg:mt-14 order-1 lg:order-2">              <div
                className="bg-white rounded-2xl sm:rounded-3xl"
                style={{
                  border: '1.5px solid #e2e8f0',
                  boxShadow: '0 4px 40px rgba(11,56,86,0.10), 0 1px 4px rgba(0,0,0,0.06)',
                  minHeight: 'auto',
                }}
              >
                {/* Card top accent bar — Navy */}

                {/* Header */}
                <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b" style={{ borderColor: '#f3f4f6' }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-[14px] sm:text-[16px] font-black text-gray-900 leading-tight">Start Your Free Listing</h2>
                      <p className="text-[11px] sm:text-[12px] text-gray-500 mt-0.5">Enter your details to get started</p>
                    </div>
                    {/* Free badge — Navy */}
                    <span
                      className="text-[9px] sm:text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest"
                      style={{ background: NAVY_LIGHT, color: NAVY }}
                    >Free</span>
                  </div>

                  {/* Step pills */}
                  <div className="flex items-center gap-2 mt-4">
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                        style={{ background: ORANGE }}>1</div>
                      <span className="text-[10px] sm:text-[11px] font-semibold" style={{ color: ORANGE }}>You</span>
                    </div>
                    <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg,${ORANGE}66,#e5e7eb)` }} />
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold text-gray-400 bg-gray-100">2</div>
                      <span className="text-[10px] sm:text-[11px] font-medium text-gray-400">Property</span>
                    </div>
                    <div className="flex-1 h-px bg-gray-200" />
                    <div className="flex items-center gap-1">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold text-gray-400 bg-gray-100">3</div>
                      <span className="text-[10px] sm:text-[11px] font-medium text-gray-400">Photos</span>
                    </div>
                  </div>
                </div>

                {/* Form body */}
                <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col flex-grow">
                  <div className="flex-grow flex flex-col justify-between">
                    <MiniStep1Form 
                      onNext={handleSubmitOnly}
                      onPostPropertyClick={handlePostPropertyClick}
                    />
                  </div>
                </div>
              </div>

              {/* Trust row */}
              
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════ */}
      <section className="py-6 sm:py-6" style={{ background: GRAY_50 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-3"
              style={{ background: NAVY_LIGHT, color: NAVY }}>
              Simple Process
            </div>
            <h2 className="text-[1.6rem] sm:text-[2rem] lg:text-[2.25rem] font-black text-gray-900 tracking-tight">
              Post Your Property in{' '}<span style={{ color: ORANGE }}>3 Steps</span>
            </h2>
            <p className="text-gray-500 text-[13px] sm:text-[15px] mt-2 max-w-xl mx-auto px-4">Fast, easy, and completely free — done in under 5 minutes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {steps.map((s, i) => (
              <div
                key={i}
                className="relative bg-white rounded-xl sm:rounded-2xl p-5 sm:p-7 border group hover:border-orange-200 transition-all duration-200"
                style={{ borderColor: '#e9eaec', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
              >
                <div className="flex items-center gap-3 sm:gap-4 mb-4">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                    style={{ background: NAVY_LIGHT }}
                  >
                    <s.icon size={18} className="sm:w-[22px] sm:h-[22px]" style={{ color: NAVY }} />
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest" style={{ color: NAVY }}>{s.num}</span>
                </div>
                <h3 className="text-[14px] sm:text-[15px] font-bold text-gray-900 mb-1.5">{s.title}</h3>
                <p className="text-[12.5px] sm:text-[13.5px] text-gray-500 leading-relaxed">{s.desc}</p>

                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-10">
                    <div className="w-7 h-7 rounded-full bg-white border flex items-center justify-center" style={{ borderColor: '#e9eaec' }}>
                      <ArrowRight size={13} className="text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-10">
            <button
              onClick={scrollToForm}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-[13px] sm:text-[14px] font-bold text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
              style={{ background: `linear-gradient(135deg,${ORANGE},${ORANGE_DARK})` }}
            >
              Start Posting Now <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          WHY CHOOSE US
      ════════════════════════════════════ */}
      <section className="py-8 sm:py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-3"
              style={{ background: NAVY_LIGHT, color: NAVY }}>
              Why Choose Us
            </div>
            <h2 className="text-[1.6rem] sm:text-[2rem] lg:text-[2.25rem] font-black text-gray-900 tracking-tight">
              Everything You Need to{' '}<span style={{ color: 'black' }}>Sell Faster</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {features.map((f, i) => (
              <div
                key={i}
                className="group p-4 sm:p-6 rounded-xl sm:rounded-2xl border hover:border-orange-200 transition-all duration-200 cursor-default"
                style={{ borderColor: '#e9eaec', background: GRAY_50 }}
              >
                <div
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-3 sm:mb-4 transition-transform duration-200 group-hover:scale-105"
                  style={{ background: NAVY_LIGHT }}
                >
                  <f.icon size={18} className="sm:w-[20px] sm:h-[20px]" style={{ color: NAVY }} />
                </div>
                <h3 className="text-[13px] sm:text-[14.5px] font-bold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-[12px] sm:text-[13px] text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          MID CTA BANNER — Navy
      ════════════════════════════════════ */}
      <section
        className="py-6 sm:py-6 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg,${NAVY_DARK},${NAVY})` }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-white/10 text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-4 sm:mb-5">
            <Globe size={12} style={{ color: ORANGE }} />
            Maximum Reach
          </div>
          <h2 className="text-[1.6rem] sm:text-[2rem] lg:text-[2.4rem] font-black text-white mb-3 tracking-tight">
            Over <span style={{ color: ORANGE }}>7 Million</span> Monthly Visitors
          </h2>
          <p className="text-blue-200 text-[13px] sm:text-[15px] mb-6 sm:mb-8 max-w-lg mx-auto px-4">
            Your property gets maximum visibility across Maharashtra and beyond
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <button
              onClick={scrollToForm}
              className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-[13px] sm:text-[14px] font-bold text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
              style={{ background: `linear-gradient(135deg,${ORANGE},${ORANGE_DARK})` }}
            >
              Post Your Property Free
            </button>
            <div className="flex items-center gap-2 text-blue-200 text-[12px] sm:text-[13.5px]">
              <MapPin size={13} style={{ color: ORANGE }} />
              Serving Maharashtra &amp; Nearby Regions
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          FAQ
      ════════════════════════════════════ */}
      <section className="py-8 sm:py-6 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-3"
              style={{ background: NAVY_LIGHT, color: NAVY }}>
              FAQ
            </div>
            <h2 className="text-[1.6rem] sm:text-[1.9rem] font-black text-gray-900 tracking-tight">
              Frequently Asked <span style={{ color: ORANGE }}>Questions</span>
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f, i) => <FAQItem key={i} {...f} />)}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          BOTTOM CTA
      ════════════════════════════════════ */}
      <section className="py-10 sm:py-16 border-t" style={{ borderColor: '#f0f0f0', background: GRAY_50 }}>
        <div className="max-w-xl mx-auto px-4 text-center">
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-5"
            style={{ background: NAVY_LIGHT }}
          >
            <Rocket size={22} className="sm:w-[26px] sm:h-[26px]" style={{ color: NAVY }} />
          </div>
          <h2 className="text-[1.4rem] sm:text-[1.6rem] font-black text-gray-900 mb-2 tracking-tight">
            Ready to Sell Your Property?
          </h2>
          <p className="text-[12px] sm:text-[13.5px] text-gray-500 mb-6 sm:mb-7">Free, fast, and effective. Start your listing now.</p>
          <button
            onClick={scrollToForm}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-[13px] sm:text-[14px] font-bold text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
            style={{ background: `linear-gradient(135deg,${ORANGE},${ORANGE_DARK})` }}
          >
            Post Property for Free <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* ════════ Modal ════════ */}
      <PublicSellPropertyForm
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setModalInitialData(null); }}
        onSubmit={handleModalSubmit}
        mode="create"
        initialData={modalInitialData}
        startAtStep2={true}
      />
    </div>
  );
};

export default SellPropertyPage;