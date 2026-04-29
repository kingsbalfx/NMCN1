const http = require('http');

const baseURL = 'http://localhost:5000';
const tests = [
  { name: 'GET /api/status', method: 'GET', path: '/api/status' },
  { name: 'GET /auth/test', method: 'GET', path: '/auth/test' },
  { name: 'GET /api/public/nursing-questions', method: 'GET', path: '/api/public/nursing-questions' },
  { name: 'GET /api/payments/test', method: 'GET', path: '/api/payments/test' },
  { name: 'GET /api/users/test', method: 'GET', path: '/api/users/test' },
  { name: 'POST /api/auth/login (demo)', method: 'POST', path: '/api/auth/login', body: JSON.stringify({ email: 'demo@kingsbal.com', password: 'password123' }) }
];

async function runTest(test) {
  return new Promise((resolve) => {
    const url = new URL(test.path, baseURL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: test.method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ test: test.name, status: res.statusCode, success: res.statusCode >= 200 && res.statusCode < 300, data: parsed });
        } catch (e) {
          resolve({ test: test.name, status: res.statusCode, success: res.statusCode >= 200 && res.statusCode < 300, data });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ test: test.name, success: false, error: err.message });
    });

    if (test.body) req.write(test.body);
    req.end();
  });
}

async function main() {
  console.log('🧪 Starting smoke tests...\n');
  const results = [];

  for (const test of tests) {
    const result = await runTest(test);
    results.push(result);
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.test} ${result.status || 'ERROR'}`);
    if (result.error) console.log(`   Error: ${result.error}`);
  }

  console.log('\n📊 Summary:');
  const passed = results.filter(r => r.success).length;
  console.log(`   Passed: ${passed}/${tests.length}`);
  if (passed < tests.length) {
    console.log('   Failed tests:');
    results.filter(r => !r.success).forEach(r => console.log(`     - ${r.test}`));
  }

  process.exit(passed === tests.length ? 0 : 1);
}

main().catch(err => {
  console.error('Smoke test error:', err);
  process.exit(1);
});
