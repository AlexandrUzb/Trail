import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { queryUnderstandingService } from '../services/queryUnderstandingService.js';
import { generateLegalAdvice } from '../services/aiService.js';
import { legalValidatorService } from '../services/legalValidatorService.js';

console.log('=== ADVOKATAI: USER ROLE IDENTIFICATION & WAGE REASONING SUITE ===\n');

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
    failed++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
    failed++;
  }
}

// ============================================================================
// TEST 1: Bare Unpaid Salary Clarification & Role Identification (Section 1, 14, 25)
// Query: "Ish beruvchi ish haqini to'lamayapti"
// Expected: Returns 0 citations, flags needs_clarification: true, verifies employee role & asks period/due date
// ============================================================================
runTest('Test 1: Bare wage query "Ish beruvchi ish haqini to\'lamayapti" clarifies role and missing facts', () => {
  const query = "Ish beruvchi ish haqini to'lamayapti";
  const intent = queryUnderstandingService.classifyIntent(query, []);

  assert.strictEqual(intent.needsClarification, true, 'Must need clarification');
  assert.strictEqual(intent.requiresRetrieval, false, 'Must NOT emit premature citations');

  const text = intent.directResponse;
  assert.ok(text.includes('Siz xodim sifatida ish haqingizni ololmayapsizmi?'), 'Must verify employee role');
  assert.ok(text.includes('ish haqi qaysi davr uchun to‘lanmagan'), 'Must ask unpaid period');
  assert.ok(text.includes('to‘lov qachon amalga oshirilishi kerak edi?'), 'Must ask due date');
});

// ============================================================================
// TEST 2: Role Extraction & Perspective Preservation (Section 1 & Section 2)
// Does NOT invert parties or confuse counterparty mentions with user role!
// ============================================================================
runTest('Test 2: Perspective preservation accurately extracts userRole without party reversal', () => {
  // Employee complaining about employer
  const s1 = queryUnderstandingService.analyzeScenario("Ish beruvchi ish haqini to'lamayapti", {});
  assert.strictEqual(s1.userRole, 'employee', 'User complaining about employer must be employee, NOT employer');

  // Landlord complaining about tenant
  const s2 = queryUnderstandingService.analyzeScenario("Ijarachim kvartira ijara haqini to'lamayapti", {});
  assert.strictEqual(s2.userRole, 'landlord', 'User complaining about tenant must be landlord, NOT tenant');

  // Tenant complaining about landlord
  const s3 = queryUnderstandingService.analyzeScenario("Uy egasi depozitimni qaytarmayapti", {});
  assert.strictEqual(s3.userRole, 'tenant', 'User complaining about landlord must be tenant, NOT landlord');

  // Creditor complaining about debtor
  const s4 = queryUnderstandingService.analyzeScenario("Qarzdor pulimni qaytarmayapti", {});
  assert.strictEqual(s4.userRole, 'creditor', 'User complaining about debtor must be creditor, NOT debtor');

  // Explicit employer
  const s5 = queryUnderstandingService.analyzeScenario("Men ish beruvchiman, xodimlarimga oylik to'lash tartibi qanday?", {});
  assert.strictEqual(s5.userRole, 'employer', 'Explicit employer must be employer');
});

// ============================================================================
// TEST 3: Substantive Unpaid Wage Response Structure (Section 4, 10, 16, 26)
// Provides full 7-section structure, separates MK 253 from MK 333,
// recommends Mehnat inspeksiyasi (1176) and Civil Court with MK 559 fee exemption.
// ============================================================================
await runAsyncTest('Test 3: Substantive wage advice provides 7 sections, separates MK 253/333, and ZERO employer advice', async () => {
  const query = "Menga 2 oydan beri ish haqim to'lanmayapti, rasmiy mehnat shartnomam bor, qayerga murojaat qilay va qanday undirib olsam bo'ladi?";
  const res = await generateLegalAdvice({
    message: query,
    history: [],
    userId: 'test_user_wages_substantive'
  });

  assert.strictEqual(res.needs_clarification, false, 'Must provide complete advice when facts are present');
  assert.ok(res.text, 'Must return response text');

  // Check Section 16 headers
  assert.ok(res.text.includes('### Sizning holatingiz'), 'Must have ### Sizning holatingiz');
  assert.ok(res.text.includes('### Amaldagi huquqiy qoida'), 'Must have ### Amaldagi huquqiy qoida');
  assert.ok(res.text.includes('### Sizning holatingizga tatbiqi'), 'Must have ### Sizning holatingizga tatbiqi');
  assert.ok(res.text.includes('### Sizning huquqingiz / majburiyatingiz'), 'Must have ### Sizning huquqingiz / majburiyatingiz');
  assert.ok(res.text.includes('### Nima qilish mumkin'), 'Must have ### Nima qilish mumkin');
  assert.ok(res.text.includes('### Kerakli hujjatlar'), 'Must have ### Kerakli hujjatlar');
  assert.ok(res.text.includes('### Huquqiy asos'), 'Must have ### Huquqiy asos');

  // Verify separation of payment timing (253) and delay compensation (333)
  assert.ok(res.text.includes('253-modda') || res.text.includes('253'), 'Must cite MK 253');
  assert.ok(res.text.includes('333-modda') || res.text.includes('333'), 'Must cite MK 333');

  // Verify authorities & court fee exemption (MK 559)
  assert.ok(res.text.includes('Davlat mehnat inspeksiyasi') || res.text.includes('1176'), 'Must cite Labor Inspectorate with hotline 1176');
  assert.ok(res.text.includes('Fuqarolik ishlari bo‘yicha tumanlararo sud'), 'Must cite Civil Court');
  assert.ok(res.text.includes('559-modda') || res.text.includes('davlat bojidan ozod'), 'Must explain court fee exemption under MK 559');

  // Zero employer-side advice given to employee (Section 9)
  assert.ok(!res.text.includes('Moliyaviy hujjatlarni tartibga keltiring'), 'Must NEVER give accounting instructions to employee');
});

// ============================================================================
// TEST 4: Employer Advice Sanitizer Guard (Section 9)
// Synthetic injection of employer accounting advice into employee response must be sanitized
// ============================================================================
runTest('Test 4: cleanEmployerAdviceToEmployee strips employer accounting instructions from employee response', () => {
  const contaminated = "Ish beruvchi sifatida moliyaviy hujjatlarni tartibga keltiring va to‘lovlarni amalga oshiring.";
  const scenario = { userRole: 'employee', domain: 'labor' };
  const sanitized = legalValidatorService.cleanEmployerAdviceToEmployee(contaminated, scenario, "ish haqim to'lanmayapti");

  assert.ok(!sanitized.includes('moliyaviy hujjatlarni tartibga keltiring'), 'Must sanitize employer accounting instructions');
  assert.ok(sanitized.includes('talab qiling'), 'Must redirect to employee demand');
});

// ============================================================================
// TEST 5: Project Founder Photo Verification
// Verifies that public/zafar_zokirov.jpg and dist/zafar_zokirov.jpg exist and have updated size
// ============================================================================
runTest('Test 5: Founder photo in public and dist is updated with uploaded photo', () => {
  const publicPath = path.resolve('public/zafar_zokirov.jpg');
  const distPath = path.resolve('dist/zafar_zokirov.jpg');

  assert.ok(fs.existsSync(publicPath), 'public/zafar_zokirov.jpg must exist');
  assert.ok(fs.existsSync(distPath), 'dist/zafar_zokirov.jpg must exist');

  const publicStat = fs.statSync(publicPath);
  const distStat = fs.statSync(distPath);

  assert.strictEqual(publicStat.size, 222109, 'public/zafar_zokirov.jpg must match uploaded photo size');
  assert.strictEqual(distStat.size, 222109, 'dist/zafar_zokirov.jpg must match uploaded photo size');
});

console.log(`\nAll Tests Finished: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL USER ROLE & WAGE REASONING TESTS PASSED!');
}
