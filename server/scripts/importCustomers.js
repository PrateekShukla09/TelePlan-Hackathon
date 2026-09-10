const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });
const Customer = require('../src/models/Customer');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tariff_recommender';

async function importCustomers(filePath) {
  const targetPath = filePath || process.argv[2];
  if (!targetPath || !fs.existsSync(targetPath)) {
    console.error(`[Import Error] CSV file not found: ${targetPath}`);
    console.log('Usage: npm run import:customers <path-to-csv-file>');
    process.exit(1);
  }

  let targetUri = MONGODB_URI;
  const isMemoryMode = process.argv.includes('--memory');
  if (isMemoryMode) {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const memoryServer = await MongoMemoryServer.create();
    targetUri = memoryServer.getUri();
  }

  console.log(`[Import] Connecting to database at ${targetUri}...`);
  try {
    await mongoose.connect(targetUri, { serverSelectionTimeoutMS: 3000 });
  } catch (connErr) {
    if (!isMemoryMode) {
      console.log('[Import Info] Local MongoDB unavailable. Using MongoMemoryServer...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const memoryServer = await MongoMemoryServer.create();
      targetUri = memoryServer.getUri();
      await mongoose.connect(targetUri);
    } else {
      throw connErr;
    }
  }

  let totalRecords = 0;
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let invalid = 0;
  const invalidRecords = [];
  const rowsToInsert = [];

  fs.createReadStream(targetPath)
    .pipe(csv())
    .on('data', (row) => {
      totalRecords++;

      try {
        const name = row.name || row.CustomerName || row.customer_name || `Customer ${totalRecords}`;
        const phone = row.phone || row.PhoneNumber || row.phone_number || `+9190000${10000 + totalRecords}`;
        const tenureMonths = Math.max(0, parseInt(row.tenureMonths || row.tenure || row.Tenure || 6, 10));
        const contractType = (row.contractType || row.Contract || '').toLowerCase().includes('prepaid') ? 'prepaid' : 'postpaid';

        const avgCallMin = parseFloat(row.avgCallMin || row.MonthlyMinutes || row.total_calls || 300);
        const dataGB = parseFloat(row.dataGB || row.MonthlyDataGB || row.total_data_gb || 10);
        const smsCount = parseFloat(row.smsCount || row.MonthlySMS || row.total_sms || 50);
        const roamingUsage = parseFloat(row.roamingUsage || row.RoamingMinutes || 0);
        const internationalUsage = parseFloat(row.internationalUsage || row.InternationalMinutes || 0);

        if (isNaN(avgCallMin) || isNaN(dataGB) || avgCallMin < 0 || dataGB < 0) {
          invalid++;
          invalidRecords.push({ row: totalRecords, reason: 'Invalid numerical usage values' });
          return;
        }

        rowsToInsert.push({
          name,
          phone,
          tenureMonths,
          contractType,
          usage: {
            avgCallMin,
            dataGB,
            smsCount,
            dayEveningNightSplit: { day: 0.4, evening: 0.35, night: 0.25 },
            roamingUsage: Math.max(0, roamingUsage),
            internationalUsage: Math.max(0, internationalUsage)
          }
        });
      } catch (err) {
        invalid++;
        invalidRecords.push({ row: totalRecords, reason: err.message });
      }
    })
    .on('end', async () => {
      if (rowsToInsert.length > 0) {
        for (const doc of rowsToInsert) {
          try {
            const result = await Customer.updateOne(
              { phone: doc.phone },
              { $set: doc },
              { upsert: true }
            );
            if (result.upsertedCount > 0) {
              inserted++;
            } else if (result.modifiedCount > 0) {
              updated++;
            } else {
              skipped++;
            }
          } catch (err) {
            invalid++;
            invalidRecords.push({ row: doc.phone, reason: err.message });
          }
        }
      }

      console.log('==================================================');
      console.log('📊 Customer CSV Import Summary Report');
      console.log('==================================================');
      console.log(`Total:     ${totalRecords}`);
      console.log(`Inserted:  ${inserted}`);
      console.log(`Updated:   ${updated}`);
      console.log(`Invalid:   ${invalid}`);
      console.log(`Skipped:   ${skipped}`);
      if (invalidRecords.length > 0) {
        console.log('\nSample Invalid Records:', invalidRecords.slice(0, 5));
      }
      console.log('==================================================');

      process.exit(0);
    });
}

if (require.main === module) {
  importCustomers();
}

module.exports = importCustomers;
