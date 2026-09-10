const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    index: true
  },
  tenureMonths: {
    type: Number,
    min: [0, 'Tenure months cannot be negative'],
    default: 0
  },
  contractType: {
    type: String,
    enum: ['prepaid', 'postpaid'],
    default: 'postpaid'
  },
  usage: {
    avgCallMin: { type: Number, min: 0, default: 0 },
    dataGB: { type: Number, min: 0, default: 0 },
    smsCount: { type: Number, min: 0, default: 0 },
    dayEveningNightSplit: {
      day: { type: Number, min: 0, max: 1, default: 0.4 },
      evening: { type: Number, min: 0, max: 1, default: 0.35 },
      night: { type: Number, min: 0, max: 1, default: 0.25 }
    },
    roamingUsage: { type: Number, min: 0, default: 0 },
    internationalUsage: { type: Number, min: 0, default: 0 }
  },
  currentPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    default: null,
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Customer', customerSchema);
