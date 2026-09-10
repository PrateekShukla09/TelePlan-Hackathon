import { http, callWithFallback, sleep } from './client';
import { demoPlans, demoCustomer, demoRecommendationHistory } from './mockData';
import { PLANS_DATA } from '@/data/plansData';
import { rankPlans } from '@/lib/scoring';

const buildExplanation = (plan, profile) => {
  const reqData = profile?.dataGB || profile?.monthly_data_gb || profile?.dataNeedGB || 15;
  const reqBudget = profile?.budget || profile?.monthly_recharge_amount || profile?.rechargeBudget || 400;
  const planDataStr = plan.unlimitedData ? 'Unlimited 5G Data' : `${plan.dataGB || plan.dataGBPerMonth || 56}GB`;
  return `XGBoost ML Recommended: ${plan.planName || plan.title} (${planDataStr}) — strong fit for your ${reqData}GB monthly data requirement and ₹${reqBudget} budget.`;
};

const demoRecommend = (profile) => {
  const candidatePlans = (PLANS_DATA && PLANS_DATA.length > 0) ? PLANS_DATA : demoPlans;
  const ranked = rankPlans(candidatePlans, profile, 3);
  return ranked.map((r, i) => ({
    planId: r.plan._id || r.plan.id,
    plan: {
      ...r.plan,
      _id: r.plan._id || r.plan.id,
      planName: r.plan.planName || r.plan.title,
    },
    score: r.total / 100,
    matchPercent: r.total,
    breakdown: r.breakdown,
    rank: i + 1,
    explanation: buildExplanation(r.plan, profile),
  }));
};

function parseBudgetNumber(val) {
  if (typeof val === 'number') return val;
  if (!val) return null;
  const matches = String(val).match(/\d+/g);
  if (!matches || matches.length === 0) return null;
  if (matches.length === 1) return Number(matches[0]);
  return Math.round((Number(matches[0]) + Number(matches[1])) / 2);
}

function formatProfileForBackend(profile) {
  if (!profile) return {};
  const dataGB = typeof profile.dataGB === 'number' ? profile.dataGB : (typeof profile.dataNeedGB === 'number' ? profile.dataNeedGB : 15);
  const callMin = typeof profile.callMin === 'number' ? profile.callMin : (typeof profile.callNeedMin === 'number' ? profile.callNeedMin : 400);
  const smsCount = typeof profile.smsCount === 'number' ? profile.smsCount : 100;
  
  let budget = profile.budget;
  if (typeof budget === 'string') {
    const num = parseBudgetNumber(budget);
    budget = num || null;
  }
  
  return {
    dataGB,
    dataNeedGB: dataGB,
    monthly_data_gb: dataGB,
    dataNeed: dataGB <= 7 ? 'low' : dataGB >= 25 ? 'high' : 'medium',
    
    callMin,
    callNeedMin: callMin,
    total_call_minutes: callMin,
    callingNeed: callMin <= 300 ? 'low' : callMin >= 1000 ? 'high' : 'medium',
    
    smsCount,
    sms_per_month: smsCount,
    smsNeed: smsCount <= 100 ? 'low' : smsCount >= 350 ? 'high' : 'medium',
    
    budget: budget || 400,
    monthly_recharge_amount: budget || 400,
    
    roamingRequired: Boolean(profile.roamingRequired),
    customerType: profile.customerType || 'Individual',
    familyOrIndividual: profile.customerType ? profile.customerType.toLowerCase() : 'individual',
    user_type: profile.customerType === 'Business' ? 3 : (profile.customerType === 'Family' ? 2 : 1),
    use5G: profile.use5G !== undefined ? Boolean(profile.use5G) : true,
    dataRoaming: profile.dataRoaming || 'none',
  };
}

const normalizeRecommendationsResponse = (resData, profile) => {
  if (!resData || !Array.isArray(resData.plans)) return resData;
  const plans = resData.plans.map((item, index) => {
    const plan = item.plan || item;
    const score = typeof item.score === 'number' ? item.score : 0.8;
    const matchPercent = item.matchPercent ?? Math.round(score * 100);
    return {
      planId: plan._id || plan.id,
      plan: {
        ...plan,
        _id: plan._id || plan.id,
        operator: plan.operator || plan.sourceOperatorRef || 'Telecom Core',
      },
      score,
      matchPercent,
      rank: item.rank ?? (index + 1),
      explanation: item.explanation || buildExplanation(plan, profile),
    };
  });
  return { ...resData, plans };
};

// POST /api/recommendations/by-customer/:id
export const getRecommendationsByCustomer = async (id, profile) => {
  const result = await callWithFallback(
    () => http.post(`/recommendations/by-customer/${id}`),
    async () => {
      await sleep(300);
      return { plans: demoRecommend(profile || defaultProfileFromCustomer()) };
    },
  );
  if (result.data) {
    result.data = normalizeRecommendationsResponse(result.data, profile);
  }
  return result;
};

// POST /api/recommendations/by-profile
export const getRecommendationsByProfile = async (profile) => {
  const payload = formatProfileForBackend(profile);
  const result = await callWithFallback(
    () => http.post('/recommendations/by-profile', { profile: payload }),
    async () => {
      await sleep(300);
      return { plans: demoRecommend(profile) };
    },
  );
  if (result.data) {
    result.data = normalizeRecommendationsResponse(result.data, profile);
  }
  return result;
};

export const getRecommendationHistory = (customerId) =>
  callWithFallback(
    () => http.get(`/customers/${customerId}/recommendations`),
    () => demoRecommendationHistory,
  );

function defaultProfileFromCustomer() {
  return {
    dataNeedGB: demoCustomer.usage.dataGB,
    callNeedMin: demoCustomer.usage.avgCallMin,
    budget: 650,
    roamingRequired: demoCustomer.usage.roamingUsage > 0,
    clusterId: demoCustomer.clusterId,
  };
}
