export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export const faqsData: FAQItem[] = [
  {
    id: 'can-be-lawyer',
    question: 'AIAdvokat mening advokatim bo‘la oladimi?',
    answer: `Yo‘q. AIAdvokat inson advokat emas va sizning nomingizdan sudda, davlat organlarida yoki boshqa tashkilotlarda vakillik qila olmaydi. AIAdvokat O‘zbekiston qonunchiligi asosida huquqiy ma’lumot, tushuntirish va hujjat loyihalarini tayyorlashda yordam beruvchi sun’iy intellekt yordamchisidir.

AIAdvokat:
• huquqiy savollarga javob berishi;
• qonunchilikdagi tegishli normalarni tushuntirishi;
• vaziyatni huquqiy nuqtai nazardan tahlil qilishga yordam berishi;
• ariza, shikoyat, da’vo va boshqa hujjatlarning loyihalarini tayyorlashi;
• kerakli huquqiy yo‘nalishni aniqlashga yordam berishi mumkin.

Ammo AIAdvokat advokatning o‘rnini bosmaydi, sudda yoki boshqa organlarda sizning vakilingiz sifatida qatnasha olmaydi va advokatlik xizmatini ko‘rsatmaydi.

Agar masala murakkab bo‘lsa yoki sudda/himoyada professional vakillik zarur bo‘lsa, malakali advokatga murojaat qilish tavsiya etiladi.`,
    category: 'Xizmat maqomi va vakolatlar',
  },
  {
    id: 'document-drafting',
    question: 'AIAdvokat huquqiy hujjat tayyorlay oladimi?',
    answer:
      'Ha. AIAdvokat ariza, shikoyat, talabnoma, daʼvo arizasi va turli shartnomalarning rasmiy andozalariga mos loyihalarini tayyorlab bera oladi. Foydalanuvchi hujjatni rasmiylashtirishdan oldin o‘z shaxsiy maʼlumotlarini kiritib, vaziyatiga mosligini tekshirib olishi lozim.',
    category: 'Hujjatlar va shablonlar',
  },
  {
    id: 'legal-sources',
    question: 'AIAdvokat qaysi qonunlarga asoslanadi?',
    answer:
      'AIAdvokat O‘zbekiston Respublikasining rasmiy va amaldagi qonunchilik bazasi — Konstitutsiya, Mehnat kodeksi, Fuqarolik kodeksi, Oila kodeksi, Soliq kodeksi, Jinoyat kodeksi, Maʼmuriy javobgarlik to‘g‘risidagi kodeks hamda Lex.uz rasmiy manbalariga asoslanadi.',
    category: 'Qonunchilik bazasi',
  },
  {
    id: 'service-access',
    question: 'AIAdvokatdan qanday foydalanish mumkin?',
    answer:
      'AIAdvokat xizmatlaridan har kuni foydalanishingiz mumkin. Sunʼiy intellekt yordamida savollaringizga javob olishingiz, qonunlarni qidirishingiz va hujjat loyihalarini yaratishingiz mumkin. Loyihamizni qoʻllab-quvvatlashni istasangiz, ixtiyoriy ravishda kofe ulashishingiz mumkin.',
    category: 'Foydalanish qoidalari',
  },
  {
    id: 'accuracy',
    question: 'AIAdvokat noto‘g‘ri javob berishi mumkinmi?',
    answer:
      'AIAdvokat tasdiqlangan qonun moddalariga tayanadi va noaniq maʼlumotlarning oldini oluvchi xavfsizlik tizimiga ega. Biroq har bir huquqiy nizoning o‘ziga xos dalillari va tafsilotlari bo‘lgani sababli, foydalanuvchiga vaziyatni to‘liq bayon qilish va kerak bo‘lsa professional advokatga murojaat qilish tavsiya etiladi.',
    category: 'Qonunchilik bazasi',
  },
  {
    id: 'how-search-works',
    question: 'Qonun Qidiruvi qanday ishlaydi?',
    answer:
      'Qonun Qidiruvi O‘zbekiston Respublikasining huquqiy yo‘nalishlari bo‘yicha moddalar, qonun nomlari, kalit so‘zlar va to‘liq matn bo‘yicha ko‘p bosqichli intellektual qidiruvni amalga oshiradi hamda moddaning to‘liq matnini o‘qish imkonini beradi.',
    category: 'Qidiruv tizimi',
  },
];
