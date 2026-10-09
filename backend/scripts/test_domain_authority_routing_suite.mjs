import assert from 'assert';
import { queryUnderstandingService } from '../services/queryUnderstandingService.js';
import { generateLegalAdvice } from '../services/aiService.js';
import { legalValidatorService } from '../services/legalValidatorService.js';
import { isAuthorityAllowedForDomain } from '../data/officialInstitutions.js';

console.log('=== ADVOKATAI: LEGAL DOMAIN ROUTING & AUTHORITY MATCHING TEST SUITE ===\n');

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
// TEST 1: Broad Rental Topic "Ijara huquqlari va kvartira nizosi" (Section 21 & Section 3)
// Must clarify with Section 21 prompt, 0 citations, needsClarification: true
// ============================================================================
runTest('Test 1: Broad rental topic "Ijara huquqlari va kvartira nizosi" returns Section 21 clarification', () => {
  const query = "Ijara huquqlari va kvartira nizosi";
  const intent = queryUnderstandingService.classifyIntent(query, []);

  assert.strictEqual(intent.needsClarification, true, 'Must need clarification');
  assert.strictEqual(intent.requiresRetrieval, false, 'Must NOT retrieve citations');

  const text = intent.directResponse;
  assert.ok(text.includes('Kvartira ijarasi bo‘yicha aynan qaysi muammo yuzaga kelgan'), 'Must ask rental issue question');
  assert.ok(text.includes('ijara haqini undirish'), 'Must include ijara haqini undirish');
  assert.ok(text.includes('depozitni qaytarish'), 'Must include depozitni qaytarish');
  assert.ok(text.includes('shartnomani bekor qilish'), 'Must include shartnomani bekor qilish');
  assert.ok(text.includes('uy-joydan chiqarish'), 'Must include uy-joydan chiqarish');
  assert.ok(text.includes('ta’mirlash yoki yetkazilgan zarar'), 'Must include ta’mirlash yoki yetkazilgan zarar');
});

// ============================================================================
// TEST 2: Multi-Turn Rental Follow-Up (Section 3 & Section 22)
// User: "Ijara huquqlari va kvartira nizosi" -> AI clarifies
// User: "Shartnomani bekor qilish" -> AI asks the 3 material fact questions
// ============================================================================
runTest('Test 2: Multi-turn "Shartnomani bekor qilish" asks Section 22 material fact questions', () => {
  const history = [
    { sender: 'user', text: "Ijara huquqlari va kvartira nizosi" },
    { sender: 'ai', text: "Albatta. Kvartira ijarasi bo‘yicha aynan qaysi muammo yuzaga kelgan: ijara haqini undirish, depozitni qaytarish, shartnomani bekor qilish, uy-joydan chiqarish, ta’mirlash yoki yetkazilgan zarar?" }
  ];
  const query = "Shartnomani bekor qilish";
  const intent = queryUnderstandingService.classifyIntent(query, history);

  assert.strictEqual(intent.needsClarification, true, 'Must need clarification on contract terms and roles');
  assert.strictEqual(intent.requiresRetrieval, false, 'Must NOT emit premature citations');

  const text = intent.directResponse;
  assert.ok(text.includes('Shartnomani bekor qilish tartibi kim bekor qilmoqchi ekaniga va shartnoma shartlariga bog‘liq'), 'Explains dependency');
  assert.ok(text.includes('Siz ijarachimisiz yoki ijaraga beruvchimisiz?'), 'Asks tenant vs landlord role');
  assert.ok(text.includes('Shartnoma yozma shakldami va muddatidan oldin bekor qilish sharti unda ko‘rsatilganmi?'), 'Asks written contract and early termination clause');
});

// ============================================================================
// TEST 3: Single-Turn "Ijara shartnomasini bekor qilish" without facts (Section 3 & 22)
// Must ask the same 3 material questions instead of dumping generic paragraphs
// ============================================================================
runTest('Test 3: Single-turn "Ijara shartnomasini bekor qilish" asks material facts without citations', () => {
  const query = "Ijara shartnomasini bekor qilish";
  const intent = queryUnderstandingService.classifyIntent(query, []);

  assert.strictEqual(intent.needsClarification, true, 'Must need clarification');
  assert.strictEqual(intent.requiresRetrieval, false, 'Must not retrieve citations');

  const text = intent.directResponse;
  assert.ok(text.includes('Siz ijarachimisiz yoki ijaraga beruvchimisiz?'), 'Asks role');
  assert.ok(text.includes('muddatidan oldin bekor qilish sharti unda ko‘rsatilganmi?'), 'Asks contract clause');
});

// ============================================================================
// TEST 4: Substantive Rental Termination with Complete Facts (Section 2, 4, 7, 23)
// Must provide contract-first legal analysis, cite FK 615, recommend civil court,
// and CRITICALLY: ZERO mention of Labor Inspectorate (1176)!
// ============================================================================
await runAsyncTest('Test 4: Substantive rental termination provides contract-first analysis and ZERO labor authority', async () => {
  const query = "Men ijarachiman, yozma ijara shartnomamiz bor, muddatidan oldin chiqmoqchiman, shartnomamizda 1 oy oldin ogohlantirish yozilgan, uy egasi rozi bo'lmayapti, nima qilishim kerak?";
  const res = await generateLegalAdvice({
    message: query,
    history: [],
    userId: 'test_user_tenancy_full'
  });

  assert.strictEqual(res.needs_clarification, false, 'Must not need clarification when facts are complete');
  assert.ok(res.text, 'Must provide answer');

  // Verify contract-first and legal rule
  assert.ok(res.text.includes('Fuqarolik kodeksi') || res.text.includes('shartnoma'), 'Must mention contract and Civil Code');
  assert.ok(res.text.includes('615-modda') || res.text.includes('551-modda') || res.text.includes('615'), 'Must cite relevant Civil Code article');

  // Verify Civil Court venue
  assert.ok(res.text.includes('Fuqarolik ishlari bo‘yicha tumanlararo sud'), 'Must identify Civil Interdistrict Court');

  // CRITICAL RULE: A labor authority must NOT be recommended for a rental dispute!
  assert.ok(!res.text.includes('Mehnat inspeksiyasi'), 'Must NEVER mention Mehnat inspeksiyasi for rental dispute');
  assert.ok(!res.text.includes('1176'), 'Must NEVER mention 1176 for rental dispute');
  assert.ok(!res.text.includes('dmi.mehnat.uz'), 'Must NEVER mention dmi.mehnat.uz for rental dispute');
});

// ============================================================================
// TEST 5: Domain-Authority Cross-Contamination Guard
// Synthetic injection of 1176 into rental text must be stripped by legalValidatorService
// ============================================================================
runTest('Test 5: Domain-Authority Cross-Contamination Guard strips labor authority from rental text', () => {
  const contaminatedText = `### Sizning holatingiz
Kvartira ijarasi bo‘yicha nizo mavjud.

### Qayerga murojaat qilish
Davlat mehnat inspeksiyasi (Ishonch telefoni: 1176)
Fuqarolik ishlari bo‘yicha tumanlararo sud`;

  const scenario = {
    domain: 'civil',
    fineGrainedTopic: 'tenancy_cancellation',
    disputeType: 'tenancy_cancellation'
  };

  const sanitized = legalValidatorService.cleanDomainAuthorityMismatch(contaminatedText, scenario, "ijara shartnomasini bekor qilish");
  assert.ok(!sanitized.includes('Mehnat inspeksiyasi'), 'Must strip Mehnat inspeksiyasi');
  assert.ok(!sanitized.includes('1176'), 'Must strip 1176');
  assert.ok(sanitized.includes('Fuqarolik ishlari bo‘yicha tumanlararo sud'), 'Must keep civil court venue');
});

// ============================================================================
// TEST 6: Broad Corruption Topic "Pora va korrupsiya" (Section 21)
// Must return Section 21 prompt, 0 citations, needsClarification: true
// ============================================================================
runTest('Test 6: Broad corruption topic "Pora va korrupsiya" returns Section 21 clarification', () => {
  const query = "Pora va korrupsiya";
  const intent = queryUnderstandingService.classifyIntent(query, []);

  assert.strictEqual(intent.needsClarification, true, 'Must need clarification');
  assert.strictEqual(intent.requiresRetrieval, false, 'Must NOT retrieve citations');

  const text = intent.directResponse;
  assert.ok(text.includes('Pora yoki korrupsiya masalasida aynan nima sodir bo‘lganini aniqlasak'), 'Must ask Section 21 question');
  assert.ok(text.includes('Sizdan pul/manfaat talab qilinganmi, kim talab qilgan va evaziga nima so‘ralgan?'), 'Must ask 3 core facts');
});

// ============================================================================
// TEST 7: Authority Domain Matching Validator Function
// isAuthorityAllowedForDomain enforces domain boundaries structurally
// ============================================================================
runTest('Test 7: isAuthorityAllowedForDomain enforces structural domain boundaries', () => {
  assert.strictEqual(isAuthorityAllowedForDomain('labor_inspectorate', 'civil'), false, 'Labor inspectorate forbidden for civil');
  assert.strictEqual(isAuthorityAllowedForDomain('labor_inspectorate', 'tenancy'), false, 'Labor inspectorate forbidden for tenancy');
  assert.strictEqual(isAuthorityAllowedForDomain('labor_inspectorate', 'labor'), true, 'Labor inspectorate allowed for labor');
  assert.strictEqual(isAuthorityAllowedForDomain('consumer_protection', 'consumer'), true, 'Consumer protection allowed for consumer');
  assert.strictEqual(isAuthorityAllowedForDomain('civil_court', 'civil'), true, 'Civil court allowed for civil');
});

// ============================================================================
// TEST 8: Labor Dispute Query Correctly Recommends Labor Authorities
// Ensures labor disputes still appropriately recommend Labor Inspectorate (1176)
// ============================================================================
await runAsyncTest('Test 8: Labor dispute query appropriately recommends labor authority (1176)', async () => {
  const query = "Meni roziligimsiz boshqa doimiy lavozimga o'tkazish haqida buyruq chiqarishdi, nima qilsam bo'ladi?";
  const res = await generateLegalAdvice({
    message: query,
    history: [],
    userId: 'test_user_labor_auth'
  });

  assert.strictEqual(res.needs_clarification, false, 'Must provide answer');
  assert.ok(res.text.includes('Davlat mehnat inspeksiyasi') || res.text.includes('1176'), 'Labor dispute must recommend labor authority');
  assert.ok(res.text.includes('Fuqarolik ishlari bo‘yicha tumanlararo sud'), 'Labor dispute must recommend civil court');
});

console.log(`\nAll Tests Finished: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL LEGAL DOMAIN ROUTING & AUTHORITY MATCHING TESTS PASSED!\n');
}
