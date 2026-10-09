import 'dotenv/config';
import { generateLegalAdvice } from '../services/aiService.js';
import { queryUnderstandingService } from '../services/queryUnderstandingService.js';
import { ragService } from '../services/ragService.js';

async function runLegalEngineVerification() {
  console.log('================================================================');
  console.log('ADVOKATAI LEGAL ENGINE VERIFICATION');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  // 1. Advocate Identity inquiry
  console.log('[TEST 1] FAQ / Identity: "AdvokatAI mening advokatim bo‘la oladimi?"');
  const res1 = await generateLegalAdvice({ message: 'AdvokatAI mening advokatim bo‘la oladimi?' });
  const ok1 = res1.text.includes('Yo‘q') && 
              res1.text.includes('AdvokatAI inson advokat emas') &&
              res1.citations.length === 0;
  if (ok1) {
    console.log('>>> PASS [✓]');
    passed++;
  } else {
    console.log('>>> FAIL [✗]', res1.text);
    failed++;
  }

  // 2. Ambiguous Employer Complaint
  console.log('[TEST 2] Employer Complaint Ambiguity: "Ish beruvchi ustidan shikoyat qilmoqchiman"');
  const res2 = await generateLegalAdvice({ message: 'Ish beruvchi ustidan shikoyat qilmoqchiman' });
  const ok2 = res2.needs_clarification === true &&
              res2.text.includes('Ish haqi to‘lanmasligi') &&
              res2.text.includes('1176') &&
              res2.citations.length === 0 &&
              !res2.text.includes('179-modda');
  if (ok2) {
    console.log('>>> PASS [✓]');
    passed++;
  } else {
    console.log('>>> FAIL [✗]', res2.text);
    failed++;
  }

  // 3. Administrative Fine Appeal
  console.log('[TEST 3] Administrative Fine Appeal Clarification: "Ma’muriy jarimadan shikoyat qilish"');
  const res3 = await generateLegalAdvice({ message: 'Ma’muriy jarimadan shikoyat qilish' });
  const ok3 = res3.needs_clarification === true &&
              res3.text.includes('10 kun') &&
              res3.text.includes('qaror nusxasi') &&
              res3.citations.length === 0 &&
              !res3.text.includes('154');
  if (ok3) {
    console.log('>>> PASS [✓]');
    passed++;
  } else {
    console.log('>>> FAIL [✗]', res3.text);
    failed++;
  }

  // 4. Specific Administrative Fine - YHX radar jarimasi
  console.log('[TEST 4] YHX Radar Jarimasi: "YHX radar jarimasi ustidan qayerga shikoyat qilinadi?"');
  const res4 = await generateLegalAdvice({ message: 'YHX radar jarimasi ustidan qayerga shikoyat qilinadi?' });
  const lower4 = res4.text.toLowerCase();
  const ok4 = !res4.sources.includes('Jinoyat kodeksi') &&
              !lower4.includes('154¹') &&
              !lower4.includes('154-modda') &&
              (lower4.includes('ma’muriy') || lower4.includes('315') || lower4.includes('yhx'));
  if (ok4) {
    console.log('>>> PASS [✓]');
    passed++;
  } else {
    console.log('>>> FAIL [✗]', res4.text, res4.sources);
    failed++;
  }

  // 5. Bribery & Extortion reporting
  console.log('[TEST 5] Bribery & Extortion: "Mendan pora talab qilishdi, nima qilishim kerak?"');
  const res5 = await generateLegalAdvice({ message: 'Mendan pora talab qilishdi, nima qilishim kerak?' });
  const lower5 = res5.text.toLowerCase();
  const ok5 = (lower5.includes('1253') || lower5.includes('1007') || lower5.includes('korrupsiyaga qarshi')) &&
              !lower5.includes('siz albatta yutasiz') &&
              (lower5.includes('210') || lower5.includes('211'));
  if (ok5) {
    console.log('>>> PASS [✓]');
    passed++;
  } else {
    console.log('>>> FAIL [✗]', res5.text);
    failed++;
  }

  // 6. Tenancy Deposit Return
  console.log('[TEST 6] Tenancy Deposit: "Ijara depozitini uy egasi qaytarmayapti"');
  const res6 = await generateLegalAdvice({ message: 'Ijara depozitini uy egasi qaytarmayapti' });
  const lower6 = res6.text.toLowerCase();
  const ok6 = (lower6.includes('depozit') || lower6.includes('544') || lower6.includes('382') || lower6.includes('236')) &&
              !lower6.includes('mehnat');
  if (ok6) {
    console.log('>>> PASS [✓]');
    passed++;
  } else {
    console.log('>>> FAIL [✗]', res6.text);
    failed++;
  }

  console.log('\n================================================================');
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  process.exit(failed > 0 ? 1 : 0);
}

runLegalEngineVerification();
