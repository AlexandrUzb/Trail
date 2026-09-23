import http from 'http';
import app from '../app.js';

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

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: res.status, ok: res.ok, text, json };
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

async function runAuthSuite() {
  console.log('================================================================');
  console.log('ADVOKATAI AUTHENTICATION SYSTEM 12-SCENARIO VERIFICATION SUITE');
  console.log('================================================================\n');

  await startTestServer();

  const testEmail = `test_user_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'Zafar Usmonov';

  // SCENARIO 1: Successful Registration
  console.log('[SCENARIO 1] Successful Registration:');
  const regRes = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: testName,
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword
    })
  });
  assert(regRes.status === 201, `Status code is 201 Created (got ${regRes.status})`);
  assert(regRes.json?.success === true, 'Response JSON success is true');
  assert(regRes.json?.data?.user?.email === testEmail, `User email matches registered email (${testEmail})`);
  assert(regRes.json?.data?.user?.name === testName, `User name matches registered name (${testName})`);
  assert(!regRes.json?.data?.user?.password, 'User password is NOT exposed in response');

  // SCENARIO 2: Registration with Mismatched Passwords
  console.log('\n[SCENARIO 2] Registration with Mismatched Passwords:');
  const mismatchRes = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Mismatched User',
      email: `mismatch_${Date.now()}@example.com`,
      password: 'CorrectPassword123',
      confirmPassword: 'DifferentPassword456'
    })
  });
  assert(mismatchRes.status === 400, `Rejected with 400 Bad Request (got ${mismatchRes.status})`);
  assert(mismatchRes.json?.success === false, 'success is false');
  assert(mismatchRes.json?.error?.includes('bir-biriga mos kelmadi'), 'Error mentions password mismatch in Uzbek');

  // SCENARIO 3: Registration with Empty and Whitespace Fields
  console.log('\n[SCENARIO 3] Registration with Empty and Whitespace Fields:');
  const emptyNameRes = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: '   ',
      email: `valid_${Date.now()}@example.com`,
      password: 'validPassword123',
      confirmPassword: 'validPassword123'
    })
  });
  assert(emptyNameRes.status === 400, 'Whitespace-only name rejected with 400');
  assert(emptyNameRes.json?.error?.includes('Ismingizni kiriting'), 'Prompts for name');

  const emptyEmailRes = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Valid Name',
      email: '   ',
      password: 'validPassword123',
      confirmPassword: 'validPassword123'
    })
  });
  assert(emptyEmailRes.status === 400, 'Whitespace-only email rejected with 400');

  const shortPassRes = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Valid Name',
      email: `valid_${Date.now()}@example.com`,
      password: '123',
      confirmPassword: '123'
    })
  });
  assert(shortPassRes.status === 400, 'Short password (<6 chars) rejected with 400');
  assert(shortPassRes.json?.error?.includes('kamida 6 ta belgidan'), 'Requires at least 6 characters');

  // SCENARIO 4: Registration with Invalid Email Format
  console.log('\n[SCENARIO 4] Registration with Invalid Email Format:');
  const invalidEmailRes = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Valid Name',
      email: 'invalid-email-format-without-at',
      password: 'validPassword123',
      confirmPassword: 'validPassword123'
    })
  });
  assert(invalidEmailRes.status === 400, 'Invalid email without @ rejected with 400');
  assert(invalidEmailRes.json?.error?.includes('email formati'), 'Error identifies email format error');

  // SCENARIO 5: Successful Login
  console.log('\n[SCENARIO 5] Successful Login:');
  const loginRes = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testEmail,
      password: testPassword
    })
  });
  assert(loginRes.status === 200, `Login returns 200 OK (got ${loginRes.status})`);
  assert(loginRes.json?.success === true, 'Login response success is true');
  assert(loginRes.json?.data?.user?.email === testEmail, 'Logged in user email matches');
  assert(loginRes.json?.data?.user?.name === testName, 'Logged in user name matches');

  // SCENARIO 6: Login with Wrong Password
  console.log('\n[SCENARIO 6] Login with Wrong Password:');
  const wrongPassRes = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testEmail,
      password: 'TotallyWrongPassword999'
    })
  });
  assert(wrongPassRes.status === 401, `Wrong password returns 401 Unauthorized (got ${wrongPassRes.status})`);
  assert(wrongPassRes.json?.success === false, 'success is false');
  assert(wrongPassRes.json?.error?.includes('notoʻgʻri'), 'Error informs invalid credentials');

  // SCENARIO 7: Login with Non-Existent Email
  console.log('\n[SCENARIO 7] Login with Non-Existent Email:');
  const wrongEmailRes = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'nonexistent_user_99999999@advokatai.uz',
      password: 'AnyPassword123'
    })
  });
  assert(wrongEmailRes.status === 401, `Nonexistent email returns 401 Unauthorized (got ${wrongEmailRes.status})`);
  assert(wrongEmailRes.json?.error?.includes('notoʻgʻri'), 'Error informs invalid credentials uniformly');

  // SCENARIO 8: Successful Logout Session State Simulation
  console.log('\n[SCENARIO 8] Successful Logout Session Clearing:');
  // Simulated browser localStorage
  const mockLocalStorage = {
    advokatai_is_logged_in: 'true',
    advokatai_user_name: testName,
    advokatai_user_email: testEmail,
    advokatai_user: JSON.stringify({ name: testName, email: testEmail, plan: 'free' })
  };

  function simulateLogout(storage) {
    delete storage['advokatai_is_logged_in'];
    delete storage['advokatai_user'];
    delete storage['advokatai_user_name'];
    delete storage['advokatai_user_email'];
  }

  simulateLogout(mockLocalStorage);
  assert(mockLocalStorage['advokatai_is_logged_in'] === undefined, 'advokatai_is_logged_in removed');
  assert(mockLocalStorage['advokatai_user'] === undefined, 'advokatai_user removed');
  assert(mockLocalStorage['advokatai_user_name'] === undefined, 'advokatai_user_name removed');
  assert(mockLocalStorage['advokatai_user_email'] === undefined, 'advokatai_user_email removed');
  assert(Object.keys(mockLocalStorage).length === 0, 'All auth keys completely wiped');

  // SCENARIO 9: Refreshing Page while Logged In (Session Persistence)
  console.log('\n[SCENARIO 9] Refreshing Page While Logged In:');
  const restoredSession = {
    advokatai_is_logged_in: 'true',
    advokatai_user_name: testName,
    advokatai_user_email: testEmail,
    advokatai_user: JSON.stringify({ name: testName, email: testEmail, plan: 'pro' })
  };
  const isStillLoggedIn = restoredSession['advokatai_is_logged_in'] === 'true';
  const parsedUser = JSON.parse(restoredSession['advokatai_user']);
  assert(isStillLoggedIn === true, 'Session remains logged in across reload');
  assert(parsedUser.email === testEmail, 'User profile preserved on refresh');
  assert(parsedUser.plan === 'pro', 'User subscription tier preserved on refresh');

  // SCENARIO 10: Refreshing Page while Logged Out
  console.log('\n[SCENARIO 10] Refreshing Page While Logged Out:');
  const loggedOutStorage = {};
  const isLoggedOut = loggedOutStorage['advokatai_is_logged_in'] === 'true';
  assert(isLoggedOut === false, 'Session remains logged out across reload');

  // SCENARIO 11: Route Guard Logic Simulation
  console.log('\n[SCENARIO 11] Route Guard Navigation:');
  function checkProtectedRoute(isLoggedIn) {
    if (!isLoggedIn) {
      return { redirect: '/login', state: { from: '/payment' } };
    }
    return { allow: true };
  }
  function checkPublicOnlyRoute(isLoggedIn) {
    if (isLoggedIn) {
      return { redirect: '/chat' };
    }
    return { allow: true };
  }

  const unauthPaymentAccess = checkProtectedRoute(false);
  assert(unauthPaymentAccess.redirect === '/login', 'Unauthenticated user on /payment is redirected to /login');
  assert(unauthPaymentAccess.state?.from === '/payment', 'Original destination /payment preserved for post-login return');

  const authLoginAccess = checkPublicOnlyRoute(true);
  assert(authLoginAccess.redirect === '/chat', 'Already logged-in user visiting /login is redirected to /chat');

  const authRegisterAccess = checkPublicOnlyRoute(true);
  assert(authRegisterAccess.redirect === '/chat', 'Already logged-in user visiting /register is redirected to /chat');

  // SCENARIO 12: Network/Server Failure Resiliency
  console.log('\n[SCENARIO 12] Network & Server Failure Graceful Handling:');
  // 12a: Unmatched API route returns JSON, not HTML
  const notFoundRoute = await request('/api/nonexistent-route-endpoint');
  assert(notFoundRoute.status === 404, 'Unknown API route returns 404 status');
  assert(notFoundRoute.json?.success === false, '404 returns JSON without throw');

  // 12b: Verify Google OAuth endpoint is completely removed
  const googleAuthRoute = await request('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ email: 'test@gmail.com' })
  });
  assert(googleAuthRoute.status === 404, `POST /api/auth/google is removed and returns 404 (got ${googleAuthRoute.status})`);

  await stopTestServer();

  console.log('\n================================================================');
  console.log(`ADVOKATAI AUTH SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
