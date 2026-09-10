const {
  calculateDataFit,
  calculateCallFit,
  calculateSmsFit,
  calculateBudgetFit,
  calculateRoamingMatch,
  calculateScore,
  getTopRecommendations,
  customerToRecommendationProfile
} = require('../src/services/recommendationEngine');

describe('Recommendation Engine Unit Tests', () => {
  const samplePlans = [
    { _id: 'p1', planName: 'Basic 199', price: 199, dataGB: 5, callMinutes: 300, sms: 100, roamingIncluded: false },
    { _id: 'p2', planName: 'Standard 499', price: 499, dataGB: 18, callMinutes: 900, sms: 300, roamingIncluded: false },
    { _id: 'p3', planName: 'Heavy 799', price: 799, dataGB: 40, callMinutes: 1800, sms: 1000, roamingIncluded: true },
    { _id: 'p4', planName: 'Ultra 1299', price: 1299, dataGB: 75, callMinutes: 3000, sms: 2000, roamingIncluded: true }
  ];

  describe('Factor Calculations', () => {
    test('calculateDataFit handles numeric and string levels correctly', () => {
      expect(calculateDataFit(15, 'medium')).toBeCloseTo(1.0);
      expect(calculateDataFit(5, 'high')).toBeLessThan(0.5);
      expect(calculateDataFit(40, 'high')).toBeGreaterThanOrEqual(0.8);
      expect(calculateDataFit(10, 20)).toBeCloseTo(0.5);
    });

    test('calculateCallFit handles numeric and string levels correctly', () => {
      expect(calculateCallFit(800, 'medium')).toBeCloseTo(1.0);
      expect(calculateCallFit(200, 'high')).toBeLessThan(0.3);
      expect(calculateCallFit(2000, 'high')).toBeGreaterThanOrEqual(0.8);
    });

    test('calculateSmsFit handles numeric and string levels correctly', () => {
      expect(calculateSmsFit(200, 'medium')).toBeCloseTo(1.0);
      expect(calculateSmsFit(50, 'high')).toBeLessThan(0.2);
    });

    test('calculateBudgetFit scores appropriately for within and over budget', () => {
      expect(calculateBudgetFit(400, 500)).toBeGreaterThan(0.9);
      expect(calculateBudgetFit(600, 500)).toBeLessThan(0.8);
      expect(calculateBudgetFit(400, null)).toBeCloseTo(0.8);
    });

    test('calculateRoamingMatch scores based on roaming requirement', () => {
      expect(calculateRoamingMatch(true, true)).toBe(1.0);
      expect(calculateRoamingMatch(false, true)).toBe(0.1);
      expect(calculateRoamingMatch(false, false)).toBe(0.8);
    });
  });

  describe('Weighted Score & Top 3 Recommendations', () => {
    test('calculateScore yields score between 0 and 1', () => {
      const profile = { dataNeed: 'high', callingNeed: 'high', smsNeed: 'high', budget: 1000, roamingRequired: true };
      const score = calculateScore(samplePlans[2], profile);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1.0);
    });

    test('getTopRecommendations returns top 3 plans sorted descending', () => {
      const profile = { dataNeed: 'high', callingNeed: 'high', budget: 900, roamingRequired: true };
      const result = getTopRecommendations(samplePlans, profile);

      expect(result.length).toBe(3);
      expect(result[0].score).toBeGreaterThanOrEqual(result[1].score);
      expect(result[1].score).toBeGreaterThanOrEqual(result[2].score);
    });

    test('handles edge case with 0 plans', () => {
      expect(getTopRecommendations([], {})).toEqual([]);
      expect(getTopRecommendations(null, {})).toEqual([]);
    });

    test('handles edge case with fewer than 3 plans', () => {
      const result = getTopRecommendations([samplePlans[0]], { dataNeed: 'low' });
      expect(result.length).toBe(1);
      expect(result[0].plan.planName).toBe('Basic 199');
    });

    test('handles zero budget and very high budget', () => {
      const resultZero = getTopRecommendations(samplePlans, { budget: 0 });
      expect(resultZero.length).toBe(3);

      const resultHigh = getTopRecommendations(samplePlans, { budget: 10000 });
      expect(resultHigh.length).toBe(3);
    });
  });

  describe('Customer Usage Profile Converter', () => {
    test('converts actual customer usage object to recommendation profile', () => {
      const customer = {
        usage: {
          dataGB: 30,
          avgCallMin: 1200,
          smsCount: 400,
          roamingUsage: 100
        }
      };

      const profile = customerToRecommendationProfile(customer);
      expect(profile.dataNeed).toBe('high');
      expect(profile.callingNeed).toBe('high');
      expect(profile.smsNeed).toBe('high');
      expect(profile.roamingRequired).toBe(true);
    });
  });
});
