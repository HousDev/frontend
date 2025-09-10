// import React, { useState, useRef, useEffect } from 'react';
// import { Link, Outlet, useLocation } from 'react-router-dom';
// import {
//   Home,
//   Building,
//   Briefcase,
//   Users,
//   FileText,
//   MessageCircle,
//   Phone,
//   Mail,
//   Star,
//   Shield,
//   ChevronDown,
//   User,
//   Menu,
//   X,
//   Settings,
//   LogOut,
//   Crown,
//   Brain,
//   LogIn,
//   Info
// } from 'lucide-react';
// import { useAuth } from '@/contexts/AuthContext';
// import { cn } from '@/lib/utils';
// import { useSystemSettings } from '@/contexts/SystemSettingsContext';
// import PublicFooter from './PublicFooter';

// const PublicHeader = ({ currentPage, onPageChange, onAuthAction }: any) => {
//   const location = useLocation();
//   const { isAuthenticated } = useAuth();
//   const { systemSettings } = useSystemSettings();

//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [openDropdown, setOpenDropdown] = useState<string | null>(null);
//   const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
//   const [isAdmin, setIsAdmin] = useState(true); // Set to true for admin access

//   const dropdownRef = useRef<HTMLDivElement | null>(null);

//   const companyName = systemSettings?.company_name || 'ResaleExpert';
//   const companyLogo = systemSettings?.company_logo;

//   // Close dropdown on outside click
//   useEffect(() => {
//     function handleClick(e: MouseEvent) {
//       if (!dropdownRef.current) return;
//       if (!dropdownRef.current.contains(e.target as Node)) {
//         setOpenDropdown(null);
//       }
//     }
//     document.addEventListener('mousedown', handleClick);
//     return () => document.removeEventListener('mousedown', handleClick);
//   }, []);

//   const navigationItems = [
//     { id: 'home', label: 'Home', href: '/', icon: Home },
//     { id: 'properties', label: 'Properties', href: '/properties', icon: Building },
//     {
//       id: 'services',
//       label: 'Services',
//       href: '/services',
//       icon: Briefcase,
      
//     },
//     { id: 'about', label: 'About', href: '/about', icon: Info },
//     { id: 'blogs', label: 'Blogs', href: '/blogs', icon: FileText },
//     { id: 'contact', label: 'Contact', href: '/contact', icon: MessageCircle }
//   ];

//   const handleNavClick = (pageId: string, href?: string) => {
//     if (onPageChange) {
//       onPageChange(pageId);
//     }
//     setIsMobileMenuOpen(false);
//     setOpenDropdown(null);
//   };

//   const isActivePage = (itemId: string, itemHref?: string) => {
//     if (currentPage) {
//       return currentPage === itemId;
//     }
//     if (itemHref) {
//       return location.pathname === itemHref;
//     }
//     return false;
//   };

//   return (
//     <>
//       {/* Compact Top Bar */}
//       <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-1.5">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between text-xs sm:text-sm">
//             <div className="flex items-center space-x-4">
//               <div className="hidden sm:flex items-center space-x-1">
//                 <Phone size={12} />
//                 <span>+91 99999 99999</span>
//               </div>
//               <div className="hidden md:flex items-center space-x-1">
//                 <Mail size={12} />
//                 <span>info@resaleexpert.in</span>
//               </div>
//             </div>
//             <div className="flex items-center space-x-3">
//               <div className="flex items-center space-x-1">
//                 <Star className="text-yellow-400 fill-current" size={12} />
//                 <span className="hidden sm:inline">4.9/5</span>
//                 <span className="sm:hidden">★4.9</span>
//               </div>
//               <div className="flex items-center space-x-1">
//                 <Shield className="text-green-400" size={12} />
//                 <span className="hidden sm:inline">Verified</span>
//                 <span className="sm:hidden">✓</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Compact Main Header */}
//       <header className="bg-white shadow-md sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-14">
//             {/* Compact Logo */}
//             <Link to="/" className="flex items-center space-x-2">
//               {companyLogo ? (
//                 <img
//                   src={companyLogo}
//                   alt="Company Logo"
//                   className="h-8 w-auto object-contain rounded-xs shadow-sm bg-white p-1"
//                 />
//               ) : (
//                 <>
//                   <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
//                     <Home className="text-white" size={18} />
//                   </div>
//                   <div className="hidden sm:block">
//                     <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                       {companyName}
//                     </h1>
//                   </div>
//                 </>
//               )}
//             </Link>

//             {/* Desktop Navigation */}
//             <nav className="hidden lg:flex items-center space-x-1" ref={dropdownRef}>
//               {navigationItems.map((item) => {
//                 const Icon = item.icon;
//                 const isActive = isActivePage(item.id, item.href);

//                 return (
//                   <div key={item.id} className="relative">
//                     {item.hasDropdown ? (
//                       <div
//                         className="relative"
//                         onMouseEnter={() => setOpenDropdown(item.id)}
//                         onMouseLeave={() => setOpenDropdown((prev) => (prev === item.id ? null : prev))}
//                       >
//                         <button
//                           type="button"
//                           aria-haspopup="true"
//                           aria-expanded={openDropdown === item.id}
//                           className={cn(
//                             'flex items-center space-x-1 px-3 py-2 rounded-lg transition-all text-sm',
//                             isActive
//                               ? 'bg-blue-50 text-blue-600'
//                               : 'text-gray-600 hover:bg-gray-50'
//                           )}
//                         >
//                           <Icon size={16} />
//                           <span className="font-medium">{item.label}</span>
//                           <ChevronDown size={14} className={`transition-transform ${openDropdown === item.id ? 'rotate-180' : ''}`} />
//                         </button>

                       
//                       </div>
//                     ) : (
//                       item.href ? (
//                         <Link
//                           to={item.href}
//                           onClick={() => handleNavClick(item.id, item.href)}
//                           className={cn(
//                             'flex items-center space-x-1 px-3 py-2 rounded-lg transition-all text-sm',
//                             isActive
//                               ? 'bg-blue-50 text-blue-600'
//                               : 'text-gray-600 hover:bg-gray-50'
//                           )}
//                         >
//                           <Icon size={16} />
//                           <span className="font-medium">{item.label}</span>
//                         </Link>
//                       ) : (
//                         <button
//                           onClick={() => handleNavClick(item.id)}
//                           className={cn(
//                             'flex items-center space-x-1 px-3 py-2 rounded-lg transition-all text-sm',
//                             isActive
//                               ? 'bg-blue-50 text-blue-600'
//                               : 'text-gray-600 hover:bg-gray-50'
//                           )}
//                         >
//                           <Icon size={16} />
//                           <span className="font-medium">{item.label}</span>
//                         </button>
//                       )
//                     )}
//                   </div>
//                 );
//               })}

             
//             </nav>

//             {/* Action Buttons */}
//             <div className="flex items-center space-x-2">
//               <button
//                 onClick={() => onAuthAction && onAuthAction('sell')}
//                 className="hidden sm:block bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all text-sm font-medium"
//               >
//                 Sell Property
//               </button>

//               {!isAuthenticated ? (
//                 <div className="hidden md:flex space-x-2">
//                   {onAuthAction ? (
//                     <>
//                       <button
//                         onClick={() => onAuthAction('login')}
//                         className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all text-sm font-medium"
//                       >
//                         Login
//                       </button>
//                       <button
//                         onClick={() => onAuthAction('signup')}
//                         className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm font-medium"
//                       >
//                         Sign Up
//                       </button>
//                     </>
//                   ) : (
//                     <>
//                       <Link
//                         to="/login"
//                         className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
//                       >
//                         <LogIn className="h-4 w-4" />
//                         <span>Login</span>
//                       </Link>
//                       <Link
//                         to="/register"
//                         className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
//                       >
//                         Get Started
//                       </Link>
//                     </>
//                   )}
//                 </div>
//               ) : (
//                 <div className="flex items-center space-x-4">
//                   <Link
//                     to="/dashboard"
//                     className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
//                   >
//                     <User className="h-4 w-4" />
//                     <span>Dashboard</span>
//                   </Link>

//                   <div
//                     className="relative"
//                     onMouseEnter={() => setIsUserDropdownOpen(true)}
//                     onMouseLeave={() => setIsUserDropdownOpen(false)}
//                   >
//                     <button className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
//                       <User className="text-blue-600" size={16} />
//                     </button>
//                     {isUserDropdownOpen && (
//                       <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
//                         <div className="px-4 py-2 border-b border-gray-100">
//                           <div className="text-sm font-medium text-gray-900">John Doe</div>
//                           <div className="text-xs text-gray-600">{isAdmin ? 'Admin User' : 'Premium Member'}</div>
//                         </div>
//                         {isAdmin && (
//                           <>
//                             <button
//                               onClick={() => onPageChange && onPageChange('admin-ai')}
//                               className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center space-x-2"
//                             >
//                               <Brain size={14} />
//                               <span>AI Training Panel</span>
//                             </button>
//                             <button
//                               onClick={() => onPageChange && onPageChange('admin-dashboard')}
//                               className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center space-x-2"
//                             >
//                               <Settings size={14} />
//                               <span>Admin Dashboard</span>
//                             </button>
//                           </>
//                         )}
//                         <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center space-x-2">
//                           <Crown size={14} />
//                           <span>Upgrade Plan</span>
//                         </button>
//                         <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center space-x-2">
//                           <Settings size={14} />
//                           <span>Settings</span>
//                         </button>
//                         <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center space-x-2 text-red-600">
//                           <LogOut size={14} />
//                           <span>Logout</span>
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* Admin Quick Access (when not logged in) */}
//               {!isAuthenticated && onPageChange && (
//                 <button
//                   onClick={() => onPageChange('admin-ai')}
//                   className="hidden md:block text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
//                 >
//                   Admin Panel
//                 </button>
//               )}

//               {/* Mobile Menu Button */}
//               <button
//                 onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//                 className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50"
//               >
//                 {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Mobile Menu */}
//         {isMobileMenuOpen && (
//           <div className="lg:hidden bg-white border-t border-gray-200">
//             <div className="px-4 py-3 space-y-1">
//               {navigationItems.map((item) => {
//                 const Icon = item.icon;
//                 const isActive = isActivePage(item.id, item.href);
//                 return item.href ? (
//                   <Link
//                     key={item.id}
//                     to={item.href}
//                     onClick={() => handleNavClick(item.id, item.href)}
//                     className={cn(
//                       'w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left',
//                       isActive
//                         ? 'bg-blue-50 text-blue-600'
//                         : 'text-gray-600 hover:bg-gray-50'
//                     )}
//                   >
//                     <Icon size={18} />
//                     <span className="font-medium">{item.label}</span>
//                   </Link>
//                 ) : (
//                   <button
//                     key={item.id}
//                     onClick={() => handleNavClick(item.id)}
//                     className={cn(
//                       'w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left',
//                       isActive
//                         ? 'bg-blue-50 text-blue-600'
//                         : 'text-gray-600 hover:bg-gray-50'
//                     )}
//                   >
//                     <Icon size={18} />
//                     <span className="font-medium">{item.label}</span>
//                   </button>
//                 );
//               })}

//               <div className="pt-3 border-t border-gray-200 space-y-2">
//                 <button
//                   onClick={() => onAuthAction && onAuthAction('sell')}
//                   className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-lg font-medium text-sm"
//                 >
//                   Sell Property
//                 </button>

//                 {!isAuthenticated ? (
//                   onAuthAction ? (
//                     <div className="flex space-x-2">
//                       <button
//                         onClick={() => onAuthAction('login')}
//                         className="flex-1 border border-blue-600 text-blue-600 px-3 py-2 rounded-lg font-medium text-sm"
//                       >
//                         Login
//                       </button>
//                       <button
//                         onClick={() => onAuthAction('signup')}
//                         className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg font-medium text-sm"
//                       >
//                         Sign Up
//                       </button>
//                     </div>
//                   ) : (
//                     <div className="flex space-x-2">
//                       <Link
//                         to="/login"
//                         className="flex-1 text-center border border-blue-600 text-blue-600 px-3 py-2 rounded-lg font-medium text-sm"
//                       >
//                         Login
//                       </Link>
//                       <Link
//                         to="/register"
//                         className="flex-1 text-center bg-blue-600 text-white px-3 py-2 rounded-lg font-medium text-sm"
//                       >
//                         Get Started
//                       </Link>
//                     </div>
//                   )
//                 ) : (
//                   <Link
//                     to="/dashboard"
//                     className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg font-medium text-sm"
//                   >
//                     <User size={16} />
//                     <span>Dashboard</span>
//                   </Link>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//       </header>
//       {/* Main content */}
//       <main className="flex-1">
//         <Outlet />
//       </main>
//       {/* Footer */}
//       <PublicFooter />
//     </>
//   );
// };

// export default PublicHeader;

import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Home,
  Building,
  Briefcase,
  Users,
  FileText,
  MessageCircle,
  Phone,
  Mail,
  Star,
  Shield,
  ChevronDown,
  User,
  Menu,
  X,
  Settings,
  LogOut,
  Crown,
  Brain,
  LogIn,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';
import PublicFooter from './PublicFooter';
import PublicSellPropertyForm from './PublicSellPropertyForm';





const PublicHeader = ({ currentPage, onPageChange, onAuthAction }: any) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { systemSettings } = useSystemSettings();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true); // Set to true for admin access

  // Add state for the seller modal
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const companyName = systemSettings?.company_name || 'ResaleExpert';
  const companyLogo = systemSettings?.company_logo;

  // Close dropdown on outside click
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

  const navigationItems = [
    { id: 'home', label: 'Home', href: '/', icon: Home },
    { id: 'properties', label: 'Properties', href: '/properties', icon: Building },
    {
      id: 'services',
      label: 'Services',
      href: '/services',
      icon: Briefcase,
    },
    { id: 'about', label: 'About', href: '/about', icon: Info },
    { id: 'blogs', label: 'Blogs', href: '/blogs', icon: FileText },
    { id: 'contact', label: 'Contact', href: '/contact', icon: MessageCircle }
  ];

  const handleNavClick = (pageId: string, href?: string) => {
    if (onPageChange) {
      onPageChange(pageId);
    }
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-1.5">
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
                <Star className="text-yellow-400 fill-current" size={12} />
                <span className="hidden sm:inline">4.9/5</span>
                <span className="sm:hidden">★4.9</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="text-green-400" size={12} />
                <span className="hidden sm:inline">Verified</span>
                <span className="sm:hidden">✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Main Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Compact Logo */}
            <Link to="/" className="flex items-center space-x-2">
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt="Company Logo"
                  className="h-8 w-auto object-contain rounded-xs shadow-sm bg-white p-1"
                />
              ) : (
                <>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Home className="text-white" size={18} />
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
                          className={cn(
                            'flex items-center space-x-1 px-3 py-2 rounded-lg transition-all text-sm',
                            isActive
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-600 hover:bg-gray-50'
                          )}
                        >
                          <Icon size={16} />
                          <span className="font-medium">{item.label}</span>
                          <ChevronDown size={14} className={`transition-transform ${openDropdown === item.id ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    ) : (
                      item.href ? (
                        <Link
                          to={item.href}
                          onClick={() => handleNavClick(item.id, item.href)}
                          className={cn(
                            'flex items-center space-x-1 px-3 py-2 rounded-lg transition-all text-sm',
                            isActive
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-600 hover:bg-gray-50'
                          )}
                        >
                          <Icon size={16} />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleNavClick(item.id)}
                          className={cn(
                            'flex items-center space-x-1 px-3 py-2 rounded-lg transition-all text-sm',
                            isActive
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-600 hover:bg-gray-50'
                          )}
                        >
                          <Icon size={16} />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      )
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSellPropertyClick}
                className="hidden sm:block bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all text-sm font-medium"
              >
                Sell Property
              </button>

              {!isAuthenticated ? (
                <div className="hidden md:flex space-x-2">
                  {onAuthAction ? (
                    <>
                      <button
                        onClick={() => onAuthAction('login')}
                        className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all text-sm font-medium"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => onAuthAction('signup')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm font-medium"
                      >
                        Sign Up
                      </button>
                    </>
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
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>

                  <div
                    className="relative"
                    onMouseEnter={() => setIsUserDropdownOpen(true)}
                    onMouseLeave={() => setIsUserDropdownOpen(false)}
                  >
                    <button className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="text-blue-600" size={16} />
                    </button>
                    {isUserDropdownOpen && (
                      <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <div className="text-sm font-medium text-gray-900">John Doe</div>
                          <div className="text-xs text-gray-600">{isAdmin ? 'Admin User' : 'Premium Member'}</div>
                        </div>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => onPageChange && onPageChange('admin-ai')}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center space-x-2"
                            >
                              <Brain size={14} />
                              <span>AI Training Panel</span>
                            </button>
                            <button
                              onClick={() => onPageChange && onPageChange('admin-dashboard')}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center space-x-2"
                            >
                              <Settings size={14} />
                              <span>Admin Dashboard</span>
                            </button>
                          </>
                        )}
                        <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center space-x-2">
                          <Crown size={14} />
                          <span>Upgrade Plan</span>
                        </button>
                        <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center space-x-2">
                          <Settings size={14} />
                          <span>Settings</span>
                        </button>
                        <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm flex items-center space-x-2 text-red-600">
                          <LogOut size={14} />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Quick Access (when not logged in) */}
              {!isAuthenticated && onPageChange && (
                <button
                  onClick={() => onPageChange('admin-ai')}
                  className="hidden md:block text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
                >
                  Admin Panel
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-3 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePage(item.id, item.href);
                return item.href ? (
                  <Link
                    key={item.id}
                    to={item.href}
                    onClick={() => handleNavClick(item.id, item.href)}
                    className={cn(
                      'w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left',
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      'w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left',
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <Icon size={18} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}

              <div className="pt-3 border-t border-gray-200 space-y-2">
                <button
                  onClick={handleSellPropertyClick}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-lg font-medium text-sm"
                >
                  Sell Property
                </button>

                {!isAuthenticated ? (
                  onAuthAction ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onAuthAction('login')}
                        className="flex-1 border border-blue-600 text-blue-600 px-3 py-2 rounded-lg font-medium text-sm"
                      >
                        Login
                      </button>
                      <button
                        onClick={() => onAuthAction('signup')}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg font-medium text-sm"
                      >
                        Sign Up
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <Link
                        to="/login"
                        className="flex-1 text-center border border-blue-600 text-blue-600 px-3 py-2 rounded-lg font-medium text-sm"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="flex-1 text-center bg-blue-600 text-white px-3 py-2 rounded-lg font-medium text-sm"
                      >
                        Get Started
                      </Link>
                    </div>
                  )
                ) : (
                  <Link
                    to="/dashboard"
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg font-medium text-sm"
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