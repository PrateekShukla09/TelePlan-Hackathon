import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Signal, Mail, ArrowRight, CheckCircle2, ShieldCheck, X, RefreshCw, Sparkles, KeyRound, Bell, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function GmailOtpAuthModal({ isOpen, onClose }) {
  const { loginWithGmailOtp, isDarkMode } = useAppStore();

  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [generatedOtp, setGeneratedOtp] = useState('4892');
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);

  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Resend Timer Countdown
  useEffect(() => {
    let timer;
    if (step === 'otp' && resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  if (!isOpen) return null;

  const triggerOtpSend = (targetEmail) => {
    setLoading(true);
    setError('');

    setTimeout(() => {
      setLoading(false);
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setGeneratedOtp(code);
      setStep('otp');
      setResendTimer(30);
      setOtpDigits(['', '', '', '']);

      // Show Gmail Notification Toast Banner
      setShowNotificationToast(true);
    }, 600);
  };

  const handleSendOtp = (e) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid Gmail / email address.');
      return;
    }
    triggerOtpSend(email);
  };

  const handleGoogleQuickAuth = () => {
    const demoEmail = 'alex.google@gmail.com';
    setEmail(demoEmail);
    triggerOtpSend(demoEmail);
  };

  const handleOtpDigitChange = (index, value) => {
    if (isNaN(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleAutofillDemoOtp = () => {
    const digits = generatedOtp.split('');
    setOtpDigits(digits);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleVerifyOtp = (e) => {
    if (e) e.preventDefault();
    const enteredCode = otpDigits.join('');
    if (enteredCode.length < 4) {
      setError('Please enter the full 4-digit verification code.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const res = loginWithGmailOtp(email, enteredCode);
      if (res.success) {
        setShowNotificationToast(false);
        onClose();
        setStep('email');
      } else {
        setError('Invalid OTP code. Please try again.');
      }
    }, 400);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        
        {/* Crimson Red Glow backdrop behind modal */}
        <div className="absolute w-[500px] h-[350px] bg-gradient-to-tr from-red-600/30 via-rose-600/20 to-amber-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* GMAIL PUSH NOTIFICATION SIMULATOR TOAST */}
        <AnimatePresence>
          {showNotificationToast && (
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              className="fixed top-6 right-6 z-50 w-full max-w-sm rounded-2xl p-4 bg-[#0d0709] border border-red-500/40 shadow-2xl shadow-red-950/60 text-white space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                  <div className="w-5 h-5 rounded-md bg-red-600 text-white flex items-center justify-center text-[10px] font-black">
                    M
                  </div>
                  <span>Gmail • New Security Notification</span>
                </div>
                <button
                  onClick={() => setShowNotificationToast(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-extrabold text-white">
                  TelePlan AI Verification Code: <span className="text-rose-400 font-mono tracking-widest text-sm">{generatedOtp}</span>
                </p>
                <p className="text-[11px] text-zinc-400">
                  Sent to <strong className="text-zinc-200">{email}</strong>. Use this code to log in.
                </p>
              </div>

              <div className="pt-1 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleAutofillDemoOtp}
                  className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {copiedOtp ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedOtp ? 'Code Auto-Filled!' : `Auto-Fill Code (${generatedOtp})`}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`w-full max-w-md rounded-3xl p-6 sm:p-8 border shadow-2xl relative overflow-hidden transition-all ${
            isDarkMode 
              ? 'bg-[#0b0507] border-red-950/80 text-white shadow-red-950/50' 
              : 'bg-white border-slate-200 text-slate-900 shadow-xl'
          }`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className={`absolute top-5 right-5 p-2 rounded-full transition-colors ${
              isDarkMode ? 'hover:bg-red-950/50 text-zinc-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex flex-col items-center text-center space-y-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 p-0.5 shadow-lg shadow-red-600/30">
              <div className="w-full h-full bg-[#0a0406] rounded-[14px] flex items-center justify-center text-rose-400">
                <Signal className="w-6 h-6 stroke-[2.5]" />
              </div>
            </div>
            <div>
              <h3 className={`text-xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {step === 'email' ? 'Sign in to TelePlan AI' : 'Gmail OTP Verification'}
              </h3>
              <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                {step === 'email'
                  ? 'Access your telemetry digital twin & AI recommendations'
                  : `Enter the 4-digit code sent to ${email}`}
              </p>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold text-center"
            >
              {error}
            </motion.div>
          )}

          {/* STEP 1: GMAIL INPUT */}
          {step === 'email' && (
            <div className="space-y-4">
              {/* Google OAuth Simulation Button */}
              <button
                type="button"
                onClick={handleGoogleQuickAuth}
                className={`w-full py-3 px-4 rounded-xl border flex items-center justify-center gap-3 text-xs font-bold transition-all shadow-sm ${
                  isDarkMode 
                    ? 'bg-zinc-900/90 border-zinc-800 text-white hover:bg-zinc-800 hover:border-red-500/50' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 hover:bg-slate-100'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex items-center justify-center py-2">
                <div className={`w-full border-t ${isDarkMode ? 'border-red-950/60' : 'border-slate-200'}`} />
                <span className={`absolute px-3 text-[11px] font-bold uppercase tracking-wider ${
                  isDarkMode ? 'bg-[#0b0507] text-zinc-500' : 'bg-white text-slate-500'
                }`}>
                  Or continue with Gmail OTP
                </span>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                    isDarkMode ? 'text-zinc-300' : 'text-slate-700'
                  }`}>
                    Gmail Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500/70" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                        isDarkMode 
                          ? 'bg-zinc-950 border-red-950/80 text-white placeholder-zinc-600' 
                          : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send OTP Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Demo Helper */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    const demoEmail = 'alex.sharma@gmail.com';
                    setEmail(demoEmail);
                    triggerOtpSend(demoEmail);
                  }}
                  className={`text-xs hover:underline font-semibold ${isDarkMode ? 'text-rose-400' : 'text-red-600'}`}
                >
                  Quick Demo: Auto-Fill & Send OTP to alex.sharma@gmail.com
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: 4-DIGIT OTP VERIFICATION */}
          {step === 'otp' && (
            <div className="space-y-6">
              <div className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs font-semibold ${
                isDarkMode ? 'bg-red-950/30 border-red-800/40 text-rose-300' : 'bg-red-50 border-red-200 text-red-900'
              }`}>
                <div className="flex items-center gap-2 truncate">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="truncate">OTP Sent to <strong>{email}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNotificationToast(true)}
                  className="px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/30 text-rose-300 text-[10px] font-bold shrink-0 flex items-center gap-1"
                >
                  <Bell className="w-3 h-3" />
                  <span>Show Toast</span>
                </button>
              </div>

              {/* 4 Digit OTP Inputs */}
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider text-center mb-3 ${
                    isDarkMode ? 'text-zinc-300' : 'text-slate-700'
                  }`}>
                    Enter 4-Digit Security Code
                  </label>

                  <div className="flex justify-center gap-3">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={inputRefs[idx]}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className={`w-14 h-14 text-center text-2xl font-black rounded-xl border focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
                          isDarkMode 
                            ? 'bg-zinc-950 border-red-950 text-rose-400' 
                            : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Quick Auto-fill OTP Helper */}
                <div className={`p-3.5 rounded-xl border text-center text-xs flex items-center justify-between gap-2 ${
                  isDarkMode ? 'bg-zinc-950 border-red-950/60' : 'bg-slate-100 border-slate-200'
                }`}>
                  <span className="text-zinc-400">Received OTP Code: <strong className="text-rose-400 font-mono text-sm">{generatedOtp}</strong></span>
                  <button
                    type="button"
                    onClick={handleAutofillDemoOtp}
                    className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-rose-300 font-bold rounded-lg border border-red-500/40 transition-all flex items-center gap-1"
                  >
                    {copiedOtp ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedOtp ? 'Filled!' : 'Auto-Fill'}</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Verify OTP & Account Access</span>
                    </>
                  )}
                </button>
              </form>

              {/* Resend & Change Email Actions */}
              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className={`font-semibold hover:underline ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}
                >
                  Change Email
                </button>

                {resendTimer > 0 ? (
                  <span className="text-zinc-500 font-mono">Resend code in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => triggerOtpSend(email)}
                    className="text-rose-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend OTP</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Footer Security Note */}
          <div className="mt-6 pt-4 border-t border-red-950/60 text-center flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
            <span>256-Bit Encrypted Gmail Telemetry Vault</span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
