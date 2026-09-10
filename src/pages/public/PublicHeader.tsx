import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { User as UserIcon, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';
import PublicFooter from './PublicFooter';
import PublicSellPropertyForm from './PublicSellPropertyForm';
import { fetchReverseGeocode, fetchIpLocation } from '@/utils/deviceInfo';

/* ---------------- Colors ---------------- */
const colors = {
  brand: '#E6761D',
  brandHover: '#CC6A1A',
  accent: '#0b3856',
  navText: '#0c3854',
};

type PublicHeaderProps = {
  currentPage?: string | null;
  onPageChange?: (pageId: string) => void;
  onAuthAction?: (action: 'login' | 'signup' | 'sell' | string) => void;
};

type AnyUser = {
  role?: string;
  salutation?: string;
  first_name?: string;
  last_name?: string;
  buyer_id?: string | number | null;
  seller_id?: string | number | null;
};

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

const hasBuyerId = (u: unknown): u is { role: string; buyer_id: string | number } => {
  if (!isObject(u)) return false;
  const user = u as AnyUser;
  const role = user.role?.toLowerCase();
  const buyerId = user.buyer_id;
  return role === 'buyer' && buyerId != null && buyerId !== '';
};

const hasSellerId = (u: unknown): u is { role: string; seller_id: string | number } => {
  if (!isObject(u)) return false;
  const user = u as AnyUser;
  const role = user.role?.toLowerCase();
  const sellerId = user.seller_id;
  return role === 'seller' && sellerId != null && sellerId !== '';
};

const isAdminRole = (u: unknown): boolean => {
  if (!isObject(u)) return false;
  const user = u as AnyUser;
  const role = user.role?.toLowerCase();
  return ['admin', 'manager', 'executive', 'team leader', 'agent', 'staff'].includes(role || '');
};

const PublicHeader: React.FC<PublicHeaderProps> = ({
  currentPage = null,
  onPageChange,
  onAuthAction,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { systemSettings } = useSystemSettings();

  const companyName = systemSettings?.company_name ?? 'ResaleExpert';
  const companyLogo = systemSettings?.company_logo as string | undefined;       // colored logo
  const CompanyWhiteLogo = systemSettings?.footer_logo as string | undefined;   // white logo (used on transparent)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Auto-request location on website open & save for Tenant Preferences
  useEffect(() => {
    const detectLocation = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;
              try {
                const addr = await fetchReverseGeocode(lat, lng);
                if (addr) {
                  localStorage.setItem('user_detected_location', addr);
                  const parts = addr.split(',').map((p) => p.trim()).filter(Boolean);
                  const mainLoc = parts[0] || parts[1] || '';
                  if (mainLoc) localStorage.setItem('user_detected_locality', mainLoc);
                }
              } catch (_) {
                fallbackIp();
              }
            },
            () => {
              fallbackIp();
            },
            { enableHighAccuracy: true, timeout: 8000 }
          );
        } else {
          fallbackIp();
        }
      } catch (_) {
        fallbackIp();
      }
    };

    const fallbackIp = async () => {
      try {
        const ipRes = await fetchIpLocation();
        if (ipRes?.address) {
          localStorage.setItem('user_detected_location', ipRes.address);
          const parts = ipRes.address.split(',').map((p) => p.trim()).filter(Boolean);
          const mainLoc = parts[0] || parts[1] || '';
          if (mainLoc) localStorage.setItem('user_detected_locality', mainLoc);
        }
      } catch (_) {}
    };

    detectLocation();
  }, []);

  /* ------------ Only HOME has scroll-driven transparency ------------ */
  const isHome = location.pathname === '/';
  const [isSolid, setIsSolid] = useState<boolean>(!isHome); // non-home starts solid

  useEffect(() => {
    if (isHome) {
      const handle = () => setIsSolid(window.scrollY > 10 || isMobileMenuOpen);
      handle(); // set once
      window.addEventListener('scroll', handle, { passive: true });
      return () => window.removeEventListener('scroll', handle);
    } else {
      // other pages are always solid; no scroll listener
      setIsSolid(true);
    }
  }, [isHome, isMobileMenuOpen]);

  const getDashboardPath = (): string => {
    if (!isAuthenticated || !user) return '/login';
    const role = (user as AnyUser).role?.toLowerCase() || '';
    const userId = (user as any)?.id || 1;
    const buyerId = (user as AnyUser).buyer_id || userId;
    const sellerId = (user as AnyUser).seller_id || userId;
    const tenantId = (user as any)?.tenant_id || userId;

    if (role === 'buyer') {
      return `/buyer-dashboard/${buyerId}`;
    }
    if (role === 'seller') {
      return `/seller-dashboard/${sellerId}`;
    }
    if (role === 'tenant') {
      return `/tenant-dashboard/${tenantId}`;
    }
    if (role === 'owner') {
      const ownerId = (user as any)?.owner_id || userId;
      return `/owner-dashboard/${ownerId}`;
    }
    if (role === 'broker') {
      return '/properties';
    }
    return '/dashboard';
  };
  const dashboardHref = getDashboardPath();

  /* ---------------- Navigation logic ---------------- */
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const path = location.pathname;
    if (path === '/dashboard') {
      const targetDash = getDashboardPath();
      if (targetDash !== '/dashboard') {
        navigate(targetDash, { replace: true });
      }
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  useEffect(() => {
    if (user) {
      const userRole = (user as AnyUser).role?.toLowerCase();
      setIsAdmin(userRole === 'admin' || userRole === 'manager');
    } else setIsAdmin(false);
  }, [user]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!userMenuRef.current) return;
      const target = e.target as Node | null;
      if (target && !userMenuRef.current.contains(target)) setIsUserDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const navigationItems: { id: string; label: string; href?: string }[] = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'properties', label: 'Properties', href: '/properties' },
    { id: 'services', label: 'Services', href: '/services' },
    { id: 'about', label: 'About', href: '/about' },
    { id: 'blogs', label: 'Blogs', href: '/blogs' },
    { id: 'contact', label: 'Contact', href: '/contact' },
  ];

  const handleNavClick = (pageId: string) => {
    onPageChange?.(pageId);
    setIsMobileMenuOpen(false);
  };

  const isActivePage = (itemId: string, itemHref?: string) => {
    if (currentPage) return currentPage === itemId;
    if (itemHref) return location.pathname === itemHref;
    return false;
  };

  // const handleSellPropertyClick = () => {
  //   if (onAuthAction) onAuthAction('sell');
  //   else setIsSellerModalOpen(true);
  // };
  const handleSellPropertyClick = () => {
    setIsMobileMenuOpen(false);
    navigate('/sell-property');

  };

  // const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  // const handleSellerSave = async (sellerData: any) => {
  //   try {
  //     // alert('Seller information saved successfully!');
  //     setTimeout(() => {
  //       setIsSellerModalOpen(false);
  //     }, 3000)
  //   } catch (error) {
  //     console.error('Error saving seller:', error);
  //     alert('Failed to save seller information. Please try again.');
  //   }
  // };

  const displayName = (() => {
    if (!user) return 'User';
    const salutation = (user as AnyUser)?.salutation as string | undefined;
    const first = (user as AnyUser)?.first_name as string | undefined;
    const last = (user as AnyUser)?.last_name as string | undefined;
    const parts = [salutation, first, last].filter(Boolean);
    return parts.length ? parts.join(' ') : 'User';
  })();

  const userRole = isAuthenticated && user ? (user as AnyUser).role : '';

  // Colors by mode
  const linkColor = isSolid ? colors.navText : '#ffffff';
  const borderColor = isSolid ? colors.navText : '#ffffff';
  const hoverText = '#E6761D';

  // Decide which logo to render:
  // - Home: default (transparent) -> white logo; scrolled (solid) -> normal logo
  // - Other pages: always normal logo
  const logoSrc = (() => {
    const colorLogo = companyLogo || CompanyWhiteLogo; // fallback to whatever exists
    const whiteLogo = CompanyWhiteLogo || companyLogo; // fallback to whatever exists
    if (isHome) return isSolid ? colorLogo : whiteLogo;
    return colorLogo;
  })();

  return (
    <>
      {/* Transparent only on home; solid elsewhere */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isSolid
            ? 'bg-white backdrop-blur supports-[backdrop-filter]:backdrop-blur border-b border-gray-200 shadow-sm'
            : 'bg-transparent'
        )}
      >
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center space-x-3">
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt={`${companyName} Logo`}
                  className={cn(
                    'h-16 w-auto object-contain rounded-lg p-1 transition-shadow',
                    isSolid ? '' : ' '
                  )}
                />
              ) : (
                <h1
                  className="text-2xl font-bold bg-clip-text text-transparent"
                  style={{
                    backgroundImage: isSolid
                      ? `linear-gradient(to right, ${colors.navText}, ${colors.brand})`
                      : `linear-gradient(to right, #ffffff, ${colors.brand})`,
                  }}
                >
                  {companyName}
                </h1>
              )}
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const active = isActivePage(item.id, item.href);
                const base =
                  'flex items-center mx-4 py-1 text-[16px] xl:text-[17px] font-medium border-b-2 transition-all duration-300 ease-in-out';
                return (
                  <div key={item.id} className="relative">
                    {item.href ? (
                      <Link
                        to={item.href}
                        onClick={() => handleNavClick(item.id)}
                        aria-current={active ? 'page' : undefined}
                        style={{ color: active ? hoverText : linkColor }}
                        className={cn(base, active ? 'border-[#E6761D]' : 'border-transparent')}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = hoverText;
                          e.currentTarget.classList.add('border-[#E6761D]');
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = active ? hoverText : linkColor;
                          e.currentTarget.classList.remove('border-[#E6761D]');
                          e.currentTarget.classList.add('border-transparent');
                        }}
                      >
                        <span>{item.label}</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleNavClick(item.id)}
                        aria-current={active ? 'page' : undefined}
                        style={{ color: active ? hoverText : linkColor }}
                        className={cn(base, active ? 'border-[#E6761D]' : 'border-transparent')}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLButtonElement;
                          el.style.color = hoverText;
                          el.classList.add('border-[#E6761D]');
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLButtonElement;
                          el.style.color = active ? hoverText : linkColor;
                          el.classList.remove('border-[#E6761D]');
                          el.classList.add('border-transparent');
                        }}
                      >
                        <span>{item.label}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* <button
                onClick={handleSellPropertyClick}
                className="hidden sm:flex items-center space-x-2 text-white px-4 py-2.5 rounded-xl transition-all text-sm font-medium shadow-md hover:shadow-lg"
                style={{ backgroundColor: colors.brand }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.brandHover)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.backgroundColor = colors.brand)}
                aria-label="Sell property"
              >
                <span className="font-semibold"> Post Property</span>
              </button> */}

              <button
                onClick={handleSellPropertyClick}
                className="hidden sm:flex items-center gap-2 text-white px-4 py-2.5 rounded-xl transition-all text-sm font-medium shadow-md hover:shadow-lg"
                style={{ backgroundColor: colors.brand }}
                onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  colors.brandHover)
                }
                onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  colors.brand)
                }
                aria-label="Sell property"
              >
                <span className="font-semibold">Post Property</span>

                <span className="bg-white text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  FREE
                </span>
              </button>

              {!isAuthenticated ? (
                <div className="hidden md:flex space-x-2 items-center">
                  {onAuthAction ? (
                    <>
                      <button
                        onClick={() => onAuthAction('login')}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-300 border"
                        style={{
                          color: linkColor,
                          borderColor: borderColor,
                          backgroundColor: 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget;
                          el.style.backgroundColor = colors.brand;
                          el.style.color = '#ffffff';
                          el.style.borderColor = colors.brand;
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget;
                          el.style.backgroundColor = 'transparent';
                          el.style.color = linkColor;
                          el.style.borderColor = borderColor;
                        }}
                      >
                        Login
                      </button>

                      <button
                        onClick={() => onAuthAction('signup')}
                        className="text-white px-5 py-2.5 rounded-xl transition-all text-sm font-medium shadow-md hover:shadow-lg"
                        style={{ background: `linear-gradient(to right, ${colors.accent}, ${colors.navText})` }}
                      >
                        Sign Up
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="flex items-center space-x-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-300 border"
                        style={{
                          color: linkColor,
                          borderColor: borderColor,
                          backgroundColor: 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget;
                          el.style.backgroundColor = colors.brand;
                          el.style.color = '#ffffff';
                          (el.style as any).borderColor = colors.brand;
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget;
                          el.style.backgroundColor = 'transparent';
                          el.style.color = linkColor;
                          (el.style as any).borderColor = borderColor;
                        }}
                      >
                        <span>Login</span>
                      </Link>

                      <Link
                        to="/register"
                        className="text-white px-3.5 py-2.5 rounded-xl text-sm font-medium transition-shadow shadow-md hover:shadow-lg"
                        style={{ background: 'linear-gradient(to right, #072c42, #092a3a)' }} // darker accent
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.background =
                            'linear-gradient(to right, #0b3856, #0c3854)'; // slightly lighter on hover
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.background =
                            'linear-gradient(to right, #072c42, #092a3a)'; // dark default
                        }}
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to={dashboardHref}
                    className="hidden sm:flex items-center space-x-2 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-md hover:shadow-lg"
                    style={{ backgroundColor: colors.navText }}
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>

                  {/* User menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      type="button"
                      onClick={() => setIsUserDropdownOpen((s) => !s)}
                      aria-haspopup="true"
                      aria-expanded={isUserDropdownOpen}
                      className="w-10 h-10 rounded-xl flex items-center justify-center border overflow-hidden p-0.5 transition-transform hover:scale-105"
                      style={{
                        background: `linear-gradient(to right, ${colors.brand}1A, ${colors.accent}1A)`,
                        borderColor: `${colors.brand}4D`,
                      }}
                    >
                      {(user as any)?.avatar ? (
                        <img
                          src={(user as any).avatar}
                          alt={displayName}
                          className="w-full h-full object-cover rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <UserIcon size={16} style={{ color: "#E6761D" }} />
                      )}
                    </button>

                    {isUserDropdownOpen && (
                      <div className="absolute top-full right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in duration-200">
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                          {(user as any)?.avatar && (
                            <img
                              src={(user as any).avatar}
                              alt={displayName}
                              className="w-10 h-10 rounded-xl object-cover border border-orange-200 shrink-0 shadow-xs"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div className="overflow-hidden">
                            <div className="text-sm font-bold text-gray-900 truncate">{displayName}</div>
                            <div className="text-[11px] font-semibold text-[#E6761D] bg-orange-50 px-2 py-0.5 rounded-full inline-block mt-0.5 capitalize">
                              {userRole ? `${userRole} Account` : 'User'}
                            </div>
                          </div>
                        </div>

                        <button className="w-full text-left px-4 py-2.5 text-sm flex items-center space-x-3 text-gray-700 hover:text-[#E6761D] hover:bg-orange-50">
                          <span>Upgrade Plan</span>
                        </button>

                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={async () => {
                              setIsUserDropdownOpen(false);
                              await logout();
                              window.location.href = '/login';
                            }}
                            className="w-full text-left px-4 py-3 text-sm flex items-center space-x-3 text-[#E6761D] hover:bg-red-50"
                          >
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin quick access (when not logged in) */}
              {!isAuthenticated && onPageChange && (
                <button
                  onClick={() => onPageChange('admin-ai')}
                  className="hidden md:block text-xs px-3 py-2 rounded-full transition-colors border"
                  style={{
                    backgroundColor: 'rgba(230,118,29,0.10)',
                    color: colors.brandHover,
                    borderColor: 'rgba(230,118,29,0.30)',
                  }}
                >
                  Admin Panel
                </button>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen((s) => !s)}
                className={cn('lg:hidden p-2 rounded-xl transition-colors', isSolid ? 'text-gray-700' : 'text-white')}
                aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu (solid for readability) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-4 space-y-2">
              {navigationItems.map((item) => {
                const active = isActivePage(item.id, item.href);
                const base =
                  'w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-left border-b text-base';
                return item.href ? (
                  <Link
                    key={item.id}
                    to={item.href}
                    onClick={() => handleNavClick(item.id)}
                    aria-current={active ? 'page' : undefined}
                    style={{ color: active ? '#E6761D' : colors.navText }}
                    className={cn(
                      base,
                      active ? 'border-[#E6761D]' : 'border-transparent hover:text-[#E6761D] hover:border-[#E6761D]'
                    )}
                  >
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    aria-current={active ? 'page' : undefined}
                    style={{ color: active ? '#E6761D' : colors.navText }}
                    className={cn(
                      base,
                      active ? 'border-[#E6761D]' : 'border-transparent hover:text-[#E6761D] hover:border-[#E6761D]'
                    )}
                  >
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}

              <div className="pt-4 border-t border-gray-200 space-y-3">
                {/* <button
                  onClick={handleSellPropertyClick}
                  className="w-full flex items-center justify-center space-x-2 text-white px-4 py-3 rounded-xl font-medium text-sm shadow-md"
                  style={{ backgroundColor: colors.brand }}
                >
                  <span>Post Property</span>
                  <span className="bg-white text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    FREE
                  </span>
                </button> */}
                <button
                  onClick={handleSellPropertyClick}
                  className="w-full flex items-center justify-center gap-2 text-white px-4 py-3 rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all"
                  style={{ backgroundColor: colors.brand }}
                >
                  <span>Post Property</span>

                  <span className="inline-flex items-center bg-white text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
                    FREE
                  </span>
                </button>

                {!isAuthenticated ? (
                  onAuthAction ? (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => onAuthAction('login')}
                        className="flex-1 border px-4 py-3 rounded-xl font-medium text-sm transition-colors duration-300"
                        style={{ color: colors.navText, borderColor }}
                      >
                        Login
                      </button>

                      <button
                        onClick={() => onAuthAction('signup')}
                        className="flex-1 text-white px-4 py-3 rounded-xl font-medium text-sm"
                        style={{ background: `linear-gradient(to right, ${colors.accent}, ${colors.navText})` }}
                      >
                        Sign Up
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-3">
                      <Link
                        to="/login"
                        className="flex-1 text-center border px-4 py-3 rounded-xl font-medium text-sm transition-colors duration-300"
                        style={{ color: colors.navText, borderColor }}
                      >
                        Login
                      </Link>

                      <Link
                        to="/register"
                        className="flex-1 text-center text-white px-4 py-3 rounded-xl font-medium text-sm shadow-md hover:shadow-lg"
                        style={{ background: 'linear-gradient(to right, #072c42, #092a3a)' }} // dark default
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.background =
                            'linear-gradient(to right, #0b3856, #0c3854)'; // slightly lighter on hover
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.background =
                            'linear-gradient(to right, #072c42, #092a3a)'; // back to dark
                        }}
                      >
                        Get Started
                      </Link>
                    </div>
                  )
                ) : (
                  <Link
                    to={getDashboardPath()}
                    className="w-full flex items-center justify-center space-x-2 text-white px-4 py-3 rounded-xl font-medium text-sm"
                    style={{ background: `linear-gradient(to right, ${colors.accent}, ${colors.navText})` }}
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 ">
        <Outlet />
      </main>

      <PublicFooter />
    </>
  );
};

export default PublicHeader;
