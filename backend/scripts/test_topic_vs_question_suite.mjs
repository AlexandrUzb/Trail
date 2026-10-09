import assert from 'assert';
import { generateLegalAdvice } from '../services/aiService.js';
import { queryUnderstandingService } from '../services/queryUnderstandingService.js';
import { legalValidatorService } from '../services/legalValidatorService.js';

console.log('=== ADVOKATAI: TOPIC VS QUESTION & FACT-FIRST ENGINE TEST SUITE ===\n');

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
// TEST 1: Topic "Mehnat shartnomasi bo'yicha savol" (Section 1 & 24)
// Must return exact 8 options, 0 citations, needsClarification: true
// ============================================================================
runTest('Test 1: Topic "Mehnat shartnomasi bo\'yicha savol" disambiguates with 8 options and 0 citations', () => {
  const query = "Mehnat shartnomasi bo'yicha savol";
  const intent = queryUnderstandingService.classifyIntent(query, []);

  assert.strictEqual(intent.needsClarification, true, 'Must need clarification');
  assert.strictEqual(intent.requiresRetrieval, false, 'Must NOT retrieve citations for broad topic');

  const text = intent.directResponse;
  assert.ok(text.includes('shartnoma tuzish'), 'Option 1: shartnoma tuzish');
  assert.ok(text.includes('ish haqi'), 'Option 2: ish haqi');
  assert.ok(text.includes('qo‘shimcha ish'), 'Option 3: qo‘shimcha ish');
  assert.ok(text.includes('boshqa ishga o‘tkazish') || text.includes('boshqa lavozimga o‘tkazish'), 'Option 4: boshqa ishga o‘tkazish');
  assert.ok(text.includes('shartnomani o‘zgartirish'), 'Option 5: shartnomani o‘zgartirish');
  assert.ok(text.includes('ishdan bo‘shatish'), 'Option 6: ishdan bo‘shatish');
  assert.ok(text.includes('ta’til'), 'Option 7: ta’til');
  assert.ok(text.includes('boshqa masala'), 'Option 8: boshqa masala');

  // Must not cite any articles
  assert.ok(!text.includes('modda'), 'Must not cite articles for broad topic');
});

// ============================================================================
// TEST 2: Broad Topic "Pora so'rashdi" (Section 27)
// Must return exact 3 targeted questions, 0 citations, needsClarification: true
// ============================================================================
runTest('Test 2: "Pora so\'rashdi" returns 3 specific questions and 0 citations', () => {
  const query = "Pora so'rashdi";
  const intent = queryUnderstandingService.classifyIntent(query, []);

  assert.strictEqual(intent.needsClarification, true, 'Must need clarification');
  assert.strictEqual(intent.requiresRetrieval, false, 'Must NOT retrieve citations');

  const text = intent.directResponse;
  assert.ok(text.includes('Pulni kim so‘radi va uning lavozimi yoki vazifasi nima?'), 'Question 1: who asked and office');
  assert.ok(text.includes('Evaziga sizdan qanday harakat qilish yoki qilmaslik so‘ralgan?'), 'Question 2: what was expected in return');
  assert.ok(text.includes('Pul amalda berildimi yoki faqat talab qilindimi?'), 'Question 3: money given vs solicited');
});

// ============================================================================
// TEST 3: Broad Topic "Qarz masalasi" (Section 1)
// Must clarify debt, 0 citations, NEVER cite Article 535 (property lease)
// ============================================================================
runTest('Test 3: "Qarz masalasi" clarifies debt options and never cites Article 535', () => {
  const query = "Qarz masalasi";
  const intent = queryUnderstandingService.classifyIntent(query, []);

  assert.strictEqual(intent.needsClarification, true, 'Must need clarification');
  assert.strictEqual(intent.requiresRetrieval, false, 'Must NOT retrieve citations');

  const text = intent.directResponse;
  assert.ok(text.includes('tilxat') || text.includes('qarz'), 'Must focus on debt options');
  assert.ok(!text.includes('535'), 'Must never mention Article 535 (lease)');
});

// ============================================================================
// TEST 4: Single-Turn Labor Transfer Missing Facts (Section 25)
// "Ish beruvchi meni roziligimsiz boshqa lavozimga o'tkazishi mumkinmi?"
// Must ask: vaqtinchalikmi yoki doimiymi, yozma buyruq berilganmi
// ============================================================================
runTest('Test 4: "Ish beruvchi meni roziligimsiz boshqa lavozimga o\'tkazishi mumkinmi?" asks missing facts', () => {
  const query = "Ish beruvchi meni roziligimsiz boshqa lavozimga o'tkazishi mumkinmi?";
  const intent = queryUnderstandingService.classifyIntent(query, []);

  assert.strictEqual(intent.needsClarification, true, 'Must need clarification on missing material facts');
  assert.strictEqual(intent.requiresRetrieval, false, 'Must not retrieve premature citation');

  const text = intent.directResponse;
  assert.ok(text.includes('vaqtinchalik') && text.includes('doimiy'), 'Must ask temporary vs permanent');
  assert.ok(text.includes('buyruq') || text.includes('yozma hujjat'), 'Must ask about written order or document');
});

// ============================================================================
// TEST 5: Multi-Turn Labor Transfer Follow-up (Section 3)
// Turn 1: "Mehnat shartnomasi bo'yicha savol" -> AI clarifies
// Turn 2: "Meni boshqa lavozimga o'tkazishdi" -> Must ask consent & written order
// ============================================================================
runTest('Test 5: Multi-turn "Meni boshqa lavozimga o\'tkazishdi" asks consent and written order', () => {
  const history = [
    { sender: 'user', text: "Mehnat shartnomasi bo'yicha savol" },
    { sender: 'ai', text: "Albatta. Mehnat shartnomasi bo‘yicha aynan qaysi masala sizni qiziqtiryapti? Masalan:\n— boshqa ishga o‘tkazish..." }
  ];
  const query = "Meni boshqa lavozimga o'tkazishdi";
  const intent = queryUnderstandingService.classifyIntent(query, history);

  assert.strictEqual(intent.needsClarification, true, 'Must need clarification on consent');
  assert.strictEqual(intent.requiresRetrieval, false, 'Must not retrieve premature citation');

  const text = intent.directResponse;
  assert.ok(text.includes('roziligingiz bilan bo‘ldimi') || text.includes('bir tomonlama'), 'Must ask if consent was given');
  assert.ok(text.includes('yozma buyruq') || text.includes('kelishuv'), 'Must ask if written order or agreement exists');
});

// ============================================================================
// TEST 6: Substantive Transfer Answer when Facts are Present (Section 5, 9, 23)
// Full facts: roziligimsiz, doimiy, buyruq chiqarishdi
// Must use Section 23 structure:
// ### Sizning holatingiz
// ### Huquqiy qoida
// ### Sizning holatingizga tatbiqi
// ### Nima qilish kerak
// ### Huquqiy asos
// Cites MK 138. Does NOT cite MK 116 (qo'shimcha ish)!
// ============================================================================
await runAsyncTest('Test 6: Substantive transfer answer with full facts uses Section 23 format and cites MK 138', async () => {
  const query = "Meni roziligimsiz boshqa doimiy lavozimga o'tkazish haqida buyruq chiqarishdi, nima qilsam bo'ladi?";
  const res = await generateLegalAdvice({
    message: query,
    history: [],
    userId: 'test_user_section23'
  });

  assert.strictEqual(res.needs_clarification, false, 'Must not need clarification when facts are complete');
  assert.ok(res.text, 'Must provide full legal answer');

  // Verify Section 23 structure
  assert.ok(res.text.includes('### Sizning holatingiz'), 'Must have ### Sizning holatingiz');
  assert.ok(res.text.includes('### Huquqiy qoida') || res.text.includes('### Amaldagi qoida'), 'Must have legal rule heading');
  assert.ok(res.text.includes('### Sizning holatingizga tatbiqi') || res.text.includes('### Sizga taalluqli tartib'), 'Must have application heading');
  assert.ok(res.text.includes('### Nima qilish kerak') || res.text.includes('### Keyingi qadam'), 'Must have next steps heading');
  assert.ok(res.text.includes('### Huquqiy asos'), 'Must have ### Huquqiy asos');

  // Verify accurate citation of MK 138
  assert.ok(res.text.includes('138-modda') || res.text.includes('138'), 'Must cite Article 138');
  assert.ok(res.text.includes('Mehnat kodeksi'), 'Must cite Mehnat kodeksi');

  // Verify forbidden MK 116 is NOT cited
  assert.ok(!res.text.includes('116-modda'), 'Forbidden Article 116 must NOT be cited for transfer dispute');
});

// ============================================================================
// TEST 7: Explaining What Fact Changes the Result (Section 10)
// Must explain conditional dependency on consent and temporary/permanent status
// ============================================================================
await runAsyncTest('Test 7: Substantive response explicitly explains what fact changes the result (Section 10)', async () => {
  const query = "Meni roziligimsiz boshqa doimiy lavozimga o'tkazish haqida buyruq chiqarishdi, nima qilsam bo'ladi?";
  const res = await generateLegalAdvice({
    message: query,
    history: [],
    userId: 'test_user_section10'
  });

  const hasDecisiveFactExplanation = res.text.includes('roziligingiz olingan-olinmaganiga bog‘liq') || 
                                      res.text.includes('rozilik') || 
                                      res.text.includes('bog‘liq');
  assert.ok(hasDecisiveFactExplanation, 'Must explain what fact changes the result');
});

// ============================================================================
// TEST 8: Section 4 Multi-Issue Cleaner
// Synthetic lists like "Qo‘shimcha ish, sog‘liq bo‘yicha..." must be cleaned
// ============================================================================
runTest('Test 8: Section 4 multi-issue cleaner removes unrelated synthetic listings', () => {
  const dirtyText = `### Huquqiy qoida
Xodimni boshqa ishga o‘tkazish masalasi:
- Qo‘shimcha ish, kasblarni birga olib borish;
- Sog‘liq holatiga ko‘ra boshqa ishga o‘tkazish;
- Ish beruvchining tashabbusi bilan boshqa ishga o‘tkazish.
Ushbu qoidalar qo‘llanadi.`;

  const scenario = {
    domain: 'labor',
    fineGrainedTopic: 'labor_transfer',
    disputeType: 'labor_transfer'
  };

  const cleaned = legalValidatorService.cleanMultiIssueListing(dirtyText, scenario, "Meni boshqa lavozimga o'tkazishdi");
  assert.ok(!cleaned.includes('Qo‘shimcha ish, kasblarni birga olib borish;'), 'Unrelated additional work bullet must be removed');
  assert.ok(!cleaned.includes('Sog‘liq holatiga ko‘ra'), 'Unrelated health bullet must be removed when not mentioned');
});

console.log(`\nAll Tests Finished: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('ALL TOPIC VS QUESTION TESTS PASSED!\n');
}
