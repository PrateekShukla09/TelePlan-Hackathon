export const DEMO_FLAG = true;

export const demoClusters = [
  {
    _id: 'cl_heavy_streamer',
    clusterLabel: 0,
    personaName: 'Heavy-Data Streamer',
    description:
      'Streams teleplandeo and music constantly, burns through data fast, rarely calls, barely texts.',
    customerCount: 4210,
    centroid: [0.86, 0.18, 0.12, 0.22, 0.15],
    traits: { data: 'Very High', calling: 'Low', sms: 'Low', roaming: 'Low' },
    color: '#22d3ee',
  },
  {
    _id: 'cl_talk_first',
    clusterLabel: 1,
    personaName: 'Talk-First Connector',
    description: 'Lives on voice calls for work and family, modest data use, low roaming.',
    customerCount: 3120,
    centroid: [0.22, 0.88, 0.3, 0.12, 0.1],
    traits: { data: 'Low', calling: 'Very High', sms: 'Medium', roaming: 'Low' },
    color: '#34d399',
  },
  {
    _id: 'cl_global_roamer',
    clusterLabel: 2,
    personaName: 'Global Roamer',
    description: 'Frequently travels abroad, needs reliable roaming and international minutes.',
    customerCount: 980,
    centroid: [0.5, 0.45, 0.2, 0.92, 0.8],
    traits: { data: 'Medium', calling: 'Medium', sms: 'Low', roaming: 'Very High' },
    color: '#fbbf24',
  },
  {
    _id: 'cl_balanced',
    clusterLabel: 3,
    personaName: 'Balanced Everyday User',
    description: 'Steady, moderate use across data, calls and texts — nothing extreme.',
    customerCount: 5460,
    centroid: [0.45, 0.42, 0.4, 0.18, 0.14],
    traits: { data: 'Medium', calling: 'Medium', sms: 'Medium', roaming: 'Low' },
    color: '#60a5fa',
  },
  {
    _id: 'cl_budget_light',
    clusterLabel: 4,
    personaName: 'Budget-Conscious Light User',
    description: 'Minimal usage across the board, highly price sensitive.',
    customerCount: 2870,
    centroid: [0.12, 0.15, 0.18, 0.05, 0.04],
    traits: { data: 'Low', calling: 'Low', sms: 'Low', roaming: 'Very Low' },
    color: '#a78bfa',
  },
];

export const demoOperators = [
  { id: 'teleplan', name: 'TelePlan', color: '#0077FF' },
  { id: 'teleplan', name: 'TelePlan', color: '#E40000' },
  { id: 'teleplan', name: 'TelePlan', color: '#D81B60' },
  { id: 'teleplan', name: 'TelePlan', color: '#00BFA5' },
];

export const demoPlans = [
  {
    _id: 'P06',
    planName: '5G Freedom',
    operator: 'TelePlan 5G',
    clusterIds: ['cl_heavy_streamer', 'cl_balanced'],
    price: 349,
    dataGB: 56,
    callMinutes: 3000,
    sms: 100,
    roamingIncluded: true,
    validityDays: 28,
    benefits: ['2.0 GB/day + Unlimited 5G', '3000 Mins Local & STD', 'Uncapped 5G Speeds'],
    sourceOperatorRef: 'TelePlan 5G Freedom',
  },
  {
    _id: 'P07',
    planName: 'Infinity 4G/5G',
    operator: 'TelePlan 5G',
    clusterIds: ['cl_heavy_streamer'],
    price: 399,
    dataGB: 100,
    callMinutes: 3000,
    sms: 100,
    roamingIncluded: true,
    validityDays: 28,
    benefits: ['Unlimited 4G/5G Data', '3000 Mins Calls', 'HD Video Streaming'],
    sourceOperatorRef: 'TelePlan Infinity 4G/5G',
  },
  {
    _id: 'P02',
    planName: 'Essential Data',
    operator: 'TelePlan Core',
    clusterIds: ['cl_budget_light', 'cl_balanced'],
    price: 249,
    dataGB: 42,
    callMinutes: 3000,
    sms: 100,
    roamingIncluded: true,
    validityDays: 28,
    benefits: ['1.5 GB/day High Speed Data', '3000 Mins Calls', 'Weekend Data Rollover'],
    sourceOperatorRef: 'TelePlan Essential Data',
  },
  {
    _id: 'P17',
    planName: 'AI & Coding Pro',
    operator: 'TelePlan Pro',
    clusterIds: ['cl_global_roamer'],
    price: 499,
    dataGB: 100,
    callMinutes: 3000,
    sms: 100,
    roamingIncluded: true,
    validityDays: 28,
    benefits: ['Unlimited High-Speed Data', 'Cloud Sync 100GB', 'Developer API Pass'],
    sourceOperatorRef: 'TelePlan AI & Coding Pro',
  },
];

export const demoCustomer = {
  _id: 'cust_demo_01',
  name: 'Aarav Mehta',
  phone: '+91 98xxxxxx21',
  tenureMonths: 18,
  contractType: 'postpaid',
  usage: {
    avgCallMin: 420,
    dataGB: 34,
    smsCount: 65,
    dayEveningNightSplit: { day: 0.5, evening: 0.35, night: 0.15 },
    roamingUsage: 2,
    internationalUsage: 0,
  },
  clusterId: 'cl_balanced',
  currentPlanId: 'P02',
  monthlySpend: 349,
  createdAt: '2024-11-02T10:00:00.000Z',
};

export const demoRecommendationHistory = [
  {
    _id: 'rec_1',
    generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    source: 'chat_profile',
    recommendedPlans: [
      { planId: 'P06', score: 0.96 },
      { planId: 'P07', score: 0.89 },
      { planId: 'P02', score: 0.84 },
    ],
  },
];

export const demoAdminStats = {
  totalCustomers: 16640,
  totalPlans: 25,
  totalClusters: demoClusters.length,
  recommendationsGenerated30d: 8420,
  avgMatchScore: 88,
  lastClusteringRun: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  lastBatchJobStatus: 'success',
};

export const demoKnowledgeSnippets = [
  { operatorName: 'TelePlan', planName: 'Essential Data', note: 'Reference 4G budget plan' },
  { operatorName: 'TelePlan', planName: '5G Freedom', note: 'Reference 5G unlimited plan' },
];
