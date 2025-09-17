import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Home,
  Building2,
  Settings,
  Users,
  BookOpen,
  MessageSquare,
  Phone,
  Mail,
  Star,
  Shield,
  ChevronDown,
  User,
  Menu,
  X,
  LogOut,
  Crown,
  Bot,
  LogIn,
  InfoIcon,
  DollarSign,
  HandCoins,
  Briefcase,
  Info,
  FileText,
  MessageCircle,
  Brain,
  Sparkles,
  Building,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';
import PublicFooter from './PublicFooter';
import PublicSellPropertyForm from './PublicSellPropertyForm';

const PublicHeader = ({ currentPage, onPageChange, onAuthAction }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { systemSettings } = useSystemSettings();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true); // Set to true for admin access

  // Add state for the seller modal
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);

  const dropdownRef = useRef(null);

  const companyName = systemSettings?.company_name || 'ResaleExpert';
  const companyLogo = systemSettings?.company_logo;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Updated navigation items with proper modern icons
  const navigationItems = [
    { id: 'home', label: 'Home', href: '/', icon: Home, textColor: '#1e40af', iconColor: '#f97316' },
    { id: 'properties', label: 'Properties', href: '/properties', icon: Building2, textColor: '#1e3a8a', iconColor: '#ea580c' },
    {
      id: 'services',
      label: 'Services',
      href: '/services',
      icon: Zap,
      textColor: '#1e40af',
      iconColor: '#f97316'
    },
    { id: 'about', label: 'About', href: '/about', icon: Info, textColor: '#1e3a8a', iconColor: '#ea580c' },
    { id: 'blogs', label: 'Blogs', href: '/blogs', icon: BookOpen, textColor: '#1e40af', iconColor: '#f97316' },
    { id: 'contact', label: 'Contact', href: '/contact', icon: Phone, textColor: '#1e3a8a', iconColor: '#ea580c' }
  ];

  const handleNavClick = (pageId, href) => {
    if (onPageChange) {
      onPageChange(pageId);
    }
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  };

  const isActivePage = (itemId, itemHref) => {
    if (currentPage) {
      return currentPage === itemId;
    }
    if (itemHref) {
      return location.pathname === itemHref;
    }
    return false;
  };

  // Handle sell property button click
  const handleSellPropertyClick = () => {
    if (onAuthAction) {
      // If using onAuthAction prop, call it
      onAuthAction('sell');
    } else {
      // Otherwise, open the seller modal directly
      setIsSellerModalOpen(true);
    }
  };

  // Handle seller form save
  const handleSellerSave = async (sellerData) => {
    try {
      // Add your seller save logic here
      console.log('Saving seller:', sellerData);

      // You can call your API here
      // await sellerAPI.createSeller(sellerData);

      // Show success message
      alert('Seller information saved successfully!');

      // Close the modal
      setIsSellerModalOpen(false);
    } catch (error) {
      console.error('Error saving seller:', error);
      alert('Failed to save seller information. Please try again.');
    }
  };

  return (
    <>
      {/* Compact Top Bar */}
      <div className="bg-gradient-to-r from-blue-800 to-orange-500 text-white py-1.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-1">
                <Phone size={12} />
                <span>+91 99999 99999</span>
              </div>
              <div className="hidden md:flex items-center space-x-1">
                <Mail size={12} />
                <span>info@resaleexpert.in</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Star className="text-yellow-300 fill-current" size={12} />
                <span className="hidden sm:inline">4.9/5</span>
                <span className="sm:hidden">★4.9</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="text-green-300" size={12} />
                <span className="hidden sm:inline">Verified</span>
                <span className="sm:hidden">✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Main Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Compact Logo */}
            <Link to="/" className="flex items-center space-x-3">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt="ResaleExpert Logo"
                  className="h-10 w-auto object-contain rounded-lg shadow-sm bg-white p-1"
                />
              ) : (
                <>
                    <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Building className="h-6 w-6 text-white" />
                    </div>
                  <div className="hidden sm:block">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-800 to-orange-500 bg-clip-text text-transparent">
                      {companyName}
                    </h1>
                  </div>
                </>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1" ref={dropdownRef}>
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePage(item.id, item.href);

                return (
                  <div key={item.id} className="relative">
                    {item.hasDropdown ? (
                      <div
                        className="relative"
                        onMouseEnter={() => setOpenDropdown(item.id)}
                        onMouseLeave={() => setOpenDropdown((prev) => (prev === item.id ? null : prev))}
                      >
                        <button
                          type="button"
                          aria-haspopup="true"
                          aria-expanded={openDropdown === item.id}
                          style={{ color: item.textColor }}
                          className={cn(
                            'flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all text-sm font-medium',
                            isActive
                              ? 'bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200'
                              : 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-blue-50 hover:text-orange-600'
                          )}
                        >
                          <Icon size={16} style={{ color: item.iconColor }} />
                          <span>{item.label}</span>
                          <ChevronDown size={14} className={`transition-transform ${openDropdown === item.id ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    ) : (
                      item.href ? (
                        <Link
                          to={item.href}
                          onClick={() => handleNavClick(item.id, item.href)}
                          style={{ color: item.textColor }}
                          className={cn(
                            'flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all text-sm font-medium',
                            isActive
                              ? 'bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200'
                              : 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-blue-50 hover:text-orange-600'
                          )}
                        >
                          <Icon size={16} style={{ color: item.iconColor }} />
                          <span>{item.label}</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleNavClick(item.id)}
                          style={{ color: item.textColor }}
                          className={cn(
                            'flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all text-sm font-medium',
                            isActive
                              ? 'bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200'
                              : 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-blue-50 hover:text-orange-600'
                          )}
                        >
                          <Icon size={16} style={{ color: item.iconColor }} />
                          <span>{item.label}</span>
                        </button>
                      )
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSellPropertyClick}
                className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all text-sm font-medium shadow-md hover:shadow-lg"
              >
                <HandCoins size={16} />
                <span>Sell Property</span>
              </button>

              {!isAuthenticated ? (
                <div className="hidden md:flex space-x-2">
                  {onAuthAction ? (
                    <>
                      <button
                        onClick={() => onAuthAction('login')}
                        className="border border-blue-800 text-blue-800 px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-all text-sm font-medium"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => onAuthAction('signup')}
                        className="bg-gradient-to-r from-blue-800 to-blue-900 text-white px-5 py-2.5 rounded-xl hover:from-blue-900 hover:to-blue-950 transition-all text-sm font-medium shadow-md hover:shadow-lg"
                      >
                        Sign Up
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="flex items-center space-x-1 text-blue-800 hover:text-orange-600 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                      >
                        <LogIn className="h-4 w-4" />
                        <span>Login</span>
                      </Link>
                      <Link
                        to="/register"
                        className="bg-gradient-to-r from-blue-800 to-blue-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:from-blue-900 hover:to-blue-950 transition-colors shadow-md hover:shadow-lg"
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-800 to-blue-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:from-blue-900 hover:to-blue-950 transition-colors shadow-md hover:shadow-lg"
                  >
                    <User className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>

                  <div
                    className="relative"
                    onMouseEnter={() => setIsUserDropdownOpen(true)}
                    onMouseLeave={() => setIsUserDropdownOpen(false)}
                  >
                    <button className="w-10 h-10 bg-gradient-to-r from-orange-100 to-blue-100 rounded-xl flex items-center justify-center border border-orange-200">
                      <User className="text-blue-800" size={16} />
                    </button>
                    {isUserDropdownOpen && (
                      <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="text-sm font-semibold text-gray-900">John Doe</div>
                          <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full inline-block mt-1">
                            {isAdmin ? 'Admin User' : 'Premium Member'}
                          </div>
                        </div>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => onPageChange && onPageChange('admin-ai')}
                              className="w-full text-left px-4 py-3 hover:bg-orange-50 text-sm flex items-center space-x-3 text-gray-700 hover:text-orange-600"
                            >
                              <Brain size={16} />
                              <span>AI Training Panel</span>
                            </button>
                            <button
                              onClick={() => onPageChange && onPageChange('admin-dashboard')}
                              className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm flex items-center space-x-3 text-gray-700 hover:text-blue-800"
                            >
                              <Settings size={16} />
                              <span>Admin Dashboard</span>
                            </button>
                          </>
                        )}
                        <button className="w-full text-left px-4 py-3 hover:bg-yellow-50 text-sm flex items-center space-x-3 text-gray-700 hover:text-yellow-600">
                          <Crown size={16} />
                          <span>Upgrade Plan</span>
                        </button>
                        <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm flex items-center space-x-3 text-gray-700">
                          <Settings size={16} />
                          <span>Settings</span>
                        </button>
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button className="w-full text-left px-4 py-3 hover:bg-red-50 text-sm flex items-center space-x-3 text-red-600">
                            <LogOut size={16} />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Quick Access (when not logged in) */}
              {!isAuthenticated && onPageChange && (
                <button
                  onClick={() => onPageChange('admin-ai')}
                  className="hidden md:block text-xs bg-orange-100 text-orange-700 px-3 py-2 rounded-full hover:bg-orange-200 transition-colors border border-orange-300"
                >
                  Admin Panel
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePage(item.id, item.href);
                return item.href ? (
                  <Link
                    key={item.id}
                    to={item.href}
                    onClick={() => handleNavClick(item.id, item.href)}
                    style={{ color: item.textColor }}
                    className={cn(
                      'w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-left',
                      isActive
                        ? 'bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200'
                        : 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-blue-50 hover:text-orange-600'
                    )}
                  >
                    <Icon size={18} style={{ color: item.iconColor }} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    style={{ color: item.textColor }}
                    className={cn(
                      'w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-left',
                      isActive
                        ? 'bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200'
                        : 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-blue-50 hover:text-orange-600'
                    )}
                  >
                    <Icon size={18} style={{ color: item.iconColor }} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}

              <div className="pt-4 border-t border-gray-200 space-y-3">
                <button
                  onClick={handleSellPropertyClick}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-xl font-medium text-sm shadow-md"
                >
                  <HandCoins size={16} />
                  <span>Sell Property</span>
                </button>

                {!isAuthenticated ? (
                  onAuthAction ? (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => onAuthAction('login')}
                        className="flex-1 border border-blue-800 text-blue-800 px-4 py-3 rounded-xl font-medium text-sm"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => onAuthAction('signup')}
                        className="flex-1 bg-gradient-to-r from-blue-800 to-blue-900 text-white px-4 py-3 rounded-xl font-medium text-sm"
                      >
                        Sign Up
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-3">
                      <Link
                        to="/login"
                        className="flex-1 text-center border border-blue-800 text-blue-800 px-4 py-3 rounded-xl font-medium text-sm"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="flex-1 text-center bg-gradient-to-r from-blue-800 to-blue-900 text-white px-4 py-3 rounded-xl font-medium text-sm"
                      >
                        Get Started
                      </Link>
                    </div>
                  )
                ) : (
                  <Link
                    to="/dashboard"
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-800 to-blue-900 text-white px-4 py-3 rounded-xl font-medium text-sm"
                  >
                    <User size={16} />
                    <span>Dashboard</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <PublicFooter />

      {/* Seller Form Modal */}
      <PublicSellPropertyForm
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
        seller={null}
        onSave={handleSellerSave}
      />
    </>
  );
};

export default PublicHeader;