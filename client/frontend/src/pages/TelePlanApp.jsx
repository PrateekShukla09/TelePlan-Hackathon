import React, { useState, useMemo } from 'react';
import {
  Signal,
  User,
  Users,
  Briefcase,
  Zap,
  Phone,
  MessageSquare,
  Wallet,
  Globe,
  Sliders,
  Sparkles,
  CheckCircle2,
  Scale,
  Search,
  RotateCcw,
  Info,
  X,
  ChevronRight,
  Sun,
  Moon,
  ShieldCheck,
  Check,
  LogIn,
  LogOut,
  ChevronDown,
  Mail,
  BadgeCheck,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateClusterAndRecommendations, PLANS_DATA } from '@/data/plansData';
import { useAppStore } from '@/store/useAppStore';
import { GmailOtpAuthModal } from '@/components/GmailOtpAuthModal';
import { ChatbotDrawer } from '@/components/ChatbotDrawer';
import { getRecommendationsByProfile } from '@/api/recommendations';

function computeDynamicWhyThisPlan(plan, userInputs, matchPercent) {
  const { dataGB = 50, callMin = 800, rechargeBudget = 500, use5G = true, dataRoaming = 'none' } = userInputs || {};

  let planDataGB = plan.dataGB || plan.dataGBPerMonth || 0;
  if (plan.unlimitedData || plan.has5G || plan.unlimited5G) planDataGB = Math.max(planDataGB, 100);

  let dataMatchPct = 85;
  if (planDataGB >= dataGB) {
    dataMatchPct = Math.min(100, Math.round(90 + Math.min(10, (planDataGB - dataGB) / 10)));
  } else {
    dataMatchPct = Math.max(50, Math.round((planDataGB / Math.max(1, dataGB)) * 100));
  }

  const planCalls = plan.callMinutes || 3000;
  let callMatchPct = planCalls >= callMin ? 100 : Math.max(60, Math.round((planCalls / Math.max(1, callMin)) * 100));

  const price = plan.price || 0;
  let budgetMatchPct = 80;
  if (price <= rechargeBudget) {
    const savingsRatio = (rechargeBudget - price) / Math.max(1, rechargeBudget);
    budgetMatchPct = Math.min(100, Math.round(90 + savingsRatio * 10));
  } else {
    const overspendRatio = (price - rechargeBudget) / Math.max(1, rechargeBudget);
    budgetMatchPct = Math.max(40, Math.round(100 - overspendRatio * 100));
  }

  const match5GPct = (use5G && (plan.has5G || plan.unlimited5G || plan.unlimitedData)) ? 100 : (!use5G && !plan.has5G) ? 95 : 75;

  const dataDesc = plan.unlimitedData || plan.has5G || plan.unlimited5G ? 'Unlimited 5G Data' : `${planDataGB} GB data`;

  return {
    dataMatch: `${dataMatchPct}%`,
    callMatch: `${callMatchPct}%`,
    budgetMatch: `${budgetMatchPct}%`,
    match5G: `${match5GPct}%`,
    overallFit: `${matchPercent}% match for your profile with ${dataDesc} and ₹${price}/mo cost.`,
  };
}

export default function TelePlanApp() {
  const { isLoggedIn, currentUser, logout, isDarkMode, toggleDarkMode } = useAppStore();

  // Modal States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Form Input State
  const [customerType, setCustomerType] = useState('Individual'); // Individual | Family | Business
  const [dataGB, setDataGB] = useState(50);
  const [callMin, setCallMin] = useState(800);
  const [smsCount, setSmsCount] = useState(100);
  const [rechargeBudget, setRechargeBudget] = useState(400);
  const [use5G, setUse5G] = useState(true);
  const [dataRoaming, setDataRoaming] = useState('none'); // none | domestic | international
  const [memberCount, setMemberCount] = useState(1);

  // Submitted Inputs State (drives AI Recommendations & K-Means Cluster upon clicking Submit)
  const [submittedInputs, setSubmittedInputs] = useState({
    customerType: 'Individual',
    dataGB: 50,
    callMin: 800,
    smsCount: 100,
    rechargeBudget: 400,
    use5G: true,
    dataRoaming: 'none',
    memberCount: 1,
  });

  // State for Backend XGBoost ML Recommendations
  const [backendRecs, setBackendRecs] = useState(null);

  const [isCalculating, setIsCalculating] = useState(false);

  // Modal State for "Why This Plan?"
  const [selectedWhyPlan, setSelectedWhyPlan] = useState(null);

  // All Plans Section Filter States
  const [allPlansCustomerFilter, setAllPlansCustomerFilter] = useState('All');
  const [allPlansCategoryFilter, setAllPlansCategoryFilter] = useState('All');
  const [allPlansMaxPrice, setAllPlansMaxPrice] = useState(3000);

  // Handle Form Submit to calculate recommendations according to given input
  const handleSubmitUsageForm = async (e) => {
    if (e) e.preventDefault();
    setIsCalculating(true);

    const newInputs = {
      customerType,
      dataGB,
      callMin,
      smsCount,
      rechargeBudget,
      use5G,
      dataRoaming,
      memberCount,
    };

    try {
      const profilePayload = {
        monthly_data_gb: dataGB,
        dataNeedGB: dataGB,
        dataGB: dataGB,
        total_call_minutes: callMin,
        callNeedMin: callMin,
        callMin: callMin,
        sms_per_month: smsCount,
        smsCount: smsCount,
        monthly_recharge_amount: rechargeBudget,
        budget: rechargeBudget,
        rechargeBudget: rechargeBudget,
        use5G: use5G,
        dataRoaming: dataRoaming,
        roamingRequired: dataRoaming !== 'none',
        user_type: customerType === 'Family' ? 2 : customerType === 'Business' ? 3 : 1,
        customerType: customerType,
        familyOrIndividual: customerType === 'Family' ? 'family' : customerType === 'Business' ? 'business' : 'individual',
      };

      const response = await getRecommendationsByProfile(profilePayload);
      if (response && response.data && Array.isArray(response.data.plans) && response.data.plans.length > 0) {
        setBackendRecs(response.data.plans);
      }
    } catch (err) {
      console.error('Backend recommendation request error:', err);
    }

    setSubmittedInputs(newInputs);
    setIsCalculating(false);

    // Scroll smoothly to the Top 3 Recommendations section
    const target = document.getElementById('top3-recommendations-section') || document.getElementById('ai-analysis-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Calculate AI Recommendations & K-Means Cluster based on submitted inputs
  const clusterData = useMemo(() => {
    return calculateClusterAndRecommendations(submittedInputs);
  }, [submittedInputs]);

  const top3Plans = useMemo(() => {
    let list = [];
    if (backendRecs && backendRecs.length > 0) {
      const seenIds = new Set();
      for (const item of backendRecs) {
        const itemPlan = item.plan || item;
        const pName = itemPlan.planName || itemPlan.title || '';
        const pId = itemPlan._id || itemPlan.id || item.planId || pName;

        if (seenIds.has(pName || pId)) continue;
        seenIds.add(pName || pId);

        const cataloguePlan = PLANS_DATA.find(p =>
          p.title.trim().toLowerCase() === pName.trim().toLowerCase() ||
          p.id === pId
        ) || {};

        const matchPercent = item.matchPercent ?? Math.round((item.score || 0.8) * 100);
        const dynamicWhy = computeDynamicWhyThisPlan({ ...cataloguePlan, ...itemPlan }, submittedInputs, matchPercent);

        list.push({
          ...cataloguePlan,
          ...itemPlan,
          id: pId,
          title: cataloguePlan.title || pName || 'Recommended Plan',
          planName: cataloguePlan.title || pName || 'Recommended Plan',
          operator: 'TelePlan',
          operatorSlug: 'teleplan',
          price: itemPlan.price || cataloguePlan.price,
          validityDays: itemPlan.validityDays || cataloguePlan.validityDays || 28,
          customerType: cataloguePlan.customerType || submittedInputs.customerType || 'Individual',
          category: cataloguePlan.category || itemPlan.category || 'XGBoost ML Recommended',
          data: cataloguePlan.data || itemPlan.data || (itemPlan.unlimitedData ? 'Unlimited 5G Data' : `${itemPlan.dataGB || 50} GB`),
          calls: cataloguePlan.calls || itemPlan.calls || 'Truly Unlimited Calls',
          otherBenefits: cataloguePlan.otherBenefits || itemPlan.benefits || [
            'High-speed 4G/5G data',
            'Nationwide Unlimited Calling',
            'Domestic Roaming Included'
          ],
          has5G: Boolean(cataloguePlan.has5G || itemPlan.unlimited5G || itemPlan.unlimitedData),
          hasRoaming: Boolean(cataloguePlan.hasRoaming || itemPlan.roamingIncluded),
          recommendationScore: matchPercent,
          whyThisPlan: dynamicWhy,
          reason: item.explanation || cataloguePlan.reason || 'Recommended by XGBoost ML Model',
          source: 'xgboost_ml'
        });
        if (list.length === 3) break;
      }
    }

    if (list.length < 3) {
      const fallbackList = clusterData.top3Plans.map(plan => ({
        ...plan,
        whyThisPlan: computeDynamicWhyThisPlan(plan, submittedInputs, plan.recommendationScore)
      }));
      for (const p of fallbackList) {
        if (!list.some(existing => existing.id === p.id || existing.title === p.title)) {
          list.push(p);
        }
        if (list.length === 3) break;
      }
    }

    return list.slice(0, 3);
  }, [backendRecs, submittedInputs, clusterData.top3Plans]);

  const aiResults = useMemo(() => {
    return {
      ...clusterData,
      top3Plans,
    };
  }, [clusterData, top3Plans]);

  // Filtered All Plans for Section 8 & 9 with accurate dynamic ML / telemetry fit %
  const filteredAllPlans = useMemo(() => {
    return aiResults.allPlans.map((plan) => {
      if (backendRecs && backendRecs.length > 0) {
        const mlMatch = backendRecs.find(item => {
          const itemPlan = item.plan || item;
          return (itemPlan._id && itemPlan._id === plan.id) ||
                 (itemPlan.id && itemPlan.id === plan.id) ||
                 (itemPlan.planName && itemPlan.planName.toLowerCase() === plan.title.toLowerCase()) ||
                 itemPlan.price === plan.price;
        });
        if (mlMatch) {
          const matchPercent = mlMatch.matchPercent ?? Math.round((mlMatch.score || 0.8) * 100);
          return {
            ...plan,
            recommendationScore: matchPercent,
            whyThisPlan: computeDynamicWhyThisPlan(plan, submittedInputs, matchPercent),
            reason: mlMatch.explanation || plan.reason,
            source: 'xgboost_ml'
          };
        }
      }
      return plan;
    }).filter((plan) => {
      if (allPlansCustomerFilter !== 'All' && plan.customerType !== allPlansCustomerFilter) return false;
      if (allPlansCategoryFilter !== 'All' && plan.category !== allPlansCategoryFilter) return false;
      if (plan.price > allPlansMaxPrice) return false;
      return true;
    });
  }, [aiResults.allPlans, backendRecs, submittedInputs, allPlansCustomerFilter, allPlansCategoryFilter, allPlansMaxPrice]);

  const handleResetFilters = () => {
    setAllPlansCustomerFilter('All');
    setAllPlansCategoryFilter('All');
    setAllPlansMaxPrice(3000);
  };

  const scrollToSection = (id) => {
    if (!isLoggedIn) {
      setAuthModalOpen(true);
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${
      isDarkMode ? 'bg-[#070304] text-zinc-100' : 'bg-slate-100 text-slate-900'
    }`}>
      
      {/* HEADER: TelePlan AI Name/Logo, Mode Toggle & Gmail OTP Auth */}
      <header className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors ${
        isDarkMode ? 'bg-[#070304]/90 border-red-950/60 text-white' : 'bg-white/90 border-slate-200 text-slate-900 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 p-0.5 shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0a0406] rounded-[10px] flex items-center justify-center text-rose-400">
                <Signal className="w-5 h-5 stroke-[2.5]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className={`text-xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                TelePlan <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-amber-400">AI</span>
              </span>
              <span className={`text-[10px] font-bold tracking-widest uppercase -mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                Tariff Recommendation System
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className={`hidden md:flex items-center gap-6 text-xs font-bold ${
            isDarkMode ? 'text-zinc-400' : 'text-slate-600'
          }`}>
            <button 
              onClick={() => scrollToSection('customer-type-section')}
              className="hover:text-rose-400 transition-colors"
            >
              Customer Type
            </button>
            <button 
              onClick={() => scrollToSection('usage-form-section')}
              className="hover:text-rose-400 transition-colors"
            >
              Usage Details
            </button>
            <button 
              onClick={() => scrollToSection('top3-recommendations-section')}
              className="hover:text-rose-400 transition-colors"
            >
              Top Recommendations
            </button>
            <button 
              onClick={() => scrollToSection('all-plans-section')}
              className="hover:text-rose-400 transition-colors"
            >
              All Plans
            </button>
          </nav>

          {/* Right Header Controls: Day/Night + Gmail OTP Auth */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className={`p-2.5 rounded-full border transition-all flex items-center gap-2 text-xs font-bold ${
                isDarkMode 
                  ? 'bg-zinc-900 border-red-950 text-amber-400 hover:bg-zinc-800' 
                  : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 shadow-sm'
              }`}
              title={isDarkMode ? 'Switch to Day Mode' : 'Switch to Night Mode'}
            >
              {isDarkMode ? (
                <>
                  <Moon className="w-4 h-4 text-rose-300" />
                  <span className="hidden sm:inline text-rose-300">Night</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-600 fill-amber-400/40" />
                  <span className="hidden sm:inline text-amber-800">Day</span>
                </>
              )}
            </button>

            {/* Gmail Auth / User Profile Button */}
            {isLoggedIn && currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                    isDarkMode 
                      ? 'bg-[#0d0608] border-red-900/60 text-zinc-200 hover:bg-red-950/40' 
                      : 'bg-white border-slate-300 text-slate-900 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 text-white font-black text-xs flex items-center justify-center shadow">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                  <span className="text-xs font-bold max-w-[110px] truncate">{currentUser.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className={`absolute right-0 mt-2 w-60 rounded-2xl border shadow-2xl p-3 z-50 ${
                        isDarkMode ? 'bg-[#0b0507] border-red-900/60 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <div className="pb-3 border-b border-red-950/60 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-rose-400">
                          <BadgeCheck className="w-4 h-4 text-rose-400" />
                          <span>OTP Verified Account</span>
                        </div>
                        <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                        <p className="text-[11px] text-zinc-400 truncate">{currentUser.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-red-950/80">
                          ID: {currentUser.id}
                        </span>
                      </div>

                      <div className="pt-2 space-y-1">
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setProfileModalOpen(true);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                            isDarkMode ? 'hover:bg-red-950/50 text-zinc-300' : 'hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <User className="w-4 h-4 text-rose-400" />
                          <span>View Profile & Twin</span>
                        </button>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/30 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In / Sign Up</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* SECTION 1: HOME PAGE */}
      <section className={`relative py-16 lg:py-24 overflow-hidden border-b ${
        isDarkMode ? 'border-red-950/40 bg-gradient-to-b from-[#0e0507] via-[#070304] to-[#070304]' : 'border-slate-200 bg-white'
      }`}>
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 text-center space-y-6 relative z-10">
          
          {/* Unauthenticated Lock Notice Banner */}
          {!isLoggedIn ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/40 bg-red-500/10 text-rose-300 text-xs font-bold shadow-md">
              <Lock className="w-4 h-4 text-rose-400" />
              <span>Login Required to Access AI Tariff Recommender — Sign in with Gmail</span>
            </div>
          ) : (
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold tracking-wide ${
              isDarkMode 
                ? 'border-red-500/30 bg-red-500/10 text-rose-400' 
                : 'border-red-200 bg-red-50 text-red-800 shadow-sm'
            }`}>
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>AI-POWERED TELECOM TARIFF MATCHING ENGINE</span>
            </div>
          )}

          <h1 className={`text-4xl sm:text-6xl font-black tracking-tight leading-tight ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            TelePlan <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-amber-400">AI</span>
          </h1>

          <p className={`text-base sm:text-xl max-w-2xl mx-auto font-medium leading-relaxed ${
            isDarkMode ? 'text-zinc-300' : 'text-slate-700'
          }`}>
            Stop guessing which tariff plan fits you best. TelePlan AI builds a live telemetry digital twin of your data, call, 5G, and roaming usage to simulate and match the perfect plan.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            {isLoggedIn ? (
              <button
                onClick={() => scrollToSection('customer-type-section')}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-base shadow-xl shadow-red-600/30 active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <span>Configure Usage & Get Recommendation</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-base shadow-xl shadow-red-600/35 active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                <span>Log In / Sign Up to Unlock Features</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER FOR ALL SECTIONS WITH AUTH WALL GATE */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* AUTH WALL OVERLAY WHEN USER IS NOT LOGGED IN */}
        {!isLoggedIn && (
          <div className={`absolute inset-0 z-30 flex flex-col items-center justify-center p-6 backdrop-blur-md rounded-3xl text-center space-y-6 transition-all duration-300 ${
            isDarkMode 
              ? 'bg-[#070304]/85 text-white' 
              : 'bg-slate-50/80 text-slate-900 border border-slate-200/80 shadow-2xl'
          }`}>
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 p-0.5 shadow-2xl shadow-red-600/40">
              <div className={`w-full h-full rounded-[22px] flex items-center justify-center ${
                isDarkMode ? 'bg-[#0a0406] text-rose-400' : 'bg-white text-rose-600 shadow-inner'
              }`}>
                <Lock className="w-10 h-10 stroke-[2.5]" />
              </div>
            </div>

            <div className="max-w-xl space-y-2">
              <h2 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Authentication Required
              </h2>
              <p className={`text-sm leading-relaxed font-semibold ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>
                Log in or create an account with your Gmail to configure your usage details, run K-Means cluster analysis, compare 25 telecom tariff plans, and view personalized recommendations.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-base shadow-xl shadow-red-600/40 active:scale-95 transition-all flex items-center gap-2"
              >
                <LogIn className="w-5 h-5 stroke-[2.5]" />
                <span>Log In / Sign Up with Gmail OTP</span>
              </button>
            </div>
          </div>
        )}

        <div className={`space-y-16 transition-all duration-300 ${!isLoggedIn ? 'blur-md pointer-events-none select-none opacity-40' : ''}`}>

        {/* SECTION 2: CUSTOMER TYPE */}
        <section id="customer-type-section" className="space-y-6 scroll-mt-24">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className={`text-2xl sm:text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Select Customer Type
            </h2>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
              Choose your profile style to customize usage details and plan optimization parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                id: 'Individual',
                title: 'Individual',
                desc: 'Single SIM mobile user. Personal data, 5G streaming, and voice calls.',
                icon: User,
              },
              {
                id: 'Family',
                title: 'Family',
                desc: 'Multi-member pooled share plan (2 to 5 members) with shared OTT perks.',
                icon: Users,
              },
              {
                id: 'Business',
                title: 'Business',
                desc: 'Commercial fleet plan with CUG calling, business tools & enterprise roaming.',
                icon: Briefcase,
              },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setCustomerType(item.id);
                  if (item.id === 'Family' && memberCount === 1) setMemberCount(3);
                  if (item.id === 'Business' && memberCount === 1) setMemberCount(10);
                }}
                className={`cursor-pointer rounded-2xl p-6 border-2 transition-all relative overflow-hidden ${
                  customerType === item.id
                    ? isDarkMode
                      ? 'border-red-500 bg-red-950/20 shadow-lg shadow-red-950/30 ring-2 ring-red-500/20'
                      : 'border-red-600 bg-red-50 shadow-md ring-2 ring-red-600/30'
                    : isDarkMode
                    ? 'border-red-950/60 bg-zinc-900/60 hover:border-red-900/60'
                    : 'border-slate-300 bg-white hover:border-slate-400 shadow-sm'
                }`}
              >
                {customerType === item.id && (
                  <span className="absolute top-4 right-4 h-6 w-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </span>
                )}

                <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${
                  customerType === item.id
                    ? 'bg-gradient-to-tr from-red-600 to-rose-600 text-white'
                    : isDarkMode ? 'bg-zinc-900 text-rose-400 border border-red-950/60' : 'bg-slate-100 text-red-700'
                }`}>
                  <item.icon className="w-6 h-6" />
                </div>

                <h3 className={`text-lg font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {item.title}
                </h3>
                <p className={`text-xs font-medium leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-slate-700'}`}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: USAGE DETAILS FORM */}
        <section id="usage-form-section" className={`rounded-3xl p-6 sm:p-8 border shadow-xl scroll-mt-24 ${
          isDarkMode ? 'bg-zinc-900/80 border-red-950/60' : 'bg-white border-slate-200'
        }`}>
          <div className="space-y-1 mb-8">
            <h2 className={`text-2xl sm:text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Usage Details Form
            </h2>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
              Input your actual or estimated monthly mobile phone usage metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Field 1: Data usage */}
            <div className={`p-5 rounded-2xl border space-y-3 ${
              isDarkMode ? 'bg-zinc-950/80 border-red-950/50' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <label className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
                  isDarkMode ? 'text-rose-400' : 'text-red-800'
                }`}>
                  <Zap className="w-4 h-4 text-rose-500" />
                  <span>Data Usage (GB/mo)</span>
                </label>
                <span className={`text-sm font-extrabold px-2.5 py-0.5 rounded-lg border ${
                  isDarkMode 
                    ? 'text-white bg-red-500/20 border-red-500/30' 
                    : 'text-slate-900 bg-red-100 border-red-300'
                }`}>
                  {dataGB} GB
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="500"
                step="5"
                value={dataGB}
                onChange={(e) => setDataGB(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
              <div className={`flex justify-between text-[11px] font-bold ${
                isDarkMode ? 'text-zinc-500' : 'text-slate-600'
              }`}>
                <span>5 GB</span>
                <span>250 GB</span>
                <span>500 GB</span>
              </div>
            </div>

            {/* Field 2: Call minutes */}
            <div className={`p-5 rounded-2xl border space-y-3 ${
              isDarkMode ? 'bg-zinc-950/80 border-red-950/50' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <label className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
                  isDarkMode ? 'text-rose-400' : 'text-red-800'
                }`}>
                  <Phone className="w-4 h-4 text-rose-500" />
                  <span>Call Minutes (Mins/mo)</span>
                </label>
                <span className={`text-sm font-extrabold px-2.5 py-0.5 rounded-lg border ${
                  isDarkMode 
                    ? 'text-white bg-red-500/20 border-red-500/30' 
                    : 'text-slate-900 bg-red-100 border-red-300'
                }`}>
                  {callMin} mins
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={callMin}
                onChange={(e) => setCallMin(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
              <div className={`flex justify-between text-[11px] font-bold ${
                isDarkMode ? 'text-zinc-500' : 'text-slate-600'
              }`}>
                <span>100 mins</span>
                <span>2500 mins</span>
                <span>5000 mins</span>
              </div>
            </div>

            {/* Field 3: SMS */}
            <div className={`p-5 rounded-2xl border space-y-3 ${
              isDarkMode ? 'bg-zinc-950/80 border-red-950/50' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <label className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
                  isDarkMode ? 'text-rose-400' : 'text-red-800'
                }`}>
                  <MessageSquare className="w-4 h-4 text-rose-500" />
                  <span>SMS Usage (Msgs/mo)</span>
                </label>
                <span className={`text-sm font-extrabold px-2.5 py-0.5 rounded-lg border ${
                  isDarkMode 
                    ? 'text-white bg-red-500/20 border-red-500/30' 
                    : 'text-slate-900 bg-red-100 border-red-300'
                }`}>
                  {smsCount} SMS
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="50"
                value={smsCount}
                onChange={(e) => setSmsCount(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
              <div className={`flex justify-between text-[11px] font-bold ${
                isDarkMode ? 'text-zinc-500' : 'text-slate-600'
              }`}>
                <span>0</span>
                <span>500</span>
                <span>1000</span>
              </div>
            </div>

            {/* Field 4: Current recharge */}
            <div className={`p-5 rounded-2xl border space-y-3 ${
              isDarkMode ? 'bg-zinc-950/80 border-red-950/50' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <label className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
                  isDarkMode ? 'text-rose-400' : 'text-red-800'
                }`}>
                  <Wallet className="w-4 h-4 text-emerald-500" />
                  <span>Current Recharge (₹/mo)</span>
                </label>
                <span className={`text-sm font-extrabold px-2.5 py-0.5 rounded-lg border ${
                  isDarkMode 
                    ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' 
                    : 'text-emerald-900 bg-emerald-100 border-emerald-300'
                }`}>
                  ₹{rechargeBudget}
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="3000"
                step="50"
                value={rechargeBudget}
                onChange={(e) => setRechargeBudget(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className={`flex justify-between text-[11px] font-bold ${
                isDarkMode ? 'text-zinc-500' : 'text-slate-600'
              }`}>
                <span>₹100</span>
                <span>₹1500</span>
                <span>₹3000</span>
              </div>
            </div>

            {/* Field 5: 5G usage */}
            <div className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${
              isDarkMode ? 'bg-zinc-950/80 border-red-950/50' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <label className={`text-xs font-extrabold uppercase tracking-wider block ${
                  isDarkMode ? 'text-rose-400' : 'text-red-800'
                }`}>
                  5G Usage Required
                </label>
                <span className={`text-xs font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Require unthrottled 5G speeds
                </span>
              </div>
              <button
                type="button"
                onClick={() => setUse5G(!use5G)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  use5G ? 'bg-red-600' : 'bg-zinc-700'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  use5G ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Field 6: Data roaming */}
            <div className={`p-5 rounded-2xl border space-y-2 ${
              isDarkMode ? 'bg-zinc-950/80 border-red-950/50' : 'bg-slate-50 border-slate-200'
            }`}>
              <label className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
                isDarkMode ? 'text-rose-400' : 'text-red-800'
              }`}>
                <Globe className="w-4 h-4 text-rose-500" />
                <span>Data Roaming</span>
              </label>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { id: 'none', label: 'None' },
                  { id: 'domestic', label: 'Domestic' },
                  { id: 'international', label: 'Global' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setDataRoaming(r.id)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                      dataRoaming === r.id
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 border-red-500 text-white shadow-sm'
                        : isDarkMode
                        ? 'bg-zinc-900 border-red-950/60 text-zinc-300 hover:bg-zinc-800'
                        : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 7: Number of family members or business users */}
            {customerType !== 'Individual' && (
              <div className={`p-5 rounded-2xl border space-y-3 md:col-span-2 lg:col-span-3 ${
                isDarkMode ? 'bg-red-950/20 border-red-900/50' : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <label className={`text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
                    isDarkMode ? 'text-rose-400' : 'text-red-900'
                  }`}>
                    <Users className="w-4 h-4 text-rose-500" />
                    <span>Number of {customerType === 'Family' ? 'Family Members' : 'Business Users'}</span>
                  </label>
                  <span className={`text-sm font-extrabold px-3 py-0.5 rounded-lg border ${
                    isDarkMode 
                      ? 'text-rose-300 bg-red-500/20 border-red-500/30' 
                      : 'text-red-900 bg-red-100 border-red-300'
                  }`}>
                    {memberCount} Users
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max={customerType === 'Family' ? '5' : '30'}
                  step="1"
                  value={memberCount}
                  onChange={(e) => setMemberCount(Number(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer"
                />
                <div className={`flex justify-between text-[11px] font-bold ${
                  isDarkMode ? 'text-zinc-400' : 'text-slate-600'
                }`}>
                  <span>2 Members</span>
                  <span>{customerType === 'Family' ? '5 Members' : '30 Members'}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6 border-t border-red-950/40 md:col-span-2 lg:col-span-3 flex justify-center sm:justify-end">
              <button
                type="button"
                onClick={handleSubmitUsageForm}
                disabled={isCalculating}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm shadow-xl shadow-red-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
              >
                {isCalculating ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin text-rose-300" />
                    <span>Calculating AI Recommendations...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-rose-300" />
                    <span>Submit & Get AI Recommendations</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

          </div>
        </section>

        {/* SECTION 4: AI ANALYSIS & K-MEANS CLUSTER */}
        <section id="ai-analysis-section" className={`rounded-3xl p-6 sm:p-8 border shadow-2xl relative overflow-hidden scroll-mt-24 ${
          isDarkMode ? 'bg-gradient-to-br from-[#0c0507] via-zinc-900 to-[#080304] border-red-950/70' : 'bg-white border-slate-200'
        }`}>
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b relative z-10 ${
            isDarkMode ? 'border-red-950/60' : 'border-slate-200'
          }`}>
            <div className="space-y-1">
              <h2 className={`text-2xl sm:text-3xl font-extrabold flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                <span>AI Analysis & K-Means Clustering</span>
              </h2>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                Real-time machine learning cluster matching based on telemetry input vectors.
              </p>
            </div>

            {/* K-Means Cluster Badge */}
            <div className={`px-5 py-3 rounded-2xl border flex items-center gap-3 shrink-0 shadow-lg ${
              isDarkMode 
                ? 'bg-red-500/15 border-red-500/40 text-rose-300' 
                : 'bg-red-50 border-red-300 text-red-950'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-red-600/40">
                {aiResults.clusterId}
              </div>
              <div>
                <span className={`text-[10px] uppercase font-extrabold block tracking-wider ${
                  isDarkMode ? 'text-rose-400' : 'text-red-700'
                }`}>K-Means Cluster</span>
                <span className={`text-sm font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {aiResults.clusterName}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 relative z-10">
            {/* AI Vector Characteristics */}
            <div className="space-y-4">
              <h3 className={`text-xs font-extrabold uppercase tracking-wider ${
                isDarkMode ? 'text-zinc-400' : 'text-slate-600'
              }`}>
                Cluster Model Insights
              </h3>
              <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-slate-800'}`}>
                {aiResults.clusterDescription}
              </p>

              <div className="space-y-2 pt-2">
                {aiResults.aiAnalysis.map((item, idx) => (
                  <div key={idx} className={`flex items-center gap-2.5 text-xs font-semibold ${
                    isDarkMode ? 'text-zinc-300' : 'text-slate-800'
                  }`}>
                    <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Radar Processing Visual */}
            <div className={`p-5 rounded-2xl border space-y-4 ${
              isDarkMode ? 'bg-zinc-950/80 border-red-950/60' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between text-xs font-extrabold">
                <span className={isDarkMode ? 'text-zinc-400' : 'text-slate-600'}>Vector Fit Accuracy</span>
                <span className="text-rose-400 font-mono">98.4% Confidence</span>
              </div>

              <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 h-full w-[98%]" />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div className={`p-2.5 rounded-xl border ${
                  isDarkMode ? 'bg-[#0b0507] border-red-950/60' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <span className={`text-[10px] block uppercase font-extrabold ${
                    isDarkMode ? 'text-zinc-500' : 'text-slate-600'
                  }`}>Matched Category</span>
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-rose-300' : 'text-red-800'}`}>
                    {aiResults.top3Plans[0]?.category}
                  </span>
                </div>
                <div className={`p-2.5 rounded-xl border ${
                  isDarkMode ? 'bg-[#0b0507] border-red-950/60' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <span className={`text-[10px] block uppercase font-extrabold ${
                    isDarkMode ? 'text-zinc-500' : 'text-slate-600'
                  }`}>Optimal Cost</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{aiResults.top3Plans[0]?.price}/mo
                  </span>
                </div>
                <div className={`p-2.5 rounded-xl border ${
                  isDarkMode ? 'bg-[#0b0507] border-red-950/60' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <span className={`text-[10px] block uppercase font-extrabold ${
                    isDarkMode ? 'text-zinc-500' : 'text-slate-600'
                  }`}>Operator Leader</span>
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-rose-300' : 'text-red-800'}`}>
                    {aiResults.top3Plans[0]?.operator}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: RECOMMENDATION RESULT (TOP 3 PLANS) */}
        <section id="top3-recommendations-section" className="space-y-6 scroll-mt-24">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className={`text-2xl sm:text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Recommendation Result (Top 3 Plans)
            </h2>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
              Top 3 AI-matched telecom tariff plans customized to your usage requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aiResults.top3Plans.map((plan, rank) => (
              <div
                key={plan.id}
                className={`rounded-3xl p-6 border-2 transition-all relative flex flex-col justify-between ${
                  rank === 0
                    ? isDarkMode
                      ? 'border-red-500 bg-gradient-to-b from-red-950/30 via-zinc-900 to-zinc-950 shadow-2xl shadow-red-950/50 ring-2 ring-red-500/20'
                      : 'border-red-500 bg-white shadow-xl ring-2 ring-red-500/30'
                    : isDarkMode
                    ? 'border-red-950/60 bg-zinc-900/80'
                    : 'border-slate-200 bg-white shadow-md'
                }`}
              >
                {/* Top Rank Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    rank === 0 
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-extrabold shadow-md' 
                      : isDarkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}>
                    #{rank + 1} Best Match
                  </span>

                  <span className={`text-xs font-mono font-extrabold px-2.5 py-1 rounded-full border ${
                    isDarkMode 
                      ? 'text-rose-400 bg-red-500/10 border-red-500/30' 
                      : 'text-red-900 bg-red-100 border-red-300'
                  }`}>
                    {plan.recommendationScore}% Score
                  </span>
                </div>

                <div className="space-y-4 flex-1">
                  <div>
                    <span className={`text-xs font-bold uppercase tracking-wider block ${
                      isDarkMode ? 'text-zinc-400' : 'text-slate-500'
                    }`}>
                      {plan.operator} • {plan.category}
                    </span>
                    <h3 className={`text-xl font-black mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {plan.title}
                    </h3>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-black ${isDarkMode ? 'text-rose-400' : 'text-red-700'}`}>
                      ₹{plan.price}
                    </span>
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                      / month
                    </span>
                  </div>

                  {/* Key Features */}
                  <div className={`space-y-2 pt-2 border-t ${isDarkMode ? 'border-red-950/60' : 'border-slate-200'}`}>
                    <div className={`flex items-center gap-2 text-xs font-bold ${
                      isDarkMode ? 'text-zinc-200' : 'text-slate-800'
                    }`}>
                      <Zap className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Data: {plan.data}</span>
                    </div>

                    <div className={`flex items-center gap-2 text-xs font-bold ${
                      isDarkMode ? 'text-zinc-200' : 'text-slate-800'
                    }`}>
                      <Phone className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Calls: {plan.calls}</span>
                    </div>

                    <div className="space-y-1 pt-1">
                      <span className={`text-[11px] font-bold uppercase block ${
                        isDarkMode ? 'text-zinc-400' : 'text-slate-600'
                      }`}>Other Benefits:</span>
                      {plan.otherBenefits.map((b, idx) => (
                        <div key={idx} className={`flex items-center gap-1.5 text-xs font-semibold ${
                          isDarkMode ? 'text-zinc-300' : 'text-slate-700'
                        }`}>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* "Why This Plan?" CTA */}
                <div className={`pt-6 mt-6 border-t ${isDarkMode ? 'border-red-950/60' : 'border-slate-200'}`}>
                  <button
                    onClick={() => setSelectedWhyPlan(plan)}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-all ${
                      isDarkMode 
                        ? 'bg-red-950/30 hover:bg-red-900/40 text-rose-300 border-red-900/50' 
                        : 'bg-red-50 hover:bg-red-100 text-red-900 border-red-200 shadow-sm'
                    }`}
                  >
                    <Info className="w-4 h-4 text-rose-500" />
                    <span>Why This Plan?</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6 MODAL: WHY THIS PLAN? */}
        <AnimatePresence>
          {selectedWhyPlan && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 border shadow-2xl space-y-6 relative ${
                  isDarkMode ? 'bg-[#0b0507] border-red-950/80 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <button
                  onClick={() => setSelectedWhyPlan(null)}
                  className={`absolute top-5 right-5 p-2 rounded-full transition-colors ${
                    isDarkMode ? 'hover:bg-red-950/50 text-zinc-400 hover:text-white' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="space-y-1">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-rose-400">
                    Why This Plan Analysis
                  </span>
                  <h3 className="text-xl font-black">{selectedWhyPlan.title}</h3>
                  <p className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                    {selectedWhyPlan.operator} • ₹{selectedWhyPlan.price}/mo
                  </p>
                </div>

                {/* Match Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3.5 rounded-xl border ${
                    isDarkMode ? 'bg-zinc-950 border-red-950/60' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`text-[10px] uppercase font-bold block ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                      Data Match
                    </span>
                    <span className="text-lg font-black text-rose-400">{selectedWhyPlan.whyThisPlan.dataMatch}</span>
                  </div>

                  <div className={`p-3.5 rounded-xl border ${
                    isDarkMode ? 'bg-zinc-950 border-red-950/60' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`text-[10px] uppercase font-bold block ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                      Call Match
                    </span>
                    <span className="text-lg font-black text-rose-400">{selectedWhyPlan.whyThisPlan.callMatch}</span>
                  </div>

                  <div className={`p-3.5 rounded-xl border ${
                    isDarkMode ? 'bg-zinc-950 border-red-950/60' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`text-[10px] uppercase font-bold block ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                      Budget Match
                    </span>
                    <span className="text-lg font-black text-emerald-500">{selectedWhyPlan.whyThisPlan.budgetMatch}</span>
                  </div>

                  <div className={`p-3.5 rounded-xl border ${
                    isDarkMode ? 'bg-zinc-950 border-red-950/60' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`text-[10px] uppercase font-bold block ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                      5G Match
                    </span>
                    <span className="text-lg font-black text-amber-500">{selectedWhyPlan.whyThisPlan.match5G}</span>
                  </div>
                </div>

                {/* Overall Customer Fit Description */}
                <div className={`p-4 rounded-xl border space-y-1 ${
                  isDarkMode 
                    ? 'bg-red-500/10 border-red-500/30' 
                    : 'bg-red-50 border-red-200 text-slate-800'
                }`}>
                  <span className="text-xs font-bold text-rose-400 block uppercase">Overall Customer Fit</span>
                  <p className={`text-xs font-medium leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-slate-800'}`}>
                    {selectedWhyPlan.whyThisPlan.overallFit} {selectedWhyPlan.reason}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setSelectedWhyPlan(null)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs shadow-md hover:from-red-500 hover:to-rose-500 transition-all"
                  >
                    Got It
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION 7: COMPARE PLANS */}
        <section id="compare-plans-section" className="space-y-6 scroll-mt-24">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className={`text-2xl sm:text-3xl font-extrabold flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              <Scale className="w-6 h-6 text-rose-500" />
              <span>Compare Top 3 Plans Side by Side</span>
            </h2>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
              Detailed side-by-side feature comparison matrix of your top recommended tariff options.
            </p>
          </div>

          <div className={`rounded-3xl border overflow-x-auto shadow-xl ${
            isDarkMode ? 'bg-zinc-900/80 border-red-950/60' : 'bg-white border-slate-200'
          }`}>
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className={`border-b ${
                  isDarkMode ? 'border-red-950/60 bg-zinc-950' : 'border-slate-200 bg-slate-100'
                }`}>
                  <th className={`p-4 text-xs font-extrabold uppercase tracking-wider w-1/4 ${
                    isDarkMode ? 'text-zinc-400' : 'text-slate-700'
                  }`}>Feature</th>
                  {aiResults.top3Plans.map((plan, i) => (
                    <th key={plan.id} className={`p-4 text-sm font-extrabold w-1/4 ${
                      isDarkMode ? 'text-rose-300' : 'text-red-900'
                    }`}>
                      #{i + 1} {plan.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y text-xs ${
                isDarkMode ? 'divide-red-950/40' : 'divide-slate-200'
              }`}>
                <tr>
                  <td className={`p-4 font-bold ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>Operator</td>
                  {aiResults.top3Plans.map((p) => (
                    <td key={p.id} className={`p-4 font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{p.operator}</td>
                  ))}
                </tr>

                <tr>
                  <td className={`p-4 font-bold ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>Match Score</td>
                  {aiResults.top3Plans.map((p) => (
                    <td key={p.id} className="p-4 font-black text-rose-400 text-sm">{p.recommendationScore}%</td>
                  ))}
                </tr>

                <tr>
                  <td className={`p-4 font-bold ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>Monthly Price</td>
                  {aiResults.top3Plans.map((p) => (
                    <td key={p.id} className="p-4 font-black text-emerald-600 dark:text-emerald-400 text-sm">₹{p.price}/mo</td>
                  ))}
                </tr>

                <tr>
                  <td className={`p-4 font-bold ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>Data Allowance</td>
                  {aiResults.top3Plans.map((p) => (
                    <td key={p.id} className={`p-4 font-semibold ${isDarkMode ? 'text-zinc-300' : 'text-slate-800'}`}>{p.data}</td>
                  ))}
                </tr>

                <tr>
                  <td className={`p-4 font-bold ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>Call Minutes</td>
                  {aiResults.top3Plans.map((p) => (
                    <td key={p.id} className={`p-4 font-semibold ${isDarkMode ? 'text-zinc-300' : 'text-slate-800'}`}>{p.calls}</td>
                  ))}
                </tr>

                <tr>
                  <td className={`p-4 font-bold ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>5G Support</td>
                  {aiResults.top3Plans.map((p) => (
                    <td key={p.id} className="p-4">
                      {p.has5G ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Supported
                        </span>
                      ) : (
                        <span className={`font-semibold ${isDarkMode ? 'text-zinc-500' : 'text-slate-500'}`}>4G Only</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className={`p-4 font-bold ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>Other Benefits</td>
                  {aiResults.top3Plans.map((p) => (
                    <td key={p.id} className="p-4 space-y-1">
                      {p.otherBenefits.map((b, idx) => (
                        <div key={idx} className={`text-[11px] font-medium ${isDarkMode ? 'text-zinc-300' : 'text-slate-700'}`}>• {b}</div>
                      ))}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 8: ALL PLANS (25 PLANS) & FILTERS */}
        <section id="all-plans-section" className="space-y-6 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className={`text-2xl sm:text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                All Telecom Plans (25 Total)
              </h2>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                Explore all 25 tariff plans with filter options for Customer Type, Category, and Price.
              </p>
            </div>

            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border shrink-0 ${
              isDarkMode ? 'text-zinc-300 bg-zinc-900 border-red-950/60' : 'text-slate-800 bg-white border-slate-300 shadow-sm'
            }`}>
              Showing {filteredAllPlans.length} of 25 Plans
            </span>
          </div>

          {/* Filters Bar */}
          <div className={`p-5 rounded-2xl border space-y-4 ${
            isDarkMode ? 'bg-zinc-900/80 border-red-950/60' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Filter 1: Customer Type */}
              <div>
                <label className={`text-xs font-extrabold uppercase block mb-1.5 ${
                  isDarkMode ? 'text-zinc-400' : 'text-slate-700'
                }`}>
                  Filter by Customer Type
                </label>
                <select
                  value={allPlansCustomerFilter}
                  onChange={(e) => setAllPlansCustomerFilter(e.target.value)}
                  className={`w-full p-2.5 rounded-xl text-xs font-bold border focus:ring-2 focus:ring-red-500 ${
                    isDarkMode ? 'bg-zinc-950 border-red-950/60 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="All">All Customer Types</option>
                  <option value="Individual">Individual</option>
                  <option value="Family">Family</option>
                  <option value="Business">Business</option>
                </select>
              </div>

              {/* Filter 2: Category */}
              <div>
                <label className={`text-xs font-extrabold uppercase block mb-1.5 ${
                  isDarkMode ? 'text-zinc-400' : 'text-slate-700'
                }`}>
                  Filter by Category
                </label>
                <select
                  value={allPlansCategoryFilter}
                  onChange={(e) => setAllPlansCategoryFilter(e.target.value)}
                  className={`w-full p-2.5 rounded-xl text-xs font-bold border focus:ring-2 focus:ring-red-500 ${
                    isDarkMode ? 'bg-zinc-950 border-red-950/60 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="All">All Categories</option>
                  <option value="Unlimited 5G">Unlimited 5G</option>
                  <option value="Data Pack">Data Pack</option>
                  <option value="Family Share">Family Share</option>
                  <option value="Business Suite">Business Suite</option>
                  <option value="Long Validity">Long Validity</option>
                </select>
              </div>

              {/* Filter 3: Max Price Slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={`text-xs font-extrabold uppercase ${
                    isDarkMode ? 'text-zinc-400' : 'text-slate-700'
                  }`}>
                    Max Price: ₹{allPlansMaxPrice}
                  </label>
                </div>
                <input
                  type="range"
                  min="100"
                  max="3000"
                  step="100"
                  value={allPlansMaxPrice}
                  onChange={(e) => setAllPlansMaxPrice(Number(e.target.value))}
                  className="w-full accent-red-600 cursor-pointer mt-1"
                />
              </div>

            </div>
          </div>

          {/* SECTION 9: NO PLAN FOUND STATE */}
          {filteredAllPlans.length === 0 ? (
            <div className={`p-12 rounded-3xl border text-center space-y-4 ${
              isDarkMode ? 'bg-zinc-900/60 border-red-950/60' : 'bg-white border-slate-200 shadow-md'
            }`}>
              <div className="w-16 h-16 rounded-full bg-red-500/10 text-rose-400 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className={`text-xl font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  No Suitable Plan Found
                </h3>
                <p className={`text-sm font-medium max-w-md mx-auto ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                  No suitable plan found. Try changing your requirements or adjusting the price/category filters.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Filters & Show All 25 Plans</span>
              </button>
            </div>
          ) : (
            /* ALL 25 PLANS GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAllPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                    isDarkMode 
                      ? 'bg-zinc-900 border-red-950/60 hover:border-red-900/60' 
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        isDarkMode ? 'bg-red-500/20 text-rose-300' : 'bg-red-100 text-red-900'
                      }`}>
                        {plan.operator} • {plan.customerType}
                      </span>
                      <span className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                        {plan.recommendationScore}% Fit
                      </span>
                    </div>

                    <div>
                      <h4 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {plan.title}
                      </h4>
                      <p className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                        {plan.category}
                      </p>
                    </div>

                    <div className={`text-2xl font-black ${isDarkMode ? 'text-rose-400' : 'text-red-700'}`}>
                      ₹{plan.price} <span className={`text-xs font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>/ mo</span>
                    </div>

                    <div className={`space-y-1.5 pt-2 border-t text-xs ${
                      isDarkMode ? 'border-red-950/60 text-zinc-300' : 'border-slate-200 text-slate-800 font-medium'
                    }`}>
                      <div><strong className={isDarkMode ? 'text-zinc-400' : 'text-slate-600'}>Data:</strong> {plan.data}</div>
                      <div><strong className={isDarkMode ? 'text-zinc-400' : 'text-slate-600'}>Calls:</strong> {plan.calls}</div>
                      <div><strong className={isDarkMode ? 'text-zinc-400' : 'text-slate-600'}>SMS:</strong> {plan.sms}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedWhyPlan(plan)}
                    className={`w-full mt-4 py-2 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-1.5 ${
                      isDarkMode 
                        ? 'bg-[#090305] hover:bg-red-950/40 text-zinc-300 border-red-950/60' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-200'
                    }`}
                  >
                    <Info className="w-3.5 h-3.5 text-rose-400" />
                    <span>View Plan Details & Fit</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        </div>
      </div>

      {/* FOOTER */}
      <footer className={`border-t py-8 transition-colors ${
        isDarkMode ? 'border-red-950/60 bg-[#060203] text-zinc-500' : 'border-slate-200 bg-white text-slate-600'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs space-y-2 font-medium">
          <p>© {new Date().getFullYear()} TelePlan AI — AI-Powered Tariff Plan Recommendation System.</p>
          <p className={isDarkMode ? 'text-zinc-600' : 'text-slate-500'}>
            Real-time K-Means cluster telemetry analysis & 25-plan tariff matching engine.
          </p>
        </div>
      </footer>

      {/* GMAIL OTP AUTH MODAL */}
      <GmailOtpAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* USER PROFILE & DIGITAL TWIN MODAL */}
      <AnimatePresence>
        {profileModalOpen && currentUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`w-full max-w-md rounded-3xl p-6 sm:p-8 border shadow-2xl relative overflow-hidden ${
                isDarkMode ? 'bg-[#0b0507] border-red-950/80 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <button
                onClick={() => setProfileModalOpen(false)}
                className={`absolute top-5 right-5 p-2 rounded-full transition-colors ${
                  isDarkMode ? 'hover:bg-red-950/50 text-zinc-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center space-y-3 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 p-0.5 shadow-lg shadow-red-600/40">
                  <div className="w-full h-full bg-[#0a0406] rounded-full flex items-center justify-center text-rose-400 font-black text-2xl">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-rose-400 text-xs font-bold mb-1">
                    <BadgeCheck className="w-4 h-4" />
                    <span>OTP Verified Gmail Account</span>
                  </div>
                  <h3 className="text-xl font-extrabold">{currentUser.name}</h3>
                  <p className="text-xs text-zinc-400 font-medium">{currentUser.email}</p>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border space-y-3 ${
                isDarkMode ? 'bg-zinc-950 border-red-950/60' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-medium">Customer ID</span>
                  <span className="font-mono font-bold text-rose-400">{currentUser.id}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-medium">Member Since</span>
                  <span className="font-bold text-zinc-300">{currentUser.memberSince || 'August 2026'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-medium">Authentication</span>
                  <span className="font-bold text-emerald-400">Gmail 4-Digit OTP</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-medium">Current Telemetry Twin</span>
                  <span className="font-bold text-rose-400">{aiResults.clusterName} ({aiResults.clusterId})</span>
                </div>
              </div>

              <div className="pt-6 space-y-3">
                <button
                  onClick={() => setProfileModalOpen(false)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs shadow-md transition-all"
                >
                  Return to Recommendation Twin
                </button>

                <button
                  onClick={() => {
                    setProfileModalOpen(false);
                    logout();
                  }}
                  className="w-full py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of Account</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI CHATBOT DRAWER & BOT.PY INTEGRATION */}
      <ChatbotDrawer />

    </div>
  );
}
