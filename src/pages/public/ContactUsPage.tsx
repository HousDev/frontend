// src/pages/ContactUsPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Phone, Mail, MapPin, Clock, Send, Building,
  ChevronDown, Facebook, Twitter, Instagram, Linkedin,
} from 'lucide-react';
import { getMasterDropdownOptions, type MasterOption } from '@/lib/useMasterData';
import { leadsAPI } from '@/lib/api';
import { buyerAPI } from '@/lib/buyerAPI';
import { sellerAPI } from '@/lib/sellersAPI';
import { FaWhatsapp } from 'react-icons/fa';
import Swal from 'sweetalert2';

type EnquiryType = 'lead' | 'buyer' | 'seller';

interface FormData {
  enquiryType: EnquiryType;
  salutation: string;
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  messageBody: string;
  // Location fields (common for all)
  city: string;
  state: string;
  location: string;   // area / locality
  // buyer extras
  propertyType: string;
  budgetMin: string;
  budgetMax: string;
  // seller extras
  sellerPropType: string;
  expectedPrice: string;
  expectedClose: string;
}

const BRAND = '#E6761D';
const NAVY = '#0f2b3d';
const BG = '#f8f9fa';
const BORDER = '#e4e7eb';

const btnOk = 'px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#E6761D]';
const btnRed = 'px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600';
const btnGrn = 'px-4 py-2 rounded-lg text-sm font-semibold text-white bg-green-600';

const swal = (opts: object) =>
  Swal.fire({
    width: '380px', padding: '1.2rem', buttonsStyling: false,
    customClass: { popup: 'rounded-xl shadow-xl' }, ...opts
  });

const openMaps = (v: string | { lat: number; lng: number }) => {
  const url = typeof v === 'object'
    ? `https://www.google.com/maps/dir/?api=1&destination=${v.lat},${v.lng}&travelmode=driving`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(v)}&travelmode=driving`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

const inputCls = 'w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-orange-200 bg-white';
const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500';

const EMPTY: FormData = {
  enquiryType: 'lead',
  salutation: 'Mr.',
  fullName: '',
  emailAddress: '',
  phoneNumber: '',
  messageBody: '',
  city: '',
  state: '',
  location: '',
  propertyType: '',
  budgetMin: '',
  budgetMax: '',
  sellerPropType: '',
  expectedPrice: '',
  expectedClose: '',
};

const ContactUsPage: React.FC = () => {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [masterLoading, setMasterLoading] = useState(true);
  const [masters, setMasters] = useState<Record<string, MasterOption[]>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setMasterLoading(true);
        const data = await getMasterDropdownOptions(['common', 'lead', 'property']);
        setMasters(data || {});
      } catch { /* silent */ } finally { setMasterLoading(false); }
    })();
  }, []);

  const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }));
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    set(e.target.name as keyof FormData, e.target.value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Required fields validation
    if (!form.fullName.trim() || !form.emailAddress.trim() || !form.phoneNumber.trim() || !form.messageBody.trim()) {
      await swal({
        title: 'Missing Fields', text: 'Please fill all required fields.', icon: 'error',
        confirmButtonText: 'OK', customClass: { popup: 'rounded-xl shadow-xl', confirmButton: btnRed }
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const guestId = typeof window !== 'undefined' ? localStorage.getItem('app_guest_uuid') : null;
      const commonPayload = {
        salutation: form.salutation,
        name: form.fullName.trim(),
        phone: form.phoneNumber.trim().replace(/\D/g, ''),
        email: form.emailAddress.trim().toLowerCase(),
        city: form.city.trim(),
        state: form.state.trim(),
        location: form.location.trim(),
        notes: form.messageBody.trim(),
        guest_id: guestId,
      };

      if (form.enquiryType === 'buyer') {
        await buyerAPI.create({
          ...commonPayload,
          buyer_lead_source: 'Website',
          buyer_lead_status: 'new',
          buyer_lead_stage: 'initial_contact',
          buyer_lead_priority: 'medium',
          budget_min: form.budgetMin ? Number(form.budgetMin) : null,
          budget_max: form.budgetMax ? Number(form.budgetMax) : null,
          requirements: JSON.stringify({ propertyType: form.propertyType || null }),
        });
      } else if (form.enquiryType === 'seller') {
        await sellerAPI.create({
          ...commonPayload,
          source: 'Website',
          stage: 'initial_contact',
          status: 'new',
          priority: 'medium',
          leadType: form.sellerPropType || null,
          deal_value: form.expectedPrice ? Number(form.expectedPrice) : null,
          expected_close: form.expectedClose || null,
        });
      } else {
        // General enquiry → client_leads table
        await leadsAPI.createLead({
          salutation: form.salutation,
          name: form.fullName.trim(),
          phone: form.phoneNumber.trim().replace(/\D/g, ''),
          email: form.emailAddress.trim().toLowerCase(),
          lead_source: 'Website',
          lead_type: 'General Enquiry',
          status: 'new',
          priority: 'medium',
          whatsapp_number: form.phoneNumber.trim().replace(/\D/g, '') || null,
          notes: form.messageBody.trim(),
          guest_id: guestId,
          // 👇 Location fields – convert empty strings to null
          state: form.state.trim() || null,
          city: form.city.trim() || null,
          location: form.location.trim() || null,
          assigned_executive: null,
        });
      }

      await swal({
        title: 'Submitted!', text: 'Thank you! We will get back to you within 24 hours.',
        icon: 'success', timer: 3000, timerProgressBar: true, showConfirmButton: false,
        customClass: { popup: 'rounded-xl shadow-xl', confirmButton: btnGrn },
      });
      setForm(EMPTY);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to send. Please try again.';
      await swal({
        title: 'Error', text: msg, icon: 'error', confirmButtonText: 'OK',
        customClass: { popup: 'rounded-xl shadow-xl', confirmButton: btnRed }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const propertyTypeOptions: MasterOption[] = masters['property type'] || [];
  const propTypeList = propertyTypeOptions.length
    ? propertyTypeOptions
    : [
      { value: 'Residential', label: 'Residential' },
      { value: 'Commercial', label: 'Commercial' },
      { value: 'Plot', label: 'Plot' },
      { value: 'Villa', label: 'Villa' },
    ] as any;

  const contactCards = [
    { icon: Phone, title: 'Phone', lines: ['+91 9637 00 9639', '+91 9146 00 9176'], sub: '24 / 7 Support' },
    { icon: Mail, title: 'Email', lines: ['info@resaleexpert.in'], sub: 'Quick Response' },
    { icon: MapPin, title: 'Office', lines: ['Shubhchandra, Nakhate Chowk', 'Rahatani, Pimpri-Chinchwad, Pune 411017'], sub: 'Maharashtra, India' },
    { icon: Clock, title: 'Working Hours', lines: ['Mon – Fri  10:00 AM – 8:00 PM', 'Sat – Sun   9:00 AM – 9:00 PM'], sub: 'Extended hours' },
  ] as const;

  const offices = [
    { city: 'Pune', address: 'Shubhchandra, Rahatani, Pune – 411017', phone: '+91 9637 00 9639', email: 'pune@resaleexpert.in', lat: 18.6070, lng: 73.7919 },
  ];

  const faqs = [
    { q: 'How quickly do you respond?', a: 'Within 2–4 hours during business hours; within 24 hours on weekends.' },
    { q: 'Is the initial consultation free?', a: 'Yes, our initial consultation is completely free of charge.' },
    { q: 'Which cities do you operate in?', a: 'Currently Mumbai, Pune, Delhi, Bangalore, and Hyderabad – expanding soon.' },
    { q: 'Can I schedule a property visit?', a: 'Absolutely – via our website, app, or by calling our team directly.' },
  ] as const;

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>

      {/* ── Hero ── */}
      <section className="py-28 pt-28" style={{ background: 'linear-gradient(to right, #0b3856, #0c3854)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-3 text-white">Get in Touch</h2>
            <p className="text-lg mb-2 text-blue-100 max-w-3xl mx-auto">
              Ready to find your dream property or sell your current one? Our expert team is here to help you every step
              of the way.
            </p>
            <div className="flex items-center justify-center space-x-8 mt-6">
              <div className="text-center">
                <div className="text-xl font-bold mb-2 text-white">2-4 Hours</div>
                <div className="text-blue-200">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold mb-2 text-white">24/7</div>
                <div className="text-blue-200">Support Available</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold mb-2 text-white">98%</div>
                <div className="text-blue-200">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Form + Contact info ── */}
      <section className="py-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

            {/* ────────── LEFT: Form ────────── */}
            <div className="lg:col-span-3">
              <div className="overflow-hidden rounded-xl bg-white shadow-sm" style={{ border: `1px solid ${BORDER}` }}>
                <div className="border-b px-5 pb-3 pt-4" style={{ borderColor: BORDER }}>
                  <h2 className="text-lg font-bold text-gray-900">Send us a Message</h2>
                  <p className="mt-0.5 text-xs text-gray-500">Fill out the form and our team will reach out shortly.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">

                  {/* ── ROW 1: Salutation + Full Name + Phone ── */}
                  <div className="grid grid-cols-5 gap-2">
                    <div>
                      <label className={labelCls + " text-xs"}>Salutation</label>
                      <select name="salutation" value={form.salutation} onChange={onChange}
                        className={inputCls + " py-2 text-sm"} style={{ borderColor: BORDER }}>
                        {['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className={labelCls + " text-xs"}>Full Name <span className="text-red-500">*</span></label>
                      <input type="text" name="fullName" value={form.fullName} onChange={onChange}
                        placeholder="e.g. Rahul Sharma" required autoComplete="name"
                        className={inputCls + " py-2 text-sm"} style={{ borderColor: BORDER }} />
                    </div>
                    <div className="col-span-2">
                      <label className={labelCls + " text-xs"}>Phone Number <span className="text-red-500">*</span></label>
                      <input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={onChange} maxLength={10}
                        placeholder="+91 98765 43210" required autoComplete="tel"
                        className={inputCls + " py-2 text-sm"} style={{ borderColor: BORDER }} />
                    </div>
                  </div>

                  {/* ── ROW 2: Email + Purpose of Enquiry ── */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className={labelCls + " text-xs"}>Email Address <span className="text-red-500">*</span></label>
                      <input type="email" name="emailAddress" value={form.emailAddress} onChange={onChange}
                        placeholder="you@example.com" required autoComplete="email"
                        className={inputCls + " py-2 text-sm"} style={{ borderColor: BORDER }} />
                    </div>
                    <div>
                      <label className={labelCls + " text-xs"}>Purpose of Enquiry <span className="text-red-500">*</span></label>
                      <select name="enquiryType" value={form.enquiryType} onChange={onChange}
                        className={inputCls + " py-2 text-sm"} style={{ borderColor: BORDER }}>
                        <option value="lead">General / New Enquiry</option>
                        <option value="buyer">I want to Buy a Property</option>
                        <option value="seller">I want to Sell my Property</option>
                      </select>
                    </div>
                  </div>

                  {/* ── ROW 3: City + State + Location (All in one row) ── */}
                  <div className="space-y-2 border-t border-dashed pt-3" style={{ borderColor: BORDER }}>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Property Location (Optional)</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <div>
                        <label className={labelCls + " text-xs"}>City</label>
                        <input type="text" name="city" value={form.city} onChange={onChange}
                          placeholder="e.g. Pune" className={inputCls + " py-2 text-sm"} style={{ borderColor: BORDER }} />
                      </div>
                      <div>
                        <label className={labelCls + " text-xs"}>State</label>
                        <input type="text" name="state" value={form.state} onChange={onChange}
                          placeholder="e.g. Maharashtra" className={inputCls + " py-2 text-sm"} style={{ borderColor: BORDER }} />
                      </div>
                      <div>
                        <label className={labelCls + " text-xs"}>Area / Locality</label>
                        <input type="text" name="location" value={form.location} onChange={onChange}
                          placeholder="e.g. Wakad, Hinjewadi" className={inputCls + " py-2 text-sm"} style={{ borderColor: BORDER }} />
                      </div>
                    </div>
                  </div>

                  {/* ══ BUYER conditional fields ══ */}
                  {form.enquiryType === 'buyer' && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div>
                        <label className={labelCls + " text-xs"}>Property Type</label>
                        <select name="propertyType" value={form.propertyType} onChange={onChange}
                          className={inputCls + " py-2 text-sm"} style={{ borderColor: BORDER }}>
                          <option value="">— Select —</option>
                          {propTypeList.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls + " text-xs"}>Budget Min (₹)</label>
                        <input type="text" inputMode="numeric" name="budgetMin" value={form.budgetMin} onChange={onChange}
                          placeholder="e.g. 50,00,000" className={inputCls + " py-2 text-sm"} style={{ borderColor: BORDER }} />
                      </div>
                      <div>
                        <label className={labelCls + " text-xs"}>Budget Max (₹)</label>
                        <input type="text" inputMode="numeric" name="budgetMax" value={form.budgetMax} onChange={onChange}
                          placeholder="e.g. 1,00,00,000" className={inputCls + " py-2 text-sm"} style={{ borderColor: BORDER }} />
                      </div>
                    </div>
                  )}

                  {/* ══ SELLER conditional fields ══ */}
                  {form.enquiryType === 'seller' && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className={labelCls + " text-xs"}>Property Type</label>
                        <select name="sellerPropType" value={form.sellerPropType} onChange={onChange}
                          className={inputCls + " py-2 text-sm"} style={{ borderColor: BORDER }}>
                          <option value="">— Select —</option>
                          {propTypeList.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls + " text-xs"}>Selling Price (₹)</label>
                        <input type="text" inputMode="numeric" name="expectedPrice" value={form.expectedPrice} onChange={onChange}
                          placeholder="e.g. 75,00,000" className={inputCls + " py-2 text-sm"} style={{ borderColor: BORDER }} />
                      </div>
                    </div>
                  )}

                  {/* ── Message ── */}
                  <div>
                    <label className={labelCls + " text-xs"}>Message <span className="text-red-500">*</span></label>
                    <textarea name="messageBody" value={form.messageBody} onChange={onChange}
                      rows={3} required
                      placeholder="Describe your requirements in detail…"
                      className="w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-orange-200"
                      style={{ borderColor: BORDER }} />
                  </div>

                  {/* ── Submit ── */}
                  <button type="submit" disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                    style={{ background: BRAND }}>
                    {isSubmitting
                      ? <><div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /><span>Sending…</span></>
                      : <><Send size={14} /><span>Send Message</span></>}
                  </button>

                </form>
              </div>
            </div>

            {/* ────────── RIGHT: Contact info ────────── */}
            <div className="space-y-3 lg:col-span-2">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Contact Information</h2>
                <p className="mt-0.5 text-xs text-gray-500">Multiple ways to reach us.</p>
              </div>

              {contactCards.map((c, i) => {
                const Icon = c.icon as any;
                return (
                  <div key={i} className="flex items-start gap-3 rounded-lg bg-white p-3 transition-shadow hover:shadow-md"
                    style={{ border: `1px solid ${BORDER}` }}>
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `${BRAND}15`, color: BRAND }}>
                      <Icon size={13} />
                    </div>
                    <div className="min-w-0">
                      <div className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-400">{c.title}</div>
                      {c.lines.map((l, j) => <div key={j} className="text-xs font-medium text-gray-700">{l}</div>)}
                      <div className="mt-0.5 text-[10px] text-gray-400">{c.sub}</div>
                    </div>
                  </div>
                );
              })}

              {/* CTA card */}
              <div className="rounded-lg p-4 text-white"
                style={{ background: `linear-gradient(135deg, ${NAVY}, #1a3a52)` }}>
                <div className="mb-0.5 text-sm font-semibold">Need Immediate Assistance?</div>
                <div className="mb-3 text-[10px] text-blue-200">Available around the clock.</div>
                <div className="flex gap-2">
                  <button onClick={() => window.open('tel:+919637009639')}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-white hover:opacity-90"
                    style={{ background: BRAND }}>
                    <Phone size={12} /> Call Now
                  </button>
                  <button onClick={() => window.open('https://wa.me/919637009639', '_blank')}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-white hover:opacity-90"
                    style={{ background: '#25D366' }}>
                    <FaWhatsapp size={12} /> WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Office + Stay Connected (MERGED ROW) ── */}
      <section className="py-10" style={{ background: `linear-gradient(135deg, ${NAVY}, #1a3a52)` }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">

            {/* ── LEFT: Our Office ── */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">Our Office</h2>
                <p className="mt-1 text-sm text-blue-200">Come visit us in Pune</p>
              </div>

              {offices.map((o, i) => (
                <div key={i} className="rounded-2xl p-6"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-xl p-2" style={{ background: `${BRAND}25`, color: BRAND }}>
                      <Building size={15} />
                    </div>
                    <h3 className="font-bold text-white">{o.city}</h3>
                  </div>
                  <div className="space-y-2 text-sm text-blue-100">
                    <div className="flex items-start gap-2"><MapPin size={13} className="mt-0.5 flex-shrink-0 text-blue-300" /><span>{o.address}</span></div>
                    <div className="flex items-center gap-2"><Phone size={13} className="flex-shrink-0 text-blue-300" /><span>{o.phone}</span></div>
                    <div className="flex items-center gap-2"><Mail size={13} className="flex-shrink-0 text-blue-300" /><span>{o.email}</span></div>
                  </div>
                  <button onClick={() => openMaps({ lat: o.lat, lng: o.lng })}
                    className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold text-white hover:opacity-90"
                    style={{ background: BRAND }}>
                    Get Directions
                  </button>
                </div>
              ))}
            </div>

            {/* ── RIGHT: Stay Connected ── */}
            <div className="flex flex-col justify-center">
              <div className="text-center lg:text-left">
                <h2 className="mb-2 text-2xl font-bold text-white">Stay Connected</h2>
                <p className="mb-6 text-sm text-blue-200">Follow us for the latest listings, news, and real estate tips</p>
              </div>

              <div className="mb-8 flex items-center justify-center gap-4 lg:justify-start">
                {[
                  { Icon: Facebook, href: 'https://www.facebook.com/resaleexpert.i' },
                  { Icon: Twitter, href: 'https://twitter.com/resaleexpertin' },
                  { Icon: Instagram, href: 'https://www.instagram.com/resaleexpert.in/' },
                  { Icon: Linkedin, href: 'https://www.linkedin.com/company/resaleexpertin/' },
                ].map(({ Icon, href }, i) => (
                  <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                    className="rounded-xl p-3 transition-colors hover:bg-white/20"
                    style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <Icon size={17} className="text-white" />
                  </a>
                ))}
              </div>

              <div className="rounded-2xl px-8 py-6"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <h3 className="mb-1 text-base font-bold text-white">Emergency Contact</h3>
                <p className="mb-4 text-xs text-blue-200">Urgent assistance outside business hours</p>
                <div className="flex flex-col items-center gap-3 text-sm text-white sm:flex-row sm:gap-8">
                  <div className="flex items-center gap-2"><Phone size={13} /><span>+91 9146 00 9176</span></div>
                  <div className="flex items-center gap-2"><Mail size={13} /><span>urgent@resaleexpert.in</span></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FAQ (PREMIUM COMPACT) ── */}
      <section className="relative overflow-hidden py-14 bg-gradient-to-b from-[#f8fafd] to-[#eef2f7]">

        {/* Subtle background orbs */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 left-1/3 w-[400px] h-[400px] bg-blue-300/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 right-1/4 w-[350px] h-[350px] bg-indigo-300/15 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10">
           
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f172a] tracking-tight">
              Frequently Asked <span className="text-[#2563eb]">Questions</span>
            </h2>
          </div>

          {/* 3-column: Left FAQs | Center Image | Right FAQs */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px_1fr] gap-5 lg:gap-6 items-center">

            {/* ── Left column: FAQ 1 & 3 ── */}
            <div className="flex flex-col gap-4">
              {faqs.filter((_, i) => i % 2 === 0).map((f, idx) => {
                const realIndex = idx * 2;
                const open = openFaq === realIndex;
                return (
                  <div key={realIndex} className="w-full">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : realIndex)}
                      className={`w-full rounded-xl px-5 py-3.5 text-left text-[13px] font-bold transition-all duration-300 border
                        ${open
                          ? 'bg-[#0f2b3d] text-white border-[#0f2b3d] shadow-lg'
                          : 'bg-white text-gray-800 border-gray-200/80 shadow-sm hover:shadow-md hover:border-blue-200'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className={`flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-black ${open ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
                            {realIndex + 1}
                          </span>
                          <span>{f.q}</span>
                        </div>
                        <ChevronDown size={15} className={`flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-[200px] opacity-100 mt-0' : 'max-h-0 opacity-0'}`}>
                      <div className="px-5 py-3 bg-white rounded-b-xl border border-t-0 border-gray-200/80 shadow-sm">
                        <p className="text-[13px] leading-relaxed text-gray-600">{f.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Center: Image with soft rounded corners ── */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                {/* soft glow behind image */}
                <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-blue-200/40 via-indigo-200/30 to-transparent blur-2xl scale-95" />
                <img
                  src="/FAQ.jpg"
                  alt="FAQ illustration"
                  className="w-full h-auto max-h-[240px] object-contain rounded-[1.75rem] shadow-lg ring-1 ring-black/5 bg-white/40 backdrop-blur-sm p-2"
                />
              </div>
            </div>

            {/* ── Right column: FAQ 2 & 4 ── */}
            <div className="flex flex-col gap-4">
              {faqs.filter((_, i) => i % 2 === 1).map((f, idx) => {
                const realIndex = idx * 2 + 1;
                const open = openFaq === realIndex;
                return (
                  <div key={realIndex} className="w-full">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : realIndex)}
                      className={`w-full rounded-xl px-5 py-3.5 text-left text-[13px] font-bold transition-all duration-300 border
                        ${open
                          ? 'bg-[#0f2b3d] text-white border-[#0f2b3d] shadow-lg'
                          : 'bg-white text-gray-800 border-gray-200/80 shadow-sm hover:shadow-md hover:border-blue-200'
                        }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className={`flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-black ${open ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
                            {realIndex + 1}
                          </span>
                          <span>{f.q}</span>
                        </div>
                        <ChevronDown size={15} className={`flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-[200px] opacity-100 mt-0' : 'max-h-0 opacity-0'}`}>
                      <div className="px-5 py-3 bg-white rounded-b-xl border border-t-0 border-gray-200/80 shadow-sm">
                        <p className="text-[13px] leading-relaxed text-gray-600">{f.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default ContactUsPage;