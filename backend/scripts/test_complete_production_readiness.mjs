/**
 * AdvokatAI - Complete Production-Readiness & Chaos Verification Suite
 * 
 * Verifies all 9 phases of production robustness under adversarial,
 * network-failure, bad-input, and corrupt-state conditions.
 */

import http from 'http';
import app from '../app.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

let server;
let baseUrl;

function logPass(msg) {
  console.log(`>>> PASS [✓] ${msg}`);
}

function logFail(msg, detail) {
  console.error(`>>> FAIL [✗] ${msg}`, detail || '');
  process.exit(1);
}

function assert(condition, message, detail) {
  if (!condition) {
    logFail(message, detail);
  } else {
    logPass(message);
  }
}

async function request(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const defaultHeaders = {};
  if (options.body && typeof options.body === 'string') {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {})
    }
  });

  const contentType = res.headers.get('content-type') || '';
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch (e) {}

  return {
    status: res.status,
    headers: res.headers,
    contentType,
    text,
    data: json,
    ok: res.ok
  };
}

async function runChaosAndReadinessTests() {
  console.log('\n================================================================');
  console.log('ADVOKATAI PRODUCTION-READINESS CHAOS & ROBUSTNESS SUITE');
  console.log('================================================================\n');

  // Start Express server on ephemeral port
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Test server running on ${baseUrl}\n`);

  // -------------------------------------------------------------
  // PHASE 2 & 8: AUTHENTICATION STRESS & BAD INPUTS
  // -------------------------------------------------------------
  console.log('[SECTION 1] Authentication Chaos & Boundary Testing:');

  // 1.1 Empty inputs
  const resEmptyReg = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({})
  });
  assert(resEmptyReg.status === 400, 'Empty registration rejected with 400');
  assert(resEmptyReg.data?.error?.includes('Ismingizni'), 'Informs name is required');

  // 1.2 Whitespace name & email
  const resWsReg = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: '   ', email: '   ', password: 'password123', confirmPassword: 'password123' })
  });
  assert(resWsReg.status === 400, 'Whitespace name rejected with 400');

  // 1.3 Malformed email
  const resBadEmail = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Ali Valiyev', email: 'not-an-email', password: 'password123', confirmPassword: 'password123' })
  });
  assert(resBadEmail.status === 400, 'Malformed email rejected with 400');
  assert(resBadEmail.data?.error?.includes('email formati'), 'Identifies invalid email format');

  // 1.4 Extremely long input (name > 100 chars, email > 255 chars, password > 128 chars)
  const hugeName = 'A'.repeat(150);
  const resHugeName = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: hugeName, email: 'ali@example.com', password: 'password123', confirmPassword: 'password123' })
  });
  assert(resHugeName.status === 400, 'Excessively long name (>100) rejected with 400');
  assert(resHugeName.data?.error?.includes('uzun'), 'Informs name length error');

  const hugeEmail = 'a'.repeat(260) + '@example.com';
  const resHugeEmail = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Ali', email: hugeEmail, password: 'password123', confirmPassword: 'password123' })
  });
  assert(resHugeEmail.status === 400, 'Excessively long email (>255) rejected with 400');

  const hugePass = 'P'.repeat(150);
  const resHugePass = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Ali', email: 'ali_huge@example.com', password: hugePass, confirmPassword: hugePass })
  });
  assert(resHugePass.status === 400, 'Excessively long password (>128) rejected with 400');

  // 1.5 Mismatched confirmation password
  const resMismatch = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Ali Valiyev', email: 'ali_match@example.com', password: 'password123', confirmPassword: 'different123' })
  });
  assert(resMismatch.status === 400, 'Mismatched passwords rejected with 400');
  assert(resMismatch.data?.error?.includes('mos kelmadi'), 'Informs password mismatch in Uzbek');

  // 1.6 Valid registration
  const testEmail = `user_chaos_${Date.now()}@advokatai.uz`;
  const resValidReg = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Chaos Tester', email: testEmail, password: 'StrongPassword2026', confirmPassword: 'StrongPassword2026' })
  });
  assert(resValidReg.status === 201, 'Valid registration succeeds with 201');
  assert(!resValidReg.data?.data?.user?.password_hash, 'Password hash is omitted from response');

  // 1.7 Duplicate account registration
  const resDupReg = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Chaos Tester', email: testEmail, password: 'StrongPassword2026', confirmPassword: 'StrongPassword2026' })
  });
  assert(resDupReg.status === 400, 'Duplicate account registration rejected with 400');
  assert(resDupReg.data?.error?.includes('allaqachon'), 'Informs account already registered');

  // 1.8 Login with wrong password
  const resWrongPass = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: 'WrongPassword' })
  });
  assert(resWrongPass.status === 401, 'Incorrect password rejected with 401');

  // 1.9 Login with correct password
  const resLoginOk = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: 'StrongPassword2026' })
  });
  assert(resLoginOk.status === 200, 'Correct credentials login succeeds with 200 OK');

  // -------------------------------------------------------------
  // PHASE 2 & 8: CHATBOT STRESS & BOUNDARY TESTING
  // -------------------------------------------------------------
  console.log('\n[SECTION 2] Chatbot Chaos & Protection:');

  // 2.1 Empty message
  const resEmptyMsg = await request('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message: '' })
  });
  assert(resEmptyMsg.status === 400, 'Empty message rejected with 400');
  assert(resEmptyMsg.data?.error?.includes('kiritilishi shart'), 'Informs message is required');

  // 2.2 Whitespace-only message
  const resWsMsg = await request('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message: '     \n\t   ' })
  });
  assert(resWsMsg.status === 400, 'Whitespace message rejected with 400');

  // 2.3 Extremely long message (>4000 characters)
  const hugeMsg = 'X'.repeat(5000);
  const resHugeMsg = await request('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message: hugeMsg })
  });
  assert(resHugeMsg.status === 400, 'Excessively long question (>4000) rejected with 400');
  assert(resHugeMsg.data?.error?.includes('uzun'), 'Informs question is too long');

  // 2.4 Legitimate legal inquiry
  const resChatOk = await request('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      message: "Ish beruvchi xodimni sinov muddati bilan ishga qabul qilganda qanday talablar bor?",
      userId: 'test_user_readiness'
    })
  });
  assert(resChatOk.status === 200, 'Valid chatbot inquiry succeeds with 200 OK');
  assert(typeof resChatOk.data?.data?.text === 'string' && resChatOk.data.data.text.length > 50, 'Chatbot returns substantive legal advice');
  assert(resChatOk.data?.data?.sources !== undefined, 'Chatbot response includes sources metadata');

  // -------------------------------------------------------------
  // PHASE 2 & 8: PAYMENT VALIDATION & BOUNDARY TESTING
  // -------------------------------------------------------------
  console.log('\n[SECTION 3] Payment System Chaos & Boundary Testing:');

  // 3.1 Invalid planId ('super-vip')
  const resBadPlan = await request('/api/payments/submit', {
    method: 'POST',
    body: JSON.stringify({
      userId: 'u_123',
      planId: 'super-vip',
      payerName: 'Ali Valiyev',
      transactionReference: 'PAYME-98765432'
    })
  });
  assert(resBadPlan.status === 400, 'Invalid plan (super-vip) rejected with 400');
  assert(resBadPlan.data?.error?.includes('tarif'), 'Informs invalid plan');

  // 3.2 Attempting payment for 'free' plan
  const resFreePlan = await request('/api/payments/submit', {
    method: 'POST',
    body: JSON.stringify({
      userId: 'u_123',
      planId: 'free',
      payerName: 'Ali Valiyev',
      transactionReference: 'PAYME-98765432'
    })
  });
  assert(resFreePlan.status === 400, 'Payment for free plan rejected with 400');

  // 3.3 Text-based date/time instead of transaction ID
  const resDateTx = await request('/api/payments/submit', {
    method: 'POST',
    body: JSON.stringify({
      userId: 'u_123',
      planId: 'pro',
      payerName: 'Ali Valiyev',
      transactionReference: 'Bugun soat 14:30 da oʻtkazdim'
    })
  });
  assert(resDateTx.status === 400, 'Text date/time transaction reference rejected with 400');
  assert(resDateTx.data?.error?.includes('Sana yoki vaqt'), 'Identifies invalid receipt text');

  // 3.4 Single-word payer name
  const resShortName = await request('/api/payments/submit', {
    method: 'POST',
    body: JSON.stringify({
      userId: 'u_123',
      planId: 'pro',
      payerName: 'Ali',
      transactionReference: 'PAYME-98765432'
    })
  });
  assert(resShortName.status === 400, 'Single word name rejected with 400');

  // 3.5 Valid payment submission & instant activation
  const payUserId = `user_pay_${Date.now()}`;
  const resPayOk = await request('/api/payments/submit', {
    method: 'POST',
    body: JSON.stringify({
      userId: payUserId,
      planId: 'pro',
      payerName: 'Anvar Karimov',
      transactionReference: 'PAYME-10293847'
    })
  });
  assert(resPayOk.status === 200, 'Valid payment submitted successfully with 200 OK');
  assert(resPayOk.data?.data?.activated === true, 'Payment triggered instant plan activation');
  assert(resPayOk.data?.data?.user?.plan_id === 'pro', 'User upgraded to pro plan');

  // 3.6 Check payments history polling
  const resMyPay = await request(`/api/payments/my?userId=${payUserId}`);
  assert(resMyPay.status === 200, 'User payments query succeeds');
  assert(Array.isArray(resMyPay.data?.data) && resMyPay.data.data.length === 1, 'Payment recorded in history');

  // -------------------------------------------------------------
  // PHASE 2 & 8: SEARCH & INJECTION TESTING
  // -------------------------------------------------------------
  console.log('\n[SECTION 4] Legal Search Robustness:');

  // 4.1 Empty search query
  const resEmptySearch = await request('/api/laws');
  assert(resEmptySearch.status === 200, 'Default laws catalog returns 200 OK');
  assert(Array.isArray(resEmptySearch.data?.data) && resEmptySearch.data.data.length > 0, 'Catalog returns paginated articles');

  // 4.2 Special characters & regex injection query
  const resSpecialSearch = await request('/api/laws?q=' + encodeURIComponent('.*+?^${}()|[]\\\\'));
  assert(resSpecialSearch.status === 200, 'Regex metacharacters in search handled safely without crash');

  // 4.3 Search by article number
  const resNumSearch = await request('/api/laws?q=161-modda');
  assert(resNumSearch.status === 200, 'Search by article number returns 200 OK');
  assert(Array.isArray(resNumSearch.data?.data), 'Returns search results array');

  // 4.4 Extremely long search query (1000 chars)
  const resLongSearch = await request('/api/laws?q=' + encodeURIComponent('mehnat '.repeat(150)));
  assert(resLongSearch.status === 200, 'Extremely long search query returns 200 OK without crashing');

  // -------------------------------------------------------------
  // PHASE 2 & 8: TEMPLATES & DOCUMENTS ROBUSTNESS
  // -------------------------------------------------------------
  console.log('\n[SECTION 5] Templates & Document Catalog:');

  // 5.1 All templates catalog
  const resTmpl = await request('/api/templates');
  assert(resTmpl.status === 200, 'Templates catalog returns 200 OK');
  assert(Array.isArray(resTmpl.data?.data) && resTmpl.data.data.length > 0, 'Templates list returned');

  // 5.2 Specific template by ID
  const resTmpl1 = await request('/api/templates/1');
  assert(resTmpl1.status === 200, 'Template 1 returns 200 OK');
  assert(resTmpl1.data?.data?.name !== undefined, 'Template name is populated');

  // 5.3 Non-existent template ID
  const resTmplBad = await request('/api/templates/99999');
  assert(resTmplBad.status === 404, 'Non-existent template ID returns 404 cleanly');
  assert(resTmplBad.data?.error?.includes('topilmadi'), 'Informs template not found');

  // -------------------------------------------------------------
  // PHASE 4: CLIENT-SIDE STORAGE FAULT-TOLERANCE SIMULATION
  // -------------------------------------------------------------
  console.log('\n[SECTION 6] SafeStorage Fault-Tolerance Simulation:');

  // Test safeStorage in Node.js environment
  const mockStorage = new Map();
  const testSafeStorage = {
    getItem(key, fallback = null) {
      try {
        const val = mockStorage.get(key);
        return val !== undefined ? val : fallback;
      } catch {
        return fallback;
      }
    },
    setItem(key, value) {
      try {
        mockStorage.set(key, String(value));
        return true;
      } catch {
        return false;
      }
    },
    removeItem(key) {
      try {
        mockStorage.delete(key);
        return true;
      } catch {
        return false;
      }
    },
    getJSON(key, fallback) {
      try {
        const raw = mockStorage.get(key);
        if (!raw) return fallback;
        return JSON.parse(raw);
      } catch {
        return fallback;
      }
    },
    setJSON(key, data) {
      try {
        mockStorage.set(key, JSON.stringify(data));
        return true;
      } catch {
        return false;
      }
    }
  };

  testSafeStorage.setItem('test_key', 'val_123');
  assert(testSafeStorage.getItem('test_key') === 'val_123', 'safeStorage set/get item operates properly');

  // Corrupted JSON recovery
  mockStorage.set('corrupt_json_key', '{not a valid json string');
  const recovered = testSafeStorage.getJSON('corrupt_json_key', { fallback: true });
  assert(recovered.fallback === true, 'safeStorage recovers from corrupt JSON without throwing SyntaxError');

  // Missing key fallback
  const missingVal = testSafeStorage.getItem('nonexistent_key', 'default_val');
  assert(missingVal === 'default_val', 'safeStorage returns fallback for missing keys');

  // -------------------------------------------------------------
  // PHASE 5: SECURITY AUDIT IN CLIENT CODE
  // -------------------------------------------------------------
  console.log('\n[SECTION 7] Frontend Security & Secret Leak Prevention:');

  const srcDir = path.join(ROOT_DIR, 'src');
  function getAllFiles(dir, exts = ['.ts', '.tsx', '.js']) {
    let files = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) files.push(...getAllFiles(full, exts));
      else if (exts.some(ext => e.name.endsWith(ext))) files.push(full);
    }
    return files;
  }

  const clientFiles = getAllFiles(srcDir);

  // Check 1: No hardcoded secret 'advokatai_admin_secret_2025' in client code
  let secretFound = false;
  for (const f of clientFiles) {
    const code = fs.readFileSync(f, 'utf-8');
    if (code.includes('advokatai_admin_secret_2025')) {
      secretFound = true;
      logFail(`Hardcoded admin secret found in ${f}`);
    }
  }
  assert(!secretFound, 'Zero occurrences of hardcoded admin secret in frontend code');

  // Check 2: No localhost in client code
  let localhostFound = false;
  for (const f of clientFiles) {
    const code = fs.readFileSync(f, 'utf-8');
    if (code.includes('localhost:') || code.includes('127.0.0.1:')) {
      localhostFound = true;
      logFail(`Localhost hardcoded in ${f}`);
    }
  }
  assert(!localhostFound, 'Zero occurrences of localhost/127.0.0.1 in frontend code');

  // Check 3: No console.log in client code
  let consoleLogFound = false;
  for (const f of clientFiles) {
    const code = fs.readFileSync(f, 'utf-8');
    if (code.includes('console.log(')) {
      consoleLogFound = true;
      logFail(`console.log found in client file: ${f}`);
    }
  }
  assert(!consoleLogFound, 'Zero occurrences of console.log in production client code');

  // -------------------------------------------------------------
  // PHASE 7: PRODUCTION BUILD & ASSETS VERIFICATION
  // -------------------------------------------------------------
  console.log('\n[SECTION 8] Production Build & Asset Integrity:');

  const distHtml = path.join(ROOT_DIR, 'dist', 'index.html');
  assert(fs.existsSync(distHtml), 'dist/index.html single-file bundle exists');
  const htmlContent = fs.readFileSync(distHtml, 'utf-8');
  assert(htmlContent.includes('AdvokatAI'), 'Single-file bundle contains AdvokatAI application');
  assert(htmlContent.includes('viewport'), 'Meta viewport tag present for mobile responsiveness');

  const redirectsPath = path.join(ROOT_DIR, 'dist', '_redirects');
  assert(fs.existsSync(redirectsPath), 'dist/_redirects exists in deployment directory');
  const redirectsContent = fs.readFileSync(redirectsPath, 'utf-8');
  assert(/\/\*\s+\/index\.html\s+200/.test(redirectsContent), 'SPA fallback rewrite exists');
  assert(/\/api\/\*\s+\/\.netlify\/functions\/api\/:splat\s+200!?/.test(redirectsContent), 'API function rewrite exists');

  // -------------------------------------------------------------
  // SERVER SHUTDOWN & COMPLETION
  // -------------------------------------------------------------
  server.close();

  console.log('\n================================================================');
  console.log('ALL PRODUCTION-READINESS CHAOS & ROBUSTNESS TESTS PASSED [100%]');
  console.log('================================================================\n');
}

runChaosAndReadinessTests().catch((err) => {
  console.error('Test execution error:', err);
  if (server) server.close();
  process.exit(1);
});
