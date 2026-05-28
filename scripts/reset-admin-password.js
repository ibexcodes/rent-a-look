#!/usr/bin/env node
// Reset a user's password using the Firebase Admin SDK.
// Usage:
//   node scripts/reset-admin-password.js <email> <newPassword>
// Or set environment variables SERVICE_ACCOUNT_PATH, ADMIN_EMAIL, ADMIN_PASSWORD

const path = require('path');
const admin = require('firebase-admin');

const serviceAccountPath = process.env.SERVICE_ACCOUNT_PATH || path.join(process.cwd(), 'serviceAccountKey.json');
let serviceAccount;
try {
  serviceAccount = require(serviceAccountPath);
} catch (err) {
  console.error('Failed to load service account JSON from', serviceAccountPath);
  console.error('Provide the path via SERVICE_ACCOUNT_PATH or place serviceAccountKey.json in the project root.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function resetPassword(email, newPassword) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(user.uid, { password: newPassword });
    console.log(`Password updated for ${email}`);
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      console.error(`User not found: ${email}`);
    } else {
      console.error('Error resetting password:', err.message || err);
    }
    process.exit(1);
  }
}

const email = process.argv[2] || process.env.ADMIN_EMAIL || 'rentalook@gmail.com';
const newPassword = process.argv[3] || process.env.ADMIN_PASSWORD || 'group2';

resetPassword(email, newPassword).then(() => process.exit(0));
