import React from 'react';
import {
  Home,
  Building,
  CreditCard,
  FileText,
  Shield,
  Users,
  CheckCircle,
  Star,
  Award,
  TrendingUp,
  Eye,
  Search,
  HandHeart,
  Calculator,
  ChevronDown,
  Crown,
  Sparkles,
  ThumbsUp,
  Briefcase,
  type LucideIcon,
} from 'lucide-react';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';
import ContactQuickModal from './ContactQuickModal';

type ServiceColor = 'blue' | 'green' | 'purple' | 'orange' | 'indigo' | 'pink';

const colorMap: Record<
  ServiceColor,
  { bg: string; hover: string; text: string; lite: string; dotBg: string; dotText: string }
> = {
  blue: { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', text: 'text-blue-600', lite: 'bg-blue-50', dotBg: 'bg-blue-100', dotText: 'text-blue-700' },
  green: { bg: 'bg-green-500', hover: 'hover:bg-green-600', text: 'text-green-600', lite: 'bg-green-50', dotBg: 'bg-green-100', dotText: 'text-green-700' },
  purple: { bg: 'bg-purple-500', hover: 'hover:bg-purple-600', text: 'text-purple-600', lite: 'bg-purple-50', dotBg: 'bg-purple-100', dotText: 'text-purple-700' },
  orange: { bg: 'bg-orange-500', hover: 'hover:bg-orange-600', text: 'text-orange-600', lite: 'bg-orange-50', dotBg: 'bg-orange-100', dotText: 'text-orange-700' },
  indigo: { bg: 'bg-indigo-500', hover: 'hover:bg-indigo-600', text: 'text-indigo-600', lite: 'bg-indigo-50', dotBg: 'bg-indigo-100', dotText: 'text-indigo-700' },
  pink: { bg: 'bg-pink-500', hover: 'hover:bg-pink-600', text: 'text-pink-600', lite: 'bg-pink-50', dotBg: 'bg-pink-100', dotText: 'text-pink-700' },
};

type CoreService = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  color: ServiceColor;
  features: string[];
  process: string[];
  price: string;
  duration: string;
  successRate: string;
};

/** Compact node-style card used in the hub-and-spoke Core Services diagram */
const CompactServiceCard = ({
  service,
  onGetStarted,
}: {
  service: CoreService;
  onGetStarted: (svc: { id: string; title: string }) => void;
}) => {
  const Icon = service.icon;
  const cm = colorMap[service.color];
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 p-5 md:p-6 flex flex-col h-full">
      <div className={`w-12 h-12 rounded-xl ${cm.bg} flex items-center justify-center mb-4 shadow-md`}>
        <Icon className="text-white" size={22} />
      </div>
      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1">{service.title}</h3>
      <p className={`${cm.text} text-xs md:text-sm font-semibold mb-2`}>{service.subtitle}</p>
      <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-4 flex-1">{service.description}</p>
      <div className="flex items-center justify-between mb-4 text-xs">
        <span className={`${cm.text} font-bold`}>{service.price}</span>
        <span className="text-gray-400">{service.duration}</span>
      </div>
      <button
        onClick={() => onGetStarted({ id: service.id, title: service.title })}
        className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all ${cm.bg} text-white ${cm.hover}`}
      >
        Get Started
      </button>
    </div>
  );
};

const ServicesPage = () => {
  const [showQuickContact, setShowQuickContact] = React.useState(false);
  const [selectedService, setSelectedService] =
    React.useState<{ id: string; title: string } | null>(null);

  const phonePretty = '+91 9637 00 9639';
  const phoneE164 = '+919637009639';

  const coreServices: CoreService[] = [
    {
      id: 'property-buying',
      title: 'Property Buying',
      subtitle: 'Find Your Dream Home',
      description:
        'Comprehensive assistance in finding and purchasing your perfect property with expert guidance and verified listings.',
      icon: Home,
      color: 'blue',
      features: [
        'AI-powered property matching',
        'Verified property listings',
        'Expert property evaluation',
        'Negotiation support',
        'Legal documentation assistance',
        'Post-purchase support',
      ],
      process: [
        'Requirement Analysis',
        'Property Shortlisting',
        'Site Visits & Evaluation',
        'Price Negotiation',
        'Legal Verification',
        'Registration & Handover',
      ],
      price: 'No Hidden Charges',
      duration: '15-30 days',
      successRate: '95%',
    },
    {
      id: 'property-selling',
      title: 'Property Selling',
      subtitle: 'Maximize Your Returns',
      description:
        'End-to-end selling support with premium marketing, verified buyers, and transparent pricing to get the best value.',
      icon: Building,
      color: 'green',
      features: [
        'Professional property photography',
        'Multi-channel marketing',
        'Verified buyer database',
        'Price optimization strategies',
        'Legal documentation support',
        'Hassle-free transactions',
      ],
      process: [
        'Property Valuation',
        'Documentation Review',
        'Marketing & Promotion',
        'Buyer Screening',
        'Negotiation & Closure',
        'Registration Support',
      ],
      price: '2% Commission',
      duration: '30-60 days',
      successRate: '92%',
    },
    {
      id: 'loan-assistance',
      title: 'Home Loan Assistance',
      subtitle: 'Best Rates Guaranteed',
      description:
        'Get the best home loan deals with our banking partnerships and expert assistance throughout the process.',
      icon: CreditCard,
      color: 'purple',
      features: [
        'Multiple bank partnerships',
        'Competitive interest rates',
        'Quick loan approval',
        'Documentation support',
        'EMI calculation tools',
        'Loan processing assistance',
      ],
      process: [
        'Eligibility Assessment',
        'Bank Selection',
        'Application Submission',
        'Documentation Support',
        'Loan Approval',
        'Disbursement',
      ],
      price: 'Free Service',
      duration: '3-15 days',
      successRate: '99%',
    },
    {
      id: 'legal-services',
      title: 'Legal Services',
      subtitle: 'Complete Documentation',
      description:
        'Expert legal services for all property transactions with experienced lawyers and transparent pricing.',
      icon: FileText,
      color: 'orange',
      features: [
        'Title verification',
        'Legal document preparation',
        'Due diligence support',
        'Registration assistance',
        'Dispute resolution',
        'Compliance support',
      ],
      process: [
        'Document Review',
        'Title Verification',
        'Legal Opinion',
        'Agreement Drafting',
        'Registration Support',
        'Post-transaction Support',
      ],
      price: '₹10,000 onwards',
      duration: '5-10 days',
      successRate: '99%',
    },
    {
      id: 'property-management',
      title: 'Property Management',
      subtitle: 'Hassle-Free Rentals',
      description:
        'Complete property management services including tenant screening, rent collection, and maintenance.',
      icon: Shield,
      color: 'indigo',
      features: [
        'Tenant screening & verification',
        'Rent collection management',
        'Property maintenance',
        'Legal compliance support',
        'Regular property inspections',
        '24/7 customer support',
      ],
      process: [
        'Property Assessment',
        'Tenant Sourcing',
        'Agreement Execution',
        'Move-in Support',
        'Ongoing Management',
        'Renewal/Exit Support',
      ],
      price: '8% of rental income',
      duration: 'Ongoing',
      successRate: '96%',
    },
    {
      id: 'investment-advisory',
      title: 'Investment Advisory',
      subtitle: 'Smart Investment Decisions',
      description:
        'Data-driven investment advice with market analysis and portfolio recommendations for maximum returns.',
      icon: TrendingUp,
      color: 'pink',
      features: [
        'Market trend analysis',
        'Investment opportunity identification',
        'ROI calculations',
        'Risk assessment',
        'Portfolio diversification',
        'Exit strategy planning',
      ],
      process: [
        'Investment Goal Analysis',
        'Market Research',
        'Opportunity Identification',
        'Risk Assessment',
        'Investment Execution',
        'Performance Monitoring',
      ],
      price: '₹25,000 consultation',
      duration: '30-45 days',
      successRate: '85%',
    },
  ];

  const additionalServices = [
    { title: 'Property Valuation', description: 'Professional property valuation for accurate market pricing', icon: Calculator, price: 'Contact for Pricing' },
    { title: 'Virtual Property Tours', description: '360° virtual tours for remote property viewing', icon: Eye, price: 'Contact for Pricing' },
    { title: 'Market Research Reports', description: 'Detailed market analysis and trends for specific areas', icon: Search, price: 'Contact for Pricing' },
    { title: 'Interior Design Consultation', description: 'Expert interior design advice for home staging', icon: HandHeart, price: 'Contact for Pricing' },
  ];

  const whyChooseUs = [
    { title: 'Years of Excellence', description: 'Decades of expertise in real estate', icon: Award, stat: '12+', suffix: 'years' },
    { title: 'Verified Properties', description: '100% legal and verified listings', icon: Shield, stat: '100%', suffix: '' },
    { title: 'Expert Team', description: 'Certified real estate professionals', icon: Briefcase, stat: '50+', suffix: 'experts' },
    { title: 'Customer Satisfaction', description: 'Happy customers across India', icon: Users, stat: '98%', suffix: '' },
  ];

  const serviceProcess = [
    { step: '1', title: 'Consultation', description: 'Free consultation to understand your requirements' },
    { step: '2', title: 'Planning', description: 'Detailed planning and strategy development' },
    { step: '3', title: 'Execution', description: 'Professional execution with regular updates' },
    { step: '4', title: 'Completion', description: 'Successful completion with post-service support' },
  ];

  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const toggle = (idx: number) => setOpenIndex((prev) => (prev === idx ? null : idx));

  const { systemSettings } = useSystemSettings();
  const companyName = systemSettings?.company_name;

  const handleGetStarted = (svc: { id: string; title: string }) => {
    setSelectedService({ id: svc.id, title: svc.title });
    setShowQuickContact(true);
  };

  // Reusable Section Heading Component with modern design
  const SectionHeading = ({ title, subtitle, badge }: { title: string; subtitle?: string; badge?: string }) => (
    <div className="text-center mb-8 md:mb-12">
      {badge && (
        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 rounded-full px-3 py-1 md:px-4 md:py-1.5 mb-3 md:mb-4">
          <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
          <span className="text-xs md:text-sm font-semibold tracking-wide">{badge}</span>
        </div>
      )}
      <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2 md:mb-3">
        {title}
      </h2>
      {subtitle && (
        <div className="w-16 h-0.5 md:w-20 md:h-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full mx-auto mb-3 md:mb-4"></div>
      )}
      {subtitle && (
        <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto px-2">{subtitle}</p>
      )}
    </div>
  );

  // --- SEMI-CIRCLE (ARC) POSITIONING LOGIC ---
  const semiCirclePositions = [
    { x: '-380px', y: '180px', rotate: '-15deg', scale: 0.9 }, // Left 1
    { x: '-250px', y: '40px', rotate: '-8deg', scale: 0.95 }, // Left 2
    { x: '-100px', y: '-40px', rotate: '-3deg', scale: 1 },    // Left 3 (Center-Left)
    { x: '100px', y: '-40px', rotate: '3deg', scale: 1 },    // Right 3 (Center-Right)
    { x: '250px', y: '40px', rotate: '8deg', scale: 0.95 }, // Right 2
    { x: '380px', y: '180px', rotate: '15deg', scale: 0.9 },  // Right 1
  ];
  // --------------------------------------------

  return (
    <div className="min-h-screen bg-white">
      {/* ============ HERO SECTION ============ */}
      <section className="relative pt-28 pb-14 md:pb-20 overflow-hidden text-white">
        {/* Background image + overlay */}
        <div className="absolute inset-0">
          <img
            src="/s1.jpg"
            alt="Luxury residential towers"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* YAHAN CHANGE KIYA HAI: max-w-2xl ko max-w-3xl mx-auto text-center kar diya */}
          <div className="max-w-3xl mx-auto text-center py-8 md:py-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
              Complete <span style={{ color: '#E6761D' }}>Real Estate</span> Solutions
            </h1>
            <p className="text-base sm:text-lg text-blue-100 mb-7 leading-relaxed">
              From property search to final registration, we provide end-to-end real estate
              services with expert guidance and transparent pricing.
            </p>
            <button
              className="inline-flex items-center justify-center
               w-full max-w-[240px] sm:max-w-none sm:w-auto
               px-5 sm:px-6 py-2.5 sm:py-3
               text-sm sm:text-base
               rounded-lg sm:rounded-xl
               font-semibold text-white
               shadow-md ring-1 ring-white/20
               hover:shadow-lg active:scale-[0.98]
               transition"
              style={{ backgroundColor: '#E6761D' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#CC6A1A')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#E6761D')}
              onClick={() => setShowQuickContact(true)}
            >
              Get Free Consultation
            </button>
          </div>
        </div>

        {/* Centered semicircle transition into the white services section. */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
          <svg
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full block"
            style={{ height: '80px' }}
            aria-hidden="true"
          >
            <path
              d="M0,0 L120,21.3 C240,43 480,85 720,85 C960,85 1200,43 1320,21.3 L1440,0 L1440,120 L0,120 Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </section>

      {/* ============ CORE SERVICES — SEMI-CIRCLE (ARC) DIAGRAM ============ */}
      <section className="py-12 md:py-20 bg-gray-50 overflow-hidden relative">
        {/* Background Glow (Fresia Style) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeading
            title="Our Core Services"
            subtitle="Comprehensive real estate solutions tailored to your specific needs"
            badge="What We Offer"
          />

          {/* Desktop / large screens: Semi-Circle Arc Layout */}
          <div className="hidden lg:flex justify-center items-end relative min-h-[600px] w-full max-w-6xl mx-auto mt-16">

            {/* Center Hub (Fresia Style) */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
              <div className="w-64 h-64 rounded-full bg-white border-4 border-blue-100 shadow-[0_0_50px_rgba(59,130,246,0.3)] flex flex-col items-center justify-center text-center p-6 relative">
                {/* Inner Glow Ring */}
                <div className="absolute inset-2 rounded-full border-2 border-dashed border-blue-200 animate-[spin_20s_linear_infinite]"></div>

                <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 rounded-full px-3 py-1 mb-3 z-10">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold tracking-wide">6 Services</span>
                </div>
                <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 z-10">
                  All Your Real Estate Needs
                </h3>
                <p className="text-gray-500 text-sm mt-2 z-10">
                  Buying, selling, loans, legal, management &amp; investment — under one roof.
                </p>
              </div>
            </div>

            {/* Connecting Lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ top: '-50px' }}>
              {semiCirclePositions.map((pos, i) => {
                const cardX = `calc(50% + ${pos.x})`;
                const cardY = `calc(100% - ${pos.y})`;
                return (
                  <line
                    key={i}
                    x1="50%"
                    y1="100%"
                    x2={cardX}
                    y2={cardY}
                    stroke="#cbd5e1"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    className="opacity-60"
                  />
                );
              })}
            </svg>

            {/* Service Cards positioned in Semi-Circle */}
            {coreServices.map((service, index) => {
              const pos = semiCirclePositions[index];
              return (
                <div
                  key={service.id}
                  className="absolute z-10 transition-all duration-500 hover:z-30"
                  style={{
                    left: '50%',
                    bottom: '0',
                    transform: `translateX(calc(-50% + ${pos.x})) translateY(${pos.y}) rotate(${pos.rotate}) scale(${pos.scale})`,
                  }}
                >
                  <div className="w-[280px]">
                    <CompactServiceCard service={service} onGetStarted={handleGetStarted} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile / tablet fallback: plain grid, no connector lines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:hidden mt-8">
            {coreServices.map((service) => (
              <CompactServiceCard key={service.id} service={service} onGetStarted={handleGetStarted} />
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-4 md:py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Additional Services"
            subtitle="Specialized services to enhance your property experience"
            badge="Value Added"
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 items-stretch">
            {additionalServices.map((service, index) => {
              const Icon = service.icon;
              const id = service.title.toLowerCase().replace(/\s+/g, '-');
              const colors = [
                { bg: 'from-blue-400 to-blue-500', border: 'border-blue-100', btn: 'hover:bg-blue-50 hover:text-blue-600', price: 'text-blue-600' },
                { bg: 'from-purple-400 to-purple-500', border: 'border-purple-100', btn: 'hover:bg-purple-50 hover:text-purple-600', price: 'text-purple-600' },
                { bg: 'from-emerald-400 to-emerald-500', border: 'border-emerald-100', btn: 'hover:bg-emerald-50 hover:text-emerald-600', price: 'text-emerald-600' },
                { bg: 'from-amber-400 to-amber-500', border: 'border-amber-100', btn: 'hover:bg-amber-50 hover:text-amber-600', price: 'text-amber-600' },
              ];
              const c = colors[index % colors.length];
              return (
                <div
                  key={index}
                  className={`bg-white border ${c.border} rounded-xl md:rounded-2xl p-3 md:p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 text-center flex flex-col`}
                >
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-br ${c.bg} flex items-center justify-center mx-auto mb-2 md:mb-3 shadow-md`}>
                    <Icon className="text-white" size={16} />
                  </div>
                  <h3 className="text-xs md:text-sm font-bold text-gray-800 mb-1">{service.title}</h3>
                  <p className="text-gray-500 text-[10px] md:text-xs leading-relaxed mb-1.5 md:mb-2">{service.description}</p>
                  <div className={`font-semibold mb-2 md:mb-3 text-[10px] md:text-xs ${c.price}`}>{service.price}</div>
                  <div className="mt-auto">
                    <button
                      onClick={() => handleGetStarted({ id, title: service.title })}
                      className={`w-full bg-gray-50 text-gray-700 py-1.5 px-2 rounded-lg border border-gray-100 ${c.btn} transition-all text-[10px] md:text-xs font-medium hover:shadow-sm`}
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-4 md:py-6 relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #f8fafc 0%, #eff6ff 100%)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-orange-100 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-blue-100 rounded-full blur-3xl opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 rounded-full px-3 py-1 md:px-4 md:py-1.5 mb-3 md:mb-4">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
              <span className="text-xs md:text-sm font-semibold tracking-wide">Why Trust Us</span>
            </div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2 md:mb-3">
              Why Choose {companyName || 'ResaleExpert'}?
            </h2>
            <div className="w-16 h-0.5 md:w-20 md:h-1 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full mx-auto mb-3 md:mb-4"></div>
            <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto px-2">
              Excellence backed by experience and innovation
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {whyChooseUs.map((reason, idx) => {
              const Icon = reason.icon;
              const gradients = [
                'from-blue-500 to-blue-600',
                'from-emerald-500 to-teal-600',
                'from-orange-500 to-amber-600',
                'from-purple-500 to-indigo-600',
              ];
              const grad = gradients[idx % gradients.length];

              return (
                <div
                  key={idx}
                  className="group relative bg-white rounded-xl md:rounded-2xl p-4 md:p-5 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${grad} transform origin-left transition-transform duration-300 scale-x-0 group-hover:scale-x-100`}></div>

                  <div className="relative">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center mb-3 md:mb-4 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105`}>
                      <Icon className="text-white" size={20} />
                    </div>

                    <div className="flex items-baseline gap-0.5 md:gap-1 mb-1">
                      <span className="text-2xl md:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        {reason.stat}
                      </span>
                      {reason.suffix && (
                        <span className="text-gray-500 text-[10px] md:text-xs font-medium uppercase tracking-wide">{reason.suffix}</span>
                      )}
                    </div>

                    <h3 className="text-sm md:text-base font-bold text-gray-800 mb-1">{reason.title}</h3>
                    <p className="text-gray-500 text-xs md:text-sm leading-relaxed">{reason.description}</p>

                    <div className="absolute -bottom-3 -right-3 opacity-5 group-hover:opacity-10 transition-opacity">
                      <div className="w-16 h-16 rounded-full bg-gray-800"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 md:mt-10 text-center">
            <div className="inline-flex flex-wrap justify-center gap-4 md:gap-6 bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl px-4 py-2 md:px-6 md:py-3 shadow-sm">
              <div className="flex items-center gap-1.5 md:gap-2">
                <Shield className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                <span className="text-[11px] md:text-sm font-medium text-gray-700">100% Legal Compliance</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <ThumbsUp className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                <span className="text-[11px] md:text-sm font-medium text-gray-700">No Hidden Charges</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                <span className="text-[11px] md:text-sm font-medium text-gray-700">AI-Powered Matching</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Process */}
      <section className="py-4 md:py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Our Service Process"
            subtitle="Simple, transparent, and efficient workflow"
            badge="How We Work"
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            {serviceProcess.map((step, index) => (
              <div key={index} className="relative flex flex-col items-center text-center group">
                {index < serviceProcess.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-[calc(50%+24px)] w-[calc(100%-48px)] h-0.5 bg-gradient-to-r from-orange-200 to-transparent z-0" />
                )}
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#E6761D] to-[#F59E0B] rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base shadow-md group-hover:shadow-xl group-hover:scale-105 transition-all z-10 mb-2 md:mb-3">
                  {step.step}
                </div>
                <h3 className="text-xs md:text-sm font-bold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-gray-500 text-[10px] md:text-xs leading-relaxed px-1">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-4 md:py-6 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Client Success Stories"
            subtitle="What our clients say about our services"
            badge="Testimonials"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                name: 'Rajesh Kumar',
                service: 'Property Buying',
                text: 'ResaleExpert helped me find my dream home within my budget. Their AI matching is incredible!',
                rating: 5,
                location: 'Mumbai',
                image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200',
              },
              {
                name: 'Priya Sharma',
                service: 'Property Selling',
                text: 'Sold my property 20% above market rate with their expert marketing strategies.',
                rating: 5,
                location: 'Pune',
                image: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=200',
              },
              {
                name: 'Amit Patel',
                service: 'Home Loan',
                text: 'Got the best interest rate and quick approval. Saved ₹5L in total interest!',
                rating: 5,
                location: 'Delhi',
                image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=200',
              },
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-xl md:rounded-2xl p-3 md:p-5 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-0.5 md:space-x-1 mb-2 md:mb-3">
                  {Array.from({ length: 5 }, (_, j) => (
                    <Star key={j} size={12} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-3 md:mb-4 leading-relaxed italic text-xs md:text-sm">"{t.text}"</p>
                <div className="flex items-center space-x-2 md:space-x-3">
                  <img src={t.image} alt={t.name} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-gray-900 text-xs md:text-sm">{t.name}</div>
                    <div className="text-[10px] md:text-xs text-gray-500">{t.service} • {t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-4 md:py-6 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Transparent Pricing"
            subtitle="Choose the plan that works best for you"
            badge="Plans & Pricing"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Basic */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-blue-500 transition-all h-full flex flex-col">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">Free</div>
                <p className="text-gray-600">Perfect for first-time users</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['Property search & listings', 'Basic property details', 'Contact property owners', 'Basic market insights'].map((t, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <CheckCircle className="text-green-500" size={16} />
                    <span className="text-gray-700">{t}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleGetStarted({ id: 'basic-plan', title: 'Basic Plan' })}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all mt-auto"
              >
                Get Started
              </button>
            </div>

            {/* Premium */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-2xl p-8 transform scale-105 shadow-xl h-full flex flex-col">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Crown className="text-yellow-300" size={24} />
                  <h3 className="text-2xl font-bold">Premium</h3>
                </div>
                <div className="text-4xl font-bold mb-2">₹2,999</div>
                <p className="text-blue-100">Most popular choice</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['Everything in Basic', 'Expert consultation', 'Site visit assistance', 'Legal verification', 'Loan assistance'].map((t, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <CheckCircle className="text-green-300" size={16} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleGetStarted({ id: 'premium-plan', title: 'Premium Plan' })}
                className="w-full bg-white text-blue-600 py-3 px-6 rounded-xl font-semibold hover:bg-gray-100 transition-all mt-auto"
              >
                Choose Premium
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-purple-500 transition-all h-full flex flex-col">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-purple-600 mb-2">Custom</div>
                <p className="text-gray-600">For large portfolios</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['Everything in Premium', 'Dedicated relationship manager', 'Priority support', 'Custom solutions'].map((t, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <CheckCircle className="text-green-500" size={16} />
                    <span className="text-gray-700">{t}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleGetStarted({ id: 'enterprise-plan', title: 'Enterprise Plan' })}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-all mt-auto"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-4 md:py-6 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Frequently Asked Questions"
            subtitle="Get answers to common questions about our services"
            badge="FAQ"
          />

          <div className="max-w-3xl mx-auto space-y-2 md:space-y-3">
            {[
              {
                question: 'What makes ResaleExpert different from other platforms?',
                answer:
                  'We offer 100% verified properties, AI-powered matching, and end-to-end support with transparent pricing. Our expert team ensures a smooth experience from search to registration.',
              },
              {
                question: 'How do you verify properties?',
                answer:
                  'Our verification process includes legal document checks, physical property inspection, ownership verification, and compliance checks to ensure authenticity and legal clarity.',
              },
              {
                question: 'What are your fees for selling a property?',
                answer:
                  'We charge a transparent 2% commission only after successful sale. No hidden fees, no upfront charges. You pay only when we deliver results.',
              },
              {
                question: 'How long does it typically take to sell a property?',
                answer:
                  'On average, properties sell within 30-60 days with our marketing strategies. Premium locations and well-priced properties often sell faster.',
              },
              {
                question: 'Do you provide legal support?',
                answer:
                  'Yes, we have experienced legal partners who assist with documentation, title verification, registration, and ensure all transactions are legally compliant.',
              },
            ].map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-200">
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${index}`}
                    className="w-full flex items-center justify-between gap-3 p-3 md:p-5 text-left"
                  >
                    <h3 className="text-xs md:text-sm lg:text-base font-semibold text-gray-900">{faq.question}</h3>
                    <ChevronDown className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div
                    id={`faq-panel-${index}`}
                    role="region"
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-3 pb-3 md:px-5 md:pb-5 pt-0 text-gray-700 leading-relaxed text-xs md:text-sm">{faq.answer}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-4 md:py-6 text-white" style={{ background: 'linear-gradient(to right, #0b3856, #0c3854)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 md:mb-4">Ready to Get Started?</h2>
          <p className="text-sm md:text-base lg:text-lg text-blue-100 mb-4 md:mb-6 max-w-2xl mx-auto px-2">
            Let our experts help you with your real estate needs. Get a free consultation today!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 md:space-x-6">
            <button
              onClick={() => setShowQuickContact(true)}
              className="w-full sm:w-auto bg-[#E6761D] hover:bg-[#CC6A1A] text-white px-5 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base"
            >
              Get Free Consultation
            </button>
            <button className="w-full sm:w-auto bg-transparent hover:bg-white/10 border-2 border-white text-white px-5 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl font-semibold transition-all duration-300 text-sm md:text-base">
              Call Now: {phonePretty}
            </button>
          </div>
        </div>

        <ContactQuickModal
          open={showQuickContact}
          onClose={() => setShowQuickContact(false)}
          phoneE164={phoneE164}
          displayPhone={phonePretty}
          title={
            selectedService
              ? `Talk to an Expert — ${selectedService.title}`
              : 'Talk to an Expert'
          }
          presetMessage={
            selectedService
              ? `Hi team, I'm interested in "${selectedService.title}". Please guide me.`
              : "Hi team, I'm interested in your services. Please guide me."
          }
        />
      </section>
    </div>
  );
};

export default ServicesPage;