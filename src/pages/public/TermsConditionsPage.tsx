import React from 'react';
import { 
  Shield, Lock, Eye, FileText, Users, Share2, Mail, Phone, MapPin, 
  Globe, CheckCircle, AlertCircle, Calendar, Database, MessageCircle, 
  Cookie, Trash2, ExternalLink, Edit, Clock, Building, 
  Home, ArrowLeft, Info, Server, Smartphone, Link as LinkIcon, ShieldCheck,
  FileCheck, UserCheck, Scale, AlertTriangle, Download, Baby, 
  Briefcase, Banknote, Handshake, AlertOctagon, BookOpen
} from 'lucide-react';

// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

const TermsConditions = () => {
  const handleBackToWebsite = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      {/* Hero Banner */}
      <div className="relative overflow-hidden z-10" style={{ background: N }}>
        {/* <div className="absolute inset-0 opacity-5 z-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-white z-10" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white z-10" />
        </div> */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 z-20">
          {/* Back to Website Button */}
          <button
            onClick={handleBackToWebsite}
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/80 hover:text-white transition-all mb-4 text-xs sm:text-sm z-50"
            style={{ background: `${O}20` }}
          >
            <ArrowLeft size={14} />
            <span>Back to Website</span>
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl" style={{ background: `${O}20` }}>
              <FileText size={22}  style={{ color: O }} />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Terms and Conditions</h1>
          </div>
          <p className="text-white/70 text-xs sm:text-sm max-w-2xl">
            Resale Expert (A Platform by Hously Finntech Realty)
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-white/50 text-[10px] sm:text-xs">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>Effective Date: 24 June 2023</span>
            </div>
            <div className="flex items-center gap-1">
              <Edit size={12} />
              <span>Last Updated: 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar Navigation - Mobile (Horizontal Scroll) */}
          <div className="lg:hidden overflow-x-auto pb-2 -mx-4 px-4">
            <div className="flex gap-2 min-w-max">
              {[
                { id: 'intro', label: 'Introduction', icon: Info },
                { id: 'nature', label: 'Services', icon: Building },
                { id: 'eligibility', label: 'Eligibility', icon: UserCheck },
                { id: 'account', label: 'Account', icon: Users },
                { id: 'use', label: 'Use of Platform', icon: Globe },
                { id: 'listings', label: 'Listings', icon: Home },
                { id: 'lead', label: 'Lead Generation', icon: MessageCircle },
                { id: 'financial', label: 'Financial', icon: Banknote },
                { id: 'fees', label: 'Fees', icon: Briefcase },
                { id: 'thirdparty', label: 'Third-Party', icon: LinkIcon },
                { id: 'intellectual', label: 'IP', icon: Shield },
                { id: 'liability', label: 'Liability', icon: AlertTriangle },
                { id: 'indemnification', label: 'Indemnification', icon: Handshake },
                { id: 'privacy', label: 'Privacy', icon: Lock },
                { id: 'termination', label: 'Termination', icon: Trash2 },
                { id: 'changes', label: 'Changes', icon: Edit },
                { id: 'law', label: 'Governing Law', icon: Scale },
                { id: 'force', label: 'Force Majeure', icon: AlertOctagon },
                { id: 'contact', label: 'Contact', icon: Mail },
                { id: 'consent', label: 'Consent', icon: CheckCircle },
              ].map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] whitespace-nowrap transition-all"
                  style={{ background: BG, border: `1px solid ${BD}`, color: MU }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = O; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = BG; e.currentTarget.style.color = MU; }}
                >
                  <item.icon size={10} />
                  <span>{item.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Sidebar Navigation - Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* Navigation Card */}
              <div className="bg-white rounded-xl border p-4" style={{ borderColor: BD }}>
                <h3 className="text-xs font-semibold mb-3 pb-2 border-b" style={{ color: N, borderColor: BD }}>
                  On this page
                </h3>
                <nav className="space-y-1 max-h-[70vh] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                  {[
                    { id: 'intro', label: '1. Introduction', icon: Info },
                    { id: 'nature', label: '2. Nature of Services', icon: Building },
                    { id: 'eligibility', label: '3. User Eligibility', icon: UserCheck },
                    { id: 'account', label: '4. User Account', icon: Users },
                    { id: 'use', label: '5. Use of Platform', icon: Globe },
                    { id: 'listings', label: '6. Property Listings', icon: Home },
                    { id: 'lead', label: '7. Lead Generation', icon: MessageCircle },
                    { id: 'financial', label: '8. Financial Services', icon: Banknote },
                    { id: 'fees', label: '9. Fees and Charges', icon: Briefcase },
                    { id: 'thirdparty', label: '10. Third-Party Services', icon: LinkIcon },
                    { id: 'intellectual', label: '11. Intellectual Property', icon: Shield },
                    { id: 'liability', label: '12. Limitation of Liability', icon: AlertTriangle },
                    { id: 'indemnification', label: '13. Indemnification', icon: Handshake },
                    { id: 'privacy', label: '14. Data Privacy', icon: Lock },
                    { id: 'termination', label: '15. Termination of Access', icon: Trash2 },
                    { id: 'changes', label: '16. Changes to Terms', icon: Edit },
                    { id: 'law', label: '17. Governing Law', icon: Scale },
                    { id: 'force', label: '18. Force Majeure', icon: AlertOctagon },
                    { id: 'contact', label: '19. Grievance & Contact', icon: Mail },
                    { id: 'consent', label: '20. User Consent', icon: CheckCircle },
                  ].map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] transition-all hover:translate-x-0.5"
                      style={{ color: MU }}
                      onMouseEnter={(e) => e.currentTarget.style.color = O}
                      onMouseLeave={(e) => e.currentTarget.style.color = MU}
                    >
                      <item.icon size={12} style={{ color: O }} />
                      <span>{item.label}</span>
                    </a>
                  ))}
                </nav>
              </div>

              {/* Contact Card */}
              <div className="bg-white rounded-xl border p-4" style={{ borderColor: BD }}>
                <h3 className="text-xs font-semibold mb-3" style={{ color: N }}>Need Help?</h3>
                <p className="text-[10px] mb-3" style={{ color: MU }}>
                  Have questions about our terms?
                </p>
                <a 
                  href="mailto:support@resaleexpert.in"
                  className="w-full px-3 py-2 rounded-lg text-[10px] font-medium text-white text-center block transition-all hover:opacity-90"
                  style={{ background: O }}
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* 1. Introduction */}
            <div id="intro" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Info size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>1. Introduction</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  Welcome to Resale Expert (<span className="text-blue-600">https://resaleexpert.in</span>), a real estate services platform owned and operated by <span className="font-semibold" style={{ color: N }}>Hously Finntech Realty</span> (“Company”, “we”, “our”, “us”).
                </p>
                <p className="text-[13px] leading-relaxed mt-3" style={{ color: MU }}>
                  These Terms and Conditions (“Terms”) govern your access to and use of our platform, services, and communication channels.
                </p>
                <p className="text-[13px] leading-relaxed mt-3" style={{ color: MU }}>
                  By accessing or using our platform, you agree to be bound by these Terms. If you do not agree, you should not use our services.
                </p>
              </div>
            </div>

            {/* 2. Nature of Services */}
            <div id="nature" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Building size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>2. Nature of Services</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  Resale Expert is a real estate facilitation platform that:
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    'Connects buyers, sellers, landlords, and tenants',
                    'Provides resale property consultancy',
                    'Assists in home loans and financial services',
                    'Supports legal and documentation processes',
                    'Offers marketing and lead generation services'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <CheckCircle size={12} style={{ color: O }} className="mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[12px] mt-3" style={{ color: MU }}>
                  We act as an intermediary service provider and do not own properties listed or guarantee transactions.
                </p>
              </div>
            </div>

            {/* 3. User Eligibility */}
            <div id="eligibility" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <UserCheck size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>3. User Eligibility</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  By using our platform, you confirm that:
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    'You are at least 18 years of age',
                    'You are legally capable of entering into agreements',
                    'All information provided by you is accurate and complete'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <CheckCircle size={12} style={{ color: O }} className="mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 4. User Account & Information */}
            <div id="account" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Users size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>4. User Account & Information</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  When you submit your details:
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    'You agree to provide true and accurate information',
                    'You are responsible for maintaining confidentiality of your data',
                    'You agree not to provide false, misleading, or fraudulent information',
                    'We reserve the right to suspend or terminate access for incorrect or suspicious data'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <AlertCircle size={12} style={{ color: O }} className="mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 5. Use of Platform */}
            <div id="use" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Globe size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>5. Use of Platform</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  You agree to use the platform only for lawful purposes.
                  You shall NOT:
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    'Post false or misleading property information',
                    'Use the platform for illegal activities',
                    'Harass, abuse, or mislead other users',
                    'Attempt to hack, disrupt, or misuse the system'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <AlertCircle size={12} style={{ color: O }} className="mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 6. Property Listings & Information */}
            <div id="listings" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Home size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>6. Property Listings & Information</h2>
                </div>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {[
                    'Property details are provided by users, owners, or partners',
                    'We do not guarantee accuracy, completeness, or legality',
                    'Users are advised to independently verify all information',
                    'We are not responsible for any disputes arising from property transactions'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <AlertCircle size={12} style={{ color: O }} className="mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 7. Lead Generation & Sharing */}
            <div id="lead" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <MessageCircle size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>7. Lead Generation & Sharing</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  By submitting your details:
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    'You agree to be contacted by our team',
                    'Your information may be shared with relevant buyers/sellers',
                    'You consent to calls, WhatsApp, SMS, and emails'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <CheckCircle size={12} style={{ color: O }} className="mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[12px] mt-3" style={{ color: MU }}>
                  This is essential for providing our services.
                </p>
              </div>
            </div>

            {/* 8. Financial & Loan Services */}
            <div id="financial" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Banknote size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>8. Financial & Loan Services</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  If you opt for loan assistance:
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    'Your details may be shared with banks/NBFCs',
                    'Loan approval depends on third-party institutions',
                    'We do not guarantee loan approval or terms'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <AlertCircle size={12} style={{ color: O }} className="mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 9. Fees and Charges */}
            <div id="fees" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Briefcase size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>9. Fees and Charges</h2>
                </div>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {[
                    'Some services may be free',
                    'Certain services may involve brokerage or service fees',
                    'Charges will be communicated clearly before service',
                    'We reserve the right to modify pricing at any time'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <CheckCircle size={12} style={{ color: O }} className="mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 10. Third-Party Services */}
            <div id="thirdparty" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <LinkIcon size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>10. Third-Party Services</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  We may integrate with third-party services such as:
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    'Banks and financial institutions',
                    'Legal service providers',
                    'Marketing and CRM tools',
                    'Meta (WhatsApp, Facebook, Instagram)'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <AlertCircle size={12} style={{ color: O }} className="mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[12px] mt-3" style={{ color: MU }}>
                  We are not responsible for third-party actions or policies.
                </p>
              </div>
            </div>

            {/* 11. Intellectual Property */}
            <div id="intellectual" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Shield size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>11. Intellectual Property</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  All content on the platform, including:
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    'Logo',
                    'Brand name',
                    'Design',
                    'Content'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <ShieldCheck size={12} style={{ color: O }} className="mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[12px] mt-3" style={{ color: MU }}>
                  is owned by Hously Finntech Realty.
                  Unauthorized use, copying, or reproduction is strictly prohibited.
                </p>
              </div>
            </div>

            {/* 12. Limitation of Liability */}
            <div id="liability" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>12. Limitation of Liability</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  We are not liable for:
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    'Any property disputes',
                    'Financial losses or transaction failures',
                    'Incorrect property information',
                    'Third-party actions',
                    'Technical issues or downtime'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <AlertCircle size={12} style={{ color: O }} className="mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[12px] mt-3" style={{ color: MU }}>
                  Use of our platform is at your own risk.
                </p>
              </div>
            </div>

            {/* 13. Indemnification */}
            <div id="indemnification" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Handshake size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>13. Indemnification</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  You agree to indemnify and hold harmless Hously Finntech Realty and Resale Expert from any claims, damages, or losses arising from:
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    'Your misuse of the platform',
                    'Violation of these Terms',
                    'False information provided by you'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <AlertCircle size={12} style={{ color: O }} className="mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 14. Data Privacy */}
            <div id="privacy" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Lock size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>14. Data Privacy</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  Your use of the platform is also governed by our Privacy Policy.
                </p>
                <a 
                  href="/privacy-policy" 
                  className="inline-flex items-center gap-1 mt-2 text-[11px] font-medium hover:underline"
                  style={{ color: O }}
                >
                  👉 Please review: Privacy Policy
                </a>
              </div>
            </div>

            {/* 15. Termination of Access */}
            <div id="termination" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Trash2 size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>15. Termination of Access</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  We reserve the right to:
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    'Suspend or terminate user access',
                    'Remove listings or data',
                    'Restrict services'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <AlertCircle size={12} style={{ color: O }} className="mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[12px] mt-3" style={{ color: MU }}>
                  without prior notice if Terms are violated.
                </p>
              </div>
            </div>

            {/* 16. Changes to Terms */}
            <div id="changes" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Edit size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>16. Changes to Terms</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  We may update these Terms from time to time.
                  Changes will be posted on this page. Continued use of the platform implies acceptance.
                </p>
              </div>
            </div>

            {/* 17. Governing Law */}
            <div id="law" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Scale size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>17. Governing Law</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  These Terms shall be governed by the laws of India.
                  Any disputes shall be subject to jurisdiction of courts in:
                </p>
                <p className="text-[12px] font-semibold mt-2" style={{ color: O }}>👉 Pune, Maharashtra</p>
              </div>
            </div>

            {/* 18. Force Majeure */}
            <div id="force" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <AlertOctagon size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>18. Force Majeure</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  We are not liable for delays or failures caused by events beyond our control, including:
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    'Natural disasters',
                    'Government actions',
                    'Technical failures',
                    'Network disruptions'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <AlertCircle size={12} style={{ color: O }} className="mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 19. Grievance & Contact */}
            <div id="contact" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Mail size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>19. Grievance & Contact</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  For any queries or concerns:
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-[12px]" style={{ color: MU }}>
                    <Mail size={14} style={{ color: O }} />
                    <span>support@resaleexpert.in</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px]" style={{ color: MU }}>
                    <Phone size={14} style={{ color: O }} />
                    <span>+91 9637009639</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px]" style={{ color: MU }}>
                    <Building size={14} style={{ color: O }} />
                    <span>Company: Hously Finntech Realty</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px]" style={{ color: MU }}>
                    <Globe size={14} style={{ color: O }} />
                    <span>Platform: Resale Expert (resaleexpert.in)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 20. User Consent */}
            <div id="consent" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>20. User Consent</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  By using Resale Expert, you:
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    'Agree to these Terms & Conditions',
                    'Confirm that you understand your rights and obligations',
                    'Accept our policies and service structure'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <CheckCircle size={12} style={{ color: O }} className="mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="border-t mt-6" style={{ borderColor: BD, background: BG }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-[9px] sm:text-[10px] text-center" style={{ color: MU }}>
            © {new Date().getFullYear()} Resale Expert (A Platform by Hously Finntech Realty). All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;