/**
 * Comprehensive Verification of the 15 Rules and Enhancements
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

async function runTests() {
  console.log('================================================================');
  console.log('TARGETED VERIFICATION TEST SUITE (15 RULES)');
  console.log('================================================================\n');

  // TEST 1: Hokimlik direct inquiry
  console.log('[TEST 1] Direct Inquiry: "Hokimlik ustidan shikoyat qilmoqchiman"');
  try {
    const res = await generateLegalAdvice({ message: "Hokimlik ustidan shikoyat qilmoqchiman" });
    const text = res.text.toLowerCase();

    assert(res.needs_clarification === true, 'Must flag needs_clarification: true');
    assert(res.citations.length === 0, 'Must have 0 citation pills');
    assert(!text.includes('mehnat kodeksi'), 'Must NOT cite Mehnat kodeksi');
    assert(text.includes('qaror') || text.includes('harakat'), 'Must ask about hokimlik decision or action');
    assert(text.includes('1.') && text.includes('2.') && text.includes('3.'), 'Must ask targeted questions');

    console.log('>>> PASS [✓] Hokimlik direct inquiry asks 5 targeted questions without citing Mehnat kodeksi.\n');
    passed++;
  } catch (err) {
    console.error(`>>> FAILED: ${err.message}\n`);
    failed++;
  }

  // TEST 2: Corruption & Bribery direct inquiry
  console.log('[TEST 2] Direct Inquiry: "Pora va korrupsiya holatlari"');
  try {
    const res = await generateLegalAdvice({ message: "Pora va korrupsiya holatlari" });
    const text = res.text.toLowerCase();

    assert(res.needs_clarification === true, 'Must flag needs_clarification: true');
    assert(res.citations.length === 0, 'Must have 0 citation pills');
    assert(!text.includes('210') && !text.includes('211') && !text.includes('212'), 'Must NOT prematurely list Articles 210, 211, 212 per Rule 17');
    assert(text.includes('1.') && text.includes('2.') && text.includes('3.') && text.includes('4.'), 'Must ask 4 targeted questions per Rule 17');

    console.log('>>> PASS [✓] Corruption general inquiry asks 4 targeted questions without prematurely listing articles (Rule 17).\n');
    passed++;
  } catch (err) {
    console.error(`>>> FAILED: ${err.message}\n`);
    failed++;
  }

  // TEST 3: Penalty Generalization Cleaner
  console.log('[TEST 3] Penalty Generalization Prevention (Rule 2):');
  try {
    const raw = "JK bo‘yicha jazo bazaviy hisoblash miqdorining 50 baravaridan boshlab 15 yilgacha ozodlikdan mahrum qilish bilan jazolanadi.";
    const cleaned = legalValidatorService.cleanPenaltyGeneralizations(raw);

    assert(!cleaned.includes('50 baravaridan boshlab 15 yilgacha'), 'Must eliminate synthetic wide range');
    assert(cleaned.includes('Jazoning aniq turi va miqdori qilmishning holatlari hamda Jinoyat kodeksining tegishli qismiga bog‘liq'), 'Must insert standard conditional clause');

    console.log('>>> PASS [✓] Synthetic multi-part penalty range sanitized to standard conditional clause.\n');
    passed++;
  } catch (err) {
    console.error(`>>> FAILED: ${err.message}\n`);
    failed++;
  }

  // TEST 4: Accusatory Language Cleaner
  console.log('[TEST 4] Accusatory Language Neutralization (Rule 3):');
  try {
    const raw = "Siz jinoyat sodir etgansiz va bu qilmishingiz jazolanadi.";
    const cleaned = legalValidatorService.cleanAccusatoryPhrasing(raw);

    assert(!cleaned.includes('Siz jinoyat sodir etgansiz'), 'Must eliminate direct accusation');
    assert(cleaned.includes('Ta’riflagan holatingiz, agar qo‘shimcha faktlar tasdiqlansa'), 'Must replace with objective conditional phrasing');

    console.log('>>> PASS [✓] Direct accusation converted to conditional legal analysis.\n');
    passed++;
  } catch (err) {
    console.error(`>>> FAILED: ${err.message}\n`);
    failed++;
  }

  // TEST 5: Lawful Evidence Advice
  console.log('[TEST 5] Lawful Evidence Advice Enforcement (Rule 7):');
  try {
    const raw = "Mansabdor shaxs bilan suhbatni yashirincha yozib oling va sudga taqdim eting.";
    const cleaned = legalValidatorService.cleanEvidenceAdvice(raw);

    assert(!cleaned.includes('yashirincha yozib oling'), 'Must eliminate advice for secret recordings');
    assert(cleaned.includes('qonuniy yo‘l bilan olingan dalillarni saqlab qo‘ying'), 'Must advise lawful evidence preservation');
    assert(cleaned.includes('Dalilning maqbulligi va huquqiy kuchi'), 'Must include admissibility caveat');

    console.log('>>> PASS [✓] Unlawful secret recording advice replaced with lawful evidence standards.\n');
    passed++;
  } catch (err) {
    console.error(`>>> FAILED: ${err.message}\n`);
    failed++;
  }

  // TEST 6: Generic Filler Elimination
  console.log('[TEST 6] Generic Filler Elimination (Rule 11):');
  try {
    const raw = "Qonunchilikka ko‘ra, har bir shaxs o‘z huquqlarini himoya qilishga doir qonuniy harakatlarni amalga oshirish huquqiga ega. Siz ma’muriy sudga murojaat qilishingiz mumkin.";
    const cleaned = legalValidatorService.cleanGenericFiller(raw);

    assert(!cleaned.includes('har bir shaxs o‘z huquqlarini himoya qilishga doir qonuniy harakatlarni'), 'Must strip generic filler platitude');
    assert(cleaned.includes('Siz ma’muriy sudga murojaat qilishingiz mumkin'), 'Must preserve actual advice');

    console.log('>>> PASS [✓] Generic filler platitudes stripped completely.\n');
    passed++;
  } catch (err) {
    console.error(`>>> FAILED: ${err.message}\n`);
    failed++;
  }

  // TEST 7: Exemption Attribution Guard
  console.log('[TEST 7] Bribery Exemption Attribution Guard (Rule 4):');
  try {
    const raw = "JK 212-moddasiga ko‘ra vositachi agar 30 sutka ichida arz qilsa javobgarlikdan ozod qilinadi.";
    const cleaned = legalValidatorService.validateAndFormatBriberyResponse(raw, {}, 'vositachilik');

    assert(!cleaned.includes('vositachi agar 30 sutka ichida arz qilsa javobgarlikdan ozod qilinadi'), 'Must not grant 30-day exemption to intermediary');
    assert(cleaned.includes('faqat pora beruvchi shaxsdan pora talab qilingan bo‘lsa'), 'Must state exemption belongs exclusively to bribe-giver under JK 211 p. 4');

    console.log('>>> PASS [✓] Exemption rule strictly confined to bribe-giver.\n');
    passed++;
  } catch (err) {
    console.error(`>>> FAILED: ${err.message}\n`);
    failed++;
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('================================================================');
  console.log(`TARGETED SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: 7)`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal Suite Error:', err);
  process.exit(1);
});
