import 'dotenv/config';
import { generateLegalAdvice } from '../services/aiService.js';

async function run15ScenarioTests() {
  console.log('================================================================');
  console.log('ADVOKATAI 15+ LEGAL SCENARIOS VERIFICATION SUITE');
  console.log('================================================================\n');

  const tests = [
    // TEST 0: USER SCREENSHOT BUG ("Nimalar qila olasan")
    {
      id: 0,
      query: "Nimalar qila olasan",
      desc: "Everyday/Capability query (Zero citation pills, Zero sources)",
      verify: (res) => {
        const ok = res.intent === 'ABOUT_PRODUCT' &&
                   res.citations.length === 0 &&
                   res.sources.length === 0 &&
                   res.sourceArticle === null &&
                   res.text.includes('AdvokatAI') &&
                   !res.text.toLowerCase().includes('115-modda');
        return { ok, reason: `Citations: ${res.citations.length}, Sources: ${res.sources.length}, Text preview: ${res.text.substring(0, 60)}...` };
      }
    },

    // TEST 1: Bare Unpaid Salary ("Ish beruvchi oylikni to'lamayapti")
    {
      id: 1,
      query: "Ish beruvchi oylikni to'lamayapti",
      desc: "Individual labor dispute: Bare unpaid salary (Progressive clarification, 0 citations, NOT 500-word essay)",
      verify: (res) => {
        const ok = res.needs_clarification === true &&
                   res.citations.length === 0 &&
                   (res.text.includes('oydan beri') || res.text.includes('shartnoma'));
        return { ok, reason: `NeedsClarification: ${res.needs_clarification}, Citations: ${res.citations.length}, Text: ${res.text.substring(0, 60)}...` };
      }
    },

    // TEST 2: Delayed Salary ("Oyligim 2 oy bo'ldi berilmayapti")
    {
      id: 2,
      query: "Oyligim 2 oy bo'ldi berilmayapti",
      desc: "Individual labor dispute: Delayed salary (Labor Code 253)",
      verify: (res) => {
        const lower = (res.text + ' ' + (res.sourceArticle || '')).toLowerCase();
        const ok = (lower.includes('mehnat') || res.law_group === 'labor_code') &&
                   (lower.includes('253') || lower.includes('ish haqi'));
        return { ok, reason: `Article: ${res.sourceArticle}, Citations: ${res.citations.length}` };
      }
    },

    // TEST 3: Ambiguous Complaint ("Shikoyat ariza yozish tartibi")
    {
      id: 3,
      query: "Shikoyat ariza yozish tartibi",
      desc: "Ambiguous complaint: Must ask 1 concise clarification, 0 citations, NO Labor Code 571",
      verify: (res) => {
        const lower = res.text.toLowerCase();
        const ok = res.needs_clarification === true &&
                   res.citations.length === 0 &&
                   res.sources.length === 0 &&
                   !lower.includes('571-modda') &&
                   !lower.includes('575-modda') &&
                   lower.includes('ish beruvchiga') &&
                   lower.includes('davlat organiga');
        return { ok, reason: `Needs Clarification: ${res.needs_clarification}, Citations: ${res.citations.length}, Clarifying question: "${res.text}"` };
      }
    },

    // TEST 4: Government Complaint ("Davlat organiga shikoyat qilmoqchiman")
    {
      id: 4,
      query: "Davlat organiga shikoyat qilmoqchiman",
      desc: "Complaint to state body (NOT Labor Code 571/575)",
      verify: (res) => {
        const lower = (res.text + ' ' + (res.sourceArticle || '')).toLowerCase();
        const ok = !lower.includes('571-modda') &&
                   !lower.includes('575-modda') &&
                   (lower.includes('murojaat') || lower.includes('davlat') || lower.includes('shikoyat') || lower.includes('maʼmuriy') || lower.includes('sud'));
        return { ok, reason: `Article: ${res.sourceArticle}, Text preview: ${res.text.substring(0, 80)}...` };
      }
    },

    // TEST 5: Ambiguous Administrative Fine ("Ma'muriy jarimadan shikoyat qilish")
    {
      id: 5,
      query: "Ma'muriy jarimadan shikoyat qilish",
      desc: "Ambiguous fine: Must ask which organ issued it, 0 citations, NOT Labor Inspector 537",
      verify: (res) => {
        const lower = res.text.toLowerCase();
        const ok = res.needs_clarification === true &&
                   res.citations.length === 0 &&
                   res.sources.length === 0 &&
                   !lower.includes('537-modda') &&
                   lower.includes('qaysi organ');
        return { ok, reason: `Needs Clarification: ${res.needs_clarification}, Citations: ${res.citations.length}, Question: "${res.text}"` };
      }
    },

    // TEST 6: Challenge State Labor Inspector ("Mehnat inspektorining qaroridan norozi bo'ldim")
    {
      id: 6,
      query: "Mehnat inspektorining qaroridan norozi bo'ldim",
      desc: "State Labor Inspector Challenge: Labor Code 537, Hotline 1176",
      verify: (res) => {
        const lower = (res.text + ' ' + (res.sourceArticle || '')).toLowerCase();
        const ok = lower.includes('537') &&
                   (lower.includes('1176') || lower.includes('inspektor') || lower.includes('mehnat'));
        return { ok, reason: `Article: ${res.sourceArticle}, Citations: ${res.citations.length}` };
      }
    },

    // TEST 7: Ambiguous Tenancy ("Ijara huquqlari va kvartira nizosi")
    {
      id: 7,
      query: "Ijara huquqlari va kvartira nizosi",
      desc: "Broad rental dispute: Must ask clarification on dispute type, 0 citations, NOT forced 551",
      verify: (res) => {
        const lower = res.text.toLowerCase();
        const ok = res.needs_clarification === true &&
                   res.citations.length === 0 &&
                   res.sources.length === 0 &&
                   (lower.includes('depozit') || lower.includes('chiqarib') || lower.includes('to‘lov'));
        return { ok, reason: `Needs Clarification: ${res.needs_clarification}, Citations: ${res.citations.length}, Question: "${res.text}"` };
      }
    },

    // TEST 8: Tenancy Eviction ("Uy egasi meni kvartiradan chiqarib yubormoqchi")
    {
      id: 8,
      query: "Uy egasi meni kvartiradan chiqarib yubormoqchi",
      desc: "Specific tenancy eviction: Civil Code 615/551, eviction only via court",
      verify: (res) => {
        const lower = (res.text + ' ' + (res.sourceArticle || '')).toLowerCase();
        const ok = (lower.includes('fuqarolik') || lower.includes('615') || lower.includes('551') || lower.includes('sud')) &&
                   !lower.includes('mehnat kodeksi');
        return { ok, reason: `Article: ${res.sourceArticle}, Citations: ${res.citations.length}` };
      }
    },

    // TEST 9: Tenancy Deposit ("Uy egasi depozitni qaytarmayapti")
    {
      id: 9,
      query: "Uy egasi depozitni qaytarmayapti",
      desc: "Specific tenancy deposit: Civil Code 544/382, obligations and deposit return",
      verify: (res) => {
        const lower = (res.text + ' ' + (res.sourceArticle || '')).toLowerCase();
        const ok = (lower.includes('fuqarolik') || lower.includes('544') || lower.includes('382') || lower.includes('depozit')) &&
                   !lower.includes('mehnat kodeksi');
        return { ok, reason: `Article: ${res.sourceArticle}, Citations: ${res.citations.length}` };
      }
    },

    // TEST 10: Bribery / Extortion ("Ish beruvchi pora so'rayapti")
    {
      id: 10,
      query: "Ish beruvchi pora so'rayapti",
      desc: "Criminal bribery: Criminal Code 210/211/212, Anti-Corruption Agency 1253, NEVER Labor Code 500!",
      verify: (res) => {
        const lower = (res.text + ' ' + (res.sourceArticle || '')).toLowerCase();
        const ok = (lower.includes('jinoyat') || res.law_group === 'criminal_code') &&
                   (lower.includes('210') || lower.includes('pora')) &&
                   !lower.includes('mehnat kodeksi, 500-modda') &&
                   !lower.includes('500-modda');
        return { ok, reason: `Article: ${res.sourceArticle}, Citations: ${res.citations.length}` };
      }
    },

    // TEST 11: Bribery Offense ("Pora berish jinoyatmi?")
    {
      id: 11,
      query: "Pora berish jinoyatmi?",
      desc: "Criminal Code 211 (Pora berish)",
      verify: (res) => {
        const lower = (res.text + ' ' + (res.sourceArticle || '')).toLowerCase();
        const ok = (lower.includes('jinoyat') || res.law_group === 'criminal_code') &&
                   (lower.includes('211') || lower.includes('pora berish'));
        return { ok, reason: `Article: ${res.sourceArticle}, Citations: ${res.citations.length}` };
      }
    },

    // TEST 12: Report Corruption ("Korrupsiya haqida qayerga xabar berish mumkin?")
    {
      id: 12,
      query: "Korrupsiya haqida qayerga xabar berish mumkin?",
      desc: "Anti-corruption reporting: Agency hotline 1253, Prosecutor 1007",
      verify: (res) => {
        const lower = res.text.toLowerCase();
        const ok = (lower.includes('1253') || lower.includes('1007') || lower.includes('korrupsiyaga qarshi') || lower.includes('prokuratura')) &&
                   !lower.includes('mehnat kodeksi, 500');
        return { ok, reason: `Text preview: ${res.text.substring(0, 100)}...` };
      }
    },

    // TEST 13: Unlawful Dismissal ("Meni ishdan noqonuniy bo'shatishdi")
    {
      id: 13,
      query: "Meni ishdan noqonuniy bo'shatishdi",
      desc: "Individual labor dispute: Wrongful termination (Labor Code 160/161/163)",
      verify: (res) => {
        const lower = (res.text + ' ' + (res.sourceArticle || '')).toLowerCase();
        const ok = (lower.includes('mehnat') || res.law_group === 'labor_code') &&
                   (lower.includes('160') || lower.includes('161') || lower.includes('163') || lower.includes('ishga tiklash'));
        return { ok, reason: `Article: ${res.sourceArticle}, Citations: ${res.citations.length}` };
      }
    },

    // TEST 14: Collective Strike ("Xodimlar hammamiz ish tashlamoqchimiz")
    {
      id: 14,
      query: "Xodimlar hammamiz ish tashlamoqchimiz",
      desc: "Collective labor dispute: Labor Code 571/575 (collective dispute and strike)",
      verify: (res) => {
        const lower = (res.text + ' ' + (res.sourceArticle || '')).toLowerCase();
        const ok = (lower.includes('mehnat') || res.law_group === 'labor_code') &&
                   (lower.includes('571') || lower.includes('575') || lower.includes('jamoaviy'));
        return { ok, reason: `Article: ${res.sourceArticle}, Citations: ${res.citations.length}` };
      }
    },

    // TEST 15: File Complaint to Labor Inspectorate ("Mehnat inspeksiyasiga shikoyat qilmoqchiman")
    {
      id: 15,
      query: "Mehnat inspeksiyasiga shikoyat qilmoqchiman",
      desc: "Filing complaint to Labor Inspectorate: Labor Code 535/537, Hotline 1176",
      verify: (res) => {
        const lower = (res.text + ' ' + (res.sourceArticle || '')).toLowerCase();
        const ok = (lower.includes('535') || lower.includes('537') || lower.includes('1176') || lower.includes('mehnat inspeksiyasi'));
        return { ok, reason: `Article: ${res.sourceArticle}, Citations: ${res.citations.length}` };
      }
    }
  ];

  let passed = 0;
  for (const t of tests) {
    console.log(`----------------------------------------------------------------`);
    console.log(`[TEST ${t.id}]: "${t.query}"`);
    console.log(`Description: ${t.desc}`);
    try {
      const res = await generateLegalAdvice({ message: t.query });
      const check = t.verify(res);
      if (check.ok) {
        console.log(`>>> RESULT: PASS [✓]`);
        console.log(`Details: ${check.reason}`);
        passed++;
      } else {
        console.error(`>>> RESULT: FAIL [✗]`);
        console.error(`Details: ${check.reason}`);
        console.error(`Intent: ${res.intent}, NeedsClarification: ${res.needs_clarification}`);
        console.error(`Response Text:\n${res.text.substring(0, 200)}...\n`);
      }
    } catch (err) {
      console.error(`>>> RESULT: ERROR [✗]:`, err.message);
    }
  }

  console.log(`\n================================================================`);
  console.log(`FINAL RESULTS: ${passed} / ${tests.length} TESTS PASSED (${Math.round((passed / tests.length) * 100)}%)`);
  console.log(`================================================================\n`);

  if (passed === tests.length) {
    console.log('ALL 16 SCENARIOS PASSED WITH 100% LEGAL ACCURACY!');
  } else {
    process.exitCode = 1;
  }
}

run15ScenarioTests();
