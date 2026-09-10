const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const { AppError } = require('../utils/errors');

const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError(`Invalid customer ID format: ${id}`, 400, 'VALIDATION_ERROR'));
    }

    const customer = await Customer.findById(id).populate('currentPlanId').lean();
    if (!customer) {
      return next(new AppError('Customer not found', 404, 'CUSTOMER_NOT_FOUND'));
    }

    res.status(200).json(customer);
  } catch (error) {
    next(error);
  }
};

const getCustomerUsage = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError(`Invalid customer ID format: ${id}`, 400, 'VALIDATION_ERROR'));
    }

    const customer = await Customer.findById(id).select('usage').lean();
    if (!customer) {
      return next(new AppError('Customer not found', 404, 'CUSTOMER_NOT_FOUND'));
    }

    res.status(200).json(customer.usage);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomerById,
  getCustomerUsage
};
