import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ragService } from '../services/ragService.js';
import { queryUnderstandingService } from '../services/queryUnderstandingService.js';
import { generateLegalAdvice, sanitizeResponseText } from '../services/aiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('====================================================');
  console.log(' ADVOKATAI LEGAL KNOWLEDGE BASE & FAQ VERIFICATION ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(` [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Check Database File & Categories
  const dbPath = path.join(__dirname, '../data/lawArticlesDatabase.json');
  assert(fs.existsSync(dbPath), 'lawArticlesDatabase.json exists');

  const articles = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  assert(articles.length >= 1400, `Database contains ${articles.length} articles (>= 1400 required)`);

  const idSet = new Set();
  let duplicateCount = 0;
  let missingRequiredFields = 0;

  for (const art of articles) {
    if (idSet.has(art.id)) {
      duplicateCount++;
    }
    idSet.add(art.id);

    if (!art.id || !art.title || !art.short_description || !art.article_number || !art.category || !art.subcategory || !art.content || !art.source) {
      missingRequiredFields++;
    }
  }

  assert(duplicateCount === 0, `No duplicate article IDs found (duplicates: ${duplicateCount})`);
  assert(missingRequiredFields === 0, `All articles have 100% required fields (missing: ${missingRequiredFields})`);

  // Verify all 20 categories are represented
  const EXPECTED_CATEGORIES = [
    'Konstitutsiyaviy huquq',
    'Fuqarolik huquqi',
    'Mehnat huquqi',
    'Oila huquqi',
    'Uy-joy huquqi',
    'Yer huquqi',
    'Iste’molchilar huquqlari',
    'Ma’muriy huquq',
    'Jinoyat huquqi',
    'Jinoyat-protsessual huquq',
    'Fuqarolik protsessual huquqi',
    'Soliq huquqi',
    'Tadbirkorlik huquqi',
    'Moliya va bank huquqi',
    'Transport huquqi',
    'Intellektual mulk',
    'Ekologiya huquqi',
    'Meros huquqi',
    'Sud va protsessual masalalar',
    'Boshqa huquqiy masalalar'
  ];

  const categoryCounts = {};
  for (const art of articles) {
    categoryCounts[art.category] = (categoryCounts[art.category] || 0) + 1;
  }

  console.log('\nCategory Distribution:');
  for (const cat of EXPECTED_CATEGORIES) {
    const count = categoryCounts[cat] || 0;
    console.log(`  - ${cat}: ${count} ta modda`);
    assert(count > 0, `Category "${cat}" has articles (${count})`);
  }

  // Check Constitution articles count
  const constCount = categoryCounts['Konstitutsiyaviy huquq'] || 0;
  assert(constCount === 155, `Konstitutsiya contains all 155 articles (got ${constCount})`);

  // 2. Test the 12 Mandatory Legal Search Queries
  console.log('\n--- Testing 12 Mandatory Legal Search Queries ---');
  const queriesToTest = [
    { query: 'aliment', expectedCategory: 'Oila huquqi' },
    { query: 'ishdan bo‘shatish', expectedCategory: 'Mehnat huquqi' },
    { query: 'mehnat shartnomasi', expectedCategory: 'Mehnat huquqi' },
    { query: 'ijara shartnomasi', expectedCategory: 'Fuqarolik huquqi' },
    { query: 'qarzdorlik', expectedCategory: 'Fuqarolik huquqi' },
    { query: 'meros', expectedCategory: 'Meros huquqi' },
    { query: 'nikoh', expectedCategory: 'Oila huquqi' },
    { query: 'ajrashish', expectedCategory: 'Oila huquqi' },
    { query: 'jinoyat', expectedCategory: 'Jinoyat huquqi' },
    { query: 'yo‘l harakati', expectedCategory: 'Transport huquqi' },
    { query: 'soliq', expectedCategory: 'Soliq huquqi' },
    { query: 'tadbirkorlik', expectedCategory: 'Tadbirkorlik huquqi' },
  ];

  for (const item of queriesToTest) {
    const res = ragService.searchSubstantiveAndProcedural(item.query, { topK: 5 });
    const results = res.articles || [];
    const hasResults = results.length > 0;
    assert(hasResults, `Query "${item.query}" returned ${results.length} result(s)`);
    if (hasResults) {
      const top = results[0];
      console.log(`    -> Top match: [${top.category}] ${top.article_number || top.article}: ${top.title || top.article_title} (Score: ${top.relevance_score || top.retrieval_score})`);
      const matchedExpected = results.some(r => 
        r.category === item.expectedCategory || 
        (item.expectedCategory === 'Transport huquqi' && (r.category === 'Transport huquqi' || r.category === 'Ma’muriy huquq')) ||
        (item.expectedCategory === 'Fuqarolik huquqi' && (r.category === 'Fuqarolik huquqi' || r.category === 'Moliya va bank huquqi' || r.category === 'Uy-joy huquqi'))
      );
      assert(matchedExpected, `Query "${item.query}" found matches in expected category (${item.expectedCategory})`);
    }
  }

  // 3. Test FAQ and AI Advocate Inquiry Pre-check
  console.log('\n--- Testing FAQ & Advocate Inquiry Query Understanding ---');
  const faqQuery = 'AdvokatAI mening advokatim bo‘la oladimi?';
  const intentResult = queryUnderstandingService.classifyIntent(faqQuery);
  assert(intentResult.intent === 'ADVOCATE_IDENTITY_FAQ', `FAQ query classified as ADVOCATE_IDENTITY_FAQ (got: ${intentResult.intent})`);
  assert(intentResult.directResponse && intentResult.directResponse.startsWith('Yo‘q. AdvokatAI inson advokat emas'), 'FAQ direct response starts with "Yo‘q. AdvokatAI inson advokat emas..."');
  assert(intentResult.requiresRetrieval === false, 'FAQ query does not require legal retrieval (requiresRetrieval = false)');

  // Test full chatbot pipeline response for FAQ
  const botReply = await generateLegalAdvice({ message: faqQuery });
  assert(botReply.text && botReply.text.startsWith('Yo‘q. AdvokatAI inson advokat emas'), 'Full bot pipeline returns mandated FAQ answer');
  assert(botReply.citations.length === 0, `Full bot pipeline returns 0 citations (actual: ${botReply.citations.length})`);
  assert(botReply.sources.length === 0, `Full bot pipeline returns 0 sources (actual: ${botReply.sources.length})`);

  // 4. Test Negative Safety Constraints in AI Service
  console.log('\n--- Testing 4 Negative Safety Constraints Sanitizer ---');
  const unsafeText = 'Men sizning advokatingizman va men sudda sizni himoya qilaman. Bu hujjat 100% qonuniy kuchga ega va siz albatta yutasiz.';
  const sanitized = sanitizeResponseText(unsafeText);
  assert(!sanitized.includes('Men sizning advokatingizman'), 'Sanitized: "Men sizning advokatingizman" was removed');
  assert(!sanitized.includes('men sudda sizni himoya qilaman'), 'Sanitized: "men sudda sizni himoya qilaman" was removed');
  assert(!sanitized.includes('100% qonuniy kuchga ega'), 'Sanitized: "100% qonuniy kuchga ega" was removed');
  assert(!sanitized.includes('albatta yutasiz'), 'Sanitized: "albatta yutasiz" was removed');

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed with unhandled error:', err);
  process.exit(1);
});
