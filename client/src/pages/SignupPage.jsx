import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Wifi, User, Mail, Phone, Lock, ArrowRight, ShieldCheck, Sparkles, Check, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const CARRIERS = ['TelePlan 5G', 'TelePlan', 'TelePlan (Vodafone Idea)', 'TelePlan 4G', 'Other'];
const BUDGET_RANGES = ['₹200 - ₹400/mo', '₹400 - ₹800/mo', '₹800 - ₹1500/mo', '₹1500+/mo'];
const DATA_NEEDS = [
  { value: 'low', label: 'Basic (1-1.5 GB/day)' },
  { value: 'medium', label: 'Standard (2 GB/day)' },
  { value: 'high', label: 'Power 5G Unlimited' },
];

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, isDarkMode } = useAppStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    carrier: 'TelePlan 5G',
    budget: '₹400 - ₹800/mo',
    dataNeed: 'high',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = signup({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        carrier: formData.carrier,
        budget: formData.budget,
        dataNeed: formData.dataNeed,
        password: formData.password,
      });

      setLoading(false);
      if (res.success) {
        Navigate('/app/profile');
      } else {
        setError(res.message);
      }
    }, 500);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
      isDarkMode ? 'bg-base-950 text-base-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Background Glow Effects */}
      <div className="absolute top-5 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-5 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl space-y-8 z-10"
      >
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
              <Wifi className="h-5 w-5 text-white" strokeWidth={2.5} />
            </span>
            <span className={`font-display font-extrabold text-2xl tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Tariff<span className="text-cyan-500">Twin</span>
            </span>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Create Your Account
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-base-400' : 'text-slate-500'}`}>
            Build your digital twin profile & receive customized tariff recommendations
          </p>
        </div>

        {/* Card Form */}
        <div className={`rounded-2xl p-6 sm:p-8 shadow-2xl border transition-all ${
          isDarkMode 
            ? 'bg-base-900/80 border-base-800 backdrop-blur-xl shadow-cyan-950/20' 
            : 'bg-white border-slate-200 shadow-slate-200/60'
        }`}>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Grid 1: Personal Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-base-300' : 'text-slate-700'}`}>
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-base-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Aarav Sharma"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      isDarkMode 
                        ? 'bg-base-950 border-base-800 text-white placeholder-base-600' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-base-300' : 'text-slate-700'}`}>
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-base-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="aarav@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      isDarkMode 
                        ? 'bg-base-950 border-base-800 text-white placeholder-base-600' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Grid 2: Phone & Carrier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-base-300' : 'text-slate-700'}`}>
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-base-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      isDarkMode 
                        ? 'bg-base-950 border-base-800 text-white placeholder-base-600' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-base-300' : 'text-slate-700'}`}>
                  Current Carrier
                </label>
                <select
                  name="carrier"
                  value={formData.carrier}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    isDarkMode 
                      ? 'bg-base-950 border-base-800 text-white' 
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  {CARRIERS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Telecom Twin Preferences Section */}
            <div className={`p-4 rounded-xl border space-y-4 ${
              isDarkMode ? 'bg-base-950/60 border-base-800' : 'bg-slate-100/70 border-slate-200'
            }`}>
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Initial Digital Twin Parameters</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-base-300' : 'text-slate-700'}`}>
                    Monthly Spend Budget
                  </label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      isDarkMode ? 'bg-base-900 border-base-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    {BUDGET_RANGES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDarkMode ? 'text-base-300' : 'text-slate-700'}`}>
                    Daily Data Need
                  </label>
                  <select
                    name="dataNeed"
                    value={formData.dataNeed}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      isDarkMode ? 'bg-base-900 border-base-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    {DATA_NEEDS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Grid 3: Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-base-300' : 'text-slate-700'}`}>
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-base-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      isDarkMode 
                        ? 'bg-base-950 border-base-800 text-white placeholder-base-600' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-400 hover:text-base-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-base-300' : 'text-slate-700'}`}>
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-base-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                      isDarkMode 
                        ? 'bg-base-950 border-base-800 text-white placeholder-base-600' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-base-950 font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-base-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account & Digital Twin</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 pt-6 border-t text-center text-xs border-base-800/50">
            <p className={isDarkMode ? 'text-base-400' : 'text-slate-600'}>
              Already registered?{' '}
              <Link to="/login" className="text-cyan-500 hover:underline font-bold">
                Log In
              </Link>
            </p>
          </div>
        </div>

        {/* Security Info */}
        <div className="flex items-center justify-center gap-2 text-xs text-base-500">
          <ShieldCheck className="h-4 w-4 text-cyan-500" />
          <span>Your data is stored securely and never shared with third-party telemarketing.</span>
        </div>
      </motion.div>
    </div>
  );
}
