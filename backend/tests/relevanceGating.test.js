import assert from 'assert';
import { generateLegalAdvice } from '../services/aiService.js';
import { queryUnderstandingService } from '../services/queryUnderstandingService.js';
import { ragService } from '../services/ragService.js';

async function runTestSuite() {
  console.log('Running Legal Chatbot Relevance & Grounding Test Suite...\n');

  // Test 1: User's exact prompt 1 - "soch uzunligi qancha bo'lishi kerak"
  console.log('Test 1: User exact query - "soch uzunligi qancha bo\'lishi kerak"');
  const res1 = await generateLegalAdvice({ message: "soch uzunligi qancha bo'lishi kerak" });
  assert.strictEqual(res1.sourceArticle, null, 'Must NOT cite any legal article');
  assert.strictEqual(res1.citations.length, 0, 'Must have 0 citations');
  assert.strictEqual(res1.confidenceLevel, 'LOW', 'Must NOT claim HIGH confidence');
  assert(res1.text.includes("O‘zbekiston qonunchiligiga bevosita taalluqli emas") || res1.text.includes("qonunchiligida bevosita qo‘llaniladigan norma topilmadi"), 'Must provide polite limitation message');
  console.log('✓ Passed\n');

  // Test 2: User's exact prompt 2 - "Soch o'stirish bo'yicha qoidalar"
  console.log('Test 2: User exact query - "Soch o\'stirish bo\'yicha qoidalar"');
  const res2 = await generateLegalAdvice({ message: "Soch o'stirish bo'yicha qoidalar" });
  assert.strictEqual(res2.sourceArticle, null, 'Must NOT cite any legal article');
  assert.strictEqual(res2.citations.length, 0, 'Must have 0 citations');
  assert.strictEqual(res2.confidenceLevel, 'LOW', 'Must NOT claim HIGH confidence');
  assert(res2.text.includes("O‘zbekiston qonunchiligiga bevosita taalluqli emas") || res2.text.includes("qonunchiligida bevosita qo‘llaniladigan norma topilmadi"), 'Must provide polite limitation message');
  console.log('✓ Passed\n');

  // Test 3: Everyday styling / lifestyle - "Bugun maktabga qanday kiyim kiyishim kerak?"
  console.log('Test 3: Everyday lifestyle query - "Bugun maktabga qanday kiyim kiyishim kerak?"');
  const res3 = await generateLegalAdvice({ message: "Bugun maktabga qanday kiyim kiyishim kerak?" });
  assert.strictEqual(res3.sourceArticle, null, 'Must NOT cite legal article');
  assert.strictEqual(res3.citations.length, 0, 'Must have 0 citations');
  assert.strictEqual(res3.confidenceLevel, 'LOW');
  assert(res3.text.includes("O‘zbekiston qonunchiligiga bevosita taalluqli emas") || res3.text.includes("qonunchiligida bevosita qo‘llaniladigan norma topilmadi"));
  console.log('✓ Passed\n');

  // Test 4: General non-legal everyday question - "Palov qanday pishiriladi?"
  console.log('Test 4: General non-legal query - "Palov qanday pishiriladi?"');
  const res4 = await generateLegalAdvice({ message: "Palov qanday pishiriladi?" });
  assert.strictEqual(res4.sourceArticle, null, 'Must NOT cite legal article');
  assert.strictEqual(res4.citations.length, 0, 'Must have 0 citations');
  assert.strictEqual(res4.confidenceLevel, 'LOW');
  assert(res4.text.includes("O‘zbekiston qonunchiligiga bevosita taalluqli emas"));
  console.log('✓ Passed\n');

  // Test 5: Everyday recommendation query with surface keyword overlap - "Toshkentda eng yaxshi stomatolog qayerda?"
  console.log('Test 5: Recommendation query - "Toshkentda eng yaxshi stomatolog qayerda?"');
  const res5 = await generateLegalAdvice({ message: "Toshkentda eng yaxshi stomatolog qayerda?" });
  assert.strictEqual(res5.sourceArticle, null, 'Must NOT cite legal article');
  assert.strictEqual(res5.citations.length, 0, 'Must have 0 citations');
  assert.strictEqual(res5.confidenceLevel, 'LOW');
  assert(res5.text.includes("qonunchiligida bevosita qo‘llaniladigan norma topilmadi"));
  console.log('✓ Passed\n');

  // Test 6: Genuine legal question - "Ish beruvchi homilador ayolni ishdan bo'shatishi mumkinmi?"
  console.log('Test 6: Genuine legal query - "Ish beruvchi homilador ayolni ishdan bo\'shatishi mumkinmi?"');
  const res6 = await generateLegalAdvice({ message: "Ish beruvchi homilador ayolni ishdan bo'shatishi mumkinmi?" });
  assert(res6.sourceArticle && res6.sourceArticle.includes("Mehnat kodeksi"), 'Must cite Mehnat kodeksi');
  assert(res6.citations.length >= 1, 'Must have citations');
  assert.strictEqual(res6.confidenceLevel, 'HIGH', 'Must have HIGH confidence for grounded legal answer');
  console.log('✓ Passed\n');

  // Test 7: Genuine legal question - "Mehnat shartnomasida sinov muddati qancha bo'lishi mumkin?"
  console.log('Test 7: Genuine legal query - "Mehnat shartnomasida sinov muddati qancha bo\'lishi mumkin?"');
  const res7 = await generateLegalAdvice({ message: "Mehnat shartnomasida sinov muddati qancha bo'lishi mumkin?" });
  assert(res7.sourceArticle && res7.sourceArticle.includes("Mehnat kodeksi"), 'Must cite Mehnat kodeksi for probation period');
  assert(res7.citations.length >= 1, 'Must have citations');
  console.log('✓ Passed\n');

  console.log('ALL TESTS PASSED SUCCESSFULLY!');
}

runTestSuite().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
