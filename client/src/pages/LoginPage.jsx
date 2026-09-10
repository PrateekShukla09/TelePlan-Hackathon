import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Wifi, Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isDarkMode } = useAppStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email address and password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);
      if (res.success) {
        Navigate('/app/dashboard');
      } else {
        setError(res.message);
      }
    }, 400);
  };

  const handleDemoLogin = () => {
    setEmail('aarav@example.com');
    setPassword('password123');
    setError('');
    setLoading(true);
    setTimeout(() => {
      const res = login('aarav@example.com', 'password123');
      setLoading(false);
      if (res.success) {
        Navigate('/app/dashboard');
      }
    }, 300);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${
      isDarkMode ? 'bg-base-950 text-base-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Background Decorative Glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-8 z-10"
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
            Welcome back
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-base-400' : 'text-slate-500'}`}>
            Sign in to access your digital twin & AI recommendations
          </p>
        </div>

        {/* Card Container */}
        <div className={`rounded-2xl p-6 sm:p-8 shadow-2xl border transition-all ${
          isDarkMode 
            ? 'bg-base-900/80 border-base-800 backdrop-blur-xl shadow-cyan-950/20' 
            : 'bg-white border-slate-200 shadow-slate-200/60'
        }`}>
          
          {/* Quick Demo Access Bar */}
          <div className={`mb-6 p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
            isDarkMode ? 'bg-cyan-950/30 border-cyan-800/50 text-cyan-300' : 'bg-cyan-50 border-cyan-200 text-cyan-800'
          }`}>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>Testing out? Use 1-click Demo Account</span>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-base-950 font-bold shrink-0 shadow-sm transition-all"
            >
              Demo Login
            </button>
          </div>

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
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-base-300' : 'text-slate-700'}`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-base-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors ${
                    isDarkMode 
                      ? 'bg-base-950 border-base-800 text-white placeholder-base-600' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`block text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-base-300' : 'text-slate-700'}`}>
                  Password
                </label>
                <span className="text-xs text-cyan-500 hover:underline cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-base-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors ${
                    isDarkMode 
                      ? 'bg-base-950 border-base-800 text-white placeholder-base-600' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-base-400 hover:text-base-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-base-700 bg-base-950 text-cyan-500 focus:ring-cyan-500" />
                <span className={isDarkMode ? 'text-base-300' : 'text-slate-600'}>Remember me for 30 days</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-base-950 font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-base-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 pt-6 border-t text-center text-xs text-base-400 border-base-800/50">
            <p className={isDarkMode ? 'text-base-400' : 'text-slate-600'}>
              Don't have a Telecom Twin account yet?{' '}
              <Link to="/signup" className="text-cyan-500 hover:underline font-bold">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-base-500">
          <ShieldCheck className="h-4 w-4 text-cyan-500" />
          <span>256-bit Encrypted Telemetry Digital Twin Vault</span>
        </div>
      </motion.div>
    </div>
  );
}
