/**
 * Generate Test Agent Token
 *
 * Creates a simple JWT token for testing Agent authentication
 */

const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'bloom-identity-dev-secret';

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateTestToken() {
  const testAddress = '0x' + crypto.randomBytes(20).toString('hex');
  const nonce = crypto.randomUUID();
  const timestamp = Date.now();
  const expiresAt = timestamp + 24 * 60 * 60 * 1000; // 24 hours

  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const payload = {
    address: testAddress,
    nonce,
    timestamp,
    expiresAt,
    scope: 'read:identity,read:skills,read:wallet',
  };

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${headerEncoded}.${payloadEncoded}`)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const token = `${headerEncoded}.${payloadEncoded}.${signature}`;

  return {
    token,
    testAddress,
    dashboardUrl: `http://localhost:3000/dashboard?token=${token}`,
  };
}

// Generate and print token
const { token, testAddress, dashboardUrl } = generateTestToken();

console.log('\n🔐 Test Agent Token Generated\n');
console.log('Test Address:', testAddress);
console.log('\nToken:', token);
console.log('\n🌐 Dashboard URL:');
console.log(dashboardUrl);
console.log('\n📋 Copy and paste this URL in your browser to test Agent login\n');
