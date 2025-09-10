import React from 'react';
import { 
  Home, 
  Building, 
  CreditCard, 
  FileText, 
  Shield, 
  Users,
  CheckCircle,
  ArrowRight,
  Star,
  Phone,
  Mail,
  MapPin,
  Award,
  Target,
  TrendingUp,
  Calculator,
  Eye,
  Search,
  HandHeart,
  Briefcase,
  Clock,
  DollarSign,
  Crown,
  Gem,
  Zap,
  Bot,
  Rocket
} from 'lucide-react';

const ServicesPage = () => {
  const coreServices = [
    {
      id: 'property-buying',
      title: 'Property Buying',
      subtitle: 'Find Your Dream Home',
      description: 'Comprehensive assistance in finding and purchasing your perfect property with expert guidance and verified listings.',
      icon: Home,
      color: 'blue',
      features: [
        'AI-powered property matching',
        'Verified property listings',
        'Expert property evaluation',
        'Negotiation support',
        'Legal documentation assistance',
        'Post-purchase support'
      ],
      process: [
        'Requirement Analysis',
        'Property Shortlisting', 
        'Site Visits & Evaluation',
        'Price Negotiation',
        'Legal Verification',
        'Registration & Handover'
      ],
      price: 'No Hidden Charges',
      duration: '15-30 days',
      successRate: '95%'
    },
    {
      id: 'property-selling',
      title: 'Property Selling',
      subtitle: 'Maximize Your Returns',
      description: 'End-to-end selling support with premium marketing, verified buyers, and transparent pricing to get the best value.',
      icon: Building,
      color: 'green',
      features: [
        'Professional property photography',
        'Multi-channel marketing',
        'Verified buyer database',
        'Price optimization strategies',
        'Legal documentation support',
        'Hassle-free transactions'
      ],
      process: [
        'Property Valuation',
        'Documentation Review',
        'Marketing & Promotion',
        'Buyer Screening',
        'Negotiation & Closure',
        'Registration Support'
      ],
      price: '2% Commission',
      duration: '30-60 days',
      successRate: '92%'
    },
    {
      id: 'loan-assistance',
      title: 'Home Loan Assistance',
      subtitle: 'Best Rates Guaranteed',
      description: 'Get the best home loan deals with our banking partnerships and expert assistance throughout the process.',
      icon: CreditCard,
      color: 'purple',
      features: [
        'Multiple bank partnerships',
        'Competitive interest rates',
        'Quick loan approval',
        'Documentation support',
        'EMI calculation tools',
        'Loan processing assistance'
      ],
      process: [
        'Eligibility Assessment',
        'Bank Selection',
        'Application Submission',
        'Documentation Support',
        'Loan Approval',
        'Disbursement'
      ],
      price: 'Free Service',
      duration: '7-21 days',
      successRate: '88%'
    },
    {
      id: 'legal-services',
      title: 'Legal Services',
      subtitle: 'Complete Documentation',
      description: 'Expert legal services for all property transactions with experienced lawyers and transparent pricing.',
      icon: FileText,
      color: 'orange',
      features: [
        'Title verification',
        'Legal document preparation',
        'Due diligence support',
        'Registration assistance',
        'Dispute resolution',
        'Compliance support'
      ],
      process: [
        'Document Review',
        'Title Verification',
        'Legal Opinion',
        'Agreement Drafting',
        'Registration Support',
        'Post-transaction Support'
      ],
      price: '₹15,000 onwards',
      duration: '5-10 days',
      successRate: '99%'
    },
    {
      id: 'property-management',
      title: 'Property Management',
      subtitle: 'Hassle-Free Rentals',
      description: 'Complete property management services including tenant screening, rent collection, and maintenance.',
      icon: Shield,
      color: 'indigo',
      features: [
        'Tenant screening & verification',
        'Rent collection management',
        'Property maintenance',
        'Legal compliance support',
        'Regular property inspections',
        '24/7 customer support'
      ],
      process: [
        'Property Assessment',
        'Tenant Sourcing',
        'Agreement Execution',
        'Move-in Support',
        'Ongoing Management',
        'Renewal/Exit Support'
      ],
      price: '8% of rental income',
      duration: 'Ongoing',
      successRate: '96%'
    },
    {
      id: 'investment-advisory',
      title: 'Investment Advisory',
      subtitle: 'Smart Investment Decisions',
      description: 'Data-driven investment advice with market analysis and portfolio recommendations for maximum returns.',
      icon: TrendingUp,
      color: 'pink',
      features: [
        'Market trend analysis',
        'Investment opportunity identification',
        'ROI calculations',
        'Risk assessment',
        'Portfolio diversification',
        'Exit strategy planning'
      ],
      process: [
        'Investment Goal Analysis',
        'Market Research',
        'Opportunity Identification',
        'Risk Assessment',
        'Investment Execution',
        'Performance Monitoring'
      ],
      price: '₹25,000 consultation',
      duration: '30-45 days',
      successRate: '85%'
    }
  ];

  const additionalServices = [
    {
      title: 'Property Valuation',
      description: 'Professional property valuation for accurate market pricing',
      icon: Calculator,
      price: '₹5,000'
    },
    {
      title: 'Virtual Property Tours',
      description: '360° virtual tours for remote property viewing',
      icon: Eye,
      price: '₹8,000'
    },
    {
      title: 'Market Research Reports',
      description: 'Detailed market analysis and trends for specific areas',
      icon: Search,
      price: '₹15,000'
    },
    {
      title: 'Interior Design Consultation',
      description: 'Expert interior design advice for home staging',
      icon: HandHeart,
      price: '₹20,000'
    }
  ];

  const whyChooseUs = [
    {
      title: '15+ Years Experience',
      description: 'Decades of expertise in real estate',
      icon: Award,
      stat: '15+'
    },
    {
      title: 'Verified Properties',
      description: '100% legal and verified listings',
      icon: Shield,
      stat: '100%'
    },
    {
      title: 'Expert Team',
      description: 'Certified real estate professionals',
      icon: Users,
      stat: '50+'
    },
    {
      title: 'Customer Satisfaction',
      description: 'Happy customers across India',
      icon: Star,
      stat: '98%'
    }
  ];

  const serviceProcess = [
    {
      step: '1',
      title: 'Consultation',
      description: 'Free consultation to understand your requirements'
    },
    {
      step: '2',
      title: 'Planning',
      description: 'Detailed planning and strategy development'
    },
    {
      step: '3',
      title: 'Execution',
      description: 'Professional execution with regular updates'
    },
    {
      step: '4',
      title: 'Completion',
      description: 'Successful completion with post-service support'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Complete Real Estate
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Solutions
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-4xl mx-auto leading-relaxed">
              From property search to final registration, we provide end-to-end real estate services 
              with expert guidance and transparent pricing
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg">
                Get Free Consultation
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-blue-600 transition-all">
                View All Services
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Services</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive real estate solutions tailored to your specific needs
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {coreServices.map((service) => {
              const Icon = service.icon;
              return (
                <div key={service.id} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all group">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className={`p-4 bg-gradient-to-r from-${service.color}-500 to-${service.color}-600 rounded-2xl group-hover:shadow-lg transition-all`}>
                      <Icon className="text-white" size={32} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.title}</h3>
                      <p className={`text-${service.color}-600 font-semibold mb-3`}>{service.subtitle}</p>
                      <p className="text-gray-700 leading-relaxed">{service.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Key Features</h4>
                      <ul className="space-y-2">
                        {service.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle className={`text-${service.color}-600`} size={16} />
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
                            <div className={`w-6 h-6 bg-${service.color}-100 text-${service.color}-700 rounded-full flex items-center justify-center text-xs font-bold`}>
                              {index + 1}
                            </div>
                            <span className="text-gray-700 text-sm">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className={`text-center p-3 bg-${service.color}-50 rounded-lg`}>
                      <div className={`text-lg font-bold text-${service.color}-600`}>{service.price}</div>
                      <div className="text-xs text-gray-600">Pricing</div>
                    </div>
                    <div className={`text-center p-3 bg-${service.color}-50 rounded-lg`}>
                      <div className={`text-lg font-bold text-${service.color}-600`}>{service.duration}</div>
                      <div className="text-xs text-gray-600">Duration</div>
                    </div>
                    <div className={`text-center p-3 bg-${service.color}-50 rounded-lg`}>
                      <div className={`text-lg font-bold text-${service.color}-600`}>{service.successRate}</div>
                      <div className="text-xs text-gray-600">Success Rate</div>
                    </div>
                  </div>

                  <button className={`w-full bg-gradient-to-r from-${service.color}-600 to-${service.color}-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-${service.color}-700 hover:to-${service.color}-800 transition-all group-hover:shadow-lg`}>
                    Get Started
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Additional Services</h2>
            <p className="text-xl text-gray-600">Specialized services to enhance your property experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all group text-center">
                  <div className="bg-gradient-to-r from-gray-100 to-gray-200 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-blue-100 group-hover:to-purple-100 transition-all">
                    <Icon className="text-gray-600 group-hover:text-blue-600" size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  <div className="text-blue-600 font-bold mb-4">{service.price}</div>
                  <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all">
                    Learn More
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose ResaleExpert?</h2>
            <p className="text-xl text-gray-600">Excellence backed by experience and innovation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="bg-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                    <Icon className="text-blue-600" size={32} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{reason.stat}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{reason.title}</h3>
                  <p className="text-gray-600">{reason.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Service Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Service Process</h2>
            <p className="text-xl text-gray-600">Simple, transparent, and efficient workflow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {serviceProcess.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto text-white font-bold text-xl group-hover:shadow-lg transition-all">
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
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Client Success Stories</h2>
            <p className="text-xl text-gray-600">What our clients say about our services</p>
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
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center space-x-1 mb-4">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center space-x-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.service} • {testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that works best for you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-blue-500 transition-all">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">Free</div>
                <p className="text-gray-600">Perfect for first-time users</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={16} />
                  <span className="text-gray-700">Property search & listings</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={16} />
                  <span className="text-gray-700">Basic property details</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={16} />
                  <span className="text-gray-700">Contact property owners</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={16} />
                  <span className="text-gray-700">Basic market insights</span>
                </li>
              </ul>
              <button className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all">
                Get Started
              </button>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-2xl p-8 transform scale-105 shadow-xl">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Crown className="text-yellow-300" size={24} />
                  <h3 className="text-2xl font-bold">Premium</h3>
                </div>
                <div className="text-4xl font-bold mb-2">₹2,999</div>
                <p className="text-blue-100">Most popular choice</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="text-green-300" size={16} />
                  <span>Everything in Basic</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="text-green-300" size={16} />
                  <span>Expert consultation</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="text-green-300" size={16} />
                  <span>Site visit assistance</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="text-green-300" size={16} />
                  <span>Legal verification</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="text-green-300" size={16} />
                  <span>Loan assistance</span>
                </li>
              </ul>
              <button className="w-full bg-white text-blue-600 py-3 px-6 rounded-xl font-semibold hover:bg-gray-100 transition-all">
                Choose Premium
              </button>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-purple-500 transition-all">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-purple-600 mb-2">Custom</div>
                <p className="text-gray-600">For large portfolios</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={16} />
                  <span className="text-gray-700">Everything in Premium</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={16} />
                  <span className="text-gray-700">Dedicated relationship manager</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={16} />
                  <span className="text-gray-700">Priority support</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="text-green-500" size={16} />
                  <span className="text-gray-700">Custom solutions</span>
                </li>
              </ul>
              <button className="w-full bg-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-purple-700 transition-all">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Get answers to common questions about our services</p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: 'What makes ResaleExpert different from other platforms?',
                answer: 'We offer 100% verified properties, AI-powered matching, and end-to-end support with transparent pricing. Our expert team ensures a smooth experience from search to registration.'
              },
              {
                question: 'How do you verify properties?',
                answer: 'Our verification process includes legal document checks, physical property inspection, ownership verification, and compliance checks to ensure authenticity and legal clarity.'
              },
              {
                question: 'What are your fees for selling a property?',
                answer: 'We charge a transparent 2% commission only after successful sale. No hidden fees, no upfront charges. You pay only when we deliver results.'
              },
              {
                question: 'How long does it typically take to sell a property?',
                answer: 'On average, properties sell within 30-60 days with our marketing strategies. Premium locations and well-priced properties often sell faster.'
              },
              {
                question: 'Do you provide legal support?',
                answer: 'Yes, we have experienced legal partners who assist with documentation, title verification, registration, and ensure all transactions are legally compliant.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Let our experts help you with your real estate needs. Get a free consultation today!
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg">
              Get Free Consultation
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-blue-600 transition-all">
              Call Now: +91 99999 99999
            </button>
          </div>

          <div className="mt-12 flex items-center justify-center space-x-8 text-blue-100">
            <div className="flex items-center space-x-2">
              <Phone size={20} />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield size={20} />
              <span>100% Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award size={20} />
              <span>Award Winning</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;