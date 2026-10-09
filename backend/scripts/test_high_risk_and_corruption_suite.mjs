/**
 * High-Risk Matters, Corruption Protocol & Directive Verification Suite
 * 
 * Verifies:
 * - Rule 17: "Pora va korrupsiya holatlari" asks 4 targeted questions without listing articles 205, 210, 211, 212.
 * - Rule 1: Definitive crime conclusion converted to conditional qualification.
 * - Rule 2: Neutrality & third-party allegation sanitization.
 * - Rule 11: Lawful evidence admissibility standard and secret recording prohibition.
 * - Rule 13: Strict multi-condition immunity caveat (JK 211 p. 4) without flat promises.
 * - Rule 18: Corruption complaint 6-section structure (Holat, Huquqiy baho, Qayerga, Nimalarni saqlash, Murojaatda nimalar, Keyingi qadam).
 * - Rule 21: Complete elimination of arbitrary reliability badges.
 * - Rule 22: Assistant self-description check (AI huquqiy yordamchi, never rasmiy).
 */

import { generateLegalAdvice } from '../services/aiService.js';
import { queryUnderstandingService } from '../services/queryUnderstandingService.js';
import { legalValidatorService } from '../services/legalValidatorService.js';
import fs from 'fs';
import path from 'path';

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

async function runHighRiskAndCorruptionSuite() {
  console.log('================================================================');
  console.log('HIGH-RISK MATTERS & CORRUPTION DIRECTIVE VERIFICATION SUITE');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // TEST 1: Rule 17 - Ambiguous Corruption Inquiry Clarification
  // -------------------------------------------------------------
  console.log('[TEST 1] Rule 17: Ambiguous Corruption Inquiry ("Pora va korrupsiya holatlari")');
  const corruptionClarification = await generateLegalAdvice({
    message: 'Pora va korrupsiya holatlari',
    userId: 'test-user-hr',
    history: []
  });

  assert(
    corruptionClarification.needs_clarification === true,
    'Ambiguous corruption query flags needs_clarification: true'
  );
  assert(
    corruptionClarification.citations.length === 0,
    'Ambiguous corruption query does not emit citation pills'
  );
  assert(
    !corruptionClarification.text.includes('205') &&
    !corruptionClarification.text.includes('210') &&
    !corruptionClarification.text.includes('211') &&
    !corruptionClarification.text.includes('212'),
    'Rule 17: Does NOT immediately list Articles 205, 210, 211, 212'
  );
  assert(
    corruptionClarification.text.includes('1.') &&
    corruptionClarification.text.includes('2.') &&
    corruptionClarification.text.includes('3.') &&
    corruptionClarification.text.includes('4.'),
    'Rule 17: Asks the 4 targeted questions'
  );
  assert(
    corruptionClarification.text.includes('Sizdan pul yoki boshqa manfaat talab qilinganmi'),
    'Rule 17: Question 1 verifies if money/benefit was demanded'
  );

  // -------------------------------------------------------------
  // TEST 2: Rule 1 - Definitive Crime Conclusion Sanitization
  // -------------------------------------------------------------
  console.log('\n[TEST 2] Rule 1: Definitive Crime Conclusion Sanitization');
  const rawCrimeConclusion = 'Bu Jinoyat kodeksining 211-moddasi bo‘yicha jinoyat hisoblanadi.';
  const cleanedCrimeConclusion = legalValidatorService.cleanDefinitiveCrimeConclusions(rawCrimeConclusion);

  assert(
    !cleanedCrimeConclusion.includes('bo‘yicha jinoyat hisoblanadi'),
    'Replaces definitive conclusion "jinoyat hisoblanadi"'
  );
  assert(
    cleanedCrimeConclusion.includes('qilmish alomatlariga mos kelishi mumkin'),
    'Uses conditional qualification "alomatlariga mos kelishi mumkin"'
  );
  assert(
    cleanedCrimeConclusion.includes('vakolatli organ ishning barcha holatlari asosida belgilaydi'),
    'Emphasizes competent authority prerogative'
  );

  // -------------------------------------------------------------
  // TEST 3: Rule 2 - Third-Party Allegation Neutrality
  // -------------------------------------------------------------
  console.log('\n[TEST 3] Rule 2: Third-Party Allegation Neutrality');
  const rawAccusation = 'U mansabdor shaxs pora olgan va og‘ir jinoyat sodir etgan.';
  const cleanedAccusation = legalValidatorService.cleanAccusatoryPhrasing(rawAccusation);

  assert(
    !cleanedAccusation.includes('mansabdor shaxs pora olgan'),
    'Neutralizes third-party guilt assertion "mansabdor shaxs pora olgan"'
  );
  assert(
    cleanedAccusation.includes('Sizning ta’rifingizga ko‘ra, mansabdor shaxs pul yoki boshqa manfaat talab qilgan'),
    'Frames allegation according to user description ("Sizning ta’rifingizga ko‘ra...")'
  );

  // -------------------------------------------------------------
  // TEST 4: Rule 11 - Evidence Admissibility & Lawful Recording Standard
  // -------------------------------------------------------------
  console.log('\n[TEST 4] Rule 11: Evidence Admissibility & Secret Recording Prohibition');
  const rawEvidence = 'Bu audio yozuv jinoyatni to‘liq isbotlaydi. Suhbatni yashirincha ovoz yozib oling.';
  const cleanedEvidence = legalValidatorService.cleanEvidenceAdvice(rawEvidence);

  assert(
    !cleanedEvidence.includes('jinoyatni to‘liq isbotlaydi'),
    'Neutralizes decisive evidentiary claim "jinoyatni to‘liq isbotlaydi"'
  );
  assert(
    !cleanedEvidence.includes('yashirincha ovoz yozib oling'),
    'Eliminates advice to make secret or illegal recordings'
  );
  assert(
    cleanedEvidence.includes('maqbulligi') && cleanedEvidence.includes('qanday olinganiga'),
    'States that admissibility and evidentiary weight depend on lawful acquisition'
  );

  // -------------------------------------------------------------
  // TEST 5: Rule 13 - Multi-Condition Statutory Immunity Qualification
  // -------------------------------------------------------------
  console.log('\n[TEST 5] Rule 13: Strict Statutory Immunity Qualification (JK 211 p. 4)');
  const rawImmunity = 'Agar darhol xabar bersangiz, siz jinoiy javobgarlikdan to‘liq ozod qilinasiz.';
  const cleanedImmunity = legalValidatorService.cleanImmunityAdvice(rawImmunity);

  assert(
    !cleanedImmunity.includes('javobgarlikdan to‘liq ozod qilinasiz'),
    'Bars flat promise "javobgarlikdan to‘liq ozod qilinasiz"'
  );
  assert(
    cleanedImmunity.includes('muayyan shartlar bajarilganda') &&
    cleanedImmunity.includes('ixtiyoriy xabar qilish') &&
    cleanedImmunity.includes('hamkorlik qilish'),
    'Specifies multi-condition statutory qualification'
  );

  const formattedBribery = legalValidatorService.validateAndFormatBriberyResponse(
    'Ha, barchasi og‘ir jinoyat hisoblanadi.',
    { cleanQuery: 'pora og‘ir jinoyatmi' },
    'pora og‘ir jinoyatmi'
  );
  assert(
    formattedBribery.includes('30 sutka mobaynida') &&
    formattedBribery.includes('o‘z ixtiyori bilan arz qilsa') &&
    formattedBribery.includes('chin ko‘ngildan pushaymon bo‘lsa'),
    'Bribery severity response includes statutory 30-day voluntary reporting and repentance conditions'
  );

  // -------------------------------------------------------------
  // TEST 6: Rule 18 - Corruption Complaint 6-Section Structure
  // -------------------------------------------------------------
  console.log('\n[TEST 6] Rule 18: Corruption Complaint 6-Section Structure');
  const complaintRes = await generateLegalAdvice({
    message: 'Hokimiyat xodimi yer ajratish uchun pora talab qildi, shikoyat arizasi yozmoqchiman qayerga va qanday murojaat qilay?',
    userId: 'test-user-corruption-complaint',
    history: []
  });

  const complaintText = complaintRes.text;
  assert(complaintText.includes('### Holat'), 'Section 1: ### Holat present');
  assert(complaintText.includes('### Huquqiy baho'), 'Section 2: ### Huquqiy baho present');
  assert(complaintText.includes('### Qayerga murojaat qilish'), 'Section 3: ### Qayerga murojaat qilish present');
  assert(complaintText.includes('### Nimalarni saqlash kerak'), 'Section 4: ### Nimalarni saqlash kerak present');
  assert(complaintText.includes('### Murojaatda nimalar bo‘lishi kerak'), 'Section 5: ### Murojaatda nimalar bo‘lishi kerak present');
  assert(complaintText.includes('### Keyingi qadam'), 'Section 6: ### Keyingi qadam present');

  assert(
    complaintText.includes('1007') && complaintText.includes('1253') && complaintText.includes('102'),
    'Includes official emergency channels: General Prosecutor (1007), Anti-Corruption Agency (1253), MIA (102)'
  );

  // -------------------------------------------------------------
  // TEST 7: Rule 21 - Complete Absence of Arbitrary Reliability Badges
  // -------------------------------------------------------------
  console.log('\n[TEST 7] Rule 21: Removal of Arbitrary Reliability Badges');
  const textWithBadge = '**Ishonch darajasi:** Yuqori (98%)\n**Ishonchlilik:** Past\n### Huquqiy tahlil\nMatn';
  const cleanedBadgeText = legalValidatorService.cleanReliabilityBadges(textWithBadge);

  assert(
    !cleanedBadgeText.includes('**Ishonch darajasi:**') &&
    !cleanedBadgeText.includes('**Ishonchlilik:**'),
    'Stripped arbitrary badges like "**Ishonch darajasi:**" and "**Ishonchlilik:**"'
  );
  assert(
    !complaintText.includes('**Ishonch darajasi:**') &&
    !complaintText.includes('**Ishonchlilik:**'),
    'Generated corruption response contains no arbitrary reliability badges'
  );

  // -------------------------------------------------------------
  // TEST 8: Rule 22 - Assistant Self-Description Verification
  // -------------------------------------------------------------
  console.log('\n[TEST 8] Rule 22: Assistant Self-Description Normalizer');
  const rawIntro = 'Men AdvokatAI — O‘zbekiston qonunchiligiga asoslangan rasmiy huquqiy yordamchiman.';
  const cleanedIntro = legalValidatorService.cleanSelfDescription(rawIntro);

  assert(
    !cleanedIntro.includes('rasmiy huquqiy yordamchi'),
    'Replaces "rasmiy huquqiy yordamchi" with "AI huquqiy yordamchi"'
  );
  assert(
    cleanedIntro.includes('O‘zbekiston qonunchiligiga asoslangan AI huquqiy yordamchi'),
    'Correctly identifies as "O‘zbekiston qonunchiligiga asoslangan AI huquqiy yordamchi"'
  );

  const chatPageSource = fs.readFileSync(path.resolve('./src/pages/ChatPage.tsx'), 'utf-8');
  assert(
    !chatPageSource.includes('rasmiy huquqiy yordamchi'),
    'src/pages/ChatPage.tsx does NOT claim "rasmiy huquqiy yordamchi"'
  );

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`SUITE COMPLETE: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runHighRiskAndCorruptionSuite().catch(err => {
  console.error('Test suite uncaught error:', err);
  process.exit(1);
});
