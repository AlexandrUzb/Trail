import dotenv from 'dotenv';
dotenv.config();

import { generateLegalAdvice } from '../services/aiService.js';
import { queryUnderstandingService } from '../services/queryUnderstandingService.js';
import { ragService } from '../services/ragService.js';
import { storageService } from '../services/storageService.js';

let passedCount = 0;
let totalTests = 10;

function assert(condition, testNum, description, detail = '') {
  if (condition) {
    console.log(`✅ [TEST ${testNum}] PASSED: ${description}`);
    passedCount++;
  } else {
    console.error(`❌ [TEST ${testNum}] FAILED: ${description}`);
    if (detail) console.error(`   Details:`, detail);
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('⚖️  AdvokatAI: Automated Legal Pipeline Test Suite');
  console.log('====================================================\n');

  // TEST 1: Greeting
  console.log('Running Test 1: "Salom"...');
  const res1 = await generateLegalAdvice({ message: "Salom" });
  assert(
    res1.intent === 'GREETING' && res1.sources.length === 0 && res1.citations.length === 0,
    1,
    'Greeting response returned with NO legal search.',
    res1
  );

  // TEST 2: Courtesy / Thanks
  console.log('Running Test 2: "Rahmat"...');
  const res2 = await generateLegalAdvice({ message: "Rahmat" });
  assert(
    res2.intent === 'COURTESY' && res2.sources.length === 0,
    2,
    'Normal conversational response returned with NO legal search.',
    res2
  );

  // TEST 3: About Product
  console.log('Running Test 3: "AdvokatAI nima qila oladi?"...');
  const res3 = await generateLegalAdvice({ message: "AdvokatAI nima qila oladi?" });
  assert(
    res3.intent === 'ABOUT_PRODUCT' && res3.sources.length === 0 && res3.text.includes('AdvokatAI'),
    3,
    'Product explained with AdvokatAI branding and NO unnecessary legal retrieval.',
    res3
  );

  // TEST 4: Vague issue
  console.log('Running Test 4: "Men bilan muammo bo‘ldi, nima qilishim kerak?"...');
  const res4 = await generateLegalAdvice({ message: "Men bilan muammo bo‘ldi, nima qilishim kerak?" });
  assert(
    res4.intent === 'UNCLEAR_LEGAL' && res4.needs_clarification === true && res4.sources.length === 0,
    4,
    'Vague problem handled by asking clarification questions without guessing the law.',
    res4
  );

  // TEST 5: Labor issue scenario
  console.log('Running Test 5: "Ish beruvchim 3 oydan beri maoshimni bermayapti."...');
  const res5 = await generateLegalAdvice({ message: "Ish beruvchim 3 oydan beri maoshimni bermayapti." });
  const isLaborCode5 = res5.citations.some(c => c.document.toLowerCase().includes('mehnat'));
  assert(
    res5.intent === 'LEGAL' && isLaborCode5 && res5.citations.length > 0,
    5,
    'Identified labor-law issue and retrieved relevant Labor Code provisions.',
    { law_group: res5.law_group, citations: res5.citations }
  );

  // TEST 6: Ambiguous dispute
  console.log('Running Test 6: "Men do‘stim bilan janjallashib qoldim."...');
  const res6 = await generateLegalAdvice({ message: "Men do‘stim bilan janjallashib qoldim." });
  assert(
    res6.needs_clarification === true && !res6.text.toLowerCase().includes('og\'ir jinoyat'),
    6,
    'Did not classify as a crime; asked what happened / what legal issue occurred.',
    res6
  );

  // TEST 7: Selected Law = Mehnat kodeksi
  console.log('Running Test 7: Selected law "mehnat_kodeksi"...');
  const res7 = await generateLegalAdvice({
    message: "Mehnat shartnomam bilan bog‘liq muammo bor.",
    law_group: "mehnat_kodeksi"
  });
  const allLabor = res7.citations.every(c => c.document.toLowerCase().includes('mehnat'));
  assert(
    res7.citations.length > 0 && allLabor,
    7,
    'Selected Law mode strictly searched within the Labor Code.',
    res7.citations
  );

  // TEST 8: Change Selected Law = Jinoyat kodeksi
  console.log('Running Test 8: Selected law "jinoyat_kodeksi" with same query...');
  const res8 = await generateLegalAdvice({
    message: "Mehnat shartnomam bilan bog‘liq muammo bor.",
    law_group: "jinoyat_kodeksi"
  });
  const allCriminal = res8.citations.every(c => c.document.toLowerCase().includes('jinoyat'));
  assert(
    res8.citations.length > 0 && allCriminal,
    8,
    'Backend search context strictly changed to Jinoyat kodeksi when selected.',
    res8.citations
  );

  // TEST 9: Complex scenario extraction
  console.log('Running Test 9: Complex scenario with multiple facts...');
  const complexMsg = "Ish beruvchim 3 oydan beri maoshimni bermayapti va meni ishdan bo‘shatish bilan qo‘rqityapti.";
  const scenario9 = queryUnderstandingService.analyzeScenario(complexMsg);
  const res9 = await generateLegalAdvice({ message: complexMsg });
  assert(
    scenario9.domain === 'labor' && scenario9.issues.length >= 2 && res9.citations.length > 0,
    9,
    'Extracted multi-fact scenario (unpaid salary + unlawful dismissal threat) instead of matching single keyword.',
    { domain: scenario9.domain, issues: scenario9.issues }
  );

  // TEST 10: Non-existent legal article / out of scope
  console.log('Running Test 10: "Marsga uchish uchun kosmik kema vizasi qanday olinadi?"...');
  const res10 = await generateLegalAdvice({ message: "Marsga uchish uchun kosmik kema vizasi qanday olinadi?" });
  assert(
    (res10.confidenceLevel === 'LOW' || res10.needs_clarification === true || res10.sources.length === 0) &&
    !res10.text.includes('154-modda') && !res10.text.includes('210-modda'),
    10,
    'Zero hallucinations when no relevant legal provision exists; stated insufficient information.',
    res10.text.slice(0, 150)
  );

  console.log('\n====================================================');
  console.log(`Test Results: ${passedCount} / ${totalTests} Passed (${Math.round((passedCount / totalTests) * 100)}%)`);
  console.log('====================================================');

  if (passedCount === totalTests) {
    console.log('🎉 ALL 10 TEST CASES PASSED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('⚠️ Some tests failed.');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
