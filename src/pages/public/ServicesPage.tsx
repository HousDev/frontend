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

const ServicesPage = () => {
  const [showQuickContact, setShowQuickContact] = React.useState(false);
  const [selectedService, setSelectedService] =
    React.useState<{ id: string; title: string } | null>(null);

  const phonePretty = "+91 9637 00 9639";
  const phoneE164 = "+919637009639";

  const coreServices = [
    {
      id: 'property-buying',
      title: 'Property Buying',
      subtitle: 'Find Your Dream Home',
      description:
        'Comprehensive assistance in finding and purchasing your perfect property with expert guidance and verified listings.',
      icon: Home,
      color: 'blue' as ServiceColor,
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
      color: 'green' as ServiceColor,
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
      color: 'purple' as ServiceColor,
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
      color: 'orange' as ServiceColor,
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
      color: 'indigo' as ServiceColor,
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
      color: 'pink' as ServiceColor,
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
    { title: '12+ Years Experience', description: 'Decades of expertise in real estate', icon: Award, stat: '12+' },
    { title: 'Verified Properties', description: '100% legal and verified listings', icon: Shield, stat: '100%' },
    { title: 'Expert Team', description: 'Certified real estate professionals', icon: Users, stat: '50+' },
    { title: 'Customer Satisfaction', description: 'Happy customers across India', icon: Star, stat: '98%' },
  ];

  const serviceProcess = [
    { step: '1', title: 'Consultation', description: 'Free consultation to understand your requirements' },
    { step: '2', title: 'Planning', description: 'Detailed planning and strategy development' },
    { step: '3', title: 'Execution', description: 'Professional execution with regular updates' },
    { step: '4', title: 'Completion', description: 'Successful completion with post-service support' },
  ];

  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  const toggle = (idx: number) => setOpenIndex(prev => (prev === idx ? null : idx));

  const { systemSettings } = useSystemSettings();
  const companyName = systemSettings?.company_name;

  const handleGetStarted = (svc: { id: string; title: string }) => {
    setSelectedService({ id: svc.id, title: svc.title });
    setShowQuickContact(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="text-white py-32 pt-28" style={{ background: 'linear-gradient(to right, #0b3856, #0c3854)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-3 text-white">Complete Real Estate Solutions</h2>
            <p className="text-lg mb-4 text-blue-100 max-w-4xl mx-auto leading-relaxed">
              From property search to final registration, we provide end-to-end real estate services with expert guidance and transparent pricing
            </p>
            <div className="mt-4 flex justify-center">
              <button
                className="inline-flex items-center justify-center
               w-full max-w-[240px] sm:max-w-none sm:w-auto
               px-4 sm:px-5 py-2 sm:py-2
               text-[13px] sm:text-base
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
        </div>
      </section>

      {/* Core Services */}
      <section className="py-3 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Core Services</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">Comprehensive real estate solutions tailored to your specific needs</p>
          </div>

          {/* items-stretch + h-full on each card + flex-col ensures equal height & bottom-aligned buttons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {coreServices.map((service) => {
              const Icon = service.icon;
              const cm = colorMap[service.color];
              const isPink = service.id === 'investment-advisory';

              return (
                <div key={service.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all group h-full flex flex-col p-8">
                  {/* CONTENT WRAPPER → grows to fill height */}
                  <div className="flex-1">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className={`p-4 rounded-2xl group-hover:shadow-lg transition-all ${cm.bg}`}>
                        <Icon className="text-white" size={22} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                        <p className={`${cm.text} font-semibold mb-3`}>{service.subtitle}</p>
                        <p className="text-gray-700 leading-relaxed">{service.description}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Key Features</h4>
                        <ul className="space-y-2">
                          {service.features.map((feature, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <CheckCircle className={`${cm.text}`} size={16} />
                              <span className="text-gray-700 text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Process Steps</h4>
                        <ol className="space-y-2">
                          {service.process.map((step, index) => (
                            <li key={index} className="flex items-center space-x-3">
                              <div className={`w-6 h-6 ${cm.dotBg} ${cm.dotText} rounded-full flex items-center justify-center text-xs font-bold`}>
                                {index + 1}
                              </div>
                              <span className="text-gray-700 text-sm">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className={`text-center p-3 ${cm.lite} rounded-lg`}>
                        <div className={`text-lg font-bold ${cm.text}`}>{service.price}</div>
                        <div className="text-xs text-gray-600">Pricing</div>
                      </div>
                      <div className={`text-center p-3 ${cm.lite} rounded-lg`}>
                        <div className={`text-lg font-bold ${cm.text}`}>{service.duration}</div>
                        <div className="text-xs text-gray-600">Duration</div>
                      </div>
                      <div className={`text-center p-3 ${cm.lite} rounded-lg`}>
                        <div className={`text-lg font-bold ${cm.text}`}>{service.successRate}</div>
                        <div className="text-xs text-gray-600">Success Rate</div>
                      </div>
                    </div>
                  </div>

                  {/* BUTTON → stays at bottom */}
                  <button
                    className={`w-full mt-6 py-3 px-6 rounded-xl font-semibold transition-all group-hover:shadow-lg ${isPink ? 'bg-pink-500 text-white hover:bg-pink-600' : `${cm.bg} text-white ${cm.hover}`}`}
                    onClick={() => handleGetStarted({ id: service.id, title: service.title })}
                  >
                    Get Started
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-3 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Additional Services</h2>
            <p className="text-lg text-gray-600">Specialized services to enhance your property experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            {additionalServices.map((service, index) => {
              const Icon = service.icon;
              const id = service.title.toLowerCase().replace(/\s+/g, '-');
              return (
                <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all group text-center h-full flex flex-col">
                  <div className="bg-gradient-to-r from-gray-100 to-gray-200 w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-blue-100 group-hover:to-purple-100 transition-all">
                    <Icon className="text-gray-600 group-hover:text-blue-600" size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  <div className="text-blue-600 font-bold mb-4">{service.price}</div>

                  <div className="mt-auto">
                    <button
                      onClick={() => handleGetStarted({ id, title: service.title })}
                      className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all"
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
      <section className="py-3  bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose&nbsp;{companyName}?</h2>
            <p className="text-lg text-gray-600">Excellence backed by experience and innovation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="bg-white w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                    <Icon className="text-blue-600" size={20} />
                  </div>
                  <div className="text-xl font-bold text-gray-800 mb-2">{reason.stat}</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{reason.title}</h3>
                  <p className="text-gray-600">{reason.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Process */}
      <section className="py-3 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Service Process</h2>
            <p className="text-lg text-gray-600">Simple, transparent, and efficient workflow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {serviceProcess.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-2">
                  <div className="w-10 h-10 bg-[#E6761D] rounded-full flex items-center justify-center mx-auto text-white font-bold text-xl group-hover:shadow-lg transition-all">
                    {step.step}
                  </div>
                  {index < serviceProcess.length - 1 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-300 -translate-x-1/2"></div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-3 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Client Success Stories</h2>
            <p className="text-lg text-gray-600">What our clients say about our services</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: 'Rajesh Kumar',
                service: 'Property Buying',
                text: 'ResaleExpert helped me find my dream home within my budget. Their AI matching is incredible!',
                rating: 5,
                location: 'Mumbai',
                image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200'
              },
              {
                name: 'Priya Sharma',
                service: 'Property Selling',
                text: 'Sold my property 20% above market rate with their expert marketing strategies.',
                rating: 5,
                location: 'Pune',
                image: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=200'
              },
              {
                name: 'Amit Patel',
                service: 'Home Loan',
                text: 'Got the best interest rate and quick approval. Saved ₹5L in total interest!',
                rating: 5,
                location: 'Delhi',
                image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=200'
              }
            ].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center space-x-1 mb-4">
                  {Array.from({ length: 5 }, (_, j) => (
                    <Star key={j} size={16} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center space-x-3">
                  <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.service} • {t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-3 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Transparent Pricing</h2>
            <p className="text-lg text-gray-600">Choose the plan that works best for you</p>
          </div>

          {/* items-stretch ensures all children can stretch; each card uses h-full flex-col */}
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
      <section className="py-3 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">Get answers to common questions about our services</p>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {[
              {
                question: "What makes ResaleExpert different from other platforms?",
                answer:
                  "We offer 100% verified properties, AI-powered matching, and end-to-end support with transparent pricing. Our expert team ensures a smooth experience from search to registration.",
              },
              {
                question: "How do you verify properties?",
                answer:
                  "Our verification process includes legal document checks, physical property inspection, ownership verification, and compliance checks to ensure authenticity and legal clarity.",
              },
              {
                question: "What are your fees for selling a property?",
                answer:
                  "We charge a transparent 2% commission only after successful sale. No hidden fees, no upfront charges. You pay only when we deliver results.",
              },
              {
                question: "How long does it typically take to sell a property?",
                answer:
                  "On average, properties sell within 30-60 days with our marketing strategies. Premium locations and well-priced properties often sell faster.",
              },
              {
                question: "Do you provide legal support?",
                answer:
                  "Yes, we have experienced legal partners who assist with documentation, title verification, registration, and ensure all transactions are legally compliant.",
              },
            ].map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${index}`}
                    className="w-full flex items-center justify-between gap-4 p-6 text-left"
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">{faq.question}</h3>
                    <ChevronDown className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <div
                    id={`faq-panel-${index}`}
                    role="region"
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-6 pb-6 pt-0 text-gray-700 leading-relaxed">{faq.answer}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-8 text-white"
        style={{ background: 'linear-gradient(to right, #0b3856, #0c3854)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-3xl mx-auto">
            Let our experts help you with your real estate needs. Get a free consultation today!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={() => setShowQuickContact(true)}
             className="w-full sm:w-auto bg-[#E6761D] hover:bg-[#CC6A1A] text-white px-5 py-3 rounded-xl font-semibold shadow-md transition-colors duration-300"
            >
              Get Free Consultation
            </button>

            <button className="w-full sm:w-auto hover:bg-[#CC6A1A] border border-white text-white px-5 py-3 rounded-xl font-semibold shadow-md transition-colors duration-300">
              Call Now: {phonePretty}
            </button>
          </div>
        </div>

        {/* Prefilled Quick Contact Modal */}
        <ContactQuickModal
          open={showQuickContact}
          onClose={() => setShowQuickContact(false)}
          phoneE164={phoneE164}
          displayPhone={phonePretty}
          title={
            selectedService
              ? `Talk to an Expert — ${selectedService.title}`
              : "Talk to an Expert"
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
