import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Award,
  Shield,
  Target,
  Heart,
  Star,
  CheckCircle,
  TrendingUp,
  Home,
  Building,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Eye,
  Handshake,
  Crown,
  Gem,
  Zap,
  Rocket,
  ArrowRight,
  Play,
  FileCheck,
  Headphones,
  Key,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';

// Import local images from public directory
import igImg from '/ig.jpg';
import ig1Img from '/ig1.jpg';
import img1Img from '/ig.jpg';
import img2Img from '/img2.jpg';
import galleryImg from '/gallery.png';
import propertyImg from '/property.png';

const serifFont = { fontFamily: "'Playfair Display', 'Fraunces', Georgia, serif" };

const AboutUsPage = () => {
  const { systemSettings } = useSystemSettings();
  const companyName = systemSettings?.company_name || 'ResaleExpert';

  const [activeSlide, setActiveSlide] = useState(0);

  const stats = [
    { label: 'Years Experience', value: '12+ YRS', icon: Award, sub: 'In Real Estate' },
    { label: 'Properties Sold', value: '900+', icon: Home, sub: 'Verified Deals Closed' },
    { label: 'Happy Customers', value: '1200+', icon: Users, sub: 'Satisfied Families' },
    { label: 'Verified Partners', value: '100%', icon: ShieldCheck, sub: 'Legal Compliance' }
  ];

  const featuredProperties = [
    {
      title: 'Vida Luxury Residences',
      price: '₹1.25 Cr onwards',
      specs: '2-3 BHK • 1,250 sq.ft',
      badge: 'EXCLUSIVE',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Burj View Horizon Towers',
      price: '₹2.40 Cr onwards',
      specs: '3-4 BHK • 1,850 sq.ft',
      badge: 'POPULAR',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Palm Beach Ocean Villas',
      price: '₹3.10 Cr onwards',
      specs: '4-5 BHK • 2,800 sq.ft',
      badge: 'VERIFIED',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Park View Penthouse',
      price: '₹1.65 Cr onwards',
      specs: '2-3 BHK • 1,450 sq.ft',
      badge: 'HOT DEAL',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    }
  ];

  const whyChooseUs = [
    {
      icon: Handshake,
      title: 'Personalized Selection',
      desc: 'Tailored property curation based on your exact budget, preferred location, and lifestyle needs.'
    },
    {
      icon: FileCheck,
      title: 'Full Legal Guidance',
      desc: 'Complete end-to-end title verification, document check, registration support, and loan assistance.'
    },
    {
      icon: Key,
      title: 'Verified Inventory',
      desc: 'Direct-from-owner and verified broker listings with 100% price transparency and zero hidden fees.'
    },
    {
      icon: Headphones,
      title: '24/7 Dedicated Support',
      desc: 'Round-the-clock expert advisor availability from initial inquiry to key handover and beyond.'
    }
  ];

  const team = [
    {
      name: 'Laxman Vhadade',
      role: 'Founder & CEO',
      experience: '12+ years',
      specialization: 'Luxury Properties & Strategic Growth',
      image: '/photo2.jpg'
    }
  ];

  const achievements = [
    {
      year: '2012',
      title: 'AAKAR INFRA SERVICES',
      description: 'Started with civil engineering and infrastructure projects, building a strong foundation in residential and commercial construction.'
    },
    {
      year: '2019',
      title: 'Digital Transformation',
      description: 'Embraced digital innovation with smart project management, client engagement platforms, IoT-enabled construction, and consulting services to meet evolving market demands.'
    },
    {
      year: '2024',
      title: 'Resale Expert Launched',
      description: 'Launched Resale Expert, a dedicated resale property platform focused on verified listings, smarter lead management, and a seamless experience for buyers and sellers.'
    },

    {
      year: '2025+',
      title: 'HOUSLY FINNTECH REALTY',
      description: 'Rebranded as HOUSLY FINNTECH REALTY, bringing together Real Estate, FinTech, and IT Solutions under one visionary brand while driving AI-powered innovation and future-ready smart city initiatives.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B3854] text-white font-sans overflow-x-hidden selection:bg-[#E6761D] selection:text-black">

      {/* ==================================================================== */}
      {/* 1. HERO SECTION: PREMIUM GRADIENT + IMAGE DUAL LAYER                */}
      {/* ==================================================================== */}
      <section className="relative min-h-[58vh] lg:min-h-[64vh] flex items-center justify-center pt-16 pb-10 overflow-hidden">

        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={img1Img || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=80"}
            alt="Luxury Skyline"
            className="w-full h-full object-cover object-center scale-105 animate-subtle-zoom"
          />
        </div>

        {/* Premium Readability Overlay: Left-to-Right Navy Gradient */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, rgba(11,56,84,0.95) 0%, rgba(11,56,84,0.85) 35%, rgba(11,56,84,0.55) 60%, rgba(11,56,84,0.15) 85%, rgba(11,56,84,0.05) 100%)',
          }}
        />
        {/* Bottom fade for smooth wave transition */}
        <div
          className="absolute inset-x-0 bottom-0 h-40 z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(11,56,84,0) 0%, rgba(11,56,84,0.65) 70%, rgba(11,56,84,1) 100%)',
          }}
        />

        {/* Decorative Orange Radial Orbs (exact brand orange) */}
        <div
          className="absolute -top-32 -right-32 w-[350px] h-[350px] rounded-full pointer-events-none z-10"
          style={{
            background:
              'radial-gradient(circle, rgba(230,118,29,0.28) 0%, rgba(230,118,29,0) 70%)',
          }}
        />
        <div
          className="absolute -bottom-32 -left-20 w-[300px] h-[300px] rounded-full pointer-events-none z-10"
          style={{
            background:
              'radial-gradient(circle, rgba(26,58,92,0.6) 0%, rgba(26,58,92,0) 70%)',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full pt-4">
          <div className="max-w-3xl">



            {/* Main Headline */}
            <h1
              style={serifFont}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15] mb-4 drop-shadow-[0_4px_18px_rgba(0,0,0,0.65)]"
            >
              Redefining{' '}
              <span
                className="relative inline-block"
                style={{
                  color: '#E6761D',
                  textShadow: '0 2px 12px rgba(230,118,29,0.45)',
                }}
              >
                Luxury Resale
                {/* subtle underline accent */}
                <span
                  className="absolute left-0 -bottom-1 h-[3px] w-full rounded-full opacity-70"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(230,118,29,0) 0%, #E6761D 50%, rgba(230,118,29,0) 100%)',
                  }}
                />
              </span>{' '}
              Across India
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-[15px] text-white/90 leading-relaxed mb-6 max-w-2xl font-medium drop-shadow-[0_2px_10px_rgba(0,0,0,0.7)]">
              Welcome to <strong className="text-white font-bold">{companyName}</strong> — India's premier real estate
              ecosystem connecting buyers, sellers, and landlords with verified luxury properties, transparent pricing,
              and expert legal advisory.
            </p>


          </div>
        </div>

        {/* Organic Bottom Wave Transition */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
          <svg className="w-full h-10 sm:h-14 fill-current" style={{ color: '#0B3854' }} viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,32L80,42.7C160,53,320,75,480,74.7C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" />
          </svg>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 2. STATS BANNER: SLEEK FROSTED GLASS BAR WITH ORANGE BADGES          */}
      {/* ==================================================================== */}
      <section className="relative z-30 -mt-6 sm:-mt-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="bg-[#0f1f33]/90 backdrop-blur-xl border border-white/15 rounded-2xl p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-2 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className={`flex items-center gap-3 ${i !== 0 ? 'sm:pl-5' : ''} ${i >= 2 ? 'pt-3 sm:pt-0' : ''}`}>
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner"
                    style={{
                      backgroundColor: 'rgba(230,118,29,0.15)',
                      border: '1px solid rgba(230,118,29,0.4)',
                      color: '#E6761D',
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div style={serifFont} className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      {stat.value}
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: '#E6761D' }}>
                      {stat.label}
                    </div>
                    <div className="text-[10px] text-white/50 hidden sm:block">
                      {stat.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. ABOUT US / STORY SECTION (PREMIUM WHITE + CURVED IMAGE CARD)     */}
      {/* ==================================================================== */}
      <section id="about-story" className="relative py-14 bg-white text-[#0d1c2b] overflow-hidden">
        {/* Top Wave */}
        <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
          <svg className="w-full h-10 sm:h-14 fill-current" style={{ color: '#0B3854' }} viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,0L120,21.3C240,43,480,85,720,85C960,85,1200,43,1320,21.3L1440,0L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 pt-5">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">

            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: '#E6761D' }}>
                <span className="w-6 h-px" style={{ backgroundColor: '#E6761D' }} /> ABOUT US
              </div>

              <h2
                style={serifFont}
                className="text-2xl sm:text-3xl font-bold text-[#071320] leading-[1.2] tracking-tight"
              >
                Premier Real Estate Experts across <span style={{ color: '#E6761D' }}>Maharashtra</span>
              </h2>

              <p className="text-sm text-[#384857] leading-relaxed font-normal">
                {companyName} is a boutique real estate consultancy dedicated to delivering personalized property search, transparent valuations, and end-to-end transaction management.
              </p>

              <p className="text-sm text-[#4c5c6b] leading-relaxed font-light">
                We believe that buying or selling a home is more than a financial transaction — it is an investment in your future. Our team of market specialists, legal advisors, and customer managers ensure a seamless experience from search to key handover.
              </p>

              {/* Bullet Points */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {[
                  '100% Verified Properties',
                  'Zero Brokerage Hassle',
                  'Expert Legal Advisory',
                  'Instant WhatsApp Updates'
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0" style={{ color: '#E6761D' }} />
                    <span className="text-xs font-semibold text-[#182836]">{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border-2 font-bold text-xs uppercase tracking-wider rounded-full transition-all duration-300 shadow-md group cursor-pointer"
                  style={{ borderColor: '#E6761D', color: '#071320' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E6761D';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#071320';
                  }}
                >
                  <span>GET IN TOUCH WITH US</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Right Asymmetric Curved Image Frame */}
            <div className="lg:col-span-6 relative">
              <div className="relative mx-auto max-w-sm lg:max-w-none">
                {/* Decorative background shape */}
                <div
                  className="absolute -top-4 -right-4 w-full h-full pointer-events-none"
                  style={{
                    borderRadius: '36px 10px 36px 10px',
                    border: '2px solid rgba(230,118,29,0.3)',
                  }}
                />

                {/* Curved Main Image Container */}
                <div
                  className="relative overflow-hidden shadow-[0_20px_50px_rgba(7,19,32,0.15)] border-4 border-white"
                  style={{ borderRadius: '32px 10px 32px 10px' }}
                >
                  <img
                    src={ig1Img || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80"}
                    alt="Premium Architecture"
                    className="w-full h-[300px] sm:h-[340px] object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071320]/75 via-transparent to-transparent" />

                  {/* Floating Badge inside Image */}
                  <div className="absolute bottom-4 left-4 right-4 p-3 bg-white/90 backdrop-blur-md rounded-2xl border border-white/50 flex items-center justify-between shadow-xl">
                    <div>
                      <div className="text-[11px] font-bold text-[#071320] uppercase tracking-wider">
                        Trusted Excellence
                      </div>
                      <div className="text-[10px] text-gray-600">
                        Serving 25,000+ satisfied clients since 2013
                      </div>
                    </div>
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: '#071320', color: '#E6761D' }}
                    >
                      <Crown className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Wave Transition */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
          <svg className="w-full h-10 sm:h-14 fill-current" style={{ color: '#0B3854' }} viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,64L120,74.7C240,85,480,107,720,106.7C960,107,1200,85,1320,74.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" />
          </svg>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. FEATURED RESALE PORTFOLIO / SELECTION (DARK NAVY LUXURY CARDS)   */}
      {/* ==================================================================== */}
      <section className="py-14 bg-[#0B3854] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#E6761D' }}>
                <span className="w-6 h-px" style={{ backgroundColor: '#E6761D' }} /> CURATED SELECTION
              </div>
              <h2 style={serifFont} className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Premier Offers on the Real Estate Market
              </h2>
            </div>
            <Link
              to="/properties"
              className="mt-3 md:mt-0 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 transition-colors group cursor-pointer"
              style={{ color: '#E6761D' }}
            >
              <span>SEE ALL LISTINGS</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredProperties.map((prop, index) => (
              <div
                key={index}
                className="group bg-[#0f1f33]/80 rounded-2xl overflow-hidden border border-white/10 hover:border-[#E6761D]/50 transition-all duration-300 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={prop.image}
                      alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1f33] via-transparent to-transparent opacity-80" />
                    <span
                      className="absolute top-3 left-3 px-2.5 py-1 backdrop-blur-md text-[10px] font-bold tracking-wider uppercase rounded-md"
                      style={{
                        backgroundColor: 'rgba(11,56,84,0.8)',
                        border: '1px solid rgba(230,118,29,0.4)',
                        color: '#E6761D',
                      }}
                    >
                      {prop.badge}
                    </span>
                  </div>

                  <div className="p-3">
                    <h3 className="text-sm font-bold text-white mb-1 line-clamp-1 group-hover:text-[#E6761D] transition-colors">
                      {prop.title}
                    </h3>
                    <p className="text-[11px] text-white/60 mb-1.5">{prop.specs}</p>
                    <div style={serifFont} className="text-base font-bold text-[#E6761D]">
                      {prop.price}
                    </div>
                  </div>
                </div>

                <div className="px-3 pb-3 pt-1">
                  <Link
                    to="/properties"
                    className="w-full py-2 bg-white/5 hover:bg-[#E6761D] hover:text-[#0B3854] text-white text-xs font-bold rounded-xl border border-white/15 transition-all text-center block cursor-pointer"
                  >
                    VIEW DETAILS
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. WHY CHOOSE US (PREMIUM WHITE SECTION WITH ROUND ICON BADGES)     */}
      {/* ==================================================================== */}
      <section className="py-14 bg-white text-[#0d1c2b] relative overflow-hidden">
        {/* Top Wave */}
        <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
          <svg className="w-full h-10 sm:h-14 fill-current" style={{ color: '#0B3854' }} viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,0L120,21.3C240,43,480,85,720,85C960,85,1200,43,1320,21.3L1440,0L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 pt-3">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#E6761D' }}>
              WHY CLIENTS TRUST US
            </div>
            <h2 style={serifFont} className="text-2xl sm:text-3xl font-bold text-[#071320] leading-tight">
              Your Trusted Partner in Property Resale
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyChooseUs.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-gray-100 shadow-[0_10px_30px_rgba(7,19,32,0.06)] flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-inner"
                    style={{
                      backgroundColor: 'rgba(230,118,29,0.1)',
                      border: '2px solid rgba(230,118,29,0.3)',
                      color: '#E6761D',
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-[#071320] mb-1.5">{item.title}</h3>
                  <p className="text-xs text-[#4c5c6b] leading-relaxed font-light">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
          <svg className="w-full h-10 sm:h-14 fill-current" style={{ color: '#0B3854' }} viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,64L120,74.7C240,85,480,107,720,106.7C960,107,1200,85,1320,74.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" />
          </svg>
        </div>
      </section>


      {/* ==================================================================== */}
      {/* 7. OUR FOUNDER & TIMELINE (PREMIUM, COMPACT, EQUAL HEIGHT COLUMNS)   */}
      {/* ==================================================================== */}
      <section className="py-12 bg-[#0a1524] text-white border-t border-white/10 relative overflow-hidden">
        {/* subtle orange ambient glow */}
        <div
          className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(230,118,29,0.1) 0%, rgba(230,118,29,0) 70%)',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-8 items-stretch">

            {/* Leadership Column */}
            <div className="lg:col-span-5 flex flex-col h-full">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#E6761D' }}>
                LEADERSHIP
              </div>
              <h2 style={serifFont} className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Meet Our Founder & CEO
              </h2>

              <div className="flex-1 flex flex-col">
                {team.map((m, i) => (
                  <div
                    key={i}
                    className="group relative flex-1 rounded-[24px] overflow-hidden border bg-gradient-to-b from-[#0f1f33] to-[#0a1524] shadow-[0_25px_60px_rgba(0,0,0,0.45)] flex flex-col"
                    style={{ borderColor: 'rgba(230,118,29,0.25)' }}
                  >
                    {/* Photo */}
                    <div className="relative h-80 sm:h-96 overflow-hidden bg-[#0a1524] flex items-center justify-center">
                      <img
                        src={m.image}
                        alt={m.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a1524]/70 via-transparent to-transparent pointer-events-none" />
                      <div
                        className="absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center shadow-lg"
                        style={{
                          backgroundColor: 'rgba(10,21,36,0.7)',
                          border: '1px solid rgba(230,118,29,0.4)',
                          color: '#E6761D',
                        }}
                      >
                        <Crown className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-5 flex-1 flex flex-col justify-center">
                      <div className="w-8 h-px mb-3" style={{ backgroundColor: '#E6761D' }} />
                      <h3 style={serifFont} className="text-xl font-bold text-white mb-1">
                        {m.name}
                      </h3>
                      <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#E6761D' }}>
                        {m.role} • {m.experience}
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">
                        {m.specialization}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Column */}
            <div className="lg:col-span-7 flex flex-col h-full">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#E6761D' }}>
                OUR JOURNEY
              </div>
              <h2 style={serifFont} className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Milestones That Defined Us
              </h2>

              <div className="flex-1 relative">
                {/* connecting orange line */}
                <div
                  className="absolute left-7 top-3 bottom-3 w-px"
                  style={{
                    background:
                      'linear-gradient(to bottom, rgba(230,118,29,0.6) 0%, rgba(230,118,29,0.2) 60%, rgba(230,118,29,0) 100%)',
                  }}
                />

                <div className="relative flex flex-col justify-between h-full gap-1">
                  {achievements.map((item, idx) => (
                    <div key={idx} className="relative flex items-center gap-5 group">
                      <div
                        className="relative z-10 w-14 h-14 rounded-full bg-[#0f1f33] flex items-center justify-center font-bold text-[11px] shrink-0 shadow-[0_8px_20px_rgba(0,0,0,0.35)] transition-all duration-300"
                        style={{
                          border: '2px solid rgba(230,118,29,0.5)',
                          color: '#E6761D',
                        }}
                      >
                        {item.year}
                      </div>
                      <div className="flex-1 p-3.5 bg-[#0f1f33]/50 rounded-2xl border border-white/5 group-hover:border-[#E6761D]/30 group-hover:bg-[#0f1f33]/80 transition-all duration-300">
                        <h4 className="text-sm font-bold text-white mb-1">{item.title}</h4>
                        <p className="text-xs text-white/60 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Keyframe Styles */}
      <style>{`
        @keyframes subtle-zoom {
          0% { transform: scale(1); }
          50% { transform: scale(1.04); }
          100% { transform: scale(1); }
        }
        .animate-subtle-zoom {
          animation: subtle-zoom 20s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AboutUsPage;