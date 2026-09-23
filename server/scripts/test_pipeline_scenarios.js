import 'dotenv/config';
import { generateLegalAdvice } from '../services/aiService.js';
import { queryUnderstandingService } from '../services/queryUnderstandingService.js';

async function runTests() {
  console.log('====================================================');
  console.log('ADVOKATAI BACKEND AI PIPELINE VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let total = 8;

  // TEST 1: "Isming nima?"
  console.log('[TEST 1]: "Isming nima?"');
  const res1 = await generateLegalAdvice({ message: "Isming nima?" });
  const t1Ok = res1.text.includes('AdvokatAI') && 
               res1.sources.length === 0 && 
               !res1.text.toLowerCase().includes('mehnat kodeksi') &&
               !res1.text.toLowerCase().includes('ogohlantirish:');
  console.log(`Result: ${t1Ok ? 'PASS' : 'FAIL'}`);
  console.log(`Intent: ${res1.intent}, Sources count: ${res1.sources.length}`);
  console.log(`Response snippet: "${res1.text}"\n`);
  if (t1Ok) passed++;

  // TEST 2: "Salom"
  console.log('[TEST 2]: "Salom"');
  const res2 = await generateLegalAdvice({ message: "Salom" });
  const t2Ok = res2.text.includes('AdvokatAI') && 
               res2.sources.length === 0 && 
               !res2.text.toLowerCase().includes('mehnat');
  console.log(`Result: ${t2Ok ? 'PASS' : 'FAIL'}`);
  console.log(`Intent: ${res2.intent}, Sources count: ${res2.sources.length}`);
  console.log(`Response snippet: "${res2.text}"\n`);
  if (t2Ok) passed++;

  // TEST 3: "Konstitutsiya 56-modda"
  console.log('[TEST 3]: "Konstitutsiya 56-modda"');
  const res3 = await generateLegalAdvice({ message: "Konstitutsiya 56-modda" });
  const t3Ok = res3.sourceArticle && 
               res3.sourceArticle.includes('56') && 
               res3.sourceUrl && 
               res3.sourceUrl.includes('lex.uz');
  console.log(`Result: ${t3Ok ? 'PASS' : 'FAIL'}`);
  console.log(`Source Article: ${res3.sourceArticle}, URL: ${res3.sourceUrl}`);
  console.log(`Response snippet: "${res3.text.substring(0, 150)}..."\n`);
  if (t3Ok) passed++;

  // TEST 4: "Shikoyat ariza yozish tartibi" (Ambiguous query -> single clarifying question, NO labor code)
  console.log('[TEST 4]: "Shikoyat ariza yozish tartibi"');
  const res4 = await generateLegalAdvice({ message: "Shikoyat ariza yozish tartibi" });
  const t4Ok = res4.needs_clarification === true && 
               res4.sources.length === 0 && 
               !res4.text.toLowerCase().includes('mehnat') &&
               res4.text.includes('ish beruvchi') && 
               res4.text.includes('davlat organi');
  console.log(`Result: ${t4Ok ? 'PASS' : 'FAIL'}`);
  console.log(`Needs Clarification: ${res4.needs_clarification}, Sources count: ${res4.sources.length}`);
  console.log(`Clarifying question: "${res4.text}"\n`);
  if (t4Ok) passed++;

  // TEST 5: "Ish beruvchi maoshimni bermayapti, nima qilsam bo‘ladi?"
  console.log('[TEST 5]: "Ish beruvchi maoshimni bermayapti, nima qilsam bo‘ladi?"');
  const res5 = await generateLegalAdvice({ message: "Ish beruvchi maoshimni bermayapti, nima qilsam bo‘ladi?" });
  const t5Ok = res5.sourceArticle && 
               res5.sourceArticle.toLowerCase().includes('mehnat') &&
               res5.sourceUrl && 
               res5.sourceUrl.includes('lex.uz');
  console.log(`Result: ${t5Ok ? 'PASS' : 'FAIL'}`);
  console.log(`Source Article: ${res5.sourceArticle}, URL: ${res5.sourceUrl}`);
  console.log(`Response snippet: "${res5.text.substring(0, 160)}..."\n`);
  if (t5Ok) passed++;

  // TEST 6: "Jinoyat kodeksi 168-modda nima haqida?"
  console.log('[TEST 6]: "Jinoyat kodeksi 168-modda nima haqida?"');
  const res6 = await generateLegalAdvice({ message: "Jinoyat kodeksi 168-modda nima haqida?" });
  const t6Ok = res6.sourceArticle && 
               res6.sourceArticle.toLowerCase().includes('jinoyat') &&
               res6.sourceArticle.includes('168') &&
               (res6.text.toLowerCase().includes('firibgarlik') || res6.text.toLowerCase().includes('aldash'));
  console.log(`Result: ${t6Ok ? 'PASS' : 'FAIL'}`);
  console.log(`Source Article: ${res6.sourceArticle}, URL: ${res6.sourceUrl}`);
  console.log(`Response snippet: "${res6.text.substring(0, 160)}..."\n`);
  if (t6Ok) passed++;

  // TEST 7: "Rahmat"
  console.log('[TEST 7]: "Rahmat"');
  const res7 = await generateLegalAdvice({ message: "Rahmat" });
  const t7Ok = res7.sources.length === 0 && 
               res7.text.includes('AdvokatAI') && 
               !res7.text.toLowerCase().includes('mehnat');
  console.log(`Result: ${t7Ok ? 'PASS' : 'FAIL'}`);
  console.log(`Intent: ${res7.intent}, Sources: ${res7.sources.length}`);
  console.log(`Response snippet: "${res7.text}"\n`);
  if (t7Ok) passed++;

  // TEST 8: Multi-turn Memory ("Mehnat shartnomasi nima?" -> "Uni bekor qilishchi?")
  console.log('[TEST 8]: Multi-turn Memory Context Resolution');
  const history = [
    { sender: 'user', text: "Mehnat shartnomasi nima?" },
    { sender: 'ai', text: "Mehnat shartnomasi xodim bilan ish beruvchi o'rtasidagi kelishuvdir." }
  ];
  const res8 = await generateLegalAdvice({ 
    message: "Uni bekor qilishchi?", 
    history 
  });
  const t8Ok = res8.sourceArticle && 
               res8.sourceArticle.toLowerCase().includes('mehnat') &&
               (res8.sourceArticle.includes('160') || res8.sourceArticle.includes('161') || res8.sourceArticle.includes('155') || res8.sourceArticle.includes('168') || res8.text.toLowerCase().includes('bekor qilish'));
  console.log(`Result: ${t8Ok ? 'PASS' : 'FAIL'}`);
  console.log(`Source Article: ${res8.sourceArticle}, URL: ${res8.sourceUrl}`);
  console.log(`Response snippet: "${res8.text.substring(0, 160)}..."\n`);
  if (t8Ok) passed++;

  console.log('====================================================');
  console.log(`TOTAL PASSED: ${passed} / ${total} (${Math.round(passed/total*100)}%)`);
  console.log('====================================================');

  if (passed === total) {
    console.log('ALL PIPELINE TEST SCENARIOS PASSED WITH 100% SUCCESS!');
  } else {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
