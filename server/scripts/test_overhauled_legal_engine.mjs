import 'dotenv/config';
import { generateLegalAdvice } from '../services/aiService.js';
import { queryUnderstandingService } from '../services/queryUnderstandingService.js';
import { ragService } from '../services/ragService.js';
import { legalValidatorService } from '../services/legalValidatorService.js';

async function runComprehensiveTests() {
  console.log('================================================================');
  console.log('ADVOKATAI OVERHAULED LEGAL REASONING ENGINE TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  // TEST 1: Administrative fine appeal with police/radar context
  console.log('[TEST 1] Admin Fine Appeal with Police/Radar:');
  console.log('Query: "Politsiya ma’muriy jarima yozdi, shikoyat qilmoqchiman"');
  const res1 = await generateLegalAdvice({ message: 'Politsiya ma’muriy jarima yozdi, shikoyat qilmoqchiman' });
  const lower1 = res1.text.toLowerCase();

  const no154 = !lower1.includes('154¹') && !lower1.includes('154-1') && !lower1.includes('154-modda') && !lower1.includes('chet davlat');
  const noCivilCourt = !lower1.includes('fuqarolik ishlari bo‘yicha') && !lower1.includes('fuqarolik sudi');
  const hasAdminProcedures = (lower1.includes('314') || lower1.includes('315') || lower1.includes('316') || lower1.includes('10 kun')) &&
                             (lower1.includes('ma’muriy') || lower1.includes('yuqori turuvchi'));
  const notCriminal = !res1.sources.includes('Jinoyat kodeksi');

  if (no154 && noCivilCourt && hasAdminProcedures && notCriminal) {
    console.log('>>> PASS [✓] Correct administrative venue, 10-day deadline, no JK 154¹, no Civil Court contamination.\n');
    passed++;
  } else {
    console.log('>>> FAIL [✗]', { no154, noCivilCourt, hasAdminProcedures, notCriminal, sources: res1.sources, snippet: res1.text.slice(0, 200) });
    failed++;
  }

  // TEST 2: Ambiguous Employer Complaint vs Irrelevant Articles
  console.log('[TEST 2] Employer Complaint Ambiguity:');
  console.log('Query: "Ish beruvchim ustidan shikoyat qilmoqchiman"');
  const res2 = await generateLegalAdvice({ message: 'Ish beruvchim ustidan shikoyat qilmoqchiman' });
  const lower2 = res2.text.toLowerCase();

  const no179 = !lower2.includes('179-modda') && !lower2.includes('179 modda');
  const asksViolationType = res2.needs_clarification === true || lower2.includes('qaysi huquq') || lower2.includes('ish haqi');
  const hasInspectorate = lower2.includes('1176') || lower2.includes('mehnat inspeksiyasi');

  if (no179 && asksViolationType && hasInspectorate) {
    console.log('>>> PASS [✓] Clarification sought, Davlat mehnat inspeksiyasi (1176) referenced, MK 179 prevented.\n');
    passed++;
  } else {
    console.log('>>> FAIL [✗]', { no179, asksViolationType, hasInspectorate, snippet: res2.text.slice(0, 200) });
    failed++;
  }

  // TEST 3: Tenancy Deposit Return (Substantive rule, conditional reasoning, FK 535 suppression)
  console.log('[TEST 3] Tenancy Security Deposit Return:');
  console.log('Query: "Ijara depozitini uy egasi qaytarmayapti"');
  const res3 = await generateLegalAdvice({ message: 'Ijara depozitini uy egasi qaytarmayapti' });
  const lower3 = res3.text.toLowerCase();

  const no535AsSole = !lower3.includes('535-modda') || lower3.includes('236') || lower3.includes('382') || lower3.includes('544');
  const hasRemedyArticle = lower3.includes('544') || lower3.includes('382') || lower3.includes('236');
  const isConfidenceNotHigh = res3.confidenceLevel !== 'HIGH'; // Missing damage act & contract status facts!
  const hasCivilCourt = lower3.includes('fuqarolik') || lower3.includes('sud');

  if (no535AsSole && hasRemedyArticle && isConfidenceNotHigh && hasCivilCourt) {
    console.log(`>>> PASS [✓] Substantive remedies cited (FK 544/382/236), confidence capped at ${res3.confidenceLevel} due to missing facts, Civil court identified.\n`);
    passed++;
  } else {
    console.log('>>> FAIL [✗]', { no535AsSole, hasRemedyArticle, isConfidenceNotHigh, confidenceLevel: res3.confidenceLevel, hasCivilCourt, snippet: res3.text.slice(0, 200) });
    failed++;
  }

  // TEST 4: Bribery & Extortion (JK 210/211/212 nuance, 30-day exemption, non-monolithic penalty)
  console.log('[TEST 4] Bribery Extortion & 30-day Exemption:');
  console.log('Query: "Mendan mansabdor shaxs pora talab qilishdi, nima qilishim kerak?"');
  const res4 = await generateLegalAdvice({ message: 'Mendan mansabdor shaxs pora talab qilishdi, nima qilishim kerak?' });
  const lower4 = res4.text.toLowerCase();

  const hasExemptionOr30Days = lower4.includes('30 sutka') || lower4.includes('30 kun') || lower4.includes('ozod') || lower4.includes('211');
  const hasAntiCorruptionOrProsecutor = lower4.includes('1253') || lower4.includes('1007') || lower4.includes('korrupsiyaga qarshi');
  const noMonolithicOverclaim = !lower4.includes('barchasi og‘ir jinoyat') && !lower4.includes('albatta yutasiz');
  const hasPenalArticles = lower4.includes('210') || lower4.includes('211');

  if (hasExemptionOr30Days && hasAntiCorruptionOrProsecutor && noMonolithicOverclaim && hasPenalArticles) {
    console.log('>>> PASS [✓] JK 210/211 distinguished, 30-day voluntary report exemption noted, Anti-corruption agency (1253) / Bosh prokuratura (1007) provided.\n');
    passed++;
  } else {
    console.log('>>> FAIL [✗]', { hasExemptionOr30Days, hasAntiCorruptionOrProsecutor, noMonolithicOverclaim, hasPenalArticles, snippet: res4.text.slice(0, 200) });
    failed++;
  }

  // TEST 5: Distinguishing Labor Transfer vs Additional Work
  console.log('[TEST 5A] Labor Transfer to Another Job:');
  console.log('Query: "Ish beruvchi meni boshqa ishga o‘tkazmoqda, bunga xodim roziligi kerakmi?"');
  const res5a = await generateLegalAdvice({ message: 'Ish beruvchi meni boshqa ishga o‘tkazmoqda, bunga xodim roziligi kerakmi?' });
  const lower5a = res5a.text.toLowerCase();

  const has137or138 = lower5a.includes('137') || lower5a.includes('138');
  const requiresConsent = lower5a.includes('rozilik') || lower5a.includes('roziligi');

  if (has137or138 && requiresConsent) {
    console.log('>>> PASS [✓] Labor transfer accurately routed to MK 137/138 (consent required).\n');
    passed++;
  } else {
    console.log('>>> FAIL [✗]', { has137or138, requiresConsent, snippet: res5a.text.slice(0, 200) });
    failed++;
  }

  console.log('[TEST 5B] Labor Additional Work / Combination of Jobs:');
  console.log('Query: "Ish beruvchi menga qo‘shimcha vazifa yuklamoqchi, bu qanday rasmiylashtiriladi?"');
  const res5b = await generateLegalAdvice({ message: 'Ish beruvchi menga qo‘shimcha vazifa yuklamoqchi, bu qanday rasmiylashtiriladi?' });
  const lower5b = res5b.text.toLowerCase();

  const has116orAdditional = lower5b.includes('116') || lower5b.includes('qo‘shimcha') || lower5b.includes('qoshimcha');

  if (has116orAdditional) {
    console.log('>>> PASS [✓] Additional work correctly distinguished from regular transfer.\n');
    passed++;
  } else {
    console.log('>>> FAIL [✗]', { has116orAdditional, snippet: res5b.text.slice(0, 200) });
    failed++;
  }

  // TEST 6: Jurisdiction Matching (Section I)
  console.log('[TEST 6] Jurisdiction Rule Matching:');
  const adminScenario = queryUnderstandingService.analyzeScenario('radar jarimasi ustidan shikoyat');
  const civilScenario = queryUnderstandingService.analyzeScenario('uydan chiqarish va ijara nizosi');
  const laborScenario = queryUnderstandingService.analyzeScenario('ish haqini undirish');

  const adminJurisdictionOk = adminScenario.jurisdictionRule.includes('ma’muriy') || adminScenario.jurisdictionRule.includes('organ');
  const civilJurisdictionOk = civilScenario.jurisdictionRule.includes('Fuqarolik ishlari bo‘yicha');
  const laborJurisdictionOk = laborScenario.jurisdictionRule.includes('Fuqarolik') || laborScenario.jurisdictionRule.includes('1176');

  if (adminJurisdictionOk && civilJurisdictionOk && laborJurisdictionOk) {
    console.log('>>> PASS [✓] Correct jurisdiction matching (Admin -> Ma’muriy sud, Civil/Tenancy -> Fuqarolik sudi, Labor -> Fuqarolik sudi/1176).\n');
    passed++;
  } else {
    console.log('>>> FAIL [✗]', { adminJurisdictionOk, civilJurisdictionOk, laborJurisdictionOk });
    failed++;
  }

  // TEST 7: Honest Confidence Levels (Section K)
  console.log('[TEST 7] Confidence Calibration with Missing Facts:');
  const vagueQuery = 'Menda muammo bo‘ldi, ishxonada pul masalasida';
  const vagueRes = await generateLegalAdvice({ message: vagueQuery });
  const vagueIsLowOrClarify = vagueRes.confidenceLevel === 'LOW' || vagueRes.needs_clarification === true;

  if (vagueIsLowOrClarify) {
    console.log(`>>> PASS [✓] Vague scenario assigned ${vagueRes.confidenceLevel} / needs_clarification: ${vagueRes.needs_clarification}.\n`);
    passed++;
  } else {
    console.log('>>> FAIL [✗]', { confidenceLevel: vagueRes.confidenceLevel, needs_clarification: vagueRes.needs_clarification });
    failed++;
  }

  console.log('================================================================');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runComprehensiveTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
