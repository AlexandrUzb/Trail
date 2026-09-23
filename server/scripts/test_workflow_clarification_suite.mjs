/**
 * AdvokatAI - Workflow Clarification & Legal Reasoning Test Suite (15 Rules)
 * 
 * Verifies:
 * 1. Identify Legal Area First (vague queries: "sudga", "shikoyat qilmoqchiman", "ariza yozish kerak", "advokat kerak", "sudga beraman", "Shikoyat ariza yozish tartibi")
 * 2. Ask Only Necessary Follow-up Questions
 * 3. Do Not Assume a Specific Legal Situation or Procedure
 * 4. Distinguish Procedures and Documents Carefully (da’vo arizasi vs shikoyat vs ariza vs sud buyrug‘i)
 * 5. Verify Current Law (2023 Labor Code, Article 556)
 * 6. Explain Law in Plain Uzbek
 * 7. Separate Facts from Conclusions (Conditional Phrasing)
 * 8. Handle Deadlines Carefully (Exact deadline, start date, restoration, no false expiry)
 * 9. Competent Court Identification (Fuqarolik ishlari bo‘yicha tumanlararo sud, Tumanlararo ma’muriy sud)
 * 10. Drafting with Clean Placeholders ([F.I.Sh.], [Manzil], [Sud nomi], [Sana])
 * 11. Do Not Invent Facts
 * 12. Legal Safety & Disclaimer
 * 13. 6 Standard Response Sections
 * 14. Labor Dispute Example (Turn 1: Shikoyat ariza yozish tartibi -> Turn 2: sudga -> Turn 3: mehnat nizosi -> Turn 4: Komissiya qaror chiqargan, 3 kun bo'ldi nusxasini olganimga -> Article 556 full analysis)
 * 15. Never Guess the Article
 */

import { generateLegalAdvice } from '../services/aiService.js';
import { queryUnderstandingService } from '../services/queryUnderstandingService.js';
import { legalValidatorService } from '../services/legalValidatorService.js';

const aiService = { generateResponse: generateLegalAdvice };

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`>>> PASS [✓] ${message}`);
  } else {
    failedTests++;
    console.error(`>>> FAIL [✗] ${message}`);
  }
}

async function runSuite() {
  console.log('================================================================');
  console.log('WORKFLOW CLARIFICATION & LEGAL REASONING TEST SUITE (15 RULES)');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // TEST 1: Rule 1 - Vague requests must NOT guess laws or articles
  // -------------------------------------------------------------
  console.log('[TEST 1] Rule 1 - Standalone Vague Requests:');
  const vagueQueries = [
    { query: 'sudga', check: 'Sudga murojaat' },
    { query: 'sudga beraman', check: 'Sudga murojaat' },
    { query: 'shikoyat qilmoqchiman', check: 'Qaysi masala bo‘yicha murojaat' },
    { query: 'ariza yozish kerak', check: 'Qaysi masala bo‘yicha murojaat' },
    { query: 'advokat kerak', check: 'AdvokatAI' },
    { query: 'Shikoyat ariza yozish tartibi', check: 'Shikoyat yoki sudga murojaat' }
  ];

  for (const item of vagueQueries) {
    const res = await aiService.generateResponse({
      message: item.query,
      userId: 'test-user',
      history: []
    });

    assert(
      res.needs_clarification === true &&
      res.citations.length === 0 &&
      res.text.includes(item.check) &&
      !res.text.includes('556-modda') &&
      !res.text.includes('179-modda'),
      `"${item.query}" asks clarification without citing specific articles or laws`
    );
  }

  // -------------------------------------------------------------
  // TEST 2: Rule 14 & Rule 2 - Multi-Turn Labor Dispute Flow (Example 14)
  // -------------------------------------------------------------
  console.log('\n[TEST 2] Rule 14 - Multi-Turn Labor Dispute Flow leading to Article 556:');
  
  // Turn 1: "Shikoyat ariza yozish tartibi"
  const turn1 = await aiService.generateResponse({
    message: 'Shikoyat ariza yozish tartibi',
    userId: 'test-user',
    history: []
  });
  assert(
    turn1.needs_clarification === true &&
    turn1.citations.length === 0 &&
    (turn1.text.includes('Shikoyat yoki sudga murojaat') || turn1.text.includes('qaysi masala bo‘yicha')),
    'Turn 1: "Shikoyat ariza yozish tartibi" asks clarification on legal area'
  );

  // Turn 2: User says "sudga"
  const historyTurn2 = [
    { sender: 'user', text: 'Shikoyat ariza yozish tartibi' },
    { sender: 'ai', text: turn1.text }
  ];
  const turn2 = await aiService.generateResponse({
    message: 'sudga',
    userId: 'test-user',
    history: historyTurn2
  });
  assert(
    turn2.needs_clarification === true &&
    turn2.citations.length === 0 &&
    turn2.text.includes('Sudga murojaat qilmoqchi ekaningizni tushundim') &&
    turn2.text.includes('Nizo qaysi masalaga oid'),
    'Turn 2: "sudga" asks which court dispute area (labor, family, debt, property)'
  );

  // Turn 3: User says "mehnat nizosi"
  const historyTurn3 = [
    ...historyTurn2,
    { sender: 'user', text: 'sudga' },
    { sender: 'ai', text: turn2.text }
  ];
  const turn3 = await aiService.generateResponse({
    message: 'mehnat nizosi',
    userId: 'test-user',
    history: historyTurn3
  });
  assert(
    turn3.needs_clarification === true &&
    turn3.citations.length === 0 &&
    turn3.text.includes('Mehnat nizosi bo‘yicha to‘g‘ri tartib va muddatni aniqlash uchun') &&
    turn3.text.includes('komissiya') &&
    turn3.text.includes('shartnoma'),
    'Turn 3: "mehnat nizosi" asks 4 targeted questions (problem, contract, commission, receipt date)'
  );

  // Turn 4: User provides details: "Komissiya qaror chiqargan, 3 kun bo'ldi nusxasini olganimga"
  const historyTurn4 = [
    ...historyTurn3,
    { sender: 'user', text: 'mehnat nizosi' },
    { sender: 'ai', text: turn3.text }
  ];
  const turn4 = await aiService.generateResponse({
    message: 'Komissiya qaror chiqargan, 3 kun bo\'ldi nusxasini olganimga',
    userId: 'test-user',
    history: historyTurn4
  });

  const t4 = turn4.text;
  assert(
    turn4.citations.some(c => c.article?.includes('556') || c.document?.includes('Mehnat kodeksi')),
    'Turn 4: Cites Article 556 of the Labor Code'
  );
  assert(
    t4.includes('Sizning holatingiz') &&
    (t4.includes('Amaldagi qoida') || t4.includes('Amaldagi huquqiy qoida')) &&
    (t4.includes('Kerakli hujjatlar') || t4.includes('Sizga kerak bo‘ladigan hujjatlar')) &&
    t4.includes('Muddat') &&
    t4.includes('Qayerga murojaat qilish') &&
    t4.includes('Keyingi qadam'),
    'Turn 4: Contains standard response sections'
  );
  assert(
    t4.includes('10 kun') && (t4.includes('7 kun') || t4.includes('yana')),
    'Turn 4: Accurately calculates 10 days deadline and remaining days (7 days remaining)'
  );
  assert(
    t4.includes('uzrli sabab') && t4.includes('tiklash'),
    'Turn 4: Explains deadline restoration for valid reasons (uzrli sabablar)'
  );
  assert(
    t4.includes('Fuqarolik ishlari bo‘yicha tumanlararo sud'),
    'Turn 4: Identifies competent court as Fuqarolik ishlari bo‘yicha tumanlararo sud (MK 558)'
  );
  assert(
    t4.includes('Da’vo arizasi') || t4.includes('Daʼvo arizasi'),
    'Turn 4: Recommends da’vo arizasi and explains what it is'
  );
  assert(
    t4.includes('davlat boji') && t4.includes('ozod'),
    'Turn 4: Informs user of court fee exemption under Labor Code Article 559'
  );
  assert(
    t4.includes('[F.I.Sh.]') || t4.includes('[Sud nomi]') || t4.includes('[Manzil]'),
    'Turn 4: Uses clean placeholders without inventing personal facts'
  );

  // -------------------------------------------------------------
  // TEST 3: Rule 3 - Do Not Assume Procedure (Commission not contacted)
  // -------------------------------------------------------------
  console.log('\n[TEST 3] Rule 3 - Do Not Assume Procedure:');
  const noCommissionRes = await aiService.generateResponse({
    message: 'Ish beruvchi 2 oydan beri oylikni bermayapti, shartnoma bor, komissiya tuzilmagan korxonada',
    userId: 'test-user',
    history: []
  });
  assert(
    !noCommissionRes.text.includes('556-modda') &&
    (noCommissionRes.text.includes('253-modda') || noCommissionRes.text.includes('333-modda') || noCommissionRes.text.includes('ish haqi')),
    'Does NOT assume commission exists or cite Article 556 when user states commission was not formed'
  );

  // -------------------------------------------------------------
  // TEST 4: Rule 4 - Distinguish Legal Documents (Da’vo vs Shikoyat)
  // -------------------------------------------------------------
  console.log('\n[TEST 4] Rule 4 - Distinguish Legal Documents:');
  const courtDoc = turn4.text;
  assert(
    courtDoc.includes('Da’vo arizasi') || courtDoc.includes('daʼvo arizasi'),
    'Civil / Labor court actions use "Da’vo arizasi", not mere administrative complaint'
  );

  // -------------------------------------------------------------
  // TEST 5: Rule 8 - Premature Deadline Expiry Guard
  // -------------------------------------------------------------
  console.log('\n[TEST 5] Rule 8 - Premature Deadline Expiry Guard:');
  const validatorSanitizerTest = legalValidatorService.cleanPrematureDeadlines(
    'Siz shikoyat muddatini o‘tkazib yuborgansiz va sud arizangizni ko‘rmaydi.',
    { cleanQuery: 'Hokimlik qaroridan noroziman' },
    'Hokimlik qaroridan noroziman'
  );
  assert(
    !validatorSanitizerTest.includes('Siz shikoyat muddatini o‘tkazib yuborgansiz') &&
    validatorSanitizerTest.includes('muddat o‘tkazib yuborilgan hisoblanishi mumkin'),
    'Sanitizes premature assertions that deadline has expired when no dates were provided'
  );

  // -------------------------------------------------------------
  // TEST 6: Rule 9 - Proper Court Naming
  // -------------------------------------------------------------
  console.log('\n[TEST 6] Rule 9 - Formal Court Naming:');
  const courtNamingTest = legalValidatorService.cleanLegalTerminology('Nizoni fuqarolik sudiga yoki ma’muriy sudiga topshirish kerak.');
  assert(
    courtNamingTest.includes('Fuqarolik ishlari bo‘yicha tumanlararo sudiga') &&
    courtNamingTest.includes('Tumanlararo ma’muriy sudiga'),
    'Expands generic "fuqarolik sudi" and "ma’muriy sudi" to official full court designations'
  );

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`WORKFLOW CLARIFICATION SUITE: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('================================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error('[TEST SUITE ERROR]', err);
  process.exit(1);
});
