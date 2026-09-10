const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Customer = require('../src/models/Customer');
const Plan = require('../src/models/Plan');
const Recommendation = require('../src/models/Recommendation');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tariff_recommender';

const catalogue25Plans = [
  // Category 1: Budget & Essential (5 plans)
  {
    planName: 'Essential Voice',
    price: 199,
    dataGB: 5,
    callMinutes: 3000,
    sms: 100,
    roamingIncluded: true,
    validityDays: 28,
    sourceOperatorRef: 'TelePlan Core'
  },
  {
    planName: 'Essential Data',
    price: 249,
    dataGB: 42,
    callMinutes: 3000,
    sms: 100,
    roamingIncluded: true,
    validityDays: 28,
    sourceOperatorRef: 'TelePlan Core'
  },
  {
    planName: 'Student Power',
    price: 299,
    dataGB: 56,
    callMinutes: 3000,
    sms: 100,
    roamingIncluded: true,
    validityDays: 28,
    sourceOperatorRef: 'TelePlan Core'
  },
  {
    planName: 'Voice Plus',
    price: 299,
    dataGB: 20,
    callMinutes: 3000,
    sms: 100,
    roamingIncluded: true,
    validityDays: 56,
    sourceOperatorRef: 'TelePlan Core'
  },
  {
    planName: 'Senior Connect',
    price: 249,
    dataGB: 10,
    callMinutes: 3000,
    sms: 100,
    roamingIncluded: true,
    validityDays: 56,
    sourceOperatorRef: 'TelePlan Core'
  },

  // Category 2: Unlimited / 5G (5 plans)
  {
    planName: '5G Freedom',
    price: 349,
    dataGB: 56,
    callMinutes: 3000,
    sms: 100,
    roamingIncluded: true,
    validityDays: 28,
    sourceOperatorRef: 'TelePlan 5G'
  },
  {
    planName: 'Infinity 4G/5G',
    price: 399,
    dataGB: 100,
    callMinutes: 3000,
    sms: 100,
    roamingIncluded: true,
    validityDays: 28,
    sourceOperatorRef: 'TelePlan 5G'
  },
  {
    planName: 'Infinity Plus',
    price: 449,
    dataGB: 120,
    callMinutes: 3000,
    sms: 100,
    roamingIncluded: true,
    validityDays: 28,
    sourceOperatorRef: 'TelePlan Premium'
  },
  {
    planName: 'Power 5G',
    price: 499,
    dataGB: 112,
    callMinutes: 3000,
    sms: 100,
    roamingIncluded: true,
    validityDays: 56,
    sourceOperatorRef: 'TelePlan 5G'
  },
  {
    planName: '5G Long-Life',
    price: 649,
    dataGB: 137,
    callMinutes: 3000,
    sms: 100,
    roamingIncluded: true,
    validityDays: 56,
    sourceOperatorRef: 'TelePlan 5G'
  },

  // Category 3: Behaviour-Based (6 plans)
  {
    planName: 'Night Infinity',
    price: 299,
    dataGB: 56,
    callMinutes: 3000,
    sms: 100,
    roamingIncluded: true,
    validityDays: 28,
    sourceOperatorRef: 'TelePlan Special'
  },
  {
    planName: 'Night Power',
    price: 349,
    dataGB: 56,
    callMinutes: 3000,
    sms: 100,
    roamingIncluded: true,
    validityDays: 28,
    sourceOperatorRef: 'TelePlan Special'
  },
  {
    planName: 'Weekend Infinity',
    price: 399,
    dataGB: 56,
    callMinutes: 3000,
    sms: 100,
    roamingIncluded: true,
    validityDays: 28,
    sourceOperatorRef: 'TelePlan Special'
  },
  {
    planName: 'Gamer Infinity',
    price: 449,
    dataGB: 100,
    callMinutes: 3000,
    sms: 100,
    roamingIncluded: true,
    validityDays: 28,
    sourceOperatorRef: 'TelePlan Special'
  },
  {
    planName: 'Stream Infinity',
    price: 499,
    dataGB: 120,
    callMinutes: 3000,
    sms: 100,
    roamingIncluded: true,
    validityDays: 28,
    sourceOperatorRef: 'TelePlan Special'
  },
  {
    planName: 'Social Infinity',
    price: 349,
    dataGB: 56,
    callMinutes: 3000,
    sms: 100,
    roamingIncluded: true,
    validityDays: 28,
    sourceOperatorRef: 'TelePlan Special'
  },

  // Category 4: Professional / Specialised (5 plans)
  {
    planName: 'AI & Coding Pro',
    price: 499,
    dataGB: 100,
    callMinutes: 3000,
    sms: 100,
    roamingIncluded: true,
    validityDays: 28,
    sourceOperatorRef: 'TelePlan Pro'
  },
  {
    planName: 'Work From Anywhere',
    price: 549,
    dataGB: 100,
    callMinutes: 3000,
    sms: 100,
    roamingIncluded: true,
    validityDays: 28,
    sourceOperatorRef: 'TelePlan Pro'
  },
  {
    planName: 'Creator Pro',
    price: 599,
    dataGB: 150,
    callMinutes: 3000,
    sms: 100,
    roamingIncluded: true,
    validityDays: 28,
    sourceOperatorRef: 'TelePlan Pro'
  },
  {
    planName: 'Traveller Pro',
    price: 699,
    dataGB: 112,
    callMinutes: 3000,
    sms: 100,
    roamingIncluded: true,
    validityDays: 56,
    sourceOperatorRef: 'TelePlan Global'
  },
  {
    planName: 'International Connect',
    price: 799,
    dataGB: 112,
    callMinutes: 3000,
    sms: 100,
    roamingIncluded: true,
    validityDays: 56,
    sourceOperatorRef: 'TelePlan Global'
  },

  // Category 5: Family / Premium / Long Validity (4 plans)
  {
    planName: 'Family Share 3',
    price: 899,
    dataGB: 150,
    callMinutes: 5000,
    sms: 300,
    roamingIncluded: true,
    validityDays: 56,
    sourceOperatorRef: 'TelePlan Family'
  },
  {
    planName: 'Family Max 4',
    price: 1499,
    dataGB: 300,
    callMinutes: 8000,
    sms: 400,
    roamingIncluded: true,
    validityDays: 90,
    sourceOperatorRef: 'TelePlan Family'
  },
  {
    planName: 'Premium Infinity',
    price: 1999,
    dataGB: 300,
    callMinutes: 10000,
    sms: 500,
    roamingIncluded: true,
    validityDays: 90,
    sourceOperatorRef: 'TelePlan Premium'
  },
  {
    planName: 'Annual Infinity',
    price: 3999,
    dataGB: 730,
    callMinutes: 10000,
    sms: 500,
    roamingIncluded: true,
    validityDays: 365,
    sourceOperatorRef: 'TelePlan Premium'
  }
];

const customerNames = [
  'Aarav Sharma', 'Ananya Patel', 'Rohan Mehta', 'Priya Singh', 'Vikram Rao',
  'Isha Gupta', 'Rahul Verma', 'Sneha Joshi', 'Aditya Nair', 'Kavya Iyer',
  'Siddharth Reddy', 'Neha Das', 'Karan Kapoor', 'Pooja Bhat', 'Amitabh Kumar',
  'Ritu Saxena', 'Manish Agarwal', 'Divya Bose', 'Sanjay Mishra', 'Tanya Pillai',
  'Deepak Malhotra', 'Swati Roy', 'Nikhil Choudhury', 'Simran Arora', 'Gaurav Jain'
];

async function seed() {
  let targetUri = MONGODB_URI;
  let memoryServer = null;

  const isMemoryMode = process.argv.includes('--memory');
  if (isMemoryMode) {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    targetUri = memoryServer.getUri();
  }

  console.log(`[Seed] Connecting to ${targetUri}...`);
  try {
    await mongoose.connect(targetUri, { serverSelectionTimeoutMS: 15000 });
  } catch (err) {
    console.warn(`[Seed Connection Warning] Failed to connect to MongoDB Atlas (${err.message}).`);
    if (!isMemoryMode) {
      console.log('[Seed Info] Falling back to MongoMemoryServer for offline dev/test mode...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      targetUri = memoryServer.getUri();
      await mongoose.connect(targetUri);
    } else {
      throw err;
    }
  }

  console.log('[Seed] Clearing existing collections...');
  await Customer.deleteMany({});
  await Plan.deleteMany({});
  await Recommendation.deleteMany({});

  console.log('[Seed] Inserting 25 Catalogue plans...');
  const insertedPlans = await Plan.insertMany(catalogue25Plans);
  console.log(`[Seed] Inserted ${insertedPlans.length} tariff plans.`);

  const sampleCustomers = customerNames.map((name, idx) => {
    const isPrepaid = idx % 3 === 0;
    const isHeavyData = idx % 4 === 0;
    const isHeavyCall = idx % 5 === 0;
    const isRoaming = idx % 6 === 0;

    return {
      name,
      phone: `+9198765${10000 + idx}`,
      tenureMonths: (idx * 3) + 2,
      contractType: isPrepaid ? 'prepaid' : 'postpaid',
      usage: {
        avgCallMin: isHeavyCall ? 1400 : (idx * 40 + 150),
        dataGB: isHeavyData ? 35 : (idx * 1.5 + 4),
        smsCount: (idx * 25 + 30),
        dayEveningNightSplit: { day: 0.45, evening: 0.35, night: 0.20 },
        roamingUsage: isRoaming ? (idx * 10 + 50) : 0,
        internationalUsage: isRoaming ? 15 : 0
      },
      currentPlanId: insertedPlans[idx % insertedPlans.length]._id
    };
  });

  console.log('[Seed] Inserting customers...');
  const insertedCustomers = await Customer.insertMany(sampleCustomers);
  console.log(`[Seed] Inserted ${insertedCustomers.length} telecom customers.`);

  console.log('==================================================');
  console.log('✅ Database Seed Completed Successfully!');
  console.log('==================================================');

  if (require.main === module) {
    process.exit(0);
  }
}

if (require.main === module) {
  seed().catch(err => {
    console.error('[Seed Error]', err);
    process.exit(1);
  });
}

module.exports = seed;
