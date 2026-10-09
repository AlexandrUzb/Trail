/**
 * AdvokatAI 25-Rule Comprehensive Test Suite
 * 
 * Verifies:
 * 1. Rule 1 & Rule 21: Administrative Fine Flow - asks issuing authority & receipt date; no premature citation.
 * 2. Rule 2: Contextual option numbers (e.g. "4" or "4-band") in multi-turn conversation.
 * 3. Rule 9: High-risk deadlines - "Muddatni aniq hisoblash uchun qaror nusxasi sizga qachon topshirilganini bilish kerak."
 * 4. Rule 16: Standard 8-section response structure (### Sizning holatingiz, ### Amaldagi qoida, ### Sizga taalluqli tartib, ### Muddat, ### Qayerga murojaat qilish, ### Kerakli hujjatlar, ### Keyingi qadam, ### Huquqiy asos).
 * 5. Rule 19: Drafting mode placeholders ([F.I.Sh.], [Manzil], [Sud nomi]).
 * 6. Google Auth: storageService.findOrCreateGoogleUser handles user creation and persistence.
 */

import { generateLegalAdvice } from '../services/aiService.js';
import { queryUnderstandingService } from '../services/queryUnderstandingService.js';
import { legalValidatorService } from '../services/legalValidatorService.js';
import { storageService } from '../services/storageService.js';

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

async function run25RulesSuite() {
  console.log('================================================================');
  console.log('ADVOKATAI 25-RULE LEGAL ENGINE & GOOGLE AUTH TEST SUITE');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // TEST 1: Rule 1 & Rule 21 - Administrative Fine Initial Flow
  // -------------------------------------------------------------
  console.log('[TEST 1] Rule 1 & Rule 21: Administrative Fine Initial Flow:');
  const fineInitialRes = await generateLegalAdvice({
    message: 'Ma’muriy jarimadan shikoyat qilish',
    userId: 'test-user-25',
    history: []
  });

  assert(
    fineInitialRes.needs_clarification === true,
    'Administrative fine query flags needs_clarification: true'
  );
  assert(
    fineInitialRes.citations.length === 0,
    'Administrative fine query returns 0 premature citations'
  );
  assert(
    fineInitialRes.text.includes('qarorni kim chiqarganiga') &&
    fineInitialRes.text.includes('qaror nusxasini qachon olgansiz'),
    'Administrative fine query asks issuing authority and receipt date per Rule 21'
  );

  // -------------------------------------------------------------
  // TEST 2: Rule 2 - Contextual Option Number ("4" / "4-band")
  // -------------------------------------------------------------
  console.log('\n[TEST 2] Rule 2: Contextual Option Number Handling ("4"):');
  const adminHistory = [
    { sender: 'user', text: 'Ma’muriy jarimadan shikoyat qilish' },
    { sender: 'ai', text: fineInitialRes.text }
  ];

  const option4Res = await generateLegalAdvice({
    message: '4',
    userId: 'test-user-25',
    history: adminHistory
  });

  assert(
    option4Res.needs_clarification === true,
    'Option "4" flags needs_clarification: true'
  );
  assert(
    option4Res.text.includes('4-bandni tanlaganingizni tushundim') &&
    option4Res.text.includes('qarorni chiqargan organ') &&
    option4Res.text.includes('MJtK moddasi') &&
    option4Res.text.includes('Shaxsiy ma’lumotlarni yashirishingiz mumkin'),
    'Option "4" provides contextual guidance requesting 4 key document fields with redaction note'
  );

  // -------------------------------------------------------------
  // TEST 3: Rule 9 - Incomplete Deadline Safety
  // -------------------------------------------------------------
  console.log('\n[TEST 3] Rule 9: Incomplete Deadline Safety Phrase:');
  const sanitizedDeadline = legalValidatorService.cleanPrematureDeadlines(
    'Siz muddatni o‘tkazib yuborgansiz va sud arizangizni qabul qilmaydi.',
    { cleanQuery: 'Jarimadan noroziman' },
    'Jarimadan noroziman'
  );

  assert(
    sanitizedDeadline.includes('Muddatni aniq hisoblash uchun qaror nusxasi sizga qachon topshirilganini bilish kerak.'),
    'Replaces premature expiry with exact Rule 9 phrase'
  );

  // -------------------------------------------------------------
  // TEST 4: Rule 16 - Standard 8-Section Substantive Response
  // -------------------------------------------------------------
  console.log('\n[TEST 4] Rule 16: Standard 8-Section Response Structure:');
  const laborHistory = [
    { sender: 'user', text: 'Shikoyat ariza yozish tartibi' },
    { sender: 'ai', text: 'Qaysi masala bo‘yicha shikoyat qilmoqchisiz?' },
    { sender: 'user', text: 'sudga' },
    { sender: 'ai', text: 'Nizo qaysi masalaga oid?' },
    { sender: 'user', text: 'mehnat nizosi' },
    { sender: 'ai', text: 'Komissiyaga murojaat qilganmisiz?' }
  ];

  const substantiveRes = await generateLegalAdvice({
    message: 'Komissiya qaror chiqargan, 3 kun bo‘ldi nusxasini olganimga',
    userId: 'test-user-25',
    history: laborHistory
  });

  const body = substantiveRes.text;
  assert(body.includes('### Sizning holatingiz'), 'Contains "### Sizning holatingiz"');
  assert(body.includes('### Amaldagi qoida'), 'Contains "### Amaldagi qoida"');
  assert(body.includes('### Sizga taalluqli tartib'), 'Contains "### Sizga taalluqli tartib"');
  assert(body.includes('### Muddat'), 'Contains "### Muddat"');
  assert(body.includes('### Qayerga murojaat qilish'), 'Contains "### Qayerga murojaat qilish"');
  assert(body.includes('### Kerakli hujjatlar'), 'Contains "### Kerakli hujjatlar"');
  assert(body.includes('### Keyingi qadam'), 'Contains "### Keyingi qadam"');
  assert(body.includes('### Huquqiy asos'), 'Contains "### Huquqiy asos"');

  // -------------------------------------------------------------
  // TEST 5: Rule 19 - Clean Drafting Placeholders
  // -------------------------------------------------------------
  console.log('\n[TEST 5] Rule 19: Clean Drafting Placeholders:');
  assert(
    body.includes('[F.I.Sh.]') && body.includes('[Manzil]') && body.includes('[Sud nomi]'),
    'Response offers drafting template with standard placeholders [F.I.Sh.], [Manzil], [Sud nomi]'
  );

  // -------------------------------------------------------------
  // TEST 6: Google Auth Storage Sync
  // -------------------------------------------------------------
  console.log('\n[TEST 6] Backend Google Auth Service:');
  const testGoogleEmail = `test_google_${Date.now()}@gmail.com`;
  const createdGoogleUser = storageService.findOrCreateGoogleUser({
    email: testGoogleEmail,
    name: 'Google Test User',
    avatarUrl: 'https://lh3.googleusercontent.com/a/default-avatar'
  });

  assert(
    createdGoogleUser && createdGoogleUser.email === testGoogleEmail,
    'storageService.findOrCreateGoogleUser creates Google user'
  );
  assert(
    createdGoogleUser.authProvider === 'google',
    'createdGoogleUser marks authProvider as "google"'
  );

  const fetchedAgain = storageService.findOrCreateGoogleUser({
    email: testGoogleEmail,
    name: 'Updated Google Name'
  });
  assert(
    fetchedAgain.id === createdGoogleUser.id,
    'findOrCreateGoogleUser retrieves existing Google user without duplicating'
  );

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`ADVOKATAI 25-RULE SUITE RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

run25RulesSuite().catch(err => {
  console.error('[TEST SUITE ERROR]', err);
  process.exit(1);
});
