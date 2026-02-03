const http = require('http');

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 5000;

const options = {
  hostname: host,
  port: port,
  path: '/test',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try { console.log('healthcheck:', res.statusCode, data); process.exit(0); } catch (e) { console.error(e); process.exit(1); }
  });
});

req.on('error', err => {
  console.error('healthcheck error:', err.message);
  process.exit(1);
});

req.end();
