import React, { useEffect, useState } from 'react';
import {
  Home, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube,
  Building, Users, Briefcase, FileText, MessageCircle, Star, Shield, Award, Clock, CheckCircle
} from 'lucide-react';
import { Link, useLocation, matchPath, useNavigate } from 'react-router-dom';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';
import AIChatbot from '@/components/ai/AIChatbot';
import { getMasterDropdownOptions, MasterOption } from '@/lib/useMasterData';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import TermsConditionsModal from './TermsConditionsModal';

const PublicFooter = ({ onPageChange }: any) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isPropertyDetail = Boolean(
    matchPath({ path: '/properties/:slug' }, location.pathname) ||
    matchPath({ path: '/property/:slug' }, location.pathname)
  );

  const currentYear = new Date().getFullYear();
  const [masterLoading, setMasterLoading] = useState(true);

  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // ✅ Direct routes for navigation
  const quickLinks = [
    { id: 'home', label: 'Home', to: '/home' },
    { id: 'properties', label: 'Properties', to: '/properties' },
    { id: 'about', label: 'About Us', to: '/about' },
    { id: 'contact', label: 'Contact Us', to: '/contact' },
  ];

  const services = [
    { label: 'Property Selling', href: 'services' },
    { label: 'Property Buying', href: 'services' },
    { label: 'Property Rental', href: 'services' },
    { label: 'Legal Services', href: 'services' },
    { label: 'Loan Assistance', href: 'services' },
    { label: 'Property Management', href: 'services' }
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://www.instagram.com/resaleexpert.in/#', color: 'text-blue-600' },
    { icon: Twitter, href: '#', color: 'text-blue-400' },
    { icon: Instagram, href: 'https://www.facebook.com/resaleexpert.i', color: 'text-pink-600' },
    { icon: Linkedin, href: '#', color: 'text-blue-700' },
    { icon: Youtube, href: 'https://www.youtube.com/channel/UCYuJPmp-d7HIdfPgSejWzvg', color: 'text-red-600' }
  ];

  const { systemSettings } = useSystemSettings();
  const companyName = systemSettings?.company_name || 'Resale Expert';
  const footerLogo = systemSettings?.footer_logo;

  const [masters, setMasters] = useState<Record<string, MasterOption[]>>({});

  useEffect(() => {
    (async () => {
      try {
        setMasterLoading(true);
        const data = await getMasterDropdownOptions(['common']);
        setMasters(data);
      } finally {
        setMasterLoading(false);
      }
    })();
  }, []);

  // helper for location chip click
  const goToLocation = (locValue: string) => {
    // optional: onPageChange?.('properties');
    navigate(`/properties?location=${encodeURIComponent(locValue)}`);
    // window.scrollTo(0, 0); // ScrollToTop component already present
  };

  return (
    <footer className={`bg-gray-900 text-white lg:pb-0 md:pb-0 ${isPropertyDetail ? 'pb-24' : 'pb-0'} z-[70]`}>
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 md:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8 md:gap-8 sm:gap-8 gap-2">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <Link to="/" className="flex items-center space-x-2">
                <div className="flex items-center space-x-3">
                  {footerLogo ? (
                    <img src={footerLogo} alt={`${companyName} Footer Logo`} className="h-14 w-auto object-contain" />
                  ) : (
                    <div className="hidden sm:block">
                      <h1 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-orange-500 bg-clip-text text-transparent">
                        {companyName}
                      </h1>
                    </div>
                  )}
                </div>
              </Link>
            </div>

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
                  <Link
                    to={link.to}
                    className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2"
                    onClick={() => {
                      // optional backward-compat:
                      // onPageChange?.(link.id);
                    }}
                  >
                    <span className="w-1 h-1 bg-blue-500 rounded-full" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
              <li>
                <button
                  onClick={() => setShowPrivacy(true)}
                  className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2"
                >
                  <span className="w-1 h-1 bg-blue-500 rounded-full" />
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowTerms(true)}
                  className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2"
                >
                  <span className="w-1 h-1 bg-blue-500 rounded-full" />
                  <span>Terms & Conditions</span>
                </button>
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
                    <span className="w-1 h-1 bg-orange-500 rounded-full" />
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
                    Shubhchandra, Nakhate Chowk,<br />
                    Rahatani, Pimpri-Chinchwad<br />
                    Pune, Maharashtra 411017, India
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="text-green-400" size={18} />
                <div>
                  <p className="text-gray-300">+91 9637 00 9639</p>
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
                  <p className="text-gray-300">Mon - Fri: 9:00 AM - 8:00 PM</p>
                  <p className="text-gray-400 text-sm">Sat - Sun: 9:00 AM - 9:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Locations */}
        <div className="mt-4 border-t border-gray-800 pt-6">
          <h4 className="text-lg font-semibold mb-6">Popular Locations</h4>
          {masterLoading ? (
            <div className="text-gray-400 text-sm">Loading locations…</div>
          ) : Array.isArray(masters.location) && masters.location.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {masters.location.map((loc: MasterOption, idx: number) => (
                <button
                  key={idx}
                  onClick={() => goToLocation(loc.value)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors text-sm"
                  title={loc.label}
                >
                  {loc.value}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-sm italic">No locations available</div>
          )}
        </div>

        {/* Social Links */}
        <div className="flex items-center space-x-4 mt-6">
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
                <Icon size={14} />
              </a>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-gray-950 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-400 text-sm mb-4 md:mb-0 text-center md:text-left">
              © {currentYear} {companyName}. All rights reserved.{' '}
              <span className="mx-2 text-gray-500">|</span>
              <span className="text-gray-400">
                Developed by <span className="font-semibold text-white">Hously Finntech Realty</span>
              </span>
              <span className="mx-2 text-gray-500">|</span>
              <span className="text-gray-400">Real Estate Experience.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add these modals near end of component JSX */}
              <PrivacyPolicyModal open={showPrivacy} onClose={() => setShowPrivacy(false)} />
              <TermsConditionsModal open={showTerms} onClose={() => setShowTerms(false)} />
      {/* AI Chatbot */}
      <AIChatbot isPropertyDetail={isPropertyDetail} />
    </footer>
  );
};

export default PublicFooter;
