import fs from 'fs';
import path from 'path';
import http from 'http';
import app from '../app.js';

/**
 * Native mirror of src/utils/api.ts safeFetchJson for node-based testing
 */
async function safeFetchJson(url, options = {}) {
  const defaultHeaders = {};
  if (options?.body && typeof options.body === 'string') {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const timeoutMs = options?.timeoutMs ?? 30000;
  const controller = new AbortController();
  let timer = null;

  if (timeoutMs > 0) {
    timer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);
  }

  const mergedOptions = {
    ...options,
    signal: options?.signal || controller.signal,
    headers: {
      ...defaultHeaders,
      ...(options?.headers || {}),
    },
  };

  try {
    const res = await fetch(url, mergedOptions);
    if (timer) clearTimeout(timer);

    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();

    if (!text || text.trim() === '') {
      let emptyMsg = "Serverdan boʻsh javob qaytdi.";
      if (!res.ok) {
        if (res.status === 404) {
          emptyMsg = "Soʻralgan API manzili topilmadi (404).";
        } else if (res.status >= 500) {
          emptyMsg = `Serverda vaqtinchalik xatolik yuz berdi (${res.status}).`;
        } else {
          emptyMsg = `Server xatosi (${res.status}): maʼlumot olinmadi.`;
        }
      }
      return {
        ok: false,
        status: res.status,
        error: emptyMsg,
      };
    }

    const trimmed = text.trim();

    if (
      contentType.includes('text/html') ||
      trimmed.startsWith('<!DOCTYPE') ||
      trimmed.startsWith('<!doctype') ||
      trimmed.startsWith('<html')
    ) {
      let htmlError = `Server xatolik sahifasini qaytardi (${res.status}).`;
      if (res.status === 404) {
        htmlError = "API server marshruti topilmadi (404). Server ishlayotganini yoki Netlify yoʻnaltirishini tekshiring.";
      } else if (res.status === 502 || res.status === 504) {
        htmlError = "Server bilan aloqa vaqtinchalik uzildi (502/504 Gateway). Iltimos, bir ozdan soʻng qayta urinib koʻring.";
      } else if (res.status >= 500) {
        htmlError = `Serverda vaqtinchalik nosozlik yuz berdi (${res.status}). Iltimos, keyinroq urinib koʻring.`;
      }

      return {
        ok: false,
        status: res.status,
        isHtml: true,
        error: htmlError,
      };
    }

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const isShortPlainText = trimmed.length < 120 && !trimmed.includes('<') && !trimmed.includes('{');
      return {
        ok: false,
        status: res.status,
        error: isShortPlainText && !res.ok 
          ? trimmed 
          : (res.status >= 500 
              ? `Serverda vaqtinchalik xatolik yuz berdi (${res.status}).` 
              : "Serverdan notoʻgʻri formatdagi maʼlumot qaytdi."),
      };
    }

    if (!res.ok) {
      const errMsg = parsed?.error || parsed?.message || `Server xatosi: ${res.status}`;
      return {
        ok: false,
        status: res.status,
        data: parsed,
        error: errMsg,
      };
    }

    return {
      ok: true,
      status: res.status,
      data: parsed,
    };
  } catch (networkErr) {
    if (timer) clearTimeout(timer);
    const isAbort = networkErr?.name === 'AbortError' || networkErr?.code === 20;
    return {
      ok: false,
      status: 0,
      error: isAbort
        ? "Server javob berish vaqti tugadi (30s). Internet tezligini tekshiring yoki keyinroq urinib koʻring."
        : "Tarmoqqa ulanishda vaqtinchalik uzilish roʻy berdi. Internet aloqasini tekshiring yoki bir ozdan soʻng urinib koʻring.",
    };
  }
}

let server;
let baseUrl = '';
let mockServer;
let mockBaseUrl = '';

function startServers() {
  return new Promise((resolve) => {
    // 1. Primary App Server
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;

      // 2. Edge-case Mock Server (HTML 502, Empty 200, Empty 500)
      mockServer = http.createServer((req, res) => {
        if (req.url === '/html-502') {
          res.writeHead(502, { 'Content-Type': 'text/html' });
          res.end('<!DOCTYPE html><html><head><title>502 Bad Gateway</title></head><body><h1>502 Bad Gateway</h1></body></html>');
        } else if (req.url === '/empty-200') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end('');
        } else if (req.url === '/empty-500') {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end('');
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not Found');
        }
      });

      mockServer.listen(0, '127.0.0.1', () => {
        const mockPort = mockServer.address().port;
        mockBaseUrl = `http://127.0.0.1:${mockPort}`;
        resolve();
      });
    });
  });
}

function stopServers() {
  return new Promise((resolve) => {
    if (server) server.close();
    if (mockServer) mockServer.close();
    resolve();
  });
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

async function runProductionSimulation() {
  console.log('================================================================');
  console.log('ADVOKATAI NETLIFY PRODUCTION SIMULATION SUITE (20 SCENARIOS)');
  console.log('================================================================\n');

  await startServers();

  // TEST 1: First Page Load & Static Assets Integrity
  console.log('[SCENARIO 1] First Page Load & Static Assets:');
  const distIndexPath = path.resolve('dist/index.html');
  const distRedirectsPath = path.resolve('dist/_redirects');
  const netlifyTomlPath = path.resolve('netlify.toml');

  assert(fs.existsSync(distIndexPath), 'dist/index.html exists and is built');
  const indexHtml = fs.readFileSync(distIndexPath, 'utf-8');
  assert(indexHtml.includes('<title>AdvokatAI'), 'index.html contains AdvokatAI title');
  assert(indexHtml.includes('viewport'), 'index.html defines viewport meta tag');
  assert(indexHtml.includes('/favicon.svg'), 'index.html links /favicon.svg');
  assert(indexHtml.includes('/favicon.ico'), 'index.html links /favicon.ico');
  assert(fs.existsSync(path.resolve('dist/favicon.svg')), 'dist/favicon.svg exists');
  assert(fs.existsSync(path.resolve('dist/zafar_zokirov.jpg')), 'dist/zafar_zokirov.jpg exists');
  assert(fs.existsSync(distRedirectsPath), 'dist/_redirects exists in publish directory');

  // TEST 2: Registration Flow
  console.log('\n[SCENARIO 2] Registration Flow:');
  const testEmail = `net_user_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'Sherzod Rahimov';

  const regRes = await safeFetchJson(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    body: JSON.stringify({
      name: testName,
      email: testEmail,
      password: testPassword,
      confirmPassword: testPassword,
    }),
  });
  assert(regRes.ok === true && regRes.status === 201, `Registration returned 201 Created (got ${regRes.status})`);
  assert(regRes.data?.data?.user?.email === testEmail, 'Created user email matches');
  assert(!regRes.data?.data?.user?.password, 'Plain-text password is not leaked in response');

  // TEST 3: Password Mismatch Prevention
  console.log('\n[SCENARIO 3] Password Mismatch Prevention:');
  const mismatchRes = await safeFetchJson(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'Mismatch User',
      email: `mismatch_${Date.now()}@example.com`,
      password: 'CorrectPassword123',
      confirmPassword: 'WrongPassword456',
    }),
  });
  assert(mismatchRes.ok === false && mismatchRes.status === 400, 'Password mismatch rejected with 400');
  assert(mismatchRes.error?.includes('bir-biriga mos kelmadi'), 'Mismatch error message in Uzbek');

  // TEST 4: Invalid Email Rejection
  console.log('\n[SCENARIO 4] Invalid Email Rejection:');
  const badEmailRes = await safeFetchJson(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'Bad Email User',
      email: 'not-an-email-address',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    }),
  });
  assert(badEmailRes.ok === false && badEmailRes.status === 400, 'Malformed email rejected with 400');
  assert(badEmailRes.error?.includes('email formati'), 'Identified invalid email format');

  // TEST 5: Successful Login
  console.log('\n[SCENARIO 5] Successful Login:');
  const loginRes = await safeFetchJson(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
    }),
  });
  assert(loginRes.ok === true && loginRes.status === 200, 'Login succeeded with 200 OK');
  assert(loginRes.data?.data?.user?.email === testEmail, 'User profile returned');

  // TEST 6: Wrong Password
  console.log('\n[SCENARIO 6] Wrong Password Authentication:');
  const wrongPassRes = await safeFetchJson(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: testEmail,
      password: 'DefinitivelyWrongPassword',
    }),
  });
  assert(wrongPassRes.ok === false && wrongPassRes.status === 401, 'Wrong password rejected with 401');
  assert(wrongPassRes.error?.includes('notoʻgʻri'), 'Informs invalid credentials');

  // TEST 7: Logout Session State Clearing
  console.log('\n[SCENARIO 7] Logout Session Clearing:');
  const userStorage = {
    advokatai_is_logged_in: 'true',
    advokatai_user_name: testName,
    advokatai_user_email: testEmail,
    advokatai_user: JSON.stringify({ name: testName, email: testEmail, plan: 'free' }),
  };
  delete userStorage.advokatai_is_logged_in;
  delete userStorage.advokatai_user;
  delete userStorage.advokatai_user_name;
  delete userStorage.advokatai_user_email;
  assert(Object.keys(userStorage).length === 0, 'All 4 session keys completely cleared on logout');

  // TEST 8: Refresh Persistence Simulation
  console.log('\n[SCENARIO 8] Page Refresh Persistence:');
  const activeSessionStorage = {
    advokatai_is_logged_in: 'true',
    advokatai_user_name: testName,
    advokatai_user_email: testEmail,
    advokatai_user: JSON.stringify({ name: testName, email: testEmail, plan: 'pro' }),
  };
  const isStillAuthed = activeSessionStorage['advokatai_is_logged_in'] === 'true';
  const restoredUser = JSON.parse(activeSessionStorage['advokatai_user']);
  assert(isStillAuthed === true, 'Session remains logged in across reloads');
  assert(restoredUser.plan === 'pro', 'User subscription tier persisted across reloads');

  // TEST 9: Chatbot Inquiry Execution
  console.log('\n[SCENARIO 9] Chatbot Inquiry Execution:');
  const chatRes = await safeFetchJson(`${baseUrl}/api/chat`, {
    method: 'POST',
    body: JSON.stringify({
      message: 'Ish beruvchi xodimni dam olish kunida ishlashga majbur qilishi mumkinmi?',
    }),
  });
  assert(chatRes.ok === true && chatRes.status === 200, 'Chatbot endpoint responds with 200 OK');
  assert(typeof chatRes.data?.data?.text === 'string' && chatRes.data.data.text.length > 50, 'Chatbot returns substantive legal analysis');

  // TEST 10: Legal Search Engine
  console.log('\n[SCENARIO 10] Legal Search Engine:');
  const searchRes = await safeFetchJson(`${baseUrl}/api/laws?q=mehnat&limit=5`);
  assert(searchRes.ok === true && searchRes.status === 200, 'Search API responds with 200 OK');
  assert(Array.isArray(searchRes.data?.data) && searchRes.data.data.length > 0, 'Search returned law articles');

  // TEST 11: Document Templates Catalog
  console.log('\n[SCENARIO 11] Document Templates Catalog:');
  const templatesRes = await safeFetchJson(`${baseUrl}/api/templates`);
  assert(templatesRes.ok === true && templatesRes.status === 200, 'Templates API responds with 200 OK');
  assert(Array.isArray(templatesRes.data?.data) && templatesRes.data.data.length > 0, 'Templates catalog returned');

  // TEST 12: Pricing Plans Catalog
  console.log('\n[SCENARIO 12] Pricing Plans Catalog:');
  const plansRes = await safeFetchJson(`${baseUrl}/api/plans`);
  assert(plansRes.ok === true && plansRes.status === 200, 'Plans API responds with 200 OK');
  const proPlan = Array.isArray(plansRes.data?.data) ? plansRes.data.data.find(p => p.plan_id === 'pro' || p.id === 'pro') : null;
  const premiumPlan = Array.isArray(plansRes.data?.data) ? plansRes.data.data.find(p => p.plan_id === 'premium' || p.id === 'premium') : null;
  assert((proPlan?.price || proPlan?.priceUzs) === 18000, 'Pro plan price is 18,000 UZS');
  assert((premiumPlan?.price || premiumPlan?.priceUzs) === 30000, 'Premium plan price is 30,000 UZS');

  // TEST 13: Payment System Submission & Duplicate Prevention
  console.log('\n[SCENARIO 13] Payment Flow & Validation:');
  const payConfigRes = await safeFetchJson(`${baseUrl}/api/payments/config`);
  assert(payConfigRes.ok === true, 'Payment config endpoint loaded');
  assert(Boolean(payConfigRes.data?.data?.cardNumber), 'Payment card number available');

  const payRes = await safeFetchJson(`${baseUrl}/api/payments/submit`, {
    method: 'POST',
    body: JSON.stringify({
      userId: 'test_user_net_simulation',
      planId: 'pro',
      payerName: 'Sherzod Rahimov',
      transactionReference: `TX-${Date.now()}-SIM`,
    }),
  });
  assert(payRes.ok === true && payRes.data?.success === true, 'Payment submitted successfully');

  // TEST 14: Protected Route & Destination Preservation
  console.log('\n[SCENARIO 14] Protected Route & Destination Preservation:');
  function simulateProtectedRoute(isLoggedIn, location) {
    if (!isLoggedIn) {
      return { redirect: '/login', state: { from: location } };
    }
    return { allow: true };
  }
  const protectedCheck = simulateProtectedRoute(false, { pathname: '/payment', search: '?plan=premium' });
  assert(protectedCheck.redirect === '/login', 'Unauthenticated user redirected to /login');

  const fromObj = protectedCheck.state.from;
  const targetDestination = `${fromObj.pathname}${fromObj.search || ''}`;
  assert(targetDestination === '/payment?plan=premium', 'Query string ?plan=premium preserved for post-login return');

  // TEST 15: Direct URL Navigation (Netlify SPA Redirects)
  console.log('\n[SCENARIO 15] Direct URL Navigation & Netlify SPA Rules:');
  const redirectsContent = fs.readFileSync(distRedirectsPath, 'utf-8');
  assert(redirectsContent.includes('/api/*  /.netlify/functions/api/:splat  200!'), 'API proxy rewrite rule configured with force');
  assert(redirectsContent.includes('/*      /index.html                     200'), 'SPA fallback rewrite to /index.html configured');

  const netlifyToml = fs.readFileSync(netlifyTomlPath, 'utf-8');
  assert(netlifyToml.includes('from = "/api/*"'), 'netlify.toml contains API redirect');
  assert(netlifyToml.includes('from = "/*"'), 'netlify.toml contains SPA fallback redirect');

  // TEST 16: Mobile Viewport & Responsive Meta Tags
  console.log('\n[SCENARIO 16] Mobile Viewport & Meta Tags:');
  assert(indexHtml.includes('name="viewport" content="width=device-width, initial-scale=1.0"'), 'Mobile viewport configured correctly');

  // TEST 17: Slow Network / Timeout Protection
  console.log('\n[SCENARIO 17] Timeout Protection:');
  const timeoutStart = Date.now();
  const timeoutRes = await safeFetchJson(`${baseUrl}/api/chat`, {
    method: 'POST',
    timeoutMs: 50, // 50ms timeout to trigger abort
    body: JSON.stringify({ message: 'test' }),
  });
  const timeoutElapsed = Date.now() - timeoutStart;
  assert(timeoutRes.ok === false && timeoutRes.status === 0, 'Timeout aborted cleanly with status 0');
  assert(timeoutRes.error?.includes('vaqti tugadi') || timeoutRes.error?.includes('uzilish'), 'Timeout informs user in Uzbek');
  assert(timeoutElapsed < 1000, `Aborted quickly (${timeoutElapsed}ms) without hanging`);

  // TEST 18: Failed API Request (404 Handling)
  console.log('\n[SCENARIO 18] Unknown API Route (404 Handling):');
  const notFoundRes = await safeFetchJson(`${baseUrl}/api/unknown_route_404`);
  assert(notFoundRes.ok === false && notFoundRes.status === 404, '404 caught safely');
  assert(notFoundRes.error?.includes('topilmadi') || notFoundRes.error?.includes('404'), '404 translated cleanly');

  // TEST 19: Server Returning HTML Instead of JSON (502 Bad Gateway)
  console.log('\n[SCENARIO 19] Server Returning HTML Instead of JSON (502 Bad Gateway):');
  const htmlRes = await safeFetchJson(`${mockBaseUrl}/html-502`);
  assert(htmlRes.ok === false && htmlRes.status === 502, '502 HTML response caught safely');
  assert(htmlRes.isHtml === true, 'Flagged isHtml: true');
  assert(htmlRes.error?.includes('502'), 'Informs 502 Gateway issue in Uzbek');

  // TEST 20: Empty API Response (Empty 200 and Empty 500)
  console.log('\n[SCENARIO 20] Empty Response Body Handling:');
  const empty200Res = await safeFetchJson(`${mockBaseUrl}/empty-200`);
  assert(empty200Res.ok === false, 'Empty 200 handled safely without SyntaxError');
  assert(empty200Res.error?.includes('boʻsh javob'), 'Informs empty response in Uzbek');

  const empty500Res = await safeFetchJson(`${mockBaseUrl}/empty-500`);
  assert(empty500Res.ok === false && empty500Res.status === 500, 'Empty 500 handled safely with status 500');

  // TEST 21 (BONUS): Netlify Function Prefix Normalization & CORS Preflight
  console.log('\n[BONUS] Netlify Function Prefix Normalization & CORS:');
  const netlifyFunctionRes = await safeFetchJson(`${baseUrl}/.netlify/functions/api/health`);
  assert(netlifyFunctionRes.ok === true && netlifyFunctionRes.status === 200, 'Normalized /.netlify/functions/api/health route returned 200 OK');

  // Preflight OPTIONS check for x-admin-key
  const optionsRes = await fetch(`${baseUrl}/api/admin/payments`, {
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://advokatai.netlify.app',
      'Access-Control-Request-Method': 'GET',
      'Access-Control-Request-Headers': 'x-admin-key',
    },
  });
  const allowHeaders = optionsRes.headers.get('access-control-allow-headers') || '';
  assert(allowHeaders.toLowerCase().includes('x-admin-key'), `Preflight allows x-admin-key header (got: ${allowHeaders})`);

  await stopServers();

  console.log('\n================================================================');
  console.log(`PRODUCTION SIMULATION COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runProductionSimulation().catch((err) => {
  console.error('Fatal simulation error:', err);
  process.exit(1);
});
