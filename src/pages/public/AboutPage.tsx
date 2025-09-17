import React from 'react';
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
  Rocket
} from 'lucide-react';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';

const AboutUsPage = () => {
  const stats = [
    { label: 'Properties Sold', value: '10,000+', icon: Home },
    { label: 'Happy Customers', value: '25,000+', icon: Users },
    { label: 'Years of Experience', value: '15+', icon: Award },
    { label: 'Cities Covered', value: '50+', icon: Building }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Trust & Transparency',
      description: 'We believe in complete transparency in all our dealings. Every property is verified, and all information is accurate and up-to-date.'
    },
    {
      icon: Target,
      title: 'Customer First',
      description: 'Our customers are at the heart of everything we do. We go above and beyond to ensure their real estate journey is smooth and successful.'
    },
    {
      icon: Star,
      title: 'Excellence',
      description: 'We strive for excellence in every aspect of our service, from property listings to customer support and after-sales service.'
    },
    {
      icon: Heart,
      title: 'Integrity',
      description: 'We conduct our business with the highest level of integrity, ensuring fair deals and honest communication with all parties.'
    }
  ];

  const team = [
    {
      name: 'Rajesh Patel',
      role: 'Founder & CEO',
      experience: '15+ years',
      specialization: 'Luxury Properties',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      name: 'Priya Sharma',
      role: 'Head of Sales',
      experience: '12+ years',
      specialization: 'Residential Sales',
      image: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      name: 'Amit Kumar',
      role: 'Legal Advisor',
      experience: '10+ years',
      specialization: 'Property Law',
      image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      name: 'Neha Gupta',
      role: 'Customer Relations',
      experience: '8+ years',
      specialization: 'Client Support',
      image: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=300'
    }
  ];

  const achievements = [
    {
      year: '2010',
      title: 'Company Founded',
      description: 'Started with a vision to revolutionize real estate in Mumbai'
    },
    {
      year: '2015',
      title: 'Digital Transformation',
      description: 'Launched online platform and mobile app for seamless property search'
    },
    {
      year: '2018',
      title: 'Pan-India Expansion',
      description: 'Expanded operations to 25+ cities across India'
    },
    {
      year: '2020',
      title: 'AI Integration',
      description: 'Introduced AI-powered property matching and market analysis'
    },
    {
      year: '2023',
      title: 'Industry Recognition',
      description: 'Awarded "Best Real Estate Platform" by Property Awards India'
    }
  ];
  const { systemSettings } = useSystemSettings();
  const companyName = systemSettings?.company_name;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">About
              &nbsp;{companyName}
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              India's most trusted real estate platform, connecting millions of buyers, sellers, and renters
              with verified properties and expert guidance since 2010.
            </p>
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold">15+</div>
                <div className="text-blue-200">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">10K+</div>
                <div className="text-blue-200">Properties Sold</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">25K+</div>
                <div className="text-blue-200">Happy Customers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                To make real estate transactions transparent, efficient, and accessible for everyone.
                We leverage technology and expertise to simplify the complex process of buying,
                selling, and renting properties.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="text-gray-700">100% Verified Properties</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="text-gray-700">Expert Legal Guidance</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="text-gray-700">End-to-End Support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-600" size={20} />
                  <span className="text-gray-700">AI-Powered Matching</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Our Mission"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <TrendingUp className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">98%</div>
                    <div className="text-sm text-gray-600">Customer Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Impact in Numbers</h2>
            <p className="text-xl text-gray-600">Trusted by thousands of customers across India</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="text-white" size={32} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                      <Icon className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                      <p className="text-gray-700 leading-relaxed">{value.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Expert Team</h2>
            <p className="text-xl text-gray-600">Experienced professionals dedicated to your success</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                <div className="relative">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <div className="text-blue-600 font-medium mb-2">{member.role}</div>
                  <div className="text-sm text-gray-600 mb-2">{member.experience} experience</div>
                  <div className="text-sm text-gray-500">Specializes in {member.specialization}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600">Milestones that shaped our success story</p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200"></div>
            <div className="space-y-12">
              {achievements.map((achievement, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-2">{achievement.year}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{achievement.title}</h3>
                      <p className="text-gray-700">{achievement.description}</p>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Star className="text-white" size={20} />
                    </div>
                  </div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose ResaleExpert?</h2>
            <p className="text-xl text-gray-600">What makes us the preferred choice for real estate</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Shield className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">100% Verified Properties</h3>
              <p className="text-gray-700">
                Every property on our platform is thoroughly verified for legal compliance,
                ownership, and authenticity before listing.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Zap className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Powered Matching</h3>
              <p className="text-gray-700">
                Our advanced AI algorithms match buyers with perfect properties based on
                preferences, budget, and lifestyle requirements.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Handshake className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">End-to-End Support</h3>
              <p className="text-gray-700">
                From property search to final registration, we provide complete support
                throughout your real estate journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Awards & Recognition</h2>
            <p className="text-xl text-gray-600">Industry recognition for our excellence</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Best Real Estate Platform 2023</h3>
              <p className="text-gray-600">Property Awards India</p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Customer Choice Award 2022</h3>
              <p className="text-gray-600">Real Estate Excellence Awards</p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="bg-gradient-to-r from-blue-400 to-indigo-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Innovation in PropTech 2021</h3>
              <p className="text-gray-600">Technology Innovation Awards</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Real Estate Journey?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have found their dream properties with ResaleExpert
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors">
              Browse Properties
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-blue-600 transition-colors">
              Contact Us Today
            </button>
          </div>

          <div className="mt-12 flex items-center justify-center space-x-8 text-blue-100">
            <div className="flex items-center space-x-2">
              <Phone size={20} />
              <span>+91 99999 99999</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail size={20} />
              <span>info@resaleexpert.in</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin size={20} />
              <span>Mumbai, India</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;