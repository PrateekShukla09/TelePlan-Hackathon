const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  planName: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be non-negative'],
    index: true
  },
  dataGB: {
    type: Number,
    required: true,
    min: [0, 'Data GB must be non-negative']
  },
  callMinutes: {
    type: Number,
    required: true,
    min: [0, 'Call minutes must be non-negative']
  },
  sms: {
    type: Number,
    required: true,
    min: [0, 'SMS count must be non-negative']
  },
  roamingIncluded: {
    type: Boolean,
    default: false,
    index: true
  },
  validityDays: {
    type: Number,
    required: true,
    min: [1, 'Validity days must be greater than 0'],
    default: 28
  },
  sourceOperatorRef: {
    type: String,
    default: 'Internal Tariff Engine'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Plan', planSchema);
