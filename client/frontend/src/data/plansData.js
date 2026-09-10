export const TELECOM_PROVIDERS = [
  { id: 'teleplan', name: 'TELEPLAN', label: 'TelePlan', color: '#0077FF', badge: 'True 5G' },
];

export const PLANS_DATA = [
  // --- CATEGORY 1: BUDGET & ESSENTIAL (5 plans) ---
  {
    id: 'P01',
    title: 'Essential Voice',
    operator: 'TelePlan',
    operatorSlug: 'teleplan',
    price: 199,
    validityDays: 28,
    customerType: 'Individual',
    category: 'Budget & Essential',
    data: '5 GB total data',
    dataGBPerMonth: 5,
    calls: 'Truly Unlimited Calls',
    callMinutes: 3000,
    sms: '100 SMS / day',
    otherBenefits: ['5GB total data', 'Unlimited calls', 'Domestic roaming', 'Essential voice pack'],
    has5G: false,
    hasRoaming: true,
    maxUsers: 1,
    reason: "Someone who barely uses internet shouldn't be forced to pay for unlimited data.",
  },
  {
    id: 'P02',
    title: 'Essential Data',
    operator: 'TelePlan',
    operatorSlug: 'teleplan',
    price: 249,
    validityDays: 28,
    customerType: 'Individual',
    category: 'Budget & Essential',
    data: '1.5 GB/day',
    dataGBPerMonth: 42,
    calls: 'Truly Unlimited Calls',
    callMinutes: 3000,
    sms: '100 SMS / day',
    otherBenefits: ['1.5GB/day data', 'Weekend data rollover', 'Unlimited calls', 'Domestic roaming'],
    has5G: false,
    hasRoaming: true,
    maxUsers: 1,
    reason: 'Unused weekend data can be carried into the next week.',
  },
  {
    id: 'P03',
    title: 'Student Power',
    operator: 'TelePlan',
    operatorSlug: 'teleplan',
    price: 299,
    validityDays: 28,
    customerType: 'Individual',
    category: 'Budget & Essential',
    data: '2.0 GB/day + 25GB Edu Pool',
    dataGBPerMonth: 56,
    calls: 'Truly Unlimited Calls',
    callMinutes: 3000,
    sms: '100 SMS / day',
    otherBenefits: ['25GB Education & Learning Pool', 'Unlimited 5G for eligible users', 'Weekend data rollover', 'Cloud/Learning access'],
    has5G: true,
    hasRoaming: true,
    maxUsers: 1,
    reason: 'Real value for students is an education/learning data pool, not just a data quota bump.',
  },
  {
    id: 'P04',
    title: 'Voice Plus',
    operator: 'TelePlan',
    operatorSlug: 'teleplan',
    price: 299,
    validityDays: 56,
    customerType: 'Individual',
    category: 'Budget & Essential',
    data: '20 GB total data',
    dataGBPerMonth: 20,
    calls: 'Truly Unlimited Calls (56D)',
    callMinutes: 3000,
    sms: '100 SMS / day',
    otherBenefits: ['20GB total data pool', '56-day long validity', 'Unlimited nationwide calls', 'Domestic roaming'],
    has5G: false,
    hasRoaming: true,
    maxUsers: 1,
    reason: 'The point here is long validity, not huge data.',
  },
  {
    id: 'P05',
    title: 'Senior Connect',
    operator: 'TelePlan',
    operatorSlug: 'teleplan',
    price: 249,
    validityDays: 56,
    customerType: 'Individual',
    category: 'Budget & Essential',
    data: '10 GB total data',
    dataGBPerMonth: 10,
    calls: 'Truly Unlimited Calls (56D)',
    callMinutes: 3000,
    sms: '100 SMS / day',
    otherBenefits: ['10GB total data pool', '56-day validity', 'Unlimited nationwide calls', 'Simple essential interface'],
    has5G: false,
    hasRoaming: true,
    maxUsers: 1,
    reason: 'A simple, predictable essential plan for low-data, voice-heavy users.',
  },

  // --- CATEGORY 2: UNLIMITED / 5G (5 plans) ---
  {
    id: 'P06',
    title: '5G Freedom',
    operator: 'TelePlan',
    operatorSlug: 'teleplan',
    price: 349,
    validityDays: 28,
    customerType: 'Individual',
    category: 'Unlimited / 5G',
    data: '2.0 GB/day + Unlimited 5G',
    dataGBPerMonth: 56,
    calls: 'Truly Unlimited Calls',
    callMinutes: 3000,
    sms: '100 SMS / day',
    otherBenefits: ['Unlimited 5G standalone data', 'Weekend data rollover', '2GB/day 4G base quota', 'Domestic roaming'],
    has5G: true,
    hasRoaming: true,
    maxUsers: 1,
    reason: 'Deliberately competitive with market structure (2GB/day + Unlimited 5G for eligible devices).',
  },
  {
    id: 'P07',
    title: 'Infinity 4G/5G',
    operator: 'TelePlan',
    operatorSlug: 'teleplan',
    price: 399,
    validityDays: 28,
    customerType: 'Individual',
    category: 'Unlimited / 5G',
    data: 'Unlimited 4G/5G Data',
    dataGBPerMonth: 100,
    calls: 'Truly Unlimited Calls',
    callMinutes: 3000,
    sms: '100 SMS / day',
    otherBenefits: ['Unlimited 4G/5G connectivity', 'Uncapped high speed data', 'Domestic roaming', 'Fair use policy applies'],
    has5G: true,
    hasRoaming: true,
    maxUsers: 1,
    reason: 'Our market-anchor plan. Unlimited data is subject to standard fair-use terms.',
  },
  {
    id: 'P08',
    title: 'Infinity Plus',
    operator: 'TelePlan',
    operatorSlug: 'teleplan',
    price: 449,
    validityDays: 28,
    customerType: 'Individual',
    category: 'Unlimited / 5G',
    data: 'Unlimited 4G/5G + OTT Bundle',
    dataGBPerMonth: 120,
    calls: 'Truly Unlimited Calls',
    callMinutes: 3000,
    sms: '100 SMS / day',
    otherBenefits: ['Unlimited 4G/5G Data', 'OTT Streaming Bundle', '100GB Cloud Storage', 'Priority Customer Support'],
    has5G: true,
    hasRoaming: true,
    maxUsers: 1,
    reason: '₹399 = unlimited connectivity. ₹449 = unlimited connectivity + lifestyle benefits.',
  },
  {
    id: 'P09',
    title: 'Power 5G',
    operator: 'TelePlan',
    operatorSlug: 'teleplan',
    price: 499,
    validityDays: 56,
    customerType: 'Individual',
    category: 'Unlimited / 5G',
    data: '2.0 GB/day + Unlimited 5G (56D)',
    dataGBPerMonth: 112,
    calls: 'Truly Unlimited Calls',
    callMinutes: 3000,
    sms: '100 SMS / day',
    otherBenefits: ['2GB/day base quota', 'Unlimited 5G connectivity', 'Weekend data rollover', '56-day long validity'],
    has5G: true,
    hasRoaming: true,
    maxUsers: 1,
    reason: 'Longer validity trades off against a data cap, for customers who value fewer recharges.',
  },
  {
    id: 'P10',
    title: '5G Long-Life',
    operator: 'TelePlan',
    operatorSlug: 'teleplan',
    price: 649,
    validityDays: 56,
    customerType: 'Individual',
    category: 'Unlimited / 5G',
    data: '2.0 GB/day + Unlimited 5G + 25GB Bonus',
    dataGBPerMonth: 137,
    calls: 'Truly Unlimited Calls',
    callMinutes: 3000,
    sms: '100 SMS / day',
    otherBenefits: ['2GB/day 4G + Unlimited 5G', '25GB extra bonus data', 'Weekend rollover', '56-day validity'],
    has5G: true,
    hasRoaming: true,
    maxUsers: 1,
    reason: 'A market-anchor plan for the 56-day, 2GB/day + unlimited-5G segment.',
  },

  // --- CATEGORY 3: BEHAVIOUR-BASED (6 plans) ---
  {
    id: 'P11',
    title: 'Night Infinity',
    operator: 'TelePlan',
    operatorSlug: 'teleplan',
    price: 299,
    validityDays: 28,
    customerType: 'Individual',
    category: 'Behaviour-Based',
    data: '2.0 GB/day + Night Unlimited (12am-6am)',
    dataGBPerMonth: 56,
    calls: 'Truly Unlimited Calls',
    callMinutes: 3000,
    sms: '100 SMS / day',
    otherBenefits: ['Unlimited data 12 AM - 6 AM', '2GB/day daytime quota', 'Weekend data rollover', 'Domestic roaming'],
    has5G: false,
    hasRoaming: true,
    maxUsers: 1,
    reason: 'Designed for heavy night users who stream and download late at night.',
  },
  {
    id: 'P12',
    title: 'Night Power',
    operator: 'TelePlan',
    operatorSlug: 'teleplan',
    price: 349,
    validityDays: 28,
    customerType: 'Individual',
    category: 'Behaviour-Based',
    data: '2.0 GB/day + Night (11pm-7am) + Daytime 5G',
    dataGBPerMonth: 56,
    calls: 'Truly Unlimited Calls',
    callMinutes: 3000,
    sms: '100 SMS / day',
    otherBenefits: ['Unlimited 11 PM - 7 AM data', 'Unlimited 5G during daytime', 'Weekend data rollover', 'Unlimited calls'],
    has5G: true,
    hasRoaming: true,
    maxUsers: 1,
    reason: 'A step up from Night Infinity for the heaviest night-usage segment.',
  },
  {
    id: 'P13',
    title: 'Weekend Infinity',
    operator: 'TelePlan',
    operatorSlug: 'teleplan',
    price: 399,
    validityDays: 28,
    customerType: 'Individual',
    category: 'Behaviour-Based',
    data: '2.0 GB/day Mon-Fri + Unlimited Sat-Sun',
    dataGBPerMonth: 56,
    calls: 'Truly Unlimited Calls',
    callMinutes: 3000,
    sms: '100 SMS / day',
    otherBenefits: ['Unlimited data Saturday + Sunday', '2GB/day Monday-Friday', 'Unlimited 5G', 'Weekend OTT streaming benefit'],
    has5G: true,
    hasRoaming: true,
    maxUsers: 1,
    reason: 'Built around actual weekend usage spikes for binge-watchers.',
  },
  {
    id: 'P14',
    title: 'Gamer Infinity',
    operator: 'TelePlan',
    operatorSlug: 'teleplan',
    price: 449,
    validityDays: 28,
    customerType: 'Individual',
    category: 'Behaviour-Based',
    data: 'Unlimited 4G/5G + Gaming (12am-6am)',
    dataGBPerMonth: 100,
    calls: 'Truly Unlimited Calls',
    callMinutes: 3000,
    sms: '100 SMS / day',
    otherBenefits: ['Unlimited gaming data 12 AM - 6 AM', 'Low-latency gaming optimization', 'Gaming subscriptions/perks', 'Unlimited 4G/5G'],
    has5G: true,
    hasRoaming: true,
    maxUsers: 1,
    reason: "Gamers don't need a bigger flat quota — they need unlimited data where they actually use it.",
  },
  {
    id: 'P15',
    title: 'Stream Infinity',
    operator: 'TelePlan',
    operatorSlug: 'teleplan',
    price: 499,
    validityDays: 28,
    customerType: 'Individual',
    category: 'Behaviour-Based',
    data: 'Unlimited 4G/5G + OTT Bundle',
    dataGBPerMonth: 120,
    calls: 'Truly Unlimited Calls',
    callMinutes: 3000,
    sms: '100 SMS / day',
    otherBenefits: ['OTT Subscription Bundle', 'Music Subscription', 'Weekend Unlimited Streaming', '100GB Cloud Storage'],
    has5G: true,
    hasRoaming: true,
    maxUsers: 1,
    reason: 'A lifestyle bundle for Netflix/YouTube/OTT heavy streamers.',
  },
  {
    id: 'P16',
    title: 'Social Infinity',
    operator: 'TelePlan',
    operatorSlug: 'teleplan',
    price: 349,
    validityDays: 28,
    customerType: 'Individual',
    category: 'Behaviour-Based',
    data: '2.0 GB/day + Unlimited Social Media',
    dataGBPerMonth: 56,
    calls: 'Truly Unlimited Calls',
    callMinutes: 3000,
    sms: '100 SMS / day',
    otherBenefits: ['Unlimited Social Media Data (Reels/Insta/Shorts)', '2GB/day base data', 'Unlimited 5G', 'Weekend rollover'],
    has5G: true,
    hasRoaming: true,
    maxUsers: 1,
    reason: 'Explicitly defined unlimited social-media data for social media heavy users.',
  },

  // --- CATEGORY 4: PROFESSIONAL / SPECIALISED (5 plans) ---
  {
    id: 'P17',
    title: 'AI & Coding Pro',
    operator: 'TelePlan',
    operatorSlug: 'teleplan',
    price: 499,
    validityDays: 28,
    customerType: 'Individual',
    category: 'Professional / Specialised',
    data: 'Unlimited 4G/5G + AI Tools & Cloud',
    dataGBPerMonth: 100,
    calls: 'Truly Unlimited Calls',
    callMinutes: 3000,
    sms: '100 SMS / day',
    otherBenefits: ['100GB Cloud Storage', 'AI Tool Subscriptions & Credits', 'Coding/Dev Platform Benefits', 'Hotspot Allowance'],
    has5G: true,
    hasRoaming: true,
    maxUsers: 1,
    reason: 'A believable AI plan for developers with unlimited data and real dev/AI tool benefits.',
  },
  {
    id: 'P18',
    title: 'Work From Anywhere',
    operator: 'TelePlan',
    operatorSlug: 'teleplan',
    price: 549,
    validityDays: 28,
    customerType: 'Individual',
    category: 'Professional / Specialised',
    data: 'Unlimited 4G/5G + 100GB Hotspot',
    dataGBPerMonth: 100,
    calls: 'Truly Unlimited Calls',
    callMinutes: 3000,
    sms: '100 SMS / day',
    otherBenefits: ['100GB Hotspot Allowance', 'Cloud Storage', 'Video Conferencing Benefit', 'Priority Tech Support'],
    has5G: true,
    hasRoaming: true,
    maxUsers: 1,
    reason: 'Hotspot is the key feature — a laptop can consume vastly more data than a phone.',
  },
  {
    id: 'P19',
    title: 'Creator Pro',
    operator: 'TelePlan',
    operatorSlug: 'teleplan',
    price: 599,
    validityDays: 28,
    customerType: 'Individual',
    category: 'Professional / Specialised',
    data: 'Unlimited 4G/5G + 150GB Upload Pool',
    dataGBPerMonth: 150,
    calls: 'Truly Unlimited Calls',
    callMinutes: 3000,
    sms: '100 SMS / day',
    otherBenefits: ['150GB Hotspot/Upload Pool', 'Large-File Upload Priority', 'Creator Platform Benefits', 'Cloud Storage'],
    has5G: true,
    hasRoaming: true,
    maxUsers: 1,
    reason: 'Built around upload-heavy workflows for YouTubers and Instagram creators.',
  },
  {
    id: 'P20',
    title: 'Traveller Pro',
    operator: 'TelePlan',
    operatorSlug: 'teleplan',
    price: 699,
    validityDays: 56,
    customerType: 'Individual',
    category: 'Professional / Specialised',
    data: '2.0 GB/day + Unlimited 5G (56D)',
    dataGBPerMonth: 112,
    calls: 'Truly Unlimited Calls + 250 ISD Mins',
    callMinutes: 3000,
    sms: '100 SMS / day',
    otherBenefits: ['250 ISD Minutes Included', 'Travel Assistance & Partner Benefits', 'Domestic Roaming', '56-day validity'],
    has5G: true,
    hasRoaming: true,
    maxUsers: 1,
    reason: 'ISD minutes and travel benefits matter more here than a bigger data cap.',
  },
  {
    id: 'P21',
    title: 'International Connect',
    operator: 'TelePlan',
    operatorSlug: 'teleplan',
    price: 799,
    validityDays: 56,
    customerType: 'Individual',
    category: 'Professional / Specialised',
    data: '2.0 GB/day + Unlimited 5G (56D)',
    dataGBPerMonth: 112,
    calls: 'Unlimited India Calls + 500 ISD Mins',
    callMinutes: 3000,
    sms: '100 SMS/day + International SMS',
    otherBenefits: ['500 ISD Minutes', 'International SMS Allowance', 'Unlimited 5G', 'Domestic Roaming'],
    has5G: true,
    hasRoaming: true,
    maxUsers: 1,
    reason: 'For this segment, ISD minutes are the primary differentiator, not data.',
  },

  // --- CATEGORY 5: FAMILY / PREMIUM / LONG VALIDITY (4 plans) ---
  {
    id: 'P22',
    title: 'Family Share 3',
    operator: 'TelePlan',
    operatorSlug: 'teleplan',
    price: 899,
    validityDays: 56,
    customerType: 'Family',
    category: 'Family Share',
    data: '150 GB Shared Pool (3 Members)',
    dataGBPerMonth: 150,
    calls: 'Unlimited Calls (3 SIMs)',
    callMinutes: 5000,
    sms: '100 SMS / day per member',
    otherBenefits: ['3 Family Members Included', '150GB Shared Pool', 'Parental Usage Controls', 'Data Redistribution'],
    has5G: true,
    hasRoaming: true,
    maxUsers: 3,
    reason: 'A shared pool, not "100GB each" — reflects how families actually use data.',
  },
  {
    id: 'P23',
    title: 'Family Max 4',
    operator: 'TelePlan',
    operatorSlug: 'teleplan',
    price: 1499,
    validityDays: 90,
    customerType: 'Family',
    category: 'Family Share',
    data: '300 GB Shared Data (4 Members)',
    dataGBPerMonth: 300,
    calls: 'Unlimited Calls (4 SIMs)',
    callMinutes: 8000,
    sms: '100 SMS / day per member',
    otherBenefits: ['Up to 4 Family Members', '300GB Shared Data', 'Family Dashboard & Allocation Controls', 'Data Rollover'],
    has5G: true,
    hasRoaming: true,
    maxUsers: 4,
    reason: "Adds a family dashboard and allocation controls as members' needs diverge.",
  },
  {
    id: 'P24',
    title: 'Premium Infinity',
    operator: 'TelePlan',
    operatorSlug: 'teleplan',
    price: 1999,
    validityDays: 90,
    customerType: 'Family',
    category: 'Family Share',
    data: 'Unlimited 4G/5G (90D)',
    dataGBPerMonth: 300,
    calls: 'Unlimited Calls + ISD Mins',
    callMinutes: 10000,
    sms: '100 SMS / day',
    otherBenefits: ['Unlimited 4G/5G Data', 'Premium OTT Bundle', 'ISD & International Roaming Add-on', 'Priority Customer Support'],
    has5G: true,
    hasRoaming: true,
    maxUsers: 5,
    reason: 'A top-tier bundle for customers who value premium service over price.',
  },
  {
    id: 'P25',
    title: 'Annual Infinity',
    operator: 'TelePlan',
    operatorSlug: 'teleplan',
    price: 3999,
    validityDays: 365,
    customerType: 'Individual',
    category: 'Long Validity',
    data: '2.0 GB/day + Unlimited 5G (365D)',
    dataGBPerMonth: 730,
    calls: 'Truly Unlimited Calls (365 Days)',
    callMinutes: 10000,
    sms: '100 SMS / day',
    otherBenefits: ['2GB/day + Unlimited 5G', '365 Days Annual Validity', 'Price-Lock Loyalty Benefit', 'OTT Bundle & Cloud Storage'],
    has5G: true,
    hasRoaming: true,
    maxUsers: 1,
    reason: 'Long validity itself becomes the differentiator, backed by a price-lock/loyalty benefit.',
  },
];

export function calculateClusterAndRecommendations(usage) {
  const {
    customerType = 'Individual',
    dataGB = 45,
    callMin = 800,
    smsCount = 100,
    rechargeBudget = 500,
    use5G = true,
    dataRoaming = 'none',
    memberCount = 1,
  } = usage;

  let clusterId = 'C6';
  let clusterName = 'C6: High-Data 5G Power User';
  let clusterDescription = 'High data consumption (>40GB/mo) with heavy 5G device usage and active media streaming.';
  let centroids = { dataGB: 60, callMin: 1200, budget: 450 };

  if (customerType === 'Business') {
    clusterId = 'C5';
    clusterName = 'C5: Corporate Fleet & Enterprise';
    clusterDescription = 'Multi-user commercial operations requiring high shared data caps, CUG voice calling, and business apps.';
    centroids = { dataGB: 400, callMin: 8000, budget: 1800 };
  } else if (customerType === 'Family') {
    clusterId = 'C3';
    clusterName = 'C3: Family Multi-Line Shared Pool';
    clusterDescription = 'Shared pool data for family members with OTT subscriptions and pooled calling allowances.';
    centroids = { dataGB: 150, callMin: 4000, budget: 950 };
  } else {
    if (rechargeBudget <= 250 && dataGB <= 20) {
      clusterId = 'C1';
      clusterName = 'C1: Budget Voice & Minimal Data';
      clusterDescription = 'Voice-focused profile with basic messaging and reliance on home Wi-Fi.';
      centroids = { dataGB: 10, callMin: 600, budget: 200 };
    } else if (dataRoaming === 'international') {
      clusterId = 'C4';
      clusterName = 'C4: Global Nomad & Traveler';
      clusterDescription = 'Requires international roaming passes, high speed data, and cross-border voice access.';
      centroids = { dataGB: 80, callMin: 2000, budget: 1000 };
    } else if (rechargeBudget <= 400) {
      clusterId = 'C2';
      clusterName = 'C2: Balanced Value 4G/5G';
      clusterDescription = 'Standard daily data users seeking high value per rupee spent.';
      centroids = { dataGB: 35, callMin: 800, budget: 320 };
    }
  }

  const scoredPlans = PLANS_DATA.map((plan) => {
    // 1. Customer Type Match (Weight: 25%)
    let typeScore = 100;
    if (plan.customerType !== customerType) {
      if (customerType === 'Individual' && plan.customerType === 'Family') typeScore = 40;
      else if (customerType === 'Family' && plan.customerType === 'Individual') typeScore = 65;
      else typeScore = 50;
    }

    // 2. Budget Match (Weight: 30%)
    const price = plan.price || 0;
    const priceDiffRatio = Math.abs(price - rechargeBudget) / Math.max(100, rechargeBudget);
    let budgetScore = Math.max(30, Math.round(100 - priceDiffRatio * 80));

    // 3. Data Match (Weight: 25%)
    let planDataGB = plan.dataGBPerMonth || plan.dataGB || 0;
    if (plan.has5G || plan.category === 'Unlimited / 5G' || plan.category === 'Professional / Specialised') {
      planDataGB = Math.max(planDataGB, 100);
    }
    let dataScore = 80;
    if (planDataGB >= dataGB) {
      const excessRatio = (planDataGB - dataGB) / Math.max(50, dataGB);
      dataScore = Math.min(100, Math.round(92 - Math.min(15, excessRatio * 10)));
    } else {
      dataScore = Math.max(35, Math.round((planDataGB / Math.max(1, dataGB)) * 100));
    }

    // 4. 5G & Special Feature Match (Weight: 20%)
    let featureScore = 85;
    if (use5G && !plan.has5G) featureScore -= 30;
    if (dataRoaming === 'international' && !plan.hasRoaming) featureScore -= 35;
    featureScore = Math.max(30, featureScore);

    // Weighted Overall Score (30% Budget, 25% Data, 25% Type, 20% Features)
    const totalWeightedScore = Math.round(
      budgetScore * 0.30 +
      dataScore * 0.25 +
      typeScore * 0.25 +
      featureScore * 0.20
    );

    const finalScore = Math.max(45, Math.min(96, totalWeightedScore));

    // Compute dynamic Why This Plan metrics
    const dataMatchPct = `${dataScore}%`;
    const callMatchPct = plan.callMinutes >= callMin ? '100%' : `${Math.max(60, Math.round((plan.callMinutes / Math.max(1, callMin)) * 100))}%`;
    const budgetMatchPct = `${budgetScore}%`;
    const match5GPct = (use5G && plan.has5G) ? '100%' : (!use5G && !plan.has5G) ? '95%' : '70%';

    return {
      ...plan,
      recommendationScore: finalScore,
      whyThisPlan: {
        dataMatch: dataMatchPct,
        callMatch: callMatchPct,
        budgetMatch: budgetMatchPct,
        match5G: match5GPct,
        overallFit: `${finalScore}% customer fit for ${customerType.toLowerCase()} profile with ${plan.data} and ₹${plan.price}/mo cost.`,
      },
    };
  });

  scoredPlans.sort((a, b) => b.recommendationScore - a.recommendationScore);

  const top3Plans = scoredPlans.slice(0, 3);

  const aiAnalysis = [
    `Assigned K-Means Cluster: ${clusterName}`,
    `Monthly Data Requirement: ${dataGB} GB vs Cluster Average ${centroids.dataGB} GB`,
    `Call Usage Pattern: ${callMin} Mins/Month (${callMin > 1000 ? 'Heavy' : 'Moderate'} Voice)`,
    `Budget Benchmark: Target ₹${rechargeBudget}/mo fits in ${clusterId} pricing model`,
    `5G & Telemetry Status: ${use5G ? '5G Uncapped Enabled' : 'Standard 4G Data'}, Roaming: ${dataRoaming.toUpperCase()}`,
  ];

  return {
    clusterId,
    clusterName,
    clusterDescription,
    aiAnalysis,
    top3Plans,
    allPlans: scoredPlans,
  };
}
