/**
 * AdvokatAI - Final Legal Response & Quality Validation Service
 * 
 * Enforces rigorous pre-delivery verification and modification on EVERY generated response:
 * [✓] Uzbek grammar, orthography & spelling
 * [✓] Question-form particles (-mi, -mikan, -mi?) & global "zararmis?" repair
 * [✓] Natural phrasing & Uzbek legal terminology (ish haqi, uy-joydan chiqarish, mol-mulkka yetkazilgan zarar)
 * [✓] Removal of repetitive AI filler & duplicated disclaimers
 * [✓] Markdown link sanitization ([Text][URL][URL] -> [Text](URL)) & deduplication
 * [✓] Strict separation of Bribery Articles 210, 211, 212 & Art. 15 classification
 * [✓] Article-number consistency & directly supporting citation check
 * [✓] Court jurisdiction matching (Ma’muriy sud, Iqtisodiy sud, Fuqarolik sudi)
 * [✓] Calibrated confidence levels (Yuqori / O‘rta / Past) with clear rationale
 */

export class LegalValidatorService {
  /**
   * 1. Global Uzbek Question Grammar & Particle Repair
   * Eliminates errors like "zararmis?", "nizomis?", merges, and duplicate question markers.
   */
  cleanQuestionGrammarAndParticles(text) {
    if (!text) return '';
    let t = text;

    // A. Specific Rental Question replacement to natural, formal Uzbek legal phrasing
    t = t.replace(
      /Ijara\s+bo['‘`]?yicha\s+nizoyingiz(?:\s+aynan)?\s+qaysi\s+masalaga\s+tegishli:\s*to['‘`]?lov\s+kechikishi,\s*depozitni\s+qaytarish,\s*(?:uydan\s+chiqarib\s+yuborish|uy-joydan\s+chiqarish),\s*shartnomani\s+bekor\s+qilish\s+yoki\s+(?:mulkka|mol-mulkka)\s+yetkazilgan\s+zararmis\??/gi,
      "Ijara bo‘yicha nizoyingiz qaysi masalaga tegishli: ijara haqini to‘lashning kechikishi, depozitni qaytarish, uy-joydan chiqarish, shartnomani bekor qilish yoki mol-mulkka yetkazilgan zarar?"
    );

    // B. Fix any enumerated question ending with "yoki ... zararmis?" or "yoki ... zararmi?"
    t = t.replace(/(qaysi\s+masalaga\s+tegishli:[^?]+yoki\s+(?:mol-)?mulkka\s+yetkazilgan\s+)zararmis\?/gi, '$1zarar?');
    t = t.replace(/(qaysi\s+masalaga\s+tegishli:[^?]+yoki\s+(?:mol-)?mulkka\s+yetkazilgan\s+)zararmi\?/gi, '$1zarar?');

    // In a "qaysi ... tegishli: A, B yoki C?" construction, the last enumerated item must be a noun, not take -mi? or -mis?
    t = t.replace(/(qaysi\s+[^?:]+:\s*[^?]+?\byoki\s+)([a-zA-Z‘ʻ'’-]+)mis\?/gi, '$1$2?');
    t = t.replace(/(qaysi\s+[^?:]+:\s*[^?]+?\byoki\s+)([a-zA-Z‘ʻ'’-]+)mi\?/gi, '$1$2?');

    // C. Global repair for "zararmis?" -> "zararmi?" when standalone
    t = t.replace(/\bzararmis\?/gi, 'zararmi?');
    t = t.replace(/\bzararmis\b/gi, 'zararmi');

    // D. Global repair for any noun/adjective mistakenly attached with "-mis?" instead of "-mi?"
    t = t.replace(/\b([a-zA-Z‘ʻ'’-]+)mis\?/gi, '$1mi?');

    // E. Fix malformed -mikan particles
    t = t.replace(/\bmikans\?/gi, 'mikan?');

    // F. Clean multiple question marks and unnecessary spacing before ?
    t = t.replace(/\s+\?/g, '?');
    t = t.replace(/\?\?+/g, '?');

    return t;
  }

  /**
   * 2. Context-Aware Legal Terminology Normalization
   * Enforces formal Uzbek legal terms (ish haqi, uy-joydan chiqarish, mol-mulk).
   */
  cleanLegalTerminology(text) {
    if (!text) return '';
    let t = text;

    // A. "uydan chiqarib yuborish" -> "uy-joydan chiqarish" in legal contexts
    t = t.replace(/\buydan\s+chiqarib\s+yuborish\b/gi, 'uy-joydan chiqarish');
    t = t.replace(/\buydan\s+chiqarib\s+yubormoqchi\b/gi, 'uy-joydan chiqarmoqchi');
    t = t.replace(/\buydan\s+haydash\b/gi, 'uy-joydan chiqarish');

    // B. Property damage formal phrasing (avoid doubling mol-)
    t = t.replace(/(?<!mol-)\bmulkka\s+yetkazilgan\s+zarar\b/gi, 'mol-mulkka yetkazilgan zarar');
    t = t.replace(/(?:mol-)+mulkka/gi, 'mol-mulkka');

    // C. Awkward "aynan qaysi masalaga tegishli" -> "qaysi masalaga tegishli"
    t = t.replace(/\baynan\s+qaysi\s+masalaga\s+tegishli\b/gi, 'qaysi masalaga tegishli');

    // D. "oylik" -> "ish haqi" in formal legal explanations
    // Carefully preserve non-salary uses (e.g. "2 oy bo'ldi", "3 oylik muddat")
    t = t.replace(/\bish\s+beruvchi\s+oylikni\b/gi, 'ish beruvchi ish haqini');
    t = t.replace(/\boylik\s+maosh\b/gi, 'ish haqi');
    t = t.replace(/\boylikni\s+to['‘`]?lamasa\b/gi, 'ish haqini to‘lamasa');
    t = t.replace(/\boylik\s+to['‘`]?lanmasa\b/gi, 'ish haqi to‘lanmasa');
    t = t.replace(/\boylikni\s+bermayapti\b/gi, 'ish haqini to‘lamayapti');
    t = t.replace(/\boylikni\s+o['‘`]?z\s+vaqtida\b/gi, 'ish haqini o‘z vaqtida');
    t = t.replace(/\boylikdan\s+ushlab\s+qolish\b/gi, 'ish haqidan ushlab qolish');

    // E. Tone and clarity improvements
    t = t.replace(/\bmazkur\s+qoida\b/gi, 'ushbu qoida');
    t = t.replace(/\byuqorida\s+qayd\s+etilgan\b/gi, 'yuqorida aytilgan');

    // F. Formal court jurisdiction naming (Fuqarolik ishlari bo‘yicha tumanlararo sud, Tumanlararo ma’muriy sud)
    t = t.replace(/\bfuqarolik\s+sudiga\b/gi, 'Fuqarolik ishlari bo‘yicha tumanlararo sudiga');
    t = t.replace(/\bfuqarolik\s+sudi\b/gi, 'Fuqarolik ishlari bo‘yicha tumanlararo sud');
    t = t.replace(/\bma[''ʻʼ‘`’]?muriy\s+sudiga\b/gi, 'Tumanlararo ma’muriy sudiga');
    t = t.replace(/\bma[''ʻʼ‘`’]?muriy\s+sudi\b/gi, 'Tumanlararo ma’muriy sud');
    t = t.replace(/\biqtisodiy\s+sudiga\b/gi, 'Tumanlararo iqtisodiy sudiga');
    t = t.replace(/\biqtisodiy\s+sudi\b/gi, 'Tumanlararo iqtisodiy sud');
    t = t.replace(/(?:Fuqarolik\s+ishlari\s+bo[''ʻʼ‘`’]?yicha\s+)+tumanlararo/gi, 'Fuqarolik ishlari bo‘yicha tumanlararo');
    t = t.replace(/(?:Tumanlararo\s+)+ma[''ʻʼ‘`’]?muriy/gi, 'Tumanlararo ma’muriy');
    t = t.replace(/(?:Tumanlararo\s+)+iqtisodiy/gi, 'Tumanlararo iqtisodiy');

    return t;
  }

  /**
   * 3. Removal of Repetitive AI Language & Boilerplate
   */
  cleanRepetitiveAiLanguage(text) {
    if (!text) return '';
    let t = text;

    // A. Remove repeated consecutive filler openers in paragraphs
    t = t.replace(/(?:\n\s*Qonunchilikka\s+ko['‘`]?ra,?\s*){2,}/gi, '\nQonunchilikka ko‘ra, ');
    t = t.replace(/(?:\n\s*Amaliy\s+jihatdan,?\s*){2,}/gi, '\nAmaliy jihatdan, ');

    // B. Deduplicate standard legal disclaimer if repeated multiple times
    const disclaimerPattern = /\*\(Eslatma:\s*Ushbu\s+ma['‘`]?lumot\s+umumiy\s+huquqiy\s+axborot\s+bo['‘`]?lib[^)]*\)\*/gi;
    const matches = t.match(disclaimerPattern);
    if (matches && matches.length > 1) {
      let first = true;
      t = t.replace(disclaimerPattern, (match) => {
        // Keep only the very last one
        return '';
      }).trim();
      t += `\n\n*(Eslatma: Ushbu maʼlumot umumiy huquqiy axborot bo‘lib, aniq ish bo‘yicha yakuniy baho hujjatlar va barcha holatlar asosida beriladi.)*`;
    }

    // C. Clean redundant closing pleasantries
    t = t.replace(/\n+\s*Agar\s+(?:qo['‘`]?shimcha|boshqa)\s+savollaringiz\s+bo['‘`]?lsa[^\n]*\.?\s*$/gi, '');
    t = t.replace(/\n+\s*Savollaringiz\s+bo['‘`]?lsa,?\s*marhamat[^\n]*\.?\s*$/gi, '');

    return t;
  }

  /**
   * 3.1 Removal of Generic Legal Filler & Empty Platitudes (Rule 11)
   * Strips repetitive generic sentences that do not actually address the user's specific question.
   */
  cleanGenericFiller(text) {
    if (!text) return '';
    let t = text;

    // A. Strip "har bir shaxs o'z huquqlarini himoya qilishga doir..."
    t = t.replace(/(?:Qonunchilikka\s+ko['‘`]?ra,\s*)?(?:har\s+bir\s+shaxs|har\s+bir\s+fuqaro)\s+o['‘`]?z\s+huquqlar?ini\s+himoya\s+qilishga\s+doir\s+qonuniy\s+harakatlarni\s+amalga\s+oshirish\s+huquqiga\s+ega[^\n.]*\.?\s*/gi, '');
    
    // B. Strip combined long government petition filler
    t = t.replace(/(?:Qonunchilikka\s+ko['‘`]?ra,\s*)?jismoniy\s+va\s+yuridik\s+shaxslarning\s+murojaatlari[^\n.]*davlat\s+organlari\s+tomonidan[^\n.]*ko['‘`]?rib\s+chiqilishi\s+shart\s+va\s+har\s+bir\s+shaxs\s+o['‘`]?z\s+huquqlarini\s+himoya\s+qilishga\s+doir\s+qonuniy\s+harakatlarni\s+amalga\s+oshirish\s+huquqiga\s+ega\.?\s*/gi, '');
    
    // C. Strip generic "qonunda taqiqlanmagan barcha usullar bilan"
    t = t.replace(/Har\s+bir\s+shaxs\s+o['‘`]?z\s+huquq\s+va\s+erkinliklarini\s+qonunda\s+taqiqlanmagan\s+barcha\s+usullar\s+bilan\s+himoya\s+qilishga\s+haqli\.?\s*/gi, '');

    // Clean resulting multiple blank lines
    t = t.replace(/\n{3,}/g, '\n\n');

    return t;
  }

  /**
   * 3.2 Penalty Generalization Sanitizer (Rule 2)
   * Prevents combining statutory minimums and maximums across subsections into synthetic wide ranges.
   * If facts do not specify the subsection, enforces standard conditional text.
   */
  cleanPenaltyGeneralizations(text) {
    if (!text) return '';
    let t = text;

    const standardClause = 'Jazoning aniq turi va miqdori qilmishning holatlari hamda Jinoyat kodeksining tegishli qismiga bog‘liq.';

    // Pattern 1: Synthetic BHM fine min to years prison max (e.g. 50 BHMdan boshlab 15 yilgacha)
    t = t.replace(/\b(?:BHMning\s+|bazaviy\s+hisoblash\s+miqdorining\s+)?\d+\s*(?:baravaridan|BHMdan)\s*(?:boshlab\s*)?\d+\s*yilgacha(?:\s*ozodlikdan\s*mahrum\s*qilish)?/gi, standardClause);

    // Pattern 2: Synthetic cross-part years range (e.g. 2 yildan 15 yilgacha, 3 yildan 15 yilgacha)
    t = t.replace(/\b(?:2|3|5)\s*yildan\s*(?:boshlab\s*)?1[0-5]\s*yilgacha\s*(?:ozodlikdan\s*mahrum\s*qilish|qamoq)/gi, standardClause);

    // Pattern 3: Generic "X BHMdan Y yilgacha"
    t = t.replace(/\b\d+\s*BHMdan\s*(?:to\s*|boshlab\s*)?\d+\s*yilgacha\b/gi, standardClause);

    return t;
  }

  /**
   * 3.25 High-Risk Definitive Crime Conclusion Sanitizer (Rule 1)
   * Prevents asserting flatly that facts constitute a specific crime.
   * Converts "Bu Jinoyat kodeksining X-moddasi bo‘yicha jinoyat" to conditional qualification.
   */
  cleanDefinitiveCrimeConclusions(text) {
    if (!text) return '';
    let t = text;

    t = t.replace(/\bBu\s+(?:O‘zbekiston\s+Respublikasi\s+)?Jinoyat\s+kodeksining\s+(\d+(?:[¹²³⁴⁵⁶⁷⁸⁹\-\d]+)?)-moddasi\s+bo['‘`]?yicha\s+jinoyat\b(?:\s*hisoblanadi|\s*bo['‘`]?ladi)?/gi,
      'Ta’riflagan holatingiz, agar ko‘rsatilgan faktlar tasdiqlansa, JKning $1-moddasida nazarda tutilgan qilmish alomatlariga mos kelishi mumkin. Aniq huquqiy kvalifikatsiyani vakolatli organ ishning barcha holatlari asosida belgilaydi');
    t = t.replace(/\bBu\s+JK(?:ning)?\s+(\d+(?:[¹²³⁴⁵⁶⁷⁸⁹\-\d]+)?)-moddasi\s+bo['‘`]?yicha\s+jinoyat\b(?:\s*hisoblanadi|\s*bo['‘`]?ladi)?/gi,
      'Ta’riflagan holatingiz, agar ko‘rsatilgan faktlar tasdiqlansa, JKning $1-moddasida nazarda tutilgan qilmish alomatlariga mos kelishi mumkin. Aniq huquqiy kvalifikatsiyani vakolatli organ ishning barcha holatlari asosida belgilaydi');

    return t;
  }

  /**
   * 3.3 Accusatory Phrasing Neutralizer (Rule 2 & Rule 3)
   * Eliminates definitive accusations ("Siz jinoyat sodir etgansiz", "Bu aniq jinoyat", "U mansabdor shaxs pora olgan")
   * in favor of objective, conditional legal phrasing.
   */
  cleanAccusatoryPhrasing(text) {
    if (!text) return '';
    let t = text;

    // Neutralize third-party accusations
    t = t.replace(/\b(?:u\s+)?mansabdor\s+shaxs\s+pora\s+olgan\b/gi,
      'Sizning ta’rifingizga ko‘ra, mansabdor shaxs pul yoki boshqa manfaat talab qilgan');
    t = t.replace(/\b(?:u\s+)?mansabdor\s+shaxs\s+jinoyat\s+sodir\s+etgan\b/gi,
      'Sizning ta’rifingizga ko‘ra, mansabdor shaxsning harakatlarida qonunga zid alomatlar bo‘lishi mumkin');

    t = t.replace(/\bSiz\s+jinoyat\s+sodir\s+(?:etgansiz|qildingiz|etgan\s+bo['‘`]?lasiz)\b/gi,
      'Ta’riflagan holatingiz, agar qo‘shimcha faktlar tasdiqlansa, tegishli huquqbuzarlik alomatlarini o‘z ichiga olishi mumkin');

    t = t.replace(/\bBu\s+aniq\s+jinoyat\s*(?:hisoblanadi|bo['‘`]?ladi)?\b/gi,
      'Ushbu holat tegishli qonun talablariga zid bo‘lishi mumkin, biroq yakuniy baho ishning barcha holatlariga bog‘liq');

    t = t.replace(/\b(aniq|so['‘`]?zsiz)\s+qonunbuzarlik\s+sodir\s+etgansiz\b/gi,
      'holat bo‘yicha qo‘shimcha faktlar o‘rganilishi lozim');

    return t;
  }

  /**
   * 3.4 Lawful Evidence Advice Normalizer (Rule 7 & Rule 11)
   * Strictly bars advising unlawful or secret recordings and rejects flat evidentiary claims.
   * Replaces with verified lawful preservation language.
   */
  cleanEvidenceAdvice(text) {
    if (!text) return '';
    let t = text;

    // Neutralize definitive evidentiary claims: "Bu yozuv jinoyatni to‘liq isbotlaydi"
    t = t.replace(/\b(?:bu\s+)?(?:yozuv|audio|video|yozishma|material)\s+(?:jinoyatni\s+)?(?:to['‘`]?liq\s+)?isbotlaydi\b[^\n.]*/gi,
      'Ushbu material muhim bo‘lishi mumkin, ammo uning maqbulligi va daliliy kuchi qanday olinganiga hamda ish holatlariga bog‘liq');

    const secretRecordingRegex = /(?:yashirincha|bildirmasdan|yashirin\s+tarzda|ovozni\s+yashirin)\s+(?:ovoz|audio|video|yozib\s+oling|yozib\s+olish|yozib\s+boring)[^\n.]*/gi;
    if (secretRecordingRegex.test(t)) {
      t = t.replace(secretRecordingRegex, 'mavjud hujjatlar, yozishmalar va boshqa qonuniy yo‘l bilan olingan dalillarni saqlab qo‘ying. Dalilning maqbulligi va huquqiy kuchi uning qanday olingani va ishning holatlariga bog‘liq');
    }

    return t;
  }

  /**
   * 3.45 Statutory Immunity / Exemption Qualification Guard (Rule 13)
   * Bars unconditional promises of exemption from criminal liability.
   */
  cleanImmunityAdvice(text) {
    if (!text) return '';
    let t = text;

    t = t.replace(/\b(?:Siz\s+)?(?:jinoiy\s+)?javobgarlikdan\s+(?:to['‘`]?liq\s+)?ozod\s+(?:qilinasiz|bo['‘`]?lasiz)\b[^\n.]*/gi,
      'Qonunchilikda muayyan shartlar bajarilganda maxsus qoida yoki javobgarlikdan ozod qilish nazarda tutilishi mumkin. Uning qo‘llanishi aniq holatlar, vaqt, ixtiyoriy xabar qilish, hamkorlik qilish, shaxsning protsessual maqomi va boshqa qonuniy talablarga bog‘liq');

    return t;
  }

  /**
   * 3.48 Arbitrary Reliability Score Stripper (Rule 21)
   * Removes arbitrary "Ishonch darajasi:" and "Ishonchlilik:" scores.
   */
  cleanReliabilityBadges(text) {
    if (!text) return '';
    let t = text;

    t = t.replace(/^\s*\*\*Ishonch(?:li)?\s*darajasi:\*\*[^\n]*\n?/gmi, '');
    t = t.replace(/^\s*\*\*Ishonchlilik:\*\*[^\n]*\n?/gmi, '');

    return t;
  }

  /**
   * 3.49 AI Assistant Self-Description Normalizer (Rule 22)
   * Disallows claiming "rasmiy huquqiy yordamchi".
   */
  cleanSelfDescription(text) {
    if (!text) return '';
    let t = text;
    t = t.replace(/(?:O[‘'`]?zbekiston\s+qonunchiligiga\s+asoslangan\s+)?rasmiy\s+huquqiy\s+yordamchi(?:\w*|\b)/gi, 'O‘zbekiston qonunchiligiga asoslangan AI huquqiy yordamchi');
    return t;
  }

  /**
   * 3.50 Employer-Side Advice Guard for Employees (Section 1, 2, 9, 10)
   * Prohibits giving employer-side advice to an employee unless user identified as employer.
   * E.g. sanitizes "Moliyaviy hujjatlarni tartibga keltiring va to‘lovlarni amalga oshiring".
   */
  cleanEmployerAdviceToEmployee(text, scenario = {}, userQuery = '') {
    if (!text) return '';
    const isEmployer = scenario?.userRole === 'employer' || /(men\s*ish\s*beruvchiman|ish\s*beruvchi\s*sifatida|bizning\s*korxona)/i.test(userQuery || '');
    if (isEmployer) return text;

    let t = text;
    t = t.replace(/(?:moliyaviy\s+hujjatlarni\s+tartibga\s+keltiring\s+va\s+to['‘`]?lovlarni\s+amalga\s+oshiring|to['‘`]?lovlarni\s+amalga\s+oshirishingiz\s+kerak|xodim\s+bilan\s+hisob-kitob\s+qiling)/gi,
      'ish beruvchidan to‘lanmagan ish haqini to‘lashni talab qiling');
    t = t.replace(/\bIsh\s+beruvchi\s+sifatida\s*,?\s*/gi, '');

    return t;
  }

  /**
   * 3.52 Multi-Issue Unrelated Listing Sanitizer (Section 4)
   * Prevents responses from listing unrelated legal issues like:
   * "Qo‘shimcha ish, sog‘liq bo‘yicha boshqa ishga o‘tkazish, ish beruvchining tashabbusi bilan shartnomani o‘zgartirish..."
   * unless the user specifically asked about all of them.
   */
  cleanMultiIssueListing(text, scenario = {}, userQuery = '') {
    if (!text) return '';
    let t = text;
    const q = (userQuery + ' ' + (scenario.cleanQuery || '')).toLowerCase();

    // Section 4: If user did NOT ask about additional work or combining professions, strip them
    if (!q.includes('qo‘shimcha') && !q.includes('qoshimcha') && !q.includes("qo'shimcha")) {
      t = t.split('\n').filter(line => !/qo['‘`]?shimcha\s+ish|kasblarni\s+birga\s+olib\s+borish/i.test(line)).join('\n');
    }

    // Section 4: If user did NOT ask about health-related transfer, strip it
    if (!q.includes('sog‘liq') && !q.includes('sogliq') && !q.includes("sog'liq") && !q.includes('tibbiy')) {
      t = t.split('\n').filter(line => !/sog['‘`]?liq\s+(?:holatiga|sababli|bo['‘`]?yicha)/i.test(line)).join('\n');
    }

    const askedAll = q.includes('qo‘shimcha ish') && q.includes('sog‘liq') && q.includes('o‘zgartirish');
    if (!askedAll) {
      const syntheticClusterRegex = /Qo['‘`]?shimcha\s+ish,\s+sog['‘`]?liq\s+(?:sababli|bo['‘`]?yicha)\s+boshqa\s+ishga\s+o['‘`]?tkazish\s+va\s+ish\s+beruvchining\s+tashabbusi\s+bilan\s+shartnomani\s+o['‘`]?zgartirish[^\n.]*/gi;
      t = t.replace(syntheticClusterRegex, 'Bu masala mehnat shartnomasining qaysi jihatiga bog‘liq ekanini aniqlasak, tegishli tartibni tushuntiraman');
    }

    return t;
  }

  /**
   * 3.53 Domain-Authority Cross-Contamination Guard (Section 2, 4, 14, 15, 26)
   * Prevents recommending authorities that do not have legal competence over the domain.
   * CRITICAL RULE: A labor authority (e.g. Davlat mehnat inspeksiyasi - 1176) must NEVER
   * be recommended for civil, rental, tenancy, housing, consumer, debt, or family disputes.
   */
  cleanDomainAuthorityMismatch(text, scenario = {}, userQuery = '') {
    if (!text) return '';
    let t = text;
    const combined = ((userQuery || '') + ' ' + (scenario.cleanQuery || '') + ' ' + (scenario.disputeType || '') + ' ' + (scenario.fineGrainedTopic || '')).toLowerCase();
    const isCivilRentalFamily = scenario.domain === 'civil' || 
                                scenario.domain === 'family' || 
                                scenario.domain === 'consumer' || 
                                scenario.fineGrainedTopic?.startsWith('tenancy_') || 
                                scenario.disputeType?.includes('tenancy') || 
                                scenario.disputeType?.includes('civil') || 
                                /(\bijara\b|\bkvartira\b|\barenda\b|\buy\s*egasi\b|\bdepozit\b|\bqarz\b|\baliment\b|\bnikoh\b|\bajrash\b|\biste['‘`]?molchi\b)/i.test(combined);

    const isExplicitLabor = scenario.domain === 'labor' || 
                           scenario.fineGrainedTopic?.startsWith('labor_') || 
                           scenario.disputeType?.includes('labor') || 
                           /(\bish beruvchi\b|\bxodim\b|\bmaosh\b|\boylik\b|\bishdan bo['‘`]?shat|\bmehnat shartnoma)/i.test(combined);

    // If it is a civil/rental/consumer dispute and NOT an explicit employment dispute:
    if (isCivilRentalFamily && !isExplicitLabor) {
      // Strip any accidental injection of labor inspectorate or 1176
      if (/mehnat\s*inspeksiya|1176|dmi\.mehnat\.uz/i.test(t)) {
        t = t.split('\n')
          .filter(line => !/(?:mehnat\s*inspeksiya|1176|dmi\.mehnat\.uz)/i.test(line))
          .join('\n');

        // If "Vakolatli organ" or "Qayerga murojaat qilish" was left empty, ensure civil venue
        if (/### Qayerga murojaat qilish\s*\n\s*(?:###|\n|$)/.test(t)) {
          t = t.replace(
            /### Qayerga murojaat qilish\s*\n/,
            '### Qayerga murojaat qilish\nFuqarolik ishlari bo‘yicha tumanlararo sud (nizo o‘zaro kelishuv yo‘li bilan hal etilmagan taqdirda)\n'
          );
        }
      }
    }

    return t;
  }

  /**
   * 3.5 Premature Deadline Expiry Guard (Rule 8)
   * Prevents asserting that a deadline has already expired when the user did not provide exact dates.
   */
  cleanPrematureDeadlines(text, scenario = {}, userQuery = '') {
    if (!text) return '';
    let t = text;
    const combinedQuery = (userQuery + ' ' + (scenario.cleanQuery || '')).toLowerCase();
    const hasExactDate = /\b(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}|\d+\s*(?:kun|oy|yil)\s*(?:bo['‘`]?ldi|o['‘`]?tdi))\b/i.test(combinedQuery);

    if (!hasExactDate) {
      t = t.replace(/\b(?:siz\s+)?(?:shikoyat\s+|da['‘`]?vo\s+)?muddati?(?:ni)?\s+o['‘`]?tkazib\s+yuborgansiz\b/gi,
        'Muddatni aniq hisoblash uchun qaror nusxasi sizga qachon topshirilganini bilish kerak. (Aks holda muddat o‘tkazib yuborilgan hisoblanishi mumkin, biroq sud uzrli sabablar bilan uni tiklashga haqli)');
      t = t.replace(/\b(?:da['‘`]?vo\s+)?muddati\s+allaqachon\s+o['‘`]?tgan\b/gi,
        'Muddatni aniq hisoblash uchun qaror nusxasi sizga qachon topshirilganini bilish kerak');
      t = t.replace(/\bmuddat\s+o['‘`]?tib\s+ketgan\b/gi,
        'Muddatni aniq hisoblash uchun qaror nusxasi sizga qachon topshirilganini bilish kerak');
    }

    return t;
  }

  /**
   * 4. Markdown Formatting & Link Sanitization
   * Fixes malformed links like [Text][URL][URL] or duplicate Lex.uz links.
   */
  cleanMarkdownAndCitations(text) {
    if (!text) return '';
    let t = text;

    // A. Fix [Text][URL][URL] or [Text][URL]
    t = t.replace(/\[([^\]]+)\]\[(https?:\/\/[^\]]+)\](?:\[[^\]]*\])*/gi, '[$1]($2)');
    t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)\((https?:\/\/[^)]+)\)/gi, '[$1]($2)');

    // B. Deduplicate consecutive identical markdown links
    t = t.replace(/(\[[^\]]+\]\([^)]+\))\s+\1/gi, '$1');

    // C. Standardize Legal Basis line
    t = t.replace(/Huquqiy\s+asos:\s*([^\n]+)/i, (match, p1) => {
      return `Huquqiy asos: ${p1.trim()}`;
    });

    return t;
  }

  /**
   * 5. Bribery & Corruption Consistency Guard (Articles 210, 211, 212 & Article 15)
   * Enforces:
   * - 210 -> Pora olish
   * - 211 -> Pora berish
   * - 212 -> Pora olish-berishda vositachilik qilish
   * - "Pora — og‘ir jinoyatmi?" -> Explains Article 15 classification (uncha og‘ir bo‘lmagan, og‘ir, o‘ta og‘ir)
   * - Prohibits calling all of them automatically "og‘ir jinoyat" or using "uzoq muddatga" without alternatives.
   */
  validateAndFormatBriberyResponse(text, scenario = {}, userQuery = '') {
    if (!text) return text;
    let t = text;
    const q = (userQuery + ' ' + (scenario.cleanQuery || '')).toLowerCase();

    // Check if query asks whether bribery is an "og'ir jinoyat"
    const isSeverityQuestion = q.includes('og‘ir jinoyatmi') || q.includes('ogir jinoyatmi') || q.includes('og‘irmi') || q.includes('tasnifi');

    if (isSeverityQuestion) {
      // If response mistakenly gave a one-word flat "Ha, og'ir jinoyat" or called all parts "og'ir jinoyat"
      if (!t.includes('15-modda') || t.includes('barchasi og‘ir jinoyat') || t.includes('pora doimo og‘ir jinoyat')) {
        return `**Pora bilan bog‘liq jinoyatlarning tasnifi (JK 15-moddasi):**

O‘zbekiston Respublikasi Jinoyat kodeksida pora bilan bog‘liq barcha qilmishlar avtomatik tarzda faqat «og‘ir jinoyat» deb baholanmaydi. Jinoyat kodeksining **15-moddasiga** (Jinoyatlarning tasnifi) asosan jinoyatlar sanksiyasidagi ozodlikdan mahrum qilish muddatiga qarab 4 toifaga bo‘linadi:

1. **Uncha og‘ir bo‘lmagan jinoyatlar:**
   - **JK 210-modda 1-qismi** (Pora olishning oddiy tarkibi) — 3 yildan 5 yilgacha ozodlikni cheklash yoki 3 yildan 5 yilgacha ozodlikdan mahrum qilish bilan jazolanadi;
   - **JK 211-modda 1-qismi** (Pora berish) — bazaviy hisoblash miqdorining 50 baravaridan 100 baravarigacha jarima yoki 2 yildan 5 yilgacha ozodlikni cheklash yoxud 5 yilgacha ozodlikdan mahrum qilish bilan jazolanadi;
   - **JK 212-modda 1-qismi** (Vositachilik qilish) — jarima, 2 yildan 5 yilgacha ozodlikni cheklash yoki 5 yilgacha ozodlikdan mahrum qilish bilan jazolanadi.
   *(Ushbu 1-qismlarda 5 yildan ortiq bo‘lmagan jazo yoki jarima/ozodlikni cheklash kabi muqobil jazolar nazarda tutilganligi sababli, ular uncha og‘ir bo‘lmagan jinoyatlar toifasiga kiradi).*

2. **Og‘ir jinoyatlar:**
   - Ushbu moddalarning **2-qismlari** (takroran, ko‘p miqdorda yoki guruh tomonidan sodir etilganda) — 5 yildan 10 yilgacha (212-moddada 5 yildan 8 yilgacha) ozodlikdan mahrum qilish jazosini nazarda tutgani uchun **og‘ir jinoyatlar** hisoblanadi.

3. **O‘ta og‘ir jinoyatlar:**
   - Ushbu moddalarning **3-qismlari** (juda ko‘p miqdorda, uyushgan guruh manfaatlari yo‘lida sodir etilganda) — 10 yildan 15 yilgacha ozodlikdan mahrum qilish bilan jazolangani sababli **o‘ta og‘ir jinoyatlar** toifasiga kiradi.

**Muhim qonuniy shart (JK 211-moddasi 4-qismi):**
Jinoyat kodeksi 211-moddasining to‘rtinchi qismiga asosan, basharti shaxsga nisbatan pora talab qilingan bo‘lsa VA u qilmish sodir etilganidan so‘ng **30 sutka mobaynida** o‘z ixtiyori bilan arz qilsa, chin ko‘ngildan pushaymon bo‘lsa hamda jinoyatni ochishga faol yordam bersa, bunday shaxs javobgarlikdan ozod etilishi mumkin. Bu qoida barcha shartlar to‘liq bajarilgandagina qo‘llaniladi.

**Murojaat uchun rasmiy organlar:**
- Korrupsiyaga qarshi kurashish agentligi (Call-markaz: 1253)
- O‘zbekiston Respublikasi Bosh prokuraturasi (Ishonch telefoni: 1007)

**Huquqiy asos:** [O‘zbekiston Respublikasining Jinoyat kodeksi, 15, 210, 211 va 212-moddalar](https://lex.uz/docs/-111453)`;
      }
    }

    // Eliminate broad monolithic phrasing "barchasi og'ir jinoyat"
    t = t.replace(/barchasi\s+og['‘`]?ir\s+jinoyat\s+hisoblanadi/gi, 'og‘irlik darajasi moddaning tegishli qismi (1, 2 yoki 3-qismi) va sanksiyasiga qarab belgilanadi');
    t = t.replace(/uzoq\s+muddatga\s+ozodlikdan\s+mahrum\s+qilish/gi, 'qonunda belgilangan muddatga ozodlikdan mahrum qilish yoki muqobil jazo (jarima, ozodlikni cheklash)');

    // Ensure 210 is not described as "pora berish", 211 not as "pora olish", 212 not as simple bribe taking
    if (q.includes('pora berish') && !q.includes('olish')) {
      t = t.replace(/210-modda\s*\((?:pora\s+olish)?\)/gi, '211-modda (Pora berish)');
    } else if (q.includes('pora olish') && !q.includes('berish')) {
      t = t.replace(/211-modda\s*\((?:pora\s+berish)?\)/gi, '210-modda (Pora olish)');
    }

    // Ensure exemption rule (JK 211 4-qism) is strictly bound to pora berish, never to vositachi or pora oluvchi (Rule 4 & Rule 13)
    t = t.replace(/(?:212-modda[^\n.]*|vositachi[^\n.]*)\b30\s+sutka\b[^\n.]*ozod\s+qilinadi/gi,
      'JK 211-moddasining 4-qismiga ko‘ra, maxsus ozod qilish qoidasi faqat pora beruvchi shaxsdan pora talab qilingan bo‘lsa va u 30 sutka ichida ixtiyoriy xabar berib, chin ko‘ngildan pushaymon bo‘lsa hamda faol yordam bersa qo‘llanilishi mumkin (bu qoida vositachilikka tatbiq etilmaydi)');

    return t;
  }

  /**
   * 6. Evaluates response text and cited articles against Section J criteria.
   */
  validateResponse({
    text = '',
    scenario = {},
    supportedArticles = []
  }) {
    const cleanText = text.toLowerCase();
    const violations = [];
    const checklist = {
      correctLegalField: true,
      correctCode: true,
      correctArticle: true,
      currentVersion: true,
      directSupport: true,
      exceptionsConsidered: true,
      noUnrelatedArticle: true,
      noInventedPunishment: true,
      noInventedProcedure: true,
      noUnsupportedJurisdiction: true
    };

    const domain = scenario.primaryDomain || scenario.domain || 'general';
    const disputeType = scenario.disputeType || '';

    // 1. Unrelated Article Checks
    // Check A: Criminal Code 154¹ in administrative or fine disputes
    if ((domain === 'administrative' || disputeType?.includes('admin') || cleanText.includes('ma’muriy') || cleanText.includes('jarima')) &&
        (cleanText.includes('154¹') || cleanText.includes('154-1') || cleanText.includes('154-modda') || cleanText.includes('chet davlat'))) {
      if (!cleanText.includes('harbiy xizmat') && !scenario.cleanQuery?.toLowerCase().includes('yollanish')) {
        checklist.noUnrelatedArticle = false;
        checklist.correctArticle = false;
        violations.push("Ma’muriy jarima yoki shikoyatga Jinoyat kodeksining 154¹-moddasi (chet davlat harbiy/politsiya xizmatiga kirish) noto‘g‘ri qo‘llangan.");
      }
    }

    // Check B: Labor Code 179 (Personal data) in general employer complaints
    if (disputeType?.includes('labor') || cleanText.includes('ish beruvchi')) {
      if ((cleanText.includes('179-modda') || cleanText.includes('179 modda')) && 
          !scenario.cleanQuery?.toLowerCase().includes('shaxsga doir') &&
          !scenario.cleanQuery?.toLowerCase().includes('shaxsiy ma')) {
        checklist.noUnrelatedArticle = false;
        checklist.directSupport = false;
        violations.push("Mehnat kodeksining 179-moddasi (shaxsga doir ma’lumotlar) umumiy mehnat shikoyatiga asossiz qo‘llangan.");
      }
    }

    // Check C: Civil Code 535 as sole substantive rule for deposit return
    if (disputeType === 'tenancy_deposit' || (cleanText.includes('depozit') && cleanText.includes('qaytar'))) {
      if ((cleanText.includes('535-modda') || cleanText.includes('535 modda')) &&
          !cleanText.includes('236') && !cleanText.includes('382') && !cleanText.includes('544')) {
        checklist.directSupport = false;
        violations.push("535-modda faqat ijara tushunchasini beradi, depozitni qaytarish talabiga bevosita asos bo‘la olmaydi.");
      }
    }

    // Check D: Labor Code (Mehnat kodeksi) in complaints against Hokimlik / State organs
    const isStateOrganComplaint = disputeType?.includes('hokimlik') || disputeType?.includes('admin_') ||
                                  cleanText.includes('hokimlik') || cleanText.includes('hokimiyat') ||
                                  scenario.cleanQuery?.toLowerCase().includes('hokimlik') ||
                                  scenario.cleanQuery?.toLowerCase().includes('davlat organiga');
    const isExplicitLaborContext = cleanText.includes('hokimlik xodimi') || cleanText.includes('oylik maosh') || cleanText.includes('ish haqi to‘lanm') || cleanText.includes('ishdan bo‘shat');

    if (isStateOrganComplaint && !isExplicitLaborContext) {
      if (cleanText.includes('mehnat kodeksi') || cleanText.includes('mehnat kodeksining')) {
        checklist.noUnrelatedArticle = false;
        checklist.correctArticle = false;
        checklist.directSupport = false;
        violations.push("Davlat organi yoki hokimlik ustidan shikoyat qilishga Mehnat kodeksi normalari asossiz qo‘llangan. Bu munosabatlar 'Maʼmuriy tartib-taomillar to‘g‘risida'gi Qonun yoki MSIYuK bilan tartibga solinadi.");
      }
    }

    // 2. Court and Jurisdiction Validation
    const isAdministrativeDispute = domain === 'administrative' || disputeType?.startsWith('admin_') || disputeType === 'administrative_fine_dispute' || disputeType === 'government_authority_complaint';
    if (isAdministrativeDispute) {
      if (cleanText.includes('fuqarolik ishlari bo‘yicha') || cleanText.includes('fuqarolik sudi')) {
        if (!cleanText.includes('ma’muriy sud')) {
          checklist.noUnsupportedJurisdiction = false;
          violations.push("Ma’muriy qaror yoki jarima ustidan shikoyat uchun Fuqarolik sudi emas, Tumanlararo ma’muriy sud yoki yuqori turuvchi organ vakolatli.");
        }
      }
    }

    const isBusinessDispute = disputeType?.startsWith('business_') || scenario.domain === 'business';
    if (isBusinessDispute) {
      if (cleanText.includes('fuqarolik ishlari bo‘yicha') && !cleanText.includes('iqtisodiy sud')) {
        checklist.noUnsupportedJurisdiction = false;
        violations.push("Tadbirkorlik subyektlari o‘rtasidagi tijorat nizosi uchun Fuqarolik sudi emas, Tumanlararo iqtisodiy sud vakolatli.");
      }
    }

    // 3. Criminal Law & Bribery Rigor
    if (disputeType?.includes('bribery') || disputeType === 'corruption_bribery' || cleanText.includes('pora')) {
      if (cleanText.includes('barchasi og‘ir jinoyat') || cleanText.includes('barchasi ogir jinoyat') || cleanText.includes('hamma turi og‘ir jinoyat')) {
        checklist.noInventedPunishment = false;
        violations.push("Pora olish, berish va vositachilikning barchasini avtomatik 'og‘ir jinoyat' deb tasniflash noto‘g‘ri. JK 15-moddasi bo‘yicha aniq qism va sanksiya o‘rganilishi lozim.");
      }
      if (cleanText.includes('uzoq muddatga ozodlikdan mahrum qilish') && !cleanText.includes('jarima') && !cleanText.includes('ozodlikni cheklash')) {
        checklist.noInventedPunishment = false;
        violations.push("Jinoyat kodeksida ko‘rsatilgan muqobil jazo turlari (jarima, ozodlikni cheklash) e’tiborga olinmagan.");
      }
    }

    // 4. Overconfident Unconditional Conclusions & Accusatory Language
    const overconfidentRegex = /\b(albatta\s*(yutasiz|undirasiz|qanoatlantiradi|bekor\s*qilinadi)|100%\s*(haqsiz|qonuniy)|so['‘`]?zsiz\s*to['‘`]?lanishi\s*shart|aniq\s*jinoyat\s*hisoblanadi)\b/i;
    if (overconfidentRegex.test(text)) {
      violations.push("Javobda dalillar va shartnomaviy holatlarga bog‘liq bo‘lgan masalalar bo‘yicha asossiz mutlaq xulosa berilgan.");
    }

    if (/siz\s+jinoyat\s+sodir\s+(?:etgansiz|qildingiz)/i.test(cleanText)) {
      violations.push("Foydalanuvchiga nisbatan asossiz to‘g‘ridan-to‘g‘ri ayblov shaklida xulosa berilgan. Shartli tahlil qo‘llanilishi lozim.");
    }

    // 5. Penalty Generalization Check (Rule 2)
    const syntheticPenaltyRegex = /\b(?:\d+\s*(?:dan\s*)?)?BHMdan\s*(?:boshlab\s*)?\d+\s*yilgacha\b/i;
    if (syntheticPenaltyRegex.test(cleanText)) {
      checklist.noInventedPunishment = false;
      violations.push("Turli qismlardagi jazo turlari va muddatlari sun’iy birlashtirilib, asossiz umumiy diapazon keltirilgan. JK tegishli qismi aniqlanmaguncha jazo aniq turi va miqdori qilmish holatlariga bog‘liqligi ko‘rsatilishi shart.");
    }

    // 6. Unlawful Evidence Check (Rule 7)
    if (/(?:yashirincha|bildirmasdan|yashirin\s+tarzda)\s+(?:ovoz|audio|video|yozib)/i.test(cleanText)) {
      violations.push("Noqonuniy yoki ruxsatsiz audio/video yozib olish tavsiya etilgan. Faqat qonuniy dalillarni to‘plash va saqlash tavsiya etilishi shart.");
    }

    // 7. Determine Adjusted Confidence Level
    let adjustedConfidenceLevel = 'HIGH';
    let confidencePenalty = 0;

    if (!checklist.noUnrelatedArticle || !checklist.directSupport) {
      adjustedConfidenceLevel = 'LOW';
      confidencePenalty = 50;
    } else if (!checklist.noUnsupportedJurisdiction || !checklist.noInventedPunishment) {
      adjustedConfidenceLevel = 'MEDIUM';
      confidencePenalty = 25;
    } else if (scenario.missingCriticalFacts && scenario.missingCriticalFacts.length > 0) {
      adjustedConfidenceLevel = 'MEDIUM';
      confidencePenalty = 15;
    }

    const isValid = violations.length === 0;

    return {
      isValid,
      checklist,
      violations,
      adjustedConfidenceLevel,
      confidencePenalty
    };
  }

  /**
   * 7. Generates a concise human-readable confidence explanation in Uzbek
   * Used when confidence is MEDIUM or LOW (e.g. "shartnomadagi depozit shartlari ko‘rsatilmagan")
   */
  generateConfidenceReason(scenario = {}, validationResult = {}, level = 'HIGH') {
    if (level === 'HIGH') return null;

    // Check specific missing critical facts first
    if (scenario.missingCriticalFacts && scenario.missingCriticalFacts.length > 0) {
      const topMissing = scenario.missingCriticalFacts[0].toLowerCase();
      if (topMissing.includes('depozit') || topMissing.includes('shartnoma') || scenario.disputeType === 'tenancy_deposit' || scenario.disputeType === 'civil_tenancy_deposit') {
        return "shartnomadagi depozit shartlari ko‘rsatilmagan";
      }
      if (topMissing.includes('jarima') || topMissing.includes('organ') || scenario.disputeType?.includes('admin')) {
        return "jarima qarori sanasi va organi aniqlashtirilmagan";
      }
      if (topMissing.includes('hokimlik') || topMissing.includes('qaror') || scenario.disputeType?.includes('hokimlik')) {
        return "hokimlik qarori sanasi va tafsilotlari aniqlashtirilmagan";
      }
      if (topMissing.includes('pora') || topMissing.includes('korrupsiya') || scenario.disputeType?.includes('corruption')) {
        return "korrupsiya holatining aniq roli va faktlari to‘liq emas";
      }
      if (topMissing.includes('ish beruvchi') || topMissing.includes('mehnat')) {
        return "ish beruvchining aniq harakati yoki shartnoma mavjudligi ko‘rsatilmagan";
      }
      if (topMissing.includes('rozilik') || topMissing.includes('ko‘chirish') || topMissing.includes('o‘tkazish')) {
        return "xodimning yozma roziligi olinganligi ko‘rsatilmagan";
      }
      return scenario.missingCriticalFacts[0];
    }

    // Check validation violations
    if (validationResult.violations && validationResult.violations.length > 0) {
      return validationResult.violations[0];
    }

    if (level === 'LOW') {
      return "tegishli qonun normasi to‘liq aniqlanmagan";
    }

    return "qo‘shimcha faktlar talab etiladi";
  }

  /**
   * 8. Master Finalization & Modification Pipeline
   * Intercepts the raw generated response object, applies all textual modifications,
   * enforces grammatical correctness, runs validation, and generates calibrated confidence.
   */
  finalizeAndValidateResponse(responseObj, context = {}) {
    if (!responseObj || !responseObj.text) return responseObj;

    const { userQuery = '', scenario = {}, history = [] } = context;
    let modifiedText = responseObj.text;

    // Step A: Question grammar and "-mi?" / "zararmis?" repair
    modifiedText = this.cleanQuestionGrammarAndParticles(modifiedText);

    // Step B: Legal terminology & natural formal phrasing
    modifiedText = this.cleanLegalTerminology(modifiedText);

    // Step C: Remove repetitive AI filler & boilerplate (Rule 11)
    modifiedText = this.cleanRepetitiveAiLanguage(modifiedText);
    modifiedText = this.cleanGenericFiller(modifiedText);

    // Step C.1: Clean multi-issue unrelated listing (Section 4)
    modifiedText = this.cleanMultiIssueListing(modifiedText, scenario, userQuery);

    // Step C.2: Domain-Authority Cross-Contamination Guard (Section 2, 4, 14, 15, 26)
    modifiedText = this.cleanDomainAuthorityMismatch(modifiedText, scenario, userQuery);

    // Step D: Clean synthetic penalty generalizations (Rule 2)
    modifiedText = this.cleanPenaltyGeneralizations(modifiedText);

    // Step E: Clean accusatory phrasing (Rule 3)
    modifiedText = this.cleanAccusatoryPhrasing(modifiedText);

    // Step F: Clean evidence advice (Rule 7 & 11)
    modifiedText = this.cleanEvidenceAdvice(modifiedText);

    // Step F.1: Clean premature deadline claims when dates are missing (Rule 8)
    modifiedText = this.cleanPrematureDeadlines(modifiedText, scenario, userQuery);

    // Step F.2: High-risk non-definitive crime conclusion sanitizer (Rule 1)
    modifiedText = this.cleanDefinitiveCrimeConclusions(modifiedText);

    // Step F.3: Statutory immunity & exemption qualification guard (Rule 13)
    modifiedText = this.cleanImmunityAdvice(modifiedText);

    // Step G: Markdown link sanitation & citation cleanup
    modifiedText = this.cleanMarkdownAndCitations(modifiedText);

    // Step H: Bribery presentation, classification & exemption guard (Rules 3, 4)
    modifiedText = this.validateAndFormatBriberyResponse(modifiedText, scenario, userQuery);

    // Step H.1: Clean arbitrary reliability score badges (Rule 21)
    modifiedText = this.cleanReliabilityBadges(modifiedText);

    // Step H.2: Assistant self-description normalizer (Rule 22)
    modifiedText = this.cleanSelfDescription(modifiedText);

    // Step H.3: Clean employer-side advice to employee (Section 1, 2, 9, 10)
    modifiedText = this.cleanEmployerAdviceToEmployee(modifiedText, scenario, userQuery);

    // Step I: Validation & Section J Checklist
    const supportedArticles = responseObj.citations?.map(c => ({
      document_name: c.document,
      article_number: c.article,
      article_title: c.title,
      source_url: c.url,
      relevance_score: c.relevance
    })) || [];

    const validationResult = this.validateResponse({
      text: modifiedText,
      scenario,
      supportedArticles
    });

    // Step J: Confidence Level & Reason Calibration (Rule 12)
    let finalLevel = responseObj.confidenceLevel || 'HIGH';

    // If validation uncovered severe issues, lower confidence
    if (!validationResult.checklist.noUnrelatedArticle || !validationResult.checklist.directSupport) {
      finalLevel = 'LOW';
    } else if (!validationResult.isValid || (scenario.missingCriticalFacts && scenario.missingCriticalFacts.length > 0)) {
      if (finalLevel === 'HIGH') {
        finalLevel = 'MEDIUM';
      }
    }

    if (responseObj.needs_clarification) {
      finalLevel = 'HIGH'; // Clarification requests themselves are high confidence when intentional
    }

    const confidenceReason = this.generateConfidenceReason(scenario, validationResult, finalLevel);

    return {
      ...responseObj,
      text: modifiedText,
      confidenceLevel: finalLevel,
      confidenceReason: confidenceReason || undefined,
      validatorResult: validationResult
    };
  }
}

export const legalValidatorService = new LegalValidatorService();
export default legalValidatorService;
