const bcrypt = require('bcryptjs');
const env = require('../src/config/env');

async function seedAdmin() {
  const hash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
  console.log('==================================================');
  console.log('🔑 Admin Credentials Information');
  console.log('==================================================');
  console.log(`Username: ${env.ADMIN_USERNAME}`);
  console.log(`Password: ${env.ADMIN_PASSWORD}`);
  console.log(`Bcrypt Password Hash: ${hash}`);
  console.log('==================================================');
}

if (require.main === module) {
  seedAdmin();
}

module.exports = seedAdmin;
