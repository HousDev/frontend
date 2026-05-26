// import React, { useState } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { Building, Eye, EyeOff, Sparkles, Shield, Zap } from 'lucide-react';
// import { useAuth } from '@/contexts/AuthContext';
// import Button from '@/components/ui/Button';
// import Input from '@/components/ui/Input';
// import { toast } from 'react-toastify';
// import { useSystemSettings } from '@/contexts/SystemSettingsContext';

// interface User {
//   id: string | number;
//   username: string;
//   email: string;
//   first_name: string;
//   last_name: string;
//   role: 'admin' | 'manager' | 'agent' | 'buyer' | 'seller' | 'team leader' | 'sales team leader' | 'presales team leader' | 'sales manager' | 'marketing executive' | 'presales executive' | 'sales executive';
//   phone?: string;
//   avatar?: string;
//   is_active: boolean;
//   buyer_id?: number | string;
//   seller_id?: number | string;
// }

// interface LoginFormData {
//   username: string;
//   password: string;
// }

// const LoginPage: React.FC = () => {
//   const [formData, setFormData] = useState<LoginFormData>({
//     username: '',
//     password: '',
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const from = (location.state as any)?.from?.pathname || '/dashboard';

//   const { systemSettings } = useSystemSettings();
//   const companyName = systemSettings?.company_name;

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   const validateForm = (): boolean => {
//     const newErrors: Record<string, string> = {};
//     if (!formData.username.trim()) newErrors.username = 'Username is required';
//     if (!formData.password) newErrors.password = 'Password is required';
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     setLoading(true);
//     try {
//       const response = (await login(formData)) as unknown as User;
//       const user = response;
//       if (!user) {
//         toast.error('Invalid login response');
//         return;
//       }

//       const role = (user.role ?? '').toString().trim().toLowerCase();

//       console.log('Login user:', user);
//       console.log('Normalized role:', role);

//       if (role === 'buyer' && user.buyer_id) {
//         navigate(`/buyer-dashboard/${user.buyer_id}`, { replace: true });
//         return;
//       }
//       if (role === 'seller' && user.seller_id) {
//         navigate(`/seller-dashboard/${user.seller_id}`, { replace: true });
//         return;
//       }

//       const generalRoles = ['marketing executive', 'sales executive', 'presales executive'];
//       if (generalRoles.includes(role)) {
//         navigate(from || '/dashboard', { replace: true });
//         return;
//       }

//       navigate(from || '/dashboard', { replace: true });

//     } catch (err: any) {
//       toast.error(err?.message || 'Login failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
//       {/* Modern Background Effects */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl"></div>
//         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl"></div>
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl"></div>
//       </div>

//       {/* Grid Pattern Overlay */}
//       <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>

//       <div className="relative w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 z-10">
//         {/* Left Side - Welcome Content - Hidden on mobile, shown on desktop */}
//         <div className="hidden lg:block flex-1 text-center lg:text-left space-y-8 px-4">
//           <div className="space-y-6">
//             <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm rounded-full border border-indigo-500/20">
//               <Sparkles className="h-4 w-4 text-indigo-400" />
//               <span className="text-sm font-medium text-indigo-300">AI-Powered CRM Platform</span>
//             </div>

//             <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
//               Welcome to
//               <span className="block mt-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent">
//                 {companyName}
//               </span>
//             </h1>

//             <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
//               Transform your real estate business with intelligent automation,
//               streamlined workflows, and data-driven insights.
//             </p>
//           </div>

//           {/* Feature highlights */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
//             {[
//               { icon: Shield, title: 'Secure', desc: 'Enterprise-grade security', color: 'from-emerald-500 to-teal-500' },
//               { icon: Zap, title: 'Fast', desc: 'Lightning-quick responses', color: 'from-amber-500 to-orange-500' },
//               { icon: Sparkles, title: 'Smart', desc: 'AI-powered insights', color: 'from-indigo-500 to-purple-500' },
//             ].map((feat, i) => (
//               <div key={i} className="group p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
//                 <div className={`inline-flex p-3 bg-gradient-to-r ${feat.color} rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300`}>
//                   <feat.icon className="h-6 w-6 text-white" />
//                 </div>
//                 <h3 className="font-semibold text-white text-base mb-1">{feat.title}</h3>
//                 <p className="text-sm text-slate-400">{feat.desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Right Side - Login Form (visible on all screen sizes) */}
//         <div className="w-full max-w-md">
//           <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8 hover:bg-white/[0.07] transition-all duration-300">
//             {/* Header */}
//             <div className="text-center mb-8">
//               <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/50">
//                 <Building className="h-8 w-8 text-white" />
//               </div>
//               <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
//               <p className="text-sm text-slate-400">Sign in to continue to your account</p>
//             </div>

//             {/* Login Form */}
//             <form className="space-y-5" onSubmit={handleSubmit}>
//               <div className="space-y-4">
//                 <Input
//                   label="Username"
//                   name="username"
//                   type="text"
//                   autoComplete="username"
//                   value={formData.username}
//                   onChange={handleChange}
//                   error={errors.username}
//                   placeholder="Enter your username"
//                   className="bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-indigo-400 focus:ring-indigo-400/20"
//                 />

//                 <div className="relative">
//                   <Input
//                     label="Password"
//                     name="password"
//                     type={showPassword ? 'text' : 'password'}
//                     autoComplete="current-password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     error={errors.password}
//                     placeholder="Enter your password"
//                     className="bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-indigo-400 focus:ring-indigo-400/20"
//                   />
//                   <button
//                     type="button"
//                     className="absolute right-3 top-9 text-slate-400 hover:text-indigo-400 transition-colors"
//                     onClick={() => setShowPassword(!showPassword)}
//                   >
//                     {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//                   </button>
//                 </div>
//               </div>

//               <div className="flex items-center justify-between text-sm">
//                 <label className="flex items-center cursor-pointer group">
//                   <input
//                     type="checkbox"
//                     className="h-4 w-4 text-indigo-500 focus:ring-indigo-400 border-white/30 rounded bg-white/10 cursor-pointer"
//                   />
//                   <span className="ml-2 text-slate-300 group-hover:text-white transition-colors">Remember me</span>
//                 </label>
//                 <a href="#" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
//                   Forgot password?
//                 </a>
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-0 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-indigo-500/30 hover:shadow-indigo-50"
//                 loading={loading}
//                 disabled={loading}
//               >
//                 {loading ? 'Signing in...' : 'Sign In'}
//               </Button>
//             </form>

//             {/* Footer Links */}
//             <div className="mt-8 space-y-4 text-center">
//               <div className="pt-3 border-t border-white/10">
//                 {/* <span className="text-slate-400 text-sm">Don't have an account? </span> */}
//                 {/* <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Sign up</Link> */}
//               </div>
//               <div>
//                 <Link
//                   to="/"
//                   className="text-sm text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2 group"
//                 >
//                   <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
//                   Back to website
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { Eye, EyeOff, Building } from 'lucide-react';
// import { useAuth } from '@/contexts/AuthContext';
// import { toast } from 'react-toastify';
// import { useSystemSettings } from '@/contexts/SystemSettingsContext';

// interface User {
//   id: string | number;
//   username: string;
//   email: string;
//   first_name: string;
//   last_name: string;
//   role: 'admin' | 'manager' | 'agent' | 'buyer' | 'seller' | 'team leader' | 'sales team leader' | 'presales team leader' | 'sales manager' | 'marketing executive' | 'presales executive' | 'sales executive';
//   phone?: string;
//   avatar?: string;
//   is_active: boolean;
//   buyer_id?: number | string;
//   seller_id?: number | string;
// }

// interface LoginFormData {
//   username: string;
//   password: string;
// }

// const SLIDES = [
//   {
//     img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
//     title: 'Find your sweet home',
//     sub: 'Schedule a visit in just a few clicks',
//   },
//   {
//     img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
//     title: 'Luxury living awaits',
//     sub: 'Discover premium properties curated for you',
//   },
//   {
//     img: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=900&q=80',
//     title: 'Your dream, our mission',
//     sub: 'Intelligent CRM for modern real estate',
//   },
// ];

// const LoginPage: React.FC = () => {
//   const [formData, setFormData] = useState<LoginFormData>({ username: '', password: '' });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [slide, setSlide] = useState(0);
//   const [fadeIn, setFadeIn] = useState(true);

//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const from = (location.state as any)?.from?.pathname || '/dashboard';
//   const { systemSettings } = useSystemSettings();
//   const companyName = systemSettings?.company_name;

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setFadeIn(false);
//       setTimeout(() => {
//         setSlide(s => (s + 1) % SLIDES.length);
//         setFadeIn(true);
//       }, 400);
//     }, 4000);
//     return () => clearInterval(timer);
//   }, []);

//   const goToSlide = (i: number) => {
//     if (i === slide) return;
//     setFadeIn(false);
//     setTimeout(() => { setSlide(i); setFadeIn(true); }, 400);
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   const validateForm = (): boolean => {
//     const newErrors: Record<string, string> = {};
//     if (!formData.username.trim()) newErrors.username = 'Username is required';
//     if (!formData.password) newErrors.password = 'Password is required';
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validateForm()) return;
//     setLoading(true);
//     try {
//       const response = (await login(formData)) as unknown as User;
//       const user = response;
//       if (!user) { toast.error('Invalid login response'); return; }
//       const role = (user.role ?? '').toString().trim().toLowerCase();
//       if (role === 'buyer' && user.buyer_id) { navigate(`/buyer-dashboard/${user.buyer_id}`, { replace: true }); return; }
//       if (role === 'seller' && user.seller_id) { navigate(`/seller-dashboard/${user.seller_id}`, { replace: true }); return; }
//       const generalRoles = ['marketing executive', 'sales executive', 'presales executive'];
//       if (generalRoles.includes(role)) { navigate(from || '/dashboard', { replace: true }); return; }
//       navigate(from || '/dashboard', { replace: true });
//     } catch (err: any) {
//       toast.error(err?.message || 'Login failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const current = SLIDES[slide];

//   return (
//     <>
//       <style>{`
//         *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

//         .lp-root {
//           min-height: 100vh;
//           display: flex;
//           background: #edeae4;
//           font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//           overflow: hidden;
//         }

//         /* ══ LEFT PANEL with curved right edge ══ */
//         .lp-left {
//           position: relative;
//           flex: 0 0 46%;
//           min-height: 100vh;
//           overflow: hidden;
//           display: flex;
//           flex-direction: column;
//           justify-content: space-between;
//           border-radius: 0 56px 56px 0;
//           z-index: 2;
//           box-shadow: 12px 0 48px rgba(0,0,0,0.22);
//         }

//         /* Slide images stacked, toggled by opacity */
//         .lp-slide-img {
//           position: absolute;
//           inset: 0;
//           width: 100%;
//           height: 100%;
//           object-fit: cover;
//           object-position: center;
//           transition: opacity 0.45s ease;
//         }
//         .lp-slide-img.hidden { opacity: 0; }
//         .lp-slide-img.visible { opacity: 1; }

//         .lp-overlay {
//           position: absolute;
//           inset: 0;
//           background: linear-gradient(
//             160deg,
//             rgba(6,6,16,0.30) 0%,
//             rgba(6,6,16,0.06) 38%,
//             rgba(6,6,16,0.75) 100%
//           );
//           border-radius: inherit;
//         }

//         /* Brand top */
//         .lp-brand {
//           position: relative;
//           z-index: 3;
//           padding: 34px 38px;
//           display: flex;
//           align-items: center;
//           gap: 10px;
//         }

//         .lp-brand-icon {
//           width: 42px;
//           height: 42px;
//           background: rgba(255,255,255,0.16);
//           backdrop-filter: blur(10px);
//           border: 1px solid rgba(255,255,255,0.32);
//           border-radius: 13px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         }

//         .lp-brand-name {
//           font-size: 18px;
//           font-weight: 700;
//           color: #fff;
//           letter-spacing: 0.01em;
//         }

//         /* Caption bottom */
//         .lp-caption {
//           position: relative;
//           z-index: 3;
//           padding: 36px 42px 44px;
//         }

//         .lp-live-badge {
//           display: inline-flex;
//           align-items: center;
//           gap: 7px;
//           padding: 5px 13px;
//           background: rgba(255,255,255,0.14);
//           backdrop-filter: blur(8px);
//           border: 1px solid rgba(255,255,255,0.22);
//           border-radius: 999px;
//           margin-bottom: 16px;
//         }

//         .lp-live-dot {
//           width: 7px; height: 7px;
//           border-radius: 50%;
//           background: #4ade80;
//           animation: lp-blink 2s infinite;
//         }

//         @keyframes lp-blink {
//           0%,100% { opacity:1; transform:scale(1); }
//           50% { opacity:0.5; transform:scale(0.8); }
//         }

//         .lp-live-text {
//           font-size: 11px;
//           font-weight: 600;
//           color: rgba(255,255,255,0.88);
//           letter-spacing: 0.06em;
//           text-transform: uppercase;
//         }

//         .lp-slide-title {
//           font-size: clamp(24px, 3vw, 38px);
//           font-weight: 800;
//           color: #fff;
//           line-height: 1.18;
//           letter-spacing: -0.02em;
//           margin-bottom: 10px;
//           transition: opacity 0.4s ease;
//         }

//         .lp-slide-title.hidden { opacity: 0; }
//         .lp-slide-title.visible { opacity: 1; }

//         .lp-slide-sub {
//           font-size: 14px;
//           color: rgba(255,255,255,0.65);
//           line-height: 1.55;
//           margin-bottom: 26px;
//           max-width: 270px;
//           transition: opacity 0.4s ease;
//         }

//         .lp-slide-sub.hidden { opacity: 0; }
//         .lp-slide-sub.visible { opacity: 1; }

//         .lp-dots { display: flex; gap: 7px; align-items: center; }

//         .lp-dot {
//           height: 4px;
//           border-radius: 3px;
//           background: rgba(255,255,255,0.32);
//           cursor: pointer;
//           transition: width 0.35s ease, background 0.35s ease;
//           width: 20px;
//         }

//         .lp-dot.active { width: 42px; background: #fff; }

//         /* ══ RIGHT PANEL ══ */
//         .lp-right {
//           flex: 1;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           padding: 48px 36px;
//           position: relative;
//           overflow: hidden;
//         }

//         /* Soft radial glow */
//         .lp-right::before {
//           content: '';
//           position: absolute;
//           top: -100px; right: -100px;
//           width: 380px; height: 380px;
//           border-radius: 50%;
//           background: radial-gradient(circle, rgba(193,163,120,0.13) 0%, transparent 70%);
//           pointer-events: none;
//         }

//         .lp-right::after {
//           content: '';
//           position: absolute;
//           bottom: -80px; left: 0;
//           width: 280px; height: 280px;
//           border-radius: 50%;
//           background: radial-gradient(circle, rgba(100,120,180,0.07) 0%, transparent 70%);
//           pointer-events: none;
//         }

//         /* ── THE CARD ── */
//         .lp-card {
//           width: 100%;
//           max-width: 415px;
//           background: #ffffff;
//           border-radius: 28px;
//           padding: 44px 40px 36px;
//           position: relative;
//           z-index: 1;
//           box-shadow:
//             0 1px 2px rgba(0,0,0,0.03),
//             0 4px 16px rgba(0,0,0,0.07),
//             0 20px 56px rgba(0,0,0,0.08);
//         }

//         /* Gold top accent bar */
//         .lp-card::before {
//           content: '';
//           position: absolute;
//           top: 0; left: 36px; right: 36px;
//           height: 3.5px;
//           background: linear-gradient(90deg, transparent, #E8720C 30%, #E8720C 60%, #E8720C 80%, transparent);
//           border-radius: 0 0 6px 6px;
//         }

//         /* Corner accent circles */
//         .lp-card::after {
//           content: '';
//           position: absolute;
//           bottom: -1px; right: -1px;
//           width: 80px; height: 80px;
//           border-radius: 28px 0 28px 0;
//           background: linear-gradient(135deg, transparent 60%, rgba(193,163,120,0.08) 100%);
//           pointer-events: none;
//         }

//         .lp-card-icon {
//           width: 52px; height: 52px;
//           background: linear-gradient(135deg, #16162a 0%, #2a2a4a 100%);
//           border-radius: 16px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           margin-bottom: 20px;
//           box-shadow: 0 6px 22px rgba(22,22,42,0.32);
//         }

//         .lp-heading {
//           font-size: 23px;
//           font-weight: 800;
//           color: #111;
//           letter-spacing: -0.025em;
//           margin-bottom: 4px;
//         }

//         .lp-subheading {
//           font-size: 13.5px;
//           color: #9a9a9a;
//           font-weight: 400;
//           margin-bottom: 30px;
//         }

//         /* Fields */
//         .lp-field { margin-bottom: 17px; }

//         .lp-label {
//           display: block;
//           font-size: 11px;
//           font-weight: 700;
//           color: #555;
//           letter-spacing: 0.08em;
//           text-transform: uppercase;
//           margin-bottom: 7px;
//         }

//         .lp-input-wrap { position: relative; }

//         .lp-input {
//           width: 100%;
//           padding: 13px 16px;
//           border: 1.5px solid #ece8e0;
//           border-radius: 14px;
//           font-family: inherit;
//           font-size: 14.5px;
//           color: #111;
//           background: #faf8f5;
//           outline: none;
//           transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
//         }

//         .lp-input::placeholder { color: #c0bab0; }

//         .lp-input:focus {
//           border-color: #c1a378;
//           background: #fff;
//           box-shadow: 0 0 0 3.5px rgba(193,163,120,0.15);
//         }

//         .lp-input.err {
//           border-color: #e05555;
//           box-shadow: 0 0 0 3px rgba(224,85,85,0.12);
//         }

//         .lp-field-err { font-size: 12px; color: #e05555; margin-top: 5px; }

//         .lp-eye {
//           position: absolute;
//           right: 13px; top: 50%;
//           transform: translateY(-50%);
//           background: none; border: none;
//           cursor: pointer; color: #c0bab0;
//           display: flex; align-items: center;
//           padding: 4px;
//           transition: color 0.2s;
//         }

//         .lp-eye:hover { color: #c1a378; }

//         /* Remember + Forgot */
//         .lp-meta {
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           margin: 8px 0 26px;
//         }

//         .lp-remember { display: flex; align-items: center; gap: 7px; cursor: pointer; }
//         .lp-chk { width: 15px; height: 15px; accent-color: #c1a378; cursor: pointer; }
//         .lp-remember span { font-size: 13px; color: #666; }

//         .lp-forgot {
//           font-size: 13px; font-weight: 500;
//           color: #c1a378; text-decoration: none;
//           transition: color 0.2s;
//         }
//         .lp-forgot:hover { color: #9a7040; }

//         /* Submit */
//         .lp-btn {
//           width: 100%;
//           padding: 14.5px;
//           background: linear-gradient(135deg, #16162a 0%, #2a2a4a 100%);
//           color: #fff;
//           border: none;
//           border-radius: 14px;
//           font-family: inherit;
//           font-size: 15px;
//           font-weight: 700;
//           letter-spacing: 0.03em;
//           cursor: pointer;
//           position: relative;
//           overflow: hidden;
//           transition: transform 0.15s, box-shadow 0.2s;
//           box-shadow: 0 5px 20px rgba(22,22,42,0.30);
//         }

//         .lp-btn::before {
//           content: '';
//           position: absolute;
//           inset: 0;
//           background: linear-gradient(135deg, rgba(255,255,255,0.07) 0%, transparent 55%);
//           pointer-events: none;
//         }

//         .lp-btn:hover:not(:disabled) {
//           transform: translateY(-2px);
//           box-shadow: 0 10px 32px rgba(22,22,42,0.38);
//         }

//         .lp-btn:active:not(:disabled) { transform: translateY(0); }
//         .lp-btn:disabled { opacity: 0.6; cursor: not-allowed; }

//         /* Divider */
//         .lp-divider { display: flex; align-items: center; gap: 10px; margin: 22px 0 16px; }
//         .lp-div-line { flex: 1; height: 1px; background: #ece8e0; }
//         .lp-div-txt { font-size: 11.5px; color: #c0bab0; white-space: nowrap; letter-spacing: 0.04em; }

//         /* Back link */
//         .lp-back { display: flex; justify-content: center; }

//         .lp-back-link {
//           font-size: 13px; color: #aaa;
//           text-decoration: none;
//           display: inline-flex; align-items: center; gap: 5px;
//           transition: color 0.2s;
//         }

//         .lp-back-link:hover { color: #555; }
//         .lp-back-arr { transition: transform 0.2s; }
//         .lp-back-link:hover .lp-back-arr { transform: translateX(-3px); }

//         /* ══ MOBILE ══ */
//         @media (max-width: 820px) {
//           .lp-root { flex-direction: column; background: #f0ede8; }

//           .lp-left {
//             flex: 0 0 255px;
//             min-height: 255px;
//             border-radius: 0 0 48px 48px;
//             box-shadow: 0 10px 36px rgba(0,0,0,0.2);
//           }

//           .lp-brand { padding: 22px 26px; }
//           .lp-caption { padding: 18px 28px 30px; }
//           .lp-slide-sub { display: none; }
//           .lp-slide-title { font-size: 22px; }

//           .lp-right { padding: 28px 18px 44px; }

//           .lp-card { padding: 32px 22px 28px; border-radius: 22px; }
//           .lp-heading { font-size: 20px; }
//         }

//         @media (max-width: 420px) {
//           .lp-left { flex: 0 0 210px; }
//           .lp-slide-title { font-size: 19px; }
//           .lp-card { padding: 26px 16px 24px; }
//           .lp-card-icon { width: 44px; height: 44px; }
//         }
//       `}</style>

//       <div className="lp-root">

//         {/* ══ LEFT SLIDER ══ */}
//         <div className="lp-left">
//           {SLIDES.map((s, i) => (
//             <img
//               key={i}
//               src={s.img}
//               alt="Property"
//               className={`lp-slide-img ${i === slide ? 'visible' : 'hidden'}`}
//             />
//           ))}
//           <div className="lp-overlay" />

//           <div className="lp-brand">
//             <div className="lp-brand-icon">
//               <Building size={20} color="#fff" strokeWidth={1.8} />
//             </div>
//             <span className="lp-brand-name">{companyName || 'Realnest'}</span>
//           </div>

//           <div className="lp-caption">
//             <div className="lp-live-badge">
//               <div className="lp-live-dot" />
//               <span className="lp-live-text">Live listings</span>
//             </div>

//             <h2 className={`lp-slide-title ${fadeIn ? 'visible' : 'hidden'}`}>
//               {current.title}
//             </h2>
//             <p className={`lp-slide-sub ${fadeIn ? 'visible' : 'hidden'}`}>
//               {current.sub}
//             </p>

//             <div className="lp-dots">
//               {SLIDES.map((_, i) => (
//                 <div
//                   key={i}
//                   className={`lp-dot${i === slide ? ' active' : ''}`}
//                   onClick={() => goToSlide(i)}
//                 />
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* ══ RIGHT ══ */}
//         <div className="lp-right">
//           <div className="lp-card">

            

//             <h1 className="lp-heading">Welcome back!</h1>
//             <p className="lp-subheading">Sign in to continue to your account</p>

//             <form onSubmit={handleSubmit} noValidate>

//               <div className="lp-field">
//                 <label className="lp-label" htmlFor="lp-username">Username</label>
//                 <div className="lp-input-wrap">
//                   <input
//                     id="lp-username"
//                     name="username"
//                     type="text"
//                     autoComplete="username"
//                     value={formData.username}
//                     onChange={handleChange}
//                     placeholder="Enter your username"
//                     className={`lp-input${errors.username ? ' err' : ''}`}
//                   />
//                 </div>
//                 {errors.username && <p className="lp-field-err">{errors.username}</p>}
//               </div>

//               <div className="lp-field">
//                 <label className="lp-label" htmlFor="lp-password">Password</label>
//                 <div className="lp-input-wrap">
//                   <input
//                     id="lp-password"
//                     name="password"
//                     type={showPassword ? 'text' : 'password'}
//                     autoComplete="current-password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     placeholder="••••••••"
//                     className={`lp-input${errors.password ? ' err' : ''}`}
//                     style={{ paddingRight: '44px' }}
//                   />
//                   <button
//                     type="button"
//                     className="lp-eye"
//                     onClick={() => setShowPassword(!showPassword)}
//                     aria-label={showPassword ? 'Hide password' : 'Show password'}
//                   >
//                     {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
//                   </button>
//                 </div>
//                 {errors.password && <p className="lp-field-err">{errors.password}</p>}
//               </div>

//               <div className="lp-meta">
//                 <label className="lp-remember">
//                   <input type="checkbox" className="lp-chk" />
//                   <span>Remember me</span>
//                 </label>
//                 <a href="#" className="lp-forgot">Forgot password?</a>
//               </div>

//               <button type="submit" className="lp-btn" disabled={loading}>
//                 {loading ? 'Signing in…' : 'Sign In'}
//               </button>

//             </form>

//             <div className="lp-divider">
//               <div className="lp-div-line" />
//               <span className="lp-div-txt">🔒 secure login</span>
//               <div className="lp-div-line" />
//             </div>

//             <div className="lp-back">
//               <Link to="/" className="lp-back-link">
//                 <span className="lp-back-arr">←</span>
//                 Back to website
//               </Link>
//             </div>

//           </div>
//         </div>

//       </div>
//     </>
//   );
// };

// export default LoginPage;


// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { Eye, EyeOff, Building } from 'lucide-react';
// import { useAuth } from '@/contexts/AuthContext';
// import { toast } from 'react-toastify';
// import { useSystemSettings } from '@/contexts/SystemSettingsContext';
// import logo from '@/assets/images/logo.png';
// interface User {
//   id: string | number;
//   username: string;
//   email: string;
//   first_name: string;
//   last_name: string;
//   role: 'admin' | 'manager' | 'agent' | 'buyer' | 'seller' | 'team leader' | 'sales team leader' | 'presales team leader' | 'sales manager' | 'marketing executive' | 'presales executive' | 'sales executive';
//   phone?: string;
//   avatar?: string;
//   is_active: boolean;
//   buyer_id?: number | string;
//   seller_id?: number | string;
// }

// interface LoginFormData {
//   username: string;
//   password: string;
// }

// // AFTER
// const SLIDES = [
//   {
//     img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
//     title: 'Your Trusted Resale Experts',
//     sub: 'Simplifying resale property transactions across Maharashtra',
//   },
//   {
//     img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
//     title: 'Buy or Sell with Confidence',
//     sub: 'Verified listings, fair prices & zero-hassle experience',
//   },
//   {
//     img: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=900&q=80',
//     title: 'Resale Made Simple',
//     sub: 'Expert guidance from search to final documentation',
//   },
// ];

// const LoginPage: React.FC = () => {
//   const [formData, setFormData] = useState<LoginFormData>({ username: '', password: '' });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [slide, setSlide] = useState(0);
//   const [fadeIn, setFadeIn] = useState(true);

//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const from = (location.state as any)?.from?.pathname || '/dashboard';
//   const { systemSettings } = useSystemSettings();
//   const companyName = systemSettings?.company_name;

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setFadeIn(false);
//       setTimeout(() => {
//         setSlide(s => (s + 1) % SLIDES.length);
//         setFadeIn(true);
//       }, 400);
//     }, 4000);
//     return () => clearInterval(timer);
//   }, []);

//   const goToSlide = (i: number) => {
//     if (i === slide) return;
//     setFadeIn(false);
//     setTimeout(() => { setSlide(i); setFadeIn(true); }, 400);
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
//   };

//   const validateForm = (): boolean => {
//     const newErrors: Record<string, string> = {};
//     if (!formData.username.trim()) newErrors.username = 'Username is required';
//     if (!formData.password) newErrors.password = 'Password is required';
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validateForm()) return;
//     setLoading(true);
//     try {
//       const response = (await login(formData)) as unknown as User;
//       const user = response;
//       if (!user) { toast.error('Invalid login response'); return; }
//       const role = (user.role ?? '').toString().trim().toLowerCase();
//       if (role === 'buyer' && user.buyer_id) { navigate(`/buyer-dashboard/${user.buyer_id}`, { replace: true }); return; }
//       if (role === 'seller' && user.seller_id) { navigate(`/seller-dashboard/${user.seller_id}`, { replace: true }); return; }
//       const generalRoles = ['marketing executive', 'sales executive', 'presales executive'];
//       if (generalRoles.includes(role)) { navigate(from || '/dashboard', { replace: true }); return; }
//       navigate(from || '/dashboard', { replace: true });
//     } catch (err: any) {
//       toast.error(err?.message || 'Login failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const current = SLIDES[slide];

//   return (
//     <div className="min-h-screen flex bg-[#eef2f6] font-sans overflow-hidden flex-col md:flex-row">
//       {/* ══ LEFT SLIDER ══ */}
// <div className="hidden md:flex relative flex-[0_0_46%] md:min-h-screen overflow-hidden flex-col justify-between md:rounded-r-[56px] z-20 shadow-[12px_0_48px_rgba(0,0,0,0.22)]">        {/* Images */}
//         {SLIDES.map((s, i) => (
//           <img
//             key={i}
//             src={s.img}
//             alt="Property"
//             className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-450 ${
//               i === slide ? 'opacity-100' : 'opacity-0'
//             }`}
//           />
//         ))}
        
//         {/* Overlay */}
//         <div className="absolute inset-0 bg-gradient-to-br from-[rgba(6,6,16,0.30)] via-[rgba(6,6,16,0.06)] to-[rgba(6,6,16,0.75)] rounded-inherit" />

//         {/* Brand */}
// <div className="relative z-30 flex items-center px-6 py-5 md:px-[38px] md:py-[34px]">
//   <img
//     src={logo}
//     alt={companyName || 'ResaleExpert'}
//     className="h-10 w-auto object-contain"
//   />
// </div>

//         {/* Caption */}
//         <div className="relative z-30 p-[36px_42px_44px] md:p-[36px_42px_44px] p-[18px_28px_30px]">
//           <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white/14 backdrop-blur-[8px] border border-white/22 rounded-full mb-4">
//             <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-[lp-blink_2s_infinite]" />
//             <span className="text-[11px]  text-white font-semibold text-white/88 tracking-[0.06em] uppercase">
//               Live listings
//             </span>
//           </div>

//           <h2 className={`text-[clamp(24px,3vw,38px)] font-extrabold text-white leading-[1.18] tracking-[-0.02em] mb-2.5 transition-opacity duration-400 ${
//             fadeIn ? 'opacity-100' : 'opacity-0'
//           }`}>
//             {current.title}
//           </h2>
//           <p className={`text-sm text-white/65 leading-[1.55] mb-6 max-w-[270px] transition-opacity duration-400 ${
//             fadeIn ? 'opacity-100' : 'opacity-0'
//           } md:block hidden`}>
//             {current.sub}
//           </p>

//           <div className="flex gap-1.5 items-center">
//             {SLIDES.map((_, i) => (
//               <div
//                 key={i}
//                 className={`h-1 rounded-full bg-white/32 cursor-pointer transition-all duration-350 ${
//                   i === slide ? 'w-[42px] bg-white' : 'w-5'
//                 }`}
//                 onClick={() => goToSlide(i)}
//               />
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* ══ RIGHT PANEL ══ */}
//       <div className="flex-1 flex items-center justify-center p-12 md:p-[48px_36px] relative overflow-hidden">
//         {/* Background glows */}
//         <div className="absolute -top-[100px] -right-[100px] w-[380px] h-[380px] rounded-full bg-radial-gradient from-[rgba(193,163,120,0.13)] to-transparent pointer-events-none" />
//         <div className="absolute -bottom-20 left-0 w-[280px] h-[280px] rounded-full bg-radial-gradient from-[rgba(100,120,180,0.07)] to-transparent pointer-events-none" />


//         {/* Card */}
//         <div className="w-full max-w-[415px] bg-white rounded-[40px] p-[44px_40px_36px] relative z-10 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_4px_16px_rgba(0,0,0,0.07),0_20px_56px_rgba(0,0,0,0.08)] md:p-[32px_22px_28px] ">
//           {/* Top accent bar */}
//           <div className="absolute top-0 left-9 right-9 h-[3.5px] bg-gradient-to-r from-transparent via-[#E8720C] to-transparent rounded-b-md" />
          
//           {/* Corner accent */}
//           <div className="absolute -bottom-px -right-px w-20 h-20 rounded-br-[28px] bg-gradient-to-tr from-transparent via-transparent to-[rgba(193,163,120,0.08)] pointer-events-none" />

         
//           <h1 className="text-[23px] font-extrabold text-[#111] tracking-[-0.025em] mb-1 md:text-xl">
//             Welcome back!
//           </h1>
//           <p className="text-[13.5px] text-[#9a9a9a] font-normal mb-[30px]">
//             Sign in to continue to your account
//           </p>

//           <form onSubmit={handleSubmit} noValidate>
//             <div className="mb-[17px]">
//               <label className="block text-[11px] font-bold text-[#1B4B72] tracking-[0.08em] uppercase mb-1.5" htmlFor="lp-username">
//                 Username
//               </label>
//               <div className="relative">
//                 <input
//                   id="lp-username"
//                   name="username"
//                   type="text"
//                   autoComplete="username"
//                   value={formData.username}
//                   onChange={handleChange}
//                   placeholder="Enter your username"
//                   className={`w-full p-[13px_16px] border-[1.5px] rounded-[14px] font-inherit text-[14.5px] text-[#111] bg-[#faf8f5] outline-none transition-all duration-200 placeholder:text-[#c0bab0] focus:border-[#c1a378] focus:bg-white focus:shadow-[0_0_0_3.5px_rgba(193,163,120,0.15)] ${
//                     errors.username ? 'border-[#e05555] shadow-[0_0_0_3px_rgba(224,85,85,0.12)]' : 'border-[#ece8e0]'
//                   }`}
//                 />
//               </div>
//               {errors.username && <p className="text-xs text-[#e05555] mt-1">{errors.username}</p>}
//             </div>

//             <div className="mb-[17px]">
//               <label className="block text-[11px] font-bold text-[#1B4B72] tracking-[0.08em] uppercase mb-1.5" htmlFor="lp-password">
//                 Password
//               </label>
//               <div className="relative">
//                 <input
//                   id="lp-password"
//                   name="password"
//                   type={showPassword ? 'text' : 'password'}
//                   autoComplete="current-password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   placeholder="••••••••"
//                   className={`w-full p-[13px_44px_13px_16px] border-[1.5px] rounded-[14px] font-inherit text-[14.5px] text-[#111] bg-[#faf8f5] outline-none transition-all duration-200 placeholder:text-[#c0bab0] focus:border-[#c1a378] focus:bg-white focus:shadow-[0_0_0_3.5px_rgba(193,163,120,0.15)] ${
//                     errors.password ? 'border-[#e05555] shadow-[0_0_0_3px_rgba(224,85,85,0.12)]' : 'border-[#ece8e0]'
//                   }`}
//                 />
//                 <button
//                   type="button"
//                   className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-[#c0bab0] p-1 hover:text-[#c1a378] transition-colors"
//                   onClick={() => setShowPassword(!showPassword)}
//                   aria-label={showPassword ? 'Hide password' : 'Show password'}
//                 >
//                   {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
//                 </button>
//               </div>
//               {errors.password && <p className="text-xs text-[#e05555] mt-1">{errors.password}</p>}
//             </div>

//             <div className="flex items-center justify-between my-2 mb-[26px]">
//               <label className="flex items-center gap-1.5 cursor-pointer">
//                 <input type="checkbox" className="w-[15px] h-[15px] accent-[#c1a378] cursor-pointer" />
//                 <span className="text-[13px] text-[#666]">Remember me</span>
//               </label>
//               <a href="#" className="text-[13px] font-medium text-[#E8720C] no-underline hover:text-[#ff7802] transition-colors">
//                 Forgot password?
//               </a>
//             </div>

//             <button
//               type="submit"
//               className="w-full py-[14.5px] bg-gradient-to-br from-[#16162a] to-[#2a2a4a] text-white border-none rounded-[14px] font-inherit text-[15px] font-bold tracking-[0.03em] cursor-pointer relative overflow-hidden  transition-all duration-150 hover:-translate-y-0.5  active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
//               disabled={loading}
//             >
//               <span className="absolute inset-0 text-[#E8720C] pointer-events-none" />
//               {loading ? 'Signing in…' : 'Sign In'}
//             </button>
//           </form>

//           <div className="flex items-center gap-2.5 my-[22px] mb-4">
//             <div className="flex-1 h-px bg-[#ece8e0]" />
//             <span className="text-[11.5px] text-[#c0bab0] whitespace-nowrap tracking-[0.04em]">🔒 secure login</span>
//             <div className="flex-1 h-px bg-[#ece8e0]" />
//           </div>

//           <div className="flex justify-center">
//             <Link to="/" className="text-[13px] text-[#1B4B72] no-underline inline-flex items-center gap-1 hover:text-[#555] transition-colors group">
//               <span className="inline-block transition-transform group-hover:-translate-x-1">←</span>
//               Back to website
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* Add keyframe animation for blinking dot */}
//       <style>{`
//         @keyframes lp-blink {
//           0%, 100% { opacity: 1; transform: scale(1); }
//           50% { opacity: 0.5; transform: scale(0.8); }
//         }
//         .animate-lp-blink {
//           animation: lp-blink 2s infinite;
//         }
//         .bg-radial-gradient {
//           background-image: radial-gradient(circle, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 70%);
//         }
//         .rounded-inherit {
//           border-radius: inherit;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default LoginPage;


import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';
import logo from '@/assets/images/logo.png';

interface User {
  id: string | number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'agent' | 'buyer' | 'seller' | 'team leader' | 'sales team leader' | 'presales team leader' | 'sales manager' | 'marketing executive' | 'presales executive' | 'sales executive';
  phone?: string;
  avatar?: string;
  is_active: boolean;
  buyer_id?: number | string;
  seller_id?: number | string;
}

interface LoginFormData {
  username: string;
  password: string;
}

const SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
    title: 'Your Trusted Resale Experts',
    sub: 'Simplifying resale property transactions across Maharashtra',
  },
  {
    img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
    title: 'Buy or Sell with Confidence',
    sub: 'Verified listings, fair prices & zero-hassle experience',
  },
  {
    img: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=900&q=80',
    title: 'Resale Made Simple',
    sub: 'Expert guidance from search to final documentation',
  },
];

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slide, setSlide] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  const { systemSettings } = useSystemSettings();
  const companyName = systemSettings?.company_name;

  useEffect(() => {
    const timer = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setSlide(s => (s + 1) % SLIDES.length);
        setFadeIn(true);
      }, 400);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (i: number) => {
    if (i === slide) return;
    setFadeIn(false);
    setTimeout(() => { setSlide(i); setFadeIn(true); }, 400);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = (await login(formData)) as unknown as User;
      const user = response;
      if (!user) { toast.error('Invalid login response'); return; }
      const role = (user.role ?? '').toString().trim().toLowerCase();
      if (role === 'buyer' && user.buyer_id) { navigate(`/buyer-dashboard/${user.buyer_id}`, { replace: true }); return; }
      if (role === 'seller' && user.seller_id) { navigate(`/seller-dashboard/${user.seller_id}`, { replace: true }); return; }
      const generalRoles = ['marketing executive', 'sales executive', 'presales executive'];
      if (generalRoles.includes(role)) { navigate(from || '/dashboard', { replace: true }); return; }
      navigate(from || '/dashboard', { replace: true });
   } catch (err: any) {
  const msg = (err?.message || '').toLowerCase();
  if (msg.includes('password') || msg.includes('incorrect')) {
    setErrors(prev => ({ ...prev, password: 'Incorrect password. Please try again.' }));
    toast.error('Incorrect password. Please try again.');
  } else if (msg.includes('user') || msg.includes('not found')) {
    setErrors(prev => ({ ...prev, username: 'Username not found.' }));
    toast.error('Username not found.');
  } else {
    setErrors(prev => ({ ...prev, password: 'Invalid credentials.' }));
    toast.error('Invalid username or password.');
  }
} finally {
      setLoading(false);
    }
  };

  const current = SLIDES[slide];

  return (
    <div className="min-h-screen flex bg-white md:bg-[#eef2f6] font-sans overflow-hidden flex-col md:flex-row">
      {/* LEFT SLIDER - Hidden on mobile */}
      <div className="hidden md:flex relative flex-[0_0_46%] md:min-h-screen overflow-hidden flex-col justify-between md:rounded-r-[56px] z-20 shadow-[12px_0_48px_rgba(0,0,0,0.22)]">
        {/* Images */}
        {SLIDES.map((s, i) => (
          <img
            key={i}
            src={s.img}
            alt="Property"
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-450 ${
              i === slide ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(6,6,16,0.30)] via-[rgba(6,6,16,0.06)] to-[rgba(6,6,16,0.75)] rounded-inherit" />

        {/* Brand */}
        <div className="relative z-30 flex items-center px-6 py-5 md:px-[38px] md:py-[34px]">
          <img
            src={logo}
            alt={companyName || 'ResaleExpert'}
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* Caption */}
        <div className="relative z-30 p-[36px_42px_44px] md:p-[36px_42px_44px]">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white/14 backdrop-blur-[8px] border border-white/22 rounded-full mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-[lp-blink_2s_infinite]" />
            <span className="text-[11px] text-white font-semibold text-white/88 tracking-[0.06em] uppercase">
              Live listings
            </span>
          </div>

          <h2 className={`text-[clamp(24px,3vw,38px)] font-extrabold text-white leading-[1.18] tracking-[-0.02em] mb-2.5 transition-opacity duration-400 ${
            fadeIn ? 'opacity-100' : 'opacity-0'
          }`}>
            {current.title}
          </h2>
          <p className={`text-sm text-white/65 leading-[1.55] mb-6 max-w-[270px] transition-opacity duration-400 ${
            fadeIn ? 'opacity-100' : 'opacity-0'
          } md:block hidden`}>
            {current.sub}
          </p>

          <div className="flex gap-1.5 items-center">
            {SLIDES.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full bg-white/32 cursor-pointer transition-all duration-350 ${
                  i === slide ? 'w-[42px] bg-white' : 'w-5'
                }`}
                onClick={() => goToSlide(i)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Clean mobile view without stretch */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-6 md:p-[48px_36px] relative min-h-screen md:min-h-0">
        {/* Remove background glows on mobile for cleaner look */}
        <div className="absolute -top-[100px] -right-[100px] w-[380px] h-[380px] rounded-full bg-radial-gradient from-[rgba(193,163,120,0.13)] to-transparent pointer-events-none hidden md:block" />
        <div className="absolute -bottom-20 left-0 w-[280px] h-[280px] rounded-full bg-radial-gradient from-[rgba(100,120,180,0.07)] to-transparent pointer-events-none hidden md:block" />

        {/* Card - Perfect width on mobile, not stretched */}
        <div className="w-full max-w-[400px] sm:max-w-[415px] bg-white rounded-[32px] sm:rounded-[40px] p-[28px_22px_32px] sm:p-[44px_40px_36px] relative z-10 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_4px_16px_rgba(0,0,0,0.07),0_20px_56px_rgba(0,0,0,0.08)] md:shadow-[0_1px_2px_rgba(0,0,0,0.03),0_4px_16px_rgba(0,0,0,0.07),0_20px_56px_rgba(0,0,0,0.08)]">
          
          {/* Top accent bar */}
          <div className="absolute top-0 left-9 right-9 h-[3.5px] bg-gradient-to-r from-transparent via-[#E8720C] to-transparent rounded-b-md" />
          
          {/* Corner accent */}
          <div className="absolute -bottom-px -right-px w-20 h-20 rounded-br-[28px] bg-gradient-to-tr from-transparent via-transparent to-[rgba(193,163,120,0.08)] pointer-events-none" />

          <h1 className="text-[26px] sm:text-[23px] font-extrabold text-[#111] tracking-[-0.025em] mb-1 sm:mb-1">
            Welcome back!
          </h1>
          <p className="text-[14px] sm:text-[13.5px] text-[#9a9a9a] font-normal mb-[28px] sm:mb-[30px]">
            Sign in to continue to your account
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-[17px]">
              <label className="block text-[11px] font-bold text-[#1B4B72] tracking-[0.08em] uppercase mb-1.5" htmlFor="lp-username">
                Username
              </label>
              <div className="relative">
                <input
                  id="lp-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className={`w-full p-[13px_16px] border-[1.5px] rounded-[14px] font-inherit text-[15px] sm:text-[14.5px] text-[#111] bg-[#faf8f5] outline-none transition-all duration-200 placeholder:text-[#c0bab0] focus:border-[#c1a378] focus:bg-white focus:shadow-[0_0_0_3.5px_rgba(193,163,120,0.15)] ${
                    errors.username ? 'border-[#e05555] shadow-[0_0_0_3px_rgba(224,85,85,0.12)]' : 'border-[#ece8e0]'
                  }`}
                />
              </div>
              {errors.username && <p className="text-xs text-[#e05555] mt-1">{errors.username}</p>}
            </div>

            <div className="mb-[17px]">
              <label className="block text-[11px] font-bold text-[#1B4B72] tracking-[0.08em] uppercase mb-1.5" htmlFor="lp-password">
                Password
              </label>
              <div className="relative">
                <input
                  id="lp-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full p-[13px_44px_13px_16px] border-[1.5px] rounded-[14px] font-inherit text-[15px] sm:text-[14.5px] text-[#111] bg-[#faf8f5] outline-none transition-all duration-200 placeholder:text-[#c0bab0] focus:border-[#c1a378] focus:bg-white focus:shadow-[0_0_0_3.5px_rgba(193,163,120,0.15)] ${
                    errors.password ? 'border-[#e05555] shadow-[0_0_0_3px_rgba(224,85,85,0.12)]' : 'border-[#ece8e0]'
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-[#c0bab0] p-1 hover:text-[#c1a378] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-[#e05555] mt-1">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between my-2 mb-[26px]">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" className="w-[15px] h-[15px] accent-[#c1a378] cursor-pointer" />
                <span className="text-[13px] text-[#666]">Remember me</span>
              </label>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-[13px] font-medium text-[#E8720C] ...">
  Forgot password?
</a>
            </div>

            <button
              type="submit"
              className="w-full py-[14.5px] bg-gradient-to-br from-[#16162a] to-[#2a2a4a] text-white border-none rounded-[14px] font-inherit text-[15px] font-bold tracking-[0.03em] cursor-pointer relative overflow-hidden transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-2.5 my-[22px] mb-4">
            <div className="flex-1 h-px bg-[#ece8e0]" />
            <span className="text-[11.5px] text-[#c0bab0] whitespace-nowrap tracking-[0.04em]">🔒 secure login</span>
            <div className="flex-1 h-px bg-[#ece8e0]" />
          </div>

          <div className="flex justify-center">
            <Link to="/" className="text-[13px] text-[#1B4B72] no-underline inline-flex items-center gap-1 hover:text-[#555] transition-colors group">
              <span className="inline-block transition-transform group-hover:-translate-x-1">←</span>
              Back to website
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes lp-blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .animate-lp-blink {
          animation: lp-blink 2s infinite;
        }
        .bg-radial-gradient {
          background-image: radial-gradient(circle, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 70%);
        }
        .rounded-inherit {
          border-radius: inherit;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;