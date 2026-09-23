import { cyrillicToLatin, normalizeSearchText } from '../utils/transliterate.js';
import { conversationStateService } from './conversationStateService.js';

// Pre-defined direct responses for instant greetings and everyday queries
const CASUAL_IDENTITY_RESPONSE = "Men AdvokatAI — O‘zbekiston qonunchiligi asosida ishlovchi AI huquqiy yordamchisiman.";

const GREETING_RESPONSE = "Assalomu alaykum! Men AdvokatAI yuridik maslahatchisiman. Sizga O‘zbekiston qonunchiligi bo‘yicha qanday yordam bera olaman?";

const COURTESY_RESPONSE = "Arzimaydi! AdvokatAI doim xizmatingizda. Yana qandaydir huquqiy savolingiz bo'lsa, bemalol yozishingiz mumkin.";

const CAPABILITIES_RESPONSE = `Men AdvokatAI — O‘zbekiston Respublikasi qonunchiligi (Konstitutsiya, Mehnat kodeksi, Fuqarolik kodeksi, Jinoyat kodeksi, Maʼmuriy javobgarlik to‘g‘risidagi kodeks va b.) bo‘yicha ixtisoslashgan intellektual huquqiy yordamchiman.

Quyidagi masalalarda yordam bera olaman:
1. Ish beruvchi va xodim munosabatlari, maosh kechikishi, mehnat shartnomasi va mehnat huquqi.
2. Turar joy ijarasi, depozit nizolari, mulk oldi-sotdisi va fuqarolik shartnomalari.
3. Jinoyat va maʼmuriy huquqbuzarliklar, jarimalar va korrupsiyaga oid masalalar.
4. Fuqarolarning murojaatlari va davlat organlari bilan munosabatlar.
5. Qonunlarning aniq moddalarini tushuntirish va Lex.uz rasmiy havolalarini taqdim etish.

Huquqiy savolingizni bemalol yozishingiz mumkin!`;

const HOW_TO_ASK_EXPLANATION = `Savol berishda vaziyatni iloji boricha aniq bayon qilish tavsiya etiladi:
1. Kimlar ishtirok etayotgani (masalan: ish beruvchi va xodim, ijarachi va uy egasi).
2. Nima sodir bo‘lgani (masalan: oylik kechiktirilmoqda, asossiz ishdan bo‘shatish, shartnoma buzilishi).
3. Qanday hujjatlar mavjudligi (mehnat shartnomasi, kvitansiya, buyruq).
4. Siz kutayotgan natija (zararni undirish, ishga tiklanish, shartnomani bekor qilish).

Marhamat, savolingizni yozing!`;

const OUT_OF_SCOPE_EXPLANATION = "Ushbu umumiy mavzu bo‘yicha savolingizni tushundim. Biroq men AdvokatAI yuridik maslahatchisiman va O‘zbekiston Respublikasi qonunchiligi, huquqiy muammolar, shartnomalar, mehnat, mulk va sud amaliyoti bo‘yicha savollarga ixtisoslashganman. Ob-havo, taomlar yoki boshqa umumiy mavzularda ma'lumot bera olmayman. Agar qonunlar yoki huquqlaringiz bo‘yicha savolingiz bo‘lsa, bajonidil yordam beraman!";

// 19+ Legal Taxonomy (Section 17)
export const LEGAL_TAXONOMY = {
  constitutional: { name: 'Konstitutsiyaviy huquq', doc_id: 'constitution', priority: 1 },
  labor: { name: 'Mehnat huquqi', doc_id: 'labor_code', priority: 1 },
  civil: { name: 'Fuqarolik huquqi', doc_id: 'civil_code', priority: 1 },
  criminal: { name: 'Jinoyat huquqi', doc_id: 'criminal_code', priority: 1 },
  administrative: { name: 'Maʼmuriy huquq', doc_id: 'administrative_code', priority: 1 },
  property_tenancy: { name: 'Uy-joy va mulk ijarasi', doc_id: 'civil_code', priority: 1 },
  family: { name: 'Oila huquqi', doc_id: 'civil_code', priority: 2 },
  tax: { name: 'Soliq huquqi', doc_id: 'administrative_code', priority: 2 },
  land: { name: 'Yer huquqi', doc_id: 'civil_code', priority: 2 },
  business: { name: 'Biznes va tadbirkorlik', doc_id: 'civil_code', priority: 2 },
  consumer_protection: { name: 'Isteʼmolchilar huquqlarini himoya qilish', doc_id: 'civil_code', priority: 2 },
  intellectual_property: { name: 'Intellektual mulk', doc_id: 'civil_code', priority: 2 },
  social_protection: { name: 'Ijtimoiy himoya', doc_id: 'labor_code', priority: 2 },
  education: { name: 'Taʼlim huquqi', doc_id: 'labor_code', priority: 3 },
  migration: { name: 'Migratsiya va fuqarolik', doc_id: 'administrative_code', priority: 2 },
  traffic_transport: { name: 'Yo‘l harakati va transport', doc_id: 'administrative_code', priority: 1 },
  enforcement_proceedings: { name: 'Sud qarorlarini ijro etish (MIB)', doc_id: 'administrative_code', priority: 2 },
  judicial_procedure: { name: 'Sud protsessi', doc_id: 'civil_code', priority: 2 },
  anti_corruption: { name: 'Korrupsiyaga qarshi kurashish', doc_id: 'criminal_code', priority: 1 }
};

/**
 * Normalizes Russian / Uzbek mixed legal terminology (Section 37).
 */
export function normalizeMixedLegalTerms(text) {
  if (!text) return '';
  let norm = text;
  const replacements = [
    [/\btrudovoy\s*(dogovor|shartnoma)\b/gi, 'mehnat shartnomasi'],
    [/\b(dogovor\s*arenda|arenda\s*dogovor)\b/gi, 'ijara shartnomasi'],
    [/\barendator\b/gi, 'ijarachi'],
    [/\barendodatel\b/gi, 'ijaraga beruvchi'],
    [/\bshtraf\b/gi, 'jarima'],
    [/\bpropiska\b/gi, 'doimiy yashash joyi bo\'yicha ro\'yxat'],
    [/\bpretenziya\b/gi, 'talabnoma'],
    [/\braschet\b/gi, 'yakuniy hisob-kitob'],
    [/\bdekret\b/gi, 'homiladorlik va tug\'ish ta\'tili'],
    [/\botpusk\b/gi, 'mehnat ta\'tili'],
    [/\baliment\b/gi, 'aliment'],
    [/\bzalog\b/gi, 'garov depozit']
  ];
  for (const [pattern, rep] of replacements) {
    norm = norm.replace(pattern, rep);
  }
  return norm;
}

// Domain Mapping to Official Registry IDs
export const DOMAIN_TO_DOCUMENT_ID = {
  labor: 'labor_code',
  employment: 'labor_code',
  civil: 'civil_code',
  property: 'civil_code',
  contract: 'civil_code',
  tenancy: 'civil_code',
  criminal: 'criminal_code',
  crime: 'criminal_code',
  administrative: 'administrative_code',
  traffic: 'administrative_code',
  fine: 'administrative_code',
  constitution: 'constitution',
  rights: 'constitution',
  family: 'family_code',
  tax: 'tax_code',
  land: 'land_code',
  inheritance: 'civil_code'
};

// UI Law Group to internal Document ID
export const LAW_GROUP_MAP = {
  'mehnat_kodeksi': 'labor_code',
  'labor_code': 'labor_code',
  'fuqarolik_kodeksi': 'civil_code',
  'civil_code': 'civil_code',
  'jinoyat_kodeksi': 'criminal_code',
  'criminal_code': 'criminal_code',
  'mamuriy_javobgarlik': 'administrative_code',
  'administrative_code': 'administrative_code',
  'mamuriy_kodeks': 'administrative_code',
  'konstitutsiya': 'constitution',
  'constitution': 'constitution',
  'oila_kodeksi': 'family_code',
  'family_code': 'family_code',
  'soliq_kodeksi': 'tax_code',
  'tax_code': 'tax_code',
  'yer_kodeksi': 'land_code',
  'land_code': 'land_code',
  'all': null,
  'auto': null,
  'barchasi': null
};

// Official Statutory Article Bounds
export const CODE_LIMITS = {
  constitution: { name: 'Oʻzbekiston Respublikasi Konstitutsiyasi', max: 155, key: 'Konstitutsiya' },
  labor_code: { name: 'Mehnat kodeksi', max: 593, key: 'Mehnat kodeksi' },
  civil_code: { name: 'Fuqarolik kodeksi', max: 1199, key: 'Fuqarolik kodeksi' },
  criminal_code: { name: 'Jinoyat kodeksi', max: 302, key: 'Jinoyat kodeksi' },
  administrative_code: { name: 'Maʼmuriy javobgarlik toʻgʻrisidagi kodeks', max: 348, key: 'Maʼmuriy javobgarlik toʻgʻrisidagi kodeks' },
  family_code: { name: 'Oila kodeksi', max: 238, key: 'Oila kodeksi' },
  tax_code: { name: 'Soliq kodeksi', max: 483, key: 'Soliq kodeksi' },
  land_code: { name: 'Yer kodeksi', max: 91, key: 'Yer kodeksi' }
};

// Section C: Fine-Grained Topic Registry with Legal Guardrails & Jurisdiction
export const FINE_GRAINED_TOPICS = {
  // --- LABOR LAW TOPICS ---
  labor_contract_modification: {
    id: 'labor_contract_modification',
    name: 'Mehnat shartnomasi shartlarini o‘zgartirish',
    domain: 'labor',
    allowedDocumentIds: ['labor_code'],
    disallowedDocumentIds: ['administrative_code', 'criminal_code', 'civil_code'],
    targetArticleNumbers: ['133', '134', '135'],
    forbiddenArticleNumbers: ['179'],
    jurisdictionRule: 'Fuqarolik ishlari bo‘yicha tumanlararo sud yoki Davlat mehnat inspeksiyasi (1176)',
    proceduralRoute: 'Davlat mehnat inspeksiyasiga (1176) murojaat qilish yoki Fuqarolik ishlari bo‘yicha sudga daʼvo kiritish',
    triggers: ['shartnomani ozgartirish', 'shartnoma shartlarini ozgartirish', 'stavkani kamaytirish', 'ish vaqtini ozgartirish', 'shartnomani o‘zgartirish', 'shartnomani o\'zgartirish']
  },
  labor_transfer: {
    id: 'labor_transfer',
    name: 'Xodimni boshqa ishga (lavozimga) o‘tkazish',
    domain: 'labor',
    allowedDocumentIds: ['labor_code'],
    disallowedDocumentIds: ['administrative_code', 'criminal_code', 'civil_code'],
    targetArticleNumbers: ['138', '145', '137', '144'],
    forbiddenArticleNumbers: ['116', '179'],
    jurisdictionRule: 'Fuqarolik ishlari bo‘yicha tumanlararo sud yoki Davlat mehnat inspeksiyasi (1176)',
    proceduralRoute: 'Xodimning roziligisiz boshqa doimiy ishga o‘tkazish taqiqlanadi (MK 138-modda)',
    triggers: [
      'boshqa ishga otkazish', 'boshqa ishga o‘tkazish', 'boshqa ishga o\'tkazish',
      'boshqa lavozimga', 'boshqa filialga', 'roziligimsiz boshqa ishga',
      'majburan otkazish', 'majburan o‘tkazish', 'boshqa joyga otkazish', 'boshqa joyga o‘tkazish',
      'boshqa ishga otkazmoqda', 'boshqa ishga o‘tkazmoqda',
      'boshqa lavozimga otkazish', 'boshqa lavozimga o‘tkazish', 'boshqa lavozimga o\'tkazish',
      'boshqa lavozimga otkazmoqchi', 'boshqa lavozimga o‘tkazmoqchi',
      'boshqa lavozimga o\'tkazdi', 'boshqa lavozimga o‘tkazishdi', 'boshqa lavozimga otkazishdi',
      'meni boshqa lavozimga', 'roziliksiz boshqa ishga', 'roziligimsiz boshqa lavozimga',
      'boshqa doimiy lavozimga', 'boshqa doimiy ishga', 'lavozimga o‘tkazish', 'lavozimga o\'tkazish', 'lavozimga otkazish'
    ]
  },
  labor_additional_work: {
    id: 'labor_additional_work',
    name: 'Bir necha kasbda ishlash va qo‘shimcha vazifa yuklash',
    domain: 'labor',
    allowedDocumentIds: ['labor_code'],
    disallowedDocumentIds: ['administrative_code', 'criminal_code', 'civil_code'],
    targetArticleNumbers: ['116', '137'],
    forbiddenArticleNumbers: ['138', '145', '179'],
    jurisdictionRule: 'Fuqarolik ishlari bo‘yicha tumanlararo sud yoki Davlat mehnat inspeksiyasi (1176)',
    proceduralRoute: 'Davlat mehnat inspeksiyasiga (1176) murojaat qilish',
    triggers: ['qoshimcha ish', 'qo‘shimcha ish', 'qo\'shimcha ish', 'qoshimcha vazifa', 'qo‘shimcha vazifa', 'bir necha kasbda', 'boshqa ishni qildiryapti', 'oz vazifasidan tashqari', 'o‘z vazifasidan tashqari', 'ortiqcha ish', 'ortiqcha vazifa']
  },
  labor_health_transfer: {
    id: 'labor_health_transfer',
    name: 'Salomatlik holati bo‘yicha yengilroq ishga o‘tkazish',
    domain: 'labor',
    allowedDocumentIds: ['labor_code'],
    disallowedDocumentIds: ['administrative_code', 'criminal_code', 'civil_code'],
    targetArticleNumbers: ['143', '284'],
    forbiddenArticleNumbers: ['179'],
    jurisdictionRule: 'Fuqarolik ishlari bo‘yicha tumanlararo sud yoki Davlat mehnat inspeksiyasi (1176)',
    proceduralRoute: 'Tibbiy xulosa asosida ish beruvchiga yozma ariza topshirish, rad etilsa Mehnat inspeksiyasiga murojaat',
    triggers: ['sogligi boyicha', 'sog‘lig‘i bo‘yicha', 'salomatligi sababli', 'yengil ishga', 'yengilroq ishga', 'tibbiy xulosa', 'kasallik tufayli ishni']
  },
  labor_unpaid_wages: {
    id: 'labor_unpaid_wages',
    name: 'Ish haqi kechikishi va to‘lanmasligi',
    domain: 'labor',
    allowedDocumentIds: ['labor_code'],
    disallowedDocumentIds: ['administrative_code', 'criminal_code', 'civil_code'],
    targetArticleNumbers: ['253', '333', '244'],
    forbiddenArticleNumbers: ['179', '571', '575', '535'],
    jurisdictionRule: 'Fuqarolik ishlari bo‘yicha tumanlararo sud yoki Davlat mehnat inspeksiyasi (1176)',
    proceduralRoute: 'Davlat mehnat inspeksiyasi (1176) yoki sud buyrug‘i / daʼvo arizasi orqali undirish',
    triggers: ['oylikni bermayapti', 'maosh tolamayapti', 'maosh to‘lamayapti', 'ish haqi kechik', 'oyligim berilmadi', 'ish haqini undirish', 'hisob-kitob qilinmadi', 'oylikni tolamayapti', 'oylikni to‘lamayapti', 'oylik kechik', 'ish haqini tolamayapti', 'ish haqini to‘lamayapti', 'ish haqi tolamayapti', 'ish haqi to‘lamayapti', 'ish haqim tolanmayapti', 'ish haqim to‘lanmayapti', 'ish beruvchi ish haqini to‘lamayapti', 'ish beruvchi ish haqini tolamayapti']
  },
  labor_termination: {
    id: 'labor_termination',
    name: 'Mehnat shartnomasini bekor qilish va ishdan bo‘shatish',
    domain: 'labor',
    allowedDocumentIds: ['labor_code'],
    disallowedDocumentIds: ['administrative_code', 'criminal_code', 'civil_code'],
    targetArticleNumbers: ['160', '161', '163', '168'],
    forbiddenArticleNumbers: ['179'],
    jurisdictionRule: 'Fuqarolik ishlari bo‘yicha tumanlararo sud',
    proceduralRoute: 'Buyruq nusxasi berilgan kundan 1 oy ichida Fuqarolik sudiga ishga tiklash daʼvosi',
    triggers: ['ishdan boshatish', 'ishdan bo‘shatish', 'ishdan haydash', 'asossiz boshatish', 'asossiz bo‘shatish', 'majburiy ariza', 'shartnomani bekor qilish', 'ishdan boshat']
  },
  labor_leave: {
    id: 'labor_leave',
    name: 'Mehnat ta’tili va ijtimoiy ta’tillar',
    domain: 'labor',
    allowedDocumentIds: ['labor_code'],
    disallowedDocumentIds: ['administrative_code', 'criminal_code', 'civil_code'],
    targetArticleNumbers: ['216', '217', '221', '228'],
    forbiddenArticleNumbers: ['179'],
    jurisdictionRule: 'Davlat mehnat inspeksiyasi (1176) yoki Fuqarolik ishlari bo‘yicha tumanlararo sud',
    proceduralRoute: 'Ish beruvchiga ariza yoki Mehnat inspeksiyasiga shikoyat',
    triggers: ['mehnat tatili', 'mehnat ta’tili', 'tatil berilmayapti', 'ta’til berilmayapti', 'tatil puli', 'ta’til puli', 'otpusk', 'dekret', 'homiladorlik tatili', 'homiladorlik ta’tili']
  },
  labor_disputes: {
    id: 'labor_disputes',
    name: 'Mehnat nizolarini ko‘rib chiqish',
    domain: 'labor',
    allowedDocumentIds: ['labor_code'],
    disallowedDocumentIds: ['administrative_code', 'criminal_code', 'civil_code'],
    targetArticleNumbers: ['535', '537', '545', '560'],
    forbiddenArticleNumbers: ['179'],
    jurisdictionRule: 'Davlat mehnat inspeksiyasi (1176) yoki Fuqarolik ishlari bo‘yicha tumanlararo sud',
    proceduralRoute: 'Davlat mehnat inspeksiyasi (1176) yoki sudga murojaat qilish',
    triggers: ['mehnat nizosi', 'mehnat inspektori qarori', 'mehnat inspektorining qarori', 'inspektor qaroridan norozi']
  },
  labor_commission_challenge: {
    id: 'labor_commission_challenge',
    name: 'Mehnat nizolari komissiyasi (MNK) qarori ustidan sudga shikoyat qilish',
    domain: 'labor',
    allowedDocumentIds: ['labor_code'],
    disallowedDocumentIds: ['administrative_code', 'criminal_code', 'civil_code'],
    targetArticleNumbers: ['556', '557', '558', '559'],
    forbiddenArticleNumbers: ['179'],
    jurisdictionRule: 'Fuqarolik ishlari bo‘yicha tumanlararo sud (davlat bojidan ozod)',
    proceduralRoute: 'MNK qarori nusxasi topshirilgan kundan 10 kun ichida Fuqarolik sudiga daʼvo arizasi topshirish',
    triggers: ['mehnat nizolari komissiyasi', 'komissiya qarori', 'komissiya qaroridan norozi', 'mnk qarori', 'komissiya qaror ustidan', 'komissiya 10 kunda', 'komissiya kormadi', 'komissiya ko‘rmadi', 'komissiya hal qilmadi', 'komissiya qaror chiqargan', 'mehnat komissiyasi qarori']
  },

  // --- RENTAL / TENANCY TOPICS ---
  tenancy_deposit: {
    id: 'tenancy_deposit',
    name: 'Ijara depoziti (garovi) va uni qaytarish',
    domain: 'civil',
    allowedDocumentIds: ['civil_code'],
    disallowedDocumentIds: ['criminal_code', 'administrative_code', 'labor_code'],
    targetArticleNumbers: ['544', '382', '236'],
    forbiddenArticleNumbers: ['535'], // 535 must not be sole substantive remedy
    jurisdictionRule: 'Fuqarolik ishlari bo‘yicha tumanlararo sud',
    proceduralRoute: 'Avval yozma talabnoma (pretenziya) yuborish, so‘ngra Fuqarolik sudiga daʼvo arizasi',
    triggers: ['depozit', 'zalog', 'depozitni qaytarish', 'depozit qaytarmayapti', 'depozitimni qaytarishmayapti', 'depozitni qaytarishmayapti', 'garov puli', 'depozitni ushlab']
  },
  tenancy_eviction: {
    id: 'tenancy_eviction',
    name: 'Uy-joydan chiqarish (FAQAT SUD TARTIBIDA)',
    domain: 'civil',
    allowedDocumentIds: ['civil_code'],
    disallowedDocumentIds: ['criminal_code', 'administrative_code', 'labor_code'],
    targetArticleNumbers: ['615', '551'],
    forbiddenArticleNumbers: [],
    jurisdictionRule: 'Fuqarolik ishlari bo‘yicha tumanlararo sud',
    proceduralRoute: 'Faqat Fuqarolik ishlari bo‘yicha sud qarori va MIB ijrosi orqali; o‘zboshimchalik bilan chiqarish noqonuniy',
    triggers: ['uydan chiqarish', 'chiqarib yuborish', 'uydan haydash', 'majburan chiqarish', 'kvartiradan chiqar', 'uydan chiqar', 'chiqarib yubormoqchi']
  },
  tenancy_rent: {
    id: 'tenancy_rent',
    name: 'Ijara to‘lovlari va ijara haqi',
    domain: 'civil',
    allowedDocumentIds: ['civil_code'],
    disallowedDocumentIds: ['criminal_code', 'administrative_code', 'labor_code'],
    targetArticleNumbers: ['544', '612'],
    forbiddenArticleNumbers: [],
    jurisdictionRule: 'Fuqarolik ishlari bo‘yicha tumanlararo sud',
    proceduralRoute: 'Yozma talabnoma yuborish, natija bo‘lmasa Fuqarolik sudiga daʼvo kiritish',
    triggers: ['ijara haqi', 'ijara tolovi', 'ijara to‘lovi', 'arenda puli', 'ijara tolamayapti', 'ijara to‘lamayapti']
  },
  tenancy_damage: {
    id: 'tenancy_damage',
    name: 'Mulkka yetkazilgan zarar va ta’mirlash',
    domain: 'civil',
    allowedDocumentIds: ['civil_code'],
    disallowedDocumentIds: ['criminal_code', 'administrative_code', 'labor_code'],
    targetArticleNumbers: ['544', '985'],
    forbiddenArticleNumbers: [],
    jurisdictionRule: 'Fuqarolik ishlari bo‘yicha tumanlararo sud',
    proceduralRoute: 'Ikki tomonlama dalolatnoma (akt) tuzish va sud orqali zararni undirish',
    triggers: ['mulkka zarar', 'kvartirani buzish', 'remont puli', 'tamir xarajati', 'ta’mir xarajati', 'zararni qoplash']
  },
  tenancy_cancellation: {
    id: 'tenancy_cancellation',
    name: 'Ijara shartnomasini muddatidan oldin bekor qilish',
    domain: 'civil',
    allowedDocumentIds: ['civil_code'],
    disallowedDocumentIds: ['criminal_code', 'administrative_code', 'labor_code'],
    targetArticleNumbers: ['615', '551', '382'],
    forbiddenArticleNumbers: ['116', '138', '179', '535'],
    jurisdictionRule: 'Fuqarolik ishlari bo‘yicha tumanlararo sud',
    proceduralRoute: 'Ogohlantirish xati yuborish, nizo hal bo‘lmasa Fuqarolik sudiga daʼvo kiritish',
    triggers: [
      'ijara shartnomasini bekor qilish', 'arenda bekor', 'shartnomadan chiqish', 'ijarani toxtatish', 'ijarani to‘xtatish',
      'muddatidan oldin chiqmoqchiman', 'muddatidan oldin chiqish', 'chiqib ketmoqchiman', 'chiqib ketish',
      'shartnomani bekor', 'bekor qilmoqchiman', 'ogohlantirish yozilgan', 'ijaradan chiqish'
    ]
  },
  tenancy_contract: {
    id: 'tenancy_contract',
    name: 'Ijara shartnomasini rasmiylashtirish va soliq ro‘yxati',
    domain: 'civil',
    allowedDocumentIds: ['civil_code'],
    disallowedDocumentIds: ['criminal_code', 'administrative_code', 'labor_code'],
    targetArticleNumbers: ['536', '603'],
    forbiddenArticleNumbers: [],
    jurisdictionRule: 'Fuqarolik ishlari bo‘yicha tumanlararo sud',
    proceduralRoute: 'ijara.soliq.uz portali orqali ro‘yxatdan o‘tkazish',
    triggers: ['ijara shartnomasi tuzish', 'ijara shartnomasi rasmiylashtirish', 'soliqda royxat', 'soliqda ro‘yxat', 'ijara soliq']
  },
  tenancy_debt: {
    id: 'tenancy_debt',
    name: 'Ijara qarzini undirish',
    domain: 'civil',
    allowedDocumentIds: ['civil_code'],
    disallowedDocumentIds: ['criminal_code', 'administrative_code', 'labor_code'],
    targetArticleNumbers: ['236', '382', '544'],
    forbiddenArticleNumbers: [],
    jurisdictionRule: 'Fuqarolik ishlari bo‘yicha tumanlararo sud',
    proceduralRoute: 'Pretenziya yuborish, so‘ngra Fuqarolik sudiga daʼvo arizasi kiritish',
    triggers: ['ijara qarzi', 'arenda qarzi', 'ijaradan qarz', 'ijara puli qarzdorlik']
  },

  // --- ADMINISTRATIVE LAW TOPICS ---
  admin_appeal: {
    id: 'admin_appeal',
    name: 'Ma’muriy jarima yoki qaror ustidan shikoyat berish',
    domain: 'administrative',
    allowedDocumentIds: ['administrative_code'],
    disallowedDocumentIds: ['criminal_code'],
    targetArticleNumbers: ['314', '315', '316', '317'],
    forbiddenArticleNumbers: ['154', '154-1'],
    jurisdictionRule: 'Yuqori turuvchi organ yoki Tumanlararo ma’muriy sud',
    proceduralRoute: '10 kunlik muddatda Tumanlararo ma’muriy sudga yoki yuqori organga shikoyat topshirish',
    triggers: ['jarimadan shikoyat', 'jarima ustidan shikoyat', 'jarimaga etiroz', 'jarimaga e’tiroz', 'jarimani bekor qilish', 'qaror ustidan shikoyat', 'radar jarimasi ustidan', 'yhx jarimasi ustidan', 'yhx radar jarimasi ustidan']
  },
  admin_fine: {
    id: 'admin_fine',
    name: 'Ma’muriy jarima qarori',
    domain: 'administrative',
    allowedDocumentIds: ['administrative_code'],
    disallowedDocumentIds: ['criminal_code'],
    targetArticleNumbers: ['314', '315', '316', '317', '332'],
    forbiddenArticleNumbers: ['154', '154-1'],
    jurisdictionRule: 'Yuqori turuvchi organ/mansabdor shaxs yoki Tumanlararo ma’muriy sud',
    proceduralRoute: 'Qaror nusxasi topshirilgan kundan 10 kun ichida Tumanlararo ma’muriy sudga yoki yuqori organga shikoyat',
    triggers: ['mamuriy jarima', 'ma’muriy jarima', 'jarima togrisida qaror', 'jarima to‘g‘risida qaror', 'radar jarimasi', 'yhx jarimasi', 'jarima yozildi']
  },
  admin_protocol: {
    id: 'admin_protocol',
    name: 'Ma’muriy bayonnoma rasmiylashtirish',
    domain: 'administrative',
    allowedDocumentIds: ['administrative_code'],
    disallowedDocumentIds: ['criminal_code'],
    targetArticleNumbers: ['279', '281'],
    forbiddenArticleNumbers: ['154', '154-1'],
    jurisdictionRule: 'Vakolatli ma’muriy organ yoki Tumanlararo ma’muriy sud',
    proceduralRoute: 'Bayonnomada e’tirozlarni yozma ko‘rsatish va nusxasini olish',
    triggers: ['bayonnoma', 'protokol', 'dalolatnoma tuzdi', 'inspektor bayonnomasi']
  },
  admin_deadline: {
    id: 'admin_deadline',
    name: 'Ma’muriy shikoyat berish muddati (10 kun)',
    domain: 'administrative',
    allowedDocumentIds: ['administrative_code'],
    disallowedDocumentIds: ['criminal_code'],
    targetArticleNumbers: ['315'],
    forbiddenArticleNumbers: ['154', '154-1'],
    jurisdictionRule: 'Tumanlararo ma’muriy sud yoki yuqori organ',
    proceduralRoute: 'O‘tkazib yuborilgan muddat uzrli sabablar bo‘lsa sud orqali tiklanishi mumkin',
    triggers: ['shikoyat muddati', 'necha kunda shikoyat', '10 kunlik muddat', 'muddat otib ketdi', 'muddat o‘tib ketdi']
  },
  admin_hokimlik_act: {
    id: 'admin_hokimlik_act',
    name: 'Hokimlik qarori yoki harakati ustidan shikoyat',
    domain: 'administrative',
    allowedDocumentIds: ['administrative_code', 'constitution'],
    disallowedDocumentIds: ['labor_code', 'criminal_code', 'family_code'],
    targetArticleNumbers: ['314', '315'],
    forbiddenArticleNumbers: ['20', '179', '528', '154', '154-1'],
    jurisdictionRule: 'Tumanlararo ma’muriy sud yoki yuqori turuvchi organ (viloyat hokimligi)',
    proceduralRoute: 'Ma’muriy sud ishlarini yuritish to‘g‘risidagi kodeks (MSIYuK) bo‘yicha tumanlararo ma’muriy sudga ariza yoki yuqori organga ma’muriy shikoyat berish',
    triggers: ['hokim qarori', 'hokimlik qarori', 'hokimlik ustidan', 'hokimlik harakati', 'hokimiyat ustidan', 'hokimiyat qarori', 'hokim qaroridan norozi', 'hokimlikdan shikoyat', 'hokimiyatdan shikoyat', 'hokim qaror chiqardi', 'hokimi qaror chiqardi', 'yer ajratish', 'yer olib qoyish', 'yer olib qo‘yish']
  },

  // --- BRIBERY & CORRUPTION TOPICS ---
  bribery_extortion_exemption: {
    id: 'bribery_extortion_exemption',
    name: 'Pora talab qilish va 30 kunlik ixtiyoriy xabar berish kafolati',
    domain: 'criminal',
    allowedDocumentIds: ['criminal_code'],
    disallowedDocumentIds: ['labor_code', 'civil_code', 'administrative_code'],
    targetArticleNumbers: ['210', '211'],
    forbiddenArticleNumbers: [],
    jurisdictionRule: 'Korrupsiyaga qarshi kurashish agentligi (1253) yoki Bosh prokuratura (1007)',
    proceduralRoute: 'Basharti pora talab qilingan bo‘lsa, 30 sutka ichida ixtiyoriy ariza bilan murojaat qilinganda JK 211-m 4-qismi bo‘yicha jinoiy javobgarlikdan ozod etiladi',
    triggers: ['mendan pora talab', 'pora sorayapti', 'pora so‘rayapti', 'pora talab qilinyapti', 'pora bermasam', 'pora sorashdi', 'pora so‘rashdi', 'pora talab qilishdi', 'pora talab qilindi', 'pora talab qildi', 'pora talab', 'pora so‘radi', 'pora soradi', 'pora talab qilgan', 'pora so‘ragan', 'pora so‘rashsa']
  },
  bribery_receiving: {
    id: 'bribery_receiving',
    name: 'Pora olish (mansabdor shaxs tomonidan)',
    domain: 'criminal',
    allowedDocumentIds: ['criminal_code'],
    disallowedDocumentIds: ['labor_code', 'civil_code', 'administrative_code'],
    targetArticleNumbers: ['210'],
    forbiddenArticleNumbers: [],
    jurisdictionRule: 'Huquqni muhofaza qiluvchi organlar / Jinoyat ishlari bo‘yicha sud',
    proceduralRoute: 'Bosh prokuratura (1007), Korrupsiyaga qarshi kurashish agentligi (1253) yoki IIV (102)',
    triggers: ['pora olish', 'mansabdor pora oldi', 'pora olganlik', 'pora olyapti']
  },
  bribery_giving: {
    id: 'bribery_giving',
    name: 'Pora berish (fuqaro javobgarligi)',
    domain: 'criminal',
    allowedDocumentIds: ['criminal_code'],
    disallowedDocumentIds: ['labor_code', 'civil_code', 'administrative_code'],
    targetArticleNumbers: ['211'],
    forbiddenArticleNumbers: [],
    jurisdictionRule: 'Huquqni muhofaza qiluvchi organlar / Jinoyat ishlari bo‘yicha sud',
    proceduralRoute: 'Bosh prokuratura (1007) yoki IIV (102)',
    triggers: ['pora berish', 'pora bersam', 'pora taklif qilish']
  },
  bribery_mediation: {
    id: 'bribery_mediation',
    name: 'Pora olish-berishda vositachilik qilish',
    domain: 'criminal',
    allowedDocumentIds: ['criminal_code'],
    disallowedDocumentIds: ['labor_code', 'civil_code', 'administrative_code'],
    targetArticleNumbers: ['212'],
    forbiddenArticleNumbers: [],
    jurisdictionRule: 'Huquqni muhofaza qiluvchi organlar / Jinoyat ishlari bo‘yicha sud',
    proceduralRoute: 'Bosh prokuratura (1007), IIV (102)',
    triggers: ['pora vositachi', 'pora yetkazish', 'vositachilik']
  },
  bribery_classification: {
    id: 'bribery_classification',
    name: 'Pora jinoyatlarining og‘irlik darajasi va tasnifi (JK 15, 210, 211, 212)',
    domain: 'criminal',
    allowedDocumentIds: ['criminal_code'],
    disallowedDocumentIds: ['labor_code', 'civil_code', 'administrative_code'],
    targetArticleNumbers: ['15', '210', '211', '212'],
    forbiddenArticleNumbers: [],
    jurisdictionRule: 'Jinoyat ishlari bo‘yicha sud',
    proceduralRoute: 'JK 15-moddasi bo‘yicha sanksiya muddatiga qarab tasniflanadi',
    triggers: ['og‘ir jinoyatmi', 'ogir jinoyatmi', 'og‘irmi', 'tasnifi', 'qanday jinoyat', 'pora ogir', 'pora og‘ir']
  }
};

/**
 * Matches user query against the fine-grained legal topic registry.
 */
export function matchFineGrainedTopic(text, explicitDomain = null) {
  if (!text) return null;
  const t = text.toLowerCase();
  let bestTopic = null;
  let maxScore = 0;

  for (const topic of Object.values(FINE_GRAINED_TOPICS)) {
    if (explicitDomain && topic.domain !== explicitDomain) continue;
    let score = 0;
    for (const trig of topic.triggers) {
      if (t.includes(trig)) {
        score += trig.length * 2;
      }
    }

    // Context combination boosts for hokimlik/state organ acts (only if not a corruption/bribery allegation)
    if (topic.id === 'admin_hokimlik_act') {
      if (!t.includes('pora') && !t.includes('korrupsiya') && !t.includes('poraxo')) {
        if (t.includes('hokim') && (t.includes('qaror') || t.includes('harakat') || t.includes('shikoyat') || t.includes('yer') || t.includes('snos'))) {
          score += 50;
        }
        if ((t.includes('yer') || t.includes('uchastka') || t.includes('bino')) && (t.includes('olib qo‘y') || t.includes('olib qoy') || t.includes('buzilish') || t.includes('snos'))) {
          score += 40;
        }
      }
    }

    // Context combination boosts for bribery & corruption
    if (topic.id === 'bribery_extortion_exemption' || topic.id === 'bribery_receiving') {
      if (t.includes('pora') && (t.includes('talab') || t.includes('so‘ra') || t.includes('sora') || t.includes('berish') || t.includes('olish') || t.includes('shikoyat') || t.includes('ariza'))) {
        score += 80;
      }
    }

    // Context combination boosts for labor transfer (MK 138, 145)
    if (topic.id === 'labor_transfer') {
      if ((t.includes('boshqa ish') || t.includes('boshqa lavozim') || t.includes('lavozimga') || t.includes('boshqa joyga')) && 
          (t.includes('o‘tkaz') || t.includes('o\'tkaz') || t.includes('otkaz'))) {
        score += 80;
      }
    }

    // Context combination boosts for tenancy cancellation / early termination (FK 615, 551)
    if (topic.id === 'tenancy_cancellation') {
      if ((t.includes('ijara') || t.includes('kvartira') || t.includes('uy egasi') || t.includes('ijarachi')) && 
          (t.includes('bekor') || t.includes('chiqmoqchi') || t.includes('chiqib ket') || t.includes('to‘xtat') || t.includes('to\'xtat') || t.includes('muddatidan oldin'))) {
        score += 80;
      }
    }

    if (score > maxScore) {
      maxScore = score;
      bestTopic = topic;
    }
  }

  return bestTopic;
}

/**
 * Section D: Extracts known vs missing critical facts for transparent conditional reasoning.
 */
export function extractKnownAndMissingFacts(text, topicInfo = null) {
  const t = (text || '').toLowerCase();
  const knownFacts = [];
  const missingCriticalFacts = [];

  // 1. Contract status (Labor / Tenancy / Civil)
  if (t.includes('shartnoma bor') || t.includes('shartnomamda') || t.includes('shartnoma tuzilgan') || t.includes('yozma shartnoma')) {
    knownFacts.push({ key: 'contract_status', value: 'Yozma shartnoma mavjud' });
  } else if (t.includes('shartnoma yo‘q') || t.includes('shartnoma yoq') || t.includes('og‘zaki') || t.includes('shartnomasiz')) {
    knownFacts.push({ key: 'contract_status', value: 'Yozma shartnoma tuzilmagan (og‘zaki kelishuv)' });
  } else {
    if (topicInfo?.domain === 'labor' || topicInfo?.domain === 'civil') {
      missingCriticalFacts.push("Rasmiy yozma shartnoma mavjudligi yoki og‘zaki kelishuv ekanligi");
    }
  }

  // 2. Tenancy deposit & damage
  if (topicInfo?.id === 'tenancy_deposit' || topicInfo?.id === 'tenancy_damage') {
    if (t.includes('shartnomada yozilgan') || t.includes('shartnoma bandi') || t.includes('shartnomada bor')) {
      knownFacts.push({ key: 'contract_deposit_clause', value: 'Shartnomada depozit qaytarish shartlari mavjud' });
    } else {
      missingCriticalFacts.push("Ijara shartnomasida depozitni (garov pulini) qaytarish shartlari va muddati");
    }

    if (t.includes('akt bor') || t.includes('dalolatnoma tuzilgan') || t.includes('zarar qayd etilgan')) {
      knownFacts.push({ key: 'damage_act', value: 'Zarar ikki tomonlama dalolatnoma bilan rasmiylashtirilgan' });
    } else if (t.includes('akt yo‘q') || t.includes('dalolatnoma yo‘q') || t.includes('akt tuzilmagan') || t.includes('hech qanday akt') || t.includes('akt yoq')) {
      knownFacts.push({ key: 'damage_act', value: 'Zarar bo‘yicha ikki tomonlama dalolatnoma tuzilmagan' });
    } else {
      missingCriticalFacts.push("Ijaraga beruvchi tomonidan mulkka zarar yetkazilganini tasdiqlovchi ikki tomonlama dalolatnoma (akt) tuzilgan-tuzilmaganligi");
    }
  }

  // 3. Labor transfer / additional work consent
  if (topicInfo?.id === 'labor_transfer' || topicInfo?.id === 'labor_additional_work') {
    if (t.includes('rozilik berganman') || t.includes('rozi bo‘lganman') || t.includes('ariza yozganman')) {
      knownFacts.push({ key: 'employee_consent', value: 'Xodim yozma rozilik bildirgan' });
    } else if (t.includes('roziligimsiz') || t.includes('rozi emasman') || t.includes('majbur') || t.includes('majburlayapti') || t.includes('so‘ramay') || t.includes('soramay')) {
      knownFacts.push({ key: 'employee_consent', value: 'Xodimning roziligisiz amalga oshirilmoqda' });
    } else {
      missingCriticalFacts.push("Boshqa ishga o‘tkazish yoki qo‘shimcha vazifaga xodimning yozma roziligi olingan-olinmaganligi");
    }
  }

  // 4. Administrative fine appeal
  if (topicInfo?.id === 'admin_fine' || topicInfo?.id === 'admin_appeal') {
    const dayMatch = t.match(/(\d+)\s*kun/);
    if (dayMatch) {
      knownFacts.push({ key: 'days_passed', value: `Qarordan so‘ng ${dayMatch[1]} kun o‘tgan` });
    } else {
      missingCriticalFacts.push("Jarima to‘g‘risidagi qaror nusxasi topshirilgan sana (MJtK 315-moddasiga ko‘ra 10 kunlik muddat)");
    }

    if (t.includes('radar') || t.includes('yhx') || t.includes('gai')) {
      knownFacts.push({ key: 'fine_issuer', value: 'Yo‘l harakati xavfsizligi xizmati (radar)' });
    } else if (t.includes('soliq')) {
      knownFacts.push({ key: 'fine_issuer', value: 'Soliq organi' });
    } else if (t.includes('sud')) {
      knownFacts.push({ key: 'fine_issuer', value: 'Sud' });
    } else {
      missingCriticalFacts.push("Jarima qarorini chiqargan vakolatli organ");
    }
  }

  // 5. Bribery extortion & 30 days
  if (topicInfo?.id === 'bribery_extortion_exemption') {
    knownFacts.push({ key: 'bribery_type', value: 'Mansabdor shaxs tomonidan pora talab qilinishi (tovlamachilik)' });
    missingCriticalFacts.push("Pora talab qilingandan so‘ng 30 sutka ichida ixtiyoriy xabar berilayotganligi (JK 211-m 4-qismi imtiyozi uchun)");
  }

  // 6. Hokimlik decision or action complaint
  if (topicInfo?.id === 'admin_hokimlik_act') {
    if (t.includes('qaror nusxasi bor') || t.includes('nusxasi bor') || t.includes('hujjat bor')) {
      knownFacts.push({ key: 'decision_copy', value: 'Qaror nusxasi mavjud' });
    } else {
      missingCriticalFacts.push("Hokimlik qarorining sanasi, raqami va rasmiy nusxasi");
    }
    missingCriticalFacts.push("Qaror yoki harakat orqali buzilgan aniq huquq (yer, mulk, buzilish, tadbirkorlik)");
  }

  // 7. Labor commission challenge (MK 556)
  if (topicInfo?.id === 'labor_commission_challenge') {
    if (t.includes('qaror chiqargan') || t.includes('qaror chiqardi') || t.includes('qaror bor')) {
      knownFacts.push({ key: 'commission_status', value: 'Mehnat nizolari komissiyasi qaror chiqargan' });
    } else if (t.includes('kormadi') || t.includes('ko‘rmadi') || t.includes('10 kunda hal qilmadi')) {
      knownFacts.push({ key: 'commission_status', value: 'Komissiya 10 kunlik muddatda nizoni ko‘rib chiqmagan' });
    } else {
      missingCriticalFacts.push("Mehnat nizolari komissiyasi qaror chiqarganmi yoki masalani 10 kunda ko‘rmaganmi");
    }

    const dayMatch = t.match(/(\d+)\s*kun/i);
    if (dayMatch) {
      knownFacts.push({ key: 'receipt_days', value: `Qaror nusxasi olinganiga ${dayMatch[1]} kun bo‘lgan` });
    } else {
      missingCriticalFacts.push("Komissiya qarorining nusxasi xodimga rasman topshirilgan sana (10 kunlik muddat shundan hisoblanadi)");
    }
  }

  return { knownFacts, missingCriticalFacts };
}

export class QueryUnderstandingService {
  /**
   * Safety Guardrail: Detects prompt injections, jailbreak attempts, and prohibited illegal requests.
   * Prohibited: fake contracts/receipts, forging signatures, tax evasion, perjury/fake evidence, threats/blackmail.
   * Exemption: Legitimate legal inquiries about statutory penalties (e.g. Article 228 of the Criminal Code).
   */
  detectAdversarialOrIllegalRequest(rawMessage) {
    if (!rawMessage || typeof rawMessage !== 'string') return { isIntercepted: false };
    const clean = rawMessage.trim();
    const latin = cyrillicToLatin(normalizeSearchText(clean)).toLowerCase();

    // 1. Adversarial & Prompt Injection Defense
    const injectionRegex = /(ignore\s*(all\s*)?(previous\s*|prior\s*)?instructions|oldingi\s*(barcha\s*)?(ko['‘`]?rsatma|qoida|buyruq)larni\s*(unut|bekor\s*qil|o['‘`]?chir)|barcha\s*qoidalarni\s*(unut|bekor\s*qil|chetlab\s*o['‘`]?t)|system\s*prompt|jailbreak|dan\s*mode|developer\s*mode|modda(ni)?\s*(o['‘`]?zingdan|o['‘`]?zing)\s*(to['‘`]?qi|to['‘`]?qib|o['‘`]?ylab\s*top)|qonun(ni)?\s*(o['‘`]?zingdan|o['‘`]?zing)\s*(to['‘`]?qi|to['‘`]?qib|o['‘`]?ylab\s*top)|tekshirma(sdan)?\s*(faqat\s*)?(yoz|to['‘`]?qi)|to['‘`]?qima\s*modda|modda\s*raqami\s*to['‘`]?qib\s*ber|lex\.?uz(ni)?\s*tekshirma|bazasiz\s*javob\s*ber)/i;

    if (injectionRegex.test(latin)) {
      return {
        isIntercepted: true,
        type: 'prompt_injection',
        intent: 'ADVERSARIAL_DEFENSE',
        requiresRetrieval: false,
        needsClarification: false,
        directResponse: "AdvokatAI faqat O‘zbekiston Respublikasining amaldagi qonunchiligi va tasdiqlangan rasmiy manbalar (Lex.uz) asosida ishlaydi. Tizim xavfsizlik qoidalarini chetlab o‘tish yoki to‘qima qonun moddalarini yaratish imkonsiz. Agar aniq huquqiy savolingiz bo‘lsa, marhamat, yozishingiz mumkin.",
        confidence: 100
      };
    }

    // Check if user is asking about penalty/liability rather than requesting illegal execution
    const isAskingAboutLiability = /(qanday\s*jazo|qanaqa\s*jazo|javobgarlik|jazo\s*bormi|jazo\s*turi|modda\s*nima\s*deydi|jazosi\s*nima)/i.test(latin);

    if (!isAskingAboutLiability) {
      // 2. Prohibited Illegal Requests
      const fakeDocRegex = /(soxta\s*(mehnat\s*)?shartnoma|soxta\s*imzo|imzoni\s*soxtalashtirish|(hujjat|shartnoma|kvitansiya|chek|diplom|buyruq|qaror)(ni)?\s*soxtalashtir|soxta\s*(kvitansiya|chek|hujjat|spravka|diplom|pechat|muhr)|qalbakilashtir|falsifikatsiya|soxtalashtirib\s*ber)/i;
      const evasionRegex = /(soliqdan\s*(qochish|yashirinish|berkinish)|radardan\s*(yashirinish|qochish|yashirish)|organlardan\s*(qochish|yashirinish)|militsiyadan\s*(yashirinish|qochish)|politsiyadan\s*(yashirinish|qochish)|qonunni\s*aylanib\s*o['‘`]?tish|qonunni\s*chetlab\s*o['‘`]?tish\s*usullari|jarimani\s*to['‘`]?lamaslik\s*(yo['‘`]?li|hiylasi))/i;
      const perjuryRegex = /(sudga\s*soxta\s*dalil|yolg['‘`]?on\s*guvohlik|soxta\s*guvoh\s*(topish|topib\s*ber))/i;
      const threatRegex = /(tahdid\s*(qilish|xati|qilmoqchiman)|qasd\s*olish|o['‘`]?ch\s*olish|shantaj\s*(qilish|qilmoqchiman)|reket)/i;

      if (fakeDocRegex.test(latin) || evasionRegex.test(latin) || perjuryRegex.test(latin) || threatRegex.test(latin)) {
        return {
          isIntercepted: true,
          type: 'illegal_request',
          intent: 'PROHIBITED_REQUEST',
          requiresRetrieval: false,
          needsClarification: false,
          directResponse: "Qonuniy javobgarlikdan noqonuniy qochish, hujjatlarni soxtalashtirish yoki aldash bo‘yicha ko‘rsatma bera olmayman. O‘zbekiston Respublikasi Jinoyat kodeksida (masalan, 228-modda — hujjatlar, shtamplar, muhrlar, blankalarni qalbakilashtirish, sotish yoki ulardan foydalanish) bunday qilmishlar uchun to‘g‘ridan-to‘g‘ri jinoiy javobgarlik belgilangan. Agar muayyan qaror yoki jarima ustidan qonuniy tartibda shikoyat qilish yoki huquqlaringizni qonun doirasida himoya qilish kerak bo‘lsa, rasmiy tartibni tushuntirib berishim mumkin.",
          confidence: 100
        };
      }
    }

    return { isIntercepted: false };
  }

  /**
   * Safety Guardrail: Verifies that a requested statutory article actually exists in Uzbekistan legislation.
   * Prevents hallucinated citations or responses for phantom articles like "Mehnat kodeksi 999-moddasi".
   */
  checkNonExistentArticle(artNumStr, specifiedDoc = null) {
    if (!artNumStr) return { isNonExistent: false };
    const artNum = parseInt(artNumStr, 10);
    if (isNaN(artNum) || artNum <= 0) return { isNonExistent: false };

    // If specific code is identified
    if (specifiedDoc && CODE_LIMITS[specifiedDoc]) {
      const info = CODE_LIMITS[specifiedDoc];
      if (artNum > info.max) {
        return {
          isNonExistent: true,
          articleNumber: artNumStr,
          documentId: specifiedDoc,
          maxArticles: info.max,
          directResponse: `Ko‘rsatilgan ${artNum}-modda bo‘yicha amaldagi ${info.name}da tegishli norma mavjud emas (${info.name} ${info.max} ta moddadan iborat). Masalangizni (masalan: ish haqi, mehnat shartnomasi, ishdan bo‘shatish yoki boshqa holat) qisqacha bayon qilsangiz, unga tegishli amaldagi qonun normasini topib beraman.`
        };
      }
    }

    // Across all Uzbek codes, the highest article number is ~1199 (Fuqarolik kodeksi)
    if (artNum > 1199) {
      return {
        isNonExistent: true,
        articleNumber: artNumStr,
        documentId: null,
        maxArticles: 1199,
        directResponse: `O‘zbekiston Respublikasi amaldagi qonunchiligida ${artNum}-modda mavjud emas (amaldagi eng yirik Fuqarolik kodeksi 1199 ta moddadan iborat). Iltimos, qaysi qonun va qanday masala bo‘yicha huquqiy yordam kerakligini yozing.`
      };
    }

    return { isNonExistent: false };
  }

  /**
   * Safety Guardrail: Detects contradictory facts in multi-turn dialogues.
   * e.g. User claimed no contract in turn 1, but claims contract exists in turn 2.
   */
  detectContradictoryFacts(rawMessage, history = []) {
    if (!Array.isArray(history) || history.length === 0 || !rawMessage) {
      return { hasContradiction: false };
    }

    const clean = rawMessage.trim();
    const latin = cyrillicToLatin(normalizeSearchText(clean)).toLowerCase();

    const userTurns = history.filter(h => h.sender === 'user' && h.text);
    if (userTurns.length === 0) return { hasContradiction: false };

    const pastUserText = userTurns.map(h => cyrillicToLatin(normalizeSearchText(h.text)).toLowerCase()).join(' ');

    // 1. Contract existence contradiction
    const pastHadNoContract = /(shartnoma(m)?\s*yo['‘`]?q|shartnomasiz|og['‘`]?zaki)/i.test(pastUserText);
    const currentHasContract = /(shartnoma(m)?\s*bor|shartnomamda|shartnomada\s*(yozilgan|ko['‘`]?rsatilgan|belgilangan))/i.test(latin);

    const pastHadContract = /(shartnoma(m)?\s*bor|shartnomamda|shartnomada\s*(yozilgan|ko['‘`]?rsatilgan|belgilangan))/i.test(pastUserText);
    const currentNoContract = /(shartnoma(m)?\s*yo['‘`]?q|shartnomasiz|og['‘`]?zaki)/i.test(latin);

    if ((pastHadNoContract && currentHasContract) || (pastHadContract && currentNoContract)) {
      return {
        hasContradiction: true,
        conflictType: 'contract_existence',
        directResponse: "Vaziyatingizda qarama-qarshi maʼlumotlar keltirildi: avval rasmiy mehnat shartnomasi yo‘qligi (og‘zaki kelishuv), keyin esa shartnoma mavjudligi aytildi. Qonuniy himoya mexanizmi va qo‘llanadigan moddalar yozma shartnoma mavjudligiga bevosita bog‘liq. Iltimos, aniqlik kiriting: Ish beruvchi bilan imzolangan rasmiy yozma mehnat shartnomangiz bormi yoki yo‘qmi?"
      };
    }

    return { hasContradiction: false };
  }

  /**
   * Pre-RAG classification: Classifies intent and checks if legal retrieval is even needed.
   * If non-legal or short topic word, returns zero citations and direct conversational question.
   * If ambiguous, asks a single targeted clarifying question.
   */
  classifyIntent(rawMessage, history = [], options = {}) {
    if (!rawMessage || typeof rawMessage !== 'string') {
      return { intent: 'EMPTY', text: '', requiresRetrieval: false };
    }

    const clean = rawMessage.trim();
    const normalized = normalizeSearchText(clean);
    const latin = cyrillicToLatin(normalized).toLowerCase();

    // --------------------------------------------------------
    // PRE-CHECK 1: Adversarial & Prohibited Illegal Requests
    // --------------------------------------------------------
    const safetyCheck = this.detectAdversarialOrIllegalRequest(rawMessage);
    if (safetyCheck.isIntercepted) {
      return safetyCheck;
    }

    // --------------------------------------------------------
    // PRE-CHECK 2: Contradictory Facts in Multi-Turn
    // --------------------------------------------------------
    const contradiction = this.detectContradictoryFacts(rawMessage, history);
    if (contradiction.hasContradiction) {
      return {
        intent: 'CONTRADICTORY_FACTS',
        requiresRetrieval: false,
        needsClarification: true,
        directResponse: contradiction.directResponse,
        confidence: 50
      };
    }

    // --------------------------------------------------------
    // PRE-CHECK 3: Advocate Identity & Court Representation FAQ (Prompt Requirement 1 & 8)
    // Intercepts "AdvokatAI mening advokatim bo‘la oladimi?", "sen advokatmisan?", "sudda meni himoya qilasanmi?"
    // --------------------------------------------------------
    const isAdvocateInquiry = /(advokat(im)?\s*bo['‘`]?la\s*ola(di)?mi|mening\s*advokatim(san|siz)?|sen\s*advokatmisan|advokat\s*hisoblanasanmi|advokat\s*bo['‘`]?lib\s*ishlaysanmi|sudda\s*(mening\s*nomimdan\s*)?(qatnasha\s*ola(san|di)?mi|himoya\s*qila\s*ola(san|di)?mi|vakillik\s*qila\s*ola(san|di)?mi)|advokatmisiz)/i.test(latin);
    if (isAdvocateInquiry) {
      return {
        intent: 'ADVOCATE_IDENTITY_FAQ',
        requiresRetrieval: false,
        needsClarification: false,
        directResponse: `Yo‘q. AdvokatAI inson advokat emas va sizning nomingizdan sudda, davlat organlarida yoki boshqa tashkilotlarda vakillik qila olmaydi. AdvokatAI O‘zbekiston qonunchiligi asosida huquqiy ma’lumot, tushuntirish va hujjat loyihalarini tayyorlashda yordam beruvchi sun’iy intellekt yordamchisidir.

AdvokatAI:
• huquqiy savollarga javob berishi;
• qonunchilikdagi tegishli normalarni tushuntirishi;
• vaziyatni huquqiy nuqtai nazardan tahlil qilishga yordam berishi;
• ariza, shikoyat, da’vo va boshqa hujjatlarning loyihalarini tayyorlashi;
• kerakli huquqiy yo‘nalishni aniqlashga yordam berishi mumkin.

Ammo AdvokatAI advokatning o‘rnini bosmaydi, sudda yoki boshqa organlarda sizning vakilingiz sifatida qatnasha olmaydi va advokatlik xizmatini ko‘rsatmaydi.

Agar masala murakkab bo‘lsa yoki sudda/himoyada professional vakillik zarur bo‘lsa, malakali advokatga murojaat qilish tavsiya etiladi.`,
        confidence: 100
      };
    }

    // Context analysis from previous turns
    const lastAiMsg = Array.isArray(history) ? [...history].reverse().find(h => h.sender === 'ai' && h.text) : null;
    const lastAiText = (lastAiMsg?.text || '').toLowerCase();
    const lastUserMsg = Array.isArray(history) ? [...history].reverse().find(h => h.sender === 'user' && h.text) : null;
    const lastUserText = (lastUserMsg?.text || '').toLowerCase();

    // ========================================================
    // 0. MULTI-TURN CONVERSATION CONTINUITY & FOLLOW-UP RESOLUTION
    // ========================================================
    // Case A: AI asked which complaint target ("Qaysi masala bo‘yicha shikoyat yozmoqchisiz...")
    // User says: "Davlat organiga" -> Continues complaint context, asks which state organ
    if (lastAiText.includes('qaysi masala bo‘yicha shikoyat') || lastAiText.includes('qaysi turdagi shikoyat') || lastAiText.includes('qaysi masala bo‘yicha murojaat') || lastAiText.includes('masalaga qarab farq qiladi')) {
      if (latin.includes('davlat organiga') || latin.includes('davlat organi') || latin.includes('davlat tashkiloti')) {
        return {
          intent: 'GOVERNMENT_COMPLAINT_FOLLOWUP',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: "Qaysi davlat organining qarori yoki harakati ustidan shikoyat qilmoqchisiz (hokimlik, soliq, ichki ishlar yoki boshqa organ)?",
          confidence: 95
        };
      }
      if (/^(sudga|sudga\s*bera(man|y)?|sudga\s*murojaat|sud)$/i.test(latin.trim()) || latin.includes('sudga murojaat') || latin.includes('sudga beraman')) {
        return {
          intent: 'COURT_DISPUTE_FOLLOWUP',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: "Sudga murojaat qilmoqchi ekaningizni tushundim. Nizo qaysi masalaga oid? Masalan: ishdan bo‘shatish, ish haqi, mehnat shartnomasi, qarz, mulk, oila yoki boshqa masala.",
          confidence: 95
        };
      }
      if (latin.includes('mehnat') || latin.includes('ish beruvchi') || latin.includes('ishxona') || latin.includes('ish joyi')) {
        return {
          intent: 'LABOR_DISPUTE_TARGETED_QUESTIONS',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: `Mehnat nizosi bo‘yicha to‘g‘ri tartib va muddatni aniqlash uchun quyidagi holatlarga oydinlik kiritish zarur:
1. Muammo nimada: ishdan bo‘shatish, ish haqi to‘lanmasligi, ishga tiklanish yoki boshqa mehnat huquqimi?
2. Ish beruvchi bilan mehnat shartnomasi mavjudmi?
3. Mehnat nizolari bo‘yicha komissiyaga murojaat qilganmisiz?
4. Komissiya qaror chiqarganmi yoki masalani belgilangan muddatda ko‘rib chiqmaganmi? Qaror nusxasini qachon olgansiz?`,
          confidence: 95
        };
      }
      if (latin.includes('oila') || latin.includes('oilaviy')) {
        return {
          intent: 'FAMILY_AREA_FOLLOWUP',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: "Oilaviy masala bo‘yicha aynan qanday nizo: nikohdan ajrashish, aliment undirish, mol-mulkni bo‘lish yoki bolaning yashash joyini belgilashmi?",
          confidence: 95
        };
      }
      if (latin.includes('qarz')) {
        return {
          intent: 'DEBT_AREA_FOLLOWUP',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: "Qarz munosabatlari bo‘yicha: qarz tilxat yoki shartnoma bilan rasmiylashtirilganmi, notarial tasdiqlanganmi va qarzni qaytarish muddati o‘tganmi?",
          confidence: 95
        };
      }
      if (latin.includes('shartnoma')) {
        return {
          intent: 'CONTRACT_AREA_FOLLOWUP',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: "Qaysi shartnoma bo‘yicha nizo kelib chiqdi (ijara, oldi-sotdi, xizmat ko‘rsatish, pudrat) va shartnomaning qaysi bandi buzildi?",
          confidence: 95
        };
      }
      if (latin.includes('mulk')) {
        return {
          intent: 'PROPERTY_AREA_FOLLOWUP',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: "Mulk masalasida aynan nima bo‘yicha nizo: uy-joy/ko‘chmas mulk mulkiy huquqi, oldi-sotdi, meros yoki mol-mulkka yetkazilgan zararni undirishmi?",
          confidence: 95
        };
      }
      if (latin.includes('mamuriy') || latin.includes('ma’muriy')) {
        return {
          intent: 'ADMIN_AREA_FOLLOWUP',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: "Ma’muriy masala bo‘yicha: yo‘l harakati / radar jarimasimi, ma’muriy bayonnoma ustidan shikoyatmi yoki davlat organi mansabdor shaxsining qarori ustidanmi?",
          confidence: 95
        };
      }
      if (latin.includes('jinoyat')) {
        return {
          intent: 'CRIMINAL_AREA_FOLLOWUP',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: "Jinoyat ishi bo‘yicha: siz jabrlanuvchimisiz, ariza berish tartibini bilmoqchimisiz yoki muayyan qilmish bo‘yicha javobgarlikni so‘rayapsizmi?",
          confidence: 95
        };
      }
    }

    // Case A.1b: AI asked court dispute type ("Nizo qaysi masalaga oid? Masalan: ishdan bo‘shatish, ish haqi...")
    if (lastAiText.includes('nizo qaysi masalaga oid') || lastAiText.includes('nizo qaysi masalaga tegishli') || (lastAiText.includes('sudga murojaat qilmoqchi ekaningizni tushundim') && lastAiText.includes('masalan:'))) {
      if (latin.includes('mehnat') || latin.includes('ish beruvchi') || latin.includes('ishxona') || latin.includes('ish joyi')) {
        return {
          intent: 'LABOR_DISPUTE_TARGETED_QUESTIONS',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: `Mehnat nizosi bo‘yicha to‘g‘ri tartib va muddatni aniqlash uchun quyidagi holatlarga oydinlik kiritish zarur:
1. Muammo nimada: ishdan bo‘shatish, ish haqi to‘lanmasligi, ishga tiklanish yoki boshqa mehnat huquqimi?
2. Ish beruvchi bilan mehnat shartnomasi mavjudmi?
3. Mehnat nizolari bo‘yicha komissiyaga murojaat qilganmisiz?
4. Komissiya qaror chiqarganmi yoki masalani belgilangan muddatda ko‘rib chiqmaganmi? Qaror nusxasini qachon olgansiz?`,
          confidence: 95
        };
      }
      if (latin.includes('qarz')) {
        return {
          intent: 'DEBT_AREA_FOLLOWUP',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: "Qarz munosabatlari bo‘yicha: qarz tilxat yoki shartnoma bilan rasmiylashtirilganmi, notarial tasdiqlanganmi va qarzni qaytarish muddati o‘tganmi?",
          confidence: 95
        };
      }
      if (latin.includes('mulk')) {
        return {
          intent: 'PROPERTY_AREA_FOLLOWUP',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: "Mulk masalasida aynan nima bo‘yicha nizo: uy-joy/ko‘chmas mulk mulkiy huquqi, oldi-sotdi, meros yoki mol-mulkka yetkazilgan zararni undirishmi?",
          confidence: 95
        };
      }
      if (latin.includes('oila') || latin.includes('oilaviy') || latin.includes('ajrashish') || latin.includes('aliment')) {
        return {
          intent: 'FAMILY_AREA_FOLLOWUP',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: "Oilaviy masala bo‘yicha aynan qanday nizo: nikohdan ajrashish, aliment undirish, mol-mulkni bo‘lish yoki bolaning yashash joyini belgilashmi?",
          confidence: 95
        };
      }
    }

    // Case A.1c: AI asked labor dispute targeted questions (commission, contract, dismissal, salary)
    if (lastAiText.includes('mehnat nizolari bo‘yicha komissiyaga') || lastAiText.includes('komissiya qaror chiqarganmi') || (lastAiText.includes('mehnat nizosi bo‘yicha to‘g‘ri tartib') && lastAiText.includes('komissiya'))) {
      if (latin.includes('komissiya') || latin.includes('mnk') || latin.includes('komissiyaga') || latin.includes('qaror nusxa') || latin.includes('qaror chiqardi') || latin.includes('qaror chiqargan') || latin.includes('kormadi') || latin.includes('ko‘rmadi')) {
        return {
          intent: 'LABOR_COMMISSION_CHALLENGE',
          requiresRetrieval: true,
          needsClarification: false,
          disputeType: 'labor_commission_challenge',
          specifiedDoc: 'labor_code',
          articleNumber: '556'
        };
      }
    }

    // Case A.2: AI asked which state organ ("Qaysi davlat organining qarori yoki harakati ustidan...")
    // User specifies the organ (e.g. "Hokimlik", "Soliq", "IIV", etc.)
    if (lastAiText.includes('qaysi davlat organining qarori') || lastAiText.includes('qaysi davlat organining') || lastAiText.includes('hokimlik, soliq, ichki ishlar')) {
      if (latin.includes('hokimlik') || latin.includes('hokimiyat')) {
        return {
          intent: 'HOKIMLIK_COMPLAINT_CLARIFICATION',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: `Hokimlik bo‘yicha shikoyat yoki nizolashish tartibi qaror yoki harakatning aynan nimadan iboratligiga bog‘liq.

Iltimos, quyidagilarni aniqlashtiring:
1. Hokimlikning qaysi qarori yoki harakati ustidan shikoyat qilmoqchisiz?
2. Qarorning sanasi va raqami bormi?
3. Bu qaror sizning qaysi huquqingiz yoki manfaatlaringizga ta’sir qilgan?
4. Qaror yoki hujjatning nusxasi sizda bormi?
5. Hokimlikka yoki yuqori turuvchi organga oldin murojaat qilganmisiz?

Shu ma’lumotlarga asoslanib, shikoyatni qaysi organga yoki ma’muriy sudga, qanday tartibda berish mumkinligini va tegishli qonunchilik asosini aniq ko‘rsatib beraman.`,
          confidence: 95
        };
      }
      if (latin.includes('soliq')) {
        return {
          intent: 'TAX_COMPLAINT_CLARIFICATION',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: `Soliq organi qarori yoki harakati ustidan shikoyat qilish tartibini aniqlash uchun quyidagilarga oydinlik kiritish zarur:
1. Qaysi soliq organi (tuman, shahar yoki viloyat) va qanday hujjat (soliq tekshiruvi dalolatnomasi, talabnoma, inkasso yoki qaror) ustidan shikoyat qilmoqchisiz?
2. Hujjat sanasi va raqami bormi?
3. Nizoli masala nimadan iborat (ortiqcha hisoblangan soliq, jarima yoki hisob raqamni bloklash)?

Ushbu ma’lumotlar asosida Soliq kodeksiga muvofiq yuqori soliq organiga yoki ma’muriy sudga murojaat qilish muddatlari va tartibini ko‘rsatib beraman.`,
          confidence: 95
        };
      }
      if (latin.includes('ichki ishlar') || latin.includes('iiv') || latin.includes('politsiya') || latin.includes('militsiya')) {
        return {
          intent: 'POLICE_COMPLAINT_CLARIFICATION',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: `Ichki ishlar organi yoki uning xodimi harakati ustidan shikoyat qilish tartibini belgilash uchun:
1. Qaysi holat bo‘yicha nizo kelib chiqdi: yo‘l harakati qoidabuzarligi bo‘yicha ma’muriy jarimami yoki xodimning xatti-harakatlarimi?
2. Qo‘lingizda qaror, bayonnoma yoki rasmiy javob xati bormi?

Tafsilotlarni bildirsangiz, tegishli qonunchilik asosida qayerga va qanday tartibda shikoyat qilishni tushuntiraman.`,
          confidence: 95
        };
      }
    }

    // Case B: AI asked about fine issuer ("Maʼmuriy jarimani qaysi organ...")
    // User says: "Mehnat inspeksiyasi" -> Not a topic word! Answers the fine issuer!
    if (lastAiText.includes('mansabdor shaxs chiqargan') || lastAiText.includes('qaysi organ yoki mansabdor')) {
      if (latin.includes('mehnat inspeksiya') || latin.includes('mehnat inspektori')) {
        return {
          intent: 'FINE_ISSUER_LABOR_INSPECTOR',
          requiresRetrieval: true,
          needsClarification: false,
          disputeType: 'state_labor_inspector_challenge',
          specifiedDoc: 'labor_code',
          articleNumber: '537'
        };
      }
    }

    // Case C: AI asked about tenancy dispute type ("Ijara bo‘yicha nizoyingiz qaysi masalaga tegishli...")
    // User says: "Uy egasi depozitni qaytarmayapti" -> Proceed directly to tenancy deposit analysis!
    if ((lastAiText.includes('nizoyingiz qaysi masalaga tegishli') || lastAiText.includes('nizoyingiz aynan qaysi masalaga tegishli')) && latin.includes('depozit')) {
      return {
        intent: 'TENANCY_DEPOSIT_CONFIRMED',
        requiresRetrieval: true,
        needsClarification: false,
        disputeType: 'civil_tenancy_deposit',
        specifiedDoc: 'civil_code'
      };
    }

    // Case C.2: AI asked about tenancy dispute type, user says "Shartnomani bekor qilish" (Section 3 & 22)
    if ((lastAiText.includes('nizoyingiz qaysi masalaga tegishli') || lastAiText.includes('nizoyingiz aynan qaysi masalaga tegishli') || lastAiText.includes('kvartira ijarasi bo‘yicha aynan qaysi muammo') || lastAiText.includes('ijara bo‘yicha')) &&
        (latin.includes('bekor qilish') || latin.includes('shartnomani bekor') || latin.includes('shartnomadan chiqish') || latin.includes('bekor qilmoqchiman'))) {
      return {
        intent: 'TENANCY_TERMINATION_PROGRESSIVE_CLARIFICATION',
        requiresRetrieval: false,
        needsClarification: true,
        directResponse: "Shartnomani bekor qilish tartibi kim bekor qilmoqchi ekaniga va shartnoma shartlariga bog‘liq. Siz ijarachimisiz yoki ijaraga beruvchimisiz? Shartnoma yozma shakldami va muddatidan oldin bekor qilish sharti unda ko‘rsatilganmi?",
        confidence: 95
      };
    }

    // Case D: Progressive discovery for unpaid salary (Section 38, Test 8)
    // Turn 1: "Ish beruvchi oylikni bermayapti" -> Turn 2: "2 oy bo'ldi" (or "2 oydan beri, shartnoma bor")
    if ((lastUserText.includes('oylikni bermayapti') || lastUserText.includes('oylikni to\'lamayapti') || lastUserText.includes('ish haqini to‘lamayapti')) && 
        (latin.includes('oy bo') || latin.includes('oydan beri') || latin.includes('oy'))) {
      if (latin.includes('rasmiy') || latin.includes('shartnoma bor') || latin.includes('yozma')) {
        return {
          intent: 'SALARY_FACTS_FULL',
          requiresRetrieval: true,
          needsClarification: false,
          disputeType: 'individual_labor_salary',
          specifiedDoc: 'labor_code'
        };
      }
      return {
        intent: 'SALARY_DURATION_CONFIRMED',
        requiresRetrieval: false,
        needsClarification: true,
        directResponse: "Tushunarli, maoshingiz kechiktirilgan. Mehnat shartnomangiz rasmiy (yozma) tuzilganmi yoki og‘zaki kelishuvmi?",
        confidence: 95
      };
    }

    // Case E: Contextual Option Selection (Rule 2: User responds with "4", "4-band", etc.)
    const isOptionSelection = /^([1-9])(?:-?\s*band(?:ni)?)?$/i.test(latin.trim());
    if (isOptionSelection) {
      const optNum = latin.match(/^([1-9])/)[1];
      if (optNum === '4' && (lastAiText.includes('qaror nusxasi') || lastAiText.includes('jarima') || lastAiText.includes('shikoyat') || lastAiText.includes('4.'))) {
        return {
          intent: 'OPTION_FOUR_SELECTION',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: "4-bandni tanlaganingizni tushundim. Qaror nusxasi qo‘lingizda bo‘lsa, undagi quyidagi ma’lumotlarni yuboring: qarorni chiqargan organ, qaror sanasi, MJtK moddasi va qaror raqami. Shaxsiy ma’lumotlarni yashirishingiz mumkin.",
          confidence: 95
        };
      }
    }

    // Case F: Administrative Fine Multi-Turn Follow-up (Rule 21)
    if (lastAiText.includes('qarorni kim chiqarganiga va qanday qaror ekaniga qarab farq qiladi') || (lastAiText.includes('ma’muriy jarima bo‘yicha shikoyat tartibi') && lastAiText.includes('qarorni qaysi organ'))) {
      if (latin.includes('ypx') || latin.includes('radar') || latin.includes('gai') || latin.includes('yo‘l harakati') || latin.includes('yol harakati') || latin.includes('politsiya') || latin.includes('soliq') || latin.includes('inspektor')) {
        return {
          intent: 'ADMIN_FINE_DETAILS_REQUEST',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: `Qarorni qaysi organ chiqargani ma’lum bo‘ldi. To‘g‘ri protsedura va muddatni belgilash uchun quyidagi ma’lumotlarni aniqlashtiring:
1. Qarorda Ma’muriy javobgarlik to‘g‘risidagi kodeksning (MJtK) qaysi moddasi ko‘rsatilgan?
2. Qaror sanasi va raqami bormi?
3. Qaror nusxasini aynan qachon olgansiz (muddatni aniq hisoblash uchun bu zarur)?`,
          confidence: 95
        };
      }
    }

    // Case G: Labor Transfer Multi-Turn Follow-up (Section 3)
    if (lastAiText.includes('mehnat shartnomasi bo‘yicha aynan qaysi masala') || lastAiText.includes('mehnat munosabatlarida aynan qaysi masala') || lastAiText.includes('qaysi jihati bo‘yicha savolingiz bor')) {
      if (/(boshqa\s*(?:lavozimga|ishga|filialga)\s*o['‘`]?tkazishdi|boshqa\s*(?:lavozimga|ishga|filialga)\s*otkazishdi|boshqa\s*lavozimga|boshqa\s*ishga|o['‘`]?tkazib\s*qo['‘`]?yishdi|meni\s*boshqa)/i.test(latin)) {
        return {
          intent: 'LABOR_TRANSFER_MULTI_TURN_CLARIFICATION',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: "Bu o‘tkazish sizning roziligingiz bilan bo‘ldimi yoki ish beruvchi bir tomonlama amalga oshirdimi? Shuningdek, sizga bu haqda yozma buyruq yoki qo‘shimcha kelishuv berilganmi?",
          confidence: 95
        };
      }
    }

    // ========================================================
    // 0.8 STANDALONE VAGUE PROCEDURAL REQUESTS (Section 1 & 14)
    // Never assume a specific legal article/scenario from vague queries!
    // ========================================================
    // A. "sudga", "sudga beraman", "sudga murojaat", "sudga berish"
    const isVagueCourt = /^(sudga|sudga\s*bera(man|y)?|sudga\s*murojaat(\s*qilmoqchiman)?|sudga\s*berish(\s*tartibi)?|sudga\s*bermoqchiman|sudga\s*ariza|sudga\s*shikoyat)$/i.test(latin.trim());
    if (isVagueCourt) {
      return {
        intent: 'AMBIGUOUS_COURT_INQUIRY',
        requiresRetrieval: false,
        needsClarification: true,
        directResponse: "Sudga murojaat qilmoqchi ekaningizni tushundim. Qaysi masala bo‘yicha murojaat qilmoqchisiz: mehnat, oila, qarz, shartnoma, mulk, ma’muriy masala, jinoyat yoki boshqa masala?",
        confidence: 95
      };
    }

    // B. "shikoyat ariza yozish tartibi", "shikoyat ariza yozish", "shikoyat yozish tartibi", "ariza yozish tartibi"
    const isComplaintProcedure = /^(shikoyat\s*ariza\s*yozish\s*tartibi|shikoyat\s*ariza\s*yozish|shikoyat\s*yozish\s*tartibi|ariza\s*yozish\s*tartibi|shikoyat\s*qilish\s*tartibi|ariza\s*yozish\s*qoidalari)$/i.test(latin.trim()) ||
                                 (latin.includes('shikoyat ariza') && (latin.includes('tartib') || latin.includes('yozish')) && latin.split(/\s+/).length <= 6);
    if (isComplaintProcedure) {
      return {
        intent: 'AMBIGUOUS_COMPLAINT_PROCEDURE',
        requiresRetrieval: false,
        needsClarification: true,
        directResponse: "Albatta. Shikoyat yoki sudga murojaat qilish tartibi masalaga qarab farq qiladi. Qaysi masala bo‘yicha murojaat qilmoqchisiz: mehnat, oila, qarz, shartnoma, davlat organining qarori, jinoyat yoki boshqa masala?",
        confidence: 95
      };
    }

    // C. "shikoyat qilmoqchiman", "ariza yozish kerak", "ariza yozmoqchiman", "shikoyat qilmoqchi edim"
    const isVagueApplication = /^(shikoyat\s*qilmoqchiman|ariza\s*yozish\s*kerak|ariza\s*yozmoqchiman|shikoyat\s*qilmoqchi\s*edim|ariza\s*kerak|shikoyat\s*kerak|ariza\s*yozish|shikoyat\s*yozmoqchiman)$/i.test(latin.trim());
    if (isVagueApplication) {
      return {
        intent: 'AMBIGUOUS_GENERIC_APPLICATION',
        requiresRetrieval: false,
        needsClarification: true,
        directResponse: "Qaysi masala bo‘yicha murojaat qilmoqchisiz: mehnat, oila, qarz, shartnoma, mulk, ma’muriy masala, davlat organining qarori, jinoyat yoki boshqa masala?",
        confidence: 95
      };
    }

    // D. "advokat kerak", "yurist kerak", "advokat topish kerak"
    const isLawyerRequest = /^(advokat\s*kerak|yurist\s*kerak|advokat\s*topish|yurist\s*topish|yurist\s*maslahati\s*kerak|advokat\s*yordami\s*kerak)$/i.test(latin.trim());
    if (isLawyerRequest) {
      return {
        intent: 'AMBIGUOUS_LAWYER_REQUEST',
        requiresRetrieval: false,
        needsClarification: true,
        directResponse: "AdvokatAI sun’iy intellekt asosida huquqiy ma’lumot, maslahat va hujjat loyihalarini tayyorlashda yordam beradi. Qaysi masala bo‘yicha murojaat qilmoqchisiz: mehnat, oila, qarz, shartnoma, mulk, ma’muriy masala, jinoyat yoki boshqa masala?",
        confidence: 95
      };
    }

    // E. "Mehnat shartnomasi bo'yicha savol" / "Mehnat shartnomasi" (Section 1 & Section 24)
    const isLaborContractTopic = /^(mehnat\s*shartnomas(i|ida)?\s*bo['‘`]?yicha(\s*savol)?|mehnat\s*shartnomasi\s*haqida|mehnat\s*shartnomasi|mehnat\s*shartnoma)$/i.test(latin.trim()) ||
                                 (latin.includes('mehnat shartnoma') && (latin.includes('savol') || latin.split(/\s+/).length <= 4) && !/(bekor\s*qil|bo['‘`]?shat|oylik|haqi|boshqa\s*(lavozim|ish)|o['‘`]?tka|otka|sinov|muddat|qo['‘`]?shimcha|tuzilmagan|yozma|roziligim)/i.test(latin));
    if (isLaborContractTopic) {
      return {
        intent: 'LABOR_CONTRACT_TOPIC_DISAMBIGUATION',
        requiresRetrieval: false,
        needsClarification: true,
        directResponse: `Albatta. Mehnat shartnomasi bo‘yicha aynan qaysi masala sizni qiziqtiryapti? Masalan:
— ishga qabul qilish yoki shartnoma tuzish;
— ish haqi;
— qo‘shimcha ish;
— boshqa ishga o‘tkazish;
— shartnomani o‘zgartirish;
— ishdan bo‘shatish;
— mehnat ta’tili;
— boshqa masala.`,
        confidence: 95
      };
    }

    // F. "Qarz masalasi" / "Qarz" (Section 1)
    const isBroadDebtTopic = /^(qarz|qarz\s*masalas(i|ida)?|qarz\s*haqida|qarz\s*bo['‘`]?yicha(\s*savol)?|qarzdorlik\s*masalas(i)?)$/i.test(latin.trim()) ||
                             (latin.includes('qarz') && (latin.includes('savol') || latin.includes('masala')) && !/(tilxat|notarius|qaytarmayapti|bermayapti|sudga|foiz|undir|kechiktir|shartnomam)/i.test(latin));
    if (isBroadDebtTopic) {
      return {
        intent: 'DEBT_TOPIC_DISAMBIGUATION',
        requiresRetrieval: false,
        needsClarification: true,
        directResponse: "Qarz masalasida aynan nimani bilmoqchisiz: tilxat yoki shartnoma asosida qarzni qaytarib olish, qarz shartnomasini rasmiylashtirish yoki qarzdorlik bo‘yicha sudga da’vo berishmi?",
        confidence: 95
      };
    }

    // G. "Pora so'rashdi" (Section 27)
    const isBribeSolicitationTopic = /(pora\s*so['‘`]?rashdi|pora\s*sorashdi|pora\s*so['‘`]?rayapti|pora\s*sorayapti|pora\s*talab\s*qilishyapti|pora\s*talab\s*qilyapti|mendan\s*pora\s*so['‘`]?rashdi|mendan\s*pora\s*sorashdi)/i.test(latin);
    const hasDetailedBribeFacts = /(ariza\s*yoz|shikoyat\s*qil|bosh\s*prokuratura|1253|1007|summa|so['‘`]?m|dollar|\$\b|sudga|qo['‘`]?lga\s*ol)/i.test(latin);
    if (isBribeSolicitationTopic && !hasDetailedBribeFacts) {
      return {
        intent: 'BRIBERY_SOLICITATION_CLARIFICATION',
        requiresRetrieval: false,
        needsClarification: true,
        directResponse: "Pulni kim so‘radi va uning lavozimi yoki vazifasi nima? Evaziga sizdan qanday harakat qilish yoki qilmaslik so‘ralgan? Pul amalda berildimi yoki faqat talab qilindimi?",
        confidence: 95
      };
    }

    // H. Transfer inquiry with missing facts (Section 25)
    const isTransferQuestion = /(ish\s*beruvchi\s*(?:meni\s*)?roziligim?siz\s*boshqa\s*(?:lavozimga|ishga)\s*o['‘`]?tkazishi\s*mumkinmi|roziliksiz\s*boshqa\s*(?:ishga|lavozimga)\s*o['‘`]?tkazish\s*mumkinmi|roziligimsiz\s*boshqa\s*(?:lavozimga|ishga)\s*o['‘`]?tkazishsa\s*bo['‘`]?ladimi|roziliksiz\s*boshqa\s*lavozimga|roziligimsiz\s*boshqa\s*ishga|roziligimsiz\s*boshqa\s*lavozimga)/i.test(latin);
    const hasTransferDetails = /(vaqtinchalik|doimiy|buyruq\s*chiq|hujjat\s*berilgan|qo['‘`]?shimcha\s*kelishuv)/i.test(latin);
    if (isTransferQuestion && !hasTransferDetails) {
      return {
        intent: 'LABOR_TRANSFER_PROGRESSIVE_CLARIFICATION',
        requiresRetrieval: false,
        needsClarification: true,
        directResponse: "Bu vaqtinchalik o‘tkazishmi yoki doimiymi? Sizga bu haqda buyruq yoki boshqa yozma hujjat berilganmi?",
        confidence: 95
      };
    }

    // I. "Pora va korrupsiya" (Section 21)
    const isPoraVaKorrupsiya = /^(pora\s*va\s*korrupsiya|korrupsiya\s*va\s*pora)$/i.test(latin.trim());
    if (isPoraVaKorrupsiya) {
      return {
        intent: 'CORRUPTION_TOPIC_DISAMBIGUATION',
        requiresRetrieval: false,
        needsClarification: true,
        directResponse: "Pora yoki korrupsiya masalasida aynan nima sodir bo‘lganini aniqlasak, qaysi huquqiy tartib qo‘llanishini aytaman. Sizdan pul/manfaat talab qilinganmi, kim talab qilgan va evaziga nima so‘ralgan?",
        confidence: 95
      };
    }

    // J. "Ijara huquqlari va kvartira nizosi" (Section 21 & Section 3)
    const isBroadTenancyDispute = /^(ijara\s*huquqlari\s*va\s*kvartira\s*nizosi|ijara\s*va\s*kvartira\s*nizosi|ijara\s*nizosi|kvartira\s*nizosi|ijara\s*huquqlari)$/i.test(latin.trim()) ||
                                  (latin.includes('ijara') && latin.includes('kvartira') && (latin.includes('nizo') || latin.includes('huquq')));
    if (isBroadTenancyDispute) {
      return {
        intent: 'AMBIGUOUS_TENANCY_DISPUTE',
        requiresRetrieval: false,
        needsClarification: true,
        directResponse: "Albatta. Kvartira ijarasi bo‘yicha aynan qaysi muammo yuzaga kelgan: ijara haqini undirish, depozitni qaytarish, shartnomani bekor qilish, uy-joydan chiqarish, ta’mirlash yoki yetkazilgan zarar?",
        confidence: 95
      };
    }

    // K. "Ijara shartnomasini bekor qilish" without facts (Section 3 & 22)
    const isRentalTerminationTopic = /^(ijara\s*shartnomasini\s*bekor\s*qilish(\s*tartibi)?|ijarani\s*bekor\s*qilish|kvartira\s*(ijarasini\s*)?bekor\s*qilish|shartnomani\s*bekor\s*qilish)$/i.test(latin.trim()) ||
                                     ((latin.includes('ijara') || latin.includes('kvartira')) && latin.includes('bekor qilish') && !/(men\s*ijarachiman|men\s*ijaraga\s*beruvchiman|uy\s*egasiman|ogohlantirish\s*xati|sudga\s*da['‘`]?vo)/i.test(latin));
    if (isRentalTerminationTopic) {
      return {
        intent: 'TENANCY_TERMINATION_PROGRESSIVE_CLARIFICATION',
        requiresRetrieval: false,
        needsClarification: true,
        directResponse: "Shartnomani bekor qilish tartibi kim bekor qilmoqchi ekaniga va shartnoma shartlariga bog‘liq. Siz ijarachimisiz yoki ijaraga beruvchimisiz? Shartnoma yozma shakldami va muddatidan oldin bekor qilish sharti unda ko‘rsatilganmi?",
        confidence: 95
      };
    }

    // ========================================================
    // 1. SHORT TOPIC-WORD DISAMBIGUATION (1-2 words only)
    // Never turn single topic words into giant legal essays!
    // ========================================================
    const words = latin.split(/\s+/).filter(Boolean);
    if (words.length <= 2) {
      const w0 = words[0];
      if (/^ijara(ga)?$/i.test(w0) || /^arenda$/i.test(w0)) {
        return {
          intent: 'TOPIC_DISAMBIGUATION',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: "Ijara masalasida aynan nimani bilmoqchisiz: ijara shartnomasi, ijara haqini to‘lash, depozitni qaytarish, uy-joydan chiqarish yoki boshqa masalami?",
          confidence: 95
        };
      }
      if (/^mehnat$/i.test(w0)) {
        return {
          intent: 'TOPIC_DISAMBIGUATION',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: "Mehnat munosabatlarida aynan qaysi masala bo‘yicha yordam kerak: oylik maosh, ishdan bo‘shatish, taʼtil, mehnat shartnomasi yoki boshqa mavzumi?",
          confidence: 95
        };
      }
      if (/^sud$/i.test(w0) || /^sudga$/i.test(w0)) {
        return {
          intent: 'TOPIC_DISAMBIGUATION',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: "Sudga murojaat qilmoqchi ekaningizni tushundim. Qaysi masala bo‘yicha murojaat qilmoqchisiz: mehnat, oila, qarz, shartnoma, mulk, ma’muriy masala, jinoyat yoki boshqa masala?",
          confidence: 95
        };
      }
      if (/^shikoyat$/i.test(w0)) {
        return {
          intent: 'TOPIC_DISAMBIGUATION',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: "Albatta. Shikoyat yoki sudga murojaat qilish tartibi masalaga qarab farq qiladi. Qaysi masala bo‘yicha murojaat qilmoqchisiz: mehnat, oila, qarz, shartnoma, davlat organining qarori, jinoyat yoki boshqa masala?",
          confidence: 95
        };
      }
      if (/^pora$/i.test(w0) || /^korrupsiya$/i.test(w0)) {
        return {
          intent: 'TOPIC_DISAMBIGUATION',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: "Pulni kim so‘radi va uning lavozimi yoki vazifasi nima? Evaziga sizdan qanday harakat qilish yoki qilmaslik so‘ralgan? Pul amalda berildimi yoki faqat talab qilindimi?",
          confidence: 95
        };
      }
      if (/^qarz(dorlik)?$/i.test(w0)) {
        return {
          intent: 'TOPIC_DISAMBIGUATION',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: "Qarz masalasida aynan nimani bilmoqchisiz: tilxat yoki shartnoma asosida qarzni qaytarib olish, qarz shartnomasini rasmiylashtirish yoki qarzdorlik bo‘yicha sudga da’vo berishmi?",
          confidence: 95
        };
      }
      if (/^jarima$/i.test(w0)) {
        return {
          intent: 'TOPIC_DISAMBIGUATION',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: "Qaysi sohadagi jarima haqida bilmoqchisiz: yo‘l harakati qoidabuzarligi (radar), maʼmuriy jarima yoki soliq jarimasimi?",
          confidence: 95
        };
      }
      if (/^hokimlik$/i.test(w0) || /^hokimiyat$/i.test(w0)) {
        return {
          intent: 'TOPIC_DISAMBIGUATION',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: "Hokimlik masalasida aynan qanday holat bo‘yicha yordam kerak: hokim qarori ustidan shikoyat, yer ajratish/yer nizosi, bino-inshoot, kompensatsiya yoki ijtimoiy masalami?",
          confidence: 95
        };
      }
      if (/^oylik$/i.test(w0) || /^maosh$/i.test(w0)) {
        return {
          intent: 'TOPIC_DISAMBIGUATION',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: "Oylik maosh bo‘yicha aynan qanday holat: ish beruvchi maoshni kechiktiryaptimi, to‘liq to‘lamayaptimi yoki hisob-kitob qilinmayaptimi?",
          confidence: 95
        };
      }
      if (/^meros$/i.test(w0)) {
        return {
          intent: 'TOPIC_DISAMBIGUATION',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: "Meros masalasida aynan nimani bilmoqchisiz: vasiyatnoma bo‘yicha meros, qonun bo‘yicha merosxo‘rlik navbati yoki merosni qabul qilish muddatimi?",
          confidence: 95
        };
      }
      if (/^ajrashish$/i.test(w0) || /^ajrim$/i.test(w0)) {
        return {
          intent: 'TOPIC_DISAMBIGUATION',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: "Nikohdan ajrashish masalasida qaysi tartib kerak: FHDYo (ZAGS) orqali o‘zaro rozilik bilanmi yoki sud orqali (voyaga yetmagan farzandlar yoki mulkiy nizo bormi)?",
          confidence: 95
        };
      }
      if (/^uy$/i.test(w0) || /^kvartira$/i.test(w0)) {
        return {
          intent: 'TOPIC_DISAMBIGUATION',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: "Uy-joy masalasida aynan qanday muammo: oldi-sotdi, ijara, ro‘yxatdan chiqarish (propiska), meros yoki mulk bo‘linishimi?",
          confidence: 95
        };
      }
      if (/^avtomobil$/i.test(w0) || /^mashina$/i.test(w0)) {
        return {
          intent: 'TOPIC_DISAMBIGUATION',
          requiresRetrieval: false,
          needsClarification: true,
          directResponse: "Avtomobil bo‘yicha qaysi masala: oldi-sotdi, ishonchnoma (doverennost), yo‘l-transport hodisasi yoki sug‘urta to‘lovimi?",
          confidence: 95
        };
      }
    }

    // ========================================================
    // 2. ISOLATED SPECIFIC ARTICLE INQUIRY ("253-modda")
    // When asked without prior context, determine what user wants (Section 16 & Test 10)
    // ========================================================
    const isSingleArticleOnly = /^\d+-?\s*modda(?:si)?$/i.test(latin.trim()) || /^modda\s*\d+$/i.test(latin.trim());
    if (isSingleArticleOnly && (!history || history.length === 0)) {
      const artNum = latin.match(/\d+/)[0];
      const selectedDoc = options?.law_group && LAW_GROUP_MAP[options.law_group] ? LAW_GROUP_MAP[options.law_group] : null;
      const nonExistent = this.checkNonExistentArticle(artNum, selectedDoc);
      if (nonExistent.isNonExistent) {
        return {
          intent: 'NON_EXISTENT_ARTICLE',
          requiresRetrieval: false,
          needsClarification: false,
          directResponse: nonExistent.directResponse,
          confidence: 95
        };
      }

      return {
        intent: 'ARTICLE_OPTIONS',
        requiresRetrieval: false,
        needsClarification: true,
        directResponse: `${artNum}-moddani tushuntirib beraymi, rasmiy Lex.uz havolasini taqdim etaymi yoki sizning aniq bir holatingizga qanday qo‘llanishini bilmoqchimisiz?`,
        confidence: 95
      };
    }

    // ========================================================
    // 3. CASUAL / IDENTITY ("Isming nima?", "Siz kimsiz?")
    // ========================================================
    const identityRegex = /(isming(iz)?\s*nima|ot(ing|ingiz)\s*nima|siz\s*kimsiz|kimsiz|kim\s*siz|isming\s*kim|o['‘`]?zing\s*haqingda|o['‘`]?zingiz\s*haqingizda)/i;
    if (identityRegex.test(latin) && latin.split(/\s+/).length <= 6) {
      return {
        intent: 'ABOUT_PRODUCT',
        requiresRetrieval: false,
        directResponse: CASUAL_IDENTITY_RESPONSE,
        confidence: 100,
        needsClarification: false
      };
    }

    // 4. CASUAL / GREETING
    const greetingRegex = /^(salom|assalomu\s*alaykum|assalom|qalaysan|qalaysiz|qalesiz|qandaysiz|ahvollaringiz\s*qalay|hello|hi|xayrli\s*(tong|kun|kech)|privet|hey)\b/i;
    if (greetingRegex.test(latin) && latin.split(/\s+/).length <= 4) {
      return {
        intent: 'GREETING',
        requiresRetrieval: false,
        directResponse: GREETING_RESPONSE,
        confidence: 100,
        needsClarification: false
      };
    }

    // 5. CASUAL / COURTESY / THANKS
    const thanksRegex = /^(rahmat|katta\s*rahmat|tashakkur|minnatdorman|baraka\s*toping|spasibo|thank\s*you|thanks)\b/i;
    if (thanksRegex.test(latin) && latin.split(/\s+/).length <= 5) {
      return {
        intent: 'COURTESY',
        requiresRetrieval: false,
        directResponse: COURTESY_RESPONSE,
        confidence: 100,
        needsClarification: false
      };
    }

    // 6. CASUAL / CAPABILITIES
    const capabilitiesRegex = /(advokatai|nima(lar)?\s*qila\s*(olasan|olasiz|oladi)|nimalarga\s*qodir(san|siz)|nimalarni\s*bila(san|siz)|qanday\s*yordam\s*bera\s*(olasan|olasiz)|qanday\s*imkoniyat(laring|laringiz)\s*bor|vazifang\s*nima|funksiyalaring)/i;
    if (capabilitiesRegex.test(latin) && (latin.includes('nima') || latin.includes('qila') || latin.includes('yordam') || latin.includes('imkoniyat') || latin.split(/\s+/).length <= 8)) {
      return {
        intent: 'ABOUT_PRODUCT',
        requiresRetrieval: false,
        directResponse: CAPABILITIES_RESPONSE,
        confidence: 100,
        needsClarification: false
      };
    }

    // 7. HOW TO ASK
    const howToAskRegex = /(qanday\s*(qilib\s*)?savol\s*ber(aman|ish)|savol\s*berish\s*tartibi|qanaqa\s*savol)/i;
    if (howToAskRegex.test(latin)) {
      return {
        intent: 'HOW_TO_ASK',
        requiresRetrieval: false,
        directResponse: HOW_TO_ASK_EXPLANATION,
        confidence: 95,
        needsClarification: false
      };
    }

    // 8. GENERAL NON-LEGAL
    const outOfScopeRegex = /^(ob-havo|ob\s*havo|havo\s*qanday|bugun\s*havo|ertaga\s*havo|ovqat\s*pishirish|tort\s*tayyorlash|matematika|futbol|kino|qo['‘`]?shiq)\b/i;
    const fantasyRegex = /(marsga|oyga\s*uchish|kosmik\s*kema|kosmosga|boshqa\s*sayyora|raketada\s*uchish|sehrgar|afsungar)/i;

    if (outOfScopeRegex.test(latin) || fantasyRegex.test(latin) || latin.includes('havo qanday') || latin.includes('ob-havo qanday')) {
      const responseText = fantasyRegex.test(latin)
        ? `Oʻzbekiston Respublikasining amaldagi qonunchiligida kosmik parvozlar yoki fazoviy kema vizasi boʻyicha huquqiy normalar mavjud emas.\n\nAdvokatAI faqat amaldagi real qonunchilik asosida ish yuritadi. Agar mehnat, fuqarolik, mulk, jinoyat yoki maʼmuriy munosabatlar boʻyicha amaliy huquqiy savollaringiz boʻlsa, marhamat, murojaat qilishingiz mumkin.`
        : OUT_OF_SCOPE_EXPLANATION;

      return {
        intent: 'GENERAL_NON_LEGAL',
        requiresRetrieval: false,
        needsClarification: false,
        directResponse: responseText,
        confidence: 10
      };
    }

    // ========================================================
    // 9. PROGRESSIVE DISCOVERY FOR BARE UNPAID SALARY
    // When user says "Ish beruvchi ish haqini to'lamayapti" / "Ish beruvchi oylikni bermayapti" without any details:
    // Ask role & material facts clarification first instead of dumping a 500-word legal essay! (Section 1, 24, 25)
    // ========================================================
    const isBareSalaryComplaint = /(ish\s*beruvchi\s*(?:oylik(ni)?|ish\s*haqi(ni)?)\s*(?:to['‘`]?lamayapti|bermayapti)|oyligim\s*berilmayapti|ish\s*haqim\s*to['‘`]?lanmayapti|ish\s*haqi(ni)?\s*(?:to['‘`]?lamayapti|bermayapti)|oylikni\s*(?:to['‘`]?lamayapti|bermayapti))/i.test(latin) &&
                                  !latin.includes('oy bo') && 
                                  !latin.includes('oydan beri') && 
                                  !latin.includes('shartnoma') &&
                                  latin.split(/\s+/).length <= 8;

    if (isBareSalaryComplaint && (!history || history.length === 0)) {
      return {
        intent: 'SALARY_PROGRESSIVE_CLARIFICATION',
        requiresRetrieval: false,
        needsClarification: true,
        directResponse: "Siz xodim sifatida ish haqingizni ololmayapsizmi? Agar shunday bo‘lsa, ish haqi qaysi davr uchun to‘lanmagan va to‘lov qachon amalga oshirilishi kerak edi?",
        confidence: 95
      };
    }

    // ========================================================
    // 10. SPECIFIC AMBIGUOUS CHECKS (Section 4 & 16)
    // ========================================================
    // A. Administrative Fine
    const isAdministrativeFine = /(ma['‘`]?muriy\s*jarima|jarima(dan)?\s*shikoyat|jarima\s*ustidan|jarimaga\s*e['‘`]?tiroz|jarimani\s*bekor\s*qilish)/i.test(latin);
    const hasFineIssuer = /(politsiya|militsiya|iiv|ichki\s*ishlar|yhxx|radar|gai|yo['‘`]?l\s*harakati|soliq|mehnat\s*inspektor|bojxona|sud|hokimiyat)/i.test(latin);

    if (isAdministrativeFine && !hasFineIssuer) {
      return {
        intent: 'AMBIGUOUS_ADMINISTRATIVE_FINE',
        requiresRetrieval: false,
        needsClarification: true,
        directResponse: "Albatta. Ma’muriy jarima bo‘yicha shikoyat tartibi qarorni kim chiqarganiga va qanday qaror ekaniga qarab farq qiladi. Qarorni qaysi organ yoki mansabdor shaxs chiqargan va qaror nusxasini qachon olgansiz?",
        confidence: 95
      };
    }

    // A.2 Employer Complaint Ambiguity
    const isEmployerComplaint = /(ish\s*beruvchi[a-z‘ʻ'’-]*\s*ustidan\s*shikoyat|ish\s*beruvchi[a-z‘ʻ'’-]*ga\s*shikoyat|ishxona[a-z‘ʻ'’-]*\s*ustidan\s*shikoyat|korxona[a-z‘ʻ'’-]*\s*ustidan\s*shikoyat|direktor[a-z‘ʻ'’-]*\s*ustidan\s*shikoyat)/i.test(latin);
    const hasSpecificLaborViolation = /(ish\s*haqi|maosh|oylik|bo['‘`]?shat|hayda|intizom|jazo|boshqa\s*ishga|shartnoma\s*sharti|xavfsizlik|sharoit|ta['‘`]?til|tazyiq)/i.test(latin);

    if (isEmployerComplaint && !hasSpecificLaborViolation) {
      return {
        intent: 'AMBIGUOUS_EMPLOYER_COMPLAINT',
        requiresRetrieval: false,
        needsClarification: true,
        directResponse: `Ish beruvchi ustidan shikoyat qilishdan oldin qaysi huquqingiz buzilganini aniqlashtirib olish lozim:
1. Ish haqi to‘lanmasligi yoki asossiz ushlab qolinishi?
2. Noqonuniy ishdan bo‘shatish yoki majburiy ariza yozdirish?
3. Xodimning roziligisiz boshqa ishga yoki boshqa joyga o‘tkazish?
4. Asossiz intizomiy jazo (hayfsan, jarima)?
5. Xavfsiz mehnat sharoitlari ta’minlanmaganligi yoki ta’til berilmasligi?

Shuningdek, rasmiy mehnat shartnomangiz bormi? Vaziyatingizni yozsangiz, tegishli qonun moddalari hamda Davlat mehnat inspeksiyasi (1176) yoki sudga murojaat qilish tartibini ko‘rsatib beraman.`,
        confidence: 95
      };
    }

    // A.3 Hokimlik Direct Complaint Ambiguity
    const isHokimlikDirectComplaint = /(hokimlik[a-z‘ʻ'’-]*\s*ustidan\s*shikoyat|hokimlikdan\s*shikoyat|hokim\s*ustidan\s*shikoyat|hokimiyat[a-z‘ʻ'’-]*\s*ustidan\s*shikoyat|hokimiyatdan\s*shikoyat|hokim\s*qarori(dan|\s*ustidan)?\s*shikoyat)/i.test(latin);
    const hasSpecificHokimlikIssue = /(yer|uchastka|snos|buzilish|kompensatsiya|bino|ruxsatnoma|tender|auksion|qurilish|idorasi|ijtimoiy)/i.test(latin);

    if (isHokimlikDirectComplaint && !hasSpecificHokimlikIssue) {
      return {
        intent: 'HOKIMLIK_COMPLAINT_CLARIFICATION',
        requiresRetrieval: false,
        needsClarification: true,
        directResponse: `Hokimlik bo‘yicha shikoyat yoki nizolashish tartibi qaror yoki harakatning aynan nimadan iboratligiga bog‘liq.

Iltimos, quyidagilarni aniqlashtiring:
1. Hokimlikning qaysi qarori yoki harakati ustidan shikoyat qilmoqchisiz?
2. Qarorning sanasi va raqami bormi?
3. Bu qaror sizning qaysi huquqingiz yoki manfaatlaringizga ta’sir qilgan?
4. Qaror yoki hujjatning nusxasi sizda bormi?
5. Hokimlikka yoki yuqori turuvchi organga oldin murojaat qilganmisiz?

Shu ma’lumotlarga asoslanib, shikoyatni qaysi organga yoki ma’muriy sudga, qanday tartibda berish mumkinligini va tegishli qonunchilik asosini aniq ko‘rsatib beraman.`,
        confidence: 95
      };
    }

    // A.4 Corruption & Bribery Ambiguity ("Pora va korrupsiya holatlari", "Korrupsiya holati", etc.)
    const isGeneralCorruption = /(pora\s*va\s*korrupsiya|korrupsiya\s*va\s*pora|korrupsiya\s*holat(i|lari)?|pora\s*holat(i|lari)?|poraxo['‘`]?rlik\s*holat)/i.test(latin);
    const hasSpecificBriberyAction = /(talab\s*qil|pora\s*ol|pora\s*ber|vositachi|pul\s*so['‘`]?ra|arz\s*qil|xabar\s*ber|og['‘`]?irmi)/i.test(latin);

    if (isGeneralCorruption && !hasSpecificBriberyAction) {
      return {
        intent: 'CORRUPTION_AMBIGUOUS_CLARIFICATION',
        requiresRetrieval: false,
        needsClarification: true,
        directResponse: `Pora yoki korrupsiyaga oid holatning huquqiy bahosi vaziyatdagi shaxslar, talab qilingan manfaat va uning evaziga nima bajarilishi kerak bo‘lganiga qarab farq qiladi.

Aniq yo‘l-yo‘riq berishim uchun:

1. Sizdan pul yoki boshqa manfaat talab qilinganmi, yoki sizdan pul berish so‘ralganmi?
2. Buni kim talab qilgan va uning lavozimi qanday?
3. Evaziga nima qilish yoki qilmaslik va’da qilingan?
4. Pul/manfaat amalda berilganmi?`,
        confidence: 95
      };
    }

    // B. Government Complaint
    const isGovComplaint = /(davlat\s*organi(ga|dan)?\s*shikoyat|davlat\s*tashkilotiga\s*shikoyat|davlat\s*idorasiga\s*shikoyat|mansabdor\s*shaxs\s*ustidan\s*shikoyat)/i.test(latin);
    const hasSpecificGovEntity = /(politsiya|soliq|hokimlik|hokimiyat|iiv|militsiya|bojxona|prokuratura|sud|kadastr|vazirlik|inspeksiya|maktab|bog['‘`]?cha)/i.test(latin);

    if (isGovComplaint && !hasSpecificGovEntity) {
      return {
        intent: 'AMBIGUOUS_GOVERNMENT_COMPLAINT',
        requiresRetrieval: false,
        needsClarification: true,
        directResponse: "Qaysi davlat organi yoki mansabdor shaxs ustidan va aynan qanday masala bo‘yicha shikoyat qilmoqchisiz (hokimlik, soliq, ichki ishlar yoki boshqa organ; noqonuniy qaror, harakatsizlik yoki murojaatingizga javob berilmaganligi)?",
        confidence: 95
      };
    }

    // C. Generic Complaint
    const isGenericComplaint = /(shikoyat\s*ariza|shikoyat\s*arizasi|ariza\s*yozish|shikoyat\s*qilish|ariza\s*qanday\s*yoziladi|shikoyat\s*qanday\s*yoziladi|qayerga\s*shikoyat|shikoyat\s*qilmoqchiman|ariza\s*berish\s*tartibi|murojaat\s*qilish\s*tartibi)/i.test(latin);
    const hasSpecificSector = /(jarima|politsiya|ish\s*beruvchi|patron|maosh|oylik|mehnat|ishxona|korxona|davlat\s*organ|hokimiyat|hokimlik|sud|prokuratura|soliq|militsiya|iiv|jinoyat|firibgar|pora|ijara|uy\s*egasi|aliment|radar|maktab|bog['‘`]?cha|inspektor|inspeksiya)/i.test(latin);

    if (isGenericComplaint && !hasSpecificSector) {
      return {
        intent: 'AMBIGUOUS_COMPLAINT',
        requiresRetrieval: false,
        needsClarification: true,
        directResponse: "Qaysi masala bo‘yicha shikoyat qilmoqchisiz: ish beruvchiga, davlat organiga, sudga yoki davlat organi chiqargan qaror ustidanmi?",
        confidence: 95
      };
    }

    // D. Ambiguous Tenancy
    const isBroadTenancy = /(ijara\s*huquqlari\s*va\s*kvartira\s*nizosi|ijara\s*nizosi|kvartira\s*nizosi|ijara\s*haqida\s*nizo)/i.test(latin);
    const hasSpecificTenancyIssue = /(chiqarib|chiqib\s*ket|depozit|zalog|to['‘`]?lamayapti|remont|zarar|buzish|qaytarmayapti|subijara|komunal)/i.test(latin);

    if (isBroadTenancy && !hasSpecificTenancyIssue) {
      return {
        intent: 'AMBIGUOUS_TENANCY_DISPUTE',
        requiresRetrieval: false,
        needsClarification: true,
        directResponse: "Albatta. Kvartira ijarasi bo‘yicha aynan qaysi muammo yuzaga kelgan: ijara haqini undirish, depozitni qaytarish, shartnomani bekor qilish, uy-joydan chiqarish, ta’mirlash yoki yetkazilgan zarar?",
        confidence: 95
      };
    }

    // E. Unclear / Vague
    const vaguePattern = /(muammo\s*(bo['‘`]?ldi|boldi|bor)|shunaqa\s*holat\s*(bo['‘`]?ldi|boldi)|bir\s*vaziyat\s*(bo['‘`]?ldi|boldi)|yordam\s*kerak|maslahat\s*bering|nima\s*qilishim\s*kerak|nima\s*qilsam\s*bo['‘`]?ladi)/i;
    const hasConcreteKeywords = /(mehnat|maosh|oylik|patron|ishchi|xodim|\bish\b|shartnoma|ijara|kvartira|uy|mulk|meros|pora|jinoyat|jarima|radar|kadastr|nikoh|ajrash|aliment|soliq|sud|huquqbuzarlik|inspeksiy)/i.test(latin);

    if (vaguePattern.test(latin) && !hasConcreteKeywords) {
      return {
        intent: 'UNCLEAR_LEGAL',
        requiresRetrieval: false,
        needsClarification: true,
        directResponse: `Vaziyatingizni aniqroq tushuntirib bera olasizmi? Masalan:
1. Nima sodir bo‘ldi?
2. Bu kim bilan bog‘liq (ish beruvchi, qarindosh, davlat organi, qo‘shni, mulk egasi)?
3. Qachon sodir bo‘ldi va o‘rtada qandaydir yozma shartnoma yoki hujjat bormi?
4. Sizga aynan qanday huquqiy yordam yoki natija kerak?`,
        confidence: 90
      };
    }

    // ========================================================
    // 11. SPECIFIC ARTICLE REQUEST WITH CONTEXT
    // ========================================================
    const articleMatch = latin.match(/\b(\d+)-?\s*modda(?:si)?\b/i) || latin.match(/\bmodda(?:si)?\s*(\d+)\b/i);
    if (articleMatch) {
      const artNum = articleMatch[1];
      let specifiedDoc = null;
      if (latin.includes('konstitutsiya')) specifiedDoc = 'constitution';
      else if (latin.includes('jinoyat')) specifiedDoc = 'criminal_code';
      else if (latin.includes('mehnat')) specifiedDoc = 'labor_code';
      else if (latin.includes('fuqarolik')) specifiedDoc = 'civil_code';
      else if (latin.includes('ma\'muriy') || latin.includes('mamuriy')) specifiedDoc = 'administrative_code';
      else if (artNum === '56') specifiedDoc = 'constitution';
      else if (artNum === '168') specifiedDoc = 'criminal_code';
      else if (artNum === '253') specifiedDoc = 'labor_code';

      const selectedDoc = options?.law_group && LAW_GROUP_MAP[options.law_group] ? LAW_GROUP_MAP[options.law_group] : null;
      const targetDoc = specifiedDoc || selectedDoc;

      const nonExistent = this.checkNonExistentArticle(artNum, targetDoc);
      if (nonExistent.isNonExistent) {
        return {
          intent: 'NON_EXISTENT_ARTICLE',
          requiresRetrieval: false,
          needsClarification: false,
          directResponse: nonExistent.directResponse,
          confidence: 95
        };
      }

      return {
        intent: 'SPECIFIC_ARTICLE',
        requiresRetrieval: true,
        needsClarification: false,
        articleNumber: artNum,
        specifiedDoc: targetDoc
      };
    }

    // ========================================================
    // 12. TASK INTENT DETECTION (Document, Action, Yes/No, Calculation)
    // ========================================================
    let taskType = 'GENERAL_ADVICE';
    if (/(ariza\s*yozib\s*ber|shikoyat\s*yozib\s*ber|shablon\s*ber|namuna\s*ber)/i.test(latin)) {
      taskType = 'DOCUMENT_REQUEST';
    } else if (/(endi\s*nima\s*qilay|nima\s*qilishim\s*kerak|qayerga\s*murojaat\s*qilay|qanday\s*yo['‘`]?l\s*tutay)/i.test(latin)) {
      taskType = 'ACTION_REQUEST';
    } else if (/(sudga\s*bersam\s*bo['‘`]?ladimi|mumkinmi|haqlimi)/i.test(latin)) {
      taskType = 'YES_NO_REQUEST';
    } else if (/(qancha\s*pul|qancha\s*kompensatsiya|hisoblab\s*ber|qancha\s*undir)/i.test(latin)) {
      taskType = 'CALCULATION_REQUEST';
    }

    return {
      intent: 'LEGAL',
      taskType,
      requiresRetrieval: true,
      needsClarification: false
    };
  }

  /**
   * Deep scenario understanding & structuring before retrieval.
   * Tracks active case state and resolves multi-turn entities.
   */
  analyzeScenario(rawMessage, options = {}) {
    const { selectedLawGroup = null, history = [], intentInfo = null } = options;
    const clean = rawMessage.trim();
    let latin = cyrillicToLatin(normalizeSearchText(clean)).toLowerCase();

    // Track structured conversation state
    const convState = conversationStateService.trackState(rawMessage, history);

    // Multi-turn context resolution
    let resolvedQuery = clean;
    if (Array.isArray(history) && history.length > 0) {
      const lastUserMsg = [...history].reverse().find(h => h.sender === 'user' && h.text);
      if (lastUserMsg && lastUserMsg.text) {
        const prevLatin = cyrillicToLatin(normalizeSearchText(lastUserMsg.text)).toLowerCase();
        const isFollowUp = /(uni|buni|o['‘`]?shani|bekor\s*qilish|muddati|tartibi|qanday\s*bo['‘`]?ladi|-chi\b|2 oy|ha|yo'q)/i.test(latin) && latin.split(/\s+/).length <= 6;
        if (isFollowUp) {
          if (prevLatin.includes('mehnat shartnomasi') || prevLatin.includes('shartnoma')) {
            if (!latin.includes('mehnat shartnomasi')) {
              latin = `mehnat shartnomasi ${latin}`;
              resolvedQuery = `Mehnat shartnomasi ${clean}`;
            }
          } else if (prevLatin.includes('ijara')) {
            if (!latin.includes('ijara')) {
              latin = `ijara shartnomasi ${latin}`;
              resolvedQuery = `Ijara ${clean}`;
            }
          }
        }
      }
    }

    const historyText = Array.isArray(history) 
      ? history.filter(h => h.sender === 'user').map(h => h.text || '').join(' ').toLowerCase() 
      : '';

    // If topic switch occurred, DO NOT inherit old history text!
    const combinedText = convState.isTopicSwitch ? latin : `${historyText} ${latin}`;

    const matchedFineTopic = matchFineGrainedTopic(combinedText);
    const { knownFacts, missingCriticalFacts } = extractKnownAndMissingFacts(combinedText, matchedFineTopic);

    const scenario = {
      jurisdiction: matchedFineTopic?.jurisdictionRule || 'O‘zbekiston Respublikasi',
      domain: matchedFineTopic?.domain || 'general',
      fineGrainedTopic: matchedFineTopic?.id || null,
      disputeType: matchedFineTopic?.id || intentInfo?.disputeType || null,
      taskType: intentInfo?.taskType || 'GENERAL_ADVICE',
      recommended_document_id: matchedFineTopic?.allowedDocumentIds?.[0] || intentInfo?.specifiedDoc || null,
      allowedDocumentIds: matchedFineTopic?.allowedDocumentIds || null,
      disallowedDocumentIds: matchedFineTopic?.disallowedDocumentIds || [],
      forbiddenArticleNumbers: matchedFineTopic?.forbiddenArticleNumbers || [],
      jurisdictionRule: matchedFineTopic?.jurisdictionRule || 'Vakolatli sud yoki davlat organi',
      proceduralRoute: matchedFineTopic?.proceduralRoute || null,
      knownFacts: knownFacts,
      missingCriticalFacts: missingCriticalFacts,
      isConditionalReasoningRequired: missingCriticalFacts.length > 0,
      issues: matchedFineTopic ? [matchedFineTopic.name] : [],
      facts: convState.active_case.facts,
      search_terms: [],
      exactArticleNumber: intentInfo?.articleNumber || null,
      targetArticleNumbers: matchedFineTopic?.targetArticleNumbers ? [...matchedFineTopic.targetArticleNumbers] : []
    };

    if (intentInfo?.specifiedDoc) {
      scenario.recommended_document_id = intentInfo.specifiedDoc;
      scenario.allowedDocumentIds = [intentInfo.specifiedDoc];
      scenario.disallowedDocumentIds = (scenario.disallowedDocumentIds || []).filter(d => d !== intentInfo.specifiedDoc);
      if (intentInfo.specifiedDoc === 'constitution') scenario.domain = 'constitution';
      else if (intentInfo.specifiedDoc === 'criminal_code') scenario.domain = 'criminal';
      else if (intentInfo.specifiedDoc === 'labor_code') scenario.domain = 'labor';
      else if (intentInfo.specifiedDoc === 'civil_code') scenario.domain = 'civil';
      else if (intentInfo.specifiedDoc === 'administrative_code') scenario.domain = 'administrative';
    }

    if (intentInfo?.articleNumber) {
      scenario.exactArticleNumber = intentInfo.articleNumber;
      scenario.targetArticleNumbers = [intentInfo.articleNumber];
    }

    // ========================================================
    // PRIORITY 1: CORRUPTION & BRIBERY (CRIMINAL CODE PRIORITY)
    // ========================================================
    const isBribery = /(\bpora\b|\bkorrupsiya\b|\bpora olish\b|\bpora berish\b|\bvositachilik\b|\bpora so['‘`]?rayapti\b)/i.test(combinedText);
    const isForgery = /(\bsoxtalashtir|\bqalbakilashtir|\bsoxta hujjat|\b228\b)/i.test(combinedText);
    const isOtherCriminal = /(\bo['‘`]?g['‘`]?rilik\b|\bfiribgar\b|\btovlamachi\b|\bjinoyat\b|\bjazo\b|\bqamoq\b|\bsudlan\b|\btergov\b|\bkontrabanda\b)/i.test(combinedText);

    if (isBribery) {
      scenario.domain = 'criminal';
      scenario.recommended_document_id = 'criminal_code';
      scenario.targetDocumentId = 'criminal_code';
      scenario.disputeType = 'corruption_bribery';
      scenario.allowedDocumentIds = ['criminal_code'];
      scenario.disallowedDocumentIds = (scenario.disallowedDocumentIds || []).filter(d => d !== 'criminal_code');
      scenario.issues = (scenario.issues || []).filter(i => !i.toLowerCase().includes('hokimlik'));
      scenario.issues.push("Korrupsiya / poraxo'rlik jinoyati");
      if (latin.includes('shikoyat') || latin.includes('ariza') || latin.includes('qayerga') || latin.includes('murojaat')) {
        scenario.legalAction = 'complaint';
        scenario.taskType = 'CORRUPTION_COMPLAINT';
      }

      if (latin.includes("so'rayapti") || latin.includes("sorayapti") || latin.includes("olish")) {
        scenario.targetArticleNumbers.push('210');
        scenario.search_terms.push("pora olish", "210-modda", "mansabdor shaxs pora talab qilishi", "jinoiy javobgarlik");
      } else if (latin.includes("berish")) {
        scenario.targetArticleNumbers.push('211');
        scenario.search_terms.push("pora berish", "211-modda", "jinoiy javobgarlik");
      } else if (latin.includes("xabar") || latin.includes("qayerga")) {
        scenario.targetArticleNumbers.push('210', '211');
        scenario.search_terms.push("korrupsiyaga qarshi kurashish", "xabar berish", "1253", "agentlik");
      } else {
        scenario.targetArticleNumbers.push('210', '211', '212');
        scenario.search_terms.push("pora olish", "pora berish", "korrupsiya");
      }
    } else if (isForgery && !scenario.recommended_document_id) {
      scenario.domain = 'criminal';
      scenario.recommended_document_id = 'criminal_code';
      scenario.disputeType = 'criminal_forgery';
      scenario.targetArticleNumbers.push('228');
      scenario.issues.push("Hujjatlar, shtamplar, muhrlar, blankalarni qalbakilashtirish (228-modda)");
      scenario.search_terms.push("228-modda", "hujjatlarni qalbakilashtirish", "soxta hujjatdan foydalanish", "jinoiy javobgarlik");
    } else if (isOtherCriminal && !scenario.recommended_document_id) {
      scenario.domain = 'criminal';
      scenario.recommended_document_id = 'criminal_code';
      scenario.disputeType = 'criminal_general';
      if (latin.includes('168') || latin.includes('firibgar')) {
        scenario.targetArticleNumbers.push('168');
        scenario.issues.push("Firibgarlik (168-modda)");
        scenario.search_terms.push("firibgarlik", "168-modda", "aldash yoki ishonchni suiiste'mol qilish");
      }
    }

    // ========================================================
    // PRIORITY 2: LABOR LAW DISPUTE SUB-CLASSIFICATION
    // ========================================================
    const isTenancyQuery = /(\bijara\b|\bkvartira\b|\barendator\b|\barenda\b|\buy\s*egasi\b|\bdepozit\b)/i.test(combinedText);
    const isStateOrganDispute = /(\bhokimlik\b|\bhokimiyat\b|\bhokim\b|\bdavlat organi\b|\bsoliq organi\b)/i.test(combinedText);
    const hasExplicitEmployment = /(\bishlayman\b|\bxodimiman\b|\bmaoshim\b|\bishdan bo['‘`]?shatishdi\b|\bmehnat shartnomam\b|\bish beruvchi\b)/i.test(combinedText);
    const isLaborGeneral = !isTenancyQuery && (!isStateOrganDispute || hasExplicitEmployment) && /(\bmaosh\b|\boylik\b|\boylig\b|\bpatron\b|\bish beruvchi\b|\bxodim\b|\bishdan bo['‘`]?shat|\bbo['‘`]?shash\b|\bhayda\b|\bmehnat shartnoma|\bta['‘`]?til\b|\bmehnat\b|\botpusk\b|\bkasaba\b|\bish tashlash\b|\bmehnat inspektor|\blavozim|\bboshqa ishga|\bo['‘`]?tkazish\b|\botkazish\b)/i.test(combinedText);

    if (!scenario.recommended_document_id && isLaborGeneral) {
      scenario.domain = 'labor';
      scenario.recommended_document_id = 'labor_code';

      // Sub-type A: State Labor Inspectorate complaint or challenge
      const isInspectorChallenge = /(mehnat\s*inspektor(ining)?\s*qaror(i|idan)?|inspektor\s*qaroridan\s*norozi)/i.test(combinedText) ||
                                    (intentInfo?.intent === 'FINE_ISSUER_LABOR_INSPECTOR');
      const isInspectorComplaint = /(mehnat\s*inspeksiyasiga\s*shikoyat|inspeksiyaga\s*shikoyat|mehnat\s*inspeksiyasiga\s*ariza)/i.test(combinedText);

      if (isInspectorChallenge) {
        scenario.disputeType = 'state_labor_inspector_challenge';
        scenario.targetArticleNumbers.push('537');
        scenario.issues.push("Davlat mehnat inspektori qarori ustidan shikoyat qilish");
        scenario.search_terms.push("537-modda", "davlat mehnat inspektorlarining qarorlari ustidan shikoyat", "1176");
      } else if (isInspectorComplaint) {
        scenario.disputeType = 'state_labor_inspector_complaint';
        scenario.targetArticleNumbers.push('535', '537');
        scenario.issues.push("Davlat mehnat inspeksiyasiga shikoyat qilish");
        scenario.search_terms.push("535-modda", "davlat mehnat inspeksiyasi", "mehnat huquqlari buzilishi", "1176");
      }
      // Sub-type B: Collective Labor Dispute / Strike
      else if (/(xodimlar\s*hammamiz|ish\s*tashlamoqchimiz|ish\s*tashlash|jamoaviy\s*nizo|jamoaviy\s*mehnat)/i.test(combinedText)) {
        scenario.disputeType = 'collective_labor_dispute';
        scenario.targetArticleNumbers.push('571', '575');
        scenario.issues.push("Jamoaviy mehnat nizosi va ish tashlash tartibi");
        scenario.search_terms.push("571-modda", "575-modda", "xodimlarning talablar qo'yishi", "ish tashlash");
      }
      // Sub-type C: Individual Labor Dispute - Unpaid Salary
      else if (combinedText.includes('maosh') || combinedText.includes('oylik') || combinedText.includes('oylig') || combinedText.includes('ish haqi') || convState?.active_case?.issue === 'unpaid_salary') {
        scenario.disputeType = 'individual_labor_salary';
        scenario.fineGrainedTopic = scenario.fineGrainedTopic || 'labor_unpaid_wages';
        scenario.targetArticleNumbers.push('253', '333', '244');
        scenario.forbiddenArticleNumbers.push('179', '571', '575', '535');
        scenario.issues.push("Ish haqi to'lanmasligi / kechiktirilishi");
        scenario.search_terms.push("253-modda", "333-modda", "ish haqini to'lash muddatlari", "kechiktirilganlik uchun foiz", "moddiy javobgarlik");
      }
      // Sub-type D: Individual Labor Dispute - Unlawful Termination
      else if (combinedText.includes("bo'shat") || combinedText.includes("hayda") || combinedText.includes("bo'shash") || combinedText.includes("bekor qilish") || combinedText.includes("boshat")) {
        scenario.disputeType = 'individual_labor_termination';
        scenario.targetArticleNumbers.push('161', '163', '160');
        scenario.issues.push("Mehnat shartnomasini bekor qilish / ishdan bo'shatish");
        scenario.search_terms.push("161-modda", "163-modda", "160-modda", "mehnat shartnomasini bekor qilish", "ishga tiklash");
      }
      // Sub-type E: Employee Transfer to Another Job / Position (MK 138, 145)
      else if (combinedText.includes("boshqa ishga") || combinedText.includes("boshqa lavozim") || combinedText.includes("o'tkaz") || combinedText.includes("o‘tkaz") || combinedText.includes("otkaz")) {
        scenario.disputeType = 'labor_transfer';
        scenario.targetArticleNumbers.push('138', '145');
        scenario.forbiddenArticleNumbers.push('116', '179');
        scenario.issues.push("Xodimni boshqa ishga (lavozimga) o‘tkazish qoidalari (MK 138, 145-moddalar)");
        scenario.search_terms.push("138-modda", "145-modda", "boshqa ishga o‘tkazish", "xodimning roziligi", "vaqtincha boshqa ishga o‘tkazish");
      } else {
        scenario.disputeType = 'individual_labor_general';
        scenario.search_terms.push("mehnat qonunchiligi", "xodimning huquqlari");
      }
    }

    // ========================================================
    // PRIORITY 3: CIVIL LAW DISPUTE SUB-CLASSIFICATION (TENANCY, CONTRACT, PROPERTY)
    // ========================================================
    const isCivilGeneral = /(\bijara|\bkvartira|\barenda|\buy\s*egasi|\buy\b|\bmulk|\boldi-sotdi|\bqarz|\bmeros|\bnotarius|\bkadastr|\bgarov|\bpudrat|\bzarar|\bdepozit)/i.test(combinedText);

    if (!scenario.recommended_document_id && isCivilGeneral) {
      scenario.domain = 'civil';
      scenario.recommended_document_id = 'civil_code';

      // Sub-type A.1: Eviction dispute (Uy-joydan majburiy chiqarish - FAQAT SUD ORQALI)
      if (/(chiqarib\s*yubormoqchi|kvartiradan\s*chiqar|uydan\s*hayda|uydan\s*chiqar|uydan\s*chiqarish)/i.test(combinedText) || convState?.active_case?.issue === 'eviction') {
        scenario.disputeType = 'civil_tenancy_eviction';
        scenario.targetArticleNumbers.push('615', '551');
        scenario.forbiddenArticleNumbers.push('116', '138', '179');
        scenario.issues.push("Turar joydan chiqarish faqat sud qarori va MIB ijrosi orqali amalga oshirilishi");
        scenario.search_terms.push("615-modda", "uydan chiqarish faqat sud orqali", "turar joy daxlsizligi");
      }
      // Sub-type A.2: Contract Termination / Cancellation (FK 615, 551, 382)
      else if (/(bekor\s*qilish|ijara.*bekor|shartnomadan\s*chiqish|shartnomani\s*to['‘`]?xtatish|muddatidan\s*oldin|chiqmoqchiman|chiqib\s*ketmoqchiman|chiqib\s*ketish)/i.test(combinedText) || scenario.fineGrainedTopic === 'tenancy_cancellation') {
        scenario.disputeType = 'tenancy_cancellation';
        scenario.fineGrainedTopic = 'tenancy_cancellation';
        scenario.targetArticleNumbers.push('615', '551', '382');
        scenario.forbiddenArticleNumbers.push('116', '138', '179', '535');
        scenario.issues.push("Ijara shartnomasini muddatidan oldin bekor qilish tartibi va shartlari (FK 615, 551-moddalar)");
        scenario.search_terms.push("615-modda", "551-modda", "382-modda", "ijara shartnomasini bekor qilish", "ogohlantirish xati");
      }
      // Sub-type B: Security deposit return
      else if (combinedText.includes('depozit') || combinedText.includes('zalog') || combinedText.includes('garov') || convState?.active_case?.issue === 'deposit_return' || intentInfo?.intent === 'TENANCY_DEPOSIT_CONFIRMED') {
        scenario.disputeType = 'civil_tenancy_deposit';
        scenario.targetArticleNumbers.push('544', '382', '236');
        scenario.issues.push("Ijara depozitini qaytarish majburiyati (FK 236, 382, 544-moddalar)");
        scenario.search_terms.push("544-modda", "382-modda", "236-modda", "ijara haqini to'lash va depozitni qaytarish", "majburiyatlarni lozim darajada bajarish");
      }
      // Sub-type C: Loan & Debt recovery (FK 732, 733, 735)
      else if (combinedText.includes('qarz') || combinedText.includes('qarzdor')) {
        scenario.disputeType = 'civil_debt_loan';
        scenario.targetArticleNumbers.push('732', '733', '735');
        scenario.forbiddenArticleNumbers.push('535');
        scenario.issues.push("Qarz shartnomasi va qarzni qaytarish (FK 732, 735-moddalar)");
        scenario.search_terms.push("732-modda", "735-modda", "qarz shartnomasi", "qarzni qaytarish majburiyati");
      } else {
        scenario.disputeType = 'civil_general';
        scenario.targetArticleNumbers.push('535', '544');
        scenario.search_terms.push("535-modda", "mulk ijarasi shartnomasi");
      }
    }

    // ========================================================
    // PRIORITY 4: ADMINISTRATIVE & CITIZEN APPEALS
    // ========================================================
    const isAdministrativeGeneral = /(\bjarima\b|\bradar\b|\bprava\b|\byo['‘`]?l harakati\b|\bgai\b|\byhx\b|\bqoidabuzarlik\b|\bma['‘`]?muriy\b|\bdavlat organiga shikoyat\b|\bhokimiyat qarori\b)/i.test(combinedText);

    if (!scenario.recommended_document_id && isAdministrativeGeneral) {
      scenario.domain = 'administrative';
      scenario.recommended_document_id = 'administrative_code';

      if (latin.includes('davlat organiga shikoyat')) {
        scenario.disputeType = 'government_authority_complaint';
        scenario.issues.push("Davlat organiga yoki mansabdor shaxs qarori ustidan shikoyat qilish");
        scenario.search_terms.push("davlat organiga murojaat", "shikoyat qilish tartibi", "ma'muriy tartib-taomillar");
      } else {
        scenario.disputeType = 'administrative_fine_dispute';
        scenario.targetArticleNumbers.push('314', '315', '316', '317');
        scenario.issues.push("Ma'muriy jarima qarori ustidan shikoyat berish (MJtK 314-317-moddalar)");
        scenario.search_terms.push("314-modda", "315-modda", "316-modda", "ma'muriy huquqbuzarlik to'g'risidagi ish bo'yicha qaror ustidan shikoyat berish", "10 kunlik muddat", "ma'muriy sud");
      }
    }

    // ========================================================
    // PRIORITY 5: CONSTITUTION
    // ========================================================
    const isConstitutionGeneral = /(\bkonstitutsiya\b|\binson huquq\b|\bso['‘`]?z erkinligi\b|\bshaxsiy daxlsizlik\b|\bfuqarolik\b|\bdavlat tili\b)/i.test(combinedText);

    if (!scenario.recommended_document_id && isConstitutionGeneral) {
      scenario.domain = 'constitution';
      scenario.recommended_document_id = 'constitution';
      if (intentInfo?.articleNumber === '56' || latin.includes('56')) {
        scenario.targetArticleNumbers.push('56');
        scenario.issues.push("Inson huquqlari bo'yicha milliy institutlar / jamoat birlashmalari");
        scenario.search_terms.push("56-modda", "inson huquqlari bo'yicha milliy institutlar");
      }
    }

    // Fallback search mode resolution
    let finalDocumentId = null;
    let effectiveSearchMode = 'auto';

    if (selectedLawGroup && LAW_GROUP_MAP[selectedLawGroup] !== undefined) {
      const mapped = LAW_GROUP_MAP[selectedLawGroup];
      if (mapped) {
        finalDocumentId = mapped;
        effectiveSearchMode = 'selected_law';
      } else {
        effectiveSearchMode = 'auto';
        finalDocumentId = scenario.recommended_document_id;
      }
    } else {
      effectiveSearchMode = 'auto';
      finalDocumentId = scenario.recommended_document_id;
    }

    // Extract User Role (Section 1 & Section 2)
    let userRole = 'citizen';
    if (/(men\s*ish\s*beruvchiman|ish\s*beruvchi\s*sifatida|rahbarman|direktorman|xodimim|ishchim|xodimlarimga)/i.test(combinedText)) {
      userRole = 'employer';
    } else if (/(ishchi|xodim|oylik\s*oluvchi|ishlaganman|ishlayman|oyligim|ish\s*haqim|meni\s*ishdan|roziligimsiz|ish\s*beruvchi\s*(?:meni\s*)?(?:oylik|ish\s*haqi|boshqa|ishdan|to['‘`]?lamay|bermay))/i.test(combinedText)) {
      userRole = 'employee';
    } else if (/(men\s*ijaraga\s*beruvchiman|uy\s*egasi\s*sifatida|ijarachim|ijarachilarim|uyimni\s*ijaraga\s*bergan)/i.test(combinedText)) {
      userRole = 'landlord';
    } else if (/(ijarachi|arendator|kvartirant|ijaraga\s*olgan|ijarada\s*turaman|uy\s*egasi\s*(?:depozit|chiqar|qaytar|ijara)|depozitim)/i.test(combinedText)) {
      userRole = 'tenant';
    } else if (/(qarzdor\s*(?:pulimni|qaytarmayapti|bermayapti)|qarz\s*beruvchi|qarz\s*berganman|bergan\s*qarz)/i.test(combinedText)) {
      userRole = 'creditor';
    } else if (/(qarzdorman|qarzimni\s*(?:to['‘`]?lolmay|to['‘`]?lashim)|mendan\s*qarz\s*talab)/i.test(combinedText)) {
      userRole = 'debtor';
    } else if (/(iste['‘`]?molchi|xaridor|sotib\s*oldim|mijoz)/i.test(combinedText)) {
      userRole = 'consumer';
    } else if (/(haydovchi|mashina\s*haydovchi|yhxx|radar|prava)/i.test(combinedText)) {
      userRole = 'driver';
    }

    // Extract Legal Action (Section 19)
    let legalAction = 'information_request';
    if (/(sudga\s*berish|da['‘`]?vo\s*arizasi|sudga\s*murojaat)/i.test(combinedText)) legalAction = 'lawsuit';
    else if (/(shikoyat|ariza\s*yozish|ustidan\s*ariza|ariza\s*berish)/i.test(combinedText)) legalAction = 'complaint';
    else if (/(qaroridan\s*norozi|e['‘`]?tiroz|apellyatsiya)/i.test(combinedText)) legalAction = 'appeal';
    else if (/(kompensatsiya|zararni\s*qoplash|jarima\s*undirish)/i.test(combinedText)) legalAction = 'compensation';
    else if (/(undirib\s*olish|qaytarib\s*olish|depozitni\s*qaytar)/i.test(combinedText)) legalAction = 'recovery';
    else if (/(shartnomani\s*bekor\s*qilish|ishdan\s*bo['‘`]?shatish)/i.test(combinedText)) legalAction = 'termination';

    // Extract Event Date & Historical Status (Section 9, 11)
    const yearMatch = combinedText.match(/\b(19\d\d|20[0-2]\d)\b/);
    const eventDate = yearMatch ? yearMatch[1] : null;
    const isHistorical = eventDate ? parseInt(eventDate, 10) < 2023 : false;

    // Generate Multi-Query search formulations (Section 13)
    const multiQueries = this.generateMultiQueries(rawMessage, intentInfo, {
      ...scenario,
      disputeType: scenario.disputeType,
      domain: scenario.domain
    });

    return {
      cleanQuery: resolvedQuery,
      normalizedLatin: latin,
      domain: scenario.domain,
      primaryDomain: scenario.domain,
      fineGrainedTopic: scenario.fineGrainedTopic,
      disputeType: scenario.disputeType,
      taskType: scenario.taskType,
      issues: scenario.issues,
      facts: scenario.facts,
      knownFacts: scenario.knownFacts,
      missingCriticalFacts: scenario.missingCriticalFacts,
      isConditionalReasoningRequired: scenario.isConditionalReasoningRequired,
      allowedDocumentIds: scenario.allowedDocumentIds,
      disallowedDocumentIds: scenario.disallowedDocumentIds,
      forbiddenArticleNumbers: scenario.forbiddenArticleNumbers,
      jurisdictionRule: scenario.jurisdictionRule,
      proceduralRoute: scenario.proceduralRoute,
      userRole,
      legalAction,
      eventDate,
      isHistorical,
      multiQueries,
      isTopicSwitch: convState.isTopicSwitch,
      searchMode: effectiveSearchMode,
      targetDocumentId: finalDocumentId,
      recommendedDocumentId: scenario.recommended_document_id,
      exactArticleNumber: scenario.exactArticleNumber,
      targetArticleNumbers: scenario.targetArticleNumbers,
      searchTerms: scenario.search_terms.length > 0 ? scenario.search_terms : [resolvedQuery],
      needsClarification: false
    };
  }

  /**
   * Rewrites user query into a targeted, noise-free legal retrieval query.
   * Strictly isolates to the relevant legal code and exact target articles.
   */
  rewriteQuery(rawMessage, intentInfo = {}, scenario = {}) {
    if (!rawMessage || typeof rawMessage !== 'string') return '';
    const clean = rawMessage.trim();
    const latin = cyrillicToLatin(normalizeSearchText(clean)).toLowerCase();

    // 1. If explicit article requested
    if (intentInfo?.intent === 'SPECIFIC_ARTICLE' && intentInfo.articleNumber) {
      const artNum = intentInfo.articleNumber;
      const docId = intentInfo.specifiedDoc || scenario?.targetDocumentId;
      let docName = 'O‘zbekiston Respublikasi Qonunchiligi';
      if (docId === 'constitution') docName = 'Oʻzbekiston Respublikasi Konstitutsiyasi';
      else if (docId === 'criminal_code') docName = 'Oʻzbekiston Respublikasining Jinoyat kodeksi';
      else if (docId === 'labor_code') docName = 'Oʻzbekiston Respublikasining Mehnat kodeksi';
      else if (docId === 'civil_code') docName = 'Oʻzbekiston Respublikasining Fuqarolik kodeksi';
      else if (docId === 'administrative_code') docName = 'Oʻzbekiston Respublikasining Maʼmuriy javobgarlik toʻgʻrisidagi kodeksi';

      return `${docName} ${artNum}-modda`;
    }

    // 2. Bribery / Corruption (CRIMINAL CODE)
    if (scenario?.disputeType === 'corruption_bribery') {
      if (latin.includes("so'rayapti") || latin.includes("sorayapti") || latin.includes("olish")) {
        return "Oʻzbekiston Respublikasining Jinoyat kodeksi 210-modda pora olish mansabdor shaxs javobgarligi";
      }
      if (latin.includes("berish")) {
        return "Oʻzbekiston Respublikasining Jinoyat kodeksi 211-modda pora berish jinoiy javobgarlik";
      }
      return "Oʻzbekiston Respublikasining Jinoyat kodeksi 210-modda 211-modda pora olish pora berish";
    }

    if (scenario?.disputeType === 'criminal_forgery') {
      return "Oʻzbekiston Respublikasining Jinoyat kodeksi 228-modda Hujjatlar, shtamplar, muhrlar, blankalar tayyorlash, ularni qalbakilashtirish, sotish yoki ulardan foydalanish";
    }

    // 3. Labor Inspector Challenge or Complaint
    if (scenario?.disputeType === 'state_labor_inspector_challenge') {
      return "Oʻzbekiston Respublikasining Mehnat kodeksi 537-modda Davlat mehnat inspektorlarining qarorlari ustidan shikoyat qilish";
    }
    if (scenario?.disputeType === 'state_labor_inspector_complaint') {
      return "Oʻzbekiston Respublikasining Mehnat kodeksi 535-modda 537-modda Davlat mehnat inspeksiyasi";
    }

    // 4. Collective Labor Dispute / Strike
    if (scenario?.disputeType === 'collective_labor_dispute') {
      return "Oʻzbekiston Respublikasining Mehnat kodeksi 571-modda 575-modda xodimlarning talablar qo'yishi jamoaviy mehnat nizosi";
    }

    // 5. Individual Labor Dispute - Salary or Dismissal
    if (scenario?.disputeType === 'individual_labor_salary') {
      return "Oʻzbekiston Respublikasining Mehnat kodeksi 253-modda ish haqini toʻlash muddatlari va kechiktirilganlik uchun javobgarlik";
    }
    if (scenario?.disputeType === 'individual_labor_termination') {
      return "Oʻzbekiston Respublikasining Mehnat kodeksi 161-modda 163-modda 160-modda mehnat shartnomasini bekor qilish noqonuniy bo'shatish ishga tiklash";
    }

    // Fine-Grained Labor Topics
    if (scenario?.fineGrainedTopic === 'labor_transfer' || scenario?.disputeType === 'labor_transfer') {
      return "Oʻzbekiston Respublikasining Mehnat kodeksi 137-modda 138-modda xodimni boshqa ishga o‘tkazish xodim roziligi";
    }
    if (scenario?.fineGrainedTopic === 'labor_additional_work' || scenario?.disputeType === 'labor_additional_work') {
      return "Oʻzbekiston Respublikasining Mehnat kodeksi 116-modda bir necha kasbda lavozimda ishlash qo‘shimcha vazifa";
    }
    if (scenario?.fineGrainedTopic === 'labor_health_transfer' || scenario?.disputeType === 'labor_health_transfer') {
      return "Oʻzbekiston Respublikasining Mehnat kodeksi 143-modda 284-modda salomatligi holatiga ko‘ra yengilroq ishga o‘tkazish";
    }
    if (scenario?.fineGrainedTopic === 'labor_contract_modification' || scenario?.disputeType === 'labor_contract_modification') {
      return "Oʻzbekiston Respublikasining Mehnat kodeksi 133-modda 134-modda mehnat shartnomasi shartlarini o‘zgartirish";
    }
    if (scenario?.fineGrainedTopic === 'labor_commission_challenge' || scenario?.disputeType === 'labor_commission_challenge') {
      return "Oʻzbekiston Respublikasining Mehnat kodeksi 556-modda yakka tartibdagi mehnat nizosini koʻrib chiqishni sudga oʻtkazish va mehnat nizolari boʻyicha komissiya qarori ustidan shikoyat qilish oʻn kunlik muddat fuqarolik sudi";
    }

    // Fine-Grained Administrative Topics
    if (scenario?.fineGrainedTopic === 'admin_fine' || scenario?.fineGrainedTopic === 'admin_appeal' || scenario?.disputeType === 'admin_fine' || scenario?.disputeType === 'admin_appeal' || scenario?.disputeType === 'administrative_fine_dispute') {
      return "Oʻzbekiston Respublikasining Maʼmuriy javobgarlik toʻgʻrisidagi kodeksi 314-modda 315-modda 316-modda ma’muriy ish bo‘yicha qaror ustidan shikoyat 10 kun ma’muriy sud";
    }

    // Fine-Grained Bribery Topics
    if (scenario?.fineGrainedTopic === 'bribery_classification' || scenario?.disputeType === 'bribery_classification') {
      return "Oʻzbekiston Respublikasining Jinoyat kodeksi 15-modda jinoyatlarning tasnifi 210-modda 211-modda 212-modda sanksiyalari";
    }
    if (scenario?.fineGrainedTopic === 'bribery_receiving' || scenario?.disputeType === 'bribery_receiving') {
      return "Oʻzbekiston Respublikasining Jinoyat kodeksi 210-modda pora olish sanksiya javobgarlik";
    }
    if (scenario?.fineGrainedTopic === 'bribery_giving' || scenario?.disputeType === 'bribery_giving') {
      return "Oʻzbekiston Respublikasining Jinoyat kodeksi 211-modda pora berish sanksiya javobgarlik";
    }
    if (scenario?.fineGrainedTopic === 'bribery_mediation' || scenario?.disputeType === 'bribery_mediation') {
      return "Oʻzbekiston Respublikasining Jinoyat kodeksi 212-modda pora olish berishda vositachilik qilish sanksiya";
    }
    if (scenario?.fineGrainedTopic === 'bribery_extortion_exemption' || scenario?.disputeType === 'bribery_extortion_exemption') {
      return "Oʻzbekiston Respublikasining Jinoyat kodeksi 210-modda 211-modda pora olish pora berish 30 sutka ichida ixtiyoriy xabar javobgarlikdan ozod qilish";
    }

    // 6. Tenancy Disputes - Eviction or Deposit
    if (scenario?.disputeType === 'civil_tenancy_eviction' || scenario?.fineGrainedTopic === 'tenancy_eviction') {
      return "Oʻzbekiston Respublikasining Fuqarolik kodeksi 615-modda 551-modda ijara shartnomasini bekor qilish sud orqali";
    }
    if (scenario?.disputeType === 'civil_tenancy_deposit' || scenario?.fineGrainedTopic === 'tenancy_deposit') {
      return "Oʻzbekiston Respublikasining Fuqarolik kodeksi 544-modda 382-modda 236-modda mulk ijarasi majburiyatlari depozit";
    }

    // Clean conversational filler words
    const stripped = clean
      .replace(/\b(nima\s*haqida|tushunmayapman|tushuntirib\s*bering|aytib\s*bering|bilmoqchi\s*edim|iltimos|yordam\s*bering|maslahat\s*bering|qanday\s*qilsam\s*bo['‘`]?ladi|qanaqa\s*bo['‘`]?ladi)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    return stripped || clean;
  }

  /**
   * Generates multiple diverse legal search formulations without inventing facts (Section 13).
   */
  generateMultiQueries(rawMessage, intentInfo = {}, scenario = {}) {
    const queries = [];
    const clean = (rawMessage || '').trim();
    const latin = cyrillicToLatin(normalizeSearchText(clean)).toLowerCase();

    if (scenario.disputeType === 'individual_labor_salary') {
      queries.push("ish haqini toʻlash muddatlari 253-modda");
      queries.push("ish haqi kechiktirilganda moddiy javobgarlik 333-modda");
      queries.push("mehnat shartnomasi boʻyicha maosh toʻlash");
      queries.push("davlat mehnat inspeksiyasiga shikoyat qilish");
    } else if (scenario.disputeType === 'civil_tenancy_deposit') {
      queries.push("ijara depozitini qaytarish 544-modda");
      queries.push("ijara shartnomasi boʻyicha pulni qaytarish 382-modda");
      queries.push("ijaraga beruvchining majburiyatlari 535-modda");
      queries.push("ijara shartnomasini bekor qilish va hisob-kitob");
    } else if (scenario.disputeType === 'civil_tenancy_eviction') {
      queries.push("turar joy ijarasi shartnomasini bekor qilish 615-modda");
      queries.push("ijarachini uydan chiqarish faqat sud orqali");
      queries.push("ijara shartnomasini muddatidan oldin bekor qilish 551-modda");
    } else if (scenario.disputeType === 'corruption_bribery') {
      queries.push("pora olish jinoiy javobgarlik 210-modda");
      queries.push("pora berish 211-modda");
      queries.push("korrupsiya holatlari haqida xabar berish 1253");
    } else if (scenario.disputeType === 'criminal_forgery') {
      queries.push("hujjatlarni qalbakilashtirish 228-modda");
      queries.push("soxta hujjatdan foydalanish jinoiy javobgarlik");
      queries.push("228-modda jazo choralari");
    } else if (scenario.disputeType === 'state_labor_inspector_challenge') {
      queries.push("davlat mehnat inspektorlarining qarorlari ustidan shikoyat 537-modda");
      queries.push("mehnat inspeksiyasi qaroriga eʼtiroz bildirish");
    }

    return queries;
  }
}

export const queryUnderstandingService = new QueryUnderstandingService();
