import 'dotenv/config';
import { generateLegalAdvice } from '../services/aiService.js';
import { ragService } from '../services/ragService.js';

async function runQualityTests() {
  console.log('================================================================');
  console.log('ADVOKATAI RESPONSE GENERATION QUALITY & REASONING EVALUATION');
  console.log('Testing Natural Uzbek, Dynamic Length, Zero Emojis, and Caution');
  console.log('================================================================\n');

  ragService.loadDatabase();

  let passed = 0;
  const total = 10;

  // ---------------------------------------------------------------------------
  // TEST 1: Direct First Sentence (YES/NO QUESTION)
  // ---------------------------------------------------------------------------
  console.log('[TEST 1]: Direct First Sentence ("Sudga bersam bo‘ladimi?")');
  const res1 = await generateLegalAdvice({ message: "Ish beruvchi noqonuniy bo'shatgan bo'lsa, sudga bersam bo‘ladimi?" });
  const firstSentence1 = (res1.text.split(/[.!?\n]/)[0] || '').toLowerCase();
  const t1Ok = (firstSentence1.includes('ha') || firstSentence1.includes('mumkin')) &&
               !firstSentence1.includes('assalomu alaykum') &&
               !firstSentence1.includes('men advokatai');
  console.log(`Result: ${t1Ok ? 'PASS [✓]' : 'FAIL [✗]'}`);
  console.log(`First sentence: "${res1.text.split('\n')[0]}"\n`);
  if (t1Ok) passed++;

  // ---------------------------------------------------------------------------
  // TEST 2: Dynamic Length & Brevity (Article Explanation)
  // ---------------------------------------------------------------------------
  console.log('[TEST 2]: Dynamic Length & Brevity ("253-modda nima deydi?")');
  const res2 = await generateLegalAdvice({ message: "Mehnat kodeksi 253-modda nima deydi?" });
  const wordCount2 = res2.text.split(/\s+/).filter(Boolean).length;
  const t2Ok = wordCount2 < 300 && (res2.text.includes('253') || res2.text.includes('ish haqi'));
  console.log(`Result: ${t2Ok ? 'PASS [✓]' : 'FAIL [✗]'}`);
  console.log(`Word count: ${wordCount2} words (Target: < 300 words)\n`);
  if (t2Ok) passed++;

  // ---------------------------------------------------------------------------
  // TEST 3: Absence of Rigid Template Headers
  // ---------------------------------------------------------------------------
  console.log('[TEST 3]: Absence of Rigid Template Headers ("1. Holatning huquqiy tahlili...", etc.)');
  const res3 = await generateLegalAdvice({ message: "Ish beruvchi oyligimni 2 oydan beri bermayapti, shartnomam bor." });
  const hasRigidHeaders = /1\.\s*\*?\*?holatning\s*huquqiy\s*tahlili/i.test(res3.text) ||
                          /2\.\s*\*?\*?fuqaroning\s*huquqlari/i.test(res3.text) ||
                          /\*\*sizning\s*holatingiz:\*\*/i.test(res3.text) ||
                          /\*\*bu\s*sizning\s*holatingizga\s*qanday\s*qo‘llanadi\?\*\*/i.test(res3.text);
  const t3Ok = !hasRigidHeaders && res3.text.length > 50;
  console.log(`Result: ${t3Ok ? 'PASS [✓]' : 'FAIL [✗]'}`);
  console.log(`No rigid headers present: ${!hasRigidHeaders}\n`);
  if (t3Ok) passed++;

  // ---------------------------------------------------------------------------
  // TEST 4: Absence of Repeated Greetings on Follow-Up
  // ---------------------------------------------------------------------------
  console.log('[TEST 4]: Absence of Repeated Greetings on Follow-Up (Turn 2)');
  const history4 = [
    { sender: 'user', text: "Mehnat shartnomasi nima?" },
    { sender: 'ai', text: "Mehnat shartnomasi xodim bilan ish beruvchi o'rtasidagi kelishuvdir." }
  ];
  const res4 = await generateLegalAdvice({ message: "Uni bekor qilish tartibi qanday?", history: history4 });
  const t4Ok = !res4.text.startsWith('Assalomu alaykum') &&
               !res4.text.startsWith('Salom') &&
               !res4.text.startsWith('Men AdvokatAI');
  console.log(`Result: ${t4Ok ? 'PASS [✓]' : 'FAIL [✗]'}`);
  console.log(`First 80 chars: "${res4.text.substring(0, 80)}..."\n`);
  if (t4Ok) passed++;

  // ---------------------------------------------------------------------------
  // TEST 5: Absence of Generic Closing Filler
  // ---------------------------------------------------------------------------
  console.log('[TEST 5]: Absence of Generic Closing Filler ("Agar boshqa savollaringiz bo\'lsa...")');
  const hasGenericClosing = /(agar\s+(qo‘shimcha|boshqa)\s+savollaringiz\s+bo‘lsa[^\n]*\n*)$/i.test(res3.text) ||
                            /(savollaringiz\s+bo‘lsa,?\s*marhamat[^\n]*\n*)$/i.test(res3.text);
  const t5Ok = !hasGenericClosing;
  console.log(`Result: ${t5Ok ? 'PASS [✓]' : 'FAIL [✗]'}`);
  console.log(`Clean practical closing: ${t5Ok}\n`);
  if (t5Ok) passed++;

  // ---------------------------------------------------------------------------
  // TEST 6: Zero Decorative Emojis
  // ---------------------------------------------------------------------------
  console.log('[TEST 6]: Zero Decorative Emojis (No 📌, ⚖️, 🏛️, 🔗, ✅, ❗)');
  const emojiRegex = /[📌⚖️🏛️🔗✅❗]/g;
  const foundEmojis = (res1.text + res2.text + res3.text + res4.text).match(emojiRegex) || [];
  const t6Ok = foundEmojis.length === 0;
  console.log(`Result: ${t6Ok ? 'PASS [✓]' : 'FAIL [✗]'}`);
  console.log(`Found emojis: ${foundEmojis.length === 0 ? 'None (Clean text)' : foundEmojis.join(', ')}\n`);
  if (t6Ok) passed++;

  // ---------------------------------------------------------------------------
  // TEST 7: Document Placeholders & Zero Invented Facts
  // ---------------------------------------------------------------------------
  console.log('[TEST 7]: Document Placeholders & Zero Invented Facts ("Ariza yozib bering")');
  const res7 = await generateLegalAdvice({ message: "Ish haqim to'lanmaganligi bo'yicha mehnat inspeksiyasiga ariza yozib bering" });
  const hasPlaceholders = res7.text.includes('[') && res7.text.includes(']') &&
                          (res7.text.includes('[FISh') || res7.text.includes('[Manzil') || res7.text.includes('[Sana') || res7.text.includes('[Summa') || res7.text.includes('[Tashkilot'));
  const t7Ok = hasPlaceholders;
  console.log(`Result: ${t7Ok ? 'PASS [✓]' : 'FAIL [✗]'}`);
  console.log(`Contains structured placeholders: ${hasPlaceholders}\n`);
  if (t7Ok) passed++;

  // ---------------------------------------------------------------------------
  // TEST 8: Legal Caution & No Court Outcome Predictions
  // ---------------------------------------------------------------------------
  console.log('[TEST 8]: Legal Caution & No Court Outcome Predictions');
  const overconfidentPhrases = /(siz\s+albatta\s+yutasiz|100%\s+haqsiz|sud\s+albatta\s+qanoatlantiradi|pulni\s+albatta\s+undirasiz)/i;
  const hasOverconfidence = overconfidentPhrases.test(res1.text) || overconfidentPhrases.test(res3.text);
  const t8Ok = !hasOverconfidence;
  console.log(`Result: ${t8Ok ? 'PASS [✓]' : 'FAIL [✗]'}`);
  console.log(`Zero overconfident predictions: ${t8Ok}\n`);
  if (t8Ok) passed++;

  // ---------------------------------------------------------------------------
  // TEST 9: Practical Action Guidance with 2026 Hotlines
  // ---------------------------------------------------------------------------
  console.log('[TEST 9]: Practical Action Guidance with 2026 Hotlines ("Endi nima qilay?")');
  const res9 = await generateLegalAdvice({ message: "Ish beruvchi 2 oydan beri oylikni bermayapti, endi nima qilay?" });
  const lower9 = res9.text.toLowerCase();
  const t9Ok = (lower9.includes('1176') || lower9.includes('mehnat inspeksiy') || lower9.includes('talabnoma') || lower9.includes('dalil')) &&
               !overconfidentPhrases.test(res9.text);
  console.log(`Result: ${t9Ok ? 'PASS [✓]' : 'FAIL [✗]'}`);
  console.log(`Contains practical route / hotline: ${t9Ok}\n`);
  if (t9Ok) passed++;

  // ---------------------------------------------------------------------------
  // TEST 10: Compact Lex.uz Source Display
  // ---------------------------------------------------------------------------
  console.log('[TEST 10]: Compact Lex.uz Source Display');
  const linkMatches = (res3.text.match(/https:\/\/lex\.uz[^\s\)]+/g) || []);
  const uniqueLinks = new Set(linkMatches);
  const t10Ok = linkMatches.length === uniqueLinks.size && res3.sourceUrl && res3.sourceUrl.includes('lex.uz');
  console.log(`Result: ${t10Ok ? 'PASS [✓]' : 'FAIL [✗]'}`);
  console.log(`Unique Lex.uz links: ${uniqueLinks.size}, Duplicate links: ${linkMatches.length - uniqueLinks.size}\n`);
  if (t10Ok) passed++;

  // ---------------------------------------------------------------------------
  // FINAL SUMMARY
  // ---------------------------------------------------------------------------
  console.log('================================================================');
  console.log(`QUALITY EVALUATION SUMMARY: ${passed} / ${total} TESTS PASSED (${Math.round(passed/total*100)}%)`);
  console.log('================================================================');

  if (passed === total) {
    console.log('ALL RESPONSE GENERATION QUALITY CRITERIA MET (100%)!\n');
  } else {
    console.warn(`WARNING: ${total - passed} quality tests need review.\n`);
    process.exit(1);
  }
}

runQualityTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
