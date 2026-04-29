#!/usr/bin/env node
/**
 * End-to-End Integration Test
 * Tests the full auth flow: register, login, dashboard access, payment
 */

const http = require('http');
const assert = require('assert');

const BASE_URL = 'http://localhost:5000/api';
const testUser = {
  full_name: 'Test Student',
  email: `teststudent${Date.now()}@test.com`,
  password: 'testpass123'
};

let token = '';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    return true;
  } catch (err) {
    console.error(`❌ ${name}: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('🧪 Running E2E Integration Tests\n');

  let passed = 0;
  let total = 0;

  // Test 1: Register
  total++;
  if (await test('POST /auth/register', async () => {
    const res = await request('POST', '/auth/register', testUser);
    assert.strictEqual(res.status, 201, `Expected 201, got ${res.status}`);
    assert(res.data.user?.email, 'User email not in response');
  })) passed++;

  // Test 2: Login
  total++;
  if (await test('POST /auth/login', async () => {
    const res = await request('POST', '/auth/login', { email: testUser.email, password: testUser.password });
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    assert(res.data.token, 'Token not in response');
    token = res.data.token;
  })) passed++;

  // Test 3: Get current user
  total++;
  if (await test('GET /auth/me (with token)', async () => {
    const res = await request('GET', '/auth/me');
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    assert(res.data.user?.email, 'User data not returned');
  })) passed++;

  // Test 4: Initiate payment
  total++;
  if (await test('POST /payments/initiate (demo mode)', async () => {
    const res = await request('POST', '/payments/initiate', { amount: 1200 });
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    assert(res.data.status === 'success' || res.data.reference, 'Payment reference not returned');
  })) passed++;

  // Test 5: Get public nursing questions
  total++;
  if (await test('GET /public/nursing-questions (unauthenticated)', async () => {
    const oldToken = token;
    token = ''; // Clear token to test public endpoint
    const res = await request('GET', '/public/nursing-questions');
    token = oldToken;
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.data.questions), 'Questions not an array');
  })) passed++;

  console.log(`\n📊 Test Summary: ${passed}/${total} passed`);
  process.exit(passed === total ? 0 : 1);
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
