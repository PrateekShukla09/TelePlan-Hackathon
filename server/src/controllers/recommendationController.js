const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Plan = require('../models/Plan');
const Recommendation = require('../models/Recommendation');
const { getMLRecommendations, customerToRecommendationProfile } = require('../services/recommendationEngine');
const { AppError } = require('../utils/errors');

const safeGetDbPlans = async () => {
  if (mongoose.connection.readyState !== 1) {
    return [];
  }
  try {
    return await Plan.find({}).lean();
  } catch (err) {
    console.warn('[DB Query Skipped] Offline or DB unavailable:', err.message);
    return [];
  }
};

const safeSaveRecommendation = async (recData) => {
  if (mongoose.connection.readyState !== 1) {
    return;
  }
  try {
    await Recommendation.create(recData);
  } catch (err) {
    console.warn('[DB Audit Save Skipped]:', err.message);
  }
};

const formatItem = (item, index, dbPlans = []) => {
  const planObj = item.plan ? item.plan : item;
  const scoreVal = typeof item.score === 'number' ? item.score : (item.matchPercent ? item.matchPercent / 100 : 0.8);
  const matchPct = item.matchPercent ?? Math.round(scoreVal * 100);
  const planNameStr = planObj.planName || planObj.plan_name || planObj.title || 'Recommended Plan';

  const matchingDbPlan = (dbPlans && dbPlans.length > 0) ? dbPlans.find(p =>
    p.planName && planNameStr && p.planName.trim().toLowerCase() === planNameStr.trim().toLowerCase()
  ) : null;

  const finalId = matchingDbPlan ? matchingDbPlan._id : (planObj._id || planObj.id || planObj.planId || planObj.plan_id);
  const fullPlan = {
    ...planObj,
    _id: finalId,
    id: finalId,
    planName: planNameStr
  };

  return {
    ...item,
    planId: finalId,
    score: scoreVal,
    matchPercent: matchPct,
    rank: item.rank || (index + 1),
    explanation: item.explanation || `XGBoost ML Recommended: ${planNameStr} (${matchPct}% fit)`,
    plan: fullPlan
  };
};

    const recommendByCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    let customer = null;
    if (mongoose.Types.ObjectId.isValid(id) && mongoose.connection.readyState === 1) {
      try {
        customer = await Customer.findById(id).lean();
      } catch (err) {
        console.warn('[DB Customer Fetch Skipped]:', err.message);
      }
    }

    const profile = customer ? customerToRecommendationProfile(customer) : {};
    const dbPlans = await safeGetDbPlans();
    let rawTopScored = await getMLRecommendations(profile, dbPlans);
    const topScored = rawTopScored.map((item, idx) => formatItem(item, idx, dbPlans));

    if (customer) {
      await safeSaveRecommendation({
        customerId: customer._id,
        sessionId: null,
        recommendedPlans: topScored.map(item => ({
          planId: item.plan ? (item.plan._id || item.plan.id) : item.planId,
          score: item.score || 0.8,
          explanation: item.explanation || ''
        })),
        source: 'customer'
      });
    }

    res.status(200).json({
      source: 'xgboost_ml',
      plans: topScored
    });
  } catch (error) {
    next(error);
  }
};

const recommendByProfile = async (req, res, next) => {
  try {
    const { profile } = req.body;
    if (!profile || typeof profile !== 'object') {
      return next(new AppError('Profile object is required', 400, 'INVALID_PROFILE'));
    }

    const dbPlans = await safeGetDbPlans();
    let rawTopScored = await getMLRecommendations(profile, dbPlans);
    const topScored = rawTopScored.map((item, idx) => formatItem(item, idx, dbPlans));

    await safeSaveRecommendation({
      customerId: null,
      sessionId: req.body.sessionId || null,
      recommendedPlans: topScored.map(item => ({
        planId: item.plan ? (item.plan._id || item.plan.id) : item.planId,
        score: item.score || 0.8,
        explanation: item.explanation || ''
      })),
      source: 'chat_profile'
    });

    res.status(200).json({
      source: 'xgboost_ml',
      plans: topScored
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recommendByCustomer,
  recommendByProfile
};
