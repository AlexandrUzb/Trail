import { GoogleGenAI } from '@google/genai';
import { ragService, formatCleanMarkdownCitation } from './ragService.js';
import { queryUnderstandingService } from './queryUnderstandingService.js';
import { storageService } from './storageService.js';
import { OFFICIAL_INSTITUTIONS, getInstitutionBlock } from '../data/officialInstitutions.js';
import { legalValidatorService } from './legalValidatorService.js';

export const SYSTEM_INSTRUCTION = `
Siz "AdvokatAI" — O‘zbekiston Respublikasi amaldagi qonunchiligi bo‘yicha ixtisoslashgan, yuksak aniqlikdagi professional sun’iy intellekt huquqiy yordamchisisiz. Sizning maqsadingiz eng tez yoki eng uzun javob berish emas, balki foydalanuvchining ANIQ savoliga eng to‘g‘ri, amaldagi, faktlarga bog‘langan va amaliy foydali javob taqdim etishdir.
Siz rasmiy davlat organi emassiz, shuning uchun o‘zingizni "O‘zbekiston qonunchiligiga asoslangan AI huquqiy yordamchi" deb tanishtirasiz ("rasmiy huquqiy yordamchi" iborasini aslo ishlatmang).

ASOSIY PRINSIP:
NOT: MAVZU → KALIT SO‘Z → MODDA → UMUMIY INSHO.
DO:  XABAR → INTENTNI ANIQLASH → HUQUQIY SOHA → ANIQ MUAMMO → YETISHMAYOTGAN FAKTLAR → AMALDAGI QONUN → FAKTLARGA TATBIQ ETISH → AMALIY KEYINGI QADAM.

SIZNING QAT'IY DIREKTIVALARINGIZ (29 TA QOIDA):

1. MAVZUNI SAVOLDAN ANIQ AJRATISH (TOPIC ≠ QUESTION):
   - Foydalanuvchi shunchaki umumiy mavzu berganda ("Mehnat shartnomasi bo'yicha savol", "Pora va korrupsiya holatlari", "Ma'muriy jarimadan shikoyat qilish", "Ajrashish", "Qarz masalasi", "Meros", "Sudga murojaat") avtomatik ravishda to‘liq huquqiy tahlil yoki moddalar ro‘yxatini keltirmang.
   - Aynan qaysi jihati kerakligini aniqlashtiring.
   - Masalan: "Mehnat shartnomasi bo'yicha savol" -> "Albatta. Mehnat shartnomasi bo‘yicha aynan qaysi masala sizni qiziqtiryapti? Masalan: ishga qabul qilish yoki shartnoma tuzish, ish haqi, qo‘shimcha ish, boshqa ishga o‘tkazish, shartnomani o‘zgartirish, ishdan bo‘shatish, mehnat ta’tili yoki boshqa masala."

2. FOYDALANUVCHINING ANIQ SAVOLIGA JAVOB BERISH — BOSHQA MASALALARNI TAXMIN QILMASLIK:
   - "Mehnat shartnomasi bo'yicha savol" berilganda, qo‘shimcha ish, yengilroq ishga o‘tkazish yoki ishdan bo‘shatish deb taxmin qilmang. Foydalanuvchi aniq muammoni aytishini kuting.

3. BOSQICHMA-BOSQICH ANIQALASHTIRISH (PROGRESSIVE CLARIFICATION):
   - Bir vaqtda 10 ta savol bermang.
   - 1-qadam: Huquqiy sohani aniqlash.
   - 2-qadam: Aniq muammoni aniqlash.
   - 3-qadam: Qo‘llaniladigan qoidani belgilash uchun zarur bo‘lgan 1–3 ta faktni so‘rash.
   - 4-qadam: Huquqiy javob berish.
   - Masalan: "Meni boshqa lavozimga o'tkazishdi" -> "Bu o‘tkazish sizning roziligingiz bilan bo‘ldimi yoki ish beruvchi bir tomonlama amalga oshirdimi? Shuningdek, sizga bu haqda yozma buyruq yoki qo‘shimcha kelishuv berilganmi?"

4. ASOSSIZ RAVISHDA BIR NECHTA HUQUQIY MASALANI SANAB KETMASLIK:
   - "Qo‘shimcha ish, sog‘liq bo‘yicha boshqa ishga o‘tkazish, ish beruvchining tashabbusi bilan shartnomani o‘zgartirish..." kabi sun'iy ro'yxatlarni foydalanuvchi so'ramasa aslo keltirmang.
   - Buning o'rniga: "Bu masala mehnat shartnomasining qaysi jihatiga bog‘liq ekanini aniqlasak, tegishli tartibni tushuntiraman." deng.

5. FAKTLAR HUQUQIY TATBIQDAN OLDIN KELISHI SHART:
   - Faktlar yetarli bo'lmasdan turib darhol "Mehnat kodeksining 116-moddasiga ko'ra..." deb boshlamang. Avval nima yuz berganini aniqlang.

6. SHUNCHAKI MAVZUGA ALOQADOR BO‘LGANI UCHUN MODDANI ISHLATMANG:
   - Moddani faqat foydalanuvchi faktlari aynan shu moddaga mos kelgandagina keltiring. Tegishli emasligiga shubha bo'lsa, aniqlashtiring.

7. AMALDAGI QONUNCHILIK (LEX.UZ) TALABI:
   - Modda raqami, uning amaldagi tahriri, istisnolari va kuchga kirgan sanasini tekshiring. To'qima modda yoki havolalar keltirmang.

8. KERAK BO'LGANIDAN ORTIQCHA QONUN KELTIRMASLIK:
   - Maqsad maksimal modda sanash emas, aniqlik. Aniq qoidani keltiring, sodda tilda tushuntiring va faktlarga bog'lang.

9. QONUNNI FOYDALANUVCHINING FAKTLARIGA TO‘G‘RIDAN-TO‘G‘RI BOG‘LASH:
   Har bir to'liq javobda:
   - FAKT: "Sizning aytishingizcha..."
   - QONUN: "Amaldagi qonunchilikda..."
   - TATBIQ: "Sizning vaziyatingizda..."
   - KEYINGI QADAM: "Shu sababli hozir..."

10. JAVOB QAYSI FAKTGA BOG‘LIQ EKANINI TUSHUNTIRISH:
    - "Bu masalada javob sizning roziligingiz olingan-olinmaganiga bog‘liq."
    - "Jarima bo‘yicha tartib qarorni qaysi organ chiqarganiga bog‘liq."
    - "Mehnat nizosida muddat qaror nusxasi sizga qachon topshirilganiga bog‘liq."

11. ANIQ VA HUQUQIY AHAMIYATGA EGA SAVOLLAR BERISH:
    - Yaxshi: "Qarorni qaysi organ chiqargan?", "Bu vaqtinchalikmi yoki doimiymi?", "Buyruq nusxasi sizga berilganmi?"
    - Yomon: "Batafsilroq ma'lumot bering."

12. FOYDALANUVCHI AYTGAN MA’LUMOTLARNI QAYTA SO‘RAMASLIK:
    - Kontekstni saqlang, foydalanuvchi aytgan fakt, sana yoki organni qayta so'ramang.

13. JAVOB REJIMI MAVJUD MA’LUMOTGA BOG‘LIQ BO‘LISHI:
    - REJIM A (Faqat mavzu): Qaysi muammo ekanini so'rash.
    - REJIM B (Aniq savol, lekin fakt yetishmaydi): Hal qiluvchi 1-2 faktni so'rash.
    - REJIM C (Faktlar yetarli): To'liq asoslangan javob va amaliy harakat.
    - REJIM D (Hujjat so'rovi): Faktlarni yig'ib, [F.I.Sh.], [Manzil], [Sud/organ nomi] kabi joy egalari bilan andoza loyihasini berish.

14. HUJJAT LOYIHASINI TAYYORLASH QOIDASI:
    - Noaniq so'rovdan hujjat to'qimang. Nima ustidan shikoyat, kim chiqargan, sana, talab ma'lum bo'lgach loyiha bering.

15. PROTSEDURA VA YO‘LLARNING FARQINI TUSHUNTIRISH:
    - Shunchaki "Sudga yoki yuqoriga murojaat qiling" demang. Qaysi yo'l nimaga bog'liqligini ko'rsating.

16. SUD TURINI TAXMIN QILMASLIK:
    - Nizoning turi va qonunga qarab fuqarolik sudi yoki ma'muriy sudni aniq belgilang.

17. MUDDATLAR UCHUN ANIQ SANA TALABI:
    - Aniq sana bo'lmasa, "muddat o'tgan" demang: "Muddatni aniq hisoblash uchun qaror nusxasi sizga qachon topshirilganini bilish kerak." deng.

18. YUQORI XAVFLI JINOIY VA KORRUPSIYA MASALALARI:
    - Hech kimni foydalanuvchi so'zi bilan aybdor deb e'lon qilmang.
    - "Bu JK X-moddasi bo'yicha jinoyat" demang: "Ta’riflagan holatingiz, agar ko‘rsatilgan faktlar tasdiqlansa, JKning X-moddasida nazarda tutilgan qilmish alomatlariga mos kelishi mumkin. Aniq kvalifikatsiyani vakolatli organ belgilaydi."
    - Mutlaq "Siz javobgarlikdan ozod qilinasiz" deb va'da bermang (JK 211 4-qism shartlarini eslating).
    - "Bu audio jinoyatni to'liq isbotlaydi" demang (qonuniy olingani va maqbulligiga bog'liq).

19. VAKOLATLI ORGAN HUQUQIY SOHAGA QAT'IY MOS BO'LISHI SHART (DOMAIN-AUTHORITY MATCHING):
    - Har qanday davlat organini shunchaki tizimda borligi uchun tavsiya qilmang.
    - QAT'IY QOIDA: Ijara, kvartira, uy-joy, qarz yoki boshqa fuqarolik shartnomalari bo‘yicha nizolarda Davlat mehnat inspeksiyasini (1176) ASLO tavsiya qilmang!
    - Ijara nizosi (ijarachi vs uy egasi) — bu fuqarolik-huquqiy munosabatdir. Murojaat yo‘li: o‘zaro yozma bildirishnoma/ogohlantirish, nizo kelishuv orqali hal bo‘lmasa — Fuqarolik ishlari bo‘yicha tumanlararo sudi.
    - Mehnat organlari (1176) faqat va faqat xodim va ish beruvchi o‘rtasidagi mehnat munosabatlariga taalluqlidir.

20. SHARTNOMA NIZOLARIDA SHARTNOMA BIRLAMCHI TAHLIL QILINADI (CONTRACT-FIRST):
    - Ijara, xizmat ko‘rsatish, qarz kabi shartnomalarda avval shartnoma bandlari (muddatidan oldin bekor qilish sharti, ogohlantirish muddati) aniqlanadi, so‘ngra qonunning dispozitiv yoki imperativ normalari tatbiq etiladi.

21. "RASMIY DAVLAT XIZMATI" EMASLIGINI BILISH:
    - O'zingizni "O‘zbekiston qonunchiligiga asoslangan AI huquqiy yordamchi" deb yuriting.

22. SUBYEKTIV "ISHONCH DARAJASI" BADJLARINI CHIQARMASLIK:
    - "Ishonch darajasi: Yuqori" deb sun'iy baho qo'ymang. Cheklovni ochiq ayting: "Ushbu javob siz taqdim etgan ma’lumotlarga asoslangan. Aniq huquqiy baho uchun hujjat va qo‘shimcha holatlar kerak."

22. TABIIY, AQLLI HUQUQIY SUHBAT USLUBI:
    - Darslik yoki qonunlar to'plami kabi gapirmang, jonli huquqiy muloqot qiling.

23. TO‘LIQ HUQUQIY JAVOB UCHUN STANDART 5 TA BO‘LIM:
    ### Sizning holatingiz
    Foydalanuvchi ma'lumotlarining 1-2 jumlada lo'nda bayoni.

    ### Huquqiy qoida
    Tegishli amaldagi qonun normasining sodda tildagi mazmuni.

    ### Sizning holatingizga tatbiqi
    Qonun foydalanuvchi holatiga aynan qanday bog'lanishi va nimalarga bog'liqligi.

    ### Nima qilish kerak
    Aniq va amaliy keyingi harakatlar.

    ### Huquqiy asos
    Faqat tegishli rasmiy qonun moddasi va Lex.uz havolasi.

24. KORRUPSIYA BO‘YICHA SO‘ROVLARDA ("Pora so'rashdi"):
    "Pulni kim so‘radi va uning lavozimi yoki vazifasi nima? Evaziga sizdan qanday harakat qilish yoki qilmaslik so‘ralgan? Pul amalda berildimi yoki faqat talab qilindimi?" deb aniqlashtiring.

25. BOSHQALIK VA LAVOZIM O‘TKAZISH SAVOLLARIDA:
    "Bu vaqtinchalik o‘tkazishmi yoki doimiymi? Sizga bu haqda buyruq yoki boshqa yozma hujjat berilganmi?" deb aniqlashtiring.

28. FAKTLAR NEKAYTLIGI:
    Foydalanuvchi da’vosi ≠ Tasdiqlangan fakt ≠ Huquqiy kvalifikatsiya ≠ Sudning yakuniy hukmi. Bularni hech qachon qorishtirmang.

29. JAVOB YUBORISHDAN OLDINGI ICHKI CHECKLIST:
    Aniq savolga javob berdimmi? Mavzuni savol deb adashtirmadimmi? Foydalanuvchi aytmagan faktni to'qimadimmi? Modda aynan shu holatga tatbiq etiladimi? Qonun amaldami? Faqat zarur savollarni berdimmi? Keyingi qadam aniqmi?
`.trim();

async function callGeminiWithRetry(ai, params, maxRetries = 2) {
  const models = [params.model || 'gemini-3.5-flash-lite', 'gemini-3.6-flash'];
  let lastErr = null;

  for (const modelName of models) {
    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        return await ai.models.generateContent({
          ...params,
          model: modelName
        });
      } catch (err) {
        lastErr = err;
        const errMsg = err?.message || String(err);
        const isTransient = errMsg.includes('503') || errMsg.includes('429') || errMsg.includes('high demand') || errMsg.includes('UNAVAILABLE');
        if (isTransient && attempt < maxRetries) {
          attempt++;
          const waitMs = attempt * 1000;
          console.warn(`[aiService] Gemini (${modelName}) transient error (${errMsg}). Retrying in ${waitMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitMs));
        } else {
          break; // try fallback model
        }
      }
    }
  }
  throw lastErr;
}

/**
 * Cleans duplicated or malformed markdown links in text.
 */
function cleanMalformedMarkdownLinks(text) {
  if (!text) return '';
  let cleaned = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)\[[^\]]*\]\(\2\)/g, '[$1]($2)');
  cleaned = cleaned.replace(/\[\[([^\]]+)\]\]\((https?:\/\/[^\)]+)\)/g, '[$1]($2)');
  return cleaned;
}

/**
 * Deduplicates repeated markdown links so each unique Lex.uz link is presented only once.
 * Earlier mentions are kept as clean plain anchor text, preserving the link at the final citation.
 */
function deduplicateMarkdownLinks(text) {
  if (!text) return '';
  const regex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
  const lastIndexMap = new Map();
  let m;
  let idx = 0;
  while ((m = regex.exec(text)) !== null) {
    lastIndexMap.set(m[2], idx);
    idx++;
  }

  if (idx <= 1) return text;

  let curIdx = 0;
  let cleaned = text.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, (fullMatch, anchor, url) => {
    const lastIdx = lastIndexMap.get(url);
    const isLast = (curIdx === lastIdx);
    curIdx++;
    if (!isLast) {
      return anchor;
    }
    return fullMatch;
  });

  // Clean raw duplicate URL immediately following a link: e.g. [Anchor](url) url or [Anchor](url) (url)
  cleaned = cleaned.replace(/(\[[^\]]+\]\((https?:\/\/[^\)]+)\))\s*\(\2\)/g, '$1');
  cleaned = cleaned.replace(/(\[[^\]]+\]\((https?:\/\/[^\)]+)\))\s*\2/g, '$1');

  return cleaned;
}

/**
 * Strips decorative emojis to maintain a professional legal tone.
 */
function cleanDecorativeEmojis(text) {
  if (!text) return '';
  return text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
             .replace(/[📌⚖️🏛️🔗✅❗]/g, '')
             .trim();
}

/**
 * Comprehensive sanitization pipeline:
 * - Strips decorative emojis
 * - Removes repeated greetings on multi-turn
 * - Removes repetitive closing filler
 * - Softens overconfident court predictions
 * - Normalizes bureaucratic vocabulary
 * - Deduplicates repeated Lex.uz links
 */
export function sanitizeResponseText(text, isMultiTurn, taskType) {
  if (!text) return '';
  let cleaned = text;

  // 1. Clean markdown links and emojis
  cleaned = cleanMalformedMarkdownLinks(cleaned);
  cleaned = deduplicateMarkdownLinks(cleaned);
  cleaned = cleanDecorativeEmojis(cleaned);

  // 2. Remove repeated greetings on multi-turn
  if (isMultiTurn) {
    cleaned = cleaned.replace(/^(Assalomu\s*alaykum[^\n]*\n+|Salom[^\n]*\n+)/gi, '');
    cleaned = cleaned.replace(/^(Men\s*AdvokatAI[^\n]*\n+)/gi, '');
    cleaned = cleaned.trim();
  }

  // 3. Remove generic repetitive closing filler
  cleaned = cleaned.replace(/\n+\s*(Agar\s+(qo['‘`]?shimcha|boshqa)\s+savollaringiz\s+bo['‘`]?lsa[^\n]*\.?)\s*$/gi, '');
  cleaned = cleaned.replace(/\n+\s*(Savollaringiz\s+bo['‘`]?lsa,?\s*marhamat[^\n]*\.?)\s*$/gi, '');
  cleaned = cleaned.replace(/\n+\s*(Yana\s+qandaydir\s+savollaringiz\s+bo['‘`]?lsa[^\n]*\.?)\s*$/gi, '');

  // 4. Strictly enforce legal-safety negative constraints (Prompt Requirement 9)
  cleaned = cleaned.replace(/Men\s+sizning\s+advokatingizman\.?/gi, 'Men huquqiy ma’lumot va tushuntirish berishga yordam beruvchi AI yordamchisiman.');
  cleaned = cleaned.replace(/Men\s+sudda\s+sizni\s+himoya\s+qilaman\.?/gi, 'Men sudda vakillik qila olmayman. Sudda professional himoya kerak bo‘lsa, malakali advokatga murojaat qilish tavsiya etiladi.');
  cleaned = cleaned.replace(/(Bu\s+hujjat\s+)?100%\s+qonuniy\s+kuchga\s+ega\.?/gi, 'Ushbu hujjat loyihasi bo‘lib, topshirishdan oldin uning holatingizga mosligini tekshiring.');
  cleaned = cleaned.replace(/Siz\s+(bu\s+ishni\s+)?albatta\s+yutasiz\.?/gi, 'Yakuniy natija taqdim etiladigan dalillar va vakolatli sud bahosiga bog‘liq.');
  cleaned = cleaned.replace(/Siz\s+100%\s+haqsiz/gi, 'Keltirilgan holatlar bo‘yicha talabingiz asosli bo‘lishi mumkin');
  cleaned = cleaned.replace(/Sud\s+buni\s+albatta\s+qanoatlantiradi/gi, 'Sud yakuniy qarorni taqdim etilgan dalillar asosida qabul qiladi');
  cleaned = cleaned.replace(/rasmiy\s+huquqiy\s+yordamchi/gi, 'huquqiy ma’lumot beruvchi AI yordamchisi');

  // 5. Natural language replacements & grammar fixes
  cleaned = cleaned.replace(/\bzararmis\?/gi, 'zararmi?');
  cleaned = cleaned.replace(/\buydan\s+chiqarib\s+yuborish\b/gi, 'uy-joydan chiqarish');
  cleaned = cleaned.replace(/\buydan\s+chiqarib\s+yubormoqchi\b/gi, 'uy-joydan chiqarmoqchi');
  cleaned = cleaned.replace(/\bmazkur\b/gi, 'bu');
  cleaned = cleaned.replace(/\byuqorida\s+qayd\s+etilgan\b/gi, 'yuqorida aytilgan');

  // 6. Generic filler, penalty generalization, accusatory phrasing, and evidence advice
  cleaned = legalValidatorService.cleanGenericFiller(cleaned);
  cleaned = legalValidatorService.cleanPenaltyGeneralizations(cleaned);
  cleaned = legalValidatorService.cleanAccusatoryPhrasing(cleaned);
  cleaned = legalValidatorService.cleanEvidenceAdvice(cleaned);

  return cleaned.trim();
}

/**
 * Composite Legal Confidence Model (Prompt 5, Section 4)
 * legal_confidence = source_authority + source_freshness + article_relevance + fact_completeness + version_match + claim_support
 * Scale: 0 to 100
 * Safe overrides: If zero authority, zero relevance, or missing articles, confidence is clamped to LOW (< 45).
 */
export function calculateCompositeLegalConfidence({
  retrievedArticles = [],
  scenario = {},
  intentResult = {},
  isGrounded = true,
  isDirectRoute = false,
  validatorResult = null
}) {
  if (isDirectRoute) {
    const isInterception = intentResult.intent === 'ADVERSARIAL_DEFENSE' || intentResult.intent === 'PROHIBITED_REQUEST';
    const isNonExistent = intentResult.intent === 'NON_EXISTENT_ARTICLE';
    const isContradiction = intentResult.intent === 'CONTRADICTORY_FACTS';

    if (isInterception) {
      return {
        score: 100,
        level: 'HIGH',
        breakdown: {
          source_authority: 25,
          source_freshness: 15,
          article_relevance: 25,
          fact_completeness: 15,
          version_match: 10,
          claim_support: 10
        }
      };
    }

    if (isNonExistent) {
      return {
        score: 35,
        level: 'LOW',
        breakdown: {
          source_authority: 0,
          source_freshness: 15,
          article_relevance: 0,
          fact_completeness: 10,
          version_match: 10,
          claim_support: 0
        }
      };
    }

    if (isContradiction) {
      return {
        score: 45,
        level: 'MEDIUM',
        breakdown: {
          source_authority: 10,
          source_freshness: 15,
          article_relevance: 10,
          fact_completeness: 5,
          version_match: 5,
          claim_support: 0
        }
      };
    }

    return {
      score: intentResult.confidence || 95,
      level: (intentResult.confidence && intentResult.confidence < 50) ? 'LOW' : 'HIGH',
      breakdown: null
    };
  }

  let source_authority = 0;   // 0 - 25
  let source_freshness = 0;   // 0 - 15
  let article_relevance = 0;  // 0 - 25
  let fact_completeness = 0;  // 0 - 15
  let version_match = 0;      // 0 - 10
  let claim_support = 0;      // 0 - 10

  // 1. Source Authority (0 - 25)
  if (retrievedArticles.length > 0) {
    const top = retrievedArticles[0];
    if (top.source_url && top.source_url.includes('lex.uz')) {
      source_authority = 25; // Primary statutory code via official Lex.uz
    } else if (top.source_url) {
      source_authority = 15;
    }
  }

  // 2. Source Freshness (0 - 15)
  if (retrievedArticles.length > 0) {
    const top = retrievedArticles[0];
    if (top.edition_year >= 2023 || top.is_current !== false) {
      source_freshness = 15; // Current active edition
    } else {
      source_freshness = 5;
    }
  }

  // 3. Article Relevance (0 - 25)
  if (retrievedArticles.length > 0) {
    const top = retrievedArticles[0];
    const score = top.relevance_score || top.retrieval_score || 0;
    if (score >= 30) article_relevance = 25;
    else if (score >= 20) article_relevance = 20;
    else if (score >= 10) article_relevance = 15;
    else if (score >= 3) article_relevance = 10;
    else article_relevance = 0;
  }

  // 4. Fact Completeness (0 - 15)
  const facts = scenario.facts || {};
  let factCount = Object.keys(facts).filter(k => facts[k] !== null && facts[k] !== undefined).length;
  if (scenario.userRole && scenario.userRole !== 'citizen') factCount++;
  if (scenario.disputeType) factCount++;
  if (factCount >= 3) fact_completeness = 15;
  else if (factCount >= 1) fact_completeness = 10;
  else fact_completeness = 5;

  // 5. Version Match (0 - 10)
  if (scenario.isHistorical) {
    version_match = 8;
  } else {
    version_match = 10;
  }

  // 6. Claim Support / Grounding (0 - 10)
  if (isGrounded && retrievedArticles.length > 0) {
    claim_support = 10;
  } else if (retrievedArticles.length > 0) {
    claim_support = 4;
  }

  let totalScore = source_authority + source_freshness + article_relevance + fact_completeness + version_match + claim_support;

  // Section K Rules & Clamping:
  // Rule 1: If critical facts are missing, confidence is strictly capped at MEDIUM (max 70)
  if (scenario.missingCriticalFacts && scenario.missingCriticalFacts.length > 0) {
    totalScore = Math.min(totalScore, 70);
  }

  // Rule 2: If ungrounded claim or zero authority/relevance/articles, clamp to LOW (< 45)
  if (!isGrounded || retrievedArticles.length === 0 || source_authority === 0 || article_relevance === 0) {
    totalScore = Math.min(totalScore, 35);
  }

  // Rule 3: If validator detected violations, apply penalty and clamp level
  if (validatorResult) {
    if (validatorResult.confidencePenalty > 0) {
      totalScore = Math.max(10, totalScore - validatorResult.confidencePenalty);
    }
    if (validatorResult.adjustedConfidenceLevel === 'LOW') {
      totalScore = Math.min(totalScore, 40);
    } else if (validatorResult.adjustedConfidenceLevel === 'MEDIUM') {
      totalScore = Math.min(totalScore, 70);
    }
  }

  const level = totalScore >= 75 ? 'HIGH' : totalScore >= 45 ? 'MEDIUM' : 'LOW';

  return {
    score: totalScore,
    level,
    breakdown: {
      source_authority,
      source_freshness,
      article_relevance,
      fact_completeness,
      version_match,
      claim_support
    }
  };
}

export async function generateLegalAdvice({ message, law_group = null, history = [], userId = 'anonymous' }) {
  const startTime = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;
  const isMultiTurn = Array.isArray(history) && history.length > 0;

  // STEP 1: Intent Classification, Safety Filtering & Pre-RAG Routing
  const intentResult = queryUnderstandingService.classifyIntent(message, history, { law_group });

  // Immediate non-retrieval responses (Fast, Zero Cost, and Strictly Zero Citation Pill)
  if (!intentResult.requiresRetrieval) {
    const latencyMs = Date.now() - startTime;
    const isInterception = intentResult.intent === 'ADVERSARIAL_DEFENSE' || intentResult.intent === 'PROHIBITED_REQUEST';
    const isNonExistent = intentResult.intent === 'NON_EXISTENT_ARTICLE';
    const isContradiction = intentResult.intent === 'CONTRADICTORY_FACTS';

    const compositeConfidence = calculateCompositeLegalConfidence({
      intentResult,
      isDirectRoute: true
    });

    storageService.logQuery({
      userId,
      message,
      intent: intentResult.intent,
      selectedLawGroup: law_group,
      detectedLawGroup: null,
      confidence: compositeConfidence.score,
      confidenceLevel: compositeConfidence.level,
      compositeConfidence,
      retrievedCount: 0,
      citationsCount: 0,
      fallbackUsed: {
        used: isInterception || isNonExistent || isContradiction,
        type: isInterception ? 'safety_refusal' : isNonExistent ? 'non_existent_article' : isContradiction ? 'contradiction_clarification' : 'intent_router'
      },
      safetyInterception: {
        intercepted: isInterception || isNonExistent,
        reason: intentResult.type || (isNonExistent ? 'non_existent_article' : null)
      },
      contradictionDetected: isContradiction,
      latencyMs,
      needsClarification: Boolean(intentResult.needsClarification),
      isError: false
    });

    const step1Result = {
      text: intentResult.directResponse,
      intent: intentResult.intent,
      law_group: law_group || 'auto',
      sources: [],
      sourceArticle: null,
      sourceUrl: null,
      citations: [],
      confidence: compositeConfidence.score,
      confidenceLevel: compositeConfidence.level,
      compositeConfidence,
      safety_interception: intentResult.type || null,
      needs_clarification: Boolean(intentResult.needsClarification),
      source: isInterception ? 'safety_guardrail' : isNonExistent ? 'non_existent_shield' : isContradiction ? 'contradiction_detector' : 'intent_router'
    };

    return legalValidatorService.finalizeAndValidateResponse(step1Result, {
      userQuery: message,
      scenario: { cleanQuery: message },
      history
    });
  }

  // STEP 2: Scenario Understanding & Legal Structuring
  const scenario = queryUnderstandingService.analyzeScenario(message, {
    selectedLawGroup: law_group,
    history,
    intentInfo: intentResult
  });

  // Safety Shield: Non-Existent Statutory Article Check on Resolved Scenario
  if (scenario.exactArticleNumber && scenario.targetDocumentId) {
    const nonExistent = queryUnderstandingService.checkNonExistentArticle(scenario.exactArticleNumber, scenario.targetDocumentId);
    if (nonExistent.isNonExistent) {
      const latencyMs = Date.now() - startTime;
      const compositeConfidence = {
        score: 35,
        level: 'LOW',
        breakdown: {
          source_authority: 0,
          source_freshness: 15,
          article_relevance: 0,
          fact_completeness: 10,
          version_match: 10,
          claim_support: 0
        }
      };

      storageService.logQuery({
        userId,
        message,
        intent: 'NON_EXISTENT_ARTICLE',
        selectedLawGroup: law_group,
        detectedLawGroup: scenario.targetDocumentId,
        confidence: 35,
        confidenceLevel: 'LOW',
        compositeConfidence,
        retrievedCount: 0,
        citationsCount: 0,
        fallbackUsed: { used: true, type: 'non_existent_article' },
        safetyInterception: { intercepted: true, reason: 'non_existent_article' },
        contradictionDetected: false,
        latencyMs,
        needsClarification: false,
        isError: false
      });

      const nonExistentResult = {
        text: nonExistent.directResponse,
        intent: 'NON_EXISTENT_ARTICLE',
        law_group: law_group || scenario.targetDocumentId || 'all',
        sources: [],
        sourceArticle: null,
        sourceUrl: null,
        citations: [],
        confidence: 35,
        confidenceLevel: 'LOW',
        compositeConfidence,
        safety_interception: 'non_existent_article',
        needs_clarification: false,
        source: 'non_existent_shield'
      };

      return legalValidatorService.finalizeAndValidateResponse(nonExistentResult, {
        userQuery: message,
        scenario,
        history
      });
    }
  }

  // STEP 2.5: Query Rewriting for High-Precision Retrieval
  const rewrittenQuery = queryUnderstandingService.rewriteQuery(message, intentResult, scenario);

  // STEP 3: Two-Channel Hybrid Retrieval (Substance + Procedure with Strict Code Isolation)
  const retrieval = ragService.searchSubstantiveAndProcedural(rewrittenQuery || scenario.cleanQuery, {
    lawGroup: law_group,
    documentId: scenario.targetDocumentId,
    exactArticleNumber: scenario.exactArticleNumber,
    targetArticleNumbers: scenario.targetArticleNumbers,
    allowedDocumentIds: scenario.allowedDocumentIds,
    disallowedDocumentIds: scenario.disallowedDocumentIds,
    forbiddenArticleNumbers: scenario.forbiddenArticleNumbers,
    fineGrainedTopic: scenario.fineGrainedTopic,
    jurisdictionRule: scenario.jurisdictionRule,
    proceduralRoute: scenario.proceduralRoute,
    disputeType: scenario.disputeType,
    additionalTerms: scenario.searchTerms,
    multiQueries: scenario.multiQueries,
    eventDate: scenario.eventDate,
    isCurrentOnly: !scenario.isHistorical,
    topK: intentResult.intent === 'SPECIFIC_ARTICLE' ? 1 : 2,
    minScore: 16
  });

  const retrievedArticles = retrieval.articles;
  const initialComposite = calculateCompositeLegalConfidence({
    retrievedArticles,
    scenario,
    intentResult,
    isGrounded: true
  });

  const confidenceScore = initialComposite.score;
  const confidenceLevel = initialComposite.level;

  // STEP 4: WEAK RETRIEVAL GUARDRAIL (Zero Hallucination)
  if (confidenceLevel === 'LOW' || retrievedArticles.length === 0 || (retrievedArticles[0]?.relevance_score || 0) < 20) {
    const fallbackMessage = "Rahmat. Ushbu savol bo‘yicha O‘zbekiston qonunchiligida bevosita qo‘llaniladigan norma topilmadi. Shu sababli faqat O‘zbekiston qonunchiligiga asoslangan aniq javob berib bo‘lmaydi.";

    const latencyMs = Date.now() - startTime;
    storageService.logQuery({
      userId,
      message,
      intent: 'LEGAL',
      selectedLawGroup: law_group,
      detectedLawGroup: scenario.targetDocumentId,
      confidence: confidenceScore,
      confidenceLevel: 'LOW',
      compositeConfidence: initialComposite,
      retrievedCount: 0,
      citationsCount: 0,
      fallbackUsed: { used: true, type: 'low_confidence_guardrail' },
      safetyInterception: { intercepted: false, reason: null },
      contradictionDetected: false,
      latencyMs,
      needsClarification: true,
      isError: false
    });

    const step4Result = {
      text: fallbackMessage,
      intent: 'LEGAL',
      law_group: law_group || scenario.targetDocumentId || 'all',
      sources: [],
      sourceArticle: null,
      sourceUrl: null,
      citations: [],
      confidence: confidenceScore,
      confidenceLevel: 'LOW',
      compositeConfidence: initialComposite,
      needs_clarification: true,
      source: 'low_confidence_guardrail'
    };

    return legalValidatorService.finalizeAndValidateResponse(step4Result, {
      userQuery: message,
      scenario,
      history
    });
  }

  // STEP 5: Fallback if Gemini API key not configured
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    const top = retrievedArticles[0];
    const validation = ragService.validateLegalCitation({
      document_id: top.document_id,
      document_name: top.document_name,
      article_number: top.article_number,
      article_title: top.article_title,
      relevant_issue: scenario.issues?.[0] || null,
      disputeType: scenario.disputeType,
      source_url: top.source_url
    });

    const validatorResult = legalValidatorService.validateResponse({
      text: top.content,
      scenario,
      supportedArticles: [top]
    });

    const offlineComposite = calculateCompositeLegalConfidence({
      retrievedArticles: [top],
      scenario,
      intentResult,
      isGrounded: validation.isValid,
      validatorResult
    });

    let proceduralInfo = '';
    if (scenario.disputeType === 'corruption_bribery' || scenario.fineGrainedTopic?.startsWith('bribery_')) {
      proceduralInfo = `\n\n**Murojaat uchun vakolatli organlar:**\n- Korrupsiyaga qarshi kurashish agentligi (Call-markaz: 1253)\n- Oʻzbekiston Respublikasi Bosh prokuraturasi (Ishonch telefoni: 1007)`;
    } else if (scenario.disputeType?.includes('labor') || scenario.fineGrainedTopic?.startsWith('labor_')) {
      proceduralInfo = `\n\n**Murojaat uchun vakolatli sud:** Fuqarolik ishlari bo‘yicha tumanlararo sud (xodimlar Mehnat kodeksi 559-moddasiga binoan davlat bojidan ozod)`;
    } else if (scenario.disputeType?.includes('administrative') || scenario.domain === 'administrative' || scenario.disputeType === 'government_authority_complaint' || scenario.fineGrainedTopic?.startsWith('admin_')) {
      proceduralInfo = `\n\n**Vakolatli organ:** Yuqori turuvchi organ/mansabdor shaxs yoki Tumanlararo ma’muriy sud (qaror ustidan 10 kun ichida)`;
    } else if (scenario.disputeType?.includes('tenancy') || scenario.domain === 'civil' || scenario.fineGrainedTopic?.startsWith('tenancy_')) {
      proceduralInfo = `\n\n**Vakolatli sud:** Fuqarolik ishlari bo‘yicha tumanlararo sudi (agar nizo fuqarolar o‘rtasida bo‘lsa va ixtiyoriy hal etilmasa)`;
    }

    let conditionNote = '';
    if (scenario.isConditionalReasoningRequired && scenario.missingCriticalFacts?.length > 0) {
      conditionNote = `\n\n**Muhim shartlar va istisnolar:**\nMazkur qoida amalda qo‘llanilishi uchun quyidagi holatlar aniqlashtirilishi lozim:\n${scenario.missingCriticalFacts.map(f => `- ${f}`).join('\n')}\nAgar ushbu shartlar bajarilmagan bo‘lsa, yakuniy huquqiy oqibat farq qilishi mumkin.`;
    }

    let directText = '';
    if (top.article_number === '556-modda' || top.article_number_digits === '556' || scenario.fineGrainedTopic === 'labor_commission_challenge') {
      const allMsgsText = (message + ' ' + (history.map(h => h.text || '').join(' '))).toLowerCase();
      const daysMatch = allMsgsText.match(/(\d+)\s*kun/i);
      const daysPassed = daysMatch ? parseInt(daysMatch[1], 10) : null;
      let deadlineText = '';
      if (daysPassed !== null && daysPassed <= 10) {
        const remaining = 10 - daysPassed;
        deadlineText = `Mehnat kodeksining 556-moddasiga ko‘ra, mehnat nizolari komissiyasining qarori ustidan sudga murojaat qilish muddati komissiya qarorining nusxasi topshirilgan kundan e’tiboran **10 kun**ni tashkil etadi. Sizda qaror nusxasi olinganiga ${daysPassed} kun bo‘lgani sababli, sudga murojaat qilish uchun yana **${remaining} kun** muddat mavjud.
*Eslatma:* Agar mazkur 10 kunlik muddat uzrli sabablarga ko‘ra (kasallik, oilaviy favqulodda holat va h.k.) o‘tkazib yuborilgan taqdirda ham, sud arizachining iltimosnomasiga asosan bu muddatni tiklashi mumkin. Qonunga ko‘ra, muddatning o‘tishi arizani qabul qilishni rad etish uchun asos bo‘lmaydi.`;
      } else if (daysPassed !== null && daysPassed > 10) {
        deadlineText = `Mehnat kodeksining 556-moddasiga muvofiq, komissiya qarori ustidan sudga shikoyat qilish muddati — qaror nusxasi topshirilgan kundan boshlab **10 kun**. Sizda ${daysPassed} kun o‘tgan bo‘lsa-da, agar muddat uzrli sabablar bilan o‘tkazib yuborilgan bo‘lsa, sud uni tiklashga haqli. Arizani qabul qilishni rad etishga yo‘l qo‘yilmaydi.`;
      } else {
        deadlineText = `Mehnat kodeksining 556-moddasiga ko‘ra, mehnat nizolari komissiyasi qarori ustidan sudga murojaat qilish muddati komissiya qarorining nusxasi xodimga rasman topshirilgan kundan e’tiboran **10 kun**dir. Ushbu muddat uzrli sabablar mavjud bo‘lganda sud tomonidan tiklanishi mumkin (muddat o‘tganligi arizani qabul qilishni rad etishga asos bo‘lmaydi).`;
      }

      directText = `### Sizning holatingiz
Ta’riflagan ma’lumotlaringizga ko‘ra, korxonadagi Mehnat nizolari komissiyasi (MNK) yakka tartibdagi mehnat nizosi bo‘yicha qaror chiqargan va siz ushbu qarordan norozisiz. Nizoni ko‘rib chiqishni sudga o‘tkazish huquqingiz mavjud.

### Amaldagi qoida
O‘zbekiston Respublikasi amaldagi Mehnat kodeksining 556-moddasiga binoan, yakka tartibdagi mehnat nizosini ko‘rib chiqish mehnat nizolari komissiyasining qarori ustidan xodim yoki ish beruvchi tomonidan berilgan ariza asosida sudga o‘tkazilishi mumkin. Shuningdek, agar komissiya mehnat nizosini o‘n kunlik muddatda ko‘rib chiqmagan bo‘lsa, xodim nizoni ko‘rib chiqishni to‘g‘ridan-to‘g‘ri sudga o‘tkazishga haqli.

### Sizga taalluqli tartib
Mehnat nizolari komissiyasining qaroridan norozi bo‘lgan taqdirda, nizo Fuqarolik ishlari bo‘yicha tumanlararo sudiga ko‘rib chiqish uchun o‘tkaziladi. Ish sud tomonidan yangidan, nizoning barcha holatlarini to‘liq o‘rganish orqali ko‘rib chiqiladi.

### Muddat
${deadlineText}

### Qayerga murojaat qilish
- **Vakolatli sud:** Mehnat kodeksining 558-moddasiga muvofiq, ishlar **Fuqarolik ishlari bo‘yicha tumanlararo sudiga** (odatda ish beruvchi joylashgan hududdagi sudga) taalluqlidir.
- **Davlat boji imtiyozi:** Mehnat kodeksining 559-moddasiga asosan, xodimlar mehnat munosabatlaridan kelib chiqadigan talablar bo‘yicha sudga murojaat qilganda davlat boji va sud xarajatlaridan **to‘liq ozod qilingan**.

### Kerakli hujjatlar
1. **Da’vo arizasi** (nusxalari bilan birga) — bu sudga o‘z buzilgan mehnat huquqlaringizni himoya qilishni so‘rab topshiriladigan rasmiy daʼvo hujjati;
2. Mehnat nizolari komissiyasi qarorining nusxasi;
3. Mehnat shartnomasi va ishga qabul qilish / lavozim buyruqlari nusxalari;
4. Ish bo‘yicha mavjud boshqa yozma dalillar (yozishmalar, hisob-kitob varaqalari, bildirishnomalar).

### Keyingi qadam
Fuqarolik ishlari bo‘yicha tumanlararo sudiga da’vo arizasini tayyorlash va ilova hujjatlar bilan birga shaxsan, pochta orqali yoki E-SUD portali orqali topshirish. Sudga taqdim etish uchun da’vo arizasining rasmiy loyihasini [F.I.Sh.], [Manzil], [Sud nomi] kabi aniq joy egalari bilan tayyorlab berishim mumkin.

### Huquqiy asos
[Mehnat kodeksi, 556-modda](${top.source_url || 'https://lex.uz/docs/6257288#6272583'})

*(Eslatma: Ushbu maʼlumot umumiy huquqiy axborot bo‘lib, sud amaliyoti va yakuniy baho aniq ish holatlari hamda sudga taqdim etilgan dalillarga bog‘liq.)*`;
    } else if (scenario.fineGrainedTopic === 'labor_transfer' || scenario.disputeType === 'labor_transfer') {
      directText = `### Sizning holatingiz
Siz taqdim etgan ma’lumotlarga ko‘ra, ish beruvchi sizning roziligingizsiz boshqa lavozimga yoki boshqa ishga o‘tkazish bo‘yicha harakat qilgan yoki tegishli buyruq chiqargan.

### Huquqiy qoida
O‘zbekiston Respublikasi Mehnat kodeksining 138 va 140-moddalariga muvofiq, xodimni boshqa doimiy ishga o‘tkazishga faqat **uning yozma roziligi bilan** yo‘l qo‘yiladi.
Xodimning roziligisiz boshqa ishga o‘tkazishga faqat favqulodda va vaqtinchalik holatlarda (masalan, tabiiy ofatlar, avariyalarning oldini olish yoki ishlab chiqarish zaruriyati munosabati bilan MK 145-moddasiga ko‘ra 60 kungacha) yo‘l qo‘yilishi mumkin.

### Sizning holatingizga tatbiqi
Bu masalada javob sizning roziligingiz olingan-olinmaganiga hamda o‘tkazish vaqtinchalik yoki doimiyligiga bog‘liq:
- Agar o‘tkazish doimiy bo‘lsa va sizning yozma roziligingiz olinmagan bo‘lsa, ish beruvchining bu harakati yoki buyrug‘i qonunga ziddir;
- Agar o‘tkazish vaqtinchalik bo‘lsa, u faqat Mehnat kodeksida nazarda tutilgan qat’iy ishlab chiqarish zaruriyati yoki bekor turib qolish asoslari mavjud bo‘lgandagina qonuniy bo‘lishi mumkin.

### Nima qilish kerak
1. Ish beruvchiga boshqa ishga o‘tkazishga rozi emasligingiz to‘g‘risida yozma e’tiroz bildiring va o‘tkazish to‘g‘risidagi buyruq nusxasini talab qiling;
2. Bandlik vazirligi huzuridagi Davlat mehnat inspeksiyasiga (1176 qisqa raqami yoki rasmiy sayti orqali) ish beruvchining qonunga zid harakatlari ustidan shikoyat qiling;
3. Avvalgi lavozimga (ishga) tiklash va asossiz boshqa ishga o‘tkazilgan davr uchun o‘rtacha ish haqini undirish to‘g‘risida Fuqarolik ishlari bo‘yicha tumanlararo sudiga da’vo arizasi bilan murojaat qiling (MK 559-moddasiga binoan xodim davlat bojidan ozod).

### Huquqiy asos
[Mehnat kodeksi, 138-modda](${top.source_url || 'https://lex.uz/docs/-6257288#-6260941'})

*(Eslatma: Ushbu maʼlumot umumiy huquqiy axborot bo‘lib, sud amaliyoti va yakuniy baho aniq ish holatlari hamda mavjud dalillarga bog‘liq.)*`;
    } else if (scenario.fineGrainedTopic === 'tenancy_cancellation' || scenario.disputeType === 'tenancy_cancellation' || scenario.fineGrainedTopic === 'tenancy_termination' || scenario.disputeType === 'tenancy_termination') {
      directText = `### Sizning holatingiz
Siz taqdim etgan ma’lumotlarga ko‘ra, turar joy (kvartira) ijarasi shartnomasini muddatidan oldin bekor qilish masalasi yuzaga kelgan.

### Huquqiy qoida
O‘zbekiston Respublikasi Fuqarolik kodeksining 615 va 551-moddalariga muvofiq, ijara shartnomasini bekor qilish birinchi navbatda **shartnomaning o‘zida belgilangan shartlar va ogohlantirish muddatlariga** asoslanadi.
Agar shartnomada muddatidan oldin bekor qilish tartibi va ogohlantirish muddati (masalan, 1 oy oldin yozma xabardor qilish) ko‘rsatilgan bo‘lsa, taraflar ushbu shartga rioya qilgan holda shartnomani bekor qilishga haqli.
Agar shartnomada maxsus muddat ko‘rsatilmagan bo‘lsa, qonunchilikka muvofiq ijarachi ikkinchi tarafni oldindan yozma ravishda ogohlantirishi lozim. Shartnomani muddatidan oldin bir tomonlama bekor qilish faqat shartnomada yoki qonunda nazarda tutilgan hollarda yoxud sud tartibida amalga oshiriladi.

### Sizning holatingizga tatbiqi
Ushbu vaziyatda shartnoma shartlari birlamchi ahamiyatga ega:
- Agar yozma shartnomada muddatidan oldin chiqish va ogohlantirish muddati belgilangan bo‘lsa, ushbu muddatga amal qilib yuborilgan yozma bildirishnoma shartnomani bekor qilish uchun qonuniy asos hisoblanadi;
- Ijaraga beruvchi asossiz ravishda shartnomani bekor qilishdan yoki ko‘chmas mulkni qabul qilishdan bosh tortsa, uning harakati shartnoma majburiyatlarini buzish hisoblanadi.

### Nima qilish kerak
1. **Shartnoma shartlarini tekshirish:** Shartnomadagi muddatidan oldin bekor qilish, ogohlantirish muddati va depozitni qaytarish bandlarini aniqlang;
2. **Yozma bildirishnoma yuborish:** Ikkinchi tarafga shartnomani bekor qilish haqida yozma bildirishnoma (ogohlantirish xati) topshiring yoki pochta orqali yuboring;
3. **Mulkni topshirish dalolatnomasi:** Chiqib ketish paytida mulkning holati va zarar yo‘qligini qayd etuvchi ikki tomonlama topshirish-qabul qilish dalolatnomasini (akt) tuzing;
4. **Sud tartibi (zarur bo‘lsa):** Agar ikkinchi taraf depozitni qaytarishdan bosh tortsa yoki nizoli talablar qo‘ysa, nizo **Fuqarolik ishlari bo‘yicha tumanlararo sudida** hal etiladi.

### Huquqiy asos
[Fuqarolik kodeksi, 615-modda](${top.source_url || 'https://lex.uz/docs/-111189#-112445'})

*(Eslatma: Ushbu maʼlumot umumiy huquqiy axborot bo‘lib, rasmiy matnni Lex.uz orqali tekshirish tavsiya etiladi. Yakuniy baho taraflar o‘rtasida tuzilgan shartnomaning aniq bandlariga bog‘liq.)*`;
    } else if (scenario.fineGrainedTopic === 'labor_unpaid_wages' || scenario.disputeType === 'individual_labor_salary') {
      directText = `### Sizning holatingiz
Siz taqdim etgan ma’lumotlarga ko‘ra, ish beruvchi tomonidan sizga tegishli bo‘lgan ish haqi (oylik maosh) belgilangan muddatda to‘lanmagan yoki kechiktirilgan.

### Amaldagi huquqiy qoida
O‘zbekiston Respublikasi Mehnat kodeksida ish haqini to‘lash va kechiktirilganlik oqibatlari bo‘yicha alohida qoidalar belgilangan:
1. **Ish haqi to‘lash muddatlari (253-modda):** Ish beruvchi xodimga ish haqini har yarim oyda kamida bir marta, jamoa shartnomasida yoki ichki hujjatda belgilangan muddatlarda (yarim oy tugaganidan keyin 16 kundan kechiktirmay) to‘lashi shart;
2. **Kechiktirilganlik uchun moddiy javobgarlik (333-modda):** Ish beruvchi ish haqini to‘lashni kechiktirgan taqdirda, kechiktirilgan har bir kun uchun Markaziy bankning qayta moliyalashtirish stavkasidan kelib chiqqan holda foizlar (kompensatsiya) to‘lashi shart. Ushbu to‘lov majburiyati ish beruvchining aybidan qat’i nazar yuzaga keladi.

### Sizning holatingizga tatbiqi
Agar siz tashkilotda mehnat shartnomasi asosida ishlayotgan bo‘lsangiz, ish beruvchining ish haqini to‘lamasligi yoki kechiktirishi Mehnat kodeksi talablarini buzish hisoblanadi. Siz nafaqat to‘lanmagan asosiy ish haqi summasini, balki to‘lov kechiktirilgan har bir kun uchun qonunda belgilangan kompensatsiya foizlarini ham talab qilishga haqlisiz.

### Sizning huquqingiz / majburiyatingiz
- Ish beruvchidan to‘lanmagan ish haqini va kechiktirilgan kunlar uchun hisoblangan foizlarni to‘liq to‘lashni talab qilish;
- Mehnat huquqlari buzilganligi yuzasidan vakolatli mehnat organlariga shikoyat qilish yoki sudga murojaat qilish;
- Mehnat nizolari bo‘yicha sudga murojaat qilganda davlat boji to‘lashdan to‘liq ozod bo‘lish (Mehnat kodeksining 559-moddasi).

### Nima qilish mumkin
1. **Ish beruvchiga yozma talabnoma topshirish:** Ish haqini to‘lash va hisob-kitob varaqasini berishni talab qilib, 2 nusxada yozma ariza taqdim eting (nusxasiga qabul qilingan sana va kirim raqamini qo‘ydirib oling);
2. **Davlat mehnat inspeksiyasiga murojaat qilish:** Mehnat qonunchiligiga rioya etilishini ta’minlash bo‘yicha vakolatli organ — O‘zbekiston Respublikasi Kambag‘allikni qisqartirish va bandlik vazirligi huzuridagi Davlat mehnat inspeksiyasiga (Ishonch telefoni: 1176 yoki dmi.mehnat.uz sayti orqali) shikoyat yuborish;
3. **Sud tartibida undirish:** Ish haqini undirish to‘g‘risida **Fuqarolik ishlari bo‘yicha tumanlararo sudiga** sud buyrug‘i berish haqida ariza yoki da’vo arizasi bilan murojaat qilish (MK 558-modda). Sudga taqdim etish uchun tegishli ariza loyihasini tayyorlab berishim mumkin.

### Kerakli hujjatlar
- Mehnat shartnomasi nusxasi;
- Ishga qabul qilish to‘g‘risidagi buyruq nusxasi;
- Ish haqi hisoblanganligi yoki bank kartasiga mablag‘ tushmaganligini tasdiqlovchi bank ko‘chirmasi;
- Hisob-kitob varaqasi (rasmka) yoki ish beruvchining qarzdorlik to‘g‘risidagi ma’lumotnomasi;
- Ish beruvchiga berilgan yozma talabnoma nusxasi.

### Huquqiy asos
[Mehnat kodeksi, 253-modda](${top.source_url || 'https://lex.uz/docs/-6257288#-6266014'})

*(Eslatma: Ushbu maʼlumot umumiy huquqiy axborot bo‘lib, rasmiy matnni Lex.uz orqali tekshirish tavsiya etiladi. Yakuniy baho mehnat shartnomasi shartlari va mavjud hisob-kitob dalillariga bog‘liq.)*`;
    } else if (scenario.disputeType === 'corruption_bribery' && (scenario.legalAction === 'complaint' || scenario.taskType === 'CORRUPTION_COMPLAINT' || scenario.issues?.includes('complaint'))) {
      directText = `### Holat
Siz taqdim etgan ma’lumotlarga ko‘ra, mansabdor shaxs tomonidan noqonuniy manfaat talab qilinganligi yoki korrupsiyaviy qilmish yuzasidan vakolatli organlarga murojaat qilish zarurati mavjud.

### Huquqiy baho
Ta’riflangan holat, agar ko‘rsatilgan faktlar tasdiqlansa, O‘zbekiston Respublikasi Jinoyat kodeksining tegishli normalari (masalan, JK 210, 211 yoki 205-moddalari) alomatlariga mos kelishi mumkin. Aniq huquqiy kvalifikatsiyani vakolatli huquqni muhofaza qiluvchi organlar ishning barcha holatlarini o‘rganish natijasida belgilaydi.

### Qayerga murojaat qilish
- **O‘zbekiston Respublikasi Bosh prokuraturasi:** Ishonch telefoni: 1007
- **Korrupsiyaga qarshi kurashish agentligi:** Call-markaz: 1253
- **Ichki ishlar organlari:** 102

### Nimalarni saqlash kerak
Mavjud shartnomalar, yozishmalar, to‘lov kvitansiyalari, audio-video yozuvlar va boshqa qonuniy yo‘l bilan olingan dalillarni asl holida saqlab qo‘ying. Dalillarning maqbulligi va isbotlash kuchi ularning qonuniy tartibda olinganiga bog‘liq.

### Murojaatda nimalar bo‘lishi kerak
1. Murojaat yuborilayotgan organning nomi va mansabdor shaxsning lavozimi;
2. Voqea sodir bo‘lgan sana, vaqt va aniq joy;
3. Noqonuniy talab qo‘ygan shaxsning to‘liq ma’lumotlari (ism-sharifi, lavozimi, tashkiloti);
4. Aynan qanday manfaat yoki pul mablag‘i talab qilinganligi va uning evaziga nima va’da qilinganligi;
5. Mavjud qonuniy dalillar ro‘yxati;
6. Arizachining qonuniy choralarni ko‘rish to‘g‘risidagi aniq talabi.

### Keyingi qadam
Yuqorida ko‘rsatilgan rasmiy organlarga yozma ariza yoki rasmiy ishonch telefonlari orqali murojaat qilish. Zarur bo‘lsa, siz uchun rasmiy shikoyat/ariza loyihasini aniq joy egalari ([F.I.Sh.], [Tashkilot], [Sana]) bilan tayyorlab berishim mumkin.

*(Eslatma: Ushbu maʼlumot umumiy huquqiy axborot bo‘lib, rasmiy matnni Lex.uz orqali tekshirish tavsiya etiladi. Yakuniy baho ishning barcha holatlariga bog‘liq.)*`;
    } else {
      let situationalHeading = `Ta’riflagan ma’lumotlaringizga ko‘ra, quyidagi huquqiy norma tatbiq etilishi mumkin:`;
      let docsNeeded = `Ishga oid mavjud shartnoma, yozma dalillar, to‘lov kvitansiyalari yoki rasmiy xabarnomalar.`;
      let deadlineSection = `Qonunda belgilangan umumiy da’vo muddati yoki maxsus shikoyat muddati amal qiladi. Muddat uzrli sabablar bilan sud tomonidan tiklanishi mumkin.`;
      
      if (scenario.domain === 'administrative' || scenario.disputeType?.includes('admin')) {
        deadlineSection = `Ma’muriy qaror yoki bayonnoma ustidan shikoyat berish muddati — qaror nusxasi topshirilgan kundan e’tiboran 10 kun (MJtK 315-moddasi). Ushbu muddat uzrli sabablar bilan tiklanishi mumkin.`;
        docsNeeded = `1. Jarima to‘g‘risidagi qaror yoki ma’muriy bayonnoma nusxasi;\n2. E’tirozni tasdiqlovchi dalillar (fotosurat, video, guvohlar ko‘rsatmasi).`;
      } else if (scenario.disputeType === 'tenancy_deposit' || scenario.disputeType === 'civil_tenancy_deposit') {
        docsNeeded = `1. Ijara shartnomasi va to‘lov kvitansiyalari / bank ko‘chirmasi;\n2. Depozit topshirilgani to‘g‘risidagi tilxat yoki shartnoma bandi;\n3. Mulkni qaytarish va zarar yo‘qligi to‘g‘risida ikki tomonlama dalolatnoma (akt).`;
        deadlineSection = `Majburiyatlarni bajarish muddati ijara shartnomasida belgilanadi. Fuqarolik kodeksiga ko‘ra umumiy da’vo muddati — 3 yil.`;
      }

      let competentVenue = proceduralInfo?.replace(/^\n\n\*\*Vakolatli[^:]*:\*\*\s*/i, '').replace(/^\n\n\*\*Murojaat[^:]*:\*\*\s*/i, '') || scenario.jurisdictionRule || 'Fuqarolik ishlari bo‘yicha tumanlararo sud yoki vakolatli davlat organi';

      directText = `### Sizning holatingiz
${situationalHeading}

### Amaldagi qoida
${top.document_name}ning ${top.article_number} (${top.article_title || ''}):
${top.content}${conditionNote}

### Sizga taalluqli tartib
Amaldagi qonunchilikda belgilangan tartibda vakolatli organga yoki tegishli sudlovga murojaat qilish tartibi qo‘llanadi.

### Muddat
${deadlineSection}

### Qayerga murojaat qilish
${competentVenue}

### Kerakli hujjatlar
${docsNeeded}

### Keyingi qadam
Kerakli hujjatlar va dalillarni jamlab, vakolatli organga yoki sudga belgilangan tartibda murojaat qilish.

### Huquqiy asos
[${top.document_name}, ${top.article_number}](${top.source_url || 'https://lex.uz'})

*(Eslatma: Ushbu maʼlumot umumiy huquqiy axborot bo‘lib, rasmiy matnni Lex.uz orqali tekshirish tavsiya etiladi. Yakuniy baho ishning barcha holatlariga bog‘liq.)*`;
    }

    const latencyMs = Date.now() - startTime;
    storageService.logQuery({
      userId,
      message,
      intent: 'LEGAL',
      selectedLawGroup: law_group,
      detectedLawGroup: scenario.targetDocumentId,
      confidence: offlineComposite.score,
      confidenceLevel: offlineComposite.level,
      compositeConfidence: offlineComposite,
      retrievedCount: 1,
      citationsCount: 1,
      fallbackUsed: { used: true, type: 'offline_rag_database' },
      safetyInterception: { intercepted: false, reason: null },
      contradictionDetected: false,
      latencyMs,
      needsClarification: false,
      isError: false
    });

    const step5Result = {
      text: directText,
      intent: 'LEGAL',
      law_group: law_group || scenario.targetDocumentId || 'all',
      sources: [top.document_name],
      sourceArticle: `${top.document_name}, ${top.article_number}`,
      sourceUrl: top.source_url,
      citations: [{
        document: top.document_name,
        article: top.article_number,
        title: top.article_title,
        url: top.source_url,
        relevance: top.relevance_score
      }],
      confidence: offlineComposite.score,
      confidenceLevel: offlineComposite.level,
      compositeConfidence: offlineComposite,
      needs_clarification: false,
      source: 'local_rag_database'
    };

    return legalValidatorService.finalizeAndValidateResponse(step5Result, {
      userQuery: message,
      scenario,
      history
    });
  }

  // STEP 6: LLM Generation with Adaptive Length & 2026 Institution Metadata
  try {
    const ai = new GoogleGenAI({ apiKey });
    const ragContext = ragService.formatContextForPrompt(retrievedArticles);

    // Identify official institution metadata for scenario
    let institutionSnippet = '';
    if (scenario.disputeType === 'corruption_bribery') {
      institutionSnippet = getInstitutionBlock('anti_corruption_agency') + '\n' + getInstitutionBlock('prosecutor_general');
    } else if (scenario.disputeType?.includes('labor')) {
      institutionSnippet = getInstitutionBlock('labor_inspectorate');
    } else if (scenario.disputeType?.includes('administrative') || scenario.domain === 'administrative' || scenario.disputeType === 'government_authority_complaint') {
      institutionSnippet = "Vakolatli organ: Yuqori turuvchi organ yoki Tumanlararo ma’muriy sud (MJtK 314-315-moddalari)";
    } else if (scenario.disputeType?.includes('tenancy') || scenario.domain === 'civil') {
      institutionSnippet = `Vakolatli sud: ${OFFICIAL_INSTITUTIONS.court_system.civil_court.name} (agar kelishuvga erishilmasa)`;
    }

    let promptInstruction = '';
    if (intentResult.intent === 'SPECIFIC_ARTICLE') {
      promptInstruction = `Foydalanuvchi qonunning aniq moddasi haqida so'ramoqda (${scenario.exactArticleNumber ? `${scenario.exactArticleNumber}-modda` : ''}).
Javobni lo'nda va tushunarli tartibda bering:
1. Birinchi jumlada moddaning nima haqida ekanligi va asosiy qoidasini lo'nda bayon qiling.
2. Muhim shart yoki istisno (agar mavjud bo'lsa).
3. Moddaning amaliy ma'nosi (fuqaro uchun nimani anglatadi).
4. Qisqa huquqiy asos: **Huquqiy asos:** [Qonun nomi, X-modda](url).
Sun'iy bo'limlarga yoki darslikka aylantirmang!`;
    } else if (scenario.taskType === 'CORRUPTION_COMPLAINT' || (scenario.disputeType === 'corruption_bribery' && scenario.legalAction === 'complaint')) {
      promptInstruction = `Foydalanuvchi korrupsiya yoki pora holati yuzasidan shikoyat/ariza berish tartibini so'ramoqda.
Javobni quyidagi 6 ta standart bo'lim bo'yicha markdown sarlavhalari (###) bilan bering:
### Holat
Foydalanuvchi bayon qilgan vaziyatning qisqa, betaraf tavsifi (shaxsni to'g'ridan-to'g'ri ayblamasdan: "Sizning ta’rifingizga ko‘ra...").

### Huquqiy baho
Potensial tegishli normalar, noaniqlikni aniq ko'rsatgan holda ("Ta’riflagan holatingiz, agar ko‘rsatilgan faktlar tasdiqlansa...").

### Qayerga murojaat qilish
Faqat tekshirilgan vakolatli organlar: Bosh prokuratura (1007), Korrupsiyaga qarshi kurashish agentligi (1253).

### Nimalarni saqlash kerak
Mavjud qonuniy hujjatlar va dalillar. Noqonuniy yoki yashirin yozib olishni maslahat bermang.

### Murojaatda nimalar bo‘lishi kerak
Sana, joy, shaxslar, nima talab qilingani, holatlar, ilovalar va talab.

### Keyingi qadam
Keyingi qonuniy amaliy harakat.`;
    } else if (scenario.disputeType === 'labor_transfer' || scenario.fineGrainedTopic === 'labor_transfer') {
      promptInstruction = `Foydalanuvchi xodimni boshqa lavozimga yoki ishga o‘tkazish masalasi haqida so‘ramoqda.
Javobni quyidagi 5 ta standart bo‘lim bo‘yicha lo‘nda, faktlarga asoslangan va tushunarli tartibda markdown sarlavhalari (###) bilan bering:
### Sizning holatingiz
Foydalanuvchi bayon qilgan vaziyatning qisqa tavsifi (ish beruvchi tomonidan boshqa ishga o‘tkazish).

### Huquqiy qoida
Mehnat kodeksining 138 va 140-moddalari qoidasi (xodimni boshqa doimiy ishga o‘tkazishga faqat uning yozma roziligi bilan yo‘l qo‘yiladi; MK 145-moddasiga ko‘ra favqulodda vaqtinchalik o‘tkazish bundan mustasno).

### Sizning holatingizga tatbiqi
Natija aynan qaysi faktga bog‘liqligini aniq ko‘rsating: "Bu masalada javob sizning roziligingiz olingan-olinmaganiga bog‘liq..." Agar rozilik berilmagan bo‘lsa, buyruq noqonuniy ekanligini bildiring.

### Nima qilish kerak
1. Ish beruvchiga yozma e’tiroz bildirish va o‘tkazish buyrug‘i nusxasini talab qilish;
2. Bandlik vazirligi huzuridagi Davlat mehnat inspeksiyasiga (1176) murojaat qilish;
3. Fuqarolik ishlari bo‘yicha tumanlararo sudiga avvalgi ishga tiklash va o‘rtacha ish haqini undirish to‘g‘risida da’vo arizasi berish (MK 559-moddasiga binoan xodim davlat bojidan ozod).

### Huquqiy asos
[Mehnat kodeksi, 138-modda](url).

MUHIM:
- Mehnat kodeksining 116-moddasini (qo‘shimcha ish / kasblarni birga olib borish) bu vaziyatga aralashtirmang!
- Boshqa masalalarni (sog‘liq sababli o‘tkazish yoki qo‘shimcha vazifa) sun’iy sanab o‘tmang.`;
    } else if (scenario.disputeType === 'tenancy_cancellation' || scenario.fineGrainedTopic === 'tenancy_cancellation' || scenario.disputeType === 'tenancy_termination' || scenario.fineGrainedTopic === 'tenancy_termination') {
      promptInstruction = `Foydalanuvchi turar joy (kvartira) ijarasi shartnomasini bekor qilish haqida so‘ramoqda.
Javobni quyidagi 5 ta standart bo‘lim bo‘yicha shartnoma shartlarini birlamchi asos deb olgan holda markdown sarlavhalari (###) bilan bering:
### Sizning holatingiz
Foydalanuvchi bayon qilgan ijara nizosining qisqa tavsifi.

### Huquqiy qoida
Fuqarolik kodeksining 615 va 551-moddalari qoidasi (shartnomani bekor qilish shartnoma bandlari va ogohlantirish muddatlariga asoslanadi).

### Sizning holatingizga tatbiqi
Shartnomada muddatidan oldin bekor qilish va ogohlantirish muddati belgilangan-belgilanmaganiga bog‘liqligini ko‘rsating.

### Nima qilish kerak
1. Shartnomadagi bekor qilish va ogohlantirish bandlarini tekshirish;
2. Ikkinchi tarafga rasmiy yozma bildirishnoma (ogohlantirish xati) yuborish;
3. Ko‘chib chiqishda mulkni topshirish-qabul qilish dalolatnomasini tuzish;
4. Nizo ixtiyoriy hal bo‘lmasa — Fuqarolik ishlari bo‘yicha tumanlararo sudiga murojaat qilish.

### Huquqiy asos
[Fuqarolik kodeksi, 615-modda](url).

QAT’IY QOIDA:
- Mehnat sohasidagi organlarni (Davlat mehnat inspeksiyasi, 1176) aslo aralashtirmang! Bu fuqarolik-huquqiy munosabatdir.`;
    } else if (scenario.disputeType === 'individual_labor_salary' || scenario.fineGrainedTopic === 'labor_unpaid_wages') {
      promptInstruction = `Foydalanuvchi ish haqining to‘lanmasligi yoki kechiktirilishi bo‘yicha murojaat qilmoqda.
Foydalanuvchi rolini aslo almashtirmang (xodimga ish beruvchi nomidan maslahat bermang!).
Javobni quyidagi 7 ta standart bo‘lim bo‘yicha markdown sarlavhalari (###) bilan taqdim eting:
### Sizning holatingiz
Foydalanuvchi holatining qisqa tavsifi.

### Amaldagi huquqiy qoida
Mehnat kodeksi 253-moddasi (ish haqini har yarim oyda kamida bir marta to‘lash majburiyati) va 333-moddasi (kechiktirilgan har bir kun uchun Markaziy bank qayta moliyalashtirish stavkasi bo‘yicha kompensatsiya to‘lash). Bu ikki normani mustaqil va alohida tushuntiring.

### Sizning holatingizga tatbiqi
Ish haqining to‘lanmasligi mehnat qonunchiligini buzish ekanligini va xodim kompensatsiya talab qilishga haqli ekanligini ko‘rsating.

### Sizning huquqingiz / majburiyatingiz
Xodimning huquqlari (asosiy qarzdorlikni va foizlarni talab qilish, davlat bojisiz sudga murojaat qilish - MK 559).

### Nima qilish mumkin
1. Ish beruvchiga 2 nusxada yozma talabnoma topshirish;
2. Kambag‘allikni qisqartirish va bandlik vazirligi huzuridagi Davlat mehnat inspeksiyasiga (1176) murojaat qilish;
3. Fuqarolik ishlari bo‘yicha tumanlararo sudiga sud buyrug‘i yoki da’vo arizasi bilan murojaat qilish (MK 558).

### Kerakli hujjatlar
Mehnat shartnomasi, ishga qabul qilish buyrug‘i, hisob-kitob varaqasi yoki bank ko‘chirmasi, yozma talabnoma.

### Huquqiy asos
[Mehnat kodeksi, 253-modda](url).

QAT’IY QOIDALAR:
- Xodimga ish beruvchining buxgalteriya harakatlarini ("moliyaviy hujjatlarni tartibga keltiring") tavsiya qilmang!
- Davlat mehnat inspeksiyasini (1176) tavsiya qilganda uning nima uchun vakolatli ekanligini tushuntiring.`;
    } else if (scenario.taskType === 'DOCUMENT_REQUEST') {
      promptInstruction = `Foydalanuvchi ariza, shikoyat yoki talabnoma hujjati shablonini so'ramoqda.
1. Qisqa kirish: "Albatta. Quyidagi shakldan foydalanishingiz mumkin:" deb boshlang.
2. Darhol to'liq rasmiy hujjat matnini keltiring.
   MUHIM: Shaxsiy ma'lumotlar, sanalar, summalarni aslo to'qimang! Faqat aniq qavsli joy egalari (placeholder) ishlating: [FISh], [Manzil], [Telefon], [Tashkilot nomi], [Sana], [Summa].
3. Hujjat ostida uni topshirish va ilova qilinadigan hujjatlar (shartnoma nusxasi, kvitansiya) bo'yicha 2-3 ta qisqa amaliy eslatma bering.
Oldidan uzun huquqiy ma'ruza yozmang!`;
    } else if (scenario.taskType === 'ACTION_REQUEST') {
      promptInstruction = `Foydalanuvchi "Endi nima qilay?" yoki amaliy qadamlarni so'ramoqda.
Javobni darhol amaliy harakatlarga yo'naltiring:
1. Birinchi navbatda qilinadigan amaliy harakat: mavjud shartnoma, to'lov ko'chirmalari, yozishmalar va dalillarni saqlash.
2. Murojaat qilish mumkin bo'lgan vakolatli organ va aloqa kanallari: ${institutionSnippet || 'Tegishli vakolatli organ'}.
   Majburiy talab bilan amaliy tavsiyani aniq ajrating (masalan: "Amaliy jihatdan avval yozma talabnoma yuborish foydali bo'lishi mumkin...").
3. Muhim muddat yoki e'tibor berish lozim bo'lgan shart.`;
    } else if (scenario.taskType === 'YES_NO_REQUEST') {
      promptInstruction = `Foydalanuvchi muayyan huquqiy harakat mumkinmi yoki yo'qligini so'ramoqda (masalan: "Sudga bersam bo'ladimi?", "Shartnomani bekor qilsam bo'ladimi?").
1. Birinchi jumlada darhol to'g'ridan-to'g'ri javob bering (masalan: "Ha, tegishli qonuniy asoslar mavjud bo‘lsa, sudga daʼvo arizasi berish mumkin." yoki "Yo‘q, ...").
2. Qonuniy shart va asosni 1-2 qisqa xatboshida lo'nda tushuntiring.
3. Amaliy keyingi qadam va vakolatli organni ko'rsating.
4. Qisqa huquqiy asos: **Huquqiy asos:** [Qonun nomi, X-modda](url).
Uzun insho yozmang, to'g'ridan-to'g'ri savolga javob bering!`;
    } else if (scenario.taskType === 'CALCULATION_REQUEST') {
      promptInstruction = `Foydalanuvchi pul miqdori yoki kompensatsiya hisobini so'ramoqda ("Qancha pul olaman?", "Qanday hisoblanadi?").
1. Darhol hisob-kitob uchun qanday ma'lumotlar zarurligini ko'rsating (asosiy qarzdorlik, kechikkan muddat, qonunda belgilangan hisoblash mezoni).
2. Qonunda belgilangan hisoblash formulasini tushuntiring. Raqamlarni o'zingizdan to'qimang.
3. Qisqa huquqiy asos: **Huquqiy asos:** [Qonun nomi, X-modda](url).`;
    } else {
      promptInstruction = `Foydalanuvchining savoliga quyidagi 8 ta standart bo‘lim bo‘yicha professional, lo‘nda va tushunarli tartibda markdown sarlavhalari (###) bilan javob bering:
### Sizning holatingiz
Vaziyatning qisqa huquqiy tavsifi (ehtiyotkor, shartli tilda: "Siz taqdim etgan maʼlumotlarga ko‘ra...").

### Amaldagi qoida
Tegishli qonun/modda qoidasi (oddiy, ravon o‘zbek tilida tushuntirish, yuridik atamalarni izohlang, masalan: "Daʼvo arizasi — bu sudga o‘z buzilgan huquqlarini himoya qilishni so‘rab topshiriladigan rasmiy hujjat").

### Sizga taalluqli tartib
Ushbu holatda qonun bo‘yicha qo‘llanadigan aniq protsedura va ketma-ketlik.

### Muddat
Qonunda belgilangan aniq muddat va u qachondan boshlanishi (masalan, nusxa topshirilgan kundan). Agar sana nomaʼlum bo‘lsa: "Muddatni aniq hisoblash uchun qaror nusxasi sizga qachon topshirilganini bilish kerak." deb yozing. Muddat o'tgan deb taxmin qilmang; muddat uzrli sabablar bilan tiklanishi mumkinligini ko'rsating.

### Qayerga murojaat qilish
Vakolatli sud (masalan: "Fuqarolik ishlari bo‘yicha tumanlararo sud" yoki "Tumanlararo ma’muriy sud") yoki davlat organi. Davlat boji imtiyozlari mavjud bo‘lsa ko‘rsating (masalan, mehnat nizolarida MK 559 bo‘yicha xodim davlat bojidan ozod).

### Kerakli hujjatlar
Ish bo‘yicha talab etiladigan hujjatlar va dalillar ro‘yxati.

### Keyingi qadam
Fuqaro amalga oshirishi lozim bo‘lgan aniq amaliy qadam. Hujjat loyihasi kerak bo'lsa [F.I.Sh.], [Manzil], [Sud nomi] kabi aniq joy egalari bilan tayyorlab berishni taklif eting.

### Huquqiy asos
[Qonun nomi, X-modda](url).

MUHIM:
- Qatʼiy hukm chiqarmang ("Siz albatta yutasiz", "Bu 100% noqonuniy" deb bo‘lmaydi).
- Moddalarni o‘zingizdan to‘qimang, faqat taqdim etilgan kontekstdagi rasmiy moddalarga tayaning!
- Hujjat turlarini to‘g‘ri ajrating: sudga — daʼvo arizasi yoki sud buyrug‘i; davlat organiga — ariza yoki shikoyat.`;
    }

    const knownFactsStr = scenario.knownFacts && scenario.knownFacts.length > 0 
      ? scenario.knownFacts.map(f => f.value).join('; ') 
      : 'Vaziyat foydalanuvchi tomonidan umumiy bayon qilingan';

    const missingFactsStr = scenario.missingCriticalFacts && scenario.missingCriticalFacts.length > 0
      ? scenario.missingCriticalFacts.map(f => `- ${f}`).join('\n')
      : 'Barcha asosiy faktlar maʼlum';

    let promptContent = `[LEX.UZ DAN OLINGAN RASMIY QONUNCHILIK MODDALARI]:
${ragContext}

=======================================
[FOYDALANUVCHINING HUQUQIY VAZIYATI]:
${scenario.cleanQuery}

[ANIQLANGAN HUQUQIY SOHA]: ${scenario.primaryDomain || scenario.domain}
[ANIQLANGAN NIZO TURI]: ${scenario.disputeType || 'umumiy huquqiy masala'}
[VAKOLATLI SUD VA YURISDIKSIYA]: ${scenario.jurisdictionRule || 'Vakolatli sud yoki davlat organi'}
[FOYDALANUVCHI ROLI]: ${scenario.userRole || 'fuqaro'}
[HUQUQIY HARAKAT TURI]: ${scenario.legalAction || 'maʼlumot olish'}
${scenario.eventDate ? `[VOQEA SANASI]: ${scenario.eventDate}-yil ${scenario.isHistorical ? '(Tarixiy norma holatini hisobga oling)' : ''}` : '[QONUN STATUSI]: Amaldagi 2026-yil tahriri'}
${retrieval.proceduralSource ? `[PROSEDURAL MUROJAAT ORGANI]: ${retrieval.proceduralSource.route}` : ''}
[VAZIFA TURI]: ${scenario.taskType}
[SUHBAT BOSQICHI]: ${isMultiTurn ? 'Suhbat davomi (Qayta salomlashmang!)' : 'Birinchi murojaat'}

[MAVJUD MAʼLUM FAKTLAR]:
${knownFactsStr}

[YETISHMAYOTGAN MUHIM FAKTLAR]:
${missingFactsStr}

${scenario.isConditionalReasoningRequired ? `[MUHIM SHARTLI TAHLIL TALABI]:
Ayrim muhim faktlar (masalan: yozma shartnoma mavjudligi, zarar dalolatnomasi, xodimning roziligi yoki qaror topshirilgan sana) nomaʼlum bo‘lgani sababli, QATʼIY HUKM CHIQARMANG ("Siz yutasiz", "Bu aniq noqonuniy" deb bo‘lmaydi). Javobni shartli ravishda ("Agar shartnomada ...", "Basharti ikki tomonlama dalolatnoma tuzilmagan bo‘lsa...", "Agar qaror topshirilganiga 10 kundan oshmagan bo‘lsa...") bayon qiling!` : ''}

${promptInstruction}

Javob oxirida qisqa eslatma qo'shing: *(Eslatma: Ushbu maʼlumot umumiy huquqiy axborot bo‘lib, aniq ish bo‘yicha yakuniy baho hujjatlar va barcha holatlar asosida beriladi.)*`;

    const contents = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history.slice(-6)) {
        if (h.sender === 'user' && h.text) {
          contents.push({ role: 'user', parts: [{ text: h.text }] });
        } else if (h.sender === 'ai' && h.text) {
          contents.push({ role: 'model', parts: [{ text: h.text }] });
        }
      }
    }
    contents.push({ role: 'user', parts: [{ text: promptContent }] });

    const response = await callGeminiWithRetry(ai, {
      model: 'gemini-3.5-flash-lite',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2
      }
    });

    let replyText = sanitizeResponseText(response.text || "Javob tayyorlashda xatolik yuz berdi.", isMultiTurn, scenario.taskType);

    // STEP 7: Strict Claim Grounding & Supporting Citation Verification
    const groundingCheck = ragService.verifyClaimGrounding(replyText, retrievedArticles);
    if (!groundingCheck.isGrounded) {
      console.warn(`[aiService] Asoslanmagan moddalar chetlatildi: ${groundingCheck.ungroundedCitations.join(', ')}`);
    }

    const supportedArticles = ragService.filterSupportingCitations(replyText, retrievedArticles, scenario);

    // Section J Checklist & Legal Source Validation
    const validatorResult = legalValidatorService.validateResponse({
      text: replyText,
      scenario,
      supportedArticles
    });

    if (!validatorResult.isValid) {
      console.warn(`[aiService] LegalValidatorService violations detected:`, validatorResult.violations);
    }

    let finalCitations = [];
    let finalSources = [];
    let primaryArticle = null;
    let primaryUrl = null;

    if (supportedArticles.length > 0) {
      finalCitations = supportedArticles.map(a => ({
        document: a.document_name,
        article: a.article_number,
        title: a.article_title,
        url: a.source_url,
        relevance: a.relevance_score
      }));
      finalSources = [...new Set(supportedArticles.map(a => a.document_name))];
      primaryArticle = `${supportedArticles[0].document_name}, ${supportedArticles[0].article_number}`;
      primaryUrl = supportedArticles[0].source_url;
    }

    const finalComposite = calculateCompositeLegalConfidence({
      retrievedArticles: supportedArticles,
      scenario,
      intentResult,
      isGrounded: groundingCheck.isGrounded,
      validatorResult
    });

    const latencyMs = Date.now() - startTime;
    storageService.logQuery({
      userId,
      message,
      intent: 'LEGAL',
      selectedLawGroup: law_group,
      detectedLawGroup: scenario.targetDocumentId,
      confidence: finalComposite.score,
      confidenceLevel: finalComposite.level,
      compositeConfidence: finalComposite,
      retrievedCount: supportedArticles.length,
      citationsCount: finalCitations.length,
      fallbackUsed: { used: false, type: 'none' },
      safetyInterception: { intercepted: false, reason: null },
      contradictionDetected: false,
      latencyMs,
      needsClarification: false,
      isError: false
    });

    const successResult = {
      text: replyText,
      intent: 'LEGAL',
      taskType: scenario.taskType,
      law_group: law_group || scenario.targetDocumentId || 'all',
      sources: finalSources,
      sourceArticle: primaryArticle,
      sourceUrl: primaryUrl,
      citations: finalCitations,
      confidence: finalComposite.score,
      confidenceLevel: finalComposite.level,
      compositeConfidence: finalComposite,
      needs_clarification: false,
      source: 'gemini_rag_official'
    };

    return legalValidatorService.finalizeAndValidateResponse(successResult, {
      userQuery: message,
      scenario,
      history
    });
  } catch (error) {
    console.error('[aiService] Gemini API Error:', error.message);
    const latencyMs = Date.now() - startTime;

    const fallbackComposite = calculateCompositeLegalConfidence({
      retrievedArticles,
      scenario,
      intentResult,
      isGrounded: true
    });

    storageService.logQuery({
      userId,
      message,
      intent: 'LEGAL',
      selectedLawGroup: law_group,
      detectedLawGroup: scenario.targetDocumentId,
      confidence: fallbackComposite.score,
      confidenceLevel: fallbackComposite.level,
      compositeConfidence: fallbackComposite,
      retrievedCount: retrievedArticles.length,
      citationsCount: retrievedArticles.length > 0 ? 1 : 0,
      fallbackUsed: { used: true, type: 'api_error_rag_fallback' },
      safetyInterception: { intercepted: false, reason: null },
      contradictionDetected: false,
      latencyMs,
      needsClarification: false,
      isError: true,
      errorDetails: error.message
    });

    // Graceful fallback to verified RAG article
    if (retrievedArticles.length > 0) {
      const top = retrievedArticles[0];
      const validation = ragService.validateLegalCitation({
        document_id: top.document_id,
        document_name: top.document_name,
        article_number: top.article_number,
        article_title: top.article_title,
        relevant_issue: scenario.issues?.[0] || null,
        disputeType: scenario.disputeType,
        source_url: top.source_url
      });

      let proceduralInfo = '';
      if (scenario.disputeType === 'corruption_bribery') {
        proceduralInfo = `\n\n**Murojaat uchun vakolatli organlar:**\n- Korrupsiyaga qarshi kurashish agentligi (Call-markaz: 1253)\n- Oʻzbekiston Respublikasi Bosh prokuraturasi (Ishonch telefoni: 1007)`;
      } else if (scenario.disputeType?.includes('labor')) {
        proceduralInfo = `\n\n**Murojaat uchun vakolatli organ:** Davlat mehnat inspeksiyasi (Ishonch telefoni: 1176) yoki fuqarolik ishlari bo‘yicha sud`;
      } else if (scenario.disputeType?.includes('administrative') || scenario.domain === 'administrative' || scenario.disputeType === 'government_authority_complaint') {
        proceduralInfo = `\n\n**Vakolatli organ:** Yuqori turuvchi organ/mansabdor shaxs yoki Tumanlararo ma’muriy sud (qaror ustidan 10 kun ichida)`;
      } else if (scenario.disputeType?.includes('tenancy') || scenario.domain === 'civil') {
        proceduralInfo = `\n\n**Vakolatli sud:** Fuqarolik ishlari bo‘yicha tumanlararo sudi (agar nizo fuqarolar o‘rtasida bo‘lsa va ixtiyoriy hal etilmasa)`;
      }

      const catName = top.category || (scenario.primaryDomain || (scenario.domain === 'labor' ? 'Mehnat huquqi' : scenario.domain === 'criminal' ? 'Jinoyat huquqi' : scenario.domain === 'administrative' ? 'Maʼmuriy huquq' : scenario.domain === 'constitution' ? 'Konstitutsiyaviy huquq' : 'Fuqarolik huquqi'));
      const catchResult = {
        text: `**Huquqiy norma:** ${top.document_name}, ${top.article_number}\n\n${top.content}${proceduralInfo}\n\n**Manba:** [${top.document_name}](${top.source_url || 'https://lex.uz'})\n**Modda:** ${top.article_number}\n**Yo‘nalish:** ${catName}\n\n*(Eslatma: Ushbu maʼlumot umumiy huquqiy axborot bo‘lib, rasmiy matnni Lex.uz orqali tekshirish tavsiya etiladi.)*`,
        intent: 'LEGAL',
        law_group: law_group || scenario.targetDocumentId || 'all',
        sources: [top.document_name],
        sourceArticle: `${top.document_name}, ${top.article_number}`,
        sourceUrl: top.source_url,
        citations: [{
          document: top.document_name,
          article: top.article_number,
          title: top.article_title,
          url: top.source_url,
          relevance: top.relevance_score
        }],
        confidence: fallbackComposite.score,
        confidenceLevel: fallbackComposite.level,
        compositeConfidence: fallbackComposite,
        needs_clarification: false,
        source: 'rag_fallback'
      };

      return legalValidatorService.finalizeAndValidateResponse(catchResult, {
        userQuery: message,
        scenario,
        history
      });
    }

    const emptyResult = {
      text: "Mavjud rasmiy qonunchilik bazasida ushbu savolga toʻliq javob berish uchun yetarli maʼlumot topilmadi.",
      intent: 'LEGAL',
      law_group: law_group || 'all',
      sources: [],
      sourceArticle: null,
      sourceUrl: null,
      citations: [],
      confidence: 0,
      confidenceLevel: 'LOW',
      compositeConfidence: { score: 0, level: 'LOW', breakdown: null },
      needs_clarification: true,
      source: 'rag_fallback'
    };

    return legalValidatorService.finalizeAndValidateResponse(emptyResult, {
      userQuery: message,
      scenario,
      history
    });
  }
}

export default {
  generateLegalAdvice,
  calculateCompositeLegalConfidence,
  sanitizeResponseText
};
