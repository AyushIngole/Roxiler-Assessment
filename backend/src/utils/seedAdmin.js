const bcrypt = require('bcryptjs');
const { User } = require('../models');

async function seedAdmin() {
  const adminExists = await User.findOne({ where: { role: 'ADMIN' } });
  if (adminExists) return;

  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_ADDRESS } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_ADDRESS) {
    console.warn('Skipping admin bootstrap: ADMIN_* env vars are not fully set');
    return;
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: hashed,
    address: ADMIN_ADDRESS,
    role: 'ADMIN',
  });
  console.log(`Bootstrap admin created: ${ADMIN_EMAIL}`);
}

module.exports = seedAdmin;
