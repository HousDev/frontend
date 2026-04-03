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
      const response = (await login(formData)) as unknown as User;
      const user = response;
      if (!user) {
        toast.error('Invalid login response');
        return;
      }

      const role = (user.role ?? '').toString().trim().toLowerCase();

      console.log('Login user:', user);
      console.log('Normalized role:', role);

      if (role === 'buyer' && user.buyer_id) {
        navigate(`/buyer-dashboard/${user.buyer_id}`, { replace: true });
        return;
      }
      if (role === 'seller' && user.seller_id) {
        navigate(`/seller-dashboard/${user.seller_id}`, { replace: true });
        return;
      }

      const generalRoles = ['marketing executive', 'sales executive', 'presales executive'];
      if (generalRoles.includes(role)) {
        navigate(from || '/dashboard', { replace: true });
        return;
      }

      navigate(from || '/dashboard', { replace: true });

    } catch (err: any) {
      toast.error(err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Modern Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>

      <div className="relative w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 z-10">
        {/* Left Side - Welcome Content - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:block flex-1 text-center lg:text-left space-y-8 px-4">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-sm rounded-full border border-indigo-500/20">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-medium text-indigo-300">AI-Powered CRM Platform</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
              Welcome to
              <span className="block mt-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent">
                {companyName}
              </span>
            </h1>

            <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
              Transform your real estate business with intelligent automation,
              streamlined workflows, and data-driven insights.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
            {[
              { icon: Shield, title: 'Secure', desc: 'Enterprise-grade security', color: 'from-emerald-500 to-teal-500' },
              { icon: Zap, title: 'Fast', desc: 'Lightning-quick responses', color: 'from-amber-500 to-orange-500' },
              { icon: Sparkles, title: 'Smart', desc: 'AI-powered insights', color: 'from-indigo-500 to-purple-500' },
            ].map((feat, i) => (
              <div key={i} className="group p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                <div className={`inline-flex p-3 bg-gradient-to-r ${feat.color} rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <feat.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-white text-base mb-1">{feat.title}</h3>
                <p className="text-sm text-slate-400">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Login Form (visible on all screen sizes) */}
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-8 hover:bg-white/[0.07] transition-all duration-300">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/50">
                <Building className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-sm text-slate-400">Sign in to continue to your account</p>
            </div>

            {/* Login Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <Input
                  label="Username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={errors.username}
                  placeholder="Enter your username"
                  className="bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-indigo-400 focus:ring-indigo-400/20"
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
                    placeholder="Enter your password"
                    className="bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-indigo-400 focus:ring-indigo-400/20"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-9 text-slate-400 hover:text-indigo-400 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-500 focus:ring-indigo-400 border-white/30 rounded bg-white/10 cursor-pointer"
                  />
                  <span className="ml-2 text-slate-300 group-hover:text-white transition-colors">Remember me</span>
                </label>
                <a href="#" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-0 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-indigo-500/30 hover:shadow-indigo-50"
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 space-y-4 text-center">
              <div className="pt-3 border-t border-white/10">
                {/* <span className="text-slate-400 text-sm">Don't have an account? </span> */}
                {/* <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Sign up</Link> */}
              </div>
              <div>
                <Link
                  to="/"
                  className="text-sm text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2 group"
                >
                  <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
                  Back to website
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;