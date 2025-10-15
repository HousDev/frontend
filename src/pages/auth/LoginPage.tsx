// import React, { useState } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { Building, Eye, EyeOff, Sparkles, Shield, Zap } from 'lucide-react';
// import { useAuth } from '@/contexts/AuthContext';
// import Button from '@/components/ui/Button';
// import Input from '@/components/ui/Input';
// import { toast } from 'react-toastify';
// import { useSystemSettings } from '@/contexts/SystemSettingsContext';

// const LoginPage: React.FC = () => {
//   const [formData, setFormData] = useState({
//     username: '',
//     password: '',
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const from = location.state?.from?.pathname || '/dashboard';

//   const { systemSettings } = useSystemSettings();
//   const companyName = systemSettings?.company_name;
//   const companyLogo = systemSettings?.company_logo;

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const validateForm = () => {
//     const newErrors: Record<string, string> = {};

//     if (!formData.username.trim()) {
//       newErrors.username = 'Username is required';
//     }

//     if (!formData.password) {
//       newErrors.password = 'Password is required';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();

//   if (!validateForm()) {
//     return;
//   }

//   setLoading(true);
//   try {
//     // assume login returns the user object { id, role, ... }.
//     // If your login doesn't return it, the fallback tries to read it from useAuth() state.
//     const user = await login(formData);

//     toast.success('Login successful!');

//     // get role & id from returned user or from auth context fallback
//     const role = (user && (user.role || user.user?.role)) || (/* @ts-ignore */ (useAuth as any)().user?.role) || '';
//     const id = (user && (user.id || user.user?.id)) || (/* @ts-ignore */ (useAuth as any)().user?.id);

//     // Normalize role check
//     const roleNormalized = String(role || '').toLowerCase();

//     if (roleNormalized === 'buyer' && id) {
//       // navigate to buyer-specific standalone route
//       navigate(`/buyers-dashboard/${id}`, { replace: true });
//     } else {
//       // default behavior (redirect back to 'from' or dashboard)
//       navigate(from, { replace: true });
//     }
//   } catch (error: any) {
//     toast.error(error?.message || 'Login failed. Please try again.');
//   } finally {
//     setLoading(false);
//   }
// };


//   const demoCredentials = [
//     { username: 'admin', password: 'admin123', role: 'Admin', color: 'from-blue-700 to-blue-800' },
//     { username: 'john_agent', password: 'Agent@123', role: 'Agent', color: 'from-blue-600 to-blue-700' },
//     { username: 'sarah_manager', password: 'Manager@123', role: 'Manager', color: 'from-blue-500 to-blue-600' },
//     { username: 'mike_agent', password: 'Agent@123', role: 'Executive', color: 'from-blue-800 to-blue-900' },
//   ];

//   const fillDemoCredentials = (username: string, password: string) => {
//     setFormData({ username, password });
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-blue-800 flex items-center justify-center p-4">
//       {/* Background Effects */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
//         <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-2000"></div>
//       </div>

//       <div className="relative w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-6">
//         {/* Left Side - Welcome Content */}
//         <div className="flex-1 text-center lg:text-left space-y-6 px-4">
//           <div className="space-y-3">
//             <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
//               <Sparkles className="h-4 w-4 text-orange-400" />
//               <span className="text-sm font-medium text-white">AI-Powered CRM Platform</span>
//             </div>

//             <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight">
//               Welcome to
//               <span className="block bg-gradient-to-r from-blue-400 via-orange-400 to-blue-300 bg-clip-text text-transparent">
//                 {companyName || 'Resale Expert'}
//               </span>
//             </h1>

//             <p className="text-lg text-blue-200 max-w-2xl">
//               Transform your real estate business with intelligent automation,
//               streamlined workflows, and data-driven insights.
//             </p>
//           </div>

//           {/* Feature highlights */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
//               <div className="p-2 bg-orange-500/20 rounded-lg">
//                 <Shield className="h-5 w-5 text-orange-400" />
//               </div>
//               <div>
//                 <h3 className="font-semibold text-white">Secure</h3>
//                 <p className="text-xs text-blue-300">Enterprise-grade security</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
//               <div className="p-2 bg-orange-500/20 rounded-lg">
//                 <Zap className="h-5 w-5 text-orange-400" />
//               </div>
//               <div>
//                 <h3 className="font-semibold text-white">Fast</h3>
//                 <p className="text-xs text-blue-300">Lightning-quick responses</p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
//               <div className="p-2 bg-orange-500/20 rounded-lg">
//                 <Sparkles className="h-5 w-5 text-orange-400" />
//               </div>
//               <div>
//                 <h3 className="font-semibold text-white">Smart</h3>
//                 <p className="text-xs text-blue-300">AI-powered insights</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Side - Login Form */}
//         <div className="w-full max-w-md">
//           <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-6">
//             {/* Header */}
//             <div className="text-center mb-6">
//               <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl mb-3">
//                 <Building className="h-7 w-7 text-white" />
//               </div>
//               <h2 className="text-xl font-bold text-white mb-2">Welcome Back</h2>
//               <p className="text-sm text-blue-200">
//                 Sign in to continue to your account
//               </p>
//             </div>

//             {/* Login Form */}
//             <form className="space-y-4" onSubmit={handleSubmit}>
//               <div className="grid gap-4 grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
//                 <div>
//                   <Input
//                     label="Username"
//                     name="username"
//                     type="text"
//                     autoComplete="username"
//                     required
//                     value={formData.username}
//                     onChange={handleChange}
//                     error={errors.username}
//                     placeholder="Enter Your Username"
//                     className="bg-white/10 border-white/20 text-white placeholder-blue-300 text-xs"
//                   />
//                 </div>

//                 <div>
//                   <div className="relative">
//                     <Input
//                       label="Password"
//                       name="password"
//                       type={showPassword ? 'text' : 'password'}
//                       autoComplete="current-password"
//                       required
//                       value={formData.password}
//                       onChange={handleChange}
//                       error={errors.password}
//                       placeholder="Enter Your Password"
//                       className="bg-white/10 border-white/20 text-white placeholder-blue-300 text-xs"
//                     />
//                     <button
//                       type="button"
//                       className="absolute right-3 top-8 text-orange-400 hover:text-orange-300 transition-colors"
//                       onClick={() => setShowPassword(!showPassword)}
//                     >
//                       {showPassword ? (
//                         <EyeOff className="h-5 w-5" />
//                       ) : (
//                         <Eye className="h-5 w-5" />
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex items-center justify-between text-sm">
//                 <div className="flex items-center">
//                   <input
//                     id="remember-me"
//                     name="remember-me"
//                     type="checkbox"
//                     className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-white/30 rounded bg-white/10"
//                   />
//                   <label htmlFor="remember-me" className="ml-2 block text-blue-200">
//                     Remember me
//                   </label>
//                 </div>

//                 <div>
//                   <a
//                     href="#"
//                     className="font-medium text-orange-400 hover:text-orange-300 transition-colors"
//                   >
//                     Forgot password?
//                   </a>
//                 </div>
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 border-0 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
//                 loading={loading}
//                 disabled={loading}
//               >
//                 {loading ? 'Signing in...' : 'Sign In'}
//               </Button>
//             </form>

//             {/* Demo Accounts */}
//             <div className="mt-6">
//               <div className="relative">
//                 <div className="absolute inset-0 flex items-center">
//                   <div className="w-full border-t border-white/20" />
//                 </div>
//                 <div className="relative flex justify-center text-sm">
//                   <span className="px-3 bg-white/10 backdrop-blur-sm text-blue-200 rounded-full">
//                     Demo Accounts
//                   </span>
//                 </div>
//               </div>

//               <div className="mt-4 grid lg:grid-cols-4 md:grid-cols-4 sm:grid-cols-2 grid-cols-2 gap-2">
//                 {demoCredentials.map((cred, index) => (
//                   <button
//                     key={index}
//                     type="button"
//                     onClick={() => fillDemoCredentials(cred.username, cred.password)}
//                     className="p-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-200 hover:scale-105 group"
//                   >
//                     <div className="text-center">
//                       <div
//                         className={`w-6 h-6 mx-auto mb-1 rounded-lg bg-gradient-to-r ${cred.color} flex items-center justify-center`}
//                       >
//                         <span className="text-xs font-bold text-orange-300">
//                           {cred.role.charAt(0)}
//                         </span>
//                       </div>
//                       <div className="text-xs font-medium text-white group-hover:text-blue-300">
//                         {cred.role}
//                       </div>
//                       <div className="text-xs text-blue-300">{cred.username}</div>
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Footer Links */}
//             <div className="mt-6 space-y-3">
//               <div className="text-center">
//                 <span className="text-blue-300 text-sm">Don't have an account? </span>
//                 <Link
//                   to="/register"
//                   className="font-medium text-orange-400 hover:text-orange-300 transition-colors"
//                 >
//                   Sign up
//                 </Link>
//               </div>

//               <div className="text-center">
//                 <Link
//                   to="/"
//                   className="text-sm text-blue-300 hover:text-blue-200 transition-colors inline-flex items-center gap-1"
//                 >
//                   ← Back to website
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






import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Building, Eye, EyeOff, Sparkles, Shield, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'react-toastify';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';

interface User {
  id: string | number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'agent' | 'buyer' | 'seller';
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

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const { systemSettings } = useSystemSettings();
  const companyName = systemSettings?.company_name;

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
      // 👇 TypeScript-safe cast to your local User shape
      const response = (await login(formData)) as unknown as User;

      toast.success('Login successful!');

      const user = response;
      const role = user?.role?.toString().toLowerCase() || '';
      const id = user?.id;

     // on successful login
if (user.role === 'buyer' && user.buyer_id) {
  navigate(`/buyer-dashboard/${user.buyer_id}`, { replace: true });
} else if (user.role === 'seller' && user.seller_id) {
  navigate(`/seller-dashboard/${user.seller_id}`, { replace: true });
} else {
  navigate('/dashboard', { replace: true }); // admin/manager/agent
}


    } catch (error: any) {
      toast.error(error?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { username: 'admin', password: 'admin123', role: 'Admin', color: 'from-blue-700 to-blue-800' },
    { username: 'john_agent', password: 'Agent@123', role: 'Agent', color: 'from-blue-600 to-blue-700' },
    { username: 'sarah_manager', password: 'Manager@123', role: 'Manager', color: 'from-blue-500 to-blue-600' },
    { username: 'mike_agent', password: 'Agent@123', role: 'Executive', color: 'from-blue-800 to-blue-900' },
  ];

  const fillDemoCredentials = (username: string, password: string) => {
    setFormData({ username, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-blue-800 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-2000"></div>
      </div>

      <div className="relative w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-6">
        {/* Left Side - Welcome Content */}
        <div className="flex-1 text-center lg:text-left space-y-6 px-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Sparkles className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-white">AI-Powered CRM Platform</span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold text-white leading-tight">
              Welcome to
              <span className="block bg-gradient-to-r from-blue-400 via-orange-400 to-blue-300 bg-clip-text text-transparent">
                {companyName || 'Resale Expert'}
              </span>
            </h1>
            <p className="text-lg text-blue-200 max-w-2xl">
              Transform your real estate business with intelligent automation,
              streamlined workflows, and data-driven insights.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: 'Secure', desc: 'Enterprise-grade security' },
              { icon: Zap, title: 'Fast', desc: 'Lightning-quick responses' },
              { icon: Sparkles, title: 'Smart', desc: 'AI-powered insights' },
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <feat.icon className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{feat.title}</h3>
                  <p className="text-xs text-blue-300">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl mb-3">
                <Building className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-sm text-blue-200">Sign in to continue to your account</p>
            </div>

            {/* Login Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
                <Input
                  label="Username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={errors.username}
                  placeholder="Enter Your Username"
                  className="bg-white/10 border-white/20 text-white placeholder-blue-300 text-xs"
                />
                <div className="relative">
                  <Input
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="Enter Your Password"
                    className="bg-white/10 border-white/20 text-white placeholder-blue-300 text-xs"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-8 text-orange-400 hover:text-orange-300 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-white/30 rounded bg-white/10"
                  />
                  <span className="ml-2 block text-blue-200">Remember me</span>
                </label>
                <a href="#" className="font-medium text-orange-400 hover:text-orange-300 transition-colors">Forgot password?</a>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 border-0 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Demo Accounts */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/20" /></div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white/10 backdrop-blur-sm text-blue-200 rounded-full">Demo Accounts</span>
                </div>
              </div>

              <div className="mt-4 grid lg:grid-cols-4 md:grid-cols-4 sm:grid-cols-2 grid-cols-2 gap-2">
                {demoCredentials.map((cred, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => fillDemoCredentials(cred.username, cred.password)}
                    className="p-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-200 hover:scale-105 group"
                  >
                    <div className="text-center">
                      <div className={`w-6 h-6 mx-auto mb-1 rounded-lg bg-gradient-to-r ${cred.color} flex items-center justify-center`}>
                        <span className="text-xs font-bold text-orange-300">{cred.role.charAt(0)}</span>
                      </div>
                      <div className="text-xs font-medium text白 group-hover:text-blue-300">{cred.role}</div>
                      <div className="text-xs text-blue-300">{cred.username}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            <div className="mt-6 space-y-3 text-center">
              <div>
                <span className="text-blue-300 text-sm">Don't have an account? </span>
                {/* <Link to="/register" className="font-medium text-orange-400 hover:text-orange-300 transition-colors">Sign up</Link> */}
              </div>
              <div>
                <Link to="/" className="text-sm text-blue-300 hover:text-blue-200 transition-colors inline-flex items-center gap-1">← Back to website</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
