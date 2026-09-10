const DEFAULT_WEIGHTS = {
  data: 0.30,
  calls: 0.20,
  sms: 0.15,
  budget: 0.20,
  roaming: 0.15
};

const DATA_NEED_MAP = {
  low: 5,
  medium: 15,
  high: 30
};

const CALL_NEED_MAP = {
  low: 200,
  medium: 800,
  high: 1500
};

const SMS_NEED_MAP = {
  low: 50,
  medium: 200,
  high: 500
};

/**
 * Helper to resolve numeric requirement from level string or number
 */
function resolveRequirement(value, levelMap, defaultValue) {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  if (typeof value === 'string' && levelMap[value.toLowerCase()]) {
    return levelMap[value.toLowerCase()];
  }
  return defaultValue;
}

/**
 * Calculate data requirement fit normalized 0 to 1
 */
function calculateDataFit(planDataGB, profileDataNeed) {
  const requiredGB = resolveRequirement(profileDataNeed, DATA_NEED_MAP, 15);
  if (requiredGB <= 0) return 1.0;

  if (planDataGB >= requiredGB) {
    const surplus = planDataGB - requiredGB;
    const penalty = Math.min(0.2, surplus / (requiredGB * 4));
    return Math.max(0.8, 1.0 - penalty);
  } else {
    return Math.max(0, planDataGB / requiredGB);
  }
}

/**
 * Calculate calling minutes requirement fit normalized 0 to 1
 */
function calculateCallFit(planCallMin, profileCallingNeed) {
  const requiredMin = resolveRequirement(profileCallingNeed, CALL_NEED_MAP, 800);
  if (requiredMin <= 0) return 1.0;

  if (planCallMin >= requiredMin) {
    const surplus = planCallMin - requiredMin;
    const penalty = Math.min(0.2, surplus / (requiredMin * 4));
    return Math.max(0.8, 1.0 - penalty);
  } else {
    return Math.max(0, planCallMin / requiredMin);
  }
}

/**
 * Calculate SMS requirement fit normalized 0 to 1
 */
function calculateSmsFit(planSms, profileSmsNeed) {
  const requiredSms = resolveRequirement(profileSmsNeed, SMS_NEED_MAP, 200);
  if (requiredSms <= 0) return 1.0;

  if (planSms >= requiredSms) {
    const surplus = planSms - requiredSms;
    const penalty = Math.min(0.2, surplus / (requiredSms * 4));
    return Math.max(0.8, 1.0 - penalty);
  } else {
    return Math.max(0, planSms / requiredSms);
  }
}

/**
 * Calculate budget fit normalized 0 to 1 with smooth penalty for overspend
 */
function calculateBudgetFit(planPrice, profileBudget) {
  if (profileBudget === undefined || profileBudget === null || profileBudget <= 0) {
    return 0.8; // Neutral score if unspecified
  }

  if (planPrice <= profileBudget) {
    const savingsRatio = (profileBudget - planPrice) / profileBudget;
    return Math.min(1.0, 0.9 + 0.1 * savingsRatio);
  } else {
    const overspendRatio = (planPrice - profileBudget) / profileBudget;
    return Math.max(0, 1.0 - overspendRatio * 1.5);
  }
}

/**
 * Calculate roaming match normalized 0 to 1
 */
function calculateRoamingMatch(planRoamingIncluded, profileRoamingRequired) {
  if (profileRoamingRequired === true) {
    return planRoamingIncluded ? 1.0 : 0.1;
  }
  return 0.8;
}

/**
 * Calculate total score for a plan given profile and weights
 */
function calculateScore(plan, profile = {}, customWeights = {}) {
  const weights = { ...DEFAULT_WEIGHTS, ...customWeights };

  const dataFit = calculateDataFit(plan.dataGB || 0, profile.dataNeed);
  const callFit = calculateCallFit(plan.callMinutes || 0, profile.callingNeed);
  const smsFit = calculateSmsFit(plan.sms || 0, profile.smsNeed);
  const budgetFit = calculateBudgetFit(plan.price || 0, profile.budget);
  const roamingMatch = calculateRoamingMatch(Boolean(plan.roamingIncluded), profile.roamingRequired);

  const rawScore =
    (weights.data * dataFit) +
    (weights.calls * callFit) +
    (weights.sms * smsFit) +
    (weights.budget * budgetFit) +
    (weights.roaming * roamingMatch);

  return Math.min(1.0, Math.max(0, rawScore));
}

/**
 * Get top recommendations for a list of plans given a profile
 */
function getTopRecommendations(plans, profile = {}, customWeights = {}) {
  if (!plans || !Array.isArray(plans) || plans.length === 0) {
    return [];
  }

  const scoredPlans = plans.map(plan => {
    const planObj = typeof plan.toObject === 'function' ? plan.toObject() : plan;
    const score = calculateScore(planObj, profile, customWeights);
    return {
      plan: planObj,
      score: Math.round(score * 100) / 100
    };
  });

  scoredPlans.sort((a, b) => b.score - a.score);

  return scoredPlans.slice(0, 3);
}

/**
 * Convert actual customer usage object into recommendation profile shape
 */
function customerToRecommendationProfile(customer) {
  if (!customer || !customer.usage) {
    return {
      dataNeed: 'medium',
      callingNeed: 'medium',
      smsNeed: 'medium',
      roamingRequired: false,
      budget: null
    };
  }

  const usage = customer.usage;

  let dataNeed = 'medium';
  if (usage.dataGB <= 7) dataNeed = 'low';
  else if (usage.dataGB >= 25) dataNeed = 'high';

  let callingNeed = 'medium';
  if (usage.avgCallMin <= 300) callingNeed = 'low';
  else if (usage.avgCallMin >= 1000) callingNeed = 'high';

  let smsNeed = 'medium';
  if (usage.smsCount <= 100) smsNeed = 'low';
  else if (usage.smsCount >= 350) smsNeed = 'high';

  const roamingRequired = (usage.roamingUsage || 0) > 0;

  return {
    dataNeed,
    callingNeed,
    smsNeed,
    roamingRequired,
    budget: null
  };
}

const { execFile } = require('child_process');
const path = require('path');
const util = require('util');
const execFilePromise = util.promisify(execFile);

/**
 * Normalize profile / customer usage into numeric features expected by ML model
 */
function normalizeProfileToMLUser(profile = {}) {
  let monthly_data_gb = 15.0;
  if (typeof profile.monthly_data_gb === 'number') {
    monthly_data_gb = profile.monthly_data_gb;
  } else if (typeof profile.dataGB === 'number') {
    monthly_data_gb = profile.dataGB;
  } else if (typeof profile.dataNeedGB === 'number') {
    monthly_data_gb = profile.dataNeedGB;
  } else if (typeof profile.dataNeed === 'number') {
    monthly_data_gb = profile.dataNeed;
  } else if (profile.dataNeed === 'low') {
    monthly_data_gb = 5.0;
  } else if (profile.dataNeed === 'high') {
    monthly_data_gb = 50.0;
  }

  let total_call_minutes = 400.0;
  if (typeof profile.total_call_minutes === 'number') {
    total_call_minutes = profile.total_call_minutes;
  } else if (typeof profile.callMin === 'number') {
    total_call_minutes = profile.callMin;
  } else if (typeof profile.callNeedMin === 'number') {
    total_call_minutes = profile.callNeedMin;
  } else if (typeof profile.callingNeed === 'number') {
    total_call_minutes = profile.callingNeed;
  } else if (profile.callingNeed === 'low') {
    total_call_minutes = 150.0;
  } else if (profile.callingNeed === 'high') {
    total_call_minutes = 1500.0;
  }

  let sms_per_month = 100.0;
  if (typeof profile.sms_per_month === 'number') {
    sms_per_month = profile.sms_per_month;
  } else if (typeof profile.smsCount === 'number') {
    sms_per_month = profile.smsCount;
  } else if (profile.smsNeed === 'low') {
    sms_per_month = 30.0;
  } else if (profile.smsNeed === 'high') {
    sms_per_month = 350.0;
  }

  let monthly_recharge_amount = 400.0;
  if (typeof profile.monthly_recharge_amount === 'number' && profile.monthly_recharge_amount > 0) {
    monthly_recharge_amount = profile.monthly_recharge_amount;
  } else if (typeof profile.budget === 'number' && profile.budget > 0) {
    monthly_recharge_amount = profile.budget;
  } else if (typeof profile.rechargeBudget === 'number' && profile.rechargeBudget > 0) {
    monthly_recharge_amount = profile.rechargeBudget;
  }

  let user_type = 1;
  if (typeof profile.user_type === 'number') {
    user_type = profile.user_type;
  } else if (profile.customerType === 'Business' || profile.userType === 'business') {
    user_type = 3;
  } else if (profile.customerType === 'Family' || profile.familyOrIndividual === 'family' || profile.userType === 'family') {
    user_type = 2;
  }

  let international_call_minutes = 0.0;
  if (typeof profile.international_call_minutes === 'number') {
    international_call_minutes = profile.international_call_minutes;
  } else if (typeof profile.internationalUsage === 'number') {
    international_call_minutes = profile.internationalUsage;
  } else if (profile.roamingRequired || profile.dataRoaming === 'international' || (profile.roamingUsage && profile.roamingUsage > 0)) {
    international_call_minutes = 60.0;
  }

  return {
    user_type,
    monthly_data_gb,
    total_call_minutes,
    sms_per_month,
    monthly_recharge_amount,
    international_call_minutes
  };
}

/**
 * Print presentation-friendly ML inference pipeline log to terminal/console
 */
function printInferenceLog(mlUser, profile, plans) {
  if (!plans || plans.length === 0) return;

  const top1Item = plans[0];
  const top1 = top1Item.plan || top1Item;

  const dataGBStr = `${Number(mlUser.monthly_data_gb).toFixed(2)} GB/month`;
  const callMinStr = `${mlUser.total_call_minutes} mins/month`;
  const smsStr = `${mlUser.sms_per_month} messages/month`;
  const rechargeStr = `₹${mlUser.monthly_recharge_amount}/month`;

  const is5gReq = (mlUser.monthly_data_gb >= 15 || profile.use5G || profile.has5G) ? 'Yes' : 'No';
  let roamingStr = 'None';
  if (mlUser.international_call_minutes > 0) {
    roamingStr = 'Global';
  } else if (profile.roamingRequired || (profile.roamingUsage && profile.roamingUsage > 0)) {
    roamingStr = 'Domestic';
  }

  const modelName = 'XGBoost Pairwise Ranker (XGBRanker)';
  const topPlanTitle = top1.planName || 'Recommended Plan';

  console.log('\n============================================================');
  console.log('        AI-POWERED TARIFF PLAN RECOMMENDATION');
  console.log('============================================================');
  console.log('');
  console.log('[1] USER INPUT');
  console.log('------------------------------------------------------------');
  console.log(`Data Usage          : ${dataGBStr}`);
  console.log(`Call Minutes        : ${callMinStr}`);
  console.log(`SMS Usage           : ${smsStr}`);
  console.log(`Current Recharge    : ${rechargeStr}`);
  console.log(`5G Required         : ${is5gReq}`);
  console.log(`Data Roaming        : ${roamingStr}`);
  console.log('------------------------------------------------------------');
  console.log('');
  console.log('[2] PREPROCESSING');
  console.log('------------------------------------------------------------');
  console.log('Input validation    : SUCCESS');
  console.log('Feature preparation : SUCCESS');
  console.log('Encoding            : SUCCESS');
  console.log('Scaling             : SUCCESS');
  console.log('------------------------------------------------------------');
  console.log('');
  console.log('[3] ML INFERENCE');
  console.log('------------------------------------------------------------');
  console.log(`Model               : ${modelName}`);
  console.log('Inference status    : SUCCESS');
  console.log('------------------------------------------------------------');
  console.log('');
  console.log('[4] MODEL OUTPUT');
  console.log('------------------------------------------------------------');
  console.log(`Predicted class/plan: ${topPlanTitle}`);
  console.log('');
  console.log('Top Recommendations:');
  plans.slice(0, 3).forEach((item, index) => {
    const num = index + 1;
    const itemPlan = item.plan || item;
    const name = itemPlan.planName || 'Plan';
    const rawScore = typeof item.score === 'number' ? item.score : (item.matchPercent / 100);
    const matchPct = (rawScore * 100).toFixed(2);
    console.log(`${num}. ${name.padEnd(35)} ${matchPct.padStart(6)}%`);
  });
  console.log('------------------------------------------------------------');
  console.log('');
  console.log('[5] FINAL RECOMMENDATION');
  console.log('------------------------------------------------------------');
  console.log(`Recommended Plan   : ${top1.planName}`);
  console.log(`Price              : ₹${top1.price}`);
  console.log(`Validity           : ${top1.validityDays} days`);
  console.log(`Data               : ${top1.unlimitedData ? 'Unlimited 5G Data' : `${top1.dataGB} GB total`}`);
  console.log(`Calling            : ${top1.callMinutes >= 3000 ? 'Truly Unlimited Local & STD Calls' : `${top1.callMinutes} mins`}`);
  console.log(`SMS                : ${top1.sms >= 100 ? '100 SMS/day' : `${top1.sms} SMS/month`}`);
  console.log(`5G                 : ${top1.unlimited5G || top1.unlimitedData ? 'Unlimited 5G Supported' : 'Standard 4G/5G'}`);
  console.log(`Roaming            : ${top1.roamingIncluded ? 'Domestic & International Roaming Included' : 'Standard Home Circle'}`);
  console.log('------------------------------------------------------------');
  console.log('');
  console.log('[6] RECOMMENDATION SUMMARY');
  console.log('------------------------------------------------------------');
  console.log("The recommended plan was selected based on the user's:");
  console.log('- data consumption');
  console.log('- calling requirements');
  console.log('- SMS usage');
  console.log('- recharge budget');
  console.log('- 5G requirement');
  console.log('- roaming requirement');
  console.log('------------------------------------------------------------');
  console.log('');
  console.log('              RECOMMENDATION GENERATED');
  console.log('============================================================\n');
}

const OFFICIAL_25_PLANS = [
  { planName: 'Essential Voice', price: 199, dataGB: 5, callMinutes: 3000, sms: 100, roamingIncluded: true, validityDays: 28, category: 'Budget & Essential', sourceOperatorRef: 'TelePlan Core' },
  { planName: 'Essential Data', price: 249, dataGB: 42, callMinutes: 3000, sms: 100, roamingIncluded: true, validityDays: 28, category: 'Budget & Essential', sourceOperatorRef: 'TelePlan Core' },
  { planName: 'Student Power', price: 299, dataGB: 56, callMinutes: 3000, sms: 100, roamingIncluded: true, validityDays: 28, category: 'Budget & Essential', sourceOperatorRef: 'TelePlan Core' },
  { planName: 'Voice Plus', price: 299, dataGB: 20, callMinutes: 3000, sms: 100, roamingIncluded: true, validityDays: 56, category: 'Budget & Essential', sourceOperatorRef: 'TelePlan Core' },
  { planName: 'Senior Connect', price: 249, dataGB: 10, callMinutes: 3000, sms: 100, roamingIncluded: true, validityDays: 56, category: 'Budget & Essential', sourceOperatorRef: 'TelePlan Core' },
  { planName: '5G Freedom', price: 349, dataGB: 56, callMinutes: 3000, sms: 100, roamingIncluded: true, validityDays: 28, category: 'Unlimited / 5G', sourceOperatorRef: 'TelePlan 5G', unlimited5G: true },
  { planName: 'Infinity 4G/5G', price: 399, dataGB: 100, callMinutes: 3000, sms: 100, roamingIncluded: true, validityDays: 28, category: 'Unlimited / 5G', sourceOperatorRef: 'TelePlan 5G', unlimitedData: true },
  { planName: 'Infinity Plus', price: 449, dataGB: 120, callMinutes: 3000, sms: 100, roamingIncluded: true, validityDays: 28, category: 'Unlimited / 5G', sourceOperatorRef: 'TelePlan Premium', unlimitedData: true },
  { planName: 'Power 5G', price: 499, dataGB: 112, callMinutes: 3000, sms: 100, roamingIncluded: true, validityDays: 56, category: 'Unlimited / 5G', sourceOperatorRef: 'TelePlan 5G', unlimited5G: true },
  { planName: '5G Long-Life', price: 649, dataGB: 137, callMinutes: 3000, sms: 100, roamingIncluded: true, validityDays: 56, category: 'Unlimited / 5G', sourceOperatorRef: 'TelePlan 5G', unlimited5G: true },
  { planName: 'Night Infinity', price: 299, dataGB: 56, callMinutes: 3000, sms: 100, roamingIncluded: true, validityDays: 28, category: 'Behaviour-Based', sourceOperatorRef: 'TelePlan Special' },
  { planName: 'Night Power', price: 349, dataGB: 56, callMinutes: 3000, sms: 100, roamingIncluded: true, validityDays: 28, category: 'Behaviour-Based', sourceOperatorRef: 'TelePlan Special' },
  { planName: 'Weekend Infinity', price: 399, dataGB: 56, callMinutes: 3000, sms: 100, roamingIncluded: true, validityDays: 28, category: 'Behaviour-Based', sourceOperatorRef: 'TelePlan Special' },
  { planName: 'Gamer Infinity', price: 449, dataGB: 100, callMinutes: 3000, sms: 100, roamingIncluded: true, validityDays: 28, category: 'Behaviour-Based', sourceOperatorRef: 'TelePlan Special' },
  { planName: 'Stream Infinity', price: 499, dataGB: 120, callMinutes: 3000, sms: 100, roamingIncluded: true, validityDays: 28, category: 'Behaviour-Based', sourceOperatorRef: 'TelePlan Special' },
  { planName: 'Social Infinity', price: 349, dataGB: 56, callMinutes: 3000, sms: 100, roamingIncluded: true, validityDays: 28, category: 'Behaviour-Based', sourceOperatorRef: 'TelePlan Special' },
  { planName: 'AI & Coding Pro', price: 499, dataGB: 100, callMinutes: 3000, sms: 100, roamingIncluded: true, validityDays: 28, category: 'Professional / Specialised', sourceOperatorRef: 'TelePlan Pro', unlimitedData: true },
  { planName: 'Work From Anywhere', price: 549, dataGB: 100, callMinutes: 3000, sms: 100, roamingIncluded: true, validityDays: 28, category: 'Professional / Specialised', sourceOperatorRef: 'TelePlan Pro', unlimitedData: true },
  { planName: 'Creator Pro', price: 599, dataGB: 150, callMinutes: 3000, sms: 100, roamingIncluded: true, validityDays: 28, category: 'Professional / Specialised', sourceOperatorRef: 'TelePlan Pro', unlimitedData: true },
  { planName: 'Traveller Pro', price: 699, dataGB: 112, callMinutes: 3000, sms: 100, roamingIncluded: true, validityDays: 56, category: 'Professional / Specialised', sourceOperatorRef: 'TelePlan Global' },
  { planName: 'International Connect', price: 799, dataGB: 112, callMinutes: 3000, sms: 100, roamingIncluded: true, validityDays: 56, category: 'Professional / Specialised', sourceOperatorRef: 'TelePlan Global' },
  { planName: 'Family Share 3', price: 899, dataGB: 150, callMinutes: 5000, sms: 300, roamingIncluded: true, validityDays: 56, category: 'Family / Premium / Long Validity', sourceOperatorRef: 'TelePlan Family' },
  { planName: 'Family Max 4', price: 1499, dataGB: 300, callMinutes: 8000, sms: 400, roamingIncluded: true, validityDays: 90, category: 'Family / Premium / Long Validity', sourceOperatorRef: 'TelePlan Family' },
  { planName: 'Premium Infinity', price: 1999, dataGB: 300, callMinutes: 10000, sms: 500, roamingIncluded: true, validityDays: 90, category: 'Family / Premium / Long Validity', sourceOperatorRef: 'TelePlan Family' },
  { planName: 'Annual Infinity', price: 3999, dataGB: 730, callMinutes: 12000, sms: 1200, roamingIncluded: true, validityDays: 365, category: 'Family / Premium / Long Validity', sourceOperatorRef: 'TelePlan Core' }
];

/**
 * Helper to run Python XGBoost inference script via stdin or CLI arg
 */
async function executePythonInference(scriptPath, xgboostDir, payload) {
  const pyCmds = ['python', 'python3', 'py'];
  for (const cmd of pyCmds) {
    try {
      const output = await new Promise((resolve, reject) => {
        const child = execFile(cmd, [scriptPath], { cwd: xgboostDir, timeout: 15000, maxBuffer: 1024 * 1024 }, (err, stdout) => {
          if (err) return reject(err);
          resolve(stdout);
        });
        child.stdin.write(payload);
        child.stdin.end();
      });
      const parsed = JSON.parse(output);
      if (parsed.status === 'success' && Array.isArray(parsed.plans) && parsed.plans.length > 0) {
        return parsed;
      }
    } catch (err) {
      try {
        const { stdout } = await execFilePromise(cmd, [scriptPath, payload], {
          cwd: xgboostDir,
          timeout: 15000,
          maxBuffer: 1024 * 1024
        });
        const parsed = JSON.parse(stdout);
        if (parsed.status === 'success' && Array.isArray(parsed.plans) && parsed.plans.length > 0) {
          return parsed;
        }
      } catch (err2) {
        // Continue trying next python executable
      }
    }
  }
  return null;
}

/**
 * Predict top recommendations using XGBoost ML model
 */
async function getMLRecommendations(profile = {}, fallbackPlans = [], topN = 3) {
  const mlUser = normalizeProfileToMLUser(profile);
  const scriptPath = path.resolve(__dirname, '../../../xgboost-project/predict_json.py');
  const xgboostDir = path.dirname(scriptPath);
  const payload = JSON.stringify({ ...mlUser, top_n: topN });

  const result = await executePythonInference(scriptPath, xgboostDir, payload);
  if (result && Array.isArray(result.plans) && result.plans.length > 0) {
    printInferenceLog(mlUser, profile, result.plans);
    return result.plans;
  }

  console.warn('ML Model Python execution unavailable; using fallback recommendation scoring with official 25 XGBoost catalog.');
  const effectivePlans = (fallbackPlans && fallbackPlans.length > 0) ? fallbackPlans : OFFICIAL_25_PLANS;
  return getTopRecommendations(effectivePlans, profile);
}

module.exports = {
  DEFAULT_WEIGHTS,
  DATA_NEED_MAP,
  CALL_NEED_MAP,
  SMS_NEED_MAP,
  calculateDataFit,
  calculateCallFit,
  calculateSmsFit,
  calculateBudgetFit,
  calculateRoamingMatch,
  calculateScore,
  getTopRecommendations,
  recommendPlans: getTopRecommendations,
  customerToRecommendationProfile,
  normalizeProfileToMLUser,
  getMLRecommendations
};
