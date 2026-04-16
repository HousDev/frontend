import React from 'react';
import { 
  Shield, Lock, Eye, FileText, Users, Share2, Mail, Phone, MapPin, 
  Globe, CheckCircle, AlertCircle, Calendar, Database, MessageCircle, 
  Cookie, Trash2, ExternalLink, Edit, Clock, Building, 
  Home, ArrowLeft, Info, Server, Smartphone, Link as LinkIcon, ShieldCheck,
  FileCheck, UserCheck, Scale, AlertTriangle, Download, Baby
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
// Theme Colors
const N = "#0f2b3d";
const O = "#e67e22";
const BG = "#f8fafc";
const BD = "#e2e8f0";
const MU = "#5a7184";

const PrivacyPolicy = () => {
     const handleBackToWebsite = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen" style={{ background: BG }}>
      {/* Hero Banner */}
      <div className="relative overflow-hidden" style={{ background: N }}>
        {/* <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-white" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white" />
        </div> */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          {/* Back to Website Button */}
          <button
onClick={handleBackToWebsite}  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/80 hover:text-white transition-all mb-4 text-xs sm:text-sm"
  style={{ background: `${O}20` }}
>
  <ArrowLeft size={14} />
  <span>Back to Website</span>
</button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl" style={{ background: `${O}20` }}>
              <Shield size={22}  style={{ color: O }} />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Privacy Policy</h1>
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
                { id: 'scope', label: 'Scope', icon: Globe },
                { id: 'nature', label: 'Services', icon: Building },
                { id: 'collect', label: 'Info Collection', icon: Database },
                { id: 'why', label: 'Why Collect', icon: HelpCircle },
                { id: 'use', label: 'How We Use', icon: Eye },
                { id: 'sharing', label: 'Sharing', icon: Share2 },
                { id: 'thirdparty', label: 'Third-Party', icon: Link },
                { id: 'cookies', label: 'Cookies', icon: Cookie },
                { id: 'security', label: 'Security', icon: Lock },
                { id: 'retention', label: 'Retention', icon: Clock },
                { id: 'rights', label: 'Your Rights', icon: Users },
                { id: 'deletion', label: 'Deletion', icon: Trash2 },
                { id: 'children', label: 'Children', icon: Users },
                { id: 'legal', label: 'Legal', icon: Scale },
                { id: 'changes', label: 'Changes', icon: Edit },
                { id: 'contact', label: 'Contact', icon: Mail },
                { id: 'consent', label: 'Consent', icon: CheckCircle },
              ].map((item:any) => (
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
                    { id: 'scope', label: '2. Scope and Applicability', icon: Globe },
                    { id: 'nature', label: '3. Nature of Our Services', icon: Building },
                    { id: 'collect', label: '4. Information We Collect', icon: Database },
                    { id: 'why', label: '5. Why We Collect', icon: HelpCircle },
                    { id: 'use', label: '6. How We Use', icon: Eye },
                    { id: 'sharing', label: '7. Information Sharing', icon: Share2 },
                    { id: 'thirdparty', label: '8. Third-Party Platforms', icon: Link },
                    { id: 'cookies', label: '9. Cookies & Tracking', icon: Cookie },
                    { id: 'security', label: '10. Data Security', icon: Lock },
                    { id: 'retention', label: '11. Data Retention', icon: Clock },
                    { id: 'rights', label: '12. Your Rights', icon: Users },
                    { id: 'deletion', label: '13. Data Deletion', icon: Trash2 },
                    { id: 'thirdpartylinks', label: '14. Third-Party Links', icon: ExternalLink },
                    { id: 'children', label: '15. Children’s Privacy', icon: Baby },
                    { id: 'legal', label: '16. Legal Compliance', icon: Scale },
                    { id: 'changes', label: '17. Changes to Policy', icon: Edit },
                    { id: 'contact', label: '18. Contact & Grievance', icon: Mail },
                    { id: 'consent', label: '19. Consent', icon: CheckCircle },
                  ].map((item:any) => (
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
                  Have questions about our privacy practices?
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
                  Welcome to Resale Expert (<span className="text-blue-600">https://resaleexpert.in</span>), a real estate services platform owned and operated by <span className="font-semibold" style={{ color: N }}>Hously Finntech Realty</span>, a company engaged in providing real estate consultancy, resale property solutions, financial assistance, and related services.
                </p>
                <p className="text-[13px] leading-relaxed mt-3" style={{ color: MU }}>
                  At Hously Finntech Realty, we understand that your privacy is important. This Privacy Policy is designed to provide complete transparency regarding how we collect, use, store, process, and share your information when you interact with our platform, services, and communication channels.
                </p>
                <p className="text-[13px] leading-relaxed mt-3" style={{ color: MU }}>
                  By accessing or using Resale Expert, you agree to the terms of this Privacy Policy. If you do not agree, you are advised not to use our services.
                </p>
              </div>
            </div>

            {/* 2. Scope and Applicability */}
            <div id="scope" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Globe size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>2. Scope and Applicability</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  This Privacy Policy applies to all users who access or use:
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    'Our website (resaleexpert.in)',
                    'CRM systems and internal platforms',
                    'Lead generation systems',
                    'WhatsApp, Facebook, Instagram communication',
                    'Digital marketing campaigns and landing pages'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <CheckCircle size={12} style={{ color: O }} className="mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[12px] mt-3" style={{ color: MU }}>
                  This policy applies regardless of how you access our services (mobile, desktop, or third-party platforms).
                </p>
              </div>
            </div>

            {/* 3. Nature of Our Services */}
            <div id="nature" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Building size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>3. Nature of Our Services</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  Resale Expert is a real estate service platform that connects:
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    'Property buyers',
                    'Property sellers',
                    'Tenants and landlords',
                    'Financial institutions (for loans)',
                    'Legal and documentation service providers'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <CheckCircle size={12} style={{ color: O }} className="mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[12px] mt-3" style={{ color: MU }}>
                  To provide these services effectively, we collect and process certain user information, which is explained in this policy.
                </p>
              </div>
            </div>

            {/* 4. Information We Collect */}
            <div id="collect" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Database size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>4. Information We Collect</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] font-semibold mb-2" style={{ color: N }}>4.1 Information You Provide Voluntarily</p>
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  When you fill forms, register, or interact with us, we may collect:
                </p>
                <ul className="mt-2 space-y-1">
                  {['Your name', 'Phone number', 'Email address', 'Property preferences (buy/sell/rent)', 'Budget, location, property type', 'Any additional details you choose to provide'].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <CheckCircle size={10} style={{ color: O }} className="mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                
                <p className="text-[13px] font-semibold mt-3 mb-2" style={{ color: N }}>4.2 Information Collected Automatically</p>
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  When you visit our website or interact with our platform, we may automatically collect:
                </p>
                <ul className="mt-2 space-y-1">
                  {['IP address', 'Browser type and device information', 'Pages visited and time spent', 'Search behavior and preferences', 'Location data (if enabled)'].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <CheckCircle size={10} style={{ color: O }} className="mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-[13px] font-semibold mt-3 mb-2" style={{ color: N }}>4.3 Communication Data</p>
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  When you communicate with us, we may record:
                </p>
                <ul className="mt-2 space-y-1">
                  {['Phone call interactions', 'WhatsApp messages', 'Emails and SMS', 'CRM remarks and follow-up notes'].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <CheckCircle size={10} style={{ color: O }} className="mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <p className="text-[13px] font-semibold mt-3 mb-2" style={{ color: N }}>4.4 Information from Third Parties</p>
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  We may receive your data from:
                </p>
                <ul className="mt-2 space-y-1">
                  {['Advertising platforms (Facebook Ads, Google Ads)', 'Referral partners', 'Lead generation campaigns'].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <CheckCircle size={10} style={{ color: O }} className="mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[12px] mt-2" style={{ color: MU }}>
                  Such data is treated with the same level of protection as direct data.
                </p>
              </div>
            </div>

            {/* 5. Why We Collect Your Information */}
            <div id="why" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <HelpCircle size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>5. Why We Collect Your Information</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  We collect your information to provide a seamless and efficient real estate experience.
                  This includes:
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    'Understanding your property requirements',
                    'Connecting you with relevant buyers/sellers',
                    'Providing loan and financial assistance',
                    'Coordinating legal and documentation support',
                    'Sending property recommendations and updates',
                    'Improving our services and platform'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <CheckCircle size={12} style={{ color: O }} className="mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[12px] mt-3" style={{ color: MU }}>
                  Our goal is to create a smooth and effective property transaction journey.
                </p>
              </div>
            </div>

            {/* 6. How We Use Your Information */}
            <div id="use" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Eye size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>6. How We Use Your Information</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  Your information is used for:
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    'Service delivery and consultation',
                    'Lead matching and sharing',
                    'Customer support and communication',
                    'Marketing and promotional campaigns (with consent)',
                    'Internal analytics and performance tracking',
                    'CRM management and follow-up tracking'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <CheckCircle size={12} style={{ color: O }} className="mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[12px] mt-3" style={{ color: MU }}>
                  We ensure that all usage is relevant and necessary for our services.
                </p>
              </div>
            </div>

            {/* 7. Information Sharing and Disclosure */}
            <div id="sharing" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Share2 size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>7. Information Sharing and Disclosure</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  <span className="font-semibold" style={{ color: N }}>We value your trust and do not sell your personal data.</span>
                </p>
                <p className="text-[13px] leading-relaxed mt-3" style={{ color: MU }}>
                  However, to provide our services, we may share your information with:
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    'Property owners or buyers',
                    'Banking and financial institutions',
                    'Legal and documentation partners',
                    'Internal teams and service providers'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <CheckCircle size={12} style={{ color: O }} className="mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[12px] mt-3" style={{ color: MU }}>
                  This sharing is strictly limited to service-related purposes.
                </p>
              </div>
            </div>

            {/* 8. Third-Party Platforms and Integrations */}
            <div id="thirdparty" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <LinkIcon size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>8. Third-Party Platforms and Integrations</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  We use third-party platforms such as:
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    'WhatsApp Business API',
                    'Facebook and Instagram',
                    'Google services'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <AlertCircle size={12} style={{ color: O }} className="mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[12px] mt-3" style={{ color: MU }}>
                  When you interact with us through these platforms:
                </p>
                <ul className="mt-2 space-y-1">
                  {[
                    'Your data may be processed by these platforms',
                    'Their privacy policies will apply',
                    'We do not control their data handling practices'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[11px]" style={{ color: MU }}>
                      <CheckCircle size={10} style={{ color: O }} className="mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 9. Cookies and Tracking Technologies */}
            <div id="cookies" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Cookie size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>9. Cookies and Tracking Technologies</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  We use cookies and similar technologies to:
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    'Enhance user experience',
                    'Track website performance',
                    'Understand user behavior',
                    'Deliver relevant advertisements'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <CheckCircle size={12} style={{ color: O }} className="mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[12px] mt-3" style={{ color: MU }}>
                  Users can disable cookies through browser settings.
                </p>
              </div>
            </div>

            {/* 10. Data Security */}
            <div id="security" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Lock size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>10. Data Security</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  We implement appropriate security measures including:
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    'Secure servers',
                    'Access control systems',
                    'Data encryption (where applicable)'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <CheckCircle size={12} style={{ color: O }} className="mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[12px] mt-3" style={{ color: MU }}>
                  Despite our efforts, no system can guarantee complete security.
                </p>
              </div>
            </div>

            {/* 11. Data Retention */}
            <div id="retention" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Clock size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>11. Data Retention</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  We retain your data only for as long as necessary to:
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    'Provide services',
                    'Meet legal obligations',
                    'Resolve disputes'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <CheckCircle size={12} style={{ color: O }} className="mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[12px] mt-3" style={{ color: MU }}>
                  After this, data is deleted or anonymized.
                </p>
              </div>
            </div>

            {/* 12. Your Rights */}
            <div id="rights" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Users size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>12. Your Rights</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  You have the right to:
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    'Access your data',
                    'Correct your data',
                    'Request deletion',
                    'Withdraw consent'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <CheckCircle size={12} style={{ color: O }} className="mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[12px] mt-3" style={{ color: MU }}>
                  To exercise your rights, contact: <span className="font-semibold" style={{ color: O }}>support@resaleexpert.in</span>
                </p>
              </div>
            </div>

            {/* 13. Data Deletion Requests */}
            <div id="deletion" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Trash2 size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>13. Data Deletion Requests</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  You may request deletion by emailing: <span className="font-semibold" style={{ color: O }}>support@resaleexpert.in</span>
                </p>
                <p className="text-[12px] mt-2" style={{ color: MU }}>
                  We process such requests within 7 working days, subject to legal requirements.
                </p>
              </div>
            </div>

            {/* 14. Third-Party Links */}
            <div id="thirdpartylinks" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <ExternalLink size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>14. Third-Party Links</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  Our website may contain links to external websites.
                  We are not responsible for their privacy practices.
                </p>
              </div>
            </div>

            {/* 15. Children's Privacy */}
            <div id="children" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Users size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>15. Children's Privacy</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  Our services are not intended for individuals under 18 years of age.
                </p>
              </div>
            </div>

            {/* 16. Legal Compliance */}
            <div id="legal" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Scale size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>16. Legal Compliance</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  We comply with applicable Indian laws including:
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    'Information Technology Act, 2000',
                    'Digital Personal Data Protection Act, 2023'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-[12px]" style={{ color: MU }}>
                      <CheckCircle size={12} style={{ color: O }} className="mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[12px] mt-3" style={{ color: MU }}>
                  We may disclose data if required by law.
                </p>
              </div>
            </div>

            {/* 17. Changes to This Policy */}
            <div id="changes" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Edit size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>17. Changes to This Policy</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  We may update this Privacy Policy periodically.
                  Users are encouraged to review this page regularly.
                </p>
              </div>
            </div>

            {/* 18. Contact and Grievance */}
            <div id="contact" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <Mail size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>18. Contact and Grievance</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  For any concerns:
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
                    <span>Platform: Resale Expert</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 19. Consent */}
            <div id="consent" className="bg-white rounded-xl border overflow-hidden scroll-mt-20" style={{ borderColor: BD }}>
              <div className="px-4 py-3 border-b" style={{ background: `${N}05`, borderColor: BD }}>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} style={{ color: O }} />
                  <h2 className="text-sm font-semibold" style={{ color: N }}>19. Consent</h2>
                </div>
              </div>
              <div className="p-4">
                <p className="text-[13px] leading-relaxed" style={{ color: MU }}>
                  By using our platform, you confirm that you have read, understood, and agreed to this Privacy Policy.
                </p>
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

// HelpCircle component since it was missing
const HelpCircle = ({ size = 16, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

export default PrivacyPolicy;