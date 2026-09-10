import { http, callWithFallback, sleep } from './client';
import { demoPlans, demoCustomer, demoRecommendationHistory } from './mockData';
import { rankPlans } from '@/lib/scoring';

const buildExplanation = (plan, profile) =>
  `${plan.planName} is a strong fit because it lines up with your ${profile?.dataNeedGB ? `${profile.dataNeedGB}GB` : 'typical'} data use and stays close to your ${profile?.budget ? `₹${profile.budget}` : 'usual'} monthly budget, while ${plan.roamingIncluded ? 'covering the roaming access you need' : 'keeping cost down since you rarely roam'}.`;

const demoRecommend = (profile) => {
  const ranked = rankPlans(demoPlans, profile, 3);
  return ranked.map((r, i) => ({
    planId: r.plan._id,
    plan: r.plan,
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

function formatProfileForBackend(profile = {}) {
  if (!profile) return {};

  const monthly_data_gb = typeof profile.monthly_data_gb === 'number' ? profile.monthly_data_gb
    : typeof profile.dataNeedGB === 'number' ? profile.dataNeedGB
    : typeof profile.dataGB === 'number' ? profile.dataGB
    : profile.dataNeed === 'high' ? 30 : profile.dataNeed === 'low' ? 5 : 15;

  const total_call_minutes = typeof profile.total_call_minutes === 'number' ? profile.total_call_minutes
    : typeof profile.callNeedMin === 'number' ? profile.callNeedMin
    : typeof profile.callMin === 'number' ? profile.callMin
    : profile.callingNeed === 'high' ? 1200 : profile.callingNeed === 'low' ? 150 : 400;

  const sms_per_month = typeof profile.sms_per_month === 'number' ? profile.sms_per_month
    : typeof profile.smsCount === 'number' ? profile.smsCount
    : profile.smsNeed === 'high' ? 450 : profile.smsNeed === 'low' ? 30 : 100;

  let budget = typeof profile.monthly_recharge_amount === 'number' ? profile.monthly_recharge_amount
    : typeof profile.budget === 'number' ? profile.budget : profile.rechargeBudget;
  if (typeof budget === 'string') {
    budget = parseBudgetNumber(budget);
  }
  const monthly_recharge_amount = budget || 650;

  let user_type = 1;
  if (typeof profile.user_type === 'number') {
    user_type = profile.user_type;
  } else if (profile.customerType === 'Family' || profile.familyOrIndividual === 'family') {
    user_type = 2;
  } else if (profile.customerType === 'Business' || profile.familyOrIndividual === 'business') {
    user_type = 3;
  }

  const isRoaming = Boolean(profile.roamingRequired || profile.dataRoaming === 'domestic' || profile.dataRoaming === 'international' || (profile.roamingUsage && profile.roamingUsage > 0));
  const international_call_minutes = typeof profile.international_call_minutes === 'number' ? profile.international_call_minutes
    : profile.dataRoaming === 'international' ? 50 : isRoaming ? 10 : 0;

  return {
    dataNeed: monthly_data_gb <= 7 ? 'low' : monthly_data_gb >= 25 ? 'high' : 'medium',
    callingNeed: total_call_minutes <= 300 ? 'low' : total_call_minutes >= 1000 ? 'high' : 'medium',
    smsNeed: sms_per_month <= 50 ? 'low' : sms_per_month >= 300 ? 'high' : 'medium',
    budget: monthly_recharge_amount,
    roamingRequired: isRoaming,
    familyOrIndividual: user_type === 2 ? 'family' : user_type === 3 ? 'business' : 'individual',
    monthly_data_gb,
    total_call_minutes,
    sms_per_month,
    monthly_recharge_amount,
    user_type,
    international_call_minutes
  };
}

const normalizeRecommendationsResponse = (resData, profile) => {
  if (!resData || !Array.isArray(resData.plans)) return resData;
  console.log('🤖 [Frontend Received ML Model Recommendations]:', resData.plans);
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
