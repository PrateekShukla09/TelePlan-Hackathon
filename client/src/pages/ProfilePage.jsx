import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import {
  User,
  Mail,
  Phone,
  Radio,
  Sparkles,
  ShieldCheck,
  Edit3,
  Save,
  X,
  LogOut,
  CheckCircle,
  Clock,
  Bookmark,
  ChevronRight,
  Radar,
  Sliders,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { currentUser, updateProfile, logout, isDarkMode, profile } = useAppStore();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    carrier: currentUser?.carrier || 'TelePlan 5G',
    dataNeed: currentUser?.profile?.dataNeed || profile?.dataNeed || 'high',
    budget: currentUser?.profile?.budget || profile?.budget || '₹500 - ₹800/mo',
  });

  const [toastMessage, setToastMessage] = useState('');

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-lg font-semibold text-base-400">You are not logged in.</p>
        <Link
          to="/login"
          className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-base-950 font-bold rounded-xl shadow-md transition-all"
        >
          Go to Login Page
        </Link>
      </div>
    );
  }

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      carrier: formData.carrier,
      profile: {
        dataNeed: formData.dataNeed,
        budget: formData.budget,
      },
    });

    setIsEditing(false);
    setToastMessage('Profile updated successfully!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleLogout = () => {
    logout();
    Navigate('/login');
  };

  const userProfile = currentUser.profile || profile || {};
  const savedPlans = currentUser.savedPlans || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 px-4 py-3 bg-green-500 text-base-950 font-bold text-sm rounded-xl shadow-xl flex items-center gap-2"
          >
            <CheckCircle className="h-5 w-5" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Header Hero Card */}
      <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 border shadow-xl transition-all ${
        isDarkMode 
          ? 'bg-gradient-to-br from-base-900 teleplana-base-900/90 to-base-950 border-base-800 text-white' 
          : 'bg-gradient-to-br from-white teleplana-sky-50/50 to-white border-slate-200 text-slate-900'
      }`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          {/* Avatar & User Details */}
          <div className="flex items-start sm:items-center gap-5">
            <div className="relative">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-cyan-500/30 shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-cyan-400 teleplana-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-extrabold text-white shadow-xl shadow-cyan-500/20 ring-4 ring-cyan-500/30">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 border-2 border-base-950 flex items-center justify-center" title="Active Digital Twin">
                <CheckCircle className="h-3.5 w-3.5 text-white" />
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {currentUser.name}
                </h1>
                <span className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-wider">
                  {currentUser.id}
                </span>
              </div>

              <p className={`text-sm flex items-center gap-2 ${isDarkMode ? 'text-base-400' : 'text-slate-500'}`}>
                <Mail className="h-4 w-4 shrink-0" />
                <span>{currentUser.email}</span>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${
                  isDarkMode ? 'bg-base-950/60 border-base-800 text-base-300' : 'bg-white border-slate-200 text-slate-700'
                }`}>
                  <Radio className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{currentUser.carrier || 'TelePlan 5G'}</span>
                </span>

                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${
                  isDarkMode ? 'bg-base-950/60 border-base-800 text-base-300' : 'bg-white border-slate-200 text-slate-700'
                }`}>
                  <Clock className="h-3.5 w-3.5 text-blue-400" />
                  <span>Member since {currentUser.memberSince || '2026'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                isEditing
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400 hover:bg-amber-500/30'
                  : isDarkMode
                  ? 'bg-base-800 border-base-700 hover:bg-base-700 text-base-100'
                  : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800'
              }`}
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4" />
                  <span>Cancel Edit</span>
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2 transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Personal Information & Digital Twin Card */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card 1: Personal Details (View / Edit Mode) */}
          <div className={`rounded-2xl p-6 border shadow-lg transition-all ${
            isDarkMode ? 'bg-base-900 border-base-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-base-800/60">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-bold">Personal Information</h2>
              </div>
              {isEditing && (
                <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30">
                  Editing Mode Active
                </span>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-base-400 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-cyan-500 ${
                        isDarkMode ? 'bg-base-950 border-base-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-base-400 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-cyan-500 ${
                        isDarkMode ? 'bg-base-950 border-base-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-base-400 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-cyan-500 ${
                        isDarkMode ? 'bg-base-950 border-base-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-base-400 mb-1.5">
                      Preferred Carrier
                    </label>
                    <select
                      value={formData.carrier}
                      onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
                      className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-cyan-500 ${
                        isDarkMode ? 'bg-base-950 border-base-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="TelePlan 5G">TelePlan 5G</option>
                      <option value="TelePlan">TelePlan</option>
                      <option value="TelePlan (Vodafone Idea)">TelePlan (Vodafone Idea)</option>
                      <option value="TelePlan 4G">TelePlan 4G</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl border border-base-700 text-xs font-bold text-base-300 hover:bg-base-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-base-950 font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <span className={`block text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-base-400' : 'text-slate-500'}`}>
                    Full Name
                  </span>
                  <span className="text-base font-semibold text-white mt-1 block">
                    {currentUser.name}
                  </span>
                </div>

                <div>
                  <span className={`block text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-base-400' : 'text-slate-500'}`}>
                    Email Address
                  </span>
                  <span className="text-base font-semibold text-white mt-1 block">
                    {currentUser.email}
                  </span>
                </div>

                <div>
                  <span className={`block text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-base-400' : 'text-slate-500'}`}>
                    Phone Number
                  </span>
                  <span className="text-base font-semibold text-white mt-1 block">
                    {currentUser.phone || 'Not proteleplanded'}
                  </span>
                </div>

                <div>
                  <span className={`block text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-base-400' : 'text-slate-500'}`}>
                    Network Operator
                  </span>
                  <span className="text-base font-semibold text-cyan-400 mt-1 block">
                    {currentUser.carrier || 'TelePlan 5G'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Digital Twin Profile & Parameters */}
          <div className={`rounded-2xl p-6 border shadow-lg transition-all ${
            isDarkMode ? 'bg-base-900 border-base-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-base-800/60">
              <div className="flex items-center gap-2">
                <Radar className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-bold">Telecom Digital Twin Setup</h2>
              </div>

              <Link
                to="/app/twin"
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
              >
                <span>Tune Twin Model</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl border ${
                isDarkMode ? 'bg-base-950/70 border-base-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-xs text-base-400 uppercase font-bold block mb-1">Data Needs</span>
                <span className="text-sm font-bold text-cyan-400 capitalize flex items-center gap-1.5">
                  <Zap className="h-4 w-4" />
                  {userProfile.dataNeed || 'High'}
                </span>
                <span className="text-[11px] text-base-500 mt-1 block">Unlimited 5G & high streaming</span>
              </div>

              <div className={`p-4 rounded-xl border ${
                isDarkMode ? 'bg-base-950/70 border-base-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-xs text-base-400 uppercase font-bold block mb-1">Target Budget</span>
                <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                  {userProfile.budget || '₹500 - ₹800/mo'}
                </span>
                <span className="text-[11px] text-base-500 mt-1 block">Optimal cost range</span>
              </div>

              <div className={`p-4 rounded-xl border ${
                isDarkMode ? 'bg-base-950/70 border-base-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="text-xs text-base-400 uppercase font-bold block mb-1">Calling & Voice</span>
                <span className="text-sm font-bold text-blue-400 flex items-center gap-1.5">
                  Unlimited Domestic
                </span>
                <span className="text-[11px] text-base-500 mt-1 block">HD Voice + VoWiFi</span>
              </div>
            </div>
          </div>

          {/* Card 3: Saved Tariff Plans */}
          <div className={`rounded-2xl p-6 border shadow-lg transition-all ${
            isDarkMode ? 'bg-base-900 border-base-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-base-800/60">
              <div className="flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-amber-400" />
                <h2 className="text-lg font-bold">Saved Tariff Plans ({savedPlans.length})</h2>
              </div>
              <Link to="/app/recommendations" className="text-xs text-cyan-400 hover:underline font-bold">
                Browse All Plans
              </Link>
            </div>

            {savedPlans.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <p className="text-sm text-base-400">You haven't saved any recommendations yet.</p>
                <Link
                  to="/app/recommendations"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 text-xs font-bold hover:bg-cyan-500/30 transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Get AI Plan Recommendations</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {savedPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                      isDarkMode ? 'bg-base-950/60 border-base-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 uppercase">
                        {plan.carrier}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">{plan.name}</h4>
                      <p className="text-xs text-base-400">Validity: {plan.validity || '84 days'}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-extrabold text-cyan-400">₹{plan.price}</span>
                      <Link
                        to="/app/compare"
                        className="block text-[11px] text-base-400 hover:text-cyan-400 underline mt-1"
                      >
                        Compare Plan
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Profile Summary & Account Controls */}
        <div className="space-y-8">
          
          {/* Digital Twin Health Card */}
          <div className={`rounded-2xl p-6 border shadow-lg relative overflow-hidden ${
            isDarkMode ? 'bg-gradient-to-br from-cyan-950/40 teleplana-base-900 to-base-900 border-cyan-900/50' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              <h3 className="font-bold text-base">Digital Twin Status</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-base-400">Twin Accuracy</span>
                <span className="font-bold text-emerald-400">98% High Precision</span>
              </div>
              <div className="w-full bg-base-950 rounded-full h-2 overflow-hidden border border-base-800">
                <div className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full w-[98%]" />
              </div>

              <div className="pt-2 text-xs text-base-400 space-y-2">
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan-400" />
                  <span>Real-time usage telemetry active</span>
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan-400" />
                  <span>Cluster category: Power Streamer</span>
                </p>
              </div>

              <Link
                to="/app/simulator"
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-base-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-cyan-500/20 transition-all mt-4"
              >
                <Sliders className="h-4 w-4" />
                <span>Simulate Usage Changes</span>
              </Link>
            </div>
          </div>

          {/* Account Security Quick Box */}
          <div className={`rounded-2xl p-6 border shadow-lg ${
            isDarkMode ? 'bg-base-900 border-base-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-base-800/60">
              <ShieldCheck className="h-5 w-5 text-cyan-400" />
              <h3 className="font-bold text-base">Security & Preferences</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-base-800/40">
                <div>
                  <span className="font-semibold text-white block">Email Notifications</span>
                  <span className="text-base-400">Plan price drop alerts</span>
                </div>
                <input type="checkbox" defaultChecked className="rounded border-base-700 bg-base-950 text-cyan-500 focus:ring-cyan-500" />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-base-800/40">
                <div>
                  <span className="font-semibold text-white block">Digital Twin Vault</span>
                  <span className="text-base-400">Local Encrypted Cache</span>
                </div>
                <span className="text-emerald-400 font-bold">Encrypted</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out of Account</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
