const mongoose = require('mongoose');

const recommendedPlanSchema = new mongoose.Schema({
  planId: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  explanation: {
    type: String,
    default: ''
  }
}, { _id: false });

const recommendationSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null,
    index: true
  },
  sessionId: {
    type: String,
    default: null,
    index: true
  },
  recommendedPlans: [recommendedPlanSchema],
  source: {
    type: String,
    enum: ['customer', 'profile', 'chat_profile', 'cluster', 'xgboost_ml', 'customer_ml'],
    required: true,
    default: 'chat_profile'
  },
  generatedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Recommendation', recommendationSchema);
