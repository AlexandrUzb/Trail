import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import app from '../app.js';
import vercelApp from '../../api/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

console.log('================================================================');
console.log('ADVOKATAI VERCEL PRODUCTION DEPLOYMENT VERIFICATION SUITE');
console.log('================================================================\n');

let passedCount = 0;
function pass(msg) {
  passedCount++;
  console.log(`>>> PASS [✓] ${msg}`);
}

async function runTests() {
  // TEST 1: Vercel configuration file validation
  console.log('[TEST 1] Vercel Configuration (vercel.json):');
  const vercelPath = path.join(ROOT_DIR, 'vercel.json');
  assert.ok(fs.existsSync(vercelPath), 'vercel.json must exist');
  pass('vercel.json exists in root');

  const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
  assert.strictEqual(vercelConfig.version, 2);
  assert.strictEqual(vercelConfig.outputDirectory, 'dist');
  assert.ok(vercelConfig.functions['api/**/*.js'], 'functions must include api/**/*.js');
  assert.strictEqual(vercelConfig.functions['api/**/*.js'].includeFiles, 'server/**');
  pass('functions includes server/** files');

  assert.ok(Array.isArray(vercelConfig.rewrites), 'rewrites must be an array');
  const apiRewrite = vercelConfig.rewrites.find(r => r.source === '/api/:path*');
  assert.ok(apiRewrite, '/api/:path* rewrite must exist');
  assert.strictEqual(apiRewrite.destination, '/api/index.js');
  pass('/api/:path* is routed to /api/index.js');

  const spaRewrite = vercelConfig.rewrites.find(r => r.source === '/:path*');
  assert.ok(spaRewrite, '/:path* SPA fallback rewrite must exist');
  assert.strictEqual(spaRewrite.destination, '/index.html');
  pass('/:path* is rewritten to /index.html (SPA fallback for /login, /register, etc.)');

  // TEST 2: Vercel Serverless Function Entry Point (api/index.js)
  console.log('\n[TEST 2] Vercel Serverless Function (api/index.js):');
  const apiIndexPath = path.join(ROOT_DIR, 'api/index.js');
  assert.ok(fs.existsSync(apiIndexPath), 'api/index.js must exist');
  pass('api/index.js exists');

  assert.strictEqual(typeof vercelApp, 'function', 'api/index.js must export Express app function');
  pass('api/index.js correctly exports Express application callable');

  // TEST 3: Static Build Output (dist/index.html)
  console.log('\n[TEST 3] Vite Production Build Output:');
  const distHtmlPath = path.join(ROOT_DIR, 'dist/index.html');
  assert.ok(fs.existsSync(distHtmlPath), 'dist/index.html must exist');
  const htmlContent = fs.readFileSync(distHtmlPath, 'utf8');
  assert.ok(htmlContent.includes('<div id="root">'), 'index.html contains root element');
  assert.ok(htmlContent.includes('AdvokatAI'), 'index.html contains AdvokatAI');
  pass('dist/index.html built and contains root container and metadata');

  // Start temporary HTTP server to test real requests against the Express app
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // TEST 4: CORS Headers for Production Domain
    console.log('\n[TEST 4] CORS Configuration:');
    const corsRes = await fetch(`${baseUrl}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://v0-advokat-ai.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    assert.strictEqual(corsRes.headers.get('access-control-allow-origin'), 'https://v0-advokat-ai.vercel.app');
    assert.strictEqual(corsRes.headers.get('access-control-allow-credentials'), 'true');
    pass('CORS correctly reflects https://v0-advokat-ai.vercel.app with credentials');

    // TEST 5: Direct API Endpoints
    console.log('\n[TEST 5] Health & Info Endpoints:');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(healthRes.status, 200);
    const healthJson = await healthRes.json();
    assert.strictEqual(healthJson.status, 'online');
    pass('GET /api/health returns 200 OK (status: online)');

    // TEST 6: Registration Flow
    console.log('\n[TEST 6] Registration Flow:');
    const testEmail = `vercel_test_${Date.now()}@example.com`;
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Vercel Test User',
        email: testEmail,
        password: 'password123',
        confirmPassword: 'password123'
      })
    });
    assert.strictEqual(regRes.status, 201);
    const regJson = await regRes.json();
    assert.strictEqual(regJson.success, true);
    assert.ok(regJson.data.token, 'Token must be issued');
    pass('POST /api/auth/register succeeds with 201 and returns signed token');

    // TEST 7: Password Mismatch Validation
    console.log('\n[TEST 7] Password Mismatch Validation:');
    const mismatchRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Mismatch User',
        email: `mismatch_${Date.now()}@example.com`,
        password: 'password123',
        confirmPassword: 'different_password'
      })
    });
    assert.strictEqual(mismatchRes.status, 400);
    const mismatchJson = await mismatchRes.json();
    assert.strictEqual(mismatchJson.success, false);
    pass('Password mismatch is rejected with 400 Bad Request');

    // TEST 8: Login Flow
    console.log('\n[TEST 8] Login Flow:');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123'
      })
    });
    assert.strictEqual(loginRes.status, 200);
    const loginJson = await loginRes.json();
    assert.strictEqual(loginJson.success, true);
    assert.ok(loginJson.data.token, 'Token must be issued');
    const authToken = loginJson.data.token;
    pass('POST /api/auth/login succeeds with 200 and returns signed token');

    // TEST 9: Invalid Login Credentials
    console.log('\n[TEST 9] Invalid Login Credentials:');
    const badLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'wrong_password'
      })
    });
    assert.strictEqual(badLoginRes.status, 401);
    const badLoginJson = await badLoginRes.json();
    assert.strictEqual(badLoginJson.success, false);
    pass('Invalid password rejected with 401 Unauthorized');

    // TEST 10: Authenticated Session Verification (/api/auth/me)
    console.log('\n[TEST 10] Session Verification:');
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    assert.strictEqual(meRes.status, 200);
    const meJson = await meRes.json();
    assert.strictEqual(meJson.data.user.email, testEmail);
    pass('GET /api/auth/me validates Bearer token and returns user profile');

    // TEST 11: Protected Template Endpoints
    console.log('\n[TEST 11] Protected Template Actions:');
    const unauthTmplRes = await fetch(`${baseUrl}/api/templates/1/download`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    assert.strictEqual(unauthTmplRes.status, 401);
    pass('Unauthenticated download to /api/templates/:id/download rejected with 401');

    const authTmplRes = await fetch(`${baseUrl}/api/templates/1/download`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ action: 'download_docx' })
    });
    assert.strictEqual(authTmplRes.status, 200);
    pass('Authenticated download to /api/templates/:id/download succeeded with 200');

    // TEST 12: Unmatched API route returns JSON 404, NEVER HTML
    console.log('\n[TEST 12] Unmatched API 404 Handling:');
    const notFoundRes = await fetch(`${baseUrl}/api/non_existent_endpoint_xyz`);
    assert.strictEqual(notFoundRes.status, 404);
    const notFoundJson = await notFoundRes.json();
    assert.strictEqual(notFoundJson.success, false);
    assert.ok(notFoundJson.error.includes('mavjud emas'));
    pass('Unmatched /api/* returns JSON 404, never falls through to HTML');

  } finally {
    server.close();
  }

  console.log('\n================================================================');
  console.log(`VERCEL DEPLOYMENT SUITE COMPLETE: ${passedCount} PASSED, 0 FAILED`);
  console.log('================================================================');
}

runTests().catch(err => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
