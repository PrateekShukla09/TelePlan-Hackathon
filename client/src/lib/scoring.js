// Client-side mirror of the backend's weighted-fit recommendation formula
// (server/src/serteleplances/recommendationEngine.js per the technical plan):
//
//   score(plan, profile) =
//       w1 * dataFit(plan.dataGB, profile.dataNeed)
//     + w2 * callFit(plan.callMinutes, profile.callNeed)
//     + w3 * budgetFit(plan.price, profile.budget)
//     + w4 * roamingMatch(plan.roamingIncluded, profile.roaming)
//     + w5 * clusterAffinity(plan.clusterIds, profile.clusterId)
//
// This mirror exists ONLY so the What-If Simulator and onboarding preteleplanew can
// react instantly in the browser. Whenever the real backend is reachable, its
// response is used as the source of truth — this is a client-side estimate,
// clearly labeled as such in the UI.

export const WEIGHTS = { data: 0.35, calling: 0.2, budget: 0.25, roaming: 0.1, persona: 0.1 };

const fitCurve = (have, need, isUnlimited = false) => {
  if (isUnlimited) return 1.0;
  if (need <= 0) return 1.0;
  if (have >= need) {
    const surplusRatio = (have - need) / need;
    return Math.max(0.85, 1.0 - Math.min(0.15, surplusRatio * 0.05));
  }
  // Heavy penalty for data shortfalls
  const ratio = have / need;
  return Math.max(0, ratio * ratio);
};

const budgetFit = (price, budget) => {
  if (!budget || budget <= 0) return 0.8;
  if (price <= budget) {
    const diffRatio = (budget - price) / budget;
    return Math.min(1.0, 0.9 + 0.1 * (1 - diffRatio));
  }
  const overRatio = (price - budget) / budget;
  return Math.max(0, 1.0 - overRatio * 1.5);
};

const roamingMatch = (planHasRoaming, needsRoaming) => {
  if (!needsRoaming) return planHasRoaming ? 0.9 : 1.0;
  return planHasRoaming ? 1.0 : 0.1;
};

const clusterAffinity = (plan, profile) => {
  let score = 0.7;
  const reqCustomerType = profile.customerType || (profile.user_type === 3 ? 'Business' : profile.user_type === 2 ? 'Family' : 'Individual');
  if (plan.customerType && reqCustomerType) {
    if (plan.customerType.toLowerCase() === reqCustomerType.toLowerCase()) {
      score += 0.3;
    } else if (reqCustomerType.toLowerCase() !== 'individual' && plan.customerType.toLowerCase() !== reqCustomerType.toLowerCase()) {
      score -= 0.4;
    }
  }
  return Math.max(0, Math.min(1, score));
};

export function scorePlan(plan, profile) {
  const needData = profile.dataGB || profile.monthly_data_gb || profile.dataNeedGB || (profile.dataNeed === 'high' ? 50 : profile.dataNeed === 'low' ? 5 : 15);
  const needCalls = profile.callMin || profile.total_call_minutes || profile.callNeedMin || (profile.callingNeed === 'high' ? 1500 : profile.callingNeed === 'low' ? 150 : 500);
  const budget = profile.budget || profile.monthly_recharge_amount || profile.rechargeBudget || 400;
  const roaming = Boolean(profile.roamingRequired || profile.dataRoaming === 'international');

  const haveData = plan.dataGB || plan.dataGBPerMonth || 0;
  const isUnlimited = Boolean(plan.unlimitedData || plan.unlimited5G);

  const dataFit = fitCurve(haveData, needData, isUnlimited);
  const callFit = fitCurve(plan.callMinutes || 3000, needCalls, (plan.callMinutes || 0) >= 3000);
  const bFit = budgetFit(plan.price, budget);
  const rFit = roamingMatch(Boolean(plan.hasRoaming || plan.roamingIncluded), roaming);
  const pFit = clusterAffinity(plan, profile);

  const weighted =
    WEIGHTS.data * dataFit +
    WEIGHTS.calling * callFit +
    WEIGHTS.budget * bFit +
    WEIGHTS.roaming * rFit +
    WEIGHTS.persona * pFit;

  return {
    total: Math.round(Math.max(0.65, Math.min(0.99, weighted)) * 100),
    breakdown: {
      dataFit: Math.round(clampUnit(dataFit) * 100),
      callingFit: Math.round(clampUnit(callFit) * 100),
      budgetFit: Math.round(clampUnit(bFit) * 100),
      roamingFit: Math.round(clampUnit(rFit) * 100),
      personaFit: Math.round(clampUnit(pFit) * 100),
    },
  };
}

const clampUnit = (v) => Math.min(1, Math.max(0, v));

export function rankPlans(plans, profile, topN = 3) {
  return plans
    .map((plan) => ({ plan, ...scorePlan(plan, profile) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, topN);
}

// Need-level ('low'|'medium'|'high') -> approximate numeric requirement,
// used by the onboarding flow before a precise number is known.
export const NEED_TO_GB = { low: 2, medium: 8, high: 25 };
export const NEED_TO_MIN = { low: 150, medium: 500, high: 1500 };
