import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building, Eye, EyeOff, Sparkles, Shield, Zap, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { toast } from 'react-toastify';
import { useSystemSettings } from '@/contexts/SystemSettingsContext';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'agent',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { register } = useAuth();
  const navigate = useNavigate();

  const { systemSettings } = useSystemSettings();
  const companyName = systemSettings?.company_name;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
              <UserPlus className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-white">Join Our Platform</span>
            </div>

            <h1 className="md:text-3xl text-2xl lg:text-5xl font-bold text-white leading-tight">
              Start Your Journey
              <span className="block bg-gradient-to-r from-blue-400 via-orange-400 to-blue-300 bg-clip-text text-transparent">
                with {companyName || 'Resale Expert'}
              </span>
            </h1>

            <p className="md:text-lg lg:text-lg text-xs text-blue-200 max-w-2xl">
              Create your account and unlock the power of intelligent CRM.
              Streamline your workflow and accelerate your success.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Shield className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Secure</h3>
                <p className="text-xs text-blue-300">Enterprise-grade security</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Zap className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Fast</h3>
                <p className="text-xs text-blue-300">Lightning-quick responses</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Sparkles className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Smart</h3>
                <p className="text-xs text-blue-300">AI-powered insights</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="w-full max-w-lg">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl mb-3">
                <Building className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-sm text-blue-200">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-orange-400 hover:text-orange-300 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Register Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 text-xs">
                <Input
                  label="First Name"
                  name="first_name"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  error={errors.first_name}
                  placeholder="John"
                  className="bg-white/10 border-white/20 text-white placeholder-blue-300"
                />

                <Input
                  label="Last Name"
                  name="last_name"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  error={errors.last_name}
                  placeholder="Doe"
                  className="bg-white/10 border-white/20 text-white placeholder-blue-300"
                />

                <Input
                  label="Username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  error={errors.username}
                  placeholder="johndoe"
                  className="bg-white/10 border-white/20 text-white placeholder-blue-300"
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="john@example.com"
                  className="bg-white/10 border-white/20 text-white placeholder-blue-300"
                />

                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  placeholder="+1 (555) 123-4567"
                  className="bg-white/10 border-white/20 text-white placeholder-blue-300"
                />

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-blue-200 mb-1">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  >
                    <option value="agent" className="bg-gray-800 text-white">Real Estate Agent</option>
                    <option value="manager" className="bg-gray-800 text-white">Manager</option>
                    <option value="admin" className="bg-gray-800 text-white">Administrator</option>
                  </select>
                </div>

                <div className="relative">
                  <Input
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="Enter Your Password"
                    className="bg-white/10 border-white/20 text-white placeholder-blue-300"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-8 text-orange-400 hover:text-orange-300 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Confirm Password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    placeholder="Confirm Your Password"
                    className="bg-white/10 border-white/20 text-white placeholder-blue-300"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-8 text-orange-400 hover:text-orange-300 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center text-sm">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-white/30 rounded bg-white/10"
                />
                <label htmlFor="terms" className="ml-2 block text-blue-200">
                  I agree to the{' '}
                  <a href="#" className="text-orange-400 hover:text-orange-300 transition-colors">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-orange-400 hover:text-orange-300 transition-colors">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900 border-0 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 text-center">
              <Link
                to="/"
                className="text-sm text-blue-300 hover:text-blue-200 transition-colors inline-flex items-center gap-1"
              >
                ← Back to website
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;