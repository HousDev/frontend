import React from 'react';
import { 
  Home, 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Youtube,
  Building,
  Users,
  Briefcase,
  FileText,
  MessageCircle,
  Star,
  Shield,
  Award,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Link, } from 'react-router-dom';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';
import AIChatbot from '@/components/ai/AIChatbot';
const PublicFooter = ({ onPageChange }: any) => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { id: 'home', label: 'Home' },
    { id: 'properties', label: 'Properties' },
    { id: 'about', label: 'About Us' },
    { id: 'contact', label: 'Contact Us' }
  ];

  const services = [
    { label: 'Property Selling', href: '#' },
    { label: 'Property Buying', href: '#' },
    { label: 'Property Rental', href: '#' },
    { label: 'Legal Services', href: '#' },
    { label: 'Loan Assistance', href: '#' },
    { label: 'Property Management', href: '#' }
  ];

  const locations = [
    'Andheri West', 'Bandra West', 'Juhu', 'Powai', 'Versova', 'Malad West'
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', color: 'text-blue-600' },
    { icon: Twitter, href: '#', color: 'text-blue-400' },
    { icon: Instagram, href: '#', color: 'text-pink-600' },
    { icon: Linkedin, href: '#', color: 'text-blue-700' },
    { icon: Youtube, href: '#', color: 'text-red-600' }
  ];


   const { systemSettings } = useSystemSettings();
    const companyName = systemSettings?.company_name;
    const companyLogo = systemSettings?.company_logo;
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 md:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 md:gap-8 sm:gap-8 gap-2">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <Link to="/" className="flex items-center space-x-2">
                <div className="flex items-center h-16 px-6 border-b space-x-3">
                  {/* ✅ अगर logo है तो सिर्फ logo दिखे */}
                  {companyLogo ? (
                    <img
                      src={companyLogo}
                      alt="Company Logo"
                      className="h-10 w-25 object-contain rounded-xs shadow-sm bg-white p-1"
                    />
                  ) : (
                    // ✅ अगर logo नहीं है तो fallback → company name या default icon
                    <span className="text-2xl font-bold text-gray-900 tracking-tight">
                      {companyName}
                    </span>
                  )}
                </div>
              </Link>

            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Your Trusted Real Estate Partner
            </p>
            
            {/* Trust Indicators */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Shield className="text-green-400" size={16} />
                <span className="text-sm text-gray-300">100% Verified Properties</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="text-yellow-400" size={16} />
                <span className="text-sm text-gray-300">Award Winning Service</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="text-blue-400" size={16} />
                <span className="text-sm text-gray-300">10,000+ Happy Customers</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onPageChange(link.id)}
                    className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2"
                  >
                    <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2">
                  <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                  <span>Privacy Policy</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2">
                  <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                  <span>Terms & Conditions</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Our Services</h4>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <a href={service.href} className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2">
                    <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                    <span>{service.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Info</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="text-blue-400 mt-1 flex-shrink-0" size={18} />
                <div>
                  <p className="text-gray-300">
                    Office 501, Business Tower,<br />
                    Andheri West, Mumbai - 400058<br />
                    Maharashtra, India
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="text-green-400" size={18} />
                <div>
                  <p className="text-gray-300">+91 99999 99999</p>
                  <p className="text-gray-400 text-sm">24/7 Support Available</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="text-purple-400" size={18} />
                <div>
                  <p className="text-gray-300">info@resaleexpert.in</p>
                  <p className="text-gray-400 text-sm">Quick Response Guaranteed</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="text-orange-400" size={18} />
                <div>
                  <p className="text-gray-300">Mon - Sat: 9:00 AM - 8:00 PM</p>
                  <p className="text-gray-400 text-sm">Sunday: 10:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Locations */}
        <div className="  mt-4 border-t border-gray-800">
          <h4 className="text-lg font-semibold mb-6">Popular Locations</h4>
          <div className="flex flex-wrap gap-3">
            {locations.map((location, index) => (
              <button
                key={index}
                onClick={() => onPageChange('properties')}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors text-sm"
              >
                {location}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-gray-950 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} &nbsp;{companyName}&nbsp;. All rights reserved. | Designed with ❤️ for better real estate experience.
            </div>
            
            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm mr-2">Follow us:</span>
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className={`p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors ${social.color}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      {/* <div className="fixed bottom-6 right-6 z-50">
        <a
          href="https://wa.me/919999999999?text=Hi, I'm interested in your real estate services"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-all duration-300 hover:scale-110 flex items-center space-x-2"
        >
          <MessageCircle size={24} />
          <span className="hidden sm:inline font-medium">Chat with us</span>
        </a>
      </div> */}
      {/* AI Chatbot */}
      <AIChatbot />
    </footer>
  );
};

export default PublicFooter;