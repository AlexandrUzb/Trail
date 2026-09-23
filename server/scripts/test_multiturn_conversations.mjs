import 'dotenv/config';
import { generateLegalAdvice } from '../services/aiService.js';

async function runMultiTurnTests() {
  console.log('================================================================');
  console.log('ADVOKATAI SECTION 38: MULTI-TURN CONVERSATIONS TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  // ============================================================================
  // TEST 1: Bare Unpaid Salary (Single turn)
  // Query: "Ish beruvchi oylikni to'lamayapti"
  // Goal: Progressive discovery (1 concise question), 0 citations, NOT 500-word essay
  // ============================================================================
  console.log('----------------------------------------------------------------');
  console.log('[TEST 1]: "Ish beruvchi oylikni to\'lamayapti" (Turn 1)');
  console.log('Expected: Clarifies missing duration/contract facts instead of dumping an essay');
  try {
    const res1 = await generateLegalAdvice({ message: "Ish beruvchi oylikni to'lamayapti", history: [] });
    const ok = res1.needs_clarification === true &&
               res1.citations.length === 0 &&
               res1.sources.length === 0 &&
               (res1.text.includes('oydan beri') || res1.text.includes('shartnoma'));
    if (ok) {
      console.log('>>> RESULT: PASS [✓]');
      console.log(`Details: Needs Clarification: true, Citations: 0, Question: "${res1.text}"`);
      passed++;
    } else {
      console.log('>>> RESULT: FAIL [✗]');
      console.log(`Details: NeedsClarification: ${res1.needs_clarification}, Citations: ${res1.citations.length}, Text: ${res1.text}`);
      failed++;
    }
  } catch (err) {
    console.log('>>> RESULT: ERROR [!]', err.message);
    failed++;
  }

  // ============================================================================
  // TEST 2: Ambiguous Complaint (Turn 1)
  // Query: "Shikoyat ariza yozish tartibi"
  // Goal: Disambiguation of complaint target, 0 citations
  // ============================================================================
  console.log('----------------------------------------------------------------');
  console.log('[TEST 2]: "Shikoyat ariza yozish tartibi" (Turn 1)');
  console.log('Expected: Clarifies complaint target (employer, state body, court, etc.), 0 citations');
  let t2AiResponse = '';
  try {
    const res2 = await generateLegalAdvice({ message: "Shikoyat ariza yozish tartibi", history: [] });
    t2AiResponse = res2.text;
    const ok = res2.needs_clarification === true &&
               res2.citations.length === 0 &&
               res2.sources.length === 0 &&
               (res2.text.includes('ish beruvchiga') || res2.text.includes('davlat organiga'));
    if (ok) {
      console.log('>>> RESULT: PASS [✓]');
      console.log(`Details: Needs Clarification: true, Citations: 0, Question: "${res2.text}"`);
      passed++;
    } else {
      console.log('>>> RESULT: FAIL [✗]');
      console.log(`Details: NeedsClarification: ${res2.needs_clarification}, Citations: ${res2.citations.length}, Text: ${res2.text}`);
      failed++;
    }
  } catch (err) {
    console.log('>>> RESULT: ERROR [!]', err.message);
    failed++;
  }

  // ============================================================================
  // TEST 3: Follow-up to Complaint (Turn 2)
  // Query: "Davlat organiga" (with history of Test 2)
  // Goal: Continues complaint, asks which state organ
  // ============================================================================
  console.log('----------------------------------------------------------------');
  console.log('[TEST 3]: Follow-up "Davlat organiga" (Turn 2)');
  console.log('Expected: Resolves against previous complaint context, asks which state body');
  try {
    const history3 = [
      { sender: 'user', text: "Shikoyat ariza yozish tartibi" },
      { sender: 'ai', text: t2AiResponse || "Qaysi masala bo‘yicha shikoyat qilmoqchisiz: ish beruvchiga, davlat organiga, sudga yoki davlat organi chiqargan qaror ustidanmi?" }
    ];
    const res3 = await generateLegalAdvice({ message: "Davlat organiga", history: history3 });
    const ok = res3.needs_clarification === true &&
               res3.citations.length === 0 &&
               res3.sources.length === 0 &&
               (res3.text.includes('davlat organi') || res3.text.includes('organ'));
    if (ok) {
      console.log('>>> RESULT: PASS [✓]');
      console.log(`Details: Needs Clarification: true, Citations: 0, Question: "${res3.text}"`);
      passed++;
    } else {
      console.log('>>> RESULT: FAIL [✗]');
      console.log(`Details: NeedsClarification: ${res3.needs_clarification}, Citations: ${res3.citations.length}, Text: ${res3.text}`);
      failed++;
    }
  } catch (err) {
    console.log('>>> RESULT: ERROR [!]', err.message);
    failed++;
  }

  // ============================================================================
  // TEST 4: Administrative Fine Disambiguation (Turn 1)
  // Query: "Ma'muriy jarimadan shikoyat qilish"
  // Goal: Asks who issued the fine, 0 citations
  // ============================================================================
  console.log('----------------------------------------------------------------');
  console.log('[TEST 4]: "Ma\'muriy jarimadan shikoyat qilish" (Turn 1)');
  console.log('Expected: Asks who issued the administrative fine, 0 citations');
  let t4AiResponse = '';
  try {
    const res4 = await generateLegalAdvice({ message: "Ma'muriy jarimadan shikoyat qilish", history: [] });
    t4AiResponse = res4.text;
    const ok = res4.needs_clarification === true &&
               res4.citations.length === 0 &&
               res4.sources.length === 0 &&
               res4.text.includes('qaysi organ');
    if (ok) {
      console.log('>>> RESULT: PASS [✓]');
      console.log(`Details: Needs Clarification: true, Citations: 0, Question: "${res4.text}"`);
      passed++;
    } else {
      console.log('>>> RESULT: FAIL [✗]');
      console.log(`Details: NeedsClarification: ${res4.needs_clarification}, Citations: ${res4.citations.length}, Text: ${res4.text}`);
      failed++;
    }
  } catch (err) {
    console.log('>>> RESULT: ERROR [!]', err.message);
    failed++;
  }

  // ============================================================================
  // TEST 5: Follow-up to Fine (Turn 2)
  // Query: "Mehnat inspeksiyasi" (with history of Test 4)
  // Goal: Resolves fine issuer to Labor Inspectorate (Article 537), guides appeal
  // ============================================================================
  console.log('----------------------------------------------------------------');
  console.log('[TEST 5]: Follow-up "Mehnat inspeksiyasi" (Turn 2)');
  console.log('Expected: Resolves fine issuer to Labor Inspectorate (Article 537), Hotline 1176');
  try {
    const history5 = [
      { sender: 'user', text: "Ma'muriy jarimadan shikoyat qilish" },
      { sender: 'ai', text: t4AiResponse || "Maʼmuriy jarimani qaysi organ yoki mansabdor shaxs chiqargan?" }
    ];
    const res5 = await generateLegalAdvice({ message: "Mehnat inspeksiyasi", history: history5 });
    const lower = (res5.text + ' ' + (res5.sourceArticle || '')).toLowerCase();
    const ok = (lower.includes('537') || lower.includes('inspektor') || lower.includes('mehnat')) &&
               (lower.includes('1176') || lower.includes('sud') || lower.includes('shikoyat')) &&
               res5.citations.length > 0;
    if (ok) {
      console.log('>>> RESULT: PASS [✓]');
      console.log(`Details: Article: ${res5.sourceArticle}, Citations: ${res5.citations.length}`);
      passed++;
    } else {
      console.log('>>> RESULT: FAIL [✗]');
      console.log(`Details: Article: ${res5.sourceArticle}, Citations: ${res5.citations.length}, Text preview: ${res5.text.substring(0, 100)}...`);
      failed++;
    }
  } catch (err) {
    console.log('>>> RESULT: ERROR [!]', err.message);
    failed++;
  }

  // ============================================================================
  // TEST 6: Tenancy Dispute Disambiguation (Turn 1)
  // Query: "Ijara huquqlari va kvartira nizosi"
  // Goal: Asks what specific rental issue (deposit, eviction, etc.), 0 citations
  // ============================================================================
  console.log('----------------------------------------------------------------');
  console.log('[TEST 6]: "Ijara huquqlari va kvartira nizosi" (Turn 1)');
  console.log('Expected: Asks rental dispute type, 0 citations');
  let t6AiResponse = '';
  try {
    const res6 = await generateLegalAdvice({ message: "Ijara huquqlari va kvartira nizosi", history: [] });
    t6AiResponse = res6.text;
    const ok = res6.needs_clarification === true &&
               res6.citations.length === 0 &&
               res6.sources.length === 0 &&
               (res6.text.includes('depozit') || res6.text.includes('chiqarish') || res6.text.includes('to‘lov'));
    if (ok) {
      console.log('>>> RESULT: PASS [✓]');
      console.log(`Details: Needs Clarification: true, Citations: 0, Question: "${res6.text}"`);
      passed++;
    } else {
      console.log('>>> RESULT: FAIL [✗]');
      console.log(`Details: NeedsClarification: ${res6.needs_clarification}, Citations: ${res6.citations.length}, Text: ${res6.text}`);
      failed++;
    }
  } catch (err) {
    console.log('>>> RESULT: ERROR [!]', err.message);
    failed++;
  }

  // ============================================================================
  // TEST 7: Follow-up to Tenancy Dispute (Turn 2)
  // Query: "Uy egasi depozitni qaytarmayapti" (with history of Test 6)
  // Goal: Continues rental deposit case (Civil Code 544/382)
  // ============================================================================
  console.log('----------------------------------------------------------------');
  console.log('[TEST 7]: Follow-up "Uy egasi depozitni qaytarmayapti" (Turn 2)');
  console.log('Expected: Continues rental deposit dispute (Civil Code 544/382/535)');
  try {
    const history7 = [
      { sender: 'user', text: "Ijara huquqlari va kvartira nizosi" },
      { sender: 'ai', text: t6AiResponse || "Ijara bo‘yicha nizoyingiz qaysi masalaga tegishli: ijara haqini to‘lashning kechikishi, depozitni qaytarish, uy-joydan chiqarish, shartnomani bekor qilish yoki mol-mulkka yetkazilgan zarar?" }
    ];
    const res7 = await generateLegalAdvice({ message: "Uy egasi depozitni qaytarmayapti", history: history7 });
    const lower = (res7.text + ' ' + (res7.sourceArticle || '')).toLowerCase();
    const ok = (lower.includes('fuqarolik') || res7.law_group === 'civil_code') &&
               (lower.includes('depozit') || lower.includes('544') || lower.includes('535') || lower.includes('382')) &&
               !lower.includes('mehnat');
    if (ok) {
      console.log('>>> RESULT: PASS [✓]');
      console.log(`Details: Article: ${res7.sourceArticle}, Citations: ${res7.citations.length}`);
      passed++;
    } else {
      console.log('>>> RESULT: FAIL [✗]');
      console.log(`Details: Article: ${res7.sourceArticle}, Citations: ${res7.citations.length}, Text preview: ${res7.text.substring(0, 100)}...`);
      failed++;
    }
  } catch (err) {
    console.log('>>> RESULT: ERROR [!]', err.message);
    failed++;
  }

  // ============================================================================
  // TEST 8: 3-Turn Fact Accumulation
  // Turn 1: "Ish beruvchi oylikni bermayapti"
  // Turn 2: "2 oy bo'ldi"
  // Turn 3: "Rasmiy shartnoma bor"
  // Goal: Preserves all 3 facts (salary, 2 months, official contract) -> Article 253 advice
  // ============================================================================
  console.log('----------------------------------------------------------------');
  console.log('[TEST 8]: 3-Turn Fact Accumulation (Turns 1, 2, 3)');
  console.log('Expected: Preserves salary, 2 months, and official contract facts -> cites Labor Code 253');
  try {
    const res8_1 = await generateLegalAdvice({ message: "Ish beruvchi oylikni bermayapti", history: [] });
    const history8_2 = [
      { sender: 'user', text: "Ish beruvchi oylikni bermayapti" },
      { sender: 'ai', text: res8_1.text }
    ];
    const res8_2 = await generateLegalAdvice({ message: "2 oy bo'ldi", history: history8_2 });
    const history8_3 = [
      ...history8_2,
      { sender: 'user', text: "2 oy bo'ldi" },
      { sender: 'ai', text: res8_2.text }
    ];
    const res8_3 = await generateLegalAdvice({ message: "Rasmiy shartnoma bor", history: history8_3 });
    const lower = (res8_3.text + ' ' + (res8_3.sourceArticle || '')).toLowerCase();
    const ok = (lower.includes('mehnat') || res8_3.law_group === 'labor_code') &&
               (lower.includes('253') || lower.includes('244') || lower.includes('ish haqi')) &&
               (lower.includes('2 oy') || lower.includes('oylik') || lower.includes('maosh') || lower.includes('ish haqi')) &&
               (lower.includes('1176') || lower.includes('inspeksiya') || lower.includes('sud')) &&
               res8_3.citations.length > 0;
    if (ok) {
      console.log('>>> RESULT: PASS [✓]');
      console.log(`Details: Article: ${res8_3.sourceArticle}, Citations: ${res8_3.citations.length}`);
      passed++;
    } else {
      console.log('>>> RESULT: FAIL [✗]');
      console.log(`Details: Article: ${res8_3.sourceArticle}, Citations: ${res8_3.citations.length}, Text preview: ${res8_3.text.substring(0, 100)}...`);
      failed++;
    }
  } catch (err) {
    console.log('>>> RESULT: ERROR [!]', err.message);
    failed++;
  }

  // ============================================================================
  // TEST 9: Topic Switch
  // Turn 1: "Ish beruvchi oylikni bermayapti"
  // Turn 2: "Kvartira depozitini ham qaytarishmayapti"
  // Goal: Resets active case, handles tenancy deposit without mixing employer facts
  // ============================================================================
  console.log('----------------------------------------------------------------');
  console.log('[TEST 9]: Topic Switch (Labor Salary -> Tenancy Deposit)');
  console.log('Expected: Automatically resets case to tenancy deposit, zero employer contamination');
  try {
    const history9 = [
      { sender: 'user', text: "Ish beruvchi oylikni bermayapti" },
      { sender: 'ai', text: "Oylik maoshingiz necha oydan beri to‘lanmayapti va mehnat shartnomangiz rasmiy tuzilganmi?" }
    ];
    const res9 = await generateLegalAdvice({ message: "Kvartira depozitini ham qaytarishmayapti", history: history9 });
    const lower = (res9.text + ' ' + (res9.sourceArticle || '')).toLowerCase();
    const ok = (lower.includes('fuqarolik') || res9.law_group === 'civil_code') &&
               (lower.includes('depozit') || lower.includes('ijara')) &&
               !lower.includes('mehnat kodeksi') &&
               !lower.includes('ish beruvchi') &&
               res9.citations.length > 0;
    if (ok) {
      console.log('>>> RESULT: PASS [✓]');
      console.log(`Details: Article: ${res9.sourceArticle}, Citations: ${res9.citations.length}`);
      passed++;
    } else {
      console.log('>>> RESULT: FAIL [✗]');
      console.log(`Details: Article: ${res9.sourceArticle}, Citations: ${res9.citations.length}, Text preview: ${res9.text.substring(0, 100)}...`);
      failed++;
    }
  } catch (err) {
    console.log('>>> RESULT: ERROR [!]', err.message);
    failed++;
  }

  // ============================================================================
  // TEST 10: Standalone Article Inquiry ("253-modda")
  // Query: "253-modda" (Turn 1, no history)
  // Goal: Asks what user wants (text, explanation, link, or case application), 0 citations
  // ============================================================================
  console.log('----------------------------------------------------------------');
  console.log('[TEST 10]: Standalone Article Inquiry "253-modda" (Turn 1)');
  console.log('Expected: Offers explanation, Lex.uz link, or case application, 0 citations');
  try {
    const res10 = await generateLegalAdvice({ message: "253-modda", history: [] });
    const ok = res10.needs_clarification === true &&
               res10.citations.length === 0 &&
               res10.sources.length === 0 &&
               (res10.text.includes('tushuntirib') || res10.text.includes('Lex.uz') || res10.text.includes('qo‘llanishini'));
    if (ok) {
      console.log('>>> RESULT: PASS [✓]');
      console.log(`Details: Needs Clarification: true, Citations: 0, Options: "${res10.text}"`);
      passed++;
    } else {
      console.log('>>> RESULT: FAIL [✗]');
      console.log(`Details: NeedsClarification: ${res10.needs_clarification}, Citations: ${res10.citations.length}, Text: ${res10.text}`);
      failed++;
    }
  } catch (err) {
    console.log('>>> RESULT: ERROR [!]', err.message);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`FINAL MULTI-TURN RESULTS: ${passed} / 10 TESTS PASSED (${Math.round((passed / 10) * 100)}%)`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runMultiTurnTests();
