import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import app from '../app.js';
import storageService from '../services/storageService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let server;
let baseUrl = '';

function startTestServer() {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
}

function stopTestServer() {
  return new Promise((resolve) => {
    if (server) {
      server.close(resolve);
    } else {
      resolve();
    }
  });
}

async function request(reqPath, options = {}) {
  const url = `${baseUrl}${reqPath}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return {
    status: res.status,
    ok: res.ok,
    headers: res.headers,
    text,
    json,
  };
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`>>> PASS [✓] ${message}`);
    passed++;
  } else {
    console.error(`>>> FAIL [✗] ${message}`);
    failed++;
  }
}

async function runSessionAudit() {
  console.log('================================================================');
  console.log('ADVOKATAI FIRST-VISIT CLEAN SESSION & NO-AUTO-LOGIN AUDIT');
  console.log('================================================================\n');

  await startTestServer();

  try {
    // 1. Clean Visitor (No token, no auth header)
    console.log('[TEST 1] First-time visitor without token:');
    const cleanVisitorRes = await request('/api/auth/me');
    assert(cleanVisitorRes.status === 401, `GET /api/auth/me returns 401 Unauthorized (got ${cleanVisitorRes.status})`);
    assert(cleanVisitorRes.json?.success === false, 'success is false');
    assert(!cleanVisitorRes.json?.data?.user, 'No user object returned for clean visitor');

    // 2. Anti-caching headers on auth routes to prevent CDN edge caching across visitors
    console.log('\n[TEST 2] Edge cache prevention headers on /api/auth/me:');
    const cacheHeader = cleanVisitorRes.headers.get('cache-control') || '';
    assert(cacheHeader.includes('no-store'), `Cache-Control includes 'no-store' (got "${cacheHeader}")`);
    assert(cacheHeader.includes('private'), `Cache-Control includes 'private'`);
    assert(cleanVisitorRes.headers.get('pragma') === 'no-cache', `Pragma header is 'no-cache'`);

    // 3. Fake / forged token rejection
    console.log('\n[TEST 3] Forged / invalid Bearer token:');
    const forgedRes = await request('/api/auth/me', {
      headers: { Authorization: 'Bearer forged.fake.token123' },
    });
    assert(forgedRes.status === 401, `GET /api/auth/me with fake token returns 401 (got ${forgedRes.status})`);
    assert(forgedRes.json?.success === false, 'success is false');

    // 4. Unknown userId in storageService.getUser() must NOT persist ghost accounts
    console.log('\n[TEST 4] Anonymous / unknown visitor storage isolation:');
    const usersFilePath = path.join(__dirname, '..', 'data', 'users.json');
    const usersBefore = fs.existsSync(usersFilePath) ? fs.readFileSync(usersFilePath, 'utf8') : '[]';
    
    const ephemeralId = `anon_visitor_${Date.now()}`;
    const guestUser = storageService.getUser(ephemeralId);
    assert(guestUser !== null, 'storageService.getUser returns in-memory guest');
    assert(guestUser.role === 'guest', `Guest role is 'guest' (got ${guestUser.role})`);
    assert(guestUser.plan === 'free', `Guest plan is 'free'`);

    const usersAfter = fs.existsSync(usersFilePath) ? fs.readFileSync(usersFilePath, 'utf8') : '[]';
    assert(!usersAfter.includes(ephemeralId), 'Anonymous visitor was NOT written to users.json');
    assert(usersBefore === usersAfter, 'users.json content unchanged by anonymous visitor');

    // 5. Explicit user registration & login
    console.log('\n[TEST 5] Legitimate user registration and verification:');
    const userAEmail = `legit_user_${Date.now()}@example.com`;
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Azamat Qodirov',
        email: userAEmail,
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
      }),
    });
    assert(regRes.status === 201, `Registered user A status is 201 (got ${regRes.status})`);
    const tokenA = regRes.json?.data?.token;
    assert(Boolean(tokenA), 'Valid token A issued upon registration');

    const meResA = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(meResA.status === 200, `GET /api/auth/me with token A returns 200 (got ${meResA.status})`);
    assert(meResA.json?.data?.user?.email === userAEmail, `Returned user matches user A (${userAEmail})`);
    assert(meResA.json?.data?.user?.name === 'Azamat Qodirov', 'Returned user name matches');

    // 6. Multi-user session isolation: User B must NEVER see User A
    console.log('\n[TEST 6] Multi-user session isolation:');
    const userBEmail = `other_user_${Date.now()}@example.com`;
    const regResB = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Dilshod Aliyev',
        email: userBEmail,
        password: 'SecurePassword456!',
        confirmPassword: 'SecurePassword456!',
      }),
    });
    const tokenB = regResB.json?.data?.token;

    const meResB = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${tokenB}` },
    });
    assert(meResB.status === 200, `User B verified with 200`);
    assert(meResB.json?.data?.user?.email === userBEmail, `User B sees only user B (${userBEmail})`);
    assert(meResB.json?.data?.user?.email !== userAEmail, 'User B NEVER sees User A email');

    // 7. Explicit Logout endpoint
    console.log('\n[TEST 7] Explicit Logout endpoint:');
    const logoutRes = await request('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert(logoutRes.status === 200, `POST /api/auth/logout returns 200 (got ${logoutRes.status})`);
    assert(logoutRes.json?.success === true, 'Logout success is true');
    assert(logoutRes.headers.get('cache-control')?.includes('no-store'), 'Logout response also contains no-store');

    console.log('\n================================================================');
    console.log(`SESSION AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    await stopTestServer();
  }
}

runSessionAudit().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
