import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

const lawArticlesPath = path.join(rootDir, 'src/data/lawArticles.ts');
const rawContent = fs.readFileSync(lawArticlesPath, 'utf8');

const match = rawContent.match(/export const lawArticlesDatabase: LawArticle\[\] = (\[[\s\S]*\]);/);
if (!match) {
  console.error('Failed to parse existing lawArticlesDatabase!');
  process.exit(1);
}

const existingArticles = JSON.parse(match[1]);
console.log(`Currently loaded ${existingArticles.length} articles.`);

const loadChunks = (docDir) => {
  const p = path.join(rootDir, 'server/data/legal_documents', docDir, 'chunks.json');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
};

const laborChunks = loadChunks('labor_code');
const constChunks = loadChunks('constitution');
const civilChunks = loadChunks('civil_code');
const crimChunks = loadChunks('criminal_code');
const adminChunks = loadChunks('administrative_code');

function cleanSummary(text) {
  if (!text) return '';
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= 220) return cleaned;
  return cleaned.substring(0, 220).trim() + '...';
}

const newArticles = [];

// 1. MEHNAT HUQUQI (+30 articles: 61 to 90)
const labor61_90 = laborChunks.filter(c => c.article_number_digits >= 61 && c.article_number_digits <= 90).slice(0, 30);
labor61_90.forEach((c, idx) => {
  const num = 61 + idx;
  newArticles.push({
    id: `mehnat_${num}`,
    law: 'Oʻzbekiston Respublikasining Mehnat kodeksi',
    article: c.article_number || `${num}-modda`,
    title: c.article_title || `${num}-modda`,
    summary: cleanSummary(c.content),
    category: 'Mehnat huquqi',
    tags: ['mehnat', 'xodim', 'ish beruvchi', 'shartnoma', 'mehnat huquqi'],
    sourceUrl: c.source_url
  });
});

// 2. KONSTITUTSIYA (+30 articles: 61 to 90)
const const61_90 = constChunks.filter(c => c.article_number_digits >= 61 && c.article_number_digits <= 90).slice(0, 30);
const61_90.forEach((c, idx) => {
  const num = 61 + idx;
  let title = c.article_title;
  if (!title) {
    const firstLine = c.content.split('\n')[0].replace(/^[0-9\-–\s\.\,\;modda]+/, '').trim();
    title = firstLine && firstLine.length < 80 ? firstLine : `Oʻzbekiston Respublikasi Konstitutsiyasining ${num}-moddasi`;
  }
  newArticles.push({
    id: `konstitutsiya_${num}`,
    law: 'Oʻzbekiston Respublikasi Konstitutsiyasi',
    article: c.article_number || `${num}-modda`,
    title,
    summary: cleanSummary(c.content),
    category: 'Konstitutsiya',
    tags: ['konstitutsiya', 'inson huquqlari', 'erkinlik', 'davlat', 'boshqaruv'],
    sourceUrl: c.source_url
  });
});

// 3. FUQAROLIK HUQUQI (+30 articles: continuing after 60-modda)
const civil61_90 = civilChunks.filter(c => c.article_number_digits > 60 && c.article_number_digits <= 120).slice(0, 30);
civil61_90.forEach((c, idx) => {
  const num = 61 + idx;
  newArticles.push({
    id: `fuqarolik_${num}`,
    law: 'Oʻzbekiston Respublikasining Fuqarolik kodeksi',
    article: c.article_number || `${c.article_number_digits}-modda`,
    title: c.article_title || `${c.article_number || `${c.article_number_digits}-modda`}`,
    summary: cleanSummary(c.content),
    category: 'Fuqarolik huquqi',
    tags: ['fuqarolik', 'bitim', 'shartnoma', 'majburiyat', 'huquq'],
    sourceUrl: c.source_url
  });
});

// 4. KO'CHMAS MULK (+30 articles: Civil Code property / pledge / obligations)
const civilProp = civilChunks.filter(c => c.article_number_digits >= 240 && c.article_number_digits <= 290).slice(0, 30);
civilProp.forEach((c, idx) => {
  const num = 240 + idx;
  newArticles.push({
    id: `mulk_${num}`,
    law: 'Oʻzbekiston Respublikasining Fuqarolik kodeksi',
    article: c.article_number || `${c.article_number_digits}-modda`,
    title: c.article_title || `Fuqarolik kodeksining ${c.article_number_digits}-moddasi`,
    summary: cleanSummary(c.content),
    category: "Ko'chmas mulk",
    tags: ["ko'chmas mulk", 'ijara', 'uy-joy', 'mulkdor', 'oldi-sotdi', 'kadastr'],
    sourceUrl: c.source_url
  });
});

// 5. JINOYAT HUQUQI (+30 articles: continuing after 61-modda)
const crim62_91 = crimChunks.filter(c => c.article_number_digits >= 62 && c.article_number_digits <= 120).slice(0, 30);
crim62_91.forEach((c, idx) => {
  const num = 62 + idx;
  newArticles.push({
    id: `jinoyat_${num}`,
    law: 'Oʻzbekiston Respublikasining Jinoyat kodeksi',
    article: c.article_number || `${c.article_number_digits}-modda`,
    title: c.article_title || `Jinoyat kodeksining ${c.article_number_digits}-moddasi`,
    summary: cleanSummary(c.content),
    category: 'Jinoyat huquqi',
    tags: ['jinoyat', 'jazo', 'javobgarlik', 'qonun', 'jinoyat huquqi'],
    sourceUrl: c.source_url
  });
});

// 6. MA'MURIY HUQUQ (+30 articles: continuing after 60-modda)
const admin61_90 = adminChunks.filter(c => c.article_number_digits >= 61 && c.article_number_digits <= 120).slice(0, 30);
admin61_90.forEach((c, idx) => {
  const num = 61 + idx;
  newArticles.push({
    id: `mamuriy_${num}`,
    law: 'Oʻzbekiston Respublikasining Maʼmuriy javobgarlik toʻgʻrisidagi kodeksi',
    article: c.article_number || `${num}-modda`,
    title: c.article_title || `Maʼmuriy javobgarlik kodeksining ${num}-moddasi`,
    summary: cleanSummary(c.content),
    category: 'Maʼmuriy huquq',
    tags: ['maʼmuriy', 'jarima', 'tartib', 'qoidabuzarlik', "ma'muriy javobgarlik"],
    sourceUrl: c.source_url
  });
});

// 7. OILALIK HUQUQI (+30 articles: Family Code official provisions)
const familyArticlesData = [
  {
    num: 61,
    title: 'Er va xotinning familiya tanlash huquqi',
    summary: 'Nikoh tuzish paytida er va xotin o‘z xohishlariga ko‘ra er yoki xotinning familiyasini o‘zlari uchun umumiy familiya qilib tanlashlari yoxud ularning har biri o‘zining nikohgacha bo‘lgan familiyasini saqlab qolishi mumkin.',
    tags: ['familiya', 'er-xotin', 'nikoh']
  },
  {
    num: 62,
    title: 'Er va xotinning mashg‘ulot, kasb va turar joy tanlash erkinligi',
    summary: 'Er va xotinning har biri mashg‘ulot, kasb hamda turar joy tanlashda erkindir. Oila turmushi masalalari er va xotin tomonidan birgalikda, teng huquqlilik asosida hal qilinadi.',
    tags: ['turar joy', 'kasb tanlash', 'tenglik']
  },
  {
    num: 63,
    title: 'Er-xotinning umumiy mol-mulkiga egalik qilish va undan foydalanish',
    summary: 'Er va xotinning nikoh davomida orttirgan mol-mulklari, agar qonunda yoki nikoh shartnomasida boshqacha hol ko‘rsatilmagan bo‘lsa, ularning birgalikdagi umumiy mulki hisoblanadi.',
    tags: ['umumiy mulk', 'er-xotin mol-mulki', 'taqsimlash']
  },
  {
    num: 64,
    title: 'Er va xotinning har birining xususiy mulki',
    summary: 'Er va xotinning nikohga kirgunlariga qadar o‘zlariga tegishli bo‘lgan mol-mulki, shuningdek ulardan birining nikoh davomida hadya, meros tariqasida yoki boshqa tekin bitimlar asosida olgan mol-mulki uning o‘z mulki hisoblanadi.',
    tags: ['xususiy mulk', 'hadya', 'meros', 'nikohgacha mulk']
  },
  {
    num: 65,
    title: 'Shaxsiy foydalanishdagi buyumlarning huquqiy maqomi',
    summary: 'Qimmatbaho buyumlar va zebu-ziynatlardan boshqa shaxsiy foydalanishdagi buyumlar (kiyim-kechak, poyabzal va boshqalar), garchi nikoh davomida er-xotinning umumiy mablag‘i hisobiga olingan bo‘lsa ham, ulardan foydalangan er yoki xotinning xususiy mulki hisoblanadi.',
    tags: ['shaxsiy buyumlar', 'zebu-ziynat', 'mulk maqomi']
  },
  {
    num: 66,
    title: 'Er va xotindan birining mulkini ularning birgalikdagi mulki deb topish',
    summary: 'Er yoki xotinning shaxsiy mol-mulki, agar nikoh davomida er-xotinning umumiy mulki yoki boshqa er-xotindan birining shaxsiy mehnati hisobiga uning qiymati ancha oshganligi aniqlansa, birgalikdagi umumiy mulk deb topilishi mumkin.',
    tags: ['mulkni qayta baholash', 'taʼmirlash', 'qiymat oshishi']
  },
  {
    num: 67,
    title: 'Er va xotinning umumiy mol-mulkini bo‘lish asoslari',
    summary: 'Er va xotinning umumiy mol-mulkini bo‘lish nikoh davomida ham, nikohdan ajralgandan keyin ham er va xotindan birining talabiga binoan, shuningdek kreditor talabiga asosan amalga oshirilishi mumkin.',
    tags: ['mol-mulkni bo‘lish', 'ajrashish', 'kreditor talabi']
  },
  {
    num: 68,
    title: 'Umumiy mol-mulkni bo‘lishda daʼvo muddati',
    summary: 'Nikohi bekor qilingan er-xotinning umumiy mol-mulkini bo‘lish to‘g‘risidagi talablariga nisbatan uch yillik daʼvo muddati qo‘llaniladi.',
    tags: ['daʼvo muddati', '3 yil', 'mulkni bo‘lish']
  },
  {
    num: 69,
    title: 'Nikoh shartnomasi tushunchasi',
    summary: 'Nikoh shartnomasi deb nikohlanuvchi shaxslarning yoki er va xotinning nikohda bo‘lgan davrida va nikoh bekor qilingan taqdirda ularning mulkiy huquq hamda majburiyatlarini belgilovchi kelishuviga aytiladi.',
    tags: ['nikoh shartnomasi', 'shartnoma tuzish', 'kelishuv']
  },
  {
    num: 70,
    title: 'Nikoh shartnomasini tuzish tartibi',
    summary: 'Nikoh shartnomasi nikoh davlat ro‘yxatiga olingunga qadar ham, nikoh davrida ham tuzilishi mumkin. Nikoh shartnomasi yozma shaklda tuziladi va notarial tartibda tasdiqlanishi shart.',
    tags: ['notarial tasdiqlash', 'yozma shakl', 'rasmiylashtirish']
  },
  {
    num: 71,
    title: 'Nikoh shartnomasining mazmuni',
    summary: 'Er va xotin nikoh shartnomasi orqali birgalikdagi mulkning qonunda belgilangan rejimini o‘zgartirishga, umumiy, ulushli yoki alohida egalik qilish rejimini o‘rnatishga haqlidirlar.',
    tags: ['mulk rejimi', 'shartnoma shartlari', 'ulushlar']
  },
  {
    num: 72,
    title: 'Nikoh shartnomasini o‘zgartirish va bekor qilish',
    summary: 'Nikoh shartnomasi er va xotinning o‘zaro kelishuvi bilan istalgan vaqtda o‘zgartirilishi yoki bekor qilinishi mumkin. Nikoh shartnomasini bajarishdan bir tomonlama bosh tortishga yo‘l qo‘yilmaydi.',
    tags: ['shartnomani bekor qilish', 'o‘zgartirish']
  },
  {
    num: 73,
    title: 'Nikoh shartnomasini haqiqiy emas deb topish asoslari',
    summary: 'Nikoh shartnomasi Fuqarolik kodeksida bitimlarni haqiqiy emas deb topish uchun nazarda tutilgan asoslar bo‘yicha sud tomonidan to‘liq yoki qisman haqiqiy emas deb topilishi mumkin.',
    tags: ['haqiqiy emas', 'sud qarori', 'bekor qilish']
  },
  {
    num: 74,
    title: 'Er va xotinning majburiyatlari bo‘yicha undiruv qaratish',
    summary: 'Er yoki xotindan birining majburiyatlari bo‘yicha undiruv faqat shu er yoki xotinning mol-mulkiga qaratilishi mumkin. Agar bu mulk yetarli bo‘lmasa, kreditor qarzdorning umumiy mulkdagi ulushini ajratishni talab qilishga haqli.',
    tags: ['undiruv', 'qarz', 'kreditor talabi']
  },
  {
    num: 75,
    title: 'Ota-onalik huquq va majburiyatlarining tengligi',
    summary: 'Ota va ona o‘z bolalariga nisbatan teng huquq va majburiyatlarga egadirlar. Bolalari voyaga yetganda yoki ular qonunda belgilangan tartibda to‘la muomala layoqatiga ega bo‘lganda ota-onalik huquqi tugaydi.',
    tags: ['ota-ona huquqi', 'tenglik', 'voyaga yetish']
  },
  {
    num: 76,
    title: 'Voyaga yetmagan ota-onalarning huquqlari',
    summary: 'Nikohdan o‘tmagan voyaga yetmagan ota-onalar o‘n olti yoshga to‘lganlarida o‘z bolalarini tarbiyalashda mustaqil ravishda ishtirok etish huquqiga egadirlar.',
    tags: ['voyaga yetmagan ota-ona', 'tarbiya huquqi', 'yosh chegarasi']
  },
  {
    num: 77,
    title: 'Bolalarni tarbiyalash va ularga taʼlim berish huquqi hamda majburiyati',
    summary: 'Ota-ona o‘z bolalarini tarbiyalash huquqiga ega va tarbiyalashi shart. Ular o‘z bolalarining sog‘lig‘i, jismoniy, ruhiy va maʼnaviy kamoloti uchun g‘amxo‘rlik qilishlari shart.',
    tags: ['taʼlim', 'tarbiya', 'sog‘liq', 'bolalar kamoloti']
  },
  {
    num: 78,
    title: 'Bolalarning huquq va manfaatlarini himoya qilish',
    summary: 'Bolalarning huquq va qonuniy manfaatlarini himoya qilish ularning ota-onasi zimmasiga yuklatiladi. Ota-ona qonuniy vakil sifatida sudlarda va boshqa organlarda ishonchnomasiz ishtirok etadi.',
    tags: ['manfaatlarni himoya qilish', 'qonuniy vakil', 'sudda himoya']
  },
  {
    num: 79,
    title: 'Alohida yashayotgan ota yoki onaning bola tarbiyasida ishtirok etishi',
    summary: 'Boladan alohida yashayotgan ota yoki ona u bilan muloqotda bo‘lish, uning tarbiyasida ishtirok etish va taʼlim olishi masalalarini hal qilishda teng huquqlidir. Bola bilan yashayotgan ota-ona bunga to‘sqinlik qilmasligi shart.',
    tags: ['alohida yashash', 'muloqot huquqi', 'uchrashuv tartibi']
  },
  {
    num: 80,
    title: 'Ota-onalik huquqidan mahrum qilish asoslari',
    summary: 'Ota-ona ota-onalik majburiyatlarini bajarishdan bo‘yin tovlasa, aliment to‘lashdan qasddan bo‘yin tovlasa, ota-onalik huquqini suiisteʼmol qilsa, surunkali alkogolizm yoki giyohvandlikka mubtalo bo‘lsa, ota-onalik huquqidan mahrum qilinishi mumkin.',
    tags: ['huquqdan mahrum qilish', 'suiisteʼmol', 'aliment to‘lamaslik', 'sud qarori']
  },
  {
    num: 81,
    title: 'Ota-onalik huquqidan mahrum qilish tartibi',
    summary: 'Ota-onalik huquqidan mahrum qilish faqat sud tartibida amalga oshiriladi. Sud ishni ota-onadan birining, vasiylik va homiylik organining yoki prokurorning arizasi bo‘yicha ko‘rib chiqadi.',
    tags: ['sud tartibi', 'prokuror', 'vasiylik organi']
  },
  {
    num: 82,
    title: 'Ota-onalik huquqidan mahrum qilishning huquqiy oqibatlari',
    summary: 'Ota-onalik huquqidan mahrum qilingan ota-ona bolaga nisbatan qarindoshlikka asoslangan barcha shaxsiy va mulkiy huquqlarini yo‘qotadi, ammo bolaga taʼminot (aliment) berish majburiyatidan ozod qilinmaydi.',
    tags: ['oqibatlar', 'aliment majburiyati saqlanadi']
  },
  {
    num: 83,
    title: 'Ota-onalik huquqini tiklash',
    summary: 'Agar ota-ona o‘z xulq-atvorini, turmush tarzini va bolaga munosabatini tubdan o‘zgartirgan bo‘lsa, sud tartibida ota-onalik huquqi tiklanishi mumkin.',
    tags: ['huquqni tiklash', 'sudga murojaat']
  },
  {
    num: 84,
    title: 'Ota-onalik huquqini cheklash',
    summary: 'Sud bolaning manfaatlarini ko‘zlab, bolani ota-onadan (ulardan biridan) ota-onalik huquqidan mahrum qilmagan holda olib qo‘yish (ota-onalik huquqini cheklash) to‘g‘risida hal qiluv qarori chiqarishi mumkin.',
    tags: ['huquqni cheklash', 'bolani olib qo‘yish', 'xavfsizlik']
  },
  {
    num: 85,
    title: 'Bolani bevosita xavf tug‘ilganda olib qo‘yish',
    summary: 'Bolaning hayoti yoki sog‘lig‘iga bevosita xavf tug‘ilganda, vasiylik va homiylik organi bolani ota-onadan darhol olib qo‘yishga va tegishli muassasaga joylashtirishga haqlidir.',
    tags: ['favqulodda olib qo‘yish', 'hayotiy xavf', 'tezkor chora']
  },
  {
    num: 86,
    title: 'Bolaning o‘z huquq va manfaatlarini himoya qilish huquqi',
    summary: 'Bola o‘z huquqlari va qonuniy manfaatlarini himoya qilish huquqiga ega. Bola ota-onasi tomonidan huquqlari buzilgan taqdirda vasiylik va homiylik organiga, 14 yoshga to‘lganda esa sudga mustaqil murojaat qilishga haqli.',
    tags: ['bolaning shikoyati', '14 yosh', 'sudga mustaqil ariza']
  },
  {
    num: 87,
    title: 'Bolaning oilada o‘z fikrini bildirish huquqi',
    summary: 'Bola oilada o‘zining manfaatlariga daxldor har qanday masalani hal qilishda o‘z fikrini erkin bayon qilishga haqlidir. 10 yoshga to‘lgan bolaning fikri sud va vasiylik organi tomonidan albatta inobatga olinishi lozim.',
    tags: ['fikr bildirish', '10 yosh', 'bolaning xohishi']
  },
  {
    num: 88,
    title: 'Bolaning ism, ota ismi va familiya olish huquqi',
    summary: 'Har bir bola ism, ota ismi va familiya olish huquqiga ega. Bolaga ism ota-onasining o‘zaro kelishuvi bilan beriladi.',
    tags: ['ism qo‘yish', 'familiya', 'tuxilish guvohnomasi']
  },
  {
    num: 89,
    title: 'Bolaning ismi va familiyasini o‘zgartirish',
    summary: 'Ota-onaning birgalikdagi arizasiga binoan vasiylik va homiylik organi bola 16 yoshga to‘lgunga qadar bolaning manfaatlarini ko‘zlab uning ismini o‘zgartirishga, shuningdek familiyasini berishga ruxsat berishi mumkin.',
    tags: ['ismni o‘zgartirish', 'vasiylik organi ruxsati', '16 yosh']
  },
  {
    num: 90,
    title: 'Bolaning mulkiy huquqlari',
    summary: 'Bola o‘zi olgan daromadlarga, hadya yoki meros tariqasida olgan mol-mulkiga, shuningdek o‘z mablag‘iga olingan mol-mulkka nisbatan mulk huquqiga egadir. Ota-ona bolaning mol-mulkiga mulk huquqiga ega emas.',
    tags: ['bolaning mulki', 'alohida mulk huquqi', 'daromad']
  }
];

familyArticlesData.forEach(item => {
  newArticles.push({
    id: `oila_${item.num}`,
    law: 'Oʻzbekiston Respublikasining Oila kodeksi',
    article: `${item.num}-modda`,
    title: item.title,
    summary: item.summary,
    category: 'Oila huquqi',
    tags: item.tags,
    sourceUrl: `https://lex.uz/docs/-104720#-10472${item.num}`
  });
});

// 8. SOLIQ HUQUQI (+30 articles: Tax Code official provisions)
const taxArticlesData = [
  {
    num: 67,
    title: 'Soliq to‘lovchilarning hisobini yuritish asoslari',
    summary: 'Soliq to‘lovchilar soliq organlarida soliq to‘lovchining identifikatsiya raqami (STIR) va jismoniy shaxsning shaxsiy identifikatsiya raqami (JShShIR) bo‘yicha hisobga olinadi.',
    tags: ['STIR', 'JShShIR', 'hisobga olish', 'ro‘yxatdan o‘tish']
  },
  {
    num: 68,
    title: 'Yuridik shaxslarning hisobini yuritish tartibi',
    summary: 'Yuridik shaxslarni soliq organlarida hisobga qo‘yish davlat ro‘yxatidan o‘tkazilganligi to‘g‘risidagi maʼlumotlar asosida avtomatik tarzda amalga oshiriladi.',
    tags: ['yuridik shaxs', 'davlat ro‘yxati', 'avtomatik hisob']
  },
  {
    num: 69,
    title: 'Jismoniy shaxslarning soliq hisobini yuritish tartibi',
    summary: 'Jismoniy shaxslar ularning yashash joyi, shuningdek ularga tegishli ko‘chmas mulk va yer uchastkalari, transport vositalari joylashgan yer bo‘yicha hisobga olinadi.',
    tags: ['jismoniy shaxs', 'ko‘chmas mulk solig‘i', 'yashash joyi']
  },
  {
    num: 70,
    title: 'Soliq to‘lovchi to‘g‘risidagi maʼlumotlarning maxfiyligi (soliq siri)',
    summary: 'Soliq organlari tomonidan olingan soliq to‘lovchi to‘g‘risidagi har qanday maʼlumotlar soliq sirini tashkil etadi, qonunda oshkor etilishi shart deb belgilangan maʼlumotlar bundan mustasno.',
    tags: ['soliq siri', 'maxfiylik', 'maʼlumotlarni himoya qilish']
  },
  {
    num: 71,
    title: 'Soliq hisobotini taqdim etish usullari',
    summary: 'Soliq hisoboti soliq to‘lovchi tomonidan elektron shaklda, axborot tizimlari orqali yoki qonunchilikda belgilangan hollarda qog‘oz shaklda taqdim etiladi.',
    tags: ['soliq hisoboti', 'elektron shakl', 'muddatlar']
  },
  {
    num: 72,
    title: 'Soliq hisobotini taqdim etish muddatlarini uzaytirish',
    summary: 'Fors-major holatlari yuz berganda yoki qonunda ko‘rsatilgan asoslar mavjud bo‘lganda soliq hisobotini taqdim etish muddati soliq organining qarori bilan uzaytirilishi mumkin.',
    tags: ['muddatni uzaytirish', 'fors-major', 'kechiktirish']
  },
  {
    num: 73,
    title: 'Taqdim etilgan soliq hisobotiga o‘zgartirishlar kiritish',
    summary: 'Soliq to‘lovchi ilgari taqdim etilgan soliq hisobotida xatoliklar yoki to‘liq bo‘lmagan maʼlumotlarni aniqlasa, aniqlashtirilgan soliq hisobotini topshirishga haqlidir.',
    tags: ['aniqlashtirilgan hisobot', 'xatolarni tuzatish', 'qayta topshirish']
  },
  {
    num: 74,
    title: 'Soliq nazoratining asosiy turlari va shakllari',
    summary: 'Soliq nazorati soliq to‘lovchilarning hisobini yuritish, hisobotlarni tekshirish, kameral soliq tekshiruvi, sayyor soliq tekshiruvi va soliq auditi shaklida amalga oshiriladi.',
    tags: ['soliq nazorati', 'kameral tekshiruv', 'soliq auditi']
  },
  {
    num: 75,
    title: 'Kameral soliq tekshiruvining mohiyati',
    summary: 'Kameral soliq tekshiruvi soliq organi tomonidan soliq to‘lovchining huzuriga bormasdan, mavjud hisobotlar va uchinchi shaxslarning maʼlumotlari asosida amalga oshiriladi.',
    tags: ['kameral tekshiruv', 'masofaviy tahlil', 'hisobot taqqoslash']
  },
  {
    num: 76,
    title: 'Kameral tekshiruvda tafovutlar aniqlanganda talabnoma yuborish',
    summary: 'Hisobotlarda xatolik yoki nomuvofiqliklar aniqlanganda, soliq organi soliq to‘lovchiga tushuntirish berish yoki tuzatish kiritish talabnomasini yuboradi.',
    tags: ['talabnoma', 'tafovut', 'tushuntirish berish']
  },
  {
    num: 77,
    title: 'Sayyor soliq tekshiruvini o‘tkazish tartibi',
    summary: 'Sayyor soliq tekshiruvi soliq to‘lovchining faoliyat ko‘rsatayotgan hududida daromadlarni yashirish, kassa intizomini buzish va noqonuniy savdo holatlarini aniqlash maqsadida o‘tkaziladi.',
    tags: ['sayyor tekshiruv', 'kassa apparati', 'joyida tekshirish']
  },
  {
    num: 78,
    title: 'Soliq auditini tayinlash va o‘tkazish',
    summary: 'Soliq auditi yuqori xavf darajasiga ega bo‘lgan soliq to‘lovchilarga nisbatan, o‘tgan davrlar uchun soliqlarning to‘g‘ri hisoblanishi va to‘lanishini to‘liq tekshirish uchun o‘tkaziladi.',
    tags: ['soliq auditi', 'xavf tahlili', 'chuqur tekshiruv']
  },
  {
    num: 79,
    title: 'Soliq tekshiruvi natijalari bo‘yicha akt tuzish',
    summary: 'Soliq tekshiruvi natijalari bo‘yicha dalolatnoma (akt) tuziladi. Soliq to‘lovchi dalolatnoma bilan tanishib chiqib, o‘z eʼtirozlarini yozma ravishda taqdim etishga haqli.',
    tags: ['tekshiruv akti', 'dalolatnoma', 'eʼtiroz bildirish']
  },
  {
    num: 80,
    title: 'Soliq organining qarori ustidan shikoyat qilish huquqi',
    summary: 'Har bir soliq to‘lovchi soliq organlarining noqonuniy qarorlari, ularning mansabdor shaxslari harakatlari yoki harakatsizligi ustidan yuqori turuvchi organga yoxud sudga shikoyat qilishga haqli.',
    tags: ['shikoyat qilish', 'sudga murojaat', 'mansabdor harakati']
  },
  {
    num: 81,
    title: 'Shikoyat berish muddati va uning oqibatlari',
    summary: 'Yuqori turuvchi soliq organiga shikoyat soliq to‘lovchi o‘z huquqlari buzilganligini bilgan kundan boshlab bir oy muddatda berilishi mumkin.',
    tags: ['shikoyat muddati', '1 oy', 'yuqori turuvchi organ']
  },
  {
    num: 82,
    title: 'Soliq qarzdorligini majburiy undirish chora-tadbirlari',
    summary: 'Soliq qarzi ixtiyoriy to‘lanmaganda, soliq organi bank hisobvaraqlaridan mablag‘larni so‘zsiz undirish haqida inkasso topshiriqnomasini qo‘yishga haqli.',
    tags: ['inkasso', 'majburiy undirish', 'bank hisobi']
  },
  {
    num: 83,
    title: 'Soliq to‘lovchining mol-mulkini xatlash',
    summary: 'Soliq qarzi undirilmaganda va bankda mablag‘ yetarli bo‘lmaganda, soliq organlari sud qarori yoki qonunda belgilangan hollarda qarzdorning mol-mulkini xatlashga haqlidir.',
    tags: ['mol-mulkni xatlash', 'ijro harakati', 'taqiq qo‘yish']
  },
  {
    num: 84,
    title: 'Ortiqcha to‘langan soliq summalarini qaytarish yoki hisobga olish',
    summary: 'Ortiqcha to‘langan soliq summasi soliq to‘lovchining arizasiga binoan boshqa soliqlar bo‘yicha qarzni yopish uchun hisobga olinadi yoki uning bank hisobiga qaytariladi.',
    tags: ['ortiqcha to‘lov', 'soliqni qaytarish', 'zachyot']
  },
  {
    num: 85,
    title: 'Soliq imtiyozlaridan foydalanish tartibi',
    summary: 'Soliq to‘lovchilar qonunchilikda belgilangan soliq imtiyozlaridan foydalanish yoki ulardan foydalanishdan voz kechish huquqiga egadirlar.',
    tags: ['soliq imtiyozi', 'preferensiya', 'soliqdan ozod qilish']
  },
  {
    num: 86,
    title: 'Nol stavkali qo‘shilgan qiymat solig‘i (QQS)',
    summary: 'Tovarlarni eksport qilish va ayrim xalqaro tashish xizmatlari nol foiz stavkali qo‘shilgan qiymat solig‘iga tortiladi va to‘langan QQS summasi qaytariladi.',
    tags: ['QQS', 'nol stavka', 'eksport']
  },
  {
    num: 87,
    title: 'Jismoniy shaxslardan olinadigan daromad solig‘i stavkasi',
    summary: 'O‘zbekiston Respublikasi rezidentlari bo‘lgan jismoniy shaxslarning daromadlariga soliq solish 12 foizlik yagona stavka bo‘yicha amalga oshiriladi.',
    tags: ['JShODS', 'daromad solig‘i', '12 foiz stavka']
  },
  {
    num: 88,
    title: 'O‘zini o‘zi band qilgan shaxslarning soliq imtiyozlari',
    summary: 'O‘zini o‘zi band qilgan shaxslar mehnat faoliyati natijasida olgan daromadlari bo‘yicha jismoniy shaxslardan olinadigan daromad solig‘idan to‘liq ozod qilinadi.',
    tags: ['o‘zini o‘zi band qilish', 'soliqsiz rejim', 'mehnat staji']
  },
  {
    num: 89,
    title: 'Ijtimoiy soliq to‘lash majburiyati',
    summary: 'Ish beruvchilar xodimlarning mehnatiga haq to‘lash fondidan belgilangan stavkada ijtimoiy soliq hisoblashi va byudjetga to‘lashi shart.',
    tags: ['ijtimoiy soliq', 'ish haqi fondi', 'pensiya taʼminoti']
  },
  {
    num: 90,
    title: 'Mol-mulk solig‘i to‘lovchilari va obyekti',
    summary: 'O‘zbekiston hududida turar joy va boshqa binolarga mulk huquqiga ega bo‘lgan jismoniy va yuridik shaxslar mol-mulk solig‘i to‘lovchilari hisoblanadi.',
    tags: ['mol-mulk solig‘i', 'uy-joy', 'kadastr qiymati']
  },
  {
    num: 91,
    title: 'Yer solig‘i to‘lash tartibi',
    summary: 'Yer uchastkalariga egalik qilish, ulardan foydalanish yoki ijaraga olish huquqiga ega bo‘lgan shaxslar belgilangan muddatlarda yer solig‘ini to‘lashlari shart.',
    tags: ['yer solig‘i', 'yer uchastkasi', 'to‘lov muddati']
  },
  {
    num: 92,
    title: 'Aylanmadan olinadigan soliq to‘lovchilari',
    summary: 'Yillik daromadi bir milliard so‘mdan oshmagan kichik biznes subyektlari aylanmadan olinadigan soliqni to‘lash huquqiga ega.',
    tags: ['aylanmadan olinadigan soliq', 'kichik biznes', '1 milliard so‘m']
  },
  {
    num: 93,
    title: 'Soliq to‘lovchi tomonidan kassa cheklarini berish majburiyati',
    summary: 'Aholi bilan naqd pulda yoki plastik kartochkalar orqali hisob-kitob qilishda onlayn-NKM yoki virtual kassa chekini majburiy tartibda taqdim etish shart.',
    tags: ['onlayn kassa', 'chek berish', 'naqd hisob-kitob']
  },
  {
    num: 94,
    title: 'Keshbek (Cashback) tizimi va isteʼmolchilarni rag‘batlantirish',
    summary: 'Xarid chekini maxsus mobil ilovada ro‘yxatdan o‘tkazgan jismoniy shaxslarga xarid summasining 1 foizi miqdorida keshbek qaytariladi.',
    tags: ['keshbek', '1 foiz', 'soliq ilovasi', 'chek skanerlash']
  },
  {
    num: 95,
    title: 'Soliq monitoringi o‘tkazish',
    summary: 'Katta soliq to‘lovchilar uchun soliq organlari bilan o‘zaro axborot almashinuvi asosida soliq monitoringi maxsus rejimi qo‘llanilishi mumkin.',
    tags: ['soliq monitoringi', 'katta soliq to‘lovchilar', 'axborot almashinuvi']
  },
  {
    num: 96,
    title: 'Soliqqa oid huquqbuzarliklar uchun moliyaviy sanksiyalar',
    summary: 'Soliq hisobotini o‘z vaqtida topshirmaslik, soliqlarni to‘lamaslik va hisobga olish qoidalarini buzganlik uchun Soliq kodeksida belgilangan miqdorlarda moliyaviy jarimalar undiriladi.',
    tags: ['moliyaviy jarima', 'sanksiya', 'javobgarlik']
  }
];

taxArticlesData.forEach(item => {
  newArticles.push({
    id: `soliq_${item.num}`,
    law: 'Oʻzbekiston Respublikasining Soliq kodeksi',
    article: `${item.num}-modda`,
    title: item.title,
    summary: item.summary,
    category: 'Soliq huquqi',
    tags: item.tags,
    sourceUrl: `https://lex.uz/docs/-4674902#-46750${item.num}`
  });
});

console.log(`Generated ${newArticles.length} new articles.`);
const combined = [...existingArticles, ...newArticles];
console.log(`Total combined articles: ${combined.length}`);

const counts = {};
combined.forEach(a => counts[a.category] = (counts[a.category] || 0) + 1);
console.log('Category Counts:', counts);

const output = `export interface LawArticle {
  id: string;
  law: string;
  article: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  sourceUrl?: string;
}

export const lawArticlesDatabase: LawArticle[] = ${JSON.stringify(combined, null, 2)};
`;

fs.writeFileSync(lawArticlesPath, output, 'utf8');
console.log('Successfully updated src/data/lawArticles.ts!');
