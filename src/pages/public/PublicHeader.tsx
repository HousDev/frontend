import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { User, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';
import PublicFooter from './PublicFooter';
import PublicSellPropertyForm from './PublicSellPropertyForm';

type PublicHeaderProps = {
  currentPage?: string | null;
  onPageChange?: (pageId: string) => void;
  onAuthAction?: (action: 'login' | 'signup' | 'sell' | string) => void;
};

const PublicHeader: React.FC<PublicHeaderProps> = ({
  currentPage = null,
  onPageChange,
  onAuthAction,
}) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth() as any;
  const { systemSettings } = useSystemSettings() as any;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(true); // Set to true for admin access

  // Add state for the seller modal
  const [isSellerModalOpen, setIsSellerModalOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const companyName = systemSettings?.company_name || 'ResaleExpert';
  const companyLogo = systemSettings?.company_logo;

  // Use the sampled image color
  const navTextColor = '#0c3854';

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!dropdownRef.current) return;
      const target = e.target as Node | null;
      if (target && !dropdownRef.current.contains(target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Navigation items — all use the sampled color
  const navigationItems: { id: string; label: string; href?: string; textColor?: string }[] = [
    { id: 'home', label: 'Home', href: '/', textColor: navTextColor },
    { id: 'properties', label: 'Properties', href: '/properties', textColor: navTextColor },
    { id: 'services', label: 'Services', href: '/services', textColor: navTextColor },
    { id: 'about', label: 'About', href: '/about', textColor: navTextColor },
    { id: 'blogs', label: 'Blogs', href: '/blogs', textColor: navTextColor },
    { id: 'contact', label: 'Contact', href: '/contact', textColor: navTextColor },
  ];

  // Make href optional to avoid TS errors when callers pass only pageId
  const handleNavClick = (pageId: string, href?: string) => {
    if (onPageChange) {
      onPageChange(pageId);
    }
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);

    // If href provided, navigation is handled by Link's `to` (or you can programmatically navigate here if needed)
    // e.g., navigate(href) using react-router's useNavigate if required.
  };

  const isActivePage = (itemId: string, itemHref?: string) => {
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
  const handleSellerSave = async (sellerData: any) => {
    try {
      // Add your seller save logic here
      console.log('Saving seller:', sellerData);

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
                {/* phone placeholder */}
                <span className="text-xs font-medium">📞</span>
                <span>+91 99999 99999</span>
              </div>
              <div className="hidden md:flex items-center space-x-1">
                {/* mail placeholder */}
                <span className="text-xs font-medium">✉️</span>
                <span>info@resaleexpert.in</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <span className="text-yellow-300">★</span>
                <span className="hidden sm:inline">4.9/5</span>
                <span className="sm:hidden">★4.9</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-green-300">✓</span>
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
                    <span className="text-white font-bold">RE</span>
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
                const isActive = isActivePage(item.id, item.href);

                return (
                  <div key={item.id} className="relative">
                    {item.href ? (
                      <Link
                        to={item.href}
                        onClick={() => handleNavClick(item.id, item.href)}
                        style={{
                          color: isActive ? undefined : item.textColor,
                        }}
                        className={cn(
                          'flex items-center space-x-2 px-3 mx-2 py-1.5 rounded-xl transition-all text-sm font-medium',
                          isActive
                            ? 'bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200 text-[#0b3855]'
                            : 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-blue-50 hover:text-[#0b3855]'
                        )}
                      >
                        <span>{item.label}</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleNavClick(item.id)}
                        style={{ color: item.textColor }}
                        className={cn(
                          'flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all text-sm font-medium',
                          isActive
                            ? 'bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200 text-[#0b3855]'
                            : 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-blue-50 hover:text-[#0b3855]'
                        )}
                      >
                        <span>{item.label}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSellPropertyClick}
                className="hidden sm:flex items-center space-x-2 bg-[#e68130] opacity-1 text-white px-5 py-2.5 rounded-xl hover:bg-[#e67310] transition-all text-sm font-medium shadow-md hover:shadow-lg"
              >
                <span className="font-semibold">Sell Property</span>
              </button>

              {!isAuthenticated ? (
                <div className="hidden md:flex space-x-2 items-center">
                  {onAuthAction ? (
                    <>
                      <button
                        onClick={() => onAuthAction('login')}
                        style={{ color: navTextColor, borderColor: navTextColor }}
                        className="border px-5 py-2.5 rounded-xl hover:bg-[#f7fbfd] transition-all text-sm font-medium"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => onAuthAction('signup')}
                        className="bg-gradient-to-r from-[#0b3855] to-[#092e45] text-white px-5 py-2.5 rounded-xl hover:from-[#092e45] hover:to-[#071f2e] transition-all text-sm font-medium shadow-md hover:shadow-lg"
                      >
                        Sign Up
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        style={{ color: navTextColor }}
                        className="flex items-center space-x-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:text-[#07304a]"
                      >
                        <span>Login</span>
                      </Link>
                      <Link
                        to="/register"
                        className="bg-gradient-to-r from-[#0b3855] to-[#092e45] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:from-[#092e45] hover:to-[#071f2e] transition-colors shadow-md hover:shadow-lg"
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
                    className="flex items-center space-x-2 bg-[#0c3854] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#0b3858]/95 transition-colors shadow-md hover:shadow-lg"
                  >
                    {/* Keep User icon on dashboard button */}
                    <User className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>

                  <div
                    className="relative"
                    onMouseEnter={() => setIsUserDropdownOpen(true)}
                    onMouseLeave={() => setIsUserDropdownOpen(false)}
                  >
                    <button className="w-10 h-10 bg-gradient-to-r from-orange-100 to-blue-100 rounded-xl flex items-center justify-center border border-orange-200">
                      {/* Keep the User icon in the avatar button */}
                      <User className="text-[#0b3855]" size={16} />
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
                              <span>AI Training Panel</span>
                            </button>
                            <button
                              onClick={() => onPageChange && onPageChange('admin-dashboard')}
                              className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm flex items-center space-x-3 text-gray-700 hover:text-[#0b3855]"
                            >
                              <span>Admin Dashboard</span>
                            </button>
                          </>
                        )}
                        <button className="w-full text-left px-4 py-3 hover:bg-yellow-50 text-sm flex items-center space-x-3 text-gray-700 hover:text-yellow-600">
                          <span>Upgrade Plan</span>
                        </button>
                        <button className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm flex items-center space-x-3 text-gray-700">
                          <span>Settings</span>
                        </button>
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button className="w-full text-left px-4 py-3 hover:bg-red-50 text-sm flex items-center space-x-3 text-red-600">
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

              {/* Mobile Menu Button - now uses icons */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-4 space-y-2">
              {navigationItems.map((item) => {
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
                        ? 'bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200 text-[#0b3855]'
                        : 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-blue-50 hover:text-[#0b3855]'
                    )}
                  >
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
                        ? 'bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200 text-[#0b3855]'
                        : 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-blue-50 hover:text-[#0b3855]'
                    )}
                  >
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}

              <div className="pt-4 border-t border-gray-200 space-y-3">
                <button
                  onClick={handleSellPropertyClick}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 rounded-xl font-medium text-sm shadow-md"
                >
                  <span>Sell Property</span>
                </button>

                {!isAuthenticated ? (
                  onAuthAction ? (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => onAuthAction('login')}
                        style={{ borderColor: navTextColor, color: navTextColor }}
                        className="flex-1 border px-4 py-3 rounded-xl font-medium text-sm"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => onAuthAction('signup')}
                        className="flex-1 bg-gradient-to-r from-[#0b3855] to-[#092e45] text-white px-4 py-3 rounded-xl font-medium text-sm"
                      >
                        Sign Up
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-3">
                      <Link
                        to="/login"
                        style={{ color: navTextColor, borderColor: navTextColor }}
                        className="flex-1 text-center border px-4 py-3 rounded-xl font-medium text-sm"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="flex-1 text-center bg-gradient-to-r from-[#0b3855] to-[#092e45] text-white px-4 py-3 rounded-xl font-medium text-sm"
                      >
                        Get Started
                      </Link>
                    </div>
                  )
                ) : (
                  <Link
                    to="/dashboard"
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-[#0b3855] to-[#092e45] text-white px-4 py-3 rounded-xl font-medium text-sm"
                  >
                    <User className="h-4 w-4" />
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
