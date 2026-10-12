export interface FAQItem {
  id: string;
  question: string;
  questionEn?: string;
  answer: string;
  answerEn?: string;
  category?: string;
  categoryEn?: string;
}

export const faqsData: FAQItem[] = [
  {
    id: 'can-be-lawyer',
    question: 'AI Advokat mening advokatim bo‘la oladimi?',
    questionEn: 'Can AI Advokat act as my personal licensed lawyer?',
    answer: `Yo‘q. AI Advokat inson advokat emas va sizning nomingizdan sudda, davlat organlarida yoki boshqa tashkilotlarda vakillik qila olmaydi. AI Advokat O‘zbekiston qonunchiligi asosida huquqiy ma’lumot, tushuntirish va hujjat loyihalarini tayyorlashda yordam beruvchi sun’iy intellekt yordamchisidir.

AI Advokat:
• huquqiy savollarga javob berishi;
• qonunchilikdagi tegishli normalarni tushuntirishi;
• vaziyatni huquqiy nuqtai nazardan tahlil qilishga yordam berishi;
• ariza, shikoyat, da’vo va boshqa hujjatlarning loyihalarini tayyorlashi;
• kerakli huquqiy yo‘nalishni aniqlashga yordam berishi mumkin.

Ammo AI Advokat advokatning o‘rnini bosmaydi, sudda yoki boshqa organlarda sizning vakilingiz sifatida qatnasha olmaydi va advokatlik xizmatini ko‘rsatmaydi.

Agar masala murakkab bo‘lsa yoki sudda/himoyada professional vakillik zarur bo‘lsa, malakali advokatga murojaat qilish tavsiya etiladi.`,
    answerEn: `No. AI Advokat is an artificial intelligence assistant, not a licensed attorney, and cannot formally represent you in court, before state agencies, or in administrative proceedings. AI Advokat provides legal information, statutory explanations, and draft document templates based on the laws of the Republic of Uzbekistan.

AI Advokat can:
• Answer legal questions with statutory references;
• Explain complex regulatory and statutory clauses in plain terms;
• Analyze legal situations from a statutory perspective;
• Draft applications, complaints, claims, and agreement templates;
• Guide you toward the proper administrative and legal procedures.

However, AI Advokat does not replace formal legal counsel or provide advocate licensing representation. For court hearings and formal representation, consulting a licensed lawyer is recommended.`,
    category: 'Xizmat maqomi va vakolatlar',
    categoryEn: 'Service Status & Jurisdiction',
  },
  {
    id: 'document-drafting',
    question: 'AI Advokat huquqiy hujjat tayyorlay oladimi?',
    questionEn: 'Can AI Advokat prepare legal documents and contracts?',
    answer:
      'Ha. AI Advokat ariza, shikoyat, talabnoma, daʼvo arizasi va turli shartnomalarning rasmiy andozalariga mos loyihalarini tayyorlab bera oladi. Foydalanuvchi hujjatni rasmiylashtirishdan oldin o‘z shaxsiy maʼlumotlarini kiritib, vaziyatiga mosligini tekshirib olishi lozim.',
    answerEn:
      'Yes. AI Advokat can draft official applications, complaints, formal demand notices, lawsuit petitions, and diverse contracts adhering to standard legal formats. Users should review and insert their specific personal details prior to formal submission.',
    category: 'Hujjatlar va shablonlar',
    categoryEn: 'Documents & Templates',
  },
  {
    id: 'legal-sources',
    question: 'AI Advokat qaysi qonunlarga asoslanadi?',
    questionEn: 'Which legal codes and sources does AI Advokat rely on?',
    answer:
      'AI Advokat O‘zbekiston Respublikasining rasmiy va amaldagi qonunchilik bazasi — Konstitutsiya, Mehnat kodeksi, Fuqarolik kodeksi, Oila kodeksi, Soliq kodeksi, Jinoyat kodeksi, Maʼmuriy javobgarlik to‘g‘risidagi kodeks hamda Lex.uz rasmiy manbalariga asoslanadi.',
    answerEn:
      'AI Advokat is trained and grounded in the official legislation of the Republic of Uzbekistan — the Constitution, Labor Code, Civil Code, Family Code, Tax Code, Criminal Code, Code of Administrative Responsibility, and the national Lex.uz database.',
    category: 'Qonunchilik bazasi',
    categoryEn: 'Legal Framework',
  },
  {
    id: 'service-access',
    question: 'AI Advokatdan qanday foydalanish mumkin?',
    questionEn: 'How can I access and use AI Advokat services?',
    answer:
      'AI Advokat xizmatlaridan har kuni foydalanishingiz mumkin. Sunʼiy intellekt yordamida savollaringizga javob olishingiz, qonunlarni qidirishingiz va hujjat loyihalarini yaratishingiz mumkin. Loyihamizni qoʻllab-quvvatlashni istasangiz, ixtiyoriy ravishda kofe ulashishingiz mumkin.',
    answerEn:
      'You can use AI Advokat daily. Consult the AI assistant for quick answers, search legislation, and generate document drafts in seconds. If you enjoy our project, you can voluntarily support the developer by buying a coffee.',
    category: 'Foydalanish qoidalari',
    categoryEn: 'Usage Guidelines',
  },
  {
    id: 'accuracy',
    question: 'AI Advokat noto‘g‘ri javob berishi mumkinmi?',
    questionEn: 'Can AI Advokat provide inaccurate information?',
    answer:
      'AI Advokat tasdiqlangan qonun moddalariga tayanadi va noaniq maʼlumotlarning oldini oluvchi xavfsizlik tizimiga ega. Biroq har bir huquqiy nizoning o‘ziga xos dalillari va tafsilotlari bo‘lgani sababli, foydalanuvchiga vaziyatni to‘liq bayon qilish va kerak bo‘lsa professional advokatga murojaat qilish tavsiya etiladi.',
    answerEn:
      'AI Advokat references verified statutory articles and uses built-in verification guardrails against hallucinations. However, because each legal case involves specific factual nuances, providing detailed facts and consulting a human attorney when appropriate is advised.',
    category: 'Qonunchilik bazasi',
    categoryEn: 'Legal Framework',
  },
  {
    id: 'how-search-works',
    question: 'Qonun Qidiruvi qanday ishlaydi?',
    questionEn: 'How does the Law Search Engine function?',
    answer:
      'Qonun Qidiruvi O‘zbekiston Respublikasining huquqiy yo‘nalishlari bo‘yicha moddalar, qonun nomlari, kalit so‘zlar va to‘liq matn bo‘yicha ko‘p bosqichli intellektual qidiruvni amalga oshiradi hamda moddaning to‘liq matnini o‘qish imkonini beradi.',
    answerEn:
      'The Law Search Engine performs multi-tier intelligent search across statutes, code names, keywords, and full statutory texts in Uzbekistan law, enabling you to inspect complete official articles.',
    category: 'Qidiruv tizimi',
    categoryEn: 'Search Engine',
  },
];
