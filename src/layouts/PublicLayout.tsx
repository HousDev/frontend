import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Home,
  Building,
  Phone,
  Info,
  Briefcase,
  User,
  LogIn,
  FileText,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';
import PublicFooter from '@/pages/public/PublicFooter';

const PublicLayout: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { systemSettings } = useSystemSettings();

  const companyName = systemSettings?.company_name;
  const companyLogo = systemSettings?.company_logo;

  // dropdown state - which menu is open (null = none)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // navigation with stable ids
  const navigation = [
    { id: 'home', label: 'Home', href: '/', icon: Home },
    { id: 'properties', label: 'Properties', href: '/properties', icon: Building },
    { id: 'about', label: 'About', href: '/about', icon: Info },
    { id: 'blogs', label: 'Blogs', href: '/blogs', icon: FileText },
    {
      id: 'services',
      label: 'Services',
      href: '/services',
      icon: Briefcase,
      hasDropdown: true,
      dropdownItems: [
        { id: 'property-selling', label: 'Property Selling', description: 'Sell with AI pricing' },
        { id: 'property-buying', label: 'Property Buying', description: 'AI-matched properties' },
        { id: 'legal-services', label: 'Legal Services', description: 'Complete documentation' },
        { id: 'loan-assistance', label: 'Home Loans', description: 'Best rates guaranteed' }
      ]
    },
    { id: 'contact', label: 'Contact', href: '/contact', icon: Phone }
  ];

  const handleNavClick = (id: string, href?: string) => {
    // close dropdown when navigating
    setOpenDropdown(null);
    // If you want any extra behavior you can add here
    // navigation is handled by <Link /> so no need to push history here
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Company Logo / Name */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex items-center h-16 px-6 border-b space-x-3">
                {companyLogo ? (
                  <img
                    src={companyLogo}
                    alt="Company Logo"
                    className="h-10 w-25 object-contain rounded-xs shadow-sm bg-white p-1"
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-900 tracking-tight">{companyName}</span>
                )}
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6" ref={dropdownRef}>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                if (item.hasDropdown && item.dropdownItems) {
                  const isOpen = openDropdown === item.id;
                  return (
                    <div
                      key={item.id}
                      className="relative"
                      onMouseEnter={() => setOpenDropdown(item.id)}
                      onMouseLeave={() => setOpenDropdown((prev) => (prev === item.id ? null : prev))}
                    >
                      <button
                        type="button"
                        aria-haspopup="true"
                        aria-expanded={isOpen}
                        onClick={() => setOpenDropdown((prev) => (prev === item.id ? null : item.id))}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                          isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="whitespace-nowrap">{item.label}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown */}
                      {isOpen && (
                        <div
                          role="menu"
                          aria-label={`${item.label} menu`}
                          className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                        >
                          {item.dropdownItems.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.id}
                              to={`/services/${dropdownItem.id}`}
                              onClick={() => handleNavClick(dropdownItem.id, `/services/${dropdownItem.id}`)}
                              className="block px-4 py-2 hover:bg-blue-50 text-left"
                              role="menuitem"
                            >
                              <div className="text-sm font-medium text-gray-900">{dropdownItem.label}</div>
                              <div className="text-xs text-gray-600">{dropdownItem.description}</div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    to={item.href}
                    onClick={() => handleNavClick(item.id, item.href)}
                    className={cn(
                      'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Auth buttons */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              if (item.hasDropdown && item.dropdownItems) {
                const isOpen = openDropdown === item.id;
                return (
                  <div key={item.id} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setOpenDropdown((prev) => (prev === item.id ? null : item.id))}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium',
                        isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className="pl-6 space-y-1">
                        {item.dropdownItems.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.id}
                            to={`/services/${dropdownItem.id}`}
                            onClick={() => setOpenDropdown(null)}
                            className="block px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <div className="font-medium">{dropdownItem.label}</div>
                            <div className="text-xs text-gray-500">{dropdownItem.description}</div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium',
                    isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
