/**
 * AdvokatAI Section 15: Final Regression Test Set
 * 
 * Verifies all 9 regression failure modes and quality requirements:
 * 1. Uzbek grammar on rental question ("zararmi?" or "zarar?", NO "zararmis?")
 * 2. Tenancy deposit refund ("Depozitimni qaytarishmayapti") checks contract conditions first
 * 3. Admin fine appeal ("Politsiya") routes to Administrative Code, NEVER Criminal Code 154¹
 * 4. Employer complaint ("Ish beruvchiga shikoyat qilmoqchiman") asks what was done, NO Labor Code 179
 * 5. Unpaid salary ("Ish beruvchi oylikni bermayapti") uses correct Labor Code & proper legal terms
 * 6. Bribe giving ("Pora berish haqida") routes specifically to Article 211
 * 7. Bribe taking ("Pora olish haqida") routes specifically to Article 210
 * 8. Bribery mediation ("Pora olish-berishda vositachilik") routes specifically to Article 212
 * 9. Bribery classification ("Pora — og‘ir jinoyatmi?") explains Article 15 classification without flat "Ha, og'ir"
 */

import { generateLegalAdvice } from '../services/aiService.js';
import { legalValidatorService } from '../services/legalValidatorService.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`  [FAIL]: ${message}`);
    throw new Error(message);
  }
}

async function runRegressionSuite() {
  console.log('================================================================');
  console.log('ADVOKATAI SECTION 15: COMPREHENSIVE REGRESSION TEST SET');
  console.log('================================================================\n');

  // --------------------------------------------------------------------------
  // TEST 1: Uzbek question grammar on rental question ("zararmis?" fix)
  // --------------------------------------------------------------------------
  console.log('[TEST 1] Rental question grammar check ("zararmis?" global fix):');
  try {
    const rawAwkward = "Ijara bo‘yicha nizoyingiz aynan qaysi masalaga tegishli: to‘lov kechikishi, depozitni qaytarish, uydan chiqarib yuborish, shartnomani bekor qilish yoki mulkka yetkazilgan zararmis?";
    const cleaned = legalValidatorService.cleanQuestionGrammarAndParticles(rawAwkward);

    assert(!cleaned.includes('zararmis'), 'Must not contain "zararmis"');
    assert(!cleaned.includes('uydan chiqarib yuborish'), 'Must not contain colloquial "uydan chiqarib yuborish"');
    assert(cleaned.includes('zarar?') || cleaned.includes('zararmi?'), 'Must have grammatically correct question ending');

    // Also test standalone question particle fix
    const testMis = legalValidatorService.cleanQuestionGrammarAndParticles("Bu holat qonunbuzarlikmis?");
    assert(testMis === "Bu holat qonunbuzarlikmi?", 'Should convert qonunbuzarlikmis? -> qonunbuzarlikmi?');

    console.log('>>> PASS [✓] Question grammar correctly formatted without "zararmis?".\n');
    passed++;
  } catch (err) {
    console.error(`>>> FAILED: ${err.message}\n`);
    failed++;
  }

  // --------------------------------------------------------------------------
  // TEST 2: "Depozitimni qaytarishmayapti."
  // Expected: Ask/check contract conditions before saying the deposit must be returned.
  // --------------------------------------------------------------------------
  console.log('[TEST 2] Tenancy deposit return conditions ("Depozitimni qaytarishmayapti"):');
  try {
    const res = await generateLegalAdvice({ message: "Depozitimni qaytarishmayapti." });
    const textLower = res.text.toLowerCase();

    // Check that it references contract terms, damage check, or conditional wording
    const mentionsContractCondition = textLower.includes('shartnoma') || textLower.includes('dalolatnoma') || textLower.includes('zarar') || textLower.includes('agar');
    assert(mentionsContractCondition, 'Must check or mention contract terms/conditions before absolute return conclusion');

    // Confidence should NOT be blindly "HIGH" if contract details are missing
    assert(res.confidenceLevel === 'MEDIUM' || res.confidenceLevel === 'LOW' || res.confidenceReason, 'Confidence must reflect missing contract terms');
    if (res.confidenceReason) {
      console.log(`  Confidence reason attached: "${res.confidenceReason}"`);
    }

    console.log('>>> PASS [✓] Checks contract conditions and calibrates confidence properly.\n');
    passed++;
  } catch (err) {
    console.error(`>>> FAILED: ${err.message}\n`);
    failed++;
  }

  // --------------------------------------------------------------------------
  // TEST 3: "Ma’muriy jarimadan shikoyat qilish" -> "Politsiya"
  // Expected: Administrative-fine appeal workflow. NEVER Criminal Code 154¹.
  // --------------------------------------------------------------------------
  console.log('[TEST 3] Admin Fine Appeal with Police keyword:');
  try {
    const history = [
      { sender: 'user', text: "Ma’muriy jarimadan shikoyat qilish" },
      { sender: 'ai', text: "Jarima qarorini qaysi organ yoki mansabdor shaxs chiqargan?" }
    ];
    const res = await generateLegalAdvice({ message: "Politsiya ma’muriy jarima yozdi", history });
    const fullText = (res.text + ' ' + (res.sourceArticle || '')).toLowerCase();

    assert(!fullText.includes('154¹') && !fullText.includes('154-1'), 'CRITICAL: Must NEVER cite Criminal Code 154¹ for administrative fine');
    assert(!fullText.includes('chet davlat'), 'Must not cite foreign military recruitment');
    assert(!res.text.includes('Fuqarolik sudiga murojaat') && !res.text.includes('fuqarolik ishlari bo‘yicha sudga daʼvo'), 'Must not route administrative dispute to civil court');
    assert(res.text.includes('ma’muriy sud') || res.text.includes('maʼmuriy sud') || res.text.includes('yuqori turuvchi organ'), 'Must route to administrative court or superior organ');

    const hasAdminContext = fullText.includes('maʼmuriy') || fullText.includes('ma’muriy') || res.law_group === 'administrative_code';
    assert(hasAdminContext, 'Must route to Administrative Code/venue');

    console.log('>>> PASS [✓] Administrative fine cleanly isolated from Criminal Code 154¹.\n');
    passed++;
  } catch (err) {
    console.error(`>>> FAILED: ${err.message}\n`);
    failed++;
  }

  // --------------------------------------------------------------------------
  // TEST 4: "Ish beruvchiga shikoyat qilmoqchiman."
  // Expected: Ask what the employer did. Do NOT automatically cite MK 179 (personal data).
  // --------------------------------------------------------------------------
  console.log('[TEST 4] Employer Complaint Ambiguity:');
  try {
    const res = await generateLegalAdvice({ message: "Ish beruvchiga shikoyat qilmoqchiman." });
    const fullText = (res.text + ' ' + (res.sourceArticle || '')).toLowerCase();

    assert(!fullText.includes('179-modda'), 'CRITICAL: Must NOT cite Labor Code 179 (personal data)');
    assert(res.needs_clarification === true || fullText.includes('qaysi') || fullText.includes('nima'), 'Must clarify nature of employer dispute');

    console.log('>>> PASS [✓] Clarification requested without false citation of MK 179.\n');
    passed++;
  } catch (err) {
    console.error(`>>> FAILED: ${err.message}\n`);
    failed++;
  }

  // --------------------------------------------------------------------------
  // TEST 5: "Ish beruvchi oylikni bermayapti."
  // Expected: Correct Labor Code provisions and practical remedies, proper formal terms.
  // --------------------------------------------------------------------------
  console.log('[TEST 5] Unpaid Salary with Proper Terminology:');
  try {
    const history = [
      { sender: 'user', text: "Ish beruvchi oylikni bermayapti." },
      { sender: 'ai', text: "Oylik maoshingiz necha oydan beri to‘lanmayapti va mehnat shartnomangiz rasmiy tuzilganmi?" }
    ];
    const res = await generateLegalAdvice({ message: "2 oydan beri to‘lamayapti, shartnoma rasmiy bor", history });
    const fullText = (res.text + ' ' + (res.sourceArticle || '')).toLowerCase();

    assert(fullText.includes('mehnat kodeksi') || res.law_group === 'labor_code', 'Must cite Labor Code');
    assert(fullText.includes('253') || fullText.includes('333'), 'Must cite Article 253 or 333');
    assert(!fullText.includes('zararmis'), 'No zararmis grammatical error');

    console.log('>>> PASS [✓] Correct Labor Code articles and remedies provided.\n');
    passed++;
  } catch (err) {
    console.error(`>>> FAILED: ${err.message}\n`);
    failed++;
  }

  // --------------------------------------------------------------------------
  // TEST 6: "Pora berish haqida."
  // Expected: Correctly distinguish Article 211 from Articles 210 and 212.
  // --------------------------------------------------------------------------
  console.log('[TEST 6] Bribe Giving Specific Routing:');
  try {
    const res = await generateLegalAdvice({ message: "Pora berish haqida ma’lumot bering." });
    const text = res.text;
    const sourceArt = res.sourceArticle || '';

    assert(text.includes('211-modda') || sourceArt.includes('211'), 'Must cite Article 211 (Pora berish)');
    assert(!text.includes('barchasi og‘ir jinoyat'), 'Must not call all bribery monolithic og‘ir jinoyat');

    console.log('>>> PASS [✓] Correctly routed to Article 211 (Pora berish).\n');
    passed++;
  } catch (err) {
    console.error(`>>> FAILED: ${err.message}\n`);
    failed++;
  }

  // --------------------------------------------------------------------------
  // TEST 7: "Pora olish haqida."
  // Expected: Correctly route to Article 210.
  // --------------------------------------------------------------------------
  console.log('[TEST 7] Bribe Taking Specific Routing:');
  try {
    const res = await generateLegalAdvice({ message: "Pora olish haqida ma’lumot bering." });
    const text = res.text;
    const sourceArt = res.sourceArticle || '';

    assert(text.includes('210-modda') || sourceArt.includes('210'), 'Must cite Article 210 (Pora olish)');

    console.log('>>> PASS [✓] Correctly routed to Article 210 (Pora olish).\n');
    passed++;
  } catch (err) {
    console.error(`>>> FAILED: ${err.message}\n`);
    failed++;
  }

  // --------------------------------------------------------------------------
  // TEST 8: "Pora olish-berishda vositachilik."
  // Expected: Correctly route to Article 212.
  // --------------------------------------------------------------------------
  console.log('[TEST 8] Bribery Mediation Specific Routing:');
  try {
    const res = await generateLegalAdvice({ message: "Pora olish-berishda vositachilik haqida ma’lumot bering." });
    const text = res.text;
    const sourceArt = res.sourceArticle || '';

    assert(text.includes('212-modda') || sourceArt.includes('212'), 'Must cite Article 212 (Vositachilik qilish)');

    console.log('>>> PASS [✓] Correctly routed to Article 212 (Vositachilik qilish).\n');
    passed++;
  } catch (err) {
    console.error(`>>> FAILED: ${err.message}\n`);
    failed++;
  }

  // --------------------------------------------------------------------------
  // TEST 9: "Pora — og‘ir jinoyatmi?"
  // Expected: Do not automatically say yes. Explain classification according to Article 15.
  // --------------------------------------------------------------------------
  console.log('[TEST 9] Bribery Severity Classification inquiry ("Pora — og‘ir jinoyatmi?"):');
  try {
    const res = await generateLegalAdvice({ message: "Pora — og‘ir jinoyatmi?" });
    const text = res.text.toLowerCase();

    assert(!text.startsWith('ha, pora doimo og‘ir jinoyat'), 'Must NOT give a flat monolithic "Ha, ogir"');
    assert(text.includes('15-modda'), 'Must cite Criminal Code Article 15 (Jinoyatlarning tasnifi)');
    assert(text.includes('uncha og‘ir bo‘lmagan') || text.includes('uncha ogir bolmagan'), 'Must explain 1-part is uncha og‘ir bo‘lmagan');
    assert(text.includes('og‘ir') && text.includes('o‘ta og‘ir'), 'Must explain 2nd and 3rd parts (og‘ir / o‘ta og‘ir)');

    console.log('>>> PASS [✓] Article 15 classification explained with accurate statutory categories.\n');
    passed++;
  } catch (err) {
    console.error(`>>> FAILED: ${err.message}\n`);
    failed++;
  }

  // --------------------------------------------------------------------------
  // TEST 10: "Shikoyat ariza" -> "Davlat organiga" -> "Hokimlik"
  // Expected: Must NOT cite Labor Code 20. Must ask 5 targeted questions (qaror sanasi, raqami, qaysi huquq).
  // --------------------------------------------------------------------------
  console.log('[TEST 10] State Organ Complaint -> "Hokimlik" Multi-Turn Flow:');
  try {
    const history = [
      { sender: 'user', text: "Shikoyat ariza yozish tartibi" },
      { sender: 'ai', text: "Qaysi masala bo‘yicha shikoyat qilmoqchisiz: ish beruvchiga, davlat organiga, sudga yoki davlat organi chiqargan qaror ustidanmi?" },
      { sender: 'user', text: "Davlat organiga" },
      { sender: 'ai', text: "Qaysi davlat organining qarori yoki harakati ustidan shikoyat qilmoqchisiz (hokimlik, soliq, ichki ishlar yoki boshqa organ)?" }
    ];
    const res = await generateLegalAdvice({ message: "Hokimlik", history });
    const textLower = res.text.toLowerCase();

    assert(!textLower.includes('mehnat kodeksi'), 'CRITICAL: Must NEVER cite Mehnat kodeksi for a general Hokimlik complaint');
    assert(res.needs_clarification === true, 'Must ask for clarification when user only mentions entity "Hokimlik"');
    assert(res.citations.length === 0, 'Must have zero citation pills during entity clarification');
    assert(textLower.includes('qaysi qarori') || textLower.includes('qaror') || textLower.includes('sanasi'), 'Must ask for specific decision/action details');

    console.log('>>> PASS [✓] State organ Hokimlik complaint correctly prompts for decision facts without Labor Code contamination.\n');
    passed++;
  } catch (err) {
    console.error(`>>> FAILED: ${err.message}\n`);
    failed++;
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('================================================================');
  console.log(`REGRESSION SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: 10)`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runRegressionSuite().catch((err) => {
  console.error('Fatal Test Suite Error:', err);
  process.exit(1);
});
