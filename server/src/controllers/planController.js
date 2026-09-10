const mongoose = require('mongoose');
const Plan = require('../models/Plan');
const { AppError } = require('../utils/errors');

const getAllPlans = async (req, res, next) => {
  try {
    const { page, limit, minPrice, maxPrice, roamingIncluded } = req.query;

    const query = {};
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }
    if (roamingIncluded !== undefined) {
      query.roamingIncluded = roamingIncluded === 'true' || roamingIncluded === true;
    }

    let plansQuery = Plan.find(query).lean();

    if (page && limit) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      plansQuery = plansQuery.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const plans = await plansQuery;
    res.status(200).json(plans);
  } catch (error) {
    next(error);
  }
};

const createPlan = async (req, res, next) => {
  try {
    const plan = await Plan.create(req.body);
    res.status(201).json(plan);
  } catch (error) {
    next(error);
  }
};

const updatePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError(`Invalid plan ID format: ${id}`, 400, 'VALIDATION_ERROR'));
    }

    const plan = await Plan.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }).lean();
    if (!plan) {
      return next(new AppError('Plan not found', 404, 'PLAN_NOT_FOUND'));
    }

    res.status(200).json(plan);
  } catch (error) {
    next(error);
  }
};

const deletePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError(`Invalid plan ID format: ${id}`, 400, 'VALIDATION_ERROR'));
    }

    const plan = await Plan.findByIdAndDelete(id).lean();
    if (!plan) {
      return next(new AppError('Plan not found', 404, 'PLAN_NOT_FOUND'));
    }

    res.status(200).json({ message: 'Plan deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan
};
